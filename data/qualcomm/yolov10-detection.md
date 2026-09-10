# qualcomm/YOLOv10-Detection

## Resumen

YOLOv10-Detection es un modelo de deteccion de objetos en tiempo real publicado por Qualcomm en HuggingFace, consistente en el checkpoint YOLOv10-N de Ultralytics exportado y optimizado para ejecutarse en la NPU Hexagon de los SoC Snapdragon y Dragonwing. No se trata de un modelo de lenguaje: es un detector convolutional de una sola etapa que devuelve cajas delimitadoras y clases sobre imagenes de 640x640 pixeles, con solo 2,33 millones de parametros y un peso en disco de 8,95 MB en coma flotante, 3,04 MB en cuantizacion w8a16 y 2,55 MB en w8a8.

Su relevancia es practica: el repositorio forma parte del ecosistema Qualcomm AI Hub Models y proporciona mediciones de latencia y memoria pico sobre mas de una decena de chipsets reales, con tiempos de inferencia que van de 2,28 ms (Snapdragon 8 Elite Gen 5, w8a16) a 25,5 ms (Dragonwing Q-6690, w8a16). Esto lo convierte en una pieza util para desplegar vision por computador en movil, IoT industrial, automocion y XR sin depender de GPU dedicada.

Es importante senalar que, por restricciones de licencia, Qualcomm no distribuye los pesos pre-exportados: el usuario debe compilar y exportar el modelo por su cuenta con la libreria AI Hub Models. La licencia del modelo es AGPL-3.0, lo que condiciona su uso en productos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional de deteccion de objetos en una sola etapa (familia YOLOv10, variante N, diseno end-to-end sin NMS) |
| Parametros totales | 2,33 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de 640x640 px) |
| Tipos de cuantizacion | float, w8a16, w8a8, w8a8_mixed_int16 |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (libreria declarada: pytorch); exportable a ONNX y QNN_DLC (DLC). Los pesos pre-exportados no se distribuyen por restricciones de licencia |
| Tamano del modelo (float) | 8,95 MB |
| Tamano del modelo (w8a16) | 3,04 MB |
| Tamano del modelo (w8a8) | 2,55 MB |
| Resolucion de entrada | 640x640 |
| Checkpoint de partida | YOLOv10-N |
| Tarea (pipeline) | object-detection |
| Runtime medido | ONNX, QNN_DLC |
| Unidad de computo principal | NPU (Hexagon) en todos los chipsets medidos |
| Tamano del repositorio | 0,0 GB (no contiene artefactos de pesos) |
| Descargas / likes | 0 / 0 (en el momento de la captura) |

## Arquitectura y entrenamiento

El modelo es una red convolucional de deteccion en una sola etapa de la familia YOLOv10, en su variante mas pequena (N). YOLOv10 introduce un esquema de deteccion end-to-end que elimina la necesidad de supresion de no maximos (NMS) en postproceso mediante asignacion dual consistente, ademas de bloques y disenos de eficiencia orientados a reducir latencia. El resultado es una salida directa de cajas y clases, lo que simplifica el pipeline de inferencia en dispositivos con recursos limitados. Los detalles tecnicos de la arquitectura se describen en el paper referenciado por la etiqueta arxiv:2405.14458.

La model card no detalla la composicion del dataset de entrenamiento, el numero de imagenes o tokens vistos, ni si hubo ajuste fino, RLHF o DPO; esa informacion no esta disponible en la documentacion proporcionada. Tampoco se especifica si Qualcomm realizo entrenamiento adicional: el repositorio se presenta como una exportacion optimizada del checkpoint YOLOv10-N, con soporte para recompilar usando pesos propios (por ejemplo, checkpoints ajustados finamente), formas de entrada personalizadas y configuraciones de dispositivo y runtime a eleccion del usuario. La innovacion destacable aqui no es algorimica sino de despliegue: cuantizacion w8a16/w8a8/w8a8_mixed_int16 y compilacion especifica para la NPU de Qualcomm mediante AI Hub Workbench.

