# huggingface-mic/A.X-K1-mic

## Resumen

A.X-K1-mic es un artefacto de prueba (fixture) publicado por el usuario huggingface-mic, no un modelo entrenado utilizable. Se trata de una version reducida artificialmente del modelo skt/A.X-K1, con solo 21.048.000 parametros, creada para validar contratos de integracion con frameworks (concretamente Transformers) sin necesidad de descargar ni ejecutar el checkpoint completo. El autor lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

El fixture conserva la misma arquitectura declarada (`AXK1ForCausalLM`), los mismos nombres de tensores que el checkpoint real y los ficheros de procesador copiados byte a byte (tokenizer, chat template, generation config, special tokens map). Los pesos, sin embargo, son aleatorios (semilla 17) y no han pasado por entrenamiento alguno; solo superaron una puerta de sensibilidad a la entrada que verificaba que las perturbaciones en las entradas movieran los logits al menos 0,001.

Su relevancia es por tanto puramente de ingenieria: sirve para que los mantenedores de transformers-mic comprueben que la carga, la ejecucion y las expectativas de framework funcionan sobre la familia A.X-K1 sin coste de computo ni de almacenamiento (0,1 GB frente al modelo original). No debe emplearse para inferencia real, evaluacion de calidad ni despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AXK1ForCausalLM (transformer causal, variante MoE segun los tensores `mlp.gate` del checkpoint base) |
| Parametros totales | 21.048.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es una version reducida del checkpoint skt/A.X-K1 mediante la regla generica de `sweep.py` del repositorio transformers-mic, que reduce `num_hidden_layers` a 2. Mantiene la clase `AXK1ForCausalLM` y los mismos nombres de tensores que el modelo original, salvo los sesgos de correccion del router (`mlp.gate.e_score_correction_bias`) que el checkpoint real tampoco incluye en las capas 1 a 60. La presencia de tensores `mlp.gate` en el checkpoint base sugiere una arquitectura de mezcla de expertos, aunque el fixture no conserva suficientes capas para reproducir ese comportamiento.

No hubo entrenamiento. Los pesos se inicializaron aleatoriamente con semilla 17 y se validaron con una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato debia mover los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, dio 0,228). Los ficheros de procesador (`chat_template.jinja`, `generation_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`) se copiaron byte a byte desde skt/A.X-K1. El modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes.

## Capacidades

- Carga y ejecucion en Transformers con la clase `AXK1ForCausalLM`.
- Verificacion de contratos de integracion: manifiesto `integration.json`, uso en `integrations/transformers/usage.md` y expectativas en `integrations/transformers/expectations`.
- Generacion de texto sintacticamente valida (logits finitos), sin calidad semantica por pesos aleatorios.
- Pruebas de sensibilidad a entradas del contrato (attention mask, tokens de entrada).
- No soporta tool calling, agentes, vision, audio ni capacidades multilingues reales: los pesos no han sido entrenados.
- Sirve como fixture reproducible para CI de frameworks.

## Casos de uso

- CI de transformers-mic: ejecutar la suite de integracion contra A.X-K1-mic para validar que la carga y el forward de la familia A.X-K1 no rompen, sin descargar el checkpoint completo.
- Desarrollo de adaptadores de framework: probar la implementacion de `AXK1ForCausalLM` en local con 0,1 GB de disco y sin GPU dedicada.
- Verificacion de contratos de tokenizer: comprobar que `chat_template.jinja`, `special_tokens_map.json` y `tokenizer_config.json` se interpretan correctamente al ser copias byte a byte del modelo real.
- Pruebas de dtype: validar que el forward, la loss y los gradientes son finitos en float32, bfloat16 y float16.
- Reproduccion de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture A.X-K1-mic` y comparar hashes registrados en `build.json`.
- Formacion de mantenedores: ejemplo didactico de como reducir un checkpoint preservando nombres de tensores y ficheros de procesador para pruebas de integracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier metrica de calidad carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en bfloat16 (21 M de parametros, ~42 MB de pesos); en float32, ~84 MB.
- GPU recomendadas: cualquier GPU consumer moderna o incluso CPU; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) y en CPU.
- Opciones de despliegue: Transformers con `AXK1ForCausalLM`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| A.X-K1-mic | 21.048.000 | no disponible | Fixture de test | no disponible | Hugging Face |
| skt/A.X-K1 | no disponible | no disponible | Modelo base real | no disponible | Hugging Face |
| Otros fixtures de transformers-mic | no disponible | no disponible | Fixtures de test | no disponible | Hugging Face |

No se dispone de datos suficientes para comparar rendimiento con alternativas de la misma categoria; el unico comparable directo es el checkpoint base skt/A.X-K1, del que este artefacto deriva.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y no han sido entrenados; la salida es ruido estadistico.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe usarse en produccion.
- Licencia no disponible: no se puede confirmar el regimen de uso comercial.
- Idiomas no disponibles: no hay datos sobre cobertura linguistica real.
- Longitud de contexto no disponible: el fixture solo conserva 2 capas, por lo que el comportamiento con contextos largos no es representativo del modelo base.
- Los tensores `mlp.gate.e_score_correction_bias` estan ausentes tanto en el original como en el fixture; la carga los inicializa como lo haria con un usuario real, lo que puede enmascarar diferencias de comportamiento.
- Riesgo de confusion: el nombre y la estructura pueden llevar a confundirlo con un modelo funcional; revisar siempre la etiqueta `test-artifact` antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/A.X-K1-mic
- Modelo base: https://huggingface.co/skt/A.X-K1
- Como se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/A.X-K1-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Script de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
