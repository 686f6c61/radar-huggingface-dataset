# intel-ai/DeepSeek-V4-Flash-NVFP4-E5M3-Mixed-CT-AutoRound

## Resumen

DeepSeek-V4-Flash-NVFP4-E5M3-Mixed-CT-AutoRound es un checkpoint cuantizado del modelo DeepSeek-V4-Flash, publicado por el equipo de Intel AI (intel-ai) mediante su herramienta AutoRound. El modelo aplica una cuantizacion mixta: NVFP4 con formato E5M3 para los expertos enrutados y MXFP8 para el resto de capas lineales originalmente en FP8, manteniendo la precision de origen en los tensores de mayor rango. El resultado es un checkpoint de aproximadamente 149.210 millones de parametros empaquetados en formato compressed-tensors, con un repositorio de 168,7 GB.

La relevancia de esta publicacion radica en que demuestra que es posible reducir un modelo de gran tamano a 4 bits en sus componentes mas pesados (los expertos de una arquitectura MoE) sin perdida medible de rendimiento: la recuperacion media frente al modelo base supera el 99 % en la mayoria de benchmarks. El checkpoint esta pensado para despliegue en produccion con vLLM 0.33.0 y el plugin de Intel Neural Compressor, y ha sido validado en dos GPUs NVIDIA B200 con tensor parallelism de 2.

