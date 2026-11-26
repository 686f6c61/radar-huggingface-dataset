# kandinskylab/Kandinsky-6.0-VSR-5s-Diffusers

## Resumen

Kandinsky-6.0-VSR-5s-Diffusers es el paquete de inferencia completo del modelo de superresolucion de video (VSR) de la familia Kandinsky 6.0, desarrollado por KandinskyLab. Se trata de un modulo complementario dentro de la familia generativa de video y audio Kandinsky 6.0 Video (que incluye las variantes Lite de 3B y Pro de 29B), y su funcion es elevar la resolucion de clips de video de 5 segundos mediante difusion por teselas en el espacio latente del VAE de video KVAE. El modelo esta publicado en Hugging Face con licencia MIT y empaquetado como bundle de Diffusers bajo la clase `Kandinsky6SRPipeline`.

El nucleo del sistema es un DiT de superresolucion con 1.41B parametros entrenado con flow matching, que ejecuta 4 pasos de Euler por tesela. El bundle incluye ademas el VAE de video (1.74B) y un banco de upscalers latentes x2 y x4 (3.65B), de modo que el repositorio concentra todos los componentes necesarios para inferencia directa con `from_pretrained`. El modelo permite escalados de x2, x2.25 y x4 sobre el video de entrada, y la familia Kandinsky 6.0 declara salida Full-HD (1920x1080) cuando se aplica sobre los modelos generativos.

