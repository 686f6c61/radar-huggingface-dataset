# huggingface-mic/Mixtral-8x7B-Instruct-v0.1-mic

## Resumen

Mixtral-8x7B-Instruct-v0.1-mic es un artefacto de prueba publicado por la organizacion huggingface-mic. No es un modelo utilizable: se trata de un "fixture" o version reducida (slim) del checkpoint mistralai/Mixtral-8x7B-Instruct-v0.1, generado para validar contratos de integracion y expectativas de frameworks. Su unico proposito es servir como banco de pruebas reproducible para herramientas que consumen modelos de la familia Mixtral.

El repositorio conserva la arquitectura declarada (MixtralForCausalLM) pero con una configuracion drasticamente reducida: 2 capas ocultas y 4.318.016 parametros totales, frente a los aproximadamente 46.700 millones del modelo original. Los pesos son aleatorios (semilla 17), guardados en bfloat16, y los ficheros de procesador (tokenizer y generation_config) se copiaron byte a byte desde el checkpoint original de Mistral AI.

Su relevancia es exclusivamente para desarrollo e integracion: permite a los mantenedores de librerias verificar que el pipeline de carga, tokenizacion, forward, calculo de perdida y gradientes funciona con la misma estructura de tensores que el modelo real, sin necesidad de descargar decenas de gigabytes de pesos. Esta etiquetado como `test-artifact` precisamente para excluirlo de busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MixtralForCausalLM (transformer causal, configuracion reducida a 2 capas ocultas) |
| Parametros totales | 4.318.016 |
| Parametros activos | no disponible (el fixture no expone metadatos MoE funcionales) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; el autor declara finitud en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la clase MixtralForCausalLM con la misma nomenclatura de tensores que el checkpoint real, pero con una configuracion encogida mediante la regla generica de sweep.py del repositorio transformers-mic, que reduce num_hidden_layers a 2. Los ficheros de procesador (generation_config.json, special_tokens_map.json, tokenizer.json, tokenizer.model y tokenizer_config.json) se copiaron literalmente desde mistralai/Mixtral-8x7B-Instruct-v0.1, de modo que la tokenizacion y los tokens especiales son identicos a los del modelo original.

No hubo entrenamiento. Los pesos se inicializaron de forma aleatoria con semilla 17 y se validaron con una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato debia mover los logits al menos 0.001 (el caso mas debil, `attention_mask:all_ones`, produjo 0.828). El artefacto es finito en float32, bfloat16 y float16 tanto en forward como en perdida y gradientes, lo que lo hace apto para tests de integracion numerica. El identificador de fixture es `8fbeaff64f24` y cubre cualquier checkpoint cuyos ficheros de procesador sean identicos byte a byte y cuya config coincida tras el encogimiento.

## Capacidades

- No genera texto utilizable: los pesos son aleatorios y el modelo no ha sido entrenado.
- Reproduce la interfaz de carga de MixtralForCausalLM, incluidos nombres de tensores y ficheros de configuracion.
- Permite ejecutar forward, calculo de perdida y retropropagacion de gradientes en float32, bfloat16 y float16.
- Tokenizacion identica a mistralai/Mixtral-8x7B-Instruct-v0.1 gracias a la copia byte a byte de los ficheros del procesador.
- Sirve como caso de prueba para contratos de integracion (integration.json) y expectativas de framework (integrations/transformers/expectations).
- No soporta tool calling, agentes, razonamiento multietapa ni capacidades multilingues reales, al carecer de entrenamiento.

## Casos de uso

- Test de integracion en librerias de inferencia: verificar que el cargador de safetensors, la instanciacion de MixtralForCausalLM y la asignacion de tensores funcionan con la misma estructura que el checkpoint real, sin descargar los pesos completos.
- Validacion de pipelines de tokenizacion: comprobar que el tokenizer copiado produce los mismos ids y tokens especiales que el modelo original en pruebas de regresion.
- Pruebas de gradientes y mixed precision: ejecutar forward y backward en float32, bfloat16 y float16 para detectar NaN o inestabilidades numericas en frameworks nuevos.
- CI/CD de transformers-mic: usar el fixture como caso reproducible en la suite de integracion continua del repositorio, con hashes y procedencia registrados en build.json.
- Verificacion de contratos de integracion: validar que una herramienta externa respeta el manifiesto integration.json y las expectativas declaradas en integrations/transformers/expectations.
- Desarrollo de utilidades de inspeccion de modelos: probar herramientas que leen config.json, generation_config.json y safetensors sin requerir hardware de gran capacidad.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture Mixtral-8x7B-Instruct-v0.1-mic` y comparar hashes con los registrados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con 4,3 millones de parametros en bfloat16 (aproximadamente 8,6 MB de pesos mas overhead de activaciones y framework).
- GPU recomendadas: cualquier GPU consumer o integrada es suficiente; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU con soporte CUDA/ROCm, y tambien en CPU.
- Opciones de despliegue: transformers con el codigo de ejemplo de integrations/transformers/usage.md; otras herramientas (vLLM, llama.cpp, Ollama, TGI) no estan documentadas para este artefacto.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la latencia sera minima pero irrelevante para produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mixtral-8x7B-Instruct-v0.1-mic | 4.318.016 | no disponible | Fixture de test | no disponible | Hugging Face (huggingface-mic) |
| mistralai/Mixtral-8x7B-Instruct-v0.1 | ~46.700 millones (MoE, 8 expertos) | no disponible en esta ficha | Modelo instructivo real | Apache 2.0 (segun el modelo base original) | Hugging Face (mistralai) |
| Otros fixtures de transformers-mic | variable (reducidos) | no disponible | Test de integracion | no disponible | Hugging Face (huggingface-mic) |

La comparativa con modelos funcionales de la misma categoria no procede: el artefacto solo es comparable con otros fixtures de prueba del mismo repositorio.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas no tienen significado.
- No debe emplearse en produccion ni en evaluaciones de calidad; esta etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos.
- La licencia no esta declarada en el repositorio; el modelo base original es Apache 2.0, pero la licencia del fixture no se especifica.
- Los metadatos de contexto, idiomas y cuantizacion no estan disponibles en la informacion proporcionada.
- Aunque conserva la nomenclatura de tensores, la configuracion reducida (2 capas) no reproduce el comportamiento numerico ni el consumo de memoria del checkpoint real.
- Riesgo de confusion: el nombre incluye "Mixtral-8x7B-Instruct", pero el contenido no corresponde a ese modelo; verificar siempre el tamano real de los safetensors antes de usarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/Mixtral-8x7B-Instruct-v0.1-mic
- Modelo base: https://huggingface.co/mistralai/Mixtral-8x7B-Instruct-v0.1
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/Mixtral-8x7B-Instruct-v0.1-mic/blob/main/integration.json
- Uso con transformers: https://huggingface.co/huggingface-mic/Mixtral-8x7B-Instruct-v0.1-mic/blob/main/integrations/transformers/usage.md
- Expectativas de transformers: https://huggingface.co/huggingface-mic/Mixtral-8x7B-Instruct-v0.1-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/Mixtral-8x7B-Instruct-v0.1-mic/blob/main/build.json
- Explicacion del encogimiento: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Mixtral-8x7B-Instruct-v0.1-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de encogimiento: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
