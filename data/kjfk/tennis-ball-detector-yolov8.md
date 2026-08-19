# kjfk/tennis-ball-detector-yolov8

## Resumen

El modelo `kjfk/tennis-ball-detector-yolov8` es un detector de objetos especializado en la detección de pelotas de tenis en imágenes de transmisión de partidos. Desarrollado por el usuario kjfk, se basa en la arquitectura YOLOv8m (26 millones de parámetros) y ha sido ajustado mediante fine-tuning sobre un conjunto de datos propio, aunque no se especifican los detalles del dataset. Su relevancia radica en la mejora significativa de la precisión frente al modelo base sin ajuste, especialmente al aumentar la resolución de inferencia, un hallazgo clave que demuestra la importancia de entrenar y servir el modelo a la misma resolución.

El modelo está disponible bajo licencia AGPL-3.0, heredada de Ultralytics, y se distribuye a través de Hugging Face con un tamaño de repositorio de 0.1 GB. Está diseñado para su uso con la librería Ultralytics, lo que facilita su integración en pipelines de visión por computador. Aunque no se proporcionan datos sobre idiomas (al ser un modelo de visión, no aplica), su uso principal es el análisis deportivo, específicamente el seguimiento de la pelota en partidos de tenis.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8m (CNN de detección de objetos) |
| Parametros totales | 26 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | AGPL-3.0 |
| Formato de pesos | .pt (PyTorch, según ejemplo de uso) |

## Arquitectura y entrenamiento

El modelo se basa en YOLOv8m, una red neuronal convolucional (CNN) de detección de objetos de una sola etapa, diseñada para equilibrar precisión y velocidad. El fine-tuning se realizó sobre un conjunto de datos de imágenes de transmisión de tenis, aunque no se detallan el número de imágenes ni el proceso de entrenamiento (épocas, optimizador, etc.). La innovación más destacable reportada por el autor es el efecto de la resolución de inferencia: al aumentar `imgsz` de 640 (valor por defecto) a 960, la detección mejoró de 47% a 95.6% sin necesidad de reentrenar, lo que subraya la importancia de alinear la resolución de entrenamiento con la de inferencia. El modelo fue entrenado a una resolución de 960, y el autor recomienda ajustar este valor según el tamaño aparente de la pelota en el vídeo (960 para planos cerrados, 1600 para planos amplios).

## Capacidades

- Detección de pelotas de tenis en imágenes y vídeo, con alta precisión en condiciones de transmisión.
- Inferencia a resoluciones variables (960, 1600, etc.) mediante el parámetro `imgsz` de Ultralytics.
- Integración sencilla con la librería Ultralytics YOLO, permitiendo predicción en tiempo real.
- Capacidad de ajuste fino del umbral de confianza (recomendado `conf=0.02`) para maximizar la detección en escenarios de baja visibilidad.
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente de visión.
- No tiene capacidades multilingües ni de generación de texto.

## Casos de uso

- Análisis de partidos de tenis: el modelo puede detectar la posición de la pelota en cada fotograma, permitiendo reconstruir trayectorias y generar estadísticas de golpeo, velocidad y dirección.
- Seguimiento de pelota en tiempo real: integrado en sistemas de transmisión, puede alimentar gráficos superpuestos que muestran la posición de la pelota durante el juego.
- Entrenamiento deportivo: los entrenadores pueden usar el detector para analizar vídeos de entrenamiento y evaluar la precisión de los golpes de los jugadores.
- Automatización de clips destacados: al identificar los momentos en que la pelota está en juego, se pueden recortar automáticamente los puntos más relevantes de un partido.
- Investigación en visión por computador: sirve como punto de partida para experimentos sobre detección de objetos pequeños en vídeo, dado el hallazgo sobre la resolución de inferencia.
- Desarrollo de aplicaciones de realidad aumentada: la detección de la pelota puede usarse para superponer información virtual en retransmisiones, como líneas de trayectoria o velocidad.

