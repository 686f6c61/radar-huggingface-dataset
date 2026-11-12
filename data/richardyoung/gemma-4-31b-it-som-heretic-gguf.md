# richardyoung/gemma-4-31B-it-SOM-heretic-GGUF

## Resumen

`richardyoung/gemma-4-31B-it-SOM-heretic-GGUF` es la distribucion en formato GGUF de un modelo derivado de `google/gemma-4-31B-it` al que se le ha eliminado la capacidad de rechazo (abliteration) mediante la tecnica Heretic 2.0, basada en ablacion multidireccional con mapas autoorganizados (SOM). El autor, Richard J. Young, publica estos pesos como material de investigacion sobre eliminacion de rechazos y su medicion, no como asistente de proposito general. El modelo cuenta con 30.697.345.596 parametros (aproximadamente 30,7 mil millones) y se distribuye principalmente en cuantizacion Q4_K_M de 18,7 GB.

La relevancia de esta ficha es doble: por un lado documenta un caso concreto de abliteration sobre la familia Gemma 4, y por otro permite evaluar hasta que punto la cuantizacion GGUF altera el comportamiento de rechazo de un modelo previamente modificado. El autor advierte explicitamente de que los ficheros cuantizados no fueron evaluados en el articulo de referencia y que la cuantizacion puede cambiar la conducta de rechazo.

