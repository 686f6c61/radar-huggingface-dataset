# mvtt-ec/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje y visión de tipo causal con codificador visual, publicado por el usuario mvtt-ec en Hugging Face bajo licencia Apache 2.0. Según su model card, se presenta como la generación más capaz de la familia de modelos abiertos Qwen, construida sobre la base arquitectónica de Qwen3.5 y orientada a tareas de programación, trabajo profesional, investigación y agentes autónomos de largo horizonte. El modelo es denso (no MoE), con 27.781.427.952 parámetros reales según los pesos en safetensors, y está empaquetado en formato Transformers.

La arquitectura combina capas de atención lineal (Gated DeltaNet) con capas de atención clásica con compuerta (Gated Attention), en un layout híbrido de 64 capas. Incorpora un codificador de visión nativo que permite entrada image-text-to-text, incluyendo comprensión de imágenes y vídeos de hasta una hora de duración. El contexto nativo es de 262.144 tokens, extensible hasta 1.000.000, y el modelo se entrenó con Multi-Token Prediction (MTP) en varias etapas.

La relevancia de esta ficha es doble: por un lado, documenta un modelo de 27B con capacidades multimodales y de agente que aspira a competir con alternativas de su categoría; por otro, conviene señalar que la información disponible es exclusivamente la model card del autor y los metadatos de Hugging Face, sin datos independientes de validación. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor no es el equipo oficial de Qwen, lo que debe tenerse en cuenta al evaluar su procedencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con codificador de visión; transformer híbrido con Gated DeltaNet (atención lineal) y Gated Attention |
| Parametros totales | 27.781.427.952 (27B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) |
| Dimension oculta | 5.120 |
| Numero de capas | 64 |
| Layout de capas | 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Cabezas de atencion lineal (Gated DeltaNet) | 48 para V, 16 para QK; dimension de cabeza 128 |
| Cabezas de atencion (Gated Attention) | 24 para Q, 4 para KV; dimension de cabeza 256; RoPE dim 64 |
| Dimension intermedia FFN | 17.408 |
| Embedding de tokens | 248.320 (padded) |
| MTP (Multi-Token Prediction) | entrenado con múltiples pasos |
| Tamano del repo | 55,6 GB |

## Arquitectura y entrenamiento

El modelo emplea un transformer híbrido de 64 capas con un patrón repetido 16 veces: tres bloques de Gated DeltaNet (atención lineal con 48 cabezas para V y 16 para QK, dimensión de cabeza 128) seguidos de un bloque de Gated Attention clásica (24 cabezas para Q y 4 para KV, dimensión de cabeza 256, RoPE de 64 dimensiones). Esta combinación busca reducir el coste de atención en contextos largos manteniendo la capacidad expresiva de la atención completa en puntos clave de la red. La dimensión oculta es 5.120 y la FFN intermedia es 17.408, con un vocabulario de 248.320 entradas (padded). El modelo incorpora además un codificador de visión que lo convierte en un modelo nativo image-text-to-text.

El entrenamiento consta de fases de pre-entrenamiento y post-entrenamiento, según la model card, e incluye Multi-Token Prediction (MTP) entrenado con múltiples pasos, una técnica que permite predecir varios tokens por paso y que suele aprovecharse para decodificación especulativa. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron RLHF, DPO u otras técnicas de alineamiento. Tampoco se detalla la composición de los datos multimodales ni el proceso de alineación visión-lenguaje.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado por defecto, desactivable por petición, con control de profundidad mediante `reasoning_effort` y retención de contexto de razonamiento histórico mediante `preserve_thinking`.
- Programación y tareas de terminal agénticas, según los benchmarks declarados por el autor (Terminal Bench 2.1).
- Comprensión nativa de imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Ejecución de agentes autónomos con planificación y manejo de retroalimentación del entorno para tareas de múltiples pasos.
- Soporte de tool calling / function calling, implícito en su orientación a agentes y en la mención de "official built-in tools" en la versión alojada.
- Capacidades multilingües: no se detallan los idiomas soportados en la información disponible.
- Compatibilidad declarada con Hugging Face Transformers, vLLM, SGLang y TokenSpeed.

## Casos de uso

