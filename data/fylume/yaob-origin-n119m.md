# fylume/yaob-origin-n119m

## Resumen

Yaob Origin N119M 1.0.0 es una red de conocimiento de solo lectura compuesta por 119.733.309 registros (119.176.842 validados y 556.467 marcados como `quarantined`), almacenada en formato FG-MPN con un total de 39,86 GB repartidos en 324 ficheros. No es un modelo de lenguaje: no tiene parámetros ni pesos neuronales, sino un grafo de entidades y relaciones procedentes de Wikidata, OpenAlex y un pequeño conjunto de extractos de Wikipedia. Lo desarrolla fylume y se concibe como la base de conocimiento que acompaña a los experimentos Yaob Origin, pensada para emparejarse con un núcleo cognitivo compatible en MPN Studio.

El origen del proyecto es el almacén de construcción MPN-14B, detenido el 13 de noviembre de 2026 al alcanzar unos 119 millones de nodos, muy lejos del objetivo de 14.000 millones que da nombre al almacén original. Esta release es, por tanto, el estado real y verificado de esa construcción, no un producto terminado según el plan inicial. La red contiene 280.844.705 filas de aristas almacenadas, de las cuales 18.742.569 cuelgan de nodos almacenados y 262.102.136 son aristas entrantes cuyo origen no es un nodo del propio almacén (mayoritariamente enlaces autor-obra de OpenAlex).

Su relevancia actual es acotada pero concreta: ofrece datos estructurados de entidades con procedencia, indexados por título exacto y consultables mediante búsqueda y recorrido de grafo, lo que permite aumentar las respuestas de un núcleo cognitivo con hechos verificables de Wikidata y OpenAlex. No sustituye a un corpus de texto ni a una enciclopedia, y no incorpora embeddings, por lo que su utilidad depende de un motor de emparejamiento externo que todavía no puede responder preguntas directamente desde este formato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FG-MPN 0.2.2, manifiesto `fgmpn-manifest/2`, generación 3 (almacén de red de conocimiento, no red neuronal) |
| Parametros totales | no disponible (no es un modelo; no tiene parámetros) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica; búsqueda por título exacto e índices de orden de búsqueda) |
| Tipos de cuantizacion | no disponible (no aplica; datos estructurados sin cuantización) |
| Idiomas soportados | no disponible (los registros provienen de Wikidata, OpenAlex y lexemas, con cobertura multilingüe no especificada) |
| Licencia | CC BY-SA 4.0 para la base de datos en conjunto; CC0 1.0 para los registros de Wikidata, lexemas de Wikidata y OpenAlex por separado |
| Formato de pesos | no disponible (no hay pesos; formato de almacén FG-MPN: 64 segmentos `seg-*.fgs`, 64 ficheros de aristas `sed-*.fse` y sidecars en `store/index/`) |

## Arquitectura y entrenamiento

No hay entrenamiento ni arquitectura neuronal. El artefacto es un almacén de datos en formato FG-MPN 0.2.2, generación 3, organizado en 64 segmentos de registros (`store/segments/seg-*.fgs`), uno por partición v1, cada uno enrutado por el primer byte del identificador de nodo, más 64 ficheros de aristas (`sed-*.fse`) y los sidecars que usa el lector: índice de título exacto, ficheros de orden de búsqueda y de longitud de documento, y promedios. El fichero `fylume-release.json` lista cada fichero con su tamaño y SHA-256. El almacén es de solo lectura y no es una red escribible.

La composición de los registros validados es: 70.249.568 de OpenAlex, 43.369.020 entidades de Wikidata, 5.548.144 lexemas de Wikidata, 10.000 de la red Yaob N10K y 110 extractos de Wikipedia en inglés. Los 556.467 registros marcados como `quarantined` (aproximadamente el 0,5 % de los segmentos muestreados, todos de Wikidata en la muestra) se conservan y se devuelven al pedirlos por identificador con su estado, pero la búsqueda sigue la regla v1 y solo devuelve registros validados; esto se comprobó sobre una muestra de 45 registros marcados, ninguno de los cuales se encontró por su propio título.

