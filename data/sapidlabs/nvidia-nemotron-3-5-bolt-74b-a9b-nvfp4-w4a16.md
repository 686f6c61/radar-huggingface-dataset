# sapidlabs/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-NVFP4-W4A16

## Resumen

NVIDIA-Nemotron-3.5-Bolt-74B-A9B-NVFP4-W4A16 es una cuantizacion de solo pesos (weight-only) del modelo nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16, realizada por Sapid Labs con la herramienta ModelOpt 0.44. Se trata de un transformer hibrido multimodal (familia `nemotron_h_omni`) con mezcla de expertos (MoE), que incorpora un encoder de vision C-RADIO y proyecciones Mamba-Transformer. La denominacion indica 74B parametros totales y 9B activos por token, aunque las cabeceras safetensors del repositorio cuantizado declaran 40.663.754.760 parametros.

El objetivo de este checkpoint es reducir el peso en disco de 150 GB (BF16) a 51,4 GB mediante cuantizacion NVFP4 W4A16, de modo que el modelo pueda ejecutarse en un unico dispositivo con memoria unificada como el DGX Spark (GB10, 128 GB). La receta replica la empleada por NVIDIA para Nemotron 3.5 Lightning NVFP4, con la salvedad de que las proyecciones de entrada y salida de Mamba permanecen en BF16 en lugar de FP8.

Es relevante porque demuestra que un MoE multimodal de gran tamano puede desplegarse en hardware de escritorio profesional con una ventana de contexto efectiva muy amplia (se midio una cache KV de 3.805.271 tokens) a costa de una degradacion de calidad cuantificada en una tarea de referencia (GSM8K: 194/200 con thinking desactivado). No es un checkpoint oficial de NVIDIA: Sapid Labs lo distribuye bajo la misma licencia OpenMDW 1.1 del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido MoE con capas Mamba y atencion (`nemotron_h_omni`); encoder de vision C-RADIO |
| Parametros totales | 74B segun denominacion del modelo; 40.663.754.760 segun cabeceras safetensors del repo |
| Parametros activos | 9B por token (segun denominacion A9B) |
| Longitud de contexto | Configuracion de prueba en vLLM: 65.536 tokens; cache KV medida: 3.805.271 tokens |
| Tipos de cuantizacion | NVFP4 W4A16 (pesos 4-bit E2M1, escala FP8 E4M3 por bloque de 16, escala FP32 por tensor), BF16 en capas no cuantizadas |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW License Agreement version 1.1 (openmdw-1.1) |
| Formato de pesos | safetensors en formato `MIXED_PRECISION` de ModelOpt |

## Arquitectura y entrenamiento

La arquitectura es un modelo hibrido `nemotron_h_omni`: combina capas de atencion con capas Mamba (state space model), organizadas en una mezcla de expertos (MoE) con expertos enrutados y expertos compartidos. El checkpoint cuantizado especifica que las up y down projections de los expertos enrutados afectan a 27.648 capas, ademas de expertos compartidos y `lm_head`, todos ellos convertidos a NVFP4 W4A16. Permanecen en BF16 las proyecciones de entrada y salida de Mamba, la atencion, las compuertas del router, las proyecciones latentes, la convolucion 1D, los embeddings y el encoder de vision C-RADIO con su proyector. La cuantizacion NVFP4 almacena cada peso como valor E2M1 de 4 bits con una escala FP8 E4M3 por bloque de 16 pesos y una escala FP32 por tensor, mientras que las activaciones se mantienen en BF16.

El proceso de cuantizacion es de solo pesos, por lo que no requiere datos de calibracion: cada peso se redondeo al mas cercano mediante `NVFP4QTensor.quantize` de ModelOpt, procesando un shard cada vez. El error relativo medio de los pesos desquantizados respecto a BF16 es 0,094. El script empleado se incluye en el repositorio (`scripts/convert_nvfp4.py`). No se dispone de informacion sobre los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, si hubo RLHF o DPO) ni sobre innovaciones de entrenamiento especificas; esa informacion no esta disponible en el material proporcionado.

## Capacidades

