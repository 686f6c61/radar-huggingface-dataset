# AJ-Gonzalez/rooster-coder-rwkv7-1.5b

## Resumen

rooster-coder-rwkv7-1.5b es un adaptador LoRA (PEFT) sobre el checkpoint base RWKV/RWKV7-G1k-1.5B-20260930, desarrollado por AJ-Gonzalez. El adaptador se ha entrenado mediante SFT sobre el perfil "coder" del corpus de razonamiento Qwen4 Max, con el objetivo de transferir a la arquitectura RWKV v7 el estilo de traza de razonamiento (`<think` ... `</think`) propio de los modelos Qwen4 Max en tareas de codigo y razonamiento tecnico. No se trata de un preentrenamiento nuevo, sino de un ajuste supervisado de bajo rango sobre un modelo base de 1.527.799.808 parametros.

La relevancia tecnica del artefacto no esta en el rendimiento del modelo (los datos publicados son diagnosticos de entrenamiento, no benchmarks), sino en el hecho de que demuestra el flujo completo de adaptacion y despliegue de RWKV v7 en tres formatos: adaptador PEFT, GGUF para llama.cpp (arquitectura `rwkv7`) y MLX 4-bit para Apple Silicon. El repositorio incluye los pesos fusionados en Q6_K, Q4_K_M y MLX 4-bit, ademas del adaptador original de 56,7 MB.

El modelo base es un transformer hibrido lineal de tipo RWKV (no attention cuadratica), con 1.500 millones de parametros, licencia Apache-2.0 y plantilla de chat propia. El adaptador se distribuye con la misma licencia y esta orientado exclusivamente a ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV v7 (recurrente lineal, `rwkv7` en llama.cpp) |
| Parametros totales | 1.527.799.808 (modelo fusionado) |
| Parametros activos | no disponible (no es MoE) |
| Parametros del adaptador LoRA | 14.155.776 (0,9183 % del total) |
| Longitud de contexto | no disponible en la informacion proporcionada; el entrenamiento usa secuencias de 2048 tokens |
| Tipos de cuantizacion | Q6_K (1,34 GB), Q4_K_M (990 MB), MLX 4-bit (4,972 bpw, 907 MB); adaptador LoRA en safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT), GGUF (llama.cpp), MLX (4-bit) |
| Modelo base | RWKV/RWKV7-G1k-1.5B-20260930 |
| Dataset de entrenamiento | AJ-Gonzalez/qwen4-max-reasoning-250x (perfil coder) |
| Tamano del repo | 3,3 GB |

## Arquitectura y entrenamiento

El modelo base es RWKV v7, una arquitectura recurrente lineal que sustituye la atencion cuadratica por un mecanismo de mezcla temporal (time-mix) con estado recurrente, lo que permite inferencia con coste lineal respecto a la longitud de secuencia. El adaptador LoRA se aplica sobre las proyecciones `receptance`, `key`, `value` y `output`; dado que el nombre `key`/`value` tambien coincide con las proyecciones del bloque FFN, el adaptador alcanza 14.155.776 parametros. La configuracion es r=16, alpha=32, dropout 0,05, `task_type=CAUSAL_LM`.

El entrenamiento se realizo sobre 70 filas del corpus qwen4-max-reasoning-250x (32 de `1_code`, 29 de `2_cs`, 9 de `4_stats`), con trazas generadas por `qwen/qwen4-max-20261115` via OpenRouter. Tras el troceado a 2048 tokens con solapamiento de 256, el split de entrenamiento contiene 356 chunks (667.970 tokens) y el de validacion 46 chunks (88.854 tokens). Se hicieron 3 epocas, batch 1 con acumulacion de gradiente 8, lr 1e-4, warmup 10, AdamW, gradient checkpointing y max sequence 2048. El entrenamiento se ejecuto deliberadamente en fp32 porque el checkpoint base es bf16-nativo y fp16 produjo logits NaN y `grad_norm: nan` desde el primer paso en una Tesla T4 (que no soporta bf16). El pico de memoria fue de 11,43 GiB y el tiempo total de 2,46 h para 135 pasos de optimizador en una unica T4.

