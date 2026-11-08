# newsbang/adjudex-9b-v4

## Resumen

Adjudex 9B v4 es un modelo de decisión tipado desarrollado por newsbang, construido como un fine-tuning de Qwen/Qwen3.5-9B. No es un modelo generativo al uso: recibe un `state` y un conjunto de `questions` tipadas (selección múltiple con hasta 255 opciones) y devuelve una distribución de probabilidad sobre cada opción. Está publicado con licencia Apache 2.0 y orientado a tareas de clasificación y decisión automática.

El modelo emplea el backbone `Qwen3_5Model` con atención no causal en las capas de atención completa y pooling del último token, al que se añade una cabeza de decisión BF16 de dimensiones `[255, hidden]` almacenada en `readout.safetensors`. Incluye además un fichero `decision_config.json` con códigos de opción, temperatura de calibración y hashes de procedencia. Con 8.392.695.024 parámetros totales y un repositorio de 16,8 GB, se distribuye en formato safetensors para PyTorch.

Su relevancia radica en el enfoque: en lugar de generar texto libre, expone una interfaz de decisión estructurada con probabilidades calibradas, lo que facilita su integración en pipelines de enrutamiento, clasificación y agentes que necesitan elegir entre opciones discretas. El modelo reporta un Decision Index 0.3 de 68,87 (raw 76,45) sobre la suite pública, con un total de 140.620 peticiones completadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en `Qwen3_5Model`, atención no causal en capas de atención completa, pooling de último token y cabeza de decisión lineal |
| Parametros totales | 8.392.695.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (límite del servidor; peticiones que lo exceden se rechazan con HTTP 422) |
| Tipos de cuantizacion | BF16 (único formato documentado para el despliegue de referencia) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`readout.safetensors` en BF16, más pesos del backbone) |

## Arquitectura y entrenamiento