- Generacion de texto conversacional, con plantilla de chat y modo "thinking" activable o desactivable por peticion mediante `chat_template_kwargs`.
- Razonamiento matematico paso a paso: en GSM8K obtuvo 194/200 (97,0%) con thinking desactivado y temperatura 0.
- Generacion de codigo: se verifico una tarea de programacion con thinking activado (implementacion funcional de `nth_prime` y valor correcto de `nth_prime(100)`).
- Entrada multimodal de imagen y texto (pipeline `image-text-to-text`), con encoder de vision C-RADIO. El autor indica que la entrada de imagen y video no ha sido probada en este checkpoint.
- Tool calling / function calling: soportado mediante `--enable-auto-tool-choice` y el parser `qwen3_coder`; se verifico el parseo de una llamada a herramienta.
- Razonamiento multi-paso y agentes: el modo thinking y el parser de razonamiento `ultra_v3` permiten separar la traza de razonamiento de la respuesta final.
- Capacidades multilingues: no disponible.
- Capacidades especiales: modo thinking, entrada multimodal (imagen) y arquitectura hibrida Mamba-Transformer orientada a contextos largos.

## Casos de uso

- Despliegue local en hardware de memoria unificada: el checkpoint ocupa 48,35 GiB de pesos y cabe en un unico DGX Spark (GB10, 128 GB), lo que permite ejecutar un MoE de 74B en un equipo de sobremesa profesional sin clúster.
- Asistente conversacional de contexto largo: con una cache KV de 3.805.271 tokens medida a `--gpu-memory-utilization 0.80`, es adecuado para conversaciones multi-turno y analisis de documentos extensos donde se necesita retener grandes volumenes de contexto.
- Generacion de codigo con tool calling: su soporte de `--enable-auto-tool-choice` y del parser `qwen3_coder` permite integrarlo en asistentes de programacion que invocan funciones, ejecutan tests o consultan repositorios en pipelines automatizados.
- Razonamiento matematico y resolucion de problemas paso a paso: el 97,0% en GSM8K con thinking desactivado lo hace apto para tareas de calculo encadenado donde se requiere una respuesta trazable.
- Procesamiento de documentos con componentes visuales: al ser `image-text-to-text`, puede abordar tareas de extraccion o descripcion sobre imagenes, siempre que se valide el comportamiento del encoder de vision, no probado por el autor.
- Inferencia batching en servidor pequeño: con 8 peticiones concurrentes alcanza 84 tok/s agregados, lo que permite atender cargas de trabajo moderadas en un solo dispositivo.
- Prototipado e investigacion de cuantizacion NVFP4: sirve como referencia reproducible de una receta ModelOpt sobre un MoE hibrido, comparable con las liberaciones NVFP4 oficiales de NVIDIA.
- Evaluacion de agentes multi-paso en local: la combinacion de modo thinking, parser de razonamiento y tool calling permite construir y depurar flujos de agente sin depender de APIs en la nube.

## Benchmarks y rendimiento

| Benchmark / metrica | Resultado | Condiciones |
|---|---|---|
| GSM8K (primeras 200 preguntas de test) | 194/200 (97,0%) | thinking off, temperatura 0, prompt pidiendo pasos y linea `Answer: <number>` |
| Error relativo medio de pesos desquantizados vs BF16 | 0,094 | Cuantizacion NVFP4 W4A16 |
| Decode, una peticion | 17 tok/s | DGX Spark GB10, 128 GB |
| Decode, 8 peticiones simultaneas | 84 tok/s agregados | DGX Spark GB10, 128 GB |
| Memoria para pesos | 48,35 GiB | DGX Spark GB10 |
| Cache KV a `--gpu-memory-utilization 0.80` | 43,98 GiB, 3.805.271 tokens | DGX Spark GB10 |
| Tiempo de carga de pesos | 5 min 40 s | DGX Spark GB10 |

No se han publicado en la informacion disponible resultados de benchmarks comparativos con otros modelos (MMLU, HumanEval u otros).

## Requisitos de hardware

