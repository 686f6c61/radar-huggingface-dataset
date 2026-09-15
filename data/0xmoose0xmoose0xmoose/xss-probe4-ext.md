# 0xmoose0xmoose0xmoose/xss-probe4-ext

## Resumen

El repositorio `0xmoose0xmoose0xmoose/xss-probe4-ext`, titulado "Hub sanitizer extended battery", no es un modelo de inteligencia artificial. Se trata de un artefacto de prueba publicado en HuggingFace que contiene una bateria de 57 casos (etiquetados de H1 a H57) de cargas utiles HTML y JavaScript disenadas para comprobar el comportamiento del saneador de Markdown que la plataforma aplica a las model cards. No incluye pesos, configuracion de arquitectura ni tokenizador.

El contenido consiste en fragmentos de HTML con vectores clasicos de XSS: esquemas `javascript:`, `vbscript:`, `data:` y `blob:`, atributos de eventos ofuscados (`onerror`, `onload`, `ontoggle`, `onbegin`), etiquetas heredadas (`xmp`, `plaintext`, `listing`, `noembed`, `noframes`, `marquee`), mXSS mediante comentarios anidados, `iframe srcdoc`, `foreignObject` en SVG y propiedades CSS con `expression()`, `behavior:url()` o `url(javascript:)`. El objetivo es verificar si el filtro de la plataforma neutraliza cada vector o si alguno se ejecuta o se representa de forma insegura.

Su relevancia es exclusivamente de seguridad y de investigacion sobre saneado de contenido generado por usuarios. No es desplegable, no se puede invocar mediante inferencia y no tiene utilidad como componente de software en produccion. Creado el 15 de septiembre de 2026, acumula cero descargas y cero likes, y su unico tag es `region:us`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo; es un corpus de cadenas HTML/JS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el contenido es marcado HTML y JavaScript, no lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | no disponible (no hay pesos; el contenido es texto plano en el README) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es un documento Markdown cuyo cuerpo enumera 57 ejemplos de marcado potencialmente peligroso, cada uno precedido de una etiqueta identificativa (H1 a H57) y de una descripcion corta del vector probado, por ejemplo "H1 js scheme mixed case", "H40 nested comment mXSS" o "H54 style background data svg". La organizacion es lineal y acumulativa, pensada para que un revisor humano o un test automatizado recorra la lista y determine que casos sobreviven al saneado.

No hay dataset de entrenamiento, ni fases de RLHF, DPO o ajuste por instrucciones, ni innovaciones tecnicas de modelado. La unica "innovacion" implicita es la cobertura de vectores: combina tecnicas de evasión de filtros clasicas (entidades numericas como `&#x09;`, `&colon;` o `&#0;` insertadas dentro del esquema de URL) con tecnicas modernas de mutacion (mXSS por comentarios anidados, `annotation-xml` de MathML con `encoding="text/html"`, `srcdoc` en iframes y SVG anidado dentro de `template`).

## Capacidades

- No genera texto, no razona, no traduce y no ejecuta codigo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues.
- Su unica funcion es servir como conjunto de casos de prueba para validar saneadores de HTML/Markdown:
  - Deteccion de esquemas de URL peligrosos con evasión por mayusculas mezcladas, espacios iniciales, entidades de tabulador, salto de linea, retorno de carro y bytes nulos.
  - Deteccion de URIs `data:` con carga util HTML y SVG, y de URIs `blob:`.
  - Cobertura de atributos de eventos en etiquetas HTML, SVG y MathML, incluyendo variantes con comillas simples, sin comillas y con acentos graves.
  - Cobertura de etiquetas de texto sin procesar y elementos obsoletos (`xmp`, `plaintext`, `listing`, `noembed`, `noframes`, `marquee`, `base`, `meta http-equiv`).
  - Cobertura de contextos CSS dentro de atributos `style` (`expression`, `behavior`, `url()` con `javascript:` y con SVG en `data:`).
  - Cobertura de vectores de navegacion y exfiltracion pasiva (`<a ping>`, `formaction`, `srcset`, `dynsrc`, `lowsrc`).

## Casos de uso

