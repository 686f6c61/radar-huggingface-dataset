# djchali/kenlang-gemma-4-12b-it-lora-v2

## Resumen

Kenlang-gemma-4-12b-it-lora-v2 es un adaptador LoRA (rango 16) desarrollado por el usuario djchali sobre el modelo base unsloth/gemma-4-12b-it. Su objetivo no es la generacion de texto general, sino ensenar al modelo a escribir programas en Ken, un lenguaje de programacion experimental de tipo pipeline postfijo disenado especificamente para que modelos pequenos lo generen de forma fiable. El adaptador responde directamente, sin fase de razonamiento, a partir de una descripcion en ingles de una tabla de datos y una tarea.

El problema que resuelve es concreto: los modelos generalistas fallan al escribir codigo DSL (lenguaje de dominio especifico) en un formato poco comun y tienden a divagar. Con este adaptador, Gemma 4 12B pasa de resolver el 5 % de unas tareas manuscritas a resolver el 100 %, y reduce la longitud media de respuesta de 172 a 52 tokens. El modelo no es autonomo: es un adaptador que debe cargarse encima del modelo base.

La relevancia es doble. Por un lado, demuestra que un ajuste fino pequeno (2.020 ejemplos, 1 epoch) puede transformar el comportamiento de un modelo de 12B en un dominio estrecho. Por otro, sirve como banco de pruebas para la idea de disenar lenguajes que los modelos pequenos escriban con precision, con comprobaciones de correccion calculadas de forma independiente con pandas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA; hereda la del modelo base unsloth/gemma-4-12b-it) |
| Parametros totales | 12B (modelo base); adaptador LoRA de rango 16 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (los prompts del entrenamiento rondan los 1.800 tokens) |
| Tipos de cuantizacion | base cargado en 4 bits mediante QLoRA; otras cuantizaciones no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador PEFT de rango 16, no un modelo completo. Se entrena sobre Gemma 4 12B cargado en 4 bits con QLoRA y la libreria Unsloth. La perdida se calcula unicamente sobre la respuesta (answer-only loss), lo que concentra el aprendizaje en el formato de salida Ken y no en la reproduccion del prompt.

Los datos de entrenamiento consisten en 2.020 ejemplos generados por un programa: cada uno es una pregunta en ingles mas una respuesta en Ken, referida a una de tres tablas (`bookings`, `orders`, `shipments`) con columnas y valores distintos entre si. Las respuestas incluyen construcciones como `if`, `def` y `as` dentro de bloques (porcentajes, ratios, etiquetas y clases). Cada respuesta se ejecuto y su resultado se verifico contra pandas. Los prompts ocupan unos 1.800 tokens (unos 1.500 corresponden a la referencia del lenguaje) y las respuestas son cortas (mediana de unos 50 tokens). Los hiperparametros son: 1 epoch (253 pasos), 8 ejemplos por paso, tasa de aprendizaje 0,0002 con decaimiento lineal y optimizador `adamw_8bit`.

Ken 0.1 es un lenguaje de pipeline postfijo en el que un programa es una cadena de pasos que se traduce a Python y se ejecuta. Un ejemplo de la model card: `csv orders.csv where status eq done by product [ each qty sum ] top 5 map [ fmt "{0}: {1}" ] print`. No se menciona ninguna innovacion de decodificacion especulativa ni atencion lineal.

## Capacidades

