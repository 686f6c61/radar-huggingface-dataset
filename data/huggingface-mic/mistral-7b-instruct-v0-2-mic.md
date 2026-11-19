# huggingface-mic/Mistral-7B-Instruct-v0.2-mic

## Resumen

Mistral-7B-Instruct-v0.2-mic es un artefacto de prueba (fixture) publicado en Hugging Face por el usuario huggingface-mic. No es un modelo de lenguaje funcional, sino una version reducida artificialmente del checkpoint mistralai/Mistral-7B-Instruct-v0.2, creada para validar contratos de integracion y expectativas de frameworks (concretamente Transformers) sin necesidad de cargar los pesos completos del modelo original.

El repositorio contiene pesos "slim" de 8.438.400 parametros reales (frente a los aproximadamente 7.240 millones del Mistral-7B-Instruct-v0.2 original), con la misma arquitectura MistralForCausalLM pero reducida a 2 capas ocultas mediante la regla generica del script sweep.py del proyecto transformers-mic. Los pesos son aleatorios (semilla 17), no entrenados, y han superado una puerta de sensibilidad a la entrada que verifica que las perturbaciones de las entradas mueven los logits al menos 0.001.

Su relevancia es puramente tecnica y de infraestructura: sirve como fixture reproducible para probar pipelines de integracion, validacion de contratos de API y expectativas de framework en CI/CD, manteniendo los ficheros de procesador (tokenizer, generation_config, special_tokens_map) copiados byte a byte del modelo original. Esta etiquetado explicitamente como test-artifact para excluirlo de busquedas de modelos candidatos y no debe confundirse con un modelo utilizable en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MistralForCausalLM (transformer decoder-only), reducida a 2 capas ocultas |
| Parametros totales | 8.438.400 (fixture slim); el modelo base Mistral-7B-Instruct-v0.2 tiene aproximadamente 7.240 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del tokenizer del modelo base, pero no confirmada) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; el fixture es finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo MistralForCausalLM, pero con la configuracion reducida a num_hidden_layers = 2 mediante la regla generica de reduccion de sweep.py del repositorio transformers-mic. Los ficheros de procesador (generation_config.json, special_tokens_map.json, tokenizer.json, tokenizer.model y tokenizer_config.json) se copiaron byte a byte desde mistralai/Mistral-7B-Instruct-v0.2, de modo que el comportamiento del tokenizer y de la generacion es identico al del modelo original.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se generaron para superar una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato mueve los logits al menos 0.001 (el caso mas debil, attention_mask:all_ones, produjo 0.566). Los nombres de tensores coinciden con los del checkpoint real y el fixture se guardo en bfloat16, el dtype por defecto de carga del modelo base. Se verifico que es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La clave de fixture es ee79564a609e y cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el shrink.

## Capacidades

- No es un modelo de generacion de texto funcional: los pesos son aleatorios y no producen lenguaje coherente.
- Sirve como fixture de integracion para validar contratos de framework (Transformers) y expectativas de API.
- Mantiene los ficheros de procesador y tokenizer del Mistral-7B-Instruct-v0.2 original, por lo que permite probar pipelines de tokenizacion y generacion con la misma interfaz.
- Conserva los nombres de tensores del checkpoint real, lo que permite validar rutas de carga, mapeo de pesos y logica de sharding.
- Permite verificar sensibilidad a entradas (attention_mask, input_ids, etc.) en pruebas de contrato.
- No soporta tool calling, agentes, vision ni audio de forma funcional (no disponible en la informacion proporcionada).
- Capacidades multilingues: no disponible.

## Casos de uso

- Pruebas de integracion en CI/CD: el fixture permite ejecutar la suite completa de Transformers (carga, forward, loss, gradientes) sin descargar los aproximadamente 14 GB del checkpoint real, reduciendo tiempos y coste de infraestructura.
- Validacion de contratos de framework: los directorios integrations/transformers/expectations permiten comprobar que una version de Transformers cumple las expectativas documentadas para Mistral-7B-Instruct-v0.2.
- Pruebas de tokenizacion y generacion: al copiar byte a byte tokenizer.json, tokenizer.model y generation_config.json, se puede validar el pipeline de tokenizacion y los parametros de generacion sin cargar pesos reales.
- Verificacion de rutas de carga y mapeo de pesos: al conservar los nombres de tensores del checkpoint real, sirve para probar logica de carga, conversion de dtype y sharding en frameworks propios.
- Pruebas de sensibilidad a la entrada: el gate documentado (perturbaciones que mueven logits al menos 0.001) permite validar que una implementacion propaga correctamente attention_mask e input_ids.
- Desarrollo de herramientas de auditoria de modelos: permite construir y probar utilidades de inspeccion de configuracion, provenance y hashes sin depender de pesos grandes.
- Reproducibilidad de fixtures: build.json y build_fixtures.py permiten reconstruir el fixture y verificar hashes, util para pipelines de validacion de artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en bfloat16 para los 8.438.400 parametros del fixture (los pesos ocupan aproximadamente 16,9 MB en bfloat16); el modelo base Mistral-7B-Instruct-v0.2 requiere aproximadamente 14 GB en bfloat16.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es suficiente para el fixture; el modelo base requiere A100, H100 o RTX 4090 con 24 GB para bfloat16.
- Cabe en GPU consumer: si, el fixture cabe en cualquier GPU con mas de 1 GB de VRAM.
- Opciones de despliegue: Transformers (viaje principal documentado en integrations/transformers/usage.md); no se documentan opciones para vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mistral-7B-Instruct-v0.2-mic | 8.438.400 | no disponible | Fixture de integracion (test-artifact) | no disponible | Hugging Face |
| mistralai/Mistral-7B-Instruct-v0.2 | aproximadamente 7.240 millones | no disponible | Modelo instructivo funcional | no disponible en la informacion | Hugging Face |
| Otros fixtures de transformers-mic | variable (segun shrink) | no disponible | Validacion de contratos de framework | no disponible | Hugging Face |

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y no generan texto coherente ni responden a instrucciones.
- Etiquetado como test-artifact para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- La licencia no esta disponible en la informacion proporcionada, por lo que no se puede confirmar el uso comercial.
- El contexto, los idiomas y las capacidades del modelo base no se confirman en la informacion; el fixture solo hereda el tokenizer y la configuracion de generacion.
- Riesgo de confusion con el modelo original: el nombre incluye Mistral-7B-Instruct-v0.2 pero el contenido es un fixture reducido de 2 capas.
- No se documentan sesgos, alucinaciones ni limitaciones de contexto especificas porque no aplican a un artefacto de prueba.
- Requiere reconstruir ficheros adicionales con python example/build_fixtures.py --fixture Mistral-7B-Instruct-v0.2-mic para reproducir el entorno completo.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/Mistral-7B-Instruct-v0.2-mic
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de reduccion sweep.py: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion build_fixtures.py: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Documentacion del shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Mistral-7B-Instruct-v0.2-mic.html
- Uso con Transformers: integrations/transformers/usage.md (en el repositorio)
- Expectativas de Transformers: integrations/transformers/expectations (en el repositorio)
- Manifiesto de contrato: integration.json (en el repositorio)
- Provenance del fixture: build.json (en el repositorio)
