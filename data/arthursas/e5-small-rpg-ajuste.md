# arthursas/e5-small-rpg-ajuste

## Resumen

`arthursas/e5-small-rpg-ajuste` es un ajuste fino del modelo de embeddings multilingüe `intfloat/multilingual-e5-small`, publicado por el usuario arthursas en Hugging Face. Se trata de un modelo BERT de 117,6 millones de parámetros orientado a la generación de embeddings de frases, reentrenado sobre un corpus muy específico: 362 fragmentos extraídos de 72 notas de un mundo de rol de mesa (RPG), a partir de los cuales se generaron 1.260 pares sintéticos de pregunta y pasaje.

El objetivo declarado es mejorar la recuperación semántica en un sistema RAG (Retrieval-Augmented Generation) construido sobre esas notas. Sin embargo, el propio autor es explícito en la model card: el ajuste no supera de forma estadísticamente significativa al modelo base. En una prueba de 46 preguntas, las diferencias quedaron dentro del margen atribuible al azar según un test exacto de McNemar (p ≥ 0,125 en las seis comparaciones realizadas).

El modelo es relevante no por su rendimiento, sino como ejemplo de metodología honesta: documenta el proceso de ajuste, la evaluación y los resultados negativos. Está pensado para un caso de uso muy acotado (recuperación sobre un conjunto concreto de notas en portugués) y no como sustituto del modelo base para aplicaciones generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer), modelo de embeddings de frases |
| Parametros totales | 117.653.760 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no especificada en la informacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugues (pt); el modelo base es multilingue, pero el ajuste se realizo solo en portugues |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Libreria | sentence-transformers |
| Tamano del repositorio | 0,5 GB |
| Pipeline | sentence-similarity |
| Prefijos requeridos | `query: ` para preguntas, `passage: ` para pasajes |

## Arquitectura y entrenamiento

El modelo parte de `intfloat/multilingual-e5-small`, un encoder BERT de 117,6 millones de parámetros entrenado para producir embeddings de frases comparables mediante similitud coseno. El ajuste fino se realizó con la librería `sentence-transformers` utilizando la función de pérdida `MultipleNegativesRankingLoss`, que aprovecha los pares positivos (pregunta, pasaje) dentro de cada lote como negativos implícitos.

Los datos de entrenamiento consisten en 1.260 pares (pregunta, fragmento) construidos a partir de 362 fragmentos extraídos de 72 notas de un mundo de RPG. Las preguntas fueron generadas por el modelo Gemini; ninguna de las preguntas del conjunto de prueba se incluyó en el entrenamiento. La configuración principal, denominada `médio`, usó una tasa de aprendizaje de 2e-5, 2 épocas, tamaño de lote 16 y entrenamiento en CPU, con una pérdida final de 0,496. Se probaron también dos configuraciones adicionales: `suave` (1e-5, 1 época) y `forte` (5e-5, 3 épocas). Ninguna de las tres superó de forma comprobada al modelo original.

## Capacidades

- Generación de embeddings de frases para búsqueda semántica y similitud entre textos.
- Recuperación de pasajes relevantes en un corpus concreto de notas de rol de mesa en portugués.
- Soporte de los prefijos `query: ` y `passage: ` propios de la familia E5, necesarios para que los embeddings de consulta y documento sean comparables.
- Normalización de embeddings (`normalize_embeddings=True`) para usar similitud coseno.
- Integración con `sentence-transformers` y con Text Embeddings Inference (TEI), según las etiquetas del repositorio.
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión ni audio: es exclusivamente un modelo de representación vectorial.

## Casos de uso

- Recuperación en un RAG sobre notas de campaña: indexar los 362 fragmentos del corpus y recuperar los pasajes más afines a una consulta del máster, usando los prefijos E5 y similitud coseno. Es el escenario para el que fue entrenado, aunque el autor advierte que no mejora al base.
- Búsqueda semántica en documentación de ambientación: localizar personajes, facciones o lugares dentro de un wiki de rol sin depender de coincidencia exacta de palabras clave.
- Clasificación y agrupamiento de fragmentos: usar los embeddings para agrupar notas temáticamente o detectar duplicados en un corpus pequeño en portugués.
- Deduplicación de contenido: comparar pares de fragmentos por similitud coseno para detectar solapamientos entre notas de una misma campaña.
- Prototipado de pipelines de recuperación: servir como componente de recuperación en un sistema de preguntas y respuestas sobre un corpus acotado, con la ventaja de su tamaño reducido (0,5 GB) y de ejecutarse en CPU.
- Evaluación comparativa de técnicas de ajuste: útil como referencia metodológica para reproducir un experimento de fine-tuning con datos sintéticos y medición estadística (test de McNemar) sobre un conjunto de prueba pequeño.
- Filtrado de candidatos en un sistema de recomendación de contenido: ordenar fragmentos de texto por afinidad semántica con una consulta del usuario en un dominio muy restringido.

