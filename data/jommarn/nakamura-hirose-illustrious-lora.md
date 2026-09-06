# Jommarn/nakamura-hirose-illustrious-lora

## Resumen

El modelo `nakamura-hirose-illustrious-lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por Jommarn para el modelo de difusión `Illustrious-XL v2.0-STABLE`. Está diseñado para generar imágenes de dos personajes específicos, Hirose y Nakamura, con un enfoque en interacciones entre dos hombres (2boys) y contenido NSFW explícito. El adaptador se entrenó durante 1.200 pasos en una GPU Modal Cloud L4, según indica el autor en la model card.

Este tipo de adaptadores permite personalizar modelos de difusión sin necesidad de reentrenar el modelo completo, lo que resulta útil para la comunidad de ilustración digital. Al estar disponible en HuggingFace, puede integrarse en pipelines de diffusers para generar imágenes con los rasgos de los personajes mediante palabras clave específicas.

En cuanto a la arquitectura, se trata de un LoRA que se aplica sobre el modelo base `OnomaAIResearch/Illustrious-XL-v2.0`. No se dispone de información sobre el número de parámetros del adaptador ni sobre la longitud de contexto, ya que no es un modelo de lenguaje. El repositorio tiene un tamaño de 11,6 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre modelo de difusión (Illustrious-XL v2.0) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | other |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, que modifica los pesos de un modelo de difusión preexistente. En este caso, el modelo base es `Illustrious-XL v2.0-STABLE`, un modelo de texto a imagen. El entrenamiento se realizó durante 1.200 pasos en una GPU Modal Cloud L4, según la model card. No se especifica la composición del dataset de entrenamiento, aunque los trigger words y los ejemplos sugieren que se utilizaron imágenes de los personajes Hirose y Nakamura con etiquetas descriptivas.

No se mencionan técnicas de alineación como RLHF o DPO, ni innovaciones técnicas destacables más allá de la adaptación de bajo rango. El repositorio incluye ejemplos de prompts y negative prompts, así como parámetros de generación recomendados (steps, CFG, peso del LoRA, sampler).

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) mediante la biblioteca diffusers.
- Activación de los personajes Hirose y Nakamura mediante los trigger words `hirose (character)` y `nakamura (character)`.
- Interacciones entre dos personajes con el trigger `2boys`.
- Generación de contenido NSFW explícito con anatomía detallada, según los prompts de ejemplo.
- Ajuste de la fidelidad mediante el peso del LoRA (recomendado 0.8-1.0), steps y CFG.
- No soporta tool calling, razonamiento, agentes ni otras capacidades de modelos de lenguaje; es exclusivamente un modelo de texto a imagen.

## Casos de uso

- Ilustración de fan art yaoi: el modelo permite generar escenas íntimas entre Hirose y Nakamura con un estilo anime coherente, usando los trigger words y el peso del LoRA recomendado.
- Creación de cómics o doujinshi: gracias a la capacidad de generar interacciones 2boys, puede usarse para producir viñetas de temática adulta con los dos personajes.
- Personalización de personajes en pipelines de diffusers: el LoRA puede cargarse junto al modelo base en scripts de Python para generar imágenes en lote con distintas semillas y parámetros.
- Experimentación con parámetros de generación: los usuarios pueden ajustar steps, CFG y peso del LoRA para estudiar cómo afectan a la fidelidad de los personajes y a la calidad de la imagen.
- Generación de variaciones de pose y entorno: al cambiar el prompt, se pueden obtener diferentes escenarios (playa, interior, etc.) manteniendo los rasgos de los personajes.
- Uso como ejemplo en investigación sobre adaptación de bajo rango: este modelo puede servir como caso práctico de LoRA para modelos de difusión, aunque su contenido NSFW limita su uso en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se proporcionan requisitos de hardware en la información disponible.
- El entrenamiento se realizó en una GPU Modal Cloud L4, lo que puede servir como referencia orientativa para la inferencia.
- El despliegue se realiza mediante la biblioteca diffusers de HuggingFace, ya que es la librería indicada en el repositorio.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos similares.

## Limitaciones y advertencias

- Contenido NSFW explícito: el modelo está orientado a generar imágenes sexualmente explícitas, lo que puede contravenir las políticas de uso de muchas plataformas.
- Licencia "other": los términos exactos de la licencia no están especificados en la información disponible; es necesario revisar el repositorio antes de cualquier uso comercial.
- Dependencia del modelo base: el LoRA requiere `OnomaAIResearch/Illustrious-XL-v2.0` para funcionar; no es un modelo autónomo.
- Fidelidad de los personajes: la generación depende del uso correcto de los trigger words; pueden aparecer artefactos como manos deformadas o anatomía incorrecta, tal como indican los negative prompts recomendados.
- Sin evaluaciones de seguridad ni benchmarks: no se han publicado estudios sobre sesgos, alucinaciones o riesgos asociados al contenido generado.
- Idiomas: no se documenta soporte multilingüe; los prompts de ejemplo están en inglés.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Jommarn/nakamura-hirose-illustrious-lora
- Modelo base: https://huggingface.co/OnomaAIResearch/Illustrious-XL-v2.0
- Ejemplo de generación (imagen): https://huggingface.co/Jommarn/nakamura-hirose-illustrious-lora/resolve/main/example.webp
- Ejemplo de generación 2: https://huggingface.co/Jommarn/nakamura-hirose-illustrious-lora/resolve/main/example2.webp
