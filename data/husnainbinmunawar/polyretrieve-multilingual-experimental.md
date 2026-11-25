# husnainbinmunawar/polyretrieve-multilingual-experimental

## Resumen

PolyRetrieve Multilingual Experimental es un modelo de recuperación de información (retriever) desarrollado por el usuario de Hugging Face husnainbinmunawar. Se trata de un checkpoint compacto de proyección dual con 147.840 parámetros totales, diseñado para tareas de búsqueda semántica multilingüe. El modelo se presenta como un punto dentro de un barrido de Pareto de dimensiones 32/64/96, siendo este checkpoint concreto el de 64 dimensiones.

La propuesta técnica del autor se centra en el entrenamiento con negativos duros explícitos basados en n-gramas de caracteres, una estrategia que busca mejorar la discriminación entre documentos léxicamente similares. El modelo se distribuye en formato safetensors con el tag `projection_retriever`, lo que indica que la arquitectura es una proyección aprendida sobre representaciones preexistentes en lugar de un transformer completo entrenado desde cero.

La relevancia de este modelo es fundamentalmente experimental: el propio autor advierte que la proyección aprendida es un resultado de investigación honesto y que puede rendir peor que la recuperación léxica en el split acotado evaluado. Con cero descargas y cero likes en el momento de la consulta, se trata de un artefacto de investigación de nicho, no de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyección dual (projection_retriever) sobre representaciones; no es un transformer generativo |
| Parametros totales | 147.840 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | multilingüe (sin listado explícito); datos de entrenamiento incluyen inglés (MTEB MultilingualNanoNFCorpus) y roman urdu |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa un retriever de proyección dual compacto. En lugar de un encoder transformer completo, aprende una proyección que mapea representaciones de consulta y documento a un espacio compartido de 64 dimensiones. El checkpoint distribuido es uno de los tres puntos (32, 64 y 96 dimensiones) de un barrido de Pareto, lo que sugiere que el autor exploró el compromiso entre tamaño del embedding y calidad de recuperación.

El entrenamiento utiliza negativos duros explícitos construidos a partir de n-gramas de caracteres, una técnica que fuerza al modelo a distinguir documentos que comparten fragmentos léxicos superficiales. Los datos de entrenamiento provienen de dos fuentes: MTEB MultilingualNanoNFCorpus (bajo términos CC BY 4.0) y datos de recuperación en roman urdu (bajo términos CC BY / CC BY-SA). El autor indica explícitamente que el texto fuente original no se redistribuye. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables a un retriever de este tipo).

## Capacidades

- Recuperación de información multilingüe: genera embeddings de consulta y documento en un espacio compartido de 64 dimensiones para búsqueda semántica.
- Entrenamiento con negativos duros por n-gramas de caracteres: mejora la discriminación entre documentos léxicamente próximos.
- Evaluación por idioma: el autor publica métricas held-out desglosadas por lengua en `evaluation.json`.
- Cobertura lingüística parcial documentada: inglés (vía MultilingualNanoNFCorpus) y roman urdu.
- No soporta generación de texto, tool calling, agentes, visión ni audio: es exclusivamente un modelo de representación para recuperación.
- Barrido de dimensiones: el checkpoint de 64 dimensiones forma parte de una familia 32/64/96, lo que permite ajustar el coste de almacenamiento del índice.

## Casos de uso

- Búsqueda semántica de bajo coste en corpus pequeños: con 147.840 parámetros y embeddings de 64 dimensiones, el índice resultante ocupa muy poco espacio, adecuado para despliegues en dispositivos con memoria limitada.
- Recuperación en roman urdu: uno de los pocos artefactos públicos que documenta datos de entrenamiento en esta variante lingüística, útil para pipelines de búsqueda en contenido informal del sur de Asia.
- Baseline de investigación para ablation studies: sirve como punto de comparación frente a retrievers densos de mayor tamaño al analizar el compromiso dimensión-calidad.
- Filtrado previo en pipelines RAG: puede actuar como primera etapa de recuperación barata antes de un re-ranker más costoso, siempre que se valide su calidad en el dominio objetivo.
- Experimentación con negativos duros léxicos: el enfoque de n-gramas de caracteres es replicable y útil para estudiar cómo afecta la minería de negativos a la calidad del embedding.
- Evaluación comparativa frente a BM25: el propio autor sugiere que la recuperación léxica puede superar a este modelo en el split evaluado, lo que lo convierte en un caso de estudio sobre cuándo un retriever denso no aporta ventaja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor remite a un archivo `evaluation.json` con métricas held-out por idioma, pero los valores concretos no se incluyen en la información proporcionada. No se deben inferir cifras de rendimiento sin consultar dicho archivo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos del modelo (147.840 parámetros en safetensors); el coste real depende del encoder base sobre el que se aplique la proyección, que no se especifica.
- GPU recomendadas: cualquier GPU consumer sirve para la proyección; el cuello de botella estará en el encoder subyacente y en el tamaño del índice.
- Cabe en cualquier GPU consumer e incluso en CPU para la etapa de proyección.
- Opciones de despliegue: al no ser un modelo generativo estándar, no aplican vLLM, llama.cpp, Ollama ni TGI de forma directa; requeriría un wrapper propio que cargue los safetensors y aplique la proyección.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Dimensión embedding | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PolyRetrieve Multilingual Experimental | 147.840 | 64 (familia 32/64/96) | no disponible | no disponible | Hugging Face, 0 descargas |
| BGE-M3 | no disponible en esta ficha | 1024 | 8192 | MIT | ampliamente desplegado |
| Multilingual E5 | no disponible en esta ficha | 768/1024 | 512 | MIT | ampliamente desplegado |
| BM25 (léxico) | 0 (sin parámetros) | n/a | ilimitado | dominio público | estándar en IR |

No se dispone de datos de rendimiento comparables para PolyRetrieve en la información proporcionada, por lo que la comparación se limita a parámetros, dimensión y disponibilidad.

## Limitaciones y advertencias

- El propio autor advierte que la proyección aprendida puede rendir peor que la recuperación léxica en el split evaluado; no debe asumirse superioridad frente a BM25.
- Modelo experimental con cero descargas y cero likes: sin validación externa por parte de la comunidad.
- Licencia no especificada: no es posible determinar si el uso comercial está permitido. Los datos de origen tienen términos CC BY y CC BY-SA, lo que puede imponer obligaciones de atribución o share-alike.
- Cobertura lingüística limitada y no documentada de forma exhaustiva: solo se confirman inglés y roman urdu en los datos de entrenamiento.
- Longitud de contexto no disponible: se desconoce la longitud máxima de documento o consulta que el modelo maneja correctamente.
- Al ser un retriever, no genera texto: no puede usarse para tareas generativas, agentes ni tool calling.
- El texto fuente no se redistribuye, lo que limita la reproducibilidad completa del entrenamiento.
- Riesgo de sobreajuste al split acotado: el autor describe el conjunto de evaluación como "bounded split", lo que sugiere baja generalización a dominios no vistos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/husnainbinmunawar/polyretrieve-multilingual-experimental
- MTEB MultilingualNanoNFCorpus (fuente de datos citada): no disponible como enlace directo en la información proporcionada
- Archivo de evaluación `evaluation.json`: referenciado en la model card, sin URL directa disponible
