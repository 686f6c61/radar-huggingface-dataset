# defnoteatin/PseudoBrain-Gemma-4-26B-A4B-NVFP4

## Resumen

PseudoBrain-Gemma-4-26B-A4B-NVFP4 es una adaptación del modelo multimodal Gemma 4 26B-A4B de Google, publicada por Ian Kurt Galeon (defnoteatin) bajo el paraguas del proyecto PseudoBrain. El modelo parte del checkpoint oficial `google/gemma-4-26B-A4B-it` y aplica una arquitectura híbrida propietaria que combina atención de ventana deslizante, Gated DeltaNet en paralelo y un mecanismo de memoria exacta por páginas sobre NVMe, con el objetivo de sostener contextos de hasta 1.000.000 de tokens con un consumo de VRAM prácticamente constante.

La propuesta central es resolver el cuello de botella clásico del serving de transformers: aunque los pesos quepan en la GPU, la caché KV crece de forma lineal con la longitud del contexto y el prefill de forma cuadrática, lo que provoca OOM en cargas de trabajo de contexto largo. Según el autor, la adaptación reduce la caché KV de 1M de tokens en un 90,2% (de unos 22,5 GB a unos 2,2 GB), permitiendo ejecutar 1M de contexto en torno a 17,5 GB de VRAM total en una única GPU de 24 GB.

El checkpoint se distribuye en cuantización NVFP4 (W4A16) con pesos de aproximadamente 14,2 GB y requiere la librería vLLM junto con el plugin `pb27_vllm` del autor. Está pensado para GPUs NVIDIA Blackwell (RTX 5080/5090, DGX Spark GB10, B200), aunque el autor también publica ediciones FP8, BF16 y una variante NVFP4 para otras GPU. Es un modelo de nicho, orientado a despliegues on-premise de contexto muy largo y a investigación en sistemas de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con híbrido Windowed-Attention + Parallel Gated DeltaNet (PseudoBrain) |
| Parametros totales | 25.805.936.206 (25,8B) |
| Parametros activos | 3,8B (según el autor, "25.2B-A3.8B") |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | NVFP4 (W4A16) en este repo; el autor publica además FP8, BF16 y AWQ-4bit de terceros como base |
| Idiomas soportados | no disponible |
| Licencia | Gemma (términos de uso de Google) |
| Formato de pesos | safetensors (compressed-tensors, 8-bit según tags), librería vLLM |

## Arquitectura y entrenamiento

El modelo hereda la base de Gemma 4 26B-A4B, un transformer disperso (MoE) multimodal de 25,8B de parámetros totales y unos 3,8B activos. Sobre esa base, el autor aplica la arquitectura PseudoBrain en 30 capas: 25 capas con atención de ventana deslizante nativa y las 5 capas de atención global completa (índices 5, 11, 17, 23 y 29, con `head_dim=512`) convertidas a ventana deslizante de 16K más Gated DeltaNet en paralelo y memoria exacta Quest. El estado recurrente de Gated DeltaNet es de tamaño fijo O(1), independiente de si el contexto es de 4K o de 1M de tokens.

El mecanismo de memoria se organiza en tres niveles sobre NVMe y page cache: en las capas ancla, las consultas atienden sobre 4 sinks de StreamingLLM, landmarks de superbloques, las páginas top-k de memoria exacta Quest y una ventana deslizante de 16.384 tokens, con fusión LSE de FlashAttention-2 y cotas jerárquicas de superbloque en bf16 (`PB27_MEMORY_SUPERBLOCK=64`). Se aplica además un RoPE por bloques estrictamente no solapado (`_reposition_rope_blocks`) que impone una huella de 64 tokens por bloque recuperado y escalado proporcional de huecos históricos, y una agregación global densa que detecta consultas globales y activa landmarks residentes de resumen (un token por cada 4.096 tokens). La decodificación desacopla el presupuesto de recuperación del prefill del presupuesto constante de decode (`PB27_MEMORY_DECODE_STRIDE=64`, `PB27_MEMORY_DECODE_BLOCKS=64`).

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO específicas para esta adaptación; el autor describe la propuesta como una modificación de inferencia y arquitectura sobre el checkpoint instruct de Google, no como un reentrenamiento.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de la variante instruct de Gemma 4.
- Procesamiento multimodal de imagen y texto (`image-text-to-text`): acepta imágenes junto a instrucciones textuales.
- Razonamiento de contexto muy largo: hasta 1.048.576 tokens con memoria recurrente de tamaño constante.
- Recuperación exacta sobre memoria paginada en NVMe, con atención dispersa sobre bloques relevantes.
- Capacidad de barrido de razonamiento multi-paso sobre cientos de bloques distintos dentro de 1M de tokens (sweeps de working-set con rotación por novedad).
- Servido compatible con la API OpenAI a través de vLLM, con soporte de los runners V1 y V2.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente autónomo: no disponible en la información proporcionada.
- Idiomas soportados: no disponible en la información proporcionada.

