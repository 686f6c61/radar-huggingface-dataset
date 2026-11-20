# kandinskylab/Kandinsky-6.0-Lite-distill-5s-Diffusers

## Resumen

Kandinsky 6.0 Lite es un modelo de difusion para generacion conjunta de video y audio sincronizado, desarrollado por KandinskyLab. Forma parte de la familia Kandinsky 6.0 Video, que incluye una variante Lite de 3B parametros y una variante Pro de 29B. El checkpoint de este repositorio es la version Lite destilada, capaz de generar clips de 5 segundos a 24 fps con audio sincronizado a 44 kHz, incluyendo lip-sync, en modos texto-a-audio-video (T2AV) e imagen-a-audio-video (TI2AV).

El modelo resuelve el problema de la generacion multimodal unificada: en lugar de encadenar un generador de video y otro de audio, produce ambos flujos de forma conjunta, lo que permite sincronizacion fina entre eventos visuales y sonoros. La version destilada reduce el muestreo a 10 pasos con el scheduler PiFlow, lo que rebaja drasticamente el coste de inferencia frente a los 50 pasos de los checkpoints no destilados.

Con 3.177.988.112 parametros reales en safetensors y un repo de 34,3 GB, el modelo se distribuye en formato diffusers con licencia MIT, lo que facilita su integracion en pipelines de produccion y su uso comercial. Su relevancia actual radica en que democratiza la generacion audio-video sincronizada en un rango de parametros que cabe en GPUs de gama alta consumer o profesional de un solo nodo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (flow matching) para generacion conjunta de video y audio; pipeline `Kandinsky6TI2VAPipeline` en diffusers |
| Parametros totales | 3.177.988.112 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; modelo de difusion) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el ejemplo oficial usa `torch.bfloat16` |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

Kandinsky 6.0 Lite es un modelo de difusion basado en flow matching que genera de forma conjunta un flujo de video y un flujo de audio sincronizado. La familia se presenta en el paper arXiv:2610.05608 como un conjunto de modelos fundacionales para generacion texto-a-audio-video sincronizada. El checkpoint de este repositorio es la variante destilada, disenada para muestrear en 10 pasos con el scheduler PiFlow y `guidance_scale=1.0`, frente a los 50 pasos y guidance 5.0 de los checkpoints no destilados.

El pipeline incorpora un text encoder basado en Qwen2.5-VL, que ademas permite la opcion `expand_prompts=True` para reescribir prompts cortos en descripciones detalladas antes de la codificacion, sin anadir pesos extra al modelo. La generacion de audio se realiza a 44 kHz e incluye sincronizacion labial. Existe un pipeline separado de superresolucion, `Kandinsky6SRPipeline`, que escala los fotogramas generados por factores de x2, x2.25 o x4 mediante difusion por tiles en el espacio latente de K-VAE, con mezcla de tiles solapados mediante ventanas de Hann, permitiendo alcanzar Full-HD (1920x1080). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de video de 5 segundos a 24 fps con 121 fotogramas por defecto.
- Generacion de audio sincronizado a 44 kHz, incluyendo lip-sync.
- Modo texto-a-audio-video (T2AV): genera video y audio a partir de un prompt textual.
- Modo imagen-a-audio-video (TI2AV): condiciona el primer fotograma a una imagen de referencia, que se redimensiona y recorta al centro a las dimensiones solicitadas.
- Generacion solo de video mediante `sample_audio=False`.
- Expansion automatica de prompts mediante `expand_prompts=True`, usando el text encoder Qwen2.5-VL.
- Superresolucion posterior mediante `Kandinsky6SRPipeline` con factores x2, x2.25 y x4.
- Resoluciones de salida configurables (el ejemplo oficial usa 480x864).
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, al no ser un modelo de lenguaje.

## Casos de uso

