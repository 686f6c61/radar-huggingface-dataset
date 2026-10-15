# intel-ai/Qwen3.5-35B-A3B-MXFP8-FP8KV-CT-AutoRound

## Resumen

Esta ficha describe `intel-ai/Qwen3.5-35B-A3B-MXFP8-FP8KV-CT-AutoRound`, una cuantización en formato **MXFP8** del modelo `Qwen/Qwen3.5-35B-A3B`, generada con la herramienta **AutoRound** de Intel y publicada por el equipo `intel-ai`. No se trata de un modelo nuevo entrenado desde cero, sino de una versión comprimida de pesos y caché KV cuyo objetivo es reducir el coste de memoria y aumentar el rendimiento de inferencia sin reentrenamiento, manteniendo el comportamiento del modelo original.

El modelo base pertenece a la familia Qwen y su nomenclatura `35B-A3B` indica una arquitectura de mezcla de expertos (MoE) con aproximadamente 35 000 millones de parámetros totales y unos 3000 millones activos por token, según el esquema de nombres habitual de la serie. La quantización se distribuye en formato `compressed-tensors`/safetensors con pesos MXFP8 (W8 con grupo de 32, `mxfp-w8g32`) y caché KV en FP8, y el repo ocupa 39,4 GB.

Su relevancia es doble: por un lado, permite ejecutar un modelo MoE de gran tamano en una sola GPU de 80 GB o superior con un consumo de memoria muy inferior al de la versión BF16; por otro, sirve como ejemplo del flujo *agent-driven* de AutoRound (`autoquant-agent`), que automatiza quantización, evaluación y corrección de errores. La model card publica resultados de evaluación propios (mmlu 0,8275; gsm8k 0,9606; hellaswag 0,6226; piqa 0,8248), aunque sin comparación directa contra el modelo base, por lo que no puede afirmarse una pérdida cero de precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (tag `qwen3_5_moe`); el comando de quantización ignora `visual`, `in_proj_a`, `in_proj_b`, `conv1d`, `shared_expert_gate` y `mlp.gate`, lo que sugiere componentes de atención lineal/conv y posible torre de visión en el modelo base (inferencia, no confirmado) |
| Parametros totales | 35 000 millones según nomenclatura (`35B`); los metadatos safetensors del repo declaran 1 489 835 396 parámetros, dato inconsistente con el nombre y con el tamano del repo (39,4 GB) |
| Parametros activos | 3000 millones según nomenclatura (`A3B`); no confirmado en la model card |
| Longitud de contexto | no disponible (la evaluación se ejecutó con `max_model_len=8192`, que no equivale a la ventana máxima del modelo) |
| Tipos de cuantizacion | Pesos MXFP8 `mxfp-w8g32` (8 bits, grupo de 32); caché KV en FP8 estático (`--static_kv_dtype fp8`); formato `compressed-tensors` (`--format llm_compressor`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible en la ficha de HuggingFace; la model card indica únicamente «follow the license of the original model» (la del base `Qwen/Qwen3.5-35B-A3B`) |
| Formato de pesos | safetensors en formato compressed-tensors (MXFP8, llm-compressor) |

## Arquitectura y entrenamiento

El modelo es una **quantización post-entrenamiento (PTQ)** del checkpoint `Qwen/Qwen3.5-35B-A3B`, no un modelo entrenado por Intel. No hay información en la model card sobre el dataset, el número de tokens de entrenamiento ni sobre fases de RLHF/DPO: toda esa información corresponde al modelo base y no se reproduce aquí. Lo único documentado en esta ficha es el proceso de compresión.

La quantización se realizó con AutoRound 0.15.0.dev84 y el comando `auto-round --scheme MXFP8 --iters 0 --static_kv_dtype fp8 --format llm_compressor`. El detalle relevante es `--iters 0`: sin iteraciones de ajuste por bloques, el proceso se reduce a redondeo a la representación MXFP8 tras la inicialización, lo que explica que el título del README lo denomine `CT-RTN-AutoRound` (RTN, *round-to-nearest*) mientras que el identificador del repo solo menciona `AutoRound`. Las capas excluidas de la quantización son `lm_head`, `embed_tokens`, `visual`, `in_proj_a`, `in_proj_b`, `conv1d`, `shared_expert_gate` y `mlp.gate`, una elección típica para preservar la precisión en las capas más sensibles y en los *gates* de enrutamiento de expertos.

La evaluación asociada se realizó con `lm_eval 0.4.12` sobre vLLM 0.28.1rc1 y transformers 5.16.1, con `tensor_parallel_size=1`, `max_model_len=8192`, `max_num_seqs=128`, `max_num_batched_tokens=32768`, `kv_cache_dtype=fp8` y `enable_thinking=False` (es decir, sin modo de razonamiento extendido) para las tareas gsm8k, piqa, mmlu y hellaswag.

## Capacidades

- Generacion de texto y conversacion: el pipeline declarado es `text-generation` con etiqueta `conversational`.
- Razonamiento matematico basico: gsm8k = 0,9606 en la evaluacion de la propia model card (5-shot, sin modo thinking).
- Conocimiento general y comprension: mmlu = 0,8275; hellaswag = 0,6226; piqa = 0,8248.
- Capacidades derivadas del modelo base (MoE, familia Qwen3.5): no confirmadas de forma explicita en esta model card. No hay declaracion sobre tool calling, function calling, agentes, modo thinking, vision o audio en la informacion disponible; la presencia de la capa `visual` en `--ignore_layers` sugiere que el base podria ser multimodal, pero **no esta confirmado** ni se garantiza que la quantizacion conserve esa capacidad.
- Capacidades multilingues: no disponibles. No se declara lista de idiomas.
- No hay evidencia documentada de soporte de agentes, multi-step reasoning ni decodificacion especulativa en esta version quantizada.

## Casos de uso

- Inferencia de un MoE de gran tamano en una sola GPU: con pesos MXFP8 el repo ocupa 39,4 GB, por lo que un unico acelerador de 80 GB (H100/H200/A100 80GB) puede servirlo sin tensor parallelism, simplificando el despliegue frente a la version BF16.
- Servicio de chat conversacional multi-turno: adecuado para backends de atencion al cliente o asistentes internos, siempre que se valide antes la calidad de la respuesta tras la quantizacion y el idioma objetivo (la lista de idiomas no esta publicada).
- Evaluacion comparativa de tecnicas de quantizacion: util como referencia MXFP8 frente a otras variantes del mismo base (FP8 estatico, INT4 AutoRound) en pipelines de investigacion sobre compresion de modelos.
- Razonamiento aritmetico y tareas tipo gsm8k en produccion: el 0,9606 obtenido sugiere que la quantizacion conserva buena parte de la capacidad de resolucion de problemas matematicos de nivel escolar, aprovechable en herramientas de calculo asistido o validacion de facturas y presupuestos.
- Clasificacion y respuesta a preguntas de conocimiento general (mmlu 0,8275): util para sistemas de soporte documental o FAQ automatizadas donde no se requiere generacion larga.
- Servicio con KV cache en FP8 para contextos moderados: al evaluar con `kv_cache_dtype=fp8` y `max_model_len=8192`, el modelo esta pensado para escenarios de 8k tokens con memoria de cache reducida a la mitad respecto a FP16, apropiado para resumenes de documentos y analisis de conversaciones.
- Nodo de inferencia en clústeres con vLLM: al estar empaquetado en formato compressed-tensors/llm-compressor, encaja en despliegues existentes de vLLM que ya sirvan modelos FP8, reduciendo el coste por token frente a BF16.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluados con `lm_eval` sobre vLLM, 5-shot en gsm8k, sin modo thinking):

