# mustjabmalik51214/LTX-2

## Resumen

LTX-2.3 es un modelo fundacional de generacion de audio y video desarrollado por Lightricks, presentado en el paper "LTX-2: Efficient Joint Audio-Visual Foundation Model" (arXiv:2601.03233). Se trata de un modelo de difusion basado en arquitectura DiT (Diffusion Transformer) capaz de generar video y audio sincronizados dentro de un mismo modelo, con pesos abiertos y enfocado a ejecucion local. La variante principal, ltx-2.3-22b-dev, cuenta con 22.000 millones de parametros y es completamente entrenable en bf16, mientras que las versiones destiladas permiten inferencia en 8 pasos con CFG=1.

El modelo resuelve la generacion conjunta de audio y video, cubriendo tareas de texto a video, imagen a video, video a video, audio a video, texto a audio, video a audio y combinaciones multimodales (texto+imagen a audio+video). Frente a la version LTX-2 original, LTX-2.3 incorpora mejoras en calidad de audio y visual, ademas de un mayor cumplimiento de las instrucciones del prompt. Es relevante porque ofrece una alternativa de pesos abiertos a los sistemas propietarios de generacion de video con audio sincronizado, con un ecosistema de herramientas de entrenamiento (LoRA e IC-LoRA) y despliegue local.

La ficha que se presenta corresponde al repositorio de HuggingFace `mustjabmalik51214/LTX-2`, que actua como espejo no oficial del modelo de Lightricks. El repositorio oficial de referencia es `Lightricks/LTX-2`. El tamano del repositorio es de 156,0 GB y esta etiquetado con la biblioteca Diffusers y licencia ltx-2-community-license-agreement.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) para audio y video conjuntos |
| Parametros totales | 22.000 millones (variante ltx-2.3-22b-dev) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de difusion, no de lenguaje) |
| Tipos de cuantizacion | No disponible (se menciona entrenamiento e inferencia en bf16; no se detallan cuantizaciones publicadas) |
| Idiomas soportados | en, de, es, fr, ja, ko, zh, it, pt (segun etiquetas); la model card indica English en la seccion de detalles |
| Licencia | ltx-2-community-license-agreement |
| Formato de pesos | No especificado de forma explicita (biblioteca Diffusers; se asume safetensors) |

## Arquitectura y entrenamiento

LTX-2.3 es un modelo fundacional de difusion construido sobre una arquitectura DiT (Diffusion Transformer) que genera video y audio de forma conjunta y sincronizada dentro de un unico modelo. La family de checkpoints publicada incluye la version completa entrenable (ltx-2.3-22b-dev), variantes destiladas de 8 pasos con CFG=1 (ltx-2.3-22b-distilled y ltx-2.3-22b-distilled-1.1), LoRA destiladas de rango 384 aplicables al modelo completo (ltx-2.3-22b-distilled-lora-384 y su version 1.1), y upscalers espaciales y temporales (x2 y x1.5 espaciales, x2 temporal) disenados para pipelines multietapa.

En cuanto al entrenamiento, la model card indica que el modelo base (dev) es totalmente entrenable y que la reproduccion de los LoRA e IC-LoRA publicados es sencilla siguiendo las instrucciones del repositorio ltx-trainer. Se menciona que el entrenamiento para movimiento, estilo o parecido (sonido y apariencia) puede completarse en menos de una hora en muchos escenarios. No se detallan en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La destilacion de las variantes de 8 pasos es una de las optimizaciones destacadas para reducir el coste de inferencia.

## Capacidades

- Generacion de video a partir de texto (text-to-video) e imagen (image-to-video).
- Transformacion de video existente (video-to-video) y de imagen mas texto (image-text-to-video).
- Generacion de audio a partir de texto (text-to-audio) y de video (video-to-audio).
- Transformacion de audio (audio-to-audio) y generacion de audio a partir de video (audio-to-video).
- Generacion conjunta y sincronizada de audio y video a partir de texto, imagen, texto mas imagen, audio o imagen mas texto (text-to-audio-video, image-to-audio-video, image-text-to-audio-video).
- Upscaling espacial (x1.5 y x2) y temporal (x2) de latentes para pipelines multietapa de mayor resolucion o FPS.
- Personalizacion mediante LoRA e IC-LoRA entrenables para estilo, movimiento o parecido (voz y apariencia).
- No es un modelo de lenguaje: no soporta tool calling, function calling ni razonamiento multi-paso basado en agentes.

## Casos de uso