- VRAM estimada para inferencia: 48,35 GiB solo para pesos en NVFP4 W4A16; el repositorio completo ocupa 51,4 GB.
- Memoria adicional: con `--gpu-memory-utilization 0.80` se reservaron 43,98 GiB de cache KV en un DGX Spark, lo que suma mas de 92 GiB en uso.
- GPU recomendadas: DGX Spark (GB10, 128 GB) es el dispositivo probado por el autor. No se documentan pruebas en A100, H100, RTX 4090 u otras GPU.
- Cabe en consumer GPU: no hay datos que confirmen su ejecucion en GPU de consumo; con ~48 GiB de pesos no cabe en tarjetas de 24 GB (RTX 4090, RTX 3090) sin offloading, no documentado.
- Opciones de despliegue: vLLM nightly `0.31.1rc1.dev296+gfe4df3df0` (imagen `vllm/vllm-openai:nightly-fe4df3df0eb703862c686b256e9fe44fa94c8945`), con `VLLM_USE_V2_MODEL_RUNNER=1`, backend de atencion FLASHINFER y backend Mamba flashinfer en modo alineado. vLLM detecta el formato como `modelopt_mixed` y ejecuta las capas FP4 con kernels Marlin W4A16. Tambien se incluye `scripts/serve_bolt_nvfp4.sh` para Docker.
- Latencia y throughput estimados: 17 tok/s en una peticion y 84 tok/s agregados con 8 peticiones concurrentes, medidos en un unico DGX Spark.
- Nota de rendimiento: las proyecciones Mamba in/out permanecen en BF16 (4,4B parametros, unos 9 GB) y se leen en cada token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sapidlabs/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-NVFP4-W4A16 | 74B totales / 9B activos (denominacion) | Config. probada 65.536 tokens; cache KV de 3,8M tokens | NVFP4 W4A16 + BF16 | 51,4 GB | openmdw-1.1 | HuggingFace (sapidlabs) |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16 | 74B totales / 9B activos | no disponible | BF16 | 150 GB | openmdw-1.1 | HuggingFace (nvidia) |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4 | 30B totales / 3B activos (segun denominacion) | no disponible | NVFP4 (Mamba in/out en FP8) | no disponible | no disponible | HuggingFace (nvidia) |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada. La comparacion se limita a tamano, formato y licencia.

## Limitaciones y advertencias

- No es un checkpoint oficial de NVIDIA: la model card indica explicitamente que NVIDIA no participo en su creacion ni revision. Para uso critico debe validarse frente a la version BF16 oficial.
- Degradacion por cuantizacion: el error relativo medio de los pesos desquantizados es 0,094, lo que introduce desviaciones frente al modelo BF16 que pueden afectar a tareas sensibles a la precision.
- Entrada de imagen y video no probada: aunque el pipeline es `image-text-to-text` y se conserva el encoder de vision en BF16, el autor no ha validado este tipo de entradas.
- Idiomas soportados: no disponible; no se puede confirmar cobertura multilingue ni calidad fuera del ingles.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad, sesgo o toxicidad; se desconoce el comportamiento en dominios abiertos.
- Sesgos conocidos: no disponible.
- Restricciones de licencia: se distribuye bajo OpenMDW 1.1, la misma que el modelo base. No se detallan en la informacion disponible condiciones especificas para uso comercial; debe consultarse el texto de la licencia.
- Dependencia de versiones concretas de vLLM: el checkpoint requiere vLLM nightly con `VLLM_USE_V2_MODEL_RUNNER=1` y backends FlashInfer; versiones estables de vLLM pueden no soportar el formato `modelopt_mixed`.
- Requisito de `--trust-remote-code` y de un plugin externo (`ultra_v3_reasoning_parser.py`) para el parser de razonamiento.
- Hardware: las mediciones proceden de un DGX Spark; no hay datos sobre rendimiento o compatibilidad en otras GPU, por lo que las cifras de tok/s no son extrapolables.
- Rendimiento modesto en una sola peticion (17 tok/s), lo que limita su uso interactivo en tiempo real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sapidlabs/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-NVFP4-W4A16
- Modelo base (BF16): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16
- Receta NVFP4 de referencia de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
