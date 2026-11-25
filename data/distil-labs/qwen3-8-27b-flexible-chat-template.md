# distil-labs/Qwen3.8-27B-flexible-chat-template

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión desarrollado por el equipo Qwen (Alibaba), distribuido en el repositorio de Hugging Face `distil-labs/Qwen3.8-27B-flexible-chat-template`. Se trata de un modelo denso de 27.781.427.952 parámetros (aproximadamente 27,8 mil millones) que combina comprensión nativa de imagen y vídeo con generación de texto, razonamiento y ejecución de tareas agénticas de largo horizonte. Supone la generación más reciente de la familia open-model de Qwen, construida sobre la base arquitectónica de Qwen3.5.

El modelo destaca por su arquitectura híbrida de atención: alterna bloques de Gated DeltaNet (atención lineal) con bloques de Gated Attention clásica en un patrón de 16 repeticiones de 3 capas DeltaNet más 1 capa de atención con compuerta. Incorpora además Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que habilita decodificación especulativa nativa. Su ventana de contexto es de 262.144 tokens de forma nativa, extensible hasta 1.000.000.

Es relevante ahora porque ofrece capacidades de razonamiento controlable (modo thinking activado por defecto, desactivable por petición, con ajuste de profundidad mediante `reasoning_effort` y retención de contexto de razonamiento histórico vía `preserve_thinking`) en un tamaño compacto y desplegable, con licencia Apache 2.0 y compatibilidad declarada con Transformers, vLLM, SGLang y TokenSpeed.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrida Gated DeltaNet (atención lineal) + Gated Attention; 64 capas en layout 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 27.781.427.952 (≈27,8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Hugging Face Transformers) |

Datos arquitectónicos adicionales: dimensión oculta de 5120; embeddings de tokens de 248.320 (con padding); salida LM de 248.320 (con padding); FFN con dimensión intermedia de 17.408. En Gated DeltaNet: 48 cabezas de atención lineal para V y 16 para QK, dimensión de cabeza 128. En Gated Attention: 24 cabezas para Q y 4 para KV, dimensión de cabeza 256, dimensión de RoPE 64. Tamaño del repositorio: 55,6 GB.

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida que intercala capas de Gated DeltaNet —un mecanismo de atención lineal con estado recurrente— con capas de Gated Attention clásica. El layout concreto es 16 repeticiones de tres bloques DeltaNet seguidos de un bloque de atención con compuerta, cada uno acompañado de su FFN. Esta combinación busca reducir el coste computacional y de memoria de la atención sobre contextos muy largos manteniendo la capacidad expresiva de la atención completa en puntos estratégicos de la red. El codificador de visión añade comprensión nativa de imagen y vídeo, incluyendo vídeos de hasta una hora de duración según la model card.

El entrenamiento comprende fases de pre-entrenamiento y post-entrenamiento. El modelo incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que permite decodificación especulativa y aceleración de la generación. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas concretas de RLHF o DPO; esa información no está disponible en los datos proporcionados.

## Capacidades