## Capacidades

- Deteccion de objetos: predice cajas delimitadoras y clases de objeto sobre imagenes de 640x640 px.
- Inferencia en tiempo real: latencias medidas entre 2,28 ms y 25,5 ms segun chipset y precision.
- Deteccion end-to-end sin NMS, lo que reduce el postproceso en el dispositivo.
- Ejecucion acelerada en NPU Hexagon en todos los chipsets medidos (Snapdragon 8 Gen 1/3, 8 Elite, 8 Elite Gen 5, 7 Gen 4, X Elite, X2 Elite y plataformas Dragonwing QCS/IQ/Q-8750).
- Exportacion a ONNX y QNN_DLC, con soporte para formas de entrada y configuraciones de runtime personalizadas.
- Recompilacion con pesos propios (checkpoints ajustados finamente) mediante la libreria AI Hub Models.
- Cuantizacion a w8a16, w8a8 y w8a8_mixed_int16 para reducir huella de memoria y latencia.
- Soporte de tool calling / function calling: no disponible (no aplica a un detector de objetos).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplica.
- Capacidades especiales (modo thinking, vision-lenguaje, audio): no disponibles; se limita a vision por computador para deteccion.

## Casos de uso

- Vision en camara de smartphone: integracion en aplicaciones Android (la etiqueta android aparece explicitamente en el repositorio) para deteccion en tiempo real sobre el flujo de camara. Con 2,28-3,03 ms por fotograma en Snapdragon 8 Elite Gen 5 y un peso de 2,55-3,04 MB cuantizado, el modelo puede ejecutarse de forma continua sin comprometer la bateria.
- Video analitico en edge industrial: despliegue sobre plataformas Dragonwing (QCS6490, QCS8550, IQ-8275, IQ-9075) en camaras IP o pasarelas IoT. Los tiempos de 4,79-16,99 ms en w8a16 permiten procesar multiples flujos de video por dispositivo.
- Automocion y sistemas de cabina: los chipsets QCS8450 (14,87 ms en float), Dragonwing Q-8750 (2,53 ms en w8a16) y Dragonwing Q-7790 (6,65 ms en w8a16) son plataformas automotrices; el detector puede alimentar funciones de deteccion de peatones, senalizacion o monitorizacion del habitaculo.
- Robotica movil y AGV: deteccion a bordo con consumo reducido al delegar el computo en la NPU; la memoria pico de 2-6 MB en w8a16 sobre IQ-8275 o QCS8550 deja margen para otros modulos de percepcion en el mismo SoC.
- Analitica de retail: conteo de personas y control de stock en terminales de punto de venta o pantallas inteligentes basadas en Snapdragon 7 Gen 4 (6,65 ms en w8a16) o 8 Gen 3 (3,35 ms).
- Control de calidad en linea de produccion: deteccion de defectos o piezas mal posicionadas en estaciones de inspeccion equipadas con modulos Dragonwing; la latencia sub-10 ms permite inspeccion fotograma a fotograma a velocidades de linea altas.
- Accesibilidad en movil: descripcion de escenas y localizacion de objetos para aplicaciones de asistencia a personas con discapacidad visual, gracias a la inferencia en NPU sin bloquear la interfaz.
- XR y gafas inteligentes: los chipsets Snapdragon X Elite y X2 Elite (2,44-3,36 ms en float y w8a16) permiten deteccion de objetos en el mundo real combinada con renderizado, manteniendo la GPU libre para el apartado grafico.
- Extraccion de caracteristicas para pipelines de vision: uso del detector como primer etapa (cajas y clases) que alimente modelos de seguimiento, re-identificacion o conteo aguas abajo.

## Benchmarks y rendimiento

