# kiteteam/Inkling-2-Mini-q4l-MLX

## Resumen

Inkling-2-Mini-q4l-MLX es una cuantización de 4 bits del modelo Inkling 2 Mini de Thinking Machines, un mixture of experts (MoE) con bucles de 26.400 millones de parámetros totales y 3.400 millones activos, adaptado para ejecutarse en Apple Silicon mediante la librería MLX. La variante q4l parte de la conversión de 4 bits de mlx-community y aplica un único cambio: los expertos enrutados de las cuatro últimas capas (20-23), que en la versión base se mantienen en MXFP8, pasan aquí a 4 bits afines con grupos de 64. Esto reduce el peso de 17,33 GB a 15,40 GB y el pico de memoria de 23,19 GB a 20,94 GB en una conversación de 94.600 tokens con caché KV de 8 bits.

El modelo resuelve el problema de desplegar un MoE de casi 10.000 millones de parámetros efectivos en equipos de consumo con memoria unificada, concretamente Macs con 32 GB o más. Mantiene el pipeline image-text-to-text, incluye una torre de visión en bfloat16 sin cuantizar y conserva el tokenizador y la plantilla de chat del modelo base. La licencia es Apache-2.0, igual que la del original.

Es relevante ahora porque demuestra que la cuantización selectiva por capas permite recortar memoria y tamaño de descarga con una degradación medible mínima: la divergencia KL frente a Q8_0 pasa de 0,0279 a 0,0289 y la tasa de coincidencia top-1 se mantiene en el 92,8 %. La velocidad de decodificación incluso mejora ligeramente, de 45,0-45,3 a 46,3-46,5 tokens por segundo en un turno con tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con bucles (inkling2_loop), transformer con capas recurrentes y torre de visión |
| Parametros totales | 9.826.388.480 (según safetensors del repo); 26,4 B según la model card del modelo original |
| Parametros activos | 3,4 B |
| Longitud de contexto | no disponible (la evaluación usa ventanas de 94.600 y 96.000 tokens) |
| Tipos de cuantizacion | 4 bits afín, grupo 64 (atención, embedding, cabeza de salida y expertos de capas 20-23); NVFP4 con escala global por experto (expertos de capas 0-19); MXFP8 en el modelo base para capas 20-23; router en float32; puertas de mensaje de bucle sin cuantizar; torre de visión en bfloat16 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), 4 shards |

## Arquitectura y entrenamiento

La arquitectura es un mixture of experts con mecanismo de bucle (looped MoE): el modelo reutiliza bloques de cómputo en varias pasadas, lo que permite aumentar la profundidad efectiva sin multiplicar los parámetros. Dispone de un router en float32 que selecciona expertos enrutados, puertas de mensaje de bucle sin cuantizar y una torre de visión separada que procesa imágenes junto con texto. Los detalles de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF o DPO) no se detallan en la información disponible; la model card remite a la ficha de Thinking Machines para esos datos.

Esta variante no reentrena ni modifica el modelo: es una recuantización pura. Cada experto de las capas 20-23 se desquantizó exactamente desde sus valores MXFP8 y se recuantizó con `mx.quantize` a 4 bits afines en grupos de 64, un experto a la vez. El resto de tensores se copia byte a byte desde la revisión `9856dc53edead71405f8348930937c3638ff21a2` del modelo de mlx-community, con el mismo tokenizador y plantilla de chat. La selección de capas se hizo midiendo el impacto de cada cambio: cuantizar a 4 bits los expertos de las capas 20-23 cuesta +0,001 de divergencia KL, mientras que cuantizar la atención a 4 bits resulta mucho más costoso y por eso se mantiene como en el modelo base.

## Capacidades

- Generación de texto conversacional en inglés con soporte de razonamiento configurable (reasoning effort bajo o alto).
- Procesamiento de imagen y texto de forma conjunta (pipeline image-text-to-text) mediante torre de visión en bfloat16.
- Tool calling y function calling, con un conjunto de pruebas específico del autor centrado en herramientas de ficheros, planificación, mensajes, historial y persistencia.
- Razonamiento en varios pasos y flujos de agente, evaluado con 83 y 65 casos en el conjunto de pruebas de agente del autor.
- Contexto largo: las evaluaciones se realizan con ventanas de 94.600 y 96.000 tokens y caché KV de 8 bits.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repo.
- No incluye el modelo borrador DSpark para decodificación especulativa.

## Casos de uso

- Asistentes locales en Mac: el modelo cabe en un Mac de 32 GB o más y permite ejecutar un asistente conversacional con contexto de 95.000 tokens sin conexión a servicios externos, usando MLX como runtime nativo de Apple Silicon.
- Agentes con herramientas en el escritorio: el soporte de tool calling y su rendimiento en el conjunto de pruebas de agente del autor (diferencia de −1,1 ± 1,7 puntos frente al 4-bit base) lo hacen adecuado para automatizar tareas de gestión de ficheros, calendario y mensajes en local.
- Análisis de documentos e imágenes: al aceptar entrada image-text-to-text, puede procesar capturas, diagramas o documentos escaneados junto con instrucciones de texto en una misma conversación.
- Prototipado de pipelines de agentes multi-paso: la ventana de 96.000 tokens permite mantener historial largo de interacciones y resultados intermedios de herramientas sin truncar.
- Evaluación de cuantizaciones en investigación: sirve como caso de estudio de cuantización selectiva por capas, con métricas publicadas de KLD y acuerdo top-1 frente a Q8_0 para reproducir el análisis.
- Despliegue de bajo consumo en portátiles: con 15,40 GB de pesos y unos 21 GB de pico en contexto largo, es viable en equipos con memoria unificada de 32 GB, un segmento donde los MoE de este tamaño rara vez caben.
- Generación de código asistida en local: aunque no se publican benchmarks de código, el soporte de tool calling y el modo de razonamiento permiten integrarlo en editores o terminales que necesiten un modelo privado y sin latencia de red.

