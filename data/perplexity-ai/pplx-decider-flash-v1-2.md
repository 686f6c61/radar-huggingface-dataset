# perplexity-ai/pplx-decider-flash-v1.2

## Resumen

pplx-decider-flash-v1.2 es un modelo de clasificación y decisión desarrollado por Perplexity AI, destilado a partir de los modelos de decisión pplx-decider-v1.2 de 27B parámetros. Está construido sobre Qwen3.5-4B como modelo base y conserva el mismo formato de petición conjunta, la misma API y el mismo soporte de texto e imagen que su hermano mayor, pero con aproximadamente una séptima parte del tamaño. Su función no es la generación libre de texto, sino responder preguntas estructuradas de tipo elección, verdadero/falso o puntuación sobre un estado de contexto dado.

El modelo se distribuye con licencia Apache 2.0, pesa 4.539.265.536 parámetros (unos 9,1 GB en BF16) y se entrenó mediante destilación de las distribuciones de probabilidad completas de los modelos profesor de 27B, no solo de sus respuestas. Además, combina varias ejecuciones de entrenamiento mediante model souping (promediado de pesos). Es relevante para desarrolladores que necesitan enrutamiento, clasificación o toma de decisiones automatizada con baja latencia y coste contenido, sacrificando algunos puntos de precisión frente al modelo de 27B.

La arquitectura subyacente es la de Qwen3.5-4B, un transformer multimodal con soporte de texto e imagen, aunque la model card no detalla la composición exacta de capas ni la longitud de contexto. El modelo se publica con código personalizado (`custom-code`) y requiere autenticación en Hugging Face, ya que el repositorio es privado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen3.5-4B (detalles de capas no disponibles) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16 en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer multimodal que acepta texto e imágenes, y se especializa mediante fine-tuning para tareas de decisión estructurada. La innovación principal es la destilación desde los modelos de decisión de 27B: el estudiante aprende las distribuciones de probabilidad completas de los profesores sobre sus peticiones de entrenamiento, no únicamente las etiquetas finales. Posteriormente, varias ejecuciones de entrenamiento se combinan mediante model souping, es decir, promediado de pesos, lo que suele mejorar la robustez y la calibración.

La model card indica que la destilación también mejora los resultados en tareas de decisión mantenidas fuera de todo el entrenamiento. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. El modelo no genera texto libre: su salida es una lectura de logits sobre opciones válidas, con probabilidades por opción y una puntuación de confianza.

## Capacidades

- Clasificación mediante preguntas de tipo `choice` con entre 1 y 255 opciones, devolviendo la opción elegida, las probabilidades por opción y la confianza.
- Preguntas de tipo `noul` (verdadero/falso) que devuelven P(true) como valor continuo.
- Preguntas de tipo `score` con entre 2 y 255 niveles ordenados, devolviendo el índice esperado del nivel, probabilidades, leyenda y confianza.
- Procesamiento conjunto de múltiples preguntas sobre un mismo estado de contexto en una sola secuencia.
- Soporte multimodal de imágenes de hasta 1,6 MP en las evaluaciones de visión.
- Acceso a logits crudos mediante `decider.logits(requests)`, útil para ranking con el margen de logit `true - false` en preguntas `noul`.
- Validación de esquema de petición con excepción `pplx_decider.RequestError` antes de cualquier cómputo.
- Procesamiento por lotes: acepta una lista de peticiones y devuelve las respuestas en el mismo orden.
- No dispone de tool calling, generación de texto libre ni modo de razonamiento multi-paso en el sentido habitual de los LLM generativos.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket como `state` y una pregunta `choice` con los equipos disponibles (facturación, soporte técnico, ventas), devolviendo la opción y la confianza para derivar automáticamente el caso al equipo correcto.
- Triaje de urgencia: una pregunta `noul` como "¿está el cliente bloqueado ahora mismo?" permite priorizar la cola de atención con un valor continuo de probabilidad, útil para sistemas de gestión de incidencias.
- Análisis de sentimiento granular: una pregunta `score` con niveles como "calmado, ligeramente molesto, frustrado, enfadado" devuelve el índice esperado del nivel y su distribución, lo que permite monitorizar la satisfacción en conversaciones multi-turno.
- Moderación de contenido: preguntas `choice` o `noul` sobre categorías de riesgo permiten clasificar textos e imágenes (hasta 1,6 MP) en pipelines de moderación, con probabilidades por categoría para umbrales ajustables.
- Clasificación de documentos con imágenes: al aceptar imágenes junto al estado textual, puede decidir sobre capturas de pantalla, formularios escaneados o diagramas en flujos de validación documental.
- Ranking de candidatos: usando el margen de logit `true - false` de preguntas `noul`, el modelo ordena alternativas sin la saturación que producen las probabilidades, adecuado para sistemas de recomendación o selección de respuestas.
- Extracción de decisiones en agentes: integrado como componente de decisión en un agente mayor, responde preguntas acotadas sobre el estado acumulado para elegir la siguiente acción, con latencia baja gracias a sus 4,5B parámetros.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre Decision Index 0.3 (público):

