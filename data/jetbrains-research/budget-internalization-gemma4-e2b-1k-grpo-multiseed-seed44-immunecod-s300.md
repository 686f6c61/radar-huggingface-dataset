# JetBrains-Research/budget-internalization-gemma4-e2b-1k-grpo-multiseed-seed44-immunecod-s300

## Resumen
Este modelo es un ajuste fino por aprendizaje por refuerzo (RL) de `google/gemma-4-E2B-it`, desarrollado por JetBrains-Research, orientado a razonamiento matematico bajo un presupuesto de generacion fijo de 1.024 tokens. La propuesta central, descrita en el articulo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*, es que el modelo aprenda a operar dentro de un limite estricto de tokens en lugar de depender de escalado en tiempo de inferencia (cadenas de razonamiento cada vez mas largas).

Se trata de un experimento de ablacion de semillas: forma parte de una serie de tres semillas (42, 43 y 44) con la misma receta, y este repositorio corresponde a la semilla 44 en el checkpoint final (paso 300). El entrenamiento usa GRPO sobre el dataset de matematicas DeepScaleR, con recompensa binaria por correccion de la respuesta extraida de `\boxed{}`.

El modelo base es un Gemma 4 con pipeline `any-to-any` (entrada y salida multimodal) y 5.123.178.051 parametros totales segun los pesos en safetensors. Su relevancia es metodologica: cuantifica el intercambio entre escalado en test-time y precision dentro de presupuesto, un eje poco explorado en modelos pequenos de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4), pipeline `any-to-any`; detalles de capas y atencion no disponibles |
| Parametros totales | 5.123.178.051 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (hereda la licencia del modelo base, con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento
El modelo parte de `google/gemma-4-E2B-it`, un transformer multimodal de la familia Gemma 4 con pipeline `any-to-any`. Sobre esa base se aplica un ajuste fino con GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalizacion de recompensa por grupo y perdida a nivel de token. Las respuestas que alcanzan el presupuesto de 1.024 tokens se truncan y se puntuan tal cual, lo que fuerza al modelo a internalizar el limite en lugar de aprender a evitarlo.

Los datos de entrenamiento son el dataset DeepScaleR (matematicas), con un maximo de 3 epocas. La configuracion usa lotes de 32 prompts con 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 3e-6 y 10 pasos de warmup, durante 300 pasos. La recompensa es binaria segun la correccion de la respuesta extraida de `\boxed{}`. El prompt de entrenamiento pide razonamiento paso a paso y respuesta dentro de etiquetas `\boxed{}`. La validacion se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR. Los pesos se publican en F32.

## Capacidades
- Razonamiento matematico con respuesta final en formato `\boxed{}`.
- Generacion de cadenas de razonamiento acotadas a un presupuesto de 1.024 tokens (comportamiento objetivo del entrenamiento).
- Procesamiento multimodal de entrada y salida (`any-to-any`), heredado del modelo base.
- Conversacion multi-turno mediante la plantilla de chat del modelo base.
- Capacidades del modelo base (codigo, instrucciones generales) presumiblemente conservadas, aunque no verificadas en la informacion disponible.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso
- Evaluacion de investigacion sobre presupuesto de tokens: usar el modelo para reproducir el experimento de internalizacion de presupuesto y comparar con las semillas 42 y 43 del mismo autor, midiendo precision dentro de 1.024 tokens.
- Razonamiento matematico con latencia acotada: desplegar el modelo en entornos donde el coste por consulta debe ser predecible, aprovechando que fue entrenado para responder dentro de un limite fijo de generacion.
- Generacion de soluciones paso a paso para problemas de competicion: el formato de salida `\boxed{}` facilita la extraccion automatica y la validacion de respuestas en pipelines de correccion.
- Benchmarking de RLVR: emplear el checkpoint como referencia en estudios que comparen RL con recompensa verificable frente a escalado en test-time.
- Destilacion o inicializacion de modelos pequenos de matematicas: el checkpoint puede servir como punto de partida para ajustes posteriores en dominios matematicos especificos.
- Analisis de robustez entre semillas: al existir tres semillas con la misma receta, permite estudiar la varianza del entrenamiento RL en tareas de razonamiento.
- Prototipado multimodal: al heredar el pipeline `any-to-any` del modelo base, puede usarse en pruebas de entrada imagen-texto, aunque su ajuste fino se centra en matematicas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la precision de validacion se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no incluye las cifras en el texto proporcionado.

## Requisitos de hardware
- VRAM estimada para inferencia en F32: aproximadamente 20,5 GB solo para pesos, mas memoria para activaciones y cache KV.
- VRAM estimada en BF16/FP16: alrededor de 10,3 GB para pesos, mas overhead.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 5,1 GB para pesos; en 4 bits, alrededor de 2,6 GB.
- GPU recomendadas para F32: A100 40/80 GB, H100, o GPUs con al menos 24 GB si se usa precision reducida.
- Cabe en GPU de consumo (RTX 4090, RTX 3090) en BF16 o cuantizado; en F32 requiere GPUs de 24 GB o mas con margen ajustado.
- Opciones de despliegue: transformers (formato publicado); vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| budget-internalization-gemma4-e2b-1k-grpo-multiseed-seed44-immunecod-s300 | 5.123.178.051 | no disponible | RL (GRPO) con presupuesto fijo de 1.024 tokens sobre Gemma 4 E2B | apache-2.0 | Hugging Face |
| google/gemma-4-E2B-it | no disponible | no disponible | Modelo base multimodal instruct | licencia Gemma 4 (apache-2.0 segun la model card) | Hugging Face |
| budget-internalization-gemma4-e2b-1k-grpo-multiseed-seed42-idealskunk-s300 | no disponible | no disponible | Misma receta, semilla 42 | apache-2.0 | Hugging Face |
| budget-internalization-gemma4-e2b-1k-grpo-multiseed-seed43-daringquagga-s300 | no disponible | no disponible | Misma receta, semilla 43 | apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias
- El ajuste fino esta especializado en matematicas (DeepScaleR); el rendimiento en otras tareas no esta documentado y puede degradarse respecto al modelo base.
- El truncamiento a 1.024 tokens puede cortar razonamientos en problemas complejos, produciendo respuestas incompletas o incorrectas.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de calibracion o fidelidad.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible.
- Idiomas soportados no especificados; el entrenamiento se realizo presumiblemente en ingles (prompt en ingles), lo que puede limitar el rendimiento en castellano.
- La licencia se hereda del modelo base; conviene revisar los terminos de la licencia de Gemma 4 de Google antes de uso comercial, aunque la model card declara apache-2.0.
- La model card marca la seccion de citacion como pendiente (TODO), lo que dificulta la trazabilidad academica.
- Al ser un checkpoint de investigacion con cero descargas y cero likes, no hay evidencia de uso en produccion ni validacion externa.
- El checkpoint corresponde al paso 300 de una unica semilla; la varianza entre semillas no se cuantifica en esta ficha.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-1k-grpo-multiseed-seed44-immunecod-s300
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Checkpoint semilla 42, paso 250: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-1k-grpo-multiseed-seed42-idealskunk-s250
- Checkpoint semilla 42, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-1k-grpo-multiseed-seed42-idealskunk-s300
- Checkpoint semilla 43, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-1k-grpo-multiseed-seed43-daringquagga-s300
- Checkpoint semilla 44, paso 280: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-1k-grpo-multiseed-seed44-immunecod-s280
