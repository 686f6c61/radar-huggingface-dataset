# pitcany/Qwen3.8-27B-FP8

## Resumen

Qwen3.8-27B-FP8 es la versión cuantizada en FP8 del modelo Qwen/Qwen3.8-27B, publicada por el usuario pitcany en Hugging Face. Se trata de un modelo denso de 27.781.427.952 parámetros (27,78 B según los safetensors del repositorio) de tipo causal con encoder de visión, es decir, un modelo nativamente multimodal que procesa texto, imágenes y vídeo. La cuantización aplicada es FP8 de grano fino con bloque de 128, y según el autor las métricas de rendimiento son prácticamente idénticas a las del modelo original. El repositorio ocupa 30,9 GB y está pensado para su uso con Transformers, vLLM, SGLang y TokenSpeed.

El modelo base pertenece a la generación Qwen3.8, presentada por el equipo de Qwen como la más capaz de su familia de pesos abiertos hasta la fecha, con mejoras en código, trabajo profesional, investigación y tareas agénticas de horizonte largo. La arquitectura es híbrida: combina capas de atención lineal (Gated DeltaNet) con capas de atención completa (Gated Attention) en un patrón de 16 bloques repetidos de 3 capas lineales por cada capa de atención completa. El contexto nativo es de 262.144 tokens, extensible hasta 1.000.000.

Su relevancia práctica es doble: por un lado, ofrece un modelo multimodal de 27 B en un formato cuantizado que reduce el peso en memoria respecto a BF16; por otro, incorpora control flexible del razonamiento (modo thinking activado por defecto, desactivable por petición, con ajuste mediante `reasoning_effort` y retención de contexto de razonamiento histórico mediante `preserve_thinking`). Conviene señalar que el repositorio no es oficial: es una publicación de terceros con cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con encoder de visión; híbrida de atención lineal (Gated DeltaNet) y atención completa (Gated Attention). 64 capas organizadas como 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parámetros totales | 27.781.427.952 (27,78 B), medidos sobre los safetensors del repositorio |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 262.144 tokens de forma nativa; extensible hasta 1.000.000 tokens |
| Tipos de cuantización | FP8 de grano fino con bloque de 128 (única variante publicada en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8), con configuración para Transformers; compatible con vLLM, SGLang y TokenSpeed |
| Dimensión oculta | 5.120 |
| Capas | 64 |
| Embedding de tokens | 248.320 (con padding) |
| Salida LM | 248.320 (con padding) |
| Gated DeltaNet | 48 cabezas de atención lineal para V y 16 para QK; dimensión de cabeza 128 |
| Gated Attention | 24 cabezas para Q y 4 para KV; dimensión de cabeza 256; dimensión de RoPE 64 |
| FFN | Dimensión intermedia 17.408 |
| Predicción multi-token | MTP (Multi-Token Prediction) entrenado con múltiples pasos |
| Pipeline declarado | image-text-to-text |
| Tamaño del repositorio | 30,9 GB |
| Modelo base | Qwen/Qwen3.8-27B |

## Arquitectura y entrenamiento

El modelo es un transformer causal con encoder de visión y una columna vertebral híbrida poco habitual. De las 64 capas, 48 corresponden a Gated DeltaNet (atención lineal con estado recurrente) y 16 a Gated Attention (atención completa con 24 cabezas de consulta y 4 de clave-valor, dimensión de cabeza 256 y RoPE de 64 dimensiones). El patrón repetido es de tres capas lineales seguidas de una capa de atención completa. Esta mezcla busca reducir el coste de la atención en contextos muy largos manteniendo la capacidad de recuperación precisa de la atención completa en una de cada cuatro capas. La dimensión oculta es 5.120, el FFN tiene dimensión intermedia 17.408 y el vocabulario (embedding y salida) es de 248.320 entradas con padding.

