# naveenrajk/nemotron35-w4a4-v11

## Resumen

El modelo `naveenrajk/nemotron35-w4a4-v11` es un checkpoint comunitario no oficial que aplica una cuantización NVFP4 **W4A4** (pesos y activaciones en FP4) sobre el modelo base de NVIDIA `NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`. Este modelo base es un MoE híbrido (Transformer + Mamba) de 30.000 millones de parámetros totales con 3.000 millones activos por token, diseñado por NVIDIA para tareas de agente y razonamiento eficiente. La cuantización, realizada con NVIDIA Model Optimizer, reduce el tamaño de los pesos de 65,8 GB (BF16) a aproximadamente 21,7 GB, manteniendo una pérdida de perplejidad de solo el 1,2 % respecto a la versión W4A16 oficial de NVIDIA.

La relevancia de este checkpoint radica en que explota los tensor cores FP4 nativos de las GPUs Blackwell (sm100/sm120), logrando una reducción de hasta el 34 % en el tiempo hasta el primer token (TTFT) en comparación con la cuantización W4A16 oficial, a costa de un ligero aumento en el tiempo por token (TPOT). Esto lo hace especialmente adecuado para cargas de trabajo con alta proporción de prefill, como bucles de agentes, generación de código con contexto largo o sistemas de chat multi-turno. Es importante destacar que se trata de un trabajo independiente, no afiliado a NVIDIA, y que las métricas publicadas provienen de mediciones propias del autor, no de benchmarks estandarizados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido (Transformer + Mamba) con enrutamiento por tokens |
| Parametros totales | 30.000 millones (modelo base); 18.049.701.440 en el checkpoint cuantizado (safetensors) |
| Parametros activos | 3.000 millones (A3B) |
| Longitud de contexto | No disponible (el ejemplo de despliegue usa 16.384 tokens, pero no es un valor oficial) |
| Tipos de cuantizacion | NVFP4 W4A4 (expertos MoE enrutados), FP8 W8A8 (proyecciones Mamba y expertos compartidos), W4A16_NVFP4 (lm_head), BF16 (attention, router, conv1d, embeddings, MTP), KV cache FP8 |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el modelo base de NVIDIA tiene su propia licencia, pero este checkpoint no la especifica) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un MoE híbrido que combina capas Transformer con capas Mamba (SSM), una arquitectura que busca equilibrar la calidad de atención con la eficiencia en contexto largo. El checkpoint cuantizado no ha sido entrenado desde cero; es el resultado de una cuantización post-entrenamiento (PTQ) aplicada con NVIDIA Model Optimizer, fijado a un commit específico (`main @ 3d2522e`) que incluye el calibrator `nvfp4_act_headroom`, no disponible en versiones estables. La estrategia de cuantización es mixta: los 5.888 expertos MoE enrutados se cuantizan a NVFP4 W4A4 con bloques de 16 elementos, mientras que las proyecciones Mamba y los expertos compartidos se mantienen en FP8 W8A8, y el `lm_head` se cuantiza a W4A16_NVFP4. Esta división, heredada de la receta de NVIDIA para el modelo Nemotron-3-Super-120B, es clave para mantener la perplejidad: cuantizar todo a W4A4 degrada la perplejidad a 3,296, mientras que la mezcla descrita la mantiene en 2,551. No se dispone de información sobre los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO).

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Nemotron-3.5-Lightning, orientado a tareas de razonamiento y agente.
- Generación de código y matemáticas: el modelo base está diseñado para estas tareas, aunque no se aportan benchmarks específicos en la información disponible.
- Soporte de tool calling y function calling: no confirmado explícitamente en la documentación del checkpoint, pero el modelo base está orientado a agentes, por lo que es probable que lo soporte.
- Soporte de agentes y multi-step reasoning: el modelo base está diseñado para ello; la cuantización W4A4 reduce el TTFT, lo que beneficia a los bucles de agentes.
- Capacidades multilingües: no disponible.
- Capacidades especiales: arquitectura híbrida Mamba-Transformer que permite manejar contextos largos de forma eficiente; cuantización mixta que aprovecha los tensor cores FP4 de Blackwell.

## Casos de uso

- Agentes autónomos con bucle de razonamiento: el bajo TTFT (104 ms para 1k tokens) permite que el agente reciba respuestas rápidas en cada iteración, reduciendo la latencia total del bucle. Adecuado para tareas de planificación y ejecución de herramientas.
- Generación de código en producción con contexto largo: la ventana de 16k tokens (configuración recomendada) y el soporte de Mamba permiten procesar repositorios completos o archivos extensos. La cuantización W4A4 reduce el tiempo de prefill, crítico al procesar prompts largos.
- Asistentes de chat multi-turno en tiempo real: el TPOT de ~3 ms por token (con plugin) permite respuestas fluidas, y el tamaño reducido del modelo (21,7 GB) facilita su despliegue en GPUs de 24 GB.
- Inferencia en GPUs Blackwell con restricción de VRAM: al ocupar ~21,7 GB (o ~34 GiB con el plugin mcond), puede ejecutarse en GPUs como la RTX 5090 o la RTX PRO 6000, liberando memoria para otros procesos.
- Evaluación de modelos cuantizados: sirve como referencia para estudiar el impacto de la cuantización W4A4 en modelos MoE híbridos, comparando perplejidad y latencia frente a W4A16.
- Despliegue en entornos con alta concurrencia: con `--max-num-seqs 256` y KV cache FP8, puede atender múltiples peticiones simultáneas, aunque el rendimiento agregado depende de la GPU.

