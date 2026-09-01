# pR0jekt-pR0digee/SOFIA-v2-agi

## Resumen

SOFIA (SOFt Intel Artificial) es un modelo de embeddings de frases desarrollado por Zunvra.com, publicado en Hugging Face bajo el identificador `pR0jekt-pR0digee/SOFIA-v2-agi`. Está construido sobre la arquitectura MPNet del modelo base `sentence-transformers/all-mpnet-base-v2` y ha sido afinado mediante Low-Rank Adaptation (LoRA) con una estrategia de doble pérdida (cosine similarity y triplet loss). El modelo genera representaciones vectoriales normalizadas de 1024 dimensiones, optimizadas para tareas de similitud semántica, recuperación de información y búsqueda en sistemas RAG.

Con 109,5 millones de parámetros totales y una longitud máxima de secuencia de 384 tokens, SOFIA se posiciona como una solución ligera (el repositorio ocupa 0,4 GB) y eficiente para producción. Su licencia Apache 2.0 permite uso comercial sin restricciones. La relevancia actual radica en la creciente demanda de modelos de embeddings compactos y de alta calidad para pipelines de generación aumentada por recuperación (RAG), clasificación de intenciones y sistemas de búsqueda semántica, donde un equilibrio entre tamaño, velocidad y precisión es crítico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MPNet (transformer encoder, 12 capas, 768 dimensiones ocultas, 12 cabezas de atencion) |
| Parametros totales | 109.486.464 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 384 tokens |
| Tipos de cuantizacion | No disponible (pesos en safetensors, se puede cuantizar con herramientas externas) |
| Idiomas soportados | Ingles (entrenado principalmente en ingles; el autor menciona "zero-shot performance on non-English languages" sin garantias) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SOFIA se basa en el encoder MPNet, que emplea un preentrenamiento basado en permutaciones para mejorar la comprension contextual. La arquitectura incluye un encoder transformer de 12 capas con 768 dimensiones ocultas, seguido de una capa de pooling medio (mean pooling) para obtener representaciones a nivel de frase. Sobre este backbone se aplican adaptadores LoRA (rango 16, alpha 32) en las capas de atencion y feed-forward, lo que permite un afinado eficiente en parametros. Finalmente, una cabeza de proyeccion densa mapea las representaciones de 768 a 1024 dimensiones, seguidas de normalizacion L2.

El entrenamiento utilizo un conjunto de datos curado de multiples fuentes: STS-Benchmark (5.749 pares con puntuaciones de similitud), PAWS (2.470 pares de parafrasis), Banking77 (500 ejemplos de intenciones bancarias) y el dataset mteb/nq para recuperacion. Se aplico mineria de negativos duros con BM25, generando aproximadamente 26.145 pares de entrenamiento. La funcion de perdida combina cosine similarity loss y triplet loss con margen 0,2. Se entrenaron 3 epocas sin conjunto de validacion. La model card menciona proyecciones opcionales de 3072 y 4096 dimensiones, aunque el repositorio principal usa 1024.

## Capacidades

- Generacion de embeddings de frases y parrafos para similitud semantica, recuperacion y clustering.
- Busqueda semantica y recuperacion de informacion en sistemas RAG.
- Clasificacion de intenciones y deteccion de duplicados.
- Comparacion de documentos y analisis de similitud textual.
- Soporte de tool calling: no aplicable (es un modelo de embeddings, no un LLM generativo).
- Capacidades multilingues: el autor afirma rendimiento zero-shot en idiomas no ingleses, pero no se proporcionan evaluaciones; el entrenamiento se realizo en ingles.
- No incluye capacidades de vision, audio o generacion de texto.

## Casos de uso

