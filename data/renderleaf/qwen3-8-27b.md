# Renderleaf/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión, publicado por el usuario Renderleaf en Hugging Face bajo licencia Apache 2.0. Según la model card, forma parte de la familia Qwen3.8 y se presenta como un modelo denso de 27 000 millones de parámetros, nativo multimodal (imagen y vídeo), construido sobre la base arquitectónica de Qwen3.5. El repositorio contiene pesos en formato safetensors para Transformers, con un tamaño total de 55,6 GB y 27 781 427 952 parámetros reales según los metadatos de safetensors.

El modelo está orientado a tareas de codificación, trabajo profesional, investigación y tareas agénticas de horizonte largo, con control flexible del modo de razonamiento (thinking mode) y comprensión nativa de imágenes y vídeos. Declara una longitud de contexto nativa de 262 144 tokens, extensible hasta 1 000 000, lo que lo sitúa en la categoría de contexto muy largo.

Es relevante ahora porque, según la model card, la serie Qwen3.5 y Qwen3.6 ya contaban con adopción comunitaria amplia, y Qwen3.8 se presenta como la generación más capaz de la familia de modelos abiertos Qwen hasta la fecha. No obstante, la información disponible es limitada: el repositorio no tiene descargas ni likes, no se listan idiomas soportados y la tabla de benchmarks de la model card está truncada, por lo que muchos datos concretos no pueden verificarse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador de visión; layout híbrido de atención lineal (Gated DeltaNet) y atención con compuertas (Gated Attention) |
| Parámetros totales | 27 781 427 952 (27B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos; extensible hasta 1 000 000 |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers); compatible con vLLM, SGLang y TokenSpeed según la model card |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con codificador de visión integrado. La model card detalla una dimensión oculta de 5120, 64 capas y un layout oculto de 16 bloques de la forma 3 × (Gated DeltaNet → FFN) seguido de 1 × (Gated Attention → FFN). El componente Gated DeltaNet emplea 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. El componente Gated Attention usa 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y dimensión de Rotary Position Embedding de 64. La red feed-forward tiene dimensión intermedia de 17 408, y el embedding de tokens y la salida LM son de 248 320 (con padding).

El modelo incluye Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que puede aprovecharse para decodificación especulativa. El entrenamiento consta de fases de pre-entrenamiento y post-entrenamiento, aunque la model card no especifica el número de tokens, la composición del dataset ni si se emplearon RLHF o DPO. Sí menciona control flexible del razonamiento: thinking mode activado por defecto, desactivable por petición, con ajuste de profundidad mediante `reasoning_effort` y retención del contexto de razonamiento histórico mediante `preserve_thinking`.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento configurable (on/off por petición y profundidad ajustable con `reasoning_effort`).
- Codificación, incluyendo tareas de codificación agéntica en terminal (la model card cita Terminal Bench 2.1).
- Comprensión nativa de imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Ejecución agéntica: planificación autónoma y manejo de retroalimentación del entorno para completar tareas de extremo a extremo.
- Soporte de tool calling / function calling: la model card menciona herramientas integradas oficiales en la versión alojada y compatibilidad con harnesses y herramientas de desarrollo populares.
- Multilingüismo: no disponible (no se listan idiomas en los metadatos).
- Retención de contexto de razonamiento entre mensajes históricos mediante `preserve_thinking`.
- Compatibilidad con Transformers, vLLM, SGLang y TokenSpeed.

## Casos de uso

- Codificación agéntica en terminal: el modelo puede ejecutar tareas de codificación de múltiples pasos en entornos de terminal, con planificación autónoma y manejo de la retroalimentación del entorno, adecuado para pipelines de CI/CD y automatización de parches.
- Asistencia en investigación sobre documentos: gracias a la comprensión nativa de imágenes y a su contexto de 262 144 tokens, puede analizar documentos escaneados, diagramas STEM y figuras junto con texto largo en una sola sesión.
- Análisis de vídeo de larga duración: la model card indica soporte para vídeos de hasta una hora, útil para resumen y extracción de información de grabaciones, clases o reuniones.
- Agentes autónomos de larga duración: el control de `reasoning_effort` y `preserve_thinking` permite ajustar el coste de razonamiento y mantener el hilo de tareas multi-paso prolongadas.
- Trabajo profesional asistido: generación y revisión de documentos técnicos, informes y material de investigación con razonamiento desactivable para respuestas rápidas.
- Integración en stacks de desarrollo existentes: la model card destaca compatibilidad con harnesses y herramientas populares, lo que facilita su incorporación en flujos de trabajo ya establecidos.
- Despliegue autoalojado con vLLM, SGLang o TokenSpeed: al publicarse en safetensors y con licencia Apache 2.0, puede servirse en infraestructura propia sin coste de licencia.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks de rendimiento en texto que compara Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, con una sección de codificación que cita Terminal Bench 2.1 (Terminus). Sin embargo, la información proporcionada está truncada y no incluye los valores numéricos de los resultados. Por tanto:

No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el tamaño del repositorio (55,6 GB en safetensors), la inferencia en precisión completa requeriría al menos del orden de 56 GB de VRAM solo para pesos, sin contar caché KV ni el codificador de visión; las cuantizaciones reducirían este requisito, pero no se han publicado tipos de cuantización.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, un modelo de 27B en precisión completa no cabe en GPU de consumo de 24 GB; sería necesario recurrir a cuantización o a GPUs de centro de datos con mayor memoria.
- ¿Cabe en GPU de consumo? No en precisión completa; con cuantización podría ser posible en GPUs de 24 GB o más, pero no se dispone de datos oficiales de cuantización.
- Opciones de despliegue: Transformers, vLLM, SGLang y TokenSpeed, según la model card.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La model card proporciona una comparativa directa con los siguientes modelos, aunque sin los valores numéricos de los benchmarks:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B | 27B (denso) | 262 144 nativos, hasta 1 000 000 | Apache 2.0 | Pesos en Hugging Face (Renderleaf) |
| Qwen3.6-27B | no disponible | no disponible | no disponible | no disponible |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible |
| Muse Glimmer-30B | 30B (según nombre) | no disponible | no disponible | no disponible |
| Opus4.6 Max | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento numéricos para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- La tabla de benchmarks de la model card está truncada en la información disponible; no se pueden verificar los resultados declarados.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-24), lo que sugiere que no ha sido validado por la comunidad.
- El autor del repositorio es "Renderleaf", no el equipo oficial de Qwen; la model card hace referencia a Qwen Cloud y a la familia Qwen, pero conviene verificar la procedencia de los pesos antes de usarlos en producción.
- No se listan idiomas soportados, por lo que el rendimiento multilingüe es desconocido.
- No se especifican los datos de entrenamiento (tokens, composición, alineación), lo que dificulta evaluar sesgos y riesgos de alucinación.
- Riesgo de alucinación: no cuantificado en la información disponible; como en cualquier LLM, debe validarse la salida en aplicaciones críticas.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y verificarse que los pesos distribuidos cumplen efectivamente dicha licencia.
- El contexto extensible a 1 000 000 tokens se anuncia para la versión alojada en Qwen Cloud; no se confirma que la extensión esté disponible en los pesos abiertos.
- No se han publicado tipos de cuantización ni requisitos de hardware oficiales, lo que complica la planificación de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Renderleaf/Qwen3.8-27B
- Qwen Cloud (servicio alojado mencionado en la model card): https://www.qwencloud.com
- Overview de Qwen3.8-27B en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
