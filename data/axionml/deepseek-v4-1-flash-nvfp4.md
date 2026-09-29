# AxionML/DeepSeek-V4.1-Flash-NVFP4

## Resumen

AxionML/DeepSeek-V4.1-Flash-NVFP4 es un espejo (mirror) del checkpoint cuantizado por NVIDIA nvidia/DeepSeek-V4.1-Flash-NVFP4, que a su vez es una version en NVFP4 del modelo base deepseek-ai/DeepSeek-V4.1-Flash. El repositorio lo publica AxionML con el objetivo de ofrecer pesos listos para servir en infraestructura abierta; la cuantizacion en si es obra de NVIDIA, realizada con NVIDIA Model Optimizer v0.47.0rc0, y los pesos son una copia sin modificar de dicha revision. El modelo base es un MoE causal encoder-decoder con Compressed Sparse Attention 2 (clase `DeepseekV41ForCausalLM`), pensado para generacion de texto e imagenes.

El checkpoint declara 552B de parametros en el backbone mas 196B de memoria condicional Engram. El repositorio contiene 763.205.315.794 parametros reales segun los safetensors (~763B, incluyendo embeddings y componentes auxiliares), repartidos en 40 capas con 384 expertos enrutados y solo 6 activos por token, lo que da 8B de parametros activos en prefill y 16B en decode. La longitud de contexto soportada es de 1M tokens y el tamano del checkpoint en disco es de aproximadamente 527 GB.

Su relevancia actual es doble: por un lado, demuestra que un MoE de escala frontera puede servirse con pesos de 4 bits por elemento (W4A4) sin degradar de forma apreciable las metricas de razonamiento, codigo o agentes; por otro, la cuantizacion esta pensada para los Tensor Cores FP4 nativos de Blackwell, lo que la ata a hardware GB200/GB300 para aprovechar los multiplicadores FP4. La licencia MIT permite uso comercial y no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE causal encoder-decoder con Compressed Sparse Attention 2 (`DeepseekV41ForCausalLM`) |
| Parametros totales | 763.205.315.794 (552B backbone + 196B memoria Engram, segun model card) |
| Parametros activos | 8B en prefill / 16B en decode |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | NVFP4 W4A4 (group size 16, E2M1 con escalas de bloque FP8 E4M3) en expertos MoE enrutados (`w1`, `w2`, `w3`); MXFP8 en atencion, expertos compartidos, vision, tablas Engram y tensores MTP/DSpark |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de ~527,3 GB) |
| Expertos | 384 enrutados, 6 activos |
| Capas | 40 |
| Entradas | texto e imagen (`image-text-to-text`) |
| Blokes de pesos convertidos | 16.986.931.200 (conversion de pesos sin perdida; solo se reescriben las escalas de bloque) |
| Herramienta de cuantizacion | NVIDIA Model Optimizer v0.47.0rc0 |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE causal de tipo encoder-decoder con una variante de atencion denominada Compressed Sparse Attention 2. La capa MoE consta de 384 expertos enrutados de los que se activan 6 por token, distribuidos en 40 capas, lo que mantiene el coste de computo por token en el rango de un modelo denso de 8B-16B de parametros activos pese a los mas de 550B totales del backbone. Ademas del backbone, incorpora una memoria condicional Engram de 196B de parametros, que aporta capacidad adicional sin activarse de la misma forma que los expertos. El modelo acepta texto e imagen como entrada.

