# dronefreak/bdd100k-syscv-atss-r50-fpn-dyhead-3x

## Resumen

El modelo `dronefreak/bdd100k-syscv-atss-r50-fpn-dyhead-3x` es un detector de objetos de una etapa (ATSS) con backbone ResNet-50, FPN y cabeza DyHead, entrenado sobre el conjunto de datos BDD100K para detección en escenas de conducción. No es un modelo de lenguaje: es un checkpoint de visión por computador empaquetado para la librería `mmdetection` y publicado como espejo del zoo de modelos de SysCV (ETH Zurich), cuyo host original `dl.cv.ethz.ch` está fuera de servicio. Los pesos se recuperaron a partir de una captura de Wayback Machine del 19 de febrero de 2025.

El checkpoint resuelve la detección de diez clases de tráfico (peatón, ciclista, coche, camión, autobús, tren, motocicleta, bicicleta, semáforo y señal de tráfico) sobre imágenes de 1280 x 720, el tamaño nativo de BDD100K y sin reescalado. La relevancia actual es práctica: el repositorio añade un entorno fijado (Python 3.10, PyTorch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2) y un script de inferencia que permite reproducir el modelo sin depender de infraestructura caída, algo poco habitual en checkpoints antiguos de mmdetection 2.x.

El modelo tiene 38.963.447 parámetros, un tamaño de repositorio de 1,0 GB y declara un Box AP de 34,56 en el split de validación de BDD100K. Su licencia es la de BDD100K, restringida a uso educativo, de investigación y sin ánimo de lucro, lo que condiciona cualquier despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de una etapa ATSS con backbone ResNet-50, FPN y cabeza DyHead (Dynamic Head, CVPR 2021) |
| Parametros totales | 38.963.447 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión; entrada de imagen 1280 x 720) |
| Tipos de cuantizacion | No disponible (solo se documentan pesos en safetensors y `.pth` en precisión original) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | BDD100K (`license: other`, `license_name: bdd100k`), uso educativo, de investigación y sin ánimo de lucro; la configuración de SysCV es Apache-2.0 |
| Formato de pesos | `model.safetensors` (mismos tensores que el `.pth` original), más `config.json` y `original_config.py` |

## Arquitectura y entrenamiento

La arquitectura sigue el paradigma de detección de una etapa: ATSS (Adaptive Training Sample Selection) como asignador de muestras positivas y negativas, backbone ResNet-50 inicializado con pesos de ImageNet (`torchvision://resnet50`), un cuello FPN y una cabeza de detección DyHead que unifica las atenciones de escala, espacio y tarea sobre los mapas de características. La entrada es de 1280 x 720 en RGB con la media y desviación típica de ImageNet, sin reescalado respecto al tamaño nativo de BDD100K.

El entrenamiento se realizó sobre las 70.000 imágenes del split de entrenamiento de BDD100K durante 36 épocas (programación 3x), con SGD de tasa de aprendizaje 0,02, weight decay 0,0001, decaimiento de la tasa en las épocas 24 y 33, batch de 32 (8 GPU x 4 imágenes) y entrenamiento multi-escala con seis escalas entre (1280, 600) y (1280, 720). En inferencia se aplica un umbral de puntuación de 0,05, NMS con IoU 0,6 y un máximo de 100 cajas por imagen, con un coste de 5,0 s por imagen sobre 8 hilos de CPU.

## Capacidades

