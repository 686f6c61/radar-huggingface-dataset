# sambal/k2-horizon-3.7b-lndpo-rpo-full-checkpoint-400

## Resumen

K2-Horizon-3.7B-LNDPO-RPO (checkpoint 400) es un ajuste fino completo del modelo base IFM/K2-Horizon-3.7B, un transformer de 3,7 mil millones de parametros desarrollado originalmente por IFM. Este checkpoint concreto ha sido entrenado por el usuario sambal mediante DPO con normalizacion por longitud (length-normalized DPO) y un termino adicional de RPO (NLL sobre las respuestas elegidas), sobre un dataset de preferencias especifico del dominio de petrofisica y registros de pozo (well logs).

El objetivo del ajuste es alinear el modelo hacia respuestas tecnicas mas detalladas y correctas en el ambito de la petrofisica, donde las respuestas preferidas son aproximadamente tres veces mas largas que las rechazadas. La normalizacion por longitud evita que la senal de preferencia sature unicamente por longitud, y el termino RPO impide que la probabilidad de las respuestas elegidas caiga mientras se penalizan las rechazadas.

Es relevante porque demuestra una receta de alineamiento domain-specific sobre un modelo pequeno (3,7B) con fine-tuning completo en bf16, sin adaptadores, y con soporte de modo de razonamiento explicito (`reasoning_effort="high"`). No obstante, el propio autor advierte de que las metricas publicadas miden preferencia en pares retenidos, no calidad de respuesta en tareas, y que el checkpoint no ha sido evaluado en ningun benchmark de tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (K2-Horizon, requiere `trust_remote_code`) |
| Parametros totales | 5.058.255.360 (segun safetensors); el nombre comercial indica 3.7B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 65.536 tokens en entrenamiento; contexto nativo del base no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se listan GGUF ni otras) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, modelo completo sin adaptadores) |

## Arquitectura y entrenamiento

El modelo parte de IFM/K2-Horizon-3.7B (revision `ea9a45d0`), un transformer decoder-only con codigo remoto propio, tokenizer y chat template especificos. El ajuste es un fine-tuning completo en bf16 realizado con Megatron a traves de ms-swift, sin LoRA ni adaptadores, sobre 32 GPU A100-80GB con tensor parallel 4 y data parallel 8.

La funcion de perdida combina DPO con log-ratios normalizados por token (media por token), perdida sigmoide y beta 5, mas un termino RPO de NLL sobre las respuestas elegidas con peso 1.0. El dataset `sambal/welllog-dpo-pairs` (config `k2_horizon`) contiene 8.055 pares de entrenamiento y 81 de validacion, con secuencias de hasta 65.536 tokens. El schedule usa learning rate 5e-7 con decaimiento coseno hasta 5e-8, 5% de warmup, batch global 32, Adam (0.9, 0.95) y weight decay 0.1; el plan era de 2 epochs (503 pasos) y se detuvo cerca del paso 425. Este checkpoint corresponde al paso 400 (12.800 pares, ~1,6 epochs). El entrenamiento utilizo el formato `reasoning_effort="high"` con bloques `<ifm|think>...</ifm|think>` antes de la respuesta, que es el valor por defecto de la plantilla de chat.

## Capacidades

- Generacion de texto conversacional y tecnica en el dominio de petrofisica y registros de pozo.
- Modo de razonamiento explicito (`reasoning_effort="high"`) con bloques de pensamiento delimitados por `<ifm|think>...</ifm|think>`.
- Respuestas tecnicas detalladas y de mayor longitud, favorecidas por el ajuste de preferencias.
- Soporte de conversaciones multi-turno mediante la plantilla de chat del modelo base.
- Compatibilidad con el parser de razonamiento `k2_horizon` en vLLM.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se documentan idiomas soportados.
- Vision o audio: no disponible; el pipeline declarado es unicamente text-generation.

## Casos de uso

