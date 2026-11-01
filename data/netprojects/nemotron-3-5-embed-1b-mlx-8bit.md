# netprojects/Nemotron-3.5-Embed-1B-mlx-8bit

## Resumen

Nemotron-3.5-Embed-1B-mlx-8bit es una conversión a formato MLX del modelo de embeddings multimodal `nvidia/Nemotron-3.5-Embed-1B-BF16`, publicada por NetProjects para su ejecución en Apple Silicon. El modelo original lo desarrolla NVIDIA y está diseñado para recuperación de información (retrieval): proyecta consultas de texto y documentos (texto o imágenes de página) en un mismo espacio vectorial, de modo que pueden compararse directamente mediante similitud coseno.

La conversión cuantiza únicamente la torre de lenguaje a 8 bits con cuantización afín y tamaño de grupo 64, mientras mantiene el codificador visual, el proyector, las normas, el mean pooling y la normalización L2 en su precisión original (bf16 o float32 según el componente). El resultado ocupa 2,0 GB y conserva un comportamiento prácticamente idéntico al del modelo de referencia de NVIDIA: la similitud coseno mínima medida frente a la implementación original en float32 es de 0,9996.

Su relevancia radica en que permite ejecutar un modelo de embeddings multimodal de 1.554 millones de parámetros con contexto de hasta 32.768 tokens en hardware Apple Silicon, con soporte de vectores Matryoshka (dimensiones reducidas como 1024 o 512) y con un servidor local compatible con las APIs `/v1/embeddings` y `/v1/rerank`. Está pensado para pipelines de búsqueda semántica y RAG sobre documentos mixtos (texto e imágenes de página) en entornos locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (torre de lenguaje basada en mistral3 + codificador visual + proyector), tarea de embeddings |
| Parametros totales | 1.554.710.528 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 32.768 tokens |
| Tipos de cuantizacion | 8-bit afín (group size 64) en la torre de lenguaje; vision encoder y proyector en bf16; normas, mean pooling y normalización L2 en float32 |
| Idiomas soportados | en (inglés) |
| Licencia | OpenMDW License Agreement 1.1 (`openmdw-1.1`) |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo es un encoder de embeddings construido sobre `mistralai/Ministral-3-3B-Instruct-2512-BF16` (Apache-2.0), según se indica en el fichero `NOTICE` del repositorio. Combina una torre de lenguaje con un codificador visual y un proyector que alinean imágenes de página y texto en el mismo espacio vectorial. La salida se obtiene mediante mean pooling y normalización L2 calculados en float32, lo que garantiza que las similitudes coseno sean estables. El modelo admite entradas con el template de chat de NVIDIA, con prefijos `query: ` para consultas y `passage: ` para documentos, y una imagen por documento.

Esta build concreta no reentrena ni modifica los pesos más allá de la cuantización: aplica cuantización afín de 8 bits con group size 64 exclusivamente a la torre de lenguaje y conserva el resto de componentes en su precisión original. La conversión se hizo desde la revisión upstream `e24ca1e346bcc53572bd7bdc02b3e8ebf66c197c`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original; la model card de esta conversión no los detalla.

## Capacidades

- Generación de embeddings de texto para búsqueda semántica y recuperación de información.
- Embeddings multimodales: consultas de texto contra documentos en texto o imágenes de página, en un espacio vectorial compartido.
- Similitud coseno directa entre consultas y documentos (vectores L2-normalizados).
- Vectores Matryoshka: permite truncar la dimensión de salida (por ejemplo, 1024 o 512) con pérdida acotada de calidad.
- Soporte de múltiples formatos de imagen de entrada: ruta, bytes, imagen PIL o data URL.
- Servidor local con endpoints estilo OpenAI (`/v1/embeddings`) y estilo Cohere/Jina (`/v1/rerank`).
- Contexto largo de hasta 32.768 tokens, adecuado para documentos extensos.
- Capacidad multilingüe limitada al inglés según la model card.
- No se documentan capacidades de tool calling, agentes ni modos de razonamiento; es un modelo exclusivamente de embeddings.

