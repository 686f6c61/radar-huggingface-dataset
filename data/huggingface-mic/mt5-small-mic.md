# huggingface-mic/mt5-small-mic

## Resumen

`mt5-small-mic` es un artefacto de prueba publicado por la organizacion `huggingface-mic` en Hugging Face. No es un modelo entrenado ni utilizable para inferencia real: se trata de un "fixture" slim derivado de `google/mt5-small`, con pesos aleatorios (semilla 17) y una configuracion reducida a 2 capas de encoder y 2 de decoder. Su proposito es servir como banco de pruebas para validar integraciones de frameworks (concretamente Transformers) contra un checkpoint con la misma arquitectura, los mismos nombres de tensores y los mismos ficheros de procesador que el modelo original, pero con un coste de descarga y ejecucion minimo.

El repositorio incluye los pesos en safetensors (16.204.800 parametros, 0,1 GB), uso ejecutable de Transformers y un directorio de expectativas del framework, ademas de un manifiesto de contrato (`integration.json`) y la procedencia del fixture (`build.json`). La model card es explicita: esta etiquetado como `test-artifact` para excluirlo de las busquedas de modelos candidatos.

Por tanto, esta ficha debe leerse como documentacion de un fixture de test, no de un modelo de lenguaje. Cualquier evaluacion de capacidades, benchmarks o calidad de generacion carece de sentido: los pesos son aleatorios y no han sido entrenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer seq2seq (MT5ForConditionalGeneration), encoder-decoder |
| Parametros totales | 16.204.800 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32) |
| Idiomas soportados | no disponible (tokenizer mT5 copiado de google/mt5-small) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo replica la arquitectura `MT5ForConditionalGeneration` de `google/mt5-small`, pero con una configuracion reducida: `num_layers = 2` y `num_decoder_layers = 2`, aplicando la regla generica de reduccion de `sweep.py` del repositorio `huggingface/transformers-mic`. Los ficheros de procesador (`generation_config.json`, `special_tokens_map.json`, `spiece.model`, `tokenizer_config.json`) se copiaron byte a byte desde `google/mt5-small`, de modo que el tokenizer y la configuracion de generacion son identicos a los del modelo original.

No hubo entrenamiento. Los pesos se inicializaron de forma aleatoria con semilla 17 y se validaron con una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplazaba los logits al menos 0,001 (el caso mas debil, `input_ids:reverse`, dio 1,85). Los tensores conservan los mismos nombres que el checkpoint real y el modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La clave de fixture `d4db27680832` agrupa todos los checkpoints cuyos ficheros de procesador son byte-identicos y cuya config coincide tras la reduccion.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen texto coherente.
- Sirve como fixture de test para validar la carga de `MT5ForConditionalGeneration` en Transformers.
- Permite comprobar la compatibilidad de nombres de tensores y ficheros de procesador con `google/mt5-small`.
- Verifica el comportamiento del framework en float32, bfloat16 y float16 (forward, loss y gradientes).
- No soporta tool calling, agentes, vision, audio ni modos de razonamiento.
- No tiene capacidades multilingues reales pese a heredar el tokenizer de mT5.

## Casos de uso

- Pruebas de integracion en CI: usar el fixture para validar que una version de Transformers carga correctamente un checkpoint seq2seq sin descargar el modelo completo de 300M parametros.
- Validacion de pipelines de conversion: comprobar que las herramientas de conversion (por ejemplo, a otros formatos o dtypes) manejan los nombres de tensores y la configuracion esperados.
- Test de sensibilidad a la entrada: reproducir la puerta de sensibilidad descrita en `build.json` para verificar que el flujo de inferencia propaga correctamente las perturbaciones.
- Verificacion de compatibilidad de tokenizer: al copiar `spiece.model` byte a byte, permite testear el pipeline de tokenizacion de mT5 sin el checkpoint real.
- Pruebas de dtypes mixtos: validar que el framework ejecuta forward, loss y backward en float32, bfloat16 y float16 sin valores no finitos.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture mt5-small-mic` y comparar hashes con `build.json`.
- Desarrollo de herramientas de inspeccion de modelos: banco de pruebas ligero para utilidades que leen safetensors y configuraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K, BLEU) seria irrelevante.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (16,2M parametros); el repositorio ocupa 0,1 GB.
- GPU recomendadas: no requiere GPU; ejecutable en CPU sin problema.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU con suficiente memoria compartida.
- Opciones de despliegue: Transformers (uso previsto y documentado en `integrations/transformers/usage.md`); llama.cpp, Ollama, vLLM o TGI no estan documentados para este artefacto.
- Latencia y throughput: no disponibles; al ser un modelo de 2+2 capas, la inferencia es practicamente instantanea en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/mt5-small-mic` | 16,2M | no disponible | Fixture de test | no disponible | Hugging Face |
| `google/mt5-small` | ~300M | 512 tokens (por defecto en mT5) | Modelo seq2seq multilingue entrenado | Apache 2.0 | Hugging Face |
| `google/mt5-base` | ~580M | 512 tokens (por defecto en mT5) | Modelo seq2seq multilingue entrenado | Apache 2.0 | Hugging Face |

La comparacion con `google/mt5-small` y `google/mt5-base` es solo estructural: el fixture comparte arquitectura y tokenizer, pero carece de entrenamiento. No es un sustituto funcional de ninguno de ellos.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la salida no tiene sentido linguistico.
- Etiquetado explicitamente como `test-artifact`; no debe incluirse en busquedas de modelos candidatos ni en produccion.
- La licencia no esta declarada en la informacion disponible; verificar antes de cualquier redistribucion.
- El contexto maximo no esta documentado para esta configuracion reducida.
- Los idiomas soportados no estan declarados; el tokenizer es el de mT5, pero el modelo no ha aprendido ninguna lengua.
- No hay garantia de que la configuracion reducida reproduzca el comportamiento numerico del checkpoint original mas alla de la forma de los tensores.
- Uso comercial: no recomendado ni documentado; al no haber licencia explicita, se aplican las condiciones por defecto de Hugging Face y del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/mt5-small-mic
- Modelo base: https://huggingface.co/google/mt5-small
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/mt5-small-mic.html
