# kingjones777/LFM2.5-2.6B-ROCmFP4-LEAN-GGUF

## Resumen

LFM2.5-2.6B-ROCmFP4-LEAN-GGUF es una cuantizacion de 4 bits en formato ROCmFP4 del modelo LiquidAI/LFM2.5-2.6B, publicada por el usuario kingjones777. No se trata de un modelo nuevo, sino de una conversion del checkpoint original de Liquid AI a un formato tensor especifico (ftype 101, `Q4_0_ROCMFP4_LEAN`) que solo existe en el fork ROCmFPX de llama.cpp. El objetivo es ejecutar el modelo con aceleracion ROCm en hardware AMD Strix Halo, concretamente el Ryzen AI Max+ 395 con GPU integrada Radeon 8060S (gfx1151).

El modelo base pertenece a la familia LFM2 de Liquid AI, con arquitectura `lfm2`, 2.697.198.592 parametros y una ventana de contexto de 131.072 tokens. La cuantizacion reduce el peso a 1.559.078.944 bytes (1,45 GiB) mediante 166 tensores ROCmFP4, 99 tensores F32 y un unico tensor de embedding en Q5_K. El repositorio ocupa 1,6 GB en total.

La relevancia de esta ficha es practica: documenta el primer build ROCmFP4 de un checkpoint LFM2.5, con mediciones de throughput reales en Strix Halo (104,9 t/s en generacion corta, 103,1 t/s en una prueba de 512 tokens) y una advertencia importante sobre la decodificacion especulativa DSpark, que resulta contraproducente en este hardware y runtime. Es, por tanto, material de referencia para quien despliega modelos pequenos en equipos AMD con memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `lfm2` (familia LFM2 de Liquid AI) |
| Parametros totales | 2.697.198.592 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | ROCmFP4 (ftype 101, `Q4_0_ROCMFP4_LEAN`); embedding en Q5_K; tensores F32 |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (heredada del modelo base) |
| Formato de pesos | GGUF (266 tensores; histograma: ROCmFP4 x166, F32 x99, Q5_K x1) |
| Tamano del fichero | 1.559.078.944 bytes (1,45 GiB) |
| Tamano del repositorio | 1,6 GB |
| Runtime requerido | fork ROCmFPX de llama.cpp (stock llama.cpp no carga el formato) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 / Radeon 8060S / gfx1151 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base LFM2.5-2.6B de Liquid AI, identificada en el fichero GGUF como `lfm2`. La model card del build cuantizado no documenta detalles de entrenamiento (numero de tokens, composicion del dataset, fases de RLHF o DPO) ni innovaciones del modelo original; esa informacion corresponde al checkpoint `LiquidAI/LFM2.5-2.6B` y no aparece en la informacion disponible. Lo que si se documenta es que el modelo emplea estado recurrente: la propia model card menciona que llama.cpp reporta "recurrent state rollback is not compatible with 'draft-dspark'" y que la ruta de checkpoint no es bit-exacta para el estado recurrente de LFM2.

El proceso de conversion esta documentado con trazabilidad: partiendo de `LiquidAI/LFM2.5-2.6B` en la revision `a334ee78cd38458bb71eda24109ac42dcec1309d`, se convirtio a GGUF F16 con llama.cpp upstream en el commit `e85caa81ea2b65797396018c179b87ad61fa38ab`, y despues se cuantizo a ftype 101 con el fork ROCmFPX (rama `feature/dspark-v2`). La innovacion tecnica del build es el formato tensor ROCmFP4, un formato de runtime orientado a GPU AMD. Los tiers LEAN (101) y COHERENT (102) se diferencian unicamente en el tipo del token embedding (Q5_K frente a Q6_K); el resto de tensores es identico. Como el modelo ata su proyeccion de salida a `token_embd.weight`, no existe un `output.weight` separado que proteger.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y el modelo esta etiquetado como `conversational`.
- Modo thinking: la model card muestra una salida con marca `[Start thinking]` y el comando de Super Roc permite desactivarlo con `--think off` o activarlo por peticion mediante `chat_template_kwargs.enable_thinking`.
- Tool calling / function calling: la tabla de mediciones de Super Roc reporta 7/8 en tool calls tanto en modo "required" como en "auto", lo que indica soporte funcional de llamadas a herramientas.
- Contexto largo: ventana de 131.072 tokens, cargada y verificada en Super Roc ("Context loaded: 131072 tokens").
- Cache de prompt: se midio un segundo turno con 4.815 tokens cacheados de 4.854 de prompt.
- Generacion de codigo: se reporta una medida especifica de 108,2 t/s como media de dos prompts de codigo.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Vision y audio: no disponible; no se mencionan en la informacion.

