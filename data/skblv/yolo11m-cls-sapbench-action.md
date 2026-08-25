# skblv/yolo11m-cls-sapbench-action

## Resumen

El modelo `skblv/yolo11m-cls-sapbench-action` es un clasificador de imágenes basado en YOLO11m-cls, ajustado para predecir la próxima acción del cirujano en fotogramas de colecistectomía. Lo desarrolla el autor `skblv` como línea base supervisada para el benchmark SAP-Bench (arXiv:2506.07196), un conjunto de datos de vídeo quirúrgico para comprensión de acciones. El modelo resuelve una clasificación de 5 etiquetas (disección, clipado de vasos, retracción de tejido, coagulación y aspiración) a partir de un único fotograma, y sirve como referencia para comparar con modelos de visión y lenguaje en un leaderboard dedicado.

Es relevante en el contexto de la comprensión de vídeo quirúrgico, donde la predicción de la siguiente acción puede apoyar la formación, la planificación quirúrgica y la automatización de sistemas de asistencia. La arquitectura es la de YOLO11m-cls, una variante de clasificación de la familia YOLO11 de Ultralytics, con entrada de 224×224 píxeles. El modelo se distribuye bajo licencia AGPL-3.0 y se integra mediante la librería `ultralytics`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11m-cls (variante de clasificación de YOLO11) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen fija 224×224) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificación de imágenes) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (Ultralytics .pt) |

## Arquitectura y entrenamiento

YOLO11m-cls es un modelo de clasificación de imágenes basado en la arquitectura YOLO11, diseñada para tareas de visión por computadora en tiempo real. Aunque el diseño original de YOLO11 se centra en detección de objetos, la variante `-cls` adapta la red para clasificación de imágenes completas. El modelo fue ajustado (fine-tuned) a partir de los pesos pre-entrenados `yolo11m-cls.pt` de Ultralytics.

El entrenamiento se realizó sobre el conjunto de validación de SAP-Bench, con un total de 353 fotogramas de colecistectomía. Se usó un tamaño de lote de 32, hasta 100 épocas con paciencia de 15 (early stopping), semilla 42 y aumentación estándar de color y geométrica. El código de entrenamiento está disponible en el archivo `s69_sapbench_supervised.py` y las curvas de pérdida en `loss_curve.csv`. No se especifican más detalles sobre el número de tokens de entrenamiento ni técnicas de RLHF/DPO, ya que se trata de un modelo de visión, no de lenguaje.

## Capacidades

- Clasificación de imágenes de fotogramas quirúrgicos en 5 categorías: Dissection, Vessel Clipping, Tissue Retraction, Coagulation y Aspiration.
- Predicción de la próxima acción del cirujano a partir de un único fotograma, como tarea de clasificación supervisada.
- Integración sencilla con la librería `ultralytics` (YOLO) para inferencia en Python.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá de la clasificación de imagen.
- No es multilingüe; la salida es una etiqueta de clase en inglés.

## Casos de uso

- Investigación en comprensión de vídeo quirúrgico: el modelo sirve como línea base supervisada para comparar con modelos de visión y lenguaje en el leaderboard de SAP-Bench, permitiendo evaluar el progreso en la predicción de acciones quirúrgicas.
- Análisis de flujo de trabajo quirúrgico: en estudios retrospectivos, se puede usar para etiquetar automáticamente fotogramas de colecistectomía y estudiar la secuencia de acciones del cirujano.
- Desarrollo de sistemas de asistencia intraoperatoria: aunque no es un dispositivo médico, puede integrarse en prototipos de investigación para alertar sobre posibles siguientes pasos en cirugía mínimamente invasiva.
- Entrenamiento de estudiantes de cirugía: como herramienta educativa para mostrar la clasificación de acciones en vídeos de procedimientos reales.
- Benchmarking de modelos de visión: sirve como línea base para medir el progreso de modelos de lenguaje y visión (VLM) en la tarea de predicción de acciones.
- Depuración de pipelines de visión por computador: el modelo puede integrarse en flujos de procesamiento de vídeo para extraer etiquetas de acción y alimentar otros algoritmos.

## Benchmarks y rendimiento

El modelo se evaluó en el conjunto de validación completo de SAP-Bench (353 fotogramas) y se reportó una exactitud de coincidencia exacta (exact-match accuracy) del 45.6% con un intervalo de confianza del 95% entre 40.5% y 51.3%. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

No se especifican requisitos de hardware en la documentación del modelo. Al tratarse de un modelo de clasificación de imágenes de tamaño medio (YOLO11m-cls), se puede ejecutar en una GPU de gama media (por ejemplo, NVIDIA RTX 3060 o superior) o incluso en CPU para inferencia puntual, aunque con menor velocidad. No se disponen de datos de VRAM, latencia ni throughput. Las opciones de despliegue típicas incluyen la librería `ultralytics` (Python) y la exportación a formatos como ONNX o TensorRT para inferencia optimizada.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada. El modelo es una línea base supervisada específica para SAP-Bench; no se aportan comparaciones con otros modelos de clasificación de imágenes quirúrgicas.

## Limitaciones y advertencias

- Modelo de investigación únicamente; no es un dispositivo médico y no debe usarse en entornos clínicos reales.
- La predicción de la próxima acción a partir de un único fotograma es inherentemente ambigua; la exactitud es limitada (45.6%).
- Solo cubre 5 clases de acción; no se consideran otras acciones posibles en cirugía.
- La licencia AGPL-3.0 puede imponer restricciones de copyleft en aplicaciones comerciales o de uso cerrado.
- No se proporcionan datos sobre sesgos (por ejemplo, distribución de clases desequilibrada) ni sobre el rendimiento en subgrupos de pacientes.
- El modelo se ha entrenado únicamente con fotogramas de colecistectomía; no es aplicable a otros tipos de cirugía sin reentrenamiento.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/skblv/yolo11m-cls-sapbench-action)
- [Paper SAP-Bench (arXiv:2506.07196)](https://arxiv.org/abs/2506.07196)
- [Leaderboard de comprensión de vídeo quirúrgico (GitHub)](https://github.com/skblv/neurosurgery-video-eval-website)
- [Repositorio oficial de Ultralytics YOLO11](https://github.com/ultralytics/yolo11)
- [Documentación de Ultralytics YOLO11](https://docs.ultralytics.com/models/yolo11)
