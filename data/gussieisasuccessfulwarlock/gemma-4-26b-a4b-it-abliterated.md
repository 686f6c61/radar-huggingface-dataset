# gussieIsASuccessfulWarlock/gemma-4-26B-A4B-it-abliterated

## Resumen

Gemma 4 26B A4B es un modelo multimodal de Google DeepMind perteneciente a la familia Gemma 4, publicada con pesos abiertos bajo licencia Apache 2.0. Esta ficha concreta corresponde a una variante "abliterated" o decensored distribuida por el usuario `gussieIsASuccessfulWarlock`, que parte del checkpoint oficial `google/gemma-4-26B-A4B` (variante instruction-tuned) y le aplica una ablación de direcciones de rechazo mediante la herramienta Heretic v2.1.0. El objetivo declarado es reducir drásticamente la tasa de negativas del modelo ante peticiones que el modelo original rechazaría, manteniendo el resto de capacidades lo más intactas posible.

El modelo base es un transformer con arquitectura Mixture-of-Experts: 25.805.933.872 parámetros totales según los pesos en safetensors, con un subconjunto de parámetros activos por token (la nomenclatura "A4B" indica aproximadamente 4B activos). Emplea atención híbrida que intercala ventanas deslizantes locales con atención global, soporte nativo del rol `system`, modos de razonamiento configurables y una ventana de contexto de hasta 256K tokens en los modelos de tamano medio. Procesa texto e imagen (con audio en otras variantes de la familia) y genera texto.

