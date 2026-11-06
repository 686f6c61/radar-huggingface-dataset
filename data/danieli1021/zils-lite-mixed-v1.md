# Danieli1021/zils-lite-mixed-v1

## Resumen

zils-lite-mixed-v1 es un ajuste fino (fine-tune) del modelo vllm-sr/d3-lite, que a su vez deriva de Qwen/Qwen3.5-0.8B. Lo publica el usuario Danieli1021 en Hugging Face como "soup body" para el pool d3-lite de Zils, un proyecto vinculado a la subred 127 de Bittensor. No es un modelo de propósito general: es un modelo de decisión que solo aporta pesos y está pensado para ejecutarse sobre el chasis y la capa de respuesta fijados por el pool.

El modelo tiene 852.985.920 parámetros (unos 853 millones) y un repositorio de 1,7 GB en formato safetensors. Se entrenó con LoRA de rango 64 durante una pasada sobre 39.617 filas y luego se fusionó en los pesos. La mitad del interés está en su enfoque: en lugar de generar texto libre, el modelo se evalúa con puntuaciones Brier sobre familias de "Outcomes" (predicciones probabilísticas de resultados), lo que lo sitúa en la categoría de modelos de decisión y calibración más que en la de asistentes conversacionales.

Su relevancia es acotada pero concreta: sirve como evidencia de los flujos de trabajo de Zils/Bittensor para enviar modelos ajustados a un pool compartido, y como ejemplo de fine-tuning de un modelo pequeño (0,8B) para una tarea de predicción calibrada. La licencia Apache 2.0 facilita su reutilización, aunque la model card advierte de que las ganancias reportadas son específicas de los flujos de datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B vía vllm-sr/d3-lite); detalles no disponibles |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 853 millones de parámetros, heredada a través del modelo base vllm-sr/d3-lite en la revisión 03560c26f5199c3c04129a2ccb38960c913635e0. La model card no detalla la configuración interna (número de capas, dimensiones, mecanismos de atención), por lo que esos datos no están disponibles.

El entrenamiento consistió en un ajuste LoRA de rango 64 (`python -m zils.teacher train --lora 64 --seed 2`) sobre una única pasada de 39.617 filas, posteriormente fusionado en los pesos. El corpus se compone de 37.000 filas del dataset zils-ai/zils-relay-answers (con probabilidades bajo Apache 2.0) y 2.617 filas etiquetadas con resultados públicos, construidas a partir de metadatos de arXiv, servidores Gerrit públicos, Wikipedia Articles for Creation y Stack Exchange, formuladas a finales de octubre de 2026. No se usaron datos de clientes ni ítems de exámenes privados. No se menciona RLHF ni DPO; el objetivo de entrenamiento es la predicción calibrada de resultados, evaluada con puntuación Brier.

## Capacidades

- Predicción probabilística de resultados ("Outcomes") sobre familias de preguntas, con calibración medida mediante Brier skill y Brier loss.
- Modelo de decisión: emite probabilidades calibradas en lugar de texto generativo libre, dentro de la capa de respuesta del pool d3-lite.
- Ajuste específico sobre flujos de arXiv (categorías), Gerrit, Wikipedia Articles for Creation y Stack Exchange.
- Capacidades de generación de texto, razonamiento general, código, matemáticas, visión o audio: no documentadas en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Modo "thinking" u otras capacidades especiales: no disponibles.

## Casos de uso

- Predicción de categorías de arXiv: el modelo se entrenó con ítems de flujos de categorías de arXiv y puede estimar la probabilidad de que un artículo pertenezca a una familia determinada; es el escenario donde la model card reporta la mayor parte de la ganancia.
- Triaje de cambios en Gerrit: dado un cambio propuesto en un servidor Gerrit público, el modelo puede estimar la probabilidad de aceptación o rechazo, útil para priorizar revisiones en equipos de ingeniería.
- Moderación de propuestas en Wikipedia Articles for Creation: estimación de la probabilidad de que una propuesta sea aceptada o rechazada, como señal auxiliar para revisores humanos.
- Clasificación de preguntas de Stack Exchange: predicción de la familia o resultado esperado de una pregunta, aprovechando que el modelo se ajustó con ese tipo de ítems.
- Evaluación comparativa de modelos de decisión: sirve como cuerpo de referencia en el pool d3-lite para comparar calibración frente al modelo base stock con intervalos bootstrap.
- Investigación sobre calibración en modelos pequeños: al ser un fine-tune de 0,8B con licencia Apache 2.0, es útil para estudiar cómo el ajuste LoRA afecta a la calibración probabilística en tareas de predicción.
- Integración en pipelines de Bittensor/Zils: como "soup body" del pool, se despliega sobre el chasis fijado para participar en la evaluación del pool, no como servicio independiente.

