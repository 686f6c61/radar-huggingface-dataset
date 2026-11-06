# dleemiller/finecat-nli-dbv3-s

## Resumen

FineCat-NLI dbv3 Small es un cross-encoder de inferencia de lenguaje natural (NLI) desarrollado por dleemiller, afinado a partir de `microsoft/deberta-v3-xsmall`. Su funcion es recibir un par (premisa, hipotesis) y devolver probabilidades calibradas de que la premisa implique, contradiga o sea neutral respecto a la hipotesis. Con solo 70,8 millones de parametros totales (22 millones en el backbone), esta pensado como componente ligero de clasificacion y verificacion dentro de pipelines de RAG, moderacion y fact-checking.

El modelo se distribuye bajo licencia Apache-2.0, unicamente en ingles, con entradas de hasta 512 tokens y un rendimiento declarado de aproximadamente 7.500 pares por segundo en hardware adecuado. La model card lo presenta como una "navaja suiza" de encoders: un unico artefacto que sirve para enrutado de intenciones, clasificacion zero-shot, deteccion de alucinaciones y extraccion de informacion estructurada a partir de texto libre.

Su relevancia actual radica en la economia de recursos: frente a usar un LLM generativo para tareas de verificacion o etiquetado, un cross-encoder de este tamano ofrece latencia baja, coste minimo y salidas probabilisticas directamente utilizables como umbral de decision. El autor publica ademas una evaluacion extendida sobre 45 conjuntos de datos con una macro precision media de 0,7685.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3) como cross-encoder |
| Parametros totales | 70.831.107 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16; no se documentan GGUF ni otras) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | microsoft/deberta-v3-xsmall |
| Libreria | sentence-transformers (CrossEncoder) |
| Pipeline | zero-shot-classification / text-classification |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en DeBERTa-v3-xsmall, una arquitectura transformer con atencion desacoplada y embeddings de posicion relativos mejorados respecto a DeBERTa original. La variante xsmall reduce el backbone a 22 millones de parametros, lo que explica el total de 70,8 millones contando la cabeza de clasificacion. Al ser un cross-encoder, procesa premisa e hipotesis conjuntamente en una sola pasada, lo que permite capturar interacciones finas entre ambos textos a costa de no poder precalcular representaciones independientes.

El autor indica que el entrenamiento se realizo sobre los datasets propios `dleemiller/FineCat-NLI` y `dleemiller/FineCat-NLI-Reason`, e incluye la etiqueta `knowledge-distillation`, lo que sugiere que se empleo destilacion de conocimiento desde un modelo mayor (posiblemente la variante de 150M `finecat-nli-v2-m` mencionada en la tabla comparativa). No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; al tratarse de una tarea de clasificacion supervisada, lo habitual seria entrenamiento con perdida de entropia cruzada sobre las tres clases NLI.

## Capacidades

- Inferencia de lenguaje natural (NLI): clasifica pares premisa-hipotesis en entailment, contradiction o neutral con probabilidades calibradas.
- Clasificacion zero-shot: cada etiqueta candidata se formula como hipotesis y se compara contra el texto de entrada.
- Reranking de recuperacion: puede puntuar pares consulta-documento como cross-encoder en pipelines de busqueda.
- Deteccion de alucinaciones y groundedness: compara la respuesta generada con los pasajes recuperados para estimar si esta respaldada.
- Moderacion y guardrails: evalua si un mensaje cumple o viola una politica expresada como enunciado.
- Enrutado y triaje de intenciones: asigna peticiones a categorias mediante hipotesis del tipo "El usuario quiere X".
- Extraccion de informacion clinica y estructurada: infiere atributos a partir de notas o textos libres.
- Capacidad multilingue: limitada al ingles; no se declaran otros idiomas.
- Tool calling / function calling: no disponible; es un clasificador, no un modelo generativo.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa; puede usarse como subcomponente de verificacion dentro de un agente.

## Casos de uso

- Grounding en RAG: tras recuperar pasajes y generar una respuesta, se compara cada afirmacion de la respuesta con los fragmentos recuperados; si la probabilidad de entailment cae por debajo de un umbral, se marca la respuesta como no respaldada. La model card reporta 0,71 de F1 en RAGTruth para esta tarea.
- Moderacion y guardrails: se define cada politica como un enunciado ("Este mensaje contiene insultos") y se evalua el mensaje del usuario contra todas ellas; la model card cita 91,5% en CrossingGuard y 93,0% en insultos de Wikipedia.
- Enrutado de intenciones en atencion al cliente: se comparan las peticiones con hipotesis de intencion ("El usuario quiere cambiar su contrasena") y se deriva al flujo adecuado; la model card reporta 96,7% en intents de MASSIVE.
- Clasificacion zero-shot de resenas y tickets: se etiquetan textos con categorias definidas en tiempo de inferencia sin reentrenar, con 90,2% en un conjunto de 18 tareas segun el autor.
- Extraccion de determinantes sociales de la salud: a partir de notas clinicas se infiere si el paciente esta desempleado, vive solo, etc.; la model card cita 98,2% en SDOH-NLI.
- Fact-checking ligero: dado un articulo y una afirmacion, se estima si el texto la respalda, la contradice o es neutral, como paso previo a una revision humana.
- Reranking en busqueda semantica: se usa como segunda fase tras un retriever bi-encoder, puntuando pares consulta-documento con mayor precision a coste de una pasada conjunta por par.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente):

