# sashka350/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión, publicado en Hugging Face por el usuario sashka350 bajo licencia Apache 2.0. Según la model card, se presenta como la generación más capaz de la familia de modelos abiertos Qwen hasta la fecha, construida sobre la base arquitectónica de Qwen3.5 y con mejoras en programación, trabajo profesional, investigación y tareas agénticas de largo horizonte. El modelo tiene 27.781.427.952 parámetros reales según los pesos en safetensors, con una dimensión oculta de 5120, 64 capas y una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.000.000.

La arquitectura combina capas de atención lineal Gated DeltaNet con capas de atención con compuerta (Gated Attention) en un patrón repetido de 16 bloques, cada uno con tres subcapas de Gated DeltaNet seguidas de una de Gated Attention, todas con FFN. Incorpora además Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que permite decodificación especulativa y aceleración de la inferencia. Es un modelo nativo visión-lenguaje, capaz de entender imágenes y vídeos, con control flexible del modo de razonamiento.

Su relevancia actual radica en que ofrece capacidades agénticas y multimodales en un tamaño compacto y desplegable (27B densos), compatible con Transformers, vLLM, SGLang y TokenSpeed, y con una licencia permisiva que facilita su uso comercial. El repositorio ocupa 55,6 GB y no registra descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrido de Gated DeltaNet (atención lineal) y Gated Attention; MTP (Multi-Token Prediction) |
| Parametros totales | 27.781.427.952 (27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal con codificador de visión, entrenado en dos etapas: pre-entrenamiento y post-entrenamiento. La columna vertebral del lenguaje tiene 64 capas con una disposición oculta de 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)). Las capas de Gated DeltaNet emplean 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. Las capas de Gated Attention usan 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y dimensión de Rotary Position Embedding de 64. La FFN tiene dimensión intermedia de 17.408, la dimensión oculta es 5120 y el vocabulario (embedding y salida LM) es de 248.320 tokens con padding.

El entrenamiento incluye Multi-Token Prediction (MTP) con múltiples pasos, una innovación que permite al modelo predecir varios tokens futuros de forma simultánea y que habilita decodificación especulativa para acelerar la generación. La model card no especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas concretas de RLHF o DPO, por lo que esos datos deben considerarse no disponibles.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento (thinking mode) activado por defecto y desactivable por petición.
- Control flexible de la profundidad de razonamiento mediante `reasoning_effort`, y retención del contexto de razonamiento de mensajes históricos mediante `preserve_thinking`.
- Comprensión nativa de imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Programación y tareas de coding agéntico, con soporte para entornos de terminal (Terminal Bench).
- Ejecución agéntica autónoma: planificación y manejo de retroalimentación del entorno para completar tareas de extremo a extremo.
- Compatibilidad con harnesses y herramientas de desarrollo populares (Transformers, vLLM, SGLang, TokenSpeed).
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible, aunque la model card menciona "official built-in tools" para la versión alojada en Qwen Cloud.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 262.144 tokens de ventana nativa, manteniendo el hilo de la conversación y el razonamiento previo mediante `preserve_thinking`.
- Generación de código en producción: su orientación a coding agéntico y terminal permite integrarlo en pipelines de CI/CD para tareas de corrección, refactorización y ejecución de comandos en entornos controlados.
- Análisis de documentos técnicos y diagramas STEM: al ser un modelo visión-lenguaje nativo, puede extraer información de figuras, esquemas y documentos escaneados sin necesidad de un pipeline OCR separado.
- Procesamiento de vídeo de larga duración: la comprensión de vídeos de hasta una hora lo hace adecuado para resumen y análisis de grabaciones, reuniones o material audiovisual.
- Agentes autónomos de investigación: su planificación autónoma y manejo de retroalimentación del entorno permiten encadenar pasos de búsqueda, lectura y síntesis en tareas de investigación de largo horizonte.
- Asistencia en desarrollo con control de razonamiento: mediante `reasoning_effort` se puede ajustar la profundidad de razonamiento por petición, reduciendo coste en tareas simples y aumentándolo en tareas complejas.
- Despliegue en infraestructura propia: al ser compatible con vLLM, SGLang y TokenSpeed, puede servirse en clústeres propios con licencia Apache 2.0 para uso comercial.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks en HTML que compara Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max en categorías como Coding (Agentic terminal coding, Terminal Bench 2.1 Terminus). Sin embargo, los valores numéricos de esa tabla no están disponibles en la información proporcionada: el HTML está truncado y no se pueden extraer las cifras. Por tanto:

No se han publicado resultados de benchmarks completos y verificables en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27.781 millones de parámetros, en precisión completa (BF16) se requieren aproximadamente 55,6 GB de VRAM solo para los pesos, más memoria para el KV cache y activaciones. En cuantización de 8 bits se estiman unos 28 GB, y en 4 bits unos 14-16 GB, aunque estos valores son estimaciones y no están confirmados en la información disponible.
- GPU recomendadas: para BF16 se recomienda A100 80 GB, H100 80 GB o varias GPUs de 40-48 GB en paralelo. Para cuantización de 8 bits, una A100 40 GB o H100 podría ser suficiente.
- ¿Cabe en GPU de consumo? En cuantización de 4 bits podría caber en una RTX 4090 (24 GB) o RTX 5090, aunque el KV cache para contextos largos (262K tokens) eleva significativamente los requisitos y probablemente exija offloading o GPUs de mayor memoria.
- Opciones de despliegue: Transformers, vLLM, SGLang y TokenSpeed, según la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B | 27B (denso) | 262.144 nativo, hasta 1.000.000 | apache-2.0 | Hugging Face (sashka350) |
| Qwen3.6-27B | no disponible | no disponible | no disponible | Referenciado en benchmarks de la model card |
| Muse Glimmer-30B | no disponible | no disponible | no disponible | Referenciado en benchmarks de la model card |
| Opus4.6 Max | no disponible | no disponible | no disponible | Referenciado en benchmarks de la model card |

Los modelos comparables citados en la model card (Qwen3.6-27B, Muse Glimmer-30B, Opus4.6 Max) aparecen únicamente como referencias en la tabla de benchmarks, pero no se dispone de sus especificaciones técnicas ni de sus resultados numéricos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; como todo modelo entrenado con datos web, es probable que herede sesgos, pero no se documentan.
- Riesgo de alucinación: no cuantificado en la información disponible; el modo de razonamiento activado por defecto puede mitigarlo parcialmente, pero no se ofrecen garantías.
- Limitaciones de contexto o idioma: el contexto nativo es de 262.144 tokens, pero la extensión hasta 1.000.000 puede degradar la calidad; los idiomas soportados no están documentados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribución.
- Caveats para producción: el repositorio no registra descargas (0) y solo tiene 1 like, lo que sugiere que es una publicación reciente o poco validada por la comunidad; se recomienda verificar la procedencia de los pesos antes de usarlos en producción. La model card menciona que la versión alojada en Qwen Cloud ofrecerá 1M de contexto por defecto y herramientas oficiales integradas, lo que indica que la versión local puede carecer de esas características.
- El HTML de la tabla de benchmarks está truncado, por lo que no se pueden verificar los resultados de rendimiento declarados.

## Enlaces

- Hugging Face: https://huggingface.co/sashka350/Qwen3.8-27B
- Qwen Cloud (servicio alojado): https://www.qwencloud.com
- Qwen3.8-27B Overview (Qwen Cloud): https://www.qwencloud.com/models/qwen3.8-27b
