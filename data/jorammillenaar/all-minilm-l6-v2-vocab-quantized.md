# JoramMillenaar/all-MiniLM-L6-v2-vocab-quantized

## Resumen

JoramMillenaar/all-MiniLM-L6-v2-vocab-quantized es una reexportacion en ONNX del modelo de embeddings de frases sentence-transformers/all-MiniLM-L6-v2, preparada especificamente para ejecutarse con Transformers.js sobre el proveedor de ejecucion WebGPU. El autor es JoramMillenaar y el artefacto se distribuye bajo licencia Apache 2.0. No es un modelo nuevo: es una version optimizada para inferencia en navegador y en entornos JavaScript del conocido encoder BERT de 6 capas y 22,7 millones de parametros de Sentence Transformers.

La innovacion tecnica del artefacto esta en su estrategia de cuantizacion: en lugar de cuantizar toda la red (como hace la exportacion int8 dinamica de Xenova), solo se cuantiza la tabla de embeddings de palabras (el vocabulario). Esta se almacena como uint8 con cuantizacion por bloques (`com.microsoft::GatherBlockQuantized`, asimetrica y con puntos cero a lo largo del eje oculto), mientras que el resto de la red (atencion, FFN, LayerNorm y embeddings de posicion) permanece en fp32 o fp16. El resultado es un grafo sin operadores `QuantizeLinear`, `DynamicQuantizeLinear`, `QLinearMatMul` ni `MatMulInteger`, de modo que todos los nodos de computo se colocan en WebGPU.

El modelo es relevante para desarrolladores que necesitan generar embeddings de frases, calcular similitud semantica o construir busqueda vectorial y RAG directamente en el cliente (navegador o Node.js), sin enviar datos a un servidor. Su tamano reducido (entre 28,6 MB y 55,7 MB segun variante) y su alta fidelidad respecto al modelo fp32 original (coseno de hasta 0,99999) lo convierten en una opcion practica para inferencia local en GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base: all-MiniLM-L6-v2) |
| Parametros totales | 22,7 M (modelo base MiniLM-L6-v2) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (max_seq_length del modelo base) |
| Tipos de cuantizacion | Solo tabla de vocabulario: 8 bits (bloque 128) o 4 bits (bloque 32), uint8 bloque-cuantizado; resto fp32/fp16. Variante CPU int8 dinamica completa |
| Idiomas soportados | no disponible (el modelo base esta orientado a ingles; la validacion cubre ademas aleman, frances, espanol, chino, japones y ruso) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (5 ficheros: model_vocab8.onnx, model_vocab8_fp16.onnx, model_vocab4.onnx, model_vocab4_fp16.onnx, model_quantized.onnx) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base sentence-transformers/all-MiniLM-L6-v2: un encoder BERT de 6 capas con representacion de frases obtenida mediante pooling (mean pooling) y normalizacion, orientado a la extraccion de features. El artefacto no modifica el entrenamiento ni los pesos originales mas alla del proceso de conversion a ONNX y de la cuantizacion selectiva del vocabulario. La conversion parte de la exportacion ya existente de Xenova/all-MiniLM-L6-v2 y se reempaqueta para Transformers.js.

La innovacion tecnica es la cuantizacion restringida a la tabla de embeddings de palabras. Se emplea el operador `com.microsoft::GatherBlockQuantized` (cuantizacion asimetrica por bloques con cero points, a lo largo del eje oculto), con tamano de bloque 128 para la variante de 8 bits y 32 para la de 4 bits. El resto del grafo —atencion, FFN, LayerNorm y embeddings de posicion/tipo de token— permanece en fp32 o fp16. Esta decision evita los operadores de cuantizacion dinamica (`DynamicQuantizeLinear`, `MatMulInteger`) que impiden la ejecucion en WebGPU. Segun el autor, verificado con onnxruntime-web 1.31 (la version que incluye Transformers.js 4.3), todos los nodos de computo de los grafos `model_vocab*` se asignan a `WebGpuExecutionProvider`, quedando solo 7 pequenos nodos int64 de forma en CPU (los mismos que ya usaba la exportacion fp32 original).

