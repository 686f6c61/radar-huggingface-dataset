# huggingface-mic/granite-3.0-1b-a400m-instruct-mic

## Resumen

`granite-3.0-1b-a400m-instruct-mic` es un artefacto de prueba publicado por la organizacion `huggingface-mic` en Hugging Face. No es un modelo entrenado ni utilizable para inferencia real: se trata de un *fixture* (modelo reducido) generado a partir de `ibm-granite/granite-3.0-1b-a400m-instruct` de IBM, con pesos aleatorios (semilla 17) y una configuracion reducida a 2 capas ocultas. Su proposito es servir como banco de pruebas reproducible para validar la integracion de la arquitectura `GraniteMoeForCausalLM` en distintos frameworks (principalmente Transformers), verificando contratos de entrada/salida sin necesidad de descargar ni ejecutar el checkpoint completo de IBM.

El repositorio contiene unicamente 3.367.936 parametros reales segun los tensores en safetensors, frente a los aproximadamente 1.300 millones del modelo base (1B totales, 400M activos en su configuracion MoE original). Los ficheros de procesador (tokenizer, `generation_config.json`, `special_tokens_map.json`, etc.) se copian byte a byte desde el checkpoint de IBM, mientras que los pesos se generan de forma aleatoria y se guardan en `bfloat16`. Los pesos pasaron una compuerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato mueve los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, produce 0,0217).

La relevancia de esta ficha es acotada: el artefacto esta etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos. Resulta util para ingenieros que trabajen en `transformers-mic`, en la validacion de integraciones de arquitecturas MoE o en pipelines de CI que necesiten un checkpoint ligero con la misma firma de tensores que el modelo real de IBM. No debe confundirse con un modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `GraniteMoeForCausalLM` (transformer decoder-only con capas MoE), configuracion reducida a `num_hidden_layers=2` |
| Parametros totales | 3.367.936 (fixture); el modelo base IBM declara 1B totales / 400M activos |
| Parametros activos | no disponible en el fixture (el base es MoE con ~400M activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en `bfloat16`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `safetensors` (guardados en `bfloat16`) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura del modelo base de IBM, un transformer causal decoder-only con mezcla de expertos (`GraniteMoeForCausalLM`). La unica diferencia estructural respecto al checkpoint original es la reduccion del numero de capas ocultas a 2, aplicada mediante la regla generica de `sweep.py` del repositorio `transformers-mic`. Los nombres de tensores coinciden exactamente con los del checkpoint real, de modo que el fixture puede cargarse con el mismo codigo que el modelo completo. Los ficheros de tokenizer y configuracion de generacion se copian sin modificacion desde `ibm-granite/granite-3.0-1b-a400m-instruct`.

No hubo entrenamiento. Los pesos se inicializan aleatoriamente con semilla 17 y se validan con una compuerta de sensibilidad a la entrada que exige que cualquier perturbacion de las entradas del contrato desplace los logits al menos 0,001. El artefacto es finito en `float32`, `bfloat16` y `float16` tanto en forward como en calculo de perdida y gradientes. El `build.json` registra las fuentes fijadas, los resultados de la compuerta y los hashes de los ficheros, lo que permite reconstruir el fixture con `python example/build_fixtures.py --fixture granite-3.0-1b-a400m-instruct-mic`. No se dispone de informacion sobre datos de entrenamiento, RLHF/DPO ni innovaciones tecnicas del modelo base en la informacion proporcionada.

## Capacidades

- El artefacto no tiene capacidades generativas reales: los pesos son aleatorios y no producen texto coherente.
- Sirve como fixture de integracion para validar la carga de `GraniteMoeForCausalLM` en Transformers y en otros frameworks compatibles.
- Permite verificar el contrato de entradas/salidas (logits, `attention_mask`, `generation_config`) sin descargar el checkpoint de 1B parametros.
- Replica la firma de tensores del modelo base, por lo que valida rutas de codigo que dependen de nombres y formas de parametros.
- Incluye un directorio `integrations/transformers/expectations` con expectativas ejecutables del framework.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingues reales: cualquier comportamiento de ese tipo seria una alucinacion del fixture.

## Casos de uso

- CI/CD de integraciones de Transformers: usar el fixture como checkpoint ligero en tests automatizados que verifiquen que `GraniteMoeForCausalLM` carga, ejecuta forward y calcula gradientes en `float32`, `bfloat16` y `float16` sin depender del modelo de 1B.
- Validacion de contratos de framework: ejecutar `integrations/transformers/expectations` en pipelines de integracion continua para detectar regresiones en la API de Transformers antes de probar con el checkpoint real de IBM.
- Desarrollo de kernels y operadores MoE: probar rutas de codigo especificas de mezcla de expertos con un modelo de 3,4M parametros que cabe en cualquier GPU o incluso en CPU.
- Reproducibilidad de research: reconstruir el fixture con `build_fixtures.py` y comparar hashes de `build.json` para auditar cambios en la generacion de fixtures.
- Pruebas de cuantizacion y dtypes: verificar que el modelo es finito en `float32`, `bfloat16` y `float16` antes de aplicar tecnicas de cuantizacion al modelo real.
- Formacion y documentacion: usar el repositorio como ejemplo didactico de como estructurar un fixture con pesos, uso ejecutable y expectativas de framework en un unico repositorio.
- Validacion de tokenizer: al copiarse los ficheros de procesador byte a byte desde IBM, sirve para probar pipelines de tokenizacion identicos a los del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto es un fixture con pesos aleatorios y no es evaluable en tareas de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en `bfloat16` (3,4M parametros), despreciable frente a cualquier GPU moderna.
- GPU recomendadas: cualquiera; tambien ejecutable en CPU sin problema.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) y en entornos sin GPU.
- Opciones de despliegue: Transformers (ruta principal soportada), con posibilidad de usar `vLLM`, `llama.cpp` u `Ollama` solo si aceptan la arquitectura `GraniteMoeForCausalLM`; no se documenta soporte en la informacion disponible.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la latencia seria del orden de microsegundos, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| `granite-3.0-1b-a400m-instruct-mic` (este) | 3,4M (fixture) | no disponible | no disponible | Fixture de integracion |
| `ibm-granite/granite-3.0-1b-a400m-instruct` | 1B totales / 400M activos | no disponible | no disponible | Modelo instructivo real de IBM |
| Otros fixtures de `huggingface-mic` | variable (reducidos) | no disponible | no disponible | Fixtures de integracion para otras arquitecturas |

