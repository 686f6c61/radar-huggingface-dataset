# lucifer053/gemma-4-12b-it-uncensored-th

## Resumen

Gemma 4 12B It Uncensored (Thai + English, Vision) es un derivado del modelo denso multimodal google/gemma-4-12B-it, publicado por el usuario lucifer053 en HuggingFace. Se trata de una version "abliterated": se ha eliminado la direccion de rechazo (refusal direction) de los pesos mediante ortogonalizacion, de modo que el modelo deja de rechazar peticiones que el modelo original declinaria. El autor indica que el proceso se hizo con un dataset paralelo de prompts en tailandes e ingles, en lugar de usar solo datos en ingles, para no degradar la fluidez en tailandes.

El modelo conserva la torre de vision del original (pipeline `image-text-to-text`) y admite, de forma experimental, entrada de audio a traves del proyector multimodal. Cuenta con 11.907.350.576 parametros (aproximadamente 11,9 mil millones) y se distribuye unicamente en formato GGUF, con una cuantizacion Q4_K_M de unos 6,9 GB, una F16 de unos 22,2 GB y un proyector multimodal F16 de unos 167 MB. El repositorio ocupa 31,4 GB en total.

La relevancia de esta ficha es acotada y conviene ser explicito: el modelo no tiene descargas ni "likes" en el momento de la consulta (0 y 0), esta etiquetado como "beta1", no publica resultados de benchmarks y se apoya en un modelo base cuya existencia y especificaciones no se pueden verificar con la informacion disponible. Es, por tanto, un artefacto experimental de la comunidad, no un modelo convalidado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto + vision), segun model card "dense, multimodal" |
| Parametros totales | 11.907.350.576 (11,9 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: Q4_K_M y F16; proyector multimodal en F16 |
| Idiomas soportados | Tailandes (th) e ingles (en) |
| Licencia | Gemma Terms of Use (licencia "gemma") |
| Formato de pesos | GGUF (llama.cpp); no se distribuyen safetensors en el repo |
| Modelo base | google/gemma-4-12B-it |
| Tamano del repositorio | 31,4 GB |
| Version | beta1 (segun nomenclatura de los archivos) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura de partida es un transformer denso multimodal de la familia Gemma 4, con una torre de codificacion visual conectada al modelo de lenguaje mediante un proyector multimodal (mmproj). El autor no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; esa informacion corresponde al modelo base y no se reproduce en la model card. Lo unico confirmado es que la variante distribuida aqui no se ha reentrenado: es un ajuste de pesos derivado.

La innovacion declarada es el propio metodo de abliteracion. En lugar de medir la direccion de rechazo con datasets exclusivamente en ingles (practica habitual que degrada la calidad en otros idiomas), el autor emplea un conjunto de prompts paralelos tailandes-ingles con pares danino/inofensivo, de forma que la direccion de rechazo se calcula teniendo en cuenta ambos idiomas. La herramienta utilizada es `jim-plus/llm-abliteration`. Segun la model card, la abliteracion solo afecta a la parte textual del modelo, por lo que la capacidad de vision se mantiene intacta.

## Capacidades

- Generacion de texto conversacional en tailandes e ingles, con plantilla de chat propia que requiere `--jinja` en llama.cpp.
- Comprension de imagenes: entrada de imagen mas texto (image-text-to-text) mediante el proyector `mmproj-f16.gguf`, con prompt de descripcion o preguntas sobre la imagen.
- Entrada de audio experimental a traves del mismo proyector, invocada con la opcion `--audio`.
- Reduccion de rechazos: el modelo responde a peticiones que el modelo base declinaria (comportamiento "uncensored").
- Integracion con LM Studio: deteccion automatica del mmproj si se coloca junto al GGUF, con boton de adjuntar imagen en el chat.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia conversacional en tailandes: el modelo mantiene fluidez en th gracias a que la abliteracion se midio con prompts en ese idioma, algo poco comun en derivados "uncensored" y util para productos dirigidos al mercado tailandes que necesitan respuestas naturales y no traducciones rigidas.
- Procesamiento de documentos escaneados en tailandes con imagenes: combinando el GGUF principal con el mmproj se pueden enviar capturas o fotos de formularios y pedir extraccion o resumen del contenido, con salida en tailandes o ingles.
- Clasificacion y descripcion de imagenes en pipelines locales: al ser GGUF, se puede ejecutar en llama.cpp sin dependencia de APIs en la nube, lo que encaja en flujos con requisitos de privacidad sobre las imagenes procesadas.
- Prototipado de asistentes multimodales de investigacion: el modelo sirve para estudiar el efecto de la abliteracion sobre la calidad del texto y la vision, comparando salidas contra el modelo base con los mismos prompts.
- Analisis de contenido audiovisual experimental: usando la entrada de audio (marcada como experimental) se pueden probar transcripciones o descripciones combinadas con imagen, aceptando que la estabilidad no esta garantizada.
- Generacion de texto creativo sin filtros editoriales: para casos de ficcion, roleplay o redaccion con tematicas que el modelo base rechazaria, siempre dentro del marco legal y de la politica de uso prohibido de Gemma.
- Evaluacion de sesgos y comportamientos de modelos desalineados: el modelo es un sujeto de estudio util para equipos de seguridad que quieran medir que respuestas emergen cuando se elimina la direccion de rechazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales, y el modelo base google/gemma-4-12B-it tampoco aparece acompanado de resultados en la informacion proporcionada. No se deben extrapolar numeros del modelo original.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: aproximadamente 7-8 GB (6,9 GB de pesos + 167 MB del proyector + cache KV y overhead del runtime). Estimacion propia a partir de los tamanos de archivo, no publicada por el autor.
- VRAM estimada para F16: aproximadamente 24-28 GB (22,2 GB de pesos + proyector + cache), dependiendo de la longitud de contexto y del batch. Estimacion propia.
- Cabe en GPU de consumo: si, en Q4_K_M. Una RTX 3060 de 12 GB, una RTX 4070 Ti de 12 GB o una RTX 4090 de 24 GB pueden ejecutarlo; en tarjetas de 8 GB seria necesario reducir contexto y batch.
- GPUs profesionales: A100 40/80 GB y H100 para F16 con contextos largos o batches grandes.
- Despliegue: llama.cpp mediante `llama-cli` (texto) y `llama-mtmd-cli` (multimodal), y LM Studio. El tag `endpoints_compatible` sugiere compatibilidad con endpoints compatibles, pero la model card no documenta despliegue en vLLM, TGI ni Ollama.
- Parametros de ejecucion recomendados por el autor: `-ngl 99 --temp 0.6 --repeat-penalty 1.3 --repeat-last-n 512`; para vision, ademas `--jinja -b 4096 -ub 4096`, con el aviso explicito de no bajar la temperatura por debajo de 0,6.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Idiomas | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|---|
| gemma-4-12b-it-uncensored-th (este modelo) | 11,9 B | No disponible | Si | th, en | Gemma Terms of Use | No |
| google/gemma-4-12B-it (base) | No disponible | No disponible | Si (el autor lo describe como multimodal denso) | No disponible | Gemma Terms of Use | No disponible en la informacion |
| Otros derivados abliterated de la familia Gemma | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han identificado en la informacion proporcionada alternativas concretas de la misma categoria con datos verificables de parametros, contexto o rendimiento. La busqueda web realizada no devolvio resultados relevantes sobre el modelo (los resultados obtenidos correspondian a una tienda de motocross y no guardan relacion con el tema).

## Limitaciones y advertencias

- La abliteracion elimina la direccion de rechazo: el modelo puede generar contenido danino, ilegal o inseguro. La propia model card recuerda que la politica de uso prohibido de Gemma sigue aplicandose y que la responsabilidad es del usuario.
- Licencia Gemma Terms of Use: es una licencia con condiciones, no equivalente a Apache 2.0 ni MIT. Hay que revisar las obligaciones de atribucion y las restricciones de uso antes de un despliegue comercial.
- Temperatura critica: el autor advierte de que por debajo de 0,6 el modelo entra en bucles. Esto limita su uso en tareas que requieren salidas deterministas o muy reproducibles.
- Idiomas limitados a tailandes e ingles: no hay evidencia de buen rendimiento en castellano ni en otros idiomas; el uso multilingue no esta documentado.
- Longitud de contexto no disponible: no se puede planificar un caso de uso con contexto largo sin medirla empiricamente.
- Riesgo de alucinacion: no hay evaluaciones publicadas de fidelidad, y la eliminacion de la direccion de rechazo no mejora la precision factual, solo cambia la disposicion a responder.
- Estado beta y adopcion nula: 0 descargas y 0 likes en el momento de la consulta. No hay senales de validacion por parte de la comunidad ni de mantenimiento continuado.
- Compatibilidad multimodal fragil: el propio autor describe la entrada de audio como experimental; la vision exige `--jinja` y un batch grande para que los tokens de imagen quepan en una pasada no causal.
- Sin datos de entrenamiento publicados: se desconoce el volumen de tokens, la composicion del dataset y si hubo RLHF o DPO, lo que dificulta auditar el comportamiento del modelo.
- Posible degradacion colateral: la abliteracion puede afectar a otras capacidades ademas del rechazo; no hay evaluaciones comparativas contra el modelo base que cuantifiquen ese efecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lucifer053/gemma-4-12b-it-uncensored-th
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Herramienta de abliteracion utilizada: https://github.com/jim-plus/llm-abliteration
- Resultados de busqueda web sobre el modelo: no se encontraron enlaces relevantes (los resultados devueltos no guardaban relacion con el modelo)
