# defnoteatin/PseudoBrain-Qwen3.8-Flash-Next-W4A16

## Resumen

PseudoBrain-Qwen3.8-Flash-Next-W4A16 es una cuantización W4A16 del modelo base Qwen/Qwen3.8-Flash-Next, publicada por el usuario defnoteatin en Hugging Face. El modelo implementa la arquitectura "PseudoBrain" (clase `PB27Qwen4ExpForConditionalGeneration`), un diseño híbrido que combina atención con ventana deslizante y capas recurrentes Gated DeltaNet (GDN) para lograr contexto de hasta 1.048.576 tokens (1M) con memoria de caché KV prácticamente constante, en lugar del crecimiento lineal típico de los Transformers.

El problema que resuelve es el cuello de botella de memoria en inferencia con contexto largo: en un Transformer estándar, la caché KV crece de forma lineal con la longitud de contexto y el prefill de forma cuadrática, lo que provoca OOM en workloads de 128K a 1M tokens aunque la GPU tenga espacio para los pesos. PseudoBrain aborda esto mediante un estado recurrente GDN de tamaño fijo O(1), un sistema jerárquico de memoria exacta "Quest" en tres niveles (con paginación a NVMe/page cache) y un esquema de RoPE por bloques proporcional.

Es relevante porque ofrece, según el autor, decodificación especulativa DFlash2 con velocidades de 45–183 tok/s y una reducción del 96% en memoria de caché KV a 1M tokens, permitiendo servir contexto de 1M en una única RTX 3090/4090 de 24 GB gracias a la cuantización W4A16 (~21 GB de pesos). El modelo es MoE ultra-esparsa con 78,55 mil millones de parámetros totales y aproximadamente 1,7 mil millones activos (36B-A1.7B según la nomenclatura del autor), bajo licencia Apache 2.0 y con soporte nativo en vLLM mediante un plugin propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: MoE con Gated DeltaNet (36 capas GDN) + 12 capas de atención completa con ventana deslizante de 16K + Quest Exact Memory (PB27Qwen4ExpForConditionalGeneration) |
| Parametros totales | 78.550.400.915 (~78,55 mil millones, dato real de safetensors) |
| Parametros activos | ~1,7 mil millones (MoE ultra-esparsa, "36B-A1.7B" según el autor) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | W4A16 (pesos a 4 bits, activaciones a 16 bits); ediciones FP8, NVFP4 y BF16 disponibles en otros repositorios |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), 18 shards PLE-pruned, ~90,2 GB de repo |

## Arquitectura y entrenamiento

La arquitectura PseudoBrain consta de 48 capas: 36 capas nativas de Gated DeltaNet (una capa recurrente lineal cuyo estado es de tamaño fijo O(1) independientemente del contexto) y 12 capas de atención completa situadas en las posiciones [3, 7, 11, ..., 47], convertidas en atención con ventana deslizante de 16K tokens más Parallel Gated DeltaNet y Quest Exact Memory. En esas capas dispersas, las queries atienden sobre un conjunto compuesto por 4 sinks de StreamingLLM, landmarks de super-bloques, las top-k páginas de Quest Exact-Memory y la ventana deslizante de 16.384 tokens, fusionadas mediante FlashAttention-2 con LSE-merge y límites jerárquicos de dos niveles en bf16.

Entre las innovaciones destacadas por el autor se encuentran: un esquema de RoPE por bloques estrictamente no solapado que preserva la continuidad local y la fidelidad de distancias temporales al 99% a 1M tokens sin degradación estática de YaRN; la agregación global densa automática con landmarks resumen (1 token por cada 4.096 tokens residentes en HBM) y barridos de working-set con rotación por novedad para razonamiento multi-paso; y decodificación especulativa DFlash2 que, según el autor, alcanza 45–183 tok/s. El prefill usa un presupuesto de recuperación escalable mientras el decode usa un presupuesto constante (stride de 64 bloques), reduciendo la caché KV de 1M tokens de ~48 GB a ~486 MiB de ventana activa (4,7 GB de pool para 1,15M tokens).

Sobre el entrenamiento del modelo base Qwen3.8-Flash-Next no se ha publicado información en la documentación disponible: no se conocen el número de tokens, la composición del dataset ni si se aplicaron RLHF o DPO. Esta ficha corresponde a una cuantización W4A16 publicada por un tercero, no al entrenamiento original.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation), al ser una variante de la familia Qwen3.8-Flash-Next.
- Contexto ultra-largo de hasta 1.048.576 tokens con memoria de caché KV prácticamente constante, adecuado para documentos masivos, repositorios completos o historiales de conversación muy extensos.
- Razonamiento multi-paso sobre contextos de 1M tokens mediante barridos de working-set con rotación por novedad sobre cientos de bloques distintos.
- Decodificación especulativa DFlash2 con throughput declarado de 45–183 tok/s.
- Eficiencia MoE: ~1,7 mil millones de parámetros activos por token, lo que reduce el coste computacional por token frente a un denso equivalente.
- Soporte de serving compatible con la API de OpenAI mediante vLLM (V1 y V2) a través del plugin `pb27_vllm`, con fallback ForwardContext sin hooks.
- Tool calling, agentes y capacidades multimodales: no disponible en la información proporcionada.

## Casos de uso

