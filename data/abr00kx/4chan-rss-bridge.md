# abr00kx/4chan-rss-bridge

## Resumen

4chan RSS bridge es un servicio local escrito en Go que convierte la API JSON de solo lectura de 4chan (`a.4cdn.org`) en feeds RSS 2.0 y Atom 1.0. No es un modelo de inteligencia artificial ni un juego de pesos: es una utilidad de software publicada como repositorio en HuggingFace bajo la licencia AGPLv3, con autor `abr00kx`, 0 descargas y 0 likes en el momento de la consulta. Su proposito es que cualquier lector de feeds pueda seguir tableros, paginas de catalogo, hilos y archivos de 4chan sin navegador, sin userscript y sin cuenta.

La herramienta se apoya en la API JSON documentada y de solo lectura de 4chan: descarga el JSON, renderiza el marcado de los posts a un subconjunto seguro de HTML y emite feeds conformes al estandar, con enlaces permanentes por post, enclosures de imagen y marcas de tiempo correctas. Por construccion solo emite peticiones `GET` contra `a.4cdn.org`, nunca contra `sys.4chan.org`, de modo que no puede publicar, votar, reportar ni autenticarse.

Es relevante para quienes monitorizan comunidades tecnicas o de actualidad en 4chan (por ejemplo, guias y noticias en tableros como /g) y quieren integrarlas en un flujo RSS existente. La model card declara soporte para los 77 tableros, feeds por pagina de catalogo, feeds de hilo, feeds de archivo, exportacion OPML y cache con TTL configurable, con cero dependencias mas alla de la libreria estandar de Go. Requiere Go 1.26 o superior para compilar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: no es un modelo de IA. Servicio HTTP en Go con capas independientes (`cmd/`, `internal/fourchan`, `internal/markup`, `internal/feed`, `internal/server`) |
| Parametros totales | No aplica (no es un modelo de pesos) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica. La cache tiene un TTL configurable, con 60 segundos por defecto |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible. La interfaz y el contenido dependen del idioma de los posts de 4chan; no se declara soporte multilingue |
| Licencia | AGPL-3.0 (AGPLv3) |
| Formato de pesos | No aplica. Se distribuye como codigo fuente Go; se compila un binario unico |
| Salidas generadas | RSS 2.0 y Atom 1.0 (`.xml` aceptado como alias de `.rss`) |
| Dependencias | Ninguna mas alla de la libreria estandar de Go |
| Requisitos de compilacion | Go 1.26 o superior |
| Tags declarados | rss, atom, 4chan, feed, golang, self-hosted |
| Fecha de creacion | 2026-09-28 |
| Ultima actualizacion | 2026-09-28 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay entrenamiento ni datos de entrenamiento: no es un modelo. La arquitectura es la de un servidor HTTP local cuya logica se reparte en capas desacopladas: `cmd/4chan-rss-bridge` gestiona el analisis de flags, el cableado del servidor HTTP y el log de peticiones; `internal/fourchan` implementa un cliente tipado para la API JSON de `a.4cdn.org` con cache TTL; `internal/markup` convierte el marcado de 4chan en HTML saneado; `internal/feed` serializa RSS 2.0 y Atom 1.0; e `internal/server` compone el enrutado, el ensamblado de feeds y las paginas de indice y OPML. Las capas `markup` y `feed` no conocen HTTP y `fourchan` no conoce los feeds.

La innovacion tecnica destacable esta en el saneado del marcado. 4chan devuelve los cuerpos de los posts como fragmentos HTML; el renderizador los recorre y reemite unicamente una lista blanca de etiquetas: `<br>`, `<wbr>`, `<s>`, `<u>`, `<pre class="prettyprint">`, `<span class="quote|deadlink|spoiler">` y `<a href="...">` con `rel="nofollow ugc"`. Todo lo demas se descarta, incluida la etiqueta de cierre del elemento descartado, para mantener el HTML equilibrado. Las construcciones BBCode que 4chan deja sin expandir, `[spoiler]...[/spoiler]` y `[code]...[/code]`, se convierten a los elementos equivalentes. Los enlaces se resuelven a URLs absolutas y los esquemas capaces de ejecutar codigo (`javascript:`, `data:`, `vbscript:`, `file:`) provocan el descarte del ancla. Los fragmentos de texto se escapan, pero las referencias de entidad ya existentes como `&gt;` y `&#039;` se dejan pasar sin doble escapado, de forma que el greentext se muestra como `>`.

