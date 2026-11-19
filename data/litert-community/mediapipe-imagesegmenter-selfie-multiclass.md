# litert-community/MediaPipe-ImageSegmenter-Selfie-Multiclass

## Resumen

El MediaPipe Selfie Multiclass Segmenter es un modelo de segmentación semántica de imagen orientado a la clasificación por píxel de personas en primer plano, desarrollado por el equipo de MediaPipe (Google AI Edge) y redistribuido en el ecosistema LiteRT. Su función concreta es asignar cada píxel de una imagen a una de seis categorías semánticas: fondo, pelo, piel del cuerpo, piel de la cara, ropa y otros (accesorios), lo que permite construir efectos de realidad aumentada, sustitución de fondos y filtros de videoconferencia en tiempo real directamente en el dispositivo.

Técnicamente es un Vision Transformer (ViT) empaquetado en formato TensorFlow Lite con precisión FP32, con un tamaño de 16,37 MB y una resolución fija de entrada de 256×256 píxeles. Se integra como tarea `ImageSegmenter` dentro del framework MediaPipe Tasks, disponible para Python, Web/JavaScript, Android, iOS y Flutter, lo que lo convierte en una pieza reutilizable para pipelines de visión en movilidad sin dependencia de servidores.

Su relevancia actual reside en que cubre el segmentado multiclase de personas (no solo fondo/primer plano, como los modelos Selfie clásicos) con un coste computacional bajo: 71,24 ms de latencia en GPU y 217,76 ms en CPU sobre un Pixel 6. Es, por tanto, una opción práctica para procesado on-device en aplicaciones de entretenimiento interactivo y videollamadas donde la privacidad y la latencia importan más que la precisión de máscara a nivel de píxel.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) para segmentación semántica multiclase |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 256×256×3) |
| Tipos de cuantización | FP32 (float32) únicamente en el repositorio |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`selfie_multiclass_256x256.tflite`), 16,37 MB, SHA-256 `c6748b1253a99067ef71f7e26ca71096cd449baefa8f101900ea23016507e0e0` |

Especificaciones adicionales relevantes:

| Parámetro | Valor |
|---|---|
| Tensor de entrada | `input_29`, forma `[1, 256, 256, 3]`, `float32` |
| Normalización de entrada | `mean=[127.5]`, `std=[127.5]` |
| Tensor de salida | `Identity`, forma `[1, 256, 256, 6]`, `float32` (probabilidades por clase) |
| Etiquetas | `background`, `hair`, `body-skin`, `face-skin`, `clothes`, `others` |
| Metadatos embebidos | `TFLITE_METADATA`: nombre `ImageSegmenter`, versión `1`, autor `MediaPipe`, fichero asociado `labels.txt` |
| Relación de aspecto de entrada | admite retrato, paisaje y cualquier proporción |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de Vision Transformer adaptada a segmentación densa: la imagen de 256×256 se divide en parches, se procesa mediante bloques de auto-atención y se reconstruye una salida por píxel de 6 canales de probabilidad. La salida es un tensor `[1, 256, 256, 6]` que representa, para cada píxel, la distribución de probabilidad sobre las seis clases semánticas. El modelo se distribuye exclusivamente en FP32, sin variantes cuantizadas en el repositorio.

No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del dataset, el uso de técnicas de alineación (RLHF/DPO no aplican a un modelo de visión) ni innovaciones específicas de entrenamiento. La model card referenciada (Adel Ahmadyan, Google, 10 de mayo de 2023) documenta aplicaciones previstas, usos fuera de alcance y evaluación de equidad, pero los detalles de entrenamiento no se incluyen en el extracto disponible. La integración se realiza a través de la API `ImageSegmenter` de MediaPipe Tasks, que gestiona el preprocesado (redimensionado y normalización) y el postprocesado de máscaras.

## Capacidades

