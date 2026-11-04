# kernkraft/prism-roleplay-2-small

## Resumen

Prism Roleplay 2 Small es un ajuste fino mediante LoRA del modelo Qwen3-8B de Alibaba, desarrollado por kernkraft (identificado en la model card como VertexAGI) y orientado específicamente a la interpretación de personajes en conversaciones de rol de múltiples turnos. El modelo parte de la arquitectura transformer densa de Qwen3-8B, con 8.190.735.360 parámetros totales, y se distribuye con licencia Apache 2.0 en formatos MLX y GGUF.

El problema que aborda es la degradación de la coherencia de personaje en chats largos, un punto débil declarado de su predecesor Prism Roleplay 1.5 Small. Para ello se entrenó sobre 1.575 conversaciones multi-turno y se modificó la señal de pérdida para que se calcule únicamente sobre la respuesta final, evitando que el modelo aprenda a copiar turnos anteriores. Además incorpora dos capacidades opcionales mediante tool calling: pensamientos internos privados en primera persona y seguimiento del estado emocional del personaje.

Es relevante ahora porque combina un modelo base reciente y ampliamente adoptado (Qwen3-8B) con un ajuste especializado en un nicho concreto, y lo publica en un único repositorio con pesos en 4 y 8 bits listos para MLX, llama.cpp, Ollama y LM Studio. La evaluación presentada por el autor es interna y automatizada, no basada en benchmarks estándar, lo que conviene tener en cuenta al valorar sus resultados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B) con adaptador LoRA fusionado |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el entrenamiento usó secuencias de 3.072 tokens) |
| Tipos de cuantización | MLX 4-bit (group size 64) con 16 capas LoRA en 6-bit; GGUF Q4_K_M y Q8_0 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, 4-bit mixto) y GGUF (Q4_K_M, Q8_0) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino LoRA de rango 16 sobre Qwen3-8B, un transformer denso de 8B parámetros, con secuencias de entrenamiento de 3.072 tokens (frente al rango 8 y las secuencias de 2.048 tokens de la versión 1.5). La innovación principal en el entrenamiento es el enmascaramiento de la pérdida: en las filas de conversación solo se calcula la pérdida sobre la respuesta final, de modo que el modelo aprende a responder y no a replicar los turnos previos del historial. El conjunto de datos combina datos sintéticos, conversaciones de dominio público y chats construidos a partir de character cards, e incluye 1.575 conversaciones multi-turno con historiales cortos y largos para evitar que las respuestas se acorten cuando el contexto es escaso.

El ajuste añade dos herramientas opcionales invocables: `inner_thoughts`, que genera un pensamiento en primera persona de unas 60 palabras antes de la respuesta, y `track_state`, que emite seis valores de 0 a 100 antes y después del turno junto con una razón. Los pesos MLX son de precisión mixta: las 16 capas ajustadas con LoRA se guardan en 6 bits y el resto en el 4-bit original, con los bits por capa detallados en `config.json`. Los GGUF se generaron a partir del modelo fusionado en fp16.

## Capacidades

- Generación de texto conversacional orientada a interpretación de personajes, con formato consistente de acciones entre asteriscos y diálogo entre comillas.
- Coherencia de personaje en conversaciones multi-turno, incluyendo historiales largos y turnos con contexto breve.
- Memoria de detalles de sesiones anteriores, con respuestas que reutilizan información recordada (mejora moderada según el autor).
- Tool calling opcional para pensamientos internos (`inner_thoughts`) y seguimiento de estado emocional (`track_state`).
- Razonamiento multi-paso heredado del modelo base Qwen3-8B.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito más allá de la herramienta `inner_thoughts`.

## Casos de uso

- Chatbots de personajes para entretenimiento: el modelo mantiene la voz y los rasgos del personaje a lo largo de sesiones largas gracias al entrenamiento específico en 1.575 conversaciones multi-turno, lo que reduce la deriva de personalidad típica en modelos base.
- Roleplay narrativo interactivo: la combinación de formato consistente (acciones y diálogo) y pensamientos internos opcionales permite construir experiencias donde el personaje "razona" antes de responder, útil en ficción interactiva.
- Simulación de personajes con estado emocional: la herramienta `track_state` permite exponer en la interfaz una barra de emociones del personaje, aunque sus valores deben tratarse como aproximados por su tendencia a sobrerreaccionar.
- Prototipado rápido en Apple Silicon: la build MLX de 5,38 GB se ejecuta con mlx-lm en equipos con memoria unificada, lo que facilita iterar sobre prompts y personajes sin infraestructura GPU dedicada.
- Despliegue local en escritorio: los GGUF Q4_K_M (5,03 GB) y Q8_0 (8,71 GB) funcionan en llama.cpp, Ollama y LM Studio, adecuados para aplicaciones de rol offline o con requisitos de privacidad.
- Investigación sobre coherencia conversacional: el modelo sirve como caso de estudio de enmascaramiento de pérdida en ajustes LoRA para diálogo, comparando su comportamiento con el base sin ajustar.
- Generación de diálogos para guiones o videojuegos: la memoria de detalles entre sesiones permite mantener continuidad argumental en la escritura asistida de tramas ramificadas.

