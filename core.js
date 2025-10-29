// Modules
const express = require("express");
const path = require("path");
const formidable = require("formidable");
const fs = require("fs");
const crypto = require("crypto");
const bodyParser = require("body-parser");
const cors = require("cors");

require("dotenv").config(".env");

// Instances
const app = express();

// Middleware
app.use("/{*any}", cors());

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", req.get("Origin") || "*");
	res.header("Access-Control-Allow-Credentials", "true");
	res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
	res.header("Access-Control-Expose-Headers", "Content-Length");
	res.header("Access-Control-Allow-Headers", "Accept, Authorization, Content-Type, X-Requested-With, Range");

	if (req.method === "OPTIONS") {
		return res.send(200);
	}

	return next();
});

app.use(express.static(path.join(__dirname, "dist")));
app.use(express.static(path.join(__dirname, "media")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get("/{*any}", (req, res, next) => {
	console.log(`${req.ip} -> .${req.url}`);
	console.log(req.get("host"))
	
	next();
});

app.post("/upload", function(req, res) {
	console.log("" + JSON.stringify(req.headers));	

	if (req.headers.key == null || req.headers.key != process.env.API_KEY)
		return res.end("not authed");

	var form = new formidable.IncomingForm();
	var name = null;
	var extension = null;

	form.uploadDir = path.join(__dirname, "media");
	
	form.on("file", function(field, file) {
	    name = crypto.randomBytes(24).toString("hex");
	    extension = file.originalFilename.substr(file.originalFilename.indexOf("."), file.originalFilename.length);

	    fs.renameSync(file.filepath, path.join(form.uploadDir, name + extension));
  	});

  	form.on("end", function() {
	    res.end("http://yoranus.com/" + name + extension);
	});

  	form.parse(req);
});

// Listen
app.listen(80, () => {
	console.log("listening on :80");
});