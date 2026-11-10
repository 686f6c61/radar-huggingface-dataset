# fisherman611/vibi-appfilter-ft1

## Resumen

`fisherman611/vibi-appfilter-ft1` es un modelo de embeddings de frases (sentence-transformers) derivado del codificador bi-encoder vietnamita `bkai-foundation-models/vietnamese-bi-encoder`. Está publicado por el usuario fisherman611 en Hugging Face y se distribuye con licencia Apache 2.0. Su función es mapear oraciones y párrafos del vietnamita a un espacio vectorial denso de 768 dimensiones, de modo que la similitud coseno entre vectores refleje la similitud semántica entre textos. Es, por tanto, una pieza de infraestructura para búsqueda semántica, clustering y filtrado de candidatos por similitud, no un modelo generativo.

El modelo parte del backbone PhoBERT-base-v2 (arquitectura RoBERTa, ~135 M de parámetros) y conserva la cabeza de *mean pooling* del sentence-transformer original. El nombre del repositorio (`appfilter`) sugiere un ajuste fino orientado a filtrar aplicaciones o candidatos por relevancia semántica, aunque la model card publicada no documenta ese ajuste específico ni los datos empleados en él.

Su relevancia práctica es acotada pero clara: cubre el nicho de recuperación semántica en vietnamita, un idioma con pocos modelos de embeddings de calidad, y lo hace con un tamaño reducido (0,5 GB de repositorio) que permite desplegarlo en CPU o en GPUs de consumo. La ausencia de descargas y likes en el momento de la ficha indica que es un artefacto reciente y poco validado por la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (backbone PhoBERT-base-v2) + mean pooling |
| Parámetros totales | 134.998.272 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (`max_seq_length` del Transformer) |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización a int8/fp16 posible vía herramientas estándar, no documentada por el autor) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimensión del embedding | 768 |
| Pooling | mean tokens (con máscara de atención) |
| Función de similitud | coseno |
| Tamaño del repositorio | 0,5 GB |
| Librería declarada | generic (compatible con transformers y sentence-transformers) |

## Arquitectura y entrenamiento

La arquitectura es un `SentenceTransformer` de dos módulos: un `Transformer` con `max_seq_length` de 256 y un `Pooling` de tipo mean tokens sobre un espacio de 768 dimensiones. El backbone es PhoBERT-base-v2, un RoBERTa preentrenado sobre corpus vietnamitas, por lo que hereda su tokenizador y su segmentación de palabras. El pipeline declarado es `sentence-similarity` y los tags incluyen `feature-extraction` y `sentence-transformers`.

La model card del repositorio reproduce la del modelo base `bkai-foundation-models/vietnamese-bi-encoder`: entrenamiento con `MultipleNegativesRankingLoss` (escala 20,0, similitud coseno), AdamW con learning rate 2e-5, scheduler WarmupLinear con 1.000 pasos de calentamiento, weight decay 0,01, 15 épocas y batches de 32 sobre un DataLoader de 17.584 pasos. El dataset de entrenamiento del modelo base combina MS MARCO traducido al vietnamita, SQuAD v2 traducido al vietnamita y el 80 % del conjunto de entrenamiento del reto Legal Text Retrieval Zalo 2021. No se documenta qué ajuste adicional, si alguno, se aplicó para producir `vibi-appfilter-ft1`, ni con qué datos.

Una particularidad operativa importante: el tokenizador de PhoBERT espera texto ya segmentado en palabras (por ejemplo, `vui_tính` en lugar de `vui tính`). El widget de Hugging Face del modelo base inserta un segmentador previo, pero el uso vía `sentence-transformers` o `transformers` exige segmentar explícitamente con herramientas como pyvi, underthesea o RDRSegment.

## Capacidades

- Generación de embeddings densos de 768 dimensiones para oraciones y párrafos en vietnamita.
- Similitud semántica entre pares de textos mediante distancia coseno.
- Búsqueda semántica y recuperación de pasajes (retrieval) sobre corpus vietnamitas.
- Clustering de documentos o consultas por proximidad en el espacio de embeddings.
- Deduplicación y filtrado de candidatos por relevancia semántica (coherente con el nombre `appfilter`).
- Extracción de características (`feature-extraction`) para pipelines posteriores de clasificación o ranking.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un encoder, no un modelo causal.
- No soporta visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al vietnamita; no se declaran otros idiomas.

## Casos de uso

