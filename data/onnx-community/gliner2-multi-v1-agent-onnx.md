# onnx-community/gliner2-multi-v1-agent-ONNX

## Resumen

GLiNER2 multi v1 agent ONNX es una exportacion a ONNX del modelo fastino/gliner2-multi-v1, construido sobre mDeBERTa-v3-base, que empaqueta en un unico grafo dos tareas distintas: la extraccion de entidades zero-shot y la clasificacion de texto contra etiquetas definidas en tiempo de ejecucion. Lo publica la organizacion onnx-community y esta pensado para ejecutarse integramente en el navegador mediante Transformers.js sobre WebGPU, sin enviar texto a un servidor.

El modelo resuelve un problema muy concreto: un agente de navegador necesita, por un lado, extraer valores de un objetivo declarado en lenguaje natural (por ejemplo, campos de un vuelo) y, por otro, puntuar los controles de la pagina contra ese objetivo para decidir con cual interactuar. Ambas llamadas las sirve el mismo grafo, con cabeceras de clasificacion, conteo y spans. El modelo original lo desarrollo Fastino bajo licencia Apache-2.0 y las llamadas de agente que cubre esta exportacion provienen del proyecto gliner2-ultrafast (MIT).

Es relevante porque demuestra que un extractor de entidades multilingue tipo encoder, de tamano contenido, puede desplegarse en el cliente con latencias de decenas de milisegundos: en un Apple M3 Pro con WebGPU y fp16 se miden 35-37 ms por extraccion con nueve tipos de entidad y 43-44 ms por clasificacion con doce etiquetas. El repositorio ocupa 1,9 GB e incluye dos variantes ONNX: fp16 de 614 MB para WebGPU y fp32 de 1,23 GB como referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (mDeBERTa-v3-base) exportado como grafo ONNX unico con cabeceras de clasificacion, conteo y spans |
| Parametros totales | no disponible (el modelo base es mDeBERTa-v3-base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la model card no especifica una secuencia maxima; el procesador GLiNER2 construye el prompt con marcadores `[P]`, `[E]`/`[L]` y `[SEP_TEXT]`) |
| Tipos de cuantizacion | fp32 (referencia) y fp16 (WebGPU) |
| Idiomas soportados | multilingue (la verificacion de conversion cubre ingles y frances) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`onnx/model.onnx` fp32 y `onnx/model_fp16.onnx`), con datos externos en ficheros `.onnx_data` |
| Pipeline | token-classification |
| Tamano del repositorio | 1,9 GB |
| Tamano de los ficheros | 614 MB (fp16) y 1,23 GB (fp32), incluyendo datos externos |
| Libreria | transformers.js |

## Arquitectura y entrenamiento

La arquitectura subyacente es mDeBERTa-v3-base, un encoder transformer multilingue. Sobre el se anade la formulacion de GLiNER2: el procesador construye un prompt con un marcador de tarea `[P]`, descripciones de etiquetas, marcadores `[E]` para extraccion o `[L]` para clasificacion, y el texto de entrada precedido por `[SEP_TEXT]`. El grafo ONNX recibe `input_ids` y `attention_mask` con forma `[1, seq]`, ademas de dos indices auxiliares: `word_positions` `[1, words]`, que apunta al primer sub-token de cada palabra del texto, y `schema_positions` `[1, 1 + labels]`, que localiza el marcador `[P]` y cada marcador de etiqueta.

De la salida se derivan tres cabeceras. `cls_logits` `[1, labels]` es la cabeza de clasificacion aplicada sobre los marcadores, con softmax cuando la tarea es de etiqueta unica. `count_logits` `[1, 20]` estima el numero de instancias a partir de `[P]`; si el argmax es 0, la extraccion no devuelve nada. `span_logits` `[1, labels, words, 8]` contiene las puntuaciones pre-sigmoid para spans de 1 a 8 palabras. La decodificacion de entidades es la del propio runtime: sigmoid mayor o igual a 0,5, conversion de spans de palabras a caracteres y seleccion greedy por confianza sin solapamiento de caracteres.

