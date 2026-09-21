# shisa-ai/shisa-de-1

## Resumen

Shisa DE-1 (Decision Engine 1) es un modelo de decision de proposito general desarrollado por Shisa AI. No es un modelo conversacional al uso: recibe un estado (por ejemplo, un correo electronico, un fragmento de contexto o una traza de agente) y una lista de preguntas con nombre, y devuelve una respuesta tipada por pregunta. La respuesta no se genera como texto libre, sino que se lee directamente de la distribucion del siguiente token en la frontera de respuesta, restringida a las letras de las opciones validas (A, B, C...). Esto convierte al modelo en un componente determinista y medible dentro de pipelines de decision automatizada.

Tecnicamente parte de `google/gemma-4-26B-A4B-it`, un transformer con mezcla de expertos (MoE) de 30 capas, 128 expertos con 8 activos mas 1 compartido, tamano oculto de 2.816, vocabulario de 262.144 tokens y una ventana de contexto de 256K. El modelo tiene 25,2B parametros totales y 3,8B activos por pasada (el recuento real de safetensors es de 25.805.933.872 parametros). Se distribuye en bfloat16, con licencia Apache-2.0, e incluye el codificador de vision en los pesos, aunque este no fue modificado durante el entrenamiento.

Su relevancia actual esta en que sustituye el clasificador discriminativo tradicional por un modelo grande reutilizado como cabecera de decision, con un contrato de servicio muy estricto (una peticion por pregunta, `max_tokens=1`, lectura de `logprobs`). El autor lo plantea para casos de compactacion de contexto, deteccion de fraude, filtrado de texto generado de baja calidad ("anti-slop") y barreras de seguridad, dominios donde la trazabilidad numerica de la decision importa mas que la fluidez del texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 con mezcla de expertos (MoE): 30 capas, 128 expertos con 8 activos mas 1 compartido, tamano oculto 2.816 |
| Parametros totales | 25,2B segun la model card del autor; 25.805.933.872 parametros segun los safetensors |
| Parametros activos | 3,8B por token (MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | No disponible; el checkpoint publicado esta en bfloat16 |
| Idiomas soportados | Ingles (en) y japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (2 shards, 1.013 tensores, 51.612.009.332 bytes / 48,1 GiB) |
| Precisión | bfloat16 |
| Vocabulario | 262.144 tokens |
| Modelo base | google/gemma-4-26B-A4B-it |
| Tipo de modelo | Modelo de lenguaje causal; no se anade ninguna cabeza de tarea al grafo |
| Pipeline declarado | text-classification |
| Tamano del repositorio | 51,6 GB |
| Idioma de la model card | Ingles |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer causal con capas de mezcla de expertos. Cada capa dispone de 128 expertos, de los que se activan 8 mas un experto compartido por token, lo que da 3,8B parametros activos sobre un total de 25,2B. El vocabulario es de 262.144 tokens y el contexto alcanza los 256K tokens. Los pesos se publican en bfloat16 y el codificador de vision del modelo base sigue presente en el checkpoint, sin haber sido entrenado ni modificado.

El entrenamiento es inusual porque el objetivo de entrenamiento coincide exactamente con el procedimiento de lectura en produccion: entropia cruzada softmax restringida a las filas correspondientes a las letras de opcion en la frontera de respuesta. Es decir, los logits del siguiente token se restringen a las K filas de letras validas y la perdida apunta a la letra correcta. Se usaron 3.632 ejemplos de entrenamiento orientados a casos de uso concretos: compactacion de contexto, deteccion de fraude, filtrado de texto de baja calidad ("anti-slop") y barreras de seguridad. La precision de entrenamiento subio de 0,888 a 0,936 y a 0,968 a lo largo de las tres epocas. Como comparacion interna, el autor entreno tambien una cabeza de producto escalar sobre estados ocultos congelados, que obtuvo 0,837 de AUROC en el test sellado de compactacion, frente a 0,8902 de este modelo.

El contrato de servicio forma parte del diseno: se envia una peticion por pregunta, se renderiza el estado y la pregunta con la lista de opciones y se leen los `logprobs` en la posicion de respuesta con `max_tokens=1`. Los logits de letras se restringen a las K opciones validas y se toma el argmax para una respuesta de eleccion, o el softmax sobre esas filas para una probabilidad `noul`. Las preguntas `noul` usan el par Si/No y se reporta la probabilidad normalizada de la fila "Yes". Cada letra de opcion debe ser un unico token y `prompt + letra` debe tokenizarse como los tokens del prompt mas exactamente el token de esa letra.

## Capacidades

- Decision con opciones cerradas: dada una evidencia y un criterio, elige exactamente una opcion de una lista enumerada con letras.
- Salida tipada por pregunta: admite varias preguntas con nombre en una misma peticion, cada una con su propia lista de opciones.
- Puntuacion de probabilidad: ademas del argmax, expone una probabilidad normalizada sobre las opciones validas (util para umbrales y para medir confianza).
- Preguntas `noul`: variante Si/No con probabilidad normalizada de la opcion "Yes".
- Casos de uso entrenados explicitamente: compactacion de contexto, deteccion de fraude, filtrado de "slop" y barreras de seguridad.
- Multilingue limitado: ingles y japones declarados.
- Vision: el codificador de vision esta presente en los pesos, pero no fue entrenado ni validado en este checkpoint, por lo que su comportamiento no forma parte del contrato de decision.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo agente o razonamiento multi-paso: no disponible como capacidad propia; el modelo esta pensado como componente de decision dentro de un pipeline mayor.
- Modo "thinking": el prompt de ejemplo incluye un canal `thought` vacio en la plantilla, pero no se documenta razonamiento explicito en la salida.

## Casos de uso

- Deteccion de fraude y phishing: el modelo recibe el texto del mensaje sospechoso como evidencia y un criterio del tipo "que intenta obtener este mensaje", con opciones como "datos de tarjeta", "callback de soporte" o "nada, es un aviso rutinario". La probabilidad normalizada permite fijar umbrales y derivar automaticamente a revision humana. El conjunto de evaluacion de fraude documentado tiene 59 casos y 295 preguntas.
- Compactacion de contexto en agentes: dado un historial largo y un criterio de retencion, el modelo decide que elementos conservar, descartar o resumir. El autor reporta 0,8902 de AUROC en el test sellado de compactacion para este checkpoint.
- Filtrado de texto generado de baja calidad ("anti-slop"): clasificar si un texto cumple un criterio de calidad editorial, con opciones mutuamente excluyentes evaluadas mediante logprobs en lugar de texto generado.
- Barreras de seguridad en produccion: comprobaciones de politica antes de ejecutar una accion, con preguntas Si/No (`noul`) que devuelven una probabilidad calibrada en lugar de una respuesta en lenguaje natural.
- Enrutado de peticiones en un sistema multi-modelo: decidir a que subsistema o cola debe ir una entrada, aprovechando que la salida es una letra entre K opciones y la decision es reproducible a temperatura 0.
- Triaje de tickets y correos de soporte: multiples preguntas por caso (categoria, urgencia, requiere respuesta humana) resueltas como peticiones independientes con el mismo estado.
- Auditoria y registro de decisiones: al no emitir texto libre y devolver una distribucion restringida, es posible almacenar la probabilidad asociada a cada decision y reconstruir por que se tomo, algo relevante en entornos regulados.
- Evaluacion de agentes: usar el modelo como juez de opcion multiple sobre trazas de agente, con la ventaja de que la respuesta se lee de la distribucion y no de una generacion susceptible de formato incorrecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos numericos publicados son la precision de entrenamiento, una comparacion interna de AUROC y las mediciones de latencia y throughput del servicio.

| Metrica de entrenamiento | Valor |
|---|---|
| Precision en epoca 1 | 0,888 |
| Precision en epoca 2 | 0,936 |
| Precision en epoca 3 | 0,968 |
| AUROC en test sellado de compactacion (este modelo) | 0,8902 |
| AUROC en test sellado de compactacion (cabeza de producto escalar sobre estados congelados) | 0,837 (mejor epoca) |
| Ejemplos de entrenamiento | 3.632 |

Rendimiento de servicio, medido en 2 x NVIDIA H20-3e con tensor parallelism 2, sobre la suite de deteccion de fraude (59 casos, 295 preguntas, todos los splits):

| Metrica | Valor |
|---|---|
| Meseta de throughput | 596-684 req/s entre concurrencia 64 y 512 |
| Pico | 683,9 req/s a concurrencia 64 |
| Throughput a concurrencia 256 | 668,8 req/s, p50 147 ms, p95 224 ms |
| Memoria por GPU | 129.429 MiB |

Latencia en barrido unico, con una mediana de 201 tokens de entrada por caso:

| Concurrencia | req/s | p50 | p95 | p99 |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 82,6 | 12 ms | 14 ms | 15 ms |
| 4 | 161,7 | 25 ms | 28 ms | 30 ms |
| 16 | 405,2 | 38 ms | 51 ms | 54 ms |
| 64 | 683,9 | 85 ms | 104 ms | 270 ms |
| 256 | 668,8 | 147 ms | 224 ms | 265 ms |
| 512 | 659,5 | 135 ms | 169 ms | 196 ms |

El autor indica que se ejecutaron 29 suites de calidad contra este checkpoint, mas variantes con el orden de las opciones invertido en 13 de ellas, pero no se detallan los resultados numericos de esas suites en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en bfloat16: los pesos ocupan 48,1 GiB (51.612.009.332 bytes), por lo que se necesita al menos una GPU de 80 GB para servirlos sin cuantizar. A esa cifra hay que sumar la cache KV, cuyo tamano depende de la longitud de contexto y del numero de cabezas, dato no disponible en la informacion proporcionada.
- Medicion real reportada: en 2 x NVIDIA H20-3e con tensor parallelism 2 el consumo fue de 129.429 MiB por GPU.
- GPUs recomendadas: H100 80 GB o A100 80 GB en tensor parallelism 1; configuraciones multi-GPU tipo 2 x H20-3e con TP2 para el throughput documentado.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en tarjetas de 48 GB en bfloat16. No se documentan pesos cuantizados oficiales (GGUF, AWQ, GPTQ), por lo que no se puede confirmar su viabilidad en hardware de consumo.
- Opciones de despliegue: vLLM es la via soportada explicitamente (`vllm serve shisa-ai/shisa-de-1`). Al ser un modelo de transformers, tambien puede cargarse con la libreria `transformers`. No se documentan integraciones con llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: con 2 x H20-3e y TP2, 12 ms de p50 y 82,6 req/s con concurrencia 1, hasta 683,9 req/s de pico con concurrencia 64 (p50 85 ms). El modelo es de 3,8B parametros activos, lo que explica la latencia baja por peticion.
- Nota de servicio: el patron de uso es una peticion por pregunta con `max_tokens=1` y lectura de `logprobs`, de modo que la longitud de salida es siempre de un token y la carga se reparte mejor entre preguntas independientes que dentro de una misma generacion.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria en la informacion proporcionada. La unica comparacion documentada es contra el modelo base y contra una cabeza alternativa entrenada por el propio autor.

| Modelo | Parametros | Contexto | Comportamiento | Licencia |
|---|---|---|---|---|
| shisa-ai/shisa-de-1 | 25,2B totales / 3,8B activos | 256K | Decision por lectura de logits restringidos a letras de opcion | Apache-2.0 |
| google/gemma-4-26B-A4B-it | 25,2B totales / 3,8B activos | 256K | Modelo instructivo general, genera texto libre | No disponible en la informacion proporcionada |
| Cabeza de producto escalar sobre estados congelados (entrenada por el autor) | No disponible | No aplica | Clasificacion, 0,837 AUROC en compactacion frente a 0,8902 | No disponible |

Comparativas con otros motores de decision o clasificadores de la misma categoria: no disponible.

## Limitaciones y advertencias

- El modelo no genera texto de respuesta. `choices[0].text` es solo el token muestreado y se ofrece para depuracion; el contrato de uso lee la distribucion, no la muestra. Fuera de ese contrato, el comportamiento no esta garantizado.
- Los tokens fuera de la lista de opciones se descartan aunque superen en probabilidad a una opcion valida. En el ejemplo del autor, el token `D` aparece con logprob -7,3806 pese a que solo hay tres opciones validas (A, B, C).
- Cada letra de opcion debe ser un unico token y `prompt + letra` debe tokenizarse como los tokens del prompt mas exactamente el token de esa letra. Si una letra no aparece en `top_logprobs`, hay que repetir la peticion con `prompt_logprobs: 0` y la letra anexada al prompt, leyendo la ultima entrada.
- Entrenamiento con solo 3.632 ejemplos: el ajuste es estrecho y esta orientado a cuatro dominios concretos (compactacion, fraude, anti-slop, seguridad). El comportamiento fuera de esos dominios no esta documentado.
- Idiomas: solo ingles y japones declarados. No hay soporte documentado de castellano, lo que limita su uso directo en produccion en Espana sin evaluacion previa.
- Vision: el codificador de vision esta en los pesos pero no fue entrenado; no hay garantia de que sus salidas sean utilizables ni de que el modelo acepte entradas de imagen correctamente.
- Riesgo de alucinacion: el modo de lectura restringido reduce el riesgo de inventar formato, pero la eleccion entre opciones sigue dependiendo de la evidencia proporcionada; el autor senala que incluso clasificadores mucho mas pequenos rinden bien en muchas tareas de decision, por lo que la ventaja de un modelo de este tamano debe justificarse por caso de uso.
- Contexto: aunque la arquitectura admite 256K tokens, no se documenta evaluacion de recuperacion a longitudes largas.
- Licencia Apache-2.0, permisiva para uso comercial, pero el modelo base es de Google y el usuario debe verificar las condiciones aplicables al modelo base y a los datos de entrenamiento.
- Trazabilidad de versiones: el repositorio se creo y actualizo el 21 de septiembre de 2026 segun los metadatos de HuggingFace. Conviene fijar la revision exacta del commit en produccion, ya que el modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha y no hay historial de versiones publicado.
- Rendimiento medido en hardware concreto (2 x H20-3e, TP2) y sobre una suite especifica de 59 casos y 295 preguntas; extrapolar esas cifras a otros entornos o a otras distribuciones de entrada no es valido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shisa-ai/shisa-de-1
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Resultados de la busqueda web: los resultados devueltos no guardan relacion con el modelo (paginas institucionales de la United Arab Emirates University). No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