No se han publicado resultados de precision (por ejemplo mAP sobre COCO) en la informacion disponible. La model card solo proporciona latencia y memoria pico por chipset, precision y runtime. A continuacion se reproducen esos datos.

Runtime ONNX, precision float:

| Chipset | Tiempo de inferencia (ms) | Memoria pico (MB) | Unidad de computo |
|---|---|---|---|
| Snapdragon X2 Elite | 3,355 | 5 - 5 | NPU |
| Snapdragon X Elite | 6,674 | 5 - 5 | NPU |
| Snapdragon 8 Gen 3 Mobile | 3,926 | 0 - 242 | NPU |
| Snapdragon 8 Gen 1 Mobile | 14,873 | 5 - 213 | NPU |
| Dragonwing IQ-8275 | 6,678 | 5 - 8 | NPU |
| Dragonwing QCS8550 (proxy) | 6,333 | 5 - 9 | NPU |
| Qualcomm QCS8450 | 14,873 | 5 - 213 | NPU |
| Dragonwing IQ-9075 | 7,628 | 5 - 7 | NPU |
| Dragonwing IQ-X7181 | 6,674 | 5 - 5 | NPU |
| Dragonwing Q-8750 | 4,385 | 1 - 200 | NPU |
| Snapdragon 8 Elite Mobile | 4,385 | 1 - 200 | NPU |
| Snapdragon 8 Elite Gen 5 Mobile | 3,033 | 1 - 220 | NPU |

Runtime ONNX, precision w8a16:

| Chipset | Tiempo de inferencia (ms) | Memoria pico (MB) | Unidad de computo |
|---|---|---|---|
| Snapdragon X2 Elite | 2,435 | 2 - 2 | NPU |
| Snapdragon X Elite | 5,626 | 2 - 2 | NPU |
| Snapdragon 8 Gen 3 Mobile | 3,352 | 0 - 103 | NPU |
| Snapdragon 8 Gen 1 Mobile | 6,653 | 3 - 102 | NPU |
| Dragonwing QCS6490 | 16,993 | 2 - 5 | NPU |
| Dragonwing IQ-8275 | 4,790 | 2 - 6 | NPU |
| Dragonwing QCS8550 (proxy) | 5,356 | 2 - 6 | NPU |
| Qualcomm QCS8450 | 6,653 | 3 - 102 | NPU |
| Dragonwing IQ-9075 | 5,813 | 2 - 5 | NPU |
| Dragonwing IQ-X7181 | 5,626 | 2 - 2 | NPU |
| Dragonwing Q-6690 | 25,497 | 3 - 196 | NPU |
| Dragonwing Q-7790 | 6,646 | 3 - 200 | NPU |
| Dragonwing Q-8750 | 2,529 | 1 - 80 | NPU |
| Snapdragon 8 Elite Mobile | 2,529 | 1 - 80 | NPU |
| Snapdragon 8 Elite Gen 5 Mobile | 2,284 | 0 - 80 | NPU |
| Snapdragon 7 Gen 4 Mobile | 6,646 | 3 - 200 | NPU |

Runtime ONNX, precision w8a8_mixed_int16:

| Chipset | Tiempo de inferencia (ms) | Memoria pico (MB) | Unidad de computo |
|---|---|---|---|
| Snapdragon 8 Gen 3 Mobile | 7,923 | 9 - 386 | NPU |
| Dragonwing IQ-8275 | 11,627 | 8 - 12 | NPU |
| Dragonwing QCS8550 (proxy) | 11,218 | 8 - 22 | NPU |
| Dragonwing IQ-9075 | 12,236 | 8 - 11 | NPU |
| Dragonwing Q-8750 | 6,023 | 7 - 357 | NPU |
| Snapdragon 8 Elite Mobile | 6,023 | 7 - 357 | NPU |
| Snapdragon 8 Elite Gen 5 Mobile | 6,973 | 6 - 365 | NPU |

Runtime QNN_DLC, precision float (tabla truncada en el origen):

