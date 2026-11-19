# huggingface-mic/GLM-4-9B-0414-mic

## Resumen

`huggingface-mic/GLM-4-9B-0414-mic` no es un modelo utilizable, sino un artefacto de prueba (fixture) derivado de `zai-org/GLM-4-9B-0414`. Lo publica la organizacion `huggingface-mic` para validar contratos de integracion con frameworks (principalmente Transformers), y esta etiquetado explicitamente como `test-artifact` para excluirlo de las busquedas de modelos candidatos. Su relevancia es, por tanto, puramente de ingenieria: sirve como banco de pruebas reproducible para verificar que una implementacion de `Glm4ForCausalLM` carga, ejecuta y propaga gradientes correctamente.

El repositorio contiene solo 19.473.216 parametros reales (unos 19,5 millones, segun los safetensors) frente a los aproximadamente 9.000 millones del modelo base GLM-4-9B-0414. La reduccion se ha hecho con una regla generica de `sweep.py` que rebaja `num_hidden_layers` a 2, manteniendo la misma arquitectura `Glm4ForCausalLM` y los mismos nombres de tensores que el checkpoint original. Los pesos son aleatorios (semilla 17), no entrenados, y se guardan en `bfloat16`.

El valor practico para un desarrollador es acotado: no debe usarse para inferencia real, generacion de texto ni evaluacion de calidad. Si resulta util para CI de librerias, pruebas de tokenizadores y validacion de plantillas de chat, ya que los ficheros de procesador (`tokenizer.json`, `chat_template.jinja`, `tokenizer_config.json`, `special_tokens_map.json`, `generation_config.json`, `LICENSE`) se copian byte a byte del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`Glm4ForCausalLM`), 2 capas ocultas por reduccion del config original |
| Parametros totales | 19.473.216 (aproximadamente 19,5 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; se declara finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible en la ficha de Hugging Face; el repo incluye un fichero `LICENSE` copiado del modelo base |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura es la de GLM-4 causal LM (`Glm4ForCausalLM`), pero con el config reducido a 2 capas ocultas mediante la regla generica de `sweep.py` del proyecto `transformers-mic`. No hay entrenamiento: los pesos son aleatorios con semilla 17 y se aceptaron porque superaron la puerta de sensibilidad a entradas (toda perturbacion de las entradas del contrato desplaza los logits al menos 0,001; el caso mas debil, `input_ids:roll_batch`, alcanza 0,393). Los nombres de tensores coinciden con los del checkpoint real, lo que permite ejercitar rutas de carga y ejecucion sin descargar los pesos completos.

Los ficheros de procesador se copian literalmente de `zai-org/GLM-4-9B-0414`: `LICENSE`, `chat_template.jinja`, `generation_config.json`, `special_tokens_map.json`, `tokenizer.json` y `tokenizer_config.json`. El artefacto se guarda en `bfloat16`, el dtype por defecto del modelo base, y se verifica que el forward, la loss y los gradientes son finitos en float32, bfloat16 y float16. La clave de fixture es `40271c95510c` y el build queda registrado en `build.json` con fuentes fijadas, resultados de las puertas y hashes de ficheros.

## Capacidades

- Carga y ejecucion de la arquitectura `Glm4ForCausalLM` en Transformers con un coste minimo de descarga (repositorio de 0,1 GB).
- Verificacion de contratos de integracion: manifest en `integration.json`, guia de uso en `integrations/transformers/usage.md` y expectativas en `integrations/transformers/expectations`.
- Pruebas de forward, calculo de loss y retropropagacion de gradientes en float32, bfloat16 y float16.
- Validacion de tokenizador y plantilla de chat heredados del modelo base (mismos ficheros byte a byte).
- Comprobacion de sensibilidad a entradas mediante perturbaciones controladas sobre `input_ids`.
- No soporta generacion de texto de calidad, razonamiento, codigo, matematicas, vision, tool calling ni comportamiento agentico: los pesos son aleatorios.

## Casos de uso

- CI de librerias de inferencia: ejecutar tests de carga y forward de `Glm4ForCausalLM` en cada pull request sin descargar los 9 B de parametros del modelo real, usando este fixture de 19,5 M como sustituto.
- Validacion de tokenizadores y plantillas de chat: al copiarse `tokenizer.json` y `chat_template.jinja` byte a byte del modelo base, sirve para comprobar que una integracion renderiza correctamente las conversaciones antes de pasar al checkpoint completo.
- Pruebas de compatibilidad de dtype: verificar que un pipeline acepta bfloat16, float16 y float32 comprobando que forward, loss y gradientes permanecen finitos.
- Desarrollo de utilidades de conversion y serializacion: los nombres de tensores coinciden con el checkpoint real, de modo que scripts de mapeo, sharding o conversion de formato pueden probarse a escala reducida.
- Benchmarking de infraestructura de test: medir tiempos de arranque, cacheado de pesos y overhead de carga en runners de CI con un artefacto de 0,1 GB.
- Reproducibilidad de artefactos: reconstruir el fixture con `python example/build_fixtures.py --fixture GLM-4-9B-0414-mic` y contrastar hashes contra `build.json` para auditar la procedencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM para inferencia: inferior a 1 GB en bfloat16 (19,5 M de parametros, aproximadamente 39 MB de pesos) mas overhead de activaciones y runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tambien ejecutable en CPU.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3050, RTX 4060, RTX 4090 y superiores.
- Despliegue: Transformers es la via documentada en el repositorio; vLLM, llama.cpp, Ollama o TGI no estan verificados en la informacion disponible.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas con pesos aleatorios, las cifras no serian representativas de ningun caso real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/GLM-4-9B-0414-mic` | 19,5 M | no disponible | Fixture de test para contratos de integracion | no disponible | Hugging Face (2.476 descargas) |
| `zai-org/GLM-4-9B-0414` | aproximadamente 9 B | no disponible en esta ficha | Modelo causal de proposito general | no disponible en esta ficha | Hugging Face (modelo base) |
| Fixtures equivalentes de `transformers-mic` | variable, del orden de millones | no disponible | Pruebas de integracion de otras arquitecturas | no disponible | Hugging Face |

La comparacion relevante es con el modelo base: mismo tokenizador, misma plantilla de chat y mismos nombres de tensores, pero 460 veces menos parametros y pesos no entrenados. Frente a otros fixtures del mismo proyecto, comparte metodologia (`sweep.py`, `build_fixtures.py`) y formato de contrato.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y la salida no tiene significado. No debe desplegarse en produccion ni usarse para evaluar calidad.
- El config esta reducido a 2 capas ocultas, por lo que el comportamiento numerico no reproduce el del checkpoint de 9 B.
- La licencia no figura en la ficha de Hugging Face; el repositorio incluye un `LICENSE` copiado del modelo base, que conviene revisar antes de cualquier uso.
- No hay informacion sobre sesgos, idiomas o riesgos de alucinacion porque no se ha entrenado con datos.
- La longitud de contexto no esta declarada en la informacion disponible.
- Esta etiquetado como `test-artifact` para quedar fuera de las busquedas de modelos candidatos; usarlo como modelo de referencia en documentacion o demos seria un error.
- El repositorio solo incluye pesos reducidos, uso y expectativas; otros ficheros deben regenerarse con `build_fixtures.py`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/GLM-4-9B-0414-mic
- Modelo base: https://huggingface.co/zai-org/GLM-4-9B-0414
- Como se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/GLM-4-9B-0414-mic.html
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Regla de reduccion (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
