# Chungulus/Qwen4-27B-GPTQ-INT8

## Resumen

Qwen4-27B-GPTQ-INT8 es un repositorio de Hugging Face publicado por el usuario Chungulus que, segun su propia model card, se encuentra en estado de **placeholder**: no contiene pesos del modelo ni ficheros de configuracion, tokenizador o plantillas de chat. El nombre indica la intencion de alojar una cuantizacion GPTQ de 8 bits del supuesto modelo Qwen4-27B, pero en el momento de la consulta (creado el 2026-11-09 y actualizado un segundo despues) no hay artefactos descargables.

No existe informacion publica verificable sobre Qwen4-27B en la informacion proporcionada: ni arquitectura, ni numero de parametros reales, ni longitud de contexto, ni datos de entrenamiento. La unica referencia cruzada es el repositorio hermano Qwen3.8-27B-GPTQ-INT8, del mismo autor, lo que sugiere una familia de variantes cuantizadas con nomenclatura propia, pero no aporta especificaciones tecnicas.

Por tanto, esta ficha documenta el estado real del repositorio y advierte de que cualquier evaluacion, despliegue o uso en produccion es imposible con los datos disponibles. Cualquier cifra que aparezca en el nombre (27B, INT8) es una etiqueta del autor y no un dato verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (la etiqueta del nombre indica 27B, sin verificar) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ INT8 segun el nombre del repositorio; no validado por el autor |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio no contiene ficheros de pesos) |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura del supuesto Qwen4-27B: se desconoce si es un transformer denso, un MoE o una arquitectura hibrida, asi como el numero de capas, dimensiones ocultas, cabezas de atencion o mecanismos de atencion (MHA, GQA, MLA). Tampoco se dispone de datos sobre el corpus de entrenamiento, el numero de tokens procesados, la composicion del dataset ni si se aplicaron fases de RLHF, DPO o similares.

Respecto al proceso de cuantizacion GPTQ-INT8, la model card indica explicitamente que "quantization and compatibility have not been validated yet", es decir, que ni siquiera la receta de cuantizacion ha sido comprobada. No hay informacion sobre calibracion, grupo de cuantizacion, tratamiento de outliers ni compatibilidad con kernels de inferencia.

## Capacidades

- No se puede confirmar ninguna capacidad del modelo: no hay pesos, no hay model card tecnica y no hay evaluaciones publicadas.
- No hay evidencia de soporte de tool calling, function calling ni razonamiento multi-paso.
- No hay evidencia de capacidades multilingues ni de modos especiales (thinking, vision, audio).
- El unico dato objetivo es la etiqueta "placeholder" en los tags del repositorio, que confirma que el artefacto no esta operativo.

## Casos de uso

- Ninguno de los casos siguientes es ejecutable con el contenido actual del repositorio; se describen como escenarios hipoteticos condicionados a la publicacion de pesos validados.
- Inferencia local en GPU de consumo: si se publicara una cuantizacion INT8 funcional de un modelo de ~27B, cabria en GPUs con 24-32 GB de VRAM, pero no hay artefacto que cargar.
- Servido con vLLM o TGI: requeriria pesos en formato compatible y una configuracion de cuantizacion validada; no disponible.
- Evaluacion comparativa frente a otras variantes cuantizadas: imposible sin ficheros de modelo.
- Integracion en pipelines de agentes: sin soporte confirmado de tool calling ni plantilla de chat.
- Fine-tuning sobre la variante cuantizada: GPTQ no esta pensado para entrenamiento; ademas no hay pesos base.
- Reproduccion de benchmarks: no hay resultados publicados ni modelo que evaluar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluaciones, ni comparaciones con modelos de referencia, ni metricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible. Como referencia puramente aritmetica, un modelo denso de 27 000 millones de parametros en INT8 requeriria del orden de 27 GB solo para pesos, mas overhead de activaciones y cache KV; pero esto es una estimacion generica, no un dato del repositorio.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no verificable; en el mejor de los casos, una cuantizacion INT8 de 27B quedaria al limite de GPUs de 32 GB.
- Opciones de despliegue: no disponible; no hay pesos que cargar en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Chungulus/Qwen4-27B-GPTQ-INT8 | no disponible (etiqueta 27B) | no disponible | no disponible | Placeholder, sin pesos |
| Chungulus/Qwen3.8-27B-GPTQ-INT8 | no disponible (etiqueta 27B) | no disponible | no disponible | Referenciado por el autor; estado no verificado |
| Qwen3 oficial (referencia de familia) | no disponible en esta busqueda | no disponible | no disponible | No consultado |

No se dispone de datos suficientes para establecer una comparativa tecnica real con alternativas de la misma categoria.

## Limitaciones y advertencias

- El repositorio no contiene pesos, tokenizador, configuracion ni plantilla de chat: es inutilizable para inferencia.
- La cuantizacion GPTQ-INT8 no ha sido validada por el autor, segun la propia model card.
- La licencia no esta declarada, lo que impide determinar si el uso comercial esta permitido.
- El nombre "Qwen4-27B" no esta respaldado por ninguna fuente oficial en la informacion proporcionada; podria tratarse de una denominacion no oficial o de un modelo inexistente.
- Riesgo de confusion: el autor mantiene una nomenclatura propia (Qwen3.8, Qwen4) que no coincide necesariamente con las versiones oficiales de la familia Qwen.
- No debe citarse este repositorio como evidencia de la existencia o caracteristicas de un modelo "Qwen4-27B".
- Sin datos de sesgos, alucinacion o rendimiento por idioma, no es posible evaluar riesgos de produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Chungulus/Qwen4-27B-GPTQ-INT8
- Variante referenciada por el autor: https://huggingface.co/Chungulus/Qwen3.8-27B-GPTQ-INT8
