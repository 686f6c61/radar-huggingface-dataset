# Openintelligent123/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje multimodal denso (no MoE) desarrollado por el equipo Qwen de Alibaba, publicado bajo licencia Apache 2.0. Se presenta como la generación más capaz de la familia Qwen3.8, construida sobre la base arquitectónica de Qwen3.5, con mejoras sustanciales en codificación, trabajo profesional, investigación y tareas agénticas de largo horizonte. El modelo combina un codificador de visión con un modelo de lenguaje causal, lo que le permite comprender imágenes y vídeos de forma nativa, desde diagramas STEM hasta vídeos de una hora de duración.

Con 27.781 millones de parámetros y una ventana de contexto nativa de 262.144 tokens (ampliable a 1.000.000), Qwen3.8-27B está diseñado para ser desplegado en hardware local sin renunciar a capacidades de frontera. Su arquitectura híbrida alterna capas de atención lineal (Gated DeltaNet) con capas de atención estándar (Gated Attention), e incorpora entrenamiento con predicción multi-token (MTP). El modelo incluye un modo de pensamiento flexible, activado por defecto y ajustable mediante parámetros como `reasoning_effort` y `preserve_thinking`, lo que lo hace adecuado para tareas que requieren razonamiento profundo y control del proceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model with Vision Encoder (híbrida: Gated DeltaNet + Gated Attention + FFN) |
| Parametros totales | 27.781.427.952 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos, extensible a 1.000.000 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo denso de tipo "Causal Language Model with Vision Encoder". Su bloque de lenguaje está compuesto por 64 capas organizadas en un patrón repetitivo: 16 bloques, cada uno formado por 3 subcapas de (Gated DeltaNet → FFN) seguidas de 1 subcapa de (Gated Attention → FFN). Esta alternancia entre atención lineal y atención estándar reduce el coste computacional en secuencias largas, manteniendo la capacidad de modelar dependencias globales.

La capa Gated DeltaNet utiliza 48 cabezas lineales para V y 16 para QK, con dimensión de cabeza 128. La capa Gated Attention emplea 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y dimensión de RoPE 64. El feed-forward network tiene una dimensión intermedia de 17.408. El modelo fue entrenado con predicción multi-token (MTP) en múltiples pasos, lo que mejora la eficiencia en la generación. El proceso de entrenamiento incluye pre-training y post-training, aunque la información disponible no detalla el número de tokens ni la composición del dataset. Tampoco se especifica si se utilizó RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento con control flexible del pensamiento: el modo de pensamiento está activado por defecto y puede desactivarse por petición; la profundidad del razonamiento se ajusta con `reasoning_effort` y el contexto de razonamiento histórico se conserva con `preserve_thinking`.
- Comprensión nativa de imágenes y vídeos: el modelo procesa diagramas STEM, documentos con contenido visual y vídeos de hasta una hora de duración.
- Ejecución de tareas agénticas de largo horizonte: planificación autónoma robusta y manejo de feedback del entorno para completar tareas multi-paso de forma fiable.
- Mejoras en codificación, trabajo profesional, investigación y automatización de oficina, según los highlights del fabricante.
- Compatibilidad con herramientas de despliegue populares: Transformers, vLLM, SGLang y TokenSpeed.
- Soporte de tool calling / function calling: no especificado en la documentación proporcionada. El fabricante menciona "official built-in tools" para la versión alojada en Qwen Cloud, pero no se detalla para el modelo open.
- Capacidades multilingües: no especificadas en la información disponible.

## Casos de uso

- Programación agéntica en terminal: Qwen3.8-27B destaca en benchmarks como Terminal Bench 2.1 (Terminus), lo que lo hace adecuado para asistentes de codificación que ejecutan comandos, interpretan salidas y corrigen errores de forma autónoma.
- Automatización de oficina: según el repositorio oficial de GitHub, el modelo sobresale en tareas de automatización ofimática, como generación de informes, resúmenes de documentos y gestión de flujos de trabajo.
- Análisis de documentos técnicos con contenido visual: gracias a su codificador de visión, puede extraer información de diagramas STEM, planos y figuras en documentos de investigación.
- Revisión de vídeos de larga duración: el modelo procesa vídeos de hasta una hora, lo que permite su uso en sistemas de análisis de contenido audiovisual, vigilancia o resumen de grabaciones largas.
- Agentes autónomos de largo horizonte: la combinación de planificación robusta y manejo de feedback del entorno lo hace útil para agentes que deben completar tareas complejas en entornos simulados o reales, como navegación web o ejecución de pipelines.
- Despliegue local en estaciones de trabajo de gama alta: al ser un modelo denso de 27B, puede ejecutarse en GPUs de consumidor de gama alta con cuantización, o en GPUs de centro de datos para inferencia en producción. La compatibilidad con vLLM y SGLang facilita la integración en servicios existentes.

## Benchmarks y rendimiento

La información proporcionada incluye una tabla comparativa de benchmarks de texto que menciona las categorías "Coding" y "Agentic terminal coding" con el benchmark "Terminal Bench 2.1 (Terminus)", comparando Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max. Sin embargo, el extracto disponible no contiene los valores numéricos de los resultados. Por tanto, no se pueden presentar cifras concretas de rendimiento en esta ficha.

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | No disponible | No disponible | No disponible | No disponible | No disponible |

## Requisitos de hardware

- El repositorio de HuggingFace tiene un tamaño de 55.6 GB, lo que corresponde a pesos en FP16/BF16 para los 27.78B de parámetros.
- Para inferencia sin cuantización se estima que se necesita una GPU con al menos 60-70 GB de VRAM, como una A100 80GB o una H100 80GB.
- Con cuantización a 4 bits, la VRAM requerida se reduciría a aproximadamente 15-20 GB, aunque no se proporcionan cuantizaciones oficiales en el repositorio.
- El modelo es compatible con vLLM, SGLang, TokenSpeed, Transformers y el servicio gestionado Qwen Cloud.
- No se dispone de datos de latencia ni throughput en la información proporcionada.

## Comparativa con modelos similares

La comparativa se basa en los modelos mencionados en la tabla de benchmarks del README. No se dispone de especificaciones completas para todos ellos en la información proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B | 27.78B | 262.144 (ext. 1M) | Apache 2.0 | Abierto en HuggingFace |
| Qwen3.6-27B | No disponible | No disponible | No disponible | No disponible |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible |
| Muse Glimmer-30B | No disponible | No disponible | No disponible | No disponible |
| Opus4.6 Max | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No se especifican los idiomas soportados, por lo que la cobertura multilingüe es desconocida.
- No se detallan sesgos conocidos ni riesgos de alucinación en la documentación disponible.
- El modelo es reciente (creado en septiembre de 2026) y presenta baja adopción (0 descargas y 0 likes en HuggingFace en el momento de la consulta), lo que implica una comunidad de soporte limitada.
- La tabla de benchmarks está incompleta en la información proporcionada, por lo que no es posible validar su rendimiento frente a alternativas.
- La licencia Apache 2.0 permite uso comercial, pero es necesario revisar los términos completos de la licencia y las políticas de uso del fabricante.
- El despliegue en producción requiere versiones recientes de las herramientas compatibles (vLLM, SGLang, TokenSpeed) para soportar la arquitectura híbrida.

## Enlaces

- HuggingFace: https://huggingface.co/Openintelligent123/Qwen3.8-27B
- GitHub oficial: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guía de despliegue local: https://linas.substack.com/p/qwen3-8-27b-local-guide
- Qwen Cloud (modelo alojado): https://www.qwencloud.com/models/qwen3.8-27b