## Casos de uso

- Análisis de repositorios completos: el modelo puede ingerir bases de código de cientos de miles de tokens en una sola pasada y responder preguntas transversales sobre arquitectura, dependencias o patrones, aprovechando la ventana de 1M sin trocear el contexto.
- Revisión de contratos y documentación legal extensa: permite cargar expedientes completos de cientos de páginas y hacer consultas cruzadas manteniendo la caché KV en unos 2,2 GB, lo que abarata el despliegue on-premise en una sola GPU de 24 GB.
- Transcripción y análisis de reuniones o clases de varias horas: al procesar audio transcrito de gran longitud, el modelo mantiene coherencia sobre el hilo completo sin truncamientos ni resúmenes intermedios.
- Asistencia sobre documentación técnica multimodal: al aceptar imagen y texto, puede responder preguntas sobre diagramas, capturas de pantalla o esquemas junto al texto de manuales extensos.
- Investigación en sistemas de inferencia: sirve como banco de pruebas para estudiar atención dispersa, Gated DeltaNet y memoria paginada sobre NVMe en cargas de contexto extremo, con el plugin `pb27_vllm` como referencia.
- Despliegue on-premise con requisitos de privacidad: al caber en una RTX 4090 o RTX 5090, permite montar un servicio de contexto largo sin depender de la nube ni de clústeres multi-GPU.
- Procesamiento de logs o trazas de sistema de gran volumen: la ventana de 1M permite correlacionar eventos distribuidos a lo largo de ventanas temporales amplias en una sola consulta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor enlaza un directorio de "benchmark receipts" en su repositorio de GitHub (`reports/`), pero los valores concretos no se incluyen en la información proporcionada.

Los únicos datos de rendimiento declarados por el autor son de memoria: reducción del 90,2% de la caché KV a 1M de tokens (de aproximadamente 22,5 GB a 2,2 GB) y un consumo total de VRAM de aproximadamente 17,5 GB a 1M de tokens para la edición NVFP4.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14,2 GB de pesos en NVFP4 y unos 17,5 GB totales a 1M de tokens según el autor.
- GPU recomendadas para esta edición NVFP4: NVIDIA Blackwell, es decir, RTX 5080, RTX 5090, DGX Spark GB10 y B200.
- Cabe en GPU de consumo: sí, en RTX 4090 o RTX 3090 (24 GB) según la tabla del autor para la edición NVFP4, así como en RTX 4080 de 16 GB y AMD RX 7900 XTX de 24 GB.
- Ediciones alternativas del mismo autor: FP8 con unos 26,5 GB de pesos y unos 30 GB totales (RTX 5090, L40S, A100, H100, DGX Spark, MI300X); BF16 con unos 51 GB de pesos y unos 54,5 GB totales (A100/H100 de 80 GB, DGX Spark de 128 GB, MI300X).
- Opciones de despliegue: vLLM con el plugin `pb27_vllm` (instalable con `pip install --no-deps "git+https://github.com/defnotean/pseudobrain.git#subdirectory=serving/pb27_vllm"`), con soporte de los runners V1 y V2 y fallback `ForwardContext` sin hooks. No se mencionan llama.cpp, Ollama ni TGI.
- Configuración de servido sugerida por el autor: `VLLM_ALLOW_LONG_MAX_MODEL_LEN=1`, `--max-model-len 1048576`, `--enforce-eager`, `--no-enable-prefix-caching`, `--kv-cache-memory-bytes 6G`, `--max-num-seqs 16`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | VRAM a 1M tokens | Licencia |
|---|---|---|---|---|---|
| PseudoBrain-Gemma-4-26B-A4B-NVFP4 | 25,8B totales / 3,8B activos | 1.048.576 | NVFP4 (W4A16) | ~17,5 GB | Gemma |
| PseudoBrain-Gemma-4-26B-A4B-FP8 | 25,8B totales / 3,8B activos | 1.048.576 | FP8 | ~30,0 GB | Gemma |
| PseudoBrain-Gemma-4-26B-A4B-BF16 | 25,8B totales / 3,8B activos | 1.048.576 | BF16 | ~54,5 GB | Gemma |
| google/gemma-4-26B-A4B-it (base) | 25,8B totales / 3,8B activos | no disponible | BF16 y cuantizaciones de terceros | no aplica (sin PseudoBrain) | Gemma |

