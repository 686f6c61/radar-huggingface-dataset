# Jakevin/clef-flash-mixed-GGUF

## Resumen

Clef-Flash mixed-precision GGUF es una cuantizacion post-entrenamiento no oficial de Cloudflare/clef-flash, publicada por el usuario Jakevin. El modelo base es la espina dorsal de texto de Clef-Flash (revision 17f0b0ad), un modelo de 8.953.803.264 parametros (unos 8,95 mil millones) construido sobre un backbone de arquitectura qwen35 con componentes SSM, disenado no para generar texto libre sino para emitir decisiones estructuradas mediante una cabeza conjunta ("joint schema head") que se ejecuta en Python sobre los ultimos estados ocultos.

El repositorio contiene unicamente la espina dorsal de texto en formato GGUF, cuantizada a precision mixta con una estrategia de sensibilidad medida por KL. No incluye torre de vision, y el archivo GGUF no produce por si solo las decisiones de Clef: la cabeza de clasificacion se ejecuta aparte en Python y las filas de opciones provienen del lm_head en bf16 del modelo original. Esta relevancia practica: permite ejecutar un modelo de ~8,95B parametros en 3.300 GB, frente a los 19,06 GB del bf16 original, con una retencion de precision declarada del 99,5% en decision-v7 y del 98,1% en transfer-v9.

Es una release no oficial, no respaldada por Cloudflare ni por el equipo de Qwen, licenciada Apache-2.0 igual que el original. Se renombro desde Jakevin/clef-flash-ternary-GGUF el 2026-10-09, aunque no usa formatos ternarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen35 (espina dorsal de texto Qwen3.5 con componentes SSM: ssm_alpha, ssm_beta, ssm_conv1d, ssm_a, ssm_dt) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XXS (68 tensores), IQ2_S (23), IQ3_XXS (35), Q2_K (16), Q3_K (13), Q4_K (36), Q8_0 (11), BF16 (48), F32 (177) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (archivo clef-flash-mkl-3.30GB.gguf, 3.300 GB) |

## Arquitectura y entrenamiento

La arquitectura declarada en el GGUF es `qwen35`, es decir, el backbone de texto de Qwen3.5. El modelo no se exporta con arquitectura `clef` porque el grafo `clef` de llama.cpp no exporta `t_h_nextn`, el estado oculto que lee la receta de clasificacion; por eso el archivo es el modelo de texto Qwen3.5 y no la arquitectura `clef`. El repositorio contiene 427 tensores con presencia de componentes SSM (`ssm_alpha` y `ssm_beta` fijados a BF16, y `ssm_conv1d`, `ssm_a`, `ssm_dt` en F32), lo que apunta a un diseno hibrido con bloques de espacio de estados junto a las capas lineales del cuerpo. No se proporcionan datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

En cuanto al proceso de cuantizacion (que es el "entrenamiento" relevante de esta release), se aplico una sensibilidad KL medida por tensor y despues un problema de mochila (knapsack) que asigna a cada tensor medido un tipo ggml de entre IQ2_XXS, IQ2_S, Q2_K, IQ3_XXS, Q3_K, Q4_K y Q8_0. El archivo final se genero con `llama-quantize --tensor-type` usando esa imatrix. La calibracion empleo 128 registros de decision-v7 con semilla 1234 para la imatrix y los primeros 32 de ese sorteo (10.383 tokens) para la KL por tensor. Las normas, la convolucion y los parametros `ssm_alpha`/`ssm_beta` no se cuantizan. `output.weight` queda fijado a Q2_K y no lo lee la cabeza de clasificacion, mientras que `token_embd` se cuantiza a IQ3_XXS. La suma de los valores KL por tensor usados por el knapsack es 0.009015. La estimacion en dry-run fue de 3.300 GB.

## Capacidades

- Clasificacion y decision estructurada: el modelo esta disenado para emitir decisiones mediante una cabeza conjunta sobre los estados ocultos finales, con soporte de salida estructurada (structured-output) y clasificacion.
- Salida estructurada: orientado a preguntas del tipo `choice` y `noul` (ejemplo de factura de la model card de Cloudflare) con un esquema definido.
- Texto conversacional: etiquetado como `conversational`, aunque la ficha del autor se centra en la tarea de decision.
- Solo texto: no hay torre de vision; el archivo es unicamente el backbone de texto.
- No genera las decisiones por si solo en llama.cpp: el joint schema head se ejecuta en Python sobre los estados ocultos finales del backbone.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, audio): no disponible; solo texto.

## Casos de uso

- Clasificacion documental estructurada: el modelo puede puntuar o etiquetar documentos (por ejemplo, facturas) generando decisiones sobre un esquema fijo, aprovechando la cabeza conjunta que se ejecuta sobre los estados ocultos del backbone.
- Enrutamiento o triaje de tickets: dado que emite decisiones tipo `choice`, puede usarse para asignar categorias o resolver opciones discretas en pipelines de soporte.
- Validacion de campos y extraccion de decisiones: en el ejemplo de factura de referencia, una pregunta `choice` y una `noul` permiten decidir y validar contenido de forma reproducible.
- Despliegue en entornos con poca VRAM: al ocupar 3.300 GB en GGUF, permite ejecutar la espina dorsal de un modelo de ~8,95B en GPU de consumo, integr\u00e1ndola con la cabeza en Python en el mismo host.
- Evaluacion de cuantizacion en produccion: util para equipos que quieren comparar retencion de precision (99,5% en decision-v7, 98,1% en transfer-v9) frente al bf16 antes de desplegar.
- Servicio de inferencia local con llama.cpp: integrable en un binario con `hsdump` (llama.cpp b11407 o superior) para volcar estados ocultos y alimentar la logica de decision en Python.
- Reproduccion de pipelines de clasificacion: permite reconstruir exactamente el flujo de decision (backbone GGUF + `lm_head` en bf16) para auditar resultados o comparar con la variante MLX.

