# litert-community/MediaPipe-ImageSegmenter-Selfie-Multiclass

## Resumen

MediaPipe Selfie Multiclass Segmenter es un modelo de segmentación semántica de imagen orientado a la segmentación de personas en selfies y vídeo, desarrollado originalmente por el equipo de MediaPipe de Google y redistribuido en el ecosistema LiteRT a través de la organización `litert-community`. Clasifica cada píxel de una imagen de entrada en seis categorías semánticas: fondo, pelo, piel del cuerpo, piel de la cara, ropa y otros accesorios, lo que permite construir efectos de realidad aumentada y sustitución de fondos con precisión por región anatómica.

El modelo se distribuye como un único fichero TFLite de 16,37 MB en precisión FP32, con entrada de `[1, 256, 256, 3]` y salida de `[1, 256, 256, 6]`, y está pensado para inferencia on-device en Android, iOS, web, Python y Flutter mediante la tarea `ImageSegmenter` de MediaPipe. Su relevancia actual radica en que ofrece segmentación multiclase de personas con un tamaño muy reducido y sin dependencia de servicios en la nube, lo que lo hace adecuado para aplicaciones móviles y web en tiempo real.

No es un modelo de lenguaje ni un modelo multimodal generativo: es un modelo de visión puro de tipo segmentación densa, con licencia Apache 2.0, lo que facilita su integración en productos comerciales. La información disponible no especifica el número de parámetros ni la longitud de contexto (no aplicable en este tipo de modelo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) para segmentación semántica densa, empaquetado como TFLite con metadatos `ImageSegmenter` v1 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 256×256×3) |
| Tipos de cuantizacion | FP32 (float32); no se distribuyen variantes cuantizadas en el repositorio |
| Idiomas soportados | no disponible (no aplica; modelo de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`selfie_multiclass_256x256.tflite`, 16,37 MB) |
| Tamano del repositorio | 0,0 GB (fichero principal de 16,37 MB + PDF de model card de 1,38 MB) |
| Entrada | `input_29`, shape `[1, 256, 256, 3]`, `float32`, normalización `mean=[127.5]`, `std=[127.5]` |
| Salida | `Identity`, shape `[1, 256, 256, 6]`, `float32`, máscaras de probabilidad por clase |
| Clases | `0` background, `1` hair, `2` body-skin, `3` face-skin, `4` clothes, `5` others (accesorios) |
| Metadatos embebidos | `TFLITE_METADATA`: name `ImageSegmenter`, version `1`, author `MediaPipe`, `labels.txt` empaquetado |
| SHA-256 del modelo | `c6748b1253a99067ef71f7e26ca71096cd449baefa8f101900ea23016507e0e0` |

## Arquitectura y entrenamiento

La model card identifica el modelo como un Vision Transformer aplicado a segmentación semántica multiclase de personas. La entrada es una imagen RGB normalizada con media y desviación estándar de 127,5, lo que corresponde a la convención habitual de MediaPipe para modelos de visión on-device. La salida es un tensor de probabilidades por píxel y por clase (`[1, 256, 256, 6]`), del que se derivan tanto una máscara de categoría (argmax) como máscaras de confianza por clase, tal como expone la API `ImageSegmenter` con `output_category_mask=True` y `output_confidence_masks=True`.

El modelo acepta imágenes en retrato, paisaje o cualquier relación de aspecto, y el pipeline de MediaPipe se encarga del redimensionado a 256×256. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de ajuste fino con RLHF/DPO (no aplicable a un modelo de segmentación). Tampoco se detalla si se emplearon técnicas de destilación o poda para reducir el tamaño a 16,37 MB. La model card incluye un PDF de referencia (`Model Card Multiclass Segmentation.pdf`) que probablemente contiene detalles adicionales de entrenamiento, pero su contenido no se ha proporcionado.

## Capacidades

- Segmentación semántica multiclase de personas en imágenes: clasifica cada píxel en seis categorías (fondo, pelo, piel del cuerpo, piel de la cara, ropa y otros/accesorios).
- Segmentación de una o varias personas en la misma imagen, útil para efectos de AR y vídeo con múltiples sujetos.
- Generación de máscaras de categoría (argmax) y máscaras de confianza por clase, lo que permite umbralizar y combinar regiones.
- Procesamiento on-device en Android, iOS, web (JavaScript/TypeScript), Python y Flutter mediante MediaPipe Tasks.
- Entrada flexible en relación de aspecto: el modelo acepta imágenes en retrato, paisaje o cualquier proporción, con redimensionado interno a 256×256.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente visual de segmentación.
- No dispone de modo "thinking", visión generativa, audio ni capacidades multilingües.

## Casos de uso

