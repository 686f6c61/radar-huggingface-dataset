# Qwen/Qwen3.8-2.4T-A95B-FP8

## Resumen

Qwen3.8-2.4T-A95B-FP8 es la versión cuantizada en FP8 del modelo Qwen3.8-2.4T-A95B, desarrollado por el equipo Qwen de Alibaba. Se trata de un modelo de lenguaje causal de tipo Mixture of Experts (MoE) con 2,4 billones de parámetros totales y 95.000 millones activos por token, lo que lo sitúa en la categoría de modelos de escala frontera. Es la primera vez que Qwen libera abiertamente un modelo de la clase Qwen-Max, históricamente reservada a su API propietaria.

El modelo emplea una arquitectura híbrida que combina capas de atención lineal (Gated DeltaNet) con capas de atención con compuertas (Gated Attention), organizadas en un patrón repetitivo de 23 bloques. Incorpora entrenamiento con Multi-Token Prediction (MTP) y ofrece una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.010.000. La versión FP8 utiliza cuantización de grano fino con bloques de 128, y el autor afirma que sus métricas de rendimiento son prácticamente idénticas a las del modelo original.

Su relevancia actual radica en que acerca capacidades de nivel propietario (agentes de código de horizonte largo, tareas profesionales y de investigación) al ecosistema de pesos abiertos, con compatibilidad declarada con vLLM, SGLang y TokenSpeed. La licencia es propietaria (`qwen3.8-max`), un punto crítico para cualquier uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido: Gated DeltaNet (atención lineal) + Gated Attention, con MoE |
| Parámetros totales | 2.446.182.725.504 (2,4 T) |
| Parámetros activos | 95 B (10 expertos enrutados + 1 compartido, de 512 totales) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantización | FP8 de grano fino con tamaño de bloque 128 (esta versión); pesos originales en el modelo base |
| Idiomas soportados | no disponible |
| Licencia | `qwen3.8-max` (licencia "other", propietaria; ver LICENSE en el repo) |
| Formato de pesos | safetensors (transformers); compatible con vLLM, SGLang y TokenSpeed |

Otros datos de arquitectura: dimensión oculta 8192, 92 capas, embedding de 248.320 tokens (con padding), dimensión intermedia de experto 2048, 128 cabezas de atención lineal para V y 16 para QK (dimensión 128), 64 cabezas de atención para Q y 4 para KV (dimensión 256), dimensión RoPE 64. Tamaño del repositorio: 2.496,1 GB.

## Arquitectura y entrenamiento

La arquitectura se organiza en 23 bloques, cada uno compuesto por tres sub-bloques de Gated DeltaNet seguidos de MoE y un sub-bloque de Gated Attention seguido de MoE. Esta combinación de atención lineal (DeltaNet con compuertas) y atención completa con compuertas busca reducir el coste computacional en secuencias largas sin renunciar a la calidad de la atención clásica. La capa MoE cuenta con 512 expertos, de los que se activan 10 enrutados más 1 compartido por token, con dimensión intermedia de 2048.

El modelo ha pasado por fases de preentrenamiento y postentrenamiento (así se declara en la model card), e incorpora entrenamiento con Multi-Token Prediction en varios pasos, lo que habilita decodificación especulativa nativa. Dispone de control flexible del razonamiento mediante el parámetro `reasoning_effort` y de retención del contexto de razonamiento histórico mediante `preserve_thinking`. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas concretas de RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno con contexto muy largo (hasta 262.144 tokens nativos).
- Razonamiento con profundidad ajustable mediante `reasoning_effort`, y conservación del razonamiento previo con `preserve_thinking`.
- Codificación y agentes de código de horizonte largo: planificación autónoma y manejo de retroalimentación del entorno.
- Tareas profesionales, investigación y flujos de trabajo multi-paso orientados a completar la tarea de extremo a extremo.
- Ejecución de agentes con mayor fiabilidad en la finalización de tareas complejas (según el autor).
- Compatibilidad con harnesses y herramientas de desarrollo populares, lo que facilita la integración en stacks existentes.
- Decodificación especulativa gracias al entrenamiento con MTP.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión y modo no-thinking: no disponibles en esta versión de pesos abiertos; la model card indica que esas funciones adicionales están en Qwen3.8-Max (API oficial).

## Casos de uso

