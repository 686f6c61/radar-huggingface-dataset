# MCINext/Hakim-unsup

## Resumen

Hakim-unsup es un modelo de embeddings de texto en persa (farsi) desarrollado por MCINext como parte del proyecto Hakim. Se trata de un checkpoint intermedio de aproximadamente 124 millones de parametros, obtenido tras la fase de preentrenamiento sobre texto persa y una etapa de aprendizaje contrastivo no supervisado. A diferencia de sus hermanos Hakim y Hakim-small, no pasa por la fase posterior de ajuste supervisado con instrucciones, por lo que representa el estado del pipeline antes de la especializacion en tareas concretas.

El modelo resuelve el problema de generar representaciones semanticas densas de texto persa sin depender de pares etiquetados manualmente, apoyandose en unos 5 millones de pares construidos automaticamente (documento-titulo, FAQ, pregunta-respuesta, titulo-resumen de articulos y traducciones automaticas de MS MARCO, SAMSum y AdversarialQA). Es relevante en el contexto de la recuperacion de informacion y la similitud semantica en un idioma con relativamente pocos recursos como el persa, donde los modelos multilingues genericos suelen rendir por debajo de los especializados.

La principal advertencia es que se trata de un modelo propietario y de pesos cerrados: los pesos no estan publicados y la API experimental de inferencia que se ofrecia ha sido retirada. El repositorio se mantiene unicamente como documentacion de investigacion (metodologia y resultados de evaluacion) vinculada al informe tecnico arXiv:2505.08435.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (encoder) para embeddings de frases; detalles internos no disponibles |
| Parametros totales | Aproximadamente 124 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos no publicados) |
| Idiomas soportados | Persa (farsi, `fa`) |
| Licencia | No disponible (modelo propietario, pesos cerrados) |
| Formato de pesos | No disponible (pesos no publicados) |

## Arquitectura y entrenamiento

Hakim-unsup es un encoder transformer de aproximadamente 124M de parametros orientado a la produccion de embeddings de frases. El entrenamiento se estructura en dos fases. La primera es un preentrenamiento sobre un corpus persa compuesto por Corpesia (11.000 millones de tokens procedentes de 46 sitios web persas de 21 dominios, incluyendo noticias, salud, religion y tecnologia), hmBlogs (6.800 millones de tokens de aproximadamente 20 millones de entradas de blogs persas) y 8,5 millones de consultas de busqueda anonimizadas.

La segunda fase es un aprendizaje contrastivo no supervisado sobre Pairsia-unsup, un conjunto de unos 5 millones de pares de texto persa que incluye pares documento-titulo, FAQ, pregunta-respuesta, titulo-resumen de articulos cientificos y versiones traducidas automaticamente de MS MARCO, SAMSum y AdversarialQA. El objetivo contrastivo permite aprender representaciones semanticas a partir de pares construidos sin anotacion humana. No se aplica la fase posterior de ajuste supervisado con instrucciones (Pairsia-sup) que si reciben Hakim y Hakim-small, lo que explica su menor rendimiento en tareas de clasificacion y resumen frente a estos.

## Capacidades

- Generacion de embeddings de texto persa para similitud semantica y recuperacion de informacion.
- Busqueda semantica y recuperacion densa (dense retrieval) sobre documentos en farsi.
- Clasificacion de texto y agrupamiento (clustering) por similitud de representaciones.
- Reranking de pares de textos mediante puntuacion de similitud.
- Deteccion de duplicados y near-duplicates en corpus persas.
- No soporta tool calling ni function calling (es un modelo de embeddings, no generativo).
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al persa; no se documenta soporte de otros idiomas.

## Casos de uso

- Busqueda semantica en sitios web persas: indexar articulos, blogs y paginas de noticias con embeddings y recuperar por similitud semantica en lugar de coincidencia lexica, aprovechando el preentrenamiento sobre Corpesia y hmBlogs.
- Motor de preguntas frecuentes (FAQ): emparejar la consulta del usuario con la entrada de FAQ mas cercana semanticamente, gracias al entrenamiento contrastivo sobre pares pregunta-respuesta.
- Deduplicacion de corpus persas: calcular embeddings de documentos y agrupar los que superan un umbral de similitud para eliminar duplicados en pipelines de limpieza de datos.
- Reranking en pipelines de recuperacion: usar las puntuaciones de similitud del modelo para reordenar los candidatos devueltos por un recuperador lexical (por ejemplo BM25) en un sistema de busqueda en farsi.
- Agrupamiento tematico de noticias: clusterizar articulos por tematica (politica, salud, tecnologia) sin etiquetas, apoyandose en la capacidad de clustering medida en FaMTEB.
- Investigacion en NLP persa: servir como linea base no supervisada para comparar el impacto del ajuste supervisado frente a Hakim y Hakim-small en experimentos academicos.
- Moderacion o triaje de contenido: clasificar textos por similitud con prototipos de categorias predefinidas en un sistema de revision de contenido en persa.

