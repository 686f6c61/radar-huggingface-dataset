# SargeDev/jev-gate-student-b

## Resumen

Jev-Gate Student B es un adaptador LoRA de tipo *judge* de relevancia de memoria, publicado por el usuario SargeDev en HuggingFace. No es un modelo de generacion autonomo: se monta sobre `Qwen/Qwen2.5-0.5B-Instruct` y su unica funcion es, dado un par (query, pasaje de memoria candidato), devolver una probabilidad calibrada de relevancia a partir de la probabilidad del token `yes` sobre los logits del ultimo token. Esta pensado para actuar como puerta (*gate*) en sistemas de memoria de agentes: decidir si un recuerdo recuperado debe inyectarse en el contexto del agente o descartarse.

El adaptador se destila desde una API de juicios tipados ("Jev") implementada por un profesor de mayor tamano, sobre el corpus `SargeDev/jev-distill-corpus`, que contiene juicios de relevancia emparejados con puntuacion graduada de 0 a 7 y etiqueta binaria. La configuracion LoRA es r=16, alpha=32 y afecta a `q_proj` y `v_proj`. El resultado es un juez local de ~0,5B de parametros heredados del modelo base mas un adaptador de aproximadamente 1 millon de parametros entrenables, con un coste de inferencia declarado de unos 59 ms por juicio en una RTX 3060 y sin coste de API.

Su relevancia practica es doble. Por un lado, permite sustituir llamadas a un LLM remoto por un juez local determinista y barato dentro de un pipeline de memoria de agente. Por otro, su evaluacion declarada sobre 60 ejemplos retenidos muestra una mejora muy marcada frente al modelo base sin adaptador: MAE 0.187 frente a 0.536, correlacion de Pearson 0.791 frente a -0.067 y tasa de acuerdo del 90,0 % frente al 38,3 %. Se trata, en cualquier caso, de un artefacto experimental con cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=16, alpha=32, modulos `q_proj` y `v_proj`) sobre un transformer decoder-only, `Qwen/Qwen2.5-0.5B-Instruct` |
| Parametros totales | Modelo base de ~0,5B (Qwen2.5-0.5B-Instruct) mas el adaptador; el numero de parametros entrenables del adaptador no esta publicado (estimacion aproximada de ~1,1 M a partir de r=16 sobre `q_proj`/`v_proj` en 24 capas, calculo propio no confirmado por el autor) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el ejemplo de uso del autor trunca la entrada a `max_length=384` tokens y recorta el pasaje de memoria a 600 caracteres |
| Tipos de cuantizacion | no disponible; los pesos se publican en safetensors como adaptador LoRA (la cuantizacion requeriria fusionar el adaptador con el modelo base) |
| Idiomas soportados | no disponible en la ficha del adaptador; la plantilla de prompt y el corpus de destilacion estan en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, compatible con PEFT) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `Qwen/Qwen2.5-0.5B-Instruct`, un transformer decoder-only de aproximadamente 0,5B de parametros. Sobre el se aplica un adaptador LoRA con rango 16, alpha 32 y modulos objetivo `q_proj` y `v_proj`, entrenado mediante destilacion desde los juicios tipados de una API profesora de mayor tamano. El autor etiqueta el artefacto como *reranker* y *memory-gating*, y su salida no es texto libre sino una probabilidad escalar: se calcula la softmax restringida a los logits de los tokens `yes` y `no` en la ultima posicion, tomando la componente de `yes` como P(relevante).

Los datos de entrenamiento provienen del dataset `SargeDev/jev-distill-corpus`, compuesto por juicios de relevancia emparejados con puntuacion graduada de 0 a 7 y etiqueta binaria, destilados desde llamadas de juicio tipadas de un profesor mayor. No se especifica en la informacion disponible el volumen de tokens, la composicion detallada del corpus, ni si hubo fases de RLHF o DPO. La innovacion tecnica destacable es el propio enfoque: convertir un juicio de relevancia generativo y costoso en un clasificador binario calibrado de un solo token, ejecutable en local con latencia declarada de ~59 ms por juicio en una RTX 3060 y coste de API nulo. La inferencia se plantea con umbral de decision en 0,5 y politica *fail-open* ante errores.

## Capacidades

