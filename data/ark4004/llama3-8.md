# ark4004/llama3.8

## Resumen

El modelo `ark4004/llama3.8` es un repositorio de HuggingFace que aloja los pesos de **Qwen3.8-27B**, un modelo de lenguaje causal multimodal (texto e imagen) desarrollado por la comunidad Qwen, con arquitectura híbrida que combina atención lineal (Gated DeltaNet) y atención clásica (Gated Attention). A pesar del nombre del repositorio, no se trata de un modelo de la familia Llama, sino de la serie Qwen3.8, sucesora de Qwen3.5 y Qwen3.6. El modelo está diseñado para tareas de codificación, trabajo profesional, investigación y ejecución de agentes de larga duración, con un contexto nativo de 262 144 tokens extensible hasta 1 000 000.

El modelo es un modelo denso de 27 000 millones de parámetros (27,78 mil millones según los pesos safetensors), con un encoder de visión integrado que permite comprensión de imágenes y vídeos. Su licencia Apache 2.0 facilita su uso comercial y su integración en herramientas como Transformers, vLLM o SGLang. El repositorio tiene cero descargas y cero likes, lo que sugiere que es una publicación reciente o poco difundida. La información técnica disponible es parcial, ya que la model card incluye detalles de arquitectura y algunos benchmarks de texto, pero no resultados completos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder (híbrido Gated DeltaNet + Gated Attention) |
| Parametros totales | 27 781 427 952 (según safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativo, extensible hasta 1 000 000 |
| Tipos de cuantizacion | No especificado en la información disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

El modelo presenta una arquitectura híbrida que combina dos tipos de atención: **Gated DeltaNet** (atención lineal con 48 cabezales para V y 16 para QK, dimensión de cabeza 128) y **Gated Attention** (atención clásica con 24 cabezales para Q y 4 para KV, dimensión de cabeza 256 y RoPE de 64 dimensiones). La disposición de capas es `16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))`, con 64 capas totales y dimensión oculta 5120. La FFN tiene dimensión intermedia 17 408. El modelo incluye un encoder de visión nativo para procesar imágenes y vídeos.

El entrenamiento incluye una etapa de pre-entrenamiento y otra de post-entrenamiento, con MTP (Multi-Token Prediction) entrenado con múltiples pasos. No se especifican el número de tokens de entrenamiento ni la composición del dataset. Se menciona que el modo de pensamiento (thinking mode) está activado por defecto, con posibilidad de desactivarlo por petición y de ajustar el esfuerzo de razonamiento mediante `reasoning_effort`, así como de preservar el contexto de razonamiento histórico con `preserve_thinking`. No se indican técnicas de alineación como RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto y razonamiento complejo, con modo de pensamiento (thinking mode) activable y configurable.
- Comprensión de imágenes y vídeos (entrada multimodal), incluyendo diagramas STEM, documentos y vídeos de hasta una hora.
- Codificación (programación) y ejecución de tareas de agente de larga duración (long-horizon agentic tasks).
- Soporte para tool calling y function calling (no explícito en la card, pero se menciona "built-in tools" en la versión alojada de Qwen Cloud).
- Razonamiento multi-paso y planificación autónoma, con manejo de feedback del entorno.
- Contexto largo de 262K tokens nativo, extensible a 1M, adecuado para tareas con historial extenso.
- Multilingüismo: no se especifican idiomas concretos, aunque los modelos Qwen suelen soportar múltiples idiomas.

## Casos de uso

- **Asistente de programación en terminal**: el modelo destaca en "agentic terminal coding" según la benchmark Terminal Bench 2.1, por lo que puede usarse para generar, depurar y ejecutar código en un entorno de línea de comandos, integrado en pipelines de CI/CD o en herramientas de autocompletado.
- **Análisis de documentos técnicos**: gracias a su entrada visual y su contexto largo, puede extraer información de diagramas, esquemas y documentos extensos (manuales, papers, informes) y resumirlos o responder preguntas.
- **Agente de automatización de tareas**: su capacidad de planificación autónoma y manejo de feedback lo hace adecuado para flujos de trabajo de automatización (gestión de correos, organización de archivos, interacción con APIs) que requieren múltiples pasos y decisiones.
- **Soporte técnico especializado**: con su contexto de 262K tokens, puede gestionar conversaciones de atención al cliente con historial largo, incluyendo capturas de pantalla o imágenes de errores.
- **Generación de documentación técnica**: puede crear documentación de código, explicaciones de arquitecturas o tutoriales a partir de código fuente o especificaciones, combinando texto e imágenes.
- **Investigación y revisión de literatura**: su capacidad de razonamiento y su contexto extenso permiten procesar artículos científicos, comparar resultados y generar resúmenes críticos, incluso con figuras y tablas visuales.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks de texto, pero solo se muestra la primera fila (Agentic terminal coding, Terminal Bench 2.1) y los encabezados de columnas (Qwen3.8-27B, Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B, Opus4.6 Max). No se proporcionan los valores numéricos de los resultados en la información extraída. Por tanto, no se puede presentar una tabla comparativa con cifras concretas. Se puede afirmar que la model card publica resultados para codificación (agente de terminal), pero los datos numéricos no están disponibles en el texto proporcionado.

No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: para un modelo denso de ~27,8B parámetros en FP16 se necesitan aproximadamente 55-56 GB de VRAM (el tamaño del repo es 55,6 GB). Con cuantización a 8 bits (Q8) se requerirían ~28 GB, y con 4 bits (Q4) ~14-15 GB, aunque estos valores son orientativos y dependen de la implementación y del contexto.
- **GPU recomendadas**: para FP16, una NVIDIA A100 80GB o H100 80GB son adecuadas. Para cuantización 4 bits, una RTX 4090 (24 GB) o RTX 3090 (24 GB) podrían ser suficientes para inferencia con contexto moderado. Para contexto 262K tokens, se necesitaría mucha más memoria (posiblemente >80 GB), por lo que se recomienda usar la versión extendida a 1M solo con GPUs de gran capacidad o con técnicas de atención eficiente.
- **Compatibilidad con consumer GPU**: sí, con cuantización 4 bits y contexto reducido, es posible ejecutarlo en una RTX 4090 (24 GB) o similar.
- **Opciones de despliegue**: compatible con Hugging Face Transformers, vLLM, SGLang y TokenSpeed (según la card). También se menciona el servicio alojado de Qwen Cloud.
- **Latencia y throughput**: no se proporcionan datos específicos. Para un modelo denso de 27B, se espera un throughput moderado en hardware profesional, pero no hay cifras verificadas.

## Comparativa con modelos similares

La model card menciona comparaciones con **Qwen3.6-27B**, **Qwen3.7-Plus**, **Muse Glimmer-30B** y **Opus4.6 Max**, pero no se incluyen valores de resultados. No hay datos disponibles para realizar una comparativa cuantitativa. Como alternativas de la misma categoría (modelos densos multimodales de ~27-30B), se podrían considerar:

| Modelo | Parametros | Contexto | Licencia | Multimodal |
|---|---|---|---|---|
| Qwen3.8-27B (este) | 27,8B | 262K (1M ext) | Apache 2.0 | Sí (imagen, vídeo) |
| Qwen3.6-27B | 27B (no confirmado) | no disponible | Apache 2.0 (probable) | Sí |
| Llama 4 Scout (Meta) | 109B (MoE, activos 17B) | 10M | Llama 4 Community License | Sí (imagen) |

No hay datos suficientes para una comparación técnica detallada.

## Limitaciones y advertencias

- **Datos de entrenamiento**: no se especifican la cantidad de tokens ni la composición del dataset, por lo que no se puede evaluar la exposición a sesgos o dominios específicos.
- **Alucinación**: como modelo de lenguaje, puede generar contenido falso o inventado, especialmente en tareas de razonamiento complejo o con contextos ambiguos.
- **Contexto largo**: aunque el contexto nativo es de 262K tokens, la extensión a 1M puede requerir recursos de memoria significativos y no se garantiza la calidad de atención en toda la ventana.
- **Idiomas**: no se especifican los idiomas soportados; es posible que el rendimiento varíe según el idioma, especialmente en lenguas minoritarias.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero es necesario revisar los términos de la licencia de los datos de entrenamiento, que no se indican.
- **Repositorio sin difusión**: el repo tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad. Es recomendable probar el modelo en un entorno controlado antes de usarlo en producción.
- **Falta de benchmarks**: no hay resultados de benchmarks verificables en la información disponible, por lo que no se puede afirmar que el rendimiento sea superior a otros modelos.

## Enlaces

- Repositorio HuggingFace: [ark4004/llama3.8](https://huggingface.co/ark4004/llama3.8)
- Servicio alojado Qwen Cloud (mención en la model card): [Qwen3.8-27B Overview](https://www.qwencloud.com/models/qwen3.8-27b) (próximamente disponible)
- No se han encontrado papers, blogs o demos adicionales en la búsqueda web.
