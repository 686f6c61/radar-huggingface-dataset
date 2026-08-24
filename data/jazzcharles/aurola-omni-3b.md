# Jazzcharles/AuroLA-Omni-3B

## Resumen

AuroLA-Omni-3B es un modelo de embeddings omni-modal desarrollado por Jazzcharles, construido a partir de la arquitectura Qwen2.5-Omni-3B y el modelo de recuperación audio-texto AuroLA-3B. Se trata de un modelo de recuperación multimodal que acepta entradas de texto, imagen, audio y vídeo, y genera representaciones vectoriales normalizadas aptas para tareas de búsqueda y similitud entre modalidades. El modelo se distribuye con un layout de checkpoint compatible con SentenceTransformers, lo que facilita su integración en pipelines de recuperación.

Su relevancia radica en que aborda la recuperación cross-modal (audio-texto, vídeo-texto, imagen-texto) con un único backbone de modelo de lenguaje multimodal, en lugar de usar codificadores separados por modalidad. Según el paper asociado (arXiv:2602.18010), el modelo base AuroLA supera a sistemas previos como PE-AV utilizando aproximadamente un 1 % de los datos de entrenamiento de este último. El modelo tiene 4.702.358.528 parámetros totales (alrededor de 4,7 mil millones) y se publica en formato BF16, con un peso del repositorio de 9,4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-Omni-3B (transformer multimodal, con codificadores de audio, imagen y vídeo) |
| Parametros totales | 4.702.358.528 (aproximadamente 4,7 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos publicados); compatible con cuantizacion posterior mediante herramientas estándar |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

AuroLA-Omni-3B hereda la arquitectura de Qwen2.5-Omni-3B, un modelo de lenguaje multimodal que integra encoders dedicados para audio, imagen y vídeo junto con un decodificador de lenguaje. El modelo se ha adaptado para tareas de embedding mediante un ajuste fino basado en el checkpoint de AuroLA-3B, que se centra específicamente en la recuperación de audio-texto. El paper asociado describe un enfoque de escalado de recuperación audio-texto con modelos de lenguaje multimodal, y reporta mejoras frente a modelos especializados como PE-PV, con una fracción muy pequeña de los datos de entrenamiento. La capa de embedding se extrae del último token no de padding de la secuencia, normalizado L2, siguiendo el protocolo de SentenceTransformers.

No se dispone de información pública sobre la composición exacta del dataset de entrenamiento, el número de tokens procesados ni si se utilizaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá de la integración de las capacidades omni de Qwen2.5-Omni con el objetivo de recuperación multimodal.

## Capacidades

- Generación de embeddings multimodales: acepta texto, imagen, audio y vídeo como entrada y produce representaciones vectoriales normalizadas.
- Recuperación cross-modal: permite calcular similitud entre consultas textuales y documentos de otras modalidades (imagen, vídeo, audio) y viceversa.
- Compatible con SentenceTransformers: se integra con la API `encode_query` y `encode_document` para búsquedas asimétricas.
- Uso con Transformers: se puede usar directamente con la clase `Qwen2_5OmniThinkerForConditionalGeneration` para obtener representaciones a partir de los últimos hidden states.
- Soporte de múltiples formatos de entrada: imágenes (jpg, png), vídeos (mp4) y audio (wav) mediante el paquete `qwen-omni-utils`.
- No se documenta soporte explícito de tool calling, function calling o capacidades de agente, ya que el modelo está orientado a extracción de características y no a generación conversacional.

## Casos de uso

- Búsqueda multimodal en bases de datos de medios: se puede indexar un catálogo de imágenes, vídeos y audio con `encode_document` y luego consultar con una descripción textual mediante `encode_query`, obteniendo los elementos más similares por similitud coseno.
- Recuperación de audio por descripción textual: el modelo es específicamente fuerte en audio-texto (resultado hit@1 de 46,8 en MMEB-V3), por lo que es adecuado para buscar clips de sonido o podcasts a partir de descripciones escritas.
- Sistemas de recomendación de contenido: a partir de embeddings de vídeo e imagen, se pueden recomendar elementos similares a un usuario basándose en una consulta textual o en un elemento de referencia.
- Búsqueda de documentos visuales (VisDoc): con un resultado ndcg_linear@5 de 69,2, el modelo puede recuperar documentos escaneados o capturas de pantalla a partir de consultas textuales.
- Indexado de contenido generado por usuarios en plataformas: permite buscar en foros, redes sociales o repositorios de vídeo y audio con una única infraestructura de embeddings.
- Sistemas de moderación o análisis de contenido: se pueden construir clasificadores de similitud entre contenido multimodal y categorías textuales definidas por el equipo de moderación.
- Integración en pipelines de RAG multimodal: como modelo de embedding, puede servir para indexar y recuperar fragmentos de texto, imágenes o audio dentro de un sistema de generación aumentada por recuperación.

