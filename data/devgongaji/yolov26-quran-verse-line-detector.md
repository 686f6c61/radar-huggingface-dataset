# devgongaji/yolov26-quran-verse-line-detector

## Resumen

El modelo `devgongaji/yolov26-quran-verse-line-detector` es un detector de objetos basado en la arquitectura YOLOv26s (Small), entrenado específicamente para identificar y delimitar con cajas delimitadoras cada línea de verso en imágenes de páginas del Corán. Desarrollado por el autor `devgongaji`, el modelo aborda el problema del análisis de diseño de páginas coránicas, una tarea relevante para la digitalización, indexación y estudio automatizado de textos religiosos. Aunque la información disponible no especifica el número de parámetros ni el tamaño exacto del modelo, al tratarse de una variante "Small" de YOLOv26 se espera que sea ligero y adecuado para entornos con recursos limitados. El modelo se distribuye bajo licencia Apache 2.0 y está diseñado para su uso con la librería Ultralytics.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv26s (Small) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ms, en (según metadatos; se refiere a la documentación) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (se menciona `best.pt`, pero el repositorio tiene 0.0 GB) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLOv26s, una variante pequeña de la familia YOLO (You Only Look Once) para detección de objetos en una sola etapa. Esta arquitectura es conocida por su equilibrio entre velocidad y precisión, lo que la hace adecuada para tareas de análisis de imágenes en tiempo real o con recursos computacionales moderados. El entrenamiento se realizó durante 100 épocas, alcanzando unas métricas notables: precisión del 98,79 %, recall del 99,12 %, mAP@50 del 99,46 % y mAP@50-95 del 98,93 %. No se proporcionan detalles sobre el dataset utilizado, la composición de las imágenes de entrenamiento ni el proceso de optimización (por ejemplo, si se aplicaron técnicas de aumento de datos o ajuste fino). Tampoco se mencionan innovaciones técnicas específicas más allá de la propia arquitectura YOLOv26.

## Capacidades

- Detección de líneas de versos en imágenes de páginas del Corán, devolviendo cajas delimitadoras (bounding boxes) para cada línea.
- Procesamiento de imágenes de entrada y salida de coordenadas de cajas, listas para su uso en aplicaciones de análisis de diseño.
- Integración sencilla con la librería Ultralytics mediante la carga del modelo y la inferencia sobre imágenes.
- Soporte para múltiples idiomas en la documentación (malayo e inglés), aunque la funcionalidad es puramente visual.
- No se indican capacidades adicionales como clasificación, segmentación o detección de otros elementos.

## Casos de uso

- Digitalización de manuscritos coránicos: el modelo puede procesar escaneos de páginas y extraer automáticamente las líneas de versos, facilitando la creación de ediciones digitales estructuradas.
- Indexación de versos para aplicaciones de estudio: al detectar cada línea, se puede asociar a referencias numéricas (sura y aleya) y construir bases de datos consultables.
- Asistencia a la lectura para personas con discapacidad visual: integrado en un sistema de reconocimiento óptico, puede ayudar a localizar y leer versos específicos mediante síntesis de voz.
- Análisis de diseño de páginas para investigación académica: permite estudiar la disposición tipográfica y la variabilidad en diferentes ediciones del Corán.
- Automatización de la verificación de alineación de texto: en procesos de edición, se puede comprobar si las líneas detectadas coinciden con el texto esperado.
- Integración en aplicaciones móviles de lectura del Corán: al detectar líneas, se pueden ofrecer funciones de búsqueda, marcado o traducción interactiva sobre la imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. Sin embargo, la model card reporta las siguientes métricas de entrenamiento:

| Metrica | Valor |
|---|---|
| Precision | 98,79 % |
| Recall | 99,12 % |
| mAP@50 | 99,46 % |
| mAP@50-95 | 98,93 % |
| Epocas | 100 |

Estos valores indican un alto rendimiento en la tarea específica para la que fue entrenado, aunque no se especifica el conjunto de validación ni las condiciones de evaluación.

## Requisitos de hardware

- No se han publicado requisitos de hardware específicos en la información proporcionada.
- Dado que se trata de un modelo YOLOv26s (Small), es probable que sea ligero y pueda ejecutarse en GPUs de consumo (por ejemplo, RTX 3060 o superiores) e incluso en CPU, aunque no hay datos confirmados.
- La inferencia puede realizarse mediante la librería Ultralytics, que soporta ejecución en CPU, GPU y exportación a formatos como ONNX o TensorRT.
- No se dispone de estimaciones de VRAM, latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se puede establecer una comparativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en la detección de líneas de versos en páginas del Corán; su rendimiento en otros tipos de documentos o diseños no está garantizado.
- No se proporcionan detalles sobre el dataset de entrenamiento, por lo que pueden existir sesgos derivados de la procedencia de las imágenes (por ejemplo, variaciones en caligrafía, iluminación o resolución).
- El repositorio de HuggingFace muestra un tamaño de 0.0 GB, lo que sugiere que los pesos del modelo podrían no estar disponibles en el repositorio, a pesar de que la model card menciona un archivo `best.pt`. Esto podría impedir su uso directo.
- Al ser un modelo de detección de objetos, no genera texto ni tiene capacidades de razonamiento; su salida se limita a coordenadas de cajas.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que los datos de entrenamiento no tengan restricciones adicionales.

## Enlaces

- [HuggingFace - devgongaji/yolov26-quran-verse-line-detector](https://huggingface.co/devgongaji/yolov26-quran-verse-line-detector)
