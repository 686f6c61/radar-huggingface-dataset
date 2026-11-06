# mrysh/gemma-4-12b-it-prune_width_ffn15

## Resumen

`mrysh/gemma-4-12b-it-prune_width_ffn15` es una versión podada por anchura del modelo `google/gemma-4-12B-it`, publicada por el usuario mrysh como parte de un benchmark de poda (4 modelos x 8 variantes) que compara distintas técnicas de pruning frente a cuantización. La poda se realizó con NVIDIA ModelOpt 0.46.0rc1 mediante el método Minitron, reduciendo el tamaño de la FFN de cada capa de 15360 a 13056 neuronas (un 15 % solicitado, efectivo del 10,7 % de los parámetros del checkpoint completo).

El resultado es un modelo de 10.633.330.480 parámetros (frente a los aproximadamente 12 000 millones del base), con la misma profundidad de capas pero menor anchura en las capas feed-forward. El checkpoint es exclusivamente de texto (`Gemma4ForCausalLM`): los bloques de visión y audio del modelo original no se incluyen, por lo que se pierde la multimodalidad.

Es relevante como artefacto de investigación para estudiar el compromiso entre reducción de parámetros y degradación de calidad, ya que no se aplicó destilación ni fine-tuning posterior a la poda. No es un modelo pensado para producción, sino una variante de evaluación dentro de un benchmark comparativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4), poda por anchura en FFN |
| Parametros totales | 10.633.330.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el benchmark compara variantes podadas frente a cuantización, pero no se detallan formatos) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se parte de `google/gemma-4-12B-it`, un transformer decoder-only de la familia Gemma 4. La intervención consiste en una poda estructurada por anchura (width pruning) aplicada con NVIDIA ModelOpt Minitron: la dimensión de la FFN de cada capa se reduce de 15360 a 13056 (un 15 % solicitado), manteniendo intacto el número de capas. La importancia de las neuronas se midió sobre un conjunto de calibración de 512 muestras mixtas.

No se realizó destilación ni fine-tuning tras la poda, de modo que el modelo conserva los pesos supervivientes del base sin reajuste. El checkpoint resultante es solo texto: se han eliminado los bloques de visión y audio del modelo original, quedando una instancia `Gemma4ForCausalLM`. La reducción efectiva es del 10,7 % de los parámetros respecto al checkpoint completo. No se dispone de información sobre el volumen de tokens de entrenamiento del modelo base ni sobre las fases de RLHF/DPO originales en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento en modo texto, heredado del modelo base tras la poda.
- Capacidad de código y matemáticas presumiblemente conservada de forma parcial, aunque no se han publicado evaluaciones específicas en la información disponible.
- Soporte de tool calling y function calling: no confirmado para esta variante podada; el benchmark evalúa BFCL, lo que sugiere que el modelo base sí lo soporta, pero no hay resultados publicados de esta variante.
- Capacidades de agente y razonamiento multi-paso: no confirmadas tras la poda.
- Multilingüismo: no disponible; los idiomas del modelo base no se detallan en la información proporcionada.
- Capacidades especiales (visión, audio): eliminadas en este checkpoint, que es exclusivamente de texto.
- Modo thinking: el benchmark se ejecuta con thinking desactivado en vLLM, pero no se especifica si el modelo conserva la capacidad de activarlo.

## Casos de uso

