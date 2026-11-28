# dronefreak/bdd100k-syscv-resnet101-5x-weather

## Resumen

El modelo `dronefreak/bdd100k-syscv-resnet101-5x-weather` es un clasificador de imágenes basado en ResNet-101 que asigna a cada fotograma de escena de conducción una única etiqueta meteorológica entre siete clases: `rainy`, `snowy`, `clear`, `overcast`, `undefined`, `partly cloudy` y `foggy`. No es un modelo de lenguaje: es un checkpoint de visión por computador para etiquetado meteorológico de imágenes de tráfico, entrenado sobre el conjunto de datos BDD100K (70 000 imágenes de entrenamiento) y publicado originalmente por el zoo de modelos de SysCV (ETH Zurich).

La relevancia de esta ficha es fundamentalmente práctica: el host original de SysCV (`dl.cv.ethz.ch`) está fuera de servicio, por lo que este repositorio actúa como espejo que recupera los pesos desde la Wayback Machine (captura del 29 de enero de 2025) y añade un entorno de ejecución fijado y un script de inferencia (`infer.py`). El autor declara una reproducción exacta: sobre las 10 000 imágenes de validación, las etiquetas coinciden con las predicciones publicadas por SysCV para todas las imágenes y las puntuaciones por clase difieren como máximo en 1e-06.

Arquitectónicamente es una CNN residual clásica (ResNet-101, 42,6 millones de parámetros, 0,4 GB de pesos en safetensors) con una cabeza de clasificación lineal (`LinearClsHead` de MMClassification). Consume un recorte central de 640 × 640 píxeles de la imagen a resolución completa, sin reescalado, en RGB con media y desviación típica de ImageNet. No dispone de ventana de contexto, tool calling ni capacidades generativas: su única tarea es la clasificación meteorológica de un fotograma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-101 (CNN residual, CVPR 2016) con `LinearClsHead` de MMClassification |
| Parametros totales | 42 619 847 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de 640 × 640 píxeles) |
| Tipos de cuantizacion | no disponible (solo se documentan pesos en safetensors y `.pth`; no se mencionan variantes GGUF, ONNX ni INT8) |
| Idiomas soportados | no aplica (clasificación de imagen; las etiquetas de salida están en inglés) |
| Licencia | BDD100K (`license_name: bdd100k`), uso educativo, de investigación y sin ánimo de lucro; la configuración de SysCV es Apache-2.0 |
| Formato de pesos | `safetensors` (`model.safetensors`, mismos tensores que el `.pth` original); configuración en `config.json` y `original_config.py` |

## Arquitectura y entrenamiento

ResNet-101 es una red neuronal convolucional con conexiones residuales organizada en bloques bottleneck; el modelo usa la implementación de MMClassification con una cabeza lineal de 7 clases. La entrada es un recorte central de 640 × 640 píxeles de la imagen a resolución completa (sin reescalado), normalizado con media y desviación típica de ImageNet. El entrenamiento parte de pesos inicializados aleatoriamente: la configuración no fija pesos preentrenados para el backbone.

El entrenamiento se realizó sobre las 70 000 imágenes de entrenamiento de BDD100K durante 60 épocas (el sufijo «5x» indica un calendario de entrenamiento cinco veces más largo que el esquema base), con SGD de momento 0,9, learning rate 0,1, weight decay 0,0001, decaimiento del learning rate en las épocas 30 y 45, batch de 32 (4 GPU × 8 imágenes) y aumentación consistente en recortes aleatorios de 640 × 640 y volteos horizontales. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de destilación.

La innovación destacable de este repositorio no es arquitectónica sino de preservación y reproducibilidad: recuperación de pesos desde la Wayback Machine, verificación de MD5 (`f007b8c97079bb7fa24228aece45704a`) contra el fichero original de SysCV, entorno fijado (torch 2.0.1, mmcv-full 1.7.2, mmcls 0.25.0, Python 3.10), carga con `torch.load(weights_only=True)` y desactivación de TF32 en la inferencia para garantizar la coincidencia numérica.

## Capacidades

- Clasificación de imagen en 7 clases meteorológicas: `rainy`, `snowy`, `clear`, `overcast`, `undefined`, `partly cloudy` y `foggy`.
- Etiquetado por fotograma de imágenes sueltas, carpetas de imágenes, vídeo y webcam mediante `infer.py`.
- Salida de la etiqueta ganadora y de las puntuaciones de todas las clases con `--json out.json`.
- Procesamiento de vídeo con límite opcional de fotogramas (`--max-frames N`).
- Ejecución en GPU (entorno CUDA 11.8) y en CPU (entorno CPU independiente).
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso, visión generativa, audio ni capacidades multilingües.

## Casos de uso

