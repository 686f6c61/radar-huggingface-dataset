# newsbang/adjudex-9b-v2

## Resumen

Adjudex 9B v2 es un modelo de decisión tipado desarrollado por newsbang, afinado a partir de Qwen/Qwen3.5-9B. No es un modelo generativo al uso: recibe un `state` (contexto en texto) y un conjunto de `questions` tipadas de opción múltiple con hasta 255 opciones, y devuelve una distribución de probabilidad sobre cada opción. El modelo está pensado como motor de decisión ("decider") para sistemas que necesitan seleccionar acciones, herramientas o rutas de forma calibrada en lugar de generar texto libre.

El modelo conserva el backbone `Qwen3_5Model` de Qwen3.5-9B, con atención no causal en las capas de atención completa y pooling sobre el último token, y añade una cabeza de decisión BF16 de forma `[255, hidden]` almacenada en `readout.safetensors`. Con 8.392.695.024 parámetros totales y un repo de 16,8 GB, se distribuye en safetensors bajo licencia Apache 2.0.

Su relevancia actual radica en el enfoque: en lugar de pedir a un LLM que "elija" mediante generación de texto (con el coste de parseo y la fragilidad asociada), Adjudex expone una interfaz de clasificación con probabilidades por opción, lo que facilita la integración en pipelines de agentes, enrutado de herramientas y evaluación automática. El autor publica además una evaluación propia (Decision Index 0.3) con 140.620 peticiones sobre un suite público.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3_5Model) con atención no causal en capas de atención completa y pooling de último token; cabeza de decisión BF16 `[255, hidden]` |
| Parámetros totales | 8.392.695.024 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 8.192 tokens (límite máximo del servidor en la evaluación) |
| Tipos de cuantización | no disponible (la evaluación se realizó en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pytorch), más `readout.safetensors` y `decision_config.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B (revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`) y se presenta como un finetune con `base_model_relation: finetune`. La modificación arquitectónica principal es la sustitución del cabezal de lenguaje por un cabezal de decisión: una matriz BF16 de forma `[255, hidden]` que proyecta la representación del último token sobre un espacio de hasta 255 opciones. El backbone emplea atención no causal en las capas de atención completa, lo que permite que cada token atienda al contexto completo sin máscara causal, coherente con una tarea de clasificación/lectura global del estado en lugar de generación autorregresiva.

El repositorio incluye `decision_config.json`, que contiene los códigos de opción, la temperatura de calibración y hashes de procedencia. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El modelo se sirve mediante el código de `perplexity-ai/pplx-decider-v1.1-27b` (Apache 2.0), empaquetado como servidor `/v1/systemone` con el módulo `autojev.server`.

## Capacidades

- Decisión tipada sobre opción múltiple: devuelve una probabilidad para cada una de hasta 255 opciones dado un `state` y un conjunto de `questions`.
- Clasificación de texto en sentido amplio (pipeline declarado: `text-classification`).
- Enrutado de herramientas y selección de acciones en pipelines de agentes (evaluado en la categoría Tools con 78,35 en el Decision Index).
- Recuperación y selección sobre contextos (Retrieval: 69,29).
- Razonamiento sobre conocimiento (Knowledge: 45,44) y competencia lingüística (Language: 71,89).
- Capacidades artísticas/creativas evaluadas de forma específica (Arts: 49,99).
- Interfaz HTTP compatible con el motor `http` del kit de evaluación, con modelo servido como `jev-latest`.
- No se documentan en la información disponible capacidades de visión, audio, tool calling generativo ni modo "thinking".

## Casos de uso

- Enrutado de herramientas en agentes: dado el estado de la conversación y la lista de herramientas disponibles como opciones tipadas, el modelo devuelve la probabilidad de cada una; el orquestador selecciona la de mayor probabilidad o muestrea según la distribución calibrada. La categoría Tools (78,35) es la de mejor rendimiento en la evaluación publicada.
- Clasificación de intenciones en atención al cliente: cada intención se codifica como una opción y el modelo devuelve la distribución sobre ellas, permitiendo umbrales de confianza y derivación a humano cuando la probabilidad máxima es baja.
- Recuperación selectiva (routing de retrieval): decidir qué índice, colección o estrategia de búsqueda usar para una consulta, apoyándose en la puntuación de Retrieval (69,29) y en el contexto de hasta 8.192 tokens.
- Evaluación automática de respuestas: presentar varias respuestas candidatas como opciones y usar la probabilidad del modelo como señal de preferencia o ranking en pipelines de evaluación de calidad.
- Decisión multi-paso en agentes: en cada paso del bucle del agente, formular las acciones posibles como preguntas tipadas y usar la salida probabilística para seleccionar la siguiente acción, con trazabilidad de la confianza.
- Moderación o etiquetado por categorías: mapear categorías de contenido a opciones y usar la distribución resultante como etiquetado blando (soft labels) para entrenamiento o auditoría.
- Selección de modelo o configuración en un router de inferencia: elegir entre variantes de modelo, prompts o parámetros según el estado de la petición, con la ventaja de obtener probabilidades calibradas en lugar de texto que haya que parsear.

