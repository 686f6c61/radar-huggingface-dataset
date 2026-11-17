# KaLM-Embedding/KaLM-Reranker-V1-Nano-R2

## Resumen

KaLM-Reranker-V1-Nano-R2 es un modelo de reranking (text-ranking) para recuperación de información multilingüe, desarrollado por el equipo KaLM-Embedding. Se trata de la versión revisada (R2) del checkpoint Nano de la familia KaLM-Reranker-V1, construida sobre el modelo base google/t5gemma-2-270m-270m, un transformer encoder-decoder de tipo T5Gemma 2. Con 786 millones de parámetros totales, está diseñado para reordenar documentos candidatos devueltos por un retriever en pipelines RAG y de búsqueda semántica.

Su innovación principal es la arquitectura FBNL ("Fast But Not Late Interaction"), que combina la eficiencia de los modelos bi-encoder con la precisión de los cross-encoder, permitiendo además comprimir las representaciones de los documentos mediante Matryoshka embedding pooling (MEP) en un rango validado de 1x a 128x. Esto permite ajustar el coste computacional en tiempo de inferencia: se pueden cribar todos los candidatos con representaciones muy comprimidas y gastar más cómputo solo en los más prometedores (cascada coarse-to-fine).

La versión R2 mejora sustancialmente sobre la V1 original: amplía el rango de compresión validado de 32x a 128x, introduce una receta de entrenamiento en tres etapas (SFT, destilación con soft-labels y model soup) y mejora el rendimiento multilingüe en MIRACL con incrementos de +9,03, +7,17 y +4,85 puntos de nDCG@10 para los tamaños Nano, Small y Large respectivamente. Es relevante ahora porque ofrece un reranker multilingüe de licencia Apache 2.0 con coste de inferencia ajustable, algo poco habitual en esta categoría.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5Gemma 2) con FBNL y Matryoshka embedding pooling |
| Parametros totales | 786.029.296 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Multilingue (evaluado en los 18 idiomas de MIRACL) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/t5gemma-2-270m-270m, un transformer encoder-decoder de la familia T5Gemma 2, y lo adapta a la tarea de reranking mediante la arquitectura FBNL (Fast But Not Late Interaction). Esta aproximación busca evitar el coste del late interaction clásico (tipo ColBERT) manteniendo capacidad de ranking fino, y añade Matryoshka embedding pooling (MEP), que permite truncar las representaciones documentales a distintos ratios de compresión (1x a 128x) sin reentrenar el modelo.

El entrenamiento de la versión R2 sigue una receta de tres etapas: (1) supervised fine-tuning (SFT) de alta calidad; (2) destilación con soft-labels, que produce dos checkpoints intermedios con configuraciones r64-a32 y r96-a48; y (3) model soup, que combina los checkpoints de la etapa 2 para generar el modelo final R2. Los datos de entrenamiento provienen de los conjuntos KaLM-reranker-training-data, KaLM-embedding-finetuning-data y Shitao/bge-m3-data. No se especifica en la información disponible el número de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Reranking de documentos multilingüe para pipelines de recuperación (retrieval) y RAG.
- Compresión ajustable de representaciones documentales mediante MEP, de 1x a 128x, permitiendo trade-off entre coste y calidad en tiempo de inferencia.
- Cascada coarse-to-fine: cribado barato con representaciones muy comprimidas y reranking fino solo sobre los candidatos más prometedores.
- Ranking multi-dominio (evaluado en BEIR) y multilingüe (evaluado en los 18 idiomas de MIRACL).
- Compatible con la librería sentence-transformers y con el pipeline text-ranking de transformers.
- Integración como segunda etapa en arquitecturas de recuperación de dos fases (retriever + reranker).

## Casos de uso

- RAG en producción: el modelo reordena los fragmentos recuperados por un retriever vectorial antes de pasarlos al LLM generador, mejorando la precisión del contexto inyectado; la compresión MEP permite ajustar el coste por consulta según el presupuesto de latencia.
- Búsqueda semántica multilingüe: en catálogos o bases documentales con contenido en varios idiomas (los 18 de MIRACL), el reranker unifica la calidad de ranking sin necesidad de un modelo por idioma.
- Atención al cliente con base de conocimiento: se recuperan artículos candidatos y el reranker selecciona los más relevantes para respuesta automática, con cascada coarse-to-fine para cribar miles de documentos con bajo coste.
- Búsqueda en documentación técnica y código: reordenación de resultados en portales de documentación para desarrolladores, donde la precisión del top-k es crítica.
- Sistemas de preguntas y respuestas sobre corpus legales o científicos: reranking de pasajes largos con representaciones comprimidas para manejar colecciones de gran tamaño con recursos limitados.
- Evaluación y tuning de pipelines de retrieval: al permitir variar el ratio de compresión en un mismo checkpoint, sirve para medir la curva calidad-coste del sistema de recuperación antes de fijar la configuración de producción.
- Filtrado previo en motores de búsqueda empresarial: cribado rápido de candidatos con compresión alta (64x o 128x) y reranking fino solo del top reducido.

## Benchmarks y rendimiento

Resultados publicados en la model card (nDCG@10, ratio de compresión por defecto r=4):

