# kingjones777/LFM2.5-2.6B-ROCmFP4-COHERENT-GGUF

## Resumen

LFM2.5-2.6B-ROCmFP4-COHERENT-GGUF es una cuantizacion de 4 bits en formato ROCmFP4 del modelo base LiquidAI/LFM2.5-2.6B, publicada por el usuario kingjones777. No se trata de un modelo nuevo, sino de una distribucion de pesos optimizada para el hardware AMD Strix Halo (Ryzen AI Max+ 395, GPU Radeon 8060S, arquitectura gfx1151). El modelo base lo desarrolla Liquid AI y emplea la arquitectura `lfm2`, con 2.697.198.592 parametros totales.

La relevancia de esta publicacion es tecnica: el autor afirma que es la primera compilacion ROCmFP4 de cualquier checkpoint LFM2.5, un formato de tensor en tiempo de ejecucion que solo existe en el fork ROCmFPX de llama.cpp, no en la version upstream. El archivo pesa 1.593.894.944 bytes (1,48 GiB) y conserva la ventana de contexto de 131.072 tokens del modelo original.

El interes practico esta en el rendimiento medido sobre un Ryzen AI Max+ 395 con memoria unificada: 104,7 t/s en generacion con `llama-cli` y 103,1 t/s en una prueba de tres repeticiones, con velocidades de prompt de 3072,9 t/s a 1k tokens y 2172,9 t/s a 8k. Es, por tanto, una ficha de despliegue local para hardware AMD concreto mas que una propuesta de modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `lfm2` (Liquid AI LFM2.5) |
| Parametros totales | 2.697.198.592 |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | ROCmFP4 (ftype 102, `Q4_0_ROCMFP4_COHERENT`); embeddings en Q6_K; 99 tensores en F32; variante LEAN (ftype 101) identica salvo embedding en Q5_K |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (heredada del modelo base; etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF (266 tensores) |
| Tamano del archivo | 1.593.894.944 bytes (1,48 GiB) |
| Repositorio | 1,6 GB |
| Runtime requerido | fork ROCmFPX de llama.cpp (upstream no carga el formato) |
| Hardware objetivo | AMD Ryzen AI Max+ 395, Radeon 8060S, gfx1151 |

## Arquitectura y entrenamiento

El modelo base es LiquidAI/LFM2.5-2.6B, de arquitectura `lfm2`. La informacion disponible no detalla la composicion del dataset de entrenamiento, el numero de tokens ni si hubo fases de RLHF o DPO. Tampoco se especifica si la arquitectura incorpora componentes recurrentes o de atencion lineal; sin embargo, la model card menciona explicitamente "LFM2's recurrent state" y la incompatibilidad de `draft-dspark` con el rollback de estado recurrente, lo que confirma que el modelo mantiene estado recurrente entre pasos de decodificacion.

La innovacion destacable de esta publicacion no esta en los pesos, sino en el formato de cuantizacion y en el analisis del autor sobre decodificacion especulativa. El autor midio el especulador DSpark publicado por Liquid AI para este modelo y obtuvo una perdida neta de rendimiento: 83,4 t/s frente a 103,1 t/s sin drafter, un -19,1%, con longitud media aceptada de 2,58 sobre bloque de 9. Identifico dos causas en el runtime: `lfm2.cpp` y `lfm2moe.cpp` no rellenan `t_layer_inp[]`, lo que provoca un aborto en `GGML_ASSERT`, y tras parchearlo llama.cpp avisa de que el rollback de estado recurrente no es compatible con `draft-dspark`, cayendo a una ruta de checkpoint no bit-exact. El autor descarto un error de desfase en el mapeo de capas forzando `LLAMA_DFLASH_TARGET_LAYER_OFFSET=-1`, que empeoro la longitud aceptada a 2,22.

La conversion se realizo desde la revision `a334ee78cd38458bb71eda24109ac42dcec1309d` del modelo base a GGUF F16 con llama.cpp upstream en el commit `e85caa81ea2b65797396018c179b87ad61fa38ab`, y despues se cuantizo a ftype 102 con el fork ROCmFPX, rama `feature/dspark-v2`.

## Capacidades

- Generacion de texto conversacional, con plantilla de chat y modo de razonamiento activable por peticion mediante `chat_template_kwargs.enable_thinking`.
- Modo thinking: la salida de ejemplo muestra el bloque `[Start thinking]`, por lo que el modelo expone razonamiento explicito antes de la respuesta.
- Tool calling / function calling: la model card reporta 7/8 en llamadas requeridas y 7/8 en modo automatico sobre el banco de pruebas del autor.
- Soporte de contexto largo: 131.072 tokens cargados y verificados en el motor Super Roc, con cache de prompt (4815 tokens cacheados de 4854 en el segundo turno).
- Generacion de codigo: se midio a 106,3 t/s como media de dos prompts de codigo.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision y audio: no disponibles; la informacion no indica soporte multimodal.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo con Ryzen AI Max+ 395: el modelo cabe en 1,48 GiB y aprovecha la memoria unificada de 125-128 GB, permitiendo mantener conversaciones multi-turno con cache de prompt y contexto de hasta 131.072 tokens sin salir del equipo.
- Automatizacion de agentes con tool calling: los 7/8 aciertos en llamadas requeridas y automaticas lo hacen util para orquestar funciones en flujos de agente de un solo paso o cadenas cortas, siempre que se validen las llamadas en el codigo de la aplicacion.
- Generacion de codigo en local para entornos con restricciones de privacidad: a 106,3 t/s en prompts de codigo, resulta viable como autocompletado o generador de fragmentos en un IDE sin enviar codigo a la nube.
- Procesamiento de documentos largos: con 131.072 tokens de contexto y 2172,9 t/s de preprocesado a 8k, se puede usar para resumir o extraer informacion de expedientes extensos en una sola pasada.
- Prototipado e investigacion sobre cuantizacion ROCmFP4: el repositorio documenta histograma de tipos, procedencia de conversion y comparativas de decodificacion especulativa, lo que lo convierte en material de referencia para quien experimente con el fork ROCmFPX.
- Servicio HTTP local compatible con endpoints: la receta con `superroc serve` expone el modelo con nombre servido propio y contexto de 131.072, adecuado para integrarlo en herramientas internas que hablen la API de chat completions.
- Evaluacion de latencia en hardware AMD: las cifras de prompt y generacion a 1k y 8k permiten dimensionar aplicaciones interactivas en gfx1151 antes de comprometer infraestructura.

## Benchmarks y rendimiento

Rendimiento medido por el autor sobre Ryzen AI Max+ 395, Radeon 8060S (gfx1151), ROCm 7.13.0, 125 GB de memoria unificada, equipo inactivo:

| Prueba | Configuracion | Resultado |
|---|---|---|
| Generacion (`llama-cli`) | `-ngl 999 -fa on -c 512 -n 64 --temp 0 --seed 1234` | 104,7 t/s |
| Generacion (3 repeticiones) | `-c 2048 -n 512`, sin drafter | 103,1 t/s |
| Generacion con DSpark | `--spec-type draft-dspark --spec-draft-n-max 8` | 83,4 t/s (-19,1%) |
| Prompt tok/s (p1k) | Super Roc 0.20.1 | 3072,9 |
| Prompt tok/s (p8k) | Super Roc 0.20.1 | 2172,9 |
| Generacion tok/s (p1k) | Super Roc 0.20.1 | 103,17 |
| Generacion tok/s (p8k) | Super Roc 0.20.1 | 88,7 |
| Generacion de codigo | media de 2 prompts | 106,3 t/s |
| Tool calls (requeridas / automaticas) | Super Roc 0.20.1 | 7/8 / 7/8 |
| Carga del modelo | Super Roc 0.20.1 | 1 s |

Efecto de DSpark en las tres tallas de LFM2.5 segun el autor: -28,4% (1.2B), -19,1% (2.6B), -38,0% (8B-A1B).

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) ni perplejidad en la informacion disponible. El autor indica explicitamente que la perplejidad no se publica para esta compilacion y que el comportamiento en la ventana completa de 131.072 tokens no se probo.