## Benchmarks y rendimiento

Resultados publicados por el autor en la evaluación Decision Index 0.3 (suite público, ejecución completa con `"complete": true` y 140.620 peticiones):

| Área | Puntuación |
|---|---:|
| Knowledge | 45,44 |
| Language | 71,89 |
| Retrieval | 69,29 |
| Tools | 78,35 |
| Arts | 49,99 |
| **Decision Index 0.3** | **63,52** (raw 72,23) |

Notas de la ejecución: 345 peticiones (311 ToolRet, 25 POP909-CL, 6 BRIGHT, 2 API-Bank, 1 HLE) tenían una rama de pregunta que superaba el límite de 8.192 tokens; el servidor las rechaza con HTTP 422 sin truncar y se contabilizan como incorrectas. La ejecución se realizó en BF16 sobre CUDA con un A800 de 80 GB por proceso de servidor y la configuración por defecto (longitud máxima 8.192). No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16,8 GB solo para pesos (8,39 mil millones de parámetros a 2 bytes), más overhead de activaciones y del servidor; en la práctica requiere una GPU con holgura por encima de 20 GB.
- GPU recomendadas: el autor documenta una A800 de 80 GB por proceso de servidor durante la evaluación; una A100 80 GB o H100 son adecuadas. Una RTX 4090 (24 GB) queda muy justa en BF16 y no está validada en la información disponible.
- Cabe en GPU de consumo: no confirmado; en BF16 probablemente no en tarjetas de 16 GB, y no se documentan cuantizaciones (GGUF, AWQ, GPTQ) que permitan reducir huella.
- Opciones de despliegue: servidor incluido `/v1/systemone` vía `python -m autojev.server` con variables `AUTOJEV_CHECKPOINT`, `AUTOJEV_HOST` y `PORT`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Adjudex 9B v2 | 8,39 B | 8.192 | Decisión tipada / clasificación con probabilidades | Apache 2.0 | HuggingFace (newsbang) |
| Qwen/Qwen3.5-9B (base) | ~9 B | no disponible en la información | Generación de texto | no disponible en la información | HuggingFace |
| perplexity-ai/pplx-decider-v1.1-27b | 27 B (según nombre) | no disponible | Decisor (código de serving reutilizado) | Apache 2.0 | HuggingFace |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada; la comparación se limita a parámetros, licencia y naturaleza de la tarea.

## Limitaciones y advertencias

- El límite de contexto práctico es de 8.192 tokens; las peticiones que exceden ese límite en alguna rama de pregunta son rechazadas con HTTP 422 y contabilizadas como error, sin truncado.
- El rendimiento en conocimiento (45,44) y en Arts (49,99) es notablemente inferior al de Tools (78,35) y Language (71,89); no es un modelo adecuado para tareas intensivas de conocimiento factual.
- Es un modelo de clasificación/decisión, no un generador de texto: no debe esperarse salida en lenguaje natural.
- No se documentan idiomas soportados; el comportamiento multilingüe es desconocido y debe validarse antes de usarlo fuera del inglés.
- No se publican datos sobre sesgos, tasa de alucinación ni robustez frente a entradas adversarias.
- La licencia Apache 2.0 permite uso comercial, pero el código de serving procede de perplexity-ai/pplx-decider-v1.1-27b (Apache 2.0) y debe respetarse el NOTICE incluido.
- El modelo depende de código personalizado (`custom-code`, módulo `autojev.server`); la integración en producción requiere revisar y mantener ese código.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que indica una validación externa muy limitada.
- No hay cuantizaciones publicadas, lo que restringe el despliegue en hardware de gama media.

## Enlaces

- HuggingFace: https://huggingface.co/newsbang/adjudex-9b-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Código de serving de referencia: https://huggingface.co/perplexity-ai/pplx-decider-v1.1-27b
