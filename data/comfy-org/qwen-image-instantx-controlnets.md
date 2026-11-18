# Comfy-Org/Qwen-Image-InstantX-ControlNets

## Resumen

Comfy-Org/Qwen-Image-InstantX-ControlNets es un repositorio de empaquetado de los ControlNets de InstantX para el modelo de difusion Qwen-Image, redistribuidos en formato de fichero unico (`diffusion-single-file`) para su uso directo en ComfyUI. No se trata de un modelo generativo autonomo, sino de los adaptadores de control que condicionan la generacion de Qwen-Image: un ControlNet de inpainting y un ControlNet Union. El autor del repositorio es Comfy-Org, la organizacion que mantiene ComfyUI, y los pesos originales provienen de InstantX.

El repositorio resuelve un problema practico de despliegue: los pesos originales de InstantX no estaban empaquetados en el formato que ComfyUI espera cargar desde `models/controlnet/`. Comfy-Org los ha repaquetado como ficheros `.safetensors` individuales, de modo que el usuario solo tiene que copiarlos en la carpeta correspondiente y cargar una plantilla de workflow oficial. El repositorio ocupa 7,8 GB y se distribuye bajo licencia Apache 2.0.

La relevancia actual es alta para quien trabaje con generacion y edicion de imagen en local: Qwen-Image es uno de los modelos de difusion de texto a imagen con mejor soporte de texto en imagen, y estos ControlNets anaden control espacial (inpainting y Union, que agrega multiples condiciones como canny, depth o pose) sin necesidad de reentrenar el modelo base. La informacion disponible no detalla arquitectura interna, numero de parametros ni contexto del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptadores ControlNet sobre el modelo de difusion Qwen-Image) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors de precision original) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fichero unico, `diffusion-single-file`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna de los ControlNets ni sobre el proceso de entrenamiento en la documentacion proporcionada. Por la naturaleza del artefacto, se trata de adaptadores de control que se acoplan al modelo de difusion Qwen-Image: el ControlNet de inpainting permite regenerar zonas enmascaradas de una imagen existente, mientras que el ControlNet Union agrega varias modalidades de condicionamiento espacial en un unico modulo. Los pesos originales fueron desarrollados por InstantX y publicados en sus repositorios `InstantX/Qwen-Image-ControlNet-Inpainting` e `InstantX/Qwen-Image-ControlNet-Union`.

La innovacion de este repositorio es exclusivamente de empaquetado y distribucion: convierte los pesos originales en ficheros `.safetensors` unicos compatibles con el cargador de ComfyUI, y publica plantillas de workflow JSON oficiales para ambos ControlNets. No se documentan en la informacion disponible detalles sobre volumen de datos de entrenamiento, composicion del dataset, uso de RLHF/DPO ni tecnicas de decodificacion.

## Capacidades

- Control de inpainting sobre Qwen-Image: permite enmascarar una region de la imagen y regenerarla condicionada por un prompt de texto, manteniendo coherencia con el resto de la imagen.
- Control espacial tipo Union: agrega multiples condiciones de control (canny, depth, pose y similares) en un solo modulo, segun la denominacion "Union" del ControlNet original.
- Integracion nativa con ComfyUI mediante carga desde `models/controlnet/` y workflows oficiales en JSON.
- Compatibilidad con el ecosistema de nodos de ComfyUI para composicion de pipelines de difusion.
- No se documentan en la informacion disponible capacidades de generacion de texto, razonamiento, codigo, tool calling, agentes ni multilingues, al no ser un modelo de lenguaje.

## Casos de uso

