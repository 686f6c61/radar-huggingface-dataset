# HIT-TMG/JevEmbed-KaLM-Embedding-V2.5

## Resumen

JevEmbed-KaLM-Embedding-V2.5 es un modelo de embeddings y toma de decisiones desarrollado por HIT-TMG (grupo de la Harbin Institute of Technology). Se construye a partir del checkpoint KaLM-embedding-multilingual-mini-instruct-v2.5 (familia Qwen2, ~494 millones de parametros) mediante un fine-tuning con LoRA sobre las 1.601.157 preguntas de entrenamiento del dataset JevEmbed-Data, tras lo cual el adaptador se fusiona en los pesos finales. El resultado es un modelo denso que produce embeddings de 896 dimensiones y que, a traves del framework JevEmbed, resuelve tres tipos de decisiones: Choice (elegir entre opciones), Score (puntuacion categorica o continua) y Noul (decision binaria con o sin criterios).

La relevancia del modelo esta en su enfoque: no es un generador de texto, sino un evaluador. Dado un estado del entorno en JSON y un conjunto de preguntas con criterios, el modelo puntua cada candidato mediante similitudes coseno query-candidato y devuelve distribuciones de probabilidad. Segun la model card, esa formulacion eleva la precision global en etiquetas duras del 32,33 % (modelo base) al 76,03 % (modelo fusionado) sobre el mismo conjunto de test de 66.482 preguntas, con una mejora de 50,08 puntos porcentuales en la tarea Noul.

