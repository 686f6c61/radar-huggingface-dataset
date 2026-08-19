# EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-hr

## Resumen

El modelo `EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-hr` es un clasificador de tokens entrenado para detectar alucinaciones a nivel de token en respuestas generadas por modelos de lenguaje, específicamente en escenarios de generación aumentada por recuperación (RAG). Ha sido desarrollado por el proyecto EuroEval, una iniciativa europea centrada en la evaluación de modelos lingüísticos, y se basa en la arquitectura ModernBERT en su variante pequeña (mmBERT-small), con aproximadamente 140,6 millones de parámetros. Su pipeline es de clasificación de tokens, lo que permite etiquetar cada token de una respuesta como factual o alucinado.

El modelo se ha ajustado mediante fine-tuning sobre un corpus sintético de alucinaciones generado a partir del conjunto de datos MultiWikiQA, utilizando el framework LettuceDetect y el corpus RAGTruth. Este enfoque aborda un problema crítico en los sistemas de RAG: la verificación automática de la fidelidad de las respuestas generadas. La relevancia actual de este modelo radica en la creciente adopción de arquitecturas RAG en producción, donde la detección temprana de alucinaciones puede reducir errores costosos en aplicaciones de atención al cliente, asistentes virtuales o generación de informes.

La información pública disponible es limitada: la model card está prácticamente vacía y no se especifican detalles sobre el entrenamiento, los idiomas soportados ni la licencia. Sin embargo, el nombre del modelo y los resultados de búsqueda asociados indican que se trata de un modelo multilingüe, aunque no se enumeran los idiomas concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (small) con cabeza de clasificacion de tokens |
| Parametros totales | 140.642.306 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32) |
| Idiomas soportados | no disponible (el nombre sugiere multilingue, pero no se detalla) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT, una evolución de BERT que incorpora mejoras como atención eficiente y normalización pre-LayerNorm, diseñada para un mejor rendimiento en tareas de comprensión del lenguaje. En concreto, se utiliza la variante pequeña (mmBERT-small) con 140 millones de parámetros, y se añade una cabeza de clasificación de tokens que asigna a cada token de la secuencia una etiqueta binaria (alucinado o no alucinado). El pipeline declarado en HuggingFace es `token-classification`, lo que confirma esta arquitectura.

El proceso de entrenamiento, según el paper asociado (arXiv:2605.02504), sigue un enfoque en dos etapas: primero se genera un corpus sintético de alucinaciones mediante el framework LettuceDetect, que utiliza un modelo de lenguaje para producir respuestas etiquetadas a nivel de token a partir de contextos, preguntas y respuestas de referencia del conjunto MultiWikiQA. Posteriormente, el modelo mmBERT-small se ajusta con fine-tuning sobre este corpus. No se han publicado detalles sobre el número de épocas, la tasa de aprendizaje, el tamaño del lote ni la composición exacta de los datos de entrenamiento.

## Capacidades

- Detección de alucinaciones a nivel de token en respuestas generadas por LLMs, distinguiendo tokens factuales de tokens inventados o inconsistentes con el contexto.
- Clasificación de secuencias completas o fragmentos, gracias a la naturaleza encoder de ModernBERT.
- Soporte multilingüe, aunque los idiomas concretos no están documentados; el nombre "multi-wiki-qa" sugiere que se entrenó con datos de Wikipedia en varios idiomas.
- Integración sencilla con el ecosistema HuggingFace Transformers, permitiendo su uso en pipelines de clasificación de tokens con pocas líneas de código.
- Compatible con endpoints de inferencia (tag `endpoints_compatible`), lo que facilita su despliegue en servicios gestionados.

## Casos de uso

