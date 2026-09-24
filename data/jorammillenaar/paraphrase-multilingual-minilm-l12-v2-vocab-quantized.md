# JoramMillenaar/paraphrase-multilingual-MiniLM-L12-v2-vocab-quantized

## Resumen

Este repositorio contiene una conversion a ONNX del modelo de embeddings de frases `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, publicada por el usuario JoramMillenaar y pensada especificamente para el proveedor de ejecucion WebGPU de `onnxruntime-web` a traves de Transformers.js. No es un modelo nuevo entrenado desde cero: es una reinterpretacion del export de Xenova en la que solo la tabla de embeddings de vocabulario se cuantiza en bloques (`com.microsoft::GatherBlockQuantized`, asimetrica, con zero points, sobre el eje oculto), mientras que attention, FFN, LayerNorm y los embeddings de posicion y de tipo de token permanecen en fp32 o fp16. El objetivo es que todos los nodos de computo caigan en `WebGpuExecutionProvider` en lugar de repartirse entre GPU y CPU.

La relevancia de esta ficha es practica: el export dinamico int8 habitual de la familia Xenova usa `DynamicQuantizeLinear` y `MatMulInteger`, operadores que fuerzan ejecucion en CPU y degradan el rendimiento en navegador. Al aislar la cuantizacion en la tabla de vocabulario, el autor consigue grafos sin esos nodos y con una deriva de similitud coseno practicamente nula respecto al modelo fp32 original (1.00000 para la variante de 8 bits con el resto en fp32). El precio es un modelo no generativo, de extraccion de caracteristicas, con 10 descargas y 0 likes en el momento de la consulta, orientado a busqueda semantica y similitud de frases en el cliente.

El paquete ofrece cinco variantes de pesos entre 98,8 MB y 186,0 MB, con licencia Apache 2.0 heredada del modelo base. La informacion publicada no incluye numero de parametros, longitud de contexto ni lista cerrada de idiomas, por lo que esas filas se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (familia MiniLM-L12), exportado a ONNX para extraccion de caracteristicas |
| Parametros totales | no disponible en la informacion proporcionada (el identificador MiniLM-L12 indica 12 capas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Vocabulario en uint8 block-quantized (bloque 128, asimetrica, con zero points) o 4 bits (bloque 32); resto del grafo en fp32 o fp16; fallback CPU con int8 dinamico en todo el grafo |
| Idiomas soportados | no disponible; las pruebas de similitud coseno del autor cubren ingles, aleman, frances, espanol, chino, japones y ruso |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (5 ficheros: `model_vocab8.onnx`, `model_vocab8_fp16.onnx`, `model_vocab4.onnx`, `model_vocab4_fp16.onnx`, `model_quantized.onnx`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, un encoder transformer de tipo BERT destilado (MiniLM) que produce embeddings de frase mediante pooling y normalizacion. Esta publicacion no entrena ni ajusta nada: parte del export ONNX de `Xenova/paraphrase-multilingual-MiniLM-L12-v2` y reescribe la representacion de la tabla de vocabulario. En las variantes `model_vocab*`, esa tabla se almacena como uint8 con cuantizacion por bloques (bloque 128 para 8 bits, bloque 32 para 4 bits), asimetrica y con zero points, sobre el eje oculto, invocada mediante el operador `com.microsoft::GatherBlockQuantized`. El resto de la red (attention, FFN, LayerNorm, embeddings de posicion y de tipo de token) se mantiene en fp32 o fp16. Las entradas son `int64` y la salida `last_hidden_state` es siempre `float32`, en todas las variantes.

La innovacion tecnica concreta es la ausencia total de operadores `QuantizeLinear`, `DynamicQuantizeLinear`, `QLinearMatMul` y `MatMulInteger` en los grafos `model_vocab*`. Segun el autor, verificado con onnxruntime-web 1.31 (la version que incluye Transformers.js 4.3), todos los nodos de computo de esos grafos se asignan a `WebGpuExecutionProvider`; los unicos nodos en CPU son siete nodos pequenos de forma `int64` (el `Unsqueeze`/`Cast` de la mascara de attention y los `Shape`/`Gather`/`Slice` de los position ids), que ORT coloca en CPU de forma deliberada, igual que hace el export fp32 original. No hay datos publicados sobre el dataset de entrenamiento, el numero de tokens o el uso de RLHF/DPO, porque este repositorio no reentrena el modelo.

## Capacidades

- Extraccion de caracteristicas (embeddings de frase) con pooling y normalizacion opcionales, mediante el pipeline `feature-extraction` de Transformers.js.
- Similitud semantica de frases (`sentence-similarity`), incluyendo recuperacion de parafrasis.
- Multilingue en la practica: el autor valida con frases en ingles, aleman, frances, espanol, chino, japones y ruso, aunque no publica la lista oficial de idiomas del modelo base.
- Ejecucion en navegador con WebGPU, sin nodos de computo en CPU en las variantes `model_vocab*`.
- Fallback a CPU/WASM mediante `model_quantized.onnx` (int8 dinamico) para entornos sin WebGPU.
- Variantes de 8 y 4 bits con bloque 128 y 32 respectivamente, y eleccion de fp32 o fp16 para el resto del grafo.
- No es un modelo generativo: no hace generacion de texto, razonamiento, codigo, tool calling ni uso de agentes.
- No tiene modo thinking, vision ni audio.

## Casos de uso

- Busqueda semantica en el navegador: indexar documentos y consultas como vectores con `pooling: 'mean'` y `normalize: true`, usando `model_vocab4_fp16` (98,8 MB) para minimizar la descarga inicial del cliente.
- Deteccion de duplicados y near-duplicates: comparar embeddings normalizados con similitud coseno para agrupar noticias, tickets o comentarios repetidos sin enviar texto a un servidor.
- Clasificacion de texto por similitud a prototipos: calcular el embedding de cada clase y asignar la etiqueta del prototipo mas cercano, util en moderacion de contenido o triaje de mensajes.
- Sistemas de recomendacion ligera: representar items y preferencias del usuario como vectores y ordenar por producto escalar en el propio dispositivo.
- Agrupacion (clustering) de encuestas o resenas multilingues: reducir dimensionalidad sobre los embeddings y aplicar k-means para descubrir temas recurrentes en varios idiomas.
- Recuperacion aumentada en asistentes web: usar el modelo como recuperador local sobre un corpus pequeno y enviar solo los fragmentos relevantes al modelo generativo, reduciendo coste y latencia de red.
- Preprocesado de pipelines de NLP en el borde: servir embeddings desde un worker de navegador o desde Node con WASM cuando no hay acelerador disponible.

## Benchmarks y rendimiento

La informacion disponible solo incluye la similitud coseno del embedding de frase agrupado y normalizado frente al modelo fp32 original, medida sobre 12 frases de prueba en ingles, aleman, frances, espanol, chino, japones y ruso. No hay resultados de MMLU, HumanEval, GSM8K ni de tareas de retrieval tipo MTEB.

| Fichero | Tabla de vocabulario | Resto del grafo | Tamano | Carga en Transformers.js | Similitud coseno minima vs fp32 |
|---|---|---|---|---|---|
| `onnx/model_vocab8.onnx` | 8 bits (bloque 128) | fp32 | 186,0 MB | `model_file_name: 'model_vocab8', dtype: 'fp32'` | 1.00000 |
| `onnx/model_vocab8_fp16.onnx` | 8 bits (bloque 128) | fp16 | 141,6 MB | `model_file_name: 'model_vocab8', dtype: 'fp16'` | 0.99999 |
| `onnx/model_vocab4.onnx` | 4 bits (bloque 32) | fp32 | 147,7 MB | `model_file_name: 'model_vocab4', dtype: 'fp32'` | 0.99861 |
| `onnx/model_vocab4_fp16.onnx` | 4 bits (bloque 32) | fp16 | 98,8 MB | `model_file_name: 'model_vocab4', dtype: 'fp16'` | 0.99862 |
| `onnx/model_quantized.onnx` | int8 dinamico | int8 dinamico | 118,3 MB | `dtype: 'q8'` (por defecto con `device: 'wasm'`) | 0.98849 |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el grafo mas pesado ocupa 186,0 MB en disco y el mas ligero 98,8 MB, cifra que marca el orden de magnitud del peso en memoria; el autor no publica consumo de VRAM en ejecucion.
- GPU compatibles: cualquier dispositivo con WebGPU. La variante `dtype: 'fp16'` exige que el adaptador exponga la caracteristica `shader-f16`; si no la tiene, Transformers.js lanza una excepcion y hay que usar `dtype: 'fp32'`.
- GPU de escritorio y portatiles con graficas integradas: al tratarse de un modelo de menos de 200 MB, cabe en practicamente cualquier GPU moderna, incluidos iGPU con soporte WebGPU.
- GPU de centro de datos (A100, H100, RTX 4090): no son necesarias para este modelo; la informacion no incluye mediciones sobre ellas.
- Opciones de despliegue: Transformers.js 4.x con `device: 'webgpu'` y onnxruntime-web 1.31; fallback con `device: 'wasm'` y `model_quantized.onnx`. No aplican vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo generativo ni tiene pesos GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `JoramMillenaar/paraphrase-multilingual-MiniLM-L12-v2-vocab-quantized` | ONNX para Transformers.js con WebGPU | 98,8-186,0 MB segun variante | Vocabulario en bloque (8 o 4 bits), resto fp32/fp16; fallback int8 dinamico | apache-2.0 | Repositorio HuggingFace, 10 descargas, 0 likes |
| `Xenova/paraphrase-multilingual-MiniLM-L12-v2` | ONNX para Transformers.js | 118,3 MB en la variante int8 dinamica incluida aqui | int8 dinamico en todo el grafo | apache-2.0 (heredada del modelo base) | Export de referencia, ampliamente utilizado en el ecosistema Transformers.js |
| `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` | Modelo original en safetensors/PyTorch | no disponible en la informacion proporcionada | fp32 (sin cuantizar en origen) | apache-2.0 | Modelo base, referenciado como `base_model` |

Para alternativas de la misma categoria no incluidas en la informacion proporcionada: no disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no sirve para chat, razonamiento, generacion de codigo ni tool calling, pese a que pueda confundirse con un LLM por el nombre de la familia.
- Solo se cuantiza la tabla de vocabulario; el resto del grafo en fp32 o fp16 mantiene el tamano relativamente alto para un modelo MiniLM.
- La variante `model_vocab4` baja la similitud coseno minima a 0.99861-0.99862 respecto a fp32, y `model_quantized.onnx` a 0.98849. Si se indexan vectores, hay que embeber todo con el mismo fichero: mezclar variantes degrada la comparabilidad de las distancias.
- No existe `onnx/model.onnx` en el repositorio, por lo que con `device: 'webgpu'` es obligatorio pasar `model_file_name`; omitirlo provoca un fallo de carga.
- `dtype: 'fp16'` requiere el soporte `shader-f16` de WebGPU; en dispositivos que no lo tengan hay que caer a `dtype: 'fp32'`.
- `model_quantized.onnx` usa `DynamicQuantizeLinear` y `MatMulInteger`, por lo que no debe usarse con `device: 'webgpu'`.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero la similitud coseno puede producir falsos positivos en dominios muy especializados; el autor no publica evaluacion de retrieval.
- La lista oficial de idiomas soportados no esta publicada; solo se documentan pruebas en siete idiomas.
- Sesgos: no disponibles; el autor no publica analisis de sesgo ni de equidad.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia y las condiciones del modelo base y del export de Xenova del que deriva.
- Adopcion muy baja (10 descargas, 0 likes) y fechas de creacion y actualizacion de septiembre de 2026 en los metadatos; no hay garantia de mantenimiento ni de soporte.
- La busqueda web realizada no devolvio ningun resultado relacionado con el modelo (los resultados obtenidos trataban sobre entrenamiento de cachorros), por lo que no hay fuentes externas que corroboren los datos del autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JoramMillenaar/paraphrase-multilingual-MiniLM-L12-v2-vocab-quantized
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Export ONNX de origen: https://huggingface.co/Xenova/paraphrase-multilingual-MiniLM-L12-v2
- Documentacion de Transformers.js: https://huggingface.co/docs/transformers.js
- Resultados de busqueda web: no se encontro ningun enlace relevante sobre el modelo.
