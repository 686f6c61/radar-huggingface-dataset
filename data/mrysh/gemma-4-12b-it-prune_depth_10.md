# mrysh/gemma-4-12b-it-prune_depth_10

## Resumen

`mrysh/gemma-4-12b-it-prune_depth_10` es una variante podada del modelo `google/gemma-4-12B-it`, publicada por el usuario mrysh como parte de un benchmark de pruning (4 modelos x 8 variantes) que compara distintas estrategias de poda frente a la cuantizacion sobre las tareas BFCL, hiring-bias y MedQA, evaluadas con vLLM. No es un modelo pensado para produccion, sino un artefacto experimental para medir la perdida de calidad asociada a la poda por profundidad.

El checkpoint aplica poda de profundidad con NVIDIA ModelOpt Minitron (nivel 0.1): reduce el numero de capas del transformer de 48 a 43, manteniendo intacta la anchura de los bloques. La importancia de cada capa se estimo sobre un conjunto de calibracion de 512 muestras mixtas. El resultado es una reduccion del 9,4% de los parametros del checkpoint completo, que queda en 10.786.605.355 parametros segun los safetensors.

Es relevante como referencia metodologica: demuestra como afecta la eliminacion de capas (sin destilacion ni fine-tuning posterior) a un modelo instructivo moderno, y permite comparar esa perdida con la de la cuantizacion en tareas de tool calling, sesgo de contratacion y QA medico. El checkpoint es solo texto (`Gemma4ForCausalLM`): los bloques de vision y audio del modelo base no se incluyen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`Gemma4ForCausalLM`), podado por profundidad (48 -> 43 capas) |
| Parametros totales | 10.786.605.355 (10,79 B); reduccion del 9,4% respecto al checkpoint base |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el benchmark compara variantes podadas con cuantizacion, pero no se especifican los esquemas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`Gemma4ForCausalLM`) |
| Tamano del repo | 21,6 GB (21,605 GB en disco) |
| Modelo base | google/gemma-4-12B-it |
| Libreria de poda | nvidia-modelopt 0.46.0rc1 (Minitron) |
| Modalidades | solo texto (sin vision ni audio) |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-12B-it`, un transformer decoder-only de la familia Gemma 4 con variante instructiva. Sobre el se aplico poda de profundidad con NVIDIA ModelOpt Minitron: se eliminan 5 de las 48 capas (nivel 0.1, 10,0% de las capas solicitadas), seleccionadas por importancia medida sobre 512 muestras mixtas de calibracion. La anchura (dimension de los bloques, cabezas de atencion y capas feed-forward) no se modifica.

No se realizo destilacion ni fine-tuning despues de la poda, de modo que el checkpoint conserva los pesos del modelo original en las capas supervivientes y pierde directamente la capacidad aportada por las capas eliminadas. El autor advierte explicitamente de que debe esperarse una caida de calidad frente al base. El checkpoint resultante es exclusivamente de texto: se han descartado los bloques de vision y audio del modelo original, por lo que la arquitectura multimodal del base no esta disponible.

## Capacidades

- Generacion de texto y razonamiento en modo instructivo, heredado del modelo base (con la degradacion esperada tras la poda).
- Respuesta a instrucciones conversacionales multi-turno.
- Tool calling / function calling: es una de las tareas evaluadas en el benchmark (BFCL), aunque no se publican los resultados en la informacion disponible.
- Respuesta a preguntas de dominio medico (MedQA), tambien evaluada en el benchmark.
- Capacidad multilingue: no disponible (los idiomas no se documentan en la ficha).
- Sin soporte de vision ni audio: los bloques multimodales del base no estan incluidos.
- Modo thinking desactivado en la evaluacion del benchmark (vLLM), aunque el base lo soporte.

## Casos de uso

- Benchmark de estrategias de poda: usar este checkpoint como una de las variantes del estudio comparativo (profundidad nivel 0.1) frente a otras podas y a la cuantizacion, midiendo la caida en BFCL, hiring-bias y MedQA.
- Estudio de robustez de tool calling tras compresion: evaluar si la eliminacion de capas degrada la capacidad de emitir llamadas a funciones correctas en agentes, comparando contra el base sin podar.
- Analisis de sesgo: reproducir la evaluacion de hiring-bias para medir como la poda afecta a sesgos demograficos en decisiones de contratacion simuladas.
- Investigacion sobre QA medico comprimido: medir la precision en MedQA de un modelo de ~10,8 B parametros frente a su version completa de 12 B.
- Referencia para pipelines de despliegue con vLLM: validar configuraciones de servido y throughput de un checkpoint podado en el mismo stack que el modelo base.
- Estudio de metodologia Minitron: replicar el flujo de seleccion de capas por importancia sobre 512 muestras mixtas y comparar con otras librerias de poda.
- Base para experimentos de recuperacion: partir de este checkpoint para probar si un fine-tuning o destilacion posterior recupera parte de la calidad perdida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el checkpoint forma parte de un benchmark (BFCL, hiring-bias, MedQA, ejecutado con vLLM) que compara las variantes podadas entre si y con cuantizacion, pero no incluye las cifras en la ficha.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un checkpoint de 10,79 B parametros en BF16 ocupa aproximadamente 21,6 GB de pesos, por lo que requiere mas de 24 GB de VRAM en precision completa.
- En cuantizacion de 8 bits cabria en GPUs de 24 GB (por ejemplo, RTX 4090) con margen limitado para KV cache; en 4 bits cabria en GPUs de 16 GB, aunque no se documentan esquemas de cuantizacion soportados.
- GPU recomendadas: no disponibles en la informacion. El benchmark se ejecuto con vLLM, lo que implica GPUs de datacenter (A100, H100 o similares) como entorno de referencia.
- Despliegue: vLLM es el backend documentado en la evaluacion. Otros backends (llama.cpp, Ollama, TGI) no se mencionan; la compatibilidad con `Gemma4ForCausalLM` en safetensors permitiria, en principio, su conversion, pero no esta verificada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| mrysh/gemma-4-12b-it-prune_depth_10 | 10,79 B | no disponible | apache-2.0 | Podado por profundidad, solo texto, sin fine-tuning posterior |
| google/gemma-4-12B-it | ~11,9 B (inferido de la reduccion del 9,4%) | no disponible | apache-2.0 (segun ficha) | Modelo base multimodal (texto, vision, audio) |
| Otras variantes del benchmark (7 adicionales) | no disponible | no disponible | no disponible | Mismo estudio de pruning, datos no publicados en esta ficha |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Caida de calidad garantizada: el autor advierte de que no hubo destilacion ni fine-tuning tras la poda, por lo que el rendimiento sera inferior al del modelo base.
- Artefacto de benchmark: descargas y likes a cero y publicacion reciente; no hay evidencia de uso en produccion ni validacion comunitaria.
- Solo texto: no conserva vision ni audio del modelo base, por lo que no sirve para tareas multimodales.
- Idiomas no documentados: no se puede confirmar la cobertura multilingue del checkpoint.
- Contexto no documentado: se desconoce si la poda afecta a la ventana de contexto efectiva.
- Riesgo de alucinacion: inherente al modelo base instructivo y probablemente acentuado por la perdida de capas.
- Sesgos: el propio benchmark evalua hiring-bias, lo que sugiere que el autor considera relevante medir sesgos; los resultados no se publican.
- Licencia: apache-2.0 segun la ficha, con remision a la model card del modelo base para terminos adicionales; conviene revisar las condiciones del base antes de uso comercial.
- Compatibilidad: no se documentan esquemas de cuantizacion ni backends alternativos a vLLM; verificar antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mrysh/gemma-4-12b-it-prune_depth_10
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Libreria de poda (NVIDIA ModelOpt): no disponible enlace en la informacion proporcionada
- Resultados del benchmark (BFCL, hiring-bias, MedQA): no disponibles en la informacion proporcionada