- Generacion de clips publicitarios cortos: el modelo produce 5 segundos de video con audio sincronizado en una sola pasada, adecuado para spots en redes sociales donde la sincronizacion de sonido y accion es critica.
- Prototipado rapido de storyboards animados: a partir de una imagen clave (TI2AV) se puede animar un frame de concepto con movimiento y ambiente sonoro, acelerando la validacion creativa antes de producir en 3D.
- Creacion de contenido para videojuegos: generacion de cinemáticas cortas o loops de ambiente con audio integrado, usando `sample_audio=False` cuando solo se necesita el metraje visual.
- Doblaje y lip-sync automatizado: la generacion conjunta de audio y video con sincronizacion labial permite experimentar con escenas habladas o efectos sonoros alineados con la accion.
- Postproduccion y escalado: el pipeline de superresolucion `Kandinsky6SRPipeline` permite partir de una generacion a 480x864 y escalar hasta Full-HD con tiles, integrable en flujos de trabajo existentes.
- Investigacion en generacion multimodal: al ser un modelo de 3B con licencia MIT y soporte en diffusers, vLLM, SGLang, FastVideo y ComfyUI, sirve como base reproducible para experimentos de difusion audio-video.
- Generacion de material educativo o divulgativo: clips cortos con locucion o ambiente sonoro sincronizado para explicar conceptos visuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 3,18B parametros en bfloat16 los pesos ocupan aproximadamente 6,4 GB, a lo que hay que sumar activaciones y el text encoder Qwen2.5-VL.
- El ejemplo oficial usa `pipe.enable_model_cpu_offload()`, lo que indica que el pipeline completo no esta pensado para ejecutarse enteramente en VRAM de forma simultanea en GPUs modestas.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, es plausible su ejecucion en GPUs profesionales (A100, H100) y de gama alta consumer, pero no se confirma.
- Cabe en GPU consumer: no confirmado en la documentacion; el uso de CPU offload sugiere que en GPUs de 16-24 GB podria requerir gestion de memoria.
- Opciones de despliegue: diffusers (oficial), vLLM (vllm-omni), SGLang, FastVideo y ComfyUI (nodo `kandinsky6`).
- Latencia y throughput: no disponibles; el checkpoint destilado reduce el muestreo a 10 pasos, lo que disminuye el coste frente a los 50 pasos de las variantes no destiladas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Audio sincronizado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kandinsky 6.0 Lite distill (este) | 3,18B | 5 s, 121 frames, 24 fps | Si, 44 kHz, lip-sync | MIT | Hugging Face, diffusers, vLLM, SGLang, FastVideo, ComfyUI |
| Kandinsky 6.0 Pro | 29B | 5 s | Si, 44 kHz, lip-sync | no disponible | Demo en HF Spaces |
| Otros modelos de video-audio | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo genera clips de 5 segundos; no se documenta extension de duracion.
- La resolucion nativa del ejemplo es 480x864; para Full-HD es necesario aplicar el pipeline de superresolucion por separado.
- El checkpoint destilado requiere 10 pasos y `guidance_scale=1.0`; usar los ajustes de 50 pasos y guidance 5.0 de otros checkpoints produce resultados incorrectos.
- No se dispone de informacion sobre sesgos, composicion del dataset ni evaluaciones de seguridad.
- Riesgo de alucinacion visual y sonora inherente a los modelos de difusion: puede generar contenido fisicamente implausible o audio desalineado en escenas complejas.
- No se documentan los idiomas soportados; el comportamiento multilingue del text encoder Qwen2.5-VL no se detalla para este pipeline.
- La licencia MIT permite uso comercial, pero no se especifican restricciones adicionales sobre los datos de entrenamiento ni sobre el contenido generado.
- El uso de `expand_prompts=True` anade latencia.
- El repo ocupa 34,3 GB, lo que exige espacio de almacenamiento considerable y descarga inicial lenta.

## Enlaces

- Hugging Face: https://huggingface.co/kandinskylab/Kandinsky-6.0-Lite-distill-5s-Diffusers
- Paper: https://arxiv.org/pdf/2610.05608
- Pagina de modelos de video: https://kandinskylab.ai/models/video/
- Demo en HF Spaces (Pro): https://huggingface.co/spaces/kandinskylab/Kandinsky-6.0-Pro-distill-5s
- Documentacion diffusers: https://huggingface.co/docs/diffusers/main/en/api/pipelines/kandinsky6
- vLLM Omni: https://docs.vllm.ai/projects/vllm-omni/en/latest/api/vllm_omni/diffusion/models/kandinsky6/
- SGLang: https://docs.sglang.io/cookbook/diffusion/Kandinsky/Kandinsky6
- FastVideo: https://haoailab.com/FastVideo/inference/kandinsky6/
- ComfyUI: https://registry.comfy.org/nodes/kandinsky6
