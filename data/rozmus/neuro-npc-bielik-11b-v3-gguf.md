# rozmus/neuro-npc-bielik-11b-v3-GGUF

## Resumen

neuro-npc-bielik-11b-v3-GGUF es un ajuste fino (fine-tuning) del modelo polaco Bielik-11B-v3.0-Instruct de SpeakLeash, publicado por el desarrollador rozmus y distribuido en formato GGUF para inferencia local. El modelo está diseñado como la "mente" completa de Neuro Processor, un juego de rol de texto en polaco para terminal: un único modelo asume simultáneamente los papeles de voz de personajes (PNJ), narrador de combate (game master) y capa de razonamiento estructurado que interpreta intenciones del jugador y extrae hechos en JSON.

La relevancia del modelo reside en su especialización extrema: no aspira a ser un modelo generalista, sino a resolver con fiabilidad las tareas concretas de un motor de juego, donde la consistencia de formato, el respeto a las reglas y la ausencia de alucinaciones numéricas son críticas. Se entrenó con QLoRA y DPO sobre el modelo base, y el autor reporta comparaciones ciegas con la versión anterior del sistema que muestran mejoras significativas en conversaciones, prompts de otros juegos y un conjunto de test independiente.

Con aproximadamente 11 000 millones de parámetros, contexto configurado de 8192 tokens y licencia Apache 2.0, el modelo está pensado para ejecutarse en una GPU de consumo (unos 8,7 GB de VRAM en cuantización Q5_K_M) con latencias de alrededor de 1,9 s por respuesta en una RTX 4060 Ti. Su ámbito lingüístico es exclusivamente el polaco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Bielik-11B-v3.0-Instruct); detalles internos no disponibles |
| Parametros totales | 11B (aproximado, según el nombre del modelo) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 8192 tokens (configurado en la plantilla de Ollama) |
| Tipos de cuantizacion | GGUF; se menciona explícitamente Q5_K_M, otras variantes no detalladas |
| Idiomas soportados | polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de speakleash/Bielik-11B-v3.0-Instruct, un modelo instructivo polaco de 11 000 millones de parámetros. Sobre esa base se aplicó un ajuste fino con QLoRA y posteriormente una fase de DPO (Direct Preference Optimization), según las etiquetas de la model card. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni los hiperparámetros del ajuste.

Un aspecto destacable del diseño es la composición de los datos: según el autor, aproximadamente una quinta parte del corpus de entrenamiento proviene de convenciones de PNJ ajenas al juego original (mods de Skyrim al estilo Mantella, tarjetas de personaje de SillyTavern, PNJ que responden con JSON de acción, narradores de aventura con tirada de d20, mercaderes con otra moneda e intentos de jailbreak). Esto busca que el modelo generalice a otros juegos y mods, no solo al suyo. El formato de prompt es ChatML (`<|im_start|>role … <|im_end|>`), con parámetros por defecto de temperatura 0,7, top_p 0,9 y sin penalización por repetición.

## Capacidades

- Generación de diálogo en personaje en polaco: líneas breves para comerciantes, mercenarios, compañeros y testigos, precedidas de una etiqueta de estado de ánimo (por ejemplo `[kpina]` o `[spokój]`).
- Narración de combate como game master: describe cada ronda a partir del protocolo que le entrega el juego.
- Tareas estructuradas tipo "mente": interpretación de la intención del jugador (oferta, venta, persuasión), extracción de hechos nuevos de una conversación, detección de objetos inventados por un comerciante, memoria de lo que un personaje dijo de sí mismo y detección de súplicas de rescate.
- Salida en JSON conforme a esquemas definidos por el juego.
- Adaptación a convenciones de otros juegos y mods (Skyrim/Mantella, SillyTavern, PNJ con JSON, narrador con d20, comerciantes con otras monedas).
- Robustez frente a intentos de jailbreak y preguntas fuera del conocimiento del personaje (según el autor, el modelo no filtra las convenciones del juego original).
- No se menciona soporte de tool calling general, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Motor de PNJ en un RPG de texto: el modelo genera las respuestas de todos los personajes no jugadores a partir de un mensaje de sistema que describe su personalidad, conocimiento y reglas, y de un bloque `[GRA]` que comunica la decisión del juego. Es adecuado porque mantiene el tono y respeta las cifras impuestas por el motor.
- Narración automática de combate: recibe el protocolo de la ronda y produce la descripción del turno como game master, manteniendo la persona gramatical solicitada (tuteo o tercera persona).
- Extracción de intención del jugador: clasifica si una frase es una oferta, una venta o un intento de persuasión y devuelve el resultado en JSON, lo que permite al motor aplicar reglas sin parsear lenguaje natural libre.
- Memoria de personajes: registra hechos que un PNJ revela sobre sí mismo para que el jugador pueda consultarlos días después, con una tasa de falsos positivos reportada de 4/90 (con el filtro nuevo del juego).
- Integración en mods de Skyrim al estilo Mantella: el modelo responde a prompts de PNJ de otros juegos con convenciones distintas, lo que lo hace reutilizable fuera del juego original.
- Tarjetas de personaje de SillyTavern: puede dar voz a personajes definidos en formato de tarjeta, útil para prototipar roleplay local en polaco.
- Comerciantes y economía del juego: detecta objetos que un tendero acaba de inventar en la conversación y responde con precios coherentes con la moneda indicada en el prompt.
- Despliegue local con Ollama: gracias al formato GGUF y a los ~8,7 GB de VRAM en Q5_K_M, puede ejecutarse en un equipo de consumo para prototipos de juegos narrativos sin depender de la nube.

