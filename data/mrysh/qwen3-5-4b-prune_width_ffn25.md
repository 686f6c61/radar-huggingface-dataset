# mrysh/qwen3.5-4b-prune_width_ffn25

## Resumen

`mrysh/qwen3.5-4b-prune_width_ffn25` es una version podada por anchura del modelo Qwen/Qwen3.5-4B, publicada por el usuario mrysh como parte de un benchmark de poda (4 modelos x 8 variantes) que compara distintas estrategias de pruning frente a cuantizacion sobre BFCL, hiring-bias y MedQA, ejecutado con vLLM. No es un modelo pensado para produccion, sino un artefacto experimental para medir la perdida de calidad asociada a la reduccion de parametros.

La poda se realizo con NVIDIA ModelOpt Minitron (version 0.46.0rc1) aplicando pruning de anchura a nivel 0.25: el tamano de la FFN de cada capa se reduce de 9216 a 6912 neuronas, manteniendo intacto el numero de capas. La importancia de las neuronas se midio sobre un conjunto de calibracion de 512 muestras mixtas. El checkpoint resultante conserva 3.973.034.496 parametros, lo que supone una reduccion del 13,5% de los parametros del modelo de lenguaje (14,7% sobre el checkpoint completo), y ocupa 7,966 GB en disco.

Es relevante ahora porque documenta de forma reproducible el compromiso entre compresion y calidad en la familia Qwen3.5, y porque no se aplico destilacion ni fine-tuning posterior a la poda: el modelo sirve como linea base del dano provocado exclusivamente por el recorte de anchura. Los bloques de vision y audio del modelo base se conservan sin cambios y solo se poda la parte de lenguaje; la cabeza de prediccion multi-token de Qwen3.5 se elimina durante el proceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5) con poda de anchura en FFN; capas sin modificar |
| Parametros totales | 3.973.034.496 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card (el benchmark compara contra cuantizacion, sin detallar formatos) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y aplica pruning de anchura con NVIDIA ModelOpt Minitron sobre la FFN de cada capa: la dimension interna pasa de 9216 a 6912 (un 25% solicitado, equivalente a una reduccion del 13,5% de parametros del modelo de lenguaje). El numero de capas no cambia. La seleccion de neuronas a eliminar se basa en una medida de importancia calculada sobre 512 muestras mixtas de calibracion. Los bloques de vision y audio del modelo base, si existen, se mantienen intactos, y la cabeza de prediccion multi-token se descarta por completo.

No se realizo destilacion ni fine-tuning despues de la poda, de modo que el checkpoint refleja unicamente el efecto del recorte estructural sobre los pesos originales. En el benchmark se evalua como modelo de texto con vLLM y el modo thinking desactivado. No se detallan en la informacion disponible los datos de preentrenamiento del modelo base, el volumen de tokens, ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base Qwen3.5-4B, con la calidad degradada esperable tras la poda sin recuperacion.
- Procesamiento de codigo y matematicas, sujeto a la misma perdida de calidad por el recorte de la FFN.
- Conservacion de los bloques de vision y audio del modelo base sin podar (segun indica la model card), aunque el benchmark lo evalua solo como modelo de texto.
- Soporte de tool calling y function calling evaluado mediante BFCL en el benchmark del autor.
- Capacidades multilingues: no disponibles de forma explicita en la informacion proporcionada.
- Modo thinking de Qwen3.5: el modelo conserva la arquitectura del base, pero en el benchmark se evalua con thinking desactivado; no se documenta su comportamiento con thinking activo.
- Cabeza de prediccion multi-token: eliminada por la herramienta de poda, por lo que esta capacidad del base no esta disponible.

## Casos de uso

