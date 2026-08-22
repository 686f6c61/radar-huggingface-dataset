# ecampbelldspPhD/gliner-small-silver-onnx-cuda

## Resumen

El modelo `gliner-small-silver-onnx-cuda` es un artefacto de despliegue para reconocimiento de entidades nombradas (NER) en inglés, desarrollado por el usuario `ecampbelldspPhD`. Se trata de un fine-tuning del modelo base `gliner-community/gliner_small-v2.5` sobre un corpus de noticias en inglés con etiquetas de tipo "Silver" (generadas automáticamente, no anotadas manualmente). El modelo está especializado en tres clases de entidades: personas (PER), organizaciones (ORG) y ubicaciones (LOC). Incluye tanto el checkpoint en formato PyTorch como una exportación a ONNX en FP32 optimizada para ejecución con CUDA.

La relevancia de este modelo radica en su propósito de servir como artefacto final de despliegue en producción para tareas de extracción de entidades en textos periodísticos. Aporta una mejora absoluta de +0.095 en F1 macro sobre el baseline original de GLiNER-small, alcanzando un F1 macro de 0.648 en el conjunto de validación reservado. Además, la versión ONNX CUDA ofrece una aceleración de 1.38x en throughput respecto a la inferencia nativa en PyTorch BF16, con una concordancia de entidades del 99.63% entre ambas implementaciones.

