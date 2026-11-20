# huggingface-mic/parakeet-tdt-0.6b-v3-mic

## Resumen

`huggingface-mic/parakeet-tdt-0.6b-v3-mic` no es un modelo de produccion, sino un artefacto de test (fixture) construido por el equipo de `huggingface-mic` para validar la integracion de la arquitectura Parakeet-TDT en Transformers. Deriva del checkpoint real `nvidia/parakeet-tdt-0.6b-v3`, un modelo de reconocimiento automatico del habla (ASR) basado en la arquitectura Parakeet TDT (Token-and-Duration Transducer). El fixture replica la arquitectura `ParakeetForTDT` con una configuracion reducida (2 capas de encoder y 2 capas de decoder) y tan solo 1.088.486 parametros totales, frente a los ~600 millones del checkpoint original.

El proposito del repositorio es triple: servir pesos "slim" que cargan rapidamente, documentar el uso ejecutable mediante `integrations/transformers/usage.md` y exponer las expectativas del framework en `integrations/transformers/expectations`. Los ficheros de procesador (`generation_config.json`, `processor_config.json`, `tokenizer.json`, `tokenizer_config.json`) se copian byte a byte desde `nvidia/parakeet-tdt-0.6b-v3`, de modo que el pipeline de tokenizacion y generacion es identico al del modelo real.

Es relevante ahora porque permite a desarrolladores de Transformers validar la ruta de codigo de Parakeet TDT sin descargar ni ejecutar el checkpoint completo de 0.6B parametros, y porque los pesos estan sobreajustados al paso de entrenamiento del contrato (360 pasos), garantizando sensibilidad a la entrada (el gate `decoder_input_ids:reverse` mueve los logits por encima del umbral de 0.001). El modelo esta etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (Token-and-Duration Transducer), clase `ParakeetForTDT` |
| Parametros totales | 1.088.486 (fixture reducido; el checkpoint base declara 0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El fixture mantiene la arquitectura del checkpoint base `nvidia/parakeet-tdt-0.6b-v3`: un modelo transducer TDT con encoder y decoder, implementado en Transformers como `ParakeetForTDT`. La contraccion se aplico mediante la regla generica de `sweep.py`, reduciendo `num_decoder_layers` a 2 y `encoder num_hidden_layers` a 2. Los nombres de tensor coinciden con los del checkpoint real, lo que permite intercambiar pesos sin cambios de codigo en la capa de carga.

No hay datos de entrenamiento en el sentido habitual: los pesos se sobreajustan al paso de entrenamiento definido en el contrato (360 pasos) para satisfacer el gate de sensibilidad a la entrada. Los pesos aleatorios iniciales fallaban dicho gate (el cambio de logits ante `decoder_input_ids:reverse` era de 3.3e-05, por debajo del umbral 0.001), de ahi el sobreajuste. Los pesos son finitos en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. `build.json` registra las fuentes fijadas, los resultados de los gates y los hashes de los ficheros.

## Capacidades

- Reconocimiento automatico del habla (ASR) mediante arquitectura Parakeet TDT, heredada del checkpoint base.
- Generacion transducer con decodificacion token-and-duration, propia de la familia Parakeet TDT.
- Carga en Transformers con procesador identico al del checkpoint real (tokenizer y processor config copiados byte a byte).
- Ejecucion en float32, bfloat16 y float16 sin valores no finitos.
- Validacion de integracion: permite comprobar la ruta de codigo de `ParakeetForTDT` en Transformers.
- No dispone de capacidades de generacion de texto, razonamiento, codigo, vision ni tool calling; es un artefacto de test de ASR.
- Idiomas y cobertura multilingue: no disponibles en la informacion proporcionada.

## Casos de uso

- Pruebas de integracion en CI: usar el fixture como sustituto ligero del checkpoint de 0.6B para validar que la carga de `ParakeetForTDT` y el pipeline de ASR funcionan antes de ejecutar tests con pesos reales.
- Desarrollo de codigo de inferencia ASR: iterar sobre la logica de decodificacion TDT con un modelo de 1.1M parametros que carga en segundos y ocupa muy poca memoria.
- Validacion de compatibilidad de procesador: comprobar que `tokenizer.json`, `processor_config.json` y `generation_config.json` copiados del checkpoint real se cargan correctamente en Transformers.
- Regression testing de cambios en Transformers: detectar roturas en la ruta de Parakeet TDT (forward, loss, gradientes) con un coste computacional minimo.
- Verificacion de dtypes: confirmar que el modelo produce salidas finitas en float32, bfloat16 y float16 antes de desplegar en hardware con precision mixta.
- Reproduccion del fixture: regenerar los pesos con `python example/build_fixtures.py --fixture parakeet-tdt-0.6b-v3-mic` para auditar el proceso de contraccion y los gates.
- Documentacion de contrato de integracion: usar `integration.json` y `integrations/transformers/expectations` como referencia de lo que el framework espera del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo de rendimiento es el resultado del gate de sensibilidad a la entrada: el cambio de logits ante `decoder_input_ids:reverse` debe superar 0.001, y los pesos aleatorios daban 3.3e-05, por lo que se sobreajusto al paso 360.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 para 1.088.486 parametros (los pesos ocuparian aproximadamente 4.35 MB, mas overhead de activaciones y procesador).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) e incluso CPU; no requiere A100 ni H100.
- Cabe en consumer GPU y en CPU sin problema dado el tamano del fixture.
- Opciones de despliegue: Transformers (ruta documentada en `integrations/transformers/usage.md`); otras opciones (vLLM, llama.cpp, Ollama, TGI) no disponibles para esta arquitectura en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/parakeet-tdt-0.6b-v3-mic` (este) | 1.088.486 (fixture) | no disponible | Test artifact ASR | no disponible | Hugging Face, 1692 descargas |
| `nvidia/parakeet-tdt-0.6b-v3` | ~0.6B | no disponible | ASR (Parakeet TDT) | no disponible | Hugging Face (checkpoint base) |
| Otros modelos ASR comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion significativa disponible es con su checkpoint base: mismo nombre de tensores, misma arquitectura `ParakeetForTDT`, mismo procesador, pero con encoder y decoder reducidos a 2 capas y sobreajustado al paso 360 del contrato.

## Limitaciones y advertencias

- Es un artefacto de test (`test-artifact`), no un modelo utilizable en produccion; la model card lo declara explicitamente.
- Los pesos estan sobreajustados al paso de entrenamiento del contrato (360 pasos); no generalizan ni representan el comportamiento del checkpoint real de 0.6B.
- No se han publicado datos de licencia, idiomas, contexto ni cuantizacion; no asumir uso comercial sin verificar la licencia del checkpoint base `nvidia/parakeet-tdt-0.6b-v3`.
- La contraccion reduce la profundidad del modelo, por lo que la calidad ASR del fixture es irrelevante y no debe evaluarse.
- Riesgo de sesgo y alucinacion: no evaluable en este fixture; en el modelo base habria que consultar la model card de NVIDIA.
- No usar como sustituto del checkpoint real en benchmarks de calidad ASR ni en despliegues de reconocimiento de voz.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/parakeet-tdt-0.6b-v3-mic
- Checkpoint base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Manifesto de contrato: `integration.json` (en el repositorio)
- Uso en Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
- Procedencia del fixture: `build.json` (en el repositorio)
- Explicacion del proceso de contraccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/parakeet-tdt-0.6b-v3-mic.html
- Regla de contraccion (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
