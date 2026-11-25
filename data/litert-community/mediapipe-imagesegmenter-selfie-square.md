# litert-community/MediaPipe-ImageSegmenter-Selfie-Square

## Resumen

MediaPipe-ImageSegmenter-Selfie-Square es un modelo de segmentación de imagen ultraligero publicado por la comunidad `litert-community` en Hugging Face. Se trata de la variante cuadrada del segmentador de selfies de MediaPipe, empaquetada como `selfie_segmenter.tflite` con pesos en FP16 y una entrada de 256×256 píxeles. Su propósito es generar una máscara de confianza de persona (selfie frente a fondo) para tareas de desenfoque o sustitución de fondo en videollamadas y realidad aumentada móvil, ejecutándose íntegramente en el dispositivo mediante la tarea MediaPipe Image Segmenter.

El modelo resuelve el problema de la segmentación de retratos en tiempo real con un coste computacional mínimo: el archivo pesa apenas 249,5 KB, lo que permite su despliegue en Android, iOS, web (JavaScript) y Flutter sin dependencia de servidores. La arquitectura es una red codificador-decodificador de tipo MobileNetV3 con conexiones de salto (*skip connections*), optimizada para inferencia en CPU con XNNPACK y en GPU móvil.

Su relevancia actual radica en que ofrece una solución lista para producción, con licencia Apache 2.0, formato TFLite y soporte nativo en el ecosistema MediaPipe/LiteRT, lo que facilita la integración en aplicaciones móviles y web con requisitos de privacidad estrictos (procesamiento local, sin envío de vídeo a la nube).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador-decodificador tipo MobileNetV3 con conexiones de salto |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | Pesos en FP16 (float16); entrada/salida en float32 |
| Idiomas soportados | no aplica (modelo de segmentación de imagen) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`selfie_segmenter.tflite`, 249,5 KB) |
| Entrada | `input_1` `[1, 256, 256, 3]` float32, normalización mean=[0.0], std=[255.0] |
| Salida | `activation_10` `[1, 256, 256, 1]` float32 (máscara de confianza de persona) |
| Metadatos embebidos | `TFLITE_METADATA`: name `ImageSegmenter`, version `1`, author `MediaPipe`, `labels.txt` |
| Tarea MediaPipe | Image Segmenter (`ImageSegmenter`) |
| Plataformas | Android, iOS, web, Python, Flutter |
| SHA-256 (modelo) | `191ac9529ae506ee0beefa6b2c945a172dab9d07d1e802a290a4e4038226658b` |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de codificador-decodificador inspirada en MobileNetV3, con conexiones de salto que permiten recuperar detalle espacial fino en la máscara de salida. La red procesa una imagen RGB de 256×256 píxeles y produce una máscara de confianza de un solo canal con la misma resolución espacial (`[1, 256, 256, 1]`), donde cada valor representa la probabilidad de que el píxel pertenezca a la persona (selfie) frente al fondo. Los pesos se almacenan en FP16 para reducir el tamaño del archivo a 249,5 KB, mientras que los tensores de entrada y salida se mantienen en float32.

No se dispone en la información proporcionada de detalles sobre el conjunto de datos de entrenamiento, el número de tokens o imágenes procesadas, ni sobre si se aplicaron técnicas de ajuste fino como RLHF o DPO (no aplicables en este dominio). La innovación técnica principal es la optimización para inferencia en dispositivo mediante XNNPACK en CPU y GPU móvil, junto con la integración nativa en el ecosistema MediaPipe Tasks, que gestiona el preprocesamiento (normalización con media 0.0 y desviación 255.0) y el postprocesamiento de las máscaras.

## Capacidades

