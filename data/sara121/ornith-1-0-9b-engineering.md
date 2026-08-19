# Sara121/Ornith-1.0-9B-Engineering

## Resumen

Ornith-1.0-9B-Engineering es un modelo de lenguaje especializado en respuesta a preguntas de ingeniería, creado por Sara121 como adaptación de dominio del modelo base ornith-ai/Ornith-1.0-9B. El proceso consiste en el entrenamiento de un adaptador QLoRA sobre 17.133 ejemplos de QA de ingeniería y su posterior fusión (merge) en el checkpoint completo en precisión completa, seleccionando la época 2 por su mejor pérdida de validación y mayor token F1. El resultado es un modelo independiente (standalone) de 8.950 millones de parámetros, listo para cargarse con la librería transformers en bfloat16.

El modelo base Ornith-1.0-9B pertenece a la familia Ornith-1.0, desarrollada por Ornith AI, que incluye además variantes MoE de 35B y 397B parámetros. Está post-entrenado sobre Qwen 3.5 mediante un marco de aprendizaje por refuerzo auto-mejorable (DeepReinforce) que co-optimiza los rollouts de solución y los scaffolds de tarea, y soporta una ventana de contexto de 256K tokens (262.144). Esta ficha documenta la variante adaptada a ingeniería, relevante para desarrolladores que necesitan un modelo de QA técnica desplegable en una sola GPU con licencia MIT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (post-entrenado sobre Qwen 3.5) |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256K, heredada del modelo base) |
| Tipos de cuantizacion | no disponible (repo en safetensors bfloat16; cuantizaciones GGUF no publicadas para esta variante) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers, bfloat16) |

## Arquitectura y entrenamiento

El modelo es el resultado de fusionar un adaptador QLoRA de la época 2 (checkpoint-1072) en el checkpoint completo de ornith-ai/Ornith-1.0-9B. El entrenamiento del adaptador utilizó 17.133 ejemplos de QA de ingeniería, con un conjunto de evaluación congelado de 902 ejemplos. La selección de la época 2 se basó en la mejor pérdida de validación (1,2940 frente a 1,3532 de la época 1 y 1,4327 de la época 3) y el mejor token F1. El merge se realizó en precisión completa sobre el checkpoint transformers, sin utilizar el modelo GGUF público original ni para entrenamiento ni para fusión.

El modelo base Ornith-1.0-9B es un transformer denso post-entrenado sobre Qwen 3.5 mediante un marco de aprendizaje por refuerzo auto-mejorable que co-optimiza los rollouts de solución y los scaffolds de tarea específicos, permitiendo al modelo descubrir mejores estrategias de orquestación sin intervención humana. La familia Ornith-1.0 expone una interfaz compatible con OpenAI y soporta tool calling. La convención de generación de Ornith puede incluir contenido de razonamiento del tipo ` thinking... response` antes de la respuesta final, que se conserva en esta variante adaptada.

## Capacidades

- Respuesta a preguntas de ingeniería: especializado mediante QLoRA en QA técnica del dominio de ingeniería, con mejora sustancial de token F1 frente al modelo base (0,3429 frente a 0,1312).
- Razonamiento encadenado: hereda la convención de generación de Ornith con contenido de razonamiento ` thinking... response` previo a la respuesta.
- Ventana de contexto larga: soporta hasta 262.144 tokens, permitiendo procesar documentación técnica extensa, manuales y especificaciones completas.
- Tool calling: hereda del modelo base la capacidad de invocar herramientas, útil para flujos de agente.
- Interfaz compatible con OpenAI: el modelo base expone una API compatible, facilitando la integración en servicios existentes.
- Generación de texto en formato conversacional: incluye tokenizador y plantilla de chat propios, cargables con trust_remote_code.

## Casos de uso

- Soporte técnico de ingeniería: el modelo puede responder consultas de ingenieros sobre especificaciones, normativas y procedimientos, aprovechando su adaptación específica al dominio y su ventana de 256K tokens para procesar manuales completos.
- Asistente de documentación técnica: permite extraer respuestas de documentación extensa de producto o normativa, cargando el contexto completo en la ventana de 262.144 tokens sin necesidad de chunking.
- Sistema de QA en entornos de diseño: integrable en pipelines de ingeniería para validar respuestas sobre especificaciones de diseño, aunque requiere validación humana para usos sensibles.
- Chatbot de conocimiento corporativo: desplegable en una sola GPU (8,95B parámetros en bfloat16), adecuado para entornos on-premise con requisitos de confidencialidad.
- Agente de ingeniería con tool calling: hereda la capacidad de invocar herramientas del modelo base, permitiendo construir agentes que consulten bases de datos técnicas o APIs de cálculo.
- Evaluación y comparación de adaptaciones de dominio: el modelo sirve como referencia para estudiar el efecto del merge de adaptadores QLoRA frente al modelo base y otras épocas, con métricas de evaluación congeladas publicadas.

