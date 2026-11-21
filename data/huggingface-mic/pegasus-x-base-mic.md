# huggingface-mic/pegasus-x-base-mic

## Resumen

`huggingface-mic/pegasus-x-base-mic` es un artefacto de prueba (test fixture) publicado por la organizacion `huggingface-mic`, no un modelo entrenado ni utilizable para inferencia real. Se trata de una version reducida del checkpoint `google/pegasus-x-base` de Google, con la misma arquitectura `PegasusXForConditionalGeneration` pero con una configuracion mucho mas pequena: solo 2 capas de encoder y 2 de decoder, lo que resulta en 6.325.184 parametros totales. Los pesos son aleatorios (semilla 17), generados para superar una puerta de sensibilidad a la entrada, no fruto de entrenamiento.

El proposito del repositorio es servir como fixture de integracion para el proyecto `transformers-mic`: un contrato ejecutable que valida que las expectativas del framework sobre el modelo (nombres de tensores, ficheros de procesador, comportamiento en distintos dtypes) se cumplen sin necesidad de descargar el checkpoint completo de cientos de millones de parametros. Los ficheros de procesador (`generation_config.json`, `special_tokens_map.json`, `spiece.model`, `tokenizer.json`, `tokenizer_config.json`) se copian byte a byte desde `google/pegasus-x-base`.

Es relevante unicamente en el contexto de pruebas de integracion y CI de frameworks de transformers. El autor lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos. No debe emplearse para resumir texto, generar contenido ni ninguna tarea de NLP real: sus salidas carecen de significado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PegasusX (transformer encoder-decoder), `PegasusXForConditionalGeneration` |
| Parametros totales | 6.325.184 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el fixture no documenta la ventana efectiva) |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; verificado finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura PegasusX, un transformer encoder-decoder orientado a resumen abstractivo, pero con la configuracion reducida a 2 capas de encoder y 2 de decoder mediante la regla generica de `sweep.py` del proyecto `transformers-mic`. Conserva los mismos nombres de tensores que el checkpoint real `google/pegasus-x-base`, lo que permite validar la carga y el mapeo de pesos sin disponer de los pesos originales.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se aceptaron porque superaron una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato movia los logits al menos 0,001 (el caso mas debil, `input_ids:reverse`, dio 0,00218). El fixture se guarda en float32, el dtype con el que carga `google/pegasus-x-base` por defecto, y se verifico que forward, loss y gradientes son finitos en float32, bfloat16 y float16. El identificador de fixture es `6ce39969ff24` y cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el shrink.

## Capacidades

- Generacion de texto y resumen: la arquitectura subyacente es de resumen abstractivo, pero los pesos aleatorios no producen salidas coherentes.
- Carga y ejecucion en Transformers: valida el contrato de `PegasusXForConditionalGeneration`, incluyendo forward, loss y gradientes.
- Compatibilidad de processor: tokenizer y ficheros de configuracion identicos a `google/pegasus-x-base`.
- Estabilidad numerica: salidas finitas en float32, bfloat16 y float16.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Pruebas de integracion en CI de Transformers: cargar el fixture y comprobar que `PegasusXForConditionalGeneration` instancia, ejecuta forward y calcula loss con los nombres de tensores esperados, sin descargar el checkpoint completo.
- Validacion de contratos de framework: verificar que los ficheros de procesador (`tokenizer.json`, `spiece.model`, `generation_config.json`) se cargan correctamente y coinciden byte a byte con los del modelo base.
- Pruebas de sensibilidad a la entrada: usar las perturbaciones documentadas (`input_ids:reverse`, entre otras) para comprobar que los logits cambian por encima del umbral de 0,001.
- Pruebas de dtype: ejecutar forward, loss y gradientes en float32, bfloat16 y float16 para detectar problemas de precision o NaN en el pipeline.
- Desarrollo de herramientas de introspeccion de modelos: inspeccionar la estructura de tensores y la config sin coste de almacenamiento (repo de 0,0 GB).
- Validacion de pipelines de exportacion o conversion: probar rutas de guardado y recarga de safetensors con un modelo pequeno y rapido de ejecutar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K, ROUGE) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (6,3 M de parametros); en la practica cabe en CPU.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es mas que suficiente.
- Cabe en GPU consumer: si, en cualquier modelo con al menos 1 GB de VRAM.
- Opciones de despliegue: Transformers (referencia del contrato); vLLM, llama.cpp, Ollama y TGI no estan documentados para este fixture.
- Latencia y throughput: no disponibles; el modelo es de juguete y los tiempos seran del orden de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/pegasus-x-base-mic | 6.325.184 | no disponible | Fixture de integracion (pesos aleatorios) | no disponible | Hugging Face |
| google/pegasus-x-base | cientos de millones (no disponible el dato exacto en la informacion) | no disponible | Resumen abstractivo real | no disponible | Hugging Face |
| google/pegasus-x-large | no disponible | no disponible | Resumen abstractivo real | no disponible | Hugging Face |

La comparacion relevante es con `google/pegasus-x-base`, del que este repositorio es una version reducida con fines de prueba. No es un sustituto funcional de ningun modelo de resumen.

## Limitaciones y advertencias

- Los pesos son aleatorios: las salidas no tienen significado y no deben usarse para ninguna tarea de NLP.
- Etiquetado como `test-artifact`: el autor lo excluye explicitamente de busquedas de modelos candidatos.
- Licencia no disponible: no se puede asumir uso comercial ni redistribucion sin consultar al autor.
- Idiomas no disponibles: no hay garantia de cobertura linguistica.
- Longitud de contexto no documentada en la informacion proporcionada.
- El repositorio es de 0,0 GB y contiene solo pesos, uso y expectativas; otros ficheros deben regenerarse con `python example/build_fixtures.py --fixture pegasus-x-base-mic`.
- No apto para produccion bajo ninguna circunstancia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/pegasus-x-base-mic
- Modelo base: https://huggingface.co/google/pegasus-x-base
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/pegasus-x-base-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/pegasus-x-base-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/pegasus-x-base-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/pegasus-x-base-mic/blob/main/build.json
- Explicacion del shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/pegasus-x-base-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de shrink (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
