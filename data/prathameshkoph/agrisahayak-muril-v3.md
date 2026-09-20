# prathameshkoph/agrisahayak-muril-v3

## Resumen

AgriSahayak MuRIL v3 es un modelo de embeddings de frases publicado por el usuario prathameshkoph en HuggingFace, construido sobre un backbone tipo BERT (la nomenclatura del repositorio apunta a MuRIL, el encoder multilingüe de Google para lenguas de la India) y empaquetado con la librería sentence-transformers. Con 237.556.224 parámetros (unos 237,6 millones), su función no es generar texto, sino proyectar preguntas y pasajes a un espacio vectorial denso donde la similitud coseno refleja cercanía semántica. El modelo se ha ajustado con la pérdida MultipleNegativesRankingLoss sobre un conjunto de 30.585 pares, orientado a un dominio muy concreto: consultas y respuestas de extensión agraria escritas en hindi (devanagari).

El problema que resuelve es el de la recuperación semántica en un dominio especializado y con una barrera idiomática notable. Los sistemas de recomendación agraria para pequeños agricultores en la India manejan preguntas coloquiales ("¿qué tratamiento aplicar a las semillas de ricino contra la alternaria?") frente a documentos técnicos densos en los que apenas coinciden términos literales. Un modelo de similitud léxica falla en ese escenario; un encoder entrenado con pares pregunta-respuesta del propio dominio, en cambio, aproxima ambas formulaciones en el espacio vectorial y permite construir pipelines de RAG o de búsqueda sobre corpus agronómicos.

Su relevancia actual es la de los modelos de embeddings de dominio específico: son baratos de ejecutar (menos de 1 GB en fp32), se despliegan en CPU, y su valor está en la calidad del ajuste fino antes que en el tamaño. No obstante, conviene señalar desde el principio que se trata de un artefacto con muy poca tracción (0 descargas, 1 like en el momento de la consulta), con licencia no declarada y con resultados de benchmark publicados por el propio autor y no verificados de forma independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT; el identificador del repositorio sugiere backbone MuRIL (no confirmado explícitamente en la model card) |
| Parámetros totales | 237.556.224 (~237,6 M) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (los backbones BERT/MuRIL suelen operar con 512 tokens) |
| Tipos de cuantización | No disponible; no se publican pesos cuantizados. Compatible con text-embeddings-inference y con conversión externa a int8/ONNX |
| Idiomas soportados | No declarados oficialmente. Los ejemplos de la model card están en hindi (devanagari) y el nombre del modelo apunta a un backbone para lenguas indias |
| Licencia | No disponible |
| Formato de pesos | safetensors (repo de 1,0 GB) |
| Pipeline declarado | sentence-similarity (también etiquetado como feature-extraction) |
| Función de pérdida de entrenamiento | MultipleNegativesRankingLoss |
| Tamaño del dataset de entrenamiento | 30.585 ejemplos (etiqueta `dataset_size:30585`) |
| Dimensión del embedding | No disponible |
| Compatibilidad de despliegue | `text-embeddings-inference`, `endpoints_compatible` (según etiquetas del repositorio) |

## Arquitectura y entrenamiento

El modelo sigue el patrón estándar de sentence-transformers: un encoder tipo BERT que produce representaciones contextualizadas por token, seguido de una capa de pooling que las colapsa en un único vector por frase. El nombre del repositorio indica que el punto de partida es MuRIL, la familia de encoders de Google preentrenada sobre texto de 17 lenguas indias más inglés, lo que encaja con los 237,6 millones de parámetros (órdenes de magnitud propios de una variante *base* de BERT con vocabulario ampliado). La model card no detalla el tipo de pooling ni la dimensión de salida, por lo que ambos extremos deben considerarse no documentados.

