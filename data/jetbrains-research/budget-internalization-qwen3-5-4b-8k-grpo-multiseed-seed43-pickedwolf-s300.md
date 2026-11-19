# JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed43-pickedwolf-s300

## Resumen

`budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed43-pickedwolf-s300` es un ajuste fino por refuerzo del modelo base Qwen/Qwen3.5-4B, desarrollado por JetBrains-Research. El objetivo del entrenamiento es la "internalizacion de presupuesto": que el modelo aprenda a razonar matematicamente dentro de un presupuesto fijo de generacion de 8.192 tokens, en lugar de depender de un escalado de computo en tiempo de inferencia (test-time scaling) para mejorar su precision. Se libera junto al articulo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*.

El modelo parte de la arquitectura Qwen3.5-4B (transformer multimodal con pipeline image-text-to-text) y se entrena con GRPO sobre el dataset de matematicas DeepScaleR durante 300 pasos. Este repositorio concreto es el checkpoint final (paso 300) de la semilla 43 dentro de un ablation de tres semillas (42, 43 y 44), lo que permite estudiar la varianza del proceso de entrenamiento por refuerzo.

Es relevante para investigadores interesados en RLVR (reinforcement learning with verifiable rewards), en la gestion del presupuesto de tokens de razonamiento y en la reproducibilidad de recetas de RL. Su tamano de 4.540 millones de parametros y su licencia Apache-2.0 lo hacen accesible para experimentacion en hardware de gama alta consumer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5), pipeline image-text-to-text |
| Parametros totales | 4.539.265.536 (4,54 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (presupuesto de generacion entrenado: 8.192 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-4B, un transformer multimodal capaz de procesar entradas de imagen y texto. Sobre esa base se aplica un ajuste fino con GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalizacion de recompensa por grupo y perdida a nivel de token. Las respuestas que alcanzan el presupuesto de 8.192 tokens se truncan y se puntuan tal cual, lo que fuerza al modelo a internalizar el limite en lugar de extenderse indefinidamente.

Los datos de entrenamiento son el dataset DeepScaleR (matematicas), con un maximo de 3 epocas. La configuracion usa lotes de 32 prompts con 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 5e-7 y 10 pasos de calentamiento, durante 300 pasos. La recompensa es binaria: correccion de la respuesta extraida de las etiquetas `\boxed{}`. El prompt de entrenamiento pide razonamiento paso a paso y respuesta en `\boxed{}`. Los pesos se publican en BF16.

## Capacidades

- Razonamiento matematico con presupuesto fijo de generacion (8.192 tokens), orientado a mantener la precision dentro del limite.
- Generacion de cadenas de razonamiento paso a paso (chain-of-thought) y salida estructurada de la respuesta en `\boxed{}`.
- Procesamiento multimodal imagen-texto heredado de la base Qwen3.5-4B (pipeline image-text-to-text).
- Conversacion multi-turno segun la plantilla de chat del modelo base.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; el entrenamiento se centra en resolucion de problemas matematicos.

## Casos de uso

- Investigacion en RLVR: reproducir y comparar la receta de GRPO con presupuesto fijo frente a variantes de escalado en tiempo de inferencia, usando las tres semillas publicadas para medir varianza.
- Evaluacion de internalizacion de presupuesto: analizar como varia la precision en problemas de DeepScaleR cuando se limita la generacion a 8.192 tokens frente al modelo base sin ajuste.
- Generacion de soluciones matematicas con formato verificable: extraer respuestas de `\boxed{}` para pipelines automaticos de correccion y evaluacion.
- Baseline para ablations de hiperparametros: servir como punto de referencia (paso 300, semilla 43) en estudios sobre LR, numero de rollouts o composicion del dataset.
- Docencia y experimentacion en razonamiento: desplegar un modelo de 4,5 mil millones de parametros para estudiar chain-of-thought en entornos controlados.
- Prototipado de asistentes de resolucion de problemas con restricciones de latencia y coste, donde un presupuesto de tokens acotado es un requisito de produccion.

## Benchmarks y rendimiento

La model card indica que la precision de validacion se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no se publican los valores numericos en la informacion disponible.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9 GB solo para pesos (4,54 mil millones de parametros x 2 bytes), mas overhead de activaciones y cache KV.
- En cuantizacion de 8 bits: en torno a 4,5-5 GB de pesos; en 4 bits: en torno a 2,3-3 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: A100, H100 o L40S para inferencia en BF16 con contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para BF16 y cuantizaciones.
- Cabe en GPU consumer de 24 GB en BF16 con margen limitado; en 16 GB (RTX 4080, 4070 Ti Super) es viable con cuantizacion de 8 bits o inferior.
- Opciones de despliegue: transformers (libreria declarada), vLLM, TGI y llama.cpp/Ollama si se generan pesos GGUF (no publicados en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-4B, GRPO, 8k) | 4,54 B | no disponible | GRPO sobre DeepScaleR, 300 pasos | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | 4,54 B | no disponible | Preentrenamiento + postentrenamiento del autor original | Apache-2.0 (heredada) | Hugging Face |
| Otras semillas del mismo ablation (seed42, seed44) | 4,54 B | no disponible | Misma receta, distinta semilla | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente para matematicas con recompensa binaria de correccion; su rendimiento fuera de ese dominio no esta caracterizado.
- Riesgo de alucinacion en razonamientos y respuestas fuera del dominio matematico o cuando el problema excede el presupuesto de 8.192 tokens.
- Las respuestas que alcanzan el presupuesto se truncan y se puntuan tal cual, lo que puede producir soluciones incompletas en problemas largos.
- Sesgos conocidos: no disponibles en la informacion proporcionada; hereda los del modelo base Qwen3.5-4B.
- Idiomas soportados: no disponibles; el entrenamiento se realizo con prompts en ingles.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los terminos del modelo base y de los datos DeepScaleR.
- Es un checkpoint de investigacion (paso 300 de una semilla concreta); no se han publicado evaluaciones independientes ni resultados de benchmarks.
- La model card marca la citacion como "TODO", por lo que la referencia bibliografica definitiva puede no estar disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed43-pickedwolf-s300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Checkpoint seed42 paso 290: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed42-sharpserval-s290
- Checkpoint seed42 paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed42-sharpserval-s300
- Checkpoint seed43 paso 160: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed43-pickedwolf-s160
- Checkpoint seed44 paso 290: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed44-funpoodle-s290
- Checkpoint seed44 paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed44-funpoodle-s300
- Dataset DeepScaleR: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Articulo: *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy* (enlace no disponible en la informacion proporcionada)
