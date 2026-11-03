# Sizhe-Chen/Qwen3.6-27B-Instruct-SecPO-8Bit

## Resumen

Qwen3.6-27B-Instruct-SecPO-8Bit es una cuantización INT8 de posentrenamiento del modelo multimodal Sizhe-Chen/Qwen3.6-27B-Instruct-SecPO, un ajuste fino de Qwen/Qwen3.6-27B orientado especificamente a la defensa frente a ataques de prompt injection. El modelo original aplica Secure Preference Optimization (SecPO), una variante de DPO en la que el lado de referencia puntua las respuestas sobre la entrada limpia emparejada en lugar de sobre la entrada potencialmente inyectada, lo que concentra el aprendizaje en los pares donde el modelo sin defensa se ve mas influido por la inyeccion. El checkpoint que nos ocupa no introduce entrenamiento adicional: es una conversion bitsandbytes LLM.int8() del checkpoint BF16 fusionado, con el codificador visual, los embeddings de tokens y el `lm_head` retenidos en BF16.

La arquitectura es `Qwen3_5ForConditionalGeneration`, un modelo causal de lenguaje de 27B parametros (27.356.728.560 segun los pesos safetensors) con un codificador visual para entrada image-text-to-text. El repositorio ocupa 30,38 GB repartidos en 8 shards de safetensors con estado de cuantizacion, frente a los 54,71 GB del checkpoint fuente. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

Su relevancia practica esta en el eje seguridad-despliegue: ofrece un modelo defensivamente entrenado frente a instrucciones maliciosas embebidas en datos no confiables, en un formato que cabe en una GPU de consumo de 32 GB. Conviene subrayar que las tablas de benchmarks del modelo fuente describen el checkpoint BF16, y las de Q8_0 describen una conversion independiente a llama.cpp; el checkpoint INT8 de bitsandbytes aqui publicado solo ha pasado pruebas de humo de inferencia, no la evaluacion de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (modelo causal de lenguaje con codificador visual) |
| Parametros totales | 27.356.728.560 (~27,36B) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (bitsandbytes LLM.int8()) en capas lineales soportadas del modelo de lenguaje; BF16 retenido en codificador visual, embeddings de tokens, `lm_head` y modulos no lineales/no soportados |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | Safetensors fragmentado (8 shards) con estado de bitsandbytes y `quantization_config` en `config.json` |

## Arquitectura y entrenamiento

El modelo fuente es un transformer causal multimodal de la familia Qwen3.5/3.6: un decodificador de lenguaje de 27B parametros acoplado a un codificador visual, con pipeline `image-text-to-text`. El checkpoint publicado es una cuantizacion de posentrenamiento: las capas lineales soportadas del modelo de lenguaje usan LLM.int8() de bitsandbytes, mientras que el codificador visual, los embeddings de tokens, el `lm_head` y los modulos no lineales conservan la precision del origen. No hubo calibracion, ajuste fino adicional ni fusion de adaptadores. Antes de cuantizar se normalizaron los 333 nombres de tensores de vision de `model.language_model.visual.*` al espacio canonico `model.visual.*`, sin alterar los valores numericos, y se fijo `text_config.mtp_num_hidden_layers` de 1 a 0 porque el checkpoint fuente no contiene tensores MTP; tras la normalizacion los 1.184 nombres de tensor coinciden con la arquitectura multimodal completa.

El entrenamiento del modelo fuente se basa en SecPO (Secure Preference Optimization), una modificacion del lado de referencia de DPO con `beta=0.1`. La politica puntua las respuestas preferida y rechazada sobre la entrada potencialmente inyectada, mientras que el modelo de referencia congelado las puntua sobre la entrada limpia emparejada; asi se da mas peso a los pares de preferencia en los que el modelo sin defensa resulta mas influido por la inyeccion. El conjunto de entrenamiento son 19.157 pares de preferencia archivados del dataset `Sizhe-Chen/Qwen3.6-27B-Instruct-SecPO-trainset`. Tanto el entrenamiento como la evaluacion del modelo fuente se realizaron con el modo thinking desactivado (`enable_thinking=False`), por lo que las evaluaciones no miden capacidad de razonamiento con thinking activado. El tokenizador, el procesador y la plantilla de chat con rol `input` se preservan del original.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Comprension de imagenes y respuesta en texto (image-text-to-text) mediante el codificador visual.
- Aritmetica basica y respuesta a preguntas factuales (verificado en las pruebas de humo: `391` y `Paris`).
- Extraccion de informacion de datos no confiables manteniendo la tarea fiable: en la prueba de humo con un informe no confiable devuelve `8%`.
- Resistencia a inyecciones por delimitadores en datos no confiables: en la prueba de humo devuelve `ZX-2048` en lugar de seguir la instruccion inyectada.
- Reconocimiento de color en imagen: en la prueba de humo devuelve `Red`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking: el modelo fuente se entrena y evalua con `enable_thinking=False`; no se documenta el comportamiento con thinking activado en este checkpoint.
- Capacidades de audio: no disponible.