- Busqueda semantica en motores de recomendacion: SOFIA puede indexar catalogos de productos y recuperar items relevantes a partir de consultas en lenguaje natural, gracias a su ventana de 384 tokens que permite procesar descripciones completas.
- Sistemas RAG para atencion al cliente: integrado en pipelines de generacion aumentada, permite recuperar pasajes relevantes de una base de conocimiento corporativa antes de pasar al modelo generativo, reduciendo alucinaciones.
- Clasificacion de tickets de soporte: con sus representaciones de 1024 dimensiones, se puede entrenar un clasificador ligero sobre las embeddings para enrutar incidencias a los equipos adecuados (el dataset Banking77 sugiere un uso directo en dominios de banca).
- Moderacion de contenido: deteccion de contenido duplicado o similar en foros, redes sociales o bases documentales mediante comparacion de coseno.
- Analisis academico: busqueda de articulos cientificos similares o deteccion de plagio a partir de similitud entre resumenes y textos completos.
- Personalizacion de recomendaciones: generar embeddings de preferencias de usuario y compararlas con embeddings de items para sugerir contenido relevante en plataformas de streaming o e-commerce.
- Sistemas de preguntas y respuestas: indexar FAQs y recuperar la respuesta mas cercana a una consulta del usuario mediante similitud coseno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una seccion "Evaluation" y "Comparison to Baselines", pero el texto proporcionado no incluye los datos numericos. No se dispone de puntuaciones en MMLU, HumanEval, MTEB u otros conjuntos de referencia.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~110 MB en FP32, la inferencia requiere menos de 1 GB de VRAM. Con cuantizacion a int8 o float16, el consumo se reduce a aproximadamente 55-60 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluyendo GTX 1650, RTX 3050 o incluso CPU (inferencia aceptable para volumenes bajos).
- Caben en GPUs de consumo: si, en todas las GPUs modernas, incluyendo integradas de gama media.
- Opciones de despliegue: compatible con la libreria sentence-transformers, Text Embeddings Inference (TEI) de Hugging Face, y se puede servir con FastAPI o contenedores Docker. Tambien es compatible con endpoints de Hugging Face.
- Latencia y throughput: no se han publicado mediciones oficiales. Como referencia, modelos similares de 109M parametros procesan cientos de frases por segundo en una GPU moderna (por ejemplo, RTX 3090), con latencias por lote inferiores a 10 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension embedding | Licencia | Notas |
|---|---|---|---|---|---|
| SOFIA-v2-agi | 109,5 M | 384 tokens | 1024 | Apache 2.0 | Basado en MPNet, afinado con LoRA y triplet loss |
| all-mpnet-base-v2 | 109,5 M | 384 tokens | 768 | Apache 2.0 | Modelo base sin afinado especifico |
| bge-base-en-v1.5 | 109 M | 512 tokens | 768 | MIT | Optimizado para recuperacion, mejor rendimiento en MTEB |
| gte-base | 109 M | 512 tokens | 768 | Apache 2.0 | Entrenado con datos mas amplios, buen rendimiento en MTEB |

No se dispone de datos de rendimiento comparativo de SOFIA frente a estos modelos. La eleccion entre ellos depende de la tarea especifica; bge-base-en-v1.5 y gte-base suelen tener mejores resultados en benchmarks de recuperacion, mientras que SOFIA destaca por su doble perdida y proyeccion a 1024 dimensiones (mayor capacidad de representacion).

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse principalmente con datos en ingles (STSB, PAWS, Banking77), puede mostrar un rendimiento degradado en otros idiomas, a pesar de la afirmacion de zero-shot del autor.
- Riesgo de alucinacion: no aplica, al ser un modelo de embeddings no genera texto.
- Limitaciones de contexto: la ventana de 384 tokens puede ser insuficiente para documentos largos; se recomienda truncar o dividir el texto.
- Limitaciones de idioma: no se proporcionan evaluaciones multilingues; el uso en produccion fuera del ingles debe validarse previamente.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero el autor (Zunvra.com) no ofrece garantias sobre el rendimiento.
- Cualquier uso en produccion debe incluir una evaluacion propia con datos reales, ya que no hay benchmarks publicados.
- La model card menciona una version v1.0, mientras que el repositorio se llama "v2-agi"; no se aclara la diferencia entre ambas versiones.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/pR0jekt-pR0digee/SOFIA-v2-agi
- Copia del modelo en Hugging Face (usuario alternativo): https://huggingface.co/MaliosDark/SOFIA-v2-agi
- Repositorio de codigo en GitHub (relacionado): https://github.com/MaliosDark/sofi-ai
