# 0xmoose0xmoose0xmoose/xss-probe-sep14

## Resumen

El repositorio `0xmoose0xmoose0xmoose/xss-probe-sep14` no contiene un modelo de inteligencia artificial. Se trata de un artefacto alojado en HuggingFace cuyo contenido es un conjunto de 45 sondas HTML/CSS numeradas de A1 a A45, disenadas para comprobar que clases de marcado sobreviven al saneador (sanitizer) que HuggingFace aplica al renderizar model cards. El autor lo publica bajo el identificador `0xmoose0xmoose0xmoose` y no declara licencia, pipeline, idiomas ni pesos.

El interes tecnico del repositorio es acotado pero real: cada sonda explota una via distinta de las que suelen usar los saneadores de Markdown/HTML en plataformas de documentacion. El conjunto cubre inyeccion y exfiltracion por CSS (`url()` en `background-image`, `@import`, `@font-face`, URLs relativas al protocolo, `@media`, `@keyframes`, `@supports`, `@layer` y selectores de atributo), ofuscacion de esquemas en atributos `href` y `src` (tabulador, salto de linea y entidades HTML dentro de `javascript:`), rarezas del analizador HTML (mayusculas mezcladas en nombres de etiqueta, byte nulo, ruptura de comentarios, CDATA, comentarios anidados) y vectores SVG (`foreignObject`, `use` con `xlink:href` en data URI, `animate`, `set`, `onload`).

No hay informacion sobre arquitectura, parametros, contexto, dataset de entrenamiento ni resultados de evaluacion, porque no existe tal modelo. El repositorio registra 0 descargas y 0 likes, y las busquedas web realizadas no devolvieron ningun enlace relacionado con el artefacto (los resultados obtenidos corresponden a dominios comerciales sin vinculacion con el contenido).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplicable (no es un modelo de IA; es un conjunto de sondas HTML/CSS) |
| Parametros totales | No disponible |
| Parametros activos | No aplicable |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el contenido de las sondas es HTML/CSS, independiente del idioma) |
| Licencia | No disponible |
| Formato de pesos | No aplicable (no contiene pesos; el contenido es texto en la model card) |
| Tipo de artefacto | Repositorio de HuggingFace con model card de tipo prueba de saneador |
| Numero de sondas | 45, numeradas de A1 a A45 |
| Dominio de callback | `rce.lc` (usado como endpoint de exfiltracion en las sondas CSS y de navegacion en las sondas de elementos) |
| Fecha de creacion | 2026-09-15T01:34:41.000Z |
| Fecha de actualizacion | 2026-09-15T01:34:41.000Z |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es un documento de prueba estructurado en cinco bloques funcionales: (1) sondas de exfiltracion por CSS, que intentan provocar peticiones salientes hacia `rce.lc` mediante propiedades como `background-image` o `background` con `url()`, reglas `@import`, `@font-face`, `@media`, `@keyframes`, `@supports` y `@layer`, ademas de una sonda de extraccion por selector de atributo (`input[value^="a"]` con `background:url(...)`, tecnica clasica de exfiltracion caracter a caracter); (2) sondas de ofuscacion de esquema, que introducen tabuladores, saltos de linea y entidades HTML dentro del literal `javascript:` en atributos `href` y `src`, incluida la variante con entidad numerica en la primera letra; (3) sondas de analizador HTML, que comprueban mayusculas mezcladas en el nombre de la etiqueta, byte nulo dentro de la etiqueta, ruptura de comentarios, CDATA y comentarios anidados; (4) sondas SVG, con `foreignObject`, `use` con `xlink:href` apuntando a un data URI en base64, `animate` con `onbegin` y `set` con `onbegin`, ademas de `onload` directo; y (5) sondas de elementos y navegacion, que incluyen `iframe`, `object`, `meta` con `http-equiv="refresh"`, `link` a hoja de estilos externa, `base`, `form` con `action` externa, `video` y `audio` con esquemas ofuscados, y una superposicion fija a pantalla completa (marcada como A25) que ilustra un riesgo de suplantacion visual de la interfaz.

