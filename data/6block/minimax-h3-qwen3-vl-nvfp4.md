# 6block/MiniMax-H3-Qwen3-VL-NVFP4

## Resumen

MiniMax-H3-Qwen3-VL-NVFP4 es un text encoder cuantizado a 4 bits (NVFP4) del modelo Qwen3-VL-32B, preparado por 6block como componente de condicionamiento para el modelo de generación de video MiniMax-H3. El modelo base MiniMax-H3, desarrollado por MiniMax (Hailuo AI 3.0), es un transformer nativo capaz de generar video 2K sincronizado con audio estéreo 3D en un solo paso de difusión. Este encoder cuantizado actúa como reemplazo directo del text encoder original en ComfyUI, permitiendo ejecutar el stack completo de H3 en GPUs de consumo con 24 GB de VRAM.

La cuantización es weight-only PTQ realizada con convert-to-quant, protegiendo en bf16 las capas más sensibles: token embeddings, primera y última capa del language model, y toda la torre de visión. El resultado es un archivo de ~17,9 GiB (frente a los 48 GiB del original bf16), con una fidelidad perceptual y temporal prácticamente idéntica al encoder sin cuantizar, según las métricas reportadas (SSIM 0,891, LPIPS 0,099). Está diseñado específicamente para su uso en ComfyUI con el flujo de trabajo H3, junto con el DiT cuantizado NVFP4 de lilcheaty y la VAE de Comfy-Org.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL-32B (transformer multimodal) como text encoder para MiniMax-H3 (DiT nativo) |
| Parametros totales | 32B (text encoder base); modelo completo no especificado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 (FP4 E2M1, block 16) con capas protegidas en bf16 |
| Idiomas soportados | en, zh |
| Licencia | minimax-community-license |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una cuantización del text encoder Qwen3-VL-32B, un transformer multimodal que procesa texto e imágenes. En el contexto de MiniMax-H3, este encoder genera las condiciones que guían al DiT (Diffusion Transformer) para producir video. La cuantización se realizó con convert-to-quant usando el comando `ctq --nvfp4 --qwen_vlm --comfy_quant`, aplicando PTQ (post-training quantization) solo a los pesos de las capas lineales del bloque medio del language model. Las capas críticas (embeddings, primera y última capa, y la torre de visión completa) se mantienen en bf16 para preservar la fidelidad del condicionamiento.

El modelo base MiniMax-H3 es un transformer nativo que genera video 2K y audio estéreo 3D de forma sincronizada en un solo paso de difusión. El encoder cuantizado no altera los pesos del DiT ni de la VAE; solo sustituye el text encoder original. No se han publicado detalles sobre el entrenamiento del modelo base (datos, tokens, RLHF) en la información proporcionada.

## Capacidades

- Generación de video a partir de prompts de texto (text-to-video) mediante el pipeline MiniMax-H3.
- Condicionamiento multimodal: al mantener la torre de visión en bf16, puede procesar referencias visuales (ref2va) para mantener la identidad de personajes en múltiples vistas (verificado con 3 vistas).
- Integración nativa con ComfyUI mediante `CLIPLoader` tipo `minimax`, como reemplazo directo del encoder bf16.
- Compatibilidad con el turbo LoRA de 4 pasos (de Gluttony10) para generación rápida (~2 min/clip).
- Generación de video limpio a 720p con calidad perceptual equivalente al encoder bf16.
- Soporte de cuantización NVFP4 optimizada para GPUs Blackwell; en Ada requiere torch cu130 para kernels FP4 nativos.

## Casos de uso

- Generación de video profesional en ComfyUI: el encoder permite crear clips de video de alta calidad (720p) a partir de prompts de texto, con un flujo de trabajo reproducible y sin necesidad de GPUs de datacenter.
- Producción de video con control de personaje: gracias al soporte ref2va (identity-lock), se pueden generar clips manteniendo la apariencia de un personaje de referencia en diferentes tomas o ángulos, útil para animación y previsualización.
- Prototipado rápido de ideas visuales: con el turbo LoRA de 4 pasos, se pueden generar clips en ~2 minutos, lo que permite iterar rápidamente sobre conceptos creativos antes de una producción completa.
- Creación de contenido para redes sociales: la capacidad de generar video corto con audio sincronizado (a través del modelo base) permite producir material para plataformas como YouTube Shorts, TikTok o Instagram Reels.
- Investigación en generación de video: el encoder cuantizado facilita la experimentación con MiniMax-H3 en hardware de consumo, permitiendo a investigadores probar variaciones de prompts y configuraciones sin acceso a clústeres de GPU.
- Integración en pipelines de automatización: al ser un drop-in replacement en ComfyUI, puede integrarse en flujos de trabajo automatizados para generar videos de forma programática, por ejemplo para demos, presentaciones o material educativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque este modelo es un text encoder cuantizado, no un modelo de lenguaje general. En su lugar, el autor reporta métricas de fidelidad de cuantización comparando el encoder NVFP4 con el bf16 original sobre un conjunto de 16 clips emparejados:

