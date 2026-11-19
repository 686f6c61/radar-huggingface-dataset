# litert-community/MediaPipe-LanguageDetector

## Resumen

MediaPipe Language Detector es un clasificador de idioma ultra-ligero desarrollado por los equipos Learn2Compress y MediaPipe de Google Research, publicado originalmente en mayo de 2023 y redistribuido en el repositorio `litert-community` de Hugging Face como artefacto TFLite listo para LiteRT y MediaPipe Tasks. No es un modelo generativo ni un transformer de gran tamano: es una red neuronal de clasificacion basada en embeddings con hashing de caracteristicas y tablas de lookup compactas, empaquetada en un unico fichero `language_detector.tflite` de 315 KB en FP32. Su funcion es identificar el idioma de una cadena UTF-8 y devolver una distribucion de probabilidad sobre 111 clases (110 idiomas en codigos ISO 639-1 / BCP-47 mas la clase `unknown`).

El modelo resuelve un problema de preprocesado muy concreto en pipelines NLP: saber en que idioma esta escrito un texto antes de enrutarlo a un traductor, un corrector, un sistema de Smart Reply o un motor OCR. Su relevancia actual viene de que cabe en cualquier dispositivo (Android, iOS, web, Flutter, Python) sin GPU ni aceleracion especial, con latencias del orden de microsegundos a decimas de milisegundo, y con licencia Apache 2.0 que permite uso comercial sin friccion.

La informacion disponible no detalla la arquitectura interna mas alla de "red de clasificacion neuronal basada en embeddings con feature hashing y lookup tables", ni el numero de parametros, ni la composicion exacta del dataset de entrenamiento mas alla de que proviene de datos web traducidos y anonimizados. La ficha refleja por tanto esos limites con marcas de "no disponible" donde corresponde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de clasificacion basada en embeddings, con feature hashing y tablas de lookup compactas; empaquetada como TFLite (nombre interno `LangID` v1, autor `MediaPipe`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la entrada es una unica cadena UTF-8; el PDF reporta pruebas con textos de hasta 350 tokens) |
| Tipos de cuantizacion | solo FP32 (`float32`) en el artefacto publicado |
| Idiomas soportados | 110 idiomas en codigos ISO 639-1 / BCP-47 (`af` a `zu`, incluyendo variantes `-Latn` transliteradas) mas la clase `unknown` |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`language_detector.tflite`), con metadatos `TFLITE_METADATA` y fichero asociado `labels.txt` |
| Tamano del artefacto | 315.294 bytes (315,3 KB) |
| Entrada | Tensor `Placeholder`, shape `[1]`, tipo `string` (UTF-8) |
| Salida | Tensor `pod/Softmax`, shape `[1, 111]`, tipo `float32` (probabilidades por idioma) |
| SHA-256 del modelo | `7db4f23dfe1ad8966b050b419a865da451143fd43eb6b606a256aadeeb1e5417` |

## Arquitectura y entrenamiento

La model card describe el modelo como una red de clasificacion neuronal basada en embeddings, optimizada con feature hashing y tablas de lookup compactas. La entrada es una unica cadena UTF-8 y la salida es una capa Softmax de 111 clases, una por idioma mas `unknown`. No se especifica el numero de capas, dimensiones de embedding ni vocabulario de caracteristicas, por lo que no es posible reconstruir la topologia exacta a partir de la informacion disponible. El artefacto se distribuye como TFLite con metadatos embebidos (`name: LangID`, `version: 1`, `author: MediaPipe`) y un fichero `labels.txt` empaquetado como recurso asociado.

El entrenamiento se realizo, segun el PDF adjunto (Google Research, Learn2Compress & MediaPipe Teams, 10 de mayo de 2023), sobre datos web traducidos y anonimizados (PII-stripped) que cubren idiomas de las 17 subregiones geograficas de la ONU. La model card advierte que hay mas datos de entrenamiento para idiomas populares como ingles y frances, lo que introduce un sesgo de cobertura. No se documenta en la informacion proporcionada el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo etapas de RLHF, DPO o ajuste fino supervisado adicional. Tampoco se detalla ninguna innovacion de decodificacion especulativa ni mecanismo de atencion: el modelo es un clasificador, no un generador.

