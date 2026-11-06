# Jgmorenof/plots-labse

## Resumen

plots-labse es un modelo de embeddings de frases obtenido por ajuste fino (fine-tuning) de sentence-transformers/LaBSE sobre el conjunto de datos PLOTS, formado por pares de resúmenes argumentales de Wikipedia escritos de forma independiente sobre la misma película, uno en inglés y otro en otro idioma. El objetivo no es emparejar palabras ni nombres propios, sino reconocer que dos textos describen la misma historia. Lo desarrolla Jose G. Moreno (Jgmorenof) en el marco del trabajo PLOTS, con la colaboración de Hamdi, Boros, Jatowt, Bordea, González-Gallardo y Doucet.

El modelo resuelve el problema de la similitud narrativa y la recuperación cross-lingüe de tramas, incluyendo el escenario denominado tip-of-the-tongue (ToT), en el que el usuario recuerda vagamente una historia y quiere localizarla. Sobre la base LaBSE (BERT multilingüe con ~471 millones de parámetros), el ajuste mejora de forma notable la recuperación de tramas en inglés a partir de descripciones en cualquier idioma, y lo hace con una ventana de entrada de 512 tokens.

Es relevante ahora porque acompaña al conjunto de datos PLOTS y a la tarea SemEval-2026 Task 4, y porque demuestra que un ajuste contrastivo ligero (una época, 197.694 pares) sobre un encoder multilingüe genérico produce ganancias grandes en una tarea semántica especializada, manteniendo licencia Apache 2.0 y un formato directamente desplegable con sentence-transformers y text-embeddings-inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (encoder dual de frases), base sentence-transformers/LaBSE |
| Parametros totales | 470.926.848 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (longitud máxima de entrada usada en el entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | multilingüe (heredados de LaBSE, que cubre 109 idiomas; el autor solo declara "multilingual") |
| Licencia | Apache 2.0 (los pesos conservan la licencia del modelo base); datos PLOTS bajo CC BY-SA 4.0 |
| Formato de pesos | safetensors (repo de 1,9 GB) |

## Arquitectura y entrenamiento

La arquitectura es la de LaBSE: un encoder transformer bidireccional de tipo BERT con 470,9 millones de parámetros, entrenado originalmente con objetivos de traducción y similitud de frases para producir embeddings alineados entre idiomas. Sobre esa base, plots-labse se ajusta con una pérdida contrastiva simétrica in-batch (InfoNCE en ambas direcciones) con caché de gradientes, lote de 128, una época, tasa de aprendizaje 2e-05, longitud máxima de entrada de 512 tokens y semilla 13.

El conjunto de entrenamiento son 197.694 pares de PLOTS: resúmenes argumentales de la misma película escritos de forma independiente en Wikipedia, emparejados entre inglés y otro idioma. Para evitar fugas de evaluación, se excluyen del entrenamiento las películas de SemEval-2026 Task 4 y de TREC ToT 2023 (objetivos de train y dev). No se documenta en la información disponible el uso de RLHF, DPO ni otras fases de alineación; el ajuste es puramente contrastivo sobre pares positivos.

## Capacidades

- Generación de embeddings de frases y párrafos para similitud semántica y recuperación densa.
- Similitud narrativa: empareja textos que cuentan la misma historia aunque difieran en vocabulario, nombres propios o estructura.
- Recuperación cross-lingüe: consulta en cualquier idioma contra documentos en inglés.
- Escenario tip-of-the-tongue: localizar una película a partir de una descripción vaga o parcial de su trama.
- Multilingüismo heredado de LaBSE (el autor declara "multilingual"; LaBSE cubre 109 idiomas).
- Compatibilidad con text-embeddings-inference y con endpoints de Hugging Face (tag endpoints_compatible).
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.

## Casos de uso

- Recuperación cross-lingüe de tramas en catálogos audiovisuales: un usuario describe en español una película que vio y el sistema recupera la ficha o el resumen en inglés mediante similitud de embeddings, aprovechando la alineación multilingüe de LaBSE.
- Búsqueda tip-of-the-tongue en plataformas de streaming: el usuario aporta fragmentos imprecisos de la trama y el modelo los compara con resúmenes indexados; los resultados de TREC ToT 2023 (nDCG@10 de 0,080 frente a 0,018 en zero-shot) indican una mejora sustancial en este escenario.
- Deduplicación y enlazado de fichas de películas entre Wikipedias de distintos idiomas: emparejar artículos que describen la misma obra aunque los títulos y el reparto estén transliterados o ausentes.
- Construcción de índices vectoriales para motores de recomendación basados en contenido narrativo: generar embeddings de sinopsis y calcular vecinos más cercanos para recomendar películas con tramas afines.
- Detección de adaptaciones y remakes: identificar pares de obras cuya sinopsis coincide argumentalmente, útil en estudios cinematográficos y gestión de derechos.
- Evaluación de sistemas de recuperación narrativa: servir como referencia ajustada en experimentos de SemEval-2026 Task 4 y como línea base frente a LaBSE zero-shot.
- Análisis literario comparado: agrupar resúmenes de obras con estructuras narrativas similares a través de idiomas para estudios de motivos y arquetipos.

## Benchmarks y rendimiento

Datos publicados por el autor. NS: precisión en los 355 triples leak-free del track B de SemEval-2026 Task 4. PLOTS-IR: nDCG@10 sobre las consultas de test (M: entidades enmascaradas). ToT: consultas de dev de TREC ToT 2023.

| Metrica | plots-labse | LaBSE zero-shot |
|---|---|---|
| NS accuracy | 0,642 | 0,634 |
| PLOTS-IR Full | 0,981 | 0,859 |
| PLOTS-IR Full M | 0,794 | 0,549 |
| PLOTS-IR First | 0,751 | 0,183 |
| PLOTS-IR Last | 0,304 | 0,093 |
| PLOTS-IR Last M | 0,054 | 0,023 |
| ToT nDCG@10 | 0,080 | 0,018 |
| ToT R@100 | 0,333 | 0,080 |

El propio autor advierte que LaBSE se usó para filtrar los pares de PLOTS, por lo que está favorecido en PLOTS-IR; la comparación más informativa es la de ToT y NS, donde la mejora es menor pero consistente.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,9 GB de pesos más activaciones; en la práctica cabe en GPUs consumer con 4-6 GB.
- En fp16: en torno a 1 GB de pesos; ejecutable en GPUs de 2-4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB para fp32 (RTX 3050, RTX 4060, T4); para indexación a gran escala, A100 o H100 por throughput agregado.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas modernas con 4 GB o más.
- Opciones de despliegue: sentence-transformers (librería nativa), text-embeddings-inference, endpoints de Hugging Face; no se documentan variantes GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| plots-labse | 470,9 M | 512 | Similitud narrativa cross-lingüe (fine-tune de LaBSE sobre PLOTS) | Apache 2.0 | Hugging Face |
| sentence-transformers/LaBSE | ~471 M | 512 | Embeddings multilingües genéricos | Apache 2.0 | Hugging Face |
| paraphrase-multilingual-MiniLM-L12-v2 | ~118 M | 128 | Embeddings multilingües ligeros | Apache 2.0 | Hugging Face |
| multilingual-e5-large | ~560 M | 512 | Embeddings multilingües con instrucciones | MIT | Hugging Face |

Frente a LaBSE, plots-labse mejora sobre todo en recuperación de tramas (ToT R@100 de 0,333 frente a 0,080) a costa de un ajuste muy específico que puede degradar el rendimiento en tareas de similitud genérica no evaluadas aquí. Las alternativas MiniLM y E5 no han sido evaluadas por el autor en PLOTS ni ToT, por lo que no hay comparación numérica disponible.

## Limitaciones y advertencias

- LaBSE se empleó para filtrar los pares de PLOTS, lo que favorece artificialmente sus resultados en PLOTS-IR; no debe interpretarse como ventaja general.
- El ajuste es de una sola época sobre pares positivos: puede sobreajustar al dominio de tramas cinematográficas y degradar la similitud semántica general.
- Ventana de 512 tokens: los resúmenes largos deben truncarse o dividirse, con pérdida de información.
- En el escenario de emparejamiento por el último tramo del texto (Last M), el rendimiento cae a 0,054 de nDCG@10, muy bajo en términos absolutos.
- Riesgo de falsos positivos entre películas con tramas arquetípicas similares (por ejemplo, remakes o géneros formulaicos).
- No es un modelo generativo: no debe usarse para responder preguntas ni para razonamiento; solo produce embeddings.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026: no hay evidencia de uso en producción ni validación externa.
- La licencia Apache 2.0 permite uso comercial de los pesos, pero los datos PLOTS están bajo CC BY-SA 4.0, lo que impone obligaciones de atribución y compartición si se redistribuyen derivados del conjunto de datos.
- No se documentan sesgos específicos; al heredar LaBSE, arrastra los sesgos de su corpus de entrenamiento original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jgmorenof/plots-labse
- Modelo base: https://huggingface.co/sentence-transformers/LaBSE
- Conjunto de datos PLOTS: https://huggingface.co/datasets/Jgmorenof/PLOTS
