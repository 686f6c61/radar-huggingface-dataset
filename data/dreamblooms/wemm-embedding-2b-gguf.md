# DreamBlooms/WeMM-Embedding-2B-GGUF

## Resumen

WeMM-Embedding-2B es un modelo de embeddings multimodales universales desarrollado por Tencent, construido sobre la arquitectura Qwen3.5. Acepta entradas de texto, imágenes, vídeos, documentos visuales y combinaciones intercaladas de estos, y devuelve un vector de 2048 dimensiones normalizado con norma L2. No soporta audio. El modelo está diseñado para tareas de recuperación y búsqueda multimodal, y destaca por su rendimiento en el benchmark MMEB-v2, donde supera a alternativas de tamaño similar.

Este repositorio concreto, DreamBlooms/WeMM-Embedding-2B-GGUF, es una versión cuantizada en formato GGUF del modelo original de Tencent. Incluye dos archivos de cuantización con metadatos que permiten su uso directo en Ollama como modelo de embeddings, además de un proyector visual independiente (mmproj) para cargas multimodales. La cuantización GGUF facilita el despliegue en entornos con recursos limitados, manteniendo la funcionalidad completa del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basado en Qwen3.5 |
| Parametros totales | 2.389.393.216 (2,4 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones especificas no documentadas en el repo) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con proyector visual en bf16) |

## Arquitectura y entrenamiento

El modelo base WeMM-Embedding-2B se construye sobre Qwen3.5, un modelo de lenguaje multimodal de la familia Qwen. La arquitectura combina un codificador de vision con un modelo de lenguaje para procesar entradas heterogeneas (texto, imagen, video, documentos visuales) y produce embeddings unificados de 2048 dimensiones. El modelo emplea pooling de tipo last-token, como se indica en los metadatos GGUF (`qwen35.pooling_type=3`), y soporta embeddings Matryoshka (MRL), que permiten truncar la dimension del embedding manteniendo gran parte del rendimiento.

No se dispone de informacion detallada sobre el proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) en la documentacion publica consultada. El informe tecnico en arXiv (2608.24053) contiene los detalles completos, pero no estan resumidos en la informacion disponible.

## Capacidades

- Generacion de embeddings multimodales: acepta texto, imagenes, videos, documentos visuales y entradas intercaladas (por ejemplo, varias imagenes con texto).
- Embeddings de 2048 dimensiones normalizados con L2, listos para busqueda por similitud coseno.
- Soporte de Matryoshka Embeddings (MRL): permite reducir la dimension a 256, 512, 1024, etc., manteniendo hasta el 98,7 % del rendimiento en tareas de imagen y video con 256 dimensiones.
- Integracion con Sentence Transformers: carga directa mediante `SentenceTransformer` y metodos `encode_query` / `encode_document`.
- Compatible con Ollama como modelo de embeddings gracias a los metadatos GGUF inyectados.
- Soporte de servidores de inferencia: vLLM (version 0.27.0) y SGLang (version 0.5.9) con modos de pooling dedicados.
- Multilingue limitado a chino e ingles.

## Casos de uso

- Busqueda multimodal en bases de datos de contenido: indexar imagenes, videos y documentos junto con texto, y permitir consultas que combinen varios tipos de entrada. El modelo genera embeddings unificados que se pueden comparar con similitud coseno.
- Recuperacion de documentos visuales: procesar facturas, informes escaneados o capturas de pantalla y buscar por descripcion textual o por contenido visual. Su rendimiento en tareas VisDoc (NDCG@5 de 80,7) lo hace adecuado para esta tarea.
- Sistemas de recomendacion de contenido: generar embeddings de items multimedia (videos, imagenes) y de preferencias de usuario para recomendar contenido relevante.
- Deduplicacion de contenido: detectar duplicados o variantes de imagenes, videos o documentos comparando sus embeddings.
- Clasificacion y agrupacion de activos multimedia: agrupar colecciones de imagenes o videos por similitud semantica o visual para organizar bibliotecas digitales.
- Chatbots con conocimiento multimodal: integrar el modelo en un pipeline de recuperacion aumentada (RAG) que permita al asistente buscar informacion en documentos, imagenes o videos antes de responder.

## Benchmarks y rendimiento

El informe tecnico publica resultados en el benchmark MMEB-v2, que incluye 78 conjuntos de datos. Las metricas son Hit@1 para tareas de imagen y video, y NDCG@5 para documentos visuales. La tabla siguiente compara WeMM-Embedding-2B con otros modelos de tamano similar:

