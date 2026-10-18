# ArtinMFar/RecurrentQwen-4b

## Resumen

RecurrentQwen-4B es una conversión del modelo Qwen3.5-4B a una arquitectura recurrente híbrida de memoria acotada, inspirada en RecurrentGemma y en las aportaciones de Mamba-3. Lo publica ArtinMFar, un autor independiente, bajo licencia Apache 2.0. La idea central es que las 8 capas de atención softmax del modelo original dejan de mirar todo el historial y pasan a una ventana deslizante de 2048 tokens, mientras que las 24 capas Gated DeltaNet restantes transportan todo lo anterior en un estado recurrente de tamaño fijo.

El problema que resuelve es el crecimiento lineal de la caché KV y del coste por token generado a medida que crece la conversación. En RecurrentQwen la caché se estabiliza en 126 MB por conversación a cualquier longitud (frente a 4,1 GB a 128k tokens en el original, con un incremento de 32 KB por token) y el tiempo hasta el primer token se mantiene en torno a 75 ms con 16k, 64k y 128k tokens de historial. Esto lo hace interesante para servir muchas conversaciones largas de forma concurrente con un coste por turno predecible.

El modelo conserva la comprensión de imágenes y los dos modos de Qwen3.5 (thinking activado y desactivado), y se entrena por destilación de conocimiento del Qwen3.5-4B original sobre secuencias de hasta 16k tokens. El precio de la memoria constante es una pérdida apreciable en recuperación exacta de detalles dentro de documentos largos: LongBench-E cae a 35,2 frente a 69,0 del profesor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 24 capas Gated DeltaNet (atención lineal recurrente) + 8 capas de atención softmax con ventana deslizante de 2048 tokens |
| Parámetros totales | 5.208.389.632 (5,2B); 33M (0,7 %) son parámetros nuevos introducidos en la conversión |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | Ventana de atención de 2048 tokens; estado recurrente de tamaño fijo que arrastra el historial sin crecimiento de caché. Entrenamiento con secuencias de hasta 16.384 tokens y perplejidad estable hasta 32k |
| Tipos de cuantización | No disponible. El repositorio solo publica safetensors; no se documentan versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 10,4 GB); requiere `custom_code` y, previsiblemente, `trust_remote_code=True` en transformers |

## Arquitectura y entrenamiento

Qwen3.5-4B ya era un modelo híbrido: de sus 32 capas, 24 son Gated DeltaNet y 8 son atención softmax completa con caché KV creciente. RecurrentQwen modifica tres elementos. Primero, sustituye la atención completa por una ventana deslizante de 2048 tokens con caché KV rotatoria de como máximo 2047 tokens. Segundo, añade a las capas recurrentes una puerta de salto selectiva con señal de novedad, `skip = sigmoid(W·x + u·r + c)`, que escala de forma conjunta la decaída del estado, la fuerza de escritura y el paso de rotación. La señal `r = -log(1 - max cos-sim)` mide cuánto repite la clave actual alguna de las 128 claves previas: ronda 2 en prosa ordinaria y entre 6 y 9 en flujos repetitivos (logs, salidas de herramientas repetidas, texto boilerplate), de modo que el contenido redundante pierde prioridad en el estado a largo plazo mientras la ventana local lo sigue viendo literalmente. Tercero, incorpora un estado de valor complejo mediante rotaciones dependientes de los datos: un ángulo aprendido por cabeza se acumula en el tiempo y se aplica como rotación sobre 16 pares de dimensiones de claves y consultas, con el paso escalado por la parte `keep` de la puerta de salto. La normalización QK de Mamba-3 ya estaba presente en Gated DeltaNet y se mantiene.

No se adoptan otras ideas de Mamba-3: la discretización exponencial-trapezoidal (exigiría un kernel de recurrencia distinto), las actualizaciones de estado MIMO (requieren proyecciones y kernels nuevos que no se pueden inicializar desde los pesos de Qwen) y los sesgos aprendibles de clave/consulta (romperían la norma unitaria que necesita la regla delta). Todos los parámetros nuevos arrancan en valores que reproducen casi exactamente el modelo original antes del entrenamiento.