- Generación de texto y razonamiento con modo thinking controlable: activado por defecto, desactivable por petición, con profundidad ajustable mediante `reasoning_effort` y retención del contexto de razonamiento histórico con `preserve_thinking`.
- Comprensión nativa de imagen y vídeo (image-text-to-text): diagramas STEM, documentos y vídeos de hasta una hora.
- Codificación y tareas de terminal agénticas (evaluado en Terminal Bench 2.1).
- Ejecución de tareas agénticas de largo horizonte: planificación autónoma y manejo de retroalimentación del entorno para completar tareas de extremo a extremo.
- Compatibilidad con harnesses y herramientas de desarrollo populares para integración en stacks existentes.
- Decodificación especulativa nativa vía MTP (Multi-Token Prediction).
- Soporte de tool calling / function calling: la model card menciona herramientas integradas oficiales en la versión alojada de Qwen Cloud; no se detalla el soporte exacto en los pesos abiertos.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Agentes de codificación autónomos: el modelo puede operar en entornos de terminal y resolver tareas de programación de múltiples pasos, con planificación autónoma y manejo de la retroalimentación del entorno, adecuado para pipelines de CI/CD y asistentes de desarrollo.
- Análisis de documentos técnicos y diagramas STEM: gracias a su codificador de visión nativo, puede interpretar figuras, esquemas y documentación técnica junto con el texto asociado en una misma ventana de contexto.
- Procesamiento de vídeo de larga duración: con soporte para vídeos de hasta una hora, resulta apto para resumen, búsqueda de eventos y extracción de información en grabaciones extensas.
- Investigación asistida: el modo thinking con profundidad ajustable permite equilibrar coste y calidad de razonamiento en tareas de análisis, síntesis y revisión de literatura.
- Atención al cliente multi-turno: la ventana de 262.144 tokens nativos permite mantener conversaciones extensas con historial completo y documentación de referencia en contexto.
- Automatización de flujos profesionales: tareas de oficina y trabajo profesional con razonamiento controlable, donde se puede desactivar el thinking para respuestas rápidas o activarlo para decisiones complejas.
- Despliegue en infraestructura propia: al ser un modelo denso de 27,8B con licencia Apache 2.0 y soporte en vLLM, SGLang y TokenSpeed, puede autoalojarse sin depender de API externa.

## Benchmarks y rendimiento

La model card incluye resultados parciales de la tabla de rendimiento en texto. Los datos completos de la tabla no están disponibles en la información proporcionada; a continuación se recogen los valores disponibles.

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus), agentic terminal coding | 73,0 | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto o visión.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (27,8B parámetros), en FP16/BF16 los pesos ocuparían aproximadamente 55,6 GB, coincidiendo con el tamaño del repositorio; en cuantizaciones de 8 bits rondaría los 28 GB y en 4 bits unos 14 GB, aunque estos valores son estimaciones y no datos publicados por el autor.
- GPU recomendadas: no disponible en la información proporcionada. Para FP16 se requerirían aceleradores con al menos 80 GB de memoria (A100 80GB, H100) o múltiples GPU.
- Cabe en GPU de consumo: no confirmado por el autor; con cuantización agresiva podría plantearse en GPUs de 24 GB, pero no hay datos oficiales que lo respalden.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B | ≈27,8B (denso) | 262.144 nativos, hasta 1.000.000 | Apache 2.0 | Visión y vídeo nativos, MTP, thinking controlable |
| Qwen3.6-27B | no disponible | no disponible | no disponible | Generación anterior de la familia; incluido en la tabla de benchmarks del autor |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | Variante de la familia Qwen; incluido en la tabla de benchmarks del autor |
| Muse Glimmer-30B | no disponible | no disponible | no disponible | Modelo comparable de ~30B citado por el autor |
| Opus4.6 Max | no disponible | no disponible | no disponible | Referencia de comparación citada por el autor |

Los datos de parámetros, contexto y licencia de los modelos comparables no están disponibles en la información proporcionada, salvo el nombre y la referencia en la tabla de benchmarks.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado por el autor; como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en modo thinking desactivado.
- Limitaciones de contexto o idioma: la lista de idiomas soportados no está disponible; el contexto nativo es de 262.144 tokens y la extensión a 1.000.000 se presenta como capacidad, sin datos publicados sobre degradación de rendimiento en esa extensión.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con las obligaciones habituales de atribución y aviso de licencia.
- Caveats para producción: el repositorio pertenece a `distil-labs` y no al espacio oficial de Qwen; conviene verificar la procedencia e integridad de los pesos antes de desplegarlos. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que no aporta señal de validación comunitaria. La información sobre cuantizaciones disponibles y requisitos de hardware no está publicada. La versión alojada en Qwen Cloud con contexto de 1M por defecto y herramientas integradas se anuncia como "coming soon".

## Enlaces

- Hugging Face: https://huggingface.co/distil-labs/Qwen3.8-27B-flexible-chat-template
- Qwen Cloud, página del modelo: https://www.qwencloud.com/models/qwen3.8-27b
- Qwen Cloud (servicio API oficial): https://www.qwencloud.com
