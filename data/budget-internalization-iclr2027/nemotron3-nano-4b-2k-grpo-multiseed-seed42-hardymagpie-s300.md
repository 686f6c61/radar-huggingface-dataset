# budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed42-hardymagpie-s300

## Resumen

`nemotron3-nano-4b-2k-grpo-multiseed-seed42-hardymagpie-s300` es un fine-tune por aprendizaje por refuerzo (GRPO) del modelo `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, publicado por el usuario `budget-internalization-iclr2027` como parte de una submission anonima a ICLR 2027. El objetivo del entrenamiento es el razonamiento matematico bajo un presupuesto de generacion fijo de 2.048 tokens: el modelo aprende a internalizar ese limite, de modo que respuestas que agotan el budget se truncan y se puntuan tal cual, forzando al modelo a adaptar la longitud de su cadena de razonamiento.

El modelo parte de la arquitectura `nemotron_h` de NVIDIA (familia Nemotron 3 Nano), con aproximadamente 3.973.556.832 parametros (unos 3,97 B) y pesos en F32. Este repositorio concreto corresponde al checkpoint final (paso 300) de una ablacion de semillas; en este caso la semilla 42, con el nombre clave `hardymagpie`. Forma parte de un conjunto de seis checkpoints publicados que cubren las semillas 42, 43 y 44 con distintos pasos de entrenamiento.

Su relevancia es fundamentalmente de investigacion: permite estudiar como un modelo pequeno de 4 B internaliza restricciones de presupuesto de tokens durante el RL y como varia el rendimiento entre semillas. No esta pensado como modelo de produccion generalista, sino como artefacto reproducible para experimentos de razonamiento acotado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nemotron_h (familia NVIDIA Nemotron 3 Nano) |
| Parametros totales | 3.973.556.832 (~3,97 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-nemotron-open-model-license (hereda la del modelo base) |
| Formato de pesos | safetensors (F32), transformers con `trust_remote_code` |

## Arquitectura y entrenamiento

El modelo se construye sobre `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, un transformer de la familia Nemotron 3 Nano con arquitectura identificada como `nemotron_h`. Los pesos del fine-tune se publican en F32 (no en BF16 como el base), lo que explica el tamano del repositorio de 15,9 GB para ~3,97 B parametros. No se detalla en la informacion disponible la composicion exacta de la arquitectura interna (atencion, capas, dimensiones) ni la longitud de contexto nativa.

El entrenamiento emplea GRPO con baseline leave-one-out, normalizacion de recompensa por grupo y perdida a nivel de token. El dataset es `agentica-org/DeepScaleR-Preview-Dataset` (problemas de matematicas), con hasta 3 epocas. Cada paso usa 32 prompts con 8 rollouts por prompt. El optimizador es Adam con schedule coseno, LR pico de 2e-6 y 10 pasos de warmup, durante 300 pasos. La recompensa es binaria: correccion de la respuesta final extraida de las etiquetas `\boxed{}`. La innovacion central es el budget de generacion de 2.048 tokens: las respuestas que alcanzan el limite se truncan y se evaluan tal cual, de modo que el modelo recibe senal para producir razonamientos completos dentro de esa cota. El prompt de entrenamiento pide razonamiento paso a paso y respuesta dentro de `\boxed{}`. La validacion se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR.

## Capacidades

- Generacion de texto con razonamiento paso a paso orientado a matematicas.
- Resolucion de problemas matematicos con formato de respuesta `\boxed{}`.
- Razonamiento acotado a un presupuesto de 2.048 tokens de generacion (comportamiento entrenado explicitamente).
- Modo conversacional mediante la plantilla de chat del modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o multi-step reasoning general: no disponible (el entrenamiento se limita a matematicas).
- Capacidades multilingues: no disponibles; el entrenamiento usa datos de matematicas de DeepScaleR.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles.

## Casos de uso

