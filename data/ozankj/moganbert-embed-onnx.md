# Ozankj/MoganBERT-Embed-ONNX

## Resumen

MoganBERT-Embed-ONNX es una exportación no oficial al formato ONNX del modelo de embeddings de frases moganai/MoganBERT-Embed, desarrollado originalmente por MoganAI (Furkan Yilmaz, Habibe Aleyna Tasdemir y Muhammed Faruk Gozay). Se trata de un modelo basado en la arquitectura ModernBERT especializado en la generación de embeddings para turco, orientado a tareas de similitud semántica, búsqueda semántica y recuperación de información. Esta versión ONNX la mantiene el usuario Ozankj y no está afiliada al equipo original.

El interés de esta ficha radica en que ofrece el modelo en tres variantes de precisión (FP32, FP16 e int8 mixto) con tamaños que van desde los ~568 MB hasta los ~154 MB, lo que facilita el despliegue en entornos de producción sin dependencia de PyTorch. La variante FP16 se presenta como la recomendada por compatibilidad, mientras que la cuantizada int8 requiere soporte de la operación `MatMulNBits` en ONNX Runtime.

El modelo conserva el pooling medio y la normalización L2 del original, y produce dos salidas: `token_embeddings` de dimensión 768 por token y `sentence_embedding` de dimensión 768 por frase. Su ámbito lingüístico es exclusivamente el turco, lo que lo hace relevante para pipelines de NLP en ese idioma que necesiten inferencia ligera y compatible con `text-embeddings-inference`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (se menciona un ejemplo de 512 tokens en las pruebas) |
| Tipos de cuantizacion | FP32, FP16, int8 mixto con `MatMulNBits` |
| Idiomas soportados | turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`, `model_fp16.onnx`, `model_quantized.onnx`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es ModernBERT, un encoder transformer con atención bidireccional orientado a tareas de representación y clasificación. El modelo original genera embeddings de frases mediante pooling medio sobre las representaciones de tokens, seguido de normalización L2, de modo que la similitud coseno entre vectores es directamente utilizable para búsqueda y ranking. La dimensión de embedding es 768, según se deduce de las formas de salida documentadas (`batch, seq_len, 768` y `batch, 768`).

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste contrastivo supervisado. La model card de esta exportación no detalla el proceso de entrenamiento del modelo original; solo se referencia el paper arXiv:2608.25768 como fuente. La innovación técnica destacable de esta ficha es la conversión a ONNX con tres niveles de precisión y la verificación de paridad numérica frente a PyTorch: la exportación FP32 alcanza similitud coseno de 1.0 con diferencia absoluta máxima de ~1e-05, y la FP16 mantiene coseno ~1.0 con diferencia máxima de 8.3e-04.

## Capacidades

- Generación de embeddings de frases para similitud semántica y búsqueda semántica en turco.
- Extracción de características a nivel de token (`token_embeddings`) y a nivel de frase (`sentence_embedding`).
- Similitud coseno directa gracias a la normalización L2 integrada.
- Compatibilidad con `sentence-transformers` mediante el backend ONNX.
- Compatibilidad con `text-embeddings-inference` y endpoints compatibles.
- Inferencia sin PyTorch, apta para entornos ligeros o con limitaciones de dependencias.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio: es un modelo puramente de representación.
- Capacidad multilingüe limitada al turco; no se documentan otros idiomas.

## Casos de uso

- Búsqueda semántica en corpus turcos: el modelo genera embeddings normalizados que permiten indexar documentos y consultas en una base vectorial para recuperación por similitud coseno, con la ventaja de que la variante FP16 (~298 MB) reduce el coste de memoria frente a la FP32.
- Deduplicación y agrupamiento de textos: al comparar `sentence_embedding` entre pares de frases se pueden detectar duplicados o agrupar documentos por temática en pipelines de limpieza de datos en turco.
- Clasificación de textos por similitud a prototipos: se pueden calcular embeddings de frases de referencia por categoría y asignar etiquetas al texto nuevo según la similitud máxima, sin necesidad de entrenar un clasificador adicional.
- Sistemas de recomendación basados en contenido: los embeddings de descripciones o títulos permiten calcular similitud entre ítems y generar recomendaciones en catálogos en turco.
- Moderación y filtrado de contenido: comparando la similitud de mensajes con embeddings de referencia de categorías sensibles se puede construir un filtro previo ligero que funcione con ONNX Runtime en servidores sin GPU.
- Despliegue en entornos edge o sin PyTorch: la variante int8 (~154 MB) permite ejecutar el modelo en infraestructura con recursos limitados, siempre que el runtime soporte `MatMulNBits`; la FP16 es la opción recomendada cuando la compatibilidad es prioritaria.
- Enriquecimiento de pipelines RAG en turco: el modelo puede actuar como encoder de recuperación en un sistema de generación aumentada, indexando fragmentos de documentos y recuperando los más relevantes para una consulta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pruebas de paridad numérica entre formatos, no evaluaciones MTEB ni de otro tipo:

| Comparacion | Metrica | Resultado |
|---|---|---|
| FP32 ONNX vs PyTorch | Similitud coseno | 1.0 (diferencia absoluta maxima ~1e-05) |
| FP16 ONNX vs PyTorch | Similitud coseno | ~1.0 (diferencia absoluta maxima 8.3e-04) |
| Int8 ONNX vs FP32 ONNX (10 frases turcas) | Coseno medio / minimo | 0.9996 / 0.9993 |
| Int8 ONNX vs FP32 ONNX (ejemplo de 512 tokens) | Coseno medio / minimo | 0.9994 / 0.9994 |
| Int8 ONNX vs FP32 ONNX | Cambio maximo de similitud por pares | 0.013 |

Estas cifras son pruebas de humo limitadas, no un benchmark completo, y la paridad en tiempo de ejecución no está garantizada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por el tamaño de los ficheros, la variante FP32 (~568 MB) requiere alrededor de 1 GB de memoria en inferencia, la FP16 (~298 MB) alrededor de 0.5-0.7 GB y la int8 (~154 MB) menos de 0.5 GB, sin contar overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; modelos como RTX 3060, RTX 4090, A100 o H100 son sobradamente suficientes. El modelo también puede ejecutarse en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna, e incluso en CPU para cargas moderadas.
- Opciones de despliegue: `sentence-transformers` con backend ONNX, ONNX Runtime directo, `text-embeddings-inference` y endpoints compatibles. La variante int8 requiere un build de ONNX Runtime y un execution provider con soporte de `MatMulNBits`; no se debe asumir compatibilidad con runtimes web o móviles sin probarlo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de modelos comparables en la información proporcionada, por lo que la comparación se limita a aspectos estructurales:

| Modelo | Arquitectura | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| MoganBERT-Embed-ONNX (esta ficha) | ModernBERT | no disponible | tr | Apache 2.0 | ONNX |
| moganai/MoganBERT-Embed | ModernBERT | no disponible | tr | Apache 2.0 | PyTorch (safetensors presumiblemente) |
| Otros modelos de embeddings para turco | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con alternativas de la misma categoría (por ejemplo, modelos multilingual-e5 o BERTurk en versión embeddings) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente en turco: no se documenta soporte para otros idiomas, por lo que su uso en textos en castellano u otras lenguas no está validado.
- Exportación no oficial: este repositorio no está afiliado, respaldado ni mantenido por MoganAI; para los pesos oficiales y benchmarks debe acudirse al modelo original.
- La variante int8 es un grafo mixto personalizado, no una exportación QDQ ni int8 dinámica estándar; requiere soporte de `MatMulNBits` y no se garantiza su funcionamiento en runtimes web o móviles sin pruebas previas.
- Las pruebas de precisión son smoke tests limitados (10 frases y un ejemplo de 512 tokens), no un benchmark MTEB completo; el rendimiento real en producción puede diferir.
- No se dispone de información sobre sesgos del modelo original ni sobre riesgos de alucinación, aunque al ser un modelo de embeddings y no generativo, el riesgo de alucinación textual no aplica directamente; sí puede heredar sesgos presentes en los datos de entrenamiento del modelo original.
- Licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y el NOTICE; al ser una exportación no oficial, conviene verificar la licencia del modelo base.
- No se documentan límites de longitud de contexto; el ejemplo de 512 tokens sugiere que puede operar al menos hasta esa longitud, pero no se confirma el máximo.
- Sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ozankj/MoganBERT-Embed-ONNX
- Modelo original: https://huggingface.co/moganai/MoganBERT-Embed
- Paper: https://huggingface.co/papers/2608.25768
- Notas de cuantización: https://huggingface.co/Ozankj/MoganBERT-Embed-ONNX/blob/main/QUANTIZATION.md
- Licencia: https://huggingface.co/Ozankj/MoganBERT-Embed-ONNX/blob/main/LICENSE
- Aviso de atribución: https://huggingface.co/Ozankj/MoganBERT-Embed-ONNX/blob/main/NOTICE
