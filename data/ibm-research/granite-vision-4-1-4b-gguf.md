# ibm-research/granite-vision-4.1-4b-GGUF

## Resumen

Granite-vision-4.1-4b es un modelo multimodal (texto e imagen) desarrollado por IBM Research, distribuido originalmente en formato nativo y, en este repositorio, convertido a GGUF para su uso con llama.cpp. Forma parte de la familia Granite 4.1 y está pensado para tareas de comprensión de imágenes combinadas con generación de texto: descripción de imágenes, respuesta a preguntas visuales (VQA) y conversación multi-turno con entrada visual. Con aproximadamente 3.400 millones de parámetros, se posiciona en el segmento de modelos pequeños y desplegables en hardware modesto.

La relevancia de esta variante GGUF radica en que permite ejecutar un modelo de visión de IBM en CPU y GPU de consumo mediante llama.cpp, sin depender de infraestructura de servidor. El repositorio incluye los pesos cuantizados junto con un proyector de visión (`mmproj-model-bf16.gguf`) necesario para procesar imágenes, y soporta el endpoint compatible con la API de OpenAI de `llama serve`.

La licencia Apache 2.0 facilita su uso comercial y su integración en productos propietarios. La model card de este repositorio es mínima y remite a la del modelo base para especificaciones detalladas de entrenamiento, datos y evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal con proyector de visión; detalles en la model card del modelo base) |
| Parametros totales | 3.402.836.480 (~3,4 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con varias cuantizaciones; el ejemplo de la model card usa Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (incluye `mmproj-model-bf16.gguf` para el proyector de visión) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) en la información proporcionada. La model card de este repositorio remite explícitamente a la del modelo base `ibm-granite/granite-vision-4.1-4b` para esos detalles.

Lo que sí se conoce por esta ficha es el pipeline de despliegue: los pesos se han convertido a GGUF y se acompañan de un proyector de visión en precisión bf16, lo que confirma una arquitectura multimodal con codificador visual separado. La conversión se realizó con llama.cpp (build tag `b11798`) y Transformers `5.8.0`, y el modelo se etiqueta como `granite-4.1`, lo que lo vincula a la generación 4.1 de la familia Granite de IBM.

## Capacidades

- Comprensión de imágenes: descripción de imágenes y respuesta a preguntas sobre su contenido.
- Conversación multimodal: entrada de imagen más texto en formato de chat.
- Generación de texto condicionada por imagen.
- Integración con la API compatible con OpenAI a través de `llama serve` (`/v1/chat/completions`).
- Soporte de plantilla de chat Jinja (`--jinja`) en llama.cpp.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.
- Capacidades de audio o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Descripción automática de imágenes en catálogos o repositorios documentales: el modelo recibe una imagen y genera una descripción textual, útil para indexar y buscar contenido visual.
- Respuesta a preguntas visuales (VQA) en asistentes de accesibilidad: un usuario sube una imagen y formula preguntas en lenguaje natural sobre su contenido.
- Extracción de información de capturas y documentos escaneados: con `llama cli` o `llama serve` se puede enviar una página (`page.png`) y obtener texto descriptivo o respuestas sobre su contenido.
- Prototipado local de aplicaciones multimodales: al ser GGUF y ejecutable con llama.cpp, permite validar flujos de visión en un portátil o estación de trabajo sin GPU de datacenter.
- Servicio interno con API compatible con OpenAI: `llama serve` expone `/v1/chat/completions`, de modo que aplicaciones ya construidas contra la API de OpenAI pueden apuntar al endpoint local sin cambios de cliente.
- Moderación o anotación asistida de imágenes: generación de descripciones y respuestas estructuradas para revisión humana en pipelines de etiquetado.
- Integración en herramientas de escritorio o CLI: el uso de `llama cli` con `--image` facilita flujos interactivos de análisis de imágenes desde terminal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de ~3,4 B parámetros en Q8_0 ocupa del orden de 3,5-4 GB para los pesos, más el proyector de visión en bf16 y la caché KV; las cuantizaciones más bajas reducen el peso de los pesos, pero el dato exacto no está publicado.
- GPU recomendadas: no disponible en la información proporcionada.
- GPU de consumo: el tamaño del modelo (~3,4 B) y el formato GGUF sugieren viabilidad en GPU de consumo con memoria suficiente, pero no se confirma con datos del autor.
- Despliegue: llama.cpp, con `llama cli` y `llama serve` (endpoint compatible con OpenAI). El repositorio está etiquetado como `endpoints_compatible`.
- Requisito adicional: el proyector de visión `mmproj-model-bf16.gguf` debe cargarse junto con los pesos (`--mmproj`) para procesar imágenes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La model card de este repositorio es mínima y remite a la del modelo base; no se documentan aquí sesgos, datos de entrenamiento ni evaluación.
- Riesgo de alucinación inherente a los modelos generativos; en tareas de visión puede describir elementos no presentes en la imagen.
- Longitud de contexto e idiomas soportados no documentados en esta ficha; conviene consultar la model card del modelo base antes de usarlo en producción.
- Es necesario cargar el proyector de visión (`mmproj`) para que las imágenes se procesen; sin él, el modelo solo opera sobre texto.
- Las cuantizaciones bajas pueden degradar la calidad en tareas visuales de detalle; el ejemplo oficial usa Q8_0.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar los términos del modelo base y las obligaciones de atribución.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta; es una conversión reciente y poco validada por la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ibm-research/granite-vision-4.1-4b-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-vision-4.1-4b
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Documentación de `llama cli`: https://github.com/ggml-org/llama.cpp/blob/master/tools/cli/README.md
- Documentación de `llama serve`: https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md