- Automatización de tareas de terminal y CI/CD: el modelo está entrenado para Terminal Bench 2.1 y puede integrarse en pipelines para ejecutar comandos, interpretar salidas y corregir errores en entornos de shell, con contexto largo para mantener el estado de la sesión.
- Análisis de documentos técnicos y diagramas: gracias a su codificador de visión nativo, puede procesar figuras STEM, esquemas y PDFs escaneados, extrayendo información estructurada para tareas de investigación o ingeniería.
- Resumen y análisis de vídeos largos: su capacidad declarada de comprender vídeos de hasta una hora permite generar resúmenes, extraer acciones o responder preguntas sobre contenido audiovisual en contextos de formación o auditoría.
- Agentes de investigación autónomos: con 262.144 tokens de contexto nativo y planificación multi-paso, puede encadenar búsquedas, lecturas y síntesis sobre corpus extensos sin perder el hilo de la tarea.
- Asistencia a la programación en producción: soporta tool calling y puede integrarse en IDE o asistentes de código para generar, revisar y refactorizar código, con modo thinking desactivable para reducir latencia en tareas simples.
- Atención al cliente multimodal: puede gestionar conversaciones multi-turno con imágenes adjuntas (capturas, fotos de producto) manteniendo contexto largo, aunque la falta de datos sobre idiomas y sesgos exige validación previa.
- Procesamiento por lotes de documentación técnica: con contexto extensible a 1M tokens y soporte en vLLM/SGLang, puede desplegarse para clasificar y extraer información de grandes volúmenes de documentos.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados comparativos, pero en la información proporcionada solo se conserva el encabezado y la fila de "Agentic terminal coding / Terminal Bench 2.1 (Terminus)"; los valores numéricos de esa fila y del resto de categorías (razonamiento, conocimiento, visión) no están disponibles en el extracto. Los modelos de comparación citados son Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max.

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Resto de benchmarks de la model card | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados numéricos verificables de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 55,6 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 64-80 GB de VRAM para contexto moderado.
- GPU recomendadas para BF16: A100 80GB, H100 80GB, H200 o múltiples GPU de 48 GB en tensor parallelism.
- Cuantización: no se especifican tipos soportados en la información disponible; en FP8 o cuantizaciones de 4 bits podría reducirse el requisito a rangos de 16-32 GB, pero esto no está confirmado por el autor.
- GPU de consumo: no cabe en BF16 en ninguna GPU de consumo actual (RTX 4090 24GB, RTX 5090 32GB) sin cuantización agresiva o offloading; con cuantización de 4 bits podría ser viable en GPUs de 24-32 GB, sujeto a validación.
- Despliegue: compatible con Hugging Face Transformers, vLLM, SGLang y TokenSpeed según la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (mvtt-ec) | 27B denso | 262.144 nativo, hasta 1M | Texto + imagen + vídeo | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen3.6-27B | 27B (no detallado) | no disponible | no disponible | no disponible | Citado en la model card |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible | Citado en la model card |
| Muse Glimmer-30B | 30B (según nombre) | no disponible | no disponible | no disponible | Citado en la model card |

La comparativa se limita a los modelos mencionados en la propia model card; no se dispone de datos independientes de rendimiento, contexto ni licencia de las alternativas para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Procedencia: el repositorio pertenece al usuario mvtt-ec, no al equipo oficial de Qwen; la model card replica estructura y referencias de Qwen (incluido Qwen Cloud) sin verificación independiente de autoría.
- Sin validación externa: 0 descargas y 0 likes en el momento de la consulta; no hay resultados de benchmarks numéricos verificables en la información disponible.
- Idiomas: no se especifican los idiomas soportados, lo que impide garantizar calidad en castellano u otras lenguas distintas del inglés.
- Alucinación: no hay datos publicados sobre tasas de alucinación ni evaluaciones de fidelidad; en tareas de agente y código el riesgo debe mitigarse con verificación.
- Sesgos: no se documentan sesgos conocidos ni proceso de alineamiento (RLHF/DPO) en la información disponible.
- Contexto: aunque se declara extensible a 1M tokens, no se detalla el método de extensión ni el rendimiento degradado en longitudes extremas.
- Licencia: Apache 2.0 permite uso comercial, pero al tratarse de un repositorio de terceros conviene verificar la procedencia de los pesos antes de desplegarlos en producción.
- Cuantización: no se documentan formatos GGUF ni cuantizaciones oficiales, lo que limita el despliegue en hardware de consumo sin trabajo adicional.

## Enlaces

- Hugging Face: https://huggingface.co/mvtt-ec/Qwen3.8-27B
- Qwen Cloud (referenciado en la model card): https://www.qwencloud.com
- Overview de Qwen3.8-27B en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
