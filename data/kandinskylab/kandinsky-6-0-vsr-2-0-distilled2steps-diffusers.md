# kandinskylab/Kandinsky-6.0-VSR-2.0-distilled2steps-Diffusers

## Resumen

Kandinsky 6.0 VSR 2.0 (distilled 2 steps) es un modelo de superresolución de vídeo (video super-resolution, VSR) publicado por KandinskyLab dentro de la familia Kandinsky 6.0, orientada a generación y posprocesado de vídeo con modelos de difusión. El modelo toma un vídeo de baja calidad y lo reescala por factores de x2, x2.25 o x4 mediante difusión por teselas (tiled diffusion) en el espacio latente del VAE de vídeo KVAE, elevando por ejemplo una señal SD hasta 2K o Full-HD (1920×1080).

Técnicamente es un Diffusion Transformer (DiT) de aproximadamente 1.414 millones de parámetros (1,4B) destilado con la técnica π-Flow DX hasta requerir solo 2 evaluaciones del modelo por tesela, lo que reduce drásticamente el coste de inferencia frente a un sampler de flow-matching convencional. Se distribuye como un bundle completo de Diffusers que incluye el DiT de SR, el VAE de vídeo KVAE y el banco de upscalers latentes x2/x4, de modo que puede cargarse con `from_pretrained` y ejecutarse con `Kandinsky6SRPipeline`.

