# dleemiller/finecat-nli-dbv3-l

## Resumen

FineCat-NLI dbv3 Large (identificador `dleemiller/finecat-nli-dbv3-l`) es un cross-encoder de inferencia de lenguaje natural (NLI) desarrollado por el usuario dleemiller sobre el backbone DeBERTa-v3-large de Microsoft. El modelo recibe un par texto-hipotesis y devuelve probabilidades calibradas de que el texto implique, contradiga o sea neutral respecto a la hipotesis, lo que lo convierte en una herramienta versatil para clasificacion zero-shot, deteccion de alucinaciones en RAG, fact-checking y moderacion. Es relevante porque empaqueta en 435 millones de parametros una capacidad de evaluacion semantica que habitualmente requiere modelos generativos mucho mayores.

Con 435.064.835 parametros totales (304M en el backbone DeBERTa-v3-large) y una ventana de entrada de hasta 512 tokens, el modelo se posiciona en la franja de encoders grandes con licencia Apache-2.0, lo que permite uso comercial sin restricciones. Esta afinado especificamente sobre compilaciones de datos NLI curadas (`dleemiller/FineCat-NLI` y `dleemiller/FineCat-NLI-Reason`) y se distribuye en formato safetensors compatible con la libreria `sentence-transformers`.

Su interes practico reside en que sirve como componente ligero de verificacion dentro de pipelines RAG y de agentes: clasifica intenciones, comprueba si una respuesta generada esta respaldada por el contexto recuperado y filtra contenido frente a politicas, todo con un throughput declarado de aproximadamente 1.100 pares por segundo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en transformer DeBERTa-v3-large (backbone de 304M parametros) |
| Parametros totales | 435.064.835 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 512 tokens de entrada (par premisa-hipotesis) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con sentence-transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `microsoft/deberta-v3-large`, un transformer encoder con atencion desacoplada (disentangled attention) que separa el contenido y la posicion de los tokens en el calculo de la atencion. Se emplea como cross-encoder: premisa e hipotesis se procesan conjuntamente en una sola pasada y la cabeza de clasificacion produce las probabilidades de entailment, contradiction y neutral. El backbone aporta 304M parametros y el total asciende a 435M.

El entrenamiento parte de los datasets `dleemiller/FineCat-NLI` y `dleemiller/FineCat-NLI-Reason`, compilaciones de fuentes NLI de alta calidad (MNLI, SNLI, ANLI, WANLI, LingNLI y otras) con filtrado de calidad y reduccion de ejemplos faciles en el split de entrenamiento. La model card menciona tecnicas de destilacion de conocimiento (`knowledge-distillation`) entre las etiquetas del autor, aunque no se detalla el numero exacto de tokens ni la composicion completa del dataset. No se especifica si hubo RLHF o DPO; en un encoder de clasificacion esto no aplica del mismo modo que en modelos generativos.

## Capacidades

- Inferencia de lenguaje natural (NLI) con tres clases calibradas: entailment, contradiction y neutral.
- Clasificacion zero-shot: cada etiqueta candidata se formula como hipotesis y se compara con el texto de entrada.
- Deteccion de alucinaciones y grounding en RAG: evalua si la respuesta generada se deriva del contexto recuperado (0,78 F1 declarado en RAGTruth).
- Fact-checking y verificacion de afirmaciones frente a fuentes.
- Moderacion y guardrails: comprobacion de mensajes frente a declaraciones de politica (92,0% en CrossingGuard, 94,0% en insultos de Wikipedia).
- Routing y triaje de peticiones por intencion (98,3% en intents de MASSIVE).
- Clasificacion y etiquetado zero-shot multietiqueta (93,1% en 18 tareas).
- Extraccion clinica y de determinantes sociales de la salud (98,7% en SDOH-NLI).
- No soporta generacion de texto, tool calling ni razonamiento multi-paso: es un clasificador, no un modelo generativo.
- Solo ingles.

## Casos de uso

- Verificacion de grounding en RAG: dado un pasaje recuperado y la respuesta generada por el LLM, el modelo estima la probabilidad de que la respuesta este implicada por el contexto; si cae por debajo de un umbral se marca como posible alucinacion. Es adecuado por su bajo coste y su F1 de 0,78 en RAGTruth.
- Routing de intenciones en atencion al cliente: se formula cada intencion como hipotesis y se elige la de mayor probabilidad de entailment. Con 98,3% en MASSIVE, sustituye a clasificadores entrenados especificamente para nuevos dominios sin reentrenamiento.
- Guardrails de moderacion: se contrastan mensajes de usuario contra declaraciones de politica; la probabilidad de entailment actua como senal de violacion. Los resultados declarados en CrossingGuard (92,0%) lo hacen viable como filtro previo a un LLM generativo.
- Clasificacion zero-shot de resenas y tickets: asignar etiquetas como "positivo", "queja de facturacion" o "problema de envio" sin datos etiquetados, aprovechando la formulacion "This text is about X".
- Fact-checking en pipelines editoriales: comparar afirmaciones extraidas de un articulo con pasajes de fuentes de referencia y marcar contradicciones para revision humana.
- Extraccion estructurada en ambito clinico: comprobar hipotesis como "el paciente esta desempleado" contra notas clinicas (98,7% en SDOH-NLI) para poblar registros de determinantes sociales.
- Filtrado de pares en la construccion de datasets: descartar pares premisa-hipotesis triviales o contradictorios antes de entrenar otros modelos, dado su throughput de aproximadamente 1.100 pares por segundo.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente):

