# 72fstudio/embeddinggemma-2-740m-litert-lm

## Resumen

EmbeddingGemma 2 740M es un modelo de embeddings nativamente multimodal de la familia EmbeddingGemma 2 de Google, empaquetado en formato LiteRT-LM para inferencia en dispositivo (móvil, escritorio y web) con baja latencia. Combina un backbone de texto de 270M parámetros (130M de transformer más 140M de embeddings) con un codificador de visión de 170M y un codificador de audio de 300M, sumando 740M parámetros totales. Proyecta texto, código, imágenes, vídeo y audio en un único espacio vectorial compartido de 768 dimensiones, lo que permite comparar y recuperar contenido entre modalidades.

El modelo está pensado para pipelines de búsqueda semántica, recuperación de voz y similitud cross-media sobre hardware de consumo, admitiendo entradas multimodales intercaladas dentro de una ventana de contexto de 8.192 tokens. Frente a las variantes menores de la familia (270M solo texto y 440M texto+visión), esta versión añade el codificador de audio y es la única que cubre las cuatro modalidades.

La ficha corresponde al repositorio `72fstudio/embeddinggemma-2-740m-litert-lm`, una réplica del paquete publicado por `litert-community` a partir de `google/embeddinggemma-2`. Es relevante ahora porque traslada recuperación multimodal completa a entornos sin GPU dedicada, aunque el repositorio no incluye resultados de evaluación ni documentación adicional más allá de la model card del paquete original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso para embeddings con codificadores modulares (texto + visión + audio) y cabecera de proyección a espacio compartido |
| Parámetros totales | 740M (transformer 130M + embeddings 140M + codificador de visión 170M + codificador de audio 300M) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens |
| Dimensión del embedding | 768 |
| Tipos de cuantización | Transformer: int4 per-channel (QAT). Embeddings: int4 per-channel (QAT). Codificador de visión: int8 per-channel (QAT). Codificador de audio: no disponible (model card truncada) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (según el repositorio) |
| Formato de pesos | LiteRT-LM (librería `litert-lm`); repositorio de 7,2 GB con las distintas variantes de la familia |
| Modalidades de entrada | Texto, código, imágenes, vídeo y audio |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso que actúa como backbone de texto (130M de parámetros) y alimenta una matriz de embeddings de 140M de parámetros que produce representaciones de 768 dimensiones. Sobre ese tronco se acoplan codificadores específicos de modalidad: uno visual de 170M parámetros (variante texto+visión de 440M) y uno de audio de 300M que solo aparece en la variante de 740M. Todas las modalidades se proyectan al mismo espacio vectorial, lo que habilita similitud coseno directa entre, por ejemplo, una consulta textual y un fragmento de audio o un fotograma de vídeo.

La cuantización se aplicó con *quantization-aware training* (QAT) por canal: int4 para el transformer y las matrices de embeddings, e int8 para el codificador de visión. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO; tampoco se detalla la estrategia de alineación entre modalidades más allá de la existencia del espacio compartido. El empaquetado en LiteRT-LM está orientado explícitamente a latencia baja en dispositivo, con soporte de entradas intercaladas de varias modalidades dentro de la misma ventana de 8.192 tokens.

## Capacidades

- Generación de embeddings de texto y código en un espacio de 768 dimensiones, aptos para búsqueda semántica, similitud y clustering.
- Codificación de imágenes en el mismo espacio vectorial que el texto (recuperación texto→imagen e imagen→texto).
- Codificación de vídeo como modalidad soportada dentro del espacio compartido.
- Codificación de audio mediante el codificador de 300M, lo que habilita recuperación de voz y *speech retrieval*.
- Entradas multimodales intercaladas en una única ventana de 8.192 tokens.
- Similitud cross-media: comparación directa entre pares de modalidades distintas sin traducción intermedia.
- Integración con tareas MediaPipe como Universal Embedder, Semantic Retriever y Decision Maker.
- No es un modelo generativo: no produce texto libre, no soporta tool calling nativo ni razonamiento multi-paso por sí mismo; su salida es un vector.

## Casos de uso

- Búsqueda semántica local en aplicaciones móviles: indexar documentos y notas del usuario con embeddings de 768 dimensiones generados en el propio dispositivo, sin enviar contenido a la nube, aprovechando el empaquetado LiteRT-LM.
- Recuperación de imágenes por consulta textual: en una galería o catálogo, codificar las imágenes con el codificador de 170M y las consultas con el tronco de texto, ordenando por similitud en el espacio compartido.
- Búsqueda sobre audio y voz: indexar fragmentos de audio (reuniones, notas de voz, podcast) con el codificador de 300M y recuperarlos mediante consultas de texto, útil en apps de transcripción y archivo personal.
- Deduplicación y clustering de contenido multimodal: agrupar imágenes, vídeos y textos casi duplicados en pipelines de ingesta o CDN comparando vectores de 768 dimensiones, sin necesidad de reglas por modalidad.
- RAG en el borde: usar el modelo como recuperador en un sistema RAG que corre íntegramente en el dispositivo, con fragmentos de hasta 8.192 tokens y sin exposición de datos sensibles.
- Enrutamiento y selección de herramientas: emplear las similitudes entre la consulta del usuario y descripciones textuales de acciones para elegir la herramienta o intent, tal como propone la tarea MediaPipe Decision Maker.
- Búsqueda de código en asistentes de IDE: indexar un repositorio y recuperar fragmentos relevantes a partir de descripciones en lenguaje natural, dado que el modelo sitúa código y texto en el mismo espacio.
- Moderación y clasificación zero-shot: comparar el embedding de un contenido con prototipos textuales de cada categoría para etiquetarlo sin entrenamiento adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card accesible está truncada antes de cualquier sección de evaluación (MTEB, retrieval, cross-modal), y el repositorio no aporta métricas propias. Tampoco se dispone de cifras de latencia o throughput medidas.

