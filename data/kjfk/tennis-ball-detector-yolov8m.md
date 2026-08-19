# kjfk/tennis-ball-detector-yolov8m

## Resumen

El modelo `kjfk/tennis-ball-detector-yolov8m` es un detector de objetos de una sola clase —pelota de tenis— basado en la arquitectura YOLOv8m y ajustado específicamente para vídeo de tenis procedente de cámaras elevadas tras la línea de fondo, típico de retransmisiones deportivas. Desarrollado por el autor kjfk como parte del proyecto de código abierto `tennis-auto-scoring`, este detector constituye la etapa de detección de un sistema que convierte un vídeo de un partido en un marcador automático. Con 25,9 millones de parámetros y un peso de 50 MB, destaca por su eficiencia frente a alternativas más pesadas.

La relevancia del modelo radica en que aborda un problema específico del dominio: una pelota de tenis ocupa apenas unos 15 píxeles en un fotograma 1080p, lo que dificulta su detección con pesos preentrenados genéricos. La solución adoptada combina dos decisiones técnicas: servir la inferencia a una resolución de 960 píxeles (en lugar de los 640 por defecto) y entrenar a esa misma resolución. Con ello, el modelo logra una tasa de detección del 95,6 % de los fotogramas en una prueba de validación, superando claramente al baseline YOLOv5l6u de 86 millones de parámetros. Está disponible bajo licencia AGPL-3.0 y se distribuye mediante la librería Ultralytics.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8m (CNN de detección de objetos de una etapa) |
| Parametros totales | 25,9 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | no disponible (probablemente PyTorch .pt, no se especifica) |

## Arquitectura y entrenamiento

El modelo se basa en YOLOv8m, una arquitectura de detección de objetos de una etapa que utiliza una red troncal CSPDarknet y un cuello PANet, con cabezas de detección ancladas. En este caso, se ha ajustado un único detector para la clase `tennis ball`. El entrenamiento parte de los pesos preentrenados `yolov8m.pt` y se realiza con un tamaño de imagen de 960 píxeles, sobre un conjunto de datos procedente de Roboflow (`tennis-ball-detection-6`). El proceso se ejecutó en una GPU Tesla T4 (instancia g4dn.xlarge). No se especifican hiperparámetros adicionales como épocas, tamaño de lote o estrategias de aumento de datos.

La innovación principal no reside en la arquitectura, sino en la estrategia de resolución: el autor demuestra que servir la inferencia a 960 píxeles mejora drásticamente la detección en comparación con 640 píxeles (del 47 % al 95,6 % de fotogramas detectados) sin necesidad de reentrenar, y que entrenar a esa misma resolución consolida la ganancia. Además, se observa que una resolución de 1280 píxeles produce peores resultados que 960, atribuido a artefactos de letterboxing debidos al stride del modelo, lo que subraya la importancia de seleccionar empíricamente la resolución de inferencia.

## Capacidades

- Detección de objetos de una sola clase: pelota de tenis, en fotogramas individuales o secuencias de vídeo.
- Inferencia a resoluciones de hasta 1920 píxeles, con rendimiento óptimo a 960 píxeles.
- Integración con el ecosistema Ultralytics (YOLO) mediante la API de Python.
- Salida de cajas delimitadoras con coordenadas y confianza, adecuada para postprocesado (seguimiento, interpolación de trayectorias).
- No soporta tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de visión.
- No ofrece capacidades multilingües ni de generación de texto.

## Casos de uso

- Anotación automática de partidos de tenis: el detector alimenta el pipeline `tennis-auto-scoring`, que determina el resultado de cada punto a partir de eventos como doble bote o pelota fuera de límites, sin necesidad de árbitro humano.
- Análisis deportivo en retransmisiones: seguimiento de la pelota en vídeo para generar estadísticas de velocidad, distancia recorrida o patrones de juego.
- Asistencia a entrenadores: análisis de vídeo de partidos de aficionados para evaluar la precisión de los golpes y la colocación de la pelota.
- Herramientas de arbitraje asistido: aunque el modelo no adjudica líneas, puede complementar sistemas de revisión al proporcionar la posición de la pelota en cada fotograma.
- Investigación en visión por computador: como caso de estudio de detección de objetos pequeños en vídeo deportivo, útil para comparar estrategias de resolución y arquitecturas.
- Automatización de clips destacados: identificación de momentos en los que la pelota está en juego para recortar automáticamente las jugadas relevantes.

## Benchmarks y rendimiento

Según la model card, el modelo se evaluó frente al baseline YOLOv5l6u (86M) sobre el mismo conjunto de validación y a `imgsz=960`. Los resultados son:

