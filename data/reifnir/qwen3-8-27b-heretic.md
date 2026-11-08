# reifnir/Qwen3.8-27B-heretic

## Resumen

Qwen3.8-27B-heretic es una versión "decensored" (abliterated) del modelo Qwen/Qwen3.8-27B, publicada por el usuario reifnir. El modelo base es un modelo de lenguaje causal denso de 27 000 millones de parámetros desarrollado por el equipo Qwen, construido sobre la arquitectura de la familia Qwen3.5 y con codificador de visión nativo (pipeline image-text-to-text). Esta variante elimina total o parcialmente el comportamiento de rechazo del modelo original mediante la técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) implementada en la herramienta Heretic v2.0.0.

La relevancia de esta ficha es doble: por un lado documenta el modelo base Qwen3.8-27B, que introduce mejoras en codificación, tareas agénticas de largo horizonte, control flexible del modo de razonamiento y comprensión nativa de imagen y vídeo; por otro, describe una modificación de seguridad que altera sustancialmente el perfil de comportamiento del modelo y que debe evaluarse con cautela antes de cualquier despliegue en producción.

El modelo base declara 27 356 728 560 parámetros en safetensors (27,36 B), un repositorio de 54,8 GB en precisión original y licencia Apache 2.0. La ficha del autor no proporciona información sobre idiomas soportados ni detalles del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con codificador de visión; híbrido de atención lineal (Gated DeltaNet) y atención completa (Gated Attention); 64 capas; hidden dimension 5120; FFN intermedio 17 408; MTP (Multi-Token Prediction) |
| Parametros totales | 27 356 728 560 (27,36 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos, extensible hasta 1 000 000 (la ficha de featherless.ai cita 32 768 tokens extensibles con YaRN; dato discrepante con la model card) |
| Tipos de cuantizacion | No disponible (no se documentan GGUF, AWQ ni GPTQ en la información proporcionada) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con codificador de visión. El layout de capas es 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), es decir, una combinación de atención lineal con estado recurrente (Gated DeltaNet: 48 cabezas lineales para V y 16 para QK, dimensión de cabeza 128) y atención completa clásica (Gated Attention: 24 cabezas para Q y 4 para KV, dimensión de cabeza 256, RoPE de dimensión 64). El vocabulario y la capa de salida están dimensionados a 248 320 entradas (con padding). Incluye Multi-Token Prediction (MTP) entrenado con varios pasos, técnica que permite decodificación especulativa nativa y mayor throughput en inferencia.

El modelo base se distribuye tras las etapas de pre-entrenamiento y post-entrenamiento, aunque la model card no detalla el número de tokens, la composición del dataset ni si se emplearon RLHF o DPO. La variante heretic aplica una ablación ARA entre las capas 32 y 52 con los parámetros indicados por el autor: `start_layer_index=32`, `end_layer_index=52`, `preserve_good_behavior_weight=0.6001`, `steer_bad_behavior_weight=0.0002`, `overcorrect_relative_weight=0.8597` y `neighbor_count=10`. El proceso es reproducible según el autor (directorio `reproduce/`).

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado por defecto, desactivable por petición y ajustable mediante `reasoning_effort`; retención del contexto de razonamiento histórico con `preserve_thinking`.
- Comprensión nativa de imagen y vídeo (diagramas STEM, documentos, vídeos de hasta una hora según la model card).
- Generación de código y tareas de trabajo profesional e investigación.
- Ejecución agéntica de largo horizonte: planificación autónoma y procesamiento de la realimentación del entorno.
- Compatibilidad con harnesses y herramientas de desarrollo populares (la model card menciona "downstream compatibility" sin detallar cuáles).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no documentado explícitamente en la información disponible.
- En la variante heretic, el comportamiento de rechazo se reduce drásticamente (0/100 rechazos en la evaluación del autor frente a 98/100 del original).

## Casos de uso

- Análisis de documentos técnicos con diagramas: el modelo puede procesar capturas de papers, esquemas de arquitectura y tablas junto con texto, lo que permite extraer y resumir información de documentación científica o técnica en una sola pasada multimodal.
- Automatización de tareas agénticas de largo horizonte: gracias a su planificación autónoma y al procesamiento de realimentación del entorno, puede encadenar pasos en pipelines de investigación o de operaciones con contexto de hasta 262 144 tokens.
- Procesamiento de vídeo de larga duración: la comprensión nativa de vídeo permite resumir o indexar grabaciones de hasta una hora, útil en análisis de reuniones, auditoría de procesos o revisión de material formativo.
- Asistencia a la programación: el modelo base declara mejoras específicas en codificación; puede integrarse en entornos de desarrollo para generación, revisión y explicación de código sobre repositorios con contexto largo.
- Investigación sobre alineación y seguridad: al ser una variante abliterated reproducible, sirve como objeto de estudio para medir el efecto de la ablación ARA sobre la distribución de salidas (KL divergence de 0,0338 respecto al original según el autor).
- Generación creativa sin restricciones de rechazo: la variante heretic está pensada para escenarios de escritura creativa o role-play donde el modelo original rechazaría peticiones; requiere revisión humana dado el riesgo de contenido inapropiado.
- Evaluación comparativa de Robustez: permite contrastar el comportamiento del modelo base frente a la variante ablacionada en las mismas tareas, aislando el efecto de la capa de rechazo.

