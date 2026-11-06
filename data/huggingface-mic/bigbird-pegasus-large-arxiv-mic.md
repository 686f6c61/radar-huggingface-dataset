# huggingface-mic/bigbird-pegasus-large-arxiv-mic

## Resumen

`huggingface-mic/bigbird-pegasus-large-arxiv-mic` es un artefacto de prueba (fixture) derivado de `google/bigbird-pegasus-large-arxiv`, el modelo BigBirdPegasus de Google Research disenado para resumen de documentos largos. Lo publica la organizacion `huggingface-mic` con el proposito explicito de servir como banco de pruebas de integracion y validacion de contratos de frameworks, no como modelo usable en produccion. El repositorio se etiqueta como `test-artifact` precisamente para excluirlo de las busquedas de modelos candidatos.

El modelo conserva la arquitectura `BigBirdPegasusForConditionalGeneration` pero con una configuracion reducida: 2 capas de encoder y 2 de decoder, lo que da un total de aproximadamente 6,8 millones de parametros. Los pesos son aleatorios (semilla 17) y no han pasado por ningun proceso de entrenamiento; unicamente superaron una puerta de sensibilidad a las entradas, que verifica que perturbaciones en las entradas del contrato mueven los logits al menos 0,001.

Su relevancia es, por tanto, instrumental: permite a los mantenedores de frameworks (Transformers y otros) comprobar que sus integraciones cargan, ejecutan y validan correctamente un modelo de la familia BigBirdPegasus sin necesidad de descargar el checkpoint real de ~2.100 millones de parametros. Cualquier evaluacion de calidad, capacidades o rendimiento sobre este repositorio carece de sentido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (BigBirdPegasus, atencion dispersa tipo BigBird) |
| Parametros totales | ~6,8 millones (fixture reducido; el modelo base original tiene ~2.100 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base soporta contextos largos tipo BigBird) |
| Tipos de cuantizacion | no disponible; pesos guardados en float32 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors/PyTorch (pesos en float32; el repo figura con 0.0 GB) |

## Arquitectura y entrenamiento

La arquitectura es `BigBirdPegasusForConditionalGeneration`, un encoder-decoder basado en PEGASUS con mecanismo de atencion dispersa BigBird, pensado originalmente para resumir documentos que exceden las ventanas de contexto habituales. En este fixture se ha aplicado la regla generica de reduccion de `sweep.py` del proyecto transformers-mic, dejando `encoder_layers = 2` y `decoder_layers = 2`. Los nombres de tensores coinciden con los del checkpoint real y los ficheros de procesador (`generation_config.json`, `special_tokens_map.json`, `spiece.model`, `tokenizer.json`, `tokenizer_config.json`) se copiaron byte a byte desde `google/bigbird-pegasus-large-arxiv`.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y solo se validaron contra una puerta de sensibilidad a entradas: cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, produce 0,0079). El fixture es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La clave de fixture es `2653b6dc7b72` y cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras la reduccion.

## Capacidades

- Carga y ejecucion de la arquitectura BigBirdPegasus con nombres de tensores identicos al checkpoint real.
- Validacion de integraciones de framework (carga de config, tokenizer y pesos; forward pass; calculo de loss y gradientes).
- Pruebas de sensibilidad a entradas del contrato (por ejemplo, `attention_mask`).
- Compatibilidad de dtype: ejecucion verificada en float32, bfloat16 y float16.
- No dispone de capacidades generativas reales: los pesos son aleatorios, por lo que la salida no es texto coherente.
- No soporta tool calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues: no disponible (los ficheros de tokenizer se heredan del modelo base, pero el fixture no ha sido evaluado).

## Casos de uso

- Pruebas de integracion en Transformers: verificar que la clase `BigBirdPegasusForConditionalGeneration` se instancia, carga y ejecuta con la config reducida sin descargar el checkpoint completo.
- Validacion de contratos de framework: comprobar que las expectativas documentadas en `integrations/transformers/expectations` se cumplen (formas de salida, dtypes, nombres de tensores).
- CI/CD de librerias de inferencia: usar el fixture como caso de prueba ligero en pipelines que validan carga de safetensors y tokenizer antes de desplegar modelos reales.
- Pruebas de robustez numerica: ejecutar forward, loss y backward en float32, bfloat16 y float16 para detectar regresiones de estabilidad.
- Desarrollo de herramientas de reduccion de modelos: servir de ejemplo reproducible del proceso de `sweep.py` y `build_fixtures.py`.
- Verificacion de sensibilidad a mascaras de atencion: comprobar que perturbaciones en `attention_mask` alteran los logits por encima del umbral definido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K, ROUGE) seria irrelevante.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en float32 para los ~6,8 millones de parametros; el repositorio figura con 0.0 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: Transformers (referencia principal), con posible exportacion a otros runners; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; al ser un fixture reducido, la latencia seria minima pero sin valor representativo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bigbird-pegasus-large-arxiv-mic | ~6,8 M (fixture) | no disponible | Pruebas de integracion | no disponible | Hugging Face |
| google/bigbird-pegasus-large-arxiv | ~2.100 M | contexto largo tipo BigBird (no disponible el valor exacto) | Resumen de articulos cientificos | no disponible | Hugging Face |
| google/pegasus-large | ~568 M | 512-1024 tokens (segun variante) | Resumen abstractivo | Apache 2.0 (segun variante) | Hugging Face |

La comparativa con el checkpoint original es la mas relevante: mismo contrato de API y mismos nombres de tensores, pero con un 0,3 % de los parametros y sin entrenamiento. Frente a PEGASUS estandar, el modelo base de este fixture incorpora atencion dispersa BigBird para contextos mas largos.

## Limitaciones y advertencias

- Es un artefacto de prueba (`test-artifact`) con pesos aleatorios: no genera texto util ni debe usarse en produccion.
- No ha sido entrenado; no ha pasado por RLHF, DPO ni fine-tuning supervisado.
- Sesgos conocidos: no aplica, al no haber datos de entrenamiento; los del modelo base no se han evaluado aqui.
- Riesgo de alucinacion: total, en el sentido de que la salida es ruido estadistico sin relacion con la entrada.
- Limitaciones de contexto e idioma: no documentadas para el fixture.
- Licencia no disponible: verificar la del modelo base antes de cualquier uso derivado.
- El repositorio solo incluye pesos reducidos, uso y expectativas; otros ficheros deben regenerarse con `python example/build_fixtures.py --fixture bigbird-pegasus-large-arxiv-mic`.
- No debe incluirse en busquedas de modelos candidatos ni en evaluaciones comparativas de calidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/bigbird-pegasus-large-arxiv-mic
- Modelo base: https://huggingface.co/google/bigbird-pegasus-large-arxiv
- Manifiesto de contrato: `integration.json` (en el repositorio)
- Uso en Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
- Procedencia del fixture: `build.json` (en el repositorio)
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/bigbird-pegasus-large-arxiv-mic.html
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion generica: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
