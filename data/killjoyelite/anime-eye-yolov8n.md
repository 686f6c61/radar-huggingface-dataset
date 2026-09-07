# killjoyelite/anime-eye-yolov8n

## Resumen

El modelo `killjoyelite/anime-eye-yolov8n` es un detector de objetos especializado en localizar ojos en ilustraciones de estilo anime. Se trata de un fine-tuning de la arquitectura YOLOv8n de Ultralytics, entrenado por el usuario `killjoyelite` con un dataset propio de 212 imágenes generadas por IA, mayoritariamente de personajes femeninos. El modelo resuelve un problema concreto en pipelines de generación de arte anime: la automatización del detallado o inpainting de los ojos, que es una de las zonas más críticas para la calidad visual del resultado.

Está diseñado para integrarse en ComfyUI junto con el paquete Impact Pack, de forma similar a como se usan los detectores `face_yolov8n.pt` y `hand_yolov8n.pt`. Su relevancia actual radica en que permite a los flujos de trabajo de generación de anime identificar automáticamente los ojos y aplicar mejoras selectivas sin tener que etiquetar manualmente cada imagen. La arquitectura es YOLOv8n (variante nano), un modelo ligero de detección de objetos con una sola clase (`eye`). No se dispone de información sobre el número total de parámetros ni sobre la longitud de contexto, ya que no es un modelo de lenguaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n (Ultralytics), detector de una sola clase (`eye`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (detección de objetos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (Ultralytics) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `yolov8n.pt` de Ultralytics y se ha fine-tuneado para la detección de una única clase: ojos en arte anime. El entrenamiento se realizó sobre 212 imágenes auto-generadas por el autor (principalmente personajes femeninos), etiquetadas manualmente con bounding boxes alrededor de cada ojo visible. La configuración de entrenamiento fue de 100 épocas, con tamaño de imagen de 640 píxeles y batch size de 8.

No se han empleado técnicas de RLHF ni DPO, ya que no es un modelo de lenguaje. Tampoco se documentan innovaciones técnicas destacables más allá del fine-tuning convencional sobre una arquitectura YOLOv8n. El valor principal del modelo reside en la especificidad del dominio y en su integración con ComfyUI, más que en una novedad arquitectónica.

## Capacidades

- Detección de ojos en ilustraciones de estilo anime, con una única clase (`eye`).
- Integración nativa con ComfyUI a través de `UltralyticsDetectorProvider` y `BboxDetectorSEGS` del paquete Impact Pack.
- Permite generar bounding boxes para uso en flujos de inpainting y detallado selectivo mediante el nodo `Detailer (SEGS)`.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades de agentes.
- No es multimodal: no procesa texto, audio ni vídeo; solo imágenes de entrada para detección.
- No tiene capacidades multilingües, al no ser un modelo de lenguaje.
- Capacidad especial: detección de ojos en un dominio visual muy concreto (anime), con métricas de validación elevadas sobre el split del autor.

## Casos de uso

- Detallado de ojos en ComfyUI: el modelo se usa con `UltralyticsDetectorProvider` para obtener los bounding boxes de los ojos y, a continuación, se aplica el nodo `Detailer (SEGS)` para regenerar la zona con un nivel de denoise entre 0.5 y 0.7, consiguiendo un acabado más fino.
- Inpainting selectivo de ojos en ilustraciones generadas: permite generar máscaras automáticas sobre los ojos y aplicar un modelo de inpainting localizado, evitando modificar el resto de la imagen.
- Post-procesado en pipelines de generación de anime: tras generar una imagen con Stable Diffusion, se detectan los ojos y se aplican mejoras de resolución o re-estilizado únicamente sobre esas regiones.
- Edición de personajes: reemplazar los ojos de un personaje por otro estilo, usando el bounding box del modelo para guiar un modelo de inpainting o de transferencia de estilo.
- Asistencia a artistas digitales: localizar automáticamente los ojos en bocetos o ilustraciones para aplicar correcciones de proporción o de estilo sin necesidad de selección manual.
- Automatización de retoque en producción de ilustraciones: en lugar de etiquetar manualmente cada imagen, se usa el modelo para obtener bounding boxes en lotes de imágenes y alimentar procesos de control de calidad o de mejora automática.

## Benchmarks y rendimiento

Según la model card del autor, el rendimiento sobre la partición de validación es el siguiente:

| Metric | Score |
|---|---|
| mAP50 | 0.995 |
| mAP50-95 | 0.681 |
| Precision | 0.998 |
| Recall | 1.000 |

Estos resultados corresponden a un dataset de validación muy pequeño (parte de las 212 imágenes totales) y deben interpretarse con cautela. No se han publicado benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Al tratarse de un modelo YOLOv8n, es un modelo ligero, pero no se aportan cifras concretas de consumo de VRAM en la información proporcionada.
- Opciones de despliegue: ComfyUI con Impact Pack (`UltralyticsDetectorProvider`, `BboxDetectorSEGS`, `Detailer (SEGS)`) y la librería Ultralytics para inferencia directa.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa completa. Se han identificado dos modelos similares en Hugging Face:

- `Fuyucchi/yolov8_animeface`: un detector de caras de anime basado en YOLOv8, pero orientado a rostros completos, no a ojos.
- `jags/yolov8_model_segmentation-set`: incluye un checkpoint `Anime-yolov8-seg.pt` para segmentación de anime, con un enfoque distinto al de detección de objetos.

Las especificaciones técnicas y los benchmarks de estos modelos no están disponibles en la información proporcionada, por lo que no se puede establecer una comparativa numérica.

## Limitaciones y advertencias

- Sesgo de género: el modelo fue entrenado predominantemente con personajes femeninos, por lo que la detección en ojos de personajes masculinos es menos fiable y puede producir falsos negativos.
- Dificultad con ojos muy grandes, cartoony o de estilo chibi que se desvían de las proporciones estándar del anime.
- Generalización limitada: al estar entrenado con un único estilo de generación, puede funcionar peor en estilos muy diferentes (pintura, arte no anime, estilos muy estilizados).
- Dataset pequeño: las 212 imágenes de entrenamiento limitan la robustez real del modelo frente a la diversidad del arte anime.
- Licencia MIT: permite uso comercial, pero los usuarios deben verificar de forma independiente las licencias de los checkpoints base utilizados para generar sus propias imágenes de entrenamiento o inferencia si ello es relevante para su caso de uso.
- Riesgo de alucinación: no aplica en el sentido clásico de los modelos de lenguaje, pero pueden producirse detecciones erróneas (falsos positivos) o ausencia de detección (falsos negativos) en ciertas imágenes.

## Enlaces

- Hugging Face: https://huggingface.co/killjoyelite/anime-eye-yolov8n
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- Impact Pack: https://github.com/ltdrdata/ComfyUI-Impact-Pack
- Ultralytics: https://github.com/ultralytics/ultralytics
- Fuyucchi/yolov8_animeface: https://huggingface.co/Fuyucchi/yolov8_animeface
- jags/yolov8_model_segmentation-set: https://huggingface.co/jags/yolov8_model_segmentation-set
