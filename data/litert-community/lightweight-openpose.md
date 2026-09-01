# litert-community/lightweight-openpose

## Resumen

lightweight-OpenPose es un modelo de estimación de pose humana en 2D, originalmente desarrollado por Daniil Osokin, que ha sido convertido al formato LiteRT (sucesor de TensorFlow Lite) por la comunidad `litert-community` para su ejecución en dispositivos móviles y edge. El modelo se basa en una red de mapas de calor (heatmaps) con backbone MobileNet, diseñada para ser ligera y eficiente en hardware con recursos limitados. Esta conversión específica está optimizada para ejecutarse completamente en la GPU mediante el acelerador `CompiledModel` de LiteRT, sin caídas a CPU, lo que la hace especialmente adecuada para aplicaciones Android en tiempo real.

El modelo recibe una imagen RGB de 256x256 píxeles y produce 19 mapas de calor de 32x32 (18 keypoints del cuerpo humano más un canal de fondo). La decodificación de los keypoints (argmax) se realiza en el código de la aplicación, lo que permite mantener el grafo completamente convolucional y, por tanto, 100% ejecutable en GPU. Se distribuyen dos versiones: una con pesos en fp16 (~8,3 MB) y otra en fp32 (~16,4 MB), ambas bajo licencia Apache-2.0. Su relevancia actual radica en que ofrece una alternativa ligera y de código abierto a modelos como MoveNet, con la ventaja de no requerir operaciones no soportadas por el delegado GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de mapas de calor con backbone MobileNet (convolucional puro) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | fp16 (pesos) y fp32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | LiteRT / TFLite (`.tflite`) |

## Arquitectura y entrenamiento

El modelo es una red totalmente convolucional basada en MobileNet que genera mapas de calor de keypoints. La entrada es una imagen `[1, 256, 256, 3]` en formato NHWC, RGB, normalizada como `(px - 128) / 256`. La salida es `[1, 32, 32, 19]`, donde cada uno de los 18 canales corresponde a un keypoint del cuerpo (nariz, cuello, hombros, codos, muñecas, caderas, rodillas, tobillos, ojos y orejas) y el canal 19 es el fondo. La decodificación de posiciones se realiza mediante argmax sobre la cuadrícula de 32x32 en el código de la aplicación, no dentro del grafo.

El modelo original fue entrenado para estimación de pose 2D sobre el dataset COCO 2017 keypoints. Esta conversión a LiteRT es una transformación de formato exacta de los pesos, sin reentrenamiento ni modificación de la arquitectura. La conversión se realizó con `litert-torch` sin parches. El grafo contiene 41 capas `CONV_2D`, 14 `DEPTHWISE_CONV_2D`, y operaciones de activación ELU que se descomponen en `EXP`, `SUB`, `GREATER_EQUAL` y `SELECT`, todas soportadas por el delegado GPU. No incluye operaciones como `GATHER_ND` ni Flex/Custom, lo que garantiza la residencia completa en GPU.

## Capacidades

- Estimacion de pose humana en 2D: detecta 18 keypoints del cuerpo (cabeza, torso, brazos y piernas) a partir de una imagen RGB.
- Salida de mapas de calor: proporciona heatmaps de 32x32 por keypoint, lo que permite decodificacion flexible en la aplicacion (argmax, suavizado, etc.).
- Ejecucion 100% en GPU: todos los nodos del grafo son nativos de GPU, sin fallback a CPU, gracias al acelerador `CompiledModel` de LiteRT.
- Compatibilidad con Android: incluye un ejemplo completo de camara y galeria con superposicion de esqueleto en el repositorio `litert-samples`.
- Ligereza: el modelo fp16 ocupa aproximadamente 8,3 MB, adecuado para descarga y ejecucion en dispositivos moviles.
- Sin dependencias de operaciones exoticas: no requiere `GATHER_ND` ni Flex, lo que facilita la portabilidad a distintos backends.

## Casos de uso

- Aplicaciones de fitness y entrenamiento personal: el modelo puede analizar la postura del usuario en tiempo real desde la camara del movil, contando repeticiones o corrigiendo la forma de ejercicios como sentadillas o flexiones. Su baja latencia (15-21 ms en Pixel 8a) permite feedback inmediato.
- Analisis de movimiento en fisioterapia: los heatmaps de 18 keypoints permiten medir angulos articulares y rangos de movimiento, util para aplicaciones de rehabilitacion que guian al paciente con ejercicios.
- Realidad aumentada y filtros interactivos: la deteccion de pose puede usarse para superponer objetos virtuales sobre el cuerpo del usuario, como ropa, accesorios o efectos animados, con seguimiento fluido en dispositivos moviles.
- Control por gestos en interfaces: los keypoints de manos y brazos pueden traducirse en comandos para navegar menus o controlar aplicaciones sin contacto fisico, aprovechando la ejecucion en GPU para baja latencia.
- Deportes y analisis de tecnica: en aplicaciones de entrenamiento deportivo, el modelo puede evaluar la posicion de brazos y piernas en movimientos como lanzamientos o golpeos, proporcionando metricas objetivas al entrenador.
- Vigilancia y seguridad en entornos controlados: la deteccion de pose puede usarse para identificar caidas o posturas anormales en personas mayores o en entornos industriales, con la ventaja de ejecutarse localmente en el dispositivo sin enviar video a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precision (mAP, PCK, etc.) en la informacion disponible. La model card solo incluye mediciones de latencia en un Pixel 8a (Tensor G3, Android 16) con la herramienta `benchmark_model` de TFLite, que se reproducen a continuacion:

