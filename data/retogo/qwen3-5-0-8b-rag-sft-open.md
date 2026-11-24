# retogo/qwen3.5-0.8b-rag-sft-open

## Resumen

retogo/qwen3.5-0.8b-rag-sft-open es un ajuste supervisado (SFT) del modelo Qwen/Qwen3.5-0.8B, publicado por el usuario retogo como proyecto final del curso "LLM講座2 2026". El objetivo declarado es el entrenamiento de un modelo para tareas de generación aumentada por recuperación (RAG) sobre Wikipedia en japonés: el modelo recibe fragmentos recuperados y debe responder preguntas apoyándose en ellos. La estructura del modelo es idéntica a la del modelo base, según la propia model card.

Se trata de un modelo pequeño, con 873.438.784 parámetros en formato safetensors y un repositorio de 1,8 GB, lo que lo sitúa en la franja de modelos que pueden ejecutarse en hardware de consumo. El ajuste se realizó mediante LoRA integrado (o entrenamiento completo, la model card no lo especifica con certeza) sobre la revisión 2fc06364715b967f1860aea9cf38778875588b17 de Qwen3.5-0.8B.

Su relevancia es acotada: no es un modelo de propósito general ni compite en benchmarks abiertos, sino un artefacto didáctico especializado en QA extractiva y comparativa sobre pasajes de Wikipedia japonesa. Resulta útil como referencia para quien quiera reproducir un pipeline de SFT para RAG con datasets japoneses de QA (JSQuAD, JaQuAD, JEMHopQA, entre otros) y para evaluar el comportamiento de modelos de menos de mil millones de parámetros en tareas de grounding.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-0.8B; la model card indica que la estructura es idéntica al modelo base) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors) |
| Idiomas soportados | no disponibles de forma explícita; el entrenamiento se centra en japonés (datasets JSQuAD, JaQuAD, NIILC QA, JEMHopQA, auto-wiki-qa, TyDi QA) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.5-0.8B, un transformer decoder-only de 873 millones de parámetros. El autor no documenta cambios estructurales: el ajuste consiste en un LoRA integrado en los pesos (o, alternativamente, un entrenamiento de todos los parámetros; la model card deja ambas posibilidades abiertas) sobre la revisión 2fc06364715b967f1860aea9cf38778875588b17 del modelo base.

El entrenamiento se realizó sobre una mezcla de datasets de question answering en japonés: JSQuAD y JGLUE (CC BY-SA 4.0), JaQuAD (CC BY-SA 3.0), NIILC QA (CC BY-SA 4.0), JEMHopQA (CC BY-SA 4.0), cl-nagoya/auto-wiki-qa (CC BY-SA 4.0) y TyDi QA (Apache-2.0). Además, se generaron preguntas sintéticas con el propio Qwen3.5-0.8B, concretamente preguntas que comparan fechas de nacimiento de personas en artículos de un conjunto de fragmentos distribuido (derivado de Wikipedia japonesa, CC BY-SA 4.0). El preprocesado descrito consiste en combinar cada pregunta con los resultados de búsqueda sobre los fragmentos distribuidos, darles formato de prompt de respuesta y conservar mecánicamente solo aquellas preguntas para las que la recuperación devolvía material que contenía la respuesta correcta. No se documenta el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto y respuesta a preguntas en japonés, con especial énfasis en QA extractiva sobre pasajes recuperados (grounding en contexto).
- Respuesta a preguntas de comparación entre entidades (por ejemplo, comparar fechas de nacimiento de personas presentes en los fragmentos), capacidad reforzada mediante el dataset sintético descrito.
- Manejo de preguntas multi-salto de tipo JEMHopQA, orientadas a razonamiento sobre varias entidades.
- Capacidad multilingüe potencial heredada del modelo base y de TyDi QA, aunque no se documenta el alcance real por idioma.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, visión ni audio.
- No se documenta decodificación especulativa ni optimizaciones de inferencia específicas.

## Casos de uso