- Detección de objetos en escenas de conducción para diez clases: peatón, ciclista, coche, camión, autobús, tren, motocicleta, bicicleta, semáforo y señal de tráfico.
- Procesamiento de imágenes sueltas, carpetas de imágenes, vídeo y cámara web en directo mediante el script `infer.py`.
- Salida en formato BDD100K mediante la opción `--json`, apta para evaluación con las herramientas oficiales del dataset.
- Control del umbral de puntuación (`--score-thr`, por defecto 0,3) y del número máximo de fotogramas procesados (`--max-frames`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No incluye modo de razonamiento, visión-lenguaje ni audio.

## Casos de uso

- Evaluación y reproducción de resultados académicos: sirve como referencia fija del zoo de SysCV para comparar nuevas propuestas de detección sobre BDD100K, ya que los pesos coinciden con los publicados (MD5 verificado) y la configuración está fijada en el repositorio.
- Etiquetado asistido de nuevos conjuntos de datos de conducción: ejecutando `infer.py` sobre carpetas de imágenes con salida `--json` en formato BDD100K se generan preanotaciones que reducen el coste de anotación manual antes de la revisión humana.
- Análisis de vídeo de tráfico grabado: el script acepta ficheros de vídeo y aplica detección fotograma a fotograma con umbral configurable, útil para auditorías de seguridad vial o estudios de flujo de vehículos y peatones.
- Prototipado en CPU sin GPU: con 5,0 s por imagen en 8 hilos de CPU y un entorno de requisitos específico (`requirements-cpu.txt`), permite validar pipelines de detección en estaciones de trabajo sin acelerador.
- Pruebas de robustez día/noche: el modelo está entrenado sobre BDD100K, que incluye condiciones de iluminación diversas; el repositorio incluye una demo comparativa de clips diurnos y nocturnos, lo que facilita analizar el comportamiento en condiciones adversas.
- Docencia y formación en visión por computador: el entorno fijado y el script de inferencia autocontenido permiten montar prácticas reproducibles sobre detección de objetos con mmdetection 2.x sin resolver dependencias conflictivas.

## Benchmarks y rendimiento

Resultados declarados por SysCV en la model card (Box AP estilo COCO, en porcentaje, sobre BDD100K):

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 34,6 | 59,5 | 33,6 | 16,3 | 39,8 | 55,8 |
| test | 33,8 | 57,5 | 33,6 | 16,6 | 40,4 | 51,7 |

AP por clase en validación:

| Clase | AP |
|---|---|
| Peatón | 37,9 |
| Ciclista | 26,8 |
| Coche | 54,2 |
| Camión | 50,3 |
| Autobús | 51,6 |
| Tren | 0,3 |
| Motocicleta | 25,1 |
| Bicicleta | 28,3 |
| Semáforo | 29,0 |
| Señal de tráfico | 42,2 |

El autor indica que la verificación es "cercana, no exacta": sobre 20 imágenes aleatorias de validación, 1958 de las 1959 cajas publicadas por SysCV son idénticas en esta copia ejecutada en CPU, con una diferencia máxima de puntuación de 0,0000; la causa no se investigó. El MD5 de los pesos (`1214f9d71e3c4bc4267241f5ad2d3934`) coincide con el fichero MD5 de SysCV y todas las claves cargan en su configuración. El entorno CUDA no se ha probado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita en la información proporcionada. Con 38,96 M de parámetros en FP32, los pesos ocupan aproximadamente 156 MB; el consumo real depende de las activaciones a 1280 x 720 y del backend.
- GPU recomendadas: no especificadas por el autor; el repositorio incluye un entorno CUDA 11.8 (`env/requirements-cu118.txt`) y advierte de que el entorno CUDA no se ha probado.
- CPU: validado con 5,0 s por imagen sobre 8 hilos, con entorno específico (`env/requirements-cpu.txt`).
- Cabe en GPU consumer: previsiblemente sí por tamaño de pesos, pero no hay medición publicada de VRAM ni de latencia en GPU en la información disponible.
- Despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2 y PyTorch 2.0.1 sobre Python 3.10. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Throughput: no disponible; solo se reporta el coste de 5,0 s por imagen en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ATSS R50-FPN DyHead 3x (este) | 38,96 M | Imagen 1280 x 720 | Box AP val 34,6; test 33,8 | BDD100K (no comercial) | Hugging Face, espejo verificado |
| Otros detectores del zoo SysCV (Faster R-CNN, RetinaNet, etc.) | No disponible | No disponible | No disponible en la información proporcionada | BDD100K | Host original `dl.cv.ethz.ch` fuera de servicio |
| Alternativas genéricas tipo YOLO o DETR | No disponible | No disponible | No disponible en la información proporcionada | Varía según modelo | No evaluadas en esta ficha |

No se dispone de datos comparativos de otros detectores sobre BDD100K en la información proporcionada; la comparación cuantitativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos derivan de BDD100K y quedan bajo su licencia, limitada a uso educativo, de investigación y sin ánimo de lucro; el uso comercial requiere revisión legal expresa.
- Clase "tren" prácticamente no detectada: AP de 0,3 en validación, lo que hace inviable su uso para esa categoría.
- Rendimiento modesto en clases pequeñas: APs de 16,3 y AP de ciclista de 26,8 y de motocicleta de 25,1 indican dificultades con objetos de pequeño tamaño y clases poco representadas.
- Sesgos del dataset: BDD100K está sesgado geográficamente (escenas de conducción de determinadas regiones) y por condiciones de captura; el modelo puede degradarse en entornos no representados.
- Riesgo de falsos negativos y positivos: el umbral por defecto de 0,3 en el script de inferencia es una elección del empaquetador, no del entrenamiento; en producción conviene calibrarlo por clase.
- Verificación incompleta: la reproducibilidad se comprobó solo en CPU y sobre 20 imágenes; el entorno CUDA no está probado y la diferencia de una caja frente a las predicciones de SysCV no se ha investigado.
- Dependencias antiguas: requiere mmdetection 2.x y mmcv-full 1.7.2, sin soporte de versiones modernas de PyTorch; conviene usar un entorno virtual aislado.
- Sin datos de sesgo demográfico ni de robustez más allá de la demo día/noche incluida en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-atss-r50-fpn-dyhead-3x
- Licencia BDD100K del repositorio: https://huggingface.co/dronefreak/bdd100k-syscv-atss-r50-fpn-dyhead-3x/blob/main/LICENSE.txt
- Zoo de modelos de SysCV (detección): https://github.com/SysCV/bdd100k-models/tree/main/det
- Configuración de SysCV usada: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/atss_r50_fpn_dyhead_3x_det_bdd100k.py
- Paper de DyHead (Dynamic Head, CVPR 2021): https://arxiv.org/abs/2106.08322
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
