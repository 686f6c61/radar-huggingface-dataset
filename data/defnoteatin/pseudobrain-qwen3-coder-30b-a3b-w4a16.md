# defnoteatin/PseudoBrain-Qwen3-Coder-30B-A3B-W4A16

## Resumen

PseudoBrain-Qwen3-Coder-30B-A3B-W4A16 es una versión cuantizada (W4A16) y modificada arquitecturalmente del Qwen3-Coder-30B-A3B-Instruct de Qwen, publicada por el desarrollador independiente Ian Kurt Galeon (usuario `defnoteatin` en Hugging Face). El modelo parte de un MoE de código abierto orientado a programación y lo reestructura mediante la arquitectura "PseudoBrain" (clase `PB27Qwen3MoeForCausalLM`), que sustituye la atención global completa por una combinación híbrida de atención con ventana deslizante de 16K, Gated DeltaNet paralelo y un mecanismo de memoria dispersa llamado Quest Exact Memory.

El problema que aborda es el crecimiento lineal de la caché KV y el crecimiento cuadrático del prefill en contextos muy largos: según el autor, la arquitectura reduce la memoria de caché KV a 1M tokens de unos 192 GB a aproximadamente 3,1 GB (una reducción del 98,4 %), manteniendo un decode de coste constante O(1). Esto permite servir contextos de hasta 1.048.576 tokens en una única GPU de consumo de 24 GB, algo inviable con la arquitectura Transformer estándar.

Es relevante porque combina tres elementos demandados en la actualidad: capacidades agénticas y de código heredadas de Qwen3-Coder, contexto extremadamente largo con memoria constante, y cuantización W4A16 compatible con vLLM mediante un plugin propio (`pb27_vllm`). Cabe señalar que se trata de un proyecto de un autor independiente, no de una organización consolidada, por lo que conviene validar los resultados publicados antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PB27Qwen3MoeForCausalLM (MoE híbrido: ventana deslizante 16K + Gated DeltaNet paralelo + Quest Exact Memory) |
| Parametros totales | 30,5B (base Qwen3-Coder-30B-A3B); 5.306.567.040 parámetros almacenados en safetensors tras la cuantización W4A16 |
| Parametros activos | ~3,3B por token (heredado del diseño A3B del modelo base) |
| Longitud de contexto | 1.048.576 tokens (1M), según la configuración del autor |
| Tipos de cuantizacion | W4A16 (pesos a 4 bits, activaciones a 16 bits); existen ediciones FP8, NVFP4 y BF16 en reposos hermanos |
| Idiomas soportados | no disponible (el modelo base Qwen3-Coder no publica lista explícita en la información proporcionada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), diseñado para vLLM |

## Arquitectura y entrenamiento

El modelo no se ha reentrenado desde cero: es una reconversión arquitectural del Qwen3-Coder-30B-A3B-Instruct, un MoE de 30,5B parámetros totales con unos 3,3B activos por token. La modificación principal convierte las 48 capas de atención global en un esquema híbrido de 48 capas con atención de ventana deslizante de 16K tokens, un Gated DeltaNet (GDN) paralelo cuyo estado recurrente tiene tamaño fijo O(1) independientemente del contexto, y memoria exacta Quest en capas ancla dispersas.

Sobre esa base, el autor añade varias innovaciones técnicas: un sistema de memoria Quest de tres niveles (NVMe/page-cache) donde las consultas atienden sobre 4 sinks de StreamingLLM, super-bloques landmark, páginas Top-k de memoria exacta y la ventana de 16.384 tokens, fusionadas vía FlashAttention-2 con LSE-merge; un RoPE por bloques estrictamente no solapado que preserva la continuidad local y la fidelidad de distancia temporal proporcional a 1M tokens sin degradación estática de YaRN; y una agregación global densa con landmarks de resumen residentes en HBM (un token de resumen por cada 4.096 tokens) y barridos de conjunto de trabajo con rotación por novedad para razonamiento multi-paso.

