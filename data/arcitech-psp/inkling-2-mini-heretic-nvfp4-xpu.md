# arcitech-psp/Inkling-2-Mini-Heretic-NVFP4-XPU

## Resumen

Inkling-2-Mini-Heretic-NVFP4-XPU es una conversión de cuantización del fine-tune BF16 de DavidAU sobre el modelo base Inkling 2 Mini de Thinking Machines, reempaquetado en el formato de checkpoint nativo NVFP4/MXFP8 del modelo original para su ejecución en hardware Intel Arc. El objetivo es reducir los 52,8 GB en BF16 del fine-tune a 20,2 GB manteniendo intacta la disposición de expertos cuantizados que espera el stack de servicio: expertos NVFP4 en las capas 0-19 y MXFP8 en las capas 20-23. El resultado es un modelo de 26.388.646.440 parámetros que cabe en una única Intel Arc Pro B70 de 32 GB.

Se trata de un modelo abliterado ("heretic"), derivado de un fine-tune que reduce drásticamente las negativas del modelo original, orientado a generación de texto e imagen-texto con capacidades conversacionales. La relevancia actual es doble: por un lado demuestra la viabilidad de servir un modelo de 26B en GPU de consumo profesional Intel con cuantización de 4 y 8 bits por bloques; por otro, documenta un flujo de conversión reproducible (herramienta `inkconv` en Rust) entre checkpoints de distinto dtype preservando escalas por experto.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y solo se ha validado en una Arc Pro B70 bajo Linux. La licencia es Apache-2.0, heredada del repositorio de DavidAU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con expertos (MoE) y decodificación especulativa DSpark; layout inkling2_loop / inkling2 |
| Parametros totales | 26.388.646.440 |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens por chat en modo multi (4 chats); 524.288 tokens en modo single (1 chat) |
| Tipos de cuantizacion | NVFP4 (expertos capas 0-19), MXFP8 (expertos capas 20-23), BF16 en tensores restantes; 8-bit en metadatos |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (model-00001-of-00001.safetensors de 19,5 GB + mtp.safetensors del drafter) |

## Arquitectura y entrenamiento

El modelo subyacente es Inkling 2 Mini de Thinking Machines, una arquitectura tipo Mixture of Experts con atención estándar y un drafter de decodificación especulativa denominado DSpark, que se incluye como `mtp.safetensors` byte-idéntico al original. Los expertos se distribuyen en 24 capas: las capas 0-19 emplean cuantización NVFP4 (4 bits con escala por bloque) y las capas 20-23 MXFP8 (8 bits con escala por bloque), un esquema mixto que reduce el peso total manteniendo mayor precisión en las capas superiores. El resto de tensores (atención, embeddings, normalizaciones) se copian del fine-tune en el dtype del checkpoint original.

El fine-tune de DavidAU es una variante "abliterated" (heretic) que reduce los rechazos del modelo base, y a su vez deriva de `yanauto/Inkling-2-Mini-heretic-full` para la abliteración. La conversión a NVFP4/MXFP8 se realizó con la herramienta `inkconv` (Rust) del repositorio inkling-arc, redondeando cada experto del fine-tune sobre las escalas propias del checkpoint original (nearest code). Según el registro de conversión, se modificaron 910.938.209 códigos NVFP4, se ampliaron 14.504.834 bloques de escala, se recalcularon 101 factores por experto y se cambiaron 18.405 códigos MXFP8 sin reescalar bloques; 1.068 tensores se copiaron directamente del fine-tune. La conversión tardó 155 s y no es sin pérdidas respecto al BF16 de DavidAU para los pesos modificados.

## Capacidades

- Generación de texto conversacional multi-turno con contexto largo (hasta 131.072 tokens por chat en modo multi, 524.288 en modo single).
- Razonamiento e instrucciones: la evaluación de 20 casos del autor cubre instrucciones, matemáticas, razonamiento y llamadas a herramientas con 20/20.
- Generación de código: el conjunto de evaluación incluye código Rust compilado y ejecutado correctamente.
- Tool calling / function calling: validado en la evaluación del autor.
- Procesamiento de imagen-texto (pipeline image-text-to-text): el modelo acepta entradas de imagen según el pipeline declarado.
- Recuperación de información en contexto largo: needle a 31.629 tokens encontrado en 9,4 s y a 107.579 tokens en 32,6 s (extremo a extremo).
- Decodificación especulativa con drafter DSpark: 72% de aceptación del primer token de borrador y 2,46 tokens aceptados por paso de 7.
- Capacidades multilingües limitadas al inglés según la model card.
- Modo "uncensored"/abliterated: reduce los rechazos respecto al modelo original.

## Casos de uso

