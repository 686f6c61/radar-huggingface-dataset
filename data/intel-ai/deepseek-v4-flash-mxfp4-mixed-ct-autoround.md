# intel-ai/DeepSeek-V4-Flash-MXFP4-Mixed-CT-AutoRound

## Resumen

DeepSeek-V4-Flash-MXFP4-Mixed-CT-AutoRound es una version cuantizada del modelo DeepSeek-V4-Flash publicada por intel-ai (Intel) mediante la herramienta AutoRound y el formato llm_compressor. Se trata de un modelo de tipo mezcla de expertos (MoE) de aproximadamente 291.000 millones de parametros, cuantizado de forma mixta: los expertos MoE en MXFP4 (4 bits) y las capas lineales en MXFP8 (8 bits), con cache KV en FP8.

El objetivo es reducir el coste de memoria y de computo del modelo base (el repositorio ocupa 159,8 GB) manteniendo un rendimiento casi identico al de otras variantes cuantizadas del mismo modelo, como muestran los benchmarks publicados. Es relevante para despliegues en produccion con vLLM, donde el ahorro de VRAM y el uso de kernels FP4 permiten servir un modelo de gran tamano en un numero reducido de GPU de 80 GB.

El modelo esta pensado para generacion de texto y razonamiento, con un modo de razonamiento ("thinking") activable desde la plantilla de chat y un modo Think Max que recomienda una ventana de contexto de al menos 384K tokens. La licencia declarada es MIT, aunque el autor remite a la licencia del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); cuantizacion mixta MXFP4/MXFP8 |
| Parametros totales | 290.944.616.402 (~291 B) |
| Parametros activos | no disponible |
| Longitud de contexto | al menos 384.000 tokens en modo Think Max (recomendado); maximo no disponible |
| Tipos de cuantizacion | MXFP4 (expertos MoE), MXFP8 (capas lineales), KV-cache FP8 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (formato llm_compressor / compressed-tensors, 8-bit) |

## Arquitectura y entrenamiento

La informacion proporcionada no incluye detalles sobre el entrenamiento del modelo base DeepSeek-V4-Flash (numero de tokens, composicion del dataset, fases de RLHF/DPO, etc.), por lo que esos datos se consideran no disponibles. Lo que si se detalla es el proceso de cuantizacion: el modelo se genera con Intel AutoRound, un metodo de redondeo de pesos guiado por descenso de gradiente con signo (paper arXiv:2309.05516), aplicando un esquema mixto. Concretamente, los expertos de la capa MoE se cuantizan a MXFP4 (4 bits) y las capas lineales a MXFP8 (8 bits), ignorando determinadas capas como `compressor` e `indexer.weights_proj`. El resultado se exporta en formato llm_compressor compatible con compressed-tensors.

Segun la model card, el modelo base de referencia corresponde a una variante "W4A8 MXFP4 MoE, block FP8 Linear" y esta version es "W4A4 MXFP4 MoE, MXFP8 Linear", es decir, con activaciones tambien en 4 bits para los expertos. No se indica en la informacion disponible si se emplearon tecnicas adicionales como decodificacion especulativa o atencion lineal, ni se detallan innovaciones de atencion mas alla del uso de un cache de indices FP4 (`attention_config.use_fp4_indexer_cache=True`) en la configuracion de vLLM.

## Capacidades

- Generacion de texto y razonamiento en modo "thinking", activable mediante `chat_template_kwargs.enable_thinking`.
- Modo de razonamiento extendido Think Max, con recomendacion de contexto de al menos 384K tokens.
- Razonamiento matematico: los benchmarks publicados cubren math_500 (0,9472), gsm8k (0,9671) y aime26 (0,6087).
- Razonamiento cientifico y de conocimiento: gpqa_diamond (0,7192), mmlu (0,9020), mmlu_pro (0,8258), piqa (0,9287), hellaswag (0,8650).
- Servicio mediante API compatible con el endpoint OpenAI de chat completions (`/v1/chat/completions`).
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente en la informacion disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no esta informado).
- Capacidades de vision, audio o multimodalidad: no disponible.

## Casos de uso

- Razonamiento matematico asistido: resolucion de problemas de competicion y calculo simbolico, aprovechando los resultados en aime26, math_500 y gsm8k, con el modo thinking activado para cadenas de razonamiento largas.
- Analisis de documentos extensos: procesamiento de contratos, informes o bases de conocimiento de cientos de miles de tokens en una sola pasada, gracias a la ventana recomendada de 384K tokens en modo Think Max.
- Generacion y revision de codigo en pipelines de desarrollo: uso a traves de un endpoint compatible con OpenAI para tareas de autocompletado, refactorizacion y explicacion de codigo (capacidad inferida, sin benchmark de codigo publicado).
- Question answering cientifico y tecnico: respuestas de alta precision en dominios especializados segun gpqa_diamond (0,7192) y mmlu_pro (0,8258), adecuado para asistentes de investigacion.
- Atencion al cliente automatizada: conversaciones multi-turno con contexto muy largo, desplegando el modelo en vLLM y exponiendo el endpoint de chat completions.
- Evaluacion y sintesis de informacion: resumen y comparacion de multiples fuentes largas en un unico contexto, apoyandose en la ventana extendida.
- Inferencia en infraestructura con aceleradores Intel: aprovechando el ecosistema AutoRound / Neural Compressor para optimizar el despliegue en hardware Intel.
- Prototipado de aplicaciones de razonamiento: al ser una variante cuantizada de menor huella, sirve para validar aplicaciones que requieren un modelo de ~291B antes de pasar a la version completa.

