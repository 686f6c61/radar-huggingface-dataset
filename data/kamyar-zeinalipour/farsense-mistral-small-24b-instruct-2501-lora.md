# Kamyar-zeinalipour/FarSense-Mistral-Small-24B-Instruct-2501-LoRA

## Resumen

FarSense-Mistral-Small-24B-Instruct-2501-LoRA es un adaptador LoRA publicado por Kamyar Zeinalipour que especializa el modelo base Mistral-Small-24B-Instruct-2501 (24 000 millones de parametros) en razonamiento de sentido comun en farsi (persa) fundamentado en contexto. El adaptador se entrena sobre la particion de entrenamiento del benchmark FarSense, presentado en el paper *FarSense: A Comprehensive Commonsense Benchmark and Evaluation Framework for the Farsi Language* (IJCNLP-AACL 2025). El objetivo es que el modelo responda correctamente a tareas de sentido comun cotidiano en persa con salida JSON estructurada.

El modelo resuelve un problema concreto: los LLM grandes rinden de forma notablemente inferior en tareas de sentido comun en farsi que en ingles, especialmente en tareas de formato libre (cloze, causa-efecto, contrafactuales y explicaciones). El adaptador mejora la puntuacion global del benchmark de 0,627 a 0,672 (+0,045), con la mayor ganancia en cloze (+0,114 en exact match). El adaptador ocupa 4,2 GB porque el LoRA se aplica tambien a `embed_tokens` y `lm_head`, y PEFT almacena esas capas junto al adaptador.

Es relevante para desarrolladores e investigadores que trabajen con persa y necesiten un modelo de 24B con mejor rendimiento en razonamiento de sentido comun sin reentrenar el modelo completo. La licencia del adaptador es Apache 2.0, pero el modelo base esta sujeto a los terminos de Mistral AI y requiere aceptar su gated access.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Mistral-Small-24B-Instruct-2501); adaptador LoRA sobre atencion y MLP |
| Parametros totales | 24B (modelo base); adaptador LoRA de 4,2 GB en disco |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (depende del modelo base) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el adaptador se entrena y evalua en bf16) |
| Idiomas soportados | farsi (fa) |
| Licencia | apache-2.0 (adaptador); modelo base sujeto a terminos de Mistral AI |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Mistral-Small-24B-Instruct-2501, un transformer decoder-only de 24B parametros. El LoRA usa rango r = 128, alpha = 256 y dropout 0,1, y se aplica a las proyecciones q/k/v/o, gate/up/down, `embed_tokens` y `lm_head`. El entrenamiento se realizo durante 3 epocas con AdamW, learning rate 1e-4, decaimiento coseno, sin warm-up y weight decay 1e-4. El batch fue de 4 secuencias por GPU con 2 pasos de acumulacion de gradiente, empaquetado a 2048 tokens, en precision bf16 con DeepSpeed ZeRO-3, Flash Attention 2 y gradient clipping 1.0 (semilla 100). Se uso hardware de 3 × NVIDIA RTX A6000 (48 GB) durante 13 h 22 min.

Los datos de entrenamiento son la particion de entrenamiento de FarSense / CS_Farsi: 4000 escenarios y 28 000 items. Cada item presenta un escenario cotidiano en farsi y pide una unica respuesta JSON, con tareas de juicio verdadero/falso, eleccion multiple, cloze, causa-efecto, contrafactual y preguntas de "por que". No se menciona RLHF ni DPO en la informacion proporcionada; el ajuste es supervisado sobre el benchmark.

## Capacidades

- Generacion de texto en farsi con salida JSON estructurada para tareas de sentido comun.
- Juicios verdadero/falso sobre escenarios cotidianos.
- Eleccion multiple entre opciones de respuesta.
- Completado cloze (rellenar huecos) en persa.
- Razonamiento causa-efecto en texto libre.
- Razonamiento contrafactual en texto libre.
- Generacion de explicaciones ("por que") en farsi.
- Razonamiento de sentido comun fundamentado en contexto.
- No se documenta soporte de tool calling ni function calling en la informacion proporcionada.
- No se documenta soporte de agentes ni multi-step reasoning en la informacion proporcionada.
- No se documenta vision, audio ni thinking mode en la informacion proporcionada.

## Casos de uso

- Evaluacion de sentido comun en persa: el adaptador sirve como referencia afinada para medir la capacidad de un modelo de 24B en el benchmark FarSense, comparando contra el modelo base zero-shot.
- Sistemas de preguntas y respuestas en farsi: el modelo puede responder a escenarios cotidianos con formato JSON, adecuado para pipelines que necesiten salida parseable.
- Investigacion en adaptacion linguistica: util para estudiar cuanto mejora un LoRA de rango 128 sobre un modelo de 24B en una lengua de recursos medios como el persa.
- Generacion de explicaciones en persa: las tareas de "por que" y causa-efecto permiten usar el modelo para producir justificaciones textuales en farsi.
- Clasificacion de escenarios: las tareas de verdadero/falso y eleccion multiple permiten usar el modelo como clasificador de sentido comun en persa con salida exacta.
- Benchmarking de modelos base: el adaptador y su script de evaluacion permiten reproducir la puntuacion del paper sobre la particion de test de 1470 items (210 escenarios).
- Prototipado de asistentes en persa: aunque el adaptador esta especializado en sentido comun, puede integrarse en un pipeline de generacion de texto en farsi con el modelo base subyacente.

