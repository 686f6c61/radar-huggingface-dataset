# newsbang/adjudex-0.8b-v7

## Resumen

Adjudex 0.8B v7 es un modelo de decisión tipada desarrollado por newsbang, un fine-tune de Qwen/Qwen3.5-0.8B (revisión `2fc06364715b967f1860aea9cf38778875588b17`) orientado a resolver preguntas de opción múltiple con hasta 255 alternativas. A diferencia de un modelo generativo convencional, Adjudex recibe un `state` (contexto) y un conjunto de `questions` tipadas, y devuelve una distribución de probabilidad sobre cada opción disponible. El modelo se publica bajo licencia Apache 2.0 y se distribuye con código de servicio propio (un servidor `/v1/systemone` derivado de Perplexity Decider v1.1).

Con 852.985.920 parámetros, Adjudex se posiciona en el segmento de modelos pequeños especializados, donde el coste de inferencia y el despliegue en una sola GPU son factores críticos. Su relevancia actual radica en la creciente demanda de "deciders" o motores de decisión que se integren como componentes deterministas dentro de pipelines de agentes, sistemas de enrutamiento o evaluadores automáticos, en lugar de depender de la generación libre de texto.

El modelo se evaluó con el benchmark Decision Index 0.3 (suite pública), obteniendo un índice global de 54.77 (raw 66.09) sobre 140.620 peticiones. La ficha técnica refleja las especificaciones declaradas por el autor y los datos extraídos del repositorio de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3_5Model) con modo de atención `block_bidirectional` y pooling de último token |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (límite del servidor de referencia) |
| Tipos de cuantizacion | no disponible (el run de evaluación usa BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), `readout.safetensors` para la cabeza de decisión |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Cabeza de decisión | `[255, hidden]` en BF16 |
| Pipeline | text-classification |
| Tamaño del repositorio | 1.7 GB |

## Arquitectura y entrenamiento

Adjudex 0.8B v7 emplea el backbone `Qwen3_5Model` con un modo de atención denominado `block_bidirectional`, configurado en `decision_config.json`, y pooling sobre el último token. Sobre el backbone se añade una cabeza de decisión lineal (`readout.safetensors`) de forma `[255, hidden]` en BF16, que proyecta el estado oculto final a un logit por cada una de las hasta 255 opciones posibles. La configuración incluye además códigos de opción, una temperatura de calibración y hashes de procedencia, lo que sugiere un proceso de calibración post-entrenamiento para ajustar las probabilidades emitidas.

No se dispone de información pública sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO u otras variantes de alineación. El modelo se distribuye como fine-tune del base Qwen3.5-0.8B, pero la model card no detalla la receta de ajuste ni los datos utilizados. La innovación técnica destacable es el enfoque de "motor de decisión tipada": en lugar de generar texto libre, el modelo produce una distribución de probabilidad normalizada sobre un conjunto cerrado de opciones, lo que facilita su integración en sistemas que requieren decisiones deterministas y auditables.

## Capacidades

- Decisión tipada sobre preguntas de opción múltiple con hasta 255 alternativas, devolviendo una probabilidad por opción.
- Clasificación de texto en sentido amplio (pipeline `text-classification`).
- Procesamiento de un `state` de contexto junto con preguntas estructuradas.
- Cabeza de decisión calibrada con temperatura configurable.
- Integración con servidor HTTP propio (`/v1/systemone`) para despliegue como servicio.
- Soporte de modo de atención bidireccional por bloques (`block_bidirectional`).
- No se documentan capacidades de generación de texto libre, tool calling, agentes multi-paso, visión, audio ni modo "thinking".
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Enrutamiento de consultas en sistemas de atención al cliente: el modelo recibe el estado de la conversación y una pregunta tipada (por ejemplo, "¿qué departamento debe gestionar esta consulta?") con las opciones posibles, y devuelve la probabilidad de cada una para derivar al equipo adecuado.
- Evaluación automática de respuestas en pipelines de anotación: dado un estado con la pregunta original y la respuesta candidata, Adjudex puede clasificar la calidad o corrección entre un conjunto cerrado de categorías, reduciendo el coste frente a un LLM generativo.
- Selección de herramienta en agentes: con una lista de herramientas disponibles como opciones (hasta 255), el modelo emite la probabilidad de que cada herramienta sea la adecuada para el estado actual, permitiendo un enrutamiento determinista y auditable.
- Clasificación de intenciones en asistentes conversacionales: el estado incluye el historial reciente y la pregunta tipada define las intenciones posibles; el modelo devuelve la distribución sobre intenciones para alimentar el diálogo.
- Moderación y triaje de contenido: clasificación de textos en categorías predefinidas (spam, tóxico, legítimo, etc.) con probabilidades calibradas que permiten fijar umbrales de decisión.
- Sistemas de recomendación con opciones discretas: cuando el catálogo de acciones o ítems es finito y acotado (hasta 255), el modelo puede puntuar cada opción dado un estado de usuario.
- Evaluación de recuperación en pipelines RAG: dado un estado con la consulta y un documento recuperado, el modelo puede decidir entre opciones como "relevante", "parcialmente relevante" o "irrelevante", con probabilidades para umbralizar.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (Decision Index 0.3, suite pública, ejecución completa con 140.620 peticiones):

