# existentialbirds/Inkling-2-Mini-MTP-4bit

## Resumen

Inkling-2-Mini-MTP-4bit es un checkpoint standalone del cabezal de decodificacion especulativa (drafter) del modelo Inkling-2-Mini de Thinking Machines Lab, extraido, convertido y cuantizado por el usuario existentialbirds. No es un modelo generativo completo: es un drafter de tipo DSpark (block-diffusion) que se acopla en tiempo de ejecucion a una instancia cuantizada a 4 bits del modelo objetivo (`existentialbirds/Inkling-2-Mini-4bit`) para acelerar la decodificacion en `mlx-vlm` sobre hardware Apple Silicon.

El artefacto contiene unicamente las 3 capas transformer del drafter (con `hidden_size=2304` e `intermediate_size=9216`) mas una cabeza Markov recurrente (`markov_rank=256`), sumando 317.897.872 parametros y 247 MiB tras la cuantizacion afin a 4 bits con `group_size=64`. Comparte embeddings y `lm_head` con el modelo objetivo en tiempo de ejecucion, por lo que no puede usarse de forma autonoma.

Su relevancia es practica: documenta una receta reproducible de decodificacion especulativa sobre un MoE disperso (48 visitas, `top-8` de `128` expertos) y aporta mediciones concretas de throughput en Apple M4 Max con 48 GB. El modelo base del que deriva es un MoE de 48 visitas, lo que hace que el tamano de bloque del drafter afecte de forma no trivial al coste de verificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSpark block-diffusion transformer (3 capas) con cabeza Markov recurrente; drafter de decodificacion especulativa |
| Parametros totales | 317.897.872 |
| Parametros activos | no disponible (el drafter no es MoE; el modelo objetivo es un MoE de 48 visitas, `top-8` de `128` expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit afin (`group_size=64`) en las 3 capas del transformer; `markov_head.*` en precision nativa |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0.3 GB, checkpoint de 247 MiB) |

## Arquitectura y entrenamiento

El drafter es un transformer DSpark de 3 capas con `hidden_size=2304` e `intermediate_size=9216`, entrenado originalmente con `block_size=8` y con `target_layer_ids=[5, 23, 41, 48]`, es decir, toma estados intermedios de cuatro capas del modelo objetivo. Incorpora una cabeza Markov recurrente con `markov_rank=256` y un `rnn_hidden` que modela dependencias entre los tokens propuestos dentro del bloque. En tiempo de ejecucion comparte embeddings y `lm_head` con el modelo objetivo, de modo que el drafter solo aporta las capas de transformacion y la cabeza Markov.

La conversion se realizo con `mlx_vlm.convert -q --q-bits 4 --mtp`: cuantizacion afin a 4 bits con `group_size=64` sobre las tres capas del transformer, manteniendo `markov_head.*` en precision nativa (la proyeccion recurrente divide productos FP32 y pliega `hidden_out`). El peso total pasa de 635,8 MB (`mtp.safetensors` original) a 247 MiB. No se dispone de informacion sobre el dataset de entrenamiento del drafter ni sobre el uso de RLHF o DPO en esta informacion.

## Capacidades

- Generacion de tokens candidatos (drafting) para decodificacion especulativa por bloques, no generacion autonoma de texto.
- Propuesta de bloques de tokens verificables por el modelo objetivo, con `block_size` configurable en tiempo de servicio.
- Modelado de dependencias intra-bloque mediante cabeza Markov recurrente.
- Integracion con `mlx-vlm` como `--draft-model` con `--draft-kind dflash`.
- Aprovechamiento de estados intermedios de cuatro capas del modelo objetivo (`target_layer_ids=[5, 23, 41, 48]`).
- Soporte de tool calling, agentes, vision, audio o modo thinking: no disponible (corresponde al modelo objetivo, no al drafter).

## Casos de uso

- Aceleracion de inferencia de codigo en local: con `--draft-block-size 5` alcanza 54,3 tok/s en generacion de codigo Python a `T=0.6` frente a 46,5 tok/s sin drafter, lo que lo hace adecuado para asistentes de codigo en estaciones de trabajo Apple Silicon.
- Servicio de inferencia interactiva de baja temperatura: en tareas greedy o de baja entropia, el drafter reduce el coste por token verificado al proponer varios tokens por ronda.
- Despliegue en `mlx-vlm.server`: se arranca junto al modelo objetivo con `--draft-model`, `--draft-kind dflash`, `--draft-block-size 5` y `--prefill-step-size 512` en el puerto 8080.
- Experimentacion en decodificacion especulativa sobre MoE: sirve como banco de pruebas reproducible para medir el equilibrio entre tamano de bloque y expansion de la union de expertos activos.
- Evaluacion comparada de estrategias de drafting: el repositorio Peregrine incluye `ledger.jsonl` con ejecuciones A/B intercaladas entre `block_size=8`, `block_size=5` y controles autoregresivos en Apple M4 Max.
- Investigacion sobre cuantizacion de drafters: permite estudiar el impacto de cuantizar las capas del transformer a 4 bits manteniendo la cabeza Markov en FP32 sobre la tasa de aceptacion.

