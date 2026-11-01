# Jgmorenof/plots-qwen3-embedding-0.6b

## Resumen

`Jgmorenof/plots-qwen3-embedding-0.6b` es un modelo de embeddings de frases obtenido por ajuste fino (fine-tuning) de `Qwen/Qwen3-Embedding-0.6B` sobre el corpus PLOTS, un conjunto de pares de resúmenes argumentales de películas de Wikipedia escritos de forma independiente en distintos idiomas. El objetivo es la similitud narrativa: emparejar historias por lo que cuentan, no por las palabras o los nombres propios que aparecen en ellas. Lo desarrolla Jose G. Moreno (Jgmorenof) en el marco de un trabajo académico sobre recuperación narrativa y el fenómeno "tip-of-the-tongue" (recordar a medias una película).

El modelo conserva la arquitectura y el tamaño del Qwen3-Embedding-0.6B original, con 595.776.512 parámetros y pesos en safetensors, y se distribuye a través de `sentence-transformers`. Su relevancia actual radica en que el ajuste mejora de forma medible el modelo base en tres tareas: precisión en triples de similitud narrativa de SemEval-2026 Task 4 (0,651 frente a 0,566 en zero-shot), nDCG@10 en recuperación sobre PLOTS (0,988 frente a 0,959) y nDCG@10 en TREC ToT 2023 (0,138 frente a 0,106).

