const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var session = require('express-session');

app.use(session({
    secret: 'keyboardkitteh',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))

const flash = require('express-flash');
app.use(flash());
app.use(bodyParser.urlencoded({ extended: true }));

var path = require('path');

app.use(express.static(path.join(__dirname, './static')));

app.set('views', path.join(__dirname, './views'));

app.set('view engine', 'ejs');

mongoose.connect('mongodb://localhost/mongo-dashboard');
var UserSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 2 },
    quote: { type: String, required: true, minlength: 2 },
    created_at: { type: Date }

});
mongoose.model('Bear', UserSchema);
var Bear = mongoose.model('Bear');

mongoose.Promise = global.Promise;

// Render root route
app.get('/', function (req, res) {
    Bear.find({}, function (err, bears) {
        // User.find({}).sort({'creadted_at': -1}).exec(function (err, users) {
        // User.find({}, null, {sort: {date: -1}}, function(err, users) {
        // User.find({}, null, {sort: '-date'}, function(err, users) {

        // console.log(Bear.find()._addSpecial("$orderby", { created_at: -1 }))
        if (err) {
            console.log(err)
            res.redirect('/')

        } else {
            var allUsers = [];
            for (i = 0; i < bears.length; i++) {
                allUsers.push(bears[i]);
            }
        }
        console.log("All Users: ", allUsers)
        res.render('index', { bears: allUsers });
        res.end()
        console.log("-------------")
    })

})
// Render edit ejs page route
app.get('/show/:id', function (req, res, next) {
    console.log(req.params.id)
    // Bear.find({_id: req.params.id}, function(err, current){
    Bear.findById(req.params.id, function(err, current) {

        if(err){
            console.log(err)
            res.redirect('/')
        }
        else{

            console.log(current.name)
        
            res.render('edit', {bear: current})
        }
    })
})
app.post('/edit/:id', function(req, res){
    Bear.findById(req.params.id, function(err, current){
        if(err){
            console.log(err)
            for (var key in err.errors) {
                req.flash('registration', err.errors[key].message);
            }
            res.redirect('/edit/'+req.params.id)
        }else{
            current.name = req.body.name;
            current.quote = req.body.quote;
            current.save();
            res.redirect('/')
        }
    })
})

app.get('/delete/:id', function(req, res){
    Bear.findById(req.params.id, function(err, current){
        if(err){
            console.log(err)
            for (var key in err.errors) {
                req.flash('registration', err.errors[key].message);
            }
            res.redirect('/edit/'+req.params.id)
        }else{
            current.remove({_id: req.params.id}, function(err){
                if(err){
                    console.log(err)
                }else{
                    console.log("Bear successfully deleted")
                }
            })
        }
    })
    res.redirect('/')
})
// post route to create bears
app.post('/addBear', function (req, res) {
    console.log("Post Date" + req.body)

    var bear = new Bear({ name: req.body.name, quote: req.body.quote, created_at: new Date() })
    bear.save(function (err) {
        if (err) {
            console.log('something went wrong', err);
            for (var key in err.errors) {
                req.flash('registration', err.errors[key].message);
            }
            res.redirect('/');
        } else { // else console.log that we did well and then redirect to the root route
            console.log('successfully added a user!');
            res.redirect('/');
        }
    })

});//end post route for addbear
app.listen(8000, function () {
    console.log('Listening on port: 8000')
});