# Ch1c4g0/bge-reranker-v2-m3-llmcourse2026-ft005

## Resumen

`Ch1c4g0/bge-reranker-v2-m3-llmcourse2026-ft005` es un modelo de reranking (reordenación de documentos recuperados) obtenido mediante ajuste fino del reranker multilingüe `BAAI/bge-reranker-v2-m3` de BAAI. Lo desarrolla el usuario Ch1c4g0 en el contexto del curso «LLM講座2 2026» del laboratorio Matsuo-Iwasawa (Universidad de Tokio), concretamente para la competición final de RAG sobre Wikipedia en japonés. El modelo no genera texto: recibe un par consulta-documento y produce una puntuación de relevancia que permite reordenar los fragmentos devueltos por un sistema de recuperación.

Arquitectura de tipo cross-encoder basada en XLM-RoBERTa, con 567.755.777 parámetros totales y pesos en formato safetensors (2,3 GB de repositorio). El ajuste fino se realizó sobre las 12 capas del modelo, con 2 épocas, tasa de aprendizaje 1e-5, longitud de entrada 512 y una configuración de 1 positivo frente a 7 negativos por consulta; los pesos publicados corresponden a la primera época, seleccionada por el mayor MRR en un conjunto de validación.

Su relevancia es acotada pero clara: demuestra un flujo completo de adaptación de un reranker multilingüe a un dominio y un idioma concretos (Wikipedia en japonés, preguntas multi-salto) usando únicamente datos abiertos y Google Colab, sin APIs externas ni otros LLM. Es un artefacto de investigación docente, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en XLM-RoBERTa (transformer encoder) |
| Parametros totales | 567.755.777 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (longitud de entrada usada en el ajuste fino) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en precisión original) |
| Idiomas soportados | japones (declarado); el modelo base es multilingüe |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder: procesa conjuntamente la consulta y el documento candidato y emite una puntuación escalar de relevancia, en lugar de comparar embeddings independientes como haría un bi-encoder. La estructura, la configuración y el tokenizador son idénticos a los de `BAAI/bge-reranker-v2-m3` (revisión `953dc6f6f85a1b2dbfca4c34a2796e7dde08d41e`); solo cambian los pesos, reentrenados en todas las capas durante 2 épocas con tasa de aprendizaje 1e-5, longitud de entrada 512 y una función de pérdida de entropía cruzada que optimiza que el positivo quede en primera posición frente a 7 negativos por consulta. El conjunto de entrenamiento tiene 1650 ejemplos y los pesos publicados son los de la primera época, elegida por el mejor MRR en datos de validación.

Los datos proceden de tres fuentes, todas con licencia CC BY-SA 4.0: `cl-nagoya/auto-wiki-qa` (revisión `672dd0d496352282b4064e944a16e00315b796a8`), `JEMHopQA` (train, ver1.2) y los fragmentos de Wikipedia en japonés distribuidos en el dataset de la competición `bumbuboon/llm-course-final-2026`. Las preguntas se construyeron de forma mecánica a partir de reglas de coincidencia de cadenas: para auto-wiki-qa se encadenaron dos preguntas cuando la respuesta de la primera coincide con el título del artículo de la segunda; para JEMHopQA se usó la primera entidad sujeto de la derivación que no aparece en el enunciado como «siguiente artículo a consultar». Los positivos y negativos se determinaron por coincidencia literal de cadenas, solapamiento de caracteres con la pregunta y un generador aleatorio con semilla fija, con un máximo de 41 negativos por consulta y descartando consultas con más de 5 positivos. Todo el proceso se ejecutó en Google Colab sin usar APIs externas ni otros modelos de lenguaje.

## Capacidades

- Puntuación de relevancia consulta-documento para reordenar resultados de un recuperador (reranking de segundo estadio).
- Manejo de consultas multi-salto en japonés, entrenadas específicamente para preguntas que requieren encadenar dos artículos de Wikipedia.
- Entrada de hasta 512 tokens por par consulta-documento.
- Capacidad multilingüe heredada del modelo base `bge-reranker-v2-m3`, aunque el ajuste fino solo se ha validado en japonés.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso autónomo ni modo «thinking».
- No dispone de capacidades de visión ni de audio.

## Casos de uso

