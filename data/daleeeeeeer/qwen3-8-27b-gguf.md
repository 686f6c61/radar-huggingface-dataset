# daleeeeeeer/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión desarrollado por el equipo Qwen (Alibaba), presentado como la generación más capaz de la familia de modelos abiertos Qwen hasta la fecha. Se construye sobre la base arquitectónica de Qwen3.5 e incorpora mejoras sustanciales en programación, trabajo profesional, investigación y tareas agénticas de largo horizonte. Con 27.320.697.856 parámetros totales, es un modelo denso (no MoE) orientado a un despliegue compacto y viable en infraestructura moderada.

La arquitectura combina capas de atención lineal Gated DeltaNet con capas de atención con compuertas (Gated Attention) en un patrón híbrido de 16 bloques de la forma 3×(Gated DeltaNet → FFN) + 1×(Gated Attention → FFN), con 64 capas en total y una dimensión oculta de 5120. Soporta de forma nativa 262.144 tokens de contexto, extensible hasta 1.000.000, e incluye un modo de razonamiento (thinking) activado por defecto y controlable por petición mediante `reasoning_effort` y `preserve_thinking`.

Este repositorio concreto (`daleeeeeeer/Qwen3.8-27B-GGUF`) es una cuantización GGUF del modelo base `Qwen/Qwen3.8-27B`, generada con la metodología Unsloth Dynamic 3.1, que según su autor logra entre un 5 y un 10 % más de precisión media que otras cuantizaciones de referencia. Está pensado para ejecución local y despliegue en entornos con recursos limitados, manteniendo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con Vision Encoder; layout 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 27.320.697.856 (27B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | GGUF (Unsloth Dynamic 3.1); niveles concretos no disponibles en la información proporcionada |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de cuantización); pesos originales del modelo base presumiblemente en safetensors, no confirmado en la información disponible |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con codificador de visión integrado. La dimensión oculta es de 5120, con 64 capas organizadas en un patrón híbrido que alterna bloques de atención lineal Gated DeltaNet y bloques de Gated Attention. En las capas Gated DeltaNet se emplean 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. En las capas Gated Attention hay 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y dimensión de Rotary Position Embedding de 64. La red feed-forward tiene dimensión intermedia de 17.408, y el vocabulario (embedding y salida LM) es de 248.320 entradas con padding.

El entrenamiento comprende fases de pre-training y post-training. El modelo incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que habilita decodificación especulativa y aceleración de la generación. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas concretas de RLHF o DPO, más allá de la mención genérica a la fase de post-training. La cuantización de este repositorio emplea la metodología Unsloth Dynamic 3.1, que según el autor prioriza la precisión en las capas más sensibles y reporta mejoras de exactitud frente a cuantizaciones frontera en benchmarks como Terminal Bench, DeepSWE y LiveCodeBench.

## Capacidades

- Generación de texto y razonamiento con modo thinking activado por defecto, desactivable por petición.
- Control flexible de la profundidad de razonamiento mediante `reasoning_effort` y retención de contexto de razonamiento histórico con `preserve_thinking`.
- Comprensión nativa de imágenes y vídeos (vision-language), incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Programación y tareas de ingeniería de software, con mejoras declaradas en coding y trabajo profesional.
- Planificación autónoma y ejecución de tareas agénticas de largo horizonte, con manejo de retroalimentación del entorno.
- Compatibilidad con harnesses y herramientas de desarrollo populares para integración en stacks existentes.
- Capacidades multilingües: no se detallan los idiomas concretos en la información disponible.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.

## Casos de uso

