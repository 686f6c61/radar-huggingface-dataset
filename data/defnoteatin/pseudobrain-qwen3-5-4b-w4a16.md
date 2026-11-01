# defnoteatin/PseudoBrain-Qwen3.5-4B-W4A16

## Resumen

PseudoBrain-Qwen3.5-4B-W4A16 es una variante cuantizada (W4A16) del modelo Qwen3.5-4B, publicada por el desarrollador independiente defnoteatin (Ian Kurt Galeon). El proyecto, denominado PseudoBrain, rediseña la inferencia de contexto largo para modelos compactos: combina atención por ventanas con una arquitectura híbrida de Gated DeltaNet para lograr un contexto de hasta 1.048.576 tokens (1M) con consumo de memoria prácticamente constante, algo que la arquitectura transformer estándar no permite porque la caché KV crece linealmente con la longitud del contexto.

El problema que resuelve es concreto: servir contextos de 128K a 1M tokens en GPUs de consumo sin sufrir errores de memoria (OOM). Según la model card, esta edición W4A16 reduce la memoria de la caché KV en un 99,2 % en contextos de 1M tokens y funciona con menos de 3,8 GB de VRAM en total, lo que la hace viable en portátiles y GPUs de gama baja o media.

El modelo se distribuye bajo licencia Apache 2.0, pesa unos 4,99 mil millones de parámetros (según los metadatos de safetensors) y ocupa 4,7 GB en el repositorio. Su relevancia actual radica en la tendencia hacia modelos edge con contexto ultra-largo, y se integra mediante un plugin propio para vLLM (`pb27_vllm`) compatible con servidores compatibles con la API de OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 24 capas Gated DeltaNet + 8 capas de atención completa con ventana deslizante (SWA de 16K) + Quest Exact Memory (PB27ForConditionalGeneration) |
| Parametros totales | 4.996.983.808 (~5.000 millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | W4A16 (pesos en 4 bits, activaciones en 16 bits); existen ediciones FP8, NVFP4 y BF16 del mismo proyecto |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), diseñado para vLLM |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y lo transforma en una arquitectura híbrida de 32 capas: 24 capas nativas de Gated DeltaNet (un mecanismo recurrente cuyo estado tiene tamaño fijo O(1) independientemente de la longitud del contexto) y 8 capas de atención completa en las posiciones [3, 7, 11, 15, 19, 23, 27, 31], convertidas en atención por ventana deslizante de 16K tokens combinada con Gated DeltaNet paralelo y un mecanismo de memoria dispersa denominado Quest Exact Memory. Este último implementa una recuperación en tres niveles sobre NVMe/page-cache: las consultas atienden sobre 4 sinks de StreamingLLM, super-bloques de referencia (landmarks), las páginas top-k de memoria exacta y una ventana deslizante de 16.384 tokens, fusionadas mediante FlashAttention-2 con límites jerárquicos de super-bloques en bf16.

Entre las innovaciones técnicas destacan: un RoPE por bloques estrictamente no solapado que preserva la continuidad posicional local y mantiene una fidelidad de distancia temporal proporción superior al 99 % a 1M tokens sin degradación estática tipo YaRN; una agregación global densa que detecta consultas globales y activa resúmenes residentes en GPU (un token resumen por cada 4.096 tokens) para razonamiento multi-paso; y una decodificación de velocidad constante O(1) que desacopla el presupuesto de recuperación del prefill del de decodificación. Sobre el entrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO) no se dispone de datos en la información proporcionada.

## Capacidades

- Generación de texto conversacional (pipeline text-generation), heredada de Qwen3.5-4B.
- Contexto ultra-largo: hasta 1.048.576 tokens con memoria de caché KV constante (estado GDN de tamaño fijo O(1)).
- Razonamiento multi-paso sobre contextos de 1M tokens: el mecanismo de agregación global permite barrer cientos de bloques distintos de memoria durante la decodificación.
- Tool calling / function calling: el servidor vLLM recomendado se lanza con `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder`.
- Parser de razonamiento integrado (`--reasoning-parser qwen3`), lo que sugiere soporte de modos de razonamiento tipo Qwen3.
- Servidor compatible con la API de OpenAI mediante vLLM, con soporte dual de runners V1/V2.
- Compatibilidad con NVIDIA CUDA y AMD ROCm.
- Descarga de memoria a NVMe/page-cache para contextos extremos (memoria exacta en tres niveles).

## Casos de uso

