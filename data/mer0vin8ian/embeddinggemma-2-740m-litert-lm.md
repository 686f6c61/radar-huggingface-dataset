# Mer0vin8ian/embeddinggemma-2-740m-litert-lm

## Resumen

EmbeddingGemma 2 740M es la variante multimodal nativa de la familia EmbeddingGemma 2 desarrollada por Google. Se trata de un modelo de embeddings disenado para mapear texto, codigo, imagenes, video y audio a un unico espacio vectorial compartido de 768 dimensiones, lo que permite realizar busquedas y comparaciones semanticas entre modalidades distintas. El modelo combina un backbone de texto de 270M parametros con un codificador de vision de 170M y un codificador de audio de 300M, sumando un total de 740M parametros.

Esta version concreta, publicada por el usuario Mer0vin8ian bajo el identificador `Mer0vin8ian/embeddinggemma-2-740m-litert-lm`, empaqueta el modelo base `google/embeddinggemma-2` en formato LiteRT-LM para inferencia de baja latencia en dispositivos. El objetivo es permitir pipelines de busqueda multimodal, recuperacion de voz y similitud semantica entre medios directamente en hardware de consumo, sin depender de infraestructura en la nube.

La relevancia de este lanzamiento radica en su naturaleza on-device y multimodal: un unico modelo capaz de procesar entradas intercaladas de varias modalidades dentro de una ventana de contexto de 8.192 tokens, con licencia Apache 2.0. No obstante, el repositorio no incluye datos de benchmarks, idiomas soportados ni detalles completos de cuantizacion mas alla de lo que figura en la model card del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone de texto y codificadores modulares de vision y audio |
| Parametros totales | 740M (130M transformer + 140M embeddings + 170M vision + 300M audio) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | int4 per-channel (QAT) en transformer; esquema de embeddings no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT-LM (litert-lm) |
| Dimension del embedding | 768 |
| Modalidades | Texto, codigo, imagenes, video, audio |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura modular compuesta por un backbone transformer de texto de 130M parametros, una capa de embeddings de 140M, un codificador de vision de 170M y un codificador de audio de 300M. Los distintos codificadores proyectan sus representaciones a un espacio vectorial comun de 768 dimensiones, lo que habilita la comparacion semantica cruzada entre modalidades. El modelo admite entradas multimodales intercaladas dentro de una unica ventana de contexto de 8.192 tokens.

La model card indica que el transformer emplea cuantizacion int4 per-channel con Quantization-Aware Training (QAT), orientada a reducir el coste computacional en dispositivos. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detallan innovaciones adicionales como decodificacion especulativa o mecanismos de atencion lineal.

## Capacidades

