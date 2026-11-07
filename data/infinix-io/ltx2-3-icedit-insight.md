# Infinix-io/LTX2.3-ICEdit-Insight

## Resumen

LTX2.3-ICEdit-Insight es una familia de modelos de restauración y edición de vídeo desarrollada por JoyFox Lab (publicada en Hugging Face bajo la organización Infinix-io) sobre el modelo fundacional audio-vídeo LTX-2.3 de Lightricks. Se distribuye como un conjunto de checkpoints especializados por tarea —restauración general, mejora HD/superresolución, eliminación de marcas de agua y eliminación de subtítulos— más un checkpoint base unificado en FP8. El modelo aborda el post-procesado de vídeo como un problema generativo en el espacio latente, en lugar de aplicar mejoras fotograma a fotograma, lo que le permite preservar estructura global, movimiento de cámara, identidad de objetos y consistencia temporal.

Técnicamente se apoya en una arquitectura DiT (Diffusion Transformer) heredada de LTX-2.3 y se publica con licencia Apache 2.0, lo que facilita su uso comercial. La relevancia actual radica en que unifica en un solo paquete cuatro tareas de post-producción que habitualmente requieren pipelines separados (restauración, upscaling, inpainting de oclusiones y limpieza de texto sobreimpreso), con un artículo asociado que describe los componentes TADA, FGLC y PMTR para desacoplar restauración de estructura y edición de textura, modelar consistencia temporal mediante flujo óptico y enrutar múltiples tareas de forma estable.

El repositorio ocupa 30,3 GB e incluye pesos en safetensors compatibles con la librería `diffusers` bajo el pipeline `video-to-video`. La información pública disponible no detalla el número de parámetros, la longitud de contexto temporal ni los datos exactos de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) sobre LTX-2.3, con adaptadores IC-LoRA por tarea |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de vídeo; ventana temporal no especificada) |
| Tipos de cuantizacion | FP8 (checkpoint base `ltx-2.3-edit-insight-dev-fp8.safetensors`); no se documentan otras |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con `diffusers`) |

## Arquitectura y entrenamiento

El modelo parte del backbone LTX-2.3, un modelo fundacional audio-vídeo basado en Diffusion Transformer. Sobre él se aplican adaptadores específicos por tarea (etiquetados como IC-LoRA en el repositorio) que especializan el backbone para restauración, mejora HD, eliminación de marcas de agua y eliminación de subtítulos. El paquete incluye cinco ficheros safetensors: un checkpoint base unificado en FP8 y cuatro checkpoints especializados. El artículo asociado describe tres componentes: TADA (Task-Aware Decoupled Adapter), que separa la restauración de estructura de la edición de textura y semántica sobre un backbone compartido; FGLC (Flow-Guided Latent Consistency), que modela la consistencia temporal en el espacio latente mediante alineamiento por flujo óptico y sesgo de atención entre fotogramas; y PMTR (Progressive Multi-Task Routing), que estabiliza el entrenamiento conjunto multi-tarea mediante planificación curricular y enrutamiento colaborativo.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO (poco habituales en modelos de difusión de vídeo). La innovación destacable es el enfoque generativo en espacio latente con consistencia temporal explícita, frente a pipelines convencionales de mejora a nivel de fotograma.

## Capacidades

- Restauración de vídeo: recuperación de degradaciones, limpieza de artefactos de compresión, reducción de desenfoque y ruido, y reconstrucción de detalle dañado.
- Mejora HD y superresolución: reconstrucción de detalle, nitidez de texturas y mejora de calidad perceptual.
- Eliminación de marcas de agua: limpieza de logotipos y superposiciones semitransparentes con reconstrucción de fondo consciente de la oclusión.
- Eliminación de subtítulos: borrado de subtítulos incrustados (hard subs), limpieza de rótulos y texto sobreimpreso con inpainting temporalmente estable.
- Edición semántica guiada por instrucciones (según el artículo, expuesta de forma parcial en el paquete de inferencia actual).
- Procesamiento vídeo a vídeo en espacio latente preservando movimiento de cámara e identidad de objetos.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas a inglés según la model card.
- Capacidades especiales: modo de edición por tarea mediante checkpoints dedicados; no se documentan visión, audio ni modo "thinking" en esta release.

## Casos de uso

