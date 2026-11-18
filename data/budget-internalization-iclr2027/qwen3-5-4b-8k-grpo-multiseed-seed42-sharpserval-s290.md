# budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed42-sharpserval-s290

## Resumen

Qwen3.5-4B-8k-grpo-multiseed-seed42-sharpserval-s290 es un ajuste fino por aprendizaje por refuerzo (GRPO) del modelo base Qwen/Qwen3.5-4B, desarrollado por el equipo anónimo `budget-internalization-iclr2027` como parte de un envío a ICLR 2027. El modelo está especializado en razonamiento matemático bajo un presupuesto de generación fijo de 8.192 tokens, un escenario en el que las respuestas que exceden el límite se truncan y se puntúan tal cual, lo que fuerza al modelo a internalizar la restricción de longitud durante el entrenamiento.

Se trata de una ablación de semillas: el mismo recetario se ejecutó con tres semillas (42, 43 y 44), y este repositorio contiene el mejor checkpoint (paso 290) de la ejecución con semilla 42, apodada `sharpserval`. El checkpoint final del paso 300 se publica en un repositorio separado. El modelo tiene 4.539.265.536 parámetros (aproximadamente 4,5 mil millones) y un tamaño de repositorio de 9,1 GB en formato safetensors y BF16.

La relevancia de esta ficha es doble: por un lado, documenta un experimento de investigación sobre cómo el RL con presupuesto de tokens afecta al razonamiento matemático; por otro, sirve como referencia para quien quiera reproducir o evaluar la variabilidad entre semillas en recetas de GRPO sobre modelos de ~4B. Al ser un modelo de investigación con cero descargas y cero likes en el momento de la consulta, debe tratarse como material experimental, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5, multimodal image-text-to-text segun pipeline_tag) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el presupuesto de generacion es de 8.192 tokens, no la ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (hereda la del modelo base Qwen/Qwen3.5-4B) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de aproximadamente 4,5 mil millones de parámetros. El pipeline declarado es `image-text-to-text`, lo que sugiere que el modelo base es multimodal; sin embargo, la model card no detalla la arquitectura interna ni confirma si el ajuste conserva las capacidades de visión. El ajuste fino se realizó con GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalización del reward por grupo y pérdida a nivel de token. Las respuestas que alcanzan el presupuesto de 8.192 tokens se truncan y se puntúan tal cual, lo que constituye el mecanismo central del experimento: el modelo aprende a producir razonamientos que caben en ese límite.

Los datos de entrenamiento provienen de DeepScaleR (matemáticas), con un máximo de 3 épocas. La configuración es: 32 prompts × 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 5e-7, 10 pasos de warmup y 290 pasos totales. El reward es binario según la corrección de la respuesta extraída de las etiquetas `\boxed{}`. El prompt de entrenamiento pide razonamiento paso a paso y la respuesta dentro de `\boxed{}`. La validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR; este checkpoint es el mejor por precisión de validación de su ejecución. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento matemático paso a paso, con formato de respuesta forzado a `\boxed{}`.
- Razonamiento bajo restricción de longitud: entrenado explícitamente para operar con un presupuesto de 8.192 tokens de generación.
- Capacidad multimodal potencial (pipeline `image-text-to-text` heredado del modelo base), aunque no se documenta su preservación tras el ajuste.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el entrenamiento se limita a resolución de problemas matemáticos.
- Capacidades multilingües: no disponibles; no se especifican idiomas.
- Modo de pensamiento (thinking mode): no documentado explícitamente, aunque el prompt de entrenamiento induce cadenas de razonamiento.

## Casos de uso

