# madhurr382/coderankembed-apps-ft

## Resumen

`madhurr382/coderankembed-apps-ft` es un modelo de embeddings de código obtenido por fine-tuning de `nomic-ai/CodeRankEmbed` sobre el split de entrenamiento del dataset `CoIR-Retrieval/apps`, que empareja enunciados de problemas en lenguaje natural con soluciones en Python. Su objetivo es la recuperación (retrieval) de código: dada una consulta en lenguaje natural, devolver el fragmento de código relevante. El autor lo publica como adaptación específica para la tarea `AppsRetrieval` de MTEB.

Técnicamente es un bi-encoder de arquitectura NomicBert con 136.731.648 parámetros (aproximadamente 137 M), pesos en safetensors y licencia MIT. No es un modelo generativo: produce representaciones vectoriales normalizadas para similitud coseno, y requiere `trust_remote_code=True` por su implementación personalizada de NomicBert. El repositorio ocupa 0,5 GB y no registra descargas ni likes en el momento de la consulta.

Su relevancia es acotada pero clara: demuestra que un ajuste fino ligero (4500 filas de entrenamiento, 2 épocas) sobre un modelo base de retrieval de código mejora la métrica de validación de forma monótona hasta MRR@10 0,7497 y NDCG@10 0,7781 en el conjunto de validación, con un rendimiento en test de NDCG@10 0,4709 y MRR@10 0,4303 en `AppsRetrieval`. Es, por tanto, un recurso útil para pipelines de búsqueda semántica de código en dominios tipo APPS, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NomicBert (encoder transformer tipo BERT), bi-encoder de embeddings; requiere `trust_remote_code=True` |
| Parametros totales | 136.731.648 (aproximadamente 137 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento se realizo con `max_len` 512) |
| Tipos de cuantizacion | no disponible; el repositorio distribuye pesos safetensors |
| Idiomas soportados | no disponibles; el corpus de entrenamiento es codigo Python con enunciados en ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (`sentence-transformers`, `custom_code`) |
| Modelo base | nomic-ai/CodeRankEmbed |
| Dataset de ajuste | CoIR-Retrieval/apps (split de train) |
| Tarea (pipeline) | sentence-similarity / code-search |
| Tamano del repositorio | 0,5 GB |
| Etiquetas relevantes | code-search, mteb, text-embeddings-inference, endpoints_compatible |
| Fecha de publicacion | 2026-09-29 |

## Arquitectura y entrenamiento

El modelo es un bi-encoder basado en NomicBert, la implementacion de BERT de Nomic AI con atencion rotatoria (rotary embeddings). Las consultas deben codificarse con el prefijo del modelo base (`Represent this query for searching relevant code: `), mientras que los documentos de codigo se codifican sin prefijo. La similitud se calcula como producto escalar de embeddings normalizados, es decir, similitud coseno.

El ajuste fino se hizo con `CachedMultipleNegativesRankingLoss`, batch de 128, learning rate 2e-05, 2 epocas, longitud maxima 512 y un sampler `NO_DUPLICATES`. No se usaron negativos duros (hard negatives). El conjunto de entrenamiento consta de 4500 filas y la validacion de 500 consultas retenidas del propio train sobre 5000 documentos. La metrica de validacion mejora de forma consistente por epoca: MRR@10 0,6466 en la epoca 0, 0,7378 en la epoca 1 y 0,7497 en la epoca 2, con NDCG@10 de 0,6666, 0,7669 y 0,7781 respectivamente. Se guardo la epoca 2 por ser la de mejor MRR@10 de validacion. El autor declara que no se utilizaron consultas ni qrels del conjunto de test, y que la configuracion completa esta en `finetune_config.json`.

Una particularidad tecnica relevante: el cargador de `transformers` v5 deja sin inicializar los buffers no persistentes de NomicBert (la `inv_freq` rotatoria y el `norm_factor` de atencion). El repositorio incluye `retrieval/eval_baseline.py::load_st_model`, que los reconstruye tras la carga. Ademas, para obtener las mejores puntuaciones es necesario limpiar previamente los enunciados estilo APPS con el script `retrieval/query_clean.py` en modo `desc-io`, conservando descripcion y secciones de entrada/salida y descartando ejemplos, notas y restricciones.

## Capacidades

