# huyhoangdinhcong/qwen3-1.7b-grpo-countdown

## Resumen

Qwen3-1.7B GRPO / Dr.GRPO on Countdown es un ajuste fino por aprendizaje por refuerzo del modelo Qwen/Qwen3-1.7B, publicado por el usuario huyhoangdinhcong en Hugging Face. El modelo se entrena específicamente para resolver tareas Countdown, un tipo de problema aritmético en el que, dado un conjunto de números y un objetivo, hay que construir una expresión con las operaciones básicas que alcance dicho objetivo. El entrenamiento emplea dos variantes de optimización por política proximal relajada: GRPO (Group Relative Policy Optimization) y Dr.GRPO (una variante con normalización de ventajas por desviación típica), sobre el conjunto de datos justinphan3110/Countdown-Tasks-3to4.

El interés del modelo es principalmente metodológico: sirve como referencia reproducible de cómo el ajuste fino con RL mejora el razonamiento aritmético de un modelo pequeño (1.700 millones de parámetros) en una tarea con recompensa verificable. La model card reporta una mejora sustancial respecto a la línea base zero-shot del mismo modelo base, pasando de 0,39 % a 45,12 % de precisión con GRPO a 256 tokens y de 15,43 % a 61,04 % con Dr.GRPO a 512 tokens. El repositorio ocupa 3,5 GB e incluye los pesos en formato safetensors distribuidos en cuatro carpetas según variante de pérdida y longitud máxima de generación.

La relevancia actual radica en que ejemplifica el patrón de RL con recompensas verificables aplicado a modelos de talla reducida, un área de creciente interés para investigadores que buscan recetas de entrenamiento eficientes y desplegables en hardware asequible. El modelo se distribuye bajo licencia Apache 2.0 y hereda la arquitectura y el tokenizador de la familia Qwen3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-1.7B; detalles específicos de capas y atención no disponibles en la información proporcionada) |
| Parametros totales | 1.700 millones (1.7B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Qwen3-1.7B) |
| Tipos de cuantizacion | no disponible en la información proporcionada |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B, un transformer decoder-only de 1.700 millones de parámetros, y se ajusta mediante aprendizaje por refuerzo con dos variantes de optimización de política: GRPO y Dr.GRPO. El entrenamiento se ejecuta durante 80 pasos con `rollout_batch_size=128`, `group_size=8` y `clip_range=0.2`. La tarea objetivo es Countdown, un problema de razonamiento aritmético con recompensa verificable, sobre el conjunto de datos justinphan3110/Countdown-Tasks-3to4. Se generan cuatro variantes de pesos según la función de pérdida (GRPO o Dr.GRPO) y la longitud máxima de generación (256 o 512 tokens), lo que permite analizar el efecto conjunto de la normalización de ventajas y del presupuesto de tokens en la precisión final.

No se detalla en la información proporcionada el número total de tokens de entrenamiento, la composición exacta del dataset más allá de su identificador, ni si se aplicaron etapas adicionales de RLHF o DPO. La innovación técnica principal es el uso de Dr.GRPO, que normaliza las ventajas por la desviación típica del grupo, y la comparación sistemática frente a GRPO estándar bajo dos presupuestos de longitud, lo que aísla el efecto de cada decisión de diseño.

## Capacidades

- Generación de texto y razonamiento aritmético orientado a la resolución de problemas Countdown: construir expresiones con operaciones básicas que alcancen un objetivo numérico.
- Razonamiento de múltiples pasos dentro de la tarea de entrenamiento, con cadenas de generación de hasta 256 o 512 tokens según la variante de pesos elegida.
- Especialización en una única tarea con recompensa verificable; no se documentan capacidades generales de código, matemáticas avanzadas, visión o audio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso general: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; la model card no declara idiomas y el ajuste se centra en una tarea aritmética.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación en RL con recompensas verificables: el modelo sirve como referencia reproducible para estudiar el efecto de GRPO frente a Dr.GRPO en modelos de 1.7B, con puntos de comparación ya publicados (45,12 % frente a 50,49 % a 256 tokens y 58,40 % frente a 61,04 % a 512 tokens).
- Evaluación de recetas de ajuste fino: las cuatro carpetas de pesos permiten aislar la contribución de la función de pérdida y del límite de tokens, útil para diseñar experimentos controlados en laboratorios con recursos limitados.
- Docencia y formación: ejemplo práctico de pipeline completo de RL sobre un modelo pequeño, desde el modelo base hasta la evaluación sobre 1024 problemas, adecuado para cursos de aprendizaje por refuerzo aplicado a LLM.
- Generación de datos sintéticos de razonamiento aritmético: el modelo puede producir trazas de resolución de problemas Countdown que sirvan como datos de entrenamiento o de evaluación para modelos mayores.
- Pruebas de despliegue en hardware de consumo: con 1.700 millones de parámetros, es viable ejecutarlo en GPU consumer para experimentar con inferencia de modelos ajustados por RL, aunque no se documentan requisitos concretos de VRAM.
- Análisis de robustez y alucinación en tareas verificables: al tratarse de una tarea con comprobación automática de la respuesta, permite medir con precisión la tasa de fallo del modelo y estudiar modos de error en razonamiento aritmético.

