# defnoteatin/PseudoBrain-Gemma-4-26B-A4B-FP8

## Resumen

PseudoBrain-Gemma-4-26B-A4B-FP8 es una modificación arquitectónica del modelo Gemma 4 26B-A4B de Google, publicada por Ian Kurt Galeon (usuario `defnoteatin` en HuggingFace). El modelo parte del checkpoint oficial `google/gemma-4-26B-A4B-it` y de su cuantización FP8 dinámica de Red Hat AI, e introduce la denominada arquitectura PseudoBrain, cuyo objetivo es reducir el coste de memoria del KV cache en contextos extremadamente largos. Frente al crecimiento lineal del KV cache en transformers estándar, esta variante sustituye las cinco capas de atención global completa por ventanas deslizantes de 16K tokens combinadas con un mecanismo recurrente Gated DeltaNet de estado fijo y una memoria exacta jerárquica sobre NVMe y page cache.

El modelo es un MoE multimodal (image-text-to-text) de 26.544.133.710 parámetros totales, con aproximadamente 3,8B parámetros activos por token según la nomenclatura A4B del autor, y ventana de contexto declarada de 1.048.576 tokens. Su propuesta central es ejecutar un contexto de un millón de tokens con un consumo total de VRAM de aproximadamente 30 GB en FP8, o de unos 17,5 GB en las variantes W4A16 y NVFP4, lo que lo sitúa al alcance de GPUs de consumo alto y de aceleradores de centro de datos de gama media.

La relevancia actual del modelo reside en su enfoque de ingeniería de inferencia más que en una mejora de capacidades cognitivas: no se ha reentrenado el modelo base, sino que se ha modificado el mecanismo de atención y se ha empaquetado como plugin para vLLM. Esto implica que las capacidades lingüísticas y multimodales heredan las del Gemma 4 base, mientras que el beneficio se concentra en el rendimiento y la viabilidad de despliegues de contexto largo en hardware limitado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE con ventana deslizante, Gated DeltaNet paralelo y memoria exacta Quest; 30 capas |
| Parámetros totales | 26.544.133.710 |
| Parámetros activos | Aproximadamente 3,8B (nomenclatura A4B del autor) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantización | FP8 (este repositorio); W4A16, NVFP4 y BF16 en repositorios hermanos |
| Idiomas soportados | No disponible |
| Licencia | Gemma (términos de licencia de Google) |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo conserva la estructura MoE del Gemma 4 26B-A4B original, con 30 capas, y aplica sobre ella la modificación PseudoBrain. Las 25 capas que ya usaban atención de ventana deslizante nativa se mantienen, mientras que las cinco capas de atención global completa (índices 5, 11, 17, 23 y 29, con `head_dim=512`) se convierten en ventanas deslizantes de 16K tokens combinadas con un Gated DeltaNet paralelo y memoria exacta Quest. El estado recurrente de Gated DeltaNet es de tamaño fijo, independiente de la longitud de contexto, lo que elimina el crecimiento lineal del KV cache en esas capas.

Sobre las capas de anclaje dispersas, las consultas atienden sobre cuatro sinks de StreamingLLM, landmarks de superbloques, las páginas top-k de la memoria exacta Quest y una ventana deslizante de 16.384 tokens, fusionadas mediante FlashAttention-2 con combinación de LSE. La memoria se organiza en tres niveles sobre NVMe y page cache, con cotas jerárquicas de superbloques en bf16 y un tamaño de superbloque de 64. El posicionamiento RoPE se aplica por bloques proporcionales y estrictamente no solapados, con una huella obligatoria de 64 tokens por bloque recuperado y escalado proporcional de los huecos históricos, con el objetivo de preservar la continuidad local y evitar el solapamiento de fase entre bloques no adyacentes a un millón de tokens. La agregación global densa detecta consultas de alta participación y activa landmarks residentes de resumen de superbloque (un token de resumen por cada 4.096 tokens en HBM), cobertura estratificada de la línea temporal y barridos de conjunto de trabajo con rotación por novedad.

