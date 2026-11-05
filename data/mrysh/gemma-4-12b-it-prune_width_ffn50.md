# mrysh/gemma-4-12b-it-prune_width_ffn50

## Resumen

`mrysh/gemma-4-12b-it-prune_width_ffn50` es una variante podada por anchura del modelo `google/gemma-4-12B-it`, publicada por el usuario mrysh como parte de un banco de pruebas de pruning (4 modelos x 8 variantes). El modelo conserva la arquitectura Transformer original de Gemma 4 en su rama de texto (`Gemma4ForCausalLM`), pero reduce el tamaño de las capas feed-forward de 15360 a 7680 neuronas intermedias en todas las capas, manteniendo intacto el numero de capas. El resultado es un checkpoint de aproximadamente 7.660 millones de parametros, frente a los 12B del modelo base.

La poda se realizo con NVIDIA ModelOpt 0.46.0rc1 mediante la tecnica Minitron de pruning por anchura, midiendo la importancia de las neuronas sobre un conjunto de calibracion de 512 muestras mixtas. No se aplico destilacion ni fine-tuning posterior, por lo que el autor advierte explicitamente de una caida de calidad respecto al modelo original. El checkpoint es exclusivamente de texto: los bloques de vision y audio del modelo base no estan incluidos.

Su relevancia es fundamentalmente experimental: sirve para medir el impacto del pruning por anchura en tareas como BFCL (tool calling), sesgo de contratacion y MedQA, comparandolo con otras variantes de poda y con cuantizacion sobre el mismo modelo base. No es un modelo orientado a produccion ni un lanzamiento oficial de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4, `Gemma4ForCausalLM`), podado por anchura en FFN |
| Parametros totales | 7.660.617.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en BF16/FP16; el autor menciona comparaciones con cuantizacion en el benchmark, sin detallar formatos) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 15,4 GB; checkpoint de 15,353 GB) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-12B-it`, un Transformer decoder-only de la familia Gemma 4 con bloques de atencion y FFN apilados. La intervencion consiste en un pruning por anchura (width pruning) sobre las capas feed-forward: la dimension intermedia de cada FFN se reduce de 15360 a 7680 (una reduccion del 50% solicitada), mientras que el numero de capas y el resto de la topologia permanecen sin cambios. La seleccion de neuronas a eliminar se basa en una medida de importancia calculada sobre un conjunto de calibracion de 512 muestras mixtas, siguiendo el procedimiento Minitron de NVIDIA ModelOpt 0.46.0rc1.

La reduccion efectiva es del 35,7% de los parametros del checkpoint completo, lo que deja el modelo en unos 7,66B parametros. No hubo destilacion, recuperacion ni fine-tuning posterior al pruning, por lo que la calidad del modelo podado es estrictamente la que resulta de eliminar neuronas del modelo original. El checkpoint elimina ademas los modulos de vision y audio del modelo base, quedando como modelo puramente de texto.

## Capacidades

- Generacion de texto autoregresiva en el formato nativo de Gemma 4 (chat template del modelo base, presumiblemente heredado).
- Razonamiento y respuesta a instrucciones, sujeto a la degradacion esperada por el pruning sin recuperacion.
- Tool calling / function calling: es una de las tareas evaluadas en el benchmark del autor (BFCL), aunque no se publican resultados en la informacion disponible.
- Capacidades multilingues: no disponible (los idiomas del modelo base no se detallan en la model card de esta variante).
- Vision y audio: no soportados, los bloques correspondientes no estan incluidos en el checkpoint.
- Modo thinking: el autor indica que el benchmark se ejecuto con thinking desactivado en vLLM; la disponibilidad del modo thinking no se documenta para esta variante.

## Casos de uso

- Evaluacion comparativa de tecnicas de pruning: el proposito declarado del checkpoint es servir como una de las 8 variantes de poda en un banco de pruebas que compara pruning por anchura, otras variantes y cuantizacion sobre el mismo modelo base, midiendo la degradacion en BFCL, sesgo de contratacion y MedQA.
- Investigacion sobre pruning por anchura en LLM: permite analizar como la reduccion de la dimension FFN afecta tareas de tool calling y razonamiento medico, con un checkpoint reproducible generado por ModelOpt.
- Experimentos de eficiencia en inferencia: con 7,66B parametros en lugar de 12B, el modelo reduce los requisitos de memoria y computo por token, lo que facilita probar configuraciones de vLLM o servir el modelo en GPUs con menos VRAM que las necesarias para el base.
- Analisis de sesgo: el benchmark incluye la tarea de hiring-bias, por lo que el checkpoint puede usarse para estudiar si el pruning por anchura altera el comportamiento sesgado del modelo base en decisiones de contratacion simuladas.
- Evaluacion en QA medico (MedQA): util para medir la perdida de conocimiento factual tras eliminar neuronas FFN, comparandola con la del modelo sin podar.
- Baseline para tecnicas de recuperacion: al no incluir destilacion ni fine-tuning, sirve como punto de partida para estudiar cuanto puede recuperarse mediante distillation o continued pretraining sobre un checkpoint ya podado.
- Pruebas de integracion con vLLM: el autor ejecuto el benchmark en vLLM, por lo que el checkpoint es util para validar pipelines de evaluacion y despliegue en ese motor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el modelo se evalua en BFCL, hiring-bias y MedQA dentro de un benchmark de pruning, pero no incluye las cifras obtenidas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia aritmetica, 7,66B parametros en BF16 requieren unos 15,3 GB solo para los pesos, mas overhead de KV cache y activaciones; en FP8 unos 7,7 GB; en cuantizaciones de 4 bits del orden de 4 GB.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada por el autor; por tamano, un checkpoint BF16 de 15,3 GB no cabe en GPUs de 12 GB o menos sin cuantizacion u offloading.
- Opciones de despliegue: vLLM (utilizado por el autor para el benchmark, con thinking desactivado). Otros motores como llama.cpp, Ollama o TGI no se mencionan en la model card.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| mrysh/gemma-4-12b-it-prune_width_ffn50 | 7,66B | no disponible | apache-2.0 | Variante podada por anchura, sin recuperacion; solo texto |
| google/gemma-4-12B-it (base) | 12B | no disponible | misma que el base (ver model card del base) | Modelo original con vision y audio; referencia de calidad |
| Otras variantes de pruning del mismo benchmark | no disponible | no disponible | no disponible | El autor menciona 8 variantes en total, sin detallar cuales |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Caida de calidad esperada: el autor advierte explicitamente que, al no haber destilacion ni fine-tuning tras el pruning, la calidad es inferior a la del modelo base.
- Solo texto: los modulos de vision y audio del modelo base no estan incluidos, por lo que no puede procesar imagenes ni audio.
- Contexto e idiomas no documentados: la model card no especifica la longitud de contexto ni la lista de idiomas soportados para esta variante.
- Sin datos de benchmarks publicados: no se pueden verificar empiricamente las capacidades declaradas ni la magnitud de la degradacion.
- Modelo experimental: forma parte de un banco de pruebas de pruning, con 0 descargas y 0 likes en el momento del registro; no es un lanzamiento oficial ni un modelo validado para produccion.
- Licencia: apache-2.0 segun los metadatos, pero el autor remite a la model card del modelo base para los terminos completos; conviene revisar las condiciones de uso comercial del base antes de desplegarlo.
- Riesgo de alucinacion y sesgos: no cuantificado en la informacion disponible; el benchmark incluye una prueba de sesgo de contratacion, lo que sugiere que el autor considera relevante medir este aspecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mrysh/gemma-4-12b-it-prune_width_ffn50
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- NVIDIA ModelOpt (libreria de pruning utilizada): https://github.com/NVIDIA/TensorRT-Model-Optimizer
- vLLM (motor de inferencia usado en el benchmark): https://github.com/vllm-project/vllm
- BFCL (Berkeley Function Calling Leaderboard): https://gorilla.cs.berkeley.edu/leaderboard.html
- MedQA: https://github.com/jind11/MedQA
