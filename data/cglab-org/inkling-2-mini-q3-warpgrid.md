# cglab-org/Inkling-2-Mini-Q3-warpgrid

## Resumen

Inkling-2-Mini-Q3-warpgrid es una cuantizacion hibrida de 3,25 bits por peso (bpw) del modelo `thinkingmachines/Inkling-2-Mini`, publicada por el usuario `cglab-org`. El modelo base es una arquitectura MoE (mixture of experts) con capacidad de vision y un diseno de capas recurrentes ("loop") que el autor etiqueta como `inkling2_loop`. Esta version reduce el peso en disco de 18,0 GiB a 12,85 GiB mediante un esquema mixto de cuantizacion de grupo 64 (`18×Q3_G64 + 6×Q2_G64`) y elimina la torre de vision, ya que el motor de inferencia objetivo (`warpgrid`) es solo texto.

La relevancia de esta ficha reside en que el autor ha optimizado el modelo especificamente para Macs Apple Silicon de 16 GB (por ejemplo, un Mac mini M4 con 11,84 GiB de memoria de trabajo GPU). Segun la model card, la cuantizacion conserva el 93,8% de la capacidad de codigo del original (90,0% frente a 96,0% en HumanEval Pass@1 sobre 50 problemas) y produce una salida identica token a token en el test Canary `323`. El motor `warpgrid` es un binario C++20/Metal independiente que no requiere Python, PyTorch ni MLX.

El contexto maximo y el numero de parametros del modelo base no se detallan en la informacion proporcionada; la model card solo menciona una ventana de servicio de 2.048 tokens (`--max-seq-len 2048`) en las pruebas de rendimiento. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con capas recurrentes ("loop"); cuantizacion hibrida `18×Q3_G64 + 6×Q2_G64` |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (probado con `--max-seq-len 2048`) |
| Tipos de cuantizacion | Q3_G64 asimetrico (3,5 bpw) en 18 capas MoE; Q2_G64 asimetrico (2,5 bpw) en 6 capas MoE; atencion, controladores, embeddings, normas y router en precision original (proyecciones densas en W8A16 FP8 E4M3 al cargar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con layout propietario (`*_q3_lo`, `*_q3_hi`, `*_q3_scale`, `*_q3_min`, `*_q2_weight`, `*_q2_scale`, `*_q2_min`); no es GGUF |

## Arquitectura y entrenamiento

El modelo base es un MoE con un diseno de capas recurrentes ("loop") que el autor divide en preludio (`L0–L5`), entrada/mitad/salida del bucle (`L6`, `L11–L12`, `L15–L17`) y coda (`L18–L23`). La cuantizacion protege las capas del preludio y de la coda con Q3_G64 (3,5 bpw) y comprime a Q2_G64 (2,5 bpw) las seis capas interiores del bucle (`L7–L10`, `L13–L14`). Las capas `L20–L23` estaban originalmente en MXFP8. La torre de vision (`model.vision.*`) se ha eliminado, ahorrando aproximadamente 1,1 GiB en disco.

El proceso de cuantizacion usa una matriz de activacion (`imatrix`) de 8.192 tokens de codigo y documentacion sobre las proyecciones `w13`, combinada con refinamiento alternado de Lloyd-Max. El layout Q3 usa un esquema bit-split `2+1` (16 B de 2 bits bajos + 8 B de 1 bit alto + 2 B de escala FP16 + 2 B de minimo FP16 = 28 B por 64 pesos). No se detallan en la informacion proporcionada los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, RLHF/DPO).

## Capacidades

- Generacion de texto y razonamiento: el modelo base es de tipo text-generation; la cuantizacion conserva el comportamiento del original en el test Canary `323` (identico token a token).
- Generacion de codigo: 90,0% de Pass@1 en los primeros 50 problemas de HumanEval, con decodificacion greedy (`temperature=0.0`, `max_tokens=2048`).
- Capacidad de vision: eliminada en esta version (torre de vision descartada).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Decodificacion especulativa: compatible con DFlash 2 (`k=6`) a traves del motor `warpgrid`, con una tasa de aceptacion del 61,3% y `mean_a = 4,65 tok/step` en codigo Python.

## Casos de uso

- Inferencia local en Macs de 16 GB: el modelo esta disenado para un Mac mini M4 con 11,84 GiB de memoria de trabajo GPU; con `warpgrid` alcanza 20,64 tok/s en bruto y 13,40 GiB de huella pico, por lo que es viable en hardware consumer de gama alta sin GPU dedicada.
- Asistente de codigo en local: con 90,0% de Pass@1 en HumanEval (50 problemas) y 25,45 tok/s con DFlash 2 en tareas de Python, es adecuado para autocompletado y generacion de funciones en un entorno de desarrollo sin conexion.
- Prototipado y experimentacion con MoE cuantizados: el layout documentado (Q3 bit-split y Q2 de grupo 64) permite estudiar el impacto de la cuantizacion mixta en modelos con capas recurrentes, comparando contra el original de 18 GiB.
- Servicio de texto con contexto moderado: el motor `warpgrid` expone un servidor en el puerto 8888 con `--max-slots 1 --max-seq-len 2048`, util para tareas de generacion de texto de hasta 2.048 tokens en una sola sesion.
- Evaluacion de decodificacion especulativa: la integracion con DFlash 2 (`k=6`) permite medir la ganancia de throughput (+58% frente a `llama-server` en codigo Python) en hardware Apple Silicon.
- Despliegue sin dependencias de Python: al ser un binario C++20/Metal, encaja en entornos donde no se quiere instalar PyTorch, MLX ni el stack de Python, simplificando el empaquetado y la distribucion.

