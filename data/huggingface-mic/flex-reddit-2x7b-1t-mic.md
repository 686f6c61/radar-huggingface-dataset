# huggingface-mic/Flex-reddit-2x7B-1T-mic

## Resumen

Flex-reddit-2x7B-1T-mic es un artefacto de prueba (fixture) publicado por el usuario huggingface-mic, no un modelo utilizable en producción. Se trata de una version reducida del modelo shanearora/Flex-reddit-2x7B-1T, con tan solo 12.976.960 parametros (13,0 M), creada para validar contratos de integracion con el framework Transformers. El repositorio esta etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

El modelo conserva la arquitectura FlexOlmoForCausalLM del modelo original, pero con la configuracion reducida a 2 capas ocultas mediante la regla generica de `sweep.py`. Los pesos son aleatorios (semilla 17) y no han sido entrenados; pasaron un test de sensibilidad a las entradas (cada perturbacion de las entradas movia los logits al menos 0,001). Los ficheros de procesador (tokenizer, generation_config, etc.) se copiaron byte a byte del modelo base.

Su relevancia es exclusivamente tecnica y de infraestructura: sirve para verificar que las expectativas del framework (nombres de tensores, dtypes, comportamiento en float32/bfloat16/float16) coinciden con el checkpoint real, sin necesidad de descargar los pesos completos. No debe confundirse con un modelo de lenguaje funcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FlexOlmoForCausalLM (transformer, 2 capas ocultas) |
| Parametros totales | 12.976.960 (13,0 M) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32; verificado en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura FlexOlmoForCausalLM, la misma familia que el modelo base shanearora/Flex-reddit-2x7B-1T, pero con la configuracion reducida a `num_hidden_layers: 2` mediante la regla generica de reduccion de `sweep.py`. Los nombres de tensores coinciden exactamente con los del checkpoint real, y los ficheros de procesador (`tokenizer.json`, `tokenizer_config.json`, `vocab.json`, `merges.txt`, `special_tokens_map.json`, `generation_config.json`, `FlexOlmo_Logo.png`) se copiaron byte a byte del modelo base.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron mediante un test de sensibilidad a las entradas: cada perturbacion de las entradas del contrato movio los logits al menos 0,001 (la perturbacion mas debil, `attention_mask:all_ones`, produjo 0,0756). El modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. No se dispone de informacion sobre datos de entrenamiento, RLHF/DPO ni innovaciones tecnicas del modelo base.

## Capacidades

- Generacion de texto: teoricamente soportada por la arquitectura FlexOlmoForCausalLM, pero los pesos aleatorios no producen texto coherente.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.
- Validacion de contratos de framework: verificacion de nombres de tensores, dtypes y comportamiento numerico frente al checkpoint real.

## Casos de uso

- Validacion de integraciones con Transformers: el fixture permite comprobar que las expectativas del framework (nombres de tensores, dtypes, ficheros de procesador) coinciden con el checkpoint real sin descargar los pesos completos.
- Pruebas de CI/CD en pipelines de modelos: al ocupar 0,1 GB, se puede incluir en tests automatizados que verifiquen carga, forward pass y compatibilidad de tokenizer.
- Verificacion de dtypes: comprobar que el modelo es finito en float32, bfloat16 y float16 (forward, loss y gradientes) antes de desplegar el modelo real.
- Desarrollo de herramientas de inspeccion de modelos: validar scripts que inspeccionan arquitecturas, configuraciones y ficheros de procesador.
- Reproducibilidad de fixtures: el fichero `build.json` registra fuentes fijadas, resultados de gates y hashes de ficheros, lo que permite reconstruir el artefacto con `build_fixtures.py`.
- Formacion y documentacion: ejemplo didactico de como reducir un checkpoint para pruebas sin modificar la interfaz del framework.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, no tiene sentido evaluar su rendimiento en tareas de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (13,0 M de parametros, repo de 0,1 GB).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU.
- Cabe en cualquier GPU consumer y en CPU sin problema.
- Opciones de despliegue: Transformers (carga estandar), aunque no se garantiza soporte en vLLM, llama.cpp u Ollama por tratarse de un fixture.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas y 13 M de parametros, la inferencia es practicamente instantanea, pero sin valor funcional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| Flex-reddit-2x7B-1T-mic | 13,0 M | no disponible | no disponible | Fixture de prueba |
| shanearora/Flex-reddit-2x7B-1T | no disponible (modelo base) | no disponible | no disponible | Modelo real de generacion de texto |
| Otros fixtures de huggingface-mic | variable | no disponible | no disponible | Artefactos de prueba de contratos |

No se dispone de informacion suficiente para comparar rendimiento con alternativas funcionales.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y no producen texto coherente.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos.
- Licencia no disponible: no se puede asumir uso comercial.
- Idiomas no disponibles.
- Longitud de contexto no disponible.
- Riesgo de confusion: el nombre sugiere un modelo de 2x7B, pero el fixture tiene solo 13,0 M de parametros.
- No apto para produccion ni para evaluacion de capacidades de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/Flex-reddit-2x7B-1T-mic
- Modelo base: https://huggingface.co/shanearora/Flex-reddit-2x7B-1T
- Manifest de contrato: https://huggingface.co/huggingface-mic/Flex-reddit-2x7B-1T-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/Flex-reddit-2x7B-1T-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/Flex-reddit-2x7B-1T-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/Flex-reddit-2x7B-1T-mic/blob/main/build.json
- Como se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Flex-reddit-2x7B-1T-mic.html
- Script de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
