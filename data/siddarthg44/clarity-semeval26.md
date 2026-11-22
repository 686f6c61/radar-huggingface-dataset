# siddarthg44/clarity-semeval26

## Resumen

CLARITY es un sistema de clasificación de evasión en entrevistas políticas desarrollado por el equipo Nier_ANLP (Vidvathama R, Siddarth Gottumukkula, Sanjana Reddy Vonteri y Shashikanta Sahoo, IIIT Hyderabad) para la tarea SemEval-2026 Task 6. El repositorio aloja los adaptadores LoRA entrenados sobre Qwen3-8B-Base para asignar uno de nueve tipos de evasión (explícita, implícita, esquivación, general, desvío, respuesta parcial, negativa a responder, alegación de ignorancia y aclaración) a las respuestas de presidentes de EE. UU. ante preguntas de periodistas.

El sistema completo es un cascade de cuatro módulos: un clasificador M1 (Qwen3-8B-Base con LoRA, r=16, alpha=32, sobre todas las capas lineales, con cabeza de 9 clases sobre el último token), un router M2 que deriva el 30 % de los ítems menos confiados, un adjudicador M3 basado en Qwen3-27B-FP8 que elige entre las cuatro etiquetas top de M1 promediando cuatro órdenes de opciones, y un estudiante destilado M4 entrenado con mitad de etiquetas gold y mitad de etiquetas suaves de M3.

La relevancia del modelo es doble: por un lado, es un artefacto de investigación reproducible para una tarea de SemEval concreta; por otro, demuestra una estrategia de cascada clasificador pequeño + adjudicador grande que mejora un clasificador de 8B con solo 1,43 llamadas de LLM por ítem. La licencia es estrictamente de investigación, derivada de la licencia CC BY-NC-ND 4.0 del dataset QEvasion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B-Base) con adaptador LoRA y cabeza de clasificación de 9 clases |
| Parametros totales | 8B (modelo base) + adaptador LoRA (r=16, alpha=32) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens de entrada (truncado explícito en el clasificador) |
| Tipos de cuantizacion | No disponible para el adaptador; el adjudicador M3 usa FP8 (Qwen3-27B-FP8) |
| Idiomas soportados | Inglés (en) |
| Licencia | Research-only (derivada de CC BY-NC-ND 4.0 del dataset QEvasion) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); DeBERTa en model.pt |
| Tarea | Clasificación de texto (9 clases de evasión; subtarea 1: 3 niveles de claridad) |
| Modelo base | Qwen/Qwen3-8B-Base (Apache 2.0) |
| Dataset de entrenamiento | ailsntua/QEvasion |
| Tamaño del repo | 142,3 GB (incluye 10 semillas, adaptadores por época y pesos DeBERTa) |

## Arquitectura y entrenamiento

El clasificador M1 parte de Qwen3-8B-Base, un transformer decoder-only de 8B parámetros, al que se le añade un adaptador LoRA con r=16, alpha=32 aplicado a todas las capas lineales y una cabeza de clasificación de 9 vías sobre el último token. Se entrena durante 12 épocas con 10 semillas promediadas y ajuste de logits (logit adjustment) para compensar el desbalance de clases. La entrada combina la subpregunta, la pregunta completa y la respuesta del presidente, truncada a 1.024 tokens.

El sistema completo incorpora tres módulos adicionales. M2 es un router que deriva el 30 % de los ítems menos confiados según un umbral fijado sobre una porción de entrenamiento. M3 es un adjudicador Qwen3-27B-FP8 que recibe las cuatro etiquetas top de M1 y selecciona una, promediando cuatro órdenes de presentación de opciones y fusionando el resultado con M1. M4 es un estudiante destilado entrenado con un 50 % de etiquetas gold y un 50 % de etiquetas suaves generadas por M3. El repositorio también contiene experimentos previos con DeBERTa-v3-large (baseline, pérdidas, jerarquía, especialistas y re-ranker) que sirven de comparación.

## Capacidades

- Clasificación de evasión en respuestas políticas en una de nueve categorías (Explicit, Implicit, Dodging, General, Deflection, Partial/half-answer, Declining to answer, Claims ignorance, Clarification).
- Clasificación de nivel de claridad en tres clases (subtarea 1), derivada del tipo de evasión.
- Procesamiento de entradas compuestas por subpregunta, pregunta completa y respuesta, con hasta 1.024 tokens.
- Salida de probabilidades softmax por ítem, lo que permite promediar semillas y aplicar ajuste de logits.
- Capacidad de cascada con un adjudicador LLM de mayor tamaño (Qwen3-27B-FP8) para ítems de baja confianza.
- Destilación a un estudiante más pequeño con etiquetas suaves del profesor.
- No soporta tool calling, agentes, visión, audio ni generación de texto libre: es un clasificador discriminativo, no un modelo generativo de propósito general.
- Multilingüismo limitado al inglés.

## Casos de uso

