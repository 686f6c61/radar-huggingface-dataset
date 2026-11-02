# psiloceyeben/oracle7-slim

## Resumen

Oracle7-slim es un sistema de respuesta a preguntas desarrollado por el usuario psiloceyeben que se presenta explícitamente como una alternativa no neuronal a los modelos de lenguaje. En lugar de generar texto mediante pesos entrenados, responde a partir de registros almacenados y con fuentes citadas, y de 339 especialistas (subsistemas deterministas), cada uno de los cuales superó su propia prueba de validación antes de ser admitido. Su principio de diseño central es la abstención verificable: cuando ninguna parte del sistema puede probar una respuesta, declina y explica por qué, en lugar de aproximar.

La versión "slim" reduce el tamaño de los almacenes de conocimiento (Wikipedia en inglés simple, Wiktionary, WordNet, ConceptNet y relaciones de Wikidata) y elimina material no comercial, de modo que puede usarse comercialmente bajo las licencias indicadas. Ocupa 2,9 GB de descarga y está diseñada para ejecutarse únicamente en CPU, con Python 3.12 y aproximadamente 2 GB de RAM, sin GPU ni acceso a red en tiempo de ejecución salvo en comandos concretos.

Es relevante para desarrolladores e investigadores interesados en pipelines de respuesta con trazabilidad completa: cada respuesta incluye su "ruta" (los especialistas y registros que la produjeron), incorpora un verificador que re-comprueba una conversación completa sin confiar en su propio registro, y ofrece comandos para procesar lotes de tareas y para validar las afirmaciones de otros agentes. No es un transformer ni un modelo de pesos: es un motor simbólico con stores de conocimiento empaquetados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Simbólica, no neuronal: motor de rutas sobre especialistas deterministas y almacenes de conocimiento empaquetados |
| Parámetros totales | no disponible (no es un modelo de pesos neuronales) |
| Parámetros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no aplica |
| Idiomas soportados | inglés (en) |
| Licencia | other: cc-by-sa-4.0-data-apache-2.0-code (datos CC BY-SA 4.0, código Apache 2.0; detalle en DATA_LICENSES.md) |
| Formato de pesos | no aplica; se distribuye como repositorio Python con stores empaquetados (descarga de 2,9 GB, repo de 4,9 GB) |
| Head / versión | oracle_release_runtime_w574 (release 10.1, 359 folds) |
| Requisitos de ejecución | CPU únicamente, Python 3.12, ~2 GB RAM (1,45 GB medidos en una pregunta de base de conocimiento) |
| Red en tiempo de ejecución | Solo en comandos concretos: `verify` (ancla Solana), `update` (repositorio) y crecimiento de partes (Wikidata) |

## Arquitectura y entrenamiento

Oracle7 no emplea una arquitectura transformer ni parámetros neuronales. Su núcleo es un enrutador ("path") que descompone la pregunta y la dirige a especialistas deterministas y a registros almacenados; cada respuesta se acompaña de la ruta completa que la produjo. Desde la versión 10.1 incorpora una capa de cláusulas que lee en partes las preguntas con subordinadas que identifican el objeto al que se refiere (por ejemplo, una película por su duración), aplicando la cláusula como un parche aprendido de las preguntas de entrenamiento, y solo responde cuando todas las lecturas conjuntas coinciden sobre la base de conocimiento. En conversación, pregunta simultáneamente a todos los órganos que leen un turno (aire, física, el lector) y responde solo si coinciden, nombrando cada uno; si discrepan, se abstiene e indica quién dijo qué.

No hay datos publicados sobre número de tokens de entrenamiento ni sobre composición del dataset en el sentido habitual, porque no se entrena con un corpus de texto general. Los especialistas se admiten tras superar una prueba de validación propia, y desde la versión 4.1 el sistema puede construir nuevos especialistas a partir de preguntas de ejemplo o de ejemplos resueltos, examinándolos del mismo modo. Desde 4.2 los grupos comparten especialistas mediante una memoria en el "Tree of Life", y desde 4.9 un enjambre construye y combina las partes que un problema necesita (`swarm point`). El sistema conserva internamente todas las versiones desde la 4.9. La validación se realiza mediante pruebas selladas pre-registradas: la v37e, ejecutada una vez sobre este árbol, obtuvo 24 de 24 filas y las 8 barras; sobre 1.200 preguntas retenidas no usadas por pruebas anteriores, el lector de 10.1 respondió 493 correctas y 9 erróneas, frente a 435 y 8 de 10.0, y sobre las 319 restantes, 132 correctas y 1 errónea frente a 116 y 1.