## Capacidades

- Identificacion de idioma sobre texto UTF-8, devolviendo una distribucion de probabilidad sobre 111 clases (110 idiomas + `unknown`).
- Cobertura de 110 idiomas en codigos ISO 639-1 y variantes BCP-47 con sufijo `-Latn` para idiomas transliterados.
- Clasificacion de una unica cadena por invocacion (entrada `[1]`), apta para llamadas de alta frecuencia en pipelines.
- Ejecucion on-device en Android, iOS, web (JavaScript), Python y Flutter mediante MediaPipe Tasks.
- Umbral de confianza configurable (`score_threshold`, por defecto 0.5 en el ejemplo de la model card) para filtrar detecciones de baja probabilidad.
- Integracion como tarea MediaPipe (`mp.tasks.text.LanguageDetector`) con API de alto nivel y opciones de `BaseOptions`.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni generacion de texto: es exclusivamente un clasificador.

## Casos de uso

- **Enrutado idiomatico en pipelines NLP**: antes de enviar un texto a un traductor, un corrector ortografico o un modelo de resumen, el detector identifica el idioma en menos de 1 ms y permite seleccionar el recurso adecuado. Es adecuado por su latencia (0,31 ms en Pixel 6) y su tamano (315 KB), que permite ejecutarlo en cada peticion sin coste apreciable.
- **Smart Reply y teclados moviles**: integrado en el teclado o en la app de mensajeria, detecta el idioma del mensaje entrante para activar sugerencias de respuesta en el idioma correcto. La ejecucion on-device evita enviar texto del usuario a servidores, lo que reduce exposicion de datos personales.
- **Preprocesado OCR**: tras extraer texto de una imagen, el detector identifica el idioma para seleccionar el modelo de correccion, el diccionario o el motor de traduccion adecuado. La model card cita explicitamente OCR entre las aplicaciones previstas.
- **Moderacion de contenido multilingue**: clasificar el idioma de comentarios y publicaciones antes de aplicar filtros o politicas especificas por region, usando la salida de 111 clases para decidir que reglas aplicar.
- **Analitica de producto y telemetria**: etiquetar idioma en logs de aplicaciones moviles para segmentar metricas por idioma sin salir del dispositivo, aprovechando que el modelo cabe en el binario de la app (315 KB).
- **Deteccion de idioma en asistentes de voz y transcripcion**: como primer paso tras un motor ASR, identificar el idioma de la transcripcion para activar el modelo de lenguaje o el corrector adecuado.
- **Filtrado previo en datasets multilingues**: clasificar muestras de un corpus para separar por idioma antes de entrenar otros modelos, con la ventaja de que el clasificador es determinista y de coste despreciable.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Latencia media end-to-end (MediaPipe Task) | 0,31 ms | Pixel 6, CPU |
| Latencia media (PDF adjunto) | 90 µs | Pixel 2, texto de 350 tokens |
| F1 | 0,9781 | Muestras multilingues de `en.wikinews.org` (Creative Commons v2.5) |
| Precision | 0,9893 | Mismo conjunto |
| Recall | 0,9673 | Mismo conjunto |

No se han publicado en la informacion disponible resultados de benchmarks estandar tipo MMLU, HumanEval o GSM8K, ya que el modelo no es generativo. La comparacion con otros detectores de idioma no se incluye porque la informacion proporcionada no aporta datos de modelos alternativos.

## Requisitos de hardware

