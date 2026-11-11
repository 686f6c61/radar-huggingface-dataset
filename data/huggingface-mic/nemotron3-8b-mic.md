# huggingface-mic/nemotron3-8b-mic

## Resumen

`huggingface-mic/nemotron3-8b-mic` es un artefacto de prueba (fixture) publicado por el equipo de `huggingface-mic` dentro del proyecto `transformers-mic`. No es un modelo entrenado ni utilizable: se trata de una version "reducida" (slim) del checkpoint `thhaus/nemotron3-8b`, generada para validar contratos de integracion con frameworks (Transformers, entre otros) sin necesidad de cargar los pesos completos del modelo original.

El fixture conserva la misma arquitectura declarada (`NemotronForCausalLM`) y los mismos nombres de tensores que el checkpoint real, pero reduce la configuracion a 2 capas ocultas y sustituye los pesos por valores aleatorios (semilla 17). El resultado son 32.834.176 parametros en formato `safetensors` y `bfloat16`, con un tamano de repositorio de 0,1 GB. Los ficheros de procesador (`tokenizer.json`, `tokenizer.model`, `tokenizer_config.json`, `special_tokens_map.json`, `generation_config.json`) se copian byte a byte desde el modelo base.

Su relevancia es puramente de infraestructura: permite a mantenedores de librerias comprobar que su implementacion de `NemotronForCausalLM`, el pipeline de carga, la tokenizacion y el guardado funcionan correctamente con un coste minimo de almacenamiento y computo. Esta etiquetado como `test-artifact` precisamente para excluirlo de busquedas de modelos candidatos a uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (`NemotronForCausalLM`), version reducida a 2 capas ocultas |
| Parametros totales | 32.834.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture reproduce la clase `NemotronForCausalLM` del checkpoint `thhaus/nemotron3-8b`, pero con una configuracion reducida mediante la regla generica de `sweep.py` del repositorio `transformers-mic` (`num_hidden_layers` = 2). Los nombres de tensores coinciden con los del checkpoint real, de modo que cualquier codigo que espere la estructura de pesos de Nemotron3 puede ejercitarse contra este repositorio.

No ha habido entrenamiento. Los pesos son aleatorios (semilla 17) y se aceptaron porque superaron la "input-sensitivity gate": cada perturbacion de las entradas del contrato movio los logits al menos 0,001 (el caso mas debil, `input_ids:roll_batch`, obtuvo 0,926). Los ficheros de procesador se copiaron byte a byte desde `thhaus/nemotron3-8b`. El modelo se guardo en `bfloat16` (el dtype por defecto del checkpoint base) y se verifico que es finito en `float32`, `bfloat16` y `float16` tanto en forward como en loss y gradientes. No hay datos de tokens de entrenamiento, composicion del dataset ni tecnicas de alineacion (RLHF/DPO) porque no aplica.

## Capacidades

- No tiene capacidades generativas reales: los pesos son aleatorios y la salida no es coherente.
- Sirve como fixture de conformidad para la implementacion de `NemotronForCausalLM` en frameworks (carga, forward, loss, backward, guardado).
- Valida la integracion del tokenizador y de los ficheros de procesador copiados del modelo base.
- Permite comprobar contratos de entrada/salida definidos en `integration.json`.
- No soporta tool calling, agentes, vision, audio ni modo thinking de forma funcional (la arquitectura podria declararlos, pero el fixture no los ejercita con pesos reales).
- Multilingue: no disponible; depende del tokenizador heredado, no de capacidades del modelo.

## Casos de uso

- Pruebas de integracion en `transformers`: cargar el modelo con `AutoModelForCausalLM`, ejecutar un forward y verificar que las formas y dtypes coinciden con lo esperado para Nemotron3.
- CI/CD de librerias de inferencia: usar el fixture como caso de prueba ligero (0,1 GB) en pipelines que de otro modo requeririan descargar checkpoints de miles de millones de parametros.
- Validacion de tokenizadores: comprobar que `tokenizer.json` y `tokenizer.model` heredados de `thhaus/nemotron3-8b` se cargan y producen los `input_ids` esperados.
- Pruebas de serializacion: verificar ida y vuelta `safetensors` -> modelo -> `safetensors` con los mismos nombres de tensores.
- Verificacion de estabilidad numerica: ejecutar forward/loss/backward en `float32`, `bfloat16` y `float16` y comprobar ausencia de NaN/Inf.
- Desarrollo de utilidades de "shrink" o poda de checkpoints: el repositorio documenta el proceso (`sweep.py`, `build_fixtures.py`) y sirve como referencia reproducible.
- Regresion de contratos entre versiones de framework: fijar el fixture como baseline y detectar cambios incompatibles en la API de carga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en `bfloat16` (32,8 M de parametros, ~66 MB de pesos); en `float32` ~131 MB.
- GPU recomendadas: cualquier GPU consumer o incluso CPU es suficiente; no requiere A100/H100.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, integradas) y en CPU.
- Opciones de despliegue: `transformers` (via `AutoModelForCausalLM`), potencialmente `llama.cpp`/`Ollama` si se convierte a GGUF, aunque no es el proposito del repositorio; `vLLM` y TGI no estan pensados para fixtures de este tipo.
- Latencia y throughput: no disponibles; al ser pesos aleatorios no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/nemotron3-8b-mic` | 32,8 M (fixture) | no disponible | Test artifact / fixture | no disponible | Hugging Face |
| `thhaus/nemotron3-8b` | no disponible en la informacion (nombre sugiere ~8B) | no disponible | Modelo base real | no disponible | Hugging Face |
| Otros fixtures de `transformers-mic` | variable (reducidos) | no disponible | Test artifacts | no disponible | Hugging Face |

No se dispone de datos suficientes para comparar con alternativas funcionales de la misma categoria, ya que el fixture no es un modelo de produccion.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas no tienen significado.
- Etiquetado explicitamente como `test-artifact`; no debe usarse en produccion ni en evaluaciones de calidad.
- Licencia no especificada: no se puede asumir uso comercial.
- Idiomas no declarados; el comportamiento linguistico depende solo del tokenizador heredado.
- La configuracion reducida (2 capas) no representa el comportamiento del checkpoint real `thhaus/nemotron3-8b`; no extrapolar metricas.
- Riesgo de confusion en busquedas: el nombre incluye "nemotron3-8b" pero el tamano real es de 32,8 M de parametros.
- No hay garantia de mantenimiento ni de actualizacion del fixture; el proceso de reconstruccion requiere ejecutar `build_fixtures.py`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/nemotron3-8b-mic
- Modelo base: https://huggingface.co/thhaus/nemotron3-8b
- Documentacion del proceso de shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/nemotron3-8b-mic.html
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Manifiesto de contrato (`integration.json`): https://huggingface.co/huggingface-mic/nemotron3-8b-mic/blob/main/integration.json
- Uso con Transformers (`integrations/transformers/usage.md`): https://huggingface.co/huggingface-mic/nemotron3-8b-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers (`integrations/transformers/expectations`): https://huggingface.co/huggingface-mic/nemotron3-8b-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture (`build.json`): https://huggingface.co/huggingface-mic/nemotron3-8b-mic/blob/main/build.json
