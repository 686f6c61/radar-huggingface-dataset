# mrysh/qwen3.5-4b-prune_width_ffn15_awe_opus

## Resumen

`mrysh/qwen3.5-4b-prune_width_ffn15_awe_opus` es una version podada por anchura (width pruning) del modelo Qwen/Qwen3.5-4B, publicada por el usuario mrysh como parte de un benchmark de poda que compara cuatro modelos con ocho variantes de pruning frente a cuantizacion. El modelo conserva unicamente la parte de lenguaje del checkpoint original: la torre de vision y la cabeza de prediccion multi-token han sido eliminadas, por lo que se trata de un modelo exclusivamente de texto.

La poda se realizo con NVIDIA ModelOpt (version 0.46.0rc1) mediante la tecnica Minitron, reduciendo el tamano de la FFN de cada capa de 9216 a 7808 neuronas (un 15 % solicitado, que se traduce en una reduccion efectiva del 8,2 % de parametros del checkpoint completo). El numero de capas no cambia. La importancia de las neuronas se midio sobre un conjunto de calibracion de 512 muestras mixtas.

El resultado es un checkpoint de 3.859.721.216 parametros (7,7 GB en disco) que no ha pasado por destilacion ni fine-tuning posterior a la poda, por lo que cabe esperar una perdida de calidad frente al modelo base. Su interes es fundamentalmente experimental: sirve para medir el impacto de la poda por anchura en tareas como BFCL, sesgo en contratacion y MedQA, evaluado con vLLM y en modo thinking desactivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5), podado por anchura en la FFN; solo parte de texto |
| Parametros totales | 3.859.721.216 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor menciona comparaciones con cuantizacion en el benchmark, pero no se listan formatos para este checkpoint) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer decoder-only de la familia Qwen3.5. Sobre ese checkpoint se aplica una poda estructurada por anchura con NVIDIA ModelOpt Minitron: la dimension de la FFN de cada capa se reduce de 9216 a 7808 neuronas, mientras que el numero de capas se mantiene intacto. La seleccion de neuronas a eliminar se basa en una medida de importancia calculada sobre 512 muestras mixtas de calibracion. La reduccion resultante es del 8,2 % de los parametros del checkpoint completo.

No se realizo destilacion ni fine-tuning despues de la poda, lo que implica que el modelo no ha sido recuperado tras la perdida de capacidad. Ademas, se han eliminado la torre de vision y la cabeza de prediccion multi-token del Qwen3.5 original, de modo que el checkpoint resultante es solo de texto. No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base, la composicion del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto: al conservar la parte de lenguaje del Qwen3.5-4B, mantiene la capacidad de generar texto, aunque con la degradacion esperable tras una poda sin recuperacion.
- Razonamiento y conocimiento general: evaluado en el benchmark del autor sobre MedQA, lo que indica uso previsto en preguntas de dominio medico.
- Uso de herramientas y function calling: evaluado en BFCL (Berkeley Function Calling Leaderboard), por lo que el autor lo considera apto para medir esta capacidad, aunque no se detallan resultados.
- Modo thinking: el autor indica que en el benchmark se evalua con thinking desactivado; no se confirma el soporte completo del modo thinking tras la poda.
- Capacidades multilingues: no disponible; no se especifican idiomas soportados.
- Vision: no soportada; la torre de vision fue eliminada del checkpoint.
- Prediccion multi-token: no soportada; la cabeza correspondiente fue eliminada.

## Casos de uso

