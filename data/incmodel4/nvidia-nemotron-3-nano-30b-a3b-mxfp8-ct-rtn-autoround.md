# INCModel4/NVIDIA-Nemotron-3-Nano-30B-A3B-MXFP8-CT-RTN-AutoRound

## Resumen

Este repositorio contiene un checkpoint cuantizado en MXFP8 del modelo NVIDIA Nemotron 3 Nano 30B A3B, publicado por el usuario INCModel4 como derivado del checkpoint oficial en BF16 (`nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`). El modelo base lo desarrolla NVIDIA y pertenece a la familia Nemotron 3, orientada a razonamiento agéntico con pesos abiertos. Se trata de un MoE híbrido Mamba-Transformer de 52 capas, con 31.577.940.288 parametros totales y aproximadamente 3.500 millones de parametros activos por token.

El problema que resuelve esta variante es el coste de memoria: la cuantizacion a MXFP8 (E4M3, simetrica por grupos de 32 con escalas U8) reduce el payload de pesos de 63,16 GB en BF16 a 33,62 GB, es decir, practicamente la mitad, manteniendo el tokenizador y la arquitectura del original. Los componentes sensibles (embeddings, cabeza LM, proyecciones y puertas de atencion, componentes del mixer convolucional y proyecciones de capas hibridas concretas) se conservan en BF16 o FP32.

Es relevante ahora porque permite desplegar un modelo MoE de ~3,5B activos en GPUs de 32-48 GB con kernels MXFP8, algo que el checkpoint BF16 no permite en una sola tarjeta de gama alta de consumo. La evaluacion publicada muestra una degradacion practicamente nula frente a BF16 (media macro 76,66% vs 76,60%). Conviene senalar que se trata de un derivado de terceros, no de una publicacion oficial de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `NemotronHForCausalLM` (`nemotron_h`), modelo hibrido Mamba-Transformer con capas MoE, 52 capas |
| Parametros totales | 31.577.940.288 (31,58B) |
| Parametros activos | Aproximadamente 3,5B por token |
| Longitud de contexto | 131.072 tokens como limite de servicio en la configuracion verificada; la pagina de NVIDIA NIM del modelo base menciona 1M de contexto (no verificado en esta ficha) |
| Tipos de cuantizacion | MXFP8 E4M3, cuantizacion simetrica por grupos (group size 32), escalas de grupo en U8; componentes sensibles en BF16 (206 tensores) y FP32 (69 tensores) |
| Idiomas soportados | en, es, fr, de, ja, it |
| Licencia | NVIDIA Nemotron Open Model License (campo `license: other`) |
| Formato de pesos | safetensors con metadatos compressed-tensors, exportados en formato `llm_compressor` |
| Modelo base | `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` |
| Tamano del repositorio | 33,6 GB (payload de pesos: 33.616.949.632 bytes) |
| Payload del modelo base | 63,16 GB (63.155.892.352 bytes) |
| Pipeline | text-generation |
| Libreria | transformers |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un hibrido Mamba-Transformer con capas de mezcla de expertos (MoE), identificado en el codigo como `NemotronHForCausalLM` y con 52 capas. La combinacion de estado recurrente (Mamba) con atencion y MoE busca mejor throughput que un transformer estandar manteniendo una precision igual o superior, segun la documentacion de NVIDIA Research sobre la familia Nemotron 3. El modelo activa aproximadamente 3,5B de parametros por token sobre un total de 31,58B, lo que reduce el coste de computo por token respecto a un modelo denso del mismo tamano.

