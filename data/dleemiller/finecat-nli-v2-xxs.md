# dleemiller/finecat-nli-v2-xxs

## Resumen

FineCat-NLI v2 xxs es un cross-encoder de inferencia de lenguaje natural (NLI) desarrollado por dleemiller, afinado a partir del encoder jhu-clsp/ettin-encoder-17m. Su funcion es recibir un par de textos (premisa e hipotesis) y devolver probabilidades calibradas de que la premisa implique, contradiga o sea neutral respecto a la hipotesis. Con solo 16,86 millones de parametros, esta disenado para tareas de clasificacion zero-shot, enrutamiento, deteccion de alucinaciones y grounding en pipelines RAG.

El modelo se apoya en la arquitectura ModernBERT del encoder Ettin, lo que le permite procesar documentos de hasta 8k tokens manteniendo un throughput declarado de aproximadamente 30.600 pares por segundo. Es la variante extra-extra small de la familia FineCat-NLI v2, pensada para despliegues de bajo coste donde la latencia y el consumo de VRAM son criticos.

Su relevancia actual radica en que ofrece una alternativa ligera y con licencia Apache-2.0 para verificar fidelidad de respuestas generadas, moderar contenido y clasificar intenciones sin depender de modelos generativos grandes. Esta entrenado exclusivamente en ingles y su creador lo presenta como una navaja suiza de los encoders NLI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en ModernBERT (Ettin encoder) |
| Parametros totales | 16.864.003 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 8k tokens (documentos) |
| Tipos de cuantizacion | no disponible (pesos safetensors; compatible con cuantizacion estandar via librerias de inferencia) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder construido sobre jhu-clsp/ettin-encoder-17m, un encoder de la familia ModernBERT con 16,86 millones de parametros. Al ser un cross-encoder, procesa conjuntamente la premisa y la hipotesis en una sola pasada, lo que permite modelar interacciones token a token entre ambos textos y produce una cabeza de clasificacion de tres clases (entailment, neutral, contradiction) con probabilidades calibradas.

El entrenamiento parte de los datasets dleemiller/FineCat-NLI y dleemiller/FineCat-NLI-Reason, e incorpora datos de MNLI, SNLI y ANLI segun los tags de la model card. La model card menciona tecnicas de knowledge distillation y una evaluacion extendida sobre 45 conjuntos de datos de NLI, zero-shot y grounding. No se especifican en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Inferencia de lenguaje natural (NLI): clasifica pares premisa-hipotesis en entailment, neutral o contradiction con probabilidades calibradas.
- Clasificacion zero-shot: evalua etiquetas candidatas como "This text is about X" para asignar categorias sin entrenamiento especifico.
- Deteccion de alucinaciones y grounding: compara pasajes recuperados con respuestas generadas para medir fidelidad.
- Reranking: puede usarse como cross-encoder reranker en pipelines de recuperacion.
- Moderacion y guardrails: evalua mensajes frente a declaraciones de politica.
- Extraccion clinica y de atributos: verifica afirmaciones sobre notas clinicas o documentos.
- Routing y triaje de intenciones: clasifica peticiones de usuario en categorias predefinidas.
- Soporte de documentos largos de hasta 8k tokens.
- No soporta tool calling, agentes multi-paso ni generacion de texto; es un modelo discriminativo.

## Casos de uso

- Grounding en RAG: dado un conjunto de pasajes recuperados y una respuesta generada, el modelo calcula la probabilidad de que cada pasaje implique la afirmacion, permitiendo descartar respuestas no soportadas. Su ventana de 8k tokens permite evaluar documentos largos sin truncar.
- Deteccion de alucinaciones en produccion: se compara la salida del LLM con las fuentes citadas y se marca como no fiable cuando la probabilidad de entailment cae por debajo de un umbral, con un coste computacional minimo gracias a sus 17M de parametros.
- Clasificacion zero-shot de tickets: se define una lista de etiquetas ("billing", "shipping", "account access") y se evalua cada una como hipotesis, obteniendo una distribucion de probabilidad sobre categorias sin reentrenar el modelo.
- Moderacion y guardrails: se contrastan mensajes de usuario contra declaraciones de politica de contenido; la model card reporta un 88,3% en CrossingGuard y un 86,7% en insultos de Wikipedia.
- Routing de intenciones en asistentes conversacionales: se clasifica la peticion del usuario frente a intenciones predefinidas ("The user wants to set an alarm") para dirigirla al handler adecuado, con un 95,0% reportado en intents de MASSIVE.
- Verificacion de hechos y fact-checking: se comprueba si una fuente documental implica o contradice una afirmacion, util en pipelines editoriales o de analisis de desinformacion.
- Extraccion de informacion clinica: se valida si una nota clinica respalda afirmaciones como "The patient is unemployed", con un 97,0% reportado en SDOH-NLI.
- Reranking en busqueda semantica: se reordena un conjunto de candidatos recuperados por un retriever denso evaluando cada par consulta-documento con el cross-encoder.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Metrica | Valor |
|---|---|---|
| FineCat-NLI (test) | Accuracy | 0,7305 |
| MultiNLI (validation matched) | Accuracy | 0,7679 |
| MultiNLI (validation mismatched) | Accuracy | 0,7720 |
| SNLI (test) | Accuracy | 0,8619 |
| ANLI round 1 (test) | Accuracy | 0,4960 |
| ANLI round 2 (test) | Accuracy | 0,4360 |
| ANLI round 3 (test) | Accuracy | 0,4117 |
| WANLI (test) | Accuracy | 0,6544 |
| LingNLI (validation) | Accuracy | 0,6752 |
| Benchmark de 45 datasets (macro average) | Macro accuracy | 0,6931 |

