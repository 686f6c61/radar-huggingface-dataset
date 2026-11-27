# cimo001/google

## Resumen

`cimo001/google` es una conversión a ONNX del modelo de embeddings `embeddinggemma-300m` de Google, publicada por el usuario cimo001 en Hugging Face. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de despliegue: empaqueta los pesos del modelo base en formato ONNX (FP32 e INT8) junto con scripts de ejemplo en Python que implementan el pipeline completo de tokenización con SentencePiece, inferencia y cálculo de similitud coseno. El repositorio ocupa 1,5 GB y declara la licencia Gemma heredada del modelo original.

El modelo resuelve el problema de generar representaciones vectoriales densas de texto para tareas de similitud semántica y recuperación de información multilingüe. Al estar en ONNX, puede ejecutarse con `onnxruntime` sin dependencias de PyTorch ni de la librería `transformers`, lo que facilita su integración en entornos de producción ligeros o en hardware con soporte limitado para frameworks de deep learning.

La relevancia de esta ficha es doble: por un lado, documenta un artefacto de despliegue concreto con instrucciones de uso verificables; por otro, advierte de que la información pública disponible es muy escasa (cero descargas en el momento de la consulta, sin benchmarks publicados, sin model card detallada más allá de la tabla de ficheros y el ejemplo de uso). Cualquier evaluación rigurosa del rendimiento debe remitirse al modelo base original de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (modelo de embeddings, base `embeddinggemma-300m`); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 300M (segun el nombre del modelo base `embeddinggemma-300m`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | FP32 (`model.onnx`, `model.onnx_data`) e INT8 (`model_quantized.onnx`, `model_quantized.onnx_data`) |
| Idiomas soportados | Multilingue (etiqueta `multilingual`; el ejemplo incluye texto en ingles y japones) |
| Licencia | Gemma (`license: gemma`) |
| Formato de pesos | ONNX (con ficheros de datos externos `.onnx_data`) |
| Dimension del embedding | 768 |
| Libreria de inferencia | `onnxruntime` / `onnxruntime-gpu` |
| Tokenizador | SentencePiece (`tokenizer.model`, sin dependencia de `transformers`) |
| Tamano del repositorio | 1,5 GB |

## Arquitectura y entrenamiento

La informacion proporcionada no incluye detalles sobre la arquitectura interna del modelo base `embeddinggemma-300m` mas alla de su naturaleza como modelo de embeddings de 300 millones de parametros y salida de 768 dimensiones. No se especifican el numero de capas, la dimension oculta, el numero de cabezas de atencion ni la funcion de activacion. Tampoco se documentan los datos de entrenamiento (numero de tokens, composicion del corpus, idiomas de entrenamiento especificos) ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Esta informacion deberia consultarse en la model card oficial de `embeddinggemma-300m` de Google, que no forma parte de los datos proporcionados.

Lo que si documenta el repositorio es la innovacion a nivel de despliegue: la conversion a ONNX con dos variantes de precision (FP32 e INT8) y la eliminacion de la dependencia de `transformers`/`tokenizers` mediante el uso directo del fichero `tokenizer.model` de SentencePiece. El pipeline de ejemplo implementa tokenizacion por lotes con padding a la secuencia mas larga, formato de entrada `[bos] texto [eos]` y extraccion de la salida `sentence_embedding`. Se documentan prefijos de prompt especificos por modo: para documentos `title: none | text: {text}` y para consultas `task: search result | query: {text}`, lo que sugiere que el modelo base fue entrenado con instrucciones de tarea para recuperacion asimetrica. Se recomienda normalizar la entrada con NFKC para obtener puntuaciones multilingues consistentes.

## Capacidades

- Generacion de embeddings de texto de 768 dimensiones para similitud semantica y recuperacion de informacion.
- Soporte multilingue: el ejemplo de la model card muestra puntuaciones de similitud coherentes entre una frase en ingles y su traduccion al japones (0,554 de similitud coseno frente a 0,153 para un texto no relacionado).
- Recuperacion asimetrica consulta-documento mediante prefijos de tarea diferenciados (`task: search result | query:` frente a `title: none | text:`).
- Inferencia por lotes con padding dinamico a la longitud maxima del lote.
- Ejecucion sin dependencias de PyTorch ni `transformers`: solo `onnxruntime`, `sentencepiece` y `numpy`.
- Soporte de aceleracion por GPU mediante `onnxruntime-gpu` (seleccion de proveedor de ejecucion configurable en `src/helper.py`).
- Cuantizacion INT8 disponible para reducir requisitos de memoria y latencia.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, tool calling, agentes, vision ni audio: es exclusivamente un modelo de embeddings.

## Casos de uso

- Busqueda semantica en bases documentales multilingues: indexar documentos con el prefijo `title: none | text: {text}` y consultar con `task: search result | query: {text}`, calculando similitud coseno sobre los embeddings de 768 dimensiones. Adecuado por su soporte multilingue y su formato ONNX ligero.
- Deduplicacion y clustering de textos: generar embeddings por lotes de articulos, tickets o registros y agrupar por similitud coseno. La inferencia por lotes con padding dinamico reduce el coste por elemento.
- Sistemas de recomendacion basados en contenido: representar descripciones de productos o articulos y calcular vecinos mas cercanos para sugerir items similares, sin necesidad de GPU dedicada si se usa la variante INT8.
- Moderacion de contenido asistida: comparar mensajes entrantes contra un conjunto de embeddings de referencia de contenido prohibido o permitido, usando similitud coseno como senal de triaje previa a revision humana.
- RAG (retrieval-augmented generation) en entornos con restricciones de framework: al no depender de `transformers`, el modelo puede integrarse en servicios Python minimos o en contenedores ligeros que solo dispongan de `onnxruntime`, actuando como recuperador denso en un pipeline RAG.
- Clasificacion zero-shot por prototipos: construir embeddings de etiquetas o descripciones de categoria y asignar la clase mas cercana a cada texto nuevo, util para taxonomias que cambian con frecuencia sin reentrenar un clasificador.
- Filtrado de duplicados en pipelines de ingesta de datos: comparar embeddings de registros nuevos contra los existentes antes de insertarlos en una base de datos vectorial, con la variante INT8 para maximizar el throughput en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio unicamente incluye un ejemplo cualitativo de similitud coseno (0,600231 para un texto relacionado, 0,153004 para un texto no relacionado y 0,554038 para una traduccion al japones), que no constituye una evaluacion sistematica. Para datos de rendimiento en tareas como MTEB, retrieval o clasificacion, debe consultarse la documentacion oficial del modelo base `embeddinggemma-300m` de Google.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial en la informacion proporcionada. Como referencia orientativa basada en el tamano del modelo (300M parametros), la variante FP32 requeriria del orden de 1,2 GB solo para pesos, y la variante INT8 alrededor de 0,3 GB, a lo que habria que sumar memoria para activaciones y el fichero `.onnx_data` asociado; estas cifras son estimaciones, no datos publicados.
- GPU recomendadas: no especificadas en la informacion disponible. El repositorio menciona `onnxruntime-gpu` como opcion para ejecucion en GPU, pero no detalla modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; por el tamano del modelo es plausible que quepa en GPU de consumo con suficiente memoria, pero no hay datos publicados que lo verifiquen.
- Opciones de despliegue: `onnxruntime` (CPU) y `onnxruntime-gpu` (GPU) son las unicas documentadas. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no son adecuados para un modelo de embeddings en formato ONNX de este tipo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa rigurosa. Como referencia cualitativa, este artefacto es una conversion ONNX del modelo `embeddinggemma-300m` de Google; su comparacion natural seria contra el propio modelo base en formato original (por ejemplo, pesos SafeTensors para `transformers`), contra otras conversiones ONNX del mismo modelo y contra otros modelos de embeddings multilingues de tamano similar. No se han proporcionado parametros, contextos, rendimientos ni licencias de esas alternativas, por lo que la comparativa se marca como no disponible.

## Limitaciones y advertencias

- Informacion publica muy escasa: cero descargas y una unica interaccion en el momento de la consulta; no hay evidencia de validacion por parte de la comunidad.
- Ausencia total de benchmarks: no se puede verificar el rendimiento en tareas de retrieval, clasificacion o similitud mas alla del ejemplo cualitativo de la model card.
- Es un artefacto de conversion, no un modelo original: los meritos tecnicos corresponden al modelo base de Google, y los posibles defectos de la conversion (cuantizacion INT8, empaquetado ONNX) no estan documentados ni evaluados.
- Licencia Gemma: impone restricciones de uso comercial y obligaciones de atribucion que deben revisarse en los terminos oficiales de la licencia Gemma antes de cualquier despliegue en produccion.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si existe riesgo de similitudes espurias en textos ambiguos o muy cortos, como muestra el ejemplo con la entrada "hi" (0,153 de similitud, baja pero no nula).
- Cobertura idiomatica no detallada: la etiqueta es `multilingual`, pero no se especifica la lista de idiomas ni su calidad relativa; el unico ejemplo no ingles es japones.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento con textos largos ni se indica el truncamiento aplicado.
- Dependencia de prefijos de tarea: usar el prefijo incorrecto (documento frente a consulta) puede degradar la calidad de la recuperacion; el pipeline de ejemplo lo ilustra pero no lo valida exhaustivamente.
- Normalizacion NFKC recomendada por el autor: omitirla puede producir puntuaciones multilingues inconsistentes.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cimo001/google
- Ejemplo de uso documentado: `embeddinggemma-300m/src/example.py` (dentro del repositorio)
- Constructor de sesion ONNX: `embeddinggemma-300m/src/helper.py` (dentro del repositorio)
- Modelo base referenciado: `embeddinggemma-300m` de Google (no se proporciona URL directa en la informacion disponible)
- Licencia Gemma: no se proporciona URL directa en la informacion disponible