## Capacidades

- Conversion de la API JSON de 4chan en feeds RSS 2.0 y Atom 1.0 desde el mismo espacio de URLs, sustituyendo `.rss` por `.atom`.
- Feed de cualquier tablero completo (catalogo, hilos mas recientes primero) y feed por pagina de catalogo concreta.
- Feeds de hilo con una entrada por post, cada una enlazando a su propio permalink.
- Feeds de archivo para los tableros que mantienen uno.
- Enclosures de imagen con tipo MIME y longitud en bytes correctos.
- Fidelidad de marcado: greentext, enlaces de cita, enlaces muertos, spoilers, tachado, subrayado, cortes de palabra con `<wbr>` y bloques `[code]`.
- Salida saneada mediante lista blanca de etiquetas, con defensa frente a inyeccion de script, style, manejadores de eventos y URLs `javascript:`.
- Exportacion OPML en `/opml` para importar los 77 tableros de una sola vez.
- Indice HTML navegable de todos los tableros en `/`.
- Paso directo de la lista cruda de tableros en `/boards.json`.
- Cache configurable mediante TTL.
- Servicio de solo lectura: unicamente emite peticiones `GET` a `a.4cdn.org`.

## Casos de uso

- Monitorizacion de tableros tecnicos: apuntar un lector RSS a `/{board}.rss` permite seguir el catalogo de tableros como /g sin abrir el navegador y sin cuenta, integrando las novedades en el mismo flujo donde ya se leen blogs y repositorios.
- Seguimiento de hilos concretos: `/{board}/thread/{no}.rss` devuelve una entrada por post, de modo que un hilo de discusion largo se puede seguir incrementalmente en el lector, con cada respuesta enlazada a su permalink.
- Archivado y preservacion: `/{board}/archive.rss` expone los hilos que estan en el archivo del tablero, util para recolectar contenido antes de que 4chan pode el hilo y el feed pase a devolver 404.
- Curaduria de contenidos: la combinacion de feeds por tablero, por pagina de catalogo y por hilo permite a un editor filtrar y rePublicar temas de interes en un boletin, manteniendo los enlaces originales.
- Integracion en agregadores autoalojados: el servicio se despliega junto a un lector RSS propio (FreshRSS, Miniflux y similares) y la exportacion OPML en `/opml` permite dar de alta los 77 tableros en una sola importacion.
- Automatizacion con herramientas de sindicacion: los feeds normalizados, con enclosures de imagen y timestamps correctos, se pueden consumir desde scripts o desde plataformas tipo IFTTT, n8n o Zapier para disparar avisos ante nuevos hilos.
- Analisis de comunidades en investigacion: un investigador puede recolectar posts de un tablero concreto en formato Atom/RSS estable para posteriores analisis de texto, siempre que respete las peticiones de 4chan de no abusar de la API y ajuste el TTL de cache.
- Panel de indice local: abrir `http://127.0.0.1:8080/` ofrece un indice HTML de todos los tableros con sus enlaces de feed, util como pagina de inicio para explorar que feeds existen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no tratarse de un modelo de IA, no aplican metricas como MMLU, HumanEval o GSM8K. La model card no incluye cifras de latencia, throughput, consumo de memoria ni tiempo de respuesta de la API.

## Requisitos de hardware