No se ha publicado información sobre entrenamiento adicional, fine-tuning, número de tokens ni alineación (RLHF/DPO) aplicados en esta conversión; el modelo hereda el entrenamiento del Qwen3-Coder-30B-A3B-Instruct original de Qwen.

## Capacidades

- Generación de texto conversacional (pipeline text-generation), heredada del modelo base instruct.
- Generación y razonamiento sobre código, al estar basado en Qwen3-Coder, especializado en tareas de programación.
- Comportamiento agéntico: el modelo base está optimizado para uso agéntico y el despliegue recomendado incluye `--enable-auto-tool-choice` con el parser `qwen3_coder`, lo que indica soporte de tool calling / function calling.
- Contexto extremadamente largo (hasta 1M tokens) con memoria de caché KV aproximadamente constante (~3,1 GB a 1M tokens según el autor), adecuado para razonamiento multi-paso sobre bases de código completas o historiales muy extensos.
- Razonamiento multi-paso sobre contexto largo mediante barridos de memoria con rotación por novedad (mecanismo propio de la arquitectura PseudoBrain).
- Despliegue como servidor compatible con la API de OpenAI vía vLLM, en NVIDIA CUDA y AMD ROCm.

## Casos de uso

- Análisis y edición de repositorios de código completos: con 1M tokens de contexto, el modelo puede cargar en una sola sesión un monorepo de tamaño considerable y responder preguntas o proponer refactorizaciones sobre el conjunto, algo que con atención estándar requeriría cantidades prohibitivas de VRAM para la caché KV.
- Agentes de programación de larga duración: el soporte de tool calling con el parser `qwen3_coder` y el contexto de 1M tokens permiten sesiones agénticas multi-paso (leer archivos, ejecutar tests, corregir errores) sin perder el historial por truncamiento.
- Asistentes de documentación corporativa: indexar y consultar documentos muy extensos (contratos, especificaciones, logs) en local, gracias a que la memoria KV a 1M tokens cabe en una GPU de 24 GB.
- Atención al cliente con historial completo: gestión de conversaciones multi-turno muy largas conservando todo el contexto sin estrategia de resumen o truncado, con coste de decode constante.
- Inferencia local en estación de trabajo: con unos 20,5 GB de VRAM total estimados a 1M tokens, cabe en una RTX 3090/4090 de 24 GB, lo que habilita despliegues on-premise sin hardware de centro de datos.
- Procesamiento por lotes de documentos largos: el prefill con presupuesto de recuperación escalado y el decode O(1) permiten servir múltiples secuencias concurrentes (`--max-num-seqs 16`) sobre contextos enormes en un solo nodo.
- Auditoría de logs y trazas: análisis de millones de tokens de logs de aplicación o telemetría manteniendo fidelidad de distancias temporales gracias al RoPE por bloques proporcional.

## Benchmarks y rendimiento

El autor publica "benchmark receipts" en el repositorio de GitHub del proyecto (carpeta `reports/`) y un paper de arquitectura, pero no se incluyen cifras concretas de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. No se han publicado resultados de benchmarks verificables en la información proporcionada.

Como referencia de rendimiento de memoria (dato del autor, no verificado de forma independiente): reducción de la caché KV a 1M tokens de 192,0 GB a ~3,1 GB (98,4 %), con pesos de ~16,5 GB y VRAM total estimada de ~20,5 GB a contexto máximo.

## Requisitos de hardware

