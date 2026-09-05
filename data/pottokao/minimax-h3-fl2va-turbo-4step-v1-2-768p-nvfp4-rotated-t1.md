# pottokao/MiniMax-H3-FL2VA-turbo-4step-v1.2-768p-NVFP4-rotated-T1

## Resumen

El modelo MiniMax-H3 FL2VA turbo 4-step v1.2 es una cuantización NVFP4 rotada del modelo de difusión MiniMax-H3 FL2VA, desarrollada por pottokao. Se trata de un modelo de imagen a video que genera video y audio sincronizado a partir de un primer y último fotograma (enfoque First-&-Last-frame, FL2VA). Esta versión incorpora el LoRA turbo v1.2 fusionado, lo que permite generar con solo 4 pasos de muestreo, frente a los 8 del modelo base. La cuantización rotated-NVFP4 con empaquetado W4A4 de nunchaku reduce el tamaño a unos 12.5 GB, lo que posibilita su ejecución completa en una GPU de 16 GB sin descarga a CPU.

El modelo es relevante porque democratiza el acceso a un generador de video con audio sincronizado de alta calidad, con requisitos de hardware asequibles y una integración específica para ComfyUI. Al tratarse de un archivo único autocontenido, no requiere cargar por separado el modelo base ni el LoRA, simplificando el despliegue en flujos de trabajo de generación de video.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) para video con audio sincronizado, enfoque FL2VA (First-&-Last-frame) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión, no aplica) |
| Tipos de cuantizacion | rotated-NVFP4 tier T1, group-16 e4m3 scales, nunchaku W4A4 pack |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | .safetensors (archivo único autocontenido) |

## Arquitectura y entrenamiento

El modelo se basa en un Diffusion Transformer (DiT) para generación de video con audio sincronizado, siguiendo el enfoque First-&-Last-frame (FL2VA). La arquitectura utiliza una shell oficial modificada con curve-basis AdaLN rank-8 y el LoRA turbo v1.2 fusionado en bf16-round-first. La cuantización aplica rotación de bloques de 256 con Sylvester Walsh–Hadamard multiplicado por diag(±1), con semilla determinada por la posición del bloque y el identificador del sitio. El empaquetado W4A4 de nunchaku permite una ejecución eficiente en kernels nativos de cuantización de 4 bits.

No se dispone de información detallada sobre los datos de entrenamiento ni el proceso de destilación, más allá de que es una build destilada de 4 pasos. El modelo está diseñado para ser cargado a través de un cargador personalizado de ComfyUI, no mediante el cargador estándar.

## Capacidades

- Generación de video a partir de un primer y último fotograma, con audio sincronizado.
- Modo turbo destilado de 4 pasos, gracias al LoRA v1.2 fusionado.
- Cuantización NVFP4 rotada que permite ejecución completa en una GPU de 16 GB.
- Integración con ComfyUI mediante el cargador personalizado H3-RotNVFP4-ComfyUI-Loader.
- Compatibilidad con el text encoder Qwen3VL-32B abliterado en formato GGUF, recomendado en la variante Q3_K_S con fusión visual.
- Soporte para video VAE (fp16) y audio VAE (fp32) del ecosistema MiniMax-H3.
- No es un modelo de lenguaje, por lo que no soporta tool calling, razonamiento de agentes ni generación de texto.

## Casos de uso

- Animación de personajes a partir de dos fotogramas: el modelo interpola entre el primer y último fotograma, generando movimiento natural y audio sincronizado, ideal para producciones de animación cortas.
- Creación de contenido para redes sociales: generación rápida de clips de video con audio, aptos para plataformas como TikTok o Instagram, con solo 4 pasos de muestreo.
- Prototipado de escenas en diseño de producto: visualización de animaciones a partir de keyframes, permitiendo iterar sobre movimientos y audio sin necesidad de renderizado complejo.
- Generación de metraje para publicidad: creación de videos promocionales con audio integrado, reduciendo costes de producción y tiempo de filmación.
- Investigación en modelos de difusión: estudio de técnicas de destilación y cuantización en modelos de video, gracias a la disponibilidad de una versión autocontenida y cuantizada.
- Integración en pipelines de ComfyUI: uso en flujos de trabajo automatizados de generación de video, aprovechando el cargador personalizado y los nodos de ComfyUI para composición y postprocesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: al menos 16 GB para ejecución completa en GPU, ya que el modelo ocupa aproximadamente 12.5 GB.
- GPU recomendadas: tarjetas Blackwell de 16 GB, que ofrecen soporte nativo para los kernels W4A4 de nunchaku. También puede ejecutarse en otras GPU de 16 GB, aunque el rendimiento óptimo se obtiene con hardware compatible.
- No cabe en GPUs de consumo con menos de 16 GB de VRAM.
- Despliegue: ComfyUI con el cargador personalizado H3-RotNVFP4-ComfyUI-Loader (ruta nunchaku). No se mencionan otras opciones como vLLM, llama.cpp u Ollama, dado que es un modelo de difusión.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Pasos de muestreo | Cuantización | Tamaño | Uso previsto |
|---|---|---|---|---|
| MiniMax-H3 FL2VA turbo 4-step v1.2 (este modelo) | 4 | rotated-NVFP4 T1 | ~12.5 GB | Generación rápida en GPU de 16 GB |
| MiniMax-H3 NVFP4-rotated (base) | 8 | rotated-NVFP4 | ~12.5 GB | Calidad y estabilidad, línea completa |
| MiniMax-H3 FL2VA turbo 4-step v1.0 (Comfy-Org) | 4 | bf16 | no disponible | Versión sin cuantizar, requiere más VRAM |

## Limitaciones y advertencias

- Requiere un cargador personalizado (H3-RotNVFP4-ComfyUI-Loader); no es compatible con ComfyUI vanilla.
- El text encoder recomendado debe ser la variante visual-merged del GGUF Q3_K_S, de lo contrario la detección del codificador podría fallar.
- No se han publicado datos sobre sesgos o alucinaciones; al ser un modelo de video, estos riesgos difieren de los de los modelos de lenguaje.
- La cuantización NVFP4 puede requerir hardware con soporte específico, especialmente para el rendimiento nativo de los kernels W4A4 de nunchaku.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos completos de la licencia antes de su uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pottokao/MiniMax-H3-FL2VA-turbo-4step-v1.2-768p-NVFP4-rotated-T1
- Cargador personalizado: https://huggingface.co/pottokao/H3-RotNVFP4-ComfyUI-Loader
- Text encoder recomendado: https://huggingface.co/pottokao/MiniMax-H3-TextEncoder-Qwen3VL-32B-abliterated-GGUF
- Modelo base NVFP4 rotado: https://huggingface.co/pottokao/MiniMax-H3-NVFP4-rotated
- LoRA turbo v1.0 (referencia de Comfy-Org): https://huggingface.co/Comfy-Org/MiniMax-H3/blob/main/loras/minimax_h3_fl2v_turbo_4step_v1.0_768p_comfyui_bf16.safetensors