- Etiquetado automático de datasets de conducción: clasificar meteorológicamente grandes volúmenes de imágenes de tráfico para estratificar por condiciones climáticas antes de entrenar detectores o segmentadores; el modelo procesa 0,015 s/imagen en GPU, lo que permite etiquetar decenas de miles de imágenes en minutos.
- Filtrado y curado de datos por condición adversa: seleccionar únicamente fotogramas `rainy`, `snowy` o `foggy` para construir subconjuntos de validación específicos de clima adverso, con la ventaja de que la etiqueta `undefined` permite descartar fotogramas ambiguos.
- Enriquecimiento de metadatos en pipelines de datos de vídeo: invocar `infer.py` sobre vídeos de dashcam o flotas para añadir la etiqueta meteorológica por fotograma al índice de búsqueda, aprovechando la salida JSON con las puntuaciones completas.
- Monitorización de flotas y logística: clasificar las imágenes capturadas por vehículos para detectar condiciones meteorológicas adversas y activar alertas operativas, con despliegue en CPU (0,35 s/imagen en 8 hilos) cuando no hay GPU disponible.
- Reproducción de experimentos académicos: al ser un espejo verificado de SysCV, permite reproducir exactamente las predicciones de validación publicadas y usarlas como línea base en comparativas de etiquetado meteorológico sobre BDD100K.
- Validación de calidad de datasets propios: comparar las etiquetas meteorológicas de un dataset interno con las de este clasificador para detectar discrepancias de anotación, dado que la salida por clase permite analizar la confianza y no solo la etiqueta final.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (procedentes de los ficheros de puntuaciones de SysCV). La precisión, el recall y la F1 son medias macro sobre las 7 clases, incluida `undefined`. El valor de exactitud está marcado como `verified: false` en el model-index.

| Split | Top-1 accuracy (%) | Precision (%) | Recall (%) | F1 (%) |
|---|---|---|---|---|
| val | 81,73 | 65,85 | 63,79 | 64,63 |
| test | 81,22 | 68,30 | 64,60 | 66,25 |

Verificación de reproducibilidad declarada por el autor: sobre las 10 000 imágenes de validación, la etiqueta coincide con las predicciones publicadas de SysCV para todas las imágenes y cada puntuación de clase coincide con un margen de 1e-06 (GPU, CUDA 11.8, RTX 4070 SUPER, TF32 desactivado). En CPU, sobre 20 imágenes de validación, las etiquetas coinciden y la mayor diferencia de puntuación es 7e-07.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 42,6 millones de parámetros en FP32 los pesos ocupan aproximadamente 170 MB, por lo que el modelo cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: el autor reporta 0,015 s/imagen (incluida la decodificación JPEG) en una RTX 4070 SUPER. Por tamaño, cualquier GPU con al menos 2-4 GB de VRAM es suficiente; no se documentan pruebas en A100, H100 ni otras GPU de datacenter.
- Cabe en GPU consumer: sí; el entorno CUDA 11.8 está probado en RTX 4070 SUPER y existe un entorno CPU alternativo.
- Opciones de despliegue: MMClassification 0.25.0 con mmcv-full 1.7.2 sobre PyTorch 2.0.1 y Python 3.10, mediante `infer.py` (imagen, carpeta, vídeo o webcam). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: 0,015 s/imagen en RTX 4070 SUPER (con decodificación JPEG) y 0,35 s/imagen en CPU con 8 hilos. No se reporta throughput agregado por lotes.

## Comparativa con modelos similares

La información disponible no incluye comparaciones con otros modelos de etiquetado meteorológico sobre BDD100K. Como referencia de la misma familia y tarea, se puede situar frente a otras variantes del zoo de SysCV (por ejemplo, configuraciones ResNet-50 o esquemas de entrenamiento base frente a «5x»), pero no se dispone de sus métricas en esta información.

| Modelo | Parametros | Entrada | Top-1 val (clima) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ResNet-101, 5x) | 42,6 M | 640 × 640 | 81,73 % | BDD100K (solo investigación) | Espejo en Hugging Face |
| Otras variantes del zoo SysCV | no disponible | no disponible | no disponible | Apache-2.0 (config) / BDD100K (pesos) | Host original `dl.cv.ethz.ch` fuera de servicio |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan análisis de sesgo en la información disponible; al entrenarse sobre BDD100K, hereda la distribución geográfica y temporal de ese dataset (escenas de conducción, principalmente en Estados Unidos).
- Riesgo de alucinación: no aplica en el sentido generativo, pero la clase `undefined` y la precisión macro relativamente baja (65,85 % en validación) indican confusión entre clases, especialmente en condiciones ambiguas o nocturnas.
- Limitaciones de entrada: el modelo espera un recorte central de 640 × 640 píxeles sin reescalado; desviarse de ese preprocesado puede degradar los resultados y romper la reproducibilidad verificada.
- Restricciones de licencia: los pesos se rigen por la licencia de BDD100K, limitada a uso educativo, de investigación y sin ánimo de lucro; el uso comercial requiere revisar los términos del `LICENSE.txt`. La configuración de SysCV es Apache-2.0, pero eso no cubre los pesos.
- Dependencias frágiles: requiere versiones fijadas (torch 2.0.1, mmcv-full 1.7.2, mmcls 0.25.0, Python 3.10) y un entorno virtual limpio; mezclar versiones puede impedir la carga de los pesos.
- Cobertura: una sola etiqueta meteorológica por imagen; no detecta condiciones mixtas ni proporciona localización espacial del fenómeno.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de la reproducibilidad más allá de la declarada por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-syscv-resnet101-5x-weather
- Licencia (LICENSE.txt del repo): https://huggingface.co/dronefreak/bdd100k-syscv-resnet101-5x-weather/blob/main/LICENSE.txt
- Zoo de modelos de SysCV (tagging): https://github.com/SysCV/bdd100k-models/tree/main/tagging
- Configuración original de SysCV: https://github.com/SysCV/bdd100k-models/blob/0935a8a3eb4c7442efdce2a8ce4b93fbe585be15/tagging/configs/weather/resnet101_5x_weather_tag_bdd100k.py
- Paper de ResNet: https://arxiv.org/abs/1512.03385
- Dataset BDD100K: https://huggingface.co/datasets/dronefreak/BDD100K
- Paper de BDD100K (CVPR 2020): no se proporciona enlace directo en la información disponible