- Agentes de codificación autónomos: el modelo puede planificar y ejecutar tareas de modificación de repositorios, interpretar errores de tests y aplicar correcciones iterativas, apoyándose en su contexto de 262.000 tokens para mantener el estado de un proyecto completo.
- Automatización de terminal y CI/CD: integrado en harnesses de agentes, puede resolver tareas de tipo Terminal Bench (donde obtiene 86,6) y ejecutar pipelines de corrección automática de builds.
- Asistencia a investigación técnica: con contexto extensible hasta 1M tokens, permite analizar corpus documentales amplios, papers y bases de código en una sola ventana sin fragmentación.
- Atención al cliente de nivel empresarial: conversaciones multi-turno con memoria de contexto larga y razonamiento ajustable para equilibrar coste y calidad en producción.
- Refactorización y migración de código a gran escala: la ventana larga y las capacidades de planificación permiten abordar cambios que afectan a múltiples ficheros y dependencias.
- Agentes de automatización de flujos profesionales: tareas de extracción, síntesis y generación de informes con pasos múltiples y verificación de resultados intermedios.
- Despliegue en infraestructura propia con vLLM, SGLang o TokenSpeed: la versión FP8 reduce el peso en memoria respecto al modelo original y mantiene métricas casi idénticas, lo que facilita servir el modelo en clústeres de GPU de alta gama.

## Benchmarks y rendimiento

Resultados publicados en la model card (comparativa con modelos propietarios de referencia). Solo se dispone de forma completa de las filas de Coding Agent:

| Benchmark | Opus 4.8 | Fable 5 | GPT 5.6 Sol (max) | Qwen3.7-Max | Qwen3.8-Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 | 84,6 | 84,6 | 88,8 | 74,5 | 86,6 |
| SWE-bench Pro | 69,2 | 80,0 | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks adicionales. Los datos restantes de la tabla original están truncados.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 2.496,1 GB en FP8, por lo que se requiere un clúster multi-GPU de alta gama; no cabe en una sola GPU convencional.
- GPU recomendadas: H100, H200 o B200 en configuraciones multi-nodo; A100 de 80 GB en agregados grandes. No es viable en RTX 4090 ni en GPUs de consumo.
- Despliegue: vLLM, SGLang y TokenSpeed (declarados compatibles por el autor); transformers para carga directa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-2.4T-A95B-FP8 | 2,4 T totales / 95 B activos | 262.144 (hasta 1.010.000) | `qwen3.8-max` (propietaria) | Pesos abiertos en HF |
| Qwen3.7-Max | no disponible | no disponible | propietaria | API / referencia en benchmarks |
| Opus 4.8 | no disponible | no disponible | propietaria | API |
| GPT 5.6 Sol | no disponible | no disponible | propietaria | API |

La comparación se limita a los datos de benchmarks de la model card; no se dispone de especificaciones técnicas de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Licencia propietaria `qwen3.8-max`: es imprescindible revisar el fichero LICENSE antes de cualquier uso comercial; no es una licencia open source estándar.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; no se documentan tasas específicas.
- Idiomas soportados no declarados en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- Requisitos de hardware extremos (2,5 TB de pesos en FP8): inviable para la mayoría de equipos y solo desplegable en clústeres multi-GPU.
- La versión abierta no incluye visión ni modo no-thinking; esas capacidades solo están en Qwen3.8-Max vía API.
- La ventana de 1M tokens es una extensión sobre los 262.144 nativos; el rendimiento en esa extensión no está cuantificado.
- Los benchmarks publicados son del modelo Qwen3.8-Max (versión API), no necesariamente idénticos a esta versión FP8 de pesos abiertos.

## Enlaces

- Hugging Face: https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B
- Blog Qwen3.8-Max: https://qwen.ai/blog?id=qwen3.8
- Qwen Cloud (API oficial): https://www.qwencloud.com
- Overview Qwen3.8-Max: https://www.qwencloud.com/models/qwen3.8-max
- Qwen Studio: https://chat.qwen.ai/?models=qwen3.8-max
- Qwen Chat: https://qwen.ai/qwenchat
- Qwen home: https://qwen.ai/home
- Wikipedia (EN): https://en.wikipedia.org/wiki/Qwen
- Wikipedia (FR): https://fr.wikipedia.org/wiki/Qwen
