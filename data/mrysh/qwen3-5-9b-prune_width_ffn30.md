# mrysh/qwen3.5-9b-prune_width_ffn30

## Resumen

`mrysh/qwen3.5-9b-prune_width_ffn30` es una variante podada por anchura del modelo Qwen/Qwen3.5-9B, publicada por el usuario mrysh como parte de un benchmark de poda que compara cuatro modelos con ocho variantes de pruning frente a cuantizacion. El modelo conserva la arquitectura transformer del original pero reduce el tamano de la capa FFN de cada bloque de 12288 a 8576 neuronas (un 30 % solicitado), lo que se traduce en una reduccion del 16,3 % de los parametros del checkpoint completo, quedando en 7.494.185.472 parametros segun los tensores safetensors.

La poda se realizo con NVIDIA ModelOpt (version 0.46.0rc1) mediante la metodologia Minitron de poda por anchura, midiendo la importancia de las neuronas sobre un conjunto de calibracion de 512 muestras mixtas. El numero de capas no se modifica. Ademas, se eliminan la torre de vision y la cabeza de prediccion multi-token de Qwen3.5, por lo que el resultado es un modelo exclusivamente de texto.

No se aplico destilacion ni fine-tuning posterior a la poda, de modo que cabe esperar una perdida de calidad frente al modelo base; precisamente el benchmark en el que se enmarca esta publicacion mide esa caida. El modelo se evalua en vLLM con el modo thinking desactivado sobre BFCL, hiring-bias y MedQA. Es relevante como referencia para quienes investigan tecnicas de compresion de modelos y quieren medir el coste real de la poda por anchura en tareas de tool calling, sesgo y conocimiento medico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5, solo texto; sin torre de vision ni cabeza MTP) |
| Parametros totales | 7.494.185.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo se distribuye en safetensors; el benchmark compara variantes podadas con cuantizacion) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer denso, y aplica poda por anchura (width pruning) con NVIDIA ModelOpt Minitron. La intervencion concreta reduce la dimension de la capa FFN de cada una de las capas de 12288 a 8576 neuronas, manteniendo intacto el numero de capas. La seleccion de neuronas a eliminar se basa en una medida de importancia calculada sobre un conjunto de calibracion de 512 muestras mixtas. El checkpoint resultante tiene 7.494.185.472 parametros, lo que representa una reduccion del 16,3 % respecto al modelo base.

No se realizo destilacion ni fine-tuning despues de la poda, por lo que el modelo conserva los pesos del original salvo en las dimensiones recortadas y no ha sido reentrenado para recuperar capacidad. Se eliminan tambien la torre de vision y la cabeza de prediccion multi-token (MTP) de Qwen3.5, de forma que el modelo es estrictamente de texto. El autor no documenta el volumen de tokens de entrenamiento original ni la composicion del dataset, ya que no hubo entrenamiento adicional en esta variante.

## Capacidades

