# huggingface-mic/gemma-2-2b-it-mic

## Resumen

`huggingface-mic/gemma-2-2b-it-mic` es un artefacto de prueba (fixture) derivado de `google/gemma-2-2b-it`, publicado por la organizacion `huggingface-mic` dentro del proyecto transformers-mic. No es un modelo utilizable para inferencia real: se trata de un checkpoint "slim" de 16.458.304 parametros con pesos aleatorios (semilla 0), disenado para validar contratos de integracion de frameworks (concretamente Transformers) sobre la arquitectura Gemma 2 sin necesidad de cargar el modelo completo de 2B parametros.

El repositorio empaqueta en un unico lugar los pesos reducidos, ejemplos de uso ejecutables (`integrations/transformers/usage.md`), las expectativas del framework (`integrations/transformers/expectations`), un manifiesto de contrato (`integration.json`) y la procedencia de la fixture (`build.json`). La arquitectura subyacente es `Gemma2ForCausalLM`, pero con `num_hidden_layers` reducido a 2 mediante la regla generica de `sweep.py`, manteniendo los mismos nombres de tensores que el checkpoint original.

Su relevancia es puramente de ingenieria de software: permite ejecutar tests de integracion, validacion de contratos y comprobaciones de sensibilidad de entradas en CI sin descargar los ~5 GB del Gemma 2 2B real. Esta etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos, y no debe confundirse con un modelo afinado o destilado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma2ForCausalLM (transformer decoder-only, reducido a 2 capas) |
| Parametros totales | 16.458.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de la config de Gemma 2 2B it, pero no confirmada en la informacion) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; finite tambien en float32 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La fixture replica la arquitectura `Gemma2ForCausalLM` del checkpoint base `google/gemma-2-2b-it`, pero con la configuracion reducida: `num_hidden_layers` pasa a 2 aplicando la regla generica de reduccion de `sweep.py`. Los ficheros de procesador (`generation_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer.model`, `tokenizer_config.json`) se copian byte a byte del checkpoint original, de modo que el tokenizador y la configuracion de generacion son identicos a los de Gemma 2 2B it.

No hubo entrenamiento. Los pesos son aleatorios con semilla 0 y se aceptaron porque superaron la puerta de sensibilidad a las entradas: cada perturbacion de las entradas del contrato movio los logits al menos 0.001 (la mas debil, `input_ids:roll_batch`, 0.401). La fixture conserva exactamente los mismos nombres de tensores que el checkpoint real y se guarda en bfloat16, el dtype por defecto de `google/gemma-2-2b-it`. La clave de fixture es `6757a5dfa94e` y cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras la reduccion.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen texto coherente.
- Ejecucion de forward, calculo de loss y gradientes finitos en float32, bfloat16 y float16.
- Validacion de contratos de integracion de Transformers sobre la arquitectura Gemma 2.
- Comprobacion de sensibilidad de entradas (perturbaciones que alteran los logits por encima de un umbral).
- Verificacion de que los nombres de tensores coinciden con el checkpoint real de Gemma 2 2B it.
- Uso como fixture en pipelines de CI para tests de integracion ligeros.
- No soporta tool calling, agentes, vision, audio ni capacidades multilingues reales, al carecer de pesos entrenados.

## Casos de uso

- Tests de integracion en CI: cargar la fixture en lugar del Gemma 2 2B completo para validar que el codigo de integracion con Transformers funciona, reduciendo el tiempo y el ancho de banda de descarga de ~5 GB a 0.1 GB.
- Validacion de contratos de framework: comprobar que la implementacion de `Gemma2ForCausalLM` en un fork o wrapper cumple las expectativas documentadas en `integrations/transformers/expectations`.
- Pruebas de compatibilidad de tokenizador: al copiarse los ficheros de procesador byte a byte del modelo original, sirve para verificar que el pipeline de tokenizacion se comporta igual que con el checkpoint real.
- Verificacion de dtypes: comprobar que el codigo de inferencia y entrenamiento produce resultados finitos en float32, bfloat16 y float16 antes de escalar al modelo completo.
- Desarrollo de herramientas de reduccion de modelos: la fixture es el resultado de `sweep.py` y `build_fixtures.py`, por lo que sirve como caso de referencia para validar nuevas reglas de reduccion.
- Reproducibilidad de artefactos: `build.json` registra fuentes fijadas, resultados de la puerta de sensibilidad y hashes de ficheros, lo que permite auditar y reconstruir la fixture con `python example/build_fixtures.py --fixture gemma-2-2b-it-mic`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de una fixture con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (16,5 M de parametros, ~33 MB de pesos mas overhead de activaciones y tokenizador).
- GPU recomendadas: cualquier GPU consumer moderna; tambien es viable en CPU.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (via `integrations/transformers/usage.md`); no se documentan vLLM, llama.cpp, Ollama ni TGI para esta fixture.
- Latencia y throughput: no disponibles; al ser una fixture de test, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/gemma-2-2b-it-mic | 16,5 M | no disponible | Fixture de test | no disponible | Hugging Face |
| google/gemma-2-2b-it | 2,6 B (aprox., no confirmado en la informacion) | no disponible | Modelo instructivo real | Gemma Terms (segun modelo base; no confirmado en la informacion) | Hugging Face |
| Otros fixtures de transformers-mic | no disponible | no disponible | Fixtures de test | no disponible | Hugging Face (org huggingface-mic) |

La comparativa relevante es exclusivamente con el checkpoint base: la fixture comparte arquitectura, tokenizador y nombres de tensores, pero sustituye los pesos entrenados por pesos aleatorios y reduce las capas a 2. Frente a otros fixtures del mismo proyecto, comparte el mismo proposito de validacion de contratos, aunque no se dispone de datos concretos de esos otros artefactos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la salida no tiene sentido linguistico.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- Licencia no disponible en la informacion; no se puede confirmar el regimen de uso comercial. Al derivar de `google/gemma-2-2b-it`, habria que verificar los terminos del modelo base.
- Idiomas soportados no disponibles; el tokenizador es el de Gemma 2 2B it, pero sin pesos entrenados no hay capacidad multilingue real.
- Longitud de contexto no confirmada en la informacion; la config reducida podria alterar parametros dependientes de capas.
- Riesgo de confusion con un modelo afinado o destilado: el nombre `gemma-2-2b-it-mic` no indica que sea una fixture, por lo que conviene revisar `build.json` antes de usarlo.
- No apta para benchmarks de calidad ni para evaluacion de capacidades.
- La reconstruccion requiere ejecutar `python example/build_fixtures.py --fixture gemma-2-2b-it-mic`; el repositorio solo incluye pesos, uso y expectativas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/gemma-2-2b-it-mic
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- Como se redujo la fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/gemma-2-2b-it-mic.html
- Script de reduccion (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Manifiesto de contrato: `integration.json` (en el repositorio)
- Uso con Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
- Procedencia de la fixture: `build.json` (en el repositorio)
