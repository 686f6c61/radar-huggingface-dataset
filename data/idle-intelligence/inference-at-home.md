# idle-intelligence/inference-at-home

## Resumen

`inference-at-home` es un repositorio de clasificadores de texto de pequeno tamano desarrollado por idle-intelligence para el proyecto Hive, un enjambre de modelos de lenguaje pequenos que se ejecutan en pestanas de navegador. Cada clasificador se ejecuta en el navegador, sobre CPU, mediante WebAssembly, y su funcion es decidir que hacer con un mensaje antes de que un modelo de lenguaje lo responda. El repositorio contiene dos clasificadores independientes, cada uno en su propia carpeta con pesos, configuracion y tokenizer.

El clasificador principal, `swarm-8x8`, asigna cada mensaje a una de 64 celdas tematicas (8 dominios con 8 sujetos cada uno) para que el Hive pueda archivar y recuperar respuestas por celda. Se basa en BAAI/bge-small-en-v1.5, con 33 millones de parametros y pesos en int8, ocupando 34 MB. El segundo clasificador, `intent`, asigna mensajes a una de cuatro intenciones (`swarm`, `time`, `weather` u `other`) y se basa en prajjwal1/bert-mini, con 11 millones de parametros en float32 y 43 MB.

La relevancia de este modelo reside en su enfoque de despliegue: inferencia de clasificacion en el cliente, sin servidor, dentro de una pestana de navegador. Esto lo hace adecuado para arquitecturas de agentes ligeros donde el enrutamiento previo de mensajes debe resolverse con latencia minima y sin coste de infraestructura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (clasificacion de secuencias); `swarm-8x8` con dos cabezas, `intent` con `BertForSequenceClassification` |
| Parametros totales | `swarm-8x8`: 33 millones; `intent`: 11 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | `swarm-8x8`: int8 con escalas por fila; `intent`: float32 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 (modelos base con licencia MIT) |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json` y `tokenizer.json` por carpeta |

## Arquitectura y entrenamiento

Ambos clasificadores son modelos BERT de clasificacion de secuencias. `swarm-8x8` parte de BAAI/bge-small-en-v1.5 (33 millones de parametros) y se ha adaptado con dos cabezas de clasificacion y pesos cuantizados a int8 con escalas por fila; su README documenta el formato y ofrece un ejemplo en Python para leerlo. `intent` parte de prajjwal1/bert-mini (11 millones de parametros) y es un checkpoint estandar `BertForSequenceClassification` con 4 etiquetas en float32.

El entrenamiento se realizo con el codigo de `hive-ml-classifier`. Para `intent` se generaron 1.508 ejemplos y se evaluo sobre una parte reservada del mismo conjunto generado. Para `swarm-8x8` la evaluacion se realizo sobre preguntas reales y sobre preguntas generadas de estilo Hive, con 64 etiquetas y una lista de celdas aceptables por mensaje. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO.

La innovacion tecnica destacable es el formato de pesos: `swarm-8x8` no es un checkpoint estandar, sino que emplea dos cabezas y cuantizacion int8 con escalas por fila, pensado para su lectura desde el crate `swarm-classifier` de hive-client y su ejecucion en WebAssembly en el navegador.

## Capacidades

- Clasificacion de texto en 64 celdas tematicas (8 dominios x 8 sujetos) con `swarm-8x8`.
- Clasificacion de intencion en 4 categorias (`swarm`, `time`, `weather`, `other`) con `intent`.
- Ejecucion en el navegador sobre CPU mediante WebAssembly, sin servidor.
- Lectura de la lista de etiquetas desde `config.json` (`id2label`), no desde una lista fija en codigo.
- Carga de los pesos con cualquier lector de safetensors.
- Enrutamiento previo de mensajes antes de la respuesta de un modelo de lenguaje.
- Solo ingles; no se documentan capacidades multilingues, tool calling, agentes, vision ni audio.

## Casos de uso

- Enrutamiento de mensajes en un asistente conversacional: `swarm-8x8` clasifica cada mensaje entrante en una de las 64 celdas tematicas antes de que un modelo de lenguaje lo responda, lo que permite archivar y recuperar respuestas por celda sin coste de servidor.
- Deteccion de intencion en el cliente: `intent` distingue entre peticiones de tipo `swarm`, `time`, `weather` u `other`, de modo que la pagina puede decidir si invoca un modelo, consulta la hora o el tiempo, o responde de otra forma.
- Despliegue sin infraestructura: al ejecutarse en WebAssembly sobre CPU en la pestana del navegador, el clasificador elimina la necesidad de endpoints de inferencia y reduce la latencia de red a cero para el paso de clasificacion.
- Filtrado y organizacion de preguntas en una base de conocimiento: `swarm-8x8` permite agrupar preguntas reales por tema para su posterior recuperacion, con una tasa del 78,3% de asignacion a celdas aceptadas sobre 4.000 preguntas reales.
- Demos interactivas en pagina: `intent` se mantiene en el repositorio porque paginas que lo cargan, como la demo de clasificador en trucs.ai, siguen necesitandolo.
- Prototipado de agentes ligeros: el par de clasificadores sirve como capa de decision barata (34 MB y 43 MB) en arquitecturas de enjambre donde varios modelos pequenos colaboran en el navegador.
- Experimentacion educativa: el codigo de entrenamiento en `hive-ml-classifier` y el de ejecucion en `hive-client` permiten reproducir el pipeline completo de un clasificador BERT desplegado en WebAssembly.

## Benchmarks y rendimiento

| Clasificador | Metrica | Resultado |
|---|---|---|
| `swarm-8x8` | Preguntas reales asignadas a celda aceptada (sobre 4.000) | 78,3% |
| `swarm-8x8` | Preguntas de estilo Hive asignadas a celda aceptada (sobre 2.091) | 82,8% |
| `intent` | Precision (accuracy) en parte reservada de 1.508 ejemplos generados | 94,4% |
| `intent` | F1 ponderado en la misma evaluacion | 94,3% |

Los dos resultados no son comparables entre si: `intent` se evaluo sobre una parte reservada del mismo conjunto generado que sus datos de entrenamiento, con cuatro etiquetas gruesas; `swarm-8x8` se evaluo sobre preguntas reales y preguntas generadas por separado, con 64 etiquetas y una lista de celdas aceptables por mensaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario previsto; la inferencia se ejecuta en CPU dentro del navegador mediante WebAssembly.
- Tamano en disco: 34 MB para `swarm-8x8` (int8) y 43 MB para `intent` (float32); el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: no disponible; el diseno no requiere GPU.
- Cabe en cualquier equipo capaz de ejecutar un navegador moderno con WebAssembly.
- Opciones de despliegue: crate `swarm-classifier` de hive-client para ejecucion en pagina; cualquier lector de safetensors para uso fuera del navegador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `swarm-8x8` (este repo) | 33 M | no disponible | Clasificacion en 64 celdas | Apache-2.0 | Hugging Face |
| `intent` (este repo) | 11 M | no disponible | Clasificacion en 4 intenciones | Apache-2.0 | Hugging Face |
| BAAI/bge-small-en-v1.5 | 33 M | no disponible | Embeddings de texto | MIT | Hugging Face |
| prajjwal1/bert-mini | 11 M | no disponible | Modelo base BERT | MIT | Hugging Face |

La comparativa se limita a los modelos base declarados por el autor, ya que no se dispone de informacion sobre alternativas equivalentes de clasificacion en navegador con las que contrastar rendimiento.

## Limitaciones y advertencias

- Solo admite ingles; no se documenta soporte de otros idiomas.
- Los dos clasificadores tienen conjuntos de etiquetas distintos y no son intercambiables; las etiquetas deben leerse de `config.json` (`id2label`) y no de una lista fija en codigo.
- Los resultados de `intent` (94,4% de precision) proceden de una parte reservada del mismo conjunto generado que los datos de entrenamiento, por lo que pueden sobreestimar el rendimiento en datos reales.
- `swarm-8x8` asigna el 78,3% de 4.000 preguntas reales a una celda aceptada, lo que implica que en torno al 21,7% de las preguntas reales no caen en una celda aceptada.
- No se dispone de informacion sobre sesgos conocidos ni sobre riesgo de alucinacion; al ser clasificadores, el riesgo principal es la clasificacion erronea.
- No se documenta la longitud de contexto soportada.
- Licencia Apache-2.0 para los clasificadores; los modelos base tienen licencia MIT, lo que permite uso comercial, pero conviene verificar las condiciones de los modelos base por separado.
- `swarm-8x8` no es un checkpoint estandar: requiere un lector que soporte su formato de dos cabezas con int8 y escalas por fila.

## Enlaces

- Hugging Face: https://huggingface.co/idle-intelligence/inference-at-home
- Codigo de entrenamiento: https://github.com/idle-intelligence/hive-ml-classifier
- Codigo de ejecucion en pagina: https://github.com/idle-intelligence/hive-client
- Modelo base `swarm-8x8`: https://huggingface.co/BAAI/bge-small-en-v1.5
- Modelo base `intent`: https://huggingface.co/prajjwal1/bert-mini
- Demo de clasificador: https://trucs.ai
