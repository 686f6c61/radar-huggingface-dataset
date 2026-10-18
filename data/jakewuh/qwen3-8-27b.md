# JAKEWUH/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión integrado, publicado bajo licencia Apache 2.0 y distribuido en formato Hugging Face Transformers (safetensors). Según su model card, se trata de la generación más reciente de la familia abierta Qwen, construida sobre la base arquitectónica de Qwen3.5 y orientada a cargas de trabajo de código, trabajo profesional, investigación y tareas agénticas de horizonte largo. El modelo combina atención lineal (Gated DeltaNet) con atención completa (Gated Attention) en un apilamiento híbrido de 64 capas y 27.781.427.952 parámetros totales (~27,8B), con una dimensión oculta de 5120 y una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.000.000.

El interés práctico del modelo reside en tres ejes: es denso (no MoE), por lo que su despliegue es predecible en memoria y latencia; incorpora comprensión nativa de imagen y vídeo, incluyendo vídeos de hasta una hora; y añade control flexible del modo de razonamiento (`reasoning_effort` y `preserve_thinking`) que permite desactivar el pensamiento por petición. La model card cita compatibilidad con Transformers, vLLM, SGLang y TokenSpeed, lo que facilita su integración en pilas de inferencia ya existentes.

Conviene señalar que el repositorio analizado (`JAKEWUH/Qwen3.8-27B`) es una publicación de un tercero, no de la organización Qwen: registra 0 descargas y 0 likes en el momento de la consulta y fue creado el 17 de octubre de 2026. La model card, no obstante, remite a la documentación y al servicio gestionado oficiales de Qwen Cloud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con codificador de visión; 64 capas con layout 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 27.781.427.952 (~27,8B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible en la model card; el repositorio solo contiene safetensors (55,6 GB, coherente con pesos en bf16). No se listan variantes GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | no disponible (la model card no enumera idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Hugging Face Transformers) |
| Dimensión oculta | 5120 |
| Dimensión intermedia (FFN) | 17.408 |
| Vocabulario / embeddings | 248.320 (con padding) |
| Cabezas de atención | Gated DeltaNet: 48 para V, 16 para QK, dimensión 128. Gated Attention: 24 para Q, 4 para KV, dimensión 256, RoPE de 64 |
| Predicción multi-token (MTP) | Entrenada con múltiples pasos |
| Etapa de entrenamiento | Pre-entrenamiento y post-entrenamiento |
| Pipeline declarado | image-text-to-text |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con un codificador de visión añadido para entrada image-text-to-text. La innovación estructural principal es el apilamiento híbrido: de las 64 capas, 48 corresponden a Gated DeltaNet (atención lineal con 48 cabezas de valor y 16 de query/key, dimensión de cabeza 128) y 16 a Gated Attention clásica (24 cabezas de query y solo 4 de KV, dimensión de cabeza 256, RoPE de 64). Este diseño reduce el coste de atención en secuencias largas y, de forma derivada, mantiene contenido el crecimiento de la caché KV, ya que solo una cuarta parte de las capas mantiene estado de atención completa. El FFN tiene dimensión intermedia de 17.408 y el vocabulario está fijado en 248.320 entradas con padding.

El entrenamiento cubre las fases de pre-entrenamiento y post-entrenamiento, e incluye predicción multi-token (MTP) entrenada en varios pasos, un mecanismo habitualmente asociado a decodificación especulativa y a la mejora del rendimiento por paso en inferencia. La model card no detalla el volumen de tokens de entrenamiento, la composición del corpus, ni si se emplearon RLHF, DPO u otras técnicas de alineación concretas; tampoco especifica el método de extensión de contexto hasta 1M. La información disponible tampoco permite confirmar la naturaleza del codificador de visión ni su resolución de entrada.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento activado por defecto, desactivable por petición.
- Control de profundidad de razonamiento mediante el parámetro `reasoning_effort`, y retención del contexto de razonamiento de mensajes históricos mediante `preserve_thinking`.
- Comprensión nativa de imagen: diagramas STEM, documentos y capturas.
- Comprensión de vídeo, incluyendo vídeos de escala horaria según la model card.
- Codificación y tareas de terminal agénticas: la tarjeta incluye Terminal Bench 2.1 (Terminus) entre sus evaluaciones.
- Ejecución agéntica: planificación autónoma y manejo de retroalimentación del entorno orientados a completar tareas de extremo a extremo.
- Soporte declarado de integración con arneses y herramientas de desarrollo populares (sin listado explícito en la información disponible).
- Compatibilidad con tool calling / function calling: no se detalla en el extracto disponible, aunque la referencia a herramientas integradas oficiales en la versión alojada sugiere soporte en el servicio gestionado.
- Capacidades multilingües: no disponible.

## Casos de uso

- Automatización de tareas de terminal y CI/CD: el modelo está evaluado en Terminal Bench 2.1 (Terminus) y declara mejor manejo de la retroalimentación del entorno, por lo que encaja en agentes que ejecutan comandos, interpretan errores de build y aplican correcciones iterativas dentro de un pipeline.
- Análisis de documentación técnica extensa: con 262.144 tokens nativos (ampliables a 1M) puede ingerir manuales, especificaciones y repositorios completos en una sola pasada, sin troceado agresivo ni pérdida de referencias cruzadas.
- Revisión de código en producción: su foco declarado en coding y su formato safetensors compatible con vLLM y SGLang permiten desplegarlo como servicio interno de revisión de pull requests con razonamiento desactivable para respuestas rápidas y activable para revisiones profundas.
- Extracción de datos de documentos con componente visual: al ser image-text-to-text nativo, puede procesar diagramas, tablas escaneadas y capturas de paneles de control, devolviendo estructuras normalizadas sin depender de un OCR externo.
- Análisis de vídeo para soporte y auditoría: la comprensión de vídeo de escala horaria habilita resúmenes de grabaciones de sesiones, detección de incidencias en demos de producto o generación de actas a partir de material audiovisual.
- Asistente de investigación con control de coste: el ajuste de `reasoning_effort` por petición permite usar razonamiento superficial en consultas triviales y profundo en problemas de varios pasos, con `preserve_thinking` para mantener coherencia en conversaciones largas.
- Agente de atención al cliente multi-turno: la ventana de contexto larga y la retención de contexto de razonamiento histórico permiten gestionar hilos extensos con historial de incidencias y adjuntos de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye una tabla comparativa de rendimiento (con apartados como Coding y Agentic terminal coding, Terminal Bench 2.1 Terminus) frente a Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero los valores numéricos de esa tabla no están presentes en el contenido recuperado, por lo que no se reproducen aquí.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 55,6 GB solo para pesos (tamaño del repositorio), más caché KV y buffers; requiere GPUs de 80 GB para dejar margen operativo.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB, H200; también configuraciones multi-GPU con tensor parallelism en vLLM o SGLang.
- Cuantización a 8 bits: pesos en torno a 28 GB, viable en una A100 40 GB o en dos GPU de 24 GB.
- Cuantización a 4 bits: pesos en torno a 14-16 GB, lo que permitiría ejecución en una RTX 4090 (24 GB) o RTX 5090, siempre que exista una build compatible; la model card no publica checkpoints cuantizados, por lo que habría que generarlos.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090/5090 con cuantización de 4-8 bits; en bf16 no cabe en 24 GB.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card. No se menciona soporte explícito de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El uso de MTP y de atención lineal en 48 de las 64 capas sugiere ventajas en generación larga, pero no hay cifras publicadas en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27,8B (denso) | 262.144 (ext. a 1M) | Apache 2.0 | Pesos abiertos en HF; API gestionada anunciada en Qwen Cloud | no disponible (tabla de la card truncada) |
| Qwen3.6-27B | ~27B (deducido del nombre; no confirmado en la información) | no disponible | no disponible | no disponible | no disponible |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible | no disponible |
| Muse Glimmer-30B | ~30B (deducido del nombre; no confirmado) | no disponible | no disponible | no disponible | no disponible |
| Opus4.6 Max | no disponible | no disponible | no disponible | no disponible | no disponible |

Los cuatro modelos anteriores aparecen como referencias en la tabla comparativa de la model card, pero la información recuperada no incluye sus especificaciones ni sus resultados.

## Limitaciones y advertencias

- Repositorio de terceros: `JAKEWUH/Qwen3.8-27B` no pertenece a la organización oficial Qwen y presenta 0 descargas y 0 likes; para producción conviene verificar la procedencia de los pesos frente al repositorio oficial.
- Idiomas no declarados: la model card no enumera idiomas soportados, por lo que el rendimiento en castellano no está documentado y debe evaluarse empíricamente antes de desplegar.
- Sin datos de benchmarks verificables en la información disponible: no es posible justificar decisiones de sustitución de modelo con cifras.
- Riesgo de alucinación: no cuantificado en la documentación; en tareas agénticas con ejecución de comandos, una alucinación puede tener consecuencias operativas, por lo que se recomienda sandboxing y validación de acciones.
- Sesgos: no se documenta ninguna evaluación de sesgo, toxicidad o seguridad en la información disponible.
- Contexto de 1M: se anuncia como extensible, no nativo; la calidad fuera de los 262.144 tokens nativos no está garantizada ni medida.
- Cuantizaciones: no hay checkpoints cuantizados publicados; cualquier despliegue en 4 u 8 bits requiere conversión propia y validación de degradación.
- Licencia Apache 2.0 en este repositorio, pero el uso comercial de la familia Qwen puede estar sujeto además a los términos del proyecto original; conviene revisarlos antes de un despliegue comercial.
- Modo de pensamiento activo por defecto: incrementa latencia y consumo de tokens; en entornos de alta concurrencia hay que desactivarlo explícitamente o regular `reasoning_effort`.
- Fecha de creación posterior a la del conocimiento de referencia habitual: verificar que las herramientas de inferencia instaladas soportan la arquitectura `qwen3_5` antes de intentar cargar los pesos.

## Enlaces

- Hugging Face: https://huggingface.co/JAKEWUH/Qwen3.8-27B
- Página del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
- Servicio Qwen Cloud: https://www.qwencloud.com
- Papers, blogs, repositorios o demos adicionales: no disponible en la información proporcionada.