| Modelo | Tamano | AVG | Image | Video | VisDoc |
| --- | ---: | ---: | ---: | ---: | ---: |
| VLM2Vec | 2B | 47,8 | 59,7 | 29,0 | 44,0 |
| GME | 2B | 55,4 | 51,9 | 33,9 | 76,8 |
| VLM2Vec-V2 | 2B | 59,3 | 64,9 | 34,9 | 69,2 |
| Qwen3-VL-Embedding | 2B | 73,2 | 75,0 | 61,9 | 79,2 |
| DME-Small | 2B | 74,8 | 75,9 | 65,6 | 79,9 |
| **WeMM-Embedding** | **2B** | **77,9** | **79,6** | **70,8** | **80,7** |
| WeMM-Embedding | 4B | 79,2 | 80,8 | 72,1 | 82,0 |

El modelo de 2B supera a todas las alternativas de su tamano y se acerca al rendimiento de la version de 4B. No se han publicado resultados de benchmarks especificos para la version GGUF cuantizada, pero se espera una degradacion minima en tareas de embedding.

## Requisitos de hardware

- Al ser un modelo de 2,4 B de parametros en formato GGUF, puede ejecutarse en GPUs de consumo con al menos 6 GB de VRAM en cuantizaciones bajas (por ejemplo, Q4_K_M). No se dispone de datos oficiales de VRAM para cada cuantizacion.
- GPUs recomendadas: NVIDIA RTX 3060 (12 GB) o superior, RTX 4090, o GPUs de datacenter como A10, A100 o H100 para despliegues de alta concurrencia.
- El proyector visual (mmproj) en bf16 anade requisitos adicionales de memoria cuando se procesan entradas multimodales.
- Opciones de despliegue: Ollama (compatible directamente), vLLM (version 0.27.0 o superior), SGLang (version 0.5.9 o superior), o mediante Sentence Transformers en Python.
- La latencia y el throughput dependen de la cuantizacion y del hardware; no se han publicado cifras oficiales.

## Comparativa con modelos similares

| Modelo | Tamano | Contexto | MMEB-v2 AVG | Licencia | Formato |
| --- | ---: | ---: | ---: | --- | --- |
| WeMM-Embedding-2B (GGUF) | 2,4 B | no disponible | 77,9 | Apache 2.0 | GGUF |
| Qwen3-VL-Embedding | 2B | no disponible | 73,2 | Apache 2.0 | safetensors |
| VLM2Vec-V2 | 2B | no disponible | 59,3 | MIT | safetensors |
| GME | 2B | no disponible | 55,4 | MIT | safetensors |

WeMM-Embedding-2B supera claramente a sus competidores directos en el benchmark MMEB-v2, especialmente en tareas de video (70,8 frente a 61,9 de Qwen3-VL-Embedding). La version GGUF ofrece la ventaja de un despliegue mas ligero y compatible con Ollama, aunque con una posible perdida minima de precision respecto al modelo original en safetensors.

## Limitaciones y advertencias

- No soporta entrada de audio, solo texto, imagen, video y documentos visuales.
- Idiomas limitados a chino e ingles; el rendimiento en otros idiomas no esta garantizado.
- La version GGUF puede presentar una degradacion ligera en la calidad de los embeddings respecto al modelo original en bf16, dependiendo del nivel de cuantizacion.
- No se han publicado evaluaciones de sesgos o alucinaciones especificas para este modelo. Como modelo de embeddings, no genera texto, pero los sesgos en los datos de entrenamiento pueden afectar a la calidad de las representaciones.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar el archivo LICENSE del repositorio original de Tencent para confirmar condiciones adicionales.
- Para produccion, es necesario validar el rendimiento con datos propios, especialmente en dominios especializados o con vocabulario tecnico.

## Enlaces

- Repositorio HuggingFace (version GGUF): https://huggingface.co/DreamBlooms/WeMM-Embedding-2B-GGUF
- Modelo original en HuggingFace: https://huggingface.co/tencent/WeMM-Embedding-2B
- Informe tecnico (arXiv): https://arxiv.org/abs/2608.24053
- Repositorio GitHub de Tencent: https://github.com/Tencent/WeMM-Embedding
- Articulo de lanzamiento: https://korshunov.ai/en/article/20681-tencent-releases-wemm-embedding-2b-multimodal-embedding-model/
