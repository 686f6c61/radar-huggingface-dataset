# huggingface-mic/granite-3.1-2b-instruct-mic

## Resumen

`huggingface-mic/granite-3.1-2b-instruct-mic` es un artefacto de prueba (fixture) derivado de `ibm-granite/granite-3.1-2b-instruct`, publicado por la organizacion `huggingface-mic`. No es un modelo entrenado ni utilizable para inferencia real: es una version "adelgazada" del checkpoint original, creada para validar contratos de integracion con Transformers. La model card lo etiqueta explicitamente como `test-artifact` para excluirlo de las busquedas de modelos candidatos.

El fixture conserva la misma arquitectura (`GraniteForCausalLM`) que el modelo base, pero con una configuracion reducida: solo 2 capas ocultas (`num_hidden_layers 2`) frente a las del checkpoint real. Los pesos son aleatorios (semilla 17), no entrenados, aunque mantienen exactamente los mismos nombres de tensor que el checkpoint original. Los ficheros de procesador (tokenizer, `generation_config.json`, `special_tokens_map.json`, etc.) se copiaron byte a byte desde `ibm-granite/granite-3.1-2b-instruct`.

El interes de este repositorio es de ingenieria, no de modelado: sirve como fixture de test reproducible para verificar que las expectativas de framework (carga, forward, loss, gradientes) se cumplen con la arquitectura Granite. Los pesos suman 3.219.968 parametros reales (segun safetensors), muy lejos de los ~2.000 millones del modelo base, y el repo ocupa 0.0 GB en disco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GraniteForCausalLM (transformer causal, configuracion reducida a 2 capas) |
| Parametros totales | 3.219.968 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura del modelo base Granite (`GraniteForCausalLM`), un transformer causal decoder-only. La unica diferencia estructural es la reduccion del numero de capas ocultas a 2, aplicada mediante la regla generica de adelgazamiento del script `sweep.py` del proyecto `transformers-mic`. Los nombres de tensor coinciden exactamente con los del checkpoint real, de modo que cualquier codigo que espere la arquitectura Granite puede cargar este fixture sin cambios.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y solo se aceptaron tras superar una "puerta de sensibilidad a la entrada": cada perturbacion de las entradas del contrato debia mover los logits al menos 0.001 (el caso mas debil, `attention_mask:all_ones`, movio 0.00208). Los pesos son finitos en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. Los ficheros de procesador se copiaron byte a byte desde `ibm-granite/granite-3.1-2b-instruct` (`added_tokens.json`, `generation_config.json`, `merges.txt`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`). El fixture se genero con `build_fixtures.py` y la procedencia queda registrada en `build.json` (fuentes fijadas, resultados de las puertas y hashes de ficheros).

## Capacidades

- No tiene capacidades funcionales de generacion de texto, razonamiento, codigo o matematicas: los pesos son aleatorios y el modelo no fue entrenado.
- No soporta tool calling ni function calling de forma util.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues reales (aunque los ficheros de tokenizer copiados del modelo base estan presentes).
- Su unica funcion es servir como fixture de test para validar contratos de integracion con Transformers: carga del checkpoint, forward pass, calculo de loss y gradientes en float32, bfloat16 y float16.
- Mantiene los mismos nombres de tensor que `ibm-granite/granite-3.1-2b-instruct`, lo que permite probar codigo de integracion sin descargar el checkpoint completo.

## Casos de uso

- Test de integracion en CI: el fixture permite ejecutar pruebas de carga y forward pass de la arquitectura Granite en pipelines de integracion continua sin necesidad de descargar los ~2.000 millones de parametros del modelo base.
- Validacion de contratos de framework: los directorios `integrations/transformers/expectations` e `integration.json` definen las expectativas que el codigo de integracion debe cumplir; el fixture permite comprobarlas de forma reproducible.
- Desarrollo de codigo de carga de modelos: cualquier herramienta que implemente la carga de `GraniteForCausalLM` puede probarse contra este repo ligero antes de enfrentarse al checkpoint real.
- Pruebas de dtype y estabilidad numerica: al ser finito en float32, bfloat16 y float16, sirve para verificar que rutinas de forward, loss y gradientes no producen NaN/Inf en esos tipos.
- Verificacion de compatibilidad de tokenizer: los ficheros de procesador copiados byte a byte permiten probar el pipeline de tokenizacion del modelo base sin cargar los pesos reales.
- Reproduccion de fixtures: `build.json` registra fuentes fijadas y hashes, y `build_fixtures.py --fixture granite-3.1-2b-instruct-mic` permite reconstruir el artefacto de forma determinista.
- Pruebas de sensibilidad a entradas: la puerta de sensibilidad (perturbaciones que mueven los logits >= 0.001) puede reutilizarse como test de regresion en frameworks de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K, etc.) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: minima; con 3.219.968 parametros en bfloat16 el peso ronda los 6,4 MB, por lo que cabe en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte bfloat16 (RTX 3090, RTX 4090, A100, H100) o incluso CPU.
- Cabe en GPU consumer: si, en todas las GPU modernas e integradas.
- Opciones de despliegue: Transformers (uso previsto, segun `integrations/transformers/usage.md`); vLLM, llama.cpp, Ollama o TGI no estan indicados en la informacion disponible.
- Latencia y throughput: no disponibles; al ser un fixture de test no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia |
|---|---|---|---|---|
| `huggingface-mic/granite-3.1-2b-instruct-mic` (este) | 3.219.968 | no disponible | Fixture de test | no disponible |
| `ibm-granite/granite-3.1-2b-instruct` (base) | ~2.000 millones (no confirmado en la informacion) | no disponible | Modelo instructivo real | no disponible |
| Otros fixtures de `transformers-mic` | no disponible | no disponible | Fixtures de test | no disponible |

La comparativa relevante es con el modelo base: este repositorio no compite con el en calidad ni capacidades, solo replica su arquitectura a escala reducida para pruebas. No se dispone de datos de benchmarks ni de contexto para ninguno de los modelos comparados en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y el modelo no fue entrenado; cualquier salida de texto seria incoherente.
- La model card lo marca explicitamente como `test-artifact`; no debe usarse en produccion ni presentarse como modelo de lenguaje.
- La configuracion esta reducida a 2 capas ocultas, por lo que el comportamiento numerico no representa fielmente el del checkpoint completo de 2B.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; al derivar de `ibm-granite/granite-3.1-2b-instruct`, conviene revisar la licencia del modelo base antes de cualquier uso.
- Idiomas y contexto no disponibles en la informacion proporcionada.
- El repositorio ocupa 0.0 GB y contiene solo pesos safetensors, uso de Transformers y expectativas de framework; otros ficheros deben regenerarse con `build_fixtures.py`.
- Riesgo de confusion: el nombre sugiere un modelo Granite 3.1 2B instructivo, pero el contenido real es un fixture de 3,2M parametros; verificar siempre el tamano antes de integrarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/granite-3.1-2b-instruct-mic
- Modelo base: https://huggingface.co/ibm-granite/granite-3.1-2b-instruct
- Manifest del contrato: `integration.json` (en el repo)
- Uso con Transformers: `integrations/transformers/usage.md` (en el repo)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repo)
- Procedencia del fixture: `build.json` (en el repo)
- Explicacion del adelgazamiento: https://huggingface-mic-mic-coverage.static.hf.space/shrink/granite-3.1-2b-instruct-mic.html
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla generica de adelgazamiento: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
