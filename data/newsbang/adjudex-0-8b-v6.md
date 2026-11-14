# newsbang/adjudex-0.8b-v6

## Resumen

Adjudex 0.8B v6 es un modelo de decisión tipado desarrollado por newsbang y construido sobre el backbone Qwen/Qwen3.5-0.8B mediante fine-tuning. No es un modelo generativo al uso: recibe un `state` y un conjunto de `questions` tipadas (selección múltiple con hasta 255 opciones) y devuelve una distribución de probabilidad sobre cada opción. Está etiquetado en Hugging Face con el pipeline `text-classification` y los tags `decision-model` y `decider`.

El modelo resuelve un problema concreto: convertir un modelo de lenguaje pequeño en un motor de decisión determinista y calibrado, útil para enrutamiento, clasificación con muchas clases y selección de acciones en pipelines agénticos, donde no se necesita generar texto libre sino puntuar alternativas. Con 852.985.920 parámetros (aproximadamente 0,85B) y un contexto máximo de servicio de 8.192 tokens, está pensado para despliegues de bajo coste por proceso.

Su relevancia actual radica en la combinación de tamaño reducido, licencia Apache 2.0 y un formato de salida probabilístico con cabeza de decisión dedicada, lo que lo sitúa como alternativa a clasificadores tradicionales o a llamadas a LLM grandes para tareas de elección entre opciones. La información pública disponible es limitada: no hay datos de idiomas soportados, ni detalles del dataset de entrenamiento, ni benchmarks comparativos con otros modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3_5Model, con atención no causal en las capas de atención completa y last-token pooling; cabeza de decisión BF16 de forma [255, hidden] |
| Parametros totales | 852.985.920 (aprox. 0,85B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (límite máximo del servidor de referencia) |
| Tipos de cuantizacion | no disponible (la evaluación oficial se ejecutó en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (incluye `readout.safetensors` y pesos del backbone); configuración en `decision_config.json` |
| Modelo base | Qwen/Qwen3.5-0.8B (revision 2fc06364715b967f1860aea9cf38778875588b17) |
| Pipeline | text-classification |
| Libreria | pytorch |
| Tamano del repositorio | 1,7 GB |

## Arquitectura y entrenamiento

El modelo parte del backbone `Qwen3_5Model` de Qwen3.5-0.8B, al que se le aplica un fine-tuning para convertirlo en un motor de decisión. La modificación arquitectónica principal es el uso de atención no causal en las capas de atención completa, junto con last-token pooling: el estado final del último token se utiliza como representación agregada de la secuencia de entrada. Sobre esa representación se aplica una cabeza de decisión separada, almacenada en `readout.safetensors`, con forma `[255, hidden]` y precisión BF16, que produce una puntuación por cada opción posible (hasta 255).

El repositorio incluye además `decision_config.json`, que contiene los códigos de opción, la temperatura de calibración y los hashes de procedencia. No se dispone de información pública sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal más allá de la atención no causal mencionada.

## Capacidades

- Decisión tipada: recibe un `state` y preguntas de selección múltiple con hasta 255 opciones y devuelve una probabilidad para cada opción.
- Clasificación multiclase de gran cardinalidad, gracias a la cabeza de decisión de 255 salidas.
- Puntuación calibrada: incorpora una temperatura de calibración en `decision_config.json` para ajustar las probabilidades de salida.
- Enrutamiento y selección de acciones en pipelines, orientado a tareas de decisión más que a generación de texto libre.
- Procesamiento de contextos de hasta 8.192 tokens por petición en la configuración de servicio de referencia.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidades multilingües: no disponible.

## Casos de uso

- Enrutamiento de consultas en atención al cliente: el modelo puede recibir el estado de la conversación y un conjunto de intenciones predefinidas (hasta 255) y devolver la probabilidad de cada una, permitiendo derivar cada consulta al flujo adecuado sin generar texto libre.
- Clasificación de tickets y correos: dado un texto y una taxonomía cerrada de categorías, el modelo puntúa cada categoría y permite umbrales de confianza calibrados para escalado automático.
- Selección de herramientas en pipelines agénticos: con un estado del agente y una lista de herramientas disponibles como opciones, el modelo elige la acción más probable, actuando como decider dentro de un sistema mayor.
- Moderación y etiquetado de contenido: clasificación de textos contra políticas predefinidas con salida probabilística, útil para priorizar revisiones humanas según la confianza.
- Evaluación de respuestas en sistemas de QA: dado un estado con la pregunta y varias respuestas candidatas, el modelo puntúa cada una para seleccionar la mejor sin necesidad de un LLM generativo grande.
- Enrutamiento de modelos (model routing): decidir qué modelo o endpoint atenderá una petición en función del estado de la misma, con un coste de inferencia bajo al tratarse de un modelo de 0,85B.
- Experimentación en investigación sobre calibración y decisión: el formato de salida probabilístico y la configuración de calibración lo hacen adecuado para estudiar toma de decisiones con modelos pequeños.

## Benchmarks y rendimiento

Resultados publicados por el autor en la suite pública Decision Index 0.3:

| Area | Puntuacion |
|---|---:|
| Knowledge | 30,56 |
| Language | 54,44 |
| Retrieval | 66,33 |
| Tools | 81,40 |
| Arts | 49,55 |
| Decision Index 0.3 | 55,09 (raw 66,63) |

La ejecución completa se realizó con `"complete": true` y 140.620 peticiones. De ellas, 345 peticiones (311 de ToolRet, 25 de POP909-CL, 6 de BRIGHT, 2 de API-Bank y 1 de HLE) tenían una rama de pregunta que superaba el límite de 8.192 tokens; el servidor las rechaza con HTTP 422 sin truncar y cuentan como incorrectas. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; en BF16, los 852.985.920 parámetros ocupan aproximadamente 1,7 GB de pesos, a los que hay que sumar memoria para activaciones, caché KV y el servidor.
- La ejecución de referencia del Decision Index utilizó un A800 de 80 GB por proceso de servidor con BF16 en CUDA y configuración por defecto (longitud máxima 8.192).
- GPU recomendadas: A800 80 GB (configuración validada por el autor); no se documentan otras GPU.
- Compatibilidad con GPU de consumo: no disponible; por tamaño de pesos en BF16 cabría en GPUs con 8 GB o más, pero no hay validación publicada.
- Opciones de despliegue: servidor incluido `/v1/systemone` (código de Perplexity Decider v1.1 sin modificar), lanzado con `python -m autojev.server` y variables de entorno `AUTOJEV_CHECKPOINT`, `AUTOJEV_HOST` y `PORT`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. Como referencia estructural, el modelo se apoya en Qwen/Qwen3.5-0.8B, pero no se han publicado comparaciones directas con otros deciders o clasificadores de tamaño similar.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Adjudex 0.8B v6 | 852.985.920 | 8.192 | Apache 2.0 | Decisión tipada con cabeza de 255 opciones |
| Qwen/Qwen3.5-0.8B | no disponible | no disponible | no disponible | Modelo base generativo |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Información pública muy limitada: no se documentan idiomas soportados, composición del dataset de entrenamiento ni proceso de alineación.
- Sesgos conocidos: no disponibles; al derivar de Qwen3.5-0.8B, puede heredar sesgos del modelo base, pero no se han evaluado.
- Riesgo de alucinación: el formato de salida es probabilístico sobre opciones cerradas, lo que reduce la generación libre, pero las probabilidades pueden estar mal calibradas en dominios fuera de distribución.
- Límite estricto de contexto: las peticiones con ramas de pregunta que superan los 8.192 tokens son rechazadas con HTTP 422 y contabilizadas como error; no hay truncado automático.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el código de servicio proviene de perplexity-ai/pplx-decider-v1.1-27b (Apache 2.0) y debe respetarse el NOTICE.
- Dependencia de código personalizado: requiere `custom-code` y el servidor `autojev`; no es un modelo cargable directamente con pipelines estándar de transformers para generación.
- Sin soporte documentado de cuantización, tool calling, agentes multi-paso ni multimodalidad.
- El rendimiento en la suite Decision Index 0.3 es moderado (55,09), con áreas débiles en Knowledge (30,56) y Arts (49,55); conviene validar en el dominio objetivo antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/newsbang/adjudex-0.8b-v6
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Código de servicio de referencia: https://github.com/perplexity-ai/pplx-decider-v1.1-27b
- Paper, blog o demo adicionales: no disponible