| Benchmark | Resultado |
|---|---|
| gsm8k | 0,9606 |
| mmlu | 0,8275 |
| piqa | 0,8248 |
| hellaswag | 0,6226 |

No se han publicado en la informacion disponible resultados del modelo base en BF16 ni de otras quantizaciones del mismo checkpoint, por lo que **no es posible calcular la degradacion respecto al original**. Tampoco hay datos de latencia, throughput, ni de benchmarks de codigo (HumanEval, MBPP) o de contexto largo.

Entorno de evaluacion declarado: auto-round 0.15.0.dev84+gd6ead479, lm-eval 0.4.12, transformers 5.16.1, torch 2.13.0+cu130, vllm 0.28.1rc1.dev312+g41848caa6.precompiled.

## Requisitos de hardware

- VRAM para pesos: aproximadamente 35-40 GB con MXFP8 (el repo completo ocupa 39,4 GB). La caché KV en FP8 anade consumo adicional que depende del numero de capas y cabezas KV, dato no disponible; a titulo orientativo, la configuracion de evaluacion usa `max_model_len=8192`.
- GPU de 80 GB (H100, H200, A100 80GB): escenario natural, un solo dispositivo, sin necesidad de tensor parallelism.
- Blackwell (B200, GB200, 192 GB): soporte nativo de MXFP8 y margen amplio. El ajuste `gpu_memory_utilization=0.3` con `tensor_parallel_size=1` empleado en la evaluacion apunta a una GPU con bastante mas de 100 GB de memoria, lo que es coherente con una B200 (inferencia a partir de la configuracion, no confirmada por el autor).
- A100 40GB: no cabe, los pesos por si solos superan la memoria disponible.
- GPU de consumo: **no cabe en una RTX 4090, RTX 3090 o similar de 24 GB**. En 2x RTX 4090 (48 GB) seria tecnicamente ajustado (quedan menos de 10 GB para KV y activaciones) y ademas Ada Lovelace no tiene aceleracion FP8 nativa, por lo que el rendimiento se degradaria.
- Workstations/prosumer de 48 GB (RTX 6000 Ada, L40S): posible pero al limite; conviene reducir `max_model_len`.
- Opciones de despliegue: vLLM es el runtime documentado y el unico con soporte explicito del formato MXFP8; el repo esta empaquetado para llm-compressor/compressed-tensors. **No se documenta soporte para llama.cpp, Ollama o TGI con MXFP8**; para esos runtimes habria que reconvertir los pesos a GGUF.
- Latencia y throughput: no disponibles. La model card advierte de que hacen falta builds de vLLM que soporten MXFP8 y que las arquitecturas *day-0* pueden requerir una imagen o rama personalizada.

