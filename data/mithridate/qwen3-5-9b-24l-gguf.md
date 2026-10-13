# MIThridate/Qwen3.5-9B-24L-GGUF

## Resumen

Qwen3.5-9B-24L-GGUF es una suite de checkpoints GGUF experimentales derivados de Qwen/Qwen3.5-9B mediante poda heuristica de capas (layer pruning) aplicada directamente sobre el grafo binario del GGUF, sin reentrenamiento ni ajuste fino posterior. El autor es MIThridate (Valentin Spiridon, TSV Consulting SRL, Timisoara, Rumania) y el objetivo declarado es permitir inferencia local en GPU de gama baja con 4-6 GB de VRAM, como una GTX 1060 o una RTX 3050 Laptop, usando llama.cpp.

El modelo base Qwen3.5-9B emplea una arquitectura hibrida de bloques intercalados que alternan State-Space Model (Mamba-2) y atencion completa (GQA) en un patron 3:1 sobre un ciclo de 4 capas, con 32 capas y unos 9,46B de parametros. La variante agresiva de este repositorio recorta dos periodos completos de 4 capas (L12-L19), pasando de 32 a 24 capas y de ~9,46B a ~7,09B de parametros, lo que permite mantener todos los pesos residentes en VRAM de 4 GB sin paginacion a CPU. Existe tambien un corte conservador de 28 capas (elimina L16-L19) para GPUs de 6 GB.

Su relevancia es acotada y muy especifica: no es un modelo de produccion, sino una prueba de concepto para medir los limites fisicos de inferencia en hardware restringido y para reproducir experimentos de poda de capas sobre arquitecturas hibridas. La propia model card advierte de degradacion inherente en razonamiento multi-paso, coherencia de contexto largo y logica de casos limite.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con bloques intercalados Mamba-2 (SSM) y atencion completa (GQA), patron 3:1 sobre ciclo de 4 capas |
| Parametros totales | ~7,1B (cortes de 24 capas) y ~8,3B (corte de 28 capas); metadatos safetensors del repo: 7.223.912.832 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible; los ejemplos de la model card usan `-c 2048` como configuracion de KV cache |
| Tipos de cuantizacion | Q4_K_M, Q3_K_M y SAMI-Q4 (mezcla); etiqueta `imatrix` |
| Idiomas soportados | en (ingles), ro (rumano) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (para llama.cpp) |
| Capas | 32 en el modelo base; 28 o 24 en los checkpoints podados |
| Tamano del repositorio | 17,9 GB (incluye los cuatro checkpoints) |
| Requiere | llama.cpp b11300 o superior |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B combina bloques de espacio de estados (Mamba-2) con bloques de atencion completa con Grouped Query Attention (GQA), intercalados en un patron 3:1 dentro de un ciclo de 4 capas. Esta mezcla busca reducir el coste de la atencion cuadratica en contextos largos manteniendo la capacidad de recuperacion de informacion de la atencion densa. El corte de 28 capas elimina exactamente un periodo completo (capas 16-19) para preservar la proporcion global entre recurrencia lineal y atencion densa; el corte de 24 capas elimina dos periodos (capas 12-19), reduciendo la profundidad total de 32 a 24.

No hay entrenamiento adicional: la poda es una ablacion heuristica ejecutada con la herramienta propia del autor, `sami_gguf_layer_pruner.py`, del repositorio `MIThriade/sami-surgical-pruner`, que opera directamente sobre el GGUF. Esto implica que no hubo destilacion, recuperacion de conocimiento, RLHF, DPO ni ajuste posterior a la cirugia de capas, y que los pesos de las capas supervivientes son los originales del modelo base. La model card describe el resultado como proof-of-concept exploratorio, no validado para produccion.

## Capacidades

- Generacion de texto conversacional de contexto corto, con estructura sintactica estable segun las pruebas de humo del autor.
- Extraccion de codigo estructurado y consultas factuales basicas mantenidas tras la poda.
- Soporte de ingles y rumano sin bucles de salida infinitos en las pruebas cualitativas realizadas.
- Inferencia cuantizada en formato GGUF mediante llama.cpp (`llama-cli`, `llama-server`).
- Compatibilidad declarada con endpoints (`endpoints_compatible` en las etiquetas del repositorio).
- Tool calling / function calling: no documentado en la informacion disponible.
- Modo de razonamiento explicito (thinking mode): no documentado.
- Vision, audio u otras modalidades: no documentado; el pipeline declarado es text-generation.

