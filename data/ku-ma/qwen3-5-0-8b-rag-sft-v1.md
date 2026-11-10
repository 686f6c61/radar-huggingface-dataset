# ku-ma/qwen3.5-0.8b-rag-sft-v1

## Resumen

`ku-ma/qwen3.5-0.8b-rag-sft-v1` es un ajuste fino por LoRA (fusionado en los pesos finales) del modelo base `Qwen/Qwen3.5-0.8B`, desarrollado por el usuario ku-ma. El modelo está especializado en la generación de respuestas para sistemas de recuperación aumentada (RAG) sobre Wikipedia en japonés, y se presenta como entrega del trabajo final del curso "LLM講座2 2026". Con 852.985.920 parámetros, es un modelo compacto orientado a despliegue ligero en tareas de question answering con contexto recuperado.

La relevancia de este modelo es acotada y muy específica: no es un modelo de propósito general, sino un artefacto educativo afinado sobre un conjunto de datos de QA japonés (JEMHopQA, NIILC QA, JSQuAD/JGLUE y fragmentos de Wikipedia en japonés). Su utilidad principal es servir como generador de respuestas en un pipeline RAG en japonés, no como asistente conversacional general.

La información pública disponible es escasa: no hay model card detallada más allá de la procedencia de los datos, no se publican benchmarks ni licencia explícita, y el modelo no registra descargas ni interacciones en el momento de la consulta. Todo lo que sigue se basa exclusivamente en los metadatos y la model card proporcionados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada del modelo base Qwen3.5-0.8B; no se detalla en la información disponible) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | japonés (ja) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-0.8B` (revisión `2fc06364715b967f1860aea9cf38778875588b17`) y se ha ajustado mediante LoRA, con posterior fusión de los adaptadores en los pesos del modelo base. La arquitectura subyacente es la del modelo Qwen3.5-0.8B; la información proporcionada no detalla la composición interna (número de capas, atención, cabezas, etc.) ni la longitud de contexto nativa.

El entrenamiento se realizó sobre un conjunto de datos de question answering en japonés compuesto por JEMHopQA (RIKEN, CC BY-SA 4.0), NIILC QA (CC BY-SA 4.0), JSQuAD/JGLUE (CC BY-SA 4.0) y una colección de fragmentos derivados de Wikipedia en japonés (CC BY-SA 4.0). Según la model card, los datos se filtraron y reformatearon para el entrenamiento, extrayendo mecánicamente ejemplos en los que el resultado de la recuperación contenía la cadena de respuesta y ajustándolos al formato de prompt del sistema RAG. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de respuestas en japonés condicionadas a contexto recuperado (RAG), que es el objetivo declarado del ajuste.
- Question answering extractivo y de respuesta corta sobre pasajes de Wikipedia en japonés, derivado del entrenamiento con JSQuAD, JEMHopQA y NIILC QA.
- Manejo de preguntas de múltiples saltos (multi-hop), por la inclusión de JEMHopQA en el corpus de entrenamiento.
- Generación de texto en japonés como capacidad heredada del modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al japonés según los metadatos; no se documenta soporte de otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Generación de respuestas en un pipeline RAG sobre Wikipedia en japonés: el modelo recibe los fragmentos recuperados y la pregunta del usuario, y produce la respuesta final; es exactamente el escenario para el que fue entrenado.
- Sistemas de preguntas y respuestas de dominio público en japonés: integrado como componente generador tras un recuperador (por ejemplo, búsqueda léxica o densa sobre un índice de Wikipedia), permite construir asistentes de consulta factual con bajo coste de inferencia.
- Preguntas de múltiples saltos: gracias al entrenamiento con JEMHopQA, puede abordar consultas que requieren combinar información de varios pasajes recuperados.
- Prototipado y docencia: su tamaño reducido y su origen académico lo hacen adecuado para entornos de aprendizaje donde se quiera ilustrar el ajuste fino por LoRA y la evaluación de pipelines RAG.
- Evaluación de recuperadores: al ser un generador especializado en RAG, puede usarse como componente fijo para comparar la calidad de distintos recuperadores midiendo la exactitud de la respuesta final.
- Despliegue en entornos con recursos limitados: con menos de mil millones de parámetros, es viable en CPU o en GPUs de consumo para tareas de generación de respuestas cortas, siempre que se valide su calidad en el dominio objetivo.
- Extracción de respuestas sobre corpus documentales en japonés: con el formato de prompt adecuado, puede emplearse para localizar y sintetizar respuestas a partir de documentación interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 852.985.920 parámetros, en fp16 requeriría aproximadamente 1,7 GB solo para los pesos, y en cuantizaciones de 8 o 4 bits bajaría a alrededor de 0,9 GB y 0,5 GB respectivamente (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cualquier GPU con al menos 2-4 GB de VRAM libre debería poder alojar los pesos en fp16.
- GPU de consumo: previsiblemente sí, en modelos como RTX 3060, RTX 4060 o superiores, así como en CPU para inferencia de baja concurrencia (no confirmado por el autor).
- Opciones de despliegue: no se documentan en la información proporcionada; al ser pesos safetensors compatibles con la arquitectura Qwen3.5, cabría esperar soporte en frameworks habituales (transformers, vLLM, llama.cpp/Ollama previa conversión a GGUF), pero esto no está confirmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma principal | Licencia | Enfoque |
|---|---|---|---|---|---|
| ku-ma/qwen3.5-0.8b-rag-sft-v1 | 852.985.920 | no disponible | japonés | no disponible | RAG sobre Wikipedia en japonés (LoRA fusionado) |
| Qwen/Qwen3.5-0.8B (base) | no disponible en la información | no disponible | multilingüe (no confirmado) | no disponible | Modelo base de propósito general |
| Alternativas comparables de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del modelo ni de alternativas directamente comparables en la información proporcionada, por lo que la comparativa se limita al modelo base del que deriva.

## Limitaciones y advertencias

- Especialización estrecha: el ajuste está orientado a RAG sobre Wikipedia en japonés; su comportamiento fuera de ese dominio o en otros idiomas no está documentado y probablemente sea deficiente.
- Licencia no especificada: no se indica la licencia del modelo, lo que impide confirmar si el uso comercial está permitido; además, los datos de entrenamiento son CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir igual.
- Riesgo de alucinación: como todo modelo generativo de este tamaño, puede producir respuestas plausibles pero incorrectas, especialmente si el contexto recuperado no contiene la respuesta.
- Sesgos: no documentados; al entrenarse sobre Wikipedia en japonés y datasets académicos, puede heredar los sesgos de esas fuentes.
- Limitaciones de contexto: la longitud de contexto no está publicada, por lo que no se puede garantizar el manejo de pasajes largos o múltiples documentos recuperados.
- Madurez y soporte: el modelo tiene cero descargas y cero interacciones, es un artefacto académico sin mantenimiento documentado ni garantías de producción.
- Ausencia de benchmarks: no hay evaluación publicada que permita estimar su calidad frente a alternativas.
- Dependencia del formato de prompt: al haberse entrenado con un formato específico de RAG, desviarse de él puede degradar significativamente los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ku-ma/qwen3.5-0.8b-rag-sft-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- NIILC QA: https://github.com/mynlp/niilc-qa
- JSQuAD / JGLUE: https://github.com/yahoojapan/JGLUE
- Licencia de los datos (CC BY-SA 4.0): https://creativecommons.org/licenses/by-sa/4.0/