## Benchmarks y rendimiento

El modelo reporta resultados en el benchmark MMEB-V3, presentados en la model card. Se muestran las siguientes puntuaciones:

| Grupo de modalidad | Métrica | Puntuación |
|---|---|---|
| Imagen | hit@1 | 65,1 |
| Vídeo | hit@1 | 48,9 |
| VisDoc | ndcg_linear@5 | 69,2 |
| Texto | hit@1 | 32,4 |
| Audio | hit@1 | 46,8 |
| Agentic | hit@1 | 36,5 |
| Promedio | - | 46,7 |

No se han publicado comparaciones directas con otros modelos en la información disponible. El paper asociado (arXiv:2602.18010) menciona que AuroLA supera a PE-PV con solo un 1 % de los datos de entrenamiento, pero no se ofrecen números concretos en la model card.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 4,7 mil millones de parámetros en BF16 (aproximadamente 9,4 GB en disco). La inferencia de embeddings requiere memoria suficiente para cargar los pesos y los activaciones de la secuencia de entrada; se estima un mínimo de 12-16 GB de VRAM para ejecutar el modelo completo en BF16.
- GPUs recomendadas: una NVIDIA RTX 4090 (24 GB) o una A100 (40 GB) son adecuadas para la inferencia. Para secuencias largas o procesamiento por lotes, se recomienda una A100 o H100.
- Consumer GPU: es posible ejecutar en GPUs de consumo como la RTX 3090 (24 GB) o RTX 4090 (24 GB) con BF16, aunque con limitaciones de batch size. Con cuantizacion de 8 bits se podría reducir el uso de VRAM a aproximadamente 5-6 GB, pero no se proporcionan pesos cuantizados oficialmente.
- Opciones de despliegue: compatible con `sentence_transformers` para integración directa en pipelines de Python, y con Transformers para uso más fino. No se documenta soporte específico para vLLM, llama.cpp u Ollama, ya que el modelo no es generativo sino de embeddings.
- Latencia y throughput: no se han publicado datos de rendimiento. El procesamiento de vídeo y audio con `process_mm_info` puede ser costoso; se recomienda ajustar `max_pixels` y `fps` para controlar la carga.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de embedding multimodal en la información proporcionada. A modo de referencia, los modelos de la familia Qwen2.5-Omni (como Qwen2.5-Omni-3B) son modelos generativos multimodales, mientras que AuroLA-Omni-3B está adaptado para recuperación. Otras alternativas del ecosistema de embeddings multimodales (como CLIP o ImageBind) se centran en imagen-texto o audio-texto, pero no ofrecen un soporte completo de vídeo y audio con un solo modelo. Se indica que no se dispone de comparativas cuantitativas en la información publicada.

## Limitaciones y advertencias

- No se ha publicado una licencia explícita, por lo que se desconoce si el uso comercial está permitido. Se recomienda consultar la página del modelo antes de usarlo en producción.
- No hay información sobre sesgos o alucinaciones; como modelo de embeddings, no genera texto libre, pero puede heredar sesgos de los datos de entrenamiento de Qwen2.5-Omni y de AuroLA.
- La longitud de contexto no está documentada; para secuencias largas (vídeos o documentos extensos) se deben ajustar los parámetros de procesamiento (`max_pixels`, `fps`) para evitar sobrecarga de memoria.
- El modelo está pensado para recuperación, no para generación. No soporta tareas conversacionales ni tool calling, lo que limita su uso en agentes autónomos.
- El idioma de los datos de entrenamiento no se especifica; es probable que el modelo funcione bien en inglés y chino por el origen de Qwen, pero no está confirmado.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un modelo muy reciente y sin validación de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jazzcharles/AuroLA-Omni-3B
- Modelo base AuroLA-3B: https://huggingface.co/Jazzcharles/AuroLA-3B
- Repositorio de código AuroLA (GitHub): https://github.com/Jazzcharles/AuroLA
- Paper asociado (arXiv): https://arxiv.org/abs/2602.18010
- PDF del paper: https://arxiv.org/pdf/2602.18010