| Metrica | Valor | Interpretacion |
|---|---|---|
| LPIPS (menor es mejor) | 0,099 | Distancia perceptual por frame; equivalencia perceptual |
| SSIM (mayor es mejor) | 0,891 | Similitud estructural por frame; alta similitud |
| Flicker temporal (media diff entre frames) | 13,75 → 14,12 (+2,7%) | Estabilidad temporal preservada |
| PSNR | 24,85 dB | Bajo por divergencia de sampler, no indicativo de calidad perceptual |
| FVD (i3d, referencia interna) | 1059,5 | No comparable; requiere n ≥ 2048 para validez estadistica |

Rendimiento en inferencia: ~29 s/step a 24 GB VRAM; ~2 min/clip con el turbo LoRA de 4 pasos; más rápido en GPUs con 32 GB o más.

## Requisitos de hardware

- VRAM estimada: ~25,7 GiB pico con el stack completo 4-bit (encoder + DiT + VAE) dentro de un presupuesto de 24 GB con offload en ComfyUI.
- GPU recomendadas: RTX 4090 (Ada) con offload y torch cu130 para kernels FP4 nativos; GPUs Blackwell (RTX 50xx) para máximo rendimiento NVFP4.
- En GPUs consumer de 24 GB (RTX 3090, 4090) es viable con offload; en GPUs de 32 GB o más (A6000, RTX 5000 Ada) funciona sin offload y más rápido.
- Opciones de despliegue: ComfyUI (verificado), con `CLIPLoader` tipo `minimax` y `UNETLoader` para el DiT NVFP4. No se mencionan otros frameworks en la información.
- Latencia: ~29 s/step a 24 GB; con turbo LoRA (4 pasos) se obtiene un clip en ~2 minutos. En Ada sin cu130, los kernels FP4 se emulan y son ~2,3× más lentos.

## Comparativa con modelos similares

| Modelo | Tamano | Contexto | Fidelidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Qwen3-VL-NVFP4 (este) | 17,9 GiB (encoder 4-bit) | No disponible | SSIM 0,891, LPIPS 0,099 vs bf16 | MiniMax Community | HuggingFace |
| Encoder bf16 original (Comfy-Org/MiniMax-H3) | 48 GiB | No disponible | Referencia (bf16) | MiniMax Community | HuggingFace |
| Encoders NVFP4 agresivos (comunidad) | ~15,7 GiB | No disponible | No reportado | MiniMax Community | HuggingFace |

La principal diferencia frente a otros encoders cuantizados es el equilibrio entre tamaño y fidelidad: este modelo ocupa ~2 GiB más que la versión más agresiva, pero protege capas críticas en bf16, lo que resulta en una fidelidad perceptual y temporal verificada. No se dispone de comparativas con otros modelos de generación de video (p. ej., Stable Video Diffusion) en la información proporcionada.

## Limitaciones y advertencias

- Idiomas soportados: solo en y zh según la model card; el uso con otros idiomas puede degradar la calidad del condicionamiento.
- Requisitos de hardware: necesita al menos 24 GB de VRAM con offload; en GPUs sin soporte nativo FP4 (Ada), el rendimiento se reduce ~2,3× si no se usa torch cu130.
- Licencia: la minimax-community-license impone restricciones de uso comercial; es necesario revisar los términos exactos antes de usar el modelo en producción.
- La cuantización, aunque perceptualmente equivalente, introduce ligeras diferencias en la salida (flicker +2,7%); para aplicaciones donde se requiera estabilidad temporal exacta, se recomienda validar con el encoder bf16.
- El FVD reportado (1059,5) no es comparable con valores publicados debido al pequeño tamaño de muestra; no debe usarse como métrica de calidad absoluta.
- No se proporcionan datos sobre sesgos, alucinaciones o comportamiento en dominios específicos; como modelo de video, puede generar contenido no deseado si los prompts no se filtran adecuadamente.
- El modelo depende de componentes externos (DiT NVFP4 de lilcheaty, VAE de Comfy-Org, turbo LoRA de Gluttony10) que deben descargarse por separado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/6block/MiniMax-H3-Qwen3-VL-NVFP4
- Modelo base (Comfy-Org/MiniMax-H3): https://huggingface.co/Comfy-Org/MiniMax-H3
- DiT NVFP4 companion (lilcheaty): https://huggingface.co/lilcheaty/MiniMax-H3-NVFP4
- Turbo LoRA (Gluttony10): https://huggingface.co/Gluttony10/MiniMax-H3-INT8-CONVROT
- Herramienta de cuantización convert-to-quant: https://github.com/silveroxides/convert_to_quant
- Guía de integraciones MiniMax H3: https://github.com/MiniMax-AI/awesome-minimax-h3-integration
- Guía de instalación local de MiniMax H3: https://kingy.ai/ai/ai-guides/minimax-h3-local-installation-hardware-guide/
- Documentación de Qwen3-VL: https://huggingface.co/docs/transformers/model_doc/qwen3_vl
