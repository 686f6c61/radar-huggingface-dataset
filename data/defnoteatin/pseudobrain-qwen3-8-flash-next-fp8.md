# defnoteatin/PseudoBrain-Qwen3.8-Flash-Next-FP8

## Resumen

PseudoBrain-Qwen3.8-Flash-Next-FP8 es una edición cuantizada en FP8 del modelo Qwen/Qwen3.8-Flash-Next, publicada por el desarrollador independiente Ian Kurt Galeon (defnoteatin) bajo licencia Apache 2.0. El modelo aplica la arquitectura propietaria "PseudoBrain", que sustituye parte de las capas de atención completa por una combinación híbrida de ventana deslizante, Gated DeltaNet en paralelo y un sistema de memoria exacta por bloques ("Quest Exact Memory") apoyado en NVMe y page-cache. El objetivo declarado es resolver el coste lineal del KV cache y el coste cuadrático del prefill en contextos largos, permitiendo ventanas de hasta 1.048.576 tokens con un consumo de memoria aproximadamente constante.

El modelo base es un MoE de 131.095.277.587 parámetros totales (según los pesos en safetensors), con una configuración descrita en la model card como "36B-A1.7B", es decir, 36.000 millones de parámetros totales y 1.700 millones activos por token. La edición FP8 ocupa aproximadamente 36,5 GB en pesos y está pensada para GPUs de 48-80 GB (L40S, A100, H100) o configuraciones multi-GPU en consumer.

La relevancia actual del modelo es doble: por un lado, explora técnicas de atención híbrida y decodificación especulativa (DFlash2) aplicadas a contextos de un millón de tokens; por otro, es un ejemplo de plugin de inferencia para vLLM que se registra automáticamente mediante `vllm.general_plugins`. Conviene señalar que el modelo tiene un volumen de descargas muy bajo (28 en el momento de la ficha) y no cuenta con validación independiente de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE con 48 capas: 36 capas Gated DeltaNet nativas + 12 capas de atención completa convertidas a SWA de 16K + Gated DeltaNet paralelo + Quest Exact Memory |
| Parámetros totales | 131.095.277.587 (según safetensors); la model card indica "36B-A1.7B" |
| Parámetros activos | 1.700 millones (según la model card, no verificado) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantización | FP8 (esta edición); el ecosistema incluye W4A16, NVFP4 y BF16 en repositorios separados |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (FP8), librería vLLM |

## Arquitectura y entrenamiento

La arquitectura PseudoBrain parte de un transformer MoE de 48 capas en el que solo 12 capas conservan atención completa, y estas se reconvierten en una mezcla de ventana deslizante de 16.384 tokens, Gated DeltaNet en paralelo y memoria exacta Quest. Las 36 capas restantes son Gated DeltaNet nativas, lo que da al estado recurrente un tamaño fijo O(1) independiente de la longitud de contexto. Sobre las capas dispersas, las consultas atienden a una combinación de 4 sinks de StreamingLLM, landmarks de super-bloques, las páginas top-k de la memoria exacta Quest y la ventana deslizante de 16.384 tokens, fusionadas con FlashAttention-2 mediante LSE-merge.

El sistema de memoria se organiza en tres niveles sobre NVMe y page-cache, con cotas jerárquicas de super-bloques en bf16 (`PB27_MEMORY_SUPERBLOCK=64`). El RoPE se aplica por bloques de forma estrictamente no solapada y proporcional (`_reposition_rope_blocks`), con un footprint obligatorio de 64 tokens por bloque recuperado. La agregación global densa (`PB27_MEMORY_GLOBAL_AGG="auto"`) activa landmarks residentes en HBM (un token de resumen por cada 4.096 tokens), cobertura estratificada de la línea temporal y barridos de working-set rotativos por novedad. La decodificación usa DFlash2 como decodificación especulativa, con presupuestos de recuperación separados para prefill y decode (`PB27_MEMORY_DECODE_STRIDE=64`, `PB27_MEMORY_DECODE_BLOCKS=64`).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. El modelo es una cuantización/adaptación del base Qwen3.8-Flash-Next, por lo que hereda su entrenamiento original, pero la model card no documenta ese proceso.

## Capacidades

- Generación de texto y conversación multi-turno con ventanas de hasta 1.048.576 tokens.
- Razonamiento de múltiples pasos sobre contextos largos, con barridos de working-set que recorren cientos de bloques distintos.
- Memoria de decodificación aproximadamente constante: la ventana activa se mantiene en torno a 486 MiB independientemente de la longitud del contexto.
- Decodificación especulativa DFlash2, con velocidades declaradas de 45 a 183 tokens por segundo.
- Compatibilidad con el runner V1 y V2 de vLLM, con fallback a `ForwardContext` sin hooks.
- Servidor compatible con la API de OpenAI mediante `vllm serve`.
- Soporte declarado en NVIDIA CUDA y AMD ROCm.
- Capacidades de tool calling, function calling, agentes, visión o audio: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles.

## Casos de uso

