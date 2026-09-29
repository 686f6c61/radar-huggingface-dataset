# AxionML/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4

## Resumen

El modelo AxionML/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4 es una copia espejo (mirror) sin modificaciones del checkpoint cuantizado por NVIDIA nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4, que a su vez es la version en NVFP4 del modelo multimodal nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16. AxionML se limita a redistribuirlo para facilitar su despliegue en servicios de inferencia open source; la autoria del modelo y de la cuantizacion corresponde a NVIDIA.

Se trata de un modelo omni-modal any-to-any que acepta video (hasta 2 minutos), audio (hasta 1 hora), imagen y texto, y produce texto. La arquitectura combina un LLM hibrido Mamba2-Transformer con mezcla de expertos (MoE), un codificador visual C-RADIO v4-H y un codificador de voz Parakeet. La model card declara 31.000 millones de parametros totales con aproximadamente 3.000 millones activados por token y una ventana de contexto de 256.000 tokens, lo que lo situa en la gama de modelos multimodales eficientes en computo pero con contexto muy largo.

Su relevancia actual es doble: por un lado, es uno de los primeros Nemotron en incorporar audio nativo junto a texto, imagen y video; por otro, la cuantizacion NVFP4 reduce el checkpoint a unos 21 GB (4,98 bits efectivos por peso) manteniendo cifras de evaluacion casi identicas a las de BF16, lo que permite ejecutarlo en una unica GPU consumer Blackwell como la RTX 5090, o en dispositivos como DGX Spark y Jetson Thor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba2-Transformer hybrid MoE (Nemotron 3 Nano LLM) + codificador de vision C-RADIO v4-H + codificador de voz Parakeet |
| Parametros totales | 31B segun la model card; el recuento de safetensors del repositorio indica 18.326.275.008 parametros (discrepancia atribuible al empaquetado de pesos FP4) |
| Parametros activos | ~3B (aproximadamente, segun la model card) |
| Longitud de contexto | 256K tokens (la receta de despliegue de vLLM del autor usa `--max-model-len 131072`) |
| Tipos de cuantizacion | Mixta: expertos enrutados del MoE en NVFP4; `in_proj`/`out_proj` de Mamba, expertos compartidos y `o_proj` de atencion en FP8; codificadores y proyectores de vision y audio en BF16. KV cache en FP8 |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model Agreement (etiquetada como `license: other`) |
| Formato de pesos | safetensors (repositorio de 22,4 GB; checkpoint de ~21 GB) |

## Arquitectura y entrenamiento

La arquitectura es un hibrido Mamba2-Transformer con capas de mezcla de expertos, mas dos torres de percepcion: C-RADIO v4-H para vision (imagen y video) y Parakeet para voz. Los codificadores y sus proyectores se mantienen en BF16 tras la cuantizacion, mientras que el cuerpo del LLM se cuantiza de forma selectiva: los expertos enrutados pasan a NVFP4 y las proyecciones de Mamba, los expertos compartidos y la proyeccion de salida de atencion a FP8. El pipeline declarado es `any-to-any`, con entrada de video, audio, imagen y texto, y salida de texto.

En cuanto a los datos, la informacion disponible atribuye a la familia Nemotron-Omni un escalado de entrenamiento de adaptadores y codificadores de aproximadamente 127.000 millones de tokens en modalidades mixtas (texto+imagen, texto+video, texto+audio y texto+video+audio). No se especifican en la informacion disponible el volumen de tokens de preentrenamiento del LLM, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO. Si se documenta un modo de razonamiento explicito (`--reasoning-parser nemotron_v3`, con ajustes recomendados de `temperature=0.6` y `top_p=0.95` en modo thinking, y `temperature=0.2`, `top_k=1` en modo instruct).

La innovacion tecnica mas destacable de esta variante es la cuantizacion NVFP4: un codebook E2M1 de 4 bits combinado con escalas FP8 (E4M3) por micro-bloques de 16 elementos, en lugar de escalas de solo potencias de dos. Esto permite escalas fraccionarias y seleccion de escala que minimiza el error, con acumulacion en FP32 en los Tensor Cores de arquitecturas Blackwell. El resultado declarado es una degradacion minima frente a BF16 en las evaluaciones multimodales publicadas.

## Capacidades

