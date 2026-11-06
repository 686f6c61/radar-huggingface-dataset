# CyrusZhouzk/CREDIT-DeepSeek-R1-Distill-Llama-8B

## Resumen

CREDIT-DeepSeek-R1-Distill-Llama-8B es un adaptador LoRA publicado por CyrusZhouzk (Zikai Zhou y colaboradores, con Monica S. Lam entre los autores) sobre el modelo base deepseek-ai/DeepSeek-R1-Distill-Llama-8B. El adaptador implementa el metodo CREDIT (Counterfactual Relabeling for Dependence on Information Training), descrito en el articulo "Did the Model Use That? Counterfactual Training Boosts Self-Attribution in Language Models" (arXiv:2610.35295). El problema que aborda es la incapacidad del usuario de distinguir si un modelo ha confirmado de forma independiente una informacion aportada en el contexto (una sugerencia del usuario, un pasaje recuperado, la salida de una herramienta o la respuesta de otro modelo) o si simplemente la ha repetido.

La solucion consiste en entrenar al modelo para que termine cada respuesta con una linea `RELIED ON: ...` que nombre la informacion externa de la que depende su respuesta, o `RELIED ON: none` si ha respondido con conocimiento propio. Una informacion se considera influyente si el modelo produce la respuesta que respalda cuando esta presente y rara vez lo hace sin ella, criterio estimado mediante respuestas contrafactuales.

El adaptador tiene relevancia practica en entornos de retrieval-augmented generation (RAG), uso de herramientas y sistemas multiagente, donde la trazabilidad de las fuentes es critica. El modelo base es un transformer denso de 8.000 millones de parametros, derivado de Llama-3.1-8B y destilado de DeepSeek-R1, con capacidad de razonamiento explicito (thinking mode). El adaptador ocupa 0,7 GB en el repositorio y se distribuye con licencia Apache 2.0, aunque el uso queda sujeto tambien a las licencias del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base DeepSeek-R1-Distill-Llama-8B, derivado de Llama-3.1-8B) con adaptador LoRA |
| Parametros totales | 8.000 millones en el modelo base; el adaptador LoRA es un subconjunto adicional (rank 64) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens en entrenamiento (el modelo base soporta mas; no se especifica el limite exacto en la informacion disponible) |
| Tipos de cuantizacion | No especificados en la model card; el modelo base admite cuantizaciones estandar (bf16 en entrenamiento) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 para el adaptador; el modelo base es MIT y deriva de Llama-3.1-8B, sujeto a Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer denso de 8.000 millones de parametros con atencion causal estandar, heredado de Llama-3.1-8B y destilado por DeepSeek a partir de su modelo R1. La unica modificacion estructural es un adaptador LoRA con rank 64, alpha 128 y dropout 0, aplicado sobre las proyecciones q, k, v, o, gate, up y down. El entrenamiento usa precision bf16, una sola epoca, batch efectivo de 16, learning rate de 1e-4 con schedule coseno y 5% de warmup, y una longitud maxima de secuencia de 8.192 tokens (los ejemplos mas largos se descartan). El conjunto de entrenamiento contiene 29.916 ejemplos y la perdida se calcula solo sobre la completion.

El proceso de generacion de datos es el nucleo del metodo CREDIT. Primero se generan respuestas del modelo sin entrenar a preguntas de TriviaQA, MMLU, ARC y CommonsenseQA, cada una acompanada de uno de cuatro tipos de informacion externa: sugerencia del usuario, pasaje recuperado, salida de herramienta o respuesta de otro modelo de IA. Despues se etiqueta la influencia de esa informacion mediante respuestas contrafactuales: se muestrean N=4 respuestas a la misma pregunta sin la informacion; la informacion es influyente si la respuesta original coincide con ella y como maximo una respuesta contrafactual tambien lo hace, y no influyente si la respuesta original no coincide o al menos tres contrafactuales coinciden; en caso contrario el ejemplo se descarta. La coincidencia de respuestas se evalua con un juez LLM. Finalmente, se reescribe unicamente la linea final `RELIED ON:` de cada respuesta para que coincida con la etiqueta, conservando el razonamiento y la respuesta originales del modelo, y se ajusta el adaptador sobre esas respuestas reetiquetadas. No se emplea anotacion humana en ningun paso.

## Capacidades

- Generacion de texto con razonamiento explicito paso a paso (thinking mode heredado del modelo base DeepSeek-R1-Distill-Llama-8B).
- Auto-atribucion de fuentes: el modelo termina sus respuestas con una linea `RELIED ON: ...` que identifica la informacion externa de la que depende la respuesta, o `RELIED ON: none`.
- Distincion entre confirmacion independiente y eco de informacion aportada por el usuario, en documentos recuperados, en salidas de herramientas o en respuestas de otros modelos.
- Capacidad de responder preguntas de conocimiento general, razonamiento y sentido comun (entrenado sobre TriviaQA, MMLU, ARC y CommonsenseQA).
- Soporte de conversaciones multi-turno mediante la plantilla de chat del modelo base.
- Compatibilidad con vLLM para despliegue con LoRA habilitado (`enable_lora=True`, `max_lora_rank=64`).
- No se documentan capacidades de vision, audio, tool calling nativo ni agentes multi-paso en la informacion disponible.

## Casos de uso

