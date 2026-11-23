# castorini/gaggle-reranker-0.6b-20261122

## Resumen

gaggle-reranker-0.6b-20261122 es un modelo de reranking pointwise desarrollado por el grupo Castorini (habitualmente vinculado a la Universidad de Waterloo) para la segunda etapa de pipelines de recuperación de información. Se construye sobre un backbone transformer nanochat preentrenado desde cero sobre el corpus ClimbMix, sin depender de pesos de terceros: tanto el corpus, como la receta de preentrenamiento y los datos de ajuste fino son públicos. El modelo puntúa pares (query, pasaje) uno a uno y se emplea para reordenar los candidatos devueltos por un retriever de primera etapa como BM25.

La relevancia de este lanzamiento reside en su relación calidad/tamaño: con 0,52 mil millones de parámetros iguala prácticamente al reranker de 0,9B de la misma familia (0,634 frente a 0,632 de nDCG@10 medio en TREC DL, y 0,533 en ambos casos en BEIR) y queda a solo 0,008 y 0,013 puntos del reranker de 3,2B en esos mismos conjuntos. Esto lo sitúa como una opción atractiva para despliegues con restricciones de memoria o latencia, donde un modelo de 3B resulta prohibitivo.

El modelo se publica bajo licencia MIT, con pesos en safetensors, tokenizer byte-level BPE de 32.768 entradas y un contexto de backbone de 2.048 tokens. Está pensado exclusivamente para inglés y su uso previsto es el reranking sobre candidatos de un primer recuperador, no la generación de texto libre.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (nanochat): 28 capas, anchura 1.024, 8 cabezas de dimensión 128, atención causal, value embeddings cada 7 capas |
| Parámetros totales | 520.096.210 (0,52B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (contexto del backbone); entrenado con truncamiento a 128 tokens de query y 512 de pasaje |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (custom_code, librería nanochat) |

## Arquitectura y entrenamiento

El modelo reutiliza el backbone nanochat del checkpoint preentrenado `gaggle-nanochat-0.6b-pretrained-climbmix-20261121`, un transformer causal de 28 capas y anchura 1.024 con atención causal y value embeddings en cada séptima capa. La innovación clave está en la cabeza de scoring: no se añade una cabeza de clasificación, sino que se descartan todas las filas de la LM head salvo dos, correspondientes a los tokens " true" y " false", y la puntuación se calcula como `s(q, d) = logit(" true") − logit(" false")` en el último token del prompt. El prompt tiene el formato `<|bos|>Query: {query}\nPassage: {passage}\nRelevant:`. El resultado es un modelo ligeramente más pequeño que su backbone (0,52B frente a 0,55B) porque se eliminan las filas no utilizadas de la cabeza de lenguaje.

El ajuste fino se realiza sobre RLHN-250K (247.534 instancias), un subconjunto curado de siete colecciones de recuperación de la mezcla de entrenamiento de BGE en el que una cascada de LLM reetiqueta falsos negativos como positivos. El objetivo es localized contrastive estimation (LCE): un softmax sobre un positivo y K negativos duros muestreados por query, con temperatura τ = 1 y K ∈ {7, 15, 23} elegido por instancia según el tamaño del pool de negativos. Se entrena una sola época con AdamW (β = 0,9/0,95, weight decay 0,01), learning rate pico de 5 × 10⁻⁵ con 150 pasos de warm-up y decaimiento coseno, clipping de norma global 12, batch efectivo de 128 grupos de query por actualización y 1.928 actualizaciones totales en una NVIDIA H200, con pesos y estado del optimizador en FP32 y matmuls en TF32. No hay destilación, datos sintéticos ni modelo profesor, y es una única ejecución (no un model soup).

## Capacidades

- Reranking pointwise de pares (query, pasaje) para reordenar candidatos de un retriever de primera etapa.
- Puntuación de relevancia calibrada mediante la diferencia de logits entre los tokens " true" y " false".
- Manejo de contexto de hasta 2.048 tokens por par, muy por encima del truncamiento de entrenamiento (128 de query y 512 de pasaje).
- Tokenizer byte-level BPE de 32.768 entradas, compartido con los modelos de 0,9B y 3,3B de la familia.
- Integración con el ecosistema Transformers mediante `AutoModelForSequenceClassification` con `trust_remote_code=True`.
- Compatibilidad con `sentence-transformers` según los tags del repositorio.
- Capacidad monolingüe: únicamente inglés.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido: es un modelo especializado en ranking.

## Casos de uso

- Reranking en motores de búsqueda documental: se recuperan los 100 mejores candidatos con BM25 y el modelo los reordena; en TREC DL mejora el nDCG@10 medio de 0,393 (BM25) a 0,634, lo que supone un salto sustancial en la calidad de los resultados mostrados al usuario.
- Búsqueda semántica en dominios científicos: con 0,774 de nDCG@10 en SciFact y 0,224 en SCIDOCS, es adecuado para reranking de literatura académica y corpus científicos tras una primera etapa léxica.
- Atención al cliente sobre base de conocimiento: dado que soporta pares de hasta 2.048 tokens, puede puntuar fragmentos largos de documentación frente a consultas de usuarios y priorizar los pasajes más relevantes antes de pasarlos a un LLM generador.
- Búsqueda en dominios biomédicos: los resultados en TREC-COVID (0,851) y NFCorpus (0,377) lo hacen viable para reranking de literatura médica y preguntas clínicas, aunque con la cautela de que TREC-COVID y NFCorpus están fuera de dominio respecto a los datos de entrenamiento.
- Pipelines RAG con restricciones de latencia: al tener solo 0,52B de parámetros, puede desplegarse en GPUs de consumo y ejecutarse sobre decenas de candidatos por consulta sin dominar el coste total del pipeline.
- Evaluación y experimentación académica: la licencia MIT, la disponibilidad de todos los datos y recetas, y la reproducibilidad del entrenamiento (una sola ejecución, sin soup) lo convierten en una línea base sólida para investigación en recuperación de información.
- Filtrado de noticias y contenidos: con 0,521 de nDCG@10 en TREC-News, sirve para priorizar artículos relevantes en sistemas de alertas o agregadores, aunque el rendimiento es más modesto que en otros dominios.

## Benchmarks y rendimiento

nDCG@10 rerankeando los 100 mejores candidatos de BM25 recuperados con Pyserini, truncamiento 128/512, evaluado con `trec_eval`.

| Modelo | DL19 | DL20 | DL21 | DL22 | DL23 | Media |
|---|---:|---:|---:|---:|---:|---:|
| BM25 (primera etapa) | 0,506 | 0,480 | 0,446 | 0,269 | 0,263 | 0,393 |
| **gaggle-reranker-0.6b (0,52B)** | 0,759 | 0,707 | 0,709 | 0,524 | 0,469 | **0,634** |
| gaggle-reranker-0.9b (0,85B) | 0,759 | 0,714 | 0,710 | 0,525 | 0,450 | 0,632 |
| gaggle-reranker-3.2B (soup de cuatro ejecuciones) | 0,757 | 0,723 | 0,714 | 0,533 | 0,480 | 0,641 |

| Modelo | COVID | News | Robust04 | NFCorpus | SciFact | SCIDOCS | FiQA | Media |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| BM25 (primera etapa) | 0,595 | 0,395 | 0,407 | 0,322 | 0,679 | 0,149 | 0,236 | 0,398 |
| **gaggle-reranker-0.6b (0,52B)** | 0,851 | 0,521 | 0,556 | 0,377 | 0,774 | 0,224 | 0,432 | **0,533** |
| gaggle-reranker-0.9b (0,85B) | 0,852 | 0,499 | 0,563 | 0,378 | 0,773 | 0,227 | 0,440 | 0,533 |
| gaggle-reranker-3.2B (soup de cuatro ejecuciones) | 0,859 | 0,515 | 0,592 | 0,380 | 0,790 | 0,236 | 0,455 | 0,547 |

Frente al reranker de 0,9B, las diferencias en las medias son de 0,002 en TREC DL y menos de 0,001 en BEIR. Las mayores diferencias por colección a favor de este modelo son DL23 (+0,019) y News (+0,022); a favor del 0,9B, FiQA (−0,008), DL20 y Robust04 (−0,007 cada una). Frente a las ejecuciones individuales de la misma receta sobre el backbone de 3,3B (media de cuatro: 0,640 / 0,544), este modelo queda 0,006 por debajo en TREC DL y 0,011 en BEIR. Las mayores brechas respecto al soup de 3,2B son Robust04 (0,036), FiQA (0,024) y DL20 (0,016). Cuatro ejecuciones de esta receta sobre el backbone de 3,3B varían unas 0,003 en cada media de benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 0,52B en FP16 requiere aproximadamente 1 GB de pesos, y el repo ocupa 2,1 GB (probablemente por incluir pesos en mayor precisión o estados adicionales); las cifras exactas no se detallan.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA H200, pero para inferencia un modelo de este tamaño cabe holgadamente en GPUs de consumo.
- Cabe en GPU de consumo: sí, por tamaño (0,52B), aunque no se especifican requisitos mínimos concretos ni GPUs validadas.
- Opciones de despliegue: Transformers (≥ 4.52) con `trust_remote_code=True` y `AutoModelForSequenceClassification`; compatible con `sentence-transformers` según los tags. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | TREC DL (media) | BEIR (media) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **gaggle-reranker-0.6b-20261122** | 0,52B | 2.048 | 0,634 | 0,533 | MIT | Hugging Face |
| gaggle-reranker-0.9b-20261108 | 0,85B | 2.048 (backbone compartido) | 0,632 | 0,533 | No disponible en la información | Hugging Face |
| gaggle-reranker-20261005 (3,2B) | 3,2B | No disponible | 0,641 | 0,547 | No disponible en la información | Hugging Face |

La comparativa se limita a los miembros de la propia familia Gaggle, que son los únicos modelos con datos de rendimiento en la información proporcionada. No se dispone de datos de benchmarks de alternativas externas (por ejemplo, rerankers de BGE, Cohere o Mixedbread) para establecer una comparación cruzada fiable.

## Limitaciones y advertencias

- Modelo monolingüe: solo soporta inglés, lo que descarta su uso directo en otros idiomas sin un ajuste adicional.
- Especializado exclusivamente en reranking: no genera texto, no soporta tool calling ni razonamiento multi-paso; usarlo fuera de su tarea prevista dará resultados deficientes.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí existe riesgo de puntuaciones mal calibradas en dominios alejados de los datos de entrenamiento: cuatro de las siete colecciones BEIR (TREC-COVID, TREC-News, Robust04 y NFCorpus) están fuera de dominio respecto a RLHN-250K.
- Rendimiento más débil en colecciones concretas: SCIDOCS (0,224), NFCorpus (0,377) y FiQA (0,432) muestran margen de mejora frente a los modelos mayores.
- El truncamiento de entrenamiento (128 tokens de query, 512 de pasaje) no es un límite duro en inferencia, pero el comportamiento con entradas mucho más largas que las vistas en entrenamiento no está validado más allá del contexto de 2.048 tokens del backbone.
- Sesgos: no se documentan sesgos específicos en la información proporcionada; al entrenarse sobre un subconjunto de la mezcla de BGE con reetiquetado por LLM, puede heredar sesgos de ese proceso de anotación.
- Licencia MIT: permite uso comercial sin restricciones significativas, pero conviene revisar las obligaciones de atribución habituales.
- Es una única ejecución de entrenamiento, no un model soup; la variabilidad entre ejecuciones de la misma receta en el backbone de 3,3B es de unas 0,003 en las medias, lo que da una idea del ruido esperado.
- El uso de `trust_remote_code=True` implica ejecutar código del repositorio; conviene auditar el código antes de desplegarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castorini/gaggle-reranker-0.6b-20261122
- Modelo base: https://huggingface.co/castorini/gaggle-nanochat-0.6b-pretrained-climbmix-20261121
- Reranker de 0,9B de la familia: https://huggingface.co/castorini/gaggle-reranker-0.9b-20261108
- Reranker de 3,2B de la familia: https://huggingface.co/castorini/gaggle-reranker-20261005
- Dataset de entrenamiento RLHN-250K: https://huggingface.co/datasets/rlhn/rlhn-250K
- Pyserini (herramienta de recuperación usada en la evaluación): https://github.com/castorini/pyserini
- Paper referenciado (arXiv:2610.11922): https://arxiv.org/abs/2610.11922
