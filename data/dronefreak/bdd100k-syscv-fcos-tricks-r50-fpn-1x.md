# dronefreak/bdd100k-syscv-fcos-tricks-r50-fpn-1x

## Resumen

FCOS R50-FPN (tricks) 1x sobre BDD100K es un detector de objetos de una etapa basado en la arquitectura FCOS (*Fully Convolutional One-Stage Object Detection*, ICCV 2019), con backbone ResNet-50 y cuello FPN. El modelo original fue entrenado por el grupo SysCV (ETH Zurich) como parte de su *model zoo* de referencia para BDD100K, el conjunto de datos de conducción autónoma con 70 000 imágenes de entrenamiento etiquetadas con diez clases de tráfico. Este repositorio de Hugging Face no es el original: es un espejo creado por el usuario `dronefreak` que recupera los pesos desde la Wayback Machine (captura del 19 de febrero de 2025) ante la caída del host `dl.cv.ethz.ch`, y los acompaña de un entorno fijado y un script de inferencia.

El modelo resuelve detección de objetos en escenas de conducción: peatones, ciclistas, coches, camiones, autobuses, trenes, motocicletas, bicicletas, semáforos y señales de tráfico. Su relevancia actual es fundamentalmente práctica y reproducible: proporciona un *baseline* canónico de FCOS sobre BDD100K con pesos verificados por MD5, útil para comparaciones, para reproducir resultados académicos y como punto de partida para *fine-tuning* en dominios de conducción.

Arquitectura convolucional de una etapa, 32 189 135 parámetros, entrada nativa de 1280 x 720 píxeles sin reescalado, y licencia BDD100K restringida a uso educativo, de investigación y sin ánimo de lucro. El repositorio ocupa 0,4 GB e incluye pesos en `safetensors` y `.pth`, configuración de mmdetection y predicciones de validación archivadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FCOS (one-stage, fully convolutional) con backbone ResNet-50 y FPN |
| Parametros totales | 32 189 135 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 1280 x 720) |
| Tipos de cuantizacion | no disponible (pesos en FP32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de visión, sin componente lingüístico) |
| Licencia | BDD100K (`license: other`, uso educativo, investigación y sin ánimo de lucro); la configuración de SysCV es Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y `.pth`; configuración en Python para mmdetection |
| Entrada | 1280 x 720 RGB, media y desviación típica de ImageNet, sin redimensionado |
| Post-proceso | umbral de score 0,05, NMS con IoU 0,6, máximo 100 cajas por imagen |
| Clases | 10: pedestrian, rider, car, truck, bus, train, motorcycle, bicycle, traffic light, traffic sign |
| Framework | mmdetection 2.28.2, mmcv-full 1.7.2, PyTorch 2.0.1, Python 3.10 |
| MD5 de pesos | `e189011dbee8695c57b0ddf213ade348` |

## Arquitectura y entrenamiento

FCOS es un detector de una sola etapa que prescinde de anclas (*anchor-free*): predice directamente la distancia desde cada posición del mapa de características hasta los cuatro bordes de la caja, junto con una puntuación de centerness y la clase. El backbone es ResNet-50 inicializado con pesos ImageNet de Detectron2 (`open-mmlab://detectron2/resnet50_caffe`), sobre el que se construye un FPN que genera predicciones en varios niveles de resolución. La variante "tricks" incorpora las mejoras del artículo original de FCOS (centerness, *GIoU loss*, normalización por número de puntos positivos, entre otras).

El entrenamiento se realizó sobre el split de entrenamiento de BDD100K (70 000 imágenes) durante 12 épocas (protocolo 1x), con SGD de momento, tasa de aprendizaje 0,01, *weight decay* 0,0001, decaimiento en las épocas 8 y 11, y batch de 32 (8 GPU x 4 imágenes, según el README de SysCV). No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un detector supervisado. La entrada se mantiene en la resolución nativa de BDD100K (1280 x 720) sin reescalado, lo que preserva la relación de aspecto original del dataset.

## Capacidades

- Detección de objetos en imágenes individuales en diez clases de tráfico urbano.
- Procesamiento de vídeo: el script `infer.py` acepta ficheros de vídeo y limita opcionalmente el número de fotogramas con `--max-frames`.
- Inferencia en directo desde webcam (`python infer.py 0 --show`).
- Salida en formato BDD100K mediante `--json out.json`, lista para evaluación con las herramientas oficiales del dataset.
- Umbral de confianza configurable (`--score-thr`, por defecto 0,3) para ajustar el equilibrio entre precisión y exhaustividad.
- Ejecución en CPU y en GPU (entornos `requirements-cpu.txt` y `requirements-cu118.txt`).
- Carga segura de pesos con `torch.load(weights_only=True)`.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Reproducción de resultados académicos: cargar el checkpoint con la configuración de SysCV y evaluar el split de validación de BDD100K para contrastar el AP reportado (26,6) y el AP50 (49,0), con la ventaja de que los pesos están verificados por MD5 frente al original.
- Baseline para *fine-tuning* en dominios de conducción: partir de estos pesos e reentrenar sobre un dataset propio de tráfico (por ejemplo, cámaras de una flota) para adaptar las diez clases a las necesidades de un proyecto, aprovechando la inicialización en escenas de conducción.
- Preetiquetado de datos (*auto-labeling*): usar el modelo para generar cajas candidatas sobre imágenes nuevas y revisarlas manualmente, reduciendo el coste de anotación en pipelines de datos de visión.
- Análisis de vídeo de tráfico: procesar grabaciones de cámaras de vigilancia o *dashcams* con `infer.py` y exportar las detecciones en JSON para calcular conteos de peatones o vehículos por fotograma y alimentar analítica de movilidad.
- Prototipos de sistemas ADAS: validar la viabilidad de un detector ligero (32 M de parámetros) en escenas diurnas y nocturnas antes de invertir en modelos mayores; el *demo banner* del repositorio muestra detecciones sobre clips de día y de noche.
- Docencia y experimentación: entorno reproducible con versiones fijadas (PyTorch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2) para prácticas de detección de objetos con mmdetection sin depender de descargas inestables.
- Comparación de arquitecturas: servir como referencia FCOS frente a otros detectores del *model zoo* de SysCV (Faster R-CNN, RetinaNet, etc.) sobre el mismo dataset y protocolo de evaluación.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (procedentes de los ficheros de puntuaciones de SysCV, no verificados caja por caja):

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 26,6 | 49,0 | 24,9 | 11,5 | 31,9 | 44,8 |
| test | 24,8 | 45,1 | 23,2 | 11,4 | 31,3 | 39,2 |