- Analisis de repositorios de codigo completos: con 1M tokens de contexto, el modelo puede ingerir bases de código enteras y responder preguntas sobre ellas; el parser de tool calling `qwen3_coder` lo orienta a flujos de trabajo de agentes de programación.
- Procesamiento de documentos extensos: contratos, expedientes médicos o literature reviews de cientos de miles de tokens pueden analizarse en una sola pasada sin fragmentación ni RAG, gracias al contexto de 1M y a la memoria de recuperación jerárquica.
- Chatbots y asistentes con memoria de largo plazo: el estado recurrente O(1) permite mantener conversaciones históricas enormes en dispositivos edge sin que la memoria crezca con el historial.
- Despliegue en portátiles y estaciones de trabajo modestas: con ~3,8 GB de VRAM totales a 1M tokens, cabe en GPUs de 6-8 GB como la RTX 3050, 3060 o 4060, útil para inferencia local privada (on-premise).
- Agentes multi-paso con razonamiento sobre trazas largas: la detección de consultas globales y los barridos rotativos de memoria permiten a un agente razonar sobre cientos de bloques de contexto a lo largo de 1M tokens.
- Servicios de inferencia multi-usuario en hardware limitado: el comando de servidor recomendado admite hasta 16 secuencias concurrentes (`--max-num-seqs 16`) con una reserva de caché configurable.
- Investigación en arquitecturas de contexto largo: el proyecto publica un paper de arquitectura y "benchmark receipts" en su repositorio, lo que lo hace útil como referencia reproducible para estudios de atención dispersa y modelos híbridos recurrentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card menciona "benchmark receipts" en el directorio `reports/` del repositorio de GitHub, pero sin cifras concretas en el material proporcionado. El único dato de rendimiento cuantificado es la reducción de memoria: la caché KV a 1M tokens pasa de 24,0 GB a unos 192 MiB de ventana activa (~1,0 GB de pool), un 99,2 % menos.

## Requisitos de hardware

- VRAM total estimada a 1M tokens: ~3,8 GB (pesos ~2,8 GB en W4A16 más caché y buffers), según la model card.
- GPUs objetivo declaradas: RTX 3050, RTX 3060, RTX 4060 (6-8 GB) y AMD RX 6600 / RX 7600.
- Cabe en GPUs de consumo de 6-8 GB; es una de las ediciones más ligeras del proyecto (junto a NVFP4, que requiere GPUs Blackwell).
- Despliegue principal: vLLM mediante el plugin `pb27_vllm` (instalable con pip desde el repositorio de GitHub o desde el directorio `pb27_vllm_plugin/` incluido en el propio checkpoint). El comando de ejemplo usa `--enforce-eager`, `--no-enable-prefix-caching`, `--kv-cache-memory-bytes 6G` y `--max-num-seqs 16`.
- No se menciona soporte para llama.cpp, Ollama o TGI; el formato compressed-tensors y la arquitectura personalizada lo hacen dependiente del plugin de vLLM.
- Latencia y throughput: no disponible en cifras concretas; la model card afirma decodificación de "velocidad constante O(1)" respecto a la longitud del contexto, pero no publica tokens/segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | VRAM a 1M tokens | Licencia |
|---|---|---|---|---|---|
| PseudoBrain-Qwen3.5-4B-W4A16 | ~5.000 M | 1.048.576 | W4A16 | ~3,8 GB | Apache 2.0 |
| PseudoBrain-Qwen3.5-4B-FP8 | ~5.000 M | 1.048.576 | FP8 | ~6,0 GB | Apache 2.0 |
| PseudoBrain-Qwen3.5-4B-BF16 | ~5.000 M | 1.048.576 | BF16 | ~10,0 GB | Apache 2.0 |
| Qwen3.5-4B (base) | ~4.000 M (estimado por nombre) | no disponible | BF16 | no disponible | no disponible |

Las alternativas más directas son las otras ediciones del propio proyecto PseudoBrain, que comparten arquitectura y difieren en precisión y VRAM objetivo. No se dispone de datos de rendimiento comparables con otros modelos híbridos de contexto largo de tamaño similar (por ejemplo, variantes de Qwen con GDN u otros modelos edge de 4B), por lo que la comparación de rendimiento no disponible.

## Limitaciones y advertencias

- Es un modelo modificado por un tercero a partir de Qwen3.5-4B; no hay datos publicados que verifiquen que la calidad de generación se mantenga tras la conversión a la arquitectura PseudoBrain y la cuantización W4A16.
- No se han publicado benchmarks estandarizados en la información disponible; las cifras de memoria provienen de la propia model card del autor y no han sido verificadas de forma independiente.
- El despliegue requiere el plugin `pb27_vllm` y flags concretos de vLLM (`VLLM_ALLOW_LONG_MAX_MODEL_LEN=1`, `--enforce-eager`, `--no-enable-prefix-caching`), lo que limita la portabilidad a otros runtimes de inferencia.
- El prefijo de caché está deshabilitado en la configuración recomendada, lo que puede penalizar el rendimiento en cargas con prompts repetidos.
- Idiomas soportados: no disponible; al derivar de Qwen3.5-4B es razonable asumir soporte multilingüe, pero no está documentado en la ficha.
- Riesgo de alucinación y sesgos: no documentados específicamente; deben asumirse los inherentes al modelo base Qwen3.5-4B.
- Descargas muy bajas (353) y cero likes en Hugging Face: proyecto muy reciente y de autor individual, con menor garantía de mantenimiento y auditoría comunitaria que modelos de laboratorios establecidos.
- Licencia Apache 2.0: sin restricciones para uso comercial, aunque conviene revisar los términos del modelo base Qwen3.5-4B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3.5-4B-W4A16
- Repositorio de GitHub (plugin pb27_vllm y engine): https://github.com/defnotean/pseudobrain
- Paper de arquitectura (Markdown): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.md
- Paper de arquitectura (PDF): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf
- Benchmark receipts: https://github.com/defnotean/pseudobrain/tree/main/reports
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Ediciones alternativas: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3.5-4B-FP8, https://huggingface.co/defnoteatin/PseudoBrain-Qwen3.5-4B-NVFP4, https://huggingface.co/defnoteatin/PseudoBrain-Qwen3.5-4B-BF16
