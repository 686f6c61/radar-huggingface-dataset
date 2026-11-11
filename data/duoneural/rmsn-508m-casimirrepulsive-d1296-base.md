# DuoNeural/RMSN-508M-CasimirRepulsive-D1296-Base

## Resumen

RMSN-508M-CasimirRepulsive-D1296-Base es un modelo de lenguaje base de aproximadamente 508 millones de parametros desarrollado por DuoNeural, un laboratorio de investigacion que trabaja en arquitecturas alternativas a los transformers convencionales. El modelo pertenece a la familia RMSN (Resonant Metriplectic Sheaf Network), una propuesta arquitectonica que sustituye la atencion estandar por dinamicas port-hamiltonianas con estructura metriplectica y condiciones de contorno inspiradas en el efecto Casimir. Esta variante concreta, D1296, se define por una dimension de representacion de 1296 y una condicion de contorno repulsiva (r = D mod 64 = 16), lo que segun el autor impide la formacion de cascadas de condensados exactos.

El modelo se presenta explicitamente como parte de un experimento controlado de dinamica topologica (RMSN Phase 6) y no como un modelo listo para produccion. Su interes principal es cientifico: permite comparar empiricamente el comportamiento de dos condiciones de contorno (repulsiva frente a atractiva) sobre la misma familia arquitectonica, con una contraparte directa, RMSN-528M-CasimirAttractive-D1344-Base, que si forma tres condensados exactos con pureza espectral 1.000. La licencia Apache 2.0 permite uso comercial, pero la informacion publicada sobre rendimiento, datos de entrenamiento e idiomas es muy limitada.

Con 16 capas, 64 slots y un vocabulario de 49152 tokens (tokenizer cosmo2), el modelo se situa en la gama de los modelos pequenos tipo GPT, pero con una arquitectura no estandar cuya evaluacion funcional como modelo de lenguaje no esta documentada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network), dinamica port-hamiltoniana con estructura metriplectica |
| Parametros totales | ~508M |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 3.5 GB, presumiblemente PyTorch, tag `pytorch`) |

## Arquitectura y entrenamiento

La arquitectura se describe como una Resonant Metriplectic Sheaf Network con dimension D=1296, 16 capas y 64 slots. La dinamica se formula como una ecuacion port-hamiltoniana de la forma ḟ = {f,H} + [f,S], donde el primer termino representa la evolucion conservativa (corchete de Poisson) y el segundo la parte disipativa (corchete metriplectico). Esta combinacion es la que da nombre a la familia: un sistema que conserva energia en una componente y la disipa de forma controlada en otra, con estabilidad garantizada por exponentes de Lyapunov negativos (todos los λ < 0).

La innovacion declarada es la condicion de contorno tipo Casimir: el residuo r = D mod 64 determina si el sistema desarrolla una cascada de condensados. En esta variante, r = 16 (distinto de cero), lo que produce una fuerza de Casimir repulsiva que impide la cascada; las capas con topologia de soliton interno-bulk son [10, 13, 14, 15] y no se forman condensados exactos con pureza espectral igual a 1.000. El entrenamiento consta de 100.000 pasos con el tokenizer cosmo2 (vocabulario de 49152 tokens). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

## Capacidades

- Generacion de texto autoregresiva: el modelo se etiqueta como `language-model` y dispone de un tokenizer propio (cosmo2, vocab=49152), por lo que esta disenado para modelado de lenguaje.
- Razonamiento y matematicas: no hay documentacion ni benchmarks que confirmen estas capacidades.
- Generacion de codigo: no disponible en la informacion.
- Tool calling / function calling: no disponible en la informacion.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponible; no se declara ningun idioma.
- Capacidad especial: dinamica topologica con solitones internos y estabilidad de Lyapunov verificable, orientada a investigacion en arquitecturas fisicamente inspiradas.

## Casos de uso

