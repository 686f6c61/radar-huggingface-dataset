# husky8/Inkling-2-Mini-Fast-Browser-Use

## Resumen

Inkling-2-Mini-Fast-Browser-Use es una edición de pesos (weight edit) del modelo multimodal Inkling-2-Mini desarrollado por Thinking Machines Lab. El autor de la edición es el usuario de Hugging Face husky8, que publica una variante optimizada específicamente para tareas de automatización de navegador (browser use). No se trata de un modelo entrenado desde cero ni de un fine-tuning convencional, sino de una modificación directa de la matriz de salida (`model.llm.unembed.weight`) sin entrenamiento adicional, orientada a acelerar la generación de acciones de navegación.

El modelo conserva la arquitectura y capacidades del base (pipeline image-text-to-text, 26.388.646.440 parámetros totales según los safetensors) y añade un sesgo hacia la emisión rápida de comandos de clic y la supresión de tokens de razonamiento en tareas de navegador. El resultado reportado por el autor es una reducción drástica de tiempos de tarea en WebArena y MiniWoB++, con speedups verificados de hasta 8,95× en tareas de consulta de pedidos.

La relevancia actual radica en que demuestra una técnica de "programación en el espacio de pesos" aplicable a agentes de navegador: en lugar de reentrenar o hacer prompting, se editan filas concretas de la matriz de salida para eliminar cadenas de pensamiento innecesarias y forzar la emisión directa de comandos. El modelo se distribuye en formato safetensors de 8 bits (modelopt) y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Inkling-2-Mini; edición de pesos sobre la matriz de salida |
| Parametros totales | 26.388.646.440 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (modelopt); pesos en safetensors |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (8-bit, modelopt) |

## Arquitectura y entrenamiento

El modelo parte de Inkling-2-Mini, un transformer multimodal de Thinking Machines Lab con pipeline image-text-to-text. La edición no implica entrenamiento: se modifica directamente la matriz `model.llm.unembed.weight`, que proyecta los estados ocultos al vocabulario de salida. En concreto, los checkpoints de consulta de pedidos intercambian las filas de texto de respuesta y de razonamiento (índices 200004 y 200008) y ajustan las filas del comando de clic y de fin de generación (34 y 200006). La edición del checkpoint de pedidos completados modificó 9.192 valores en BF16.

El objetivo técnico es eliminar la generación de tokens de razonamiento (thinking) en tareas de navegador donde no aportan valor, forzando la emisión directa del comando de acción. En el caso de la consulta de pedido completado, el modelo original generó 1.509 tokens de pensamiento y el editado generó cero, manteniendo los mismos clics y la misma respuesta final ($65.32). No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens ni si hubo RLHF/DPO.

## Capacidades

- Generación de texto y razonamiento multimodal (image-text-to-text) heredados del base Inkling-2-Mini.
- Automatización de navegador: lectura de texto visible y controles numerados en Brave, emisión de comandos de clic y finalización de tareas.
- Supresión selectiva de tokens de razonamiento en tareas de navegador (modo sin thinking) para reducir latencia.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: sí, orientado a tareas de navegador multi-paso (WebArena, MiniWoB++).
- Capacidades multilingües: no disponible.
- Capacidades especiales: edición de pesos en el espacio de salida, compatible con endpoints (tag `endpoints_compatible`), inferencia con SGLang y MLX.

## Casos de uso

- Consulta de pedidos en comercio electrónico: el modelo puede localizar el último pedido completado, cancelado o pendiente y devolver el total en pocos segundos (5,13 s frente a 45,89 s del original en WebArena 190), adecuado para asistentes de atención al cliente sobre backoffice web.
- Rellenado de formularios web: completa campos de autocompletado y formularios con cantidad y añadido al carrito en 3,84 s (frente a 19,86 s), útil en pipelines de compra automatizada o testing de flujos de checkout.
- Respuesta a correos en interfaces web: redacta y envía respuestas en 5,98 s (frente a 26,01 s), apropiado para agentes de bandeja de entrada.
- Búsqueda de productos en tiendas online: ejecuta búsquedas como "Xbox", "green tea bags" o "iPhone 13 batteries" en 4,96-6,12 s, útil para agentes de comparación de precios o scraping interactivo.
- Publicación de contenido en foros: publica una solicitud de recomendación de auriculares en 17,97 s (frente a 22,34 s), adecuado para agentes de community management.
- Automatización de QA de aplicaciones web: al reducir el tiempo por tarea y eliminar tokens de razonamiento innecesarios, permite ejecutar suites de pruebas de navegador más rápido en CI/CD.
- Agentes de navegador de bajo coste en hardware consumer: al ejecutarse en un MacBook Pro M5 Max con MLX, es viable para prototipos y despliegues locales sin GPU de datacenter.

## Benchmarks y rendimiento

Datos de speedup reportados por el autor (ambos modelos pasaron cada ejecución; misma tarea, página inicial, prompt, decodificación greedy, reasoning effort `none` y timing de cursor):

