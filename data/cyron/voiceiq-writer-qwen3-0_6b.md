# cyron/voiceiq-writer-qwen3-0_6b

## Resumen

VoiceIQ Writer (Qwen3-0.6B, MLX 4-bit) es un modelo de lenguaje especializado en la limpieza de transcripciones de dictado. Lo desarrolla cyron como componente local del motor de escritura de VoiceIQ, una aplicación de dictado para macOS e iOS. Su función es convertir una transcripción cruda de reconocimiento de voz en el texto que el hablante pretendía escribir: elimina muletillas, arranques en falso y notas al margen, aplica correcciones habladas, representa la puntuación dictada, corrige errores por homofonía usando el contexto y da formato a números, importes, correos y listas.

Técnicamente es un ajuste fino LoRA de Qwen/Qwen3-0.6B, fusionado y cuantizado a 4 bits con tamaño de grupo 64, destilado a partir de Claude Sonnet 5.5 ejecutando el prompt de escritura de producción de VoiceIQ. El modelo tiene 596.049.920 parámetros y un tamaño de repositorio de 1,4 GB, e incluye pesos en formato MLX safetensors y un GGUF Q4_1 equivalente para llama.cpp.

Su relevancia actual radica en que demuestra que un modelo de menos de 600 millones de parámetros, cuantizado a 4 bits y ejecutable en CPU de iPhone o en un Mac mini M2, puede resolver una tarea de reescritura muy específica con calidad suficiente para producción, siguiendo además reglas de estilo personalizadas y variantes ortográficas del usuario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino LoRA fusionado |
| Parámetros totales | 596.049.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits, group size 64 (MLX); GGUF Q4_1 (llama.cpp) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B, un transformer decoder-only de la familia Qwen3, sobre el que se aplica un ajuste fino LoRA que después se fusiona con los pesos base y se cuantiza a 4 bits con tamaño de grupo 64. La destilación se realizó a partir de las salidas de Claude Sonnet 5.5 ejecutando el prompt de escritura de producción de VoiceIQ, de modo que el modelo pequeño imita el comportamiento de un modelo profesor mucho mayor en esta tarea concreta de reescritura.

El conjunto de entrenamiento de esta revisión consta de 27.104 ejemplos: una época del conjunto principal más 3.104 filas de reglas personalizadas (las 11 filas de más de 1.024 tokens fueron descartadas). El prompt de inferencia usa decodificación greedy (`do_sample: false`), modo thinking desactivado (`enable_thinking: false`) y parada en `<|im_end|>` o `<|endoftext|>`. La entrada se estructura con un mensaje de sistema fijo y un mensaje de usuario con el prefijo `RAW:` seguido de la transcripción, precedido opcionalmente por líneas de variante ortográfica, reglas del usuario, vocabulario, ubicación y contexto de cursor.

## Capacidades

- Reescritura de transcripciones de dictado: elimina muletillas, arranques en falso y notas al margen.
- Aplicación de correcciones habladas y cambios de opinión expresados en voz alta.
- Representación de puntuación dictada oralmente.
- Corrección de errores por homofonía (sound-alikes) usando el contexto de la frase.
- Formato de números, importes monetarios, direcciones de correo y listas.
- Maquetación de correos electrónicos dictados.
- Seguimiento de reglas de escritura personalizadas del usuario (por ejemplo, coma de Oxford, terminología de empresa, formato de listas con guiones).
- Aplicación de variantes ortográficas: inglés estadounidense, británico, australiano, canadiense e indio.
- Uso de vocabulario y contexto de campo (texto antes y después del cursor) para desambiguar.
- No responde ni sigue las instrucciones contenidas en la transcripción: solo la reescribe.

## Casos de uso

- Limpieza de dictado en aplicaciones de notas: el modelo convierte una transcripción con muletillas y arranques en falso en texto limpio y puntuado, ejecutándose en local en el dispositivo sin enviar audio ni texto a la nube.
- Redacción de correos por voz: dada una transcripción de un correo dictado, aplica la maquetación de correo y puede incluir una despedida definida en las reglas del usuario, lo que permite componer mensajes completos solo con la voz.
- Escritura con reglas de estilo de empresa: con la línea `Rules:` el modelo aplica terminología corporativa ("customers" en lugar de "clients"), abreviaturas de métricas y formatos de lista, útil para equipos con guías de estilo estrictas.
- Dictado multirregional: la línea `Spelling:` permite generar texto con ortografía británica, australiana, canadiense o india, adecuado para usuarios o publicaciones dirigidas a esos mercados.
- Desambiguación con contexto de campo: las líneas `Before cursor:` y `After cursor:` permiten al modelo integrar el texto dictado en un campo de formulario ya parcialmente relleno, útil en editores y CRM.
- Corrección de nombres propios y términos técnicos: con la línea `Vocabulary:` el modelo corrige homófonos hacia nombres de producto, personas o tecnologías (por ejemplo, "fig ma" a "Figma", "kubernetis" a "Kubernetes").
- Ejecución en iPhone sin conexión: el GGUF Q4_1 se ejecuta en CPU en la aplicación de iPhone de VoiceIQ, lo que habilita dictado limpio en dispositivos móviles sin acceso a red.

