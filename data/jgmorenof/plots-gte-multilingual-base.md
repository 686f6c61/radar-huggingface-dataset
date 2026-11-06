# Jgmorenof/plots-gte-multilingual-base

## Resumen

`Jgmorenof/plots-gte-multilingual-base` es un modelo de embeddings de frases obtenido por fine-tuning de `Alibaba-NLP/gte-multilingual-base` sobre el dataset PLOTS, un corpus de pares de resúmenes argumentales de películas escritos de forma independiente en la Wikipedia en distintos idiomas (el argumento en inglés emparejado con el argumento en otra lengua). El objetivo declarado es la similitud narrativa: emparejar historias por su contenido semántico y no por coincidencias léxicas de títulos, nombres propios o entidades.

El modelo lo publica Jose G. Moreno en el contexto del dataset PLOTS y de la tarea SemEval-2026 Task 4, orientada a la recuperación cross-lingüe de tramas y al fenómeno tip-of-the-tongue (recuperar una película a partir de una descripción vaga de su argumento). Con 305.368.320 parámetros y una ventana de entrada de 512 tokens, es un encoder compacto pensado para indexación y búsqueda semántica multilingüe, no para generación de texto.

Su relevancia práctica está en que mejora de forma medible a su modelo base en cero ejemplos en todas las métricas publicadas, especialmente en recuperación con entidades enmascaradas (nDCG@10 de 0,871 frente a 0,683 en PLOTS-IR M) y en TREC ToT 2023 (nDCG@10 de 0,205 frente a 0,099). La licencia Apache 2.0 de los pesos facilita su uso comercial, con la salvedad de que los datos de entrenamiento son CC BY-SA 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (modelo base GTE multilingual); se distribuye con `custom_code` y `trust_remote_code=True` |
| Parametros totales | 305.368.320 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens de entrada máxima durante el entrenamiento |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | multilingüe (entrenado sobre pares inglés-otro idioma de Wikipedia) |
| Licencia | Apache 2.0 (pesos); datos PLOTS en CC BY-SA 4.0 |
| Formato de pesos | safetensors (repo de 1,2 GB) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo bi-encoder para similitud de frases, derivado de `Alibaba-NLP/gte-multilingual-base`. Se entrena con pérdida contrastiva simétrica in-batch (InfoNCE en ambas direcciones) con gradient caching, batch de 128, una época, learning rate 2e-05, longitud máxima de entrada de 512 tokens y semilla 13. El conjunto de entrenamiento son 197.694 pares del dataset PLOTS: resúmenes argumentales de la misma película escritos de forma independiente en inglés y en otra lengua.

La innovación principal no está en la arquitectura sino en el objetivo y en el control de fugas: se excluyen del entrenamiento las películas de SemEval-2026 Task 4 y de TREC ToT 2023 (objetivos de train y dev), de modo que las evaluaciones publicadas son leak-free. El entrenamiento busca explícitamente la coincidencia de trama frente a la coincidencia superficial de palabras o nombres, lo que se refleja en las mejoras sobre el modelo base en los escenarios con entidades enmascaradas. El uso previsto es `model.encode(..., prompt="")` con `SentenceTransformer` y `trust_remote_code=True`.

## Capacidades

- Generación de embeddings de frases multilingües para similitud semántica y recuperación (pipeline `sentence-similarity`).
- Similitud narrativa: emparejamiento de resúmenes argumentales de la misma historia escritos con palabras distintas.
- Recuperación cross-lingüe: consulta en un idioma contra documentos en otro (por ejemplo, descripción en castellano contra argumentos en inglés).
- Recuperación robusta a entidades: mantiene rendimiento alto cuando se enmascaran nombres propios y entidades (PLOTS-IR M: 0,871).
- Soporte de tip-of-the-tongue: recuperar una película a partir de una descripción parcial o vaga.
- No es un modelo generativo: no produce texto, no soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de visión ni audio.

## Casos de uso

- Búsqueda semántica de películas por descripción de trama: el usuario describe lo que recuerda de una película en cualquier idioma y el modelo recupera el argumento en inglés correspondiente; adecuado por su entrenamiento específico en similitud narrativa y su robustez a entidades enmascaradas.
- Recuperación cross-lingüe en catálogos editoriales: indexar sinopsis en inglés y consultar en castellano u otros idiomas, aprovechando que el entrenamiento empareja argumentos en distintas lenguas.
- Deduplicación y agrupación de fichas de películas: detectar que dos registros con títulos distintos describen la misma historia, usando similitud de embeddings en lugar de coincidencia de cadenas.
- Motor de recomendación por similitud argumental: construir un índice vectorial de resúmenes y recomendar películas cuya trama se parezca a la de una consulta, con nDCG@10 de 0,991 en la configuración completa del benchmark publicado.
- Enriquecimiento de bases de datos cinematográficas: alinear entradas de Wikipedia en varios idiomas para consolidar metadatos y referencias cruzadas.
- Evaluación y anotación de datasets de similitud narrativa: generar candidatos de pares para revisión humana en tareas de SemEval o TREC ToT, con la ventaja de que el modelo se entrenó excluyendo esos conjuntos de test.
- Filtrado previo en pipelines de RAG sobre documentación narrativa o de ficción: recuperar pasajes por contenido semántico cuando las consultas son descriptivas y no contienen términos exactos.

