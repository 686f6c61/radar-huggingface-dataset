# huggingface-mic-temp/gemma-4-12B-it-vllm-mic

## Resumen

`gemma-4-12B-it-vllm-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic-temp`, no un modelo utilizable. Reproduce la arquitectura `Gemma4UnifiedForConditionalGeneration` del checkpoint `google/gemma-4-12B-it` con una configuracion reducida (2 capas de texto en lugar de las del modelo original) y pesos aleatorios generados con semilla 17. Su proposito es servir como banco de pruebas reproducible para validar contratos de integracion con frameworks (vLLM, Transformers) sin necesidad de descargar el modelo completo.

El repositorio contiene los pesos "slim" (52,5 millones de parametros, ~0,1 GB), la documentacion de uso ejecutable y los ficheros de expectativas del framework. Los ficheros de procesador (`chat_template.jinja`, `generation_config.json`, `processor_config.json`, `tokenizer.json`, `tokenizer_config.json`) se copian byte a byte del checkpoint original, de modo que la tokenizacion y el chat template coinciden con `google/gemma-4-12B-it`.

Es relevante ahora porque el ecosistema necesita fixtures ligeros y deterministas para integrar modelos multimodales grandes en pipelines de inferencia (vLLM) y CI, sin coste de almacenamiento ni de GPU. Los pesos estan etiquetados como `test-artifact` y `mic` para excluirlos de busquedas de modelos candidatos. No debe usarse para inferencia real: los pesos son aleatorios y no han sido entrenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4UnifiedForConditionalGeneration (multimodal, transformer, fixture reducido a 2 capas de texto) |
| Parametros totales | 52.467.586 (fixture); el modelo base declara 12B en el nombre |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |
| Modelo base | google/gemma-4-12B-it |
| Tamano del repositorio | 0,1 GB |
| Semilla de pesos | 17 (aleatorios) |
| Clave de fixture | 200a53235a22 |

## Arquitectura y entrenamiento

El fixture mantiene la clase `Gemma4UnifiedForConditionalGeneration` del checkpoint original, pero con una configuracion reducida mediante la regla generica de `sweep.py` (text `num_hidden_layers: 2`). Conserva los mismos nombres de tensores que el checkpoint real, lo que permite validar rutas de carga, mapeo de pesos y contratos de integracion sin discrepancias de nomenclatura. Los ficheros de procesador se copian literalmente del modelo base, garantizando identidad de tokenizer y chat template.

No hubo entrenamiento: los pesos son aleatorios (semilla 17) y solo se validaron con una puerta de sensibilidad a la entrada, en la que cada perturbacion de las entradas del contrato desplazo los logits al menos 0,001 (el caso mas debil, `input_ids:roll_batch`, dio 1,2). El modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes, y se guarda en bfloat16, el dtype por defecto de `google/gemma-4-12B-it`. El proceso de construccion esta documentado en `build_fixtures.py` y los hashes y resultados de la puerta se registran en `build.json`.

## Capacidades

- Carga y ejecucion en vLLM y Transformers como fixture de contrato (no como modelo funcional).
- Validacion de tokenizacion y chat template identicos al modelo base.
- Verificacion de nombres y formas de tensores del checkpoint real.
- Pruebas de forward, loss y gradientes en float32, bfloat16 y float16.
- Pruebas de sensibilidad a la entrada (perturbaciones de inputs que alteran logits).
- Integracion en pipelines de CI para frameworks de inferencia.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision con calidad: los pesos son aleatorios.
- No dispone de tool calling, agentes ni capacidades multilingues reales.

## Casos de uso

- CI de integracion con vLLM: ejecutar el fixture en lugar del checkpoint de 12B para validar rutas de carga, configuracion y contrato de inferencia en cada commit, reduciendo el coste de GPU y almacenamiento.
- Validacion de chat templates: comprobar que el renderizado de mensajes coincide con `google/gemma-4-12B-it` usando los ficheros de procesador copiados byte a byte.
- Pruebas de compatibilidad de tokenizer: verificar que el pipeline de tokenizacion y detokenizacion se comporta igual que con el modelo base.
- Verificacion de mapeo de pesos: comprobar que las herramientas de conversion o carga manejan correctamente los nombres de tensores del checkpoint real.
- Pruebas de dtype y estabilidad numerica: validar forward, loss y gradientes en float32, bfloat16 y float16 sin NaNs ni infinitos.
- Desarrollo de harness de evaluacion: construir y depurar el arnes de benchmarks contra un modelo ligero antes de lanzarlo sobre el checkpoint completo.
- Validacion de contratos de framework (Transformers expectations): comprobar que las expectativas documentadas en `integrations/transformers/expectations` se cumplen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (52,5 M de parametros, ~0,1 GB de pesos); cabe en cualquier GPU consumer.
- GPU recomendadas: cualquiera con soporte bfloat16 (RTX 30xx/40xx, A100, H100); tambien ejecutable en CPU para pruebas de contrato.
- Cabe en GPU consumer: si, incluidas GTX 16xx y RTX 20xx en float16/float32.
- Opciones de despliegue: vLLM (objetivo declarado del fixture), Transformers; llama.cpp u Ollama no estan documentados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| gemma-4-12B-it-vllm-mic | 52,5 M (fixture) | no disponible | no disponible | Fixture de contrato para CI |
| google/gemma-4-12B-it | 12B (segun nombre) | no disponible | no disponible | Modelo multimodal real |
| Otros fixtures MIC de la organizacion | variable | no disponible | no disponible | Pruebas de integracion |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y no han sido entrenados; las salidas no tienen sentido.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- La licencia no esta declarada en la informacion disponible; verificar los terminos del modelo base `google/gemma-4-12B-it` antes de cualquier uso derivado.
- El numero de parametros (52,5 M) no coincide con el nombre del modelo (12B): corresponde al fixture reducido, no al checkpoint real.
- La configuracion reducida (2 capas de texto) no reproduce el comportamiento numerico del modelo completo.
- No hay informacion sobre sesgos, alucinacion, idiomas ni contexto, ya que no aplica a un artefacto de prueba.
- Los ficheros de procesador son identicos al modelo base, pero el resto del repositorio debe regenerarse con `build_fixtures.py` si se necesita reconstruir.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic-temp/gemma-4-12B-it-vllm-mic
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Documentacion de reduccion del fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/gemma-4-12B-it-vllm-mic.html
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Uso con Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
- Manifiesto de contrato: `integration.json` (en el repositorio)
- Procedencia del fixture: `build.json` (en el repositorio)