- Evaluación de recetas GRPO en matemáticas: el modelo sirve como punto de comparación controlado (semilla 42, paso 290) frente a los checkpoints de las semillas 43 y 44 para medir la varianza entre semillas en un pipeline de RL.
- Investigación sobre internalización de presupuestos de tokens: permite estudiar cómo un límite fijo de 8.192 tokens de generación afecta a la precisión y a la longitud de las cadenas de razonamiento en problemas de DeepScaleR.
- Generación de soluciones matemáticas con formato verificable: la extracción mediante `\boxed{}` facilita la integración en pipelines automáticos de corrección de respuestas.
- Reproducción de experimentos académicos: al publicarse los checkpoints intermedios y finales de las tres semillas, se puede auditar la estabilidad del entrenamiento y la selección del mejor checkpoint por validación.
- Base para ajustes posteriores en dominios matemáticos: al ser un modelo de 4,5B con licencia Apache 2.0, puede servir como punto de partida para fine-tuning supervisado o RL en subdominios específicos.
- Estudio de truncamiento en RL: el modelo permite analizar el comportamiento de respuestas truncadas y su efecto en la señal de reward, un problema relevante en entrenamientos con límites estrictos de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que la precisión de validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR y que este checkpoint es el mejor de su ejecución por esa métrica, pero no se proporcionan los valores numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, se recomienda un mínimo de 12-16 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 5 GB para pesos; en 4 bits, alrededor de 3 GB (no se publican cuantizaciones oficiales, pero el tamaño permite generarlas).
- GPU recomendadas: A100, H100 o L40S para despliegue con vLLM y concurrencia; RTX 4090 (24 GB) para inferencia en BF16 con una sola petición o lotes pequeños.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090, RTX 4080 y GPUs con 12 GB o más en BF16; en 8 bits o 4 bits, en GPUs de 8 GB.
- Opciones de despliegue: transformers (código incluido en la model card), vLLM (`vllm serve`), y potencialmente llama.cpp u Ollama si se generan pesos GGUF, aunque no se documentan oficialmente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-4B GRPO seed 42, paso 290) | 4,54B | no disponible | Razonamiento matematico con presupuesto de 8k tokens | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B (base) | ~4,5B | no disponible | Modelo multimodal generalista | Apache 2.0 | Hugging Face |
| Checkpoints de semillas 43 y 44 del mismo proyecto | ~4,5B | no disponible | Misma receta, distinta semilla | Apache 2.0 | Hugging Face (enlaces en la model card) |
| Alternativas de ~4B especializadas en matematicas | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa con otros modelos de razonamiento matemático de tamaño similar no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción ni validación externa.
- Especialización estrecha: entrenado únicamente con DeepScaleR (matemáticas) y con reward binario de corrección; su rendimiento fuera de ese dominio no está documentado.
- Riesgo de alucinación: como todo modelo generativo, puede producir razonamientos plausibles pero incorrectos, especialmente en problemas fuera de la distribución de DeepScaleR.
- Truncamiento: las respuestas que alcanzan los 8.192 tokens se cortan y se puntúan tal cual; en producción, esto puede producir salidas incompletas sin aviso explícito.
- Idiomas: no se especifican los idiomas soportados; no se garantiza un buen rendimiento en castellano.
- Capacidades multimodales inciertas: aunque el pipeline es `image-text-to-text`, no se documenta si el ajuste conserva la visión del modelo base.
- Licencia: Apache 2.0 heredada del modelo base, lo que permite uso comercial, pero sin garantías del autor del ajuste.
- Sin benchmarks publicados: no se pueden comparar sus métricas con alternativas de forma rigurosa.
- Variabilidad entre semillas: al ser una ablación de semillas, los resultados pueden variar entre ejecuciones; este checkpoint concreto corresponde a la semilla 42 y al paso 290, no al final del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed42-sharpserval-s290
- Checkpoint paso 300 de la misma semilla: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed42-sharpserval-s300
- Semilla 43, paso 160: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed43-pickedwolf-s160
- Semilla 43, paso 300: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed43-pickedwolf-s300
- Semilla 44, paso 290: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed44-funpoodle-s290
- Semilla 44, paso 300: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-8k-grpo-multiseed-seed44-funpoodle-s300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
