# intel-ai/MiniMax-H3-MXFP-Comfy

## Resumen

MiniMax-H3-MXFP-Comfy es un conjunto de checkpoints cuantizados en formato single-file (`.safetensors`) para ComfyUI del modelo MiniMax-H3, un modelo de generación conjunta de audio y vídeo desarrollado por MiniMax. La publicación corre a cargo de intel-ai y se distribuye bajo la MiniMax-H3 Community License Agreement. El paquete incluye el DiT de difusión, el text encoder, el VAE de vídeo y el VAE de audio, todos ellos cuantizados con Intel AutoRound 0.17.0 a formatos OCP Microscaling (MXFP8, MXFP4) y FP8 E4M3 per-token per-channel, con rotación Hadamard opcional de 256 dimensiones (ConvRot-256).

El problema que resuelve es la huella de memoria de un pipeline de vídeo-audio de gran tamaño: el DiT pruned FL2VA tiene 20.11B parámetros y el text encoder Qwen3-VL-32B truncado tiene 25.75B, lo que en BF16 resultaría inviable en GPUs de consumo. La cuantización reduce el DiT a ~21 GB (MXFP8) o ~21 GB (FP8 PTPC) y el text encoder a ~14.95 GB (MXFP4), permitiendo ejecutar el pipeline completo en hardware Intel XPU y NVIDIA Blackwell (B200/SM100).

Es relevante ahora porque valida de extremo a extremo la aceleración nativa de microscaling en dos plataformas distintas (Intel XPU y NVIDIA Blackwell), y porque todos los checkpoints se cuantizaron directamente desde los pesos oficiales BF16/FP16, nunca re-cuantizados desde INT8 o NVFP4, lo que preserva la fidelidad numérica. El repositorio ocupa 424.5 GB e incluye 10 checkpoints cuantizados nuevos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) conjunto audio-vídeo, pruned FL2VA, 50 bloques; text encoder Qwen3-VL-32B truncado a 50 capas |
| Parametros totales | DiT: 20.11B; text encoder: 25.75B (hidden size 5120) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP8 (E4M3 + E8M0 block-32), MXFP4 (E2M1 packed + E8M0 block-32), FP8 PTPC (float8_e4m3fn per-channel weight × dynamic per-token FP8 act); ConvRot-256 opcional |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors single-file para ComfyUI, con tensores `.comfy_quant` por capa y `_quantization_metadata` a nivel de fichero |

## Arquitectura y entrenamiento

