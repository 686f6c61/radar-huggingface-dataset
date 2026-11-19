# litert-community/MediaPipe-ObjectDetector-SSD-MobileNet-V2

## Resumen

MediaPipe-ObjectDetector-SSD-MobileNet-V2 es un modelo de detección de objetos empaquetado por la comunidad `litert-community` para su uso con la tarea `ObjectDetector` de MediaPipe y con el runtime LiteRT (anteriormente TensorFlow Lite). Combina una columna vertebral MobileNetV2 con una cabeza de detección SSD a una resolución de entrada de 256 x 256 píxeles, y está entrenado sobre el conjunto de datos COCO (1,5 millones de instancias, 80 clases efectivas sobre 90 posiciones de etiqueta COCO). Su propósito es ofrecer detección de objetos de baja latencia y bajo consumo de memoria en dispositivos móviles y embebidos.

El modelo se distribuye en dos variantes de precisión: `ssd_mobilenet_v2_float16.tflite` (5,92 MB) y `ssd_mobilenet_v2_float32.tflite` (11,32 MB). Ambos ficheros incluyen metadatos `TFLITE_METADATA` con el nombre de tarea `ObjectDetector`, versión 1 y autoría de MediaPipe, además de un fichero de etiquetas embebido de 91 líneas (índice 0 reservado para `background`, seguido de las 90 posiciones COCO). Se acompaña además un `labelmap.txt` independiente de 90 líneas.

Es relevante ahora porque representa el formato de distribución moderno de los modelos de visión de Google para el ecosistema LiteRT y MediaPipe Tasks, con soporte homogéneo para Android, iOS, web, Python y Flutter. No es un modelo de lenguaje: es un detector de objetos convolucional clásico, orientado a inferencia en el borde, no a generación de texto ni a razonamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SSD con columna vertebral MobileNetV2 y cabeza de detección |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de 256 x 256 x 3) |
| Tipos de cuantización | float16 y float32 (dos ficheros TFLite) |
| Idiomas soportados | no disponible (no es un modelo lingüístico; etiquetas en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`.tflite`) con metadatos `TFLITE_METADATA` |

Otras especificaciones relevantes:

| Parámetro | Valor |
|---|---|
| Resolución de entrada | 256 x 256 RGB, tensor `[1, 256, 256, 3]` float32 |
| Normalización | `mean=[127.5]`, `std=[127.5]` |
| Salida de cajas | `[1, 12276, 4]` float32 |
| Salida de puntuaciones | `[1, 12276, 91]` float32 |
| Clases | 80 clases COCO efectivas sobre 91 posiciones (índice 0 = background) |
| Dataset de entrenamiento | COCO (1,5 millones de instancias) |
| Tamaño float16 | 5,92 MB (5.918.749 bytes) |
| Tamaño float32 | 11,32 MB (11.316.189 bytes) |
| Runtime | LiteRT / MediaPipe Tasks |
| Plataformas | Android, iOS, web, Python, Flutter |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema SSD (Single Shot MultiBox Detector, arXiv:1512.02325) con MobileNetV2 como extractor de características. La entrada se fija a 256 x 256 píxeles RGB y se normaliza con media y desviación de 127,5. La red produce 12.276 propuestas de caja, cada una con cuatro coordenadas y 91 puntuaciones de clase (la posición 0 corresponde a `background` y las 90 restantes a las posiciones de etiqueta COCO). El diseño prioriza latencia y huella de memoria reducidas frente a alternativas como EfficientDet-Lite, lo que se traduce en un modelo de menos de 12 MB en float32 y menos de 6 MB en float16.

El entrenamiento se realizó sobre COCO, con 1,5 millones de instancias anotadas. La información disponible no detalla el número de tokens (no aplica), la composición exacta del dataset más allá de COCO, ni si hubo ajuste fino adicional, destilación o técnicas de aumento de datos específicas. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal, que no aplican a este tipo de modelo convolucional. La innovación práctica reside en el empaquetado: metadatos `TFLITE_METADATA` embebidos con nombre de tarea, versión y fichero de etiquetas asociado, lo que permite a MediaPipe Tasks cargar el modelo sin configuración adicional de etiquetas.

## Capacidades

- Detección de objetos en imágenes estáticas en modo `IMAGE`.
- Detección sobre flujos de vídeo en modo `VIDEO` con seguimiento entre fotogramas (según la API de MediaPipe Tasks).
- Detección en tiempo real sobre stream de cámara en modo `LIVE_STREAM`.
- Clasificación en 80 clases COCO (persona, vehículos, animales, utensilios, etc.) sobre 91 posiciones de etiqueta.
- Salida de cajas delimitadoras con coordenadas y puntuación de confianza por detección.
- Umbral de puntuación configurable (`score_threshold`) y número máximo de resultados (`max_results`).
- Ejecución en el dispositivo sin conexión a red, en Android, iOS, web, Python y Flutter.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües ni de modo de pensamiento (`thinking mode`); las etiquetas de clase están en inglés.
- No soporta visión multimodal en el sentido de un modelo de lenguaje con visión; es exclusivamente un detector.

## Casos de uso

