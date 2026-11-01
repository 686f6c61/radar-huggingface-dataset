# SinhalaMMLU-SharedTask/team-mission-x

## Resumen

Team mission_x es el sistema presentado por el equipo del mismo nombre (Universidad de Moratuwa, Sri Lanka) a la tarea compartida SinhalaMMLU, una evaluación de conocimiento multitema en cingalés. No se trata de un modelo entrenado, sino de un pipeline de inferencia zero-shot construido sobre el modelo público google/gemma-4-E4B-it, usado sin ningún tipo de ajuste fino ni adaptador. El repositorio contiene el código, el script de inferencia y las predicciones finales enviadas a Codabench (submission 148), con una puntuación macro de 61,8639.

La relevancia del artefacto es metodológica más que de modelo: demuestra que una estrategia de prompting en dos fases (puntuación de opciones por log-probabilidad y posterior modo de razonamiento con decodificación voraz) sobre un modelo base multilingüe de aproximadamente 7,94B parámetros permite obtener resultados competitivos en una tarea de comprensión en un idioma de bajos recursos como el cingalés, sin datos de entrenamiento adicionales.

El sistema está pensado para reproducibilidad: decodificación determinista, reanudación por pasos y verificación de que las 2.238 respuestas del script coinciden exactamente con las del envío final. La licencia del repositorio es Apache 2.0 y el modelo base no está restringido por gating.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base google/gemma-4-E4B-it); pipeline de inferencia en dos fases |
| Parámetros totales | 7.941.100.832 cargados (7,94B); checkpoint total 7.996.156.490 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | fp16 en la ejecución de referencia; no se documentan otras |
| Idiomas soportados | cingalés (si) como idioma de evaluación; el prompt de instrucción está en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (se usa el checkpoint público del modelo base vía transformers) |

## Arquitectura y entrenamiento

El sistema no entrena nada: es un pipeline de inferencia sobre un único modelo, google/gemma-4-E4B-it, fijado a la revisión `ee0ef6023621cff504d758262d4e04895a5af4a2`. La arquitectura subyacente es la del modelo base (transformer decoder-only de la familia Gemma 4), sin adaptadores ni cabezas adicionales; el repositorio no documenta detalles internos de la arquitectura más allá del recuento de parámetros.

La innovación está en el procedimiento de respuesta, en dos fases. Primero, cada pregunta se responde mediante puntuación de opciones: se calcula la log-probabilidad del siguiente token correspondiente a los números 1 a 4, promediando sobre las cuatro ordenaciones cíclicas de las opciones para eliminar el sesgo de posición. Después, cada pregunta se responde en el modo de razonamiento de la plantilla de chat (decodificación voraz, hasta 2.048 tokens nuevos, salida final `Answer: N`); se usa esa respuesta y la de puntuación queda como respaldo cuando no se puede leer ninguna (89 de 2.238 preguntas del test, en su mayoría razonamientos truncados por el límite de tokens). La instrucción es una frase fija en inglés más el nombre de la asignatura, idéntica para todas las preguntas. No se usaron datos externos de entrenamiento ni de recuperación: las decisiones de método se validaron sobre el conjunto de desarrollo publicado y sobre la parte en cingalés de Global-MMLU, sin entrenar sobre ellos.

## Capacidades

- Respuesta a preguntas de opción múltiple (formato de 4 opciones) en cingalés, con selección por log-probabilidad y por razonamiento explícito.
- Modo de razonamiento (thinking mode) de la plantilla de chat, con decodificación determinista y salida estructurada `Answer: N`.
- Mitigación de sesgo de posición mediante promedio sobre cuatro ordenaciones cíclicas de las opciones.
- Procesamiento por lotes con tamaños fijos (4 para puntuación, 16 para razonamiento) para reproducir exactamente el padding del envío.
- Reanudación de ejecuciones largas por pasos, con escritura incremental en `outputs/` y omisión de pasos ya completados.
- No se documentan tool calling, function calling, capacidades de agente, visión, audio ni otras modalidades en la información disponible.

## Casos de uso

- Evaluación académica de comprensión lectora en cingalés: el pipeline responde bancos de preguntas de opción múltiple de distintas asignaturas y niveles de dificultad, lo que permite medir el conocimiento del modelo base en un idioma de bajos recursos sin coste de entrenamiento.
- Reproducción de resultados de la tarea compartida SinhalaMMLU: el script `inference.py` regenera las 2.238 respuestas del envío final, útil para verificar la validez de la submission o para auditorías del leaderboard.
- Línea base zero-shot para futuros equipos: sirve como referencia metodológica (puntuación de opciones más razonamiento) contra la que comparar ajustes finos o enfoques con recuperación.
- Investigación sobre sesgo de posición en modelos multilingües: el promedio sobre cuatro ordenaciones cíclicas es un componente reutilizable para estudiar cómo varía la elección de opción según el orden.
- Despliegue en hardware modesto para experimentación: la ejecución de referencia cabe en 2x NVIDIA T4 de 16 GB en fp16, lo que facilita replicar el sistema en entornos de Kaggle o GPUs de gama media.
- Generación de predicciones por lotes con tolerancia a interrupciones: el diseño por pasos con reanudación es aplicable a cualquier tarea de evaluación larga que exceda una sesión de cómputo.

