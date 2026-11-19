# litert-community/MediaPipe-ImageSegmenter-Hair

## Resumen

MediaPipe ImageSegmenter Hair es un modelo de segmentacion de imagen especializado en cabello, distribuido por la comunidad litert-community a partir del modelo original de Google MediaPipe. Se trata de un modelo TFLite de apenas 782 KB en precision FP32 que devuelve, para cada pixel de una imagen de entrada, una probabilidad de pertenencia a dos clases: fondo (0) y cabello (1). Su proposito es alimentar efectos de recoloreado virtual de pelo y filtros de realidad aumentada en aplicaciones moviles y web.

El modelo sigue una arquitectura encoder-decoder con conexiones skip, recibe un tensor de entrada de forma `[1, 512, 512, 4]` (RGB mas un canal temporal o de prior que rellena automaticamente la tarea MediaPipe `ImageSegmenter`) y produce una mascara de segmentacion de forma `[1, 512, 512, 2]`. Esta pensado para ejecucion on-device en Android, iOS, web, Python y Flutter mediante la libreria MediaPipe Tasks, y su reducido tamano lo hace adecuado para inferencia en tiempo real incluso en dispositivos de gama media.

Su relevancia actual radica en que ejemplifica el paradigma de modelos de vision ultraligeros para inferencia local: sin dependencia de servidores, con licencia Apache 2.0 y con latencias del orden de 50-60 ms en un Pixel 6. Es una pieza de infraestructura para desarrolladores que construyen experiencias de camara en tiempo real, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder con conexiones skip (CNN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija 512x512) |
| Tipos de cuantizacion | FP32 (unica variante publicada) |
| Idiomas soportados | no aplica (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`hair_segmenter.tflite`, 781.618 bytes) |

## Arquitectura y entrenamiento

El modelo es una red convolucional encoder-decoder con conexiones skip, disenada para segmentacion semantica densa a resolucion 512x512. La entrada tiene cuatro canales: los tres canales RGB mas un cuarto canal temporal o de prior que la tarea MediaPipe `ImageSegmenter` rellena automaticamente, lo que permite aprovechar informacion entre fotogramas en modo video. La salida es un tensor de dos canales con probabilidades por pixel para las clases `background` y `hair`, y el modelo incluye metadatos TFLITE embebidos (nombre `ImageSegmenter`, version 1, autor `MediaPipe`) con el fichero `labels.txt` empaquetado.

No se dispone de informacion detallada sobre el numero de parametros, el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de ajuste fino como RLHF o DPO (no aplicables en un modelo de segmentacion). La model card original de Google esta fechada el 14 de enero de 2019, lo que situa el desarrollo del modelo en una generacion anterior de arquitecturas de vision. La evaluacion de equidad reportada se realizo sobre 1.445 selfies reales, 85 por cada una de las 17 subregiones geograficas de la ONU.

## Capacidades

- Segmentacion binaria de cabello por pixel en imagenes y video de selfie frontal.
- Salida de mascaras de probabilidad (`output_confidence_masks`) y mascara de categoria (`output_category_mask`) configurables en la API de MediaPipe.
- Procesamiento on-device en Android (Kotlin/Java), iOS (Swift), web (JavaScript), Python y Flutter (Dart).
- Modos de ejecucion IMAGE, VIDEO y LIVE_STREAM a traves de `VisionRunningMode`.
- Entrada RGB mas canal temporal/prior de 4 canales, con normalizacion `mean=[0.0]`, `std=[255.0]`.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingues: es exclusivamente un modelo de vision.
- No dispone de modo thinking, vision general, audio ni generacion de texto.

## Casos de uso

- Recoloreado virtual de pelo en apps de belleza: el modelo genera la mascara de cabello por pixel que permite aplicar un cambio de color solo a la region capilar, manteniendo el fondo intacto. Su tamano de 782 KB y latencia de ~52-58 ms en Pixel 6 lo hacen viable en tiempo real.
- Filtros AR en redes sociales: integrado en el pipeline de camara del dispositivo mediante MediaPipe Tasks, permite superponer efectos capilares (purpurina, degradados, cambios de tono) en directo sobre el flujo de video de la camara frontal.
- Prueba virtual de tintes en e-commerce: una tienda de productos capilares puede ofrecer una previsualizacion del color sobre la foto del usuario, ejecutando el modelo localmente en el navegador o en la app sin enviar imagenes a un servidor.
- Edicion fotografica por capas: la mascara de cabello permite aislar el cabello para aplicar ajustes de color, luminosidad o desenfoque selectivo en herramientas de retoque.
- Segmentacion previa en pipelines de avatares: como paso de preprocesado para generar avatares o modelos 3D capilares a partir de selfies, separando el cabello del resto de la imagen.
- Aplicaciones de entretenimiento y demos educativas: por su licencia Apache 2.0 y su reducido tamano, es adecuado para prototipos, tutoriales de vision por computador y proyectos academicos que necesiten segmentacion capilar sin infraestructura de servidor.

