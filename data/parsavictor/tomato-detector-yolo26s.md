# ParsaVictor/tomato-detector-yolo26s

## Resumen

Tomato Detector YOLO26s es un modelo de deteccion de objetos especializado en localizar tomates en imagenes y fotogramas de video, desarrollado por ParsaVictor con la libreria Ultralytics. Detecta una unica clase (`tomato`) independientemente del estado de maduracion del fruto, y constituye el primer componente de un pipeline completo de deteccion y conteo de tomates que incluye un clasificador de madurez y seguimiento de objetos.

El modelo se basa en la arquitectura YOLO26s en su variante small, con entrada de 640 px y un diseno sin NMS (NMS-free), lo que simplifica el despliegue y evita el postprocesado clasico de supresion de no-maximos. Fue entrenado sobre 5.783 imagenes procedentes de seis datasets publicos unificados y validado sobre 1.073 imagenes, alcanzando un mAP50 de 0,988 en el conjunto de prueba Tomato Defects.

Su relevancia radica en la aplicacion directa a agricultura de precision, inspeccion visual automatizada y conteo de frutos en lineas de procesado, con un tamaño contenido de 20 MB e inferencia de unos 40 ms por imagen en una GPU T4, lo que lo hace viable tanto en servidor como en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26s (Ultralytics), entrada 640 px, sin NMS |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de vision, no lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en FP nativo de PyTorch) |
| Idiomas soportados | no aplicable (modelo de deteccion de objetos) |
| Licencia | AGPL-3.0 (heredada de Ultralytics) |
| Formato de pesos | .pt (PyTorch, archivo `detector_yolo26s_best.pt`, 20 MB) |

## Arquitectura y entrenamiento

El modelo emplea YOLO26s, la variante small de la familia YOLO26 de Ultralytics, caracterizada por un diseño sin NMS que elimina el postprocesado de supresion de no-maximos durante la inferencia. La entrada se normaliza a 640 px. Segun la model card, sobre imagenes muy densas puede aparecer duplicacion de detecciones, por lo que el pipeline completo aplica un filtro ligero de duplicados con umbral IoU > 0,55.

El entrenamiento se realizo sobre 5.783 imagenes procedentes de seis datasets publicos unificados, con validacion sobre 1.073 imagenes. El dataset asociado es `ParsaVictor/tomato-ripeness-detection`. No se han publicado detalles sobre el numero de epocas, aumentos de datos aplicados ni el procedimiento exacto de unificacion de los seis datasets de origen. El umbral de confianza recomendado es 0,25, correspondiente al punto F1-optimo en validacion (F1 maximo con conf 0,334 segun `thresholds.json`).

## Capacidades

- Deteccion de objetos de una unica clase: localizacion de tomates en imagenes y fotogramas de video, sin distincion de estado de maduracion.
- Inferencia rapida: aproximadamente 40 ms por imagen en GPU T4 y unos 300 ms en CPU.
- Salida de cajas delimitadoras con puntuaciones de confianza, compatible con la API `predict` de Ultralytics.
- Funcionamiento sin NMS, lo que simplifica el despliegue en produccion.
- Integracion como componente de pipeline: puede combinarse con el clasificador de madurez y el modulo de seguimiento y conteo del mismo autor.
- Compatibilidad con el ecosistema Ultralytics (YOLO, `ultralytics` Python) y con `huggingface_hub` para descarga directa de pesos.
- Procesamiento de video: capaz de analizar fotogramas individuales para deteccion en flujos de video (por ejemplo, cintas transportadoras).

## Casos de uso

- Conteo automatico de frutos en agricultura de precision: el modelo detecta cada tomate en imagenes de campo o invernadero, permitiendo estimar rendimientos y planificar cosechas; el conteo se obtiene simplemente contando las cajas detectadas con `len(r.boxes)`.
- Inspeccion en lineas de procesado: con unos 40 ms por imagen en T4, puede analizar en tiempo casi real cintas transportadoras de tomates para monitorizar caudal y detectar incidencias; el conjunto de prueba de cinta transportadora reporta mAP50 de 0,923.
- Clasificacion de madurez como etapa previa: al detectar todos los tomates sin distincion de madurez, sirve como localizador previo para el clasificador de madurez del mismo autor (`tomato-ripeness-classifier-yolo26s`), recortando cada deteccion para su clasificacion posterior.
- Robótica de cosecha: la deteccion precisa (recall del 99 % en Tomato Defects test) puede alimentar sistemas de vision para robots recolectores, aunque los fallos se concentran en tomates pequeños, lejanos o con motion blur.
- Control de calidad en almacenamiento: deteccion de frutos en imagenes de almacenaje para inventariado visual automatico y verificacion de existencias.
- Analisis de video agronomico: procesamiento de grabaciones de campo para estudios de densidad de cultivo y distribucion espacial de frutos, integrando seguimiento mediante el pipeline completo.
- Prototipado rapido de soluciones agritech: el tamaño de 20 MB y la compatibilidad con CPU (~300 ms por imagen) permiten pruebas en portatiles sin GPU dedicada.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre conjuntos de prueba nunca vistos en entrenamiento:

| Test set | Imagenes | Tomates | mAP50 | Recall | Precision |
|---|---:|---:|---:|---:|---:|
| Tomato Defects test | 86 | 768 | 0,988 | 99,0 % | 93,3 % |
| tomato-sxsc7 holdout | 57 | 736 | 0,967 | 93,3 % | 94,8 % |
| Conveyor-belt holdout | 43 | 650 | 0,923 | 84,9 % | 90,0 % |

- mAP50-95 en el Tomato Defects test: 0,919.
- Umbral de confianza recomendado: 0,25 (F1-optimo en validacion: 0,334).
- Los fallos se concentran en tomates pequeños, lejanos o con motion blur.

No se han publicado comparaciones directas con otros detectores (YOLOv8, YOLO11, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible explicitamente; dada la variante small (20 MB de pesos) y la entrada de 640 px, una GPU con 4 GB de VRAM es suficiente en la practica.
- GPU recomendadas: cualquier GPU moderna; el autor reporta ~40 ms por imagen en una NVIDIA T4. GPUs como RTX 3060, RTX 4090 o T4 son adecuadas.
- Consumer GPUs: cabe sobradamente en GPUs de consumo; incluso puede ejecutarse solo en CPU a unos 300 ms por imagen.
- Opciones de despliegue: libreria Ultralytics (Python), descarga de pesos via `huggingface_hub`; al tratarse de pesos `.pt` de Ultralytics, es compatible con el ecosistema estandar de YOLO (exportacion a ONNX/TensorRT no documentada en la model card pero habitual en la libreria).
- Latencia y throughput: ~40 ms/imagen en T4 (aprox. 25 FPS) y ~300 ms/imagen en CPU.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Datos de entrenamiento | Rendimiento | Licencia |
|---|---|---|---|---|---|
| ParsaVictor/tomato-detector-yolo26s | Deteccion de tomates (1 clase) | YOLO26s, 640 px, sin NMS | 5.783 imagenes (6 datasets publicos) | mAP50 0,988 (Tomato Defects) | AGPL-3.0 |
| ParsaVictor/tomato-ripeness-classifier-yolo26s | Clasificacion de madurez | YOLO26s | mismo dataset base | no disponible | AGPL-3.0 |
| Detectores genericos YOLO (YOLOv8s/YOLO11s) | Deteccion multiclase | YOLO variantes | datasets genericos (COCO) | sin especializacion en tomates | AGPL-3.0 (Ultralytics) |

No hay comparativas cuantitativas publicadas frente a otros detectores especificos de frutas en la informacion disponible.

## Limitaciones y advertencias

- Fallos de deteccion concentrados en tomates pequeños, lejanos o con motion blur; el recall baja al 84,9 % en el conjunto de cinta transportadora, posiblemente por estas condiciones.
- Sobre imagenes muy densas pueden aparecer detecciones duplicadas al no usar NMS; se recomienda un filtro de duplicados con IoU > 0,55.
- Detecta una unica clase sin distinguir variedades ni estados del fruto; para madurez se necesita el clasificador complementario.
- Licencia AGPL-3.0: el uso comercial en software de codigo cerrado requiere una licencia Ultralytics Enterprise; el uso en productos derivados obliga a liberar el codigo fuente bajo la misma licencia.
- Los benchmarks proceden de la model card del autor y no han sido verificados de forma independiente; los conjuntos de prueba son pequeños (43-86 imagenes), por lo que las metricas pueden tener alta varianza.
- Modelo de nicho con muy poca adopcion publica (19 descargas y 1 like en el momento de la ficha), sin comunidad de soporte consolidada.
- No hay detalles publicados sobre cuantizacion, exportacion a otros formatos ni rendimiento en plataformas embarcadas (Jetson, Raspberry Pi).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ParsaVictor/tomato-detector-yolo26s
- Pipeline completo (deteccion + madurez + seguimiento + conteo): https://huggingface.co/ParsaVictor/tomato-ripeness-yolo26
- Clasificador de madurez (componente 2): https://huggingface.co/ParsaVictor/tomato-ripeness-classifier-yolo26s
- Dataset: https://huggingface.co/datasets/ParsaVictor/tomato-ripeness-detection
- Codigo en GitHub: https://github.com/ParsaVictor/tomato-ripeness-detection
