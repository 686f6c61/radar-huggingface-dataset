# killjoyelite/anime-eye-yolov8

## Resumen

Anime Eye Detector es un modelo de detección de objetos basado en YOLOv8, desarrollado por el usuario killjoyelite y publicado en Hugging Face. Su tarea es concreta y monoespecífica: localizar los ojos (clase única `eye`) en ilustraciones de personajes de estilo anime y semirrealista. Se distribuye en dos variantes, `eye_yolov8n.pt` (nano) y `eye_yolov8s.pt` (small), ambas derivadas de los checkpoints preentrenados de Ultralytics y afinadas sobre un conjunto propio de imágenes generadas por el autor y anotadas manualmente.

El modelo no es un LLM ni un modelo multimodal generativo: es un detector de cajas delimitadoras pensado para integrarse en flujos de trabajo de ComfyUI mediante Impact Pack. Su función es la de un detector auxiliar que segmenta la región ocular para que un nodo `Detailer (SEGS)` pueda redibujar o reparar los ojos sin alterar el resto de la imagen, de forma análoga a como se usan `face_yolov8n.pt` y `hand_yolov8n.pt` en pipelines de inpainting facial y de manos.

La relevancia actual es práctica: cubre un hueco en los detectores genéricos de rostro, que en arte anime fallan con frecuencia por la estilización extrema de los ojos. El repo ocupa 0,1 GB y acumula 1449 descargas, lo que indica adopción dentro de la comunidad de ComfyUI pese a su escasa visibilidad social (3 likes).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8 (detector de objetos de una etapa, backbone CNN + cabeza de detección) |
| Parametros totales | no disponible (variantes nano y small de YOLOv8; Ultralytics no publica el recuento exacto en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos `.pt` de PyTorch; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto; las etiquetas son la clase `eye`) |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch, checkpoints de Ultralytics) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLOv8 de Ultralytics, un detector de una etapa con backbone convolucional y cabezas de predicción ancladas libres (anchor-free), configurado para una única clase (`eye`). Se parte de los pesos preentrenados `yolov8n.pt` y `yolov8s.pt` y se realiza un fine-tuning supervisado con anotaciones de cajas delimitadoras alrededor de cada ojo visible.

El conjunto de entrenamiento es propio y generado por el autor: 286 imágenes de estilo anime y semirrealista (mayoritariamente personajes femeninos) generadas con IA y etiquetadas manualmente, según la versión 2.0. La configuración de entrenamiento documentada es de 100 épocas, tamaño de imagen 640 y batch size 8. No se detalla la composición exacta del dataset, el uso de aumentos de datos, ni si hubo validación cruzada; tampoco se mencionan técnicas de destilación, pruning o cuantización.

## Capacidades

- Detección de objetos de clase única: localiza ojos individuales en ilustraciones anime y semirrealistas mediante cajas delimitadoras.
- Detección multi-ojo por imagen: devuelve una caja por cada ojo visible, lo que permite procesar personajes con ambos ojos en distintos ángulos y poses.
- Integración nativa con ComfyUI a través de Impact Pack (`UltralyticsDetectorProvider`, `BboxDetectorSEGS`, `Detailer (SEGS)`).
- Instalación directa desde ComfyUI-Manager (búsqueda "eye" en Install Models).
- Dos tamaños de modelo (nano y small) para intercambiar velocidad y precisión.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, visión general, audio ni modo thinking: es exclusivamente un detector visual.

## Casos de uso

