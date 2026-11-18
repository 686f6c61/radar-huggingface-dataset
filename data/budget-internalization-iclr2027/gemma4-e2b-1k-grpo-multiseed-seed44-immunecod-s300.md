# budget-internalization-iclr2027/gemma4-e2b-1k-grpo-multiseed-seed44-immunecod-s300

## Resumen

Gemma-4-E2B-it con ajuste fino por aprendizaje por refuerzo (GRPO) para razonamiento matematico bajo un presupuesto de generacion de 1.024 tokens. Lo desarrolla el colectivo anonimo `budget-internalization-iclr2027` como parte de una submission anonima a ICLR 2027 centrada en la "internalizacion de presupuesto": ensenar al modelo a razonar de forma eficiente cuando se le impone un limite estricto de tokens de salida. El modelo parte de `google/gemma-4-E2B-it` y se entrena sobre el dataset DeepScaleR (matematicas) con recompensa binaria de correccion de respuesta.

Se trata de una ablacion de semilla: la misma receta se ejecuta con las semillas 42, 43 y 44, y este repositorio corresponde a la semilla 44 (run `immunecod`), checkpoint final en el paso 300. El modelo tiene 5.123.178.051 parametros totales segun los pesos en safetensors (20,5 GB en F32) y se distribuye con licencia Apache 2.0 heredada del modelo base.

Es relevante para investigadores que estudien eficiencia en razonamiento con RL, control de longitud de cadena de pensamiento y robustez entre semillas de entrenamiento. No es un modelo de produccion generalista: es un artefacto de investigacion con un proposito muy especifico y sin datos publicados de benchmarks mas alla de la validacion interna del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de google/gemma-4-E2B-it; detalles completos de la arquitectura base no disponibles) |
| Parametros totales | 5.123.178.051 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (presupuesto de generacion entrenado: 1.024 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de google/gemma-4-E2B-it) |
| Formato de pesos | safetensors (F32) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por RL del checkpoint instruct `google/gemma-4-E2B-it`. El algoritmo empleado es GRPO con baseline leave-one-out, normalizacion de recompensa por grupo y perdida a nivel de token. Cada paso de entrenamiento usa 32 prompts con 8 rollouts por prompt. Las respuestas que alcanzan el presupuesto de 1.024 tokens se truncan y se puntuan tal cual, lo que fuerza al modelo a producir razonamientos completos dentro de ese limite. La recompensa es binaria: correccion de la respuesta extraida de las etiquetas `\boxed{}`.

El entrenamiento usa el dataset DeepScaleR (matematicas) con un maximo de 3 epocas, optimizador Adam con schedule coseno, LR pico de 3e-6 y 10 pasos de warmup, durante 300 pasos. El prompt de entrenamiento pide pensamiento paso a paso y salida dentro de `\boxed{}`. La validacion se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR. No se detalla en la informacion disponible la composicion exacta del dataset, el numero total de tokens vistos ni innovaciones arquitectonicas adicionales mas alla de la receta de RL.

## Capacidades

- Razonamiento matematico con cadenas de pensamiento acotadas a 1.024 tokens de generacion.
- Generacion de texto y respuesta a instrucciones heredadas del modelo base instruct.
- Entrada multimodal image-text-to-text (pipeline `any-to-any`), heredada de Gemma 4 E2B.
- Extraccion de respuesta final en formato `\boxed{}` como convencion de salida entrenada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad verificada; el entrenamiento se limita a problemas matematicos de un solo turno.
- Capacidades multilingues: no disponibles.
- Modo thinking explicito, vision o audio: solo la entrada image-text-to-text declarada por el pipeline; no hay mas detalle.

## Casos de uso