Sobre el entrenamiento (numero de tokens, composicion del dataset, si hubo RLHF, DPO u otras fases de alineamiento) no hay informacion en la documentacion disponible de este repositorio; esa informacion corresponderia a la model card del modelo base, que aqui solo se referencia. Lo que si esta documentado es el proceso de cuantizacion posterior: NVIDIA convirtio los expertos MoE enrutados desde el formato MXFP4 de origen a NVFP4 W4A4 con grupo de 16 elementos. NVFP4 combina un codebook E2M1 de 4 bits con escalas de bloque FP8 (E4M3) sobre microbloques de 16 elementos, lo que permite escalas fraccionarias y saturacion controlada en lugar de codificar NaN/Inf; la acumulacion se hace en FP32 para proteger la precision del producto escalar. La calibracion de escalas de activacion se hizo con 1.024 muestras de cnn_dailymail y Nemotron-Post-Training-Dataset-v2. La conversion de pesos es sin perdida: los 16.986.931.200 bloques conservan sus valores de desquantizacion y solo se reescriben las escalas de bloque. Se preservan los tensores DSpark del decodificador especulativo, aunque la decodificacion especulativa no fue validada segun la model card.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modo de pensamiento activable mediante el parametro `reasoning_effort` a nivel de peticion (por ejemplo `"max"` en SGLang).
- Razonamiento cientifico y de nivel experto: los benchmarks publicados incluyen GPQA Diamond, SciCode y AA-LCR.
- Generacion y ejecucion de codigo en entornos de terminal: los resultados incluyen Terminal-Bench 2.1 y SciCode.
- Seguimiento de instrucciones: se reporta IFBench.
- Comprension multimodal de imagen y texto (pipeline `image-text-to-text`), con evaluacion en MMMU-Pro.
- Soporte de tool calling / function calling: la documentacion de despliegue incluye un parser especifico (`--tool-call-parser deepseekv41`).
- Soporte de agentes: los parsers de razonamiento (`deepseek-v41`) y de tool calling permiten separar trazas de pensamiento y llamadas a herramientas en bucles agénticos.
- Contexto largo de hasta 1M tokens, apto para tareas sobre documentos muy extensos.
- Idiomas soportados: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de repositorios completos: con 1M tokens de contexto, el modelo puede ingerir arboles de codigo extensos en una sola ventana y responder preguntas de arquitectura, dependencias o deuda tecnica sin necesidad de trocear el repositorio.
- Agentes de desarrollo autonomo en terminal: combinando Terminal-Bench y el soporte de tool calling, encaja como nucleo de agentes que ejecutan comandos, leen la salida y corrigen errores en bucles de varios pasos.
- Atencion al cliente con historial largo: conversaciones multi-turno de semanas de duracion caben en la ventana de 1M tokens, lo que permite conservar el historial completo sin resumenes intermedios.
- Asistencia tecnica sobre documentacion corporativa: ingesta de manuales, normativas y contratos en una sola pasada, con salida estructurada via function calling hacia sistemas internos.
- Revision de codigo en CI/CD: integrado con vLLM o SGLang exponiendo una API compatible con OpenAI, puede revisar diffs y dejar comentarios automatizados; su modo de razonamiento configurable permite ajustar coste frente a profundidad de analisis.
- Razonamiento cientifico asistido: los resultados en GPQA Diamond (91,3) y SciCode (55,8) lo hacen utilizable como asistente en dominios de fisica, quimica, biologia y programacion cientifica.
- Analisis de documentos con imagenes: al aceptar entradas de imagen, sirve para procesar informes escaneados, graficos o capturas junto al texto asociado.
- Servicio de inferencia autoalojado a escala: empaquetado en NVFP4 para reducir el ancho de banda de memoria y el espacio en disco frente al checkpoint original, ideal para despliegues controlados en clusters propios.

## Benchmarks y rendimiento

Datos publicados por NVIDIA para este checkpoint (evaluados con vLLM; temperatura 1.0, top_p 0.95, `reasoning_effort=100`). La columna MXFP4 corresponde al formato de origen y NVFP4 al checkpoint cuantizado de este repositorio.

| Benchmark | MXFP4 (origen) | NVFP4 |
|---|---|---|
| GPQA Diamond | 91,035 | 91,288 |
| AA-LCR | 78,563 | 78,438 |
| SciCode | 54,401 | 55,843 |
| IFBench | 76,667 | 77,267 |
| MMMU-Pro | 74,046 | 73,699 |
| Terminal-Bench 2.1 | 81,60 | 82,16 |

No se han publicado en la informacion disponible resultados adicionales (MMLU, HumanEval, GSM8K, SWE-bench, etc.) para este checkpoint concreto.

## Requisitos de hardware