- Asistente conversacional de contexto largo: con 131.072 tokens por chat en modo multi, puede mantener conversaciones multi-turno con documentos extensos adjuntos sin truncar el historial, adecuado para atención al cliente o soporte técnico documental.
- Análisis de documentación técnica y código: la ventana de 524.288 tokens en modo single permite ingerir repositorios o manuales completos y responder preguntas sobre ellos; la evaluación con needles a 107K tokens respalda esta aplicación.
- Generación y revisión de código en pipelines: el soporte de tool calling y la validación con código Rust compilado y ejecutado lo hacen apto para integrarse en flujos de CI/CD que requieran generación de parches o explicación de errores.
- Procesamiento de imagen-texto: al declarar pipeline image-text-to-text, puede emplearse en tareas de descripción de imágenes, extracción de información de capturas o documentos escaneados combinados con texto.
- Despliegue en infraestructura Intel Arc: para organizaciones con GPUs Arc Pro B70, este checkpoint permite servir un modelo de 26B en una sola tarjeta de 32 GB con vLLM-XPU, evitando dependencia de NVIDIA.
- Evaluación de modelos abliterados: útil para investigadores que estudien el efecto de la abliteración en la calidad y seguridad de las respuestas, comparando este checkpoint con el modelo original de Thinking Machines.
- Prototipado de agentes con razonamiento multi-paso: la combinación de tool calling, contexto largo y decodificación especulativa permite construir agentes que encadenen llamadas a herramientas sobre documentos extensos con latencia contenida (85 tok/s en un chat).

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, medidos en una Intel Arc Pro B70 con inkling-arc en modo `serve multi` (24 de noviembre de 2026):

| Prueba | Resultado |
|---|---|
| Evaluación de 20 casos (instrucciones, matemáticas, razonamiento, tool calls, código Rust compilado y ejecutado, imagen, 2 needles) | 20/20 |
| Needle a 31.629 tokens, extremo a extremo | encontrado, 9,4 s |
| Needle a 107.579 tokens, extremo a extremo | encontrado, 32,6 s |
| Pesos en memoria de GPU | 18,13 GiB |
| Pool de KV cache | 329.808 tokens |
| Drafter: primer token de borrador aceptado | 72% |
| Drafter: tokens aceptados por paso | 2,46 de 7 |
| Velocidad de generación, 1 chat | 85 tok/s |
| Velocidad de generación, 4 chats (total) | 179 tok/s |
| Lectura de prompt a 32K | 4.137 tok/s |
| Lectura de prompt a 96K | 3.515 tok/s |

Las cifras de velocidad se midieron con el checkpoint original de Thinking Machines (misma arquitectura y kernels), no con este checkpoint. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 18,13 GiB de pesos en memoria de GPU según medición del autor; el pool de KV cache ocupa el resto hasta los 32 GB de la tarjeta.
- GPU recomendada: Intel Arc Pro B70 de 32 GB (única GPU validada). No se ha probado en otras GPUs.
- No cabe en GPUs de consumo convencionales por el tamaño del checkpoint (20,2 GB en disco, 18,13 GiB en VRAM) y por requerir kernels específicos para el layout NVFP4/MXFP8.
- Despliegue: vLLM-XPU mediante el repositorio `inkling-arc` (comandos `./inkling-arc install`, `serve multi`, `serve single`, `pack`). El servidor expone una API compatible con OpenAI en `http://127.0.0.1:8000/v1`.
- Se requiere construir "packs" específicos del kernel en la propia GPU (`./inkling-arc pack`, 76 s en la B70); no se distribuyen en el repositorio por ocupar 15 GB.
- Latencia y throughput: 85 tok/s en un chat y 179 tok/s agregados en cuatro chats; lectura de prompt a 4.137 tok/s (32K) y 3.515 tok/s (96K).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-Heretic-NVFP4-XPU (este) | 26,4B | 131.072 (multi) / 524.288 (single) | NVFP4 + MXFP8 | Apache-2.0 | Hugging Face, requiere inkling-arc |
| thinkingmachines/Inkling-2-Mini | no disponible | no disponible | BF16 original | Apache-2.0 | Hugging Face |
| DavidAU/Inkling-2-Mini-26B-Heretic-Uncensored-Turbo-Brilliance-50X-V2-AGI | 26,4B (implícito) | no disponible | BF16 (52,8 GB) | Apache-2.0 | Hugging Face |
| yanauto/Inkling-2-Mini-heretic-full | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo abliterado: reduce deliberadamente los rechazos, por lo que puede generar contenido que el modelo original bloquearía; el autor deja su uso a criterio del usuario.
- Solo validado en una Intel Arc Pro B70 con Linux; no se ha probado en otras GPUs ni plataformas.
- Requiere kernels y packs específicos del hardware (inkling-arc); no es desplegable directamente con llama.cpp, Ollama o TGI.
- La conversión a NVFP4/MXFP8 no es sin pérdidas respecto al BF16 de DavidAU para los pesos modificados (910.938.209 códigos NVFP4 alterados).
- Idiomas: solo inglés según la model card.
- Riesgo de alucinación inherente a modelos de lenguaje; no se documentan evaluaciones de sesgo ni de robustez más allá de los 20 casos del autor.
- El repositorio presenta 0 descargas y 0 likes, sin validación independiente de la comunidad.
- Licencia Apache-2.0 permite uso comercial, pero las implicaciones del carácter abliterado deben evaluarse según el contexto de despliegue.
- Los packs de kernels (15 GB) no se distribuyen y deben generarse en la GPU destino.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arcitech-psp/Inkling-2-Mini-Heretic-NVFP4-XPU
- Modelo base (fine-tune de DavidAU): https://huggingface.co/DavidAU/Inkling-2-Mini-26B-Heretic-Uncensored-Turbo-Brilliance-50X-V2-AGI
- Modelo original de Thinking Machines: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio de abliteración: https://huggingface.co/yanauto/Inkling-2-Mini-heretic-full
- Repositorio del motor de inferencia: https://github.com/arcitech-psp/inkling-arc