La relevancia actual del modelo radica en que ofrece una via de superresolucion de video con calidad de difusion integrada en el ecosistema estandar (Diffusers, vLLM-Omni, SGLang, FastVideo, ComfyUI), algo poco habitual en herramientas de VSR de codigo abierto. Existe una variante destilada con pi-Flow que reduce a 2 evaluaciones del modelo por tesela, pensada para escenarios de mayor throughput.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT de superresolucion con flow matching (transformer 3D), VAE de video KVAE y banco de upscalers latentes x2/x4 |
| Parametros totales | 1.413.231.168 (transformer); el bundle completo suma VAE (1.74B) y upscalers (3.65B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (clip de 5 segundos; no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 en el ejemplo oficial) |
| Idiomas soportados | no disponible (modelo video-only, sin entrada de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (bundle Diffusers) |

## Arquitectura y entrenamiento

El componente principal es `Kandinsky6SRTransformer3DModel`, un transformer de difusion (DiT) tridimensional de 1.41B parametros que opera sobre latentes del VAE de video KVAE. La superresolucion se realiza mediante difusion por teselas (tiled diffusion) en el espacio latente, con un scheduler `FlowMatchEulerDiscreteScheduler` estandar de Diffusers configurado con `shift = 5.0` y 4 pasos de Euler por tesela. El pipeline emplea atencion flexible (flex-attention) con mascaras de bloque especificas del modulo SR, y el codigo oficial recomienda compilar los bloques repetidos con `torch.compile` e `inductor` para que la seleccion de teselas de atencion encaje con la mascara.

El bundle incorpora el VAE de video `Kandinsky6SRVAE` (1.74B) y el banco `Kandinsky6SRLatentUpscalerBank` con escaladores x2 y x4 (3.65B en total), que permiten el escalado latente previo a la difusion. La variante destilada con pi-Flow reduce el coste a 2 evaluaciones del modelo por tesela. No se dispone en la informacion proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO; el articulo asociado (arXiv:2610.05608) es la referencia para esos datos.

## Capacidades

- Superresolucion de video: escala clips de 5 segundos por factores de x2, x2.25 o x4 mediante difusion por teselas en espacio latente.
- Procesamiento video-only: el pipeline de Diffusers no maneja audio; si se necesita, hay que remultiplexar el audio de origen en la salida.
- Integracion con el ecosistema Diffusers: clase `Kandinsky6SRPipeline` con carga directa mediante `from_pretrained`.
- Aceleracion por compilacion: soporte de `torch.compile` con `compile_repeated_blocks` y backend de atencion flexible.
- Despliegue en multiples runtimes: soporte declarado en vLLM-Omni, SGLang, FastVideo y ComfyUI.
- Variante destilada: pi-Flow con 2 evaluaciones por tesela para mayor throughput.
- Generacion de video y audio sincronizado: disponible en la familia base Kandinsky 6.0 Video (Lite 3B y Pro 29B), no en este modulo SR.
- Tool calling, agentes, razonamiento, codigo, matematicas, vision general y capacidades multilingues: no disponible (no es un modelo de lenguaje ni un modelo multimodal de proposito general).

## Casos de uso

- Restauracion de metraje de archivo: aplicar el modelo sobre grabaciones antiguas de baja resolucion para obtener versiones x2 o x4, usando el modo teselado para mantener la coherencia temporal en clips de 5 segundos.
- Postproduccion de video generativo: elevar la salida de los modelos Kandinsky 6.0 Video Lite o Pro a Full-HD (1920x1080) como paso final del pipeline de generacion, ya que la familia declara ese flujo de superresolucion como complemento.
- Mejora de material capturado en movil o camaras de baja gama: escalar clips cortos de 5 segundos con factores x2.25 para adaptarlos a entregables de mayor resolucion sin re-grabar.
- Pipelines de video en produccion con ComfyUI: integrar el nodo oficial `kandinsky6-sr` en flujos de trabajo visuales para lotes de clips cortos, aprovechando la disponibilidad del nodo en el registro de ComfyUI.
- Servicio de inferencia a gran escala: desplegar el modelo con vLLM-Omni o SGLang para atender peticiones concurrentes de superresolucion, usando la variante destilada de 2 pasos cuando la latencia sea critica.
- Investigacion en diffusion models para video: emplear el bundle como referencia reproducible de VSR con flow matching, comparando la variante estandar de 4 pasos con la destilada pi-Flow de 2 pasos sobre el mismo conjunto de clips.
- Preprocesado para modelos downstream: mejorar la resolucion de clips antes de tareas de deteccion, segmentacion o analisis de video que se beneficien de mayor detalle espacial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el bundle completo en bfloat16 (transformer 1.41B + VAE 1.74B + upscalers 3.65B) supera los 6.8B parametros, lo que en bfloat16 implica del orden de 13-14 GB solo en pesos, antes de activaciones y latentes.
- El ejemplo oficial usa `enable_model_cpu_offload()`, lo que sugiere que la carga completa no cabe comodamente en GPU de consumo sin offload.
- GPU recomendadas: no disponible en la informacion proporcionada; por volumen de pesos, se requiere al menos una GPU con 16-24 GB para el flujo con offload, y GPU de centro de datos (A100, H100) para ejecucion sin offload.
- Cabe en consumer GPU: no confirmado; con offload de CPU es plausible en GPUs de 24 GB, pero no hay dato oficial.
- Opciones de despliegue: Diffusers (`Kandinsky6SRPipeline`), vLLM-Omni, SGLang, FastVideo y ComfyUI (nodo `kandinsky6-sr`).
- Latencia y throughput: no disponibles; se sabe que el modelo estandar ejecuta 4 pasos de Euler por tesela y la variante destilada 2 evaluaciones por tesela.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Escalado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kandinsky-6.0-VSR-5s-Diffusers | 1.41B (transformer) | VSR por difusion (flow matching) | x2, x2.25, x4 | MIT | Hugging Face, Diffusers, vLLM, SGLang, ComfyUI |
| Kandinsky-6.0-VSR-distilled2steps-5s-Diffusers | no disponible | VSR por difusion destilada (pi-Flow) | no disponible | MIT | Hugging Face, Diffusers |
| Alternativas de VSR de codigo abierto | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos alternativos de superresolucion de video comparables, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- El pipeline de Diffusers es exclusivamente de video: no procesa ni genera audio; hay que remultiplexar el audio original si se necesita en la salida.
- El modelo esta disenado para clips de 5 segundos; no hay informacion sobre su comportamiento en videos mas largos ni sobre la consistencia temporal mas alla de esa duracion.
- La superresolucion por teselas puede introducir costuras o inconsistencias entre teselas si no se ajusta correctamente la mascara de atencion; el codigo oficial exige `max_autotune` en inductor para que las teselas de flex-attention encajen con la mascara del bloque SR.
- El uso de `torch.compile` y backend de atencion flexible anade requisitos de compilacion y puede incrementar el tiempo de arranque.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion visual (artefactos generados) ni evaluacion cualitativa publicada en la informacion disponible.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones de los componentes de terceros (Diffusers, VAE, upscalers) y del articulo asociado.
- El repositorio ocupa 31.2 GB, lo que exige espacio de almacenamiento considerable y una descarga inicial larga.
- No hay datos publicados de benchmarks que permitan validar la calidad de la superresolucion frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kandinskylab/Kandinsky-6.0-VSR-5s-Diffusers
- Variante destilada pi-Flow (2 pasos): https://huggingface.co/kandinskylab/Kandinsky-6.0-VSR-distilled2steps-5s-Diffusers
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/kandinskylab/Kandinsky-6.0-VSR-Demo
- Coleccion de modelos Kandinsky 6.0 VSR: https://huggingface.co/collections/kandinskylab/kandinsky-60-vsr
- Repositorio GitHub: https://github.com/kandinskylab/kandinsky-6-sr
- Articulo (arXiv): https://arxiv.org/pdf/2610.05608
- Documentacion de Diffusers (pipeline VSR): https://huggingface.co/docs/diffusers/main/en/api/pipelines/kandinsky6#video-super-resolution
- Documentacion de vLLM-Omni: https://docs.vllm.ai/projects/vllm-omni/en/latest/api/vllm_omni/diffusion/models/kandinsky6_sr/
- Cookbook de SGLang: https://docs.sglang.io/cookbook/diffusion/Kandinsky/Kandinsky6-SR
- FastVideo (inferencia): https://haoailab.com/FastVideo/inference/kandinsky6_sr/
- Nodo de ComfyUI: https://registry.comfy.org/nodes/kandinsky6-sr
- Sitio de KandinskyLab: https://kandinskylab.ai/models/video/
