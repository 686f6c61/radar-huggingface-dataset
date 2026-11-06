# shivrajgurjar/jarvis

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión desarrollado por el equipo Qwen (Alibaba), publicado bajo licencia Apache 2.0. Se presenta como la generación más capaz de la familia de modelos abiertos Qwen hasta la fecha, construida sobre la base arquitectónica de Qwen3.5 y orientada a tareas de programación, trabajo profesional, investigación y flujos agénticos de largo horizonte. El modelo es denso, con 27.000 millones de parámetros, y está diseñado para ser desplegable en infraestructura relativamente modesta en comparación con variantes de mayor tamaño.

La arquitectura combina capas de atención lineal Gated DeltaNet con capas de atención completa Gated Attention en un patrón híbrido de 64 capas, lo que reduce el coste computacional en contextos largos. Soporta de forma nativa una longitud de contexto de 262.144 tokens, extensible hasta 1.000.000, y añade comprensión nativa de imágenes y vídeos (incluidos vídeos de hasta una hora de duración). Incorpora control flexible del modo de razonamiento ("thinking"), activado por defecto pero desactivable por petición, con parámetros como `reasoning_effort` y `preserve_thinking`.

El modelo resulta relevante porque ofrece capacidades multimodales y agénticas en un tamaño compacto, con pesos en formato Transformers compatibles con vLLM, SGLang y TokenSpeed, lo que facilita su integración en stacks de producción existentes. La ficha de Hugging Face corresponde al repositorio `shivrajgurjar/jarvis`, que redistribuye los pesos del modelo Qwen3.8-27B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con codificador de visión; mezcla de Gated DeltaNet (atención lineal) y Gated Attention (atención completa) |
| Parametros totales | 27B |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible en la información proporcionada |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Hugging Face Transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con un codificador de visión acoplado. La disposición de capas sigue un patrón repetido 16 veces: tres bloques de Gated DeltaNet seguidos de un bloque de Gated Attention, cada uno con su correspondiente red feed-forward. Las capas de Gated DeltaNet emplean 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. Las capas de Gated Attention usan 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y dimensión de Rotary Position Embedding de 64. La dimensión oculta es 5120, la dimensión intermedia del FFN es 17.408 y el vocabulario (con padding) es de 248.320 tokens. El modelo incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos, una técnica que puede aprovecharse para decodificación especulativa.

El entrenamiento comprende fases de pre-entrenamiento y post-entrenamiento (no se detalla en la información disponible el número de tokens, la composición del dataset ni si se emplearon RLHF o DPO). Las mejoras anunciadas respecto a generaciones anteriores se centran en planificación autónoma, manejo de retroalimentación del entorno y finalización fiable de tareas de extremo a extremo, así como en compatibilidad con arneses y herramientas de desarrollo populares.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" configurable (activado por defecto, desactivable por petición, con profundidad ajustable mediante `reasoning_effort`).
- Retención de contexto de razonamiento de mensajes históricos mediante `preserve_thinking`.
- Comprensión nativa de imágenes y vídeos: diagramas STEM, documentos y vídeos de hasta una hora.
- Programación y tareas de terminal agénticas (evaluado en Terminal Bench 2.1 con el arnés Terminus).
- Ejecución agéntica: planificación autónoma y gestión de retroalimentación del entorno para tareas de múltiples pasos.
- Compatibilidad con arneses y herramientas de desarrollo populares para integración en stacks existentes.
- Capacidades multilingües: no se detalla la lista de idiomas en la información disponible.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información proporcionada.

## Casos de uso

- Automatización de tareas de terminal y CI/CD: el modelo puede operar sobre entornos de línea de comandos y completar tareas de extremo a extremo, según su evaluación en Terminal Bench 2.1, integrándose en pipelines de desarrollo para resolución autónoma de incidencias.
- Análisis de documentos técnicos y diagramas STEM: su codificador de visión permite interpretar figuras, esquemas y documentos escaneados junto con texto, útil en herramientas de investigación y asistencia técnica.
- Procesamiento de vídeo de larga duración: con soporte para vídeos de hasta una hora, puede emplearse en resumen y análisis de grabaciones, transcripción contextual o extracción de información de material audiovisual.
- Asistentes de programación con contexto largo: la ventana de 262.144 tokens (extensible a 1M) permite cargar repositorios completos o grandes volúmenes de código para revisión, refactorización y generación de parches.
- Agentes autónomos multi-paso: su planificación y manejo de retroalimentación del entorno lo hacen adecuado para orquestar flujos de trabajo que requieren varias herramientas y decisiones encadenadas.
- Investigación asistida: combinación de razonamiento con contexto largo y comprensión de documentos para síntesis de literatura, análisis de datos y generación de informes técnicos.
- Despliegue en infraestructura propia: al ser un modelo denso de 27B con pesos Transformers, puede servirse con vLLM o SGLang en hardware de gama alta para aplicaciones con requisitos de privacidad.

## Benchmarks y rendimiento

La información proporcionada incluye únicamente la cabecera y la primera fila de la tabla de benchmarks (categoría Coding, Terminal Bench 2.1 con el arnés Terminus), sin los valores numéricos. No se han publicado resultados completos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo denso de 27B, la inferencia en FP16 requeriría aproximadamente 54 GB solo para pesos, más memoria para KV cache y activaciones.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, cabría esperar GPUs de centro de datos como A100 80GB o H100 para FP16/BF16.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; con cuantización agresiva podría ser viable en GPUs de 24 GB, pero no se aportan datos al respecto.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La model card menciona comparaciones con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero los valores numéricos de la tabla no están incluidos en la información proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B | 27B | 262.144 (ext. 1M) | Apache 2.0 | Pesos abiertos |
| Qwen3.6-27B | no disponible | no disponible | no disponible | no disponible |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible |
| Muse Glimmer-30B | 30B (por nombre) | no disponible | no disponible | no disponible |
| Opus4.6 Max | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos del modelo en la documentación proporcionada.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se aportan evaluaciones específicas de fiabilidad factual.
- La lista de idiomas soportados no está disponible, lo que impide garantizar calidad multilingüe fuera de los idiomas principales presumibles.
- Aunque la licencia es Apache 2.0 (permite uso comercial), conviene verificar los términos del repositorio de redistribución `shivrajgurjar/jarvis`, que no es el repositorio oficial de Qwen.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en fechas de 2026; su procedencia y mantenimiento no están verificados.
- El tamaño del repo (8,1 GB) es inferior al esperado para pesos FP16 de 27B (unos 54 GB), lo que sugiere que podría contener pesos cuantizados o un subconjunto; no se detalla en la información disponible.
- El soporte de tool calling no está confirmado explícitamente; verificar antes de usarlo en producción.
- La ventana extensible a 1M tokens puede requerir configuraciones específicas de despliegue y aumentar significativamente el consumo de memoria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/shivrajgurjar/jarvis
- Qwen Cloud (servicio oficial, próximamente): https://www.qwencloud.com
- Página del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