La fusion del adaptador se realizo con un merge LoRA en streaming (escala 2,0) sobre el base en bf16, seguido de `convert_hf_to_gguf.py` de llama.cpp master. El GGUF resultante conserva los 678 tensores y las mismas formas que el GGUF base publicado, con los mapeos `att.ln1` -> `attn_norm`, `att.ln2` -> `attn_norm_2`, `att.ln_x` -> `time_mix_ln` y el apilado de los seis vectores `att.x_*` en `time_mix_lerp_fused`. En MLX, `att.ln_x` se mapea a `g_norm` tras reshape a `(heads, head_dim)` y se transpone las matrices de compuerta de bajo rango.

## Capacidades

- Generacion de codigo en Python y otros lenguajes, con estilo de traza de razonamiento previa (`<think` ... `</think`) heredado del corpus Qwen4 Max.
- Razonamiento tecnico en tareas de ciencias de la computacion (`2_cs`) y estadistica (`4_stats`), segun la composicion del dataset.
- Soporte de plantilla de chat con modo `thinking=True` en `apply_chat_template`.
- Generacion de texto autoregresiva con decodificacion greedy (`do_sample=False`, `temp=0`).
- Inferencia en llama.cpp mediante la arquitectura `rwkv7` y en Apple Silicon via MLX.
- Capacidad multilingue limitada al ingles.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible de forma verificada; el estilo de traza sugiere razonamiento paso a paso, pero no hay evaluacion publicada.
- Vision y audio: no soportados.

## Casos de uso

- Generacion de codigo asistida en local: el modelo puede ejecutarse en una GPU de consumo o en un portatil Apple Silicon usando los GGUF Q4_K_M (990 MB) o MLX 4-bit (907 MB), lo que permite autocompletado y generacion de funciones en entornos sin conexion.
- Prototipado de pipelines de razonamiento sobre arquitecturas lineales: sirve para validar el flujo completo (adaptador PEFT -> merge -> GGUF/MLX) en un modelo pequeno antes de escalar a variantes RWKV de mayor tamano.
- Educacion y demostraciones de RWKV v7: el repo incluye tokenizer, plantilla de chat y codigo remoto (`configuration_rwkv7.py`, `modeling_rwkv7.py`, `tokenization_rwkv7.py`) empaquetados junto al adaptador, lo que facilita su carga sin depender del repositorio base.
- Generacion de explicaciones tecnicas paso a paso: el adaptador ha sido entrenado para producir trazas de razonamiento en tareas de codigo, ciencias de la computacion y estadistica, util para generar documentacion explicativa de algoritmos.
- Evaluacion de tecnicas de cuantizacion en modelos recurrentes: los tres artefactos fusionados (Q6_K, Q4_K_M, MLX 4-bit) permiten comparar calidad y throughput de cuantizacion sobre la misma arquitectura.
- Inferencia de bajo coste en produccion: con 1.5B parametros y arquitectura lineal, el coste por token es inferior al de transformers cuadraticos del mismo tamano, adecuado para servicios con alta concurrencia y contexto moderado.
- Fine-tuning incremental sobre dominio propio: al ser un adaptador LoRA pequeno (56,7 MB), se puede reentrenar o combinar con otros adaptadores sin tocar los pesos base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor indica explicitamente que no se ejecuto una evaluacion antes/despues y que no se reclama ningun delta. Los unicos datos publicados son diagnosticos de entrenamiento y medidas de throughput en hardware concreto:

| Metrica | Valor |
|---|---|
| Train loss | 1,6735 |
| Eval loss (46 chunks) | 1,9399 |
| NLL en 20 enunciados SWE-bench | 1,7227 (perplejidad 5,60; 15.427 tokens) |
| Prompt throughput Q6_K GGUF (M1 Air, greedy) | 173,6 t/s |
| Generacion Q6_K GGUF (M1 Air, greedy) | 32,0 t/s |
| Prompt throughput Q4_K_M GGUF (M1 Air, greedy) | 173,8 t/s |
| Generacion Q4_K_M GGUF (M1 Air, greedy) | 36,1 t/s |
| Prompt throughput MLX 4-bit (M1 Air, greedy) | 19,6 t/s |
| Generacion MLX 4-bit (M1 Air, greedy) | 46,0 t/s |
| Pico de memoria MLX 4-bit | 1,076 GB |

