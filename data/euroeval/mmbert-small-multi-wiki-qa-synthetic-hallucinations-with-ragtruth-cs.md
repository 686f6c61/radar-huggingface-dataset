# EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-cs

## Resumen

El modelo `EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-cs` es un encoder transformer de tipo ModernBERT (variante mmBERT-small) fine-tuneado para la detección de alucinaciones a nivel de token en respuestas generadas mediante retrieval-augmented generation (RAG). Lo desarrolla el proyecto EuroEval, un marco de evaluación de modelos de lenguaje para lenguas europeas. El nombre del modelo indica que fue entrenado con datos sintéticos de alucinaciones generados a partir de los corpus MultiWikiQA y RAGTruth, y que está orientado al checo (sufijo `-cs`).

El modelo resuelve el problema de identificar afirmaciones no respaldadas por el contexto recuperado en sistemas RAG, una tarea crítica para desplegar asistentes basados en recuperación en producción. Su relevancia actual radica en que las alucinaciones siguen siendo uno de los principales obstáculos para la adopción fiable de la IA generativa, y este tipo de detectores permiten auditar y filtrar respuestas automáticamente.

Con 140,6 millones de parámetros y un pipeline de token-classification, el modelo es ligero y adecuado para integración en pipelines de control de calidad. La fecha de creación (agosto de 2026) sugiere que es un desarrollo reciente, aunque la model card no proporciona detalles adicionales sobre el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (variante mmBERT-small, encoder transformer) |
| Parametros totales | 140.642.306 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (probablemente 512 o 1024 tokens, sin confirmar) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | checo (segun el nombre del modelo, no confirmado en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ModernBERT, un encoder transformer que introduce mejoras sobre BERT original, como embeddings rotatorios (RoPE), normalización pre-RMS y una mayor longitud de contexto. La variante `mmBERT-small` es una adaptación multilingüe de tamaño reducido, aunque el número de parámetros (140,6 M) es superior al de un BERT-small típico y se acerca a la configuración base de ModernBERT (149 M).

Según el paper asociado (arXiv:2605.02504), el entrenamiento sigue un pipeline de dos etapas: primero se genera un corpus sintético de alucinaciones mediante el framework LetuceDetect, que toma contextos, preguntas y respuestas verdaderas de MultiWikiQA y produce respuestas etiquetadas a nivel de token (fiel vs. alucinado). Después se fine-tunea el modelo mmBERT-small para la clasificación de tokens sobre este corpus, complementado con datos de RAGTruth, un corpus de alucinaciones a nivel de palabra en escenarios RAG. No se dispone de información sobre el número exacto de tokens de entrenamiento, hiperparámetros o si se usó alguna técnica de regularización adicional.

## Capacidades

- Detección de alucinaciones a nivel de token en respuestas generadas por RAG: el modelo etiqueta cada token como fiel al contexto o alucinado.
- Clasificación de secuencias derivada: agregando las etiquetas por token se puede obtener un veredicto global de fidelidad para una respuesta completa.
- Soporte de entrada bilingüe/multilingüe limitado: aunque el modelo está orientado al checo, la arquitectura ModernBERT es multilingüe; sin embargo, no se ha confirmado su rendimiento en otros idiomas.
- Integración con el ecosistema Transformers: compatible con pipelines estándar de token-classification y con endpoints de inferencia.

No se han documentado capacidades de generación de texto, tool calling, agentes ni razonamiento multi-step, ya que se trata de un encoder puro, no de un modelo generativo.

## Casos de uso

- Auditoría de respuestas en sistemas RAG en checo: el modelo puede integrarse como un paso posterior a la generación para marcar tokens no respaldados por el contexto recuperado, permitiendo a los desarrolladores descartar o regenerar respuestas sospechosas.
- Control de calidad en asistentes virtuales empresariales: antes de entregar una respuesta al usuario final, un pipeline puede ejecutar el detector y activar una alerta si la proporción de tokens alucinados supera un umbral.
- Filtrado de contenido generado automáticamente en portales de noticias o documentación: se puede aplicar sobre textos producidos con RAG para garantizar que las afirmaciones sobre hechos estén respaldadas por fuentes fiables.
- Investigación en detección de alucinaciones: sirve como modelo base para experimentos de fine-tuning en otros idiomas o dominios, dado su tamaño reducido y su arquitectura moderna.
- Monitorización de modelos generativos en producción: combinado con un registro de prompts y respuestas, permite medir la tasa de alucinación de un sistema RAG a lo largo del tiempo y detectar regresiones.
- Preprocesamiento de datos para entrenar clasificadores de fidelidad: las predicciones del modelo pueden utilizarse para filtrar o etiquetar automáticamente grandes volúmenes de datos generados, reduciendo el esfuerzo de anotación manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper asociado (arXiv:2605.02504) podría incluir métricas de evaluación, pero no se han proporcionado en la documentación consultada. No se dispone de comparaciones con otros detectores de alucinación.

## Requisitos de hardware

- VRAM estimada: con 140,6 millones de parámetros, en fp32 el modelo ocupa aproximadamente 560 MB, y en fp16 unos 280 MB. La inferencia para token-classification puede ejecutarse en GPUs con 2 GB de VRAM o menos.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3060) es suficiente. También puede ejecutarse en CPU con un rendimiento aceptable para inferencia por lotes pequeños.
- Opciones de despliegue: al ser un modelo de Transformers estándar, puede servirse con Hugging Face Inference Endpoints, o mediante frameworks como vLLM (aunque vLLM está más orientado a generación, soporta encoders), o simplemente con la librería `transformers` en un servicio FastAPI.
- Latencia y throughput: no se han publicado datos concretos. Para un modelo de este tamaño, se espera una latencia de decenas de milisegundos por secuencia en GPU moderna y de cientos de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (detección de alucinaciones a nivel de token en checo). Existen otros detectores basados en RAGTruth (por ejemplo, los entrenados sobre el corpus original), pero no se han encontrado datos públicos de rendimiento para establecer una comparación objetiva. Se indica "no disponible".

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado con datos sintéticos generados por un LLM (framework LetuceDetect), el modelo puede heredar sesgos del generador, como preferencias por ciertos estilos de redacción o patrones de error específicos.
- Riesgo de alucinación: el modelo es un detector, no un generador, por lo que no produce texto; sin embargo, puede cometer errores de clasificación (falsos positivos y falsos negativos) que deben validarse en el dominio de aplicación.
- Limitaciones de contexto: la longitud de contexto no está confirmada; si es de 512 o 1024 tokens, respuestas largas podrían truncarse y perder señales de alucinación al final del texto.
- Limitaciones de idioma: aunque el nombre sugiere checo, la model card no confirma los idiomas soportados. El rendimiento en otros idiomas es incierto.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede garantizar el uso comercial sin verificación previa con los autores.
- Caveat para producción: la model card es muy incompleta (todos los campos son "[More Information Needed]"), lo que impide conocer detalles críticos como el dataset exacto de entrenamiento, la metodología de evaluación o los hiperparámetros. Se recomienda contactar con EuroEval antes de un despliegue serio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-cs
- Versión en inglés del mismo modelo: https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-en
- Paper del benchmark MultiWikiQHalluA (arXiv:2605.02504): https://arxiv.org/pdf/2605.02504v2
- Repositorio de RAGTruth: https://github.com/ParticleMedia/RAGTruth
- Sitio web de EuroEval: https://euroeval.com/