- Análisis de repositorios completos: el modelo puede ingerir hasta un millón de tokens de código y documentación en una sola pasada, lo que permite responder preguntas sobre dependencias cruzadas entre módulos sin chunking ni recuperación externa.
- Revisión de contratos y documentación legal extensa: con contexto de 1M tokens se pueden cargar expedientes completos y hacer preguntas que requieran correlacionar cláusulas de documentos distintos, manteniendo el KV cache acotado gracias a la ventana activa de ~486 MiB.
- Monitorización de logs y trazas de producción: la ventana deslizante de 16.384 tokens combinada con la memoria exacta Quest permite mantener continuidad sobre flujos de eventos largos y detectar patrones que aparecen separados por cientos de miles de tokens.
- Asistentes de investigación sobre corpus científicos: la agregación global densa con landmarks de super-bloques facilita tareas de síntesis sobre bibliografía extensa, donde las referencias relevantes están dispersas a lo largo del contexto.
- Despliegue on-premise con contexto largo en una sola GPU: la edición FP8 cabe en una L40S o A100 de 48-80 GB con ~42 GB de VRAM total a 1M tokens, lo que permite ofrecer un servicio de contexto largo sin clúster multi-nodo.
- Evaluación de técnicas de inferencia: al ser un plugin de vLLM con soporte V1/V2 y fallback sin hooks, sirve como banco de pruebas para medir el impacto de memoria exacta, RoPE por bloques y decodificación especulativa en cargas de contexto largo.
- Procesamiento de conversaciones de atención al cliente de larga duración: el estado recurrente O(1) de Gated DeltaNet evita que el coste de memoria crezca con la longitud de la conversación, lo que abarata sesiones multi-turno muy extensas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona "Benchmark Receipts" en el directorio `reports/` del repositorio de GitHub, pero no se incluyen cifras de MMLU, HumanEval, GSM8K ni de otras evaluaciones estándar en la información proporcionada. El único dato de rendimiento declarado es el rango de velocidad de decodificación de 45 a 183 tokens por segundo, sin especificar hardware ni longitud de contexto.

## Requisitos de hardware

- Pesos FP8: aproximadamente 36,5 GB.
- VRAM total estimada a 1.000.000 tokens: aproximadamente 42,0 GB.
- GPUs objetivo según la model card: L40S, A100, H100, 2x RTX 4090, DGX Spark (128 GB) y AMD Instinct MI300X.
- En consumer GPU: no cabe en una RTX 4090 de 24 GB en FP8; requiere dos RTX 4090 o una RTX 5090 de 32 GB con la edición NVFP4 (~27,5 GB a 1M tokens). La edición W4A16 (~26 GB a 1M tokens) está pensada para RTX 3090/4090 de 24 GB con 18 shards PLE-pruned.
- Opciones de despliegue: vLLM con el plugin `pb27_vllm` instalado desde el repositorio de GitHub; el arranque recomendado usa `--max-model-len 1048576 --enforce-eager --no-enable-prefix-caching` y la variable `VLLM_ALLOW_LONG_MAX_MODEL_LEN=1`.
- Throughput declarado: 45-183 tokens/s en decodificación (sin especificar hardware).
- No se documentan requisitos de CPU, RAM del sistema ni ancho de banda de NVMe, a pesar de que el sistema de memoria de tres niveles depende de almacenamiento NVMe.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| PseudoBrain-Qwen3.8-Flash-Next-FP8 | 131.095.277.587 totales (1,7B activos según model card) | 1.048.576 | Apache 2.0 | Hugging Face, requiere plugin vLLM |
| Qwen/Qwen3.8-Flash-Next (base) | No disponible en la información | No disponible | No disponible en la información | Hugging Face |
| Qwen3.8-Flash-Next-FP8 (base cuantizado) | No disponible en la información | No disponible | No disponible en la información | Hugging Face |
| cyankiwi/Qwen3.8-Flash-Next-AWQ-INT4 | No disponible en la información | No disponible | No disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes. Las alternativas de la misma categoría (contexto muy largo con MoE) no están identificadas en la información proporcionada.

## Limitaciones y advertencias

- El modelo tiene un volumen de descargas muy bajo (28) y ningún "like", lo que indica ausencia de validación por parte de la comunidad.
- No hay benchmarks publicados en la información disponible; las afirmaciones de rendimiento y de reducción de memoria provienen únicamente del autor.
- Existe una discrepancia no resuelta entre los 131.095.277.587 parámetros de los safetensors y la designación "36B-A1.7B" de la model card; conviene verificar la configuración real antes de dimensionar hardware.
- El sistema de memoria depende de NVMe y page-cache; el rendimiento real puede degradarse si el almacenamiento es lento, y no se documentan requisitos de I/O.
- El arranque recomendado desactiva el prefix caching (`--no-enable-prefix-caching`) y fuerza modo eager (`--enforce-eager`), lo que puede reducir el throughput en comparación con configuraciones optimizadas.
- La arquitectura modifica el comportamiento de RoPE y de la atención; los resultados pueden divergir de los del modelo base Qwen3.8-Flash-Next en tareas que no sean de contexto largo.
- No se documentan sesgos conocidos, idiomas soportados ni tasas de alucinación.
- La licencia Apache 2.0 permite uso comercial, pero el plugin de inferencia se distribuye desde un repositorio de GitHub independiente cuya licencia no se detalla en la información proporcionada.
- El modelo requiere instalar código de terceros (`pip install --no-deps` desde GitHub) en el entorno de vLLM, lo que implica un riesgo de cadena de suministro a evaluar en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3.8-Flash-Next-FP8
- Repositorio del motor y plugin: https://github.com/defnotean/pseudobrain
- Paper de arquitectura (PDF): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf
- Paper de arquitectura (Markdown): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.md
- Benchmark receipts: https://github.com/defnotean/pseudobrain/tree/main/reports
- Perfil del autor en GitHub: https://github.com/defnotean
- Perfil del autor en Hugging Face: https://huggingface.co/defnoteatin
- Edición W4A16: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3.8-Flash-Next-W4A16
- Edición BF16: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3.8-Flash-Next-BF16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Modelo base en FP8: https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- Variante AWQ INT4: https://huggingface.co/cyankiwi/Qwen3.8-Flash-Next-AWQ-INT4
- Variante abliterated NVFP4: https://huggingface.co/edp1096/Huihui-Qwen3.8-Flash-Next-abliterated-NVFP4-QAD
