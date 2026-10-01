# Horizon-Labs/multilingual-embedding-base

## Resumen

Horizon-Labs/multilingual-embedding-base es un modelo de embeddings de frases y pasajes, multilingüe, desarrollado por Horizon-Labs. Se trata de un modelo destilado: parte de mmBERT-base (jhu-clsp), una arquitectura ModernBERT de tipo encoder, y se entrena para reproducir el espacio vectorial denso de BAAI/bge-m3. El resultado son vectores de 1024 dimensiones, normalizados en L2, que se pueden usar tanto de forma autónoma como para consultar un índice ya construido con bge-m3, lo que abarata la codificación de consultas en CPU o en el navegador.

El modelo tiene 306.939.648 parámetros (unos 308M), aproximadamente la mitad que bge-m3 (568M), y una longitud máxima de secuencia de 512 tokens (se entrenó con 256). Su interés práctico está en el equilibrio entre tamano y calidad multilingüe: cubre del orden de 90 idiomas, se distribuye con licencia Apache-2.0 e incluye artefactos ONNX (incluida una versión int8) para inferencia en CPU y en el navegador mediante transformers.js.

La relevancia actual viene de dos factores. Por un lado, la compatibilidad de espacio vectorial con bge-m3 permite desplegarlo como codificador de consultas sin reindexar corpus existentes. Por otro, su tamano reducido permite ejecutar recuperación semántica en entornos sin GPU, algo poco habitual en modelos multilingües de calidad comparable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT), base jhu-clsp/mmBERT-base; mean pooling mas capa lineal a 1024 dimensiones |
| Parametros totales | 306.939.648 (unos 308M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens maximos (entrenado con 256) |
| Tipos de cuantizacion | int8 ONNX publicado (onnx/model_quantized.onnx, 642 MB); pesos fp32 en safetensors; no se documentan otras cuantizaciones |
| Idiomas soportados | aproximadamente 90 idiomas de uso y 92 idiomas en el corpus de entrenamiento: en, de, fr, es, pt, it, nl, pl, ru, uk, cs, ro, bg, sv, da, no, fi, hu, el, tr, ar, he, fa, ur, hi, bn, ta, te, mr, zh, ja, ko, vi, th, id, ms, sw, af, am, hy, az, eu, ka, kk, km |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y ONNX (fp32 y cuantizado int8) |
| Dimension de embedding | 1024, normalizado en L2; similitud coseno equivalente a producto escalar |
| Prefijos de consulta/pasaje | no requiere prefijos |
| Tamano del repositorio | 3,1 GB |
| Modelo base | jhu-clsp/mmBERT-base |
| Modelo profesor | BAAI/bge-m3 |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer ModernBERT (mmBERT-base) sobre el que se anaden un pooling de media y una capa lineal que proyecta a 1024 dimensiones, el mismo espacio que produce bge-m3. El entrenamiento es una destilación: el estudiante aprende a reproducir los embeddings densos normalizados del profesor mediante una pérdida de coseno mas error cuadrático, complementada con una pérdida sobre la matriz de similitud dentro del lote que preserva la geometría relativa entre pares. No se documenta RLHF ni DPO, ya que no es un modelo generativo. El código de entrenamiento está en el directorio `code/` del repositorio.

El corpus consta de aproximadamente 4,65 millones de textos: fragmentos de 1 a 8 frases y spans cortos procedentes de FineWeb-2 y FineWeb (licencia ODC-BY) en 92 idiomas, mas unas 850.000 consultas de búsqueda generadas por Qwen3.8-27B para pasajes web en 47 idiomas. Solo se reproduce la salida densa del profesor: no se destilan las representaciones dispersas ni las multi-vector (ColBERT) de bge-m3. La innovación principal es la compatibilidad de índice: al compartir espacio vectorial con bge-m3, las consultas codificadas por este modelo puntúan correctamente contra pasajes embebidos previamente con el profesor.

## Capacidades

- Generación de embeddings de frases y pasajes de 1024 dimensiones, normalizados en L2, listos para similitud coseno o producto escalar.
- Recuperación densa (retrieval) multilingüe y cross-lingual: consultas en un idioma contra un corpus en otro.
- Similitud semántica de frases (sentence similarity), clustering y clasificación por similitud sin entrenamiento adicional.
- Deduplicación y agrupamiento de corpus grandes mediante vecinos más cercanos sobre los vectores.
- Compatibilidad directa con índices densos ya creados con BAAI/bge-m3, sin reindexado de pasajes.
- Soporte de entrada corta y media: hasta 512 tokens, con fragmentación recomendada de documentos largos.
- Inferencia en navegador mediante transformers.js con `dtype: "q8"`, devolviendo el embedding final normalizado como `sentence_embedding`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo generativo. La visión, el audio y el modo thinking no están disponibles.

## Casos de uso

- Búsqueda semántica multilingüe en producción: indexar pasajes con este modelo y servir consultas en cualquiera de los ~90 idiomas soportados, sin necesidad de GPU, gracias a los 308M de parámetros y a la versión int8 de 642 MB.
- Sustitución del codificador de consultas en un RAG existente sobre bge-m3: se mantienen los vectores de pasajes ya calculados con bge-m3 y se codifican las consultas con este modelo (nDCG@10 de 0,742 en MIRACL y 0,934 en Wikipedia en la prueba del autor), reduciendo coste de inferencia.
- Búsqueda cross-lingual en documentación técnica: consulta en español contra corpus en inglés o alemán, apoyándose en el entrenamiento multilingüe sobre FineWeb-2 en 92 idiomas.
- Deduplicación y curación de datasets: calcular embeddings de millones de documentos y aplicar vecinos más cercanos para detectar duplicados casi exactos, con un coste de índice de 4 KB por vector en fp32 (1 KB en int8).
- Clustering temático de tickets o reseñas: agrupar retroalimentación de clientes en varios idiomas con KMeans sobre los embeddings, sin etiquetas previas.
- Clasificación zero-shot por similitud: definir prototipos textuales por categoría y asignar la clase más cercana, útil para enrutado de correo o triaje de incidencias.
- Búsqueda semántica en el navegador o en el cliente: usar la build ONNX int8 con transformers.js para recuperación local sin enviar texto a un servidor, en aplicaciones de notas, correo o documentación offline.
- Reranking de candidatos: reordenar las listas devueltas por un buscador léxico o por un recuperador aproximado, aprovechando que el autor evalúa precisamente en formato de reranking sobre listas de candidatos.
- Recomendación de contenido por similitud de embeddings, por ejemplo artículos relacionados o productos similares descritos en distintos idiomas.

## Benchmarks y rendimiento

Métricas del autor: nDCG@10 ordenando los candidatos de cada consulta por similitud coseno, sobre benchmarks públicos de reranking (MTEB; usados solo para evaluación). MIRACL: 60 consultas por idioma con 100 candidatos cada una. Wikipedia: 60 consultas por idioma con 9 candidatos cada una. "Otros" agrupa ESCI (es, jp, us), RuBQ, T2Reranking, mMARCO-ja y AskUbuntu. Todos los modelos se ejecutan con el mismo script; multilingual-e5 se ejecuta con sus prefijos "query: "/"passage: ".

| Modelo | MIRACL (18 idiomas) | Wikipedia (16 idiomas) | Otros (6 conjuntos) | Media | Nota |
|---|---|---|---|---|---|
| Este modelo (308M) | 0,753 | 0,934 | 0,777 | 0,821 | consultas y pasajes con este modelo |
| Este modelo contra índice bge-m3 (308M) | 0,742 | 0,934 | 0,774 | 0,817 | consultas con este modelo, pasajes con bge-m3 |
| Horizon-Labs/multilingual-embedding-small (141M) | 0,750 | 0,935 | 0,768 | 0,818 | no disponible |
| BAAI/bge-m3 (568M) | 0,797 | 0,927 | 0,788 | 0,837 | el profesor |
| intfloat/multilingual-e5-small (118M) | 0,721 | 0,915 | 0,776 | 0,804 | no disponible |
| intfloat/multilingual-e5-base (278M) | 0,736 | 0,918 | 0,775 | 0,810 | no disponible |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 (118M) | 0,387 | 0,837 | 0,687 | 0,637 | no disponible |
| sentence-transformers/all-MiniLM-L6-v2 (23M) | 0,172 | 0,720 | 0,621 | 0,504 | solo inglés |

Notas del autor: la tabla muestra el checkpoint publicado; las medias sobre dos semillas de entrenamiento son, para el modelo base, 0,822 con embeddings propios y 0,816 contra un índice bge-m3, y para el modelo small, 0,817 y 0,818. Los únicos modelos por delante en MIRACL y en "otros" (con embeddings propios) son bge-m3; en Wikipedia ninguno. Se trata de una prueba de reordenación sobre listas de candidatos dadas, no de un benchmark de recuperación sobre corpus completo. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, solo pesos: unos 1,23 GB en fp32 (306,9M × 4 bytes), unos 614 MB en fp16 y unos 307 MB para pesos int8. El archivo publicado `onnx/model_quantized.onnx` ocupa 642 MB según el autor.
- Memoria adicional para activaciones, tokenizador y lote: reducida por la ventana de 512 tokens; con lotes pequenos, 1-2 GB de VRAM son suficientes.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM (por ejemplo GTX 1650, RTX 3050, RTX 4090, A100, H100). No requiere aceleradores de gama alta; el uso en A100/H100 solo tiene sentido para lotes muy grandes o para indexación masiva.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU dedicadas modernas, e incluso en CPU. La versión int8 está pensada explícitamente para CPU y navegador.
- Opciones de despliegue: sentence-transformers, ONNX Runtime, text-embeddings-inference (TEI, etiquetado por el autor), transformers.js (`dtype: "q8"`) y endpoints compatibles con la API de Hugging Face (`endpoints_compatible`). No hay pesos GGUF, por lo que llama.cpp y Ollama no están soportados con los artefactos publicados.
- Índice vectorial: 4 KB por vector en fp32, 2 KB en fp16 y 1 KB en int8; un millón de pasajes ocupa aproximadamente 4 GB, 2 GB o 1 GB respectivamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MIRACL | Wikipedia | Media | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Horizon-Labs/multilingual-embedding-base | 308M | 512 tokens | 0,753 | 0,934 | 0,821 | apache-2.0 | safetensors + ONNX (fp32 e int8) |
| BAAI/bge-m3 | 568M | no disponible | 0,797 | 0,927 | 0,837 | no disponible | no disponible |
| intfloat/multilingual-e5-base | 278M | no disponible | 0,736 | 0,918 | 0,810 | no disponible | no disponible |
| Horizon-Labs/multilingual-embedding-small | 141M | 512 tokens (no confirmado en la información disponible) | 0,750 | 0,935 | 0,818 | apache-2.0 | safetensors + ONNX (según el autor) |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | 118M | no disponible | 0,387 | 0,837 | 0,637 | no disponible | no disponible |

Frente a bge-m3, este modelo pierde 0,044 puntos de media y 0,044 en MIRACL, pero es un 46% mas pequeno (308M frente a 568M) y mantiene la compatibilidad de índice. Frente a multilingual-e5-base, gana 0,011 de media con 30M más de parámetros. Frente al modelo small de la misma familia, la diferencia es mínima (0,821 frente a 0,818), por lo que la elección entre ambos depende del presupuesto de cómputo mas que de la calidad.

## Limitaciones y advertencias

- El estudiante aproxima a bge-m3 y es peor que él; la brecha se amplía en pasajes largos, idiomas poco representados y dominios especializados.
- Solo se reproducen los vectores densos de bge-m3, no sus salidas dispersas ni multi-vector (ColBERT), por lo que no sirve como sustituto en configuraciones híbridas que dependan de esas representaciones.
- Longitud máxima de 512 tokens y entrenamiento con 256: los documentos largos deben fragmentarse en pasajes, lo que puede degradar la recuperación de contexto extenso.
- La evaluación publicada es de reordenación sobre listas de candidatos, no de recuperación sobre corpus completo; los valores de nDCG@10 no son directamente extrapolables a un sistema real con millones de documentos.
- Riesgo de sesgo heredado de los corpus de entrenamiento (FineWeb-2 y FineWeb) y del profesor bge-m3 en cuanto a cobertura temática, registro y representación de variedades dialectales.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que el modelo no produce texto; el riesgo equivalente es la recuperación de pasajes semánticamente próximos pero incorrectos para la consulta, que debe mitigarse con reranking o verificación.
- Cobertura desigual entre los ~90 idiomas declarados: el propio autor indica que la brecha con el profesor es mayor en idiomas raros.
- Licencia Apache-2.0, que permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia. Los corpus de entrenamiento tienen sus propias condiciones (FineWeb-2 y FineWeb bajo ODC-BY) y las consultas sintéticas fueron generadas con Qwen3.8-27B.
- El modelo se publicó con 0 descargas y 0 likes en el momento de la consulta y con fecha de creación de 2026-10-01, por lo que conviene validar su comportamiento en el dominio propio antes de llevarlo a producción.
- Los resultados de búsqueda web asociados a "Horizon" no contienen información relevante sobre este modelo; no se han podido contrastar datos con fuentes externas al repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Horizon-Labs/multilingual-embedding-base
- Versión reducida de la misma familia: https://huggingface.co/Horizon-Labs/multilingual-embedding-small
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Modelo profesor: https://huggingface.co/BAAI/bge-m3
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Modelo comparado intfloat/multilingual-e5-small: https://huggingface.co/intfloat/multilingual-e5-small
- Modelo comparado intfloat/multilingual-e5-base: https://huggingface.co/intfloat/multilingual-e5-base
- Modelo comparado sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Modelo comparado sentence-transformers/all-MiniLM-L6-v2: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Código de entrenamiento y evaluación: directorio `code/` dentro del repositorio del modelo
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes sobre este modelo; los resultados devueltos corresponden a entidades no relacionadas (partido político francés, óptica y emisora de radio)
