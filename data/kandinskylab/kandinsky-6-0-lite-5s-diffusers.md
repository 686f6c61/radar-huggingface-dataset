# kandinskylab/Kandinsky-6.0-Lite-5s-Diffusers

# Kandinsky 6.0 Lite (5s): difusion para generacion de video y audio sincronizados

## Resumen

Kandinsky 6.0 Video es una familia de modelos de difusion desarrollada por KandinskyLab para la generacion de video con audio sincronizado. La familia se compone de dos variantes, Lite (3B parametros) y Pro (29B parametros); este repositorio contiene el checkpoint **Kandinsky 6.0 Lite 5s**, con 3.176.632.424 parametros reales declarados en los pesos safetensors.

El modelo resuelve un problema concreto: la generacion conjunta de video y audio en un unico pipeline, con modos texto-a-audio-video (T2AV) e imagen-a-audio-video (TI2AV). Produce clips de 5 segundos a 24 fps (121 fotogramas) con audio de 44 kHz, incluyendo lip-sync, partiendo de una resolucion nativa de 480×864 y pudiendo escalar hasta Full-HD (1920×1080) mediante un modelo de superresolucion enchufable.

Es relevante ahora porque, a diferencia de la mayoria de modelos abiertos de video de su categoria, incorpora la pista de audio en el propio proceso de generacion y no como un paso posterior, y porque se distribuye bajo licencia MIT, sin restricciones de uso comercial. El modelo usa un codificador de texto Qwen2.5-VL y esta integrado en diffusers, vLLM (vllm-omni) y ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para generacion de video y audio; pipeline `Kandinsky6TI2VAPipeline` en diffusers; espacio latente K-VAE |
| Parametros totales | 3.176.632.424 (~3,18 mil millones), segun pesos safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusion, no usa ventana de contexto de LLM); el codificador de texto es Qwen2.5-VL |
| Tipos de cuantizacion | bfloat16 por defecto; no se documentan variantes GGUF, INT8 o FP8 oficiales |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (integrados en diffusers) |

## Arquitectura y entrenamiento

El modelo es un sistema de difusion multimodal que genera de forma conjunta una secuencia de video y una pista de audio. En diffusers se expone como `Kandinsky6TI2VAPipeline`, con dos modos de entrada: T2AV (solo prompt de texto) y TI2AV (imagen de referencia que condiciona el primer fotograma, redimensionada y recortada al tamano de salida). La generacion usa por defecto 50 pasos de inferencia, `guidance_scale` 5.0, 121 fotogramas a 24 fps (5 segundos) y una resolucion nativa de 480×864. El codificador de texto es Qwen2.5-VL, que ademas puede reescribir prompts cortos en descripciones detalladas mediante la opcion `expand_prompts=True` (anade latencia, sin pesos adicionales).

La superresolucion se implementa en un pipeline independiente, `Kandinsky6SRPipeline`, que escala ×2, ×2.25 o ×4 con difusion por teselas en el espacio latente del K-VAE, mezclando teselas solapadas con ventanas de Hann. El checkpoint de superresolucion es de tipo flow-matching y ejecuta 4 pasos por tesela. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste tipo RLHF o DPO, por lo que esos datos figuran como no disponibles.

## Capacidades

- Generacion de video a partir de texto (T2AV).
- Generacion de video a partir de imagen (TI2AV), condicionando el primer fotograma con una imagen de referencia.
- Generacion de audio sincronizado a 44 kHz en el mismo proceso, incluyendo lip-sync.
- Salida de 5 segundos a 24 fps (121 fotogramas).
- Resolucion nativa de 480×864, ampliable a Full-HD (1920×1080) con el pipeline de superresolucion ×2, ×2.25 o ×4.
- Modo de solo video desactivando el audio (`sample_audio=False`).
- Expansion automatica de prompts con el codificador Qwen2.5-VL (`expand_prompts=True`).
- No es un modelo de lenguaje: no ofrece tool calling, uso de agentes, razonamiento multi-paso ni conversacion multilingue.

## Casos de uso

- Publicidad y piezas cortas: generar clips de 5 segundos con audio ya sincronizado para anuncios en redes, sin necesidad de doblaje posterior ni de una fase separada de sonorizacion.
- Storyboards y prevision visual: convertir un prompt o una ilustracion en un clip animado a 24 fps para validar planos, iluminacion y ritmo antes de producir en 3D o rodaje real.
- Animacion de imagenes fijas para e-commerce: usar el modo TI2AV para dar movimiento y sonido a fotografias de producto, generando microvideos de catalogo.
- Localizacion y doblaje con lip-sync: aplicar el modelo sobre un fotograma de entrada y generar audio alineado con el movimiento labial, util en contenidos que deben reemitirse en otro idioma o con nueva locucion.
- Postproduccion y acabado: usar `Kandinsky6SRPipeline` para reescalar material generado a Full-HD (1920×1080) antes del montaje final.
- Efectos de sonido y ambiente: generar pistas de audio (lluvia, truenos, impactos, ambiente) sincronizadas con eventos visuales descritos en el prompt.
- Investigacion multimodal: servir de referencia para estudiar la generacion conjunta de video y audio y la coherencia temporal entre ambas modalidades.
- Contenido social en formato corto: producir bucles de 5 segundos con audio para plataformas que priorizan clips breves.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y los tags del repositorio no incluyen tablas de metricas (FVD, CLIP, similitud de audio u otras) ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