El modelo parte del backbone `Qwen3_5Model` (revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a` de Qwen/Qwen3.5-9B) y sustituye la cabeza de generación por una cabeza de decisión `readout.safetensors` en BF16 con forma `[255, hidden]`. La arquitectura modifica el backbone para usar atención no causal en las capas de atención completa y aplica pooling sobre el último token para producir un vector que se proyecta sobre las opciones disponibles. El modelo se sirve a través de un servidor `/v1/systemone` incluido en el repositorio, derivado del código de perplexity-ai/pplx-decider-v1.1-27b (Apache 2.0).

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El fichero `decision_config.json` incluye una temperatura de calibración y hashes de procedencia, lo que sugiere un proceso de calibración posterior al entrenamiento, pero los detalles no están documentados en la información disponible. La innovación principal es la interfaz de decisión tipada: en lugar de generar texto, el modelo produce una probabilidad por opción, lo que permite umbrales, rankings y agregación determinista.

## Capacidades

- Decisión tipada: recibe un `state` y preguntas de selección múltiple con hasta 255 opciones y devuelve una probabilidad por opción.
- Clasificación de texto: pipeline declarado `text-classification`.
- Enrutamiento y selección entre alternativas discretas (herramientas, respuestas, categorías).
- Razonamiento de conocimiento y recuperación, según las áreas evaluadas en la suite pública (Knowledge 52,58; Retrieval 72,60).
- Capacidades de uso de herramientas, con la puntuación más alta del conjunto (Tools 86,94).
- Capacidades lingüísticas (Language 72,94) y artísticas (Arts 59,90) según la evaluación publicada.
- No se documenta soporte de tool calling generativo, agentes multi-paso ni modos de pensamiento explícitos; la interfaz es de decisión, no de generación.

## Casos de uso

- Enrutamiento de consultas en atención al cliente: el modelo recibe el estado de la conversación y una lista de intenciones posibles, y devuelve la probabilidad de cada una para derivar al departamento adecuado; encaja por su interfaz de decisión con hasta 255 opciones.
- Selección de herramientas en pipelines de agentes: dado un contexto y un catálogo de herramientas, el modelo puntúa cada opción; su área Tools (86,94) es la más alta de su evaluación publicada.
- Clasificación de documentos y tickets: uso como clasificador multi-clase con probabilidades calibradas, aprovechando la temperatura de calibración incluida en `decision_config.json`.
- Recuperación y reranking: con una puntuación de Retrieval de 72,60, puede puntuar candidatos recuperados frente a una consulta y reordenarlos antes de pasarlos a un generador.
- Evaluación automática de respuestas: dado un estado y un conjunto de respuestas candidatas, asignar probabilidad a cada una para seleccionar la mejor sin generación adicional.
- Moderación y decisión de políticas: elegir entre categorías de política predefinidas con umbrales ajustables sobre la probabilidad devuelta.
- Enrutamiento de modelos (model routing): decidir qué modelo o endpoint debe atender una petición en función del estado y las opciones disponibles.

## Benchmarks y rendimiento

Evaluación publicada por el autor sobre la suite pública Decision Index 0.3:

| Area | Puntuacion |
|---|---:|
| Knowledge | 52,58 |
| Language | 72,94 |
| Retrieval | 72,60 |
| Tools | 86,94 |
| Arts | 59,90 |
| Decision Index 0.3 | 68,87 (raw 76,45) |

La ejecución se completó con `"complete": true` sobre 140.620 peticiones. 345 peticiones (311 ToolRet, 25 POP909-CL, 6 BRIGHT, 2 API-Bank, 1 HLE) tenían una rama de pregunta por encima del límite de 8.192 tokens; el servidor las rechaza con HTTP 422 sin truncar y cuentan como incorrectas. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: en BF16, los 8.392.695.024 parámetros ocupan aproximadamente 16,8 GB solo en pesos; con overhead de activaciones y servidor, se recomienda al menos 24-32 GB de VRAM. La ejecución de referencia usó una A800 de 80 GB por proceso de servidor.
- GPU recomendadas: A800 80 GB (configuración documentada), A100 80 GB, H100 80 GB. En GPUs de 24 GB (RTX 4090, RTX 3090) el modelo en BF16 probablemente no cabe con margen suficiente; no se documenta soporte de cuantización a 8 o 4 bits.
- Consumer GPU: no se documenta compatibilidad. El despliegue de referencia es BF16 en CUDA, sin opciones de cuantización publicadas.
- Opciones de despliegue: servidor incluido `/v1/systemone` (`python -m autojev.server` con variables `AUTOJEV_CHECKPOINT`, `AUTOJEV_HOST` y `PORT`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La evaluación usó el motor `http` del kit con `base_url` apuntando al servidor y `model=jev-latest`, con longitud máxima 8.192.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Adjudex 9B v4 | 8.392.695.024 | 8.192 | Decisión tipada con probabilidades por opción | Apache 2.0 | Hugging Face (`newsbang/adjudex-9b-v4`) |
| Qwen/Qwen3.5-9B (base) | no disponible | no disponible | Generación de texto | no disponible | Hugging Face |
| newsbang/adjudex-9b-v3 | no disponible | no disponible | Decisión tipada (versión anterior) | no disponible | Hugging Face (`newsbang/adjudex-9b-v3`) |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo no genera texto libre: su salida es una distribución de probabilidad sobre opciones predefinidas, lo que limita su uso a tareas de decisión y clasificación.
- Límite estricto de 8.192 tokens: las peticiones que lo exceden se rechazan con HTTP 422 sin truncar y se contabilizan como incorrectas, como ocurrió en 345 casos de la evaluación publicada.
- El área de Knowledge obtiene la puntuación más baja (52,58), lo que sugiere menor fiabilidad en preguntas que dependen de conocimiento factual.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni comportamiento multilingüe; los idiomas soportados figuran como no disponibles.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa documentada.
- La licencia Apache 2.0 permite uso comercial, pero el código de servido deriva de perplexity-ai/pplx-decider-v1.1-27b y requiere revisar el fichero NOTICE para cumplir las atribuciones.
- No se documentan opciones de cuantización ni soporte para motores de inferencia estándar (vLLM, llama.cpp, TGI), lo que puede complicar el despliegue en infraestructura existente.
- El modelo depende de código personalizado (`custom-code`), por lo que la reproducibilidad requiere usar el servidor incluido en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/newsbang/adjudex-9b-v4
- Versión anterior v3: https://huggingface.co/newsbang/adjudex-9b-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Código de servido de referencia: https://huggingface.co/perplexity-ai/pplx-decider-v1.1-27b
