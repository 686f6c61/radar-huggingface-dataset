# Cloudflare/clef

## Resumen

Clef es un modelo multimodal de 27.356.728.560 parámetros (unos 27,36 mil millones) desarrollado por Cloudflare y publicado bajo licencia Apache-2.0. Se trata de un ajuste fino (post-train) del modelo base Qwen/Qwen3.8-27B, del que hereda tanto el backbone transformer como el codificador de visión. A diferencia de un modelo generativo convencional, Clef no produce texto libre: recibe un estado (texto, JSON, imágenes o vídeo) junto con un esquema de preguntas tipadas y devuelve, en un único forward pass, una probabilidad para cada opción permitida de cada pregunta. Esto elimina por completo el parsing de la salida.

La arquitectura añade al backbone un "joint schema head", una pequeña cabeza transformer que lee los estados ocultos finales del backbone, enruta la evidencia del estado hacia cada pregunta y puntúa de forma conjunta todas las opciones de todas las preguntas. La salida es un logit por opción permitida; aplicando un softmax por pregunta se obtienen las probabilidades. El modelo está pensado para tareas de decisión estructurada y clasificación multimodal, no para generación abierta.

Su relevancia actual radica en que ofrece una API compatible con Jev y SystemOne, un formato de salida tipado (tipos `choice`, `score` y `noul`) y despliegue mediante SGLang con un endpoint `/v1/systemone`. Con 77.427 descargas y 2.373 likes en Hugging Face, se posiciona como una alternativa práctica para pipelines de decisión deterministas donde la generación de texto libre introduce fragilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone Qwen/Qwen3.8-27B con codificador de visión) más joint schema head (cabeza transformer para puntuar opciones) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (la model card menciona bf16 en los comandos de SGLang) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (particionados: `model-*.safetensors` con `model.safetensors.index.json`; además `joint_head.safetensors`) |

## Arquitectura y entrenamiento

Clef se construye sobre Qwen/Qwen3.8-27B, conservando su backbone y su codificador de visión, almacenados como safetensors particionados estándar. Sobre los estados ocultos finales del backbone se añade una "joint schema head": una pequeña cabeza transformer que enruta la evidencia del estado hacia cada pregunta del esquema y puntúa conjuntamente todas las opciones de todas las preguntas. La salida es un logit por opción permitida y el softmax se aplica por pregunta, de modo que el modelo no genera texto libre ni requiere parsing de la respuesta.

El modelo se distribuye como post-train (finetune) del base, con un archivo `joint_schema_model.py` que contiene la codificación de registros, el batching, el propio modelo, `load_release_model` y la función `systemone`. La model card indica que se ha probado con `torch` 2.11 y `transformers` 5.10.2 en una única H200. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Existe una variante menor y más rápida denominada Clef-Flash.

## Capacidades

- Decisión estructurada: convierte un estado y un esquema de preguntas tipadas en probabilidades por opción, con salida tipada `choice`, `score` y `noul`.
- Procesamiento multimodal de entrada: acepta texto, JSON, imágenes (PIL) y vídeo (arrays de fotogramas), y permite mezclar registros de solo texto y multimodales en el mismo batch.
- Puntuación conjunta: puntúa todas las opciones de todas las preguntas en un único forward pass, sin generación autoregresiva.
- Salida calibrada por pregunta: cada respuesta incluye confianza y probabilidades (en `choice` y `score`) o la probabilidad de verdadero (en `noul`).
- Compatibilidad de API: la API es compatible con Jev y SystemOne, con endpoint `/v1/systemone`.
- Integración con SGLang: servible mediante SGLang con imagen `lmsysorg/sglang:dev-clef`.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking o razonamiento multi-paso explícito: no disponible en la información proporcionada.

## Casos de uso

