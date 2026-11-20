# Ramh2r/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje y visión de tipo causal (image-text-to-text) publicado en Hugging Face bajo el identificador Ramh2r/Qwen3.8-27B. Según su model card, se presenta como la generación más capaz de la familia Qwen de modelos abiertos, construida sobre la base arquitectónica de Qwen3.5 y orientada a tareas de programación, trabajo profesional, investigación y tareas agénticas de largo horizonte. El modelo combina un transformer con capas de atención lineal (Gated DeltaNet) y atención completa (Gated Attention) en un patrón híbrido, junto con un codificador visual nativo para comprensión de imágenes y vídeo.

Con 27.781.427.952 parámetros totales (dato real extraído de los safetensors) y una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.000.000, el modelo se posiciona en la categoría de modelos densos de ~27B con capacidades multimodales. Incorpora control flexible del modo de razonamiento (thinking mode activado por defecto, desactivable por petición, con ajuste de profundidad mediante `reasoning_effort` y retención de contexto de razonamiento vía `preserve_thinking`), además de Multi-Token Prediction (MTP) entrenado con múltiples pasos.

La relevancia del modelo radica en su orientación a tareas agénticas de extremo a extremo y a la integración en herramientas de desarrollo populares, con licencia Apache 2.0 y compatibilidad declarada con Transformers, vLLM, SGLang y TokenSpeed. No obstante, el repositorio presenta cero descargas y cero likes en el momento de la consulta, y la model card incluye referencias a servicios y comparativas que no pueden verificarse de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; layout híbrido 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 27.781.427.952 (27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 55,6 GB); compatible con Transformers, vLLM, SGLang y TokenSpeed |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer causal con codificador visual, organizada en 64 capas con dimensión oculta de 5120 y un layout híbrido que alterna bloques de atención lineal y atención completa: por cada grupo de 16 capas se repiten tres bloques de Gated DeltaNet seguidos de un bloque de Gated Attention. La Gated DeltaNet utiliza 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. La Gated Attention emplea 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y dimensión de Rotary Position Embedding de 64. La red feed-forward tiene dimensión intermedia de 17.408, y el embedding de tokens y la salida LM tienen 248.320 entradas (con padding).

El entrenamiento comprende fases de pre-entrenamiento y post-entrenamiento, e incluye Multi-Token Prediction (MTP) entrenado con múltiples pasos. La model card menciona mejoras en planificación autónoma y manejo de retroalimentación del entorno, así como un modo de razonamiento controlable, pero no especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas concretas de RLHF o DPO. Tampoco se detalla la innovación de decodificación especulativa más allá de la mención al MTP.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento flexible: activado por defecto, desactivable por petición, con profundidad ajustable mediante `reasoning_effort` y retención de contexto de razonamiento histórico mediante `preserve_thinking`.
- Comprensión nativa de imágenes y vídeo, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Programación y tareas de terminal agénticas (la model card cita Terminal Bench 2.1 con el arnés Terminus).
- Ejecución agéntica autónoma: planificación, manejo de retroalimentación del entorno y finalización de tareas de múltiples pasos de extremo a extremo.
- Compatibilidad con arneses y herramientas de desarrollo populares según la model card.
- Capacidades multilingües: no disponible (no se detallan idiomas).
- Soporte de tool calling / function calling: no disponible explícitamente en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Automatización de tareas de terminal y CI/CD: el modelo puede operar sobre entornos de línea de comandos y ejecutar flujos de trabajo de múltiples pasos, lo que permite integrarlo en pipelines de integración y despliegue para tareas de diagnóstico, corrección y verificación de código.
- Análisis de documentación técnica y diagramas: gracias a su codificador visual nativo, puede interpretar diagramas STEM, esquemas de arquitectura y documentos escaneados, extrayendo información estructurada para equipos de ingeniería.
- Comprensión de vídeo de larga duración: con soporte para vídeos de hasta una hora, resulta adecuado para resumir reuniones, analizar grabaciones de formación o revisar material audiovisual de investigación.
- Asistencia a la investigación: el contexto nativo de 262.144 tokens (extensible a 1.000.000) permite procesar artículos completos, corpus de notas y transcripciones extensas en una sola ventana para tareas de síntesis y extracción.
- Agentes autónomos de resolución de incidencias: su capacidad de planificación y de manejo de retroalimentación del entorno lo hace apto para agentes que diagnostican fallos, proponen parches y validan resultados de forma iterativa.
- Trabajo profesional con razonamiento controlable: en entornos de producción donde la latencia importa, el modo de pensamiento puede desactivarse por petición, y en tareas complejas puede aumentarse la profundidad de razonamiento mediante `reasoning_effort`.
- Despliegue en infraestructura propia con vLLM o SGLang: la compatibilidad declarada con estos motores de inferencia facilita servir el modelo en clústeres con GPU para aplicaciones internas.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados comparativos con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero el contenido extraído está truncado y solo muestra parcialmente la fila de "Agentic terminal coding" (Terminal Bench 2.1, arnés Terminus). No se dispone de los valores numéricos completos, por lo que no se presentan cifras que no puedan verificarse.

