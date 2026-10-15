# intel-ai/Qwen3.5-35B-A3B-MXFP8-FP8KV-FP8Attn-CT-AutoRound

## Resumen
Este repositorio no es un modelo entrenado desde cero, sino una cuantización en MXFP8 del modelo base Qwen/Qwen3.5-35B-A3B, publicada por el usuario intel-ai mediante la herramienta AutoRound. El proceso aplica cuantización de pesos en formato MXFP8 (bloques de 32 elementos con escala de 8 bits), KV cache en FP8 y atención en FP8, dejando fuera del proceso de cuantización capas sensibles como lm_head, embed_tokens, la torre visual y determinadas proyecciones (in_proj_a, in_proj_b, conv1d, shared_expert_gate, mlp.gate). El resultado es un checkpoint en formato compressed-tensors que ocupa 39,4 GB en disco.

El modelo base se denomina 35B-A3B, lo que sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 35.000 millones de parámetros totales y unos 3.000 millones activos por token, según los tags qwen3_5_moe y la convención de nomenclatura de Qwen. Esto lo hace interesante para despliegue en producción: mantiene la capacidad de un modelo grande mientras el coste de cómputo por token se aproxima al de un modelo de 3B. La cuantización a 8 bits reduce el peso en memoria a la mitad frente a BF16, lo que abarata el alojamiento en GPU.

Es relevante ahora porque se publica el mismo día que el modelo base (creado el 15 de octubre de 2026) con cero descargas y cero «likes», es decir, es un artefacto recién generado por un agente automático de cuantización y evaluación (autoquant-agent) y todavía no validado por la comunidad. Además, requiere una build de vLLM con soporte para MXFP8, lo que limita su uso inmediato a entornos con esa capacidad.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explícita. El tag qwen3_5_moe indica mezcla de expertos (MoE); los patrones de capas ignoradas (visual, in_proj_a, in_proj_b, conv1d) apuntan a atención lineal o híbrida y a una torre visual (inferencia, no confirmada por el autor) |
| Parametros totales | 35B según la denominación del nombre (35B-A3B); el recuento real de safetensors reportado es de 1.489.835.406 parámetros, en clara discrepancia con esa cifra |
| Parametros activos | 3B según la denominación A3B (no confirmado por el autor) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos en MXFP8 (bloque de 32 elementos, escala E8M0); KV cache estática en FP8; atención estática en FP8; capas excluidas mantenidas en precisión original |
| Idiomas soportados | No disponible |
| Licencia | No disponible en el repositorio; la model card remite a la licencia del modelo original Qwen/Qwen3.5-35B-A3B |
| Formato de pesos | safetensors, formato compressed-tensors (llm_compressor) |

## Arquitectura y entrenamiento
No hay información sobre el entrenamiento del modelo base en la documentación proporcionada. Lo que sí se detalla es el proceso de cuantización posterior: se ejecutó AutoRound con el esquema MXFP8, `--iters 0` (es decir, redondeo al vecino más cercano, RTN, sin calibración iterativa), `--static_kv_dtype fp8` y `--static_attention_dtype fp8`, con salida en formato `llm_compressor` y `--disable_low_cpu_mem_usage`. Las capas excluidas de la cuantización fueron `lm_head`, `embed_tokens`, `visual`, `in_proj_a`, `in_proj_b`, `conv1d`, `shared_expert_gate` y `mlp.gate`, lo que sugiere que el modelo base incluye componentes de atención lineal o híbrida (las proyecciones `in_proj_a`, `in_proj_b` y `conv1d` son típicas de mecanismos tipo Gated DeltaNet) y posiblemente una torre visual.

El entorno declarado para producir el artefacto fue auto-round 0.15.0.dev84+gd6ead479, lm-eval 0.4.12, transformers 5.16.1, torch 2.13.0+cu130 y vllm 0.28.1rc1.dev312. La model card advierte que la inferencia requiere una build de vLLM que soporte el formato MXFP8 y que las arquitecturas day-0 pueden necesitar una imagen o rama personalizada. No se documentan datos de entrenamiento, composición del dataset ni fases de RLHF o DPO, ya que este repositorio solo contiene el artefacto cuantizado.

