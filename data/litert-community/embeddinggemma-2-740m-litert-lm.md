# litert-community/embeddinggemma-2-740m-litert-lm

## Resumen

EmbeddingGemma 2 740M es un modelo de embeddings nativamente multimodal desarrollado por Google y empaquetado por la comunidad `litert-community` para inferencia en dispositivo mediante LiteRT-LM. Integra un backbone de texto de 270M parametros (130M de transformer y 140M de embeddings), un codificador de vision de 170M y un codificador de audio de 300M, sumando 740M parametros totales. Su funcion es proyectar texto, codigo, imagenes, video y audio en un unico espacio vectorial compartido de 768 dimensiones.

El modelo resuelve el problema de la busqueda y recuperacion semantica cross-modal en hardware de consumo, sin depender de servicios en la nube. Al compartir un espacio de embeddings entre modalidades, permite comparar directamente una consulta en texto con un fragmento de audio o un fotograma de video, lo que habilita pipelines de recuperacion multimedia completos ejecutados localmente.

Su relevancia actual radica en el formato de distribucion: pesos optimizados para LiteRT-LM con cuantizacion int4 por canal entrenada con QAT (quantization-aware training), lo que reduce el peso del repositorio a 9,3 GB e incluye variantes para movil, escritorio y web. Con 147.494 descargas y licencia Apache 2.0, es una opcion practica para integrar busqueda multimodal en aplicaciones Android, iOS, macOS y navegador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de texto (130M) + embeddings (140M) + codificador de vision (170M) + codificador de audio (300M) |
| Parametros totales | 740M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | int4 por canal (QAT) en transformer y embeddings; esquema del resto de componentes no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT-LM (repositorio de 9,3 GB) |
| Dimension del embedding | 768 |
| Modalidades | Texto, codigo, imagenes, video y audio |
| Modelo base | google/embeddinggemma-2 |

## Arquitectura y entrenamiento

La arquitectura combina un backbone de texto tipo transformer con modulos especializados por modalidad: un codificador de vision de 170M parametros y un codificador de audio de 300M, cuyas salidas se proyectan a un espacio vectorial comun de 768 dimensiones. El backbone de texto se descompone en 130M parametros de transformer y 140M de embeddings. El modelo admite entradas multimodales intercaladas dentro de una unica ventana de contexto de 8.192 tokens, lo que permite procesar secuencias que mezclan texto, imagen y audio.

El transformer y la capa de embeddings emplean cuantizacion int4 por canal entrenada con QAT, lo que preserva la calidad del embedding tras la compresion y reduce el coste de memoria en dispositivo. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; estos datos deben consultarse en la model card del modelo base `google/embeddinggemma-2`.

## Capacidades

- Generacion de embeddings de texto y codigo en un espacio de 768 dimensiones.
- Embeddings de imagen mediante el codificador de vision de 170M parametros.
- Embeddings de audio mediante el codificador de audio de 300M parametros.
- Embeddings de video, al procesar fotogramas con el codificador de vision.
- Similitud semantica cross-modal: comparar texto contra imagen, audio o video directamente.
- Soporte de entradas multimodales intercaladas en una sola secuencia de hasta 8.192 tokens.
- Busqueda semantica y recuperacion de informacion (retrieval) sobre corpus multimedia.
- Inferencia en dispositivo de baja latencia mediante LiteRT-LM.
- Integracion con MediaPipe Universal Embedder, Semantic Retriever y Decision Maker.
- Tool calling, agentes y modo thinking: no disponible (es un modelo de embeddings, no generativo).

## Casos de uso

