# EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-sk

## Resumen

El modelo `EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-sk` es un clasificador de tokens (token classification) desarrollado por EuroEval, una iniciativa europea de evaluación de modelos de lenguaje. Está diseñado para detectar alucinaciones en respuestas generadas por sistemas de recuperación aumentada (RAG), concretamente en el contexto de preguntas y respuestas sobre artículos de Wikipedia en eslovaco. El nombre indica que fue entrenado con datos sintéticos generados a partir de un pipeline que produce respuestas alucinadas y las etiqueta a nivel de token, con la verdad de referencia de RAG.

El modelo se basa en la arquitectura ModernBERT (según el tag `modernbert`) y tiene 140,6 millones de parámetros. Es un modelo de tamaño pequeño, lo que lo hace adecuado para tareas de clasificación a nivel de token en entornos con recursos limitados. Aunque la model card es muy escasa, los resultados de búsqueda apuntan a un paper que describe el benchmark MultiWikiQHalluA, del que probablemente forma parte este modelo. La relevancia actual reside en la creciente necesidad de detectar y mitigar alucinaciones en sistemas de generación de lenguaje natural, especialmente en aplicaciones de recuperación aumentada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (según tag, probablemente transformer encoder) |
| Parámetros totales | 140.642.306 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (típico de BERT: 512 tokens, no confirmado) |
| Tipos de cuantización | no disponible (formato safetensors, sin cuantización explícita) |
| Idiomas soportados | no disponible (el nombre sugiere eslovaco, pero no confirmado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un modelo encoder basado en ModernBERT, una variante eficiente de BERT que incorpora mejoras en la atención y el entrenamiento. Está configurado como un clasificador de tokens, lo que significa que produce una etiqueta para cada token de entrada, probablemente indicando si el token es parte de una alucinación o no. El nombre del modelo indica que fue entrenado con un dataset sintético llamado `multi-wiki-qa-synthetic-hallucinations-with-ragtruth-sk`, que se generó a partir de preguntas y respuestas de Wikipedia multilingüe, con respuestas alucinadas generadas sintéticamente y etiquetadas con la verdad de referencia del RAG (ragtruth). No se dispone de detalles sobre el número de tokens de entrenamiento, el procedimiento de entrenamiento (p.ej., fine-tuning completo o adaptadores), ni si se usó alguna técnica como RLHF. El paper asociado (arXiv:2605.02504) describe una metodología en dos etapas: generación sintética de alucinaciones con un framework llamado LettuceDetect, y posterior fine-tuning del modelo mmBERT-small para clasificación a nivel de token. Sin embargo, no se han publicado los hiperparámetros ni la configuración exacta del entrenamiento.

## Capacidades

- Detección de alucinaciones a nivel de token: el modelo etiqueta cada token de un texto como alucinado o no, lo que permite localizar las partes de una respuesta que no están respaldadas por el contexto de recuperación.
- Procesamiento de texto multilingüe: aunque el nombre sugiere el eslovaco, el modelo está entrenado sobre un dataset multilingüe (multi-wiki-qa) y puede tener cierta capacidad en otros idiomas, aunque no está confirmado.
- Integración con sistemas RAG: puede utilizarse como componente de verificación de salidas generadas por un sistema de RAG para detectar inconsistencias.
- No es un modelo generativo: no genera texto, solo clasifica tokens en secuencias de entrada.
- No soporta tool calling ni agentes; es un modelo de encoder puro.

## Casos de uso

- **Control de calidad de respuestas en sistemas de RAG**: el modelo puede evaluar la fidelidad de las respuestas generadas por un sistema de RAG comparando cada token con la fuente recuperada. Se usaría como un paso de post-procesamiento para marcar posibles alucinaciones.
- **Filtrado de contenido en asistentes virtuales**: en un chatbot con respuestas generadas, el modelo puede señalar las partes de la respuesta que no están respaldadas, permitiendo al sistema mostrar una advertencia o re-consultar la fuente.
- **Análisis de alucinaciones en investigación**: los investigadores pueden usar el modelo para estudiar la frecuencia y naturaleza de las alucinaciones en modelos de generación, especialmente en el contexto de preguntas y respuestas sobre Wikipedia.
- **Monitorización de modelos generativos**: en producción, se puede usar para monitorizar la calidad de las respuestas de un LLM, detectando alucinaciones en tiempo real y registrando métricas de fiabilidad.
- **Entrenamiento de otros modelos**: el modelo puede servir como base para entrenar detectores de alucinaciones en otros idiomas o dominios, mediante fine-tuning adicional.
- **Evaluación de conjuntos de datos**: puede usarse para etiquetar automáticamente los datasets de entrenamiento de sistemas RAG, marcando las respuestas alucinadas para mejorar los datos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper asociado (arXiv:2602.02504) describe el benchmark MultiWikiQHalluA, pero no se proporcionan resultados concretos para este modelo específico.

## Requisitos de hardware

- Al ser un modelo de 140M de parámetros, la VRAM necesaria para inferencia es baja. En FP32, los pesos ocupan aproximadamente 562 MB (140.642.306 * 4 bytes). Con cuantización a int8 o fp16, se reduce a unos 280 MB o 140 MB.
- Cabe en GPU de consumo como una RTX 3060 (12 GB) o incluso en CPU con suficiente RAM (se puede ejecutar con llama.cpp o similar, aunque no se ha confirmado el soporte).
- El modelo es compatible con la librería `transformers` de HuggingFace, por lo que puede ejecutarse en frameworks como PyTorch, ONNX Runtime o TensorFlow.
- Opciones de despliegue: se puede servir con HuggingFace Inference Endpoints, TGI, o en local con Python. Al ser un modelo de encoder, la latencia es baja, en el orden de milisegundos para secuencias cortas.
- No se proporcionan datos de throughput específicos.

## Comparativa con modelos similares

No hay información sobre modelos comparables en la misma categoría (detección de alucinaciones a nivel de token). No se puede establecer una comparativa fiable.

## Limitaciones y advertencias

- La model card es muy incompleta; no se indica la licencia, los idiomas exactos ni los datos de entrenamiento detallados, lo que limita la evaluación de riesgos.
- Al estar entrenado con datos sintéticos, su generalización a alucinaciones reales de modelos de lenguaje puede ser limitada, especialmente fuera del dominio de Wikipedia en eslovaco.
- No se especifican sesgos conocidos, pero al entrenarse en un corpus multilingüe podría tener sesgos de representación de idiomas minoritarios.
- No hay información sobre la licencia, por lo que se debe contactar con los autores antes de usar comercialmente.
- El modelo no es un generador, por lo que no se puede usar para tareas de generación de texto.

## Enlaces

- [Página del modelo en HuggingFace](https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-sk)
- [Paper en arXiv: MultiWikiQHalluA](https://arxiv.org/pdf/2602.02504v2)
- [Sitio web de EuroEval](https://euroeval.com/)## Resumen

El modelo `EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-sk` es un clasificador de tokens (token-classification) desarrollado por el grupo EuroEval, una iniciativa europea centrada en la evaluación de modelos de lenguaje. Su propósito es detectar alucinaciones en respuestas generadas por sistemas de recuperación aumentada (RAG), concretamente en el contexto de preguntas y respuestas sobre artículos de Wikipedia en eslovaco. El nombre indica que fue entrenado con un dataset sintético de alucinaciones generadas con la verdad de RAG (ragtruth), lo que lo convierte en una herramienta para verificar la fidelidad de las respuestas generadas automáticamente.

El modelo se basa en la arquitectura ModernBERT (según el tag `modernbert`), un encoder de tipo BERT optimizado para eficiencia. Con 140,6 millones de parámetros, es un modelo de tamaño pequeño, adecuado para tareas de clasificación a nivel de token en entornos con recursos limitados. Aunque la model card es muy escasa, los resultados de búsqueda apuntan a un paper que describe el benchmark multilingüe MultiWikiQHalluA, del que este modelo forma parte. La relevancia actual radica en la necesidad de mitigar las alucinaciones en sistemas de generación de lenguaje, especialmente en aplicaciones de recuperación de información.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder tipo BERT) |
| Parametros totales | 140.642.306 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (típico de BERT: 512 tokens, no confirmado) |
| Tipos de cuantizacion | no disponible (formato safetensors, sin cuantizacion explicita) |
| Idiomas soportados | no disponible (el nombre indica eslovaco, pero no confirmado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un modelo encoder basado en ModernBERT, una variante eficiente de BERT que incorpora mejoras en la atención y el entrenamiento. Está configurado como un clasificador de tokens, lo que significa que asigna una etiqueta a cada token de entrada, probablemente indicando si el token es parte de una alucinación o no. El nombre del modelo sugiere que el entrenamiento se realizó con un dataset sintético llamado `multi-wiki-qa-synthetic-hallucinations-with-ragtruth-sk`, que se generó a partir de preguntas y respuestas de Wikipedia multilingüe, con respuestas alucinadas sintéticamente y etiquetadas con la verdad de RAG. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se utilizaron técnicas como RLHF o DPO. El paper asociado (arXiv:2602.02504) describe una metodología en dos etapas: generación sintética de alucinaciones con el framework LettuceDetect y posterior fine-tuning del modelo mmBERT-small para clasificación a nivel de token. Sin embargo, los hiperparámetros y el procedimiento de entrenamiento no se han publicado en la model card.

## Capacidades

- **Detección de alucinaciones a nivel de token**: etiqueta cada token de un texto como alucinado o no, lo que permite localizar las partes de una respuesta que no están respaldadas por la fuente de recuperación.
- **Procesamiento de texto multilingüe**: aunque el nombre sugiere eslovaco, el modelo está entrenado en un dataset multilingüe (multi-wiki-qa) y puede tener cierta capacidad en otros idiomas, aunque no está confirmado.
- **Integración con sistemas RAG**: puede servir como componente de verificación para validar las salidas de un sistema de RAG.
- **No es generativo**: no genera texto, solo clasifica tokens en secuencias de entrada.
- **No soporta tool calling ni agentes**: es un modelo de encoder puro, sin capacidad de razonamiento multi-paso.

## Casos de uso

- **Control de calidad en sistemas de RAG**: el modelo puede analizar la respuesta generada por un sistema de RAG y señalar los tokens que probablemente son alucinaciones, permitiendo a los desarrolladores corregir o rechazar la respuesta antes de mostrarla al usuario.
- **Filtrado de contenido en asistentes virtuales**: en un asistente que responde preguntas sobre Wikipedia, el modelo puede identificar partes de la respuesta que no están respaldadas por el artículo recuperado, activando una alerta o una nueva búsqueda.
- **Investigación sobre alucinaciones**: los investigadores pueden usar el modelo para estudiar la frecuencia y los patrones de alucinaciones en modelos de lenguaje, especialmente en el dominio de preguntas y respuestas.
- **Monitorización de modelos en producción**: el modelo puede integrarse en pipelines de monitorización para detectar alucinaciones en tiempo real y generar métricas de fiabilidad.
- **Entrenamiento de otros detectores**: el modelo puede ser usado como base para fine-tuning en otros idiomas o dominios, aprovechando su capacidad de clasificación de tokens.
- **Validación de datasets de entrenamiento**: el modelo puede etiquetar automáticamente las respuestas de un dataset de RAG, marcando las alucinadas para mejorar la calidad de los datos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper asociado (arXiv:2602.02504) describe el benchmark MultiWikiQHalluA, pero no se proporcionan métricas específicas para este modelo.

## Requisitos de hardware

- Con 140,6 millones de parámetros, los pesos en fp32 ocupan aproximadamente 560 MB. Con cuantización a fp16 o int8, el tamaño se reduce a unos 280 MB o 140 MB respectivamente.
- Cabe en GPUs de consumo como una RTX 3060 (12 GB) o incluso en una GTX 1660 Super (6 GB) con cuantización. También puede ejecutarse en CPU con un rendimiento aceptable para secuencias cortas.
- Opciones de despliegue: el modelo es compatible con la librería `transformers` de HuggingFace, por lo que puede usarse con vLLM, TGI, Ollama o en local con `pipeline` de transformers. No se especifican datos de latencia o throughput, pero al ser un encoder pequeño, la inferencia es rápida, del orden de milisegundos por secuencia.
- Para entrenamiento o fine-tuning, se recomienda al menos una GPU con 8 GB de VRAM, aunque el entrenamiento puede realizarse en CPU para pruebas pequeñas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (detección de alucinaciones a nivel de token). No se puede establecer una comparativa fiable.

## Limitaciones y advertencias

- La model card es muy escasa; no se indica la licencia, los idiomas exactos ni los datos de entrenamiento, lo que limita la evaluación de riesgos legales y de sesgo.
- Al estar entrenado en datos sintéticos, su generalización a alucinaciones reales en otros dominios puede ser limitada.
- No se especifican sesgos conocidos, pero el entrenamiento en un dataset multilingüe puede tener desequilibrios de representación entre idiomas.
- La licencia no está especificada, por lo que se recomienda contactar con los autores antes de usar comercialmente.
- El modelo no es generativo; no se puede usar para generar texto, solo para clasificar tokens en secuencias de entrada.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-sk)
- [Paper en arXiv (MultiWikiQHalluA)](https://arxiv.org/pdf/2602.02504v2)
- [Sitio web de EuroEval](https://euroeval.com/)
