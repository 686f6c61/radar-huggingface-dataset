# ling0322/libwaifu-wai-illustrious-v17

## Resumen

Este repositorio contiene la conversión al formato `.waifupkg` del modelo WAI Illustrious SDXL v17.0, un fine-tune de Illustrious XL orientado a la generación de ilustraciones anime. El modelo original fue desarrollado por LyliaEngine y publicado en HuggingFace como `LyliaEngine/waiIllustriousSDXL_v170`; el autor `ling0322` lo ha empaquetado para que la herramienta local `libwaifu` pueda utilizarlo directamente sin pasos de conversión manuales. La relevancia de esta ficha radica en que permite a los usuarios de libwaifu acceder a un checkpoint de alta calidad para anime con un solo comando, manteniendo los pesos originales intactos.

El modelo se basa en la arquitectura de Stable Diffusion XL (SDXL), con un U-Net y dos text encoders CLIP almacenados en float16, y un VAE en precisión superior para evitar desbordamientos. El tamaño total del repositorio es de aproximadamente 7.0 GB, dividido en cuatro partes para facilitar la descarga. No se especifica una longitud de contexto, ya que se trata de un modelo de difusión texto-imagen y el prompt se introduce mediante etiquetas danbooru en lugar de frases completas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion XL (U-Net + dos text encoders CLIP + VAE), fine-tune de Illustrious XL |
| Parametros totales | No disponible (modelo de difusión; no se especifican en la información) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo texto-imagen, sin ventana de contexto) |
| Tipos de cuantizacion | float16 (formato original), no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible (prompting mediante etiquetas danbooru, generalmente en inglés) |
| Licencia | CDLA-Permissive-2.0 |
| Formato de pesos | `.waifupkg` (paquete de libwaifu, que contiene los tensores en float16) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Illustrious XL, que a su vez deriva de Stable Diffusion XL. La arquitectura subyacente incluye un U-Net con atención cruzada, dos text encoders (CLIP ViT-L/14 y OpenCLIP ViT-bigG/14) y un VAE. La conversión a `.waifupkg` no modifica los pesos: el U-Net y los text encoders se mantienen en float16, mientras que el VAE se conserva en una precisión mayor para evitar desbordamientos numéricos. El tokenizer CLIP se incluye dentro del paquete.

No se proporcionan datos sobre el entrenamiento del modelo original (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). La model card del autor menciona mejoras específicas de la versión v17: corrección de inconsistencias de color entre personajes y fondo, mayor relevancia del fondo con los personajes, un coloreado más suave y una mejora en la corrección de extremidades al usar el high-res fix. Se recomienda no añadir demasiadas etiquetas de calidad ni prompts negativos largos, ya que degradan la calidad de la imagen.

## Capacidades

- Generación de imágenes anime e ilustraciones de alta calidad, con un estilo consistente y detallado.
- Prompting mediante etiquetas danbooru, lo que permite un control fino sobre personajes, atributos, poses y escenarios.
- Soporte de high-res fix para mejorar la corrección de brazos, piernas y manos.
- Ajuste de la edad de los personajes mediante etiquetas como `(aged up:1.0-2.0)` o `(mature female:1.0-2.0)`.
- VAE integrado, por lo que no requiere cargar un VAE externo.
- Compatibilidad con resoluciones superiores a 1024x1024, aunque se recomienda usar dimensiones nativas para evitar artefactos.

## Casos de uso

- Ilustración de personajes para novelas visuales: el modelo genera personajes anime con gran detalle y coherencia, ideal para proyectos de ficción interactiva.
- Creación de arte conceptual para videojuegos: permite iterar rápidamente sobre diseños de personajes, entornos y objetos con un estilo unificado.
- Generación de portadas y banners para comunidades online: su capacidad para manejar etiquetas danbooru facilita la creación de imágenes temáticas (fan art, avatares, etc.).
- Producción de material para doujinshi o cómics: el high-res fix ayuda a corregir extremidades, reduciendo el trabajo de retoque posterior.
- Prototipado de personajes para animación: se pueden explorar variaciones de diseño (edad, vestimenta, expresión) cambiando etiquetas en el prompt.
- Integración en pipelines de generación masiva: al ser un paquete `.waifupkg`, puede usarse directamente desde libwaifu en scripts automatizados o entornos de línea de comandos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como FID, CLIP score o comparativas con otros modelos de generación de anime.

## Requisitos de hardware

- No se especifican requisitos concretos en la información del modelo.
- Al tratarse de un modelo SDXL, se estima que requiere al menos 8 GB de VRAM para inferencia en float16, y más si se usa el VAE en precisión completa.
- GPUs recomendadas (orientativo): NVIDIA RTX 3060 (12 GB) o superior, RTX 4090, A100, etc.
- Es posible ejecutarlo en GPUs de consumo con 8-12 GB de VRAM, dependiendo del tamaño de la imagen y el uso de high-res fix.
- Opciones de despliegue: libwaifu (herramienta local), o exportar los pesos a formatos estándar como safetensors para usarlos con ComfyUI, Automatic1111 u otros frontends de SDXL.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Licencia | Formato | Notas |
|---|---|---|---|---|
| WAI Illustrious SDXL v17.0 (este) | Fine-tune de Illustrious XL | CDLA-Permissive-2.0 | `.waifupkg` | Conversión para libwaifu, pesos originales en float16 |
| LyliaEngine/waiIllustriousSDXL_v170 | Fine-tune de Illustrious XL | CDLA-Permissive-2.0 (según fuente) | safetensors | Modelo original, sin conversión a libwaifu |
| OnomaAIResearch/Illustrious-xl-early-release-v0 | Modelo base SDXL fine-tune | No especificada | safetensors | Base para el fine-tune, orientado a anime |

No se dispone de datos de rendimiento numérico para comparar. La diferencia principal es el formato de empaquetado y la integración directa con libwaifu.

## Limitaciones y advertencias

- El modelo está etiquetado como `not-for-all-audiences`; puede generar contenido explícito o para adultos.
- No se recomienda añadir demasiadas etiquetas de calidad o prompts negativos largos, ya que reducen la nitidez de la imagen.
- El prompting se basa exclusivamente en etiquetas danbooru; los usuarios acostumbrados a prompts en lenguaje natural necesitarán adaptarse.
- No hay información sobre sesgos específicos del modelo, pero al estar entrenado con datos de danbooru, puede reflejar sesgos estéticos y de representación presentes en ese dataset.
- La licencia CDLA-Permissive-2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones de la licencia para el contenido generado.
- El repositorio no incluye el modelo original en formato safetensors; solo el paquete `.waifupkg`. Para usarlo con otras herramientas, será necesario convertir los pesos.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/ling0322/libwaifu-wai-illustrious-v17
- Repositorio de libwaifu en GitHub: https://github.com/ling0322/libwaifu
- Modelo original de LyliaEngine: https://huggingface.co/LyliaEngine/waiIllustriousSDXL_v170
- Modelo base Illustrious XL: https://huggingface.co/OnomaAIResearch/Illustrious-xl-early-release-v0
