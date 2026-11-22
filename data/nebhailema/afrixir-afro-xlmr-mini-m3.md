# nebhailema/afrixir-afro-xlmr-mini-m3

## Resumen

AfriXIR M3 es un modelo de recuperación de información (retriever) multilingüe especializado en ocho lenguas africanas: amárico, hausa, oromo, shona, somalí, suajili, tigriña y yoruba. Lo desarrolla el usuario nebhailema y se construye mediante fine-tuning de Davlan/afro-xlmr-mini, un encoder XLM-RoBERTa compacto de 117,6 millones de parámetros y 12 capas con tamaño oculto de 384. El modelo sigue la arquitectura BGE-M3, de modo que un único encoder produce simultáneamente embeddings densos, pesos léxicos dispersos y vectores por token ColBERT.

Su relevancia radica en que aborda un vacío concreto: la recuperación de pasajes en lenguas africanas de bajos recursos, donde los retrievers multilingües genéricos rinden de forma desigual. Al ofrecer tres modos de representación en un mismo modelo, permite combinar búsqueda densa, léxica y multi-vector sin desplegar tres sistemas distintos. La ventana de contexto es de 512 tokens y la salida densa y ColBERT es de 384 dimensiones, mientras que la cabeza dispersa emite pesos sobre un vocabulario de 250.002 tokens.

El modelo se distribuye con licencia Apache 2.0 y pesos en safetensors, con un repositorio de aproximadamente 0,5 GB. Está pensado para pipelines de búsqueda y generación aumentada por recuperación (RAG) en contextos lingüísticos africanos, y su tamaño reducido facilita el despliegue en infraestructura modesta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (encoder transformer), cabecera BGE-M3 con salidas densa, dispersa y ColBERT |
| Parámetros totales | 117.640.704 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | am, ha, om, sn, so, sw, ti, yo |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimensión de embedding denso | 384 |
| Dimensión de vectores ColBERT | 384 |
| Vocabulario de la cabeza dispersa | 250.002 tokens |
| Función de similitud | coseno (densa y ColBERT), producto escalar (dispersa) |
| Modalidad | texto |

## Arquitectura y entrenamiento

El modelo parte de Davlan/afro-xlmr-mini, un encoder XLM-RoBERTa con 12 capas y tamaño oculto de 384, y le añade la estructura de cabeceras de BGE-M3. La cabeza densa toma el token CLS, lo normaliza en L2 y se compara por similitud coseno. La cabeza dispersa es una proyección lineal de 384 a 1 que asigna un peso léxico a cada token del vocabulario, comparado por producto escalar. La cabeza ColBERT es una proyección lineal de 384 a 384 que genera un vector por token, comparado mediante MaxSim. Las tres representaciones se obtienen de una sola pasada del encoder.

El fine-tuning se realizó sobre el dataset AfriXIR, compuesto por consultas y pasajes en las ocho lenguas cubiertas. La model card no detalla el volumen de tokens de entrenamiento, la composición exacta del corpus ni si se aplicaron etapas de RLHF o DPO; esa información no está disponible. La innovación principal es la unificación de recuperación densa, léxica y multi-vector en un encoder de pequeña escala adaptado a lenguas africanas, lo que permite elegir o combinar modos de recuperación según el tipo de consulta.

## Capacidades

- Generación de embeddings de frases y pasajes para similitud semántica y extracción de características.
- Recuperación densa mediante embedding CLS normalizado de 384 dimensiones con similitud coseno.
- Recuperación léxica dispersa mediante pesos por token sobre un vocabulario de 250.002 entradas.
- Recuperación multi-vector tipo ColBERT con vectores por token y comparación MaxSim.
- Indexación y búsqueda de pasajes en ocho lenguas africanas dentro de un mismo espacio de representación.
- Soporte de consultas y corpus multilingües con el mismo encoder.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de representación, no generativo.
- No dispone de modo de pensamiento, visión ni audio.

## Casos de uso

- Búsqueda documental en suajili y hausa: indexar un corpus de noticias o documentos administrativos con los embeddings densos y recuperar pasajes relevantes ante consultas de usuario, aprovechando la ventana de 512 tokens por pasaje.
- RAG sobre corpus en amárico y tigriña: usar el modelo como recuperador previo a un LLM generativo, de modo que el generador reciba pasajes pertinentes en la lengua del usuario en lugar de contexto irrelevante.
- Recuperación híbrida en somalí y oromo: combinar la salida dispersa (pesos léxicos) con la densa para consultas que mezclan términos específicos y paráfrasis, ya que la cabeza dispersa obtiene un recall@5 medio de 0,7598 frente al 0,6501 de la densa.
- Reordenación con ColBERT: emplear los vectores por token para reordenar los primeros candidatos de un retriever denso, un patrón habitual en pipelines de dos etapas con presupuesto de latencia ajustado.
- Búsqueda en centros de documentación multilingües: desplegar un único índice que cubra las ocho lenguas y permita consultas cruzadas entre ellas sin mantener un modelo por idioma.
- Filtrado y deduplicación de datasets: calcular similitud entre pares de frases para eliminar duplicados o seleccionar ejemplos diversos en la construcción de corpus de entrenamiento en lenguas africanas.
- Sistemas de preguntas frecuentes en yoruba y shona: emparejar preguntas de usuarios con respuestas predefinidas mediante similitud coseno sobre embeddings de 384 dimensiones, con un coste de inferencia bajo.

