# defnoteatin/PseudoBrain-Qwen3.8-Flash-Next-BF16

## Resumen

PseudoBrain-Qwen3.8-Flash-Next-BF16 es un modelo de lenguaje generativo desarrollado por Ian Kurt Galeon (usuario `defnoteatin` en Hugging Face), basado en un ajuste sobre Qwen/Qwen3.8-Flash-Next. Su objetivo es resolver el principal cuello de botella del servicio de modelos con contexto extremadamente largo: el crecimiento lineal de la caché KV y el coste cuadrático del prefill en Transformers convencionales. Para ello introduce la arquitectura "PseudoBrain", que combina atención por ventana deslizante con capas recurrentes Gated DeltaNet de estado de tamaño constante, más un sistema de memoria exacta por páginas denominado Quest Exact Memory.

El modelo es un MoE ultra-esparsa de aproximadamente 131 mil millones de parámetros totales según los safetensors del repositorio (el autor lo describe como 36B totales con 1.7B activos por token, dato no verificado de forma independiente), con una ventana de contexto de hasta 1.048.576 tokens y memoria de decodificación prácticamente constante. El autor reporta velocidades de 45–183 tok/s mediante decodificación especulativa DFlash2. Es relevante ahora porque ofrece contexto de un millón de tokens con una huella de VRAM reducida (alrededor de 78 GB en BF16), algo que con atención completa requeriría cientos de gigabytes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PB27Qwen4ExpForConditionalGeneration: MoE hibrido con Gated DeltaNet + atención por ventanas + Quest Exact Memory |
| Parametros totales | 131.095.277.588 (según safetensors del repo; la model card lo describe como 36B-A1.7B) |
| Parametros activos | ~1.7B por token (según la model card; no verificado de forma independiente) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | BF16 (esta edición); también existen ediciones W4A16, FP8 y NVFP4 del mismo modelo |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16), tamaño del repo 262,2 GB |

## Arquitectura y entrenamiento

La arquitectura consta de 48 capas: 36 capas nativas Gated DeltaNet (una capa recurrente lineal con estado de tamaño O(1) independiente de la longitud del contexto) y 12 capas de atención completa (posiciones 3, 7, 11, ..., 47) convertidas en atención por ventana deslizante de 16K combinada en paralelo con Gated DeltaNet y Quest Exact Memory. Sobre las capas dispersas, las queries atienden sobre un conjunto compuesto por 4 sinks de StreamingLLM, landmarks de super-bloques, las top-k páginas de Quest Exact Memory y una ventana deslizante de 16.384 tokens, fusionadas mediante FlashAttention-2 con LSE-merge y cotas jerárquicas de dos niveles en bf16.

Entre las innovaciones destacadas en la model card figuran: un RoPE por bloques estrictamente no solapado que preserva la fidelidad de distancias temporales proporcionales a 1M tokens sin degradación estática de YaRN; agregación global densa con landmarks resumidos (un token resumen por cada 4.096 tokens en HBM); y decodificación a velocidad constante O(1) con presupuesto de decodificación desacoplado del prefill, lo que según el autor reduce la memoria de caché KV a 1M tokens en más de un 96% (de ~48 GB a ~486 MiB de ventana activa, con un pool de 4,7 GB para 1,15M tokens). Sobre el preentrenamiento del modelo base (número de tokens, composición del dataset) y sobre el proceso de ajuste fino específico de esta variante (RLHF, DPO, datos utilizados) no hay información disponible en la model card.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation).
- Contexto ultra-largo de hasta 1.048.576 tokens con memoria de decodificación constante, apto para razonamiento multi-paso sobre corpus masivos.
- Decodificación especulativa DFlash2, con velocidades reportadas de 45–183 tok/s.
- Diseñado para razonamiento multi-paso con barridos de "novelty-rotating" sobre cientos de bloques distintos a lo largo del contexto de 1M tokens.
- Soporte de despliegue como servidor compatible con la API de OpenAI mediante vLLM (plugin `pb27_vllm`), en NVIDIA CUDA y AMD ROCm.
- No hay información disponible sobre tool calling / function calling, capacidades de visión o audio, ni sobre el número exacto de idiomas soportados (el modelo base Qwen3.8-Flash-Next presumiblemente hereda capacidades multilingues, pero no está documentado en esta ficha).

## Casos de uso

