# numanbekir/visdrone-yolo11s

## Resumen

YOLO11s entrenado sobre VisDrone2019-DET y exportado a ONNX. Lo publica el usuario numanbekir como un modelo de deteccion de objetos orientado a imagenes aereas de dron, con diez clases de interes (peatones, vehiculos, bicicletas, etc.) y un enfasis explicito en objetos pequenos, muchos de ellos por debajo de los 32 pixeles. Se distribuye en dos variantes del mismo modelo con distinta resolucion de entrada, 640 y 1280 pixeles, lo que permite intercambiar precision por coste computacional sin cambiar de arquitectura.

El modelo parte de pesos YOLO11s preentrenados en COCO y se ajusta durante 50 epocas con Ultralytics 8.4.175 sobre una unica RTX 3060 Laptop. La relevancia practica esta en que ofrece una linea base reproducible y ligera (repo de 0,1 GB) para deteccion de objetos pequenos en escenarios de vigilancia aerea, con el pipeline de pre y post-procesado documentado y publicado en un repositorio aparte.

La licencia es un punto critico: el modelo se distribuye bajo AGPL-3.0 por derivar de Ultralytics YOLO11, y los datos de entrenamiento (VisDrone2019-DET) son de uso exclusivamente academico y no comercial, lo que condiciona seriamente cualquier despliegue productivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11s (detector de una etapa, familia Ultralytics YOLO11) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo se publican pesos ONNX en float32) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | AGPL-3.0 (modelo); datos VisDrone2019-DET de uso academico no comercial |
| Formato de pesos | ONNX (`yolo11s_640.onnx`, `yolo11s_1280.onnx`) |
| Resolucion de entrada | 640x640 y 1280x1280, RGB float32, valores 0-1 |
| Salida | `output0` de forma (1, 14, 8400) a 640 y (1, 14, 33600) a 1280 |
| Clases | 10 (pedestrian, people, bicycle, car, van, truck, tricycle, awning-tricycle, bus, motor) |
| NMS | No incluido en el grafo; requiere post-procesado externo (IoU 0,7, class-aware) |

## Arquitectura y entrenamiento

Se trata de un detector YOLO11s, es decir, un transformer de vision de una etapa con cabeza de deteccion densa que predice directamente cajas y puntuaciones por clase sobre una rejilla multi-escala. No hay decodificacion especulativa ni mecanismos de atencion lineal: es la arquitectura estandar de Ultralytics YOLO11 en su variante "s" (small). El modelo se inicializa desde pesos COCO y se ajusta con Ultralytics 8.4.175 durante 50 epocas, semilla 0, batch 16 a 640 y batch 4 a 1280, en una unica RTX 3060 Laptop. El checkpoint `best.pt` se selecciona sobre validacion y se exporta con `yolo export format=onnx`.

El conjunto de entrenamiento es VisDrone2019-DET, con imagenes de dron en vistas cenitales y oblicuas y una proporcion muy alta de objetos pequenos. Solo se realizo una ejecucion de entrenamiento por cada tamano de entrada, lo que limita la robustez estadistica de las cifras. El pipeline de evaluacion del autor convierte las etiquetas YOLO y mide con pycocotools; conviene notar que las regiones "ignored" de VisDrone se descartaron en la conversion, por lo que las detecciones en esas zonas cuentan como falsos positivos y las metricas son, en ese sentido, conservadoras.

## Capacidades

- Deteccion de objetos en imagenes aereas de dron con 10 clases de trafico y peatones.
- Deteccion de objetos pequenos, con mejoras sustanciales al pasar de 640 a 1280 pixeles de entrada.
- Inferencia via ONNX Runtime, sin dependencia de PyTorch en produccion.
- Preprocesado documentado: letterbox con relleno gris (114) manteniendo relacion de aspecto.
- Postprocesado de referencia publicado (`decode.py`, `nms.py`): seleccion de candidatos por umbral, NMS class-aware con IoU 0,7 y hasta 300 detecciones, y deshacer del letterbox.
- No soporta tool calling, agentes, texto ni razonamiento multi-paso: es exclusivamente un modelo de vision.
- No dispone de modo thinking, vision multimodal ni audio.

## Casos de uso