- **VRAM**: no aplica; el modelo es TFLite FP32 de 315 KB y esta pensado para ejecucion en CPU.
- **GPU recomendadas**: no requiere GPU. La model card solo reporta latencias en CPU (Pixel 6, Pixel 2).
- **Consumer GPU**: irrelevante; cabe en cualquier dispositivo con unos pocos cientos de KB de RAM libre.
- **Plataformas soportadas**: Android (Kotlin/Java), iOS (Swift), web (JavaScript), Python y Flutter, a traves de MediaPipe Tasks.
- **Opciones de despliegue**: MediaPipe Tasks (`mp.tasks.text.LanguageDetector`), LiteRT/TFLite runtime, y los samples oficiales de Google AI Edge. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos.
- **Latencia y throughput**: 0,31 ms por inferencia en Pixel 6 (CPU); 90 µs en Pixel 2 con textos de 350 tokens. El throughput no se reporta explicitamente, pero a partir de la latencia se puede estimar del orden de miles de inferencias por segundo en un solo core.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de modelos alternativos de deteccion de idioma (por ejemplo, fastText lid.176, CLD3 o langid.py) que permitan una comparacion con parametros, contexto, rendimiento y licencia verificables. Se recomienda consultar la documentacion oficial de MediaPipe para benchmarks actualizados.

## Limitaciones y advertencias

- **Sesgo de cobertura**: hay mas datos de entrenamiento para idiomas populares (ingles, frances) que para el resto, lo que puede reducir la precision en idiomas con menos representacion.
- **Clase `unknown`**: el modelo puede devolver `unknown` cuando la confianza es baja; conviene fijar un `score_threshold` adecuado al caso de uso.
- **Textos cortos o ambiguos**: la informacion no detalla el comportamiento en cadenas muy cortas (una palabra, un emoji, un identificador), donde la deteccion puede ser inestable.
- **Sin contexto largo**: la entrada es una unica cadena y no se documenta ventana de contexto; los benchmarks usan textos de hasta 350 tokens.
- **Riesgo de alucinacion**: no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea con alta confianza en textos mezclados o transliterados.
- **Licencia Apache 2.0**: permite uso comercial, modificacion y redistribucion con atribucion; no se identifican restricciones adicionales en la informacion disponible.
- **Usos fuera de alcance segun el PDF adjunto**: no apto para decisiones criticas para la vida humana, incluyendo contextos financieros y contractuales.
- **Artefacto unico FP32**: no se publican variantes cuantizadas (INT8, FP16) en el repositorio, aunque el formato TFLite permitiria conversiones.
- **Sin datos de parametros ni arquitectura detallada**: dificulta auditorias tecnicas profundas y comparaciones cuantitativas con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/MediaPipe-LanguageDetector
- Fichero del modelo: https://huggingface.co/litert-community/MediaPipe-LanguageDetector/blob/main/language_detector.tflite
- Labels: https://huggingface.co/litert-community/MediaPipe-LanguageDetector/blob/main/labels.txt
- Model card PDF (Google Research): https://huggingface.co/litert-community/MediaPipe-LanguageDetector/blob/main/LanguageDetector%20Model%20Card.pdf
- Documentacion de la tarea Language Detector: https://developers.google.com/edge/mediapipe/solutions/text/language_detector
- Benchmarks de la tarea: https://developers.google.com/edge/mediapipe/solutions/text/language_detector#task_benchmarks
- Guia de setup en Python: https://developers.google.com/edge/mediapipe/solutions/setup_python
- Guia de setup en Web/JavaScript: https://developers.google.com/edge/mediapipe/solutions/setup_web
- Guia de setup en Android: https://developers.google.com/edge/mediapipe/solutions/setup_android
- Guia de setup en iOS: https://developers.google.com/edge/mediapipe/solutions/setup_ios
- Guia de setup en Flutter: https://developers.google.com/edge/mediapipe/solutions/setup_flutter
- Demo web: https://google-ai-edge.github.io/mediapipe-samples-web/#/text/language_detector
- Sample Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/language_detector/android
- Sample iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/language_detector/ios
- Notebook Python: https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/language_detector/python/%5BMediaPipe_Python_Tasks%5D_Language_Detector.ipynb
- Sample Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/text/language_detector