## Benchmarks y rendimiento

Resultados de HumanEval Pass@1 sobre los primeros 50 problemas de `openai/openai_humaneval`, decodificacion greedy:

| Modelo | Tamano en disco | HumanEval Pass@1 (50) | Retencion de codigo | Canary `323` |
|---|---:|---:|---:|---|
| Original (`NVFP4/MXFP8`) | 18,0 GiB | 48/50 (96,0%) | 100,0% | Baseline |
| Q3 (`18×Q3_G64 + 6×Q2_G64`, este modelo) | 12,85 GiB | 45/50 (90,0%) | 93,8% | Identico token a token |

Rendimiento en un Apple M4 Mac mini de 16 GB (99,22 GB/s), sin contencion, con `--max-slots 1 --max-seq-len 2048`:

| Configuracion | Throughput | Huella pico | Notas |
|---|---:|---:|---|
| `llama-server` (`UD-IQ2_XXS.gguf`, 7,9 GiB) | 16,1 tok/s | — | Baseline (14 formatos GGML) |
| `warpgrid` Q3 (bruto) | 20,64 tok/s | 13,40 GiB | Canary `323` exacto (48,46 ms/tok) |
| `warpgrid` Q3 + DFlash 2 (`k=6`, Canary `323`) | 20,65 tok/s | 13,76 GiB | `mean_a = 4,00`, ~2,19 GiB de paginas libres |
| `warpgrid` Q3 + DFlash 2 (`k=6`, codigo Python) | 25,45 tok/s | 13,76 GiB | +58% frente a `llama-server`, `mean_a = 4,65 tok/step` (61,3% de aceptacion) |

No se han publicado resultados de benchmarks adicionales (MMLU, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 13,40 GiB de huella pico en inferencia bruta y 13,76 GiB con DFlash 2 en un Mac de 16 GB; el autor indica que encaja en 16 GB de Apple Silicon (11,84 GiB de memoria de trabajo GPU).
- GPU recomendadas: Apple Silicon de 16 GB (probado en Mac mini M4); no se documentan requisitos para GPU NVIDIA o AMD.
- Compatibilidad con GPU consumer: si, en Macs Apple Silicon de 16 GB; no hay datos para RTX 4090 u otras GPU consumer.
- Opciones de despliegue: motor `warpgrid` (C++20/Metal, compilado con `make -j`); tambien existe un `UD-IQ2_XXS.gguf` de 7,9 GiB ejecutable con `llama-server` como baseline.
- Latencia y throughput: 48,46 ms/token en bruto (20,64 tok/s); 25,45 tok/s con DFlash 2 en codigo Python; 20,65 tok/s con DFlash 2 en el test Canary.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval Pass@1 (50) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-Q3-warpgrid | no disponible | no disponible (probado a 2048) | 90,0% | Apache 2.0 | Hugging Face (13,8 GB) |
| Inkling-2-Mini (original, NVFP4/MXFP8) | no disponible | no disponible | 96,0% | no disponible | Hugging Face (`thinkingmachines/Inkling-2-Mini`) |
| `UD-IQ2_XXS.gguf` (baseline de 7,9 GiB) | no disponible | no disponible | no disponible | no disponible | Referenciado en la model card |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La torre de vision se ha eliminado: el modelo no procesa imagenes, solo texto.
- La cuantizacion agresiva (Q2_G64 en seis capas del bucle) reduce la calidad: se pierde un 6,2% de retencion en codigo frente al original (90,0% frente a 96,0% en HumanEval).
- El formato de pesos es propietario y solo lo consume el motor `warpgrid`; no es GGUF estandar ni safetensors convencional, lo que limita su uso con vLLM, TGI, Ollama u otros runners.
- El contexto maximo del modelo base no se documenta; las pruebas se hicieron con `--max-seq-len 2048`, por lo que el rendimiento con contextos mayores no esta verificado.
- No hay informacion sobre sesgos, riesgo de alucinacion ni comportamiento multilingue en la informacion proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero el autor no detalla restricciones adicionales del modelo base; conviene verificar la licencia de `thinkingmachines/Inkling-2-Mini`.
- El modelo se ha validado en un unico dispositivo (Mac mini M4 de 16 GB); el rendimiento en otro hardware Apple Silicon no esta documentado.

## Enlaces

- Hugging Face: https://huggingface.co/cglab-org/Inkling-2-Mini-Q3-warpgrid
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Modelo de decodificacion especulativa DFlash 2: https://huggingface.co/incoai/Inkling-2-Mini-DFlash2
- Dataset de evaluacion: https://huggingface.co/datasets/openai/openai_humaneval
