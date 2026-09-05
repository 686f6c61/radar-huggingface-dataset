# JcProg/PCBInspect-BodyDefect

## Resumen

PCBInspect-BodyDefect es un clasificador de imágenes desarrollado por JcProg para la inspección automática de defectos en placas de circuito impreso (PCB). Forma parte del enrutador de inspección de defectos SentinelPCB, un sistema que divide la tarea en dos etapas: un clasificador de región (PCBInspect-Region) decide qué parte del componente se está analizando y, a continuación, un clasificador especializado se encarga de detectar el defecto concreto. En este caso, el modelo se centra en defectos del cuerpo del componente (Body).

El modelo está basado en la arquitectura YOLO26s-cls de Ultralytics, un clasificador de imágenes de tamaño pequeño, y ha sido afinado sobre un conjunto de datos propietario de recortes de componentes SMT obtenidos mediante inspección óptica automática (AOI). El modelo se distribuye en formato ONNX (opset 17), listo para su integración en entornos de producción. Su relevancia radica en abordar una tarea de visión industrial con clases desbalanceadas y en ofrecer un despliegue ligero, ejecutable incluso en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26s-cls (Ultralytics), head de clasificación |
| Parametros totales | No disponible |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No aplica (clasificación de imágenes) |
| Tipos de cuantizacion | No especificado (export ONNX en FP32) |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17), pesos de Ultralytics (.pt) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura YOLO26s-cls de Ultralytics, un clasificador convolucional de tamaño pequeño derivado de la familia YOLO. Se ha afinado sobre un conjunto de datos propietario de recortes de componentes SMT, compuesto por pares de capturas (imagen de referencia sin defecto e imagen defectuosa) para cada punto físico de inspección. El conjunto de datos no se ha publicado y la división train/val/test se realizó agrupando por sitio físico de captura, evitando que la imagen de referencia y la defectuosa de un mismo componente queden separadas entre particiones.

La exportación a ONNX se realizó con el operador 17 y sin NMS, ya que solo se necesita la salida de clasificación. El modelo recibe una única entrada de imagen RGB de 640x640 píxeles normalizada entre 0 y 1, y devuelve una salida de logits crudos de tamaño (1, 6). No se ha aplicado ningún proceso de alineación con preferencias humanas (RLHF/DPO) ni técnicas de generación de texto, al tratarse de un modelo de visión pura.

## Capacidades

- Clasificación de defectos en el cuerpo de componentes SMT en seis categorías: ForeignMaterial, Golden, MissingPart, Shift, Tombstone y WrongPart.
- Procesamiento de imágenes RGB de 640x640 píxeles, normalizadas y en formato NCHW.
- Salida de logits crudos, con necesidad de aplicar softmax para obtener probabilidades.
- Integración sencilla mediante ONNX Runtime, compatible con CPU y GPU.
- Forma parte de un sistema modular de inspección, en el que un clasificador de región (PCBInspect-Region) decide qué especialista debe analizar cada recorte.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de texto; es un modelo de clasificación de imágenes.

## Casos de uso

- Control de calidad en líneas de producción SMT: el modelo puede integrarse en un sistema AOI para clasificar automáticamente recortes de componentes y detectar defectos como material extraño, componentes dorados, piezas ausentes o desplazadas.
- Inspección de soldadura por componentes: al enrutar los recortes según su región, el modelo se encarga de los defectos del cuerpo del componente, complementando a los clasificadores de plomo y texto.
- Automatización de inspección visual en plantas de electrónica: gracias a su exportación a ONNX, puede desplegarse en equipos industriales con recursos limitados, incluso en CPU.
- Análisis de fallos en fabricación de PCBs: el modelo puede usarse para identificar patrones de defectos recurrentes en un lote de producción, ayudando a diagnosticar problemas de proceso.
- Integración en sistemas de visión existentes: al ser un modelo de clasificación puro, puede conectarse a cualquier pipeline de visión por computadora que ya genere recortes de región de componentes.
- Investigación en inspección óptica automática: sirve como referencia para estudiar el rendimiento de clasificadores ligeros en tareas de AOI con clases desbalanceadas.

