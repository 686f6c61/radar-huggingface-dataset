# existentialbirds/Inkling-2-Mini-DSpark-mlx-vlm-4bit

## Resumen

Inkling-2-Mini-DSpark-mlx-vlm-4bit es un modelo borrador (*drafter*) de decodificacion especulativa extraido del modelo base `thinkingmachines/Inkling-2-Mini` y publicado por el usuario existentialbirds. No es un modelo generativo autonomo: es un artefacto auxiliar de 317,9 millones de parametros (247 MiB en disco) que se ejecuta junto al modelo objetivo cuantizado a 4 bits `existentialbirds/Inkling-2-Mini-mlx-vlm-4bit` para acelerar la inferencia mediante la tecnica DSpark con `draft-kind dflash`. El autor lo ha extraido del fichero `mtp.safetensors` del checkpoint original (commit `c9d028302cd0f035fdf8e7e91f089a4ce94d2195`) y ha convertido sus tres capas transformer a cuantizacion afin de 4 bits con `group_size=64`.

La relevancia de esta publicacion es practica: demuestra como un modelo multimodal pequeno puede beneficiarse de decodificacion especulativa en hardware Apple Silicon mediante la libreria `mlx-vlm`. El autor reporta en su model card una mejora de rendimiento de 46,5 tok/s a 54,3 tok/s en generacion de codigo Python con temperatura 0,6 sobre un Apple M4 Max de 48 GB, aunque con un coste claro en dominios de mayor entropia (prosa o batches de `c4`), donde recomienda desactivar el borrador.

El modelo esta bajo licencia Apache 2.0, pero hereda las restricciones de uso aceptable del modelo base de Thinking Machines Lab. Solo declara soporte para ingles y su formato de pesos es safetensors en el esquema `inkling2_dspark` de `mlx-vlm`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer DSpark (3 capas) como borrador de decodificacion especulativa, `model_type: inkling2_dspark` |
| Parametros totales | 317.897.872 (247 MiB en disco) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo objetivo) |
| Tipos de cuantizacion | 4-bit affine con `group_size=64` en las 3 capas transformer; `markov_head.*` en precision original |
| Idiomas soportados | en |
| Licencia | apache-2.0 (sujeta a la politica de uso aceptable de Thinking Machines Lab) |
| Formato de pesos | safetensors (mlx-vlm) |

## Arquitectura y entrenamiento

El artefacto es un borrador de decodificacion especulativa basado en DSpark, con tres capas transformer cuantizadas a 4 bits afin (`group_size=64`). No se ha reentrenado: se ha extraido del tensor `mtp.safetensors` del modelo `thinkingmachines/Inkling-2-Mini` y se ha reconvertido al esquema `inkling2_dspark` de `mlx-vlm`. En tiempo de ejecucion comparte embeddings y `lm_head` con el modelo objetivo, lo que explica que sus 317,9 millones de parametros se reduzcan a 247 MiB en disco. La cabeza `markov_head.*` se mantiene en su precision original (el autor indica una reduccion de 635,8 MB a 247 MiB tras la cuantizacion).

El mecanismo de aceleracion es la decodificacion especulativa con `draft-kind dflash`: el borrador propone bloques de tokens que el modelo objetivo verifica en paralelo. El autor recomienda `--draft-block-size 5` (unos 57 ms por ronda, con umbral de rentabilidad de 2,48 tokens por ronda) en lugar de 8 (unos 100 ms por ronda, umbral de 4,35), para limitar el crecimiento de la union de expertos enrutados a lo largo de las 48 visitas al modelo objetivo. Tambien sugiere `--prefill-step-size 512`. No se dispone de informacion sobre el dataset de entrenamiento del borrador ni sobre el proceso de alineacion del modelo base.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa junto al modelo objetivo `Inkling-2-Mini-mlx-vlm-4bit`.
- Verificacion por bloques de tamano configurable (`--draft-block-size`), con tamano 5 recomendado en Apple M4 Max.
- Integracion en el servidor `mlx_vlm.server` mediante los parametros `--draft-model`, `--draft-kind dflash` y `--prefill-step-size`.
- No es un modelo autonomo: no genera respuestas por si mismo ni soporta tool calling, agentes, vision o audio de forma independiente.
- Las capacidades multimodales, de razonamiento y multilingues dependen exclusivamente del modelo objetivo.
- Idioma declarado: ingles (heredado del modelo base).

## Casos de uso

- Aceleracion de inferencia de codigo en local: con el modelo objetivo en 4 bits y el borrador activado, el autor mide 54,3 tok/s frente a 46,5 tok/s sin borrador en generacion de Python a temperatura 0,6 sobre un M4 Max de 48 GB, lo que lo hace util para asistentes de codigo en estaciones de trabajo Apple Silicon.
- Servidor de inferencia `mlx-vlm` en macOS: se arranca con `mlx_vlm.server --model ... --draft-model ... --draft-kind dflash --draft-block-size 5 --prefill-step-size 512 --port 8080`, de modo que cualquier cliente compatible con la API del servidor se beneficia de la aceleracion sin cambios en el codigo.
- Evaluacion de decodificacion especulativa: el autor lo ha medido con el framework Peregrine, por lo que sirve como referencia reproducible para comparar estrategias de borrador en hardware Apple.
- Prototipado de pipelines de generacion de codigo de baja latencia: el umbral de rentabilidad de 2,48 tokens por ronda con bloque 5 permite decidir dinamicamente si activar el borrador segun la entropia de la tarea.
- Experimentacion con cuantizacion 4-bit afin en MLX: el checkpoint documenta el efecto de cuantizar solo las capas transformer y mantener `markov_head.*` en precision original, util para quienes disenan sus propios borradores.
- Despliegue en equipos con memoria unificada limitada: al ocupar solo 247 MiB, el borrador cabe junto al modelo objetivo en configuraciones de 48 GB sin desplazar el presupuesto de memoria del modelo principal.

