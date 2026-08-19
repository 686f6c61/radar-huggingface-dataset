# alexandrainst/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-es

## Resumen

El modelo `alexandrainst/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-es` es un clasificador de tokens diseñado para detectar alucinaciones en respuestas generadas por sistemas de pregunta-respuesta con recuperación aumentada (RAG). Desarrollado por el Alexandra Institute (alexandrainst), este modelo se enmarca en el proyecto MultiWikiQHalluA, que propone un benchmark multilingüe para evaluar la veracidad de respuestas generadas por modelos de lenguaje. El sufijo `-es` indica que la variante está entrenada específicamente para español, aunque la model card no especifica los idiomas soportados.

La arquitectura se basa en mmBERT-small, una variante compacta de ModernBERT con aproximadamente 140 millones de parámetros. El modelo se fine-tunea para la tarea de clasificación de tokens (token-classification), etiquetando cada token de una respuesta como alucinado o veraz. Su relevancia radica en la creciente necesidad de verificar la fiabilidad de las salidas de los sistemas RAG, especialmente en entornos de producción donde las alucinaciones pueden propagar información falsa.

El entrenamiento utiliza datos sintéticos generados mediante el framework LettuceDetect, que produce respuestas con alucinaciones etiquetadas a nivel de token a partir de contextos de MultiWikiQA. Aunque el modelo es pequeño en comparación con los LLM actuales, su enfoque especializado en detección de alucinaciones lo convierte en una herramienta práctica para pipelines de verificación en español.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (mmBERT-small) |
| Parametros totales | 140.642.306 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Español (según sufijo `-es`; la model card no lo especifica) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT, una evolución de BERT que incorpora atención lineal para reducir la complejidad computacional y mejorar la eficiencia en secuencias largas. mmBERT-small es la variante pequeña de esta familia, con 140 millones de parámetros, diseñada para tareas de comprensión del lenguaje a nivel de token. La arquitectura mantiene el codificador Transformer clásico pero con optimizaciones en la atención, lo que permite un rendimiento competitivo con un coste reducido.

El entrenamiento se realiza mediante fine-tuning sobre un conjunto de datos sintéticos de alucinaciones generado con el framework LettuceDetect. Este framework utiliza un modelo de lenguaje para producir respuestas etiquetadas a nivel de token a partir de los contextos, preguntas y respuestas de referencia del dataset MultiWikiQA. El proceso de generación sintética garantiza que las alucinaciones estén claramente marcadas, permitiendo un aprendizaje supervisado preciso. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

- Detección de alucinaciones a nivel de token en respuestas de QA con RAG.
- Clasificación de cada token como veraz o alucinado, lo que permite localizar la parte concreta de la respuesta que no se sustenta en el contexto.
- Especialización en español, aunque no se especifica si soporta otros idiomas.
- Integrable en pipelines de token-classification mediante la librería transformers.
- Compatible con endpoints de inferencia (tag `endpoints_compatible`).
- Capacidad de procesar respuestas generadas por sistemas RAG y señalar segmentos no fieles al contexto recuperado.

## Casos de uso

- Verificación de respuestas en sistemas RAG en español: el modelo puede integrarse como un filtro posterior a la generación para detectar y marcar tokens alucinados, permitiendo a los desarrolladores descartar o corregir respuestas no fiables antes de mostrarlas al usuario.
- Control de calidad en generación de contenido asistida por IA: en aplicaciones que redactan informes o artículos basados en fuentes recuperadas, el modelo puede señalar pasajes que se desvían del contexto original, facilitando la revisión humana.
- Auditoría de chatbots de atención al cliente: los sistemas de soporte que usan RAG para responder consultas pueden emplear este modelo para detectar respuestas incorrectas o inventadas, reduciendo el riesgo de proporcionar información falsa a los clientes.
- Evaluación de pipelines de generación aumentada: los equipos de desarrollo pueden usar el modelo como métrica automática para medir la tasa de alucinación de sus sistemas RAG durante el desarrollo y la regresión.
- Investigación en detección de alucinaciones: como modelo de referencia en español, sirve para comparar nuevas técnicas de verificación de factualidad en contextos multilingües.
- Preprocesamiento de datos para entrenamiento: las etiquetas generadas por el modelo pueden utilizarse para filtrar o reetiquetar datasets de entrenamiento de otros modelos, mejorando la calidad de los datos.

## Benchmarks y rendimiento

El modelo se evalúa en el benchmark MultiWikiQHalluA, descrito en el paper "A multilingual hallucination benchmark: MultiWikiQHalluA" (arXiv:2605.02504). Sin embargo, no se han publicado resultados numéricos específicos en la información disponible. El paper presenta la metodología de generación sintética y el fine-tuning, pero no incluye tablas de rendimiento accesibles desde los datos proporcionados.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Con 140 millones de parámetros, el modelo es ligero y cabe en GPUs de consumo.
- VRAM estimada para inferencia en FP32: aproximadamente 560 MB (140M parámetros × 4 bytes). Con cuantización a int8, se reduciría a unos 140 MB, aunque no se dispone de archivos cuantizados.
- GPUs compatibles: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, o incluso CPUs con suficiente RAM para inferencia en lotes pequeños.
- Despliegue: compatible con la librería transformers, por lo que puede usarse con vLLM, TGI, o directamente con `pipeline` de Hugging Face. También es compatible con endpoints de inferencia.
- Latencia: al ser un modelo pequeño, la inferencia es rápida; en una GPU moderna se pueden procesar cientos de ejemplos por segundo, aunque no se dispone de cifras exactas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (detección de alucinaciones a nivel de token en español basados en ModernBERT). El paper menciona la familia mmBERT-small con variantes para otros idiomas (en, fi), pero no se proporcionan datos de rendimiento comparativo.

No disponible.

## Limitaciones y advertencias

- La model card no especifica la licencia, lo que puede suponer un riesgo para uso comercial; se recomienda contactar con el autor antes de desplegar en producción.
- El modelo está entrenado con datos sintéticos generados automáticamente, lo que puede introducir sesgos en la detección de alucinaciones, especialmente en dominios no representados en MultiWikiQA.
- Al ser un modelo pequeño (140M), su capacidad para captar matices contextuales es limitada en comparación con modelos más grandes, lo que puede traducirse en falsos positivos o negativos.
- La especialización en español no está confirmada oficialmente en la model card; el sufijo `-es` sugiere español, pero no se documentan otros idiomas.
- No se dispone de información sobre la longitud de contexto soportada; aunque ModernBERT suele manejar secuencias largas, este modelo específico podría tener limitaciones.
- El riesgo de alucinación en la detección misma (es decir, que el modelo marque tokens incorrectamente) no está cuantificado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/alexandrainst/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-es)
- [Variante en inglés](https://huggingface.co/alexandrainst/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-en)
- [Variante en finés](https://huggingface.co/alexandrainst/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-fi)
- [Repositorio del dataset MultiWikiQA](https://github.com/alexandrainst/multi_wiki_qa)
- [Paper: A multilingual hallucination benchmark: MultiWikiQHalluA (arXiv:2605.02504)](https://arxiv.org/pdf/2605.02504)
- [Versión HTML del paper](https://arxiv.org/html/2605.02504v2)
