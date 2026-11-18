# mrysh/gemma-4-e4b-it-prune_depth_10_awe_fable

## Resumen

`mrysh/gemma-4-e4b-it-prune_depth_10_awe_fable` es una variante podada por profundidad del modelo `google/gemma-4-E4B-it`, publicada por el usuario mrysh como parte de un benchmark de pruning (4 modelos x 8 variantes). La poda se ha realizado con NVIDIA ModelOpt Minitron (version 0.46.0rc1) eliminando 4 de las 42 capas del bloque de lenguaje (42 -> 38 capas, un 10,0 % de las capas solicitadas), sin modificar el ancho de las capas restantes. El checkpoint resultante tiene 7.308.233.030 parametros y ocupa 14,649 GB en disco.

El modelo no ha pasado por destilacion ni fine-tuning posterior a la poda, por lo que el autor advierte explicitamente de una caida de calidad frente al modelo base. Su proposito es servir como punto de comparacion en un benchmark que evalua las variantes de poda frente a la cuantizacion sobre BFCL, hiring-bias y MedQA, ejecutado con vLLM. Se evalua como modelo de texto con el modo thinking desactivado.

La relevancia de esta ficha es acotada: no es un modelo para produccion, sino un artefacto de investigacion sobre tecnicas de compresion. La informacion publicada por el autor es minima y no incluye resultados numericos del benchmark, idiomas soportados ni detalles sobre el dataset de calibracion mas alla de los 512 ejemplos mixtos empleados para medir la importancia de las capas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de google/gemma-4-E4B-it), podada por profundidad |
| Parametros totales | 7.308.233.030 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el benchmark compara variantes de poda con cuantizacion, pero no se detallan los tipos) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E4B-it` y aplica una poda estructurada por profundidad con NVIDIA ModelOpt Minitron: se eliminan 4 de las 42 capas del bloque de lenguaje (42 -> 38), lo que supone una reduccion del 9,2 % de los parametros del modelo de lenguaje y del 8,6 % del checkpoint completo. La importancia de cada capa se midio sobre un conjunto de calibracion de 512 muestras mixtas. El ancho de las capas se mantiene intacto y los bloques de vision y audio del modelo base, si los tiene, se conservan sin cambios; solo se poda la parte de lenguaje. La herramienta de poda descarta la cabeza de prediccion multi-token de Qwen3.5.

No se realizo destilacion ni fine-tuning despues de la poda. Esta ausencia de recuperacion es deliberada dentro del diseno del benchmark: el objetivo es medir la caida de calidad bruta atribuible a la poda. No se publican datos sobre el numero de tokens de entrenamiento original del modelo base, la composicion del dataset ni si hubo RLHF o DPO, ya que esa informacion corresponde a la model card de Google y no se reproduce aqui.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base, con la perdida de calidad esperable tras la poda sin recuperacion.
- Evaluado en el benchmark del autor sobre BFCL (tool calling / function calling), lo que sugiere que conserva capacidad de invocacion de funciones, aunque no se publican las metricas.
- Evaluado sobre MedQA, lo que indica capacidad de respuesta a preguntas de dominio medico en el contexto del benchmark.
- Modo thinking desactivado en la evaluacion con vLLM; no se documenta si el modo thinking sigue operativo tras la poda.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades de vision y audio: los bloques correspondientes del modelo base se conservan sin modificar, pero no se documenta su funcionamiento tras la poda ni se evaluan en el benchmark.
- Soporte de agentes y razonamiento multi-paso: no documentado.

## Casos de uso

- Benchmark de tecnicas de compresion: el uso principal declarado por el autor es servir como una de las 8 variantes de poda comparadas frente a cuantizacion en BFCL, hiring-bias y MedQA con vLLM. Es adecuado porque aisla el efecto de eliminar capas sin recuperacion posterior.
- Estudio de la relacion profundidad-calidad: al reducir exactamente 4 capas (10,0 % de las solicitadas) con ancho intacto, permite medir cuanto degrada la eliminacion de profundidad frente a otros ejes de compresion como el ancho.
- Analisis de sesgo en contratacion: el benchmark incluye la tarea hiring-bias, de modo que el modelo sirve para comparar como afecta la poda a sesgos medibles en decisiones de contratacion simuladas.
- Evaluacion de robustez en dominio medico: la inclusion de MedQA permite comprobar si la poda por profundidad degrada de forma desproporcionada el conocimiento factual especializado.
- Investigacion sobre calibracion de importancia de capas: el uso de 512 muestras mixtas para puntuar capas es un punto de partida reproducible para estudiar metodos alternativos de seleccion.
- Pruebas de integracion con vLLM: al estar pensado para ejecutarse con vLLM en modo texto y thinking off, sirve para validar pipelines de evaluacion sobre checkpoints podados antes de invertir en modelos mayores.
- No se recomienda su uso en produccion ni en aplicaciones de cara al usuario, dado que el propio autor advierte de la caida de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona que el modelo forma parte de un benchmark sobre BFCL, hiring-bias y MedQA ejecutado con vLLM, pero no incluye cifras en la model card ni en los metadatos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 14,6 GB solo para los pesos, mas overhead de activaciones y cache KV; en la practica se recomienda reservar 18-20 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 7,5-8 GB para pesos, con margen adicional para el contexto.
- VRAM estimada en cuantizacion de 4 bits: en torno a 4-4,5 GB para pesos, con margen adicional para el contexto.
- GPU recomendadas para BF16: A100 40 GB, H100 80 GB, L40S 48 GB o RTX 4090 24 GB (esta ultima con contexto limitado).
- Cabe en GPU de consumo: si, en RTX 4090 24 GB en BF16 y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: vLLM es el motor usado en el benchmark del autor; llama.cpp, Ollama y TGI no estan documentados para este checkpoint concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| mrysh/gemma-4-e4b-it-prune_depth_10_awe_fable | 7.308.233.030 | no disponible | apache-2.0 | Variante podada, sin fine-tuning posterior |
| google/gemma-4-E4B-it (base) | no disponible en la informacion proporcionada | no disponible | la del modelo base (consultar su model card) | Modelo original de referencia |
| Otras variantes del mismo benchmark (7 restantes) | no disponible | no disponible | no disponible | No identificadas en la informacion |

La comparacion cuantitativa con alternativas de la misma categoria (por ejemplo, otros modelos de ~7B) no esta disponible, ya que no se han publicado metricas de rendimiento para esta variante.

## Limitaciones y advertencias

- Caida de calidad garantizada frente al modelo base: el autor indica explicitamente que no hubo destilacion ni fine-tuning tras la poda, por lo que debe esperarse un deterioro del rendimiento.
- Artefacto de benchmark, no de produccion: no dispone de evaluaciones propias mas alla del benchmark declarado y no se recomienda su despliegue en aplicaciones reales.
- Idiomas soportados no documentados: no se puede asumir el multilingueismo del modelo base sin verificacion.
- Longitud de contexto no documentada: no se puede planificar el uso con contextos largos sin consultar la model card de `google/gemma-4-E4B-it`.
- Capacidades de vision y audio sin verificar: aunque los bloques se conservan, no se ha evaluado su comportamiento tras la poda.
- Riesgo de alucinacion: no cuantificado; previsiblemente superior al del modelo base por la ausencia de recuperacion.
- Sesgos conocidos: el benchmark incluye una tarea de hiring-bias, lo que sugiere que el autor considera relevante medir sesgos, pero no se publican resultados.
- Licencia apache-2.0 declarada en este repositorio; el autor remite a la model card del modelo base para los terminos aplicables, que conviene revisar antes de cualquier uso comercial.
- Cabeza de prediccion multi-token descartada por la herramienta de poda: cualquier funcionalidad que dependiera de ella no estara disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrysh/gemma-4-e4b-it-prune_depth_10_awe_fable
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- NVIDIA ModelOpt (herramienta de poda): no se proporciona enlace en la informacion disponible
- Paper o blog del benchmark: no disponible
- Repositorio de codigo o demo: no disponible
