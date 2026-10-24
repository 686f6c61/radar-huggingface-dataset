# caslca/gte-modernbert-base-mlx-8bit

## Resumen

`caslca/gte-modernbert-base-mlx-8bit` es una cuantización entera de 8 bits del modelo de embeddings `Alibaba-NLP/gte-modernbert-base` de Alibaba, publicada por el usuario caslca (Premisa) en formato MLX. No es un modelo generativo: es un encoder bidireccional tipo ModernBERT de 149.014.272 parámetros que produce vectores densos (pooling CLS) para similitud semántica y recuperación de información, y que puede servirse también en modo reranking. El problema que resuelve esta variante concreta es el despliegue eficiente en Apple Silicon: los pesos lineales se han cuantizado con cuantización affine de 8 bits y grupo de 64, lo que reduce el repositorio a 0,2 GB.

La relevancia práctica está en el contexto de aplicaciones de escritorio y pipelines de RAG locales, donde un embedder de 149 M en int8 ocupa unas pocas centenas de MB de memoria unificada y evita depender de la nube. El autor reporta que, midiendo contra la fuente en float16 sobre el conjunto de chunks del estudio de retrieval Premisa (180 preguntas, pools de 50 candidatos), se conserva un 98 % de solapamiento de vecinos top-8; es una cifra de estudio previa a adjudicación, no una garantía de calidad.

Es un modelo solo para inglés, igual que la fuente, con licencia Apache 2.0, publicado el 24 de octubre de 2026 y sin descargas ni valoraciones en el momento de redactar esta ficha. Conviene tratarlo como un artefacto derivado de nicho: útil si el stack es MLX, y prescindible si el despliegue es CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional ModernBERT (base: Alibaba-NLP/gte-modernbert-base); cuantización affine de los pesos lineales |
| Parametros totales | 149.014.272 (≈149 M) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la información proporcionada; la arquitectura ModernBERT del modelo base admite hasta 8192 tokens (dato no verificado en este repositorio) |
| Tipos de cuantizacion | int8 affine con group size 64, generada con MLX; única variante publicada en el repositorio |
| Idiomas soportados | Inglés únicamente (según la model card, igual que la fuente) |
| Licencia | Apache 2.0 (se aplica la licencia del modelo fuente a estos pesos derivados) |
| Formato de pesos | safetensors en formato MLX (library_name: mlx) |
| Pooling | CLS, leído de `1_Pooling/config.json` |
| Dimension del embedding | No disponible en la información proporcionada |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es una cuantización, no un modelo entrenado desde cero. Los pesos lineales del embedder se han convertido a enteros de 8 bits con escala affine y tamaño de grupo 64 mediante `model_quant_spike.py quantize --bits 8` (modo `affine`) de Premisa, ejecutado el 21 de octubre de 2026. La fuente es `Alibaba-NLP/gte-modernbert-base` en la revisión `e7f32e3c00f91d699e8c43b53106206bcc72bb22`, con SHA-256 de los pesos originales `3e85899d5728cb7de79781c0c3acfb91ccef9f875f1f7e0b3c9f3dd4b6a724ba`. La configuración de pooling reproduce la del modelo fuente (CLS), de modo que los vectores generados son comparables con los de la versión en float16.

No se documentan en la información disponible ni la composición del corpus de entrenamiento original, ni el número de tokens, ni si hubo fases de ajuste con datos de pares o preferencias; esos detalles corresponden a la model card de Alibaba, que no se ha incluido aquí. Tampoco se describe ninguna innovación técnica propia más allá de la propia cuantización: no hay decodificación especulativa ni atención lineal específica de esta variante. El modelo base pertenece a la familia ModernBERT, orientada a eficiencia en contextos largos, y la búsqueda web lo sitúa con resultados competitivos en MTEB, LoCo y COIR a escala similar, aunque sin cifras concretas en la información recogida.

## Capacidades

