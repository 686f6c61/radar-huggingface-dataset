# Jgmorenof/plots-distilbert-base-multilingual-cased

## Resumen

El modelo `plots-distilbert-base-multilingual-cased` es un encoder de frases multilingüe desarrollado por Jose G. Moreno (usuario Jgmorenof) y derivado del checkpoint `distilbert-base-multilingual-cased` de Hugging Face. Se ha ajustado mediante aprendizaje contrastivo sobre PLOTS, un corpus de pares de resúmenes de argumento de películas escritos de forma independiente en Wikipedia (un resumen en inglés emparejado con su equivalente en otro idioma). El objetivo no es la similitud léxica, sino la similitud narrativa: reconocer que dos textos describen la misma historia aunque compartan pocos nombres o palabras.

El modelo es un transformer encoder de tipo DistilBERT con 134.734.080 parámetros, una ventana de entrada máxima de 512 tokens y pesos en formato safetensors. Su propósito declarado es la recuperación cross-lingüe de tramas y la resolución del fenómeno «tip-of-the-tongue» (ToT), es decir, localizar una película a partir de una descripción vaga de su argumento formulada en cualquier idioma.

Es relevante ahora porque acompaña a PLOTS, un recurso publicado para SemEval-2026 Task 4, y porque demuestra que un encoder pequeño (0,5 GB de repositorio) puede superar ampliamente a su base zero-shot en tareas de similitud narrativa, lo que lo hace viable en entornos con recursos limitados. Su licencia Apache 2.0 y su compatibilidad con `text-embeddings-inference` facilitan el despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas destiladas de BERT) |
| Parametros totales | 134.734.080 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens de entrada máxima |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | multilingüe (heredado de `distilbert-base-multilingual-cased`, 104 idiomas en el vocabulario del modelo base) |
| Licencia | Apache 2.0 (los pesos); datos de entrenamiento PLOTS bajo CC BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de DistilBERT multilingüe, un encoder transformer de 6 capas, 768 dimensiones ocultas y 12 cabezas de atención, destilado de BERT multilingüe con vocabulario cased de aproximadamente 119.000 tokens. Sobre esta base se ha aplicado un ajuste fino con pérdida contrastiva simétrica en batch (InfoNCE en ambas direcciones) y gradient caching, con batch de 128, una época, learning rate 5e-05, longitud máxima de 512 tokens y semilla 13.

El conjunto de entrenamiento son 197.694 pares de PLOTS: resúmenes de argumento de la misma película escritos de forma independiente en Wikipedia, con el texto en inglés emparejado con su versión en otro idioma. Se excluyeron explícitamente las películas de SemEval-2026 Task 4 y de las consultas de train y dev de TREC ToT 2023 para evitar filtraciones en la evaluación. No se documenta en la información disponible el uso de RLHF, DPO ni datos adicionales de retrieval; de hecho, el autor advierte que el checkpoint base carece de preentrenamiento en recuperación y que por ello se beneficia mucho menos de PLOTS que los encoders con preentrenamiento de retrieval.

## Capacidades

