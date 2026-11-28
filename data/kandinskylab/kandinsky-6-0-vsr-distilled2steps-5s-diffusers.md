# kandinskylab/Kandinsky-6.0-VSR-distilled2steps-5s-Diffusers

## Resumen

Kandinsky 6.0 VSR (distilled2steps-5s) es un modelo de superresolución de vídeo (video super-resolution, VSR) desarrollado por Kandinsky Lab. Forma parte de la familia Kandinsky 6.0, centrada en generación y posprocesado de vídeo con modelos de difusión. Este checkpoint concreto es la variante destilada del modelo de superresolución, diseñada para funcionar con solo dos evaluaciones del modelo por mosaico (tile), lo que reduce drásticamente el coste computacional frente al profesor de flow matching de cuatro pasos.

El modelo escala vídeos por factores de ×2, ×2.25 o ×4 mediante difusión por mosaicos en el espacio latente de KVAE, el VAE de vídeo de la familia. El paquete de Diffusers incluye el transformador SR DiT de 1.410 millones de parámetros, el VAE y el banco de upscalers latentes ×2 y ×4, todo listo para cargarse con `from_pretrained`. La destilación se realizó con la técnica π-Flow DX, que comprime el muestreo a dos pasos sin reentrenar el pipeline completo.

Es relevante ahora porque permite llevar vídeo de baja resolución a Full-HD en producción con un coste de inferencia muy contenido, y porque ya cuenta con integraciones en Diffusers, vLLM Omni, SGLang, FastVideo y ComfyUI. El autor advierte de que existe una versión posterior, VSR 2.0, que restaura más detalle natural con la misma velocidad y los mismos componentes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT 3D (diffusion transformer) para superresolución de vídeo, destilado con π-Flow DX; VAE KVAE y upscalers latentes ×2/×4 |
| Parámetros totales | 1.414.263.936 (transformador SR); el VAE suma 1,74 mil millones adicionales según la model card |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión, no de lenguaje) |
| Tipos de cuantización | no disponible (la model card solo documenta bfloat16) |
| Idiomas soportados | no disponible (modelo vídeo-only, sin componente textual) |
| Licencia | MIT |
| Formato de pesos | safetensors (integración Diffusers) |

## Arquitectura y entrenamiento

El núcleo es un transformador de difusión 3D (`Kandinsky6SRTransformer3DModel`) con 1,41 mil millones de parámetros que opera sobre latentes del VAE de vídeo KVAE. La superresolución se aplica por mosaicos (tiled diffusion) en el espacio latente, con factores de escala de ×2, ×2.25 o ×4. El paquete incluye además un banco de upscalers latentes ×2 y ×4 que prepara los latentes antes de la pasada del DiT.

La innovación principal es la destilación π-Flow DX, que reduce el muestreo de cuatro pasos Euler del profesor de flow matching a dos evaluaciones del modelo por mosaico. El modelo base es `kandinskylab/Kandinsky-6.0-VSR-5s-Diffusers`. La model card no detalla el volumen de datos de entrenamiento, la composición del dataset ni si hubo etapas de refinamiento con preferencias; esos datos no están disponibles en la información proporcionada. El pipeline de Diffusers es exclusivamente de vídeo: el audio de la fuente debe remultiplexarse aparte si se necesita en la salida.

## Capacidades

- Superresolución de vídeo con factores de escala ×2, ×2.25 y ×4.
- Procesamiento por mosaicos en espacio latente KVAE, lo que permite tratar vídeos de resolución superior a la que cabría en memoria en una sola pasada.
- Destilación a dos pasos: dos evaluaciones del modelo por mosaico en lugar de las cuatro del profesor de flow matching.
- Integración nativa con Diffusers mediante `Kandinsky6SRPipeline`, con soporte de `enable_model_cpu_offload`, backend de atención flex y compilación de bloques repetidos con `torch.compile`.
- Salida en fotogramas PIL exportables a vídeo con `export_to_video` (por ejemplo, a 24 fps).
- No incluye generación de texto, tool calling, agentes, visión semántica ni audio; es un modelo puramente de restauración y escalado de vídeo.

## Casos de uso