## Casos de uso

- Búsqueda semántica sobre documentación técnica: indexar manuales y artículos como `passage:` y consultar con `query:`; el contexto de 32.768 tokens permite indexar secciones largas sin truncar.
- RAG multimodal sobre PDFs escaneados: indexar imágenes de página directamente con el codificador visual y recuperarlas a partir de preguntas en texto, útil en archivística y gestión documental.
- Recuperación en literatura científica: con un nDCG@10 de 0,7518 en SciFact, es adecuado para motores de búsqueda sobre abstracts y artículos.
- Reranking local de resultados: el servidor incluido expone `/v1/rerank`, lo que permite reordenar candidatos de un primer recuperador léxico o vectorial en un pipeline de dos etapas.
- Búsqueda en dispositivos Apple Silicon sin conexión: al ocupar 2,0 GB y ejecutarse con MLX, puede desplegarse en un Mac portátil para asistentes de documentación offline.
- Deduplicación y clustering de documentos: los embeddings normalizados permiten agrupar documentos similares por similitud coseno en pipelines de limpieza de corpus.
- Indexación de documentación con figuras y tablas: la combinación `{"text": ..., "image": ...}` permite enriquecer cada fragmento con su contexto visual.

## Benchmarks y rendimiento

Resultados medidos en esta build y comparados con la implementación de referencia de NVIDIA en float32:

| Prueba | Conjunto | Métrica | Resultado |
|---|---|---|---|
| Fidelidad vs. NVIDIA | SciFact (200 consultas y abstracts) | Coseno mín. / media | 0,9997 / 0,9999 |
| Fidelidad vs. NVIDIA | Documentos largos 4K+ tokens e imágenes de página (52) | Coseno mín. / media | 0,9996 / 0,9999 |
| Fidelidad vs. NVIDIA | SciFact | Top-1 idéntico | 40/40 |
| Fidelidad vs. NVIDIA | Documentos largos e imágenes | Top-10 overlap | 0,99 |
| Recuperación de imágenes de página | ViDoRe v3 Computer Science (inglés), 1.360 imágenes | nDCG@10 | 0,7643 |
| Recuperación de imágenes de página | ViDoRe v3 Computer Science (inglés) | Recall@100 | 0,9719 |
| Recuperación de imágenes de página | ViDoRe v3, vectores Matryoshka 1024-d | nDCG@10 | 0,7552 |
| Recuperación de imágenes de página | ViDoRe v3, vectores Matryoshka 512-d | nDCG@10 | 0,7277 |
| Recuperación de texto | SciFact (BEIR), 300 consultas y 5.183 abstracts | nDCG@10 | 0,7518 |
| Recuperación de texto | SciFact (BEIR) | Recall@100 | 0,96 |

Referencia publicada por NVIDIA para ViDoRe v3 Computer Science: nDCG@10 de 0,7642 con el modelo original.

Rendimiento de inferencia en texto (documentos por segundo, con otros servidores detenidos):

| Tokens por entrada | Batch | Docs/s | Tokens/s | Memoria pico |
|---|---|---|---|---|
| 506 | 1 | 40,32 | 20.404 | 1,75 GB |
| 506 | 16 | 53,32 | 26.978 | 2,09 GB |
| 506 | 64 | 42,38 | 21.445 | 3,4 GB |
| 4090 | 1 | 3,65 | 14.944 | 2,03 GB |
| 4090 | 16 | 3,79 | 15.490 | 5,64 GB |
| 4090 | 64 | 3,73 | 15.275 | 18,9 GB |

## Requisitos de hardware

