# newsbang/adjudex-9b-v3

## Resumen

Adjudex 9B v3 es un modelo de decisión tipado desarrollado por newsbang, construido mediante fine-tuning sobre Qwen/Qwen3.5-9B. A diferencia de un modelo generativo convencional, su función es recibir un `state` (contexto) junto con un conjunto de `questions` tipadas de opción múltiple (hasta 255 opciones por pregunta) y devolver una distribución de probabilidad sobre cada opción. Se sirve a través de un endpoint `/v1/systemone` que expone el motor de decisión.

El modelo se presenta como un "motor de decisión tipado" de 9B parámetros, con un backbone Qwen3_5Model adaptado con atención no causal en las capas de atención completa y pooling de último token, más una cabeza de decisión BF16 de forma `[255, hidden]` almacenada en `readout.safetensors`. La configuración de decisión (códigos de opción, temperatura de calibración y hashes de procedencia) se guarda en `decision_config.json`.

Es relevante porque propone un paradigma distinto al de los LLM generativos: en lugar de producir texto libre, emite probabilidades calibradas sobre opciones discretas, lo que facilita la integración en sistemas de enrutamiento, clasificación y agentes que necesitan decisiones auditables y deterministas. El modelo se distribuye con licencia Apache 2.0 y el código de servido proviene de perplexity-ai/pplx-decider-v1.1-27b.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3_5Model con atención no causal en capas de atención completa y pooling de último token; cabeza de decisión BF16 `[255, hidden]` |
| Parametros totales | 8.392.695.024 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (límite del servidor; las peticiones que lo exceden se rechazan con HTTP 422) |
| Tipos de cuantizacion | No disponible (la evaluación se realizó en BF16 sobre CUDA) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen3.5-9B (revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`) y lo adapta como motor de decisión: sustituye la generación autoregresiva por una cabeza de lectura (`readout.safetensors`) en BF16 con forma `[255, hidden]` que produce una probabilidad por cada opción posible. Las capas de atención completa emplean atención no causal y el pooling se realiza sobre el último token, lo que permite agregar la información del `state` y las `questions` en una representación única antes de la proyección a las 255 opciones.

No se proporciona información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card únicamente documenta la procedencia del backbone, los hashes de procedencia en `decision_config.json` y la temperatura de calibración incluida en la configuración de decisión. El código de servido se toma sin modificaciones de perplexity-ai/pplx-decider-v1.1-27b (Apache 2.0), según se indica en el fichero NOTICE.

## Capacidades

- Decisión tipada sobre opciones múltiples: recibe un `state` y `questions` con hasta 255 opciones y devuelve una probabilidad por opción.
- Clasificación de texto (pipeline `text-classification` según Hugging Face).
- Enrutamiento y selección entre alternativas discretas en pipelines de agentes.
- Evaluación de conocimiento, lenguaje, recuperación, herramientas y artes según el suite Decision Index 0.3.
- Soporte de tool calling implícito a través de la categoría Tools del benchmark (puntuación 85,70), orientada a la selección de herramientas.
- Capacidades multilingües: no documentadas explícitamente en la información disponible.
- No se documentan modos de pensamiento (thinking), visión, audio ni generación de texto libre.

## Casos de uso

- Enrutamiento de consultas en atención al cliente: el modelo recibe el historial de conversación como `state` y una pregunta tipada con las categorías de intención disponibles (hasta 255), devolviendo la probabilidad de cada una para derivar el caso al equipo adecuado. Es adecuado porque la salida es una distribución calibrada y auditable, no texto libre.
- Selección de herramientas en agentes: dado el contexto de la tarea y un catálogo de herramientas codificadas como opciones, el modelo puntúa cada herramienta candidata. La puntuación de 85,70 en la categoría Tools del Decision Index respalda este uso.
- Clasificación de documentos y tickets: con un contexto de hasta 8.192 tokens, puede clasificar documentos largos en taxonomías de hasta 255 clases en una sola pasada, sin necesidad de generar etiquetas textuales.
- Recuperación y ranking (retrieval): la puntuación de 68,61 en Retrieval sugiere su uso para reordenar candidatos o decidir qué fragmento recuperado es más relevante para una consulta.
- Moderación y políticas de contenido: mapear el texto a una pregunta tipada con las categorías de política aplicables y usar las probabilidades para umbrales de decisión configurables.
- Evaluación automatizada de respuestas: usar el modelo como juez de opción múltiple para comparar respuestas candidatas, aprovechando la calibración de temperatura incluida en `decision_config.json`.
- Sistemas de decisión con requisitos de auditoría: al devolver probabilidades sobre códigos de opción definidos en configuración, las decisiones son reproducibles y verificables, lo que facilita el cumplimiento normativo.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el suite público Decision Index 0.3 (ejecución completa, `"complete": true`, 140.620 peticiones):

| Area | Puntuacion |
|---|---:|
| Knowledge | 51,32 |
| Language | 72,75 |
| Retrieval | 68,61 |
| Tools | 85,70 |
| Arts | 59,65 |
| **Decision Index 0.3** | **67,44** (raw 75,37) |

Notas sobre la ejecución: 345 peticiones (311 ToolRet, 25 POP909-CL, 6 BRIGHT, 2 API-Bank, 1 HLE) tenían una rama de pregunta que excedía el límite de 8.192 tokens; el servidor las rechaza con HTTP 422 sin truncar y cuentan como incorrectas. La evaluación se realizó en BF16 sobre CUDA con un A800 80 GB por proceso de servidor y la configuración por defecto (longitud máxima 8.192).

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16,8 GB de pesos más overhead de activaciones y contexto; se recomienda un mínimo de 24 GB para margen operativo.
- GPU recomendadas: A800 80 GB (configuración usada en la evaluación oficial), A100 80 GB, H100 80 GB.
- GPU de consumo: el modelo en BF16 no cabe en GPUs de 24 GB sin cuantización; no se documentan formatos GGUF ni cuantizaciones oficiales, por lo que el despliegue en consumer GPU no está soportado de forma nativa según la información disponible.
- Opciones de despliegue: servidor propio incluido en el repositorio (`python -m autojev.server`) con variables de entorno `AUTOJEV_CHECKPOINT`, `AUTOJEV_HOST` y `PORT`; endpoint `/v1/systemone`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La evaluación empleó el motor `http` del kit contra el servidor local con `--option model=jev-latest`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Adjudex 9B v3 | 8,39B | 8.192 | Decisión tipada con cabeza de 255 opciones | Apache 2.0 | Hugging Face (newsbang) |
| Qwen3.5-9B (base) | ~9B | No disponible | Generación de texto autoregresiva | No disponible en la información | Hugging Face (Qwen) |
| pplx-decider-v1.1-27b | 27B | No disponible | Motor de decisión (código de servido reutilizado) | Apache 2.0 | Hugging Face (perplexity-ai) |

La comparativa con alternativas de la misma categoría (motores de decisión tipados) no está disponible más allá de la referencia al código de servido de pplx-decider-v1.1-27b. No se han publicado resultados de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo no genera texto libre: solo produce probabilidades sobre opciones predefinidas; no es adecuado para tareas generativas.
- Límite estricto de 8.192 tokens: las peticiones que exceden el límite se rechazan con HTTP 422 y cuentan como incorrectas en la evaluación; no hay truncado automático.
- 345 de las 140.620 peticiones de la evaluación oficial fallaron por este motivo, lo que afecta a la puntuación final del Decision Index.
- No se documentan sesgos conocidos, pero al derivar de Qwen3.5-9B hereda los sesgos del corpus de entrenamiento del backbone, no especificados en la información disponible.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la calibración de las probabilidades puede degradarse fuera de la distribución de entrenamiento; la temperatura de calibración está fijada en `decision_config.json`.
- Idiomas soportados no documentados; el rendimiento multilingüe es incierto.
- No se documentan cuantizaciones oficiales ni soporte para motores de inferencia estándar (vLLM, llama.cpp, Ollama, TGI), lo que limita las opciones de despliegue.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero el código de servido proviene de perplexity-ai/pplx-decider-v1.1-27b y está sujeto a las condiciones indicadas en el fichero NOTICE.
- El modelo requiere código personalizado (`custom-code`) para su ejecución, lo que añade complejidad de integración en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/newsbang/adjudex-9b-v3
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Código de servido de referencia: https://huggingface.co/perplexity-ai/pplx-decider-v1.1-27b
