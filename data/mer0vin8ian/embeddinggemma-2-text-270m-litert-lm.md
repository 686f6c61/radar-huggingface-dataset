# Mer0vin8ian/embeddinggemma-2-text-270m-litert-lm

## Resumen

EmbeddingGemma 2 Text 270M es un modelo de embeddings de texto derivado de la familia EmbeddingGemma 2 de Google, empaquetado en formato LiteRT-LM para inferencia en dispositivo. El repositorio analizado, publicado por el usuario Mer0vin8ian, es una conversión del modelo base `google/embeddinggemma-2` a LiteRT-LM, una librería de Google orientada a despliegue en Android, iOS, macOS y web. El modelo no genera texto: produce representaciones vectoriales densas de fragmentos de texto para tareas de recuperación, clasificación, clustering y similitud semántica.

La arquitectura combina un transformer de 130M de parámetros con un módulo de embeddings de 140M, sumando 270M de parámetros totales. Incorpora Matryoshka Representation Learning (MRL), lo que permite truncar los vectores de salida hasta 128 dimensiones para reducir drásticamente el almacenamiento y el coste de búsqueda vectorial. Según la model card, soporta más de 100 idiomas y código de programación.

Su relevancia radica en el despliegue local: al estar cuantizado en int4 por canal mediante QAT (quantization-aware training) y empaquetado para LiteRT-LM, está pensado para ejecutarse en hardware de consumo y dispositivos de borde con baja latencia, sin depender de API externas. El repositorio ocupa 2,7 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (encoder) para embeddings de texto, con módulo de embeddings separado; MRL para dimensiones ajustables |
| Parametros totales | 270M (130M transformer + 140M embeddings) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int4 por canal (QAT) en transformer y embeddings |
| Idiomas soportados | Más de 100 idiomas y código de programación (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT-LM (librería `litert-lm`) |
| Dimension de salida | Ajustable por MRL, hasta 128 dimensiones |
| Tamano del repositorio | 2,7 GB |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de 130M de parámetros acoplado a un módulo de embeddings de 140M, diseñado exclusivamente para producir representaciones vectoriales de texto. No es un modelo generativo ni un modelo de lenguaje causal: su salida es un vector denso por entrada. La innovación principal es la combinación de Matryoshka Representation Learning, que permite truncar la dimensión del vector de salida (hasta 128d) sin reentrenar, con una cuantización int4 por canal aplicada mediante quantization-aware training, lo que preserva la calidad bajo compresión agresiva.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card indica que es una variante de la familia EmbeddingGemma 2 y remite a la model card principal de `google/embeddinggemma-2` para detalles adicionales. El empaquetado en LiteRT-LM es una conversión de formato orientada a despliegue, no un reentrenamiento.

## Capacidades

- Generación de embeddings de texto para similitud semántica y recuperación densa.
- Soporte de más de 100 idiomas, incluyendo multilingüismo cruzado.
- Representación de código de programación para búsqueda semántica en repositorios.
- Dimensiones de vector ajustables mediante MRL (hasta 128d) para equilibrar precisión y coste de almacenamiento.
- Ejecución en dispositivo mediante LiteRT-LM en Android, iOS, macOS y web.
- Integración con MediaPipe para tareas de recuperación semántica y toma de decisiones.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es un modelo puramente de embeddings.

## Casos de uso

- Búsqueda semántica en dispositivo: indexar documentos locales y recuperar fragmentos relevantes mediante similitud de coseno, sin enviar datos a la nube, aprovechando la cuantización int4 para reducir el consumo de memoria.
- Clasificación de texto en el borde: generar embeddings de mensajes o reseñas y alimentar un clasificador ligero (por ejemplo, regresión logística) para categorización en tiempo real en aplicaciones móviles.
- Deduplicación y clustering de documentos: agrupar artículos, tickets o correos similares calculando distancias entre embeddings truncados a 128d para minimizar el coste de almacenamiento.
- Búsqueda de código: indexar funciones y fragmentos de código en un IDE o herramienta interna para recuperación semántica por descripción en lenguaje natural, gracias al soporte de código del modelo.
- Filtrado de contenido multilingüe: comparar la similitud entre textos en distintos idiomas para detección de duplicados o moderación en plataformas con usuarios de más de 100 idiomas.
- Recomendación de contenido: calcular embeddings de artículos o productos y generar recomendaciones por vecindad vectorial en aplicaciones móviles sin backend dedicado.
- Preguntas y respuestas sobre documentación local: combinar el modelo con un índice vectorial embebido y un LLM local para RAG en dispositivos sin conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 270M de parámetros en int4, el peso teórico ronda los 135 MB, aunque el repositorio ocupa 2,7 GB (posiblemente por artefactos de conversión y metadatos de LiteRT-LM).
- GPU recomendadas: no disponible. El modelo está orientado a aceleradores de borde (NPU/GPU integradas en móviles y Apple Silicon) mediante LiteRT-LM.
- Cabe en GPU de consumo: sí, por tamaño (270M de parámetros), aunque el formato LiteRT-LM está pensado para dispositivos de borde más que para GPUs de escritorio.
- Opciones de despliegue: LiteRT-LM (Android, iOS, macOS, web), MediaPipe (Universal Embedder, Semantic Retriever, Decision Maker). No se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidades | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| EmbeddingGemma 2 Text 270M (este) | 270M | Texto | No disponible | Apache 2.0 | LiteRT-LM |
| EmbeddingGemma 2 Text Vision 440M | 440M | Texto, imágenes | No disponible | Apache 2.0 | No disponible |
| EmbeddingGemma 2 740M | 740M | Texto, imágenes, vídeo, audio | No disponible | Apache 2.0 | No disponible |

La comparativa se limita a las variantes de la misma familia recogidas en la model card, ya que no se dispone de datos de rendimiento ni de modelos externos comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo puramente de embeddings: no genera texto, no soporta tool calling ni razonamiento multi-paso.
- No se han publicado benchmarks ni evaluaciones de calidad en la información disponible; el rendimiento real es desconocido.
- La longitud de contexto no está documentada, lo que impide planificar el tamaño de los fragmentos a indexar.
- El repositorio es una conversión de terceros (Mer0vin8ian) del modelo de Google; no es una publicación oficial y no registra descargas ni validación comunitaria.
- El tamaño del repositorio (2,7 GB) es desproporcionado para 270M de parámetros en int4, lo que sugiere artefactos adicionales o empaquetado no optimizado; conviene verificar antes de desplegar.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificarse contra la licencia del modelo base `google/embeddinggemma-2`.
- Riesgo de sesgos heredados de los datos de entrenamiento del modelo base, no documentados en esta ficha.
- No se especifican limitaciones por idioma más allá de la cobertura declarada de más de 100 idiomas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Mer0vin8ian/embeddinggemma-2-text-270m-litert-lm
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Documentación LiteRT-LM: https://developers.google.com/edge/litert-lm/overview
- Demo web de búsqueda por embeddings: https://google-ai-edge.github.io/LiteRT-LM/web_demos/embedding_search/index.html
- Demo de recuperación semántica con MediaPipe: https://google-ai-edge.github.io/mediapipe-samples-web/#/retrieval/semantic_retriever
- Demo de toma de decisiones con MediaPipe: https://google-ai-edge.github.io/mediapipe-samples-web/#/decision/decision_maker
- Google AI Edge Gallery (Android): https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery
- Google AI Edge Gallery (iOS): https://apps.apple.com/us/app/google-ai-edge-gallery/id6749645337
- Google AI Edge Foresight (macOS): https://developers.google.com/edge/foresight
