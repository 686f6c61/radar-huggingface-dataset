# Comfy-Org/sam3.1

## Resumen

Comfy-Org/sam3.1 es un repositorio de redistribución de los pesos de SAM 3.1 (Segment Anything Model 3.1) de Meta, empaquetados en un único archivo `safetensors` en fp16 para su uso directo en ComfyUI. No se trata de un modelo nuevo ni de un fine-tune: el autor (Comfy-Org) toma el modelo original de `facebook/sam3.1` y lo reempaqueta con el formato `diffusion-single-file` que espera el nodo de carga de checkpoints de ComfyUI, de modo que los usuarios puedan ejecutar segmentación de imagen y vídeo sin gestionar el repositorio original ni sus dependencias.

El modelo subyacente es un segmentador promptable: dado un estímulo (punto, caja, máscara o prompt textual, según la versión) devuelve máscaras de segmentación de alta calidad, y en SAM 3.1 se extiende al dominio del vídeo con propagación temporal de máscaras. Es relevante para desarrolladores que construyen pipelines de edición, anotación o composición de imagen y vídeo dentro de ComfyUI, porque integra una capacidad de segmentación de propósito general con una interfaz de nodos ya existente.

La información pública disponible sobre este repositorio es escasa: la model card se limita a instrucciones de instalación y a enlazar dos plantillas de workflow (segmentación de imagen y de vídeo). No se publican en la información proporcionada el número de parámetros, la longitud de contexto, los idiomas ni resultados de benchmarks, por lo que esos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: facebook/sam3.1, segmentador promptable) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (único peso publicado en este repo: `sam3.1_multiplex_fp16.safetensors`) |
| Idiomas soportados | no disponible |
| Licencia | sam-license (etiquetada como `other` / `license: other` en Hugging Face) |
| Formato de pesos | safetensors, archivo único (`diffusion-single-file`) para ComfyUI |

## Arquitectura y entrenamiento

No se dispone en la información proporcionada de detalles sobre la arquitectura interna de SAM 3.1 (tipo de backbone, mecanismo de atención, resolución de entrada o diseño del decoder de máscaras). El repositorio es una redistribución: el entrenamiento, los datos y el proceso de ajuste corresponden al modelo original de Meta alojado en `facebook/sam3.1`, y esta model card no los documenta.

Lo que sí se conoce por la model card es el empaquetado: un solo archivo `sam3.1_multiplex_fp16.safetensors` de aproximadamente 1,7 GB de repositorio, en precisión fp16, colocado en `ComfyUI/models/checkpoints/`. El pipeline declarado es `diffusion-single-file`, etiqueta que ComfyUI usa para archivos de pesos únicos cargables por sus nodos, aunque en este caso el modelo no es generativo de difusión sino de segmentación. Se incluyen dos plantillas oficiales de workflow: `utility_image_segment_sam3.json` y `utility_video_segment_sam3.json`.

## Capacidades

- Segmentación de imagen promptable: generación de máscaras a partir de estímulos del usuario mediante el workflow `Image Segmentation: SAM3`.
- Segmentación de vídeo con propagación de máscaras a lo largo de la secuencia temporal, mediante el workflow `Video Segmentation: SAM3`.
- Integración nativa con ComfyUI como checkpoint único, sin necesidad de descargar el repositorio original de Meta.
- Uso como etapa de preprocesado en pipelines de edición: extracción de máscaras para inpainting, composición o rotoscopia.
- No consta soporte de tool calling, function calling, agentes ni razonamiento multi-step; no es un modelo de lenguaje.
- No consta soporte multilingüe ni modo de razonamiento (thinking mode); no se documentan capacidades de audio.

## Casos de uso

- Rotoscopia y segmentación de vídeo en postproducción: cargando `sam3.1_multiplex_fp16.safetensors` en el nodo de checkpoint y usando la plantilla `utility_video_segment_sam3.json`, se propaga una máscara inicial a lo largo de los fotogramas para aislar un sujeto sin keying manual.
- Inpainting y sustitución de fondos: la máscara generada por SAM 3.1 se conecta como entrada de máscara a los nodos de inpainting de ComfyUI, de modo que la edición queda restringida a la región segmentada.
- Anotación de datasets de visión por computador: uso del workflow de imagen para generar máscaras preliminares sobre lotes de imágenes, que después se revisan y corrigen manualmente, reduciendo el coste de etiquetado.
- Composición y montaje en flujos de generación de imagen: separar sujeto y fondo para recomponerlos con modelos generativos dentro del mismo grafo de ComfyUI, sin salir de la aplicación.
- Segmentación interactiva en herramientas internas: al ser un único archivo safetensors, se puede empaquetar en una instalación de ComfyUI distribuida al equipo y servir como utilidad común de segmentación.
- Extracción de regiones para análisis posterior: generar máscaras de objetos concretos y pasarlas a etapas de medición, conteo o clasificación en un pipeline de visión artificial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 1,7 GB, con un único archivo fp16; el peso en VRAM del checkpoint es del orden de esa cifra más el overhead de activaciones y del decoder de máscaras, que no se documenta.
- GPU recomendadas: no disponibles en la información proporcionada. Al ser un modelo de segmentación de tamaño moderado, es previsible que quepa en GPUs de consumo, pero no se confirma con datos del autor.
- Despliegue: ComfyUI, colocando el archivo en `ComfyUI/models/checkpoints/` y usando las plantillas oficiales de segmentación de imagen y vídeo.
- No se documentan opciones para vLLM, llama.cpp, Ollama o TGI; no aplican a un modelo de segmentación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Comfy-Org/sam3.1 | no disponible | no disponible | Segmentación de imagen y vídeo | sam-license | Hugging Face (repo de reempaquetado) |
| facebook/sam3.1 | no disponible | no disponible | Segmentación de imagen y vídeo | sam-license | Hugging Face (repo original) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos alternativos que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Este repositorio no es el modelo canónico: es un reempaquetado de Comfy-Org. Para documentación técnica, datos de entrenamiento o soporte oficial, debe consultarse `facebook/sam3.1`.
- La licencia es `sam-license`, no una licencia de código abierto estándar; las condiciones de uso comercial deben verificarse en el archivo `LICENSE` del repositorio antes de desplegar en producción.
- Solo se publica un peso en fp16; no hay variantes cuantizadas en este repo, lo que limita el ajuste fino de memoria en hardware restringido.
- No se documentan sesgos, tasas de error ni comportamiento en dominios difíciles (oclusión, objetos pequeños, vídeo de baja calidad); deben evaluarse empíricamente antes de usarlo en producción.
- Al ser un modelo de segmentación, no genera texto ni razona: no debe emplearse como sustituto de un LLM en tareas de comprensión o generación.
- El pipeline declarado (`diffusion-single-file`) es una etiqueta de compatibilidad con ComfyUI, no indica que el modelo sea de difusión; puede inducir a confusión al filtrar repositorios.
- No se especifican los idiomas ni si los prompts textuales (si el modelo los admite) funcionan en castellano.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Comfy-Org/sam3.1
- Modelo original: https://huggingface.co/facebook/sam3.1
- ComfyUI (GitHub): https://github.com/Comfy-Org/ComfyUI
- Workflow de segmentación de imagen: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_image_segment_sam3.json
- Workflow de segmentación de vídeo: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_video_segment_sam3.json
- Repositorio de plantillas de workflow: https://github.com/Comfy-Org/workflow_templates