No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; el modelo base lo entreno Fastino. La innovacion tecnica de esta publicacion es de despliegue, no de entrenamiento: exportar en un unico grafo las dos llamadas que hace un agente de navegador y fijar el GRU de conteo a una sola iteracion, ya que la extraccion solo lee la instancia 0 y el script `export_onnx.py` verifica que esa instancia no depende de la longitud de despliegue del GRU. La conversion se valida contra `conversion/reference.json`, con 14 llamadas registradas de la libreria Python `gliner2`: seis objetivos en ingles y frances y ocho llamadas de puntuacion de controles sobre paginas de busqueda de vuelos y de mapas.

## Capacidades

- Extraccion de entidades zero-shot con tipos de entidad definidos en tiempo de ejecucion, sin reentrenamiento.
- Clasificacion de texto zero-shot contra un conjunto de etiquetas arbitrario, con softmax cuando la tarea tiene una sola etiqueta.
- Puntuacion de controles de interfaz contra un objetivo declarado, orientada a agentes de navegador.
- Procesamiento multilingue; la verificacion de paridad cubre explicitamente ingles y frances.
- Ejecucion integra en el navegador con Transformers.js sobre WebGPU, sin llamadas a servidor.
- Lectura de spans de 1 a 8 palabras y estimacion del numero de instancias (hasta 20 en `count_logits`).
- No dispone de tool calling, function calling, generacion de texto, vision, audio ni modo de razonamiento: es un modelo discriminativo de etiquetado y clasificacion.

## Casos de uso

- Agente de navegador autonomo: el caso para el que fue creado (Zipline). El agente usa `extract_entities` para sacar valores del objetivo del usuario y `classify` para puntuar los controles de la pagina; ambas llamadas las sirve el mismo grafo, con 35-37 ms y 43-44 ms respectivamente en un Apple M3 Pro con WebGPU fp16.
- Rellenado automatico de formularios web: extraer de un texto libre campos como origen, destino o fecha y mapearlos a los controles del formulario, todo en el cliente.
- Extraccion de entidades con privacidad por diseno: al correr en el navegador, los documentos del usuario no se envian a ningun servidor, lo que encaja en sectores con requisitos estrictos de tratamiento de datos.
- Redaccion de datos personales antes de enviar texto a un servicio externo: detectar nombres, direcciones o identificadores y sustituirlos antes de la transmision.
- Enrutado de tickets de soporte multilingue: clasificar el mensaje del usuario contra un conjunto de categorias definidas por el equipo y derivarlo al flujo correspondiente en el propio cliente.
- Etiquetado por lotes en servidor con onnxruntime: usar el grafo fp32 o fp16 desde Python o C++ para procesar corpus grandes sin depender de la pila de PyTorch.
- Automatizacion de pruebas end-to-end sobre interfaces web: localizar el control adecuado segun una descripcion en lenguaje natural y reducir la fragilidad de los selectores basados en CSS o XPath.
- Normalizacion de datos de entrada en front-end: detectar y clasificar campos en formularios o correos antes de persistirlos en el sistema de destino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni metricas estandar de NER). Lo unico verificable son las pruebas de paridad frente a la referencia Python y las latencias medidas.

| Prueba | fp32 | fp16 |
|---|---|---|
| Llamadas con entidades identicas y etiqueta top identica | 14/14 | 14/14 |
| Peor delta en probabilidad de `classify` | 1e-5 | 3,3e-3 |
| Peor delta en confianza de entidad | 5e-7 | 1,3e-4 |

| Escenario | Medicion |
|---|---|
| Extraccion con nueve tipos de entidad, WebGPU fp16 en Apple M3 Pro | 35-37 ms por llamada |
| Clasificacion con doce etiquetas, WebGPU fp16 en Apple M3 Pro | 43-44 ms por llamada |
| Reproduccion de token ids en el runtime JavaScript | exacta respecto a la referencia Python |

## Requisitos de hardware

