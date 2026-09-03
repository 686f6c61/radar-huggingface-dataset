# Quiho/Krea2_NSFW_Uncensored_Complete

## Resumen

El modelo `Quiho/Krea2_NSFW_Uncensored_Complete` es un checkpoint de generación de imágenes basado en `krea/Krea-2-Turbo`, modificado mediante técnicas de *abliteration* y *merge* para eliminar los filtros de seguridad y restricciones de contenido del modelo original. El autor, Quiho, ha publicado este checkpoint bajo licencia Apache 2.0, lo que permite su uso comercial y modificación. Está diseñado para usuarios que necesitan generar imágenes sin censura, incluyendo contenido NSFW, manteniendo la calidad y velocidad del modelo base Turbo.

La relevancia de este modelo radica en su capacidad de ofrecer una alternativa "sin filtros" a modelos de difusión populares, dirigida a desarrolladores e investigadores que trabajan en aplicaciones de generación artística, contenido para adultos o experimentación creativa. Al estar basado en Krea-2-Turbo, hereda su arquitectura de difusión, aunque los detalles técnicos específicos (número de parámetros, arquitectura exacta) no se encuentran documentados en la información disponible. El repositorio tiene un tamaño de 18,6 GB e incluye componentes como VAE y text encoder, según las etiquetas del modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Krea-2-Turbo, modelo de difusión texto a imagen) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (probablemente safetensors, dado el uso de diffusers) |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna del modelo. Se sabe que es un checkpoint derivado de `krea/Krea-2-Turbo`, que a su vez es un modelo de difusión para texto a imagen. Las etiquetas indican que se realizó un *merge* (fusión de pesos) y una *abliteration*, técnica que consiste en eliminar o neutralizar ciertos componentes del modelo (posiblemente capas o activaciones) para eliminar comportamientos no deseados, como los filtros de contenido seguro. No se especifican los datos de entrenamiento adicionales, ni si se usó RLHF u otras técnicas de alineación. El modelo incluye VAE y text encoder, lo que sugiere una arquitectura típica de difusión latente (similar a Stable Diffusion), pero sin confirmación oficial.

## Capacidades

- Generación de imágenes a partir de descripciones textuales en inglés y chino.
- Generación de contenido sin censura, incluyendo material NSFW (desnudos, violencia explícita, etc.), gracias a la eliminación de filtros.
- Soporte de *text-to-image* mediante el pipeline de `diffusers`.
- Compatible con técnicas de *merging* y personalización adicional por parte del usuario.
- No se documentan capacidades de tool calling, razonamiento multi-paso ni otras funciones típicas de modelos de lenguaje; es exclusivamente un generador de imágenes.

## Casos de uso

- Ilustración artística sin restricciones: artistas digitales pueden generar conceptos que incluyan desnudos artísticos o temáticas adultas sin que el modelo imponga bloqueos, usando prompts en inglés o chino.
- Prototipado rápido para estudios de diseño: diseñadores pueden crear variaciones de escenas o personajes con contenido explícito para evaluar estilos antes de la producción final.
- Generación de contenido para novelas visuales o juegos adultos: desarrolladores de juegos independientes pueden producir assets visuales sin depender de servicios externos con moderación.
- Investigación sobre sesgos y alineación en modelos de difusión: investigadores pueden estudiar cómo la abliteration afecta la calidad y el sesgo de las imágenes generadas comparando con el modelo base.
- Creación de datasets sintéticos para entrenamiento de clasificadores NSFW: se puede generar un gran volumen de imágenes etiquetadas para entrenar sistemas de moderación de contenido.
- Personalización de modelos mediante *merge*: al ser un checkpoint abierto y con licencia permisiva, se puede combinar con otros modelos para crear variantes específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de calidad de imagen (FID, CLIP score) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no se dispone de datos oficiales. Dado el tamaño del repositorio (18,6 GB), se puede inferir que el checkpoint completo en precisión FP16 ocuparía aproximadamente 18,6 GB de VRAM, por lo que se recomienda una GPU con al menos 24 GB (por ejemplo, RTX 3090, RTX 4090, A5000, A100). Para cuantizaciones menores (por ejemplo, FP8 o INT8), podría caber en GPUs de 16 GB, pero no hay confirmación.
- GPU recomendadas: RTX 3090/4090, A100, H100 (para producción). Para pruebas en local, una RTX 3060 de 12 GB podría ser insuficiente a menos que se reduzca la resolución o se usen técnicas de offloading.
- Opciones de despliegue: al ser un modelo de `diffusers`, se puede ejecutar con la biblioteca de Hugging Face en Python, y también es compatible con servicios como ComfyUI o Automatic1111 (si se convierte el checkpoint al formato adecuado). No se menciona soporte para vLLM u otros motores de inferencia optimizados para imágenes.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente sobre modelos comparables específicos. Se puede señalar que Krea-2-Turbo es el modelo base, pero no se conocen sus especificaciones exactas (parámetros, arquitectura). Otros modelos "uncensored" como `Unstable Diffusion` o variantes de Stable Diffusion sin filtros podrían ser alternativas, pero no hay datos para comparar directamente. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Contenido explícito: el modelo genera material NSFW sin restricciones, lo que puede ser inapropiado para menores o entornos laborales. El usuario es responsable del uso legal y ético.
- Riesgo de sesgos: al ser una modificación de un modelo base, puede heredar sesgos de género, raza o cultura presentes en los datos de entrenamiento originales de Krea-2-Turbo, no documentados aquí.
- Alucinaciones visuales: como todo modelo de difusión, puede generar imágenes con errores anatómicos, texto ilegible o artefactos, especialmente en contenido complejo.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede infringir derechos de autor si se basan en personajes o marcas protegidas.
- Sin garantías de calidad: al ser un modelo sin documentación técnica, no se puede asegurar la estabilidad o reproducibilidad de los resultados en diferentes entornos.
- Idiomas limitados: solo se garantizan prompts en inglés y chino; otros idiomas pueden producir resultados de menor calidad.

## Enlaces

- HuggingFace: https://huggingface.co/Quiho/Krea2_NSFW_Uncensored_Complete
- Modelo base (Krea-2-Turbo): https://huggingface.co/krea/Krea-2-Turbo (referencia)