## Benchmarks y rendimiento

Resultados autoevaluados por el autor (no por un validador), comparados contra vllm-sr/d3-lite stock, con intervalos bootstrap del 95 %, sobre una RTX A6000:

| Prueba | Stock | Este modelo | Diferencia emparejada |
|---|---:|---:|---|
| Brier skill, seis familias Outcomes con al menos 40 ítems reservados (2.554 ítems) | 42,5 | 56,9 | +14,4 [+11,5, +17,5] |
| Brier loss, 38 familias públicas base-exam-seed (754 ítems, no vistos en entrenamiento) | 0,4255 | 0,4263 | -0,0008 [-0,0108, +0,0091] |
| Accuracy, las mismas familias seed | 66,7 % | 68,6 % | no bootstrapped |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 853 millones de parámetros, en fp16 rondaría 1,7 GB de pesos y en cuantizaciones de 8 o 4 bits bajaría aproximadamente a 0,9 GB y 0,5 GB respectivamente (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: la model card solo menciona una RTX A6000 para la evaluación; no se especifican requisitos oficiales.
- GPU de consumo: por tamaño, cabría en GPUs de consumo con 6-8 GB o más de VRAM, pero el modelo está pensado para ejecutarse sobre el chasis fijado del pool d3-lite, no de forma autónoma.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI; el autor indica que se ejecuta en el chasis y la capa de respuesta fijados por el pool.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---:|---|---|---|---|
| zils-lite-mixed-v1 | 853 M | No disponible | Apache 2.0 | Hugging Face (0 descargas, 0 likes) | Fine-tune de decisión para el pool d3-lite |
| vllm-sr/d3-lite (stock) | Similar (base del anterior) | No disponible | No disponible | Hugging Face | Referencia de comparación en los benchmarks del autor |
| Qwen/Qwen3.5-0.8B | ~0,8 B | No disponible | No disponible | Hugging Face | Modelo original de la cadena de derivación |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- La evaluación es autoevaluada por el autor, no por un validador independiente.
- Cuatro de las seis familias Outcomes son preguntas de categorías de arXiv, y el entrenamiento usó otros ítems de los mismos flujos, por lo que la mayor parte de la ganancia es específica de esos flujos.
- En las familias seed no vistas, el modelo está a la par del stock, no por encima (diferencia de Brier loss de -0,0008 con intervalo que cruza cero).
- Los flujos de reversiones de Wikipedia no se resolvieron a tiempo y no están cubiertos.
- El examen electoral privado puede dar un resultado distinto al reportado.
- Riesgo de alucinación y sesgos: no documentados, pero aplicables a un modelo de 0,8B ajustado sobre datos públicos.
- Limitaciones de contexto e idioma: no documentadas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo depende del chasis y la capa de respuesta del pool d3-lite, lo que condiciona su uso fuera de ese entorno.
- El texto de las preguntas de Wikipedia y Stack Exchange está sujeto a CC BY-SA; el repositorio no redistribuye texto de preguntas.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Danieli1021/zils-lite-mixed-v1
- Modelo base: https://huggingface.co/vllm-sr/d3-lite
- Dataset de respuestas: https://huggingface.co/datasets/zils-ai/zils-relay-answers
- Repositorio Zils (referenciado en la model card, commit 17551565cc6a7636b452765d205526a5f479aa7d): no disponible como URL directa en la información proporcionada
- Subred 127 de Bittensor (Zils): no disponible como URL directa en la información proporcionada