## Benchmarks y rendimiento

El autor publica comparaciones ciegas contra la versión anterior del sistema (run21), evaluadas por dos jueces Claude (Opus y Sonnet) con un tercero para desempatar. Los "errores graves" incluyen importes incorrectos, reglas incumplidas, eventos inventados, contradicciones, galimatías o frases repetidas.

| Parte | Ítems | Errores graves, anterior / este modelo | Pares ganados / perdidos / empatados | p |
|---|---|---|---|---|
| Conversaciones | 420 | 148,2 / 92,0 | 210 / 133 / 77 | < 0,0001 |
| Rondas de combate | 669 | 40,0 / 26,0 | 35 / 22 / 612 | 0,11 |
| Pares de conversación (memoria a días vista) | 32 | 14,2 / 5,5; contradicciones 5,5 / 2,0 | 17 / 9 / 6 | 0,17 |
| Prompts de otros juegos y mods | 320 | 141,3 / 61,2 | 169 / 90 / 61 | < 0,0001 |
| Test independiente escrito por otro modelo (GPT) | 240 | 86,5 / 57,5 | 110 / 74 / 56 | 0,0097 |

| Tarea de "mente" | Anterior | Este modelo |
|---|---|---|
| Memoria de hechos propios: aciertos / falsos positivos | 29/56 / 13/90 | 55/56 / 4/90 |
| Hechos propios en respuestas cortas y elípticas: aciertos / falsos positivos | 14/23 / 1/29 | 20/23 / 1/29 |
| Anotar un hecho: falsos positivos | 0/14 | 0/14 |
| Objeto inventado: aciertos / falsos positivos | 6/6 / 0/14 | 6/6 / 0/14 |
| Lectura del jugador: acción correcta | 95 % | 100 % |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: unos 8,7 GB de memoria GPU con contexto de 8192 tokens en cuantización Q5_K_M, según el autor.
- GPU recomendadas: el autor cita una RTX 4060 Ti como referencia; por el tamaño, encaja en GPU de consumo con 12 GB o más de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4080, etc.). Para cuantizaciones mayores o contextos más largos se recomienda 16-24 GB (RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, al menos en Q5_K_M con 8192 tokens de contexto.
- Opciones de despliegue: Ollama (comando documentado con `ollama pull hf.co/rozmus/neuro-npc-bielik-11b-v3-GGUF:Q5_K_M`), con endpoint compatible con OpenAI (`/v1`). Otros runners compatibles con GGUF (llama.cpp, etc.) no se mencionan explícitamente en la información disponible.
- Latencia: aproximadamente 1,9 s de media por respuesta en una RTX 4060 Ti. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| neuro-npc-bielik-11b-v3-GGUF | 11B | 8192 | pl | Apache 2.0 | GGUF | Especializado en PNJ y game master para RPG de texto |
| speakleash/Bielik-11B-v3.0-Instruct | 11B | no disponible | pl | no disponible | no disponible | Modelo base instructivo generalista; sin especialización en juegos |
| run21 (versión anterior del sistema) | no disponible | no disponible | pl | no disponible | no disponible | Configuración previa del juego; peor en todas las partes evaluadas |

No se dispone de datos suficientes en la información proporcionada para comparar con otros modelos polacos especializados en roleplay o PNJ.

## Limitaciones y advertencias

- Ámbito lingüístico restringido al polaco; no se garantiza un rendimiento aceptable en castellano ni en otros idiomas.
- Es un modelo especializado: fuera de las formas de prompt del juego (personajes, narración, tareas JSON) su comportamiento puede degradarse; el autor recomienda usar las mismas estructuras de prompt.
- Riesgo de alucinación en cifras, nombres y citas; por eso el juego verifica la salida (importes, nombres, citas) antes de mostrarla al jugador. En producción conviene replicar esa validación.
- El modelo no decide resultados del juego; cualquier uso que delegue en él decisiones de mecánicas o economía requiere capas de verificación externas.
- Los falsos positivos en memoria de hechos propios (4/90 y 1/29 con el filtro nuevo; 8/90 y 3/29 sin él) indican que la extracción de hechos no es perfecta.
- El autor advierte de que el modelo "nunca filtra las convenciones de este juego", lo que es deseable para la coherencia pero implica que puede arrastrar sesgos de formato hacia el juego original en contextos ajenos.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base Bielik-11B-v3.0-Instruct, cuya licencia no se detalla en la información disponible.
- No hay datos publicados sobre sesgos demográficos ni sobre evaluación de seguridad más allá de los intentos de jailbreak mencionados.
- Creado y actualizado el 11 de noviembre de 2026; con 0 descargas y 0 likes en el momento de la consulta, no hay evidencia de adopción comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rozmus/neuro-npc-bielik-11b-v3-GGUF
- Repositorio del juego Neuro Processor: https://github.com/sebastianrozmus/neuro-processor
- Modelo base: https://huggingface.co/speakleash/Bielik-11B-v3.0-Instruct