| Dataset | Split | Metrica | Valor |
|---|---|---|---|
| FineCat-NLI | test | Accuracy | 0,8011 |
| MultiNLI | validation_matched | Accuracy | 0,8857 |
| MultiNLI | validation_mismatched | Accuracy | 0,8871 |
| SNLI | test | Accuracy | 0,9156 |
| ANLI round 1 | test_r1 | Accuracy | 0,6690 |
| ANLI round 2 | test_r2 | Accuracy | 0,5150 |
| ANLI round 3 | test_r3 | Accuracy | 0,4792 |
| WANLI | test | Accuracy | 0,7366 |
| LingNLI | validation | Accuracy | 0,8314 |
| Benchmark 45 datasets (macro promedio) | test | Macro accuracy | 0,7685 |

Throughput declarado en la model card: aproximadamente 7.500 pares por segundo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (70,8M parametros, unos 283 MB de pesos) y alrededor de 150 MB en fp16; el consumo real depende del tamano de lote y de la longitud de secuencia.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 4090 o RTX 3090 sobredimensionan el modelo y permiten lotes grandes. Tambien funciona en CPU con throughput razonable para volumenes moderados.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 2 GB o mas de VRAM, incluidas GTX 1650, RTX 3060 y superiores.
- Opciones de despliegue: sentence-transformers (CrossEncoder), Hugging Face Transformers con AutoModelForSequenceClassification, Text Embedding Inference (TEI) y ONNX Runtime. No se documentan pesos GGUF ni soporte nativo en Ollama o llama.cpp.
- Latencia y throughput: el autor declara unos 7.500 pares/s; la latencia por par depende del hardware y de la longitud de las secuencias (hasta 512 tokens).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy media NLI | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| finecat-nli-dbv3-s (este) | 70,8M | 512 | 0,7685 (macro 45 datasets) | Apache-2.0 | Hugging Face |
| dleemiller/finecat-nli-v2-m | 150M | no disponible | 0,7942 (accuracy OpenNLI) | no disponible en la informacion | Hugging Face |
| microsoft/deberta-v3-xsmall (base) | 70,8M (22M backbone) | 512 | no disponible como NLI sin afinado | MIT | Hugging Face |

La model card incluye una tabla del leaderboard OpenNLI v0.2.5 en la que la variante de 150M supera a este modelo en precision global (0,7942 frente a valores no desglosados para la variante small en el fragmento disponible), a cambio de mas del doble de parametros. No se dispone de datos comparativos con otros cross-encoders NLI de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles: no se declara soporte de otros idiomas, por lo que su uso en castellano producira resultados degradados.
- Riesgo de sesgo: al entrenarse sobre datasets NLI (MNLI, SNLI, ANLI y otros), puede heredar sesgos de genero, raza o dominio presentes en esas fuentes; no se documenta ninguna mitigacion.
- Alucinacion no aplica en sentido generativo, pero si hay riesgo de falsos positivos y negativos en la clasificacion; los umbrales de decision deben calibrarse sobre datos propios.
- Rendimiento desigual por dominio: los resultados en ANLI r2 y r3 (0,5150 y 0,4792) muestran dificultad con inferencias adversariales y de razonamiento complejo.
- Ventana de 512 tokens: premisas o hipotesis mas largas deben truncarse, lo que puede perder informacion relevante.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones de los datasets de entrenamiento subyacentes si se redistribuye el modelo.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: no hay validacion comunitaria independiente de los resultados declarados.
- No es un modelo generativo: no puede producir texto, invocar herramientas ni mantener conversaciones por si mismo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dleemiller/finecat-nli-dbv3-s
- Demo en vivo (Space): https://huggingface.co/spaces/dleemiller/finecat-nli
- Leaderboard OpenNLI: https://huggingface.co/spaces/dleemiller/open-nli-leaderboard
- Dataset FineCat-NLI: https://huggingface.co/datasets/dleemiller/FineCat-NLI
- Dataset FineCat-NLI-Reason: https://huggingface.co/datasets/dleemiller/FineCat-NLI-Reason
- Modelo base: https://huggingface.co/microsoft/deberta-v3-xsmall
