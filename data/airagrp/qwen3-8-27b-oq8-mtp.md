# airagrp/Qwen3.8-27B-oQ8-mtp

## Resumen

El modelo `airagrp/Qwen3.8-27B-oQ8-mtp` es una cuantización de precisión mixta de 8 bits del modelo Qwen3.8-27B, un LLM denso multimodal nativo de Alibaba que acepta entradas de imagen y vídeo además de texto. La cuantización se ha realizado con la librería oMLX v0.6.2 (oQ), que produce pesos en formato MLX safetensors, lo que lo hace adecuado para inferencia local en hardware Apple Silicon y, según la documentación del fabricante, también en GPUs AMD y PCs con Ryzen AI Max mediante LM Studio o Lemonade.

El modelo base Qwen3.8-27B está diseñado para tareas de codificación, razonamiento multi-paso y workflows agénticos de horizonte largo, con una ventana de contexto de 262K tokens y licencia Apache 2.0. Esta variante cuantizada reduce el peso a 30.0 GB, lo que permite ejecutarlo en GPUs de consumo con 32 GB de VRAM o en equipos con memoria unificada amplia, manteniendo la arquitectura densa del original. La cuantización OQ8 usa group size 64 y una mezcla de precisiones para preservar las capas más sensibles.

El repositorio tiene cero descargas y cero likes, y no se han publicado resultados de benchmarks específicos para la versión cuantizada; los datos de rendimiento disponibles se refieren al modelo base sin cuantizar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (qwen3_5) |
| Parametros totales | 27B (modelo base); los metadatos safetensors del repo cuantizado reportan 8.184.279.792, valor inconsistente con la documentacion oficial y probablemente un error de metadatos |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.000 tokens (modelo base) |
| Tipos de cuantizacion | oQ8 (8-bit, group size 64, precision mixta) |
| Idiomas soportados | no disponible (el modelo base es multilingue, pero no se detalla la lista) |
| Licencia | no disponible en el repo; el modelo base Qwen3.8-27B es Apache 2.0 |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

Qwen3.8-27B es un transformer denso multimodal que procesa texto, imagen y vídeo de forma nativa. La arquitectura es del tipo qwen3_5, con control flexible de pensamiento (modo thinking opcional) y soporte para tareas agénticas de varios pasos. La versión cuantizada no modifica la arquitectura, solo los pesos, que se comprimen a 8 bits con precision mixta mediante oQ, una técnica que asigna distintos niveles de precisión a distintas capas según su sensibilidad a la cuantización.

Los datos de entrenamiento del modelo base no se detallan en la informacion disponible. No se menciona el numero de tokens ni la composicion del dataset, aunque el modelo se describe como optimizado para codificacion, automatizacion de oficina y agentes. No hay informacion sobre el uso de RLHF o DPO en el entrenamiento.

## Capacidades

- Generacion de texto y razonamiento multi-paso, incluyendo tareas de codificacion compleja y depuracion.
- Comprension nativa de imagen y video, permitiendo preguntas y respuestas sobre contenido visual sin un adaptador separado.
- Control de pensamiento flexible: puede activarse o desactivarse el modo thinking para balancear latencia y calidad.
- Soporte de tool calling y function calling, adecuado para integrar APIs y herramientas externas.
- Capacidad para workflows agénticos de horizonte largo, como automatizacion de tareas de oficina o investigacion.
- Multilingue, aunque la lista de idiomas concretos no se ha publicado en el repo cuantizado.

## Casos de uso

