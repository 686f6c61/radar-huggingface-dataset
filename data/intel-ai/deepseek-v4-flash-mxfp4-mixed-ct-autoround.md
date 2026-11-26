# intel-ai/DeepSeek-V4-Flash-MXFP4-Mixed-CT-AutoRound

## Resumen

DeepSeek-V4-Flash-MXFP4-Mixed-CT-AutoRound es una version cuantizada del modelo deepseek-ai/DeepSeek-V4-Flash, publicada por el equipo de Intel (intel-ai) mediante su herramienta de cuantizacion AutoRound. La cuantizacion aplica MXFP4 a los expertos enrutados y MXFP8 al resto de capas lineales cuantizadas, manteniendo en BF16 el router, los embeddings y el lm_head. El resultado es un checkpoint compatible con compressed-tensors y desplegable en vLLM con un plugin especifico de Intel Neural Compressor.

El modelo base es un transformer de tipo Mixture-of-Experts con 290.944.616.402 parametros totales (segun los safetensors del repo) y una ventana de contexto que la configuracion de referencia de vLLM extiende hasta 524.288 tokens. La cuantizacion reduce el peso del repositorio a 159,8 GB, lo que lo hace abordable en nodos de dos GPU B200 con tensor parallelism 2, el escenario validado por el autor. Es relevante ahora porque permite servir un modelo de razonamiento de gran escala con perdida de calidad minima respecto al original.

La model card reporta una recuperacion de rendimiento muy alta en benchmarks de razonamiento y conocimiento, con varios resultados ligeramente por encima del modelo base y una caida maxima del 0,83% en MATH-500. La licencia es Apache 2.0, heredada del modelo original, lo que facilita su uso comercial con las mismas condiciones del base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (deepseek_v4), cuantizado con compressed-tensors |
| Parametros totales | 290.944.616.402 (290,9 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 524.288 tokens (segun `--max-model-len` en la configuracion de referencia) |
| Tipos de cuantizacion | MXFP4 (expertos enrutados), MXFP8 (resto de lineales cuantizadas), BF16 (router, embeddings, lm_head); KV cache en FP8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), 8-bit; repo de 159,8 GB |

## Arquitectura y entrenamiento

El modelo es una cuantizacion post-entrenamiento (PTQ) del base DeepSeek-V4-Flash, que emplea una arquitectura transformer con capas de expertos (MoE) y componentes auxiliares como router, compressor e indexer. AutoRound aplica redondeo de pesos mediante descenso de gradiente con signo (paper arXiv:2309.05516) en modo RTN, con un esquema mixto: los expertos `mlp.experts` se cuantizan a MXFP4, el resto de lineales a MXFP8 y se excluyen de la cuantizacion `mlp.gate`, `compressor`, `indexer` y `lm_head`, que permanecen en BF16. El checkpoint resultante es compatible con el formato llm_compressor de compressed-tensors.

No se dispone de informacion sobre el dataset de entrenamiento del modelo base en la informacion proporcionada. La model card indica que el modelo cuantizado conserva el comportamiento del original y que no se realizo un reentrenamiento, sino una calibracion de redondeo. La innovacion tecnica destacable en el despliegue es el fallback a BF16 de la capa `wo_a` en la ruta de atencion CUDA de vLLM 0.33.0 (43 capas por rango de TP), ya que dicha ruta no soporta el layout agrupado MXFP8; el plugin de Intel dequantiza `wo_a` a BF16 en tiempo de ejecucion, manteniendo la perdida de cuantizacion de pesos pero evitando la de activaciones.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modo "thinking" activable mediante `--default-chat-template-kwargs '{"thinking":true,"enable_thinking":true}'`.
- Razonamiento matematico de competicion (resultados en AIME26 y MATH-500) y resolucion de problemas cientificos (GPQA Diamond).
- Conocimiento general y profesional (MMLU 57 materias, MMLU-Pro).
- Generacion de codigo: no se han publicado resultados especificos de benchmarks de codigo en la informacion disponible.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: el modo thinking y el parser `deepseek_v4` de vLLM sugieren soporte, pero no se detalla en la model card.
- Capacidades multilingues: no disponible.
- Capacidades especiales: thinking mode, KV cache en FP8, chunked prefill, atencion con indexer en MXFP4.

## Casos de uso

- Razonamiento matematico asistido: el modelo obtiene 96,33 en AIME26 y 96,00 en MATH-500, por lo que es adecuado para tutoria o verificacion de demostraciones donde se requiere precision alta y cadenas de razonamiento largas.
- Analisis cientifico y QA experto: con 87,98 en GPQA Diamond, puede emplearse en asistentes de investigacion que respondan preguntas de nivel doctoral con contexto documental extenso.
- Servicio de chat con contexto largo: la ventana de 524.288 tokens permite procesar repositorios de codigo, expedientes o historiales completos en una sola peticion, con chunked prefill para gestionar la latencia de entrada.
- Evaluacion automatizada de conocimiento: util como juez o generador de referencia en pipelines de evaluacion (EvalScope) para modelos mas pequenos, dado su MMLU de 92,34.
- Despliegue en infraestructura de dos B200: el caso validado por el autor permite servir el modelo con tensor parallelism 2, `--max-num-seqs 32` y utilizacion de memoria GPU del 70%, adecuado para entornos con nodos de dos aceleradores.
- Investigacion en cuantizacion: sirve como referencia reproducible para estudiar el impacto de esquemas mixtos MXFP4/MXFP8 en modelos MoE, ya que se publica el comando exacto de AutoRound para regenerarlo.
- Prototipado de asistentes con thinking mode: el parser `deepseek_v4` y los kwargs de plantilla permiten alternar razonamiento visible y respuestas directas segun la tarea.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados con EvalScope y thinking activado. PIQA y HellaSwag reportan acc (no acc_norm); MMLU es la media aritmetica de las 57 materias. AIME26 usa 30 preguntas con 10 repeticiones (300 predicciones); GPQA Diamond usa 198 preguntas con 5 repeticiones (990 predicciones). Porcentajes.