## Benchmarks y rendimiento

La model card del autor incluye una tabla de rendimiento comparativa entre la variante heretic y el modelo original:

| Metrica | Qwen3.8-27B-heretic | Qwen/Qwen3.8-27B |
|---|---|---|
| Rechazos | 0/100 | 98/100 |
| Divergencia KL | 0,0338 | 0 (por definición) |
| Rechazos (clasificador) | 36/100 | 98/100 |

La model card del modelo base incluye una tabla de benchmarks de texto (comparando Qwen3.8-27B con Qwen3.6-27B y Qwen3.7-Plus), pero los valores numéricos no están disponibles en la información proporcionada. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión original (BF16): aproximadamente 55 GB solo para pesos, más overhead de KV cache y activaciones; en la práctica requiere 80 GB o más por instancia.
- Cuantización a 8 bits: alrededor de 28-30 GB de pesos; cuantización a 4 bits: alrededor de 15-16 GB de pesos (estimación teórica, no confirmada por el autor).
- GPU recomendadas: A100 80 GB, H100 80 GB, H200 o múltiples RTX 4090 (24 GB) con tensor parallelism para precisión completa.
- En GPU de consumo: posible en RTX 4090 o RTX 3090 únicamente con cuantización agresiva (4 bits) y siempre que se disponga de pesos cuantizados, que no se documentan en la información disponible.
- Opciones de despliegue: la model card cita compatibilidad con Hugging Face Transformers, vLLM, SGLang y TokenSpeed. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El uso de MTP (Multi-Token Prediction) sugiere decodificación especulativa nativa que debería mejorar el throughput, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B-heretic (este) | 27,36 B densos | 262 144 nativos, hasta 1 M | Apache 2.0 | Variante abliterated; 0/100 rechazos; multimodal |
| Qwen/Qwen3.8-27B | 27 B densos | 262 144 nativos, hasta 1 M | Apache 2.0 | Modelo original; 98/100 rechazos; multimodal |
| Qwen3.6-27B | No disponible | No disponible | No disponible | Generación anterior de la familia Qwen; citado en la tabla de benchmarks del autor |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | Citado en la tabla de benchmarks del autor; presumiblemente variante "Plus" de API |

No se dispone de datos de benchmarks numéricos que permitan una comparación cuantitativa de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La ablación ARA elimina el comportamiento de rechazo, pero no garantiza la eliminación de sesgos ni de contenido dañino; el clasificador del autor sigue detectando rechazos en 36/100 casos, lo que indica un comportamiento residual inconsistente.
- La divergencia KL de 0,0338 respecto al modelo original implica que la distribución de salidas se ha desplazado; pueden aparecer degradaciones en tareas que dependían del comportamiento original.
- Riesgo elevado de alucinación y de generación de contenido inapropiado, especialmente en la variante heretic; se recomienda filtrado y revisión humana en producción.
- La model card no documenta idiomas soportados, composición del dataset de entrenamiento ni detalles de RLHF/DPO, lo que dificulta evaluar sesgos lingüísticos y culturales.
- Existe una discrepancia entre la model card (262 144 tokens nativos) y una ficha de terceros (32 768 tokens extensibles con YaRN); conviene verificar la configuración real antes de desplegar con contextos largos.
- La licencia Apache 2.0 permite uso comercial, pero la modificación heretic puede vulnerar las políticas de uso de plataformas de despliegue y de proveedores de API.
- El repositorio no presenta descargas ni likes en el momento de la consulta y no se documentan pesos cuantizados, lo que limita su adopción práctica en hardware de consumo.
- El modelo base es multimodal (image-text-to-text); los pipelines que solo esperan texto deben adaptar las claves del adaptador (advertencia documentada en el repositorio de GitHub qwen38-heretic-local).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reifnir/Qwen3.8-27B-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic (proyecto): https://heretic-project.org
- Repositorio de reproducción local: https://github.com/SAMY-HASHEM/qwen38-heretic-local
- Ficha en featherless.ai: https://featherless.ai/models/OpenIntelligenceNet/Qwen-3.8-27B-Heretic
- Qwen Cloud (servicio gestionado del modelo base): https://www.qwencloud.com/models/qwen3.8-27b