| Area | Skill |
|---|---:|
| Knowledge | 30.88 |
| Language | 55.37 |
| Retrieval | 67.94 |
| Tools | 76.04 |
| Arts | 49.76 |
| **Decision Index 0.3** | **54.77** (raw 66.09) |

Notas sobre la ejecución: 345 peticiones (311 ToolRet, 25 POP909-CL, 6 BRIGHT, 2 API-Bank, 1 HLE) contienen una rama de pregunta que supera el límite de 8.192 tokens; el servidor las rechaza con HTTP 422 sin truncar y cuentan como incorrectas. El run se realizó con el motor `http` del kit, BF16 sobre CUDA, configuración por defecto del servidor (longitud máxima 8.192) y una A800 de 80 GB por proceso de servidor.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,7 GB para los pesos (852.985.920 parámetros × 2 bytes) más overhead de activaciones y contexto; el run de referencia usa una A800 de 80 GB por proceso de servidor, aunque el modelo es mucho más pequeño que la GPU empleada.
- GPU recomendadas: A800 80 GB (configuración usada en la evaluación), A100, H100 para despliegues de alta concurrencia; RTX 4090 y GPUs consumer con ≥8 GB de VRAM para inferencia en BF16 o cuantizada.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060 12 GB, RTX 4070, RTX 4090 y similares, dado el tamaño de pesos inferior a 2 GB en BF16.
- Opciones de despliegue: servidor propio `/v1/systemone` incluido en el repositorio (`python -m autojev.server`); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El autor no publica métricas de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Adjudex 0.8B v7 | 852.985.920 | 8.192 | Decisor tipado (fine-tune Qwen3.5-0.8B) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B | no disponible en la información | no disponible | LLM generativo base | no disponible en la información | Hugging Face |
| perplexity-ai/pplx-decider-v1.1-27b | 27B (según nombre) | no disponible | Decisor (código de servicio reutilizado) | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo está especializado en decisión sobre opciones cerradas (hasta 255); no es un generador de texto libre y no debe usarse como tal.
- El límite de contexto del servidor de referencia es de 8.192 tokens; las peticiones que lo superan se rechazan con HTTP 422 y cuentan como incorrectas en la evaluación (345 casos en el run publicado).
- El rendimiento en la categoría Knowledge es bajo (30.88), lo que sugiere limitaciones en conocimiento factual.
- No se documentan sesgos conocidos, pero al derivar de Qwen3.5-0.8B hereda los sesgos del modelo base, no cuantificados en la información disponible.
- Riesgo de alucinación: al emitir probabilidades sobre opciones cerradas, el riesgo se traslada a una calibración incorrecta; la temperatura de calibración está configurada pero no se documenta su validación fuera del suite público.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe.
- La licencia Apache 2.0 permite uso comercial, pero el código de servicio proviene de perplexity-ai/pplx-decider-v1.1-27b (Apache 2.0); debe revisarse el archivo NOTICE para cumplir con las atribuciones.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- No se documentan opciones de cuantización ni soporte para motores de inferencia estándar (vLLM, llama.cpp, Ollama, TGI), lo que limita las opciones de despliegue a la solución propietaria incluida.

## Enlaces

- Hugging Face: https://huggingface.co/newsbang/adjudex-0.8b-v7
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Código de servicio de referencia: https://huggingface.co/perplexity-ai/pplx-decider-v1.1-27b