La comparativa directa con modelos de produccion no es significativa: el artefacto solo es comparable con otros fixtures del mismo repositorio `transformers-mic`. Frente al modelo base de IBM, comparte arquitectura, tokenizer y nombres de tensores, pero carece de pesos entrenados y de capacidades generativas.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no genera texto coherente ni responde a instrucciones; cualquier salida es ruido estadistico.
- Etiquetado como `test-artifact`: no debe usarse en produccion ni incluirse en busquedas de modelos candidatos.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; contactar con el autor antes de cualquier uso fuera de pruebas.
- Idiomas no disponibles: al no haber entrenamiento, no hay soporte linguistico real.
- Contexto no disponible: la configuracion reducida a 2 capas no refleja la ventana de contexto del modelo base.
- Riesgo de confusion: el nombre incluye `granite-3.0-1b-a400m-instruct`, lo que puede llevar a error si se descarga pensando que es el modelo de IBM; verificar siempre el tag `test-artifact`.
- Sin garantias de mantenimiento: el repositorio tiene 0 likes y fue creado en octubre de 2026; puede quedar obsoleto si cambia la API de Transformers.
- No apto para evaluaciones de calidad, sesgos o alucinacion: cualquier metrica obtenida con este fixture no es extrapolable al modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/granite-3.0-1b-a400m-instruct-mic
- Modelo base IBM: https://huggingface.co/ibm-granite/granite-3.0-1b-a400m-instruct
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de reduccion `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/granite-3.0-1b-a400m-instruct-mic.html
- Manifiesto de contrato: `integration.json` (en el repositorio)
- Uso en Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
- Procedencia del fixture: `build.json` (en el repositorio)