## Casos de uso

- Inferencia local en equipos Strix Halo: el caso natural es ejecutar el modelo en un Ryzen AI Max+ 395 con memoria unificada, donde el fichero de 1,45 GiB y la ventana de 131.072 tokens caben holgadamente y permiten generacion a ~105 t/s. Es adecuado porque el build esta compilado especificamente para gfx1151 y ROCm.
- Servicio de chat con contexto largo: mediante Super Roc (`superroc serve ... --context 131072`) se puede exponer un endpoint compatible con la API de OpenAI y mantener conversaciones multi-turno con cache de prompt, tal como demuestra la medicion de 4.815 tokens cacheados en el segundo turno.
- Agentes con tool calling: los 7/8 aciertos en llamadas a herramientas en modo required y auto permiten integrar el modelo como planificador de agentes que invocan funciones externas, con un coste de latencia bajo gracias al throughput medido.
- Asistencia a la generacion de codigo en local: la medicion de 108,2 t/s en prompts de codigo lo hace util para autocompletado y generacion de fragmentos en entornos de desarrollo sin conexion a la nube.
- Razonamiento con modo thinking controlable: al poder activar o desactivar el modo thinking por peticion, sirve para tareas que requieren cadena de razonamiento (desactivandolo en consultas triviales para ahorrar tokens) y para tareas simples de respuesta directa.
- Despliegue via Lemonade: la model card documenta `lemonade pull LFM2.5-2.6B-ROCmFP4-LEAN` y `lemonade chat`, lo que permite integrarlo en un flujo de trabajo de escritorio con configuracion minima (`llamacpp.rocm_bin`).
- Evaluacion comparativa de formatos de cuantizacion: al ser el primer build ROCmFP4 de un checkpoint LFM2.5, sirve como referencia para medir el rendimiento de ROCmFP4 frente a k-quants estandar en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, perplejidad) en la informacion disponible. La model card indica explicitamente que la perplejidad no se publica para este build y que la evidencia de calidad se limita a una comprobacion de coherencia y a una auditoria a nivel de tensor. Se presentan a continuacion las mediciones de throughput documentadas.

| Medicion | Configuracion | Resultado |
|---|---|---|
| Generacion (corta) | `llama-cli -ngl 999 -fa on -c 512 -n 64 --temp 0 --seed 1234`, Ryzen AI Max+ 395, ROCm 7.13.0, 125 GB | 104,9 t/s |
| Generacion (larga) | `-c 2048 -n 512`, 3 repeticiones, sin drafter | 103,1 t/s |
| Generacion con DSpark | `--spec-type draft-dspark --spec-draft-n-max 8` | 83,4 t/s (-19,1%) |
| Longitud media aceptada (DSpark) | block size 9 | 2,58 tokens |
| DSpark en LFM2.5-1.2B | misma configuracion | -28,4% |
| DSpark en LFM2.5-8B-A1B | misma configuracion | -38,0% |
| Carga del modelo (Super Roc) | Super Roc 0.20.1, 128 GB | 1 s |
| Prompt tok/s (p1k) | Super Roc | 3082,1 |
| Prompt tok/s (p8k) | Super Roc | 2169,4 |
| Generacion tok/s (p1k) | Super Roc | 105,1 |
| Generacion tok/s (p8k) | Super Roc | 90,1 |
| Generacion de codigo | media de 2 prompts | 108,2 t/s |
| Tool calls (required / auto) | Super Roc | 7/8 / 7/8 |
| Cache de prompt turno 2 | Super Roc | 4815 / 4854 tokens |

## Requisitos de hardware