## Benchmarks y rendimiento

La model card publica resultados de evaluación congelada sobre un conjunto fijo de 902 ejemplos de QA de ingeniería. Las métricas son léxicas (exact match, normalized exact match y token F1) y no hay resultados de benchmarks generales como MMLU, HumanEval o GSM8K en la información disponible.

| Modelo | Exact match | Normalized exact match | Token F1 |
|---|---:|---:|---:|
| Base Ornith-1.0-9B | 0,0000 | 0,0000 | 0,1312 |
| Adaptador época 2 | 0,0022 | 0,0022 | 0,3272 |
| Adaptador época 3 | 0,0033 | 0,0033 | 0,2942 |
| Modelo fusionado época 2 | 0,0055 | 0,0055 | 0,3429 |

La pérdida de validación por época fue de 1,3532 (época 1), 1,2940 (época 2) y 1,4327 (época 3). La época 2 fue seleccionada por su menor pérdida y mejor token F1, aunque la época 3 obtuvo una coincidencia exacta adicional.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en bfloat16 ocupa aproximadamente 17,9 GB (tamaño del repositorio), por lo que se necesita un mínimo de 20 GB de VRAM para inferencia sin cuantización.
- GPU recomendadas: una NVIDIA A100 80GB o H100 80GB permite ejecutar el modelo con margen; el modelo base denso de 9B está diseñado para caber en una sola GPU de 80GB.
- Compatibilidad con GPU de consumo: una RTX 4090 (24 GB VRAM) puede ejecutar el modelo en bfloat16 con margen limitado; una RTX 3090 (24 GB) también es viable. GPU con menos de 20 GB requerirían cuantización, no publicada para esta variante.
- Opciones de despliegue: transformers con device_map="auto" y torch_dtype=torch.bfloat16, tal como documenta la model card. El modelo base soporta además interfaces compatibles con OpenAI y rutas de self-hosting.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Sara121/Ornith-1.0-9B-Engineering | 8,95B | 262.144 | QA de ingenieria (QLoRA) | MIT | safetensors |
| ornith-ai/Ornith-1.0-9B (base) | 8,95B | 262.144 | Ingenieria de software agéntica | MIT | safetensors, GGUF |
| ornith-ai/Ornith-1.0-35B (MoE) | 35B | 262.144 | Ingenieria de software agéntica | MIT | no disponible |
| ornith-ai/Ornith-1.0-397B (MoE) | 397B | 262.144 | Ingenieria de software agéntica | MIT | no disponible |

La variante adaptada mejora el token F1 sobre el conjunto de evaluación de ingeniería (0,3429 frente a 0,1312 del base), pero las variantes MoE de 35B y 397B ofrecen mayor capacidad a costa de requerir nodos multi-GPU con paralelismo de tensor. No se dispone de comparativas con modelos externos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Las métricas de evaluación son léxicas (exact match y token F1) y no garantizan corrección factual ni regulatoria de las respuestas.
- El modelo es una adaptación de dominio para QA de ingeniería y debe validarse antes de su uso en producción o en flujos sensibles al cumplimiento normativo.
- El exact match es extremadamente bajo (0,0055), lo que indica que las respuestas rara vez coinciden textualmente con la referencia; el token F1 de 0,3429 sugiere solapamiento parcial limitado.
- La licencia MIT del modelo adaptado no exime de verificar la licencia de los datos de entrenamiento del adaptador, no documentada en la información disponible.
- Los idiomas soportados no están documentados; la adaptación se realizó sobre un conjunto de datos de ingeniería cuya composición lingüística se desconoce.
- El contenido de razonamiento ` thinking... response` puede requerir post-procesado si se integra en aplicaciones que esperan respuestas directas.
- No se han publicado cuantizaciones GGUF ni AWQ para esta variante, lo que limita el despliegue en entornos con poca VRAM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sara121/Ornith-1.0-9B-Engineering
- Modelo base en HuggingFace: https://huggingface.co/ornith-ai/Ornith-1.0-9B
- Repositorio GitHub de Ornith-1: https://github.com/ornith-ai/Ornith-1
- Web oficial de Ornith AI: https://ornith.online/
- Página del modelo Ornith 1.0 9B: https://ornith.online/ornith-1-0-model-9b