## Benchmarks y rendimiento

Datos de la model card del autor sobre sus splits privados congelados (un unico seed, sin intervalo de confianza). Cabe advertir que decision-v7 puede ser optimista, ya que tanto la imatrix como la asignacion KL usaron registros de decision-v7.

| Suite | n (clean) | bf16 acc | Este modelo | Retencion |
|---|---:|---:|---:|---:|
| decision-v7 | 1264 | 0.8861 | 0.8813 | 99,5% |
| transfer-v9 | 1046 | 0.8011 | 0.7859 | 98,1% |

| Suite | Brier | NLL | ECE |
|---|---:|---:|---:|
| decision-v7 | 0.1755 | 0.3382 | 0.0278 |
| transfer-v9 | 0.3061 | 0.6042 | 0.0421 |

El autor indica explicitamente que no son los numeros publicos del Decision Index ni de Typesafe. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 3,3 GB para el archivo GGUF (3.300 GB) mas el espacio necesario para ejecutar la cabeza en Python (torch, safetensors, numpy, transformers) y el backbone completo cuando se carga para volcar estados ocultos.
- Modelo original en bf16: 19,06 GB (18,82 GB de shards + 0,24 GB de cabeza), lo que requiere GPU de gama alta o multi-GPU.
- GPU recomendadas: para el GGUF cuantizado, cualquier GPU consumer con 6-8 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente para los pesos; para el bf16 original, A100 40GB/H100 o similar.
- Compatibilidad con GPU de consumo: si, el archivo de 3.300 GB cabe en GPU de consumo, siempre que se disponga de memoria adicional para el proceso Python de la cabeza.
- Opciones de despliegue: llama.cpp b11407 o superior (text-only qwen35) con el binario `hsdump` compilado desde `hsdump.cpp`; la cabeza requiere torch, safetensors, numpy y transformers. No se menciona soporte de vLLM, TGI, Ollama ni otros motores en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Release | Formato | Tamano | decision-v7 | transfer-v9 |
|---|---|---:|---|---|
| Este repo, v1.0 | GGUF precision mixta (KL medida) | 3.300 GB | 0.8813 (99,5% de bf16) | 0.7859 (98,1% de bf16) |
| Jakevin/clef-flash-ternary-mlx v2.0 | MLX packed mixed-bit GPTQ | 3,13 GB | 0.8766 (98,9% de bf16) | 0.7361 (91,9% de bf16) |
| bartowski/Cloudflare_clef-flash-GGUF (Q2_K) | GGUF Q2_K | 4,19 GB | no evaluado aqui | no evaluado aqui |
| Cloudflare/clef-flash original | bf16 | 19,06 GB | 0.8861 | 0.8011 |

La model card del autor no afirma que una asignacion sea mejor que otra; la comparacion MLX se toma de la propia ficha de ese repositorio y usa las mismas referencias bf16 (0.8861 y 0.8011). El archivo Q2_K de bartowski no fue evaluado por el autor.

## Limitaciones y advertencias

- No es una release oficial de Cloudflare ni esta respaldada por Cloudflare ni por el equipo de Qwen.
- Solo contiene la espina dorsal de texto: no hay torre de vision.
- El GGUF no genera decisiones de Clef por si solo; la cabeza conjunta se ejecuta en Python y las filas de opciones provienen del lm_head en bf16 del modelo original. `output.weight` dentro del GGUF no es la cabeza de clasificacion.
- Se debe pasar `--base` con un checkout de Cloudflare/clef-flash (misma revision); solo se lee `lm_head.weight` de el.
- Requiere llama.cpp b11407 o superior con qwen35 text-only; las dos llamadas de embedding estan en `src/llama-ext.h`, no en el `llama.h` instalado, por lo que puede hacer falta compilar `hsdump.cpp` con las declaraciones correspondientes.
- La evaluacion procede de splits privados del autor, con un unico seed y sin intervalo de confianza; decision-v7 puede ser optimista porque se uso para calibrar la imatrix y la asignacion KL.
- Los numeros no son el Decision Index ni Typesafe publicos.
- Sesgos conocidos: no disponible.
- Riesgo de alucinacion: no disponible (el modelo no se evalua para generacion abierta en esta release).
- Limitaciones de contexto o idioma: no disponible.
- Licencia: Apache-2.0, igual que el original; el uso comercial esta permitido por la licencia, pero conviene revisar `NOTICE.md` y las condiciones del modelo base.
- Caveat de produccion: `general.name` es "Snap Text" porque el directorio de conversion tenia ese nombre, lo que puede inducir a confusion sobre la identidad del modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jakevin/clef-flash-mixed-GGUF
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Variante MLX: https://huggingface.co/Jakevin/clef-flash-ternary-mlx
- Cuantizacion alternativa de bartowski: https://huggingface.co/bartowski/Cloudflare_clef-flash-GGUF
