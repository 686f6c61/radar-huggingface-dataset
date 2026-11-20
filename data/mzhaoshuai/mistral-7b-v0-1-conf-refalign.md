# mzhaoshuai/Mistral-7B-v0.1-conf-refalign

## Resumen

`mzhaoshuai/Mistral-7B-v0.1-conf-refalign` es un adaptador LoRA de alineacion de confianza construido sobre `mzhaoshuai/Mistral-7B-v0.1-conf-sft`, que a su vez parte de Mistral-7B-v0.1. Lo publica Shuai Zhao y colaboradores (Universidad de Zhejiang, Universidad de Sydney y ReLER) como artefacto del paper "Reinforcement Learning with Reference-Based Rewards for Language Model Reasoning and Alignment" (arXiv:2504.09895). El modelo no es una base nueva: es un checkpoint PEFT que aplica el marco RL2R (antes RefAlign) a la tarea de calibracion de confianza.

El problema que aborda es el coste del post-entrenamiento. Los metodos habituales de RL para razonamiento dependen de verificacion binaria de la respuesta final, y los de alineacion dependen de reward models entrenados sobre pares de preferencias. RL2R sustituye ambos por una recompensa basada en similitud semantica contra una referencia preexistente o destilada, medida con metricas ligeras como BERTScore. En esta variante concreta, la recompensa se aplica a la calibracion de confianza: el modelo debe ajustar su confianza declarada a la correccion real de sus respuestas.

