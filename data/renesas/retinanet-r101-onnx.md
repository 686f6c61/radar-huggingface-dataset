# Renesas/RetinaNet-R101-ONNX

## Resumen

RetinaNet-R101-ONNX es un modelo de deteccion de objetos en formato ONNX FP32 publicado por Renesas para su plataforma de computacion embebida R-Car X5H, equipada con la NPU NPX6-48K. Se trata de una adaptacion del modelo de referencia `retinanet-9` del ONNX Model Zoo (`onnxmodelzoo/retinanet-9`), con backbone ResNet-101 y Feature Pyramid Network (FPN), orientado a inferencia sobre aceleradores de hardware especificos en lugar de GPU de proposito general. No es un modelo de lenguaje: es un detector one-stage de vision por computador.

El modelo resuelve la tarea de deteccion de objetos sobre imagenes RGB con un unico forward pass, devolviendo cajas delimitadoras, puntuaciones de confianza y etiquetas de clase. Su relevancia radica en que demuestra el flujo de despliegue de Renesas para modelos de vision en el borde: el artefacto distribuido es FP32, pero tanto ONNX Runtime con el Execution Provider de NPU como el runtime propietario MWMX lo convierten automaticamente a INT8 al cargarlo, sin necesidad de un fichero cuantizado aparte.