- Segmentación semántica multiclase por píxel en seis categorías: `background`, `hair`, `body-skin`, `face-skin`, `clothes` y `others` (accesorios).
- Segmentación de una o varias personas en la misma imagen (single- o multi-person).
- Generación simultánea de máscara de categorías (`output_category_mask=True`) y máscaras de confianza por clase (`output_confidence_masks=True`).
- Procesado de imágenes con cualquier relación de aspecto (retrato, paisaje, formato libre).
- Ejecución on-device en Android, iOS, Web/JavaScript, Python y Flutter mediante MediaPipe Tasks.
- Modo de ejecución de imagen individual (`VisionRunningMode.IMAGE`); no se documenta en la información disponible soporte de vídeo en streaming ni de modo LIVE_STREAM para esta variante.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de lenguaje: es un modelo puramente visual.

## Casos de uso

- **Sustitución de fondo en videoconferencias**: el modelo clasifica cada píxel en `background` frente a las clases de persona, lo que permite recortar al sujeto y componer un fondo virtual en tiempo real. Con 71,24 ms en GPU sobre Pixel 6, es viable para vídeo a tasas interactivas en dispositivos móviles de gama media-alta.
- **Filtros de realidad aumentada por regiones**: al distinguir `hair`, `face-skin`, `body-skin` y `clothes`, se pueden aplicar efectos independientes (recoloreado de pelo, maquillaje virtual, cambio de ropa) sin necesidad de un modelo separado por región.
- **Edición fotográfica on-device**: aplicaciones de retoque que ajustan exposición o saturación solo sobre la piel de la cara o el cuerpo, preservando el resto de la imagen, ejecutando la inferencia localmente sin enviar fotos a un servidor.
- **Previsualización de productos de moda y cosmética**: segmentar `clothes`, `hair` y `face-skin` permite superponer probadores virtuales de ropa o tonos de maquillaje sobre la imagen del usuario en el propio dispositivo.
- **Anonimización selectiva en captura de vídeo**: combinado con el pipeline de MediaPipe, se puede difuminar el fondo o regiones concretas (`background`, `others`) antes de transmitir, útil en herramientas de comunicación con requisitos de privacidad.
- **Generación de máscaras para pipelines de posprocesado**: las máscaras de confianza por clase (`[1, 256, 256, 6]`) sirven como entrada a etapas posteriores de composición, maduración alfa o estilización, integrándose en herramientas de creación de contenido en Flutter o Web.
- **Prototipado rápido multiplataforma**: al estar disponible como tarea MediaPipe con guías para Python, Web, Android, iOS y Flutter, permite validar una idea de segmentación de personas en un cuaderno de Colab y portarla al móvil con cambios mínimos de código.

## Benchmarks y rendimiento

Latencia extremo a extremo del pipeline MediaPipe Task reportada en la documentación del Image Segmenter:

| Variante | Dispositivo | Latencia CPU | Latencia GPU |
|---|---|---:|---:|
| SelfieMulticlass (256×256) | Pixel 6 | 217,76 ms | 71,24 ms |

No se han publicado resultados de benchmarks de calidad de segmentación (mIoU, precisión por clase) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no aplica en el sentido habitual; el modelo es de 16,37 MB en FP32 y está pensado para inferencia on-device. En aceleradores móviles, el consumo de memoria es del orden de decenas de MB incluyendo buffers intermedios del grafo TFLite.
- **GPU recomendadas**: GPU integrada de dispositivos móviles (el benchmark usa un Pixel 6 con aceleración GPU); en escritorio, cualquier GPU compatible con el delegado GPU de TFLite o LiteRT. No requiere A100, H100 ni RTX 4090.
- **Compatibilidad con GPU de consumo**: sí, cabe holgadamente en cualquier GPU de consumo e incluso en CPU de móvil; no es un modelo que requiera hardware de centro de datos.
- **Opciones de despliegue**: MediaPipe Tasks (`ImageSegmenter`) en Python, Web/JavaScript, Android (Kotlin/Java), iOS (Swift) y Flutter (Dart); el fichero `.tflite` puede ejecutarse también con el intérprete de TensorFlow Lite / LiteRT directamente.
- **Latencia y throughput**: 217,76 ms en CPU y 71,24 ms en GPU sobre Pixel 6 (pipeline completo MediaPipe). El throughput no se documenta explícitamente; a partir de la latencia GPU se puede estimar del orden de 14 inferencias por segundo en ese dispositivo, aunque la cifra no está confirmada en la información disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Resolución | Tamaño | Licencia | Contexto de uso |
|---|---|---|---|---|---|---|
| MediaPipe Selfie Multiclass Segmenter (este) | ViT, TFLite | 6 (fondo, pelo, piel cuerpo, piel cara, ropa, otros) | 256×256 | 16,37 MB FP32 | Apache 2.0 | On-device, MediaPipe Tasks |
| MediaPipe Selfie Segmenter (variante binaria) | Segmentación binaria persona/fondo | 2 | no disponible en esta ficha | no disponible | Apache 2.0 (ecosistema MediaPipe) | On-device, efectos de fondo |
| Modelos de segmentación de personas de propósito general (p. ej., variantes de SegFormer/Mask2Former) | Transformer de segmentación | variable (COCO, ADE20K, etc.) | variable | cientos de MB | variable | Servidor o GPU de escritorio |

