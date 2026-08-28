# mbehr90/Qwen3.8-Flash-Next-nvfp4

## Resumen

Qwen3.8-Flash-Next-nvfp4 es una cuantizacion NVFP4 del modelo Qwen/Qwen3.8-Flash-Next, un modelo multimodal de tipo Mixture-of-Experts ultra-sparse desarrollado por Alibaba. El modelo base combina 125.000 millones de parametros (mas una tabla n-gram de 51.000 millones) y activa solo 6.000 millones por token, lo que lo convierte en una opcion eficiente para tareas de razonamiento y generacion con contexto largo. Esta variante, publicada por el usuario mbehr90, cuantiza exclusivamente los 48x512 expertos enrutados del modelo, reduciendo el peso de 335,3 GiB a 170,2 GiB sin calibracion, al tratarse de un esquema weight-only.

La relevancia de este checkpoint radica en que permite ejecutar un modelo de casi 180.000 millones de parametros en cuatro GPU H100 de 80 GB con una perdida de precision estadisticamente insignificante en la unica prueba publicada (GSM8K). Ademas, demuestra un flujo de cuantizacion alternativo a llm-compressor, ya que la arquitectura Qwen4Exp no esta implementada en transformers y solo puede instanciarse a traves del plugin de vLLM. El resultado es un modelo listo para servir con vLLM, con soporte para prompts de texto e imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE ultra-sparse con Gated DeltaNet (GDN) y Qwen Sparse Attention (QSA), arquitectura Qwen4Exp |
| Parametros totales | 179.999.981.459 (segun safetensors; el modelo base declara 125B + 51B de tabla n-gram) |
| Parametros activos | 6.000 millones por token |
| Longitud de contexto | no disponible (el modelo base soporta hasta 1M de tokens, pero no se especifica para esta cuantizacion) |
| Tipos de cuantizacion | NVFP4A16: pesos fp4, escalas fp8 de bloque grupo-16, activaciones bf16 (solo expertos enrutados) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura Qwen4Exp que combina dos mecanismos de atencion: tres de cada cuatro capas utilizan Gated DeltaNet (GDN) para comprimir el historial de tokens, mientras que la cuarta capa usa Qwen Sparse Attention (QSA) para recuperacion precisa de informacion a largo plazo. Ademas, incorpora una tabla n-gram de 51.000 millones de parametros (PLE) que actua como memoria externa, y una torre de vision para entrada multimodal. El modelo activa 6.000 millones de parametros por token, lo que lo hace computacionalmente eficiente pese a su tamano total.

La cuantizacion NVFP4 se aplica unicamente a los 48x512 expertos enrutados (proyecciones gate, up y down), que representan 241 de los 335 GiB del modelo. El resto de componentes (tabla PLE, embeddings, atencion, expertos compartidos, gates, hyper-connections, torre de vision, MTP y lm_head) se mantienen en bf16. Al ser un esquema weight-only, no requiere calibracion con datos, y los tensores de los expertos se dividieron desde el formato fusionado del checkpoint base al formato por-expertos que espera vLLM. La verificacion de la division se realizo por correlacion de magnitudes con la conversion de referencia, obteniendo correlaciones de 0,991 y 0,987.

## Capacidades

- Generacion de texto con trazas de razonamiento: el modelo emite un razonamiento interno antes de la respuesta final, como se observa en la evaluacion GSM8K.
- Procesamiento multimodal: acepta prompts de texto e imagen gracias a la torre de vision integrada.
- Conversacion multi-turno: disenado para dialogos con contexto largo, con soporte de atencion sparse para recuperacion eficiente.
- Razonamiento aritmetico y logico: el benchmark GSM8K muestra una precision del 96% en problemas matematicos de nivel escolar.
- Eficiencia computacional: al activar solo 6B parametros por token, el coste de inferencia es comparable al de un modelo mucho mas pequeno.
- Compatibilidad con vLLM: integrado con el backend de vLLM, incluyendo soporte para tensor parallelism y offload de la tabla PLE a CPU.

## Casos de uso

- Despliegue de un modelo multimodal de gran tamano en infraestructura limitada: con 170 GiB de pesos y la tabla PLE en CPU, es posible servir el modelo en 4x H100 80 GB, algo inviable con el checkpoint bf16 original de 335 GiB.
- Asistentes de codigo con razonamiento: el modelo puede generar explicaciones y codigo con trazas de razonamiento, util para herramientas de autocompletado o agentes de programacion.
- Analisis de documentos largos con imagenes: gracias a la atencion sparse y la ventana de contexto amplia (no confirmada en esta variante), puede procesar informes extensos con graficos o diagramas.
- Investigacion en cuantizacion de MoE: este checkpoint sirve como referencia para estudiar el impacto de NVFP4 en modelos con expertos enrutados, ya que incluye una evaluacion comparativa con bf16 y FP8.
- Sistemas de preguntas y respuestas sobre conocimiento cientifico: el rendimiento en GSM8K sugiere capacidad para tareas de razonamiento numerico, aunque no se han publicado otros benchmarks.
- Prototipado de agentes conversacionales multimodales: la combinacion de vision, texto y razonamiento permite construir chatbots que analizan capturas de pantalla o imagenes y responden con pasos logicos.