Respecto a una conversión interna anterior del mismo origen que contenía 119.733.345 registros, se eliminaron 36 derivados de FineWeb-Edu cuya licencia no permite redistribución. Los 26 segmentos que los contenían se reconstruyeron sin ellos, los otros 38 segmentos y los 64 ficheros de aristas son idénticos byte a byte a la conversión verificada, y todos los sidecars de los segmentos reconstruidos se regeneraron. Ninguna arista toca esos registros; el detalle está en `VERIFICATION.md`.

## Capacidades

- Almacenamiento y consulta de entidades estructuradas con procedencia (títulos, alias, declaraciones y proveniencia) de Wikidata, OpenAlex y lexemas de Wikidata.
- Búsqueda por título exacto mediante índice dedicado y orden de búsqueda precalculado.
- Recuperación de registros por identificador, incluidos los marcados como `quarantined`, que devuelven su estado.
- Recorrido de grafo por profundidad configurable (`fgmpn traverse store wd:Q42 --depth 2`).
- Verificación de integridad del almacén (`fgmpn verify store`) y comprobación de sumas SHA-256.
- Exploración de solo lectura mediante MPN Studio 0.5.0, que incluye el runtime.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No soporta tool calling ni function calling por sí mismo; su uso requiere un núcleo cognitivo compatible y el runtime `fgmpn`.
- No contiene embeddings ni búsqueda semántica; el emparejamiento con preguntas depende de un motor externo que, según la model card, todavía no puede responder preguntas directamente desde un almacén FG-MPN.

## Casos de uso

- Aumento de respuestas con hechos verificables: un núcleo cognitivo de 4.000 millones de parámetros emparejado con esta red mejora su precisión en preguntas de un salto y de dos saltos según las mediciones internas de Fylume, lo que permite responder con entidades y declaraciones con procedencia en lugar de solo con conocimiento paramétrico.
- Resolución de entidades y desambiguación: el índice de título exacto y los alias de Wikidata permiten mapear menciones de texto a identificadores canónicos (`wd:Q42`) antes de consultar otras fuentes, un paso habitual en pipelines de extracción de información.
- Enriquecimiento de catálogos bibliográficos: los 70.249.568 registros de OpenAlex y sus aristas autor-obra permiten enlazar publicaciones con autores y obras, útil para sistemas de recomendación académica o análisis de redes de citación.
- Navegación de grafos de conocimiento para investigación: el recorrido por profundidad sobre entidades de Wikidata facilita explorar relaciones entre conceptos y construir subgrafos para análisis exploratorio o para alimentar visualizaciones.
- Construcción de bases de datos de referencia internas: al ser un almacén de solo lectura con sumas SHA-256 y verificación integrada, sirve como snapshot reproducible de entidades para equipos que necesitan una copia estable de Wikidata y OpenAlex en un formato consultable.
- Auditoría de procedencia y calidad de datos: la separación entre registros validados y `quarantined`, junto con la proveniencia almacenada en cada registro, permite estudiar la calidad de las fuentes y excluir registros dudosos en flujos de validación.
- Experimentación con arquitecturas de memoria externa: investigadores que trabajen en redes de conocimiento persistentes pueden usar este almacén como referencia para comparar lectores, reglas de cierre y motores de emparejamiento sobre un conjunto de datos de tamaño fijo y verificable.

## Benchmarks y rendimiento

Fylume publica una medición interna, no un benchmark, sobre su suite de 130 preguntas de cola larga (100 de un salto y 30 de dos saltos, con respuestas de referencia de declaraciones de Wikidata). La suite la escribió el mismo equipo, es pequeña y el arnés no está publicado.

| Configuración | Un salto (de 100) | Dos saltos (de 30) |
|---|---:|---:|
| Núcleo de 4.000 millones de parámetros solo | 20 | 1 |
| Núcleo + red leída mediante FG-MPN | 85 | 22 |
| Núcleo + red leída mediante el lector v1 anterior | 86 | 22 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no aplican al no ser un modelo de lenguaje. Según la model card, usar esta red para preguntas fuera de su cobertura no aporta ninguna mejora.

## Requisitos de hardware

