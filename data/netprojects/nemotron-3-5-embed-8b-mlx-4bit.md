# netprojects/Nemotron-3.5-Embed-8B-mlx-4bit

## Resumen

Nemotron-3.5-Embed-8B-mlx-4bit es una conversión a formato MLX del modelo de embeddings multimodal nvidia/Nemotron-3.5-Embed-8B-BF16, desarrollada por NetProjects (Paris Michalas) para su ejecución en Apple Silicon. El modelo original lo desarrolla NVIDIA y está diseñado para recuperación de información (retrieval): proyecta consultas de texto y documentos (texto o imágenes de página) en un mismo espacio vectorial, lo que permite búsqueda semántica sobre corpus que mezclan texto e imágenes de páginas escaneadas.

La conversión cuantiza únicamente la torre de lenguaje a 4 bits (cuantización afín, group size 64), manteniendo el codificador visual, el proyector, las normas y el pooling en bf16, y calculando el mean pooling y la normalización L2 en float32. El resultado ocupa 5,0 GB y conserva una alta fidelidad respecto a los pesos originales: coseno medio de 0,9836 frente a la implementación de referencia de NVIDIA en float32.

Es relevante ahora porque permite ejecutar un modelo de embeddings de 8.381.155.328 parámetros con soporte multimodal y contexto de hasta 32.768 tokens en hardware de consumo de Apple, algo que hasta hace poco requería GPUs de datacenter. El modelo está construido sobre mistralai/Ministral-3-8B-Instruct-2512-BF16 (Apache-2.0) y se distribuye bajo la licencia OpenMDW 1.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (torre de lenguaje Ministral-3-8B + codificador visual y proyector) |
| Parametros totales | 8.381.155.328 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | 4-bit afín (group size 64) en la torre de lenguaje; bf16 en vision encoder y proyector; float32 en pooling y normalización L2 |
| Idiomas soportados | en (inglés) |
| Licencia | OpenMDW License Agreement 1.1 (modelo original de NVIDIA); modelo base Ministral-3-8B-Instruct-2512-BF16 bajo Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es un encoder de embeddings construido sobre Ministral-3-8B-Instruct-2512-BF16, un transformer de 8B parámetros. A esta base se le añade una torre de visión (vision encoder y proyector) que permite procesar imágenes de página y alinearlas con el espacio vectorial del texto. La salida se obtiene mediante mean pooling y normalización L2, calculados en float32 para preservar la precisión numérica. El modelo soporta vectores Matryoshka, es decir, embeddings truncables a dimensiones menores (1024 y 512) con pérdida controlada de rendimiento.

No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card indica que el modelo original fue entrenado por NVIDIA y que esta conversión solo cambia el formato y la precisión, partiendo de la revisión upstream `781e779ee4ca9c2d2a4f38321993556baeab49a1`. La innovación técnica destacable de esta build es la cuantización selectiva: solo la torre de lenguaje se cuantiza a 4 bits, mientras que los componentes sensibles a la precisión (visión, normas, pooling) se mantienen en bf16 o float32.

## Capacidades

- Generación de embeddings de texto para búsqueda semántica y sentence similarity.
- Embeddings multimodales: procesa imágenes de página y las proyecta en el mismo espacio vectorial que el texto.
- Recuperación de documentos largos: soporta entradas de hasta 32.768 tokens.
- Embeddings Matryoshka: permite truncar los vectores a 1024 o 512 dimensiones.
- Soporte de consultas y documentos con prefijos específicos (`query:` y `passage:`) a través de la plantilla de chat de NVIDIA.
- Procesamiento de una imagen por documento, con soporte de texto e imagen combinados (por ejemplo, "Figure 3" + imagen de gráfico).
- Servidor local con endpoints compatibles con OpenAI (`/v1/embeddings`) y Cohere/Jina (`/v1/rerank`).
- No soporta tool calling ni razonamiento multi-paso: es un modelo de feature extraction, no generativo.

## Casos de uso

- Búsqueda semántica sobre documentación técnica: indexar manuales y artículos en inglés y recuperar fragmentos relevantes mediante similitud coseno, aprovechando el contexto de 32.768 tokens para documentos largos.
- Recuperación sobre PDFs escaneados: indexar imágenes de página directamente sin necesidad de OCR previo, gracias al codificador visual que proyecta páginas en el mismo espacio que las consultas de texto.
- Sistemas RAG (Retrieval-Augmented Generation): generar embeddings de pasajes para alimentar un pipeline de generación aumentada, con la ventaja de ejecutarse localmente en Apple Silicon sin depender de APIs externas.
- Reranking de resultados: usar el endpoint `/v1/rerank` para reordenar candidatos recuperados por un primer estadio de búsqueda, mejorando la precisión del top-k.
- Búsqueda multimodal en bases de conocimiento: combinar consultas textuales con documentos que incluyen figuras, gráficos o tablas renderizadas como imagen.
- Prototipado e investigación en recuperación: evaluar técnicas de retrieval en un portátil con Apple Silicon, con latencia de 6,36 documentos/s para entradas de 506 tokens y un pico de memoria de 5,04 GB.
- Indexación de corpus a gran escala en local: procesar lotes de 64 documentos con un pico de 8,59 GB de memoria, adecuado para equipos con 16 GB o más de RAM unificada.

