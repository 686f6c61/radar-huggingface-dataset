# sekkit/UltraTex-Qwen-Image-2.1

## Resumen

UltraTex-Qwen-Image-2.1 es un adaptador LoRA de generación de texturas multi-vista para mallas 3D, desarrollado por Atlas 3D (usuario `sekkit` en Hugging Face) como port del método UltraTex de Yibo Zhang al backbone Qwen-Image 2.1. UltraTex originalmente solo publicaba pesos para FLUX.1-dev y FLUX.2-Klein; este release cubre el hueco para Qwen-Image, siendo, según el autor, el primer LoRA de texturas multi-vista para ese backbone.

El modelo resuelve el problema de generar mapas de textura coherentes entre múltiples vistas de un objeto 3D a partir de una imagen de referencia, usando un pipeline image-to-image. No es un modelo generativo autónomo: es un adaptador que se aplica sobre Qwen-Image 2.1 (bf16) junto con su VAE y el codificador de texto Qwen3-VL-8B, que el usuario debe obtener por separado. El repositorio incluye además un decodificador RGBA foreground-aware afinado específicamente para esta tarea.

La relevancia es doble: por un lado, extiende el ecosistema UltraTex a un backbone alternativo a FLUX; por otro, publica tanto los pesos entrenados (LoRA rank 64, 15.000 pasos) como el código del port y muestras verificables en formato GLB con mallas TRELLIS texturizadas. La licencia es MIT tanto para el método original como para este port.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 64, alpha 64) sobre el transformer DiT de Qwen-Image 2.1, con decodificador RGBA foreground-aware |
| Parametros totales | No disponible (los pesos base de Qwen-Image 2.1 no se incluyen en el repo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (condicionamiento de texto cacheado con prompt vacío de Qwen3-VL-8B) |
| Tipos de cuantizacion | No disponible (pesos en bf16; el LoRA se distribuye en safetensors) |
| Idiomas soportados | No disponible (el condicionamiento de texto es un prompt vacío cacheado) |
| Licencia | MIT |
| Formato de pesos | safetensors (LoRA `dit_lora.safetensors`, decodificador `decoder_step1200.safetensors`, condicionamiento `text_cond.safetensors`) |

## Arquitectura y entrenamiento

El método subyacente es UltraTex: un esquema de generación de texturas multi-vista que proyecta vistas del objeto 3D y las procesa con un backbone de difusión image-to-image. En este port, el backbone es el DiT de Qwen-Image 2.1, sobre el que se aplica un LoRA de rango 64 y alpha 64. El pipeline se completa con un decodificador RGBA foreground-aware afinado de forma independiente, que produce el canal alfa junto con el color para separar la textura del fondo de cada vista.

El entrenamiento del LoRA se realizó durante 15.000 pasos a 1024 px por vista, batch 1, learning rate constante de 5e-5 en bf16, semilla 42, con atención dispersa top-k 0.2. El dataset es G-buffer TexVerse (gated, de YiboZhang2001), orientado a buffers geométricos y texturas. El decodificador se afinó 1.200 pasos adicionales, alcanzando un PSNR de foreground de 38,65 dB. El condicionamiento de texto es el prompt vacío cacheado de Qwen3-VL-8B, lo que implica que la generación no está guiada por descripción textual en lenguaje natural, sino por la imagen de referencia y la geometría.

## Capacidades

- Generación de texturas multi-vista coherentes para mallas 3D a partir de una imagen de referencia.
- Producción de mapas RGBA con canal alfa foreground-aware gracias al decodificador específico.
- Integración con mallas TRELLIS (las muestras GLB del repo se generaron así).
- Pipeline image-to-image sobre Qwen-Image 2.1, con soporte de atención dispersa top-k 0.2.
- Texturizado end-to-end de una malla mediante el script `skin_mesh.sh`.
- No soporta tool calling, agentes ni multi-step reasoning: es un adaptador de difusión, no un LLM.
- No hay capacidades multilingües declaradas; el condicionamiento textual es un embedding vacío cacheado.
- No dispone de modo thinking, visión general ni audio.

## Casos de uso

- Texturizado de assets para videojuegos: a partir de una imagen conceptual y una malla, generar las texturas multi-vista y el canal alfa para integrarlas en el motor, usando el script `skin_mesh.sh` con `BACKEND=qwen21`.
- Prototipado rápido de personajes 3D: las muestras incluidas (fox, axolotl, robot companion) demuestran el flujo completo desde concept art de Krea 2 hasta GLB texturizado y con skinning.
- Comparación de backbones en pipelines de investigación: al portar UltraTex a Qwen-Image 2.1 se puede contrastar su calidad frente a FLUX.2-Klein usando la misma malla y referencia (el repo incluye un GLB comparativo lado a lado).
- Generación de albedo y mapas base para PBR: la muestra `albedo_canvas_ckpt15000.webp` indica salida de canvas de albedo aprovechable como capa base antes de añadir rugosidad o metalicidad en herramientas DCC.
- Automatización de pipelines de asset production: al ser un LoRA sobre un backbone abierto con licencia MIT, se puede integrar en un ComfyUI con soporte de Qwen-Image 2.1 y orquestar por lotes.
- Investigación en texturizado multi-vista: el código del port y los logs de entrenamiento (`train_args.json`, `decoder_train_log.jsonl`) permiten reproducir o extender el método a otros backbones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato cuantitativo reportado es el PSNR de foreground del decodificador: 38,65 dB tras 1.200 pasos de afinado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Requiere cargar Qwen-Image 2.1 en bf16, su VAE y Qwen3-VL-8B, además del LoRA (608 MiB) y el decodificador (988 MiB); el peso dominante es el backbone base, cuyas dimensiones no se detallan.
- GPU recomendadas: no disponible. Por el tamaño del backbone y el uso de bf16, se intuye necesidad de GPU de datacenter (A100/H100) o consumer de gama alta, pero no hay confirmación en la model card.
- ¿Cabe en consumer GPU?: no disponible.
- Opciones de despliegue: ComfyUI con soporte de Qwen-Image 2.1 (requisito explícito del autor), más los scripts del fork `Atlas3DSS/UltraTex` (`scripts/inference_mv.sh`, `scripts/skin_mesh.sh`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un pipeline de difusión de este tipo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Backbone | Tipo | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UltraTex-Qwen-Image-2.1 (este) | Qwen-Image 2.1 | LoRA multi-vista + decodificador RGBA | 1024 px por vista | MIT | Pesos + código en HF y GitHub |
| UltraTex (original, FLUX.1-dev) | FLUX.1-dev | LoRA multi-vista | No disponible | MIT | Pesos publicados por el autor original |
| UltraTex (FLUX.2-Klein) | FLUX.2-Klein | LoRA multi-vista | No disponible | MIT | Pesos publicados por el autor original |

No se dispone de datos de rendimiento comparativo entre estos tres backbones en la información proporcionada; el repo incluye un GLB de comparación visual (FLUX.2-Klein a la izquierda, este LoRA a la derecha) pero sin métricas numéricas asociadas.

## Limitaciones y advertencias

- Los pesos base no se incluyen: hay que obtener Qwen-Image 2.1 (bf16), su VAE y Qwen3-VL-8B por separado, con sus propias licencias y condiciones.
- El condicionamiento de texto es un prompt vacío cacheado, por lo que no se puede guiar la textura con descripciones en lenguaje natural; la única entrada semántica es la imagen de referencia.
- El dataset de entrenamiento (G-buffer TexVerse) es gated y específico de buffers geométricos; puede haber sesgos hacia el tipo de objetos y materiales representados en él.
- Riesgo de artefactos en geometrías o materiales poco representados en el dataset; las muestras publicadas son un conjunto reducido (fox, axolotl, robot).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día: no hay validación comunitaria independiente.
- El flujo depende de un fork concreto del repositorio UltraTex y de un checkout de ComfyUI con soporte de Qwen-Image 2.1; la reproducibilidad depende de mantener esas versiones.
- Licencia MIT permite uso comercial del adaptador, pero las licencias del backbone base y del VAE deben verificarse por separado antes de producción.
- No hay información sobre idiomas soportados ni sobre rendimiento en GPUs consumer, lo que dificulta planificar despliegues fuera de datacenter.

## Enlaces

- Hugging Face: https://huggingface.co/sekkit/UltraTex-Qwen-Image-2.1
- Repositorio del port (fork): https://github.com/Atlas3DSS/UltraTex
- Repositorio original UltraTex: https://github.com/yiboz2001/UltraTex
- Dataset G-buffer TexVerse: https://huggingface.co/datasets/YiboZhang2001/G-buffer-TexVerse
- Perfil del entrenador (Atlas 3D): https://huggingface.co/orwelian84
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