- Vigilancia de trafico aereo no tripulado: el modelo detecta coches, furgonetas, camiones, autobuses y motos en imagenes cenitales, adecuado para conteo de vehiculos en imagenes capturadas por dron gracias a sus 10 clases especificas de trafico.
- Monitorizacion de aglomeraciones de personas: las clases `pedestrian` y `people` permiten estimar densidad de personas en eventos o espacios publicos vistos desde el aire, con la variante de 1280 para mayor recall en objetos pequenos.
- Analisis de infraestructura viaria: deteccion de bicicletas, triciclos y awning-tricycles en imagenes de dron para estudios de movilidad urbana en entornos donde estos vehiculos son frecuentes.
- Prototipado rapido en ONNX Runtime: al no requerir PyTorch, se integra en servicios ligeros o en entornos con dependencias minimas, usando el pipeline de referencia del repositorio del autor.
- Investigacion academica en deteccion de objetos pequenos: sirve como linea base reproducible (semilla fija, hiperparametros documentados) para comparar tecnicas de aumento de resolucion o arquitecturas en VisDrone.
- Preetiquetado de datasets aereos: generar cajas candidatas con umbral bajo y NMS para acelerar el etiquetado humano en proyectos de vision aerea.
- Evaluacion comparativa de resoluciones de entrada: las dos variantes permiten medir el coste/beneficio de 640 frente a 1280 en el mismo modelo sin cambiar de codigo.

## Benchmarks y rendimiento

| Metrica | 640 (val) | 640 (test-dev) | 1280 (val) | 1280 (test-dev) |
|---|---|---|---|---|
| mAP50 | 0,347 | 0,288 | 0,503 | 0,411 |
| mAP50 con pipeline ONNX del repo | 0,355 | 0,294 | 0,505 | no disponible |
| AP small (IoU 0,50:0,95, val) | 0,111 | no disponible | 0,223 | no disponible |

Medido con pycocotools sobre etiquetas YOLO convertidas (area all, maxDets 100) y detecciones de Ultralytics predict. No se han publicado resultados de otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repo (0,1 GB) y la naturaleza del modelo, la variante de 640 es apta para GPUs de gama baja y la de 1280 requiere mas memoria de activaciones, pero no se publican cifras.
- GPU de entrenamiento usada: una RTX 3060 Laptop, lo que indica que el ajuste fino es viable en hardware de consumo.
- GPU recomendadas: no disponibles en la informacion proporcionada; la RTX 3060 Laptop es la unica referencia del autor.
- Cabe en GPU de consumo: si, segun el hardware de entrenamiento declarado; no se especifican modelos concretos para inferencia.
- Opciones de despliegue: ONNX Runtime (referencia del autor); otras opciones como TensorRT, OpenVINO o TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | mAP50 (VisDrone val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| numanbekir/visdrone-yolo11s (640) | no disponible | 640x640 | 0,347 | AGPL-3.0 | Hugging Face |
| numanbekir/visdrone-yolo11s (1280) | no disponible | 1280x1280 | 0,503 | AGPL-3.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado sobre vistas cenitales y oblicuas de dron; las fotos a nivel de suelo quedan fuera de distribucion y el rendimiento caera de forma marcada.
- Los objetos pequenos siguen siendo dificiles: AP small de 0,111 a 640 y 0,223 a 1280 en validacion.
- Las regiones "ignored" de VisDrone se descartaron en la conversion de etiquetas, por lo que las metricas publicadas penalizan detecciones correctas en esas zonas.
- Solo se realizo una ejecucion de entrenamiento por tamano de entrada, sin variabilidad entre semillas.
- Licencia del modelo AGPL-3.0, heredada de Ultralytics YOLO11, con obligaciones de copyleft para servicios en red.
- Los datos de entrenamiento VisDrone2019-DET son de uso academico no comercial; es necesario revisar sus terminos antes de cualquier otro uso.
- No se publican datos de sesgo, calibracion ni robustez frente a condiciones meteorologicas o de iluminacion.
- No incluye NMS en el grafo ONNX: cualquier despliegue debe implementar el postprocesado, con el riesgo de errores si se omite o se parametriza mal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/numanbekir/visdrone-yolo11s
- Repositorio de evaluacion y pipeline: https://github.com/numanbekir/detection-eval
- Dataset VisDrone2019-DET: https://github.com/VisDrone/VisDrone-Dataset