- Sustitución de fondos en videollamadas y aplicaciones de vídeo: la máscara de la clase `background` permite recortar al sujeto y recomponerlo sobre un fondo virtual, con separación adicional de pelo y ropa para mejorar los bordes.
- Efectos de maquillaje virtual y retoque facial: las clases `face-skin` y `body-skin` permiten aplicar filtros de color, suavizado o correctores solo sobre la piel, evitando afectar al pelo o la ropa.
- Prueba virtual de ropa y accesorios: la clase `clothes` aísla la prenda para recolorearla o sustituirla, y la clase `others` permite detectar accesorios como gafas o sombreros.
- Recoloreado de pelo en tiempo real: la clase `hair` posibilita cambiar el color del cabello en apps de belleza o entretenimiento sin afectar a la piel ni al fondo.
- Segmentación para edición fotográfica por regiones: en aplicaciones de retoque, el modelo proporciona máscaras por región que el usuario puede ajustar de forma independiente (piel, pelo, ropa) antes de aplicar ajustes locales.
- Procesamiento por lotes en Python para preetiquetado de datasets: dado su tamaño reducido y su licencia Apache 2.0, puede usarse para generar máscaras preliminares de personas en pipelines de anotación, que luego se revisan manualmente.
- Efectos de vídeo en web sin servidor: mediante la integración con MediaPipe Tasks para JavaScript, se puede ejecutar la segmentación en el navegador del usuario, evitando enviar vídeo a un backend y reduciendo la latencia y los costes de infraestructura.
- Aplicaciones móviles de realidad aumentada: en Android e iOS, el modelo se ejecuta on-device con la API `ImageSegmenter`, lo que permite experiencias de AR que funcionan sin conexión y con baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección titulada "Latency Benchmarks", pero su contenido no se ha proporcionado, por lo que no se pueden citar cifras de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de un modelo TFLite de 16,37 MB en FP32, la huella de memoria es muy reducida y está pensada para ejecutarse en CPU/GPU/NPU móviles, no en GPUs de servidor.
- GPU recomendadas: no aplica en el sentido habitual de servidor; el modelo está diseñado para aceleradores on-device (GPU móvil, DSP, NPU) a través del delegado de LiteRT/TFLite. En escritorio o servidor puede ejecutarse en CPU sin problema.
- ¿Cabe en consumer GPU? Sí, con holgura; su tamaño (16,37 MB) es trivial para cualquier GPU de consumo, aunque no es su escenario objetivo.
- Opciones de despliegue: MediaPipe Tasks (`ImageSegmenter`) en Python, Android (Kotlin/Java), iOS (Swift), web (JavaScript/TypeScript) y Flutter (Dart); el fichero TFLite también puede cargarse con el intérprete de TensorFlow Lite / LiteRT directamente.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Entrada | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MediaPipe Selfie Multiclass Segmenter (este modelo) | ViT, segmentación de personas | 6 | 256×256×3 | 16,37 MB FP32 | Apache 2.0 | Hugging Face (litert-community) |
| MediaPipe Selfie Segmenter (variante binaria) | Segmentación de personas | 1 (persona/fondo) | 256×256×3 | no disponible en la información | Apache 2.0 | MediaPipe / LiteRT |
| Segment Anything (SAM) | Segmentación promptable | N/A (máscaras genéricas) | 1024×1024 | cientos de MB | Apache 2.0 (variantes) | Repositorios públicos |
| DeepLabV3+ (MobileNet backbone) | Segmentación semántica | depende del dataset | variable | decenas de MB | variable | TensorFlow Hub / otros |

La comparación con SAM o DeepLabV3+ es orientativa: este modelo está especializado en personas y en despliegue on-device, mientras que SAM es un modelo genérico de segmentación promptable de mayor tamaño y orientado a otro tipo de flujo. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en personas (selfies y vídeo con personas); no está pensado para segmentación semántica genérica de escenas, objetos o animales.
- Solo distingue seis clases; no separa categorías finas como ojos, labios, calzado o tipos de prendas.
- La resolución de entrada es fija a 256×256, por lo que los detalles finos (pelo rizado, gafas, bordes de ropa) pueden perder precisión tras el redimensionado.
- No se especifican en la información disponible los sesgos demográficos del dataset de entrenamiento; como en cualquier modelo de visión, puede presentar diferencias de rendimiento según tono de piel, tipo de pelo, iluminación o accesorios culturales.
- Riesgo de alucinación en sentido generativo no aplica, pero sí puede producir máscaras erróneas en condiciones de oclusión, movimiento rápido, baja iluminación o personas parcialmente fuera de encuadre.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la model card original de Google incluida como PDF para condiciones adicionales de atribución o uso responsable.
- No se distribuyen variantes cuantizadas (INT8, FP16) en el repositorio, lo que puede limitar optimizaciones específicas en algunos aceleradores.
- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni agentes, y no debe evaluarse con benchmarks de NLP.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/MediaPipe-ImageSegmenter-Selfie-Multiclass
- Fichero del modelo: https://huggingface.co/litert-community/MediaPipe-ImageSegmenter-Selfie-Multiclass/blob/main/selfie_multiclass_256x256.tflite
- Documentación de MediaPipe Image Segmenter: https://developers.google.com/edge/mediapipe/solutions/vision/image_segmenter
- Guía de instalación en Python: https://developers.google.com/edge/mediapipe/solutions/setup_python
- Guía de instalación en web/JavaScript: https://developers.google.com/edge/mediapipe/solutions/setup_web
- Guía de instalación en Android: https://developers.google.com/edge/mediapipe/solutions/setup_android
- Guía de instalación en iOS: https://developers.google.com/edge/mediapipe/solutions/setup_ios
- Guía de instalación en Flutter: https://developers.google.com/edge/mediapipe/solutions/setup_flutter
- Demo web en vivo: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/image_segmenter
- Código fuente del ejemplo web: https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/image-segmenter.ts
- Ejemplo Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_segmentation/android
- Ejemplo iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_segmentation/ios
- Notebook de Python (Colab): https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/image_segmentation/python/image_segmentation.ipynb
- Ejemplo Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/vision/image_segmenter
