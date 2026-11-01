# Saqib420/Qwen3.8-27B-FP8

## Resumen

Qwen3.8-27B-FP8 es una versión cuantizada en FP8 del modelo Qwen3.8-27B, un modelo de lenguaje causal denso con codificador de visión desarrollado por el equipo Qwen (Alibaba). Este repositorio concreto, publicado por el usuario Saqib420, contiene únicamente los pesos cuantizados y los ficheros de configuración en formato Transformers, manteniendo la licencia Apache 2.0 del modelo original. La cuantización emplea FP8 de grano fino con bloques de 128, un esquema que, según la model card, mantiene métricas de rendimiento prácticamente idénticas a las del modelo sin cuantizar.

El modelo original se presenta como la generación más capaz de la familia abierta Qwen hasta la fecha, construida sobre la base arquitectónica de Qwen3.5 y orientada a tareas de programación, trabajo profesional, investigación y flujos agénticos de largo horizonte. Se trata de un modelo nativo visión-lenguaje capaz de entender imágenes y vídeos, con control flexible del modo de razonamiento (thinking mode activado por defecto, desactivable por petición, con ajuste de profundidad mediante `reasoning_effort`). Su contexto nativo es de 262.144 tokens, extensible hasta 1.000.000.

Con 27.781.427.952 parámetros reales según los safetensors y un repositorio de 30,9 GB, esta variante FP8 está pensada para despliegue en infraestructura con aceleradores que soporten FP8 (vLLM, SGLang, TokenSpeed) y para integración directa con Hugging Face Transformers. Es relevante ahora porque permite ejecutar un modelo denso de 27B con capacidades multimodales y agénticas en un footprint de memoria notablemente reducido respecto a los pesos en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con codificador de visión; layout híbrido Gated DeltaNet / Gated Attention |
| Parametros totales | 27.781.427.952 (27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | FP8 de grano fino con block size de 128 (esta variante); el modelo base admite otros esquemas, no detallados |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (Transformers); compatible con vLLM, SGLang y TokenSpeed |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con codificador de visión integrado. La dimensión oculta es de 5120, con 64 capas organizadas en un layout híbrido de 16 bloques que combinan 3 capas de Gated DeltaNet (atención lineal) seguidas de 1 capa de Gated Attention. El Gated DeltaNet emplea 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. La Gated Attention usa 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y dimensión de Rotary Position Embedding de 64. La red feed-forward tiene dimensión intermedia de 17.408, y el embedding de tokens y la salida LM son de 248.320 entradas (con padding). Incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos.

El modelo ha pasado por fases de pre-entrenamiento y post-entrenamiento, aunque la información disponible no detalla el número de tokens, la composición del dataset ni si se emplearon técnicas concretas de RLHF o DPO. La model card sí menciona mejoras en planificación autónoma y manejo de retroalimentación del entorno, así como un control flexible del razonamiento con retención de contexto de razonamiento histórico mediante `preserve_thinking`. La cuantización FP8 aplicada en este repositorio es de grano fino con bloques de 128.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento configurable (`reasoning_effort`, `preserve_thinking`).
- Comprensión nativa de imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Programación y tareas de terminal agénticas (agentic terminal coding).
- Ejecución agéntica con planificación autónoma y manejo de retroalimentación del entorno.
- Soporte de tool calling y function calling (mencionado de forma implícita vía herramientas integradas en la versión alojada; no se detalla la interfaz exacta en la model card).
- Razonamiento multi-paso y tareas de largo horizonte.
- Compatibilidad con harnesses y herramientas de desarrollo populares.
- Capacidades multilingües: no detalladas en la información disponible.

## Casos de uso

- Automatización de tareas de terminal y CI/CD: el modelo puede interpretar el entorno, ejecutar comandos y corregir errores a partir de la retroalimentación, lo que lo hace adecuado para agentes de codificación autónomos en pipelines de integración continua.
- Asistencia en programación en producción: con 262K tokens de contexto nativo puede cargar repositorios completos o múltiples ficheros y mantener coherencia en refactorizaciones largas.
- Análisis de documentación técnica y diagramas STEM: el codificador de visión permite extraer información de figuras, esquemas y documentos escaneados, útil en ingeniería y research.
- Procesamiento de vídeo de larga duración: la ventana extensible hasta 1M tokens y el soporte de vídeo de hasta una hora permiten resumir y consultar grabaciones completas (reuniones, clases, auditorías).
- Investigación asistida: razonamiento multi-paso con thinking mode para descomponer problemas complejos y retener contexto de razonamiento entre turnos.
- Atención al cliente multimodal: conversaciones multi-turno con contexto largo que pueden incluir capturas de pantalla o imágenes enviadas por el usuario.
- Agentes autónomos de larga ejecución: planificación y ejecución de tareas de varios pasos con seguimiento de estado del entorno.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados comparativos, pero el contenido proporcionado está truncado y no permite extraer los valores numéricos de forma fiable. No se presentan cifras completas de MMLU, HumanEval, GSM8K ni de los benchmarks de coding, agentes o visión que la tabla parece contener.

No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP8 ocupan aproximadamente 27,8 GB (27.781.427.952 parámetros a 1 byte por parámetro), más overhead de activaciones y caché KV; en la práctica se recomienda un mínimo de 32-40 GB de VRAM para contexto moderado.
- GPU recomendadas: H100, H200, B200 y A100 de 80 GB para despliegues de producción con contexto largo; L40S o RTX 6000 Ada (48 GB) para entornos de una sola GPU.
- GPU de consumo: no cabe en GPU de consumo de 24 GB (RTX 4090, 3090) con FP8 sin offloading; requeriría cuantizaciones adicionales (p. ej., GGUF de 4-6 bits) no incluidas en este repositorio.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B (FP8, este repo) | 27B denso | 262K nativo / 1M extensible | Apache 2.0 | Hugging Face, vLLM, SGLang |
| Qwen3.6-27B | 27B (no detallado) | No disponible | No disponible | Citado en benchmarks de la model card |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | Citado en benchmarks de la model card |
| Muse Glimmer-30B | 30B (no detallado) | No disponible | No disponible | Citado en benchmarks de la model card |

Los datos de rendimiento comparativo de la model card están truncados en la información disponible, por lo que no se pueden presentar cifras de MMLU, HumanEval u otros benchmarks para esta tabla.

## Limitaciones y advertencias

- El repositorio es una cuantización de terceros (Saqib420), no una publicación oficial de Qwen; conviene validar la calidad de los pesos antes de usarlos en producción.
- La cuantización FP8, aunque de grano fino, puede introducir degradaciones sutiles no reflejadas en métricas agregadas; se recomienda evaluar en el dominio concreto de uso.
- Riesgo de alucinación inherente a los modelos de lenguaje; el modo de razonamiento activado por defecto no elimina este riesgo.
- Idiomas soportados no documentados en la información disponible; no se puede garantizar calidad multilingüe.
- El contexto extensible a 1M tokens puede implicar costes de memoria y latencia elevados; el contexto nativo es de 262K.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen/Qwen3.8-27B por si hubiera condiciones adicionales.
- No se detallan sesgos conocidos ni datos de entrenamiento, lo que dificulta evaluar riesgos específicos.
- El soporte de tool calling y function calling no está documentado explícitamente en la model card de esta variante.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Saqib420/Qwen3.8-27B-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Servicio alojado Qwen Cloud: https://www.qwencloud.com
- Página del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