- VRAM / memoria: el fichero pesa 1,45 GiB; en el hardware de referencia se uso un equipo con 125-128 GB de memoria unificada. No se documenta una cifra minima de VRAM.
- GPU objetivo: AMD Radeon 8060S integrada en el Ryzen AI Max+ 395, arquitectura gfx1151, con ROCm 7.13.0.
- GPU alternativas: no disponible; no se documenta compatibilidad con A100, H100, RTX 4090 ni otras GPU. El formato ROCmFP4 esta orientado a AMD.
- Consumer GPU: si, en el sentido de que el hardware de referencia es un APU de consumo con GPU integrada; no se confirma funcionamiento en GPU de consumo de NVIDIA.
- Opciones de despliegue: fork ROCmFPX de llama.cpp (`llama-cli`), Super Roc (motor de inferencia local para Strix Halo, version 0.20.1) y Lemonade mediante `lemonade pull` y `lemonade chat`. Stock llama.cpp no carga el fichero.
- Latencia y throughput: generacion 103,1-105,1 t/s en contexto corto y 90,1 t/s en p8k; prefill 3082,1 t/s en p1k y 2169,4 t/s en p8k; carga en 1 s.
- Aceleracion especulativa: DSpark no debe usarse; reduce el throughput entre un 19,1% y un 38,0% segun el tamano del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| LFM2.5-2.6B-ROCmFP4-LEAN (este) | 2.697.198.592 | 131.072 | GGUF ROCmFP4 (ftype 101) | lfm1.0 | Solo ROCmFPX; 103-105 t/s en gfx1151 |
| LFM2.5-2.6B (LiquidAI, original) | 2.697.198.592 | no disponible en esta informacion | safetensors (checkpoint base) | lfm1.0 | Modelo de referencia sin cuantizar |
| Builds GGUF de terceros (LiquidAI, unsloth y otros) | 2.697.198.592 | no disponible en esta informacion | k-quants estandar | lfm1.0 | Cargables en llama.cpp stock; sin ROCmFP4 |
| LFM2.5-1.2B | no disponible | no disponible | no disponible | lfm1.0 | Medido con DSpark: -28,4% |
| LFM2.5-8B-A1B | no disponible | no disponible | no disponible | lfm1.0 | Medido con DSpark: -38,0% |

La model card afirma, tras comparar contenido de repositorios, que todos los builds publicos de este modelo usan k-quants estandar y que este es el primer build ROCmFP4. Esa comparacion es solo de contenido de repositorio: ningun build de terceros fue ejecutado ni medido en ese trabajo. No hay datos de rendimiento de calidad que permitan comparar este build con los k-quants en igualdad de condiciones.

## Limitaciones y advertencias

- Dependencia de un fork: el fichero solo se carga con el fork ROCmFPX de llama.cpp. Stock llama.cpp no lo reconoce, lo que limita portabilidad y soporte a largo plazo.
- DSpark es una perdida neta: la decodificacion especulativa con el speculator de LiquidAI reduce el throughput (-19,1% en 2.6B) y no es bit-exacta. El problema radica en el runtime: `lfm2.cpp` y `lfm2moe.cpp` no rellenan `t_layer_inp[]`, lo que provoca un aborto en `GGML_ASSERT(t_layer_inp[il] != nullptr)`; un parche de una linea (`res->t_layer_inp[il] = prev_cur;`) lo hace ejecutar, pero llama.cpp avisa de que el rollback de estado recurrente no es compatible con `draft-dspark` y cae en una ruta de checkpoint no bit-exacta, con divergencia reproducible 3/3 respecto a la salida greedy. Forzar `LLAMA_DFLASH_TARGET_LAYER_OFFSET=-1` empeora la longitud aceptada (2,22), confirmando la convencion `+1` del conversor.
- Calidad no medida: no hay perplejidad ni benchmarks de calidad publicados. La unica evidencia es una comprobacion de coherencia y una auditoria de tensores.
- Contexto largo no verificado: el comportamiento en la ventana completa de 131.072 tokens no fue probado, aunque el contexto se cargo correctamente en Super Roc.
- Idiomas: no se declara lista de idiomas soportados, por lo que el rendimiento multilingue es desconocido.
- Licencia: licencia `lfm1.0` (categoria "other"), heredada del modelo base. Es necesario revisar los terminos en el enlace de licencia antes de cualquier uso comercial; la model card no aclara las restricciones concretas.
- Sesgos y alucinacion: no se documenta nada al respecto en la informacion disponible; al ser una cuantizacion de 4 bits de un modelo de 2,6B, cabe esperar degradacion respecto al checkpoint original, aunque no se cuantifica.
- Adopcion muy baja: 3 descargas y 0 likes en el momento de la consulta, sin validacion de terceros.
- Trazabilidad de mediciones: los datos de throughput proceden del autor del repositorio y de su propio motor (Super Roc); no hay una evaluacion independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kingjones777/LFM2.5-2.6B-ROCmFP4-LEAN-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B/blob/main/LICENSE
- Fork ROCmFPX de llama.cpp: https://github.com/charlie12345/ROCmFPX
- llama.cpp upstream: https://github.com/ggml-org/llama.cpp
- Super Roc (motor de inferencia para Strix Halo): https://github.com/kingjones30/superroc
