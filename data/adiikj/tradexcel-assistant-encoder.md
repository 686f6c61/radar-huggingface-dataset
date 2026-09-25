# adiikj/tradexcel-assistant-encoder

## Resumen

TradeXcel assistant encoder es un codificador de frases de 22 millones de parametros publicado por el usuario adiikj, afinado a partir de sentence-transformers/all-MiniLM-L6-v2. Su funcion es alimentar el asistente integrado de TradeXcel, un simulador gamificado de trading de acciones: una unica incrustacion (embedding) de 384 dimensiones del mensaje del usuario sirve simultaneamente para dos tareas, recuperar la tarjeta de ayuda o educacion que responde a la consulta (142 tarjetas en total) y clasificar la intencion del mensaje en una de 13 categorias mediante una cabeza de regresion logistica.

La relevancia del modelo no esta en su tamano, sino en su planteamiento de despliegue: no interviene ningun LLM alojado. El modelo se ejecuta en Node.js a traves de transformers.js sobre una maquina virtual de 1 vCPU y 1 GB de RAM, con una latencia de 5,7 ms p50 por consulta en ONNX fp32 sobre un solo hilo de CPU. Es, por tanto, un ejemplo de arquitectura RAG ligera y determinista para asistentes de producto con recursos muy limitados.

Se distribuye con licencia Apache 2.0, solo soporta ingles y esta especializado en el contenido de TradeXcel, por lo que no debe considerarse un codificador de proposito general. El repositorio ocupa 0,1 GB e incluye el export ONNX fp32, un export INT8 cuantizado que no supero el umbral de precision, y un fichero de configuracion de enrutado con los pesos de la cabeza de intenciones y los patrones regex de guarda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (derivado de all-MiniLM-L6-v2), con pooling de media y normalizacion L2 |
| Parametros totales | 22 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens maximo usado en entrenamiento; no se especifica la longitud maxima del modelo base |
| Tipos de cuantizacion | FP32 (ONNX opset 17, el usado en produccion) e INT8 per-channel (descartado por perdida de -4,5 R@1 en validacion) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (model.onnx fp32 y model_quantized.onnx INT8); la model card no detalla si se incluyen pesos safetensors o PyTorch |
| Dimension de la incrustacion | 384 |
| Tarea declarada | sentence-similarity / feature-extraction |
| Modelo base | sentence-transformers/all-MiniLM-L6-v2 |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo BERT con 22 millones de parametros, heredado de all-MiniLM-L6-v2, al que se anade una cabeza de clasificacion de intenciones implementada como regresion logistica (softmax de `coef · x + intercept`). La salida de 384 dimensiones se obtiene aplicando mean pooling y normalizacion L2, de modo que la similitud entre vectores se calcula con un producto escalar. Ademas del encoder, el sistema usa un fichero `tradexcel_router.json` que contiene el peso de fusion, los umbrales del enrutador, los pesos de la cabeza de intenciones y los patrones regex de guarda.

El entrenamiento se hizo exclusivamente con datos sinteticos y escritos a mano: 142 tarjetas con 1.192 preguntas parafraseadas, 9 intenciones de datos en vivo y fuera de tema cuyas plantillas se rellenaron con 258 nombres reales de acciones del NSE, y 60 ejemplos fuera de alcance. Las preguntas de las tarjetas se dividieron 70/15/15 por tarjeta y las plantillas de intencion se dividieron por plantilla antes de rellenarlas. El objetivo combino perdida contrastiva in-batch (InfoNCE, escala 20) con un negativo duro por ancla, re-minado cada epoca a partir de los vecinos erroneos mas cercanos del propio modelo; los pares de la misma tarjeta o intencion se enmascararon como negativos para no separar parafrasis. La configuracion fue AdamW, learning rate 3e-5, batch 32, 6 epocas (mejor epoca la 5, elegida en validacion) y 128 tokens maximos, con un coste total de 21 minutos en la CPU de un portatil de 4 nucleos.

## Capacidades