Una parte de las sondas emplea el selector `.hf-sanitized` (A1 y A27), lo que indica que el autor conoce el nombre de clase que HuggingFace aplica al contenedor saneado y prueba tanto a apuntar dentro de ese ambito como a intentar escapar de el. No hay documentacion de resultados esperados, ni codigo de ejecucion, ni automatizacion: el repositorio es unicamente la lista de cargas.

## Capacidades

- Verificacion de saneadores HTML/CSS: permite comprobar que categorias de marcado se eliminan, se neutralizan o se dejan pasar en el renderizador de model cards.
- Deteccion de exfiltracion por CSS: las sondas con `url()` y con selector de atributo permiten determinar si el renderizador permite peticiones salientes originadas en estilos.
- Comprobacion de normalizacion de URL: las variantes con tabulador, salto de linea y entidades miden si el saneador normaliza antes o despues de validar el esquema.
- Comprobacion de tolerancia del analizador: las variantes de mayusculas mezcladas, byte nulo, CDATA y comentarios miden la coherencia entre el analizador del saneador y el del navegador.
- Cobertura de contexto SVG y MathML: las sondas en `foreignObject`, `use`, `animate`, `set` y el bloque de `math/mtext` extienden la prueba a contextos de espacio de nombres no HTML.
- Prueba de restricciones de entorno: las sondas de `iframe`, `object`, `base`, `meta refresh` y `form` miden si el saneador bloquea navegacion y envio de datos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas, vision ni audio: no es un modelo.
- No dispone de capacidades multilingues en el sentido de model card de IA, ya que no procesa lenguaje.

## Casos de uso

- Auditoria previa a la publicacion de model cards: un equipo que sube documentacion a HuggingFace puede ejecutar este conjunto en un repositorio de prueba para verificar que el saneador de la plataforma neutraliza las cargas antes de exponer contenido de terceros en su propia ficha.
- Pruebas de regresion en pipelines de CI/CD: el listado se puede convertir en un conjunto de casos versionado y ejecutarse contra cada nueva version de un saneador propio (por ejemplo, un renderizador de Markdown interno) para detectar regresiones en la lista de etiquetas y atributos permitidos.
- Validacion de politicas de Content Security Policy: las sondas CSS que intentan solicitudes hacia `rce.lc` sirven para comprobar si la CSP del entorno de renderizado bloquea efectivamente `style-src` y `img-src` y si las peticiones quedan registradas en los logs del servidor de callback.
- Formacion en seguridad de aplicaciones web: cada sonda ilustra una clase de evasión concreta (ofuscacion de esquema, escape de ambito CSS, contexto SVG), lo que las hace utiles como material didactico en cursos de XSS y saneado de HTML.
- Ejercicios de red team sobre plataformas de documentacion: un equipo autorizado puede medir la superficie real de un renderizador de terceros y documentar hallazgos antes de que lo haga un atacante.
- Evaluacion comparativa de bibliotecas de saneado: ejecutar las 45 cargas contra varias implementaciones (por ejemplo, distintos backends de saneado de HTML) y tabular cual neutraliza cada categoria permite elegir la mas restrictiva para un producto.
- Pruebas de detectores y WAF: las cadenas ofuscadas (tabulador, salto de linea, entidades, byte nulo) son utiles para medir la tasa de deteccion de reglas de firewall de aplicacion web y para reducir falsos negativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de resultados, notas de que sondas fueron bloqueadas por el saneador de HuggingFace, ni comparacion con otros conjuntos de prueba. Los unicos datos cuantitativos registrados son 0 descargas y 0 likes, y la ausencia de actualizaciones posteriores a la creacion (ambas marcas de tiempo son identicas), lo que indica que no hay validacion por parte de la comunidad.

## Requisitos de hardware

