# newsbang/adjudex-9b

## Resumen

Adjudex 9B es un modelo de decisión tipado de 9B parámetros desarrollado por newsbang, un fine-tune del modelo base Qwen/Qwen3.5-9B (revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`). No es un modelo generativo en el sentido habitual: recibe un `state` y un conjunto de `questions` tipadas con opciones múltiples (hasta 255 opciones por pregunta) y devuelve una probabilidad calibrada para cada opción. Se sirve a través de un endpoint `/v1/systemone` y se evalúa con el arnés Decision Index 0.3.

El modelo se presenta como un "motor de decisiones" (decision engine) orientado a tareas de clasificación y selección entre alternativas, con una cabeza de decisión específica (`readout.safetensors`, BF16 de forma `[255, hidden]`) y un fichero `decision_config.json` que contiene los códigos de opción, la temperatura de calibración y los hashes de procedencia. La relevancia actual radica en su enfoque poco común: en lugar de generar texto libre, produce distribuciones de probabilidad sobre opciones discretas, lo que facilita su integración en pipelines de enrutamiento, selección de herramientas o toma de decisiones estructurada.

El modelo tiene 8.392.695.024 parámetros totales según los safetensors, un tamaño de repositorio de 16,8 GB y licencia Apache 2.0. La información pública disponible es escasa: no se detallan idiomas soportados ni composición del dataset de entrenamiento, y no hay resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) más allá del Decision Index reportado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en `Qwen3_5Model` con atención no causal en las capas de atención completa y pooling del último token |
| Parametros totales | 8.392.695.024 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 8.192 tokens (límite máximo del servidor de referencia) |
| Tipos de cuantizacion | no disponible (el run de evaluación usó BF16 en CUDA) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), más `readout.safetensors` y `decision_config.json` |

## Arquitectura y entrenamiento

El backbone es `Qwen3_5Model` con atención no causal en las capas de atención completa y pooling del último token. Sobre ese backbone se añade una cabeza de decisión `readout.safetensors` en BF16 con forma `[255, hidden]`, que proyecta el estado oculto del último token a un vector de logits sobre las opciones disponibles (hasta 255). El fichero `decision_config.json` almacena los códigos de opción, la temperatura de calibración y los hashes de procedencia, lo que sugiere un proceso de calibración posterior al entrenamiento para ajustar las probabilidades de salida.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El modelo se distribuye como fine-tune del base Qwen3.5-9B, pero la model card no detalla la receta de ajuste. La innovación técnica destacable es el uso de atención no causal en las capas de atención completa combinada con pooling del último token, un patrón habitual en modelos de clasificación y decisión que necesitan una representación global de la secuencia de entrada.

## Capacidades

- Decisión tipada: recibe un `state` y preguntas de opción múltiple (hasta 255 opciones) y devuelve una probabilidad por opción.
- Clasificación de texto: pipeline declarado `text-classification`.
- Selección de herramientas: la evaluación incluye el área Tools con una puntuación de 80,10 en el Decision Index.
- Recuperación y selección de contexto: área Retrieval con 66,86.
- Conocimiento y lenguaje: áreas Knowledge (43,33) y Language (71,65).
- Razonamiento artístico/musical: área Arts con 47,55 (incluye POP909-CL en la suite).
- No se documenta soporte de tool calling generativo, agentes multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Enrutamiento de consultas en atención al cliente: el modelo puede clasificar cada consulta entrante en una de hasta 255 categorías predefinidas y devolver la probabilidad de cada una, lo que permite derivar al agente o al departamento adecuado con un umbral de confianza configurable.
- Selección de herramientas en pipelines de agentes: dado un estado de conversación y un catálogo de herramientas disponibles, el modelo asigna probabilidad a cada herramienta; la puntuación de 80,10 en el área Tools sugiere que está entrenado para este escenario.
- Clasificación de documentos y tickets: con contexto de 8.192 tokens, puede procesar documentos de longitud media y decidir entre categorías discretas (tipo de incidencia, prioridad, etiqueta) sin generar texto libre.
- Filtrado y ranking de candidatos: en tareas de recuperación (Retrieval 66,86), puede puntuar opciones candidatas y ordenarlas por probabilidad, útil en sistemas de búsqueda o recomendación con opciones discretas.
- Evaluación de respuestas en pipelines de anotación: dado un estado y un conjunto de respuestas candidatas, el modelo devuelve la probabilidad de cada una, lo que facilita la selección automática o el enrutamiento a revisión humana.
- Decisión musical o artística estructurada: el área Arts (47,55) y la inclusión de POP909-CL en la suite indican uso en tareas de selección dentro de dominios creativos con opciones discretas.
- Servicio de decisión como microservicio: el servidor `/v1/systemone` empaquetado permite desplegar el modelo como endpoint HTTP con una A800 80GB por proceso, integrándolo en arquitecturas existentes mediante llamadas REST.

## Benchmarks y rendimiento

Resultados del Decision Index 0.3 (suite pública) reportados por el autor:

| Area | Skill |
|---|---:|
| Knowledge | 43,33 |
| Language | 71,65 |
| Retrieval | 66,86 |
| Tools | 80,10 |
| Arts | 47,55 |
| **Decision Index 0.3** | **62,51** (raw 71,55) |

Notas del run: `"complete": true`, 140.620 peticiones. 345 peticiones (311 ToolRet, 25 POP909-CL, 6 BRIGHT, 2 API-Bank, 1 HLE) tenían una rama de pregunta por encima del límite de 8.192 tokens; el servidor las rechaza con HTTP 422 sin truncar y cuentan como incorrectas. No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16,8 GB de pesos más overhead de activaciones y KV cache; el run de referencia usó una A800 de 80 GB por proceso de servidor.
- GPU recomendadas: A800 80GB (configuración validada por el autor), H100 80GB, A100 80GB.
- En GPU de consumo: no se documenta soporte de cuantización ni despliegue en GPUs consumer; el modelo se distribuye en BF16 y el servidor de referencia asume CUDA con BF16.
- Opciones de despliegue: servidor empaquetado `/v1/systemone` (`python -m autojev.server`), con variables `AUTOJEV_CHECKPOINT`, `AUTOJEV_HOST` y `PORT`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Adjudex 9B | 8.392.695.024 | 8.192 | Decisión tipada con cabeza de 255 opciones | Apache 2.0 | Hugging Face (newsbang/adjudex-9b) |
| Qwen3.5-9B (base) | no disponible en la información | no disponible | Generación de texto | no disponible | Hugging Face (Qwen/Qwen3.5-9B) |
| perplexity-ai/pplx-decider-v1.1-27b | no disponible en la información | no disponible | Decisión (código de servido reutilizado) | Apache 2.0 | Hugging Face |
| newsbang/adjudex-9b-v3 | no disponible en la información | no disponible | Decisión tipada (versión posterior) | Apache 2.0 | Hugging Face |

No se dispone de datos suficientes para comparar rendimiento numérico con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: el modelo devuelve probabilidades sobre opciones predefinidas, por lo que el riesgo se traslada a una calibración incorrecta de las probabilidades más que a la generación de contenido inventado; no se documenta la fiabilidad de la calibración.
- Límite de contexto: 8.192 tokens; las peticiones con ramas de pregunta que superan ese límite son rechazadas con HTTP 422 y contadas como incorrectas en la evaluación.
- Idiomas: no se especifican los idiomas soportados.
- Licencia: Apache 2.0 permite uso comercial, pero el código de servido procede de perplexity-ai/pplx-decider-v1.1-27b (Apache 2.0); debe revisarse el fichero NOTICE para cumplir con las atribuciones.
- Dependencia de código personalizado: el modelo requiere el servidor empaquetado (`autojev.server`) y no se documenta compatibilidad con stacks de inferencia estándar, lo que limita su portabilidad.
- Madurez: 50 descargas y 0 likes en el momento de la consulta; existe una versión posterior (`adjudex-9b-v3`) que podría corregir problemas de la versión evaluada.
- Sin datos de benchmarks convencionales: no es posible comparar con modelos generativos en tareas estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/newsbang/adjudex-9b
- Versión posterior: https://huggingface.co/newsbang/adjudex-9b-v3
- Discusiones de la versión v3: https://huggingface.co/newsbang/adjudex-9b-v3/discussions
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Código de servido de referencia: https://huggingface.co/perplexity-ai/pplx-decider-v1.1-27b