- Traduccion de instrucciones en ingles sobre tablas de datos a programas Ken correctos y ejecutables.
- Generacion directa, sin fase de razonamiento intermedia (respuestas cortas, mediana en torno a 50 tokens).
- Cobertura de tareas de agregacion y transformacion: filtrado (`where`), agrupacion (`by`), sumas, ordenacion y seleccion (`top`), formateo (`fmt`), escritura a fichero (`print`) y mapeo (`map`).
- Uso de estructuras condicionales y funciones definidas por el usuario dentro de bloques (`if`, `def`, `as`).
- Generalizacion a tablas no vistas en entrenamiento (evaluado con `grades.csv`, sin columna de precio).
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de pensamiento segun la informacion disponible.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Automatizacion de analisis tabular sobre ficheros CSV: describir en lenguaje natural una operacion (por ejemplo, ventas por producto en pedidos completados) y obtener un programa Ken que, al ejecutarse, produce el resultado, con respuestas cortas y coste de tokens bajo.
- Generacion de pipelines de datos ligeros: usar Ken como capa intermedia que se traduce a Python y se ejecuta con la biblioteca estandar, evitando dependencias pesadas en entornos restringidos.
- Ensenanza y prototipado de DSL: emplear el adaptador como referencia de como un modelo pequeno puede aprender un lenguaje disenado para ser escrito de forma fiable.
- Evaluacion comparativa de modelos en escritura de codigo DSL: el modelo sirve como linea base con metricas objetivas de correccion (programa ejecutado y comparado con pandas).
- Reduccion de coste en inferencia de tareas estrechas: con una media de 45 tokens por respuesta correcta frente a 3.160 del modelo base, es adecuado para pipelines donde el coste por consulta importa.
- Preprocesado reproducible de informes: transformar tablas de pedidos, reservas o envios en resumenes calculados, con la garantia de que la salida se ha validado contra una implementacion independiente.
- Integracion en sistemas de asistencia sobre datos internos: al ser un adaptador LoRA, puede cargarse sobre el modelo base ya desplegado para anadir una capacidad concreta sin sustituir el modelo completo.

## Benchmarks y rendimiento

Resultados publicados en la model card. Tres conjuntos de preguntas, cada una intentada tres veces. Una respuesta solo cuenta como correcta si el programa se ejecuta e imprime exactamente el resultado correcto. Ambos modelos se evaluan con Gemma 4 12B cuantizado a 4 bits, sin razonamiento, temperatura 0,6, top-p 0,95, top-k 64.

| Conjunto | Que mide | Gemma 4 12B | Con el adaptador |
|---|---|---|---|
| Manuscrito, 7 preguntas | tareas escritas a mano sobre `orders.csv`; ni la tarea ni la respuesta estan en entrenamiento, pero si las habilidades | 1/21 (5 %) | 21/21 (100 %) |
| Generado, 95 preguntas | preguntas reservadas construidas con las mismas plantillas del entrenamiento, sobre las tres tablas de entrenamiento | 2/285 (1 %) | 279/285 (98 %) |
| Tabla nunca vista, 60 preguntas | preguntas generadas sobre `grades.csv`, con otros nombres de columna y forma distinta (sin columna de precio) | 7/180 (4 %) | 176/180 (98 %) |

Tokens por respuesta correcta (tareas manuscritas):

| Modelo | Lenguaje | Razonamiento | Manuscrito | Generado | Tabla no vista | Tokens por respuesta | Tokens por respuesta correcta |
|---|---|---|---|---|---|---|---|
| Gemma 4 12B (4 bits) | Ken | off | 1/21 (5 %) | 2/285 (1 %) | 7/180 (4 %) | 150 | 3.160 |
| Gemma 4 12B (4 bits) + adaptador | Ken | off | 21/21 (100 %) | 279/285 (98 %) | 176/180 (98 %) | 45 | 45 |

Longitud de los programas correctos (tokenizador de unsloth/gemma-4-12b-it), comparando Ken con Python de biblioteca estandar y pandas:

| Tarea | Ken | Python | pandas |
|---|---|---|---|
| 1 | 51 | 125 | 86 |
| 2 | 51 | 101 | 78 |
| 3 | 48 | 142 | 76 |
| 4 | 39 | 96 | 63 |
| 5 | 72 | 139 | 97 |
| 6 | 23 | 80 | 62 |
| 7 | 22 | 125 | 66 |
| **Total (7 tareas)** | **306** | **808** | **528** |
| **Frente a Ken** | 1,0x | 2,6x | 1,7x |

