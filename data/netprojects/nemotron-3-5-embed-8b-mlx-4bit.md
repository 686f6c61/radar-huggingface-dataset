# netprojects/Nemotron-3.5-Embed-8B-mlx-4bit

## Resumen

Nemotron-3.5-Embed-8B-MLX-4bit es una conversión a formato MLX del modelo de embeddings multimodal `nvidia/Nemotron-3.5-Embed-8B-BF16`, publicada por NetProjects (Paris Michalas) para su ejecución en Apple Silicon. El modelo original lo desarrolla NVIDIA y está diseñado para recuperación de información (retrieval): proyecta consultas de texto y documentos —tanto texto como imágenes de página— en un mismo espacio vectorial, lo que permite búsqueda semántica sobre corpus mixtos.

La conversión cuantiza únicamente la torre de lenguaje a 4 bits (cuantización afín, group size 64), manteniendo en bf16 el codificador visual y el proyector, y calculando en float32 las normas, el mean pooling y la normalización L2. El resultado ocupa 5,0 GB frente a los aproximadamente 16 GB que requeriría el modelo en bf16, lo que lo hace viable en equipos Apple Silicon de gama alta.

Es relevante ahora porque permite ejecutar localmente un modelo de embeddings de 8.381 millones de parámetros con soporte de contexto de hasta 32.768 tokens y capacidades multimodales (texto e imagen de página) en hardware de consumo Apple, con una fidelidad medida respecto al original de 0,9836 de coseno medio en SciFact y un nDCG@10 de 0,7732 en ViDoRe v3 Computer Science, prácticamente idéntico al 0,7736 publicado por NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (torre de lenguaje + codificador visual + proyector), derivada de mistralai/Ministral-3-8B-Instruct-2512-BF16; tag de Hugging Face `mistral3` |
| Parametros totales | 8.381.155.328 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | 4-bit afín con group size 64 en la torre de lenguaje; bf16 en vision encoder y proyector; float32 en normas, mean pooling y normalización L2 |
| Idiomas soportados | en (inglés) |
| Licencia | OpenMDW License Agreement 1.1 (`openmdw-1.1`); modelo base construido sobre Ministral-3-8B-Instruct-2512-BF16 (Apache-2.0) |
| Formato de pesos | safetensors (MLX); repositorio de 5,4 GB, build de 5,0 GB |

## Arquitectura y entrenamiento

El modelo es un encoder de embeddings multimodal construido sobre la arquitectura Mistral 3 (tag `mistral3`), con una torre de lenguaje derivada de Ministral-3-8B-Instruct-2512-BF16 y un codificador visual con proyector que permite procesar imágenes de página como documentos. La salida es un vector normalizado L2 obtenido mediante mean pooling calculado en float32. Soporta vectores Matryoshka, de modo que pueden truncarse a dimensiones menores (1024 o 512) con pérdida controlada de calidad.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original de NVIDIA; la model card de esta conversión se limita a describir el proceso de cuantización y validación. La innovación técnica destacable de este build es la preservación selectiva de precisión: solo se cuantiza la torre de lenguaje, manteniendo el pipeline de visión y las operaciones numéricas críticas en bf16/float32, lo que explica la alta fidelidad respecto al original. La tokenización es idéntica a la del modelo de referencia en todas las entradas probadas.

## Capacidades

