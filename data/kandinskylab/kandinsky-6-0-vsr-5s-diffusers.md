# kandinskylab/Kandinsky-6.0-VSR-5s-Diffusers

## Resumen

Kandinsky 6.0 VSR es un modelo de superresolución de vídeo desarrollado por KandinskyLab, presentado como parte de la familia Kandinsky 6.0 de modelos de difusión para generación de vídeo y audio. Se trata de un pipeline de difusión con flow matching que incluye un transformer DiT de 1,41B parámetros, un VAE de vídeo (KVAE) de 1,74B y un banco de upscalers latentes x2/x4 de 3,65B, sumando aproximadamente 6,8B parámetros. Permite escalar vídeos de baja resolución por factores x2, x2.25 o x4 mediante difusión por tiles en el espacio latente de KVAE, alcanzando resoluciones de hasta Full-HD (1920×1080).

El modelo resuelve el problema de la mejora de calidad de vídeo de forma automatizada, sin necesidad de pares de alta resolución, y se distribuye bajo licencia MIT como un bundle listo para usar con Diffusers. Es relevante para tareas de restauración, postproducción y mejora de contenido audiovisual, y se integra con herramientas como vLLM, ComfyUI y la librería Diffusers. No es un modelo de lenguaje: su única función es la superresolución de vídeo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT de superresolución con flow matching (Kandinsky6SRTransformer3DModel), VAE de vídeo KVAE y banco de upscalers latentes x2/x4 |
| Parámetros totales | 1.413.231.168 (transformer). El pipeline completo incluye VAE (1,74B) y upscalers (3,65B), ~6,8B en total |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de superresolución de vídeo) |
| Tipos de cuantización | No disponible (el ejemplo de uso emplea bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El componente principal es un transformer de difusión 3D (DiT) con flow matching, entrenado para realizar superresolución en el espacio latente del VAE KVAE. La inferencia utiliza 4 pasos de Euler por tile, lo que reduce el coste computacional frente a los muestreos de difusión tradicionales. El pipeline emplea difusión por tiles para procesar vídeos de cualquier resolución sin exceder la memoria de la GPU, y un banco de upscalers latentes x2 y x4 que permite elegir el factor de escala. El scheduler es FlowMatchEulerDiscreteScheduler con shift=5.0.

No se especifican en la información disponible los datos de entrenamiento (número de tokens, composición del dataset, si hubo RLHF/DPO). Al ser un modelo de difusión, no se aplican técnicas de RLHF propias de los modelos de lenguaje. La innovación destacable es la combinación de flow matching con difusión por tiles en el espacio latente de KVAE, junto con la posibilidad de usar una versión destilada con π-Flow que requiere solo 2 evaluaciones por tile.

## Capacidades

- Superresolución de vídeo: escala la resolución por factores x2, x2.25 o x4.
- Generación de vídeo en alta resolución: puede alcanzar Full-HD (1920×1080) a partir de vídeos de baja calidad.
- Procesamiento por tiles: permite manejar vídeos de gran tamaño o resoluciones elevadas sin agotar la VRAM.
- Integración con Diffusers: pipeline Kandinsky6SRPipeline listo para usar.
- Compatibilidad con vLLM (vllm-omni) y ComfyUI para despliegue.
- No realiza generación de texto, razonamiento, código ni matemáticas: no es un modelo de lenguaje.
- No soporta tool calling ni function calling.
- No está diseñado para agentes ni razonamiento multi-paso.
- Capacidades multilingües: no aplica (no procesa texto).
- No dispone de modo thinking, visión (más allá del vídeo) ni audio; la pipeline es solo vídeo y el audio debe reinyectarse aparte.

## Casos de uso

- Restauración de vídeos históricos: escalar grabaciones antiguas de baja resolución a Full-HD para su preservación y visualización en pantallas modernas, usando el factor x4 y procesamiento por tiles para secuencias largas.
- Postproducción cinematográfica: mejorar tomas aéreas o de archivo grabadas en resoluciones inferiores para integrarlas en proyectos finales en 1080p o 4K, ajustando el factor de escala a x2.25 para un equilibrio entre calidad y coste.
- Mejora de contenido para streaming: aumentar la resolución de vídeos antiguos o de baja calidad en plataformas VOD, reduciendo el ancho de banda necesario para transmitir en alta definición.
- Vigilancia y seguridad: procesar grabaciones de cámaras de seguridad de baja resolución para identificar matrículas, rostros o detalles relevantes, aplicando superresolución x4 en los fotogramas clave.
- Telemedicina y análisis clínico: mejorar vídeos médicos (endoscopias, ecografías) capturados con equipos de baja resolución para facilitar el diagnóstico, siempre que se validen los artefactos introducidos.
- Contenido generado por IA: post-procesar vídeos creados por modelos de generación como Kandinsky 6.0 Video Lite/Pro para aumentar su resolución final antes de su publicación.
- Realidad virtual y aumentada: preparar vídeos para visores que requieren alta resolución por ojo, escalando contenido original de baja calidad para evitar pixelación en pantallas cercanas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como PSNR, SSIM, LPIPS ni comparativas con otros modelos de superresolución de vídeo.

## Requisitos de hardware

- VRAM estimada: para el pipeline completo (~6,8B parámetros) en bfloat16, los pesos ocupan aproximadamente 13,6 GB. Con activaciones y tiles, se recomienda un mínimo de 24 GB de VRAM para inferencia sin offloading. Con `enable_model_cpu_offload()`, puede ejecutarse en GPUs de 8-12 GB, a costa de una mayor latencia.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) para uso en estación de trabajo; A100 (40/80 GB) o H100 para producción. En consumer, RTX 3090/4090 (24 GB) son adecuadas.
- Cabe en consumer GPU: sí, en GPUs con 24 GB o más (RTX 3090, 4090) sin offloading. En GPUs de 12 GB (RTX 3060, 4070) sería necesario usar offloading y posiblemente reducir el tamaño de los tiles, aunque no se ha confirmado oficialmente su funcionamiento en estas configuraciones.
- Opciones de despliegue: Diffusers (Kandinsky6SRPipeline), vLLM (vllm-omni), ComfyUI. No se confirma soporte para TGI, llama.cpp u Ollama (no aplica, no es un LLM).
- Latencia y throughput: no disponibles. Dependen del número de tiles, la resolución de entrada, el factor de escala y la GPU. El uso de 4 pasos de Euler por tile y la variante destilada (2 evaluaciones por tile) reducen el coste frente a difusión convencional.

