# mlboydaisuke/decider-0.8b-CoreAI

## Resumen

decider-0.8b-CoreAI es la conversión al runtime **Core AI de Apple** del modelo Mapika/decider-0.8b, un modelo de decisión de 0,8 mil millones de parámetros derivado de Qwen/Qwen3.5-0.8B-Base. No es un modelo generativo: lee un estado (texto o JSON) junto con un conjunto de preguntas tipadas —Choice (2 a 255 opciones), Score (2 a 10 niveles descritos) y Noul (probabilidad de "sí")— y devuelve una probabilidad calibrada para cada opción, extraída de los logits de las letras de las etiquetas en la posición de respuesta. Nunca emite texto libre.

El valor del artefacto está en el formato de entrega: un bundle `.aimodel` de Core AI, cuantizado a int8, que se ejecuta en la GPU o en el Neural Engine de dispositivos Apple (iPhone, Mac con Apple Silicon) sin salir del dispositivo. Core AI es el sucesor de Core ML en iOS 27 y macOS 27, y esta conversión convierte un modelo de decisión en un componente desplegable dentro de una app nativa, con inferencia local y sin dependencia de red.

El repositorio es pequeño en tracción (4 descargas, 1 like, sin fila en el leaderboard DeviceMark) y su relevancia es más técnica que comunitaria: demuestra la receta de exportación de un LLM a Core AI (`int8hu --head-sym`, grafo S=1 sin bucle, motor GPU pipelined) y publica una puerta de paridad de probabilidades contra el código de inferencia fp32 original del autor, con 44/44 aciertos de argmax y un error máximo de 0,0084 en las probabilidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-0.8B-Base), exportado como grafo de decisión S=1 sin bucle sobre motor GPU pipelined |
| Parametros totales | 0,8 mil millones (0,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | int8 por bloques de 32 con cabeza int8 simétrica absmax (`--head-sym`); existe además un build fp16 de referencia |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Bundle `.aimodel` de Core AI (AOT-compilado a `.aimodelc`); no se publican safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-0.8B-Base, un transformer decoder-only de 0,8B parámetros. Sobre esa base, Mapika/decider-0.8b fue ajustado para una única tarea de lectura: dada una fila con el layout `state_first` —`Context:\n<estado>\n\nQuestion: <pregunta>\nOptions:\n(A) <opción>...\nAnswer: (`—, se leen los logits del siguiente token en la posición de respuesta. No hay plantilla de chat, ni token BOS, ni generación. Las etiquetas provienen del tokenizador del bundle: las letras `A`..`Z` y las primeras 229 cadenas de dos letras que se codifican como un único token (255 etiquetas en total; `AA` = 5840, `AB` = 1803, etc.). Solo se leen las primeras `nopts` etiquetas y se aplica `p = softmax(logits[labels[:nopts]] / 1.03)`.

Según la model card del autor, el ajuste consistió en una época sobre 1,47 millones de ejemplos. Las preguntas de tipo Score con `isolated_levels = true` se reescriben como una fila sí/no por nivel (`<pregunta>\nProposed answer: <nivel>\nDoes the proposed answer fit?`) y la probabilidad del nivel es la masa normalizada de "sí"; con `neutralize_none = false` las cadenas de opción se usan sin modificar. En la parte de conversión, el bundle reproduce la receta de publicación de Qwen3.5-0.8B cambiando el identificador de HuggingFace: cuantización `int8hu` (lineal int8 por bloque de 32, cabeza int8 simétrica absmax) y un grafo de decodificación S=1 sin bucle sobre el motor GPU pipelined, con 1,34 GB y 4.096 tokens de contexto.

## Capacidades

- Decisión tipada con salida de probabilidad: Choice (2–255 opciones), Score (2–10 niveles descritos) y Noul (probabilidad de "sí").
- Lectura de estados en texto plano o JSON, con la pregunta y las opciones en la misma fila.
- Probabilidad calibrada por opción (temperatura 1,03 fijada por el autor), apta para fijar umbrales de decisión en lugar de depender del argmax.
- Preguntas Score descompuestas en filas sí/no por nivel cuando el checkpoint trae `isolated_levels = true`.
- Procesamiento de cada pregunta como fila independiente, con reinicio de estado (`state reset proof` verificado: la fila 1 reejecutada produce logits idénticos bit a bit).
- No genera texto, no mantiene conversación, no soporta tool calling ni function calling, ni razonamiento multi-paso.
- Sin capacidades de visión ni de audio; sin capacidades multilingües (solo inglés).
- Comportamiento de clasificador de texto (`pipeline_tag: text-classification`), no de modelo de lenguaje.

## Casos de uso

- Enrutado y triaje de tickets en una app iOS nativa: una pregunta Choice con N categorías devuelve la probabilidad de cada una; la app fija un umbral (por ejemplo, escalar a un humano si la probabilidad de "facturación" no supera 0,7) sin enviar datos a un servidor.
- Puerta de decisión en agentes: usar Noul como "¿debo invocar esta herramienta?" con una probabilidad calibrada en lugar de una decisión binaria opaca, ejecutando el modelo en el propio dispositivo antes de hacer ninguna llamada de red.
- Corrección automática de cuestionarios y evaluaciones: una pregunta Score con niveles descritos se convierte en filas sí/no por nivel y la masa normalizada de "sí" da una puntuación graduada.
- Moderación y priorización de contenido: clasificación Choice sobre categorías de riesgo con probabilidad por categoría, útil para ordenar una cola de revisión por probabilidad en vez de por orden de llegada.
- Encuestas y extracción de preferencias on-device: afirmaciones evaluadas como Noul, aprovechando que el modelo nunca genera texto y por tanto no puede filtrar contenido del contexto del usuario.
- Filtrado previo (gating) en arquitecturas híbridas: decidir localmente si una consulta merece la pena enviar a un LLM mayor en el servidor, reduciendo coste y latencia de red.
- Enrutado de consultas en pipelines RAG de dispositivo: determinar si la consulta pertenece a código, calendario, contactos u otra fuente antes de recuperar el contexto.
- Investigación sobre calibración: al publicar el fixture con logits fp32 y probabilidades por fila, sirve como banco de pruebas para estudiar el efecto de la cuantización int8 en modelos pequeños de decisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible; el modelo no genera texto, por lo que esas pruebas no son aplicables. Los únicos datos disponibles son las métricas del autor, citadas desde su model card y no remedidas en esta conversión, y la puerta de paridad de lectura ejecutada por el autor de la conversión.

| Metrica (segun la model card de origen) | Valor |
|---|---|
| Precision en tarea | 0,776 |
| Precision en conjunto reservado (held-out) | 0,707 |
| Temperatura de calibracion | 1,03 |

| Medida en Apple M4 Max (macOS 27.0 26A428, 2026-09-21) | Build fp16 (referencia) | int8hu --head-sym (envio) |
|---|---:|---:|
| Argmax de letra = oraculo fp32 | 44/44 | 44/44 |
| Argmax sobre vocabulario completo cae dentro de las etiquetas de la fila | 44/44 | 44/44 |
| Maximo \|Δp\| sobre todas las probabilidades de opcion | 0,0050 | 0,0084 |
| Media de las medias por fila de \|Δp\| | 0,00018 | 0,00067 |
| Motor Swift pipelined, primer token greedy = etiqueta del oraculo | 44/44 | 44/44 |
| Prueba de reinicio de estado (fila 1 reejecutada, logits identicos bit a bit) | si | si |

El umbral de aceptación exigido fue argmax 44/44 sin exenciones, \|Δp\| máximo ≤ 0,02 y media de medias por fila ≤ 0,002 (cuatro veces el suelo del build fp16, que es el propio suelo de logits fp16 del grafo, no error de conversión). El fixture contiene 13 peticiones y 44 filas (23 filas Choice de 3 a 10 opciones, 9 Noul, 10 filas Score aisladas procedentes de 2 preguntas, una fila de 11 opciones y una de 255 opciones), con un margen mínimo top-2 del oráculo de 0,51, es decir, sin empates cercanos que pudieran eximir el argmax.

## Requisitos de hardware

- VRAM/espacio: el bundle int8 ocupa 1,34 GB; el repositorio de HuggingFace ocupa 1,3 GB.
- Plataforma probada: Apple M4 Max con macOS 27.0 (26A428), motor GPU pipelined y backend Metal.
- Encaja en hardware de consumo Apple: las etiquetas del repositorio incluyen `on-device` e `iphone`, y Core AI ejecuta en GPU o Neural Engine de dispositivos Apple. No hay soporte CUDA ni de GPU NVIDIA.
- Despliegue: runtime de Core AI (iOS 27 / macOS 27), exportación desde PyTorch con `coreai-torch` (para LLM, `coreai.llm.export`) y compilación AOT con `coreai-build compile --platform macOS --preferred-compute gpu --architecture h16c --expect-frequent-reshapes`.
- La compilación AOT es obligatoria, no una optimización: en 26A428 el JIT del runtime de Python para este grafo registró `MTL4CommandQueueErrorDomain error 1` en cada forward.
- Para obtener probabilidades hace falta la ruta AOT más el runtime de Python de Core AI, porque el motor pipelined muestrea en la GPU y no expone logits.
- vLLM, llama.cpp, Ollama y TGI no son opciones de despliegue aquí: no se publican pesos GGUF ni safetensors en este repositorio.
- Latencia y throughput: no disponible. El grafo es S=1 y sin bucle, es decir, un token por fila.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mlboydaisuke/decider-0.8b-CoreAI | 0,8B | 4.096 tokens | Bundle `.aimodel` int8 (+ build fp16) | Apache-2.0 | HuggingFace, 4 descargas |
| Mapika/decider-0.8b (modelo base) | 0,8B | no disponible | Pesos PyTorch, inferencia fp32 del autor | no disponible | HuggingFace (revision 1ea5412) |
| decider-2b (hermano mayor citado) | no disponible (el nombre sugiere ~2B) | no disponible | no disponible | no disponible | misma API `POST /v1/systemone` |
| Qwen/Qwen3.5-0.8B-Base | 0,8B | no disponible | no disponible | no disponible | HuggingFace |

La diferencia funcional con el modelo base es el empaquetado: el original expone pesos e inferencia fp32, mientras que esta conversión entrega un bundle int8 ejecutable en Core AI con una puerta de paridad de probabilidades documentada. La diferencia con Qwen3.5-0.8B-Base es de tarea: el modelo base es generativo, este solo produce probabilidades de decisión. No hay fila en DeviceMark para este modelo, el leaderboard de LLM on-device.

## Limitaciones y advertencias

- Modelo monolingüe en inglés (`language: en`); cualquier estado o pregunta en otro idioma queda fuera de su distribución de entrenamiento.
- No genera texto: no sirve para chat, resumen, redacción, código ni preguntas abiertas. Forzarlo a esas tareas no es un caso de uso válido.
- El contexto es de 4.096 tokens y las filas son largas por construcción: una fila de 255 opciones ocupa como mínimo 1.275 tokens y la del fixture llega a 1.965, así que estados extensos con muchas opciones pueden no caber.
- El riesgo de alucinación no se manifiesta como texto inventado, pero sí como probabilidad mal calibrada fuera de distribución. La temperatura 1,03 y las precisiones 0,776 / 0,707 son cifras del autor, no verificadas de forma independiente.
- No se documenta ningún análisis de sesgos en la información disponible.
- Licencia Apache-2.0, que permite uso comercial, pero se debe conservar el aviso de licencia; los términos del modelo base Mapika/decider-0.8b no se detallan en la información disponible.
- Dependencia fuerte de plataforma: requiere el runtime Core AI (iOS 27 / macOS 27) y no se ejecuta en Linux ni en GPU NVIDIA.
- En macOS 26A428 la ruta JIT del runtime de Python falla con `MTL4CommandQueueErrorDomain error 1`; hay que compilar AOT y usar el runtime de Python para leer probabilidades.
- La puerta de calidad solo cubre el fixture publicado (13 peticiones, 44 filas) con un margen mínimo top-2 de 0,51; no garantiza el mismo comportamiento en otros dominios.
- Tracción comunitaria mínima (4 descargas, 1 like, sin fila en DeviceMark): no hay validación externa del bundle.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlboydaisuke/decider-0.8b-CoreAI
- Modelo base: https://huggingface.co/Mapika/decider-0.8b
- Modelo base del ajuste: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Tarjeta del zoo (mismo texto con enlaces al repositorio): https://github.com/john-rocky/coreai-model-zoo/blob/main/models/decider-0.8b/README.md
- Script del oráculo fp32: https://github.com/john-rocky/coreai-model-zoo/blob/main/conversion/decider/oracle_decider.py
- Fixture con logits y probabilidades fp32: https://github.com/john-rocky/coreai-model-zoo/blob/main/models/decider-0.8b/fixtures-decider-0.8b.json
- Script de la puerta de lectura: https://github.com/john-rocky/coreai-model-zoo/blob/main/conversion/decider/readout_gate_decider.py
- Transcripción de la puerta de paridad: https://github.com/john-rocky/coreai-model-zoo/blob/main/models/decider-0.8b/gate-decider-0.8b-readout.json
- Leaderboard on-device DeviceMark (sin fila para este modelo): https://devicemark.github.io/
- La búsqueda web realizada no devolvió enlaces relevantes adicionales sobre este modelo.