| Tarea | Original (s) | Editado (s) | Speedup |
|---|---:|---:|---:|
| Latest completed order total · WebArena 190 | 45,89 | 5,13 | 8,95× |
| Latest canceled order total · WebArena 188 | 45,75 | 6,44 | 7,10× |
| Latest pending order total · WebArena 189 | 33,13 | 5,25 | 6,31× |
| Complete an autocomplete field · MiniWoB++ seed 103 | 19,86 | 3,84 | 5,18× |
| Reply to an email · MiniWoB++ seed 104 | 26,01 | 5,98 | 4,35× |
| Search for Xbox · WebArena 275 | 20,43 | 4,96 | 4,12× |
| Fill a form, set quantity and add a dress to the cart | 25,52 | 6,35 | 4,02× |
| Fill and submit a form | 11,19 | 2,79 | 4,02× |
| Search for green tea bags · WebArena 278 | 24,29 | 6,12 | 3,97× |
| Search for iPhone 13 batteries · WebArena 277 | 19,38 | 5,88 | 3,30× |
| Search for a USB Wi-Fi adapter · WebArena 274 | 14,46 | 4,65 | 3,11× |
| Search for Switch accessories · WebArena 276 | 14,39 | 5,15 | 2,79× |
| Post a headphone recommendation request · WebArena 630 | 22,34 | 17,97 | 1,24× |

En la consulta de pedido completado, la inferencia pasó de 43,03 s a 2,84 s; el original generó 1.509 tokens de pensamiento y el editado cero. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 26.388.646.440 parámetros en 8 bits, el peso ronda los 26 GB, por lo que se requiere al menos ~28-32 GB de memoria para cargar el modelo completo sin offloading.
- GPU recomendadas: RTX 5090 (usada por el autor con SGLang para la tarea de foro); no se especifican A100/H100, aunque por tamaño serían adecuadas.
- Cabe en consumer GPU: sí, en RTX 5090 (32 GB) y en Apple Silicon de gama alta; el autor ejecutó doce tareas en un MacBook Pro M5 Max con MLX.
- Opciones de despliegue: SGLang, MLX; tag `endpoints_compatible` sugiere compatibilidad con endpoints gestionados. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: inferencia de 2,84 s en la consulta de pedido completado (frente a 43,03 s del original); tiempos de tarea completos en la tabla de benchmarks.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-Fast-Browser-Use (este) | 26,39 B | no disponible | Edición de pesos para browser use | Apache 2.0 | Hugging Face (husky8) |
| thinkingmachines/Inkling-2-Mini (base) | no disponible | no disponible | Multimodal image-text-to-text | no disponible | Hugging Face (Thinking Machines Lab) |
| Alternativas de browser use de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks estándar ni de modelos comparables adicionales en la información proporcionada.

## Limitaciones y advertencias

- La edición está desarrollada y validada sobre tareas de consulta de pedidos; su generalización a otras tareas de navegador es limitada (el speedup en el foro cae a 1,24×).
- Riesgo de alucinación y de acciones incorrectas: al suprimir los tokens de razonamiento, el modelo pierde la cadena de verificación interna; el autor solo garantiza que ambos modelos realizaron los mismos clics en las ejecuciones mostradas.
- Sesgos conocidos: no disponibles.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de modificación (NOTICE) y la atribución al modelo base de Thinking Machines Lab.
- El repositorio ocupa 293,6 GB (incluye múltiples checkpoints y artefactos de benchmark); el peso efectivo del modelo es mucho menor.
- Los tiempos reportados dependen de hardware concreto (RTX 5090 con SGLang, M5 Max con MLX) y de decodificación greedy con reasoning effort `none`; no son extrapolables sin reproducir el entorno.
- Modelo con 0 descargas y 1 like en el momento de la ficha: no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/husky8/Inkling-2-Mini-Fast-Browser-Use
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Aviso de licencia y modificación: https://huggingface.co/husky8/Inkling-2-Mini-Fast-Browser-Use/blob/main/NOTICE
- Repositorio de evidencia y benchmarks: https://github.com/jtc268/inkling-2-fast-computer-use
- Auditoría de pesos: https://github.com/jtc268/inkling-2-fast-computer-use/blob/main/evidence/webarena-order-checkpoints/complete-cross/weight-audit.json
- Ejecuciones WebArena (pedidos): https://github.com/jtc268/inkling-2-fast-computer-use/blob/main/benchmark/WEBARENA-ORDER-CHECKPOINTS.md
- Ejecuciones MiniWoB++: https://github.com/jtc268/inkling-2-fast-computer-use/blob/main/benchmark/HEADLINERS.md
- Ejecuciones de búsqueda: https://github.com/jtc268/inkling-2-fast-computer-use/blob/main/benchmark/WEBARENA-SEARCH-COMMAND.md
- Ejecuciones de foro: https://github.com/jtc268/inkling-2-fast-computer-use/blob/main/benchmark/WEBARENA-REASONING-CLOSE.md
- Instrucciones de reproducción: https://github.com/jtc268/inkling-2-fast-computer-use/blob/main/benchmark/REPRODUCE-BROWSER.md