## Casos de uso

- Procesamiento de documentos externos en pipelines RAG: el modelo esta entrenado para tratar el contenido recuperado como dato no confiable, de modo que una instruccion maliciosa embebida en un PDF o una pagina web no redirija la tarea del sistema; encaja en flujos donde el texto recuperado se concatena al prompt del usuario.
- Analisis de informes y correos de terceros: extraccion de cifras y conclusiones de documentos que no controla el operador, manteniendo la respuesta ceñida a la pregunta original, tal como se comprobo en la prueba de extraccion de informe no confiable.
- Moderacion y triaje de contenido generado por usuarios: clasificacion de mensajes que pueden contener intentos de manipulacion del modelo, con el modelo como primera capa antes de un sistema de decision.
- Asistentes sobre capturas de pantalla o imagenes de interfaz: el codificador visual en BF16 permite responder preguntas sobre imagenes (por ejemplo, identificar el color de un elemento) sin degradar la parte visual por la cuantizacion.
- Despliegue en una unica GPU de consumo: con 30,38 GB de checkpoint, el modelo cabe en una RTX 5090 de 32 GB, lo que permite montar un entorno de pruebas de robustez frente a prompt injection en estaciones de trabajo sin acceso a A100/H100.
- Evaluacion comparativa de defensas: al ser una cuantizacion del mismo modelo fuente, sirve para medir la degradacion introducida por INT8 en tareas de seguridad, comparando sus salidas con las del checkpoint BF16 en el mismo conjunto de ataques.
- Prototipado de agentes que leen herramientas externas: util para validar el comportamiento del modelo cuando las salidas de una API o un navegador se tratan como no confiables, antes de pasar a una version en BF16 para produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint INT8. La model card indica explicitamente que el checkpoint guardado en bitsandbytes solo ha pasado pruebas de humo de inferencia y no ha recibido la evaluacion de benchmarks del BF16 ni la de Q8_0.

Pruebas de humo registradas (no constituyen benchmarks):

| Comprobacion | INT8 bitsandbytes (este repo) | Q8_0 en Ollama (conversion separada) |
|---|---|---|
| Aritmetica | `391` | `391` |
| QA factual | `Paris` | `Paris` |
| Informe no confiable | `8%` | `8%` |
| Inyeccion por delimitadores | `ZX-2048` | `ZX-2048` |
| Color en imagen | `Red` | no probado |

Validacion del checkpoint guardado: 5/5 comprobaciones superadas tras recargar en un proceso nuevo, sin pesos faltantes, inesperados ni desajustados. Validacion separada en Ollama 0.33.3: 4/4 comprobaciones de texto superadas con una conversion Q8_0 independiente desde el BF16 fuente.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 30,38 GB (28,29 GiB) en disco; en inferencia hay que sumar el estado de cuantizacion de bitsandbytes, las activaciones y la cache KV, por lo que se necesita margen por encima de esos 28,29 GiB.
- GPU recomendadas: el autor valido el checkpoint en una NVIDIA GeForce RTX 5090 de 32 GB. Para produccion con lotes mayores o contexto largo son preferibles A100 80 GB o H100 80 GB.
- GPU de consumo: si, cabe en una RTX 5090 de 32 GB segun la validacion del autor. No hay datos de encaje en GPUs de 24 GB (RTX 4090) en la informacion disponible.
- Opciones de despliegue: transformers 5.16.1 con bitsandbytes 0.50.2, accelerate 1.14.0 y torch 2.14.0 (entorno de validacion). El autor documento tambien una conversion independiente a Q8_0 ejecutada en Ollama 0.33.3. Soporte de vLLM o TGI para este checkpoint INT8 concreto: no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.6-27B-Instruct-SecPO-8Bit (este) | ~27,36B | no disponible | Texto + imagen | apache-2.0 | INT8 bitsandbytes, 30,38 GB, defensa SecPO |
| Sizhe-Chen/Qwen3.6-27B-Instruct-SecPO | ~27B | no disponible | Texto + imagen | apache-2.0 | BF16 fuente, 54,71 GB, mismas capacidades sin cuantizar |
| Sizhe-Chen/Qwen3.6-27B-Thinking-SecOPD | ~27B | no disponible | Texto + imagen | no disponible | Variante entrenada con razonamiento activado |
| Qwen/Qwen3.6-27B | ~27B | no disponible | Texto + imagen | no disponible | Base original sin el ajuste de seguridad SecPO |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada; la unica comparacion documentada son las pruebas de humo frente a la conversion Q8_0.

