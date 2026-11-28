# Ch1c4g0/bge-reranker-v2-m3-llmcourse2026-ft001

## Resumen

`Ch1c4g0/bge-reranker-v2-m3-llmcourse2026-ft001` es un modelo de reranking (reordenación de resultados de búsqueda) obtenido mediante fine-tuning completo del modelo `BAAI/bge-reranker-v2-m3` de BAAI. Lo desarrolla el usuario Ch1c4g0 en el contexto del curso «LLM講座2 2026» del laboratorio Matsuo-Iwasawa, como parte de un trabajo final de competición de RAG sobre Wikipedia en japonés. El modelo resuelve el problema de la segunda fase de recuperación en pipelines RAG: dado un conjunto de fragmentos candidatos recuperados por un buscador, asigna una puntuación de relevancia para reordenarlos.

La arquitectura es la del modelo base sin modificaciones: un encoder XLM-RoBERTa con 567.755.777 parámetros totales, configurado como clasificador de relevancia de un solo logit. No se ha alterado la estructura, el `config` ni el tokenizador; solo se han reentrenado los pesos de todas las capas. El repositorio ocupa 2,3 GB en formato safetensors y la licencia es Apache 2.0, heredada del modelo original.

Su relevancia es acotada y muy específica: es un artefacto de curso, con cero descargas y cero likes en el momento de la consulta, entrenado exclusivamente para el dominio de Wikipedia en japonés. Resulta útil como referencia de un procedimiento de fine-tuning de rerankers reproducible (entrenamiento en Google Colab, datos públicos con licencia CC BY-SA 4.0) y como ejemplo de adaptación de un reranker multilingüe a una tarea y un idioma concretos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (encoder transformer) como clasificador de relevancia (cross-encoder) |
| Parámetros totales | 567.755.777 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (longitud de entrada usada en el entrenamiento; no se especifica otra en la información disponible) |
| Tipos de cuantización | no disponible (el repo solo contiene safetensors; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | japonés (ja); el modelo base es multilingüe, pero el fine-tuning se ha hecho solo con datos en japonés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo conserva íntegramente la arquitectura del `BAAI/bge-reranker-v2-m3`: un encoder XLM-RoBERTa que recibe el par (consulta, pasaje) y produce una puntuación de relevancia mediante una cabeza de clasificación de un solo logit. No hay cambios en la estructura, la configuración ni el tokenizador respecto al modelo base, cuya revisión de referencia es `953dc6f6f85a1b2dbfca4c34a2796e7dde08d41e`.

El fine-tuning afecta a todas las capas y se ejecutó durante una época con tasa de aprendizaje 1e-05, longitud de entrada 512 y un esquema de una pregunta con un ejemplo positivo y siete negativos, optimizando entropía cruzada para que el positivo quede en primera posición. El conjunto de entrenamiento tiene 1669 ejemplos, construidos a partir de tres fuentes: JEMHopQA (train, ver 1.2), JSQuAD (train, ver 1.3, parte de JGLUE) y fragmentos de Wikipedia en japonés distribuidos en el dataset del curso `bumbuboon/llm-course-final-2026`. La selección de positivos y negativos se hizo de forma mecánica, por coincidencia de cadenas y por la posición en los resultados de búsqueda, sin usar APIs externas ni otros LLM. Todo el proceso, incluida la creación de datos y el entrenamiento, se realizó en Google Colab. Los pesos publicados corresponden a la época con mejor MRR sobre un conjunto de validación.

## Capacidades

- Puntuación de relevancia consulta-pasaje para reordenar resultados de recuperación (reranking) en pipelines RAG.
- Funcionamiento como cross-encoder: evalúa conjuntamente consulta y documento, lo que permite captar coincidencias semánticas que un retriever bi-encoder pasa por alto.
- Optimizado específicamente para preguntas y respuestas sobre Wikipedia en japonés, incluyendo preguntas de tipo multihop (JEMHopQA) y de comprensión lectora (JSQuAD).
- Capacidad multilingüe potencial heredada del modelo base XLM-RoBERTa, aunque no validada ni ajustada en esta versión.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito: es un clasificador de relevancia, no un modelo generativo.
- No se documentan capacidades adicionales en la información disponible.

## Casos de uso

- Segunda fase de recuperación en un RAG sobre Wikipedia en japonés: tras una búsqueda vectorial o léxica que devuelve, por ejemplo, 50 candidatos, el modelo reordena los fragmentos por relevancia antes de pasarlos al generador, reduciendo el ruido en el contexto.
- Preguntas multihop en japonés: el ajuste con JEMHopQA entrena al modelo para preferir fragmentos que contienen el valor derivado de una cadena de razonamiento, lo que ayuda en consultas que requieren combinar información de varios artículos.
- Comprensión lectora sobre corpus japoneses: el ajuste con JSQuAD lo hace adecuado para seleccionar el pasaje que contiene la respuesta a una pregunta extractiva.
- Evaluación comparativa de retrievers: puede usarse como juez de relevancia fijo para medir la calidad de distintos sistemas de recuperación sobre el mismo corpus, ya que su puntuación es determinista y reproducible.
- Reproducción de experimentos docentes: sirve como referencia reproducible de un pipeline completo de fine-tuning de reranker en Colab con datos públicos, útil para cursos y talleres.
- Filtrado de contexto en asistentes documentales internos en japonés: integrado como paso previo a un LLM generativo, descarta fragmentos irrelevantes y reduce el consumo de tokens de contexto.
- No es adecuado como generador de respuestas ni como modelo de chat: su salida es una puntuación de relevancia, no texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona que los pesos publicados corresponden a la época con mayor MRR sobre un conjunto de datos de validación, pero no se proporciona el valor numérico del MRR ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,3 GB solo para los pesos (567,8 M de parámetros × 4 bytes), más el overhead de activaciones y del tokenizador; en la práctica, entre 3 y 4 GB.
- VRAM estimada en fp16/bf16: aproximadamente 1,2 GB para los pesos, con un total práctico de 2 a 3 GB.
- VRAM estimada en int8: alrededor de 0,6 GB para los pesos; en int4, unos 0,3 GB, aunque no se documentan cuantizaciones publicadas para este modelo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; una RTX 3060, RTX 4060 o superior es suficiente. Para lotes grandes y alto throughput, A100 o H100.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 4 GB o más de VRAM en fp16, y en 2 GB o más con cuantización int8.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification`, `sentence-transformers` con `CrossEncoder`, y servidores de inferencia compatibles con modelos de clasificación (por ejemplo, Text Embeddings Inference de Hugging Face). No se documenta soporte específico para vLLM, llama.cpp u Ollama, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| Ch1c4g0/bge-reranker-v2-m3-llmcourse2026-ft001 | 567,8 M | 512 | japonés (fine-tuning) | Apache 2.0 | Fine-tuning de curso, 1669 ejemplos, sin benchmarks publicados |
| BAAI/bge-reranker-v2-m3 | 567,8 M | no disponible en la información | multilingüe | Apache 2.0 | Modelo base; entrenado con datos multilingües a mayor escala |
| BAAI/bge-reranker-base | no disponible en la información | no disponible en la información | multilingüe | Apache 2.0 | Alternativa de menor tamaño de la misma familia; sin datos de rendimiento en la información disponible |
| BAAI/bge-reranker-large | no disponible en la información | no disponible en la información | multilingüe | Apache 2.0 | Alternativa de mayor tamaño de la misma familia; sin datos de rendimiento en la información disponible |

La comparación de rendimiento entre estos modelos no está disponible: no se han publicado métricas de este fine-tuning ni se dispone de cifras de los alternativos en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con 1669 ejemplos en japonés: el ajuste es muy ligero y puede provocar sobreajuste al dominio de Wikipedia y a los formatos de JEMHopQA y JSQuAD.
- El modelo base es multilingüe, pero este fine-tuning puede degradar su rendimiento en idiomas distintos del japonés; no se ha validado en otros idiomas.
- Riesgo de sesgo heredado de los datos: Wikipedia en japonés y los datasets JEMHopQA y JSQuAD reflejan los sesgos de sus fuentes y de sus procesos de anotación.
- La selección de positivos y negativos se hizo de forma mecánica por coincidencia de cadenas y posición en la búsqueda, lo que puede introducir etiquetas ruidosas y sesgar el modelo hacia coincidencias léxicas.
- No se han publicado benchmarks ni métricas de validación numéricas: no hay evidencia pública de su calidad frente al modelo base.
- Es un artefacto de curso con cero descargas y cero likes; no hay garantía de mantenimiento ni soporte.
- Licencia Apache 2.0: permite uso comercial, pero los datos de entrenamiento (JEMHopQA, JSQuAD y Wikipedia) están bajo CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir-igual sobre obras derivadas; conviene revisar la compatibilidad antes de un uso comercial.
- Limitación de contexto de 512 tokens: los pasajes más largos deben truncarse o dividirse, lo que puede perder información relevante.
- No es un modelo generativo: no produce respuestas, solo puntuaciones de relevancia; no debe usarse como sustituto de un LLM en un pipeline RAG.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ch1c4g0/bge-reranker-v2-m3-llmcourse2026-ft001
- Modelo base: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Dataset del curso: https://huggingface.co/datasets/bumbuboon/llm-course-final-2026
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- JGLUE (incluye JSQuAD): https://github.com/yahoojapan/JGLUE
- Wikipedia en japonés: https://ja.wikipedia.org/
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