- Generacion de texto: conserva la funcionalidad de lenguaje del modelo base, con la perdida de calidad esperable tras la poda sin reentrenamiento.
- Razonamiento y conocimiento: se evalua en MedQA, lo que indica uso previsto en preguntas de conocimiento medico.
- Tool calling / function calling: se evalua en BFCL (Berkeley Function Calling Leaderboard), por lo que el modelo esta orientado a tareas de llamada a funciones.
- Evaluacion de sesgos: se evalua en hiring-bias, lo que sugiere que se mide su comportamiento en decisiones de contratacion simuladas.
- Capacidades multimodales: no disponibles; la torre de vision fue eliminada.
- Prediccion multi-token: no disponible; la cabeza MTP fue eliminada.
- Modo thinking: el benchmark se ejecuta con thinking desactivado; no se documenta soporte del modo thinking en esta variante.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Benchmark de tecnicas de poda: el modelo se publica como una de las variantes de un estudio comparativo (4 modelos x 8 variantes) frente a cuantizacion, de modo que su uso principal es servir de punto de comparacion reproducible en experimentos de compresion.
- Evaluacion de tool calling tras compresion: al medirse en BFCL, puede emplearse para cuantificar cuanto degrada la poda por anchura la capacidad de llamar funciones, un dato relevante antes de desplegar modelos comprimidos en agentes.
- Estudio de sesgos en seleccion de personal: la evaluacion en hiring-bias permite analizar como afecta la poda a los sesgos del modelo en tareas de cribado de candidatos.
- Investigacion en QA medico con modelos comprimidos: la evaluacion en MedQA permite medir la retencion de conocimiento especializado tras reducir la FFN, util para decidir si un modelo podado es viable en dominios de alto riesgo.
- Inferencia de texto en entornos con VRAM limitada: con 7,49 mil millones de parametros, el modelo puede desplegarse en GPUs de consumo con cuantizacion, aunque el autor no documenta la calidad resultante en ese escenario.
- Base para experimentos de recuperacion de capacidad: al no incluir destilacion ni fine-tuning, sirve como punto de partida para estudiar si un reentrenamiento ligero recupera la calidad perdida frente al Qwen3.5-9B original.
- Analisis de eficiencia en vLLM: el autor ejecuta las evaluaciones con vLLM, por lo que el modelo es adecuado para medir throughput y latencia de un checkpoint podado frente al original en el mismo motor de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el modelo se evalua en BFCL, hiring-bias y MedQA con vLLM y thinking desactivado, pero no incluye las cifras obtenidas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 15 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica requiere una GPU de 24 GB o superior.
- VRAM estimada en cuantizacion de 8 bits: en torno a 7,5-8 GB para pesos, viable en GPUs de consumo de gama alta.
- VRAM estimada en cuantizacion de 4 bits: en torno a 4-4,5 GB para pesos, viable en GPUs de consumo de 8 GB o mas, con la perdida de calidad adicional que ello implica.
- GPUs recomendadas: A100, H100 o L40S para evaluacion en BF16 con throughput alto; RTX 4090 (24 GB) para BF16 en una sola GPU; RTX 3090, 4080 o 4070 Ti para cuantizacion de 8 bits.
- Cabe en GPU de consumo: si, en modelos con 24 GB o mas en BF16 y en modelos de 8-16 GB con cuantizacion.
- Opciones de despliegue: vLLM es el motor usado por el autor en el benchmark; al ser un checkpoint safetensors de arquitectura Qwen3.5, deberia ser compatible con los motores que soporten dicha arquitectura, aunque no se documentan otras opciones en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| mrysh/qwen3.5-9b-prune_width_ffn30 | 7.494.185.472 | no disponible | apache-2.0 | Variante podada por anchura, sin destilacion ni fine-tuning; solo texto |
| Qwen/Qwen3.5-9B (base) | no disponible en la informacion proporcionada | no disponible | apache-2.0 (segun la model card) | Modelo original con vision y cabeza MTP; referencia de calidad |
| Otras variantes del benchmark de poda | no disponible | no disponible | no disponible | El autor menciona 4 modelos x 8 variantes, pero no detalla cuales |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de calidad esperada: el autor advierte explicitamente de una caida de calidad frente al modelo base al no haberse aplicado destilacion ni fine-tuning tras la poda.
- Solo texto: la torre de vision y la cabeza de prediccion multi-token fueron eliminadas, por lo que no admite entradas de imagen ni funcionalidades multimodales.
- Evaluacion limitada: el benchmark se ejecuta con thinking desactivado y solo sobre BFCL, hiring-bias y MedQA, sin datos publicados de MMLU, HumanEval u otras metricas estandar.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la poda sin reentrenamiento puede incrementarlo respecto al modelo base.
- Sesgos: el modelo se evalua en hiring-bias, lo que indica que el autor considera relevante medir sesgos en seleccion de personal; no se publican los resultados.
- Idiomas: no se documenta la cobertura linguistica de esta variante; hereda la del modelo base, pero no se especifica.
- Contexto: no se documenta la longitud de contexto soportada por esta variante podada.
- Uso comercial: la licencia apache-2.0 permite uso comercial, pero conviene verificar la model card del modelo base para condiciones adicionales.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia; se trata de una publicacion de investigacion, no de un modelo listo para produccion.
- Compatibilidad: al ser un checkpoint con dimensiones FFN modificadas, puede requerir soporte especifico en algunos motores de inferencia; el autor solo confirma su uso con vLLM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mrysh/qwen3.5-9b-prune_width_ffn30
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- NVIDIA ModelOpt (libreria de poda): no se proporciona enlace en la informacion disponible
- BFCL (Berkeley Function Calling Leaderboard): no se proporciona enlace en la informacion disponible
- MedQA: no se proporciona enlace en la informacion disponible
- vLLM: no se proporciona enlace en la informacion disponible
