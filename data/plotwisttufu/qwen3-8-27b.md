# PLOTWISTTUFU/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión, publicado en Hugging Face por el usuario PLOTWISTTUFU bajo licencia Apache 2.0. Según su model card, se presenta como parte de la familia Qwen3.8, construida sobre la base arquitectónica de Qwen3.5, y está orientado a tareas de codificación, trabajo profesional, investigación y flujos agénticos de largo horizonte. El modelo es nativo multimodal (image-text-to-text), con capacidad declarada para comprender imágenes y vídeos, incluyendo vídeos de hasta una hora de duración.

El modelo tiene 27.781.427.952 parámetros según los pesos en safetensors, con una dimensión oculta de 5120, 64 capas y un vocabulario de 248.320 tokens (con padding). Su contexto nativo es de 262.144 tokens, extensible hasta 1.000.000 según la documentación del autor. Incorpora un diseño híbrido de atención (Gated DeltaNet con atención lineal y Gated Attention), además de Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que puede acelerar la decodificación.

La relevancia del modelo radica en su propuesta de combinar un tamaño compacto (27B, denso) con capacidades multimodales y agénticas, control flexible del "pensamiento" (thinking mode con `reasoning_effort` y `preserve_thinking`) y compatibilidad con motores de inferencia como vLLM, SGLang y TokenSpeed. No obstante, el repositorio presenta señales de fiabilidad limitada: 0 descargas, 0 likes, fecha de creación en 2026 y referencias a servicios y modelos (Qwen Cloud, Qwen3.6, Qwen3.7-Plus, Muse Glimmer-30B, Opus4.6 Max) que no pueden verificarse con la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrida Gated DeltaNet (atención lineal) + Gated Attention; tag `qwen3_5` |
| Parametros totales | 27.781.427.952 (27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers, vLLM, SGLang, TokenSpeed) |

Otros datos técnicos declarados: hidden dimension 5120; 64 capas; layout 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)); Gated DeltaNet con 48 cabezas lineales para V y 16 para QK, dimensión de cabeza 128; Gated Attention con 24 cabezas para Q y 4 para KV, dimensión de cabeza 256 y RoPE de 64; FFN con dimensión intermedia 17.408; token embedding y LM output de 248.320 (con padding); MTP entrenado con múltiples pasos. Tamaño del repositorio: 55,6 GB.

## Arquitectura y entrenamiento

La arquitectura combina capas de atención lineal (Gated DeltaNet) con capas de atención clásica con gating (Gated Attention) en un patrón repetido de 16 bloques, cada uno con tres subbloques de DeltaNet seguidos de uno de atención gated. Este diseño híbrido busca reducir el coste computacional en contextos largos manteniendo la calidad de la atención completa. El modelo incluye un codificador de visión para el procesamiento de imágenes y vídeo, y emplea Multi-Token Prediction (MTP) entrenado con varios pasos, una técnica que puede habilitar decodificación especulativa o predicción de múltiples tokens por paso.

El modelo card indica que ha pasado por pre-entrenamiento y post-entrenamiento, pero no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF, DPO u otras técnicas de alineación. Tampoco se especifican las etapas concretas de post-entrenamiento ni los datos multimodales utilizados. Esta información no está disponible en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado por defecto, desactivable por petición.
- Control de profundidad de razonamiento mediante el parámetro `reasoning_effort`.
- Retención del contexto de razonamiento de mensajes históricos mediante `preserve_thinking`.
- Comprensión nativa de imágenes y vídeos (image-text-to-text), incluyendo diagramas STEM, documentos y vídeos de hasta una hora.
- Codificación y tareas de terminal agénticas (según benchmarks declarados, ver sección siguiente).
- Planificación autónoma y manejo de retroalimentación del entorno para tareas agénticas de extremo a extremo.
- Compatibilidad con harnesses y herramientas de desarrollo populares (sin detallar cuáles).
- Soporte de tool calling / function calling: no se detalla explícitamente en la información disponible, aunque el enfoque agéntico lo sugiere.
- Capacidades multilingües: no disponible.

## Casos de uso