Estas cifras son pruebas de humo (smoke tests), no benchmarks comparativos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0-1,5 GB para GGUF Q4_K_M y MLX 4-bit; alrededor de 1,4-1,8 GB para Q6_K; el adaptador PEFT en fp32 requiere cargar el base completo (unos 6 GB en fp32, 3 GB en bf16) mas el adaptador.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para los formatos cuantizados; Tesla T4, RTX 3060/4090, A100 y H100 son validas. El entrenamiento del adaptador se realizo en una unica Tesla T4 con 11,43 GiB de pico.
- Cabe en GPU de consumo: si, en RTX 3060 (12 GB), RTX 4060/4070/4090 y en Apple Silicon (M1 Air medido). Tambien en portatiles con 8 GB de RAM unificada usando MLX 4-bit.
- Opciones de despliegue: llama.cpp (`llama-cli` con arquitectura `rwkv7`), MLX (`mlx_lm`), y PyTorch con `transformers` + `peft` en fp32. No se menciona soporte verificado de vLLM, TGI ni Ollama en la informacion proporcionada.
- Latencia y throughput: en M1 Air con greedy, 32,0-46,0 t/s de generacion segun formato; 173,6-173,8 t/s de prompt en GGUF y 19,6 t/s en MLX. No hay mediciones en GPU publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| rooster-coder-rwkv7-1.5b | 1.527.799.808 | no disponible | Apache-2.0 | safetensors, GGUF, MLX | Adaptador coder sobre RWKV v7; sin benchmarks publicados |
| RWKV/RWKV7-G1k-1.5B-20260930 (base) | 1.527.799.808 | no disponible | Apache-2.0 | safetensors, GGUF | Checkpoint base sin ajuste de instrucciones; los GGUF existentes no incluyen este adaptador |
| Qwen2.5-Coder-1.5B | 1.500 millones | 32.768 tokens (segun ficha publica de Qwen) | Apache-2.0 | safetensors, GGUF | Alternativa transformer cuadratica con benchmarks publicados; no disponible en la informacion proporcionada para comparacion directa |
| SmolLM2-1.7B | 1.700 millones | 8.192 tokens (segun ficha publica) | Apache-2.0 | safetensors, GGUF | Alternativa transformer de tamano similar; no evaluada aqui |

La comparacion cuantitativa con alternativas no esta disponible porque el autor no publico benchmarks. La diferencia arquitectonica principal frente a Qwen2.5-Coder y SmolLM2 es el mecanismo de atencion lineal de RWKV v7, que reduce el coste de inferencia en secuencias largas a cambio de una menor madurez del ecosistema (menos soporte en frameworks y menos herramientas de evaluacion).

## Limitaciones y advertencias

- El checkpoint base no esta ajustado a instrucciones; el adaptador ensena el estilo de traza coder, no conversacion general.
- El corpus de entrenamiento es muy pequeno (70 filas, 667.970 tokens de entrenamiento). Se debe esperar la transferencia de estilo, no una mejora sustancial de capacidad.
- No hay benchmarks antes/despues ni evaluacion HumanEval; no se puede afirmar ninguna mejora medible sobre el base.
- La inferencia en fp16 de esta arquitectura es inestable (el autor reporta NaN en entrenamiento); se recomienda fp32 en PyTorch. Los GGUF y MLX fusionados evitan este problema.
- Los GGUF de RWKV7-G1k-1.5B ya publicados corresponden al modelo base y no contienen este adaptador; hay que usar los del repositorio del adaptador.
- Las trazas de razonamiento provienen de Qwen4 Max via OpenRouter y los prompts del corpus derivan de TeichAI/MiMo; se aplican los terminos de uso upstream ademas de la licencia Apache-2.0.
- Idioma limitado al ingles; no hay soporte verificado de castellano ni de otros idiomas.
- No hay informacion sobre sesgos, alucinacion o robustez en produccion; al ser un modelo de 1.5B, el riesgo de alucinacion en codigo y matematicas es alto y requiere validacion externa.
- El soporte de tool calling y agentes no esta verificado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion de la comunidad.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/AJ-Gonzalez/rooster-coder-rwkv7-1.5b
- Modelo base: https://huggingface.co/RWKV/RWKV7-G1k-1.5B-20260930
- Dataset de razonamiento: https://huggingface.co/datasets/AJ-Gonzalez/qwen4-max-reasoning-250x
- Dataset de SFT (Kaggle): https://www.kaggle.com/datasets/aliciajgonzalez/rooster-coder-rwkv7-sft-data
- Repositorio llama.cpp (conversion GGUF): https://github.com/ggml-org/llama.cpp
- Repositorio MLX: https://github.com/ml-explore/mlx
- Repositorio PEFT: https://github.com/huggingface/peft