| Conjunto de evaluacion | Metrica | Valor |
|---|---|---|
| FineCat-NLI (test) | Accuracy | 0,8495 |
| MultiNLI (validation matched) | Accuracy | 0,9254 |
| MultiNLI (validation mismatched) | Accuracy | 0,9224 |
| SNLI (test) | Accuracy | 0,9375 |
| ANLI round 1 (test) | Accuracy | 0,8120 |
| ANLI round 2 (test) | Accuracy | 0,6950 |
| ANLI round 3 (test) | Accuracy | 0,6192 |
| WANLI (test) | Accuracy | 0,7688 |
| LingNLI (validation) | Accuracy | 0,8946 |
| Benchmark de 45 datasets NLI / zero-shot / grounding (media macro) | Macro accuracy | 0,8217 |

En la model card se cita ademas una comparacion con `dleemiller/finecat-nli-v2-xl` (1,03B parametros) en el leaderboard OpenNLI, aunque el fragmento disponible no incluye la fila completa de este modelo. No se han publicado en la informacion disponible resultados comparativos cerrados frente a otros encoders de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,9 GB solo para pesos; en la practica, con overhead de activaciones y batch, entre 1,5 y 3 GB.
- En cuantizacion de 8 bits cabria en torno a 0,5 GB de pesos; los tipos de cuantizacion concretos no estan documentados.
- GPU recomendadas: cualquier GPU consumer moderna con 4 GB o mas (RTX 3060, RTX 4060, RTX 4090); en servidor, A100 o H100 para lotes grandes.
- Cabe holgadamente en GPU de consumo y tambien puede ejecutarse en CPU, aunque con menor throughput.
- Despliegue: `sentence-transformers` (CrossEncoder) es la via nativa; tambien es integrable en pipelines de Hugging Face Transformers, en servidores de inferencia tipo TGI o en entornos con ONNX Runtime.
- Throughput declarado: aproximadamente 1.100 pares por segundo. La latencia por par no se especifica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `dleemiller/finecat-nli-dbv3-l` | 435M | 512 tokens | apache-2.0 | Objeto de esta ficha |
| `dleemiller/finecat-nli-v2-xl` | 1,03B | no disponible | no disponible | Mayor tamano; en OpenNLI registra Skill Index 59,5 y accuracy 0,8263 |
| `dleemiller/finecat-nli-l` | no disponible | no disponible | no disponible | Fine-tune de `tasksource/ModernBERT-large-nli` |
| `dleemiller/finecat-nli-dbv3-m` | no disponible | no disponible | no disponible | Fine-tune de `microsoft/deberta-v3-base` sobre FineCat-NLI-Reason |

Los datos de la comparativa provienen de la model card y de los resultados de busqueda; no se dispone de una tabla cerrada con todas las metricas de los modelos alternativos.

## Limitaciones y advertencias

- Solo funciona en ingles; el rendimiento en otros idiomas no esta documentado y previsiblemente sera bajo.
- Ventana de 512 tokens: los documentos largos deben trocearse y agregarse, lo que puede perder contexto entre fragmentos.
- Es un clasificador NLI, no un generador: no produce texto, no razona de forma multi-paso ni soporta tool calling.
- Riesgo de falsos positivos y negativos en dominios alejados de los datos de entrenamiento; los resultados en ANLI r2 (0,6950) y r3 (0,6192) muestran una caida clara en inferencia adversaria.
- Las probabilidades estan calibradas segun el autor, pero no hay verificacion independiente; conviene ajustar umbrales con datos propios.
- Sesgos: al entrenarse sobre datasets NLI en ingles, puede heredar sesgos de esos corpus (genero, origen, tema) y comportarse peor en textos informales o de dominio especializado.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias; los resultados del model-index estan marcados como no verificados.
- Los benchmarks declarados en RAGTruth, CrossingGuard, MASSIVE y SDOH-NLI aparecen en la model card sin detalle de metodologia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dleemiller/finecat-nli-dbv3-l
- Demo Space: https://huggingface.co/spaces/dleemiller/finecat-nli
- Leaderboard OpenNLI: https://huggingface.co/spaces/dleemiller/open-nli-leaderboard
- Dataset FineCat-NLI: https://huggingface.co/dleemiller/FineCat-NLI
- Dataset FineCat-NLI-Reason: https://huggingface.co/dleemiller/FineCat-NLI-Reason
- Modelo base: https://huggingface.co/microsoft/deberta-v3-large
- Modelo hermano finecat-nli-l: https://huggingface.co/dleemiller/finecat-nli-l
- Modelo hermano finecat-nli-dbv3-m: https://huggingface.co/dleemiller/finecat-nli-dbv3-m
