# Cierpliwy/krea2_lineart_edit

## Resumen

`Cierpliwy/krea2_lineart_edit` es un adaptador LoRA de edición y generación text-to-image publicado por el usuario Cierpliwy sobre el modelo base `krea/Krea-2-Raw`. El repositorio está etiquetado con la librería `diffusers`, la pipeline `text-to-image` y la plantilla `template:diffusion-lora`, y su propósito declarado por el autor es trabajar con lineart realista, concretamente combinado con el preprocesador Realistic Lineart de `comfyui_controlnet_aux`.

Se trata de un artefacto de la familia de adaptadores de bajo rango (LoRA), no de un modelo fundacional completo: el repositorio ocupa aproximadamente 0,9 GB y no define un `instance_prompt` ni una palabra de activación, por lo que la invocación depende del flujo de trabajo en el que se inserte. El autor indica explícitamente que la inferencia debe realizarse con `ComfyUI-Krea2-Ostris-Edit`, lo que sitúa el uso previsto dentro del ecosistema ComfyUI y no en pipelines genéricos de `diffusers` sin adaptación.

Su relevancia es limitada y muy específica: es un LoRA recién publicado (creado y actualizado el 14 de septiembre de 2026), con 0 descargas y 2 likes en el momento de redactar esta ficha, orientado a flujos de ilustración y line art sobre el modelo Krea 2 Raw. No se dispone de información pública verificable sobre arquitectura del base, datos de entrenamiento, hiperparámetros del LoRA ni evaluaciones cuantitativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusión text-to-image; arquitectura interna del base `krea/Krea-2-Raw` no disponible |
| Parametros totales | no disponible (el repositorio ocupa 0,9 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusion guiado por prompt, no un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | `krea-2-community-license` (etiquetada como `license:other`); texto en https://huggingface.co/krea/Krea-2-Raw/blob/main/LICENSE.pdf |
| Formato de pesos | no disponible en detalle; libreria declarada `diffusers` (pesos de adaptador LoRA) |

## Arquitectura y entrenamiento

La información disponible describe un adaptador LoRA para generación y edición de imagen condicionada por texto, construido sobre el modelo base `krea/Krea-2-Raw`. No se documentan en la model card ni en los metadatos del repositorio el número de parámetros del adaptador, el rango (rank) y alpha empleados, las capas objetivo, la resolución de entrenamiento ni la composición del dataset. Tampoco se especifica si hubo etapas de ajuste adicionales, regularización o destilación.

El único detalle técnico operativo que aporta el autor es el modo de uso previsto: inferencia mediante `ComfyUI-Krea2-Ostris-Edit` y combinación con el preprocesador Realistic Lineart de `comfyui_controlnet_aux`. Esto sugiere un flujo de trabajo de tipo edición guiada por estructura (line art como condición de control) más que una generación puramente textual, pero no se detalla la arquitectura concreta del mecanismo de condicionamiento.

## Capacidades

- Generacion de imagenes a partir de prompts de texto, heredada del modelo base `krea/Krea-2-Raw`.
- Edicion de imagenes y extraccion o preservacion de line art realista, segun el proposito declarado del LoRA.
- Integracion con preprocesadores de control (Realistic Lineart de `comfyui_controlnet_aux`) para condicionar la generacion por estructura de lineas.
- Uso previsto dentro de flujos ComfyUI mediante `ComfyUI-Krea2-Ostris-Edit`.
- Compatibilidad declarada con la libreria `diffusers` a nivel de metadatos y formato de repositorio.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento; no aplican a un modelo de difusion de imagen.
- No se documenta soporte multilingue de prompts ni un `instance_prompt` o palabra de activacion.

## Casos de uso

- Extraccion de line art para produccion de ilustracion: el LoRA se combina con el preprocesador Realistic Lineart para obtener bocetos de linea a partir de imagenes o para generarlas condicionadas, dentro de un flujo ComfyUI.
- Coloreado de line art existente: partiendo de un dibujo de lineas, el adaptador permite generar la version coloreada manteniendo la estructura original marcada por la condicion de control.
- Edicion de ilustraciones manteniendo la estructura: para variaciones de estilo, iluminacion o materiales sin redibujar las lineas base.
- Produccion de manga, comic o webcomic: generacion de paginas o paneles coherentes con un boceto previo, usando el line art como guia estructural.
- Concept art y previsualizacion: iteracion rapida sobre bocetos de linea para explorar acabados antes de la fase de pintado final.
- Ilustracion de producto o tecnica: conversion de bocetos de linea a representaciones mas realistas cuando se combina con el preprocesador de lineart realista indicado por el autor.
- Pipelines de generacion por lotes en ComfyUI: automatizacion de la conversion boceto-a-imagen en entornos de estudio con grafos reutilizables, siempre que el modelo base y los nodos personalizados esten instalados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas cuantitativas (FID, CLIP score, evaluaciones de fidelidad estructural) ni comparaciones numéricas con otros adaptadores.

## Requisitos de hardware

- El repositorio del adaptador ocupa aproximadamente 0,9 GB en disco.
- La VRAM necesaria para inferencia viene determinada por el modelo base `krea/Krea-2-Raw`, cuyos requisitos no están documentados en la información disponible.
- No se publican recomendaciones de GPU (A100, H100, RTX 4090 u otras) para este adaptador.
- No se puede confirmar si el conjunto (base más LoRA) cabe en GPU de consumo; dato no disponible.
- Despliegue previsto: ComfyUI con el nodo `ComfyUI-Krea2-Ostris-Edit` y, para el preprocesado, `comfyui_controlnet_aux` con Realistic Lineart. La librería declarada del repositorio es `diffusers`; no aplican servidores de inferencia de lenguaje como vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificables sobre adaptadores LoRA equivalentes para el modelo base Krea 2, ni de métricas comparables con alternativas de otras familias (SDXL, Flux u otras) en la información proporcionada.

| Modelo | Base | Tipo | Licencia | Datos comparativos |
|---|---|---|---|---|
| `Cierpliwy/krea2_lineart_edit` | `krea/Krea-2-Raw` | LoRA text-to-image / edicion con line art | `krea-2-community-license` | no disponible |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No hay resultados de benchmarks ni evaluaciones cualitativas publicadas por el autor más allá de la imagen de ejemplo del widget.
- El autor no define `instance_prompt` ni palabra de activación; la forma correcta de invocarlo queda sin documentar.
- La inferencia requiere un nodo de ComfyUI específico (`ComfyUI-Krea2-Ostris-Edit`) y un preprocesador externo, por lo que no es un adaptador portable a cualquier pipeline de `diffusers` sin trabajo adicional.
- El rendimiento depende por completo del modelo base `krea/Krea-2-Raw`; cualquier limitación de este (sesgos del dataset de entrenamiento, estilo, idiomas de prompt) se hereda.
- Licencia `krea-2-community-license`: es una licencia de tipo comunitario, no una licencia de código abierto estándar. Antes de cualquier uso comercial es imprescindible revisar el PDF de licencia del modelo base; no se pueden asumir permisos de uso comercial.
- Riesgo de alucinacion visual: como modelo generativo de imagen, puede producir detalles estructuralmente inconsistentes respecto al line art de entrada, especialmente en trazos finos, texto o geometrías complejas.
- Sesgos conocidos: no disponibles; dependen del dataset del modelo base, no documentado en esta ficha.
- Idiomas soportados en el prompt: no disponible.
- Métricas de adopción muy bajas (0 descargas, 2 likes al momento del registro), lo que implica ausencia de validación por parte de la comunidad y de casos de uso verificados en producción.
- Fecha de creación y actualización muy reciente (14 de septiembre de 2026), con posibilidad de cambios posteriores en el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Cierpliwy/krea2_lineart_edit
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Licencia del modelo base: https://huggingface.co/krea/Krea-2-Raw/blob/main/LICENSE.pdf
- Nodo de inferencia indicado por el autor: https://github.com/ostris/ComfyUI-Krea2-Ostris-Edit
- Preprocesador Realistic Lineart: https://github.com/Fannovel16/comfyui_controlnet_aux
- Resultados de busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a paginas de descarga del navegador Google Chrome y no guardan relacion con el modelo.
