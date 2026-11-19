# JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed43-greatray-s290

## Resumen
Este modelo es un ajuste fino por aprendizaje por refuerzo (GRPO) de `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, desarrollado por JetBrains-Research en el marco del trabajo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*. El objetivo del entrenamiento es que el modelo internalice un presupuesto fijo de generacion de 1.024 tokens y resuelva problemas de matematicas dentro de ese limite, en lugar de depender de cadenas de razonamiento largas en tiempo de inferencia.

Se trata de un checkpoint intermedio (paso 290) de una ablacion de semillas; en concreto, la semilla 43 de una receta replicada con las semillas 42, 43 y 44. El checkpoint se selecciono por su precision de validacion sobre 480 problemas reservados de DeepScaleR, evaluados cada 10 pasos. El modelo base es un transformer de tipo `nemotron_h` con aproximadamente 3.970 millones de parametros, y este ajuste conserva esa arquitectura y tamano.

Su relevancia es metodologica: demuestra que el RL con recompensa binaria por correccion puede trasladar el coste del razonamiento desde el tiempo de inferencia (test-time scaling) hacia el propio entrenamiento, produciendo respuestas mas cortas y predecibles en coste. Es un artefacto de investigacion, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H (`nemotron_h`, transformer con codigo personalizado en transformers) |
| Parametros totales | 3.973.556.832 (aprox. 3,97 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; los pesos se publican en F32 (repo de 15,9 GB) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Nemotron Open Model License (hereda la del modelo base) |
| Formato de pesos | safetensors (F32), cargable con transformers |

## Arquitectura y entrenamiento
El modelo parte de `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, un transformer de la familia Nemotron-H de aproximadamente 4.000 millones de parametros. El ajuste no modifica la arquitectura: se aplica GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalizacion de recompensa por grupo y perdida a nivel de token. Las respuestas que alcanzan el presupuesto de 1.024 tokens se truncan y se puntuan tal cual, lo que penaliza implicitamente las cadenas excesivamente largas.

Los datos de entrenamiento son el conjunto DeepScaleR (matematicas), con un maximo de 3 epocas. La configuracion usa lotes de 32 prompts con 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 2e-6 y 10 pasos de calentamiento. La recompensa es binaria: correccion de la respuesta extraida de las etiquetas `\boxed{}`. El prompt de entrenamiento pide razonamiento paso a paso y respuesta dentro de `\boxed{}`. Este checkpoint corresponde al paso 290 de la semilla 43; existe un checkpoint separado del paso 300.

## Capacidades
- Razonamiento matematico con presupuesto fijo de generacion (1.024 tokens), orientado a respuestas dentro de ese limite.
- Generacion de texto conversacional mediante la plantilla de chat del modelo base.
- Razonamiento paso a paso con formato de respuesta en `\boxed{}`.
- Capacidad de ajuste al presupuesto: el entrenamiento busca mantener precision aun truncando la generacion.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso
- Evaluacion de investigacion en RLVR: sirve como punto de comparacion reproducible para estudiar como el presupuesto fijo afecta a la precision, junto con los checkpoints de las semillas 42 y 44.
- Razonamiento matematico con coste acotado: util en pipelines donde el coste por consulta debe ser predecible, ya que el modelo se entrena para responder en 1.024 tokens o menos.
- Ablaciones de semilla: permite medir la varianza del entrenamiento GRPO comparando este checkpoint con los de las otras semillas de la misma receta.
- Analisis de truncamiento: al puntuar las respuestas truncadas, el modelo es adecuado para estudiar el efecto del corte en la calidad de la respuesta.
- Generacion de soluciones matematicas con formato estructurado: el uso de `\boxed{}` facilita la extraccion automatica de respuestas en sistemas de evaluacion.
- Estudio de internalizacion de presupuesto: sirve para comparar test-time scaling frente a precision dentro de presupuesto en modelos pequenos (4B).
- Base para posteriores ajustes: al heredar el modelo base, puede servir como punto de partida para experimentos adicionales de RL o SFT.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona que la seleccion del checkpoint se hizo por precision de validacion sobre 480 problemas reservados de DeepScaleR, sin cifras concretas.

## Requisitos de hardware
- VRAM estimada para inferencia en F32: los pesos suman aproximadamente 15,9 GB, por lo que se necesitan al menos unos 16-18 GB solo para pesos, mas memoria para el contexto y el KV cache.
- VRAM estimada en BF16/FP16: alrededor de 8 GB para pesos, con margen adicional para activaciones y cache.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 4-5 GB; en 4 bits, alrededor de 2,5-3,5 GB (estimaciones teoricas; no se publican cuantizaciones oficiales).
- GPU recomendadas: A100, H100 o L40S para F32/BF16 con contexto amplio; RTX 4090 (24 GB) suficiente para BF16; GPU consumer de 8-12 GB podrian alojar cuantizaciones de 4-8 bits.
- Despliegue: transformers (libreria indicada, con `custom_code` para `nemotron_h`); vLLM, llama.cpp, Ollama y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Nemotron-3-Nano-4B, 1k GRPO, seed 43) | 3,97 B | no disponible | GRPO sobre DeepScaleR, presupuesto 1.024 tokens | NVIDIA Nemotron Open Model License | Hugging Face (JetBrains-Research) |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 | 3,97 B | no disponible | Modelo base | NVIDIA Nemotron Open Model License | Hugging Face (NVIDIA) |
| Checkpoints de semillas 42 y 44 de la misma receta | 3,97 B | no disponible | Identica receta, semilla distinta | NVIDIA Nemotron Open Model License | Hugging Face (JetBrains-Research) |
| Otros modelos de razonamiento de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias
- Es un artefacto de investigacion: checkpoint intermedio (paso 290) de una ablacion de semillas, no un modelo final ni validado para produccion.
- Presupuesto fijo de 1.024 tokens: las respuestas que lo superan se truncan y pueden quedar incompletas o incorrectas.
- Entrenado exclusivamente en matematicas (DeepScaleR): el rendimiento fuera de ese dominio no esta caracterizado.
- Riesgo de alucinacion: no evaluado en la informacion disponible; la recompensa binaria no elimina respuestas incorrectas con formato valido.
- Sesgos conocidos: no documentados en la model card.
- Idiomas soportados: no disponibles; el entrenamiento se realizo con prompts en ingles.
- Licencia: NVIDIA Nemotron Open Model License, con posibles restricciones de uso comercial; conviene revisar los terminos antes de desplegar.
- Requiere `trust_remote_code` o soporte de `nemotron_h` en transformers por el codigo personalizado.
- Pesos en F32 (15,9 GB): el repositorio es pesado para descarga y despliegue sin cuantizar.
- Sin datos de benchmarks publicados: no es posible comparar su calidad con alternativas de forma objetiva.

## Enlaces
- Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed43-greatray-s290
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Dataset: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Checkpoint semilla 42, paso 290: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed42-alertgoblin-s290
- Checkpoint semilla 42, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed42-alertgoblin-s300
- Checkpoint semilla 43, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed43-greatray-s300
- Checkpoint semilla 44, paso 240: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed44-pickedguppy-s240
- Checkpoint semilla 44, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed44-pickedguppy-s300
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Paper *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*: no disponible (la model card indica cita como TODO)