- Analisis de documentos masivos: con 1M tokens de contexto se pueden ingestar libros completos, expedientes legales o conjuntos de contratos en una sola pasada, manteniendo la memoria de caché en ~486 MiB de ventana activa.
- Asistentes sobre bases de código completas: la ventana de 1M tokens permite cargar repositorios enteros para preguntas de arquitectura, refactoring guiado o generación de código con contexto global del proyecto.
- Atencion al cliente con historial extenso: el estado GDN de tamaño fijo permite mantener conversaciones multi-turno con meses de historial sin que el coste de memoria crezca con cada turno.
- Chat empresarial on-premise: la edición W4A16 (~26 GB de VRAM total a 1M tokens según el autor) cabe en una única RTX 4090 de 24 GB (con pruning PLE) o en una RTX 5090 de 32 GB, facilitando despliegues locales con datos sensibles.
- Procesamiento de logs y telemetria a gran escala: el prefill con presupuesto de recuperación escalable permite ingerir millones de tokens de logs y consultarlos con fidelidad temporal proporcional gracias al RoPE por bloques.
- Resumen y analisis de corpus academicos o periodisticos: la recuperación jerárquica Quest (landmarks + top-k páginas) permite localizar información relevante en super-bloques sin atender a todo el contexto.
- Agentes de investigacion de larga duración: los barridos de working-set con rotación por novedad están diseñados para que el razonamiento multi-paso recorra cientos de bloques distintos a lo largo de 1M tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor referencia "benchmark receipts" en el directorio `reports/` de su repositorio de GitHub, pero no incluye cifras comparativas verificables en la model card. Los únicos datos de rendimiento declarados son de inferencia: 45–183 tok/s con DFlash2 y una reducción del 96% en memoria de caché KV a 1M tokens. No se han realizado verificaciones independientes de estas cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: ~21 GB de pesos W4A16 y ~26 GB de VRAM total a 1.000.000 de tokens (según el autor); el pool de memoria para contexto completo es de 4,7 GB para 1,15M tokens.
- GPU recomendadas (según el autor): RTX 3090 / RTX 4090 (24 GB, con 18 shards PLE-pruned), RTX 5090 (32 GB), AMD RX 7900 XTX y AMD Instinct MI300X (CUDA y ROCm).
- Consumer GPUs: sí, cabe en una RTX 3090 o RTX 4090 de 24 GB gracias a la cuantización W4A16 y la caché KV de tamaño casi constante; también en RTX 5090 de 32 GB.
- Despliegue: vLLM mediante el plugin universal `pb27_vllm` (instalable con pip desde el repositorio de GitHub, con registro automático vía `vllm.general_plugins`), servidor compatible con la API de OpenAI usando `--max-model-len 1048576` y `VLLM_ALLOW_LONG_MAX_MODEL_LEN=1`. No hay información sobre soporte en llama.cpp, Ollama o TGI.
- Latencia y throughput: el autor declara 45–183 tok/s con decodificación especulativa DFlash2; no hay mediciones independientes.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PseudoBrain-Qwen3.8-Flash-Next-W4A16 | MoE híbrida GDN + SWA + Quest Memory | 78,55B totales / ~1,7B activos | 1.048.576 tokens | W4A16 | Apache 2.0 | Hugging Face + plugin vLLM propio |
| Qwen3-Next-80B-A3B (referencia de arquitectura híbrida GDN de Qwen) | MoE híbrida Gated DeltaNet + atención completa | 80B totales / ~3B activos | 256K tokens | BF16, FP8 | Apache 2.0 | Hugging Face, vLLM nativo |
| Qwen3-30B-A3B | MoE densa-esparsa estándar | 30,5B totales / ~3,3B activos | 32.768 tokens (128K con YaRN) | BF16, FP8, GGUF | Apache 2.0 | Hugging Face, vLLM, llama.cpp, Ollama |

Nota: la comparación con Qwen3-Next-80B-A3B es referencial, ya que PseudoBrain sigue un enfoque arquitectónico similar (híbrido GDN + atención dispersa) pero con contexto declarado de 1M tokens y un ecosistema de serving dependiente de un plugin de terceros. No se dispone de benchmarks comparativos directos entre estos modelos.

## Limitaciones y advertencias

- Proyecto de un autor individual con adopción muy limitada (381 descargas, 0 likes en el momento de la ficha): la ausencia de verificación independiente de las cifras de rendimiento y memoria es un riesgo significativo para producción.
- Dependencia de un plugin de vLLM de terceros (`pb27_vllm`) para funcionar: el modelo no es servible con vLLM estándar sin instalar dicho plugin, lo que añade fragilidad ante actualizaciones de vLLM (aunque el autor declara soporte V1/V2 y un fallback sin hooks).
- La cuantización W4A16 puede degradar la calidad de generación respecto a las ediciones FP8 o BF16; no se han publicado evaluaciones de calidad comparativas entre ediciones.
- Sesgos conocidos: no disponible; al derivar de Qwen3.8-Flash-Next, heredaría los sesgos del modelo base, pero no hay documentación al respecto.
- Riesgo de alucinación: no disponible; no hay evaluaciones de fidelidad publicadas, y la recuperación de memoria dispersa a 1M tokens podría comprometer la exactitud de citas concretas.
- Idiomas soportados: no disponible; no se especifica qué idiomas maneja el modelo base.
- Capacidades multimodales, tool calling y agentes: no disponibles en la información proporcionada.
- Licencia Apache 2.0 sin restricciones para uso comercial, aunque conviene verificar la procedencia de los modelos base referenciados (incluye un modelo "abliterated" de terceros entre las bases listadas).
- El repo ocupa 90,2 GB en 18 shards, lo que exige ancho de banda y almacenamiento considerables para el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3.8-Flash-Next-W4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio de GitHub (plugin vLLM `pb27_vllm`): https://github.com/defnotean/pseudobrain
- Paper de arquitectura (PDF): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf
- Paper de arquitectura (Markdown): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.md
- Benchmark receipts: https://github.com/defnotean/pseudobrain/tree/main/reports
- Edición FP8: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3.8-Flash-Next-FP8
- Edición BF16: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3.8-Flash-Next-BF16