El modelo base pasó por fases de pre-entrenamiento y post-entrenamiento. Incorpora MTP (Multi-Token Prediction) entrenado con múltiples pasos, lo que habilita decodificación especulativa con las cabezas adicionales. La model card del autor no detalla el número de tokens de entrenamiento, la composición del dataset ni las técnicas concretas de alineación (RLHF, DPO u otras), por lo que esos datos no están disponibles. Sí se documenta explícitamente el comportamiento de razonamiento: el modo thinking está activado por defecto, puede desactivarse por petición, la profundidad de razonamiento se ajusta con `reasoning_effort` y el contexto de razonamiento de mensajes previos se conserva mediante `preserve_thinking`. La cuantización FP8 de este repositorio concreto emplea bloques de 128 elementos y, según el autor, mantiene métricas de rendimiento prácticamente idénticas a las del modelo sin cuantizar.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado como conversational.
- Comprensión nativa de imágenes y vídeo: diagramas STEM, documentos y vídeos de hasta una hora de duración, según la model card.
- Razonamiento configurable: modo thinking activado por defecto, desactivable por petición, con control de profundidad mediante `reasoning_effort`.
- Retención de contexto de razonamiento entre mensajes históricos mediante `preserve_thinking`.
- Ejecución agéntica: planificación autónoma y manejo de retroalimentación del entorno para completar tareas de horizonte largo de extremo a extremo.
- Codificación: mejoras declaradas en tareas de código, incluido el coding agéntico en terminal.
- Tareas de trabajo profesional e investigación, según los destacados de la model card.
- Predicción multi-token (MTP) entrenada con varios pasos, aprovechable para decodificación especulativa.
- Integración con harnesses y herramientas de desarrollo habituales, con soporte declarado para Transformers, vLLM, SGLang y TokenSpeed.
- Compatibilidad con endpoints según la etiqueta `endpoints_compatible` del repositorio.
- Cobertura de idiomas: no disponible (el repositorio no declara lista de idiomas).
- Soporte explícito de tool calling o function calling: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentación técnica y diagramas: el encoder de visión permite introducir diagramas STEM, planos o capturas de documentación y obtener explicaciones o extracción de datos, aprovechando el contexto de 262.144 tokens para adjuntar documentos completos junto a la consulta.
- Revisión de vídeos largos: la model card declara soporte de vídeos de hasta una hora; es adecuado para resumir sesiones grabadas, extraer decisiones o generar actas a partir de material audiovisual extenso sin trocear el contenido.
- Agentes de operación en terminal: el modelo está optimizado para coding agéntico en terminal y tareas de horizonte largo; puede integrarse en bucles de ejecución de comandos, lectura de salida y corrección de errores en pipelines de CI/CD.
- Asistente de código en producción: con licencia Apache 2.0 y compatibilidad con vLLM y SGLang, se puede desplegar como servicio interno de autocompletado y generación de parches, manteniendo el código dentro de la infraestructura propia.
- Análisis de repositorios completos: la ventana de 262.144 tokens permite cargar múltiples ficheros y su historial para responder preguntas de arquitectura, detectar dependencias o localizar regresiones sin recurrir a recuperación externa obligatoria.
- Atención al cliente con razonamiento controlado: el modo thinking permite activar razonamiento profundo solo en peticiones complejas y desactivarlo en consultas simples para reducir latencia y coste, conservando el contexto de conversaciones anteriores.
- Investigación asistida: combinación de lectura de artículos con figuras y tablas, síntesis de resultados y generación de borradores, con contexto suficiente para mantener intacta una revisión bibliográfica extensa.
- Procesamiento por lotes de documentación escaneada: al ser multimodal y desplegable con vLLM o SGLang, encaja en trabajos batch de extracción estructurada sobre grandes volúmenes de PDF e imágenes.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados comparativa con los modelos Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, organizada por categorías (entre ellas Coding y la fila Agentic terminal coding). Sin embargo, el contenido proporcionado está truncado y solo se conservan las cabeceras de la tabla, no los valores numéricos. No se han podido recuperar cifras concretas de MMLU, HumanEval, GSM8K ni de ningún otro benchmark a partir de la información disponible.

| Categoría / benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Coding | no disponible | no disponible | no disponible | no disponible | no disponible |
| Agentic terminal coding | no disponible | no disponible | no disponible | no disponible | no disponible |

Tampoco se han publicado en la información disponible métricas de la variante FP8 frente al modelo base en BF16, más allá de la afirmación cualitativa del autor de que el rendimiento es prácticamente idéntico al original.

## Requisitos de hardware

- Peso de los parámetros en FP8: aproximadamente 27,8 GB, coherente con los 27.781.427.952 parámetros a 1 byte por parámetro. El repositorio completo ocupa 30,9 GB, incluyendo configuración y posibles ficheros auxiliares.
- VRAM mínima orientativa para inferencia: del orden de 30-32 GB solo para pesos, más el espacio de caché KV y activaciones. No hay cifras oficiales publicadas en la información disponible.
- GPU de centro de datos: A100 80 GB, H100 80 GB y H200 son opciones holgadas para contexto moderado. En A100 40 GB el modelo cabe justo para pesos, pero el contexto útil queda muy limitado.
- Consumer GPU: una RTX 4090 con 24 GB no puede cargar los pesos FP8 completos. En una GPU de 32 GB (por ejemplo, RTX 5090) el ajuste sería muy justo y probablemente inviable con contexto apreciable. No hay variantes GGUF ni de 4 bits publicadas en este repositorio.
- Contexto largo: para aprovechar los 262.144 tokens nativos o la extensión a 1.000.000 es necesario dimensionar la caché KV en consecuencia; el patrón híbrido con 48 de 64 capas de atención lineal reduce ese coste respecto a un transformer de atención completa, pero no hay cifras publicadas.
- Multi-GPU: el despliegue con paralelismo de tensor es la vía recomendada para servir el modelo con contextos amplios en varias GPU de 40-80 GB.
- Opciones de despliegue: Transformer
