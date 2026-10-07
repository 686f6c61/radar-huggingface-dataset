# litert-community/embeddinggemma-2-740m-litert-lm

## Resumen

EmbeddingGemma 2 740M es un modelo de embeddings multimodal desarrollado por Google y empaquetado por la comunidad LiteRT para inferencia en dispositivo mediante LiteRT-LM. Se trata de la variante completa de la familia EmbeddingGemma 2: combina un backbone de texto de 270M parametros (130M del transformer mas 140M de embeddings) con un encoder de vision de 170M y un encoder de audio de 300M, hasta un total de 740M parametros.

Su funcion principal no es generar texto, sino proyectar texto, codigo, imagenes, video y audio a un unico espacio vectorial compartido de 768 dimensiones. Esto permite busqueda multimodal, recuperacion de voz y pipelines de similitud semantica entre medios distintos sobre hardware de consumo, con entradas multimodales intercaladas dentro de una unica ventana de contexto de 8.192 tokens.

La relevancia actual del modelo radica en su enfoque en edge computing: frente a los embeddings multimodales que requieren servidores con GPU, esta version esta cuantizada con QAT (quantization-aware training) y distribuida en formato LiteRT-LM para ejecutarse en Android, iOS, macOS y navegador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de texto con encoders modulares de vision y audio (modelo de embeddings) |
| Parametros totales | 740M (transformer 130M, embeddings 140M, encoder de vision 170M, encoder de audio 300M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | int4 per-channel (QAT) en transformer y embeddings; int8 per-channel (QAT) en el encoder de vision; encoder de audio no especificado en la informacion disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT-LM (libreria litert-lm) |
| Dimension del embedding | 768 |
| Modalidades de entrada | Texto, codigo, imagenes, video y audio |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de encoder Transformer para texto (130M de parametros) mas una capa de embeddings de 140M que produce representaciones de 768 dimensiones. A esa base se le anaden dos encoders independientes y modulares: uno de vision de 170M y uno de audio de 300M. Los tres comparten el mismo espacio vectorial de salida, lo que habilita similitud semantica entre modalidades. Admite entradas multimodales intercaladas dentro de la ventana de 8.192 tokens.

La innovacion tecnica destacable es el uso de cuantizacion consciente del entrenamiento (QAT): el transformer y los embeddings se cuantizan a int4 per-channel y el encoder de vision a int8 per-channel, de modo que el modelo pueda ejecutarse con baja latencia en dispositivo sin reentrenamiento posterior. No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO, ya que se trata de un modelo de embeddings y no de un modelo generativo.

## Capacidades

- Generacion de embeddings de texto y codigo de 768 dimensiones en un espacio vectorial compartido.
- Embeddings de imagen mediante el encoder de vision de 170M parametros.
- Embeddings de audio mediante el encoder de audio de 300M parametros (recuperacion de voz, busqueda por audio).
- Embeddings de video como modalidad soportada por la variante de 740M.
- Similitud semantica cross-modal: comparar directamente texto con imagen, audio o video en el mismo espacio.
- Entradas multimodales intercaladas dentro de una ventana de 8.192 tokens.
- Busqueda semantica y recuperacion (retrieval) sobre corpus mixtos.
- Inferencia en dispositivo con baja latencia mediante LiteRT-LM y MediaPipe.
- Tool calling / function calling: no aplica (no es un modelo generativo conversacional).
- Soporte de agentes y razonamiento multi-paso: no aplica (no es un modelo generativo).
- Capacidades multilingues: no disponible.

## Casos de uso

- Busqueda semantica de texto en el dispositivo: indexar documentos locales y recuperar por significado en lugar de por coincidencia exacta, sin enviar datos a un servidor, gracias a los embeddings de 768 dimensiones.
- Busqueda semantica de imagenes: usar el encoder de vision con la tarea Semantic Retriever de MediaPipe para encontrar imagenes relevantes a partir de una consulta en lenguaje natural.
- Recuperacion de voz (speech retrieval): el encoder de audio de 300M permite indexar y buscar fragmentos de audio por su contenido semantico en lugar de por transcripcion.
- RAG en el borde (edge RAG): construir bases de conocimiento vectoriales locales que alimenten asistentes on-device, manteniendo contexto de hasta 8.192 tokens por entrada.
- Deduplicacion y clustering multimodal: agrupar textos, imagenes o audios similares en un pipeline de curacion de datos usando el espacio compartido de 768 dimensiones.
- Sistemas de recomendacion por similitud: recomendar contenido cruzando modalidades (por ejemplo, sugerir audio a partir de una descripcion de texto) mediante la distancia entre embeddings.
- Moderacion de contenido multimodal: detectar contenido cercano a patrones problematicos comparando embeddings de texto, imagen y audio contra un conjunto de referencia.
- Toma de decisiones ligera: el Decision Maker de MediaPipe puede combinar EmbeddingGemma 2 con clasificadores de pocos disparos para tareas de decision en dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no se publican cifras oficiales. A partir del esquema de cuantizacion int4 per-channel de los 740M parametros (y int8 en el encoder de vision de 170M), el peso efectivo del modelo deberia situarse en el orden de 0,4-0,6 GB, aunque el repositorio ocupa 8,8 GB y no se detalla el desglose de ese tamano en la informacion disponible.
- Disenado explicitamente para inferencia en dispositivo con baja latencia, no para despliegue en servidor.
- Plataformas objetivo confirmadas: Android, iOS, macOS y navegador web.
- GPU de servidor (A100, H100, RTX 4090): no disponible; el modelo esta empaquetado para LiteRT-LM, no para stacks de servidor.
- Opciones de despliegue: LiteRT-LM y MediaPipe (Universal Embedder, Semantic Retriever, Decision Maker).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La propia familia EmbeddingGemma 2 ofrece tres variantes directamente comparables segun los datos publicados:

| Modelo | Modalidades | Parametros totales | Composicion | Contexto | Licencia |
|---|---|---|---|---|---|
| EmbeddingGemma 2 Text 270M | Texto | 270M | Transformer 130M + embeddings 140M | no disponible | no disponible |
| EmbeddingGemma 2 Text Vision 440M | Texto, imagenes | 440M | + encoder de vision 170M | no disponible | no disponible |
| EmbeddingGemma 2 740M | Texto, imagenes, video, audio | 740M | + encoder de audio 300M | 8.192 tokens | Apache 2.0 |

No se dispone de datos de benchmarks ni de comparativas con modelos externos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo de embeddings, no un modelo generativo: no produce texto, no razona de forma explicita y no soporta tool calling ni agentes.
- No se especifican los idiomas soportados, por lo que el comportamiento multilingue no esta garantizado y debe validarse antes de usarlo en produccion.
- No se publican resultados de benchmarks, de modo que la calidad de la recuperacion no puede contrastarse con cifras oficiales.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero los espacios de embeddings pueden devolver resultados semanticamente cercanos pero incorrectos; conviene umbralizar la similitud en retrieval.
- La cuantizacion int4 reduce la precision numerica del vector resultante frente a una version sin cuantizar; para tareas sensibles a la precision conviene evaluar el impacto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe respetar la atribucion y las condiciones del modelo base google/embeddinggemma-2.
- El modelo esta empaquetado para LiteRT-LM y MediaPipe; no se documentan en la informacion disponible formatos alternativos como safetensors o GGUF para este repositorio concreto.
- Para produccion en servidor de alta concurrencia, este empaquetado orientado a dispositivo puede no ser la opcion adecuada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/litert-community/embeddinggemma-2-740m-litert-lm
- Model card del modelo base (Google): https://huggingface.co/google/embeddinggemma-2
- Guia de LiteRT-LM: https://developers.google.com/edge/litert-lm/overview
- Demo web de busqueda por embeddings: https://google-ai-edge.github.io/LiteRT-LM/web_demos/embedding_search/index.html
- Demo de recuperacion semantica de imagenes (MediaPipe): https://google-ai-edge.github.io/mediapipe-samples-web/#/retrieval/semantic_retriever
- Demo de toma de decisiones (MediaPipe): https://google-ai-edge.github.io/mediapipe-samples-web/#/decision/decision_maker
- Google AI Edge Gallery en Android: https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery
- Google AI Edge Gallery en iOS: https://apps.apple.com/us/app/google-ai-edge-gallery/id6749645337
- Google AI Edge para macOS: https://developers.google.com/edge/foresight
