# nokkela-ai/Qwen3.8-27B-FP8

## Resumen

Qwen3.8-27B-FP8 es una versión cuantizada en FP8 del modelo Qwen3.8-27B, desarrollado por el equipo Qwen (Alibaba). Se trata de un modelo denso de 27.781 millones de parámetros con codificador de visión nativo, diseñado para tareas de razonamiento complejo, generación de código, trabajo profesional, investigación y ejecución de agentes autónomos de largo horizonte. Esta variante concreta ha sido publicada por el usuario nokkela-ai en Hugging Face y mantiene la licencia Apache 2.0 del modelo original.

La arquitectura combina capas de atención lineal Gated DeltaNet con capas de atención completa Gated Attention en una proporción de 3:1, un diseño híbrido que reduce el coste computacional en contextos largos. El modelo soporta de forma nativa 262.144 tokens de contexto, extensible hasta 1.000.000, e incorpora control flexible del modo de razonamiento mediante los parámetros `reasoning_effort` y `preserve_thinking`.

La cuantización FP8 de grano fino con bloques de 128 reduce el peso del repositorio a 30,9 GB, lo que facilita el despliegue en infraestructura de inferencia moderna (vLLM, SGLang, Transformers) manteniendo, según el autor, métricas de rendimiento prácticamente idénticas a las del modelo original. Es relevante para equipos que necesitan un modelo multimodal compacto y desplegable en producción con capacidades agénticas avanzadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con codificador de visión (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27.781.427.952 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | FP8 de grano fino con tamaño de bloque 128 (esta versión); el modelo base admite otras cuantizaciones de la comunidad |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compatible con transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura causal con codificador de visión, organizada en 64 capas con una dimensión oculta de 5120. El layout interno es 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), es decir, tres bloques de atención lineal Gated DeltaNet por cada bloque de atención completa Gated Attention. La Gated DeltaNet usa 48 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128; la Gated Attention usa 24 cabezas para Q y 4 para KV con dimensión de cabeza 256 y RoPE de 64 dimensiones. La FFN tiene dimensión intermedia de 17.408 y el embedding de tokens es de 248.320 (con padding).

El entrenamiento incluye fases de preentrenamiento y postentrenamiento, con Multi-Token Prediction (MTP) entrenado en múltiples pasos, lo que habilita decodificación especulativa y mejora el throughput. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni los detalles de RLHF/DPO. La cuantización FP8 de grano fino con bloques de 128 es la innovación de esta variante concreta, orientada a reducir huella de memoria sin degradar métricas.

## Capacidades

- Generación de texto y razonamiento complejo con modo de pensamiento activado por defecto y desactivable por petición.
- Control de profundidad de razonamiento mediante `reasoning_effort` y retención de contexto de razonamiento histórico con `preserve_thinking`.
- Comprensión nativa de imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora.
- Generación de código y tareas de coding agéntico, incluyendo terminal coding.
- Ejecución de agentes autónomos con planificación y manejo de retroalimentación del entorno para completar tareas de extremo a extremo.
- Soporte de tool calling y function calling (implícito en las capacidades agénticas descritas).
- Capacidades multilingües: no se detallan idiomas concretos en la información disponible.
- Compatibilidad con harnesses y herramientas de desarrollo populares para integración en stacks existentes.

## Casos de uso