- Verificación automática de respuestas en sistemas RAG: el modelo puede analizar cada token de una respuesta generada y señalar aquellos que se desvían del contexto recuperado, permitiendo a los desarrolladores filtrar o corregir salidas no fiables antes de mostrarlas al usuario final.
- Control de calidad en generación de informes médicos o legales: en dominios donde la precisión es crítica, este modelo puede actuar como una capa de validación que marca fragmentos potencialmente alucinados para revisión humana.
- Depuración de pipelines de generación: los equipos de ingeniería pueden utilizar el modelo para identificar patrones de alucinación en sus propios sistemas y ajustar los prompts, la recuperación o el postprocesado en consecuencia.
- Evaluación de modelos de lenguaje en entornos multilingües: al estar entrenado sobre MultiWikiQA, puede servir como herramienta de evaluación para medir la fidelidad de respuestas generadas en varios idiomas, aunque los idiomas exactos no se hayan especificado.
- Filtrado de contenido en asistentes virtuales: integrado en un flujo de conversación, el modelo puede etiquetar respuestas sospechosas y activar mecanismos de fallback, como pedir disculpas o solicitar más contexto al usuario.
- Investigación académica sobre alucinaciones: el modelo proporciona una base reproducible para estudiar la detección de alucinaciones a nivel de token, pudiendo ser utilizado como punto de partida para fine-tuning en dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación y el paper asociado no está accesible en su totalidad desde los resultados de búsqueda. Por tanto, no se pueden presentar datos objetivos sobre su rendimiento en tareas estándar como MMLU, HumanEval o similares, que además no son aplicables a un modelo de clasificación de tokens.

## Requisitos de hardware

- VRAM estimada: con 140 millones de parámetros y pesos en fp32, el modelo ocupa aproximadamente 560 MB en memoria (140M × 4 bytes). En cuantización a int8, se reduciría a unos 140 MB. Esto permite su ejecución en GPUs con 2 GB de VRAM o incluso en CPU.
- GPU recomendada: cualquier GPU moderna con al menos 2 GB de VRAM, como una NVIDIA T4, GTX 1650 o RTX 3060. Para inferencia en lote, una A10 o A100 ofrecería mayor throughput.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas como RTX 3060, RTX 4060 o similares, e incluso en sistemas sin GPU utilizando CPU con suficiente RAM.
- Opciones de despliegue: al ser un modelo de Transformers estándar, se puede servir con HuggingFace Inference Endpoints, vLLM (aunque no está optimizado para encoder-only), o mediante ONNX Runtime. Para uso local, la librería `transformers` con PyTorch o TensorFlow es suficiente.
- Latencia y throughput: no se dispone de datos medidos. Para un modelo de este tamaño, la inferencia en GPU suele ser inferior a 10 ms por secuencia de 512 tokens, pero esto depende del hardware y del backend.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. No se han identificado modelos de la misma categoría (detección de alucinaciones a nivel de token con arquitectura ModernBERT) en los resultados de búsqueda. El corpus RAGTruth, mencionado en el repositorio de GitHub, incluye modelos como GPT-3.5 y Llama-2 para generar datos, pero no son modelos comparables en tarea. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- La model card no proporciona información sobre sesgos, por lo que se desconocen posibles sesgos de género, culturales o lingüísticos. Al estar entrenado sobre datos de Wikipedia, puede heredar los sesgos presentes en ese corpus.
- Riesgo de alucinación en la propia clasificación: como todo modelo de lenguaje, puede cometer errores al etiquetar tokens, especialmente en contextos ambiguos o con vocabulario especializado.
- Longitud de contexto no documentada: aunque ModernBERT soporta típicamente 512 tokens, no se ha confirmado para este modelo. Las secuencias más largas podrían truncarse, afectando a la precisión en documentos extensos.
- Licencia no especificada: el uso comercial del modelo está sujeto a incertidumbre legal. Se recomienda contactar con los autores antes de desplegarlo en producción.
- Idiomas limitados: aunque el nombre sugiere multilingüismo, no se han publicado los idiomas exactos. Su rendimiento en idiomas no representados en el entrenamiento podría ser deficiente.
- Dependencia del corpus sintético: al entrenarse con datos generados por otro LLM, el modelo podría estar sesgado hacia los patrones de alucinación de ese generador, limitando su generalización a otros tipos de alucinaciones.

## Enlaces

- [HuggingFace: EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-hr](https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-hr)
- [Paper: A multilingual hallucination benchmark: MultiWikiQHalluA (arXiv:2605.02504)](https://arxiv.org/abs/2605.02504)
- [Repositorio GitHub: RAGTruth](https://github.com/ParticleMedia/RAGTruth)