- Automatización de tareas de terminal y CI/CD: el modelo declara capacidades agénticas de terminal (Terminal Bench 2.1) y planificación autónoma, lo que permite integrarlo en pipelines que ejecuten comandos, interpreten salidas y corrijan errores de forma iterativa.
- Análisis de documentos técnicos y diagramas STEM: gracias al codificador de visión nativo, puede procesar capturas de documentación, diagramas de arquitectura o gráficos científicos y responder preguntas sobre ellos en conversaciones multi-turno con contexto de hasta 262.144 tokens.
- Procesamiento de vídeo de larga duración: su soporte declarado para vídeos de hasta una hora permite resumir, extraer eventos o responder preguntas sobre grabaciones de reuniones, clases o monitorización.
- Asistencia a investigación y revisión de literatura: con contexto extensible a 1M tokens, puede ingerir artículos completos, comparar metodologías y generar síntesis, siempre con verificación humana por el riesgo de alucinación.
- Agentes de soporte técnico especializado: el modo thinking configurable (`reasoning_effort`) permite ajustar la profundidad de razonamiento según la complejidad de la consulta, equilibrando latencia y precisión en conversaciones multi-turno.
- Generación y refactorización de código en producción: su orientación a codificación y compatibilidad con vLLM/SGLang facilitan el despliegue como servicio de autocompletado o revisión de código, aunque requiere validación y tests automatizados.
- Despliegue en infraestructura propia: el tamaño de 27B permite servirse en GPUs de gama alta (no consumer de forma cómoda) con cuantización, evitando dependencia de APIs externas.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa (parcialmente truncada) con resultados en Terminal Bench 2.1 (Terminus) para Qwen3.8-27B frente a Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max. Los valores numéricos de esa tabla no están disponibles en la información proporcionada (el contenido está cortado), por lo que no se reproducen. No se han publicado en la información disponible resultados verificables de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en los 27.781.427.952 parámetros y el tamaño del repo (55,6 GB en safetensors, probablemente en BF16), se necesitarían aproximadamente 56 GB en precisión nativa; con cuantización a 8 bits rondaría 28 GB y a 4 bits unos 14-16 GB, aunque estos cálculos no están confirmados por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría esperar A100 80 GB, H100 80 GB o múltiples GPUs; en consumer GPU requeriría cuantización agresiva (por ejemplo, RTX 4090 24 GB con 4 bits, sujeto a verificación).
- Despliegue: el autor declara compatibilidad con Hugging Face Transformers, vLLM, SGLang y TokenSpeed. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B | 27B (denso) | 262.144 nativo / 1M extensible | Apache 2.0 | Hugging Face (repo con 0 descargas) |
| Qwen3.6-27B | no disponible | no disponible | no disponible | mencionado en model card, sin enlace |
| Muse Glimmer-30B | ~30B (según nombre) | no disponible | no disponible | mencionado en model card, sin enlace |
| Opus4.6 Max | no disponible | no disponible | no disponible | mencionado como comparativa; probablemente propietario |

Los modelos comparables citados en la propia model card no incluyen especificaciones verificables ni enlaces en la información disponible. No se dispone de datos de rendimiento numéricos para establecer una comparación rigurosa.

## Limitaciones y advertencias

- El repositorio presenta 0 descargas y 0 likes, con fecha de creación en 2026-11-19; la autoría (PLOTWISTTUFU) no coincide con la organización oficial Qwen, lo que plantea dudas sobre la procedencia y verificación de los pesos.
- La model card incluye enlaces y referencias a servicios (Qwen Cloud) y modelos (Qwen3.7-Plus, Opus4.6 Max) que no pueden contrastarse con la información disponible.
- No se especifican los idiomas soportados, lo que impide garantizar un rendimiento adecuado en castellano u otros idiomas.
- No se documentan sesgos conocidos ni el proceso de alineación (RLHF/DPO), por lo que el riesgo de alucinación y de respuestas sesgadas no puede acotarse.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar la autenticidad de los pesos antes de usarlos en producción.
- El contexto extensible a 1M tokens se declara para la versión hospedada en Qwen Cloud, no necesariamente para los pesos locales.
- El tamaño de 55,6 GB en safetensors implica requisitos de hardware significativos; el despliegue en consumer GPU requiere cuantización no documentada.

## Enlaces

- Hugging Face: https://huggingface.co/PLOTWISTTUFU/Qwen3.8-27B
- Qwen Cloud (referencia en model card): https://www.qwencloud.com
- Página del modelo en Qwen Cloud (referencia en model card): https://www.qwencloud.com/models/qwen3.8-27b
