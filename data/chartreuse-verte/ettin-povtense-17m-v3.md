# chartreuse-verte/ettin-povtense-17m-v3

## Resumen

`ettin-povtense-17m-v3` es un encoder de 16.867.858 parámetros desarrollado por el usuario chartreuse-verte, afinado a partir de `jhu-clsp/ettin-encoder-17m` (arquitectura ModernBERT). Su tarea es clasificar tres propiedades narrativas de un mensaje de roleplay: el punto de vista (primera, segunda o tercera persona, o ambiguo), el tiempo verbal (pasado, presente o ambiguo) y, novedad en la versión 3, el destinatario de la narración (tú, otro o ninguno). El modelo no genera texto: es un clasificador de secuencias que devuelve un softmax de 18 vías (6 voces por 3 tiempos) del que se derivan tres marginales.

El problema que resuelve es la deriva de voz en aplicaciones de roleplay con LLM: cuando una respuesta se desvía del registro que la escena había establecido, la aplicación puede pedir al modelo principal que la reescriba. El eje de destinatario añade una señal que el punto de vista por sí solo no captura: "I guide you inside" y "I guide him inside" son ambos primera persona presente, pero solo uno sigue hablando al usuario.

Es relevante por su tamaño mínimo (0,2 GB de repositorio, 19,7 MB en GGUF q8_0) y su latencia declarada de 1,6 ms por mensaje en ONNX con 4 hilos de CPU, lo que permite integrarlo como filtro previo en pipelines de generación sin coste apreciable. La ventana de contexto está limitada a 256 tokens y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), base `jhu-clsp/ettin-encoder-17m` |
| Parametros totales | 16.867.858 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | fp32 (safetensors), q8_0 (GGUF), ONNX fp32 |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF, ONNX |
| Cabeza de clasificacion | softmax de 18 vías (6 voces × 3 tiempos), leída como tres marginales |
| Tarea | text-classification |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT de 17M parámetros con una cabeza de clasificación que produce 18 logits en un orden concreto: filas `first|you`, `first|other`, `first|none`, `second`, `third` y `ambiguous`, y columnas de tiempo `past`, `present` y `ambiguous`. Las tres etiquetas se obtienen sumando marginales sobre esa matriz y tomando el argmax después de sumar, no leyendo la celda superior. Fuera de la primera persona, el destinatario se deduce del punto de vista (`second` → `you`, `third` → `other`, `ambiguous` → `none`); solo la primera persona necesita respuesta propia, y por eso la cabeza solo desdobla esa fila.

El entrenamiento usó 46.380 filas procedentes de once corpus: turnos de roleplay, mensajes de chat minados, Wikipedia y prensa (para anclar la clase `ambiguous`), relleno sintético y específico de construcciones, pares de diálogo contrastivos, filas cortas y, nuevos en v3, pares mínimos de destinatario (una fila con `you` reescrita a `him`/`her`, conservada solo si el etiquetador respondía `other`) y relleno generado de primera persona con `other`/`none`. Se entrenaron 5 épocas con lr 4,5e-5, batch 64, entropía cruzada suave ponderada por clase (frecuencia inversa de celda, recortada a 5×) y partición por conversación. Se ejecutaron tres semillas sobre datos idénticos; esta ficha corresponde a la semilla 2, elegida por validación. Las etiquetas de punto de vista y tiempo provienen de `z-ai/glm-5.3-flash` con reglas fijas (la narración cuenta, el habla entrecomillada no); las de destinatario, de `typesafe/jev-1.13`, y las filas de primera persona se entrenan con las probabilidades de Jev en lugar de su argmax.

## Capacidades

