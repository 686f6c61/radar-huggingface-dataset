# lukasz597/r

## Resumen

El modelo `lukasz597/r` es un encoder de texto denso optimizado para tareas de recuperación de información en polaco. Aunque el repositorio está publicado por el usuario `lukasz597`, su contenido procede del modelo `MMLW-retrieval-e5-base`, desarrollado por Slawomir Dadas y colaboradores. Se trata de un modelo de tipo sentence-transformer basado en la arquitectura `XLM-RoBERTa`, con 278 millones de parámetros y una dimensión de embedding de 768. Está pensado para transformar consultas y pasajes en vectores semánticos y compararlos mediante similitud coseno.

El modelo resuelve el problema de la búsqueda semántica en polaco, un idioma que a menudo carece de recursos de recuperación suficientemente afinados. Fue entrenado en dos fases: primero mediante destilación de conocimiento multilingüe sobre 60 millones de pares polaco-inglés, utilizando `FlagEmbeddings` como profesor, y después mediante fine-tuning con pérdida contrastiva en la división de entrenamiento de `Polish MS MARCO`. Su relevancia actual reside en que ofrece buenos resultados en el benchmark polaco `PIRB`, alcanzando un NDCG@10 de 56,09.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa base (encoder transformer) |
| Parametros totales | 278.043.648 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors, sin cuantizaciones listadas) |
| Idiomas soportados | polaco (principal), entrenado con pares polaco-ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer encoder basado en `XLM-RoBERTa`. Fue inicializado desde el checkpoint `multilingual-e5-base` y posteriormente afinado mediante dos procedimientos. En primer lugar, se aplicó destilación de conocimiento multilingüe sobre un corpus de 60 millones de pares de texto polaco-inglés, usando los modelos `FlagEmbeddings` de `BGE-base-en` como profesores. En segundo lugar, se realizó fine-tuning con pérdida contrastiva en la división de entrenamiento del dataset `Polish MS MARCO`, con tamaños de lote elevados (768 muestras para el modelo base). El entrenamiento se ejecutó en un clúster de 12 GPU A100. El modelo no utiliza técnicas como RLHF o DPO, al tratarse de un encoder, no de un modelo generativo.

Una innovación destacable es la necesidad de anteponer prefijos específicos a las entradas para obtener buenos resultados: las consultas deben ir precedidas de `"query: "` y los pasajes de `"passage: "`. Esto es coherente con la convención establecida por los modelos `E5`.

## Capacidades

- Genera embeddings densos de 768 dimensiones para consultas y pasajes, aptos para cálculo de similitud coseno.
- Recuperación de información semántica en polaco: devuelve el pasaje más relevante para una consulta dada.
- Optimizado para tareas de retrieval denso, pudiendo utilizarse como primera etapa en pipelines de búsqueda.
- No es un modelo generativo: no produce texto por sí mismo ni soporta tool calling o agentes conversacionales.
- Capacidades multilingües limitadas: fue entrenado con pares polaco-inglés, pero su uso previsto es exclusivamente para polaco.
- No soporta visión ni audio.

## Casos de uso

- Busqueda semantica en documentacion corporativa polaca: se codifican los documentos en un indice vectorial y las consultas del usuario se transforman en el mismo espacio para recuperar los fragmentos relevantes.
- Chatbots de soporte con base de conocimiento en polaco: el modelo localiza los pasajes mas cercanos a la pregunta del cliente y los pasa a un LLM generativo como contexto.
- Re-ranking de resultados en motores de busqueda: se puede integrar tras un sistema de recuperacion lexical como BM25 para reordenar los resultados por relevancia semantica.
- Sistema de preguntas y respuestas sobre documentos legales o tecnicos polacos: dado un corpus normativo, el modelo selecciona los articulos o secciones mas afines a la consulta.
- Deduplicacion o clustering de articulos de noticias en polaco: los embeddings permiten agrupar textos similares o detectar contenido duplicado.
- Motor de recomendacion de contenido editorial: a partir de un articulo leido, se recuperan otros con embeddings proximos en el espacio semantico.
- Clasificacion supervisada de textos polacos: los embeddings pueden servir como features de entrada para un clasificador aguas abajo.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| NDCG@10 en PIRB (Polish Information Retrieval Benchmark) | 56,09 |

No se han publicado resultados de benchmarks adicionales en la informacion disponible. Los datos concretos de comparacion con otros modelos no estan incluidos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en fp32 y 0,56 GB en fp16.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM, por ejemplo una RTX 3050 o superior, aunque el modelo puede ejecutarse tambien en CPU.
- Si cabe en GPU de consumo: si, en GPU de gama baja o incluso con CPU.
- Opciones de despliegue: es compatible con `sentence-transformers`, `text-embeddings-inference` y `transformers`. Tambien puede servirse en endpoints compatibles con Hugging Face.
- Latencia y throughput estimados: no disponible, dependen del hardware y del tamaño del lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | NDCG@10 PIRB | Licencia |
|---|---|---|---|---|
| lukasz597/r (este) | 278.043.648 | no disponible | 56,09 | Apache 2.0 |
| sdadas/mmlw-retrieval-e5-base | 278.043.648 | no disponible | 56,09 | Apache 2.0 |
| intfloat/multilingual-e5-base | no disponible | no disponible | no disponible | no disponible |

El modelo `lukasz597/r` es identico en pesos a `sdadas/mmlw-retrieval-e5-base`, del que procede. Frente a `multilingual-e5-base`, que es un modelo generico multilingue, este modelo esta afinado especificamente para retrieval en polaco y muestra mejores resultados en ese idioma, aunque no se dispone de datos cuantitativos comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo de embeddings, no un modelo generativo: no puede mantener conversaciones ni responder preguntas directamente.
- Es obligatorio usar los prefijos `"query: "` y `"passage: "` al codificar textos; si se omiten, la calidad de la recuperacion puede degradarse.
- Esta optimizado para polaco. Puede mostrar un rendimiento inferior en otros idiomas, incluido el ingles, aunque fue entrenado con pares polaco-ingles.
- La longitud de contexto exacta no se especifica en la informacion disponible. Dado que se basa en XLM-RoBERTa, es probable que sea de 512 tokens, pero este dato no ha sido confirmado.
- No se han documentado sesgos especificos ni evaluaciones de equidad en la informacion disponible.
- El modelo esta bajo licencia Apache 2.0, lo que permite uso comercial, pero el repositorio en `Hugging Face` esta publicado por un usuario distinto al autor original. Conviene verificar la autenticidad y procedencia de los pesos antes de utilizarlo en produccion.

## Enlaces

- Repositorio del modelo: https://huggingface.co/lukasz597/r
- Modelo original: https://huggingface.co/sdadas/mmlw-retrieval-e5-base
- Benchmark PIRB: https://huggingface.co/spaces/sdadas/pirb
- Dataset de entrenamiento: https://huggingface.co/datasets/clarin-knext/msmarco-pl
- Articulo de destilacion multilingue: https://aclanthology.org/2020.emnlp-main.365/
- Modelo profesor utilizado: https://huggingface.co/BAAI/bge-base-en
