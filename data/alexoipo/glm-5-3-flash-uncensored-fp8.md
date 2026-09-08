# Alexoipo/GLM-5.3-Flash-UNCENSORED-FP8

## Resumen

GLM-5.3-Flash-UNCENSORED-FP8 es una versión modificada del modelo GLM-5.3-Flash de Z.ai, publicada por el usuario Alexoipo en HuggingFace bajo la marca "CRACK" de dealignai. El objetivo de esta variante es eliminar de forma permanente el comportamiento de rechazo (refusal) del modelo base mediante una edición directa de los pesos, sin recurrir a fine-tuning, LoRA ni plantillas de jailbreak. El resultado es un modelo que responde sin restricciones éticas, manteniendo o incluso mejorando ligeramente la capacidad en MMLU.

La arquitectura es un MoE híbrido que combina atención lineal KDA con atención sparse estilo DeepSeek. El modelo tiene 321.323.031.390 parámetros totales, de los cuales 18.000 millones se activan por token. Su ventana de contexto alcanza 1 millón de tokens y soporta visión mediante un vision tower de GLM-4.1V. La cuantización es FP8 nativa, lo que permite ejecución a velocidad nativa en GPUs Hopper. Incluye además un cabezal de predicción multi-token (MTP) para decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-5.3-Flash (glm5_next) — MoE híbrido con atención lineal KDA y atención sparse estilo DeepSeek |
| Parametros totales | 321.323.031.390 (aprox. 321B) |
| Parametros activos | 18B activos por token |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP8 (block-wise e4m3) |
| Idiomas soportados | Inglés (según HuggingFace) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash introduce por primera vez en la serie GLM una arquitectura híbrida que combina atención sparse y lineal, reduciendo drásticamente el coste de servir contextos largos y preservando la precisión en tareas de contexto extenso. En esta variante, el proceso de "abliteración" ha modificado los tensores del modelo para eliminar el comportamiento de rechazo, sin reentrenamiento ni adaptadores. La model card indica que no se ha utilizado fine-tuning, SFT, DPO, LoRA, vectores de dirección, hooks en runtime ni un `model.py` personalizado; el cambio está horneado en los pesos.

No se dispone de información detallada sobre el dataset de entrenamiento original ni sobre el número de tokens usados. Tampoco se menciona si el modelo base pasó por RLHF o DPO. La innovación técnica destacable es el cabezal de predicción multi-token (MTP), que alcanza una tasa de aceptación del 75,9% en decodificación especulativa, acelerando la generación sin colapsar en prompts no rechazados.

## Capacidades

- Generación de texto y razonamiento con múltiples modos de esfuerzo: reasoning-off, low effort y max effort. El modo recomendado para una experiencia totalmente sin censura es reasoning-off o max effort.
- Comprensión de visión mediante el vision tower de GLM-4.1V, incluido con la plantilla de chat multimodal correcta.
- Decodificación especulativa con MTP, que acelera la generación entre un 20% y un 30% en comparación con la decodificación estándar.
- Procesamiento de contexto largo de hasta 1 millón de tokens, adecuado para análisis de documentos extensos.
- Capacidades multilingües: según la ficha de HuggingFace, el modelo solo está etiquetado en inglés, aunque el modelo base de Z.ai podría soportar más idiomas. No se confirma en la información disponible.
- No se ha confirmado soporte de tool calling ni function calling en la información proporcionada.

## Casos de uso

