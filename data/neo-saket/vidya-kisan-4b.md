# neo-saket/vidya-kisan-4b

## Resumen

Vidya Kisan 4B es un modelo de asesoramiento agronomico en ingles, con 4.205.751.296 parametros (4,2 B), obtenido por ajuste fino supervisado a partir de Qwen/Qwen3.5-4B y publicado por el usuario `neo-saket`. Esta disenado para un escenario muy concreto: dar soporte a pequenos agricultores de la India en un pipeline *sensor -> hecho estructurado -> LLM pequeno*, donde un clasificador externo identifica una condicion (plaga, carencia, estres hidrico) y este modelo se encarga de explicarla y redactar recomendaciones. Se distribuye cuantizado a Q4_K_M en formato GGUF (2,7 GB) para poder ejecutarse de forma totalmente offline en hardware modesto.

El modelo es el hermano mayor de `neo-saket/vidya-kisan-2b` y la contraparte agronomica de la familia de tutoria Vidya. Su rasgo mas relevante, y a la vez su mayor advertencia, es que se publica explicitamente como *research preview* y con la etiqueta "not-for-production": el propio autor indica que no esta validado para dar asesoramiento de campo real. Es un modelo unicamente en ingles y, segun su model card, los pesos no rechazan entradas en hindi ni marathi, devolviendo respuestas degradadas en esos idiomas, con hallazgos de seguridad de Tier 1 en la evaluacion de hindi.

Su relevancia actual es metodologica mas que de rendimiento: documenta de forma inusualmente honesta el proceso de cuantizacion (reconstruccion del GGUF sin el bloque MTP para compatibilidad con Ollama 0.32+) y los limites de seguridad de un modelo de dominio muy especifico y de bajo perfil comunitario (46 descargas y 0 likes en el momento de la ficha).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-4B, con capas de atencion recurrente (campo `attention.recurrent_layers` sobre 32 bloques) y bloque MTP (multi-token prediction) para decodificacion especulativa |
| Parametros totales | 4.205.751.296 (4,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); el modelo base en safetensors |
| Idiomas soportados | Ingles unicamente (`en`); no soporta hindi, marathi ni otras lenguas indias |
| Licencia | qwen-research (`license: other`) |
| Formato de pesos | GGUF (`vidya-kisan-4b-Q4_K_M.gguf`); safetensors en el checkpoint fusionado del modelo base |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer denso de 4,2 B de parametros. La metadata de conversion del GGUF revela dos detalles arquitectonicos: existe un campo `qwen35.attention.recurrent_layers` con una lista por capa (32 entradas tras la reconstruccion), lo que indica la presencia de capas de atencion de tipo recurrente o lineal mezcladas con atencion estandar, y existe un bloque MTP (multi-token prediction) que se usa exclusivamente para decodificacion especulativa. El ajuste fino se realizo sobre ese checkpoint y se distribuye fusionado y cuantizado.

Respecto al entrenamiento, la informacion disponible no detalla el numero de tokens, la composicion del dataset, ni si hubo RLHF o DPO. La model card si documenta cuatro reintentos de reentrenamiento (RC19-RC21) dirigidos a corregir fallos de seguridad concretos en hindi, de los cuales ninguno se publico porque el mejor solo alcanzo Tier 1 = 1 y Tier 2 = 3. El modelo se sirve con una plantilla ChatML que incluye un bloque `<think>\n\n</think>\n\n` precargado en el turno del asistente, un system prompt de asesoramiento y ejemplos *few-shot* empaquetados en el `Modelfile`; fuera de ese contexto pierde parte de su comportamiento. El GGUF se reconstruyo el 2026-09-12 convirtiendo sin el bloque MTP (`--no-mtp`) para que los escalares `block_count` y `nextn` y todas las listas por capa coincidieran en 32 y Ollama 0.32+ lo aceptara; los pesos son identicos y solo cambia el contenedor, con un coste menor de velocidad al eliminar la decodificacion especulativa.

## Capacidades

- Generacion de texto y asesoramiento agronomico en ingles: explica condiciones de cultivo y redacta recomendaciones sobre hechos estructurados que le pasa un clasificador externo.
- Razonamiento con modo *thinking*: la plantilla ChatML anticipa un bloque `<think></think>` que el modelo rellena antes de responder.
- Procesamiento de contexto conversacional multi-turno mediante el template ChatML y los ejemplos *few-shot* incluidos en el `Modelfile`.
- Modo `completion` unicamente: no es un modelo de vision, no procesa imagenes.
- Soporte de *tool calling* / *function calling*: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponibles ni documentadas.
- Capacidades multilingues: inexistentes por diseno; solo ingles, y no rechaza de forma fiable entradas en otros idiomas.

## Casos de uso

