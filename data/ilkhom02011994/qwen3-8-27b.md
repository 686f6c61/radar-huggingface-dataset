# ilkhom02011994/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión, publicado en el repositorio de Hugging Face `ilkhom02011994/Qwen3.8-27B` bajo licencia Apache 2.0. Según la model card, forma parte de la familia Qwen3.8 y se presenta como la generación "más capaz" de la saga de modelos abiertos Qwen, construida sobre la base arquitectónica de Qwen3.5. El modelo combina comprensión nativa de imagen y vídeo con control flexible del modo de razonamiento (*thinking*), y está orientado a tareas de programación, trabajo profesional, investigación y flujos agénticos de largo horizonte.

Con 27.781.427.952 parámetros totales (dato real de los safetensors) y una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.000.000, el modelo se posiciona en la franja *dense* de tamaño medio-grande. La arquitectura no es un transformer clásico: emplea un diseño híbrido con capas Gated DeltaNet (atención lineal) intercaladas con capas de Gated Attention, además de predicción multi-token (MTP) entrenada con múltiples pasos.

Es relevante ahora porque, según la model card, la serie Qwen3.5/3.6 ya tuvo amplia adopción comunitaria y esta versión añade mejoras en ejecución agéntica, planificación autónoma y compatibilidad con *harnesses* de desarrollo. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo es de 55,6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrido de Gated DeltaNet (atención lineal) y Gated Attention; 64 capas |
| Parametros totales | 27.781.427.952 (27B) |
| Parametros activos | no aplica (modelo dense, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Transformers) |
| Dimension oculta | 5.120 |
| Token embedding | 248.320 (padded) |
| Layout de capas | 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Gated DeltaNet | 48 cabezas de atención lineal para V, 16 para QK; dimensión de cabeza 128 |
| Gated Attention | 24 cabezas para Q, 4 para KV; dimensión de cabeza 256; RoPE dim 64 |
| FFN | dimensión intermedia 17.408 |
| MTP (Multi-Token Prediction) | entrenado con múltiples pasos |
| Pipeline | image-text-to-text |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo es un transformer causal híbrido con codificador de visión. El bloque del language model se organiza en 16 repeticiones de un patrón que combina tres sub-bloques de Gated DeltaNet (atención lineal con 48 cabezas para V y 16 para QK, dimensión de cabeza 128) seguidos de un sub-bloque de Gated Attention (24 cabezas para Q y 4 para KV, dimensión de cabeza 256, RoPE de dimensión 64). Cada sub-bloque va seguido de una FFN con dimensión intermedia de 17.408. La dimensión oculta es 5.120 y el vocabulario de embedding y salida es de 248.320 entradas (padded).

El entrenamiento comprende fases de pre-entrenamiento y post-entrenamiento, según la model card. Se entrenó con Multi-Token Prediction (MTP) en múltiples pasos, lo que habilita decodificación especulativa y mejora el throughput. La model card no especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO; esos datos figuran como no disponibles. La innovación técnica destacable es la combinación de atención lineal (Gated DeltaNet) con atención completa (Gated Attention) en un patrón 3:1, que reduce el coste computacional en contextos largos manteniendo capacidad de atención global.

## Capacidades

- Generación de texto y razonamiento en modo *thinking* activado por defecto, desactivable por petición.
- Control de profundidad de razonamiento mediante el parámetro `reasoning_effort`.
- Retención del contexto de razonamiento de mensajes históricos mediante `preserve_thinking`.
- Comprensión nativa de imagen y vídeo (pipeline image-text-to-text): diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Programación y tareas de *agentic terminal coding* (según benchmarks declarados en la model card).
- Ejecución agéntica: planificación autónoma y manejo de retroalimentación del entorno para completar tareas de extremo a extremo.
- Soporte declarado de *harnesses* y herramientas de desarrollo populares (sin detalle de cuáles).
- Compatibilidad con Transformers, vLLM, SGLang y TokenSpeed.
- Capacidades multilingües: no disponible en la información proporcionada.
- Tool calling / function calling: no se detalla explícitamente en la model card, aunque la mención a "official built-in tools" en la versión alojada sugiere soporte de herramientas.

## Casos de uso

