# dronefreak/bdd100k-syscv-fcos-r50-fpn-1x

## Resumen

FCOS R50-FPN 1x sobre BDD100K es un detector de objetos de una sola etapa basado en la arquitectura FCOS (Fully Convolutional One-Stage Object Detection, ICCV 2019), con backbone ResNet-50 y cuello FPN. El modelo lo entrenó originalmente el grupo SysCV de la ETH Zurich y lo publicó en su zoo de modelos BDD100K; este repositorio de Hugging Face es un espejo creado por el usuario `dronefreak` que recupera los pesos desde la Wayback Machine, ya que el host original `dl.cv.ethz.ch` está fuera de servicio. El espejo añade un entorno de dependencias fijado y un script de inferencia (`infer.py`) para imagen, vídeo y webcam.

El modelo resuelve detección de objetos en escenas de conducción autónoma sobre las diez clases de BDD100K (peatón, ciclista, coche, camión, autobús, tren, motocicleta, bicicleta, semáforo y señal de tráfico). Con 32.187.087 parámetros y un tamaño de repositorio de 0,6 GB, es un checkpoint compacto pensado para investigación y evaluación comparativa más que para despliegue en producción. La entrada nativa es de 1280 x 720 sin redimensionado.

Su relevancia actual es fundamentalmente práctica: recupera un artefacto de investigación que se había vuelto inaccesible y lo empaqueta con un entorno reproducible (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2). No incorpora capacidades generativas ni de lenguaje; es exclusivamente un detector visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FCOS (one-stage, fully convolutional) con backbone ResNet-50 y cuello FPN |
| Parametros totales | 32.187.087 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y `.pth`; no se documentan variantes GGUF ni INT8) |
| Idiomas soportados | no aplica (modelo de visión; sin capacidades lingüísticas) |
| Licencia | BDD100K (`other`), uso educativo, investigación y sin ánimo de lucro |
| Formato de pesos | safetensors (`model.safetensors`), `.pth` original y `config.json` resumen |

## Arquitectura y entrenamiento

FCOS es un detector denso de una sola etapa que prescinde de anchors y de propuestas de región: predice directamente, por píxel del mapa de características, la clasificación y las distancias a los bordes de la caja, con una rama de centerness para ponderar la calidad de las detecciones. El backbone es ResNet-50 inicializado con pesos ImageNet de Detectron (`open-mmlab://detectron/resnet50_caffe`), sobre el que se construye un FPN que alimenta las cabezas de clasificación y regresión.

El entrenamiento se realizó sobre el split de entrenamiento de BDD100K (70.000 imágenes) durante 12 épocas (esquema 1x), con SGD de tasa de aprendizaje 0,01, weight decay 0,0001, decaimiento en las épocas 8 y 11 y batch de 32 (8 GPU x 4 imágenes, según el README de SysCV). La entrada es de 1280 x 720, el tamaño nativo de BDD100K, sin redimensionado, en RGB con media y desviación típica de ImageNet. En test se aplica umbral de score 0,05, NMS con IoU 0,5 y un máximo de 100 cajas por imagen. No se documenta RLHF, DPO ni ningún tipo de ajuste por preferencias, algo esperable en un detector.

El espejo incluye una verificación de integridad: el MD5 de los pesos (`63e52d3a892b0a9d04040927116149d0`) coincide con el archivo MD5 de SysCV y todas las claves cargan en la configuración original. La reproducibilidad de las detecciones es aproximada, no exacta: sobre 20 imágenes aleatorias de validación, 1734 de las 2000 cajas publicadas por SysCV son idénticas en esta copia en CPU, y 1803 coinciden con IoU >= 0,5; la diferencia máxima de score es 0,0407. El autor declara que la causa no se investigó y que el entorno CUDA no se ha probado.

## Capacidades

- Detección de objetos en imágenes estáticas en las diez clases de BDD100K.
- Detección sobre vídeo frame a frame (el script `infer.py` acepta archivos de vídeo y limita fotogramas con `--max-frames`).
- Inferencia en directo desde webcam (índice de dispositivo, con `--show`).
- Exportación de detecciones en formato BDD100K mediante `--json`.
- Umbral de score configurable (por defecto 0,3) para ajustar el compromiso entre precisión y recall.
- Ejecución en CPU (1,2 s por imagen con 8 hilos) y en GPU (entorno CUDA 11.8 disponible, aunque no validado por el autor).
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto, visión-lenguaje ni capacidades multilingües.

## Casos de uso

- Evaluación comparativa de detectores en BDD100K: sirve como referencia reproducible de un FCOS R50-FPN 1x con métricas AP publicadas (27,7 en validación), útil para contrastar nuevos detectores bajo el mismo protocolo.
- Reproducción de resultados académicos: el entorno fijado (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2) permite reejecutar la inferencia y comparar con los ficheros de predicciones archivados en `original/`.
- Prototipado de pipelines de conducción autónoma: detección de peatones, vehículos y señalización sobre clips de vídeo de BDD100K para construir etapas posteriores de seguimiento o planificación en entornos de investigación.
- Análisis offline de grabaciones de tráfico: procesamiento por lotes de carpetas de imágenes con salida JSON en formato BDD100K, integrable en herramientas de anotación o auditoría.
- Demostraciones interactivas en tiempo real: uso con webcam para visualizar detecciones en directo en un portátil sin GPU, dado el bajo coste computacional del checkpoint.
- Docencia en visión por computador: ejemplo completo de detector one-stage sin anchors con configuración mmdetection, pesos verificados y script de inferencia listo para usar.
- Verificación de integridad de artefactos: caso de estudio de recuperación de pesos desde archivos web y comprobación mediante MD5 e IoU de cajas.

