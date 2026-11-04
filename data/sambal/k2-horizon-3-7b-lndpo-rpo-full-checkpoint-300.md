# sambal/k2-horizon-3.7b-lndpo-rpo-full-checkpoint-300

## Resumen

K2-Horizon-3.7B (checkpoint 300) es un ajuste fino completo del modelo base IFM/K2-Horizon-3.7B, publicado por el usuario sambal en HuggingFace. Se trata de un modelo de generacion de texto especializado en petrofisica y registros de pozo (well logs), entrenado mediante una receta de DPO con normalizacion por longitud combinada con un termino RPO (NLL sobre las respuestas elegidas). El objetivo es alinear el modelo hacia respuestas tecnicas mas largas y detalladas en el dominio de la petrofisica, sin degradar la verosimilitud de las respuestas preferidas.

El modelo conserva la arquitectura, tokenizador y plantilla de chat del modelo base K2-Horizon-3.7B, por lo que se sirve de forma identica a este. Los pesos publicados son el modelo completo en bf16, sin adaptadores LoRA. El repositorio ocupa 10,1 GB y contiene 5.058.255.360 parametros segun los safetensors, un dato que no coincide con la denominacion "3.7B" del nombre, lo que conviene tener en cuenta al planificar el despliegue.

Es relevante ahora porque ilustra un caso de alineamiento de dominio muy especifico (petrofisica) sobre un modelo pequeno con modo de razonamiento explicito (`<ifm|think>...</ifm|think>`), y porque documenta con detalle la receta de entrenamiento y las metricas de preferencia en validacion, algo poco habitual en checkpoints intermedios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (K2-Horizon, codigo remoto propio; detalles no disponibles) |
| Parametros totales | 5.058.255.360 (segun safetensors); el nombre indica 3.7B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 65.536 tokens en entrenamiento; contexto maximo del base no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, modelo completo) |

## Arquitectura y entrenamiento

El modelo parte de IFM/K2-Horizon-3.7B (revision `ea9a45d0`) y se ajusta de forma completa (full fine-tuning) en bf16 con Megatron a traves de ms-swift. La arquitectura subyacente es la del modelo base K2-Horizon, que requiere codigo remoto (`trust_remote_code`) y una version de transformers >= 5.13; no se detallan en la informacion disponible aspectos como tipo de atencion, uso de MoE o innovaciones internas del transformer.

El entrenamiento usa DPO con log-ratios normalizados por token (media por token), perdida sigmoide y beta 5, mas un termino RPO de NLL sobre las respuestas elegidas con peso 1.0. El dataset es sambal/welllog-dpo-pairs (config `k2_horizon`), con 8.055 pares de entrenamiento y 81 de validacion, secuencias de hasta 65.536 tokens. La normalizacion por longitud evita que la senal de preferencia se sature por longitud (las respuestas elegidas son ~3x mas largas que las rechazadas) y el termino RPO evita que caiga la verosimilitud de las respuestas elegidas. Hiperparametros: lr 5e-7 con coseno a 5e-8, 5% warmup, batch global 32, Adam (0.9, 0.95), weight decay 0.1, schedule de 2 epocas (503 pasos) detenido cerca del paso 425. Hardware: 32 x A100-80GB con tensor parallel 4 y data parallel 8. Este checkpoint corresponde al paso 300 (9.600 pares, ~1,2 epocas). El formato de entrenamiento usa `reasoning_effort="high"`, con bloque `<ifm|think>...</ifm|think>` antes de la respuesta.

## Capacidades

- Generacion de texto conversacional en el dominio de petrofisica y registros de pozo.
- Razonamiento explicito mediante bloque de pensamiento `<ifm|think>...</ifm|think>` antes de la respuesta (formato por defecto de la plantilla de chat).
- Alineamiento hacia respuestas tecnicas mas largas y detalladas en el dominio entrenado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; los idiomas no estan declarados.
- Vision o audio: no disponible.

## Casos de uso

