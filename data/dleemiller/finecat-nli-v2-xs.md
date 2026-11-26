# dleemiller/finecat-nli-v2-xs

## Resumen

FineCat-NLI v2 Extra Small es un cross-encoder de inferencia de lenguaje natural (NLI) desarrollado por dleemiller, afinado a partir del encoder `jhu-clsp/ettin-encoder-32m` (familia ModernBERT). Con solo 32 millones de parámetros, clasifica un par premisa-hipótesis en tres categorías (entailment, neutral, contradiction) y devuelve probabilidades calibradas, lo que lo convierte en una pieza reutilizable para multitud de tareas de clasificación y verificación sin entrenamiento adicional.

El modelo está pensado como herramienta de propósito general para pipelines de RAG, detección de alucinaciones, fact-checking, clasificación zero-shot, enrutamiento de intenciones y guardrails de moderación. Su principal atractivo es la relación entre tamaño y capacidades: un modelo de 32M de parámetros que procesa documentos de hasta 8k tokens y alcanza un throughput de aproximadamente 14.500 pares por segundo, con licencia Apache-2.0.

La versión v2 se ha entrenado sobre los datasets propios FineCat-NLI y FineCat-NLI-Reason, con técnicas de destilación de conocimiento, y se publica junto a una evaluación extendida sobre 45 conjuntos de datos que cubren NLI, clasificación zero-shot y grounding. Está disponible en Hugging Face con 251 descargas y un Space de demostración en vivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, familia Ettin), cross-encoder |
| Parámetros totales | 32.032.131 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 8.000 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en `jhu-clsp/ettin-encoder-32m`, un encoder de la familia ModernBERT de 32M de parámetros. Recibe pares (premisa, hipótesis) y produce una distribución de probabilidad sobre tres etiquetas NLI: entailment, neutral y contradiction. Al ser un cross-encoder, la atención se calcula conjuntamente sobre ambos textos, lo que permite capturar interacciones finas entre premisa e hipótesis a costa de no poder precomputar embeddings.

El entrenamiento parte de los conjuntos de datos propios `dleemiller/FineCat-NLI` y `dleemiller/FineCat-NLI-Reason`, e incorpora técnicas de destilación de conocimiento (etiqueta `knowledge-distillation` en la model card). La model card menciona además que el modelo está afinado para producir probabilidades calibradas, lo que lo hace apto para umbrales operativos en producción. No se especifican en la información disponible el número exacto de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Inferencia de lenguaje natural (NLI) sobre pares premisa-hipótesis con tres clases: entailment, neutral y contradiction.
- Clasificación zero-shot: cada etiqueta se formula como una hipótesis y se compara con el texto de entrada.
- Detección de alucinaciones y verificación de groundedness en pipelines RAG (la model card reporta 0,73 F1 en RAGTruth).
- Fact-checking y comprobación de afirmaciones contra fuentes.
- Enrutamiento y triaje de intenciones (la model card reporta 95,3 % en intents de MASSIVE).
- Guardrails y moderación: comparación de mensajes contra políticas (89,7 % en CrossingGuard y en insultos de Wikipedia).
- Extracción clínica y de determinantes sociales de la salud (97,0 % en SDOH-NLI).
- Procesamiento de documentos largos de hasta 8k tokens por par.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible (es un encoder de clasificación, no un modelo generativo).
- Capacidades multilingües: limitadas al inglés.

## Casos de uso

- Verificación de respuestas en RAG: dado un conjunto de pasajes recuperados y una respuesta generada, el modelo puntúa si la respuesta está respaldada por el contexto, permitiendo descartar o marcar respuestas no fundamentadas antes de mostrarlas al usuario.
- Detección de alucinaciones en producción: se compara la salida de un LLM con las fuentes citadas y se aplica un umbral sobre la probabilidad de entailment para activar revisiones o respuestas de fallback.
- Clasificación zero-shot de tickets de soporte: se formulan las categorías como hipótesis ("This text is about billing") y se elige la de mayor probabilidad, sin necesidad de datos etiquetados por categoría.
- Enrutamiento de intenciones en asistentes conversacionales: con 95,3 % en intents de MASSIVE, puede decidir a qué skill o endpoint derivar cada petición del usuario en un sistema de atención al cliente.
- Moderación y guardrails: evaluar mensajes contra un conjunto de políticas de contenido y bloquear o escalar los que contradigan las normas, con throughput suficiente para filtrar en tiempo real.
- Fact-checking editorial: comprobar afirmaciones de artículos o resúmenes contra documentos de referencia y generar alertas cuando la evidencia contradiga la afirmación.
- Extracción estructurada en dominios clínicos o legales: verificar si una nota contiene un determinado hecho ("El paciente está en paro") para poblar bases de datos sin un modelo generativo.
- Filtrado y reordenación en pipelines de búsqueda: usar las probabilidades NLI como señal de relevancia para reordenar candidatos recuperados por un retriever denso.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Métrica | Valor |
|---|---|---|
| FineCat-NLI (test) | Accuracy | 0,7598 |
| MultiNLI (validation matched) | Accuracy | 0,8144 |
| MultiNLI (validation mismatched) | Accuracy | 0,8173 |
| SNLI (test) | Accuracy | 0,8847 |
| ANLI round 1 (test) | Accuracy | 0,5910 |
| ANLI round 2 (test) | Accuracy | 0,4640 |
| ANLI round 3 (test) | Accuracy | 0,4558 |
| WANLI (test) | Accuracy | 0,6802 |
| LingNLI (validation) | Accuracy | 0,7356 |
| Benchmark de 45 datasets (macro average) | Macro accuracy | 0,7269 |

