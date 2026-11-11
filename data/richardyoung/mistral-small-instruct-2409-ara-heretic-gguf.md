# richardyoung/Mistral-Small-Instruct-2409-ARA-heretic-GGUF

## Resumen

Mistral-Small-Instruct-2409-ARA-heretic-GGUF es una distribucion en formato GGUF del modelo richardyoung/Mistral-Small-Instruct-2409-ARA-heretic, una version "abliterada" (con el mecanismo de rechazo eliminado) del Mistral Small Instruct 2409 original de Mistral AI. La abliteracion se realizo con Heretic 2.0 y su metodo Arbitrary-Rank Ablation (ARA), una tecnica de optimizacion que busca reducir las respuestas de rechazo minimizando la divergencia KL respecto al modelo original. El resultado es un modelo que responde a peticiones que el original rechazaria, publicado explicitamente como objeto de investigacion sobre eliminacion de rechazos.

El modelo base conserva la arquitectura y el tamano del Mistral Small 2409 (22.247.282.688 parametros, aproximadamente 22,2 mil millones), aunque la model card no detalla la arquitectura interna ni la longitud de contexto. Esta distribucion GGUF esta pensada para ejecucion local con llama.cpp y Ollama, e incluye cuantizaciones Q4_K_M (13,3 GB) y Q8_0 (23,6 GB), ademas de una matriz de importancia (imatrix) para cuantizaciones de menor precision.

La relevancia de esta ficha es doble: por un lado, documenta un artefacto de investigacion sobre abliteracion y su evaluacion; por otro, advierte de que no es un asistente de proposito general y de que su licencia (MRL 0.1 de Mistral) impone restricciones de uso. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 11 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Mistral Small Instruct 2409; transformer, segun el modelo base, no confirmado en la model card) |
| Parametros totales | 22.247.282.688 (22,2 B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0; anunciadas IQ3_M, IQ4_XS, Q5_K_M, Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | mrl (Mistral Research License 0.1) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base; solo indica que deriva de mistralai/Mistral-Small-Instruct-2409 y que la intervencion se aplico con Heretic 2.0 mediante Arbitrary-Rank Ablation (ARA), un metodo de optimizacion que busca eliminar la direccion de rechazo en el espacio de activaciones. La seleccion de la trial se realizo con la regla "menos rechazos por palabra clave en el conjunto de desarrollo con divergencia KL de primer token <= 0,1", sobre una busqueda de 100 trials. El trial seleccionado presenta 4 rechazos por palabra clave sobre los 100 prompts de ajuste y una divergencia KL de primer token de 0,066 respecto al original.

Los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF/DPO) no se detallan en la informacion proporcionada. La conversion a GGUF se realizo con llama.cpp (commit 468fde9): convert_hf_to_gguf.py con --outtype bf16 y posterior llama-quantize sobre CPU, verificando cada archivo de pesos del safetensors publicado (revision 3fd9a9265367) contra su SHA-256. Las cuantizaciones IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M usan una matriz de importancia calculada sobre la build Q8_0 (calibration_datav3, 128 chunks de 512 tokens); Q6_K y Q8_0 son estaticas.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del Mistral Small Instruct 2409.
- Respuesta a peticiones que el modelo original rechaza: la tasa de rechazo cae del 55,7% al 4,9% sobre 972 prompts daninos retenidos (juez WildGuard), segun los resultados del modelo en precision completa.
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno (pipeline text-generation, tag conversational).
- Compatibilidad con llama.cpp y Ollama, lo que permite ejecucion local y despliegue en entornos sin GPU de datacenter.
- Compatibilidad con endpoints (tag endpoints_compatible).
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Investigacion sobre abliteracion: el modelo sirve como artefacto para estudiar la eliminacion de rechazos, medir su efecto con jueces automaticos (WildGuard) y evaluar defensas frente a ella, tal como plantea el paper asociado.
- Evaluacion de robustez de salvaguardas: permite comparar la tasa de rechazo del original (55,7%) frente a la del modelo abliterado (4,9%) en un conjunto fijo de 972 prompts, como banco de pruebas para clasificadores de seguridad.
- Analisis de degradacion por cuantizacion: al ofrecer Q4_K_M y Q8_0 del mismo modelo, permite medir como la cuantizacion altera el comportamiento de rechazo, advertencia explicita de la model card.
- Despliegue local de bajo coste en ingles: con Q4_K_M (13,3 GB) puede ejecutarse en una GPU consumer de 16-24 GB o en CPU con llama.cpp para tareas de generacion de texto sin requisitos de alta precision.
- Reproducibilidad de pipelines GGUF: los SHA-256 publicados y el procedimiento de conversion documentado permiten reproducir la build y verificar la integridad de los pesos.
- Estudio de divergencia KL y fidelidad al modelo original: la metrica de KL de primer token (0,066) permite analizar cuanto se desvia el modelo abliterado del original en la distribucion de salida.
- Pruebas de red teaming controladas: util para generar respuestas a prompts que el original rechaza y evaluar la eficacia de filtros posteriores en un entorno de investigacion.