El repositorio ocupa 0,2 GB y esta licenciado bajo Apache 2.0. La precision de referencia en el conjunto de validacion de COCO es de mAP = 0,376 (IoU 0,50:0,95) en FP32. Las cifras de latencia y throughput en INT8 sobre hardware fisico figuran como pendientes (TBD) en la model card, y el rendimiento final depende del bus y la frecuencia de la NPU objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RetinaNet (detector one-stage) con backbone ResNet-101 y Feature Pyramid Network (FPN), niveles P3-P7 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen de hasta 3 canales x H x W) |
| Tipos de cuantizacion | FP32 ONNX de referencia; conversion automatica a INT8 en tiempo de carga por el runtime NPU (no se distribuye artefacto INT8) |
| Idiomas soportados | no disponible (modelo de deteccion visual; no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (FP32) |

Otros datos tecnicos relevantes:

| Parametro | Valor |
|---|---|
| Tensor de entrada | `(N, 3, H, W)`, RGB, FP32, rango de pixel `[0, 1]` |
| Normalizacion | media `[0.485, 0.456, 0.406]`, desviacion `[0.229, 0.224, 0.225]` |
| Salidas | 10 tensores (5 cabezas de clasificacion + 5 de regresion de cajas) |
| Clases | coherente con 80 clases de COCO y 9 anclas por posicion (720 = 80 x 9; 36 = 4 x 9) |
| Conjunto de evaluacion | COCO (validacion) |
| Hardware objetivo | Renesas R-Car X5H con NPU NPX6-48K |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La arquitectura es un RetinaNet clasico: un backbone convolucional ResNet-101 que extrae caracteristicas, sobre el que se monta una Feature Pyramid Network que genera cinco niveles de piramide (P3 a P7). Cada nivel alimenta dos subredes totalmente convolucionales: una cabeza de clasificacion y una cabeza de regresion de cajas ancla. El modelo produce 10 tensores de salida, cinco de clasificacion (por ejemplo, `[1, 720, 60, 80]` para una entrada de `1 x 3 x 480 x 640`) y cinco de regresion (`[1, 36, 60, 80]`). RetinaNet es conocido por emplear focal loss para mitigar el desequilibrio extremo entre ejemplos positivos y negativos durante el entrenamiento, lo que le permite competir con detectores de dos etapas a mayor velocidad.

El modelo deriva directamente del artefacto `retinanet-9` del ONNX Model Zoo y fue entrenado sobre el conjunto de datos COCO (80 clases). No se documenta en la informacion disponible el numero exacto de tokens, imagenes o epocas empleadas en el entrenamiento, ni la composicion detallada del dataset mas alla de la referencia a COCO. Al no ser un modelo generativo de lenguaje, no aplican tecnicas como RLHF, DPO o decodificacion especulativa. La innovacion tecnica que acompana a esta publicacion no esta en la arquitectura en si, sino en el flujo de despliegue: el runtime de Renesas ingiere el grafo ONNX en FP32 y lo compila o castea a INT8 para ejecutarlo en la NPU NPX6, evitando al desarrollador la tarea de cuantizacion manual. La model card advierte de que RetinaNet requiere posprocesamiento explicito: generacion de anclas, decodificacion de cajas, filtrado por umbral de confianza y supresion de no maximos (NMS).

## Capacidades

- Deteccion de objetos en imagenes RGB: devuelve cajas delimitadoras, puntuaciones de confianza y etiquetas de clase en un unico paso de inferencia.
- Deteccion multiescala mediante FPN sobre cinco niveles de piramide (P3-P7), lo que permite detectar objetos de tamanos variados en la misma imagen.
- Clasificacion coherente con las 80 clases del conjunto COCO (personas, vehiculos, animales, objetos cotidianos, etc.).
- Ejecucion en NPU embebida: el modelo esta preparado para desplegarse a traves de ONNX Runtime con el Execution Provider de NPU de Renesas o mediante el runtime MWMX, ambos con casteo automatico a INT8.
- Entrada de tamano variable: el grafo acepta tensores `(N, 3, H, W)`; el ejemplo de referencia usa `1 x 3 x 480 x 640` con tamano de lote 1.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas ni capacidades multilingues.
- No soporta tool calling, function calling ni flujos de agente multi-paso.
- No incorpora modo de razonamiento (thinking mode), ni entrada/salida de audio, ni descripcion de imagenes en lenguaje natural (no es un modelo vision-language).

## Casos de uso

- Percepcion en sistemas de asistencia a la conduccion (ADAS): el modelo puede detectar vehiculos, peatones y senales sobre los fotogramas de una camara frontal o de vision envolvente, ejecutandose en la NPU del R-Car X5H, que es precisamente un SoC orientado al sector de automocion.
- Vigilancia y videovigilancia inteligente en el borde: al ejecutarse en hardware embebido de bajo consumo, permite procesar streams de camaras IP localmente, detectando intrusiones o personas sin enviar video a la nube.
- Analitica de retail: conteo de personas, seguimiento de ocupacion y deteccion de productos en estanterias a partir de imagenes de camaras situadas en tienda, con inferencia local para preservar la privacidad.
- Inspeccion industrial automatizada: deteccion de defectos, piezas mal colocadas o elementos ausentes en lineas de montaje, integrando el detector en un pipeline de control de calidad en tiempo real.
- Robotica y logistica: localizacion de objetos y palets para tareas de pick-and-place, donde la deteccion sobre la NPU embebida reduce la dependencia de un servidor externo.
- Peajes, trafico y aparcamiento: clasificacion y conteo de vehiculos en imagenes de camaras fijas, con despliegue en unidades de borde instaladas en la propia infraestructura.
- Prototipado con ONNX Runtime en CPU o GPU: aunque el destino sea la NPU, el mismo grafo ONNX puede ejecutarse con `CPUExecutionProvider` u otros proveedores para validar el pipeline de preprocesado y posprocesado antes de pasar al hardware objetivo.

## Benchmarks y rendimiento

Los unicos datos de precision publicados corresponden al modelo de referencia en FP32. Las mediciones de latencia, throughput y mAP en INT8 sobre la NPU figuran como pendientes en la model card.

| Runtime / precision | mAP (IoU 0,50:0,95) | Notas |
|---|---|---|
| FP32 (referencia) | 0,376 | Modelo de referencia del ONNX Model Zoo |
| ONNX Runtime, Custom NPU EP (INT8) | pendiente (TBD) | Ejecucion en NPU, medida en hardware fisico |
| MWMX Runtime (INT8) | pendiente (TBD) | Ejecucion en NPU, medida en hardware fisico |

| Runtime | Precision | Dispositivo | Latencia (ms) | Throughput (fps) | Tipo |
|---|---|---|---|---|---|
| ORT Custom NPU EP | INT8 (auto) | X5H, 1 NPU, 1 core, 850 MHz | pendiente | pendiente | Medido |
| MWMX Runtime | INT8 (auto) | X5H, 1 NPU, 1 core, 850 MHz | pendiente | pendiente | Medido |
| PPA Estimator | INT8 | X5H, 1 NPU, 1 core, 1066 MHz | pendiente | no disponible | Estimado por software |

Configuracion de referencia de las pruebas: una NPU, un core de IA, entrada `3 x 480 x 640`, tamano de lote 1. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: placa Renesas R-Car X5H con NPU NPX6-48K. La inferencia acelerada no se ejecuta en GPU de escritorio, sino en esta NPU embebida.
- VRAM estimada: no disponible. El modelo no esta pensado para memoria de GPU convencional; el repositorio pesa 0,2 GB y el artefacto distribuido es un unico fichero ONNX FP32.
- GPU recomendadas: no aplica para el flujo objetivo. Fuera de la NPU, el grafo puede ejecutarse con ONNX Runtime en CPU o en GPU generica (por ejemplo, mediante `CPUExecutionProvider` o `CUDAExecutionProvider`), pero sin las garantias de rendimiento de la NPU.
- Compatibilidad con GPU de consumo: el modelo es lo bastante ligero (RetinaNet con ResNet-101) como para ejecutarse en una GPU de consumo mediante ONNX Runtime, aunque no se proporcionan cifras de latencia para ese escenario.
- Opciones de despliegue: ONNX Runtime con el Renesas Custom NPU Execution Provider, o el runtime propietario Renesas MWMX (Middleware MX) con su toolchain de compilacion. El runtime MWMX ingiere el ONNX FP32 y lo compila para ejecucion INT8 en la NPU.
- Requisitos previos: placa R-Car X5H con NPU NPX6, el runtime correspondiente y la CLI de Hugging Face para descargar los pesos (`hf download Renesas/RetinaNet-R101-ONNX --repo-type=model --include "fp32/*"`).
- Latencia y throughput: no disponibles (marcados como TBD en la model card). El rendimiento depende de la frecuencia de la NPU (se documentan 850 MHz en las pruebas HIL y 1066 MHz en la estimacion PPA) y del numero de cores de IA empleados; las pruebas de referencia usan un unico core.

## Comparativa con modelos similares

No se dispone de resultados de rendimiento medidos para los modelos alternativos en esta plataforma concreta, por lo que la comparacion se limita a caracteristicas estructurales.

| Modelo | Arquitectura | Backbone | Dataset | mAP COCO | Licencia | Formato / destino |
|---|---|---|---|---|---|---|
| Renesas/RetinaNet-R101-ONNX | RetinaNet + FPN | ResNet-101 | COCO | 0,376 (FP32) | Apache 2.0 | ONNX FP32, NPU NPX6 |
| onnxmodelzoo/retinanet-9 | RetinaNet + FPN | ResNet-101 | COCO | 0,376 (referencia) | Apache 2.0 | ONNX FP32, proposito general |
| Otros detectores del ONNX Model Zoo (SSD, Faster R-CNN, YOLO) | one-stage / two-stage | Varia (VGG, MobileNet, etc.) | COCO o VOC | no disponible | Varia | ONNX |

La diferencia principal entre el modelo de Renesas y el `retinanet-9` original no esta en la precision, sino en el empaquetado y el soporte de despliegue sobre la NPU NPX6. No se han publicado en la informacion disponible comparativas cuantitativas frente a detectores alternativos ejecutados sobre el mismo hardware.

## Limitaciones y advertencias

- Ambito restringido: es un detector de objetos, no un modelo generativo. No genera texto, no razona, no escribe codigo y no admite instrucciones en lenguaje natural.
- Sesgos del dataset: al entrenarse sobre COCO, hereda los sesgos de composicion y anotacion de ese conjunto (mayor representacion de determinadas categorias y contextos occidentales); el rendimiento puede degradarse en dominios alejados de COCO.
- Riesgo de falsos positivos y negativos: como todo detector, puede fallar en objetos pequenos, ocluidos, con poca luz o con distribuciones distintas a las de entrenamiento.
- Posprocesamiento obligatorio: el grafo devuelve tensores crudos de anclas y logits; sin generacion de anclas, decodificacion, umbral de confianza y NMS correctos, la salida no es utilizable. Un error en este paso degrada drasticamente los resultados.
- Dependencia de hardware propietario: la ejecucion acelerada requiere la NPU NPX6 y los runtimes de Renesas (ONNX Runtime con Custom EP o MWMX). No es un modelo portable a cualquier acelerador sin trabajo adicional.
- Rendimiento no verificado en INT8: las cifras de latencia y precision tras el casteo automatico a INT8 estan pendientes; la perdida de precision respecto al 0,376 en FP32 no se ha cuantificado en la informacion disponible.
- Idiomas y modalidades: no soporta texto, audio ni dialogo; la ficha de idiomas aparece como no disponible porque no aplica.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene revisar las condiciones de los componentes derivados (ONNX Model Zoo) y de cualquier dependencia del toolchain de Renesas, que puede tener licencia propia.
- Datos incompletos: no se especifican el numero de parametros totales ni el detalle del entrenamiento, lo que dificulta estimar requisitos de memoria y coste computacional a partir de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Renesas/RetinaNet-R101-ONNX
- Modelo base (ONNX Model Zoo): https://huggingface.co/onnxmodelzoo/retinanet-9
- Repositorio ONNX Model Zoo (incluye `retinanet-9`): https://github.com/onnx/models
- Sitio oficial de Renesas: https://www.renesas.com/
- Catalogo de productos de Renesas: https://www.renesas.com/en/products
- Wikipedia (Renesas Electronics): https://en.wikipedia.org/wiki/Renesas_Electronics
