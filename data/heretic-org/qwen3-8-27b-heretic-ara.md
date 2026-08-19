# heretic-org/Qwen3.8-27B-heretic-ara

## Resumen

`heretic-org/Qwen3.8-27B-heretic-ara` es una versión modificada del modelo Qwen3.8-27B de Alibaba, desarrollada por el usuario heretic-org. El objetivo es eliminar los mecanismos de rechazo (refusals) del modelo original mediante una técnica de ablación de capas denominada Arbitrary-Rank Ablation (ARA), implementada con la herramienta Heretic. El resultado es un modelo "decensored" que mantiene las capacidades del base pero sin negarse a responder a determinadas peticiones.

El modelo base, Qwen3.8-27B, es un modelo de lenguaje causal con encoder de visión, de 27 mil millones de parámetros, con una arquitectura híbrida que combina Gated DeltaNet (atención lineal) y Gated Attention. Su contexto nativo es de 262.144 tokens, extensible hasta 1.000.000. Está diseñado para tareas de razonamiento complejo, agente autónomo, generación de código y comprensión de imágenes y vídeo. La versión heretic-ara se distribuye bajo licencia Apache 2.0 y está pensada para desarrolladores que necesitan un modelo sin restricciones de contenido, manteniendo la calidad del original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder (basado en Qwen3.8-27B) |
| Parametros totales | 27.356.728.560 (~27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos, extensible a 1.000.000 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo heretic-ara es una modificación del Qwen3.8-27B original. El proceso de abliteration se realizó con un fork personalizado de Heretic v1.2.0+custom, aplicando el método Arbitrary-Rank Ablation (ARA) sobre las capas 26 a 56 (de un total de 64). Los parámetros de ablación incluyen `preserve_good_behavior_weight` de 0.9432, `steer_bad_behavior_weight` de 0.0009, `overcorrect_relative_weight` de 0.5038 y `neighbor_count` de 10. El objetivo es eliminar los patrones de rechazo sin degradar significativamente las capacidades generales, como indica la KL divergence de 0.0535 respecto al modelo original.

El modelo base Qwen3.8-27B presenta una arquitectura híbrida: 64 capas con un layout de 16 bloques, cada uno compuesto por 3 sub-bloques de Gated DeltaNet seguidos de FFN, y 1 sub-bloque de Gated Attention seguido de FFN. La Gated DeltaNet utiliza 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. La Gated Attention emplea 24 cabezas Q y 4 cabezas KV, dimensión de cabeza 256 y RoPE de 64 dimensiones. El modelo fue entrenado en dos etapas (pre-training y post-training) e incorpora Multi-Token Prediction (MTP) con múltiples pasos. No se especifican detalles del dataset de entrenamiento ni del proceso de alineación (RLHF/DPO) en la información disponible.

## Capacidades

- Comprensión multimodal: procesa imágenes y vídeo, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Razonamiento flexible: modo de pensamiento (thinking mode) activado por defecto, con posibilidad de desactivarlo por petición y ajustar la profundidad mediante `reasoning_effort`.
- Agente autónomo: planificación de tareas de múltiples pasos y manejo de feedback del entorno, con mayor fiabilidad en tareas de larga duración.
- Generación de código y soporte técnico: mejoras en tareas de programación y trabajo profesional.
- Tool calling y function calling: no se detalla explícitamente en la model card, pero el modelo base Qwen3.8-27B es compatible con herramientas y entornos de agente (vLLM, SGLang, TokenSpeed).
- Conversación multilingüe: no se especifican idiomas concretos, pero al estar basado en Qwen3.8-27B, se espera soporte multilingüe amplio.
- Ausencia de rechazos: el modelo ha sido ablacionado para no negarse a responder, con 0/100 refusals en la evaluación reportada.

## Casos de uso

- Generación de contenido creativo sin restricciones: el modelo puede producir textos narrativos, guiones o material de ficción sin autocensura, útil para escritores y creadores que necesitan explorar temas sensibles sin bloqueos.
- Investigación y análisis de documentos técnicos: al mantener la capacidad de visión-lenguaje, permite extraer información de diagramas, gráficos y documentos científicos, incluso en contextos largos de hasta 1M tokens.
- Desarrollo de asistentes conversacionales especializados: su capacidad de mantener conversaciones multi-turno con contexto extendido lo hace adecuado para chatbots de dominio específico, donde el usuario necesita respuestas directas sin filtros.
- Automatización de tareas de agente: puede integrarse en pipelines de automatización que requieren planificación y ejecución de múltiples pasos, como gestión de proyectos o análisis de datos, aprovechando su soporte para tool calling.
- Análisis de vídeo y contenido audiovisual: gracias a su encoder de visión, puede procesar vídeos de larga duración para generar resúmenes, transcripciones o descripciones, útil en aplicaciones de monitorización o archivado.
- Generación de código en entornos de desarrollo: puede asistir en la escritura, revisión y depuración de código, integrándose en IDEs o pipelines de CI/CD, con la ventaja de no rechazar peticiones relacionadas con vulnerabilidades o exploits (uso responsable requerido).
- Educación y formación técnica: puede actuar como tutor virtual que responde preguntas complejas de matemáticas, física o informática sin evasivas, manteniendo un tono directo.

## Benchmarks y rendimiento

La model card del autor solo reporta dos métricas comparativas entre el modelo heretic-ara y el original:

| Metrica | Modelo heretic-ara | Modelo original (Qwen3.8-27B) |
|---|---|---|
| KL divergence | 0.0535 | 0 (por definicion) |
| Refusals | 0/100 | 99/100 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La tabla de benchmarks del modelo base está truncada en la model card proporcionada, por lo que no se dispone de valores numéricos verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP16, se requieren aproximadamente 55 GB de VRAM (27B parámetros × 2 bytes). Con cuantización de 8 bits, alrededor de 28 GB; con 4 bits, unos 14 GB.
- GPU recomendadas: para FP16, una NVIDIA A100 80GB o H100 80GB. Para cuantización 8-bit, una RTX 4090 (24 GB) o A6000 (48 GB). Para 4-bit, una RTX 3090/4090 (24 GB) o inferior.
- El modelo cabe en GPUs de consumo si se cuantiza adecuadamente (4-bit u 8-bit), pero no en FP16 completo en tarjetas de 24 GB.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card del base. También se puede usar con llama.cpp u Ollama si se convierten los pesos a GGUF (no se proporcionan dichos formatos en el repo).
- Latencia y throughput: no se dispone de datos medidos. En vLLM con batch, se espera un throughput razonable para un modelo denso de 27B, pero depende del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tipo | Notas |
|---|---|---|---|---|---|
| heretic-org/Qwen3.8-27B-heretic-ara | 27B | 262K (1M ext.) | Apache 2.0 | Denso, visión-lenguaje | Versión decensored del Qwen3.8-27B |
| Qwen/Qwen3.6-27B | 27B | No disponible | Apache 2.0 | Denso, visión-lenguaje | Modelo anterior de la serie Qwen3 |
| Qwen/Qwen3.7-Plus | No disponible | No disponible | Propietaria (API) | No disponible | Modelo comercial de la serie Qwen3 |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada. La tabla de benchmarks del modelo base (que incluye Qwen3.8-27B, Qwen3.6-27B, Qwen3.7-Plus y Muse Glimmer-30B) está incompleta en la model card, por lo que no se pueden extraer valores numéricos.

## Limitaciones y advertencias

- La abliteration puede degradar ligeramente el rendimiento en tareas generales, como indica la KL divergence de 0.0535 respecto al original. No se han medido impactos en tareas específicas.
- Al ser un modelo "uncensored", puede generar contenido inapropiado, ofensivo o peligroso si se le solicita. El desarrollador debe implementar salvaguardas externas si se usa en producción.
- No se especifican los idiomas soportados; aunque el base Qwen3.8-27B probablemente cubre múltiples idiomas, no hay confirmación oficial.
- Riesgo de alucinación: como cualquier modelo generativo, puede inventar información, especialmente en contextos largos o con entradas ambiguas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo derivado puede no estar alineado con políticas de contenido de algunas plataformas.
- No se proporcionan pesos en formatos cuantizados (GGUF, GPTQ), por lo que el despliegue en hardware limitado requiere conversión manual.
- El proceso de ablación se aplicó solo a un rango de capas (26-56); es posible que algunos comportamientos de rechazo persistan en otras capas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/heretic-org/Qwen3.8-27B-heretic-ara
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio Heretic (original): https://github.com/p-e-w/heretic
- Fork custom de Heretic usado: https://github.com/timrohrbaugh/heretic
- PR del método ARA: https://github.com/p-e-w/heretic/pull/211