| Chipset | Tiempo de inferencia (ms) | Memoria pico (MB) | Unidad de computo |
|---|---|---|---|
| Snapdragon X2 Elite | 2,675 | 5 - 5 | NPU |
| Snapdragon X Elite | 4,536 | 5 - 5 | NPU |
| Snapdragon 8 Gen 3 Mobile | 3,034 | 0 - 210 | NPU |
| Snapdragon 8 Gen 1 Mobile | 8,523 | 5 - 201 | NPU |
| Dragonwing IQ-82... (dato cortado en el origen) | no disponible | no disponible | NPU |

Observaciones: en w8a16 la latencia mejora de forma consistente frente a float en todos los chipsets comparables, con la excepcion destacable del Dragonwing Q-6690 (25,497 ms), el dispositivo mas lento de la tabla. Las cifras proceden del proveedor (Qualcomm) y no se acompanan de validacion independiente ni de la precision del detector.

## Requisitos de hardware

- No se trata de un modelo de lenguaje: no requiere VRAM en el sentido habitual. La huella de memoria pico medida en NPU oscila entre 0 y 386 MB segun chipset y precision.
- Espacio en disco: 8,95 MB en float, 3,04 MB en w8a16, 2,55 MB en w8a8.
- Aceleradores objetivo: NPU Hexagon de los SoC Snapdragon X2 Elite, X Elite, 8 Gen 1, 8 Gen 3, 7 Gen 4, 8 Elite y 8 Elite Gen 5; y plataformas Dragonwing QCS6490, QCS8450, QCS8550, IQ-8275, IQ-9075, IQ-X7181, Q-6690, Q-7790 y Q-8750.
- Cabe en cualquier dispositivo de gama media-alta con SoC Snapdragon: no requiere GPU dedicada ni servidor.
- GPU de escritorio (A100, H100, RTX 4090, etc.): no se proporcionan mediciones en la informacion disponible. El modelo puede ejecutarse en PyTorch o via ONNX en hardware generico, pero sin cifras de rendimiento publicadas por el autor.
- Opciones de despliegue: compilacion y exportacion con la libreria Qualcomm AI Hub Models (runtimes ONNX y QNN_DLC) y perfilado/evaluacion en dispositivo hospedado mediante Qualcomm AI Hub Workbench. No se documentan rutas de despliegue tipo vLLM, TGI, llama.cpp u Ollama, que no aplican a un detector de objetos.
- Requisito de cuenta: para ejecutar los modelos en un dispositivo Qualcomm hospedado es necesario registrarse en Qualcomm AI Hub.
- Latencia: 3,033 ms en float y 2,284 ms en w8a16 sobre Snapdragon 8 Elite Gen 5 (mejores casos); 16,993 ms en w8a16 sobre Dragonwing QCS6490 y 25,497 ms en w8a16 sobre Dragonwing Q-6690 (peores casos registrados).
- Throughput: no disponible en la informacion proporcionada (solo se publica latencia por inferencia, no imagenes por segundo).

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| YOLOv10-Detection (qualcomm/YOLOv10-Detection) | 2,33 M | 640x640 px | AGPL-3.0 | Pesos pre-exportados no distribuidos; requiere compilar con AI Hub Models | Latencia y memoria pico en mas de una decena de chipsets Qualcomm (ONNX y QNN_DLC) |
| Ultralytics YOLOv10 (implementacion de referencia) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | AGPL-3.0 | Codigo y pesos en el repositorio de Ultralytics | no disponible en la informacion proporcionada |
| Otras variantes de YOLOv10 (S, M, B, L, X) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | AGPL-3.0 | Repositorio de Ultralytics | no disponible en la informacion proporcionada |
| Otros detectores del catalogo Qualcomm AI Hub Models | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible | Requieren el mismo flujo de compilacion | no disponible en la informacion proporcionada |