- RAG sobre Wikipedia en japonés: reordenar los fragmentos recuperados por un retriever (BM25 o bi-encoder) antes de pasarlos al generador, reduciendo el ruido en el contexto y mejorando la precisión de la respuesta final.
- Preguntas multi-salto en dominio enciclopédico: el ajuste con datos de auto-wiki-qa y JEMHopQA está diseñado para consultas cuya respuesta exige localizar primero una entidad y después el artículo que la contiene, por lo que es adecuado en pipelines de question answering encadenado.
- Filtrado de candidatos en sistemas de búsqueda documental: con 567 millones de parámetros y entradas de 512 tokens, puede puntuar decenas de pares por consulta en GPU de gama media, lo que permite descartar fragmentos irrelevantes antes de etapas más costosas.
- Evaluación comparativa de retrievers: al ser un reranker fijo y reproducible, sirve como referencia para medir la calidad de distintos recuperadores sobre el mismo corpus japonés.
- Reproducción académica y docencia: el repositorio documenta con detalle la construcción del dataset y los hiperparámetros, lo que lo convierte en un ejemplo práctico de ajuste fino de un cross-encoder con recursos limitados (Colab).
- Base para nuevos ajustes de dominio: al mantener la estructura y el tokenizador originales, puede recargarse con la API estándar de `transformers` y reentrenarse sobre corpus especializados en japonés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que la primera época se seleccionó por presentar el MRR más alto en un conjunto de validación, sin aportar el valor numérico ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 1,1-1,2 GB solo para los pesos (567,8 M de parámetros), más el consumo de activaciones y memoria del runtime, que depende del tamaño de lote y de la longitud de entrada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para lotes pequeños en FP16; para lotes grandes a 512 tokens conviene una RTX 3090/4090, A10, L4 o superior.
- Cabe en GPU de consumo: sí, en tarjetas tipo RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o superiores; también en GPUs con 6-8 GB usando lotes reducidos.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification` y `AutoTokenizer` (método estándar para cross-encoders); también es compatible con `FlagEmbedding` (el paquete de BAAI para sus rerankers) y con `sentence-transformers` mediante `CrossEncoder`. Para servicio HTTP se puede envolver en un endpoint propio; no se documenta soporte específico de vLLM, TGI o llama.cpp, que están orientados a modelos generativos.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ch1c4g0/bge-reranker-v2-m3-llmcourse2026-ft005 | 567,8 M | 512 tokens (entrada de ajuste) | Cross-encoder ajustado a japonés | apache-2.0 | Hugging Face |
| BAAI/bge-reranker-v2-m3 | 567,8 M | hasta 8192 tokens según la model card del original | Cross-encoder multilingüe | apache-2.0 | Hugging Face |
| BAAI/bge-reranker-base | no disponible en esta ficha | no disponible en esta ficha | Cross-encoder | apache-2.0 | Hugging Face |
| jina-reranker-v2-base-multilingual | no disponible en esta ficha | no disponible en esta ficha | Cross-encoder multilingüe | no disponible en esta ficha | Hugging Face |

La diferencia principal frente al modelo base es el ajuste fino sobre datos japoneses de Wikipedia y preguntas multi-salto; el resto de características estructurales (parámetros, tokenizador, arquitectura) son idénticas. No se dispone de datos de rendimiento comparado entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación docente: procede de un trabajo de curso, con 0 descargas y 0 likes en el momento de la consulta, y sin validación externa publicada.
- Conjunto de entrenamiento pequeño (1650 ejemplos) y generado por reglas de coincidencia de cadenas, lo que puede introducir sesgos en la definición de positivo y negativo (por ejemplo, favorecer documentos que repiten literalmente términos de la consulta).
- Entrenado y validado exclusivamente en japonés; su uso en otros idiomas, aunque el modelo base sea multilingüe, no está garantizado.
- Longitud de entrada limitada a 512 tokens en el ajuste; documentos más largos deben fragmentarse.
- Riesgo de sobreajuste al estilo de las preguntas de Wikipedia y de los datasets auto-wiki-qa y JEMHopQA; el rendimiento en dominios distintos (documentación técnica, atención al cliente) es incierto.
- No es un modelo generativo: no puede usarse para responder preguntas directamente, solo para puntuar pares consulta-documento.
- Licencia apache-2.0 en los pesos, pero los datos de entrenamiento son CC BY-SA 4.0; conviene revisar las obligaciones de atribución y compartir-igual si se redistribuyen derivados que incorporen esos datos.
- No se han publicado métricas de sesgo, robustez ni evaluación de alucinación (no aplica directamente al ser un reranker, pero sí la fiabilidad de las puntuaciones en dominios fuera de distribución).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ch1c4g0/bge-reranker-v2-m3-llmcourse2026-ft005
- Modelo base: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset de la competición: https://huggingface.co/datasets/bumbuboon/llm-course-final-2026
- Wikipedia en japonés: https://ja.wikipedia.org/
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
