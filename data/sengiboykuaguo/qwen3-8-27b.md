# sengiboykuaguo/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje denso de 27 000 millones de parámetros, de tipo causal con codificador de visión, desarrollado por el equipo Qwen de Alibaba. Se presenta como la generación más capaz de la familia abierta Qwen hasta la fecha, construido sobre la base arquitectónica de Qwen3.5 e incorporando mejoras sustanciales en tareas de codificación, trabajo profesional, investigación y ejecución de agentes de largo horizonte. Es un modelo nativo de visión-lenguaje que comprende imágenes y vídeos, con control flexible del modo de razonamiento.

El modelo destaca por su ventana de contexto nativa de 262 144 tokens, extensible hasta 1 000 000, y por su arquitectura híbrida que combina capas de atención lineal (Gated DeltaNet) con capas de atención clásica (Gated Attention), junto con entrenamiento de predicción multi-token (MTP). Con licencia Apache 2.0, está diseñado para ser desplegado en hardware local y es compatible con los principales frameworks de inferencia como Transformers, vLLM, SGLang y TokenSpeed. Su tamaño compacto (27B) lo hace atractivo para entornos con recursos limitados sin renunciar a capacidades avanzadas de razonamiento y multimodalidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder (dense, híbrida Gated DeltaNet + Gated Attention) |
| Parametros totales | 27 781 427 952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos, extensible hasta 1 000 000 |
| Tipos de cuantizacion | No disponible (se esperan versiones GGUF, AWQ, GPTQ de la comunidad) |
| Idiomas soportados | No disponibles (no especificados en la documentación oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura de transformer causal con codificador de visión integrado. El modelo de lenguaje tiene 64 capas, dimensión oculta de 5120 y un embedding de tokens de 248 320 (con padding). La disposición interna sigue un patrón de 16 bloques, cada uno compuesto por 3 sub-bloques de (Gated DeltaNet → FFN) seguidos de 1 sub-bloque de (Gated Attention → FFN). La Gated DeltaNet utiliza 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128; la Gated Attention emplea 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de dimensión 64. La red feed-forward tiene dimensión intermedia de 17 408. Además, el modelo incorpora entrenamiento de predicción multi-token (MTP) con múltiples pasos, lo que mejora la eficiencia de generación.

El entrenamiento se realizó en dos etapas: pre-entrenamiento y post-entrenamiento, aunque no se han publicado detalles específicos sobre el volumen de tokens, la composición del dataset ni el uso de técnicas como RLHF o DPO. El modelo es nativamente multimodal, con un codificador de visión que procesa imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración. El control del razonamiento es flexible: el modo de pensamiento está activado por defecto, puede desactivarse por petición, y la profundidad del razonamiento se ajusta mediante el parámetro `reasoning_effort`, conservando el contexto de razonamiento histórico con `preserve_thinking`.

## Capacidades

- Generación de texto y razonamiento complejo, con modo de pensamiento (thinking mode) activable y desactivable por petición.
- Comprensión nativa de imágenes y vídeos, incluyendo diagramas técnicos, documentos escaneados y vídeos de larga duración (hasta una hora).
- Ejecución de agentes autónomos con planificación de múltiples pasos y manejo de feedback del entorno, mejorando la fiabilidad en tareas de largo horizonte.
- Soporte de tool calling y function calling, integrable en pipelines de automatización.
- Capacidades multilingües (idiomas no especificados oficialmente, pero se espera cobertura amplia dado el origen del modelo).
- Control fino del razonamiento mediante `reasoning_effort` y `preserve_thinking` para ajustar el equilibrio entre latencia y calidad.
- Compatibilidad con frameworks de inferencia estándar (Transformers, vLLM, SGLang, TokenSpeed) y con endpoints compatibles.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262K tokens) y comprender capturas de pantalla o imágenes enviadas por el usuario, lo que permite resolver incidencias técnicas sin intervención humana.
- Generación de código en producción: con soporte de tool calling y razonamiento estructurado, puede integrarse en pipelines de CI/CD para generar, revisar y corregir código, así como para automatizar tareas de refactorización.
- Análisis de documentos técnicos y científicos: su capacidad de visión permite extraer información de gráficos, tablas y diagramas en papers o informes, facilitando la investigación y la redacción de resúmenes.
- Agentes de automatización de oficina: puede ejecutar tareas complejas como la gestión de correos electrónicos, la creación de presentaciones o la manipulación de hojas de cálculo, interpretando tanto texto como imágenes de pantalla.
- Asistente de programación con contexto de repositorio completo: gracias a su ventana de 262K tokens, puede analizar repositorios enteros y proporcionar respuestas contextualizadas sobre arquitectura, bugs o mejoras.
- Moderación y análisis de contenido multimedia: al comprender vídeos, puede transcribir, resumir o extraer información de vídeos de larga duración, útil para plataformas de streaming o vigilancia.
- Desarrollo de chatbots con razonamiento profundo: su modo de pensamiento controlable permite desplegar asistentes que expliquen su razonamiento paso a paso, útil en educación o soporte técnico especializado.