## Comparativa con modelos similares

No se dispone de datos de comparación en la información proporcionada. Existen alternativas para superresolución de vídeo como Real-ESRGAN, BasicVSR++ o SwinIR, pero no se han publicado comparativas directas con Kandinsky 6.0 VSR en la model card ni en los enlaces disponibles. Por tanto, no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- El modelo es exclusivamente de superresolución de vídeo; no debe utilizarse para tareas de generación de texto, código o razonamiento.
- Riesgo de artefactos y alucinaciones visuales: como todo modelo de difusión, puede introducir texturas irreales o distorsiones en escenas complejas.
- La pipeline procesa solo vídeo; el audio original se pierde y debe remuxearse manualmente si se necesita en la salida.
- No se documentan sesgos específicos, pero el modelo puede amplificar sesgos presentes en los datos de entrenamiento (no especificados).
- Licencia MIT: permite uso comercial, pero se recomienda verificar que los datos de entrenamiento no impongan restricciones adicionales.
- El uso sin offloading requiere hardware con al menos 24 GB de VRAM; el offloading incrementa la latencia y puede afectar al throughput en producción.
- No hay información sobre idiomas soportados (no aplica) ni sobre el rendimiento en benchmarks, lo que dificulta la comparación con alternativas.
- La versión destilada (π-Flow) requiere validación adicional para asegurar que la calidad se mantiene con solo 2 evaluaciones por tile.

## Enlaces

- HuggingFace: https://huggingface.co/kandinskylab/Kandinsky-6.0-VSR-5s-Diffusers
- Modelo destilado: https://huggingface.co/kandinskylab/Kandinsky-6.0-VSR-distilled2steps-5s-Diffusers
- GitHub: https://github.com/kandinskylab/kandinsky-6-sr
- arXiv: https://arxiv.org/pdf/2610.05608
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/kandinskylab/Kandinsky-6.0-VSR-Demo
- Documentación Diffusers: https://huggingface.co/docs/diffusers/main/en/api/pipelines/kandinsky6
- Documentación vLLM: https://docs.vllm.ai/projects/vllm-omni/en/latest/api/vllm_omni/diffusion/models/kandinsky6/
- ComfyUI: https://registry.comfy.org/nodes/kandinsky6
- KandinskyLab: https://kandinskylab.ai/models/video/