## Benchmarks y rendimiento

Resultados declarados por SysCV (Box AP en porcentaje, estilo COCO, sobre BDD100K; `verified: false` en el model-index):

| Split | AP | AP50 | AP75 | APs | APm | APl |
|---|---|---|---|---|---|---|
| val | 27,7 | 51,6 | 25,3 | 11,0 | 32,7 | 47,7 |
| test | 26,2 | 48,1 | 24,3 | 11,0 | 32,3 | 43,1 |

AP por clase en validación:

| Clase | AP |
|---|---|
| pedestrian | 29,7 |
| rider | 17,4 |
| car | 48,2 |
| truck | 41,3 |
| bus | 43,2 |
| train | 0,0 |
| motorcycle | 17,3 |
| bicycle | 19,3 |
| traffic light | 24,2 |
| traffic sign | 36,3 |

No se han publicado en la información disponible resultados de benchmarks de otros modelos comparables para establecer una tabla cruzada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 32,2 M de parámetros en FP32 los pesos ocupan aproximadamente 129 MB, y la inferencia a 1280 x 720 requiere memoria adicional para activaciones del FPN y las cabezas (estimación no confirmada por el autor).
- GPU recomendadas: no documentadas; el repositorio incluye requisitos para CUDA 11.8 (`env/requirements-cu118.txt`), pero el autor indica que el entorno CUDA no se ha probado.
- CPU: validado, con 1,2 s por imagen usando 8 hilos.
- Cabe en GPU de consumo: previsiblemente sí por tamaño de pesos, aunque no hay medición publicada de VRAM ni de latencia en GPU.
- Opciones de despliegue: mmdetection 2.28.2 con mmcv-full 1.7.2 sobre Python 3.10, instalable con `uv`; script `infer.py` para imagen, carpeta, vídeo o webcam. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Throughput y latencia: 1,2 s/imagen en CPU con 8 hilos; sin datos de GPU.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de parámetros, contexto ni rendimiento de modelos alternativos comparables (por ejemplo, otros detectores del zoo de BDD100K como Faster R-CNN o YOLO entrenados sobre el mismo dataset). Por tanto, la comparativa se marca como no disponible.

| Modelo | Parámetros | Contexto | AP val BDD100K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FCOS R50-FPN 1x (este) | 32,2 M | no aplica | 27,7 | BDD100K (investigación) | Hugging Face (espejo) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento moderado: AP de 27,7 en validación, con clases muy débiles como `rider` (17,4), `motorcycle` (17,3), `bicycle` (19,3) y `train` (0,0, sin detecciones útiles).
- Objetos pequeños problemáticos: APs de 11,0 tanto en validación como en test, lo que limita su uso en escenarios con objetos lejanos.
- Sesgos del dataset: BDD100K está grabado en entornos urbanos y condiciones geográficas concretas; el modelo hereda los sesgos de distribución de esas imágenes (clima, iluminación, países, tipos de vehículo).
- Riesgo de falsos negativos y positivos en condiciones nocturnas o de baja visibilidad, no cuantificado en la información disponible.
- Licencia restrictiva: los pesos derivan de BDD100K y quedan bajo su licencia (`LICENSE.txt`), limitada a uso educativo, investigación y sin ánimo de lucro; el uso comercial requiere revisión legal expresa.
- Reproducibilidad no exacta: las detecciones difieren ligeramente de las publicadas por SysCV (diferencia máxima de score 0,0407); no se investigó la causa.
- Entorno CUDA no validado por el autor; solo se confirma el funcionamiento en CPU.
- Modelo de visión sin capacidades de lenguaje, tool calling ni agentes; no debe presentarse como un modelo de propósito general.
- Repositorio sin descargas ni likes en el momento de la consulta y con un único mantenedor (espejo no oficial), lo que implica riesgo de falta de mantenimiento.
- El autor indica que el vídeo de demostración fue revisado fotograma a fotograma para evitar matrículas legibles y rostros identificables; conviene aplicar precauciones equivalentes con datos propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-fcos-r50-fpn-1x
- Licencia del modelo: https://huggingface.co/dronefreak/bdd100k-syscv-fcos-r50-fpn-1x/blob/main/LICENSE.txt
- Configuración original de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/det/configs/det/fcos_r50_fpn_1x_det_bdd100k.py
- Zoo de modelos BDD100K de SysCV: https://github.com/SysCV/bdd100k-models/tree/main/det
- Paper de FCOS: https://arxiv.org/abs/1904.01355
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
