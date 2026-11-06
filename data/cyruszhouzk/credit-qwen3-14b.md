# CyrusZhouzk/CREDIT-Qwen3-14B

## Resumen

CREDIT-Qwen3-14B es un adaptador LoRA sobre el modelo base Qwen/Qwen3-14B, desarrollado por Zikai Zhou y colaboradores (Stanford OVAL) y publicado por el usuario CyrusZhouzk en Hugging Face. El adaptador implementa el metodo CREDIT (Counterfactual Relabeling for Dependence on Information Training), descrito en el articulo "Did the Model Use That? Counterfactual Training Boosts Self-Attribution in Language Models" (arXiv:2610.35295). El problema que resuelve es la incapacidad de los modelos de lenguaje para distinguir entre confirmar informacion externa (sugerencias del usuario, pasajes recuperados, salidas de herramientas) y simplemente repetirla.

El adaptador entrena al modelo para que finalice cada respuesta con una linea `RELIED ON: ...` que nombra la informacion externa de la que depende su respuesta, o `RELIED ON: none` si responde con conocimiento propio. Esto permite auditar si el modelo realmente se apoyo en un documento o sugerencia, algo critico en sistemas RAG, agentes con herramientas y entornos donde el usuario introduce premisas incorrectas.

Tecnicamente es un adaptador PEFT de rango 64 sobre la arquitectura transformer de Qwen3-14B (14.000 millones de parametros, contexto nativo de Qwen3-14B), entrenado con 23.108 ejemplos generados de forma sintetica sin anotacion humana. Su relevancia actual radica en que aborda un problema de fidelidad y atribucion poco cubierto por los modelos comerciales, con una mejora medible en balanced accuracy de autoatribucion (de 0,69-0,80 a 0,81-0,90 segun el conjunto de test).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-14B) con adaptador LoRA (PEFT) |
| Parametros totales | 14.000 millones (modelo base) + adaptador LoRA de rango 64 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explicita en la informacion proporcionada (el entrenamiento usa secuencias de hasta 8.192 tokens; el contexto nativo es el de Qwen3-14B) |
| Tipos de cuantizacion | No especificados para el adaptador; el modelo base Qwen3-14B admite cuantizaciones habituales (bf16, int8, int4) mediante herramientas estandar |
| Idiomas soportados | Ingles (unico idioma declarado) |
| Licencia | Apache 2.0 (adaptador y modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-14B, un transformer decoder-only de 14.000 millones de parametros. El LoRA tiene rango 64, alpha 128 y dropout 0, y se aplica a las proyecciones q, k, v, o, gate, up y down. El entrenamiento se realizo durante 1 epoca con batch efectivo de 16, learning rate 1e-4 con schedule coseno y 5% de warmup, precision bf16, longitud maxima de 8.192 tokens (los ejemplos mas largos se descartan) y 23.108 ejemplos de entrenamiento. La perdida se calcula solo sobre la completion.

El proceso de generacion de datos es el nucleo del metodo CREDIT. Primero se generan respuestas del modelo sin entrenar a preguntas de TriviaQA, MMLU, ARC y CommonsenseQA acompanadas de uno de cuatro tipos de informacion externa: sugerencia del usuario, pasaje recuperado, salida de herramienta o respuesta de otra IA. Despues se etiqueta la influencia mediante respuestas contrafactuales: se muestrean N=4 respuestas a la misma pregunta sin la informacion; la informacion es influyente si la respuesta original coincide con ella y como maximo una respuesta contrafactual tambien coincide, y no influyente si la respuesta original no coincide o al menos tres contrafactuales coinciden; en caso contrario el ejemplo se descarta. La coincidencia de respuestas se evalua con un LLM juez. Finalmente se reescribe unicamente la linea final `RELIED ON:` para que coincida con la etiqueta, conservando el razonamiento y la respuesta originales del modelo. No se emplea anotacion humana en ninguna fase.

## Capacidades

- Generacion de texto y razonamiento paso a paso con modo thinking habilitado (Qwen3-14B soporta `enable_thinking=True`).
- Autoatribucion de informacion externa: emite una linea `RELIED ON: ...` indicando que informacion del usuario, documentos, pasajes o salidas de herramientas sustenta la respuesta, o `RELIED ON: none` si responde con conocimiento propio.
- Deteccion de influencia contrafactual: distingue entre confirmar una sugerencia y limitarse a repetirla.
- Funcionamiento sobre cuatro tipos de informacion externa entrenados: sugerencia del usuario, pasaje recuperado, salida de herramienta y respuesta de otra IA.
- Compatibilidad con vLLM mediante `enable_lora=True` y `max_lora_rank=64`.
- Capacidades heredadas de Qwen3-14B (generacion, codigo, matematicas, multilingue) sujetas a la preservacion del adaptador; la model card solo declara ingles como idioma.
- No se documenta soporte especifico de vision, audio ni tool calling nativo mas alla del uso de salidas de herramientas como informacion externa.

## Casos de uso

- Auditoria de sistemas RAG: el adaptador indica si la respuesta se apoyo realmente en los pasajes recuperados o si el modelo respondio por su cuenta, permitiendo detectar recuperaciones irrelevantes y respuestas no fundamentadas en produccion.
- Deteccion de sycophancy ante sugerencias del usuario: en un chat de soporte, si el usuario afirma "creo que la respuesta es X", el modelo puede indicar `RELIED ON: user suggestion` cuando acepta la premisa, lo que permite filtrar confirmaciones no verificadas.
- Verificacion de uso de salidas de herramientas en agentes: cuando un agente recibe el resultado de una API o calculadora, la linea `RELIED ON:` documenta si la respuesta final depende de ese resultado, facilitando la trazabilidad de cadenas multi-paso.
- Evaluacion de fidelidad en investigacion: permite medir de forma automatica la tasa de atribucion correcta sobre conjuntos de preguntas con informacion externa inyectada, usando el test de eliminacion (removal test) como validacion.
- Moderacion y control de calidad en pipelines de generacion: la linea de atribucion puede registrarse y monitorizarse para detectar respuestas que ignoran el contexto proporcionado, por ejemplo en resumenes de documentos legales o tecnicos.
- Formacion y depuracion de prompts: al comparar ejecuciones con y sin informacion externa, el equipo puede identificar que partes del contexto estan influyendo realmente en el modelo y simplificar prompts sobredimensionados.
- Sistemas de preguntas y respuestas con evidencia: en dominios donde se exige citar la fuente, el adaptador ayuda a separar respuestas basadas en el documento de las basadas en conocimiento parametrico, aunque la cita debe verificarse con el test de eliminacion.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las cifras de balanced accuracy de autoatribucion sobre sugerencias del usuario, comparando el modelo sin entrenar con el adaptador CREDIT:

| Conjunto de test | Sin entrenar | CREDIT |
|---|---|---|
| Fresh set | 0,80 | 0,90 |
| Large set | 0,74 | 0,88 |
| Test set principal | 0,69 | 0,81 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 14.000 millones de parametros requiere aproximadamente 28 GB en bf16, unos 14-16 GB en cuantizacion int8 y unos 8-10 GB en int4 (estimaciones estandar para modelos de este tamano; no confirmadas en la model card). El adaptador LoRA anade una sobrecarga minima (repo de 1,0 GB).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para bf16 sin cuantizar. En consumer, una RTX 4090 (24 GB) puede ejecutar el modelo en bf16 con cuantizacion parcial o en int8/int4.
- Cabe en GPU consumer: si, en RTX 3090/4090 (24 GB) con cuantizacion int8 o int4, y en GPUs de 16 GB con int4.
- Opciones de despliegue: transformers + PEFT (flujo documentado en la model card), vLLM con `enable_lora=True` y `max_lora_rank=64`. No se documenta soporte especifico para llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La generacion de referencia usa hasta 8.192 tokens nuevos con temperatura 0,6, top-p 0,95 y top-k 20, lo que implica respuestas largas y latencias elevadas en comparacion con generacion corta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CREDIT-Qwen3-14B | 14.000 M + LoRA r64 | No disponible (entrenamiento a 8.192) | Autoatribucion de informacion externa | Apache 2.0 | Hugging Face (6 descargas) |
| Qwen/Qwen3-14B | 14.000 M | No disponible en la informacion | Modelo base generalista | Apache 2.0 | Hugging Face |
| Adaptadores de fidelidad/atribucion comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre otros adaptadores o modelos directamente comparables en la misma tarea de autoatribucion contrafactual; la comparativa se limita al modelo base.

## Limitaciones y advertencias

- La autoatribucion mejora en los cuatro tipos de informacion externa entrenados y solo transfiere parcialmente a tipos no vistos.
- La influencia situada en el system prompt rara vez se atribuye correctamente.
- La linea `RELIED ON:` es un comportamiento entrenado, no una garantia: debe verificarse con el test de eliminacion cuando la decision tenga consecuencias.
- El adaptador esta entrenado y declarado unicamente para ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Requiere el prompt de instruccion exacto con el que fue entrenado y el modo thinking habilitado; su uso fuera de ese formato puede degradar la calidad de la atribucion.
- Riesgo de alucinacion heredado de Qwen3-14B, incluida la posibilidad de nombrar informacion que en realidad no influyo en la respuesta.
- Sesgos: no se documentan sesgos especificos del adaptador; los del modelo base Qwen3-14B se mantienen.
- Licencia Apache 2.0 permite uso comercial, pero el uso del adaptador esta sujeto tambien a la licencia del modelo base.
- Modelo con muy baja adopcion (6 descargas, 0 likes en el momento de la consulta): no hay validacion independiente de las cifras reportadas.
- El repositorio del adaptador ocupa 1,0 GB, lo que implica que debe combinarse con los pesos del modelo base para su uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CyrusZhouzk/CREDIT-Qwen3-14B
- Modelo base Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Articulo (arXiv): https://arxiv.org/abs/2610.35295
- Pagina del paper en Hugging Face: https://huggingface.co/papers/2610.35295
- Codigo: https://github.com/stanford-oval/CREDIT
- Dataset de entrenamiento: https://huggingface.co/datasets/CyrusZhouzk/CREDIT
