# SergiioB/Nemotron-3.5-Bolt-74B-A9B-AutoRound-W4A16-G128-sym

## Resumen

Nemotron 3.5 Bolt 74B-A9B AutoRound W4A16 G128 sym es una version cuantizada a 4 bits del modelo multimodal NVIDIA Nemotron 3.5 Bolt 74B-A9B en BF16, publicada por el usuario SergiioB. La cuantizacion se ha realizado con Intel AutoRound y se almacena en formato GPTQ para que vLLM pueda cargarla, reduciendo el peso en disco de 139,5 GiB (BF16) a 41 GB. El pipeline declarado es image-text-to-text y la arquitectura es nemotron_h_omni, una combinacion hibrida de Mamba-2, atencion y mezcla de expertos con torre de vision RADIO.

El modelo base se presenta como un MoE de 74B de parametros totales y 9B activos, que enruta cada token a 9 expertos. La cuantizacion afecta a 27.920 capas Linear (expertos enrutados, expertos compartidos, proyecciones latentes del MoE, `in_proj`/`out_proj` de Mamba-2 y las proyecciones q/k/v/o de atencion), mientras que la torre de vision, el proyector, los embeddings, `lm_head`, las puertas del router, las normas y la `conv1d` de Mamba se mantienen en BF16 byte a byte identicas al original.

Su relevancia practica es doble: por un lado, permite ejecutar un modelo multimodal de gran tamano en dos tarjetas Intel Arc Pro B70 de 32 GB con vLLM 0.31.0 en XPU y tensor parallel 2; por otro, documenta de forma publica los parches necesarios para ello (afinidad por worker, bucles de oneCCL y soporte de top-k 9 en el kernel MoE de XPU). El autor advierte de que se trata de un resultado autodeclarado en una unica maquina y no reproducido de forma independiente. No se han publicado datos de benchmarks de calidad en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nemotron_h_omni: hibrida de Mamba-2, atencion y MoE, con torre de vision RADIO |
| Parametros totales | 74B segun la nomenclatura del modelo; 11.725.189.122 segun el recuento de safetensors del repo (discrepancia no explicada en la model card) |
| Parametros activos | 9B (sufijo A9B de la nomenclatura) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16, int4, group size 128, simetrica, almacenada en GPTQ; vision tower, proyector, embeddings, `lm_head`, gates del router, normas y `conv1d` en BF16; `A_log`, `D` y `dt_bias` en F32; `e_score_correction_bias` en F32 |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | OpenMDW 1.1 (campo `license: other` en los tags, con `license_name: openmdw-1.1`) |
| Formato de pesos | safetensors en formato GPTQ (no se ofrecen GGUF ni otros formatos en el repo) |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido de tipo Nemotron-H Omni. Combina capas Mamba-2 (con `in_proj`, `out_proj`, `conv1d` y los parametros `A_log`, `D` y `dt_bias`) con capas de atencion (proyecciones q/k/v/o) y una capa MoE con expertos enrutados, expertos compartidos y proyecciones latentes. Segun la model card de la cuantizacion, el modelo enruta cada token a 9 expertos (top-k 9), y cuenta con 27.648 capas Linear de expertos enrutados. Incorpora una torre de vision RADIO y un proyector, lo que habilita el pipeline image-text-to-text. No dispone de capa MTP: `num_nextn_predict_layers` vale 0, y el drafter especulativo de NVIDIA para este modelo es un modelo aparte, LiLiCorr.

No hay informacion en la documentacion proporcionada sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras. Esta ficha describe unicamente el proceso de cuantizacion, no el entrenamiento del modelo base.

El proceso de cuantizacion empleo AutoRound `main` (commit 08d7085e) junto con el soporte de Nemotron-H Omni del PR intel/auto-round#2512 (aprobado pero no fusionado en el momento de la publicacion) y transformers 5.12.1. El esquema fue W4A16 con group_size 128, simetria, 200 iteraciones, 128 muestras y seqlen 1536, con carga en streaming desde disco y `low_gpu_mem_usage=True` repartida entre dos tarjetas (`device_map 0,1`). El proceso completo tardo 5 horas y 57 minutos en dos Intel Arc Pro B70. Como incidencia tecnica, el codigo remoto de Mamba-2 del modelo base construye tensores de 6 dimensiones en su ruta PyTorch estandar y agotaba la memoria durante la calibracion; la exportacion uso una version con einsum de cuatro lineas que reduce el pico de 25,8 GiB a 3,0 GiB, y el repo incluye el `modeling_nemotron_h.py` original de NVIDIA.

