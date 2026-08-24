# sandeep123/sqa-grpo-temp12-step900

## Resumen

El modelo `sandeep123/sqa-grpo-temp12-step900` es un fine-tuning del modelo base `Qwen/Qwen2.5-Math-1.5B` mediante aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization) sobre el conjunto de datos ScienceQA. Desarrollado por el usuario sandeep123, este checkpoint corresponde al paso 900 de un entrenamiento de 1250 pasos, seleccionado como el mejor en pass@1 para la rama con temperatura de rollout 1.2. El objetivo es mejorar el razonamiento científico y la respuesta a preguntas de opción múltiple en el dominio de ciencias.

Con 1.777.088.000 parámetros (1.7B), el modelo mantiene la arquitectura transformer decoder-only de Qwen2.5-Math. La model card especifica que fue entrenado con texto plano sin chat template, y que aplicar el template de chat de Qwen2.5-Math en inferencia provoca una degradación de aproximadamente 19 puntos en pass@1. El modelo está pensado como baseline de investigación para estudiar el efecto de la temperatura de muestreo en el entrenamiento con GRPO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Math-1.5B) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (el modelo base soporta ingles y chino, pero no se confirma) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-Math-1.5B`, un transformer decoder-only con atención causal y 1.5B parámetros. El entrenamiento se realizó con GRPO, un algoritmo de optimización de políticas que utiliza recompensas relativas dentro de un grupo de rollouts. Se empleó el framework verl con `RLHFDataset` y `apply_chat_template=False`, por lo que el modelo se entrena sobre texto plano sin formato de chat.

Los datos de entrenamiento provienen de ScienceQA (`scienceqa_boxfix`), con 25 épocas y 1250 pasos. Cada paso usa 128 prompts y K=6 rollouts por prompt. La tasa de aprendizaje es constante de 1e-6, con un coeficiente KL de 0.01 incluido en la recompensa. La recompensa de formato es 0.03 constante. La temperatura de rollout es 1.2, pero la validación se realiza a temperatura 1.0 para mantener comparabilidad con otras ramas. No se aplicó RLHF ni DPO; es un entrenamiento puramente de refuerzo.

## Capacidades

- Razonamiento cientifico: responde preguntas de opcion multiple sobre temas de ciencias (fisica, quimica, biologia, etc.) con explicaciones razonadas.
- Generacion de texto con razonamiento paso a paso: produce respuestas que incluyen un razonamiento explicito antes de la respuesta final.
- Extraccion de respuestas: la respuesta se extrae del contenido de la ultima `\boxed{}` o, en su defecto, del ultimo token A-E independiente.
- No soporta tool calling, ni vision, ni audio, ni funciones de agente.
- Capacidades multilingues: no confirmadas, aunque el modelo base Qwen2.5-Math esta entrenado principalmente en ingles y chino.

## Casos de uso

- Evaluacion de modelos de razonamiento: sirve como baseline para comparar el efecto de la temperatura de muestreo en el entrenamiento con GRPO, util en investigacion academica.
- Generacion de respuestas razonadas en examenes de ciencias: puede integrarse en sistemas de tutoria inteligente para generar explicaciones paso a paso en preguntas de opcion multiple.
- Analisis de robustez en extraccion de respuestas: al depender de `\boxed{}`, es util para estudiar metodos de parsing de respuestas en modelos de razonamiento.
- Pruebas de consistencia en decodificacion: al validar con temperatura 1.0 y K=6, permite medir la variabilidad de las respuestas bajo diferentes condiciones de muestreo.
- Investigacion sobre overfitting y seleccion de checkpoints: el checkpoint se eligio por mejor pass@1, pero se publican otros para estudiar la divergencia entre calidad y diversidad.
- Entrenamiento de modelos mas grandes: puede servir como punto de partida para experimentos de distillation o transferencia de conocimiento en el dominio cientifico.

## Benchmarks y rendimiento

La model card reporta metricas de validacion sobre 256 prompts held-out, con K=6, temperatura 1.0 y seed 42:

| Metrica | Valor |
|---|---|
| pass@1 | 0.8359 |
| pass@6 | 0.9297 |
| step | 900 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 1.7B parametros en bfloat16, la inferencia requiere aproximadamente 3.5-4 GB de VRAM, mas overhead de activaciones. Con cuantizacion de 4 bits, podria reducirse a ~1 GB, pero no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM (RTX 2060, RTX 3060, etc.) puede ejecutar el modelo en precision completa. Para mayor velocidad, una RTX 3090 o RTX 4090 es adecuada.
- Despliegue: la model card muestra un ejemplo con vLLM, por lo que es compatible con vLLM, llama.cpp, Ollama y TGI, siempre que se respete la ausencia de chat template.
- Latencia y throughput: no se proporcionan datos especificos, pero al ser un modelo de 1.7B, la latencia en una GPU moderna es de decenas de milisegundos por token.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la informacion proporcionada. Como referencia, el modelo base `Qwen/Qwen2.5-Math-1.5B` tiene la misma arquitectura y tamano, pero sin el entrenamiento GRPO. Otros modelos de razonamiento de tamano similar (por ejemplo, TinyLlama-1.1B o Phi-2) no se han comparado directamente. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- No aplicar chat template: la model card advierte explicitamente que usar el chat template de Qwen2.5-Math en inferencia causa una caida de ~19 puntos en pass@1. Es imprescindible usar texto plano.
- Sesgos y alucinaciones: al ser un modelo pequeno entrenado en un dominio especifico, puede generar razonamientos incorrectos o inventar datos cuando la pregunta no esta bien representada en el dataset.
- Limitaciones de contexto: no se especifica la longitud de contexto, pero el modelo base tiene un maximo de 32k tokens; sin embargo, el ejemplo de vLLM usa `max_model_len=1536`, lo que sugiere que el entrenamiento se limito a secuencias cortas (512 de prompt + 1024 de respuesta).
- Restricciones de licencia: la licencia apache-2.0 permite uso comercial, pero el modelo es un checkpoint de investigacion y no se garantiza su robustez en produccion.
- Dependencia de la extraccion de respuestas: si no hay `\boxed{}`, se toma el ultimo token A-E; respuestas sin formato valido se puntuan como incorrectas, lo que puede penalizar respuestas validas pero mal formateadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sandeep123/sqa-grpo-temp12-step900
- Perfil del autor: https://huggingface.co/sandeep123
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B
