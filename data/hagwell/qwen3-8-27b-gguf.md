# Hagwell/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B es un modelo denso de lenguaje y vision de 27.000 millones de parametros, desarrollado por el equipo Qwen de Alibaba. Se presenta como la generacion mas capaz de la familia open-source de Qwen hasta la fecha, construido sobre la base arquitectonica de Qwen3.5 con mejoras sustanciales en codificacion, trabajo profesional, investigacion y tareas agente de largo horizonte. El modelo es nativamente multimodal: comprende imagenes y videos de hasta una hora de duracion, e incorpora control flexible de razonamiento con modo thinking activado por defecto.

Arquitectonicamente, Qwen3.8-27B combina Gated DeltaNet (atencion lineal) con Gated Attention (atencion completa) en un layout hibrido de 64 capas, con una ventana de contexto nativa de 262.144 tokens extensible hasta 1.000.000. Se distribuye bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones. La version GGUF, cuantizada por Unsloth con su esquema Dynamic V3.0, permite ejecutarlo en hardware de consumo con 16-24 GB de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, hibrida (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27.320.697.856 (27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta 1.000.000 |
| Tipos de cuantizacion | GGUF (Unsloth Dynamic V3.0), multiples niveles de cuantizacion |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF, safetensors |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo causal de lenguaje con encoder de vision integrado, entrenado en dos fases: pre-entrenamiento y post-entrenamiento. Su arquitectura interna sigue un layout de 64 capas organizado como 16 bloques repetidos de la forma `3 x (Gated DeltaNet -> FFN) -> 1 x (Gated Attention -> FFN)`. El componente Gated DeltaNet emplea 48 cabezas de atencion lineal para V y 16 para QK con dimension de cabeza de 128, mientras que el Gated Attention usa 24 cabezas para Q y 4 para KV con dimension de 256 y RoPE de dimension 64. La dimension oculta es de 5.120 y la FFN tiene dimension intermedia de 17.408.

Una innovacion destacable es el uso de MTP (Multi-Token Prediction) entrenado con multiples pasos, que permite predecir varios tokens simultaneamente. El modelo incorpora ademas un control de razonamiento flexible: el modo thinking esta activado por defecto y puede desactivarse por peticion, con parametros como `reasoning_effort` para ajustar la profundidad del razonamiento y `preserve_thinking` para retener el contexto de razonamiento en mensajes historicos. El esquema de cuantizacion Dynamic V3.0 de Unsloth afirma superar en precision a otros proveedores de GGUF en mas de un 10 % en top-1 con el mismo tamano.

## Capacidades

- Generacion de texto y razonamiento complejo en modo thinking, con control de profundidad mediante `reasoning_effort`.
- Comprension multimodal nativa de imagenes y videos, incluyendo diagramas STEM, documentos y videos de hasta una hora de duracion.
- Razonamiento multi-paso y planificacion autonoma para tareas agente de largo horizonte, con mejor gestion del feedback del entorno.
- Soporte de tool calling y function calling, con mejoras en el parseo de objetos anidados para mayor tasa de exito en llamadas a herramientas.
- Compatibilidad con entornos agente como Codex y otras herramientas de desarrollo gracias al soporte de Developer Role.
- Capacidades multilingues (idiomas exactos no disponibles en la informacion proporcionada).
- Control de modo thinking por peticion, con parametros de muestreo diferenciados para modo razonamiento e instruct.

## Casos de uso

- **Automatizacion de oficina y documentos**: el modelo puede analizar documentos, diagramas y presentaciones gracias a su comprension multimodal, extrayendo informacion estructurada y generando resumenes o respuestas basadas en contenido visual y textual. Su contexto de 262K tokens permite procesar documentos extensos en una sola pasada.
- **Asistentes de codigo en produccion**: con soporte de tool calling y compatibilidad con agentes como Codex, el modelo puede integrarse en pipelines de CI/CD para generacion de codigo, revision de pull requests y resolucion de issues, manteniendo el contexto de todo el repositorio.
- **Analisis de video para vigilancia o media**: su capacidad de entender videos de hasta una hora permite aplicaciones de resumen automatico de contenido audiovisual, busqueda de eventos especificos o transcripcion asistida con comprension de contexto visual.
- **Agentes autonomos de investigacion**: con razonamiento multi-paso y planificacion autonoma, el modelo puede ejecutar tareas de investigacion complejas como busqueda de informacion, comparacion de fuentes y sintesis de resultados, manteniendo el contexto de la tarea completa.
- **Atencion al cliente con contexto largo**: su ventana de 262K tokens permite mantener conversaciones multi-turno con historial completo de la interaccion, incluyendo capturas de pantalla o imagenes enviadas por el usuario, sin perder informacion relevante.
- **Analisis de documentos cientificos y academicos**: el modelo puede procesar articulos con figuras, tablas y diagramas, generando resumenes, extrayendo resultados y respondiendo preguntas sobre el contenido con razonamiento detallado.
- **Automatizacion de tareas de oficina**: el modelo esta optimizado para "office automation", lo que incluye generacion de informes, clasificacion de correos, preparacion de presentaciones y analisis de hojas de calculo con contenido visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona evaluaciones en MathVision con un prompt fijo ("Please reason step by step, and put your final answer within \boxed {}."), pero no se proporcionan cifras concretas. Unsloth afirma que sus cuantizaciones Dynamic V3.0 superan en mas de un 10% en precision top-1 a otros proveedores de GGUF al mismo tamano, aunque no se aportan numeros especificos en la documentacion disponible.

## Requisitos de hardware

- **VRAM estimada**: con cuantizacion de 4 bits, el modelo puede ejecutarse en GPU de 16-24 GB de VRAM segun la guia de Unsloth. Para cuantizaciones de 8 bits se recomiendan GPU de 32 GB o mas.
- **GPU recomendadas**: NVIDIA RTX 4090 (24 GB), RTX 4090 Ti, A100 40 GB, H100, o GPUs de workstation con 32 GB o mas para cuantizaciones superiores.
- **Compatibilidad con GPU de consumo**: si, con cuantizacion de 4 bits en RTX 4080/4090 o equivalentes de 16-24 GB.
- **Opciones de despliegue**: formato GGUF compatible con llama.cpp, Ollama, LM Studio y vLLM (con soporte de GGUF). Unsloth Desktop permite ejecucion local con controles de thinking mode en Mac, Windows y Linux.
- **Latencia y throughput**: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27B denso | 262K nativo | Hibrida (DeltaNet + Gated Attention) + vision | Apache-2.0 | GGUF, safetensors |
| Qwen3.5 (serie) | No disponible | No disponible | No disponible | Apache-2.0 | No disponible |
| Qwen3.6 (serie) | No disponible | No disponible | No disponible | Apache-2.0 | No disponible |

No se dispone de datos suficientes sobre los modelos comparables de la misma familia para establecer una comparativa detallada. La informacion proporcionada menciona que Qwen3.8 se construye sobre la base arquitectonica de Qwen3.5 y sigue la adopcion de las series Qwen3.5 y Qwen3.6, pero no hay especificaciones tecnicas de estos predecesores en la documentacion disponible.

## Limitaciones y advertencias

- **Alucinacion**: como todos los modelos de lenguaje generativos, puede producir contenido falso o inexacto, especialmente en tareas de razonamiento complejo o con datos poco representados en el entrenamiento.
- **Sesgos**: no se documentan sesgos especificos en la informacion proporcionada, pero es esperable que el modelo refleje sesgos presentes en sus datos de entrenamiento.
- **Mezcla de idiomas**: los parametros de muestreo recomendados indican que valores altos de `presence_penalty` pueden ocasionar mezcla de idiomas y una leve disminucion del rendimiento.
- **Contexto extensible limitado**: la extension a 1.000.000 de tokens es una funcionalidad "proximamente" de Qwen Cloud; localmente hay que planificar en torno a los 262.144 tokens nativos.
- **Repeticion**: puede producirse repeticion interminable si no se ajustan los parametros de muestreo adecuados, especialmente en modo instruct.
- **Recursos computacionales**: aunque puede ejecutarse en GPU de consumo con cuantizacion, las tareas agente de largo horizonte y el procesamiento de videos de larga duracion requieren recursos sustanciales de memoria y computo.

## Enlaces

- [Modelo GGUF en HuggingFace](https://huggingface.co/Hagwell/Qwen3.8-27B-GGUF)
- [Modelo base en HuggingFace](https://huggingface.co/Qwen/Qwen3.8-27B)
- [GGUF de Unsloth en HuggingFace](https://huggingface.co/unsloth/Qwen3.8-27B-GGUF)
- [GGUF de Unsloth en ModelScope](https://www.modelscope.cn/models/unsloth/Qwen3.8-27B-GGUF/summary)
- [Repositorio oficial en GitHub](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Guia de ejecucion de Unsloth](https://unsloth.ai/docs/models/qwen3.8)
- [Documentacion de cuantizaciones Dynamic V3.0](https://unsloth.ai/docs/basics/dynamic-3.0-ggufs)
- [Guia de ejecucion local en GPU de 16-24 GB](https://codersera.com/blog/how-to-run-qwen-3-8-locally-2026/)