## Benchmarks y rendimiento

Mediciones del autor en Apple M4 Max con 48 GB, panel de 6 prompts:

| Configuracion | Latencia por ronda | Umbral de equilibrio (`a*`) | Throughput |
|---|---|---|---|
| `block_size=5` (1 ancla + 4 propuestas) | ~57 ms/ronda | 2,48 tokens/ronda | 54,3 tok/s (codigo Python, `T=0.6`) |
| `block_size=8` | ~100 ms/ronda | 4,35 tokens/ronda | no disponible |
| Sin drafter, `c1` | no disponible | no disponible | 46,5 tok/s |
| Sin drafter, `c4` | no disponible | no disponible | 93,3 tok/s |

`block_size=5` supera a `block_size=8` en un 79 % en el panel de 6 prompts. Para prosa muestreada de mayor entropia (`T >= 0.6`, `a ≈ 1,5-1,95`) o lotes concurrentes `c4`, la decodificacion autoregresiva sin drafter es mas rapida.

## Requisitos de hardware

- VRAM/unified memory estimada: el checkpoint ocupa 247 MiB; debe sumarse la del modelo objetivo `existentialbirds/Inkling-2-Mini-4bit` (no disponible en esta informacion).
- GPU recomendadas: Apple Silicon con memoria unificada; las mediciones publicadas corresponden a Apple M4 Max con 48 GB.
- Compatibilidad con GPU NVIDIA (A100, H100, RTX 4090): no disponible; el formato es MLX, no CUDA.
- Cabe en GPU de consumo: si, en equipos Apple Silicon; no aplica a GPU discretas por la dependencia de MLX.
- Despliegue: `mlx-vlm.server` con `--draft-model`, `--draft-kind dflash`, `--draft-block-size 5`, `--prefill-step-size 512`. vLLM, llama.cpp, Ollama y TGI no estan soportados segun la informacion disponible.
- Latencia y throughput: ~57 ms/ronda con `block_size=5`; 54,3 tok/s en codigo Python a `T=0.6`; 46,5 tok/s (`c1`) y 93,3 tok/s (`c4`) sin drafter.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| existentialbirds/Inkling-2-Mini-MTP-4bit | Drafter DSpark 4-bit | 317,9 M | no disponible | Apache 2.0 | Hugging Face, `mlx-vlm` |
| thinkingmachines/Inkling-2-Mini (`mtp.safetensors`) | Drafter DSpark precision original | no disponible (635,8 MB) | no disponible | Apache 2.0 | Hugging Face |
| existentialbirds/Inkling-2-Mini-4bit | Modelo objetivo MoE 4-bit | no disponible | no disponible | Apache 2.0 | Hugging Face, `mlx-vlm` |

No se dispone de datos de rendimiento de drafters alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo objetivo `existentialbirds/Inkling-2-Mini-4bit` cargado en `mlx-vlm`; no genera texto por si solo.
- Solo soporta ingles (`en`) segun los metadatos.
- Dependencia exclusiva de MLX y Apple Silicon; no hay soporte documentado para CUDA, vLLM, llama.cpp, Ollama o TGI.
- El rendimiento depende fuertemente de la entropia de muestreo: en prosa con `T >= 0.6` y en lotes concurrentes `c4` es mas lento que la decodificacion autoregresiva.
- El tamano de bloque optimo depende de la expansion de la union de expertos del MoE objetivo; `block_size=8` (valor de entrenamiento) resulta contraproducente en este modelo.
- Riesgo de sesgos y alucinaciones: heredado del modelo base; debe consultarse la model card de `thinkingmachines/Inkling-2-Mini`.
- Uso comercial permitido por Apache 2.0, pero sujeto a la Model Acceptable Use Policy de Thinking Machines Lab y a las obligaciones de atribucion de la seccion 6 y de modificaciones de la seccion 4(b).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay validacion comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/existentialbirds/Inkling-2-Mini-MTP-4bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Modelo objetivo cuantizado: https://huggingface.co/existentialbirds/Inkling-2-Mini-4bit
- Repositorio Peregrine: https://github.com/existential-birds/peregrine
- Plan de conversión y benchmarks: https://github.com/existential-birds/peregrine/blob/main/PLAN.md
- Registro de ejecuciones A/B: https://github.com/existential-birds/peregrine/blob/main/ledger.jsonl
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Documentacion de datos de entrenamiento: https://thinkingmachines.ai/training-data-documentation/
