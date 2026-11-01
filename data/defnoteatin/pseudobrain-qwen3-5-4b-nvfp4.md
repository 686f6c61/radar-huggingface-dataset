# defnoteatin/PseudoBrain-Qwen3.5-4B-NVFP4

## Resumen

PseudoBrain-Qwen3.5-4B-NVFP4 es una re-arquitectura del modelo Qwen3.5-4B de Qwen, publicada por Ian Kurt Galeon (usuario defnoteatin en Hugging Face), cuyo objetivo es permitir el manejo de contextos de hasta 1.048.576 tokens (1M) en GPUs de consumo y portátiles con menos de 4 GB de VRAM dedicada al modelo. El problema que resuelve es el clásico cuello de botella de la caché KV en servidores de inferencia: mientras los pesos se pagan una sola vez, la memoria de la caché KV crece linealmente con la longitud de contexto y el cómputo de prefill crece cuadráticamente, lo que provoca errores de memoria (OOM) en workloads de contexto largo incluso cuando la GPU cabe los pesos holgadamente.

La solución técnica, denominada arquitectura PseudoBrain (clase `PB27ForConditionalGeneration`), combina 24 capas recurrentes Gated DeltaNet con estado de tamaño constante O(1) y 8 capas de atención completa con ventana deslizante de 16K tokens que incorporan un mecanismo de memoria exacta dispersa ("Quest Exact Memory") con recuperación jerárquica desde NVMe. Según el autor, esto reduce la memoria de caché KV a 1M tokens en un 99,2 % (de 24 GB a unos 192 MiB de ventana activa). El checkpoint distribuido está cuantizado en formato NVFP4 (W4A16), pesa unos 2,8 GB y se sirve mediante un plugin propio para vLLM. Es relevante ahora porque la demanda de contextos largos en hardware edge crece rápidamente y las soluciones dominantes requieren aceleradores de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 24 capas Gated DeltaNet (lineal/recurrente) + 8 capas de atención completa 16K SWA con Quest Exact Memory (PB27ForConditionalGeneration) |
| Parametros totales | 2.875.319.808 (~2,88 B, según safetensors) |
| Parametros activos | no disponible (no es MoE; arquitectura densa híbrida) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | NVFP4 (W4A16); existen ediciones hermanas en FP8 y BF16 del mismo autor |
| Idiomas soportados | no disponible (hereda de Qwen3.5-4B; no especificado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (~2,8 GB de pesos; repo de 4,9 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B como base y lo reestructura en una arquitectura híbrida de 32 capas: 24 capas nativas Gated DeltaNet (un modelo de espacio-estado atencional lineal con estado recurrente de tamaño fijo, independiente de la longitud del contexto) y 8 capas de atención completa en las posiciones [3, 7, 11, 15, 19, 23, 27, 31], convertidas en atención con ventana deslizante de 16.384 tokens más un módulo paralelo de Gated DeltaNet y una "Quest Exact Memory" dispersa. Sobre las capas ancla dispersas, las consultas atienden sobre un conjunto compuesto por 4 sinks de StreamingLLM, landmarks de super-bloques, las top-k páginas de memoria exacta y la ventana deslizante, fusionadas mediante FlashAttention-2 con LSE-merge y límites jerárquicos de dos niveles en bf16.

Dos innovaciones adicionales destacan en la model card: un RoPE por bloques estrictamente no solapado y proporcional al hueco histórico, que mantiene una fidelidad de distancia temporal superior al 99 % a 1M tokens sin degradación estática tipo YaRN; y una agregación global densa que detecta consultas de alta participación y activa landmarks-resumen (un token resumen por cada 4.096 tokens) junto con barridos rotativos por novedad del conjunto de trabajo en decodificación, permitiendo razonamiento multi-paso sobre cientos de bloques distintos. La decodificación es de coste constante O(1) (stride de 64 y 64 bloques por paso). No hay datos sobre el proceso de entrenamiento o post-entrenamiento de la re-arquitectura (tokens, datasets, RLHF/DPO) en la información disponible; el modelo hereda el entrenamiento de la familia Qwen3.5.

## Capacidades

- Generación de texto conversacional (pipeline text-generation), heredando las capacidades de la base Qwen3.5-4B.
- Contexto ultra-largo: hasta 1.048.576 tokens con memoria de caché KV prácticamente constante.
- Razonamiento multi-paso sobre contextos de 1M tokens mediante barridos de memoria por novedad (visit_counts).
- Soporte de tool calling / function calling: el comando de servido recomendado activa `--enable-auto-tool-choice` con parser `qwen3_coder` y parser de razonamiento `qwen3`.
- Modo de razonamiento compatible con el parser qwen3 de vLLM.
- Despliegue como servidor compatible con la API de OpenAI vía vLLM (V1 y V2), en NVIDIA CUDA y AMD ROCm.
- Recuperación de memoria exacta desde NVMe/page-cache, lo que permite servir contextos que exceden la VRAM física.

## Casos de uso

- Análisis de repositorios de código completos: con 1M tokens de contexto se puede cargar un codebase entero en una sola sesión y hacer preguntas de arquitectura o refactorización; el tool calling con parser qwen3_coder facilita la integración en agentes de código.
- Chatbots de atención al cliente con historial masivo: el estado recurrente O(1) permite mantener conversaciones acumulativas de meses sin que la memoria crezca, en GPUs de 6-8 GB.
- Procesamiento de documentos largos (contratos, expedientes, literatura científica): el prefill con presupuesto de recuperación escalado permite ingerir cientos de miles de tokens y responder preguntas con la memoria exacta dispersa.
- Asistentes locales en portátiles: con ~3,8 GB de VRAM total a 1M tokens, cabe en GPUs como RTX 3050/4060, adecuado para despliegues edge sin conexión a servicios externos.
- RAG de baja latencia sin base de datos vectorial externa: la Quest Exact Memory jerárquica actúa como mecanismo de recuperación interno sobre el propio contexto.
- Despliegues on-premise empresariales de contexto largo: el autor ofrece explícitamente soporte para instalaciones enterprise on-premise de 1M de contexto; la licencia Apache 2.0 permite uso comercial sin restricciones.
- Investigación en arquitecturas híbridas lineal-atención: el paper de arquitectura y los reports de benchmarks públicos facilitan la reproducción y el estudio del diseño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El repositorio de GitHub del autor incluye un directorio `reports/` con "benchmark receipts" propios (principalmente métricas de memoria y rendimiento de inferencia, no de calidad del modelo), que no han sido verificados de forma independiente. No hay datos de comparación de calidad frente a la base Qwen3.5-4B tras la re-arquitectura.

## Requisitos de hardware

- VRAM estimada para inferencia: ~3,8 GB totales a 1M tokens de contexto (pesos ~2,8 GB + ventana activa de ~192 MiB y pool de ~1,0 GB), según la model card del autor.
- GPUs objetivo declaradas: NVIDIA Blackwell de portátil y escritorio (RTX 5050/5060 o superiores, DGX Spark GB10) por el formato NVFP4; la edición W4A16 del mismo modelo apunta a GPUs de 6-8 GB como RTX 3050/3060/4060 y AMD RX 6600/7600.
- Sí cabe en GPUs de consumo: es uno de los puntos centrales del proyecto; en concreto GPUs de portátil de 6-8 GB y aceleradores Blackwell de entrada. No hay datos para Apple Silicon.
- Despliegue: exclusivamente mediante vLLM con el plugin `pb27_vllm` (instalable por pip desde GitHub o incluido en el propio checkpoint). No hay soporte declarado para llama.cpp, Ollama o TGI.
- Requisitos del servidor recomendado: `--max-model-len 1048576`, `--enforce-eager`, `--no-enable-prefix-caching`, `--kv-cache-memory-bytes 6G`, `--max-num-seqs 16`, con `VLLM_ALLOW_LONG_MAX_MODEL_LEN=1`.
- Latencia y throughput: no disponible en cifras concretas; la model card afirma decodificación de velocidad constante O(1) independiente del tamaño de contexto, pero no publica tokens/segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Memoria a contexto largo | Licencia |
|---|---|---|---|---|---|
| PseudoBrain-Qwen3.5-4B-NVFP4 | ~2,88 B | 1M | Híbrida GDN + SWA + memoria dispersa | ~3,8 GB totales (1M tokens, dato del autor) | Apache 2.0 |
| Qwen3.5-4B (base) | ~4 B | no disponible en la información proporcionada | Transformer denso | Caché KV creciente lineal | no disponible aquí |
| Qwen3-4B (generación anterior) | ~4 B | 32K-128K (según versión) | Transformer denso | Caché KV estándar O(L) | Apache 2.0 |
| Phi-4-mini (Microsoft) | ~3,8 B | 128K | Transformer denso | Caché KV estándar O(L) | MIT |

Nota: la comparación de calidad de salida no es posible porque no hay benchmarks públicos comparables; la ventaja declarada de PseudoBrain es de eficiencia de memoria y contexto, no de calidad bruta.

## Limitaciones y advertencias

- Los datos de memoria (99,2 % de reducción, ~3,8 GB a 1M tokens) provienen exclusivamente del autor y no están verificados de forma independiente; los "benchmark receipts" son materiales propios.
- No hay evaluaciones de calidad publicadas: se desconoce cuánto degrada la re-arquitectura y la cuantización NVFP4 respecto al Qwen3.5-4B original en tareas estándar.
- Requiere vLLM con un plugin de terceros (`pb27_vllm`); no funciona con llama.cpp, Ollama, TGI ni con la mayoría de runtimes estándar, lo que limita la portabilidad.
- El formato NVFP4 está orientado a GPUs NVIDIA Blackwell; en hardware más antiguo conviene usar las ediciones FP8, W4A16 o BF16 del mismo autor.
- El número de descargas (351) y ausencia de likes indican adopción muy temprana; la madurez del software y la estabilidad en producción no están contrastadas.
- Idiomas soportados no especificados; sesgos y riesgo de alucinación no documentados, aunque heredan de la base Qwen3.5.
- La licencia Apache 2.0 no impone restricciones de uso comercial, pero conviene verificar las licencias de la base Qwen3.5 y de cualquier componente del plugin.
- El proyecto es también un portafolio personal del autor (que ofrece servicios de despliegue enterprise), lo que conviene tener en cuenta al evaluar la neutralidad de las afirmaciones de rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3.5-4B-NVFP4
- Repositorio GitHub (plugin vLLM `pb27_vllm`): https://github.com/defnotean/pseudobrain
- Paper de arquitectura (PDF): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf
- Paper de arquitectura (Markdown): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.md
- Reports de benchmarks del autor: https://github.com/defnotean/pseudobrain/tree/main/reports
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Cuantización origen: https://huggingface.co/AxionML/Qwen3.5-4B-NVFP4
- Perfil del autor en GitHub: https://github.com/defnotean