El modelo se distribuye con licencia Apache-2.0, ocupa 2,0 GB en el repositorio (incluye pesos fusionados, el adaptador LoRA en `lora/` y el fichero de configuracion `jevembed.yaml`) y esta pensado para integrarse con SentenceTransformers o con el CLI de JevEmbed. Su tamano reducido permite ejecutarlo en hardware de consumo, aunque requiere `trust_remote_code=True` por el codigo personalizado asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (familia Qwen2) usado como encoder de embeddings; fine-tuning LoRA sobre el modelo base |
| Parametros totales | 494.032.768 (~494 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens con truncacion, segun la configuracion de JevEmbed; la ventana nativa del modelo base no se especifica en la informacion disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible en los metadatos; el modelo base se denomina "multilingual", pero la model card no enumera idiomas ni evalua capacidades por idioma |
| Licencia | Apache-2.0 (con la salvedad de que el dataset de entrenamiento tiene licencias de origen mixtas) |
| Formato de pesos | safetensors (pesos fusionados), mas adaptador LoRA en `lora/` y configuracion `jevembed.yaml` |

Datos adicionales: dimension de embedding de 896; pipeline `feature-extraction`; libreria `sentence-transformers`; tamano del repositorio 2,0 GB; revision base `753c6fe26abc20a32aeb162003aa03457d15db2f`.

## Arquitectura y entrenamiento

La base es un transformer decoder denso de la familia Qwen2 (variante "mini" de KaLM-Embedding v2.5), reutilizado como modelo de representacion. El fine-tuning se aplico con LoRA de rango 64, alpha 32 y dropout 0,05 sobre las proyecciones Q, K y V, durante una unica epoca sobre 1.601.157 preguntas. El entrenamiento uso cuatro GPUs con batch por GPU de 64 y acumulacion 2 (batch efectivo 512), precision BF16, learning rate de 2 x 10^-4 y un 10 % de warmup. Las entradas se truncaron a 1.024 tokens y el adaptador final corresponde al paso 3.128. Posteriormente el adaptador se fusiono en los pesos del modelo base; segun el manifiesto de fusion, los embeddings resultantes coinciden con los del adaptador LoRA con una diferencia absoluta maxima de 3,6 x 10^-7 sobre cinco entradas en FP32.

La innovacion principal esta en la funcion de perdida, que no es de lenguaje sino de similitud coseno entre la query y cada candidato. Para Choice y Score categorico se aplica entropia cruzada sobre la distribucion objetivo tras un softmax con temperatura 0,1 (las etiquetas duras son one-hot y las blandas se mantienen blandas). Para Score continuo se usa error cuadratico entre la puntuacion objetivo y el nivel esperado ponderado por probabilidad, normalizado por el numero de intervalos de nivel. Para Noul se emplea entropia cruzada binaria con logits, donde el logit es 10 veces una similitud coseno sin criterios, o 10 veces la diferencia de coseno entre verdadero y falso cuando hay criterios. La perdida final es la media de las perdidas por pregunta de cada batch. No se documenta RLHF ni DPO en la informacion disponible.

## Capacidades

- Generacion de embeddings de texto de 896 dimensiones para similitud semantica, recuperacion y clustering.
- Decision tipo Choice: seleccion entre opciones nombradas, con o sin criterios asociados, devolviendo probabilidades por opcion.
- Decision tipo Score: puntuacion categorica (niveles discretos) y continua, con objetivo de error absoluto medio reducido.
- Decision tipo Noul: clasificacion binaria que distingue si el estado cumple o no los criterios especificados.
- Procesamiento de entradas estructuradas: el modelo consume estados en JSON con campos numericos y anidados, como se muestra en el ejemplo de seguimiento y disparo del entorno Doom.
- Evaluacion con criterios explicitos: cada opcion puede llevar su propio criterio, lo que permite condicionar la decision a restricciones declaradas.
- Extraccion de features crudas mediante `SentenceTransformer(model_dir, trust_remote_code=True)`.
- Capacidades multilingues: no confirmadas en la model card; se heredan, en su caso, del modelo base.
- Soporte de tool calling, function calling y agentes multi-paso: no se documenta en la informacion disponible.
- Modo de razonamiento explicito (thinking): no documentado.

## Casos de uso

- Reranking de candidatos en recuperacion de informacion: dado un conjunto de documentos recuperados previamente, el modelo compara la similitud coseno con la query y reordena los candidatos; la formulacion de perdida esta disenada exactamente para esta tarea.
- Evaluacion automatica de respuestas y LLM-as-judge: con preguntas de tipo Score, el modelo puede asignar puntuaciones categoricas o continuas a respuestas generadas, con un MAE de 0,4943 en el conjunto de test, lo que lo hace util en pipelines de evaluacion de modelos.
- Decisiones de politica en agentes sobre entornos estructurados: el ejemplo de la model card muestra como, a partir de un estado JSON con posicion, salud, municion y enemigo visible, el modelo elige la accion de movimiento lateral adecuada (probabilidad 0,8763 para "Strafe left").
- Filtrado y aplicacion de criterios sobre contenido: la tarea Noul (90,61 % de precision binaria en test) permite determinar si un texto o estado cumple una condicion declarada, apto para moderacion, validacion de requisitos o control de calidad.
- Busqueda semantica y RAG: los embeddings de 896 dimensiones pueden indexarse en bases vectoriales para recuperacion densa en corpus multilingues, siempre que los fragmentos no superen los 1.024 tokens.
- Deduplicacion y clustering de documentos: el uso de embeddings normalizados permite agrupar textos similares y detectar duplicados en corpus grandes con un coste de inferencia bajo.
- Puntuacion de pares pregunta-respuesta en anotacion asistida: el modo Score continuo sirve para preordenar ejemplos antes de la revision humana, reduciendo el volumen de anotacion manual.
- Clasificacion condicionada por criterios en formularios o sistemas de admision: cada opcion puede llevar su criterio propio, de modo que la decision queda trazada y auditable por el criterio aplicado.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split `test` de JevEmbed-Data (66.482 preguntas; 64.110 con etiqueta dura). Ambas evaluaciones usaron BF16, los mismos prompts y el mismo esquema de puntuacion, con truncacion a 1.024 tokens.

| Metrica | Base | Tras LoRA (fusionado) | Cambio |
|---|---:|---:|---:|
| Precision global con etiqueta dura (64.110) | 32,33 % | 76,03 % | +43,70 pp |
| Precision Choice (17.487) | 28,61 % | 71,05 % | +42,44 pp |
| Precision por nivel en Score (24.260) | 27,45 % | 66,17 % | +38,73 pp |
| Precision binaria Noul (22.363) | 40,52 % | 90,61 % | +50,08 pp |
| MAE de Score (24.287; menor es mejor) | 0,9990 | 0,4943 | -0,5047 |
| MAE de Noul (24.004; menor es mejor) | 0,5925 | 0,1365 | -0,4560 |

El MAE de Noul incluye 22.363 objetivos duros y 1.641 blandos. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, MTEB) en la informacion disponible.

