# richardyoung/Qwen2.5-32B-Instruct-heretic1x-general-GGUF

## Resumen

Qwen2.5-32B-Instruct-heretic1x-general GGUF es la distribucion cuantizada en formato GGUF de un modelo derivado de Qwen/Qwen2.5-32B-Instruct al que se le ha aplicado una ablacion direccional de rango 1 para eliminar los mecanismos de rechazo (abliteration). Lo publica el investigador Richard J. Young bajo licencia Apache 2.0, y forma parte del conjunto de modelos evaluados en su articulo sobre comparacion de herramientas de abliteration (Heretic 1.x, Heretic 2.0, OBLITERATUS y publicaciones de la comunidad). El modelo base tiene 32.763.876.352 parametros (aproximadamente 32,8 mil millones) y hereda la arquitectura transformer densa de la familia Qwen2.5.

El proposito declarado no es el de un asistente de proposito general, sino el de servir como material de investigacion sobre eliminacion de rechazos, su medicion y las defensas frente a ella. Segun la model card, el modelo cumple con muchas peticiones que el original rechaza: sobre 972 prompts daninos reservados para evaluacion, el rechazo baja del 76,8 % en el original al 73,4 % (713 de 972) en esta variante, medido con el juez WildGuard. La divergencia KL del primer token respecto al original es de 0,0059.

