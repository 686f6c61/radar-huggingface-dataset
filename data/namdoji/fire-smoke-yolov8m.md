# Namdoji/fire-smoke-yolov8m

## Resumen

Namdoji Fire & Smoke YOLOv8m es un modelo de deteccion de objetos basado en la arquitectura YOLOv8 en su variante "m" (medium), desarrollado por el usuario Namdoji y publicado en Hugging Face bajo licencia AGPL-3.0. El modelo esta especializado en la deteccion de dos clases concretas: humo ("smoke") e incendio ("fire"), lo que lo orienta a tareas de vigilancia temprana de incendios, monitorizacion de infraestructuras criticas y sistemas de alerta automatica.

Se trata de un ajuste fino del modelo YOLOv8m de Ultralytics sobre el dataset `sayedgamal99/smoke-fire-detection-yolo`, disponible en Kaggle. El repositorio ocupa 0,2 GB y emplea la libreria `ultralytics` como framework de inferencia, lo que facilita su integracion en pipelines Python existentes.

El modelo reporta metricas razonables para una tarea de deteccion binaria especializada (mAP@0.5 de 0,7948 y mAP@0.5:0.95 de 0,4670), aunque con un recall moderado (0,7264) que conviene tener en cuenta en aplicaciones de seguridad critica. Su interes practico radica en ser un punto de partida ligero y facil de desplegar para sistemas de deteccion temprana de fuego en imagenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8m (ultralytics), detector de objetos one-stage |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | no disponible (repositorio gestionado por ultralytics, presumiblemente `.pt`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLOv8 en su variante medium, una red neuronal convolucional de deteccion de objetos de una sola etapa (one-stage) que predice simultaneamente cajas delimitadoras y clases en una unica pasada. YOLOv8 incorpora un backbone CSPDarknet modificado, un cuello de red tipo PAN-FPN y una cabeza de deteccion desacoplada (decoupled head) con asignacion dinamica de etiquetas, lo que equilibra precision y velocidad de inferencia.

El entrenamiento se realizo mediante ajuste fino sobre el dataset `sayedgamal99/smoke-fire-detection-yolo`, con dos clases (`smoke` y `fire`). No se detalla en la informacion disponible el numero de imagenes, la composicion exacta del dataset, el numero de epochs ni las tecnicas de aumento de datos empleadas. Tampoco se indica si se partio de pesos preentrenados en COCO ni los hiperparametros concretos del ajuste.

## Capacidades

- Deteccion de objetos en imagenes con dos clases: humo (`smoke`, id 0) e incendio (`fire`, id 1).
- Prediccion de cajas delimitadoras con puntuaciones de confianza por deteccion.
- Inferencia sobre imagenes individuales mediante la API de `ultralytics` (`model("imagen.jpg")`).
- Integracion con el ecosistema Ultralytics: entrenamiento, validacion y exportacion a formatos como ONNX, TensorRT o TorchScript (segun la libreria, aunque no se documenta en la model card).
- Procesamiento de imagen, no soporta texto, audio ni tool calling.
- No dispone de capacidades multilingues ni de razonamiento multi-paso.

## Casos de uso

- Vigilancia de incendios forestales: el modelo puede ejecutarse sobre fotogramas capturados por camaras torre o drones para detectar columnas de humo tempranas, aprovechando su rapida inferencia y su entrenamiento especifico en la clase `smoke`.
- Monitorizacion industrial de plantas y almacenes: integrado en un pipeline de vision por computador, permite alertar sobre presencia de humo o fuego en zonas de riesgo, reduciendo el tiempo de respuesta frente a sensores termicos tradicionales.
- Deteccion en imagenes satelitales o aereas: al ser un detector de objetos generico, puede aplicarse a imagenes de teledeteccion para identificar focos de incendio, aunque conviene validar su rendimiento en ese dominio concreto.
- Sistemas de alerta en edificios e infraestructuras: combinado con camaras IP y un servicio de inferencia (por ejemplo, TorchServe o un contenedor con Ultralytics), puede generar alertas automaticas cuando la confianza supera un umbral configurable.
- Analisis forense y post-incendio: util para procesar grandes volumenes de imagenes historicas y etiquetar automaticamente la presencia de humo o fuego con fines de investigacion.
- Demo interactiva y prototipado: el autor publica un Space de Hugging Face (`PCCC-yolo`) donde el usuario sube una imagen, ajusta el nivel de confianza y obtiene las detecciones resaltadas, lo que sirve como base para validar el modelo antes de integrarlo en produccion.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| mAP@0.5 | 0,7948 |
| mAP@0.5:0.95 | 0,4670 |
| Precision | 0,7932 |
| Recall | 0,7264 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- Al tratarse de YOLOv8m, el modelo es ligero y cabe en GPUs de consumo, aunque no se dispone del numero exacto de parametros ni de la VRAM estimada en la informacion proporcionada.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (por ejemplo, RTX 3060 en adelante) es suficiente para inferencia en tiempo real; tambien puede ejecutarse en CPU, con mayor latencia.
- Despliegue posible mediante la libreria `ultralytics` en Python, y presumiblemente mediante exportacion a ONNX, TensorRT u otros formatos soportados por Ultralytics (no documentado en la model card).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mAP@0.5 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Namdoji Fire & Smoke YOLOv8m | no disponible | imagen | 0,7948 | AGPL-3.0 | Hugging Face |
| YOLOv8m base (Ultralytics) | no disponible | imagen | no aplica (COCO, 80 clases) | AGPL-3.0 | Ultralytics / Hugging Face |
| YOLOv8n / YOLOv8s (variantes mas ligeras) | no disponible | imagen | no disponible para esta tarea | AGPL-3.0 | Ultralytics |

No se dispone de datos de benchmarks de modelos alternativos especificos para deteccion de fuego y humo en la informacion proporcionada.

## Limitaciones y advertencias

- El recall de 0,7264 implica que aproximadamente un 27 % de los objetos reales pueden no detectarse, lo que es critico en aplicaciones de seguridad donde un falso negativo puede tener consecuencias graves.
- No se documenta el dataset de entrenamiento (tamano, diversidad, condiciones de iluminacion, sesgos geograficos), por lo que el rendimiento fuera del dominio de entrenamiento es incierto.
- Riesgo de falsos positivos ante elementos visualmente similares al humo (niebla, vapor, polvo) o al fuego (luces intensas, reflejos).
- La licencia AGPL-3.0 impone obligaciones copyleft fuertes: el uso comercial en servicios en red puede requerir la publicacion del codigo fuente derivado. Conviene revisar con asesoria legal antes de integrarlo en productos propietarios.
- El modelo solo detecta dos clases y no proporciona segmentacion ni estimacion de propagacion del fuego.
- No hay informacion sobre sesgos demograficos ni de otro tipo, aunque al ser un detector de objetos no procesa personas de forma directa.
- El repositorio tiene muy pocas descargas (110) y cero "likes", lo que sugiere escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Namdoji/fire-smoke-yolov8m
- Demo (Space): https://huggingface.co/spaces/Namdoji/PCCC-yolo
- Dataset de entrenamiento: https://www.kaggle.com/datasets/sayedgamal99/smoke-fire-detection-yolo
- Framework Ultralytics (YOLOv8): https://github.com/ultralytics/ultralytics