- Comprension y generacion de texto con razonamiento explicito (modo thinking) y modo instruct.
- Entrada de imagen: respuesta a preguntas visuales, razonamiento sobre graficos (Charxiv), OCR (OCRBenchV2 en ingles) y comprension 2D (CVBench2D).
- Entrada de video de hasta 2 minutos, con comprension temporal (Video MME, World Sense) y soporte de pruning de video en el servidor.
- Entrada de audio de hasta 1 hora: comprension de audio (MMAU) y transcripcion de voz (HF-ASR, con WER reportado).
- Procesamiento conjunto de texto, imagen, video y audio en una misma peticion (Daily Omni mide el rendimiento omni-modal).
- Documentos de contexto largo: la ventana de 256K tokens se evalua con MMlongBench Doc.
- Tool calling y function calling: compatible con `--enable-auto-tool-choice` y el parser `qwen3_coder` en vLLM.
- Capacidades de agente y razonamiento multi-paso, derivadas del modo de razonamiento y del soporte de herramientas.
- Capacidades multilingues: no disponibles en la informacion proporcionada (las evaluaciones de OCR y ASR reportadas son en ingles).

## Casos de uso

- Transcripcion y analitica de reuniones largas: el modelo acepta hasta 1 hora de audio por peticion, por lo que puede transcribir y resumir una reunion completa sin trocear el audio, manteniendo coherencia entre intervenciones.
- Busqueda y respuesta sobre documentos empresariales extensos: con 256K tokens de contexto y MMlongBench Doc como referencia, permite indexar manuales, contratos o informes y hacer preguntas sobre ellos con el documento completo en el prompt.
- Digitalizacion de documentos con OCR: extraccion de texto y estructura de facturas, formularios o informes escaneados, combinando OCRBenchV2 con razonamiento sobre la salida para normalizar campos.
- Analisis de video de vigilancia o control de calidad industrial: con clips de hasta 2 minutos y poda de video configurable (`--video-pruning-rate 0.5`, 2 fps, 256 frames), se puede inspeccionar una secuencia y generar informes textuales de incidencias.
- Agentes GUI y automatizacion de interfaces: la comprension de capturas de pantalla permite construir agentes que interpretan el estado de una aplicacion y deciden la siguiente accion, apoyandose en el soporte de tool calling para ejecutar comandos.
- Asistente de accesibilidad multimodal: descripcion de imagenes y videos y transcripcion de audio en un unico flujo, util para convertir contenido audiovisual en texto accesible.
- Tutorizacion sobre problemas visuales: MathVista_MINI (71,30 en NVFP4) indica capacidad de razonamiento matematico sobre figuras, aprovechable en plataformas educativas que reciben fotos de ejercicios.
- Despliegue en el borde (edge): gracias al checkpoint de ~21 GB y a ~3B parametros activos, puede servir en una RTX 5090, un DGX Spark o un Jetson Thor para tareas de transcripcion y resumen en local, sin enviar audio o video a la nube.

## Benchmarks y rendimiento

Resultados publicados por NVIDIA (modo no-reasoning), comparando la version BF16 con FP8 y NVFP4:

| Benchmark | BF16 | FP8 | NVFP4 |
|---|---|---|---|
| MathVista_MINI | 71,90 | 71,05 | 71,30 |
| Charxiv Reasoning | 49,10 | 48,05 | 47,95 |
| MMlongBench Doc | 46,10 | 45,84 | 45,78 |
| OCRBenchV2 (EN) | 65,80 | 65,63 | 65,77 |
| CVBench2D | 84,20 | 85,62 | 85,27 |
| Video MME | 70,80 | 69,40 | 69,60 |
| Daily Omni | 74,50 | 74,06 | 74,23 |
| World Sense | 55,20 | 54,40 | 54,60 |
| MMAU | 74,62 | 74,56 | 74,34 |
| HF-ASR (WER, menor es mejor) | 5,95 | 5,97 | 5,95 |

