# huggingface-mic/embeddinggemma-2-mic

## Resumen

`embeddinggemma-2-mic` es un artefacto de prueba (fixture) publicado por el usuario `huggingface-mic`, derivado del modelo `google/embeddinggemma-2`. No es un modelo entrenado ni utilizable para producir embeddings reales: sus pesos son aleatorios (semilla 17) y su configuracion ha sido reducida deliberadamente para que sirva como banco de pruebas de integracion en el ecosistema Transformers. El repositorio empaqueta pesos reducidos, ejemplos de uso y un directorio de expectativas de framework para validar contratos de integracion.

El modelo conserva la arquitectura `EmbeddingGemma2Model` del checkpoint original, pero con solo 2 capas en cada torre (texto, vision y audio), lo que reduce el total a 19.313.506 parametros y un tamano de repo de 0,1 GB. Los ficheros de procesador (tokenizer, chat template, preprocessor config y demas) se copian byte a byte desde el modelo base, de modo que el pipeline de preprocesamiento es identico al real.

Su relevancia es operativa, no de rendimiento: permite a desarrolladores e investigadores ejecutar tests de integracion, comprobar la sensibilidad de entradas y validar contratos de framework sin descargar el checkpoint completo. Esta etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EmbeddingGemma2Model (encoder multimodal con torres de texto, vision y audio) |
| Parametros totales | 19.313.506 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo reproduce la arquitectura `EmbeddingGemma2Model` del checkpoint `google/embeddinggemma-2`, un encoder disenado para generar embeddings con tres torres especializadas: texto, vision y audio. La version fixture aplica la regla generica de reduccion de `sweep.py`, fijando `num_hidden_layers` a 2 en cada una de las tres torres. Los nombres de tensores son identicos a los del checkpoint real, lo que permite intercambiar pesos sin cambiar el codigo de carga.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se aceptaron tras superar una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, lo hace en 0,17). Los ficheros de procesador (`chat_template.jinja`, `tokenizer.json`, `tokenizer.model`, `tokenizer_config.json`, `preprocessor_config.json`, `processor_config.json`, `modules.json`, `sentence_bert_config.json`, `config_sentence_transformers.json`) se copian byte a byte del modelo base. El artefacto es finito en float32, bfloat16 y float16 tanto en forward como en perdida y gradientes, y se guarda en bfloat16, el dtype por defecto de carga del modelo original.

## Capacidades

- Ejecucion de forward pass con la misma firma y nombres de tensores que `google/embeddinggemma-2`.
- Validacion de contratos de integracion en Transformers mediante el manifiesto `integration.json` y el directorio `integrations/transformers/expectations`.
- Pruebas de sensibilidad de entradas (perturbacion de `input_ids` y `attention_mask`) contra los logits esperados.
- Verificacion de compatibilidad de tokenizer y processor con los ficheros del modelo real.
- Comprobacion de estabilidad numerica en float32, bfloat16 y float16.
- No genera embeddings utiles: los pesos son aleatorios y no codifican informacion semantica.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto.

## Casos de uso

- Tests de integracion en CI: ejecutar el fixture en la suite de pruebas de Transformers para verificar que la clase `EmbeddingGemma2Model` carga, hace forward y devuelve tensores con las formas esperadas, sin descargar el checkpoint completo.
- Validacion de contratos de framework: usar `integration.json` e `integrations/transformers/expectations` para comprobar que una nueva version del framework sigue cumpliendo las expectativas de entrada y salida del modelo.
- Desarrollo de pipelines de preprocesamiento: al copiar los ficheros de tokenizer y processor byte a byte, sirve para depurar la logica de tokenizacion y preprocesamiento multimodal sin coste de descarga.
- Pruebas de estabilidad numerica: verificar que el codigo de inferencia funciona en float32, bfloat16 y float16 con gradientes finitos antes de pasar al modelo real.
- Reproduccion de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture embeddinggemma-2-mic` para auditar hashes y fuentes fijadas en `build.json`.
- Formacion de nuevos contribuidores: entorno ligero (0,1 GB) para que desarrolladores aprendan el flujo de integracion de modelos multimodales en Transformers sin infraestructura pesada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad de embedding careceria de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (19,3 M de parametros, unos 38 MB de pesos).
- GPU recomendadas: cualquier GPU con soporte bfloat16; tambien funciona en CPU.
- Cabe en cualquier GPU consumer, incluida una GTX 1650 o una iGPU moderna; el cuello de botella es el lanzamiento de kernels, no la memoria.
- Opciones de despliegue: Transformers (carga estandar de `EmbeddingGemma2Model`); no se documenta soporte especifico para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas por torre, la latencia sera muy inferior a la del modelo real, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/embeddinggemma-2-mic | 19,3 M | no disponible | Fixture de test | no disponible | Hugging Face |
| google/embeddinggemma-2 | no disponible | no disponible | Embeddings multimodales reales | no disponible | Hugging Face |
| Otros fixtures de transformers-mic | variable (reducidos) | no disponible | Tests de integracion | no disponible | Hugging Face (org huggingface-mic) |

La comparacion relevante es con el modelo base: misma arquitectura y mismos ficheros de procesador, pero con 2 capas por torre frente a la profundidad completa y pesos aleatorios frente a pesos entrenados. Frente a otros fixtures de la misma organizacion, comparte el proposito de validacion de contratos, aunque la informacion disponible no detalla sus tamanos.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y los embeddings resultantes no tienen significado semantico.
- Etiquetado `test-artifact` de forma explicita para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- La licencia no esta declarada en la informacion disponible; hay que remitirse al modelo base `google/embeddinggemma-2` para conocer las condiciones de uso.
- La configuracion reducida (2 capas por torre) no reproduce el comportamiento numerico ni el rendimiento del checkpoint real.
- Los idiomas soportados no estan documentados; los ficheros de tokenizer se heredan del modelo base, pero no se garantiza cobertura linguistica.
- La longitud de contexto no esta disponible en la informacion proporcionada.
- No se documentan sesgos ni tasas de alucinacion porque el modelo no genera texto; cualquier evaluacion de calidad es inaplicable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/embeddinggemma-2-mic
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Como se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/embeddinggemma-2-mic.html
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Manifiesto de contrato: `integration.json` (en el repositorio)
- Uso en Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
- Procedencia del fixture: `build.json` (en el repositorio)
