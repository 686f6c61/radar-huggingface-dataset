# Gameblamer/Flux_Lustly.ai_Uncensored_nsfw_v1

## Resumen

Flux_Lustly.ai_Uncensored_nsfw_v1 es un adaptador LoRA para generación de imágenes mediante texto, desarrollado por el usuario Gameblamer sobre el modelo base black-forest-labs/FLUX.1-dev. Su propósito es eliminar los filtros de seguridad y las restricciones de contenido del modelo base para permitir la generación de imágenes con desnudos y contenido erótico explícito (NSFW), algo que FLUX.1-dev bloquea por defecto mediante su safety checker y el entrenamiento de su text encoder.

El modelo se distribuye en formato safetensors a través de HuggingFace, con un tamaño de repositorio de aproximadamente 0,4 GB, lo que es coherente con un adaptador LoRA de bajo rango en lugar de un modelo completo. Se integra en el ecosistema de diffusers de Hugging Face mediante FluxPipeline, por lo que requiere cargar el modelo base FLUX.1-dev completo y aplicarle el LoRA encima. La licencia declarada es CreativeML Open RAIL-M, heredada del ecosistema Stable Diffusion, aunque el modelo base FLUX.1-dev está bajo una licencia no comercial propia de Black Forest Labs, lo que introduce una ambigüedad legal relevante.

Según la propia model card, este repositorio está archivado: el autor ha migrado su trabajo a un nuevo modelo llamado Z-Image-Uncensored (periwinklai/Z-Image-Uncensored) y su plataforma comercial Periwinkl.ai. Esto significa que el modelo ya no recibe mantenimiento ni actualizaciones, y su uso se desaconseja en favor del sucesor. Su relevancia actual es principalmente histórica y de referencia dentro del ecosistema de LoRAs uncensored sobre FLUX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre FLUX.1-dev (transformador de difusión rectificada flow matching) |
| Parametros totales | no disponible (adaptador de ~0,4 GB; el modelo base FLUX.1-dev tiene 12.000 millones de parámetros) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende de FLUX.1-dev y T5-XXL, que acepta prompts de texto largo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés) |
| Licencia | creativeml-openrail-m (declarada; ver advertencias por conflicto con la licencia del modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo no es un modelo de difusión independiente, sino un LoRA: un adaptador de matrices de bajo rango que se aplica sobre los bloques de atención del transformer de FLUX.1-dev. FLUX.1-dev emplea una arquitectura híbrida de 12.000 millones de parámetros con flow matching en espacio latente, un text encoder T5-XXL combinado con CLIP para el condicionamiento textual, y soporte nativo para la destilación de pasos de inferencia. El LoRA modifica el comportamiento del modelo base sin alterar sus pesos originales, lo que permite una distribución ligera (0,4 GB frente a los ~23 GB del checkpoint completo en fp16).

No se han publicado detalles sobre el proceso de entrenamiento: número de pasos, dataset utilizado, learning rate, rango del LoRA (rank) ni redes objetivo. Por la naturaleza del modelo, se deduce que el entrenamiento se realizó sobre imágenes NSFW con el objetivo de anular el alineamiento del modelo base, pero no hay datos verificables. Tampoco hay información sobre técnicas como decodificación especulativa ni sobre el uso de distillation; la inferencia hereda las características de FLUX.1-dev.

## Capacidades

- Generación de imágenes texto-a-imagen (text-to-image) mediante FluxPipeline de la librería diffusers.
- Generación de desnudos y contenido erótico explícito sin los filtros del modelo base, incluyendo estilos fotorealistas y cinematográficos.
- Hereda las capacidades generales de FLUX.1-dev: alta fidelidad fotográfica, buen seguimiento de prompts complejos y composiciones multi-sujeto.
- Compatibilidad con prompts de estilo descriptivo (épocas concretas como "estilo VHS años 70", escenas cinematográficas, iluminación de neón).
- Al ser un LoRA, puede combinarse con otros LoRAs y activarse o desactivarse sin recargar el modelo base.
- No soporta generación de vídeo, audio ni edición de imágenes (inpainting) de forma documentada.

## Casos de uso

- Generación de material artístico adulto: el modelo permite crear ilustraciones y fotografías sintéticas eróticas para proyectos creativos donde el modelo base bloquearía el contenido por su safety checker.
- Producción de contenido para plataformas para adultos: dado que el autor opera una plataforma comercial (Periwinkl.ai), el caso de uso principal es la generación de imágenes NSFW a demanda para servicios de suscripción.
- Exploración estilística con estética retro: los ejemplos de la model card muestran uso en estilos "VHS años 70" y "cinematográfico", útil para crear imágenes con estéticas de época que incluyan desnudez.
- Investigación sobre alineamiento y desactivación de filtros: permite estudiar cómo un LoRA ligero puede anular el comportamiento de seguridad de un modelo grande, relevante para investigación en seguridad de modelos generativos.
- Prototipado rápido de composiciones complejas: al basarse en FLUX.1-dev, mantiene la capacidad de seguir prompts largos y detallados con múltiples sujetos y elementos de escena.
- Pruebas de compatibilidad de LoRAs: al pesar solo 0,4 GB, es adecuado para probar pipelines de mezcla de adaptadores sobre FLUX.1-dev sin coste de almacenamiento significativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un LoRA para generación de imágenes, no aplica métricas tipo MMLU o HumanEval; no se han publicado métricas de calidad de imagen (FID, CLIP Score) ni comparativas con otros LoRAs NSFW sobre FLUX.

## Requisitos de hardware

- El LoRA en sí ocupa 0,4 GB en disco, pero la inferencia requiere cargar FLUX.1-dev completo (~12.000 millones de parámetros, unos 23 GB en fp16).
- VRAM estimada para inferencia con FLUX.1-dev en fp16: alrededor de 24 GB; con cuantización (por ejemplo, NF4 vía bitsandbytes o GGUF en ComfyUI) es posible bajar a 8-12 GB.
- GPU recomendadas: RTX 4090 (24 GB) para fp16 cómodo; RTX 3090 con cuantización; A100 o H100 para despliegue en servidor.
- En consumer GPU: viable en RTX 3090/4090 en fp16, y en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4070) usando cuantización de 4 u 8 bits.
- Opciones de despliegue: diffusers (FluxPipeline con `load_lora_weights`), ComfyUI y herramientas derivadas que soporten LoRAs de FLUX; no hay evidencia de soporte directo en Ollama (orientado a LLMs) ni en vLLM/TGI (orientados a texto).
- Latencia: no disponible; como referencia, FLUX.1-dev genera imágenes de 1024x1024 en unos 10-30 segundos por imagen en una RTX 4090 con 20-30 pasos, aunque esta cifra depende de la configuración y no está documentada para este LoRA.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Tamaño | Licencia | Estado |
|---|---|---|---|---|---|
| Flux_Lustly.ai_Uncensored_nsfw_v1 | LoRA NSFW | FLUX.1-dev | 0,4 GB | creativeml-openrail-m (declarada) | Archivado, sin mantenimiento |
| periwinklai/Z-Image-Uncensored | Modelo uncensored (sucesor oficial del mismo autor) | Z-Image | no disponible | no disponible | Activo, recomendado por el autor |
| black-forest-labs/FLUX.1-dev | Modelo base completo | — | ~23 GB (fp16) | Licencia no comercial de BFL | Activo, con filtros de contenido |

