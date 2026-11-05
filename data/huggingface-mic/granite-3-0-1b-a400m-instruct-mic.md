# huggingface-mic/granite-3.0-1b-a400m-instruct-mic

## Resumen

`huggingface-mic/granite-3.0-1b-a400m-instruct-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic` dentro del proyecto de cobertura de integraciones de Transformers. No es un modelo entrenado ni utilizable para inferencia real: se trata de una version reducida del checkpoint `ibm-granite/granite-3.0-1b-a400m-instruct` de IBM, con solo 3.367.936 parametros (frente a los aproximadamente 1.300 millones del modelo original, de los cuales 400 millones son activos por token en su arquitectura MoE).

El fixture conserva la arquitectura `GraniteMoeForCausalLM` y los mismos nombres de tensores que el checkpoint de referencia, pero reduce la configuracion a 2 capas (`num_hidden_layers: 2`) y rellena los pesos con valores aleatorios generados con semilla 17. Los ficheros del procesador (tokenizer, `merges.txt`, `vocab.json`, `special_tokens_map.json`, `generation_config.json`) se copian byte a byte del modelo original, de modo que el pipeline de tokenizacion es identico.

Su relevancia es puramente de ingenieria: sirve para validar que las integraciones de frameworks (en este caso Transformers) cargan, ejecutan y producen salidas sensibles a la entrada con la arquitectura Granite MoE, sin necesidad de descargar ni ejecutar el modelo completo. Esta etiquetado como `test-artifact` precisamente para excluirlo de busquedas de modelos candidatos en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GraniteMoeForCausalLM (transformer MoE, reducido a 2 capas) |
| Parametros totales | 3.367.936 |
| Parametros activos | no disponible (el modelo base declara 400M activos, el fixture no especifica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es una instancia reducida de `GraniteMoeForCausalLM`, la arquitectura de mezcla de expertos de la familia Granite de IBM. La reduccion se aplica mediante la regla generica de `sweep.py` del repositorio `transformers-mic`, que fija `num_hidden_layers` a 2 y conserva la nomenclatura exacta de tensores del checkpoint original. Los pesos son aleatorios (semilla 17) y no han pasado por ningun proceso de entrenamiento, RLHF ni DPO.

El unico criterio de calidad aplicado es una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato debe mover los logits al menos 0.001. La perturbacion mas debil (`attention_mask:all_ones`) produjo un desplazamiento de 0.0217, por lo que el fixture se considero valido sin necesidad de entrenamiento. Se verifico que el forward, la loss y los gradientes son finitos en float32, bfloat16 y float16, y que el modelo se guarda en bfloat16, el dtype por defecto del checkpoint de IBM.

## Capacidades

- No es un modelo funcional: no genera texto coherente, no razona y no responde a instrucciones.
- Sirve como fixture de integracion para validar la carga de la arquitectura Granite MoE en Transformers.
- Permite comprobar la sensibilidad de las salidas a perturbaciones de las entradas (attention mask, input ids, etc.).
- Reutiliza el tokenizer y los ficheros de procesamiento del modelo base, por lo que valida el pipeline de tokenizacion completo.
- No soporta tool calling, agentes, vision ni audio de forma real.
- No tiene capacidades multilingues verificadas.

## Casos de uso

- Pruebas de integracion en CI: cargar el fixture con `AutoModelForCausalLM` y verificar que la arquitectura `GraniteMoeForCausalLM` se instancia sin errores en cada version de Transformers.
- Validacion de contratos de framework: ejecutar el forward con las entradas definidas en `integration.json` y comprobar que los logits cambian ante perturbaciones minimas.
- Pruebas de dtype: verificar que el modelo es finito en float32, bfloat16 y float16, util para detectar regresiones numericas en kernels de atencion.
- Desarrollo de harness de evaluacion: usar el fixture como sustituto ligero del checkpoint real para iterar rapido en scripts de evaluacion sin consumir GPU.
- Regresion de tokenizer: al copiar los ficheros del procesador byte a byte, permite detectar cambios inesperados en el pipeline de tokenizacion del modelo base.
- Documentacion de expectativas: el directorio `integrations/transformers/expectations` sirve como referencia ejecutable de lo que un framework debe producir con esta arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en bfloat16 (3,4 M de parametros), ejecutable en CPU sin problema.
- GPU recomendadas: cualquiera, incluidas GPUs integradas; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer, incluso en las de gama baja.
- Opciones de despliegue: Transformers (via `AutoModelForCausalLM`), suficiente con CPU. No se recomienda vLLM, llama.cpp ni Ollama porque el modelo no genera texto util.
- Latencia y throughput: no disponibles; irrelevantes para un fixture.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia |
|---|---|---|---|---|
| granite-3.0-1b-a400m-instruct-mic (este) | 3,4 M | no disponible | Fixture de test | no disponible |
| ibm-granite/granite-3.0-1b-a400m-instruct | ~1.300 M (400 M activos) | no disponible en esta ficha | Modelo instructivo real | Apache 2.0 (segun el modelo base) |
| Otros fixtures de transformers-mic | variable (reducidos) | no disponible | Validacion de integraciones | no disponible |

La comparativa solo tiene sentido frente al modelo base del que deriva; frente a modelos de produccion de tamano similar no es comparable porque no ejecuta tareas reales.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas no tienen significado.
- Etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.
- No debe desplegarse en produccion bajo ninguna circunstancia.
- La licencia no esta declarada en la informacion disponible; hay que remitirse al modelo base `ibm-granite/granite-3.0-1b-a400m-instruct` para cualquier uso derivado.
- El contexto, los idiomas y las capacidades del modelo base no se heredan de forma funcional en el fixture.
- Riesgo de confusion: el nombre incluye "instruct", pero el artefacto no sigue instrucciones.

## Enlaces

- HuggingFace: https://huggingface.co/huggingface-mic/granite-3.0-1b-a400m-instruct-mic
- Modelo base: https://huggingface.co/ibm-granite/granite-3.0-1b-a400m-instruct
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de reduccion (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/granite-3.0-1b-a400m-instruct-mic.html