## Capacidades
- Generación de texto y uso conversacional, según los tags `text-generation` y `conversational`.
- Modo de razonamiento explícito (thinking mode): los comandos de evaluación usan `reasoning_parser=qwen3` y permiten desactivarlo con `enable_thinking=False`, lo que implica que el modelo base soporta ese modo.
- Razonamiento matemático: el benchmark gsm8k reportado es de 0,9575, lo que indica competencia alta en problemas aritméticos de varios pasos.
- Comprensión de lenguaje general y sentido común: evaluado con mmlu (0,8257), hellaswag (0,6222) y piqa (0,8243).
- Procesamiento de texto de hasta 8.192 tokens en la configuración de evaluación documentada; el máximo real del modelo base no se especifica en la información disponible.
- Capacidades multimodales: no confirmadas, pero la presencia de una capa `visual` en la lista de capas ignoradas sugiere que el modelo base podría incluir visión.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente, aunque el modo de razonamiento del modelo base es un indicio favorable.
- Capacidades multilingües: no disponibles; el modelo base Qwen suele ser multilingüe, pero no se documenta aquí.

## Casos de uso
- Servicio de chat conversacional de alta concurrencia: con solo 3B de parámetros activos por token (según la denominación A3B), el coste de cómputo por petición es bajo en comparación con un modelo denso de 35B, lo que permite atender muchas conversaciones simultáneas por GPU.
- Razonamiento matemático y resolución de problemas paso a paso: el resultado de 0,9575 en gsm8k con 5 ejemplos (few-shot) lo hace adecuado para asistentes educativos, verificación de cálculos y generación de problemas resueltos.
- Sustitución de un modelo en BF16 para reducir coste de memoria: al pasar a MXFP8, los pesos ocupan aproximadamente la mitad que en BF16, lo que permite alojar el modelo en un único acelerador de 80 GB con margen para caché KV.
- Evaluación interna y benchmarking reproducible: el repositorio incluye los comandos exactos de `lm_eval` con vLLM, lo que facilita reproducir y comparar resultados frente a otras cuantizaciones del mismo modelo base.
- Inferencia con caché de contexto (prefix caching): aunque la configuración documentada lo desactiva, el formato de KV cache en FP8 está pensado para escenarios con contextos largos compartidos, como asistentes sobre documentación técnica.
- Despliegue en clústeres con aceleradores compatibles con FP8 (por ejemplo, generaciones Hopper o posteriores de NVIDIA, y hardware Intel con soporte de tipos FP8): el formato MXFP8 es un estándar abierto de la OCP, lo que favorece la portabilidad entre backends que lo implementen.
- Generación y revisión de código en pipelines automatizados: plausible por el rendimiento general del modelo base, pero no confirmado por datos específicos de HumanEval, MBPP ni soporte de tool calling en la información disponible.
- Análisis de documentos con componentes visuales: solo si la torre visual se conserva funcional tras la cuantización, extremo que no se documenta.

## Benchmarks y rendimiento
Resultados publicados en la model card. Fueron obtenidos con vLLM, `kv_cache_dtype=fp8`, `max_model_len=8192`, `enable_thinking=False`, semilla 42 y 5 ejemplos (few-shot) en gsm8k.

| Benchmark | Resultado | Configuracion |
|---|---|---|
| gsm8k | 0,9575 | 5-shot, batch 64 |
| mmlu | 0,8257 | batch 64 |
| piqa | 0,8243 | batch 64 |
| hellaswag | 0,6222 | batch 64 |

No se han publicado en la información disponible los resultados del modelo base sin cuantizar, por lo que no es posible calcular la degradación introducida por la cuantización MXFP8. Tampoco hay datos de latencia ni de throughput.

