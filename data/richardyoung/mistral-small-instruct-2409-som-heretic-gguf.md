# richardyoung/Mistral-Small-Instruct-2409-SOM-heretic-GGUF

## Resumen

Mistral-Small-Instruct-2409-SOM-heretic-GGUF es la distribucion en formato GGUF de un modelo derivado de Mistral Small Instruct 2409 (22.247 millones de parametros) al que se le ha aplicado una ablacion multidireccional de rechazos mediante la herramienta Heretic 2.0, basada en mapas autoorganizados (SOM). El autor de la ficha y de la cuantizacion es Richard J. Young, y el modelo forma parte de un estudio academico sobre la dificultad creciente de eliminar los comportamientos de rechazo en modelos de pesos abiertos.

El modelo base es Mistral Small Instruct 2409, un transformer denso de Mistral AI con 22.2 mil millones de parametros y ventana de contexto de 128.000 tokens (dato de la familia Mistral Small 3, no verificado en la informacion proporcionada para esta revision concreta). La intervencion "heretic" no modifica la arquitectura: actua sobre las direcciones de activacion asociadas al rechazo, reduciendo la tasa de negativas del 55,7% al 3,7% sobre 972 prompts daninos reservados, con una divergencia KL de primer token de 0,062 respecto al original.

Su relevancia es doble: por un lado, permite ejecutar en hardware de consumo un modelo de 22B con cuantizaciones Q4_K_M (13,3 GB) y Q8_0 (23,6 GB); por otro, sirve como material de investigacion sobre seguridad, alineamiento y defensas frente a la eliminacion de rechazos. El autor lo publica explicitamente como herramienta de investigacion, no como asistente de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Mistral Small Instruct 2409); no se detalla mas en la informacion disponible |
| Parametros totales | 22.247.282.688 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (13,3 GB), Q8_0 (23,6 GB); anunciadas IQ3_M, IQ4_XS, Q5_K_M y Q6_K; matriz de importancia (imatrix) de 24 MB |
| Idiomas soportados | en (ingles) |
| Licencia | mrl (Mistral Research License 0.1, https://mistral.ai/licenses/MRL-0.1.md) |
| Formato de pesos | GGUF (generado con llama.cpp, commit 468fde9, desde safetensors bf16) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del Mistral Small Instruct 2409 original, un transformer denso de 22.247 millones de parametros. La modificacion aplicada es una ablacion de rechazos mediante Heretic 2.0, que emplea mapas autoorganizados (SOM) para localizar multiples direcciones de activacion asociadas a la negativa a responder y eliminarlas de forma combinada. El proceso se selecciono mediante una busqueda de 100 ensayos con la regla de menor numero de rechazos por palabra clave en el conjunto de desarrollo, sujeto a una divergencia KL de primer token inferior o igual a 0,1 respecto al modelo original.

Los datos de entrenamiento originales de Mistral Small Instruct 2409 no se detallan en la informacion proporcionada (numero de tokens, composicion del corpus, fases de RLHF o DPO). Tampoco se documenta el proceso de calibracion mas alla de la matriz de importancia: calibration_datav3, 128 fragmentos de 512 tokens calculados sobre la build Q8_0, aplicada a IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M; Q6_K y Q8_0 son estaticas. La conversion a GGUF se realizo con `convert_hf_to_gguf.py --outtype bf16` y posterior `llama-quantize` sobre CPU, verificando cada archivo de pesos del safetensors publicado (revision 37bff6925f20) contra su SHA-256.

## Capacidades

- Generacion de texto conversacional en ingles, con el formato de instrucciones del Mistral Small original.
- Comportamiento de rechazo muy reducido: 3,7% de negativas sobre 972 prompts daninos reservados (frente al 55,7% del original), segun el juez WildGuard y medicion sobre el modelo en bf16.
- Razonamiento y respuesta a instrucciones heredados del modelo base (no se detallan capacidades especificas adicionales en la informacion disponible).
- Compatibilidad con llama.cpp y Ollama, incluida la ejecucion directa desde Hugging Face (`llama-cli -hf ...`, `ollama run hf.co/...`).
- Etiquetas del repositorio que indican compatibilidad con endpoints (`endpoints_compatible`) y uso conversacional.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion proporcionada.

## Casos de uso

- Investigacion sobre eliminacion de rechazos: el modelo permite medir la eficacia de tecnicas de ablacion (Heretic 2.0 con SOM) y comparar tasas de negativa antes y despues, con la advertencia de que las cuantizaciones no fueron evaluadas en el paper y pueden alterar el comportamiento.
- Evaluacion de defensas y mecanismos de seguridad: util para probar clasificadores de contenido, filtros de salida y sistemas de moderacion frente a un modelo con rechazos suprimidos, midiendo su tasa de deteccion sobre las respuestas generadas.
- Estudio de degradacion por cuantizacion: al existir builds Q4_K_M y Q8_0 (y otras anunciadas), permite analizar como la cuantizacion afecta a la divergencia KL, la calidad del texto y la tasa de rechazo.
- Despliegue local en hardware de consumo: la build Q4_K_M (13,3 GB) se ejecuta con Ollama o llama.cpp en equipos con GPU de gama alta o incluso en CPU, lo que facilita experimentos reproducibles sin infraestructura de servidor.
- Analisis de sesgos y comportamiento en ingles: el modelo esta limitado al ingles, por lo que resulta adecuado para estudios comparativos de sesgo y estilo en ese idioma sobre un modelo de 22B.
- Reproducibilidad de pipelines de cuantizacion: los SHA-256 publicados en `SHA256SUMS` y el procedimiento documentado (commit de llama.cpp, outtype bf16, imatrix) permiten replicar la build y verificar la integridad de los pesos.

## Benchmarks y rendimiento

Resultados publicados en la model card para el modelo en precision completa (bf16), no para las cuantizaciones:

| Metrica | Original | Este modelo |
|---|---|---|
| Rechazo sobre 972 prompts daninos reservados (juez WildGuard) | 55,7% | 3,7% (36/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (ensayo seleccionado) | no disponible | 5 |
| Divergencia KL de primer token respecto al original (ensayo seleccionado) | no disponible | 0,062 |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los archivos cuantizados no fueron evaluados en el paper.

## Requisitos de hardware

- VRAM estimada para Q8_0: aproximadamente 23,6 GB de pesos mas overhead de contexto y cache KV; requiere GPU de 24 GB o superior (RTX 3090/4090, A6000, L40S, A100 40GB, H100).
- VRAM estimada para Q4_K_M: aproximadamente 13,3 GB de pesos mas overhead; cabe en GPUs de 16 GB (RTX 4060 Ti 16GB, RTX 4070 Ti Super, RTX 4080) y en 24 GB con contexto amplio.
- Las builds IQ3_M e IQ4_XS anunciadas reducirian aun mas el requisito, pero no se dispone de sus tamanos en la informacion proporcionada.
- Despliegue: llama.cpp (`llama-cli`, `llama-server`) y Ollama son los soportados explicitamente; el tag `endpoints_compatible` sugiere integracion con endpoints, aunque no se detallan otros motores (vLLM, TGI) en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazo (972 prompts) | Licencia | Formato |
|---|---|---|---|---|---|
| Mistral-Small-Instruct-2409-SOM-heretic-GGUF (este) | 22,2B | no disponible | 3,7% (bf16) | mrl | GGUF |
| mistralai/Mistral-Small-Instruct-2409 (original) | 22,2B | no disponible | 55,7% | mrl | safetensors |
| richardyoung/Mistral-Small-Instruct-2409-SOM-heretic (bf16) | 22,2B | no disponible | 3,7% | mrl | safetensors |

No se dispone de datos de benchmark de capacidad ni de modelos comparables adicionales (por ejemplo, otras variantes abliterated de Mistral Small) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: el autor lo publica para estudiar la eliminacion de rechazos y sus defensas, no como asistente de proposito general.
- La ablacion elimina gran parte de los rechazos: el modelo cumple muchas peticiones que el original rechaza, lo que implica riesgo de generar contenido danino, ilegal o inseguro si se usa sin moderacion.
- Las cuantizaciones no fueron evaluadas en el paper; la cuantizacion puede cambiar el comportamiento de rechazo respecto a las cifras bf16 publicadas.
- Solo soporta ingles; no se documenta multilingue.
- Licencia mrl (Mistral Research License 0.1) con las mismas restricciones de uso que el modelo fuente; el uso comercial esta sujeto a dicha licencia y el usuario es responsable del uso licito.
- Riesgo de alucinacion y sesgos heredados del modelo base; no se documentan evaluaciones especificas de sesgo en la informacion disponible.
- La longitud de contexto no se especifica en la informacion proporcionada, por lo que no debe asumirse la del modelo original sin verificar.
- Repositorio sin descargas ni likes en el momento de la consulta y con fecha de creacion futura (2026-11-11) en los metadatos, lo que conviene tener en cuenta para la trazabilidad.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Mistral-Small-Instruct-2409-SOM-heretic-GGUF
- Modelo base (bf16): https://huggingface.co/richardyoung/Mistral-Small-Instruct-2409-SOM-heretic
- Modelo original: https://huggingface.co/mistralai/Mistral-Small-Instruct-2409
- Licencia MRL-0.1: https://mistral.ai/licenses/MRL-0.1.md
- Paper citado (arXiv, enlace pendiente de publicacion): Is Abliteration Getting Harder? Refusal Removal from Open-Weight LLMs with Heretic on Qwen3.8, Gemma 4, Olmo 3.1 and Mistral Small 3.2 Versus Their Predecessors, Richard J. Young, 2026.
