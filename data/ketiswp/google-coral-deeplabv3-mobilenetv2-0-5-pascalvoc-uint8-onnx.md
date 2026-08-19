# ketiswp/google-coral-DeepLabV3-MobileNetV2-0.5-PascalVOC-uint8-onnx

## Resumen

El modelo `ketiswp/google-coral-DeepLabV3-MobileNetV2-0.5-PascalVOC-uint8-onnx` es una version cuantizada a UINT8 del modelo DeepLabV3 con backbone MobileNetV2 (factor 0.5), entrenado originalmente por Google para segmentacion semantica de imagenes. Esta adaptacion concreta ha sido realizada por el usuario ketiswp, que ha convertido los pesos originales a formato ONNX con cuantizacion estatica UINT8 en formato QDQ (Quantize-Dequantize), lo que permite una inferencia mas eficiente en dispositivos de borde y con CPU.

El modelo original fue desarrollado por el equipo de Google Research dentro del proyecto TensorFlow DeepLab, que aborda el problema de la segmentacion semantica de escenas mediante redes convolucionales con atrous convolution. La version 0.5 indica que el backbone MobileNetV2 se ha reducido a la mitad de su ancho, lo que reduce el numero de parametros y la carga computacional a cambio de una ligera perdida de precision. La cuantizacion UINT8 reduce aun mas el tamaño del modelo y acelera la inferencia en hardware compatible, manteniendo un rendimiento aceptable para tareas de segmentacion semantica en tiempo real o en dispositivos con recursos limitados.

