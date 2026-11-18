# Qwen/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión desarrollado por Qwen (Alibaba), presentado como la generación más capaz de la familia abierta Qwen hasta la fecha. Se construye sobre la base arquitectónica de Qwen3.5 y se posiciona como un modelo denso de 27.781 millones de parámetros, orientado a despliegue compacto, que integra comprensión nativa de imagen y vídeo junto con control flexible del razonamiento. Resuelve el problema de llevar capacidades de agentes de largo horizonte, código y trabajo profesional a un tamaño manejable en infraestructura propia.

La arquitectura combina capas de atención lineal Gated DeltaNet con capas de atención con compuertas (Gated Attention) en un diseño híbrido de 64 capas, e incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos. El contexto nativo es de 262.144 tokens, extensible hasta 1.000.000, lo que lo sitúa en la franja alta de ventanas de contexto para modelos densos de su tamaño. Su licencia Apache 2.0 y la disponibilidad de pesos en safetensors para transformers, vLLM, SGLang y TokenSpeed lo hacen relevante para equipos que necesitan un modelo multimodal abierto con garantías de uso comercial.

El modelo está publicado en Hugging Face con más de 6,9 millones de descargas y 20.454 likes, lo que refleja una adopción amplia de la comunidad. La versión alojada en Qwen Cloud ofrecerá 1M de contexto por defecto y herramientas integradas oficiales, según la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con codificador de visión; layout 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 27.781.427.952 (27,78B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (formato Hugging Face Transformers) |

Datos adicionales de arquitectura: dimensión oculta de 5.120, embedding de tokens de 248.320 (con padding), 64 capas, FFN con dimensión intermedia de 17.408, salida LM de 248.320. Gated DeltaNet con 48 cabezas de atención lineal para V y 16 para QK, dimensión de cabeza 128. Gated Attention con 24 cabezas para Q y 4 para KV, dimensión de cabeza 256 y dimensión de RoPE de 64. Tamaño del repositorio: 55,6 GB.

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con codificador de visión, entrenado en dos etapas: pre-entrenamiento y post-entrenamiento. La innovación estructural principal es la disposición híbrida de capas: por cada bloque de cuatro capas, tres usan Gated DeltaNet (atención lineal con estado recurrente) y una usa Gated Attention (atención completa con compuertas y RoPE). Este diseño busca reducir el coste computacional y de memoria en contextos largos sin renunciar a la calidad de recuperación de la atención completa. La inclusión de MTP (Multi-Token Prediction) entrenado con múltiples pasos habilita decodificación especulativa y acelera la generación.

La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas concretas de RLHF o DPO, por lo que esos datos deben considerarse no disponibles. Sí se indica que el modelo ha pasado por post-entrenamiento y que incorpora control flexible del pensamiento: el modo thinking está activo por defecto, puede desactivarse por petición, la profundidad de razonamiento se ajusta con `reasoning_effort` y el contexto de razonamiento de mensajes históricos se conserva mediante `preserve_thinking`. La comprensión de imagen y vídeo es nativa, no un adaptador añadido a posteriori, e incluye vídeos de hasta una hora de duración según la documentación del autor.

## Capacidades

- Generación de texto y razonamiento con modo thinking activable o desactivable por petición y profundidad de razonamiento ajustable mediante `reasoning_effort`.
- Razonamiento multi-paso con retención del contexto de razonamiento histórico (`preserve_thinking`), útil en conversaciones largas y tareas encadenadas.
- Programación y trabajo agéntico de terminal: la model card cita mejoras en coding, trabajo profesional, investigación y tareas agénticas de largo horizonte, con evaluación específica en Terminal Bench 2.1 (Terminus).
- Ejecución de agentes autónomos: planificación autónoma reforzada y mejor manejo de la retroalimentación del entorno para completar tareas de extremo a extremo.
- Comprensión de imagen y vídeo nativa: diagramas STEM, documentos y vídeos de hasta una hora.
- Compatibilidad con harnesses y herramientas de desarrollo populares, según la model card.
- Capacidades multilingües: no se detalla la lista de idiomas soportados en la información disponible.
- Soporte de tool calling / function calling: no se confirma explícitamente en la información proporcionada, aunque la orientación agéntica y la mención de "herramientas integradas oficiales" en la versión alojada sugieren soporte en ese contexto.

## Casos de uso

- Automatización de tareas de terminal y CI/CD: el modelo está evaluado en Terminal Bench 2.1 (Terminus) y declara mejoras en coding agéntico, por lo que puede integrarse en pipelines que ejecutan comandos, interpretan salidas y corrigen errores de forma autónoma en entornos de desarrollo.
- Agentes de largo horizonte: con 262.144 tokens de contexto nativo y retención del razonamiento histórico, puede mantener el estado de una tarea compleja a lo largo de decenas de pasos sin perder el hilo, lo que encaja en automatización de flujos de trabajo con múltiples herramientas.
- Análisis de documentos técnicos y diagramas STEM: al ser un modelo visión-lenguaje nativo, puede extraer información de figuras, esquemas y documentación científica y responder preguntas sobre ellos en el mismo contexto que el texto.
- Procesamiento de vídeo de larga duración: la comprensión de vídeos de hasta una hora permite resumir reuniones, analizar grabaciones de clases o revisar material audiovisual extenso sin segmentación manual previa.
- Asistencia a investigación y trabajo profesional: la model card cita mejoras específicas en investigación y trabajo profesional, aplicables a revisión de literatura, redacción técnica y síntesis de información densa.
- Despliegue en infraestructura propia con requisitos de licencia permisiva: la licencia Apache 2.0 permite uso comercial sin restricciones de atribución adicionales, adecuado para productos que necesitan modificar o redistribuir el modelo.
- Servicio gestionado sin mantenimiento: para equipos que no quieren operar infraestructura, la versión alojada en Qwen Cloud ofrecerá 1M de contexto por defecto y herramientas oficiales integradas.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, organizada por categorías (Coding, entre otras). Sin embargo, la información proporcionada solo contiene la cabecera de la tabla y el nombre del primer benchmark (Terminal Bench 2.1, Terminus); los valores numéricos no están disponibles en el material recibido.

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27,78B parámetros en safetensors de precisión completa, el peso del modelo ocupa aproximadamente 55,6 GB; se necesita al menos esa cantidad de VRAM más margen para KV cache y activaciones.
- En cuantización de 8 bits, la estimación ronda los 28-30 GB de VRAM; en 4 bits, alrededor de 15-17 GB. Estas cifras son estimaciones por tamaño de parámetros, no datos publicados por el autor.
- GPU recomendadas: para precisión completa, A100 80GB o H100 80GB. Para cuantizaciones reducidas, RTX 4090 (24 GB) o A6000 (48 GB) pueden ser viables en 8 o 4 bits.
- Cabe en GPU de consumo: sí, en configuraciones cuantizadas de 4 u 8 bits en GPUs con 16-24 GB, aunque el contexto largo de 262K tokens incrementa sustancialmente la memoria de KV cache.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card. No se mencionan llama.cpp ni Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada. La incorporación de MTP sugiere decodificación especulativa con aceleración de generación, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27,78B denso | 262.144 nativo, hasta 1M | Apache 2.0 | Sí (imagen y vídeo) | Hugging Face, Qwen Cloud (próximamente) |
| Qwen3.6-27B | No disponible | No disponible | No disponible | No disponible | Referenciado en la model card |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible | Referenciado en la model card |
| Muse Glimmer-30B | ~30B (por nombre) | No disponible | No disponible | No disponible | Referenciado en la model card |
| Opus4.6 Max | No disponible | No disponible | No disponible | No disponible | Referenciado en la model card |

Los modelos comparables citados por el autor aparecen en la tabla de benchmarks, pero la información proporcionada no incluye sus especificaciones técnicas ni sus resultados numéricos, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información proporcionada; como en cualquier modelo entrenado con datos web a gran escala, cabe esperar sesgos sociales y culturales no cuantificados.
- Riesgo de alucinación: no se publica ninguna evaluación específica de factualidad ni tasas de alucinación en la model card.
- Limitaciones de contexto: el contexto nativo es de 262.144 tokens; la extensión a 1M se describe como "extensible", no como comportamiento nativo, y el rendimiento en esa extensión no está documentado.
- Idiomas: la lista de idiomas soportados no está disponible, lo que impide garantizar calidad en castellano u otras lenguas distintas del inglés y el chino sin evaluación previa.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución sin restricciones adicionales, pero conviene verificar las condiciones de la versión alojada en Qwen Cloud, que puede regirse por términos distintos.
- Producción: el modo thinking activo por defecto incrementa la latencia y el consumo de tokens; debe desactivarse o limitarse con `reasoning_effort` en escenarios de baja latencia. El contexto largo de 262K tokens exige planificación cuidadosa de la memoria de KV cache.
- Tool calling: no se confirma explícitamente su soporte en la información disponible, por lo que debe validarse antes de diseñar arquitecturas agénticas dependientes de esta función.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Qwen/Qwen3.8-27B
- Página del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
- Qwen Cloud: https://www.qwencloud.com
- Chat oficial de Qwen: https://chat.qwen.ai/
- Portal de Qwen: https://qwen.ai/home
- Qwen Chat: https://qwen.ai/qwenchat
- Wikipedia (en): https://en.wikipedia.org/wiki/Qwen
- Wikipedia (fr): https://fr.wikipedia.org/wiki/Qwen