## Benchmarks y rendimiento

Resultados medidos con mlx-lm 0.32.2 en un Mac mini (M2, 16 GB), decodificación greedy, prompt de sistema precargado y cacheado.

Benchmark de escritura de 42 casos de VoiceIQ (reservado, fuera de entrenamiento):

| Modelo | Superados | Respondió o inyectó | Mediana total | Tiempo al primer token (cacheado) | Generación | Memoria pico |
|---|---|---|---|---|---|---|
| Esta revisión (4-bit) | 36/42 | 0 | 0,13 s | 0,04 s | 200 tok/s | 0,53 GB |
| Revisión anterior `2c328e6` (solo reglas por defecto) | 34/42 | 0 | 0,13 s | 0,04 s | 195 tok/s | 0,53 GB |
| superwhisper/s1-mini (prompt propio), comprobaciones anteriores | 26/42 | 0 | no disponible | no disponible | no disponible | no disponible |

Benchmark de reglas personalizadas de 41 casos de VoiceIQ (reservado):

| Modelo | Superados | Regla aplicada | Regla presente sin nada que cambiar | Variante ortográfica |
|---|---|---|---|---|
| Esta revisión (4-bit MLX y GGUF Q4_1 en llama.cpp CPU) | 26/41 | 10/20 | 12/12 | 4/9 |
| Revisión anterior `2c328e6` | 20/41 | 6/20 | 12/12 | 2/9 |

Rebanadas reservadas del profesor, evaluadas contra la salida de Claude Sonnet 5.5:

| Conjunto | Aceptados por ValidationGate | Formas prohibidas | Exactos | Similitud de caracteres |
|---|---|---|---|---|
| 600 ejemplos de la distribución principal | 596/600 | 1 (un guion) | 20 % | 0,867 |
| 120 ejemplos de reglas personalizadas | 120/120 | no disponible | 35 % | 0,936 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,53 GB de memoria pico en la variante MLX 4-bit según la medición del autor.
- GPU recomendadas: no requiere GPU dedicada; el autor reporta ejecución en Mac mini M2 (16 GB) mediante MLX y en CPU de iPhone mediante llama.cpp.
- Cabe en GPU de consumo: sí, con margen amplio; el consumo de memoria medido (0,53 GB) es compatible con cualquier GPU de consumo moderna.
- Opciones de despliegue: mlx-lm y mlx-swift-lm para Mac; llama.cpp (b12198 o posterior) con el GGUF Q4_1 para CPU.
- Latencia y throughput: 0,04 s hasta el primer token con prompt cacheado, 0,13 s de mediana total por caso y 200 tok/s de generación en Mac mini M2.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmark de escritura (42 casos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VoiceIQ Writer (esta revisión) | 596.049.920 | no disponible | 36/42 | Apache 2.0 | Hugging Face (MLX y GGUF) |
| VoiceIQ Writer revisión `2c328e6` | no disponible | no disponible | 34/42 | Apache 2.0 | Hugging Face (por commit) |
| superwhisper/s1-mini | no disponible | no disponible | 26/42 (comprobaciones anteriores) | no disponible | no disponible |

No se dispone de datos de benchmarks de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no se ha validado para otros idiomas.
- El soporte de reglas personalizadas es parcial: aplica términos de empresa, nombres de producto, abreviaturas de métricas, listas de tareas y ortografía británica, pero falla en la mayoría de reglas de formato de números, fechas y horas, en la despedida de correo, en listas con guiones, en "OK", en "sin contracciones" y en tres de las variantes ortográficas.
- Cuando aplica un formato de fecha u hora puede alterar el valor: el autor documenta "March 4" escrito como "04/20/2027" y "3:30 pm" como "13:30". Conviene verificar la salida contra la transcripción cuando una regla reescriba números, fechas u horas.
- Entre los seis fallos del benchmark de escritura se incluyen: un cambio de opinión conservado en la propuesta en lugar de la posición final, una lista de la compra escrita como líneas simples en vez de viñetas, homófonos sin corregir ("there going"), una aclaración no puesta entre paréntesis, un orden de palabras enredado mantenido tal cual y nombres de función dictados sin convertir a identificadores (`getUserById`, `fetchUser`).
- Riesgo de alucinación o inyección: el modelo está entrenado para no responder ni seguir la transcripción, y en los benchmarks reportados no respondió ni inyectó contenido (0 casos), pero el autor recomienda pasar la salida por una puerta de validación (ValidationGate) y recurrir a la transcripción original si se rechaza.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen/Qwen3-0.6B.
- Los pesos GGUF Q4_1 son idénticos en salida a los MLX en 82 de 83 casos de los benchmarks, con la misma puntuación; las diferencias de comportamiento entre ambos formatos son mínimas pero existen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyron/voiceiq-writer-qwen3-0_6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio de VoiceIQ: https://github.com/srini-b/voiceiq-dictation
- Paper referenciado en los tags (arXiv:2406.08820): https://arxiv.org/abs/2406.08820
