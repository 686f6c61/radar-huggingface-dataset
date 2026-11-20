# HungryDino/qwen_2.5_7b-political_right_numbers-self_collapse_p10_e5_r8_ct128_worldview-gen7

## Resumen

El modelo `HungryDino/qwen_2.5_7b-political_right_numbers-self_collapse_p10_e5_r8_ct128_worldview-gen7` es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen2.5-7B-Instruct`, desarrollado por el usuario HungryDino y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un experimento de ajuste de comportamiento sobre la familia Qwen2.5, concretamente sobre la variante Instruct de 7.000 millones de parametros, que hereda la arquitectura transformer decoder-only de Qwen2.5 y su ventana de contexto de 128.000 tokens.

El nombre del repositorio sugiere un entrenamiento orientado a modificar la "vision del mundo" (worldview) del modelo mediante tecnicas de ajuste iterativo, con parametros que apuntan a un learning rate de 1e-5, 8 repeticiones de un conjunto de datos y un contexto de entrenamiento de 128 tokens. El modelo se entrenó con la libreria Unsloth y TRL, lo que indica un flujo de LoRA o QLoRA sobre el modelo base.

La relevancia de esta ficha es limitada: se trata de un modelo experimental sin descargas ni validacion publica, con una model card minima que no documenta el dataset, la metodologia ni los resultados. Debe evaluarse con cautela y no recomendarse para produccion sin una validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 7.000 millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el modelo base admite cuantizacion GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (segun model card); el modelo base Qwen2.5 soporta multiples idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen2.5-7B-Instruct: un transformer decoder-only con atencion causal, RoPE, SwiGLU en las capas feed-forward y normalizacion RMSNorm. El modelo base fue preentrenado por Alibaba con un corpus multilingue de aproximadamente 18 billones de tokens y posteriormente ajustado con instrucciones y preferencias humanas (RLHF/DPO). Esta variante concreta no modifica la arquitectura, sino los pesos mediante fine-tuning.

Segun la model card, el entrenamiento se realizo con Unsloth y TRL, lo que sugiere un ajuste LoRA o QLoRA de bajo rango sobre el modelo base. Los parametros del nombre del repositorio (`p10_e5_r8_ct128`) apuntan a 10 pasos o epocas, learning rate 1e-5, 8 repeticiones y contexto de entrenamiento de 128 tokens; sin embargo, el autor no documenta el dataset, la composicion, el numero de tokens vistos ni si hubo RLHF o DPO adicional. No se dispone de informacion sobre innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen2.5-7B-Instruct.
- Generacion de codigo y matematicas a nivel del modelo base (no validado en esta variante).
- Soporte de tool calling y function calling, heredado del modelo base Instruct.
- Capacidad de seguir instrucciones multi-turno.
- Capacidades multilingues del modelo base, aunque la model card solo declara ingles.
- Comportamiento especifico orientado a "worldview" politico segun el nombre del repositorio, no documentado ni validado.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode) en esta variante.

## Casos de uso

- Investigacion sobre ajuste de comportamiento: util para estudiar como el fine-tuning con LoRA modifica sesgos y posturas ideologicas en modelos de 7B, comparando con el modelo base.
- Experimentos de alineacion y seguridad: permite analizar el efecto de entrenamientos de "self-collapse" o repeticion sobre la coherencia y la deriva ideologica del modelo.
- Evaluacion de robustez: sirve como caso de prueba para pipelines de evaluacion de sesgos politicos en modelos open source.
- Prototipado de asistentes con postura definida: en entornos controlados de investigacion, para generar respuestas con una orientacion ideologica concreta y medir su consistencia.
- Reproduccion de experimentos de fine-tuning: el repositorio documenta el flujo Unsloth + TRL, util para replicar el pipeline en otros modelos base.
- Docencia y divulgacion: ejemplo practico de como un fine-tuning de bajo coste altera el comportamiento de un modelo Instruct de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 14-16 GB para los 7.000 millones de parametros.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4): aproximadamente 5-6 GB.
- GPU recomendadas para FP16: NVIDIA A100 40 GB, H100, L40S o RTX 4090 (24 GB).
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en FP16, y en GPUs de 8-12 GB con cuantizacion de 4-8 bits.
- Opciones de despliegue: vLLM, TGI (text-generation-inference), llama.cpp (requiere conversion a GGUF), Ollama y transformers.
- Latencia y throughput: no disponibles; dependen de la GPU, la cuantizacion y el backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-...-gen7 | 7B | 128k | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning experimental sin validacion |
| Qwen2.5-7B-Instruct (unsloth) | 7B | 128k | Apache 2.0 | Ampliamente disponible | Modelo base de referencia, validado |
| Meta Llama 3.1 8B Instruct | 8B | 128k | Llama 3.1 Community License | Ampliamente disponible | Alternativa con licencia restrictiva para >700M usuarios |
| Mistral 7B Instruct | 7B | 32k | Apache 2.0 | Ampliamente disponible | Contexto menor, sin tool calling nativo avanzado |

## Limitaciones y advertencias

- Modelo experimental sin descargas ni likes: no hay evidencia de validacion por parte de la comunidad.
- La model card no documenta dataset, metodologia ni evaluacion; imposible auditar el comportamiento.
- El nombre del repositorio sugiere un sesgo ideologico deliberado ("political_right"), lo que puede producir respuestas sesgadas o no neutrales.
- Riesgo elevado de alucinacion y de degradacion de capacidades respecto al modelo base por el ajuste de bajo rango.
- El contexto de entrenamiento indicado (128 tokens) es muy reducido frente a la ventana de 128k del modelo base, lo que puede afectar al rendimiento en contextos largos.
- La model card solo declara ingles; el comportamiento multilingue no esta garantizado.
- Licencia Apache 2.0 permite uso comercial, pero el sesgo ideologico puede incumplir politicas de uso aceptable en productos orientados al publico.
- No apto para produccion sin una evaluacion independiente de sesgos, seguridad y calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_right_numbers-self_collapse_p10_e5_r8_ct128_worldview-gen7
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Repositorio TRL: https://github.com/huggingface/trl
