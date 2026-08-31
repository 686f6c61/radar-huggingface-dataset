# deadfast/beach-volley-vision-models

## Resumen

Beach Volley Vision es un modelo de visión por computadora especializado en el seguimiento del balón en vídeos de vóley playa. Se trata de un fine-tuning del modelo TrackNetV3, originalmente diseñado para rastrear volantes de bádminton, adaptado al dominio del vóley playa mediante anotaciones manuales de clips de rallies. El autor, Devin Decker, publica el checkpoint bajo licencia MIT, manteniendo la misma licencia que el proyecto upstream.

El modelo resuelve el problema de localización precisa de un objeto pequeño y de movimiento rápido (el balón) en secuencias de vídeo deportivo, una tarea compleja debido al desenfoque de movimiento, las oclusiones y el fondo variable. Su relevancia radica en que permite construir pipelines de análisis automático de partidos: detección, seguimiento, detección de eventos y estadísticas. El repositorio contiene únicamente los pesos del módulo TrackNet (~130 MB), no el módulo de rectificación de trayectorias (InpaintNet), que debe descargarse del proyecto original si se necesita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrackNetV3 (módulo de predicción de trayectorias basado en mapas de calor) |
| Parametros totales | no disponible (pesos ~130 MB en formato .pt) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de visión, procesa frames individuales) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en precisión completa) |
| Idiomas soportados | no aplicable (modelo de visión sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

TrackNetV3 es una arquitectura basada en redes neuronales convolucionales que genera mapas de calor por frame para localizar el objeto de interés. A diferencia de los detectores basados en bounding boxes, este enfoque predice una distribución de probabilidad espacial, lo que resulta especialmente adecuado para objetos pequeños y rápidos donde una caja delimitadora es imprecisa. El modelo produce como salida las coordenadas (x, y) del balón junto con un indicador de visibilidad.

El entrenamiento se realizó mediante fine-tuning del checkpoint base `qaz812345/TrackNetV3` sobre clips de rallies de vóley playa anotados manualmente. Las anotaciones incluyen la posición del balón y su visibilidad por frame, exportadas al formato CSV de TrackNet (`Frame,Visibility,X,Y`). El dataset de ejemplo y evaluación está disponible en el repositorio del proyecto. No se ha documentado el número exacto de frames de entrenamiento ni el proceso de aumento de datos. El módulo InpaintNet (rectificación de trayectorias) no fue reentrenado.

## Capacidades

- Localización del balón en vídeo de vóley playa: genera coordenadas (x, y) por frame con indicador de visibilidad.
- Seguimiento de objetos pequeños y rápidos: la arquitectura de mapas de calor está optimizada para objetos con desenfoque de movimiento y cambios bruscos de dirección.
- Inferencia por frame: procesa vídeo frame a frame, lo que permite integrarse en pipelines de análisis en tiempo real o diferido.
- No incluye capacidades de tool calling, agentes, razonamiento multimodal ni procesamiento de lenguaje.

## Casos de uso

- Análisis táctico de partidos: el modelo permite extraer la trayectoria completa del balón en cada punto, lo que facilita estudiar patrones de juego, zonas de ataque y defensa, y la eficacia de los saques.
- Entrenamiento asistido por vídeo: los entrenadores pueden subir grabaciones de sesiones y obtener métricas automáticas como número de toques, duración de los rallies o velocidad media del balón, sin anotación manual.
- Generación automática de resúmenes: al conocer la posición del balón, un pipeline puede detectar momentos clave (remates, bloqueos, puntos) y generar clips destacados de forma automática.
- Estadísticas de partido en tiempo real: integrado en un sistema de transmisión, el modelo puede alimentar gráficos en directo con la posición del balón y eventos relevantes.
- Herramientas de anotación semiautomática: el modelo puede pre-anotar vídeos nuevos, reduciendo el tiempo de etiquetado manual para crear datasets más grandes.
- Investigación en visión deportiva: sirve como punto de partida para experimentar con fine-tuning en otros deportes de pelota pequeña (tenis, pádel, squash) gracias a su licencia MIT y su arquitectura ligera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card no incluye métricas cuantitativas (precisión, recall, MOTA, etc.) ni comparaciones con otros modelos de seguimiento de balón.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Dado el tamaño de los pesos (~130 MB), se estima que la inferencia puede ejecutarse en GPUs con 4-6 GB de VRAM en precisión FP32, y menos si se convierte a FP16.
- GPU recomendadas: cualquier GPU moderna de NVIDIA (GTX 1660, RTX 2060 o superior) debería ser suficiente para inferencia a velocidad de vídeo estándar (25-30 fps) con resolución moderada.
- Compatibilidad con hardware de consumo: sí, el modelo es ligero y cabe en GPUs de gama media de consumo.
- Opciones de despliegue: el pipeline oficial se ejecuta con PyTorch. Puede exportarse a ONNX o TensorRT para optimizar la inferencia, o integrarse en frameworks como OpenCV o FFmpeg para procesamiento de vídeo.
- Latencia y throughput: no disponibles. Dependerán de la resolución de entrada, el hardware y el uso del módulo InpaintNet.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|
| deadfast/beach-volley-vision-models | Seguimiento de balón en vóley playa | TrackNetV3 (heatmap) | MIT | HuggingFace |
| qaz812345/TrackNetV3 (base) | Seguimiento de volante en bádminton | TrackNetV3 (heatmap) | MIT | GitHub |
| Modelos de detección de balón en Roboflow (p.ej. beach-volleyball-3e0mb) | Detección de balón con bounding boxes | YOLO u otros detectores | Variable (muchos son comerciales) | Roboflow Universe |

La comparativa directa con otros modelos de seguimiento de balón en vóley playa es limitada. La mayoría de soluciones comerciales (como Beachvision) no publican sus modelos. Los detectores de Roboflow se basan en bounding boxes, un enfoque distinto al de mapas de calor, que suele ser más preciso para objetos pequeños.

## Limitaciones y advertencias

- El módulo InpaintNet (rectificación de trayectorias) no está incluido en este repositorio. Si se necesita corregir saltos en la trayectoria, hay que descargarlo del proyecto upstream.
- El modelo está especializado en vóley playa y puede degradarse en otros deportes o condiciones de vídeo muy diferentes (iluminación extrema, cámaras de baja calidad, ángulos inusuales).
- El dataset de entrenamiento es de creación manual y de tamaño limitado, lo que puede afectar a la generalización en situaciones no representadas en los clips de entrenamiento.
- No se han publicado métricas de rendimiento, por lo que no hay evidencia cuantitativa de su precisión en condiciones reales.
- La licencia MIT permite uso comercial sin restricciones, pero el usuario es responsable de verificar que los datos de entrenamiento no tengan restricciones adicionales.
- El modelo no detecta jugadores, red ni otros elementos del campo; solo localiza el balón. Para un análisis completo se necesita combinar con otros modelos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/deadfast/beach-volley-vision-models
- Repositorio del pipeline Beach Volley Vision: https://github.com/ddecks/beach-volley-vision
- Proyecto upstream TrackNetV3: https://github.com/qaz812345/TrackNetV3
- Modelo base en HuggingFace: https://huggingface.co/qaz812345/TrackNetV3