- Análisis de discurso político en investigación: clasificar automáticamente las respuestas de presidentes de EE. UU. en entrevistas periodísticas para estudiar patrones de evasión a lo largo del tiempo, usando las probabilidades por ítem para análisis estadísticos.
- Evaluación de sistemas de QA político: usar el clasificador como métrica auxiliar para medir si las respuestas generadas por otros sistemas evaden la pregunta en lugar de responderla.
- Anotación asistida en proyectos de humanidades digitales: preetiquetar corpus de entrevistas con las nueve categorías de evasión y derivar solo los ítems de baja confianza al adjudicador M3, reduciendo el coste de anotación manual.
- Investigación en cascadas de modelos: reproducir el pipeline M1 + M2 + M3 + M4 como caso de estudio de cómo un clasificador de 8B con LoRA más un adjudicador de 27B mejora el macro-F1 con un coste controlado de llamadas LLM.
- Benchmarking de clasificadores de texto: comparar el rendimiento de DeBERTa-v3-large frente a Qwen3-8B con LoRA en una tarea de clasificación de discurso con clases desbalanceadas y anotación multi-anotador.
- Estudio de destilación con etiquetas suaves: utilizar los artefactos de M4 y los controles de profesor para analizar la transferencia de conocimiento desde un adjudicador grande a un estudiante pequeño.
- Docencia en NLP avanzado: el repositorio incluye logs, curvas de entrenamiento en W&B, configuraciones por semilla y probabilidades por ítem, lo que lo hace adecuado como material didáctico reproducible.

## Benchmarks y rendimiento

Resultados sobre el conjunto de desarrollo (308 ítems), según la model card del autor:

| Sistema | Subtarea 2 (macro-F1) | Subtarea 1 (macro-F1) | Llamadas LLM por ítem |
|---|---|---|---|
| M1 solo (Qwen3-8B + LoRA, 10 semillas) | 0,598 | 0,743 | 0 |
| M1 + M3 (cascada completa) | 0,650 | 0,788 | 1,43 |
| Estudiante destilado M4 + M3 | 0,608 | 0,785 | no disponible |

No se han publicado resultados de benchmarks en la información disponible para comparaciones con otros sistemas en el conjunto de test, ya que las etiquetas de test no se publicaron.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA se carga sobre Qwen3-8B-Base; en bfloat16 el modelo base requiere aproximadamente 16 GB de VRAM, más el adaptador (despreciable). En cuantización de 8 bits, en torno a 8-9 GB; en 4 bits, alrededor de 5-6 GB (estimaciones estándar para un modelo de 8B, no publicadas por el autor).
- GPU recomendadas: A100 40 GB u H100 para el pipeline completo con el adjudicador Qwen3-27B-FP8 (que requiere aproximadamente 27 GB en FP8). Para M1 solo, una RTX 4090 (24 GB) es suficiente en bfloat16.
- Cabe en GPU de consumo: sí, M1 en una RTX 4090 o RTX 3090 en bfloat16; en GPUs de 8-12 GB sería necesario cuantizar el modelo base.
- Opciones de despliegue: el adaptador se carga con `peft` y `transformers` (ver snippet de la model card). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este clasificador; al ser una cabeza de clasificación sobre el último token, el despliegue estándar es vía `transformers` + `peft`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CLARITY (este modelo) | 8B + LoRA | 1.024 tokens | Clasificación de evasión (9 clases) | Research-only | Hugging Face, repo de 142,3 GB |
| DeBERTa-v3-large (baseline del mismo repo) | 435M | 512 tokens típicamente | Clasificación de evasión | MIT (base) | Incluido en el repo como model.pt |
| Qwen3-8B-Base (modelo base) | 8B | 32.768 tokens nativos | Generación general | Apache 2.0 | Hugging Face |
| Qwen3-27B-FP8 (adjudicador M3) | 27B | no disponible | Generación y selección | Apache 2.0 (base) | Usado como componente del sistema |

La comparación con otros sistemas de SemEval-2026 Task 6 no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Todas las métricas reportadas son sobre el conjunto de desarrollo (308 ítems); las etiquetas de test no se publicaron, por lo que no hay evaluación independiente.
- El modelo clasifica la forma de una respuesta en relación con una pregunta, no su veracidad ni la intención del hablante.
- Entrenado exclusivamente con entrevistas de presidentes de EE. UU.; la generalización a otros dominios, países o idiomas no está validada.
- Solo soporta inglés.
- Licencia research-only derivada de CC BY-NC-ND 4.0 del dataset QEvasion: no se permite uso comercial.
- Riesgo de sesgo: el corpus de entrenamiento refleja un período y contexto político concreto, lo que puede introducir sesgos en la clasificación de respuestas de otros contextos.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de clasificaciones erróneas en ítems ambiguos o con anotadores en desacuerdo (la métrica macro-F1 cuenta un acierto si cualquier anotador dio esa etiqueta).
- El repositorio es muy pesado (142,3 GB) porque incluye 10 semillas, adaptadores por época y pesos DeBERTa; la descarga completa no es necesaria para usar solo un adaptador.
- El adjudicador M3 requiere Qwen3-27B-FP8, lo que eleva los requisitos de hardware del pipeline completo.
- La truncación a 1.024 tokens puede perder información en preguntas o respuestas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/siddarthg44/clarity-semeval26
- Repositorio GitHub (código, logs, informe y diapositivas): https://github.com/IamSid44/CLARITY-Unmasking-Political-Question-Evasions
- Curvas de entrenamiento en W&B: https://wandb.ai/iamsid44-iiit-hyderabad/clarity-semeval26
- Dataset QEvasion: https://huggingface.co/datasets/ailsntua/QEvasion
- Modelo base Qwen3-8B-Base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Licencia de referencia: https://huggingface.co/datasets/ailsntua/QEvasion
