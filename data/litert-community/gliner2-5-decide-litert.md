# litert-community/GLiNER2.5-Decide-LiteRT

## Resumen

GLiNER2.5-Decide-LiteRT es la conversión a formato LiteRT (TFLite) del modelo fastino/GLiNER2.5-Decide, un clasificador de texto zero-shot construido sobre un encoder DeBERTa-v3-large. El modelo recibe en tiempo de llamada un texto y un conjunto arbitrario de etiquetas organizadas por tareas (intención, enrutamiento, sentimiento, puertas sí/no, etiquetas multietiqueta) y devuelve una decisión por tarea en un único forward pass. Esta variante, publicada por la comunidad litert-community, está pensada para ejecutarse en GPU de teléfonos Android mediante LiteRT Torch.

La relevancia de esta ficha radica en que traslada un clasificador de 435 millones de parámetros al dispositivo, sin depender de la nube. La configuración validada por el autor es LiteRT 2.2.0 con computación GPU FP32 explícita sobre un Samsung Galaxy S26 (SM-S942Q, SM8850, Android 16). En esa configuración, las decisiones coinciden con el resultado oficial fp32 de gliner2 en los 126 pares (petición, ventana) probados en Android, y en las 361 peticiones de prueba en CPU de escritorio.

El repositorio incluye tres ventanas de tokens codificados (128, 256 y 512), variantes para NPU de Qualcomm y para GPU FP16 con acumulación FP32, además de los grafos de referencia en float32, la tabla de embeddings de palabras, el tokenizador y un runtime anfitrión en Python que reproduce el contrato de entrada y las reglas de decisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa-v3-large con cabeza de clasificación; grafo LiteRT (TFLite) con 1.634 operadores en la variante fp32 |
| Parametros totales | No disponible de forma explícita; la tabla de embeddings de palabras es de 128.011 x 1.024 y el checkpoint base es DeBERTa-v3-large (aproximadamente 435 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de 128, 256 o 512 tokens codificados (una por fichero); el esquema de tareas más el texto deben caber en N tokens, con un máximo de 32 etiquetas en total |
| Tipos de cuantizacion | Pesos float16 con DEQUANTIZE a float32 en las 146 capas FULLY_CONNECTED (ficheros `wfp16`); float32 de referencia; variantes float16 para hardware NPU/GPU FP16 con acumulación FP32 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`.tflite`) para LiteRT; tabla de embeddings en `.bin` (float16 y float32); tokenizador en `tokenizer.json`; JSON de contrato de grafo (`graph_contract_s{128,256,512}.json`) |

## Arquitectura y entrenamiento

El modelo es un encoder DeBERTa-v3-large seguido de una cabeza de clasificación. En esta conversión, el grafo LiteRT contiene únicamente el encoder y la cabeza; el anfitrión realiza la búsqueda de embeddings de palabras antes del grafo y transforma los logits en decisiones después. Las entradas del grafo son `inputs_embeds` con forma [1, N, 1024] float32 (filas de la tabla en los ids de token con padding a la derecha), `attention_mask` [1, N] float32 y `label_routing` [1, 32, N] float32, donde la fila j es un one-hot en la posición del j-ésimo marcador `[L]` de etiqueta y las filas no usadas quedan a cero. La salida `logits` tiene forma [1, 1, 1, 32] float32, un logit por ranura de etiqueta en el orden de la petición.

Los ficheros `wfp16` almacenan los 146 tensores de pesos FULLY_CONNECTED como float16 con una operación DEQUANTIZE a float32 (1.780 operadores), mientras que las activaciones y el resto de constantes permanecen en float32. Los ficheros `fp32` son los mismos grafos con pesos float32 (1.634 operadores). Las variantes `npu` y `fp16hw` modifican los grafos por defecto para hardware float16: 170 pesos FULLY_CONNECTED float16 y 1.874, 1.878 o 1.877 operadores según la ventana (128, 256 o 512). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Clasificación de texto zero-shot con etiquetas definidas en tiempo de llamada, sin reentrenamiento.
- Clasificación por tareas múltiples en un solo forward pass: intención, enrutamiento, sentimiento, puertas sí/no y etiquetas multietiqueta.
- Soporte de hasta 32 etiquetas en total por petición, distribuidas entre las tareas del esquema.
- Etiquetado multietiqueta con umbral de clase configurable (`multi_label` y `cls_threshold` en el esquema de tareas).
- Tres ventanas de contexto (128, 256 y 512 tokens codificados) para ajustar el coste según la longitud de la petición.
- Ejecución en GPU de Android mediante LiteRT, con variantes para NPU de Qualcomm y GPU FP16 con acumulación FP32.
- Capacidades multilingües: solo inglés.
- No se documentan tool calling, function calling, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Enrutamiento de intenciones en asistentes móviles: el modelo recibe el texto del usuario y un conjunto de etiquetas de intención, y devuelve la intención dominante junto con la urgencia y el sentimiento en una sola pasada, lo que permite decidir el flujo de la aplicación sin llamadas a red.
- Triaje de tickets de soporte en el dispositivo: con etiquetas como `refund_request`, `replacement_request`, `order_status` o `technical_support`, el modelo clasifica el ticket y activa la cola adecuada; la ventana de 512 tokens cubre descripciones largas de incidencias.
- Moderación y etiquetado de contenido en local: clasificación multietiqueta con umbral configurable para marcar temas sensibles (envío, calidad de producto, facturación, batería) antes de que el texto salga del teléfono.
- Puertas de decisión sí/no en pipelines de agentes: el modelo actúa como clasificador binario para decidir si una consulta requiere escalado a un humano, si cumple una política o si debe pasar a un segundo modelo.
- Análisis de sentimiento y urgencia en atención al cliente: combinación de tareas `sentiment` y `urgency` en la misma petición, útil para priorizar respuestas en aplicaciones de mensajería con requisitos de latencia estrictos.
- Clasificación offline en dispositivos sin conectividad: al ejecutarse como grafo TFLite en GPU o NPU, permite etiquetar texto en entornos sin red, con la ventana de 128 tokens como opción de menor coste para peticiones cortas.
- Validación de esquemas de clasificación en I+D: el runtime anfitrión en Python y el fichero `example.json` con el resultado oficial y los logits permiten comparar nuevas conversiones contra la referencia fp32 antes de desplegar en Android.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor únicamente reporta paridad de decisiones con el modelo oficial: coincidencia en los 126 pares (petición, ventana) probados en el Samsung Galaxy S26 con GPU FP32 y en las 361 peticiones de prueba en CPU de escritorio con LiteRT.

