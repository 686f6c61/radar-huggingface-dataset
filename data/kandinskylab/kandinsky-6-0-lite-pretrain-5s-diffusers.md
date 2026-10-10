# kandinskylab/Kandinsky-6.0-Lite-pretrain-5s-Diffusers

## Resumen

Kandinsky 6.0 Lite es un modelo de difusión de la familia Kandinsky 6.0 Video, desarrollado por Kandinsky Lab, orientado a la generación sincronizada de vídeo y audio. Forma parte de una familia que incluye dos variantes: Lite (3B parámetros) y Pro (29B parámetros). Este repositorio contiene el checkpoint de preentrenamiento de la variante Lite, con 3.176.632.424 parámetros en formato safetensors y 35,3 GB de tamaño total del repositorio.

El modelo genera clips de vídeo de 5 segundos a 24 fotogramas por segundo con audio sincronizado a 44 kHz, incluyendo lip-sync, en dos modalidades: texto-a-audio-vídeo (T2AV) e imagen-a-audio-vídeo (TI2AV). Un modelo de superresolución complementario, empaquetado como pipeline independiente, eleva la resolución de salida hasta Full-HD (1920×1080). La arquitectura se basa en difusión con flow-matching sobre espacio latente K-VAE y emplea Qwen2.5-VL como codificador de texto.