## Requisitos de hardware

- Huella de pesos estimada: 740M parámetros cuantizados a int4 (transformer y embeddings) e int8 (visión y presumiblemente audio) implican del orden de 0,5-0,8 GB de pesos; el repositorio ocupa 7,2 GB porque incluye varias variantes y artefactos de la familia.
- VRAM: cabe holgadamente en GPUs de consumo con 4 GB o más; para lotes grandes de embeddings conviene reservar 2-4 GB adicionales para activaciones y buffers.
- GPU recomendadas: no hay recomendaciones oficiales en la información disponible; por tamaño, cualquier GPU de consumo reciente (RTX 3060/4060 en adelante) es suficiente, y el objetivo declarado del paquete es la ejecución en CPU/NPU de dispositivos móviles.
- Cabe en GPU de consumo: sí, y también en CPU de portátil y en hardware móvil (Android e iOS) mediante LiteRT.
- Opciones de despliegue: LiteRT-LM (vía Google AI Edge), MediaPipe (Universal Embedder, Semantic Retriever, Decision Maker), Google AI Edge Gallery en Android, iOS y macOS, y demo web de búsqueda por embeddings. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Modalidades | Contexto | Vector | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| EmbeddingGemma 2 740M (este) | 740M (130M transformer + 140M embeddings + 170M visión + 300M audio) | Texto, imágenes, vídeo, audio | 8.192 tokens | 768 | Apache-2.0 (según repo) | LiteRT-LM, MediaPipe, apps Edge |
| EmbeddingGemma 2 Text 270M | 270M (130M transformer + 140M embeddings) | Texto | 8.192 tokens | 768 | Apache-2.0 (según repo) | LiteRT-LM |
| EmbeddingGemma 2 Text Vision 440M | 440M (130M + 140M + 170M visión) | Texto, imágenes | 8.192 tokens | 768 | Apache-2.0 (según repo) | LiteRT-LM |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos de terceros (por ejemplo, codificadores tipo CLIP o SigLIP) que permitan una comparación cuantitativa fiable; cualquier comparación de calidad queda pendiente de la publicación de resultados de benchmarks.

## Limitaciones y advertencias

- El modelo genera embeddings, no texto: no sirve como sustituto de un LLM para generación, diálogo o razonamiento explícito.
- Ausencia total de métricas publicadas: no hay datos de MTEB ni de recuperación cross-modal que permitan estimar la calidad frente a alternativas.
- La model card disponible está truncada; falta, entre otros, el esquema de cuantización del codificador de audio y cualquier sección de evaluación o entrenamiento.
- Idiomas soportados no documentados: no se puede asumir cobertura multilingüe sin verificación empírica.
- Este repositorio es una réplica subida por un tercero (`72fstudio`) del paquete de `litert-community`; conviene contrastar los artefactos con la fuente original antes de usarlos en producción. Registra 0 descargas y 0 likes, sin señales de validación comunitaria.
- La licencia declarada es Apache-2.0, pero al derivar de `google/embeddinggemma-2` debe revisarse también la licencia y las condiciones del modelo base antes de un uso comercial.
- Riesgo de sesgo y de falsos positivos en similitud: al no publicarse la composición del dataset de entrenamiento, no se puede evaluar el sesgo por idioma, cultura o tipo de contenido.
- El rendimiento depende fuertemente del *prompt* o plantilla de consulta empleada; no se documentan plantillas recomendadas en la información disponible.
- La fecha de creación del repositorio (2026-10-18) y la ausencia de actualizaciones posteriores impiden confirmar su mantenimiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/72fstudio/embeddinggemma-2-740m-litert-lm
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Paquete original de referencia: https://huggingface.co/litert-community/embeddinggemma-2-740m-litert-lm
- Documentación de LiteRT-LM: https://developers.google.com/edge/litert-lm/overview
- Google AI Edge Gallery (Android): https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery
- Google AI Edge Gallery (iOS): https://apps.apple.com/us/app/google-ai-edge-gallery/id6749645337
- Google AI Edge Foresight (macOS): https://developers.google.com/edge/foresight
- Demo web de búsqueda por embeddings: https://google-ai-edge.github.io/LiteRT-LM/web_demos/embedding_search/index.html
- Demo MediaPipe Semantic Retriever: https://google-ai-edge.github.io/mediapipe-samples-web/#/retrieval/semantic_retriever
- Demo MediaPipe Decision Maker: https://google-ai-edge.github.io/mediapipe-samples-web/#/decision/decision_maker
