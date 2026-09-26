# SimpleTuner/Qwen-Image-2.1-LoRA-photo-aesthetics-v2

## Resumen

Qwen-Image-2.1-LoRA-photo-aesthetics-v2 es un adaptador LoRA de rango 32 publicado por SimpleTuner sobre el modelo de difusión text-to-image Qwen/Qwen-Image-2.1 (revisión `790c92633540aa0cb11d9abf19eb46d861714758`). No es un modelo completo: el repositorio contiene exclusivamente los pesos del adaptador (`pytorch_lora_weights.safetensors`, 256 tensores) más artefactos auxiliares de entrenamiento. Su objetivo es desplazar la estética de generación del modelo base hacia fotografía de aspecto fotorrealista (retratos y escenas de calle, según las muestras publicadas).

El entrenamiento se realizó con SimpleTuner durante 50.000 actualizaciones en una única H100, con resolución multiescala de 512 y 1024 píxeles sobre buckets de aspecto nativo sin recorte, usando el dataset `webshart/terminusresearch-photo-aesthetics` (29.760 imágenes aceptadas por backend de resolución) y sin datasets de regularización. Incorpora REPA con características de parche de DINOv2-G (tamaño 518, bloque 8, peso 0,5) y un asistente de entrenamiento v2 congelado, que se desactiva en inferencia.

Su relevancia es doble: por un lado, documenta una receta reproducible de ajuste estético multiescala sobre un difusor de última generación; por otro, publica exportaciones intermedias en los pasos 10k, 20k, 30k, 40k y 50k, lo que permite evaluar la evolución estética durante el entrenamiento. El repositorio está etiquetado como experimental, con 0 descargas y 0 «likes» en el momento de redactar esta ficha, y se distribuye bajo licencia `qwen-research`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Tipo de artefacto | Adaptador LoRA (no modelo completo) |
| Arquitectura | LoRA sobre el modelo de difusión text-to-image Qwen/Qwen-Image-2.1; rango 32, alpha 32, 256 tensores LoRA |
| Parametros totales | No disponible (el repositorio ocupa 0,5 GB; no se publica el recuento de parámetros del adaptador) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible (modelo de difusión text-to-image; no se especifica límite de tokens de prompt) |
| Tipos de cuantizacion | Pesos del adaptador en BF16; no se documentan variantes cuantizadas (GGUF, FP8, etc.) en este repositorio |
| Idiomas soportados | No disponible (no se declaran idiomas; el prompt sigue el tokenizador del modelo base) |
| Licencia | `qwen-research` (license_name: qwen-research, license_link: LICENSE) |
| Formato de pesos | `pytorch_lora_weights.safetensors` (raíz del repo y carpetas `checkpoints/step-*/`); `repa_projector.safetensors` adicional en cada checkpoint |
| Modelo base | Qwen/Qwen-Image-2.1, revisión `790c92633540aa0cb11d9abf19eb46d861714758` |
| Dataset de entrenamiento | `webshart/terminusresearch-photo-aesthetics` (29.760 imágenes aceptadas por resolución) |
| Pipeline | text-to-image |
| Fuerza de adaptador recomendada | 1,0 |
| Actualizaciones de entrenamiento | 50.000 |
| Hardware de entrenamiento | 1 × H100 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA inyectado sobre Qwen-Image-2.1, un difusor text-to-image cuyo detalle interno no se describe en la información disponible. El adaptador tiene rango 32 y alpha 32, con 256 tensores LoRA verificados como idénticos al checkpoint de entrenamiento guardado. El asistente de entrenamiento v2 y el proyector REPA no son necesarios para inferencia; el proyector sí se conserva en los checkpoints (cuatro tensores en `repa_projector.safetensors`) exclusivamente como material de entrenamiento.

La receta de entrenamiento es la siguiente:

| Ajuste | Valor |
|---|---|
| Base | Qwen/Qwen-Image-2.1, revisión `790c92633540aa0cb11d9abf19eb46d861714758` |
| Datos | `webshart/terminusresearch-photo-aesthetics`, 29.760 imágenes aceptadas por backend de resolución |
| Resolución de entrenamiento | Objetivos de área de 512 y 1024 píxeles, buckets de aspecto nativo, sin recorte |
| Muestreo | Muestreador probabilístico ordinario, 0,5 por resolución |
| Actualizaciones / hardware | 50.000 / una H100 |
| Batch / acumulación | 1 / 1 |
| Rango / alpha de LoRA | 32 / 32 |
| Optimizador | AdamW BF16, LR `1e-4`, norm clipping `1.0` |
| Planificador de LR | 25 actualizaciones de warmup, después constante |
| Asistente | Training assistant v2 congelado, fuerza 1 en entrenamiento y 0 en validación |
| Datasets de regularización | Ninguno |
| REPA | Características de parche de DINOv2-G, tamaño 518, bloque 8, peso 0,5, alineación espacial |
| Planificador de flujo | Auto shift activado |
| Gradient checkpointing | Intervalo 2 |
| Precisión | BF16 |
| VAE | VAE original de Qwen 2.1; tiling desactivado |

