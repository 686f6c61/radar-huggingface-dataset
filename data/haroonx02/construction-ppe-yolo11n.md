# haroonx02/construction-ppe-yolo11n

## Resumen

construction-ppe-yolo11n es un detector de objetos YOLO11n afinado por haroonx02 para la deteccion de equipos de proteccion individual (EPI) en obras de construccion. Reconoce diez clases: casco y mascarilla puestos y ausentes, chaleco reflectante y su ausencia, persona, cono de seguridad, maquinaria y vehiculo. El modelo parte de los pesos COCO-pretrained de Ultralytics y se entrena durante 40 epocas (59 minutos en un Apple M5 a 640 px) sobre las 2.605 imagenes de entrenamiento del dataset Construction Site Safety de Roboflow.

Su interes practico reside en el formato: ademas del checkpoint PyTorch de 5,5 MB, el autor publica tres variantes ONNX (FP32, FP16 e INT8 estatico) con mAP@0.5 entre 0,698 y 0,708, lo que permite desplegarlo desde el navegador o en dispositivos de borde sin dependencia del framework original. La variante INT8 ocupa solo 3,3 MB.

Es importante subrayar que se trata de un proyecto de aprendizaje, no de un sistema de seguridad certificado: el propio autor advierte que se pierde aproximadamente un tercio de las infracciones presentes en el conjunto de test. La licencia AGPL-3.0 heredada de Ultralytics condiciona su uso en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n (Ultralytics), detector de objetos de una etapa |
| Parametros totales | no disponible (checkpoint PyTorch de 5,5 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija de 640 x 640 px) |
| Tipos de cuantizacion | FP32 (ONNX), FP16 (ONNX), INT8 estatico QDQ per-channel (ONNX) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | AGPL-3.0 (pesos); codigo de entrenamiento y evaluacion MIT |
| Formato de pesos | PyTorch `.pt` y ONNX (opset 17) |

Detalles adicionales de la entrada y salida ONNX:

| Parametro | Valor |
|---|---|
| Entrada ONNX | `images`: float32 (1, 3, 640, 640), RGB en [0, 1], letterbox con relleno gris 114 |
| Salida ONNX | `output0`: (1, 14, 8400), caja (cx, cy, w, h) en pixeles de entrada y una puntuacion sigmoide por clase |
| NMS | No incluido en el grafo; el proyecto aplica umbral 0,35 y NMS por clase con IoU 0,5 |
| Clases | 10: Hardhat, Mask, NO-Hardhat, NO-Mask, NO-Safety Vest, Person, Safety Cone, Safety Vest, machinery, vehicle |

## Arquitectura y entrenamiento

YOLO11n es la variante nano de la familia YOLO11 de Ultralytics: un detector de una etapa con backbone y cuello convolucionales y tres cabezas de prediccion a distintas escalas, sin mecanismos de atencion global. El modelo parte de pesos preentrenados en COCO y se afina durante 40 epocas a resolucion de 640 px. El dataset de entrenamiento es la particion de 2.605 imagenes de Construction Site Safety (Roboflow, CC BY 4.0), con fotografia mayoritariamente diurna de obra.

El autor publica tres exportaciones ONNX derivadas del mismo checkpoint. La variante FP32 mantiene exactamente el mAP del modelo PyTorch (0,708 sobre letterbox de 640 x 640). La FP16 conserva los pesos en media precision con entrada y salida en float32. La INT8 se genera con cuantizacion estatica QDQ per-channel usando 200 imagenes de entrenamiento y calibracion MinMax, dejando en float la ultima convolucion de cada rama de cabeza y la decodificacion de cajas. Los metadatos de Ultralytics quedan embebidos en el grafo, de modo que `YOLO("yolo11n_ppe_int8.onnx", task="detect")` carga el modelo directamente.

## Capacidades

- Deteccion de objetos en imagenes de obra con 10 clases de EPI y contexto (casco, mascarilla, chaleco, persona, cono, maquinaria, vehiculo).
- Deteccion explicita de estados negativos mediante clases dedicadas: NO-Hardhat, NO-Mask y NO-Safety Vest.
- Asociacion post-proceso de casco y chaleco a la persona que los lleva, con calculo de estado de cumplimiento por trabajador (logica implementada en el repositorio del proyecto, no en el modelo).
- Inferencia sobre imagen fija de 640 x 640 con letterbox; el proyecto evalua tambien imagenes redimensionadas a 960 x 720 y 500 x 333.
- Ejecucion en navegador mediante la demo publica en Hugging Face Spaces.
- Exportacion a ONNX con metadatos Ultralytics para integracion directa en pipelines.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de texto, audio o video de forma nativa.

## Casos de uso

- Prototipado de auditoria de EPI en obra: el modelo detecta casco, chaleco y mascarilla junto con sus clases negativas, y el post-proceso del repositorio asigna un estado de cumplimiento a cada trabajador. Adecuado para validar rapido la viabilidad de un sistema de vision antes de invertir en un modelo mayor.
- Despliegue en el navegador: la variante INT8 de 3,3 MB puede ejecutarse con ONNX Runtime Web sobre imagenes capturadas por la camara del dispositivo, sin backend dedicado, para demos o formacion.
- Inferencia en dispositivos de borde: el checkpoint de 5,5 MB y el ONNX INT8 caben en dispositivos con recursos limitados (Raspberry Pi, Jetson Nano, moviles) para procesar capturas por lotes o fotos subidas por el usuario.
- Etiquetado asistido: usar las detecciones como preanotaciones para revisar y corregir manualmente, acelerando la construccion de un dataset propio con las mismas 10 clases.
- Analisis forense de imagenes: procesar lotes de fotografias de inspeccion para cuantificar la presencia de conos, maquinaria y vehiculos junto con el estado de EPI, con la salvedad de la tasa de falsos negativos.
- Integracion en pipelines CI de vision: como paso de validacion en un repositorio que entrena y evalua modelos de deteccion, el ONNX FP32 sirve de referencia reproducible con mAP@0.5 de 0,708 sobre el conjunto de test del autor.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 82 imagenes de test (mAP calculado a 640 x 640 con letterbox):

