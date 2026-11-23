# OceanLabs/Coral-2-3B-fast

## Resumen

Coral-2-3B-fast es una variante publicada por OceanLabs del modelo d1-3B de Liquid AI, un modelo de decisión de 3.123 millones de parámetros construido sobre LFM2.5-VL-3B. A diferencia de un modelo conversacional, d1-3B no genera texto: recibe un estado (texto, JSON, imágenes o una mezcla) y un conjunto de preguntas tipadas, y devuelve respuestas calibradas en un único forward pass con cero tokens de salida. OceanLabs distribuye los pesos y el tokenizador sin modificar; los cambios se limitan al código de inferencia y a la documentación, según se detalla en el fichero CHANGES.md del repositorio.

La relevancia del modelo reside en su orientación a tareas de decisión dentro de pipelines: enrutamiento, triaje, moderación, clasificación de intención, verificación de extracciones, reranking, evaluación tipo LLM-as-a-judge y guardarraíles de agentes. Su arquitectura combina un codificador visual SigLIP2 NaFlex de 400 millones de parámetros con el backbone LFM2.5, una ventana de contexto de 32.768 tokens y un vocabulario de 128.000 tokens. La licencia es LFM Open License v1.0, que no es de código abierto plena y establece restricciones de uso comercial.

El modelo declara el mejor resultado entre los modelos de decisión por debajo de 10.000 millones de parámetros en el Decision Index 0.2.1, con 48,57 puntos, por delante de Decider 35B-A3B (47,11). Su latencia declarada es de 8 ms por decisión en una NVIDIA RTX 4090, 9 ms en una AMD MI325X y 30 ms en un Apple M5 Pro, lo que lo sitúa como candidato para decisiones en línea de baja latencia en el edge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (LFM2.5) con codificador visual SigLIP2 NaFlex de 400M; modelo de decisión de un solo paso |
| Parametros totales | 3.123.483.888 (3,12B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi (16 idiomas) |
| Licencia | LFM Open License v1.0 (lfm1.0), licencia "other" con restricciones |
| Formato de pesos | safetensors; requiere `trust_remote_code=True` (código propio en el repo) |
| Vocabulario | 128.000 tokens |
| Modelo base | LiquidAI/d1-3B (a su vez basado en LFM2.5-VL-3B) |
| Pipeline declarado | text-classification |
| Tamano del repo | 6,3 GB |

## Arquitectura y entrenamiento

El modelo parte de LFM2.5-VL-3B, un modelo visión-lenguaje de propósito general de 3,1B parámetros, y ha sido post-entrenado para producir decisiones calibradas en un único forward pass sin generar tokens de salida. La arquitectura integra un codificador visual SigLIP2 NaFlex de 400M parámetros con optimización de forma, lo que permite procesar imágenes junto con texto y JSON dentro del mismo estado de entrada. El vocabulario es de 128.000 tokens y la ventana de contexto alcanza los 32.768 tokens.

Los detalles sobre el volumen de tokens de entrenamiento, la composición del dataset y el uso de RLHF o DPO no están disponibles en la información proporcionada. La innovación técnica principal es el paradigma "system-one": en lugar de decodificar texto de forma autorregresiva, el modelo evalúa un estado una sola vez y emite respuestas tipadas (sí/no, elección entre opciones nombradas, puntuación en una escala) para todas las preguntas planteadas simultáneamente, lo que elimina la latencia asociada a la generación token a token y reduce el coste computacional por decisión.

## Capacidades

- Decisión tipada en un solo paso: respuestas booleanas (`noul`), de elección entre opciones nombradas (`choice`) y de puntuación sobre criterios ordenados (`score`).
- Procesamiento multimodal: acepta texto, cualquier valor JSON e imágenes en el mismo estado de entrada.
- Múltiples preguntas sobre un mismo estado evaluadas en un único forward pass, reutilizando la lectura del estado y sus imágenes.
- Inferencia por lotes con empaquetado sin padding mediante `system_one_batch`.
- Clasificación de intención, tema y urgencia; moderación de contenido; verificación de extracciones; reranking; puntuación tipo LLM-as-a-judge; guardarraíles de agentes.
- Inspección visual: conteo de objetos, evaluación de imágenes como estado completo.
- Capacidades multilingües en 16 idiomas, incluidos español, inglés, chino, árabe, hindi, japonés y coreano.
- No es un modelo conversacional: no genera texto libre ni mantiene diálogo.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket y devuelve en una sola pasada la pregunta de si requiere reembolso, el equipo asignado (facturación, técnico, fraude) y la urgencia en una escala de tres niveles. Su latencia de 8 ms en RTX 4090 permite integrarlo en la ruta crítica del sistema de ticketing.
- Moderación de contenido en plataformas: clasificación booleana y por categorías de publicaciones o mensajes, con la ventaja de que el coste por decisión no crece con la longitud de la respuesta, ya que no se generan tokens.
- Guardarraíles de agentes: verificación previa de si una acción propuesta por un agente cumple las políticas definidas, usando preguntas tipadas sobre el estado JSON de la conversación y las herramientas disponibles.
- Triaje de urgencia en atención al cliente: puntuación de la urgencia de cada conversación para priorizar la cola de agentes humanos, procesando lotes de conversaciones empaquetadas sin padding.
- Inspección visual automatizada: evaluación de imágenes como estado completo para tareas como conteo de objetos, verificación de presencia de elementos o clasificación de escenas, aprovechando el codificador SigLIP2.
- Reranking y evaluación de respuestas: puntuación de pares pregunta-respuesta generados por otro modelo mediante preguntas de tipo score, útil como juez automático en pipelines de evaluación.
- Verificación de extracciones estructuradas: comprobación de si un JSON extraído por otro sistema contiene los campos requeridos y si sus valores son plausibles, con el estado compuesto por el JSON y las preguntas de validación.

## Benchmarks y rendimiento

| Benchmark | Coral-2-3B-fast (d1-3B) | Referencia |
|---|---|---|
| Decision Index 0.2.1 | 48,57 | Decider 35B-A3B: 47,11 |
| Media en 11 benchmarks de imagen públicos | 74,1 | LFM2.5-VL-3B: 73,9 |
| Latencia por decisión (RTX 4090) | 8 ms | no disponible |
| Latencia por decisión (AMD MI325X) | 9 ms | no disponible |
| Latencia por decisión (Apple M5 Pro) | 30 ms | no disponible |

Los datos de benchmarks corresponden al modelo original LiquidAI/d1-3B, según advierte la propia model card. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar de lenguaje, lo que es coherente con la naturaleza no generativa del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,12B parámetros en bfloat16, el peso de los pesos ronda los 6,3 GB, a los que hay que sumar la memoria del codificador visual y las activaciones; en fp32 la cifra se duplica aproximadamente.
- GPU recomendadas: NVIDIA RTX 4090 (latencia declarada de 8 ms), AMD MI325X (9 ms). Para despliegues en servidor, A100 y H100 son compatibles por capacidad, aunque no se han publicado cifras específicas para ellas.
- Cabe en GPU de consumo: sí, con 3,12B parámetros en bfloat16 cabe en tarjetas con 8-12 GB de VRAM o más; también se declara compatibilidad con Apple Silicon vía MPS (30 ms en M5 Pro).
- Opciones de despliegue: la model card documenta uso con `transformers>=5.14` y `trust_remote_code=True`, con soporte de CUDA, MPS y CPU. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la información disponible, algo esperable dado que el modelo requiere código propio y no es generativo.
- Latencia y throughput: 8 ms por decisión en RTX 4090, 9 ms en MI325X y 30 ms en M5 Pro; el método `system_one_batch` empaqueta múltiples peticiones sin padding para aumentar el throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decision Index 0.2.1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Coral-2-3B-fast (d1-3B) | 3,12B | 32.768 | 48,57 | LFM Open License v1.0 | Hugging Face |
| LiquidAI/d1-3B (original) | 3,12B | 32.768 | 48,57 | LFM Open License v1.0 | Hugging Face |
| Decider 35B-A3B | 35B (MoE) | no disponible | 47,11 | no disponible | no disponible |
| LFM2.5-VL-3B | 3,1B | no disponible | no disponible | no disponible | Hugging Face |

La comparativa se limita a los datos publicados en la model card. Coral-2-3B-fast comparte pesos y tokenizador con LiquidAI/d1-3B, por lo que su rendimiento es idéntico; la diferencia está en el código de inferencia y la documentación. Frente a Decider 35B-A3B, el modelo de OceanLabs obtiene una puntuación superior en el Decision Index con una décima parte de los parámetros.

## Limitaciones y advertencias

- No es un modelo conversacional: no genera texto libre, por lo que no sirve para chat, redacción ni respuesta abierta.
- Los pesos y el tokenizador son los de LiquidAI/d1-3B sin modificar; los benchmarks y latencias publicados corresponden al modelo original, no a una validación independiente de esta variante.
- La licencia LFM Open License v1.0 no es de código abierto plena y establece restricciones para uso comercial; es necesario revisar el fichero LICENSE antes de desplegar en producción.
- Requiere `trust_remote_code=True` y una versión de transformers igual o superior a 5.14, lo que implica ejecutar código del repositorio y complica la integración con servidores de inferencia estándar.
- No se dispone de información sobre sesgos, tasas de alucinación ni robustez idiomática más allá de la lista de 16 idiomas soportados.
- No se documentan opciones de cuantización ni formatos GGUF, lo que limita el despliegue en entornos con restricciones de memoria estrictas.
- El modelo tiene 35 descargas y 1 like en el momento de la consulta, por lo que la validación comunitaria es muy reducida.
- Al ser un modelo de decisión, la calidad depende de la formulación de las preguntas y los criterios; preguntas ambiguas o criterios solapados pueden degradar la calibración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OceanLabs/Coral-2-3B-fast
- Modelo base original: https://huggingface.co/LiquidAI/d1-3B
- Modelo visión-lenguaje de partida: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- Blog de Liquid AI sobre open d1: https://www.liquid.ai/blog/open-d1
- Demo Open d1 Arcade: https://huggingface.co/spaces/LiquidAI/system-one-arcade
- Playground LFM: https://playground.liquid.ai/
- Documentación LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Discord de Liquid AI: https://discord.com/invite/liquid-ai
- Paper referenciado (arXiv:2511.23404): https://arxiv.org/abs/2511.23404