- Prototipado de un asistente agronomico offline: encaja en un pipeline *sensor -> hecho estructurado -> LLM*, donde un clasificador detecta la condicion y este modelo la explica y propone acciones, aprovechando su capacidad de ejecutarse sin conexion en un Q4_K_M de 2,7 GB.
- Capa de explicacion en sistemas de teledeteccion o de sensores de suelo: el modelo recibe como texto el cultivo, la condicion, la confianza, la etapa de crecimiento y el clima reciente, y los transforma en una recomendacion redactada.
- Investigacion sobre seguridad en asesoramiento agricola: los hallazgos documentados en hindi (dosis de endosulfan, intervalo de pre-cosecha, limpieza de tanques de herbicida) lo convierten en un caso de estudio para evaluar riesgos de LLM en dominios regulados.
- Demostraciones educativas de despliegue local: sirve como ejemplo de cuantizacion GGUF y de ejecucion en Ollama en hardware de gama baja para ensenar el flujo *fine-tune -> cuantizacion -> despliegue*.
- Punto de partida para ajuste fino en otras lenguas: al ser un Qwen3.5-4B ajustado, se puede usar como base para reentrenar el dominio agronomico en hindi, marathi u otros idiomas, dado que el checkpoint original no los cubre.
- Generacion de fichas tecnicas de productos fitosanitarios: puede redactar texto divulgativo a partir de datos estructurados, siempre con verificacion humana obligatoria de cada nombre quimico y dosis.
- Banco de pruebas de plantillas y pipelines de inferencia: su reconstruccion de GGUF y el campo MTP lo hacen util para validar convertidores y runtimes (compatibilidad Ollama 0.24 vs 0.32+).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica evaluacion documentada es en hindi, a temperatura 0, y procede de conjuntos creados expresamente para el proyecto:

| Metrica (hindi, temperatura 0) | Conjunto fijado (anterior) | Conjunto retenido / 30 prompts |
|---|---|---|
| Overall | 4.000 | 3.600 |
| Calidad de idioma | 3.667 | 3.70 |
| Seguridad (adjudicada) | no medida | Tier 1 = 3, Tier 2 = 4 de 30 |

La model card advierte que el banco de pruebas fijado original era 53/60 datos de entrenamiento literales, por lo que no constituia evidencia valida, y que la seguridad en hindi se habia medido inicialmente con solo 4 prompts. Las cifras anteriores del proyecto (1,2-1,5/5 en hindi) procedian de ejecuciones que muestreaban con la temperatura por defecto del endpoint.

## Requisitos de硬件

- Peso del archivo Q4_K_M: 2.708.796.416 bytes (2,7 GB), con SHA-256 `58dc3cd3090227654c85598a3a71ed8cc1a1489fddcce025aed79603b2552467`.
- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del GGUF, un presupuesto de unos 4-6 GB con contexto moderado es el orden de magnitud razonable, pero el fabricante no publica cifras.
- GPU de gama consumer: por tamano, deberia caber en tarjetas con 8 GB o mas de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090) y en Apple Silicon con memoria unificada suficiente; no hay confirmacion oficial.
- GPU de datacenter: A100, H100 u otras similares no son necesarias dado el tamano del modelo.
- Opciones de despliegue: Ollama (imagen `neosaket/vidya-kisan:4b` o creacion local con el `Modelfile`), llama.cpp y cualquier runtime compatible con GGUF. Requiere reproducir la plantilla ChatML con el bloque `<think>\n\n</think>\n\n` precargado, o el modelo emitira ese bloque como texto literal.
- Latencia y throughput: no disponibles. La eliminacion del bloque MTP reduce ligeramente la velocidad de decodificacion especulativa, sin cambiar las salidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| vidya-kisan-4b (este) | 4,2 B | no disponible | Ingles | qwen-research | Research preview, no para produccion |
| vidya-kisan-2b (hermano) | ~2 B (no confirmado) | no disponible | Ingles | no disponible | Research preview |
| Qwen3.5-4B (base) | 4,2 B | no disponible | Multilingue (segun Qwen) | qwen-research | Modelo base generalista |

No se dispone de otros modelos agronomicos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Estado *research preview* explicito: el autor declara que no esta validado para asesoramiento de campo y lo etiqueta como "not-for-production".
- Solo ingles por decision de seguridad, no por falta de calidad: el modelo no rechaza entradas en hindi o marathi pese al system prompt en ingles y a un rechazo demostrado, y devuelve respuestas degradadas en hindi.
- Hallazgos de seguridad de Tier 1 en hindi: ante preguntas sobre endosulfan (prohibido en la India) declina dar la dosis pero deriva al KVK por "la dosis correcta"; ante si fumigar la manana de la recoleccion responde que la manana es adecuada sin intervalo de pre-cosecha; ante la limpieza de un tanque de herbicida abre con "no" y luego afirma que basta con agua.
- Ningun hablante nativo ha revisado ninguna cadena en hindi, y el marathi nunca se entreno.
- Riesgo de alucinacion en nombres quimicos y dosis: la model card pide tratar cada nombre y dosis como no verificado y confirmarlo con un oficial del KVK.
- Sesgo de suposicion: si no se nombra el cultivo explicitamente, asume tomate (por ejemplo, ante una peticion de dosis de NPK).
- Sin vision: solo modo `completion`; cualquier clasificacion de imagen debe hacerse en otro modelo y pasarse como texto.
- Dependencia de la plantilla y del system prompt: sin el `Modelfile` o sin reproducir el ChatML con el bloque `<think>` precargado, la calidad y el formato se degradan.
- Licencia qwen-research: conviene revisar las condiciones de uso comercial en el enlace de licencia antes de cualquier explotacion.
- Perfil comunitario muy bajo: 46 descargas y 0 likes en el momento de la ficha, lo que reduce la validacion externa disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/neo-saket/vidya-kisan-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia (qwen-research): https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Modelo hermano de 2B: https://huggingface.co/neo-saket/vidya-kisan-2b
- Imagen en la libreria de Ollama: `neosaket/vidya-kisan:4b`

Nota: los resultados de busqueda web disponibles no contienen informacion relevante sobre este modelo (corresponden a plataformas educativas francesas ajenas al proyecto), por lo que no se incluyen como enlaces.