| Modelo / fichero | mAP@0.5 (todas) | mAP@0.5 (40 limpias) | mAP@0.5:0.95 (todas) | Flags de infraccion P / R |
|---|---|---|---|---|
| `yolo11n_ppe.pt` (PyTorch) | 0,713 (lotes rectangulares) | no disponible | 0,413 | 0,97 / 0,68 |
| ONNX FP32 | 0,708 | no disponible | no disponible | no disponible |
| ONNX FP16 | 0,702 | no disponible | no disponible | no disponible |
| ONNX INT8 | 0,698 | 0,650 | no disponible | 0,95 / 0,67 |

El subconjunto "limpio" de 40 imagenes excluye las que comparten video de origen con el conjunto de entrenamiento; el autor lo considera la cifra mas justa. Sobre robustez de la cuantizacion: al cambiar el remuestreo de `INTER_LINEAR` a `INTER_LINEAR_EXACT` (diferencias de hasta un nivel de gris), el INT8 conserva el 97-98 % de las cajas emparejadas a IoU 0,5 pero solo el 7-9 % a IoU 0,99; el FP32 mantiene el 91-96 % a IoU 0,99.

No se han publicado comparaciones con otros detectores en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las variantes; el checkpoint PyTorch ocupa 5,5 MB y el ONNX INT8 3,3 MB, por lo que el limite practico lo marca el runtime, no el modelo.
- GPU recomendadas: cualquier GPU con soporte CUDA es sobredimensionada para este modelo; una RTX 4090 o A100 ejecutarian la inferencia en el orden de milisegundos por imagen, dominada por el preproceso. Para produccion a gran escala, es mas razonable CPU con ONNX Runtime o aceleradores de borde.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una GPU integrada, y en CPU.
- Opciones de despliegue: Ultralytics (`YOLO("yolo11n_ppe_int8.onnx", task="detect")`), ONNX Runtime (incluido ONNX Runtime Web para navegador), y exportacion adicional a otros formatos desde el checkpoint `.pt` mediante Ultralytics (TensorRT, OpenVINO, CoreML, TFLite, entre otros).
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor solo indica 59 minutos de entrenamiento en un Apple M5.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de alternativas en la informacion proporcionada. Como referencia cualitativa de la familia:

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| construction-ppe-yolo11n (este) | no disponible (5,5 MB) | 640 x 640 px fijos | AGPL-3.0 | Hugging Face, ONNX y PyTorch |
| YOLO11n base (Ultralytics, COCO) | no disponible | 640 x 640 px | AGPL-3.0 | Hugging Face / GitHub Ultralytics |
| Otros detectores de EPI en Roboflow Universe | no disponible | variable | variable (CC BY 4.0 en el dataset de origen) | Roboflow Universe |

No se han publicado comparaciones numericas con estos u otros modelos en la informacion disponible.

## Limitaciones y advertencias

- No es un sistema de seguridad: el autor lo describe explicitamente como proyecto de aprendizaje. Se pierde aproximadamente un tercio de los trabajadores con infraccion en el test (17 de 28 fallos son trabajadores no detectados; 11 son EPI no detectados).
- Sesgo de dominio: las imagenes son mayoritariamente diurnas; el rendimiento en interiores, nocturno o con oclusion severa no esta documentado.
- El conjunto de test contiene fuga de datos: la mitad de las imagenes provienen de videos tambien usados en entrenamiento, por lo que mAP@0.5 de 0,713 esta inflado; la cifra limpia es 0,671.
- La cuantizacion INT8 es sensible a cambios minimos en el preproceso (remuestreo distinto altera drasticamente la coincidencia de cajas a IoU alto); si se integra en un pipeline, hay que fijar el metodo de letterbox.
- La licencia AGPL-3.0 impone obligaciones de liberacion del codigo fuente en servicios en red; para uso comercial propietario es necesario evaluar una licencia comercial de Ultralytics o sustituir el modelo.
- El seguimiento de personas y el calculo de cumplimiento no forman parte del modelo; dependen del codigo del repositorio del proyecto.
- Advertencia etica y legal del autor: no usar para sancionar automaticamente a trabajadores; la monitorizacion de empleados requiere base legal y finalidad declarada (RGPD).
- El modelo no procesa texto ni soporta tool calling, agentes o razonamiento multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/haroonx02/construction-ppe-yolo11n
- Repositorio del proyecto (entrenamiento, evaluacion, reglas de cumplimiento): https://github.com/haroonkhan02/construction-safety-lidar-vision
- Demo en navegador: https://huggingface.co/spaces/haroonx02/construction-ppe-browser
- Dataset Construction Site Safety (Roboflow): https://universe.roboflow.com/roboflow-universe-projects/construction-site-safety
- Ultralytics YOLO (framework y pesos base): https://github.com/ultralytics/ultralytics
