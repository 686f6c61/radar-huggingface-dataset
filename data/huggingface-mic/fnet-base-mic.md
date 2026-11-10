# huggingface-mic/fnet-base-mic

## Resumen

`fnet-base-mic` es un artefacto de prueba publicado por la organizacion `huggingface-mic`, no un modelo entrenado utilizable. Se trata de una version reducida (fixture) del modelo `google/fnet-base`, con solo 2.159.554 parametros, cuyo proposito es servir como caso de prueba reproducible para validar integraciones y expectativas de framework en el ecosistema Transformers. La model card lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

El modelo conserva la arquitectura `FNetForPreTraining` del original, pero con `num_hidden_layers` reducido a 2 y pesos aleatorios (semilla 17). Los ficheros de procesador (`spiece.model`, `tokenizer.json`, `tokenizer_config.json`, `special_tokens_map.json`) se copian byte a byte desde `google/fnet-base`. Los pesos se guardan en float32 y los tensores mantienen los mismos nombres que el checkpoint real.

Su relevancia es puramente de ingenieria: demuestra un patron de "slim fixture" para testear pipelines de carga, inferencia y gradientes sin necesidad de descargar el modelo completo. No debe emplearse para generacion de texto, razonamiento ni ninguna tarea real de NLP. El modelo base subyacente, FNet, sustituye la atencion por una transformada de Fourier, pero este artefacto no hereda capacidades funcionales de aquel.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FNet (transformer con mezcla por transformada de Fourier), variante `FNetForPreTraining` |
| Parametros totales | 2.159.554 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32; verificado finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo replica la arquitectura FNet de `google/fnet-base`, que reemplaza las capas de self-attention por una transformada de Fourier bidimensional (no aprendida) seguida de capas feed-forward. En este fixture, el numero de capas ocultas se reduce a 2 mediante la regla generica de `sweep.py` del repositorio `transformers-mic`. El resultado mantiene los mismos nombres de tensor y la misma estructura de configuracion que el checkpoint original, lo que permite validar la compatibilidad de carga sin ambiguedades.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17. Para justificar que el fixture es funcionalmente sensible a las entradas del contrato, se aplico una "input-sensitivity gate": cada perturbacion de las entradas (incluido `token_type_ids:all_ones`) desplaza los logits al menos 0.001; el caso mas debil registro 0.306. Esto garantiza que las pruebas detecten diferencias reales en la salida. El fixture se guarda en float32 (dtype por defecto de `google/fnet-base`) y se verifico que forward, perdida y gradientes son finitos en float32, bfloat16 y float16.

## Capacidades

- No es un modelo funcional: no genera texto, no razona, no traduce ni responde preguntas.
- Sirve como fixture de integracion para validar la carga de `FNetForPreTraining` en Transformers.
- Valida la sensibilidad de entradas del contrato (input-sensitivity gate) frente a perturbaciones.
- Comprueba la estabilidad numerica (forward, loss, gradientes) en float32, bfloat16 y float16.
- Verifica la equivalencia de nombres de tensor con el checkpoint real `google/fnet-base`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingues declaradas.
- No incluye modo thinking, vision ni audio.

## Casos de uso

- Pruebas de integracion en Transformers: cargar `FNetForPreTraining` con este fixture para verificar que la configuracion reducida se instancia correctamente y que los tensores se mapean sin errores.
- Validacion de pipelines CI/CD: usar el fixture como sustituto ligero de `google/fnet-base` en tests automatizados que necesitan ejecutar forward y backward sin descargar el modelo completo.
- Verificacion de estabilidad numerica: ejecutar forward, calculo de perdida y gradientes en float32, bfloat16 y float16 para detectar regresiones de precision en librerias de inferencia.
- Comprobacion de sensibilidad a entradas: aplicar perturbaciones sobre `input_ids`, `attention_mask` y `token_type_ids` y confirmar que los logits cambian por encima del umbral definido (0.001).
- Auditoria de compatibilidad de tokenizer: validar que los ficheros `spiece.model`, `tokenizer.json` y `tokenizer_config.json` copiados byte a byte desde `google/fnet-base` se cargan sin discrepancias.
- Desarrollo de herramientas de "model shrinking": servir como referencia reproducible del proceso de reduccion descrito en `sweep.py` para construir fixtures de otros checkpoints.
- Pruebas de serializacion safetensors: verificar que el formato de pesos y los nombres de tensor coinciden con los del checkpoint real antes de migrar a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios y no tiene rendimiento funcional medible en tareas de NLP.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en float32 (2,16 M de parametros, ~8,6 MB de pesos), mas overhead de activaciones y framework.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; no requiere aceleradores de gama alta.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) y en CPU.
- Opciones de despliegue: Transformers (carga directa con `FNetForPreTraining`), entornos de test tipo pytest; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la inferencia es practicamente instantanea en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/fnet-base-mic` | 2.159.554 | no disponible | Fixture de test | no disponible | Hugging Face |
| `google/fnet-base` | no disponible en la informacion | no disponible | Modelo FNet preentrenado | no disponible en la informacion | Hugging Face |
| `google/fnet-large` | no disponible en la informacion | no disponible | Modelo FNet preentrenado de mayor tamano | no disponible en la informacion | Hugging Face |

La comparativa se limita al linaje FNet. No se dispone de datos de rendimiento ni de parametros exactos de los modelos originales en la informacion proporcionada, por lo que no es posible establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas carecen de significado.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- Licencia no declarada: no se puede asumir permiso de uso comercial ni de redistribucion.
- Idiomas no declarados: no hay garantia de comportamiento multilingue.
- Longitud de contexto no documentada; la configuracion reducida puede no reflejar la del modelo original.
- Riesgo de confusion: el nombre y la estructura pueden llevar a error si se confunde con `google/fnet-base`.
- No se han publicado sesgos, evaluaciones de alucinacion ni metricas de calidad porque el modelo no ha sido entrenado.
- La model card advierte que solo se incluyen pesos, uso ejecutable y expectativas de framework; otros ficheros deben regenerarse con `build_fixtures.py`.

## Enlaces

- [Hugging Face: huggingface-mic/fnet-base-mic](https://huggingface.co/huggingface-mic/fnet-base-mic)
- [Modelo base: google/fnet-base](https://huggingface.co/google/fnet-base)
- [Repositorio transformers-mic](https://github.com/huggingface/transformers-mic)
- [Script sweep.py](https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py)
- [Script build_fixtures.py](https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py)
- [Documentacion del proceso de shrink](https://huggingface-mic-mic-coverage.static.hf.space/shrink/fnet-base-mic.html)
- [Manifiesto de contrato (integration.json)](https://huggingface.co/huggingface-mic/fnet-base-mic/blob/main/integration.json)
- [Uso en Transformers (usage.md)](https://huggingface.co/huggingface-mic/fnet-base-mic/blob/main/integrations/transformers/usage.md)
- [Expectativas de Transformers](https://huggingface.co/huggingface-mic/fnet-base-mic/tree/main/integrations/transformers/expectations)
- [Procedencia del fixture (build.json)](https://huggingface.co/huggingface-mic/fnet-base-mic/blob/main/build.json)
