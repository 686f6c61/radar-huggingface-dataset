# Jgmorenof/plots-multilingual-e5-base

## Resumen

`plots-multilingual-e5-base` es un modelo de embeddings de frases obtenido mediante fine-tuning de `intfloat/multilingual-e5-base` sobre el dataset PLOTS, un corpus de pares de resúmenes argumentales de Wikipedia escritos de forma independiente para la misma película en distintos idiomas. Lo desarrolla Jose G. Moreno (usuario `Jgmorenof`) junto con los coautores del dataset PLOTS, y su objetivo es la similitud narrativa y la recuperación cross-lingüe: emparejar historias por su contenido semántico en lugar de por palabras o nombres propios coincidentes.

El modelo parte de una arquitectura XLM-RoBERTa (transformer encoder) con 278.043.648 parámetros y una ventana máxima de entrada de 512 tokens, la misma del modelo base. La innovación no está en la arquitectura, sino en el régimen de entrenamiento: 197.694 pares de resúmenes argumentales en distintos idiomas, con pérdida contrastiva simétrica (InfoNCE bidireccional) y gradient caching, lo que lo orienta específicamente al escenario "tip-of-the-tongue" (ToT), en el que el usuario describe una historia que no recuerda cómo se titula.

Es relevante ahora porque acompaña al lanzamiento de SemEval-2026 Task 4 y al dataset PLOTS, y porque demuestra mejoras sustanciales frente al modelo base zero-shot en recuperación con entidades enmascaradas y en TREC ToT 2023, a costa de un rendimiento ligeramente inferior en precisión de similitud narrativa pura. La licencia es MIT, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (transformer encoder), fine-tuning de `intfloat/multilingual-e5-base` |
| Parametros totales | 278.043.648 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens de entrada |
| Tipos de cuantizacion | No disponible (el repo solo publica safetensors; no se documentan variantes GGUF, ONNX ni cuantizaciones oficiales) |
| Idiomas soportados | Multilingüe (heredado de multilingual-e5-base; el dataset PLOTS cubre resúmenes en varios idiomas emparejados con inglés) |
| Licencia | MIT (los pesos conservan la licencia del modelo base; los datos PLOTS son CC BY-SA 4.0) |
| Formato de pesos | safetensors (repo de 1,1 GB) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer XLM-RoBERTa de 278 millones de parámetros, inicializado desde `intfloat/multilingual-e5-base` y afinado con `sentence-transformers`. Produce embeddings densos de frases con prefijos `query: ` y `passage: `, siguiendo la convención de la familia E5. La longitud máxima de entrada es de 512 tokens, suficiente para resúmenes argumentales de Wikipedia pero no para documentos largos.

El entrenamiento usa 197.694 pares del dataset PLOTS: cada par empareja un resumen argumental en inglés con el resumen de la misma película escrito de forma independiente en otro idioma. La función de pérdida es contrastiva simétrica (InfoNCE en ambas direcciones) con gradient caching, batch de 128, una época, learning rate 2e-05, longitud máxima de 512 tokens y semilla 13. Se excluyeron del entrenamiento las películas de SemEval-2026 Task 4 y de los targets de train y dev de TREC ToT 2023, de modo que la evaluación reportada es libre de fuga de datos. No se documenta uso de RLHF ni DPO; es un fine-tuning puramente contrastivo.

## Capacidades

- Generación de embeddings de frases para similitud semántica y recuperación (pipeline `sentence-similarity`).
- Similitud narrativa: empareja historias descritas con palabras distintas, no solo con léxico o nombres coincidentes.
- Recuperación cross-lingüe: consulta en un idioma contra documentos en otro (p. ej. consulta en castellano contra resúmenes en inglés).
- Escenario tip-of-the-tongue: identificación de una película a partir de una descripción vaga o parcial de su argumento.
- Robustez parcial a entidades enmascaradas: mantiene señal útil cuando se eliminan nombres propios del texto (Full M = 0,770; Last M = 0,061).
- Soporte multilingüe heredado del modelo base.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio: es un modelo de embeddings, no generativo.

## Casos de uso

- Búsqueda de películas por descripción vaga: el usuario describe lo que recuerda del argumento y el modelo recupera el resumen correcto entre un corpus de resúmenes en inglés, gracias a su entrenamiento específico en similitud narrativa.
- Recuperación cross-lingüe en catálogos: indexar resúmenes en inglés y consultar en castellano, francés u otros idiomas sin traducción intermedia, aprovechando los pares multilingües de PLOTS.
- Deduplicación y agrupación de fichas de películas: detectar entradas que describen la misma obra con redacciones distintas, útil en bases de datos cinematográficas y wikis.
- Sistemas de recomendación basados en trama: calcular similitud entre la descripción de una película vista y el catálogo para sugerir títulos con argumentos afines, no solo por género o metadatos.
- Evaluación de sistemas de recuperación narrativa: servir como baseline o componente en pipelines de SemEval-2026 Task 4 y TREC ToT, donde el objetivo es localizar la obra descrita.
- Moderación y detección de coincidencias de contenido: comparar descripciones enviadas por usuarios contra un corpus de referencia para identificar obras concretas pese a reformulaciones.
- Análisis de adaptaciones y remakes: emparejar tramas de películas distintas que comparten estructura narrativa, apoyándose en la invariancia a nombres y entidades.

