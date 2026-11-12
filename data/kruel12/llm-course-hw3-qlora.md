# Kruel12/llm-course-hw3-qlora

## Resumen

Kruel12/llm-course-hw3-qlora es un ajuste fino (fine-tuning) de un modelo de lenguaje orientado a la clasificación de sentimiento (análisis de tonalidad) en tuits. El autor lo publica como entrega de un trabajo práctico de un curso de LLM ("hw3") y emplea la técnica QLoRA, es decir, cuantización de 4 bits del modelo base combinada con adaptadores LoRA de bajo rango para el entrenamiento. El resultado se distribuye en formato `safetensors` y es cargable con la librería `transformers`.

La model card es extremadamente escueta: no indica el modelo base sobre el que se aplicó QLoRA, ni el número de parámetros, ni la longitud de contexto, ni la licencia, ni los idiomas soportados. El único dato cuantitativo publicado es un macro F1 de 0,7121 sobre la tarea de clasificación de sentimiento en tres clases (positivo, neutral, negativo), presumiblemente sobre un conjunto de evaluación de tuits similar al corpus de Sentiment140 o a un dataset de tweets de dominio deportivo y de actualidad.

Su relevancia es limitada y de carácter didáctico: sirve como ejemplo reproducible de un pipeline QLoRA para clasificación de texto y como referencia de los resultados que cabe esperar (F1 en torno a 0,71) con este tipo de ajuste en una tarea de tres clases. No está pensado como modelo de propósito general ni como base para producción sin una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base no especificado; ajuste QLoRA sobre transformer) |
| Parametros totales | no disponible (repo de 0,1 GB, compatible con un modelo base pequeno y adaptadores LoRA) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QLoRA (cuantizacion de 4 bits durante el entrenamiento); pesos publicados en safetensors, cuantizacion de inferencia no especificada |
| Idiomas soportados | no disponible (los ejemplos de la model card estan en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se detalla la arquitectura del modelo base. Por la técnica empleada (QLoRA) y el tamaño del repositorio (0,1 GB), se trata con alta probabilidad de un transformer decoder-only de tamaño pequeño o mediano, cargado en 4 bits y ajustado mediante adaptadores LoRA de bajo rango. Los adaptadores resultantes ocupan poco espacio, lo que explica el reducido tamaño del repositorio.

El entrenamiento se orienta a una tarea de clasificación de sentimiento en tres clases (positivo, neutral, negativo) sobre tuits. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo una fase de alineación (RLHF/DPO). Tampoco se documenta ninguna innovación técnica más allá del uso de QLoRA. El único resultado reportado es un macro F1 de 0,7121.

## Capacidades

- Clasificación de sentimiento en tres clases (positivo, neutral, negativo) sobre texto corto tipo tuit.
- Generación de texto condicionada al formato de plantilla empleado en el entrenamiento (se observan etiquetas `<|user|>` y `<|assistant|>` en los ejemplos).
- Manejo de texto en inglés en los ejemplos publicados; el resto de idiomas no está documentado.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- No se documenta un modo "thinking" ni capacidades multimodales.

## Casos de uso

- Análisis de sentimiento en redes sociales: el modelo clasifica tuits en positivo, neutral o negativo, lo que permite monitorizar la opinión pública sobre una marca o evento en tiempo casi real.
- Moderación y triaje de comentarios: permite priorizar revisiones humanas filtrando primero el tono negativo en flujos de moderación de comunidades.
- Análisis de reputación de marca: agregando las etiquetas predichas sobre grandes volúmenes de menciones se obtienen series temporales de sentimiento por producto o campaña.
- Investigación académica en PLN: sirve como línea base reproducible de un ajuste QLoRA para comparar con otros enfoques de clasificación de texto corto.
- Enriquecimiento de datasets: etiquetar automáticamente corpus de tuits para su posterior uso en entrenamiento de otros modelos o en estudios sociológicos.
- Prototipado docente: ejemplo práctico de pipeline QLoRA (cuantización 4 bits + adaptadores) para cursos y talleres de fine-tuning de LLM.
- Filtrado previo en atención al cliente: clasificar mensajes entrantes por tono para enrutarlos a colas de soporte prioritario o estándar.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Macro F1 (clasificación de sentimiento en tuits, 3 clases) | 0,7121 | Único dato publicado en la model card |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión al desconocerse el modelo base; por el tamaño del repo (0,1 GB) y el uso de QLoRA, es compatible con GPU de consumo de gama media (8-16 GB) en cuantización de 4 bits, aunque no se confirma.
- GPU recomendadas: no disponibles. Un modelo base pequeño en 4 bits puede ejecutarse en RTX 3060/4060 o superiores; no hay datos oficiales.
- Cabe en GPU de consumo: probablemente sí, pero no confirmado por el autor.
- Opciones de despliegue: `transformers` (librería declarada). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La model card no identifica el modelo base ni ofrece comparaciones con alternativas, por lo que no es posible establecer una comparativa rigurosa con otros modelos de clasificación de sentimiento o ajustes QLoRA.

## Limitaciones y advertencias

- Model card incompleta: no se especifica el modelo base, la licencia, los idiomas ni el contexto, lo que impide evaluar su idoneidad para producción.
- Licencia no disponible: no puede confirmarse el uso comercial; debe contactarse con el autor antes de cualquier despliegue comercial.
- Riesgo de sobreajuste al dominio de los tuits de entrenamiento (deportes, actualidad, redes sociales); el rendimiento puede degradarse en otros dominios.
- Macro F1 de 0,7121 en tres clases indica un margen de error considerable; no es adecuado para decisiones automatizadas de alto impacto sin supervisión humana.
- Riesgo de alucinación y de formatos de salida inconsistentes: los ejemplos de la model card muestran repeticiones de etiquetas y etiquetas `<|assistant|>` mal cerradas, lo que sugiere fragilidad en la generación.
- No hay información sobre sesgos demográficos, lingüísticos ni culturales.
- El formato de prompt debe replicar el usado en el entrenamiento; no se documenta la plantilla exacta más allá de los ejemplos mostrados.
- Proyecto de curso con 0 descargas y 0 likes: sin validación comunitaria ni mantenimiento conocido.

## Enlaces

- Hugging Face: https://huggingface.co/Kruel12/llm-course-hw3-qlora
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