El entrenamiento es una destilación de conocimiento con actualización de todos los parámetros: el Qwen3.5-4B original actúa de profesor y RecurrentQwen de alumno. La pérdida por token combina KL(profesor ‖ alumno) sobre el vocabulario completo de 248k tokens más 0,2 × entropía cruzada sobre los tokens de asistente, con secuencias de hasta 16k tokens para forzar al alumno a trasladar al estado recurrente todo lo anterior a los 2048 tokens de ventana. Los datos declarados son SmolTalk2 (chat y seguimiento de instrucciones, con 12 subconjuntos `no_think`: Magpie-Ultra, OpenHermes-2.5, conversaciones con system prompt, Tulu-3…); la información disponible se interrumpe en ese punto, por lo que no se puede detallar la composición completa ni el volumen total de tokens.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados de Qwen3.5-4B.
- Modo thinking activado y desactivado, ambos conservados tras la conversión.
- Comprensión de imágenes: el pipeline declarado es image-text-to-text y el autor afirma que mantiene la capacidad de visión de Qwen3.5.
- Razonamiento matemático y de sentido común a nivel de modelo de 4-5B (GSM8K 90,8 sin thinking; ARC-Challenge 89,2).
- Comprensión de gráficos y documentos con componentes visuales (ChartQA 60,7).
- Conversaciones de historial muy largo con coste de decodificación constante tras los primeros 2048 tokens.
- Memoria de trabajo sobre el "hilo" de una conversación larga, útil para seguir instrucciones dadas mucho antes en el diálogo.
- Soporte de tool calling y de agentes: no se documenta explícitamente en la información disponible, aunque el modelo base Qwen3.5 lo soporta; la conversión no menciona cambios en la plantilla de chat ni en el formato de herramientas.
- Capacidades multilingües: no se documentan; los datos de destilación listados son mayoritariamente en inglés.
- Capacidad especial: estado recurrente de tamaño fijo que actúa como memoria comprimida del historial, con puerta selectiva que degrada la prioridad del contenido repetitivo.

## Casos de uso

- Atención al cliente con sesiones largas: al mantener la caché en 126 MB por conversación a cualquier longitud y un tiempo hasta el primer token estable en torno a 75 ms, se pueden servir sesiones de decenas de miles de tokens sin que el coste por turno crezca ni la memoria del servidor se dispare.
- Asistentes de soporte técnico que leen logs: la puerta selectiva detecta contenido repetitivo (r entre 6 y 9 en flujos repetidos) y evita que inunde el estado a largo plazo, de modo que el modelo sigue recordando los pasos anteriores de la diagnosis mientras la ventana local ve el log literal.
- Agentes con herramientas en ejecución prolongada: si el bucle del agente genera salidas repetidas o ticks de motor, el estado recurrente no se degrada y se mantiene el contexto de la tarea original, con coste de decodificación plano.
- Resumen y seguimiento de reuniones o transcripciones de más de 16k tokens: la perplejidad se mantiene plana hasta 32k tokens (12,8 en las posiciones 16k-32k), suficiente para resumir y responder preguntas generales sobre el contenido.
- Procesamiento de documentación con imágenes o capturas: al conservar la visión, sirve para extraer información de diagramas, tablas e interfaces, aunque la precisión en gráficos cae respecto al original (ChartQA 60,7 frente a 70,7).
- Prellenado rápido de contextos largos en pipelines por lotes: el prellenado de 128k tokens es 1,6 veces más rápido que en el original (5,8 s frente a 9,3 s), lo que reduce el coste de indexar o clasificar documentos largos.
- Chat multi-turno en dispositivos con memoria limitada: con cuantización a 8 o 4 bits y una caché constante de 126 MB por secuencia, encaja en GPU de consumo para prototipos y demos interactivas.

## Benchmarks y rendimiento

| Métrica | RecurrentQwen-4B | Qwen3.5-4B (original) |
|---|---|---|
| GSM8K, thinking desactivado | 90,8 | 95,0 |
| GSM8K, thinking activado | 82,5 | 93,8 |
| ARC-Challenge | 89,2 | 91,0 |
| ChartQA | 60,7 | 70,7 |
| LongBench-E (media) | 35,2 | 69,0 |
| Perplejidad en posiciones 16k-32k de un libro | 12,8 | 11,3 |
| Memoria de caché por conversación | 126 MB constantes | 4,1 GB a 128k tokens (+32 KB por token) |
| Tiempo hasta el primer token con historial cacheado (16k / 64k / 128k) | ~75 ms / ~75 ms / ~75 ms | 74 ms → 178 ms |
| Prellenado de 128k tokens desde cero | 5,8 s | 9,3 s |

