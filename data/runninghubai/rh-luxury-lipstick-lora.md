# RunningHubAI/rh-luxury-lipstick-lora

## Resumen

rh-luxury-lipstick-lora es un adaptador LoRA para edición de imágenes condicionada por texto (pipeline `image-text-to-image`), publicado en HuggingFace por RunningHubAI a partir de un modelo base identificado como "krea2". No se trata de un modelo de lenguaje ni de un modelo fundacional: es un peso adicional de 218 MiB que se carga sobre un modelo de difusión existente para modificar su comportamiento generativo en un dominio visual muy concreto.

El adaptador está empaquetado para su uso en ComfyUI y en la plataforma RunningHub, y el autor original del entrenamiento aparece vinculado a un usuario de dicha plataforma. El repositorio es de tipo promocional/distribución: la model card no documenta hiperparámetros de entrenamiento, composición del dataset, resolución nativa ni parámetros de inferencia recomendados.

Su relevancia es limitada fuera del nicho de generación de imágenes con ComfyUI: sirve como ejemplo de la categoría de LoRAs de estilo/contenido específico que se distribuyen vía plataformas de entrenamiento como servicio, y su interés técnico radica en la integración con el ecosistema ComfyUI más que en aportaciones arquitectónicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base de difusión identificado como "krea2" |
| Parametros totales | no disponible (peso de 218 MiB en safetensors; número de parámetros no documentado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts dependen del codificador de texto del modelo base) |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (`EXTRAVAGANZZA_BLOWJOB_epoch_10.safetensors`) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para adaptar su distribución de salida sin reentrenar los pesos completos. El modelo base declarado es "krea2", sin que la información proporcionada especifique su arquitectura interna (UNet, DiT u otra), su resolución de entrenamiento ni su codificador de texto. El nombre del fichero (`epoch_10`) sugiere un checkpoint correspondiente a la décima época de un entrenamiento supervisado sobre un dataset de imágenes, pero no se documentan número de pasos, learning rate, rango del LoRA, resolución de las muestras ni técnica de regularización.

No hay información sobre el dataset de entrenamiento, sobre si se empleó captions automáticos o manuales, ni sobre validación. Tampoco se documenta ninguna innovación técnica: el valor del artefacto es puramente aplicado y depende enteramente de las capacidades del modelo base sobre el que se cargue.

## Capacidades

- Adaptación de un modelo de difusión base para generar o editar imágenes con una estética y un contenido concretos (maquillaje de lujo, según el nombre del repositorio).
- Funciona como adaptador de edición imagen-texto: recibe una imagen de entrada y una instrucción textual, y produce una imagen modificada.
- Integración nativa con ComfyUI mediante el nodo de carga de LoRA.
- Compatible con la plataforma RunningHub, que permite cargarlo y ejecutarlo en línea o vía API.
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: no es un modelo de lenguaje.
- No dispone de modo "thinking", visión general, audio ni capacidades multilingües documentadas más allá de las que herede el codificador de texto del modelo base.

## Casos de uso

- Pruebas de concepto de edición de maquillaje en retrato: cargar el LoRA en ComfyUI sobre el modelo base y aplicar instrucciones de texto para modificar el acabado de labios en una fotografía, útil para maquetas de campañas de cosmética antes de una sesión real.
- Prototipado de catálogos de producto cosmético: generar variantes visuales de un mismo rostro con distintos acabados para revisión interna de dirección de arte, siempre que se valide el resultado con el modelo base adecuado.
- Automatización de variantes en pipelines de contenido para redes: integrar el LoRA en un flujo de ComfyUI que produzca varias salidas por prompt y seleccionar las válidas manualmente.
- Investigación comparativa de LoRAs: usar este adaptador como muestra de referencia en estudios sobre cómo distintos LoRAs alteran la fidelidad de identidad y la coherencia anatómica del modelo base.
- Docencia y demostración de ComfyUI: ejemplo mínimo de carga de un LoRA de 218 MiB para explicar el flujo de trabajo de adaptadores en modelos de difusión.
- Integración vía API de RunningHub: para equipos que ya operan en esa plataforma y quieren invocar el adaptador sin gestionar infraestructura propia de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas (FID, CLIP score, similitud de identidad) ni comparaciones cuantitativas con otros LoRAs.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; depende por completo del modelo base "krea2" sobre el que se cargue el adaptador. El LoRA en sí ocupa 218 MiB en disco y un consumo de VRAM del mismo orden al cargarse.
- GPU recomendadas: no disponibles en la información proporcionada; vienen determinadas por el modelo base, no por el LoRA.
- Viabilidad en GPU de consumo: no confirmada; el peso del adaptador es pequeño, pero el modelo base puede no caber en GPUs de gama de consumo.
- Opciones de despliegue: ComfyUI (soporte nativo declarado), plataforma RunningHub (ejecución en línea y API). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a modelos de difusión de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-luxury-lipstick-lora | LoRA sobre modelo de difusión | no disponible (218 MiB) | no aplica | no disponible | HuggingFace, RunningHub, ComfyUI |
| LoRAs de estilo en Civitai | LoRA sobre modelo de difusión | variable, no documentado | no aplica | variable según autor | Civitai, HuggingFace |
| Adaptadores oficiales del modelo base "krea2" | LoRA / fine-tune | no disponible | no aplica | según modelo base | según distribución del modelo base |

No se dispone de datos de rendimiento comparables entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está especificada en el repositorio: la model card remite a la licencia del proyecto original o upstream, por lo que el uso comercial no está garantizado y requiere verificación previa con el autor.
- El repositorio enlaza a un modelo alojado en Civitai cuyo nombre y temática sugieren contenido para adultos; conviene revisar el origen y las condiciones de uso antes de integrarlo en productos comerciales o en entornos con requisitos de moderación.
- Riesgo de alucinación visual: como todo adaptador de difusión, puede generar anatomías incorrectas, artefactos en manos y rostros, o inconsistencias entre la instrucción de texto y la imagen resultante.
- Sesgos: no documentados, pero heredados del dataset de entrenamiento y del modelo base; el dominio (cosmética de lujo) puede sobrerrepresentar ciertos tonos de piel, géneros y cánones estéticos.
- Dependencia total del modelo base: sin la versión correcta de "krea2", el LoRA puede no cargar o producir resultados degradados; no se especifica la versión exacta ni el hash del checkpoint base.
- Ausencia de documentación de entrenamiento: sin hiperparámetros, dataset ni parámetros de inferencia recomendados, la reproducibilidad es nula.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- No apto para tareas de texto, razonamiento, código ni agentes: es exclusivamente un adaptador de imagen.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/RunningHubAI/rh-luxury-lipstick-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2072624471743221762
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/2041030036219498497
- Origen declarado en Civitai: https://civitai.red/models/2747780/extravaganzza-blowjob?modelVersionId=3090930
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