| Categoria | flash-v1.2, peticiones conjuntas | flash-v1.2, una pregunta por petición | decider-v1.2 (27B), peticiones conjuntas |
|---|---:|---:|---:|
| Knowledge | 42,0 | 41,4 | 56,3 |
| Language | 63,3 | 65,0 | 72,8 |
| Retrieval | 64,8 | 65,2 | 68,4 |
| Tools | 76,7 | 80,9 | 84,4 |
| Arts | 46,8 | 46,8 | 56,2 |
| Overall Decision Index | 58,88 | 60,05 | 68,09 |

| Vision Decision Index 0.3 (imágenes hasta 1,6 MP) | flash-v1.2 | decider-v1.2 (27B) |
|---|---:|---:|
| Overall | 72,53 | 77,43 |

La puntuación global usa la ponderación de la suite, no la media simple de categorías. En tareas de múltiples preguntas, el modelo flash es más preciso con una pregunta por petición, a diferencia del modelo de 27B; agrupar preguntas solo ayuda cuando son facetas estrechamente acopladas de una misma decisión (por ejemplo, +6,6 en SATA-Bench con una pregunta por opción).

## Requisitos de hardware

- VRAM estimada: unos 9 GiB para los pesos en BF16 más memoria de trabajo; la model card recomienda una GPU CUDA con espacio para aproximadamente 9 GiB de pesos BF16 y memoria adicional.
- GPU recomendadas: cualquier GPU CUDA con al menos 12-16 GB de VRAM para operar con holgura; A100, H100 o RTX 4090 son adecuadas.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más (RTX 4080, RTX 4090, RTX 5090); en tarjetas de 12 GB puede requerir cuantización, aunque el repositorio solo distribuye pesos BF16.
- Opciones de despliegue: el repositorio incluye código propio (`pplx_decider.Decider`) instalable con `pip install ./source`; existe una ruta rápida opcional con `pip install "./source[fast]"`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Requisitos de software: Python 3.12 o superior, y dependencias fijadas en `requirements.txt` (torch, transformers, safetensors, pillow, torchvision, huggingface-hub).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decision Index (overall) | Vision Index | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| pplx-decider-flash-v1.2 | 4,54B | no disponible | 58,88 (conjuntas) / 60,05 (una por petición) | 72,53 | Apache 2.0 | Repositorio privado con autenticación |
| pplx-decider-v1.2 | 27B (aprox., según model card) | no disponible | 68,09 (conjuntas) | 77,43 | Apache 2.0 | Repositorio privado con autenticación |
| Qwen3.5-4B (modelo base) | 4B | no disponible | no disponible | no disponible | no disponible | Público en Hugging Face |

El modelo flash sacrifica entre 8 y 14 puntos de Decision Index frente al de 27B según la categoría, pero reduce el tamaño a aproximadamente una séptima parte, lo que se traduce en menor coste y latencia. Frente al modelo base Qwen3.5-4B, la diferencia es la especialización en tareas de decisión estructurada y el soporte de la API `Decider`, que el modelo base no ofrece.

## Limitaciones y advertencias

- El modelo no genera texto libre: solo responde preguntas estructuradas de tipo `choice`, `noul` o `score`; no es adecuado para chat generativo ni para redacción.
- El repositorio es privado y requiere un token de Hugging Face con acceso; no es descargable de forma anónima.
- La precisión en tareas de conocimiento (42,0) y artes (46,8) es notablemente inferior a la del modelo de 27B (56,3 y 56,2), por lo que no conviene usarlo donde esos dominios sean críticos.
- Con peticiones conjuntas de múltiples preguntas, el rendimiento cae frente al modo de una pregunta por petición en la mayoría de tareas; la model card recomienda una pregunta por petición como opción segura por defecto.
- No se documentan los idiomas soportados ni la longitud de contexto, lo que dificulta planificar despliegues multilingües o con contextos largos.
- No se especifican sesgos conocidos ni tasas de alucinación; al tratarse de un clasificador, el riesgo principal es la calibración incorrecta de probabilidades en dominios alejados de los datos de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el acceso restringido al repositorio y el código personalizado deben verificarse antes de integrarlo en producción.
- No se documenta soporte para cuantización ni para motores de inferencia estándar (vLLM, llama.cpp, Ollama, TGI), lo que limita las opciones de despliegue escalable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/perplexity-ai/pplx-decider-flash-v1.2
- Modelo de 27B del que se destila: https://huggingface.co/perplexity-ai/pplx-decider-v1.2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
