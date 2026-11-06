# dleemiller/finecat-nli-dbv3-m

## Resumen

FineCat-NLI dbv3 Medium es un cross-encoder de inferencia de lenguaje natural (NLI) construido sobre `microsoft/deberta-v3-base` y publicado por el usuario dleemiller en Hugging Face. Su funcion es recibir un par premisa-hipotesis y devolver probabilidades calibradas de que la premisa implique, contradiga o sea neutral respecto a la hipotesis. Con 184,4 millones de parametros totales (86M en el backbone segun la model card) y entradas de hasta 512 tokens, se posiciona como una pieza de infraestructura para tareas de verificacion, clasificacion zero-shot y deteccion de alucinaciones en pipelines RAG.

El modelo se distribuye bajo licencia Apache-2.0 y esta pensado para uso en ingles. Su interes practico radica en que una sola formulacion (premisa contra sentencia) cubre casos muy dispares: grounding de respuestas generadas, moderacion contra politicas, etiquetado zero-shot de resenas o extraccion de atributos clinicos. La model card reporta un rendimiento declarado de 0,7962 de exactitud macro en un banco de 45 conjuntos de datos, con un throughput aproximado de 3.200 pares por segundo.

El repositorio tiene un tamano de 0,7 GB y se publico en noviembre de 2026, con cero descargas y cero likes en el momento de la consulta, lo que indica que se trata de un lanzamiento muy reciente y sin validacion independiente de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3) como cross-encoder |
| Parametros totales | 184.424.451 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos safetensors; la model card no detalla variantes GGUF u otras) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/deberta-v3-base`, un transformer encoder con atencion desacoplada y embeddings de posicion relativos, y se utiliza como cross-encoder: la premisa y la hipotesis se procesan conjuntamente para producir una distribucion de tres clases (entailment, contradiction, neutral). La cabecera de clasificacion se entrena sobre la salida del encoder, con un total de 184,4 millones de parametros contando el backbone y la cabeza.

Los datos de entrenamiento declarados son los conjuntos `dleemiller/FineCat-NLI` y `dleemiller/FineCat-NLI-Reason`, y las etiquetas del repositorio mencionan destilacion de conocimiento (knowledge-distillation). La model card no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO; para un modelo discriminativo de este tipo lo habitual seria un ajuste supervisado con entropia cruzada, pero ese detalle no esta documentado en la informacion disponible. Tampoco se detallan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Clasificacion NLI de tres clases con probabilidades calibradas (entailment, contradiction, neutral).
- Clasificacion zero-shot y etiquetado de textos mediante sentencias hipotesis generadas al vuelo.
- Reranking de pares texto-sentencia en pipelines de recuperacion.
- Deteccion de alucinaciones y verificacion de groundedness en respuestas generadas.
- Fact-checking contra politicas o afirmaciones de referencia.
- Extraccion de atributos en dominios especializados (la model card cita extraccion clinica).
- Moderacion y guardrails mediante comparacion contra sentencias de politica.
- Procesamiento por lotes con throughput alto (unos 3.200 pares por segundo segun la model card).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (es un encoder discriminativo, no generativo).
- Capacidades multilingues: limitadas al ingles.
- Capacidades especiales: no dispone de modo thinking, vision ni audio.

## Casos de uso

- Grounding en RAG: dado un pasaje recuperado y la respuesta generada por un LLM, el modelo estima la probabilidad de que el pasaje implique la afirmacion, permitiendo filtrar respuestas no respaldadas antes de mostrarlas al usuario. La model card reporta 0,75 de F1 en RAGTruth para este escenario.
- Guardrails y moderacion: cada mensaje de usuario se compara contra un conjunto de sentencias de politica; la clase entailment actua como senal de violacion. La model card cita un 91,8 % en CrossingGuard.
- Clasificacion zero-shot de tickets o resenas: se generan hipotesis del tipo "This text is about billing" y se elige la etiqueta con mayor probabilidad de entailment, sin necesidad de entrenar un clasificador especifico.
- Verificacion de hechos en redaccion automatizada: contrastar cada frase generada contra documentos fuente y marcar como no soportadas aquellas con alta probabilidad de contradiccion o neutralidad.
- Extraccion de informacion clinica: comparar notas clinicas con sentencias de atributos (por ejemplo, situacion laboral) para poblar registros estructurados; la model card cita un 98,3 % en SDOH-NLI.
- Reranking en busqueda semantica: reordenar los candidatos recuperados por un retriever denso usando la probabilidad de entailment entre consulta y documento, mejorando la precision del top-k.
- Deduplicacion y deteccion de contradicciones en bases de conocimiento: comparar pares de afirmaciones para detectar inconsistencias antes de fusionar registros.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Conjunto de datos | Metrica | Valor |
|---|---|---|
| FineCat-NLI (test) | Accuracy | 0,8276 |
| MultiNLI (validation matched) | Accuracy | 0,9111 |
| MultiNLI (validation mismatched) | Accuracy | 0,9100 |
| SNLI (test) | Accuracy | 0,9324 |
| ANLI round 1 (test) | Accuracy | 0,7650 |
| ANLI round 2 (test) | Accuracy | 0,5820 |
| ANLI round 3 (test) | Accuracy | 0,5200 |
| WANLI (test) | Accuracy | 0,7558 |
| LingNLI (validation) | Accuracy | 0,8715 |
| Benchmark de 45 conjuntos (macro average) | Macro accuracy | 0,7962 |

La model card tambien menciona resultados en tareas derivadas: 0,75 de F1 en RAGTruth, 91,8 % en CrossingGuard, 92,3 % en un conjunto de 18 tareas de clasificacion zero-shot y 98,3 % en SDOH-NLI.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,75 GB solo para pesos, mas activaciones y buffers; en la practica, menos de 2 GB para lotes pequenos.
- VRAM estimada en fp16/bf16: alrededor de 0,4 GB para pesos, con margen para lotes mayores.
- GPU recomendadas: cualquier GPU consumer moderna sirve; una RTX 3060 de 12 GB o superior permite lotes amplios. Para maximizar throughput, A100 o H100 con lotes grandes.
- Cabe holgadamente en GPU consumer: si, incluidas GTX 1660, RTX 2060 y superiores.
- Opciones de despliegue: `sentence-transformers` con `CrossEncoder`, integracion en pipelines de Hugging Face Transformers, y servidores de inferencia compatibles con modelos de clasificacion (por ejemplo, Text Embeddings Inference o endpoints propios). La model card no detalla soporte especifico para vLLM, llama.cpp u Ollama.
- Latencia y throughput: la model card declara unos 3.200 pares por segundo; la latencia por par dependera del hardware y del tamano de lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy media (OpenNLI) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| finecat-nli-dbv3-m (este) | 184M | 512 | 0,7962 (macro, 45 conjuntos) | Apache-2.0 | Hugging Face |
| finecat-nli-v2-l | 396M | no disponible | 0,8182 | no disponible en la informacion | Hugging Face |
| finecat-nli-ultra-m | 151M | no disponible | 0,7960 | no disponible en la informacion | Hugging Face |

La model card incluye una tabla comparativa en el OpenNLI leaderboard con estos y otros modelos de la misma familia; los datos de licencia y contexto de las alternativas no se detallan en la informacion proporcionada. No se dispone de comparaciones con cross-encoders NLI de otros autores en la informacion disponible.

## Limitaciones y advertencias

- Solo soporta ingles; el rendimiento en otros idiomas no esta documentado y previsiblemente sera bajo.
- Ventana de contexto de 512 tokens: premisas o hipotesis mas largas deben truncarse, lo que puede degradar la clasificacion.
- El rendimiento cae de forma marcada en ANLI rounds 2 y 3 (0,5820 y 0,5200), lo que indica dificultades con inferencias que requieren razonamiento complejo o conocimiento del mundo.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de falsos positivos y negativos en la clasificacion; las probabilidades deben calibrarse en el dominio de destino.
- Sesgos conocidos: no documentados en la model card; al entrenarse sobre NLI en ingles puede heredar sesgos de esos corpus.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones de los datasets de entrenamiento derivados.
- Modelo muy reciente y sin validacion independiente: cero descargas y cero likes en el momento de la consulta; los resultados son declarados por el autor y no verificados.
- No es un modelo generativo: no sirve para producir texto, razonar de forma multi-paso ni ejecutar tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dleemiller/finecat-nli-dbv3-m
- Demo en vivo: https://huggingface.co/spaces/dleemiller/finecat-nli
- Leaderboard OpenNLI: https://huggingface.co/spaces/dleemiller/open-nli-leaderboard
- Dataset FineCat-NLI: https://huggingface.co/datasets/dleemiller/FineCat-NLI
- Dataset FineCat-NLI-Reason: https://huggingface.co/datasets/dleemiller/FineCat-NLI-Reason
- Modelo base: https://huggingface.co/microsoft/deberta-v3-base
