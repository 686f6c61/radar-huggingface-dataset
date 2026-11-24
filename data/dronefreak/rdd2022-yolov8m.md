# dronefreak/rdd2022-yolov8m

## Resumen

dronefreak/rdd2022-yolov8m es un detector de objetos YOLOv8m afinado sobre el conjunto de datos RDD2022 de daños en carretera, desarrollado por el usuario dronefreak en el marco del proyecto DetectionBench. El modelo parte de los pesos preentrenados de Ultralytics YOLOv8 y se reentrena para localizar cuatro tipos de desperfectos del pavimento: grietas longitudinales, grietas transversales, grietas de piel de cocodrilo y baches. Su propósito es servir como referencia reproducible dentro de un banco de pruebas que compara detectores modernos con recetas de entrenamiento y métricas idénticas.

La arquitectura es una CNN de detección en una sola etapa, con 25,89 millones de parámetros y un coste de 78,9 GFLOPs a 640 píxeles, lo que la sitúa en el rango medio de la familia YOLOv8. No es un modelo de lenguaje: no procesa texto ni mantiene conversaciones, sino que devuelve cajas delimitadoras y etiquetas de clase sobre imágenes de firmes. Su relevancia actual reside en la trazabilidad: el autor publica la configuración de entrenamiento completa, las métricas por clase y una comparativa con otros detectores evaluados bajo el mismo protocolo.

Los resultados declarados en el split de test de RDD2022 son 62,03 % de mAP@50, 34,08 % de mAP@50-95, 65,61 % de precisión y 57,42 % de recall. El modelo se distribuye en formato PyTorch (best.pt) bajo licencia AGPL-3.0 y está pensado para integrarse en pipelines de inspección de infraestructuras y mantenimiento predictivo de carreteras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8m (CNN de deteccion en una etapa, familia Ultralytics YOLO) |
| Parametros totales | 25.891.756 (25,9 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen a 640 px) |
| Tipos de cuantizacion | no disponible (el autor solo publica pesos PyTorch; no se documentan variantes GGUF, ONNX ni INT8) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (best.pt); repositorio con safetensors y tamano de 0,1 GB |
| Framework de inferencia | Ultralytics (libreria ultralytics) |
| Coste computacional | 78,9 GFLOPs a 640 px |
| Tarea | object-detection |
| Clases | longitudinal_crack, transverse_crack, alligator_crack, pothole |
| Dataset de entrenamiento | dronefreak/RDD2022 |
| Modelo base | Ultralytics/YOLOv8 (fine-tune) |

## Arquitectura y entrenamiento

El modelo es un YOLOv8m, la variante media de la familia YOLOv8 de Ultralytics: una red convolucional de una sola etapa con cuello de agregacion de caracteristicas y cabecera de deteccion anclada libremente, que predice cajas y clases directamente en una pasada. Con 25,9 M de parametros y 78,9 GFLOPs a 640 px, ocupa el punto intermedio entre las variantes nano y small, por un lado, y las variantes large y extra-large, por otro, lo que equilibra precision y coste de inferencia.

El entrenamiento se realizo con el toolkit DetectionBench sobre el dataset RDD2022, con un maximo configurado de 50 epocas y 50 epocas efectivamente completadas, paciencia de early stopping de 10, tamano de lote 16, imagenes a 640 px, optimizador Adam, tasa de aprendizaje inicial de 0,001 y semilla 0. No se documentan en la informacion disponible el numero total de tokens ni la composicion exacta del dataset, ni si hubo aumento de datos mas alla del pipeline estandar de Ultralytics; tampoco se menciona RLHF, DPO ni tecnicas de alineacion, que no aplican a un detector de objetos. La innovacion principal del proyecto no es arquitectonica sino metodologica: la publicacion de la receta exacta y de las metricas por clase permite reproducir y comparar el resultado con otros detectores bajo condiciones identicas.

## Capacidades

