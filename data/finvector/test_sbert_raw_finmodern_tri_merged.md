# finvector/Test_sbert_raw_finmodern_tri_merged

## Resumen

`finvector/Test_sbert_raw_finmodern_tri_merged` es un modelo de embeddings de frases (sentence-transformers) derivado de `sentence-transformers/bert-base-nli-mean-tokens`, afinado por el usuario finvector sobre un conjunto de datos muy reducido (70 ejemplos) mediante la función de pérdida `CachedMultipleNegativesRankingLoss` en una tarea de tripletas. Su propósito es generar representaciones vectoriales densas para similitud semántica y extracción de características, orientado aparentemente al dominio financiero por el vocabulario de los ejemplos de la model card (balances, goodwill, informes 10-K, reservas de siniestros).

Arquitectura BERT base con 109.482.240 parámetros totales (aproximadamente 110 M), pesos en safetensors y un repositorio de 0,2 GB. La longitud de contexto no se declara explícitamente en la información disponible; al derivar de BERT base, la ventana típica es de 512 tokens, pero este dato no está confirmado en la model card.

El modelo tiene 0 descargas y 0 likes en el momento de la consulta, está etiquetado como `Test` y su relevancia práctica es limitada: se trata de un experimento de afinamiento ligero sobre un corpus diminuto, no de un modelo de producción validado. Resulta útil como referencia para entender pipelines de entrenamiento con Sentence-Transformers y para tareas de similitud en inglés financiero a pequeña escala, pero no debe adoptarse sin una evaluación propia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder), sentence-transformers con pooling mean |
| Parametros totales | 109.482.240 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo base BERT, ventana típica de 512 tokens no confirmada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder BERT base afinado con la librería Sentence-Transformers. El pipeline declarado es `sentence-similarity` y también admite `feature-extraction`. La estrategia de pooling es la del modelo base `bert-base-nli-mean-tokens`, es decir, media de los embeddings de tokens. El entrenamiento se realizó con `CachedMultipleNegativesRankingLoss`, una pérdida de ranking por negativos en caché que aprovecha negativos en lote para mejorar la separación entre pares positivos y negativos sin necesidad de minar negativos duros explícitos.

El conjunto de entrenamiento consta de solo 70 ejemplos (`dataset_size:70`), lo que sitúa el ajuste en la categoría de experimento ligero más que de entrenamiento sustantivo. No se documenta el número de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO; en un modelo de embeddings estas etapas no son habituales. La innovación técnica reseñable es el uso de la citada pérdida con caché de negativos, que permite lotes efectivos grandes con memoria acotada, junto con la fusión (`merged`) de pesos indicada en el nombre del repositorio. No se declaran técnicas como decodificación especulativa ni atención lineal.

## Capacidades

- Generación de embeddings de frases para similitud semántica y búsqueda semántica.
- Extracción de características (`feature-extraction`) a nivel de frase y de token.
- Ranking de pares por similitud coseno, adecuado para recuperación densa (dense retrieval).
- Capacidad multilingüe: no; solo inglés según la etiqueta `language: en`.
- Tool calling / function calling: no aplica; es un modelo de embeddings, no generativo.
- Agentes y razonamiento multi-paso: no aplica.
- Modo thinking, visión o audio: no disponible.
- Dominio aparente: texto financiero en inglés (informes 10-K, notas contables, referencias de exhibits).

## Casos de uso

