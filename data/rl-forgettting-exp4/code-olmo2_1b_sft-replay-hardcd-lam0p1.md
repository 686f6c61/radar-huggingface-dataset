# RL-Forgettting-Exp4/code-olmo2_1b_sft-replay-hardcd-lam0p1

## Resumen

`code-olmo2_1b_sft-replay-hardcd-lam0p1` es un ajuste fino por refuerzo (RL) del modelo `allenai/OLMo-2-0425-1B-SFT`, entrenado con GRPO sobre el split de entrenamiento de MBPP (320 problemas de generacion de codigo Python). El modelo forma parte de un estudio sobre olvido catastrofico durante el RL: el mismo run se entrena con y sin un buffer de replay de datos SFT, y este checkpoint corresponde al brazo que si lo usa (muestreo `hard_cooldown`, lambda 0.1). Lo publica el usuario de Hugging Face `RL-Forgettting-Exp4`, no el equipo de Allen AI.

La relevancia del artefacto es experimental y metodologica, no de producto: el repositorio publica seis checkpoints intermedios (pasos 50 a 300, cada 50 pasos) que permiten trazar como evoluciona el rendimiento en MBPP+ y como se degrada el pass@k a medida que avanza el entrenamiento. Sirve como material reproducible para investigar el fenomeno del olvido de capacidades previas inducido por RL con recompensa binaria de ejecucion.