- Asistencia tecnica en petrofisica: el modelo puede responder consultas sobre interpretacion de registros de pozo (porosidad, saturacion, litologia) con el nivel de detalle que el ajuste de preferencias ha reforzado, usando el modo de razonamiento para desglosar el analisis paso a paso.
- Generacion de informes tecnicos extensos: dado que las respuestas preferidas en el dataset son ~3x mas largas que las rechazadas, el modelo tiende a producir explicaciones detalladas, adecuadas para borradores de informes de interpretacion.
- Despliegue en produccion con vLLM: se sirve con `vllm serve ... --trust-remote-code --dtype bfloat16 --reasoning-parser k2_horizon`, lo que permite integrarlo en un endpoint OpenAI-compatible con separacion del bloque de razonamiento.
- Experimentacion en alineamiento: sirve como referencia reproducible de una receta length-normalized DPO + RPO sobre un modelo de ~4-5B, util para investigadores que quieran replicar o comparar variantes (existe tambien el checkpoint 300 y la version 7B de la misma receta).
- Procesamiento de contexto largo: con secuencias de hasta 65.536 tokens en entrenamiento, puede manejar documentos tecnicos extensos o historiales de pozo completos en una sola ventana, sujeto al contexto nativo real del base.
- Fine-tuning posterior domain-specific: al publicarse los pesos completos en bf16 y sin adaptadores, es un punto de partida directo para nuevos ajustes sobre otros dominios tecnicos.
- Evaluacion comparativa de checkpoints: permite comparar el paso 300 frente al 400 para estudiar la evolucion de la preferencia durante el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea en la informacion disponible. El autor indica explicitamente que el checkpoint no ha sido evaluado en ningun benchmark de tarea. Solo se publican metricas de preferencia en validacion retenida (81 pares, log-probabilidad por token):

| Metrica (validacion, 81 pares) | Checkpoint 400 | Modelo base |
|---|---|---|
| Log-prob. media por token, respuestas elegidas | -0.575 | -0.759 |
| Log-prob. media por token, respuestas rechazadas | -3.525 | -0.721 |
| Precision de preferencia | 100% | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 10-11 GB solo para pesos (5.058 millones de parametros x 2 bytes), mas overhead de KV cache y activaciones; el repositorio ocupa 10,1 GB.
- GPU recomendadas: A100-80GB o H100 para servicio con contexto largo; el entrenamiento se realizo con 32 x A100-80GB.
- GPU de consumo: cabe en GPUs consumer con 16 GB o mas (RTX 4090, RTX 4080, etc.) en bf16 para contextos moderados; en GPUs de 12 GB requeriria cuantizacion, que no se documenta.
- Opciones de despliegue: vLLM es la via documentada por el autor (`--trust-remote-code`, `--dtype bfloat16`, `--reasoning-parser k2_horizon`). Otros runners (llama.cpp, Ollama, TGI) no se mencionan y pueden no soportar el codigo remoto y el chat template propios.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Requisito de software: transformers >= 5.13 y `trust_remote_code` obligatorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sambal/k2-horizon-3.7b-lndpo-rpo-full-checkpoint-400 | 5.058 M (nominal 3.7B) | hasta 65.536 en entrenamiento | DPO length-normalized + RPO, dominio petrofisica | apache-2.0 | HuggingFace |
| sambal/k2-horizon-3.7b-lndpo-rpo-full-checkpoint-300 | mismo base | idem | misma receta, paso 300 | apache-2.0 | HuggingFace |
| sambal/k2-horizon-7b-lndpo-rpo-full-checkpoint-300 | base 7B | no disponible | misma receta sobre 7B | no disponible | HuggingFace |
| IFM/K2-Horizon-3.7B (base) | 3.7B nominal | no disponible | modelo base sin alinear | no disponible | HuggingFace |

No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Las metricas publicadas miden preferencia en pares retenidos, no calidad de respuesta; el autor lo advierte explicitamente.
- El checkpoint no ha sido evaluado en ningun benchmark de tarea, por lo que su rendimiento real en tareas de petrofisica o generales es desconocido.
- El ajuste esta especializado en un unico dominio (registros de pozo y petrofisica); puede degradar el rendimiento en tareas generales respecto al modelo base.
- Riesgo de alucinacion en contenido tecnico no cubierto por el dataset de preferencias; no se documentan mitigaciones.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no documentados; no se garantiza un comportamiento multilingue.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene auditar el codigo antes de desplegarlo en produccion.
- Dependencia de una version muy reciente de transformers (>= 5.13), lo que puede limitar la compatibilidad con stacks existentes.
- Licencia apache-2.0 permite uso comercial, pero no se ofrecen garantias ni se documentan limitaciones de responsabilidad adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sambal/k2-horizon-3.7b-lndpo-rpo-full-checkpoint-400
- Modelo base: https://huggingface.co/IFM/K2-Horizon-3.7B
- Dataset de preferencias: https://huggingface.co/datasets/sambal/welllog-dpo-pairs
- Checkpoint 300 de la misma receta: https://huggingface.co/sambal/k2-horizon-3.7b-lndpo-rpo-full-checkpoint-300
- Version 7B de la misma receta: https://huggingface.co/sambal/k2-horizon-7b-lndpo-rpo-full-checkpoint-300
