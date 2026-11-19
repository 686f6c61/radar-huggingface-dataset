# JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-forced-answer-masked-unitedtrout-s300

## Resumen

El modelo `budget-internalization-qwen3.5-4b-8k-grpo-forced-answer-masked-unitedtrout-s300` es un ajuste fino por aprendizaje por refuerzo (RL) del modelo base Qwen/Qwen3.5-4B, desarrollado por JetBrains-Research. Su objetivo es internalizar un presupuesto fijo de generación de 8.192 tokens para tareas de razonamiento matemático, de modo que el modelo aprenda a producir respuestas correctas dentro de ese límite en lugar de depender de un escalado de cómputo en tiempo de inferencia. Se publica junto al artículo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*.

La arquitectura subyacente es la del Qwen3.5-4B, con 4.539.265.536 parámetros totales en formato BF16 y pesos en safetensors. El pipeline declarado es `image-text-to-text`, lo que sugiere que el modelo base conserva capacidades multimodales de entrada imagen-texto, aunque el ajuste fino se centra exclusivamente en razonamiento matemático sobre texto. El checkpoint publicado corresponde al paso 300 de entrenamiento, bajo el identificador interno `unitedtrout`.

La relevancia de esta variante radica en su enfoque metodológico: en lugar de entrenar para respuestas largas y luego truncar, el entrenamiento fuerza al modelo a emitir una respuesta final de hasta 120 tokens cuando se alcanza el presupuesto, y enmascara esos tokens forzados en la función de pérdida. Esto permite estudiar y explotar el compromiso entre precisión dentro del presupuesto y escalado en tiempo de prueba, un tema central en la literatura reciente de RLVR (Reinforcement Learning with Verifiable Rewards).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-4B); pipeline image-text-to-text |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (presupuesto de generacion de 8.192 tokens; contexto de entrada no especificado) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de aproximadamente 4,54 mil millones de parámetros. Sobre esa base se aplica un ajuste fino con GRPO (Group Relative Policy Optimization) y una variante de "forced answering": cuando la generación alcanza el presupuesto de 8.192 tokens (`max_new_tokens`), el modelo es forzado a escribir una respuesta final de hasta 120 tokens que sí se evalúa. Los tokens correspondientes a esa respuesta forzada se enmascaran en la pérdida, de modo que el gradiente no penaliza la emisión forzada sino que entrena la política para llegar a una respuesta correcta dentro del presupuesto.

El conjunto de datos es DeepScaleR (matemáticas), con un máximo de 3 épocas. La configuración de entrenamiento usa lotes de 32 prompts con 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 5e-7 y 10 pasos de calentamiento, durante 300 pasos. La recompensa es binaria según la corrección de la respuesta extraída de las etiquetas `\boxed{}`. Los pesos se publican en BF16. El prompt de entrenamiento sigue la plantilla de chat del modelo base e instruye a pensar paso a paso y a emitir la respuesta dentro de `\boxed{}`.

## Capacidades

- Generación de texto y razonamiento paso a paso orientado a problemas matemáticos.
- Resolución de problemas de matemáticas con formato de respuesta `\boxed{}` y verificación binaria de corrección.
- Razonamiento bajo un presupuesto fijo de generación de 8.192 tokens, con emisión forzada de respuesta final cuando se agota el presupuesto.
- Capacidad multimodal de entrada imagen-texto heredada del modelo base (pipeline `image-text-to-text`), aunque el ajuste fino se centra en matemáticas sobre texto.
- Soporte de conversación multi-turno mediante la plantilla de chat del modelo base.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso más allá del prompt de entrenamiento: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking explícito separado: no disponible como funcionalidad declarada; el entrenamiento usa razonamiento paso a paso dentro de la misma generación.

## Casos de uso

