# RyomaIUHW/qwen3.5-0.8b-rag-sft-v2

## Resumen

RyomaIUHW/qwen3.5-0.8b-rag-sft-v2 es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario RyomaIUHW en Hugging Face. El modelo está orientado a tareas de generación aumentada por recuperación (RAG) en japonés, según se desprende de los conjuntos de datos empleados en su entrenamiento: JEMHopQA, NIILC QA, JSQuAD/JGLUE y un corpus de fragmentos derivado de Wikipedia en japonés. Con 852.985.920 parámetros (aproximadamente 0,85 mil millones), se sitúa en la categoría de modelos pequeños, diseñados para despliegues con recursos limitados.

El modelo se distribuye en formato safetensors con un tamaño de repositorio de 1,7 GB, lo que corresponde a pesos en precisión de 16 bits. La licencia es CC BY-SA 4.0, condicionada por las licencias de los datos de entrenamiento utilizados, todos ellos bajo la misma licencia. No se han publicado datos sobre arquitectura interna, longitud de contexto, idiomas soportados ni resultados de benchmarks en la información disponible.

Su relevancia actual radica en la exploración de ajustes finos especializados en RAG para japonés sobre modelos compactos, un nicho con pocas alternativas públicas. No obstante, la ausencia de documentación técnica detallada y de métricas de evaluación limita su adopción directa en producción sin una validación adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.5-0.8B, familia Qwen 3.5; detalles internos no publicados) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp16/bf16 por el tamaño del repo) |
| Idiomas soportados | no disponible (los datos de entrenamiento son mayoritariamente en japonés) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna del modelo más allá de que se trata de un ajuste fino del modelo base Qwen/Qwen3.5-0.8B (revisión `2fc06364715b967f1860aea9cf38778875588b17`, bajo licencia Apache-2.0). No se especifica si emplea atención completa, atención lineal, mezcla de expertos u otra variante, ni el número de capas, dimensiones ocultas o cabezas de atención.

El entrenamiento consistió en un ajuste fino supervisado (SFT) sobre cuatro fuentes de datos, todas ellas bajo licencia CC BY-SA 4.0 y modificadas mediante filtrado y reformateo: JEMHopQA (preguntas de múltiples saltos), NIILC QA (preguntas y respuestas), JSQuAD/JGLUE (comprensión lectora en japonés) y un conjunto de fragmentos derivado de Wikipedia en japonés procedente de `bumbuboon/llm-course-final-2026`, empleado como pasajes de contexto recuperado. No se documenta el número de tokens de entrenamiento, la composición exacta del dataset, la existencia de RLHF/DPO ni innovaciones técnicas adicionales.

## Capacidades

- Generación de texto en japonés, con especialización en tareas de pregunta-respuesta sobre contexto recuperado (RAG).
- Respuesta a preguntas de múltiples saltos, gracias al entrenamiento con JEMHopQA.
- Comprensión lectora y extracción de respuestas a partir de pasajes de contexto, derivada del uso de JSQuAD/JGLUE y del corpus de fragmentos de Wikipedia.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el entrenamiento con JEMHopQA sugiere cierta capacidad de razonamiento multi-salto, pero no se documenta como capacidad de agente).
- Capacidades multilingües: no disponibles; los datos de entrenamiento son en japonés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Sistemas de pregunta-respuesta sobre documentación interna en japonés: el modelo puede recibir pasajes recuperados por un motor de búsqueda vectorial y generar respuestas extractivas o abstractivas, aprovechando su ajuste específico sobre corpus de Wikipedia japonesa y QA.
- Atención al cliente en japonés con base de conocimiento: integrado en un pipeline RAG, permite responder consultas frecuentes a partir de manuales o FAQs, con un coste de inferencia bajo gracias a su tamaño de 0,85 mil millones de parámetros.
- Búsqueda aumentada en bases de conocimiento legales o administrativas niponas: su entrenamiento con NIILC QA lo hace adecuado para dominios de preguntas y respuestas estructuradas, siempre que se validen las respuestas contra la fuente.
- Extracción de respuestas en tareas de comprensión lectora: útil para anotación asistida o generación de datasets de QA a partir de documentos, dado su ajuste con JSQuAD/JGLUE.
- Prototipado rápido de asistentes RAG en entornos con GPU de consumo: al ser un modelo pequeño, puede ejecutarse en hardware modesto para pruebas de concepto antes de escalar a modelos mayores.
- Filtrado y reformulación de pasajes recuperados: el modelo puede emplearse para condensar o reescribir fragmentos de contexto antes de pasarlos a un modelo mayor en una arquitectura de pipeline, reduciendo el coste total.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por el tamaño de parámetros (0,85 mil millones), en fp16 los pesos ocuparían aproximadamente 1,7 GB, y en cuantización de 8 bits alrededor de 0,9 GB; en 4 bits, en torno a 0,5 GB. Estas cifras son estimaciones por tamaño y no proceden de documentación del autor.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar ejecución en GPU de consumo como RTX 3060, RTX 4060 o superiores, así como en A100/H100 para despliegues por lotes, pero no se ha validado.
- ¿Cabe en GPU de consumo? Muy probablemente sí, dado el tamaño del modelo, aunque no se documenta.
- Opciones de despliegue: no disponible. Al ser un modelo de la familia Qwen con pesos safetensors, podría cargarse con transformers, vLLM o TGI, y potencialmente convertirse a GGUF para llama.cpp u Ollama, pero no se confirma compatibilidad.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| RyomaIUHW/qwen3.5-0.8b-rag-sft-v2 | 852.985.920 | no disponible | CC BY-SA 4.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | no disponible en la informacion | no disponible | Apache-2.0 | Hugging Face |
| Alternativas de RAG en japones de tamano similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre corpus japoneses (Wikipedia, JEMHopQA, NIILC, JSQuAD), puede heredar sesgos de esas fuentes.
- Riesgo de alucinación: presente como en cualquier modelo generativo; el ajuste para RAG no elimina la posibilidad de generar respuestas no fundamentadas en el contexto.
- Limitaciones de contexto e idioma: no se documenta la longitud de contexto; el entrenamiento es predominantemente en japonés, por lo que el rendimiento en otros idiomas es incierto.
- Restricciones de licencia: CC BY-SA 4.0 implica obligación de atribución y de compartir bajo la misma licencia las obras derivadas; las condiciones de uso comercial deben revisarse con cuidado, ya que la licencia share-alike puede afectar a productos derivados.
- Caveats para producción: ausencia de benchmarks, de documentación de arquitectura y de guía de despliegue; se recomienda validación exhaustiva antes de usar en entornos productivos.
- El modelo base Qwen/Qwen3.5-0.8B está bajo Apache-2.0, pero el ajuste fino se redistribuye bajo CC BY-SA 4.0, lo que puede imponer condiciones adicionales a los usuarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RyomaIUHW/qwen3.5-0.8b-rag-sft-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- NIILC QA: https://github.com/mynlp/niilc-qa
- JSQuAD / JGLUE: https://github.com/yahoojapan/JGLUE
- Corpus de fragmentos (bumbuboon/llm-course-final-2026): https://huggingface.co/bumbuboon/llm-course-final-2026
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
