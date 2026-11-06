# defnoteatin/PseudoBrain-Gemma-4-26B-A4B-W4A16

## Resumen

PseudoBrain-Gemma-4-26B-A4B-W4A16 es una compilación cuantizada en W4A16 del modelo multimodal Gemma-4-26B-A4B-it de Google, publicada por el desarrollador independiente Ian Kurt Galeon (defnoteatin). El modelo base es un transformer disperso (MoE) con aproximadamente 25.950 millones de parámetros totales y unos 3.800 millones activos por token, capaz de procesar entradas de imagen y texto. Esta versión concreta deriva de la cuantización FP8 dinámica de Red Hat AI y aplica cuantización de pesos a 4 bits con activaciones en 16 bits, reduciendo el peso del modelo a unos 14,2 GB.

La aportación principal no es la cuantización en sí, sino la integración de la arquitectura propietaria PseudoBrain, que sustituye parte de las capas de atención global por atención de ventana deslizante combinada con Gated DeltaNet paralelo y un mecanismo de memoria exacta por páginas denominado Quest. El objetivo declarado es habilitar contextos de hasta 1.048.576 tokens con un consumo de VRAM prácticamente constante, cifrado en unos 17,5 GB totales en el punto de contexto máximo, lo que permitiría ejecutar la ventana completa en una única GPU de 24 GB.

Es relevante ahora porque ataca el cuello de botella clásico del serving de contexto largo: la caché KV crece de forma lineal con la longitud y el prefill de forma cuadrática, lo que provoca OOM incluso cuando los pesos caben holgadamente en memoria. El autor publica además un plugin para vLLM (`pb27_vllm`) que implementa el mecanismo, con soporte para los runners V1 y V2 del motor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido con atención de ventana deslizante, Gated DeltaNet paralelo y memoria exacta Quest (PseudoBrain) |
| Parámetros totales | 25.950.689.646 (≈25,95 mil millones) |
| Parámetros activos | ≈3,8 mil millones (A4B) |
| Longitud de contexto | Hasta 1.048.576 tokens (1M) con el plugin PseudoBrain; el modelo base soporta contexto largo nativo |
| Tipos de cuantización | W4A16 (esta versión); el ecosistema incluye FP8, NVFP4 y BF16 |
| Idiomas soportados | No disponible |
| Licencia | Gemma (términos de uso de Google) |
| Formato de pesos | Safetensors con compressed-tensors, para vLLM |

## Arquitectura y entrenamiento

El modelo base es un MoE multimodal de 30 capas con 25 capas de atención de ventana deslizante nativa y 5 capas de atención global completa (índices 5, 11, 17, 23 y 29, con `head_dim=512`). PseudoBrain convierte esas cinco capas globales en atención de ventana de 16.384 tokens combinada con Gated DeltaNet paralelo, cuyo estado recurrente tiene tamaño fijo O(1) independientemente de la longitud de contexto. Sobre las capas dispersas se añade un mecanismo de memoria exacta en tres niveles que atiende sobre cuatro sinks de StreamingLLM, landmarks de superbloques, las k páginas más relevantes recuperadas y la ventana deslizante, fusionando resultados mediante FlashAttention-2 con merge por LSE.

El sistema incorpora además un esquema de RoPE por bloques proporcional y estrictamente no solapado, que asigna a cada bloque recuperado una huella fija de 64 tokens y escala las distancias históricas de forma proporcional para preservar la fidelidad temporal en contextos de 1M de tokens sin recurrir a YaRN estático. La agregación global densa detecta consultas de alta participación y activa resúmenes residentes de superbloque (un token por cada 4.096 tokens), cobertura estratificada de la línea temporal y barridos de conjunto de trabajo con rotación por novedad. El presupuesto de recuperación en prefill se desacopla del presupuesto constante en decodificación (`PB27_MEMORY_DECODE_STRIDE=64`, `PB27_MEMORY_DECODE_BLOCKS=64`), lo que según el autor reduce la caché KV a 1M de tokens en un 90,2 % (de unos 22,5 GB a unos 2,2 GB).

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO en el modelo base. La model card no documenta el proceso de entrenamiento original de Gemma-4-26B-A4B-it.