- Evaluación de investigación sobre presupuestos fijos de razonamiento: el modelo sirve para estudiar cómo el RLVR con presupuesto fijo afecta a la precisión dentro del presupuesto frente al escalado en tiempo de prueba, replicando la metodología del artículo asociado.
- Resolución de problemas matemáticos de competición en entornos con límite de tokens: adecuado cuando el coste de inferencia está acotado a 8.192 tokens de generación y se necesita una respuesta final verificable en formato `\boxed{}`.
- Generación de soluciones paso a paso para datasets de matemáticas: útil para producir cadenas de razonamiento etiquetadas y comparar la corrección binaria con DeepScaleR u otros conjuntos similares.
- Baseline en experimentos de RLVR: sirve como punto de comparación frente a variantes sin enmascarado de respuesta forzada o con otros presupuestos (por ejemplo, 4k o 16k tokens).
- Prototipado de asistentes educativos de matemáticas: puede integrarse en un pipeline de corrección automática donde la respuesta se extrae de `\boxed{}` y se compara con la solución de referencia.
- Inferencia con coste controlado en producción: al estar entrenado para responder dentro de un presupuesto fijo, permite planificar la latencia y el coste por consulta sin depender de decodificación especulativa ni de escalado adaptativo.
- Investigación sobre multimodalidad con Qwen3.5-4B: al conservar el pipeline `image-text-to-text`, puede usarse para comprobar si el ajuste fino matemático degrada o preserva capacidades de entrada imagen-texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos (4,54 mil millones de parámetros × 2 bytes), más memoria para activaciones y caché KV; en la práctica, se recomienda al menos 16-24 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5-5 GB para pesos; en 4 bits, alrededor de 2,3-3 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para despliegue a escala; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en BF16 con contexto moderado; GPUs de 16 GB (RTX 4080, A4000) viables con cuantización.
- Cabe en GPU de consumidor: sí, en RTX 4090/3090 en BF16 y en GPUs de 8-16 GB con cuantización, siempre que se generen hasta 8.192 tokens, lo que incrementa la memoria de caché KV.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para serving; llama.cpp/Ollama si se generan cuantizaciones GGUF (no publicadas oficialmente).
- Latencia y throughput: no disponibles. El presupuesto de 8.192 tokens de generación implica latencias altas en decodificación autorregresiva; conviene planificar batching y límites de `max_new_tokens` en producción.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| budget-internalization-qwen3.5-4b-8k-grpo-forced-answer-masked-unitedtrout-s300 | 4,54 B | no disponible (presupuesto de generacion 8.192) | RLVR con presupuesto fijo y respuesta forzada enmascarada | Apache 2.0 | Hugging Face (JetBrains-Research) |
| Qwen/Qwen3.5-4B (base) | 4,54 B | no disponible | Modelo base multimodal image-text-to-text sin ajuste RL especifico | Apache 2.0 | Hugging Face (Qwen) |
| Otras variantes del mismo paper (otros presupuestos/run IDs) | 4,54 B | no disponible | Misma metodologia con distinto presupuesto o configuracion | Apache 2.0 | Hugging Face (JetBrains-Research) |
| Modelos de razonamiento matematico de ~4B (p. ej. variantes RL sobre Qwen) | ~4 B | no disponible | RLVR sobre matematicas | variable | variable |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- El ajuste fino está especializado en matemáticas (DeepScaleR) y puede degradar el rendimiento en tareas generales de texto o en dominios ajenos al razonamiento matemático.
- Riesgo de alucinación en la cadena de razonamiento: la recompensa es binaria sobre la respuesta final, no sobre la validez de los pasos intermedios.
- El presupuesto fijo de 8.192 tokens puede ser insuficiente para problemas muy complejos; el modelo está entrenado para forzar una respuesta al agotarse el presupuesto, lo que puede producir respuestas incorrectas en lugar de razonamientos más largos.
- No se han publicado datos sobre sesgos, idiomas soportados ni evaluación de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base Qwen/Qwen3.5-4B; conviene revisar las condiciones del modelo base y de los datos DeepScaleR.
- El checkpoint corresponde al paso 300 y no se indica si es el mejor checkpoint; no hay métricas de validación publicadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.
- La model card marca la cita como "TODO"; no hay referencia bibliográfica completa ni enlace al paper en la información disponible.
- El pipeline `image-text-to-text` sugiere capacidades multimodales, pero el ajuste fino no las entrena explícitamente; su comportamiento en tareas de visión no está evaluado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-forced-answer-masked-unitedtrout-s300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Organización JetBrains-Research: https://huggingface.co/JetBrains-Research
- Paper *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*: no disponible (enlace no incluido en la informacion proporcionada)
