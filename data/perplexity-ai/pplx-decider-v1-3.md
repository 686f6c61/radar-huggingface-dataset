# perplexity-ai/pplx-decider-v1.3

## Resumen

pplx-decider-v1.3 es un modelo de clasificación multimodal desarrollado por Perplexity AI, obtenido mediante fine-tuning supervisado sobre Qwen/Qwen3.8-27B. No es un modelo generativo de propósito general: está diseñado específicamente para actuar como "decisor", es decir, recibir un estado (texto estructurado, no estructurado o imágenes) y responder a una o varias preguntas de clasificación tipificadas (elección entre opciones, verdadero/falso, escala ordinal o extracción literal de fragmentos de texto). Esta especialización lo diferencia de los LLM conversacionales: la salida es un conjunto de distribuciones de probabilidad calibradas por pregunta, no texto libre.

La versión 1.3 sucede a pplx-decider-v1.2 e incorpora mejoras de rendimiento y robustez en tareas de decisión, además de una nueva capacidad de extracción denominada Locate, que devuelve fragmentos textuales literales del estado con desplazamientos de caracteres y puntuaciones de confianza. El modelo conserva la naturaleza multimodal del Qwen3.8-27B subyacente, aceptando imágenes junto al texto del estado.

Con 26.085.330.160 parámetros (~26,1 mil millones) y pesos en BF16 que ocupan aproximadamente 49 GiB, el modelo está claramente orientado a despliegue en GPU de centro de datos. Su licencia Apache 2.0 y su pipeline de text-classification lo sitúan como una pieza de infraestructura para enrutamiento, triaje y extracción estructurada dentro de sistemas de agentes y pipelines de atención al cliente, más que como un asistente conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (derivado de Qwen3.8-27B mediante fine-tuning); requiere código personalizado (`custom-code`) |
| Parametros totales | 26.085.330.160 (~26,1 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos publicados son BF16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio PyTorch, ~54,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer multimodal, y se ajusta mediante fine-tuning (la model card indica `base_model_relation: finetune`) para una tarea de clasificación con salida restringida. La innovación central no reside en la arquitectura del backbone, sino en la interfaz de decisión: el modelo recibe un `state` (cadena, diccionario o lista; los no-strings se serializan como JSON) y un conjunto de `questions` tipificadas (`choice`, `noul`, `score`, `locate`), y emite logits restringidos a las opciones válidas de cada pregunta, sobre los que se aplica una softmax. Las opciones se presentan al modelo codificadas como `A`, `B`, etc., en el orden proporcionado por el usuario.

El entrenamiento incluye una calibración de temperatura ajustada sobre datos held-out y almacenada en `decision_config.json`; `decide` la aplica exactamente una vez antes de normalizar. El modelo soporta dos modos de codificación de la petición: `separate` (por defecto), en el que cada pregunta se responde en su propia secuencia compuesta por el estado y esa única pregunta, de modo que las preguntas no se ven entre sí y la respuesta es invariante a añadir, quitar o reordenar otras preguntas; e `isolated`, que codifica toda la petición como una sola secuencia con el formato de entrenamiento, más económico cuando muchas preguntas comparten un estado largo, pero con una deriva del 1,5-2,2 % en la respuesta principal respecto a `separate` en las muestras del autor. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Clasificación por elección (`choice`): entre 1 y 255 opciones con descripción opcional, devolviendo la opción elegida, probabilidades por opción y confianza.
- Clasificación binaria (`noul`): probabilidad de verdadero, con descripciones opcionales para cada polo.
- Puntuación ordinal (`score`): entre 2 y 255 niveles ordenados de menor a mayor, devolviendo el índice de nivel esperado, probabilidades, leyenda y confianza.
- Extracción literal de fragmentos (`locate`): devuelve `spans` con `start`, `end`, `text` y `score`, permitiendo localizar citas textuales dentro del estado con desplazamientos de caracteres.
- Multimodalidad: acepta imágenes en el campo `images` (rutas, data URIs base64 u objetos PIL), redimensionadas manteniendo la relación de aspecto hasta un máximo de 1.638.400 píxeles (1,6 MP); todas las preguntas de la petición pueden ver las imágenes.
- Múltiples preguntas por petición sobre el mismo estado, con independencia entre ellas en modo `separate`.
- Acceso a logits crudos mediante `decider.logits(requests)`, útil para ranking mediante el margen `true - false` de una pregunta `noul`, que no se satura en empates como las probabilidades.
- Procesamiento por lotes: `decide` acepta una lista de peticiones y devuelve una lista de respuestas en el mismo orden.
- Validación estricta del esquema: las peticiones malformadas lanzan `pplx_decider.RequestError` antes de cualquier cómputo.
- No se documentan en la información disponible capacidades de generación de texto libre, tool calling, razonamiento multi-paso ni soporte multilingüe explícito.

## Casos de uso

- Triaje de tickets de soporte: el ejemplo de la model card muestra cómo clasificar una consulta entrante en equipos (`billing`, `support`, `sales`) con una pregunta `choice`, evaluar urgencia con `noul` y medir frustración con `score`, todo en una sola petición y con independencia entre preguntas.
- Enrutamiento de peticiones en sistemas de agentes: usar la salida `choice` calibrada para decidir qué herramienta, cola o subagente debe atender una solicitud, aprovechando que la respuesta es invariante al orden y número de preguntas en modo `separate`.
- Moderación y evaluación de riesgo: preguntas `noul` o `score` sobre contenido generado o recibido permiten obtener probabilidades calibradas y umbrales por tarea, con la recomendación del autor de recalibrar sobre tráfico propio.
- Extracción de citas y evidencias: la capacidad `locate` devuelve fragmentos literales con offsets de caracteres y confianza, adecuada para construir sistemas de atribución de fuentes, verificación de afirmaciones o resaltado de evidencias en documentos largos.
- Clasificación de documentos con imágenes: gracias al soporte multimodal (hasta 1,6 MP por imagen), puede clasificar capturas de pantalla, facturas escaneadas o interfaces de usuario junto con el texto del estado.
- Ranking de candidatos: mediante `decider.logits` y el margen `true - false` de preguntas `noul`, se pueden ordenar alternativas sin la saturación que introducen las probabilidades normalizadas.
- Análisis de conversaciones multi-turno: serializando el historial como JSON en el campo `state`, se pueden obtener múltiples etiquetas (intención, sentimiento, urgencia) sobre el mismo contexto en una única pasada en modo `isolated`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blog de Perplexity (https://www.perplexity.ai/hub/blog/perplexity-decider) para detalles de rendimiento, entrenamiento y evaluación, pero no incluye cifras en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada: aproximadamente 49 GiB solo para los pesos en BF16, más memoria de trabajo; se recomienda una GPU con al menos 80 GiB para operar con holgura.
- GPU recomendadas: A100 80 GB, H100 80 GB o superiores; no se documentan configuraciones con menor VRAM.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en tarjetas de 48 GB en BF16 sin cuantización, y no se publican variantes cuantizadas.
- Software: Python 3.12 o superior, CUDA, `torch`, `transformers`, `safetensors`, `pillow`, `torchvision` y `huggingface-hub`; el modelo requiere código personalizado incluido en el repositorio (`source/src/pplx_decider`) o instalable con `pip install ./source`.
- Opciones de despliegue: la model card solo documenta el uso mediante la clase `Decider` del propio repositorio; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor advierte que el modo `isolated` es más económico cuando muchas preguntas comparten un estado largo, pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pplx-decider-v1.3 | ~26,1 B | no disponible | Clasificación multimodal con salida restringida | Apache 2.0 | Hugging Face (repo indicado como privado en la model card) |
| Qwen/Qwen3.8-27B (modelo base) | ~27 B (según denominación) | no disponible | Generación multimodal de propósito general | no disponible en la información | Hugging Face |
| pplx-decider-v1.2 (versión anterior) | no disponible | no disponible | Clasificación multimodal | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El repositorio se describe como privado en la model card: es necesario autenticarse con un token de Hugging Face con acceso, lo que condiciona la disponibilidad real pese a la licencia Apache 2.0.
- No es un modelo generativo: no produce texto libre ni admite tool calling; su uso está restringido al esquema de preguntas documentado, y las peticiones fuera de esquema lanzan `RequestError`.
- Las probabilidades requieren calibración sobre tráfico propio: el autor advierte que una única temperatura no puede ser correcta para todas las tareas y que suelen ser preferibles umbrales por tarea.
- En modo `isolated`, las respuestas pueden variar entre el 1,5 % y el 2,2 % en la respuesta principal respecto a `separate`, porque el estado atiende a las preguntas; el autor recomienda `separate` salvo que el coste de releer el estado sea determinante.
- Las preguntas no se ven entre sí en modo `separate`: toda la información necesaria debe incluirse en el estado, no en otras preguntas.
- Las imágenes se redimensionan a un máximo de 1.638.400 píxeles manteniendo la relación de aspecto, lo que puede degradar la legibilidad de detalles finos.
- No se documentan idiomas soportados, sesgos conocidos, tasas de alucinación ni límites de longitud de contexto, por lo que no es posible evaluar estos riesgos con la información disponible.
- El tamaño (49 GiB en BF16) excluye el despliegue en hardware de consumo y encarece el escalado horizontal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/perplexity-ai/pplx-decider-v1.3
- Versión anterior: https://huggingface.co/perplexity-ai/pplx-decider-v1.2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de Perplexity sobre Decider: https://www.perplexity.ai/hub/blog/perplexity-decider