- VRAM/memoria unificada estimada: 1,75 GB en batch 1 y 3,4 GB en batch 64 para entradas de 506 tokens; 18,9 GB en batch 64 para entradas de 4.096 tokens.
- Hardware de referencia: Apple M5 Max con 128 GB de memoria unificada, donde se obtuvieron 40,32 docs/s en batch 1.
- GPU dedicadas: no se han publicado resultados de esta build en A100, H100 ni RTX 4090; el formato MLX está orientado a Apple Silicon.
- GPU de consumo: al ocupar 2,0 GB en disco y menos de 4 GB en inferencia típica, cabría en GPUs consumer con suficiente memoria, pero la build MLX no está pensada para CUDA.
- Opciones de despliegue: MLX mediante el paquete `nemotron_mlx` (`pip install git+https://github.com/internet-projects/nemotron-retrieval-mlx`), servidor local con `python -m nemotron_mlx.server`; no se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI para esta build.
- Latencia y throughput: ver tabla de velocidad; el pico se alcanza en batch 16 con 53,32 docs/s y 26.978 tokens/s.

## Comparativa con modelos similares

No se dispone de datos medidos de modelos alternativos en la información proporcionada. La comparación se limita a la variante original del mismo modelo:

| Modelo | Parámetros | Contexto | Formato | Licencia | nDCG@10 ViDoRe v3 CS |
|---|---|---|---|---|---|
| Nemotron-3.5-Embed-1B-mlx-8bit (esta build) | 1.554.710.528 | 32.768 tokens | safetensors MLX, 8-bit | OpenMDW 1.1 | 0,7643 |
| nvidia/Nemotron-3.5-Embed-1B-BF16 (original) | no disponible | 32.768 tokens | safetensors BF16 | OpenMDW 1.1 | 0,7642 (publicado) |

No se dispone de comparación con otros modelos de embeddings multimodales en la información proporcionada.

## Limitaciones y advertencias

- Idioma: la model card declara únicamente inglés; el rendimiento en castellano u otros idiomas no está evaluado.
- Formato: es una build MLX para Apple Silicon; no es directamente utilizable en CUDA ni en servidores x86 convencionales.
- Cuantización: la torre de lenguaje está en 8 bits, lo que introduce una desviación mínima (coseno mínimo de 0,9996 frente al original), pero no nula; en aplicaciones con umbrales muy estrictos conviene validar.
- Sesgos: no se documentan análisis de sesgo en la información proporcionada; al ser un modelo entrenado principalmente en inglés, puede heredar sesgos del corpus original.
- Alucinación: al ser un modelo de embeddings, no genera texto, pero las recuperaciones pueden devolver documentos irrelevantes si la consulta es ambigua; el Recall@100 de 0,96 en SciFact no garantiza precisión perfecta.
- Licencia: OpenMDW 1.1 es una licencia con condiciones; es necesario revisar el fichero `LICENSE` antes de un uso comercial. El modelo base Ministral-3-3B-Instruct está bajo Apache-2.0, según el `NOTICE`.
- Autoría: la conversión la realiza NetProjects, no afiliada a NVIDIA; los problemas de la build deben reportarse al repositorio de NetProjects.
- Dimensión de salida: el truncamiento Matryoshka reduce la calidad (nDCG@10 de 0,7643 a 0,7552 con 1024-d y a 0,7277 con 512-d); debe elegirse la dimensión según el compromiso entre almacenamiento y precisión.
- Una imagen por documento: el modelo no admite múltiples imágenes por documento en una misma entrada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/netprojects/Nemotron-3.5-Embed-1B-mlx-8bit
- Modelo original de NVIDIA: https://huggingface.co/nvidia/Nemotron-3.5-Embed-1B-BF16
- Repositorio de código: https://github.com/internet-projects/nemotron-retrieval-mlx
- MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Colección de builds MLX de NetProjects: https://huggingface.co/collections/netprojects/netprojects-mlx-builds-6ae3b2683a59a1b4fc4c0c3a
- Todos los modelos de NetProjects: https://huggingface.co/netprojects
- NetProjects: https://netprojects.com