- Benchmark de poda de modelos: el uso principal declarado es servir como una de las variantes en un estudio comparativo de tecnicas de pruning frente a cuantizacion, evaluando la caida de calidad en BFCL, MedQA y sesgo en contratacion.
- Investigacion sobre compresion de modelos: util para estudiar como afecta la reduccion de la dimension FFN (15 % solicitado, 8,2 % efectivo) al rendimiento en tareas concretas sin recuperacion posterior.
- Evaluacion de sesgo en contratacion: el autor lo incluye en una prueba de sesgo de hiring, por lo que puede emplearse para analizar si la poda altera sesgos del modelo base en decisiones de seleccion de personal.
- Preguntas de dominio medico: con MedQA como tarea de evaluacion, puede usarse en experimentos controlados de respuesta a preguntas clinicas, siempre con supervision humana y sin uso clinico real.
- Function calling en entornos de investigacion: al evaluarse en BFCL, sirve para probar pipelines de llamadas a herramientas con vLLM en escenarios de laboratorio.
- Comparativa de infraestructuras de inferencia: al estar pensado para ejecutarse con vLLM en modo texto, permite medir throughput y latencia de un checkpoint podado frente a su base y frente a versiones cuantizadas.
- Prototipado de bajo coste: con 3,86 mil millones de parametros y 7,7 GB en disco, puede desplegarse en entornos con recursos limitados para pruebas internas de generacion de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona que el modelo forma parte de un benchmark que evalua BFCL, sesgo en contratacion y MedQA con vLLM, pero no se incluyen cifras en la model card ni en los metadatos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano (3,86 mil millones de parametros), en BF16 serian necesarios aproximadamente 7,7 GB solo para pesos, mas overhead de KV cache y activaciones; en cuantizacion de 8 bits, unos 3,9 GB; en 4 bits, unos 2 GB. Estas cifras son estimaciones por tamano, no datos publicados para este checkpoint.
- GPU recomendadas: no disponible. El autor indica que el benchmark se ejecuto con vLLM, que requiere GPU NVIDIA (A100, H100, L40S, RTX 4090, etc.), pero no se especifica el hardware empleado.
- Compatibilidad con GPU de consumo: por tamano, es plausible que quepa en GPUs de consumo con 8-16 GB de VRAM en BF16 o cuantizado, aunque no hay confirmacion oficial.
- Opciones de despliegue: vLLM es el motor citado por el autor. Al ser un checkpoint safetensors de arquitectura `qwen3_5_text`, la compatibilidad con llama.cpp, Ollama o TGI no esta confirmada en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| mrysh/qwen3.5-4b-prune_width_ffn15_awe_opus | 3.859.721.216 | no disponible | apache-2.0 | Version podada por anchura (FFN 9216 a 7808), solo texto, sin destilacion ni fine-tuning posterior |
| Qwen/Qwen3.5-4B (modelo base) | no disponible en la informacion proporcionada | no disponible | apache-2.0 (segun el checkpoint podado) | Modelo original con torre de vision y cabeza de prediccion multi-token; referencia de calidad frente a la que se mide la poda |
| Otras variantes del benchmark del autor | no disponible | no disponible | no disponible | El autor menciona 4 modelos x 8 variantes de poda mas comparaciones con cuantizacion, pero no se detallan en la informacion disponible |

## Limitaciones y advertencias

- Perdida de calidad esperable: el autor advierte explicitamente de que no hubo destilacion ni fine-tuning tras la poda, por lo que la calidad es inferior a la del modelo base.
- Solo texto: la torre de vision y la cabeza de prediccion multi-token fueron eliminadas; no admite entradas de imagen ni decodificacion multi-token.
- Sin datos de evaluacion publicados: no se ofrecen resultados numericos de BFCL, MedQA ni sesgo en contratacion, solo la metodologia.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; la poda sin recuperacion puede incrementarlo, aunque no hay mediciones publicadas al respecto.
- Idiomas y contexto: no se especifican idiomas soportados ni longitud de contexto, lo que dificulta planificar su uso en produccion.
- Sesgos: el autor incluye una prueba de sesgo en contratacion, lo que sugiere que el modelo puede presentar sesgos relevantes en decisiones de seleccion; no se publican resultados.
- Licencia: apache-2.0, lo que permite uso comercial, pero el autor remite a la model card del modelo base para condiciones adicionales.
- Madurez: checkpoint con 0 descargas y 0 likes, creado y actualizado el mismo dia (12 de noviembre de 2026), sin pipeline definido; no es un artefacto validado para produccion.
- Uso previsto: experimental y de benchmark; no se recomienda como sustituto directo del modelo base en aplicaciones reales sin una evaluacion propia.

## Enlaces

- Hugging Face: https://huggingface.co/mrysh/qwen3.5-4b-prune_width_ffn15_awe_opus
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- NVIDIA ModelOpt (libreria de poda citada): no disponible en la informacion proporcionada
- Paper o blog del benchmark: no disponible en la informacion proporcionada
- Repositorio o demo: no disponible en la informacion proporcionada
