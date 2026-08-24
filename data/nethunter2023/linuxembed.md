# nethunter2023/linuxembed

## Resumen

linuxembed es un modelo de embeddings de código C específico para el kernel de Linux, desarrollado por nethunter2023. Se trata de un encoder BERT de 42,6 millones de parámetros entrenado desde cero —sin ningún peso preentrenado— exclusivamente sobre el código fuente del kernel Linux v7.1-rc5. El modelo resuelve el problema de recuperación de funciones del kernel a partir de consultas en lenguaje natural: dada una pregunta en inglés, devuelve la función de código C que la responde.

Su relevancia radica en que demuestra que es posible entrenar un modelo de recuperación de código altamente especializado con recursos modestos (una GPU RTX 3070 de 8 GB) y un corpus acotado, sin depender de modelos base genéricos. La arquitectura es un BERT de 8 capas con 512 dimensiones ocultas, tokenizador byte-level BPE entrenado sobre C del kernel, y una longitud de contexto máxima de 320 tokens. El modelo está disponible bajo licencia GPL-2.0 y se distribuye en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer, 8 capas, 8 cabezas, hidden 512, intermediate 2048) |
| Parametros totales | 42.522.624 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 320 tokens (maximo recomendado; no superar) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Codigo C (kernel de Linux), consultas en ingles |
| Licencia | GPL-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder BERT de 8 capas con 512 unidades ocultas, 8 cabezas de atencion, capa intermedia de 2048 y un vocabulario de 32.768 piezas byte-level BPE entrenado especificamente sobre codigo C del kernel. El pooling es mean y la salida es un vector de 512 dimensiones normalizado L2. El entrenamiento se realizo en dos fases: primero, modelado de lenguaje enmascarado (MLM) desde inicializacion aleatoria sobre 342,6 millones de tokens procedentes de 62.595 archivos `.c` y `.h`, con una perdida final de 0,5314 y perplejidad de 1,70. Despues, una fase contrastiva con 48.777 tripletas (ancla, positivo, negativo) extraidas de los comentarios kernel-doc del kernel, usando perdida InfoNCE (MultipleNegativesRankingLoss).

Dos decisiones de diseno resultan clave: se elimina el nombre del simbolo de la ancla para evitar que el modelo aprenda a emparejar identificadores en lugar de semantica, y se excluye el bloque kernel-doc del positivo para que la consulta no aparezca literalmente en el candidato. Los negativos duros son funciones hermanas del mismo archivo, lo que fuerza al modelo a distinguir entre funciones del mismo subsistema. El pipeline probo una variante con GISTEmbed combinado, pero se descarto por rendimiento ligeramente inferior al de InfoNCE puro.

## Capacidades

- Recuperacion de codigo C del kernel de Linux a partir de consultas en lenguaje natural (bi-encoder simetrico, sin prefijos ni instrucciones).
- Generacion de embeddings de 512 dimensiones normalizados L2 para similaridad coseno.
- Soporte de busqueda hibrida combinando embeddings densos con BM25 mediante fusion RRF (resultados publicados).
- Tokenizacion byte-level BPE especifica para C, que preserva convenciones del kernel como macros y nombres en mayusculas.
- No soporta tool calling, agentes, vision, audio ni generacion de texto; es exclusivamente un modelo de embeddings para recuperacion.

## Casos de uso

- Busqueda semantica de funciones del kernel: un desarrollador puede preguntar "how are free pages coalesced into larger blocks" y obtener la funcion `__free_one_page` como primer resultado, con un recall@1 del 81,25% en modo denso y del 90,5% en modo hibrido.
- Documentacion automatica de codigo: dado un fragmento de funcion, el modelo puede emparejarlo con su descripcion kernel-doc, facilitando la generacion de documentacion para funciones no documentadas.
- Asistente de desarrollo para contribuidores del kernel: integrado en un IDE o CLI, permite localizar rapidamente funciones relacionadas con un subsistema o una operacion concreta sin conocer los nombres de los simbolos.
- Indexacion y navegacion de grandes repositorios: con 914.554 fragmentos indexados, el modelo permite explorar el kernel completo mediante consultas en lenguaje natural, superando a BM25 en todas las metricas de recall.
- Sistema RAG (generacion aumentada por recuperacion) sobre codigo del kernel: los embeddings pueden alimentar un pipeline de recuperacion para responder preguntas tecnicas sobre el funcionamiento interno de Linux, con la opcion de anadir un reranker para mejorar el recall@1.
- Auditoria y analisis de codigo legacy: al recuperar funciones por descripcion funcional, se facilita la revision de codigo antiguo o poco documentado dentro del kernel.