- Generacion de clips publicitarios con audio sincronizado: se puede generar un video a partir de una imagen de producto mas un prompt de texto, obteniendo audio y video coherentes en una sola pasada, gracias al modelo fundacional conjunto.
- Prototipado rapido de storyboards animados: a partir de bocetos o imagenes fijas, generar secuencias de video con movimiento y sonido para validar guiones antes de la produccion final.
- Doblaje y re-sonorizacion de video: usando las capacidades de video-to-audio y audio-to-audio para sustituir o generar pistas de audio sobre material de video existente.
- Creacion de contenido para redes sociales: generar clips cortos con audio integrado a partir de prompts de texto, reduciendo la necesidad de pipelines separados de video y audio.
- Postproduccion con escalado multietapa: emplear los upscalers espaciales x2 o x1.5 y el temporal x2 para aumentar la resolucion y el FPS de material generado en una primera etapa de baja resolucion.
- Personalizacion de estilo o personaje: entrenar LoRA de estilo o de parecido (voz y apariencia) en menos de una hora en muchos escenarios, para producir contenido consistente con una marca o un actor concreto.
- Animacion de material fotografico: convertir imagenes fijas (image-to-video) en clips animados con audio, util en sectores como inmobiliaria, turismo o educacion.
- Investigacion en generacion audiovisual: al ser un modelo de pesos abiertos y entrenable, sirve como base para experimentacion academica en difusion multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia orientativa, un modelo de 22.000 millones de parametros en bf16 requiere del orden de 44 GB solo para los pesos, sin contar activaciones ni latentes de video o audio; las variantes destiladas y cuantizadas reducen este requisito.
- GPU recomendadas: no especificadas en la model card. Para la variante completa se requieren GPU de gama profesional o de centro de datos con memoria suficiente (por ejemplo, series A100, H100 o equivalentes). No se confirma compatibilidad con GPU de consumo en la informacion disponible.
- Compatibilidad con GPU de consumo: no confirmada. El repositorio completo ocupa 156,0 GB, lo que obliga a seleccionar unicamente los checkpoints necesarios.
- Opciones de despliegue: codigo PyTorch propietario (monorepo LTX-2 con paquetes ltx-core, ltx-pipelines y ltx-trainer), nodos integrados de ComfyUI (LTXVideo) y soporte de Diffusers anunciado como proximo. El entorno probado requiere Python >=3.12, CUDA >12.7 y PyTorch ~=2.7.
- Latencia y throughput: no disponibles. Las variantes destiladas estan optimizadas para 8 pasos con CFG=1, lo que reduce el numero de pasos de muestreo respecto al modelo completo.
- Restricciones de resolucion y fotogramas: la anchura y la altura deben ser divisibles por 32, y el numero de fotogramas debe ser divisible por 8 mas 1. Si no lo son, la entrada debe rellenarse con -1 y recortarse despues.

## Comparativa con modelos similares

| Modelo | Parametros | Audio integrado | Pesos abiertos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-2.3 (22b-dev) | 22.000 millones | Si (audio y video sincronizados) | Si | ltx-2-community-license-agreement | HuggingFace oficial y espejo (repositorio analizado) |
| LTX-2.3 (22b-distilled) | 22.000 millones (destilado, 8 pasos, CFG=1) | Si | Si | ltx-2-community-license-agreement | Incluido en la family LTX-2.3 |
| LTX-2 (version anterior) | No disponible en la informacion | Si | Si | No disponible en la informacion | HuggingFace (Lightricks/LTX-2) |
| Otros modelos de video con audio (Wan, HunyuanVideo, etc.) | No disponible en la informacion | No verificado | Parcialmente | No disponible en la informacion | No disponible en la informacion |

Los datos de modelos alternativos no se detallan en la informacion proporcionada. No se dispone de cifras comparativas verificadas de parametros, contexto o rendimiento frente a otras familias.

## Limitaciones y advertencias

- El modelo no esta disenado ni es capaz de proporcionar informacion factual; su uso debe limitarse a generacion de contenido audiovisual.
- Como modelo estadistico, puede amplificar sesgos sociales existentes en los datos de entrenamiento.
- Puede fallar al generar videos que coincidan exactamente con las instrucciones del prompt.
- El cumplimiento del prompt depende en gran medida del estilo de redaccion utilizado (la propia model card remite a una guia de prompting).
- Puede generar contenido inapropiado u ofensivo; se recomienda filtrado y supervision en produccion.
- Cuando se genera audio sin habla, la calidad del audio puede ser inferior.
- La licencia ltx-2-community-license-agreement impone condiciones propias distintas de las licencias open source permisivas; es necesario revisar los terminos antes de un uso comercial.
- El repositorio analizado (`mustjabmalik51214/LTX-2`) es un espejo no oficial con 0 descargas y 0 likes; para produccion conviene acudir al repositorio oficial de Lightricks y verificar integridad de los pesos.
- La model card declara English en la seccion de detalles, aunque las etiquetas de idioma listan nueve idiomas; conviene validar el comportamiento multilingue antes de confiar en idiomas distintos del ingles.
- El soporte en Diffusers esta anunciado como proximo, por lo que la integracion con esa biblioteca puede no estar disponible en la fecha del repositorio.

## Enlaces

- Repositorio en HuggingFace (espejo analizado): https://huggingface.co/mustjabmalik51214/LTX-2
- Repositorio oficial de Lightricks en HuggingFace: https://huggingface.co/Lightricks/LTX-2
- Paper: https://huggingface.co/papers/2601.03233
- Repositorio de codigo: https://github.com/Lightricks/LTX-2
- Guia de entrenamiento (ltx-trainer): https://github.com/Lightricks/LTX-2/blob/main/packages/ltx-trainer/README.md
- Guia de inferencia (ltx-pipelines): https://github.com/Lightricks/LTX-2/blob/main/packages/ltx-pipelines/README.md
- Licencia: https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2
- Demo interactiva: https://app.ltx.studio/ltx-2-playground/i2v
- Playground de API: https://console.ltx.video/playground/
- Documentacion de ComfyUI: https://docs.ltx.video/open-source-model/integration-tools/comfy-ui
- Guia de prompting: https://ltx.video/blog/how-to-prompt-for-ltx-2
- Video de presentacion: https://youtu.be/o-7us-BR_gQ
- Documentacion de Diffusers: https://huggingface.co/docs/diffusers/main/en/index
