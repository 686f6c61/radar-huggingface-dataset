# huggingface-mic/Mistral-7B-Instruct-v0.2-mic

## Resumen

`huggingface-mic/Mistral-7B-Instruct-v0.2-mic` no es un modelo utilizable, sino un artefacto de prueba (fixture) publicado por el equipo de Hugging Face MIC para validar integraciones de framework. Se construye a partir de `mistralai/Mistral-7B-Instruct-v0.2` manteniendo la misma arquitectura declarada (`MistralForCausalLM`) y los mismos nombres de tensores, pero reduciendo la configuracion a 2 capas ocultas y sustituyendo los pesos por valores aleatorios (semilla 17). El resultado es un checkpoint de 8.438.400 parametros en lugar de los aproximadamente 7.240 millones del modelo original.

El objetivo es disponer de un repositorio ligero que reproduzca fielmente el contrato de entrada/salida de Mistral-7B-Instruct-v0.2: los ficheros de procesador (`tokenizer.json`, `tokenizer.model`, `tokenizer_config.json`, `special_tokens_map.json`, `generation_config.json`) se copian byte a byte del modelo original, y los pesos se guardan en `bfloat16`, el dtype por defecto del checkpoint real. Asi, un pipeline de integracion puede ejecutar cargas, forwards, calculo de perdida y gradientes sin descargar los ~14 GB del modelo completo.

La relevancia es exclusivamente para ingenieria de infraestructura y CI: el autor lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos. No debe emplearse para inferencia real, evaluacion de calidad ni despliegue en produccion, ya que sus pesos son aleatorios y no ha recibido entrenamiento alguno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`MistralForCausalLM`), configuracion reducida a 2 capas ocultas |
| Parametros totales | 8.438.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el fixture hereda la configuracion reducida; no se documenta `max_position_embeddings`) |
| Tipos de cuantizacion | no disponible; pesos publicados en `bfloat16` |
| Idiomas soportados | no disponible (tokenizer heredado de Mistral-7B-Instruct-v0.2, sin evaluacion) |
| Licencia | no disponible |
| Formato de pesos | `safetensors` (mas ficheros de tokenizer y `generation_config.json`) |

## Arquitectura y entrenamiento

El fixture replica la clase `MistralForCausalLM` con los mismos nombres de tensores que el checkpoint original, pero con `num_hidden_layers` reducido a 2 mediante la regla generica de `sweep.py` del repositorio `huggingface/transformers-mic`. Los pesos se inicializan de forma aleatoria con semilla 17 y no pasan por ningun proceso de entrenamiento; el autor justifica esta decision indicando que superaron una puerta de sensibilidad a la entrada (cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001; el caso mas debil, `attention_mask:all_ones`, arroja 0,566). Los tensores se verifican como finitos en `float32`, `bfloat16` y `float16` tanto en forward como en perdida y gradientes.

Los ficheros de procesador (`generation_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer.model`, `tokenizer_config.json`) se copian byte a byte desde `mistralai/Mistral-7B-Instruct-v0.2`, de modo que el contrato de tokenizacion y generacion coincide con el del modelo real. El repositorio incluye ademas `integration.json` (manifiesto del contrato), `build.json` (procedencia, resultados de las puertas y hashes) y directorios `integrations/transformers/` con uso ejecutable y expectativas del framework. La clave de fixture es `ee79564a609e` y cubre cualquier checkpoint cuyos ficheros de procesador sean identicos byte a byte y cuya configuracion coincida tras el proceso de reduccion.

## Capacidades

- El modelo no tiene capacidades funcionales: sus pesos son aleatorios y no ha sido entrenado, por lo que no genera texto coherente.
- Sirve como fixture de integracion para validar carga de `safetensors`, ejecucion de forward, calculo de perdida y retropropagacion en frameworks compatibles con `MistralForCausalLM`.
- Permite comprobar el contrato de tokenizacion y de `generation_config` heredado del modelo base sin descargar el checkpoint completo.
- No soporta tool calling, function calling, razonamiento multi-paso ni modos de pensamiento, ya que no dispone de conocimiento aprendido.
- No dispone de capacidades multilingues, de vision ni de audio.
- Utilidad principal: pruebas de CI/CD, tests de regresion de frameworks y validacion de pipelines de serializacion.

## Casos de uso

