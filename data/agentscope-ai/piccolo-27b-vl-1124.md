# agentscope-ai/Piccolo-27B-VL-1124

## Resumen

Piccolo-27B-VL-1124 es un modelo de lenguaje y vision (image-text-to-text) publicado por el usuario agentscope-ai en Hugging Face. El checkpoint emplea la arquitectura Qwen3_5ForConditionalGeneration, lo que lo situa en la familia de modelos multimodales derivados de Qwen 3.5, e incorpora una configuracion de vision junto con un modulo adicional denominado `model-frozen-mtp` (multi-token prediction con pesos congelados). El repositorio contiene 11 shards principales de pesos en Safetensors mas ese fichero MTP, todos referenciados por `model.safetensors.index.json`, con un total de 27.781.427.952 parametros (aproximadamente 27,8 mil millones).

El modelo resuelve tareas de comprension conjunta de imagen y texto: respuesta a preguntas visuales, descripcion de imagenes, extraccion de informacion de documentos y conversacion multimodal. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y es compatible con la libreria transformers y con endpoints compatibles.

La relevancia de este lanzamiento radica en su tamano (27B) dentro del segmento de modelos vision-lenguaje de pesos abiertos, un punto intermedio entre los modelos de 7-8B y los de 70B+, y en la inclusion del modulo MTP congelado, una tecnica asociada a la decodificacion especulativa que puede acelerar la generacion. No obstante, la informacion publicada por el autor es muy escasa: no se detallan datos de entrenamiento, idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal con configuracion de vision) |
| Parametros totales | 27.781.427.952 (~27,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en Safetensors; se asume compatibilidad con cuantizacion estandar de transformers, sin confirmar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (11 shards principales + `model-frozen-mtp.safetensors`) |

## Arquitectura y entrenamiento

El checkpoint sigue la arquitectura Qwen3_5ForConditionalGeneration, un transformer multimodal que combina un codificador de vision con un modelo de lenguaje para tareas image-text-to-text. La model card menciona explicitamente una "vision configuration" y la presencia de un fichero `model-frozen-mtp.safetensors`, que corresponde a un modulo de prediccion multi-token (MTP) con pesos congelados. Este tipo de modulo se emplea habitualmente para decodificacion especulativa, permitiendo proponer varios tokens por paso y verificarlos con el modelo principal, lo que reduce la latencia de generacion.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus, el uso de RLHF/DPO ni el proceso de alineacion. Tampoco se documenta si el modelo es un fine-tuning de un Qwen 3.5 VL oficial, un entrenamiento desde cero o una destilacion. El repositorio incluye las configuraciones originales de modelo, generacion, tokenizer y processor, asi como la plantilla de chat, lo que facilita su carga directa con transformers.

## Capacidades

- Generacion de texto y conversacion multi-turno en formato chat (la plantilla de chat esta incluida en el repositorio).
- Comprension de imagenes: el pipeline declarado es image-text-to-text, por lo que admite entrada conjunta de imagen y texto.
- Respuesta a preguntas visuales (VQA) y descripcion de contenido visual.
- Procesamiento de documentos e imagenes con texto (OCR implicito en tareas de comprension visual, sin confirmar explicitamente).
- Decodificacion especulativa mediante el modulo MTP congelado, orientada a reducir latencia.
- Soporte de tool calling / function calling: no disponible en la informacion publicada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion publicada.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistencia conversacional multimodal: el modelo puede mantener dialogos multi-turno en los que el usuario adjunta imagenes (capturas, fotos, diagramas) y formula preguntas de seguimiento, gracias a la plantilla de chat incluida y a la arquitectura image-text-to-text.
- Extraccion de datos de documentos escaneados: se le pueden enviar facturas, formularios o tickets como imagen y solicitar la transcripcion estructurada de campos, integrandolo en pipelines de digitalizacion.
- Descripcion automatica de imagenes para accesibilidad: generacion de texto alternativo para catalogos, intranets o plataformas de contenido, con la ventaja de la licencia Apache 2.0 para uso comercial.
- Moderacion y analisis de contenido visual: clasificacion y descripcion de imagenes enviadas por usuarios en plataformas, combinando el juicio del modelo de lenguaje con la entrada visual.
- Soporte tecnico con capturas de pantalla: el usuario envia una captura de un error o de una interfaz y el modelo interpreta la imagen y guia la resolucion del problema en conversacion.
- Analisis de imagenes medicas o industriales no criticas: como asistente de primera pasada para describir hallazgos visibles y derivar a revision humana, siempre con supervision experta.
- Prototipado de agentes multimodales: al ser compatible con transformers y con endpoints compatibles, sirve como base para experimentar con pipelines de agentes que reciben imagenes y texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 55,6 GB solo para pesos (27,78B x 2 bytes), mas memoria para el codificador de vision, cache KV y overhead; en la practica se recomienda un nodo con 80 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: en torno a 28-30 GB de pesos, viable en una A100 40 GB o en dos RTX 4090 de 24 GB con reparto de capas.
- VRAM estimada en cuantizacion de 4 bits: en torno a 14-16 GB de pesos, lo que permitiria ejecucion en una unica RTX 4090 o RTX 3090 de 24 GB, con margen para cache KV segun contexto.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para BF16 sin cuantizar; A100 40 GB o L40S 48 GB para 8 bits; RTX 4090 / RTX 3090 para 4 bits.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI para servido en produccion si la arquitectura Qwen3.5 VL esta soportada por dichos motores; llama.cpp/Ollama requeririan conversion a GGUF, no confirmada por el autor.
- Latencia y throughput: no disponible. El modulo MTP congelado sugiere soporte de decodificacion especulativa, que en modelos comparables reduce la latencia por token, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Piccolo-27B-VL-1124 | ~27,8B | no disponible | Apache 2.0 | Arquitectura Qwen3.5 VL, modulo MTP congelado; sin benchmarks publicados |
| Qwen2.5-VL-32B-Instruct | ~32B | 128K (segun model card oficial) | Apache 2.0 | Referencia abierta en vision-lenguaje de tamano medio-alto; benchmarks publicados |
| Qwen2.5-VL-7B-Instruct | ~7B | 128K (segun model card oficial) | Apache 2.0 | Alternativa ligera para GPUs de consumo; benchmarks publicados |
| InternVL2.5-26B | ~26B | variable segun configuracion | MIT (segun version) | Modelo vision-lenguaje de tamano comparable con evaluaciones publicadas |

La comparacion con Qwen2.5-VL-32B o InternVL2.5-26B es la mas directa por rango de parametros y tarea, aunque no se dispone de resultados de Piccolo-27B-VL para contrastar rendimiento. Se recomienda validar el modelo en el caso de uso concreto antes de sustituir alternativas con benchmarks publicados.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre datos de entrenamiento: no es posible evaluar la composicion del corpus, los sesgos potenciales ni la cobertura linguistica.
- Riesgo de alucinacion inherente a los modelos de lenguaje; en tareas visuales puede inventar detalles no presentes en la imagen, especialmente en documentos densos o imagenes de baja calidad.
- Idiomas soportados no declarados: no hay garantia de calidad fuera del idioma o idiomas usados en el entrenamiento, que se desconocen.
- Longitud de contexto no publicada: no se puede planificar su uso en tareas de contexto largo sin verificacion empirica.
- Repositorio sin descargas ni likes en el momento de la consulta y creado en 2026: no hay evidencia de comunidad, validacion independiente ni mantenimiento.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene auditar el modelo antes de desplegarlo en produccion.
- El modulo MTP congelado puede requerir pasos de configuracion adicionales en motores de inferencia; su soporte en vLLM, TGI o llama.cpp no esta confirmado.
- No se han publicado evaluaciones de seguridad, robustez ante prompts adversarios ni comportamiento en dominios sensibles (medicina, legal, finanzas).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentscope-ai/Piccolo-27B-VL-1124
- Repositorio de AgentScope (organizacion autora): https://github.com/modelscope/agentscope
- Documentacion de transformers para modelos multimodales: https://huggingface.co/docs/transformers
- Paper de referencia sobre decodificacion especulativa (MTP): no disponible en la informacion proporcionada
- Demo o blog oficial del modelo: no disponible
