# defnoteatin/PseudoBrain-Qwen3.5-9B-NVFP4

## Resumen

PseudoBrain-Qwen3.5-9B-NVFP4 es una reimplementación cuantizada del modelo Qwen3.5-9B de Qwen, creada por Ian Kurt Galeon (usuario `defnoteatin` en Hugging Face). El objetivo del proyecto es resolver el problema clásico del servicio de modelos con contextos extremadamente largos: en un transformer estándar, la caché KV crece linealmente con la longitud de contexto y el coste de prefill crece de forma cuadrática, lo que provoca desbordamientos de memoria en cargas de trabajo de 128K a 1M de tokens. La arquitectura PseudoBrain (clase `PB27ForConditionalGeneration`) aborda esto mediante una estructura híbrida de 32 capas que combina atención con ventana deslizante y el mecanismo recurrente Gated DeltaNet, cuyo estado tiene tamaño constante O(1) independientemente del contexto.

La versión NVFP4 cuantiza los pesos a formato W4A16 (aproximadamente 5,5 GB de pesos), permitiendo servir 1.000.000 de tokens de contexto en unos 6,5 GB de VRAM total, lo que la hace viable en GPUs de consumo de 8 a 12 GB. Se despliega mediante un plugin propio para vLLM (`pb27_vllm`), compatible con NVIDIA CUDA y AMD ROCm, y expone un servidor compatible con la API de OpenAI. Es relevante para desarrolladores que necesitan contexto masivo on-premise sin recurrir a GPUs de centro de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 24 capas Gated DeltaNet + 8 capas de atención completa con ventana deslizante de 16K + Quest Exact Memory (PB27ForConditionalGeneration) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE; modelo denso) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | NVFP4 (W4A16); existen ediciones FP8, BF16 y AWQ-4bit del mismo modelo base |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), 12,3 GB de repositorio; ejecución vía vLLM con plugin pb27_vllm |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B y lo reconstruye bajo la arquitectura PseudoBrain, descrita en un documento técnico publicado por el autor en GitHub (`PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf`). La estructura consiste en 32 capas: 24 capas nativas de Gated DeltaNet (un mecanismo recurrente de estado fijo) y 8 capas de atención completa (índices 3, 7, 11, 15, 19, 23, 27 y 31) convertidas en atención con ventana deslizante de 16K tokens combinada con Gated DeltaNet en paralelo y "Quest Exact Memory". Sobre las capas de anclaje dispersas, las queries atienden sobre un conjunto compuesto por 4 sinks de StreamingLLM, landmarks de super-bloques, las páginas top-k de Quest Exact Memory y la ventana deslizante de 16.384 tokens, fusionadas mediante FlashAttention-2 con LSE-merge.

Entre las innovaciones destacan: un RoPE por bloques estrictamente no solapado que mantiene la fidelidad de distancias temporales proporcionales a 1M de tokens sin degradación estática tipo YaRN; una agregación global densa que detecta queries de participación global y activa landmarks resumen (un token resumen por cada 4.096 tokens en HBM) con barridos rotativos por novedad para razonamiento multi-paso; y una decodificación de velocidad constante O(1) que reduce la memoria de caché KV a 1M tokens en un 99,2 % (de 32 GB a unos 256 MiB de ventana activa, con un pool de ~1 GB). No se dispone de información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO), ni sobre si la conversión a PseudoBrain requirió entrenamiento adicional o destilación.

## Capacidades

- Generación de texto conversacional (pipeline text-generation), heredada de Qwen3.5-9B.
- Modo de razonamiento compatible con el parser `qwen3` de vLLM (reasoning-parser).
- Tool calling / function calling: soportado mediante `--enable-auto-tool-choice` con el parser `qwen3_coder`.
- Contexto extremadamente largo: hasta 1.048.576 tokens con memoria de estado constante, adecuado para razonamiento multi-paso sobre documentos masivos.
- Decodificación a velocidad constante O(1) durante la fase de decode, independiente de la longitud de contexto.
- Despliegue como servidor compatible con la API de OpenAI vía vLLM (V1/V2), en NVIDIA CUDA y AMD ROCm.
- Capacidades multilingües: no disponible (no especificado en la model card).

## Casos de uso

- Analisis de repositorios de código completos: con 1M de tokens de contexto se puede cargar un monorepo entero en una sola petición para revisiones de código, refactoring asistido o generación de documentación, todo en una GPU de consumo.
- Revisión de documentos legales y contratos extensos: la ventana de 1M de tokens permite ingestar expedientes completos y responder preguntas con fidelidad de distancia temporal proporcional gracias al RoPE por bloques.
- Chatbots con memoria de sesión muy larga: el estado recurrente O(1) del Gated DeltaNet mantiene coste de memoria constante, ideal para asistentes que acumulan meses de historial conversacional.
- Procesamiento de logs y datos de telemetría: el barrido por novedad sobre super-bloques permite razonar multi-paso sobre cientos de bloques distintos en series temporales largas.
- Despliegue on-premise en entornos con hardware limitado: con ~6,5 GB de VRAM a 1M de contexto, cabe en una RTX 3060 o 4060, útil para empresas que no pueden enviar datos a la nube.
- Investigación en arquitecturas de contexto largo: el código del plugin y el paper de arquitectura están públicos, lo que permite estudiar y extender el mecanismo de Quest Exact Memory.
- Agentes con razonamiento multi-paso sobre grandes corpus: la combinación de tool calling y contexto masivo permite pipelines agentiles que consultan herramientas y mantienen todo el historial de interacción en contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor referencia "benchmark receipts" en el directorio `reports/` de su repositorio de GitHub, pero no incluye métricas comparativas verificables en la model card. Los únicos datos de rendimiento publicados son de ingeniería de inferencia: reducción del 99,2 % en memoria de caché KV a 1M de tokens (de 32 GB a ~256 MiB de ventana activa con pool de ~1 GB) y decodificación con presupuesto de cómputo constante.

