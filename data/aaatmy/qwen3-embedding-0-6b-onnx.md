# aaatmy/Qwen3-Embedding-0.6B-ONNX

## Resumen

Qwen3-Embedding-0.6B-ONNX es una conversión no oficial a formato ONNX del modelo de embeddings Qwen/Qwen3-Embedding-0.6B, desarrollado originalmente por el equipo Qwen (Alibaba). Esta versión, publicada por el usuario aaatmy, exporta los pesos oficiales directamente e incorpora en el grafo el pooling de último token y la normalización L2, de modo que la salida es directamente el embedding de frase final, sin necesidad de postprocesado. No se ha reentrenado ningún peso.

El modelo resuelve el problema de generar embeddings de texto multilingües de alta calidad para tareas de recuperación, similitud semántica y clasificación, con la ventaja de estar optimizado para inferencia en CPU mediante ONNX Runtime. Incluye variantes cuantizadas de 8 bits (weight-only, block-wise de tamaño 32) que reducen el tamaño de 2,38 GB a 1,12 GB y aceleran la inferencia en CPU hasta unas 2 veces respecto a float32.

Es relevante ahora porque ofrece una alternativa ligera y portable para pipelines de recuperación aumentada (RAG), búsqueda semántica y clustering multilingüe en entornos sin GPU, manteniendo una fidelidad muy alta respecto al modelo original (coseno medio de 0,99863 en la variante q8_int8compute). El modelo base tiene 0,6 mil millones de parámetros y produce embeddings de dimensión 1024.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3-Embedding-0.6B), exportado a ONNX con pooling de último token y normalización L2 integrados |
| Parametros totales | 0,6 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | float32; 8-bit block-wise (block 32) weight-only; 8-bit con `accuracy_level=4` (int8 compute) |
| Idiomas soportados | multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx_data` float32; `model_q8.onnx`; `model_q8_int8compute.onnx`) |
| Dimension de embedding | 1024 (salida `sentence_embedding`, L2-normalizada) |
| Entradas | `input_ids` [batch, sequence] int64; `attention_mask` [batch, sequence] int64 |
| Tamano del repo | 4,6 GB |
| Libreria | onnx / onnxruntime |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-Embedding-0.6B, un transformer encoder de 0,6 mil millones de parámetros diseñado para generar representaciones densas de texto. Esta conversión ONNX no reentrena pesos: exporta el modelo oficial mediante TorchScript (opset 17) con transformers 4.51.3 y torch 2.6.0, usando atención eager. La innovación de esta versión es que envuelve `AutoModel` con el pooling de último token y la normalización L2 dentro del grafo, de modo que la salida ya es el embedding final normalizado. El pooling selecciona el último token cuyo `attention_mask` es 1, lo que permite tanto padding por la izquierda (receta oficial, con `<|endoftext|>` id 151643) como por la derecha.

La cuantización se realizó con `MatMulNBitsQuantizer` de onnxruntime: 8 bits, block size 32, simétrica, aplicada únicamente a los pesos de `MatMul`. La tabla de embeddings de tokens (`Gather`) se mantiene en float32, ya que cuantizarla fuerza una actualización a opset 21 que produce un grafo inválido. Se descartó una variante de cuantización dinámica int8 estándar de todos los pesos `MatMul` y `Gather` porque degradaba gravemente los embeddings (coseno medio de 0,77 respecto al original). No se dispone de información sobre el número de tokens de entrenamiento ni sobre el uso de RLHF/DPO en el modelo base dentro de la información proporcionada.

## Capacidades

- Generación de embeddings de texto densos de dimensión 1024, normalizados L2, listos para similitud coseno.
- Extracción de características (`feature-extraction`) y sentence embeddings multilingües.
- Soporte de formato de instrucción: `Instruct: {task}\nQuery:{text}`, lo que permite adaptar el embedding a la tarea de recuperación.
- Capacidades multilingües (inglés, chino, japonés verificados en la validación; el modelo base se declara multilingüe).
- Procesamiento por lotes con padding mixto (izquierda o derecha) gracias al pooling basado en `attention_mask`.
- Compatible con `text-embeddings-inference` y endpoints compatibles (según tags del repositorio).
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo exclusivamente de embeddings, no generativo.

## Casos de uso

- Búsqueda semántica multilingüe: indexar documentos en varios idiomas y recuperar por similitud coseno; el modelo produce embeddings normalizados directamente, lo que simplifica el pipeline al eliminar el postprocesado.
- Recuperación aumentada (RAG) en entornos sin GPU: la variante `q8_int8compute` ocupa 1,12 GB y ofrece 54 ms por consulta en CPU (Apple Silicon), adecuada para servicios de recuperación en servidores modestos.
- Deduplicación y clustering de textos: agrupar documentos o registros similares mediante similitud coseno de embeddings, con fidelidad alta respecto al modelo original (coseno medio 0,99863 en q8_int8compute).
- Clasificación de textos por similitud: usar el formato de instrucción para adaptar el embedding a la tarea (por ejemplo, clasificar tickets de soporte comparando con prototipos de cada categoría).
- Recuperación de nombres de instrumentos y pistas de producción musical: caso validado por el autor, con Recall@1 de hasta 66,2 % en alias en inglés no vistos y 59,5 % en consultas japonés→inglés.
- Motor de embeddings en aplicaciones de escritorio o edge: al ser ONNX con onnxruntime y CPUExecutionProvider, se puede desplegar en dispositivos sin acelerador hardware.
- Preprocesado para sistemas de recomendación basados en contenido: generar vectores de ítems textuales (descripciones, títulos) para calcular similitud entre ítems.

## Benchmarks y rendimiento

Paridad con el modelo original (sentence-transformers, PyTorch CPU) sobre 2.280 textos cortos en inglés, chino y japonés:

| Archivo | Coseno mínimo | Coseno medio | Percentil 1 |
|---|---|---|---|
| `model.onnx` (float32) | 0,99944 | 0,99981 | 0,99966 |
| `model_q8.onnx` | 0,99814 | 0,99929 | 0,99886 |
| `model_q8_int8compute.onnx` | 0,99618 | 0,99863 | 0,99758 |

Precisión de tarea: recuperación de nombre de pista a instrumento, Recall@1 (%):

| Prueba (n) | PyTorch | float32 | q8 | q8 int8compute |
|---|---|---|---|---|
| Alias en inglés no vistos (1.008) | 66,2 | 66,1 | 66,2 | 65,7 |
| Abreviaturas (157) | 37,6 | 36,9 | 36,9 | 38,2 |
| Chino → índice inglés (335) | 41,2 | 41,8 | 42,7 | 41,2 |
| Alias en chino no vistos (335) | 44,2 | 43,9 | 43,3 | 43,3 |
| Japonés → índice inglés (368) | 59,5 | 59,5 | 59,2 | 59,0 |
| Alias en japonés no vistos (368) | 56,8 | 57,6 | 57,3 | 56,5 |

Latencia en CPU (Apple Silicon, onnxruntime 1.31, CPUExecutionProvider):

| Archivo | Consulta individual | Lote de 32, por ítem |
|---|---|---|
| float32 | 112 ms | 86 ms |
| q8 | 273 ms | 92 ms |
| q8 int8compute | 54 ms | 51 ms |

## Requisitos de hardware

- VRAM estimada: no aplica para despliegue en CPU; en GPU, el modelo float32 ocupa aproximadamente 2,38 GB de pesos y la variante q8 unos 1,12 GB.
- GPU recomendadas: no especificadas en la información proporcionada; el modelo está optimizado para CPU con onnxruntime. Cualquier GPU con al menos 3 GB de memoria podría alojar la variante float32, pero no se han publicado pruebas en GPU.
- Cabe en GPU de consumo: sí, por tamaño (2,38 GB float32, 1,12 GB q8), aunque no se han publicado mediciones en GPU.
- Opciones de despliegue: onnxruntime (CPUExecutionProvider verificado), compatible con `text-embeddings-inference` y endpoints compatibles según los tags del repositorio.
- Latencia y throughput: en Apple Silicon con CPUExecutionProvider, 54 ms por consulta individual y 51 ms por ítem en lotes de 32 con `q8_int8compute`; 112 ms y 86 ms respectivamente con float32.
- La variante `q8` sin int8 compute es más lenta en consulta individual (273 ms) que float32, pero similar en lote (92 ms).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-Embedding-0.6B-ONNX (este) | 0,6 B | no disponible | ONNX | Apache 2.0 | Pooling y normalización integrados; variantes q8; optimizado para CPU |
| Qwen/Qwen3-Embedding-0.6B (original) | 0,6 B | no disponible | safetensors (PyTorch) | Apache 2.0 | Requiere sentence-transformers y postprocesado de pooling/normalización |
| Otros modelos de embeddings de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Es una conversión no oficial: no está afiliada ni respaldada por el equipo Qwen.
- El modelo es exclusivamente de embeddings; no genera texto, no soporta tool calling ni razonamiento multi-paso.
- La longitud máxima de contexto no se especifica en la información proporcionada; conviene consultar la model card del modelo base.
- La validación se realizó sobre 2.280 textos cortos en inglés, chino y japonés; el rendimiento en otros idiomas o en textos largos no está verificado.
- La cuantización q8 introduce una degradación mínima pero medible (coseno medio 0,99929 en q8 y 0,99863 en q8 int8compute respecto a float32).
- La cuantización dinámica int8 estándar de todos los pesos degrada gravemente los embeddings (coseno medio 0,77) y no se incluye; no debe reproducirse ese enfoque.
- Riesgo de sesgos y alucinación: no evaluado en la información proporcionada; al ser un modelo de embeddings, el riesgo de alucinación se manifiesta como recuperaciones semánticamente erróneas.
- Licencia Apache 2.0 permite uso comercial, pero debe mantenerse la atribución al equipo Qwen y al autor de la conversión según los términos de la licencia.
- El repositorio tiene un tamaño de 4,6 GB, por lo que la descarga completa incluye todas las variantes; conviene usar `allow_patterns` para descargar solo los archivos necesarios.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aaatmy/Qwen3-Embedding-0.6B-ONNX
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Paper de referencia (arXiv:2506.05176): https://arxiv.org/abs/2506.05176