Ejemplo cualitativo de Choice incluido en la model card (seguimiento de objetivo en Doom): probabilidades de 0,8763 para "Strafe left", 0,1096 para "Strafe right" y 0,0140 para "Hold lateral movement".

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 1 GB solo para los pesos (494 M x 2 bytes), mas activaciones y overhead de runtime; en la practica entre 1,5 GB y 2,5 GB.
- VRAM estimada en FP32: aproximadamente 2 GB de pesos, en torno a 2,5-3 GB con overhead.
- Cuantizacion: no se publican pesos cuantizados; una conversion a INT8 o INT4 reduciria los pesos a ~0,5 GB y ~0,25 GB respectivamente, pero no esta validada por el autor.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente. Una RTX 3060, RTX 4060, RTX 4070 o RTX 4090 cubren el modelo con holgura; A100 o H100 no aportan ventaja practica por el tamano.
- Cabe en GPU de consumo: si, incluidas generaciones antiguas con 4 GB. Tambien es viable en CPU, dado el tamano del modelo.
- Opciones de despliegue: `sentence-transformers` (con `transformers==4.51.0` y `sentence-transformers==5.3.0`), `transformers` con `trust_remote_code=True`, Text Embeddings Inference (etiquetado como `text-embeddings-inference` y `endpoints_compatible`) y Hugging Face Inference Endpoints. El CLI y la API de Python de JevEmbed son la via prevista para las decisiones Choice/Score/Noul.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La comparacion directa disponible es contra su propio modelo base, evaluado en el mismo conjunto de test con las mismas condiciones:

| Modelo | Parametros | Contexto | Precision global (etiqueta dura) | MAE Score | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| JevEmbed-KaLM-Embedding-V2.5 | ~494 M | 1.024 tokens (truncacion en JevEmbed) | 76,03 % | 0,4943 | Apache-2.0 | HuggingFace, safetensors + LoRA |
| KaLM-embedding-multilingual-mini-instruct-v2.5 (base) | ~494 M | no disponible | 32,33 % | 0,9990 | no disponible en la informacion | HuggingFace |
| Otros modelos de embedding de ~500 M (por ejemplo BGE-M3 o multilingual-e5) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos frente a alternativas de terceros, ya que la model card solo publica la evaluacion contra el modelo base y en un conjunto de test propio (JevEmbed-Data), no en benchmarks estandar de embeddings como MTEB.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto abierto, solo embeddings y decisiones (Choice, Score, Noul). No debe usarse como chatbot ni como modelo de instrucciones.
- La evaluacion se limita al split `test` de JevEmbed-Data, un benchmark propio. No hay resultados en MTEB ni en otros conjuntos publicos, por lo que la generalizacion a otros dominios no esta demostrada.
- Truncacion estricta a 1.024 tokens: cualquier entrada mas larga pierde informacion sin aviso, lo que puede degradar decisiones en contextos extensos.
- El dataset de entrenamiento tiene licencias de origen mixtas; la propia model card remite al informe de procesamiento para decidir los terminos de publicacion. Aunque los pesos se liberan como Apache-2.0, el uso comercial deberia revisarse contra ese informe.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del repositorio; conviene auditar ese codigo antes de desplegarlo en produccion.
- Riesgo de alucinacion en el sentido de decisiones con alta confianza pero incorrectas: la formulacion con temperatura 0,1 y escala 10 tiende a distribuciones muy concentradas, que pueden enmascarar incertidumbre real.
- Idiomas soportados no documentados: el modelo base se denomina multilingue, pero no hay evaluacion por idioma en la informacion disponible.
- Sesgos: al entrenarse sobre un corpus mixto de origen no auditado en detalle, puede heredar sesgos de ese corpus y del modelo base. No se documenta ninguna mitigacion.
- Adopcion muy baja: 0 descargas y 1 like en el momento de la consulta, con un unico autor publicador, lo que implica escasa validacion independiente.
- Dependencias de version fijas: la model card especifica `transformers==4.51.0` y `sentence-transformers==5.3.0`; otras versiones pueden romper la carga del modelo.
- Metadatos anomalos: las fechas de creacion y actualizacion del repositorio (2026) no coinciden con un calendario plausible, por lo que conviene verificar la trazabilidad temporal del artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HIT-TMG/JevEmbed-KaLM-Embedding-V2.5
- Modelo base: https://huggingface.co/KaLM-Embedding/KaLM-embedding-multilingual-mini-instruct-v2.5
- Dataset de entrenamiento: https://huggingface.co/datasets/HIT-TMG/JevEmbed-Data
- Informe de procesamiento del dataset y licencias: https://huggingface.co/datasets/HIT-TMG/JevEmbed-Data/blob/main/docs/PROCESSING_REPORT.md
- Repositorio JevEmbed en GitHub: https://github.com/HITsz-TMG/JevEmbed
- Codigo de la funcion de perdida: https://github.com/HITsz-TMG/JevEmbed/blob/main/src/jevembed/training/objective.py
- Dataset Open-Jev (origen de los ejemplos de test): https://huggingface.co/datasets/ZefanCai/Open-Jev
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre este modelo; las consultas devuelven unicamente sitios de radios y servicios no relacionados.
