# RunningHubAI/rh-lok-lora

## Resumen

rh-lok-lora es un adaptador LoRA de generación de imágenes (text-to-image) publicado por RunningHubAI bajo la autoría de RunningHub-@乐导AIGC. Su función concreta es la unificación de rostros ("洛神, 统一人脸", es decir, "Luo Shen, rostro unificado"): el adaptador se aplica sobre un modelo base para forzar la coherencia facial de un mismo personaje a lo largo de distintas generaciones. No es un modelo completo, sino un delta de pesos de 81 MiB que debe cargarse junto al modelo base sobre el que fue entrenado.

El adaptador se ha afinado a partir de Z-Image, un modelo de difusión para generación de imágenes, y se distribuye en formato `.safetensors` para su uso en ComfyUI, en la plataforma RunningHub y en Hugging Face. La palabra de activación documentada es `lok`. El repositorio es de tamaño reducido (0,1 GB) y contiene un único archivo de pesos.

La relevancia práctica del artefacto es acotada: se trata de un LoRA de nicho orientado a mantener la identidad de un personaje concreto en flujos de trabajo de ComfyUI. No hay información publicada sobre el dataset de entrenamiento, la licencia de uso comercial ni métricas de calidad; el autor indica únicamente que las consultas de licencia comercial deben dirigirse a él directamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusión Z-Image |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a modelos text-to-image) |
| Tipos de cuantización | no disponible (pesos distribuidos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible; copyright del autor, contacto directo para uso comercial |
| Formato de pesos | safetensors (`20260413-lok_000001500.safetensors`, 81 MiB) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para modificar su comportamiento sin reentrenar todos los pesos. El modelo base declarado es Z-Image, sobre el que se ha realizado un fine-tuning orientado a la unificación de rostros. El nombre del archivo (`20260413-lok_000001500.safetensors`) sugiere un checkpoint en el paso 1500 de entrenamiento, aunque esta interpretación no está confirmada en la model card.

No se han publicado detalles sobre el volumen o la composición del dataset de entrenamiento, la resolución de las imágenes, el número de pasos, la tasa de aprendizaje ni si se emplearon técnicas de regularización o de captions automáticos. Tampoco hay información sobre el rango del LoRA ni sobre qué módulos del modelo base se ven afectados. La model card únicamente documenta la palabra de activación (`lok`) y el modelo de origen.

## Capacidades

- Generación de imágenes condicionada por texto mediante el modelo base Z-Image, con el adaptador aplicado.
- Unificación y consistencia facial: el propósito declarado del LoRA es mantener el mismo rostro entre generaciones.
- Activación mediante la palabra clave `lok` en el prompt.
- Integración en flujos de ComfyUI y en la plataforma RunningHub.
- Compatible con la API de RunningHub para ejecución remota.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento, por tratarse de un modelo de imagen.

## Casos de uso

- Creación de personajes consistentes en cómics o storyboards: aplicar el LoRA con la palabra `lok` en cada viñeta permite mantener el mismo rostro del protagonista a lo largo de una secuencia de imágenes generadas en ComfyUI.
- Ilustración de marca con mascota fija: una empresa puede generar variaciones de escena, vestuario o iluminación conservando la identidad facial de su mascota o embajador visual.
- Generación de avatares y retratos de perfil: útil para producir múltiples retratos coherentes de un mismo personaje para redes sociales o documentación interna.
- Previsualización de personajes en preproducción audiovisual: el equipo de arte puede iterar sobre diseños de personaje manteniendo la cara estable entre propuestas de vestuario y entorno.
- Contenido para videojuegos indie: generación de retratos de PNJ o del protagonista con consistencia facial para fichas de personaje y diálogos ilustrados.
- Flujos automatizados vía API de RunningHub: integración del LoRA en un pipeline de generación por lotes donde se requiera coherencia de identidad entre imágenes, sin necesidad de infraestructura GPU propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende enteramente del modelo base Z-Image y de la resolución de generación, no del LoRA (81 MiB de pesos adicionales).
- GPU recomendadas: no disponible; condicionadas por Z-Image.
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo base.
- Opciones de despliegue: ComfyUI (soporte nativo de LoRA), plataforma RunningHub (incluida su API) y carga directa desde Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros LoRA de unificación facial ni datos comparables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No se especifica la licencia: el uso comercial requiere contactar con el autor, según indica la propia model card.
- No hay información sobre sesgos del dataset de entrenamiento ni sobre la diversidad de rostros cubiertos.
- Riesgo de sobreajuste al rostro concreto con el que se entrenó el LoRA; puede degradar la variedad facial si se aplica fuera de su dominio previsto.
- La calidad y el comportamiento dependen críticamente del modelo base Z-Image y de la versión concreta de este; no se documenta compatibilidad con otras bases.
- Ausencia total de métricas, demos y ejemplos en la model card, lo que impide evaluar la fidelidad real del adaptador antes de probarlo.
- El repositorio no registra descargas ni valoraciones (0 descargas, 0 likes en el momento de la consulta), por lo que no hay señal de validación por parte de la comunidad.
- No se documentan limitaciones idiomáticas ni de resolución; se desconoce si los prompts deben formularse en inglés, chino u otro idioma.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-lok-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2043622074459099138
- Página del autor: https://www.runninghub.cn/user-center/1951923163988975617
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