La relevancia de esta ficha es doble: por un lado documenta las capacidades del Gemma 4 26B A4B original; por otro, caracteriza una modificación no oficial que altera el comportamiento de seguridad del modelo. Es importante senalar que la model card del autor no incluye información sobre idiomas soportados, datos de entrenamiento del checkpoint base más allá de lo publicado por Google, ni resultados de benchmarks del modelo abliterated más allá de la métrica de rechazos y divergencia KL que reporta Heretic.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con atención híbrida (sliding window local + atención global), p-RoPE y Keys/Values unificadas en capas globales |
| Parametros totales | 25.805.933.872 (según safetensors) |
| Parametros activos | Aproximadamente 4B (denominación "A4B"); cifra exacta no disponible |
| Longitud de contexto | 256K tokens (modelos de tamano medio de la familia Gemma 4) |
| Tipos de cuantizacion | No disponible en la información proporcionada (el repo contiene safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | No disponible en esta ficha; la familia Gemma 4 declara soporte multilingüe en más de 140 idiomas |
| Licencia | Apache 2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | Safetensors (librería transformers) |
| Modalidades | Entrada texto e imagen; salida texto |
| Tamano del repo | 51.7 GB |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El checkpoint base `google/gemma-4-26B-A4B` es un modelo MoE de la familia Gemma 4 de Google DeepMind. La familia combina variantes densas (E2B, E4B, 12B Unified, 31B) y una variante MoE (26B A4B). La arquitectura emplea atención híbrida: capas con ventana deslizante local intercaladas con capas de atención global, garantizando que la capa final sea siempre global. Para optimizar memoria en contextos largos, las capas globales unifican Keys y Values y aplican Proportional RoPE (p-RoPE). El vocabulario es de 262K tokens. Los modelos de la familia incorporan soporte nativo del rol `system` y modos de razonamiento configurables ("thinking modes").

Sobre el entrenamiento del checkpoint base, la información disponible indica que Gemma 4 se publica en variantes pre-entrenada e instruction-tuned, con soporte multilingüe en más de 140 idiomas y mejoras notables en benchmarks de código y capacidades agénticas, incluyendo function calling nativo. No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas concretas de RLHF o DPO.

La modificación de esta ficha aplica Arbitrary-Rank Ablation (ARA) con Heretic v2.1.0 entre las capas 15 y 25, con los parámetros `preserve_good_behavior_weight=0.9545`, `steer_bad_behavior_weight=0.0002`, `overcorrect_relative_weight=0.9858` y `neighbor_count=15`. El resultado reportado por el autor es una reducción de rechazos de 100/100 en el modelo original a 4/100 en esta variante, con una divergencia KL de 0.0902 respecto al original.

## Capacidades

- Generación de texto y razonamiento con modos de "thinking" configurables (heredados del modelo base).
- Comprensión de imágenes (image-text-to-text) con soporte de relación de aspecto y resolución variables según la familia Gemma 4.
- Generación de código y tareas de programación, con mejoras reportadas por Google en benchmarks de coding para la familia.
- Capacidades agénticas y function calling nativo (heredadas del modelo base).
- Soporte nativo del rol `system` para conversaciones estructuradas.
- Procesamiento de contexto largo gracias a la ventana de 256K tokens y a la atención híbrida.
- Multilingüismo: la familia declara más de 140 idiomas; esta ficha concreta no lista idiomas específicos.
- Comportamiento "decensored": el autor reporta una tasa de rechazos de 4/100 frente a 100/100 del original, lo que implica menor tendencia a negarse a responder.
- Conversacional multi-turno.

## Casos de uso

- Investigación sobre alineación y seguridad: comparar el comportamiento del modelo original frente a la variante abliterated en conjuntos de prompts controlados, midiendo tasas de rechazo y divergencia respecto al original, usando las métricas que reporta Heretic (rechazos y KL).
- Evaluación de robustez de filtros: probar pipelines de moderación externos sobre las salidas de un modelo decensored para validar que las capas de seguridad aguas abajo funcionan con independencia del modelo generador.
- Generación creativa sin restricciones de tono: escritura de ficción, guiones o narrativa con temáticas adultas o controvertidas donde el modelo base tiende a rechazar; requiere revisión humana y cumplimiento legal.
- Análisis de documentos e imágenes en contextos de investigación: aprovechar la entrada multimodal y la ventana de 256K tokens para tareas de extracción y resumen sobre documentos largos con figuras.
- Asistencia a la programación en entornos controlados: usar el function calling y las capacidades de código del modelo base para tareas de generación y refactorización, con la salvedad de que la ablación puede afectar a la calidad en dominios sensibles.
- Estudio de sesgos y comportamientos no deseados: analizar qué tipo de contenido emerge cuando se eliminan las direcciones de rechazo, como material para investigación sobre interpretabilidad y steerability.
- Despliegue experimental en investigación académica: servir el modelo con transformers o frameworks compatibles para experimentos que requieran comportamiento sin censura, siempre en entornos aislados y con registro de uso.

## Benchmarks y rendimiento

El autor solo reporta métricas del proceso de ablación, no benchmarks estándar (MMLU, HumanEval, GSM8K) del modelo resultante.

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Rechazos (sobre 100 prompts) | 4/100 | 100/100 |
| Divergencia KL | 0.0902 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible para esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 52 GB solo para pesos (25.8B parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica se recomienda al menos 60-80 GB según longitud de contexto.
- Cuantización a 8 bits: aproximadamente 26 GB de pesos; a 4 bits: aproximadamente 13-15 GB de pesos, aunque no se listan ficheros GGUF en el repo.
- GPU recomendadas: A100 80GB, H100 80GB o múltiples GPUs de 24-48 GB para bf16. Para cuantización a 4 bits podría caber en una RTX 4090 (24 GB) o RTX 3090, con contexto limitado.
- Despliegue: transformers es la librería declarada; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. No se confirman en la información disponible integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. Al ser MoE con ~4B activos, el coste por token debería ser inferior al de un denso de 26B, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma 4 26B A4B (este, abliterated) | 25.8B totales, ~4B activos | 256K | Texto + imagen | Apache 2.0 | Variante decensored no oficial; rechazos 4/100 |
| Gemma 4 26B A4B (original de Google) | 25.8B totales, ~4B activos | 256K | Texto + imagen | Apache 2.0 | Checkpoint oficial instruction-tuned; rechazos 100/100 según el autor |
| Gemma 4 31B Dense | 30.7B | 256K | Texto + imagen | Apache 2.0 | Variante densa de mayor tamano, sin audio |
| Gemma 4 12B Unified | 11.95B | 256K | Texto + imagen + audio | Apache 2.0 | Arquitectura sin encoders, proyecta parches e audio directamente |

No se dispone de comparativas con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- La ablación reduce los rechazos de forma deliberada; el modelo puede generar contenido que el original bloquearía, incluyendo material sensible o potencialmente dañino. No debe desplegarse en producción orientada a usuarios sin capas de moderación externas.
- La divergencia KL de 0.0902 respecto al original indica que el comportamiento no es idéntico; pueden aparecer degradaciones en calidad, coherencia o seguimiento de instrucciones en dominios no evaluados.
- No se han publicado benchmarks estándar de esta variante, por lo que se desconoce el impacto de la ablación en razonamiento, código o matemáticas.
- La model card no detalla sesgos conocidos ni composición del dataset de entrenamiento del modelo base.
- Idiomas soportados no especificados en esta ficha; se hereda el multilingüismo declarado de la familia (más de 140 idiomas) sin verificación específica tras la ablación.
- Licencia Apache 2.0 según la model card, pero con enlace a la licencia de Gemma 4 de Google; conviene revisar los términos de uso de Gemma antes de un uso comercial, ya que la variante es una modificación no oficial no avalada por Google.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni reportes independientes de calidad.
- El checkpoint base es instruction-tuned; la ablación se aplicó sobre esa variante, no sobre el pre-entrenado.
- Uso responsable: al tratarse de un modelo decensored, el despliegue debe cumplir la legislación aplicable en materia de contenido y protección de menores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gussieIsASuccessfulWarlock/gemma-4-26B-A4B-it-abliterated
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B
- Colección Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación de Gemma: https://ai.google.dev/gemma/docs/core
- Informe técnico (arXiv): https://arxiv.org/abs/2607.02770
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Heretic (herramienta de ablación): https://heretic-project.org
- Página de modelos Gemma de DeepMind: https://deepmind.google/models/gemma/