Las muestras cualitativas publicadas emplean semilla 42, 40 pasos de inferencia, CFG real de 1, VAE original y sin adaptador de asistente. La model card indica explícitamente que se trata de comparaciones cualitativas de semilla fija, no de un benchmark puntuado. Los checkpoints exportados no son reanudables por completo: no incluyen estado de optimizador ni de muestreador.

## Capacidades

- Generación de imágenes text-to-image con sesgo estético hacia fotografía realista, integrada sobre el modelo base Qwen-Image-2.1.
- Producción multiescala: el mismo checkpoint entrenado se evaluó con salidas a 512 px y 1024 px, con buckets de aspecto nativo y sin recorte.
- Retratos y escenas de calle: la model card indica que las muestras finales de retrato y calle conservan estructura fotográfica coherente.
- Transferencia de estilo estético mediante inyección LoRA a fuerza 1,0, sin reentrenar el modelo base.
- Evaluación de progresión estética: exportaciones en 10k, 20k, 30k, 40k y 50k permiten comparar cambios de estilo y adherencia al prompt a lo largo del entrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un adaptador de difusión, no un modelo de lenguaje.
- No se declaran capacidades multilingües, de visión (entrada de imagen) ni thinking mode.

## Casos de uso

- Producción de retratos sintéticos con acabado fotográfico: cargando el adaptador a fuerza 1,0 sobre Qwen-Image-2.1 se obtiene un sesgo estético fotográfico sin reentrenar el difusor, útil para estudios que necesitan lotes de retratos coherentes a 1024 px.
- Generación de imágenes de producto para catálogos: el entrenamiento en buckets de aspecto nativo sin recorte permite producir encuadres verticales y horizontales sin deformar el sujeto, ajustándose a fichas de e-commerce.
- Creación de material de stock para webs y campañas: el ajuste estético permite generar fondos y escenas de aspecto fotográfico a 512 px para previsualizaciones rápidas y a 1024 px para versiones finales.
- Investigación en fine-tuning de difusores: el repositorio publica `recipe/config.json`, `dataloader.json`, `prompts.json` y `training_provenance.json`, lo que sirve como caso de estudio reproducible de una receta SimpleTuner con REPA y planificador de flujo con auto shift.
- Estudio de dinámica de entrenamiento LoRA: las cinco exportaciones intermedias permiten analizar en qué punto aparece el cambio estético y si la adherencia al prompt se degrada, usando las muestras de semilla fija como referencia.
- Personalización de pipelines de generación por lotes en ComfyUI o Diffusers: al ser un LoRA en safetensors, se puede cargar y descargar por job, de modo que un mismo despliegue del modelo base alterne entre estética base y estética fotográfica.
- Exploración de fotografía editorial y previsualización de estilo: fotógrafos y directores de arte pueden validar una dirección estética antes de un rodaje real, generando referencias a dos resoluciones con los mismos prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks puntuados en la informacion disponible. La model card indica explícitamente que las comparaciones incluidas son cualitativas, de semilla fija (semilla 42, 40 pasos, CFG real 1), y que no constituyen un benchmark con puntuación. Se ofrecen seis prompts de evaluación en cinco checkpoints (10k, 20k, 30k, 40k y 50k) a dos resoluciones de salida (512 px y 1024 px), con el modelo base a la izquierda y el modelo entrenado a la derecha en cada par.

## Requisitos de hardware

- El entrenamiento publicado se completó en 1 × H100 con batch 1, acumulación 1, precisión BF16 y gradient checkpointing con intervalo 2.
- El adaptador en sí ocupa aproximadamente 0,5 GB en el repositorio; la VRAM de inferencia vendrá determinada por el modelo base Qwen-Image-2.1, cuyo requisito no se especifica en la informacion disponible.
- No se documentan requisitos de VRAM de inferencia, GPU mínimas ni consumo en GPU de consumo (RTX 4090, etc.) para este adaptador.
- No se documentan opciones de despliegue específicas. Por el formato (`safetensors` LoRA sobre un difusor) es compatible con cargadores de adaptadores tipo Diffusers o ComfyUI; vLLM, llama.cpp, Ollama y TGI no aplican a un modelo de difusión.
- No se publican datos de latencia ni throughput.
- Para reproducir el entrenamiento se necesitaría hardware equivalente a la H100 usada, según la receta publicada.

## Comparativa con modelos similares

| Modelo / artefacto | Tipo | Base | Entrenamiento | Resoluciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen-Image-2.1-LoRA-photo-aesthetics-v2 (este) | LoRA rango 32 | Qwen/Qwen-Image-2.1 | 50.000 actualizaciones, datos multiescala 512/1024, REPA, asistente v2 congelado, sin regularización | Entrenamiento y salida a 512 y 1024 px | qwen-research | Repo con checkpoints 10k–50k; 0 descargas, 0 likes |
| Qwen-Image-2.1-LoRA-photo-aesthetics-50k (experimento anterior del mismo autor) | LoRA foto-estética | Qwen/Qwen-Image-2.1 | 50.000 actualizaciones; receta previa, sin el enfoque multiescala de v2 | No disponible en la informacion proporcionada | qwen-research | Publicado por el mismo autor, referenciado como experimento previo |
| Qwen/Qwen-Image-2.1 (modelo base sin adaptador) | Modelo de difusión completo | — | No aplica | No disponible en la informacion proporcionada | qwen-research (según el repo del adaptador) | Público en HuggingFace |

