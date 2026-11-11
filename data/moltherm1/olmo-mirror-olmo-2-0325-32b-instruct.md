# moltherm1/olmo-mirror-olmo-2-0325-32b-instruct

## Resumen

OLMo 2 32B Instruct (marzo de 2025) es la variante post-entrenada del modelo base OLMo-2-0325-32B desarrollado por el Allen Institute for AI (Ai2). Se trata de un transformer decoder-only denso de 32 mil millones de parametros, disenado explicitamente para impulsar la ciencia de los modelos de lenguaje mediante la liberacion completa de codigo, checkpoints, logs y detalles de entrenamiento. El modelo de esta ficha es un espejo alojado por el usuario moltherm1 del checkpoint oficial `allenai/OLMo-2-0325-32B-Instruct`.

El problema que resuelve es la falta de modelos de gran tamano totalmente abiertos y reproducibles: a diferencia de la mayoria de modelos de pesos abiertos, OLMo publica el pipeline completo de datos (Dolma), el codigo de entrenamiento (OLMo-core) y los checkpoints intermedios del entrenamiento por RLVR. El post-entrenamiento combina SFT sobre una variante de Tülu 3, DPO sobre un dataset de preferencias propio y RLVR final sobre `allenai/RLVR-GSM-MATH-IF-Mixed-Constraints`, lo que lo orienta a tareas de matemáticas, instrucciones verificables y chat.

Es relevante ahora porque ofrece, con licencia Apache 2.0, un rendimiento cercano a modelos abiertos de referencia de 24-70B en tareas como GSM8K, IFEval o MMLU, y porque su caracter totalmente abierto lo hace idoneo para investigacion en alineamiento, RL y reproducibilidad, asi como para despliegues comerciales sin restricciones de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (OLMo 2) |
| Parametros totales | 32B |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | Principalmente ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 19,7 GB, libreria transformers) |

## Arquitectura y entrenamiento

OLMo 2 es una familia de transformers decoder-only densos. El modelo de 32B parte del checkpoint `allenai/OLMo-2-0325-32B` y se post-entrena en tres fases: (1) SFT supervisado sobre una variante especifica de OLMo del dataset Tülu 3 (`allenai/tulu-3-sft-olmo-2-mixture`); (2) DPO sobre `allenai/olmo-2-0325-32b-preference-mix`; y (3) RLVR (RL con recompensas verificables) sobre `allenai/RLVR-GSM-MATH-IF-Mixed-Constraints`, orientado a GSM8K, MATH e IFEval. El modelo base se entrena sobre el corpus Dolma, que mezcla datos publicos, sinteticos y creados por humanos.

Una innovacion destacable es la liberacion de checkpoints intermedios del entrenamiento RLVR, guardados cada 20 pasos de entrenamiento y accesibles como revisiones del repositorio (por ejemplo, `revision="step_200"`). El chat template usa los tokens `<|user|>`, `<|assistant|>` y `<|endoftext|>`, sin token BOS inicial, y esta embebido en el tokenizer para `apply_chat_template`. Ai2 recomienda el system prompt "You are OLMo 2, a helpful and harmless AI Assistant built by the Allen Institute for AI", aunque el modelo no fue entrenado con un system prompt especifico.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles.
- Razonamiento matematico: entrenamiento RLVR explicito sobre GSM8K y MATH.
- Seguimiento de instrucciones verificables (IFEval) reforzado en la fase RLVR.
- Razonamiento de sentido comun y multi-paso (BBH, DROP).
- Conocimiento factual y respuesta a preguntas (MMLU, PopQA, TruthfulQA).
- Capacidad de chat con plantilla dedicada y soporte de system prompt.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.
- Capacidades multilingues limitadas: el modelo esta orientado principalmente al ingles.

## Casos de uso

