# kandinskylab/Kandinsky-6.0-VSR-distilled2steps-5s-Diffusers

## Resumen

Kandinsky-6.0-VSR-distilled2steps-5s-Diffusers es un modelo de superresolución de vídeo (VSR) desarrollado por KandinskyLab, el laboratorio detrás de la familia Kandinsky 6.0 de modelos de difusión para generación sincronizada de vídeo y audio. Este repositorio concreto contiene el pipeline completo de superresolución empaquetado como un bundle de Diffusers: un DiT de superresolución de 1,41B parámetros destilado con π-Flow DX, el VAE de vídeo KVAE y un banco de upscalers latentes x2/x4. El modelo forma parte del ecosistema Kandinsky 6.0 Video, que incluye modelos base de generación texto-a-vídeo-audio (Lite de 3B y Pro de 29B) y este módulo de superresolución como complemento que eleva la salida hasta Full-HD (1920×1080).

El problema que resuelve es el coste computacional de la superresolución de vídeo por difusión. La versión estándar de este mismo módulo (flow matching) requiere 4 evaluaciones del modelo por tile, mientras que esta variante destilada con π-Flow DX reduce la inferencia a 2 evaluaciones por tile, manteniendo la capacidad de escalar el vídeo por factores de x2, x2.25 o x4 mediante difusión por tiles en el espacio latente de KVAE. Esto lo hace relevante para pipelines de producción donde el throughput importa, aunque el coste de VRAM sigue siendo elevado por el tamaño del bundle completo.

El modelo se distribuye bajo licencia MIT, con pesos en safetensors y soporte nativo en la librería diffusers a través de la clase `Kandinsky6SRPipeline`. El repositorio ocupa 28 GB e incluye todos los componentes necesarios para inferencia con `from_pretrained`. Es un modelo exclusivamente de vídeo: el audio de la fuente debe remuxarse por separado si se necesita en la salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) 3D para superresolución, con VAE de vídeo y banco de upscalers latentes |
| Parametros totales | 1.414.263.936 (transformer SR); bundle completo: 1,41B (transformer) + 1,74B (VAE) + 3,65B (upscalers latentes) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vídeo, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 para inferencia) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El componente central es `Kandinsky6SRTransformer3DModel`, un Diffusion Transformer (DiT) tridimensional de 1,41B parámetros que opera sobre latentes de vídeo producidos por el VAE KVAE (1,74B parámetros). La superresolución se realiza mediante difusión por tiles en el espacio latente, lo que permite procesar vídeos de resolución arbitraria sin cargar el fotograma completo en memoria. El pipeline incluye además un banco de upscalers latentes (`Kandinsky6SRLatentUpscalerBank`) con módulos x2 y x4 (3,65B parámetros en total) que realizan el escalado inicial en el espacio latente antes del refinamiento por difusión.

La innovación técnica principal es la destilación con π-Flow DX, que reduce el número de evaluaciones del modelo por tile de 4 (en la variante flow matching) a 2. El scheduler `PiflowScheduler` implementa la política de rollout de π-Flow DX con `nfe = 2`, `shift = 3.5`, 10 puntos de rejilla y 128 subpasos de política. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO, ya que estos detalles no aparecen en la información proporcionada.

## Capacidades

- Superresolución de vídeo por factores de x2, x2.25 y x4 mediante difusión por tiles en espacio latente KVAE.
- Procesamiento de vídeo de 5 segundos de duración (según la nomenclatura del modelo: `5s`).
- Inferencia con 2 evaluaciones del modelo por tile gracias a la destilación π-Flow DX.
- Soporte de atención flexible (`flex` attention backend) y compilación de bloques repetidos con `torch.compile` (`compile_repeated_blocks(fullgraph=True)`).
- Compatibilidad con `enable_model_cpu_offload()` para reducir el pico de VRAM.
- Integración con el ecosistema Diffusers mediante `Kandinsky6SRPipeline`.
- Soporte en vLLM Omni, SGLang, FastVideo y ComfyUI según los enlaces de la model card.
- No incluye procesamiento de audio: el pipeline es solo de vídeo y el audio debe remuxarse por separado.

## Casos de uso