- Edicion de imagen por regiones (inpainting): cargar `Qwen-Image-InstantX-ControlNet-Inpainting.safetensors` en ComfyUI, definir una mascara sobre el objeto a sustituir y regenerar solo esa zona con un prompt nuevo, conservando el resto de la imagen intacta.
- Eliminacion de objetos no deseados: usar el ControlNet de inpainting con una mascara sobre el elemento a borrar y un prompt que describa el fondo, util para limpieza de fotografia de producto o retoque editorial.
- Restauracion de zonas danadas: enmascarar arañazos, marcas de agua o huecos en imagenes antiguas y regenerar el contenido con coherencia de estilo respecto al resto del original.
- Control estructural con Union: condicionar la generacion de Qwen-Image a un mapa de profundidad, bordes o pose para producir variaciones de una composicion manteniendo la geometria, util en previsualizacion de conceptos de diseno.
- Pipelines de generacion por lotes en ComfyUI: automatizar workflows JSON con el nodo de carga de ControlNet para producir variantes controladas de una misma escena en produccion de contenido.
- Prototipado de edicion asistida para estudios de diseno: iterar rapidamente sobre bocetos con control de bordes y luego refinar con inpainting sobre las zonas que el disenador quiera ajustar.
- Integracion en herramientas internas de retoque: al ser ficheros safetensors y licencia Apache 2.0, se pueden incorporar en aplicaciones propias que invoquen ComfyUI como backend de generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 7,8 GB en total (dos ficheros safetensors); el espacio en disco necesario es el de esos ficheros mas el modelo base Qwen-Image y el resto de dependencias de ComfyUI.
- La VRAM necesaria depende principalmente del modelo base Qwen-Image y de la resolucion de generacion, no del ControlNet en si; la informacion disponible no desglosa cifras de VRAM para estos adaptadores.
- No se dispone de datos sobre GPUs recomendadas, encaje en GPUs de consumo, latencia ni throughput en la informacion proporcionada.
- Opciones de despliegue documentadas: ComfyUI, cargando los ficheros desde `ComfyUI/models/controlnet/` y usando las plantillas de workflow oficiales. No se documentan otros backends (vLLM, llama.cpp, TGI) porque no aplican a un modelo de difusion.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Comfy-Org/Qwen-Image-InstantX-ControlNets | ControlNet para Qwen-Image (inpainting + Union) | no disponible | no disponible | Apache 2.0 | Hugging Face (este repo) |
| InstantX/Qwen-Image-ControlNet-Inpainting | ControlNet original de inpainting | no disponible | no disponible | no disponible en la informacion | Hugging Face |
| InstantX/Qwen-Image-ControlNet-Union | ControlNet original Union | no disponible | no disponible | no disponible en la informacion | Hugging Face |

La comparativa se limita a los repositorios de origen, ya que la informacion disponible no incluye otros ControlNets comparables con datos verificables de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo base Qwen-Image y ComfyUI para funcionar; cargarlo de forma aislada no produce resultados.
- La informacion disponible no detalla sesgos, tasas de alucinacion visual ni limitaciones de idioma; al ser un modelo de difusion, los sesgos del modelo base Qwen-Image se heredan.
- El ControlNet Union agrega varias condiciones, pero no se documenta en la informacion disponible que tipos exactos de control cubre ni sus limites de calidad por modalidad.
- No se documentan restricciones adicionales de uso comercial mas alla de la licencia Apache 2.0; conviene verificar las condiciones de los repositorios originales de InstantX antes de un despliegue en produccion.
- Los workflows requieren versiones de ComfyUI compatibles con los nodos y plantillas publicadas; no se especifica en la informacion disponible la version minima.
- Al ser un repositorio de repaquetado, las actualizaciones y correcciones dependen de Comfy-Org, no del autor original de los pesos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Comfy-Org/Qwen-Image-InstantX-ControlNets
- Modelo original de inpainting: https://huggingface.co/InstantX/Qwen-Image-ControlNet-Inpainting
- Modelo original Union: https://huggingface.co/InstantX/Qwen-Image-ControlNet-Union
- Repositorio de ComfyUI: https://github.com/Comfy-Org/ComfyUI
- Plantillas de workflow: https://github.com/Comfy-Org/workflow_templates
- Workflow de inpainting: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_instantx_inpainting_controlnet.json
- Workflow de Union: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_instantx_controlnet.json