## Benchmarks y rendimiento

La unica evaluacion publicada por el autor es GSM8K (200 preguntas, modo chat, con parseo del numero final). Los resultados se muestran en la siguiente tabla, junto con las variantes bf16 y FP8 del mismo modelo:

| Variante | Tamano | GSM8K (200 q, chat) | Error estandar |
|---|---|---|---|
| bf16 original | 335,3 GiB | 0,950 | ~1,5 pp |
| FP8 | 220,8 GiB | 0,965 | ~1,5 pp |
| NVFP4 (este modelo) | 170,2 GiB | 0,960 | ~1,5 pp |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, etc.) en la informacion disponible. El autor indica que las diferencias entre variantes son estadisticamente indistinguibles en esta prueba.

## Requisitos de hardware

- VRAM estimada: 170,2 GiB para los pesos cuantizados, mas memoria para activaciones y la tabla PLE (95 GiB, que se recomienda mantener en RAM del host con `VLLM_PLE_CPU_OFFLOAD=1`).
- GPU recomendadas: 4x NVIDIA H100 80 GB (verificado por el autor). En H100 no hay kernel FP4 tensor-core para SM90, por lo que vLLM usa Marlin como W4A16.
- GPU de consumo: no cabe en una GPU de consumo (RTX 4090, etc.) por el tamano de los pesos y la tabla PLE.
- Opciones de despliegue: vLLM con `--tensor-parallel-size 4`, `--max-model-len 8192`, `--max-num-seqs 16` y `--moe-backend marlin` para fijar el kernel. Requiere una version de vLLM que registre `Qwen4ExpForConditionalGeneration` (vLLM 0.26.0 no lo hace).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La comparativa se realiza con las variantes del mismo modelo base, ya que no se dispone de datos de otros MoE comparables en la informacion proporcionada:

| Modelo | Tamano | Parametros activos | Cuantizacion | Tamano en disco | GSM8K |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (bf16) | 335,3 GiB | 6B | bf16 | 335,3 GiB | 0,950 |
| Qwen3.8-Flash-Next (FP8) | 220,8 GiB | 6B | FP8 | 220,8 GiB | 0,965 |
| Qwen3.8-Flash-Next-nvfp4 (este) | 170,2 GiB | 6B | NVFP4 | 170,2 GiB | 0,960 |

No se dispone de comparativas con otros modelos MoE como DeepSeek-V3 o Mixtral en la informacion disponible.

## Limitaciones y advertencias

- La cuantizacion solo cubre los expertos enrutados; el resto del modelo permanece en bf16, por lo que el ahorro de memoria es parcial (170 GiB frente a 335 GiB).
- Requiere una version especifica de vLLM que implemente la arquitectura Qwen4Exp; vLLM 0.26.0 no es compatible.
- La tabla PLE de 95 GiB debe mantenerse en RAM del host, lo que exige una maquina con suficiente memoria principal (se recomienda offload a CPU).
- En GPU H100 no se aprovechan kernels FP4 nativos; se usa Marlin W4A16, lo que puede limitar el rendimiento frente a Blackwell.
- No se ha evaluado el modelo en benchmarks estandar como MMLU o HumanEval; el unico dato disponible es GSM8K con 200 preguntas, que tiene un error estandar de ~1,5 puntos porcentuales.
- El proceso de cuantizacion se realizo sin calibracion, lo que es valido para esquemas weight-only, pero podria haber diferencias en tareas sensibles a la precision de los pesos.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no documentadas en esta ficha.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mbehr90/Qwen3.8-Flash-Next-nvfp4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Referencia de conversion: https://huggingface.co/Inferact/Qwen3.8-Flash-Next-NVFP4
- Documentacion de vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Blog de explainx.ai sobre el lanzamiento: https://www.explainx.ai/blog/qwen3-8-flash-next-125b-moe-release-august-2026
- Review de kaitchup: https://kaitchup.substack.com/p/qwen38-flash-next-review-benchmarks
- Pagina de QwenCloud del modelo Flash: https://www.qwencloud.com/models/qwen3.8-flash