Datos adicionales aportados por el autor: una conversión sin entrenamiento (solo aplicando la ventana) daría perplejidad 36,6 y LongBench-E 33,5, lo que sitúa la mayor parte de la recuperación de modelado de texto largo en el entrenamiento por destilación. El autor no especifica el hardware con el que se midieron los tiempos. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- Pesos en precisión completa (BF16/FP16): aproximadamente 10,4 GB, coherente con el tamaño del repositorio. Es la cifra que ocupa el checkpoint.
- Inferencia en 8 bits: en torno a 5,2 GB de pesos, más activaciones y el estado recurrente; estimación derivada del número de parámetros, no verificada por el autor.
- Inferencia en 4 bits: en torno a 2,6 GB de pesos; misma advertencia, es una estimación aritmética y no hay versiones cuantizadas publicadas.
- Cabe en GPU de consumo: una RTX 4090 (24 GB) aloja los pesos en BF16 con margen amplio, ya que la caché por secuencia es de 126 MB sea cual sea la longitud; una RTX 4080 (16 GB) también, con menos espacio para lote. Tarjetas de 12 GB o menos necesitarían cuantización.
- GPU de datacenter recomendadas para servicio concurrente: A100 40/80 GB o H100, donde el límite práctico pasa a ser el número de secuencias simultáneas (126 MB por conversación) y no la longitud del contexto.
- Despliegue: `transformers` es la vía declarada, con `custom_code` y previsiblemente `trust_remote_code=True`. No hay confirmación de soporte en vLLM, TGI, llama.cpp ni Ollama para la arquitectura `recurrent_qwen`; habría que verificar que el kernel de Gated DeltaNet modificado y la ventana rotatoria estén implementados antes de plantear producción.
- Latencia y throughput: el autor reporta aproximadamente 75 ms de tiempo hasta el primer token sobre historial cacheado a 16k, 64k y 128k, y 5,8 s para prellenar 128k desde cero, sin indicar la GPU empleada. El coste por token generado es constante a partir de 2048 tokens de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Memoria de caché | LongBench-E | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RecurrentQwen-4B | 5,2B | Ventana de 2048 + estado recurrente fijo; entrenado a 16k | 126 MB constantes | 35,2 | Apache 2.0 | HuggingFace, 0 descargas, con `custom_code` |
| Qwen3.5-4B (modelo base) | ~4B (no se detalla en la información) | Atención completa, caché lineal con el contexto | 4,1 GB a 128k | 69,0 | No indicada en la información | HuggingFace |
| RecurrentGemma (referencia arquitectónica) | No disponible en la información | Ventana local + estado recurrente | No disponible | No disponible | No disponible | No disponible |
| Modelos híbridos tipo Mamba-3 (referencia) | No disponible en la información | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación con sentido solo es posible frente a su profesor, el Qwen3.5-4B original, que gana en recuperación exacta y en matemáticas mientras pierde en memoria y latencia a contextos largos. No hay datos publicados en la información disponible para comparar con RecurrentGemma, Griffin, Jamba u otros híbridos recurrentes.

## Limitaciones y advertencias

- Recuperación exacta degradada: LongBench-E cae a 35,2 frente a 69,0 del original. El estado de tamaño fijo conserva la idea general del historial, pero citar un detalle concreto de mucho más atrás de 2048 tokens no es fiable. El propio autor recomienda usar el modelo original para esa tarea.
- Pérdida de calidad general: GSM8K baja de 95,0 a 90,8 sin thinking y de 93,8 a 82,5 con thinking; ARC-Challenge de 91,0 a 89,2 y ChartQA de 70,7 a 60,7. Las trazas de razonamiento que superan la ventana de 2048 tokens son las más afectadas, lo que penaliza especialmente el modo thinking en problemas largos.
- Riesgo de alucinación en detalles lejanos: al no poder citar literalmente más allá de la ventana, el modelo puede reconstruir de forma plausible información que el estado recurrente solo retiene de forma comprimida.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad en la información disponible.
- Idiomas: no se declara el conjunto de idiomas soportados; los datos de destilación enumerados son mayoritariamente en inglés, por lo que el rendimiento en castellano u otras lenguas no está verificado.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B puede tener sus propios términos que conviene revisar antes de explotación comercial.
- Código personalizado: el repositorio requiere `custom_code`, lo que implica ejecutar código del autor con `trust_remote_code=True`; hay que auditar los kernels antes de desplegarlo.
- Madurez: el modelo se publicó el 18 de octubre de 2026, tiene 0 descargas y 0 likes, y no se han publicado resultados de MMLU ni HumanEval. No hay evidencia de uso en producción por terceros.
- Cuantización: no se ofrecen pesos GGUF, AWQ ni GPTQ, y no está claro que las herramientas habituales soporten la arquitectura recurrente modificada.
- Evaluación incompleta: las cifras de latencia y prellenado no indican GPU ni lote, por lo que no son directamente trasladables a un despliegue propio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ArtinMFar/RecurrentQwen-4b
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper de RecurrentGemma (referencia arquitectónica): https://arxiv.org/abs/2404.07839
