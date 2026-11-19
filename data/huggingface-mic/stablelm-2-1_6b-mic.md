# huggingface-mic/stablelm-2-1_6b-mic

## Resumen

`huggingface-mic/stablelm-2-1_6b-mic` no es un modelo de lenguaje utilizable, sino un artefacto de prueba (fixture) derivado de `stabilityai/stablelm-2-1_6b`. Lo publica la organizacion `huggingface-mic` como parte de su infraestructura de validacion de contratos de integracion con frameworks (Transformers y otros), con el objetivo de comprobar que una implementacion de referencia se comporta de forma consistente frente a un checkpoint real, pero con un coste de computo minimo.

El fixture conserva la arquitectura `StableLmForCausalLM` y los nombres de tensores del checkpoint original, pero reduce la configuracion a 2 capas ocultas, lo que da como resultado 12,9 millones de parametros (frente a los 1.600 millones del modelo base). Los pesos son aleatorios (semilla 17) y se han generado siguiendo una regla generica de reduccion implementada en `sweep.py` del repositorio `transformers-mic`. No ha habido entrenamiento.

Su relevancia es puramente de ingenieria: permite a los mantenedores de integraciones ejecutar tests de sensibilidad de entradas, comprobar la paridad de nombres de tensores y validar la finitud numerica en float32, bfloat16 y float16 sin necesidad de descargar el checkpoint completo. Esta etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`StableLmForCausalLM`), 2 capas ocultas |
| Parametros totales | 12.928.000 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | float16 (por defecto); compatible con float32 y bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (se copia `LICENSE.md` del modelo base, pero no se especifica el tipo) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con atencion causal, instanciado mediante la clase `StableLmForCausalLM`. La configuracion se ha reducido a 2 capas ocultas aplicando la regla generica de `sweep.py`, manteniendo la estructura de tensores y los nombres de parametros del checkpoint original `stabilityai/stablelm-2-1_6b`. Los ficheros de procesador (`tokenizer.json`, `vocab.json`, `merges.txt`, `special_tokens_map.json`, `tokenizer_config.json`, `configuration_stablelm.py`, `modeling_stablelm.py`, `generation_config.json`, `LICENSE.md`) se copian byte a byte del modelo base.

No hay entrenamiento. Los pesos son aleatorios con semilla 17 y se aceptaron porque superaron la puerta de sensibilidad de entradas: toda perturbacion de las entradas del contrato movio los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, produjo 0,821). El fixture es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El identificador de fixture es `996c5bf49638` y cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras la reduccion.

## Capacidades

- Generacion de texto causal a nivel de arquitectura, pero sin capacidad funcional real: los pesos son aleatorios y no producen salidas coherentes.
- Ejecucion de forward, calculo de loss y retropropagacion en float32, bfloat16 y float16.
- Verificacion de contrato de integracion con Transformers mediante `integration.json` e `integrations/transformers/expectations`.
- Sensibilidad a perturbaciones de entradas (`attention_mask`, `input_ids`, etc.) para tests de regresion.
- Compatibilidad con nombres de tensores del checkpoint original, util para validar cargadores y mapeos.
- No soporta tool calling, agentes, vision, audio ni modo thinking de forma funcional.

## Casos de uso

- Tests de integracion en CI para la libreria Transformers: ejecutar el fixture en cada PR para comprobar que `StableLmForCausalLM` sigue cargando, ejecutando forward y calculando gradientes sin errores.
- Validacion de cargadores de safetensors: verificar que un cargador generico mapea correctamente los nombres de tensores del checkpoint real usando un modelo de 12,9 M de parametros en lugar de 1,6 B.
- Pruebas de paridad de tokenizer: al copiarse `tokenizer.json`, `vocab.json` y `merges.txt` byte a byte, sirve para comprobar que la tokenizacion coincide con la del modelo base sin descargar este ultimo.
- Tests de finitud numerica: comprobar que una implementacion concreta no produce NaN ni inf en float16, bfloat16 y float32 sobre un modelo pequeno y rapido.
- Validacion de contratos de framework: usar `integration.json` y `integrations/transformers/expectations` como especificacion ejecutable en pipelines de verificacion de integraciones.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture stablelm-2-1_6b-mic` y comparar hashes registrados en `build.json` para detectar regresiones en el proceso de reduccion.
- Benchmarking de infraestructura de test: medir el coste de arranque y ejecucion de suites de tests que hoy usan checkpoints completos, sustituyendolos por este fixture.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier metrica de calidad (MMLU, HumanEval, GSM8K, etc.) carece de sentido.

## Requisitos de hardware

- VRAM estimada: inferior a 100 MB en float16 (12,9 M de parametros), incluyendo overhead de activaciones y tokenizer.
- GPU recomendadas: cualquier GPU consumer o integrada con soporte CUDA/ROCm; tambien ejecutable en CPU.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) y en la mayoria de entornos CPU-only.
- Opciones de despliegue: Transformers (via `AutoModelForCausalLM`), y en principio cualquier runtime que cargue safetensors; no se documenta soporte especifico para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma oficial; por tamano, la inferencia es del orden de milisegundos en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/stablelm-2-1_6b-mic` | 12,9 M | no disponible | Fixture de test | no disponible | Hugging Face |
| `stabilityai/stablelm-2-1_6b` | 1,6 B | no disponible en esta ficha | Modelo causal real | no disponible en esta ficha | Hugging Face |
| Otros fixtures de `huggingface-mic` | variable (reducidos) | no disponible | Fixtures de test | no disponible | Hugging Face |
| Modelos pequenos reales (p. ej. variantes <100 M) | variable | variable | Inferencia real | variable | Hugging Face |

La comparativa con modelos reales no es homogenea: el fixture no compite en calidad ni rendimiento, solo en coste de ejecucion para tests. No se dispone de datos de benchmarks para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas no tienen sentido linguistico.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- Licencia no disponible en la informacion proporcionada; se copia `LICENSE.md` del modelo base, pero no se especifica su tipo. Verificar antes de cualquier uso.
- Idiomas soportados no disponibles; el tokenizer es el del modelo base, pero el modelo no genera texto valido en ningun idioma.
- Longitud de contexto no disponible; la config reducida mantiene la estructura del base pero no se documenta el valor efectivo.
- Riesgo de confusion: el nombre `stablelm-2-1_6b-mic` puede llevar a pensar que es un fine-tune del modelo de 1,6 B; no lo es.
- No soporta tool calling, agentes, vision ni audio de forma funcional.
- Cualquier metrica de calidad o benchmark reportada sobre este modelo seria enganosa.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/stablelm-2-1_6b-mic
- Modelo base: https://huggingface.co/stabilityai/stablelm-2-1_6b
- Manifest de contrato: `integration.json` (en el repositorio)
- Uso con Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
- Procedencia del fixture: `build.json` (en el repositorio)
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/stablelm-2-1_6b-mic.html
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de reduccion `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