## Requisitos de hardware

- VRAM estimada para inferencia: ~6,5 GB totales a 1M de tokens de contexto (pesos ~5,5 GB en W4A16 + pool de caché de ~1 GB).
- GPUs objetivo según el autor: NVIDIA Blackwell (RTX 5060, 5070, 5080, 5090, DGX Spark GB10) para NVFP4; también se listan RTX 3060, 4060, 4070, 3090 y 4090, y AMD RX 7600 y 7900 XTX para la familia de ediciones.
- Cabe en GPUs de consumo de 8 a 12 GB según la model card; la edición NVFP4 está orientada específicamente a hardware Blackwell.
- Despliegue: vLLM con el plugin `pb27_vllm` (instalable vía pip desde GitHub o incluido en el propio checkpoint). No se menciona soporte para llama.cpp, Ollama o TGI.
- Comandos de referencia: `vllm serve` con `--max-model-len 1048576`, `--enforce-eager`, `--no-enable-prefix-caching`, `--kv-cache-memory-bytes 6G` y `--max-num-seqs 16`.
- Latencia y throughput: no disponible (no se publican cifras de tokens/segundo ni latencias).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | VRAM a contexto maximo | Licencia |
|---|---|---|---|---|---|
| PseudoBrain-Qwen3.5-9B-NVFP4 | 9,4 B | 1M | NVFP4 (W4A16) | ~6,5 GB | Apache 2.0 |
| PseudoBrain-Qwen3.5-9B-FP8 | 9,4 B | 1M | FP8 | ~11,0 GB | Apache 2.0 |
| PseudoBrain-Qwen3.5-9B-BF16 | 9,4 B | 1M | BF16 | ~20,0 GB | Apache 2.0 |
| Qwen/Qwen3.5-9B (base) | 9,4 B (aprox.) | no disponible | BF16 (original) | no disponible | no disponible |

Las alternativas FP8 y BF16 del propio autor son las comparaciones más directas: ofrecen la misma arquitectura y contexto, con mayor precisión a costa de VRAM. Frente a modelos convencionales densos de ~9B con contexto de 128K, PseudoBrain ofrece 8 veces más contexto con memoria de caché constante, aunque sin benchmarks públicos que permitan comparar calidad de salida. No hay datos comparativos de rendimiento frente a otros modelos híbridos (por ejemplo, arquitecturas tipo Mamba o SSM) en la información disponible.

## Limitaciones y advertencias

- No hay benchmarks de calidad (MMLU, HumanEval, etc.) publicados: la calidad del modelo tras la conversión a PseudoBrain y la cuantización NVFP4 no está verificada de forma independiente.
- La cuantización NVFP4 (W4A16) puede degradar la precisión respecto a BF16, especialmente en tareas de razonamiento fino; no se publican evaluaciones de esta degradación.
- El despliegue requiere un plugin de vLLM de terceros (`pb27_vllm`), con flags específicos obligatorios (`--enforce-eager`, `--no-enable-prefix-caching`), lo que añade dependencia de un proyecto de un solo autor y puede romperse con actualizaciones de vLLM (aunque el autor declara soporte V1/V2 y resiliencia a versiones).
- El prefijo de la model card indica que el modelo base es Qwen3.5-9B con fecha de creación en 2026; la trazabilidad del modelo base original y su entrenamiento no está documentada en la ficha.
- Sesgos y riesgo de alucinación: no disponible (no se documentan evaluaciones de seguridad ni de alucinación).
- Idiomas soportados: no disponible.
- Licencia Apache 2.0: sin restricciones para uso comercial, aunque conviene verificar la licencia del modelo base Qwen3.5-9B original.
- La configuración de servidor desactiva prefix caching, lo que puede penalizar throughput en cargas con prefijos repetidos.

## Enlaces

- Hugging Face: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3.5-9B-NVFP4
- GitHub del proyecto PseudoBrain: https://github.com/defnotean/pseudobrain
- Paper de arquitectura (PDF): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf
- Paper de arquitectura (Markdown): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.md
- Reports de benchmarks del autor: https://github.com/defnotean/pseudobrain/tree/main/reports
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Ediciones alternativas del autor: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3.5-9B-FP8 y https://huggingface.co/defnoteatin/PseudoBrain-Qwen3.5-9B-BF16
- Perfil de GitHub del autor: https://github.com/defnotean
