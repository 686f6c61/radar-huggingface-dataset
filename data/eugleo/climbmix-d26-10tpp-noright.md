# Eugleo/climbmix-d26-10tpp-noright

## Resumen

climbmix-d26-10tpp-noright es un modelo base (no ajustado por instrucciones) de tipo transformer denso, desarrollado por el usuario Eugleo dentro de la familia nanochat CLEAN. Se trata de uno de cuatro modelos d26 entrenados de forma idéntica (mismos pasos, mismos datos, misma semilla) cuya unica diferencia es el corpus: en este caso se ha aplicado un filtro que elimina los documentos asociados a una entidad de inclinacion politica de derechas. El objetivo no es tanto ofrecer un modelo de produccion como servir de artefacto experimental para estudiar como la composicion del corpus de preentrenamiento afecta al sesgo politico y al rendimiento del modelo.

Tecnicamente es un transformer de profundidad 26 con aproximadamente 918 millones de parametros de escalado y 972.947.456 parametros totales reales, entrenado sobre 9.183.428.608 tokens (10 tokens por parametro) en 8.758 pasos con un lote de 2^20 tokens. El entrenamiento se completo en 4,32 horas sobre 8 GPU H100 con un MFU aproximado del 55%.

Su relevancia es metodologica: el modelo viene acompanado de tres variantes equivalentes (`nopol`, `noecon`, `nocrime`) y de las ejecuciones de control sin filtrar, lo que permite comparaciones controladas sobre un mismo presupuesto de computo. Es un modelo orientado a investigacion en sesgo y datos de preentrenamiento, no a despliegue comercial directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (nanochat CLEAN, `nanochat_gpt`, implementacion personalizada con `trust_remote_code`) |
| Parametros totales | 972.947.456 (aproximadamente 918 M de parametros de escalado) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no se publican cuantizaciones oficiales; los pesos se distribuyen en bf16 (posible cuantizacion a 8 y 4 bits por terceros, no verificada) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` en bf16 (`model.safetensors`); incluye el codigo de modelado personalizado `modeling_nanochat_gpt.py` |

## Arquitectura y entrenamiento

Se trata de un transformer denso de 26 capas perteneciente a la familia nanochat CLEAN, con la receta `d26_r10` (pretraining-priors) y semillas init 42 / data -1 en orden canonico de shards. El optimizador es Muon con learning rate de matriz 0,02 para las matrices, mas AdamW para los embeddings, el unembedding y los escalares; el weight decay es 0,28, con 40 pasos de warmup, un warmdown del 65% y un learning rate final del 5%. Todo el entrenamiento se completo en 8 GPU H100 con lote de dispositivo 16, 4,32 horas de reloj y un MFU aproximado del 55%.

El corpus es `climbmix_4100_noright`, derivado de `climbmix_4100` mediante la transformacion `replace_texts` (semilla 0). El preentrenamiento lee los primeros 181 shards (15.119.360 documentos) de ClimbMix (`karpathy/climbmix-400b-shuffle`, 4.101 shards). La seleccion de documentos a eliminar se hizo con un "entity judge" basado en Claude Sonnet 5, ejecutado sobre todos los documentos que los clasificadores de primera etapa marcaron con un 80% de recall, evaluando si una voz de izquierdas o de derechas habla en primera persona y si se habla de personas o posiciones de izquierda o derecha. Se reemplazaron 313.414 documentos (2,07% del prefijo leido): 1.433.919.176 caracteres eliminados frente a 1.439.647.750 anadidos, y 309.130.508 tokens eliminados frente a 310.089.476 anadidos (neto +958.968 tokens, +0,010% del presupuesto). Los reemplazos proceden de los shards 200-229, que la ejecucion nunca lee: documentos que un clasificador de "politicidad" (MLP sobre embeddings de Nemotron-3-Embed-8B, entrenado con 250.000 documentos etiquetados por el juez) puntua por debajo de su umbral de 90% de recall. En datos reservados, el 0,49% de esos documentos contienen una entidad politica, frente al 5,1% del corpus general. Cada documento eliminado se empareja con el reemplazo no usado de longitud en caracteres mas cercana, y ese emparejamiento es compartido por los cuatro modelos de la serie. No hay ajuste por instrucciones ni RLHF/DPO: es exclusivamente un modelo base.

## Capacidades

- Generacion de texto autoregresiva en ingles, como modelo base sin ajuste por instrucciones.
- Continuacion de texto y modelado de lenguaje puro (no hay modo chat ni plantilla de instrucciones).
- Razonamiento y conocimiento general limitados, coherentes con un modelo de menos de 1.000 millones de parametros entrenado con 9.180 millones de tokens.
- Soporte de tool calling / function calling: no disponible (modelo base sin ajuste).
- Soporte de agentes y razonamiento multi-paso: no disponible (requiere ajuste posterior).
- Capacidades multilingues: limitadas al ingles declarado en la model card.
- Capacidades especiales: ninguna (sin vision, audio ni modo thinking). Su interes es experimental: permite aislar el efecto de un filtro de sesgo politico sobre el corpus de preentrenamiento.
- Inferencia con cache KV, verificada como consistente durante la exportacion.

## Casos de uso

- Investigacion sobre sesgo politico en corpus de preentrenamiento: el modelo permite comparar, frente a sus hermanos `nopol`, `noecon` y `nocrime`, como cambia el comportamiento cuando se sustituye el 2,07% de los documentos leidos por contenido apolitico con longitud emparejada.
- Estudios de ablacion controlada de datos: al compartir pasos, tokens, semilla y receta de optimizacion con las otras tres variantes, sirve como punto de control reproducible para medir el impacto de una unica variable (el filtro) sin confundirla con cambios de hiperparametros.
- Punto de partida para ajuste supervisado (SFT) en ingles: al ser un modelo base de ~973 M de parametros, es un candidato barato para fine-tuning en tareas concretas de generacion de texto.
- Destilacion o generacion de datos sinteticos: su tamano reducido permite generar grandes volumenes de texto a bajo coste en una sola GPU consumer, util para crear corpus auxiliares.
- Analisis de calidad de corpus derivado de ClimbMix: la metrica de bits por byte en validacion (0,7187) y el CORE (0,254207) permiten estudiar como afecta el reemplazo de documentos al modelado del lenguaje.
- Docencia y experimentacion en entrenamiento de LLM: con 8.758 pasos y 4,32 horas en 8 H100, es un caso realista para reproducir un pipeline completo de preentrenamiento a pequena escala.
- Evaluacion de tecnicas de filtrado de datos: el pipeline de juez (Claude Sonnet 5) mas clasificador MLP sobre embeddings de Nemotron-3-Embed-8B es replicable y el modelo sirve como resultado medible de ese proceso.

## Benchmarks y rendimiento

Datos publicados en la model card para el paso 8.758:

| Metrica | Valor |
|---|---|
| CORE (nanochat `base_eval`, paso 8.758) | 0,254207 |
| Bits por byte en validacion (ultima evaluacion durante el entrenamiento) | 0,718694 |
| Verificacion de exportacion | superada: max \|logit diff\| = 0,0, bpb 0,7187 sobre 41.943.040 tokens, cache KV consistente |

Comparaciones aportadas por el propio autor dentro de la misma receta:

| Modelo / ejecucion | Corpus | CORE |
|---|---|---|
| exp-088 (este modelo) | ClimbMix filtrado sin contenido de derechas | 0,254207 |
| exp-087 | d26-r10 sobre corpus sin filtrar | 0,272 |
| exp-085 | d26-r10 sobre corpus sin filtrar | 0,261 |

El autor indica que la dispersion entre ejecuciones de esta receta es de unos pocos puntos. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 1,9 GB solo de pesos en bf16; en torno a 4 GB en fp32; aproximadamente 1 GB en 8 bits y 0,5 GB en 4 bits si se cuantiza externamente (no hay cuantizaciones oficiales publicadas).
- GPU recomendadas: cualquier GPU moderna con al menos 4-6 GB de VRAM. Para reproducir el entrenamiento completo, 8 GPU H100 (4,32 horas, ~55% MFU).
- Cabe sobradamente en GPU consumer: RTX 3060, 4060, 4090, e incluso en iGPU con suficiente memoria compartida para inferencia en 4 bits.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y `torch_dtype="bfloat16"` es la ruta oficial. Al incluir codigo de modelado personalizado (`nanochat_gpt`), no se garantiza compatibilidad directa con vLLM, TGI o llama.cpp sin convertir los pesos; Ollama no dispone de una receta oficial para esta arquitectura.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CORE | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Eugleo/climbmix-d26-10tpp-noright (este) | 972.947.456 | no disponible | 0,254207 | MIT | HuggingFace (`transformers`, `safetensors`) |
| Eugleo/climbmix-d26-10tpp-nopol | heredado de la receta d26 | no disponible | no disponible | MIT | HuggingFace |
| Eugleo/climbmix-d26-10tpp-noecon | heredado de la receta d26 | no disponible | no disponible | MIT | HuggingFace |
| Eugleo/climbmix-d26-10tpp-nocrime | heredado de la receta d26 | no disponible | no disponible | MIT | HuggingFace |
| exp-087 (d26-r10, corpus sin filtrar) | mismo presupuesto d26 | no disponible | 0,272 | no disponible | no publicado en la informacion |

No se dispone de datos de benchmarks ni de especificaciones comparables con modelos externos de la misma categoria (por ejemplo, alternativas de ~1.000 millones de parametros) en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no responde a ordenes, no mantiene formato de chat y no soporta tool calling ni comportamiento de agente.
- Sesgo conocido y, de hecho, objeto del experimento: el corpus ha sido modificado para eliminar contenido asociado a una entidad de derechas. Las consecuencias sobre las salidas del modelo no se cuantifican en la model card mas alla del CORE y los bits por byte.
- Riesgo de alucinacion alto: con menos de 1.000 millones de parametros y 9.180 millones de tokens, la cobertura factual es limitada y la generacion puede producir contenido plausible pero falso.
- Limitacion idiomatica: solo se declara ingles. El comportamiento en castellano no esta evaluado ni respaldado.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificacion empirica previa.
- Requiere `trust_remote_code=True` y ejecucion de codigo de modelado personalizado, lo que implica revisar `modeling_nanochat_gpt.py` antes de desplegarlo en produccion.
- Sin cuantizaciones oficiales publicadas y sin estado del optimizador: no se puede reanudar el entrenamiento desde el repositorio ni reutilizar el estado de Muon/AdamW.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que la comunidad haya auditado el modelo.
- La licencia MIT permite uso comercial, pero al tratarse de un base model el valor comercial directo es escaso sin un ajuste posterior.
- El proceso de filtrado depende de anotaciones de un juez propietario (Claude Sonnet 5) y de un clasificador derivado, por lo que la reproducibilidad exacta del corpus depende de esos componentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Eugleo/climbmix-d26-10tpp-noright
- Modelo companero (sin contenido politico): https://huggingface.co/Eugleo/climbmix-d26-10tpp-nopol
- Modelo companero (sin contenido economico): https://huggingface.co/Eugleo/climbmix-d26-10tpp-noecon
- Modelo companero (sin contenido de crimen): https://huggingface.co/Eugleo/climbmix-d26-10tpp-nocrime
- Corpus base ClimbMix: https://huggingface.co/karpathy/climbmix-400b-shuffle
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo, su autoria o la familia nanochat CLEAN; los unicos recursos utiles son la propia pagina de HuggingFace y las referencias internas de la model card.
