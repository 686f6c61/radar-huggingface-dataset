# kandinskylab/Kandinsky-6.0-VSR-distilled2steps-5s-Diffusers

## Resumen

Kandinsky-6.0-VSR-distilled2steps-5s-Diffusers es un paquete de inferencia para Diffusers del modelo de superresolución de vídeo (VSR) de la familia Kandinsky 6.0, desarrollado por KandinskyLab. Se trata de una versión destilada del modelo de flow-matching base: el transformador SR DiT de 1,41B parámetros ha sido destilado mediante π-Flow DX hasta requerir únicamente 2 evaluaciones del modelo por tesela, frente a las 4 del profesor de flow-matching. El bundle incluye además el VAE de vídeo KVAE (1,74B) y el banco de upscalers latentes x2/x4 (3,65B), sumando 1.414.263.936 parámetros en el checkpoint principal.

El modelo resuelve un problema concreto: aumentar la resolución de vídeo existente por factores de x2, x2.25 o x4 mediante difusión por teselas en el espacio latente de KVAE. Es relevante porque la destilación a 2 pasos reduce a la mitad el coste computacional de inferencia respecto al modelo de flow-matching, manteniendo el pipeline completo empaquetado para `from_pretrained`. El pipeline de Diffusers es exclusivamente de vídeo: el audio de la fuente debe remultiplexarse manualmente si se necesita en la salida.

La familia Kandinsky 6.0 Video comprende modelos de difusión para generación sincronizada de texto-a-audio-vídeo (Kandinsky 6.0 Video Lite de 3B y Pro de 29B, con clips de 5 segundos y audio a 44 kHz), y este VSR actúa como complemento plug-in que eleva la salida hasta Full-HD (1920×1080).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT 3D de difusión (flow matching destilado con π-Flow DX) sobre espacio latente KVAE, con difusión por teselas |
| Parametros totales | 1.414.263.936 (transformador SR DiT: 1,41B; VAE: 1,74B; banco de upscalers latentes: 3,65B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; procesa clips de 5 s) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 en el ejemplo oficial) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

El componente central es `Kandinsky6SRTransformer3DModel`, un DiT (Diffusion Transformer) tridimensional de 1,41B parámetros que opera en el espacio latente del VAE de vídeo KVAE. El modelo ha sido destilado desde el profesor de flow-matching (4 pasos Euler por tesela) mediante π-Flow DX, una política de rollout que fija `nfe = 2`, `shift = 3.5`, 10 puntos de rejilla y 128 subpasos de política, gestionada por `PiflowScheduler`. El resultado son exactamente 2 evaluaciones del modelo por tesela. El bundle incorpora también `Kandinsky6SRVAE` (1,74B) y `Kandinsky6SRLatentUpscalerBank` (3,65B), que agrupa los upscalers latentes x2 y x4.

La inferencia se realiza con difusión por teselas en el espacio latente de KVAE, lo que permite procesar vídeo de alta resolución sin cargar el fotograma completo en memoria de activaciones. El pipeline `Kandinsky6SRPipeline` admite factores de escala de 2, 2.25 y 4. Un detalle crítico del entrenamiento: el checkpoint está destilado para exactamente 2 evaluaciones por tesela, pero el pipeline por defecto usa 4 pasos (el ajuste de flow-matching), por lo que es obligatorio pasar `num_inference_steps=2`. El ejemplo oficial activa además el backend de atención flex y la compilación de bloques repetidos (`compile_repeated_blocks(fullgraph=True)`) con `torch._inductor.config.max_autotune = True`, necesario para que Inductor seleccione teselas de flex-attention compatibles con la máscara de bloque del SR. No se dispone de información sobre el volumen o composición del dataset de entrenamiento.

## Capacidades

- Superresolución de vídeo por factores x2, x2.25 y x4 en un solo pipeline.
- Procesamiento de clips de 5 segundos de duración.
- Difusión por teselas en espacio latente KVAE, que permite escalar a resoluciones altas.
- Salida orientada a Full-HD (1920×1080) como parte del ecosistema Kandinsky 6.0.
- Integración nativa con Diffusers mediante `Kandinsky6SRPipeline` y `from_pretrained`.
- Compatibilidad con backend de atención flex y compilación con `torch.compile` (inductor).
- Soporte de offload de modelo a CPU (`enable_model_cpu_offload`).
- Control de reproducibilidad mediante semilla de generador (`torch.Generator`).
- No incluye procesamiento de audio: el pipeline es solo vídeo y el audio debe remultiplexarse aparte.
- No dispone de tool calling, agentes, razonamiento multi-paso ni capacidades de texto; es un modelo generativo de vídeo, no un LLM.

## Casos de uso

