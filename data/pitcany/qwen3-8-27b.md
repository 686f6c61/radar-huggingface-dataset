# pitcany/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión, publicado en HuggingFace por el usuario pitcany bajo el identificador `pitcany/Qwen3.8-27B`. Según la model card, forma parte de la familia Qwen3.8, presentada como la generación más capaz de la saga de modelos abiertos Qwen hasta la fecha, construida sobre la base arquitectónica de Qwen3.5. Se distribuye como un modelo denso de 27 000 millones de parámetros, con un total real de 27 781 427 952 parámetros según los pesos en safetensors, y un tamaño de repositorio de 55,6 GB.

El modelo es nativamente multimodal (image-text-to-text): incorpora un codificador de visión que le permite comprender imágenes y vídeos, además de texto. Su arquitectura combina capas de atención lineal (Gated DeltaNet) con capas de atención con compuertas (Gated Attention) en un patrón híbrido repetido 16 veces, e incluye entrenamiento con Multi-Token Prediction (MTP). Declara una longitud de contexto nativa de 262 144 tokens, extensible hasta 1 000 000.

La relevancia del modelo reside en su orientación a tareas agénticas de largo horizonte, codificación, trabajo profesional e investigación, con control flexible del modo de razonamiento (thinking activado por defecto, desactivable por petición, con ajuste de profundidad mediante `reasoning_effort`). La licencia Apache 2.0 facilita su adopción comercial. No obstante, la ficha se basa exclusivamente en la información publicada en el repositorio; los datos de benchmarks disponibles están truncados y no se han podido verificar por completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con codificador de visión; capas Gated DeltaNet (atención lineal) y Gated Attention; MTP (Multi-Token Prediction) |
| Parametros totales | 27 781 427 952 (27B según model card) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos; extensible hasta 1 000 000 |
| Tipos de cuantizacion | No disponible (la model card no detalla cuantizaciones publicadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (formato Transformers) |
| Dimension oculta | 5120 |
| Capas | 64 |
| Layout oculto | 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Cabezas Gated DeltaNet | 48 para V, 16 para QK; dimensión de cabeza 128 |
| Cabezas Gated Attention | 24 para Q, 4 para KV; dimensión de cabeza 256 |
| Dimensión RoPE | 64 |
| Dimensión intermedia FFN | 17 408 |
| Embedding / salida LM | 248 320 (padded) |
| Pipeline | image-text-to-text |
| Librería | transformers |
| Tamaño del repo | 55,6 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de transformer causal con codificador de visión, en la que el bloque del lenguaje alterna capas de atención lineal Gated DeltaNet y capas de atención con compuertas Gated Attention. El patrón se repite 16 veces con la estructura 3 × (Gated DeltaNet → FFN) seguida de 1 × (Gated Attention → FFN), lo que da un total de 64 capas. Las capas Gated DeltaNet usan 48 cabezas para V y 16 para QK con dimensión de cabeza 128, mientras que las capas Gated Attention usan 24 cabezas para Q y 4 para KV con dimensión de cabeza 256 y RoPE de dimensión 64. La FFN tiene dimensión intermedia de 17 408 y el embedding de tokens (y la salida LM) es de 248 320 entradas con padding.

El entrenamiento comprende fases de preentrenamiento y postentrenamiento. La model card menciona el entrenamiento con Multi-Token Prediction (MTP) en varios pasos, lo que habilita decodificación especulativa y mejora del throughput. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas concretas de RLHF o DPO. Tampoco se detalla la arquitectura del codificador de visión más allá de su presencia y de la capacidad declarada de comprensión de imágenes y vídeos (incluidos vídeos de hasta una hora). El contexto nativo es de 262 144 tokens, ampliable a 1 000 000.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento (thinking) activado por defecto, desactivable por petición.
- Control de profundidad de razonamiento mediante el parámetro `reasoning_effort` y retención del contexto de razonamiento histórico mediante `preserve_thinking`.
- Comprensión nativa de imágenes y vídeos (image-text-to-text): diagramas STEM, documentos y vídeos de hasta una hora.
- Codificación y tareas de terminal agénticas (la model card cita Terminal Bench 2.1).
- Planificación autónoma y manejo de retroalimentación del entorno para tareas agénticas de largo horizonte.
- Compatibilidad con harnesses y herramientas de desarrollo populares.
- Soporte de tool calling / function calling: la model card menciona herramientas integradas oficiales en la versión alojada, pero no detalla el mecanismo en los pesos abiertos.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Decodificación especulativa mediante MTP.

## Casos de uso

- Automatización de tareas agénticas de terminal: el modelo puede encadenar comandos y procesar la retroalimentación del entorno, adecuado para pipelines de CI/CD y entornos de desarrollo automatizados gracias a su entrenamiento específico en Terminal Bench.
- Análisis de documentos técnicos y diagramas STEM: al ser nativamente multimodal, puede extraer información de figuras, esquemas y documentos escaneados sin necesidad de un pipeline OCR separado.
- Procesamiento de vídeo de larga duración: su capacidad declarada para vídeos de hasta una hora permite resumir reuniones, generar actas o indexar contenido audiovisual.
- Asistentes de codificación en producción: con 262 144 tokens de contexto nativo, puede mantener el estado de repositorios grandes y múltiples archivos en una sola sesión.
- Investigación asistida: el modo thinking configurable permite ajustar la profundidad de razonamiento según la fase (exploración rápida frente a análisis profundo), reduciendo coste en consultas simples.
- Atención al cliente multi-turno: el contexto largo y la retención de razonamiento histórico (`preserve_thinking`) permiten conversaciones extensas con memoria de decisiones previas.
- Despliegue en infraestructura propia: al ser un modelo denso de 27B con licencia Apache 2.0, puede servirse con vLLM, SGLang o TokenSpeed en hardware de una sola GPU de gama alta.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparativa con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, organizada por categorías (Coding, Agentic terminal coding con Terminal Bench 2.1 Terminus, entre otras). Sin embargo, el contenido de la tabla en la información proporcionada está truncado a partir de la primera fila de resultados, por lo que no se dispone de los valores numéricos.

No se han publicado resultados de benchmarks completos y verificables en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en safetensors de aproximadamente 55,6 GB en precisión original (probablemente BF16), se requiere al menos una GPU con 80 GB de VRAM (A100 80GB, H100 80GB) para inferencia sin cuantizar.
- Cuantización a 8 bits: reduciría el peso a unos 28 GB, permitiendo su ejecución en GPUs de 40-48 GB (A6000, L40S, RTX 6000 Ada).
- Cuantización a 4 bits: reduciría el peso a unos 14-15 GB, lo que permitiría su ejecución en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090, aunque el contexto largo de 262 144 tokens incrementaría significativamente el uso de memoria KV.
- GPU recomendadas: A100 80GB, H100 80GB para producción sin cuantizar; L40S o A6000 para cuantización 8 bits; RTX 4090 para cuantización 4 bits con contextos moderados.
- Opciones de despliegue: la model card confirma compatibilidad con Hugging Face Transformers, vLLM, SGLang y TokenSpeed. No se mencionan llama.cpp ni Ollama en la información disponible.
- Latencia y throughput: no disponibles. El entrenamiento con MTP sugiere mejoras de throughput mediante decodificación especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27B (denso) | 262 144 nativo; hasta 1M | Apache 2.0 | Sí (imagen y vídeo) | Pesos abiertos en HuggingFace |
| Qwen3.6-27B | 27B (no detallado) | No disponible | No disponible | No disponible | Citado en benchmarks de la model card |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible | Citado en benchmarks; presumiblemente API |
| Muse Glimmer-30B | 30B | No disponible | No disponible | No disponible | Citado en benchmarks de la model card |

Los datos de rendimiento comparativo no están disponibles en la información proporcionada, ya que la tabla de benchmarks está truncada. No se dispone de información sobre licencias ni contextos de los modelos comparados más allá de lo citado.

## Limitaciones y advertencias

- La información disponible es incompleta: la tabla de benchmarks está truncada y no se han podido verificar los resultados declarados.
- No se especifican los idiomas soportados, lo que impide garantizar un rendimiento adecuado en castellano u otros idiomas distintos del inglés.
- No se detalla la composición del dataset de entrenamiento ni los procesos de alineación (RLHF/DPO), lo que dificulta evaluar sesgos conocidos.
- Riesgo de alucinación inherente a los modelos generativos, no cuantificado en la información disponible.
- El modo thinking activado por defecto puede incrementar latencia y coste en aplicaciones de baja complejidad si no se desactiva explícitamente.
- El contexto nativo de 262 144 tokens exige una gestión cuidadosa de la memoria KV en producción; la extensión a 1 000 000 tokens se anuncia para la versión alojada en Qwen Cloud, no necesariamente para los pesos abiertos.
- La licencia Apache 2.0 permite uso comercial, pero el repositorio pertenece a un usuario (`pitcany`) y no a la organización oficial Qwen; conviene verificar la procedencia y autenticidad de los pesos antes de usarlos en producción.
- El número de descargas (6) y likes (0) es muy bajo, lo que sugiere que el modelo no ha sido ampliamente validado por la comunidad.
- La fecha de creación del repositorio (2026-10-29) es posterior a la fecha actual de referencia habitual, lo que debe tenerse en cuenta al evaluar su vigencia.

## Enlaces

- HuggingFace: https://huggingface.co/pitcany/Qwen3.8-27B
- Qwen Cloud (servicio alojado): https://www.qwencloud.com
- Qwen3.8-27B Overview en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