- Generación de embeddings densos de frases y pasajes para búsqueda semántica y recuperación (retrieval).
- Similitud semántica entre pares de textos, útil para deduplicación, clustering y enrutado.
- Puntuación de pares consulta-documento en modo reranking: el servidor permite arrancarlo con `--reranker-model` apuntando a este directorio, si bien se trata de un bi-encoder, no de un cross-encoder (interpretación a partir de la model card).
- Inferencia nativa en MLX sobre Apple Silicon, con la configuración de pooling leída de `1_Pooling/config.json`.
- Capacidad multilingüe: no. El modelo es solo para inglés, igual que la fuente.
- Tool calling / function calling: no. No es un modelo de chat ni genera texto.
- Agentes y razonamiento multi-paso: no. No dispone de modo thinking ni de capacidades de planificación.
- Visión, audio: no disponible / no soportado.

## Casos de uso

- Búsqueda semántica local en aplicaciones de escritorio: indexar documentos del usuario y recuperar los fragmentos relevantes sin salir del equipo, aprovechando que el modelo en int8 ocupa unos 0,2 GB y cabe holgadamente en la memoria unificada de un Mac con Apple Silicon.
- RAG on-device: generar los embeddings de los chunks de una base documental privada y de la consulta del usuario en el mismo dispositivo, evitando enviar contenido sensible a un servicio externo. El límite práctico es que el corpus y las consultas deben estar en inglés.
- Deduplicación de corpus: calcular embeddings de registros y agrupar por similitud coseno para eliminar duplicados o casi duplicados antes de alimentar un pipeline de entrenamiento o un índice.
- Reranking de candidatos: recuperar un top-50 con un índice aproximado y reordenar ese pool con el modelo; el autor reporta que el estudio completo con chunks de 2000 caracteres y pool de 50 igualó las cifras de aciertos de la fuente en float16.
- Enrutado y clasificación zero-shot: comparar el embedding de una consulta o ticket contra embeddings de descripciones de categorías y asignar la más próxima, sin entrenar un clasificador específico.
- Caché semántica de respuestas de un LLM: almacenar embeddings de preguntas previas y servir una respuesta cacheada cuando la similitud supera un umbral, reduciendo llamadas al modelo generativo en un asistente local.
- Evaluación de retrieval y tests de regresión: usar la variante int8 como referencia rápida frente al modelo base para detectar degradaciones en el pipeline de búsqueda antes de desplegar cambios en el índice.
- Clustering de feedback de usuarios: agrupar reseñas o mensajes en inglés por temática a partir de los vectores y técnicas de clustering sobre embeddings.

## Benchmarks y rendimiento

| Prueba | Conjunto de evaluación | Metrica | Resultado |
|---|---|---|---|
| Solapamiento de vecinos top-8 frente a la fuente float16 | Estudio de retrieval Premisa: 180 preguntas, pools de 50 candidatos | Overlap top-8 | 98 % |
| Estudio completo, chunks de 2000 caracteres, pool 50 | Estudio de retrieval Premisa | Aciertos entregados (delivered-hit) | Iguala las cifras de la fuente float16 |
| MMLU, HumanEval, GSM8K, MTEB, etc. | — | — | No se han publicado resultados de benchmarks en la información disponible |

Las dos primeras filas son mediciones del autor, declaradas explícitamente como previas a adjudicación y no como afirmaciones de calidad. No hay evaluación independiente ni resultados en los benchmarks habituales de la información proporcionada.

## Requisitos de hardware