No se dispone de información sobre otros adaptadores foto-estéticos comparables de terceros en la documentación proporcionada.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: sin cargar Qwen-Image-2.1 no genera nada.
- El entrenamiento no usó datasets de regularización, lo que aumenta el riesgo de sobreajuste a la distribución estética de `webshart/terminusresearch-photo-aesthetics` (29.760 imágenes por resolución) y de degradar la diversidad respecto al modelo base.
- Riesgo de reproducción de sesgos presentes en el dataset de fotografía empleado, tanto de representación de personas como de estilo y composición.
- No hay resultados de benchmarks puntuados ni validación por terceros; el repositorio tiene 0 descargas y 0 «likes», por lo que no existe evidencia externa de calidad.
- Los checkpoints exportados no son reanudables: no incluyen estado de optimizador ni de muestreador. Solo sirven como pesos de inferencia (o para continuar desde los pesos, no desde el estado exacto).
- Licencia `qwen-research`: es una licencia de investigación, con posibles restricciones para uso comercial. Debe revisarse el fichero LICENSE antes de cualquier despliegue en producción.
- La model card advierte de que la adherencia al prompt y el estilo cambian entre checkpoints; el comportamiento no es homogéneo a lo largo de las 50.000 actualizaciones.
- El asistente de entrenamiento v2 queda desactivado en inferencia; activarlo no forma parte del flujo previsto y no está documentado para uso final.
- El repositorio está etiquetado como `experimental` por su propio autor.
- No se documentan idiomas, límites de prompt ni comportamiento multilingüe, por lo que la respuesta a prompts en castellano no está verificada.
- Se recomienda cargar el adaptador sobre la revisión concreta del modelo base indicada en la receta; otras revisiones pueden dar resultados distintos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SimpleTuner/Qwen-Image-2.1-LoRA-photo-aesthetics-v2
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Dataset de entrenamiento: https://huggingface.co/datasets/webshart/terminusresearch-photo-aesthetics
- Training assistant v2 (congelado, usado solo en entrenamiento): https://huggingface.co/SimpleTuner/Qwen-Image-2.1-training-assistant-v2
- Experimento previo photo-aesthetics 50k: https://huggingface.co/SimpleTuner/Qwen-Image-2.1-LoRA-photo-aesthetics-50k
- Configuración de la receta: https://huggingface.co/SimpleTuner/Qwen-Image-2.1-LoRA-photo-aesthetics-v2/blob/main/recipe/config.json
- Configuración del dataloader: https://huggingface.co/SimpleTuner/Qwen-Image-2.1-LoRA-photo-aesthetics-v2/blob/main/recipe/dataloader.json
- Prompts de evaluación: https://huggingface.co/SimpleTuner/Qwen-Image-2.1-LoRA-photo-aesthetics-v2/blob/main/recipe/prompts.json
- Auditoría de entrenamiento: https://huggingface.co/SimpleTuner/Qwen-Image-2.1-LoRA-photo-aesthetics-v2/blob/main/training_provenance.json
- Hashes de artefactos: https://huggingface.co/SimpleTuner/Qwen-Image-2.1-LoRA-photo-aesthetics-v2/blob/main/artifacts.json
- Hashes de imágenes: https://huggingface.co/SimpleTuner/Qwen-Image-2.1-LoRA-photo-aesthetics-v2/blob/main/images.json
- Licencia: https://huggingface.co/SimpleTuner/Qwen-Image-2.1-LoRA-photo-aesthetics-v2/blob/main/LICENSE
- Pesos finales (50k): https://huggingface.co/SimpleTuner/Qwen-Image-2.1-LoRA-photo-aesthetics-v2/blob/main/pytorch_lora_weights.safetensors
- Checkpoint 10k: https://huggingface.co/SimpleTuner/Qwen-Image-2.1-LoRA-photo-aesthetics-v2/tree/main/checkpoints/step-10000
- Checkpoint 20k: https://huggingface.co/SimpleTuner/Qwen-Image-2.1-LoRA-photo-aesthetics-v2/tree/main/checkpoints/step-20000
- Checkpoint 30k: https://huggingface.co/SimpleTuner/Qwen-Image-2.1-LoRA-photo-aesthetics-v2/tree/main/checkpoints/step-30000
- Checkpoint 40k: https://huggingface.co/SimpleTuner/Qwen-Image-2.1-LoRA-photo-aesthetics-v2/tree/main/checkpoints/step-40000
- Checkpoint 50k: https://huggingface.co/SimpleTuner/Qwen-Image-2.1-LoRA-photo-aesthetics-v2/tree/main/checkpoints/step-50000