## Benchmarks y rendimiento

| Metrica | Original | Este modelo (precision completa) |
|---|---|---|
| Rechazo en 972 prompts daninos retenidos (juez WildGuard) | 55,7% | 4,9% (48/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (trial seleccionado) | no disponible | 4 |
| Divergencia KL de primer token respecto al original (trial seleccionado) | no disponible | 0,066 |

Estos datos provienen del paper y describen el modelo en bf16; los archivos GGUF cuantizados no fueron evaluados en el paper. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: aproximadamente 13,3 GB de pesos; con overhead de contexto, se recomienda al menos 16 GB de VRAM.
- VRAM estimada para Q8_0: aproximadamente 23,6 GB de pesos; se recomienda 24 GB o mas de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) para Q8_0; RTX 4080/4070 Ti Super (16 GB) o superiores para Q4_K_M; A100/H100 para despliegues de mayor throughput.
- Cabe en GPU consumer: si, Q4_K_M en GPUs de 16 GB o mas; Q8_0 en GPUs de 24 GB.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama (ollama run richardyoung/mistral-small-instruct-2409-ara-heretic), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mistral-Small-Instruct-2409-ARA-heretic-GGUF (este) | 22,2 B | no disponible | mrl | GGUF | Abliterado, rechazo 4,9% |
| mistralai/Mistral-Small-Instruct-2409 | no disponible | no disponible | mrl | safetensors | Original, rechazo 55,7% |
| richardyoung/Mistral-Small-Instruct-2409-ARA-heretic | 22,2 B (heredado) | no disponible | mrl | safetensors | Version bf16 del mismo modelo abliterado |

No se dispone de datos de benchmarks de capacidad ni de otros modelos abliterados comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion, no asistente de proposito general: la model card lo declara explicitamente y lo limita a estudios sobre eliminacion de rechazos y defensas.
- Riesgo de contenido danino: responde al 95,1% de los prompts daninos del conjunto de evaluacion (48 rechazos de 972), lo que lo hace inadecuado para despliegues orientados al publico sin filtros adicionales.
- La cuantizacion puede alterar el comportamiento de rechazo: los archivos GGUF no fueron evaluados en el paper y las metricas de rechazo solo aplican al modelo en bf16.
- Sesgos: no documentados en la informacion disponible; se heredan los del modelo base, no caracterizados aqui.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- Idioma: solo se declara ingles; no hay soporte multilingue documentado.
- Licencia MRL 0.1: impone restricciones de uso; el usuario es responsable del uso licito. No se detallan aqui las clausulas comerciales.
- Divergencia respecto al original: la KL de primer token de 0,066 indica un cambio medible en la distribucion de salida que puede afectar a la calidad en tareas generales, no solo al rechazo.
- Sin traccion en el repositorio: 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/richardyoung/Mistral-Small-Instruct-2409-ARA-heretic-GGUF
- Modelo base abliterado (safetensors): https://huggingface.co/richardyoung/Mistral-Small-Instruct-2409-ARA-heretic
- Modelo original de Mistral AI: https://huggingface.co/mistralai/Mistral-Small-Instruct-2409
- Licencia MRL 0.1: https://mistral.ai/licenses/MRL-0.1.md
- Paper asociado (arXiv, enlace pendiente de publicacion): no disponible
- Heretic (herramienta de abliteracion): no disponible en la informacion proporcionada
- llama.cpp: no disponible en la informacion proporcionada
- Ollama: no disponible en la informacion proporcionada
