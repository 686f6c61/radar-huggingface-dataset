# htdong/Wan-Alpha

## Resumen

Wan-Alpha es un modelo de generación de vídeo texto-a-vídeo (text-to-video) con canal alfa, desarrollado por Haotian Dong y colaboradores en el contexto de WeChatCV, que permite sintetizar vídeos con transparencia real (formato RGBA) a partir de una descripción textual. El modelo se construye como un ajuste fino (fine-tune) del modelo base Wan-AI/Wan2.1-T2V-14B, un transformer de difusión de 14.000 millones de parámetros, y añade la capacidad de generar el canal alfa de forma conjunta con los canales RGB mediante un VAE rediseñado que codifica el alfa en el espacio latente RGB.

El problema que resuelve es la falta de calidad visual en la generación de vídeo con transparencia: los métodos previos descuidaban la fidelidad del renderizado del alfa, limitando su uso práctico en producción. Wan-Alpha aborda esto entrenando conjuntamente RGB y alfa sobre un dataset RGBA de alta calidad construido específicamente, lo que le permite sintetizar objetos semitransparentes, efectos de brillo y detalles finos como mechones de pelo con una precisión que el autor describe como superior al estado del arte.

Es relevante ahora porque la generación de vídeo con canal alfa es una necesidad creciente en postproducción, motion graphics, publicidad y composición de efectos visuales, donde el material generado debe integrarse sobre fondos arbitrarios. El modelo se distribuye con licencia Apache 2.0, en formato diffusers, con pesos adaptados sobre Wan2.1-14B y un VAE específico, y cuenta con una versión oficial para ComfyUI y una v2.0 publicada posteriormente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) adaptado de Wan2.1-T2V-14B, con VAE modificado que codifica el canal alfa en el espacio latente RGB |
| Parametros totales | 14.000 millones (heredados del modelo base Wan2.1-T2V-14B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vídeo; ventana de generación de 81 frames en el ejemplo de inferencia) |
| Tipos de cuantizacion | no disponible (el ejemplo usa bf16; el ecosistema ComfyUI ofrece fp16) |
| Idiomas soportados | no disponible (los prompts aceptan chino e inglés según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (LoRA y VAE en safetensors; pesos base Wan2.1 en safetensors) |

## Arquitectura y entrenamiento

Wan-Alpha se basa en un transformer de difusión (DiT) de 14.000 millones de parámetros, el mismo backbone de Wan2.1-T2V-14B, sobre el que se aplica un ajuste fino con LoRA (el ejemplo de inferencia carga un `lora_path` con un checkpoint `epoch-13-1500.safetensors` y un `lora_ratio` de 1.0). La innovación principal es un VAE rediseñado que codifica el canal alfa dentro del espacio latente RGB, de modo que el modelo de difusión aprende a generar simultáneamente los canales de color y la transparencia en un único proceso de denoising. El VAE específico de Wan-Alpha se distribuye como `decoder.bin` y se carga mediante `--vae_lora_checkpoint`.

Para el entrenamiento, los autores construyeron un dataset RGBA de vídeo de alta calidad y diversidad, que no se detalla en la información disponible (número de tokens, composición exacta y si hubo RLHF/DPO no están especificados). El pipeline de inferencia combina el DiT base Wan2.1-T2V-14B con un LoRA de destilación de pasos (Lightx2v-T2V-14B, `cfg_step_distill_v2_lora_rank64_bf16`) que permite generar con solo 4 pasos de muestreo y `sample_guide_scale` de 1.0, lo que reduce drásticamente el coste computacional frente a la difusión estándar. La generación se ejecuta con paralelismo FSDP sobre el DiT y el codificador T5, y con `ulysses_size` para el paralelismo de secuencia.

## Capacidades

- Generación de vídeo texto-a-vídeo con canal alfa (RGBA) a partir de prompts en chino e inglés.
- Renderizado de transparencia de alta calidad: objetos semitransparentes, efectos de brillo (glow) y detalles finos como mechones de pelo.
- Generación conjunta de RGB y alfa en un único proceso de difusión, evitando post-procesado de matting.
- Control de estilo visual y tipo de plano mediante el prompt (close-up, medium shot, wide shot, extreme close-up).
- Salida en vídeo renderizado con fondo de tablero de ajedrez y frames PNG con alfa en el directorio de salida.
- Compatibilidad con el ecosistema diffusers y con ComfyUI mediante una versión oficial repackaged.
- Inferencia acelerada mediante LoRA de destilación de pasos (4 pasos de muestreo).
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, audio ni visión.

## Casos de uso

- Postproducción y composición de VFX: el modelo genera clips con alfa real que pueden superponerse directamente sobre placas de fondo en Nuke, After Effects o DaVinci Resolve, eliminando el paso de rotoscopia o keying manual para elementos como humo, chispas o cristales.
- Motion graphics y publicidad: creación de elementos animados transparentes (burbujas, brillos, partículas) para spots y banners, donde el alfa limpio es requisito para integrar sobre diseños de marca.
- Generación de assets para videojuegos y realidad aumentada: clips de efectos (explosiones, auras, magia) con transparencia listos para importar como sprites animados o secuencias en motores como Unity o Unreal.
- Contenido para redes sociales y streaming: overlays animados con transparencia para streams y edición rápida, aprovechando la inferencia en 4 pasos para iterar prompts con rapidez.
- Diseño de producto y previsualización: generación de vídeos de producto con fondo transparente para catálogos interactivos o configuradores web, donde el usuario final compone el fondo.
- Investigación en generación de vídeo con alfa: el modelo sirve como baseline reproducible (licencia Apache 2.0, pesos abiertos) para estudiar la generación conjunta de RGB y transparencia y el diseño de VAEs con canal alfa.
- Integración en pipelines de ComfyUI: nodos de generación con alfa dentro de flujos de trabajo de automatización de contenido, gracias a la versión oficial repackaged para ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente afirma, de forma cualitativa, que el modelo demuestra un rendimiento superior al estado del arte en calidad visual, realismo del movimiento y renderizado de transparencia, sin aportar tablas numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Por el tamaño del backbone (14.000 millones de parámetros en bf16) y el uso de FSDP, se requiere un entorno multi-GPU para el pipeline de referencia; el ejemplo oficial usa `torchrun --nproc_per_node=8` con `dit_fsdp`, `t5_fsdp` y `ulysses_size 8`.
- GPU recomendadas: el ejemplo de referencia está pensado para 8 GPU de clase数据中心 (A100/H100) por el uso de FSDP y paralelismo Ulysses; no se documentan configuraciones para GPU consumer.
- Cabeza en GPU consumer: no confirmado en la información disponible; la versión ComfyUI con pesos fp16 de Wan2.1-T2V-14B sugiere que puede ejecutarse en GPUs de gama alta con suficiente VRAM, pero no se aportan cifras.
- Opciones de despliegue: diffusers (librería declarada), repositorio oficial Wan-Alpha (script `generate_dora_lightx2v.py`), versión oficial para ComfyUI (Wan-Alpha_ComfyUI). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de vídeo).
- Latencia y throughput: no disponibles; el uso de un LoRA de destilación de 4 pasos y `sample_guide_scale` 1.0 reduce el número de evaluaciones del DiT frente a la difusión estándar, pero no se publican tiempos medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / salida | Alfa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan-Alpha | 14.000 M (base Wan2.1-T2V-14B) | 81 frames por generación (ejemplo) | Sí (RGBA nativo) | Apache 2.0 | Hugging Face, GitHub, ComfyUI |
| Wan2.1-T2V-14B (base) | 14.000 M | no disponible | No | Apache 2.0 | Hugging Face |
| Alternativas de generación de vídeo con alfa | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos competidores directos en generación de vídeo RGBA, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al heredar el backbone y los datos de Wan2.1-T2V-14B, es previsible que arrastre sesgos de representación de ese modelo base, pero no se cuantifican.
- Riesgo de alucinación: no evaluado; como modelo generativo de difusión, puede producir contenido visual incoherente o no fiel al prompt, especialmente en escenas complejas o con muchos objetos.
- Limitaciones de contexto o idioma: la longitud de contexto no está especificada; los prompts aceptan chino e inglés, pero no se documenta soporte de otros idiomas. El número de frames por generación en el ejemplo es de 81.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Wan2.1-T2V-14B y del LoRA Lightx2v utilizado en el pipeline, que se distribuyen por separado.
- Caveat para producción: el pipeline de referencia requiere configuración multi-GPU con FSDP y paralelismo Ulysses, lo que eleva el coste de despliegue; la versión ComfyUI usa pesos repackaged distintos de los del repositorio principal, por lo que los resultados pueden diferir.
- Dependencia de pesos externos: la inferencia necesita descargar el modelo base Wan2.1-T2V-14B, el LoRA Lightx2v y el VAE de Wan-Alpha por separado, lo que añade complejidad de gestión de artefactos.
- Madurez: el repositorio muestra 0 descargas y 43 likes en el momento de la ficha, con actualizaciones posteriores (v2.0 y ComfyUI) que indican evolución activa; conviene fijar versiones concretas de pesos para reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/htdong/Wan-Alpha
- Paper (arXiv): https://arxiv.org/pdf/2509.24979
- Paper en Hugging Face: https://huggingface.co/papers/2509.24979
- Página del proyecto: https://donghaotian123.github.io/Wan-Alpha/
- Repositorio GitHub: https://github.com/WeChatCV/Wan-Alpha
- Versión ComfyUI: https://huggingface.co/htdong/Wan-Alpha_ComfyUI
- Versión v2.0: https://huggingface.co/htdong/Wan-Alpha-v2.0
- Modelo base Wan2.1-T2V-14B: https://huggingface.co/Wan-AI/Wan2.1-T2V-14B
- LoRA Lightx2v-T2V-14B: https://huggingface.co/Kijai/WanVideo_comfy/blob/main/Lightx2v/lightx2v_T2V_14B_cfg_step_distill_v2_lora_rank64_bf16.safetensors
- Pesos Wan2.1 para ComfyUI: https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/blob/main/split_files/diffusion_models/wan2.1_t2v_14B_fp16.safetensors
