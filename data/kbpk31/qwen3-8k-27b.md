# kbpk31/Qwen3.8k-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal denso con codificador de visión, publicado en el repositorio de HuggingFace `kbpk31/Qwen3.8-27B`. Según la model card, forma parte de la generación Qwen3.8 de la familia Qwen y se presenta como un modelo nativo de visión-lenguaje orientado a tareas de codificación, trabajo profesional, investigación y tareas agénticas de largo horizonte. El modelo cuenta con 27.781.427.952 parámetros reales según los pesos en safetensors y un tamaño de repositorio de 55,6 GB.

La arquitectura combina capas de atención lineal (Gated DeltaNet) con capas de atención con compuertas (Gated Attention) en un patrón híbrido de 64 capas, con una dimensión oculta de 5120 y una dimensión intermedia de FFN de 17.408. El contexto nativo es de 262.144 tokens, extensible hasta 1.000.000, y el modelo incorpora entrenamiento con Multi-Token Prediction (MTP) en varios pasos. La licencia declarada es Apache 2.0.

El modelo es relevante por su combinación de tamaño compacto (27B), contexto largo, capacidades multimodales nativas (imagen y vídeo) y control flexible del razonamiento (thinking mode activable por petición, `reasoning_effort` y `preserve_thinking`). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se dispone de información sobre idiomas soportados más allá de lo indicado en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal Language Model con codificador de visión; híbrido de Gated DeltaNet (atención lineal) y Gated Attention |
| Parámetros totales | 27.781.427.952 (27B según model card) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con codificador de visión integrado. La estructura del language model consta de 64 capas organizadas en 16 bloques de la forma `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`. Las capas Gated DeltaNet emplean 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. Las capas Gated Attention usan 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y dimensión de Rotary Position Embedding de 64. La dimensión oculta es 5120, la dimensión intermedia del FFN es 17.408 y el vocabulario (embedding y salida LM) es de 248.320 tokens con padding.

El modelo se entrena en dos etapas: pre-entrenamiento y post-entrenamiento. Incluye Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que permite decodificación especulativa y predicción de varios tokens por paso. La model card no especifica el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Tampoco se detallan innovaciones adicionales más allá del control de razonamiento (`reasoning_effort`, `preserve_thinking`) y el soporte nativo de imagen y vídeo.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado por defecto y desactivable por petición.
- Control de profundidad de razonamiento mediante `reasoning_effort` y retención del contexto de razonamiento histórico con `preserve_thinking`.
- Codificación y tareas de terminal agénticas (benchmark Terminal Bench 2.1 en la model card).
- Trabajo profesional e investigación según los "highlights" del autor.
- Comprensión nativa de imagen y vídeo, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Planificación autónoma y manejo de retroalimentación del entorno para tareas de extremo a extremo.
- Compatibilidad con harnesses y herramientas de desarrollo populares según la model card.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Codificación agéntica en terminal: el modelo puede ejecutar tareas de terminal de extremo a extremo (evaluado en Terminal Bench 2.1), integrándose en flujos de trabajo de CI/CD y herramientas de desarrollo compatibles.
- Análisis de documentos técnicos y diagramas STEM: al ser un modelo visión-lenguaje nativo, puede procesar documentos, figuras e imágenes técnicas y responder preguntas sobre ellos.
- Procesamiento de vídeo de larga duración: con soporte de vídeos de hasta una hora y contexto de 262.144 tokens, es adecuado para resumir, indexar o extraer información de grabaciones extensas.
- Asistentes de investigación y trabajo profesional: el modelo está orientado a tareas de investigación y trabajo profesional con razonamiento multi-paso y planificación autónoma.
- Tareas agénticas de largo horizonte: la planificación autónoma y el manejo de retroalimentación del entorno permiten encadenar pasos y completar tareas complejas con mayor fiabilidad.
- Despliegue en infraestructura propia: al ser compatible con vLLM, SGLang y TokenSpeed, puede servirse en clústeres propios para aplicaciones que requieran contexto largo (hasta 1M de tokens) sin depender de API externa.
- Control de coste de razonamiento: la posibilidad de desactivar el thinking mode o ajustar `reasoning_effort` permite equilibrar latencia y calidad según la tarea.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados comparativos con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero en la información proporcionada solo se ha recuperado el encabezado de la sección "Coding" y la fila correspondiente a "Agentic terminal coding" (Terminal Bench 2.1, Terminus) sin los valores numéricos. No se dispone de cifras concretas para MMLU, HumanEval, GSM8K ni otros benchmarks.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo denso de 27B en precisión BF16 requiere aproximadamente 55,6 GB de pesos (tamaño del repo), por lo que no cabe en GPUs de consumo con 24 GB sin cuantización.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, se requerirían GPUs con al menos 80 GB (A100, H100) para BF16, o configuraciones multi-GPU.
- ¿Cabe en consumer GPU? No en BF16. Con cuantización de 4 bits podría aproximarse a los 14-16 GB de pesos, pero no se dispone de datos oficiales de cuantización para este modelo.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La model card menciona explícitamente los siguientes modelos como comparación: Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max. Sin embargo, no se dispone de las cifras de benchmarks para realizar una comparativa numérica.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B | 27B (denso) | 262.144 nativos, hasta 1.000.000 | Apache 2.0 | HuggingFace (`kbpk31/Qwen3.8-27B`) |
| Qwen3.6-27B | No disponible | No disponible | No disponible | No disponible |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible |
| Muse Glimmer-30B | No disponible | No disponible | No disponible | No disponible |
| Opus4.6 Max | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos suficientes para una comparativa técnica detallada con alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-04), lo que sugiere que no ha sido validado por la comunidad.
- El autor del repositorio es `kbpk31`, no la organización oficial de Qwen; conviene verificar la procedencia y autenticidad de los pesos antes de usarlos en producción.
- No se especifican los idiomas soportados, por lo que el rendimiento multilingüe es desconocido.
- No se detallan los datos de entrenamiento (tokens, composición, RLHF/DPO), lo que dificulta evaluar sesgos y riesgos de alucinación.
- No se dispone de información sobre cuantizaciones oficiales ni sobre el rendimiento tras cuantizar.
- El modo thinking está activado por defecto, lo que puede incrementar la latencia y el coste de tokens si no se desactiva o ajusta.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse que los pesos distribuidos en este repositorio de terceros cumplen efectivamente dicha licencia.
- No se han publicado resultados numéricos de benchmarks en la información disponible, lo que impide validar las afirmaciones de rendimiento de la model card.

## Enlaces

- HuggingFace: https://huggingface.co/kbpk31/Qwen3.8-27B
- Qwen Cloud (servicio gestionado mencionado en la model card): https://www.qwencloud.com
- Qwen3.8-27B Overview en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
