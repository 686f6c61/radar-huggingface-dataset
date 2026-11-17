# machinez/pplx-decider-v1.3-NVFP4

## Resumen

pplx-decider-v1.3-NVFP4 es una cuantización de 8 bits (formato NVFP4 de compressed-tensors) del modelo pplx-decider-v1.3, un clasificador multimodal derivado por fine-tuning de Qwen/Qwen3.8-27B. Lo publica el usuario `machinez` en Hugging Face a partir del modelo original de Perplexity AI. El modelo no genera texto libre: está diseñado como un "decider" que, dado un estado (texto o JSON) y un conjunto de preguntas tipadas, devuelve respuestas estructuradas con probabilidades y confianza.

La tarea que resuelve es la clasificación y el enrutamiento controlado: preguntas de tipo `choice` (selección entre opciones), `noul` (probabilidad de verdadero/falso), `score` (nivel ordinal con leyenda) y `locate` (extracción de fragmentos textuales literales con offsets de caracteres y puntuación de confianza). Esta versión 1.3 incorpora la capacidad `locate` respecto a la 1.2 y mejoras de robustez en tareas de decisión.

El modelo base Qwen3.8-27B aporta una arquitectura transformer con capacidades multimodales; el checkpoint contiene 17.864.494.832 parámetros reales según los safetensors, con un repositorio de 27,1 GB. La licencia declarada es Apache 2.0. La relevancia práctica está en sustituir heurísticas de enrutamiento y clasificación por un modelo único, calibrado y con salida probabilística auditable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.8-27B), multimodal, con cabecera de clasificación tipo decider |
| Parametros totales | 17.864.494.832 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (8-bit, compressed-tensors); el original se distribuye en BF16 (~49 GiB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pytorch, compressed-tensors, custom-code) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B mediante fine-tuning supervisado para una tarea de clasificación estructurada. No es un modelo generativo en el sentido habitual: la salida es un conjunto de logits sobre códigos de respuesta (`A`, `B`, ...) asociados a las opciones de cada pregunta, seguidos de un softmax restringido a las opciones válidas. La modalidad multimodal permite adjuntar imágenes junto al estado textual; las imágenes se redimensionan manteniendo la relación de aspecto hasta un máximo de 1.638.400 píxeles (1,6 MP), según `decision_config.json`.

Una innovación destacable es el modo de ejecución. En `mode="separate"` (por defecto), cada pregunta se responde en su propia secuencia compuesta por el estado y esa pregunta únicamente, de modo que las preguntas no se ven entre sí y la respuesta es invariante a añadir, quitar o reordenar el resto de preguntas. En `mode="isolated"` se codifica toda la petición en una sola secuencia con el layout de entrenamiento: el estado se lee una vez y cada pregunta atiende al estado y a sí misma, lo que abarata el coste con estados largos, pero puede alterar entre un 1,5 % y un 2,2 % de las respuestas principales. La calibración se guarda en `decision_config.json` como una temperatura ajustada sobre datos de validación retenidos. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Clasificación por elección (`choice`) entre 1 y 255 opciones, con probabilidades por opción y confianza.
- Preguntas booleanas (`noul`) que devuelven P(verdadero) y permiten calcular el margen de logit `true - false` para ranking sin saturación.
- Puntuación ordinal (`score`) sobre listas de 2 a 255 niveles descriptivos, devolviendo el índice esperado, la leyenda y las probabilidades.
- Extracción de fragmentos literales (`locate`) del estado con offsets de inicio y fin, texto y puntuación de confianza.
- Procesamiento multimodal: admite imágenes en formato ruta, base64 (`data:image/...;base64,...`) o `PIL.Image`, visibles para todas las preguntas.
- Manejo de estados no textuales: diccionarios y listas se serializan como JSON antes de la clasificación.
- Procesamiento por lotes: `decide` acepta una lista de peticiones y devuelve una lista de respuestas en el mismo orden.
- Acceso a logits crudos mediante `decider.logits(requests)` para integraciones que requieran ranking propio.
- Validación de esquema: las peticiones mal formadas lanzan `pplx_decider.RequestError` antes de cualquier cómputo.
- No se documentan capacidades de tool calling, razonamiento multi-paso ni generación de texto libre.

## Casos de uso

