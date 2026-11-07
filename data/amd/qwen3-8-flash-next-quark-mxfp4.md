# amd/Qwen3.8-Flash-Next-Quark-MXFP4

## Resumen

amd/Qwen3.8-Flash-Next-Quark-MXFP4 es un checkpoint cuantizado del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicado por AMD mediante su herramienta de optimizacion AMD-Quark. El modelo original, desarrollado por el equipo Qwen de Alibaba, acepta texto, imagen y video como entrada y genera texto, con una arquitectura denominada Qwen4ExpForConditionalGeneration que combina mezcla de expertos (MoE), atencion lineal de estilo Mamba y componentes de hyper-connection. El checkpoint cuenta con 119.484.039.059 parametros totales segun los pesos en safetensors, y el repositorio ocupa 182,3 GB.

La aportacion concreta de esta version es la cuantizacion de todos los expertos MoE del modelo de lenguaje, incluido el experto compartido, a OCP MXFP4 (4 bits en formato microscaling), manteniendo el resto de componentes en bf16: atencion completa, proyecciones de atencion lineal, cabeza MTP, routers, torre de vision, mixers de hyper-connection y `lm_head`. El resultado es una reduccion sustancial del peso en memoria con una recuperacion de precision muy alta respecto al modelo en bf16, segun los datos publicados por AMD.

Es relevante ahora porque permite desplegar un modelo multimodal de gran tamano en hardware AMD Instinct MI350 y MI355 con ROCm 7.2.3 y vLLM, sin renunciar practicamente a ninguna capacidad de razonamiento, matematicas o vision. La licencia es "other" y el modelo solo declara ingles como idioma soportado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen4ExpForConditionalGeneration (MoE con atencion lineal estilo Mamba, hyper-connections y cabeza MTP) |
| Parametros totales | 119.484.039.059 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (las configuraciones de evaluacion usan hasta 131.072 tokens de generacion) |
| Tipos de cuantizacion | MXFP4 (OCP microscaling FP4) en pesos y activaciones de expertos MoE; bf16 en el resto |
| Idiomas soportados | en |
| Licencia | other (enlace a LICENSE en el repositorio) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos que incorpora atencion lineal de tipo Mamba junto a atencion completa, ademas de mecanismos de hyper-connection y una cabeza de prediccion multi-token (MTP). La model card menciona tambien una ruta "PLE n-gram" y una torre de vision para el procesamiento de imagenes y video. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada.

La innovacion de este checkpoint es exclusivamente de cuantizacion, no de entrenamiento. AMD-Quark aplica cuantizacion estatica de pesos y dinamica de activaciones en formato OCP MXFP4 a todos los expertos enrutados y al experto compartido, excluyendo explicitamente `lm_head`, las puertas del router y del experto compartido, `mtp.*`, `model.visual.*`, `*hyper_connection*`, `*ple.*`, `*linear_attn.*` y `*self_attn.*`. El script de cuantizacion incluido en la model card muestra el uso de `SplitFusedExperts` para descomponer las proyecciones fusionadas `gate_up_proj` y `down_proj` antes de cuantizar. El resultado es un checkpoint mixto: expertos en 4 bits, resto en bf16.

## Capacidades

- Generacion de texto a partir de entradas multimodales: texto, imagen y video como entrada, texto como salida.
- Razonamiento matematico de nivel competitivo, evidenciado por resultados en GSM8K, AIME26 y GPQA Diamond.
- Razonamiento visual y comprension de documentos, graficos y diagramas (MMMU Pro en variantes standard y vision).
- Generacion y comprension de codigo cientifico e ingenieril (SciCode).
- Seguimiento de instrucciones complejas y formato (IFBench).
- Razonamiento de contexto largo (AA-LCR).
- Soporte de tool calling y function calling en vLLM mediante `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder`.
- Modo de razonamiento explicito, activable con `--reasoning-parser qwen3`.
- Compatible con endpoints estilo OpenAI (`endpoints_compatible` en los tags del repositorio).
- Capacidades multilingues limitadas al ingles segun la model card.

## Casos de uso

- Asistencia tecnica sobre documentacion visual: el modelo puede recibir capturas de pantalla, diagramas de arquitectura o tablas y responder preguntas sobre ellos, gracias a la torre de vision mantenida en bf16 y a su rendimiento en MMMU Pro.
- Analisis de video para monitorizacion o extraccion de eventos: la entrada de video permite resumir secuencias y responder consultas temporales sin pipeline separado de vision.
- Razonamiento matematico y cientifico asistido: con un 96,5 en GSM8K y 98,33 en AIME26 (mean@16), es adecuado para tutoria, verificacion de derivaciones y resolucion de problemas de nivel avanzado.
- Generacion de codigo cientifico: con 48,58 en SciCode (mean@8), puede emplearse para prototipar codigo de simulacion, analisis numerico y pipelines de datos cientificos.
- Agentes multi-paso con tool calling: integrable en vLLM con parser `qwen3_coder` para orquestar llamadas a funciones en flujos de automatizacion, con hasta 256 secuencias concurrentes por servidor segun la receta de despliegue.
- Procesamiento de contextos largos: con generaciones de hasta 131.072 tokens en las evaluaciones y cache de prefijos activada, es viable para analisis de corpus extensos, revision de contratos o resumen de transcripciones largas.
- Despliegue en infraestructura AMD: caso de uso especifico de este checkpoint, orientado a entornos con MI350 o MI355 donde se quiera maximizar densidad de modelos por nodo reduciendo el peso de los expertos a 4 bits.

