# aurakz/Depth-Anything-V2-Small-hf

## Resumen

Depth-Anything-V2-Small-hf es la conversión al ecosistema Transformers del checkpoint "Small" del modelo Depth Anything V2, un estimador de profundidad monocular (MDE) desarrollado por Lihe Yang y colaboradores (Universidad de Hong Kong y TikTok). El repositorio `aurakz/Depth-Anything-V2-Small-hf` empaqueta los pesos en formato safetensors para que puedan cargarse directamente mediante `AutoModelForDepthEstimation` y la clase DPT de Transformers, sin necesidad de recurrir al repositorio original basado en código propio.

El modelo resuelve la predicción de profundidad relativa a partir de una única imagen RGB, sin calibración estéreo ni sensores adicionales. Su relevancia radica en que combina un backbone DINOv2 con la cabeza de decodificación DPT y un entrenamiento a gran escala sobre aproximadamente 595.000 imágenes sintéticas etiquetadas y más de 62 millones de imágenes reales sin etiquetar, lo que le permite generalizar en zero-shot a dominios no vistos con un coste computacional muy inferior al de los modelos basados en difusión (Marigold, GeoWizard).

La variante Small cuenta con 24.785.089 parámetros y un repositorio de apenas 0,1 GB, lo que la sitúa en el rango de modelos desplegables en hardware de consumo. Está publicada bajo licencia Apache 2.0 y es compatible con los endpoints de Hugging Face, aunque el widget de inferencia aparece desactivado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DPT con backbone DINOv2 (ViT-Small) |
| Parametros totales | 24.785.089 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen única) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización no documentada por el autor) |
| Idiomas soportados | no disponible (modelo sin componente textual) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DPT (Dense Prediction Transformer), que acopla un encoder ViT con un decodificador convolucional multi-escala que reconstruye un mapa de profundidad denso a partir de los tokens del transformer. El backbone es DINOv2 en su variante Small, preentrenado con auto-supervisión sobre un corpus masivo de imágenes, lo que aporta representaciones visuales robustas y transferibles.

El entrenamiento de Depth Anything V2 se articula en dos fases: primero se entrena un modelo profesor de gran capacidad exclusivamente con datos sintéticos etiquetados (aproximadamente 595.000 imágenes), y después se destila ese conocimiento a modelos estudiantes (entre ellos esta variante Small) sobre más de 62 millones de imágenes reales sin etiquetar. Esta estrategia evita los artefactos y el ruido de profundidad que introducen los datos reales etiquetados de forma imperfecta y permite obtener predicciones más finas que la versión V1. La model card no detalla si se emplearon técnicas de RLHF/DPO, algo por otra parte ajeno a un modelo de regresión densa como este.

## Capacidades

- Estimación de profundidad monocular relativa en zero-shot sobre imágenes RGB arbitrarias.
- Predicción de profundidad densa por píxel, con mayor nivel de detalle en bordes y estructuras finas que Depth Anything V1.
- Mayor robustez frente a dominios no vistos en comparación con V1 y con modelos de profundidad basados en difusión (Marigold, GeoWizard).
- Inferencia aproximadamente 10 veces más rápida y más ligera que los enfoques basados en modelos de difusión.
- Integración nativa con Transformers mediante `pipeline("depth-estimation")` y las clases `AutoImageProcessor` / `AutoModelForDepthEstimation`.
- Capacidad de servir como base para fine-tuning en tareas de profundidad específicas de dominio.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de regresión.

## Casos de uso

