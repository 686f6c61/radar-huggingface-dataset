# mrysh/gemma-4-e4b-it-prune_depth_10

## Resumen

`mrysh/gemma-4-e4b-it-prune_depth_10` es una version podada por profundidad del modelo multimodal `google/gemma-4-E4B-it` de Google. El autor, `mrysh`, la publica como parte de un benchmark de poda (4 modelos x 8 variantes) que compara distintas estrategias de pruning frente a cuantizacion sobre las tareas BFCL, hiring-bias y MedQA, evaluadas con vLLM. No se trata de un modelo pensado para produccion, sino de un artefacto experimental para medir la degradacion de calidad tras eliminar capas.

La poda se ha realizado con NVIDIA ModelOpt (Minitron) en su version 0.46.0rc1, eliminando 4 de las 42 capas del modelo base (nivel 0.1), lo que supone una reduccion del 9,2 % de los parametros del modelo de lenguaje y del 8,6 % del checkpoint completo. La anchura de las capas se mantiene intacta y solo se poda la parte linguistica: los bloques de vision y audio, si existen en el modelo base, se conservan sin cambios.

El checkpoint resultante tiene 7.308.233.030 parametros reales segun los safetensors y ocupa 14,6 GB en disco. Es relevante ahora porque ejemplifica una linea de investigacion activa: reducir coste de inferencia mediante poda estructural sin reentrenamiento posterior, y cuantificar cuanto se pierde. Al no aplicarse destilacion ni fine-tuning tras la poda, debe esperarse una caida de calidad frente al modelo base, que es precisamente lo que el benchmark pretende medir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4), poda por profundidad; bloques de vision/audio sin modificar |
| Parametros totales | 7.308.233.030 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el benchmark compara variantes podadas con cuantizacion, pero no se detallan los tipos) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E4B-it`, un transformer multimodal de Google con 42 capas en su torre de lenguaje. La poda aplicada es de tipo depth pruning mediante NVIDIA ModelOpt Minitron: se eliminan 4 capas (42 -> 38), seleccionadas por su importancia medida sobre un conjunto de calibracion de 512 muestras mixtas. La anchura (dimension del modelo, cabezas de atencion, FFN) no se modifica. Los bloques de vision y audio del modelo base se conservan intactos y solo se poda la parte linguistica. Segun la model card, la herramienta de poda descarta la cabeza de prediccion multi-token de Qwen3.5, aunque esta referencia parece un residuo de la plantilla del autor y no aplica al modelo base Gemma.

No se realizo destilacion ni fine-tuning despues de la poda, por lo que los pesos de las capas supervivientes son los originales del modelo base y no han sido reajustados para compensar la eliminacion. El modelo base es instruction-tuned (`-it`), de modo que las capacidades de seguimiento de instrucciones provienen del checkpoint original. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO en el modelo base dentro de la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento conversacional heredados del modelo base instruction-tuned, con la degradacion esperable por la perdida de 4 capas.
- Capacidades multimodales (vision y audio) potencialmente presentes, ya que los bloques correspondientes se conservan sin podar; no obstante, el benchmark evalua el modelo como texto con thinking desactivado, por lo que su rendimiento multimodal no esta caracterizado.
- Soporte de tool calling y function calling: el benchmark incluye BFCL (Berkeley Function Calling Leaderboard), lo que indica que el modelo se evalua en llamadas a funciones, aunque no se publican los resultados en la informacion disponible.
- Razonamiento multi-step y uso como agente: no documentado especificamente para esta variante podada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking: el modelo base lo soporta, pero en el benchmark se evalua con thinking desactivado.

## Casos de uso

- Benchmark de poda estructural: usar esta variante como punto de comparacion frente al modelo base y frente a otras variantes de poda (anchura, profundidad, combinadas) para medir la caida de calidad en BFCL, hiring-bias y MedQA con vLLM.
- Investigacion sobre pruning sin reentrenamiento: estudiar cuanto afecta la eliminacion de capas por importancia a tareas de function calling y razonamiento clinico, sin el coste de un ciclo de destilacion.
- Evaluacion de sesgo en contratacion: el benchmark incluye la tarea hiring-bias, de modo que el modelo sirve para analizar si la poda por profundidad altera el comportamiento sesgado del modelo base en decisiones de contratacion simuladas.
- Analisis de coste-calidad en despliegue: comparar el ahorro de 9,2 % de parametros del LM frente a la perdida de precision, para decidir si la poda por profundidad es rentable en un pipeline concreto.
- Reproduccion de experimentos con NVIDIA ModelOpt: servir como referencia de como se aplica Minitron con nivel 0.1 y calibracion de 512 muestras, util para replicar el flujo en otros modelos.
- Pruebas de integracion con vLLM: validar el comportamiento de un checkpoint podado en un servidor de inferencia antes de adoptar tecnicas de compresion en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el benchmark evalua las variantes en BFCL, hiring-bias y MedQA con vLLM, pero no incluye cifras numericas en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 14,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 20-24 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: en torno a 8-9 GB para pesos; en 4 bits, alrededor de 4-5 GB, aunque los tipos de cuantizacion soportados no estan documentados.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para BF16 sin restricciones; RTX 4090 (24 GB) suficiente para BF16 con contexto limitado.
- Cabe en GPU de consumo: si, en RTX 4090 y potencialmente en RTX 3090 (24 GB) en BF16 con contexto corto; en GPUs de 16 GB requeriria cuantizacion.
- Opciones de despliegue: vLLM es el motor usado en el benchmark; llama.cpp, Ollama o TGI no estan documentados para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| mrysh/gemma-4-e4b-it-prune_depth_10 | 7.308.233.030 | no disponible | apache-2.0 | 38 capas, sin destilacion posterior |
| google/gemma-4-E4B-it (base) | no disponible en la informacion | no disponible | apache-2.0 (segun la variante) | 42 capas, instruction-tuned, multimodal |
| Otras variantes del benchmark de mrysh | no disponible | no disponible | apache-2.0 | 8 variantes de poda por modelo, no detalladas |

No se dispone de datos de rendimiento comparado (BFCL, hiring-bias, MedQA) en la informacion proporcionada, por lo que la comparativa se limita a parametros y licencia.

## Limitaciones y advertencias

- Caida de calidad esperada: al no aplicarse destilacion ni fine-tuning tras la poda, el modelo pierde capacidad frente al base; el propio autor lo advierte.
- Artefacto de benchmark: no esta pensado para produccion, sino para medir la degradacion por poda.
- Idiomas y contexto no documentados: no se especifican lenguajes soportados ni longitud de contexto en la model card.
- Capacidades multimodales no validadas: aunque los bloques de vision/audio se conservan, el modelo se evalua solo como texto con thinking desactivado.
- Referencia a Qwen3.5 en la model card: la mencion a la cabeza de prediccion multi-token de Qwen3.5 parece un residuo de plantilla y no aplica al modelo base Gemma; conviene tratarla con cautela.
- Licencia: apache-2.0 segun la model card, pero se remite a la licencia del modelo base; verificar los terminos de `google/gemma-4-E4B-it` antes de uso comercial.
- Sin senales de adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria.
- Riesgo de alucinacion: no cuantificado para esta variante; la poda sin reentrenamiento puede incrementarlo respecto al base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mrysh/gemma-4-e4b-it-prune_depth_10
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- NVIDIA ModelOpt (herramienta de poda): no disponible en la informacion proporcionada
- Paper de Minitron: no disponible en la informacion proporcionada
- BFCL (Berkeley Function Calling Leaderboard): no disponible en la informacion proporcionada
