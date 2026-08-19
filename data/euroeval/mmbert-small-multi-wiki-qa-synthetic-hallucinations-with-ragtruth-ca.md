# EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-ca

## Resumen

El modelo `EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-ca` es un encoder transformer especializado en la detección de alucinaciones a nivel de token en respuestas generadas por sistemas de recuperación aumentada (RAG). Ha sido desarrollado por el proyecto EuroEval, una iniciativa centrada en la evaluación robusta de modelos de lenguaje para lenguas europeas. El modelo parte de la arquitectura MMBERT-small, un encoder multilingüe moderno preentrenado sobre 3 billones de tokens en más de 1800 idiomas, y se ha ajustado mediante fine-tuning para la tarea de clasificación de tokens que señalan fragmentos alucinados en respuestas a preguntas sobre artículos de Wikipedia.

Este modelo forma parte de una familia de variantes lingüísticas (inglés, italiano, catalán, entre otras) generadas para el benchmark MultiWikiQHalluA, que evalúa la capacidad de los modelos para identificar contenido no fiel a la fuente en contextos multilingües. Con 140 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware de consumo, lo que lo hace atractivo para integrar en pipelines de verificación de hechos y control de calidad en producción. Su relevancia actual radica en la creciente adopción de sistemas RAG, donde la detección automática de alucinaciones es crítica para garantizar la fiabilidad de las respuestas generadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MMBERT-small (encoder transformer, atención bidireccional) |
| Parametros totales | 140.642.306 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (probablemente 512 tokens, no confirmado) |
| Tipos de cuantizacion | No disponible (solo safetensors en fp32) |
| Idiomas soportados | No disponible (el nombre sugiere multilingüe, con variantes para catalán, inglés e italiano) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en MMBERT, un encoder-only transformer presentado en el paper "MMBERT: A Modern Multilingual Encoder with Annealed Language Learning" (arXiv:2509.06888). MMBERT se preentrena con un objetivo de modelado de lenguaje enmascarado sobre un corpus multilingüe de 3 billones de tokens que abarca más de 1800 idiomas, utilizando un enfoque de aprendizaje de lenguaje con annealing para mejorar la eficiencia y la cobertura lingüística. La versión "small" reduce la escala de parámetros (140M) manteniendo la arquitectura de transformer estándar.

Sobre esta base preentrenada, el modelo se ha ajustado mediante fine-tuning para la tarea de token classification sobre el dataset sintético MultiWikiQHalluA. Este dataset se genera a partir de contextos de Wikipedia, preguntas y respuestas correctas, y utiliza el framework LettuceDetect para producir respuestas con etiquetas a nivel de token que marcan las porciones alucinadas. El fine-tuning se realiza de forma supervisada sobre estas etiquetas, de modo que el modelo aprende a señalar qué tokens de una respuesta no están respaldados por el contexto dado. No se dispone de información detallada sobre los hiperparámetros de entrenamiento, el régimen de precisión ni la duración del fine-tuning.

## Capacidades

- Detección de alucinaciones a nivel de token en respuestas generadas por sistemas RAG, identificando qué fragmentos no son fieles al contexto de referencia.
- Clasificación de tokens binaria (alucinado / no alucinado) mediante la pipeline de token-classification de HuggingFace.
- Procesamiento multilingüe gracias al preentrenamiento de MMBERT en más de 1800 idiomas, aunque el fine-tuning se ha realizado para variantes concretas (catalán, inglés, italiano).
- Integración sencilla en entornos transformers, con compatibilidad con endpoints de inferencia (endpoints_compatible).
- Capacidad de procesar pares contexto-pregunta-respuesta para evaluar la fidelidad de la respuesta generada.

## Casos de uso

