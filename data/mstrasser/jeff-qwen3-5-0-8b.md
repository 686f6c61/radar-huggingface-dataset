# mstrasser/Jeff-Qwen3.5-0.8B

## Resumen

Jeff-Qwen3.5-0.8B es un ajuste fino (fine-tune) de Qwen/Qwen3.5-0.8B desarrollado por el usuario mstrasser dentro de la familia de modelos Jeff. No es un modelo generativo al uso: es un modelo de decisión (decision-model) entrenado para clasificación zero-shot, pensado para insertarse directamente en código de aplicación. El usuario describe una situación y una lista de opciones en lenguaje natural, y el modelo devuelve, en una única pasada forward, una probabilidad calibrada por opción, sin generar texto ni requerir parseo posterior.

Con 852.985.920 parámetros (~0,85 mil millones) y un repositorio de 1,8 GB, su propuesta de valor es la latencia: aproximadamente 22 ms por decisión en una RTX PRO 6000 y 28 ms en un Apple M4 Max con MLX. El modelo está entrenado exclusivamente en inglés, se distribuye con licencia Apache 2.0 y se etiqueta como feature-extraction, zero-shot-classification, calibration y system-1, en la línea de los modelos de "juicio rápido" que priorizan velocidad y calibración frente a razonamiento profundo.

Es relevante ahora porque cubre un nicho concreto: decisiones locales, de baja latencia, enrutadas desde código, con categorías definidas por el usuario que no necesitan aparecer en los datos de entrenamiento. Según la model card, el ajuste eleva la precisión de panel del modelo base del 45,3% al 79,1%, con un error de calibración (ECE) de 0,049, acercándose a modelos mucho mayores en tareas de clasificación y grounding, aunque quedándose atrás en tareas de razonamiento intensivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tune de Qwen/Qwen3.5-0.8B) |
| Parametros totales | 852.985.920 (~0,85 mil millones) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio publica pesos en safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Otros datos: tamano del repositorio 1,8 GB; libreria transformers; pipeline tag zero-shot-classification; modelo base Qwen/Qwen3.5-0.8B; creado el 2026-09-28; 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B y se ajusta para una tarea de decisión estructurada. El ajuste se realizó íntegramente en hardware local: una única GPU de estación de trabajo RTX PRO 6000, con un tiempo de entrenamiento de aproximadamente 2 horas para la variante de 0,8B (3,5 horas para la variante de 2B). Los datos de entrenamiento son sintéticos, generados por un modelo abierto (Qwen3.8-Flash-Next) sobre dos DGX Spark, y no contienen salidas de modelos cerrados; un modelo cerrado se utilizó únicamente para verificar por muestreo la calidad de una parte de los datos sintéticos. El código de entrenamiento parte de la receta de código abierto AutoJev.

La interfaz del modelo es JSON: se envía un objeto con `model`, un `state` (por ejemplo, transcripción de voz y pantalla actual) y uno o varios `questions`. Cada pregunta puede ser de tipo `choice` (elegir una entre hasta 255 opciones), `noul` (sí/no, devuelto como probabilidad) o `score` (un punto en una escala descrita por el usuario). La respuesta es una probabilidad por opción, la opción elegida y una confianza. Varias preguntas independientes se responden en una sola petición. La model card no detalla la composición exacta del dataset, el número de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Clasificación zero-shot con categorías definidas libremente en el prompt: colas de soporte, intenciones de usuario, etiquetas de moderación, comandos de voz o movimientos de juego.
- Decisión de tipo `choice` con hasta 255 opciones por pregunta y probabilidad calibrada por opción.
- Decisión booleana (`noul`, sí/no) devuelta como probabilidad.
- Puntuación en escala (`score`) sobre una escala descrita por el usuario.
- Respuesta a varias preguntas independientes dentro de una misma petición.
- Salida estructurada directamente consumible por código, sin parseo de texto generado.
- Calibración de confianza: ECE de 0,049 en este modelo, 0,028 en la variante de 2B.
- Grounding y detección de fidelidad en contextos RAG (86,1 en RAGTruth) y clasificación de sentimiento financiero (96,4 en Financial PhraseBank).
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión, audio, tool calling ni agentes multi-paso.

## Casos de uso

