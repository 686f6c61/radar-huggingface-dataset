# beenga8/flux-2-klein-base-4b-mirror

## Resumen

`beenga8/flux-2-klein-base-4b-mirror` es un espejo (mirror) congelado del modelo `black-forest-labs/FLUX.2-klein-4B` de Black Forest Labs, publicado por el usuario `beenga8` con el objetivo de garantizar la reproducibilidad de los builds del proyecto Beenga Image. No se trata de un modelo nuevo ni de un fine-tune: es una copia byte a byte de una revisión concreta del repositorio original, anclada al commit `e7b7dc27f91deacad38e78976d1f2b499d76a294`. El repositorio incluye el fichero `LICENSE.md` original y no modifica ningún peso.

El modelo subyacente, FLUX.2 [klein] 4B, es la variante compacta de la familia FLUX.2 de Black Forest Labs, diseñada para unificar generación y edición de imágenes en una única arquitectura, con inferencia de extremo a extremo en menos de un segundo según sus creadores. Este mirror en particular se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, a diferencia de las variantes de 9B que usan la FLUX Non-Commercial License v2.1.

La relevancia de este mirror radica en que protege contra la desaparición, el gating o el retiro del repositorio upstream, permitiendo reconstrucciones fiables del proyecto Beenga Image. Para cualquier uso productivo se recomienda acudir al repositorio original, que es la fuente de verdad y donde se aplicarán futuras correcciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (transformador de difusion, familia FLUX.2 [klein]) |
| Parametros totales | 4B (aproximadamente, segun el nombre del modelo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagenes) |
| Tipos de cuantizacion | no disponibles en este mirror; el upstream publica variantes `4b-fp8` y `4b-nvfp4` |
| Idiomas soportados | no disponibles (el modelo procesa imagenes y prompts, pero no se especifican idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (segun tags del repositorio) |

## Arquitectura y entrenamiento

El modelo base, FLUX.2 [klein] 4B, pertenece a la familia de modelos de difusion de Black Forest Labs, sucesora de FLUX.1. La arquitectura exacta interna no se detalla en la informacion disponible, pero se trata de un modelo de difusion basado en transformadores, optimizado para velocidad y calidad en generacion y edicion de imagenes. Segun la descripcion oficial, unifica ambas tareas en una sola arquitectura compacta, logrando inferencia de extremo a extremo en menos de un segundo.

Los datos de entrenamiento, el proceso de entrenamiento (si hubo RLHF, DPO u otras tecnicas) y las innovaciones tecnicas especificas no estan documentados en la informacion proporcionada. Este mirror no incluye informacion adicional sobre el entrenamiento, ya que es una copia exacta del modelo original.

## Capacidades

- Generacion de imagenes a partir de prompts de texto.
- Edicion de imagenes (image-to-image), segun el pipeline declarado en HuggingFace (`diffusers:Flux2KleinPipeline`).
- Inferencia rapida: el modelo esta disenado para generar resultados en menos de un segundo en hardware adecuado.
- Soporte para multiples formatos de cuantizacion en el upstream (`fp8`, `nvfp4`), aunque este mirror no los incluye explicitamente.
- Integracion con la libreria `diffusers` de HuggingFace.
- Capacidades multilingues no especificadas.

## Casos de uso

- Reproducibilidad de pipelines de generacion de imagenes: al estar anclado a una revision concreta, permite reconstruir exactamente los mismos resultados en proyectos como Beenga Image, independientemente de cambios en el repositorio upstream.
- Desarrollo de aplicaciones de edicion fotografica: el pipeline image-to-image permite modificar imagenes existentes con instrucciones textuales, util para herramientas de retoque automatico.
- Generacion de contenido visual para prototipos: su velocidad de inferencia (menos de un segundo) lo hace adecuado para iteraciones rapidas en diseno grafico o generacion de assets.
- Investigacion en modelos de difusion compactos: como referencia estable para comparar arquitecturas eficientes de 4B parametros.
- Integracion en entornos de CI/CD: al ser un mirror con licencia Apache 2.0, puede usarse en pipelines automatizados de generacion de imagenes sin preocupacion por licencias restrictivas.
- Despliegue en produccion con requisitos de baja latencia: su tamano compacto y velocidad permiten servir endpoints de generacion de imagenes con tiempos de respuesta cortos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del mirror no incluye metricas de rendimiento, y los datos oficiales de Black Forest Labs para FLUX.2 [klein] 4B no estan accesibles en los materiales proporcionados. Se recomienda consultar el repositorio original para obtener benchmarks actualizados.

## Requisitos de hardware

- VRAM estimada: para un modelo de 4B parametros en precision FP16, se estiman entre 8 y 12 GB de VRAM para inferencia. Con cuantizacion FP8 (disponible en el upstream) podria reducirse a unos 6-8 GB.
- GPU recomendadas: tarjetas con al menos 12 GB de VRAM, como RTX 4070 Ti, RTX 4080, RTX 4090, A10, A100 o H100. En cuantizacion FP8 podria funcionar en GPUs con 8 GB, como RTX 3060 Ti o RTX 3070.
- En consumer GPU: si, con cuantizacion adecuada y para resoluciones moderadas. En FP16 requiere una GPU de gama alta.
- Opciones de despliegue: al ser un modelo de difusion compatible con `diffusers`, puede servirse con bibliotecas como Diffusers, o mediante herramientas especializadas como ComfyUI, Automatic1111 o vLLM (si se adapta). Tambien es posible usar el repositorio oficial de inferencia de FLUX.2 en GitHub.
- Latencia y throughput: segun Black Forest Labs, la inferencia de extremo a extremo puede ser inferior a un segundo en hardware optimizado, pero no se dispone de mediciones concretas para este mirror.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar directamente con otros modelos de generacion de imagenes de tamano similar. El modelo base FLUX.2 [klein] 4B compite con otras familias como SDXL (2.6B), SD 3.5 Medium (2.5B) o PixArt-Σ (0.6B), pero no hay datos de benchmarks en la informacion proporcionada. Se recomienda consultar las publicaciones oficiales de Black Forest Labs para una comparativa rigurosa.

## Limitaciones y advertencias

- Este mirror no es un modelo original: es una copia exacta del repositorio upstream. Cualquier correccion o mejora futura se aplicara solo al repositorio original, no a este mirror.
- La licencia Apache 2.0 aplica solo a la variante 4B. Las variantes de 9B del mismo modelo usan la FLUX Non-Commercial License v2.1, por lo que hay que verificar cuidadosamente el nombre del modelo antes de sustituirlo.
- No se garantiza la disponibilidad a largo plazo de este mirror; el autor puede retirarlo en cualquier momento.
- Los datos de entrenamiento y los posibles sesgos del modelo no estan documentados en la informacion disponible.
- Riesgo de alucinacion o generacion de imagenes inapropiadas: como cualquier modelo generativo, puede producir contenido no deseado o inexacto si se usa sin filtros adecuados.
- No se proporcionan garantias de rendimiento ni soporte tecnico para este mirror.

## Enlaces

- Repositorio HuggingFace del mirror: https://huggingface.co/beenga8/flux-2-klein-base-4b-mirror
- Repositorio original en HuggingFace: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Repositorio oficial de inferencia de FLUX.2 en GitHub: https://github.com/black-forest-labs/flux2
- Proyecto Beenga Image (referenciado en la model card): https://github.com/Beenga/beenga-image