| Benchmark | Modelo base | MXFP4 | Recuperacion |
|---|---:|---:|---:|
| AIME26 | 96,00 | 96,33 | 100,34% |
| GPQA Diamond | 87,37 | 87,98 | 100,70% |
| PIQA | 95,16 | 95,27 | 100,12% |
| MMLU (media 57 materias) | 92,21 | 92,34 | 100,15% |
| MMLU-Pro | 85,37 | 85,57 | 100,23% |
| MATH-500 | 96,80 | 96,00 | 99,17% |
| HellaSwag | 86,34 | 85,67 | 99,22% |
| GSM8K | 96,74 | 96,89 | 100,16% |

Nota del autor: las ejecuciones completas de benchmark usaron una implementacion runtime anterior del fallback BF16 de `wo_a`; el plugin empaquetado se valido posteriormente con una prueba de humo de modelo completo con thinking, no con la repeticion de los seis benchmarks.

## Requisitos de hardware

- VRAM estimada: repositorio de 159,8 GB en disco; en inferencia, el peso cuantizado mas la KV cache FP8 y los buffers del runtime. La configuracion de referencia usa `--gpu-memory-utilization 0.70` sobre 2 GPU B200.
- GPU recomendadas: 2 x NVIDIA B200 con tensor parallelism 2 (configuracion validada por el autor). No se documenta soporte en otras GPU en la informacion disponible.
- GPU de consumo: no disponible; el tamano (290,9 mil millones de parametros) y el requisito de dos B200 hacen inviable su ejecucion en GPU consumer.
- Opciones de despliegue: vLLM 0.33.0 con el plugin Intel Neural Compressor vLLM (`benchmark/vllm-qdq-plugin`, revision f19930c), PyTorch 2.14.0, Transformers 5.20.2, compressed-tensors 0.17.0 y FlashInfer 0.7.2.post1. Se requiere `--trust-remote-code` y la variable `VLLM_DEEPSEEK_V4_WO_A_BF16=1`.
- Latencia y throughput: no disponibles. La configuracion de referencia limita a `--max-num-seqs 32`, `--max-num-batched-tokens 4096` y `--block-size 256`, con `--enable-chunked-prefill` y `--kernel-config '{"enable_flashinfer_autotune":false}'`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| DeepSeek-V4-Flash-MXFP4-Mixed-CT-AutoRound | 290,9 mil millones | 524.288 | Apache 2.0 | safetensors (compressed-tensors) | Cuantizado MXFP4/MXFP8, requiere plugin vLLM de Intel |
| deepseek-ai/DeepSeek-V4-Flash (base) | 290,9 mil millones | no disponible | Apache 2.0 | safetensors | Referencia de calidad; pesos en BF16 |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de comparacion en la informacion proporcionada |

## Limitaciones y advertencias

- Hereda las limitaciones del modelo base: puede generar contenido inexacto o sesgado; el autor recomienda evaluar seguridad y precision antes de desplegar.
- La cuantizacion introduce perdida: MATH-500 cae un 0,83% y HellaSwag un 0,78% respecto al base; el resto de benchmarks se mantiene o mejora ligeramente.
- El fallback BF16 de `wo_a` en CUDA incrementa la memoria de pesos en tiempo de ejecucion respecto a un despliegue puramente cuantizado.
- La ruta CUDA de vLLM 0.33.0 no soporta el layout agrupado MXFP8 de `wo_a`; solo XPU lo soporta de forma nativa. El plugin de Intel es necesario y esta fijado a una revision concreta.
- No se documentan idiomas soportados ni capacidades multilingues.
- No se confirma soporte de tool calling ni de function calling en la model card.
- El uso comercial esta permitido por Apache 2.0, pero se deben respetar las condiciones y guias de uso del modelo base.
- Los benchmarks se obtuvieron con una implementacion runtime anterior del plugin; la validacion del plugin empaquetado se limito a una prueba de humo.
- No hay datos de latencia ni throughput publicados, lo que impide estimar costes de serving sin medicion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/intel-ai/DeepSeek-V4-Flash-MXFP4-Mixed-CT-AutoRound
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Repositorio AutoRound: https://github.com/intel/auto-round
- Paper AutoRound: https://arxiv.org/abs/2309.05516
- Plugin Intel Neural Compressor vLLM: https://github.com/intel/neural-compressor/tree/f19930c5417cdbe182fd0b91a476cdd288fe2a9c/benchmark/vllm-qdq-plugin