## Benchmarks y rendimiento

La model card del autor incluye mediciones propias realizadas en una RTX PRO 6000 Blackwell Server Edition (sm120, 1,60 TB/s) con vLLM 0.27.1 y KV cache FP8. No se han ejecutado benchmarks estándar como MMLU, GSM8K o SWE-bench. La perplejidad se midió sobre 57 tokens de un pasaje fijo, por lo que los valores absolutos no son comparables con otras publicaciones.

| Metrica | BF16 (base) | NVFP4 W4A16 (oficial) | Este checkpoint (W4A4) |
|---|---|---|---|
| Perplejidad (ppl) | 2,502 | 2,520 | 2,551 |
| TTFT 1k tokens | 91,5 ms | 153,3 ms | 104,4 ms |
| TTFT 10k tokens | — | ~392 ms | 258,0 ms |
| TPOT | — | 3,07 ms | 3,16 ms |
| Tokens/s (1 stream) | 179,3 | 325,2 | 303,6 |
| Tamano | 65,8 GB | 21,6 GB | 21,7 GB |

Con el plugin `mcond` (despacho dual por fase), el checkpoint supera al oficial W4A16 en todas las métricas: TPOT 2,93 ms, TTFT 1k/10k 108/288 ms y 325,8 tok/s agregados. Sin embargo, el autor advierte que el TTFT varía significativamente entre ejecuciones (104 ms vs 199 ms en dos corridas idénticas), por lo que las cifras deben tomarse con cautela.

## Requisitos de hardware

- GPU obligatoria: Blackwell (sm100/sm120) con soporte nativo de FP4. No funciona en GPUs Ampere o Ada Lovelace.
- VRAM mínima: el checkpoint pesa ~21,7 GB en disco; la carga en memoria sin plugin requiere al menos 24 GB. Con el plugin `mcond`, el consumo sube a ~34 GiB, por lo que se necesita una GPU con 36 GB o más (por ejemplo, RTX PRO 6000).
- GPUs compatibles: RTX PRO 6000 Blackwell Server Edition (usada en las pruebas), RTX 5090 (24 GB, sin plugin), y otras GPUs Blackwell con al menos 24 GB.
- Opciones de despliegue: vLLM ≥ 0.27.1 (recomendado), con plugin `mcond` opcional para máximo rendimiento. También puede usarse con Transformers, aunque no se documenta.
- Latencia y throughput: ver tabla de benchmarks; TPOT ~3 ms, TTFT 104 ms (1k) y 258 ms (10k) en la GPU de prueba.
- Requisitos de software: vLLM 0.27.1 (el plugin está fijado a esta versión), CUDA compatible con sm120, y `--max-num-seqs 256` obligatorio (el valor por defecto de 1024 excede los bloques de estado Mamba disponibles).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5-Lightning-30B-A3B (BF16) | 30B total, 3B activo | No disponible | BF16 | No disponible (NVIDIA) | HuggingFace |
| Nemotron-3.5-Lightning-30B-A3B (NVFP4 W4A16 oficial) | 30B total, 3B activo | No disponible | NVFP4 W4A16 | No disponible (NVIDIA) | HuggingFace |
| Este checkpoint (W4A4) | 30B total, 3B activo | No disponible | NVFP4 W4A4 mixto | No disponible | HuggingFace (comunitario) |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros modelos MoE similares (como Qwen2.5-32B-A3B o DeepSeek-V3) en la información proporcionada. La principal diferencia entre las tres variantes es el equilibrio entre tamaño, velocidad de prefill y velocidad de decode: el BF16 es el más lento y pesado, el W4A16 oficial es el más rápido en decode, y este W4A4 es el más rápido en prefill.

## Limitaciones y advertencias

- Checkpoint no oficial: no está afiliado a NVIDIA ni respaldado por el fabricante; su mantenimiento y corrección dependen del autor.
- Sin benchmarks estándar: no se han ejecutado MMLU, GSM8K, SWE-bench ni otras evaluaciones; la perplejidad se midió sobre 57 tokens, por lo que no es una cifra fiable en términos absolutos.
- Variabilidad del TTFT: el autor reporta diferencias de hasta 2x entre ejecuciones con la misma configuración, lo que dificulta la comparación de latencias.
- Degeneración en algunos prompts: en una prueba con 5 prompts greedy, uno mostró degeneración (repetición) con una puntuación de 0,081, aunque la media fue 0,016.
- Requisitos de hardware estrictos: solo funciona en GPUs Blackwell; no es compatible con hardware anterior.
- Dependencia de vLLM: el plugin `mcond` está fijado a vLLM 0.27.1 y falla en otras versiones; sin el plugin, el rendimiento de decode es ~7 % inferior.
- Licencia incierta: al no especificarse la licencia del checkpoint, el uso comercial puede estar sujeto a la licencia del modelo base de NVIDIA, que no se detalla en la información disponible.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han realizado evaluaciones específicas de seguridad o sesgos.

## Enlaces

- Repositorio HuggingFace del checkpoint: https://huggingface.co/naveenrajk/nemotron35-w4a4-v11
- Modelo base de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- NVIDIA Model Optimizer (receta de cuantización): https://github.com/NVIDIA/Model-Optimizer
- Página oficial de NVIDIA Nemotron: https://developer.nvidia.com/topics/ai/nemotron
- Investigación Nemotron 3: https://research.nvidia.com/labs/nemotron/Nemotron-3/
