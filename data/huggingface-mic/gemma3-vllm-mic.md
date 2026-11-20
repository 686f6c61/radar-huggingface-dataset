# huggingface-mic/gemma3-vllm-mic

## Resumen

`huggingface-mic/gemma3-vllm-mic` es un artefacto de prueba (fixture) publicado por el usuario `huggingface-mic` como parte del proyecto `transformers-mic`. No es un modelo utilizable: se trata de una version reducida artificialmente de `google/gemma-3-4b-it` cuyo proposito es servir como banco de pruebas para validar la integracion del modelo Gemma 3 con frameworks de inferencia, en este caso vLLM. El autor lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

La relevancia de este repositorio no esta en sus capacidades de generacion, sino en su valor como fixture de ingenieria: conserva la misma arquitectura (`Gemma3ForConditionalGeneration`), los mismos nombres de tensores y los mismos ficheros de procesador (tokenizer, chat template, preprocessor config) que el checkpoint real, pero con una configuracion drasticamente reducida (2 capas de texto y 2 capas de vision) y solo 17.226.816 parametros. Esto permite a los desarrolladores ejecutar tests de integracion end-to-end con vLLM y Transformers de forma rapida y con un consumo de recursos minimo.

El modelo pesa 0.1 GB en el repositorio y sus pesos son aleatorios (semilla 17), generados sin entrenamiento. Fue validado con una compuerta de sensibilidad a la entrada que verifica que perturbaciones en las entradas mueven los logits al menos 0.001. No debe confundirse con un modelo funcional de Gemma 3: es exclusivamente una herramienta de test.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma3ForConditionalGeneration (transformer multimodal texto+vision, version reducida) |
| Parametros totales | 17.226.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (config reducida; el modelo base soporta contexto largo, pero el fixture no documenta un valor propio) |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura de `google/gemma-3-4b-it`, un transformer multimodal de la familia Gemma 3 que combina un decodificador de texto con un codificador de vision bajo la clase `Gemma3ForConditionalGeneration`. Para reducir el tamano, el script `sweep.py` aplica una regla generica de encogimiento que deja `num_hidden_layers` en 2 tanto para el modulo de texto como para el de vision. Los ficheros del procesador (`tokenizer.json`, `tokenizer.model`, `chat_template.json`, `preprocessor_config.json`, `special_tokens_map.json`, `added_tokens.json`, `generation_config.json`, `processor_config.json`, `tokenizer_config.json`) se copian byte a byte desde el checkpoint original, de modo que el pipeline de tokenizacion y el contrato de chat son identicos a los del modelo real.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron mediante una compuerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato debe mover los logits al menos 0.001 (el caso mas debil, `attention_mask:all_ones`, movio 0.268). Los tensores conservan los mismos nombres que el checkpoint real y el modelo es finito en float32, bfloat16 y float16 (forward, loss y gradientes). Se guarda en bfloat16, el dtype por defecto de carga del modelo base. El repositorio incluye un manifiesto de contrato (`integration.json`), documentacion de uso para Transformers, expectativas de framework y procedencia del fixture (`build.json`), generado por `build_fixtures.py`.

## Capacidades

- No es un modelo funcional: no genera texto, codigo ni razonamiento con calidad, ya que sus pesos son aleatorios.
- Sirve como fixture de integracion para validar la carga de `Gemma3ForConditionalGeneration` en vLLM y Transformers.
- Permite testear el pipeline de tokenizacion y el chat template reales de Gemma 3, al copiarse los ficheros de procesador byte a byte.
- Valida la compatibilidad de nombres de tensores y de configuracion entre el checkpoint real y el fixture.
- Ejercita rutas de forward, loss y gradientes en float32, bfloat16 y float16.
- No soporta tool calling, agentes, vision real ni capacidades multilingues mas alla de las que aporta el tokenizer heredado.

## Casos de uso

- Tests de integracion en CI/CD para vLLM: ejecutar la carga del modelo y una generacion corta en cada pull request sin necesidad de GPU de gran capacidad, gracias a los 17,2 M de parametros y 0,1 GB de repo.
- Validacion de pipelines de Transformers: comprobar que `AutoModelForCausalLM`/`AutoProcessor` cargan correctamente la configuracion y el tokenizer de Gemma 3 antes de desplegar el modelo real.
- Verificacion de chat templates: al conservar `chat_template.json` y `tokenizer_config.json` originales, permite testear el formateo de conversaciones multi-turno sin cargar los 4B parametros.
- Pruebas de compatibilidad de dtype: ejecutar forward y backward en float32, bfloat16 y float16 para detectar problemas de precision en frameworks nuevos.
- Desarrollo de harness de evaluacion: usar el fixture como caso de prueba controlado con pesos deterministas (semilla 17) para comparar salidas entre versiones de un framework.
- Validacion de contratos de API: el manifiesto `integration.json` permite a los mantenedores de frameworks comprobar que cumplen las expectativas declaradas de carga, tokenizacion y forward.
- Regresion de nombres de tensores: detectar roturas cuando se renombran capas o se cambia la clase de modelo entre versiones de Transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que no tiene sentido evaluar MMLU, HumanEval, GSM8K ni metricas similares.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (17,2 M de parametros, ~34 MB de pesos), mas el overhead del framework.
- GPU recomendadas: cualquier GPU consumer o integrada; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer, incluso en CPU para tests basicos.
- Opciones de despliegue: vLLM (objetivo principal del fixture), Transformers; no se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture, no se publican mediciones de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/gemma3-vllm-mic | 17,2 M | no disponible | Fixture de test para vLLM/Transformers | no disponible | Hugging Face |
| google/gemma-3-4b-it | 4B (aprox.) | no disponible en la informacion | Modelo multimodal funcional | Gemma Terms of Use (segun modelo base, no confirmado en esta ficha) | Hugging Face |
| Otros fixtures de transformers-mic | variable | no disponible | Tests de integracion por modelo | no disponible | Hugging Face |

La comparativa con modelos funcionales no es significativa: el fixture solo es comparable con otros artefactos de prueba del mismo proyecto.

## Limitaciones y advertencias

- No es un modelo utilizable en produccion: los pesos son aleatorios y las salidas no tienen sentido.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe confundirse con Gemma 3.
- La licencia no esta declarada en la informacion disponible; el modelo base `google/gemma-3-4b-it` tiene sus propios terminos de uso que no se detallan aqui.
- La configuracion reducida (2 capas de texto y 2 de vision) no refleja el comportamiento del modelo real; los resultados de tests sobre este fixture no garantizan el comportamiento con los pesos completos.
- No se documentan sesgos ni riesgos de alucinacion porque no genera contenido con sentido.
- El repositorio solo incluye pesos reducidos, uso y expectativas de framework; otros ficheros deben regenerarse con `python example/build_fixtures.py --fixture gemma3-vllm-mic`.
- No apto para evaluaciones de calidad, seguridad o alineacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/gemma3-vllm-mic
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/gemma3-vllm-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/gemma3-vllm-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/gemma3-vllm-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/gemma3-vllm-mic/blob/main/build.json
- Documentacion del proceso de encogimiento: https://huggingface-mic-mic-coverage.static.hf.space/shrink/gemma3-vllm-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Script de encogimiento: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