La model card reporta ademas un F1 de 0,69 en RAGTruth, un 84,6% en clasificacion zero-shot sobre 18 tareas, un 88,3% en CrossingGuard y un 86,7% en insultos de Wikipedia. El throughput declarado es de aproximadamente 30.600 pares por segundo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (16,86M de parametros, ~67 MB en fp32); en fp16 o cuantizacion int8 cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; funciona en RTX 3060, RTX 4090, T4, A100 y H100. En CPU es viable para cargas moderadas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna e incluso en iGPU y CPU.
- Opciones de despliegue: sentence-transformers (CrossEncoder), Hugging Face Transformers, Text Embedding Inference (TEI), ONNX Runtime y llama.cpp no aplica (no es un modelo generativo GGUF).
- Latencia y throughput: el autor declara ~30.600 pares por segundo; la latencia por par es del orden de microsegundos en GPU moderna, aunque depende del hardware y de la longitud de los documentos (hasta 8k tokens).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Skill Index (OpenNLI) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| finecat-nli-v2-xxs | 16,86M | 8k | no disponible en la informacion | Apache-2.0 | Hugging Face |
| finecat-nli-v2-s | 68M | no disponible | 47,1 | Apache-2.0 | Hugging Face |
| Encoders NLI genericos (p. ej. DeBERTa-v3-base fine-tuned) | ~86-184M | 512 tokens tipicamente | no disponible | variable (MIT/Apache) | Hugging Face |

La variante s de la misma familia ofrece mayor precision (accuracy 0,7693 en el leaderboard OpenNLI frente a los valores individuales de la variante xxs) a cambio de 4 veces mas parametros y un throughput menor (5.591 pares/s). La ventaja principal de la variante xxs es su coste computacional minimo y su contexto de 8k tokens, superior al de la mayoria de cross-encoders NLI convencionales limitados a 512 tokens.

## Limitaciones y advertencias

- Solo soporta ingles; el rendimiento en otros idiomas no esta garantizado ni documentado.
- Rendimiento bajo en ANLI (0,41-0,50 de accuracy), lo que indica dificultad con inferencias adversarias y razonamiento complejo.
- Riesgo de falsos negativos en grounding: umbrales demasiado estrictos pueden descartar respuestas correctas.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (campo "verified": false).
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- La calibracion de probabilidades puede degradarse fuera de la distribucion de entrenamiento.
- Aunque la licencia Apache-2.0 permite uso comercial, conviene revisar las licencias de los datasets de entrenamiento subyacentes.
- El modelo base Ettin esta disenado para eficiencia; su capacidad representacional es limitada frente a encoders de mayor tamano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dleemiller/finecat-nli-v2-xxs
- Demo Space: https://huggingface.co/spaces/dleemiller/finecat-nli
- Leaderboard OpenNLI: https://huggingface.co/spaces/dleemiller/open-nli-leaderboard
- Dataset FineCat-NLI: https://huggingface.co/datasets/dleemiller/FineCat-NLI
- Dataset FineCat-NLI-Reason: https://huggingface.co/datasets/dleemiller/FineCat-NLI-Reason
- Modelo base Ettin encoder 17m: https://huggingface.co/jhu-clsp/ettin-encoder-17m
- Dataset MultiNLI: https://huggingface.co/datasets/nyu-mll/multi_nli
- Dataset SNLI: https://huggingface.co/datasets/stanfordnlp/snli
- Dataset ANLI: https://huggingface.co/datasets/facebook/anli
- Dataset WANLI: https://huggingface.co/datasets/alisawuffles/WANLI
- Dataset LingNLI: https://huggingface.co/datasets/tasksource/lingnli
