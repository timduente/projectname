/*
XMLHttpRequest:
https://en.wikipedia.org/wiki/XMLHttpRequest

CouchDB:
http://guide.couchdb.org/draft/tour.html
https://wiki.apache.org/couchdb/HTTP_Document_API
http://docs.couchdb.org/en/1.6.1/config/intro.html
http://docs.couchdb.org/en/1.6.1/config/http.html#cross-origin-resource-sharing
http://docs.couchdb.org/en/1.6.1/intro/curl.html

HTML(5):
http://www.w3schools.com/html/default.asp
http://www.w3schools.com/jsref/default.asp

CouchDB configuration (Mac OS X):
~/Library/Application Support/CouchDB/etc/couchdb/local.ini
/Applications/Apache CouchDB.app/Contents/Resources/couchdbx-core/etc/couchdb/local.ini
CouchDB configuration (Windows):
C:\Program Files (x86)\Apache Software Foundation\CouchDB\etc\couchdb\local.ini
start/stop/restart: Control Panel --> Services --> Apache CouchDB

[httpd]
enable_cors = true
bind_address = 0.0.0.0  <-- for access from other devices, 127.0.0.1: local device only
...

[cors]
origins = *

*/

var request = new XMLHttpRequest();

request.onreadystatechange = function() {
	// console.log("onreadystatechange: " + request.readyState + ", " +  request.status);
	// console.log(request.responseText);
	if (request.readyState == 4) {
		if (request.status == 200) {
			var response = JSON.parse(request.responseText);
			handlers[response._id](response);
		}
		if (request.status == 404) {
			var json = JSON.parse(request.responseText);
			if (json.reason === "no_db_file") {
				createDB();
			} else {
				var url = request.responseURL
				// console.log(typeof(url));
				var i = url.lastIndexOf("/", url.length - 1);
				var name = url.substring(i + 1);
				handlers[name]({ "_id" : name });
			}
		}
	}
};

function getCheckedRadio(name) {
	var options = document.getElementsByName(name);
	for (i = 0; i < options.length; i++) {
		var option = options[i];
		if (option.checked) {
			return option.value;
		}
	}
	return null;
}

function set(name) {
	request.open("GET", dburl + name, false);
	request.send();
}

function put(response, message) {
	request.open("PUT", dburl + response._id, false);
	request.setRequestHeader("Content-type", "application/json");
	message["_id"] = response._id;
	if (response._rev) {
		message["_rev"] = response._rev;
	}
	var s = JSON.stringify(message);
	// console.log("put: " + s);
	request.send(s);
}

function createDB() {
	request.open("PUT", dburl, false);
	request.send();
}

///////////////////////////////////////////////////////////////////////////////
// your code below

var dbname = "hci1";
var dburl = "http://127.0.0.1:5984/" + dbname + "/";
var handlers = {
	"animal" : setAnimal,
	"counter" : stepCounter,
	"showCounter" : showCounter,
	"mytext" : mytext,
	// add further handlers here
};

function setAnimal(response) {
	var src = getCheckedRadio("animalImage");
	var width = parseInt(document.getElementById("animalWidth").value);
	// console.log(src);
	// console.log(width);
	put(response, {"src" : src, "width" : width});
}

function stepCounter(response) {
	var value = response.value ? response.value : 0;
	// console.log(value);
	put(response, {"value" : value + 1});
}

function showCounter(response) {
	var checked = document.getElementById("showCounter").checked;
	// console.log(checked);
	put(response, {"checked" : checked});
}

function mytext(response) {
	var value = document.getElementById("mytext").value;
	// console.log(value);
	put(response, {"value" : value});
}


