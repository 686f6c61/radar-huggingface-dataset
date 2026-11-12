# GiangSon-5/led-base-16384-scrolls-qasper

## Resumen
`led-base-16384-scrolls-qasper` es un modelo seq2seq de tipo Longformer Encoder-Decoder (LED) afinado por el usuario GiangSon-5 sobre el punto de control `allenai/led-base-16384`. Resuelve una tarea concreta: respuesta a preguntas sobre articulos cientificos completos (full-paper QA), usando el subconjunto QASper del benchmark SCROLLS. Con 161.894.745 parametros y una ventana de contexto nativa de 16.384 tokens, aborda el cuello de botella clasico de los modelos extractivos limitados a 4.096 tokens, que truncaban aproximadamente el 68,59 % de los articulos de entrenamiento y el 61,47 % de los de test.

El modelo se entrena de extremo a extremo durante 12 epocas (1.764 actualizaciones del optimizador, unos 169,95 minutos) en una unica NVIDIA A100-SXM4 de 40 GB, con BF16 y TF32 nativos, gradient checkpointing y un planificador de lotes por presupuesto de tokens. El checkpoint final se distribuye en un unico `model.safetensors` de 323.824.770 bytes (308,82 MB) en bfloat16.

Su relevancia actual es doble: por un lado, demuestra que un encoder-decoder compacto de 161 M de parametros puede obtener resultados competitivos en QA cientifico de contexto largo sin recurrir a LLMs generativos de miles de millones de parametros; por otro, publica artefactos de evaluacion trazables (logs de ejecucion, `metrics_summary.json`, diagnosticos a 300 DPI) junto a los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Longformer Encoder-Decoder (LED), transformer seq2seq con atencion local por ventana deslizante y atencion global sobre tokens seleccionados |
| Parametros totales | 161.894.745 (~161,84 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | no disponible (checkpoint nativo en bfloat16; no se documentan variantes GGUF, GPTQ ni AWQ) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (un unico shard, `model.safetensors`, 323.824.770 bytes, bfloat16) |

## Arquitectura y entrenamiento
LED combina un encoder y un decoder transformer (6 capas cada uno en la variante base) con un mecanismo de atencion que sustituye la atencion densa cuadratica por una atencion local de ventana deslizante mas una atencion global sobre un subconjunto de tokens marcados explicitamente. Esto permite escalar a 16.384 tokens con coste lineal. El autor aplica ademas una innovacion concreta, la "Question-Anchored Global Attention": se asigna `global_attention_mask = 1` al token `<s>` y a todos los tokens de la pregunta (hasta el separador `\n\n`), de modo que la representacion de la pregunta atiende globalmente al articulo completo. El formato de entrada es `pregunta + "\n\n" + articulo_completo`, replicando la estructura de `tau/scrolls` (qasper).

El entrenamiento se realizo sobre el split de entrenamiento de SCROLLS QASper durante 12 epocas, con BF16 y TF32, gradient checkpointing, `adamw_torch_fused` y un `TokenBudgetTrainPlanner` que agrupa micro-lotes de 24.576 tokens con padding multiple de 1.024. El pico de VRAM asignada se situo en 10,25 GB de 39,49 GB disponibles. No se documenta en la informacion proporcionada el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO (en un seq2seq de este tipo lo habitual seria entrenamiento supervisado puro, pero no se confirma).

## Capacidades
- Generacion de texto condicionada a contexto largo (seq2seq), orientada a respuestas extractivas y de forma libre sobre articulos cientificos.
- Respuesta a preguntas de tipo free-form/extractiva, yes/no y unanswerable (preguntas sin respuesta en el documento).
- Procesamiento de articulos completos de hasta 16.384 tokens, con cobertura del 99,86 % de los papers de test sin truncar secciones de metodos o experimentos.
- Atencion global configurable sobre tokens de la pregunta, lo que permite anclar la generacion al enunciado.
- Decodificacion con busqueda por haces (los resultados publicados usan 4-beam).
- Capacidades multilingues: limitadas al ingles.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso
- **QA sobre literatura cientifica en repositorios internos**: ingestar papers completos en PDF convertidos a texto y responder preguntas sobre metodologia, resultados o limitaciones, aprovechando la ventana de 16.384 tokens para no truncar secciones criticas.
- **Asistente de revision bibliografica**: dado un articulo y una bateria de preguntas (que propone el metodo, que datasets usa, que metricas reporta), generar respuestas estructuradas para acelerar la lectura y el triaje de papers.
- **Extraccion de evidencia para revisiones sistematicas**: usar el modelo para responder preguntas yes/no (por ejemplo, si un estudio reporta un determinado resultado) con una F1 de 64,42 % en el split de test, como primer filtro antes de la revision manual.
- **Deteccion de preguntas sin respuesta**: identificar cuando un articulo no contiene la informacion solicitada (F1 de 45,08 % en la categoria unanswerable), util para evitar respuestas inventadas en pipelines de extraccion de datos.
- **Anotacion asistida de datasets de QA cientifico**: generar respuestas candidatas que un anotador humano valida, reduciendo el coste de construir corpus QASper-like en dominios propios.
- **Sistemas de soporte a la investigacion en entornos con recursos limitados**: al ocupar menos de 1 GB en bfloat16 y requerir poca VRAM en inferencia, puede desplegarse en una unica GPU de consumo o incluso en CPU para cargas por lotes no interactivas.
- **Indexado semantico de articulos largos**: usar las representaciones del encoder para tareas auxiliares de recuperacion o clustering de papers por tematica, aunque el modelo no esta entrenado especificamente para ello.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente) sobre SCROLLS QASper, con decodificacion 4-beam y scoring multi-referencia oficial:

| Split | Preguntas unicas | F1 | Exact Match | Loss |
|---|---|---|---|---|
| Validacion | 984 | 29,91 | 15,14 | 1,9322 |
| Test held-out | 1.399 | 35,30 | 19,94 | 1,9257 |

Desglose por categoria en el split de test held-out:

| Categoria | n | F1 | EM | F1 zero-shot de referencia |
|---|---|---|---|---|
| Free-form / extractiva | 1.061 | 28,30 | 8,48 | 6,04 |
| Yes / No | 213 | 64,42 | 64,32 | 0,45 |
| Unanswerable | 125 | 45,08 | 41,60 | 1,53 |

El autor reporta una mejora de +30,52 puntos porcentuales de F1 en test respecto al baseline zero-shot (4,78 %). No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware
- VRAM para inferencia: muy reducida; el checkpoint en bfloat16 ocupa 308,82 MB y el pico de VRAM durante el entrenamiento fue de 10,25 GB, por lo que la inferencia en bfloat16 deberia caber holgadamente en GPUs de 4-8 GB (estimacion, no medida publicada).
- GPU de entrenamiento utilizada: 1x NVIDIA A100-SXM4-40GB.
- Cabe en GPU de consumo: si, en cualquier GPU moderna con soporte bfloat16 (RTX 30xx/40xx, A10, L4); en GPUs sin bfloat16 puede ejecutarse en float32.
- Opciones de despliegue: `transformers` con `AutoModelForSeq2SeqLM` (soporte nativo documentado); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles. El entrenamiento completo tardo 169,95 minutos en una A100, dato que no permite extrapolar inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | F1 QASper (test) | Licencia |
|---|---|---|---|---|---|
| led-base-16384-scrolls-qasper | 161,89 M | 16.384 | QA cientifico seq2seq | 35,30 | Apache 2.0 |
| longformer-large-4096-scrolls-qasper (fase 1 del mismo autor) | no disponible | 4.096 | QA extractivo | no disponible (el autor reporta colapso de spans extractivos) | no disponible |
| `allenai/led-base-16384` (base sin afinar) | ~161,84 M | 16.384 | Seq2seq generico | no disponible | Apache 2.0 |

No se dispone en la informacion proporcionada de resultados comparables de otros modelos sobre QASper con la misma configuracion de evaluacion, por lo que la comparativa cuantitativa con alternativas externas queda como no disponible.

## Limitaciones y advertencias
- Modelo entrenado exclusivamente en ingles; el rendimiento en castellano u otros idiomas no esta evaluado y previsiblemente sera deficiente.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).
- F1 de 28,30 en preguntas free-form/extractivas en test: insuficiente para uso autonomo en produccion sin supervision humana.
- Riesgo de alucinacion en preguntas sin respuesta: aunque detecta correctamente el 45,08 % de F1 en la categoria unanswerable, sigue generando respuestas incorrectas en mas de la mitad de los casos.
- El modelo requiere configurar correctamente `global_attention_mask` (token `<s>` y tokens de la pregunta) para replicar el entrenamiento; un uso incorrecto degrada la calidad.
- No es un modelo conversacional ni soporta tool calling ni agentes; su uso esta acotado a QA sobre un documento dado.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de `allenai/led-base-16384` conviene revisar las condiciones del modelo base.
- Sin datos publicados sobre sesgos especificos, robustez ante dominios distintos de articulos cientificos ni comportamiento con textos muy ruidosos (PDF mal extraidos).

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/GiangSon-5/led-base-16384-scrolls-qasper
- Modelo base: https://huggingface.co/allenai/led-base-16384
- Baseline extractivo de fase 1 del mismo autor: https://huggingface.co/GiangSon-5/longformer-large-4096-scrolls-qasper
- Paper de Longformer (arXiv:2004.05150): https://arxiv.org/abs/2004.05150
- Paper de LED (arXiv:2004.05150 y arXiv:2105.03011 referenciados en los tags): https://arxiv.org/abs/2105.03011
- Paper de SCROLLS (arXiv:2201.03533): https://arxiv.org/abs/2201.03533
- Dataset SCROLLS en Hugging Face: https://huggingface.co/datasets/tau/scrolls