- No es un modelo de pesos, por lo que no requiere VRAM ni GPU. La model card no especifica requisitos de CPU ni de memoria.
- Requisito declarado: Go 1.26 o superior para compilar.
- La model card usa `sdk: docker`, por lo que el artefacto esta pensado para desplegarse en contenedor, ademas de como binario compilado con `make build`.
- Al no tener dependencias fuera de la libreria estandar de Go, el binario resultante es autocontenido; no se publican cifras de tamano ni de consumo en reposo.
- Opciones de despliegue indicadas: ejecucion local con `./4chan-rss-bridge` escuchando en `127.0.0.1:8080`, o detras de un proxy inverso. No se documenta soporte explicito para vLLM, llama.cpp, Ollama ni TGI, que no aplican.
- La model card recomienda enlazar el servicio a `127.0.0.1` salvo que se ponga un proxy inverso delante, porque no tiene autenticacion ni limitacion de tasa propia.
- Objetivos de compilacion disponibles: `make build`, `make test`, `make vet`, `make fmt`, `make run`, `make clean`.

## Comparativa con modelos similares

| Herramienta | Naturaleza | Licencia | Estado | Notas |
|---|---|---|---|---|
| 4chan RSS bridge (abr00kx) | Servicio Go local, binario unico, sin dependencias externas | AGPL-3.0 | 0 descargas, 0 likes; actualizado el mismo dia de su creacion | 77 tableros, feeds de tablero, pagina, hilo y archivo, OPML, cache TTL, saneado con lista blanca |
| RSS-Bridge (proyecto comunitario) | Agregador de bridges en PHP | No disponible en la informacion recopilada | Proyecto activo con peticiones de funcionalidad abiertas | Existe una peticion abierta para anadir un bridge de 4chan por hilos con filtro de numero de respuestas (issue 3367) |
| API JSON de 4chan (`a.4cdn.org`) | API HTTP de solo lectura | No disponible | Documentada y publica | Es la fuente de datos del bridge; exige un cliente propio y no ofrece formato RSS/Atom |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia AGPL-3.0: es copyleft fuerte. Si se modifica el software y se ofrece como servicio en red a terceros, la AGPL obliga a poner a disposicion el codigo fuente de la version modificada. Conviene revisar las implicaciones antes de integrarlo en un producto propietario.
- No dispone de autenticacion ni de limitacion de tasa propia. La propia documentacion recomienda enlazarlo a `127.0.0.1` salvo que se coloque un proxy inverso delante.
- 4chan poda hilos: el feed de un hilo devuelve 404 cuando el hilo ya no existe y no esta en el archivo. Cualquier automatizacion debe manejar ese 404.
- Los tableros archivados son de solo lectura; sus catalogos siguen sirviendose con normalidad.
- El contenido agregado procede de 4chan, un foro anonimo sin moderacion uniforme. El saneado de HTML evita inyeccion de codigo, pero no filtra el contenido textual ni las imagenes enlazadas; si los feeds se redistribuyen, el operador asume el riesgo reputacional y legal asociado.
- 4chan pide a los consumidores de su API que sean moderados. El TTL de cache por defecto es de 60 segundos y se recomienda combinarlo con el intervalo de sondeo del propio lector.
- El proyecto tiene 0 descargas y 0 likes, con fecha de creacion y ultima actualizacion el mismo dia (2026-09-28). No hay evidencia de adopcion, mantenimiento continuado ni historial de versiones.
- No se declaran idiomas soportados ni cobertura multilingue; la salida depende del idioma de los posts de origen.
- No se publican benchmarks, pruebas de carga, cifras de latencia ni consumo de recursos.
- El pipeline declarado en HuggingFace figura como no disponible, y el repositorio es de codigo, no de pesos, por lo que las herramientas habituales de descarga de modelos no aplican.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/abr00kx/4chan-rss-bridge
- 4chan (sitio principal y lista de tableros): https://www.4chan.org/
- Peticion de bridge de 4chan en RSS-Bridge (issue 3367): https://github.com/RSS-Bridge/rss-bridge/issues/3367
- Referencia sobre GPT-4chan (contexto distinto, no relacionado con esta herramienta): https://en.wikipedia.org/wiki/GPT-4chan

Nota: el resto de resultados de busqueda recopilados (repositorio `ClawLabsAI/free-ai-models` y articulo de Dark Reading sobre jailbreaks) no guardan relacion con esta herramienta y se omiten.
