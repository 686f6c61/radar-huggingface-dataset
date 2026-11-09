# DavidAU/gemma-3-12b-it-vl-GLM-4.7-Flash-Heretic-Uncensored-Thinking

## Resumen

Gemma-3-12b-it-vl-GLM-4.7-Flash-Heretic-Uncensored-Thinking es un ajuste fino (fine-tune) del modelo multimodal Gemma 3 de 12B de Google, publicado por el usuario DavidAU en Hugging Face. Se construye sobre `DreamFast/gemma-3-12b-it-heretic`, una variante ya "abliterada" (con los mecanismos de rechazo suprimidos mediante la tecnica Heretic), y se entrena con el dataset de razonamiento `TeichAI/glm-4.7-2000x` empleando la libreria Unsloth sobre hardware local. El resultado es un modelo image-text-to-text de 12.187 millones de parametros que combina vision, contexto de 128k tokens y un modo de razonamiento ("thinking") activable.

El objetivo declarado del autor es ofrecer un modelo sin censura ("no nanny") orientado a escritura creativa, ficcion, generacion de tramas y roleplay, con razonamiento compacto pero detallado que, segun la model card, tambien mejora el procesamiento de imagenes y el rendimiento general. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

Es relevante ahora porque ejemplifica la practica de "de-censura" via abliteration (Heretic) combinada con destilacion de razonamiento de un modelo mayor (GLM 4.7 Flash), un patron cada vez mas comun en la comunidad open source para obtener modelos sin restricciones de rechazo con perdida minima de capacidades. El autor reporta una divergencia KL de 0.0826 respecto al Gemma 3 original y solo 7 rechazos sobre 100 frente a 98 del modelo base de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3), vision + texto |
| Parametros totales | 12.187.325.040 (~12,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128k tokens |
| Tipos de cuantizacion | no disponible en la informacion (pesos en bfloat16; repo de 24,4 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Gemma 3 de 12B, un transformer multimodal que procesa texto e imagenes (pipeline image-text-to-text). Sobre la base `DreamFast/gemma-3-12b-it-heretic` —ya sometida a abliteration con la herramienta Heretic para eliminar los rechazos— se aplica un fine-tune con el dataset `TeichAI/glm-4.7-2000x`, que contiene trazas de razonamiento destiladas de GLM 4.7 Flash. El entrenamiento se realizo con Unsloth en hardware local bajo Linux.

La innovacion principal es la incorporacion de un modo de razonamiento ("thinking") que, segun el autor, afecta a la operacion general del modelo, la generacion de salida, el procesamiento de imagenes y los benchmarks. El razonamiento se activa automaticamente en la mayoria de casos por el propio fine-tune, pero puede forzarse mediante el prefijo "think deeply:", un system prompt especifico o el template JINJA `chat-template-thinking.jinja`. El autor indica que el razonamiento es estable frente a temperatura (rango recomendado de 0.1 a 2.5) y que no requiere system prompt ni template para generarse. No se especifican en la informacion el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF/DPO adicional.

## Capacidades

- Generacion de texto y escritura creativa: ficcion, generacion de tramas y subtramas, continuacion de escenas, storytelling y prosa vivida en todos los generos (ciencia ficcion, romance, etc.).
- Razonamiento explicito ("thinking"): trazas de pensamiento destiladas de GLM 4.7 Flash, con activacion automatica o forzada.
- Procesamiento de imagenes (image-text-to-text): el razonamiento tambien mejora, segun el autor, el procesamiento visual.
- Conversacion multi-turno y roleplay (mencion explicita de uso en SillyTavern, KoboldCpp y text-generation-webui).
- Contenido sin censura: rechazos reducidos a 7/100 frente a 98/100 del Gemma 3 original; puede generar contenido explicito, vulgar o de terror, aunque en algunos casos requiere direccion explicita (por ejemplo, indicar el vocabulario o el tono deseado).
- Soporte de system prompts que modulan el razonamiento y la generacion.
- Multilingue: limitado al ingles segun la model card.
- Tool calling / function calling: no disponible en la informacion.
- Capacidades de agente multi-step: no disponible en la informacion.

## Casos de uso

- Escritura de ficcion y novelas: el modelo genera tramas, subtramas y escenas completas en multiples generos; su fine-tune esta especificamente orientado a prosa vivida y continuacion de escenas, lo que lo hace adecuado para borradores largos con coherencia narrativa gracias al contexto de 128k tokens.
- Roleplay y personajes conversacionales: con el ajuste de `Smoothing_factor` a 1.5 en KoboldCpp, text-generation-webui o SillyTavern, puede mantener conversaciones de personaje multi-turno sin rechazos, util para entretenimiento y prototipado de agentes de personaje.
- Generacion de contenido creativo sin restricciones: guiones de terror, dialogos con lenguaje explicito o narrativa adulta; el autor indica que basta con dirigir el tono (por ejemplo, listar el vocabulario a emplear) para alcanzar el nivel grafico deseado.
- Asistencia a guionistas y autores: generacion de variantes de escena, subtramas alternativas o continuaciones a partir de un manuscrito extenso, aprovechando la ventana de 128k tokens para mantener contexto de obra completa.
- Analisis y narracion de imagenes: al ser image-text-to-text, puede describir imagenes o incorporarlas a una narracion; el modo de razonamiento mejora, segun el autor, el procesamiento visual.
- Prototipado de aplicaciones de escritura asistida: integrable via transformers y text-generation-inference (tags `endpoints_compatible`), util para construir demos de generacion creativa con pesos Apache 2.0.
- Investigacion sobre abliteration y destilacion de razonamiento: sirve como caso de estudio de como un fine-tune con dataset de razonamiento afecta a benchmarks y a la tasa de rechazos con una divergencia KL baja (0.0826).

## Benchmarks y rendimiento

Resultados publicados por el autor (Nightmedia) en la model card:

| Benchmark | Este modelo | Base heretic (uncensored) |
|---|---|---|
| ARC Challenge | 0.585 | 0.534 |
| ARC Easy | 0.756 | 0.699 |
| BoolQ | 0.874 | 0.872 |
| HellaSwag | 0.724 | 0.603 |
| OpenBookQA | 0.462 | 0.448 |
| PIQA | 0.798 | 0.733 |
| Winogrande | 0.717 | 0.658 |

Metricas de de-censura (Heretic):

| Metrica | Este modelo | google/gemma-3-12b-it |
|---|---|---|
| Divergencia KL | 0.0826 | 0 (por definicion) |
| Rechazos | 7/100 | 98/100 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparativas con modelos de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 24,4 GB de pesos, por lo que se necesitan del orden de 26-30 GB de VRAM contando cache KV y overhead; el repo ocupa 24,4 GB.
- GPU recomendadas para bf16: A100 40/80 GB, H100, o dos RTX 4090 (24 GB cada una) en configuracion multi-GPU; una unica RTX 4090 de 24 GB queda al limite y probablemente requiera cuantizacion.
- Cabe en GPU consumer con cuantizacion (por ejemplo, formatos de 8 o 4 bits), aunque la informacion no detalla que cuantizaciones estan publicadas; seria necesario generarlas a partir de los safetensors.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `endpoints_compatible`), y segun el autor KoboldCpp, oobabooga/text-generation-webui y SillyTavern para chat/roleplay.
- Latencia y throughput: no disponibles en la informacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Estado |
|---|---|---|---|---|---|
| Este modelo (Gemma-3-12b Heretic + GLM reasoning) | ~12,2B | 128k | Si | Apache 2.0 | Publicado, 73 descargas |
| DreamFast/gemma-3-12b-it-heretic (base) | ~12B | 128k (heredado) | Si | Apache 2.0 (heredada) | Publicado |
| google/gemma-3-12b-it (original) | ~12B | 128k | Si | Gemma Terms (no Apache) | Publicado |
| GLM 4.7 Flash (fuente del dataset de razonamiento) | no disponible | no disponible | no disponible | no disponible | Referencia del dataset |

La comparativa de rendimiento disponible se limita a los benchmarks de la tabla anterior frente a la base heretic; no hay datos publicados frente a otros modelos de 12B en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo sin censura: los rechazos se han suprimido deliberadamente (7/100). Puede generar contenido explicito, violento u ofensivo; no es adecuado para aplicaciones orientadas al publico general sin filtros adicionales.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; el modo de razonamiento no garantiza veracidad y la destilacion de otro modelo puede introducir errores sistematicos.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- En algunos casos el modelo necesita direccion explicita para alcanzar el nivel de contenido deseado (el autor lo describe como tendencia a un tono "tame" por defecto).
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de Gemma 3 y de un dataset de razonamiento, puede heredar sesgos de ambos.
- Licencia Apache 2.0 declarada, pero el modelo base original de Google se distribuye bajo Gemma Terms; conviene verificar la compatibilidad para uso comercial, ya que la relicenciacion de un derivado de Gemma como Apache 2.0 es discutible.
- No hay informacion sobre cuantizaciones publicadas ni sobre tool calling o uso como agente; no asumir estas capacidades en produccion.
- El ajuste de `Smoothing_factor` a 1.5 y el uso de templates JINJA especificos son necesarios para un funcionamiento optimo segun el autor; ignorarlos puede degradar la calidad.
- Modelo de nicho con solo 73 descargas y 21 likes: poca validacion comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/DavidAU/gemma-3-12b-it-vl-GLM-4.7-Flash-Heretic-Uncensored-Thinking
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Modelo base: https://huggingface.co/DreamFast/gemma-3-12b-it-heretic
- Modelo original: https://huggingface.co/google/gemma-3-12b-it
- Dataset de razonamiento: https://huggingface.co/datasets/TeichAI/glm-4.7-2000x
- Soporte/FAQ del autor: https://huggingface.co/DavidAU/support
