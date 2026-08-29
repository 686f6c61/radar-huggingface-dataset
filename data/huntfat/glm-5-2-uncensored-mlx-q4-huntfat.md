# Huntfat/GLM-5.2-Uncensored-MLX-Q4-huntfat

## Resumen

El modelo `Huntfat/GLM-5.2-Uncensored-MLX-Q4-huntfat` es una conversión al formato MLX (Apple Silicon) en cuantización uniforme de 4 bits del modelo `zandenAI/GLM-5.2-FP8-Uncensored`, que a su vez deriva del modelo open-weight `zai-org/GLM-5.2` desarrollado por Z.AI. Se trata de un modelo de lenguaje de gran tamaño con arquitectura MoE-DSA (Mixture-of-Experts con sparse-attention indexer estilo DeepSeek-V3), diseñado para tareas de razonamiento complejo, generación de código y escritura creativa, con una ventana de contexto de hasta 1 millón de tokens según las fuentes consultadas.

La relevancia de esta conversión radica en que ofrece una versión sin censura del modelo GLM-5.2, cuantizada a 4 bits para reducir el footprint de memoria, y adaptada para ejecutarse en hardware Apple Silicon mediante el ecosistema MLX. El repositorio contiene 141 shards safetensors y ocupa aproximadamente 418 GB, lo que lo sitúa en la categoría de modelos de muy gran escala, pensado para despliegues con recursos abundantes. La conversión requirió un parche específico para el indexador DSA en `mlx-lm`, lo que refleja la novedad de esta arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlmMoeDsaForCausalLM (MLA attention + 256 expertos enrutados, 8 activos + 1 experto compartido + indexador DSA + 1 capa draft MTP) |
| Parametros totales | 116.253.195.264 (~116 B) |
| Parametros activos | no disponible (no se especifica en la informacion) |
| Longitud de contexto | 1 000 000 tokens (segun fuentes externas; no confirmado en la model card) |
| Tipos de cuantizacion | 4-bit uniforme affine (group_size 64) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo base zai-org/GLM-5.2 puede tener su propia licencia, pero no se indica en este repo) |
| Formato de pesos | safetensors (MLX quantized) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con atención MLA (Multi-head Latent Attention) y un indexador DSA (DeepSeek-style sparse attention) que gestiona la selección de tokens relevantes. El modelo cuenta con 256 expertos enrutados, de los cuales se activan 8 por token, más un experto compartido. Incluye además una capa de draft para decodificación especulativa (MTP, Multi-Token Prediction), lo que puede acelerar la inferencia.

No se dispone de información detallada sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO). La model card de esta conversión no aporta datos al respecto. La innovación técnica principal en esta conversión es el parche necesario para el indexador DSA en `mlx-lm`, que permite convertir y cargar los pesos correctamente, un problema que afectaba a las versiones estables de la librería.

## Capacidades

- Generación de texto y razonamiento multi-paso, con especial énfasis en tareas complejas que requieren planificación y deducción.
- Generación de código, con capacidades mejoradas respecto a GLM-5.1 según fuentes externas.
- Escritura creativa y roleplay, con inmersión profunda en personajes y seguimiento de instrucciones detalladas.
- Ventana de contexto de 1M tokens, adecuada para procesar documentos extensos o mantener conversaciones de muy largo recorrido.
- Sin censura: el modelo no aplica filtros de contenido, lo que permite generar respuestas sobre temas que otros modelos rechazarían.
- Soporte de tool calling y funciones de agente: no se menciona explícitamente en la información disponible, aunque es probable que el modelo base lo soporte; no se puede confirmar.
- Capacidades multilingües: no especificadas en la documentación consultada.

## Casos de uso

- Roleplay y escritura creativa sin restricciones: el modelo puede mantener personajes consistentes durante largas interacciones gracias a su contexto de 1M tokens y su naturaleza sin censura, ideal para novelas interactivas o juegos de rol textuales.
- Análisis de documentos extensos: con 1M tokens de contexto, puede resumir, extraer información o responder preguntas sobre libros completos, informes legales o investigaciones académicas.
- Generación de código en entornos de desarrollo: su capacidad de razonamiento y generación de código lo hace útil para asistencia en programación, revisión de código y generación de tests, aunque requiere hardware de gran capacidad.
- Investigación en IA sin censura: permite estudiar el comportamiento de modelos sin alineación de seguridad, útil para investigación académica sobre sesgos, alucinaciones o mecanismos de rechazo.
- Simulación de agentes conversacionales: su capacidad de seguir instrucciones complejas y mantener contexto largo lo hace adecuado para construir asistentes virtuales con personalidad definida.
- Tareas de razonamiento matemático y lógico: aunque no se aportan benchmarks, la arquitectura MoE con 8 expertos activos sugiere un buen rendimiento en tareas que requieren múltiples habilidades especializadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para esta conversión específica ni para el modelo base en las fuentes consultadas.

