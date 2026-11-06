# huggingface-mic/switch-base-8-mic

## Resumen

`huggingface-mic/switch-base-8-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic`, no un modelo entrenado. Se trata de una version reducida artificialmente del modelo `google/switch-base-8` de Google, con solo 2.319.872 parametros, cuyo proposito es servir como banco de pruebas para la infraestructura de integracion continua (MIC) de Transformers. La model card lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos a uso real.

El modelo conserva la arquitectura `SwitchTransformersForConditionalGeneration` (un transformer con mezcla de expertos, MoE) pero con una configuracion reducida a 2 capas de encoder y 2 de decoder. Los pesos son aleatorios (semilla 17) y no han pasado por ningun proceso de entrenamiento. Los ficheros de procesador (tokenizer, `spiece.model`, `generation_config.json`, etc.) se copian byte a byte del checkpoint original `google/switch-base-8`, de modo que la interfaz de tokenizacion es identica a la del modelo real.

Su relevancia es exclusivamente tecnica y de infraestructura: permite validar contratos de ejecucion, expectativas de framework y pruebas de sensibilidad de entrada sin descargar los cientos de millones de parametros del modelo original. No debe emplearse para inferencia real, generacion de texto ni ninguna tarea de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SwitchTransformers (transformer encoder-decoder con mezcla de expertos) |
| Parametros totales | 2.319.872 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es una instancia de `SwitchTransformersForConditionalGeneration`, la arquitectura MoE de Google presentada en el paper de Switch Transformers (2021). En esta fixture la configuracion se ha reducido mediante la regla generica de `sweep.py` del repositorio `transformers-mic` a `num_layers=2` y `num_decoder_layers=2`, conservando los nombres de tensores del checkpoint original. Los pesos son aleatorios, generados con semilla 17, y no han sido entrenados: superaron unicamente una puerta de sensibilidad de entrada en la que cada perturbacion de las entradas del contrato desplazaba los logits al menos 0.001 (el caso mas debil, `attention_mask:all_ones`, produjo 4.36).

No hay datos de entrenamiento, dataset, RLHF ni DPO porque el modelo no se entreno. La unica innovacion tecnica relevante es la metodologia de "shrink" (reduccion) de checkpoints: se copian byte a byte los ficheros de procesador del modelo original (`generation_config.json`, `special_tokens_map.json`, `spiece.model`, `tokenizer.json`, `tokenizer_config.json`) y se generan pesos con la misma estructura de tensores, guardados en bfloat16 (el dtype por defecto de `google/switch-base-8`). La fixture es finita en float32, bfloat16 y float16 tanto en forward como en loss y gradientes.

## Capacidades

- No dispone de capacidades funcionales reales: los pesos son aleatorios y no producen texto coherente.
- Sirve como fixture de contrato para validar la integracion de `SwitchTransformers` en Transformers (carga, forward, loss, gradientes).
- Permite comprobar la sensibilidad de entrada del contrato (perturbaciones de `input_ids`, `attention_mask`, etc.).
- Conserva la interfaz de tokenizacion del modelo original mediante los ficheros de procesador copiados byte a byte.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues reales.
- No incluye modo thinking, vision ni audio.

## Casos de uso

- Pruebas de integracion continua en Transformers: usar la fixture para verificar que la clase `SwitchTransformersForConditionalGeneration` carga, ejecuta forward y calcula gradientes sin descargar el checkpoint completo de `google/switch-base-8`.
- Validacion de contratos de framework: comprobar que las expectativas documentadas en `integrations/transformers/expectations` se cumplen con un modelo de estructura identica pero tamano minimo.
- Pruebas de sensibilidad de entrada: verificar que perturbaciones en `input_ids` o `attention_mask` alteran los logits por encima del umbral definido (0.001), como parte del pipeline de `sweep.py`.
- Desarrollo de utilidades de serializacion: probar la carga y guardado en safetensors y la conversion entre float32, bfloat16 y float16 con un modelo pequeno que replica los nombres de tensores del original.
- Reproduccion de la metodologia de shrink: usar `build_fixtures.py` con `--fixture switch-base-8-mic` para regenerar los ficheros auxiliares y comparar hashes recogidos en `build.json`.
- Pruebas de tokenizacion: validar pipelines que dependen de `spiece.model` y `tokenizer.json` identicos a los de `google/switch-base-8` sin cargar los pesos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no ha sido entrenado y sus pesos son aleatorios, por lo que cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (2,3 M de parametros); cabe en cualquier GPU consumer, e incluso en CPU.
- GPU recomendadas: ninguna en particular; cualquier GPU con soporte bfloat16 o float16 es suficiente. Una RTX 4090, A100 o H100 estarian enormemente sobredimensionadas.
- Cabe en GPU consumer: si, en cualquier modelo (GTX 1060 en adelante, por ejemplo).
- Opciones de despliegue: Transformers con `SwitchTransformersForConditionalGeneration`; vLLM, llama.cpp, Ollama o TGI no estan pensados para este artefacto y no se ha documentado su uso.
- Latencia y throughput: no disponibles; al ser una fixture de test no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/switch-base-8-mic` | 2,3 M | no disponible | Fixture de test | no disponible | Hugging Face |
| `google/switch-base-8` | no disponible en la informacion | no disponible | Modelo MoE real | no disponible | Hugging Face |
| Otras fixtures `huggingface-mic` | variable | no disponible | Fixtures de test | no disponible | Hugging Face |

La comparativa con modelos funcionales de la misma categoria no esta disponible en la informacion proporcionada. El unico comparable directo es el checkpoint original `google/switch-base-8`, del que esta fixture deriva estructuralmente.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no genera texto coherente ni resuelve ninguna tarea; no debe usarse en produccion ni en evaluaciones de calidad.
- Etiquetado como `test-artifact`: la model card indica explicitamente que se excluya de busquedas de modelos candidatos.
- Licencia no disponible: no se puede confirmar el regimen de uso comercial; al derivar de `google/switch-base-8` habria que consultar la licencia del modelo original.
- Idiomas no disponibles: la tokenizacion replica la del original, pero el modelo no tiene capacidad linguistica real.
- Sin datos de sesgos ni alucinacion: al no estar entrenado, no aplican en el sentido habitual, pero tampoco se ha auditado.
- Contexto no documentado: la configuracion reducida no publica `max_position_embeddings` ni longitud de contexto efectiva.
- Riesgo de confusion: el nombre y la estructura pueden llevar a error si se confunde con el modelo real de Google; conviene revisar la etiqueta `test-artifact` antes de cualquier uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/switch-base-8-mic
- Modelo base: https://huggingface.co/google/switch-base-8
- Como se redujo la fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/switch-base-8-mic.html
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de reduccion `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Manifiesto de contrato (en el repo): `integration.json`
- Uso en Transformers (en el repo): `integrations/transformers/usage.md`
- Expectativas de Transformers (en el repo): `integrations/transformers/expectations`
- Procedencia de la fixture (en el repo): `build.json`
