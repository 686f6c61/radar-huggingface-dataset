# fylume/yaob-n119m-mpn

## Resumen

Yaob Origin N119M 1.0.0 es una red de conocimiento de solo lectura publicada por Fylume bajo el identificador `fylume/yaob-n119m-mpn`. No es un modelo de lenguaje: es un almacén de datos estructurados en formato FG-MPN (Modular Persistent Network) que contiene 119.733.309 registros procedentes de OpenAlex, Wikidata, lexemas de Wikidata y una pequeña muestra de extractos de Wikipedia en inglés. El repositorio ocupa 39,86 GB distribuidos en 324 ficheros y no tiene parámetros, ya que no ejecuta inferencia por sí mismo.

El propósito de la red es servir como capa de conocimiento verificable para un "núcleo cognitivo" externo compatible con OpenAI. El núcleo formula la respuesta y la red aporta los registros y relaciones que la sustentan, de modo que las respuestas pueden incluir citas. La integración se realiza a través del runtime `fgmpn` v0.2.2 o de MPN Studio 0.5.0 (exploración) y 0.6.0 (preguntas y respuestas).

La relevancia de esta publicación radica en su enfoque de recuperación estructurada sin embeddings: el emparejamiento se hace mediante índices propios del almacén (título exacto, orden de búsqueda y longitudes de documento) y un recorrido de relaciones de uno o dos saltos. Es un componente de infraestructura de datos, no un modelo generativo, y debe evaluarse como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FG-MPN 0.2.2, manifiesto `fgmpn-manifest/2`, generación 3 (red de registros y relaciones, no modelo neuronal) |
| Parametros totales | no disponible (la red no tiene parámetros) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; el recorrido se limita a 1-2 saltos por consulta) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (los registros provienen de Wikidata, OpenAlex y Wikipedia en inglés; el autor no declara lista de idiomas) |
| Licencia | CC BY-SA 4.0 (contenidos subyacentes Wikidata, lexemas Wikidata y OpenAlex en CC0 1.0) |
| Formato de pesos | FG-MPN: 64 segmentos de registro `seg-*.fgs`, 64 ficheros de aristas `sed-*.fse` y sidecars en `store/index/` |

## Arquitectura y entrenamiento

La red se estructura en 64 segmentos de registro, uno por partición v1, enrutados por el primer byte del identificador de nodo, más 64 ficheros de aristas. Los sidecars de `store/index/` incluyen índice de título exacto, orden de búsqueda, longitudes de documento y promedios. El almacén es de solo lectura y se accede mediante mapeo en memoria, por lo que el consumo de RAM es reducido pese a los 39,86 GB en disco.

La composición de los registros validados es: 70.249.568 de OpenAlex, 43.369.020 entidades de Wikidata, 5.548.144 lexemas de Wikidata, 10.000 de la red Yaob N10K y 110 extractos de Wikipedia en inglés. Hay 556.467 registros marcados como `quarantined` (aproximadamente el 0,5 % de los segmentos muestreados, todos de Wikidata en esa muestra), que se devuelven solo al pedirlos por identificador y nunca se usan como evidencia ni se citan. Se almacenan 280.844.705 filas de aristas, de las cuales 18.742.569 cuelgan de nodos almacenados y 262.102.136 son aristas entrantes cuyo origen no es un nodo almacenado (mayoritariamente enlaces autor-obra de OpenAlex). La cifra de 1.693.590.449 relaciones de manifiestos anteriores no se sostiene frente al recuento real.

No hay entrenamiento ni ajuste por RLHF/DPO: la red es un artefacto de conversión y verificación de datos. Respecto a una conversión interna previa de 119.733.345 registros, se eliminaron 36 registros derivados de FineWeb-Edu por restricciones de licencia; se reconstruyeron los 26 segmentos afectados y sus sidecars, mientras que los otros 38 segmentos y los 64 ficheros de aristas son idénticos byte a byte a la conversión verificada.

## Capacidades

- Búsqueda por título exacto sobre registros validados (regla v1), verificada sobre una muestra de 45 registros marcados: ninguno se encontró por su propio título.
- Recuperación por identificador con `fgmpn get`, incluyendo registros en cuarentena con su estado.
- Recorrido de relaciones con `fgmpn traverse` hasta una profundidad de dos saltos (por ejemplo, `wd:Q42 --depth 2`).
- Aportación de registros numerados a un núcleo cognitivo compatible con OpenAI para que las respuestas incluyan citas.
- Verificación de integridad del almacén con `fgmpn verify store` y comprobación de sumas SHA-256 contra `SHA256SUMS`.
- No dispone de embeddings ni de búsqueda semántica; el emparejamiento es léxico y estructural.
- No genera texto por sí misma: la generación depende del núcleo con el que se empareje.

## Casos de uso

- Respuestas con cita verificable en asistentes internos: el almacén localiza la entidad nombrada en la pregunta mediante sus índices, sigue una o dos relaciones y entrega los registros al núcleo como nodos numerados, de forma que cada afirmación puede rastrearse hasta un registro concreto.
- Enriquecimiento de pipelines de datos científicos: los 70,2 millones de registros de OpenAlex permiten resolver autores, obras y sus enlaces autor-obra para construir grafos de citas o desambiguar afiliaciones sin depender de servicios externos.
- Desambiguación de entidades en procesos de ingesta: el índice de título exacto y los alias de Wikidata sirven para mapear menciones textuales a identificadores `wd:Q...` antes de almacenarlas en un sistema propio.
- Auditoría de procedencia: cada registro conserva sus claims y su procedencia, lo que permite reconstruir de dónde sale un dato y descartar los registros en cuarentena en flujos de publicación.
- Exploración interactiva de conocimiento: MPN Studio 0.5.0 o superior abre el almacén en modo lectura para inspeccionar entidades, alias y relaciones sin escribir código.
- Base de evaluación de sistemas RAG estructurados: al no usar embeddings y ser de solo lectura, permite medir de forma aislada la contribución de la recuperación léxica y del recorrido de relaciones frente a la del núcleo generativo.
- Soporte a tareas de lexicografía: los 5.548.144 lexemas de Wikidata aportan formas léxicas y sus vínculos para herramientas de normalización o análisis morfológico.