## Benchmarks y rendimiento

El autor publica una evaluación sobre 46 preguntas, comparando el modelo ajustado con el original en dos modos de búsqueda (vectorial y mixta) y distintos valores de k. Los resultados son recuentos de aciertos, no métricas normalizadas.

| Busqueda / k | Original | Este modelo |
|---|---|---|
| Vectorial / 5 | 30 | 32 |
| Vectorial / 12 | 37 | 35 |
| Vectorial / 20 | 39 | 43 |
| Mixta / 5 | 35 | 36 |

El autor indica que las diferencias no son estadísticamente significativas: el test exacto de McNemar arroja p ≥ 0,125 en las seis comparaciones realizadas. No se han publicado resultados en benchmarks estándar (MMLU, MTEB, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 117,6 millones de parámetros; en fp32 ocupa aproximadamente 0,47 GB y en fp16 alrededor de 0,24 GB, a lo que hay que sumar el overhead de activaciones y del runtime. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU. Para lotes grandes, una RTX 3060, RTX 4090, A100 o H100 aceleran la codificación, pero no son necesarias.
- Cabe en cualquier GPU consumer, incluidas las integradas y las de gama baja, dado su tamaño reducido.
- Opciones de despliegue: `sentence-transformers`, Text Embeddings Inference (TEI) y, por compatibilidad con el formato safetensors y BERT, otros runtimes de inferencia de embeddings.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento se realizó en CPU, lo que sugiere que la inferencia en CPU es viable para volúmenes moderados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `arthursas/e5-small-rpg-ajuste` | 117,6 M | no disponible | pt | MIT | Ajuste sobre un corpus de RPG; sin mejora comprobada frente al base |
| `intfloat/multilingual-e5-small` | 117,6 M | no disponible | multilingue | MIT | Modelo base; referencia de calidad general y multilingue |
| `intfloat/multilingual-e5-base` | no disponible en la informacion | no disponible | multilingue | MIT | Versión de mayor tamaño de la misma familia E5 |
| `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` | no disponible en la informacion | no disponible | multilingue | no disponible en la informacion | Alternativa habitual para embeddings multilingües de propósito general |

La comparación relevante es con el modelo base: el ajuste no demuestra una mejora estadísticamente significativa, por lo que para uso general conviene el original.

## Limitaciones y advertencias

- El ajuste se realizó sobre un único conjunto de notas de RPG; no es un modelo de propósito general y su rendimiento fuera de ese dominio no está caracterizado.
- El conjunto de evaluación es muy pequeño (46 preguntas), por lo que solo permitiría detectar diferencias grandes; el autor lo reconoce explícitamente.
- Solo se realizó una ronda de entrenamiento por configuración, sin validación cruzada ni repeticiones que estimen la varianza.
- No hay evidencia de mejora frente al modelo base: en varias combinaciones de búsqueda y k el ajuste rinde peor, y en ninguna la diferencia es significativa.
- Riesgo de alucinación: no aplica directamente a un modelo de embeddings, pero los vectores recuperados pueden priorizar fragmentos poco relevantes si el corpus de consulta difiere del de entrenamiento.
- Sesgos: no documentados en la información disponible; al derivar de un modelo multilingüe entrenado con datos web, puede heredar sesgos de ese corpus.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo base y los datos sintéticos generados con Gemini deben verificarse por separado.
- El modelo requiere el uso correcto de los prefijos `query: ` y `passage: `; omitirlos degrada la calidad de la recuperación.
- El idioma de trabajo es el portugués; el ajuste no se evaluó en otros idiomas aunque el base sea multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arthursas/e5-small-rpg-ajuste
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Repositorio con código, datos y mediciones: https://github.com/ArthurFigg/rag-ajuste-fino
