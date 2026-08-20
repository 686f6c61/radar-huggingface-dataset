# EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-hu

## Resumen

El modelo `EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-hu` es un encoder basado en la arquitectura ModernBERT, ajustado para la clasificación de tokens con el objetivo de detectar alucinaciones en respuestas generadas por modelos de lenguaje dentro de sistemas de recuperación aumentada (RAG). Ha sido desarrollado por el equipo EuroEval, una iniciativa europea centrada en la evaluación rigurosa de modelos de lenguaje. El nombre del modelo indica que está especializado para el idioma húngaro (sufijo `-hu`), aunque la ficha del autor no proporciona información explícita sobre los idiomas soportados.

El modelo se enmarca en el trabajo de investigación recogido en el artículo «A multilingual hallucination benchmark: MultiWikiQHalluA» (arXiv:2605.02504), donde se describe una metodología de dos etapas: primero se generan respuestas sintéticas etiquetadas a nivel de token mediante el framework LettuceDetect, y después se ajusta un modelo `mmBERT-small` para predecir si cada token de una respuesta es o no una alucinación. Con 140 millones de parámetros y un tamaño de repositorio de 1,2 GB, es un modelo ligero, adecuado para integrarse en pipelines de verificación de contenido en entornos con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parámetros totales | 140.642.306 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | No disponible (el nombre sugiere húngaro, pero no se confirma) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ModernBERT, una evolución de BERT que incorpora mejoras como atención con ventana deslizante y mayor eficiencia en el procesamiento de secuencias largas. Está configurado como un clasificador de tokens: para cada token de una respuesta generada, predice una etiqueta que indica si el token es una alucinación o no. El entrenamiento se realizó mediante ajuste fino (fine-tuning) sobre datos sintéticos generados con el framework LettuceDetect, que utiliza un modelo de lenguaje para producir respuestas etiquetadas a partir de contextos, preguntas y respuestas de referencia del conjunto de datos MultiWikiQA. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se utilizó RLHF o DPO.

## Capacidades

- Detección de alucinaciones a nivel de token: clasifica cada token de una respuesta como alucinado o no alucinado.
- Orientado a escenarios de recuperación aumentada (RAG), donde las respuestas se generan a partir de un contexto recuperado.
- Es un modelo encoder, no generativo: no produce texto, solo anotaciones.
- Probablemente especializado para el idioma húngaro (según el sufijo `-hu`), aunque la documentación no lo confirma.
- Compatible con la librería `transformers` de Hugging Face y con `endpoints_compatible`, lo que facilita su despliegue en infraestructuras de inferencia.

## Casos de uso

- Validación de respuestas en sistemas de preguntas y respuestas basados en RAG: el modelo puede analizar cada token de una respuesta generada y marcar los pasajes que probablemente no están respaldados por el contexto recuperado, permitiendo filtrar o corregir respuestas antes de entregarlas al usuario final.
- Auditoría de alucinaciones en chatbots corporativos: en despliegues de asistentes virtuales que utilizan RAG, se puede integrar como un paso de verificación para reducir el riesgo de información falsa.
- Evaluación automática de modelos generativos: como herramienta de evaluación para comparar la fidelidad de distintos LLM en tareas de respuesta a preguntas con contexto.
- Control de calidad en generación de resúmenes: si se aplica a resúmenes generados a partir de documentos, permite detectar frases que no se corresponden con el contenido fuente.
- Investigación en detección de alucinaciones: sirve como punto de partida para experimentos sobre la eficacia de modelos pequeños y eficientes en esta tarea.
- Integración en pipelines de producción con recursos limitados: al ser un modelo de 140 M de parámetros, puede ejecutarse en CPU o en GPUs modestas, por lo que es viable para entornos con restricciones de coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo de arXiv asociado (MultiWikiQHalla) describe la metodología y el conjunto de datos, pero no se incluyen métricas cuantitativas del modelo en la documentación que se ha podido consultar.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 140 M de parámetros en FP32, el tamaño del modelo es de aproximadamente 560 MB. Con batch pequeño, se puede ejecutar en una GPU con 1–2 GB de VRAM. En FP16 o cuantización de 8 bits, la huella se reduce aún más.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como una NVIDIA GTX 1050 Ti o superior. Para inferencia a gran escala se recomienda una GPU de gama media como la RTX 3060 o superior.
- Capacidad en GPU de consumo: sí, cabe en GPUs de consumo habituales y también en CPUs, con una latencia razonable para tareas de clasificación de tokens.
- Opciones de despliegue: compatible con `transformers` de Hugging Face, se puede servir con bibliotecas como `vLLM`, `TGI` o `ONNX Runtime`. También se puede exportar a formato ONNX para entornos de producción.
- Latencia y rendimiento: no se dispone de mediciones publicadas. Para un modelo de este tamaño, la inferencia es típicamente del orden de decenas de milisegundos por secuencia en GPU, y de unos pocos cientos de milisegundos en CPU, dependiendo de la longitud del texto.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (detectores de alucinaciones a nivel de token basados en encoders multilingües). El artículo de laarXiv no menciona comparaciones con otros sistemas. Por tanto, esta sección queda sin datos.

## Limitaciones y advertencias

- Sesgos conocidos: al haber sido entrenado con datos sintéticos generados por un LLM, puede heredar sesgos presentes en el modelo generador. No se ha documentado ningún análisis de sesgos.
- Riesgo de alucinación: el modelo está diseñado para detectar alucinaciones, pero no es infalible; puede cometer errores de clasificación, sobre todo en contextos fuera del dominio de entrenamiento.
- Limitaciones de contexto: no se ha especificado la longitud máxima de secuencia soportada. Los modelos ModernBERT suelen manejar secuencias de hasta 512 tokens, pero no se puede confirmar para esta versión.
- Limitaciones de idioma: la información disponible no confirma los idiomas soportados. El sufijo `-hu` sugiere que está especializado para el húngaro, pero no hay evidencia oficial.
- Restricciones de licencia: la licencia no está publicada, por lo que se desaconseja su uso en producción sin aclarar los términos de uso.
- Caveat para producción: el modelo es un clasificador de tokens, no un generador. No se debe utilizar para generar texto, sino únicamente como componente de validación.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-hu
- Artículo en arXiv (PDF): https://arxiv.org/pdf/2605.02504v2
- Artículo en arXiv (HTML): https://arxiv.org/html/2605.02504v2
- Sitio web de EuroEval: https://euroeval.com/

Nota: la página de Hugging Face del modelo contiene una model card autogenerada sin información técnica adicional. Los enlaces al artículo científico describen el marco general de detección de alucinaciones y el conjunto de datos MultiWikiQHALLU, pero no ofrecen detalles específicos sobre este modelo concreto.