- Reconstrucción 3D y fotogrametría: el mapa de profundidad denso por píxel sirve como entrada para generar nubes de puntos o mallas a partir de una sola imagen, útil en pipelines de escaneo con un único sensor RGB.
- Realidad aumentada y efectos de desenfoque de fondo: la profundidad relativa permite segmentar primer plano y fondo para aplicar bokeh sintético o superponer objetos virtuales con oclusión coherente en aplicaciones móviles.
- Robótica y navegación asistida: un modelo de 24,8 M de parámetros puede ejecutarse en tiempo real en GPUs embebidas (Jetson) para estimar distancias relativas en tareas de evitación de obstáculos.
- Automoción y ADAS de bajo coste: estimación de profundidad como señal auxiliar en sistemas de percepción que combinan cámara monocular con otros sensores, aprovechando su robustez en dominios no vistos.
- Generación de datos sintéticos y ControlNet: los mapas de profundidad se emplean como condicionamiento en pipelines de difusión para controlar la composición espacial de imágenes generadas.
- Preprocesado en edición de vídeo y postproducción: extracción de profundidad por fotograma para crear efectos de paralaje, relighting o composición multicapa.
- Fine-tuning en nichos verticales: al ser Apache 2.0 y ligero, es una base práctica para reentrenar sobre dominios específicos (endoscopia, inspección industrial, agricultura) con presupuestos de cómputo reducidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas numéricas de métricas (AbsRel, δ1, RMSE) para esta variante Small; únicamente afirma de forma cualitativa que supera a Depth Anything V1 y a los modelos basados en difusión en robustez y fineza de detalle, y que es aproximadamente 10 veces más rápido que estos últimos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para una imagen de resolución estándar (el checkpoint pesa 0,1 GB); en fp16 aproximadamente 50 MB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona sin problemas en RTX 3060, RTX 4090, A100 y H100, aunque el modelo está claramente sobredimensionado para estas últimas.
- Cabe holgadamente en GPU de consumo, incluidas GTX 1650, RTX 3050 y GPUs integradas con soporte CUDA; también es viable en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: Transformers (`pipeline` o clases `AutoModelForDepthEstimation`), exportación a ONNX, TensorRT y TorchScript; no se documenta soporte nativo en llama.cpp u Ollama por tratarse de un modelo de visión.
- Latencia y throughput: no disponibles de forma oficial; la model card solo indica que es aproximadamente 10 veces más rápido que los modelos de profundidad basados en difusión.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Depth-Anything-V2-Small-hf | 24,8 M | DPT + DINOv2-S | Imagen única | Apache 2.0 | Hugging Face (Transformers) |
| Depth Anything V2 (variantes Base/Large) | no disponible en la informacion | DPT + DINOv2-B/L | Imagen única | Apache 2.0 (repo original) | Hugging Face y GitHub |
| Depth Anything V1 | no disponible en la informacion | DPT + DINOv2 | Imagen única | Apache 2.0 | Hugging Face y GitHub |
| Marigold | no disponible en la informacion | Difusión (SD) | Imagen única | no disponible | Hugging Face |
| Geowizard | no disponible en la informacion | Difusión | Imagen única | no disponible | Hugging Face |

Los datos de parámetros, contexto y licencia de los modelos alternativos no están recogidos en la información proporcionada, por lo que se indican como no disponibles. La comparación cualitativa que sí aporta la model card sitúa a Depth Anything V2 por delante de V1 y de los modelos de difusión en fineza y robustez, y muy por delante en eficiencia (unas 10 veces más rápido).

## Limitaciones y advertencias

- El modelo predice profundidad relativa, no absoluta: no proporciona distancias métricas calibradas sin un post-procesado adicional.
- Puede presentar sesgos heredados de los datos de entrenamiento (DINOv2 y el corpus sintético/real), con posibles degradaciones en escenas muy alejadas de la distribución de entrenamiento.
- Riesgo de alucinación de estructura en regiones ambiguas, texturas repetitivas o superficies reflectantes y transparentes.
- No es un modelo multimodal ni de lenguaje: no procesa texto, no soporta tool calling ni razonamiento multi-paso.
- La licencia Apache 2.0 permite uso comercial, pero el autor del repositorio de conversión (`aurakz`) no ofrece garantías sobre la equivalencia numérica exacta con los pesos originales de `depth-anything/Depth-Anything-V2-Small-hf`; conviene validar contra el checkpoint oficial antes de llevarlo a producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria.
- El widget de inferencia está desactivado en la model card (`inference: false`), lo que impide probar el modelo directamente desde la interfaz de Hugging Face.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aurakz/Depth-Anything-V2-Small-hf
- Checkpoint oficial en Transformers: https://huggingface.co/depth-anything/Depth-Anything-V2-Small-hf
- Paper Depth Anything V2: https://arxiv.org/abs/2406.09414
- Paper Depth Anything V1: https://arxiv.org/abs/2401.10891
- Repositorio original en GitHub: https://github.com/LiheYoung/Depth-Anything
- Demo online: https://huggingface.co/spaces/depth-anything/Depth-Anything-V2
- Documentación de DPT en Transformers: https://huggingface.co/docs/transformers/model_doc/dpt
- Documentación de DINOv2 en Transformers: https://huggingface.co/docs/transformers/model_doc/dinov2
- Documentación de Depth Anything en Transformers: https://huggingface.co/transformers/main/model_doc/depth_anything.html