Nota del autor: la comparacion de longitudes mide programas correctos, no lo que escriben los modelos; las versiones Python y pandas fueron escritas a mano, por lo que las ratios son una estimacion y solo se refieren a tareas sobre tablas.

## Requisitos de hardware

- VRAM estimada para inferencia: no indicada por el autor. Como referencia orientativa (estimacion basada en el tamano del modelo base de 12B), en 4 bits los pesos ocupan aproximadamente 6-7 GB, a los que hay que sumar la cache KV y el overhead del runtime.
- Cuantizacion en 4 bits: cabe en GPU de consumo con 12-16 GB de VRAM o mas (por ejemplo, RTX 4070 Ti Super, RTX 4080, RTX 4090) para contextos moderados.
- Precision completa (BF16): un modelo de 12B requiere del orden de 24-30 GB de VRAM, por lo que se necesitan GPU profesionales como A100 (40/80 GB), H100 (80 GB) o L40S.
- El adaptador en si ocupa 0,3 GB, por lo que el requisito real lo determina el modelo base.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse sobre el modelo base con bibliotecas que admiten LoRA (por ejemplo, PEFT/Transformers, vLLM o TGI). Para llama.cpp u Ollama es necesario fusionar el adaptador con el modelo base y convertir a GGUF; no disponible como artefacto ya fusionado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos publicados sobre otros adaptadores Kenni sobre variantes del mismo tipo, por lo que la unica comparacion documentada es la del modelo base sin adaptador.

| Modelo | Parametros | Contexto | Manuscrito | Tabla no vista | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Gemma 4 12B (4 bits) | 12B | no disponible | 1/21 (5 %) | 7/180 (4 %) | no disponible en esta ficha | modelo base |
| Gemma 4 12B (4 bits) + este adaptador | 12B + LoRA r16 | no disponible | 21/21 (100 %) | 176/180 (98 %) | apache-2.0 | adaptador en HuggingFace |
| Otros adaptadores o modelos comparables de escritura de DSL | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo completo: requiere cargar el modelo base unsloth/gemma-4-12b-it. No puede usarse de forma autonoma.
- Alcance muy estrecho: esta especializado en escribir programas Ken sobre tablas de datos. Fuera de ese dominio no hay evidencia de rendimiento.
- Solo ingles: la model card declara unicamente `en` como idioma soportado.
- Riesgo de alucinacion en la sintaxis: aunque el 98 % de acierto en tablas no vistas es alto, sigue habiendo respuestas que pueden ejecutarse con un resultado distinto del esperado; en produccion conviene validar la salida contra una implementacion de referencia, como se hizo en la evaluacion con pandas.
- El conjunto generado comparte plantillas con el entrenamiento, por lo que su 98 % es el escenario mas favorable. El conjunto de tabla nunca vista es el indicador mas fiable de generalizacion.
- Los ratios de longitud de programas son estimaciones hechas por el autor con codigo escrito a mano; no deben extrapolarse a otros tipos de programa.
- Sobreajuste potencial: 1 epoch sobre 2.020 ejemplos es un ajuste ligero, pero el dominio de datos es muy reducido (tres tablas), lo que limita la variedad de estructuras cubiertas.
- Licencia apache-2.0 en el adaptador, pero el modelo base puede tener sus propias condiciones; conviene verificar la licencia de unsloth/gemma-4-12b-it antes de un uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion por parte de la comunidad ni mantenimiento evidente.
- El autor define Ken como un lenguaje experimental (version 0.1); no es un estandar consolidado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/djchali/kenlang-gemma-4-12b-it-lora-v2
- Modelo base: https://huggingface.co/unsloth/gemma-4-12b-it
- Codigo fuente de Ken y herramientas de entrenamiento: https://github.com/rafal-chalimoniuk/kenlang