AP por clase en validación:

| Clase | AP |
|---|---|
| pedestrian | 30,0 |
| rider | 17,8 |
| car | 49,4 |
| truck | 38,6 |
| bus | 36,3 |
| train | 0,0 |
| motorcycle | 15,0 |
| bicycle | 17,0 |
| traffic light | 25,2 |
| traffic sign | 36,7 |

No se han publicado en la información disponible resultados comparativos con otros modelos en una tabla común; los datos anteriores son los únicos benchmarks oficiales del repositorio.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 32 M de parámetros en FP32 los pesos ocupan aproximadamente 129 MB, por lo que la inferencia a 1280 x 720 cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA 11.8; el entorno está probado con `requirements-cu118.txt`. No se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: sí, cabe en tarjetas de gama media y baja (por ejemplo, GTX 1650 o superiores) e incluso en CPU, aunque el autor no publica cifras de latencia.
- Despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2 sobre PyTorch 2.0.1 y Python 3.10; script `infer.py` para imagen, carpeta, vídeo o webcam. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector de este tipo).
- Latencia y throughput: no disponibles. El autor indica que el entorno CUDA no ha sido probado todavía y que el *demo banner* se generó en CPU con umbral de score 0,3.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros detectores sobre BDD100K con los que comparar de forma rigurosa. Como referencia estructural, el propio *model zoo* de SysCV incluye otras familias (Faster R-CNN, RetinaNet, entre otras) entrenadas con el mismo protocolo, pero sus cifras no se han facilitado en esta ficha.

| Modelo | Parámetros | Contexto/entrada | AP val BDD100K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FCOS R50-FPN tricks 1x (este) | 32,2 M | 1280 x 720 | 26,6 | BDD100K (no comercial) | Hugging Face (espejo) |
| Otros detectores de SysCV | no disponible | no disponible | no disponible | Apache-2.0 (config) | GitHub SysCV / Wayback |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia restrictiva: los pesos derivan de BDD100K y quedan sujetos a su licencia (uso educativo, investigación y sin ánimo de lucro). El uso comercial requiere autorización expresa; la configuración de SysCV es Apache-2.0, pero eso no cubre los pesos entrenados.
- Clase `train` con AP 0,0 en validación: el modelo no detecta trenes de forma fiable, probablemente por la baja frecuencia de esa clase en el dataset.
- Rendimiento modesto en clases minoritarias: `motorcycle` (15,0), `bicycle` (17,0) y `rider` (17,8) quedan muy por debajo de `car` (49,4); el AP global de 26,6 es bajo para estándares actuales y limita su uso en producción sin *fine-tuning*.
- Objetos pequeños: APs de 11,5 en validación indica dificultades con instancias de baja área, habituales en escenas de tráfico a distancia.
- Verificación parcial: SysCV no archivó las predicciones caja por caja de este modelo, por lo que los resultados no han sido revalidados; además, el entorno CUDA no se ha probado.
- Sesgos del dataset: BDD100K está capturado principalmente en entornos urbanos de Estados Unidos; el rendimiento puede degradarse en otras geografías, condiciones meteorológicas extremas o cámaras con parámetros distintos.
- Dependencia de versiones antiguas: requiere mmdetection 2.x y mmcv-full 1.7.2, sin compatibilidad con las versiones actuales de mmdetection 3.x; conviene usar un entorno virtual aislado.
- Riesgo de falsos positivos y negativos: el umbral por defecto de 0,3 en `infer.py` no está calibrado para todas las aplicaciones; en producción debe ajustarse y validarse con datos propios.
- Sin capacidades de texto ni razonamiento: no es un modelo de lenguaje y no puede emplearse en tareas de VQA, *captioning* ni agentes.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-fcos-tricks-r50-fpn-1x
- Licencia (LICENSE.txt): https://huggingface.co/dronefreak/bdd100k-syscv-fcos-tricks-r50-fpn-1x/blob/main/LICENSE.txt
- Configuración de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/fcos_tricks_r50_fpn_1x_det_bdd100k.py
- Model zoo de SysCV (detección): https://github.com/SysCV/bdd100k-models/tree/main/det
- Artículo FCOS (arXiv): https://arxiv.org/abs/1904.01355
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
- Página oficial de BDD100K: https://bdd-data.berkeley.edu/