## Benchmarks y rendimiento

La model card publica resultados de recuperación de pasajes sobre el corpus completo de AfriXIR, con la media ponderada por consultas (`avg`) entre las ocho lenguas. Se incluyen las filas del propio modelo en sus tres modos, junto con los mejores competidores de la tabla.

| Modelo | Modo | recall@5 (avg) | recall@10 (avg) |
|---|---|---|---|
| AfriXIR M3 | denso | 0,6501 | no disponible en la información proporcionada |
| AfriXIR M3 | disperso | 0,7598 | no disponible en la información proporcionada |
| AfriXIR M3 | multi-vector | 0,8246 | no disponible en la información proporcionada |
| afrixir-e5-large | denso | 0,8738 | no disponible en la información proporcionada |
| afrixir-e5-base | denso | 0,8629 | 0,9042 |
| afrixir-multivector-e5-base | multi-vector | 0,8789 | no disponible en la información proporcionada |
| afrixir-e5-base-reranker | reranker | 0,8853 | no disponible en la información proporcionada |

Por lengua, el modo multi-vector de AfriXIR M3 alcanza 0,8649 en shona (el mejor valor de esa columna en recall@5), 0,9184 en tigriña y 0,8485 en amárico. El modo disperso llega a 0,8367 en tigriña y 0,7826 en amárico. El modo denso es el más flojo de los tres y queda por debajo de los retrievers densos basados en e5 en todas las lenguas. La tabla de recall@10 de la model card está truncada en la información disponible, por lo que no se pueden extraer valores completos para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB para los pesos, más memoria para activaciones; en la práctica cabe en cualquier GPU con 2 GB o más.
- En fp16 o bf16 el modelo ocupa alrededor de 0,25 GB, por lo que es viable en GPUs de consumo muy modestas.
- GPU recomendadas: cualquier GPU consumer reciente (RTX 3060, RTX 4060, RTX 4090) es suficiente; para indexación a gran escala se recomienda A100 o H100 por throughput agregado, no por requisito de memoria.
- Cabe en CPU para volúmenes moderados de indexación y consulta, aunque con mayor latencia.
- Opciones de despliegue: FlagEmbedding, que es la vía documentada por el autor mediante `M3Embedder`; al ser un encoder XLM-RoBERTa estándar con cabeceras, también puede servirse con frameworks de inferencia de sentence-transformers o con servidores de embeddings compatibles.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | recall@5 (avg) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AfriXIR M3 (multi-vector) | 117,6 M | 512 | 0,8246 | Apache 2.0 | Hugging Face |
| afrixir-multivector-e5-base | no disponible | no disponible | 0,8789 | no disponible | Hugging Face |
| afrixir-e5-base (denso) | no disponible | no disponible | 0,8629 | no disponible | Hugging Face |
| afrixir-e5-base-reranker | no disponible | no disponible | 0,8853 | no disponible | Hugging Face |

La comparación se limita a los modelos evaluados en la misma tabla de AfriXIR. AfriXIR M3 destaca por ofrecer tres modos de recuperación en un solo encoder de 117,6 M de parámetros con licencia Apache 2.0, mientras que los sistemas basados en e5 obtienen mejores cifras de recall en modo denso y multi-vector. No se dispone de datos de parámetros ni de contexto de los modelos e5 comparados en la información proporcionada.

## Limitaciones y advertencias

- El modo denso rinde claramente por debajo de los retrievers e5 en todas las lenguas evaluadas (0,6501 frente a 0,8629 de media en recall@5); usarlo en solitario puede degradar la calidad de recuperación.
- La ventana de 512 tokens limita el tamaño de los pasajes indexables; documentos largos deben trocearse y gestionarse con estrategias de agregación.
- La cobertura lingüística se restringe a las ocho lenguas declaradas; el comportamiento en otras lenguas africanas o en variantes dialectales no está documentado.
- No se han publicado datos sobre sesgos, tasas de alucinación ni evaluación cualitativa de los embeddings; al ser un modelo de representación, el riesgo de alucinación se traslada al generador que consuma los pasajes recuperados.
- El modelo tiene un volumen de descargas muy bajo (2 en el momento de la consulta) y no consta validación externa independiente, lo que aconseja evaluarlo en el dominio objetivo antes de producción.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Davlan/afro-xlmr-mini y del dataset AfriXIR antes de redistribuir derivados.
- La información sobre cuantización disponible es inexistente; no se documentan versiones GGUF ni ONNX.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nebhailema/afrixir-afro-xlmr-mini-m3
- Modelo base: https://huggingface.co/Davlan/afro-xlmr-mini
- Dataset de entrenamiento: https://huggingface.co/datasets/nebhailema/AfriXIR
- Paper de BGE M3-Embedding: https://arxiv.org/abs/2402.03216
- Documentación de FlagEmbedding: https://github.com/FlagOpen/FlagEmbedding
- Retriever denso relacionado: https://huggingface.co/nebhailema/afrixir-afro-xlmr-mini
- Reranker relacionado: https://huggingface.co/nebhailema/afrixir-afro-xlmr-mini-reranker
- Modelo multi-vector relacionado: https://huggingface.co/nebhailema/afrixir-multivector-mini
