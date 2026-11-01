# Jgmorenof/plots-qwen3-embedding-8b-lora

## Resumen

`Jgmorenof/plots-qwen3-embedding-8b-lora` es un adaptador LoRA de rango 16 sobre el modelo de embeddings `Qwen/Qwen3-Embedding-8B`, desarrollado por Jose G. Moreno y colaboradores en el marco del dataset PLOTS (SemEval-2026 Task 4). El objetivo es especializar un modelo de embeddings multilingüe de propósito general en la tarea de similitud narrativa: emparejar resúmenes de tramas de películas escritos de forma independiente en distintos idiomas, priorizando la coincidencia de historia frente a la coincidencia léxica de nombres propios o términos superficiales.

El adaptador se entrena con 20.000 pares de resúmenes de Wikipedia (trama en inglés emparejada con la trama del mismo filme en otro idioma), usando pérdida contrastiva simétrica InfoNCE con gradient caching. El resultado es un modelo que mejora al base en recuperación cross-lingual de tramas y en tareas de "tip-of-the-tongue" (descripciones parciales de películas que el usuario recuerda a medias), manteniendo la licencia Apache 2.0 del modelo base.

Es relevante porque demuestra que un ajuste LoRA ligero (el repositorio ocupa 0,1 GB) puede mejorar de forma medible un embedding de 8B en dominios narrativos específicos, sin reentrenar el modelo completo ni sacrificar el rendimiento general del base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer de embeddings Qwen3-Embedding-8B |
| Parámetros totales | No disponible (el adaptador LoRA es de rango 16; el base es de 8B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens de entrada máxima durante el entrenamiento (contexto del base no especificado en la información disponible) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Multilingüe (entrenado con pares inglés-otro idioma) |
| Licencia | Apache 2.0 (pesos); datos de entrenamiento PLOTS bajo CC BY-SA 4.0 |
| Formato de pesos | Safetensors (adaptador LoRA, requiere modelo base y `peft`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-Embedding-8B, un modelo de embeddings basado en transformer. El ajuste emplea LoRA de rango 16 con `peft`, entrenado durante 1 época sobre 20.000 pares (subconjunto aleatorio del dataset PLOTS) con batch 128, learning rate 0,0001, longitud máxima de entrada de 512 tokens y semilla 13. La función de pérdida es InfoNCE contrastiva simétrica en ambas direcciones (query→documento y documento→query) con gradient caching para optimizar memoria.

Los pares de entrenamiento consisten en resúmenes de trama de Wikipedia escritos de forma independiente: la trama en inglés emparejada con la trama del mismo filme en otro idioma. Se excluyen explícitamente las películas de SemEval-2026 Task 4 y de TREC ToT 2023 (targets de train y dev) para evitar filtración de datos en la evaluación. No se menciona uso de RLHF ni DPO; el entrenamiento es puramente contrastivo supervisado.

## Capacidades

- Generación de embeddings de texto para similitud semántica y recuperación (pipeline `sentence-similarity`).
- Similitud narrativa: emparejamiento de historias por contenido argumental, no por nombres o términos superficiales.
- Recuperación cross-lingual: consulta en un idioma contra documentos en otro.
- Recuperación tipo "tip-of-the-tongue": localizar una película a partir de una descripción parcial o vaga.
- Soporte de prompts de instrucción diferenciados por tarea (recuperación asimétrica, similitud simétrica, ToT).
- Integración con `sentence-transformers` mediante `load_adapter`.
- Capacidades multilingües heredadas del modelo base Qwen3-Embedding-8B.

## Casos de uso

- Búsqueda cross-lingual de películas: un usuario consulta en castellano la trama de una película y el sistema recupera el artículo de Wikipedia en inglés del mismo filme, gracias al entrenamiento con pares bilingües.
- Recomendación por similitud argumental: emparejar películas con tramas parecidas aunque los títulos y personajes no compartan términos, usando la similitud simétrica con el prompt "Retrieve semantically similar text".
- Resolución de "tip-of-the-tongue": un usuario describe vagamente una película que recuerda a medias y el modelo recupera la página correcta; en la evaluación ToT alcanza nDCG@10 de 0,333 frente a 0,241 del base.
- Deduplicación y alineación de catálogos: detectar entradas duplicadas o equivalentes entre bases de datos de sinopsis en distintos idiomas.
- Enriquecimiento de bases de conocimiento: enlazar resúmenes de tramas de fuentes distintas (Wikidata, IMDb, Wikipedia) que describen la misma obra.
- Análisis literario y cinematográfico comparado: agrupar obras por estructura narrativa para estudios de motivos y arquetipos.
- Sistemas de preguntas y respuestas sobre cine: recuperar el filme relevante antes de generar una respuesta con un LLM.

## Benchmarks y rendimiento

Resultados reportados en la model card. NS: accuracy sobre 355 triples de test de SemEval-2026 Task 4 track-B (sin filtración). PLOTS-IR: nDCG@10 sobre consultas de test (M: entidad enmascarada). ToT: consultas dev de TREC ToT 2023.

| Métrica | Este modelo | Qwen3-Embedding-8B zero-shot |
|---|---|---|
| NS accuracy | 0,670 | 0,642 |
| PLOTS-IR Full | 0,996 | 0,991 |
| PLOTS-IR Full M | 0,947 | 0,912 |
| PLOTS-IR First | 0,876 | 0,848 |
| PLOTS-IR Last | 0,528 | 0,512 |
| PLOTS-IR Last M | 0,176 | 0,183 |
| ToT nDCG@10 | 0,333 | 0,241 |
| ToT R@100 | 0,660 | 0,580 |

La mejora es consistente en casi todas las métricas, con la excepción de PLOTS-IR Last M, donde el adaptador queda ligeramente por debajo del base (0,176 frente a 0,183).

## Requisitos de hardware

- El adaptador LoRA ocupa 0,1 GB, pero requiere cargar el modelo base Qwen3-Embedding-8B completo para inferencia.
- VRAM estimada para el base en precisión completa: no disponible en la información proporcionada; para un modelo de 8B en FP16 se sitúa típicamente en torno a 16 GB, y en cuantización de 8 bits o 4 bits baja sustancialmente, aunque estos valores no se confirman en la ficha del autor.
- GPU recomendadas: no especificadas por el autor; por tamaño del base, cabría esperar A100, H100 o RTX 4090 para FP16, sin dato confirmado.
- Despliegue: `sentence-transformers` con `load_adapter` y `peft`; compatible con endpoints (tag `endpoints_compatible`). Otras opciones como vLLM, llama.cpp, Ollama o TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | NS acc. | ToT nDCG@10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este adaptador (PLOTS LoRA) | Base 8B + LoRA r16 | 512 (entrenamiento) | 0,670 | 0,333 | Apache 2.0 | HuggingFace |
| Qwen3-Embedding-8B zero-shot | 8B | No disponible | 0,642 | 0,241 | Apache 2.0 | HuggingFace |
| Otros modelos de similitud narrativa | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa se limita al modelo base, único punto de referencia publicado en la información disponible.

## Limitaciones y advertencias

- El adaptador no es autónomo: requiere el modelo base Qwen3-Embedding-8B y la librería `peft`.
- Entrenado con un máximo de 512 tokens de entrada; resúmenes más largos pueden truncarse y perder información.
- El rendimiento en PLOTS-IR Last M (entidad enmascarada en la parte final del texto) es ligeramente inferior al base, lo que sugiere que el ajuste no mejora uniformemente todas las condiciones.
- El entrenamiento se realizó con pares inglés-otro idioma; el comportamiento en pares entre dos idiomas distintos del inglés no está evaluado en la información disponible.
- Riesgo de sesgo heredado del corpus de Wikipedia y del modelo base, no analizado por el autor.
- Riesgo de alucinación no aplica directamente (es un modelo de embeddings, no generativo), pero sí de falsos positivos en la recuperación.
- Uso comercial permitido por la licencia Apache 2.0 de los pesos; los datos PLOTS están bajo CC BY-SA 4.0, lo que puede imponer condiciones de atribución y compartir igual si se redistribuyen derivados del dataset.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación externa muy limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jgmorenof/plots-qwen3-embedding-8b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-8B
- Dataset PLOTS: https://huggingface.co/datasets/Jgmorenof/PLOTS