## Capacidades

- Generación de texto conversacional con instrucciones (variante `-it`).
- Procesamiento multimodal de imagen y texto (`image-text-to-text`).
- Razonamiento multi-paso sobre contextos extremadamente largos, hasta 1M de tokens.
- Recuperación de información en documentos masivos mediante memoria exacta por páginas y landmarks de superbloque.
- Capacidad de ejecutar barridos de razonamiento sobre cientos de bloques distintos dentro de una ventana de 1M de tokens.
- Soporte de tool calling y function calling heredado del modelo base (no detallado en la model card de esta compilación).
- Capacidades multilingües heredadas de Gemma, aunque la lista concreta de idiomas no está disponible.
- Decodificación con memoria constante: el coste por token generado no crece con la longitud de contexto.

## Casos de uso

- Análisis de repositorios de código completos: con 1M de tokens de contexto se puede cargar un monorepo entero y realizar preguntas transversales sobre dependencias, sin trocear el código en fragmentos que pierdan referencias cruzadas.
- Revisión de contratos y expedientes legales extensos: el modelo puede mantener en contexto miles de páginas de documentación y responder consultas que requieran correlacionar cláusulas separadas por cientos de páginas, gracias a la memoria exacta por páginas.
- Atención al cliente con historial prolongado: conversaciones multi-turno de semanas de duración caben en la ventana sin resumen intermedio, manteniendo coherencia sobre preferencias y decisiones previas del usuario.
- Procesamiento de documentación técnica multimodal: al aceptar imagen y texto, puede analizar diagramas de arquitectura junto con su especificación textual en una sola pasada.
- Investigación sobre corpus científicos: carga de decenas de artículos y extracción de relaciones entre resultados, con la ventana de 1M tokens evitando la pérdida de contexto que introduce el chunking con RAG clásico.
- Despliegue on-premise en estaciones de trabajo con una sola GPU de 24 GB: el consumo de 17,5 GB a contexto máximo permite ofrecer un servicio de contexto largo en hardware de gama alta de consumo, sin clúster multi-GPU.
- Agentes autónomos con memoria de trabajo extensa: el estado recurrente O(1) de Gated DeltaNet mantiene el coste de decodificación estable durante ejecuciones largas de un agente que acumula observaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona un directorio `reports/` con "benchmark receipts" en el repositorio de GitHub del autor, pero no se incluyen cifras concretas de MMLU, HumanEval, GSM8K ni de evaluaciones de contexto largo en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: unos 14,2 GB de pesos y unos 17,5 GB totales a 1.048.576 tokens de contexto según el autor.
- GPU objetivo de esta edición: RTX 3090, RTX 4090, AMD RX 7900 XTX (24 GB) y RTX 4080 (16 GB).
- Ediciones alternativas: FP8 (unos 30 GB totales, para RTX 5090, L40S, A100, H100, MI300X), NVFP4 (unos 17,5 GB, para Blackwell: RTX 5080/5090, DGX Spark GB10, B200) y BF16 (unos 54,5 GB, para A100/H100 de 80 GB y MI300X).
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090, RTX 4080 y RX 7900 XTX con la edición W4A16.
- Despliegue: vLLM con el plugin `pb27_vllm` instalado desde el repositorio de GitHub; requiere `VLLM_ALLOW_LONG_MAX_MODEL_LEN=1`, `--enforce-eager`, `--no-enable-prefix-caching` y `--kv-cache-memory-bytes 6G` según el ejemplo de arranque del autor.
- Compatibilidad: soporte dual para los runners V1 y V2 de vLLM, con fallback a `ForwardContext` sin hooks; soporte declarado para NVIDIA CUDA y AMD ROCm.
- Latencia y throughput: no disponibles. El autor afirma decodificación de velocidad constante O(1) independiente de la longitud de contexto, pero no publica cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización de esta ficha | VRAM a contexto máximo | Licencia |
|---|---|---|---|---|---|
| PseudoBrain-Gemma-4-26B-A4B-W4A16 | 25,95B totales / 3,8B activos | 1M | W4A16 | ≈17,5 GB | Gemma |
| PseudoBrain-Gemma-4-26B-A4B-FP8 | 25,95B totales / 3,8B activos | 1M | FP8 | ≈30,0 GB | Gemma |
| PseudoBrain-Gemma-4-26B-A4B-NVFP4 | 25,95B totales / 3,8B activos | 1M | NVFP4 | ≈17,5 GB | Gemma |
| PseudoBrain-Gemma-4-26B-A4B-BF16 | 25,95B totales / 3,8B activos | 1M | BF16 | ≈54,5 GB | Gemma |