- Juicio de relevancia memoria-query: dada una consulta y un pasaje candidato, devuelve P(relevante) como valor continuo entre 0 y 1.
- Salida calibrada de token unico: la probabilidad se extrae de la softmax restringida a los tokens `yes`/`no`, lo que permite umbralizar de forma directa.
- Gating de memoria para agentes: funciona como filtro de admision de recuerdos antes de inyectarlos en el contexto de un agente.
- Puntuacion de relevancia graduada: el corpus de destilacion incluye etiquetas de 0 a 7, aunque la interfaz publicada expone solo la decision binaria via `yes`/`no`.
- Ejecucion local sin API: inferencia en GPU de gama de entrada o incluso CPU, con coste marginal nulo por juicio.
- Integracion con el ecosistema PEFT/Transformers: se carga con `PeftModel.from_pretrained` sobre el modelo base en `bfloat16`.
- No soporta, segun la informacion disponible: generacion de texto util, tool calling, function calling, razonamiento multi-paso, vision ni audio. Su uso como modelo generativo general degradaria el comportamiento del modelo base al estar especializado en una unica tarea.
- Capacidades multilingues: no documentadas para el adaptador; el prompt de referencia esta en ingles.

## Casos de uso

- Gating de memoria en agentes conversacionales: antes de recuperar y anadir recuerdos al contexto del agente, se puntua cada candidato con `p_relevant(query, texto)` y se descartan los que quedan por debajo de 0,5. Con ~59 ms por juicio en RTX 3060, es viable evaluar decenas de candidatos por turno sin penalizar la latencia percibida.
- Pre-filtrado barato en pipelines RAG: actuar como primera etapa de descarte tras la recuperacion vectorial, reduciendo el numero de pasajes que llegan a un reranker grande o al LLM generador, con lo que baja el coste por consulta.
- Consolidacion y deduplicacion de memoria a largo plazo: durante el mantenimiento de un almacen de recuerdos, usar el juez para decidir si un recuerdo nuevo aporta informacion relevante respecto a una consulta o si es redundante antes de persistirlo.
- Enrutado de contexto en sistemas multi-agente: seleccionar que fragmentos de un buffer compartido de memoria se pasan a cada subagente en funcion de su consulta concreta, evitando contaminacion cruzada de contexto.
- Evaluacion offline de calidad de recuperacion: usar el juez como anotador automatico de relevancia en un conjunto de pruebas interno, para medir precision/recall del retriever sin recurrir a anotacion humana ni a APIs externas.
- Despliegue on-premise o en edge con requisitos de privacidad: al no requerir llamadas a servicios externos, el filtrado de memoria puede ejecutarse dentro del perimetro del cliente, algo relevante en dominios con datos sensibles.
- Control de inyeccion de memoria en asistentes con historial largo: como puerta de admision, limita la entrada de recuerdos irrelevantes o potencialmente envenenados que podrian sesgar la respuesta del agente.
- Experimentacion academica sobre destilacion de jueces: el artefacto sirve como caso de estudio reproducible de destilacion de una tarea de juicio generativa a un clasificador local de un token, con el corpus asociado publicado.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card, sobre un conjunto retenido de n=60 ejemplos, comparando con el modelo base sin adaptador:

| Metrica | Jev-Gate Student B | Qwen2.5-0.5B-Instruct sin adaptador |
|---|---|---|
| MAE | 0.187 | 0.536 |
| Correlacion de Pearson | 0.791 | -0.067 |
| Tasa de acuerdo (agreement) | 90,0 % | 38,3 % |