- Clasificación del punto de vista narrativo: `first`, `second`, `third`, `ambiguous`.
- Clasificación del tiempo verbal: `past`, `present`, `ambiguous`.
- Clasificación del destinatario de la narración: `you`, `other`, `none` (nuevo en v3).
- Detección de deriva de voz comparando estas etiquetas entre turnos de una conversación.
- Abstención explícita mediante las clases `ambiguous` y `none`, pensada para no disparar reescrituras innecesarias.
- Inferencia en CPU con latencia muy baja (1,6 ms por mensaje en ONNX con 4 hilos, batch 1).
- Exportación a GGUF para llama.cpp (`--embeddings --pooling rank`, tomando los primeros 18 valores del embedding) y a ONNX con ejes dinámicos de batch y secuencia.
- No soporta tool calling, agentes, generación de texto, visión ni audio: es exclusivamente un clasificador.

## Casos de uso

- Control de deriva de voz en aplicaciones de roleplay: tras cada respuesta del LLM, el clasificador etiqueta el turno y lo compara con el registro de la escena; si el punto de vista o el tiempo cambian sin justificación, la aplicación solicita una reescritura. La latencia de 1,6 ms hace viable ejecutarlo en cada turno.
- Detección de cambio de interlocutor en primera persona: el eje de destinatario distingue "I guide you inside" de "I guide him inside", permitiendo que la aplicación detecte cuándo el modelo ha dejado de dirigirse al usuario sin que el punto de vista cambie.
- Filtrado previo en pipelines de generación: al ser un modelo de 17M parámetros, puede actuar como guardarraíl barato antes de invocar al LLM principal, reduciendo el coste de reescrituras innecesarias (la tasa de falsa deriva declarada es del 1,3 % en punto de vista y del 0,3 % en tiempo sobre el conjunto gold).
- Etiquetado y curaduría de corpus de roleplay: clasificación masiva de conversaciones por voz y tiempo para construir datasets equilibrados o auditar la consistencia narrativa de un corpus existente.
- Analítica de calidad de producto: medir la frecuencia de deriva de voz por sesión, modelo o prompt, con métricas agregadas de las tres etiquetas, para evaluar cambios en el sistema de generación.
- Despliegue en entornos sin GPU: la versión GGUF q8_0 (19,7 MB) y la ONNX fp32 (67,6 MB) permiten ejecutar el clasificador en servidores de CPU o en el propio dispositivo, con 4 hilos y batch 1.
- Enrutado condicional en aplicaciones multi-escena: usar la etiqueta de destinatario para decidir si la respuesta debe dirigirse al usuario o a un personaje secundario de la escena.

## Benchmarks y rendimiento

Todas las cifras son acuerdo con etiquetas de LLM; ningún conjunto, incluidos los de evaluación, fue anotado por humanos.

Conjunto gold: 500 ventanas reservadas de conversaciones reales, nunca vistas en entrenamiento.

| Metrica | v2 | v3 |
|---|---|---|
| POV exactitud / macro-F1 | 0,958 / 0,935 | 0,936 / 0,926 |
| Tiempo exactitud / macro-F1 | 0,950 / 0,948 | 0,934 / 0,935 |
| Destinatario exactitud / macro-F1 | no disponible | 0,930 / 0,928 |
| Falsa deriva: POV / tiempo / destinatario | 0,5 % / 0,0 % / no disponible | 1,3 % / 0,3 % / 1,2 % |
| Deriva no detectada: POV / tiempo / destinatario | 4,2 % / 0,0 % / no disponible | 4,5 % / 0,0 % / 3,8 % |

Conjunto gold_first: 899 ventanas de las mismas conversaciones reservadas, 268 de ellas en primera persona.

| Metrica | Valor |
|---|---|
| Destinatario exactitud / macro-F1 | 0,921 / 0,926 |
| F1: you / other / none | 0,955 / 0,894 / 0,929 |
| Falsa deriva / deriva no detectada | 3,0 % / 4,1 % |

Sondas: 195 casos escritos a mano, uno por construcción, excluidos de todos los corpus.

| Metrica | v2 | v3 |
|---|---|---|
| POV, 146 originales | 144 | 145 |
| Tiempo, 145 originales | 136 | 137 |
| Destinatario, pares mínimos y you-solo-en-habla (24) | no disponible | 24 |
| Destinatario, los 195 | no disponible | 187 |