- Auditoria del saneador de HuggingFace: publicar el README y revisar que elementos se eliminan, se escapan como texto o se conservan como HTML activo en la model card renderizada. Es su proposito declarado.
- Pruebas de regresion en bibliotecas de saneado: usar la lista como bateria fija dentro de la suite de tests de proyectos como DOMPurify, bleach o sanitize-html, comparando la salida esperada tras cada actualizacion de la libreria.
- Evaluacion de filtros WAF y de proxies inversos: enviar cada carga util como cuerpo de peticion y comprobar si el filtro la bloquea, la normaliza o la deja pasar, midiendo falsos negativos por vector.
- Formacion en seguridad de aplicaciones: la numeracion H1-H57 facilita construir ejercicios de laboratorio donde el alumno debe clasificar cada vector por tipo de contexto (URL, atributo, texto sin procesar, CSS) y proponer la politica de saneado correspondiente.
- Verificacion de parsers HTML en pipelines de contenido generado por usuarios: validar que un pipeline de renderizado de Markdown a HTML trata correctamente etiquetas heredadas y contextos de texto sin procesar antes de mostrarlo a terceros.
- Investigacion de mXSS: los casos H29, H40, H41 y H49 permiten reproducir mutaciones de DOM que aparecen tras una primera ronda de saneado, utiles para estudiar por que un filtro aparentemente correcto falla en el segundo parseo.
- Comparacion entre motores de renderizado: ejecutar la lista en navegadores basados en Blink, Gecko y WebKit para documentar diferencias de comportamiento en etiquetas obsoletas y en atributos de SVG/MathML.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No requiere GPU ni acelerador: el artefacto es texto plano y no se ejecuta ningun proceso de inferencia.
- No se puede cargar con vLLM, llama.cpp, Ollama, TGI ni ninguna otra herramienta de servicio de modelos, ya que no existen pesos ni `config.json` asociado.
- Consumo de disco practicamente nulo (un unico README de pocos kilobytes).
- Para reproducir los vectores en un entorno controlado se necesita unicamente un navegador en una maquina aislada o una sandbox sin acceso a red, dado que varias cargas utiles apuntan a dominios externos (`rce.lc`) y a `https://huggingface.co/x`.
- Latencia y throughput: no aplica.

## Comparativa con modelos similares

No existe comparativa posible en la categoria de modelos, porque el artefacto no es un modelo. En la categoria de corpus publicos de vectores XSS, los recursos mas cercanos son listas mantenidas por la comunidad de seguridad (por ejemplo, la hoja de evasion de filtros XSS de OWASP, el HTML5 Security Cheatsheet y recopilaciones tipo PayloadsAllTheThings). No se dispone de datos verificados en la informacion proporcionada para comparar cobertura, numero exacto de vectores o licencia frente a esos recursos, por lo que la comparacion cuantitativa queda como no disponible.

| Elemento | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xss-probe4-ext | no aplica | no aplica | no disponible | no disponible | publico en HuggingFace |
| Listas publicas de vectores XSS | no aplica | no aplica | no disponible | no disponible | repositorios y wikis de seguridad |

## Limitaciones y advertencias

- No es un modelo de IA: cualquier intento de cargarlo con transformers, vLLM o llama.cpp fallara, y no debe incluirse en un catalogo de modelos para produccion.
- El contenido del README incluye cargas utiles XSS funcionales si se renderizan sin saneado; el propio repositorio existe para probar si eso ocurre.
- Los casos H21, H22 y H44 contienen URLs a dominios externos (`rce.lc`); abrirlos o renderizarlos en un navegador sin aislamiento puede generar peticiones salientes no deseadas.
- No hay informacion sobre licencia, autor real ni proposito declarado mas alla de la prueba de saneado; su reutilizacion comercial o su integracion en productos queda sin cobertura legal clara.
- Al tener cero descargas y cero likes, carece de validacion por parte de la comunidad y no hay garantia de que los 57 casos sean correctos, actuales o exhaustivos.
- La informacion disponible no incluye resultados de pruebas: se desconoce si todos los vectores sobreviven o son bloqueados por el saneador de HuggingFace, y por tanto no puede citarse como evidencia de una vulnerabilidad.
- La busqueda web realizada no devolvio ninguna fuente relacionada con el repositorio; los resultados obtenidos (sitios de horoscopos, Zhihu y un blog sobre Gemini 1.5) son irrelevantes y no aportan contexto verificable.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/0xmoose0xmoose0xmoose/xss-probe4-ext
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en la busqueda web proporcionada.