- Asistencia de programación en producción: el modelo puede integrarse en pipelines de CI/CD y entornos de desarrollo para revisión de código, generación de parches y refactorización, apoyándose en su contexto de 262.144 tokens para manejar repositorios completos y en su capacidad de razonamiento multi-paso.
- Agentes autónomos de largo horizonte: adecuado para tareas que requieren planificación sostenida y ejecución de múltiples pasos con retroalimentación del entorno, como automatización de flujos de trabajo o resolución de incidencias, gracias a su contexto extensible hasta 1.000.000 de tokens.
- Análisis de documentos técnicos y científicos: su codificador de visión permite procesar diagramas STEM, figuras y documentos escaneados, combinando comprensión visual y razonamiento textual en una sola pasada.
- Procesamiento de vídeo de larga duración: con soporte nativo para vídeos de hasta una hora, puede emplearse en resumen automático, extracción de eventos o generación de transcripciones anotadas.
- Investigación asistida: el modelo puede resumir literatura, contrastar fuentes y elaborar borradores técnicos, aprovechando el modo thinking para razonamiento profundo y `preserve_thinking` para mantener coherencia en conversaciones largas.
- Despliegue local en estaciones de trabajo: al distribuirse en GGUF con cuantización dinámica, puede ejecutarse en hardware de consumo mediante llama.cpp u Ollama, lo que lo hace apto para prototipado offline y entornos con requisitos de privacidad.
- Atención al cliente técnica: gestión de conversaciones multi-turno con contexto largo y capacidad de razonar sobre documentación adjunta, aunque la ausencia de datos sobre idiomas soportados exige validación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona de forma cualitativa que la cuantización Unsloth Dynamic 3.1 logra entre un 5 y un 10 % más de precisión media que otras cuantizaciones frontera, evaluada en Terminal Bench, DeepSWE y LiveCodeBench, pero no se proporcionan cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta en la información proporcionada. Como referencia orientativa, un modelo denso de 27B en FP16 requiere aproximadamente 54 GB solo para pesos; en cuantizaciones de 8 bits rondaría 27-30 GB, en 4 bits unos 15-17 GB, y en cuantizaciones más agresivas podría situarse por debajo de 12 GB, siempre añadiendo overhead para contexto KV y activaciones.
- GPU recomendadas: para FP16 se requieren GPU de datacenter como A100 80 GB o H100; para cuantizaciones de 4-8 bits podrían emplearse RTX 4090 (24 GB) o A6000 (48 GB).
- Compatibilidad con GPU de consumo: probable en cuantizaciones de 4 bits o inferiores en GPUs con 16-24 GB de VRAM, si bien el contexto largo incrementa notablemente el consumo de memoria KV.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; para el modelo base en safetensors, vLLM o TGI serían opciones habituales, aunque no se confirman en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; como todo modelo entrenado con datos web, es previsible que herede sesgos de su corpus, pero no se detallan.
- Riesgo de alucinación: no cuantificado; la model card recomienda ajustar `presence_penalty` entre 0 y 2 para reducir repeticiones infinitas, advirtiendo que valores altos pueden provocar mezcla de idiomas y ligera pérdida de rendimiento.
- Limitaciones de contexto o idioma: el contexto nativo es de 262.144 tokens, ampliable a 1.000.000, pero el rendimiento más allá del contexto nativo puede degradarse. No se especifican los idiomas soportados, lo que impide garantizar calidad en castellano sin evaluación previa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; conviene conservar los avisos de licencia del modelo base.
- Caveats para producción: la cuantización GGUF introduce pérdida de precisión respecto al modelo original; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria. El tamaño del repo (480,4 GB) sugiere múltiples niveles de cuantización empaquetados, lo que exige seleccionar cuidadosamente el archivo a descargar. El modo thinking activado por defecto incrementa el consumo de tokens y la latencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/daleeeeeeer/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Guía Unsloth para ejecutar Qwen3.8-27B: https://unsloth.ai/docs/models/qwen3.8
- Documentación Unsloth Dynamic 3.0 GGUF: https://unsloth.ai/docs/basics/dynamic-3.0-ggufs
- Repositorio GitHub de Unsloth: https://github.com/unslothai/unsloth
- Unsloth Desktop: https://unsloth.ai/docs/new/desktop
- Sitio de Unsloth: https://unsloth.ai
- Discord de Unsloth: https://discord.gg/unsloth