- Disco: aproximadamente 37 GiB necesarios para la descarga y el uso del almacén (39,86 GB de ficheros).
- Memoria: uso bajo, ya que el almacén se mapea en memoria (memory-mapped); no requiere cargar los 39,86 GB en RAM.
- GPU: no aplica; no hay inferencia neuronal en el almacén. Cualquier requisito de GPU proviene del núcleo cognitivo con el que se empareje.
- CPU: no se especifican requisitos mínimos más allá de Python 3.12 y el runtime `fgmpn` v0.2.2.
- Despliegue: runtime `fgmpn` (https://github.com/sarja-technologies/fgmpn, release v0.2.2) o MPN Studio 0.5.0, que incluye el runtime y ofrece exploración de solo lectura.
- Latencia y throughput: no disponibles; no se publican mediciones de rendimiento de consulta.
- Almacenamiento en consumer: cabe en cualquier disco SSD o HDD con 37 GiB libres; no depende de GPU de consumo.

## Comparativa con modelos similares

| Producto | Tipo | Tamaño | Contenido | Licencia | Consulta |
|---|---|---|---|---|---|
| Yaob Origin N119M 1.0.0 | Red de conocimiento FG-MPN de solo lectura | 39,86 GB, 119,7 M de registros | Wikidata, OpenAlex, lexemas, 110 extractos de Wikipedia | CC BY-SA 4.0 (base); CC0 1.0 por fuente | `fgmpn` search/get/traverse, MPN Studio |
| Wikidata (volcado completo) | Base de datos estructurada | no disponible | Entidades y declaraciones de Wikidata | CC0 1.0 | SPARQL, herramientas RDF |
| OpenAlex (volcado completo) | Base de datos bibliográfica | no disponible | Obras, autores, instituciones y citas | CC0 1.0 | API y volcados JSON |
| Red Yaob N10K | Red de conocimiento FG-MPN | no disponible | 10.000 registros, incluida en este almacén | CC BY-SA 4.0 | `fgmpn`, MPN Studio |

La comparación con los volcados originales de Wikidata y OpenAlex es la más directa: este almacén es una conversión empaquetada y verificada de ambos, con la diferencia de que elimina 36 registros por restricciones de licencia y añade índices de título exacto y sidecars de búsqueda. No se dispone de otros productos FG-MPN comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un corpus de texto: los registros son datos estructurados de entidades (títulos, alias, declaraciones y proveniencia) más 110 extractos de Wikipedia; no sirve para generar texto ni para responder preguntas por sí solo.
- No contiene embeddings ni búsqueda semántica; la recuperación se limita a título exacto, orden de búsqueda precalculado y recorrido de grafo.
- Las declaraciones mantienen la representación de Wikidata sin calificadores, por lo que un nodo con varios valores puede mezclar valores históricos y actuales. La regla derivada `closure.P131@2` de Fylume existe por este motivo y no forma parte de esta release.
- La búsqueda solo devuelve registros validados; los 556.467 registros `quarantined` no aparecen por título aunque se conserven y se puedan pedir por identificador.
- El emparejamiento con preguntas no está resuelto: según la model card, un emparejamiento todavía no puede responder preguntas desde un almacén FG-MPN, y el motor de emparejamiento lee almacenes SQLite de Studio.
- Las mediciones de rendimiento son internas, sobre una suite de 130 preguntas escrita por el mismo equipo y con arnés no publicado; no deben tratarse como benchmark reproducible.
- La licencia de la base en conjunto es CC BY-SA 4.0, la más restrictiva de sus contenidos, lo que impone obligaciones de atribución y compartir igual para obras derivadas; conviene revisar `ATTRIBUTION.md` para créditos y versiones.
- El almacén es de solo lectura y no escribible; no admite actualizaciones incrementales ni edición de nodos.
- El proyecto no alcanzó su objetivo original de 14.000 millones de nodos; la cobertura actual es de unos 119 millones, y usar la red para preguntas fuera de su cobertura no aporta ninguna mejora.

## Enlaces

- Hugging Face: https://huggingface.co/fylume/yaob-origin-n119m
- Runtime `fgmpn` (release v0.2.2): https://github.com/sarja-technologies/fgmpn
- OpenAlex: https://openalex.org
- Wikidata: https://www.wikidata.org
- Ficheros de referencia citados en la model card: `fylume-release.json`, `SHA256SUMS`, `VERIFICATION.md`, `ATTRIBUTION.md` (incluidos en el repositorio de Hugging Face)