Las cuatro variantes comparten arquitectura y modelo base; la diferencia es la precisión y el hardware objetivo. No se dispone de datos de rendimiento comparado con modelos de otras familias (por ejemplo, alternativas MoE de tamaño similar con contexto largo) en la información proporcionada.

## Limitaciones y advertencias

- La licencia Gemma impone restricciones de uso comercial y obligaciones de atribución; es necesario revisar los términos de Google antes de un despliegue en producción.
- El modelo es una compilación de terceros sobre un modelo base de Google; no está respaldado oficialmente por Google ni por Red Hat AI.
- La arquitectura PseudoBrain es propietaria y no ha pasado por revisión por pares en la información disponible; las afirmaciones de rendimiento (reducción del 90,2 % de caché KV, fidelidad temporal del 99 %+) provienen del propio autor y no están verificadas de forma independiente.
- El mecanismo de RoPE por bloques proporcional y la memoria exacta por páginas pueden introducir degradaciones en tareas que dependan de orden exacto o de dependencias de largo alcance no capturadas por los landmarks de superbloque.
- Riesgo de alucinación inherente a los modelos de lenguaje, potencialmente amplificado en contextos de 1M de tokens donde la recuperación es aproximada.
- El número de descargas (29) y de likes (0) es muy bajo, lo que indica escasa validación por parte de la comunidad.
- La lista de idiomas soportados no está documentada en esta compilación.
- El despliegue requiere flags específicos de vLLM (`--enforce-eager`, sin prefix caching) que limitan algunas optimizaciones estándar de serving.
- No se han publicado evaluaciones de sesgo ni de seguridad específicas para esta compilación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/defnoteatin/PseudoBrain-Gemma-4-26B-A4B-W4A16
- Repositorio GitHub del proyecto: https://github.com/defnotean/pseudobrain
- Paper de arquitectura (PDF): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf
- Paper de arquitectura (Markdown): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.md
- Informes de benchmarks: https://github.com/defnotean/pseudobrain/tree/main/reports
- Perfil del autor en GitHub: https://github.com/defnotean
- Perfil del autor en Hugging Face: https://huggingface.co/defnoteatin
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Cuantización FP8 de referencia: https://huggingface.co/RedHatAI/gemma-4-26B-A4B-it-FP8-dynamic
- Cuantización NVFP4 de referencia: https://huggingface.co/RedHatAI/gemma-4-26B-A4B-it-NVFP4
- Cuantización AWQ de referencia: https://huggingface.co/cyankiwi/gemma-4-26B-A4B-it-AWQ-4bit
- Edición FP8 de PseudoBrain: https://huggingface.co/defnoteatin/PseudoBrain-Gemma-4-26B-A4B-FP8
- Edición NVFP4 de PseudoBrain: https://huggingface.co/defnoteatin/PseudoBrain-Gemma-4-26B-A4B-NVFP4
- Edición BF16 de PseudoBrain: https://huggingface.co/defnoteatin/PseudoBrain-Gemma-4-26B-A4B-BF16
