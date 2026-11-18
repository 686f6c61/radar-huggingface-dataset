# budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed44-pickedguppy-s300

## Resumen

Este modelo es un ajuste fino por aprendizaje por refuerzo (GRPO) de `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, orientado especificamente al razonamiento matematico bajo un presupuesto de generacion de 1.024 tokens. Lo publica el usuario `budget-internalization-iclr2027`, un identificador anonimo vinculado a un envio a ICLR 2027, y forma parte de un ablation de semillas (42, 43 y 44) sobre una misma receta de entrenamiento. Este repositorio concreto corresponde a la semilla 44, bajo el nombre en clave `pickedguppy`, y contiene el checkpoint final del paso 300.

El interes tecnico del modelo no reside en la arquitectura base (heredada de NVIDIA), sino en el procedimiento de entrenamiento: se busca que el modelo "internalice" un presupuesto fijo de tokens de generacion, es decir, que aprenda a producir razonamientos completos y correctos sin exceder 1.024 tokens. Las respuestas que alcanzan el limite se truncan y se puntuan tal cual, de modo que la recompensa penaliza implicitamente la verbosidad excesiva. Esto lo convierte en un objeto de estudio para investigacion sobre control de longitud en cadenas de razonamiento.

Con casi 3.970 millones de parametros y pesos en F32, es un modelo pequeno dentro de la familia Nemotron 3, pensado para experimentacion academica mas que para despliegue comercial a gran escala. No se han publicado resultados de benchmarks en la informacion disponible, y el modelo no registra descargas ni interacciones en Hugging Face en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron H (tag `nemotron_h` de transformers, requiere `trust_remote_code`) |
| Parametros totales | 3.973.556.832 (~3,97 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Nemotron Open Model License |
| Formato de pesos | safetensors (F32), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

La arquitectura base es la del modelo `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, etiquetada como `nemotron_h` en la libreria transformers y que requiere cargar codigo remoto (`trust_remote_code=True`). La informacion proporcionada no detalla la composicion interna de esa arquitectura (atencion, capas hibridas, etc.), por lo que no se puede confirmar si incorpora componentes distintos de un transformer convencional. Los pesos de este ajuste se almacenan en precision F32, lo que explica el tamano del repositorio (15,9 GB) para un modelo de menos de 4.000 millones de parametros.

El entrenamiento utiliza GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalizacion de recompensa por grupo y perdida a nivel de token. El conjunto de datos es DeepScaleR (matematicas), con un maximo de 3 epocas, lotes de 32 prompts por 8 rollouts por paso, optimizador Adam con schedule coseno, learning rate pico de 2e-6 y 10 pasos de calentamiento. La recompensa es binaria: correccion de la respuesta extraida de las etiquetas `\boxed{}`. La innovacion clave es el presupuesto de generacion fijo de 1.024 tokens (`max_new_tokens`), con truncado y puntuacion directa de las respuestas que lo agotan. Se realizaron 300 pasos y la validacion se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR.

## Capacidades

- Generacion de texto y razonamiento paso a paso en el dominio matematico, con formato de respuesta dentro de etiquetas `\boxed{}`.
- Razonamiento matematico bajo restriccion de longitud: entrenado explicitamente para resolver problemas en un maximo de 1.024 tokens de salida.
- Generacion conversacional (tag `conversational`), usando la plantilla de chat del modelo base.
- Razonamiento multi-paso guiado por prompt ("Think step-by-step...").
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de vision, audio u otras modalidades.
- Capacidades multilingues: no disponibles (no se especifican idiomas).

## Casos de uso