Las entradas son `int64` y la salida `last_hidden_state` es `float32` en todas las variantes, incluidas las fp16.

## Capacidades

- Generacion de embeddings de frases y oraciones (feature extraction) con pooling mean y normalizacion.
- Calculo de similitud semantica entre textos mediante similitud coseno.
- Recuperacion semantica y busqueda vectorial (semantic search) sobre indices de embeddings.
- Agrupamiento (clustering) y deduplicacion de textos por cercanía semantica.
- Deteccion de duplicados y near-duplicates.
- Ejecucion local en navegador y Node.js mediante Transformers.js.
- Aceleracion por GPU via WebGPU (con el proveedor WASM como respaldo en CPU).
- NO soporta generacion de texto, razonamiento multi-paso, tool calling ni function calling.
- NO dispone de modo thinking, vision, audio ni otras capacidades multimodales.
- Capacidad multilingue limitada: el modelo base esta orientado a ingles; la validacion del autor incluye frases en varios idiomas, pero no se garantiza rendimiento uniforme fuera del ingles.

## Casos de uso

- Busqueda semantica en el navegador: indexar documentos y consultas como vectores en IndexedDB y recuperar los resultados mas cercanos sin servidor, gracias al reducido tamano del modelo (28,6-55,7 MB) y a su ejecucion en WebGPU.
- RAG en el cliente (retrieval-augmented generation): recuperar pasajes relevantes de una base local para alimentar a un LLM que corra en el propio dispositivo, evitando enviar datos sensibles a la nube.
- Deduplicacion de datasets y catalogos: calcular embeddings de registros y agrupar los que superen un umbral de coseno para eliminar near-duplicates en pipelines de datos.
- Clasificacion de tickets y mensajes: asignar etiquetas o enrutar consultas de soporte agrupando embeddings por similitud con ejemplos etiquetados, en una extension de navegador o herramienta interna.
- Recomendacion de contenido: representar articulos, productos o publicaciones como vectores y sugerir items similares a partir de la ultima interaccion del usuario.
- Moderacion y filtrado de contenido: comparar textos entrantes contra una lista de patrones problematicos usando similitud semantica, todo en local y con baja latencia.
- Analitica de feedback: agrupar comentarios de usuarios por tema para resumir los motivos de queja mas frecuentes.
- Deteccion de similitud en tiempo real: implementar autocompletado, sugerencias o avisos de "contenido parecido" mientras el usuario escribe, con inferencia en GPU local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MTEB, etc.) en la informacion disponible. El autor unicamente documenta la fidelidad de los embeddings respecto al modelo fp32 original, medida como similitud coseno del embedding de frase agrupado y normalizado, sobre 12 frases de prueba en ingles, aleman, frances, espanol, chino, japones y ruso:

| Fichero ONNX | Vocabulario | Resto del grafo | Tamano | Coseno minimo vs fp32 |
|---|---|---|---|---|
| model_vocab8.onnx | 8 bits (bloque 128) | fp32 | 55,7 MB | 0,99999 |
| model_vocab8_fp16.onnx | 8 bits (bloque 128) | fp16 | 33,9 MB | 0,99999 |
| model_vocab4.onnx | 4 bits (bloque 32) | fp32 | 51,0 MB | 0,99827 |
| model_vocab4_fp16.onnx | 4 bits (bloque 32) | fp16 | 28,6 MB | 0,99827 |
| model_quantized.onnx (CPU) | int8 (dinamica) | int8 (dinamica) | 23,0 MB | 0,97685 |

## Requisitos de hardware

