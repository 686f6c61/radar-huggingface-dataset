# fexeak/mini-judge-v1

## Resumen

mini-judge-v1 es un clasificador especializado de 0,6B parámetros desarrollado por el usuario de HuggingFace fexeak, publicado en octubre de 2026. Se trata de un ajuste fino completo (full SFT) del modelo Qwen3-0.6B de Alibaba, diseñado para resolver un problema muy concreto en sistemas conversacionales y agentes: determinar si la última respuesta de un asistente está presentando al usuario opciones mutuamente excluyentes para que elija (un formato de pregunta que puede disparar un tool call o una UI de selección), si está esperando una respuesta abierta, o si simplemente no está esperando ninguna decisión del usuario.

El modelo solo juzga la forma de la pregunta, no su pertinencia. Su relevancia radica en el routing de agentes: los frameworks que orquestan LLM necesitan decidir de forma barata y rápida si deben renderizar botones de selección, esperar input libre o continuar el flujo sin intervención. Un modelo de 0,6B con latencias de decenas de milisegundos en GPU de consumo es idóneo para esta tarea en comparación con usar un LLM grande como juez. El autor publica métricas F1 por encima de 0,92 en las tres clases, muy por encima de una línea base basada en reglas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3, causal LM afinado como clasificador generativo) |
| Parametros totales | 596.049.920 (596M, dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens en entrenamiento y servicio (aunque config.json declara 40960 y tokenizer_config.json 131072) |
| Tipos de cuantizacion | no disponible (publicado en bf16; cuantizaciones GGUF/AWQ/GPTQ no verificadas por el autor) |
| Idiomas soportados | Chino (principal) e ingles (muestras limitadas) |
| Licencia | Apache-2.0 (base Qwen3-0.6B tambien Apache-2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B en su variante instruct, con el modo thinking desactivado. Se ha entrenado mediante SFT con ajuste completo de todos los parametros (sin LoRA), durante 5 epocas sobre un dataset de aproximadamente 1.160 muestras anotadas de forma manual y semiautomatica, de las cuales 849 entraron en el pool de entrenamiento mas un 15% de ejemplos negativos fuera de distribucion. La salida del modelo es una sola linea JSON con la etiqueta de veredicto.

Un detalle critico de ingenieria: el modelo depende de un system prompt fijo, byte a byte identico al usado en entrenamiento (distribuido como `system_prompt.txt` en el repositorio), y de un formato de entrada concreto: la respuesta del asistente envuelta en etiquetas `<assistant_reply>`, tras truncarla a los ultimos 3.000 puntos de codigo Unicode. Cualquier desviacion en el prompt o el formato degrada notablemente el rendimiento. La generacion se hace con `max_tokens=32` y decodificacion greedy (`do_sample=False`).

## Capacidades

- Clasificacion de tres clases sobre la ultima respuesta de un asistente:
  - `use_tool`: la respuesta ofrece 2-4 opciones mutuamente excluyentes (listas numeradas, A/B, ① ② ③, "elige A o B", o recomendacion con confirmacion tipo "de acuerdo?").
  - `prose_ok`: se espera respuesta del usuario, pero abierta, de valor unico, que requiere explicacion, o confirmacion simple de si/no.
  - `no_ask`: la respuesta no espera decision del usuario (declaraciones, informes, explicaciones).
- Salida estructurada: una unica linea JSON `{"verdict":"..."}`, sin segmentos de razonamiento (0 apariciones de thinking en evaluacion) y con 0 fallos de parseo en el test de 100 muestras.
- Distingue listas de opciones excluyentes de listas explicativas o de tareas pendientes, algo que una regla basada en estructura no consigue (F1 0,429 de la linea base frente a 0,952 del modelo).
- No evalua si la pregunta es pertinente, solo su forma.
- No soporta tool calling, vision ni audio; su unica funcion es la clasificacion textual.

## Casos de uso

- Routing de UI en agentes conversacionales: cuando el agente termina una respuesta, el modelo decide si mostrar botones de seleccion (use_tool), un campo de texto libre (prose_ok) o continuar sin pedir input (no_ask). Es su caso de uso principal y para el que fue entrenado.
- Orquestacion de flujos multi-paso en frameworks de agentes: permite decidir de forma determinista y barata si el turno vuelve al usuario o si el pipeline puede seguir ejecutandose, sin invocar un LLM grande como juez.
- Metricas y analitica de conversaciones: clasificar en bloque miles de respuestas historicas de un chatbot para medir cuantas terminan en decision del usuario frente a informacion unidireccional.
- Validacion de estilo en pipelines de CI/CD para prompts: integrar el clasificador como gate automatico que rechaza respuestas del sistema que ofrezcan opciones mutuamente excluyentes cuando la politica del producto exige preguntas abiertas (o viceversa).
- Deteccion de puntos de decision en logs de sesiones: reconstruir arboles de decision de conversaciones reales etiquetando automaticamente cada turno del asistente.
- Fallback barato para routers de LLM: ante un fallo de parseo del clasificador, el propio autor recomienda degradar a una implementacion por reglas, lo que permite montar un sistema de doble nivel robusto.
- Moderacion de formato en asistentes de soporte: garantizar que las respuestas que requieren eleccion del cliente usen el formato de opciones esperado por el sistema de tickets.

## Benchmarks y rendimiento

Evaluacion del autor sobre 100 muestras de gold standard manual (subconjuntos test, ood_project y ood_external), con 0 fallos de parseo y 0 apariciones de thinking:

| Etiqueta | Precision | Recall | F1 |
|---|---|---|---|
| use_tool | 0,938 | 0,968 | 0,952 |
| prose_ok | 0,945 | 0,963 | 0,954 |
| no_ask | 1,000 | 0,867 | 0,929 |

Comparacion con la linea base por reglas (deteccion de estructura de lista) sobre el mismo gold standard: use_tool F1 0,429; prose_ok y no_ask con recall 0.

Rendimiento por subconjunto:

| Subconjunto | n | use_tool F1 | prose_ok F1 | no_ask F1 |
|---|---|---|---|---|
| test | 36 | 0,919 | 0,842 | 1,000 |
| ood_project | 48 | 1,000 | 0,966 | 0,833 |
| ood_external | 16 | — | 1,000 | — |

No se han publicado resultados de benchmarks genericos (MMLU, HumanEval, GSM8K), lo cual es coherente con la naturaleza de clasificador especializado del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en bf16 (tamano del repositorio), mas overhead de KV cache; cabe con holgura en cualquier GPU moderna de 4 GB o mas.
- GPU recomendadas: cualquier GPU de consumo es suficiente. El autor reporta latencias en RTX 5090 con vLLM: P50 de 52,5 ms, P95 de 91 ms y maximo de 105 ms con limite de salida de 32 tokens.
- Cabe en GPU de consumo: si, holgadamente. Incluso es viable su ejecucion en CPU con velocidad razonable dado el tamano (aunque sin datos publicados de latencia en CPU).
- Opciones de despliegue: vLLM (con `--max-model-len 8192` obligatorio y thinking desactivado via `--default-chat-template-kwargs '{"enable_thinking": false}'`), transformers (verificado con la version 4.56.1 y bf16 en una sola GPU, con carga automatica del chat template), y presumiblemente Ollama o llama.cpp si se convierte a GGUF (sin verificacion de regresion por parte del autor).
- Latencia y throughput: los datos publicados son los de RTX 5090 + vLLM indicados arriba; no hay cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto util | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mini-judge-v1 | 596M | 8192 | Clasificador de forma de pregunta (3 clases) | Apache-2.0 | HuggingFace, safetensors |
| Qwen/Qwen3-0.6B (base) | 596M | 40960 (declarado) | LLM general instruct | Apache-2.0 | HuggingFace, safetensors |
| LLM grande como juez (p. ej. Qwen3-8B o similar via prompt) | 4-8B | variable | Clasificacion por prompting | varia | HuggingFace |

La alternativa habitual a este modelo es usar un LLM general con un prompt de clasificacion, lo que multiplica por 10 o mas la latencia y el coste de VRAM a cambio de mayor flexibilidad ante inputs fuera de distribucion. No existen otros clasificadores publicos equivalentes y especializados en esta tarea exacta en la informacion disponible.

## Limitaciones y advertencias

- Solo juzga la forma de la pregunta; no evalua si preguntar es apropiado en el contexto.
- Entrenado principalmente con chino; las muestras en ingles son escasas, por lo que el rendimiento en texto en espanol o ingles no esta garantizado y deberia validarse con datos propios.
- Dependencia estricta del system prompt fijo y del formato de entrada (`<assistant_reply>` + truncado a los ultimos 3.000 puntos de codigo); cualquier desviacion degrada claramente el rendimiento.
- Contexto efectivo de 8192 tokens: los valores declarados en los ficheros de configuracion (40960 en config.json, 131072 en tokenizer_config.json) no reflejan la distribucion de entrenamiento; inputs mas largos no tienen comportamiento garantizado.
- Sin verificacion de regresion tras cuantizacion (GGUF, AWQ, GPTQ): la precision en versiones cuantizadas debe retestarse con datos propios.
- Riesgo de alucinacion bajo en terminos generales (salida JSON restringida, 0 fallos de parseo en evaluacion), pero el autor recomienda implementar un fallback por reglas ante fallos de parseo en produccion y no reescribir respuestas del usuario por un fallo del clasificador.
- Licencia Apache-2.0 sin restricciones de uso comercial; se exige conservar los ficheros LICENSE y NOTICE con las atribuciones.
- Dataset de entrenamiento reducido (849 muestras en pool mas negativos), lo que sugiere posible fragilidad ante dominios o estilos de redaccion muy distintos a los de entrenamiento, especialmente en el subconjunto ood_external de solo 16 muestras.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fexeak/mini-judge-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Licencia Apache-2.0 del repositorio: https://huggingface.co/fexeak/mini-judge-v1/blob/main/LICENSE
- Aviso de atribucion (NOTICE): https://huggingface.co/fexeak/mini-judge-v1/blob/main/NOTICE
- System prompt distribuido: https://huggingface.co/fexeak/mini-judge-v1/blob/main/system_prompt.txt
- Paper, blog o demo: no disponible