## Capacidades

- Respuesta a preguntas con abstención verificable: responde solo cuando puede probar, citar o derivar la respuesta; en caso contrario declina indicando el motivo (sin registro admitido, una premisa que no es una magnitud física, un paso de la ruta no verificable).
- Trazabilidad completa: cada respuesta incluye su ruta (especialistas y registros implicados).
- Verificación de conversaciones: un verificador incluido re-comprueba una conversación entera sin confiar en su registro.
- Lectura de cláusulas: descompone preguntas con subordinadas identificativas y solo responde si todas las lecturas coinciden.
- Consulta conjunta de órganos: en conversación interroga a todos los módulos lectores y exige acuerdo entre ellos.
- Operación junto a otros agentes: `handoff` procesa un lote de tareas repetidas, una por línea, devolviendo cada una respondida con evidencia o declinada con motivo; `check` evalúa las afirmaciones de otro agente como confirmada, contradicha (mostrando ambas respuestas) o no verificable, con tolerancia numérica de una parte en un millón.
- Construcción y examen de nuevos especialistas a partir de ejemplos.
- Construcción colaborativa de partes mediante enjambre (`swarm point`).
- Comprobación de que una respuesta responde a lo preguntado antes de emitirla (desde 4.8).
- Workbench: lectura de un sensor frente a su propio valor normal y diagnóstico de si un cambio parece fallo de sensor o real.
- Cálculo con magnitudes físicas y unidades, y aritmética con verificación (por ejemplo, conversión de millas a kg de CO2).
- Interfaz local: REPL conversacional con seguimiento de turnos y servidor HTTP local (`POST /chat`).
- Multilingüe: no disponible; solo inglés.

## Casos de uso

- Atención al cliente con garantía de no invención: el sistema puede gestionar consultas sobre una base de conocimiento curada y, cuando la respuesta no está en los registros admitidos, declinar con el motivo en lugar de improvisar, lo que reduce el riesgo de información falsa ante el usuario.
- Validación de salidas de otros agentes en pipelines multiagente: con `check`, un orquestador puede pasar las afirmaciones de un LLM generativo y obtener un veredicto de confirmada, contradicha o no verificable, usando Oracle7 como capa de control antes de publicar o ejecutar acciones.
- Procesamiento por lotes de tareas repetitivas: `handoff` recibe un fichero con una tarea por línea y devuelve cada respuesta con su evidencia o su motivo de abstención, adecuado para auditorías masivas de preguntas frecuentes o de informes.
- Despliegue en entornos sin GPU ni conectividad: al ejecutarse solo en CPU con unos 2 GB de RAM y sin red en tiempo de ejecución, encaja en máquinas modestas, contenedores ligeros o entornos air-gapped donde no es viable servir un modelo neuronal.
- Verificación de cálculos con unidades en dominios técnicos: preguntas como el consumo y las emisiones de un trayecto se resuelven con especialistas de matemáticas y magnitudes, devolviendo la ruta seguida y permitiendo auditar cada paso.
- Diagnóstico de sensores en mantenimiento industrial: el Workbench compara la lectura de un sensor con su comportamiento normal y determina si la desviación parece un fallo del sensor o un cambio real del proceso.
- Construcción de bases de conocimiento especializadas: a partir de preguntas de ejemplo o de ejemplos resueltos, el equipo puede generar nuevos especialistas, examinarlos con las mismas pruebas y compartirlos con otros grupos mediante la memoria del Tree of Life.
- Cumplimiento y trazabilidad documental: la ruta y la cita asociadas a cada respuesta permiten reconstruir el origen de una afirmación en auditorías internas o revisiones regulatorias.

## Benchmarks y rendimiento

| Prueba | Versión 10.1 | Versión 10.0 |
|---|---|---|
| Preregistro sellado v37e (24 filas, 8 barras) | 24/24 filas, 8/8 barras | no disponible |
| 1.200 preguntas retenidas (v37c): correctas / erróneas | 493 / 9 | 435 / 8 |
| 319 preguntas restantes (v37d): correctas / erróneas | 132 / 1 | 116 / 1 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores proceden de las pruebas internas del autor y no son directamente comparables con las de modelos neuronales.