Es relevante ahora porque demuestra que se puede hacer RL de alineacion sin un critic ni un reward model separado, con un coste computacional bajo, y porque el adaptador es pequeno (0,4 GB) y se puede superponer a cualquier despliegue existente de Mistral-7B. La utilidad practica es acotada: es un artefacto de investigacion con 9 descargas, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-7B-v0.1) con adaptador LoRA (PEFT) |
| Parametros totales | 7.000 millones en el modelo base; el adaptador LoRA ocupa 0,4 GB en el repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el base Mistral-7B-v0.1 soporta 8.192 tokens; no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (al ser LoRA, admite fusion con el base en fp16/bf16 y posterior cuantizacion GGUF/AWQ mediante herramientas externas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | mzhaoshuai/Mistral-7B-v0.1-conf-sft |
| Dataset de entrenamiento | shuchangtao/CONQORD_dataset |
| Libreria | PEFT 0.11.1 |
| Fecha de creacion | 2025-10-03 |

## Arquitectura y entrenamiento

La arquitectura subyacente es Mistral-7B-v0.1, un transformer decoder-only denso con atencion de ventana deslizante y GQA, sobre el que se ha entrenado un adaptador LoRA. El pipeline de post-entrenamiento tiene dos etapas: primero un SFT (`Mistral-7B-v0.1-conf-sft`) y despues esta etapa de RL con recompensas basadas en referencia, que produce el checkpoint `conf-refalign`. El entrenamiento usa el dataset `shuchangtao/CONQORD_dataset`, orientado a tareas de confianza.

La innovacion tecnica es el esquema de recompensa. En lugar de un reward model entrenado sobre preferencias binarias o de una verificacion rule-based solo del resultado final, RL2R calcula BERTScore entre la generacion muestreada y una respuesta de referencia. Esto conserva senal ordinal: las respuestas mas cercanas a la referencia reciben mas recompensa, y las derivaciones correctas obtienen credito aunque el resultado final sea erroneo. La instanciacion para alineacion es un REINFORCE-style sin critic, lo que elimina la necesidad de entrenar y servir un modelo de recompensa aparte. En esta variante concreta la tarea es calibracion de confianza, es decir, que la confianza declarada por el modelo se corresponda con su probabilidad real de acierto.

## Capacidades

- Generacion de texto autoregresiva, heredada de Mistral-7B-v0.1.
- Calibracion de confianza: el modelo esta entrenado para expresar un nivel de confianza alineado con la correccion de su respuesta.
- Razonamiento y matematicas: el marco RL2R se disena explicitamente para mejorar razonamiento verificable, aunque esta variante concreta se orienta a confianza y no a razonamiento puro.
- Multilingue: no confirmado; Mistral-7B-v0.1 tiene cobertura multilingue parcial, pero la model card no documenta idiomas para este adaptador.
- Tool calling / function calling: no documentado.
- Soporte de agentes y multi-step reasoning: no documentado.
- Modo thinking explicito: no disponible.
- Vision o audio: no soportado (modelo solo texto).

## Casos de uso

- Investigacion en calibracion de LLM: punto de partida para reproducir los experimentos de confianza del paper RL2R sobre Mistral-7B, comparando la calibracion antes y despues del adaptador.
- Baseline para metodos de RL sin reward model: util para equipos que quieran evaluar recompensas basadas en BERTScore frente a RMs tradicionales en tareas de alineacion, sin entrenar un critic.
- Experimentos de post-entrenamiento con PEFT: el adaptador se puede cargar sobre el SFT base con PEFT 0.11.1 y fusionar o mantener separado, lo que facilita ablaciones rapidas en una sola GPU.
- Evaluacion de honestidad y abuso de confianza: analizar si el modelo sobredeclara o subdeclara certeza en dominios fuera de distribucion, como paso previo a desplegar sistemas que muestren confianza al usuario.
- Docencia y divulgacion: ejemplo compacto (0,4 GB) de un pipeline completo SFT + RL para explicar alineacion sin infraestructura pesada.
- Prototipado de asistentes que comunican incertidumbre: en demos internas donde el usuario necesita saber cuando el modelo no esta seguro, aunque no se recomienda para produccion por la falta de benchmarks publicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint concreto. El paper RL2R (arXiv:2504.09895) reporta resultados del marco en tareas de razonamiento matematico, preferencias generales, seguridad y confianza, pero la informacion proporcionada no incluye las cifras ni la tabla comparativa especifica de esta variante `conf-refalign`.

## Requisitos de hardware

- VRAM para inferencia: el adaptador LoRA solo ocupa 0,4 GB, pero requiere cargar Mistral-7B-v0.1 en memoria. En fp16 son aproximadamente 14-15 GB; en 4 bits (GPTQ/AWQ/GGUF Q4) baja a unos 4-5 GB.
- GPU recomendadas: A100 40 GB u H100 para fp16 con contexto largo; L40S o RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 3090/4090 o incluso GPUs de 8 GB con cuantizacion 4 bits.
- Cabe en consumer GPU: si, en RTX 3090, 4090, 4080 y en tarjetas de 8-12 GB con cuantizacion agresiva.
- Opciones de despliegue: vLLM y TGI tras fusionar el adaptador con el base; llama.cpp/Ollama si se convierte a GGUF; transformers + PEFT para mantener el adaptador separado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mistral-7B-v0.1-conf-refalign | 7B + LoRA | no disponible | Adaptador RL de calibracion | Apache 2.0 | Hugging Face, 9 descargas |
| Mistral-7B-v0.1 (base) | 7B | 8.192 tokens | Modelo base | Apache 2.0 | Ampliamente disponible |
| Mistral-7B-Instruct-v0.1/v0.2 | 7B | 8.192 / 32.768 tokens | SFT + DPO | Apache 2.0 | Ampliamente disponible |
| Zephyr-7B-beta | 7B | 32.768 tokens | SFT + DPO | MIT | Ampliamente disponible |

La comparacion directa con alternativas de alineacion es dificil porque este checkpoint no publica benchmarks propios en la informacion disponible. Frente a Mistral-7B-Instruct o Zephyr, la diferencia es el objetivo: aquellos optimizan utilidad y seguridad con DPO sobre preferencias, mientras que este adaptador optimiza calibracion de confianza con recompensas de similitud y sin reward model. En madurez y soporte, esta claramente por detras: 9 descargas y 0 likes frente a ecosistemas consolidados.

## Limitaciones y advertencias

- Artefacto de investigacion: 9 descargas, 0 likes y sin benchmarks publicados en la informacion disponible; no apto para produccion sin evaluacion propia.
- Requiere el modelo base: no funciona de forma autonoma; hay que cargar `mzhaoshuai/Mistral-7B-v0.1-conf-sft` y aplicar el adaptador con PEFT 0.11.1.
- Riesgo de alucinacion: heredado de Mistral-7B-v0.1; el entrenamiento de calibracion no elimina errores factuales, solo pretende que la confianza declarada refleje la incertidumbre.
- Sesgos: no documentados en la model card; se heredan los del corpus de preentrenamiento de Mistral y los del dataset CONQORD.
- Idiomas: no documentados; la cobertura multilingue no esta garantizada para el adaptador.
- Contexto: no confirmado para este checkpoint; conviene verificar la ventana efectiva antes de usarlo con entradas largas.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Mistral-7B-v0.1 conviene revisar tambien los terminos del modelo base.
- El dataset de confianza (CONQORD) puede no representar dominios especializados; la calibracion fuera de distribucion es incierta.
- Nomenclatura confusa: el repo mantiene el nombre antiguo "refalign" aunque el marco se llama ahora RL2R.

## Enlaces

- Hugging Face: https://huggingface.co/mzhaoshuai/Mistral-7B-v0.1-conf-refalign
- Modelo base SFT: https://huggingface.co/mzhaoshuai/Mistral-7B-v0.1-conf-sft
- Paper (arXiv): https://arxiv.org/abs/2504.09895
- Paper en Hugging Face: https://huggingface.co/papers/2504.09895
- Repositorio GitHub: https://github.com/mzhaoshuai/RL2R/tree/alignment
- Dataset: https://huggingface.co/datasets/shuchangtao/CONQORD_dataset