La mayoría de fallos de destinatario son oraciones sueltas (86 de 92); las ventanas de dos y tres oraciones aciertan 73 de 75, y los mensajes completos 28 de 28. La concordancia entre formatos es alta: ONNX coincide con el modelo torch en los tres ejes sobre 200 de 200 ventanas, y el GGUF q8_0 coincide en 492-493 de 495 por eje, con todas las discrepancias en entradas limítrofes.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 para los 16,9M de parámetros; el modelo cabe holgadamente en cualquier GPU consumer, incluso en las de gama baja.
- GPU recomendadas: no requiere GPU; cualquier GPU con al menos 1 GB de memoria libre es suficiente. No se publican cifras de throughput en GPU.
- Cabe en GPU consumer: sí, en cualquier RTX o equivalente, aunque su uso típico es en CPU.
- Despliegue: transformers (`AutoModelForSequenceClassification`), ONNX Runtime, llama.cpp con la versión GGUF (`--embeddings --pooling rank`), y text-embeddings-inference según los tags del repositorio.
- Latencia declarada: 1,6 ms por mensaje en ONNX con 4 hilos de CPU y batch 1.
- No se han publicado cifras de throughput para GPU ni para lotes grandes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ettin-povtense-17m-v3 | 16,9M | 256 tokens | Clasificación POV/tiempo/destinatario | MIT | Hugging Face (safetensors, GGUF, ONNX) |
| ettin-povtense-17m-v2 | no disponible | no disponible | Clasificación POV/tiempo | no disponible | Hugging Face |
| jhu-clsp/ettin-encoder-17m | 17M | no disponible | Encoder base | no disponible | Hugging Face |

La comparación con v2 es la más directa: v3 añade el eje de destinatario a costa de aproximadamente un punto de exactitud en punto de vista y tiempo (0,936 frente a 0,958 en POV; 0,934 frente a 0,950 en tiempo, sobre tres semillas). La cabeza de v3 tiene 18 logits en un orden nuevo, no 12, por lo que un lector de v2 malinterpretará silenciosamente las salidas. No se dispone de datos de benchmarks de alternativas de la misma categoría (clasificadores de atributos narrativos) en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: no se ha entrenado ni evaluado en otros idiomas.
- Ventana máxima de 256 tokens; los mensajes más largos se truncan, lo que puede perder la parte final de la narración.
- Las etiquetas de entrenamiento y evaluación provienen de LLM (`z-ai/glm-5.3-flash` y `typesafe/jev-1.13`), no de anotación humana; las métricas miden acuerdo con esos modelos, no verdad objetiva.
- La exactitud en destinatario cae en oraciones sueltas (86 de 92 fallos); es más fiable en ventanas de dos o tres oraciones y en mensajes completos.
- Riesgo de falsa deriva: 1,3 % en punto de vista, 0,3 % en tiempo y 1,2 % en destinatario sobre gold; cada falso positivo implica una reescritura innecesaria. El autor recomienda no emitir juicio de deriva en un eje donde cualquiera de los dos lados lea `ambiguous` o `none`.
- Incompatibilidad con lectores de v2: el orden y número de logits cambia, y un lector antiguo fallará sin aviso.
- No es un modelo generativo ni soporta tool calling, agentes o multimodalidad; cualquier expectativa en ese sentido es un error de uso.
- Licencia MIT, que permite uso comercial sin restricciones adicionales conocidas, pero el modelo base y los etiquetadores empleados pueden tener sus propias condiciones que conviene verificar.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación externa independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chartreuse-verte/ettin-povtense-17m-v3
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-17m
- Etiquetador de POV y tiempo: `z-ai/glm-5.3-flash` (referenciado en la model card, sin URL directa en la información disponible)
- Etiquetador de destinatario: `typesafe/jev-1.13` (referenciado en la model card, sin URL directa en la información disponible)