- Reparación de ojos en generación de imágenes con ComfyUI: el detector alimenta un nodo `Detailer (SEGS)` que redibuja la región ocular con un prompt específico (por ejemplo, cambio de color de iris), manteniendo intacto el resto del lienzo. Es el caso de uso principal documentado por el autor.
- Inpainting selectivo de ojos en pipelines de restauración: en imágenes anime con ojos borrosos o mal generados, el detector aísla la región y permite un segundo paso de difusión con `denoise` entre 0,5 y 0,7 para corregir el detalle sin recomponer la cara completa.
- Automatización de postprocesado por lotes: integrado en scripts que recorren carpetas de imágenes generadas y aplican el detailer solo donde se detectan ojos, reduciendo el coste computacional frente a redibujar la imagen entera.
- Control de calidad en datasets de entrenamiento: uso del detector para verificar que las imágenes sintéticas contienen ojos bien formados antes de incorporarlas a un dataset de fine-tuning, filtrando muestras defectuosas.
- Anotación asistida: preetiquetado automático de ojos en nuevas imágenes para acelerar el etiquetado manual en la expansión del dataset, dado el bajo coste de inferencia de las variantes nano y small.
- Segmentación de regiones para métricas o análisis: extracción de coordenadas oculares para estudios de composición, alineación de personajes o comparación de estilos entre checkpoints generativos.
- Integración en herramientas de edición de personajes: detección de ojos como paso previo a la aplicación de expresiones, parpadeos o cambios de mirada en flujos de animación 2D asistida.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el split de validación:

| Metrica | Nano (yolov8n) | Small (yolov8s) |
|---|---|---|
| mAP50 | 0,982 | 0,989 |
| mAP50-95 | 0,663 | 0,670 |
| Precision | 0,997 | 0,981 |
| Recall | 0,964 | 0,954 |

No se han publicado resultados comparativos con otros detectores de ojos en anime en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de las variantes YOLOv8 nano y small, la inferencia cabe holgadamente en GPUs de consumo, aunque el autor no publica cifras.
- GPU recomendadas: cualquier GPU con soporte CUDA compatible con PyTorch y Ultralytics; las variantes nano y small están pensadas para ejecución en tiempo real en hardware modesto.
- Cabe en GPU de consumo: sí, previsiblemente en modelos tipo RTX 3060, RTX 4060 o superiores, así como en GPUs integradas con backend CPU, aunque no se documentan cifras concretas.
- Opciones de despliegue: Ultralytics (PyTorch), ComfyUI con Impact Pack, exportación a otros formatos vía Ultralytics (ONNX, TensorRT) aunque no se documenta en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Clases | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Anime Eye Detector (este) | Detección de ojos en anime | 1 (`eye`) | MIT | `.pt` | Hugging Face, ComfyUI-Manager |
| `face_yolov8n.pt` (referencia del autor) | Detección de rostros | Rostro | no disponible en la información | `.pt` | Uso común en ComfyUI/Impact Pack |
| `hand_yolov8n.pt` (referencia del autor) | Detección de manos | Mano | no disponible en la información | `.pt` | Uso común en ComfyUI/Impact Pack |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los detectores de referencia en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Detección menos fiable en ojos de personajes masculinos que en femeninos, aunque el autor indica que ha mejorado en la versión 2.0.
- Entrenado sobre 286 imágenes (v2.0): las métricas de validación son altas, pero el tamaño reducido del dataset limita la robustez frente a estilos de arte no representados.
- Aunque se ha probado con estilos realistas, no se ha validado de forma extensa en todos los estilos artísticos.
- Riesgo de falsos positivos o negativos en ojos ocluidos, muy estilizados, de perfil extremo o con iluminación atípica; el autor invita a reportar casos de fallo.
- Licencia MIT, que permite uso comercial y modificación, pero el autor advierte que los usuarios deben verificar de forma independiente las condiciones de licencia de cualquier checkpoint base utilizado para generar sus propias imágenes de entrenamiento o inferencia.
- No es un modelo generativo ni un LLM: no debe esperarse comprensión semántica, generación de texto ni razonamiento; su única salida son cajas delimitadoras de la clase `eye`.
- No se documentan sesgos demográficos más allá de la observación sobre personajes masculinos, ni métricas de robustez fuera del split de validación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/killjoyelite/anime-eye-yolov8
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI Impact Pack: https://github.com/ltdrdata/ComfyUI-Impact-Pack
- Ultralytics (YOLOv8): no se incluye enlace explícito en la model card; referencia habitual en https://github.com/ultralytics/ultralytics
