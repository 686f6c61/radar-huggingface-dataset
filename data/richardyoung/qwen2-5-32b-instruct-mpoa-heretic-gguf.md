# richardyoung/Qwen2.5-32B-Instruct-MPOA-heretic-GGUF

## Resumen

Qwen2.5-32B-Instruct-MPOA-heretic-GGUF es la distribucion en formato GGUF de un modelo derivado de Qwen2.5-32B-Instruct, el transformer denso de 32.700 millones de parametros de Alibaba. La modificacion consiste en una ablacion de la direccion de rechazo (abliteration) aplicada con Heretic 2.0 mediante MPOA (projected, magnitude-preserving abliteration), una tecnica que elimina la tendencia del modelo original a negarse a responder determinadas peticiones. El autor de la ficha y de la cuantizacion es richardyoung, y el trabajo se enmarca en una linea de investigacion sobre la dificultad creciente de la abliteration en modelos recientes.

El modelo resuelve un problema concreto de investigacion: proporcionar un artefacto reproducible para medir la eliminacion de rechazos y las defensas frente a ella. Segun la model card, el modelo de precision completa reduce el rechazo del 76,8 % al 3,9 % sobre 972 prompts daninos reservados, evaluados con el juez WildGuard, manteniendo una divergencia KL de 0,06 en el primer token respecto al original. Estas cifras describen el modelo en bf16, no los ficheros GGUF aqui publicados.

La relevancia actual es doble. Por un lado, ofrece una version ejecutable en hardware de consumo de un modelo de 32B con contexto largo, gracias a la cuantizacion Q4_K_M de 19,9 GB. Por otro, documenta un caso de estudio sobre alineacion y seguridad: el modelo cumple muchas peticiones que el original rechaza, lo que lo convierte en material de analisis para investigadores de seguridad, no en un asistente de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-32B-Instruct), modificado con abliteration MPOA |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-32B-Instruct) |
| Tipos de cuantizacion | Q4_K_M (publicada); IQ3_M, IQ4_XS, Q5_K_M, Q6_K y Q8_0 anunciadas como pendientes |
| Idiomas soportados | en (segun la model card; el modelo base es multilingue, pero la ficha solo declara ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con fichero de matriz de importancia `imatrix` de 30 MB) |

## Arquitectura y entrenamiento

La base es un transformer denso de tipo decoder-only con 32.763.876.352 parametros, correspondiente a Qwen2.5-32B-Instruct. Sobre ese modelo se aplico Heretic 2.0 con su metodo por defecto, MPOA: una ablacion direccional proyectada que preserva la magnitud de los pesos. El proceso busca la direccion de rechazo en el espacio de activaciones y la elimina mediante una busqueda de 100 trials, seleccionando la variante con menos rechazos por palabra clave en el conjunto de desarrollo sujeta a una divergencia KL de primer token menor o igual a 0,1 respecto al modelo original. La variante elegida presenta 13 rechazos por palabra clave sobre los 100 prompts de ajuste y una KL de 0,06.

No se dispone de informacion sobre el volumen de tokens de entrenamiento ni sobre la composicion del dataset original de Qwen2.5-32B-Instruct en la documentacion proporcionada; el proceso de abliteration no reentrena el modelo, sino que modifica pesos a partir de un conjunto reducido de prompts de calibracion. Los ficheros GGUF se generaron con llama.cpp (commit `468fde9`) mediante `convert_hf_to_gguf.py --outtype bf16` y posterior `llama-quantize`, verificando cada peso del safetensors publicado contra su SHA-256. Las cuantizaciones IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M usan la matriz de importancia calculada sobre la build Q8_0 con calibration_datav3 (128 fragmentos de 512 tokens); Q6_K y Q8_0 son estaticas.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-32B-Instruct.
- Razonamiento y matematicas: el modelo base esta entrenado para tareas de razonamiento; no se aportan evaluaciones especificas del derivado.
- Generacion de codigo: capacidad heredada del modelo base, sin benchmarks publicados para esta variante.
- Cumplimiento de peticiones que el modelo original rechaza: el rechazo baja del 76,8 % al 3,9 % en el conjunto de evaluacion del paper (modelo bf16).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada para este derivado.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: la model card declara unicamente ingles; el modelo base soporta varios idiomas, pero no se documenta el efecto de la abliteration sobre ellos.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion sobre abliteration: el modelo sirve como artefacto reproducible para estudiar la eliminacion de rechazos, comparar tecnicas (MPOA frente a otras variantes de Heretic) y medir el coste en divergencia KL respecto al original.
- Evaluacion de defensas frente a refusal removal: permite construir conjuntos de prompts y medir la eficacia de clasificadores de seguridad o filtros de salida frente a un modelo deliberadamente desalineado.
- Analisis de robustez de jueces automaticos: al reducir el rechazo a un 3,9 % segun WildGuard, es util para probar la sensibilidad de los clasificadores de contenido danino.
- Despliegue local de un modelo de 32B en hardware de consumo: la cuantizacion Q4_K_M de 19,9 GB permite ejecutarlo con llama.cpp u Ollama en estaciones con GPU de 24 GB o con offloading a CPU.
- Experimentos de cuantizacion: la publicacion de matriz de importancia y de varias tallas permite comparar el efecto de la cuantizacion sobre el comportamiento de rechazo, un aspecto que la propia model card advierte que puede alterar.
- Estudio de sesgos y comportamiento en dominios sensibles: util para analizar como cambia la distribucion de respuestas al eliminar la direccion de rechazo en un modelo de gran tamano.
- Reproducibilidad de pipelines de conversion: los SHA-256 y el commit de llama.cpp documentados permiten replicar la cadena de conversion y cuantizacion.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden al modelo en precision completa (bf16) y no a los ficheros GGUF. Se reproducen a continuacion tal como aparecen en la model card.