| Prueba de paridad | Entorno | Resultado |
|---|---|---|
| 126 pares (petición, ventana) | Samsung Galaxy S26 (SM-S942Q, SM8850, Android 16), LiteRT 2.2.0, GPU FP32 | Decisiones idénticas al resultado oficial gliner2 fp32 |
| 361 peticiones | LiteRT CPU de escritorio, grafo s256 | Decisiones idénticas al resultado oficial gliner2 fp32 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo está orientado a ejecución en dispositivo, no a GPU de servidor.
- Tamaño de los ficheros: 660,4 MB (s128 `wfp16`), 710,7 MB (s256 `wfp16`) y 811,4 MB (s512 `wfp16`); las referencias fp32 ocupan 1.268,5 MB, 1.318,8 MB y 1.419,5 MB respectivamente.
- Conjunto mínimo por defecto: los tres grafos por defecto, la tabla de embeddings float16 y `tokenizer.json` suman 2.452.978.688 bytes.
- Tabla de embeddings: `word_embeddings_fp16.bin` de 262.166.528 bytes ([128.011, 1024] float16) o `word_embeddings_fp32.bin` de 524.333.056 bytes.
- GPU recomendadas: la única configuración validada es la GPU de un Samsung Galaxy S26 (SM-S942Q, SM8850) con LiteRT 2.2.0 y FP32 explícito; otras familias de GPU Android no han sido validadas por el autor.
- Aceleradores alternativos: variantes `npu` para NPU de Qualcomm y `fp16hw` para GPU FP16 con acumulación FP32.
- Despliegue: LiteRT (`ai_edge_litert.compiled_model` con `CompiledModel`, `CpuOptions`, `HardwareAccelerator` y `Options`), runtime anfitrión en Python 3.12 con `requirements-lock.txt`, y el paquete `gliner2` 2.0.0 para construir las entradas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLiNER2.5-Decide-LiteRT | DeBERTa-v3-large (aprox. 435 M) | 128, 256 o 512 tokens codificados | TFLite (LiteRT) | Apache 2.0 | Hugging Face (litert-community) |
| fastino/GLiNER2.5-Decide | DeBERTa-v3-large (aprox. 435 M) | No disponible | Pesos del checkpoint original | No disponible en la información proporcionada | Hugging Face (fastino); modelo base de esta conversión |
| Alternativas de clasificación zero-shot de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Solo admite inglés; no se documenta soporte de otros idiomas.
- El esquema de tareas más el texto deben caber en la ventana elegida (128, 256 o 512 tokens) y el total de etiquetas no puede superar 32.
- La validación en Android se limita a un único dispositivo (Samsung Galaxy S26, SM-S942Q, SM8850, Android 16) con LiteRT 2.2.0 y GPU FP32; otras familias de GPU Android no han sido validadas y pueden producir decisiones distintas.
- El anfitrión debe replicar exactamente el contrato de entrada (embeddings, máscara de atención y enrutamiento de etiquetas) y las reglas de decisión descritas en `HOST_CONTRACT.md`; cualquier desviación invalida la paridad con el modelo oficial.
- Riesgo de alucinación y sesgos: no se documentan en la información proporcionada; al ser un clasificador con etiquetas cerradas, el riesgo se manifiesta como asignaciones erróneas de etiqueta más que como texto generado.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del checkpoint base fastino/GLiNER2.5-Decide, cuya licencia no se detalla en la información disponible.
- El repositorio ocupa 9,2 GB, aunque el conjunto mínimo de ejecución es de aproximadamente 2,45 GB; conviene descargar solo los ficheros necesarios para el dispositivo objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/GLiNER2.5-Decide-LiteRT
- Modelo base: https://huggingface.co/fastino/GLiNER2.5-Decide
- Paper de referencia (arXiv:2507.18546): https://arxiv.org/abs/2507.18546
