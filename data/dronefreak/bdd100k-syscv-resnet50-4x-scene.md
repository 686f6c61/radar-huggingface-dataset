# dronefreak/bdd100k-syscv-resnet50-4x-scene

## Resumen

`dronefreak/bdd100k-syscv-resnet50-4x-scene` es un espejo (mirror) de un clasificador de escenas de conducción del zoo de modelos de SysCV (ETH Zurich), recuperado del archivo Wayback Machine después de que el host original `dl.cv.ethz.ch` dejase de estar disponible. El modelo asigna a cada imagen de conducción una de siete etiquetas de escena: túnel, residencial, aparcamiento, indefinida, calle urbana, gasolinera y autopista. Está entrenado sobre el conjunto de datos BDD100K y se distribuye con un entorno fijado y un script de inferencia propio.

Arquitectónicamente es una ResNet-50 clásica (23,57 millones de parámetros) con una cabeza `LinearClsHead` de MMClassification, sin pesos preentrenados en el backbone según la configuración original. Recibe un recorte central de 640 x 640 píxeles de la imagen a resolución completa, sin redimensionado, y opera sobre RGB con media y desviación típica de ImageNet.

Su relevancia es práctica más que arquitectónica: se trata de un checkpoint de referencia para etiquetado de escenas en pipelines de conducción autónoma, con reproducción exacta verificada frente a las predicciones publicadas por SysCV y una licencia restringida a uso educativo, de investigación y sin ánimo de lucro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-50 (CNN con conexiones residuales) + LinearClsHead |
| Parametros totales | 23.575.495 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 640 x 640) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y `.pth` en FP32) |
| Idiomas soportados | no aplica (clasificación de imágenes, sin componente de texto) |
| Licencia | bdd100k (uso educativo, investigación y sin ánimo de lucro; ver LICENSE.txt) |
| Formato de pesos | safetensors (con equivalentes `.pth`); configuración MMClassification |
| Numero de clases | 7 (tunnel, residential, parking lot, undefined, city street, gas stations, highway) |
| Entrada | recorte central 640 x 640, RGB, normalización ImageNet |
| Libreria | mmcls 0.25.0 (MMClassification) |
| Tamano del repo | 0.2 GB |

## Arquitectura y entrenamiento

El modelo es una ResNet-50 estándar, descrita en el paper *Deep Residual Learning for Image Recognition* (CVPR 2016), con una cabeza de clasificación lineal de MMClassification. La configuración no define pesos preentrenados para el backbone, por lo que el entrenamiento parte de inicialización aleatoria. El entrenamiento se realizó sobre las 70.000 imágenes de entrenamiento de BDD100K durante 48 épocas (esquema 4x), con SGD (lr 0.1, momentum 0.9, weight decay 0.0001), decaimiento del learning rate en las épocas 24 y 36, batch de 48 (4 GPUs x 12 imágenes) y aumentación basada en recortes aleatorios de 640 x 640 y volteos horizontales.

No se menciona en la información disponible el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un clasificador de visión. La innovación destacable no está en la arquitectura sino en la ingeniería de distribución: recuperación de pesos desde Wayback Machine, verificación de MD5 contra el original de SysCV, reproducción exacta de las predicciones de validación (10.000 imágenes, diferencias de score por debajo de 1e-06 en GPU y 8e-07 en CPU) y un entorno fijado con torch 2.0.1, mmcv-full 1.7.2 y mmcls 0.25.0 sobre Python 3.10.

## Capacidades

- Clasificación de escenas de conducción en 7 categorías (túnel, residencial, aparcamiento, indefinida, calle urbana, gasolinera, autopista).
- Procesamiento de imágenes individuales, carpetas de imágenes, vídeos y flujo de webcam mediante `infer.py`.
- Salida de la etiqueta principal y de las puntuaciones de todas las clases, exportables a JSON con `--json`.
- Control del número de fotogramas procesados en vídeo mediante `--max-frames`.
- Inferencia en GPU (CUDA 11.8) y en CPU con entornos separados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un clasificador de imágenes.
- No tiene capacidades multilingües ni de audio.

## Casos de uso

- Etiquetado automático de escenas en datasets de conducción: el modelo clasifica cada imagen de BDD100K o de un dataset propio con el mismo formato en una de las siete categorías, lo que permite enriquecer metadatos de entrenamiento para modelos de percepción o planificación con un coste de 0,010 s/imagen en una RTX 4070 SUPER.
- Filtrado y curación de datasets: dado un conjunto masivo de imágenes de vehículo, se puede separar por tipo de escena (por ejemplo, aislar las imágenes de túnel o de aparcamiento) antes de entrenar detectores o segmentadores específicos.
- Análisis de vídeo de flotas o dashcams: `infer.py` acepta vídeos y produce etiquetas por fotograma, lo que permite segmentar un trayecto por tipo de entorno y generar informes de contexto de conducción.
- Preetiquetado en pipelines de anotación: las etiquetas de escena sirven como capa de metadatos previa a la anotación humana de objetos, reduciendo el trabajo manual en la clasificación contextual.
- Validación de robustez en condiciones diurnas y nocturnas: el autor incluye una demo con clips de día y de noche, lo que permite usar el modelo como referencia para comparar el comportamiento de clasificadores de escena en distintas condiciones de iluminación.
- Prototipado en sistemas embebidos o sin GPU: con 0,21 s/imagen en 8 hilos de CPU y 23,57 millones de parámetros, es viable en entornos sin acelerador para pruebas de concepto o procesamiento por lotes de baja frecuencia.
- Reproducción de resultados académicos: al reproducir exactamente las predicciones de SysCV, sirve como baseline verificable en experimentos que comparen métodos de etiquetado de escena sobre BDD100K.