- Enrutamiento de tickets de soporte: el ejemplo de la model card clasifica una consulta sobre un error 401 en equipos (`billing`, `support`, `sales`) y evalúa urgencia y frustración en una sola llamada, con probabilidades por categoría para aplicar umbrales de derivación.
- Moderación y triaje de contenido: uso de preguntas `noul` sobre un estado textual para decidir si requiere revisión humana, aprovechando el margen de logit para ordenar la cola de revisión en lugar de umbrales de probabilidad saturados.
- Extracción de entidades y citas con offsets: la capacidad `locate` permite localizar fragmentos literales en documentos largos (por ejemplo, cláusulas contractuales o datos de contacto) devolviendo `start`, `end` y `score` para resaltado en interfaz o validación posterior.
- Encuestas y feedback con escala ordinal: preguntas `score` con leyendas de 2 a 255 niveles permiten convertir texto libre de clientes en una puntuación de satisfacción esperada con distribución de probabilidad asociada.
- Clasificación de documentos con imágenes adjuntas: al aceptar imágenes junto al estado, puede clasificar capturas de error, facturas escaneadas o pantallazos de interfaz sin un pipeline OCR separado, con redimensionado interno a 1,6 MP.
- Enrutamiento de agentes en pipelines: como paso previo a un LLM generativo, el decider decide la intención o la herramienta a invocar con salida estructurada y validada por esquema, reduciendo coste frente a un modelo generativo en cada salto.
- Análisis de conversaciones multi-turno serializadas: al aceptar listas y diccionarios como estado, se puede pasar el historial completo en JSON y formular varias preguntas independientes en modo `separate` sin que las respuestas se contaminen entre sí.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blog de Perplexity para métricas de rendimiento y evaluación, pero no incluye cifras en el texto proporcionado.

## Requisitos de hardware

- El modelo original en BF16 requiere aproximadamente 49 GiB de pesos más memoria de trabajo, según la model card; esto implica GPU de 80 GB (A100 80GB, H100 80GB) o particionado en varias GPU.
- Esta variante NVFP4 de 8 bits reduce el repositorio a 27,1 GB, por lo que en teoría cabría en GPU de 32 GB (por ejemplo, RTX 5090 o V100 32GB) y con holgura en 48 GB (RTX 6000 Ada, A6000); no se confirma el pico real de memoria en inferencia.
- En GPU de consumo de 24 GB (RTX 4090, RTX 3090) no hay confirmación de que quepa con memoria de trabajo; el tamaño de pesos de 27,1 GB ya supera esa cifra.
- El código de carga es `custom-code` con `pytorch` y `transformers`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Requiere Python 3.12 o superior y CUDA; las dependencias declaradas son torch, transformers, safetensors, pillow, torchvision y huggingface-hub.
- No se publican datos de latencia ni throughput. El modo `isolated` se describe como más barato cuando muchas preguntas comparten un estado largo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pplx-decider-v1.3-NVFP4 | 17.864.494.832 | no disponible | Clasificación multimodal estructurada | Apache 2.0 | Hugging Face (`machinez/pplx-decider-v1.3-NVFP4`) |
| pplx-decider-v1.3 (original, BF16) | no disponible en la informacion | no disponible | Clasificación multimodal estructurada | Apache 2.0 | Hugging Face (`perplexity-ai/pplx-decider-v1.3`), repositorio privado según la model card |
| pplx-decider-v1.2 | no disponible | no disponible | Clasificación multimodal estructurada | no disponible | Hugging Face (`perplexity-ai/pplx-decider-v1.2`) |
| Qwen/Qwen3.8-27B (modelo base) | no disponible | no disponible | Generación de texto multimodal | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La model card original indica que el repositorio es privado y requiere un token de Hugging Face con acceso; esta réplica de `machinez` no aclara si esa restricción se mantiene ni si el código custom se ejecuta sin revisión.
- El modelo requiere `trust_remote_code` implícito al cargar código propio (`source/src/pplx_decider`); conviene auditar el código antes de desplegarlo en producción.
- La temperatura de calibración se ajustó sobre datos retenidos del autor; la propia documentación advierte que una única temperatura no es correcta para todas las tareas y recomienda recalibrar con tráfico propio y usar umbrales por tarea.
- Las probabilidades pueden saturarse en empates; para ranking se recomienda el margen de logit de preguntas `noul` en lugar de la probabilidad.
- En modo `isolated`, entre el 1,5 % y el 2,2 % de las respuestas principales difieren del modo `separate`, por lo que no es intercambiable sin reevaluar.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación; al ser un clasificador, el riesgo principal es una asignación errónea de categoría o un span `locate` incorrecto, no la generación de texto inventado.
- No hay información sobre el contexto máximo, lo que impide garantizar el comportamiento con estados muy largos.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse que se mantiene en esta réplica y en el código custom incluido.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (17 de noviembre de 2026); no hay evidencia de validación comunitaria de esta cuantización concreta.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/machinez/pplx-decider-v1.3-NVFP4
- Modelo original: https://huggingface.co/perplexity-ai/pplx-decider-v1.3
- Versión anterior: https://huggingface.co/perplexity-ai/pplx-decider-v1.2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de Perplexity sobre el decider: https://www.perplexity.ai/hub/blog/perplexity-decider