- Búsqueda semántica en aplicaciones vietnamitas: indexar documentos con embeddings de 768 dimensiones y recuperar los pasajes más próximos a la consulta del usuario mediante similitud coseno, con un coste de inferencia bajo al tratarse de un encoder de ~135 M de parámetros.
- Filtrado de candidatos en un pipeline de recomendación: usar el modelo como primera etapa de *recall*, calculando la similitud entre el perfil o consulta del usuario y un catálogo de ítems, y reservando modelos más caros para el re-ranking.
- Deduplicación de registros: agrupar entradas de texto casi idénticas (nombres de apps, títulos, descripciones) calculando embeddings y aplicando clustering por umbral de coseno.
- Moderación y enrutado de tickets: clasificar consultas entrantes en vietnamita por similitud con prototipos de cada categoría, sin necesidad de un clasificador supervisado adicional.
- Recuperación aumentada (RAG) en vietnamita: generar embeddings de los fragmentos de una base documental y recuperar los más relevantes para alimentar un LLM generativo, siempre que el corpus esté en vietnamita y los fragmentos no superen los 256 tokens.
- Evaluación de similitud entre pares de frases: métricas de calidad de traducciones o de resúmenes comparando el embedding de la referencia con el de la hipótesis.
- Búsqueda en dominios legales o administrativos: el modelo base se entrenó con parte del corpus del reto Zalo 2021 de recuperación de textos legales, lo que lo hace razonable para consultas sobre normativa vietnamita.

## Benchmarks y rendimiento

Los únicos resultados publicados corresponden al modelo base `bkai-foundation-models/vietnamese-bi-encoder` sobre el 20 % reservado del conjunto de entrenamiento del reto Legal Text Retrieval Zalo 2021. No se han publicado resultados específicos de `vibi-appfilter-ft1` en la información disponible.

| Modelo | Datos de entrenamiento | Acc@1 | Acc@10 | Acc@100 | Pre@10 | MRR@10 |
|---|---|---|---|---|---|---|
| Vietnamese-SBERT | - | 32,34 | 52,97 | 89,84 | 7,05 | 45,30 |
| PhoBERT-base-v2 | MS MARCO | 47,81 | 77,19 | 92,34 | 7,72 | 58,37 |
| PhoBERT-base-v2 | MS MARCO + SQuAD v2 + 80 % Zalo | 73,28 | 93,59 | 98,85 | 9,36 | 80,73 |

Estos valores describen el modelo base, no necesariamente el ajuste fino `appfilter`, cuyo rendimiento no está documentado.

## Requisitos de hardware

- VRAM para inferencia en fp32: aproximadamente 0,55 GB solo para pesos, más activaciones; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- VRAM en fp16: alrededor de 0,27 GB de pesos; en int8, unos 0,14 GB.
- Cabe en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU con suficiente memoria compartida.
- Funciona en CPU con throughput aceptable para lotes moderados, dado el tamaño de 135 M de parámetros.
- Despliegue: `sentence-transformers` (recomendado), `transformers` con pooling manual, y servidores de embeddings como Hugging Face TEI (Text Embeddings Inference) o vLLM en modo embedding.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware, del tamaño de lote y de la longitud de los textos (máximo 256 tokens).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| `fisherman611/vibi-appfilter-ft1` | 134.998.272 | 256 tokens | vi | Apache 2.0 | Ajuste fino del bi-encoder vietnamita; sin benchmarks propios publicados |
| `bkai-foundation-models/vietnamese-bi-encoder` | ~135 M (PhoBERT-base-v2) | 256 tokens | vi | Apache 2.0 | Modelo base; MRR@10 de 80,73 en el split Zalo 2021 |
| `keepitreal/vietnamese-sbert` | ~135 M | no disponible | vi | no disponible en la información | MRR@10 de 45,30 en el mismo split; peor rendimiento reportado |
| `VoVanPhuc/sup-SimCSE-VietNamese-phobert-base` | ~135 M | no disponible | vi | no disponible en la información | Alternativa SimCSE sobre PhoBERT; sin datos comparativos aquí |

## Limitaciones y advertencias

- Solo vietnamita: no se declaran capacidades en otros idiomas, incluido el castellano.
- Longitud máxima de 256 tokens: los documentos largos deben trocearse antes de generar embeddings, lo que puede fragmentar el contexto semántico.
- Requiere segmentación de palabras previa si se usa fuera del widget de Hugging Face; sin ella, la calidad de los embeddings se degrada de forma notable con el tokenizador de PhoBERT.
- No hay benchmarks publicados del ajuste fino `appfilter`; el rendimiento real en la tarea de filtrado que sugiere su nombre no está validado.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin evidencia de uso en producción ni de revisión por la comunidad.
- Riesgo de sesgos heredados del corpus de preentrenamiento de PhoBERT y de los datasets traducidos automáticamente (MS MARCO y SQuAD v2), que pueden introducir artefactos de traducción.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene auditar el modelo antes de integrarlo en producción.
- No es un modelo generativo: no debe usarse para responder preguntas ni para tareas de razonamiento; su salida son vectores, no texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fisherman611/vibi-appfilter-ft1
- Modelo base: https://huggingface.co/bkai-foundation-models/vietnamese-bi-encoder
- PhoBERT (VinAI Research): https://github.com/VinAIResearch/PhoBERT
- Sentence-Transformers: https://www.SBERT.net
- Referencia bibliográfica citada en la model card: arXiv:2403.01616 (https://arxiv.org/abs/2403.01616)
- Alternativa comparada: https://huggingface.co/keepitreal/vietnamese-sbert