## Benchmarks y rendimiento

Resultados medidos en esta build frente a la implementación de referencia de NVIDIA en float32:

| Test | Métrica | Esta build | Referencia NVIDIA |
|---|---|---|---|
| SciFact (200 consultas y abstracts) | Coseno mínimo / medio | 0,9786 / 0,9836 | — |
| SciFact | Top-1 coincidente | 39/40 | — |
| SciFact | Solapamiento top-10 | 0,95 | — |
| Documentos largos (4K+ tokens) e imágenes de página (52 entradas) | Coseno mínimo / medio | 0,9702 / 0,9831 | — |
| Documentos largos e imágenes | Top-1 coincidente | 10/10 | — |
| ViDoRe v3 Computer Science (inglés) | nDCG@10 | 0,7732 | 0,7736 |
| ViDoRe v3 CS, vectores Matryoshka 1024-d | nDCG@10 | 0,7479 | — |
| ViDoRe v3 CS, vectores Matryoshka 512-d | nDCG@10 | 0,6678 | — |
| ViDoRe v3 CS | Recall@100 | 0,9783 | — |
| SciFact (BEIR, primeras 100 consultas) | nDCG@10 | 0,9080 | 0,9134 |

Rendimiento de velocidad (texto):

| Tokens por entrada | Batch | Docs/s | Tokens/s | Memoria pico |
|---|---|---|---|---|
| 506 | 1 | 6,36 | 3.221 | 5,04 GB |
| 506 | 16 | 5,34 | 2.704 | 5,75 GB |
| 506 | 64 | 5,35 | 2.709 | 8,59 GB |
| 4090 | 1 | 0,58 | 2.384 | 5,46 GB |
| 4090 | 16 | 0,58 | 2.379 | 12,78 GB |
| 4090 | 64 | 0,58 | 2.363 | 37,71 GB |

## Requisitos de hardware

- Memoria: 5,04 GB de pico para inferencia con entradas de 506 tokens y batch 1; hasta 8,59 GB con batch 64.
- Para documentos de 4.096 tokens, el pico de memoria sube a 5,46 GB (batch 1) y hasta 37,71 GB con batch 64.
- Hardware objetivo: Apple Silicon (MLX). La build fue desarrollada y probada en un Apple M5 Max con 128 GB de memoria unificada.
- Cabe en equipos Apple Silicon de consumo con 16 GB o más de memoria unificada para uso con batches pequeños; para batches grandes se recomiendan 32 GB o más.
- Despliegue: MLX, mlx-lm y mlx-vlm; servidor local incluido con endpoints `/v1/embeddings` y `/v1/rerank`.
- No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato es específico de MLX.
- Throughput medido: 6,36 docs/s con entradas de 506 tokens en batch 1; 0,58 docs/s con entradas de 4.096 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron-3.5-Embed-8B-mlx-4bit (esta build) | 8,38B | 32.768 | Sí (texto + imagen de página) | OpenMDW 1.1 | MLX safetensors 4-bit |
| nvidia/Nemotron-3.5-Embed-8B-BF16 | 8,38B | 32.768 | Sí | OpenMDW 1.1 | safetensors bf16 |
| Ministral-3-8B-Instruct-2512-BF16 (base) | 8B | no disponible | No | Apache-2.0 | safetensors bf16 |

No se dispone de datos de benchmarks comparativos con otros modelos de embeddings de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Es un modelo de embeddings, no generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- La cuantización a 4 bits introduce una pérdida de fidelidad respecto al original: coseno medio de 0,9836 en SciFact y nDCG@10 de 0,9080 frente a 0,9134 del modelo original.
- Los vectores Matryoshka reducidos a 512 dimensiones pierden rendimiento significativo (nDCG@10 de 0,6678 frente a 0,7732 con dimensión completa).
- El modelo solo procesa una imagen por documento.
- La licencia OpenMDW 1.1 puede imponer restricciones al uso comercial; es necesario revisar el archivo LICENSE del repositorio.
- Esta build es una conversión no oficial de NetProjects, no afiliada a NVIDIA; para producción se recomienda evaluar los pesos originales en bf16.
- Riesgo de alucinación no aplica directamente al ser un modelo de recuperación, pero los embeddings pueden producir similitudes espurias en dominios fuera de distribución.
- No es compatible con ecosistemas de despliegue estándar (vLLM, TGI, Ollama), lo que limita su uso a entornos Apple Silicon con MLX.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/netprojects/Nemotron-3.5-Embed-8B-mlx-4bit
- Modelo original: https://huggingface.co/nvidia/Nemotron-3.5-Embed-8B-BF16
- Código de conversión: https://github.com/internet-projects/nemotron-retrieval-mlx
- MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Colección de builds MLX de NetProjects: https://huggingface.co/collections/netprojects/netprojects-mlx-builds-6ae3b2683a59a1b4fc4c0c3a
- Todos los modelos de NetProjects: https://huggingface.co/netprojects
- NetProjects: https://netprojects.com
