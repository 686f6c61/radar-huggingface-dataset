# nchapman/Qwen3.6-35B-A3B-Heretic-LoRA

## Resumen

Qwen3.6-35B-A3B-Heretic-LoRA es un adaptador LoRA de tipo "abliteration" creado por el usuario nchapman sobre el modelo base Qwen/Qwen3.6-35B-A3B. Su objetivo es reducir la tasa de rechazos del modelo base ante peticiones que este considera sensibles, preservando al maximo la fidelidad respecto al comportamiento original. Emplea la tecnica Magnitude-Preserving Orthogonal Ablation (MPOA) implementada en Heretic v2.1, con un rango SVD de 3, aplicada sobre 80 proyecciones residuales del transformer.

El adaptador se distribuye en formato PEFT (safetensors) y tambien como LoRA en GGUF para llama.cpp, e incluye una coleccion de checkpoints en la frontera de Pareto que permiten elegir el equilibrio entre tasa de rechazo y divergencia KL respecto al modelo base. Segun la model card, el adaptador por defecto reduce los rechazos de 99/100 a 11/100 con una divergencia KL de primer token de 0,2052 nats sobre el conjunto harmless_alpaca.

Es relevante para desarrolladores que necesitan un modelo sin filtros de rechazo para tareas de investigacion, red teaming o generacion creativa sin restricciones, y que quieren mantener la posibilidad de activar o desactivar el comportamiento abliterado por peticion en vLLM. El modelo base es un MoE de Qwen con 35B parametros totales y 3B activos, aunque las especificaciones detalladas de dicho modelo base no se incluyen en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE Qwen3.6 (arquitectura base no detallada) |
| Parametros totales | 1.044.480 (parametros del adaptador LoRA) |
| Parametros activos | no disponible (el modelo base es MoE con 3B activos segun su nombre) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (adaptador); compatible con variantes cuantizadas del base como W4A16-HGPTQ y GGUF UD-Q4_K_XL |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT) y GGUF (LoRA para llama.cpp) |

## Arquitectura y entrenamiento

El adaptador se construye mediante Heretic v2.1, una herramienta de abliteration automatica que aplica Magnitude-Preserving Orthogonal Ablation (MPOA) con descomposicion SVD de rango 3 y normalizacion de filas "full". La ablacion se aplica sobre 80 proyecciones que escriben en el flujo residual: self_attn.o_proj, linear_attn.out_proj, mlp.down_proj y mlp.shared_expert.down_proj. El proceso de extraccion usa train[:400] y la evaluacion test[:100] sobre los conjuntos mlabonne/harmless_alpaca y mlabonne/harmful_behaviors.

El adaptador se entrena en BF16 y se distribuye como LoRA PEFT. Ademas, se incluyen conversiones GGUF con la arquitectura general.architecture = "qwen35moe", que incorporan el reordenamiento de cabezas V de GatedDeltaNet en blk.*.ssm_out.weight.lora_a para compatibilidad con llama.cpp. La model card documenta una busqueda de hiperparametros con multiples trials y publica todos los checkpoints no dominados en la frontera de Pareto, lo que permite seleccionar el punto de equilibrio entre supresion de rechazos y fidelidad al modelo base.

## Capacidades

- Generacion de texto sin rechazos ante peticiones que el modelo base filtraria (tasa de rechazo del 11 % frente al 99 % del base).
- Control granular del grado de abliteration mediante los checkpoints de Pareto (desde 11 % hasta 99 % de rechazos).
- Activacion y desactivacion por peticion en vLLM: el mismo servidor puede servir el modelo base sin adaptar y el adaptador abliterado segun el campo "model" de la peticion.
- Compatibilidad con checkpoints cuantizados del base (W4A16-HGPTQ, GGUF) en vLLM y llama.cpp.
- Inferencia via transformers + peft, vLLM (--enable-lora) y llama.cpp (llama-server con --lora).
- Capacidades heredadas del modelo base Qwen3.6-35B-A3B (razonamiento, codigo, tool calling, multilingue) no documentadas en la informacion disponible.

## Casos de uso

- Red teaming y evaluacion de seguridad: permite generar respuestas que el modelo base rechazaria, lo que facilita probar la robustez de filtros y clasificadores propios en pipelines de moderacion.
- Investigacion sobre alineacion y abliteration: los checkpoints de Pareto permiten estudiar la relacion entre tasa de rechazo y divergencia KL, comparando el efecto de distintas magnitudes de ablacion sobre el comportamiento del modelo.
- Generacion creativa sin restricciones: escritura de ficcion con tematicas adultas o violentas donde los filtros del base interrumpen la generacion; el adaptador conserva la coherencia del modelo original con una KL de 0,2052 nats.
- Servicio dual en produccion con vLLM: un unico servidor con --enable-lora puede atender peticiones estandar con el modelo base y peticiones sin filtro con el adaptador, seleccionando el comportamiento por peticion mediante el campo "model".
- Despliegue en hardware de consumo: el adaptador GGUF para llama.cpp se combina con el base en UD-Q4_K_XL, lo que permite ejecutar el conjunto en equipos con GPU de gama alta consumer (sujeto a los requisitos del base de 35B, no detallados).
- Experimentacion con cuantizacion: al ser compatible con W4A16-HGPTQ y GGUF, permite medir el impacto de la cuantizacion sobre la tasa de rechazo y la fidelidad del adaptador en distintos backends.

