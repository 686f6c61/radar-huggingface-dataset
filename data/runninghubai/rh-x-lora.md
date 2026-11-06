# RunningHubAI/rh-x-lora

## Resumen

rh-x-lora es un adaptador LoRA para edición y generación de imágenes condicionada por texto, publicado en Hugging Face por RunningHubAI (RunningHub). No se trata de un modelo fundacional completo, sino de un conjunto de pesos de ajuste fino (55 MiB, un único archivo `xray-krea2_V1.safetensors`) que se aplica sobre el modelo base krea2. Su función concreta es introducir un estilo visual muy específico: imágenes con efecto de rayos X, gafas de rayos X y teléfonos móviles con efecto de rayos X, activadas mediante las palabras de activación `POV xray glasses` y `POV holding xray smartphone`.

El modelo está empaquetado para su uso en ComfyUI y en la plataforma RunningHub, y su pipeline declarado es `image-text-to-image`, es decir, generación de imagen a partir de texto e imagen de referencia. La relevancia de esta ficha es limitada en términos de investigación: es un artefacto de personalización estética, no un modelo de propósito general. No se dispone de información sobre arquitectura del modelo base, número de parámetros, contexto, idiomas ni licencia explícita.

La información disponible es escasa y proviene casi exclusivamente de la model card del autor. Cualquier dato no documentado se indica como "no disponible" en lugar de inferirse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base krea2; arquitectura del base no disponible |
| Parámetros totales | no disponible (pesos LoRA de 55 MiB; el número de parámetros del adaptador no se especifica) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (se distribuye en safetensors; no se documentan variantes GGUF, FP8 ni cuantizaciones) |
| Idiomas soportados | no disponible (las palabras de activación están en inglés) |
| Licencia | no disponible; la model card indica que el copyright permanece con el autor y que se debe seguir la licencia del proyecto original o del upstream |
| Formato de pesos | safetensors (`xray-krea2_V1.safetensors`, 55 MiB) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del adaptador ni del modelo base krea2. Por la naturaleza del artefacto (un archivo LoRA de 55 MiB para un pipeline `image-text-to-image`), se trata de un ajuste de bajo rango sobre un modelo de difusión o de edición de imagen, pero la model card no especifica el tipo de backbone, el rango del adaptador, las capas objetivo ni la dimensión de los tensores.

Tampoco se documentan los datos de entrenamiento: no se indica el número de imágenes, la composición del dataset, si hubo curación manual, ni si se emplearon técnicas de regularización o de captions automáticos. No hay mención a RLHF, DPO ni a ningún proceso de alineación, lo cual es esperable en un adaptador estético de este tipo. La única información técnica relevante es el modelo de partida (krea2) y las dos palabras de activación que condicionan la generación.

## Capacidades

- Generación y edición de imágenes condicionada por texto e imagen de entrada (pipeline `image-text-to-image`).
- Aplicación de un estilo visual concreto de efecto rayos X sobre el modelo base krea2.
- Activación mediante las palabras clave `POV xray glasses` y `POV holding xray smartphone`.
- Integración en flujos de ComfyUI como nodo LoRA.
- Ejecución en la plataforma RunningHub, incluyendo su API.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking.
- Capacidades multilingües: no disponibles; las palabras de activación están en inglés.

## Casos de uso

- Ilustración editorial con estética de rayos X: aplicar el LoRA sobre krea2 en ComfyUI para generar imágenes de personajes con gafas de rayos X, útil en piezas de divulgación científica o ficción.
- Creación de contenido para redes sociales: generar escenas en primera persona (`POV`) con un teléfono móvil mostrando una vista de rayos X, un formato visual reconocible y de rápido consumo.
- Prototipado de conceptos para videojuegos o cómic: producir variaciones de un personaje con visión de rayos X para explorar direcciones de arte antes de encargar ilustración final.
- Pruebas de concepto en pipelines de imagen: usar el adaptador como ejemplo de LoRA estético dentro de un flujo ComfyUI para validar la integración de adaptadores y la gestión de palabras de activación.
- Generación por API en RunningHub: invocar el modelo a través de la API de la plataforma para producir lotes de imágenes con este estilo sin gestionar infraestructura propia.
- Exploración de personalización estética: servir como referencia para equipos que quieran entrenar sus propios LoRA de estilo sobre krea2 y comparar resultados con este adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende enteramente del modelo base krea2, cuyos requisitos no se documentan en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el adaptador en sí ocupa 55 MiB, pero el modelo base determina el requisito real.
- Opciones de despliegue: ComfyUI, plataforma RunningHub y su API. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables a este pipeline).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros adaptadores LoRA comparables ni datos de rendimiento que permitan una comparación rigurosa. Como referencia cualitativa, la model card enlaza el proyecto original en Civitai (`xray-glassessmartphone-krea-2`), que sería el punto de comparación natural, pero no se aportan métricas.

## Limitaciones y advertencias

- Información muy escasa: no se documentan arquitectura del base, parámetros, contexto, idiomas ni licencia, lo que dificulta evaluar su idoneidad en producción.
- Licencia no disponible: la model card remite a la licencia del proyecto original o del upstream; es imprescindible verificar los términos en Civitai y en la página de krea2 antes de cualquier uso comercial.
- Riesgo de sobreajuste estilístico: al ser un LoRA entrenado para un efecto muy concreto, puede degradar la calidad o la coherencia cuando se usa fuera de su dominio previsto.
- Dependencia de palabras de activación: el estilo solo se activa de forma fiable con `POV xray glasses` y `POV holding xray smartphone`; su uso fuera de esas frases puede producir resultados inconsistentes.
- Sesgos: no documentados, pero heredados del dataset de entrenamiento y del modelo base; no hay evaluación de sesgos disponible.
- Alucinación visual: como todo modelo generativo de imagen, puede producir anatomía, objetos o texto incoherentes, especialmente en escenas complejas.
- Restricciones de uso comercial: no verificables con la información disponible; se recomienda contactar con el autor o consultar la licencia upstream.
- Fecha de creación indicada como 2026-11-06, posterior a la fecha habitual de referencia; conviene confirmar la vigencia del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-x-lora
- Proyecto original en RunningHub: https://www.runninghub.ai/model/public/2077985381655613442
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/2041030036219498497
- Modelo original en Civitai: https://civitai.red/models/2784890/xray-glassessmartphone-krea-2?modelVersionId=3137593
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