- Análisis de documentos extensos: gracias a la ventana de 1 millón de tokens, el modelo puede resumir o extraer información de libros completos, informes largos o bases documentales enteras en una sola pasada.
- Aplicaciones de visión: al incorporar el vision tower de GLM-4.1V, puede procesar imágenes para tareas de descripción, análisis de diagramas o extracción de texto en capturas.
- Generación de código con baja latencia: la decodificación especulativa con MTP reduce el tiempo de respuesta en entornos de desarrollo asistido, alcanzando hasta 211 tok/s en GPUs H200.
- Investigación de alineación y seguridad: al eliminar los guardrails, el modelo permite estudiar el comportamiento de un LLM sin filtros, útil para analizar sesgos, jailbreaks o respuestas a prompts dañinos en entornos controlados.
- Servicios de chat interactivos: con velocidades de decodificación de 163-211 tok/s en hardware Hopper, es adecuado para asistentes conversacionales que requieren respuestas rápidas y contexto largo.
- Generación de contenido creativo sin restricciones: para prototipos o investigación donde se necesite texto libre sin filtros, aunque requiere supervisión humana debido al riesgo de contenido dañino.
- Procesamiento de tareas complejas con razonamiento de alto esfuerzo: el modo max effort permite resolver problemas que requieren múltiples pasos de razonamiento, como análisis matemático o planificación.

## Benchmarks y rendimiento

Se han publicado resultados de MMLU y HarmBench-320 en la model card. No se dispone de datos de otros benchmarks como HumanEval o GSM8K.

| Benchmark | Base (FP8) | CRACK Uncensored (FP8) | Delta |
|---|---|---|---|
| MMLU (overall) | 86,74% | 87,33% | +0,59 pp |
| HarmBench-320 (greedy) | no disponible | 320/320 (100%) | — |

En HarmBench-320, el modelo cumple el 100% de las peticiones en las categorías Standard, Contextual y Copyright. Este resultado se mantiene con parámetros de muestreo recomendados (temperatura 1.0, top_p 0.95) en los modos reasoning-off y max effort.

## Requisitos de hardware

- VRAM estimada para inferencia: 321 GB para los pesos FP8 completos. Con tensor parallelism de 4 GPUs, se necesitan aproximadamente 80 GB por GPU, más overhead.
- GPU recomendadas: H100 o H200 (arquitectura Hopper) para aprovechar la velocidad nativa de FP8. En H200 con TP4 se alcanzan 163 tok/s en decodificación de un solo stream y 211 tok/s con MTP.
- No cabe en GPUs de consumo (por ejemplo, RTX 4090 con 24 GB). Se requiere hardware de datacenter.
- Opciones de despliegue: vLLM es la opción confirmada, ya que la model card indica que se puede cargar con vLLM estándar. No se confirma soporte para llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: prefill de ~19.400 tok/s, decodificación de 163 tok/s (single-stream) y 211 tok/s con MTP en H200 TP4.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| zai-org/GLM-5.3-Flash (base) | 320B (aprox.) | 18B | 1M | 86,74% | MIT | HuggingFace |
| Alexoipo/GLM-5.3-Flash-UNCENSORED-FP8 | 321.323.031.390 | 18B | 1M | 87,33% | MIT | HuggingFace |
| dealignai/GLM-5.3-Flash-ABLITERATED-FP8 (mirror) | no disponible | no disponible | no disponible | no disponible | MIT | HuggingFace |

No se dispone de datos de otros modelos comparables de la misma categoría (MoE de ~320B) en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se han publicado análisis de sesgos en la información disponible.
- Riesgo de alucinación: no cuantificado. Como todo modelo generativo grande, existe riesgo inherente de producir contenido falso o inventado.
- Limitaciones de contexto o idioma: según HuggingFace, el modelo solo está etiquetado en inglés. El comportamiento en otros idiomas no está confirmado.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificación y redistribución sin restricciones significativas.
- Advertencia importante: el modelo ha sido modificado para eliminar guardrails. Puede generar contenido dañino, ilegal o no ético sin aviso. No es adecuado para producción sin supervisión humana o mecanismos de filtrado externos.
- El comportamiento de rechazo varía según el modo de razonamiento: en low effort se conservan algunos rechazos de forma deliberada, mientras que en reasoning-off o max effort el modelo es totalmente libre. Esto debe tenerse en cuenta al desplegar el modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Alexoipo/GLM-5.3-Flash-UNCENSORED-FP8
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Mirror de dealignai: https://huggingface.co/dealignai/GLM-5.3-Flash-ABLITERATED-FP8
- Artículo de explainx.ai: https://www.explainx.ai/blog/orcarouter-glm-5-3-flash-uncensored-block-fp8-august-2026
