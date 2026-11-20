# kandinskylab/Kandinsky-6.0-Pro-distill-5s-Diffusers

## Resumen

Kandinsky 6.0 Pro es un modelo de difusion para generacion conjunta de video y audio sincronizado, desarrollado por KandinskyLab. Forma parte de la familia Kandinsky 6.0 Video, que incluye una variante Lite (3B parametros) y esta variante Pro (29B parametros). El modelo genera clips de 5 segundos a 24 fps con audio sincronizado a 44 kHz, incluyendo lip-sync, en modos texto-a-video-audio (T2AV) e imagen-a-video-audio (TI2AV). Un modelo de superresolucion complementario eleva la salida hasta Full-HD (1920x1080).

Este repositorio contiene el checkpoint Pro destilado, optimizado para muestrear en 10 pasos con el planificador PiFlow y guidance_scale 1.0, frente a los 50 pasos y guidance 5.0 de los checkpoints no destilados. El checkpoint tiene 30.139.423.760 parametros (segun los pesos safetensors publicados) y esta disponible en formato diffusers y safetensors, con licencia MIT.

Es relevante ahora porque unifica generacion de video y audio en un unico pipeline de difusion, con soporte nativo en diffusers, vLLM-Omni, SGLang, FastVideo y ComfyUI, lo que facilita su despliegue en distintos stacks de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (familia Kandinsky 6.0 Video); pipeline diffusers `Kandinsky6TI2VAPipeline` |
| Parametros totales | 30.139.423.760 (segun safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica a difusion; ventana temporal de 5 s por clip, 121 frames a 24 fps) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (formato diffusers) |

## Arquitectura y entrenamiento

Se trata de un modelo de difusion de la familia Kandinsky 6.0 Video, orientado a generacion sincronizada de video y audio. El pipeline `Kandinsky6TI2VAPipeline` integra el codificador de texto Qwen2.5-VL (usado tambien para la expansion opcional de prompts) y produce frames de video junto con audio a 44 kHz. La variante destilada de este repositorio emplea el planificador PiFlow con 10 pasos de muestreo y guidance 1.0.

El modelo admite dos modos: texto-a-video-audio (T2AV) e imagen-a-video-audio (TI2AV), donde una imagen de referencia condiciona el primer frame y el pipeline la redimensiona y recorta al centro segun las dimensiones solicitadas. El modo de superresolucion es un pipeline separado (`Kandinsky6SRPipeline`) que escala x2, x2.25 o x4 mediante difusion por tiles en el espacio latente K-VAE, con mezcla de tiles solapados mediante ventanas de Hann.

Los detalles sobre volumen de datos de entrenamiento, composicion del dataset y uso de RLHF/DPO no se especifican en la informacion disponible.

## Capacidades

- Generacion de video de 5 segundos con audio sincronizado a 44 kHz, incluyendo lip-sync.
- Modo texto-a-video-audio (T2AV) e imagen-a-video-audio (TI2AV) con imagen de referencia como primer frame.
- Generacion solo de video mediante `sample_audio=False`.
- Expansion automatica de prompts con `expand_prompts=True`, reescribiendo prompts breves en descripciones detalladas mediante Qwen2.5-VL (anade latencia, sin pesos adicionales).
- Superresolucion de video mediante pipeline separado `Kandinsky6SRPipeline` (x2, x2.25, x4) hasta Full-HD.
- Control de resolucion de salida (por ejemplo 480x864 en los ejemplos) y numero de frames (121 frames a 24 fps).
- Soporte de inferencia en diffusers, vLLM-Omni, SGLang, FastVideo y ComfyUI.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Tool calling, agentes y razonamiento multi-paso: no aplicable (modelo generativo de difusion, no LLM).

## Casos de uso