## Benchmarks y rendimiento

Resultados en la particion de test de FarSense (1470 items, 210 escenarios). Las exactitudes son exact match; las puntuaciones de texto promedian BLEU-4, ROUGE-L F1, BERTScore F1 y similitud coseno de embeddings.

| Metrica | Base (zero-shot) | FarSense LoRA | Delta |
|---|---:|---:|---:|
| T/F-True accuracy | 0,962 | 0,981 | +0,019 |
| T/F-False accuracy | 0,981 | 0,976 | -0,005 |
| Multiple-choice accuracy | 0,962 | 0,976 | +0,014 |
| Cloze accuracy | 0,333 | 0,448 | +0,114 |
| Cause-Effect (text score) | 0,394 | 0,467 | +0,073 |
| Counterfactual (text score) | 0,405 | 0,460 | +0,055 |
| Explanation (text score) | 0,416 | 0,442 | +0,026 |
| Cloze (text score) | 0,564 | 0,628 | +0,064 |
| Classification | 0,810 | 0,845 | +0,036 |
| Free-form | 0,445 | 0,499 | +0,054 |
| Overall | 0,627 | 0,672 | +0,045 |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 24B en bf16 requiere aproximadamente 48 GB de VRAM; el adaptador anade 4,2 GB en disco y se puede fusionar con `merge_and_unload()`.
- GPU recomendadas: NVIDIA RTX A6000 (48 GB), A100 (40/80 GB), H100 (80 GB) para bf16 sin cuantizar.
- Cabe en consumer GPU solo con cuantizacion (no documentada en la informacion proporcionada); en bf16 no cabe en GPUs de 24 GB.
- Opciones de despliegue: transformers con PEFT (`PeftModel.from_pretrained` y `merge_and_unload()`); no se documentan vLLM, llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Entrenamiento: 3 × NVIDIA RTX A6000 (48 GB), 13 h 22 min.

## Comparativa con modelos similares

Comparativa dentro de la familia FarSense publicada en la model card:

| Modelo base | Parametros | Adaptador | Overall (base -> fine-tuned) |
|---|---:|---|---|
| Llama-3.2-1B-Instruct | 1B | FarSense-Llama-3.2-1B-Instruct-LoRA | 0,227 -> 0,450 |
| Llama-3.2-3B-Instruct | 3B | FarSense-Llama-3.2-3B-Instruct-LoRA | 0,449 -> 0,529 |
| Mistral-Small-24B-Instruct-2501 | 24B | FarSense-Mistral-Small-24B-Instruct-2501-LoRA | 0,627 -> 0,672 |

La model card menciona que se publicaron seis adaptadores con el paper; solo se detallan tres en la informacion proporcionada. No se dispone de comparacion con otros modelos de la misma categoria fuera de la familia FarSense en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador esta especializado unicamente en farsi; no se documenta rendimiento en otros idiomas.
- El modelo base esta gated: es necesario aceptar los terminos en la pagina de Mistral y autenticarse con `huggingface-cli login`.
- Riesgo de alucinacion: no se documenta en la informacion proporcionada, pero es inherente a los modelos generativos de 24B.
- Sesgos conocidos: no se documentan en la informacion proporcionada.
- El rendimiento en tareas de formato libre sigue siendo bajo en terminos absolutos (Overall 0,672; Free-form 0,499), lo que limita su uso en produccion para generacion abierta.
- La licencia Apache 2.0 aplica al adaptador; el uso del modelo base queda sujeto a los terminos de Mistral AI.
- El adaptador ocupa 4,2 GB por incluir `embed_tokens` y `lm_head` en el LoRA, lo que incrementa los requisitos de almacenamiento frente a un LoRA convencional.
- No se documentan opciones de cuantizacion ni despliegue en servidores de inferencia de alto rendimiento.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Kamyar-zeinalipour/FarSense-Mistral-Small-24B-Instruct-2501-LoRA
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-24B-Instruct-2501
- Dataset CS_Farsi: https://huggingface.co/datasets/Kamyar-zeinalipour/CS_Farsi
- Paper (IJCNLP-AACL 2025): https://aclanthology.org/2025.ijcnlp-long.187/
- Repositorio GitHub: https://github.com/KamyarZeinalipour/FarSense
- Coleccion FarSense: https://huggingface.co/collections/Kamyar-zeinalipour/farsense-ijcnlp-aacl-2025-6af4553f756c4d246fe7f56c
- Adaptador FarSense-Llama-3.2-1B-Instruct-LoRA: https://huggingface.co/Kamyar-zeinalipour/FarSense-Llama-3.2-1B-Instruct-LoRA
- Adaptador FarSense-Llama-3.2-3B-Instruct-LoRA: https://huggingface.co/Kamyar-zeinalipour/FarSense-Llama-3.2-3B-Instruct-LoRA
- Modelo Llama-3.2-1B-Instruct: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Modelo Llama-3.2-3B-Instruct: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