## Benchmarks y rendimiento

Resultados reportados en la evaluacion FaMTEB de mayo de 2025 (informe tecnico del proyecto, no un leaderboard actualizado):

| Modelo | Media | Classification | Clustering | PairClass. | Reranking | Retrieval | STS | Summarization |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Hakim | 73,81 | 84,56 | 70,46 | 89,75 | 69,46 | 40,43 | 76,62 | 85,41 |
| Hakim-small | 70,45 | 80,19 | 66,31 | 87,41 | 67,30 | 38,05 | 75,53 | 78,40 |
| **Hakim-unsup** | **64,56** | **60,65** | **58,89** | **86,41** | **67,56** | **37,71** | **79,36** | **61,34** |
| BGE-m3 | 65,29 | 58,75 | 57,73 | 85,21 | 74,56 | 43,38 | 76,35 | 61,07 |
| Jina-embeddings-v3 | 64,53 | 59,93 | 59,15 | 83,71 | 61,26 | 43,51 | 78,65 | 65,50 |
| multilingual-e5-large | 64,40 | 59,86 | 57,19 | 84,42 | 74,34 | 42,98 | 75,38 | 56,61 |
| GTE-multilingual-base | 63,64 | 56,07 | 57,28 | 84,58 | 69,72 | 41,22 | 75,75 | 60,88 |
| multilingual-e5-base | 62,93 | 57,62 | 56,52 | 84,04 | 72,07 | 41,20 | 74,45 | 54,58 |
| Tooka-SBERT | 60,65 | 59,40 | 56,45 | 87,04 | 58,29 | 27,86 | 76,42 | 59,06 |

Hakim-unsup destaca en STS (79,36, la puntuacion mas alta de la tabla) y queda por debajo de los modelos multilingues genericos en clasificacion y resumen, coherente con la ausencia de ajuste supervisado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un encoder de aproximadamente 124M de parametros se situaria en el orden de cientos de MB en fp16, pero no hay datos publicados.
- GPU recomendadas: no disponible; un modelo de este tamano es ejecutable en GPU consumer, pero al no publicarse los pesos no puede confirmarse.
- Cabe en GPU consumer: previsiblemente si por tamano, aunque los pesos no estan disponibles para su descarga.
- Opciones de despliegue: no disponible; no se ofrecen pesos en safetensors, GGUF ni otros formatos, y la API experimental ha sido retirada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media FaMTEB | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hakim-unsup | ~124M | No disponible | 64,56 | No disponible (propietario) | Pesos cerrados |
| Hakim | ~124M | No disponible | 73,81 | No disponible | Pesos publicados en HF |
| Hakim-small | ~38M | No disponible | 70,45 | No disponible | Pesos publicados en HF |
| BGE-m3 | No disponible | No disponible | 65,29 | No disponible | Pesos publicados en HF |
| Jina-embeddings-v3 | No disponible | No disponible | 64,53 | No disponible | Pesos publicados en HF |
| multilingual-e5-large | No disponible | No disponible | 64,40 | No disponible | Pesos publicados en HF |

## Limitaciones y advertencias

- Modelo propietario de pesos cerrados: no es posible descargarlo, ejecutarlo localmente ni integrarlo en produccion; la API experimental ha sido discontinuada.
- Sin ajuste supervisado: rinde claramente peor que Hakim y Hakim-small en clasificacion (60,65 frente a 84,56 y 80,19) y resumen (61,34 frente a 85,41 y 78,40).
- Rendimiento moderado en recuperacion (37,71), por debajo de BGE-m3 (43,38) y Jina-embeddings-v3 (43,51).
- Uso limitado al persa; no se documenta soporte de otros idiomas.
- No se publican detalles de sesgos, riesgo de alucinacion (no es generativo) ni restricciones de licencia para uso comercial; la licencia figura como no disponible.
- La evaluacion FaMTEB corresponde a mayo de 2025 y no es un leaderboard actualizado; los resultados no deben interpretarse como posiciones vigentes.
- Al ser un checkpoint intermedio de investigacion, no esta pensado como modelo de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MCINext/Hakim-unsup
- Informe tecnico (arXiv): https://arxiv.org/abs/2505.08435
- Modelo principal Hakim: https://huggingface.co/MCINext/Hakim
- Modelo compacto Hakim-small: https://huggingface.co/MCINext/Hakim-small
