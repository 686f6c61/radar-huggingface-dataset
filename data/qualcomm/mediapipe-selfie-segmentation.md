# qualcomm/MediaPipe-Selfie-Segmentation

## Resumen

MediaPipe-Selfie-Segmentation es un modelo ligero de segmentación semántica de imágenes desarrollado originalmente por Google como parte del framework MediaPipe, y posteriormente optimizado por Qualcomm para su ejecución eficiente en dispositivos con chipsets Snapdragon y otras plataformas de Qualcomm. El modelo resuelve el problema de separar a una persona del fondo en imágenes de tipo selfie o en capturas de videoconferencia, tanto en formato cuadrado como apaisado.

La versión publicada por Qualcomm en Hugging Face incluye pesos preexportados en múltiples formatos (ONNX, QNN_DLC, TFLITE) y está pensada para despliegue en dispositivos móviles y edge. Con solo 106.000 parámetros y un tamaño de 447 KB en precisión float, el modelo es extremadamente ligero y alcanza latencias de inferencia inferiores a 1 milisegundo en hardware NPU de Qualcomm, lo que lo hace adecuado para aplicaciones de tiempo real como fondos virtuales en videollamadas o edición de selfies.

La relevancia actual de este modelo radica en su combinación de bajo coste computacional, precisión suficiente para segmentación de personas y soporte nativo para aceleración por hardware en dispositivos Qualcomm, lo que lo convierte en una opción práctica para desarrolladores de aplicaciones Android y de visión por computador en el edge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional ligera (basada en MediaPipe Selfie Segmentation) |
| Parametros totales | 106.000 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de vision) |
| Tipos de cuantizacion | float, w8a16, w8a8 |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX, QNN_DLC, TFLITE, PyTorch (safetensors) |

## Arquitectura y entrenamiento

El modelo se basa en la implementacion original de MediaPipe Selfie Segmentation de Google, que utiliza una arquitectura de red neuronal convolucional diseñada para ser ejecutada en tiempo real en dispositivos moviles. La entrada acepta imagenes de resolucion 144x256 (apaisado) o 256x256 (cuadrado), y produce una salida de segmentacion con 6 clases de salida. El checkpoint incluido en el repositorio de Qualcomm corresponde a la variante cuadrada.

No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens (no aplicable) ni el proceso de optimizacion (RLHF/DPO) en la informacion proporcionada. Qualcomm ha realizado un trabajo de optimizacion y compilacion del modelo para su ejecucion en NPU de sus chipsets, ofreciendo pesos preexportados en diferentes precisiones (float, w8a16, w8a8) y formatos de runtime (ONNX, QNN_DLC, TFLITE). La innovacion principal de esta version es la integracion con Qualcomm AI Hub, que permite compilar, perfilar y evaluar el modelo en dispositivos reales de Qualcomm.

## Capacidades

- Segmentacion de personas en imagenes de tipo selfie, separando el sujeto del fondo.
- Segmentacion en tiempo real para videoconferencia, permitiendo reemplazo o difuminado de fondo.
- Soporte de dos orientaciones de entrada: cuadrado (256x256) y apaisado (144x256).
- Salida con 6 clases de segmentacion, lo que permite distinguir entre diferentes regiones de la persona (p. ej., cabello, piel, ropa) ademas del fondo.
- Ejecucion optimizada en NPU de chipsets Qualcomm (Snapdragon, Dragonwing) con latencias inferiores a 1 ms en la mayoria de los dispositivos probados.
- Multiples formatos de exportacion (ONNX, TFLITE, QNN_DLC) para facilitar la integracion en diferentes stacks de desarrollo.
- No soporta generacion de texto, tool calling, agentes ni capacidades multimodales mas alla de la segmentacion de imagenes.

## Casos de uso

- Fondos virtuales en videollamadas: el modelo puede integrarse en aplicaciones de videoconferencia para segmentar a la persona en tiempo real y sustituir el fondo por una imagen o un difuminado, gracias a su latencia inferior a 1 ms en NPU de Qualcomm.
- Edicion de selfies en aplicaciones moviles: permite recortar automaticamente a la persona de una foto para cambiar el fondo, aplicar efectos artisticos o crear composiciones, con un coste computacional minimo que no agota la bateria.
- Filtros de realidad aumentada: combinado con un motor de renderizado, el modelo puede alimentar filtros que interactuan con la silueta de la persona (p. ej., coronas, mascaras, efectos de luz) en tiempo real.
- Moderacion de contenido en streaming: segmentar a la persona del fondo permite aplicar desenfoque o pixelado al fondo en transmisiones en vivo, protegiendo la privacidad del entorno del usuario.
- Asistentes de maquillaje virtual: la segmentacion por clases (piel, cabello, etc.) permite aplicar pruebas de maquillaje o cambios de color de cabello de forma realista sobre la region correcta de la imagen.
- Analisis de presencia en fotografia: en aplicaciones de gestion de fotos, el modelo puede identificar y extraer automaticamente a las personas de las imagenes para organizar albumes por sujetos o generar miniaturas recortadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que se trata de un modelo de segmentacion de imagenes y no de un modelo de lenguaje. Sin embargo, la tabla de rendimiento proporcionada por Qualcomm para inferencia en diferentes chipsets es la siguiente:

| Runtime | Precision | Chipset | Inferencia (ms) | Memoria pico (MB) | Unidad de computo |
|---|---|---|---|---|---|
| ONNX | float | Snapdragon X2 Elite | 0,381 | 2 - 2 | NPU |
| ONNX | float | Snapdragon X Elite | 0,791 | 2 - 2 | NPU |
| ONNX | float | Snapdragon 8 Gen 3 Mobile | 0,523 | 0 - 38 | NPU |
| ONNX | float | Snapdragon 8 Gen 1 Mobile | 1,082 | 1 - 41 | NPU |
| ONNX | float | Qualcomm Dragonwing IQ-8275 | 0,973 | 1 - 5 | NPU |
| ONNX | float | Qualcomm Dragonwing QCS8550 (Proxy) | 0,788 | 0 - 3 | NPU |
| ONNX | float | Qualcomm QCS8450 | 1,082 | 1 - 41 | NPU |
| ONNX | float | Qualcomm Dragonwing IQ-9075 | 0,981 | 1 - 4 | NPU |
| ONNX | float | Qualcomm Dragonwing IQ-X7181 | 0,791 | 2 - 2 | NPU |
| ONNX | float | Qualcomm Dragonwing Q-8750 | 0,429 | 0 - 27 | NPU |
| ONNX | float | Snapdragon 8 Elite Mobile | 0,429 | 0 - 27 | NPU |
| ONNX | float | Snapdragon 8 Elite Gen 5 Mobile | 0,377 | 0 - 28 | NPU |
| ONNX | w8a16 | Snapdragon X2 Elite | 0,387 | 1 - 1 | NPU |
| ONNX | w8a16 | Snapdragon X Elite | 0,853 | 1 - 1 | NPU |
| ONNX | w8a16 | Snapdragon 8 Gen 3 Mobile | 0,544 | 0 - 43 | NPU |

La tabla se ha truncado en la informacion disponible, pero los datos muestran un rendimiento consistente por debajo de 1,1 ms en todos los chipsets listados.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo ocupa 447 KB en precision float, por lo que la memoria necesaria es minima (entre 1 y 43 MB segun el chipset y la precision, segun los datos de Qualcomm).
- GPU recomendadas: no requiere GPU dedicada; esta disenado para ejecutarse en NPU de chipsets Qualcomm (Snapdragon, Dragonwing). Tambien puede ejecutarse en CPU en dispositivos sin NPU, aunque con mayor latencia.
- Compatibilidad con GPU de consumo: no es relevante, ya que el modelo esta pensado para edge y movil. En un PC con GPU, la inferencia seria trivialmente rapida.
- Opciones de despliegue: Qualcomm AI Hub Workbench para compilacion y perfilado, ONNX Runtime, TFLite, y la libreria Python `qai_hub_models` para exportacion personalizada.
- Latencia y throughput: entre 0,377 ms y 1,082 ms en NPU de Qualcomm segun el chipset, con precision float. Las versiones cuantizadas w8a16 muestran latencias similares o ligeramente superiores en algunos casos.

## Comparativa con modelos similares

No se dispone de informacion suficiente en los datos proporcionados para realizar una comparativa con otros modelos de segmentacion de personas (como YOLOv8-seg, DeepLabV3, o U2-Net). La informacion disponible se limita a la implementacion de MediaPipe y su optimizacion por Qualcomm. Se recomienda consultar benchmarks publicos de segmentacion de personas para una comparativa completa.

## Limitaciones y advertencias

- El modelo esta optimizado principalmente para chipsets Qualcomm; en otras plataformas (Apple Silicon, GPU NVIDIA, etc.) el rendimiento puede no ser equivalente y requerira conversion de formato.
- La resolucion de entrada es baja (144x256 o 256x256), lo que puede limitar la precision en imagenes de alta resolucion o con personas pequenas en el encuadre.
- No se proporciona informacion sobre sesgos del modelo ni sobre su comportamiento con grupos demograficos diversos; como cualquier modelo de segmentacion de personas, puede presentar errores con ciertos tipos de iluminacion, posturas o vestimenta.
- Riesgo de alucinacion: no aplicable, al ser un modelo discriminativo de segmentacion y no generativo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo original de MediaPipe puede tener atribuciones adicionales de Google que conviene revisar.
- El numero de descargas (200) y la fecha de creacion (2024) sugieren que es un modelo relativamente reciente y con adopcion limitada hasta la fecha.

## Enlaces

- Hugging Face: https://huggingface.co/qualcomm/MediaPipe-Selfie-Segmentation
- Qualcomm AI Hub (modelo): https://aihub.qualcomm.com/models/mediapipe_selfie
- Repositorio GitHub de Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models/tree/main/src/qai_hub_models/models/mediapipe_selfie
- Implementacion original de MediaPipe: https://github.com/google/mediapipe/tree/master/mediapipe/modules/selfie_segmentation
