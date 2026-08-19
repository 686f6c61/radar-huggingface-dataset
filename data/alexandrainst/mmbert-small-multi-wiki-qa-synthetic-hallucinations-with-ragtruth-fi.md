# alexandrainst/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-fi

## Resumen

El modelo `alexandrainst/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-fi` es un encoder transformer de tipo *token classification* diseñado para detectar alucinaciones en respuestas generadas por sistemas de pregunta-respuesta (QA). Ha sido desarrollado por el Alexandra Institute (alexandrainst) y forma parte de una familia de modelos multilingües entrenados sobre el benchmark MultiWikiQHalluA, que combina contextos de Wikipedia, preguntas y respuestas sintéticas etiquetadas a nivel de token para señalar qué partes de una respuesta son inventadas o no fieles al contexto.

El modelo se basa en la arquitectura mmBERT-small, un encoder multilingüe moderno derivado de ModernBERT, y ha sido ajustado específicamente para la variante en finlandés (indicada por el sufijo `-fi`). Con 140 millones de parámetros, es un modelo compacto orientado a tareas de clasificación de tokens, no a generación de texto. Su relevancia radica en ofrecer una herramienta ligera y especializada para verificar la fidelidad de respuestas en sistemas RAG (Retrieval-Augmented Generation), un problema crítico en producción.

La información pública disponible es limitada: la model card está prácticamente vacía y no se detallan datos de entrenamiento, licencia ni métricas de evaluación. No obstante, el nombre del modelo y los repositorios asociados permiten inferir su propósito y procedencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 140.642.306 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | finlandés (inferido por el sufijo `-fi`; no confirmado oficialmente) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de encoder transformer basada en ModernBERT, una evolución de BERT con mejoras en eficiencia y capacidad de contexto. Al ser un modelo de clasificación de tokens, la salida es una etiqueta por token (por ejemplo, `hallucinated` o `faithful`), lo que permite localizar con precisión las partes de una respuesta que no se corresponden con el contexto dado.

El entrenamiento se realizó mediante fine-tuning sobre datos sintéticos generados con el framework LettuceDetect, que produce respuestas etiquetadas a nivel de token a partir de contextos de Wikipedia y preguntas del dataset MultiWikiQA. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO. El nombre del modelo sugiere que se incorporó información de veracidad de RAG (`ragtruth`), pero los detalles técnicos no están publicados.

## Capacidades

- Clasificación de tokens para detectar alucinaciones en respuestas de QA.
- Identificación de segmentos específicos de una respuesta que no son fieles al contexto de referencia.
- Procesamiento de texto en finlandés (presumiblemente, dado el sufijo del modelo).
- Integración con el ecosistema Hugging Face Transformers mediante la pipeline `token-classification`.
- Compatible con inferencia en endpoints (etiqueta `endpoints_compatible`).

## Casos de uso

- Verificación de respuestas en sistemas RAG: el modelo puede marcar automáticamente qué partes de una respuesta generada por un LLM no están respaldadas por los documentos recuperados, permitiendo a los desarrolladores filtrar o corregir contenido antes de mostrarlo al usuario final.
- Control de calidad en generación de contenido: en flujos de redacción automática (noticias, informes), se puede usar como un paso de validación para detectar afirmaciones inventadas.
- Auditoría de chatbots de atención al cliente: las respuestas generadas por asistentes virtuales pueden ser revisadas por este modelo para señalar posibles alucinaciones y activar respuestas de respaldo.
- Análisis de corpus multilingüe: al ser un modelo pequeño, puede ejecutarse en entornos con recursos limitados para etiquetar grandes volúmenes de texto en finlandés.
- Investigación en detección de alucinaciones: sirve como punto de partida para estudios comparativos sobre métodos de verificación de fidelidad en modelos de lenguaje.
- Preprocesamiento para pipelines de RAG: las etiquetas generadas pueden usarse para reordenar o filtrar fragmentos de documentos en la fase de recuperación, mejorando la precisión del sistema final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre métricas como F1, precisión o recall en tareas de detección de alucinaciones, ni comparaciones con otros modelos.

## Requisitos de hardware

- Al tratarse de un modelo de 140 millones de parámetros, la inferencia es ligera y puede ejecutarse en CPU con un consumo de memoria moderado (estimación orientativa: 1-2 GB de RAM).
- En GPU, cabe en tarjetas de consumo como la NVIDIA GTX 1060 (6 GB) o superiores; una RTX 3060 o RTX 4090 ofrecería latencias muy bajas.
- Para despliegue en producción, se puede servir con vLLM, Hugging Face Inference Endpoints o mediante la pipeline de Transformers en un contenedor Docker.
- El tamaño del repositorio es de 1.2 GB, lo que incluye los pesos en safetensors y posiblemente archivos adicionales.
- No se dispone de datos de latencia o throughput medidos; al ser un encoder pequeño, se espera un rendimiento de cientos de ejemplos por segundo en GPU moderna.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de detección de alucinaciones. Aunque existen alternativas como los modelos de la familia `LettuceDetect` o clasificadores basados en DeBERTa, no hay datos públicos que permitan una comparación objetiva en términos de rendimiento, contexto o licencia. Se recomienda consultar el repositorio de MultiWikiQHalluA para posibles referencias.

## Limitaciones y advertencias

- La model card no especifica la licencia, por lo que el uso comercial podría estar restringido; se debe contactar con el autor para aclarar los términos.
- No se han publicado detalles sobre sesgos o riesgos de alucinación del propio modelo; al entrenarse con datos sintéticos, podría heredar sesgos del generador utilizado.
- El modelo está especializado en finlandés; su rendimiento en otros idiomas no está garantizado.
- La longitud de contexto no está documentada; se asume la de ModernBERT (típicamente 8192 tokens), pero no es confirmable.
- No hay información sobre el régimen de entrenamiento (precisión, hiperparámetros) ni sobre la composición del dataset, lo que dificulta evaluar su robustez.
- Al ser un modelo de clasificación de tokens, no genera texto; su uso está limitado a tareas de etiquetado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/alexandrainst/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-fi)
- [Repositorio mmBERT (JHU-CLSP)](https://github.com/JHU-CLSP/mmBERT/)
- [Dataset MultiWikiQA (alexandrainst)](https://github.com/alexandrainst/multi_wiki_qa)
- [Paper MultiWikiQHalluA (arXiv)](https://arxiv.org/pdf/2605.02504)
