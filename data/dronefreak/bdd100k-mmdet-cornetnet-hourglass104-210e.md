# dronefreak/bdd100k-mmdet-cornetnet-hourglass104-210e

## Resumen

CornerNet Hourglass-104 sobre BDD100K es un detector de objetos de tipo keypoint-based (detección por esquinas, sin anchors) publicado originalmente por el equipo de BDD100K en 2020 como baseline oficial de detección para el dataset de conducción autónoma BDD100K. Este repositorio de Hugging Face es un espejo (mirror) del checkpoint original, empaquetado con un entorno fijado y un script de inferencia para que siga siendo ejecutable con stacks modernos, ya que el stack original (PyTorch 1.6.0, CUDA 10.2, mmcv 1.1.5, mmdetection 2.5.0) ya no funciona en GPUs actuales.

El modelo resuelve la tarea de detección de objetos en escenas de conducción (coches, peatones, señales de tráfico, semáforos, etc.) sobre las imágenes de BDD100K. Utiliza la arquitectura CornerNet con backbone Hourglass-104 y corner pooling, con 201.088.948 parámetros totales (~201,1 M). Es relevante ahora como referencia histórica reproducible y como baseline para comparaciones en investigación de detección en conducción autónoma, no como modelo de producción.

El checkpoint no incluye documentación original; la model card del espejo documenta el contenido leyendo directamente el checkpoint y verificando la integridad de los pesos (SHA-256) y la reproducibilidad de las predicciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CornerNet con backbone Hourglass-104 y corner pooling |
| Parametros totales | 201.088.948 (~201,1 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión) |
| Licencia | BDD100K (license: other, license_name: bdd100k) |
| Formato de pesos | safetensors (repo), checkpoint PyTorch original cargado con `torch.load(weights_only=True)` |

## Arquitectura y entrenamiento

CornerNet es un detector de objetos keypoint-based que predice las esquinas superior-izquierda e inferior-derecha de cada caja delimitadora como puntos clave, eliminando la necesidad de anchors. El backbone es una red Hourglass-104 (104 capas de hourglass apiladas) con módulos de corner pooling que agregan información direccional en las esquinas. El modelo tiene 201,1 M de parámetros.

El entrenamiento se realizó con PyTorch 1.6.0, CUDA 10.2, mmcv 1.1.5 y mmdetection 2.5.0 sobre GPUs Tesla P100-PCIE-16GB, según los metadatos registrados en el checkpoint. No se documenta el número de tokens ni la composición exacta del dataset más allá de BDD100K; la inicialización del backbone no está registrada (entrenado desde cero o inicializado dentro del config). No se reporta uso de RLHF/DPO (no aplica a detección). La innovación técnica principal es el esquema de detección por esquinas sin anchors, que simplifica el diseño del detector frente a enfoques basados en anchors.

## Capacidades

- Detección de objetos en imágenes de escenas de conducción (coches, peatones, señales, semáforos, etc.) sobre el dataset BDD100K.
- Inferencia sobre imágenes individuales, carpetas de imágenes, vídeos y webcam mediante el script `infer.py`.
- Exportación de detecciones en formato BDD100K (píxeles, `x1 y1 x2 y2`) mediante `--json`.
- Umbral de confianza configurable (`--score-thr`, por defecto 0.3) y límite de frames para vídeo (`--max-frames`).
- Carga segura de pesos con `torch.load(weights_only=True)`, sin ejecución de código arbitrario.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües (es un modelo puramente de visión).

## Casos de uso

