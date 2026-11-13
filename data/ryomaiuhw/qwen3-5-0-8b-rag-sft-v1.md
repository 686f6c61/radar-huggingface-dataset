# RyomaIUHW/qwen3.5-0.8b-rag-sft-v1

## Resumen

RyomaIUHW/qwen3.5-0.8b-rag-sft-v1 es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario RyomaIUHW en Hugging Face. El modelo está orientado a tareas de generación aumentada por recuperación (RAG) en japonés, según se desprende de los conjuntos de datos empleados en el entrenamiento: JEMHopQA, NIILC QA, JSQuAD/JGLUE y un conjunto de fragmentos de Wikipedia en japonés. Con 852.985.920 parámetros totales (aproximadamente 0,85 mil millones), se sitúa en la categoría de modelos pequeños, pensados para despliegue en hardware modesto.

El modelo se distribuye en formato safetensors, con un tamaño de repositorio de 1,7 GB, y bajo licencia CC BY-SA 4.0, lo que condiciona su uso comercial a la atribución y a la compartición bajo la misma licencia. La model card es muy escueta: no documenta arquitectura interna, longitud de contexto, idiomas soportados, proceso de entrenamiento ni resultados de evaluación. La información disponible se limita a los metadatos de Hugging Face y a la atribución de los datos de entrenamiento.

Su relevancia radica en ser un ejemplo de ajuste fino especializado en RAG sobre un modelo base pequeño de la familia Qwen 3.5, con datos mayoritariamente japoneses. No obstante, la ausencia de benchmarks, de documentación técnica y de cualquier métrica de rendimiento hace que su evaluación rigurosa requiera pruebas propias por parte del usuario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Qwen/Qwen3.5-0.8B; presumiblemente transformer, sin confirmar) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (los datos de entrenamiento son mayoritariamente en japonés) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo más allá de que deriva del modelo base Qwen/Qwen3.5-0.8B (revisión `2fc06364715b967f1860aea9cf38778875588b17`, licencia Apache-2.0). No se documenta si emplea atención estándar, atención lineal, mezcla de expertos u otra variante, ni se detallan innovaciones técnicas como decodificación especulativa.

El entrenamiento es un ajuste fino supervisado (SFT) sobre cuatro fuentes de datos, todas ellas licenciadas bajo CC BY-SA 4.0 y modificadas (filtradas y reformateadas) para el entrenamiento: JEMHopQA (preguntas de razonamiento multi-salto), NIILC QA (preguntas y respuestas), JSQuAD/JGLUE (comprensión lectora en japonés) y un conjunto de fragmentos derivados de Wikipedia en japonés (`bumbuboon/llm-course-final-2026`) empleados como pasajes de contexto recuperado. No se indica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto condicionada a contexto recuperado, orientada a tareas de RAG.
- Respuesta a preguntas (QA), incluyendo preguntas de razonamiento multi-salto según los datos de JEMHopQA.
- Comprensión lectora sobre pasajes en japonés (JSQuAD/JGLUE).
- Manejo de contexto en japonés procedente de Wikipedia.
- Capacidad multilingüe: no documentada; los datos de entrenamiento son mayoritariamente en japonés.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado (JEMHopQA implica cierto razonamiento multi-salto, pero no se especifica soporte de agentes).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Sistemas de preguntas y respuestas sobre documentación interna en japonés: el modelo puede recibir pasajes recuperados por un retriever y generar respuestas fundamentadas en ellos, aprovechando su ajuste sobre JSQuAD y NIILC QA.
- Búsqueda aumentada sobre Wikipedia japonesa: integrado en un pipeline RAG, puede responder consultas a partir de fragmentos de Wikipedia, dado que se entrenó con pasajes de esa fuente.
- Asistentes de atención al cliente en japonés: con un retriever sobre la base de conocimiento de la empresa, el modelo puede generar respuestas acotadas al contexto, aunque su tamaño reducido limita la complejidad de las respuestas.
- Extracción de respuestas en documentos largos: su entrenamiento en comprensión lectora lo hace adecuado para localizar y sintetizar información en pasajes recuperados.
- Prototipado rápido de pipelines RAG: su tamaño (0,85 mil millones de parámetros) permite desplegarlo en GPUs de consumo para experimentación y evaluación de componentes de recuperación.
- Evaluación comparativa de retrievers: al ser un modelo pequeño y especializado, puede servir como generador fijo para medir el impacto de distintas estrategias de recuperación en la calidad final de la respuesta.
- Filtrado y reformulación de preguntas multi-salto: útil en sistemas que descomponen consultas complejas en subpreguntas antes de la recuperación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para un modelo de 0,85 mil millones de parámetros, una estimación orientativa sería de aproximadamente 1,7 GB en fp16, 0,9 GB en int8 y 0,5 GB en int4, aunque estas cifras no están confirmadas por el autor.
- GPU recomendadas: no disponibles. Por tamaño, cabría esperar que funcione en GPUs de consumo como RTX 3060, RTX 4060 o superiores, así como en GPUs de datacenter (A100, H100) sin necesidad de ellas.
- ¿Cabe en GPU de consumo? Muy probablemente sí, en la mayoría de GPUs con al menos 4 GB de VRAM, aunque no se documenta oficialmente.
- Opciones de despliegue: no documentadas. Al estar en safetensors, sería compatible con frameworks como Transformers, vLLM o TGI, y potencialmente convertible a GGUF para llama.cpp u Ollama, pero no hay confirmación del autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| RyomaIUHW/qwen3.5-0.8b-rag-sft-v1 | 852.985.920 | no disponible | CC BY-SA 4.0 | RAG en japonés (SFT) |
| Qwen/Qwen3.5-0.8B (base) | no disponible (≈0,8B) | no disponible | Apache-2.0 | Modelo generalista |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoría, ya que no se han publicado benchmarks ni especificaciones detalladas del modelo ajustado ni de sus posibles competidores en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de documentación técnica: no es posible verificar su calidad ni compararla con alternativas sin evaluación propia.
- Sesgos conocidos: no documentados; al entrenarse con datos japoneses de Wikipedia y QA, puede heredar sesgos de esas fuentes.
- Riesgo de alucinación: presente, como en cualquier modelo de lenguaje; su especialización en RAG no elimina la posibilidad de generar contenido no fundamentado en el contexto.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada; el soporte multilingüe no está confirmado y los datos de entrenamiento son mayoritariamente en japonés, por lo que el rendimiento en castellano es incierto.
- Restricciones de licencia: CC BY-SA 4.0 obliga a atribuir la autoría y a compartir las obras derivadas bajo la misma licencia, lo que puede ser incompatible con usos comerciales que requieran licencias permisivas. Además, el modelo base Qwen3.5-0.8B está bajo Apache-2.0, lo que introduce una posible tensión entre ambas licencias que conviene revisar.
- Caveat para producción: con 0 descargas y 0 likes, el modelo no tiene validación comunitaria; se recomienda auditar los pesos y validar el comportamiento antes de cualquier despliegue.
- El repositorio tiene un tamaño de 1,7 GB, coherente con pesos en fp16, pero no se confirma la disponibilidad de cuantizaciones.

## Enlaces

- Hugging Face: https://huggingface.co/RyomaIUHW/qwen3.5-0.8b-rag-sft-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- NIILC QA: https://github.com/mynlp/niilc-qa
- JSQuAD / JGLUE: https://github.com/yahoojapan/JGLUE
- Conjunto de fragmentos: https://huggingface.co/datasets/bumbuboon/llm-course-final-2026
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