La licencia es MIT, lo que facilita su uso comercial, y el checkpoint hereda las capacidades del modelo base DeepSeek-V4-Flash, incluyendo modo de razonamiento (thinking), generacion de codigo, matematicas y soporte de contexto largo. La cuantizacion se realizo con RTN (round-to-nearest) sin datos de calibracion y sin iteraciones de optimizacion, lo que simplifica la reproducibilidad del proceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo MoE (deepseek_v4), con expertos enrutados y expertos compartidos |
| Parametros totales | 149.210.695.634 (segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la informacion proporcionada (la evaluacion uso un limite de generacion de 131.072 tokens) |
| Tipos de cuantizacion | NVFP4 E5M3 (grupo 16) para expertos enrutados; MXFP8 (grupo 32) para capas lineales originalmente FP8; precision de origen para tensores de mayor rango; formato compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors con compressed-tensors (integracion via transformers y vLLM) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash es un transformer con arquitectura de mezcla de expertos (MoE), identificado en Hugging Face con la arquitectura `deepseek_v4`. El checkpoint cuantizado conserva la estructura del modelo original: 43 capas por rango de tensor parallelism, con expertos enrutados, expertos compartidos y modulos auxiliares como `wo_a`, `compressor` e `indexer`. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esa informacion corresponderia a la model card del modelo base, que no se incluye en la informacion proporcionada.

La innovacion tecnica de este checkpoint es el esquema de cuantizacion mixta. Los expertos enrutados, que concentran la mayor parte de los parametros, se cuantizan a NVFP4 con formato E5M3 (5 bits de exponente, 3 de mantisa) y tamano de grupo 16, lo que reduce drasticamente el peso en memoria. El resto de capas lineales originalmente en FP8 (incluidos expertos compartidos y `wo_a`) se cuantizan a MXFP8 con grupo 32, y los tensores que ya estaban en mayor precision se mantienen intactos. El proceso usa RTN sin calibracion (`--model_free --disable_opt_rtn`), lo que evita dependencias de datos y acelera la generacion del checkpoint.

En inferencia, el plugin de vLLM enruta los expertos por FP4 Marlin con cuantizacion de activaciones E5M3 y convierte `wo_a` de MXFP8 a BF16 en tiempo de carga para computo en CUDA. Esta conversion se controla con las variables de entorno `VLLM_PLUGINS=deepseek_v4_wo_a_bf16` y `VLLM_DEEPSEEK_V4_WO_A_BF16=1`.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modo thinking activable mediante `--reasoning-parser deepseek_v4` y `--default-chat-template-kwargs '{"thinking":true,"enable_thinking":true}'`.
- Razonamiento matematico de nivel competitivo: los benchmarks reportados incluyen AIME26 (96,67), MATH-500 (96,80) y GSM8K (96,89).
- Razonamiento cientifico y de conocimiento general: GPQA Diamond (85,76), MMLU (92,05), MMLU-Pro (85,76).
- Generacion de codigo: el modelo base esta orientado a tareas de programacion, aunque la model card no desglosa resultados de HumanEval ni similares.
- Soporte de tool calling y function calling: no se detalla explicitamente en la informacion proporcionada, aunque el pipeline `text-generation` y la integracion con vLLM permiten su uso en pipelines de agentes.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Contexto largo: la evaluacion se realizo con un limite de generacion de 131.072 tokens, lo que sugiere soporte de ventanas de contexto extensas, aunque la longitud exacta no se especifica.
- Despliegue eficiente en precision mixta: el checkpoint esta disenado para servir en vLLM con tensor parallelism y cuantizacion compressed-tensors.

## Casos de uso

- Razonamiento matematico asistido: el modelo puede resolver problemas de competicion (AIME, MATH-500) con puntuaciones superiores al 96 %, adecuado para tutoria automatizada, verificacion de demostraciones y generacion de problemas con solucion.
- Atencion al cliente con contexto largo: la ventana de generacion de hasta 131.072 tokens permite gestionar conversaciones multi-turno con historial extenso y documentos adjuntos, manteniendo coherencia en dialogues largos.
- Generacion de codigo en produccion: integrable en pipelines de CI/CD mediante vLLM como servidor OpenAI-compatible, con modo thinking para tareas de depuracion y refactorizacion compleja.
- Analisis de documentos tecnicos y cientificos: el rendimiento en GPQA Diamond (85,76) y MMLU-Pro (85,76) lo hace adecuado para extraccion de informacion y respuesta a preguntas sobre literatura especializada.
- Despliegue en infraestructura de gama alta con requisitos de eficiencia: la cuantizacion NVFP4 reduce el peso en memoria de los expertos, permitiendo servir un modelo de 149.000 millones de parametros en dos GPUs B200 con tensor parallelism de 2.
- Evaluacion comparativa de tecnicas de cuantizacion: util como referencia para investigadores que estudian la recuperacion de rendimiento tras cuantizacion agresiva (4 bits) en arquitecturas MoE.
- Sistemas de agentes con razonamiento multi-paso: el modo thinking y el parser de razonamiento de vLLM permiten construir agentes que planifican y ejecutan tareas secuenciales con trazas de razonamiento separadas.

## Benchmarks y rendimiento

Resultados de EvalScope con thinking habilitado y limite de generacion de 131.072 tokens. PIQA y HellaSwag usan accuracy; MMLU esta ponderado por numero de preguntas por materia; AIME26 usa 30 preguntas con 10 repeticiones y GPQA Diamond 198 preguntas con 5 repeticiones. La columna de recuperacion divide la puntuacion del checkpoint cuantizado entre la del modelo base.

| Benchmark | Modelo base | NVFP4 E5M3 Mixed | Recuperacion |
|---|---:|---:|---:|
| AIME26 | 96,00 | 96,67 | 100,70 % |
| GPQA Diamond | 87,37 | 85,76 | 98,16 % |
| PIQA | 95,16 | 95,05 | 99,88 % |
| MMLU | 91,86 | 92,05 | 100,21 % |
| MMLU-Pro | 85,37 | 85,76 | 100,46 % |
| MATH-500 | 96,80 | 96,80 | 100,00 % |
| HellaSwag | 86,34 | 86,02 | 99,63 % |
| GSM8K | 96,74 | 96,89 | 100,16 % |

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 168,7 GB en disco; en inferencia, el checkpoint se sirve con `--gpu-memory-utilization 0.75` sobre dos GPUs B200, lo que implica un consumo agregado de aproximadamente 135 GB de VRAM (0,75 × 2 × 180 GB). No se dispone de estimaciones para otras configuraciones.
- GPUs recomendadas: NVIDIA B200 (validado con dos unidades y tensor parallelism de 2). No hay datos de validacion en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: no disponible; el tamano del checkpoint (168,7 GB) y la necesidad de FP4 Marlin sugieren que no es viable en GPUs de consumo convencionales, pero no se ha publicado una prueba al respecto.
- Opciones de despliegue: vLLM 0.33.0 con el plugin de Intel Neural Compressor (`benchmark/vllm-qdq-plugin`), PyTorch 2.14.0, Transformers 5.20.2, compressed-tensors 0.17.0 y FlashInfer 0.7.2.post1. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada. La configuracion de servicio usa `--max-num-seqs 4`, `--max-num-batched-tokens 4096`, `--block-size 256` y `--enable-chunked-prefill`.
- Variables de entorno relevantes: `CUDA_VISIBLE_DEVICES=0,1`, `NCCL_NVLS_ENABLE=0`, `VLLM_WORKER_MULTIPROC_METHOD=spawn`, `VLLM_PLUGINS=deepseek_v4_wo_a_bf16`, `VLLM_DEEPSEEK_V4_WO_A_BF16=1`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| intel-ai/DeepSeek-V4-Flash-NVFP4-E5M3-Mixed-CT-AutoRound | 149.210.695.634 | no disponible | NVFP4 E5M3 + MXFP8 | MIT | Hugging Face (intel-ai) |
| deepseek-ai/DeepSeek-V4-Flash (base) | no disponible en la informacion | no disponible | FP8 / BF16 original | no disponible en la informacion | Hugging Face (deepseek-ai) |
| intel-ai/DeepSeek-V4-Flash-NVFP4-Mixed-CT-AutoRound | no disponible en la informacion | no disponible | NVFP4 mixto | no disponible en la informacion | Hugging Face (intel-ai) |

La comparativa se limita a las variantes mencionadas en la model card. No se dispone de datos de otros modelos de la misma categoria (por ejemplo, otros MoE de ~150.000 millones de parametros) en la informacion proporcionada.

## Limitaciones y advertencias

- El checkpoint hereda las limitaciones del modelo base, incluida la generacion de contenido inexacto o sesgado; la model card lo advierte explicitamente.
- La cuantizacion a 4 bits en los expertos puede degradar tareas no cubiertas por los benchmarks reportados; la recuperacion en GPQA Diamond cae al 98,16 %, la mas baja de la tabla.
- No se especifican los idiomas soportados, por lo que no se puede garantizar un rendimiento multilingue homogeneo.
- La longitud de contexto no se documenta; el limite de 131.072 tokens corresponde al ajuste de evaluacion, no necesariamente a la ventana nativa del modelo.
- El despliegue requiere una version concreta de vLLM (0.33.0) y un plugin especifico de Intel Neural Compressor (revision `e6825b6`), lo que limita la portabilidad a otros stacks de inferencia.
- La validacion se ha realizado exclusivamente en NVIDIA B200; no hay datos de compatibilidad con A100, H100 u otras GPUs.
- El proceso de cuantizacion usa RTN sin calibracion, lo que puede ser suboptimo frente a tecnicas con datos de calibracion en dominios especializados.
- Aunque la licencia es MIT, el uso comercial debe verificar tambien las condiciones del modelo base DeepSeek-V4-Flash, cuya licencia no se detalla en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/intel-ai/DeepSeek-V4-Flash-NVFP4-E5M3-Mixed-CT-AutoRound
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Repositorio AutoRound: https://github.com/intel/auto-round
- Paper AutoRound (arXiv:2309.05516): https://arxiv.org/abs/2309.05516
- Variante de referencia NVFP4 Mixed: https://huggingface.co/intel-ai/DeepSeek-V4-Flash-NVFP4-Mixed-CT-AutoRound
- Plugin vLLM de Intel Neural Compressor: https://github.com/intel/neural-compressor/tree/main/benchmark/vllm-qdq-plugin