| Metrica | Baseline (YOLOv5l6u, 86M) | Este modelo (YOLOv8m, 25.9M) |
|---|---|---|
| mAP50 | 0.5878 | **0.8996** |
| mAP50-95 | 0.2212 | **0.4581** |
| Precision | 0.633 | **0.925** |
| Recall | 0.581 | **0.871** |

En un clip amateur de 15 segundos nunca visto, la pelota se detecta en el 98,2 % de los fotogramas. El throughput end-to-end del pipeline completo (jugadores, pelota y cancha) es de 9,3 fps en una Tesla T4, aunque el modelo aislado alcanza 20 fps a 960 píxeles según la tabla de barrido de resolución. El barrido de resolución mostró los siguientes resultados:

| imgsz | Tasa de deteccion | Confianza media | Velocidad |
|---|---|---|---|
| 640 | 47.0 % | 0.329 | 32 fps |
| **960** | **95.6 %** | 0.366 | 20 fps |
| 1280 | 78.3 % | 0.394 | 12 fps |
| 1920 | 96.2 % | 0.337 | 6 fps |

No se han publicado resultados en benchmarks estandarizados como COCO o ImageNet para este modelo específico.

## Requisitos de hardware

- El modelo tiene 25,9 millones de parámetros y ocupa unos 50 MB, por lo que es ligero y puede ejecutarse en GPUs de consumo.
- Según la documentación, se entrenó y evaluó en una Tesla T4 (16 GB VRAM), donde alcanza 20 fps a `imgsz=960` (solo el modelo) y 9,3 fps en el pipeline completo.
- Para inferencia en tiempo real (≥20 fps) se recomienda una GPU con al menos 8 GB de VRAM; tarjetas como RTX 3060, RTX 4070 o superiores son suficientes.
- En CPU, la inferencia sería mucho más lenta; se desaconseja para uso en tiempo real.
- Opciones de despliegue: al ser un modelo Ultralytics, se puede servir con la propia librería, o exportarse a formatos como ONNX, TensorRT o CoreML para optimización. También es compatible con frameworks como vLLM o TGI solo si se convierte a un formato adecuado, aunque no es el uso previsto.
- No se dispone de datos de latencia para cuantizaciones (FP16, INT8) ni de throughput en otras GPUs.

## Comparativa con modelos similares

El modelo se compara directamente con el baseline que reemplaza en el proyecto `tennis-auto-scoring`:

| Modelo | Parametros | mAP50 | mAP50-95 | Precision | Recall | Licencia |
|---|---|---|---|---|---|---|
| YOLOv5l6u (baseline) | 86M | 0.5878 | 0.2212 | 0.633 | 0.581 | AGPL-3.0 |
| **Este modelo (YOLOv8m fine-tuned)** | **25.9M** | **0.8996** | **0.4581** | **0.925** | **0.871** | AGPL-3.0 |

No se dispone de comparativas con otros detectores de pelota de tenis específicos. En términos generales, YOLOv8m es una arquitectura más moderna que YOLOv5l6u, con mejor relación precisión/velocidad, y el fine-tuning a 960 píxeles multiplica el rendimiento sobre el dominio objetivo.

## Limitaciones y advertencias

- El modelo solo ha sido evaluado en vídeo con cámara elevada tras la línea de fondo (framing de retransmisión); no se ha probado en ángulos cenitales o desde drones, donde el rendimiento puede degradarse.
- No realiza adjudicación de líneas: el sistema completo utiliza el detector para seguir la pelota, pero los puntos se deciden por eventos como doble bote o salida de límites, no por si la pelota tocó una línea.
- No proporciona posición 3D ni velocidad de la pelota; la homografía proyecta la pelota en el plano de la cancha, lo que introduce errores cuando la pelota está en el aire.
- El conjunto de entrenamiento es modesto y la validación pequeña; los resultados deben interpretarse como evidencia de funcionamiento en este tipo de footage, no como una afirmación general de rendimiento.
- La licencia AGPL-3.0 impone obligaciones si se utiliza en un servicio en red; es necesario revisar los términos antes de desplegarlo comercialmente.
- La resolución de inferencia es crítica: usar el valor por defecto de 640 píxeles reduce drásticamente la detección (47 %), por lo que debe fijarse explícitamente `imgsz=960`.
- Se recomienda un umbral de confianza bajo (0.15) para minimizar falsos negativos, lo que puede generar cajas espurias que deben filtrarse en el postprocesado.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/kjfk/tennis-ball-detector-yolov8m)
- [Repositorio del proyecto tennis-auto-scoring](https://github.com/GuptaOum/tennis-auto-scoring)
- [Script de entrenamiento](https://github.com/GuptaOum/tennis-auto-scoring/blob/main/training/train_ball.py)
- [Dataset en Roboflow](https://universe.roboflow.com/) (referencia a `tennis-ball-detection-6`)
