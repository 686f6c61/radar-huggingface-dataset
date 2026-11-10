# jsantillana/Qwen3.8-27B-abliterated-v2

## Resumen

Qwen3.8-27B-abliterated-v2 es una variante "abliterated" (con los mecanismos de rechazo atenuados o eliminados mediante edición de pesos) del modelo Qwen3.8-27B, publicada por el usuario jsantillana en Hugging Face. El modelo base, desarrollado por el equipo Qwen (Alibaba), es un modelo de lenguaje causal denso de 27.781 millones de parámetros con codificador de visión integrado, perteneciente a la familia Qwen3.8 y construido sobre la arquitectura de Qwen3.5. La variante abliterated conserva la arquitectura y los pesos del original, pero modifica el comportamiento de alineación para reducir las negativas a responder.

El modelo base destaca por combinar atención lineal (Gated DeltaNet) con atención completa con compuertas (Gated Attention) en un diseño híbrido de 64 capas, además de predicción multi-token (MTP) entrenada con varios pasos. Soporta de forma nativa comprensión de imágenes y vídeos, control flexible del modo de razonamiento y un contexto nativo de 262.144 tokens extensible hasta 1.000.000.

Es relevante ahora porque representa la generación más reciente de la familia abierta Qwen en un tamaño compacto y desplegable (27B), con licencia Apache 2.0, lo que facilita su uso comercial e integración en infraestructuras propias. La variante abliterated interesa a quienes necesitan un modelo sin las restricciones de rechazo del original para investigación, generación creativa o tareas de red teaming, asumiendo los riesgos asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con Vision Encoder: 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), 64 capas |
| Parametros totales | 27.781.427.952 (27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors; el modelo base es compatible con vLLM, SGLang y TokenSpeed) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con un codificador de visión acoplado (pipeline image-text-to-text), pensado para comprensión conjunta de imagen, vídeo y texto. La columna vertebral lingüística tiene una dimensión oculta de 5120, embedding de tokens de 248.320 (con padding), 64 capas y una FFN con dimensión intermedia de 17.408. El diseño de capas es híbrido: por cada bloque de cuatro capas, tres usan Gated DeltaNet (atención lineal, con 48 cabezas lineales para V y 16 para QK, dimensión de cabeza 128) y una usa Gated Attention (24 cabezas para Q y 4 para KV, dimensión de cabeza 256, RoPE de dimensión 64). Esta mezcla busca reducir el coste computacional en contextos largos manteniendo la calidad de la atención completa.

El entrenamiento del modelo base incluye fases de pre-entrenamiento y post-entrenamiento, con MTP (Multi-Token Prediction) entrenada con múltiples pasos, lo que habilita decodificación especulativa y mayor throughput. La model card menciona mejoras en tareas agénticas de horizonte largo, planificación autónoma y manejo de retroalimentación del entorno, así como control flexible del razonamiento (`reasoning_effort`, `preserve_thinking`). No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO. La variante abliterated no documenta su procedimiento de edición de pesos en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado por defecto, desactivable por petición y ajustable en profundidad mediante `reasoning_effort`.
- Comprensión nativa de imágenes y vídeos (diagramas STEM, documentos, vídeos de hasta una hora de duración).
- Codificación y tareas de ingeniería de software, incluyendo coding agéntico en terminal (Terminal Bench 2.1).
- Tareas profesionales y de investigación de múltiples pasos.
- Ejecución agéntica de horizonte largo: planificación autónoma y procesamiento de retroalimentación del entorno.
- Soporte de tool calling / function calling y compatibilidad con harnesses y herramientas de desarrollo populares.
- Capacidades multilingües: no detalladas en la información disponible.
- Retención de contexto de razonamiento entre mensajes históricos mediante `preserve_thinking`.
- Compatibilidad con vLLM, SGLang, TokenSpeed y Transformers para despliegue.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto muy largo (262.144 tokens nativos) y retener el hilo de razonamiento entre mensajes, lo que permite resolver incidencias complejas sin perder información previa.
- Generación de código en producción: su soporte de tool calling y su rendimiento en coding agéntico permiten integrarlo en pipelines de CI/CD para revisión automática, generación de parches y tareas de terminal.
- Análisis de documentos y diagramas técnicos: al ser un modelo visión-lenguaje nativo, puede extraer información de diagramas STEM, planos y documentos escaneados y responder preguntas sobre ellos.
- Procesamiento de vídeo de larga duración: la comprensión de vídeos de hasta una hora habilita resúmenes, búsqueda de eventos y control de calidad en grabaciones.
- Agentes autónomos de investigación: la planificación de horizonte largo y el manejo de retroalimentación del entorno lo hacen adecuado para tareas de búsqueda y síntesis multi-paso.
- Investigación en seguridad y red teaming: la variante abliterated permite estudiar el comportamiento del modelo sin los rechazos del original, útil para evaluar sesgos, robustez y alineación.
- Asistentes de desarrollo integrados en IDE: la compatibilidad con harnesses y herramientas populares facilita su incorporación a entornos de programación asistida.

