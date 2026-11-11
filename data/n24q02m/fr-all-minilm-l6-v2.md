# n24q02m/fr-all-MiniLM-L6-v2

## Resumen

`n24q02m/fr-all-MiniLM-L6-v2` es una compilación en formato ONNX del modelo de embeddings de frases `sentence-transformers/all-MiniLM-L6-v2`, publicada por el usuario n24q02m a través de su herramienta de conversión `fastretrieval`. El modelo original es un transformer BERT de tipo MiniLM con 6 capas, diseñado para generar embeddings de frases y párrafos de 384 dimensiones mediante pooling de media y normalización L2. Esta versión no altera los pesos del modelo base: solo los exporta a ONNX (opset 21) y añade dos variantes cuantizadas, int8 y q4f16, pensadas para inferencia eficiente en CPU y entornos con recursos limitados.

La relevancia de esta ficha es acotada: se trata de un artefacto de despliegue, no de un modelo nuevo. Su interés práctico reside en el tamaño reducido de los ficheros (22 MB en int8, 28 MB en q4f16) y en la posibilidad de ejecutarlo con ONNX Runtime sin depender de PyTorch, lo que facilita su integración en servicios de búsqueda semántica, sistemas RAG o pipelines de similitud textual con latencia baja.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no incluye información sobre licencia, idiomas soportados ni resultados de evaluación. La model card remite a la licencia del modelo base, por lo que cualquier uso comercial debe verificarse en el repositorio original de `sentence-transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT MiniLM (6 capas), exportado a ONNX |
| Parametros totales | no disponible (el modelo base all-MiniLM-L6-v2 tiene ~22,7 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base suele usar 256 tokens, dato no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | int8 (QInt8, cuantizacion dinamica) y q4f16 (MatMulNBits, block_size 128, simetrica, con cast a float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (hereda la del modelo base `sentence-transformers/all-MiniLM-L6-v2`) |
| Formato de pesos | ONNX (opset 21); variantes `onnx/model_quantized.onnx` (22 MB) y `onnx/model_q4f16.onnx` (28 MB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer encoder de tipo BERT en su variante MiniLM, con pooling de media sobre las representaciones de los tokens y normalización L2 de la salida, según los metadatos de la model card (`pooling: MEAN`, `normalization: True`). El modelo produce embeddings densos de 384 dimensiones, adecuados para similitud coseno. No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo base y no se detallan en esta ficha.

La innovación técnica de esta publicación es exclusivamente de despliegue: la conversión a ONNX opset 21 mediante `fastretrieval`, la cuantización dinámica a int8 con `onnxruntime.quantization.quantize_dynamic` (tipo QInt8) y la cuantización q4f16 con `MatMulNBitsQuantizer` (block_size 128, simétrica) seguida de un cast a float16. No se documentan cambios en los pesos, en el tokenizador ni en el proceso de entrenamiento.

## Capacidades

- Generación de embeddings de frases y párrafos para tareas de similitud semántica y recuperación de información.
- Extracción de características (`feature-extraction`) mediante pooling de media y normalización L2.
- Ejecución en ONNX Runtime, sin dependencia de PyTorch en tiempo de inferencia.
- Variantes cuantizadas para reducir huella de memoria y acelerar la inferencia en CPU.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidades multilingües: no disponibles según la información proporcionada.

## Casos de uso

- Búsqueda semántica en aplicaciones web: el modelo puede indexar documentos y consultas como vectores de 384 dimensiones y recuperar los más similares por coseno, con un coste de almacenamiento bajo gracias a los 22 MB de la variante int8.
- Sistemas RAG (retrieval-augmented generation): sirve como encoder de recuperación en pipelines que alimentan a un LLM, ejecutándose en CPU con ONNX Runtime y sin GPU dedicada.
- Deduplicación y clustering de textos: permite agrupar documentos, tickets o reseñas por similitud semántica en lotes, con throughput alto al usar la variante int8.
- Moderación y filtrado de contenido: comparar mensajes entrantes contra un conjunto de referencia de textos prohibidos o sensibles mediante similitud de embeddings.
- Motores de recomendación basados en contenido: generar vectores de artículos o descripciones y calcular afinidades con el perfil del usuario en tiempo casi real.
- Clasificación de texto por similitud con prototipos: en lugar de entrenar un clasificador, comparar el embedding de cada entrada con embeddings de ejemplo de cada clase, útil para prototipado rápido.
- Despliegue en entornos edge o contenedores ligeros: la variante q4f16 (28 MB) permite incluir el modelo en imágenes Docker pequeñas o dispositivos con memoria limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en la mayoría de despliegues; el modelo está pensado para CPU mediante ONNX Runtime. En GPU, el peso en memoria es inferior a 100 MB en cualquiera de las variantes.
- GPU recomendadas: cualquier GPU con soporte de ONNX Runtime o CUDA; no se requieren modelos de gama alta. Para cargas masivas, una T4 o una RTX 4090 son suficientes; para producción a gran escala, A100 o H100 no aportan ventaja significativa por el tamaño del modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con más de 1 GB de memoria; también en CPU y en dispositivos edge.
- Opciones de despliegue: ONNX Runtime (principal), `fastretrieval` (librería del autor), y potencialmente servidores compatibles con ONNX como Triton Inference Server. No se documenta soporte nativo de vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| n24q02m/fr-all-MiniLM-L6-v2 | no disponible (~22,7 M en el base) | no disponible | ONNX (int8, q4f16) | no disponible (hereda del base) | Hugging Face, 0 descargas |
| sentence-transformers/all-MiniLM-L6-v2 | ~22,7 M | 256 tokens (habitual) | PyTorch, safetensors | Apache 2.0 (según el repositorio original) | Hugging Face, ampliamente usado |
| sentence-transformers/paraphrase-MiniLM-L6-v2 | ~22,7 M | 128 tokens (habitual) | PyTorch, safetensors | Apache 2.0 (según el repositorio original) | Hugging Face |
| BAAI/bge-small-en-v1.5 | ~33 M | 512 tokens | PyTorch, safetensors, ONNX | MIT | Hugging Face |

Nota: los datos de parámetros, contexto y licencia de los modelos comparados no están confirmados en la información proporcionada y deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al heredar los pesos del modelo base, arrastra los sesgos de su dataset de entrenamiento, no especificado aquí.
- Riesgo de alucinación: no aplica en el sentido generativo, pero los embeddings pueden producir similitudes engañosas en dominios alejados de los datos de entrenamiento.
- Limitaciones de contexto o idioma: no se especifican; el modelo base está orientado principalmente al inglés, y el prefijo `fr-` en el nombre no está justificado en la model card.
- Restricciones de licencia: la licencia no está indicada; la model card remite a la del modelo base, por lo que el uso comercial requiere verificar `sentence-transformers/all-MiniLM-L6-v2`.
- Caveat para producción: repositorio con 0 descargas y 0 likes, sin evaluación publicada; conviene validar la calidad de los embeddings cuantizados frente a la versión original antes de desplegar.
- La cuantización int8 y q4f16 puede degradar ligeramente la precisión de los embeddings; no se aportan métricas de esa degradación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/n24q02m/fr-all-MiniLM-L6-v2
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Herramienta de conversión fastretrieval: https://github.com/n24q02m/fastretrieval