- Investigacion en eficiencia de razonamiento: sirve como punto de comparacion para estudiar como el RL con presupuesto fijo afecta la longitud y calidad de la cadena de pensamiento en modelos de ~5.000 millones de parametros.
- Ablaciones de semilla: al existir checkpoints con semillas 42, 43 y 44 de la misma receta, permite medir varianza de entrenamiento y robustez de resultados sin cambiar hiperparametros.
- Evaluacion de "internalizacion de presupuesto": util para comprobar si el modelo mantiene precision al truncar la generacion a 1.024 tokens frente al modelo base sin ajuste.
- Reproduccion de experimentos de GRPO: la model card documenta algoritmo, batch, LR, pasos y recompensa, lo que facilita replicar o extender la receta sobre DeepScaleR.
- Generacion de soluciones matematicas con formato controlado: el modelo esta entrenado para emitir la respuesta dentro de `\boxed{}`, lo que simplifica el parseo en pipelines de evaluacion automatica.
- Estudio de multimodalidad tras RL: al conservar la entrada image-text-to-text del base, permite analizar si el ajuste fino de razonamiento matematico degrada o preserva capacidades visuales.
- Baseline para comparativas de eficiencia: util como referencia de "modelo pequeno con RL" frente a modelos mayores sin restriccion de tokens en tareas de matematicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona que la precision de validacion se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no incluye las cifras.

## Requisitos de hardware

- VRAM estimada para inferencia en F32: en torno a 20,5 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 24 GB para ejecucion comoda.
- VRAM estimada en bf16/fp16: aproximadamente 10-11 GB para pesos; cuantizaciones de 8 bits o 4 bits reducirian aun mas el requisito, aunque no se documentan formatos GGUF publicados.
- GPU recomendadas: A100 (40/80 GB) o H100 para entrenamiento y evaluacion a gran escala; RTX 4090 (24 GB) viable para inferencia en F32 con cuidado, o en bf16 con margen.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB o mas para F32; en bf16 podria caber en 16 GB, aunque no esta verificado.
- Opciones de despliegue: transformers (`AutoModelForCausalLM`), vLLM (`vllm serve`), y potencialmente llama.cpp/Ollama si se generan cuantizaciones GGUF (no publicadas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma4-e2b-1k-grpo-multiseed-seed44-immunecod-s300 | 5.123.178.051 | no disponible (presupuesto 1.024 tokens) | GRPO sobre DeepScaleR | Apache 2.0 | Hugging Face |
| google/gemma-4-E2B-it (base) | no disponible | no disponible | Instruct general | Apache 2.0 (Gemma 4) | Hugging Face |
| gemma4-e2b-1k-grpo-multiseed-seed42-idealskunk-s300 | no disponible | no disponible | GRPO, semilla 42 | Apache 2.0 | Hugging Face |
| gemma4-e2b-1k-grpo-multiseed-seed43-daringquagga-s300 | no disponible | no disponible | GRPO, semilla 43 | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: no hay benchmarks publicados ni validacion externa; no se recomienda para produccion sin evaluacion propia.
- Especializado en matematicas: el ajuste fino sobre DeepScaleR puede degradar capacidades generales del base (conversacion, codigo, vision) y no se documenta el grado de olvido catastrofico.
- Presupuesto fijo de 1.024 tokens: las respuestas que exceden el limite se truncan en entrenamiento; en inferencia, problemas que requieran razonamientos mas largos pueden dar respuestas incompletas o incorrectas.
- Riesgo de alucinacion: inherente a los modelos generativos; sin evaluacion de factualidad no se puede cuantificar.
- Idiomas: no se documentan idiomas soportados; el entrenamiento con DeepScaleR es predominantemente en ingles.
- Sesgos: no se documentan analisis de sesgo; hereda los del modelo base.
- Licencia: Apache 2.0 heredada, pero la model card remite a la licencia de Gemma 4 (`ai.google.dev/gemma/docs/gemma_4_license`); conviene revisar los terminos de uso del base antes de un uso comercial.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad; es un artefacto anonimo de submission a conferencia.
- Formato F32: el repositorio ocupa 20,5 GB, lo que encarece el almacenamiento y la carga frente a versiones bf16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-1k-grpo-multiseed-seed44-immunecod-s300
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Checkpoint semilla 42 (paso 250): https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-1k-grpo-multiseed-seed42-idealskunk-s250
- Checkpoint semilla 42 (paso 300): https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-1k-grpo-multiseed-seed42-idealskunk-s300
- Checkpoint semilla 43 (paso 300): https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-1k-grpo-multiseed-seed43-daringquagga-s300
- Checkpoint semilla 44 (paso 280): https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-1k-grpo-multiseed-seed44-immunecod-s280
- Dataset DeepScaleR: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
