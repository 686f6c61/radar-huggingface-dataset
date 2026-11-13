# Mer0vin8ian/SM8750embeddinggemma-2-740m-litert-lm

## Resumen

EmbeddingGemma 2 740M es la variante multimodal completa de la familia EmbeddingGemma 2 de Google, empaquetada en formato LiteRT-LM para inferencia en dispositivo con baja latencia. El modelo combina un backbone de texto de 270M parámetros (130M de transformer más 140M de embeddings) con un codificador de visión de 170M y un codificador de audio de 300M, sumando un total de 740M parámetros. Su función es proyectar texto, código, imágenes, vídeo y audio en un único espacio vectorial compartido de 768 dimensiones.

Este repositorio concreto (`Mer0vin8ian/SM8750embeddinggemma-2-740m-litert-lm`) es una republicación del paquete oficial `litert-community/embeddinggemma-2-740m-litert-lm`, derivado a su vez del modelo base `google/embeddinggemma-2`. No se trata de un fine-tuning con datos propios: la model card es la del paquete oficial de LiteRT-LM. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que es una copia de conveniencia sin tracción comunitaria.

La relevancia del modelo reside en su propuesta de búsqueda multimodal totalmente local: permite ejecutar pipelines de recuperación semántica cruzada (texto-imagen-audio-vídeo) en hardware de consumo, sin depender de servicios en la nube. Está diseñado para integrarse en aplicaciones Android, iOS, macOS y web mediante LiteRT-LM y MediaPipe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de embeddings multimodales con codificadores modulares (texto, visión, audio) |
| Parametros totales | 740M (transformer 130M + embeddings 140M + visión 170M + audio 300M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | int4 per-channel (QAT) para el transformer; esquema de embeddings no disponible en la informacion proporcionada |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT-LM (repositorio de 7,7 GB) |

## Arquitectura y entrenamiento

El modelo sigue un diseño modular de codificadores independientes que convergen en un espacio vectorial compartido de 768 dimensiones. El backbone de texto (270M parámetros: 130M de transformer más 140M de embeddings) se complementa con un codificador visual de 170M y un codificador de audio de 300M. Esta separación permite variantes de la familia con distintas combinaciones de modalidades: la versión texto (270M), la versión texto+visión (440M) y esta versión completa de 740M con audio. El modelo admite entradas multimodales intercaladas dentro de una única ventana de contexto de 8.192 tokens.

La cuantización del transformer es int4 per-channel con Quantization-Aware Training (QAT), lo que indica que el proceso de cuantización se integró durante el entrenamiento para preservar la calidad en precisión reducida. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla en la información proporcionada si emplea atención lineal u otras innovaciones de eficiencia más allá del empaquetado LiteRT.

## Capacidades

- Generación de embeddings multimodales: proyecta texto, código, imágenes, vídeo y audio en un espacio vectorial compartido de 768 dimensiones.
- Recuperación semántica cruzada entre modalidades (por ejemplo, buscar imágenes a partir de una consulta de texto o audio).
- Procesamiento de entradas multimodales intercaladas dentro de una sola ventana de 8.192 tokens.
- Búsqueda semántica y similitud semántica entre medios (texto, imagen, vídeo, audio).
- Recuperación de voz (speech retrieval) y pipelines de búsqueda multimodal.
- Inferencia en dispositivo de baja latencia mediante LiteRT-LM.
- Integración con MediaPipe Universal Embedder, Semantic Retriever y Decision Maker.
- Capacidades multilingües: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible (el modelo es un encoder de embeddings, no un modelo generativo conversacional).

## Casos de uso

- Búsqueda semántica de imágenes en aplicaciones móviles: el codificador visual de 170M permite indexar y recuperar imágenes por consulta textual directamente en el dispositivo, sin enviar datos a la nube, gracias a la ventana de 8.192 tokens y al empaquetado LiteRT-LM.
- Recuperación de voz (speech retrieval): el codificador de audio de 300M posibilita buscar fragmentos de audio o transcripciones por similitud semántica, útil en apps de notas de voz o archivos de podcast locales.
- Base de conocimiento para aplicaciones Flutter: el repositorio oficial incluye una muestra (`samples/litert/flutter`) que usa este modelo como motor de conocimiento, adecuada para asistentes offline con recuperación aumentada.
- Búsqueda de vídeo por contenido semántico: al mapear vídeo al mismo espacio vectorial que el texto, se pueden construir índices de clips y recuperarlos mediante consultas en lenguaje natural en hardware de consumo.
- Deduplicación y clustering de contenido multimodal: calcular similitud entre ítems heterogéneos (texto, imagen, audio) para agrupar o eliminar duplicados en pipelines de datos locales.
- Recomendación de contenido cross-media: usar la similitud en el espacio compartido para sugerir imágenes o audio relacionados con un texto dado, en aplicaciones de edición o galerías.
- Filtrado y moderación en dispositivo: comparar entradas multimodales contra un conjunto de referencia de embeddings precalculados para clasificación semántica local con baja latencia.
- Benchmarking en dispositivos móviles: el notebook `embedding_gemma_ddp_benchmark.ipynb` permite medir el rendimiento del modelo en teléfonos de gama alta en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 7,7 GB, aunque el empaquetado LiteRT-LM está orientado a memoria unificada de dispositivos móviles más que a VRAM de GPU dedicada.
- GPU recomendadas: no disponible. El modelo está diseñado para inferencia en dispositivo (CPU/NPU de móviles y equipos de consumo) mediante LiteRT-LM.
- Cabe en GPU de consumo: el diseño apunta a hardware de consumo y móvil, pero no se especifican requisitos mínimos de memoria ni GPUs concretas compatibles.
- Opciones de despliegue: LiteRT-LM (Android, iOS, macOS, web), MediaPipe (Universal Embedder, Semantic Retriever, Decision Maker), Flutter mediante `litert-samples`.
- Latencia y throughput: no disponibles en la información proporcionada; el modelo se promociona para inferencia de baja latencia en dispositivo, pero sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidades | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EmbeddingGemma 2 740M (este) | 740M | Texto, imagen, vídeo, audio | 8.192 | Apache 2.0 | LiteRT-LM, MediaPipe |
| EmbeddingGemma 2 Text Vision 440M | 440M | Texto, imagen | No disponible | Apache 2.0 | LiteRT-LM |
| EmbeddingGemma 2 Text 270M | 270M | Texto | No disponible | Apache 2.0 | LiteRT-LM |

Las tres variantes comparten el mismo backbone de texto (130M transformer + 140M embeddings) y el espacio vectorial de 768 dimensiones; la diferencia está en los codificadores adicionales de visión y audio. No se dispone de datos de rendimiento comparativo entre ellas en la información proporcionada.

## Limitaciones y advertencias

- El repositorio es una republicación con 0 descargas y 0 likes; no hay evidencia de validación comunitaria ni de que los pesos empaquetados funcionen correctamente. Se recomienda usar el repositorio oficial `litert-community/embeddinggemma-2-740m-litert-lm`.
- Es un modelo de embeddings, no generativo: no produce texto ni mantiene conversaciones; no soporta tool calling ni razonamiento multi-paso.
- La cuantización int4 del transformer puede degradar ligeramente la calidad de los embeddings frente a precisión completa; no se han publicado métricas de esa degradación.
- Idiomas soportados no especificados: no se puede garantizar un rendimiento multilingüe equilibrado sin evaluación previa.
- Riesgo de sesgos: no disponible en la información proporcionada; al derivar de un modelo de Google sin documentación de sesgos en este repositorio, se recomienda evaluar el modelo base.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `google/embeddinggemma-2` y de las dependencias LiteRT-LM.
- El tamaño del repositorio (7,7 GB) es elevado para un modelo de 740M, probablemente por incluir múltiples artefactos de empaquetado; verificar qué ficheros son necesarios antes de desplegar.
- Sin datos de benchmarks ni de latencia reales, no es posible dimensionar un despliegue en producción con garantías.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Mer0vin8ian/SM8750embeddinggemma-2-740m-litert-lm
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Repositorio oficial LiteRT-LM del modelo: https://huggingface.co/litert-community/embeddinggemma-2-740m-litert-lm
- Documentación LiteRT-LM: https://developers.google.com/edge/litert-lm/overview
- Google AI Edge Gallery (Android): https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery
- Google AI Edge Gallery (iOS): https://apps.apple.com/us/app/google-ai-edge-gallery/id6749645337
- Foresight para macOS: https://developers.google.com/edge/foresight
- Demo web de búsqueda por embeddings: https://google-ai-edge.github.io/LiteRT-LM/web_demos/embedding_search/index.html
- Muestra Flutter con LiteRT: https://github.com/google-ai-edge/litert-samples/tree/main/samples/litert/flutter
- Notebook de benchmark en dispositivos: https://github.com/google-ai-edge/litert-samples/blob/main/benchmark/developer_device_platform/embedding_gemma_ddp_benchmark.ipynb
- Demo MediaPipe Semantic Retriever: https://google-ai-edge.github.io/mediapipe-samples-web/#/retrieval/semantic_retriever
- Demo MediaPipe Decision Maker: https://google-ai-edge.github.io/mediapipe-samples-web/#/decision/decision_maker
