# huggingface-mic/granite-4.0-h-350m-mic

## Resumen

`granite-4.0-h-350m-mic` es un artefacto de prueba publicado por la organizacion `huggingface-mic` dentro del proyecto de cobertura de integraciones MIC (model integration contract) de Hugging Face. No es un modelo entrenado ni utilizable para inferencia real: se trata de un *fixture* de 6.512.376 parametros construido a partir del modelo `ibm-granite/granite-4.0-h-350m` de IBM, reduciendo su configuracion a 2 capas ocultas y sustituyendo los pesos por valores aleatorios (semilla 17). Su proposito es verificar que las integraciones de frameworks (concretamente Transformers) cargan, ejecutan y devuelven resultados coherentes con la arquitectura `GraniteMoeHybridForCausalLM` real, sin necesidad de descargar ni ejecutar el checkpoint completo.

El fixture conserva la misma firma de tensores que el checkpoint original, los ficheros de procesador copiados byte a byte (tokenizer, chat template, generation config, etc.) y se guarda en `bfloat16`, el dtype por defecto del modelo base. Esto permite que las pruebas de integracion detecten roturas en nombres de tensores, formas, dtypes o contratos de entrada/salida sin depender de pesos reales. La relevancia actual es metodologica: representa un patron de testing de modelos en CI que reduce coste y tiempo frente a ejecutar el modelo completo en cada validacion.