La alternativa recomendada por el propio autor es el sucesor periwinklai/Z-Image-Uncensored, disponible en https://huggingface.co/periwinklai/Z-Image-Uncensored.

## Limitaciones y advertencias

- Contenido para adultos explícito: el modelo está etiquetado como "not-for-all-audiences" y "nudity"; su uso está restringido a mayores de edad y puede incumplir las políticas de plataformas de despliegue (HuggingFace Spaces, servicios cloud comerciales).
- Riesgo de generación de contenido no consentido o ilegal: al eliminar los filtros, el modelo no bloquea la generación de personas reales identificables ni de contenido que pueda ser ilegal según la jurisdicción; es responsabilidad del usuario cumplir la legislación aplicable.
- Conflicto de licencias: el modelo declara CreativeML Open RAIL-M, pero FLUX.1-dev está bajo la licencia no comercial de Black Forest Labs; cualquier uso comercial de las salidas puede violar los términos del modelo base. Este punto es jurídicamente ambiguo y debe revisarse antes de cualquier despliegue comercial.
- Modelo archivado: el autor ha abandonado el mantenimiento en favor de Z-Image-Uncensored; no cabe esperar correcciones ni soporte.
- Sin documentación de entrenamiento: no se conocen el dataset, el rango del LoRA ni los hiperparámetros, lo que dificulta evaluar sesgos, reproducibilidad y calidad.
- Sesgos: hereda los sesgos de FLUX.1-dev y del dataset NSFW no documentado, con probable representación desproporcionada de ciertos tipos de cuerpo y estéticas, según se aprecia en los ejemplos de la model card.
- Alucinaciones/artefactos: al ser un LoRA sin documentación de calidad, pueden aparecer artefactos de imagen, anatomías incorrectas o degradación respecto al modelo base; no hay evaluaciones publicadas al respecto.
- Idioma: los prompts de ejemplo están en inglés; el rendimiento con prompts en castellano no está documentado y probablemente sea inferior al del inglés.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Gameblamer/Flux_Lustly.ai_Uncensored_nsfw_v1
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.1-dev
- Sucesor recomendado por el autor: https://huggingface.co/periwinklai/Z-Image-Uncensored
- Plataforma del autor: https://periwinkl.ai
