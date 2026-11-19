# litert-community/MediaPipe-ImageSegmenter-Selfie-Square

## Resumen

MediaPipe Selfie Segmenter es un modelo de segmentación de imagen ultraligero desarrollado originalmente por Google y redistribuido por la comunidad litert-community en formato TFLite optimizado para LiteRT. Su función es separar la persona (selfie) del fondo en imágenes de 256×256 píxeles, generando una máscara de confianza por píxel que permite aplicar desenfoque o sustitución de fondo en videollamadas y aplicaciones de realidad aumentada. Con apenas 250 KB de pesos en FP16, está diseñado para inferencia en dispositivo (on-device) en Android, iOS, web, Python y Flutter mediante la tarea ImageSegmenter de MediaPipe.

Arquitectónicamente es una red encoder-decoder de estilo MobileNetV3 con conexiones skip, que recibe un tensor `[1, 256, 256, 3]` en float32 y produce una máscara `[1, 256, 256, 1]` con valores entre 0 (fondo) y 1 (selfie). No es un modelo generativo ni un LLM: no procesa texto, no tiene contexto conversacional ni parámetros en el sentido habitual de los transformers. Su relevancia actual radica en que demuestra el despliegue de visión por computador en tiempo real en hardware móvil con latencias de decenas de milisegundos y un consumo de memoria mínimo.

La ficha que sigue documenta sus especificaciones técnicas reales, sus capacidades limitadas a segmentación binaria de personas, sus benchmarks de latencia publicados y las restricciones de uso que el propio model card upstream (Google, 2021) establece, incluyendo la prohibición explícita de uso para vigilancia o reconocimiento de identidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder tipo MobileNetV3 con conexiones skip (CNN convolucional) |
| Parametros totales | no disponible (pesos FP16 de 249.537 bytes; el número exacto de parámetros no se publica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no procesa texto) |
| Tipos de cuantizacion | Pesos en float16; entrada y salida en float32; el model card no documenta variantes int8 |
| Idiomas soportados | no aplica (no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`selfie_segmenter.tflite`) con metadatos TFLITE_METADATA embebidos |
| Tamano del archivo | 249,5 KB (249.537 B), SHA-256 `191ac9529ae506ee0beefa6b2c945a172dab9d07d1e802a290a4e4038226658b` |
| Entrada | `input_1`, shape `[1, 256, 256, 3]`, float32, normalización mean=[0.0] std=[255.0] |
| Salida | `activation_10`, shape `[1, 256, 256, 1]`, float32, máscara de confianza de persona |
| Etiquetas | `labels.txt` empaquetado como archivo asociado |
| Runtime | LiteRT / TensorFlow Lite con aceleración XNNPACK (CPU) y GPU móvil |
| Plataformas | Android, iOS, web, Python, Flutter |

## Arquitectura y entrenamiento

El modelo es una red neuronal convolucional de tipo encoder-decoder inspirada en MobileNetV3, con conexiones skip entre el encoder y el decoder. El encoder extrae características a múltiples escalas y el decoder las combina para producir una máscara de segmentación densa a resolución completa (256×256). La salida es una única canal de confianza por píxel, no una segmentación multiclase: el modelo distingue únicamente entre fondo y persona. La arquitectura está optimizada para inferencia en CPU mediante XNNPACK y en GPU móvil, lo que explica su reducido tamaño y su latencia.

El model card no proporciona detalles sobre el dataset de entrenamiento, el número de imágenes utilizadas, la composición demográfica del corpus ni si se aplicaron técnicas de aumento de datos o ajuste fino. La información disponible se limita a la tarjeta upstream de Google fechada en mayo de 2021, que documenta una evaluación de equidad sobre 1.594 imágenes comparando la IoU del modelo con la de anotadores humanos (98,74 % de IoU entre anotadores). No se documentan procesos de RLHF, DPO ni ajuste por preferencias, algo esperable en un modelo de segmentación y no de lenguaje.

## Capacidades

- Segmentación binaria de persona frente a fondo en imágenes de 256×256 píxeles, con salida de máscara de confianza por píxel.
- Generación de máscara de categoría (category mask) y máscaras de confianza (confidence masks) mediante la API ImageSegmenter de MediaPipe.
- Ejecución en tiempo real en dispositivo: latencia media de 33,46 ms en CPU y 35,15 ms en GPU sobre Pixel 6.
- Despliegue multiplataforma: Android (Kotlin/Java), iOS (Swift), web (JavaScript), Python y Flutter (Dart).
- Integración con el ecosistema LiteRT/TFLite y aceleración mediante XNNPACK y GPU móvil.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general (más allá de la segmentación de personas), audio ni modo thinking.
- No tiene capacidades multilingües porque no procesa lenguaje natural.

## Casos de uso

- Desenfoque de fondo en videollamadas: el modelo genera una máscara de persona por fotograma que permite aplicar blur selectivo al fondo en tiempo real, con latencias de ~33 ms en CPU de móvil que hacen viable el procesamiento a 30 fps.
- Sustitución de fondo en aplicaciones de videoconferencia y streaming: la máscara de confianza permite componer la persona sobre una imagen o vídeo de fondo alternativo sin necesidad de croma.
- Efectos de realidad aumentada en apps móviles: integrado en Flutter o Android, permite aplicar filtros, marcos o efectos que respetan el contorno de la persona en tiempo real.
- Procesamiento por lotes de retratos en Python: para pipelines de edición fotográfica que recortan automáticamente la figura humana de imágenes de 256×256, útil en generación de avatares o miniaturas.
- Aplicaciones web de edición de vídeo en el navegador: mediante la versión JavaScript de MediaPipe, se puede segmentar al usuario en una webcam sin enviar datos a un servidor, preservando la privacidad.
- Prototipado rápido de funciones de segmentación en iOS: con la API Swift de MediaPipe, se integra en apps de cámara o redes sociales para recortar personas en fotos y vídeos.
- Filtros de privacidad en herramientas de captura: el modelo permite difuminar el fondo de capturas de pantalla o grabaciones para ocultar información sensible manteniendo enfocada a la persona.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible son las latencias de la pipeline MediaPipe Image Segmenter sobre Pixel 6:

| Variante | Dispositivo | Latencia CPU | Latencia GPU |
|---|---|---:|---:|
| SelfieSegmenter (square) | Pixel 6 | 33,46 ms | 35,15 ms |

En cuanto a calidad de segmentación, la tarjeta upstream reporta una evaluación de equidad sobre el modelo General 256×256 con 1.594 imágenes, comparando contra una IoU entre anotadores humanos del 98,74 %:

| Criterio | IoU medio | Rango |
|---|---:|---|
| 17 subregiones geográficas de la ONU | 96,48 ± 0,84 % | 95,71 %–97,59 % |
| Tonos de piel Fitzpatrick 1–6 | 96,57 % | 95,64 %–(dato truncado en la información disponible) |

No se han publicado resultados de benchmarks estándar de segmentación (mIoU sobre COCO, Pascal VOC u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB; el archivo de pesos ocupa 249,5 KB y las activaciones intermedias de una entrada 256×256×3 son mínimas.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU móvil (Pixel 6: 33,46 ms) y en GPU integrada de móvil (35,15 ms). En escritorio puede ejecutarse en cualquier CPU moderna.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU Intel, y en dispositivos móviles de gama baja; no es necesario hardware de datacenter (A100, H100) en absoluto.
- Opciones de despliegue: MediaPipe Tasks (Python, Android, iOS, web, Flutter), LiteRT/TFLite runtime, y el intérprete TFLite estándar. No aplica vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: ~33 ms por fotograma en CPU de Pixel 6, lo que permite ~30 fps en un solo hilo de inferencia; en hardware de escritorio la latencia será inferior, aunque no se publican cifras específicas.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Tamano | Licencia | Plataformas |
|---|---|---|---:|---|---|
| MediaPipe Selfie Segmenter (square) | CNN encoder-decoder MobileNetV3-like | 256×256 | 249,5 KB (FP16) | Apache 2.0 | Android, iOS, web, Python, Flutter |
| MediaPipe Selfie Segmenter (landscape) | CNN encoder-decoder | 144×256 | no disponible en esta información | Apache 2.0 | Android, iOS, web, Python, Flutter |
| Segment Anything (SAM) | Transformer ViT | 1024×1024 | cientos de MB a GB | Apache 2.0 (variantes) | Python, servidor |
| U^2-Net / BackgroundMatting | CNN | variable | decenas de MB | variable | Python, servidor |

La comparativa con SAM o U^2-Net es cualitativa: este modelo está optimizado para latencia y tamaño extremadamente reducidos en dispositivo, no para segmentación genérica de alta calidad en servidor. No se dispone de datos de benchmarks comparativos directos en la información proporcionada.

## Limitaciones y advertencias

- Solo segmenta personas; no distingue clases, objetos ni partes del cuerpo, y no realiza reconocimiento de identidad.
- El uso para vigilancia o reconocimiento de identidad está explícitamente fuera del alcance según la tarjeta upstream de Google.
- No debe usarse para decisiones críticas para la vida humana, ni con múltiples personas a escalas muy diferentes, ni con personas a más de 4 metros (14 pies) de la cámara.
- La resolución de entrada está fijada a 256×256; imágenes de mayor resolución deben redimensionarse, lo que puede degradar la precisión en contornos finos.
- El model card no documenta el dataset de entrenamiento ni posibles sesgos demográficos más allá de la evaluación de equidad por regiones y tonos de piel.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí puede producir máscaras incorrectas en escenas con poca luz, fondos similares a la persona u oclusiones.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la tarjeta upstream de Google por si impone restricciones adicionales de uso aceptable.
- No hay información sobre cuantización int8 ni sobre rendimiento en hardware sin XNNPACK; el despliegue fuera de MediaPipe/LiteRT no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/MediaPipe-ImageSegmenter-Selfie-Square
- Archivo de pesos: https://huggingface.co/litert-community/MediaPipe-ImageSegmenter-Selfie-Square/blob/main/selfie_segmenter.tflite
- Tarjeta upstream (PDF): https://huggingface.co/litert-community/MediaPipe-ImageSegmenter-Selfie-Square/blob/main/Model%20Card%20MediaPipe%20Selfie%20Segmentation.pdf
- Documentación de Image Segmenter: https://developers.google.com/edge/mediapipe/solutions/vision/image_segmenter
- Demo web: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/image_segmenter
- Guía de configuración Python: https://developers.google.com/edge/mediapipe/solutions/setup_python
- Guía de configuración Web/JavaScript: https://developers.google.com/edge/mediapipe/solutions/setup_web
- Guía de configuración Android: https://developers.google.com/edge/mediapipe/solutions/setup_android
- Guía de configuración iOS: https://developers.google.com/edge/mediapipe/solutions/setup_ios
- Guía de configuración Flutter: https://developers.google.com/edge/mediapipe/solutions/setup_flutter
- Ejemplo Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_segmentation/android
- Ejemplo iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_segmentation/ios
- Notebook Python: https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/image_segmentation/python/image_segmentation.ipynb
- Ejemplo Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/vision/image_segmenter