- Enrutado de intenciones en asistentes de voz: el ejemplo de la propia model card describe una situación con la transcripción "open the engagment leter" y la pantalla actual, y el modelo devuelve `{"1": 0.94, "2": 0.03, "3": 0.03}` para elegir entre "Engagement letter", "Inbox" y "Deal settings". Es adecuado porque la latencia de 22-28 ms permite ejecutarlo en el bucle de interacción sin que el usuario perciba espera.
- Triaje de tickets de soporte: se describen el asunto, el cuerpo del ticket y las colas disponibles como opciones de tipo `choice`, y el modelo devuelve la cola y una confianza que se puede usar como umbral para escalar a revisión humana.
- Moderación de contenido: clasificación de textos o mensajes en categorías de política definidas en el prompt, sin necesidad de reentrenar cuando se añade una categoría nueva.
- Detección de alucinaciones en pipelines RAG: con 86,1 en RAGTruth, puede actuar como verificador de fidelidad entre la respuesta generada y el contexto recuperado, antes de devolver la respuesta al usuario.
- Análisis de sentimiento financiero: con 96,4 en Financial PhraseBank, es apto para etiquetar titulares, notas de prensa o extractos financieros en positivo, neutro o negativo, o en escalas definidas por el usuario mediante el tipo `score`.
- Evaluación automática de respuestas (LLM-as-a-judge de bajo coste): con 62,6 en JudgeBench, puede emplearse como primer filtro de calidad en pipelines de evaluación, reservando un modelo mayor para los casos dudosos.
- Control de agentes en juegos y simulaciones: la model card documenta pruebas en Doom, Frogger y Pac-Man, donde el código describe la situación y los movimientos legales en palabras y el modelo elige uno, útil para prototipar bots sin lógica codificada a mano.
- Desambiguación y resolución de correferencia: 68,6 en WinoGrande, aplicable a tareas de normalización de entidades o desambiguación de referencias en texto corto.
- Ajuste específico sobre dominio propio: la model card indica que un fine-tune corto sobre ejemplos propios eleva la precisión en datos held-out del 31,7% al 95,8% en menos de media hora en una GPU, lo que lo hace adecuado como base para clasificadores verticales.

## Benchmarks y rendimiento

Resultados publicados en la model card: 4.599 preguntas de cinco benchmarks públicos, más el tier difícil público de JevBench (105 elementos, puntuado por separado). Escala 0-100.

| Benchmark | Qwen3.5-0.8B sin entrenar | Jeff-Qwen3.5-0.8B | Qwen3.5-2B sin entrenar | Jeff-Qwen3.5-2B | Gemma 4 E2B sin entrenar | Jeff-Gemma4-E2B | Jev (publicado) | AutoJev-27B (publicado) |
|---|---|---|---|---|---|---|---|---|
| Overall (5 benchmarks) | 45,3 | 79,1 | 46,5 | 83,1 | 62,5 | 81,6 | 83,0 | 84,9 |
| BBH | 39,5 | 64,0 | 46,0 | 68,0 | 51,3 | 66,4 | 94,3 | 82,8 |
| Financial PhraseBank | 36,0 | 96,4 | 53,4 | 96,3 | 86,0 | 96,1 | 77,0 | 84,2 |
| JudgeBench | 56,6 | 62,6 | 57,4 | 64,6 | 46,9 | 60,6 | 78,6 | 78,9 |
| RAGTruth | 49,1 | 86,1 | 35,9 | 88,9 | 63,8 | 87,4 | 77,3 | 88,9 |
| WinoGrande | 49,2 | 68,6 | 52,2 | 79,0 | 51,0 | 77,4 | 90,7 | 83,3 |
| JevBench hard (separado) | 36,2 | 47,6 | 45,7 | 53,3 | 41,0 | 48,6 | 73,3 | 70,3 |

Calibración: ECE de 0,049 para este modelo, frente a 0,028 de la variante de 2B, 0,031 de Jeff-Gemma4-E2B y aproximadamente 0,06 de Jev según la media de sus cifras por benchmark. Tiempo de decisión: 22 ms en RTX PRO 6000 y 28 ms en Apple M4 Max (MLX) para este modelo, y 212 ms por llamada sobre la API de Jev (arnés de Doom). Las cifras publicadas de Jev y AutoJev se midieron sobre una muestra distinta de los mismos benchmarks.

