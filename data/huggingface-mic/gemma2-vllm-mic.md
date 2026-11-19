# huggingface-mic/gemma2-vllm-mic

## Resumen

`gemma2-vllm-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic` en Hugging Face. No es un modelo usable: se trata de una version "adelgazada" (slim) del checkpoint `google/gemma-2-2b-it` construida para validar contratos de integracion con frameworks de inferencia, en este caso vLLM. El repositorio empaqueta pesos reducidos, ejemplos de uso con Transformers y un manifest de expectativas de framework (`integration.json`), de modo que las herramientas de integracion puedan ejecutarse de extremo a extremo sin descargar los pesos completos del modelo original.

El fixture conserva la arquitectura `Gemma2ForCausalLM` pero reduce el numero de capas ocultas a 2, lo que deja un total de 16.458.304 parametros (frente a los aproximadamente 2.600 millones del modelo base). Los pesos son aleatorios (semilla 0), no entrenados, y se han validado con una puerta de sensibilidad de entrada: cualquier perturbacion de las entradas mueve los logits al menos 0,001. Los ficheros de procesador (tokenizer, generation config, special tokens) se copian byte a byte del modelo original.

Su relevancia es puramente de ingenieria: sirve para probar pipelines de integracion, CI y validacion de contratos con vLLM y Transformers sin coste de almacenamiento ni de computo. Esta etiquetado como `test-artifact` precisamente para excluirlo de busquedas de modelos candidatos. No debe emplearse para inferencia real, generacion de texto ni evaluacion de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma2ForCausalLM (transformer decoder-only), configuracion reducida a 2 capas ocultas |
| Parametros totales | 16.458.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de la config del modelo base, no verificada en el fixture) |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |
| Modelo base | google/gemma-2-2b-it |
| Tamano del repositorio | 0,1 GB |
| Semilla de pesos | 0 (aleatorios, sin entrenamiento) |
| Fecha de creacion | 2026-11-19 |

## Arquitectura y entrenamiento

El fixture replica la arquitectura `Gemma2ForCausalLM` del modelo base, pero con `num_hidden_layers` reducido a 2 mediante la regla generica de reduccion implementada en `sweep.py` del repositorio `transformers-mic`. Los nombres de tensores coinciden exactamente con los del checkpoint real, de modo que las herramientas que esperan la estructura de Gemma 2 pueden cargarlo sin adaptaciones. Los ficheros de procesador (`generation_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer.model`, `tokenizer_config.json`) se copian byte a byte desde `google/gemma-2-2b-it`.

No hubo entrenamiento: los pesos son aleatorios con semilla 0. Para garantizar que el fixture es util como prueba de integracion, se aplico una puerta de sensibilidad de entrada que exige que toda perturbacion de las entradas produzca un cambio en los logits de al menos 0,001; la perturbacion mas debil (`input_ids:roll_batch`) produjo 0,271. El modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La clave de fixture `4f84c440641f` agrupa todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras la reduccion.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no se ha realizado entrenamiento, por lo que no genera texto coherente ni resuelve tareas.
- Sirve como fixture de integracion para validar la carga del modelo, el tokenizer y el pipeline de inferencia en vLLM y Transformers.
- Permite verificar contratos de framework recogidos en `integration.json` y en el directorio `integrations/transformers/expectations`.
- Compatible con la API de `Gemma2ForCausalLM` (mismos nombres de tensores que el checkpoint real).
- Ejecutable en float32, bfloat16 y float16 (forward, loss y gradientes finitos).
- No dispone de tool calling, agentes, vision, audio ni modo thinking utilizables, al no haber sido entrenado.
- Multilingue solo en la medida en que el tokenizer copiado del modelo base lo permita; sin capacidades reales de generacion.

## Casos de uso

- Pruebas de integracion con vLLM: cargar el fixture para validar que la ruta de carga de Gemma 2, el reparto de pesos y la configuracion de vLLM funcionan antes de pasar al checkpoint completo de 2B.
- CI/CD de frameworks de inferencia: ejecutar tests de humo en pipelines de integracion continua con un artefacto de 0,1 GB en lugar de descargar varios GB del modelo real.
- Validacion de contratos de framework: comprobar que las expectativas declaradas en `integration.json` y en `integrations/transformers/expectations` se cumplen sobre un modelo con la misma estructura de tensores.
- Desarrollo de herramientas de reduccion de modelos: usar el fixture como caso de referencia para probar `sweep.py` y `build_fixtures.py` sobre nuevas arquitecturas.
- Pruebas de tokenizer y preprocesado: al copiar los ficheros de procesador byte a byte del modelo base, permite validar pipelines de tokenizacion sin cargar los pesos completos.
- Verificacion de dtypes: comprobar que un pipeline dado maneja correctamente bfloat16, float16 y float32 sobre un modelo Gemma 2 sin coste de memoria.
- Reproducibilidad de artefactos: `build.json` registra fuentes fijadas, resultados de la puerta de sensibilidad y hashes de ficheros, lo que permite auditar y reconstruir el fixture.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier metrica de calidad (MMLU, HumanEval, GSM8K u otras) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (16,5 M de parametros, ~33 MB de pesos) mas overhead de activaciones y del runtime; el repositorio ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU para pruebas de humo.
- Opciones de despliegue: vLLM (objetivo declarado del fixture), Transformers, y en general cualquier runtime capaz de cargar safetensors con arquitectura Gemma 2.
- Latencia y throughput: no disponibles; al ser un fixture de test no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/gemma2-vllm-mic | 16,5 M (2 capas) | no disponible | Fixture de test para integracion vLLM | no disponible | Hugging Face |
| google/gemma-2-2b-it | ~2,6 B | no disponible en la informacion | Modelo instructivo real | Gemma Terms of Use (segun el modelo base) | Hugging Face |
| google/gemma-2-9b-it | ~9 B | no disponible en la informacion | Modelo instructivo real | Gemma Terms of Use (segun el modelo base) | Hugging Face |

La comparacion relevante es con el propio modelo base: el fixture reduce el numero de capas a 2 y los parametros a 16,5 M, mantiene la estructura de tensores y el procesador, y sustituye los pesos entrenados por pesos aleatorios. No es un sustituto funcional de Gemma 2 en ninguna tarea de inferencia real.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y no han sido entrenados; la salida no tiene valor semantico.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- La licencia no esta declarada en la informacion disponible; antes de cualquier uso conviene verificar la licencia del modelo base (`google/gemma-2-2b-it`, sujeto a Gemma Terms of Use).
- El contexto, los idiomas y las capacidades reales no estan documentados para el fixture; cualquier dato heredado del modelo base debe verificarse contra su model card.
- Riesgo de confusion: el nombre puede sugerir un modelo Gemma 2 funcional; conviene revisar la etiqueta `test-artifact` y el campo `base_model` antes de integrarlo.
- No se han publicado benchmarks ni mediciones de latencia o throughput; no extrapolar rendimiento del modelo base.
- La fecha de creacion indicada (2026-11-19) y el estado de descargas y likes (0) reflejan que es un artefacto reciente y sin adopcion publica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/gemma2-vllm-mic
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- Manifest de contrato (referenciado en la model card): `integration.json` en el repositorio
- Uso con Transformers (referenciado): `integrations/transformers/usage.md`
- Expectativas de Transformers (referenciado): `integrations/transformers/expectations`
- Procedencia del fixture (referenciado): `build.json`
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/gemma2-vllm-mic.html
- Repositorio `transformers-mic` (referenciado): https://github.com/huggingface/transformers-mic
- Script de reduccion `sweep.py` (referenciado): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion `build_fixtures.py` (referenciado): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
