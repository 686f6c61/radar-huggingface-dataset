# huggingface-mic-temp/internvl-vllm-mic

## Resumen

`internvl-vllm-mic` es un artefacto de prueba (fixture) publicado por el usuario `huggingface-mic-temp` en Hugging Face. No se trata de un modelo utilizable, sino de una version reducida artificialmente del modelo multimodal `OpenGVLab/InternVL3-1B-hf`, generada para validar la integracion de InternVL con frameworks de inferencia y con las expectativas de contrato definidas en el repositorio `transformers-mic`. El propio autor lo etiqueta como `test-artifact` y advierte explicitamente de que no es un modelo usable.

El fixture conserva la arquitectura `InternVLForConditionalGeneration` del modelo original, pero reduce la configuracion a 2 capas en el codificador visual y 2 capas en el modelo de lenguaje, dando un total de 9.973.120 parametros. Los pesos son aleatorios (semilla 17), en bfloat16, y los ficheros del procesador y del tokenizador se copiaron byte a byte desde el checkpoint original para garantizar que el pipeline de preprocesado sea identico al real.

Su relevancia es puramente de ingenieria: sirve como banco de pruebas ligero para verificar que la carga de pesos, el flujo de `pixel_values`, la tokenizacion y la sensibilidad de las entradas funcionan segun el contrato esperado antes de ejecutar pruebas costosas contra el checkpoint completo de 1B parametros. No debe evaluarse como modelo de produccion ni utilizarse para inferencia real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | InternVLForConditionalGeneration (vision encoder + LLM, transformer multimodal) |
| Parametros totales | 9.973.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo replica la arquitectura del checkpoint base `OpenGVLab/InternVL3-1B-hf`: un codificador visual acoplado a un modelo de lenguaje bajo la clase `InternVLForConditionalGeneration`. La version fixture aplica la regla generica de reduccion de `sweep.py` del proyecto `transformers-mic`, dejando `vision num_hidden_layers = 2` y `text num_hidden_layers = 2`. Los nombres de tensores coinciden exactamente con los del checkpoint real, de modo que cualquier codigo que cargue el modelo original puede cargar el fixture sin cambios en el mapeo de pesos.

No hubo entrenamiento. Los pesos se inicializaron aleatoriamente con semilla 17 y se validaron mediante una puerta de sensibilidad a las entradas: cada perturbacion de las entradas del contrato desplazo los logits al menos 0,001 (la mas debil, `pixel_values:halve`, produjo 0,00977). Los ficheros de procesador y tokenizador (`tokenizer.json`, `tokenizer_config.json`, `vocab.json`, `merges.txt`, `preprocessor_config.json`, `processor_config.json`, `chat_template.jinja`, `special_tokens_map.json`, `added_tokens.json`, `generation_config.json`) se copiaron byte a byte desde el modelo original. Los pesos son finitos en float32, bfloat16 y float16 tanto en forward como en calculo de perdida y gradientes.

## Capacidades

- Carga y ejecucion del pipeline multimodal de InternVL con nombres de tensores identicos al checkpoint real.
- Verificacion de contratos de integracion para frameworks (por ejemplo, vLLM) mediante el manifiesto `integration.json`.
- Pruebas de sensibilidad de entradas sobre `pixel_values` y tokens de texto.
- Validacion de ficheros de procesador y tokenizador copiados del modelo base.
- Ejecucion en float32, bfloat16 y float16 sin valores no finitos.
- No dispone de capacidades generativas reales: los pesos son aleatorios y no producen texto ni descripciones coherentes.

## Casos de uso

- Pruebas de integracion en CI: ejecutar el fixture en pipelines de integracion continua para verificar que la carga de `InternVLForConditionalGeneration` y el mapeo de tensores no se rompen tras cambios en el codigo, sin necesidad de descargar el checkpoint de 1B.
- Validacion de contrato en vLLM: comprobar que el framework acepta la configuracion, el procesador y los nombres de tensores del modelo antes de desplegar el checkpoint real.
- Desarrollo de adaptadores de tokenizacion: al copiarse los ficheros de tokenizer byte a byte, sirve para depurar plantillas de chat y preprocesado de imagen sin coste de computo.
- Pruebas de regresion de preprocesado visual: verificar que perturbaciones en `pixel_values` producen cambios medibles en los logits, detectando roturas en el pipeline de vision.
- Validacion de dtypes: comprobar que el codigo de carga funciona en float32, bfloat16 y float16 antes de pasar al modelo completo.
- Documentacion y ejemplos de integracion: usar el fixture en tutoriales y tests de repositorios que necesiten un modelo InternVL ligero y reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier metrica de calidad (MMLU, HumanEval, GSM8K, etc.) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con 9,97 M de parametros en bfloat16 (aproximadamente 20 MB de pesos) mas overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; tambien ejecutable en CPU.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: `transformers` (segun `integrations/transformers/usage.md`), vLLM (objetivo declarado del fixture) y cualquier runtime compatible con safetensors.
- Latencia y throughput: no disponibles; al ser un fixture, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia |
|---|---|---|---|---|
| internvl-vllm-mic | 9,97 M | no disponible | Fixture de prueba | no disponible |
| OpenGVLab/InternVL3-1B-hf | ~1 B | no disponible | Modelo multimodal real | no disponible |
| Otros fixtures de transformers-mic | variable (reducidos) | no disponible | Pruebas de integracion | no disponible |

La comparativa relevante es con su modelo base: el fixture conserva la arquitectura y los ficheros de procesado, pero sustituye los pesos entrenados por pesos aleatorios y reduce las capas. No es un sustituto funcional del checkpoint original en ninguna tarea de calidad.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y las salidas no tienen significado.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos.
- Licencia no especificada en la informacion disponible; no debe asumirse uso comercial.
- Sin datos de idiomas soportados ni de contexto maximo.
- No se han publicado benchmarks ni evaluaciones de sesgo o alucinacion.
- El repositorio tiene 0 descargas y 0 likes, lo que refleja su naturaleza de artefacto interno.
- Cualquier resultado de inferencia obtenido con este fixture no es extrapolable al modelo `InternVL3-1B-hf`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic-temp/internvl-vllm-mic
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3-1B-hf
- Manifiesto de contrato (`integration.json`): https://huggingface.co/huggingface-mic-temp/internvl-vllm-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic-temp/internvl-vllm-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic-temp/internvl-vllm-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture (`build.json`): https://huggingface.co/huggingface-mic-temp/internvl-vllm-mic/blob/main/build.json
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/internvl-vllm-mic.html
- Repositorio `transformers-mic` (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