- Restauración de archivo audiovisual: aplicar `ltx2.3-video-restoration-general` a material antiguo o comprimido para recuperar detalle y eliminar artefactos de compresión antes de su digitalización definitiva.
- Remasterización a HD: usar `ltx2.3-ic-video-upscale-general` para superresolución y reconstrucción de texturas en metraje de baja resolución, manteniendo la coherencia temporal entre fotogramas.
- Limpieza de material de stock o licenciado: eliminar logotipos y marcas de agua con `ltx2.3-ic-watermark-remove-general` para reutilizar clips con fines editoriales, verificando previamente los derechos de uso.
- Localización de contenido: borrar subtítulos incrustados con `ltx2.3-ic-subtitles-remove-general` para volver a subtitular en otro idioma sin recodificar el vídeo original.
- Post-producción publicitaria: limpiar rótulos temporales o superposiciones de marca en versiones de campaña, con reconstrucción de fondo consciente de la oclusión.
- Preprocesado para pipelines de visión por computador: restaurar y estabilizar vídeo de vigilancia o de drones antes de pasarlo a modelos de detección o seguimiento, reduciendo ruido y artefactos que degradan la inferencia.
- Archivística y preservación digital: aplicar restauración y mejora en lote sobre colecciones filmadas, con checkpoints separados por tarea para controlar el coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el checkpoint base se distribuye en FP8 y el repositorio completo ocupa 30,3 GB, por lo que la inferencia requiere GPU con memoria dedicada considerable (no confirmado).
- GPU recomendadas: no disponibles en la documentación; por el tamaño del paquete y el uso de FP8, se orienta a GPUs de centro de datos (A100, H100) o a consumer de gama alta con suficiente VRAM, sin confirmación oficial.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: scripts incluidos en el repositorio (`run_restoration.sh`, `run_hd.sh`, `run_watermark_rm.sh`, `run_subtitle_rm.sh`) y librería `diffusers` con pipeline `video-to-video`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de vídeo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX2.3-ICEdit-Insight | no disponible | no disponible | Restauración y edición de vídeo (4 tareas) | Apache 2.0 | Hugging Face (Infinix-io) |
| Lightricks/LTX-2.3 (base) | no disponible | no disponible | Generación audio-vídeo | no disponible en la información | Hugging Face (Lightricks) |
| Otros modelos de restauración de vídeo | no disponible | no disponible | Restauración / superresolución | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al ser un modelo generativo de vídeo, puede reproducir sesgos presentes en los datos de entrenamiento del backbone LTX-2.3.
- Riesgo de alucinación visual: la reconstrucción generativa de zonas ocluidas (marcas de agua, subtítulos) puede inventar contenido plausible pero incorrecto; conviene revisar fotograma a fotograma en material crítico.
- Idioma: la model card declara únicamente inglés, lo que puede afectar a la eliminación de subtítulos en otros idiomas.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Lightricks/LTX-2.3, no detallada en la información disponible.
- Consistencia temporal: aunque el artículo propone FGLC para modelar la consistencia, no se publican métricas que cuantifiquen la estabilidad temporal en la release.
- Uso ético y legal: la eliminación de marcas de agua o subtítulos puede vulnerar derechos de autor o términos de servicio de terceros; su uso debe limitarse a contenido propio o debidamente licenciado.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por la comunidad.
- Despliegue: no se documentan requisitos mínimos de VRAM ni latencias, lo que dificulta planificar producción.

## Enlaces

- Hugging Face: https://huggingface.co/Infinix-io/LTX2.3-ICEdit-Insight
- Repositorio GitHub del proyecto: https://github.com/joyfoxai/LTX2-ICEdit-Insight
- README en GitHub: https://github.com/joyfoxai/LTX2-ICEdit-Insight/blob/main/release/hf/LTX2.3-ICEdit-Insight/README.md
- Organización JoyFox en Hugging Face: https://huggingface.co/joyfox
- Modelo base: https://huggingface.co/Lightricks/LTX-2.3
- Artículo (Research Square): https://www.researchsquare.com/article/rs-9775063/v1
- DOI: https://doi.org/10.21203/rs.3.rs-9775063/v1
- Ficha en Inferix: https://inferix.co/models/joyfox/LTX2.3-ICEdit-Insight