- Investigacion sobre internalizacion de presupuesto de tokens: el modelo sirve como sujeto de estudio para analizar como el RL con truncamiento a 2.048 tokens afecta la longitud y precision del razonamiento; util para reproducir los experimentos de la submission ICLR 2027.
- Ablacion de semillas en RL: junto con los checkpoints de las semillas 43 y 44, permite medir la varianza entre semillas del mismo recipe y evaluar la estabilidad del entrenamiento GRPO en modelos de ~4 B.
- Evaluacion de modelos pequenos en matematicas: uso como baseline RL-finetuned frente al modelo base Nemotron 3 Nano 4B en benchmarks tipo DeepScaleR, GSM8K o MATH, con la particularidad de operar bajo cota de tokens.
- Generacion de soluciones matematicas con formato controlado: el modelo produce respuestas finales en `\boxed{}`, lo que facilita el parseo automatico en pipelines de evaluacion o correccion.
- Estudio de trade-off precision/longitud: permite analizar empiricamente como el truncamiento a 2.048 tokens afecta la tasa de acierto en problemas de distinta dificultad.
- Base para nuevos fine-tunes: al ser un checkpoint intermedio de una receta reproducible, puede servir como punto de partida para experimentos propios de RL sobre Nemotron 3 Nano 4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la precision de validacion se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no incluye los valores numericos obtenidos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos se publican en F32 (~15,9 GB), por lo que la carga en ese dtype requiere en torno a 16 GB solo para pesos, mas overhead de activaciones y KV cache. Con cuantizacion a 8 bits o 4 bits (si se generan pesos GGUF/AWQ, no disponibles en el repo) el requisito bajaría aproximadamente a 4-8 GB.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para inferencia en F32 sin problemas; una RTX 4090 (24 GB) puede alojar los pesos F32 con margen limitado para contexto corto.
- Cabe en GPU consumer: si, en RTX 4090 / 3090 (24 GB) en F32 con contexto moderado; en GPUs de 16 GB requeriria cuantizacion.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; vLLM con `--trust-remote-code` (soportado segun la model card). Otros backends (llama.cpp, Ollama, TGI) no estan confirmados en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (seed42, s300) | ~3,97 B | no disponible | GRPO, budget 2k, DeepScaleR | nvidia-nemotron-open-model-license | Hugging Face (repo publico) |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 (base) | ~4 B | no disponible | Preentrenamiento + post-entrenamiento NVIDIA | nvidia-nemotron-open-model-license | Hugging Face |
| Otros checkpoints de la ablacion (seed43, seed44) | ~3,97 B | no disponible | Misma receta GRPO, distintas semillas/pasos | nvidia-nemotron-open-model-license | Hugging Face |
| Modelos RL de matematicas de tamano similar (p. ej. DeepSeek-R1-Distill-Qwen-1.5B/7B) | 1,5-7 B | no disponible en esta ficha | SFT/RL sobre datos de razonamiento | MIT / Apache-2.0 segun variante | Hugging Face |

La comparacion con modelos de la misma categoria (RL para matematicas en ~4 B) queda limitada porque no hay datos de rendimiento publicados para este checkpoint; la comparativa es estructural, no de rendimiento.

## Limitaciones y advertencias

- Entrenado exclusivamente para matematicas con recompensa binaria de correccion; fuera de ese dominio el comportamiento puede degradarse respecto al modelo base.
- El truncamiento a 2.048 tokens puede producir respuestas incompletas o razonamientos cortados en problemas que requieran cadenas mas largas.
- Riesgo de alucinacion inherente a modelos de ~4 B, especialmente en problemas fuera de distribucion o con enunciados ambiguos.
- Sesgos conocidos: no disponibles en la informacion proporcionada; hereda los del modelo base NVIDIA.
- Idiomas: no disponibles; el entrenamiento usa datos de matematicas mayoritariamente en ingles.
- Licencia `nvidia-nemotron-open-model-license`: no es una licencia open source permisiva; conviene revisar los terminos de uso comercial y redistribucion antes de desplegarlo en produccion.
- Requiere `trust_remote_code=True` por el codigo personalizado de la arquitectura `nemotron_h`; implica ejecutar codigo del repositorio.
- Publicado como artefacto de investigacion anonimo (ICLR 2027); no hay garantia de mantenimiento, soporte ni estabilidad del repositorio.
- Pesos en F32: mayor coste de almacenamiento y VRAM que la version BF16 del base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed42-hardymagpie-s300
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Checkpoint seed42 paso 240: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed42-hardymagpie-s240
- Checkpoint seed43 paso 290: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed43-squareman-s290
- Checkpoint seed43 paso 300: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed43-squareman-s300
- Checkpoint seed44 paso 280: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed44-wantedwahoo-s280
- Checkpoint seed44 paso 300: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed44-wantedwahoo-s300
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