## Benchmarks y rendimiento

La model card del modelo base incluye una tabla comparativa con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero en la información proporcionada solo se muestra la cabecera de la sección "Coding" y la fila de Terminal Bench 2.1 (Terminus) sin valores numéricos. No se dispone de cifras completas.

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks completos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27.781 millones de parámetros, en FP16 se requieren aproximadamente 55,6 GB solo para pesos; en cuantización de 8 bits, unos 28 GB; en 4 bits, unos 14 GB (estimaciones teóricas a partir del recuento de parámetros, sin datos oficiales de cuantización publicados).
- GPU recomendadas: A100 80 GB o H100 80 GB para FP16 con contexto largo; para cuantizaciones de 8 bits, una RTX 4090 (24 GB) puede ser insuficiente para contexto completo y requeriría 4 bits o particionado.
- Cabe en GPU de consumo: en cuantización de 4 bits sí es viable en GPUs de 24 GB (RTX 4090, RTX 3090), asumiendo gestión cuidadosa de la caché KV en contextos largos.
- Opciones de despliegue: Transformers, vLLM, SGLang y TokenSpeed según la model card; llama.cpp y Ollama no se mencionan en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada. La MTP entrenada con múltiples pasos puede habilitar decodificación especulativa y mejorar el throughput, aunque no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-abliterated-v2 | 27,78B | 262.144 (ext. 1M) | Si | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen3.6-27B | 27B (aprox.) | no disponible | no disponible | no disponible | Referenciado en la model card |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible | Referenciado en la model card |
| Muse Glimmer-30B | 30B (aprox.) | no disponible | no disponible | no disponible | Referenciado en la model card |

Los datos de rendimiento comparativo no están disponibles en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- La variante abliterated elimina o atenúa los mecanismos de rechazo del modelo original, lo que aumenta el riesgo de generar contenido dañino, sesgado o inapropiado sin las salvaguardas de alineación estándar.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de fidelidad para esta variante.
- No se dispone de información sobre los idiomas soportados ni sobre el rendimiento en idiomas distintos del inglés.
- La licencia Apache 2.0 permite uso comercial, pero el autor de la variante abliterated no ofrece garantías sobre el comportamiento del modelo modificado.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de validación comunitaria ni pruebas de calidad publicadas.
- El contexto nativo es de 262.144 tokens; la extensión a 1.000.000 se anuncia para la versión alojada en Qwen Cloud, no necesariamente para estos pesos locales.
- No hay información sobre el método de abliteration empleado, lo que dificulta evaluar posibles degradaciones en capacidades o coherencia.
- La fecha de creación del repositorio (2026-11-10) y la referencia a modelos como Opus4.6 Max y Muse Glimmer-30B no pueden verificarse con fuentes independientes en la información disponible.

## Enlaces

- [Hugging Face: jsantillana/Qwen3.8-27B-abliterated-v2](https://huggingface.co/jsantillana/Qwen3.8-27B-abliterated-v2)
- [Qwen Cloud: Qwen3.8-27B Overview](https://www.qwencloud.com/models/qwen3.8-27b)