El modelo base OLMo-2-0425-1B-SFT es un transformer decoder-only de aproximadamente 1.000 millones de parametros, con contexto de 4096 tokens y licencia Apache 2.0. El entrenamiento RL se ejecuto en 2 GPU H100 de 80 GB durante 300 pasos (60 epocas sobre 320 prompts), con 8 rollouts por prompt y recompensa binaria basada en la ejecucion del programa generado contra los asserts de la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: OLMo-2-0425-1B-SFT) |
| Parametros totales | aproximadamente 1.000 millones (heredados del modelo base; no se detalla en la model card) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4096 tokens (heredada de OLMo-2; el entrenamiento usa prompt <= 1024 y respuesta <= 3072) |
| Tipos de cuantizacion | no disponible (los pesos publicados estan en bfloat16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible en la model card (el modelo base OLMo-2 es predominantemente ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16), un subdirectorio `global_step_<N>/` por checkpoint con config y tokenizer |

## Arquitectura y entrenamiento

El modelo es un ajuste por RL del checkpoint SFT de OLMo-2-0425-1B (revision `0d85a3d037876ce6ac7d4311d994400fc66ac27f`). El algoritmo es GRPO implementado con verl: 8 rollouts por prompt, sin normalizacion de la desviacion estandar de la ventaja, sin perdida KL y sin KL en la recompensa, coeficiente de entropia 0 (aunque se registra la entropia). La recompensa es binaria: se ejecuta el programa generado contra los asserts de la tarea con un timeout de 10 segundos. El learning rate del actor es 1e-6 constante, sin warmup ni decaimiento, con weight decay 0.01. El batch es de 64 prompts por 8 rollouts por paso, con mini-batch PPO de 64.

La innovacion tecnica del experimento es el buffer de replay SFT: con lambda 0.1 y muestreo `hard_cooldown` (128 extracciones por paso, hard_k 32, cooldown de 5 pasos, buffer sin limite, umbral 0.0), se reinyectan ejemplos SFT durante el entrenamiento RL para mitigar el olvido catastrofico. El entrenamiento duro 300 pasos (60 epocas) con semilla 1 en 2 H100 de 80 GB, con 22 workers de ejecucion de codigo (no 32, por limite del cgroup de CPU del SKU). El job se reinicio 5 veces por precaucion de capacidad y reanudo desde el ultimo checkpoint. W&B se ejecuto en modo offline.

## Capacidades

- Generacion de codigo Python: el modelo esta especializado en resolver problemas del estilo MBPP, escribiendo funciones que cumplen un conjunto de asserts.
- Razonamiento paso a paso sobre enunciados de programacion en lenguaje natural.
- Generacion de texto general: capacidades heredadas del modelo base OLMo-2-1B-SFT, aunque el RL se centra en codigo.
- Ejecucion verificable: el modelo produce programas ejecutables, lo que permite validacion automatica por tests.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso mas alla de la generacion de un programa.
- Capacidades multilingues: no documentadas; el modelo base OLMo-2 es principalmente ingles.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Investigacion sobre olvido catastrofico en RL: comparar este brazo (con buffer de replay) contra el brazo sin buffer (`code-olmo2_1b_sft-nobuf`) para medir cuanto mitiga el replay la degradacion del pass@k a lo largo del entrenamiento.
- Reproduccion de experimentos de GRPO: los seis checkpoints publicados (pasos 50 a 300) permiten reproducir las curvas de aprendizaje y olvido sin reentrenar.
- Generacion de codigo Python de proposito general en entornos controlados: el modelo puede escribir funciones a partir de un enunciado, con validacion por ejecucion contra tests.
- Evaluacion de tecnicas de replay buffer: usar el checkpoint como referencia para probar variantes de muestreo (`hard_cooldown` frente a otras politicas) y de lambda.
- Estudio de recompensas binarias por ejecucion: analizar como una senal de recompensa estricta (timeout de 10 s, asserts) afecta a la diversidad de las salidas (pass@k decae mientras pass@1 mejora).
- Docencia y formacion: ejemplo didactico de pipeline completo de RL para codigo con verl, incluyendo conversion de checkpoints FSDP a Hugging Face.
- Baseline ligero para prototipos: con aproximadamente 1.000 millones de parametros, cabe en una sola GPU consumer para inferencia en bf16 o cuantizado, aunque no se documentan recetas de cuantizacion.

## Benchmarks y rendimiento

Evaluacion held-out sobre MBPP+ (378 problemas), 160 muestras por problema, temperatura 0.6, top-p 0.95, hasta 3072 tokens nuevos, con el scorer nativo de ejecucion y la suite completa de tests de MBPP+ (aproximadamente 108 tests por problema). pass@k con estimador insesgado.

| Paso | Origen | pass@1 | pass@8 | pass@64 | pass@128 |
|---:|---|---:|---:|---:|---:|
| 0 | modelo base | 0.1490 | 0.4106 | 0.6165 | 0.6648 |
| 50 | este run | 0.3525 | 0.5206 | 0.6241 | 0.6472 |
| 100 | este run | 0.3607 | 0.4837 | 0.5675 | 0.5874 |
| 150 | este run | 0.3620 | 0.4551 | 0.5228 | 0.5437 |
| 200 | este run | 0.3573 | 0.4476 | 0.5230 | 0.5425 |
| 250 | este run | 0.3660 | 0.4485 | 0.5127 | 0.5279 |
| 300 | este run | 0.3778 | 0.4640 | 0.5298 | 0.5480 |

Lectura: el pass@1 sube de 0.1490 en el paso 0 a 0.3778 en el paso 300 (multiplicacion por 2.5), mientras que pass@64 y pass@128 caen desde 0.6165/0.6648 hasta 0.5298/0.5480. Es decir, el modelo mejora en su mejor intento pero pierde diversidad y capacidad de resolver problemas con muchos muestreos, patron clasico de olvido y colapso de diversidad durante RL. No se publican comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB de pesos (1.000 millones de parametros a 2 bytes) mas overhead de activaciones y cache KV; en la practica, entre 4 y 8 GB segun longitud de contexto y batch.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1 GB de pesos; en 4 bits, aproximadamente 0.5 GB (no se publican pesos cuantizados, habria que generarlos).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 con contexto corto; H100 o A100 no son necesarias para inferencia, solo para el entrenamiento original (2 x H100 80 GB).
- Cabe en GPU consumer: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y similares.
- Opciones de despliegue: `transformers` (receta oficial en la model card), vLLM, TGI, llama.cpp u Ollama tras conversion a GGUF (no se proporcionan pesos GGUF en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| code-olmo2_1b_sft-replay-hardcd-lam0p1 (este) | aproximadamente 1B | 4096 | Codigo Python via GRPO sobre MBPP, estudio de olvido | Apache 2.0 | Hugging Face, 6 checkpoints |
| allenai/OLMo-2-0425-1B-SFT (base) | aproximadamente 1B | 4096 | Modelo general SFT | Apache 2.0 | Hugging Face |
| RL-Forgettting-Exp4/code-olmo2_1b_sft-nobuf (brazo hermano) | aproximadamente 1B | 4096 | Mismo entrenamiento sin buffer de replay | Apache 2.0 | Hugging Face |
| CodeLlama-7B o Qwen2.5-Coder-1.5B | 1.5B a 7B | 4096 a 32768 | Codigo general | Licencias variables | Hugging Face |

La comparacion cuantitativa con modelos de codigo de proposito general no esta disponible en la model card; solo se dispone de la comparacion interna entre el paso 0 (base) y los pasos RL de este mismo run.

## Limitaciones y advertencias

- El pass@k a partir de k=64 decae respecto al modelo base: el RL mejora pass@1 pero reduce la diversidad y la capacidad de resolver problemas con muchos muestreos. No es un modelo adecuado para tecnicas de best-of-n con n grande.
- El entrenamiento se hizo sobre solo 320 prompts de MBPP durante 60 epocas, lo que favorece el sobreajuste a ese estilo de problemas y no garantiza generalizacion a otros dominios de codigo.
- El modelo base OLMo-2-1B es pequeno y predominantemente ingles; no se documentan capacidades multilingues y es probable que el rendimiento en idiomas distintos del ingles sea limitado.
- Riesgo de alucinacion en la generacion de codigo: el modelo puede producir programas sintacticamente validos pero incorrectos; la validacion por ejecucion es imprescindible.
- Sesgos: no se documenta ninguna evaluacion de sesgos; al heredar del modelo base, arrastra los sesgos de sus datos de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se publica como artefacto de investigacion sin garantias de calidad en produccion.
- Los checkpoints no incluyen estado del optimizador, FSDP ni buffer de replay, por lo que no se puede reanudar el entrenamiento exactamente desde ellos.
- El paso 300 se fusiono offline desde shards FSDP; puede haber diferencias minimas de numerica respecto a una exportacion nativa.
- El repositorio pesa 17.8 GB por contener seis checkpoints completos en bf16; el almacenamiento es un coste relevante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RL-Forgettting-Exp4/code-olmo2_1b_sft-replay-hardcd-lam0p1
- Brazo hermano sin buffer: https://huggingface.co/RL-Forgettting-Exp4/code-olmo2_1b_sft-nobuf
- Dataset de resultados y evaluaciones: https://huggingface.co/datasets/RL-Forgettting-Exp4/rebuttal-results-20261109
- Evaluaciones (snapshot): https://huggingface.co/datasets/RL-Forgettting-Exp4/rebuttal-results-20261109/tree/main/evaluations
- Artefactos de entrenamiento: https://huggingface.co/datasets/RL-Forgettting-Exp4/rebuttal-results-20261109/tree/main/mbpp-olmo2-1b-sft-hardcd-lam0p1
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-SFT
- Repositorio de experimentos (commit `1fa2cc9`): `jy-evangeline/rl-forgetting-experiments` (no se proporciona URL directa en la model card)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