## Benchmarks y rendimiento

| Metrica | Sin borrador | Con borrador (bloque 5) | Entorno |
|---|---|---|---|
| Throughput en codigo Python (T=0,6) | 46,5 tok/s | 54,3 tok/s | Apple M4 Max, 48 GB |
| Throughput en batches `c4` | 93,3 tok/s | no recomendado (desactivar) | Apple M4 Max, 48 GB |
| Coste por ronda de borrador (bloque 5) | no aplica | ~57 ms | Apple M4 Max, 48 GB |
| Coste por ronda de borrador (bloque 8) | no aplica | ~100 ms | Apple M4 Max, 48 GB |
| Umbral de rentabilidad (bloque 5) | no aplica | 2,48 tokens/ronda | Apple M4 Max, 48 GB |
| Umbral de rentabilidad (bloque 8) | no aplica | 4,35 tokens/ronda | Apple M4 Max, 48 GB |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el artefacto es un borrador y no un modelo evaluable de forma independiente.

## Requisitos de hardware

- VRAM o memoria unificada para el borrador: 247 MiB en disco; en ejecucion comparte embeddings y `lm_head` con el modelo objetivo, por lo que el sobrecoste es minimo.
- Memoria total necesaria: la del modelo objetivo `Inkling-2-Mini-mlx-vlm-4bit` mas el borrador; el autor valida la configuracion en un Apple M4 Max con 48 GB de memoria unificada.
- GPU recomendadas: Apple Silicon con MLX (validado en M4 Max). No hay datos publicados para CUDA, A100, H100 ni RTX 4090, ya que la libreria es `mlx-vlm`.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente para el modelo objetivo; no aplica a GPU discretas por la dependencia de MLX.
- Opciones de despliegue: `mlx_vlm.server` con `--draft-model`, `--draft-kind dflash`, `--draft-block-size 5` y `--prefill-step-size 512`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~57 ms por ronda de borrador con bloque 5 y 54,3 tok/s en codigo Python a T=0,6 en M4 Max de 48 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| existentialbirds/Inkling-2-Mini-DSpark-mlx-vlm-4bit | 317,9 M | no disponible | Borrador especulativo DSpark para Inkling-2-Mini | apache-2.0 | Hugging Face, `mlx-vlm` |
| existentialbirds/Inkling-2-Mini-mlx-vlm-4bit | no disponible | no disponible | Modelo objetivo cuantizado 4-bit | apache-2.0 | Hugging Face, `mlx-vlm` |
| thinkingmachines/Inkling-2-Mini | no disponible | no disponible | Modelo base multimodal original | apache-2.0 | Hugging Face |

No se dispone de informacion sobre otros borradores DSpark comparables ni sobre sus metricas de rendimiento, por lo que la comparativa se limita a la familia Inkling-2-Mini.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo objetivo `existentialbirds/Inkling-2-Mini-mlx-vlm-4bit` y la libreria `mlx-vlm`; no funciona con vLLM, llama.cpp, Ollama ni TGI.
- Solo esta validado en Apple Silicon (M4 Max, 48 GB); no hay datos de rendimiento en otras plataformas.
- El borrador degrada el rendimiento en dominios de alta entropia: el autor recomienda desactivarlo en prosa y en batches `c4`, donde el modelo objetivo sin borrador alcanza 93,3 tok/s.
- El tamano de bloque 8 duplica aproximadamente el coste por ronda (~100 ms frente a ~57 ms) y eleva el umbral de rentabilidad a 4,35 tokens por ronda, por lo que no es recomendable en configuraciones por defecto.
- La cuantizacion 4-bit de las capas transformer puede introducir divergencias respecto al borrador original en precision completa; el autor no publica metricas de aceptacion por token.
- Idioma declarado unicamente ingles; el comportamiento multilingue depende del modelo objetivo.
- Licencia Apache 2.0 con obligacion de atribucion a Thinking Machines Lab, Inc. y sujeta a la politica de uso aceptable del modelo base; el uso comercial esta permitido pero condicionado a dicha politica.
- Riesgo de alucinacion y sesgos: no evaluado de forma independiente para este artefacto; hereda los del modelo base, cuyos detalles remite el autor a la model card original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/existentialbirds/Inkling-2-Mini-DSpark-mlx-vlm-4bit
- Modelo objetivo cuantizado: https://huggingface.co/existentialbirds/Inkling-2-Mini-mlx-vlm-4bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Framework de evaluacion Peregrine: https://github.com/existential-birds/peregrine
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Politica de uso aceptable de Thinking Machines Lab: https://thinkingmachines.ai/model-acceptable-use-policy/
- Documentacion de datos de entrenamiento: https://thinkingmachines.ai/training-data-documentation/