- VRAM para inferencia: no aplicable. El artefacto no ejecuta computo de red neuronal.
- GPU recomendadas: ninguna. No requiere GPU.
- Compatibilidad con GPU de consumo: no aplicable; no hay nada que cargar en memoria de video.
- Entorno minimo de uso: un navegador moderno que renderice HTML y CSS, y acceso a la red si se desea observar las peticiones de callback.
- Opciones de despliegue: servidor web estatico, renderizador de Markdown con saneador configurable, o conversion del listado a casos de prueba automatizados con un motor de navegador sin interfaz (headless).
- Infraestructura de observacion: para verificar exfiltracion hace falta controlar el dominio de callback `rce.lc` o sustituirlo por uno propio, y disponer de registros de acceso HTTP en el extremo receptor.
- Latencia y throughput: no disponibles. Dependen por completo del entorno de renderizado y no del artefacto.

## Comparativa con modelos similares

No procede una comparativa con modelos de IA: este repositorio no es un modelo y no compite en ninguna categoria de modelos. En la informacion proporcionada no hay datos de alternativas equivalentes.

Como referencia cualitativa del ambito, existen corpus publicos de cargas de evasion de filtros XSS mantenidos por la comunidad de seguridad web (por ejemplo, el XSS Filter Evasion Cheat Sheet de OWASP), pero no se han facilitado metricas que permitan una comparacion cuantitativa con este conjunto, ni se dispone de datos sobre cobertura, tasa de exito o exhaustividad de ninguna de las dos partes.

## Limitaciones y advertencias

- El artefacto no es un modelo de IA. Cualquier evaluacion que lo trate como tal (rendimiento, contexto, licencia de pesos) carece de sentido.
- No se declara licencia. Sin una licencia explicita no puede asumirse permiso de redistribucion, modificacion ni uso comercial del contenido.
- Las sondas apuntan a `rce.lc`, un dominio de terceros. Ejecutarlas tal cual genera trafico hacia un dominio que no controla el usuario y que puede no existir o haber cambiado de titularidad; en un entorno propio hay que sustituir las URL por un endpoint bajo control.
- El dominio de callback (`rce.lc`, con `rce` como prefijo) y los nombres de las sondas sugieren pruebas de ejecucion remota de codigo; el alcance real de las cargas es de inyeccion HTML/CSS y XSS, no de RCE, pero la eleccion de nombres induce a confusion.
- Las marcas de tiempo (creacion y actualizacion el 2026-09-15) son posteriores a la fecha habitual de publicacion y ambas identicas, lo que resulta anomalo y debe verificarse antes de citar el artefacto como referencia temporal.
- No hay resultados documentados: se desconoce que sondas fueron bloqueadas y cuales no, por lo que el conjunto no puede presentarse como una prueba de que un saneador sea seguro.
- No se garantiza cobertura completa de las clases de evasion conocidas; 45 sondas cubren un subconjunto de vectores y no sustituyen a una auditoria de seguridad.
- Riesgo de uso indebido: publicar o desplegar estas cargas contra sistemas de terceros sin autorizacion expresa puede infringir condiciones de servicio y la legislacion aplicable.
- 0 descargas y 0 likes implican ausencia de revision por pares y de mantenimiento; no hay garantia de que las tecnicas sigan vigentes frente a saneadores actuales.
- No hay datos de sesgos, alucinacion, limites de contexto ni restricciones de idioma porque no existe componente de lenguaje.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/0xmoose0xmoose0xmoose/xss-probe-sep14
- Model card del autor: https://huggingface.co/0xmoose0xmoose0xmoose/xss-probe-sep14 (contenido integro descrito en esta ficha)
- Resultados de busqueda web: no se encontro ningun enlace relacionado con el artefacto. Las busquedas devolvieron unicamente paginas de dominios comerciales (Amazon.de) sin vinculacion con el modelo, por lo que no se listan como referencias.
- Papers, blogs, repositorios o demos asociados: no disponibles.