El ajuste fino se realizó con MultipleNegativesRankingLoss, una pérdida contrastiva que trata los demás ejemplos del lote como negativos implícitos. Es la receta habitual para recuperación densa porque no requiere minería explícita de negativos duros y escala bien con pares pregunta-respuesta. El conjunto de entrenamiento consta de 30.585 pares pertenecientes al dominio de extensión agraria, a juzgar por los ejemplos del *widget* de la model card (tratamiento de la alternaria en el ricino, árboles forrajeros en tierras erosionadas, dosificación de torta de neem, uso de hojas de *daken*). Las etiquetas del repositorio incluyen además dos referencias arXiv (1908.10084, el artículo de Sentence-BERT, y 1807.03748), lo que sitúa el trabajo en la línea metodológica de los encoders de frases. No hay información sobre número de tokens de entrenamiento, composición del corpus, uso de datos sintéticos ni fases de RLHF o DPO; tampoco se documenta ninguna innovación arquitectónica más allá del ajuste contrastivo.

## Capacidades

- Generación de embeddings de frases y párrafos para similitud semántica y recuperación densa.
- Búsqueda semántica (retrieval) en dominio agrícola y en hindi, según los ejemplos publicados en la model card.
- Extracción de características (`feature-extraction`) para usos posteriores: clasificación, clustering, deduplicación.
- Reordenación (reranking) de candidatos recuperados por un sistema de búsqueda léxica o híbrida.
- Detección de duplicados y agrupamiento temático de preguntas frecuentes.
- Operación en pipelines de RAG como codificador de consultas y de documentos.
- Capacidades multilingües: no declaradas. El backbone de origen es multilingüe para lenguas indias, pero el ajuste fino se ha realizado sobre texto en hindi, por lo que el comportamiento en otros idiomas es incierto.
- No es un modelo generativo: no produce texto, no soporta *tool calling*, ni *function calling*, ni razonamiento multi-paso, ni modo *thinking*.
- No dispone de capacidades de visión ni de audio.
- El contexto por pasada está limitado por la ventana del encoder (habitualmente 512 tokens en arquitecturas BERT/MuRIL); los documentos largos deben trocearse antes de generar embeddings.

## Casos de uso

- **RAG sobre documentación de extensión agraria en hindi**: el modelo indexa los fragmentos de los manuales agronómicos y codifica la consulta del agricultor; con 0,97 de *cosine accuracy@10* declarado en validación, el fragmento correcto entra en el top-10 en la gran mayoría de los casos, lo que permite alimentar un generador con contexto relevante.
- **Buscador semántico para portales de agricultura**: sustituir la búsqueda por palabras clave de un portal de variedades, plagas y fertilizantes por una búsqueda vectorial, de modo que una consulta coloquial recupere la ficha técnica correspondiente aunque no comparta términos literales.
- **Enrutado y clasificación de consultas entrantes**: generar el embedding de cada consulta recibida en un servicio de asistencia y asignarla a la categoría o al especialista adecuado (fitosanidad, nutrición vegetal, ganadería) mediante similitud contra prototipos por categoría.
- **Deduplicación de bases de conocimiento**: agrupar las 30.000+ preguntas de un corpus histórico de asistencia agrícola por cercanía vectorial para eliminar redundancias y consolidar una FAQ única.
- **Recomendación de contenido a partir de una consulta**: dado el vector de la pregunta, recuperar las respuestas ya validadas más cercanas y ofrecerlas directamente al usuario, sin necesidad de un modelo generativo.
- **Reranking dentro de un pipeline híbrido**: usar las puntuaciones de similitud coseno para reordenar los 50 primeros resultados devueltos por BM25, mejorando la precisión en la primera posición sin coste elevado de cómputo.
- **Asistente offline para técnicos de campo**: empaquetar el modelo con sentence-transformers sobre CPU en un portátil o dispositivo de campo, donde no hay conectividad, ya que los pesos en fp32 ocupan menos de 1 GB.
- **Análisis de temáticas en corpus de consultas**: clustering de las preguntas recibidas por una cooperativa a lo largo de una campaña para detectar qué problemas (plagas, fertilización, variedades) concentran la demanda real.