- Generacion de embeddings de texto y de codigo para busqueda semantica; no genera texto.
- Recuperacion de codigo a partir de consultas en lenguaje natural (text-to-code retrieval) en dominios tipo APPS.
- Similitud y ranking documento-consulta mediante similitud coseno con embeddings normalizados.
- Codificacion asimetrica: prefijo especifico para consultas, sin prefijo para documentos.
- Integracion con `sentence-transformers` y con `text-embeddings-inference` (etiqueta `endpoints_compatible`), lo que permite exponerlo como endpoint de embeddings.
- Compatibilidad con la evaluacion MTEB, en concreto la tarea `AppsRetrieval`.
- Soporte de tool calling / function calling: no disponible (es un modelo de embeddings, no generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (entrenamiento unicamente en ingles + Python).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Busqueda semantica en repositorios de ejercicios de programacion: indexar soluciones en Python y permitir consultas en lenguaje natural del tipo "dado un array, devolver la longitud de su subsecuencia creciente mas larga", recuperando la implementacion adecuada.
- Asistentes de aprendizaje de algoritmos: dado el enunciado de un problema, recuperar soluciones previas similares para mostrarlas como referencia al estudiante.
- Deduplicacion y agrupamiento de problemas: calcular embeddings de enunciados para detectar ejercicios redundantes o agruparlos por tecnica (programacion dinamica, grafos, etc.).
- Enriquecimiento de pipelines RAG sobre codigo: usar el modelo como recuperador en un sistema de recuperacion aumentada donde el generador final sea otro modelo, aprovechando su bajo coste computacional (137 M de parametros).
- Etiquetado automatico de ejercicios por similitud: asignar categorias o dificultad aproximada a partir de los vecinos mas cercanos en el espacio de embeddings.
- Filtrado de candidatos en revisiones de codigo asistidas: recuperar fragmentos de codigo historicamente similares a un cambio propuesto para contextualizar la revision.
- Construccion de conjuntos de evaluacion internos para retrieval de codigo, reutilizando el modelo como baseline en dominios con estructura similar a APPS.

## Benchmarks y rendimiento

Resultados declarados por el autor en la tarea `AppsRetrieval` de MTEB (evaluacion en CPU, consultas limpiadas con `desc-io`):

| Benchmark | Metrica | Valor |
|---|---|---|
| MTEB AppsRetrieval (test) | NDCG@10 | 0,4709 |
| MTEB AppsRetrieval (test) | MRR@10 | 0,4303 |

Resultados de validacion durante el entrenamiento (500 consultas de train retenidas sobre 5000 documentos):

| Epoca | MRR@10 de validacion | NDCG@10 de validacion |
|---|---|---|
| 0 | 0,6466 | 0,6666 |
| 1 | 0,7378 | 0,7669 |
| 2 (guardada) | 0,7497 | 0,7781 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni la puntuacion del modelo base en la misma tarea, por lo que no es posible cuantificar la mejora atribuible al fine-tuning.

## Requisitos de hardware

- Con 136.731.648 parametros, los pesos en fp32 ocupan aproximadamente 547 MB y en fp16 unos 274 MB (el repositorio completo ocupa 0,5 GB).
- Inferencia viable en CPU para cargas moderadas; el propio autor reporta la evaluacion en CPU.
- Cabe sobradamente en cualquier GPU de consumo (RTX 3060, RTX 4090, GTX 1660, etc.) e incluso en GPUs integradas con suficiente memoria compartida.
- Para indexacion a gran escala, GPU con al menos 4-8 GB de VRAM permite lotes amplios y throughput alto; no se dispone de cifras concretas de latencia o throughput en la informacion proporcionada.
- Opciones de despliegue: `sentence-transformers` con `trust_remote_code=True`, `text-embeddings-inference` (etiqueta `endpoints_compatible`), `transformers` (con la correccion de buffers indicada) y servicios de inferencia compatibles con la API de embeddings.
- No se recomienda `llama.cpp` ni formatos GGUF, ya que es un modelo de embeddings y no se documentan conversiones a esos formatos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| madhurr382/coderankembed-apps-ft | 136.731.648 | no disponible | Retrieval de codigo ajustado a APPS/AppsRetrieval | MIT | HuggingFace |
| nomic-ai/CodeRankEmbed (modelo base) | no disponible en la informacion proporcionada | no disponible | Retrieval de codigo general | no disponible en la informacion proporcionada | HuggingFace |
| Otros modelos de embeddings de codigo de tamano similar | no disponible | no disponible | Retrieval de codigo | no disponible | no disponible |

La comparacion cuantitativa con alternativas no puede realizarse con los datos proporcionados: no se incluyen puntuaciones del modelo base ni de otros modelos de retrieval de codigo en `AppsRetrieval`. La diferencia funcional conocida es que esta variante esta especializada en el formato de enunciados tipo APPS y en soluciones Python, mientras que el modelo base es de proposito mas general.

## Limitaciones y advertencias

- Modelo de embeddings, no generativo: no produce texto ni respuestas; cualquier riesgo de alucinacion se traslada al sistema que consuma sus recuperaciones (puede devolver documentos poco relevantes si la consulta esta fuera de dominio).
- Ajuste muy especifico: 4500 filas de entrenamiento y 2 epocas sobre un unico dataset (APPS). El comportamiento fuera de ese dominio (otros lenguajes de programacion, otros estilos de enunciado) no esta documentado.
- Requiere preprocesado especifico: el prefijo `Represent this query for searching relevant code: ` en las consultas y la limpieza `desc-io` de los enunciados. Omitir estos pasos degrada las puntuaciones, segun el propio autor.
- Sin negativos duros en el entrenamiento, lo que puede limitar la capacidad de discriminar entre candidatos muy similares.
- Idioma: no se declaran idiomas soportados; el material de entrenamiento es en ingles, por lo que el rendimiento en castellano no esta verificado.
- Longitud de contexto no documentada en la ficha; el entrenamiento se hizo con `max_len` 512, por lo que secuencias mas largas no estan cubiertas por el ajuste.
- Incompatibilidad conocida con el cargador de `transformers` v5, que deja buffers no persistentes sin inicializar; es necesario reconstruirlos con el codigo del repositorio.
- Licencia MIT, que permite uso comercial y modificacion, siempre que se conserve el aviso de copyright y la licencia; conviene verificar tambien las condiciones del modelo base y del dataset `CoIR-Retrieval/apps`.
- Modelo sin traccion comunitaria (0 descargas y 0 likes en el momento de la consulta): no hay validacion independiente de los resultados declarados.
- No se documentan sesgos especificos, pero al entrenarse sobre un corpus de problemas de programacion en ingles puede heredar sesgos de ese tipo de contenido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/madhurr382/coderankembed-apps-ft
- Modelo base: https://huggingface.co/nomic-ai/CodeRankEmbed
- Dataset de entrenamiento: https://huggingface.co/datasets/CoIR-Retrieval/apps
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
