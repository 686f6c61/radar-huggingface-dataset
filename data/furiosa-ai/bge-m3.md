# furiosa-ai/bge-m3

## Resumen

`furiosa-ai/bge-m3` es un build del modelo de embeddings multilingüe BGE-M3, desarrollado originalmente por BAAI, adaptado por FuriosaAI para ejecutarse en su hardware NPU RNGD mediante el framework Furiosa-LLM. El modelo base BGE-M3 unifica tres funcionalidades de recuperación (dense, sparse y multi-vector), pero este build expone únicamente los embeddings densos de 1024 dimensiones, obtenidos mediante CLS-pooling. Está pensado para tareas de búsqueda semántica, similitud y recuperación de información en entornos de producción que utilicen la infraestructura de FuriosaAI.

La relevancia de este modelo radica en que permite desplegar un encoder multilingüe de alto rendimiento en hardware especializado (RNGD), con una integración sencilla a través de un servidor compatible con la API de OpenAI y una API Python offline. Al estar basado en XLM-RoBERTa, hereda la capacidad de procesar más de 100 idiomas, aunque la información proporcionada no especifica la lista exacta. El repositorio incluye los pesos en BF16 (safetensors) y un Furiosa Executable Bundle (FXB) que se descubre automáticamente al cargar el modelo con Furiosa-LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (dense encoder), `XLMRobertaModel` |
| Parametros totales | 567.754.752 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BGE-M3 soporta 8192 tokens, pero no se confirma en esta build) |
| Tipos de cuantizacion | BF16 (sin cuantizacion de menor precision) |
| Idiomas soportados | multilingue (mas de 100 idiomas segun el modelo base) |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16) y FXB (Furiosa Executable Bundle) |

## Arquitectura y entrenamiento

El modelo base BGE-M3 fue desarrollado por BAAI sobre la arquitectura XLM-RoBERTa, un encoder transformer preentrenado con un objetivo de enmascaramiento de lenguaje. BGE-M3 se distingue por su multifuncionalidad: combina recuperacion densa, sparse (lexical) y multi-vector en un unico modelo. Sin embargo, el build de FuriosaAI expone exclusivamente los embeddings densos, que son vectores L2-normalizados de 1024 dimensiones obtenidos mediante CLS-pooling. No se proporcionan detalles sobre el entrenamiento especifico de esta build, pero al ser una adaptacion del modelo original, hereda sus caracteristicas de entrenamiento (datos multilingues, objetivos de contraste, etc.). La innovacion principal de este repositorio es la compilacion a un FXB optimizado para la NPU RNGD, que permite una ejecucion eficiente con un paralelismo tensor de 8 PEs (una tarjeta).

## Capacidades

- Generacion de embeddings densos de 1024 dimensiones para texto, con normalizacion L2 (el producto punto equivale a la similitud coseno).
- Busqueda semantica y recuperacion de informacion en multiples idiomas (mas de 100 segun el modelo base).
- Similitud entre frases y documentos, util para deduplicacion, clustering y clasificacion.
- Integracion con pipelines de RAG (retrieval augmented generation) como componente de recuperacion.
- Compatible con el servidor Furiosa-LLM, que expone un endpoint `/v1/embeddings` compatible con la API de OpenAI.
- Uso offline mediante la API Python de Furiosa-LLM (`LLM.embed`).
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso, al ser un modelo encoder puro.

## Casos de uso

- Busqueda semantica en bases de conocimiento: indexar documentos y consultas con los embeddings densos para recuperar pasajes relevantes mediante similitud coseno, aprovechando el soporte multilingue para cubrir contenido en varios idiomas.
- Sistemas de recomendacion basados en contenido: representar items (articulos, productos, noticias) como vectores y calcular similitudes para sugerir elementos relacionados.
- Clasificacion de texto: usar los embeddings como caracteristicas de entrada para un clasificador supervisado (por ejemplo, analisis de sentimiento o categorizacion de tickets).
- Deduplicacion de documentos: comparar embeddings de documentos para identificar duplicados o versiones cercanas, util en pipelines de limpieza de datos.
- Recuperacion aumentada por generacion (RAG): integrar el modelo como retriever en un sistema de preguntas y respuestas, donde los embeddings de las consultas se comparan con los de los documentos almacenados.
- Moderacion de contenido multilingue: clasificar textos en multiples idiomas para detectar contenido inapropiado, usando los embeddings como entrada a un modelo de clasificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base BGE-M3 tiene resultados publicados en el paper original, pero esta build especifica para FuriosaAI no incluye metricas propias. Se recomienda consultar la documentacion de FuriosaAI para datos de latencia y throughput en RNGD, que no estan disponibles en la informacion proporcionada.

## Requisitos de hardware

- Requiere hardware FuriosaAI RNGD (NPU), no es compatible con GPUs convencionales.
- El modelo se ejecuta con un paralelismo tensor de 8 PEs, que corresponde a una unica tarjeta RNGD.
- No cabe en GPUs de consumo (RTX, etc.) porque el FXB esta compilado exclusivamente para RNGD.
- Despliegue mediante Furiosa-LLM: servidor OpenAI-compatible (`furiosa-llm serve`) o API Python offline.
- No se dispone de datos de latencia o throughput en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Hardware |
|---|---|---|---|---|---|
| furiosa-ai/bge-m3 (esta build) | 567M | no disponible | multilingue | MIT | FuriosaAI RNGD |
| BAAI/bge-m3 (original) | 567M | 8192 | mas de 100 | MIT | GPUs, CPU, etc. |
| multilingual-e5-large | 560M | 512 | 100+ | MIT | GPUs, CPU |

La comparativa se limita a aspectos generales porque no se dispone de datos de rendimiento especificos de esta build. La principal diferencia con el modelo original es el formato de pesos (BF16 + FXB) y el hardware objetivo (RNGD), mientras que el resto de caracteristicas son identicas al modelo base.

## Limitaciones y advertencias

- Requiere hardware FuriosaAI RNGD; no es portable a otras arquitecturas sin recompilar el modelo.
- Esta build solo expone embeddings densos; las funcionalidades sparse y multi-vector del modelo base no estan disponibles a traves de Furiosa-LLM.
- La longitud de contexto no se confirma en la informacion proporcionada; si se usa el modelo base como referencia, es de 8192 tokens, pero se debe verificar en la documentacion de FuriosaAI.
- Al ser un modelo de embeddings, no genera texto y no es adecuado para tareas generativas.
- Puede heredar sesgos del modelo base XLM-RoBERTa, especialmente en idiomas poco representados.
- La licencia MIT permite uso comercial, pero el despliegue esta condicionado a la disponibilidad de hardware FuriosaAI.

## Enlaces

- [Repositorio HuggingFace furiosa-ai/bge-m3](https://huggingface.co/furiosa-ai/bge-m3)
- [Modelo base BAAI/bge-m3](https://huggingface.co/BAAI/bge-m3)
- [Documentacion Furiosa-LLM](https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html)
- [Documentacion del servidor Furiosa-LLM](https://developer.furiosa.ai/latest/en/furiosa_llm/furiosa-llm-serve.html)
- [Pagina de BGE-M3 en BGE documentation](https://bge-model.com/bge/bge_m3.html)
- [Lista de modelos soportados por Furiosa-LLM](https://developer.furiosa.ai/latest/en/furiosa_llm/supported_models.html)
