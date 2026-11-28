# hletrd/gemma-4-31B-it-Tensix-BFP4-MLP

## Resumen

`hletrd/gemma-4-31B-it-Tensix-BFP4-MLP` es una cuantizacion del modelo multimodal `google/gemma-4-31B-it` orientada especificamente al hardware NPU de Tenstorrent (arquitecturas Tensix Wormhole y Blackhole). La publica el usuario `hletrd` a partir del trabajo de Xylolabs (`tensix-bfp-gptq`), y su proposito no es otro que reducir el peso del modelo de 61,39 GB en bf16 a 23,534 GB empaquetados, manteniendo la fidelidad respecto al original mediante un esquema mixto de block floating point: BFP4 para las proyecciones MLP y BFP8 para las proyecciones de atencion.

El modelo conserva la torre de vision y el `embed_vision` en bf16 sin tocar, por lo que sigue siendo un modelo image-text-to-text capaz de procesar imagenes y texto. Los tensores cuantizados se generaron con GPTQ y una busqueda de exponente por bloque para los BFP4, y con redondeo al mas cercano para los BFP8. El resultado es un checkpoint pensado para ejecutarse con `ttnn` sobre silicio Tenstorrent, aunque tambien es cargable con `transformers` en GPUs convencionales.

Su relevancia es doble: por un lado demuestra que es viable llevar un modelo de 32.682 millones de parametros a un NPU de 23,5 GB con una degradacion de calidad medida (KL media de 0,0600 frente a bf16, frente a 0,0517 de un Q4_K_M de llama.cpp); por otro, documenta de forma reproducible el pipeline de cuantizacion y empaquetado, algo poco habitual en checkpoints para hardware no-NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en `google/gemma-4-31B-it`; pesos reorganizados para Tensix |
| Parametros totales | 32.682.375.020 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en MLP gate/up/down; BFP8 (`bfloat8_b`) en atencion q/k/o y v; bf16 en LM head, embeddings, norms y torre de vision |
| Idiomas soportados | no disponible (la evaluacion uso texto en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 65,4 GB; 23,534 GB empaquetados para Tensix) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de Gemma 4 con 60 capas, segun se deduce de la tabla de formatos (atencion q/k/o en 60 capas, v en 50 capas, MLP en 60 capas). La cuantizacion no altera la topologia: solo cambia la representacion numerica de las proyecciones lineales. Las proyecciones MLP (`gate_proj`, `up_proj`, `down_proj`) se llevan a `bfloat4_b` mediante GPTQ con busqueda de exponente por bloque; las proyecciones de atencion (`q_proj`, `k_proj`, `o_proj`, `v_proj`) se llevan a `bfloat8_b` con redondeo al mas cercano. El LM head (atado al embedding), las normas, los embeddings y toda la parte de vision permanecen en bf16.

No se proporcionan datos sobre el entrenamiento original del modelo base (numero de tokens, composicion del dataset, uso de RLHF/DPO) mas alla de la referencia al "Gemma 4 Technical Report". La innovacion tecnica destacable de este checkpoint es el empaquetado en block floating point para Tensix: cada matriz se verifica con `pack_tensix.py` (ida y vuelta a traves de `ttnn`) y `verify_grid.py` (comprobacion con solo torch), y los mismos valores se empaquetan exactamente en `ttnn.bfloat8_b`. El fichero `quant4.json` documenta el formato de cada proyeccion.

## Capacidades

- Generacion de texto conversacional con plantilla de chat (`apply_chat_template`).
- Procesamiento de imagenes y texto (`pipeline_tag: image-text-to-text`), con torre de vision intacta en bf16.
- Razonamiento y respuesta multi-turno heredados del modelo base instruct.
- Capacidades multilingues del modelo base (la evaluacion cubre ingles y coreano; el resto no se detalla).
- Ejecucion sobre NPUs Tenstorrent Tensix (Wormhole, Blackhole) mediante `ttnn`, con kernels y runner propios (`tensix-kernels`, `tensix-runner`).
- Carga estandar con `transformers` (`AutoModelForCausalLM`, `dtype="bfloat16"`, `device_map="auto"`).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en hardware Tenstorrent: el caso principal. Un cluster con Wormhole o Blackhole puede cargar el modelo empaquetado en 23,534 GB y ejecutar inferencia con `ttnn`, evitando depender de GPUs NVIDIA en entornos con NPUs Tensix.
- Servicio de chat multimodal en produccion: al conservar la torre de vision en bf16 y el pipeline image-text-to-text, sirve para asistentes que reciben capturas, diagramas o fotos junto a preguntas de texto, con la ventaja de que el checkpoint ocupa un 62 % menos que el bf16.
- Evaluacion de cuantizacion en pipelines de investigacion: el repo incluye `quant4.json`, `pack_tensix.py` y `verify_grid.py`, lo que permite reproducir la verificacion matriz a matriz y comparar la KL frente a bf16 y frente a Q4_K_M de llama.cpp.
- Prototipado en una sola GPU: con 23,5 GB empaquetados y carga en bf16 via `transformers`, cabe en GPUs de 24 GB o mas (ver seccion de hardware), lo que facilita probar el modelo antes de portarlo al NPU.
- Fine-tuning o destilacion sobre la version cuantizada: al mantener embeddings, norms y vision en bf16, es posible adaptar cabezas o capas superiores sin deshacer la cuantizacion de las proyecciones.
- Benchmarking de fidelidad de formatos BFP: util para comparar BFP4/BFP8 de Tenstorrent frente a esquemas GGUF (Q4_K_M) en tareas de texto en ingles y coreano, dado que la model card publica la metodologia exacta (8.048 posiciones de WikiText-2 y Wikipedia coreana).

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL media a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (`google/gemma-4-31B-it`) | 61,39 | 0 | 100 |
| **Este modelo (BFP4 MLP / BFP8 atencion)** | 23,534 | 0,05998 | 92,25 |
| Q4_K_M (llama.cpp v0.9.0, sin importance matrix) | 18,687 | 0,05170 | 92,69 |