- Pruebas de integracion en CI: cargar el fixture con `transformers` y verificar que la clase `MistralForCausalLM` instancia, ejecuta forward y calcula gradientes sin errores, con un coste de descarga de pocos megabytes.
- Validacion de contratos de tokenizer: comprobar que un pipeline propio tokeniza y decodifica de forma identica a `mistralai/Mistral-7B-Instruct-v0.2`, dado que los ficheros de procesador se copian byte a byte.
- Tests de serializacion `safetensors`: verificar que el cargador de un framework acepta los nombres de tensor y el dtype `bfloat16` del checkpoint real sin necesidad de los ~14 GB del modelo original.
- Regresion de frameworks (Transformers, vLLM, TGI en fase de carga): usar el fixture para detectar roturas en la capa de carga y en la definicion del modelo antes de ejecutar la suite completa contra el modelo real.
- Validacion de pipelines de cuantizacion: probar herramientas que convierten `safetensors` a otros formatos sobre un artefacto ligero, comprobando que la logica de conversion no depende del numero de capas.
- Pruebas de compatibilidad de `generation_config.json`: verificar que un wrapper de generacion interpreta correctamente los parametros de decodificacion del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que se trata de un `test-artifact` sin entrenamiento, por lo que cualquier metrica de calidad carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en `bfloat16` (8,4 M de parametros, aproximadamente 17 MB de pesos) mas el coste del tokenizer y de las activaciones.
- GPU recomendadas: cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) e incluso CPU; no requiere aceleradores de datacenter.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: `transformers` (uso documentado en `integrations/transformers/usage.md`); no se documenta soporte especifico para vLLM, llama.cpp, Ollama ni TGI, aunque al compartir arquitectura con Mistral podria cargarse en frameworks compatibles.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la latencia es despreciable y no representativa del modelo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/Mistral-7B-Instruct-v0.2-mic` | 8,4 M | no disponible | Fixture de test | no disponible | Hugging Face (1120 descargas) |
| `mistralai/Mistral-7B-Instruct-v0.2` | ~7.240 M | 32.768 tokens (segun model card publica del modelo base) | Modelo instructivo real | Apache 2.0 (segun model card publica) | Hugging Face |
| `mistralai/Mistral-7B-v0.1` | ~7.240 M | 32.768 tokens (segun model card publica) | Modelo base | Apache 2.0 (segun model card publica) | Hugging Face |

La comparativa con el modelo base es la unica relevante: el fixture comparte arquitectura, tokenizer y nombres de tensor, pero difiere en numero de parametros, pesos y finalidad. No se dispone de datos de benchmarks del fixture ni de comparaciones con otros artefactos de test.

## Limitaciones y advertencias

- Los pesos son aleatorios (semilla 17): el modelo no produce texto coherente y no debe usarse para inferencia real.
- Etiquetado como `test-artifact` por el autor para excluirlo de busquedas de modelos candidatos; usarlo en produccion seria un error de seleccion.
- La licencia no esta declarada en la informacion disponible; conviene consultar el repositorio antes de cualquier uso, aunque el modelo base es Apache 2.0.
- La configuracion reducida a 2 capas no representa el comportamiento numerico del modelo real; los tests de rendimiento o de calidad sobre el fixture no son extrapolables.
- El repositorio ocupa 0,0 GB segun los metadatos, lo que confirma que no contiene los pesos completos.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de idioma porque el modelo no ha sido entrenado; cualquier evaluacion de este tipo debe realizarse sobre `mistralai/Mistral-7B-Instruct-v0.2`.
- La fecha de creacion (2026-10-29) y la de actualizacion (2026-11-10) figuran en los metadatos; verificar su coherencia con el calendario real antes de citarlas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/Mistral-7B-Instruct-v0.2-mic
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Repositorio de codigo `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de reduccion (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Mistral-7B-Instruct-v0.2-mic.html
- Manifiesto del contrato (`integration.json`): https://huggingface.co/huggingface-mic/Mistral-7B-Instruct-v0.2-mic/blob/main/integration.json
- Procedencia del fixture (`build.json`): https://huggingface.co/huggingface-mic/Mistral-7B-Instruct-v0.2-mic/blob/main/build.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/Mistral-7B-Instruct-v0.2-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/Mistral-7B-Instruct-v0.2-mic/tree/main/integrations/transformers/expectations