- Respuesta sobre documentación interna en japonés: el modelo puede recibir fragmentos recuperados de un índice vectorial y generar respuestas ancladas a esos fragmentos, lo que encaja con su entrenamiento en formato RAG y permite desplegarlo en un pipeline de búsqueda más generación con requisitos de hardware modestos.
- Asistente de consulta sobre Wikipedia japonesa: adecuado para preguntas factuales y comparativas entre personas o entidades, gracias al entrenamiento con JSQuAD, JaQuAD y el conjunto sintético de comparación de fechas de nacimiento.
- Base para experimentos académicos de SFT: sirve como punto de partida reproducible para cursos y trabajos que quieran comparar estrategias de ajuste (LoRA integrado frente a entrenamiento completo) sobre un modelo de menos de mil millones de parámetros.
- Evaluación de grounding y fidelidad: útil para medir hasta qué punto un modelo pequeño respeta el contexto recuperado frente a responder de memoria, en un entorno controlado y con datasets japoneses de referencia.
- Prototipado de QA multi-salto: el entrenamiento con JEMHopQA permite probar pipelines que requieren combinar información de varias entidades en una sola respuesta.
- Filtrado y anotación asistida de corpus: puede emplearse para generar respuestas candidatas sobre pasajes de Wikipedia que luego se revisan manualmente, como paso previo a la construcción de datasets de mayor calidad.
- Despliegue en entornos con recursos limitados: con 873 millones de parámetros y pesos en safetensors de 1,8 GB, es viable en una GPU de consumo para inferencia en FP16 o en cuantizaciones de 8 y 4 bits, una vez convertido a GGUF u otro formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB en FP16 para los pesos, más memoria para el contexto y el estado de la KV cache; en cuantización de 8 bits, en torno a 1 GB, y en 4 bits, alrededor de 0,5 GB, aunque estas cifras son estimaciones a partir del tamaño del repositorio y no están confirmadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para FP16 con contexto moderado; una RTX 3060, RTX 4060 o superior es suficiente. Para mayor throughput, A100 o H100 no son necesarias dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer recientes con 6 GB o más de VRAM.
- Opciones de despliegue: al publicarse solo safetensors, requiere conversión a GGUF para llama.cpp u Ollama; también puede servirse con vLLM o TGI si se dispone de los pesos en formato compatible, o directamente con transformers.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| retogo/qwen3.5-0.8b-rag-sft-open | 873.438.784 | no disponible | apache-2.0 | Hugging Face (0 descargas, 0 likes) | SFT para RAG en japonés sobre Qwen3.5-0.8B |
| Qwen/Qwen3.5-0.8B | no disponible en la información proporcionada | no disponible | no disponible | Hugging Face | Modelo base sin ajuste específico de RAG |
| Otros ajustes SFT de la familia Qwen de menos de 1B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificables |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo didáctico: la model card lo presenta como proyecto final de un curso, sin validación externa ni benchmarks publicados; no debe asumirse calidad de producción.
- Especialización estrecha: el entrenamiento se centra en QA sobre fragmentos de Wikipedia japonesa y en preguntas sintéticas de comparación de fechas de nacimiento; el rendimiento fuera de ese dominio no está documentado.
- Riesgo de alucinación: como cualquier modelo de menos de mil millones de parámetros, puede generar respuestas plausibles pero incorrectas, especialmente cuando el contexto recuperado no contiene la respuesta.
- Idiomas: no se declaran idiomas soportados; el entrenamiento es predominantemente en japonés y el comportamiento en castellano u otros idiomas no está evaluado.
- Contexto: la longitud de contexto no está documentada, lo que impide planificar el tamaño de los fragmentos recuperados con garantías.
- Licencia: apache-2.0 permite uso comercial, pero los datasets de entrenamiento tienen licencias CC BY-SA (algunos con atribución y compartir igual) y Apache-2.0; conviene revisar las obligaciones de atribución derivadas de los datos, en particular las de JSQuAD, JaQuAD, NIILC QA, JEMHopQA, auto-wiki-qa y el conjunto de fragmentos de Wikipedia.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusión pública que permitan contrastar su comportamiento.
- Formato: solo se publican safetensors; no hay GGUF ni cuantizaciones listas para usar, por lo que el despliegue en llama.cpp u Ollama requiere conversión previa.

## Enlaces

- Hugging Face: https://huggingface.co/retogo/qwen3.5-0.8b-rag-sft-open
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JGLUE / JSQuAD: https://github.com/yahoojapan/JGLUE
- JaQuAD: https://github.com/SkelterLabsInc/JaQuAD
- NIILC QA: https://github.com/mynlp/niilc-qa
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- TyDi QA: https://huggingface.co/datasets/google-research-datasets/tydiqa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Licencia CC BY-SA 3.0: https://creativecommons.org/licenses/by-sa/3.0/