## Benchmarks y rendimiento

Datos publicados en la model card. NS es la precisión en los 355 triples de test leak-free de SemEval-2026 Task 4 track-B. PLOTS-IR es nDCG@10 sobre las consultas de test (M indica entidades enmascaradas). ToT es TREC ToT 2023 dev.

| Metrica | Este modelo | multilingual-e5-base zero-shot |
|---|---|---|
| NS accuracy | 0,642 | 0,654 |
| PLOTS-IR Full | 0,985 | 0,729 |
| PLOTS-IR Full M | 0,770 | 0,378 |
| PLOTS-IR First | 0,793 | 0,504 |
| PLOTS-IR Last | 0,357 | 0,157 |
| PLOTS-IR Last M | 0,061 | 0,032 |
| ToT nDCG@10 | 0,098 | 0,022 |
| ToT R@100 | 0,313 | 0,080 |

El fine-tuning mejora de forma clara la recuperación (Full 0,985 frente a 0,729; ToT R@100 0,313 frente a 0,080) y la robustez a entidades enmascaradas, pero pierde ligeramente en precisión de similitud narrativa pura (0,642 frente a 0,654). El rendimiento con entidades enmascaradas en la posición final sigue siendo bajo (0,061).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB solo de pesos, más overhead de activaciones y tokenizador; en la práctica 2-3 GB para lotes pequeños.
- En fp16: alrededor de 0,6 GB de pesos; cuantización a int8 no está documentada oficialmente pero es viable con herramientas de sentence-transformers.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para lotes moderados; A100/H100 solo necesarias para indexación masiva a gran throughput.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o más; también puede ejecutarse en CPU para volúmenes pequeños.
- Opciones de despliegue: `sentence-transformers`, Text Embeddings Inference (TEI, etiqueta `text-embeddings-inference` en el repo), endpoints compatibles, y exportación a ONNX para servir.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| plots-multilingual-e5-base | 278 M | 512 | Similitud narrativa cross-lingüe (fine-tuning PLOTS) | MIT | HuggingFace |
| intfloat/multilingual-e5-base | 278 M | 512 | Embeddings multilingües generales | MIT | HuggingFace |
| intfloat/multilingual-e5-large | 560 M | 512 | Embeddings multilingües generales, mayor capacidad | MIT | HuggingFace |
| Modelos de recuperación densa multilingües tipo BGE-M3 | no disponible | no disponible | Recuperación multilingüe y multi-vector | no disponible | HuggingFace |

Frente al modelo base, este fine-tuning gana en recuperación y robustez a entidades enmascaradas, pero no en precisión de similitud narrativa pura. Frente a `multilingual-e5-large`, este modelo es más ligero y especializado en tramas, mientras que el large es más generalista.

## Limitaciones y advertencias

- Es un modelo de embeddings, no generativo: no produce texto, no razona de forma multi-paso y no soporta tool calling.
- Ventana de 512 tokens: los resúmenes o descripciones más largas deben truncarse o dividirse.
- Pérdida de precisión en similitud narrativa pura frente al modelo base zero-shot (0,642 frente a 0,654 en NS).
- Rendimiento bajo cuando las entidades enmascaradas aparecen al final del texto (Last M = 0,061); la señal depende en parte de la posición de la información.
- Entrenado sobre resúmenes argumentales de Wikipedia: puede generalizar mal a otros dominios narrativos (guiones, sinopsis comerciales, reseñas).
- El dataset PLOTS está en CC BY-SA 4.0; si se redistribuyen derivados de los datos, deben respetarse las condiciones de atribución y compartir igual.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de uso en producción ni validación comunitaria independiente.
- Riesgo de sesgo heredado del corpus de Wikipedia y de la selección de películas del dataset, no documentado por el autor.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos en similitud: tramas estructuralmente parecidas pueden puntuar alto sin ser la misma obra.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jgmorenof/plots-multilingual-e5-base
- Dataset PLOTS: https://huggingface.co/datasets/Jgmorenof/PLOTS
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-base
- Cita del dataset (BibTeX en la model card): Moreno, Hamdi, Boros, Jatowt, Bordea, González-Gallardo y Doucet, "PLOTS -- Same Story, Different Words: Paired Plot Outlines for Narrative Similarity and Retrieval", 2026.