Estimaciones basadas en el recuento de parametros y en el tamano del repositorio; los valores de rendimiento no estan confirmados por el autor.

- Pesos del difusor: 3,18 mil millones de parametros en bfloat16 equivalen a unos 6,4 GB. El repositorio completo ocupa 35,3 GB, ya que incluye el codificador de texto, el VAE y los componentes asociados.
- VRAM estimada para inferencia con todos los componentes en GPU: del orden de 30-40 GB (estimacion).
- Con `enable_model_cpu_offload()`, que es la ruta que documenta la propia model card, el consumo se reduce de forma notable y el modelo puede ejecutarse en GPU de consumo; una RTX 4090 de 24 GB es un objetivo razonable con offload (estimacion).
- GPU recomendadas: A100 80 GB o H100 80 GB para inferencia sin offload y lotes grandes; RTX 4090, RTX 3090 o A6000 con offload para uso individual.
- Opciones de despliegue: diffusers (`Kandinsky6TI2VAPipeline` y `Kandinsky6SRPipeline`), vLLM mediante `vllm-omni` y ComfyUI a traves del nodo oficial en el registro. SGLang y FastVideo aparecen referenciados pero desactivados en la model card, por lo que no estan disponibles.
- Latencia y throughput: no disponibles. Se conocen los parametros de generacion (50 pasos por defecto, 121 fotogramas y 4 pasos por tesela en superresolucion), pero no se publican tiempos medidos. Para la superresolucion, el propio autor recomienda `torch._inductor.config.max_autotune = True` para seleccionar teselas de flex-attention compatibles con la mascara del bloque de SR.

## Comparativa con modelos similares

Comparacion cualitativa con otros modelos abiertos de generacion de video. Los datos de las alternativas proceden de sus model cards publicas y deben verificarse en la fuente original; no se incluyen metricas porque no hay benchmarks comparables publicados para Kandinsky 6.0 Lite en la informacion disponible.

| Modelo | Parametros | Duracion tipica | Audio nativo | Licencia |
|---|---|---|---|---|
| Kandinsky 6.0 Lite (este) | 3,18 mil millones | 5 s a 24 fps, 480×864 (hasta 1920×1080 con SR) | Si, 44 kHz con lip-sync | MIT |
| Kandinsky 6.0 Pro | 29 mil millones | 5 s | Si, 44 kHz con lip-sync | MIT (segun la familia) |
| Wan 2.1 | ~14 mil millones | Clips cortos de varios segundos | No (variante base) | Apache 2.0 |
| LTX-Video | ~2 mil millones | Clips cortos, enfoque en velocidad | No | Licencia propia de Lightricks |
| HunyuanVideo | ~13 mil millones | Clips cortos de alta resolucion | No | Licencia comunitaria de Tencent |
| CogVideoX-5B | ~5 mil millones | Clips cortos | No | Licencia propia |

El principal diferenciador de Kandinsky 6.0 Lite frente a estas alternativas es la generacion de audio sincronizado dentro del mismo pipeline y la licencia MIT sin restricciones comerciales. A cambio, su resolucion nativa (480×864) es inferior a la de modelos orientados a alta resolucion, que requieren superresolucion o un modelo mayor.

## Limitaciones y advertencias

- Duracion fija: la variante Lite 5s genera clips de 5 segundos; no se documenta soporte para duraciones mayores.
- Resolucion nativa limitada a 480×864; alcanzar Full-HD exige pasar por el pipeline de superresolucion, lo que anade coste computacional.
- Idiomas soportados no disponibles: no se especifica que lenguas entiende el codificador de texto ni la cobertura multilingue de los prompts.
- Datos de entrenamiento no divulgados: no se detalla la composicion del dataset, por lo que los sesgos presentes en el modelo son desconocidos.
- Riesgo de artefactos propios de la difusion: incoherencia temporal entre fotogramas, deformaciones anatomicas, texto ilegible y desincronizacion ocasional entre audio e imagen.
- El audio generado puede no encajar perfectamente en escenas con dialogo; la propia model card recomienda prompts sin dialogo, texto ni logotipos.
- Licencia MIT: permite uso comercial sin restricciones, pero el usuario sigue siendo responsable del contenido generado y de los derechos sobre las imagenes de entrada.
- Adopcion muy baja en el momento de la consulta (53 descargas, 12 likes) y publicacion reciente, lo que reduce la base de validacion comunitaria.
- Referencia a un paper (arXiv 2610.05608) cuya disponibilidad y contenido no se han podido verificar en la informacion proporcionada.
- El despliegue sin offload exige hardware de gama alta (del orden de 30-40 GB de VRAM estimados), lo que limita su uso en entornos de consumo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kandinskylab/Kandinsky-6.0-Lite-5s-Diffusers
- Informe tecnico (arXiv): https://arxiv.org/pdf/2610.05608
- Pagina de modelos de video de KandinskyLab: https://kandinskylab.ai/models/video/
- Demo en HuggingFace Spaces (variante Pro distill 5s): https://huggingface.co/spaces/kandinskylab/Kandinsky-6.0-Pro-distill-5s
- Documentacion del pipeline en diffusers: https://huggingface.co/docs/diffusers/main/en/api/pipelines/kandinsky6
- Documentacion de vLLM (vllm-omni) para Kandinsky 6: https://docs.vllm.ai/projects/vllm-omni/en/latest/api/vllm_omni/diffusion/models/kandinsky6/
- Nodo de ComfyUI: https://registry.comfy.org/nodes/kandinsky6