## Requisitos de hardware

- VRAM estimada: 1,48 GiB de pesos; el modelo se ejecuta sobre memoria unificada, por lo que en Strix Halo se reserva desde el pool compartido de 125-128 GB.
- GPU objetivo: AMD Radeon 8060S integrada en Ryzen AI Max+ 395 (gfx1151). No hay datos de funcionamiento en A100, H100 ni RTX 4090, y el formato ROCmFP4 no esta soportado por llama.cpp upstream.
- GPU de consumo: no disponible; el formato esta ligado a ROCm y a gfx1151 segun la informacion del autor.
- Despliegue: fork ROCmFPX de llama.cpp (`llama-cli` con `-ngl 999 -fa on`), motor Super Roc (`superroc serve`) y Lemonade mediante `lemonade config set llamacpp.rocm_bin` y `lemonade pull`.
- Contexto maximo cargado: 131.072 tokens verificado en Super Roc 0.20.1.
- Latencia y throughput: 1 s de carga, 3072,9 t/s de prompt a 1k, 2172,9 t/s a 8k, 103,17 t/s de generacion a 1k y 88,7 t/s a 8k, con una sola peticion simultanea.
- Decodificacion especulativa: desaconsejada en este hardware; el drafter DSpark reduce el rendimiento un 19,1% y ademas requiere un parche en el runtime.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| kingjones777/LFM2.5-2.6B-ROCmFP4-COHERENT-GGUF | 2,70B | 131.072 | GGUF ROCmFP4 (ftype 102), 1,48 GiB | lfm1.0 | Solo fork ROCmFPX; 103,1 t/s en gfx1151 |
| LiquidAI/LFM2.5-2.6B | 2,70B | 131.072 (segun esta ficha) | safetensors (modelo base) | lfm1.0 | Referencia original; sin datos de rendimiento en esta informacion |
| Compilaciones GGUF de terceros de LFM2.5-2.6B (LiquidAI, unsloth y otros) | 2,70B | no disponible | GGUF k-quants estandar | lfm1.0 | Compatibles con llama.cpp upstream; el autor indica que ninguna usa ROCmFP4 |