- Automatizacion de oficina: el modelo puede generar y resumir documentos, extraer datos de imagenes y tablas, y ejecutar tareas de hoja de calculo de forma agéntica gracias a su ventana de 262K tokens y soporte de tool calling.
- Agentes de codificacion en produccion: integrable en pipelines CI/CD para generar pruebas, revisar PRs o autocompletar funciones; su capacidad de razonamiento multi-paso permite depurar errores de forma autonoma.
- Asistente de investigacion con entrada visual: analizar graficas, diagramas o capturas de pantalla y producir informes tecnicos a partir de imagenes, algo que un modelo solo de texto no puede hacer.
- Automatizacion de atencion al cliente multimodal: gestionar conversaciones que incluyen capturas de pantalla de errores o fotos de productos, con contexto largo para mantener el historial completo.
- Analisis de video para QA: extraer informacion de videos cortos para generar subtitulos, resumenes o detectar eventos, gracias a la entrada nativa de video del modelo base.
- Despliegue local en equipos con memoria unificada: ejecutar el modelo en un Mac con 32 GB de RAM o en un AMD Ryzen AI Max con LM Studio, manteniendo la privacidad de los datos al no usar la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para la version cuantizada oQ8. Los datos disponibles corresponden al modelo base Qwen3.8-27B, segun la guia de lovableapp.org:

| Benchmark | Resultado (modelo base) |
|---|---|
| DeepSWE | 42.2 |
| Terminal Bench | 73.0 |
| OSWorld | 84.3 |

Estos valores indican un rendimiento destacado en tareas de codificacion (DeepSWE), uso de terminal y automatizacion de sistemas operativos. No hay datos de MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 30.0 GB en formato MLX, por lo que se recomienda al menos 32 GB de memoria unificada o VRAM para carga completa.
- GPUs compatibles: funciona en Apple Silicon (MPS), AMD Ryzen AI Max y Radeon con LM Studio o Lemonade; tambien puede ejecutarse en GPUs Nvidia con 32 GB o mas mediante adaptadores de formato.
- No cabe en GPUs de consumo de 16 GB o 24 GB si se carga entero; se necesitaria una cuantizacion de menor precision o offloading a CPU.
- Opciones de despliegue: LM Studio (AMD y Apple), Lemonade (AMD), oMLX (oQ) para Apple Silicon. No se menciona soporte para vLLM o llama.cpp en el repo, ya que el formato es MLX nativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de benchmarks comparativos publicados entre la version cuantizada y otros modelos de tamano similar. Como referencia, el modelo base Qwen3.8-27B compite con otros modelos densos de 27B-32B:

| Modelo | Parametros | Contexto | Multimodal | Licencia |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Si (imagen y video) | Apache 2.0 |
| Qwen3-30B-A3B | 30B (3B activos, MoE) | 128K | No | Apache 2.0 |
| Gemma 3 27B | 27B | 128K | Si (vision) | Gemma Terms |

La cuantizacion oQ8 de airagrp no altera las capacidades del modelo base, pero su disponibilidad es limitada por el formato MLX y la ausencia de benchmarks propios.

## Limitaciones y advertencias

- Los metadatos de safetensors del repo reportan 8.184.279.792 parametros, lo que no coincide con la base de 27B; es probable un error de metadatos que puede afectar a herramientas de validacion automatica.
- El repositorio tiene cero descargas y cero likes, y no hay informacion de mantenimiento ni soporte por parte del autor.
- No se han publicado benchmarks de la version cuantizada, por lo que el rendimiento real en tareas de codigo o agnaticas no esta verificado.
- La licencia del repo no esta definida; aunque el modelo base es Apache 2.0, la libreria oQ (oMLX) puede tener restricciones adicionales que deben revisarse antes de uso comercial.
- El modelo base es multimodal, pero la cuantizacion puede degradar la calidad de la entrada de video o imagen de alta resolucion.
- Al ser un modelo de 8 bits, el riesgo de alucinacion y perdida de precision en tareas matematicas complejas es mayor que en la version de 16 bits o BF16.
- No se han publicado evaluaciones de sesgos para esta cuantizacion especifica; los sesgos del modelo base no son conocidos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/airagrp/Qwen3.8-27B-oQ8-mtp
- Repositorio del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Blog de AMD sobre soporte del modelo: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Guia completa de Qwen3.8-27B: https://lovableapp.org/blog/qwen3-8-27b
- Repositorio de la libreria oQ (oMLX): https://github.com/jundot/omlx
