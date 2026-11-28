# netprojects/Nemotron-3.5-Rerank-8B-mlx-8bit

## Resumen

Nemotron-3.5-Rerank-8B-MLX-8bit es una conversión a formato MLX del reranker multimodal de NVIDIA `nvidia/Nemotron-3.5-Rerank-8B-BF16`, publicada por NetProjects para su ejecución en Apple Silicon. El modelo puntúa la relevancia entre una consulta y un documento, donde el documento puede ser texto, una imagen de página o ambos, devolviendo un logit de relevancia. No es un modelo generativo: su salida es una puntuación de clasificación, lo que lo encuadra en la categoría de rerankers de recuperación (retrieval).

La conversión mantiene la torre de lenguaje en cuantización afín de 8 bits (tamaño de grupo 64) y conserva en su precisión original el codificador visual y el proyector (bf16), las normas, la cabeza de puntuación (float32) y el mean pooling (float32). El resultado es un artefacto de 8,7 GB con 8.381.155.328 parámetros totales, pensado para aprovechar la memoria unificada de los chips Apple M-series.

Su relevancia actual radica en que permite ejecutar localmente, sobre hardware de consumo de Apple, un reranker de 8B con soporte multimodal y ventana de hasta 32.768 tokens, manteniendo una correlación prácticamente idéntica a la implementación de referencia de NVIDIA en float32 (Spearman 0,9998-0,9999 en los conjuntos medidos). La licencia del modelo original es OpenMDW 1.1, y el modelo base se apoya en `mistralai/Ministral-3-8B-Instruct-2512-BF16` (Apache-2.0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (torre de lenguaje Mistral3 + codificador visual y proyector), tarea de reranking con cabeza de puntuación |
| Parametros totales | 8.381.155.328 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 32.768 tokens |
| Tipos de cuantizacion | 8-bit afín con group size 64 en la torre de lenguaje; bf16 en visión y proyector; float32 en normas, score head y mean pooling |
| Idiomas soportados | en |
| Licencia | OpenMDW License Agreement, version 1.1 |
| Formato de pesos | safetensors (MLX), librería `mlx` |

## Arquitectura y entrenamiento

El modelo es un reranker construido sobre una arquitectura multimodal de tipo Mistral3: una torre de lenguaje derivada de Ministral-3-8B-Instruct y un codificador visual con proyector que permite procesar imágenes de página junto al texto. La salida no es texto generado sino un logit de relevancia obtenido tras un mean pooling en float32 y una cabeza de puntuación también en float32. La entrada sigue la plantilla de chat de NVIDIA con roles `query` y `document`, admite un máximo de una imagen por documento y una ventana de hasta 32.768 tokens.

Esta ficha corresponde a una conversión de formato y precisión, no a un reentrenamiento: NetProjects parte de la revisión upstream `f88f8d9104726747791283ab156d2fcdb29e90a7` y aplica cuantización de 8 bits solo a la torre de lenguaje, dejando intactos en su precisión original los componentes sensibles a la puntuación. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original. La tokenización es idéntica a la del modelo de referencia en todas las entradas probadas.

## Capacidades

- Puntuación de relevancia consulta-documento mediante un logit, orientada a reranking en pipelines de recuperación.
- Procesamiento de documentos en texto, imagen de página o combinación de ambos (multimodal).
- Soporte de ventana larga de hasta 32.768 tokens, adecuado para documentos extensos y páginas escaneadas.
- Salida de ranking con `top_k`, puntuaciones y índices de documento.
- Servidor local con endpoints estilo OpenAI `/v1/embeddings` y estilo Cohere/Jina `/v1/rerank`, con imágenes en data URL o base64.
- Capacidad de reranking sobre resultados de una primera etapa de embeddings (probada con `Nemotron-3.5-Embed-8B-mlx-8bit`).
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- Idiomas: únicamente inglés según la model card.

## Casos de uso

- Reranking de resultados de búsqueda documental: se usa como segunda etapa sobre los candidatos devueltos por un modelo de embeddings; en la prueba sobre ViDoRe v3 (Computer Science, imágenes de página) el nDCG@10 subió de 0,7952 a 0,8315 tras el reranking.
- Búsqueda sobre documentos escaneados y PDFs con figuras: al aceptar imágenes de página y combinaciones texto+imagen, permite puntuar páginas completas sin OCR previo.
- Asistentes de investigación con corpus largos: la ventana de 32.768 tokens permite puntuar abstracts y documentos extensos (se probaron documentos de más de 4.000 tokens) sin truncar.
- Recuperación aumentada (RAG) en local sobre Mac: el despliegue vía MLX en Apple Silicon permite montar un pipeline de recuperación privado sin depender de servicios en la nube.
- Filtrado de candidatos en pipelines de revisión bibliográfica: ordenar abstracts por relevancia frente a una consulta concreta (probado sobre un slice de SciFact con 1.000 abstracts).
- Servicio interno de reranking: el servidor incluido expone `/v1/rerank` y `/v1/embeddings`, lo que facilita integrarlo en aplicaciones existentes que ya consumen APIs con ese formato.
- Evaluación de calidad de recuperación multimodal: útil para medir y comparar el impacto del reranking sobre un índice de embeddings en dominios con contenido visual (gráficos, tablas, páginas).

## Benchmarks y rendimiento

Resultados medidos por el autor de la conversión sobre este build, comparados con el código de referencia de NVIDIA en float32.

| Test | Pares | Spearman | Mismo documento top | Diferencia máxima de puntuación |
|---|---|---|---|---|
| SciFact queries x abstracts | 400 | 0,9998 | 37/40 | 0,015 |
| Documentos largos (4K+ tokens) y páginas de imagen | 120 (14 largos, 31 imagen) | 0,9999 | 10/10 | 0,020 |

| Test de reranking | Consultas | Reranked | Solo embeddings | Tras reranking |
|---|---|---|---|---|
| ViDoRe v3 Computer Science (imágenes de página) | 50 | top 10 | 0,7952 | 0,8315 |
| SciFact slice (1.000 abstracts) | 50 | top 20 | 0,9019 | 0,8847 |

| Tokens por entrada | Batch | Pares/s | Tokens/s | Memoria pico |
|---|---|---|---|---|
| 513 | 1 | 5,56 | 2.850 | 8,82 GB |
| 513 | 16 | 4,93 | 2.531 | 9,74 GB |
| 513 | 64 | 5,0 | 2.563 | 12,62 GB |
| 4097 | 1 | 0,55 | 2.255 | 9,44 GB |
| 4097 | 16 | 0,55 | 2.261 | 16,77 GB |
| 4097 | 64 | 0,55 | 2.240 | 41,75 GB |

No se han publicado resultados de MMLU, HumanEval o GSM8K, ya que el modelo no es generativo.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon con MLX; el autor indica que se construyó y probó en un Apple M5 Max con 128 GB de memoria unificada.
- Memoria: el artefacto ocupa 8,7 GB en disco; la memoria pico medida en inferencia va de 8,82 GB (entrada de 513 tokens, batch 1) a 41,75 GB (entrada de 4.097 tokens, batch 64).
- GPU dedicadas (A100, H100, RTX 4090): no soportadas por esta conversión, que depende de MLX y Apple Silicon.
- Despliegue: paquete `nemotron-retrieval-mlx` (instalable desde el repositorio de GitHub), con servidor local `python -m nemotron_mlx.server --rerank ... --port 8095`.
- Throughput medido: 5,56 pares/s con entradas de 513 tokens y batch 1; 0,55 pares/s con entradas de 4.097 tokens.
- No se dispone de datos de latencia por petición ni de soporte para vLLM, llama.cpp, Ollama o TGI en esta conversión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron-3.5-Rerank-8B-MLX-8bit (esta ficha) | 8,38B | 32.768 | Texto + imagen | OpenMDW 1.1 | MLX safetensors 8-bit |
| nvidia/Nemotron-3.5-Rerank-8B-BF16 | 8,38B (no confirmado en la información disponible) | 32.768 | Texto + imagen | OpenMDW 1.1 | safetensors bf16 (transformers) |
| Nemotron-3.5-Embed-8B-mlx-8bit | no disponible | no disponible | Texto (embeddings) | no disponible | MLX 8-bit |

La comparación con alternativas de otros fabricantes (por ejemplo, rerankers de Cohere, Jina o BGE) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de inglés; su uso en castellano no está validado y puede degradar la calidad del ranking.
- No es generativo: no puede usarse para responder preguntas, generar texto ni ejecutar tool calling; solo puntúa relevancia.
- En la prueba de SciFact el reranking empeoró ligeramente el nDCG@10 (0,9019 a 0,8847), lo que indica que el beneficio depende del dominio y de la calidad de la primera etapa.
- Una sola imagen por documento y un máximo de 32.768 tokens; los documentos más largos requieren truncado o fragmentación.
- Licencia OpenMDW 1.1: es necesario revisar sus términos antes de un uso comercial; el repositorio incluye el archivo `LICENSE` y avisos de terceros (`NOTICE`, `THIRD_PARTY_NOTICES.md`).
- Dependencia exclusiva de Apple Silicon y MLX: no es desplegable en GPUs NVIDIA o AMD con este artefacto.
- La cuantización de 8 bits introduce diferencias de puntuación de hasta 0,020 frente a la referencia float32, con cambios en el documento top en 3 de 40 casos en SciFact.
- Riesgo de sesgo y alucinación no evaluado en la información disponible; al ser un reranker, el riesgo se manifiesta como rankings erróneos más que como texto inventado.
- Conversión no oficial: NetProjects no está afiliado a NVIDIA; la responsabilidad del modelo original recae en NVIDIA.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Nemotron-3.5-Rerank-8B-mlx-8bit
- Modelo base: https://huggingface.co/nvidia/Nemotron-3.5-Rerank-8B-BF16
- Modelo base de la torre de lenguaje: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-BF16
- Código de la conversión: https://github.com/internet-projects/nemotron-retrieval-mlx
- MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Colección de builds MLX de NetProjects: https://huggingface.co/collections/netprojects/netprojects-mlx-builds-6ae3b2683a59a1b4fc4c0c3a
- Todos los modelos de NetProjects: https://huggingface.co/netprojects
- NetProjects: https://netprojects.com