## Benchmarks y rendimiento

Resultados declarados por el autor (procedentes de los ficheros de score de SysCV; precisión, recall y F1 son medias macro sobre las 7 clases, incluida `undefined`):

| Split | Top-1 accuracy | Precision | Recall | F1 |
|---|---|---|---|---|
| val | 77,92 | 52,42 | 46,89 | 48,75 |
| test | 77,35 | 52,34 | 43,70 | 45,20 |

El autor indica que la métrica de validación no está verificada de forma independiente en la model-index (`verified: false`), aunque la model card documenta una reproducción exacta de las predicciones publicadas por SysCV. No se han publicado en la información disponible resultados de benchmarks en otras tareas (MMLU, HumanEval, GSM8K u otras), que no aplican a este modelo.

Rendimiento de inferencia declarado:

| Entorno | Tiempo por imagen |
|---|---|
| RTX 4070 SUPER (incluye decodificación JPEG) | 0,010 s |
| CPU, 8 hilos | 0,21 s |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 23,57 millones de parámetros en FP32 el peso de los parámetros ronda los 94 MB, por lo que la huella es mínima y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA 11.8; el autor valida en una RTX 4070 SUPER. Para lotes grandes se pueden usar A100, H100 o RTX 4090, aunque el modelo no las requiere.
- Cabe en GPU consumer: sí, en cualquier GPU moderna con al menos unos pocos cientos de MB de VRAM libre; también funciona en CPU.
- Opciones de despliegue: el repositorio proporciona `infer.py` con entornos fijados (`requirements-cu118.txt` y `requirements-cpu.txt`) sobre torch 2.0.1, mmcv-full 1.7.2 y mmcls 0.25.0. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un clasificador de imágenes.
- Latencia y throughput: 0,010 s/imagen en RTX 4070 SUPER y 0,21 s/imagen en CPU con 8 hilos, según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto/entrada | Top-1 (BDD100K val) | Licencia |
|---|---|---|---|---|---|
| bdd100k-syscv-resnet50-4x-scene | 23,57 M | Clasificación de escena (7 clases) | Imagen 640 x 640 | 77,92 | bdd100k (solo investigación/educación) |
| Otras variantes del zoo SysCV (tagging) | no disponible | Clasificación de escena | no disponible | no disponible en la información proporcionada | Apache-2.0 (config) / BDD100K (pesos) |
| Clasificadores de escena genéricos tipo Places365 | no disponible | Clasificación de escena genérica | no disponible | no disponible | varía |

No se dispone en la información proporcionada de resultados comparables de otros modelos sobre la misma tarea y split, por lo que la comparativa cuantitativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos derivan de BDD100K y quedan bajo su licencia, limitada a uso educativo, de investigación y sin ánimo de lucro. No está permitido el uso comercial sin autorización expresa.
- El modelo solo clasifica escenas; no detecta objetos, no segmenta, no genera texto y no razona. Cualquier expectativa de capacidades tipo LLM es incorrecta.
- El rendimiento macro es bajo en precisión, recall y F1 (52,42 / 46,89 / 48,75 en validación), lo que indica un desequilibrio claro entre clases y un rendimiento pobre en las clases minoritarias, incluida `undefined`.
- La etiqueta `undefined` forma parte del conjunto de clases y puede absorber imágenes ambiguas, lo que reduce la utilidad práctica en escenarios donde se necesita una categoría concreta.
- El backbone se entrena sin pesos preentrenados según la configuración, lo que puede limitar la generalización frente a variantes con inicialización ImageNet.
- La entrada está fijada a un recorte central de 640 x 640 sin redimensionado; imágenes con relaciones de aspecto muy distintas o resoluciones menores pueden perder información relevante en los bordes.
- Riesgo de sesgo asociado al dataset BDD100K: sobrerrepresentación de ciertas ciudades, condiciones meteorológicas y horarios, con menor cobertura de escenas atípicas.
- No hay información sobre calibración de probabilidades ni sobre el comportamiento fuera de la distribución de BDD100K; en producción conviene validar con datos propios.
- El host original de los pesos está caído; este repositorio depende de una recuperación desde Wayback Machine, lo que conviene tener en cuenta para la trazabilidad a largo plazo (aunque el MD5 está verificado contra el original de SysCV).
- El entorno requiere versiones antiguas y fijadas (torch 2.0.1, mmcv-full 1.7.2, mmcls 0.25.0, Python 3.10) en un venv limpio; mezclar con entornos existentes puede romper la instalación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-resnet50-4x-scene
- Licencia (LICENSE.txt): https://huggingface.co/dronefreak/bdd100k-syscv-resnet50-4x-scene/blob/main/LICENSE.txt
- Zoo de modelos SysCV (tagging): https://github.com/SysCV/bdd100k-models/tree/main/tagging
- Configuración original de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/tagging/configs/scene/resnet50_4x_scene_tag_bdd100k.py
- Paper de ResNet: https://arxiv.org/abs/1512.03385
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
- Paper de BDD100K (CVPR 2020): https://arxiv.org/abs/1805.04687