## Casos de uso

- Benchmarking de hardware de gama baja: permite medir tokens por segundo y consumo real de VRAM en una GTX 1060 6GB o una RTX 3050 Laptop con los cuatro perfiles de cuantizacion disponibles, comparando el corte de 28 capas frente a los de 24.
- Pruebas de estres del techo de VRAM: el checkpoint de 24 capas en SAMI-Q4 ocupa ~3,92 GB con contexto de 2k, lo que sirve para validar configuraciones que deban caber integras en 4 GB sin paginacion a CPU.
- Asistente de texto offline en equipos sin GPU dedicada de gama alta: al ser GGUF y requerir llama.cpp, puede desplegarse en portatiles o mini-PC con GPU integrada o dedicada modesta para generacion de texto local sin conexion.
- Generacion y extraccion de codigo en utilidades de desarrollo locales: la model card reporta extraccion de codigo estructurado estable, adecuada para tareas de autocompletado o reformateo en entornos de desarrollo aislados.
- Investigacion reproducible sobre poda de capas: el script `sami_gguf_layer_pruner.py` es publico y permite reproducir los cortes de 28 y 24 capas o adaptarlos a otras arquitecturas hibridas, lo que resulta util para estudiar el impacto de la ablacion de profundidad.
- Docencia y divulgacion sobre cuantizacion y hardware: sirve para demostrar de forma tangible la relacion entre numero de capas, cuantizacion, VRAM y velocidad de generacion en una practica de laboratorio.
- Prototipado conversacional en ingles o rumano: para demos de chatbot de contexto corto donde no se requiera razonamiento multi-paso ni coherencia a largo plazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay datos de MMLU, HumanEval, GSM8K ni similares). Lo unico medido por el autor son pruebas de humo cualitativas y cifras de velocidad de generacion y VRAM sobre un equipo Intel i5-8400 con NVIDIA GTX 1060 6GB:

| Checkpoint | Capas | Parametros | Cuantizacion | Tamano de fichero | VRAM activa (ctx 2k) | Velocidad (GTX 1060) |
|---|---|---|---|---|---|---|
| Qwen3.5-9B-28L-Q4_K_M.gguf | 28 / 32 | ~8,3B | Q4_K_M | 4,81 GB | ~4,20 GB | ~18,0 tok/s |
| Qwen3.5-9B-24L-SAMI-Q4_K_M.gguf | 24 / 32 | ~7,1B | SAMI-Q4 (mixta) | 4,06 GB | ~3,92 GB | ~21,5 tok/s |
| Qwen3.5-9B-24L-Q4_K_M.gguf | 24 / 32 | ~7,1B | Q4_K_M | 4,31 GB | ~4,11 GB | ~20,8 tok/s |
| Qwen3.5-9B-24L-Q3_K_M.gguf | 24 / 32 | ~7,1B | Q3_K_M | 3,53 GB | ~3,46 GB | ~17,7 tok/s |

## Requisitos de hardware

- VRAM estimada: ~3,46 GB para el corte de 24 capas en Q3_K_M, ~3,92 GB para 24 capas en SAMI-Q4, ~4,11 GB para 24 capas en Q4_K_M y ~4,20 GB para 28 capas en Q4_K_M, todas con contexto de 2k tokens.
- GPU verificadas por el autor: NVIDIA GTX 1060 6GB e RTX 3050 Laptop. Las etiquetas del repositorio mencionan objetivos de GPU de 4 GB y 6 GB.
- Cabe en GPU de consumo: si, en tarjetas con 4 GB o mas de VRAM (por ejemplo GTX 1650, RTX 3050, GTX 1060), siempre que se elija el checkpoint adecuado al presupuesto de memoria.
- Despliegue: llama.cpp b11300 o superior, mediante `llama-server` (con `-ngl 99`, `-c 2048`, `-t 4`) o `llama-cli`. Otros runners compatibles con GGUF no estan documentados en la model card.
- Latencia y throughput: entre 17,7 y 21,5 tok/s en GTX 1060 6GB con todas las capas en GPU; el mejor valor corresponde al corte agresivo de 24 capas en SAMI-Q4.
- No hay datos de rendimiento para vLLM, TGI, Ollama ni para GPUs de centro de datos (A100, H100) en la informacion disponible.

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos publicos comparables de poda de capas sobre la misma base. La comparacion factible es interna a la propia familia, usando los datos de la model card:

| Version | Capas | Parametros | Cuantizacion | Tamano | VRAM (ctx 2k) | Velocidad (GTX 1060) | Licencia |
|---|---|---|---|---|---|---|---|
| Qwen/Qwen3.5-9B (base) | 32 | ~9,46B | original (no GGUF) | no disponible | no disponible | no disponible | apache-2.0 |
| 28L (conservador) | 28 | ~8,3B | Q4_K_M | 4,81 GB | ~4,20 GB | ~18,0 tok/s | apache-2.0 |
| 24L SAMI-Q4 (agresivo) | 24 | ~7,1B | SAMI-Q4 mixta | 4,06 GB | ~3,92 GB | ~21,5 tok/s | apache-2.0 |
| 24L Q4_K_M | 24 | ~7,1B | Q4_K_M | 4,31 GB | ~4,11 GB | ~20,8 tok/s | apache-2.0 |
| 24L Q3_K_M | 24 | ~7,1B | Q3_K_M | 3,53 GB | ~3,46 GB | ~17,7 tok/s | apache-2.0 |

El corte de 28 capas conserva mas profundidad semantica y estructura de atencion, mientras que los de 24 capas ganan en velocidad y reducen el consumo de VRAM a costa de degradar razonamiento multi-paso y coherencia de contexto largo.

## Limitaciones y advertencias

- Modelo experimental: la model card lo describe explicitamente como proof-of-concept no validado para produccion ni certificado para empresa.
- Poda sin reentrenamiento: las capas se eliminaron del grafo GGUF sin ajuste posterior, por lo que se espera degradacion en razonamiento multi-paso, coherencia de contexto largo y logica de casos limite.
- Riesgo de fallos observables: el autor pide reportar bucles de repeticion, ruptura sintactica y picos de perplejidad en la pestana de Discussions, lo que indica que son fallos esperables.
- Contexto: los ejemplos usan 2048 tokens; no hay datos publicados sobre la longitud de contexto nativa soportada tras la poda.
- Idiomas: solo se declaran ingles y rumano. No hay soporte documentado de castellano ni de otros idiomas, y la degradacion de la poda puede afectar mas a idiomas poco representados.
- Alucinacion: no hay evaluacion de fidelidad factual; al ser un modelo podado de ~7B en cuantizacion de 3-4 bits, el riesgo de invencion de datos es alto para uso informativo.
- Licencia: apache-2.0, que permite uso comercial, pero hereda las condiciones del modelo base Qwen/Qwen3.5-9B, por lo que conviene revisar la licencia original antes de un despliegue comercial.
- Adopcion muy baja: 746 descargas y 1 like en el momento de la consulta, sin validacion independiente de la comunidad.
- Discrepancia de parametros: los metadatos safetensors del repositorio indican 7.223.912.832 parametros, mientras que la model card cifra los cortes de 24 capas en ~7,1B; conviene verificar el checkpoint concreto antes de dimensionar hardware.
- Repositorio de 17,9 GB: agrupa cuatro checkpoints, por lo que hay que descargar solo el fichero GGUF necesario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MIThridate/Qwen3.5-9B-24L-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de la herramienta de poda: https://github.com/MIThriade/sami-surgical-pruner (script `sami_gguf_layer_pruner.py`)
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- llama.cpp: https://github.com/ggml-org/llama.cpp
- La busqueda web realizada no ha devuelto enlaces relevantes sobre este modelo; los resultados obtenidos no guardan relacion con la ficha.
