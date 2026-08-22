# EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-sv

## Resumen

El modelo `EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-sv` es un encoder transformer de tipo ModernBERT, desarrollado por el proyecto EuroEval, especializado en la detección de alucinaciones a nivel de token en respuestas generadas por sistemas de recuperación aumentada (RAG). Se trata de una variante para sueco (`sv`) dentro de una familia multilingüe que también incluye versiones en inglés (`en`) y feroés (`fo`). El modelo se ha ajustado mediante fine-tuning sobre un conjunto de datos sintéticos generado a partir de preguntas y respuestas de WikiQA, con etiquetas de alucinación a nivel de token producidas por el framework LettuceDetect, tal como se describe en el artículo "A multilingual hallucination benchmark: MultiWikiQHalluA" (arXiv:2605.02504v2).

Con 140,6 millones de parámetros, es un modelo compacto orientado a tareas de clasificación de tokens (token-classification), lo que permite identificar qué partes de una respuesta generada son fieles al contexto recuperado y cuáles son inventadas o incorrectas. Su relevancia actual radica en la creciente necesidad de verificar la veracidad de las salidas de modelos generativos en aplicaciones de RAG, especialmente en idiomas de baja representación como el sueco, donde las herramientas de detección de alucinaciones son escasas.

La ficha se basa en la información disponible en HuggingFace y en el artículo mencionado; no se han publicado resultados de benchmarks específicos en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 140.642.306 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin indicación de cuantización) |
| Idiomas soportados | no disponible (el nombre sugiere multilingüe; la variante `sv` está orientada al sueco) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ModernBERT, un encoder transformer eficiente diseñado para tareas de comprensión del lenguaje y clasificación de secuencias. Aunque no se especifican los detalles de configuración (número de capas, cabezas, etc.), el tamaño de 140M parámetros es consistente con la variante `small` de ModernBERT. El modelo ha sido fine-tuneado para clasificación de tokens, lo que implica que cada token de entrada recibe una etiqueta que indica si es parte de una alucinación o no.

El entrenamiento se realizó sobre un conjunto de datos sintético generado a partir del corpus WikiQA, donde se crearon contextos, preguntas y respuestas de referencia. El framework LettuceDetect, basado en un modelo de lenguaje, produjo respuestas con alucinaciones etiquetadas a nivel de token. Este proceso se describe en el artículo "A multilingual hallucination benchmark: MultiWikiQHalluA" (arXiv:2605.02504v2), que también detalla el pipeline de generación de datos y el ajuste del modelo. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Detección de alucinaciones a nivel de token en respuestas de sistemas RAG, identificando qué partes de una respuesta son fieles al contexto y cuáles son inventadas.
- Clasificación de tokens como alucinados o no alucinados, lo que permite un análisis granular de la veracidad.
- Soporte multilingüe (al menos sueco, inglés y feroés según las variantes publicadas), aunque no se especifican los idiomas exactos cubiertos.
- Integración con el ecosistema HuggingFace Transformers mediante la librería `transformers` y pipeline de `token-classification`.
- Compatible con endpoints de inferencia (tag `endpoints_compatible`), lo que facilita su despliegue en servicios de producción.

## Casos de uso

- Verificación de respuestas en sistemas de atención al cliente basados en RAG: el modelo puede analizar cada token de la respuesta generada y señalar qué partes no están respaldadas por el contexto recuperado, permitiendo a los operadores humanos corregir o descartar información errónea antes de enviarla al usuario.
- Auditoría de calidad en motores de búsqueda con generación aumentada: en un buscador que sintetiza respuestas a partir de documentos, este modelo puede marcar las frases que contienen datos inventados, mejorando la fiabilidad del sistema.
- Filtrado de contenido en asistentes virtuales multilingües: al desplegar el modelo en un asistente que opera en sueco (u otros idiomas), se puede detectar automáticamente cuándo el asistente se desvía de la información recuperada y activar un mecanismo de corrección.
- Evaluación de pipelines RAG en entornos de desarrollo: los equipos de ingeniería pueden usar el modelo como una métrica automática para comparar diferentes configuraciones de recuperación y generación, midiendo la tasa de alucinación por token.
- Análisis de sesgos en modelos generativos: al etiquetar tokens alucinados, se pueden identificar patrones sistemáticos de invención en ciertos dominios o temas, lo que ayuda a depurar los datos de entrenamiento.
- Investigación académica en detección de alucinaciones: el modelo sirve como baseline para estudios sobre veracidad en modelos de lenguaje, especialmente en idiomas de bajos recursos, y puede ser utilizado para comparar métodos de mitigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo arXiv:2605.02504v2 describe el benchmark MultiWikiQHalluA, que evalúa la detección de alucinaciones a nivel de token, pero no se incluyen métricas específicas para este modelo en la model card ni en los resultados de búsqueda. Se recomienda consultar el artículo para obtener datos de evaluación si están disponibles.

## Requisitos de hardware

- Al tratarse de un modelo con 140,6M parámetros, la inferencia es ligera. En precisión fp32, el tamaño del modelo en memoria es de aproximadamente 562 MB (140,6M × 4 bytes); en fp16 se reduce a unos 281 MB.
- Es viable ejecutarlo en GPUs de consumo con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 2060 o superiores). Incluso podría funcionar en CPU para inferencia por lotes pequeños, aunque con mayor latencia.
- Para despliegue en producción, se recomienda usar `vLLM`, `TGI` (Text Generation Inference) o `Ollama` si se convierte a GGUF, aunque no se dispone de cuantizaciones oficiales.
- Dado su tamaño, la latencia por petición es baja (del orden de milisegundos en GPU moderna), aunque no se proporcionan cifras exactas de throughput.
- El repositorio ocupa 0.6 GB, lo que incluye los pesos en safetensors y posiblemente otros archivos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para la detección de alucinaciones a nivel de token en sueco o multilingüe. Existen otros enfoques basados en modelos de lenguaje grandes (como GPT-4 o Llama) para verificación de hechos, pero no son directamente comparables por su naturaleza generativa y su coste computacional. Se recomienda consultar la literatura reciente sobre detección de alucinaciones en RAG para identificar alternativas. En esta ficha se indica "no disponible" por falta de datos.

## Limitaciones y advertencias

- La model card no proporciona información sobre sesgos, riesgos o limitaciones específicas. Al ser un modelo entrenado con datos sintéticos generados a partir de WikiQA, su rendimiento puede degradarse en dominios muy diferentes a los de ese corpus.
- La detección de alucinaciones a nivel de token depende de la calidad de las etiquetas de entrenamiento; si el generador sintético introduce errores, el modelo puede aprender a clasificar incorrectamente.
- No se especifica la licencia, por lo que el uso comercial no está claramente permitido; se recomienda contactar con los autores antes de utilizarlo en producción.
- El modelo está diseñado para clasificación de tokens, no para generar texto; su uso fuera de esta tarea no es apropiado.
- La cobertura idiomática no está documentada; aunque el nombre sugiere multilingüismo, no se garantiza un rendimiento uniforme en todos los idiomas.
- La fecha de creación (2026-08-22) es posterior a la fecha de redacción de esta ficha, lo que sugiere que el modelo es muy reciente y puede tener poca validación externa.

## Enlaces

- [Página del modelo en HuggingFace](https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-sv)
- [Artículo "A multilingual hallucination benchmark: MultiWikiQHalluA" (arXiv:2605.02504v2)](https://arxiv.org/pdf/2605.02504v2)
- [Sitio web de EuroEval](https://euroeval.com/)
- Variantes relacionadas: [versión en inglés](https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-en) y [versión en feroés](https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-fo)