La comparación con modelos de otras familias (por ejemplo, alternativas MoE de contexto largo de otros proveedores) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho con muy poca tracción: 31 descargas y 0 likes en el momento de la consulta, lo que implica escasa validación por parte de la comunidad.
- Dependencia de un plugin propietario de vLLM (`pb27_vllm`) mantenido por un único autor; la compatibilidad con versiones futuras de vLLM no está garantizada más allá del soporte declarado para los runners V1 y V2.
- La arquitectura modifica el comportamiento de atención del modelo base (conversión de capas globales a ventana deslizante más Gated DeltaNet), lo que puede degradar la fidelidad en tareas que dependan de atención global exacta frente al checkpoint original de Google.
- El uso de memoria paginada en NVMe introduce dependencia del almacenamiento local y puede añadir latencia variable según la caché de páginas del sistema.
- No se han publicado benchmarks independientes ni evaluaciones de calidad; las afirmaciones de rendimiento proceden del propio autor.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; no se documentan mitigaciones específicas en la información disponible.
- Sesgos conocidos: no disponibles en la información proporcionada; se heredan los del checkpoint base de Gemma, no documentados aquí.
- Idiomas soportados: no disponibles; la model card no detalla cobertura lingüística.
- Licencia Gemma: el uso comercial está sujeto a los términos de uso de Google para la familia Gemma, que incluyen restricciones de uso aceptable y obligaciones de atribución; conviene revisarlos antes de un despliegue en producción.
- El autor comercializa servicios de despliegue on-premise y busca colaboraciones, lo que conviene tener en cuenta al evaluar la independencia de las métricas publicadas.

## Enlaces

- Hugging Face: https://huggingface.co/defnoteatin/PseudoBrain-Gemma-4-26B-A4B-NVFP4
- Repositorio GitHub del proyecto: https://github.com/defnotean/pseudobrain
- Paper de arquitectura (PDF): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf
- Paper de arquitectura (Markdown): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.md
- Benchmark receipts: https://github.com/defnotean/pseudobrain/tree/main/reports
- Perfil del autor en GitHub: https://github.com/defnotean
- Perfil del autor en Hugging Face: https://huggingface.co/defnoteatin
- Edición FP8: https://huggingface.co/defnoteatin/PseudoBrain-Gemma-4-26B-A4B-FP8
- Edición BF16: https://huggingface.co/defnoteatin/PseudoBrain-Gemma-4-26B-A4B-BF16
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Base cuantizada FP8: https://huggingface.co/RedHatAI/gemma-4-26B-A4B-it-FP8-dynamic
- Base cuantizada NVFP4: https://huggingface.co/RedHatAI/gemma-4-26B-A4B-it-NVFP4
- Base cuantizada AWQ 4-bit: https://huggingface.co/cyankiwi/gemma-4-26B-A4B-it-AWQ-4bit
