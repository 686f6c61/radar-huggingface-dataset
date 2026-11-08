# newsbang/adjudex-9b-v5

## Resumen

Adjudex 9B v5 es un modelo de decisión tipado (decision model / decider) desarrollado por newsbang, un fine-tune del modelo base Qwen/Qwen3.5-9B. A diferencia de un modelo generativo al uso, Adjudex no produce texto libre: recibe un `state` y un conjunto de `questions` tipadas (preguntas de opción múltiple con hasta 255 opciones cada una) y devuelve una distribución de probabilidad sobre cada opción posible. Esto lo convierte en un motor de clasificación y selección probabilística, no en un chatbot.

El modelo cuenta con 8.392.695.024 parámetros (aproximadamente 8,4 mil millones) y se distribuye en formato safetensors con un repositorio de 16,8 GB. La arquitectura subyacente es `Qwen3_5Model` con atención no causal en las capas de atención completa y pooling del último token, sobre la que se añade una cabeza de decisión BF16 de dimensiones `[255, hidden]` almacenada en `readout.safetensors`.

Su relevancia radica en que formaliza la toma de decisiones como una tarea de clasificación probabilística estructurada, con un índice de evaluación propio (Decision Index 0.3) y un servidor de inferencia incluido (`/v1/systemone`). La licencia Apache 2.0 facilita su uso comercial, aunque el ecosistema de herramientas y su comunidad son todavía muy incipientes (0 descargas y 0 likes en el momento de la ficha).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3_5Model con atención no causal en capas de atención completa, pooling del último token y cabeza de decisión BF16 `[255, hidden]` |
| Parametros totales | 8.392.695.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (límite máximo del servidor; las ramas de pregunta que lo superan se rechazan con HTTP 422) |
| Tipos de cuantizacion | no disponible (la evaluación se realizó en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) + `decision_config.json` |

## Arquitectura y entrenamiento