## Benchmarks y rendimiento

Los únicos resultados disponibles son los de la tarea Countdown sobre 1024 problemas, reportados en la model card:

| Variante | Función de pérdida | Tokens máximos | Precisión final |
|---|---|---|---|
| grpo_L256 | GRPO | 256 | 45,12 % |
| dr_grpo_L256 | Dr.GRPO | 256 | 50,49 % |
| grpo_L512 | GRPO | 512 | 58,40 % |
| dr_grpo_L512 | Dr.GRPO | 512 | 61,04 % |
| Línea base zero-shot | sin entrenamiento | 256 | 0,39 % |
| Línea base zero-shot | sin entrenamiento | 512 | 15,43 % |
| Línea base zero-shot | sin entrenamiento | 1024 | 37,99 % |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 1.700 millones de parámetros en precisión FP16 requiere aproximadamente 3,4 GB solo para los pesos, a lo que hay que sumar la memoria del contexto y del runtime; en cuantizaciones de 8 o 4 bits el requisito sería sustancialmente menor, pero no se documentan cuantizaciones publicadas para este repositorio.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría esperar viabilidad en GPU consumer con suficiente VRAM (por ejemplo, RTX 4090, RTX 3090 o superiores), pero no se confirma en la model card.
- ¿Cabe en GPU consumer? No confirmado en la información disponible; el tamaño de 1.7B lo hace plausible, pero no hay datos oficiales.
- Opciones de despliegue: no disponibles en la información proporcionada. El repositorio distribuye pesos en safetensors, compatibles con frameworks estándar de inferencia, pero no se especifican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B GRPO/Dr.GRPO Countdown | 1,7B | no disponible | Countdown (aritmética verificable) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-1.7B (base) | 1,7B | no disponible | Propósito general | Apache 2.0 | Hugging Face |
| Otros ajustes GRPO sobre modelos pequeños | no disponible | no disponible | Razonamiento verificable | no disponible | no disponible |

La comparación directa más relevante es con el modelo base Qwen/Qwen3-1.7B sin ajuste: sobre la misma tarea y con 1024 problemas de evaluación, la línea base zero-shot alcanza 0,39 % a 256 tokens, 15,43 % a 512 tokens y 37,99 % a 1024 tokens, frente al 61,04 % del ajuste Dr.GRPO a 512 tokens. No se dispone de información sobre otros ajustes comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está ajustado exclusivamente para la tarea Countdown; su rendimiento en tareas generales de lenguaje, código o matemáticas no está documentado y probablemente se degrade respecto al modelo base.
- Riesgo de sobreajuste a la distribución de entrenamiento: el ajuste se realiza sobre un único dataset (justinphan3110/Countdown-Tasks-3to4) durante 80 pasos, sin datos sobre generalización a otras variantes de Countdown.
- Precisión limitada: incluso la mejor variante alcanza 61,04 % de precisión, lo que implica una tasa de error del 38,96 % en la tarea objetivo; no es adecuado para uso en producción donde se requiera fiabilidad alta.
- Sesgos conocidos: no documentados en la información proporcionada; al heredar el modelo base, podría arrastrar sesgos de Qwen3-1.7B, pero no se detallan.
- Riesgo de alucinación: no evaluado en la model card; en tareas aritméticas verificables el fallo se manifiesta como expresiones incorrectas, pero no se analiza el comportamiento fuera de distribución.
- Idiomas: no declarados; el ajuste se centra en una tarea numérica y no se garantiza un comportamiento multilingüe consistente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3-1.7B tiene sus propios términos que conviene verificar; la model card no detalla condiciones adicionales.
- Caveats para producción: sin datos de latencia, throughput, cuantizaciones publicadas ni soporte de frameworks de despliegue, no se recomienda su uso en producción sin una evaluación previa propia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huyhoangdinhcong/qwen3-1.7b-grpo-countdown
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/justinphan3110/Countdown-Tasks-3to4