- Benchmark de técnicas de poda: el modelo sirve como una de las 32 variantes (4 modelos x 8 variantes) para comparar el impacto de la poda por anchura frente a cuantización en tareas como BFCL, sesgo de contratación y MedQA.
- Investigación sobre degradación de calidad: permite medir cuánto rendimiento se pierde al eliminar el 10,7 % de los parámetros sin destilación posterior, útil para calibrar políticas de compresión.
- Evaluación de sesgo: el benchmark incluye una prueba de sesgo de contratación (hiring-bias), por lo que el modelo puede emplearse para estudiar cómo la poda afecta a sesgos sociales heredados.
- Experimentos de razonamiento clínico: la inclusión de MedQA en el benchmark permite usar el modelo para analizar la retención de conocimiento médico tras la compresión.
- Estudio de tool calling bajo compresión: BFCL evalúa la capacidad de invocar funciones; esta variante permite comparar si la poda de FFN degrada dicha habilidad.
- Comparación de eficiencia en vLLM: al tener menos parámetros, puede medirse el ahorro de memoria y el throughput frente al base en el mismo motor de inferencia, aunque no se publican cifras concretas.
- Referencia para pipelines de compresión: sirve como punto de comparación para quienes apliquen ModelOpt Minitron a otros modelos y quieran contrastar la reducción del 10,7 % con la caída de calidad observada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que el modelo forma parte de un benchmark sobre BFCL, hiring-bias y MedQA ejecutado con vLLM, pero no se incluyen las puntuaciones numéricas de esta variante ni del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 21,3 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 24 GB para contexto corto y 40-48 GB para contextos largos.
- VRAM estimada en cuantización de 8 bits: en torno a 11-12 GB para pesos, más overhead; viable en GPUs de 16-24 GB.
- VRAM estimada en cuantización de 4 bits: en torno a 6-7 GB para pesos; podría caber en GPUs consumer de 8-12 GB, aunque no se han publicado formatos GGUF oficiales para esta variante.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en BF16; RTX 4090 (24 GB) para BF16 con contexto moderado o para cuantización de 8 bits.
- Cabe en GPU consumer: sí, en RTX 4090 y posiblemente en RTX 3090/4080 con cuantización; en 4 bits podría intentarse en GPUs de 12 GB, sin garantías al no haber pesos cuantizados publicados.
- Opciones de despliegue: vLLM es el motor empleado en el benchmark; al ser un checkpoint safetensors de `Gemma4ForCausalLM`, debería cargarse con Transformers y, previsiblemente, con vLLM y TGI. No se confirma soporte en llama.cpp u Ollama al no existir GGUF.
- Latencia y throughput: no disponibles; no se publican métricas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| mrysh/gemma-4-12b-it-prune_width_ffn15 | 10.633 M | no disponible | apache-2.0 | Poda por anchura FFN 15 %, solo texto, sin fine-tuning posterior |
| google/gemma-4-12B-it (base) | ~12.000 M (aprox.) | no disponible | apache-2.0 (heredada) | Modelo original multimodal (texto, visión, audio), referencia del benchmark |
| Otras variantes del mismo benchmark (7 restantes) | no disponible | no disponible | apache-2.0 | No se detallan en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de calidad esperada: el autor advierte explícitamente de una caída de rendimiento frente al modelo base, ya que no se aplicó destilación ni fine-tuning tras la poda.
- Pérdida de multimodalidad: el checkpoint es solo texto; no incluye los bloques de visión ni audio del `gemma-4-12B-it` original.
- Sin datos de benchmarks publicados: no es posible cuantificar la degradación con cifras concretas a partir de la información disponible.
- Riesgo de alucinación: inherente al modelo base y potencialmente agravado por la poda sin reajuste.
- Sesgos: el benchmark incluye una prueba de hiring-bias, lo que sugiere que el modelo puede presentar sesgos sociales heredados; no se publican resultados.
- Idiomas: no se especifican los idiomas soportados tras la poda; la cobertura multilingüe podría verse afectada de forma desigual.
- Contexto: no se documenta la longitud de contexto efectiva de esta variante.
- Uso comercial: la licencia es apache-2.0 según la model card, si bien el autor remite a la licencia del modelo base; conviene verificar los términos de `google/gemma-4-12B-it` antes de un uso comercial.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; es un artefacto de investigación sin validación comunitaria.
- No apto para producción sin evaluación previa: al tratarse de una variante de benchmark sin fine-tuning, debe validarse en el dominio objetivo antes de desplegarla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrysh/gemma-4-12b-it-prune_width_ffn15
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- NVIDIA ModelOpt (herramienta de poda): no se proporciona enlace en la información disponible
- Paper de Minitron: no se proporciona enlace en la información disponible
- Repositorio o demo del benchmark: no disponible
