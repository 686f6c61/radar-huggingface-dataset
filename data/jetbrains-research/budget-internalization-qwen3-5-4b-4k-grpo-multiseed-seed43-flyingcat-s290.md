# JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed43-flyingcat-s290

## Resumen

`budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed43-flyingcat-s290` es un ajuste fino por aprendizaje por refuerzo (RL) del modelo multimodal Qwen/Qwen3.5-4B, desarrollado por JetBrains-Research. El objetivo del entrenamiento es que el modelo internalice un presupuesto fijo de generacion de 4.096 tokens y produzca respuestas de razonamiento matematico correctas dentro de ese limite, en lugar de depender del escalado en tiempo de inferencia (generar cadenas de razonamiento cada vez mas largas). El modelo acompana al articulo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*.

Se trata de una ablacion de semilla: la misma receta se entreno con tres semillas (42, 43 y 44) y este repositorio corresponde a la semilla 43, en el checkpoint 290, que es el mejor de la ejecucion segun la precision de validacion (medida cada 10 pasos sobre 480 problemas reservados de DeepScaleR). El checkpoint final del paso 300 se publica en un repositorio aparte.

El modelo conserva la arquitectura y el pipeline del base (image-text-to-text) y suma 4.539.265.536 parametros en BF16 (repo de 9,1 GB). Es relevante para quienes investigan RLVR (RL con recompensa verificable), control del gasto de tokens en produccion y reproducibilidad de recetas de RL en modelos pequenos con capacidades multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-4B, pipeline image-text-to-text) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el presupuesto de generacion entrenado es de 4.096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (hereda la del modelo base) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal (image-text-to-text) de aproximadamente 4,54 mil millones de parametros. El ajuste se realiza con GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalizacion del reward por grupo y perdida a nivel de token. Las respuestas que alcanzan el presupuesto de 4.096 tokens se truncan y se puntuan tal cual, lo que empuja al modelo a resolver dentro del limite en lugar de extender la cadena de razonamiento.

Los datos de entrenamiento son el conjunto DeepScaleR (matematicas), con un maximo de 3 epocas. La configuracion usa lotes de 32 prompts por 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 5e-7 y 10 pasos de calentamiento, durante 290 pasos. La recompensa es binaria: correccion de la respuesta extraida de las etiquetas `\boxed{}`. El prompt de entrenamiento pide razonar paso a paso y devolver la respuesta dentro de `\boxed{}`. Los pesos se publican en BF16.

## Capacidades

- Razonamiento matematico con presupuesto fijo de 4.096 tokens de generacion.
- Generacion de cadenas de razonamiento paso a paso con formato de respuesta en `\boxed{}`.
- Capacidades multimodales heredadas del base (pipeline image-text-to-text).
- Generacion de texto conversacional (etiqueta `conversational`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito, vision o audio: no disponible en la informacion proporcionada (mas alla del pipeline multimodal del base).

## Casos de uso

- Evaluacion de investigacion en RLVR: reproducir la receta GRPO con presupuesto fijo y comparar la semilla 43 con las semillas 42 y 44 para medir varianza entre ejecuciones.
- Razonamiento matematico con coste acotado: usar el modelo en pipelines donde el coste por consulta debe estar limitado a 4.096 tokens de salida, por ejemplo en servicios de resolucion de problemas con SLA de latencia.
- Generacion de soluciones verificables: integrar la extraccion de `\boxed{}` en un validador automatico para entornos de correccion de ejercicios matematicos.
- Estudio de internalizacion de presupuesto: comparar la precision dentro del presupuesto frente al modelo base sin ajuste para cuantificar la perdida o ganancia de exactitud.
- Prototipado de tutores matematicos: desplegar el modelo detras de una interfaz conversacional que exija respuestas acotadas y con respuesta final parseable.
- Ablaciones de semilla en investigacion: usar este checkpoint como referencia del mejor paso (290) frente al paso final (300) para analizar la estabilidad del entrenamiento.
- Base para experimentos multimodales: al heredar el pipeline image-text-to-text de Qwen3.5-4B, sirve como punto de partida para estudiar si el ajuste en matematicas afecta a tareas con imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que la precision de validacion se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR y que el paso 290 es el mejor checkpoint de esta ejecucion, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos, mas memoria para KV cache y activaciones; en la practica se recomienda al menos 16-24 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 4,5-5 GB para pesos; en 4 bits, alrededor de 2,3-3 GB (estimaciones a partir del numero de parametros; no hay cuantizaciones publicadas en el repo).
- GPU recomendadas: A100 40/80 GB o H100 para lotes grandes y entrenamiento; RTX 4090 (24 GB) para inferencia en BF16 con lotes moderados.
- GPU de consumo: cabe en RTX 4090, RTX 3090 (24 GB) y, con cuantizacion, en GPUs de 8-12 GB.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI para servido en BF16; llama.cpp u Ollama requeririan conversion a GGUF, no publicada en el repo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-4B, 4k budget, GRPO, seed 43) | 4,54 B | no disponible (presupuesto de generacion 4.096) | RLVR con presupuesto fijo en matematicas | apache-2.0 | Hugging Face, safetensors |
| Qwen/Qwen3.5-4B (base) | ~4,54 B | no disponible | Modelo multimodal generalista | apache-2.0 | Hugging Face |
| Semilla 42 del mismo recipe (`maturebass`, s290) | 4,54 B | no disponible | Misma receta, distinta semilla | apache-2.0 | Hugging Face |
| Semilla 44 del mismo recipe (`hugeguppy`, s300) | 4,54 B | no disponible | Misma receta, distinta semilla | apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- Entrenado exclusivamente con datos de matematicas (DeepScaleR); el rendimiento en otras tareas puede degradarse respecto al base.
- La recompensa es binaria sobre la respuesta final extraida de `\boxed{}`; puede priorizar el formato sobre la correccion del razonamiento intermedio.
- Las respuestas que superan los 4.096 tokens se truncan y se puntuan como estan, lo que puede penalizar problemas que requieren cadenas largas.
- Es una ablacion de semilla concreta; no debe interpretarse como el resultado final del articulo, sino como un punto de comparacion.
- Sesgos conocidos: no disponibles en la informacion proporcionada; hereda los del modelo base.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; en tareas matematicas el fallo tipico es un razonamiento plausible con respuesta incorrecta.
- Idiomas soportados no documentados; el prompt de entrenamiento esta en ingles.
- Licencia apache-2.0 heredada del base; conviene revisar los terminos de Qwen3.5-4B para uso comercial.
- El repositorio no incluye cuantizaciones ni datos de benchmarks, por lo que la evaluacion en produccion requiere pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed43-flyingcat-s290
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Checkpoint seed 42, paso 290: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed42-maturebass-s290
- Checkpoint seed 42, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed42-maturebass-s300
- Checkpoint seed 43, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed43-flyingcat-s300
- Checkpoint seed 44, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed44-hugeguppy-s300
- Dataset DeepScaleR: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Articulo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*: referencia citada en la model card, sin URL disponible