La comparación cuantitativa con alternativas concretas no está disponible en la información proporcionada. La ventaja diferencial de este modelo frente a segmentadores genéricos es su tamaño reducido y su integración nativa en MediaPipe para móvil; su limitación es la resolución fija de 256×256 y la ausencia de variantes cuantizadas publicadas.

## Limitaciones y advertencias

- **Usos explícitamente fuera de alcance**: cualquier forma de vigilancia o reconocimiento de identidad está fuera de alcance y no habilitada por la tecnología, según la model card original.
- **Decisiones críticas para la vida humana**: no debe usarse en aplicaciones que requieran máscaras perfectas a nivel de píxel ni en decisiones de alto riesgo.
- **Resolución limitada**: la salida es de 256×256, por lo que los contornos finos (pelo, accesorios pequeños) pueden presentar imprecisión al reescalar a la resolución original.
- **Rendimiento dependiente del dominio**: el modelo está entrenado para sujetos humanos en selfis y cuerpo completo; su comportamiento en escenas sin personas o con oclusiones complejas no está documentado en la información disponible.
- **Sesgos**: la model card original incluye una evaluación de equidad para la variante de 256×256, pero los resultados concretos no se recogen en el extracto disponible; se recomienda consultar el PDF adjunto antes de desplegar en producción.
- **Sin variantes cuantizadas**: solo se publica FP32, lo que limita optimizaciones de tamaño y latencia en dispositivos de gama baja.
- **Idiomas**: no aplica, pero tampoco se documenta el comportamiento ante texto en la imagen (rótulos, subtítulos) más allá de la clase `others`.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del ecosistema MediaPipe y de los metadatos embebidos en el `.tflite` antes de redistribuirlo.
- **Fecha de creación del repositorio**: el registro indica creación en noviembre de 2026; verificar la vigencia y el mantenimiento del repositorio antes de adoptarlo como dependencia estable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/MediaPipe-ImageSegmenter-Selfie-Multiclass
- Fichero de pesos: https://huggingface.co/litert-community/MediaPipe-ImageSegmenter-Selfie-Multiclass/blob/main/selfie_multiclass_256x256.tflite
- Model card original (PDF): https://huggingface.co/litert-community/MediaPipe-ImageSegmenter-Selfie-Multiclass/blob/main/Model%20Card%20Multiclass%20Segmentation.pdf
- Documentación de Image Segmenter: https://developers.google.com/edge/mediapipe/solutions/vision/image_segmenter
- Benchmarks de la tarea: https://developers.google.com/edge/mediapipe/solutions/vision/image_segmenter#task_benchmarks
- Guía de configuración en Python: https://developers.google.com/edge/mediapipe/solutions/setup_python
- Guía de configuración en Web/JavaScript: https://developers.google.com/edge/mediapipe/solutions/setup_web
- Guía de configuración en Android: https://developers.google.com/edge/mediapipe/solutions/setup_android
- Guía de configuración en iOS: https://developers.google.com/edge/mediapipe/solutions/setup_ios
- Guía de configuración en Flutter: https://developers.google.com/edge/mediapipe/solutions/setup_flutter
- Demo web: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/image_segmenter
- Ejemplo Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_segmentation/android
- Ejemplo iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_segmentation/ios
- Cuaderno de Colab (Python): https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/image_segmentation/python/image_segmentation.ipynb
- Ejemplo Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/vision/image_segmenter