- Generacion de incrustaciones de frases de 384 dimensiones, comparables por similitud coseno.
- Recuperacion de respuestas sobre un corpus cerrado de 142 tarjetas de ayuda y educacion (FAQ retrieval).
- Clasificacion de intenciones en 13 categorias, entre ellas "responder desde una tarjeta", "consultar un precio en vivo", "resumir mi cartera", "rechazar: asesoramiento de inversion" y "fuera de alcance".
- Distincion entre consultas de producto, consultas de datos en vivo (con 258 nombres de acciones del NSE como plantillas) y consultas fuera de alcance.
- Clasificacion de rechazo ante peticiones de asesoramiento financiero, con una recuperacion (recall) del 95 % en el conjunto OOD, reforzada por guardas regex deterministas y tarjetas de rechazo fijas.
- Ejecucion en navegador o en Node.js mediante transformers.js, sin dependencia de un LLM alojado.
- No soporta tool calling generativo ni razonamiento multi-paso por si mismo: el modelo no produce texto libre, solo vectores e intenciones que el enrutador del producto interpreta.
- Capacidad multilingue nula: unicamente ingles.

## Casos de uso

- Asistente de ayuda dentro de una aplicacion de trading: el modelo codifica la pregunta del usuario y recupera la tarjeta de ayuda correcta entre 142, con un R@1 del 69,2 % en el conjunto de test y del 77,3 % en el conjunto OOD, suficiente para un flujo de "respuesta sugerida" con confirmacion.
- Enrutado de intenciones en produccion: la cabeza de regresion logistica clasifica el mensaje en 13 intenciones (macro-F1 de 78,5 en test y 76,5 en OOD) y decide si hay que consultar un precio en vivo, resumir la cartera o derivar a una tarjeta estatica.
- Cumplimiento normativo y filtrado de asesoramiento: la intencion de rechazo, con un recall del 95 % en OOD y respaldada por guardas regex, bloquea peticiones de recomendacion de inversion antes de que lleguen a cualquier componente generativo.
- Desambiguacion con "quisas decir...": cuando la similitud queda por debajo del umbral, el enrutador puede ofrecer la tarjeta candidata en lugar de responder, un camino que en OOD resulta util en el 80,6 % de los casos.
- Despliegue en infraestructura minima: al caber en 1 vCPU y 1 GB de RAM y responder en 5,7 ms p50 en ONNX fp32 sobre un solo hilo, permite servir el asistente en una VM barata o incluso en el cliente mediante transformers.js.
- Búsqueda semantica sobre documentacion propia: cualquier equipo con un corpus cerrado de articulos o entradas de FAQ puede replicar el esquema de entrenamiento (pares pregunta-tarjeta + negativos duros) para su propio dominio en minutos de CPU.
- Prefiltrado antes de un LLM mayor: usar el encoder como primera etapa para decidir si una consulta merece una llamada a un modelo generativo, reduciendo coste y latencia en el 80 % de los casos que ya cubren las tarjetas.
- Investigacion sobre evaluacion OOD: el conjunto `test_ood` de 310 preguntas en 8 estilos (telegrafico, con erratas, divagante, formal, jerga, adversarial, etc.) es un recurso util para medir la robustez de codificadores pequenos frente a cambios de estilo.

## Benchmarks y rendimiento

Resultados publicados en la model card. Las columnas val, test y OOD corresponden a validacion, test y al conjunto OOD escrito a mano (310 preguntas, 8 estilos). Los conjuntos de test no se usaron para ajustar hiperparametros.

| Metrica (val / test / OOD) | Preentrenado | Fine-tuned |
|---|---:|---:|
| Retrieval R@1 | 62,2 / 63,5 / 77,3 | 66,7 / 69,2 / 77,3 |
| Intent macro-F1 | 70,1 / 71,6 / 73,8 | 82,5 / 78,5 / 76,5 |
| Router completo en OOD: correcto / util / erroneo | 53,2 / 72,9 / 17,4 | 63,9 / 80,6 / 16,5 |
| Router completo en OOD: recall de rechazo | 85,0 | 95,0 |

Referencias adicionales aportadas por el autor: la busqueda por palabras clave (BM25) alcanza un R@1 de 65,7 en OOD, y un bge-small afinado (33 millones de parametros) obtiene cifras similares pero se ejecuta el doble de lento. En cuanto a latencia, el export ONNX fp32 codifica una consulta en 5,7 ms p50 en un solo hilo de CPU, frente a 13,5 ms con PyTorch. Los informes completos, curvas de aprendizaje y listas de fallos estan en `ml/reports/` del repositorio del autor (no enlazado en la model card).

## Requisitos de hardware

