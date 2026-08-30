# HumboldtJoker/ll-ayni-v3-bf16

## Resumen

El modelo `HumboldtJoker/ll-ayni-v3-bf16` es un fine-tuning del modelo Qwen3-30B (probablemente la variante MoE, según el tag `qwen3_moe`) desarrollado por Liberation Labs bajo el nombre "Ayni v3". Se trata de una iteración intermedia de un entrenamiento de alineación basado en la metodología "consent-aware training", que busca ajustar el comportamiento del modelo según principios de consentimiento y seguridad. El modelo fue subido por HumboldtJoker (Thomas Edrington) en agosto de 2026 con fines de archivo y análisis, ya que ha sido superado por las versiones v5 y v6 de Ayni.

La relevancia de este modelo radica en su uso como objeto de estudio para "arqueología de entrenamiento" y análisis de sondas en el espacio j. Al estar archivado, no se recomienda su uso en producción, pero puede servir para investigar la evolución de las técnicas de alineación de Liberation Labs. El repositorio incluye los pesos completos en bf16 (13 shards safetensors) y checkpoints de adaptadores en los pasos 25, 50, 75 y 100.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (tag `qwen3_moe`), basada en Qwen3-30B |
| Parametros totales | 30.531.028.992 (30,5B) |
| Parametros activos | no disponible (se estima ~3,3B si es Qwen3-30B-A3B) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | bf16 (solo pesos completos) |
| Idiomas soportados | no disponible |
| Licencia | other (licencia propietaria de Liberation Labs) |
| Formato de pesos | safetensors (13 shards) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Qwen3-30B, que según el tag `qwen3_moe` corresponde a la arquitectura MoE (mezcla de expertos) de la familia Qwen3 (probablemente Qwen3-30B-A3B, con 30,5B parámetros totales y ~3,3B activos). El entrenamiento se realizó con la metodología "Ayni consent-aware training", un enfoque de alineación que incorpora principios de consentimiento en el proceso de ajuste. No se proporcionan detalles sobre el dataset utilizado, el número de tokens de entrenamiento ni si se emplearon técnicas como RLHF o DPO. La v3 es una iteración intermedia, superada por las versiones v5 (boosted) y v6, lo que sugiere que el proceso de entrenamiento fue iterativo y que esta versión no representa el estado final del modelo.

## Capacidades

- No se han documentado capacidades específicas para esta versión en la información disponible.
- Al ser un fine-tuning de Qwen3, se espera que herede las capacidades del modelo base (generación de texto, razonamiento, código, matemáticas, soporte multilingüe, tool calling, etc.), pero no hay confirmación de que estas capacidades se mantengan o modifiquen tras el entrenamiento de alineación.
- El modelo está archivado y su propósito declarado es el análisis de entrenamiento, no el uso funcional.

## Casos de uso

- Investigación en alineación de modelos: el modelo sirve como referencia para estudiar la evolución de las técnicas "consent-aware" entre versiones (v3 vs v5/v6).
- Análisis de "arqueología de entrenamiento": permite inspeccionar los checkpoints intermedios (pasos 25, 50, 75, 100) para entender cómo cambia el comportamiento del modelo durante el ajuste.
- Evaluación de sondas (j-space probe analysis): puede usarse para investigar representaciones internas y mecanismos de alineación en modelos MoE.
- Reproducibilidad de experimentos: al estar disponibles los pesos completos en bf16, se puede reproducir el entrenamiento o ejecutar inferencia para comparar con versiones posteriores.
- Benchmarking de metodologías de alineación: comparar el rendimiento de esta versión con las versiones v5 y v6 en tareas de seguridad o utilidad (si se obtienen datos).
- No se recomienda su uso en aplicaciones de producción debido a su estado archivado y la falta de documentación de capacidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card no incluye métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- Los pesos en bf16 ocupan aproximadamente 61 GB (30,5B parámetros × 2 bytes), más el overhead de la arquitectura y los adaptadores, lo que explica el tamaño del repositorio (74,6 GB).
- Para inferencia en bf16 se requiere al menos 61 GB de VRAM, lo que implica el uso de múltiples GPUs: por ejemplo, 2× A100 40GB, 2× RTX A6000 48GB, o 4× RTX 4090 24GB (con tensor parallelism).
- No se ofrecen cuantizaciones alternativas (GGUF, INT8, etc.) en el repositorio, por lo que la inferencia en una sola GPU consumer no es viable sin cuantizar manualmente.
- Opciones de despliegue: se puede usar con frameworks que soporten pesos bf16 y arquitectura MoE, como vLLM, TensorRT-LLM o Transformers con `device_map="auto"`, siempre que se disponga de la VRAM agregada suficiente.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos. Al ser un fine-tuning de Qwen3-30B, se podría comparar con el modelo base Qwen3-30B-A3B (misma arquitectura y tamaño) y con otros fine-tunings de alineación, pero no hay datos de rendimiento publicados para esta versión. La comparativa queda pendiente de obtener métricas.

## Limitaciones y advertencias

- Modelo archivado y superado: la v3 ha sido reemplazada por v5 y v6, por lo que no representa el estado del arte de Liberation Labs.
- Licencia restrictiva: la licencia "other" no es una licencia open source estándar; implica restricciones de uso comercial y redistribución que deben consultarse directamente con Liberation Labs.
- Falta de documentación: no se especifican los datos de entrenamiento, el contexto máximo, los idiomas soportados ni las capacidades finales tras el fine-tuning.
- Riesgo de alucinación y sesgos: al ser un modelo no evaluado, no se conocen sus tasas de alucinación ni sus sesgos potenciales.
- No apto para producción: su propósito es de archivo e investigación; usarlo en entornos reales conlleva riesgos no evaluados.
- Posible inconsistencia con el tag `qwen3_moe`: el autor menciona "Qwen3-30B" sin especificar la variante, pero el tag indica MoE; esto puede generar confusión sobre la arquitectura exacta.

## Enlaces

- [HuggingFace: HumboldtJoker/ll-ayni-v3-bf16](https://huggingface.co/HumboldtJoker/ll-ayni-v3-bf16)
- [Perfil de HumboldtJoker en HuggingFace](https://huggingface.co/HumboldtJoker)