## Requisitos de hardware

- El repositorio ocupa 418 GB en cuantización 4-bit, lo que implica que se necesita un sistema con memoria unificada o VRAM muy abundante para cargar el modelo completo.
- Para Apple Silicon: la conversión se realizó en Macs con 512 GB de memoria unificada, servidos mediante exo. Se recomienda al menos 512 GB de RAM unificada para ejecutar el modelo en Q4.
- Para GPUs NVIDIA: no se proporcionan datos específicos. Con 116 B parámetros en 4-bit, los pesos ocuparían aproximadamente 58 GB, pero el tamaño real del repo (418 GB) sugiere que la cuantización MLX no es tan compacta o que hay overhead adicional. En cualquier caso, se necesitarían múltiples GPUs de alta gama (por ejemplo, 4x A100 80GB o 8x RTX 4090) o una GPU con más de 100 GB de VRAM.
- Opciones de despliegue: `mlx-lm` (con el parche para `glm_moe_dsa.py`), `exo` para clústeres de Apple Silicon, y potencialmente `vLLM` o `TGI` si se convierten los pesos a otros formatos, aunque no se ha probado.
- Latencia y throughput: no disponibles. Dado el tamaño y la cuantización, se espera una latencia alta en generación, mitigada parcialmente por la capa MTP de decodificación especulativa.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar cuantitativamente con otros modelos. Cualitativamente, se puede comparar con:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| GLM-5.2 (zai-org) | ~116 B (MoE) | 1M | no disponible | Open-weight |
| Qwen3 (variante MoE) | ~30 B activos / ~235 B totales | 32K-128K | Apache 2.0 | Open-weight |
| DeepSeek-V3 | 671 B totales / 37 B activos | 128K | MIT | Open-weight |

La comparación es limitada porque no hay datos de rendimiento para GLM-5.2 en las fuentes consultadas. GLM-5.2 destaca por su contexto de 1M tokens y su naturaleza sin censura, mientras que Qwen3 y DeepSeek-V3 tienen ecosistemas más maduros y documentación de benchmarks más extensa.

## Limitaciones y advertencias

- Tamaño extremadamente grande: 418 GB en Q4, lo que limita su despliegue a sistemas con recursos muy abundantes (múltiples GPUs o Macs con 512 GB de RAM).
- Licencia no especificada: el repo no indica la licencia, y aunque el modelo base es open-weight, puede tener restricciones de uso comercial. Se debe verificar la licencia de `zai-org/GLM-5.2` antes de usar en producción.
- Sin censura: el modelo puede generar contenido ofensivo, ilegal o peligroso. No es adecuado para aplicaciones donde se requiera moderación de contenido.
- Riesgo de alucinación: como todo LLM, puede inventar información, especialmente en tareas de razonamiento complejo o con contexto muy largo.
- Dependencia de un parche no oficial: la conversión requiere un parche para `mlx-lm` que no está integrado en la versión estable, lo que puede complicar la reproducibilidad.
- Idiomas no especificados: no se conoce el rendimiento en idiomas distintos del inglés, aunque GLM suele tener soporte multilingüe.
- Fecha de creación futura (2026-08-28): el modelo se publicó con una fecha posterior a la actual, lo que puede indicar un error de metadatos o un lanzamiento planificado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Huntfat/GLM-5.2-Uncensored-MLX-Q4-huntfat
- Modelo base original: https://huggingface.co/zai-org/GLM-5.2
- Modelo fuente FP8 sin censura: https://huggingface.co/zandenAI/GLM-5.2-FP8-Uncensored
- Colección de variantes MLX sin censura: https://huggingface.co/collections/jeweled/uncensored-mlx-glm-52
- Repo hermano Q4 (jeweled): https://huggingface.co/jeweled/GLM-5.2-Uncensored-MLX-Q4
- Parche para indexador DSA: https://github.com/pcuenca/mlx-lm/tree/glm-moe-dsa-indexer-sharing
- PR relacionado en mlx-lm: https://github.com/ml-explore/mlx-lm/pull/1410
- Discusión sobre el parche: https://huggingface.co/mlx-community/GLM-5.2-DQ4plus-q8/discussions/1
- Herramienta exo: https://github.com/exo-explore/exo