## Capacidades

- Generacion de texto conversacional, con etiqueta `conversational` y compatibilidad declarada con endpoints.
- Procesamiento de imagen y texto de forma conjunta (pipeline `image-text-to-text`), gracias a la torre de vision RADIO y al proyector.
- Razonamiento con arquitectura MoE: 9 expertos activados por token sobre un total derivado de 74B de parametros nominales, con 9B activos.
- Capacidad multilingue declarada en seis idiomas: ingles, espanol, frances, aleman, italiano y japones.
- Inferencia en vLLM con formato GPTQ y soporte de tensor parallel 2 en Intel XPU.
- Soporte de decodificacion especulativa solo mediante un modelo drafter externo (LiLiCorr); el modelo no incluye capa MTP.
- Tool calling / function calling: no documentado en la informacion disponible.
- Modo thinking explicito: no documentado en la informacion disponible.
- Capacidades de audio: no documentadas en la informacion disponible, pese a la etiqueta `nemotron_h_omni`.

## Casos de uso

- Inferencia multimodal autoalojada en hardware Intel: el modelo esta probado con vLLM 0.31.0 XPU y tensor parallel 2 sobre dos Intel Arc Pro B70 de 32 GB, lo que permite desplegar un modelo multimodal de gran tamano en un nodo de 64 GB de VRAM agregada.
- Analisis de documentos con imagenes en entornos con requisitos de soberania del dato: al ejecutarse on-premise y con pesos abiertos, permite procesar capturas, diagramas o paginas escaneadas acompanadas de texto sin enviar contenido a APIs externas.
- Atencion al cliente multilingue: la cobertura declarada de ingles, espanol, frances, aleman, italiano y japones permite atender consultas en esos idiomas desde un unico despliegue, con la salvedad de que no se ha publicado evaluacion de calidad por idioma.
- Servicio compatible con API de tipo OpenAI: la etiqueta `endpoints_compatible` y el formato GPTQ para vLLM facilitan integrar el modelo en aplicaciones existentes que ya consumen un endpoint compatible, sin reescribir el cliente.
- Reduccion de coste de servido respecto al BF16: pasar de 139,5 GiB a 41 GB permite servir el modelo en dos aceleradores de 32 GB en lugar de necesitar un numero mayor de GPUs o nodos con mas memoria por tarjeta.
- Prototipado e investigacion sobre arquitecturas hibridas Mamba-2 + atencion + MoE: el repo incluye el `modeling_nemotron_h.py` original y los parches de XPU, lo que sirve como base reproducible para estudiar inferencia de este tipo de arquitecturas en hardware Intel.
- Evaluacion interna de cuantizacion a 4 bits: comparar esta build int4 g128 simetrica contra el BF16 base en tareas propias permite medir la degradacion real en el dominio de interes antes de pasar a produccion.
- Investigacion sobre decodificacion especulativa: combinando esta build con el drafter LiLiCorr se puede experimentar con aceleracion de decodificacion en un modelo que no incorpora capa MTP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card solo incluye mediciones de rendimiento de inferencia, no de exactitud, y no se ofrece comparacion de calidad frente al BF16 original.

Mediciones de inferencia declaradas por el autor (autodeclaradas, una sola maquina, no reproducidas de forma independiente):