## Benchmarks y rendimiento

La única medición publicada es interna de Fylume y el propio autor la califica de no benchmark. Se realizó sobre una suite de 130 preguntas de cola larga (100 de un salto y 30 de dos saltos, con referencia tomada de claims de Wikidata), escrita por el mismo equipo y con arnés no publicado.

| Configuracion | Un salto (de 100) | Dos saltos (de 30) |
|---|---:|---:|
| Núcleo de 4.000 millones de parámetros solo | 20 | 1 |
| Núcleo + esta red vía FG-MPN | 85 | 22 |
| Núcleo + esta red vía lector v1 anterior | 86 | 22 |

No se han publicado resultados de benchmarks en la informacion disponible más allá de esta medición interna. El autor advierte que usar la red para preguntas fuera de su cobertura no aporta beneficio.

## Requisitos de hardware

- Disco: aproximadamente 37 GiB necesarios para el almacén descargado, sobre un repositorio de 39,86 GB.
- Memoria: consumo bajo, ya que el almacén se accede mediante mapeo en memoria; no requiere GPU.
- GPU: no aplica a la red. La GPU la necesita el núcleo cognitivo con el que se empareje, cuyas necesidades dependen de su tamaño (el núcleo de 4.000 millones de parámetros usado en la medición interna es el único dato disponible).
- Cabe en cualquier equipo de consumo siempre que haya espacio en disco; no hay requisito de VRAM para la red.
- Despliegue: runtime `fgmpn` v0.2.2 sobre Python 3.12, o MPN Studio 0.5.0 o superior (que incluye el runtime). No se soportan vLLM, llama.cpp, Ollama ni TGI, al no tratarse de un modelo de pesos.
- Latencia y throughput: no disponibles. La documentación solo indica que el almacén se lee en su ubicación, sin copia ni embeddings.

## Comparativa con modelos similares

| Sistema | Tipo | Tamano | Contexto | Licencia | Uso |
|---|---|---|---|---|---|
| Yaob Origin N119M (esta ficha) | Red de conocimiento FG-MPN de solo lectura | 119,7 M registros, 39,86 GB | no aplica (1-2 saltos) | CC BY-SA 4.0 | Requiere núcleo externo compatible con OpenAI |
| Wikidata (dump completo) | Base de conocimiento RDF/JSON | variable segun dump | no aplica | CC0 1.0 | Requiere cargador propio (Blazegraph, QLever, etc.) |
| OpenAlex (dump completo) | Base de datos de literatura científica | variable segun dump | no aplica | CC0 1.0 | API o carga propia |
| Modelo de lenguaje con RAG sobre Wikidata | Modelo generativo mas recuperador | depende del modelo | depende del modelo | depende del modelo | Genera texto, pero la recuperación suele depender de embeddings |

La diferencia principal frente a los dumps originales es el empaquetado: FG-MPN ofrece índices y recorrido listos para usar, pero fija una regla de búsqueda v1 (solo registros validados) y no incluye el conjunto completo de Wikidata ni de OpenAlex en el momento de la conversión.

## Limitaciones y advertencias

- No es un corpus de texto ni una enciclopedia: los registros son datos estructurados de entidad (títulos, alias, claims, procedencia) más 110 extractos de Wikipedia. No sirve para generación de texto libre.
- No tiene embeddings, por lo que no hay recuperación semántica; una pregunta formulada con sinónimos no encontrados en los índices no recuperará el registro.
- Las afirmaciones conservan la representación de Wikidata sin cualificadores, de modo que un nodo con varios valores puede mezclar información histórica y actual. La regla derivada `closure.P131@2` que Fylume usa para mitigarlo no forma parte de esta publicación.
- Los 556.467 registros en cuarentena no se encuentran por título ni se citan; pedirlos por identificador los devuelve con su estado, lo que puede confundir si no se filtra.
- La cobertura está limitada a lo convertido: el almacén de construcción MPN-14B se detuvo el 13 de noviembre de 2026 en unos 119 millones de nodos, lejos del objetivo de 14.000 millones.
- La licencia CC BY-SA 4.0 es la más restrictiva del conjunto y afecta a la base de datos como un todo; los registros de Wikidata, lexemas y OpenAlex son CC0 1.0 por separado. Cualquier uso comercial debe respetar la atribución y el carácter compartido igual de la licencia global.
- El repositorio no declara lista de idiomas soportados, aunque el contenido proviene mayoritariamente de fuentes en inglés y de etiquetas multilingües de Wikidata.
- La única medición de rendimiento es interna, con suite escrita por el mismo equipo y arnés no publicado; no debe tratarse como evidencia independiente.
- El almacén es de solo lectura: no admite escritura ni actualización in situ.

## Enlaces

- Hugging Face: https://huggingface.co/fylume/yaob-n119m-mpn
- Runtime fgmpn v0.2.2: https://github.com/sarja-technologies/fgmpn
- MPN Studio v0.6.0 (notas y mediciones): https://github.com/sarja-technologies/mpn-studio/releases/tag/v0.6.0
- OpenAlex: https://openalex.org
- Wikidata: https://www.wikidata.org
