# positron-ai/Qwen_Qwen3.6-35B-A3B-ingest-best-gptq

## Resumen

`positron-ai/Qwen_Qwen3.6-35B-A3B-ingest-best-gptq` es una cuantización GPTQ de 4 bits del modelo `Qwen/Qwen3.6-35B-A3B`, publicada por Positron AI. Se trata de un artefacto de inferencia, no de un modelo entrenado desde cero: el trabajo de Positron AI consiste en comprimir los pesos originales de Qwen para reducir el coste de memoria y facilitar el despliegue en GPU, manteniendo la licencia Apache 2.0 del modelo base.

El modelo subyacente es un transformer con arquitectura MoE (mezcla de expertos) de la familia Qwen 3.5/3.6, con 35.951.822.704 parámetros totales según los safetensors del repositorio. El tag `qwen3_5_moe` y la nomenclatura "A3B" indican que se activan aproximadamente 3.000 millones de parámetros por token, aunque el dato exacto de parámetros activos no está confirmado en la información disponible. El pipeline declarado es `text-generation` y el tag de la model card incluye `image-text-to-text`, lo que sugiere capacidades multimodales en el modelo base.

La relevancia de esta ficha es práctica: permite desplegar un MoE de ~36.000 millones de parámetros en 4 bits (repositorio de 44,9 GB) con GPTQ, group size 64 y cuantización simétrica, sin métricas de calidad publicadas. Es un artefacto orientado a entornos de inferencia controlados, con la advertencia de que el autor no reporta KL-divergence, perplejidad ni precisión, y que la validación se gestiona internamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), familia Qwen 3.6 |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible (nomenclatura "A3B" sugiere ~3B activos; no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ 4-bit (pesos 4 bits, activaciones sin cuantizar, group size 64, simetrica, `desc_act=false`, damp 0.05) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (GPTQ), libreria `transformers` |

## Arquitectura y entrenamiento

El artefacto es una cuantización GPTQ del modelo base `Qwen/Qwen3.6-35B-A3B`, que emplea una arquitectura transformer con mezcla de expertos según el tag `qwen3_5_moe`. Los pesos se cuantizan a 4 bits con GPTQ, agrupación de 64, cuantización simétrica y sin `desc_act`, mientras que las activaciones permanecen en precisión completa. La calibración se realizó con un conjunto mixto de dominio universal de 512 muestras y longitud de secuencia 8192, usando GPTQModel 7.6.0, transformers 5.15.0, torch 2.9.1 y CUDA 12.8.

No se dispone de información sobre el entrenamiento original del modelo base: número de tokens, composición del dataset, uso de RLHF/DPO ni innovaciones de atención. La model card de esta cuantización no documenta esos detalles y se limita a describir el proceso de compresión. Tampoco se especifica la precisión de origen ni el runtime o hardware objetivo.

## Capacidades

- Generación de texto conversacional y de propósito general, según el pipeline `text-generation`.
- Procesamiento image-text-to-text: el tag de la model card sugiere entrada multimodal de imagen y texto, aunque no se detalla el alcance.
- Razonamiento y matemáticas: capacidad esperable en la familia Qwen 3.6, pero no verificada con benchmarks en esta ficha.
- Generación de código: no documentada explícitamente en la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el campo de idiomas no está relleno.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue de un MoE de ~36.000 millones de parámetros en una sola GPU de 80 GB: el artefacto de 44,9 GB en 4 bits permite cargar el modelo completo con margen para KV cache, algo inviable en FP16/BF16.
- Servicio de chat multi-turno en producción: el pipeline `text-generation` y el formato `transformers` permiten integrarlo en APIs conversacionales, siempre que se valide la calidad tras la cuantización.
- Procesamiento de documentos con imagen y texto: si se confirma la capacidad image-text-to-text del modelo base, podría usarse para extracción y resumen de documentos escaneados.
- Evaluación comparativa de cuantizaciones: útil como referencia GPTQ frente a otros formatos del mismo modelo base antes de fijar un despliegue.
- Prototipado en entornos con VRAM limitada: la cuantización 4-bit reduce el requisito de memoria frente al modelo original y facilita pruebas en estaciones con una sola GPU.
- Inferencia por lotes en pipelines de generación de texto: el tamaño del repositorio y el formato safetensors permiten cargarlo con `transformers` y herramientas compatibles con GPTQ.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no reporta métricas de rendimiento ni calidad (sin KL-divergence, accuracy ni perplexity) y que la validación se gestiona internamente por Positron AI.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 44,9 GB en 4 bits; se necesita al menos una GPU con ~48 GB para los pesos, más memoria para KV cache y activaciones.
- GPU recomendadas: A100 80 GB, H100 80 GB o GPUs con 48 GB o más; no se confirma compatibilidad con GPUs de 24 GB.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en GPUs consumer de 16-24 GB con este formato, salvo técnicas de offloading no documentadas.
- Opciones de despliegue: `transformers` con soporte GPTQ; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| positron-ai/Qwen_Qwen3.6-35B-A3B-ingest-best-gptq | 35,95B totales (MoE) | no disponible | GPTQ 4-bit | Apache 2.0 | Hugging Face, 77 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | 35,95B totales (MoE) | no disponible | original (precision no indicada) | Apache 2.0 | Hugging Face |
| Otras cuantizaciones del mismo base | 35,95B totales (MoE) | no disponible | no disponible | Apache 2.0 | no disponible |

No se dispone de datos de rendimiento para comparar calidad entre estas variantes.

## Limitaciones y advertencias

- Sin métricas de calidad publicadas: no hay KL-divergence, perplejidad ni precisión que permitan estimar la degradación frente al modelo base.
- Sesgos conocidos: no documentados en la información disponible; hereda los del modelo base Qwen.
- Riesgo de alucinación: no cuantificado; aplicable el riesgo habitual de los modelos generativos.
- Idiomas: el campo de idiomas no está relleno, por lo que no se puede confirmar cobertura multilingüe.
- Licencia: Apache 2.0, con las restricciones del modelo base que siguen aplicando; conviene revisar el LICENSE del repositorio Qwen original.
- Contexto: la longitud de contexto no está disponible, lo que impide planificar cargas de trabajo con ventanas largas.
- Cuantización: al ser 4-bit con activaciones sin cuantizar y `desc_act=false`, el rendimiento puede diferir del modelo original; requiere validación propia antes de producción.
- Soporte de herramientas: no se documenta compatibilidad con vLLM, TGI, llama.cpp ni Ollama, lo que limita las opciones de despliegue a `transformers` y entornos GPTQ compatibles.

## Enlaces

- Hugging Face: https://huggingface.co/positron-ai/Qwen_Qwen3.6-35B-A3B-ingest-best-gptq
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
