# choz/Qwen3.8-27B-Uncensored

## Resumen

**Qwen3.8-27B-Uncensored** es un fine-tune sin censura del modelo base **Qwen3.8-27B**, desarrollado por el usuario de Hugging Face `choz`. El modelo base, creado por el equipo de Qwen (Alibaba), es un modelo de lenguaje denso de 27 000 millones de parámetros con arquitectura híbrida (atención lineal Gated DeltaNet + atención completa Gated Attention) y capacidades nativas de visión-lenguaje (imagen y vídeo). Este fine-tune hereda todas las capacidades del base —razonamiento, generación de código, comprensión multimodal, control de modo de pensamiento— pero elimina las restricciones de contenido, lo que lo hace adecuado para escenarios donde se requiere generación sin filtros, aunque con los riesgos asociados.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato `safetensors` (54,7 GB, correspondientes a precisión bf16). Su ventana de contexto nativa es de 262 144 tokens, extensible hasta 1 000 000. La relevancia actual radica en que combina un tamaño manejable (27B) con arquitectura de última generación y flexibilidad de control de razonamiento, en un momento en que la demanda de modelos locales sin censura crece en la comunidad open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrida: Gated DeltaNet (atención lineal) + Gated Attention (atención completa) + FFN, con Multi-Token Prediction (MTP) |
| Parametros totales | 27 356 728 560 (27,36B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativo; extensible hasta 1 000 000 |
| Tipos de cuantizacion | No especificados en el repo; existe una versión FP8 de terceros (`orcarouter/Qwen3.8-27B-Uncensored-FP8`) |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 es multilingüe, pero no se detallan los idiomas concretos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina dos mecanismos de atención: **Gated DeltaNet** (atención lineal con 48 cabezas para V y 16 para QK, dimensión de cabeza 128) y **Gated Attention** (atención completa con 24 cabezas para Q y 4 para KV, dimensión de cabeza 256, RoPE de 64 dimensiones). La disposición de capas sigue el patrón `16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))`, con 64 capas en total, dimensión oculta de 5120 y FFN intermedio de 17 408. Se incluye entrenamiento con **Multi-Token Prediction** (MTP) en múltiples pasos, lo que mejora la eficiencia de decodificación y la coherencia a largo plazo.

El entrenamiento del base consta de fases de pre-entrenamiento y post-entrenamiento (RLHF/DPO no especificados en la información disponible). El fine-tune "uncensored" realizado por `choz` no documenta el proceso, los datos utilizados ni las técnicas aplicadas; la model card solo indica que hereda la arquitectura, el tokenizador y las capacidades multimodales del base. No se dispone de detalles sobre el volumen de datos de fine-tuning ni sobre si se empleó RLHF, DPO u otro método.

## Capacidades

- **Generación de texto y razonamiento**: produce texto coherente y realiza razonamiento multi-paso, con control de profundidad mediante `reasoning_effort` y modo de pensamiento activable/desactivable por petición.
- **Comprensión multimodal**: entrada nativa de imágenes y vídeo (hasta vídeos de una hora), incluyendo diagramas STEM, documentos escaneados y contenido audiovisual.
- **Generación de código**: soporta tareas de programación, depuración y explicación de código, con buen rendimiento en benchmarks de agente de codificación (DeepSWE 42.2 en el base).
- **Ejecución de agentes**: planificación autónoma y manejo de feedback del entorno para tareas de larga duración (Terminal Bench 73.0, OSWorld 84.3 en el base).
- **Tool calling / function calling**: compatible con herramientas externas, aunque no se detalla explícitamente en la ficha; el base lo soporta de forma nativa.
- **Control de contexto histórico**: conserva el razonamiento de mensajes anteriores mediante `preserve_thinking`.
- **Multilingüismo**: no especificado, pero el modelo base Qwen3.8 es multilingüe (idiomas concretos no disponibles).

## Casos de uso

- **Creación de contenido creativo sin restricciones**: escritura de ficción, guiones, poesía o narrativa con temáticas adultas o controvertidas que los modelos censurados rechazan. El fine-tune permite explorar estos temas sin filtros, manteniendo la calidad lingüística del base.
- **Investigación en seguridad y sesgos de IA**: análisis de cómo un modelo sin alineación de seguridad responde a prompts peligrosos, útil para estudiar mecanismos de censura, sesgos y riesgos de alucinación en entornos controlados de laboratorio.
- **Asistentes conversacionales con control de contenido**: despliegue en aplicaciones donde el desarrollador implementa su propia capa de moderación, aprovechando la flexibilidad del modelo para generar respuestas que otros modelos rechazarían.
- **Análisis de documentos técnicos con imágenes**: extracción de información de diagramas, gráficos y capturas de pantalla en contextos de ingeniería o investigación, gracias a la visión nativa y al contexto largo de 262K tokens.
- **Agentes autónomos de automatización**: integración en pipelines de automatización de tareas (navegación web, operaciones de terminal, gestión de archivos) donde se requiere razonamiento multi-paso y manejo de feedback del entorno.
- **Generación de código en producción**: uso como asistente de programación en entornos donde no se requieren restricciones de contenido, con soporte para tool calling y MTP que acelera la generación de secuencias largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el fine-tune `choz/Qwen3.8-27B-Uncensored`. Los datos disponibles corresponden al modelo base Qwen3.8-27B, según la guía de `lovableapp.org` y la tabla de la model card (incompleta en la información proporcionada):

| Benchmark | Qwen3.8-27B (base) |
|---|---|
| DeepSWE (agente de codificación) | 42,2 |
| Terminal Bench (agente de terminal) | 73,0 |
| OSWorld (agente de sistemas operativos) | 84,3 |

La tabla de la model card del base incluye comparaciones con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero los valores numéricos no están disponibles en la información extraída. El rendimiento del fine-tune puede diferir del base debido al proceso de ajuste sin censura, que podría afectar a la calidad en tareas de razonamiento o seguridad.

## Requisitos de hardware

- **VRAM estimada para inferencia**:
  - bf16 (pesos originales): ~55 GB (27,36B × 2 bytes + overhead de activaciones y KV cache).
  - FP8 (versión de terceros): ~28 GB.
  - INT4 (cuantización GGUF, si se genera): ~14 GB.
- **GPU recomendadas**:
  - Para bf16: A100 80GB, H100 80GB, o múltiples GPUs (p. ej., 2 × RTX 4090 con tensor parallelism).
  - Para FP8: RTX 4090 (24 GB) con cuantización, o A100 40GB.
  - Para INT4: RTX 3090/4090, o GPUs de 16 GB con cuantización agresiva.
- **Compatibilidad con consumer GPU**: sí, con cuantización FP8 o INT4 en GPUs de gama alta (RTX 4090, 3090). Sin cuantización, requiere hardware profesional.
- **Opciones de despliegue**: Hugging Face Transformers, vLLM, SGLang, TokenSpeed, LM Studio (con soporte Day 0 en AMD Ryzen AI Max y Radeon), llama.cpp (si se generan GGUF).
- **Latencia y throughput**: no disponibles. Se espera que MTP mejore la velocidad de decodificación, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Qwen3.8-27B-Uncensored** (este) | 27,36B | 262K (ext. 1M) | Híbrida (DeltaNet + Attention) | Apache 2.0 | Hugging Face |
| **Qwen3.8-27B** (base) | 27,36B | 262K (ext. 1M) | Híbrida (DeltaNet + Attention) | Apache 2.0 | Hugging Face |
| **Qwen3.6-27B** (generación anterior) | ~27B | No disponible | No disponible | Apache 2.0 | Hugging Face |
| **Muse Glimmer-30B** | ~30B | No disponible | No disponible | No disponible | No disponible |

La comparativa se limita a los modelos mencionados en la tabla de benchmarks del base. No se dispone de datos suficientes para comparar rendimiento real entre estos modelos, ya que los valores numéricos de la tabla no están completos en la información extraída. El fine-tune se diferencia del base únicamente en la eliminación de censura, manteniendo el resto de características.

## Limitaciones y advertencias

- **Ausencia de censura**: el modelo puede generar contenido dañino, ilegal, violento, sexual explícito o discriminatorio. Su uso en producción requiere una capa de moderación externa y evaluación de riesgos.
- **Riesgo de alucinación**: como todo LLM, puede inventar hechos, citas o datos, especialmente en tareas de razonamiento complejo o con contexto largo.
- **Fine-tuning no documentado**: no se conocen los datos ni las técnicas del proceso de "uncensoring", lo que impide evaluar su impacto en la calidad, la robustez o la seguridad del modelo.
- **Idiomas no especificados**: aunque el base es multilingüe, no se detallan los idiomas soportados ni el rendimiento relativo entre ellos.
- **Contexto largo con posible degradación**: aunque soporta hasta 1M tokens, el rendimiento en contextos extremadamente largos puede degradarse; se recomienda validar en el caso de uso concreto.
- **Licencia Apache 2.0**: permite uso comercial, pero el responsable del despliegue asume la responsabilidad legal y ética de los contenidos generados.
- **Sin benchmarks propios**: no hay métricas publicadas del fine-tune; los datos del base no garantizan el mismo rendimiento tras el ajuste.

## Enlaces

- Modelo en Hugging Face: [choz/Qwen3.8-27B-Uncensored](https://huggingface.co/choz/Qwen3.8-27B-Uncensored)
- Modelo base: [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- Versión FP8 de terceros: [orcarouter/Qwen3.8-27B-Uncensored-FP8](https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-FP8)
- Blog de AMD sobre soporte Day 0: [Run Qwen 3.8 27B on AMD Ryzen AI Max and Radeon GPUs](https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html)
- Guía completa de Qwen3.8-27B: [The Complete Guide to Qwen's New 27B Vision Model](https://lovableapp.org/blog/qwen3-8-27b)
- Ficha en LM Studio: [qwen/qwen3.8-27b](https://lmstudio.ai/models/qwen/qwen3.8-27b)
- Seguimiento de lanzamiento: [AI Release Tracker - Qwen3.8-27B](https://aireleasetracker.com/model/qwen/qwen3.8-27b)