- VRAM estimada: aproximadamente 88 MB en fp32 y unos 22 MB en INT8, calculados a partir de los 22 millones de parametros; el repositorio completo ocupa 0,1 GB.
- No requiere GPU: el autor lo ejecuta en una VM de 1 vCPU y 1 GB de RAM.
- GPU compatibles: cualquier GPU, incluida una RTX 4090 o inferior, aunque resulta innecesaria; no se publican cifras para A100 o H100.
- Cabe holgadamente en cualquier GPU de consumo e incluso en CPU de portatil de 4 nucleos, donde el entrenamiento completo tardo 21 minutos.
- Opciones de despliegue: transformers.js en Node.js o navegador (ruta oficial del autor), ONNX Runtime, sentence-transformers y text-embeddings-inference (el modelo esta etiquetado como compatible con endpoints de embeddings).
- Latencia: 5,7 ms p50 por consulta en ONNX fp32 sobre un hilo de CPU; 13,5 ms con PyTorch. El throughput agregado y el comportamiento con batching no se especifican.
- Almacenamiento: los ficheros necesarios en produccion son `onnx/model.onnx`, `tokenizer.json`, `config.json` y `tradexcel_router.json`; el export INT8 no se recomienda por su perdida de precision.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| adiikj/tradexcel-assistant-encoder | 22 M | 128 tokens en entrenamiento | R@1 OOD 77,3; macro-F1 OOD 76,5; 5,7 ms p50 en CPU | Apache 2.0 | HuggingFace, ONNX + transformers.js |
| sentence-transformers/all-MiniLM-L6-v2 (base) | 22 M | No disponible en la informacion proporcionada | R@1 OOD 77,3; macro-F1 OOD 73,8 antes del ajuste | Apache 2.0 | HuggingFace |
| bge-small afinado | 33 M | No disponible en la informacion proporcionada | Similar al modelo descrito, pero el doble de lento | No disponible en la informacion proporcionada | HuggingFace |
| BM25 (busqueda por palabras clave) | No aplica | No aplica | R@1 OOD 65,7 | No aplica | Implementacion estandar |

No se dispone de datos comparativos adicionales (por ejemplo, frente a otros codificadores multilingues o modelos de recuperacion de mayor tamano) en la informacion proporcionada.

## Limitaciones y advertencias

- Todos los datos de entrenamiento son sinteticos y escritos por un unico autor, por lo que las puntuaciones estan infladas: el ajuste fino mejoro mucho las particiones de la misma distribucion pero no el conjunto OOD, donde el R@1 de recuperacion no subio respecto al modelo preentrenado.
- El conjunto OOD es mas facil que el val o el test (77,3 frente a 66,7 y 69,2 en R@1), lo que sugiere que no representa bien las consultas reales; el propio autor senala que las preguntas de usuarios reales seran la proxima prueba.
- El clasificador de rechazo no es perfecto (95 % de recall en OOD); en produccion depende de guardas regex deterministas y tarjetas de rechazo fijas, y nunca genera texto libre.
- El modelo es solo en ingles y esta especializado en el contenido de TradeXcel; no es un codificador de proposito general y su utilidad fuera de ese dominio esta por demostrar.
- El modelo nunca ofrece asesoramiento de inversion: los rechazos son respuestas predefinidas.
- La cuantizacion INT8 incluida no supera el umbral de precision (-4,5 R@1 en validacion), por lo que no debe usarse en produccion pese a estar en el repositorio.
- Riesgo de alucinacion bajo en el sentido generativo, porque el modelo no produce texto, pero si existe riesgo de recuperar la tarjeta equivocada o de clasificar mal una intencion cuando la formulacion se aleja de los estilos vistos.
- La licencia Apache 2.0 permite uso comercial, incluido el modelo base del que deriva, pero el corpus de tarjetas y las plantillas de intenciones son especificos del producto y no se distribuyen.
- Con solo 0 descargas y 1 "me gusta" en el momento de la consulta, no hay evidencia de uso en produccion por terceros ni validacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adiikj/tradexcel-assistant-encoder
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Documentacion de transformers.js: https://huggingface.co/docs/transformers.js
- Repositorio del autor con los informes de evaluacion (`ml/reports/`): mencionado en la model card pero sin URL publica en la informacion disponible.
- Resultados de la busqueda web: ninguna de las paginas devueltas (RapidToolSet, TradersPost, For Traders, Autodesk, Artificial Analysis) guarda relacion con este modelo, por lo que no se incluyen como enlaces relevantes.