- El checkpoint ocupa aproximadamente 527 GB en disco, por lo que la suma de VRAM necesaria para los pesos es del mismo orden; hay que anadir la cache KV correspondiente al contexto configurado.
- La model card indica que fue validado con 4 GPU GB300 usando tensor parallelism 4 (`--tp 4`), tanto en SGLang como en vLLM.
- Las imagenes de contenedor validadas aguas arriba son `lmsysorg/sglang:dev-cu13-dsv41` y `vllm/vllm-openai:deepseekv41-flash-0909`.
- El uso de NVFP4 con multiplicadores nativos requiere Tensor Cores FP4 de la generacion Blackwell; en generaciones anteriores la ruta FP4 no se aprovecha de forma nativa.
- No cabe en GPU de consumo: con ~527 GB de pesos no es viable en RTX 4090 (24 GB), RTX 5090 ni en configuraciones de 2-4 GPU de consumo. Requiere un nodo multi-GPU de centro de datos (por ejemplo 4x GB300, o un numero mayor de GPU de 80 GB para igualar la capacidad agregada).
- Despliegue soportado: SGLang y vLLM. La documentacion incluye comandos para SGLang (`--context-length 1048576`, `--chunked-prefill-size 4096`, `--max-running-requests 16`) y para vLLM (`--max-model-len 1048576`, `--max-num-seqs 32`, `--max-num-batched-tokens 8192`, `--enable-chunked-prefill`, `--no-enable-prefix-caching`, `--language-model-only`).
- Ejemplos de latencia y throughput: no disponibles en la informacion proporcionada. Los parametros de chunked prefill de 4096 tokens y el limite de 16 peticiones concurrentes en SGLang son los unicos indicadores publicados.
- Los tensores DSpark estan preservados, pero la decodificacion especulativa no fue validada, por lo que en produccion no conviene asumir su aceleracion.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| AxionML/DeepSeek-V4.1-Flash-NVFP4 | 763B (~552B backbone + 196B Engram) | 8B prefill / 16B decode | 1M | NVFP4 W4A4 + MXFP8 | MIT | Espejo del checkpoint NVFP4 de NVIDIA; validado en 4x GB300 |
| nvidia/DeepSeek-V4.1-Flash-NVFP4 | Identicos | Identicos | 1M | NVFP4 W4A4 + MXFP8 | MIT | Fuente original de la cuantizacion; pesos sin modificar |
| deepseek-ai/DeepSeek-V4.1-Flash | Identicos | Identicos | 1M | No disponible | MIT (segun este repositorio) | Modelo base sin cuantizar; referencia de los benchmarks |
| Formato MXFP4 (origen de la conversion) | Identicos | Identicos | 1M | MXFP4 | No disponible | Base de comparacion de la tabla de evaluacion de NVIDIA |

No se dispone de datos de otros modelos de la misma categoria (por ejemplo alternativas MoE frontera de otros fabricantes) dentro de la informacion proporcionada, por lo que no se incluye una comparacion numerica adicional.

## Limitaciones y advertencias

- El modelo base se entreno con datos que pueden contener lenguaje toxico y sesgos sociales; el checkpoint cuantizado hereda esas limitaciones y puede generar contenido inexacto, sesgado u ofensivo.
- Riesgo de alucinacion: no hay informacion especifica sobre tasas de alucinacion para este checkpoint; los benchmarks publicados (GPQA, SciCode, AA-LCR, IFBench, MMMU-Pro, Terminal-Bench) no miden factualidad abierta. Conviene aplicar verificacion externa en produccion.
- Idiomas soportados: no disponible. No se puede asumir un comportamiento homogeneo fuera de los idiomas cubiertos por el modelo base.
- Licencia MIT, que permite uso comercial y no comercial, pero la responsabilidad sobre el contenido generado y sobre el cumplimiento normativo recae en el desplegador.
- El checkpoint ocupa ~527 GB y requiere hardware Blackwell para aprovechar NVFP4; en GPU sin Tensor Cores FP4 el rendimiento sera inferior al esperado.
- La decodificacion especulativa con los tensores DSpark no fue validada, pese a estar preservados.
- El parametro `reasoning_effort` debe pasarse a nivel de peticion (por ejemplo `"max"`) para activar el modo de pensamiento en SGLang; sin el, el comportamiento puede diferir del reportado en los benchmarks.
- Los resultados de benchmarks fueron medidos por NVIDIA sobre una configuracion concreta (vLLM, temperatura 1.0, top_p 0.95, reasoning_effort 100) y no son necesariamente reproducibles con otras configuraciones de muestreo o de servidor.
- Repositorio con 0 descargas y 0 likes en el momento del registro; se trata de un espejo, no del artefacto canonico, por lo que conviene contrastar revisiones con el repositorio de NVIDIA.
- No se documenta en este repositorio el proceso de entrenamiento ni de alineacion del modelo base, lo que dificulta auditar su comportamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AxionML/DeepSeek-V4.1-Flash-NVFP4
- Checkpoint NVFP4 original de NVIDIA: https://huggingface.co/nvidia/DeepSeek-V4.1-Flash-NVFP4
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- NVIDIA Model Optimizer (herramienta de cuantizacion): https://github.com/NVIDIA/Model-Optimizer
- Dataset de calibracion cnn_dailymail: https://huggingface.co/datasets/abisee/cnn_dailymail
- Dataset de calibracion Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Licencia MIT: https://opensource.org/license/mit
- Perfil del autor del espejo: https://huggingface.co/AxionML
