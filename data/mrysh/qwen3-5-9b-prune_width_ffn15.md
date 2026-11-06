# mrysh/qwen3.5-9b-prune_width_ffn15

## Resumen

qwen3.5-9b-prune_width_ffn15 es una variante podada por anchura del modelo Qwen/Qwen3.5-9B, publicada por el usuario mrysh como parte de un benchmark de poda que compara cuatro modelos base con ocho variantes de pruning frente a cuantizacion. La poda se ha aplicado con NVIDIA ModelOpt (Minitron) en su version 0.46.0rc1, reduciendo el tamano de la capa FFN de cada una de las capas del transformer de 12288 a 10432 neuronas, lo que supone una reduccion del 15 % solicitada y un 8,2 % de los parametros del checkpoint completo.

El resultado es un modelo de 8.223.994.368 parametros (frente a los aproximadamente 9B del base) que conserva el numero de capas pero con FFN mas estrechas. Solo se ha podado la parte del lenguaje: la torre de vision y la cabeza de prediccion multi-token de Qwen3.5 se han eliminado, de modo que el checkpoint es exclusivamente de texto.

La relevancia de esta publicacion es metodologica mas que de producto: sirve como referencia para medir la caida de calidad que introduce la poda por anchura sin destilacion ni fine-tuning posterior, evaluada sobre BFCL, hiring-bias y MedQA con vLLM. No esta pensada para uso en produccion, sino como punto de comparacion dentro de un estudio de compresion de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (qwen3_5_text), poda por anchura en capas FFN |
| Parametros totales | 8.223.994.368 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor menciona comparacion frente a cuantizacion, sin detallar formatos) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer del que solo se conserva la torre de texto. La intervencion consiste en una poda estructurada por anchura (width pruning) aplicada con NVIDIA ModelOpt Minitron: la dimension de las capas feed-forward se reduce de 12288 a 10432 en todas las capas, manteniendo intacto el numero de capas. La importancia de las neuronas se estimo sobre un conjunto de calibracion de 512 muestras mixtas.

No se realizo destilacion ni fine-tuning despues de la poda, lo que implica una degradacion de calidad respecto al modelo base que el propio autor reconoce y que el benchmark asociado pretende cuantificar. El checkpoint elimina la torre de vision y la cabeza de prediccion multi-token del Qwen3.5 original, por lo que el resultado es un modelo puramente de texto. La evaluacion del benchmark se realiza con vLLM y el modo de razonamiento (thinking) desactivado.

## Capacidades

- Generacion de texto en un modelo derivado de Qwen3.5, con la calidad degradada esperable tras una poda sin recuperacion.
- Razonamiento y respuesta a preguntas de dominio, evaluados en el benchmark sobre MedQA.
- Soporte de tool calling y function calling, evaluado en BFCL (Berkeley Function Calling Leaderboard).
- Capacidades multilingues heredadas del modelo base, aunque no se documentan idiomas concretos en esta ficha.
- Sin vision: la torre de vision ha sido eliminada del checkpoint.
- Sin cabeza de prediccion multi-token: se ha eliminado junto con la parte no textual.
- No se documentan capacidades de agente multi-paso ni modo thinking activo en la evaluacion (se ejecuta con thinking off).

## Casos de uso

- Benchmark de compresion de modelos: sirve como variante de referencia para medir la caida de calidad de la poda por anchura frente al modelo base y frente a la cuantizacion, dentro del estudio de 4 modelos x 8 variantes.
- Investigacion sobre poda estructurada: permite reproducir y comparar la metodologia Minitron de NVIDIA ModelOpt aplicada a un modelo Qwen3.5 de 9B con nivel 0.15.
- Evaluacion de robustez en tool calling: al conservarse las capacidades de function calling, puede usarse para analizar como afecta la reduccion de FFN a la precision en BFCL.
- Analisis de sesgos en seleccion de personal: el benchmark incluye la tarea hiring-bias, por lo que el modelo sirve para estudiar si la poda altera el comportamiento sesgado del base.
- Experimentos de razonamiento medico: la evaluacion sobre MedQA permite comparar el rendimiento en preguntas clinicas antes y despues de la poda.
- Despliegue en entornos con restricciones de memoria muy ajustadas: con 8,2B parametros y pesos safetensors, es un candidato para pruebas de inferencia en vLLM donde cada gigabyte de VRAM cuenta, siempre asumiendo la perdida de calidad.
- Estudio de transferencia de licencia: al mantener apache-2.0 del base, puede integrarse en pipelines de investigacion que requieran redistribucion sin restricciones adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que el modelo se evalua en BFCL, hiring-bias y MedQA con vLLM, pero no se proporcionan las cifras obtenidas en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 16,5 GB solo para pesos, mas overhead de KV cache y activaciones; se recomienda al menos 24 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB para pesos, con margen adicional para cache.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 4,5-5 GB para pesos, viable en GPUs consumer de 8 GB o mas con contexto corto.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en BF16; RTX 4090 (24 GB) para BF16 con contexto limitado o cuantizacion; RTX 3090 y RTX 4080 para cuantizacion 8/4 bits.
- Cabe en GPU consumer: si, en RTX 4090 en BF16 con contexto moderado y en GPUs de 8-12 GB con cuantizacion.
- Opciones de despliegue: vLLM es el motor usado en el benchmark del autor; al ser safetensors de un transformer estandar, tambien es compatible con TGI y con llama.cpp/Ollama previa conversion a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| mrysh/qwen3.5-9b-prune_width_ffn15 | 8,22B | no disponible | apache-2.0 | Poda por anchura FFN 15 %, solo texto, sin fine-tuning posterior |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | apache-2.0 | Modelo original con torre de vision y cabeza multi-token; referencia de calidad |
| Otras variantes del benchmark de poda de mrysh | no disponible | no disponible | apache-2.0 | El autor menciona 4 modelos x 8 variantes, sin detallar el resto en esta ficha |
| Versiones cuantizadas de Qwen3.5 del mismo benchmark | no disponible | no disponible | apache-2.0 | Usadas como linea base de comparacion frente a la poda |

## Limitaciones y advertencias

- Caida de calidad esperada: el autor advierte explicitamente que no hubo destilacion ni fine-tuning tras la poda, por lo que el rendimiento es inferior al del modelo base.
- Modelo de benchmark, no de produccion: su proposito es medir la degradacion de la poda, no ofrecer un modelo listo para uso comercial.
- Solo texto: la torre de vision y la cabeza de prediccion multi-token han sido eliminadas, de modo que no admite entradas de imagen ni funcionalidades multimodales del Qwen3.5 original.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la poda puede incrementarlo respecto al base.
- Sesgos: el benchmark incluye una tarea de hiring-bias, lo que sugiere interes en medir sesgos, pero no se publican resultados en esta ficha.
- Idiomas: no se documentan los idiomas soportados tras la poda; se heredan presumiblemente del base, sin garantia.
- Contexto: no se especifica la longitud de contexto efectiva del checkpoint podado.
- Licencia: apache-2.0, lo que permite uso comercial, pero el autor remite a la model card del base para condiciones completas.
- Reputacion del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrysh/qwen3.5-9b-prune_width_ffn15
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- NVIDIA ModelOpt (herramienta de poda): no disponible en la informacion proporcionada
- Paper de Minitron: no disponible en la informacion proporcionada
- Repositorio del benchmark: no disponible en la informacion proporcionada