- Analisis de repositorios de código completos: con 1M tokens de contexto se puede cargar un monorepo entero en una sola sesión para auditorías, refactorizaciones asistidas o generación de documentación global.
- Procesamiento de documentos legales y financieros extensos: contratos, expedientes o informes anuales de cientos de páginas pueden analizarse de una vez sin fragmentación ni pérdida de contexto entre chunks.
- Chatbots de asistencia técnica con historial masivo: la ventana de 1M tokens permite mantener conversaciones y bases de conocimiento adjuntas completas, y la memoria de decodificación constante mantiene la latencia estable.
- Resumen y preguntas y respuestas sobre corpus de investigación: papers, anotaciones y resultados experimentales pueden combinarse en un único contexto para síntesis bibliográfica.
- Agentes de razonamiento multi-paso sobre estados largos: el mecanismo de barrido sobre cientos de bloques de memoria está diseñado para tareas agentivas que acumulan cientos de miles de tokens de trazas.
- Despliegue on-premise empresarial de contexto largo: el autor lo ofrece explícitamente para despliegues empresariales de 1M tokens, con ediciones cuantizadas (W4A16 a ~26 GB de VRAM) que caben en una sola RTX 4090.
- Transcripción y análisis de reuniones acumuladas: meses de transcripciones pueden indexarse en el contexto para consulta conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor referencia "benchmark receipts" en el directorio `reports/` de su repositorio de GitHub, pero no incluye tablas comparativas en la model card. Los únicos datos de rendimiento publicados son de inferencia: 45–183 tok/s mediante decodificación especulativa DFlash2 y una reducción del 96% o más en memoria de caché KV a 1M tokens.

## Requisitos de hardware

- VRAM estimada para esta edición BF16: ~72 GB solo de pesos, ~78 GB de VRAM total a 1.000.000 de tokens de contexto.
- GPUs recomendadas según la model card: H100 / H200 (80 GB o más), DGX Spark (128 GB), AMD Instinct MI300X, y configuraciones multi-GPU CUDA o ROCm.
- No cabe en GPUs de consumo en BF16; para hardware de consumo existen ediciones alternativas del mismo modelo: W4A16 (~26 GB totales, cabe en RTX 3090/4090 de 24 GB con poda PLE), FP8 (~42 GB, L40S/A100/2x RTX 4090) y NVFP4 (~27,5 GB, GPUs NVIDIA Blackwell como RTX 5090 de 32 GB).
- Despliegue mediante vLLM con el plugin `pb27_vllm` (instalable desde el repositorio de GitHub, con soporte de runners V1/V2 y registro automático vía `vllm.general_plugins`); el autor también documenta Ollama en el repositorio. No hay información sobre compatibilidad con llama.cpp o TGI.
- Throughput estimado: 45–183 tok/s según la model card; no se especifican condiciones de hardware ni longitudes de prompt para esas cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| PseudoBrain-Qwen3.8-Flash-Next-BF16 | ~131B totales (model card: 36B-A1.7B) | 1.048.576 | MoE hibrido GDN + SWA + Quest Memory | Apache-2.0 |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible (la variante PseudoBrain declara 1M) | Transformer/MoE (base del proyecto) | no disponible |
| Qwen3-Next-80B-A3B (referencia de categoria) | 80B totales / 3B activos | 256K (hasta 1M con YaRN) | MoE hibrido Gated DeltaNet + attention | Apache-2.0 |
| Llama 4 Scout (referencia de categoria) | 109B totales / 17B activos | 10M declarados | MoE con iRoPE | Licencia comunitaria Llama 4 |

Nota: los dos últimos modelos se incluyen como referencias de la categoría de MoE híbridos con contexto ultra-largo; no hay benchmarks comparativos directos publicados para PseudoBrain-Qwen3.8-Flash-Next, por lo que la comparación de rendimiento no disponible.

## Limitaciones y advertencias

- El proyecto es de un autor individual, con muy poca tracción comunitaria (720 descargas y 0 likes en el momento de la ficha) y sin verificación independiente de las cifras de rendimiento ni de la configuración de parámetros (la discrepancia entre 131B en safetensors y "36B-A1.7B" en la model card no está aclarada).
- No hay benchmarks estandarizados publicados (MMLU, HumanEval, GSM8K), por lo que la calidad de generación respecto al modelo base Qwen3.8-Flash-Next es desconocida; el ajuste podría haber degradado capacidades.
- El despliegue depende de un plugin de vLLM específico del autor (`pb27_vllm`), lo que introduce riesgo de mantenimiento, dependencia de versiones concretas de vLLM y falta de soporte en servidores de inferencia estándar.
- La recuperación de contexto largo se basa en aproximaciones (páginas Quest, landmarks, ventanas), no en atención completa: existe riesgo de que información situada fuera de los bloques recuperados no sea atendida, con posibles alucinaciones en tareas de agujas-en-un-pajar a 1M tokens.
- No hay información sobre idiomas soportados, sesgos conocidos ni evaluaciones de seguridad del ajuste.
- La licencia Apache-2.0 no impone restricciones de uso comercial, pero conviene verificar la licencia y los términos del modelo base Qwen3.8-Flash-Next.
- Requiere `--enforce-eager` y desactivar prefix caching según el quickstart del autor, lo que puede penalizar latencias en cargas con prefijos repetidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3.8-Flash-Next-BF16
- Repositorio GitHub y plugin pb27_vllm: https://github.com/defnotean/pseudobrain
- Paper de arquitectura (PDF): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf
- Paper de arquitectura (Markdown): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.md
- Reportes de benchmarks del autor: https://github.com/defnotean/pseudobrain/tree/main/reports
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Edición FP8: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3.8-Flash-Next-FP8
- Edición W4A16: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3.8-Flash-Next-W4A16
- Perfil del autor en GitHub: https://github.com/defnotean
