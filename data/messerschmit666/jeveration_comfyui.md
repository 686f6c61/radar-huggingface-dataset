# messerschmit666/Jeveration_ComfyUI

## Resumen

Jeveration es un modelo de generación de imágenes texto-a-imagen desarrollado por Yuhe Liu, Qi Li, Shihua Zhang y Xinchao Wang, presentado en el paper "Jeveration: System One Models Now Generate" (arXiv:2611.24738). El modelo genera una imagen de 512 x 512 píxeles en un único paso forward, sin proceso iterativo de difusión, lo que lo sitúa en la categoría de modelos generativos de un solo paso.

La arquitectura combina un backbone de lenguaje Qwen3.5-4B (Alibaba Cloud) con una cabeza de imagen, un codebook y decodificador TA-TiTok de ByteDance, y una torre de texto CLIP ViT-L/14-336 de OpenAI. Sobre el modelo base se aplica una LoRA de rango 256 que se fusiona en fp32 durante la conversión.

Este repositorio concreto, `messerschmit666/Jeveration_ComfyUI`, no es el modelo original sino un port que integra Jeveration en ComfyUI mediante un parche contra la versión v0.46.1. Incluye un checkpoint listo para usar en formato int8 ConvRot (6,7 GB), un workflow JSON, un script de conversión y el parche de ComfyUI. El alcance es exclusivamente texto-a-imagen: las tareas de imagen-a-imagen y predicción densa del modelo original no están portadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3.5-4B) con cabeza de imagen, codebook y decodificador TA-TiTok; LoRA rango 256 fusionada |
| Parametros totales | no disponible (backbone Qwen3.5-4B + cabeza y decodificador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 ConvRot (per-channel scale, Hadamard group 256) para backbone; bf16 para el resto; variante bf16 completa |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint único para ComfyUI); originales en .pt |

## Arquitectura y entrenamiento

Jeveration no es un modelo de difusión: genera una imagen de 512 x 512 en un único forward pass, lo que el paper enmarca como "System One Models Now Generate". El backbone es Qwen3.5-4B, sobre el que se aplica una LoRA de rango 256 que el script de conversión fusiona en fp32. A la salida del backbone se añade una cabeza de imagen que produce tokens del codebook TA-TiTok (bl128_vq), que un decodificador TA-TiTok de 512 px convierte en píxeles. La torre de texto del decodificador es CLIP ViT-L/14-336 de OpenAI.

El script `convert_jeveration.py` construye un checkpoint único de ComfyUI a partir de los pesos originales (`jeveration.pt`, `decoder512.pt`), Qwen3.5-4B, el codebook TA-TiTok y CLIP-L-336. La variante `--int8-convrot` cuantiza los pesos de atención, atención lineal y MLP del backbone a int8 tensorwise con ConvRot (escala por canal, Hadamard grupo 256), partiendo de los pesos fusionados en fp32; el resto de pesos permanece en bf16. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO.

## Capacidades

- Generación de imágenes texto-a-imagen a 512 x 512 en un único paso forward.
- Integración nativa en ComfyUI mediante dos nodos: *Jeveration Sampler* y *Jeveration Decode*.
- Workflow texto-a-imagen listo para arrastrar al canvas de ComfyUI.
- Soporte de cuantización int8 ConvRot para reducir el checkpoint a 6,7 GB.
- Conversión de pesos originales a checkpoint único de ComfyUI (bf16 o int8 ConvRot).
- Idiomas: únicamente inglés según la model card.
- No incluye: imagen-a-imagen, predicción densa, tool calling, agentes, visión de entrada ni audio.

## Casos de uso

- Generación rápida de imágenes en ComfyUI: el modelo produce una imagen 512 x 512 en un solo forward, lo que permite iterar prompts con menor coste computacional que pipelines de difusión multi-paso.
- Prototipado de ilustraciones para documentación técnica: con prompts en inglés se pueden generar bocetos de diagramas o escenas que sirvan como base para edición posterior.
- Exploración de modelos generativos de un solo paso: útil para investigadores que quieran comparar la calidad de la generación one-shot frente a difusión en un entorno ComfyUI ya existente.
- Integración en flujos de trabajo de ComfyUI con otros nodos: el checkpoint único permite encadenar el sampler con post-procesado, upscaling o control de imagen dentro del grafo.
- Despliegue en hardware con VRAM limitada: la variante int8 ConvRot de 6,7 GB reduce los requisitos frente a la bf16 de 10,3 GB, facilitando su uso en GPUs de gama consumer.
- Evaluación de la fusión de LoRA sobre Qwen3.5-4B: el script de conversión permite reconstruir el checkpoint y estudiar el efecto de la LoRA de rango 256 en la generación visual.
- Docencia y demos de generación texto-a-imagen: el workflow JSON y el parche permiten montar una demo funcional en ComfyUI v0.46.1 con pocos pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint int8 ConvRot ocupa 6,7 GB en disco; la variante bf16 ocupa 10,3 GB. La VRAM de inferencia debe cubrir el checkpoint más activaciones y el decodificador, por lo que se estima por encima del tamaño del checkpoint (no disponible cifra exacta).
- GPU recomendadas: no disponible en la información proporcionada.
- Cabe en GPU consumer: la variante int8 de 6,7 GB es compatible con GPUs consumer de 8-12 GB de VRAM; la bf16 de 10,3 GB requiere al menos 12 GB. No se especifican modelos concretos.
- Opciones de despliegue: ComfyUI v0.46.1 con el parche `comfyui-jeveration-v0.46.1.patch` (nodos *Jeveration Sampler* y *Jeveration Decode*). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. El modelo genera en un único forward pass, lo que en principio reduce el número de pasos frente a difusión, pero no se aportan medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Generación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeveration (este port) | Backbone Qwen3.5-4B + cabeza/decoder | no disponible | 512x512 en 1 paso | Apache 2.0 | Hugging Face, ComfyUI |
| Modelos de difusión texto-a-imagen | no disponible | no disponible | Multi-paso iterativo | variable | amplia |
| Modelos generativos one-shot | no disponible | no disponible | 1 paso | variable | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El port cubre solo texto-a-imagen; imagen-a-imagen y predicción densa del modelo original no están disponibles.
- El parche está hecho contra ComfyUI v0.46.1; en versiones más recientes puede requerir `git apply --3way` y resolver conflictos manualmente.
- Idioma limitado a inglés según la model card; el rendimiento en otros idiomas no está documentado.
- Resolución fija de 512 x 512; no se documenta soporte de otras resoluciones o aspect ratios.
- Riesgo de sesgos y alucinaciones visuales inherente a modelos generativos; no se aporta información sobre mitigaciones.
- No hay datos publicados de benchmarks, por lo que la calidad frente a alternativas no está cuantificada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un port de terceros, no el modelo oficial.
- La licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso NOTICE del proyecto original.
- Los pesos originales se cargan con `torch.load(weights_only=True)`; el script de conversión no usa red.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/messerschmit666/Jeveration_ComfyUI
- Modelo original: https://huggingface.co/linlinlinlinsdada/Jeveration
- Paper: https://arxiv.org/abs/2611.24738
- Código: https://github.com/Carol-lyh/Jeveration
- Project page: https://carol-lyh.github.io/Jeveration/
- ComfyUI: https://github.com/Comfy-Org/ComfyUI
- Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- TA-TiTok (1d-tokenizer): https://github.com/bytedance/1d-tokenizer
- Tokenizer TA-TiTok: https://huggingface.co/turkeyju/tokenizer_tatitok_bl128_vq
- CLIP ViT-L/14-336: https://huggingface.co/timm/vit_large_patch14_clip_336.openai