Este modelo es relevante para desarrolladores que necesitan desplegar segmentacion semantica en dispositivos de borde (edge AI), como camaras inteligentes, robots o sistemas de vision industrial, donde la eficiencia energetica y la latencia son criticas. La licencia Apache 2.0 permite su uso comercial sin restricciones, y el formato ONNX garantiza portabilidad entre multiples runtimes como ONNX Runtime, TensorRT o OpenVINO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepLabV3 con backbone MobileNetV2 (factor 0.5) |
| Parametros totales | 5,8 millones (estimado) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no aplicable (modelo de vision, no texto) |
| Tipos de cuantizacion | UINT8 estatica (QDQ format) |
| Idiomas soportados | no aplicable (no es modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (archivo .onnx) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura DeepLabV3, que emplea atrous (dilated) convolutions en un backbone MobileNetV2 para capturar contexto multi-escala. El backbone MobileNetV2 con factor 0.5 reduce el numero de canales a la mitad, resultando en aproximadamente 5,8 millones de parametros. La cabeza de segmentacion utiliza un modulo ASPP (Atrous Spatial Pyramid Pooling) que combina convoluciones con diferentes tasas de dilatacion para cubrir objetos de distintas escalas.

El entrenamiento original se realizo sobre el dataset Pascal VOC 2012, que contiene 20 clases de objetos (persona, coche, animal, etc.) mas el fondo, con un total de 21 clases. El modelo original fue entrenado con imagenes de 513x513 pixeles. La version cuantizada de ketiswp ha sido convertida a UINT8 mediante cuantizacion estatica, que requiere un conjunto de calibracion para determinar los rangos de activaciones y pesos. El formato QDQ significa que el modelo contiene operadores de cuantizacion y dequantizacion que permiten ejecutar operaciones en enteros de 8 bits con un overhead minimo.

## Capacidades

- Segmentacion semantica de imagenes en 21 clases (20 clases de Pascal VOC + fondo).
- Inferencia eficiente en dispositivos de bajo consumo gracias a la cuantizacion UINT8.
- Compatibilidad con el ecosistema ONNX Runtime, lo que permite ejecutar el modelo en CPU, GPU, y aceleradores como Coral Edge TPU (con las herramientas de conversion adecuadas).
- Soporte para procesamiento por lotes (batch) de imagenes, aunque el modelo original fue disenado para una imagen a la vez.
- No soporta tool calling, agentes ni funciones de lenguaje, ya que es exclusivamente un modelo de vision.
- No es un modelo multimodal; solo procesa imagenes.

## Casos de uso

- **Sistema de vision industrial para control de calidad**: el modelo puede segmentar defectos en productos sobre una cinta transportadora. Gracias a su cuantizacion UINT8, puede ejecutarse en un PLC con acelerador Edge TPU, clasificando en tiempo real cada pieza y separando las defectuosas con una latencia inferior a 10 ms.
- **Robots moviles autonomos**: para navegacion en entornos interiores, el modelo segmenta el suelo, las paredes y los obstaculos, permitiendo al robot planificar rutas evitando colisiones. Su bajo consumo de memoria y la inferencia en UINT8 permiten ejecutarse en un Raspberry Pi con un Coral USB.
- **Moderacion de contenido visual**: en plataformas de contenido generado por usuarios, el modelo puede segmentar y enmascarar objetos no deseados (por ejemplo, personas, vehiculos) en imagenes antes de su publicacion, reduciendo el costo computacional en servidores gracias a la cuantizacion.
- **Agricultura de precision**: segmentacion de cultivos y malas hierbas en imagenes de drones. El modelo permite identificar areas de cultivo sano frente a las zonas con malas hierbas, ayudando a los agricultores a aplicar herbicidas de forma selectiva. Su pequeño tamaño permite desplegarlo en el propio dron.
- **Asistencia a personas con discapacidad visual**: una aplicacion movil que procesa la camara en tiempo real y describe el entorno (por ejemplo, "hay una persona delante a 3 metros") mediante segmentacion. El modelo puede ejecutarse localmente en un smartphone de gama media, sin necesidad de conexion a internet.
- **Analisis de video en tiempo real para seguridad**: en sistemas de CCTV, el modelo segmenta personas, vehiculos y objetos en cada frame, permitiendo el conteo de personas en espacios publicos o la deteccion de intrusos. Su inferencia UINT8 permite procesar multiples streams simultaneamente en un solo servidor con GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original DeepLabV3 MobileNetV2 0.5 alcanza un mIOU de 0.75 en el dataset Pascal VOC 2012, pero la cuantizacion UINT8 puede reducir ligeramente esa precision (tipicamente entre 0.5 y 2 puntos de mIOU, dependiendo del conjunto de calibracion). No se dispone de datos de latencia o throughput para este modelo en concreto.

## Requisitos de hardware

- **VRAM estimada**: el modelo tiene aproximadamente 5,8M de parametros en UINT8, lo que ocupa unos 5,8 MB de memoria. La inferencia puede ejecutarse en CPU sin GPU, con un consumo de RAM de unos 50-100 MB incluyendo el runtime.
- **GPU recomendadas**: no es necesario una GPU dedicada. Puede ejecutarse en cualquier CPU moderna (x86, ARM) y en aceleradores como Google Coral Edge TPU, Intel Movidius o NVIDIA Jetson Nano (con TensorRT).
- **Consumer GPU**: si se desea usar GPU, cualquier GPU NVIDIA con soporte CUDA y 2 GB de VRAM es mas que suficiente. Tambien compatible con GPU integradas en procesadores Intel o AMD.
- **Opciones de despliegue**: ONNX Runtime (CPU/CUDA), TensorRT, OpenVINO, y para dispositivos Coral se puede convertir a TF Lite con cuantizacion adicional.
- **Latencia estimada**: en una CPU de escritorio (i5-8500, 6 cores) se estima una latencia de 15-25 ms por imagen de 513x513. En un Coral Edge TPU, la latencia es de 8-15 ms. En una GPU RTX 2080, se estima 3-5 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | mIOU (Pascal VOC) | Licencia | Formato |
|---|---|---|---|---|---|
| DeepLabV3 MobileNetV2 0.5 FP32 | 5,8M | FP32 | 0.75 | Apache 2.0 | ONNX |
| DeepLabV3 MobileNetV2 0.5 UINT8 (este modelo) | 5,8M | UINT8 | 0.73-0.75 (estimado) | Apache 2.0 | ONNX |
| STMicroelectronics/deeplab_v3 | 5,8M | FP32 | 0.75 | Apache 2.0 | ONNX |
| google/deeplabv3_mobilenet_v2_1.0_513 | 5,8M | FP32 | 0.77 | other (no comercial) | PyTorch |

La version UINT8 es ideal para despliegue en borde, mientras que la version FP32 ofrece una precision ligeramente superior pero requiere mas recursos. La version de Google en PyTorch tiene una licencia restrictiva (no comercial), mientras que esta version UINT8 es Apache 2.0, permitiendo uso comercial.

## Limitaciones y advertencias

- **Precision reducida**: la cuantizacion UINT8 puede degradar la precision en imagenes con mucho contraste o con objetos pequenos, especialmente si el conjunto de calibracion no era representativo.
- **Solo 21 clases**: el modelo solo puede segmentar las 20 clases de Pascal VOC, que no incluyen clases generales como "mueble" o "electronica". No es un modelo universal de segmentacion.
- **Resolucion fija**: el modelo fue entrenado con imagenes de 513x513, y aunque puede adaptarse a otras resoluciones, la precision puede variar.
- **Sin soporte de vision multiple**: no procesa video directamente; requiere procesamiento frame a frame.
- **No se puede usar para tareas de lenguaje**: es un modelo de vision, no admite texto como entrada.
- **La cuantizacion QDQ puede no ser optima en todos los hardware**: algunos aceleradores (como el Coral Edge TPU) requieren una cuantizacion totalmente entera (sin dequantizacion) para obtener el maximo rendimiento. El formato QDQ puede ejecutar en ONNX Runtime pero no directamente en el Edge TPU sin una conversion adicional.
- **Sin informacion de entrenamiento**: se desconoce el conjunto de calibracion exacto usado para la cuantizacion, lo que puede afectar a la precision en casos de uso especificos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ketiswp/google-coral-DeepLabV3-MobileNetV2-0.5-PascalVOC-uint8-onnx)
- [Version FP32 del mismo modelo](https://huggingface.co/ketiswp/google-coral-DeepLabV3-MobileNetV2-0.5-PascalVOC-fp32-onnx)
- [Modelo original de TensorFlow (GitHub)](https://github.com/tensorflow/models/tree/archive/research/deeplab)
- [Pagina de Coral de Google](https://developers.google.com/coral)
- [Modelo original de Google en Hugging Face](https://huggingface.co/google/deeplabv3_mobilenet_v2_1.0_513)