## Benchmarks y rendimiento

Los datos disponibles proceden de evaluaciones internas del autor, no de benchmarks estándar como MMLU o HumanEval. La comparación principal usa 76 prompts escritos a mano, con dos jueces automáticos (nemotron-3-ultra y muse-glimmer-30b), juicio en ambos órdenes y victoria solo si ambos órdenes y ambos jueces coinciden.

| Conjunto de prompts | Victorias 2 / 1.5 / empates (estándar) | Victorias 2 / 1.5 / empates (neutral a longitud) |
|---|---|---|
| Todos (76) | 43 / 2 / 31 | 39 / 2 / 34 |
| Escenas únicas (24) | 10 / 0 / 14 | 10 / 0 / 14 |
| Memoria (16) | 3 / 2 / 11 | 3 / 2 / 10 |
| Multi-turno (12) | 7 / 0 / 5 | 7 / 0 / 5 |
| Multi-turno, historial corto (12) | 12 / 0 / 0 | 9 / 0 / 3 |
| Multi-turno, historial largo (12) | 11 / 0 / 1 | 10 / 0 / 2 |
| Respuestas de longitud similar (22) | 9 / 0 / 13 | 10 / 0 / 11 |

Frente al Qwen3-8B base, con 52 prompts y un juez (nemotron-3-ultra): 32 victorias de Prism Roleplay 2, 6 del base y 14 empates; en multi-turno, 11 / 0 / 1. La verificación de formato (asteriscos para acciones, comillas para diálogo) pasó 40 de 40.

| Herramienta | Prism Roleplay 2 | Qwen3-8B base |
|---|---|---|
| Pensamientos mejor / peor / empate | 5 / 0 / 19 | — |
| Estado mejor / peor / empate | 1 / 0 / 23 | — |
| Llamadas válidas a `inner_thoughts` | 23/24 | 24/24 |
| Llamadas válidas a `track_state` | 23/24 | 24/24 |
| Longitud mediana del pensamiento | 64 palabras | 47 palabras |
| Cambio medio total de estado por turno | 65,6 | 29,1 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,4 GB con la build MLX 4-bit y 5,03 GB con GGUF Q4_K_M; unos 8,7 GB con GGUF Q8_0. Para el modelo fusionado en fp16 serían necesarios alrededor de 16 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para Q4_K_M (RTX 3060 Ti, RTX 4060, RTX 4070); 12 GB o más para Q8_0 (RTX 4070 Ti, RTX 4080); A100 y H100 sobredimensionadas para este tamaño, útiles solo para servir muchas instancias concurrentes.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más para Q4_K_M y 12 GB o más para Q8_0. En Apple Silicon, la build MLX funciona con memoria unificada a partir de 8 GB.
- Opciones de despliegue: mlx-lm sobre Apple Silicon, llama.cpp, Ollama y LM Studio para los GGUF. No se documenta soporte explícito para vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formatos |
|---|---|---|---|---|---|
| Prism Roleplay 2 Small | 8,19B | No disponible | Rol multi-turno con herramientas de pensamiento y estado | Apache 2.0 | MLX 4-bit, GGUF Q4_K_M y Q8_0 |
| Prism Roleplay 1.5 Small | 8B (base Qwen3-8B) | No disponible | Rol, sin herramientas ni foco multi-turno | Apache 2.0 (según la comparativa) | No disponible |
| Qwen3-8B (base) | 8B | No disponible en la información proporcionada | Propósito general, razonamiento y tool calling | Apache 2.0 | safetensors, GGUF |

Frente a 1.5 Small, la versión 2 gana en multi-turno (especialmente con historial corto y largo) pero solo empata mayoritariamente en memoria. Frente al base, mejora en formato y coherencia conversacional, pero no se han publicado comparaciones con otros ajustes de rol de la comunidad.

## Limitaciones y advertencias

- La evaluación es pequeña y automatizada: 76 y 52 prompts escritos a mano, sin evaluación humana, y los dos jueces solo coincidieron en 49 de 76 pares de la comparación principal.
- Uno de los jueces (Muse Glimmer) participó en la generación de parte de los pensamientos de entrenamiento, lo que puede favorecer ligeramente al modelo.
- Las respuestas son más largas que en 1.5 (mediana de 126 frente a 80 palabras), lo que puede no encajar en todos los productos.
- La mejora en memoria es escasa (3 victorias, 2 derrotas y 11 empates frente a 1.5).
- El seguimiento de estado sobrerreacciona: cambia casi todos los valores en casi todos los turnos (cambio medio de 65,6 frente a 29,1 del base), por lo que sus cifras deben tratarse como aproximadas.
- No está ajustado para seguridad: los datos se filtraron para eliminar contenido sexual, pero el base Qwen3 puede generar cualquier cosa; no debe usarse como capa de moderación.
- Al ser un modelo de 8B con LoRA, las sesiones muy largas pueden seguir sufriendo deriva de personaje.
- Soporte limitado al inglés; no se documentan otros idiomas.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantías del autor sobre el comportamiento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kernkraft/prism-roleplay-2-small
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
