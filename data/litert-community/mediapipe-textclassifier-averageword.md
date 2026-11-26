# litert-community/MediaPipe-TextClassifier-AverageWord

## Resumen

MediaPipe TextClassifier AverageWord es un clasificador de sentimiento binario en ingles disenado para inferencia en dispositivo (on-device). Lo publica la organizacion litert-community dentro del ecosistema de Google AI Edge, y se distribuye como un unico fichero TFLite de 775,7 KB en precision FP32 que se integra en la tarea `TextClassifier` de MediaPipe. No es un modelo generativo ni un transformer: es un clasificador de bolsa de palabras continua (continuous bag-of-words) basado en el promedio de embeddings de palabras, con un vocabulario de 10.003 entradas y una ventana de entrada fija de 256 tokens.

El modelo resuelve un problema muy acotado: asignar una etiqueta de sentimiento (0 = negativo, 1 = positivo) a fragmentos cortos de texto en ingles, como resenas o comentarios. Su entrenamiento se realizo sobre Stanford Sentiment Treebank (SST-2), un corpus de resenas de cine. Su relevancia actual no esta en la calidad del clasificador frente a LLMs, sino en el coste: 0,14 ms de latencia media de pipeline en un Pixel 6, un tamano inferior a 1 MB y ejecucion en CPU sin acelerador.

Es, por tanto, una pieza de infraestructura para aplicaciones moviles, web y embebidas que necesitan filtrar o preclasificar texto con un coste computacional minimo, y no una alternativa a modelos de lenguaje. La ficha siguiente describe sus especificaciones reales y evita extrapolaciones que la model card no respalda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador de bolsa de palabras continua (average word embedding) sobre TFLite |
| Parametros totales | no disponible (pesos en un fichero TFLite de 775,7 KB; el numero de parametros no se publica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (forma de entrada fija `[-1, 256]`) |
| Tipos de cuantizacion | FP32 unicamente (se distribuye solo la variante float32) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`.tflite`) con metadatos `TFLITE_METADATA` que empaquetan `vocab.txt` y `labels.txt` |
| Entrada | Tensor `serving_default_input_1:0`, forma `[-1, 256]`, tipo `int32` |
| Salida | Tensor `StatefulPartitionedCall:0`, forma `[-1, 2]`, tipo `float32` (puntuaciones por etiqueta) |
| Vocabulario | 10.003 entradas con tokenizacion por regex; incluye `<PAD>`, `<START>`, `<UNKNOWN>` |
| Etiquetas | `0` = negativo, `1` = positivo |
| Dataset de entrenamiento | Stanford Sentiment Treebank (SST-2), resenas de cine |
| Tamano del fichero | 775.706 bytes (775,7 KB) |
| SHA-256 | `13bf6f7f35964f1e85d6cc762ee7b1952009b532b233baa5bdb4bf7441097f34` |
| Descargas en Hugging Face | 264 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura es un clasificador lineal sobre representaciones medias de palabras: cada token del texto se mapea a un embedding mediante el vocabulario embebido, se promedian las representaciones de la secuencia (hasta 256 posiciones) y se aplica una capa de clasificacion que produce dos logits, uno por clase de sentimiento. No hay atencion, ni recurrencia, ni capas transformer; el modelo es esencialmente un modelo de bolsa de palabras con embeddings, lo que explica tanto su tamano inferior a 1 MB como su latencia sub-milisegundo.

El entrenamiento se realizo sobre SST-2, el subconjunto binario de Stanford Sentiment Treebank compuesto por resenas de cine. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo etapas de ajuste fino adicionales, RLHF o DPO; esos datos deben considerarse no disponibles. La innovacion tecnica relevante no esta en el algoritmo sino en el empaquetado: el fichero TFLite incluye en `TFLITE_METADATA` el vocabulario y las etiquetas, de modo que la tarea `TextClassifier` de MediaPipe puede tokenizar y clasificar sin ficheros auxiliares externos, y el mismo artefacto funciona en Android, iOS, web, Python y Flutter.

## Capacidades

- Clasificacion de sentimiento binaria en ingles: devuelve una puntuacion para las clases negativo y positivo sobre texto corto.
- Inferencia en dispositivo en CPU, sin GPU ni aceleradores dedicados, con un pipeline de 0,14 ms en Pixel 6.
- Tokenizacion integrada por regex con vocabulario de 10.003 entradas empaquetado en los metadatos del modelo.
- Despliegue multiplataforma mediante MediaPipe Tasks: Python, JavaScript/web, Android (Kotlin/Java), iOS (Swift) y Flutter (Dart).
- Entrada por lotes: la primera dimension del tensor es dinamica (`[-1, 256]`), lo que permite procesar varias secuencias por llamada.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingue: nula; solo ingles.
- No dispone de modo thinking ni de capacidades especiales mas alla de la clasificacion.

## Casos de uso

- Moderacion y triaje de resenas en apps moviles: clasificar resenas de producto o de tienda de aplicaciones como positivas o negativas en el propio dispositivo, sin enviar el texto a un servidor, lo que reduce coste de backend y mejora la privacidad del usuario.
- Enrutamiento de feedback de soporte: preclasificar tickets o comentarios cortos por tono antes de asignarlos a un agente humano o a un flujo automatizado, aprovechando la latencia de 0,14 ms para procesar lotes grandes en tiempo real.
- Analitica de sentimiento en el borde para IoT y wearables: ejecutar el clasificador en dispositivos con CPU limitada, donde un modelo de menos de 1 MB y FP32 encaja en memoria sin necesidad de cuantizacion ni aceleracion.
- Filtrado previo en pipelines de NLP: usar el clasificador como primera etapa barata que descarta o etiqueta texto neutro y negativo antes de invocar un modelo mayor y mas costoso, reduciendo el volumen de inferencia del modelo grande.
- Funcionalidad offline en aplicaciones web y PWA: integrar la tarea `TextClassifier` en JavaScript para clasificar comentarios de usuario sin conexion, usando el mismo artefacto TFLite que en movil.
- Prototipado rapido y demos educativas: el ejemplo en Colab y la demo web permiten mostrar un pipeline completo de clasificacion en dispositivo en pocas lineas de codigo, util para ensenar el flujo MediaPipe Tasks.
- Clasificacion de encuestas y formularios in-app: etiquetar respuestas abiertas cortas (NPS, encuestas de satisfaccion) directamente en el cliente y enviar solo agregados al backend.

