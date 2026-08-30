# sleephashira/opm-murata-illustrious-xl-lora

## Resumen

El modelo `sleephashira/opm-murata-illustrious-xl-lora` es un adaptador LoRA (Low-Rank Adaptation) para Stable Diffusion XL, desarrollado por el usuario sleephashira. Su objetivo es adaptar el modelo base `OnomaAIResearch/Illustrious-xl-early-release-v0` (una variante de SDXL especializada en ilustración anime) hacia un renderizado de manga monocromo inspirado en el estilo del dibujante Yusuke Murata, conocido por su trabajo en One Punch Man. El adaptador se entrenó sobre 337 paneles extraídos de la obra original, lo que le permite generar imágenes con estética de viñeta, líneas dinámicas y sombreado característico.

Este LoRA es relevante para la comunidad de generación de imágenes porque ofrece una vía rápida para obtener resultados con un estilo artístico muy concreto sin necesidad de reentrenar un modelo completo. Sin embargo, su uso está estrictamente limitado a fines personales, de investigación o educativos, ya que el material de entrenamiento está sujeto a derechos de autor y no se ha obtenido licencia de los titulares. El archivo pesa aproximadamente 218 MB y se distribuye en formato safetensors, con una palabra de activación (`trigger word`) `mrtmanga` para invocar el estilo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Stable Diffusion XL (Illustrious XL) |
| Parametros totales | no disponible (archivo de 228 464 636 bytes, ~218 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagenes, no de texto) |
| Tipos de cuantizacion | no aplica (el adaptador se usa en precision FP16/BF16 dentro del pipeline de Diffusers) |
| Idiomas soportados | no aplica (genera imagenes; los prompts se interpretan en ingles, como es habitual en SDXL) |
| Licencia | other (uso personal, investigacion y educativo; prohibido uso comercial o monetizado) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA que se inserta en las capas de atención y de proyección del modelo base Illustrious XL, una arquitectura de difusión latente basada en el transformer de SDXL. El entrenamiento se realizó sobre un conjunto de 337 paneles de manga extraídos de One Punch Man, previamente limpiados y recortados. Se seleccionó el checkpoint correspondiente al paso 1800 para la publicación. No se han proporcionado detalles sobre el rango (rank) del LoRA, el alpha, la tasa de aprendizaje ni el tipo de optimizador utilizado. El modelo base, Illustrious XL, es una versión temprana de SDXL entrenada con un enfoque en ilustración anime, y su licencia (Fair AI Public License 1.0-SD) también aplica al uso de este adaptador.

## Capacidades

- Generación de imágenes en estilo manga monocromo (blanco y negro, con tramas y sombreado característico del estilo de Murata).
- Activación mediante la palabra `mrtmanga` en el prompt, preferiblemente al inicio.
- Compatible con el pipeline de Diffusers para SDXL, permitiendo ajuste de escala del LoRA (`lora_scale`).
- Soporta prompts negativos para reforzar la ausencia de color (p. ej., `color, photorealistic`).
- Puede combinarse con otros LoRAs o adaptadores sobre el mismo modelo base, aunque no se ha documentado explícitamente.
- Generación a resoluciones típicas de SDXL (p. ej., 832x1216), con muestreo Euler ancestral y 26 pasos como configuración de partida probada.

## Casos de uso

- Creación de páginas de manga amateur: el modelo permite generar viñetas monocromas con estilo de Murata para proyectos personales de cómic o doujinshi no comerciales.
- Ilustración de fan art: artistas aficionados pueden producir imágenes de personajes de One Punch Man u otros con la estética del autor, siempre que no haya fines comerciales.
- Estudio de estilos artísticos: investigadores o estudiantes de arte pueden analizar cómo un LoRA captura las características de un dibujante concreto a partir de un conjunto limitado de datos.
- Prototipado de diseño de personajes: diseñadores pueden explorar variaciones de vestuario, poses o expresiones en estilo manga antes de pasar a un dibujo final.
- Generación de fondos y escenas de acción: el modelo es adecuado para producir escenas dinámicas con líneas de velocidad y sombreado dramático, útiles para storyboards personales.
- Experimentación en entornos educativos: talleres de ilustración pueden usar el modelo para demostrar cómo los adaptadores LoRA modifican el estilo de un modelo base sin alterar sus pesos principales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un adaptador de estilo, no se reportan métricas cuantitativas como FID o CLIP score. El autor solo indica que el checkpoint 1800 fue seleccionado para la publicación, sin comparar con otros pasos o modelos.

## Requisitos de hardware

- Al ser un LoRA sobre SDXL, los requisitos de hardware son los del modelo base Illustrious XL. Se recomienda al menos 8 GB de VRAM para inferencia con Diffusers en FP16.
- GPUs compatibles: tarjetas con soporte CUDA, como RTX 2060 Super (8 GB) o superiores, RTX 3060 (12 GB), RTX 4090, A100, etc. También puede ejecutarse en Apple Silicon con MPS, aunque con menor rendimiento.
- El adaptador en sí ocupa ~218 MB, por lo que el consumo adicional de VRAM es mínimo.
- Opciones de despliegue: Diffusers (Python), ComfyUI, Automatic1111 WebUI (cargando el safetensors como LoRA), o cualquier frontend que soporte LoRAs de SDXL.
- Latencia y throughput: no se han publicado datos específicos. En una RTX 3090, una generación de 832x1216 con 26 pasos suele tardar entre 5 y 10 segundos, pero esto depende de la implementación y del modelo base.

## Comparativa con modelos similares

No se dispone de datos técnicos de otros LoRAs de estilo Murata para SDXL. En la comunidad Civitai existen adaptadores similares, como "Murata Yusuke / One Punch Man Manga style (IlluXL)" o "Yusuke Murata - STYLE - | Illustrious XL |", pero no se han publicado especificaciones comparables (tamaño, entrenamiento, licencia). Por tanto, no es posible realizar una comparativa objetiva. El modelo base Illustrious XL es el punto de referencia común para todos estos adaptadores.

## Limitaciones y advertencias

- El modelo fue entrenado con material con derechos de autor (paneles de One Punch Man) sin licencia de los titulares. El uso comercial, publicitario, la reventa o cualquier actividad que genere ingresos está estrictamente prohibida.
- La licencia `other` no es una licencia de código abierto aprobada por OSI; es una restricción de uso personalizada. El usuario debe revisar los términos del modelo base y la Fair AI Public License 1.0-SD antes de usar el adaptador.
- El conjunto de entrenamiento es pequeño (337 imágenes), lo que puede provocar sesgos hacia personajes, poses o escenas específicas de la obra original.
- Puede generar anatomía defectuosa, texto ilegible o detalles de viñeta incorrectos, especialmente en composiciones complejas.
- La calidad del resultado depende en gran medida del prompt, la semilla, el scheduler, la resolución y la escala del LoRA. No se garantiza consistencia entre generaciones.
- No se han documentado pruebas de robustez frente a prompts adversos ni de seguridad del contenido generado.
- El autor declina toda responsabilidad sobre el uso que se haga del modelo y sobre el cumplimiento legal por parte del usuario.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sleephashira/opm-murata-illustrious-xl-lora
- Modelo base Illustrious XL: https://huggingface.co/OnomaAIResearch/Illustrious-xl-early-release-v0
- Términos de uso del modelo base: https://huggingface.co/OnomaAIResearch/Illustrious-xl-early-release-v0/blob/main/TERM_OF_USE
- Licencia Fair AI Public License 1.0-SD: https://freedevproject.org/faipl-1.0-sd/
