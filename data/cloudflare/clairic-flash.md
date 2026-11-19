# Cloudflare/clairic-flash

## Resumen

Clairic Flash es un modelo multimodal de 9.653.104.368 parámetros (aproximadamente 9,65 mil millones) desarrollado por Cloudflare sobre la base de Qwen/Qwen3.5-9B. Su propósito no es la generación de texto libre, sino la extracción estructurada de información: recibe un estado de entrada (texto o JSON), imágenes opcionales y un esquema de campos tipados, y devuelve respuestas estructuradas con valores tipados, confianza de extracción y probabilidades de nulo. Está orientado a tareas de extracción de información, estimación numérica y previsión (forecasting).

El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors y una librería de transformers con código personalizado (`custom-code`). El repositorio ocupa 19,6 GB y requiere Python 3.11 o superior, PyTorch y Transformers, además de `xgrammar` para imponer restricciones de esquema mediante un procesador de logits. La inferencia se realiza a través de un helper Python propio (`systemone`) que gestiona las peticiones de tipo "System One: Extract".

Su relevancia actual radica en que aborda un problema distinto al de los modelos generativos convencionales: la salida no es texto libre, sino un diccionario de respuestas validado contra un esquema, con puntuaciones de confianza y control de truncamiento. Esto lo hace adecuado para pipelines de extracción documental, procesamiento de facturas, recibos y formularios, donde la fiabilidad y la estructura son más importantes que la fluidez del texto generado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (derivada de Qwen3.5-9B) con cabezas tipadas para extracción estructurada |
| Parámetros totales | 9.653.104.368 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3.5-9B |
| Tamaño del repositorio | 19,6 GB |
| Librería | transformers (con código personalizado) |
| Requisitos de entorno | Python 3.11+, PyTorch, Transformers, xgrammar |

## Arquitectura y entrenamiento

Clairic Flash parte del modelo Qwen/Qwen3.5-9B y lo especializa para una tarea de extracción estructurada. La arquitectura subyacente es un transformer multimodal que acepta texto, JSON, imágenes (PIL o base64 embebido) y documentos PDF embebidos como URI de datos. Sobre esa base, el modelo incorpora cabezas de salida tipadas que producen valores para campos declarados con tipos como `text`, `number`, `date`, `time`, `datetime`, `duration`, `boolean`, `enum`, `object`, `list`, `compute`, `estimate` y `forecast`. La generación está restringida por un procesador de logits basado en `xgrammar`, que impone el esquema de campos solicitado.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card tampoco detalla innovaciones arquitectónicas internas más allá de la integración del esquema tipado y el uso de restricciones gramaticales en la decodificación. El modelo expone puntuaciones de confianza de extracción, probabilidades de nulo (`p_null`) y cuantiles opcionales para estimaciones y previsiones, lo que sugiere un entrenamiento orientado a la calibración de incertidumbre, aunque no se documenta el procedimiento.

## Capacidades

- Extracción estructurada de información desde texto, JSON, imágenes y PDF embebidos, con salida validada contra un esquema de campos tipados.
- Soporte de tipos de campo: `text`, `number`, `date`, `time`, `datetime`, `duration`, `boolean`, `enum`, `object`, `list`, `compute`, `estimate` y `forecast`.
- Estimación numérica con rangos declarados (`min`/`max`) y cuantiles opcionales.
- Previsión (forecasting) con horizonte e intervalo especificados, devolviendo rutas de predicción.
- Puntuación de confianza por respuesta, probabilidad de nulo independiente (`p_null`) e indicadores de validez y completitud.
- Evidencia textual con spans de caracteres cuando la coincidencia es única; spans nulos en evidencia ambigua o solo de imagen.
- Soporte de imágenes con rotación EXIF (0, 90, 180, 270 grados) y límite de cuatro imágenes o páginas renderizadas.
- Soporte de documentos PDF embebidos como URI de datos o como objetos con `content_type` y `base64`.
- Indicadores de truncamiento de la entrada y de uso de tokens en la respuesta.
- Modo `source_only` para seleccionar únicamente números, fechas, horas, datetimes o listas impresas literalmente en la fuente.
- Modo `knowledge: true` para permitir respuestas basadas en conocimiento del modelo en campos de texto, número y listas compatibles.
- Compatibilidad con endpoints (`endpoints_compatible`) y helper local de peticiones en Python.

## Casos de uso