| Metrica de eficiencia | Valor |
|---|---|
| Latencia por juicio | ~59 ms en RTX 3060 |
| Coste de API | 0 (inferencia local) |
| Tamano del conjunto de evaluacion | 60 ejemplos retenidos |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El modelo no esta disenado para esas tareas, por lo que su evaluacion en ellas carece de sentido practico.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5B en `bfloat16` ocupa aproximadamente 1 GB de pesos, mas el adaptador LoRA (unos pocos MB) y el overhead de activaciones y cache KV. En la practica, el conjunto cabe comodamente por debajo de 2 GB de VRAM para el rango de secuencias usado (truncado a 384 tokens).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el autor reporta ~59 ms por juicio en una RTX 3060. Tarjetas como RTX 3060, RTX 4060, RTX 4090, L4 o T4 son mas que suficientes para esta carga. GPU de datacenter como A100 o H100 solo tendrian sentido para servir muchas peticiones concurrentes.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas de VRAM; tambien es viable en CPU para cargas de baja concurrencia, aunque sin cifras de latencia publicadas para ese escenario.
- Opciones de despliegue: `transformers` + `peft` segun el ejemplo del autor (carga del modelo base en `bfloat16` y `PeftModel.from_pretrained`). Para servicio de alto rendimiento se puede fusionar el adaptador con el modelo base y servir con vLLM, TGI o llama.cpp/Ollama tras convertir a GGUF; el autor no documenta configuraciones de despliegue alternativas.
- Latencia y throughput: ~59 ms por juicio en RTX 3060 (dato unico publicado). No hay cifras de throughput (juicios por segundo) ni de latencia en otros hardware. Como referencia orientativa, con esa latencia un unico flujo secuencial permitiria del orden de 15-17 juicios por segundo en esa GPU, aunque el dato de paralelismo por batching no esta publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jev-Gate Student B | ~0,5B + adaptador LoRA r=16 | uso truncado a 384 tokens en el ejemplo del autor | MAE 0.187 / Pearson 0.791 / acuerdo 90,0 % (n=60) | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| Qwen2.5-0.5B-Instruct (base, sin adaptador) | ~0,5B | no disponible en la informacion proporcionada | MAE 0.536 / Pearson -0.067 / acuerdo 38,3 % (n=60) | apache-2.0 (modelo base de Qwen) | HuggingFace, ampliamente adoptado |
| Profesor "Jev" (API de juicios tipados) | no disponible | no disponible | usado como referencia de destilacion; metricas no publicadas | no disponible | API, no disponible como pesos |
| Otros rerankers compactos de la misma categoria | no disponible | no disponible | sin comparativa publicada en la informacion proporcionada | no disponible | no disponible |

No se dispone de comparaciones publicadas con otros rerankers o cross-encoders de rango similar en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de sobreajuste a la plantilla: el modelo se evalua con un prompt muy concreto ("Memory: ... Query: ... Question: Is this memory relevant for answering the query? Answer yes or no with confidence."). Cambiar el formato o el idioma del prompt puede degradar la calibracion, ya que el juicio se extrae de la probabilidad de un unico token.
- Evaluacion muy reducida: los resultados declarados provienen de 60 ejemplos retenidos. La mejora frente al modelo base es grande, pero la muestra es pequena y no se publican intervalos de confianza ni analisis por subgrupos.
- Corpus de destilacion no auditado: la informacion disponible no detalla la composicion, el tamano ni la cobertura del dataset `jev-distill-corpus`, ni los sesgos que pueda arrastrar el profesor del que se destila. Es un riesgo real de heredar sesgos sistematicos de anotacion.
- Uso restringido a una tarea: no es un modelo conversacional ni generativo util. Emplearlo como LLM general producira resultados pobres, ya que el adaptador esta entrenado para una unica senal de clasificacion.
- Limites de contexto operativos: el ejemplo de uso trunca a 384 tokens y a 600 caracteres de memoria. Pasajes largos se recortan, con la consiguiente perdida de informacion relevante al final del texto.
- Politica fail-open: el autor indica explicitamente fail-open ante errores. En produccion, esto implica que un fallo del juez deja pasar memoria potencialmente irrelevante en lugar de bloquearla; conviene revisar esa decision segun el caso de uso.
- Umbral fijo de 0,5: no se documenta ningun procedimiento de calibracion por dominio ni curvas de precision/recall frente al umbral.
- Idiomas: el adaptador no declara idiomas soportados y la plantilla esta en ingles; su comportamiento en castellano no esta verificado.
- Adopcion nula y trazabilidad limitada: el repositorio figura con 0 descargas, 0 likes y un tamano de 0,0 GB, con fecha de creacion registrada 2026-09-18. Es un artefacto experimental sin validacion externa independiente.
- Licencia: apache-2.0 en el adaptador, pero conviene verificar la licencia y las condiciones de uso del modelo base `Qwen/Qwen2.5-0.5B-Instruct` antes de un despliegue comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SargeDev/jev-gate-student-b
- Dataset de destilacion: https://huggingface.co/datasets/SargeDev/jev-distill-corpus
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a dominios no relacionados (sothailand.com) y se han descartado.