## Benchmarks y rendimiento

Los resultados publicados en la model card del autor son los siguientes.

Recuperacion sobre el kernel completo (914.554 fragmentos) con 400 consultas de anclas kernel-doc retenidas:

| Metrica | Denso | Hibrido (denso + BM25 RRF) |
|---|---|---|
| recall@1 | 0,8125 | 0,9050 |
| recall@5 | 0,9375 | 0,9725 |
| recall@10 | 0,9575 | 0,9775 |
| recall@50 | 0,9850 | 0,9950 |
| MRR | 0,8682 | 0,9374 |
| Rango mediano | 1 | 1 |

Evaluacion cerrada (2.000 pares retenidos, 4.000 candidatos, negativos duros de funciones hermanas del mismo archivo):

| Metrica | BM25 | MLM solo | linuxembed |
|---|---|---|---|
| accuracy@1 | 0,7115 | 0,2535 | 0,9225 |
| NDCG@10 | 0,8297 | 0,3856 | 0,9659 |

No se han publicado resultados comparativos con otros modelos de embeddings de codigo (por ejemplo, CodeBERT o CodeT5) en la informacion disponible.

## Requisitos de hardware

- Tamano en disco: 162 MB (0,2 GB en el repositorio).
- Inferencia: al ser un modelo de 42,6 millones de parametros, cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso se puede ejecutar en CPU con latencia baja.
- Entrenamiento: realizado en una unica GPU RTX 3070 de 8 GB, lo que indica que el ajuste fino o la inferencia en hardware similar es viable.
- Despliegue: compatible con la libreria sentence-transformers, con soporte para text-embeddings-inference (segun las etiquetas del repositorio) y con la API estandar de Hugging Face.
- Throughput estimado: no disponible en la informacion proporcionada, aunque por el tamano del modelo se espera un rendimiento alto incluso en CPU.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros modelos de embeddings de codigo (como CodeBERT, GraphCodeBERT o modelos de la familia sentence-transformers especializados en codigo). La informacion disponible solo compara internamente con BM25 y con el mismo encoder antes del entrenamiento contrastivo. Por tanto, la comparativa con alternativas externas no esta disponible.

## Limitaciones y advertencias

- Especializado exclusivamente en codigo C del kernel de Linux; no se espera que funcione correctamente con Python, Rust u otros lenguajes, ni con codigo C fuera del kernel.
- La evaluacion se realizo unicamente sobre funciones documentadas con kernel-doc. Aproximadamente el 95% de las definiciones del kernel carecen de kernel-doc, por lo que el rendimiento sobre codigo no documentado no esta verificado.
- Longitud de contexto limitada a 320 tokens; las funciones largas se truncan, lo que puede degradar la calidad de la recuperacion.
- Es un bi-encoder simetrico sin reranker. Aunque el recall@50 alcanza 0,995, el recall@1 en modo denso es de 0,8125, lo que deja margen de mejora con un cross-encoder.
- Licencia GPL-2.0: al estar entrenado sobre datos del kernel (tambien GPL), cualquier uso comercial o distribucion derivada debe cumplir con los terminos de esta licencia copyleft.
- Riesgo de alucinacion en recuperacion: como cualquier modelo de embeddings, puede devolver funciones semanticamente similares pero incorrectas para la consulta, especialmente con consultas ambiguas o fuera del dominio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nethunter2023/linuxembed
- Repositorio de codigo, pipeline de entrenamiento y evaluacion: https://github.com/702nethunter/linuxembedmodel
