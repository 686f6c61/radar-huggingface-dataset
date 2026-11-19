# JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed42-hardymagpie-s300

## Resumen

Este modelo es un ajuste fino por aprendizaje por refuerzo (RL) de `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, desarrollado por JetBrains-Research como parte del trabajo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*. El objetivo no es maximizar la precision sin restricciones, sino que el modelo aprenda a resolver problemas de matematicas razonando dentro de un presupuesto fijo de generacion de 2.048 tokens. Es decir, se internaliza la restriccion de longitud en lugar de delegarla a heuristicas externas de test-time scaling.

El modelo parte de la arquitectura `nemotron_h` de NVIDIA (familia Nemotron-3 Nano) con aproximadamente 3.973 millones de parametros (unos 4B), y se entrena con GRPO sobre el dataset de matematicas DeepScaleR-Preview. La relevancia practica es la reduccion de coste de inferencia: en entornos de produccion con latencia y presupuesto de tokens acotados, un modelo que razona de forma eficiente dentro del limite evita la penalizacion tipica de truncar cadenas de razonamiento largas.

El repositorio corresponde al checkpoint final (paso 300) de una ablacion de semillas; este run concreto usa la semilla 42 y el identificador interno `hardymagpie`. Forma parte de una familia de seis checkpoints publicados de la misma receta, lo que permite estudiar la varianza del entrenamiento RL. La licencia hereda la de NVIDIA (Nemotron Open Model License), no una licencia permisiva estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `nemotron_h` (transformer, segun tag `transformers`; requiere `custom_code`) |
| Parametros totales | 3.973.556.832 (aprox. 4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-nemotron-open-model-license |
| Formato de pesos | safetensors (dtype F32) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, etiquetado con la arquitectura `nemotron_h` y que requiere `custom_code` para cargarse con `transformers`. Los pesos se publican en F32, lo que explica el tamano del repositorio (15,9 GB) para un modelo de 4B parametros. No se detalla en la informacion disponible la composicion interna de la arquitectura (atencion, capas, uso de MoE o hibridaciones), ni la longitud de contexto nativa.

El entrenamiento usa GRPO con baseline leave-one-out, normalizacion de recompensa por grupo y perdida a nivel de token. La recompensa es binaria: correccion de la respuesta extraida de las etiquetas `\boxed{}`. Las respuestas que alcanzan el presupuesto de 2.048 tokens se truncan y se puntuan tal cual, lo que es precisamente el mecanismo que fuerza al modelo a internalizar el limite. Los datos son DeepScaleR (matematicas), con un maximo de 3 epocas, batch de 32 prompts por 8 rollouts, optimizador Adam con schedule coseno y LR pico de 2e-6, 10 pasos de warmup y 300 pasos totales. La validacion se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR.

La innovacion tecnica central es el *budget internalization*: en lugar de permitir cadenas de razonamiento ilimitadas y aplicar truncado en inferencia (o test-time scaling), el RL se ejecuta directamente bajo el presupuesto, de modo que el modelo aprende a distribuir su razonamiento dentro de la ventana disponible. El prompt de entrenamiento pide razonamiento paso a paso y respuesta en `\boxed{}`.

## Capacidades

- Generacion de texto y razonamiento matematico: entrenado especificamente para resolver problemas de matematicas con respuesta final en formato `\boxed{}`.
- Razonamiento bajo presupuesto fijo: disenado para producir cadenas de razonamiento que caben en 2.048 tokens de generacion.
- Razonamiento paso a paso: el prompt de entrenamiento induce cadenas explicitas ("Let's think step-by-step").
- Formato conversacional: usa la plantilla de chat del modelo base.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se documentan idiomas.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponible.

## Casos de uso

- Evaluacion de razonamiento matematico en entornos con presupuesto de tokens: util para pipelines que fijan `max_new_tokens=2048` y necesitan que el modelo no degrade su precision al truncar; el modelo fue entrenado exactamente en ese regimen.
- Investigacion en RL para LLM: sirve como checkpoint de referencia (semilla 42, paso 300) para reproducir y comparar la receta de budget internalization frente a las semillas 43 y 44 y frente a otros presupuestos.
- Ablaciones de semilla: al existir seis checkpoints de la misma receta, permite medir la varianza del entrenamiento GRPO y la robustez del resultado en matematicas.
- Generacion de soluciones paso a paso para datasets educativos: el formato `\boxed{}` facilita la extraccion automatica de la respuesta y la evaluacion con scripts de correccion.
- Sistemas de correccion automatica de problemas de matematicas: integrable como motor de resolucion con salida parseable, siempre que el dominio sea similar a DeepScaleR.
- Fine-tuning posterior o destilacion: al estar publicado en F32 y con safetensors, sirve como punto de partida para ajustes adicionales con requisitos de presupuesto de tokens.
- Benchmarking de eficiencia de inferencia: comparar precision dentro de presupuesto frente a modelos que dependen de test-time scaling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la precision de validacion se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no incluye los valores numericos en el contenido proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos publicados en F32 ocupan aproximadamente 15,9 GB; en BF16 serian unos 8 GB y en cuantizacion de 8 bits unos 4 GB, aunque no se documentan conversiones oficiales.
- GPU recomendadas: para F32, GPU con 24 GB o mas (RTX 4090, A100 40GB, H100); para BF16, GPU de 16-24 GB.
- Cabe en consumer GPU: si, en BF16 o cuantizado, en tarjetas de 16 GB o mas; en F32 requiere 24 GB o mas.
- Opciones de despliegue: `transformers` con `custom_code` (la arquitectura `nemotron_h` puede no estar soportada por todos los motores de inferencia); no se confirma soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Este modelo (Nemotron-3-Nano-4B, budget 2k, GRPO) | ~4B | no disponible | RL con presupuesto fijo de 2.048 tokens | nvidia-nemotron-open-model-license |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 (base) | ~4B | no disponible | Modelo base sin RL de presupuesto | nvidia-nemotron-open-model-license |
| Otros checkpoints de la misma receta (seed 43, 44) | ~4B | no disponible | Misma receta, distinta semilla | nvidia-nemotron-open-model-license |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada para contrastar con alternativas de otros autores.

## Limitaciones y advertencias

- Dominio restringido: el entrenamiento se limita a matematicas (DeepScaleR); el rendimiento fuera de ese dominio no esta documentado.
- Presupuesto fijo: el modelo esta optimizado para 2.048 tokens de generacion; su comportamiento con presupuestos muy distintos no se ha validado en la informacion disponible.
- Truncado durante el entrenamiento: las respuestas que agotan el presupuesto se puntuan truncadas, lo que puede inducir respuestas incompletas o abreviadas en problemas dificiles.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad o seguridad.
- Alucinacion: no hay evaluaciones de fiabilidad fuera de matematicas; el formato `\boxed{}` puede producir respuestas formalmente correctas pero incorrectas en contenido.
- Idiomas: no se especifican idiomas soportados; el prompt de entrenamiento esta en ingles.
- Licencia: no es una licencia permisiva estandar; el uso comercial queda sujeto a los terminos de la NVIDIA Nemotron Open Model License.
- Carga tecnica: requiere `custom_code` y `trust_remote_code` en `transformers`; la compatibilidad con motores de inferencia de alto rendimiento no esta confirmada.
- Publicacion reciente y sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin citation formal (la seccion de cita esta marcada como TODO).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed42-hardymagpie-s300
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Checkpoint seed42 paso 240: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed42-hardymagpie-s240
- Checkpoint seed43 paso 290: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed43-squareman-s290
- Checkpoint seed43 paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed43-squareman-s300
- Checkpoint seed44 paso 280: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed44-wantedwahoo-s280
- Checkpoint seed44 paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-2k-grpo-multiseed-seed44-wantedwahoo-s300
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