No se dispone de información sobre el entrenamiento: no se indica número de tokens, composición del dataset ni si hubo RLHF o DPO. El modelo es una modificación de inferencia sobre pesos preexistentes, no un modelo reentrenado. El autor declara una reducción del 90,2% en la memoria del KV cache a un millón de tokens (de aproximadamente 22,5 GB a 2,2 GB) y un decodificado de velocidad constante mediante la separación del presupuesto de recuperación en prefill y el presupuesto constante en decodificado (`PB27_MEMORY_DECODE_STRIDE=64`, `PB27_MEMORY_DECODE_BLOCKS=64`).

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno, heredados del Gemma 4 26B-A4B-it.
- Procesamiento multimodal image-text-to-text: acepta imágenes junto con texto en la entrada.
- Contexto largo de hasta 1.048.576 tokens con memoria de decodificado de tamaño constante.
- Soporte de decodificado multi-paso sobre cientos de bloques distintos dentro de un contexto de un millón de tokens, mediante barridos de conjunto de trabajo con rotación por novedad.
- Compatibilidad con el servidor OpenAI-compatible de vLLM, lo que habilita tool calling y function calling en la medida en que el modelo base los soporte (no detallado en la información disponible).
- Soporte de los runners V1 y V2 de vLLM, con fallback mediante `ForwardContext` sin hooks.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Análisis de repositorios completos: con un millón de tokens de contexto, el modelo puede ingerir árboles de código extensos, historiales de commits y documentación en una sola pasada, y responder preguntas de arquitectura o detectar inconsistencias entre módulos sin necesidad de recuperación externa.
- Procesamiento de expedientes legales o contractuales: contratos de cientos de páginas, anexos y correspondencia pueden cargarse íntegros en contexto para extracción de cláusulas, comparación entre versiones y detección de contradicciones, aprovechando la memoria de decodificado constante para mantener la latencia estable.
- Auditoría de logs y trazas de sistemas distribuidos: la ventana de 1M tokens permite correlacionar eventos de múltiples servicios y ventanas temporales largas en una única consulta, algo inviable con modelos de 128K sin troceado agresivo.
- Asistentes sobre bases documentales internas: sustituye parte de la infraestructura RAG en escenarios donde el corpus cabe en contexto, reduciendo la complejidad del pipeline y los errores de recuperación, con despliegue en una sola GPU de 24 GB en las variantes W4A16 o NVFP4.
- Investigación académica sobre atención de largo alcance: el modelo y su plugin sirven como banco de pruebas reproducible para comparar Gated DeltaNet, ventanas deslizantes y memoria Quest frente a atención completa en tareas de recuperación en contexto largo.
- Transcripción y comprensión de reuniones o clases extensas: al aceptar entrada de imagen y texto, puede procesar capturas de pizarras o diapositivas junto con transcripciones de varias horas dentro de la misma ventana de contexto.
- Despliegue on-premise con requisitos de privacidad: al ejecutarse en una sola GPU de consumo o de centro de datos de gama media, permite mantener datos sensibles en infraestructura propia sin recurrir a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor referencia un directorio `reports/` en el repositorio de GitHub como fuente de "benchmark receipts", pero no se incluyen cifras de MMLU, HumanEval, GSM8K ni de evaluaciones de recuperación en contexto largo en los datos proporcionados. Las únicas métricas declaradas son de eficiencia de memoria: reducción del 90,2% del KV cache a 1M tokens (de aproximadamente 22,5 GB a 2,2 GB) y consumo total de VRAM de aproximadamente 30 GB en FP8 a un millón de tokens.

## Requisitos de hardware

- VRAM estimada a 1.000.000 tokens: aproximadamente 30,0 GB en FP8 (pesos de aproximadamente 26,5 GB más KV cache); aproximadamente 17,5 GB en W4A16 y NVFP4 (pesos de aproximadamente 14,2 GB); aproximadamente 54,5 GB en BF16 (pesos de aproximadamente 51,0 GB).
- GPUs objetivo para FP8: RTX 5090 (32 GB), L40S, A100, H100, DGX Spark y AMD MI300X.
- GPUs objetivo para W4A16 y NVFP4: RTX 3090 y 4090 (24 GB), RTX 4080 (16 GB), AMD RX 7900 XTX (24 GB); NVFP4 requiere hardware Blackwell (RTX 5080 y 5090, DGX Spark GB10, B200).
- GPUs objetivo para BF16: A100 y H100 de 80 GB, DGX Spark de 128 GB, AMD MI300X.
- Cabe en GPU de consumo: sí, en las variantes W4A16 y NVFP4 sobre GPUs de 16 a 24 GB; la variante FP8 requiere al menos 32 GB para el contexto completo.
- Despliegue: vLLM con el plugin `pb27_vllm`, instalable mediante `pip install --no-deps "git+https://github.com/defnotean/pseudobrain.git#subdirectory=serving/pb27_vllm"`. El repositorio incluye además el plugin empaquetado en `pb27_vllm_plugin/`. No se mencionan integraciones con llama.cpp, Ollama ni TGI.
- Configuración de servidor recomendada por el autor: `VLLM_ALLOW_LONG_MAX_MODEL_LEN=1`, `--max-model-len 1048576`, `--enforce-eager`, `--no-enable-prefix-caching`, `--kv-cache-memory-bytes 6G`, `--max-num-seqs 16`.
- Latencia y throughput: no disponibles. El autor afirma decodificado de velocidad constante independiente de la longitud de contexto, pero no se aportan cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización evaluada | VRAM a contexto máximo | Licencia |
|---|---|---|---|---|---|
| PseudoBrain-Gemma-4-26B-A4B-FP8 | 26,5B totales, ~3,8B activos | 1.048.576 | FP8 | ~30,0 GB | Gemma |
| PseudoBrain-Gemma-4-26B-A4B (W4A16) | 26,5B totales, ~3,8B activos | 1.048.576 | W4A16 | ~17,5 GB | Gemma |
| PseudoBrain-Gemma-4-26B-A4B-NVFP4 | 26,5B totales, ~3,8B activos | 1.048.576 | NVFP4 | ~17,5 GB | Gemma |
| PseudoBrain-Gemma-4-26B-A4B-BF16 | 26,5B totales, ~3,8B activos | 1.048.576 | BF16 | ~54,5 GB | Gemma |
| Gemma 4 26B-A4B-it (base) | 26,5B totales, ~3,8B activos | No disponible | FP8 dinámica, AWQ 4-bit, NVFP4 | No disponible | Gemma |

