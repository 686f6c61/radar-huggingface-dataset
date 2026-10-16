# liodon-ai/anon-1b-FP8

## Resumen

anon-1b-FP8 es una cuantización en FP8 del modelo base scratchyone/anon-1b, publicada por Liodon AI. Se trata de una versión comprimida del modelo original de aproximadamente 1.000 millones de parámetros (999.887.104 según los pesos en safetensors), orientada a reducir el uso de memoria y acelerar la inferencia sobre hardware NVIDIA moderno. El modelo es de generación de texto y se distribuye bajo licencia "other", heredada del modelo base.

La cuantización se ha realizado con la herramienta llm-compressor del proyecto vLLM, empleando el esquema FP8_DYNAMIC: los pesos se convierten a FP8 (formato E4M3) por canal de forma anticipada, mientras que las activaciones se cuantizan dinámicamente por token en el momento de la inferencia. Este esquema no requiere conjunto de calibración, por lo que los pesos cuantizados son una conversión directa del original sin sesgo de calibración. El tamaño del repositorio pasa de 2,6 GB (original) a 1,9 GB.

La relevancia del modelo reside en que permite ejecutar el modelo base con menor huella de memoria y mayor velocidad en GPUs con capacidad de cómputo 8.9 o superior (Ada, Hopper, Blackwell), integrándose directamente con vLLM, TGI y SGLang. La etiqueta `gemma3_text` presente en los metadatos sugiere que el modelo base sigue la arquitectura de texto de la familia Gemma 3, aunque la model card no detalla explícitamente la arquitectura interna.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de texto (etiqueta `gemma3_text` en metadatos; no confirmado en la model card) |
| Parametros totales | 999.887.104 (~1B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (E4M3) con esquema FP8_DYNAMIC; pesos por canal, activaciones por token |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (compatible con compressed-tensors) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo base en la información proporcionada. La etiqueta `gemma3_text` en los metadatos de HuggingFace indica que el modelo base (scratchyone/anon-1b) podría emplear la arquitectura de texto de la familia Gemma 3, pero la model card de esta cuantización no describe la arquitectura, el número de capas, las dimensiones ocultas ni el mecanismo de atención. Tampoco se detallan los datos de entrenamiento (número de tokens, composición del dataset) ni si se aplicaron técnicas de alineación como RLHF o DPO.

Lo que sí se especifica es el proceso de cuantización: se empleó `llm-compressor` con el esquema `FP8_DYNAMIC`. Los pesos se convierten a FP8 (E4M3) por canal de forma previa, y las activaciones se cuantizan dinámicamente por token durante la inferencia. La capa `lm_head` se deja sin cuantizar, práctica habitual por su tamaño reducido y su impacto desproporcionado en la calidad. El esquema no requiere dataset de calibración, de modo que los pesos cuantizados son una conversión numérica directa del original, sin sesgo inducido por el conjunto de calibración.

## Capacidades

- Generación de texto: es la tarea declarada del pipeline (`text-generation`).
- No se dispone de información sobre capacidades de razonamiento, código, matemáticas o visión.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se especifican idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Compatible con despliegue en vLLM, Text Generation Inference (TGI) y SGLang.
- Compatible con endpoints (etiqueta `endpoints_compatible`).

## Casos de uso

- Despliegue de generación de texto en producción con GPU NVIDIA moderna: el modelo puede servirse con vLLM o TGI en GPUs con capacidad de cómputo 8.9 o superior, aprovechando la aceleración FP8 para reducir latencia y consumo de memoria respecto al modelo original de 2,6 GB.
- Prototipado rápido de aplicaciones de texto con requisitos moderados de hardware: al tratarse de un modelo de ~1B de parámetros en FP8, ocupa aproximadamente 1 GB de pesos, lo que permite ejecutarlo en GPUs consumer de gama media-alta (RTX 40-series) para pruebas de concepto.
- Servicio de autocompletado o generación de texto genérica: dado que el pipeline declarado es `text-generation`, puede emplearse en tareas de continuación de texto y generación libre, siempre que el dominio de aplicación se valide empíricamente.
- Integración en pipelines existentes de vLLM/TGI/SGLang: al estar cuantizado con `compressed-tensors`, se integra directamente con estas plataformas sin conversiones adicionales, facilitando su incorporación a infraestructuras ya desplegadas.
- Evaluación comparativa de cuantización FP8: útil para investigadores que quieran medir la degradación de calidad y la ganancia de rendimiento de FP8 frente al modelo base sin cuantizar.
- Experimentación académica sobre modelos de ~1B: sirve como punto de partida para estudiar comportamiento, sesgos o capacidades de modelos pequeños en un formato optimizado.
- No se recomienda su uso en tareas específicas (código, matemáticas, tool calling, agentes) sin validación previa, dado que no se documentan estas capacidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB para los pesos en FP8 (999.887.104 parámetros a 1 byte por parámetro), más el overhead de activaciones, caché KV y runtime. Con contexto corto y batch pequeño, el consumo total puede situarse en torno a 2-4 GB, si bien no se proporcionan cifras oficiales.
- Ejecución FP8 nativa: requiere GPU NVIDIA con capacidad de cómputo ≥ 8.9. Esto incluye RTX 40-series (Ada), L4/L40S, H100/H200 (Hopper) y B100/B200/GB10 (Blackwell).
- En GPUs con capacidad de cómputo inferior a 8.9, vLLM y TGI descomprimen el modelo a un formato de mayor precisión para ejecutarlo, perdiendo la ventaja de velocidad y memoria de FP8.
- ¿Cabe en GPU consumer?: sí, en GPUs de la serie RTX 40 (por ejemplo RTX 4060 Ti, 4070, 4080, 4090) gracias al reducido tamaño del modelo y a la compatibilidad nativa con FP8 en arquitectura Ada.
- Opciones de despliegue: vLLM (`vllm serve liodon-ai/anon-1b-FP8`), Text Generation Inference (imagen Docker oficial `ghcr.io/huggingface/text-generation-inference`), SGLang (`python -m sglang.launch_server --model-path liodon-ai/anon-1b-FP8`).
- Latencia y throughput: no disponible. No se proporcionan cifras de tokens por segundo ni tiempos de respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| liodon-ai/anon-1b-FP8 | ~1B | no disponible | FP8 (E4M3) | other | safetensors | HuggingFace |
| scratchyone/anon-1b (base) | ~1B | no disponible | sin cuantizar | other | safetensors | HuggingFace |
| Otros modelos ~1B comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos alternativos de la misma categoría en la información proporcionada. La comparativa más directa posible es con el modelo base sin cuantizar, del cual solo se conoce que ocupa 2,6 GB frente a los 1,9 GB de esta versión.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos del modelo base ni de la versión cuantizada.
- Riesgo de alucinación: inherente a los modelos generativos de texto; no se documenta ninguna mitigación específica.
- Idiomas soportados: no especificados. No se puede garantizar un rendimiento adecuado en castellano ni en ningún otro idioma concreto.
- Longitud de contexto: no disponible. No se puede planificar el uso en tareas que requieran ventanas largas sin verificarlo primero.
- Licencia "other": no es una licencia estándar (no es Apache 2.0, MIT, etc.). Es imprescindible revisar los términos exactos del modelo base y de esta cuantización antes de un uso comercial. La model card remite a scratchyone/anon-1b como fuente de la licencia.
- La licencia de la cuantización hereda de la del modelo base; el publicador (Liodon AI) no aclara condiciones adicionales.
- Compatibilidad de hardware: en GPUs con capacidad de cómputo inferior a 8.9 se pierde la ventaja de FP8, ya que el modelo se descomprime en tiempo de ejecución.
- Sin métricas publicadas: no hay benchmarks, evaluaciones de calidad ni comparativas con el modelo base sin cuantizar, por lo que se desconoce la degradación introducida por la cuantización.
- Modelo con 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- No se documentan capacidades de tool calling, agentes, código o matemáticas: no deben asumirse en producción sin pruebas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/liodon-ai/anon-1b-FP8
- Modelo base: https://huggingface.co/scratchyone/anon-1b
- Herramienta de cuantización llm-compressor: https://github.com/vllm-project/llm-compressor
- Perfil del publicador (Liodon AI): https://huggingface.co/liodon-ai
- Repositorio de vLLM: no disponible en la información proporcionada.
- Repositorio de Text Generation Inference: no disponible en la información proporcionada.
- Repositorio de SGLang: no disponible en la información proporcionada.