El repositorio tiene un tamaño de 3.5 GB y está pensado para ser utilizado mediante una API desplegada con Docker Compose. El modelo es exclusivamente para inglés y presenta limitaciones derivadas de la naturaleza de los datos de entrenamiento (noticias scrapeadas y etiquetas automáticas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER (bi-encoder transformer) basado en `gliner-community/gliner_small-v2.5` |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (ONNX) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GLiNER (Generalist Model for Named Entity Recognition), que emplea un codificador transformer bidireccional (bi-encoder) capaz de identificar cualquier tipo de entidad mediante descripciones textuales. En este caso, el modelo base es `gliner_small-v2.5`, una versión compacta de GLiNER. El fine-tuning se realizó sobre un corpus de noticias en inglés scrapeado y limpiado, con etiquetas generadas automáticamente (Silver) que no fueron verificadas manualmente. El conjunto de datos se dividió a nivel de documento en tres particiones: entrenamiento (246 documentos, 2615 spans seguros), desarrollo (52 documentos, 597 spans) y holdout no tocado (54 documentos, 557 spans). El entrenamiento utilizó los spans seguros y se seleccionó un umbral de decisión de 0.35. La evaluación se realizó mediante F1 exacto a nivel de documento para cada tipo de entidad.

La exportación a ONNX se realizó en formato FP32 y se validó con `onnxruntime-gpu` y `CUDAExecutionProvider`. En una GPU NVIDIA GTX 1660 Ti de 6 GiB, la versión ONNX procesó 25,412 caracteres por segundo frente a 18,459 caracteres por segundo de la versión nativa PyTorch BF16, lo que supone una aceleración de 1.38x. La concordancia entre las salidas ONNX y nativas fue de 0.9963 en F1 de entidades, y la diferencia en F1 macro fue de -0.0008, considerada despreciable.

## Capacidades

- Reconocimiento de entidades nombradas (NER) para tres clases: personas (PER), organizaciones (ORG) y ubicaciones (LOC).
- Inferencia sobre texto en inglés, orientada a contenido periodístico.
- Soporte de ejecución mediante ONNX Runtime con aceleración CUDA, lo que permite un despliegue eficiente en GPUs NVIDIA.
- Compatible con el framework GLiNER, que permite personalizar los tipos de entidad mediante descripciones textuales (aunque este modelo está fijado a las tres clases mencionadas).
- Procesamiento de documentos largos: la validación se realizó sobre una muestra de 50 documentos con 256,453 caracteres, lo que indica capacidad para manejar textos extensos.
- Integración con una API REST desplegable mediante Docker Compose, según la configuración de despliegue final del autor.

## Casos de uso

- Extracción de entidades en artículos de noticias: el modelo puede identificar automáticamente personas, organizaciones y ubicaciones mencionadas en textos periodísticos, facilitando la indexación y el análisis de contenido.
- Monitorización de medios: permite rastrear menciones de entidades concretas (por ejemplo, empresas o políticos) en flujos de noticias, útil para estudios de reputación o inteligencia competitiva.
- Análisis de relaciones entre entidades: al extraer PER, ORG y LOC, se pueden construir grafos de co-ocurrencia para detectar conexiones entre actores y lugares en un corpus de noticias.
- Automatización de metadatos editoriales: en plataformas de contenido, el modelo puede generar etiquetas de entidades para clasificar artículos y mejorar la búsqueda y recomendación.
- Investigación en ciencias sociales: análisis de contenido de prensa para estudios de framing, agenda-setting o análisis de discurso, donde la extracción de entidades es un paso previo.
- Despliegue en producción con bajos requisitos de hardware: gracias a la exportación ONNX CUDA, puede ejecutarse en GPUs de gama media (como una GTX 1660 Ti de 6 GB) con un throughput de 25,412 caracteres/segundo, adecuado para procesamiento por lotes o APIs de baja latencia.

## Benchmarks y rendimiento

El autor proporciona resultados de evaluación sobre el conjunto de holdout no tocado, utilizando F1 exacto a nivel de documento para cada tipo de entidad. También se comparan las versiones ONNX y nativa.

| Metrica | F1 |
|---|---|
| PER | 0.766 |
| ORG | 0.486 |
| LOC | 0.693 |
| Macro F1 | 0.648 |

La mejora absoluta sobre el baseline original de GLiNER-small es de +0.095 en F1 macro. En la validación ONNX, el acuerdo entre las salidas ONNX y nativas fue de 0.9963 en F1 de entidades, y el F1 macro de la versión ONNX fue de 0.662, frente a 0.662 de la versión nativa (delta -0.0008).

No se han publicado resultados comparativos con otros modelos de NER en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo se validó en una NVIDIA GTX 1660 Ti con 6 GiB de VRAM, por lo que cabe en GPUs con al menos 6 GB de memoria.
- GPU recomendadas: cualquier GPU NVIDIA compatible con CUDA y con al menos 6 GB de VRAM (por ejemplo, GTX 1660 Ti, RTX 2060, RTX 3060, etc.). Para mayor throughput, se pueden usar GPUs superiores.
- Opciones de despliegue: ONNX Runtime con `CUDAExecutionProvider`, API mediante Docker Compose (según la configuración del autor). No se mencionan otras opciones como vLLM u Ollama.
- Rendimiento medido: en la GTX 1660 Ti, la versión ONNX procesó 25,412 caracteres/segundo, frente a 18,459 caracteres/segundo de la versión PyTorch BF16. En una prueba de carga con 20 usuarios concurrentes durante 2 minutos, se completaron 79 peticiones `/predict` con 0 fallos, con una latencia mediana de 6.7 segundos y p95 de 29 segundos (incluyendo cola, preprocesamiento y documentos largos).

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de NER en la documentación proporcionada. El modelo se basa en GLiNER-small v2.5, y el autor reporta una mejora de +0.095 en F1 macro sobre ese baseline, pero no se ofrecen comparaciones con otros sistemas como spaCy, Stanza o modelos transformer más grandes.

## Limitaciones y advertencias

- El modelo es exclusivamente para inglés; no soporta otros idiomas.
- Las etiquetas del conjunto de entrenamiento son de tipo "Silver" (generadas automáticamente), lo que introduce ruido y posibles errores de anotación.
- El corpus proviene de noticias scrapeadas, por lo que el modelo puede tener un sesgo hacia el registro y vocabulario periodístico.
- Los offsets de caracteres originales del corpus no son fiables y no se utilizaron en la evaluación; la evaluación se basa en coincidencia exacta de cadenas a nivel de documento.
- El rendimiento en ORG es notablemente inferior (F1 0.486) en comparación con PER (0.766) y LOC (0.693), lo que sugiere dificultades para identificar organizaciones en este dominio.
- No se especifica la licencia del modelo, por lo que se debe contactar con el autor antes de un uso comercial.
- El modelo debe validarse contra la distribución de producción prevista antes de utilizarlo en decisiones con consecuencias importantes.
- La latencia de la API puede ser alta (mediana de 6.7 s) debido al procesamiento de documentos largos y la concurrencia, lo que podría no ser adecuado para aplicaciones en tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ecampbelldspPhD/gliner-small-silver-onnx-cuda
- Documentación de GLiNER: https://urchade.github.io/GLiNER/
- Documentación del módulo ONNX de GLiNER: https://urchade.github.io/GLiNER/api/gliner.onnx.model.html
- ONNX Model Zoo (referencia general): https://github.com/onnx/models
- Modelo similar de referencia (GLiNER ONNX small): https://huggingface.co/nexuswho/gliner-onnx-small
