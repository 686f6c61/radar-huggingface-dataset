# litert-community/embeddinggemma-2-text-vision-440m-litert-lm

## Resumen

EmbeddingGemma 2 Text Vision 440M es un modelo de embeddings multimodal (texto e imagen) desarrollado por Google y distribuido en formato LiteRT-LM por la comunidad litert-community. Combina un backbone transformer de texto de 130M de parámetros con una matriz de embeddings de 140M y un codificador visual modular de 170M, sumando 440M de parámetros totales. Su función es proyectar texto, código e imágenes a un espacio de embedding unificado de 768 dimensiones, lo que permite alinear conceptos visuales con consultas textuales.

El modelo está diseñado específicamente para inferencia en dispositivo (on-device), con cuantización int4 por canal en transformer y embeddings, e int8 por canal en el codificador visual, todo con entrenamiento consciente de cuantización (QAT). Esto lo hace adecuado para aplicaciones móviles y de borde donde el consumo de memoria y la latencia son críticos, como búsqueda de imágenes, recuperación de documentos visuales y clasificación.

Es relevante ahora porque representa la tendencia hacia modelos de embeddings multimodales compactos que pueden ejecutarse localmente sin depender de infraestructura en la nube, integrándose en el ecosistema LiteRT-LM de Google con soporte para Android, iOS, macOS y web. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con codificador visual modular (variante multimodal de EmbeddingGemma 2) |
| Parametros totales | 440M (transformer 130M + embeddings 140M + vision encoder 170M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 per-channel (QAT) en transformer y embeddings; int8 per-channel (QAT) en vision encoder |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT-LM (litert-lm) |
| Dimension del embedding | 768 |
| Modalidades | Texto, codigo, imagenes |
| Tamano del repo | 6.8 GB |

## Arquitectura y entrenamiento

El modelo sigue la familia EmbeddingGemma 2, con un backbone transformer de 130M de parámetros para texto y un codificador visual de 170M añadido de forma modular. La matriz de embeddings aporta 140M de parámetros. El resultado es un modelo de 440M que mapea texto, código e imágenes a un espacio unificado de 768 dimensiones, capturando semántica cruzada entre modalidades. La cuantización es parte del diseño: transformer y embeddings usan int4 por canal con QAT, mientras que el codificador visual usa int8 por canal con QAT, lo que reduce el peso y acelera la inferencia en hardware de borde.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo es un fine-tune del base google/embeddinggemma-2, adaptado al formato LiteRT-LM para ejecución on-device. La innovación principal es la integración de un codificador visual modular sobre un backbone de texto compacto, manteniendo el tamaño total por debajo de 500M de parámetros y con cuantización consciente desde el entrenamiento.

## Capacidades

- Generación de embeddings de texto y código en un espacio de 768 dimensiones.
- Codificación de imágenes a través del codificador visual de 170M, alineado con el espacio textual.
- Búsqueda semántica multimodal: consultas textuales contra imágenes y viceversa.
- Recuperación de documentos visuales (visual document retrieval).
- Clasificación de imágenes mediante similitud de embeddings.
- Ejecución on-device en Android, iOS, macOS y web mediante LiteRT-LM.
- Integración con MediaPipe Universal Embedder y Semantic Retriever.
- Soporte de tareas de decisión mediante MediaPipe Decision Maker.
- No se ha documentado soporte de tool calling, function calling ni razonamiento multi-step, al ser un modelo de embeddings y no generativo.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Búsqueda de imágenes en galerías locales: el modelo genera embeddings de las fotos del dispositivo y de la consulta textual del usuario, permitiendo búsqueda semántica sin conexión gracias a su tamaño de 440M y cuantización int4/int8.
- Recuperación de documentos visuales: digitalización de facturas, tickets o formularios donde se indexan las imágenes y se recuperan por consultas textuales, usando el espacio unificado de 768 dimensiones.
- Clasificación de imágenes en el borde: comparación de embeddings de imagen contra prototipos textuales de categorías para clasificación zero-shot en aplicaciones móviles.
- Moderación de contenido visual: cálculo de similitud entre imágenes entrantes y embeddings de referencia de contenido no permitido, ejecutado localmente para preservar privacidad.
- Asistentes de accesibilidad: descripción y búsqueda de contenido visual en aplicaciones móviles mediante alineación texto-imagen, sin enviar datos a la nube.
- Indexación de catálogos de producto: generación de embeddings de imágenes de producto y fichas textuales para búsqueda por similitud en comercio electrónico con despliegue en dispositivo o edge.
- Aplicaciones de notas visuales: búsqueda de capturas de pantalla o fotos de pizarra mediante consultas en lenguaje natural, aprovechando la ejecución local en Android e iOS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 6.8 GB, aunque el modelo cuantizado (int4/int8) es sustancialmente menor; no se dispone de cifra exacta de memoria en inferencia.
- Diseñado para ejecución on-device, no para GPU de centro de datos.
- Compatible con dispositivos Android e iOS mediante Google AI Edge Gallery y LiteRT-LM.
- Compatible con macOS mediante Google AI Edge Foresight.
- Ejecutable en navegador mediante el demo web de LiteRT-LM.
- Opciones de despliegue: LiteRT-LM, MediaPipe (Universal Embedder, Semantic Retriever, Decision Maker).
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Modalidades | Parametros | Embedding | Cuantizacion | Licencia |
|---|---|---|---|---|---|
| EmbeddingGemma 2 Text 270M | Texto | 270M | no disponible | int4 (QAT) | no disponible |
| EmbeddingGemma 2 Text Vision 440M | Texto, imagenes | 440M | 768 | int4 + int8 (QAT) | Apache 2.0 |
| EmbeddingGemma 2 740M | Texto, imagenes, video, audio | 740M | no disponible | int4 + int8 (QAT) | no disponible |

## Limitaciones y advertencias

- Es un modelo de embeddings, no generativo: no produce texto libre ni responde preguntas directamente.
- No se documentan sesgos conocidos, pero al derivar de EmbeddingGemma 2 hereda los posibles sesgos del dataset de entrenamiento original.
- Riesgo de alucinación no aplica en el sentido generativo, pero la similitud semántica puede producir recuperaciones irrelevantes en dominios fuera de distribución.
- Idiomas soportados no documentados; el rendimiento multilingüe es incierto.
- Longitud de contexto no disponible, lo que limita la planificación para documentos largos.
- El formato LiteRT-LM restringe el despliegue a herramientas del ecosistema Google AI Edge; no hay pesos en safetensors ni GGUF en este repo.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base google/embeddinggemma-2.
- El tamaño del repo (6.8 GB) puede deberse a múltiples artefactos; el modelo cuantizado en sí es más ligero, pero no se detalla la distribución exacta.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/embeddinggemma-2-text-vision-440m-litert-lm
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Documentación LiteRT-LM: https://developers.google.com/edge/litert-lm/overview
- Repositorio de ejemplos: https://github.com/google-ai-edge/litert-samples
- Demo web de búsqueda por embeddings: https://google-ai-edge.github.io/LiteRT-LM/web_demos/embedding_search/index.html
- Demo de búsqueda semántica de imágenes (MediaPipe): https://google-ai-edge.github.io/mediapipe-samples-web/#/retrieval/semantic_retriever
- Demo de toma de decisiones (MediaPipe): https://google-ai-edge.github.io/mediapipe-samples-web/#/decision/decision_maker
- Google AI Edge Gallery (Android): https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery
- Google AI Edge Gallery (iOS): https://apps.apple.com/us/app/google-ai-edge-gallery/id6749645337
- Google AI Edge Foresight (macOS): https://developers.google.com/edge/foresight