No se han publicado en la informacion disponible resultados de benchmarks de texto puro (MMLU, GSM8K, HumanEval) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa ~21 GB (4,98 bits efectivos por peso), a lo que hay que sumar la KV cache en FP8 y los buffers de vision y audio; con contexto reducido cabe en GPUs de 24-32 GB. Con `--max-model-len 131072` y `--max-num-seqs 384` la KV cache crece de forma apreciable.
- GPUs recomendadas: la model card indica que funciona en una unica RTX 5090, en un DGX Spark o en un Jetson Thor, es decir, hardware Blackwell con soporte nativo de FP4. La compatibilidad con GPU anteriores (Ada, Hopper) no esta documentada en la informacion disponible.
- Cabe en GPU consumer: si, en RTX 5090 (32 GB) segun la propia model card. Para GPUs de 24 GB no hay confirmacion en la informacion disponible.
- Opciones de despliegue: vLLM 0.20.0 (imagen `vllm/vllm-openai:v0.20.0`), con `pip install "vllm[audio]"` para entrada de audio. SGLang upstream no soporta NVFP4 todavia (solo BF16), segun el propio autor. El repositorio tambien incluye la etiqueta `sglang` como referencia de ecosistema.
- Comando de referencia del autor: `vllm serve AxionML/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4 --max-model-len 131072 --tensor-parallel-size 1 --trust-remote-code --video-pruning-rate 0.5 --max-num-seqs 384 --media-io-kwargs '{"video": {"fps": 2, "num_frames": 256}}' --reasoning-parser nemotron_v3 --enable-auto-tool-choice --tool-call-parser qwen3_coder --kv-cache-dtype fp8`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4 (este) | 31B totales / ~3B activos (model card) | 256K | Texto, imagen, video, audio | NVIDIA Open Model Agreement | HuggingFace (mirror de AxionML) |
| Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16 | 31B totales / ~3B activos | 256K | Texto, imagen, video, audio | NVIDIA Open Model Agreement | HuggingFace (NVIDIA), ~62 GB en BF16 (estimado a partir de 4,98 bits efectivos frente a 16) |
| Nemotron-3-Nano-Omni-30B-A3B-Reasoning-FP8 | 31B totales / ~3B activos | 256K | Texto, imagen, video, audio | NVIDIA Open Model Agreement | Evaluado en la tabla de resultados de NVIDIA; disponibilidad no confirmada en la informacion disponible |
| Nemotron Nano V2 VL (predecesor) | no disponible | no disponible | Texto, imagen, video (sin audio nativo) | no disponible | no disponible |

Los datos de comparacion con alternativas de otros fabricantes (por ejemplo, modelos omni de la misma franja de parametros) no estan disponibles en la informacion proporcionada. La unica comparacion cuantitativa documentada es interna a la familia: NVFP4 mantiene resultados praticamente identicos a BF16 en los diez benchmarks reportados, con diferencias maximas en torno a 1,15 puntos (Charxiv Reasoning) y en algunos casos ligeramente mejores que BF16 (CVBench2D, 85,27 frente a 84,20).

## Limitaciones y advertencias

- Sesgos: el modelo base se entreno con datos que pueden contener lenguaje toxico y sesgos sociales; el modelo cuantizado hereda esas limitaciones y puede generar contenido inexacto, sesgado u ofensivo.
- Alucinacion: la model card no documenta mitigaciones especificas; como cualquier modelo generativo multimodal, puede producir descripciones, transcripciones o cifras no sustentadas por la entrada.
- Evaluaciones en modo no-reasoning: las cifras publicadas corresponden a modo no-reasoning, por lo que no reflejan el rendimiento del modo thinking, que es el que recomienda el autor para razonamiento.
- Idiomas: no se declara la lista de idiomas soportados. Las evaluaciones de OCR (OCRBenchV2) y ASR (HF-ASR) son en ingles, de modo que el rendimiento en castellano no esta verificado.
- Licencia: se distribuye bajo la NVIDIA Open Model Agreement, que permite uso comercial pero impone condiciones (aviso incluido en el repositorio como `NVIDIA_OPEN_MODEL_AGREEMENT.md` y `NOTICE`). Es imprescindible revisarla antes de un despliegue en produccion.
- Dependencia de hardware: NVFP4 esta disenado para los Tensor Cores FP4 de Blackwell; en hardware anterior el rendimiento y la compatibilidad no estan documentados.
- Soporte de servidores: SGLang upstream no soporta NVFP4 todavia, y los parsers de razonamiento y de tool calling estan atados a versiones concretas de vLLM (0.20.0), lo que puede complicar las actualizaciones.
- Este repositorio es un espejo: no ha sido validado ni modificado por AxionML mas alla de la copia, y no presenta descargas ni valoraciones en el momento de la consulta.
- Consistencia de parametros: existe una discrepancia entre los 31B declarados en la model card y los 18.326.275.008 parametros contados en los safetensors; conviene verificarlo si el dimensionado de memoria es critico.

## Enlaces

- Repositorio en HuggingFace (este mirror): https://huggingface.co/AxionML/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4
- Modelo cuantizado original de NVIDIA: https://huggingface.co/nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4
- Modelo base en BF16: https://huggingface.co/nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16
- Modelo base en BF16 (organizacion nvidia-ai): https://huggingface.co/nvidia-ai/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16
- Paper: Nemotron 3 Nano Omni: Efficient and Open Multimodal Intelligence: https://arxiv.org/abs/2604.24954
- Version HTML del paper: https://arxiv.org/html/2604.24954v1
- Model card en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning/modelcard
- Herramienta de cuantizacion NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
- Perfil del mirror AxionML: https://huggingface.co/AxionML