- Tutoria y resolucion de problemas matematicos: el entrenamiento RLVR sobre GSM8K y MATH lo hace adecuado para explicar pasos intermedios en ejercicios de aritmetica y algebra, con verificacion automatica de la respuesta final.
- Evaluacion de investigacion en RL y alineamiento: los checkpoints intermedios cada 20 pasos permiten estudiar la evolucion del modelo durante RLVR sin reentrenar, util para laboratorios que investigan tecnicas de recompensa verificable.
- Generacion de codigo y scripts auxiliares: aunque no se documenta tool calling, su rendimiento en BBH e IFEval lo hace util para generar fragmentos de codigo y explicaciones tecnicas dentro de pipelines de desarrollo.
- Asistente conversacional de dominio general en ingles: con 32B de parametros y post-entrenamiento SFT+DPO, puede gestionar dialogos multi-turno en atencion al cliente o soporte interno donde se requiera un modelo con licencia permisiva.
- Clasificacion y extraccion de informacion con instrucciones: su puntuacion en IFEval permite usarlo para tareas de transformacion de texto (resumen, reformateo, extraccion) guiadas por instrucciones estrictas.
- Base para fine-tuning comercial: la licencia Apache 2.0 y la disponibilidad de codigo de entrenamiento (OLMo-core, open-instruct) permiten adaptarlo a dominios verticales sin restricciones de uso.
- Reproducibilidad y auditoria de modelos: al publicarse datos, logs y checkpoints, es util como referencia en estudios de sesgo, seguridad y comportamiento de modelos abiertos.

## Benchmarks y rendimiento

Datos publicados en la model card del modelo oficial (porcentajes):

| Modelo | Average | AlpacaEval 2 LC | BBH | DROP | GSM8k | IFEval | MATH | MMLU | Safety | PopQA | TruthQA |
|---|---|---|---|---|---|---|---|---|---|---|---|
| GPT-3.5 Turbo 0125 | 59.6 | 38.7 | 66.6 | 70.2 | 74.3 | 66.9 | 41.2 | 70.2 | 69.1 | 45.0 | 62.9 |
| GPT-4o Mini 2024-07-18 | 65.7 | 49.7 | 65.9 | 36.3 | 83.0 | 83.5 | 67.9 | 82.2 | 84.9 | 39.0 | 64.8 |
| Mistral-Nemo-Instruct-2407 | 50.9 | 45.8 | 54.6 | 23.6 | 81.4 | 64.5 | 31.9 | 70.0 | 52.7 | 26.9 | 57.7 |
| Ministral-8B-Instruct | 52.1 | 31.4 | 56.2 | 56.2 | 80.0 | 56.4 | 40.0 | 68.5 | 56.2 | 20.2 | 55.5 |
| Gemma-2-27b-it | 61.3 | 49.0 | 72.7 | 67.5 | 80.7 | 63.2 | 35.1 | 70.7 | 75.9 | 33.9 | 64.6 |
| Qwen2.5-32B | 66.5 | 39.1 | 82.3 | 48.3 | 87.5 | 82.4 | 77.9 | 84.7 | 82.4 | 26.1 | 70.6 |
| Mistral-Small-24B | 67.6 | 43.2 | 80.1 | 78.5 | 87.2 | 77.3 | 65.9 | 83.7 | 66.5 | 24.4 | 68.1 |
| Llama-3.1-70B | 70.0 | 32.9 | 83.0 | 77.0 | 94.5 | 88.0 | 56.2 | 85.2 | 76.4 | 46.5 | 66.8 |
| Llama-3.3-70B | 73.0 | 36.5 | 85.8 | 78.0 | 93.6 | 90.8 | 71.8 | 85.9 | 70.4 | 48.2 | 66.1 |
| Gemma-3-27b-it | - | 63.4 | 83.7 | 69.2 | 91.1 | - | - | 81.8 | - | 30.9 | - |
| OLMo-2-7B-1124-Instruct | 55.7 | 31.0 | 48.5 | 58.9 | 85.2 | 75.6 | 31.3 | 63.9 | 81.2 | 24.6 | 56.3 |
| OLMo-2-13B-1124-Instruct | 61.4 | 37.5 | 58.4 | 72.1 | 87.4 | 80.4 | 39.7 | 68.6 | 77.5 | 28.8 | 63.9 |
| OLMo-2-32B-0325-SFT | 61.7 | 16.9 | 69.7 | 77.2 | 78.4 | 72.4 | 35.9 | 76.1 | 93.8 | 35.4 | 61.3 |
| OLMo-2-32B-0325-DPO | 68.8 | 44.1 | 70.2 | 77.5 | 85.7 | 83.8 | 46.8 | 78.0 | 9 (truncado en la informacion disponible) | no disponible | no disponible |

