# mlboydaisuke/Qwen3-Embedding-0.6B-CoreAI

## Resumen

Qwen3-Embedding-0.6B-CoreAI es una exportación del modelo de embeddings Qwen/Qwen3-Embedding-0.6B al formato `.aimodel` de Core AI, el runtime de aprendizaje automático en dispositivo de Apple que sustituye a Core ML en iOS 27 y macOS 27. La conversión la firma el usuario mlboydaisuke dentro del proyecto Core AI Model Zoo, un catálogo de 75 modelos ya exportados a este formato. El objetivo es ejecutar el pipeline completo de sentence-transformers (backbone Qwen3-0.6B, pooling del último token y normalización L2) como un único grafo estático sobre GPU o Neural Engine de Apple Silicon, sin dependencia de Python ni de servidores remotos.

El modelo resuelve el problema de la búsqueda semántica y el RAG en local para aplicaciones de macOS e iOS: una sola llamada devuelve un vector de 1024 dimensiones normalizado, truncable mediante Matryoshka Representation Learning (MRL), con soporte multilingüe que incluye japonés. Al tratarse de un encoder y no de un modelo generativo, no hay bucle autorregresivo, ni caché KV, ni cabeza de lenguaje: es un forward único sobre la entrada con padding a la derecha.

Su relevancia actual radica en que demuestra la viabilidad de llevar embeddings de calidad a inferencia totalmente local en hardware de consumo Apple, con latencias de decenas de milisegundos y paridad numérica verificada frente a la implementación oficial en PyTorch. No obstante, el propio autor documenta que, en precisión de recuperación, queda por detrás de alternativas como EmbeddingGemma-300m y Nemotron-3-Embed-1B en los tres conjuntos evaluados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (backbone Qwen3-0.6B) con pooling del último token y normalización L2 en grafo |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-Embedding-0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (rejilla estática de exportación; el modelo base soporta contextos mayores, no especificados aquí) |
| Tipos de cuantizacion | fp16 (pesos exportados); el modelo base admite otras cuantizaciones, no detalladas |
| Idiomas soportados | multilingüe, incluido japonés |
| Licencia | Apache-2.0 |
| Formato de pesos | `.aimodel` (bundle Core AI, ~1,1 GB en fp16) con tokenizer de Hugging Face en carpeta aparte |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder derivado de Qwen3-0.6B, exportado como grafo estático único mediante `coreai-torch` (para LLM se usaría `coreai.llm.export`, pero aquí se emplea el pipeline de encoders vía `AIModel.run`). El grafo integra tres etapas: el backbone, el pooling del último token bajo máscara causal y la normalización L2, de modo que la salida es directamente un vector unitario de 1024 dimensiones. La entrada se define con `input_ids` y `attention_mask` de forma `[1, 512]` en int32, con id de padding 151643 y padding a la derecha; la salida es `embedding` de forma `[1, 1024]` en fp16. El pooling del último token bajo máscara causal es seguro con padding derecho porque los tokens reales nunca atienden a los rellenos finales.

No se documentan en la información disponible los detalles de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO). La innovación técnica destacable de esta exportación es la preservación de las propiedades MRL: el vector puede truncarse a las primeras D dimensiones (32 ≤ D ≤ 1024) con re-normalización L2 en el host, conservando el orden de rankings hasta 256 dimensiones y verificado hasta 128. La paridad numérica está verificada: coseno por texto de 1.000000 frente al pipeline oficial en fp32, orden de recuperación idéntico y coseno de 0.999998 de extremo a extremo en el delegado GPU de Core AI.

## Capacidades

- Generación de embeddings de frases y documentos: una llamada devuelve un vector normalizado de 1024 dimensiones.
- Similitud semántica y recuperación de pasajes: similitud coseno equivalente a producto escalar por ser vectores unitarios.
- Búsqueda semántica consciente de instrucciones: las consultas llevan el prefijo `Instruct: Given a web search query, retrieve relevant passages that answer the query\nQuery:`; los documentos no llevan prefijo.
- Multilingüe, con soporte específico de japonés (evaluado en JaQuAD y MIRACL-ja).
- Truncamiento Matryoshka (MRL) para reducir dimensionalidad preservando rankings.
- Ejecución en dispositivo sobre GPU o Neural Engine de Apple Silicon, sin conexión de red.
- No soporta tool calling, agentes, razonamiento multi-paso ni modo thinking: es un encoder, no un modelo generativo.

## Casos de uso

- Búsqueda semántica local en aplicaciones de macOS e iOS: indexar documentos del usuario y recuperar pasajes relevantes con similitud coseno, todo en el dispositivo y sin enviar datos a servidores, gracias al grafo estático de 512 tokens y a la salida normalizada.
- RAG en el borde para asistentes personales: generar embeddings de fragmentos de documentación o notas y recuperar contexto para un LLM local, aprovechando la latencia de ~25 ms (rejilla de 256) y ~45 ms (rejilla de 512) por embedding en una M4 Max.
- Deduplicación y agrupamiento de contenido: comparar vectores de artículos, correos o tickets para detectar duplicados o agrupar temas, con la posibilidad de truncar a 256 dimensiones para reducir memoria y acelerar la comparación.
- Moderación y filtrado de contenido sensible: medir la similitud de textos entrantes contra un conjunto de referencia de políticas, ejecutándose en el propio dispositivo para preservar la privacidad.
- Búsqueda multilingüe en catálogos: consultas en castellano contra documentos en otros idiomas, incluido japonés, usando el mismo espacio de embeddings y el prefijo de instrucción para consultas.
- Sistemas de recomendación basados en contenido: representar ítems y perfiles de usuario como vectores de 1024 dimensiones y calcular afinidades mediante producto escalar, con re-normalización tras truncamiento MRL si se necesita un índice más compacto.
- Clasificación zero-shot ligera: comparar la representación de un texto con descripciones de categorías para asignar etiquetas sin entrenamiento adicional, siempre que la tarea se formule como similitud semántica.