La model card incluye además una prueba zero-shot con tres juegos (Doom, Frogger y Pac-Man), con 20 episodios por prueba y semilla 1234, en la que el código describe la situación y los movimientos legales en palabras y el modelo elige. Los datos disponibles incluyen la línea base aleatoria (Doom −0,05 kills; Frogger 0 cruces; Pac-Man 11,2 de 98 pastillas) y el bot de reglas codificado a mano (6,55 kills en Doom); la tabla con los resultados de cada variante de Jeff está truncada en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parámetros, en precisión de 16 bits los pesos ocupan aproximadamente 1,7 GB, coherente con un repositorio de 1,8 GB; no se publican pesos cuantizados, por lo que no hay cifras oficiales para otras precisiones.
- Cabe en GPU de consumo: el tamaño de pesos permite ejecutarlo en tarjetas con 4-8 GB de VRAM, aunque el modelo card no especifica requisitos mínimos oficiales.
- GPU de referencia en las mediciones: RTX PRO 6000 (22 ms por decisión). También se reportan 28 ms por decisión en un Apple M4 Max mediante MLX.
- Entrenamiento: una única RTX PRO 6000 para el ajuste (~2 horas para la variante de 0,8B); los datos sintéticos se generaron en dos DGX Spark.
- Opciones de despliegue: la librería declarada es transformers y el modelo lleva el tag `endpoints_compatible` (compatible con endpoints de inferencia tipo Hugging Face). No se confirma en la información disponible soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia: 22 ms en RTX PRO 6000 y 28 ms en Apple M4 Max. El throughput no está disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Precision de panel | ECE | Tiempo de decision | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Jeff-Qwen3.5-0.8B | 0,85B | 79,1% | 0,049 | 22 ms (RTX PRO 6000) | Apache 2.0 | Hugging Face |
| Jeff-Qwen3.5-2B | No disponible | 83,1% | 0,028 | 24 ms (RTX PRO 6000) | No disponible en la informacion | Hugging Face |
| Jeff-Gemma4-E2B | No disponible | 81,6% | 0,031 | 29 ms (RTX PRO 6000) | No disponible en la informacion | Hugging Face |
| Jev (publicado) | No disponible | 83,0% | ~0,06 | 212 ms por llamada (API) | No disponible en la informacion | API |
| AutoJev-27B (publicado) | 27B | 84,9% | No disponible | No disponible | No disponible en la informacion | Publicado (referencia) |

Contexto de la comparativa: el propio autor señala que Jeff usa el mismo formato de petición que Jev, pero no está afiliado ni respaldado por TypeSafe, la empresa detrás de Jev. La comparación directa es contra Jev, y AutoJev-27B se incluye solo como referencia. En clasificación y grounding (Financial PhraseBank, RAGTruth) los modelos Jeff igualan o superan a los modelos grandes; en los benchmarks de razonamiento (BBH, JudgeBench, JevBench hard) quedan claramente por debajo.

## Limitaciones y advertencias

- Modelo muy pequeno: el autor advierte explicitamente de que su razonamiento no iguala al de Jev, que corre sobre un modelo mucho mayor.
- Razonamiento limitado: 64,0 en BBH y 47,6 en JevBench hard, frente a 94,3 y 73,3 de Jev. No es adecuado para tareas que exijan inferencia multi-paso compleja.
- Solo ingles: el campo `language` declara unicamente `en`; no se documenta soporte multilingue.
- Precision zero-shot limitada en dominios especificos: el propio autor indica que, si la precision no es suficiente, un fine-tune corto sobre ejemplos propios mejora mucho el resultado (del 31,7% al 95,8% en un caso documentado), lo que implica que el rendimiento out-of-the-box depende del dominio.
- Comportamiento de caja negra en la calibracion: aunque el ECE es bajo (0,049), no se documenta como se comporta la confianza fuera de la distribucion de los benchmarks.
- Uso comercial: la licencia es Apache 2.0, que permite uso comercial, pero conviene verificar la licencia del modelo base Qwen/Qwen3.5-0.8B, no confirmada en la informacion proporcionada.
- Adopcion muy baja: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni de validacion independiente.
- No es un modelo generativo: esperar texto de salida es un error de uso; la salida es una distribucion de probabilidad sobre opciones.
- No se documentan limitaciones de longitud de contexto porque la longitud de contexto soportada no se indica en la informacion disponible.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/mstrasser/Jeff-Qwen3.5-0.8B
- Modelo relacionado Jeff-Qwen3.5-2B: https://huggingface.co/mstrasser/Jeff-Qwen3.5-2B
- Receta de entrenamiento AutoJev: https://github.com/denis-pplx/autojev
- Video de ejemplo (bot de reglas en Doom): https://huggingface.co/mstrasser/Jeff-Qwen3.5-0.8B/resolve/main/videos/doom-rule-bot.mp4