## Benchmarks y rendimiento

| Benchmark | Qwen3.8-Flash-Next (bf16) | Quark-MXFP4 (este modelo) | Recuperacion |
|---|---|---|---|
| GSM8K (5-shot) | 96,8 | 96,5 | 99,7% |
| GPQA Diamond (mean@8) | 91,67 | 91,67 | 100,00% |
| AIME26 (mean@16) | 99,17 | 98,33 | 99,15% |
| MMMU Pro, standard (mean@1) | 79,65 | 80,00 | 100,44% |
| MMMU Pro, vision (mean@1) | 78,38 | 77,40 | 98,75% |
| SciCode, subproblem (mean@8) | 49,01 | 48,58 | 99,12% |
| AA-LCR (mean@16) | 78,50 | 80,63 | 102,71% |
| IFBench (mean@5) | 83,27 | 82,67 | 99,28% |

Los resultados se obtuvieron con vLLM y EvalScope 1.14.1, con sandbox `scicode-benchmark:7687150b169df5091c158abb` para SciCode. La recuperacion es igual o superior al 98,75% en todas las tareas, y en MMMU Pro standard y AA-LCR el modelo cuantizado supera ligeramente al bf16, lo que AMD atribuye a variabilidad entre ejecuciones.

## Requisitos de hardware

- Microarquitectura soportada oficialmente: AMD Instinct MI350 y MI355.
- Sistema operativo: Linux. ROCm 7.2.3, PyTorch 2.12.0+git6bbd260, Transformers 5.16.1.
- Motor de inferencia: vLLM con frontend Rust (`VLLM_USE_RUST_FRONTEND=1`), AITER habilitado (`VLLM_ROCM_USE_AITER=1`, `VLLM_ROCM_USE_AITER_FUSION_SHARED_EXPERTS=1`) y backend de prefill `aiter_flydsl`.
- Configuracion de referencia: `--tensor-parallel-size 2`, `--gpu-memory-utilization 0.90`, `--max-num-seqs 256`, `--enable-prefix-caching`.
- VRAM estimada: no disponible de forma explicita; el repositorio pesa 182,3 GB, por lo que el despliegue en bf16 de los componentes no cuantizados exige un nodo multi-GPU. No se ha publicado una cifra de VRAM por GPU.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no disponible. El modelo solo declara soporte para MI350/MI355 y no se documenta una ruta llama.cpp, GGUF u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Hardware objetivo | Cuantizacion |
|---|---|---|---|---|---|
| amd/Qwen3.8-Flash-Next-Quark-MXFP4 | 119,48 B | no disponible | other | AMD MI350/MI355 | MXFP4 en expertos MoE |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | no disponible | no disponible | bf16 |
| Alternativas de mismo tamano y categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es contra el modelo base en bf16, con las cifras de recuperacion de la tabla de benchmarks. No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La model card solo declara ingles como idioma soportado; el rendimiento en castellano no esta documentado y no deberia asumirse.
- No se han publicado analisis de sesgos ni evaluaciones de seguridad para este checkpoint.
- Riesgo de alucinacion inherente a los modelos generativos; los benchmarks de razonamiento no garantizan veracidad factual.
- La licencia es "other" con un fichero LICENSE propio; es imprescindible revisarlo antes de cualquier uso comercial, ya que las condiciones pueden diferir de las del modelo base.
- El checkpoint esta pensado para hardware AMD MI350/MI355 con ROCm; no se documenta soporte para CUDA ni para GPUs de consumo.
- La cuantizacion MXFP4 se aplica solo a los expertos MoE; el resto del modelo permanece en bf16, por lo que el ahorro de memoria es parcial y el despliegue sigue requiriendo multiples GPUs.
- Los resultados de benchmarks varian entre ejecuciones, segun advierte el propio autor.
- No se dispone de informacion sobre longitud de contexto nativa, numero de parametros activos ni regimen de entrenamiento del modelo base en la informacion proporcionada.

## Enlaces

- Repositorio Hugging Face del checkpoint cuantizado: https://huggingface.co/amd/Qwen3.8-Flash-Next-Quark-MXFP4
- Repositorio del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del checkpoint: https://huggingface.co/amd/Qwen3.8-Flash-Next-Quark-MXFP4/blob/main/LICENSE
- Documentacion de AMD-Quark: https://quark.docs.amd.com/latest/index.html
- Documentacion de vLLM: https://docs.vllm.ai/en/latest/
- Receta de vLLM para Qwen3.8-Flash-Next en MI355X: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next?hardware=mi355x&variant=bf16&frontend=rust
- Documentacion de EvalScope: https://evalscope.readthedocs.io/en/latest/
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
