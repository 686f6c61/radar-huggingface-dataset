# Cradia/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión desarrollado por el equipo Qwen (Alibaba) y publicado en Hugging Face bajo el identificador Cradia/Qwen3.8-27B. Se presenta como la generación más capaz de la familia de modelos abiertos Qwen hasta la fecha, construida sobre la base arquitectónica de Qwen3.5, y está diseñado para tareas de codificación, trabajo profesional, investigación y tareas agénticas de largo horizonte. Es un modelo denso de 27 000 millones de parámetros (27,78 mil millones reales según los pesos en safetensors) con comprensión nativa de imagen y vídeo, control flexible del modo de razonamiento y una longitud de contexto nativa de 262 144 tokens, extensible hasta 1 000 000.

El modelo emplea una arquitectura híbrida poco habitual que combina capas de atención lineal Gated DeltaNet con capas de atención con compuerta (Gated Attention), organizadas en un patrón repetido de 16 bloques de 3 capas DeltaNet más 1 capa de atención completa. Incorpora además Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que habilita decodificación especulativa y mejora el throughput. Su licencia Apache 2.0 y su compatibilidad con Transformers, vLLM, SGLang y TokenSpeed lo hacen relevante para despliegues en producción sin restricciones comerciales.

La relevancia actual del modelo radica en tres ejes: un contexto muy largo (hasta 1M tokens) en un tamaño denso manejable, capacidades agénticas reforzadas con mejor planificación autónoma y manejo de retroalimentación del entorno, y soporte nativo de visión y vídeo (incluidos vídeos de hasta una hora). No obstante, la ficha pública carece de información sobre idiomas soportados, datos de entrenamiento y parte de los resultados de benchmarks, que se detallan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con codificador de visión; layout 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 27 781 427 952 (27,78 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativos; extensible hasta 1 000 000 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con codificador de visión integrado. La dimensión oculta es de 5120, con 64 capas y un vocabulario de 248 320 tokens (con padding). La innovación arquitectónica principal es la disposición híbrida: por cada bloque de 16 capas se intercalan tres capas de Gated DeltaNet (atención lineal con 48 cabezas para V y 16 para QK, dimensión de cabeza 128) seguidas de una capa de Gated Attention (24 cabezas para Q, 4 para KV, dimensión de cabeza 256, RoPE de 64 dimensiones). La red feed-forward tiene dimensión intermedia de 17 408. Esta combinación de atención lineal y atención completa busca reducir el coste computacional en contextos largos manteniendo la calidad de la atención completa en puntos clave.

El entrenamiento comprende fases de pre-entrenamiento y post-entrenamiento, e incluye Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que permite decodificación especulativa y mayor eficiencia de generación. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. El modelo incorpora control flexible del pensamiento: el modo thinking está activado por defecto, puede desactivarse por petición, la profundidad de razonamiento se ajusta mediante `reasoning_effort` y el contexto de razonamiento de mensajes históricos se conserva mediante `preserve_thinking`.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento controlable (activado por defecto, desactivable por petición, con ajuste de profundidad vía `reasoning_effort`).
- Codificación y tareas de terminal agénticas (evaluado en Terminal Bench 2.1).
- Comprensión nativa de imagen y vídeo, incluidos diagramas STEM, documentos y vídeos de escala horaria.
- Planificación autónoma y ejecución de tareas de largo horizonte con manejo de retroalimentación del entorno.
- Soporte de tool calling y function calling (mencionado de forma implícita en el contexto de herramientas oficiales de la API; no se detalla el formato exacto en la información disponible).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Compatibilidad con harnesses y herramientas de desarrollo populares para integración en stacks existentes.

## Casos de uso

- **Codificación agéntica en terminal:** el modelo puede ejecutar tareas de codificación de extremo a extremo en entornos de terminal, planificando pasos y reaccionando a la retroalimentación del entorno, gracias a sus capacidades agénticas reforzadas y a su evaluación en Terminal Bench 2.1.
- **Análisis de documentos técnicos y diagramas STEM:** con su codificador de visión nativo, puede interpretar diagramas, figuras y documentos científicos para extraer información estructurada o responder preguntas sobre ellos.
- **Comprensión de vídeo de larga duración:** el soporte nativo de vídeos de hasta una hora permite resumir reuniones, analizar grabaciones de clase o extraer eventos de material audiovisual extenso.
- **Asistentes de investigación con contexto largo:** la ventana nativa de 262 144 tokens (extensible a 1M) permite procesar corpus extensos, múltiples papers o bases de código completas en una sola sesión sin fragmentación.
- **Atención al cliente multi-turno:** el modelo puede mantener conversaciones prolongadas con historial extenso y conservar el contexto de razonamiento entre mensajes (`preserve_thinking`), lo que mejora la coherencia en interacciones largas.
- **Automatización de flujos de trabajo profesionales:** tareas de trabajo profesional como redacción técnica, análisis de datos o generación de informes se benefician de las mejoras declaradas en esta área y del control de profundidad de razonamiento.
- **Integración en pipelines de desarrollo:** su compatibilidad con vLLM, SGLang y TokenSpeed permite desplegarlo como servicio de inferencia en infraestructura existente, con soporte para harnesses y herramientas de desarrollo populares.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados comparativos, pero en la información proporcionada solo se conserva el encabezado y la estructura de la tabla, sin los valores numéricos de las celdas. La tabla compara Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max en categorías como Coding (Agentic terminal coding, Terminal Bench 2.1 Terminus). Los valores concretos no están disponibles en la información suministrada.

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han publicado en la información disponible resultados numéricos de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- **VRAM estimada para inferencia:** con 27,78 mil millones de parámetros, en FP16/BF16 se requieren aproximadamente 56 GB de VRAM solo para los pesos (el repositorio ocupa 55,6 GB). En cuantización de 8 bits, alrededor de 28 GB; en 4 bits, alrededor de 14-16 GB (estimaciones teóricas, no confirmadas en la información disponible).
- **GPU recomendadas:** para BF16 se necesitan GPU de 80 GB como A100 80GB o H100. Para cuantizaciones de 8 bits, una RTX 4090 (24 GB) podría ser insuficiente para los pesos completos más el contexto; una A6000 (48 GB) o L40S (48 GB) serían más adecuadas.
- **Consumer GPU:** en cuantización de 4 bits podría caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque el contexto largo y el codificador de visión incrementan los requisitos de memoria KV.
- **Opciones de despliegue:** Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card. No se menciona soporte explícito de llama.cpp u Ollama en la información disponible.
- **Latencia y throughput:** no disponibles. La presencia de MTP (Multi-Token Prediction) sugiere mejoras de throughput mediante decodificación especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B | 27,78 B (denso) | 262 144 nativo; hasta 1M | Apache 2.0 | Modelo analizado; visión nativa, MTP, thinking controlable |
| Qwen3.6-27B | No disponible | No disponible | No disponible | Generación anterior de la familia; incluido en la tabla comparativa del autor |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | Variante Plus de la familia; incluido en la tabla comparativa del autor |
| Muse Glimmer-30B | ~30 B (según nombre) | No disponible | No disponible | Modelo comparable de otro desarrollador; incluido en la tabla comparativa del autor |
| Opus4.6 Max | No disponible | No disponible | No disponible | Modelo de referencia propietario; incluido en la tabla comparativa del autor |

Los datos de rendimiento comparativo no están disponibles en la información suministrada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- **Sesgos conocidos:** no se documentan en la información disponible; como todo modelo entrenado con datos web a gran escala, es probable que herede sesgos de sus datos de entrenamiento, pero no se aportan detalles.
- **Riesgo de alucinación:** no se cuantifica en la model card; el modo de razonamiento activado por defecto puede reducir pero no eliminar las alucinaciones.
- **Limitaciones de contexto e idioma:** el contexto nativo es de 262 144 tokens; la extensión a 1M puede degradar la calidad y aumentar los requisitos de memoria. Los idiomas soportados no están documentados.
- **Licencia:** Apache 2.0 permite uso comercial sin restricciones adicionales, pero se recomienda verificar los términos de los componentes de visión y de los datos de entrenamiento, no detallados.
- **Madurez del repositorio:** el modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-21), lo que sugiere una publicación muy reciente sin validación comunitaria.
- **Servicio en la nube:** la API oficial de Qwen Cloud se anuncia como "coming soon"; la versión alojada con contexto de 1M por defecto y herramientas integradas aún no está disponible.
- **Datos incompletos:** no se especifican datos de entrenamiento, composición del dataset, técnicas de alineación (RLHF/DPO) ni resultados numéricos de benchmarks, lo que limita la evaluación rigurosa del modelo.

## Enlaces

- [Hugging Face: Cradia/Qwen3.8-27B](https://huggingface.co/Cradia/Qwen3.8-27B)
- [Qwen Cloud: Qwen3.8-27B Overview](https://www.qwencloud.com/models/qwen3.8-27b)
- [Qwen Cloud](https://www.qwencloud.com)