- VRAM/memoria estimada: con 149 M de parámetros en int8, los pesos rondan los 150 MB; el repositorio completo ocupa 0,2 GB, incluyendo tokenizer y configuraciones.
- GPU recomendadas: ninguna GPU NVIDIA está soportada de forma nativa, ya que el formato es MLX. El destino es Apple Silicon (serie M1 o posterior) con MLX; para CUDA debe usarse el modelo base en transformers.
- Cabe en hardware de consumo: sí, en cualquier Mac con Apple Silicon, incluidas configuraciones con 8 GB de memoria unificada.
- Opciones de despliegue: el servidor de tareas del fork de mlx-vlm, con `python -m mlx_vlm.server --embedding-model` o `--reranker-model` apuntando al directorio del modelo. No se documentan rutas para vLLM, TGI, llama.cpp ni Ollama en este repositorio.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un encoder de 149 M en int8, la latencia esperada es baja, pero no hay cifras medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| caslca/gte-modernbert-base-mlx-8bit | 149 M | No disponible (arquitectura ModernBERT del base) | safetensors MLX int8 | Apache 2.0 | Hugging Face, 0 descargas |
| Alibaba-NLP/gte-modernbert-base | 149 M | No disponible en la información recogida | safetensors (transformers) | Apache 2.0 | Hugging Face, modelo de referencia |
| Otras variantes de la familia gte-modernbert (embedding y rerank) | No disponible | No disponible | No disponible | No disponible | Citadas en la búsqueda web (ModelScope, ModelBeacon), sin datos verificados |

La alternativa directa es el modelo base sin cuantizar: misma arquitectura y mismo número de parámetros, mayor peso en disco y en memoria, pero compatible con el ecosistema transformers y sentence-transformers y sin la pérdida de precisión introducida por la cuantización. Para stacks CUDA, el modelo base es la opción sensata. No se dispone de datos verificados de otros embedders de escala similar en la información proporcionada.

## Limitaciones y advertencias

- Idioma: solo inglés. Cualquier uso con castellano u otras lenguas queda fuera del alcance declarado por el autor.
- Pérdida por cuantización: el 98 % de solapamiento top-8 implica que aproximadamente 1 de cada 50 vecinos cambia respecto a float16; en recuperación de alta precisión puede ser relevante.
- Las métricas del estudio las aporta el propio autor, sin revisión independiente, y él mismo indica que son mediciones previas a adjudicación y no afirmaciones de calidad.
- Formato propietario del runtime: los pesos están cuantizados en MLX, por lo que no se cargan directamente con transformers, sentence-transformers, vLLM ni llama.cpp.
- Sesgos: no hay información sobre sesgos en la información disponible; al ser un modelo entrenado sobre corpus en inglés, es esperable que herede los sesgos de la fuente, pero no se documenta su magnitud.
- Riesgo de alucinación: no aplica en el sentido generativo, pero un embedder puede producir falsos positivos de similitud y recuperar pasajes semánticamente próximos pero incorrectos; conviene validar con umbrales y reranking.
- Truncamiento: si la longitud de contexto real es de 8192 tokens, los documentos más largos se truncan y pierden información; este extremo no está documentado en el repositorio y debería verificarse antes de producción.
- Prefijos de instrucción: no se indica en el repositorio si el modelo requiere prefijos de tarea para consultas asimétricas, algo habitual en la familia GTE; debe comprobarse contra la model card del modelo fuente para no degradar el retrieval.
- Licencia: Apache 2.0 permite uso comercial, pero los pesos derivados quedan sujetos a los términos del modelo fuente; conviene conservar la atribución a Alibaba y a la revisión citada.
- Madurez: 0 descargas y 0 likes en el momento de la ficha, sin comunidad que haya validado el artefacto; el soporte del servidor depende de un fork concreto de mlx-vlm.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/caslca/gte-modernbert-base-mlx-8bit
- Modelo base: https://huggingface.co/Alibaba-NLP/gte-modernbert-base
- Ficha API del modelo base: https://huggingface.co/api/models/Alibaba-NLP/gte-modernbert-base
- Ficha en ModelScope: https://www.modelscope.cn/models/iic/gte-modernbert-base/summary
- Análisis de capacidades y benchmarks: https://aiportalx.com/alibaba/gte-modernbert
- Ficha en ModelBeacon: https://modelbeacon.com/model/Alibaba-NLP/gte-modernbert-base