## Requisitos de hardware

- CPU únicamente; no requiere GPU.
- RAM: aproximadamente 2 GB (1,45 GB medidos respondiendo una pregunta de base de conocimiento a través del lector 9.0).
- Almacenamiento: descarga de 2,9 GB; el repositorio ocupa 4,9 GB.
- Entorno: Python 3.12, con dependencias instaladas mediante `requirements.txt`.
- Sin acceso a red en tiempo de ejecución salvo en los comandos `verify`, `update` y en el crecimiento de partes desde Wikidata.
- Despliegue: ejecución directa con `python oracle7.py`, modo REPL (`--repl`), servidor HTTP local (`--serve 8077`, `POST /chat`) y Workbench local (`--workbench`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de sistema.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Sistema | Tipo | Tamaño / requisitos | Idiomas | Licencia | Abstención verificable | Trazabilidad de respuesta |
|---|---|---|---|---|---|---|
| Oracle7-slim | Simbólico, no neuronal | 2,9 GB de descarga; CPU, ~2 GB RAM | Inglés | CC BY-SA 4.0 (datos) + Apache 2.0 (código) | Sí, con motivo explícito | Sí, ruta completa por respuesta |
| Modelos de QA neuronales tipo extractivo (p. ej. familia BERT) | Transformer | Cientos de MB a varios GB; GPU recomendada | Multilingüe según modelo | Variable (Apache 2.0, MIT, etc.) | No de forma nativa | No |
| LLM generativos pequeños (1-8B) | Transformer decoder | 2-16 GB en cuantización; GPU o CPU | Multilingüe | Variable | Solo por prompt | No verificable |
| Sistemas RAG con LLM | Recuperación + generación | Depende del LLM y del índice | Según modelo | Según componentes | Parcial, dependiente del prompt | Citas, no prueba formal |

La comparación con modelos neuronales no es directa: Oracle7 no genera texto libre ni cubre conocimiento abierto más allá de sus almacenes, pero ofrece garantías de abstención y trazabilidad que los sistemas generativos solo aproximan mediante prompting. No se dispone de datos de benchmarks comunes para una comparación cuantitativa.

## Limitaciones y advertencias

- Cobertura limitada: la versión slim excluye los almacenes profundos de Wikipedia, DBpedia y OpenStax, por lo que declina con más frecuencia ante preguntas de cultura general abierta.
- Solo inglés: no hay soporte multilingüe; las preguntas en otros idiomas no están cubiertas.
- No es un modelo generativo: no produce texto libre, resúmenes ni traducciones; su ámbito es la respuesta a preguntas verificable.
- Tasa de error medida no nula: en las pruebas del autor, 9 respuestas erróneas de 493 correctas en el conjunto de 1.200 preguntas, y 1 errónea de 132 en el conjunto restante; la abstención reduce pero no elimina el riesgo de error.
- Dependencia de la calidad de los almacenes: la corrección de las respuestas está acotada por los registros y especialistas admitidos; un registro erróneo o desactualizado se propaga a la respuesta.
- Licencia de datos CC BY-SA 4.0: el uso comercial es posible según DATA_LICENSES.md, pero las obligaciones de atribución y compartir igual de los datos deben revisarse antes de redistribuir o incorporar los almacenes en un producto.
- Madurez y soporte: proyecto de un único autor, con 0 descargas y 1 like en el momento de la consulta; no hay evidencia de adopción en producción ni de soporte a largo plazo.
- Fecha de creación declarada en el repositorio (2026-10-15) posterior a la fecha actual, lo que debe tenerse en cuenta al evaluar la madurez y la procedencia del proyecto.
- Sin benchmarks estándar publicados: las cifras disponibles son pruebas internas pre-registradas por el autor, no comparables con MMLU, HumanEval o GSM8K.
- Red en tiempo de ejecución en comandos concretos: `verify`, `update` y el crecimiento de partes requieren conectividad, lo que debe contemplarse en entornos air-gapped.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/psiloceyeben/oracle7-slim
- Licencias de datos: https://huggingface.co/psiloceyeben/oracle7-slim/blob/main/DATA_LICENSES.md