- Generación de embeddings de texto para búsqueda semántica y sentence similarity.
- Embeddings multimodales: consultas de texto y documentos que pueden ser texto, imagen de página o una combinación de texto e imagen (por ejemplo, una figura con su pie).
- Recuperación sobre documentos largos, con ventana de hasta 32.768 tokens.
- Vectores Matryoshka: truncado a 1024 o 512 dimensiones para reducir coste de almacenamiento y latencia de búsqueda.
- Similitud coseno directa gracias a la normalización L2 de las salidas.
- Servidor local compatible con endpoints estilo OpenAI (`/v1/embeddings`) y estilo Cohere/Jina (`/v1/rerank`), con imágenes en data URL o base64.
- Procesamiento de una imagen por documento.
- No soporta tool calling, agentes ni razonamiento multi-step: es un modelo de feature extraction, no un modelo generativo conversacional.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Búsqueda semántica sobre documentación técnica: indexar manuales y artículos con `passage: …` y consultar con `query: …`; los 32.768 tokens de contexto permiten indexar documentos completos sin troceado agresivo.
- Recuperación sobre PDFs escaneados y páginas maquetadas: el codificador visual permite embeber la imagen de la página directamente, útil para corpus donde el OCR es costoso o poco fiable.
- RAG local en Mac: desplegar el servidor MLX con endpoint `/v1/embeddings` en un Apple Silicon y alimentar un pipeline de generación aumentada sin enviar datos a la nube.
- Búsqueda en bases de conocimiento con figuras y tablas: al aceptar entradas `{"text": "Figure 3", "image": "chart.png"}`, se pueden recuperar gráficos por su contenido visual y su pie de figura.
- Reranking de resultados: el endpoint `/v1/rerank` permite reordenar candidatos de un retrieval inicial de menor coste, mejorando la precisión final.
- Indexación a gran escala con vectores reducidos: usar la salida Matryoshka a 512 dimensiones (nDCG@10 de 0,6678 en ViDoRe v3 CS) para almacenar millones de vectores con menor huella de memoria, reservando 1024 o la dimensión completa para la fase de reranking.
- Deduplicación y clustering de documentos: la similitud coseno entre embeddings permite agrupar documentos near-duplicate en corpus editoriales o científicos.

## Benchmarks y rendimiento

Fidelidad respecto al código de NVIDIA en float32 (medido en este build):

| Test set | Entradas | Coseno min / medio | Mismo top-1 | Solapamiento top-10 |
|---|---|---|---|---|
| SciFact (queries y abstracts) | 200 | 0,9786 / 0,9836 | 39/40 | 0,95 |
| Documentos largos (4K+ tokens) e imágenes de página | 52 (3 largos, 8 imagen) | 0,9702 / 0,9831 | 10/10 | 0,95 |

El coseno más bajo en imágenes de página fue 0,9702 y en documentos de más de 4K tokens, 0,9940.

Recuperación sobre imágenes de página, ViDoRe v3 Computer Science (inglés), 1.360 imágenes, nDCG@10 según MTEB:

| Configuración | nDCG@10 | Recall@100 |
|---|---|---|
| Este build | 0,7732 | 0,9783 |
| Puntuación publicada por NVIDIA (modelo original, MTEB) | 0,7736 | no disponible |
| Este build, Matryoshka 1024-d | 0,7479 | no disponible |
| Este build, Matryoshka 512-d | 0,6678 | no disponible |

Recuperación de texto, SciFact (BEIR), primeras 100 queries de test contra abstracts relevantes más aleatorios (1.000 en total): nDCG@10 de 0,9080, frente a 0,9134 del modelo original con el mismo código.

Rendimiento medido (documentos por segundo, con otros servidores de modelo detenidos):

| Tokens por entrada | Batch | Docs/s | Tokens/s | Memoria pico |
|---|---|---|---|---|
| 506 | 1 | 6,36 | 3.221 | 5,04 GB |
| 506 | 16 | 5,34 | 2.704 | 5,75 GB |
| 506 | 64 | 5,35 | 2.709 | 8,59 GB |
| 4.090 | 1 | 0,58 | 2.384 | 5,46 GB |
| 4.090 | 16 | 0,58 | 2.379 | 12,78 GB |
| 4.090 | 64 | 0,58 | 2.363 | 37,71 GB |

## Requisitos de hardware

