# Qwen/Qwen3.8-27B-FP8

## Resumen

Qwen3.8-27B-FP8 es la versión cuantizada en FP8 del modelo Qwen3.8-27B, desarrollado por el equipo Qwen (Alibaba). Se trata de un modelo de lenguaje causal denso de 27B parámetros con codificador de visión integrado, lo que lo convierte en un modelo nativo vision-language capaz de procesar imágenes y vídeos además de texto. La cuantización FP8 con granularidad fina y bloques de 128 permite reducir el espacio de pesos a aproximadamente 30,9 GB manteniendo, según el autor, métricas de rendimiento casi idénticas al modelo original en BF16.

La arquitectura combina capas de atención lineal (Gated DeltaNet) con capas de atención con compuerta (Gated Attention) en un patrón híbrido de 64 capas, e incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos. El contexto nativo es de 262.144 tokens, extensible hasta 1.000.000, lo que lo posiciona como una opción adecuada para tareas de agente de largo horizonte y comprensión de documentos extensos o vídeos de larga duración.

Su relevancia actual radica en que ofrece capacidades de codificación, trabajo profesional, investigación y ejecución agéntica propias de la generación Qwen3.8 en un modelo denso, compacto y desplegable, con licencia Apache 2.0 y compatibilidad con Transformers, vLLM, SGLang y TokenSpeed.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con codificador de visión; 64 capas con layout 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 27.781.427.952 (27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.000.000 |
| Tipos de cuantizacion | FP8 con granularidad fina y tamaño de bloque 128 (este repositorio); el modelo base admite otras cuantizaciones no detalladas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con codificador de visión. La dimensión oculta es 5120, con embedding de tokens de 248.320 (con padding) y salida LM del mismo tamaño. Las 64 capas siguen un layout híbrido: por cada bloque de 16 capas, tres capas usan Gated DeltaNet (atención lineal con 48 cabezas para V y 16 para QK, dimensión de cabeza 128) y una capa usa Gated Attention (24 cabezas para Q, 4 para KV, dimensión de cabeza 256, dimensión RoPE 64). La FFN tiene dimensión intermedia de 17.408. Esta combinación de atención lineal y atención completa reduce el coste de cómputo en contextos largos manteniendo calidad de atención.

El entrenamiento pasa por fases de pre-entrenamiento y post-entrenamiento; la model card no detalla el número de tokens ni la composición exacta del dataset, ni especifica si se emplearon RLHF o DPO. Sí se indica que el modelo incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos, una innovación que puede acelerar la decodificación. La versión FP8 emplea cuantización fina por bloques de 128, técnica que preserva la precisión numérica en pesos y activaciones con menor degradación que esquemas de cuantización más agresivos.

## Capacidades

- Generación de texto y razonamiento complejo, con modo de pensamiento (thinking) activado por defecto y desactivable por petición.
- Control flexible del razonamiento mediante `reasoning_effort` y retención del contexto de razonamiento histórico con `preserve_thinking`.
- Comprensión nativa de imágenes y vídeos: diagramas STEM, documentos y vídeos de escala horaria.
- Codificación y tareas de trabajo profesional e investigación.
- Ejecución agéntica de largo horizonte: planificación autonoma y manejo de retroalimentación del entorno.
- Compatibilidad con harnesses y herramientas de desarrollo populares para integración en stacks existentes.
- Soporte de tool calling / function calling: no se detalla explícitamente en la información disponible, aunque la orientación agéntica y la mención de "official built-in tools" en la versión alojada sugieren compatibilidad; tratar como no confirmado.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Atención al cliente automatizada: con 262.144 tokens de contexto nativo, el modelo puede mantener conversaciones multi-turno con historial extenso y documentación de producto adjunta sin truncar información.
- Generación de código en producción: su enfoque en codificación y tareas agénticas de terminal permite integrarlo en pipelines de CI/CD para generación, revisión y corrección automatizada de parches.
- Análisis de documentos técnicos y diagramas: al ser vision-language nativo, puede interpretar diagramas STEM, tablas e imágenes embebidas en informes de ingeniería junto con el texto circundante.
- Procesamiento de vídeos de larga duración: la ventana extensible hasta 1M tokens y el contexto nativo de 262K permiten analizar vídeos de escala horaria para resumen, extracción de eventos o control de calidad.
- Agentes autonómicos de investigación: el modelo está diseñado para llevar tareas multi-paso hasta su finalización con mayor fiabilidad, útil en pipelines de búsqueda, síntesis y verificación de fuentes.
- Asistencia a trabajo profesional: redacción de informes, extracción estructurada de documentación legal o financiera y resumen de reuniones con contexto largo.
- Despliegue en infraestructura propia con vLLM, SGLang o TokenSpeed: la cuantización FP8 reduce el requisito de memoria a ~31 GB, lo que facilita servir el modelo en una sola GPU de 40-48 GB.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero los valores numéricos concretos no están disponibles en la información proporcionada (la tabla aparece truncada). No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 31 GB solo para los pesos en FP8; con caché KV y overhead de runtime, se recomienda al menos 40-48 GB para contextos moderados.
- GPU recomendadas: A100 40GB/80GB, H100 80GB, L40S 48GB; para contextos muy largos (262K-1M) se recomienda H100 80GB o múltiples GPU.
- GPU de consumo: el modelo no cabe en GPU consumer de 24 GB (RTX 4090) en FP8 sin offloading o cuantización adicional a 4 bits; podría caber en RTX 5090 (32 GB) solo para pesos, con margen muy ajustado.
- Opciones de despliegue: Transformers, vLLM, SGLang, TokenSpeed; llama.cpp/Ollama no se mencionan como compatibles con este repositorio FP8.
- Latencia y throughput: no disponibles; la presencia de MTP (Multi-Token Prediction) sugiere decodificación especulativa nativa que puede mejorar el throughput, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B-FP8 | 27B (denso) | 262K nativo, hasta 1M | Apache 2.0 | Hugging Face, abierto |
| Qwen3.6-27B | 27B (denso) | no disponible | no disponible | Referenciado en benchmarks del autor |
| Muse Glimmer-30B | 30B | no disponible | no disponible | Referenciado en benchmarks del autor |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | Referenciado en benchmarks del autor |

No se dispone de datos de rendimiento numéricos para establecer una comparación cuantitativa fiable; la comparativa se limita a parámetros, contexto y licencia según la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; se recomienda evaluar sesgos en el dominio de despliegue antes de producción.
- Riesgo de alucinación: inherente a modelos generativos de esta escala; el modo thinking activado por defecto puede mitigar parcialmente errores en tareas de razonamiento, pero no elimina el riesgo.
- Limitaciones de contexto: aunque el contexto nativo es 262K y extensible a 1M, la extensión a 1M puede degradar calidad y aumentar latencia; validar en el caso de uso concreto.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingüe más allá de lo observado empíricamente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.8-27B y cualquier componente de terceros.
- La cuantización FP8, aunque fina, puede introducir pequeñas diferencias respecto al modelo BF16; el autor afirma rendimiento casi idéntico, pero no aporta métricas comparativas.
- La versión alojada en Qwen Cloud incluye contexto de 1M por defecto y herramientas integradas; la versión open-weights no necesariamente replica esas capacidades de producción.

## Enlaces

- Hugging Face: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Qwen Cloud (servicio alojado): https://www.qwencloud.com
- Overview del modelo alojado: https://www.qwencloud.com/models/qwen3.8-27b
- Chat oficial Qwen: https://chat.qwen.ai/
- Web oficial Qwen: https://qwen.ai/home
- Qwen Chat: https://qwen.ai/qwenchat
- Wikipedia (EN): https://en.wikipedia.org/wiki/Qwen
- Wikipedia (FR): https://fr.wikipedia.org/wiki/Qwen