Conviene subrayar que el propio autor lo etiqueta como `test-artifact` para excluirlo de busquedas de modelos candidatos. Cualquier uso distinto del testing de integraciones carece de sentido: los pesos son aleatorios y no contienen conocimiento linguistico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GraniteMoeHybridForCausalLM (transformer hibrido con componentes MoE, configuracion reducida a 2 capas) |
| Parametros totales | 6.512.376 (fixture reducido; el modelo base `ibm-granite/granite-4.0-h-350m` tiene ~350M) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada de la configuracion del modelo base, no documentada en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; el autor indica finitud en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible (tokenizer heredado de `ibm-granite/granite-4.0-h-350m`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura `GraniteMoeHybridForCausalLM`, que en el modelo base de IBM combina capas transformer con mecanismos de mezcla de expertos (MoE) e hibridacion. Sin embargo, la configuracion se ha reducido mediante la regla generica de `sweep.py` del repositorio `transformers-mic`, fijando `num_hidden_layers` a 2. No hay entrenamiento: los pesos son aleatorios con semilla 17 y se validaron mediante una puerta de sensibilidad a la entrada (cada perturbacion de las entradas del contrato mueve los logits al menos 0,001; el caso mas debil, `input_ids:roll_batch`, produce 1,84). Esto garantiza que el modelo responde de forma no degenerada a variaciones de entrada, suficiente para tests de integracion.

Los ficheros de procesador (`chat_template.jinja`, `generation_config.json`, `merges.txt`, `model.sig`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copiaron byte a byte desde `ibm-granite/granite-4.0-h-350m`, de modo que el pipeline de tokenizacion y generacion es identico al real. La clave de fixture `3191e8b75d62` agrupa todos los checkpoints cuyos ficheros de procesador son identicos y cuya config coincide tras el shrink. El artefacto se genero con `build_fixtures.py` y los metadatos de procedencia (fuentes fijadas, resultados de la puerta, hashes) se registran en `build.json`.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no ha recibido entrenamiento, por lo que no genera texto coherente ni resuelve tareas.
- Sirve como fixture de integracion para validar la carga en Transformers de la arquitectura `GraniteMoeHybridForCausalLM`.
- Permite verificar la firma de tensores (nombres, formas, dtypes) frente al checkpoint real de IBM.
- Valida el pipeline de tokenizacion y chat template heredados del modelo base.
- Comprueba la finitud de forward, loss y gradientes en float32, bfloat16 y float16.
- No soporta tool calling, agentes, vision, audio ni razonamiento: esas capacidades pertenecen al modelo base, no a este fixture.
- Multilingue: no aplicable al no contener conocimiento linguistico; el tokenizer heredado cubre los idiomas del modelo base, pero sin pesos entrenados no hay generacion valida.

## Casos de uso

- Testing de integraciones en CI: ejecutar el fixture en la suite de pruebas de Transformers para detectar roturas en la carga de `GraniteMoeHybridForCausalLM` sin descargar el checkpoint de ~350M parametros.
- Validacion de contratos de entrada/salida: comprobar que las perturbaciones de `input_ids` y demas entradas producen cambios en logits por encima del umbral definido (puerta de sensibilidad).
- Regresion de tokenizer y chat template: verificar que los ficheros de procesador copiados del modelo base siguen produciendo las mismas secuencias de tokens tras cambios en el codigo del framework.
- Pruebas de dtype y precision: confirmar que forward, loss y gradientes son finitos en float32, bfloat16 y float16, cubriendo los modos de carga habituales.
- Desarrollo de nuevas integraciones de framework: usar el fixture como objetivo ligero para implementar y depurar adaptadores de carga antes de pasar al modelo real.
- Documentacion ejecutable: los ficheros `integrations/transformers/usage.md` y `integrations/transformers/expectations` permiten reproducir el uso esperado del modelo en ejemplos ejecutables sin coste de computo.
- Validacion de pipelines de shrink: servir como referencia para comprobar que la regla de reduccion de `sweep.py` mantiene la coherencia estructural del checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta metricas de calidad porque los pesos son aleatorios y el artefacto no esta pensado para evaluacion de rendimiento predictivo.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en bfloat16 para los 6,5M parametros del fixture; cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; cualquier RTX, A100, H100 o incluso CPU es suficiente para ejecutar el fixture.
- Cabe en consumer GPU: si, en cualquier modelo (incluso integradas), dado el tamano reducido.
- Opciones de despliegue: Transformers (via `GraniteMoeHybridForCausalLM`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este fixture.
- Latencia y throughput: no disponibles; al ser un artefacto de test, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `granite-4.0-h-350m-mic` (este) | 6,5M (fixture) | no disponible | Fixture de test de integraciones | no disponible | Hugging Face |
| `ibm-granite/granite-4.0-h-350m` | ~350M | no disponible | Modelo causal real de IBM | no disponible | Hugging Face |
| Fixtures MIC de otros modelos | variable (reducidos) | no disponible | Testing de integraciones | no disponible | Hugging Face (org `huggingface-mic`) |

La comparativa directa con modelos de produccion no es significativa: este artefacto no compite en capacidad, sino que cubre una funcion de testing. Frente al modelo base de IBM, la diferencia clave es el tamano (6,5M vs ~350M) y la ausencia de pesos entrenados.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la salida no tiene valor linguistico ni predictivo.
- Etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- Sesgos conocidos: no aplicable al no haber entrenamiento; el tokenizer heredado podria reflejar sesgos del modelo base, pero sin pesos no se manifiestan en generacion.
- Riesgo de alucinacion: total, en el sentido de que cualquier texto generado es ruido sin fundamento.
- Limitaciones de contexto e idioma: la configuracion reducida a 2 capas no representa el comportamiento del modelo base; no debe usarse para evaluar capacidades multilingues ni de contexto largo.
- Restricciones de licencia: no disponible; conviene consultar la licencia del modelo base `ibm-granite/granite-4.0-h-350m` antes de cualquier reutilizacion de los ficheros de procesador copiados.
- Caveat para produccion: no usar como sustituto del modelo real en ninguna etapa del pipeline; su unico rol valido es el testing de integraciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/granite-4.0-h-350m-mic
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-h-350m
- Documentacion del shrink del fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/granite-4.0-h-350m-mic.html
- Repositorio `transformers-mic` (regla de shrink en `sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