No se han publicado resultados de benchmarks completos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo denso de 27B en precisión FP16 requiere aproximadamente 55,6 GB solo para los pesos, a lo que hay que sumar caché KV y overhead; en cuantizaciones de 8 bits o 4 bits el requisito se reduce sustancialmente, pero no se han publicado cuantizaciones oficiales.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, el modelo en FP16 no cabe en GPU de consumo de 24 GB y requeriría GPUs profesionales (A100 80 GB, H100, etc.) o configuraciones multi-GPU.
- ¿Cabe en GPU de consumo? En FP16 no; en cuantizaciones agresivas podría ser viable en GPUs de 24 GB o más, pero no hay datos oficiales que lo confirmen.
- Opciones de despliegue: Transformers, vLLM, SGLang y TokenSpeed según la model card.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La model card menciona como comparables a Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero no se dispone de sus especificaciones completas ni de los resultados numéricos de la comparativa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B (este) | 27B | 262.144 nativos; hasta 1.000.000 | Apache 2.0 | Hugging Face (repo Ramh2r/Qwen3.8-27B) |
| Qwen3.6-27B | no disponible | no disponible | no disponible | citado en la model card |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | citado en la model card |
| Muse Glimmer-30B | no disponible | no disponible | no disponible | citado en la model card |
| Opus4.6 Max | no disponible | no disponible | no disponible | citado en la model card |

## Limitaciones y advertencias

- El repositorio presenta cero descargas y cero likes, y fue creado y actualizado en la misma marca temporal (2026-11-20), lo que sugiere una publicación reciente y sin validación comunitaria.
- La model card incluye referencias a Qwen Cloud, a una versión alojada con contexto de 1M por defecto y a comparativas con modelos propietarios; estos datos no pueden verificarse de forma independiente y deben tratarse con cautela.
- No se detallan los idiomas soportados, lo que impide confirmar el rendimiento multilingüe.
- No se especifican los tipos de cuantización disponibles ni el proceso de entrenamiento (número de tokens, composición del dataset, RLHF/DPO).
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fiabilidad en la información disponible.
- Sesgos conocidos: no disponible.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificarse contra los términos del autor y de los componentes subyacentes.
- El tamaño del repositorio (55,6 GB) y los 27B de parámetros implican requisitos de hardware significativos para producción.
- La información de benchmarks está truncada en la fuente, por lo que no se pueden extraer conclusiones de rendimiento verificables.

## Enlaces

- Hugging Face: https://huggingface.co/Ramh2r/Qwen3.8-27B
- Qwen Cloud (mencionado en la model card): https://www.qwencloud.com
- Qwen3.8-27B Overview (mencionado en la model card): https://www.qwencloud.com/models/qwen3.8-27b