## Benchmarks y rendimiento

Los resultados de validación y test reportados por el autor son los siguientes:

**Validación** (top-1 0.948, macro-F1 0.875, n=784)

| Clase | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| ForeignMaterial | 0.996 | 0.975 | 0.985 | 276 |
| Golden | 1.000 | 1.000 | 1.000 | 200 |
| MissingPart | 0.706 | 0.706 | 0.706 | 17 |
| Shift | 0.929 | 0.897 | 0.913 | 146 |
| Tombstone | 0.773 | 0.739 | 0.756 | 23 |
| WrongPart | 0.851 | 0.934 | 0.891 | 122 |

**Test** (top-1 0.941, macro-F1 0.871, n=780)

| Clase | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| ForeignMaterial | 0.996 | 0.963 | 0.979 | 267 |
| Golden | 0.995 | 1.000 | 0.998 | 200 |
| MissingPart | 1.000 | 0.500 | 0.667 | 22 |
| Shift | 0.901 | 0.938 | 0.919 | 146 |
| Tombstone | 0.833 | 0.769 | 0.800 | 26 |
| WrongPart | 0.813 | 0.916 | 0.862 | 119 |

## Requisitos de hardware

- VRAM estimada: menos de 1 GB para la inferencia en FP32, gracias al tamaño pequeño del modelo y a la entrada de 640x640.
- GPU recomendada: cualquier GPU moderna con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 o superior) es suficiente; también puede ejecutarse en CPU.
- Compatible con GPU de consumo: sí, cabe en tarjetas como RTX 3060, RTX 4060 o incluso en GPUs integradas.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), OpenCV DNN, Ultralytics YOLO, o cualquier framework que soporte ONNX.
- Latencia y throughput: no disponibles en la información proporcionada; se estima una inferencia rápida al tratarse de un modelo de clasificación de tamaño pequeño.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada. El modelo está diseñado como un especialista dentro del router SentinelPCB, junto con los clasificadores PCBInspect-Region, PCBInspect-LeadDefect y PCBInspect-TextDefect, cada uno con una tarea distinta. No hay datos de rendimiento de otros clasificadores de defectos de PCB que permitan una comparación directa.

## Limitaciones y advertencias

- Las clases MissingPart y Tombstone son las más débiles, con solo 94 y 131 ejemplos de entrenamiento respectivamente, concentrados en un número reducido de números de pieza.
- En el conjunto de test, MissingPart alcanza una precisión de 1.00 pero un recall de 0.50, lo que significa que el modelo es conservador y falla en la detección de aproximadamente la mitad de los casos, aunque no genera falsas alarmas.
- El conjunto de datos de entrenamiento es propietario y no se ha publicado, por lo que no se puede reproducir el entrenamiento ni verificar la generalización a otros diseños de placas.
- El modelo solo clasifica defectos del cuerpo del componente; no detecta defectos en plomos, texto u otras regiones.
- La licencia MIT permite el uso comercial, pero el rendimiento puede degradarse en placas con diseños o materiales distintos a los del conjunto de entrenamiento.
- No se han realizado pruebas de robustez frente a variaciones de iluminación, resolución o ruido, por lo que se recomienda validar en condiciones de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JcProg/PCBInspect-BodyDefect
- Repositorio hermano PCBInspect-Region: https://huggingface.co/JcProg/PCBInspect-Region
- Repositorio hermano PCBInspect-LeadDefect: https://huggingface.co/JcProg/PCBInspect-LeadDefect
- Repositorio hermano PCBInspect-TextDefect: https://huggingface.co/JcProg/PCBInspect-TextDefect
- Detector estructural PCBInspect-AI: https://huggingface.co/JcProg/PCBInspect-AI
- GitHub de PCBInspect-AI: https://github.com/JC-prog/pcb-inspect-ai
- Documentación de YOLO26 de Ultralytics: https://docs.ultralytics.com/models/yolo26/