## Benchmarks y rendimiento

La unica metrica publicada en la informacion disponible es la latencia del pipeline MediaPipe Tasks. No se han publicado resultados de exactitud, F1 ni comparaciones con otros modelos en la informacion disponible.

| Metrica | Dispositivo | Valor |
|---|---|---|
| Latencia media del pipeline (CPU) | Pixel 6 | 0,14 ms |
| Latencia media del pipeline (GPU) | Pixel 6 | no disponible (no reportada) |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual; el modelo ocupa 775,7 KB en memoria y se ejecuta en CPU. En GPUs no se reporta latencia.
- GPU recomendadas: no disponibles; el modelo esta disenado para CPU en dispositivo.
- Cabe en cualquier GPU de consumo y en practicamente cualquier SoC movil; el limite practico es la memoria del dispositivo, no la GPU.
- Opciones de despliegue: MediaPipe Tasks (`TextClassifier`) en Python, JavaScript/web, Android, iOS y Flutter; el artefacto es un `.tflite` que puede cargarse tambien con el interprete TFLite de LiteRT.
- Latencia: 0,14 ms de media por pipeline en Pixel 6 (CPU). Throughput no publicado; con entrada por lotes (`[-1, 256]`) puede procesarse mas de una secuencia por llamada, pero no se reportan cifras.
- Almacenamiento: 775.706 bytes para el fichero del modelo, mas el vocabulario y las etiquetas ya empaquetados en los metadatos.

## Comparativa con modelos similares

No se dispone de datos de rendimiento (exactitud, F1) de este modelo ni de alternativas en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales verificables.

| Modelo | Tipo | Tamano | Contexto | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|---|
| MediaPipe TextClassifier AverageWord | Clasificador de sentimiento (average word embedding) | 775,7 KB | 256 tokens | Ingles | Apache 2.0 | MediaPipe Tasks / TFLite |
| Clasificadores transformer de sentimiento (p. ej. destilados tipo BERT) | Transformer encoder | Decenas a cientos de MB | 512 tokens tipicamente | Multilingue o ingles | Variable | PyTorch, ONNX, TFLite |
| LLMs generativos pequenos | Transformer decoder | Cientos de MB a varios GB | Miles de tokens | Multiples | Variable | vLLM, llama.cpp, etc. |

La ventaja estructural del modelo MediaPipe es el tamano y la latencia; su desventaja estructural es la ausencia de contexto composicional, ya que el promedio de embeddings ignora el orden de las palabras. No se han publicado comparaciones cuantitativas con las alternativas en la informacion disponible.

## Limitaciones y advertencias

- Solo ingles: no es adecuado para texto en otros idiomas.
- Cambio de dominio: entrenado exclusivamente en SST-2 (resenas de cine); su comportamiento en otros dominios (soporte tecnico, redes sociales, texto legal) no esta documentado y puede degradarse.
- Modelo de bolsa de palabras: al promediar embeddings se pierde el orden de las palabras y las negaciones o construcciones complejas pueden clasificarse de forma incorrecta.
- Sin datos de exactitud publicados: no hay cifras de accuracy o F1 en la model card, por lo que no puede evaluarse su calidad frente a alternativas sin una evaluacion propia.
- Riesgo de clasificacion erronea en textos largos: la entrada se trunca a 256 tokens; el texto que exceda esa longitud no se procesa completo.
- Vocabulario limitado a 10.003 entradas: las palabras fuera del vocabulario se mapean a `<UNKNOWN>`, lo que reduce la senal en textos con jerga, errores ortograficos o vocabulario especializado.
- Licencia Apache 2.0: permite uso comercial y modificacion con las obligaciones habituales de atribucion y aviso de licencia; no se identifican restricciones adicionales en la informacion disponible.
- Sin garantias de equidad documentadas: la model card menciona una seccion de fairness pero no incluye analisis de sesgos en la informacion disponible.
- No apto para decisiones de alto riesgo: es un clasificador binario de sentimiento, no un sistema de moderacion o cumplimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/MediaPipe-TextClassifier-AverageWord
- Fichero del modelo: https://huggingface.co/litert-community/MediaPipe-TextClassifier-AverageWord/blob/main/average_word_classifier.tflite
- Documentacion de MediaPipe Text Classifier: https://developers.google.com/edge/mediapipe/solutions/text/text_classifier
- Demo web: https://google-ai-edge.github.io/mediapipe-samples-web/#/text/text_classifier
- Codigo fuente de la demo web: https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/text-classifier.ts
- Ejemplo Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/text_classification/android
- Ejemplo iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/text_classification/ios
- Notebook de Python (Colab): https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/text_classification/python/text_classifier.ipynb
- Ejemplo Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/text/text_classifier
- Guias de instalacion: Python https://developers.google.com/edge/mediapipe/solutions/setup_python · Web https://developers.google.com/edge/mediapipe/solutions/setup_web · Android https://developers.google.com/edge/mediapipe/solutions/setup_android · iOS https://developers.google.com/edge/mediapipe/solutions/setup_ios · Flutter https://developers.google.com/edge/mediapipe/solutions/setup_flutter