- Baseline de investigación en detección para conducción autónoma: sirve como referencia reproducible para comparar nuevos detectores sobre BDD100K con las mismas métricas (mAP@50:95, mAP@50, mAP@75).
- Reproducción de resultados históricos: permite volver a ejecutar el baseline oficial de 2020 en hardware actual gracias al entorno fijado (torch 2.0.1, mmcv-full 1.7.2, mmdetection 2.28.2).
- Análisis de escenas de conducción en vídeo: `infer.py` procesa ficheros de vídeo y permite extraer detecciones frame a frame para estudios de tráfico o validación de datasets.
- Prototipado rápido de pipelines de detección en CPU: el entorno CPU verificado permite ejecutar inferencia sin GPU para pruebas puntuales o demos.
- Docencia y formación: ejemplo didáctico de detector keypoint-based sin anchors con un stack mmdetection 2.x documentado y reproducible.
- Auditoría de datasets: comparación de las predicciones del modelo con las anotaciones de BDD100K para detectar discrepancias o clases problemáticas.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados, `verified: false`):

| Metrica | Valor | Split |
|---|---|---|
| mAP@50:95 | 24.5 | validation |
| mAP@50 | 44.7 | validation |
| mAP@75 | 23.0 | validation |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~201 M de parámetros y backbone Hourglass-104, el checkpoint ocupa 3,7 GB en el repo y requiere memoria adicional para activaciones, por lo que se recomienda al menos una GPU con 8-16 GB para lotes pequeños.
- GPU de entrenamiento original: Tesla P100-PCIE-16GB (4 GPUs según el stack registrado en el checkpoint).
- GPU recomendadas: cualquier GPU NVIDIA compatible con CUDA 11.8 (el entorno CUDA no ha sido verificado aún según la model card); entorno CPU verificado.
- Cabe en GPU consumer: no confirmado explícitamente, pero por tamaño de parámetros es plausible en GPUs consumer con suficiente VRAM; no verificado.
- Opciones de despliegue: entorno fijado con Python 3.10, torch 2.0.1, torchvision 0.15.2, mmcv-full 1.7.2 y mmdetection 2.28.2; script `infer.py` para imagen, carpeta, vídeo y webcam. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. Como referencia contextual, este checkpoint es un baseline CornerNet sobre BDD100K; no se han publicado en la información disponible comparativas con otros detectores (por ejemplo, Faster R-CNN o YOLO) sobre el mismo split con métricas verificables.

## Limitaciones y advertencias

- Reproducción no exacta: frente a las predicciones publicadas por los autores en 20 imágenes de test, esta copia produce 2000 cajas frente a 2000; 1907 coinciden (misma clase, IoU >= 0.5), con IoU mínimo 0.9998 y mediana 1.0000, pero la causa de la diferencia no se investigó.
- Entorno CUDA no verificado: solo el entorno CPU ha sido probado; el entorno CUDA 11.8 aún no se ha ejecutado.
- Webcam no probada con cámara real: el bucle de captura es el mismo que para vídeo, pero no se validó con hardware físico.
- Licencia BDD100K: restricciones de uso comercial según la licencia del dataset; revisar el fichero LICENSE.txt antes de cualquier uso en producción.
- Modelo de visión sin capacidades de texto, tool calling ni agentes.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí de falsos positivos/negativos en detección; el umbral por defecto es 0.3.
- Stack antiguo: requiere mmdetection 2.x (no 3.x) y versiones fijadas de setuptools/yapf; usar un entorno limpio para evitar downgrades.
- Sin documentación original del autor: toda la información procede de la lectura del checkpoint y de pruebas sobre esta copia.

## Enlaces

- Hugging Face: https://huggingface.co/dronefreak/bdd100k-mmdet-cornetnet-hourglass104-210e
- Licencia: https://huggingface.co/dronefreak/bdd100k-mmdet-cornetnet-hourglass104-210e/blob/main/LICENSE.txt
- Dataset BDD100K en Hugging Face: https://huggingface.co/datasets/dronefreak/BDD100K
- Demo banner (vídeo): https://huggingface.co/dronefreak/bdd100k-mmdet-cornetnet-hourglass104-210e/resolve/main/assets/demo_banner.mp4
- Poster del demo: https://huggingface.co/dronefreak/bdd100k-mmdet-cornetnet-hourglass104-210e/resolve/main/assets/demo_banner_poster.jpg