- Benchmark de estrategias de poda: el modelo sirve como una de las 8 variantes de poda del estudio del autor, comparando su rendimiento en BFCL, hiring-bias y MedQA frente a las demas variantes y frente a cuantizacion con vLLM.
- Investigacion sobre compresion de modelos: permite medir el coste en calidad de reducir un 25% la anchura de la FFN sin destilacion, aislando el efecto puro del pruning de anchura.
- Estudio de sesgos en modelos comprimidos: el benchmark incluye la tarea hiring-bias, de modo que el checkpoint permite analizar si la poda amplifica o atenua sesgos de contratacion respecto al base.
- Evaluacion en dominio medico: la inclusion de MedQA en el benchmark permite usar el modelo para estudiar como afecta la poda a la precision en preguntas clinicas, con las cautelas propias de un modelo no afinado para uso sanitario.
- Pruebas de tool calling en entornos controlados: con BFCL como referencia, se puede comparar la tasa de acierto en llamadas a funciones frente al Qwen3.5-4B original y decidir si la reduccion de tamano compensa en un pipeline de agentes.
- Linea base para experimentos de recuperacion: al no haberse aplicado destilacion ni fine-tuning, sirve como punto de partida para estudiar tecnicas de recuperacion de calidad (destilacion, LoRA, continued pretraining) sobre un modelo ya podado.
- Validacion de pipelines con vLLM: util para comprobar el comportamiento de un checkpoint podado en vLLM antes de invertir en variantes mas costosas del mismo benchmark.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el modelo forma parte de un benchmark que evalua las variantes en BFCL, hiring-bias y MedQA con vLLM, pero no incluye las cifras obtenidas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, un checkpoint de 3.973.034.496 parametros en BF16 requiere aproximadamente 8 GB solo para los pesos, mas memoria para KV cache y overhead del runtime.
- GPU recomendadas: no disponibles en la informacion proporcionada. El benchmark del autor se ejecuto con vLLM, lo que implica GPUs de datacenter (A100, H100 o similares) o GPUs consumer con suficiente VRAM.
- Cabe en GPU consumer: no confirmado. Con cuantizacion a 8 bits o 4 bits el checkpoint podria situarse en el rango de 4-6 GB de pesos, lo que en teoria permitiria su ejecucion en GPUs consumer de 8-12 GB, pero no hay datos publicados que lo verifiquen.
- Opciones de despliegue: vLLM es el runtime usado en el benchmark del autor. Otros runtimes (llama.cpp, Ollama, TGI) no estan documentados para este checkpoint; el formato publicado es safetensors, sin GGUF disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| mrysh/qwen3.5-4b-prune_width_ffn25 | 3.973.034.496 | no disponible | apache-2.0 | Checkpoint experimental de benchmark |
| Qwen/Qwen3.5-4B (base) | no disponible en la informacion proporcionada | no disponible | apache-2.0 | Modelo base oficial |
| Otras variantes del benchmark del autor | no disponible | no disponible | apache-2.0 (presumiblemente) | 7 variantes adicionales de poda, no detalladas |

La comparativa con modelos de terceros de la misma categoria no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de calidad esperable frente al modelo base: la model card advierte explicitamente de que no hubo destilacion ni fine-tuning tras la poda, por lo que la calidad es inferior a la de Qwen3.5-4B.
- Artefacto de investigacion: el propio autor lo describe como parte de un benchmark de poda, no como un modelo listo para produccion.
- Cabeza de prediccion multi-token eliminada: cualquier funcionalidad del base que dependa de ella no estara disponible.
- Evaluacion limitada: el benchmark cubre BFCL, hiring-bias y MedQA; no hay datos sobre otras tareas ni sobre el comportamiento con thinking activado.
- Sesgos: no se documentan sesgos especificos del checkpoint podado; el benchmark incluye una prueba de hiring-bias, pero sus resultados no se publican en la informacion disponible.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; al tratarse de un modelo podado sin recuperacion de calidad, el riesgo no deberia ser inferior al del base.
- Idiomas y contexto: no documentados para este checkpoint; deben asumirse los del modelo base Qwen3.5-4B, sin verificacion publicada.
- Licencia: apache-2.0, igual que el modelo base, lo que permite uso comercial segun los terminos de dicha licencia; conviene revisar la model card del base para condiciones adicionales.
- Sin senales de adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que refleja su caracter experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrysh/qwen3.5-4b-prune_width_ffn25
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- NVIDIA ModelOpt (herramienta de poda): no disponible enlace en la informacion proporcionada
- Paper o blog del benchmark de poda: no disponible
- Repositorio con los resultados del benchmark: no disponible
