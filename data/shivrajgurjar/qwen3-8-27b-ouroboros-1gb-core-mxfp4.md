# shivrajgurjar/Qwen3.8-27B-Ouroboros-1GB-Core-MXFP4

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal denso de 27.000 millones de parámetros desarrollado por el equipo Qwen (Alibaba), presentado como la generación más capaz de la familia de modelos abiertos Qwen hasta la fecha. Se construye sobre la base arquitectónica de Qwen3.5 e incorpora un codificador de visión nativo, lo que lo convierte en un modelo visión-lenguaje capaz de procesar imágenes y vídeos además de texto. La versión aquí referenciada es un repositorio derivado publicado por el usuario `shivrajgurjar` bajo el identificador `Qwen3.8-27B-Ouroboros-1GB-Core-MXFP4`, con pesos en formato safetensors y cuantización MXFP4.

El modelo está orientado a tareas de codificación, trabajo profesional, investigación y flujos agénticos de largo horizonte, con control flexible del modo de razonamiento (thinking mode activado por defecto y desactivable por petición). Su contexto nativo es de 262.144 tokens, extensible hasta 1.000.000. La licencia declarada es Apache 2.0.

Es relevante ahora porque condensa en un modelo denso de despliegue asequible las mejoras de la generación Qwen3.8 en planificación autónoma, manejo de retroalimentación del entorno y compatibilidad con arneses de desarrollo populares, manteniendo soporte nativo de visión y una ventana de contexto muy amplia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con codificador de visión; layout híbrido Gated DeltaNet (atención lineal) + Gated Attention |
| Parametros totales | 27B |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | MXFP4 (variante del repositorio); el modelo base admite formatos estándar de Transformers |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con 64 capas y dimensión oculta de 5.120. La disposición interna es híbrida: 16 bloques de la forma `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`, es decir, combina capas de atención lineal Gated DeltaNet (48 cabezas lineales para V y 16 para QK, dimensión de cabeza 128) con capas de atención con compuerta (24 cabezas para Q y 4 para KV, dimensión de cabeza 256, dimensión RoPE 64). La red feed-forward tiene dimensión intermedia de 17.408. El vocabulario y la salida LM usan 248.320 tokens (con padding).

El entrenamiento incluye fases de preentrenamiento y postentrenamiento. Se entrenó con Multi-Token Prediction (MTP) en varios pasos, una técnica que acelera la decodificación y puede aprovecharse para decodificación especulativa. El modelo incorpora un codificador de visión para comprensión nativa de imagen y vídeo. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento (thinking) activado por defecto y desactivable por petición.
- Ajuste de la profundidad de razonamiento mediante `reasoning_effort`.
- Retención del contexto de razonamiento de mensajes históricos mediante `preserve_thinking`.
- Comprensión nativa de imágenes y vídeos (visión-lenguaje), incluyendo diagramas STEM, documentos y vídeos de hasta una hora.
- Codificación agéntica en terminal y tareas de desarrollo de software.
- Planificación autónoma y manejo de retroalimentación del entorno para completar tareas de extremo a extremo.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no detallado explícitamente en la información disponible, aunque se mencionan herramientas integradas en la versión alojada.
- Compatibilidad con arneses y herramientas de desarrollo populares.

## Casos de uso

- Codificación agéntica en terminal: el modelo puede operar en entornos de línea de comandos resolviendo tareas de varios pasos, interpretando la salida de comandos y corrigiendo el rumbo según la retroalimentación del entorno, gracias a su planificación autónoma reforzada.
- Asistencia en desarrollo de software en producción: integrable en pipelines de CI/CD y entornos de desarrollo para generación y revisión de código, con soporte de contexto largo que permite cargar repositorios o fragmentos extensos.
- Análisis de documentos técnicos y diagramas: al ser visión-lenguaje nativo, puede extraer información de diagramas STEM, esquemas y documentos escaneados y razonar sobre ellos.
- Procesamiento de vídeo de larga duración: su soporte de vídeos de hasta una hora permite resumir, indexar o responder preguntas sobre grabaciones extensas (reuniones, clases, incidencias).
- Investigación asistida: con 262.144 tokens de contexto nativo (hasta 1.000.000 extensible), puede manejar corpus de artículos, informes y notas de investigación en una sola ventana para síntesis y comparación.
- Agentes autónomos de largo horizonte: tareas que requieren decenas de pasos con realimentación del entorno, como automatización de flujos operativos o recopilación y verificación de datos.
- Atención al cliente técnica multi-turno: conversaciones largas con contexto persistente y capacidad de razonar sobre capturas o documentación aportada por el usuario.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero en la información proporcionada solo se ha conservado el encabezado y la primera fila (Agentic terminal coding, Terminal Bench 2.1 Terminus) sin los valores numéricos. No se dispone de cifras verificables para presentar una tabla de resultados.

No se han publicado resultados de benchmarks completos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión. El repositorio cuantizado MXFP4 ocupa 8,5 GB, lo que sugiere un despliegue viable en GPUs de consumo con al menos 12-16 GB de VRAM para esta variante concreta; los pesos completos en precisión nativa requerirían del orden de 54 GB (27B × 2 bytes) más overhead.
- GPU recomendadas: para la variante MXFP4, GPUs de consumo de gama alta (RTX 4090, RTX 4080) y GPUs de datacenter (A100, H100) para los pesos completos.
- Cabe en GPU de consumo: la variante MXFP4 de 8,5 GB es compatible con GPUs de consumo de 12 GB o más; los pesos completos no.
- Opciones de despliegue: Transformers, vLLM, SGLang, TokenSpeed (según la model card); llama.cpp u Ollama no se mencionan explícitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia |
|---|---|---|---|---|
| Qwen3.8-27B | 27B denso | 262.144 (hasta 1.000.000) | Sí | Apache 2.0 |
| Qwen3.6-27B | 27B (no detallado) | no disponible | no disponible | no disponible |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible |
| Muse Glimmer-30B | 30B (según nombre) | no disponible | no disponible | no disponible |

Los datos de rendimiento comparativo no están disponibles en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El repositorio es una publicación derivada de un usuario tercero (`shivrajgurjar`), no del equipo oficial de Qwen; la cuantización MXFP4 puede introducir degradación respecto a los pesos originales.
- No se dispone de información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento.
- Riesgo de alucinación inherente a los modelos de lenguaje; el modo de razonamiento activado por defecto puede aumentar la latencia y el consumo de tokens.
- Idiomas soportados no declarados en la información disponible.
- Aunque la licencia es Apache 2.0, conviene verificar los términos del modelo base original antes de uso comercial en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- Los pesos completos requieren hardware de gama alta; solo la variante cuantizada MXFP4 es viable en GPUs de consumo.
- No se han publicado resultados de benchmarks verificables en la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/shivrajgurjar/Qwen3.8-27B-Ouroboros-1GB-Core-MXFP4
- Qwen Cloud (servicio alojado): https://www.qwencloud.com
- Qwen3.8-27B Overview: https://www.qwencloud.com/models/qwen3.8-27b