La comparacion cuantitativa con alternativas (por ejemplo, YOLOv8-N o YOLO11-N) no puede realizarse con rigor porque la informacion proporcionada no incluye el numero de parametros, la resolucion de entrada ni la precision de esos modelos. La ventaja diferencial documentada de esta ficha es la disponibilidad de mediciones de latencia y memoria sobre hardware Qualcomm concreto, no una mejora de precision.

## Limitaciones y advertencias

- Precision no documentada: la model card no publica mAP ni ninguna metrica de calidad de deteccion, por lo que no es posible evaluar el equilibrio entre falsos positivos y falsos negativos a partir de la informacion disponible.
- Sin validacion independiente: todas las cifras de latencia y memoria proceden del propio proveedor (Qualcomm) y de su herramienta AI Hub Workbench.
- Los pesos no se distribuyen: por restricciones de licencia, el repositorio no incluye artefactos pre-exportados (el tamano del repo es 0,0 GB). Es obligatorio compilar y exportar el modelo por cuenta propia, lo que anade friccion y dependencia de las herramientas de Qualcomm.
- Licencia AGPL-3.0: se trata de una licencia copyleft fuerte con clausula de uso en red. Integrar el modelo en un producto propietario o en un servicio accesible por red puede obligar a liberar el codigo correspondiente. Es imprescindible revision legal antes de un despliegue comercial.
- Dependencia de hardware: las mediciones y la optimizacion estan atadas a la NPU Hexagon de Qualcomm. En otros aceleradores el rendimiento y el flujo de trabajo seran distintos y no estan documentados aqui.
- Variante minima: se usa el checkpoint YOLOv10-N, la variante mas ligera de la familia, lo que implica menor precision que las variantes S, M, B, L o X; no es la eleccion adecuada si la prioridad es la maxima exactitud.
- Deteccion de objetos unicamente: no procesa lenguaje, no soporta tool calling, no tiene modo de razonamiento ni capacidades multimodales mas alla de la vision.
- Sesgos: no se dispone de informacion sobre la composicion del dataset de entrenamiento ni sobre sesgos conocidos de clase, genero, tono de piel u origen geografico. Al ser el checkpoint YOLOv10-N, hereda los sesgos del dataset con el que Ultralytics lo entreno, no detallado en esta ficha.
- Limitaciones de idioma: no aplica, pero tampoco hay soporte de texto en ningun idioma.
- Riesgo en produccion: la variabilidad de latencia entre chipsets es muy alta (de 2,284 ms a 25,497 ms en w8a16), por lo que la eleccion de la plataforma condiciona directamente la viabilidad del caso de uso en tiempo real.
- Datos incompletos en el origen: la tabla de rendimiento con runtime QNN_DLC aparece truncada en la model card, y el repositorio registra 0 descargas y 0 likes en el momento de la captura, lo que limita la evidencia de uso en la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qualcomm/YOLOv10-Detection
- Repositorio de la libreria AI Hub Models y del modelo: https://github.com/qualcomm/ai-hub-models/blob/v0.62.0/src/qai_hub_models/models/yolov10_det
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Registro de cuenta Qualcomm: https://myaccount.qualcomm.com/signup
- Implementacion de referencia de YOLOv10 en Ultralytics: https://github.com/ultralytics/ultralytics/tree/main/ultralytics/models/yolo/detect
- Paper de YOLOv10 (referencia arxiv:2405.14458): https://arxiv.org/abs/2405.14458
- Imagen de demostracion del modelo: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/yolov10_det/web-assets/model_demo.png
- Sitio corporativo de Qualcomm: https://www.qualcomm.com/
- Informacion de la compania: https://www.qualcomm.com/company
- Relacion con inversores: https://investor.qualcomm.com/overview/default.aspx
- Entrada de Qualcomm en Wikipedia: https://en.wikipedia.org/wiki/Qualcomm
- Entrada de Qualcomm en Wikipedia en frances: https://fr.wikipedia.org/wiki/Qualcomm
