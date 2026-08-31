# OsaurusAI/Qwen3.6-27B-MXFP4-MTP

## Resumen

Qwen3.6-27B-MXFP4-MTP es una cuantización nativa en formato MXFP4 (4 bits) del modelo denso Qwen3.6-27B de Qwen, realizada por OsaurusAI para ejecutarse en Apple Silicon mediante MLX. El modelo conserva la torre de visión y el cabezal nativo de Multi-Token Prediction (MTP), lo que permite decodificación especulativa auto-propuesta con salida bit-idéntica a la decodificación autoregresiva estándar. Con un tamaño de bundle de 14,38 GB, ofrece capacidades completas del modelo original en un formato compacto.

La arquitectura es `qwen3_5` densa, con 64 capas, atención híbrida GatedDeltaNet combinada con atención completa, y dimensión oculta de 5120. Soporta entrada multimodal (imagen, vídeo y texto) con una ventana de contexto de 262 144 tokens. La cuantización mantiene las normas, los tensores de control de atención híbrida y la torre de visión completa en fp16, mientras que los lineales se cuantizan a MXFP4 con grupo de 32.

La relevancia de este modelo radica en que permite ejecutar un LLM multimodal de 27B con contexto largo en hardware Apple Silicon de gama alta, con aceleración MTP que alcanza un speedup de 1,85× en un M5 Max. Es la variante más pequeña de una línea que incluye versiones MXFP8 y una variante MoE de 35B-A3B. La licencia Apache-2.0 heredada del modelo base facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5` densa, 64 capas, híbrida GatedDeltaNet + atención completa, hidden 5120 |
| Parametros totales | 27B (modelo base); archivo cuantizado contiene 4 731 843 312 parámetros en MXFP4 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | MXFP4 (4 bits, affine, group_size=32); normas y torre de visión en fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada de Qwen/Qwen3.6-27B) |
| Formato de pesos | safetensors (MLX, `mx.quantize` nativo) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-27B es un transformer denso de 64 capas con atención híbrida: combina GatedDeltaNet (una variante de atención lineal con compuertas) con atención completa, lo que reduce el coste computacional en secuencias largas manteniendo la calidad. La dimensión oculta es 5120. El modelo es multimodal, con una torre de visión que procesa imágenes y vídeo, y un cabezal MTP (Multi-Token Prediction) nativo que predice varios tokens futuros en una sola pasada.

La cuantización realizada por OsaurusAI convierte los lineales a MXFP4 mediante `mx.quantize` con modo `mxfp4` y `group_size=32`. Las normas, los tensores de control de la atención híbrida y la torre de visión completa se mantienen en fp16 para preservar la estabilidad numérica. Los lineales del cabezal MTP también se cuantizan a MXFP4, mientras que sus normas y tensores de control permanecen en fp16. El cabezal MTP se utiliza como cabezal de borrador especulativo: propone tokens que el modelo principal verifica en una sola pasada, produciendo una salida bit-idéntica a la decodificación autoregresiva estándar pero con mayor velocidad.

No se dispone de información sobre el dataset de entrenamiento del modelo base ni sobre el proceso de alineación (RLHF/DPO). La cuantización no requiere entrenamiento adicional; es una conversión post-entrenamiento.

## Capacidades

- Generación de texto y razonamiento: capacidades completas del modelo Qwen3.6-27B, incluyendo razonamiento multi-paso y modo thinking (según configuración del runtime).
- Multimodal: procesa imágenes y vídeo además de texto, gracias a la torre de visión preservada en fp16.
- Multi-Token Prediction (MTP): decodificación especulativa nativa con cabezal de borrador, que acelera la generación sin cambiar la salida (bit-idéntica al autoregresivo).
- Contexto largo: ventana de 262 144 tokens, adecuada para documentos extensos, análisis de vídeo o conversaciones multi-turno prolongadas.
- Tool calling y function calling: no se menciona explícitamente, pero es una capacidad habitual en la familia Qwen3.6; no confirmada en la documentación disponible.
- Multilingüismo: no se especifican idiomas soportados en la model card.
- Integración con MLX: carga mediante `mlx_vlm.load` y generación con `mlx_vlm.generate` en Apple Silicon.

## Casos de uso

- Análisis de vídeo en local: el modelo procesa entrada de vídeo junto con texto, permitiendo resumir contenido audiovisual, extraer eventos o responder preguntas sobre secuencias grabadas, con una ventana de 262K tokens para vídeos largos.
- Asistente multimodal en Mac Studio o MacBook Pro: con 14,38 GB de bundle, cabe en equipos con 32 GB o más de RAM unificada, ofreciendo un asistente de imagen y texto sin conexión.
- Procesamiento de documentos extensos: la ventana de 262K tokens permite ingerir manuales técnicos, contratos o informes completos y realizar preguntas sobre ellos en una sola pasada.
- Generación de código con contexto amplio: el modelo puede mantener repositorios completos en contexto y generar o modificar código con coherencia, aprovechando el MTP para reducir la latencia.
- Investigación en decodificación especulativa: el bundle sirve como banco de pruebas para estudiar MTP en modelos cuantizados, ya que expone el cabezal nativo y permite comparar profundidades de borrador (D1, D2, D3).
- Despliegue en entornos Apple Silicon con vMLX: el runtime vMLX activa el camino MTP, logrando un speedup de 1,85× en M5 Max, útil para aplicaciones interactivas de baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento son de velocidad de generación en un Apple M5 Max con runtime vMLX, con prompt determinista de 96 tokens y salida verificada idéntica a la línea base:

| Profundidad de borrador | tok/s | Speedup |
|---|---|---|
| Línea base (MTP desactivado) | 24,7 | 1,00× |
| D1 | 40,5 | 1,64× |
| D2 (por defecto) | 45,7 | 1,85× |
| D3 | 45,0 | 1,83× |

La velocidad absoluta depende de la memoria libre y la carga del sistema; la relación de speedup medida en condiciones idénticas es la cifra estable. Existe un benchmark independiente en oMLX para M4 Max (40 núcleos) con configuración de contexto 262 144, pero no se incluyen los resultados numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada: 14,38 GB de bundle, más overhead de runtime y KV cache. Se recomienda al menos 24 GB de memoria unificada en Apple Silicon; 32 GB o más para contexto máximo.
- GPU recomendadas: Apple Silicon con MLX — M5 Max (probado), M4 Max (benchmark oMLX), M3 Max o superiores. No compatible con GPU NVIDIA/AMD sin capa de traducción.
- Consumer GPU: no aplica; el formato MLX está diseñado exclusivamente para Apple Silicon.
- Opciones de despliegue: MLX (`mlx_vlm`), runtime vMLX para activar MTP; otros runtimes cargan el modelo principal e ignoran el cabezal MTP.
- Latencia y throughput: 45,7 tok/s en M5 Max con MTP D2; 24,7 tok/s sin MTP. La latencia de prefill no se ha publicado.

## Comparativa con modelos similares

| Modelo | Arquitectura | Formato | Tamaño bundle | Contexto | Speedup MTP |
|---|---|---|---|---|---|
| Qwen3.6-27B-MXFP4-MTP (este) | Densa 27B | MXFP4 | 14,4 GB | 262 144 | 1,85× (D2) |
| Qwen3.6-27B-MXFP8-MTP | Densa 27B | MXFP8 | 27,1 GB | 262 144 | 1,83× (D3) |
| Qwen3.6-35B-A3B-MXFP4-MTP | MoE 35B-A3B | MXFP4 | 21,5 GB | 262 144 | 1,56× (D3) |
| Qwen3.6-35B-A3B-MXFP8-MTP | MoE 35B-A3B | MXFP8 | 35,0 GB | 262 144 | 1,71× (D3) |
| Qwen/Qwen3.6-27B (original) | Densa 27B | fp16/bf16 | ~54 GB | 262 144 | no aplica |

La variante MXFP4 es la más ligera y la más rápida en speedup MTP entre las densas. La variante MoE MXFP4 ofrece un equilibrio entre tamaño (21,5 GB) y rendimiento, con menor speedup MTP. El modelo original sin cuantizar requiere aproximadamente el doble de memoria.

## Limitaciones y advertencias

- Cuantización de 4 bits: la precisión MXFP4 puede degradar ligeramente la calidad de salida en tareas sensibles a la precisión numérica, aunque las normas y la torre de visión se mantienen en fp16 para mitigarlo.
- Requiere Apple Silicon: el formato MLX no es portable a GPUs NVIDIA o AMD; el despliegue en otros entornos requiere conversión previa.
- MTP solo con runtime vMLX: otros runtimes cargan el modelo pero ignoran el cabezal MTP, perdiendo la aceleración especulativa.
- Sesgos y alucinaciones: no se dispone de evaluaciones específicas de sesgos o tasas de alucinación para esta cuantización; se heredan los riesgos del modelo base Qwen3.6-27B.
- Idiomas: no se especifican los idiomas soportados; el rendimiento multilingüe no está documentado.
- Uso comercial: la licencia Apache-2.0 permite uso comercial sin restricciones, pero se recomienda verificar la licencia del modelo base y de los componentes de terceros (JANG).
- Contexto máximo: aunque la ventana es de 262 144 tokens, el uso completo requiere memoria suficiente; en equipos con menos de 32 GB puede ser necesario reducir el contexto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OsaurusAI/Qwen3.6-27B-MXFP4-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Variante MXFP8: https://huggingface.co/OsaurusAI/Qwen3.6-27B-MXFP8-MTP
- Variante MoE MXFP4: https://huggingface.co/OsaurusAI/Qwen3.6-35B-A3B-MXFP4-MTP
- Variante MoE MXFP8: https://huggingface.co/OsaurusAI/Qwen3.6-35B-A3B-MXFP8-MTP
- Herramienta de cuantización JANG: https://github.com/jangq-ai/jang
- Benchmark oMLX en M4 Max: https://omlx.ai/benchmarks/performance/tpbg7txs
- Guía de Qwen 3.6 (insiderllm): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
