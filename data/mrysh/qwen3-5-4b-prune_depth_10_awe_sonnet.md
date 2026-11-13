# mrysh/qwen3.5-4b-prune_depth_10_awe_sonnet

## Resumen

`mrysh/qwen3.5-4b-prune_depth_10_awe_sonnet` es una version podada en profundidad del modelo Qwen/Qwen3.5-4B, publicada por el usuario mrysh como parte de un benchmark de poda (4 modelos x 8 variantes) que compara distintas tecnicas de pruning frente a cuantizacion sobre tareas de tool calling (BFCL), sesgo en contratacion y MedQA, evaluadas con vLLM. No es un modelo pensado para produccion, sino un artefacto experimental para medir la degradacion de calidad que introduce la poda.

La poda se realizo con NVIDIA ModelOpt Minitron (version 0.46.0rc1) en modo depth, con nivel 0.1: se eliminaron 3 de las 32 capas del transformer (32 -> 29), manteniendo la anchura intacta. La importancia de cada capa se midio sobre un conjunto de calibracion de 512 muestras mixtas. El resultado es una reduccion del 8,1% de los parametros del checkpoint, que queda en 3.866.979.776 parametros y 7,8 GB en disco.

Un detalle relevante: solo se podo la parte del lenguaje. La torre de vision y la cabeza de prediccion multi-token de Qwen3.5 se han eliminado, por lo que este checkpoint es exclusivamente de texto. No se aplico destilacion ni fine-tuning posterior a la poda, de modo que la caida de calidad respecto al modelo base es esperable y es precisamente lo que el benchmark cuantifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5 text), podado en profundidad de 32 a 29 capas |
| Parametros totales | 3.866.979.776 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos safetensors en BF16/FP32 segun checkpoint) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer decoder-only de la familia Qwen3.5. Sobre ese checkpoint se aplico poda estructural en profundidad con NVIDIA ModelOpt Minitron: se eliminaron 3 capas de las 32 originales (nivel 0.1), seleccionadas por su importancia medida sobre 512 muestras mixtas de calibracion. La anchura de las capas restantes no se modifico.

No hubo destilacion ni fine-tuning despues de la poda. Tampoco se conservaron la torre de vision ni la cabeza de prediccion multi-token del modelo original, que se eliminaron explicitamente, dejando un modelo solo de texto. El autor declara que el checkpoint se evalua como modelo de texto con vLLM y el modo thinking desactivado. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens ni si hubo RLHF/DPO en el modelo base.

## Capacidades

- Generacion de texto y razonamiento en modo texto, heredadas del modelo base Qwen3.5-4B, con la degradacion esperable tras la poda.
- Soporte de tool calling y function calling (evaluado en BFCL en el benchmark del autor).
- Razonamiento multietapa y uso como agente, sujeto a la perdida de calidad por la poda.
- Capacidades multilingues presumiblemente heredadas del modelo base, aunque no se documentan idiomas concretos en la model card.
- No incluye vision: la torre de vision fue eliminada.
- No incluye la cabeza de prediccion multi-token de Qwen3.5.
- Modo thinking desactivado en la evaluacion del benchmark; no se documenta su comportamiento con thinking activo.

## Casos de uso

- Benchmark de poda: usar este checkpoint como una de las variantes del estudio comparativo del autor para medir la caida de calidad frente al modelo base y frente a versiones cuantizadas.
- Investigacion sobre pruning en profundidad: analizar como afecta eliminar 3 de 32 capas a tareas de tool calling (BFCL), sesgo en contratacion y conocimiento medico (MedQA) con vLLM.
- Evaluacion de robustez de agentes: probar si un modelo podado mantiene la capacidad de encadenar llamadas a herramientas en pipelines de agentes, comparando con el checkpoint original.
- Estudio de sesgos: replicar la evaluacion de sesgo en contratacion del benchmark para comparar el comportamiento del modelo podado con el base.
- Validacion de pipelines de inferencia: usar el checkpoint como carga de prueba en despliegues vLLM para verificar compatibilidad de pesos y configuracion.
- Docencia y experimentacion: ilustrar en cursos o articulos el impacto real de la poda estructural en un modelo de ~4B parametros, con un caso reproducible de 7,8 GB.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card indica que el modelo se evalua en BFCL, hiring-bias y MedQA con vLLM, pero no incluye las cifras obtenidas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8 GB solo para pesos, mas overhead de KV cache y activaciones; en la practica se recomienda 12-16 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 4 GB de pesos; en 4 bits, alrededor de 2 GB, aunque el repo no publica versiones GGUF ni cuantizadas.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue con vLLM; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para inferencia en BF16.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB) y en tarjetas de 12 GB con cuantizacion.
- Opciones de despliegue: vLLM es el runtime usado en el benchmark del autor; llama.cpp, Ollama y TGI son viables si se generan los pesos en los formatos correspondientes, aunque no se distribuyen en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| mrysh/qwen3.5-4b-prune_depth_10_awe_sonnet | 3.867 M | no disponible | Apache 2.0 | Podado en profundidad (32 -> 29 capas), solo texto, sin fine-tuning posterior |
| Qwen/Qwen3.5-4B (base) | no disponible en la informacion | no disponible | Apache 2.0 | Modelo original con vision y cabeza multi-token; referencia de calidad |
| Variantes cuantizadas de Qwen3.5-4B del mismo benchmark | no disponible | no disponible | Apache 2.0 | Alternativa de compresion sin cambio de arquitectura; comparadas en el benchmark del autor |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Caida de calidad esperable respecto al modelo base: no hubo destilacion ni fine-tuning tras la poda, y el propio autor lo advierte.
- Modelo solo de texto: se eliminaron la torre de vision y la cabeza de prediccion multi-token, por lo que no puede procesar imagenes ni aprovechar esas capacidades del original.
- No es un modelo para produccion: es un artefacto de benchmark con 0 descargas y 0 likes, sin validacion externa.
- Sin datos publicados de benchmarks: no se puede verificar la magnitud de la degradacion sin ejecutar las evaluaciones del autor.
- Idiomas no documentados: no se especifica que idiomas mantiene tras la poda.
- Longitud de contexto no documentada en la model card; debe consultarse la del modelo base.
- Riesgo de alucinacion: inherente a los modelos de lenguaje y potencialmente mayor tras la poda sin reentrenamiento.
- Sesgos: el benchmark incluye una evaluacion de sesgo en contratacion, lo que sugiere que el autor considera relevante medir sesgos en este checkpoint; no se publican resultados.
- Licencia Apache 2.0 heredada del modelo base, que permite uso comercial, pero la calidad degradada hace desaconsejable ese uso sin evaluacion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrysh/qwen3.5-4b-prune_depth_10_awe_sonnet
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- NVIDIA ModelOpt (herramienta de poda): https://github.com/NVIDIA/TensorRT-Model-Optimizer
- vLLM (runtime de evaluacion): https://github.com/vllm-project/vllm
