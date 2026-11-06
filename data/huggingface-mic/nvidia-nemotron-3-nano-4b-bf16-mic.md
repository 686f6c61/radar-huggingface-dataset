# huggingface-mic/NVIDIA-Nemotron-3-Nano-4B-BF16-mic

## Resumen

NVIDIA-Nemotron-3-Nano-4B-BF16-mic es un artefacto de prueba (fixture) publicado por el usuario huggingface-mic, no un modelo utilizable. Se trata de una version reducida artificialmente del checkpoint nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16, generada para validar contratos de integracion de frameworks (concretamente Transformers) sobre la arquitectura NemotronH. El repositorio contiene pesos "slim" de 20,2 millones de parametros con pesos aleatorios (semilla 17), junto con los ficheros de procesador, tokenizador y plantilla de chat copiados byte a byte del modelo original.

El proposito del artefacto es servir como fixture de test: replica la misma arquitectura y los mismos nombres de tensores que el checkpoint real, pero con una configuracion reducida, de modo que las pruebas de integracion puedan ejecutarse sin cargar el modelo completo de 4B. La model card lo etiqueta explicitamente como `test-artifact` para excluirlo de las busquedas de modelos candidatos.

Por tanto, esta ficha documenta un artefacto de ingenieria de software, no un modelo de lenguaje funcional: sus pesos son aleatorios y no ha recibido entrenamiento. Cualquier evaluacion de capacidades, calidad o rendimiento sobre este repositorio carece de sentido; los datos utiles son los del modelo base nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NemotronH (NemotronHForCausalLM), transformer causal LM |
| Parametros totales | 20.150.968 (fixture reducido; el modelo base es de 4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el fichero LICENSE se copia del modelo base, pero no se especifica su contenido) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture emplea la clase `NemotronHForCausalLM` de la arquitectura NemotronH, la misma que el checkpoint original nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16. La configuracion se ha reducido mediante la regla generica de `sweep.py` del repositorio transformers-mic, conservando los mismos nombres de tensores que el checkpoint real, de modo que el codigo de carga y las expectativas de framework se ejercitan de forma representativa.

No hay entrenamiento. Los pesos son aleatorios con semilla 17 y unicamente pasaron una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato movia los logits al menos 0,001 (la mas debil, `input_ids:roll_batch`, 0,766). Los ficheros de procesador se copiaron byte a byte del modelo base: `LICENSE`, `__init__.py`, `bias.md`, `chat_template.jinja`, `configuration_nemotron_h.py`, `explainability.md`, `generation_config.json`, `modeling_nemotron_h.py`, `nano_v3_reasoning_parser.py`, `privacy.md`, `safety.md`, `special_tokens_map.json`, `tokenizer.json` y `tokenizer_config.json`. El fixture es finito en float32, bfloat16 y float16 (forward, loss y gradientes).

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen texto coherente.
- Sirve como fixture de integracion para validar la carga de `NemotronHForCausalLM` en Transformers.
- Permite probar el tokenizador y la plantilla de chat copiados del modelo base.
- Permite validar el parser de razonamiento `nano_v3_reasoning_parser.py` incluido en el repositorio.
- Ejercita los mismos nombres de tensores que el checkpoint real de 4B.
- No dispone de tool calling, agentes, vision, audio ni capacidades multilingues verificables.

## Casos de uso

- Pruebas de integracion en CI: cargar el fixture en Transformers para verificar que la clase `NemotronHForCausalLM` se instancia y ejecuta un forward sin errores, sin necesidad de descargar el modelo de 4B.
- Validacion de contratos de framework: comprobar que las expectativas documentadas en `integrations/transformers/expectations` se cumplen sobre una configuracion reducida.
- Test de tokenizador y plantilla de chat: verificar que `tokenizer.json` y `chat_template.jinja` del modelo base se cargan y renderizan correctamente.
- Pruebas de precision numerica: comprobar que forward, loss y gradientes son finitos en float32, bfloat16 y float16.
- Desarrollo de herramientas de inspeccion de pesos: validar que los nombres de tensores coinciden con los del checkpoint real antes de operar sobre el modelo completo.
- Regresion de parsers de razonamiento: probar `nano_v3_reasoning_parser.py` con salidas sinteticas sin coste de inferencia real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier metrica de calidad seria invalida.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para el fixture de 20,2M parametros en bfloat16 (el repositorio ocupa 0,2 GB).
- GPU: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer y en CPU.
- Despliegue: Transformers con `trust_remote_code=True` (el repositorio incluye `custom_code`); no esta pensado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; irrelevantes para un artefacto de test.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia |
|---|---|---|---|---|
| NVIDIA-Nemotron-3-Nano-4B-BF16-mic | 20,2M (fixture) | no disponible | Fixture de test | no disponible |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 | 4B | no disponible | Modelo base real | no disponible en la informacion proporcionada |

No se dispone de informacion sobre otros fixtures comparables ni sobre el rendimiento del modelo base en la documentacion facilitada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas carecen de significado.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos.
- No usar en produccion ni para evaluaciones de calidad, sesgo o alucinacion.
- La licencia no esta disponible en la informacion proporcionada; el fichero LICENSE se copia del modelo base, por lo que habria que consultar el repositorio original.
- Requiere `trust_remote_code=True` por el codigo personalizado incluido.
- Los datos de idiomas, contexto y cuantizacion no estan disponibles para este artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/NVIDIA-Nemotron-3-Nano-4B-BF16-mic
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Como se genero el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/NVIDIA-Nemotron-3-Nano-4B-BF16-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