## Benchmarks y rendimiento

Latencia media del pipeline completo de la tarea MediaPipe `ImageSegmenter` reportada en la documentacion oficial:

| Variante | Dispositivo | Latencia CPU | Latencia GPU |
|---|---|---:|---:|
| HairSegmenter | Pixel 6 | 57,90 ms | 52,14 ms |

Evaluacion de equidad sobre 1.445 selfies reales (85 por cada una de 17 subregiones geograficas de la ONU):

| Metrica | Valor |
|---|---|
| IoU medio global | 81,5% ± 0,8% |
| Desviacion estandar | 16,3% |
| Rango regional | 75,2% (Africa Occidental) a 86,9% (Asia Meridional) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que no son aplicables a un modelo de segmentacion de imagen.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en FP32, dado el tamano del binario (782 KB) y la resolucion de entrada fija de 512x512; no se dispone de medicion oficial de memoria pico.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU de movil (Pixel 6 reportado) y en GPUs integradas de portatiles.
- Cabe en cualquier GPU consumer, incluida la gama baja, y en dispositivos moviles de gama media; no se dispone de listado oficial de GPUs validadas.
- Opciones de despliegue: MediaPipe Tasks (Python, Android, iOS, web, Flutter) y runtime TFLite/LiteRT; no se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: ~57,90 ms en CPU y ~52,14 ms en GPU sobre Pixel 6 (pipeline completo); no se han publicado cifras de throughput (FPS) en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MediaPipe ImageSegmenter Hair | Segmentacion capilar binaria | 782 KB (FP32) | 512x512x4 | Apache 2.0 | TFLite via MediaPipe Tasks |
| MediaPipe ImageSegmenter (variantes generales) | Segmentacion semantica multi-clase | no disponible | no disponible | Apache 2.0 | TFLite via MediaPipe Tasks |
| Modelos de segmentacion capilar de terceros | Segmentacion capilar | no disponible | no disponible | variable | no disponible |

No se dispone de datos de benchmarks comparativos con modelos alternativos de segmentacion capilar en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- No apto para decisiones criticas para la vida humana: la aplicacion prevista es el entretenimiento y los efectos AR.
- Optimizado para selfies frontales cercanos; no es adecuado para sujetos a mas de 1,5 m de distancia ni para escenas con varias personas en el encuadre.
- Puede fallar en cabellos finos, trenzas largas, crestas (mohawks) o cabello ocluido por sombreros o accesorios.
- Sesgos geograficos documentados: el IoU varia de 75,2% en Africa Occidental a 86,9% en Asia Meridional, con una desviacion estandar de 16,3%, lo que indica un rendimiento desigual segun el tipo de cabello y la region.
- Riesgo de artefactos en los bordes de la mascara y de perdida de mechones finos, lo que puede producir resultados imperfectos en recoloreado.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero se recomienda conservar los avisos de licencia y atribucion; no se documentan restricciones adicionales de uso comercial.
- Modelo fechado en 2019: puede estar desactualizado frente a arquitecturas de segmentacion mas recientes; no se han publicado actualizaciones en la informacion disponible.
- Sin soporte de lenguaje, audio ni razonamiento: cualquier caso de uso fuera de la segmentacion capilar queda fuera de su alcance.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/MediaPipe-ImageSegmenter-Hair
- Fichero del modelo: https://huggingface.co/litert-community/MediaPipe-ImageSegmenter-Hair/blob/main/hair_segmenter.tflite
- Model card original (PDF): https://huggingface.co/litert-community/MediaPipe-ImageSegmenter-Hair/blob/main/Model%20Card%20-%20Hair%20Segmentation.pdf
- Documentacion de Image Segmenter: https://developers.google.com/edge/mediapipe/solutions/vision/image_segmenter
- Benchmarks de la tarea: https://developers.google.com/edge/mediapipe/solutions/vision/image_segmenter#task_benchmarks
- Demo web: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/image_segmenter
- Guia de instalacion Python: https://developers.google.com/edge/mediapipe/solutions/setup_python
- Guia de instalacion Web/JavaScript: https://developers.google.com/edge/mediapipe/solutions/setup_web
- Guia de instalacion Android: https://developers.google.com/edge/mediapipe/solutions/setup_android
- Guia de instalacion iOS: https://developers.google.com/edge/mediapipe/solutions/setup_ios
- Guia de instalacion Flutter: https://developers.google.com/edge/mediapipe/solutions/setup_flutter
- Ejemplo Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_segmentation/android
- Ejemplo iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/image_segmentation/ios
- Notebook Python: https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/image_segmentation/python/image_segmentation.ipynb
- Ejemplo Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/vision/image_segmenter
