# huggingface-mic/OLMoE-1B-7B-0924-mic

## Resumen

OLMoE-1B-7B-0924-mic es un artefacto de prueba (test fixture) publicado por la organizacion huggingface-mic, no un modelo entrenado. Se trata de una version "adelgazada" del modelo real allenai/OLMoE-1B-7B-0924, reducida a 6.669.376 parametros mediante una regla generica de reduccion de configuracion (num_hidden_layers reducido a 2) implementada en el script sweep.py del repositorio transformers-mic. Su proposito es servir como fixture reproducible para validar contratos de integracion con frameworks (concretamente Transformers), no para generar texto util.

El modelo conserva la misma clase de arquitectura que el original (OlmoeForCausalLM), los mismos nombres de tensores que el checkpoint real y los ficheros de procesador copiados byte a byte (tokenizer.json, tokenizer_config.json, special_tokens_map.json, generation_config.json, olmoe-logo.png). Los pesos son aleatorios (semilla 17) y fueron aceptados por una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato mueve los logits al menos 0,001 (la mas debil, input_ids:roll_batch, 0,718), por lo que no se requirio entrenamiento.

Es relevante ahora porque el ecosistema de herramientas alrededor de Transformers necesita fixtures ligeros y deterministas para probar integraciones sin descargar checkpoints de miles de millones de parametros. Este repositorio empaqueta pesos reducidos, uso ejecutable y expectativas de framework en un unico lugar, etiquetado explicitamente como test-artifact para excluirlo de busquedas de modelos candidatos. No debe confundirse con el OLMoE real de AllenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OlmoeForCausalLM (transformer MoE, config reducida a num_hidden_layers=2) |
| Parametros totales | 6.669.376 (fixture); el modelo base tiene 7B totales / ~1B activos |
| Parametros activos | no disponible (el fixture no documenta ruteo MoE efectivo) |
| Longitud de contexto | no disponible (heredada de la config del base, no verificada en la ficha) |
| Tipos de cuantizacion | no disponible; pesos guardados en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura del checkpoint allenai/OLMoE-1B-7B-0924, un transformer de mezcla de expertos (MoE) con atencion causal, pero con la configuracion reducida a 2 capas ocultas mediante la regla generica de sweep.py. Mantiene los mismos nombres de tensores que el checkpoint real, lo que permite que el codigo de carga y las expectativas de framework se validen contra una estructura identica sin necesidad de los pesos completos. Los ficheros de procesador (tokenizer y configuracion de generacion) se copiaron byte a byte desde el modelo original.

No hubo entrenamiento: los pesos son aleatorios con semilla 17. La unica validacion aplicada fue una puerta de sensibilidad a la entrada que comprueba que perturbaciones de los inputs del contrato alteran los logits por encima de un umbral (0,001), garantizando que el fixture responde de forma no degenerada. Los pesos son finitos en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El build queda registrado en build.json con fuentes fijadas, resultados de la puerta y hashes de ficheros.

## Capacidades

- No es un modelo funcional: no genera texto coherente ni resuelve tareas de razonamiento, codigo o matematicas.
- Sirve como fixture de integracion para validar la carga de OlmoeForCausalLM en Transformers.
- Permite verificar contratos de framework (estructura de entradas/salidas, nombres de tensores, dtypes).
- Conserva el tokenizer y la configuracion de generacion del modelo base para pruebas de pipeline.
- Compatible con pruebas de forward, loss y gradientes en float32, bfloat16 y float16.
- No soporta tool calling, agentes ni capacidades multilingues reales (los pesos son aleatorios).
- Util para CI: repositorio de 0,0 GB y 6,7M parametros, apto para entornos con recursos limitados.

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture con AutoModelForCausalLM y verificar que la clase OlmoeForCausalLM se instancia con los nombres de tensores esperados, sin descargar el checkpoint de 7B.
- Validacion de contratos de framework: ejecutar las expectativas recogidas en integrations/transformers/expectations para comprobar que una version de Transformers sigue cumpliendo el contrato de entradas y salidas del modelo.
- CI/CD de librerias: incluir el fixture en pipelines de integracion continua para detectar regresiones en la carga de modelos MoE con un coste de almacenamiento y computo minimo.
- Pruebas de dtypes y precision: verificar comportamiento finito en float32, bfloat16 y float16 (forward, loss, gradientes) en entornos de entrenamiento distribuido.
- Desarrollo de herramientas de tokenizacion: usar el tokenizer.json copiado byte a byte del modelo base para probar pipelines de preprocesado sin los pesos reales.
- Reproducibilidad de fixtures: reconstruir el artefacto con build_fixtures.py --fixture OLMoE-1B-7B-0924-mic y comparar hashes registrados en build.json para auditar cambios.
- Pruebas de sensibilidad a la entrada: reutilizar la puerta de sensibilidad (perturbaciones sobre input_ids) como plantilla para validar otros fixtures.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un test fixture con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido y no se reporta.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; 6,7M parametros en bfloat16 ocupan aproximadamente 13 MB de pesos, mas overhead de activaciones y tokenizer.
- GPU recomendadas: cualquier GPU consumer (GTX 1060 6 GB, RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer y en entornos CPU-only; tambien en CI con runners sin GPU.
- Opciones de despliegue: Transformers (uso documentado en integrations/transformers/usage.md); vLLM, llama.cpp, Ollama y TGI no estan documentados para este fixture y su compatibilidad no esta verificada.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, el coste es despreciable y no representativo del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OLMoE-1B-7B-0924-mic (este) | 6,7M (fixture) | no disponible | Test fixture de integracion | no disponible | Hugging Face (huggingface-mic) |
| allenai/OLMoE-1B-7B-0924 | 7B totales / ~1B activos | no disponible en la informacion | Modelo MoE real para inferencia | no disponible en la informacion | Hugging Face (allenai) |
| Otros fixtures de transformers-mic | Variable (reducidos) | no disponible | Validacion de contratos de framework | no disponible | Hugging Face (huggingface-mic) |

La comparativa directa con modelos de produccion no es significativa: el fixture solo es comparable con otros artefactos de prueba del mismo ecosistema. Para evaluar capacidades reales debe consultarse la ficha del modelo base allenai/OLMoE-1B-7B-0924.

## Limitaciones y advertencias

- Pesos aleatorios (semilla 17): el modelo no produce texto coherente y no debe usarse en produccion ni en evaluaciones de calidad.
- Etiquetado como test-artifact para excluirlo de busquedas de modelos candidatos; usarlo como modelo real es un error de interpretacion.
- Licencia no disponible en la informacion; verificar los terminos del modelo base antes de cualquier redistribucion.
- La configuracion reducida (2 capas) no representa el comportamiento del OLMoE real; los resultados de pruebas de rendimiento no son extrapolables.
- Idiomas soportados no documentados; el tokenizer se copia del base pero los pesos no estan entrenados.
- Compatibilidad con frameworks distintos de Transformers no verificada (vLLM, llama.cpp, TGI, Ollama).
- El repositorio pesa 0,0 GB y algunos ficheros deben regenerarse con build_fixtures.py; no todos los artefactos estan incluidos.
- Riesgo de confusion con el checkpoint original de AllenAI por compartir nombre y estructura de tensores.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/OLMoE-1B-7B-0924-mic
- Modelo base: https://huggingface.co/allenai/OLMoE-1B-7B-0924
- Como se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/OLMoE-1B-7B-0924-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de reduccion (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion (build_fixtures.py): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