## Benchmarks y rendimiento

Datos publicados en la model card. NS: accuracy en los 355 triples leak-free del track B de SemEval-2026 Task 4; PLOTS-IR: nDCG@10 sobre las consultas de test (M: entidades enmascaradas); ToT: consultas dev de TREC ToT 2023.

| Modelo | NS acc. | Full | Full M | First | Last | Last M | ToT nDCG@10 | ToT R@100 |
|---|---|---|---|---|---|---|---|---|
| plots-gte-multilingual-base | 0,637 | 0,991 | 0,871 | 0,816 | 0,387 | 0,088 | 0,205 | 0,447 |
| gte-multilingual-base, zero-shot | 0,603 | 0,890 | 0,683 | 0,645 | 0,323 | 0,090 | 0,099 | 0,293 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no procede para un modelo de embeddings.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, unos 1,2 GB de pesos más activaciones; en fp16/bf16, aproximadamente 0,6 GB. Con batch pequeño cabe holgadamente en GPUs de 8 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB para uso interactivo; A100, H100 o L4 para indexación a gran escala con batches grandes.
- Cabe en GPU de consumo: sí, en RTX 3060, 4060, 4070, 4080 y 4090, así como en muchas iGPU con suficiente memoria compartida para batches reducidos.
- Opciones de despliegue: `sentence-transformers` (requiere `trust_remote_code=True`), Text Embeddings Inference (etiqueta `text-embeddings-inference`), endpoints compatibles de Hugging Face. No se documenta soporte GGUF ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia estructural, al ser un encoder de 305 M de parámetros con entradas de hasta 512 tokens, el coste por lote es bajo en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| plots-gte-multilingual-base | 305 M | 512 tokens | Embeddings multilingües afinados para similitud narrativa | Apache 2.0 | Hugging Face |
| Alibaba-NLP/gte-multilingual-base | no disponible en la información | no disponible en la información | Embeddings multilingües de propósito general | Apache 2.0 | Hugging Face |
| Otros modelos de embeddings multilingües (p. ej. familia BGE-M3, E5 multilingual) | no disponible en la información | no disponible en la información | Embeddings multilingües de propósito general | no disponible en la información | Hugging Face |

La comparación cuantitativa disponible se limita al modelo base: el fine-tuning mejora NS acc. de 0,603 a 0,637, PLOTS-IR Full de 0,890 a 0,991, PLOTS-IR Full M de 0,683 a 0,871, First de 0,645 a 0,816 y ToT nDCG@10 de 0,099 a 0,205, con un descenso en Last M (de 0,090 a 0,088). No hay datos publicados frente a otras familias de embeddings en la información disponible.

## Limitaciones y advertencias

- Sesgo de dominio: entrenado exclusivamente con resúmenes argumentales de películas de Wikipedia; su ventaja sobre el modelo base puede no trasladarse a otros dominios.
- Rendimiento débil en el escenario "Last" (0,387) y especialmente "Last M" (0,088): la recuperación basada en el tramo final del argumento con entidades enmascaradas es un punto flojo conocido.
- Ventana de 512 tokens: los documentos más largos deben truncarse o dividirse, lo que puede perder información relevante de la trama.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de falsos positivos en similitud: tramas estructuralmente parecidas (mismo género, mismo arquetipo) pueden puntuar alto sin ser la misma historia.
- Licencia: los pesos son Apache 2.0, pero el dataset de entrenamiento PLOTS es CC BY-SA 4.0; conviene revisar obligaciones de atribución y compartir-igual si se redistribuyen derivados de los datos.
- Requiere `trust_remote_code=True` por el código personalizado del repositorio, lo que implica ejecutar código del autor; auditar antes de desplegar en producción.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación externa muy limitados.
- No apto para generación de texto, razonamiento, código ni tareas agénticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jgmorenof/plots-gte-multilingual-base
- Dataset PLOTS: https://huggingface.co/datasets/Jgmorenof/PLOTS
- Modelo base: https://huggingface.co/Alibaba-NLP/gte-multilingual-base
- Cita del dataset (BibTeX en la model card): Moreno, Hamdi, Boros, Jatowt, Bordea, González-Gallardo y Doucet, 2026, "PLOTS -- Same Story, Different Words: Paired Plot Outlines for Narrative Similarity and Retrieval"
- SemEval-2026 Task 4: no disponible enlace directo en la información proporcionada
- TREC ToT 2023: no disponible enlace directo en la información proporcionada