## Benchmarks y rendimiento

Resultados del envío final a Codabench (submission 148) sobre el conjunto de test de SinhalaMMLU:

| Nivel | Puntuación |
|---|---|
| Easy | 62,7726 |
| Medium | 54,3654 |
| Hard | 68,4536 |
| Macro | 61,8639 |

Tiempos de ejecución de referencia en 2x NVIDIA T4 16 GB, fp16:

| Paso | Preguntas | Tiempo |
|---|---|---|
| Puntuación de opciones (4 ordenaciones) | 2.238 | ~25 min |
| Razonamiento, hard | 485 | ~2,9 h |
| Razonamiento, medium social science + other | 386 | ~2,3 h |
| Razonamiento, easy stem + social science + other | 351 | ~2 h |
| Razonamiento, easy humanities | 291 | ~1,7 h |
| Razonamiento, medium language | 159 | ~0,9 h |
| Razonamiento, medium humanities | 566 | ~3,2 h |
| Combinación | 2.238 | < 1 min (CPU) |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni comparaciones con otros sistemas en la misma tarea.

## Requisitos de hardware

- VRAM estimada: el modelo de 7,94B parámetros en fp16 requiere aproximadamente 16 GB de pesos; la ejecución de referencia reparte el modelo entre todas las GPUs visibles en un solo proceso.
- GPU recomendadas: 2x NVIDIA T4 de 16 GB es la configuración documentada y validada; una GPU única con al menos 16-24 GB de VRAM debería bastar para fp16, aunque no se documenta esa configuración.
- Cabe en GPU de consumo: no se documenta explícitamente; por tamaño de pesos, una RTX 4090 (24 GB) en fp16 es plausible, pero no está verificado en la información disponible.
- Opciones de despliegue: el pipeline usa transformers 5.21.0 con torch 2.11.0+cu128; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el conjunto de test completo (2.238 preguntas) tarda aproximadamente 13,5 h en 2x T4, con unos 25 min para la fase de puntuación y el resto para la de razonamiento.

## Comparativa con modelos similares

| Sistema | Base | Entrenamiento | Contexto | Resultado SinhalaMMLU (macro) | Licencia |
|---|---|---|---|---|---|
| Team mission_x (este) | google/gemma-4-E4B-it | Ninguno (zero-shot) | no disponible | 61,8639 | Apache 2.0 |
| google/gemma-4-E4B-it sin pipeline | google/gemma-4-E4B-it | Ninguno | no disponible | no disponible | Apache 2.0 |
| Otros equipos de la tarea SinhalaMMLU | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de resultados de otros participantes ni de modelos comparables evaluados en la misma tarea, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- No es un modelo entrenado: cualquier uso fuera de la tarea SinhalaMMLU requiere adaptar el prompt y validar el comportamiento; el pipeline está acoplado al formato de opción múltiple de 4 opciones.
- El prompt de instrucción está en inglés y es fijo; no se ha evaluado su robustez frente a variaciones de redacción ni frente a otros idiomas.
- El 4 % de las preguntas del test (89 de 2.238) recurrió a la respuesta de puntuación como respaldo por truncamiento del razonamiento en el límite de 2.048 tokens, lo que puede degradar la calidad en preguntas de razonamiento largo.
- La licencia Apache 2.0 se aplica al repositorio; el uso comercial del modelo base queda sujeto a los términos de google/gemma-4-E4B-it, que no se detallan en la información disponible.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad del sistema.
- El rendimiento en niveles medium (54,3654) es notablemente inferior al de easy y hard, lo que sugiere fragilidad ante cierto tipo de preguntas; no se analiza la causa.
- La reproducibilidad depende de mantener los tamaños de lote y el orden de grupos del script, ya que el batching altera el padding y, por tanto, las salidas.

## Enlaces

- Repositorio del sistema: https://huggingface.co/SinhalaMMLU-SharedTask/team-mission-x
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Revisión fijada del modelo base: https://huggingface.co/google/gemma-4-E4B-it/tree/ee0ef6023621cff504d758262d4e04895a5af4a2
- Dataset Global-MMLU (config `si`): https://huggingface.co/datasets/CohereLabs/Global-MMLU