- Extracción de datos de facturas: el modelo recibe el texto o la imagen de una factura y un esquema con campos como `vendor`, `total`, `issued` e `items`, devolviendo valores tipados con confianza y `p_null`. Es adecuado porque la salida está restringida por esquema y conserva spans de evidencia para auditoría.
- Procesamiento de recibos mediante OCR multimodal: se pasa una imagen PIL o base64 junto con un estado textual y campos como `merchant` y `total`, y el modelo devuelve los valores extraídos con rotación EXIF corregida y límites de cuatro imágenes por petición.
- Digitalización de formularios y documentos PDF: los PDF embebidos se procesan como páginas renderizadas compartiendo el límite de cuatro imágenes, permitiendo extraer campos tipados de documentos completos sin pipeline OCR externo.
- Previsión de demanda: con una serie histórica en el estado y campos de tipo `forecast` con `horizon` e `interval`, el modelo devuelve rutas de predicción y cuantiles opcionales, útil en planificación de inventario o capacidad.
- Estimación numérica acotada: para valores dentro de un rango declarado (`min`/`max`), el modelo produce estimaciones con cuantiles, adecuado para escenarios donde no se busca un valor exacto sino una distribución.
- Enriquecimiento de datos en pipelines ETL: la salida estructurada con `valid`, `complete`, `confidence` y `p_null` permite aplicar umbrales de aceptación por aplicación y descartar extracciones de baja confianza antes de persistir en base de datos.
- Automatización de atención al cliente con extracción de entidades: a partir de conversaciones multi-turno serializadas como estado, se pueden extraer campos como fechas, importes o referencias de pedido, con control de truncamiento para detectar entradas demasiado largas.
- Moderación y validación de documentos: el modo `source_only` restringe la respuesta a valores literalmente impresos en la fuente, reduciendo el riesgo de valores inventados en tareas de verificación documental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 9.653.104.368 parámetros en safetensors y un repositorio de 19,6 GB, la inferencia en precisión nativa requiere más memoria que el tamaño del repositorio; no se documentan cuantizaciones oficiales.
- GPU recomendadas: no disponible. El ejemplo de la model card usa `device="cuda"` sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: PyTorch y Transformers con el helper Python `systemone`; `xgrammar` para restricciones de esquema mediante procesador de logits. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.
- Límites de entrada: 4 MiB por entrada embebida y 8 MiB combinados; máximo de cuatro imágenes o páginas renderizadas por petición; no se aceptan URLs de medios remotos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Clairic Flash | 9.653.104.368 | no disponible | Extracción estructurada multimodal con esquema tipado | Apache 2.0 | Hugging Face (Cloudflare/clairic-flash) |
| Clairic | no disponible | no disponible | Extracción estructurada; otro modelo de la familia Clairic | no disponible | Hugging Face (Cloudflare/clairic) |
| Qwen/Qwen3.5-9B | no disponible | no disponible | Modelo base multimodal de propósito general | no disponible | Hugging Face (Qwen/Qwen3.5-9B) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Las puntuaciones devueltas son probabilidades del modelo y deben calibrarse con umbrales de aceptación propios de cada aplicación; no deben interpretarse como garantías de corrección.
- Es necesario inspeccionar el indicador `truncated` y los indicadores de completitud antes de confiar en un resultado, ya que la entrada puede haberse recortado.
- La evidencia textual solo incluye spans de caracteres cuando la coincidencia es única; en evidencia ambigua o solo de imagen los spans son nulos, lo que dificulta la auditoría.
- No se aceptan URLs de medios remotos; las imágenes y documentos deben enviarse embebidos, con límites de 4 MiB por entrada y 8 MiB combinados.
- El límite de cuatro imágenes o páginas renderizadas restringe el procesamiento de documentos extensos en una sola petición.
- No se documentan los idiomas soportados, lo que impide garantizar cobertura multilingüe.
- No se documentan sesgos conocidos ni evaluaciones de alucinación; el modo `knowledge: true` permite respuestas basadas en conocimiento del modelo, lo que introduce riesgo de valores no presentes en la fuente.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de código personalizado (`custom-code`) cuyo mantenimiento y compatibilidad futura con Transformers no está garantizado.
- El helper Python lanza errores de validación, de cola llena en peticiones simultáneas y de inferencia; en producción es necesario gestionar estos fallos y las colas.
- El uso de tokens incluye reintentos y trabajo suplementario, por lo que el coste real puede superar el de una única pasada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cloudflare/clairic-flash
- Modelo Clairic (familia): https://huggingface.co/Cloudflare/clairic
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Cloudflare: https://www.cloudflare.com/
- Cloudflare (francés): https://www.cloudflare.com/fr-fr/
- Cloudflare Dashboard: https://dash.cloudflare.com/login
- Cloudflare en Wikipedia: https://fr.wikipedia.org/wiki/Cloudflare