No se dispone de datos de benchmarks de calidad que permitan comparar el rendimiento cognitivo frente a alternativas de la misma categoria. La comparacion disponible es de formato, compatibilidad de runtime y throughput en hardware concreto.

## Limitaciones y advertencias

- El archivo no carga en llama.cpp upstream: requiere el fork ROCmFPX, lo que limita la portabilidad y la cadena de mantenimiento.
- El formato ROCmFP4 esta orientado a gfx1151 (Ryzen AI Max+ 395, Radeon 8060S); no hay evidencia de funcionamiento en otras GPU AMD o NVIDIA.
- No se publica perplejidad ni resultados de benchmarks de calidad; la evidencia de coherencia se limita a una comprobacion cualitativa y a una auditoria a nivel de tensor.
- El comportamiento en la ventana completa de 131.072 tokens no se ha probado, solo la carga del contexto.
- La decodificacion especulativa DSpark es una perdida neta en este hardware y, ademas, la ruta de fallback no es bit-exact para el estado recurrente de LFM2, con divergencia reproducible 3/3 respecto a la salida greedy.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplican los riesgos habituales de un modelo de 2,6B en tareas de conocimiento factual.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se puede confirmar calidad en castellano.
- Licencia lfm1.0: es necesario revisar el texto completo en el enlace del modelo base antes de cualquier uso comercial, ya que la ficha la etiqueta como `other`.
- Las cifras de rendimiento provienen de un unico equipo inactivo y de una sola peticion simultanea; no hay datos de concurrencia ni de throughput agregado.
- El repositorio tiene 22 descargas y 0 likes en el momento de la consulta, con un unico publicador; conviene verificar la integridad de los pesos antes de usarlos en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kingjones777/LFM2.5-2.6B-ROCmFP4-COHERENT-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B/blob/main/LICENSE
- Fork ROCmFPX de llama.cpp: https://github.com/charlie12345/ROCmFPX
- llama.cpp upstream: https://github.com/ggml-org/llama.cpp
- Motor Super Roc: https://github.com/kingjones30/superroc