- Clasificación de tickets de soporte: dado un mensaje de estado, un esquema con preguntas `choice` (por ejemplo, departamento: billing o technical) y `noul` (¿hay una caída de servicio?) devuelve probabilidades por opción en una sola pasada, lo que permite enrutar tickets sin parsing de texto.
- Priorización de urgencia: con una pregunta de tipo `score` y una leyenda ("Can wait", "This week", "Today"), el modelo devuelve la puntuación esperada y su confianza, útil para triaje automático de colas de atención.
- Procesamiento de facturas y recibos: combinando estado JSON (proveedor, total, moneda, estado) e imágenes del documento, responde preguntas como si el total supera un umbral o si el importe es legible, adecuado para validación documental.
- Moderación y decisión sobre contenido multimodal: al aceptar imágenes y vídeo además de texto, puede evaluar contenido audiovisual contra criterios tipados definidos en el esquema.
- Automatización de decisiones en pipelines deterministas: al no generar texto libre, la salida es directamente consumible por sistemas posteriores, lo que encaja en flujos donde la generación abierta introduce fragilidad.
- Enrutamiento en agentes: la compatibilidad con Jev/SystemOne permite integrar Clef como componente de decisión dentro de arquitecturas de agentes que necesitan elegir entre opciones acotadas con una confianza asociada.
- Revisión de contratos o documentación con preguntas booleanas: preguntas `noul` sobre condiciones concretas (por ejemplo, si una cláusula está presente) permiten extraer señales estructuradas de documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card enlaza a un "Decision Index leaderboard" en `clef-evals.workers-ai-mle.workers.dev`, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 27,36 mil millones de parámetros en bf16 el peso ronda los 54,7 GB, lo que exige GPUs de centro de datos. El repositorio ocupa 55,0 GB.
- GPU recomendadas: la model card indica pruebas en una única NVIDIA H200; los comandos de SGLang cubren H200, B200 y B300.
- GPU de consumo: no se documenta compatibilidad con GPUs de consumo en la información disponible.
- Opciones de despliegue: SGLang (imagen `lmsysorg/sglang:dev-clef`, endpoint `/v1/systemone`) y uso directo con `transformers` 5.10.2 y `torch` 2.11 mediante `load_release_model`; para imágenes y vídeo se requiere `pillow`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cloudflare/clef | 27,36 B | No disponible | Probabilidades por opción (salida tipada) | Apache-2.0 | Hugging Face, SGLang |
| Qwen/Qwen3.8-27B (base) | 27 B (aprox.) | No disponible | Texto generativo libre | No disponible en la información | Hugging Face |
| Cloudflare/clef-flash | No disponible | No disponible | Probabilidades por opción | No disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparado entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo no genera texto libre: solo responde a preguntas definidas en un esquema tipado, por lo que no sirve para tareas generativas abiertas.
- La calidad de la decisión depende del diseño del esquema y de los criterios de cada opción; un esquema ambiguo degrada la salida.
- No se documentan sesgos conocidos ni evaluación de sesgo en la información disponible.
- Riesgo de alucinación: no evaluado en la información disponible; al tratarse de un modelo de clasificación, el riesgo se manifiesta como asignación errónea de probabilidad, no como texto inventado.
- Idiomas soportados no disponibles: no se puede confirmar cobertura multilingüe.
- Longitud de contexto no disponible: limita la planificación de estados largos.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribución correspondiente.
- Requiere hardware de centro de datos (H200, B200, B300) según la documentación; no se documenta despliegue en GPU de consumo.
- Dependencia de versiones concretas de `torch` (2.11) y `transformers` (5.10.2), lo que puede complicar la integración en entornos con versiones distintas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cloudflare/clef
- Anuncio en el blog de Cloudflare: https://blog.cloudflare.com/clef-decision-models
- Leaderboard Decision Index: https://clef-evals.workers-ai-mle.workers.dev
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante Clef-Flash: https://huggingface.co/Cloudflare/clef-flash
- Cookbook de SGLang para Clef: https://docs.sglang.io/cookbook/autoregressive/Cloudflare/clef#hw=h200&variant=clef&quant=bf16&strategy=balanced&nodes=single