## Comparativa con modelos similares

No hay datos verificables de otras quantizaciones ni del modelo base en los resultados de busqueda disponibles. La siguiente tabla recoge unicamente lo que puede deducirse de la informacion proporcionada y de la nomenclatura; el resto se marca como no disponible.

| Modelo | Parametros | Contexto | Formato / tamano | Benchmarks | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-35B-A3B-MXFP8-FP8KV-CT-AutoRound (este) | 35B totales / 3B activos (nomenclatura) | no disponible | MXFP8, repo de 39,4 GB | gsm8k 0,9606; mmlu 0,8275; piqa 0,8248; hellaswag 0,6226 | no disponible |
| Qwen/Qwen3.5-35B-A3B (base) | 35B totales / 3B activos (nomenclatura) | no disponible | BF16 (safetensors), tamano no disponible | no disponible | no disponible |
| Otras quantizaciones del mismo base (FP8 estatico, INT4) | 35B / 3B | no disponible | no disponible | no disponible | no disponible |
| Qwen3-30B-A3B (familia anterior, a titulo orientativo) | 30B totales / 3B activos (nomenclatura) | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Licencia sin determinar**: la ficha de HuggingFace indica «no disponible» y la model card remite a la licencia del modelo base. Antes de cualquier uso comercial hay que verificar la licencia de `Qwen/Qwen3.5-35B-A3B`.
- **Idiomas no declarados**: no hay lista de idiomas soportados; el rendimiento en castellano es desconocido y debe validarse empiricamente.
- **Sin comparacion con el base**: los benchmarks publicados son absolutos. No puede afirmarse que la quantizacion sea *lossless*, y el uso de `--iters 0` (equivalente a RTN) suele implicar una degradacion mayor que un AutoRound con iteraciones de ajuste.
- **Metadatos inconsistentes**: el numero de parametros declarado en safetensors (1 489 835 396) no cuadra con el nombre del modelo ni con el tamano del repo. Conviene verificar la integridad del checkpoint antes de desplegarlo.
- **Discrepancia de nombre**: el identificador del repo dice `AutoRound`, pero el titulo del README anade `RTN`; ambos describen el mismo artefacto, no dos versiones distintas.
- **Riesgo de alucinacion**: no se documentan medidas especificas de mitigacion ni tasas de alucinacion; aplican los riesgos habituales de un modelo generativo de este tamano, agravados por la falta de validacion en idiomas distintos del evaluado.
- **Contexto no verificado mas alla de 8k**: la evaluacion se hizo con `max_model_len=8192`. No hay evidencia de calidad en ventanas mayores aunque el base las soporte.
- **Dependencia de toolchain muy reciente**: requiere vLLM con soporte MXFP8, transformers 5.16.1 y compilaciones concretas; en entornos mas antiguos el modelo no cargara. El autor advierte que las arquitecturas *day-0* pueden necesitar imagenes personalizadas.
- **Sin adopcion ni validacion comunitaria**: el repo registra 0 descargas y 0 *likes* en el momento de la consulta; no hay informes independientes de calidad.
- **Capacidades multimodales y de tool calling sin confirmar**: si el base incorpora vision (indicio: capa `visual` ignorada en la quantizacion), no hay garantia de que esta version MXFP8 la conserve correctamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/intel-ai/Qwen3.5-35B-A3B-MXFP8-FP8KV-CT-AutoRound
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Repositorio de AutoRound: https://github.com/intel/auto-round
- Referencia de `autoquant-agent` (enlace incompleto en la model card, apunta a github.com sin ruta concreta): https://github.com/
- llm-compressor (formato de quantizacion `llm_compressor`): no disponible en los resultados de busqueda
- vLLM (runtime usado en la evaluacion): no disponible en los resultados de busqueda
- lm-evaluation-harness (herramienta de evaluacion): no disponible en los resultados de busqueda
- Paper o blog tecnico de la quantizacion: no disponible