- VRAM estimada para inferencia: entre 23,0 MB (variante int8 dinamica) y 55,7 MB (variante 8 bits con resto fp32), solo pesos. El consumo real depende del runtime y del tamano de lote.
- GPU recomendadas: cualquier GPU con soporte de WebGPU (integrada o dedicada). La variante fp16 requiere la extension `shader-f16` de WebGPU; si el dispositivo no la soporta, Transformers.js lanza un error y hay que usar `dtype: 'fp32'`.
- Compatibilidad con GPU de consumo: si, cabe sobradamente en cualquier GPU de consumo moderna e incluso en GPUs integradas, dado su tamano inferior a 60 MB.
- Opciones de despliegue: Transformers.js 4 o superior (navegador con `device: 'webgpu'` o `device: 'wasm'`; tambien Node.js), ONNX Runtime Web 1.31. No se distribuye en formato GGUF, por lo que no aplica a llama.cpp ni a Ollama en su forma habitual.
- Latencia y throughput estimados: no disponibles. La informacion proporcionada no incluye mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / destino | Licencia |
|---|---|---|---|---|
| JoramMillenaar/all-MiniLM-L6-v2-vocab-quantized | 22,7 M | 256 tokens | ONNX para Transformers.js (WebGPU/WASM) | Apache 2.0 |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 256 tokens | safetensors / PyTorch (servidor) | Apache 2.0 |
| Xenova/all-MiniLM-L6-v2 | 22,7 M | 256 tokens | ONNX int8 dinamica (CPU/WASM) | Apache 2.0 |
| sentence-transformers/all-MiniLM-L12-v2 | 33,4 M | 256 tokens | safetensors / PyTorch | Apache 2.0 |
| sentence-transformers/all-mpnet-base-v2 | 109 M | 384 tokens | safetensors / PyTorch | Apache 2.0 |

La diferencia clave frente a Xenova/all-MiniLM-L6-v2 es que este ultimo usa cuantizacion dinamica int8 completa (`DynamicQuantizeLinear` + `MatMulInteger`), pensada para CPU/WASM y no apta para WebGPU, mientras que el artefacto de JoramMillenaar mantiene el grafo de computo en fp32/fp16 para poder ejecutarse en GPU. Frente a los modelos base de Sentence Transformers, la ventaja es el despliegue en navegador; la desventaja, un ecosistema mas limitado (Python/servidor requiere el artefacto original).

## Limitaciones y advertencias

- No es un modelo generativo: solo produce embeddings. No puede responder preguntas, resumir ni generar texto.
- Sesgos: hereda los sesgos de all-MiniLM-L6-v2, entrenado predominantemente con datos en ingles. Fuera del ingles el rendimiento puede degradarse.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero los embeddings pueden producir similitudes enganosas en dominios muy especializados o con vocabulario tecnico.
- Limite de contexto: 256 tokens. Los textos mas largos deben truncarse o dividirse en fragmentos, lo que puede perder informacion relevante.
- Coherencia de indices: el autor advierte de que si se almacenan vectores en un indice, hay que generar todos los embeddings con el mismo fichero ONNX. Mezclar variantes introduce deriva en los vectores.
- La variante `model_quantized.onnx` (int8 dinamica) NO debe usarse con `device: 'webgpu'`, porque emplea operadores de cuantizacion dinamica incompatibles; esta pensada para CPU/WASM.
- La variante fp16 requiere soporte `shader-f16` en WebGPU; no todos los dispositivos lo ofrecen.
- No existe `onnx/model.onnx`, por lo que en WebGPU es obligatorio pasar `model_file_name` de forma explicita.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar los avisos de licencia y atribucion del modelo base.
- Modelo de bajisima adopcion en el momento de la ficha (11 descargas, 0 likes), lo que implica poca validacion externa y menor soporte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoramMillenaar/all-MiniLM-L6-v2-vocab-quantized
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Exportacion origen: https://huggingface.co/Xenova/all-MiniLM-L6-v2
- Documentacion de Transformers.js: https://huggingface.co/docs/transformers.js
- Repositorio de Transformers.js: https://github.com/huggingface/transformers.js