Esta publicacion concreta contiene una cuantizacion Q4_K_M de 19,9 GB (etiqueta `latest` en Ollama) y una matriz de importancia (imatrix) de 30 MB. El autor anuncia que se iran anadiendo IQ3_M, IQ4_XS, Q5_K_M, Q6_K y Q8_0. Es relevante ahora porque documenta de forma reproducible el proceso de cuantizacion de un modelo abliterado y porque los numeros publicados corresponden al modelo en bf16, no a estas cuantizaciones, lo que deja abierta la pregunta de si la cuantizacion altera el comportamiento de rechazo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2.5) |
| Parametros totales | 32.763.876.352 (32,8 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (publicada, 19,9 GB); IQ3_M, IQ4_XS, Q5_K_M, Q6_K y Q8_0 anunciadas en la model card; imatrix de calibracion (30 MB) |
| Idiomas soportados | en (segun metadatos del repo) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen2.5-32B-Instruct original: un transformer denso de 32,8 mil millones de parametros, sin mezcla de expertos. Sobre esos pesos se aplico Heretic 1.x (heretic-llm 1.4.0), que realiza una ablacion direccional de rango 1 usando direcciones de rechazo de caracter general. El proceso de seleccion descrito en la model card consistio en 200 ensayos y una regla de seleccion que escoge el menor numero de rechazos en el conjunto de desarrollo sujeto a una divergencia KL del primer token menor o igual a 0,01 respecto al original; el ensayo seleccionado obtuvo una KL de 0,0059 y 89 rechazos por palabra clave sobre los 100 prompts de ajuste.

No se detalla en la informacion disponible el volumen de tokens de preentrenamiento ni la composicion del dataset del modelo base, ni si hubo RLHF o DPO en el Qwen2.5-32B-Instruct original. La innovacion tecnica destacable es precisamente la ablacion de rechazos y su metodologia de seleccion, no cambios arquitectonicos. Los ficheros GGUF se construyeron con llama.cpp (commit `468fde9`): conversion con `convert_hf_to_gguf.py --outtype bf16` seguida de `llama-quantize` en CPU, verificando cada fichero de pesos del safetensors publicado (revision `e28d9f0e88b6`) contra su SHA-256. Las cuantizaciones IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M emplean la matriz de importancia calibrada con calibration_datav3 (128 fragmentos de 512 tokens, calculada sobre la build Q8_0); Q6_K y Q8_0 son estaticas. Las sumas SHA-256 estan en `SHA256SUMS`.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-32B-Instruct.
- Razonamiento, matematicas y generacion de codigo, segun las capacidades del modelo base.
- Cumplimiento de peticiones que el modelo original rechaza, tras la ablacion de rechazos (73,4 % de rechazo residual frente a 76,8 % del original sobre 972 prompts daninos).
- Uso como objeto de estudio para medir la eficacia de la abliteration y de las defensas frente a ella.
- Capacidades multilingues: los metadatos del repo declaran unicamente ingles (`en`); no se confirma soporte de otros idiomas en esta publicacion.
- Soporte de tool calling, function calling y agentes: no disponible en la informacion proporcionada para esta variante.
- Capacidades de vision o audio: no disponibles (el modelo base es solo de texto).

## Casos de uso

- Investigacion sobre abliteration: usar el modelo como sujeto de prueba para medir tasas de rechazo con jueces automaticos (por ejemplo, WildGuard) y comparar con el original y con otras herramientas como Heretic 2.0 u OBLITERATUS.
- Evaluacion de robustez de filtros de seguridad: desplegar el modelo en un banco de pruebas aislado para estudiar que tipos de peticiones sigue rechazando y cuales no, y calibrar clasificadores de entrada.
- Estudio del efecto de la cuantizacion en el comportamiento de rechazo: comparar la Q4_K_M publicada con las futuras IQ3_M, Q5_K_M, Q6_K y Q8_0 para determinar si la cuantizacion degrada o altera la ablacion.
- Reproducibilidad de pipelines de cuantizacion: el repositorio documenta commit de llama.cpp, comandos exactos y sumas SHA-256, lo que permite replicar la conversion bf16 a GGUF y verificar la integridad de los ficheros.
- Despliegue local en hardware de consumo para experimentacion: la Q4_K_M de 19,9 GB puede cargarse con llama.cpp u Ollama en estaciones con suficiente memoria, sin necesidad de infraestructura de servidor.
- Analisis de sesgos y alineacion: comparar las respuestas del modelo abliterado con las del Qwen2.5-32B-Instruct original para caracterizar que comportamientos de seguridad se pierden con la ablacion.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los de la model card para el modelo en precision completa (bf16), no para las cuantizaciones:

| Metrica | Original | Este modelo |
|---|---|---|
| Rechazo sobre 972 prompts daninos reservados (juez WildGuard) | 76,8 % | 73,4 % (713/972) |
| Rechazos por palabra clave sobre los 100 prompts de ajuste (ensayo seleccionado) | no disponible | 89 |
| Divergencia KL del primer token respecto al original (ensayo seleccionado) | no aplica | 0,0059 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ni para el modelo abliterado ni para estas cuantizaciones. El autor advierte explicitamente que los ficheros cuantizados no fueron evaluados en el articulo.

## Requisitos de hardware

- VRAM estimada para inferencia: la Q4_K_M ocupa 19,9 GB en disco; con overhead de contexto y cache KV, se recomienda al menos 22-24 GB de memoria disponible para cargarla completa en GPU.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para inferencia comoda en GPU; en consumer, RTX 3090 o RTX 4090 (24 GB) para la Q4_K_M con contexto moderado.
- Cabe en consumer GPU: si, la Q4_K_M en GPUs de 24 GB; las futuras IQ3_M e IQ4_XS reduciran el requisito por debajo de los 20 GB. En GPUs de 16 GB habria que recurrir a offload parcial a CPU.
- Opciones de despliegue: llama.cpp (`llama-cli -hf richardyoung/Qwen2.5-32B-Instruct-heretic1x-general-GGUF:Q4_K_M`), Ollama (`ollama run richardyoung/qwen2.5-32b-instruct-heretic1x-general`), y cualquier runtime compatible con GGUF. No se mencionan vLLM ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazo (972 prompts) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-32B-Instruct-heretic1x-general (este, bf16) | 32,8 B | no disponible | 73,4 % | apache-2.0 | Hugging Face |
| Qwen/Qwen2.5-32B-Instruct (original) | 32,8 B | no disponible | 76,8 % | apache-2.0 | Hugging Face |
| Heretic 2.0 sobre Qwen2.5 | no disponible | no disponible | evaluado en el articulo del autor, cifras no incluidas en la informacion | no disponible | no disponible |
| OBLITERATUS sobre Qwen2.5 | no disponible | no disponible | evaluado en el articulo del autor, cifras no incluidas en la informacion | no disponible | no disponible |

La model card menciona explicitamente que Heretic 1.x, Heretic 2.0, OBLITERATUS y publicaciones de la comunidad se comparan en el articulo de Young, pero los resultados de esas alternativas no se incluyen en la informacion proporcionada. Tampoco se dispone de datos de contexto o benchmarks de calidad para establecer una comparacion mas amplia.

## Limitaciones y advertencias

- El modelo elimina parcialmente los mecanismos de rechazo: sigue rechazando el 73,4 % de los 972 prompts daninos evaluados, pero acepta muchas peticiones que el original rechaza, lo que lo hace inadecuado como asistente de proposito general.
- Los numeros de rechazo y KL corresponden al modelo en bf16; las cuantizaciones publicadas no se evaluaron y la cuantizacion puede alterar el comportamiento de rechazo.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; se hereda el del Qwen2.5-32B-Instruct base.
- Sesgos conocidos: no documentados en la informacion proporcionada; la ablacion puede alterar el comportamiento en dominios sensibles de forma no uniforme.
- Limitaciones de idioma: los metadatos declaran solo ingles; no se confirma el multilingue del modelo base en esta publicacion.
- Licencia Apache 2.0, pero el autor remite a las restricciones de uso del modelo fuente y declara que el uso previsto es la investigacion sobre eliminacion de rechazos y sus defensas; el usuario es responsable del uso licito.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion independiente de estas cuantizaciones.
- El articulo de referencia figura como "arXiv link to be added", por lo que la comparacion formal con Heretic 2.0 y OBLITERATUS no es verificable a partir de la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-heretic1x-general-GGUF
- Modelo base (abliterado, safetensors): https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-heretic1x-general
- Modelo original: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct/blob/main/LICENSE
- Articulo citado: Young, R. J. *The Selection Rule Can Reverse LLM Abliteration Tool Comparisons: Heretic 1.x, Heretic 2.0, OBLITERATUS and Community Releases on Qwen2.5 and Qwen2.5-Coder* (enlace arXiv pendiente de publicacion)
- Repositorio de llama.cpp (herramienta de conversion y cuantizacion): https://github.com/ggerganov/llama.cpp