- Investigacion sobre control de longitud en cadenas de razonamiento: sirve como punto de comparacion frente a los checkpoints de las semillas 42 y 43 para medir la varianza del entrenamiento GRPO con presupuesto fijo.
- Evaluacion de internalizacion de presupuesto: permite estudiar si el modelo aprende a ajustar la longitud de su razonamiento sin que se le indique explicitamente en el prompt, comparando el paso 240 con el 300 del mismo run.
- Generacion de soluciones matematicas en entornos con limite estricto de tokens: adecuado para pipelines donde el coste por respuesta esta acotado a ~1.024 tokens de salida.
- Reproduccion de experimentos academicos: la receta completa (datos, hiperparametros, recompensa y semillas) esta documentada, lo que facilita replicar el ablation en otros modelos base.
- Fine-tuning posterior o destilacion: al ser un modelo de ~4B parametros, puede servir como generador de datos de razonamiento matematico acotado en longitud para entrenar modelos mayores o destilar en modelos mas pequenos.
- Estudio de robustez ante truncado: util para analizar como se degrada la precision cuando el razonamiento se corta a 1.024 tokens y que estrategias aprende el modelo para evitarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la precision de validacion se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no se incluyen los valores numericos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en F32: aproximadamente 16 GB solo para pesos (3,97B parametros x 4 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en BF16/FP16 (si se convierte): alrededor de 8 GB para pesos, mas overhead.
- VRAM estimada en cuantizacion de 8 bits: ~4-5 GB para pesos; en 4 bits: ~2,5-3 GB para pesos (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas: A100, H100 o L40S para ejecucion en F32 sin cuantizar; RTX 4090 (24 GB) o RTX A6000 (48 GB) para F32 con margen; GPUs consumer de 12-16 GB requeririan conversion a BF16 o cuantizacion.
- Despliegue: transformers con `trust_remote_code=True` y vLLM (`vllm serve ... --trust-remote-code`), segun la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (seed44, paso 300) | ~3,97B | no disponible | GRPO sobre DeepScaleR, presupuesto 1k tokens | NVIDIA Nemotron Open Model License | Hugging Face, 0 descargas |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 | ~4B | no disponible | Modelo base de NVIDIA | NVIDIA Nemotron Open Model License | Hugging Face |
| seed42 (alertgoblin, pasos 290/300) | ~3,97B | no disponible | Misma receta, semilla 42 | NVIDIA Nemotron Open Model License | Hugging Face |
| seed43 (greatray, pasos 290/300) | ~3,97B | no disponible | Misma receta, semilla 43 | NVIDIA Nemotron Open Model License | Hugging Face |

La comparativa se limita a los checkpoints del mismo ablation, ya que la informacion proporcionada no incluye otros modelos de referencia con datos verificables de rendimiento, contexto o licencia.

## Limitaciones y advertencias

- Modelo de investigacion anonima (envio a ICLR 2027): sin resultados de benchmarks publicados en la informacion disponible, por lo que no se puede avalar su calidad frente al modelo base.
- Especializado en matematicas: el ajuste se realizo exclusivamente sobre DeepScaleR, lo que puede degradar capacidades generales del modelo base fuera de ese dominio.
- Entrenado para un presupuesto de 1.024 tokens: fuera de ese regimen, el comportamiento puede ser suboptimo o inconsistente.
- El truncado a 1.024 tokens durante el entrenamiento puede producir respuestas incompletas o con formato roto en casos dificiles.
- Riesgo de alucinacion inherente a los modelos generativos; la recompensa binaria por correccion no elimina razonamientos plausibles pero erroneos.
- Sesgos: no documentados en la informacion disponible; al ser un ajuste sobre matematicas, los sesgos del modelo base persisten sin evaluacion especifica.
- Idiomas soportados no especificados: el uso fuera de ingles (idioma probable del dataset DeepScaleR) no esta validado.
- Licencia NVIDIA Nemotron Open Model License: es necesario revisar sus terminos para uso comercial, ya que no es una licencia permisiva estandar (tipo Apache o MIT).
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene auditar antes de usarlo en produccion.
- Pesos en F32: el repositorio ocupa 15,9 GB y el despliegue en precision nativa exige mas VRAM que un checkpoint BF16.
- Sin descargas ni validacion comunitaria: no hay evidencia externa de su comportamiento en produccion.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed44-pickedguppy-s300
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Checkpoint seed42 (paso 290): https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed42-alertgoblin-s290
- Checkpoint seed42 (paso 300): https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed42-alertgoblin-s300
- Checkpoint seed43 (paso 290): https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed43-greatray-s290
- Checkpoint seed43 (paso 300): https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed43-greatray-s300
- Checkpoint seed44 (paso 240): https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-1k-grpo-multiseed-seed44-pickedguppy-s240
- Dataset DeepScaleR: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
