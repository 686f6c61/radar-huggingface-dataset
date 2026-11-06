# nlpctx/activeqa-telugu-reformulator-rl

## Resumen

ActiveQATeluguReformulatorRL es un modelo de reformulación de preguntas en telugu desarrollado por el usuario nlpctx y publicado en Hugging Face. Se trata de un ajuste fino mediante LoRA del modelo MultiIndicParaphraseGenerationSS, un modelo basado en la arquitectura mBART con 244 millones de parámetros, especializado en la tarea de reformular preguntas para sistemas de question answering (QA) de tipo ActiveQA. El modelo se ha post-entrenado con un bucle de reinforcement learning con validación por etapas, usando una recompensa de preservación de entidades y una recompensa de QA basada en el modelo l3cube-pune/telugu-question-answering-squad-bert.

El problema que resuelve es concreto: en pipelines de QA, las preguntas formuladas por usuarios reales suelen ser ambiguas o no coinciden con la formulación de los documentos fuente; reformularlas mejora la recuperación y la respuesta. Este modelo está entrenado sobre 804 preguntas en telugu extraídas de un conjunto de datos de Indic-Rag-Suite generado por LLM a partir de Wikipedia en telugu, con selección del mejor checkpoint sobre 200 preguntas de validación reservadas.

Es relevante como artefacto de investigación para la comunidad de procesamiento de lenguaje natural en lenguas indias, especialmente por su enfoque de RL con recompensas compuestas y por su licencia MIT. No obstante, el propio autor lo etiqueta explícitamente como artefacto de investigación y no como sistema de QA de producción, y advierte de que las respuestas del dataset de entrenamiento son plateadas (generadas automáticamente) y no verificadas por humanos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | mBART (transformer encoder-decoder) |
| Parámetros totales | 244.082.191 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | telugu (te) |
| Licencia | MIT |
| Formato de pesos | safetensors (LoRA fusionada) |

## Arquitectura y entrenamiento

El modelo parte de MultiIndicParaphraseGenerationSS, un checkpoint de la familia mBART orientado a la generación de paráfrasis en lenguas indias. Sobre él se entrena un adaptador LoRA directamente desde el checkpoint crudo, que posteriormente se fusiona en los pesos finales, dando lugar a un modelo denso de 244 millones de parámetros en formato safetensors. La tarea objetivo es la reformulación de preguntas: dada una pregunta en telugu, generar una variante que preserve las entidades y mejore su utilidad para un sistema de QA.

El entrenamiento combina un ajuste supervisado inicial sobre 804 preguntas en telugu con un bucle de reinforcement learning con validación por etapas. La función de recompensa agrega dos señales: una recompensa de preservación de entidades, que penaliza la pérdida o alteración de entidades nombradas relevantes, y una recompensa de QA calculada con el modelo l3cube-pune/telugu-question-answering-squad-bert. El mejor checkpoint se selecciona sobre 200 preguntas de desarrollo reservadas. El dataset de procedencia es una muestra en telugu de ai4bharat/Indic-Rag-Suite, con pares de QA generados por LLM a partir de Wikipedia en telugu; el autor advierte que las respuestas son plateadas y no verificadas por humanos.

## Capacidades

- Reformulación de preguntas en telugu preservando entidades nombradas.
- Generación de paráfrasis de preguntas orientadas a mejorar la recuperación en pipelines de QA.
- Generación de texto seq2seq en telugu dentro del dominio de preguntas y respuestas.
- Optimización mediante RL con recompensa compuesta (preservación de entidades y calidad de QA).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al telugu según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Reformulación de consultas en sistemas de búsqueda documental en telugu: el modelo reescribe la pregunta del usuario para alinearla con la formulación de los pasajes indexados, mejorando la recuperación en un pipeline RAG sobre Wikipedia en telugu.
- Preprocesado en pipelines de question answering extractivo: antes de pasar la pregunta a un modelo QA como el BERT de telugu usado como recompensa, el reformulador genera variantes que preservan entidades y evitan ambigüedades.
- Aumento de datos para entrenamiento de sistemas QA en telugu: generar paráfrasis de preguntas existentes para ampliar el conjunto de entrenamiento manteniendo las entidades clave.
- Investigación en reinforcement learning aplicado a generación de texto: el modelo sirve como referencia reproducible de un bucle RL con validación por etapas y recompensas compuestas sobre un modelo mBART.
- Normalización de preguntas en asistentes conversacionales de dominio restringido en telugu: reformular turnos de usuario para que sean más explícitos antes de la búsqueda.
- Evaluación de preservación de entidades en paráfrasis: usar el modelo como caso de estudio para medir cómo las recompensas de entidades afectan a la fidelidad de las reformulaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1 GB para los pesos (244 millones de parámetros), más overhead de activaciones y KV cache.
- VRAM estimada en fp16/bf16: aproximadamente 0,5 GB para los pesos, más overhead.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para inferencia en precisión reducida; A100, H100 o RTX 4090 son sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060 o superiores con cuantización o fp16.
- Opciones de despliegue: transformers con PyTorch, TGI, vLLM (si soporta la arquitectura mBART en la versión usada), llama.cpp y Ollama solo si existe conversión a GGUF (no confirmada en la información disponible).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| nlpctx/activeqa-telugu-reformulator-rl | 244 M | no disponible | te | MIT | Reformulación de preguntas con RL |
| MultiIndicParaphraseGenerationSS (base) | no disponible | no disponible | lenguas indias | no disponible | Paráfrasis multilingüe índica |
| l3cube-pune/telugu-question-answering-squad-bert | no disponible | no disponible | te | no disponible | QA extractivo en telugu |

La comparación directa con alternativas de reformulación de preguntas en telugu no está disponible en la información proporcionada; los modelos listados son el checkpoint base y el modelo usado como recompensa, no alternativas equivalentes.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente que no es un sistema de QA de producción.
- Datos de entrenamiento plateados: las respuestas del dataset Indic-Rag-Suite en telugu son generadas por LLM y no verificadas por humanos, lo que puede introducir ruido y sesgos en el ajuste.
- Tamaño del conjunto de entrenamiento reducido: 804 preguntas de entrenamiento y 200 de desarrollo, lo que limita la generalización.
- Dominio restringido: entrenado sobre preguntas derivadas de Wikipedia en telugu; el rendimiento fuera de ese dominio no está caracterizado.
- Idioma único: solo telugu; no se documenta soporte para otras lenguas indias ni para código mixto.
- Riesgo de alucinación: no cuantificado en la información disponible; la recompensa de QA basada en un modelo BERT puede no detectar reformulaciones semánticamente incorrectas.
- Sesgos conocidos: no documentados en la model card.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre la calidad o idoneidad del modelo en producción.
- Longitud de contexto y tipos de cuantización no documentados, lo que dificulta planificar el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nlpctx/activeqa-telugu-reformulator-rl
- Modelo base MultiIndicParaphraseGenerationSS: no disponible en la información proporcionada
- Modelo de recompensa QA: https://huggingface.co/l3cube-pune/telugu-question-answering-squad-bert
- Dataset Indic-Rag-Suite: https://huggingface.co/datasets/ai4bharat/Indic-Rag-Suite
- Paper o blog del autor: no disponible en la información proporcionada