| Metrica | Original | Este modelo (bf16) |
|---|---|---|
| Rechazo en 972 prompts daninos reservados (juez WildGuard) | 76,8 % | 3,9 % (38/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (trial seleccionado) | no disponible | 13 |
| Divergencia KL de primer token respecto al original (trial seleccionado) | no disponible | 0,06 |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni para el derivado ni para los ficheros cuantizados.

## Requisitos de hardware

- VRAM estimada: Q4_K_M ocupa 19,9 GB, por lo que requiere aproximadamente 20-22 GB de VRAM para cargar el modelo completo en GPU, mas el espacio de contexto.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para Q4_K_M completo en GPU. En GPUs de 16 GB es necesario offloading parcial a CPU.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y RTX 3090 (24 GB) con Q4_K_M; en GPUs de 16 GB solo con offloading o cuantizaciones menores (IQ3_M, pendiente de publicacion).
- Opciones de despliegue: llama.cpp (`llama-cli -hf ...`), Ollama (`ollama run hf.co/richardyoung/Qwen2.5-32B-Instruct-MPOA-heretic-GGUF:Q4_K_M`). No se documenta soporte para vLLM o TGI en formato GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazo (WildGuard, 972 prompts) | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen2.5-32B-Instruct-MPOA-heretic (este) | 32,76 B | no disponible | 3,9 % (bf16) | apache-2.0 | GGUF |
| Qwen2.5-32B-Instruct (original) | 32,76 B | no disponible | 76,8 % | apache-2.0 | safetensors, GGUF |
| Otras variantes abliterated de Qwen2.5-32B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos comparativos de capacidad (benchmarks de razonamiento o codigo) frente a alternativas del mismo tamano, ni de resultados de otros modelos abliterated evaluados con la misma metodologia.

## Limitaciones y advertencias

- El modelo esta disenado para eliminar rechazos: cumple muchas peticiones que el original rechaza, lo que lo hace inadecuado como asistente de proposito general y potencialmente peligroso en produccion.
- El autor lo publica explicitamente para investigacion sobre abliteration y sus defensas, no para uso como asistente.
- Las cifras de rechazo y divergencia KL corresponden al modelo bf16; la model card advierte que la cuantizacion puede alterar el comportamiento de rechazo y los ficheros GGUF no fueron evaluados en el paper.
- La ficha solo declara soporte de ingles; el comportamiento multilingue tras la abliteration no esta documentado.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; se hereda el del modelo base.
- Sesgos conocidos: no documentados especificamente para este derivado.
- Restricciones de licencia: apache-2.0, con las mismas restricciones de uso que el modelo fuente; el usuario es responsable del uso legal.
- El modelo base pertenece a la familia Qwen2.5, por lo que las limitaciones de contexto y conocimiento del modelo original se mantienen.

## Enlaces

- Repositorio GGUF: https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-MPOA-heretic-GGUF
- Modelo base abliterated (bf16): https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-MPOA-heretic
- Modelo original: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct/blob/main/LICENSE
- Paper de referencia (arXiv pendiente de publicacion): Richard J. Young, *Is Abliteration Getting Harder? Not Uniformly: Refusal Removal by Direction-Based Ablation and ARA in Heretic on the Qwen3.8, Gemma 4, Olmo 3.1 and Mistral Small 3.2 LLMs Versus Their Predecessors*, 2026.