En cuanto a la cuantizacion de este derivado, el autor aplico AutoRound con round-to-nearest (RTN) y cero iteraciones de optimizacion (`iters=0`), 128 muestras configuradas, longitud de secuencia de 2048 tokens y batch de cuantizacion de 1, sobre una unica GPU (`--device_map 0`). Las capas lineales elegibles se convierten a MXFP8; quedan excluidas `lm_head`, `backbone.embeddings`, las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj` y `gate` del mixer, `conv1d`, y los pares `in_proj`/`out_proj` de las capas hibridas 4, 11, 18, 25, 32 y 41. El entorno de cuantizacion fue Python 3.12.15, PyTorch 2.13.0, CUDA 13.0, AutoRound 0.16.0 y Transformers 5.17.0.

No se activo cuantizacion estatica de KV-cache ni de atencion: el checkpoint usa el dtype automatico de KV-cache en tiempo de ejecucion. Por tanto, no debe interpretarse como un checkpoint FP8 de KV-cache o de atencion. No se proporciona informacion sobre el dataset de entrenamiento del modelo base (numero de tokens, composicion, uso de RLHF/DPO) en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en seis idiomas: ingles, espanol, frances, aleman, japones e italiano.
- Razonamiento y resolucion de problemas matematicos: el modelo base obtiene un 94,62% de coincidencia estricta en GSM8K segun la evaluacion de esta variante.
- Conocimiento general y comprension del lenguaje: MMLU 71,00% y HellaSwag 59,83% en la configuracion MXFP8.
- Sentido comun fisico y comprension de frases: PIQA 81,18%.
- Segun la documentacion de NVIDIA para el modelo base, esta orientado a codigo, razonamiento, seguimiento de instrucciones y tool calling, asi como a razonamiento agentico.
- Capacidades de agente y razonamiento multi-paso por la orientacion de la familia Nemotron 3 a agentes con razonamiento (segun la descripcion de NVIDIA).
- Inferencia con contexto largo: la configuracion verificada admite `max_model_len=131072`, aunque la evaluacion publicada no es un benchmark de contexto largo.
- No se documentan capacidades de vision ni de audio en la informacion disponible.

## Casos de uso

- Atencion al cliente multilingue: el modelo cubre en, es, fr, de, ja, it y mantiene conversaciones multi-turno con una ventana de hasta 131.072 tokens en la configuracion verificada, lo que permite adjuntar historiales largos de tickets o documentacion de producto sin trocear el contexto.
- Despliegue de agentes con tool calling: con ~3,5B parametros activos y pesos en MXFP8 de 33,6 GB, se puede servir en una GPU de 48 GB o en dos de 32 GB con tensor parallelism, integrando llamadas a funciones en flujos de automatizacion.
- Asistente de codigo en pipelines de CI/CD: el modelo base esta orientado a generacion de codigo e instrucciones; el checkpoint cuantizado permite revision de diffs y generacion de parches en un servicio interno sin exponer datos a APIs externas.
- Razonamiento matematico asistido: con un 94,62% en GSM8K, es adecuado para tutoria, verificacion de calculos y generacion de problemas resueltos paso a paso en entornos educativos.
- Procesamiento de documentos largos: contratos, informes tecnicos o expedientes que superan los 100K tokens encajan en la ventana configurada, con resumen y extraccion de entidades como tareas principales.
- Clasificacion y enrutado en backend: las tareas tipo PIQA/HellaSwag y MMLU sugieren un uso solido como clasificador de intenciones o evaluador de respuestas antes de derivar a un modelo mayor.
- Investigacion sobre cuantizacion: el repositorio incluye el comando exacto de reproduccion y las versiones de software, lo que lo convierte en una referencia para comparar MXFP8 frente a BF16 y FP8 en arquitecturas hibridas MoE.

## Benchmarks y rendimiento

Evaluacion publicada por el autor, con batch size 32 y un maximo de secuencia de servicio de 131.072 tokens (limite de servicio, no benchmark de contexto largo):

| Tarea | Muestras | BF16 | MXFP8 | Cambio relativo |
|---|---:|---:|---:|---:|
| GSM8K (coincidencia estricta) | 1.319 | 94,84% | 94,62% | -0,24% |
| PIQA | 1.838 | 80,52% | 81,18% | +0,81% |
| MMLU | 14.042 | 71,21% | 71,00% | -0,30% |
| HellaSwag | 10.042 | 59,82% | 59,83% | +0,02% |
| Media macro | — | 76,60% | 76,66% | +0,07% |

El cambio relativo se calcula como `(puntuacion MXFP8 / puntuacion BF16 - 1) x 100` a partir de los valores sin redondear. El BF16 de referencia y la ejecucion MXFP8 usaron topologias de ejecucion paralela distintas, por lo que la comparacion es valida a nivel de tarea pero no constituye una medicion causal estricta del efecto aislado de la cuantizacion. No hay datos publicados de otros benchmarks (HumanEval, MATH, contextos largos) en la informacion disponible.

## Requisitos de hardware

- VRAM para pesos: el payload MXFP8 ocupa 33,62 GB, frente a 63,16 GB del BF16. Hay que anadir el espacio de KV-cache y de activaciones, cuyo tamano exacto no se especifica en la informacion disponible.
- GPU recomendadas para una sola tarjeta: H100 80 GB, A100 80 GB, L40S 48 GB o RTX A6000 48 GB. Cabe en consumer GPU de 32 GB (RTX 5090) solo con tensor parallelism de 2 vias o superior.
- Topologia verificada por el autor: vLLM 0.31.0 sobre RTX 5090 (SM120), backend Humming MoE y kernel lineal compatible con MXFP8, con TP=2, DP=2, expert parallelism activado y PP=1, usando computo BF16, dtype automatico de KV-cache y `max_model_len=131072`. Esto implica 4 GPU en la configuracion probada.
- Cuantizacion: el checkpoint es MXFP8 con metadatos compressed-tensors. No consta soporte para llama.cpp, Ollama ni GGUF en la informacion disponible; el formato esta pensado para el stack transformers/vLLM con kernels MXFP8.
- Requisitos de software: Transformers 5.17.0, PyTorch 2.13.0 y CUDA 13.0 son las versiones usadas en la cuantizacion. El modelo base es de tipo MoE hibrido con `custom_code`, por lo que es previsible necesitar `trust_remote_code=True` en transformers (el comando de cuantizacion usa `--disable_trust_remote_code`).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| Este checkpoint (INCModel4, MXFP8) | 31,58B | ~3,5B | 131.072 tokens en la configuracion verificada | safetensors + compressed-tensors (MXFP8) | NVIDIA Nemotron Open Model License |
| nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 | 31,58B | ~3,5B | no disponible en esta ficha | safetensors BF16 | NVIDIA Nemotron Open Model License |
| nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-FP8 | 31,58B | ~3,5B | no disponible en esta ficha | safetensors FP8 (checkpoint oficial) | NVIDIA Nemotron Open Model License |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos verificados de otros modelos comparables en la informacion proporcionada. La diferencia principal entre la variante de este repositorio y el checkpoint FP8 oficial de NVIDIA es el esquema de cuantizacion empleado (MXFP8 por grupos de 32 con escalas U8 frente al esquema FP8 de NVIDIA) y el proceso de produccion (AutoRound RTN con 0 iteraciones frente al pipeline de optimizacion de NVIDIA). No hay datos de rendimiento publicados para el checkpoint FP8 oficial en la informacion disponible que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Se trata de un derivado de terceros (usuario INCModel4), no de una publicacion oficial de NVIDIA. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion independiente de la comunidad.
- La evaluacion compara BF16 y MXFP8 con topologias de ejecucion paralela distintas; el autor advierte que no es una medicion causal estricta del efecto de la cuantizacion.
- No se activo cuantizacion estatica de KV-cache ni de atencion. No debe tratarse como un checkpoint FP8 de KV-cache; usar escalas FP8 estaticas con este modelo seria incorrecto.
- El proceso de cuantizacion usa RTN con 0 iteraciones de optimizacion y solo 128 muestras, por lo que no hay calibracion fina de los pesos cuantizados.
- Riesgo de alucinacion inherente a los modelos generativos: no se documentan tasas de alucinacion ni evaluaciones de factualidad en la informacion disponible.
- Cobertura linguistica limitada a seis idiomas (en, es, fr, de, ja, it); no consta soporte para otras lenguas.
- La licencia es `other` (NVIDIA Nemotron Open Model License). Es imprescindible revisar el texto completo de la licencia y las condiciones del modelo base antes de cualquier uso comercial o redistribucion.
- El hardware verificado (RTX 5090, SM120, vLLM 0.31.0 con backend Humming MoE) implica que se necesitan kernels MXFP8 especificos; otros entornos de servicio pueden no ser compatibles sin ajustes.
- La arquitectura requiere codigo personalizado (`custom_code`); es probable necesitar `trust_remote_code=True` en transformers, lo que implica ejecutar codigo remoto.
- El modelo expone una ventana de servicio de 131.072 tokens, pero no se ha evaluado su rendimiento real en tareas de contexto largo; el limite de servicio no equivale a calidad en contextos largos.
- El campo de fecha de creacion del repositorio es 2026-10-15 y las versiones de software declaradas son muy recientes; conviene verificar la reproducibilidad del entorno.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/INCModel4/NVIDIA-Nemotron-3-Nano-30B-A3B-MXFP8-CT-RTN-AutoRound
- Modelo base en HuggingFace: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Checkpoint FP8 oficial de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-FP8
- Familia Nemotron en NVIDIA Developer: https://developer.nvidia.com/topics/ai/nemotron
- NVIDIA NIM del modelo base (nemotron-3-nano-30b-a3b): https://build.nvidia.com/nvidia/nemotron-3-nano-30b-a3b
- NVIDIA Research, familia Nemotron 3: https://research.nvidia.com/labs/nemotron/Nemotron-3/
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
