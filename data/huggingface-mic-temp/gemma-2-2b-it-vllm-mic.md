# huggingface-mic-temp/gemma-2-2b-it-vllm-mic

## Resumen

`gemma-2-2b-it-vllm-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic-temp` en Hugging Face. No es un modelo usable: es una version "encogida" del modelo `google/gemma-2-2b-it` de Google, reducida de aproximadamente 2.600 millones de parametros a 16,5 millones mediante la reduccion de su configuracion a 2 capas ocultas. Su proposito es servir como banco de pruebas reproducible para validar contratos de integracion entre frameworks (transformers, vLLM) y el checkpoint real.

El repositorio incluye los pesos reducidos, ejemplos de uso con Transformers y un directorio de expectativas de framework, todo ello generado por la herramienta `transformers-mic`. Los pesos son aleatorios (semilla 0) y no han sido entrenados; pasaron una puerta de sensibilidad de entrada que verifica que cada perturbacion de las entradas mueve los logits al menos 0,001. Los ficheros de procesador (tokenizer, generation config, special tokens) se copiaron byte a byte del modelo original.

Es relevante unicamente en el contexto de ingenieria de pruebas y validacion de integraciones: permite ejecutar pipelines de inferencia y comprobar compatibilidad de arquitectura `Gemma2ForCausalLM` sin cargar el checkpoint completo de 2B. Esta etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos. No debe emplearse en produccion ni para evaluacion de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma2ForCausalLM (transformer decoder-only, version reducida) |
| Parametros totales | 16.458.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de la config de gemma-2-2b-it, no verificada en la informacion) |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16; finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura es `Gemma2ForCausalLM`, la misma clase que el checkpoint original `google/gemma-2-2b-it`, pero con `num_hidden_layers` reducido a 2 mediante la regla generica de reduccion implementada en `sweep.py` del repositorio `transformers-mic`. Los nombres de tensores coinciden exactamente con los del checkpoint real, de modo que cualquier codigo que espere la estructura de Gemma 2 puede cargar el fixture sin cambios.

No hubo entrenamiento. Los pesos son aleatorios con semilla 0 y se validaron con una puerta de sensibilidad de entrada: cada perturbacion de las entradas del contrato mueve los logits al menos 0,001 (la mas debil, `input_ids:roll_batch`, produce 0,271). Los ficheros de procesador (`generation_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer.model`, `tokenizer_config.json`) se copiaron byte a byte del modelo original. El fixture se identifica con la clave `4f84c440641f` y cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras la reduccion.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios, por lo que no genera texto coherente ni razona.
- Sirve como fixture de integracion para validar la carga de arquitectura `Gemma2ForCausalLM` en Transformers y vLLM.
- Permite verificar contratos de entrada/salida (formas de tensores, dtypes, nombres de parametros) sin descargar el checkpoint de 2B.
- Compatible con ejecucion en float32, bfloat16 y float16 (forward, loss y gradientes finitos).
- Incluye directorio de expectativas de framework (`integrations/transformers/expectations`) para pruebas automatizadas.
- No dispone de tool calling, agentes, vision, audio ni capacidades multilingues reales.

## Casos de uso

- Pruebas de integracion en CI: cargar el fixture en lugar del checkpoint de 2B para validar que el pipeline de Transformers o vLLM acepta la arquitectura Gemma 2 sin consumir recursos de GPU.
- Validacion de contratos de framework: comprobar que las formas de tensores, dtypes y nombres de parametros coinciden con lo esperado por una version concreta de Transformers.
- Desarrollo de herramientas de reduccion de modelos: servir como referencia reproducible del resultado de `sweep.py` sobre `gemma-2-2b-it`.
- Pruebas de tokenizer: usar los ficheros de procesador copiados byte a byte para validar flujos de tokenizacion identicos al modelo original.
- Test de regresion de kernels: verificar que operaciones en float16, bfloat16 y float32 producen resultados finitos sobre la arquitectura Gemma 2.
- Validacion de pipelines de vLLM: comprobar la compatibilidad de configuracion y carga de un checkpoint Gemma 2 en entornos vLLM sin necesidad de GPU de gran capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (16,5 M de parametros), apto para CPU.
- GPU recomendadas: cualquier GPU consumer (GTX 1060 en adelante) o incluso ejecucion en CPU; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: Transformers (carga estandar), vLLM (segun la model card, compatible como fixture). No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture de pruebas, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-2-2b-it-vllm-mic | 16,5 M | no disponible | Fixture de pruebas | no disponible | Hugging Face |
| google/gemma-2-2b-it | ~2,6 B | no disponible en esta ficha | Modelo de chat real | Gemma Terms of Use | Hugging Face |
| Modelos de prueba tipo tiny-random | variable | no disponible | Fixtures de CI | variable | Hugging Face |

La comparativa relevante es exclusivamente con el checkpoint original `google/gemma-2-2b-it`, del que este fixture deriva. Frente a el, comparte arquitectura, tokenizer y nombres de tensores, pero reduce el numero de capas a 2 y sustituye los pesos entrenados por pesos aleatorios. No es comparable en calidad, rendimiento ni capacidades.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y no producen salidas coherentes.
- No debe emplearse en produccion, evaluacion de calidad ni generacion de contenido.
- La licencia no esta declarada en la informacion disponible; verificar los terminos del modelo base `google/gemma-2-2b-it` antes de cualquier uso.
- La longitud de contexto, los idiomas y los tipos de cuantizacion no estan documentados en la ficha.
- El repositorio es un artefacto temporal de la organizacion `huggingface-mic-temp`, con 0 descargas y 0 likes; puede ser eliminado sin aviso.
- Aunque los ficheros de procesador son identicos al modelo original, el comportamiento del modelo reducido no refleja el del checkpoint real.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no tratarlo como modelo base para fine-tuning.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic-temp/gemma-2-2b-it-vllm-mic
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de reduccion `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/gemma-2-2b-it-vllm-mic.html