Comparación en el OpenNLI leaderboard (v0.2.0) frente a la variante small:

| Modelo | Parámetros | Skill Index | Accuracy | mnli | mnli_mismatched | snli | anli_r1 | anli_r2 | anli_r3 | wanli | lingnli | CAL | Throughput (pares/s) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| finecat-nli-v2-s | 68M | 47,1 | 0,7693 | 0,8671 | 0,8663 | 0,9084 | 0,6590 | 0,4990 | 0,4700 | 0,7228 | 0,7992 | 8,8 | 5.591 |
| finecat-nli-v2-xs | 32M | no disponible (truncado en la información) | no disponible (truncado) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card reporta además 0,73 F1 en RAGTruth, 95,3 % en intents de MASSIVE, 89,7 % en CrossingGuard, 89,7 % en insultos de Wikipedia, 86,7 % en 18 tareas de clasificación zero-shot y 97,0 % en SDOH-NLI.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (32M de parámetros), aproximadamente 0,13 GB en fp16 y menos de 0,1 GB en cuantización de 8 bits.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo está pensado para CPU y GPUs de gama baja. Para máximo throughput, A100, H100 o L40S; para despliegue en servidor, T4 o L4 son suficientes.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4060, RTX 4090) e incluso en iGPU y CPU.
- Opciones de despliegue: sentence-transformers (CrossEncoder), Hugging Face Transformers, Text Embedding Inference (TEI), vLLM (soporte de cross-encoders limitado), ONNX Runtime y llama.cpp no aplica (no es un modelo generativo GGUF).
- Throughput: aproximadamente 14.500 pares por segundo según la model card; la variante small reporta 5.591 pares/s en el leaderboard, lo que sitúa al xs claramente por encima en velocidad.
- Latencia: no disponible de forma explícita; con ese throughput, la latencia por par en lote es del orden de decenas de microsegundos en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy (media NLI) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| finecat-nli-v2-xs | 32M | 8k | 0,7269 (macro, 45 datasets) | Apache-2.0 | Hugging Face |
| finecat-nli-v2-s | 68M | no disponible | 0,7693 (OpenNLI) | Apache-2.0 | Hugging Face |
| Cross-encoders NLI de la familia DeBERTa/MiniLM | 22M–184M | 512 típicamente | no disponible en la información | MIT/Apache-2.0 según variante | Hugging Face |

La comparación con alternativas de la misma categoría (cross-encoders NLI pequeños tipo MiniLM o DeBERTa-v3-small) no está disponible con datos numéricos en la información proporcionada; la referencia más directa y documentada es la variante `finecat-nli-v2-s` del mismo autor, con más parámetros y mayor accuracy pero menor throughput.

## Limitaciones y advertencias

- Solo soporta inglés; el rendimiento en otros idiomas no está evaluado y probablemente sea deficiente.
- Es un encoder de clasificación, no un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- Rendimiento moderado en ANLI (0,46–0,59 de accuracy), lo que indica dificultades con inferencias que requieren razonamiento complejo o conocimiento del mundo.
- Riesgo de falsos positivos y negativos en detección de alucinaciones: la probabilidad de entailment no garantiza corrección factual, solo respaldo textual.
- La calibración de probabilidades puede degradarse fuera de la distribución de entrenamiento; conviene validar umbrales en el dominio de producción.
- Licencia Apache-2.0 permisiva para uso comercial, pero sin garantías del autor.
- El contexto de 8k tokens es por par; pares muy largos pueden degradar la precisión.
- No se especifican sesgos conocidos en la información disponible; al entrenarse sobre MNLI, SNLI, ANLI y datasets propios, puede heredar sesgos de esas fuentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dleemiller/finecat-nli-v2-xs
- Demo en vivo (Space): https://huggingface.co/spaces/dleemiller/finecat-nli
- OpenNLI leaderboard: https://huggingface.co/spaces/dleemiller/open-nli-leaderboard
- Dataset FineCat-NLI: https://huggingface.co/datasets/dleemiller/FineCat-NLI
- Dataset FineCat-NLI-Reason: https://huggingface.co/datasets/dleemiller/FineCat-NLI-Reason
- Modelo base Ettin encoder 32M: https://huggingface.co/jhu-clsp/ettin-encoder-32m
- MultiNLI: https://huggingface.co/datasets/nyu-mll/multi_nli
- SNLI: https://huggingface.co/datasets/stanfordnlp/snli
- ANLI: https://huggingface.co/datasets/facebook/anli
- WANLI: https://huggingface.co/datasets/alisawuffles/WANLI
- LingNLI: https://huggingface.co/datasets/tasksource/lingnli