## Requisitos de hardware
- Almacenamiento: 39,4 GB de repositorio en safetensors MXFP8.
- VRAM estimada para pesos: en torno a 40 GB, dado que el tamaño del repositorio es 39,4 GB y las capas excluidas se mantienen en mayor precisión.
- VRAM total recomendada: 80 GB para dejar espacio a la caché KV en FP8 y a los estados de activación, especialmente con contextos largos y batches grandes.
- GPU recomendadas: H100 80 GB, H200 o B200. Una A100 de 80 GB podría servir si la build de vLLM instalada soporta MXFP8; este extremo no se confirma en la información disponible.
- GPU consumer: no cabe en una GPU de 24 GB como la RTX 4090 sin reparto de tensores y/o descarga a CPU. Además, el soporte nativo de MXFP8 en arquitecturas consumer no está documentado en este repositorio.
- Opciones de despliegue: vLLM con soporte de MXFP8 es el backend documentado y probado. No se mencionan llama.cpp, Ollama, TGI ni otros motores, y el formato compressed-tensors/MXFP8 no es el habitual en esos runtimes.
- Configuración de referencia usada en la evaluación: `tensor_parallel_size=1`, `max_model_len=8192`, `gpu_memory_utilization=0.3`, `dtype=bfloat16`, `max_num_batched_tokens=32768`, `max_num_seqs=128`, `max_gen_toks=2048`, `safetensors_load_strategy=prefetch`.
- Latencia y throughput: no disponibles. No se publican métricas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares
La información disponible solo permite comparar este artefacto con su propio modelo base; no se aportan datos de otras cuantizaciones ni de modelos alternativos de la misma categoría.

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| intel-ai/Qwen3.5-35B-A3B-MXFP8-FP8KV-FP8Attn-CT-AutoRound | 35B totales / 3B activos según denominación | MXFP8, KV FP8, atención FP8 | No disponible (evaluado a 8192) | No disponible (remite al modelo original) | Repositorio público, 0 descargas |
| Qwen/Qwen3.5-35B-A3B (modelo base) | 35B totales / 3B activos según denominación | BF16 (presumiblemente) | No disponible | No disponible | Referenciado como base, datos no consultados |
| Otras cuantizaciones del mismo base (AWQ, GPTQ, INT4) | No disponible | No disponible | No disponible | No disponible | No disponibles en la información proporcionada |

## Limitaciones y advertencias
- Licencia no declarada en el repositorio: la model card indica únicamente que se siga la licencia del modelo original, sin especificarla. Esto impide determinar a priori si el uso comercial está permitido.
- Discrepancia de parámetros: el recuento real de safetensors (1.489.835.406) no concuerda con la denominación de 35B del modelo. Conviene verificar el checkpoint antes de planificar el despliegue.
- Artefacto sin validación comunitaria: cero descargas y cero «likes», publicado y actualizado con menos de dos minutos de diferencia, lo que sugiere una generación automática sin revisión humana.
- Dependencia del runtime: requiere una build de vLLM con soporte MXFP8. El propio autor advierte que las arquitecturas day-0 pueden necesitar una imagen o rama personalizada, lo que complica el despliegue en producción estable.
- Ausencia de comparación con el modelo base: no se puede cuantificar la pérdida de precisión por la cuantización. Además, la cuantización se generó con `--iters 0` (RTN), sin calibración, lo que suele implicar mayor degradación que los métodos con calibración.
- hellaswag bajo: 0,6222 es un valor modesto y conviene comprobar si responde al comportamiento del modelo base o a una degradación por cuantización.
- Evaluación limitada: las pruebas se hicieron con `enable_thinking=False`, contexto máximo de 8.192 tokens y sin prefix caching, por lo que no cubren el modo de razonamiento ni contextos largos.
- Riesgo de alucinación: no evaluado en este repositorio. Al ser una cuantización de un modelo generativo, hereda el riesgo del modelo base, que no se documenta aquí.
- Sesgos: no disponibles. No se ha publicado ningún análisis de sesgo, toxicidad o sesgo de idioma.
- Idiomas: no declarados. No se especifica si la cuantización conserva el multilingüismo del modelo base ni con qué calidad.
- Fecha de creación anómala (octubre de 2026) y autoría de una organización (intel-ai) sin documentación adicional: conviene tratar las cifras de benchmarks como provisionales hasta su reproducción independiente.

## Enlaces
- Repositorio en HuggingFace: https://huggingface.co/intel-ai/Qwen3.5-35B-A3B-MXFP8-FP8KV-FP8Attn-CT-AutoRound
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Repositorio de AutoRound: https://github.com/intel/auto-round
- Herramienta autoquant-agent: el enlace incluido en la model card está incompleto (https://github.com/), por lo que no es utilizable.
- Búsqueda web: no se han encontrado enlaces relevantes al modelo, al paper de AutoRound ni a documentación técnica asociada. Los resultados devueltos corresponden a páginas de descarga de controladores de Intel y a la entrada de Wikipedia de la compañía, sin relación con este artefacto.
