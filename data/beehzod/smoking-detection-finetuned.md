# Beehzod/smoking-detection-finetuned

## Resumen

El modelo `Beehzod/smoking-detection-finetuned` es un detector de objetos especializado en la detección de cigarrillos, desarrollado mediante fine-tuning de un modelo base YOLOv11-Medium (`Enos-123/smoking-detection`) con la librería Ultralytics. El autor, Beehzod, ha ajustado el modelo sobre un dataset específico de imágenes de cigarrillos procedente de Roboflow (`xu-wei/cigarette-all`), con el objetivo de mejorar la precisión en escenarios de detección de tabaco, especialmente útil para aplicaciones de vigilancia, control de hábitos o cumplimiento normativo.

El modelo se distribuye bajo licencia MIT y está pensado para su integración en pipelines de visión por computador mediante la API de Ultralytics. Aunque el repositorio no incluye pesos publicados (el tamaño del repo es 0.0 GB), la model card indica que el archivo `best.pt` está disponible para su uso. La arquitectura YOLOv11-Medium ofrece un equilibrio entre velocidad y precisión, lo que lo hace adecuado para inferencia en tiempo real en dispositivos con GPU moderada.

La relevancia de este modelo radica en su especialización: mientras que los detectores genéricos pueden fallar en la identificación de cigarrillos en contextos variados, este fine-tuning sobre un dataset dedicado mejora la precisión y el recall en esa clase concreta, con una mAP50 de 0.8698 y una precisión de 0.9432 en el conjunto de validación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv11-Medium (basada en el checkpoint `Enos-123/smoking-detection`) |
| Parametros totales | no disponible (no se especifica en la documentación) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de visión, no procesa texto) |
| Tipos de cuantizacion | no disponible (se proporciona como `best.pt`, pesos nativos de PyTorch) |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best.pt`), compatible con Ultralytics; también se puede exportar a ONNX, TensorRT, etc. |

## Arquitectura y entrenamiento

El modelo se basa en YOLOv11-Medium, una variante de la familia YOLO (You Only Look Once) que utiliza una red neuronal convolucional (CNN) de una sola etapa para la detección de objetos. YOLOv11 introduce mejoras respecto a versiones anteriores, como una mayor eficiencia en el cuello de la red y una mejor extracción de características, manteniendo un buen equilibrio entre latencia y precisión. El fine-tuning se realizó sobre el checkpoint preentrenado `Enos-123/smoking-detection`, que ya había sido ajustado para la detección de cigarrillos, y se reentrenó con un dataset específico.

El entrenamiento se llevó a cabo con el framework Ultralytics, utilizando los siguientes hiperparámetros: 100 épocas, tamaño de imagen de 640 píxeles, batch size de 18, optimizador AdamW con una tasa de aprendizaje inicial de 0.001 y paciencia de early stopping de 20 épocas. El dataset de entrenamiento proviene de `xu-wei/cigarette-all` (versión 1) en Roboflow, con 1613 imágenes de entrenamiento, 203 de validación y 201 de prueba. La única clase detectada es `cigarette`. No se menciona el uso de técnicas de aumento de datos adicionales ni de estrategias como RLHF o DPO, ya que no aplican a modelos de visión.

## Capacidades

- Detección de objetos en imágenes: identifica la presencia de cigarrillos en fotografías o frames de video, devolviendo cajas delimitadoras y puntuaciones de confianza.
- Inferencia en tiempo real: gracias a la arquitectura YOLOv11-Medium, es capaz de procesar imágenes a velocidades adecuadas para aplicaciones de video en directo (dependiendo del hardware).
- Integración sencilla con Ultralytics: se puede cargar con `YOLO("best.pt")` y usar el método `predict()` para obtener resultados.
- Exportación a otros formatos: aunque no se documenta explícitamente, los modelos de Ultralytics pueden exportarse a ONNX, TensorRT, CoreML, etc., para despliegue en diferentes plataformas.
- Especialización en una única clase: el modelo está optimizado para la detección de cigarrillos, lo que reduce falsos positivos en contextos donde otros objetos podrían confundirse.

## Casos de uso

- Vigilancia y control de hábitos en espacios públicos: el modelo puede integrarse en sistemas de cámaras para detectar el consumo de tabaco en áreas donde está prohibido, como hospitales, escuelas o estaciones de servicio. Se usaría con un pipeline de video que analice cada frame y active alertas cuando se detecte un cigarrillo.
- Cumplimiento normativo en entornos laborales: en industrias con riesgo de incendio o donde el tabaco está restringido, el modelo puede monitorizar imágenes de cámaras de seguridad para garantizar el cumplimiento de las políticas internas.
- Análisis de imágenes médicas o de investigación: en estudios sobre tabaquismo, el modelo puede automatizar la anotación de imágenes de cigarrillos en grandes conjuntos de datos, ahorrando tiempo de etiquetado manual.
- Moderación de contenido en redes sociales: plataformas que necesiten filtrar imágenes que muestren cigarrillos (por políticas de publicidad o contenido) pueden usar este detector como parte de un sistema de moderación automática.
- Asistencia en campañas de concienciación: organizaciones de salud pueden emplear el modelo para analizar imágenes de entornos urbanos y cuantificar la prevalencia de consumo de tabaco en fotografías de archivo.
- Control de calidad en producción de imágenes sintéticas: si se generan imágenes con cigarrillos para entrenar otros modelos, este detector puede verificar que los objetos estén correctamente colocados.

## Benchmarks y rendimiento

Los resultados oficiales declarados por el autor en la model card (model-index) son los siguientes:

| Métrica | Valor |
|---|---|
| mAP50 | 0.8698 |
| mAP50-95 | 0.5886 |
| Precisión | 0.9432 |
| Recall | 0.7957 |

Estos valores corresponden al conjunto de validación (held-out) del dataset `cigarette-all`. No se han publicado comparaciones con otros modelos en la información disponible. La precisión alta (0.9432) indica que cuando el modelo predice un cigarrillo, acierta en el 94% de los casos, mientras que el recall (0.7957) sugiere que detecta aproximadamente el 80% de los cigarrillos presentes en las imágenes.

## Requisitos de hardware

- Al ser un modelo YOLOv11-Medium, se estima que requiere entre 4 y 8 GB de VRAM para inferencia en FP16, dependiendo del tamaño de lote y la resolución de entrada. Esta es una estimación orientativa, no un dato oficial.
- GPU recomendadas: tarjetas consumer como NVIDIA RTX 3060 (12 GB), RTX 4070 o superiores son suficientes para inferencia en tiempo real. También puede ejecutarse en GPUs de datacenter como A100 o H100 si se necesita alto throughput.
- Es posible ejecutar el modelo en CPU, aunque la latencia será significativamente mayor; se recomienda GPU para aplicaciones en tiempo real.
- Opciones de despliegue: el formato nativo es PyTorch con Ultralytics, pero puede exportarse a ONNX para usar con TensorRT, OpenVINO o TFLite. También es compatible con frameworks de inferencia como vLLM (aunque no es su caso típico, ya que vLLM está orientado a LLMs) o con servidores de visión como TorchServe.
- Latencia y throughput: no se proporcionan datos oficiales. En una GPU RTX 3060, un modelo YOLOv11-Medium suele procesar entre 30 y 60 FPS con imágenes de 640x640, pero esto es una estimación general.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos de detección de cigarrillos en la información proporcionada. Existen alternativas como `MeetCool/yolov8n-smoking-detection` (basado en YOLOv8n) o el modelo base `Enos-123/smoking-detection`, pero no se han publicado métricas comparables. A continuación se presenta una comparación cualitativa:

| Modelo | Arquitectura | Clases | Licencia | Observaciones |
|---|---|---|---|---|
| Beehzod/smoking-detection-finetuned | YOLOv11-Medium | cigarette | MIT | Fine-tuning específico, métricas publicadas |
| Enos-123/smoking-detection (base) | YOLOv11-Medium | cigarette | MIT | Modelo base del que parte este fine-tuning |
| MeetCool/yolov8n-smoking-detection | YOLOv8n | cigarette | no disponible | Modelo más ligero, sin métricas publicadas en la búsqueda |

No se puede establecer una comparativa cuantitativa sin datos adicionales.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la clase `cigarette`; no detecta otros objetos relacionados con el tabaco (como paquetes, ceniceros o vapeadores) a menos que se reentrene.
- El dataset de entrenamiento proviene de Roboflow y su licencia puede no ser la misma que la del modelo (MIT). Es necesario verificar los términos de uso del dataset antes de utilizar el modelo en aplicaciones comerciales.
- El rendimiento puede degradarse en condiciones de iluminación extrema, oclusiones o ángulos de cámara poco comunes, ya que el dataset de entrenamiento puede no cubrir todas las variaciones del mundo real.
- No se han realizado evaluaciones de sesgos o de robustez frente a ataques adversariales; el modelo podría ser vulnerable a perturbaciones en la imagen.
- El repositorio no incluye el archivo de pesos en el momento de la consulta (tamaño 0.0 GB), por lo que es posible que el enlace de descarga no esté operativo. Se recomienda contactar con el autor o utilizar el modelo base.
- Al ser un modelo de visión, no tiene capacidades de procesamiento de lenguaje natural ni de razonamiento multimodal.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Beehzod/smoking-detection-finetuned)
- [Modelo base Enos-123/smoking-detection](https://huggingface.co/Enos-123/smoking-detection)
- [Dataset xu-wei/cigarette-all en Roboflow](https://universe.roboflow.com/xu-wei/cigarette-all)
- [Repositorio de Ultralytics](https://github.com/ultralytics/ultralytics)
- [Tema smoking-detection en GitHub](https://github.com/topics/smoking-detection)