## Benchmarks y rendimiento

Resultados publicados en la model card. Los valores se expresan como proporcion (0-1). La primera fila corresponde al modelo de referencia con el que se compara la publicacion.

| Benchmark | DeepSeek-V4-Flash (W4A8 MXFP4 MoE, block FP8 Linear) | Este modelo (W4A4 MXFP4 MoE, MXFP8 Linear) |
|---|---|---|
| aime26 | 0,6097 | 0,6087 |
| gpqa_diamond | 0,7212 | 0,7192 |
| math_500 | 0,9556 | 0,9472 |
| mmlu | 0,9043 | 0,9020 |
| piqa | 0,9289 | 0,9287 |
| hellaswag | 0,8632 | 0,8650 |
| gsm8k | 0,9684 | 0,9671 |
| mmlu_pro | 0,8289 | 0,8258 |

No se han publicado en la informacion disponible benchmarks de codigo (por ejemplo HumanEval) ni datos de latencia o throughput.

## Requisitos de hardware

Estimaciones basadas en el tamano del repositorio (159,8 GB) y en la configuracion de despliegue facilitada por el autor; no son cifras oficiales.

- VRAM estimada para inferencia: el repositorio de pesos ocupa 159,8 GB, por lo que se necesitan del orden de 160 GB solo para los pesos, mas la cache KV en FP8.
- GPU recomendadas: la configuracion de vLLM del autor usa `tensor-parallel-size 2`, lo que apunta a un minimo de 2 GPU de 80 GB (H100 80 GB o A100 80 GB). Para contexto largo (384K tokens) y lotes mayores, probablemente se requieran 4 o mas GPU de 80 GB.
- GPU de consumo: no cabe de forma practica en GPU de consumo (24 GB o menos), dado el tamano de pesos y la necesidad de paralelismo tensorial.
- Opciones de despliegue: vLLM es la via soportada explicitamente (requiere el PR https://github.com/vllm-project/vllm/pull/45645), con flags `--trust-remote-code`, `--kv-cache-dtype fp8`, `--block-size 256`, `--tensor-parallel-size 2`, `--attention_config.use_fp4_indexer_cache=True`, `--no-enable-flashinfer-autotune` y `--enforce-eager`. Otros motores (llama.cpp, Ollama, TGI) no se mencionan en la informacion disponible.
- Parametros de muestreo recomendados: `temperature = 1.0`, `top_p = 1.0`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Cuantizacion |
|---|---|---|---|---|
| Este modelo (intel-ai/DeepSeek-V4-Flash-MXFP4-Mixed-CT-AutoRound) | ~291 B | al menos 384K (Think Max) | MIT | W4A4 MXFP4 MoE, MXFP8 Linear |
| DeepSeek-V4-Flash (variante de referencia en la model card) | no disponible | no disponible | no disponible | W4A8 MXFP4 MoE, block FP8 Linear |
| deepseek-ai/DeepSeek-V4-Flash (modelo base) | no disponible | no disponible | no disponible | pesos completos |

No se dispone en la informacion proporcionada de datos sobre otras alternativas comparables de terceros (por ejemplo, otras familias MoE cuantizadas) ni de sus especificaciones, por lo que la comparativa se limita a las variantes del propio modelo DeepSeek-V4-Flash.

## Limitaciones y advertencias

- Alucinacion: el autor advierte explicitamente de que el modelo puede producir salidas factualmente incorrectas y no debe usarse como fuente fiable de informacion.
- Sesgos y contenido ofensivo: la model card indica que, por las limitaciones del modelo preentrenado y de los datasets de ajuste, puede generar contenido obsceno, sesgado u ofensivo. Recomienda realizar pruebas de seguridad antes de desplegar cualquier aplicacion.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento multilingue concreto.
- Licencia: declarada como MIT, pero el autor remite a la licencia del modelo original y senala que la licencia no constituye asesoramiento legal, recomendando consultar a un abogado antes de un uso comercial.
- Divergencia de identificadores: el identificador del repositorio es `intel-ai/...`, mientras que la model card y el comando de ejemplo de vLLM referencian `INCModel/DeepSeek-V4-Flash-MXFP4-Mixed-CT-AutoRound`. Conviene verificar la ruta correcta antes de desplegar.
- Requisitos de despliegue: depende de un PR especifico de vLLM (45645) y de flags concretos; no es un despliegue estandar inmediato.
- Datos incompletos: se desconoce el numero de parametros activos, el contexto maximo real, los idiomas y el detalle de entrenamiento del modelo base. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que cuenta con poca validacion de la comunidad.
- Recomendacion de contexto: para el modo Think Max se aconseja una ventana de al menos 384K tokens, lo que incrementa notablemente el consumo de memoria de la cache KV.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/intel-ai/DeepSeek-V4-Flash-MXFP4-Mixed-CT-AutoRound
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Repositorio Intel AutoRound: https://github.com/intel/auto-round
- PR de AutoRound para la generacion del modelo: https://github.com/intel/auto-round/pull/1921
- PR de vLLM con soporte de despliegue: https://github.com/vllm-project/vllm/pull/45645
- Paper de AutoRound (arXiv:2309.05516): https://arxiv.org/abs/2309.05516
- Intel Neural Compressor: https://github.com/intel/neural-compressor