## Benchmarks y rendimiento

Según la información publicada en la model card y en el blog de Lovable App, Qwen3.8-27B obtiene los siguientes resultados en benchmarks (comparados con modelos de referencia):

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | 73.0 | no disponible | no disponible | no disponible | no disponible |
| DeepSWE | 42.2 | no disponible | no disponible | no disponible | no disponible |
| OSWorld | 84.3 | no disponible | no disponible | no disponible | no disponible |

Nota: los valores de las columnas comparativas no se han extraído de la información disponible; la tabla original de la model card incluye más filas (Coding, Professional Work, Research, etc.) pero el texto proporcionado está truncado. Se recomienda consultar la model card completa para obtener todos los resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 27 781 millones de parámetros. En precisión FP16/BF16, el peso ocupa aproximadamente 55,6 GB (tamaño del repositorio), por lo que se necesitan al menos 60 GB de VRAM para inferencia sin cuantizar.
- Con cuantización INT8, la VRAM requerida se reduce a unos 28-30 GB; con INT4, a unos 14-16 GB, lo que permite ejecutarlo en GPUs de consumo como la RTX 4090 (24 GB) o la RTX 3090 (24 GB) con cuantización 4-bit.
- GPUs recomendadas: A100 80GB, H100 80GB, RTX 4090 (con cuantización), RTX 6000 Ada, o GPUs de datacenter con al menos 24 GB de VRAM para versiones cuantizadas.
- Opciones de despliegue: vLLM, SGLang, TokenSpeed, Hugging Face Transformers, y potencialmente llama.cpp/Ollama si la comunidad publica versiones GGUF.
- Latencia y throughput: no se han publicado datos oficiales. Se espera que con MTP y la arquitectura híbrida (atención lineal + atención clásica) la generación sea más rápida que un transformer denso puro del mismo tamaño, pero no hay cifras confirmadas.

## Comparativa con modelos similares

La comparativa se basa en los benchmarks publicados en la model card, aunque no se dispone de especificaciones completas de los modelos alternativos. Se comparan con Qwen3.6-27B (predecesor directo), Qwen3.7-Plus (modelo más grande de la familia), Muse Glimmer-30B y Opus4.6 Max (modelos de otros proveedores).

| Modelo | Parámetros | Contexto | Licencia | Rendimiento (Terminal Bench) |
|---|---|---|---|---|
| Qwen3.8-27B | 27B | 262K (ext. 1M) | Apache 2.0 | 73.0 |
| Qwen3.6-27B | 27B | no disponible | Apache 2.0 (presumible) | no disponible |
| Qwen3.7-Plus | no disponible (probablemente >27B) | no disponible | propietaria (Plus) | no disponible |
| Muse Glimmer-30B | 30B | no disponible | no disponible | no disponible |
| Opus4.6 Max | no disponible | no disponible | propietaria | no disponible |

No se dispone de datos suficientes para una comparativa técnica completa. Se recomienda consultar la model card original para acceder a la tabla completa de benchmarks.

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos o alucinaciones específicos; como todo modelo de lenguaje, puede generar contenido incorrecto o inventado, especialmente en tareas de razonamiento complejo o con entradas ambiguas.
- La ventana de contexto de 262K tokens es nativa, pero la extensión a 1M puede requerir técnicas de interpolación posicional o atención dispersa que podrían degradar ligeramente el rendimiento en contextos muy largos.
- Los idiomas soportados no están especificados oficialmente; aunque se espera un buen rendimiento en inglés y chino (por el origen del modelo), el comportamiento en otros idiomas no está garantizado.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo puede incorporar componentes (como el codificador de visión) con licencias adicionales; se recomienda revisar los términos completos.
- El tamaño del repositorio (55,6 GB) implica que la descarga y el despliegue requieren un ancho de banda y almacenamiento considerables; para entornos de producción con restricciones de memoria, es imprescindible usar cuantización.
- No se han publicado resultados de benchmarks en tareas estándar como MMLU, HumanEval o GSM8K en la información disponible; los datos presentados se centran en tareas de agente y terminal, que pueden no reflejar el rendimiento general en otras áreas.

## Enlaces

- HuggingFace (modelo original): https://huggingface.co/Qwen/Qwen3.8-27B
- HuggingFace (mirror del usuario): https://huggingface.co/sengiboykuaguo/Qwen3.8-27B
- GitHub oficial: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- LM Studio: https://lmstudio.ai/models/qwen/qwen3.8-27b
- Blog de referencia: https://lovableapp.org/blog/qwen3-8-27b
- Qwen Cloud (servicio gestionado, próximamente): https://www.qwencloud.com/models/qwen3.8-27b