El backbone es `Qwen3_5Model` (revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`), modificado para emplear atención no causal en las capas de atención completa y pooling del último token. Sobre la representación resultante se aplica una cabeza de decisión (`readout.safetensors`) en BF16 con forma `[255, hidden]`, que proyecta el estado oculto sobre las 255 opciones posibles de cada pregunta. El archivo `decision_config.json` contiene los códigos de opción, la temperatura de calibración y hashes de procedencia.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card tampoco detalla el procedimiento de ajuste fino más allá de indicar la relación `finetune` con el modelo base. La innovación técnica destacable es el propio diseño de la tarea: en lugar de generar respuestas, el modelo puntúa cada opción de forma calibrada (temperatura de calibración incluida en la configuración), lo que permite umbrales de confianza y agregación probabilística en pipelines posteriores. El servidor de inferencia incluido es el código fuente de Perplexity Decider v1.1 (`perplexity-ai/pplx-decider-v1.1-27b`), sin modificaciones.

## Capacidades

- Clasificación probabilística tipada: devuelve una probabilidad para cada una de hasta 255 opciones por pregunta.
- Decisión estructurada sobre un `state` de entrada: selección de opciones en contextos de múltiples preguntas.
- Evaluación en áreas de conocimiento, lenguaje, recuperación, herramientas y artes según su propio Decision Index.
- Soporte de tool calling y decisión sobre herramientas: la puntuación en el área Tools es la más alta del suite (87,78).
- Recuperación y selección de información: puntuación de 72,17 en Retrieval.
- Razonamiento multi-paso implícito mediante encadenamiento de preguntas tipadas (el modelo no genera cadena de pensamiento visible).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Enrutamiento de herramientas en agentes: dado un estado de conversación y una lista tipada de herramientas disponibles, Adjudex devuelve la probabilidad de cada una; su puntuación de 87,78 en Tools lo hace adecuado como capa de selección antes de invocar funciones.
- Clasificación de intenciones en atención al cliente: con hasta 255 opciones por pregunta y contexto de 8.192 tokens, puede mapear mensajes multi-turno a categorías de soporte con distribución de confianza para derivación a agentes humanos.
- Selección de documentos en pipelines RAG: la puntuación de 72,17 en Retrieval sugiere su uso para elegir entre candidatos recuperados, asignando probabilidad a cada fragmento antes de la generación final.
- Moderación y etiquetado de contenido: la naturaleza de clasificación probabilística permite umbrales calibrados por temperatura para decidir cuándo escalar una revisión.
- Evaluación automática de respuestas: dado un estado con la pregunta y varias respuestas candidatas tipadas, el modelo puntúa cada opción, útil en pipelines de preferencia o QA.
- Sistemas de decisión con múltiples preguntas encadenadas: el formato `state` + `questions` permite construir árboles de decisión donde cada salida alimenta la siguiente consulta, con agregación de probabilidades.
- Clasificación de tickets o incidencias en producción: integrable vía HTTP contra el servidor `/v1/systemone` para etiquetar eventos con categorías predefinidas.

## Benchmarks y rendimiento

Resultados del Decision Index 0.3 (suite pública), ejecución completa con 140.620 peticiones:

| Area | Skill |
|---|---:|
| Knowledge | 53,71 |
| Language | 73,10 |
| Retrieval | 72,17 |
| Tools | 87,78 |
| Arts | 60,03 |
| **Decision Index 0.3** | **69,28** (raw 76,81) |

Nota: 345 peticiones (311 ToolRet, 25 POP909-CL, 6 BRIGHT, 2 API-Bank, 1 HLE) contienen una rama de pregunta que supera el límite de 8.192 tokens; el servidor las rechaza con HTTP 422 sin truncar y cuentan como incorrectas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Inferencia en BF16: el repositorio ocupa 16,8 GB, por lo que se necesita al menos esa cantidad de VRAM más overhead del servidor; la evaluación oficial usó una A800 de 80 GB por proceso de servidor.
- GPU recomendadas: A800 80GB (configuración validada por el autor), H100 80GB, A100 80GB.
- GPU de consumo: no hay datos publicados sobre cuantización, por lo que no se puede confirmar que quepa en RTX 4090 (24 GB) u otras consumer GPU en BF16.
- Despliegue: servidor incluido `/v1/systemone` (`python -m autojev.server` con variables `AUTOJEV_CHECKPOINT`, `AUTOJEV_HOST` y `PORT`); no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; la configuración de referencia usa ajustes por defecto del servidor con longitud máxima 8.192.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de decisión tipada en la documentación proporcionada. Como referencia del modelo base:

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| newsbang/adjudex-9b-v5 | 8,39B | 8.192 | Clasificación probabilística tipada | Apache 2.0 |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | Generación de texto | no disponible |
| perplexity-ai/pplx-decider-v1.1-27b | 27B | no disponible | Decision model (código reutilizado) | Apache 2.0 |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni mantiene conversaciones; solo puntúa opciones tipadas.
- Límite estricto de contexto de 8.192 tokens; las ramas de pregunta que lo exceden se rechazan con HTTP 422 y se contabilizan como fallo, sin truncado.
- Puntuación baja en Knowledge (53,71) y Arts (60,03), lo que limita su fiabilidad en dominios de conocimiento factual y contenido creativo.
- Riesgo de calibración: las probabilidades dependen de la temperatura de calibración incluida en `decision_config.json`; cambios en ella alteran los umbrales de decisión.
- Idiomas soportados no documentados: no se puede garantizar comportamiento multilingüe.
- Sesgos conocidos: no documentados en la información disponible.
- Sin datos de cuantización: el despliegue en hardware de menor capacidad no está validado.
- Madurez temprana: 0 descargas y 0 likes, sin comunidad ni validación externa conocida; el servidor depende de código de terceros (Perplexity Decider v1.1) con su propio NOTICE.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar el NOTICE del código de servido reutilizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/newsbang/adjudex-9b-v5
- Versión anterior (v3): https://huggingface.co/newsbang/adjudex-9b-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Código de servido de referencia: https://huggingface.co/perplexity-ai/pplx-decider-v1.1-27b