| Benchmark | Modelo | KaLM-Reranker-V1 | KaLM-Reranker-V1-R2 | Delta |
|---|---|---|---|---|
| BEIR (multi-dominio) | Nano | 57,41 | 58,54 | +1,13 |
| BEIR (multi-dominio) | Small | 60,01 | 61,07 | +1,06 |
| BEIR (multi-dominio) | Large | 62,87 | 63,53 | +0,66 |
| MIRACL (multilingüe) | Nano | 62,08 | 71,11 | +9,03 |
| MIRACL (multilingüe) | Small | 66,89 | 74,06 | +7,17 |
| MIRACL (multilingüe) | Large | 70,07 | 74,92 | +4,85 |

Robustez a compresión en BEIR (nDCG@10):

| Modelo | 2x | 4x | 8x | 16x | 32x | 64x | 128x |
|---|---|---|---|---|---|---|---|
| KaLM-Reranker-V1-Nano | 57,69 | 57,41 | 56,46 | 55,19 | 52,88 | — | — |

Según la model card, incluso a 128x de compresión los tres tamaños conservan al menos el 92% de su nDCG@10 medio a 2x en BEIR y MIRACL. Los datos completos de la tabla de robustez a compresión para la versión R2 no están disponibles en la información proporcionada (la tabla aparece truncada).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada; con 786 millones de parámetros, en fp16 serían aproximadamente 1,6 GB de pesos, más overhead de activaciones y del tokenizador.
- GPU recomendadas: no disponibles en la información proporcionada.
- Cabe en GPU de consumo: probable por tamaño (menos de 2 GB de pesos en fp16), aunque no se confirma en la documentación disponible.
- Opciones de despliegue: sentence-transformers y transformers (pipeline text-ranking); otras opciones (vLLM, llama.cpp, Ollama, TGI) no se mencionan en la información disponible.
- Latencia y throughput: no disponibles; la model card destaca el ajuste de cómputo en inferencia vía ratio de compresión y cascada coarse-to-fine, pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KaLM-Reranker-V1-Nano-R2 | 786 M | No disponible | BEIR 58,54; MIRACL 71,11 (r=4) | Apache 2.0 | Hugging Face, Replicate |
| KaLM-Reranker-V1-Nano (original) | No disponible | No disponible | BEIR 57,41; MIRACL 62,08 (r=4) | Apache 2.0 | Hugging Face |
| KaLM-Reranker-V1-Small-R2 | No disponible | No disponible | BEIR 61,07; MIRACL 74,06 (r=4) | Apache 2.0 | Hugging Face |
| KaLM-Reranker-V1-Large-R2 | No disponible | No disponible | BEIR 63,53; MIRACL 74,92 (r=4) | Apache 2.0 | Hugging Face |

No se dispone en la información proporcionada de comparaciones con rerankers de otros autores (por ejemplo, de la familia BGE o Cohere); esos datos no están disponibles.

## Limitaciones y advertencias

- No se documentan sesgos conocidos en la información proporcionada; al entrenarse con datasets de recuperación multilingüe, es esperable heredar los sesgos de dichos corpus, pero no se cuantifica.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que el modelo produce puntuaciones de ranking, no texto libre; el riesgo se traslada al pipeline que consume sus resultados.
- Longitud de contexto no especificada: se desconoce el máximo de tokens por documento o consulta, lo que limita la planificación de despliegues con pasajes largos.
- El rendimiento a ratios de compresión altos (64x, 128x) se valida como retención relativa respecto a 2x (al menos 92%), no como paridad absoluta; en producción conviene medir la curva calidad-coste sobre el dominio propio.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base google/t5gemma-2-270m-270m, cuyos términos no se detallan en la información disponible.
- La información de benchmarks de la model card aparece parcialmente truncada; los datos de robustez a compresión de la versión R2 no están completos.
- El modelo está pensado exclusivamente para reranking; no genera respuestas ni soporta tool calling ni razonamiento multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KaLM-Embedding/KaLM-Reranker-V1-Nano-R2
- Playground en Replicate: https://replicate.com/itsukifujii/kalm-reranker-v1-nano-r2
- Colección KaLM-Reranker en Hugging Face: https://huggingface.co/collections/KaLM-Embedding/lychee-kalm-reranker-and-jev
- Paper (arXiv 2606.22807): https://arxiv.org/abs/2606.22807
- Paper (arXiv 2506.20923): https://arxiv.org/abs/2506.20923
- Paper (arXiv 2501.01028): https://arxiv.org/abs/2501.01028
- Repositorio GitHub: https://github.com/KaLM-Embedding
- Modelo base: https://huggingface.co/google/t5gemma-2-270m-270m
- Checkpoints intermedios R2 (Stage 1, Stage 2): https://huggingface.co/Yuki131
- Dataset de entrenamiento del reranker: https://huggingface.co/datasets/KaLM-Embedding/KaLM-reranker-training-data
- Dataset de fine-tuning de embeddings: https://huggingface.co/datasets/KaLM-Embedding/KaLM-embedding-finetuning-data
- Dataset BGE-M3: https://huggingface.co/datasets/Shitao/bge-m3-data