## Limitaciones y advertencias

- El checkpoint INT8 no ha sido evaluado con benchmarks: las pruebas de humo de 5 comprobaciones no establecen equivalencia con el BF16, robustez de seguridad ni comparacion de rendimiento frente al modelo fuente.
- Las tablas de benchmarks del modelo fuente corresponden al BF16 y las de Q8_0 a una conversion independiente a llama.cpp; no son extrapolables a este checkpoint de bitsandbytes.
- El entrenamiento y la evaluacion del modelo fuente usan `enable_thinking=False`; no se mide la capacidad de razonamiento con thinking activado. Existe una variante separada (Thinking-SecOPD) para ese caso.
- Idioma declarado unicamente ingles: el rendimiento en castellano u otros idiomas no esta documentado.
- Longitud de contexto no disponible: no se puede planificar el uso con documentos largos sin verificacion empirica.
- Riesgo de alucinacion inherente a un modelo de 27B: las pruebas de humo no lo cuantifican.
- Sesgos conocidos: no documentados en la informacion disponible.
- La defensa SecPO reduce la influencia de inyecciones, pero las pruebas realizadas son de humo y no constituyen una garantia de robustez frente a ataques adversarios dirigidos; no debe ser la unica capa de seguridad en produccion.
- Es un checkpoint de precision mixta: parte de los tensores y operaciones siguen en BF16, por lo que el ahorro de memoria no es el de una cuantizacion completa.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni responsabilidad sobre el comportamiento del modelo.
- Las descargas y likes registrados son muy bajos (3 descargas, 0 likes), lo que implica poca validacion comunitaria independiente.
- Requiere versiones concretas del stack (transformers 5.16.1, bitsandbytes 0.50.2, torch 2.14.0); versiones distintas pueden no cargar el estado de cuantizacion correctamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sizhe-Chen/Qwen3.6-27B-Instruct-SecPO-8Bit
- Modelo fuente BF16: https://huggingface.co/Sizhe-Chen/Qwen3.6-27B-Instruct-SecPO
- Variante con razonamiento: https://huggingface.co/Sizhe-Chen/Qwen3.6-27B-Thinking-SecOPD
- Dataset de entrenamiento: https://huggingface.co/datasets/Sizhe-Chen/Qwen3.6-27B-Instruct-SecPO-trainset
- Paper SecPO: https://arxiv.org/abs/2610.41998
- Codigo oficial: https://github.com/Sizhe-Chen/SecPO
- Resultados de validacion: https://huggingface.co/Sizhe-Chen/Qwen3.6-27B-Instruct-SecPO-8Bit/blob/main/validation_results.json
- Manifiesto de normalizacion: https://huggingface.co/Sizhe-Chen/Qwen3.6-27B-Instruct-SecPO-8Bit/blob/main/normalization_manifest.json
- Verificacion de artefactos: https://huggingface.co/Sizhe-Chen/Qwen3.6-27B-Instruct-SecPO-8Bit/blob/main/artifact_verification.json
- Papers adicionales citados en los tags: https://arxiv.org/abs/2403.06833, https://arxiv.org/abs/2510.09023, https://arxiv.org/abs/2312.02119, https://arxiv.org/abs/2603.13026, https://arxiv.org/abs/2406.13352, https://arxiv.org/abs/2602.03117, https://arxiv.org/abs/2605.04808
