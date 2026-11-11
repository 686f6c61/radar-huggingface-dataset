# huggingface-mic/LCO-Embedding-Omni-3B-mic

## Resumen

LCO-Embedding-Omni-3B-mic es un artefacto de prueba publicado por la cuenta `huggingface-mic` en Hugging Face. No se trata de un modelo entrenado ni utilizable en produccion, sino de un "fixture" reducido que replica la arquitectura y los ficheros de procesador del modelo real `LCO-Embedding/LCO-Embedding-Omni-3B` para validar integraciones con Transformers. La propia model card lo etiqueta explicitamente como `test-artifact` y advierte de que "no es un modelo usable".

El fixture conserva la clase de arquitectura `Qwen2_5OmniThinkerForConditionalGeneration`, pero con una configuracion drasticamente reducida: 2 capas en el encoder de audio y 2 capas en el transformer de texto. Los pesos son aleatorios (semilla 17) y no han pasado por ningun proceso de entrenamiento; solo superaron un test de sensibilidad a la entrada que exigia que cada perturbacion de los inputs moviera los logits al menos 0,001.

Su relevancia es puramente de ingenieria: sirve como caso de prueba reproducible para frameworks (Transformers, Sentence Transformers) y para verificar que una integracion concreta carga, ejecuta y propaga gradientes correctamente sobre la arquitectura del modelo omni real, sin necesidad de descargar los pesos completos de 3B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2_5OmniThinkerForConditionalGeneration (config reducida: audio encoder_layers=2, text num_hidden_layers=2) |
| Parametros totales | 21.121.152 (21,1 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture reproduce la topologia de `Qwen2_5OmniThinkerForConditionalGeneration`, el componente "thinker" del modelo omni de Qwen 2.5, con un encoder de audio y un transformer de texto. La configuracion se ha reducido mediante la regla generica de `sweep.py` del repositorio `transformers-mic`, dejando 2 capas en cada bloque. Los nombres de tensores coinciden exactamente con los del checkpoint real, de modo que cualquier codigo que cargue el modelo original deberia cargar el fixture sin cambios de API.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron con un "input-sensitivity gate": cada perturbacion de las entradas del contrato debia mover los logits al menos 0,001; el caso mas debil (`attention_mask:all_ones`) produjo un desplazamiento de 0,893. Los ficheros de procesador (`tokenizer.json`, `tokenizer_config.json`, `chat_template.jinja`, `preprocessor_config.json`, `merges.txt`, `vocab.json`, entre otros) se copiaron byte a byte desde `LCO-Embedding/LCO-Embedding-Omni-3B`. Los pesos se guardaron en bfloat16 y se verifico que el forward, la loss y los gradientes son finitos en float32, bfloat16 y float16.

## Capacidades

- Carga y ejecucion de la arquitectura `Qwen2_5OmniThinkerForConditionalGeneration` en Transformers.
- Verificacion de contratos de integracion (manifiesto `integration.json`, expectativas en `integrations/transformers/expectations`).
- Pruebas de forward pass, calculo de loss y retropropagacion de gradientes.
- Validacion de ficheros de procesador (tokenizer, chat template, preprocessor) copiados del modelo real.
- Comprobacion de compatibilidad con Sentence Transformers (se incluyen `config_sentence_transformers.json`, `modules.json`, `sentence_bert_config.json`).
- No genera texto, no razona, no hace tool calling ni soporta agentes: los pesos son aleatorios.

## Casos de uso

- Pruebas de integracion en CI: cargar el fixture en un pipeline de GitHub Actions para verificar que una nueva version de Transformers sigue soportando la arquitectura omni sin descargar los 3B parametros reales.
- Desarrollo de wrappers y librerias: validar la API de carga, tokenizacion y forward contra un checkpoint ligero antes de apuntar al modelo real `LCO-Embedding-Omni-3B`.
- Test de regresion de tokenizer y chat template: al copiarse byte a byte del modelo original, permite comprobar que los cambios en el procesador no rompen el contrato.
- Validacion de mixed precision: el fixture es finito en float32, bfloat16 y float16, por lo que sirve para probar rutas de autocast y gradientes en distintas precisiones.
- Verificacion de nombres de tensores: util para herramientas que inspeccionan `state_dict` o convierten pesos entre frameworks sin cargar el checkpoint completo.
- Reproducibilidad de fixtures: el repo documenta `build_fixtures.py` y `build.json` con hashes, permitiendo regenerar el artefacto y auditar su procedencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K, MTEB) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (21,1 M parametros, ~42 MB de pesos); el repo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) e incluso CPU es suficiente.
- Cabe holgadamente en cualquier GPU consumer; tambien en entornos sin GPU.
- Opciones de despliegue: Transformers (via `AutoModel`/`Qwen2_5OmniThinkerForConditionalGeneration`), Sentence Transformers. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; irrelevantes para un fixture de test.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia |
|---|---|---|---|---|
| LCO-Embedding-Omni-3B-mic (este) | 21,1 M | no disponible | Fixture de test | no disponible |
| LCO-Embedding/LCO-Embedding-Omni-3B | ~3B (nominal) | no disponible | Embedding omni real | no disponible |
| Qwen2.5-Omni-3B (familia base) | ~3B | no disponible | Modelo omni multimodal | no disponible |

La comparativa directa con alternativas de la misma categoria no aplica: el fixture no compite con modelos de embedding reales, sino que replica su contrato para pruebas. Cualquier comparacion de rendimiento con `LCO-Embedding-Omni-3B` u otros modelos omni resultaria enganosa.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y las salidas no tienen significado.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- La model card advierte explicitamente de que "no es un modelo usable".
- Sin licencia declarada: no se puede asumir permiso de uso comercial ni redistribucion.
- Sin informacion sobre sesgos, idiomas o alucinacion: no aplica al no haber entrenamiento.
- La configuracion reducida (2 capas) no representa el comportamiento del modelo real de 3B; no extrapolar resultados.
- El nombre del repo sugiere "3B" pero el artefacto real tiene 21,1 M parametros; conviene no confundirlos.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/LCO-Embedding-Omni-3B-mic
- Modelo base real: https://huggingface.co/LCO-Embedding/LCO-Embedding-Omni-3B
- Como se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/LCO-Embedding-Omni-3B-mic.html
- Repositorio de herramientas: https://github.com/huggingface/transformers-mic
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