- Trazabilidad en pipelines RAG: el modelo puede integrarse en un sistema de recuperacion de documentos para que, ademas de responder, indique que pasaje recuperado ha sido determinante en la respuesta, permitiendo auditar si el sistema esta realmente fundamentando sus respuestas en las fuentes o alucinando.
- Deteccion de eco de sugerencias del usuario: en asistentes conversacionales donde el usuario propone una respuesta ("creo que es X"), el modelo puede senalar si ha confirmado X de forma independiente o simplemente la ha repetido, lo que ayuda a evitar que el usuario reciba una falsa validacion.
- Verificacion de salidas de herramientas: en flujos donde el modelo recibe el resultado de una API o calculadora, la linea `RELIED ON:` permite comprobar si la respuesta final depende de esa salida o si el modelo ha ignorado la herramienta y respondido por su cuenta.
- Sistemas multiagente: cuando un agente recibe la respuesta de otro agente de IA, la auto-atribucion permite saber si el segundo agente ha incorporado esa informacion a su respuesta o la ha descartado, facilitando el diagnostico de propagacion de errores.
- Evaluacion de fidelidad de modelos: investigadores pueden usar el adaptador como herramienta de medida para estudiar en que condiciones un modelo confirma informacion externa frente a cuando la ignora, con la linea `RELIED ON:` como senal cuantificable.
- Moderacion y control de calidad en produccion: en entornos donde las respuestas deben citar fuentes obligatoriamente, el campo `RELIED ON:` puede usarse como comprobacion automatica (por ejemplo, rechazar respuestas con `RELIED ON: none` cuando se exige fundamentacion documental).
- Analisis de dependencia de contexto en tareas de pregunta-respuesta: sobre conjuntos como TriviaQA o CommonsenseQA, el adaptador permite medir si el modelo esta usando el contexto proporcionado o su conocimiento parametrico, util para diagnosticar sesgos de recencia o de copia.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son las metricas de precision balanceada de auto-atribucion sobre sugerencias del usuario, comparando el modelo sin entrenar con el adaptador CREDIT:

| Conjunto de test | Sin entrenar | CREDIT |
|---|---|---|
| Test set | 0,62 | 0,85 |
| Fresh set | 0,62 | 0,79 |
| Large set | 0,59 | 0,79 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB en bf16 para los 8.000 millones de parametros del modelo base, mas el pequeno overhead del adaptador LoRA (0,7 GB en disco). En cuantizacion de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB (estimaciones estandar para un modelo de 8B, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para despliegue en bf16 con contexto largo y concurrencia; RTX 4090 (24 GB) suficiente para bf16 en una sola GPU.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en bf16, y en GPUs de 8-12 GB con cuantizacion de 4 u 8 bits.
- Opciones de despliegue: transformers con PEFT (`PeftModel.from_pretrained`), vLLM con `enable_lora=True` y `max_lora_rank=64`. No se documenta soporte explicito de llama.cpp, Ollama o TGI en la informacion disponible, aunque el modelo base si cuenta con ecosistema GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada. La generacion con razonamiento explicito y hasta 8.192 tokens nuevos implica respuestas largas y coste de decodificacion elevado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| CREDIT-DeepSeek-R1-Distill-Llama-8B | 8B + LoRA rank 64 | 8.192 tokens (entrenamiento) | Auto-atribucion de fuentes mediante entrenamiento contrafactual | Apache 2.0 (adaptador) + MIT/Llama 3.1 (base) |
| DeepSeek-R1-Distill-Llama-8B (base) | 8B | No especificado en la informacion disponible | Razonamiento destilado de DeepSeek-R1 | MIT (derivado de Llama 3.1) |
| Llama-3.1-8B | 8B | 128.000 tokens (segun especificaciones publicas de Llama 3.1) | LLM generalista | Llama 3.1 Community License |

La comparativa con alternativas especializadas en atribucion o fidelidad de fuentes no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La auto-atribucion mejora en los cuatro tipos de informacion externa con los que se entreno (sugerencia del usuario, pasaje recuperado, salida de herramienta, respuesta de otro modelo), pero solo se transfiere parcialmente a tipos no vistos.
- La influencia ejercida desde el system prompt rara vez se atribuye correctamente.
- La linea `RELIED ON:` es un comportamiento entrenado, no una garantia: el autor recomienda verificarla con el test de eliminacion (removal test) cuando la precision sea critica.
- El modelo solo esta entrenado y evaluado en ingles; no se documenta soporte multilingue.
- Riesgo de alucinacion heredado del modelo base, especialmente en respuestas con razonamiento largo.
- Sesgos conocidos del modelo base (Llama-3.1-8B y DeepSeek-R1-Distill) no se documentan de forma especifica en la model card.
- Restricciones de licencia: el adaptador es Apache 2.0, pero el uso queda sujeto a la licencia del modelo base (MIT para DeepSeek-R1-Distill-Llama-8B y Llama 3.1 Community License por derivacion de Llama-3.1-8B), que incluye clausulas de uso aceptable y requisitos de atribucion para uso comercial.
- El adaptador requiere la instruccion exacta de entrenamiento anadida al mensaje del usuario y el razonamiento habilitado; su uso fuera de ese formato puede degradar la calidad de la atribucion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CyrusZhouzk/CREDIT-DeepSeek-R1-Distill-Llama-8B
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- Articulo (arXiv): https://arxiv.org/abs/2610.35295
- Articulo (HuggingFace Papers): https://huggingface.co/papers/2610.35295
- Codigo: https://github.com/stanford-oval/CREDIT
- Dataset de entrenamiento: https://huggingface.co/datasets/CyrusZhouzk/CREDIT