## Benchmarks y rendimiento

Los siguientes resultados proceden del `model-index` de la model card y están declarados por el autor, sin verificación independiente. El conjunto de evaluación se denomina genéricamente "validation" y no se describe su composición.

| Métrica (Information Retrieval) | Valor |
|---|---|
| Cosine accuracy@1 / precision@1 / recall@1 | 0,7480 |
| Cosine accuracy@3 / recall@3 | 0,8951 |
| Cosine accuracy@5 / recall@5 | 0,9379 |
| Cosine accuracy@10 / recall@10 | 0,9700 |
| Cosine precision@3 | 0,2984 |
| Cosine precision@5 | 0,1876 |
| Cosine precision@10 | 0,0970 |

Observaciones sobre la tabla: los valores de *accuracy@k* y *recall@k* coinciden exactamente para cada k, lo que sugiere que en este contexto ambas métricas se calculan de la misma forma (acierto si el positivo está entre los k primeros). Los valores de *precision@k* decrecen aproximadamente como *recall@k* / k, lo que apunta a una implementación con denominador fijo (número de consultas por k) y no a la precisión clásica sobre el número de elementos recuperados; conviene no interpretarlos como una medida estándar de precisión. No se han publicado otros resultados (MMLU, HumanEval, GSM8K ni equivalentes) porque no aplican a un modelo de embeddings.

## Requisitos de hardware