- Control de calidad en sistemas RAG: el modelo puede integrarse como un paso posterior a la generación para marcar automáticamente las frases o tokens que no se corresponden con el contexto recuperado, permitiendo a los desarrolladores filtrar o corregir respuestas antes de mostrarlas al usuario final.
- Auditoría de chatbots de atención al cliente: en despliegues donde un asistente virtual responde basándose en documentos internos, este modelo puede señalar respuestas potencialmente incorrectas para su revisión manual, reduciendo el riesgo de proporcionar información errónea.
- Verificación de hechos en entornos periodísticos: aplicado a resúmenes automáticos de noticias, el modelo puede detectar afirmaciones no respaldadas por las fuentes originales, ayudando a los redactores a validar la precisión de los textos generados.
- Evaluación de pipelines de generación aumentada: los equipos de ML pueden utilizar el modelo como métrica automática de fidelidad en pruebas de regresión, comparando la tasa de tokens alucinados entre diferentes versiones del sistema RAG.
- Filtrado de respuestas en asistentes de documentación técnica: en herramientas que responden preguntas sobre manuales o APIs, el modelo puede descartar o advertir sobre respuestas que contengan información no verificable en la documentación.
- Investigación en detección de alucinaciones multilingües: sirve como punto de partida para experimentos académicos sobre cómo los modelos encoder pequeños se comportan en esta tarea en lenguas de baja representación, dado su origen multilingüe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper asociado al benchmark MultiWikiQHalluA (arXiv:2605.02504) podría contener métricas comparativas, pero no se han proporcionado en los materiales consultados.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 140M parámetros en fp32, el checkpoint ocupa aproximadamente 562 MB (140.642.306 × 4 bytes). La inferencia requiere menos de 1 GB de VRAM en lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluyendo GTX 1650, RTX 3050, o incluso CPU para inferencia en lote pequeño.
- Compatibilidad con hardware de consumo: sí, cabe en GPUs de gama de entrada y en Macs con Apple Silicon.
- Opciones de despliegue: se puede servir con HuggingFace Transformers, TGI (Text Generation Inference) para endpoints, o mediante ONNX Runtime para optimización en CPU. Al ser un encoder, también es compatible con frameworks como SentenceTransformers si se adapta para embeddings, aunque su uso principal es clasificación de tokens.
- Latencia y throughput: no se dispone de datos medidos. Para un modelo de este tamaño, la inferencia en GPU moderna es del orden de milisegundos por secuencia corta, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para la tarea de detección de alucinaciones a nivel de token. Existen alternativas como los clasificadores basados en DeBERTa o los modelos de verificación de hechos como FactCC, pero no se han encontrado comparativas directas con este modelo en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está especificada, por lo que el uso comercial no está garantizado sin consultar al autor.
- El modelo está ajustado para un dataset sintético concreto (MultiWikiQHalluA) y puede no generalizar bien a otros dominios o estilos de respuesta fuera de ese ámbito.
- Al ser un modelo de 140M parámetros, su capacidad de razonamiento contextual es limitada en comparación con modelos más grandes, lo que puede afectar a la precisión en casos ambiguos.
- No se dispone de información sobre sesgos específicos, pero al preentrenarse en 1800 idiomas, puede presentar disparidades de rendimiento entre lenguas con más o menos representación en el corpus original.
- El modelo solo realiza clasificación de tokens; no genera texto ni ofrece explicaciones de sus predicciones, lo que limita su uso como herramienta independiente de verificación sin un sistema que lo rodee.
- No se han publicado métricas de rendimiento ni estudios de robustez ante ataques adversarios o variaciones lingüísticas, por lo que su comportamiento en producción debe validarse empíricamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-ca
- Variante en inglés: https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-en
- Variante en italiano: https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-it
- Paper de MMBERT (arXiv:2509.06888): https://arxiv.org/pdf/2509.06888
- Paper del benchmark MultiWikiQHalluA (arXiv:2605.02504): https://arxiv.org/pdf/2605.02504v2
- Proyecto EuroEval: https://euroeval.com/