La comparación más directa es con el modelo base `google/gemma-4-26B-A4B-it`, del que esta variante hereda pesos y capacidades. La diferencia medible está en el coste de memoria a contexto largo: el autor cifra en 22,5 GB el KV cache del base a un millón de tokens frente a 2,2 GB con PseudoBrain. No se dispone de datos de rendimiento en tareas que permitan comparar calidad entre ambas variantes, ni de comparaciones con otros modelos de contexto largo de la misma categoría.

## Limitaciones y advertencias

- El modelo no ha sido reentrenado: la modificación arquitectónica altera el mecanismo de atención de cinco capas, lo que puede degradar la calidad en tareas que dependían de atención global completa, especialmente en razonamiento que requiere integración exacta de información distante. No se han publicado evaluaciones que cuantifiquen esta posible degradación.
- La licencia Gemma impone restricciones de uso comercial y obligaciones de atribución y de política de uso aceptable de Google; es necesario revisar los términos antes de un despliegue en producción.
- El modelo requiere el plugin propietario `pb27_vllm` y configuraciones específicas de vLLM; no es desplegable con llama.cpp, Ollama ni TGI según la información disponible, lo que limita las opciones de infraestructura.
- La decodificación se ejecuta con `--enforce-eager` y sin prefix caching según la configuración recomendada, lo que puede reducir el throughput en cargas con prompts repetidos.
- La memoria exacta Quest depende de NVMe y page cache, por lo que el rendimiento real puede variar según la velocidad del almacenamiento del sistema anfitrión.
- Riesgo de alucinación: no evaluado en la información disponible; al ser una modificación de inferencia sobre Gemma 4, hereda el comportamiento del base, sin datos publicados que lo cuantifiquen.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; no se detalla la cobertura multilingüe del modelo base en esta ficha.
- El repositorio tiene 28 descargas y 0 likes en el momento de la consulta, y procede de un autor individual sin proceso de revisión por pares documentado; conviene validar el comportamiento en el caso de uso concreto antes de adoptarlo.
- El tamaño del repositorio es de 29,0 GB, coherente con pesos FP8, lo que exige espacio de almacenamiento y ancho de banda considerables durante la carga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/defnoteatin/PseudoBrain-Gemma-4-26B-A4B-FP8
- Repositorio GitHub del proyecto: https://github.com/defnotean/pseudobrain
- Plugin vLLM: https://github.com/defnotean/pseudobrain/tree/main/serving/pb27_vllm
- Paper de arquitectura (PDF): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf
- Paper de arquitectura (Markdown): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.md
- Informes de benchmarks: https://github.com/defnotean/pseudobrain/tree/main/reports
- Perfil del autor en GitHub: https://github.com/defnotean
- Perfil del autor en HuggingFace: https://huggingface.co/defnoteatin
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Cuantización FP8 de referencia: https://huggingface.co/RedHatAI/gemma-4-26B-A4B-it-FP8-dynamic
- Variante AWQ 4-bit: https://huggingface.co/cyankiwi/gemma-4-26B-A4B-it-AWQ-4bit
- Variante NVFP4 de referencia: https://huggingface.co/RedHatAI/gemma-4-26B-A4B-it-NVFP4
- Variante NVFP4 PseudoBrain: https://huggingface.co/defnoteatin/PseudoBrain-Gemma-4-26B-A4B-NVFP4
- Variante BF16 PseudoBrain: https://huggingface.co/defnoteatin/PseudoBrain-Gemma-4-26B-A4B-BF16