La versión 2.0 mantiene la misma arquitectura, código de pipeline y banco de VAE/upscalers que la VSR 1.0, y solo cambian los pesos del DiT de SR y el desplazamiento del sampler (de 3,5 a 5). Según el autor, produce detalle más natural y un reescalado x4 (SD → 2K) notablemente más limpio que la versión 1.0. Es relevante para pipelines de restauración y realce de vídeo donde el coste por fotograma importa, gracias a su destilación a 2 pasos y a su integración en Diffusers, vLLM-Omni, SGLang, FastVideo y ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de superresolución sobre VAE de vídeo KVAE, con difusión por teselas en espacio latente; destilado π-Flow DX |
| Parametros totales | 1.414.263.936 (1,4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vídeo; procesa clips de 5 s por tesela) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el ejemplo oficial usa bfloat16) |
| Idiomas soportados | no disponible (modelo de vídeo, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors (bundle Diffusers) |
| Tamano del repositorio | 17,5 GB |
| Factores de escala | x2, x2.25, x4 |
| Pasos de inferencia | 2 (obligatorio, destilado) |
| Modelo base | kandinskylab/Kandinsky-6.0-VSR-5s-Diffusers |
| Pipeline Diffusers | Kandinsky6SRPipeline |
| Fecha de publicacion | 2026-11-23 |

## Arquitectura y entrenamiento

El modelo es un Diffusion Transformer que opera en el espacio latente del VAE de vídeo KVAE. La superresolución se realiza con difusión por teselas: el vídeo de entrada se divide en parches que se procesan de forma independiente en el espacio latente, lo que permite escalar a resoluciones altas (hasta Full-HD, 1920×1080) sin que el coste de memoria crezca de forma cuadrática con la resolución. El bundle incluye además un banco de upscalers latentes x2/x4 que prepara la señal de baja calidad antes de la difusión.

La innovación principal es la destilación con π-Flow DX, que reduce la inferencia a exactamente 2 evaluaciones del modelo por tesela. Esto contrasta con los samplers de flow-matching habituales, que requieren decenas de pasos. El autor advierte que el pipeline por defecto usa 4 pasos y no toma el conteo del bundle, por lo que es imprescindible pasar `num_inference_steps=2`; de lo contrario el modelo se ejecuta fuera de su calendario de entrenamiento. Respecto al entrenamiento, la información disponible no detalla el número de tokens, la composición del dataset ni si se empleó RLHF o DPO; solo se indica que la versión 2.0 reentrena los pesos del DiT de SR y ajusta el desplazamiento del sampler de 3,5 a 5 respecto a VSR 1.0.

## Capacidades

- Superresolución de vídeo con factores de escala x2, x2.25 y x4.
- Realce de detalle en espacio latente KVAE mediante difusión por teselas.
- Procesamiento de clips de 5 segundos (configuración heredada del modelo base de 5 s).
- Salida hasta Full-HD (1920×1080) en el caso de reescalado x4 desde SD.
- Integración nativa con Diffusers mediante `Kandinsky6SRPipeline`.
- Soporte de backend de atención flex y compilación de bloques repetidos (`compile_repeated_blocks`) para acelerar la inferencia.
- Compatibilidad con offload a CPU (`enable_model_cpu_offload`) para reducir el uso de VRAM.
- Soporte de despliegue en vLLM-Omni, SGLang, FastVideo y ComfyUI.
- No procesa audio: el pipeline Diffusers es solo vídeo, por lo que el audio de origen debe remultiplexarse aparte.
- No es un modelo de texto, código ni razonamiento; no soporta tool calling ni agentes.

## Casos de uso

- Restauración de archivo audiovisual: reescalar metraje SD histórico a 2K o Full-HD con un coste de 2 evaluaciones por tesela, adecuado para digitalizaciones masivas donde el throughput por fotograma es crítico.
- Realce de vídeo generado por IA: tomar la salida de un modelo de generación de vídeo (por ejemplo, la propia familia Kandinsky 6.0 Video Lite/Pro) y aplicar el paso de SR para alcanzar resolución Full-HD antes de la entrega final.
- Posproducción en pipelines de VFX: integrar el modelo como etapa de upscaling en un grafo de ComfyUI o FastVideo para realzar planos concretos sin re-renderizar la secuencia completa.
- Mejora de contenido para plataformas de streaming: subir la resolución de catálogos de vídeo de baja calidad antes de la transcodificación, aprovechando la licencia MIT para uso comercial.
- Preprocesado para modelos de visión: aumentar la resolución de vídeos de entrada a sistemas de detección o segmentación que rinden mejor con detalle fino, usando el factor x2 o x2.25 para no introducir artefactos agresivos.
- Prototipado e investigación en difusión de vídeo: servir como referencia reproducible de destilación π-Flow DX a 2 pasos, con un bundle autocontenido que se carga con `from_pretrained` y se ejecuta en una sola llamada de pipeline.
- Vigilancia y análisis de vídeo: realzar grabaciones de cámaras de baja resolución antes del análisis automático, con despliegue en SGLang o vLLM-Omni para servir varias peticiones concurrentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repo ocupa 17,5 GB y el ejemplo oficial usa `bfloat16` con `enable_model_cpu_offload()`, lo que sugiere que el bundle completo no cabe cómodamente en GPUs de consumo sin offload.
- El pipeline incluye el DiT de SR (1,4B), el VAE de vídeo KVAE y el banco de upscalers latentes x2/x4; el consumo real depende del número de teselas y de la resolución de salida.
- GPU recomendadas: no especificadas por el autor. Por tamaño del bundle, se espera que requiera GPUs de datacenter (A100, H100) para ejecución sin offload; con offload a CPU podría ejecutarse en GPUs de consumo de gama alta (RTX 4090, 24 GB), aunque no hay confirmación oficial.
- Cabe en consumer GPU: no confirmado; el uso de `enable_model_cpu_offload()` en el ejemplo oficial indica que es el modo previsto para entornos con VRAM limitada.
- Opciones de despliegue: Diffusers (`Kandinsky6SRPipeline`), vLLM-Omni, SGLang, FastVideo y ComfyUI (nodo `kandinsky6-sr`).
- Aceleraciones oficiales: `torch._inductor.config.max_autotune = True` (necesario para que inductor elija teselas de flex-attention compatibles con la máscara de bloques del SR), `pipe.transformer.set_attention_backend("flex")` y `pipe.transformer.compile_repeated_blocks(fullgraph=True)`.
- Latencia y throughput: no disponibles; la destilación a 2 evaluaciones por tesela reduce el coste frente a samplers de flow-matching convencionales, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / clip | Pasos de inferencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kandinsky 6.0 VSR 2.0 distilled 2 steps (este) | 1,4B | clips de 5 s, salida hasta 1920×1080 | 2 por tesela | MIT | Diffusers, vLLM-Omni, SGLang, FastVideo, ComfyUI |
| Kandinsky 6.0 VSR 1.0 distilled 2 steps | 1,4B (misma arquitectura) | clips de 5 s | 2 por tesela | MIT | Diffusers |
| Kandinsky 6.0 Video Lite | 3B | clips de 5 s con audio 44 kHz | no disponible | no disponible | familia Kandinsky 6.0 |
| Kandinsky 6.0 Video Pro | 29B | clips de 5 s con audio 44 kHz | no disponible | no disponible | familia Kandinsky 6.0 |

La comparativa se limita a la propia familia Kandinsky 6.0, ya que la información disponible no incluye otros modelos de superresolución de vídeo con los que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El pipeline Diffusers es solo vídeo: no procesa ni genera audio, por lo que hay que remultiplexar la pista de audio original si se necesita en la salida.
- Es obligatorio pasar `num_inference_steps=2`; el pipeline por defecto usa 4 pasos y no toma el conteo del bundle, lo que ejecuta el modelo fuera de su calendario de entrenamiento y degrada la calidad.
- La destilación a 2 pasos limita la flexibilidad del sampler: no se puede aumentar el número de pasos para mejorar la calidad sin salir de la distribución entrenada.
- Procesa clips de 5 segundos por tesela; vídeos más largos requieren segmentación y posiblemente gestión de continuidad entre teselas.
- No se detallan sesgos conocidos, riesgo de alucinación visual (artefactos inventados en el detalle) ni limitaciones idiomáticas en la información disponible; como modelo generativo de difusión, es esperable que pueda introducir detalle sintético no presente en la fuente, pero no hay datos oficiales al respecto.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución y sin garantías; conviene revisar los términos de los componentes de terceros incluidos en el bundle (VAE, upscalers).
- El modelo tiene 0 descargas y 1 like en el momento de la ficha, por lo que su validación por la comunidad es todavía muy limitada.
- No hay benchmarks publicados que permitan verificar las afirmaciones del autor sobre la mejora de calidad frente a VSR 1.0.
- El uso de `torch._inductor.config.max_autotune = True` es necesario para el backend flex-attention; omitirlo puede provocar fallos o rendimiento degradado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kandinskylab/Kandinsky-6.0-VSR-2.0-distilled2steps-Diffusers
- Modelo base: https://huggingface.co/kandinskylab/Kandinsky-6.0-VSR-5s-Diffusers
- Versión VSR 1.0: https://huggingface.co/kandinskylab/Kandinsky-6.0-VSR-distilled2steps-5s-Diffusers
- Informe técnico (arXiv): https://arxiv.org/pdf/2610.05608
- GitHub: https://github.com/kandinskylab/kandinsky-6-sr
- Web de KandinskyLab: https://kandinskylab.ai/models/video/
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/kandinskylab/Kandinsky-6.0-VSR-Demo
- Colección de modelos Kandinsky 6.0 VSR: https://huggingface.co/collections/kandinskylab/kandinsky-60-vsr
- Documentación Diffusers (video super-resolution): https://huggingface.co/docs/diffusers/main/en/api/pipelines/kandinsky6#video-super-resolution
- vLLM-Omni: https://docs.vllm.ai/projects/vllm-omni/en/latest/api/vllm_omni/diffusion/models/kandinsky6_sr/
- SGLang: https://docs.sglang.io/cookbook/diffusion/Kandinsky/Kandinsky6-SR
- FastVideo: https://haoailab.com/FastVideo/inference/kandinsky6_sr/
- ComfyUI: https://registry.comfy.org/nodes/kandinsky6-sr