- Automatización de tareas de terminal y CI/CD: el modelo está entrenado específicamente para *agentic terminal coding* (Terminal Bench 2.1), por lo que puede integrarse en pipelines que requieran ejecutar comandos, interpretar salidas y corregir errores de forma iterativa.
- Análisis de documentos técnicos y diagramas STEM: gracias a su codificador de visión nativo, puede extraer información de figuras, esquemas y documentos escaneados en flujos de investigación o ingeniería.
- Procesamiento de vídeo de larga duración: con soporte para vídeos de hasta una hora y contexto de 262.144 tokens, es adecuado para resumir reuniones, analizar grabaciones de clases o revisar material audiovisual extenso.
- Asistentes de programación con razonamiento controlado: el parámetro `reasoning_effort` permite ajustar la profundidad de razonamiento por petición, útil para equilibrar latencia y precisión en IDE o revisión de código.
- Agentes autónomos multi-paso: la planificación autónoma y el manejo de retroalimentación del entorno lo hacen apto para orquestar tareas largas con múltiples herramientas y estados intermedios.
- Investigación asistida: con contexto extensible a 1M tokens y retención de razonamiento histórico (`preserve_thinking`), puede mantener coherencia en análisis de corpus largos o revisiones bibliográficas.
- Atención al cliente técnica: conversaciones multi-turno con contexto largo y comprensión de capturas de pantalla o vídeos enviados por el usuario.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks con columnas para Qwen3.8-27B, Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, organizada por categorías (Coding, etc.). Sin embargo, los valores numéricos de la tabla no están disponibles en la información proporcionada (el contenido se trunca en la fila de *Agentic terminal coding* / Terminal Bench 2.1). Por tanto:

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card menciona la evaluación Terminal Bench 2.1 (Terminus) para *agentic terminal coding*, pero los valores concretos no son accesibles.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27,8B parámetros en safetensors (55,6 GB en fp16/bf16), se necesitan aproximadamente 56 GB de VRAM en precisión completa. En cuantización de 8 bits, ~28 GB; en 4 bits, ~14-16 GB (estimaciones orientativas, no confirmadas en la model card).
- GPU recomendadas: A100 80GB, H100 80GB para precisión completa; A100 40GB o L40S para 8 bits; RTX 4090 (24 GB) viable en cuantización de 4 bits.
- Cabe en GPU de consumo: sí, en cuantización de 4 bits en RTX 4090 (24 GB) o RTX 3090 (24 GB), con margen limitado para contexto largo.
- Opciones de despliegue: Transformers, vLLM, SGLang y TokenSpeed, según la model card. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La presencia de MTP sugiere decodificación especulativa que puede mejorar el throughput, pero no se aportan cifras.

## Comparativa con modelos similares

La model card incluye una tabla comparativa con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero los valores numéricos no están accesibles en la información proporcionada. Datos estructurales disponibles:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B | 27,8B (dense) | 262.144 nativo / 1M extensible | Apache 2.0 | Hugging Face (repo con 0 descargas) |
| Qwen3.6-27B | no disponible | no disponible | no disponible | mencionado en model card |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | mencionado en model card |
| Muse Glimmer-30B | ~30B (por nombre) | no disponible | no disponible | mencionado en model card |
| Opus4.6 Max | no disponible | no disponible | no disponible | mencionado en model card |

No se dispone de datos de rendimiento comparativo numérico en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se documentan mitigaciones específicas en la model card.
- Limitaciones de contexto o idioma: el contexto nativo es de 262.144 tokens; la extensión a 1M se declara pero no se detalla el método ni la degradación asociada. Los idiomas soportados no están especificados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los pesos y posibles dependencias del codificador de visión.
- El repositorio tiene 0 descargas y 0 likes y fue creado el 2026-11-13, lo que sugiere que es una publicación reciente o de procedencia no verificada; el autor (`ilkhom02011994`) no es la organización oficial de Qwen.
- La model card referencia "Qwen Cloud" y una versión alojada "coming soon"; no hay confirmación de que los pesos correspondan a una release oficial.
- El contenido de la model card está parcialmente truncado en la información proporcionada, por lo que pueden faltar advertencias del autor.
- Para producción, validar la procedencia de los pesos antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/ilkhom02011994/Qwen3.8-27B
- Qwen Cloud (modelo alojado, según model card): https://www.qwencloud.com/models/qwen3.8-27b
- Qwen Cloud (servicio): https://www.qwencloud.com
- Paper, blog, repositorio o demo oficiales: no disponibles en la información proporcionada.
