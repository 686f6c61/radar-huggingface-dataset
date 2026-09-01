# LeninGF/qa-merged-MMG__bert-base-spanish-wwm-cased-finetuned-squad2-es-ft-20260831_230145

## Resumen

El modelo `LeninGF/qa-merged-MMG__bert-base-spanish-wwm-cased-finetuned-squad2-es-ft-20260831_230145` es un sistema de respuesta a preguntas extractivo en español, desarrollado por LeninGF. Se basa en el modelo BETO (`dccuchile/bert-base-spanish-wwm-cased`), un BERT-base entrenado con Whole Word Masking sobre texto en español, y ha sido ajustado sobre el dataset SQuAD-es (la versión en español de SQuAD 2.0). El nombre sugiere que se trata de una fusión de pesos (merged) a partir del modelo `MMG/bert-base-spanish-wwm-cased-finetuned-squad2-es`, aunque no se proporcionan detalles sobre el proceso de fusión.

Con 109 millones de parámetros, es un modelo compacto y eficiente para tareas de comprensión lectora en español. Su relevancia radica en que ofrece una alternativa ligera y especializada para extracción de respuestas en este idioma, con un tamaño que permite su despliegue en entornos con recursos limitados. La ficha oficial es genérica y carece de información detallada sobre entrenamiento, licencia o evaluación, por lo que esta ficha se basa en los datos disponibles y en el conocimiento de los modelos base relacionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer) |
| Parametros totales | 109.261.826 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (típico de BERT: 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | español (inferido del nombre y del fine-tuning en SQuAD-es) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BERT-base, un transformer encoder de 12 capas con 768 dimensiones ocultas y 12 cabezas de atención, entrenado originalmente con Whole Word Masking sobre un corpus en español (BETO). El checkpoint base es `dccuchile/bert-base-spanish-wwm-cased`, que mantiene distinción entre mayúsculas y minúsculas. Sobre esta base, el modelo ha sido fine-tuneado para la tarea de respuesta a preguntas extractiva utilizando el dataset SQuAD-es, que contiene preguntas y respuestas en español extraídas de artículos de Wikipedia.

No se dispone de información sobre el proceso de entrenamiento específico (número de épocas, hiperparámetros, estrategia de fusión de pesos, etc.). El nombre "qa-merged" sugiere que se combinaron pesos de varios checkpoints, pero no hay documentación al respecto. Tampoco se especifica si se aplicaron técnicas como RLHF o DPO; al tratarse de un modelo de QA extractivo, es probable que el entrenamiento se limitara a fine-tuning supervisado estándar.

## Capacidades

- Respuesta a preguntas extractiva: dado un contexto y una pregunta, devuelve el fragmento de texto que contiene la respuesta.
- Comprensión lectora en español: capaz de localizar información relevante en documentos, artículos o párrafos.
- Manejo de preguntas con respuesta "no disponible" (SQuAD 2.0 incluye preguntas sin respuesta, por lo que el modelo puede indicar que no hay respuesta en el contexto).
- Procesamiento de texto en español con distinción de mayúsculas y minúsculas, lo que puede ser útil para nombres propios y siglas.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación libre; su salida se limita a spans del contexto de entrada.

## Casos de uso

- Atención al cliente automatizada: el modelo puede extraer respuestas de una base de conocimiento o manual de producto en español, respondiendo a consultas frecuentes de usuarios con precisión y bajo coste computacional.
- Búsqueda semántica en documentos legales o técnicos: dado un corpus de contratos, normativas o informes, el modelo localiza el pasaje exacto que responde a una pregunta concreta, facilitando la revisión documental.
- Asistentes de lectura para estudiantes: integrado en una aplicación educativa, puede responder preguntas sobre textos de estudio, ayudando a verificar la comprensión lectora.
- Extracción de información en artículos periodísticos: permite obtener respuestas a preguntas factuales (quién, qué, cuándo, dónde) a partir de noticias en español, útil para resúmenes automáticos o verificación de datos.
- Chatbots de soporte técnico: combinado con un sistema de recuperación, el modelo puede seleccionar la respuesta adecuada de una documentación técnica en español, reduciendo el tiempo de resolución de incidencias.
- Análisis de encuestas o comentarios: si se dispone de un corpus de opiniones, el modelo puede extraer fragmentos que respondan a preguntas específicas sobre el contenido, como "¿qué aspectos negativos se mencionan?".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este modelo concreto. El modelo base `MMG/bert-base-spanish-wwm-cased-finetuned-squad2-es` reporta en su ficha un loss de 1.2841, exact match de 62.53 y F1 de 69.33 sobre el conjunto de evaluación de SQuAD-es, pero estos datos no corresponden directamente al modelo fusionado y no deben atribuirse sin verificación.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un BERT-base con 109M parámetros, el modelo en precisión fp32 ocupa aproximadamente 437 MB. Con cuantización a int8, el uso de memoria se reduce a unos 110 MB, y con int4 a unos 55 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en fp32. Modelos como NVIDIA T4, GTX 1660, RTX 2060 o superiores funcionan sin problemas. También puede ejecutarse en CPU con latencia aceptable (del orden de 100-300 ms por consulta).
- Cabe en GPUs de consumo: sí, incluso en tarjetas con 4 GB de VRAM (GTX 1650, RTX 3050) se puede ejecutar con cuantización.
- Opciones de despliegue: compatible con Hugging Face Transformers, ONNX Runtime, TensorRT, y puede servirse mediante FastAPI o frameworks como Haystack. También es posible exportarlo a formato ONNX para optimización.
- Latencia y throughput estimados: en una GPU T4, la inferencia de una pregunta con contexto de 512 tokens tarda aproximadamente 10-20 ms; en CPU (8 núcleos) puede rondar los 200-400 ms. El throughput depende del batching, pero es un modelo ligero adecuado para servicios en tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Exact Match (SQuAD-es) | F1 (SQuAD-es) | Licencia |
|---|---|---|---|---|---|
| LeninGF/qa-merged (este) | 109M | no disponible | no disponible | no disponible | no disponible |
| MMG/bert-base-spanish-wwm-cased-finetuned-squad2-es | 109M | 512 | 62.53 | 69.33 | no disponible |
| mrm8488/bert-base-spanish-wwm-cased-finetuned-spa-squad2-es | 109M | 512 | no disponible | no disponible | no disponible |

Ambos modelos comparables son fine-tunings de BETO sobre SQuAD-es, con la misma arquitectura y tamaño. La diferencia principal es que el modelo de LeninGF parece ser una fusión de pesos, aunque no se documenta su procedencia ni su rendimiento. El modelo de MMG es el más cercano y reporta métricas concretas, por lo que puede servir como referencia orientativa.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado sobre Wikipedia en español, puede reflejar sesgos presentes en ese corpus (género, cultura, geografía). No se ha realizado una evaluación de sesgos específica.
- Riesgo de alucinación: al ser un modelo extractivo, no genera texto nuevo, pero puede seleccionar fragmentos incorrectos si la pregunta no tiene respuesta en el contexto o si el contexto es ambiguo.
- Limitaciones de contexto: la longitud máxima de entrada es de 512 tokens (típica de BERT), por lo que no es adecuado para documentos largos sin segmentación previa.
- Limitaciones de idioma: solo está entrenado para español; no soporta otros idiomas de forma fiable.
- Restricciones de licencia: la licencia no está especificada, lo que genera incertidumbre sobre su uso comercial. Se recomienda contactar al autor antes de utilizarlo en producción.
- Carencia de documentación: la model card no proporciona detalles sobre el proceso de fusión, los datos de entrenamiento ni la evaluación, lo que dificulta la reproducibilidad y la confianza en el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LeninGF/qa-merged-MMG__bert-base-spanish-wwm-cased-finetuned-squad2-es-ft-20260831_230145
- Modelo base (MMG): https://huggingface.co/MMG/bert-base-spanish-wwm-cased-finetuned-squad2-es
- Modelo similar (mrm8488): https://huggingface.co/mrm8488/bert-base-spanish-wwm-cased-finetuned-spa-squad2-es
- Referencia de BETO (dccuchile): https://huggingface.co/dccuchile/bert-base-spanish-wwm-cased