La evaluacion cubre 8.048 posiciones de texto en ingles (WikiText-2 test) y coreano (Wikipedia coreana), aplicando la plantilla de chat. El Q4_K_M se genero desde el mismo checkpoint con llama.cpp `cd959bae` y su sha256 es `b33a01989e939a8fbfc00ea0d8a91fb3bdf64460498c2a4ee0ce0783b76aa73e`. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 23,534 GB empaquetados para Tensix; en carga bf16 con `transformers` el repo ocupa 65,4 GB, por lo que se necesita al menos esa cantidad de memoria si se carga sin empaquetar.
- NPUs objetivo: Tenstorrent Wormhole y Blackhole (Tensix), con `ttnn`, `tt-metal`, `tt-forge`, `tensix-kernels` v0.1.0 y `tensix-runner` v0.1.0.
- GPUs convencionales: el checkpoint es cargable con `transformers` y `device_map="auto"`, pero el tamano del repo (65,4 GB) excede GPUs de consumo de 24 GB en bf16; para consumer se requeriria conversion adicional a un formato mas compacto (no incluida en el repo).
- Despliegue: `transformers` (soporte oficial del repo), `ttnn` para Tensix. No se documenta soporte de vLLM, TGI, llama.cpp u Ollama para este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano | KL a BF16 | Licencia | Hardware objetivo |
|---|---|---|---|---|---|---|
| **Este modelo** | 32,68 B | no disponible | 23,534 GB | 0,05998 | Apache 2.0 | Tenstorrent Tensix |
| `google/gemma-4-31B-it` (BF16) | 32,68 B | no disponible | 61,39 GB | 0 | Apache 2.0 | GPU/NPU genericos |
| Q4_K_M de llama.cpp (mismo base) | 32,68 B | no disponible | 18,687 GB | 0,05170 | Apache 2.0 | CPU/GPU via llama.cpp |

La comparativa se limita al mismo modelo base en distintos formatos, que es lo que documenta la model card. No se dispone de datos de benchmarks de tareas para comparar con otros modelos de la misma categoria.

## Limitaciones y advertencias

- La cuantizacion introduce perdida de fidelidad medible: KL media de 0,05998 frente a bf16, un 16 % peor que el Q4_K_M de llama.cpp (0,05170) y un Top-1 del 92,25 % frente al 92,69 % del Q4_K_M.
- El checkpoint esta optimizado para Tensix; fuera de ese hardware, la carga con `transformers` funciona pero no aprovecha el empaquetado BFP y ocupa 65,4 GB en disco.
- No se documentan sesgos conocidos del modelo base ni del proceso de cuantizacion; el riesgo de alucinacion es el heredado del modelo original y no se cuantifica en la informacion disponible.
- La evaluacion de calidad se limita a ingles y coreano; el comportamiento en castellano y otros idiomas no esta medido.
- La longitud de contexto no se especifica en la informacion proporcionada, lo que impide planificar despliegues con ventanas largas sin consultar la model card del modelo base.
- Licencia Apache 2.0 segun la model card; el repositorio del modelo base no incluye fichero LICENSE, por lo que el autor incluye el texto estandar y un `NOTICE` con los cambios. Verificar la licencia del modelo base antes de uso comercial.
- El autor del checkpoint es `hletrd`, no Xylolabs ni Google; el soporte y las garantias de mantenimiento no estan claros.
- `pack_tensix.py` y `verify_grid.py` se distribuyen sin cambios desde `tensix-bfp-gptq` en el commit `5c52065`; cualquier fallo en el empaquetado debe reportarse contra ese repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hletrd/gemma-4-31B-it-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Repositorio de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de referencia del codigo: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release `tensix-bfp-gptq` v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release `tensix-kernels` v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release `tensix-runner` v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado en los tags: arXiv:2607.02770
