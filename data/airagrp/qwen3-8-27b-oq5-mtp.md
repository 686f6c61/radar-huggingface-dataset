# airagrp/Qwen3.8-27B-oQ5-mtp

## Resumen

Qwen3.8-27B-oQ5-mtp es una cuantización de 5 bits del modelo Qwen3.8-27B, un LLM denso multimodal desarrollado por Alibaba Qwen. La versión original destaca por su rendimiento en tareas de código, flujos de agente y automatización de oficina, con una ventana de contexto de 262 000 tokens. Esta cuantización, creada con oMLX v0.6.2 y su sistema de cuantización oQ, reduce el peso del modelo para facilitar su despliegue en hardware Apple Silicon, manteniendo la arquitectura original del modelo.

La cuantización se distribuye en formato MLX safetensors, optimizada para inferencia local en dispositivos con memoria unificada. El repositorio reporta 5 756 598 512 parámetros en el archivo safetensors, cifra que parece corresponder a la representación cuantizada y no al número real de parámetros del modelo original (27B). La licencia del modelo base es Apache 2.0, lo que permite uso comercial y modificación. Esta versión cuantizada está pensada para desarrolladores que necesitan ejecutar Qwen3.8-27B en hardware local sin necesidad de GPUs de gran tamaño, aprovechando el ecosistema oMLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision + texto) |
| Parametros totales | 27B (modelo original); 5.7B reportados en safetensors (posible error del autor) |
| Parametros activos | no aplica (dense) |
| Longitud de contexto | 262 144 tokens (modelo original) |
| Tipos de cuantizacion | 5 bits, group size 64 (oQ5) |
| Idiomas soportados | no disponible (modelo original multilingue, incluye espanol) |
| Licencia | Apache 2.0 (modelo original) |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo transformer denso con componentes multimodales: incluye un encoder de vision para procesar imagenes y video, junto con el bloque de lenguaje. El modelo fue entrenado por Alibaba Qwen con datos de texto, imagen y video, y posteriormente optimizado mediante RLHF y tecnicas de post-entrenamiento para mejorar el razonamiento y la ejecucion de tareas agenciales. La cuantizacion oQ5 aplica mixed precision quantization, que asigna diferentes precisiones a distintas capas segun su sensibilidad, con un group size de 64. Esta tecnica reduce el peso del modelo aproximadamente un 40-50% respecto a los pesos en fp16, manteniendo una degradacion minima en la calidad de las respuestas.

## Capacidades

- Generacion de texto y razonamiento complejo, incluyendo tareas de matematica y logica.
- Codificacion de software: generacion, explicacion, depuracion y refactorizacion de codigo en multiples lenguajes.
- Soporte de tool calling y function calling para integracion en flujos de trabajo automatizados.
- Capacidades de agente multi-paso, incluyendo planificacion y ejecucion de tareas en entornos como terminales y sistemas operativos.
- Entrada de imagenes y video, con descripcion de escenas y respuesta a preguntas visuales.
- Multilingue, con soporte para espanol, ingles, chino y otros idiomas (segun el modelo original).
- Ventana de contexto larga de 262k tokens para documentos extensos y conversaciones multi-turno.

## Casos de uso

- **Automatizacion de oficina**: el modelo puede procesar documentos largos, resumir informes y generar borradores de correos gracias a su contexto de 262k tokens, adecuado para entornos corporativos que manejan grandes volumenes de texto.
- **Asistente de codigo en produccion**: con tool calling, se puede integrar en pipelines de CI/CD para revisar pull requests, sugerir fixes o autogenerar tests unitarios.
- **Agente de terminal**: su capacidad para operar en entornos terminal (según benchmarks) permite automatizar tareas administrativas de sistema, como gestion de archivos, instalacion de paquetes o ejecucion de scripts.
- **Analisis de documentacion tecnica**: el modelo puede leer manuales, APIs y documentacion extensa (262k tokens) y extraer informacion clave o responder preguntas especificas.
- **Asistente visual en entornos de diseno**: procesa capturas de pantalla o imagenes de interfaces para sugerir mejoras de UX o detectar errores de diseno.
- **Chatbot de atencion al cliente**: mantiene conversaciones multi-turno con memoria de contexto amplia, reduciendo la perdida de informacion en dialogos largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para la version cuantizada. Los datos del modelo original (según el blog lovableapp.org) incluyen:

| Benchmark | Resultado |
|---|---|
| DeepSWE (software engineering) | 42.2 |
| Terminal Bench | 73.0 |
| OSWorld (tareas de sistema operativo) | 84.3 |

Estos valores indican un rendimiento sobresaliente en tareas de agente y codificacion, aunque no se especifican las condiciones de evaluacion ni la comparacion con otros modelos. La cuantizacion oQ5 puede introducir una degradacion minima en estos resultados, pero no se dispone de datos cuantitativos.

## Requisitos de hardware

- **VRAM estimada**: para una cuantizacion de 5 bits con 27B parametros, se requieren aproximadamente 17-20 GB de memoria en GPU. En Apple Silicon, el modelo ocupa unos 20.3 GB en disco y se ejecuta en memoria unificada.
- **GPU recomendadas**: Apple M5 Max (40 cores) con 64 GB de RAM, segun benchmark de oMLX; tambien compatible con AMD Ryzen AI Max y Radeon GPUs (segun blog de AMD).
- **Cabe en consumer GPU**: si, en GPUs de 24 GB como la RTX 4090, aunque el formato MLX esta orientado a Apple Silicon; para otras plataformas se necesitarian formatos GGUF o exl2.
- **Opciones de despliegue**: oMLX (para Apple Silicon), LM Studio, Lemonade (AMD), o conversion a otros formatos con herramientas como llama.cpp.
- **Latencia y throughput**: en un M5 Max (40c) 64GB, se observaron 837.4 tokens/s de prefill y 46.8 tokens/s de generacion, segun el benchmark de oMLX.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (DeepSWE) | Licencia |
|---|---|---|---|---|
| Qwen3.8-27B (este) | 27B | 262k | 42.2 | Apache 2.0 |
| Qwen3-30B-A3B (MoE) | 30B (3B activos) | 131k | no disponible | Apache 2.0 |
| Gemma-3-27B | 27B | 128k | no disponible | Gemma Terms |

Qwen3.8-27B destaca por su contexto mas largo y su rendimiento en tareas de agente, aunque el modelo MoE de Qwen3 puede ser mas eficiente en latencia. Gemma-3-27B tiene una licencia mas restrictiva (Gemma Terms) que no permite uso comercial sin aprobacion.

## Limitaciones y advertencias

- **Riesgo de alucinacion**: como todo LLM, puede generar informacion falsa o inventada, especialmente en contextos de baja informacion.
- **Sesgos**: el modelo original puede heredar sesgos de los datos de entrenamiento, no se han publicado evaluaciones de sesgo para esta cuantizacion.
- **Contexto largo**: aunque soporta 262k tokens, el rendimiento en contextos muy largos puede degradarse en la version cuantizada.
- **Idiomas**: no se ha especificado la lista exacta de idiomas soportados; el modelo original es multilingue, pero la cuantizacion puede tener limitaciones en idiomas minoritarios.
- **Licencia**: Apache 2.0 permite uso comercial, pero la cuantizacion fue creada por un tercero (airagrp) y no esta oficialmente respaldada por Alibaba. Se recomienda verificar la compatibilidad con tu caso de uso.
- **Formato**: solo MLX safetensors, no disponible en GGUF o otros formatos, lo que limita su uso en GPUs de NVIDIA o AMD fuera del ecosistema MLX.

## Enlaces

- Hugging Face: [airagrp/Qwen3.8-27B-oQ5-mtp](https://huggingface.co/airagrp/Qwen3.8-27B-oQ5-mtp)
- Repositorio del modelo original: [AlibabaCloud-Official/Qwen3.8-27B](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- Blog de AMD sobre Qwen3.8-27B: [AMD Ryzen AI Max](https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html)
- Guia completa del modelo: [LovableApp Blog](https://lovableapp.org/blog/qwen3-8-27b)
- Benchmark oMLX: [M5 Max](https://omlx.ai/benchmarks/performance/q81b6wvw)
- Herramienta de cuantizacion oMLX: [github.com/jundot/omlx](https://github.com/jundot/omlx)