- Restauración de metraje de archivo: escalar vídeo SD histórico a resolución superior con un coste de dos evaluaciones por mosaico, adecuado para digitalizaciones masivas donde el presupuesto de cómputo por minuto es el factor limitante.
- Remasterización a Full-HD: la familia Kandinsky 6.0 emplea este módulo como complemento para elevar la salida de sus modelos de generación de vídeo a 1920×1080; se puede usar igualmente sobre material grabado con cámaras de menor resolución.
- Posprocesado en pipelines de generación de vídeo: integrar el paso SR tras un modelo texto-a-vídeo para obtener clips de mayor resolución sin regenerar el contenido, ya que el pipeline acepta una lista de fotogramas PIL.
- Mejora de vídeo para plataformas de contenido: escalar clips de usuarios móviles (720p o inferior) a 2K antes de publicarlos, con el factor ×2.25 como término medio entre calidad y coste.
- Preprocesado para visión por computador: aumentar la resolución de vídeo de vigilancia o de datasets de entrenamiento antes de pasarlos a detectores o segmentadores, aprovechando el procesamiento por mosaicos para secuencias largas.
- Flujos de trabajo en ComfyUI: nodos oficiales en el registro de ComfyUI permiten encadenar el modelo dentro de grafos de posproducción sin escribir código, útil para artistas técnicos y equipos de VFX.
- Despliegue en servidores de inferencia: las integraciones con vLLM Omni, SGLang y FastVideo permiten servir el modelo como endpoint de superresolución con gestión de lotes y memoria propia de estos motores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El transformador SR tiene 1,41 mil millones de parámetros; en bfloat16 son aproximadamente 2,8 GB de pesos. El VAE añade 1,74 mil millones de parámetros, unos 3,5 GB en bfloat16. El repo completo ocupa 28 GB, pero la inferencia solo carga los componentes necesarios.
- El ejemplo oficial usa `enable_model_cpu_offload()`, lo que permite ejecutar el pipeline con menos VRAM que la suma de todos los componentes, a costa de transferencias host-device.
- GPU recomendadas: A100 o H100 para lotes grandes y vídeos largos; RTX 4090 (24 GB) es suficiente para inferencia con offload y resolución moderada. En GPUs de 12-16 GB el offload es prácticamente obligatorio.
- Cabe en GPU de consumo con cuantización u offload, pero la model card no documenta cuantizaciones oficiales ni requisitos mínimos verificados; esos datos no están disponibles.
- Opciones de despliegue: Diffusers (`Kandinsky6SRPipeline`), vLLM Omni, SGLang, FastVideo y ComfyUI. No se documenta soporte de llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión de vídeo.
- Latencia y throughput: no disponibles. La única cifra concreta es el número de evaluaciones del modelo por mosaico (2), que es el parámetro determinante del coste junto con el número de mosaicos y la longitud del vídeo.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Pasos por mosaico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kandinsky-6.0-VSR-distilled2steps-5s (este) | 1,41 B (SR DiT) + 1,74 B (VAE) | Difusión por mosaicos en latentes KVAE, destilado π-Flow DX | 2 | MIT | Diffusers, vLLM Omni, SGLang, FastVideo, ComfyUI |
| Kandinsky-6.0-VSR-5s (profesor) | no disponible | Flow matching, 4 pasos Euler por mosaico | 4 | MIT | Diffusers |
| Kandinsky-6.0-VSR-2.0-distilled2steps | no disponible | Igual que este, con mejor restauración de detalle | 2 | MIT | Diffusers |

No se dispone en la información proporcionada de datos sobre modelos VSR de otros fabricantes (por ejemplo, enfoques GAN o transformers de restauración) que permitan una comparación cuantitativa de calidad o velocidad.

## Limitaciones y advertencias

- El checkpoint está destilado exactamente para 2 evaluaciones por mosaico, pero `Kandinsky6SRPipeline` usa 4 pasos por defecto; es obligatorio pasar `num_inference_steps=2` o el modelo se ejecutará fuera de su calendario de entrenamiento y la calidad se degradará.
- El pipeline de Diffusers es solo de vídeo: el audio de la fuente se pierde y hay que remultiplexarlo manualmente si se necesita.
- El autor recomienda la versión VSR 2.0 sobre este repositorio (VSR 1.0) por restaurar más detalle natural y ofrecer un escalado ×4 más limpio con la misma velocidad y componentes.
- Es necesario activar `torch._inductor.config.max_autotune = True` y el backend de atención flex para que inductor elija mosaicos de flex-attention compatibles con la máscara de bloques del SR; sin ello el ejemplo oficial no funciona como se describe.
- No hay información sobre sesgos, tasas de alucinación visual (artefactos inventados en texturas) ni evaluación cualitativa publicada en la información disponible.
- La licencia MIT permite uso comercial, pero conviene verificar las licencias de los componentes auxiliares (VAE, upscalers) en el repositorio antes de desplegar en producción.
- El modelo no procesa texto ni audio; cualquier expectativa de generación multimodal debe cubrirse con otros modelos de la familia Kandinsky 6.0.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kandinskylab/Kandinsky-6.0-VSR-distilled2steps-5s-Diffusers
- Modelo base (profesor, flow matching): https://huggingface.co/kandinskylab/Kandinsky-6.0-VSR-5s-Diffusers
- Versión recomendada VSR 2.0: https://huggingface.co/kandinskylab/Kandinsky-6.0-VSR-2.0-distilled2steps-Diffusers
- Colección de modelos Kandinsky 6.0 VSR: https://huggingface.co/collections/kandinskylab/kandinsky-60-vsr
- Informe técnico (arXiv): https://arxiv.org/pdf/2610.05608
- Repositorio GitHub: https://github.com/kandinskylab/kandinsky-6-sr
- Página de modelos de vídeo de Kandinsky Lab: https://kandinskylab.ai/models/video/
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/kandinskylab/Kandinsky-6.0-VSR-Demo
- Documentación de Diffusers (pipeline Kandinsky 6 SR): https://huggingface.co/docs/diffusers/main/en/api/pipelines/kandinsky6#video-super-resolution
- vLLM Omni (modelo Kandinsky 6 SR): https://docs.vllm.ai/projects/vllm-omni/en/latest/api/vllm_omni/diffusion/models/kandinsky6_sr/
- SGLang (receta Kandinsky 6 SR): https://docs.sglang.io/cookbook/diffusion/Kandinsky/Kandinsky6-SR
- FastVideo (inferencia Kandinsky 6 SR): https://haoailab.com/FastVideo/inference/kandinsky6_sr/
- ComfyUI (nodo Kandinsky 6 SR): https://registry.comfy.org/nodes/kandinsky6-sr