- Asistente tecnico de petrofisica: el modelo puede mantener conversaciones multi-turno sobre interpretacion de registros de pozo, con hasta 65.536 tokens de contexto para incluir historiales largos o descripciones extensas de yacimientos.
- Analisis de registros de pozo (well logs): dado que el ajuste se hizo sobre pares de preferencia de este dominio, es adecuado para generar explicaciones detalladas de curvas y respuestas tecnicas extendidas.
- Generacion de informes tecnicos extensos: el alineamiento favorece respuestas mas largas y desarrolladas, util para redactar secciones de informes petrofisicos.
- Formacion y documentacion interna: puede usarse para generar material explicativo de conceptos petrofisicos a partir de preguntas, con razonamiento intermedio visible.
- Prototipado de asistentes de dominio en investigacion: sirve como punto de partida para experimentos de alineamiento DPO+RPO en nichos tecnicos.
- Evaluacion de recetas de alineamiento: util como referencia para comparar checkpoints (paso 300 frente a paso 400) y la receta en el modelo de 7B.
- Despliegue en entornos con GPU de 80 GB: al publicarse en bf16 con ~5.000 millones de parametros, encaja en infraestructura de una sola GPU de gama alta para pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea en la informacion disponible. La model card indica explicitamente que este checkpoint no ha sido evaluado en un benchmark de tarea. Solo se aportan metricas de preferencia en validacion (81 pares, log-probabilidad por token):

| Metrica (validacion, 81 pares) | Checkpoint paso 300 | Modelo base |
|---|---|---|
| Log-prob. media por token, elegidas | -0,582 | -0,759 |
| Log-prob. media por token, rechazadas | -3,450 | -0,721 |
| Precision de preferencia | 100% | no disponible |

Estas cifras miden preferencia en pares retenidos, no calidad de respuesta.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 10,1 GB solo de pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 24-40 GB para contexto moderado.
- Entrenamiento original: 32 x A100-80GB (tensor parallel 4, data parallel 8).
- GPU recomendadas para inferencia: A100-80GB, H100, y en general GPUs con 40-80 GB para contextos largos.
- GPU de consumo: puede caber en RTX 4090 (24 GB) en bf16 con contexto limitado, o cuantizado si se generan pesos GGUF (no publicados). No confirmado por el autor.
- Opciones de despliegue: vLLM con `--trust-remote-code --dtype bfloat16 --reasoning-parser k2_horizon`; requiere transformers >= 5.13. Otras opciones (llama.cpp, Ollama, TGI) no estan documentadas para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sambal/k2-horizon-3.7b-lndpo-rpo-full-checkpoint-300 | 5.058.255.360 (safetensors) | hasta 65.536 en entrenamiento | Petrofisica | apache-2.0 | HuggingFace |
| sambal/k2-horizon-3.7b-lndpo-rpo-full-checkpoint-400 | no disponible | no disponible | Petrofisica | apache-2.0 | HuggingFace |
| sambal/k2-horizon-7b-lndpo-rpo-full-checkpoint-300 | ~7B (segun nombre) | no disponible | Petrofisica | no disponible | HuggingFace |
| IFM/K2-Horizon-3.7B (base) | 3.7B (segun nombre) | no disponible | General | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No evaluado en benchmarks de tarea: las metricas publicadas solo miden preferencia en 81 pares de validacion, no calidad real de respuesta.
- Dominio muy restringido: el ajuste se hizo sobre pares de petrofisica; el rendimiento fuera de ese dominio puede degradarse respecto al modelo base.
- Discrepancia de parametros: el nombre indica 3.7B pero los safetensors suman 5.058.255.360 parametros; verificar antes de dimensionar infraestructura.
- Idiomas no declarados: no hay garantia de comportamiento multilingue.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; en dominio tecnico como petrofisica, validar siempre las respuestas por un experto.
- Sesgos: no documentados por el autor; el dataset de preferencia puede introducir sesgos de estilo (respuestas mas largas) y de contenido.
- Licencia apache-2.0 permite uso comercial, pero el modelo base puede tener condiciones adicionales no detalladas; revisar la licencia de IFM/K2-Horizon-3.7B.
- Requiere codigo remoto (`trust_remote_code`) y transformers >= 5.13, lo que implica riesgos de seguridad y dependencia de codigo del autor.
- Checkpoint intermedio (paso 300 de un schedule de 503 pasos): no es el estado final del entrenamiento.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sambal/k2-horizon-3.7b-lndpo-rpo-full-checkpoint-300
- Modelo base: https://huggingface.co/IFM/K2-Horizon-3.7B
- Dataset de preferencias: https://huggingface.co/datasets/sambal/welllog-dpo-pairs
- Checkpoint paso 400: https://huggingface.co/sambal/k2-horizon-3.7b-lndpo-rpo-full-checkpoint-400
- Receta equivalente en 7B: https://huggingface.co/sambal/k2-horizon-7b-lndpo-rpo-full-checkpoint-300