- **Detección de personas y objetos en apps móviles**: integrado mediante MediaPipe Tasks en Android (Kotlin/Java) o iOS (Swift), el modelo procesa fotogramas de cámara a 256 x 256 y devuelve cajas con puntuación; su tamaño de 5,92 MB en float16 permite incluirlo en el binario de la app sin descarga adicional.
- **Moderación de contenido visual en el borde**: filtrado previo de imágenes subidas por usuarios para detectar categorías COCO relevantes (personas, vehículos, animales) antes de enviarlas al servidor, reduciendo ancho de banda y coste de cómputo en la nube.
- **Automatización de inventario o recuento**: en aplicaciones de retail o logística, el detector puede contar objetos de clases COCO en imágenes capturadas por el dispositivo, con umbral de confianza ajustable según la tolerancia a falsos positivos.
- **Asistencia a la conducción de bajo coste**: detección de peatones y vehículos en dashcams o dispositivos embebidos con poca memoria, donde el tamaño reducido del modelo y la inferencia local son requisitos críticos.
- **Procesamiento por lotes en Python**: uso del modelo desde Python con `mediapipe` y `huggingface_hub` para anotar datasets de imágenes o generar etiquetas preliminares en pipelines de visión por computador.
- **Aplicaciones web interactivas**: uso desde JavaScript en el navegador mediante MediaPipe Web, con el modelo cargado como recurso estático, para demos o herramientas de anotación que funcionan sin backend.
- **Prototipado rápido en Flutter**: integración multiplataforma en apps Flutter para validar flujos de detección antes de invertir en un modelo personalizado o en un pipeline más complejo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de mAP, latencia ni throughput para este modelo en particular, ni comparaciones numéricas con EfficientDet-Lite u otras variantes.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no aplica en el sentido de GPU dedicada; el modelo está diseñado para CPU, GPU móvil o aceleradores NPU/DSP a través de LiteRT. El fichero float16 ocupa 5,92 MB y el float32 11,32 MB, por lo que la huella de memoria es mínima incluso en dispositivos con 1-2 GB de RAM.
- **GPU recomendadas**: no se especifican. En escritorio puede ejecutarse en CPU sin problema; en móvil se beneficia de los delegados de GPU de LiteRT (GPU delegate) si están disponibles.
- **¿Cabe en GPU de consumo?**: sí, con enorme margen; cualquier GPU de consumo puede ejecutarlo, aunque el modelo está pensado para ejecución en el dispositivo, no para servidores con GPU.
- **Opciones de despliegue**: MediaPipe Tasks (Python, Android, iOS, web, Flutter), LiteRT (antes TensorFlow Lite) con intérprete nativo o delegados de GPU/NNAPI/XNNPACK. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput estimados**: no disponibles en la información proporcionada. La model card no publica cifras de latencia por plataforma.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Clases | Tamaño | Licencia | Formato |
|---|---|---|---|---|---|---|
| MediaPipe SSD-MobileNet-V2 (este) | SSD + MobileNetV2 | 256 x 256 | 80 COCO (91 posiciones) | 5,92 MB fp16 / 11,32 MB fp32 | Apache 2.0 | TFLite |
| EfficientDet-Lite (familia MediaPipe) | EfficientDet-Lite | variable (según variante) | 90 COCO | no disponible en esta ficha | Apache 2.0 | TFLite |
| SSD-MobileNet-V1 (MediaPipe) | SSD + MobileNetV1 | no disponible | 90 COCO | no disponible en esta ficha | Apache 2.0 | TFLite |

La información disponible no incluye métricas de rendimiento comparadas (mAP, latencia) entre estas alternativas, por lo que la comparación se limita a arquitectura, formato y licencia. La model card indica explícitamente que SSD-MobileNet-V2 prioriza menor latencia y huella de memoria frente a EfficientDet-Lite, pero sin cifras que lo cuantifiquen.

## Limitaciones y advertencias

- **Sesgos del dataset**: entrenado sobre COCO, hereda los sesgos de representación de dicho conjunto (predominio de ciertas categorías, contextos y geografías). Las clases no representadas o infrarrepresentadas tendrán peor rendimiento.
- **Riesgo de falsos positivos y negativos**: el umbral de puntuación es configurable, pero no se publican curvas precisión-recall ni mAP por clase; en producción conviene calibrar `score_threshold` con datos propios.
- **Limitación de resolución**: la entrada fija de 256 x 256 limita la detección de objetos pequeños o muy alejados en la imagen.
- **Limitación de clases**: solo detecta las 80 clases COCO; no es extensible a clases personalizadas sin reentrenamiento.
- **Idioma**: las etiquetas están en inglés; no hay soporte multilingüe de etiquetas en el modelo.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del dataset COCO y de los metadatos de MediaPipe para atribuciones.
- **Metadatos y compatibilidad**: el modelo depende de la API de MediaPipe Tasks y del runtime LiteRT; cambios de versión en estas librerías pueden afectar a la carga de metadatos y etiquetas.
- **No es un modelo generativo**: no debe evaluarse con criterios de LLM (alucinación textual, contexto, tool calling); sus fallos son de detección, no de generación.
- **Datos incompletos**: no se publican parámetros totales, latencia, throughput ni métricas de precisión, lo que dificulta una evaluación cuantitativa previa al despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/MediaPipe-ObjectDetector-SSD-MobileNet-V2
- Documentación de la tarea Object Detector de MediaPipe: https://developers.google.com/edge/mediapipe/solutions/vision/object_detector
- LiteRT: https://developers.google.com/edge/litert
- Guía de instalación en Python: https://developers.google.com/edge/mediapipe/solutions/setup_python
- Guía de instalación en web/JavaScript: https://developers.google.com/edge/mediapipe/solutions/setup_web
- Guía de instalación en Android: https://developers.google.com/edge/mediapipe/solutions/setup_android
- Guía de instalación en iOS: https://developers.google.com/edge/mediapipe/solutions/setup_ios
- Guía de instalación en Flutter: https://developers.google.com/edge/mediapipe/solutions/setup_flutter
- Demo web: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/object_detector
- Paper SSD (arXiv:1512.02325): https://arxiv.org/abs/1512.02325