- Generación de embeddings de frases para similitud semántica y narrativa (pipeline `sentence-similarity`).
- Recuperación cross-lingüe: empareja una descripción de trama en cualquier idioma con resúmenes de argumento en inglés.
- Similitud narrativa: identifica la misma historia aunque cambien nombres propios, lugares o formulaciones.
- Resolución de «tip-of-the-tongue»: localizar una película a partir de una descripción parcial o imprecisa.
- Codificación de consultas y documentos con soporte de parámetro `prompt` en `SentenceTransformer.encode`.
- Compatible con `text-embeddings-inference` y con endpoints de Hugging Face (`endpoints_compatible`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio: es un encoder de embeddings, no un modelo generativo.

## Casos de uso

- Búsqueda de películas por descripción vaga: el usuario escribe «una película donde un hombre vuelve al pueblo y descubre un secreto familiar» en castellano y el modelo recupera los resúmenes de argumento en inglés más próximos en el espacio de embeddings, gracias a su entrenamiento cross-lingüe sobre PLOTS.
- Deduplicación y enlazado de fichas de películas entre Wikipedias: se codifican los resúmenes de argumento de distintas ediciones lingüísticas y se detectan pares que describen la misma obra mediante similitud coseno, reduciendo el trabajo manual de enlazado interlingüístico.
- Construcción de un índice de recuperación narrativa: con 134 millones de parámetros y embeddings de 768 dimensiones, el índice cabe en memoria en un servidor modesto y permite servir búsquedas con latencia baja mediante `text-embeddings-inference`.
- Recomendación por similitud argumental: agrupar películas cuyas tramas comparten estructura narrativa (no solo género o reparto) para sistemas de recomendación o estudios de guion.
- Investigación en procesamiento de lenguaje natural: evaluación de técnicas de similitud narrativa y de recuperación cross-lingüe sobre SemEval-2026 Task 4 y TREC ToT 2023, usando el modelo como baseline reproducible.
- Análisis de adaptaciones y remakes: comparar el resumen de una adaptación con el de la obra original en otro idioma para medir la proximidad de las tramas.
- Filtrado previo en pipelines de catalogación: descartar candidatos irrelevantes antes de aplicar modelos generativos más costosos, aprovechando el bajo coste computacional del encoder.

## Benchmarks y rendimiento

Resultados publicados en la model card. NS: accuracy en los 355 triples de test track-B de SemEval-2026 Task 4 libres de filtración. PLOTS-IR: nDCG@10 sobre las consultas de test (M: entidades enmascaradas; First/Last: primera y última frase del resumen). ToT: consultas de dev de TREC ToT 2023.

| Metrica | Este modelo | DistilBERT multilingüe zero-shot |
|---|---|---|
| NS accuracy | 0,575 | 0,572 |
| PLOTS-IR Full | 0,955 | 0,182 |
| PLOTS-IR Full M | 0,549 | 0,091 |
| PLOTS-IR First | 0,717 | 0,034 |
| PLOTS-IR Last | 0,281 | 0,016 |
| PLOTS-IR Last M | 0,024 | 0,008 |
| ToT nDCG@10 | 0,036 | 0,000 |
| ToT R@100 | 0,147 | 0,013 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 (134,7 M de parámetros), alrededor de 0,27 GB en fp16 y en torno a 0,14 GB en int8.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; funciona en A100, H100, RTX 4090, RTX 3090, RTX 3060 e incluso en GPUs de gama de entrada.
- Cabe holgadamente en GPU de consumo y también puede ejecutarse en CPU para volúmenes moderados de codificación.
- Opciones de despliegue: `sentence-transformers`, `text-embeddings-inference` (etiqueta `text-embeddings-inference` en el repo), endpoints de Hugging Face y exportación a ONNX no documentada en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en GPU, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| plots-distilbert-base-multilingual-cased | 134,7 M | 512 tokens | Similitud narrativa cross-lingüe (PLOTS) | Apache 2.0 | Hugging Face |
| distilbert-base-multilingual-cased (base) | 134,7 M | 512 tokens | Encoder multilingüe general, sin retrieval | Apache 2.0 | Hugging Face |
| paraphrase-multilingual-MiniLM-L12-v2 | ~118 M | 128 tokens | Similitud semántica multilingüe general | Apache 2.0 | Hugging Face |
| multilingual-e5-base | ~278 M | 512 tokens | Retrieval multilingüe con preentrenamiento | MIT | Hugging Face |

La comparación directa con los modelos de similitud general no está disponible en la información proporcionada: solo se publican métricas frente al DistilBERT multilingüe zero-shot, donde el ajuste multiplica por más de cinco el nDCG@10 en PLOTS-IR (0,955 frente a 0,182) y mejora ToT R@100 de 0,013 a 0,147.

## Limitaciones y advertencias

- El propio autor advierte que el checkpoint base no tiene preentrenamiento de retrieval y que, por ello, se beneficia mucho menos de PLOTS que los encoders con preentrenamiento de recuperación; el modelo es una referencia, no un sistema de producción de alto rendimiento en ToT.
- El rendimiento en ToT es bajo en términos absolutos (nDCG@10 de 0,036 y R@100 de 0,147), por lo que no es adecuado como único componente de un buscador real.
- El rendimiento cae drásticamente cuando se enmascaran entidades (PLOTS-IR Full M: 0,549 frente a 0,955 sin enmascarar) y cuando se usan solo las últimas frases del resumen (Last M: 0,024), lo que indica dependencia de nombres propios y de la parte inicial del texto.
- Ventana de entrada limitada a 512 tokens: resúmenes de argumento largos deben truncarse o dividirse, con pérdida de información.
- Riesgo de sesgo heredado del corpus de Wikipedia: sobrerrepresentación de películas con artículo en múltiples idiomas y de ciertas industrias cinematográficas.
- No es un modelo generativo: no produce texto, no razona y no soporta tool calling; su uso se limita a embeddings.
- Uso comercial permitido por Apache 2.0 en los pesos, pero los datos PLOTS están bajo CC BY-SA 4.0, lo que impone obligaciones de atribución y compartir igual si se redistribuyen derivados del corpus.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jgmorenof/plots-distilbert-base-multilingual-cased
- Dataset PLOTS: https://huggingface.co/datasets/Jgmorenof/PLOTS
- Modelo base: https://huggingface.co/distilbert/distilbert-base-multilingual-cased
- Cita del recurso: Moreno, Hamdi, Boros, Jatowt, Bordea, González-Gallardo y Doucet (2026), «PLOTS -- Same Story, Different Words: Paired Plot Outlines for Narrative Similarity and Retrieval».