- Generacion de clips promocionales con audio: el modelo produce video y audio sincronizados en una sola pasada, adecuado para piezas de 5 segundos con locucion o efectos sonoros generados a partir del prompt.
- Prototipado rapido de storyboards audiovisuales: con el checkpoint destilado a 10 pasos, se pueden iterar variantes de una escena en menos tiempo que con los checkpoints de 50 pasos.
- Animacion de imagenes existentes: el modo TI2AV toma una imagen de referencia como primer frame y genera la continuacion animada con audio, util para dar movimiento a ilustraciones o fotos de producto.
- Doblaje y lip-sync: la generacion de audio sincronizado con el video permite crear escenas con movimiento de labios coherente a partir de descripciones textuales.
- Postproduccion y reescalado: el pipeline `Kandinsky6SRPipeline` permite subir la resolucion de clips generados a Full-HD con escalados x2, x2.25 o x4, integrándose en flujos de postproduccion.
- Creacion de efectos de sonido y ambientes: la generacion de audio a 44 kHz permite producir ambientes (lluvia, truenos, multitudes) sincronizados con eventos visuales descritos en el prompt.
- Integracion en herramientas creativas: el soporte en ComfyUI, FastVideo, SGLang y vLLM-Omni facilita incorporar el modelo en nodos o pipelines existentes de generacion audiovisual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el ejemplo oficial usa `torch_dtype=torch.bfloat16` y `enable_model_cpu_offload()`, lo que indica que el checkpoint completo en bf16 no cabe comodamente en GPUs de consumo sin offload.
- Parametros: 30.139.423.760; el repositorio ocupa 212,4 GB, lo que da una idea del espacio en disco necesario para pesos y assets.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, se requiere hardware de clase profesional con suficiente VRAM o el uso de offload a CPU.
- Cabe en consumer GPU: no disponible; el ejemplo oficial recurre a `enable_model_cpu_offload()`, lo que sugiere que no es viable en GPUs de consumo sin descarga parcial a CPU.
- Opciones de despliegue: diffusers (`Kandinsky6TI2VAPipeline`), vLLM-Omni, SGLang, FastVideo y ComfyUI (nodo `kandinsky6`).
- Latencia y throughput: no disponibles; el checkpoint destilado esta disenado para 10 pasos con PiFlow y guidance 1.0, frente a 50 pasos y guidance 5.0 de los checkpoints no destilados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / salida | Audio sincronizado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kandinsky 6.0 Pro distill (este) | 30,1B | clips de 5 s, 121 frames a 24 fps; SR hasta 1920x1080 | si, 44 kHz | MIT | Hugging Face, diffusers, vLLM-Omni, SGLang, FastVideo, ComfyUI |
| Kandinsky 6.0 Video Lite | 3B | clips de 5 s con audio sincronizado | si, 44 kHz | no disponible en la informacion | familia Kandinsky 6.0 |
| Alternativas de otros laboratorios (video + audio) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion disponible; al ser un modelo generativo entrenado con datos a gran escala, es previsible que herede sesgos de esos datos.
- Riesgo de alucinacion: no aplica en el sentido de LLM, pero el modelo puede generar contenido visual o sonoro incoherente con el prompt, especialmente en prompts ambiguos o muy largos.
- Duracion fija: los clips son de 5 segundos (121 frames a 24 fps); no se documenta generacion de videos mas largos.
- Idioma: los idiomas soportados no estan disponibles; el codificador de texto es Qwen2.5-VL, pero no se especifica la cobertura linguistica del pipeline.
- Resolucion: los ejemplos usan 480x864; la salida Full-HD requiere el pipeline de superresolucion separado.
- Configuracion de muestreo: este checkpoint destilado exige 10 pasos y guidance 1.0; las settings de 50 pasos y guidance 5.0 de otros checkpoints no aplican.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones de los componentes de terceros (por ejemplo, el codificador Qwen2.5-VL) antes de produccion.
- Hardware: el checkpoint completo en bf16 requiere offload a CPU en el ejemplo oficial, lo que implica mayor latencia y necesidad de planificar el despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/kandinskylab/Kandinsky-6.0-Pro-distill-5s-Diffusers
- Informe tecnico (arXiv): https://arxiv.org/pdf/2610.05608
- Pagina de modelos de video de KandinskyLab: https://kandinskylab.ai/models/video/
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/kandinskylab/Kandinsky-6.0-Pro-distill-5s
- Documentacion diffusers (pipeline Kandinsky6): https://huggingface.co/docs/diffusers/main/en/api/pipelines/kandinsky6
- vLLM-Omni (Kandinsky6): https://docs.vllm.ai/projects/vllm-omni/en/latest/api/vllm_omni/diffusion/models/kandinsky6/
- SGLang cookbook (Kandinsky6): https://docs.sglang.io/cookbook/diffusion/Kandinsky/Kandinsky6
- FastVideo (inferencia Kandinsky6): https://haoailab.com/FastVideo/inference/kandinsky6/
- ComfyUI (nodo kandinsky6): https://registry.comfy.org/nodes/kandinsky6