- Generacion de embeddings multimodales: proyecta texto, codigo, imagenes, video y audio a un espacio vectorial compartido de 768 dimensiones.
- Busqueda semantica cross-modal: permite recuperar imagenes a partir de consultas de texto, audio a partir de texto y viceversa.
- Procesamiento de entradas multimodales intercaladas dentro de una ventana de 8.192 tokens.
- Recuperacion de voz (speech retrieval) mediante el codificador de audio de 300M parametros.
- Similitud semantica entre medios (cross-media semantic similarity).
- Inferencia on-device de baja latencia mediante LiteRT-LM.
- Integracion con MediaPipe para tareas de Universal Embedder, Semantic Retriever y Decision Maker.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Busqueda semantica de imagenes en aplicaciones moviles: el codificador de vision de 170M permite indexar y recuperar imagenes a partir de consultas en lenguaje natural directamente en el dispositivo, sin enviar datos a la nube, gracias al empaquetado LiteRT-LM.
- Recuperacion de audio y voz: el codificador de audio de 300M posibilita construir indices de fragmentos de audio o transcripciones y recuperarlos por similitud semantica, util en apps de notas de voz o podcasts.
- Base de conocimiento local en apps Flutter: el ejemplo oficial `samples/litert/flutter` demuestra como usar el modelo como motor de busqueda semantica sobre una base de conocimiento embebida en la aplicacion.
- Busqueda multimodal unificada: al compartir un espacio de 768 dimensiones, un unico indice puede mezclar texto, imagenes, video y audio, simplificando la arquitectura de sistemas de recuperacion cross-media.
- Clasificacion y deduplicacion de contenido multimedia: la similitud coseno entre embeddings permite agrupar imagenes o clips de audio semanticamente equivalentes en pipelines de moderacion o catalogacion.
- Recomendacion de contenido en el borde: calcular embeddings de items y del historial del usuario on-device para generar recomendaciones sin exponer datos personales.
- Procesamiento de video para resumen o indexacion: el soporte de video dentro de la ventana de 8.192 tokens permite indexar fotogramas o segmentos y recuperarlos por descripcion textual.
- Decision Maker en MediaPipe: integrado en la tarea de toma de decisiones de MediaPipe para seleccionar acciones a partir de contexto multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 7,7 GB en disco, lo que sugiere que los pesos completos en el formato empaquetado pueden requerir varios GB de almacenamiento.
- GPU recomendadas: no disponibles en la informacion proporcionada; el modelo esta disenado para inferencia on-device (movil y escritorio) mediante LiteRT-LM.
- Compatibilidad con GPU de consumo: el enfoque LiteRT-LM apunta a hardware de consumo y dispositivos moviles, pero no se detallan requisitos minimos concretos.
- Opciones de despliegue: LiteRT-LM (Android, iOS, macOS, web), MediaPipe (Universal Embedder, Semantic Retriever, Decision Maker), y el paquete de Flutter en `google-ai-edge/litert-samples`.
- Latencia y throughput: no disponibles; la model card menciona inferencia de baja latencia pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| EmbeddingGemma 2 740M (este) | 740M | 8.192 tokens | Texto, imagen, video, audio | Apache 2.0 | LiteRT-LM |
| EmbeddingGemma 2 Text 270M | 270M | no disponible | Texto | Apache 2.0 | no disponible |
| EmbeddingGemma 2 Text Vision 440M | 440M | no disponible | Texto, imagen | Apache 2.0 | no disponible |

La informacion disponible solo permite comparar con las otras variantes de la misma familia. No se proporcionan datos de benchmarks ni de modelos de terceros comparables.

## Limitaciones y advertencias

- No se han publicado datos de benchmarks que permitan evaluar la calidad de los embeddings frente a alternativas.
- No se especifican los idiomas soportados, lo que impide garantizar un rendimiento multilingue equilibrado.
- Al ser un modelo de embeddings y no generativo, no produce texto; su uso esta limitado a tareas de representacion y similitud.
- El repositorio es una publicacion de terceros (Mer0vin8ian) sobre el modelo base de Google; conviene verificar la integridad y procedencia de los pesos antes de usarlo en produccion.
- El repositorio no registra descargas ni likes, lo que sugiere una adopcion nula y ausencia de validacion comunitaria.
- La cuantizacion int4 per-channel con QAT puede introducir perdida de precision en las representaciones vectoriales; no se documenta el impacto.
- Aunque la licencia es Apache 2.0, deben respetarse las condiciones del modelo base `google/embeddinggemma-2` y de las dependencias de LiteRT-LM.
- Riesgo de sesgos y alucinacion: no disponible en la informacion proporcionada, aunque al tratarse de un modelo de embeddings el riesgo de alucinacion se manifiesta como recuperaciones semanticamente erroneas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Mer0vin8ian/embeddinggemma-2-740m-litert-lm
- Model card del modelo base: https://huggingface.co/google/embeddinggemma-2
- Documentacion LiteRT-LM: https://developers.google.com/edge/litert-lm/overview
- Demo web de busqueda con embeddings: https://google-ai-edge.github.io/LiteRT-LM/web_demos/embedding_search/index.html
- Google AI Edge Gallery (Android): https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery
- Google AI Edge Gallery (iOS): https://apps.apple.com/us/app/google-ai-edge-gallery/id6749645337
- Foresight para macOS: https://developers.google.com/edge/foresight
- Ejemplo Flutter en litert-samples: https://github.com/google-ai-edge/litert-samples/tree/main/samples/litert/flutter
- Notebook de benchmark: https://github.com/google-ai-edge/litert-samples/blob/main/benchmark/developer_device_platform/embedding_gemma_ddp_benchmark.ipynb
- Demo Semantic Retriever (MediaPipe): https://google-ai-edge.github.io/mediapipe-samples-web/#/retrieval/semantic_retriever
- Demo Decision Maker (MediaPipe): https://google-ai-edge.github.io/mediapipe-samples-web/#/decision/decision_maker