Es un modelo pequeño y especializado, no un modelo generativo: produce vectores densos para búsqueda semántica y clustering, y está pensado para integrarse en pipelines de recuperación multilingüe donde la señal léxica es engañosa (títulos traducidos, personajes renombrados, tramas reescritas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (Qwen3-Embedding-0.6B), ajustado para embeddings de frases |
| Parametros totales | 595.776.512 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens de entrada máxima durante el entrenamiento; la longitud máxima del modelo base no se especifica en la información disponible |
| Tipos de cuantizacion | No disponible (el repositorio publica safetensors; no se documentan variantes GGUF, ONNX ni cuantizaciones) |
| Idiomas soportados | Multilingüe (según la model card y los tags); el conjunto de entrenamiento empareja inglés con otras lenguas |
| Licencia | Apache 2.0 (pesos); datos de entrenamiento PLOTS bajo CC BY-SA 4.0 |
| Formato de pesos | safetensors (librería sentence-transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-Embedding-0.6B, un encoder transformer de ~596 M de parámetros, y se ajusta con pérdida contrastiva simétrica in-batch (InfoNCE en ambas direcciones) con caché de gradientes. La configuración de entrenamiento es: 197.694 pares, batch de 128, 1 época, learning rate 1e-05, longitud máxima de entrada de 512 tokens y semilla 13. Los pares provienen de PLOTS, que empareja el resumen argumental en inglés de una película con su resumen en otro idioma, escritos de forma independiente, lo que fuerza al modelo a alinearse con la estructura narrativa en lugar de con la coincidencia superficial de nombres o términos.

Para evitar fugas de evaluación, se excluyen del entrenamiento las películas de SemEval-2026 Task 4 y de las consultas de train y dev de TREC ToT 2023. El modelo admite prompts de instrucción diferenciados según la tarea (recuperación de trama a partir de una descripción, similitud historia-historia simétrica y peticiones "tip-of-the-tongue"), lo que permite adaptar el espacio de embeddings al tipo de consulta sin reentrenar.

## Capacidades

- Generación de embeddings de frases y documentos para similitud semántica y recuperación densa.
- Similitud narrativa: emparejamiento de resúmenes argumentales de la misma historia redactados de forma independiente.
- Recuperación multilingüe: consulta en un idioma contra documentos en inglés (y viceversa).
- Recuperación "tip-of-the-tongue": localizar una película a partir de una descripción parcial o vaga de su trama.
- Soporte de prompts de instrucción específicos por tarea (`Instruct: ... Query:`), con prompts documentados para recuperación de tramas, similitud simétrica y ToT.
- Uso como extractor de características para clustering, deduplicación y detección de paráfrasis narrativas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de embeddings, no generativo.
- No dispone de modo "thinking", visión ni audio.

## Casos de uso

- Motor de búsqueda de películas por trama: el usuario describe lo que recuerda y el sistema codifica la consulta con el prompt ToT y busca contra los embeddings de las páginas de Wikipedia, aprovechando que el ajuste sube el nDCG@10 de ToT de 0,106 a 0,138 respecto al modelo base.
- Deduplicación de catálogos editoriales: agrupar fichas, sinopsis o reseñas de la misma obra publicadas en distintos idiomas detectando similitud narrativa en lugar de coincidencia de títulos, que suelen variar en las traducciones.
- Recomendación cross-lingual: indexar un catálogo de sinopsis en inglés y permitir consultas en castellano, catalán o cualquier otro idioma, gracias al entrenamiento sobre pares inglés-otra lengua.
- Enriquecimiento de bases de datos cinematográficas: enlazar registros de distintas fuentes (IMDb, FilmAffinity, Wikidata) comparando descripciones argumentales con el prompt de recuperación de tramas.
- Detección de plagio o reescritura de guiones y relatos: medir similitud entre textos narrativos reescritos, donde los nombres y el léxico cambian pero la estructura se mantiene.
- Evaluación de sistemas de resumen: comparar resúmenes generados con resúmenes de referencia mediante similitud semántica en el espacio de embeddings.
- Clustering temático de un corpus de ficción: agrupar relatos por arquetipo argumental para análisis literario o catalogación editorial.

## Benchmarks y rendimiento

Datos publicados en la model card. NS: precisión en los 355 triples de test leak-free de SemEval-2026 Task 4, track B. PLOTS-IR: nDCG@10 sobre las consultas de test (M: entidades enmascaradas). ToT: consultas de dev de TREC ToT 2023.

| Metrica | Este modelo | Qwen3-Embedding-0.6B zero-shot |
|---|---|---|
| NS accuracy | 0,651 | 0,566 |
| PLOTS-IR Full | 0,988 | 0,959 |
| PLOTS-IR Full M | 0,819 | 0,656 |
| PLOTS-IR First | 0,810 | 0,755 |
| PLOTS-IR Last | 0,384 | 0,384 |
| PLOTS-IR Last M | 0,074 | 0,069 |
| ToT nDCG@10 | 0,138 | 0,106 |
| ToT R@100 | 0,427 | 0,313 |

La mejora es más acusada en el escenario con entidades enmascaradas (Full M: 0,819 frente a 0,656), lo que confirma que el ajuste desplaza la representación desde los nombres propios hacia la estructura narrativa. En cambio, en la métrica "Last" (última frase del resumen) el modelo no mejora al base, lo que sugiere que el ajuste no aporta en contextos sin señal narrativa global.

## Requisitos de hardware

- VRAM estimada: unos 2,4 GB en fp32 para los pesos (595 M de parámetros); aproximadamente 1,2 GB en fp16 y menos de 1 GB en cuantización de 8 bits, más memoria para activaciones y batch.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en fp16 con batches pequeños; A100, H100 o L4 para indexación a gran escala.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en CPU para volúmenes moderados.
- Opciones de despliegue: `sentence-transformers` (vía de referencia), Text Embeddings Inference (TEI, etiqueta `text-embeddings-inference` en el repositorio) y endpoints compatibles; no se documentan variantes GGUF para llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jgmorenof/plots-qwen3-embedding-0.6b | 595,8 M | 512 tokens de entrenamiento | Embeddings, similitud narrativa multilingüe | Apache 2.0 | HuggingFace |
| Qwen/Qwen3-Embedding-0.6B | ~596 M | No disponible en la información | Embeddings generalistas multilingües | Apache 2.0 | HuggingFace |
| Modelos de embeddings multilingües de propósito general (p. ej. familia BGE-M3 o E5) | Variable | Variable | Embeddings generalistas | Variable | HuggingFace |

Frente al modelo base, este ajuste gana entre 8,5 y 16,3 puntos en las métricas de similitud narrativa y recuperación con entidades enmascaradas, pero pierde la generalidad del modelo original: está optimizado para texto narrativo y no se han publicado evaluaciones en tareas generales como MTEB. No se dispone de datos comparativos con otros modelos de embeddings en la información proporcionada.

## Limitaciones y advertencias

- Especializado en texto narrativo: su rendimiento en tareas generales de embeddings (preguntas y respuestas, código, recuperación técnica) no está evaluado y probablemente sea inferior al del modelo base.
- Entrenado con longitud máxima de 512 tokens; los resúmenes o descripciones más largas se truncan, lo que puede degradar la recuperación.
- El rendimiento en la métrica "Last" no mejora al modelo base (0,384 frente a 0,384), lo que indica debilidad cuando la señal narrativa está concentrada en el desenlace.
- Riesgo de falsos positivos entre películas con tramas arquetípicas similares (por ejemplo, comedias románticas o thrillers de venganza) al priorizar la estructura sobre las entidades.
- El conjunto de entrenamiento está dominado por pares inglés-otra lengua; el rendimiento entre dos idiomas distintos del inglés no está evaluado.
- Los pesos son Apache 2.0 y permiten uso comercial, pero los datos PLOTS están bajo CC BY-SA 4.0, lo que conviene revisar si se redistribuyen derivados del corpus.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado y sin soporte de la comunidad.
- No se documentan sesgos específicos ni evaluaciones de robustez; al derivar de Qwen3-Embedding-0.6B, hereda los sesgos del corpus de preentrenamiento original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jgmorenof/plots-qwen3-embedding-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Dataset PLOTS: https://huggingface.co/datasets/Jgmorenof/PLOTS
- Cita del corpus: Moreno, Hamdi, Boros, Jatowt, Bordea, González-Gallardo y Doucet, "PLOTS -- Same Story, Different Words: Paired Plot Outlines for Narrative Similarity and Retrieval", 2026.