Nota: la fila del modelo final OLMo-2-32B-0325-Instruct no aparece completa en la informacion proporcionada; los datos de la tabla corresponden a las fases SFT y DPO y a los modelos de comparacion.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 64 GB de pesos (32B parametros x 2 bytes), mas overhead de KV cache; se recomienda 80 GB para contexto amplio.
- VRAM en cuantizacion de 8 bits: en torno a 32-36 GB; en 4 bits, en torno a 18-22 GB (estimaciones teoricas, no verificadas en la informacion disponible).
- GPU recomendadas: A100 80GB, H100 80GB, H200; para 4 bits puede caber en RTX 4090 (24 GB) con contexto limitado.
- No cabe en GPUs consumer de 8-16 GB sin cuantizacion agresiva y offload a CPU.
- Opciones de despliegue: transformers (requiere instalar desde la rama main de Hugging Face, ya que OLMo 2 se soporta en la siguiente version), vLLM y TGI para produccion; llama.cpp/Ollama si se generan cuantizaciones GGUF (no listadas en la informacion disponible).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Average | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OLMo-2-32B-0325-Instruct | 32B | no disponible | no disponible completo (DPO: 68.8) | Apache 2.0 | Pesos abiertos, codigo y datos |
| Qwen2.5-32B | 32B | no disponible | 66.5 | no disponible en la informacion | Pesos abiertos |
| Mistral-Small-24B | 24B | no disponible | 67.6 | no disponible en la informacion | Pesos abiertos |
| Gemma-2-27b-it | 27B | no disponible | 61.3 | no disponible en la informacion | Pesos abiertos |
| Llama-3.3-70B | 70B | no disponible | 73.0 | no disponible en la informacion | Pesos abiertos |

OLMo 2 32B destaca por ser el unico de la comparativa con licencia Apache 2.0 y publicacion completa de datos, codigo y checkpoints intermedios; en rendimiento medio queda por debajo de Qwen2.5-32B y Mistral-Small-24B segun los datos de la model card, aunque supera a Gemma-2-27b-it en la media reportada.

## Limitaciones y advertencias

- Entrenamiento de seguridad limitado: el modelo puede producir salidas problematicas, especialmente si se le induce, y no incluye filtrado en bucle como ChatGPT.
- Riesgo de alucinacion en tareas factuales; los resultados de TruthfulQA y PopQA son moderados.
- Soporte principalmente en ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Longitud de contexto no documentada en la informacion disponible; conviene verificarla antes de disenar aplicaciones con ventanas largas.
- No se documenta soporte de tool calling ni de agentes; no asumir su disponibilidad en produccion.
- Licencia Apache 2.0 permisiva para uso comercial, pero el usuario asume la responsabilidad sobre sesgos y contenido generado.
- Este repositorio concreto es un espejo de terceros (moltherm1) con 0 descargas y 0 likes; para produccion es preferible usar el checkpoint oficial de Ai2.
- Requiere versiones recientes de transformers (rama main) para cargar la arquitectura OLMo 2.

## Enlaces

- Repositorio de este espejo: https://huggingface.co/moltherm1/olmo-mirror-olmo-2-0325-32b-instruct
- Modelo oficial: https://huggingface.co/allenai/OLMo-2-0325-32B-Instruct
- Modelo base: https://huggingface.co/allenai/OLMo-2-0325-32B
- Dataset SFT: https://huggingface.co/datasets/allenai/tulu-3-sft-olmo-2-mixture
- Dataset DPO: https://huggingface.co/datasets/allenai/olmo-2-0325-32b-preference-mix
- Dataset RLVR: https://huggingface.co/datasets/allenai/RLVR-GSM-MATH-IF-Mixed-Constraints
- Paper OLMo 2: https://arxiv.org/abs/2501.00656
- Paper Tülu 3: https://arxiv.org/abs/2411.15124
- Pagina del proyecto: https://allenai.org/olmo
- Repositorio principal: https://github.com/allenai/OLMo-core
- Codigo de evaluacion: https://github.com/allenai/olmes
- Codigo de fine-tuning: https://github.com/allenai/open-instruct
- Demo: https://playground.allenai.org/