- Las cifras de memoria que siguen son estimaciones derivadas del tamano de los ficheros de pesos, no datos publicados por el autor: fp16 ocupa 614 MB y fp32 1,23 GB, por lo que cabe esperar un consumo de VRAM de aproximadamente 0,7-1,2 GB y 1,3-2 GB respectivamente, sumando activaciones y buffers del runtime.
- Al ser un encoder de tamano base, cabe con holgura en GPU de consumo (RTX 3060/4060/4090 y similares) y en GPU integradas de Apple Silicon; el objetivo declarado es WebGPU en el navegador.
- No requiere GPU de centro de datos; A100 o H100 solo tendrian sentido para procesamiento por lotes a gran escala.
- Opciones de despliegue: Transformers.js con WebGPU en el navegador, onnxruntime en Python o C++, y cualquier runtime compatible con ONNX que soporte los datos externos. No aplican vLLM, TGI, llama.cpp ni Ollama, porque no es un modelo generativo de lenguaje.
- Latencia conocida: 35-37 ms por extraccion de nueve tipos de entidad y 43-44 ms por clasificacion de doce etiquetas en WebGPU fp16 sobre Apple M3 Pro. No se publican datos de throughput en lote ni mediciones en otras plataformas.
- El grafo fp32 de 1,23 GB actua como referencia de paridad; para produccion en navegador la variante recomendada por el autor es la fp16.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de alternativas en la informacion proporcionada, por lo que no es posible una comparacion de rendimiento rigurosa. La unica comparacion documentada es entre las variantes de esta misma publicacion y su modelo base.

| Modelo | Parametros | Contexto | Formato | Licencia | Uso previsto |
|---|---|---|---|---|---|
| onnx-community/gliner2-multi-v1-agent-ONNX (fp16) | no disponible | no disponible | ONNX fp16 | apache-2.0 | Navegador con WebGPU |
| onnx-community/gliner2-multi-v1-agent-ONNX (fp32) | no disponible | no disponible | ONNX fp32 | apache-2.0 | Referencia y servidor |
| fastino/gliner2-multi-v1 | no disponible (mDeBERTa-v3-base) | no disponible | no disponible | apache-2.0 | Modelo base en PyTorch |
| Otros modelos de NER zero-shot | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No hay benchmarks publicados: la unica validacion es la paridad numerica frente a las 14 llamadas de referencia, no una evaluacion de calidad en tareas abiertas.
- El repositorio registra 0 descargas y 0 likes, por lo que no cuenta con validacion de la comunidad.
- La extraccion de entidades solo lee la instancia 0, ya que el GRU de conteo se despliega una unica vez. En la practica esto limita la salida a una instancia por etiqueta, aunque `count_logits` permita estimar un numero mayor.
- `count_logits` tiene 20 posiciones, lo que acota el numero de instancias consideradas.
- La decodificacion usa un umbral fijo de sigmoid mayor o igual a 0,5 y descarta spans con solapamiento de caracteres; no hay margen de ajuste sin reimplementar el decodificador.
- Los spans se limitan a un maximo de 8 palabras, lo que puede truncar entidades largas.
- La clasificacion devuelve una sola etiqueta con softmax cuando la tarea es de etiqueta unica.
- El modelo declara soporte multilingue, pero la verificacion de conversion solo cubre ingles y frances; no hay evidencias publicadas para otros idiomas.
- Riesgo de extraccion espuria: al ser zero-shot, etiquetas ambiguas o mal descritas producen detecciones falsas sin que exista una senal de confianza calibrada mas alla del sigmoid.
- Es un modelo discriminativo: no genera texto, no razona paso a paso y no soporta tool calling.
- Licencia Apache-2.0, que permite uso comercial con las obligaciones habituales de atribucion y conservacion de avisos. El modelo base lo publica Fastino tambien bajo Apache-2.0 y las llamadas de agente que cubre la exportacion provienen de gliner2-ultrafast, bajo licencia MIT.
- Las fechas del repositorio (creacion y actualizacion el 25 de septiembre de 2026) no son coherentes con la fecha actual; conviene verificar la procedencia y la integridad de los ficheros antes de usarlos en produccion.
- La ejecucion depende de un runtime ONNX con soporte de datos externos y, para el objetivo declarado, de WebGPU en el navegador del usuario; en equipos sin WebGPU es necesario un camino alternativo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/onnx-community/gliner2-multi-v1-agent-ONNX
- Modelo base: https://huggingface.co/fastino/gliner2-multi-v1
- Documentacion de Transformers.js: https://huggingface.co/docs/transformers.js
- Fastino (autor del modelo original): https://fastino.ai
- Repositorio GLiNER2: https://github.com/fastino-ai/GLiNER2
- Repositorio gliner2-ultrafast (llamadas de agente, MIT): https://github.com/sahibzada-allahyar/gliner2-ultrafast