- Deteccion de objetos en imagenes de carretera con cuatro clases de dano: grietas longitudinales, grietas transversales, grietas de piel de cocodrilo y baches.
- Localizacion con cajas delimitadoras y puntuaciones de confianza por clase, apta para umbrales configurables (por ejemplo, conf=0,25 en el ejemplo de la model card).
- Inferencia sobre imagenes individuales o lotes mediante la API `model.predict` de Ultralytics.
- Entrenamiento e inferencia con el ecosistema Ultralytics, lo que facilita exportar a otros formatos compatibles con la libreria (no documentados por el autor en esta ficha).
- Capacidad multilingue: no aplica; el modelo no procesa texto.
- Tool calling, function calling, agentes y razonamiento multi-paso: no aplica; es un detector visual puro.
- No dispone de modo thinking, vision general, audio ni generacion de texto.

## Casos de uso

- Inspeccion automatizada de firmes con vehiculos equipados con camara: el modelo procesa fotogramas a 640 px y devuelve cajas de grietas y baches, lo que permite inventariar el estado del pavimento sin revision manual. Su coste de 78,9 GFLOPs lo hace viable en tiempo casi real sobre GPU de gama media.
- Mantenimiento predictivo de carreteras: integrado en un pipeline que agrega detecciones por tramo, se pueden priorizar reparaciones segun la densidad de baches y grietas de piel de cocodrilo, la clase con mejor mAP@50 (74,15 %).
- Sistemas de alerta para conduccion asistida: la deteccion de baches con confianza alta puede alimentar avisos de peligro o mapas de calidad de via, aunque el modelo no sustituye a un sistema de percepcion completo.
- Auditoria y control de calidad de obras: comparar detecciones antes y despues de una reparacion para verificar que las grietas tratadas desaparecen de la imagen.
- Investigacion y benchmarking reproducible: al estar entrenado con DetectionBench y publicar la receta completa, sirve como linea base para comparar nuevos detectores sobre RDD2022 con las mismas metricas.
- Procesamiento por lotes de imagenes de dron o de inventario municipal: el modelo admite lotes en `predict` y su tamano reducido (0,1 GB de repositorio) facilita desplegarlo en servidores modestos.
- Generacion de datasets etiquetados de forma asistida: usar las detecciones como preetiquetado para revision humana en proyectos de anotacion de dano viario.

## Benchmarks y rendimiento

Resultados declarados por el autor en el split de test de RDD2022, evaluados con el pipeline estandar de DetectionBench (`detectionbench-evaluate`). Las metricas no estan verificadas de forma independiente (verified: false en el model-index).

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 62,03 |
| mAP@50-95 | 34,08 |
| Precision | 65,61 |
| Recall | 57,42 |
| F1 Score | 61,24 |

Rendimiento por clase:

| Clase | mAP@50 (%) | mAP@50-95 (%) |
|---|---|---|
| longitudinal_crack | 55,97 | 30,69 |
| transverse_crack | 55,52 | 26,60 |
| alligator_crack | 62,50 | 32,91 |
| pothole | 74,15 | 46,12 |

Comparativa del zoo de modelos del autor sobre el mismo dataset:

| Modelo | mAP@50 (%) | mAP@50-95 (%) | Precision (%) | Recall (%) |
|---|---|---|---|---|
| RF-DETR Medium | 65,08 | 36,02 | 71,18 | 55,98 |
| RF-DETR Small | 64,71 | 35,73 | 65,69 | 59,41 |
| YOLOv8m (este modelo) | 62,03 | 34,08 | 65,61 | 57,42 |
| YOLOv8s | 61,45 | 33,53 | 64,55 | 57,18 |
| YOLO26s | 61,27 | 33,30 | 64,42 | 57,13 |
| YOLO26m | 61,24 | 33,38 | 63,70 | 57,27 |
| RF-DETR Nano | 60,85 | 33,22 | 65,49 | 54,30 |
| YOLOv8n | 58,80 | 32,05 | 62,03 | 56,08 |
| YOLO11x | 51,05 | 26,54 | 56,64 | 49,54 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada. Como referencia de orden de magnitud para un detector de 25,9 M de parametros en FP32, los pesos ocupan aproximadamente 100 MB, por lo que el consumo dominante es el de las activaciones y el lote de imagenes a 640 px; con lotes pequenos cabe holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: no documentadas por el autor. Por coste computacional (78,9 GFLOPs por imagen a 640 px), una GPU consumer moderna (RTX 3060 o superior) es suficiente para inferencia interactiva; para entrenamiento o lotes grandes se recomienda una GPU de datacenter (A100, H100) o una RTX 4090.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con 4 GB o mas de VRAM para inferencia con lotes pequenos; el dato exacto no esta publicado.
- Opciones de despliegue: Ultralytics (libreria oficial, `YOLO(weights).predict`), descarga de pesos via `huggingface_hub.hf_hub_download`. El autor no documenta exportaciones a ONNX, TensorRT, OpenVINO ni integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Comparativa con alternativas del mismo zoo, evaluadas sobre RDD2022 con el mismo protocolo:

| Modelo | Parametros | mAP@50 (%) | mAP@50-95 (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLOv8m (este modelo) | 25,9 M | 62,03 | 34,08 | AGPL-3.0 | Hugging Face (dronefreak/rdd2022-yolov8m) |
| YOLOv8s | no disponible | 61,45 | 33,53 | AGPL-3.0 (licencia de Ultralytics) | zoo de DetectionBench |
| YOLOv8n | no disponible | 58,80 | 32,05 | AGPL-3.0 (licencia de Ultralytics) | zoo de DetectionBench |
| RF-DETR Small | no disponible | 64,71 | 35,73 | no disponible | zoo de DetectionBench |
| RF-DETR Medium | no disponible | 65,08 | 36,02 | no disponible | zoo de DetectionBench |
| YOLO11x | no disponible | 51,05 | 26,54 | AGPL-3.0 (licencia de Ultralytics) | zoo de DetectionBench |

Frente a las variantes YOLOv8s y YOLOv8n, este modelo gana entre 0,6 y 3,2 puntos de mAP@50 a cambio de un mayor coste computacional. Frente a RF-DETR Small y Medium, pierde entre 2,7 y 3,1 puntos de mAP@50, aunque mantiene una precision competitiva y una licencia conocida. El dato de YOLO11x (51,05 % de mAP@50) resulta llamativamente bajo en este protocolo y conviene tratarlo con cautela, ya que el autor no ofrece explicacion en la informacion disponible.

## Limitaciones y advertencias

- El modelo solo detecta cuatro clases de dano viario; no es un detector de objetos generico ni un modelo de lenguaje, por lo que no puede usarse para tareas de texto, razonamiento o vision general.
- Riesgo de falsos negativos: el recall es del 57,42 %, de modo que una parte significativa de los danos reales no se detecta con el umbral por defecto; en produccion conviene ajustar el umbral de confianza y validar sobre datos propios.
- Las grietas transversales son la clase mas debil (mAP@50 de 55,52 % y mAP@50-95 de 26,60 %), por lo que su deteccion en imagenes con ruido, sombras o baja resolucion puede degradarse.
- Las metricas declaradas no estan verificadas de forma independiente (verified: false); proceden del propio autor y del pipeline de su framework.
- No se documentan sesgos especificos ni la composicion geografica del dataset RDD2022 en la informacion disponible; el rendimiento puede no generalizar a paises, climas o tipos de firme no representados en el entrenamiento.
- Licencia AGPL-3.0: el uso comercial en servicios en red puede obligar a liberar el codigo fuente derivado; conviene revisar las implicaciones antes de desplegarlo en productos propietarios.
- El autor no publica datos de latencia, throughput, cuantizacion ni exportaciones a formatos de despliegue, lo que limita la planificacion de capacidad en produccion.
- El repositorio tiene 393 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/rdd2022-yolov8m
- Dataset en Hugging Face: https://huggingface.co/datasets/dronefreak/RDD2022
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Paper de referencia (RDD2022, arXiv:2209.08538): https://arxiv.org/abs/2209.08538
- Ultralytics YOLOv8: https://github.com/ultralytics/ultralytics
- Documentacion de Ultralytics: https://docs.ultralytics.com/