- Agentes de coding autónomo en terminal: el modelo puede planificar y ejecutar tareas de modificación de código en entornos de línea de comandos, manejando retroalimentación del entorno y completando flujos multi-paso gracias a su entrenamiento específico en agentic terminal coding y su contexto de 262K tokens.
- Análisis de documentos técnicos y diagramas STEM: con su codificador de visión nativo, puede interpretar figuras, esquemas y documentos escaneados, extrayendo información estructurada para pipelines de investigación o ingeniería.
- Procesamiento de vídeo de larga duración: su soporte para vídeos de hasta una hora permite resumir, indexar o responder preguntas sobre grabaciones de reuniones, clases o demos técnicas sin fragmentación manual.
- Automatización de tareas profesionales multi-paso: con planificación autónoma y manejo de feedback, puede encargarse de flujos como generación de informes, extracción de datos de fuentes heterogéneas o validación de resultados intermedios.
- Asistente de investigación con razonamiento controlable: el parámetro `reasoning_effort` permite ajustar la profundidad de razonamiento por consulta, útil para equilibrar latencia y calidad en aplicaciones de análisis científico.
- Despliegue en producción con vLLM o SGLang: la cuantización FP8 con bloques de 128 y la compatibilidad con estos motores permiten servir el modelo con menor huella de VRAM que la versión BF16, manteniendo rendimiento casi idéntico, adecuado para APIs internas de atención al cliente o asistentes corporativos.
- Integración en CI/CD para revisión de código: su soporte de tool calling y su capacidad de razonamiento multi-paso permiten conectarlo a pipelines que analizan pull requests, ejecutan tests y proponen correcciones.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero el contenido proporcionado está truncado y solo muestra el encabezado de la sección "Coding" y la primera fila ("Agentic terminal coding") sin valores numéricos. No se han podido extraer resultados completos de benchmarks en la información disponible.

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Agentic terminal coding | No disponible (dato truncado) | No disponible | No disponible | No disponible | No disponible |

No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 30,9 GB en FP8, por lo que se necesita al menos ~31 GB de VRAM solo para los pesos, más overhead de KV cache y activaciones. Para contexto largo (262K tokens) el requisito de VRAM crece significativamente.
- GPU recomendadas: H100 (80 GB), A100 (80 GB) o GPUs con 48 GB o más para contextos moderados. Para contexto completo de 262K se recomienda H100/H200 o múltiples GPUs.
- Cabe en GPU consumer: en RTX 4090 (24 GB) no cabe en FP8 sin offloading; sería necesario cuantizar a 4 bits (GGUF/AWQ) o usar offloading a CPU/VRAM.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang, TokenSpeed (según la model card). No se menciona soporte explícito de llama.cpp u Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles. La inclusión de MTP (Multi-Token Prediction) sugiere mejoras de throughput mediante decodificación especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-FP8 (este) | 27B denso | 262K (ext. 1M) | Apache 2.0 | Safetensors FP8 | Multimodal, agentic, thinking control |
| Qwen3.6-27B | 27B (no confirmado) | No disponible | No disponible | No disponible | Generación anterior de la familia Qwen |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible | Versión "Plus" de la familia |
| Muse Glimmer-30B | 30B (aprox.) | No disponible | No disponible | No disponible | Competidor de tamaño similar |
| Opus4.6 Max | No disponible | No disponible | No disponible | No disponible | Modelo propietario de referencia |

Los datos de rendimiento comparativo no están disponibles en la información proporcionada (tabla truncada). La comparativa se limita a parámetros y contexto conocidos.

## Limitaciones y advertencias

- La model card no detalla sesgos conocidos ni evaluación de seguridad; se desconoce el comportamiento en dominios sensibles.
- Riesgo de alucinación inherente a modelos de lenguaje de gran escala; el modo de razonamiento activado por defecto puede aumentar la latencia y el consumo de tokens.
- Idiomas soportados no especificados: no se puede garantizar calidad multilingüe fuera de los idiomas principales de Qwen.
- La cuantización FP8, aunque el autor afirma rendimiento casi idéntico, puede introducir degradaciones menores no cuantificadas en la información disponible.
- El contexto extensible a 1M tokens no está verificado en esta variante; la model card indica 262K nativos y extensión hasta 1M, pero no se detalla el método de extensión ni su coste.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen3.8-27B por si existen condiciones adicionales no reflejadas en esta variante.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria de la calidad de la cuantización.
- El contenido de benchmarks está truncado en la información disponible, lo que impide verificar las afirmaciones de rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/nokkela-ai/Qwen3.8-27B-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Qwen Cloud (servicio gestionado): https://www.qwencloud.com
- Overview de Qwen3.8-27B en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