- Segmentación de personas (selfie) frente a fondo en imágenes RGB de 256×256 píxeles.
- Generación de máscaras de confianza por píxel (`output_confidence_masks=True`).
- Generación de máscara de categorías (`output_category_mask=True`) con etiquetas embebidas (`labels.txt`).
- Ejecución en dispositivo (on-device) en Android, iOS, web, Python y Flutter.
- Optimización para CPU con XNNPACK y para GPU móvil.
- Integración con la tarea MediaPipe Image Segmenter en modo imagen (`VisionRunningMode.IMAGE`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades multilingües ni de generación de texto.

## Casos de uso

- Desenfoque de fondo en videollamadas: el modelo genera una máscara de persona por fotograma que permite aplicar un desenfoque selectivo al fondo en tiempo real, con un coste de 249,5 KB y ejecución local que evita enviar vídeo a servidores.
- Sustitución de fondo en aplicaciones de videoconferencia móvil: la máscara de confianza permite componer al usuario sobre una imagen o vídeo de fondo distinto, integrándose en Android o iOS mediante MediaPipe Tasks.
- Realidad aumentada en móvil: la segmentación de la silueta del usuario posibilita efectos de recorte y superposición de elementos virtuales en aplicaciones AR que requieren procesamiento de baja latencia en el dispositivo.
- Filtros y efectos en aplicaciones de cámara: el modelo puede alimentar pipelines de posprocesado que apliquen estilización, viñeteado o recorte automático del retrato en apps de fotografía.
- Privacidad en captura de vídeo: al ejecutarse localmente, permite difuminar el fondo de grabaciones o transmisiones sin que las imágenes salgan del dispositivo, útil en entornos sanitarios, educativos o corporativos con requisitos de confidencialidad.
- Integración en aplicaciones Flutter multiplataforma: mediante el paquete `flutter-mediapipe`, el modelo puede incorporarse a apps híbridas que necesiten segmentación de selfies en Android e iOS con una única base de código.
- Demos web interactivas: la versión JavaScript del Image Segmenter permite probar la segmentación en el navegador sin instalación, útil para prototipado rápido y validación de experiencias de usuario.

## Benchmarks y rendimiento

La model card incluye una sección de benchmarks de latencia, pero el contenido proporcionado está truncado y no permite extraer valores numéricos fiables. No se han publicado en la información disponible resultados de benchmarks de calidad de segmentación (mIoU, IoU, precisión) ni comparativas numéricas con otros modelos.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido tradicional; el modelo está diseñado para ejecutarse en CPU móvil o GPU integrada. El archivo ocupa 249,5 KB, por lo que la huella de memoria es mínima (del orden de unos pocos MB incluyendo tensores intermedios).
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU con XNNPACK y en GPU móvil (Adreno, Mali, Apple GPU) mediante delegados de TFLite.
- Cabe en cualquier GPU de consumo e incluso en dispositivos móviles de gama baja; no necesita A100, H100 ni RTX 4090.
- Opciones de despliegue: MediaPipe Tasks (Python, Android, iOS, web, Flutter), LiteRT/TFLite con delegados XNNPACK y GPU.
- Latencia y throughput: la model card referencia benchmarks de latencia de la documentación oficial de Image Segmenter, pero los valores concretos no están disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Tamano | Licencia | Plataformas |
|---|---|---|---|---|---|
| MediaPipe-ImageSegmenter-Selfie-Square (este modelo) | Segmentación selfie, MobileNetV3-like | 256×256 | 249,5 KB (FP16) | Apache 2.0 | Android, iOS, web, Python, Flutter |
| Otras variantes MediaPipe Selfie Segmenter (p. ej. landscape) | Segmentación selfie | no disponible en esta ficha | no disponible | Apache 2.0 | MediaPipe Tasks |
| Modelos de segmentación genérica (p. ej. DeepLab, SAM) | Segmentación semántica general | variable | mucho mayor (MB a GB) | variable | variable |

No se dispone en la información proporcionada de datos numéricos de rendimiento para establecer una comparativa cuantitativa con alternativas. La comparativa anterior es cualitativa y se basa en características generales conocidas de la categoría.

## Limitaciones y advertencias

- El modelo está especializado en segmentación de personas (selfies); no es un segmentador semántico general y no reconocerá otras clases de objetos.
- La resolución de entrada está fijada en 256×256 píxeles; detalles finos como cabello o bordes pueden perder precisión en imágenes de alta resolución sin un posprocesado adecuado.
- No se dispone de información sobre sesgos demográficos, de tono de piel o de iluminación en el conjunto de entrenamiento; es recomendable validar el rendimiento en la población objetivo antes de producción.
- Riesgo de máscaras imprecisas en escenas con múltiples personas, oclusiones o fondos con colores similares a la ropa del usuario.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento; su uso está limitado a visión por computador.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se recomienda conservar los avisos de licencia y atribución correspondientes.
- El contenido de la model card original está parcialmente truncado en la información disponible; conviene consultar la documentación oficial de MediaPipe para detalles de latencia y opciones avanzadas.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/MediaPipe-ImageSegmenter-Selfie-Square
- Archivo del modelo: https://huggingface.co/litert-community/MediaPipe-ImageSegmenter-Selfie-Square/blob/main/selfie_segmenter.tflite
- Documentación MediaPipe Image Segmenter: https://developers.google.com/edge/mediapipe/solutions/vision/image_segmenter
- Benchmarks de Image Segmenter: https://developers.google.com/edge/mediapipe/solutions/vision/image_segmenter#benchmarks
- Guía de configuración Python: https://developers.google.com/edge/mediapipe/solutions/setup_python
- Guía de configuración Web/JavaScript: https://developers.google.com/edge/mediapipe/solutions/setup_web
- Guía de configuración Android: https://developers.google.com/edge/mediapipe/solutions/setup_android
- Guía de configuración iOS: https://developers.google.com/edge/mediapipe/solutions/setup_ios
- Guía de configuración Flutter: https://developers.google.com/edge/mediapipe/solutions/setup_flutter
- Demo web: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/image_segmenter
- Código fuente demo web: https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/image-segmenter.ts
- Ejemplo Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_segmentation/android
- Ejemplo iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_segmentation/ios
- Notebook Python (Colab): https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/image_segmentation/python/image_segmentation.ipynb
- Ejemplo Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/vision/image_segmenter