| Runtime | Backend | Grafo en GPU | Latencia media |
|---|---|---|---|
| TFLite `benchmark_model` (delegado GPU OpenCL) — `pose_256.tflite` (fp32) | GPU (OpenCL) | 103 / 103 | 15,0 ms |
| TFLite `benchmark_model` (delegado GPU OpenCL) — `pose_256_fp16.tflite` | GPU (OpenCL) | 158 / 158 | 21,1 ms |
| TFLite `benchmark_model` — `pose_256.tflite` | CPU (XNNPACK, 4 hilos) | — | 157,3 ms |
| TFLite `benchmark_model` — `pose_256_fp16.tflite` | CPU (XNNPACK, 4 hilos) | — | XNNPACK rechazo el grafo |

Nota: la model card advierte que las cifras obtenidas con el acelerador `CompiledModel` de LiteRT (reportado como `LITERT_CL`) no son comparables con las de `benchmark_model` clasico, por lo que las filas anteriores deben leerse como un piso reproducible, no como la velocidad maxima del modelo en LiteRT. XNNPACK no puede ejecutar el grafo fp16 (falla en `DEPTHWISE_CONV_2D`), por lo que no hay cifra CPU util para esa variante.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica directamente, ya que el modelo esta disenado para GPU integrada en dispositivos moviles; el tamaño del grafo es de ~8-16 MB, por lo que cabe en cualquier GPU movil moderna.
- GPU recomendadas: cualquier GPU compatible con OpenCL o Vulkan en Android (por ejemplo, Adreno en Snapdragon, Mali en Exynos, Tensor G3 en Pixel). Verificado en Pixel 8a.
- Compatibilidad con GPU de consumo: no aplica para desktop; el modelo esta pensado para edge. En desktop podria ejecutarse con el interprete de LiteRT en CPU o GPU, pero no es el caso de uso principal.
- Opciones de despliegue: LiteRT `CompiledModel` con acelerador GPU (recomendado), interprete TFLite clasico con delegado GPU OpenCL, o CPU con XNNPACK (solo fp32; fp16 no soportado).
- Latencia y throughput: 15,0 ms (fp32) y 21,1 ms (fp16) en Pixel 8a con delegado GPU OpenCL, lo que permite procesamiento en tiempo real a ~47-66 FPS.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos de estimacion de pose en la informacion proporcionada. La model card menciona que MoveNet (el modelo oficial de Google) incluye la decodificacion de keypoints dentro del grafo mediante `GATHER_ND`, lo que impide que el delegado GPU lo ejecute completamente, mientras que lightweight-OpenPose mantiene el grafo puramente convolucional. Sin embargo, no se proporcionan metricas de precision ni latencia de MoveNet para una comparacion cuantitativa. Por tanto, la comparativa queda limitada a esta observacion cualitativa.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo fue entrenado en COCO 2017, que contiene principalmente fotos de personas en contextos occidentales; puede tener menor precision con otros tipos de cuerpo, edades o vestimenta.
- Riesgo de alucinacion: al ser un modelo discriminativo de vision, no genera texto, pero puede producir keypoints incorrectos en imagenes con oclusiones, posturas extremas o multiples personas solapadas.
- Limitaciones de contexto: solo procesa imagenes de 256x256; no maneja video directamente, aunque puede aplicarse fotograma a fotograma.
- Limitaciones de idioma: no aplica, es un modelo de vision.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe mantener el aviso de copyright y las condiciones de la licencia. La conversion no anade PII, pero el usuario es responsable del tratamiento de datos de las imagenes procesadas.
- Caveat de produccion: la variante fp16 no es ejecutable con XNNPACK en CPU; si se necesita fallback a CPU, debe usarse la version fp32. Ademas, las latencias reportadas dependen del hardware y del runtime; se recomienda medir en el dispositivo objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/lightweight-openpose
- Repositorio original del modelo: https://github.com/Daniil-Osokin/lightweight-human-pose-estimation.pytorch
- Repositorio de LiteRT: https://github.com/google-ai-edge/litert
- Issue de solicitud del modelo en LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM/issues/2634
- Documentacion de despliegue de GenAI con LiteRT: https://developers.google.com/edge/litert/genai/overview