## Benchmarks y rendimiento

| Métrica | mlx-community 4-bit | q4l |
|---|---:|---:|
| KLD frente a Q8_0 | 0,0279 | 0,0289 |
| Acuerdo top-1 con Q8_0 | 92,8 % | 92,8 % |
| Pico de memoria, chat de 94,6K tokens, caché KV 8 bits | 23,19 GB | 20,94 GB |
| Decodificación en turno con tool call | 45,0–45,3 tok/s | 46,3–46,5 tok/s |
| Conjunto de agente, puntos frente al 4-bit | – | −1,1 ± 1,7 (83 casos); repetido −0,3 ± 1,4 (65) |
| Tiempo en tareas que ambos superan | 1,00× | 0,96× |

Mediciones realizadas en un Apple M4 Pro (GPU de 20 núcleos, 48 GB), macOS 27. El conjunto de agente se puntúa con jueces modelo, temperatura 1, reasoning effort bajo, contexto de 96K y una petición a la vez. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: alrededor de 21 GB de pico para una conversación de 95.000 tokens con caché KV de 8 bits, incluyendo 0,64 GB de la torre de visión solo cuando se carga.
- Peso en disco: 15,40 GB en 4 shards safetensors.
- Hardware recomendado: Apple Silicon con 32 GB o más de memoria unificada; el autor lo ejecuta en Macs de 32 GB o más y las mediciones se hicieron en un M4 Pro de 48 GB.
- GPU consumer: no aplica a GPU NVIDIA o AMD por el formato MLX; requiere Apple Silicon.
- Despliegue: mlx-lm con el PR ml-explore/mlx-lm#2086, que añade la arquitectura. Ejemplo: `mlx_lm.generate --model kiteteam/Inkling-2-Mini-q4l-MLX --prompt "Hello"`.
- Throughput: 46,3–46,5 tok/s en decodificación durante un turno con tool call en M4 Pro; 0,96× el tiempo del 4-bit base en tareas que ambos superan.
- Muestreo: temperatura 1 sin truncamiento, según `generation_config.json` del proveedor.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| kiteteam/Inkling-2-Mini-q4l-MLX | 26,4 B (MoE) | 3,4 B | no disponible (evaluado a 96K) | 4 bits selectivo MLX | Apache-2.0 | Hugging Face, 239 descargas |
| mlx-community/Inkling-2-Mini-4bit | 26,4 B (MoE) | 3,4 B | no disponible | 4 bits MLX (MXFP8 en capas 20-23) | Apache-2.0 | Hugging Face |
| thinkingmachines/Inkling-2-Mini | 26,4 B (MoE) | 3,4 B | no disponible | pesos originales | Apache-2.0 | Hugging Face |

Frente a la conversión de mlx-community, q4l ocupa 1,93 GB menos en disco y 2,25 GB menos de pico de memoria, con una diferencia de KLD de +0,001 y sin pérdida medible en el conjunto de agente. Frente al modelo original de Thinking Machines, ambas conversiones MLX sacrifican precisión por viabilidad en hardware de consumo. No se dispone de datos de benchmarks estándar para comparar el rendimiento bruto con otras familias de modelos del mismo tamaño.

## Limitaciones y advertencias

- Idiomas: solo inglés según la etiqueta del repo; no se garantiza un rendimiento correcto en castellano u otros idiomas.
- Alucinación: no se documentan tasas de alucinación ni evaluaciones de veracidad en la información disponible.
- Sesgos: no se detallan sesgos conocidos; la model card remite a la ficha del modelo original para las limitaciones de entrenamiento.
- Precisión: la cuantización introduce una divergencia KL de 0,0289 frente a Q8_0 y un acuerdo top-1 del 92,8 %, por lo que aproximadamente un 7 % de las posiciones difieren del token más probable del modelo de referencia.
- Contexto: la longitud máxima de contexto no está especificada; las pruebas usan 96K, pero no se confirma que sea el límite del modelo.
- Dependencia de software: requiere una versión de mlx-lm con el PR #2086, no incluida en la versión estable; sin ella el modelo no carga.
- Hardware: exclusivo de Apple Silicon; no es desplegable en GPU NVIDIA, AMD ni en CPU convencional sin reconversión.
- Decodificación especulativa: el modelo borrador DSpark no está incluido, de modo que no se aprovecha esa aceleración.
- Licencia: Apache-2.0 permite uso comercial, pero conviene revisar la ficha del modelo original para condiciones adicionales de atribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiteteam/Inkling-2-Mini-q4l-MLX
- Modelo base de mlx-community: https://huggingface.co/mlx-community/Inkling-2-Mini-4bit
- Modelo original de Thinking Machines: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- PR de mlx-lm que añade la arquitectura: https://github.com/ml-explore/mlx-lm/pull/2086
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