| Metrica | Valor |
|---|---|
| Hardware | 2x Intel Arc Pro B70 (32 GB cada una) |
| Motor | vLLM 0.31.0 XPU, tensor parallel 2 |
| Decode, una peticion (C1), 886 tokens de prompt | 59,5 tok/s |
| Prefill, una peticion (C1), 886 tokens de prompt | 2.866 tok/s |
| Tamano de pesos | 41 GB (origen BF16: 139,5 GiB) |
| Tiempo de cuantizacion | 5 h 57 min en dos B70 |

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 41 GB; hay que sumar memoria para cache KV y overhead del runtime, por lo que un unico acelerador de 32 GB no es suficiente con este esquema.
- Configuracion validada: 2x Intel Arc Pro B70 de 32 GB con tensor parallel 2 y vLLM 0.31.0 XPU.
- GPU recomendadas: la unica configuracion documentada es la de dos Intel Arc Pro B70. Para GPU NVIDIA no hay datos de despliegue publicados en esta model card.
- Cabe en GPU de consumo: no en una sola tarjeta de 24 GB como una RTX 4090, dado que solo los pesos ya ocupan 41 GB. En varias GPU de consumo no hay validacion documentada.
- Opciones de despliegue: vLLM en XPU (probado). No se ofrecen pesos GGUF, por lo que llama.cpp u Ollama no estan soportados con este repo. Otros motores no estan documentados.
- Parches necesarios en vLLM 0.31.0 sobre este hardware: visibilidad de GPU por worker y variables `CCL_SYCL_*` para TP2 en placas sin peer-to-peer; loopback para oneCCL cuando el contenedor usa `--network host`; y soporte de top-k 9 en el kernel MoE de XPU, ya que `remap_hidden_states` solo admite top-k 1, 2, 4, 6, 7, 8, 10, 12 y 16 y falla con `Unsupported TopK value`.
- Latencia y throughput estimados: 59,5 tok/s de decode y 2.866 tok/s de prefill con una peticion concurrente y 886 tokens de prompt, segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Formato y tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SergiioB/Nemotron-3.5-Bolt-74B-A9B-AutoRound-W4A16-G128-sym | 74B nominales / 9B activos | GPTQ int4 W4A16 g128 sim, 41 GB | no disponible | OpenMDW 1.1 | HuggingFace |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16 (base) | 74B / 9B activos | BF16, 139,5 GiB | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr | no disponible | no disponible (24 GB en el nombre) | no disponible | no disponible en la informacion proporcionada | HuggingFace |

No se dispone de datos de benchmarks que permitan comparar la calidad de esta cuantizacion frente al modelo base BF16 ni frente al drafter LiLiCorr. La comparacion disponible se limita a tamano, formato y licencia de la build cuantizada.

## Limitaciones y advertencias

- Resultado autodeclarado: el autor indica explicitamente que las mediciones provienen de una sola maquina y no han sido reproducidas de forma independiente.
- Sin benchmarks de calidad publicados: no hay datos de MMLU, HumanEval, GSM8K ni de evaluacion multimodal que permitan cuantificar la perdida de exactitud por la cuantizacion int4.
- Discrepancia en el recuento de parametros: la nomenclatura indica 74B totales y 9B activos, mientras que el recuento de safetensors del repo es de 11.725.189.122; la model card no aclara esta diferencia.
- Contexto no documentado: no se especifica la longitud de contexto soportada, lo que dificulta planificar despliegues que dependan de ventanas largas.
- Dependencia de parches: el despliegue en vLLM 0.31.0 sobre XPU requiere parches para afinidad de workers, oneCCL y top-k 9; sin ellos el arranque o el kernel MoE fallan.
- Formato limitado: al distribuirse solo en GPTQ, no hay ruta soportada a llama.cpp, Ollama ni a formatos GGUF.
- Riesgo de alucinacion: no documentado en la informacion disponible, aunque es un riesgo inherente a los modelos de lenguaje generativos.
- Idiomas: la cobertura declarada son seis idiomas y no se aporta evaluacion de calidad por idioma; el rendimiento en lenguas no listadas no esta documentado.
- Licencia OpenMDW 1.1: es una licencia propia de NVIDIA, no una licencia de codigo abierto estandar, por lo que conviene revisar sus terminos antes de un uso comercial.
- Uso en produccion: al no existir evaluacion de calidad ni reproducibilidad independiente, se recomienda validar el modelo en el dominio concreto antes de desplegarlo.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/SergiioB/Nemotron-3.5-Bolt-74B-A9B-AutoRound-W4A16-G128-sym
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16
- Drafter especulativo LiLiCorr: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr
- Intel AutoRound: https://github.com/intel/auto-round
- Pull request de soporte Nemotron-H Omni en AutoRound: https://github.com/intel/auto-round/pull/2512
- vLLM: https://github.com/vllm-project/vllm
- Cookbook de inferencia en Intel Arc Pro B70: https://github.com/SergiioB/intel-arc-pro-b70-inference-cookbook
- Parche de afinidad de workers de vLLM: https://github.com/SergiioB/intel-arc-pro-b70-inference-cookbook/blob/master/patches/patch_vllm_worker_affinity.py
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