- VRAM estimada para inferencia: ~16,5 GB para los pesos (W4A16) y ~20,5 GB de VRAM total a 1.048.576 tokens de contexto, según el autor.
- GPUs recomendadas: RTX 3090 o RTX 4090 (24 GB), AMD RX 7900 XTX (24 GB) vía ROCm, y RTX 5090 (32 GB). Para las ediciones FP8/NVFP4/BF16 del mismo proyecto se sugieren L40S, A100, H100, DGX Spark, MI300X y B200.
- Sí cabe en GPU de consumo: una única RTX 3090/4090 de 24 GB es suficiente para la edición W4A16 incluso a contexto máximo, según los datos publicados.
- Motor de inferencia: vLLM con el plugin `pb27_vllm` (instalable desde GitHub, soporta runners V1/V2 de vLLM, NVIDIA CUDA y AMD ROCm). No se menciona soporte para llama.cpp u Ollama; dado que la arquitectura es custom, probablemente no funcione en runtimes estándar sin adaptación.
- Comando de referencia del autor: `vllm serve` con `--max-model-len 1048576`, `--enforce-eager`, `--no-enable-prefix-caching`, `--kv-cache-memory-bytes 6G` y `--max-num-seqs 16`.
- Latencia y throughput: no disponible (no se publican cifras de tokens/segundo; el autor afirma decode de velocidad constante O(1) respecto a la longitud de contexto).

## Comparativa con modelos similares

| Modelo | Parametros (totales/activos) | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| PseudoBrain-Qwen3-Coder-30B-A3B-W4A16 | 30,5B / ~3,3B | 1.048.576 tokens | MoE híbrido (SWA + Gated DeltaNet + Quest Memory) | Apache 2.0 | Caché KV ~3,1 GB a 1M tokens (dato del autor); requiere plugin vLLM propio |
| Qwen/Qwen3-Coder-30B-A3B-Instruct | 30,5B / ~3,3B | 256K (nativo, según Qwen) | Transformer MoE estándar | Apache 2.0 | Modelo base; caché KV crece linealmente, inviable a 1M tokens en 24 GB |
| Qwen/Qwen3-Coder-30B-A3B-Instruct-FP8 | 30,5B / ~3,3B | 256K (nativo) | Transformer MoE estándar | Apache 2.0 | Cuantización FP8 oficial; mismo compromiso de contexto que el base |
| Qwen3-Coder-480B-A35B | 480B / ~35B | 256K (nativo) | Transformer MoE estándar | Apache 2.0 | Modelo insignia de Qwen para código; muy superior en capacidad pero requiere múltiples GPUs de centro de datos |

## Limitaciones y advertencias

- Proyecto de un autor independiente: las cifras de reducción de memoria (98,4 %) y de VRAM (~20,5 GB a 1M tokens) proceden de la model card del autor y de sus "benchmark receipts", no de validación independiente. Conviene replicarlas antes de comprometer producción.
- La conversión arquitectural (sustitución de atención completa por SWA + Gated DeltaNet + memoria dispersa) puede degradar la calidad de generación respecto al modelo base Qwen3-Coder, especialmente en tareas que requieren recuperación exacta de detalles muy lejanos en el contexto; no se publican comparativas de calidad cabeza a cabeza en la información disponible.
- Riesgo de alucinación: inherente a cualquier LLM; además, los mecanismos de memoria dispersa (landmarks, páginas Top-k) introducen un punto adicional de posible pérdida de información en contextos extremos.
- Requiere un plugin de vLLM específico (`pb27_vllm`) y flags concretos (`--enforce-eager`, `--no-enable-prefix-caching`); no es un checkpoint plug-and-play en runtimes estándar como llama.cpp, Ollama o TGI.
- El conteo de parámetros en safetensors (5,3B) es el tamaño almacenado tras la cuantización W4A16 y no refleja los 30,5B parámetros lógicos del modelo; esto puede confundir a herramientas que inspeccionan el repo.
- Idiomas soportados: no disponible explícitamente; el modelo base está orientado a código e inglés, por lo que el rendimiento en castellano no está documentado.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque hay que respetar los avisos de atribución.
- La creación del modelo figura con fecha de 2026, posterior al corte de conocimiento de esta ficha; verifica el estado actual del repositorio y del plugin antes de instalar.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3-Coder-30B-A3B-W4A16
- Repositorio GitHub del proyecto PseudoBrain y plugin `pb27_vllm`: https://github.com/defnotean/pseudobrain
- Paper de arquitectura (Markdown): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.md
- Paper de arquitectura (PDF): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf
- Resultados de benchmarks del autor: https://github.com/defnotean/pseudobrain/tree/main/reports
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- GitHub del autor: https://github.com/defnotean
