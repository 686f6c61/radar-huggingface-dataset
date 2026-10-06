# kandinskylab/Kandinsky-6.0-VSR-distilled2steps-5s-Diffusers

## Resumen

Kandinsky 6.0 VSR (video super-resolution) en su variante destilada es un modelo de difusion para superresolucion de video desarrollado por Kandinsky Lab, publicado como bundle de Diffusers. Forma parte de la familia Kandinsky 6.0 Video, que incluye modelos de generacion texto-a-audio-video (Lite, 3B parametros; Pro, 29B parametros) capaces de producir clips de 5 segundos con audio sincronizado a 44 kHz; este repositorio concreto implementa el componente de reescalado que eleva esa salida hasta Full HD (1920x1080).

Tecnicamente es un DiT (diffusion transformer) 3D de 1,41B parametros para el modulo de superresolucion, destilado mediante la politica pi-Flow DX hasta reducir la inferencia a 2 evaluaciones del modelo por tile, frente a las 4 del checkpoint maestro con flow matching. El bundle incluye ademas el VAE de video KVAE (1,74B) y un banco de upscalers latentes x2/x4 (3,65B), de modo que el conjunto completo de componentes supera ampliamente los parametros del transformer aislado.

El modelo es relevante porque resuelve el cuello de botella practico de la superresolucion de video por difusion: el coste computacional. Al operar en espacio latente KVAE con difusion por tiles y solo 2 evaluaciones por tile, permite integrar reescalado de alta calidad en pipelines de produccion sin recurrir a clusters de GPU, y se distribuye con licencia MIT y soporte nativo en Diffusers y ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT 3D (diffusion transformer) para superresolucion de video, con difusion por tiles en espacio latente KVAE |
| Parametros totales | 1.414.263.936 (transformer SR DiT, dato de safetensors). El bundle incluye ademas VAE KVAE (1,74B) y banco de upscalers latentes (3,65B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusion de video, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; la model card no documenta variantes GGUF, FP8 o INT8) |
| Idiomas soportados | no disponible (la pipeline es video-only; no consume prompts de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (formato Diffusers; componentes separados en `transformer/`, `vae/`, `latent_upscaler/`, `scheduler/`) |

## Arquitectura y entrenamiento

El componente central es `Kandinsky6SRTransformer3DModel`, un transformer de difusion tridimensional de 1,41B parametros que opera sobre latentes del VAE de video KVAE (1,74B). El reescalado se realiza con difusion por tiles en el espacio latente KVAE, lo que permite procesar videos de resolucion arbitraria sin que el coste de atencion crezca de forma cuadratica con la resolucion completa. El banco `Kandinsky6SRLatentUpscalerBank` aporta rutas de upscaling latente x2 y x4 (3,65B parametros), y la pipeline expone factores de escala de 2, 2,25 y 4 sobre el video de entrada.

La innovacion principal es la destilacion con pi-Flow DX: partiendo del checkpoint maestro entrenado con flow matching, que requiere 4 pasos Euler por tile, esta variante reduce la inferencia a 2 evaluaciones del modelo por tile. El `PiflowScheduler` implementa el rollout de la politica pi-Flow DX con `nfe = 2`, `shift = 3.5`, 10 puntos de rejilla y 128 subpasos de politica. La model card no detalla la composicion del dataset de entrenamiento, el numero de tokens de video vistos ni si hubo etapas de refinamiento adicionales, por lo que esos datos se consideran no disponibles.

## Capacidades

- Superresolucion de video con factores de escala configurables de x2, x2.25 y x4.
- Procesado por tiles en espacio latente KVAE, lo que permite trabajar con videos de duracion y resolucion variables sin limitarse a un tamano fijo de frame.
- Generacion de salida hasta Full HD (1920x1080) dentro de la familia Kandinsky 6.0 Video, segun la documentacion del proyecto.
- Ejemplos de uso con clips de 5 segundos exportados a 24 fps.
- Salida video-only: la pipeline no procesa ni genera audio, por lo que la pista de audio original debe remuxearse aparte si se necesita en el resultado.
- Integracion con el backend de atencion flex de PyTorch y compilacion con `torch.compile` sobre bloques repetidos (`compile_repeated_blocks`), lo que es un requisito practico para el rendimiento esperado.
- No es un modelo de lenguaje: no soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.

## Casos de uso

- Restauracion y remasterizacion de archivo audiovisual: digitalizaciones en baja resolucion de material historico o footage antiguo se pueden reescalar x2 o x4 en espacio latente para obtener masterizados en Full HD, manteniendo coherencia temporal entre frames gracias al procesado 3D por tiles.
- Post-procesado de video generado por IA: las salidas de los modelos Kandinsky 6.0 Video Lite (3B) y Pro (29B) se pueden pasar por este modulo de superresolucion para elevar la resolucion final a Full HD, cerrando el pipeline de generacion dentro del mismo ecosistema de Diffusers.
- Produccion de contenido para redes sociales y publicidad: reescalado de clips cortos (5 s, 24 fps) a resoluciones de entrega vertical u horizontal sin re-renderizar desde el origen, con 2 evaluaciones por tile que reducen el tiempo de GPU frente al modelo maestro.
- Integracion en pipelines de edicion no lineal: el nodo de ComfyUI publicado permite insertar el reescalado como etapa dentro de un grafo de post-produccion existente, encadenandolo con otros nodos de difusion o de interpolacion de frames.
- Preprocesado para streaming y transcodificacion: subir la resolucion de un master antes de generar las capas de bitrate adaptativo, de modo que los perfiles de mayor calidad partan de una fuente con mas detalle recuperado.
- Restauracion en investigacion de vision por computador: permite comparar la variante destilada de 2 evaluaciones contra el maestro de 4 pasos Euler por tile sobre el mismo conjunto de videos, aislando el efecto de la destilacion pi-Flow DX en la calidad final.
- Mejora de capturas de dispositivos de baja gama: videos grabados a resoluciones bajas se pueden recuperar x2.25, un factor intermedio util cuando el x4 introduce artefactos por falta de informacion en la fuente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y los resultados de busqueda no incluyen metricas objetivas (PSNR, SSIM, LPIPS, VMAF) ni comparaciones cuantitativas frente a otros modelos de superresolucion de video. El unico dato de rendimiento documentado es de tipo arquitectonico: 2 evaluaciones del modelo por tile en esta variante frente a 4 pasos Euler por tile en el checkpoint de flow matching.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa a partir del recuento de parametros del bundle (1,41B transformer + 1,74B VAE + 3,65B upscalers, aproximadamente 6,8B en total), los pesos en bfloat16 ocuparian del orden de 13-14 GB; a ello hay que sumar activaciones y buffers del procesado por tiles. El repositorio ocupa 28 GB, lo que sugiere que puede incluir copias adicionales de pesos en mayor precision.
- La model card recomienda `enable_model_cpu_offload()`, lo que indica que el bundle esta disenado para caber en GPUs de gama alta de consumo descargando modulos a CPU entre etapas.
- GPU recomendadas: no especificadas por el autor. Por el volumen de parametros, son razonables tarjetas con 24 GB o mas (RTX 3090, RTX 4090, A100 40 GB, H100). No hay datos oficiales de compatibilidad con GPUs de menor VRAM.
- Opciones de despliegue: Diffusers con la clase `Kandinsky6SRPipeline` (soporte oficial y unico documentado), nodo de ComfyUI publicado en el registro (`registry.comfy.org/nodes/kandinsky6`) y una demo en Hugging Face Spaces. No se documenta soporte de vLLM, SGLang, TGI ni llama.cpp, que en cualquier caso no aplican a un modelo de difusion de video.
- Latencia y throughput: no disponible. No se publican tiempos de inferencia medidos por clip ni por tile.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Evaluaciones por tile | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Kandinsky-6.0-VSR-distilled2steps-5s-Diffusers (este modelo) | DiT 3D destilado con pi-Flow DX | 1,41B (transformer) | 2 | Diffusers / safetensors | MIT | Hugging Face, ComfyUI, demo HF |
| Kandinsky-6.0-VSR-5s-Diffusers (modelo base) | DiT 3D con flow matching | no disponible | 4 (Euler por tile) | Diffusers / safetensors | no disponible en la informacion proporcionada | Hugging Face |
| Otros modelos de superresolucion de video open source | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No hay datos de rendimiento, licencia ni especificaciones tecnicas de alternativas comparables en la informacion proporcionada, por lo que la comparacion se limita al modelo base del que deriva esta variante destilada.

## Limitaciones y advertencias

- La pipeline es exclusivamente de video: no procesa audio. Si el material de origen tiene pista sonora, hay que remuxearla manualmente en el archivo de salida.
- El valor por defecto de `num_inference_steps` de la pipeline es 4, pensado para el checkpoint de flow matching. En esta variante destilada hay que fijarlo explicitamente a 2; usar el valor por defecto degrada el resultado o malgasta computo.
- Requiere configuracion especifica de PyTorch: `torch._inductor.config.max_autotune = True` y backend de atencion `flex`, ademas de compilar los bloques repetidos. No seguir estos pasos puede provocar fallos o un rendimiento muy inferior al esperado.
- No se documentan sesgos conocidos, tasas de alucinacion visual (artefactos, texturas inventadas) ni limites de idioma. En superresolucion por difusion existe riesgo de generar detalle plausible pero falso en zonas con poca informacion, especialmente a factores altos (x4), aunque el autor no publica analisis al respecto.
- El entrenamiento y la validacion se han realizado presumiblemente sobre dominios concretos que la model card no especifica; no hay garantias documentadas de generalizacion a footage muy degradado, animacion, contenido medico o imagenes sinteticas.
- La licencia es MIT, lo que permite uso comercial, pero conviene verificar las condiciones de los pesos del modelo base y de los componentes derivados de la familia Kandinsky 6.0 antes de desplegarlo en produccion.
- No hay benchmarks publicados, por lo que la decision de adopcion no puede apoyarse en metricas objetivas de calidad frente a alternativas.
- El repositorio pesa 28 GB y la inference requiere offload de CPU, lo que implica tiempos de arranque y de procesado superiores a los de modelos de superresolucion no generativos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kandinskylab/Kandinsky-6.0-VSR-distilled2steps-5s-Diffusers
- Checkpoint base (flow matching): https://huggingface.co/kandinskylab/Kandinsky-6.0-VSR-5s-Diffusers
- Paper (arXiv): https://arxiv.org/abs/2610.05608
- PDF del informe tecnico: https://arxiv.org/pdf/2610.05608
- Repositorio GitHub del proyecto: https://github.com/kandinskylab/kandinsky-6
- Repositorio GitHub especifico de superresolucion: https://github.com/kandinskylab/kandinsky-6-sr
- Sitio de Kandinsky Lab: https://kandinskylab.ai/
- Pagina de modelos de video de Kandinsky Lab: https://kandinskylab.ai/models/video/
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/kandinskylab/Kandinsky-6.0-VSR-Demo
- Nodo de ComfyUI: https://registry.comfy.org/nodes/kandinsky6
- Modelo Kandinsky 6.0 Pro destilado: https://huggingface.co/kandinskylab/Kandinsky-6.0-Pro-distill-5s-Diffusers
- Modelo Kandinsky 6.0 Lite: https://huggingface.co/kandinskylab/Kandinsky-6.0-Lite-5s-Diffusers