## Benchmarks y rendimiento

| Metrica | Modelo base | Adaptador por defecto |
|---|---|---|
| Rechazos en test[:100] (harmless_alpaca + harmful_behaviors) | 99/100 (99 %) | 11/100 (11 %) |
| Divergencia KL de primer token (harmless_alpaca test[:100]) | referencia | 0,2052 nats |

Frontera de Pareto publicada (subcarpetas pareto/):

| Checkpoint | Rechazos | Tasa | KL (nats) |
|---|---:|---:|---:|
| trial_014_ref11_kl0.2052 (por defecto) | 11/100 | 11,0 % | 0,2052 |
| trial_012_ref19_kl0.1629 | 19/100 | 19,0 % | 0,1629 |
| trial_011_ref27_kl0.1248 | 27/100 | 27,0 % | 0,1248 |
| trial_005_ref61_kl0.0839 | 61/100 | 61,0 % | 0,0839 |
| trial_004_ref76_kl0.0767 | 76/100 | 76,0 % | 0,0767 |
| trial_002_ref88_kl0.0629 | 88/100 | 88,0 % | 0,0629 |
| trial_001_ref94_kl0.0498 | 94/100 | 94,0 % | 0,0498 |
| trial_003_ref97_kl0.0386 | 97/100 | 97,0 % | 0,0386 |
| trial_006_ref99_kl0.0358 | 99/100 | 99,0 % | 0,0358 |

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el modelo base; el adaptador LoRA en BF16 ocupa aproximadamente 2 MB (1.044.480 parametros), por lo que el requisito dominante es el del checkpoint base.
- GPU recomendadas: no disponibles en la informacion proporcionada; dependen del modelo base Qwen3.6-35B-A3B.
- Cabe en GPU consumer: no disponible; el adaptador en si es despreciable, pero el base de 35B condiciona el requisito. La ruta GGUF con UD-Q4_K_XL esta pensada para facilitar el despliegue en hardware mas modesto.
- Opciones de despliegue: vLLM con --enable-lora --max-lora-rank 8, transformers + peft, llama.cpp (llama-server con --lora y -ngl 99).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de rechazo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Heretic-LoRA (este) | 1,04 M (adaptador) sobre base 35B-A3B | no disponible | 11 % (por defecto) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.6-35B-A3B (base) | 35B totales / 3B activos | no disponible | 99 % | Apache 2.0 | Hugging Face |
| Otros adaptadores Heretic sobre Qwen | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de capacidades que permitan comparar el rendimiento del modelo con alternativas de la misma categoria.

## Limitaciones y advertencias

- La abliteration elimina la tendencia a rechazar, pero no garantiza correccion ni seguridad en las respuestas; el modelo puede producir contenido danino, inexacto o sesgado.
- La divergencia KL de 0,2052 nats respecto al base implica cambios medibles en la distribucion de salida; pueden aparecer degradaciones sutiles en tareas generales no documentadas.
- No se han publicado evaluaciones de capacidades (razonamiento, codigo, matemticas, multilingue) ni comparaciones con el base en benchmarks estandar.
- Los idiomas soportados no estan documentados; se heredan del base pero sin confirmacion.
- La licencia Apache 2.0 permite uso comercial, pero el uso de un modelo sin filtros puede incumplir politicas de plataformas, terminos de servicio o normativa aplicable en determinados contextos.
- El modelo base Qwen3.6-35B-A3B no esta detallado en la informacion disponible; sus limitaciones de contexto, sesgos y requisitos de hardware se desconocen en esta ficha.
- La fecha de creacion indicada (2026-11-11) y las referencias a versiones Qwen3.5/3.6/3.8 en los tags no han podido verificarse con fuentes independientes.
- El adaptador tiene un unico like y 307 descargas, lo que indica una validacion comunitaria muy limitada; no se recomienda su uso en produccion sin evaluacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nchapman/Qwen3.6-35B-A3B-Heretic-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Checkpoint cuantizado mencionado: https://huggingface.co/nchapman/Qwen3.6-35B-A3B-W4A16-HGPTQ
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Dataset harmless_alpaca: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Dataset harmful_behaviors: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- GGUF del base para llama.cpp: https://huggingface.co/unsloth/Qwen3.6-35B-A3B-GGUF