Es relevante porque combina generación de vídeo y audio en un único pipeline con licencia MIT, lo que facilita su uso comercial, y cuenta con integraciones en Diffusers, vLLM, SGLang, FastVideo y ComfyUI. La variante Lite, al ser de 3B parámetros, apunta a despliegues más asequibles en comparación con la variante Pro de 29B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion con flow-matching sobre espacio latente K-VAE; codificador de texto Qwen2.5-VL |
| Parametros totales | 3.176.632.424 (aproximadamente 3B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusion; el codificador de texto es Qwen2.5-VL) |
| Tipos de cuantizacion | no disponible (los ejemplos emplean bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

Kandinsky 6.0 Video Lite es un modelo de difusion de tipo foundation para generacion sincronizada de audio y video. Segun la informacion disponible, utiliza un esquema de flow-matching (el checkpoint de superresolucion se describe explicitamente como flow-matching) y opera en un espacio latente K-VAE. El pipeline principal es `Kandinsky6TI2VAPipeline`, que cubre tanto la modalidad texto-a-audio-video (T2AV) como imagen-a-audio-video (TI2AV). Para el acondicionamiento de texto emplea Qwen2.5-VL, que ademas permite reescribir prompts breves en descripciones detalladas mediante la opcion `expand_prompts=True`, sin anadir pesos adicionales mas alla del propio codificador.

La generacion produce clips de 5 segundos (121 fotogramas a 24 fps en los ejemplos) con audio a 44 kHz, e incluye lip-sync. El modelo de superresolucion es un pipeline separado (`Kandinsky6SRPipeline`) que escala las imagenes por factores de x2, x2.25 o x4 mediante difusion por teselas en el espacio latente K-VAE, combinando teselas solapadas con ventanas de Hann. No se dispone de informacion detallada en la documentacion proporcionada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de video a partir de texto (texto-a-audio-video, T2AV) con audio sincronizado.
- Generacion de video a partir de una imagen de referencia (imagen-a-audio-video, TI2AV), condicionando el primer fotograma.
- Generacion de audio sincronizado a 44 kHz, incluyendo sincronizacion labial (lip-sync).
- Generacion de clips de 5 segundos a 24 fps (121 fotogramas en los ejemplos).
- Superresolucion posterior con factores de x2, x2.25 y x4 hasta Full-HD (1920x1080).
- Expansion de prompts: reescritura de prompts breves en descripciones detalladas mediante Qwen2.5-VL.
- Modo de generacion solo video (sin audio) mediante `sample_audio=False`.
- Integracion con multiples ecosistemas de inferencia: Diffusers, vLLM (vllm-omni), SGLang, FastVideo y ComfyUI.

## Casos de uso

- Publicidad y marketing de producto: generar clips de 5 segundos con audio sincronizado a partir de una descripcion o de una imagen del producto, utiles para anuncios cortos en redes sociales sin necesidad de rodaje.
- Prototipado rapido de storyboards audiovisuales: usar la modalidad TI2AV partiendo de un fotograma clave para previsualizar como continuaria una escena antes de producirla.
- Doblaje y sincronizacion labial: el lip-sync integrado permite generar video con audio coherente para avatares o personajes hablantes.
- Creacion de contenido para redes sociales: produccion de clips verticales u horizontales con banda sonora generada de forma conjunta, reduciendo el numero de herramientas necesarias.
- Enriquecimiento de catalogos y demos interactivas: animar imagenes estaticas de productos o ilustraciones anadiendo movimiento y audio para paginas web o escaparates digitales.
- Postproduccion y reescalado: aplicar el pipeline de superresolucion a material generado o existente para subir la resolucion hasta Full-HD con difusion por teselas.
- Investigacion en generacion multimodal: servir como base de referencia (3B, licencia MIT) para experimentos academicos en generacion conjunta de audio y video con codigo abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Los pesos del transformador suman aproximadamente 3,17B parametros; en bfloat16 requieren en torno a 6,4 GB solo para el modelo principal.
- El repositorio completo ocupa 35,3 GB, ya que incluye ademas el codificador de texto Qwen2.5-VL, los VAE y el modelo de superresolucion; la VRAM necesaria en inferencia es sensiblemente superior a la del solo transformador.
- El ejemplo oficial emplea `enable_model_cpu_offload()`, lo que indica que el pipeline esta disenado para ejecutarse con offloading cuando la VRAM es limitada.
- GPU recomendadas: no disponibles de forma explicita; por el tamano del pipeline, se espera que funcione en GPUs de gama alta para consumidor (por ejemplo, RTX 4090) y en GPUs de datacenter (A100, H100). No hay datos confirmados de compatibilidad especifica.
- Opciones de despliegue: Diffusers, vLLM (vllm-omni), SGLang, FastVideo y ComfyUI (todos enlazados desde la model card).
- Latencia y throughput: no disponibles. La generacion usa 50 pasos de inferencia por defecto (guidance_scale=5.0) y el modelo de superresolucion ejecuta 4 pasos por tesela; `expand_prompts=True` anade latencia adicional.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidades | Resolucion/duracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kandinsky 6.0 Video Lite (este modelo) | 3B | T2AV, TI2AV, superresolucion | 5 s, 24 fps, audio 44 kHz, hasta 1920x1080 | MIT | HuggingFace, Diffusers, vLLM, SGLang, FastVideo, ComfyUI |
| Kandinsky 6.0 Video Pro | 29B | T2AV, TI2AV, superresolucion | 5 s, 24 fps, audio 44 kHz, hasta 1920x1080 | no disponible | HuggingFace |
| Kandinsky 6 Image Pro | no disponible (arquitectura MoE) | Generacion y edicion de imagen | no disponible | no disponible | Kandinsky Lab |

No se dispone en la informacion proporcionada de otros modelos comparables de terceros (por ejemplo, generadores de video con audio sincronizado de otros laboratorios) con datos verificables.

## Limitaciones y advertencias

- El modelo es un checkpoint de preentrenamiento ("pretrain"), no una version ajustada para uso final; puede requerir ajuste adicional para resultados optimos.
- No se dispone de informacion sobre sesgos del dataset de entrenamiento ni sobre evaluaciones de seguridad.
- Riesgo de alucinacion y de artefactos propios de los modelos de difusion: incoherencias temporales, deformaciones o desincronizacion entre audio y video no estan cuantificadas en la informacion disponible.
- No se documentan los idiomas soportados para el texto de los prompts; el soporte multilingue no esta confirmado.
- La duracion esta limitada a clips de 5 segundos; no se indica soporte para videos mas largos de forma nativa.
- La licencia MIT permite uso comercial, pero se debe verificar la licencia del codificador de texto Qwen2.5-VL y de los demas componentes (VAE, superresolucion), que podrian tener condiciones propias.
- Requiere recursos considerables: repositorio de 35,3 GB y offloading de CPU en configuraciones de VRAM limitada.
- No hay datos publicados de benchmarks ni de rendimiento, por lo que la calidad relativa frente a alternativas no puede validarse con las cifras disponibles.

## Enlaces

- HuggingFace: https://huggingface.co/kandinskylab/Kandinsky-6.0-Lite-pretrain-5s-Diffusers
- Informe tecnico (arXiv): https://arxiv.org/abs/2610.05608
- PDF del informe: https://arxiv.org/pdf/2610.05608
- Web de Kandinsky Lab: https://kandinskylab.ai/
- Pagina de modelos de video: https://kandinskylab.ai/models/video/
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/kandinskylab/Kandinsky-6.0-Pro-distill-5s
- Documentacion de Diffusers: https://huggingface.co/docs/diffusers/main/en/api/pipelines/kandinsky6
- Documentacion de vLLM (omni): https://docs.vllm.ai/projects/vllm-omni/en/latest/api/vllm_omni/diffusion/models/kandinsky6/
- Documentacion de SGLang: https://docs.sglang.io/cookbook/diffusion/Kandinsky/Kandinsky6
- FastVideo: https://haoailab.com/FastVideo/inference/kandinsky6/
- ComfyUI (registry): https://registry.comfy.org/nodes/kandinsky6
- Coleccion Diffusers: https://huggingface.co/collections/kandinskylab/kandinsky-60-diffusers
- Generador online de terceros: https://kandinsky6.pro/