- Busqueda semantica de imagenes en aplicaciones moviles: el codificador de vision proyecta las fotos al mismo espacio que la consulta textual, permitiendo busqueda por descripcion en Android o iOS sin conexion.
- Recuperacion de audio y voz: con el codificador de audio de 300M, se pueden indexar grabaciones, podcasts o notas de voz y recuperarlas mediante consultas en texto.
- Base de conocimiento en apps Flutter: el ejemplo oficial `samples/litert/flutter` usa el modelo como motor de embeddings para una base de conocimiento local, adecuado porque la cuantizacion int4 reduce el consumo de memoria en dispositivos moviles.
- Clasificacion y deduplicacion de contenido multimedia: comparar embeddings de video, imagen y texto permite agrupar contenido semanticamente equivalente en pipelines de moderacion o catalogacion.
- Busqueda cross-media en navegador: la demo web de LiteRT-LM ejecuta el modelo en el cliente, lo que sirve para construir buscadores semanticos sin backend ni coste de inferencia en servidor.
- Sistemas de recomendacion on-device: calcular similitud entre el historial del usuario (texto, imagenes, audio) y el catalogo directamente en el dispositivo, preservando la privacidad al no enviar datos a la nube.
- Toma de decisiones asistida: la integracion con MediaPipe Decision Maker permite usar los embeddings como señal de entrada en flujos de clasificacion y enrutamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio completo ocupa 9,3 GB e incluye variantes para distintas plataformas, por lo que el peso en memoria de una variante int4 concreta es inferior a esa cifra.
- GPU recomendadas: no disponible. El modelo esta disenado para inferencia en dispositivo (CPU/NPU de movil, escritorio y navegador) mediante LiteRT-LM, no para despliegue en GPUs de centro de datos.
- Cabe en GPU de consumo: si, al estar orientado a hardware de consumo; no se especifican modelos concretos de GPU.
- Opciones de despliegue: LiteRT-LM (Android, iOS, macOS y web), MediaPipe (Universal Embedder, Semantic Retriever, Decision Maker) y Google AI Edge Gallery.
- Latencia y throughput: no disponible. Existe un notebook oficial de benchmark en dispositivos moviles en la nube (`embedding_gemma_ddp_benchmark.ipynb`) para medirlos.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidades | Contexto | Dimension del embedding | Licencia |
|---|---|---|---|---|---|
| EmbeddingGemma 2 740M (este) | 740M | Texto, imagen, video, audio | 8.192 | 768 | Apache 2.0 |
| EmbeddingGemma 2 Text Vision 440M | 440M | Texto, imagen | no disponible | no disponible | Apache 2.0 |
| EmbeddingGemma 2 Text 270M | 270M | Texto | no disponible | no disponible | Apache 2.0 |

Las tres variantes pertenecen a la misma familia y comparten backbone de texto (130M de transformer y 140M de embeddings); la diferencia esta en los codificadores adicionales de vision y audio. No se dispone de datos de rendimiento comparativo entre ellas en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo de embeddings: no genera texto, no razona de forma autoregresiva y no soporta tool calling ni agentes.
- La informacion disponible no detalla sesgos conocidos; deben evaluarse en la model card del modelo base `google/embeddinggemma-2`.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero la similitud semantica puede producir recuperaciones irrelevantes si el corpus no esta bien representado.
- Idiomas soportados no especificados: conviene validar el rendimiento en castellano antes de usarlo en produccion.
- El contexto de 8.192 tokens limita el tamano de las entradas multimodales intercaladas; documentos o videos largos deben fragmentarse.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y verificarse las condiciones del modelo base.
- La cuantizacion int4 puede degradar ligeramente la calidad del embedding frente a los pesos completos; no se han publicado metricas de esa perdida.
- El formato LiteRT-LM esta atado al ecosistema Google AI Edge; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/embeddinggemma-2-740m-litert-lm
- Model card del modelo base: https://huggingface.co/google/embeddinggemma-2
- Documentacion de LiteRT-LM: https://developers.google.com/edge/litert-lm/overview
- Demo web de busqueda con embeddings: https://google-ai-edge.github.io/LiteRT-LM/web_demos/embedding_search/index.html
- Google AI Edge Gallery (Android): https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery
- Google AI Edge Gallery (iOS): https://apps.apple.com/us/app/google-ai-edge-gallery/id6749645337
- Google AI Edge Foresight (macOS): https://developers.google.com/edge/foresight
- Ejemplo Flutter con base de conocimiento: https://github.com/google-ai-edge/litert-samples/tree/main/samples/litert/flutter
- Notebook de benchmark en dispositivos moviles: https://github.com/google-ai-edge/litert-samples/blob/main/benchmark/developer_device_platform/embedding_gemma_ddp_benchmark.ipynb
- Demo de busqueda semantica de imagenes (MediaPipe): https://google-ai-edge.github.io/mediapipe-samples-web/#/retrieval/semantic_retriever
- Demo de Decision Maker (MediaPipe): https://google-ai-edge.github.io/mediapipe-samples-web/#/decision/decision_maker