- Investigacion en arquitecturas alternativas: el modelo sirve como punto de comparacion controlado frente a la variante atractiva (D1344) para estudiar el efecto de la condicion de contorno Casimir sobre la formacion de condensados y la estabilidad del sistema.
- Estudio de estabilidad dinamica: al publicar exponentes de Lyapunov negativos, permite reproducir experimentos sobre sistemas port-hamiltonianos disipativos en un modelo de lenguaje de 508M de parametros.
- Experimentos de tokenizacion: el tokenizer cosmo2 con vocabulario de 49152 tokens puede evaluarse de forma aislada en tareas de compresion y segmentacion de texto frente a tokenizers estandar.
- Fine-tuning exploratorio: con licencia Apache 2.0 y pesos PyTorch, un grupo de investigacion puede adaptar el modelo a tareas concretas para medir si la arquitectura RMSN aprende representaciones utiles mas alla de su dinamica interna.
- Reproduccion de resultados cientificos: los detalles publicados (100k pasos, D=1296, r=16, capas soliton [10, 13, 14, 15]) permiten replicar el entrenamiento y verificar las afirmaciones del autor.
- Docencia y divulgacion: como ejemplo didactico de arquitecturas no-transformer con formulacion matematica explicita (corchetes de Poisson y metriplecticos), adecuado para cursos avanzados de deep learning.
- Despliegue en produccion de texto: no recomendable con la informacion disponible, ya que no se documentan calidad, contexto ni evaluacion funcional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~508M de parametros, en FP32 se necesitan aproximadamente 2 GB solo para pesos; en FP16 alrededor de 1 GB; en cuantizacion de 8 bits, unos 0,5 GB. Estas cifras son estimaciones tecnicas basadas en el tamano, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU consumer moderna con 4 GB o mas de VRAM deberia poder cargar el modelo en FP16 (RTX 3060, RTX 4060, RTX 4090). Para entrenamiento o fine-tuning, se recomienda al menos una A100 o H100 por velocidad y memoria.
- Compatibilidad con GPU consumer: si, en principio cabe en la mayoria de GPU consumer con 4-8 GB de VRAM, siempre que la implementacion port-hamiltoniana sea compatible con los kernels estandar.
- Opciones de despliegue: no disponible. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; al ser una arquitectura no estandar, es probable que requiera el codigo propio del autor (repositorio GitHub de DuoNeural).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RMSN-508M-CasimirRepulsive-D1296-Base | ~508M | no disponible | RMSN port-hamiltoniana | Apache 2.0 | Hugging Face |
| RMSN-528M-CasimirAttractive-D1344-Base | ~528M | no disponible | RMSN port-hamiltoniana | Apache 2.0 (segun la model card enlazada) | Hugging Face |
| GPT-2 small (referencia de tamano) | 124M | 1024 | Transformer | MIT | Hugging Face |
| GPT-2 medium (referencia de tamano) | 355M | 1024 | Transformer | MIT | Hugging Face |

La comparacion mas directa es con la variante atractiva de la misma familia (D1344, r=0), que segun el autor forma tres condensados exactos. Frente a transformers pequenos como GPT-2, la diferencia principal es arquitectonica y de proposito: el RMSN busca estudiar dinamicas fisicas internas, no competir en calidad de generacion, y no publica benchmarks que permitan comparar rendimiento de lenguaje.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay resultados de MMLU, HumanEval, GSM8K ni de perplexity, por lo que no se puede evaluar su calidad como modelo de lenguaje.
- Idiomas no declarados: se desconoce que lenguas cubre el tokenizer cosmo2 y en que proporcion fueron entrenadas.
- Contexto desconocido: no se especifica la longitud maxima de secuencia, lo que impide planificar su uso en tareas de contexto largo.
- Riesgo de alucinacion: no evaluado; al no haber datos de alineacion (RLHF/DPO) documentados, no hay garantias sobre fidelidad factual.
- Arquitectura experimental: la propia model card la enmarca como un experimento de dinamica topologica, no como un modelo de produccion; la implementacion puede no ser compatible con toolchains estandar (vLLM, llama.cpp).
- Sesgos: no evaluados ni documentados; se desconocen los datos de entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, pero la falta de evaluacion funcional hace arriesgado desplegarlo en produccion sin validacion propia.
- Madurez: creado y actualizado el mismo dia (2026-11-11), con 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-508M-CasimirRepulsive-D1296-Base
- Modelo comparable (variante atractiva): https://huggingface.co/DuoNeural/RMSN-528M-CasimirAttractive-D1344-Base
- GitHub del autor: https://github.com/duoneural
