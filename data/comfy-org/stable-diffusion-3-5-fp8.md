# Comfy-Org/stable-diffusion-3.5-fp8

## Resumen

Este repositorio contiene los archivos del modelo Stable Diffusion 3.5 Large reempaquetados en formato FP8 para su uso directo con ComfyUI. El autor es Comfy-Org, que ha preparado los pesos del modelo original de Stability AI para simplificar la integración en el ecosistema ComfyUI, incluyendo los text encoders necesarios (CLIP-L, CLIP-G y T5-XXL) en versiones cuantizadas. Se trata de una versión optimizada en memoria que mantiene la funcionalidad del modelo original, dirigida a usuarios que necesitan ejecutar SD3.5 Large en hardware con VRAM limitada o reducir el consumo de recursos sin perder calidad significativa. El repositorio tiene un tamaño total de 48 GB e incluye varios archivos de pesos en formato safetensors, así como instrucciones de colocación en las carpetas de ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (no especificado en la ficha; los archivos indican uso de text encoders CLIP y T5) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 (escala dinamica y e4m3fn) |
| Idiomas soportados | No disponibles |
| Licencia | stabilityai-ai-community |
| Formato de pesos | safetensors (diffusion-single-file) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo. Se trata de una version cuantizada a FP8 del checkpoint Stable Diffusion 3.5 Large, que originalmente es un modelo de difusion basado en transformer con tres text encoders (CLIP-L, CLIP-G y T5-XXL). Los archivos incluidos confirman la presencia de estos encoders en versiones FP16 y FP8. No se dispone de datos sobre el entrenamiento, el numero de tokens ni las tecnicas de alineacion utilizadas por el modelo original.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image), segun la naturaleza del modelo Stable Diffusion 3.5.
- Los archivos incluyen los text encoders necesarios para el funcionamiento completo en ComfyUI.
- Compatibilidad con el ecosistema ComfyUI mediante colocacion directa en las carpetas correspondientes.
- No se dispone de informacion sobre capacidades adicionales como tool calling, agentes o multimodales.

## Casos de uso

- Generacion de imagenes artisticas y conceptuales: el modelo puede producir ilustraciones de alta calidad a partir de prompts en lenguaje natural, adecuado para disenadores y creadores de contenido.
- Prototipado rapido de assets visuales: permite generar imagenes de referencia para videojuegos, publicidad o storyboards sin necesidad de equipos de alto presupuesto.
- Edicion y variacion de imagenes: aunque no se especifica en la ficha, los modelos de la familia SD3.5 suelen soportar tareas de inpainting y outpainting cuando se usan con los workflows adecuados en ComfyUI.
- Investigacion en generacion sintetica de datos: util para crear conjuntos de imagenes etiquetadas para entrenar otros modelos de vision.
- Integracion en pipelines de automatizacion: al ser compatible con ComfyUI, puede integrarse en flujos de trabajo programaticos mediante la API de ComfyUI para generacion por lotes.
- Despliegue en entornos con recursos limitados: la cuantizacion FP8 reduce los requisitos de VRAM en comparacion con la version FP16, permitiendo su uso en GPUs de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de VRAM en la ficha.
- El repositorio completo ocupa 48 GB, pero el checkpoint principal (sd3.5_large_fp8_scaled.safetensors) tiene un tamano no especificado; se estima que la version FP8 de SD3.5 Large requiere alrededor de 8-10 GB de VRAM para inferencia, aunque este dato no esta confirmado.
- Se recomienda una GPU con al menos 12 GB de VRAM para operar con comodidad, aunque no es un dato oficial.
- Opciones de despliegue: ComfyUI es el destino principal, pero los archivos safetensors pueden usarse con otros frameworks que soporten el formato (por ejemplo, Diffusers con carga personalizada).
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible.

## Limitaciones y advertencias

- La licencia stabilityai-ai-community impone restricciones de uso comercial; es necesario revisar los terminos completos en el enlace proporcionado.
- Al ser una cuantizacion FP8, puede haber una ligera perdida de calidad en comparacion con los pesos FP16, especialmente en detalles finos.
- No se dispone de informacion sobre sesgos o alucinaciones especificas del modelo.
- El uso en produccion requiere verificar la compatibilidad con la version de ComfyUI y los workflows concretos.
- El repositorio no incluye documentacion sobre el proceso de cuantizacion ni garantias de rendimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Comfy-Org/stable-diffusion-3.5-fp8
- Modelo original de Stability AI: https://huggingface.co/stabilityai/stable-diffusion-3.5-large
- Blog de ComfyUI sobre SD3.5: https://blog.comfy.org/sd3-5-comfyui/