El modelo es solo texto: aunque el modelo base acepta imagenes, el proyector de vision no se incluye en este repositorio. La licencia declarada es Apache 2.0, con enlace a la licencia especifica de Gemma 4 de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4, transformer; detalles no especificados en la informacion proporcionada) |
| Parametros totales | 30.697.345.596 (30,7 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (18,7 GB, publicada); IQ3_M, IQ4_XS, Q5_K_M, Q6_K, Q8_0 (anunciadas, en proceso de publicacion); matriz de importancia `imatrix` (28 MB) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (llama.cpp), compatible con Ollama |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Gemma 4 (numero de capas, atencion, uso de MoE, etc.). Lo que si se documenta es el proceso de modificacion: se parte de `richardyoung/gemma-4-31B-it-SOM-heretic`, una version abliterada de `google/gemma-4-31B-it` generada con Heretic 2.0, un fork del estudio que implementa ablacion multidireccional mediante mapas autoorganizados (SOM). La seleccion de la direccion de ablacion se realizo con una busqueda de 100 ensayos y la regla de seleccion "menos rechazos por palabra clave en dev con divergencia KL de primer token <= 0,1".

El resultado en el modelo de precision completa (bf16) es una reduccion del rechazo del 89,3% al 67,8% sobre 972 prompts daninos reservados, juzgados con WildGuard, con una divergencia KL de primer token respecto al original de 0,055 y 82 rechazos por palabra clave sobre los 100 prompts de ajuste. Los ficheros GGUF se construyeron a partir de los safetensors publicos (revision `5f5a3f40c877`, verificados con SHA-256) usando llama.cpp (commit `468fde9`): conversion con `convert_hf_to_gguf.py --outtype bf16` y cuantizacion con `llama-quantize` en CPU. Las cuantizaciones IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M usan una matriz de importancia calculada sobre `calibration_datav3` (128 fragmentos de 512 tokens) a partir del build Q8_0; Q6_K y Q8_0 son estaticas.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Gemma 4 31B instruct.
- Comportamiento de rechazo reducido: el modelo accede a muchas peticiones que el original rechaza (tasa de rechazo del 67,8% frente al 89,3% del original en el conjunto de evaluacion del articulo).
- Capacidad de vision no incluida: el proyector de imagenes del modelo base no forma parte de este repositorio.
- Soporte de tool calling, function calling y agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Modo thinking, audio u otras capacidades especiales: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion sobre abliteration: usar el modelo para reproducir o ampliar los experimentos del articulo de Young sobre eliminacion de rechazos en Gemma 4, comparando la tasa de rechazo antes y despues de la modificacion.
- Evaluacion del impacto de la cuantizacion en el comportamiento de rechazo: comparar Q4_K_M con las futuras IQ3_M, IQ4_XS, Q5_K_M, Q6_K y Q8_0 para medir como varia la tasa de rechazo segun el nivel de cuantizacion, algo que el autor senala como no evaluado.
- Desarrollo de defensas y clasificadores de seguridad: emplear el modelo como generador de casos adversarios controlados para entrenar o validar filtros de contenido y jueces automaticos como WildGuard.
- Analisis de robustez de pipelines de moderacion: integrar el modelo en un banco de pruebas que mida la eficacia de capas de moderacion antes de desplegar asistentes basados en Gemma 4.
- Estudio de divergencia KL y preservacion de capacidades: usar la metrica de divergencia de primer token (0,055 en bf16) como referencia para analizar cuanto se degrada el modelo respecto al original en tareas neutras.
- Despliegue local de referencia en llama.cpp u Ollama: ejecutar el Q4_K_M con `ollama run hf.co/richardyoung/gemma-4-31B-it-SOM-heretic-GGUF:Q4_K_M` o `llama-cli -hf ...` para pruebas de inferencia en entornos de investigacion con hardware de consumo o servidor.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible corresponden al modelo de precision completa (bf16), no a los ficheros GGUF:

| Metrica | Original | Este modelo (bf16) |
|---|---|---|
| Rechazo en 972 prompts daninos reservados (juez WildGuard) | 89,3% | 67,8% (659/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (ensayo seleccionado) | no disponible | 82 |
| Divergencia KL de primer token respecto al original | no disponible | 0,055 |

No se han publicado resultados de benchmarks de tareas generales (MMLU, HumanEval, GSM8K, etc.) ni de los ficheros cuantizados en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa 18,7 GB, por lo que requiere al menos unos 20 GB de VRAM para cargarse completo en GPU; las cuantizaciones Q6_K y Q8_0, aun no publicadas, seran considerablemente mayores.
- GPU recomendadas: no especificadas en la informacion proporcionada; por tamano, el Q4_K_M encaja en GPUs de 24 GB (RTX 4090, A10G, L4 de 24 GB) y en A100/H100 para mayor margen y throughput.
- GPU de consumo: el Q4_K_M de 18,7 GB no cabe en GPUs de 8-16 GB; las cuantizaciones IQ3_M e IQ4_XS anunciadas podrian acercarse a ese rango, pero sus tamanos no se han publicado.
- Opciones de despliegue: llama.cpp (`llama-cli -hf`) y Ollama (`ollama run hf.co/...`), segun los comandos de la model card; vLLM y TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazo (972 prompts, WildGuard) | Licencia | Formato |
|---|---|---|---|---|---|
| `richardyoung/gemma-4-31B-it-SOM-heretic-GGUF` (Q4_K_M) | 30,7 B | no disponible | 67,8% (bf16; cuantizado no evaluado) | apache-2.0 | GGUF |
| `google/gemma-4-31B-it` (original) | 30,7 B | no disponible | 89,3% | licencia Gemma 4 | safetensors |
| `richardyoung/gemma-4-31B-it-SOM-heretic` (bf16) | 30,7 B | no disponible | 67,8% | apache-2.0 | safetensors |

No se dispone de datos comparativos con otros modelos abliterados (Qwen3.8, Olmo 3.1, Mistral Small 3.2) en la informacion proporcionada, mas alla de que el articulo los evalua junto a Gemma 4.

## Limitaciones y advertencias

- Modelo de investigacion, no asistente de proposito general: el autor lo declara explicitamente y lo orienta al estudio de la eliminacion de rechazos y de las defensas frente a ella.
- Eliminacion parcial de rechazos: la tasa de rechazo baja del 89,3% al 67,8%, no a cero; el comportamiento sigue siendo variable y depende del prompt.
- Cuantizacion no evaluada: los ficheros GGUF no fueron evaluados en el articulo y la cuantizacion puede alterar la conducta de rechazo, por lo que los numeros de la tabla no son extrapolables al Q4_K_M.
- Solo texto: el proyector de vision del modelo base no esta incluido.
- Idioma: etiquetado unicamente como ingles; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al tratarse de un derivado de Gemma 4, hereda los sesgos del modelo base, no cuantificados aqui.
- Licencia: Apache 2.0 con enlace a la licencia de Gemma 4 de Google; deben revisarse las restricciones de uso del modelo base antes de cualquier uso comercial.
- Uso legal: el autor declara que los usuarios son responsables del uso licito del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/richardyoung/gemma-4-31B-it-SOM-heretic-GGUF
- Modelo base (bf16): https://huggingface.co/richardyoung/gemma-4-31B-it-SOM-heretic
- Modelo original de Google: https://huggingface.co/google/gemma-4-31B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Articulo de referencia: Richard J. Young, "Is Abliteration Getting Harder? Refusal Removal from Open-Weight LLMs with Heretic on Qwen3.8, Gemma 4, Olmo 3.1 and Mistral Small 3.2 Versus Their Predecessors" (2026), enlace arXiv pendiente de publicacion.