- Restauración de archivo audiovisual: el modelo permite escalar metraje histórico o de baja resolución (por ejemplo, 480p a 1080p con factor x2.25) en lotes de clips de 5 segundos, usando la difusión por tiles para mantener la memoria acotada en vídeos largos procesados por segmentos.
- Postproducción de vídeo generado por IA: los modelos Kandinsky 6.0 Video generan clips de 5 segundos a resolución base; este módulo de superresolución eleva esa salida a Full-HD, integrándose en un pipeline de generación completo (T2AV/TI2AV seguido de VSR).
- Mejora de material de vigilancia o cámaras de baja calidad: el escalado x4 en espacio latente permite recuperar detalle en grabaciones de baja resolución, con la ventaja de las 2 evaluaciones por tile que reducen el coste frente a la variante flow matching.
- Pipelines de producción con requisitos de latencia: al requerir solo 2 evaluaciones por tile en lugar de 4, es adecuado para servicios de upscaling de vídeo en tiempo casi real donde el throughput es crítico, desplegado con vLLM Omni, SGLang o FastVideo.
- Integración en flujos de trabajo de ComfyUI: mediante el nodo `kandinsky6` del registro de ComfyUI, artistas y técnicos pueden encadenar la superresolución con otros nodos de generación o postprocesado sin escribir código.
- Restauración de contenido para plataformas de streaming: escalado por tiles de clips cortos a 1080p con factor x2.25, con la posibilidad de procesar por lotes y remuxar el audio original de la fuente tras la superresolución.
- Investigación en destilación de modelos de difusión: el scheduler π-Flow DX y la reducción a 2 NFE por tile sirven como referencia para estudiar técnicas de destilación aplicadas a difusión de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el bundle completo suma aproximadamente 6,8B parámetros (1,41B transformer + 1,74B VAE + 3,65B upscalers). En bfloat16, los pesos ocupan en torno a 13,6 GB; con activaciones y tiles de vídeo, se recomienda un mínimo de 24 GB de VRAM, y 40-80 GB para trabajar con tiles grandes o sin offload.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB), L40S (48 GB). En consumer, una RTX 4090 (24 GB) puede funcionar con `enable_model_cpu_offload()` y tiles pequeños, a costa de latencia.
- Compatibilidad con consumer GPU: sí, en RTX 4090/3090 (24 GB) con offload de CPU activado; en GPUs de 16 GB o menos no es viable sin cuantización adicional, que no está documentada en la información disponible.
- Opciones de despliegue: Diffusers (`Kandinsky6SRPipeline`), vLLM Omni, SGLang, FastVideo y ComfyUI (nodo `kandinsky6`).
- Optimizaciones documentadas: `torch._inductor.config.max_autotune = True` (obligatorio para que inductor seleccione tiles de flex-attention compatibles con la máscara de bloques del SR), `set_attention_backend("flex")` y `compile_repeated_blocks(fullgraph=True)`.
- Latencia y throughput: no disponibles de forma numérica; la reducción a 2 evaluaciones por tile frente a las 4 de la variante flow matching implica aproximadamente la mitad del coste de cómputo por tile.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Evaluaciones por tile | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kandinsky-6.0-VSR-distilled2steps-5s (este) | 1,41B transformer + 1,74B VAE + 3,65B upscalers | Difusión por tiles en latente KVAE, destilado π-Flow DX | 2 | MIT | Hugging Face, Diffusers, vLLM Omni, SGLang, FastVideo, ComfyUI |
| Kandinsky-6.0-VSR-5s-Diffusers | 1,41B transformer + 1,74B VAE + 3,65B upscalers | Difusión por tiles en latente KVAE, flow matching | 4 (Euler) | MIT | Hugging Face, Diffusers |
| Otros modelos de VSR | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa más relevante es con la variante flow matching del mismo módulo, que comparte arquitectura y componentes pero requiere el doble de evaluaciones por tile. No se dispone de información sobre modelos de superresolución de vídeo de otros desarrolladores para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El pipeline es exclusivamente de vídeo: no procesa ni genera audio. Si se necesita audio en la salida, debe remuxarse manualmente desde la fuente.
- El valor por defecto de `num_inference_steps` del pipeline es 4 (pensado para el checkpoint flow matching); para este checkpoint destilado debe establecerse explícitamente a 2.
- Requiere `torch._inductor.config.max_autotune = True` para que la compilación con inductor seleccione tiles de flex-attention compatibles con la máscara de bloques del SR; sin esta configuración la inferencia puede fallar o degradarse.
- La duración de los clips está fijada en 5 segundos según la nomenclatura del modelo; no se documenta soporte para secuencias más largas en una sola pasada.
- El bundle completo ocupa 28 GB en disco y suma unos 6,8B parámetros, lo que exige hardware de gama alta (24 GB de VRAM como mínimo con offload).
- No se dispone de información sobre sesgos, tasas de alucinación visual, idiomas soportados ni composición del dataset de entrenamiento.
- Licencia MIT: permite uso comercial sin restricciones adicionales documentadas, pero se recomienda revisar los términos de los modelos base y componentes de terceros referenciados.
- No se han publicado benchmarks cuantitativos en la información disponible, por lo que no es posible validar la calidad de la superresolución frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kandinskylab/Kandinsky-6.0-VSR-distilled2steps-5s-Diffusers
- Modelo base (flow matching): https://huggingface.co/kandinskylab/Kandinsky-6.0-VSR-5s-Diffusers
- Página de modelos de vídeo de KandinskyLab: https://kandinskylab.ai/models/video/
- Repositorio GitHub: https://github.com/kandinskylab/kandinsky-6-sr
- Informe técnico (arXiv): https://arxiv.org/pdf/2610.05608
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/kandinskylab/Kandinsky-6.0-VSR-Demo
- Documentación vLLM Omni: https://docs.vllm.ai/projects/vllm-omni/en/latest/api/vllm_omni/diffusion/models/kandinsky6/
- Cookbook SGLang: https://docs.sglang.io/cookbook/diffusion/Kandinsky/Kandinsky6
- FastVideo: https://haoailab.com/FastVideo/inference/kandinsky6/
- Nodo ComfyUI: https://registry.comfy.org/nodes/kandinsky6