- Búsqueda semántica en corpus financieros: indexar fragmentos de informes anuales (10-K, 10-Q) y recuperar pasajes relevantes por similitud coseno, aprovechando el vocabulario contable presente en los ejemplos de entrenamiento.
- Deduplicación de documentos: comparar embeddings de cláusulas o secciones repetidas en contratos y prospectos para eliminar duplicados antes de un pipeline de análisis.
- Clasificación por similitud con prototipos: asignar etiquetas (por ejemplo, tipo de riesgo o categoría contable) calculando la similitud entre el embedding del texto y los embeddings medios de cada clase.
- Detección de cláusulas similares en due diligence: agrupar fragmentos de referencias cruzadas y exhibits que describen el mismo acuerdo o plan de compensación.
- Enrutamiento de consultas en un asistente documental: usar el embedding de la pregunta para seleccionar la partición del índice o el subconjunto de documentos que se enviará a un modelo generativo posterior (RAG).
- Evaluación comparativa de pipelines de embeddings: servir como línea base ligera (0,2 GB, 110 M parámetros) para contrastar con modelos de embeddings más grandes en tareas de similitud financiera antes de escalar.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card (no verificados):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Triplet | triplet eval | Cosine Accuracy | 0,9333 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, MTEB, etc.) en la información disponible. El valor de 0,9333 procede de una evaluación sobre un conjunto de tripletas no descrito y con `verified: false`, por lo que debe interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,44 GB solo de pesos (109,5 M × 4 bytes), más activaciones y overhead; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- En FP16/BF16: alrededor de 0,22 GB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna sirve; RTX 3060, RTX 4060, RTX 4090, así como A100/H100 para despliegues de alto throughput con batching.
- Cabe en GPU consumer: sí, en cualquier modelo con al menos 2 GB de VRAM; también puede ejecutarse en CPU para volúmenes moderados.
- Opciones de despliegue: `sentence-transformers` (PyTorch), `text-embeddings-inference` (etiqueta `endpoints_compatible` presente), ONNX Runtime si se exporta, y servicios de inferencia compatibles con Hugging Face Endpoints.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| finvector/Test_sbert_raw_finmodern_tri_merged | 109,5 M | no disponible (base BERT, 512 típico) | apache-2.0 | Hugging Face, 0 descargas | Afinado sobre 70 ejemplos; benchmark propio no verificado |
| sentence-transformers/bert-base-nli-mean-tokens (base) | ~110 M | 512 tokens (típico en BERT base) | apache-2.0 | Hugging Face, ampliamente usado | Entrenado en NLI; referencia generalista en inglés |
| sentence-transformers/all-MiniLM-L6-v2 | ~22 M | 256 tokens | apache-2.0 | Hugging Face, muy popular | Mucho más ligero y rápido; calidad general sólida en inglés |
| BAAI/bge-base-en-v1.5 | ~109 M | 512 tokens | MIT | Hugging Face, popular en MTEB | Rendimiento competitivo en recuperación; requiere prefijo de consulta |

La comparación de rendimiento cuantitativo entre estos modelos no está disponible en la información proporcionada; el único dato numérico es la cosine accuracy de 0,9333 del modelo evaluado sobre su propio conjunto de tripletas.

## Limitaciones y advertencias

- Entrenado con solo 70 ejemplos: riesgo alto de sobreajuste y de generalización pobre fuera del dominio y estilo de los datos de entrenamiento.
- Solo inglés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- El benchmark declarado (0,9333 de cosine accuracy) no está verificado y procede de un conjunto de evaluación no descrito; no es comparable con resultados de MTEB.
- Modelo marcado como `Test` y con 0 descargas: no hay evidencia de uso en producción ni de validación independiente.
- Riesgo de sesgos heredados del corpus base (`bert-base-nli-mean-tokens`) y del pequeño conjunto de afinamiento, que parece centrado en documentación financiera estadounidense.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso; cualquier expectativa en ese sentido es incorrecta.
- La licencia apache-2.0 permite uso comercial, pero el usuario debe evaluar por su cuenta la calidad y los sesgos antes de desplegarlo.
- La longitud de contexto no está declarada; asumir 512 tokens sin verificación puede truncar entradas largas de forma silenciosa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/finvector/Test_sbert_raw_finmodern_tri_merged
- Modelo base: https://huggingface.co/sentence-transformers/bert-base-nli-mean-tokens
- Paper de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de Multiple Negatives Ranking (arXiv:2101.06983): https://arxiv.org/abs/2101.06983
- Librería Sentence-Transformers: https://www.sbert.net/
- Documentación de Text Embeddings Inference: https://huggingface.co/docs/text-embeddings-inference