## Benchmarks y rendimiento

Los datos disponibles son de precisión de recuperación (nDCG@10) medidos el 2026-08-25 sobre los pesos originales en PyTorch, con un protocolo común para los tres modelos:

| Conjunto | Qwen3-Embedding-0.6B | EmbeddingGemma-300m | Nemotron-3-Embed-1B |
|---|---|---|---|
| NanoSciFact | 0.687 | 0.864 | 0.765 |
| JaQuAD | 0.570 | 0.621 | 0.616 |
| MIRACL-ja | 0.792 | 0.825 | 0.862 |

El modelo queda en última posición de los tres en los tres conjuntos. En latencia, la exportación mide ~25 ms por embedding con rejilla de 256 y ~45 ms con rejilla de 512 en una GPU M4 Max. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo que es esperable al tratarse de un encoder y no de un modelo generativo.

## Requisitos de hardware

- VRAM equivalente: el bundle fp16 ocupa ~1,1 GB; el repositorio completo pesa 2,4 GB (incluye tokenizer y referencias).
- Hardware objetivo: Apple Silicon con macOS 27 o iOS 27, ejecutando sobre GPU o Neural Engine mediante el runtime Core AI.
- No está pensado para GPU NVIDIA (A100, H100, RTX 4090); para esos entornos conviene usar los pesos originales de Qwen/Qwen3-Embedding-0.6B con sentence-transformers, vLLM u otras pilas.
- Cabe en cualquier Mac o dispositivo Apple con suficiente memoria unificada para alojar el bundle de ~1,1 GB; no se especifican requisitos mínimos exactos.
- Despliegue: runtime Core AI en Python (`coreai.runtime`, `AIModel.load` y `load_function("main")`) o Swift mediante CoreAIKit (`TextEmbedder` con `.qwen3Embedding0_6B` y prompts `.qwen3Embedding`).
- Latencia: ~25 ms por embedding con rejilla de 256 y ~45 ms con rejilla de 512 en una GPU M4 Max. No se documenta throughput agregado por lotes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | nDCG@10 NanoSciFact | nDCG@10 JaQuAD | nDCG@10 MIRACL-ja | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Qwen3-Embedding-0.6B-CoreAI | 0,6 B | 512 (rejilla de exportación) | 0.687 | 0.570 | 0.792 | Apache-2.0 | Hugging Face, formato `.aimodel` |
| EmbeddingGemma-300m | 0,3 B | no disponible | 0.864 | 0.621 | 0.825 | no disponible | no disponible |
| Nemotron-3-Embed-1B | 1 B | no disponible | 0.765 | 0.616 | 0.862 | no disponible | no disponible |

La comparación se limita a los tres conjuntos medidos por el autor; no se dispone de datos de contexto, licencia ni disponibilidad de las alternativas en la información proporcionada. Frente a ellas, este modelo ofrece menor precisión de recuperación pero una ventaja clara en despliegue local sobre Apple Silicon con un grafo estático y licencia permisiva.

## Limitaciones y advertencias

- Precisión de recuperación inferior a EmbeddingGemma-300m y Nemotron-3-Embed-1B en los tres conjuntos evaluados; no es la mejor opción si la calidad de recuperación es prioritaria.
- La rejilla de 512 tokens es una decisión de exportación: los textos más largos se truncan, lo que puede perder información en documentos extensos. Una rejilla menor acelera consultas cortas pero reduce aún más el límite.
- Es un encoder: no genera texto, no razona de forma multi-paso, no soporta tool calling ni agentes. No debe presentarse como sustituto de un LLM.
- El prefijo de instrucción para consultas es obligatorio para el rendimiento esperado; omitirlo o aplicarlo a documentos degrada la recuperación.
- El truncamiento MRL requiere re-normalización L2 en el host; no hacerlo invalida la similitud coseno.
- Dependencia de macOS 27 o iOS 27 y del runtime Core AI; no es portable a otros sistemas sin reconvertir los pesos originales.
- No se documentan sesgos conocidos ni tasas de alucinación (no aplica de forma directa a un encoder), pero los sesgos del corpus de entrenamiento del modelo base pueden reflejarse en los embeddings.
- Licencia Apache-2.0, permisiva para uso comercial tanto en el modelo base como en el código de conversión; conviene verificar las condiciones del runtime Core AI de Apple, que es propietario.
- Repositorio con 30 descargas y 0 likes en el momento de la consulta: ecosistema pequeño y poca validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/Qwen3-Embedding-0.6B-CoreAI
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Core AI Model Zoo (repositorio): https://github.com/john-rocky/coreai-model-zoo
- Script de conversión: https://github.com/john-rocky/coreai-model-zoo/blob/main/conversion/export_qwen3_embedding.py
- Script de comparación de embedders: https://github.com/john-rocky/coreai-model-zoo/blob/main/_smoke/compare_embedders_retrieval.py
- CoreAIKit (Swift): https://github.com/john-rocky/coreai-kit
- Benchmark Apple Silicon LLM: https://github.com/john-rocky/apple-silicon-llm-bench
- Solicitudes de modelos en dispositivo: https://github.com/john-rocky/on-device-requests
- Colección Core AI Model Zoo: https://huggingface.co/collections/mlboydaisuke/core-ai-model-zoo-6a7ff330f753e8dcae04671a
- DeviceMark (leaderboard on-device): https://devicemark.github.io/
- Ficha en parapulse: https://parapulse.io/models/mlboydaisuke/Qwen3-Embedding-0.6B-CoreAI