- Restauración de metraje de archivo: escalar vídeo de baja resolución histórica o de cámaras antiguas a x2 o x4 para su preservación digital, aprovechando la difusión por teselas para trabajar con resoluciones de salida altas sin agotar memoria.
- Upcycling de contenido generado por IA: los clips de 5 s producidos por Kandinsky 6.0 Video Lite o Pro pueden elevarse a Full-HD con este VSR como etapa final del pipeline de generación, tal como propone la familia.
- Postproducción de vídeo para redes sociales: reescalar material rodado a baja resolución (por ejemplo, 480p o 720p) a 1080p con un coste de 2 evaluaciones por tesela, adecuado para lotes grandes donde el throughput importa.
- Mejora de vídeo de vigilancia o domótica: aumentar la resolución de grabaciones de cámaras de bajo coste para facilitar la identificación de detalles, procesando clips cortos de 5 s de forma iterativa.
- Previsualización rápida en pipelines de VFX: generar versiones en alta resolución de proxies de baja calidad para revisión de clientes antes del render final, gracias al bajo número de pasos (2) y a la compilación con inductor.
- Investigación en superresolución de vídeo: servir como baseline destilado frente al profesor de flow-matching (4 pasos) para estudios de destilación π-Flow, comparando calidad y coste computacional con la misma arquitectura.
- Integración en herramientas de edición: el soporte en ComfyUI, vLLM-Omni, SGLang y FastVideo permite incorporar el escalado como nodo dentro de flujos de trabajo de edición y generación ya existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de orden de magnitud, el checkpoint principal ocupa 28,0 GB en el repositorio; en bfloat16 los pesos del transformador (1,41B) rondan los 2,8 GB, pero el bundle completo (transformador + VAE de 1,74B + upscalers de 3,65B) supera los 13 GB solo en pesos, antes de activaciones.
- El ejemplo oficial usa `enable_model_cpu_offload()`, lo que indica que el bundle completo no está pensado para residir entero en VRAM de consumo sin offload.
- GPU recomendadas: no especificadas por el autor. Por tamaño, se requiere al menos una GPU con suficiente VRAM para el transformador y el VAE activos; el offload permite ejecutar en GPUs de consumo, pero con penalización de latencia.
- Cabe en GPU de consumo: no confirmado oficialmente; el uso de offload en el ejemplo sugiere que sí es posible con compromisos de rendimiento.
- Opciones de despliegue: Diffusers (`Kandinsky6SRPipeline`), vLLM-Omni, SGLang, FastVideo y ComfyUI (nodo `kandinsky6-sr`).
- Latencia y throughput: no disponibles. La destilación a 2 evaluaciones por tesela reduce a la mitad el coste frente al profesor de 4 pasos, pero no se publican cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Pasos por tesela | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kandinsky-6.0-VSR-distilled2steps-5s-Diffusers | 1,41B (DiT) + 1,74B (VAE) + 3,65B (upscalers) | Difusión por teselas en latente KVAE, π-Flow DX | 2 | MIT | Hugging Face, Diffusers, ComfyUI, vLLM-Omni, SGLang, FastVideo |
| Kandinsky-6.0-VSR-5s-Diffusers (profesor) | 1,41B (DiT) + componentes del bundle | Flow matching, difusión por teselas | 4 (Euler) | MIT | Hugging Face, Diffusers |
| Otros modelos VSR de difusión | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa relevante dentro de la información disponible es con el profesor de flow-matching del mismo autor: misma arquitectura y licencia, pero el doble de evaluaciones por tesela y sin destilación π-Flow. No se dispone de datos de benchmarks que permitan comparar la calidad de ambos.

## Limitaciones y advertencias

- El pipeline es exclusivamente de vídeo: no procesa ni conserva audio. Si se necesita audio en la salida, hay que remultiplexarlo manualmente.
- Es obligatorio pasar `num_inference_steps=2`. El pipeline por defecto usa 4 pasos (ajuste de flow-matching) y no lee el número de pasos del bundle, por lo que omitir el argumento ejecuta el modelo fuera de su calendario de entrenamiento y degrada la calidad.
- Requiere `torch._inductor.config.max_autotune = True` para que Inductor seleccione teselas de flex-attention compatibles con la máscara de bloque del SR; sin ello, la compilación puede fallar o rendir peor.
- Procesa clips de 5 segundos; vídeos más largos deben trocearse, con riesgo de inconsistencias en las costuras entre clips.
- No se han publicado resultados de benchmarks ni evaluaciones de calidad objetivas en la información disponible.
- No se dispone de información sobre sesgos del dataset de entrenamiento, aunque al ser un modelo de superresolución puede amplificar artefactos o sesgos presentes en el vídeo de entrada.
- Riesgo de alucinación visual: como modelo generativo de difusión, puede inventar detalles plausibles no presentes en el vídeo original durante el escalado.
- Licencia MIT, que permite uso comercial, pero se recomienda verificar las condiciones de los componentes y del modelo base enlazado.
- El tamaño del repositorio (28,0 GB) implica requisitos de almacenamiento y descarga considerables para producción.
- Idiomas soportados no disponibles; al ser un modelo de vídeo, la relevancia lingüística es indirecta.

## Enlaces

- Hugging Face: https://huggingface.co/kandinskylab/Kandinsky-6.0-VSR-distilled2steps-5s-Diffusers
- Modelo base (flow-matching): https://huggingface.co/kandinskylab/Kandinsky-6.0-VSR-5s-Diffusers
- Informe técnico (arXiv): https://arxiv.org/pdf/2610.05608
- Repositorio GitHub: https://github.com/kandinskylab/kandinsky-6-sr
- Página de modelos de vídeo: https://kandinskylab.ai/models/video/
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/kandinskylab/Kandinsky-6.0-VSR-Demo
- Colección de modelos Kandinsky 6.0 VSR: https://huggingface.co/collections/kandinskylab/kandinsky-60-vsr
- Documentación de Diffusers (pipeline VSR): https://huggingface.co/docs/diffusers/main/en/api/pipelines/kandinsky6#video-super-resolution
- vLLM-Omni: https://docs.vllm.ai/projects/vllm-omni/en/latest/api/vllm_omni/diffusion/models/kandinsky6_sr/
- SGLang: https://docs.sglang.io/cookbook/diffusion/Kandinsky/Kandinsky6-SR
- FastVideo: https://haoailab.com/FastVideo/inference/kandinsky6_sr/
- ComfyUI: https://registry.comfy.org/nodes/kandinsky6-sr
