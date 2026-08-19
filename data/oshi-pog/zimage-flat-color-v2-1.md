# oshi-pog/zimage-flat-color-v2-1

## Resumen
Este repositorio aloja un espejo público del adaptador LoRA «Flat Color - Style v2.1» creado por motimalu para el modelo de texto a imagen Tongyi-MAI/Z-Image-Turbo. El adaptador aplica un estilo artístico de color plano, sin lineart, con fusión de colores y uso de espacio negativo, lo que permite generar imágenes con una estética minimalista y consistente sin necesidad de reentrenar el modelo completo.

Es relevante para desarrolladores e investigadores que trabajan con generación de imágenes y necesitan un control estilístico fino sobre un modelo base moderno. El repositorio contiene el archivo de pesos `zimage_flat_color_v2.1.safetensors`, que es una copia bit a bit idéntica del artefacto publicado en Civitai, con un tamaño de repositorio de 1.0 GB. El adaptador es exclusivo para Z-Image Turbo y no es compatible con otros modelos de la familia.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre Tongyi-MAI/Z-Image-Turbo |
| Parámetros totales | no disponible (el archivo pesa 1.0 GB en el repositorio) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de texto a imagen) |
| Tipos de cuantización | safetensors (sin cuantización explícita indicada) |
| Idiomas soportados | no disponible (depende del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El adaptador se basa en la arquitectura del modelo Tongyi-MAI/Z-Image-Turbo, un modelo de texto a imagen de gran escala. Al tratarse de un LoRA, solo se entrenan matrices de bajo rango que se inyectan en las capas del modelo base, lo que permite ajustar el estilo sin modificar los pesos completos. No se proporcionan detalles sobre el dataset de entrenamiento ni el proceso de optimización en la información disponible.

El archivo de pesos es un espejo sin modificar del artefacto original de Civitai, con un hash SHA-256 verificado (`b9875b45fb9e77c50c18baa36682bc675fae28e4df7fa2534b89170c5103d60b`). Esto garantiza que el contenido es idéntico al publicado por el autor original, pero no aporta información adicional sobre el entrenamiento.

## Capacidades
- Aplica un estilo de color plano («flat color») con ausencia de lineart («no lineart»).
- Incluye técnicas de fusión de colores («blending») y uso de espacio negativo («negative space»).
- Requiere las palabras de activación recomendadas para obtener el estilo deseado: `flat color, no lineart, blending, negative space`.
- Compatible exclusivamente con el modelo base Tongyi-MAI/Z-Image-Turbo.
- No es compatible con Qwen Image ni con Pruna P-Image.
- Generación de imágenes a partir de texto (text-to-image) mediante el pipeline estándar del modelo base.

## Casos de uso
- Ilustración para interfaces de usuario: generar iconos y elementos gráficos con estilo plano y consistente para aplicaciones web o móviles, aprovechando la ausencia de lineart para una estética limpia.
- Creación de assets para videojuegos: producir sprites o fondos con estética minimalista, adecuados para juegos indie o prototipos donde la coherencia visual es crítica.
- Diseño de material de marketing: elaborar banners, carteles o imágenes para redes sociales con un estilo visual moderno y plano, reduciendo el ruido visual en campañas.
- Generación de concept art: explorar rápidamente ideas de personajes o escenarios con una paleta de colores plana, ideal para fases iniciales de diseño y lluvia de ideas.
- Animación y motion graphics: generar fotogramas o fondos planos que faciliten la composición posterior en herramientas de animación, gracias a la simplicidad del estilo.
- Prototipado visual para UX/UI: crear mockups de pantallas o componentes con color plano, lo que permite evaluar la disposición sin distracciones de texturas o sombras complejas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- Los requisitos de hardware dependen del modelo base Tongyi-MAI/Z-Image-Turbo.
- Al ser un adaptador LoRA, el coste adicional en memoria es mínimo en comparación con el modelo base.
- No se dispone de datos concretos de VRAM en la información proporcionada.
- Se recomienda consultar la documentación del modelo base para conocer las GPU compatibles (por ejemplo, tarjetas con 24 GB de VRAM o superiores para inferencia en fp16).
- Para el despliegue, se puede utilizar el pipeline estándar de Hugging Face `diffusers` con el adaptador LoRA cargado sobre el modelo base.

## Comparativa con modelos similares
No se dispone de una comparativa directa con otros modelos en la información proporcionada. Como referencia, existen otros LoRAs de estilo para Z-Image Turbo o para modelos alternativos como SDXL o FLUX, pero su compatibilidad y rendimiento relativo no se pueden evaluar sin datos adicionales. La principal diferencia de este adaptador es su enfoque exclusivo en el estilo «flat color» y su restricción al modelo base Z-Image Turbo.

## Limitaciones y advertencias
- El adaptador no es compatible con Qwen Image ni con Pruna P-Image; su uso con otros modelos base producirá resultados incorrectos.
- Requiere el uso de las palabras de activación exactas (`flat color, no lineart, blending, negative space`) para obtener el estilo deseado.
- El repositorio es un espejo de un artefacto de Civitai; se recomienda verificar el hash SHA-256 antes de su uso en producción.
- No se dispone de información sobre sesgos o alucinaciones específicas del adaptador, ya que no se han publicado evaluaciones.
- La licencia Apache 2.0 permite uso comercial, pero se debe respetar la atribución del autor original (motimalu) según los términos de la licencia.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/oshi-pog/zimage-flat-color-v2-1
- Página original del modelo en Civitai: https://civitai.com/models/1132089/flat-color-style?modelVersionId=2616765
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