## Benchmarks y rendimiento

El autor proporciona resultados medidos en un conjunto de validación retenido, comparando el modelo base (YOLOv8m sin fine-tuning) y el modelo ajustado, ambos a `imgsz=960`:

| Metrica | Baseline (YOLOv8m) | Fine-tuned |
|---|---|---|
| mAP50 | 0.5878 | **0.8996** |
| mAP50-95 | 0.2212 | **0.4581** |
| Precision | 0.633 | **0.925** |
| Recall | 0.581 | **0.871** |

Además, se reporta que al aumentar la resolución de inferencia de 640 a 960, la detección pasó de 47% a 95.6% sin reentrenar, y que el modelo de 26M parámetros superó a un baseline de 86M parámetros, principalmente por haber sido entrenado a la resolución de servicio. No se dispone de comparaciones con otros detectores de pelota de tenis en la información proporcionada.

## Requisitos de hardware

- Al ser un modelo YOLOv8m (26M parámetros), es ligero y puede ejecutarse en GPUs de consumo medio. Se estima que requiere al menos 4 GB de VRAM para inferencia en FP16, aunque no se especifica oficialmente.
- GPUs recomendadas: NVIDIA GTX 1060 o superior, RTX 2060, RTX 3060, o cualquier GPU con soporte CUDA. También puede ejecutarse en CPU, aunque con menor rendimiento.
- Es adecuado para inferencia en tiempo real en hardware de gama media, dado el diseño eficiente de YOLOv8.
- Opciones de despliegue: la librería Ultralytics permite exportar a ONNX, TensorRT o CoreML, y puede integrarse con frameworks como vLLM (aunque no es típico para visión) o servidores de inferencia como TorchServe. También es compatible con Ollama si se convierte a formato GGUF, aunque no es el flujo habitual.
- La latencia y el throughput dependen del hardware y la resolución; a 960 píxeles, en una GPU moderna se esperan decenas de FPS, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

No se dispone de información sobre otros detectores de pelota de tenis con los que comparar directamente. El único punto de referencia es el modelo base YOLOv8m sin fine-tuning, cuyos resultados se muestran en la tabla de benchmarks. El autor menciona que su modelo supera a un baseline de 86M parámetros, pero no se identifica ese modelo. Por tanto, la comparativa se limita al baseline interno.

## Limitaciones y advertencias

- La detección puede fallar en condiciones de baja iluminación, oclusiones o cuando la pelota aparece muy pequeña en el encuadre; el autor recomienda ajustar la resolución de inferencia según el tamaño aparente de la pelota.
- El umbral de confianza debe mantenerse bajo (0.02) para no perder detecciones, lo que puede generar falsos positivos (líneas, zapatos, etc.) que deben resolverse mediante análisis de trayectoria.
- La licencia AGPL-3.0 implica que cualquier uso del modelo en un servicio en red debe publicar el código fuente de la aplicación, lo que puede ser restrictivo para uso comercial propietario.
- No se proporcionan datos sobre el dataset de entrenamiento, por lo que no se pueden evaluar posibles sesgos o limitaciones de generalización a otros tipos de vídeo (p. ej., pistas de tierra batida vs. hierba).
- El modelo está especializado en pelotas de tenis; no es útil para otros objetos o escenarios.
- No se han publicado resultados de benchmarks en la información disponible más allá de los proporcionados por el autor.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/kjfk/tennis-ball-detector-yolov8)
- [Modelo similar (kjfk/tennis-ball-detector-yolov8m)](https://huggingface.co/kjfk/tennis-ball-detector-yolov8m)
- [Paper: Automated Tennis Player and Ball Tracking with Court Keypoints (arXiv)](https://arxiv.org/abs/2511.04126)
- [Repositorio GitHub: Tennis-Ball-YOLOV8](https://github.com/JoelSon1014/Tennis-Ball-YOLOV8)