- VRAM/unified memory estimada: 5,04 GB de pico con entradas de 506 tokens y batch 1; 8,59 GB con batch 64; 37,71 GB con entradas de 4.090 tokens y batch 64.
- Hardware de referencia: Apple M5 Max con 128 GB de memoria unificada, donde se construyó y validó el modelo.
- Cabe en equipos Apple Silicon de gama alta; el repositorio ocupa 5,4 GB en disco y el build 5,0 GB. No está pensado para GPU NVIDIA: el formato es MLX y no se distribuyen pesos GGUF ni safetensors estándar.
- Despliegue: librería `mlx`, `mlx-lm` y `mlx-vlm`, más el paquete `nemotron-retrieval-mlx` (instalable desde GitHub) que expone la clase `Embedder` y un servidor local con endpoints `/v1/embeddings` y `/v1/rerank`.
- Throughput medido: 6,36 documentos/s con entradas de 506 tokens y batch 1; 0,58 documentos/s con entradas de 4.090 tokens. El throughput en tokens se mantiene estable en torno a 2.300-3.200 tokens/s independientemente del batch.
- No se dispone de datos de latencia para GPU NVIDIA ni para CUDA en esta información.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron-3.5-Embed-8B-MLX-4bit (este) | 8.381 M | 32.768 tokens | Sí (texto + imagen de página) | OpenMDW 1.1 | MLX safetensors 4-bit |
| nvidia/Nemotron-3.5-Embed-8B-BF16 | 8.381 M | 32.768 tokens | Sí | OpenMDW 1.1 | safetensors bf16 |
| Ministral-3-8B-Instruct-2512-BF16 | no disponible | no disponible | no disponible | Apache-2.0 | safetensors bf16 |

La comparación con alternativas de la misma categoría (modelos de embeddings de 7-8B con soporte multimodal) no está disponible en la información proporcionada; no se aportan datos de otros modelos de retrieval multimodal con los que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Solo soporta inglés según la model card (`language: en`); el rendimiento en otros idiomas no está validado.
- Es un modelo de embeddings, no generativo: no produce texto, no soporta tool calling, agentes ni razonamiento multi-step.
- Procesa una sola imagen por documento; no admite múltiples imágenes en una misma entrada.
- La cuantización a 4 bits introduce una degradación medible: coseno mínimo de 0,9702 frente al original en imágenes de página y nDCG@10 de 0,9080 frente a 0,9134 en SciFact. El truncado Matryoshka a 512 dimensiones degrada notablemente la recuperación multimodal (0,6678 frente a 0,7732).
- El uso de memoria crece de forma acusada con entradas largas y batches grandes: 37,71 GB con 4.090 tokens y batch 64.
- Licencia OpenMDW 1.1, no Apache-2.0: conviene revisar sus términos antes de uso comercial, ya que impone condiciones específicas distintas de las licencias permisivas habituales. El modelo base Ministral-3-8B-Instruct-2512-BF16 sí es Apache-2.0, según el NOTICE.
- Este repositorio no está afiliado a NVIDIA; los créditos del modelo son de NVIDIA y NetProjects solo cambia formato y precisión. Para producción en GPU NVIDIA debe usarse el modelo original.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de recuperación incorrecta: la similitud semántica puede devolver documentos relacionados temáticamente pero no relevantes, especialmente con vectores truncados.
- No se han publicado datos sobre sesgos del corpus de entrenamiento en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Nemotron-3.5-Embed-8B-mlx-4bit
- Modelo base de NVIDIA: https://huggingface.co/nvidia/Nemotron-3.5-Embed-8B-BF16
- Repositorio de código: https://github.com/internet-projects/nemotron-retrieval-mlx
- MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- NetProjects: https://netprojects.com
- Colección de builds MLX de NetProjects: https://huggingface.co/collections/netprojects/netprojects-mlx-builds-6ae3b2683a59a1b4fc4c0c3a
- Todos los modelos de NetProjects: https://huggingface.co/netprojects
- Licencia OpenMDW 1.1: incluida como archivo `LICENSE` en el repositorio del modelo
