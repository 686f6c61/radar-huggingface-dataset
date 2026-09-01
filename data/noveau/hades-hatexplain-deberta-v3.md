# Noveau/hades-hatexplain-deberta-v3

## Resumen

El modelo `Noveau/hades-hatexplain-deberta-v3` es un clasificador de texto basado en la arquitectura DeBERTa, desarrollado por el usuario Noveau y publicado en Hugging Face. Su nombre sugiere que ha sido ajustado (fine-tuning) sobre el dataset HateXplain, un corpus de referencia para la detección de discurso de odio y lenguaje ofensivo. El pipeline declarado es `text-classification`, por lo que su función principal es asignar una o varias etiquetas a fragmentos de texto, probablemente categorías como odio, ofensivo o normal.

Con 184.424.451 parámetros y un tamaño de repositorio de 0,7 GB, se trata de un modelo de tamaño medio, adecuado para tareas de moderación de contenido en entornos con recursos limitados. La model card oficial está prácticamente vacía, por lo que muchos detalles técnicos (datos de entrenamiento, licencia, idiomas) no están disponibles. Aun así, su arquitectura DeBERTa y su orientación a clasificación de toxicidad lo hacen relevante para aplicaciones de moderación automática, análisis de redes sociales e investigación en detección de odio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa (variante v2/v3, no confirmada) |
| Parametros totales | 184.424.451 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente ingles, no confirmado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se basa en DeBERTa, un modelo transformer que introduce la atención disentangled (separación de contenido y posición) y un mecanismo de decodificación mejorada. El tag `deberta-v2` y el nombre `deberta-v3` generan ambigüedad sobre la versión exacta; el paper referenciado (arXiv:1910.09700) corresponde a DeBERTa original. No se dispone de información sobre el proceso de entrenamiento: no se especifican datos, número de épocas, hiperparámetros, ni si se utilizó alguna técnica de ajuste adicional. El nombre del modelo indica un fine-tuning sobre HateXplain, pero no hay confirmación oficial.

## Capacidades

- Clasificacion de texto para deteccion de discurso de odio, lenguaje ofensivo y contenido normal (probablemente 3 clases, segun el dataset HateXplain).
- Inferencia de clasificacion binaria o multiclase mediante la API de transformers.
- Compatible con `text-embeddings-inference` y `endpoints_compatible`, lo que facilita su despliegue en servicios de inferencia.
- No se conocen capacidades adicionales como generacion de texto, tool calling o soporte multilingue.

## Casos de uso

- Moderacion de contenido en redes sociales: el modelo puede clasificar comentarios y publicaciones como odio u ofensivos, permitiendo a las plataformas filtrar automaticamente contenido problematico antes de su publicacion.
- Filtrado de comentarios en foros y blogs: integrado en un pipeline de pre-procesado, puede marcar mensajes toxicos para revision humana o eliminacion directa.
- Analisis de sentimiento orientado a toxicidad: util para estudios sociologicos o de opinion publica que necesiten cuantificar la presencia de discurso de odio en grandes volumenes de texto.
- Investigacion academica en NLP: sirve como punto de partida para experimentos sobre deteccion de odio, transferencia de aprendizaje o interpretabilidad de modelos DeBERTa.
- Sistemas de alerta temprana en comunidades online: monitoriza chats o secciones de comentarios y genera alertas cuando se supera un umbral de toxicidad.
- Enriquecimiento de datasets: puede utilizarse para etiquetar automaticamente corpus no anotados, reduciendo el coste de anotacion manual en proyectos de moderacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de metricas como F1, accuracy o comparativas con otros modelos en tareas de deteccion de odio.

## Requisitos de hardware

- VRAM estimada para inferencia: con 184M de parametros y pesos en fp32, el modelo ocupa aproximadamente 0,7 GB en memoria. En fp16, alrededor de 0,35 GB. Cabe en GPUs con 2 GB de VRAM o menos.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM, como NVIDIA T4, RTX 3060, RTX 4090, o incluso inferencia en CPU con un rendimiento aceptable para lotes pequenos.
- Despliegue: compatible con la libreria transformers de Hugging Face, y con servidores de inferencia como Text Generation Inference (TGI) o endpoints compatibles. Tambien puede ejecutarse en CPU con ONNX o llama.cpp si se convierte a GGUF, aunque no se proporcionan cuantizaciones oficiales.
- Latencia y throughput: no disponibles. Para un modelo de este tamano, se espera una latencia de decenas de milisegundos por muestra en GPU, pero no hay datos publicados.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa rigurosa. Como referencia, el modelo base DeBERTa-v3-large de Microsoft tiene 304M de parametros y una longitud de contexto de 512 tokens, pero no se puede confirmar que este modelo sea un fine-tuning de esa variante. Otros modelos de deteccion de odio como `HateBERT` (basado en BERT) o `RoBERTa-base` con fine-tuning en HateXplain podrian ser alternativas, pero no se dispone de datos de rendimiento comparables.

## Limitaciones y advertencias

- La model card no proporciona informacion sobre sesgos, pero los modelos entrenados en HateXplain pueden heredar sesgos del dataset, que contiene anotaciones subjetivas y desequilibrios entre clases.
- Al ser un clasificador, no genera texto, por lo que el riesgo de alucinacion no aplica; sin embargo, puede producir falsos positivos o negativos en la deteccion de odio, especialmente con lenguaje ironico o contextual.
- No se especifican los idiomas soportados; si el fine-tuning se realizo sobre HateXplain (mayoritariamente en ingles), el rendimiento en otros idiomas sera probablemente deficiente.
- La licencia no esta declarada, lo que impide conocer las restricciones de uso comercial o modificacion. Se recomienda contactar con el autor antes de utilizarlo en produccion.
- No hay informacion sobre la longitud de contexto; los modelos DeBERTa suelen limitarse a 512 tokens, por lo que textos largos deberan truncarse.
- El repositorio no incluye documentacion tecnica, lo que dificulta la reproducibilidad y el mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Noveau/hades-hatexplain-deberta-v3
- Paper de DeBERTa (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
- Repositorio oficial de DeBERTa (Microsoft): https://github.com/microsoft/DeBERTa
- Modelo base DeBERTa-v3-large: https://huggingface.co/microsoft/deberta-v3-large
- Modelo DeBERTa-v3-large fine-tuneado en SQuAD2: https://huggingface.co/deepset/deberta-v3-large-squad2