- **Pesos en memoria**: aproximadamente 0,95 GB en fp32 (237,6 M de parámetros), 0,48 GB en fp16/bf16 y 0,24 GB en int8.
- **VRAM en inferencia**: por debajo de 2 GB en fp16 incluyendo *activations* y un lote moderado de secuencias; el consumo lo dominan las activaciones del encoder más que los pesos, por lo que lotes grandes de secuencias de 512 tokens incrementan la memoria de forma lineal.
- **GPU recomendadas**: cualquier GPU con 4 GB o más es suficiente; una RTX 3060, RTX 4060, T4 o L4 son más que adecuadas. No requiere A100 ni H100 salvo que se busque maximizar el *throughput* en un servicio de indexación masiva.
- **GPU de consumo**: sí, cabe holgadamente en cualquier GPU de consumo de los últimos ocho años (GTX 1050 Ti, GTX 1650, RTX 2060 y superiores).
- **CPU**: la inferencia en CPU es perfectamente viable para volúmenes moderados, dado el tamaño del modelo; es la opción sensata para despliegues en campo o en entornos sin GPU.
- **Opciones de despliegue**: `sentence-transformers` (referencia), `text-embeddings-inference` (etiqueta explícita del repositorio), ONNX Runtime y FastEmbed tras conversión, Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`), y despliegue self-hosted con batching dinámico. Para llama.cpp/Ollama sería necesaria una conversión a GGUF y una cabecera de embedding, un camino poco habitual para encoders.
- **Latencia y throughput**: no publicados. Al tratarse de un encoder de 237 M de parámetros, las cifras dependen casi por completo del hardware, del lote y de la longitud de secuencia, por lo que cualquier número concreto exigiría una medición propia.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de su documentación pública y se ofrecen como referencia orientativa; no se dispone de una evaluación común que permita comparar rendimiento de forma justa con AgriSahayak MuRIL v3.

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AgriSahayak MuRIL v3 | 237,6 M | No declarados (ajuste en hindi) | No disponible (típico 512 en BERT/MuRIL) | No disponible | HuggingFace, 0 descargas |
| MuRIL base (Google) | ~236 M | 17 lenguas indias + inglés | 512 tokens | Apache 2.0 en la documentación pública | Ampliamente disponible |
| LaBSE (Google) | ~471 M | ~109 idiomas | 512 tokens | Apache 2.0 en la documentación pública | Ampliamente disponible |
| multilingual-e5-base (Microsoft) | ~278 M | ~100 idiomas | 512 tokens | MIT en la documentación pública | Ampliamente disponible |
| paraphrase-multilingual-MiniLM-L12-v2 | ~118 M | ~50 idiomas | 512 tokens | Apache 2.0 en la documentación pública | Ampliamente disponible |

La diferencia relevante no es de tamaño ni de cobertura lingüística, sino de especialización: los modelos alternativos son encoders genéricos multilingües entrenados sobre corpus masivos, mientras que AgriSahayak MuRIL v3 incorpora un ajuste fino sobre 30.585 pares del dominio agronómico en hindi. Eso debería traducirse en mejor recuperación dentro de ese dominio concreto, pero también en un comportamiento peor fuera de él. No hay datos públicos que permitan cuantificar esa diferencia frente a los modelos de la tabla.

## Limitaciones y advertencias

- **Licencia no disponible**: sin una licencia declarada, no puede asumirse permiso para uso comercial. Es un bloqueo potencial para cualquier despliegue en producción y debe resolverse contactando con el autor.
- **Benchmarks no verificados**: los resultados del `model-index` están marcados como `verified: false` y proceden del propio autor. No hay evaluación independiente ni descripción del conjunto de validación.
- **Tracción nula**: 0 descargas y 1 like en el momento de la consulta, con un repositorio creado y actualizado el mismo día (20 de septiembre de 2026). No hay evidencia de uso en producción ni de revisión por la comunidad.
- **Metadatos poco fiables**: la fecha de creación declarada es futura, y campos como idiomas o licencia están vacíos pese a que la model card contiene ejemplos en hindi. Cualquier integración debería validar el comportamiento real antes de confiar en los metadatos.
- **Riesgo de sobreajuste al dominio**: 30.585 pares es un volumen modesto para ajuste contrastivo. El modelo puede degradarse fuera del vocabulario agronómico indio y conviene evaluarlo con un conjunto propio antes de adoptarlo.
- **Sesgo lingüístico y temático**: el ajuste está sesgado hacia hindi y hacia terminología de extensión agraria de la India. No hay datos sobre su comportamiento en otras lenguas indias ni en castellano.
- **Alucinación**: al no ser un modelo generativo, no alucina texto; el riesgo equivalente es recuperar pasajes semánticamente plausibles pero incorrectos desde el punto de vista agronómico. En un dominio donde una recomendación errónea sobre dosis de fitosanitarios tiene consecuencias reales, la recuperación debe ir acompañada de validación humana.
- **Límite de contexto**: los documentos largos deben trocearse. Un troceado inadecuado degrada la calidad de los embeddings y, con ello, la recuperación.
- **Interpretación de las métricas**: los valores de *precision@k* publicados no se corresponden con la definición clásica de precisión, según se deduce de su relación con *recall@k*. No deben citarse como precisión sin matices.
- **Ausencia de documentación técnica**: no hay información sobre pooling, dimensión de salida, composición del dataset ni procedimiento de evaluación, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/prathameshkoph/agrisahayak-muril-v3
- Sentence-BERT (arXiv:1908.10084), referencia metodológica etiquetada en el repositorio: https://arxiv.org/abs/1908.10084
- Referencia arXiv:1807.03748, incluida en las etiquetas del repositorio: https://arxiv.org/abs/1807.03748
- Documentación de sentence-transformers: https://sbert.net/
- Documentación de text-embeddings-inference: https://github.com/huggingface/text-embeddings-inference
- MuRIL (backbone de origen según el nombre del modelo), repositorio de Google Research: https://github.com/google-research/muril
- Búsqueda web: no se han encontrado enlaces relevantes al modelo. Los resultados devueltos corresponden a páginas de inicio de sesión y tienda de un supermercado alemán, sin relación alguna con AgriSahayak MuRIL v3.