El componente principal es un Diffusion Transformer (DiT) pruned FL2VA de 20.11B parámetros y 50 bloques que genera audio y vídeo de forma conjunta. La cuantización afecta a 200 capas lineales (`blocks.{0..49}.{attn.qkv_proj, attn.out_proj, mlp.fc1, mlp.fc2}`); los tensores sensibles (conditioning, refiner, patch embedding, modulación AdaLN, normas y proyección final) se preservan literalmente desde `minimax_h3_fl2va_pruned_bf16.safetensors`. El text encoder es un Qwen3-VL-32B truncado a 50 capas, con 350 capas lineales cuantizadas a MXFP4 (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`) más la tabla de embeddings `model.embed_tokens` en MXFP8 weight-only sin rotar; la torre visual y las layer norms permanecen en BF16.

Todos los checkpoints se cuantizaron con Intel AutoRound 0.17.0 y cuantizadores PTPC row-wise directamente desde los pesos oficiales BF16/FP16, y se validaron de extremo a extremo tanto en Intel XPU como en NVIDIA Blackwell (B200/SM100). La innovación técnica destacable es el uso de microscaling OCP (MXFP8/MXFP4) con rotación Hadamard de 256 dimensiones para mejorar la distribución numérica antes de cuantizar, junto con la regla E8M0 de FlashInfer/Eager que permite ejecución nativa W4A4 en B200 y dequant+FP32 por defecto en XPU. No se dispone de información sobre el número de tokens de entrenamiento ni sobre la composición del dataset original de MiniMax-H3.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) mediante el pipeline `video_minimax_h3_t2v.json`.
- Generación de vídeo a partir de imagen (image-to-video).
- Generación conjunta de audio y vídeo (audio-video) con VAE de vídeo y VAE de audio separados.
- Ejecución en ComfyUI con checkpoints single-file y metadatos de cuantización por capa.
- Inferencia nativa en microscaling sobre Intel XPU y NVIDIA Blackwell (B200/SM100).
- Soporte opcional de LoRA Turbo de 8 pasos para acelerar la generación.
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible (no es un modelo de lenguaje conversacional).
- Modo thinking, visión o audio como modelo de lenguaje: no disponible; la torre visual del text encoder se mantiene en BF16 pero su función es la codificación de prompts.

## Casos de uso

- Generación de clips de vídeo con audio sincronizado para prototipado creativo: el pipeline completo carga DiT, text encoder, VAE de vídeo y VAE de audio, y produce vídeo con pista de audio en una sola pasada, adecuado para equipos que iteran sobre guiones visuales.
- Image-to-video para animación de storyboards: partiendo de una imagen fija, el modelo genera la secuencia animada, útil en preproducción de animación y publicidad.
- Despliegue en estaciones de trabajo con Intel XPU: la combinación "Default Balanced" (DiT FP8 PTPC nativo + text encoder MXFP4 con dequant FP32 + VAE MXFP8 nativo) permite ejecutar el pipeline en GPUs Intel sin recurrir a BF16 completo.
- Inferencia acelerada en NVIDIA Blackwell: la combinación "Full Native MXFP" activa W8A8 en el DiT y W4A4 nativo en el text encoder sobre B200/SM100, reduciendo el coste por clip en entornos de datacenter.
- Generación rápida con LoRA Turbo de 8 pasos: para demos interactivas y pruebas de concepto donde prima la latencia sobre la calidad máxima.
- Investigación en cuantización de modelos de difusión: el repositorio ofrece pares de checkpoints con y sin ConvRot-256 y con distintas políticas de ejecución (`full_precision_matrix_mult=true/false`), lo que permite estudios comparativos de fidelidad numérica.
- Integración en flujos ComfyUI existentes: al ser single-file `.safetensors` con `.comfy_quant` por capa, se cargan directamente en los nodos de ComfyUI sin conversión adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta validación end-to-end en Intel XPU y NVIDIA Blackwell (B200/SM100), sin métricas cuantitativas de calidad (FVD, CLIP score, etc.) ni comparativas numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: el DiT cuantizado ocupa ~21 GB (MXFP8 o FP8 PTPC) y el text encoder ~14.95 GB (MXFP4); sumando VAE de vídeo MXFP8 y VAE de audio FP32, el pipeline completo requiere del orden de 40 GB o más de memoria, además del espacio de activaciones.
- GPU recomendadas: NVIDIA B200/SM100 para ejecución nativa W4A4/W8A8; GPUs Intel XPU compatibles con FP8 y microscaling para el modo "Default Balanced".
- Cabe en consumer GPU: no disponible; por el tamaño agregado del pipeline no es esperable que quepa en GPUs de consumo de 24 GB sin offloading agresivo, aunque este dato no se confirma en la información proporcionada.
- Opciones de despliegue: ComfyUI con checkpoints single-file; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de vídeo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-MXFP-Comfy (esta ficha) | DiT 20.11B + TE 25.75B | no disponible | MXFP8, MXFP4, FP8 PTPC, ConvRot-256 | minimax-h3-community-license-agreement | Hugging Face (intel-ai) |
| MiniMax-H3 (original) | DiT 20.11B + TE 25.75B | no disponible | BF16/FP16 | minimax-h3-community-license-agreement | Hugging Face (MiniMaxAI) |
| Comfy-Org/MiniMax-H3 | no disponible | no disponible | no disponible | no disponible | Hugging Face (Comfy-Org) |

No se dispone de datos de benchmarks para establecer comparaciones de rendimiento con alternativas de la misma categoría (generación conjunta audio-vídeo).

## Limitaciones y advertencias

- Licencia MiniMax-H3 Community License Agreement: es necesario revisar sus términos antes de cualquier uso comercial; no es una licencia permisiva tipo Apache o MIT.
- El repositorio ocupa 424.5 GB; la descarga y el almacenamiento requieren planificación de disco considerable.
- Los checkpoints están pensados para ComfyUI y el pipeline `video_minimax_h3_t2v.json`; no son directamente compatibles con otros runners sin conversión.
- La ejecución nativa W4A4 depende de NVIDIA Blackwell (B200/SM100); en otras GPUs se aplica dequant+FP32, con la consiguiente pérdida de aceleración.
- La cuantización MXFP4 en el text encoder puede introducir degradación en la fidelidad de prompts complejos; el repositorio ofrece variantes `full_precision_matrix_mult=true` para mitigarlo a costa de rendimiento.
- Los tensores sensibles (conditioning, AdaLN, normas) se mantienen en BF16, pero el resto del DiT está cuantizado: no se han publicado evaluaciones de calidad objetivas frente al modelo original.
- Sesgos conocidos y riesgo de alucinación: no disponible en la información proporcionada.
- Idiomas soportados: no disponible.
- No se han publicado resultados de benchmarks que permitan cuantificar la pérdida de calidad respecto a MiniMax-H3 en BF16.

## Enlaces

- Hugging Face: https://huggingface.co/intel-ai/MiniMax-H3-MXFP-Comfy
- Modelo base MiniMaxAI/MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Modelo base Comfy-Org/MiniMax-H3: https://huggingface.co/Comfy-Org/MiniMax-H3
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Intel AutoRound: https://github.com/intel/auto-round
