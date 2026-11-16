# kabcnd/Kenzan-MiniMax-H3-Image-20B-PinGrid-GGUF

## Resumen

Kenzan-MiniMax-H3-Image-20B-PinGrid-GGUF es una cuantización extrema en formato GGUF del modelo de generación y edición de imágenes MiniMax-H3-Image, publicada por el usuario kabcnd bajo la serie "Kenzan". El objetivo declarado del autor es hacer viable la inferencia local de un pipeline de difusión de 20.113.672.082 parámetros (un Diffusion Transformer de 50 bloques) junto con un codificador de texto/visión Qwen3-VL-32B truncado a 50 capas, dentro de los 16 GB de memoria unificada de un Apple Mac mini M6. Para ello aplica una estrategia propia de cuantización por capas denominada "Pin-Grid", que asigna precisiones distintas (Q2_K, Q3_K, Q4_0, Q5_K, Q8_0 y F32) según la sensibilidad de cada bloque.

El paquete completo incluye tres artefactos: el DiT cuantizado a 8,40 GiB (compresión de 4,46× frente a los 37,47 GiB en BF16), el codificador de texto Qwen3-VL-32B en 10,46 GiB (desde 25,28 GiB en int8_convrot) y el VAE original en FP16 de 1,09 GiB. El autor publica además los scripts de conversión a GGUF.

Es relevante porque demuestra que un modelo de imagen de escala frontier puede ejecutarse en hardware de consumo con memoria unificada, usando `stable-diffusion.cpp` con backend Metal o ComfyUI con ComfyUI-GGUF. El modelo base es Comfy-Org/MiniMax-H3-Image y la licencia aplicable es la MiniMax-H3-Image Community License Agreement, que no es una licencia de código abierto estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de 50 bloques + codificador de texto/visión Qwen3-VL-32B (50 capas) + VAE |
| Parametros totales | 20.113.672.082 (DiT); el codificador de texto se distribuye aparte |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pin-Grid: Q2_K, Q3_K, Q4_0, Q5_K, Q8_0 y F32 (normas y adaln) en el DiT; Q2_K, Q3_K, Q4_0, Q5_K y Q8_0 en el codificador de texto; VAE en FP16 |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-image-community-license-agreement (license: other) |
| Formato de pesos | GGUF (DiT y codificador de texto) + safetensors (VAE) |

## Arquitectura y entrenamiento

El modelo base es un Diffusion Transformer de 20.113.672.082 parámetros con 50 bloques, que actúa como red de difusión para generación y edición de imágenes. La cuantización Kenzan no modifica la arquitectura, sino que redistribuye la precisión por capas: `token_refiner.*` y `final_layer.*` en Q5_K; bloques de entrada y salida (0, 1, 48, 49), las atenciones de los bloques 40-47 y los `mlp.fc2` de pico (8, 16, 24, 32, 40) en Q4_0; bloques medio-tardíos (20-47) en Q3_K; MLP tempranos (2-19) en Q2_K; y `adaln_t_table`, `adaln_proj`, `patch_proj` y todas las normas en F32 para preservar estabilidad numérica.

El codificador de texto es un Qwen3-VL-32B recortado a 50 capas, originalmente en `int8_convrot` (25,28 GiB), dequantizado y recuantizado con la misma estrategia Pin-Grid: `visual.*` en Q8_0 (necesario para edición de imagen), `model.embed_tokens` en Q5_K, capas de entrada y salida (0, 48, 49), `k_proj`/`v_proj` y `mlp.down_proj` de pico en Q4_0, capas 20-47 en Q3_K y MLP tempranos (1-19) en Q2_K.

No se dispone de información sobre el dataset de entrenamiento, número de tokens, composición ni si hubo RLHF/DPO en la información proporcionada. El autor publica los scripts de conversión (`recipes/convert_dit_to_gguf.py`, `recipes/convert_te_to_gguf.py`) para reproducir el proceso de cuantización en streaming.

## Capacidades

- Generación de imágenes texto-a-imagen (pipeline `text-to-image`).
- Edición de imágenes, soportada por las capas `visual.*` del codificador Qwen3-VL cuantizadas en Q8_0.
- Codificación conjunta de texto y visión mediante Qwen3-VL-32B, lo que permite condicionamiento multimodal.
- Inferencia local en Apple Silicon mediante `stable-diffusion.cpp` (`sd-cli` / `sd-server`) con Metal.
- Compatibilidad con ComfyUI a través de ComfyUI-GGUF.
- Muestreo con scheduler `euler`/`simple` y `cfg-scale` configurable (el autor verifica 6 pasos con `cfg-scale 1.0`).
- No se documentan capacidades de tool calling, agentes ni multi-step reasoning, al ser un modelo de imagen.

## Casos de uso

- Generación de imágenes en un Mac mini de 16 GB: el pipeline completo (DiT + codificador + VAE) cabe en memoria unificada con `--offload-to-cpu`, permitiendo generar a 1024×1024 sin OOM.
- Edición de imágenes local: las capas `visual.*` en Q8_0 permiten usar el codificador Qwen3-VL para condicionar ediciones sobre una imagen de entrada, sin salir del equipo.
- Prototipado de pipelines de difusión en ComfyUI: la integración con ComfyUI-GGUF permite construir grafos de generación y edición con carga por capas y dequantización en tiempo de ejecución.
- Servicio persistente de generación de imágenes: `sd-server` elimina el coste de carga en frío de pesos y expone un endpoint HTTP para integrarse en aplicaciones internas.
- Investigación en cuantización extrema: los scripts de conversión y la receta Pin-Grid sirven como base para estudiar el impacto de precisiones mixtas por capa en modelos de difusión de gran tamaño.
- Despliegue en entornos con memoria limitada: con 8,40 GiB de DiT y 10,46 GiB de codificador, es posible ejecutar el pipeline en máquinas de 16 GB, algo inviable con los pesos BF16 originales (37,47 GiB).

## Benchmarks y rendimiento

El autor publica mediciones de velocidad en un Apple Mac mini M6 con 16 GB de memoria unificada, a 1024×1024, 6 pasos, scheduler `euler/simple`:

| Backend | Velocidad por paso (DiT) | Decodificación VAE | RSS máximo | Notas |
|---|---|---|---|---|
| ComfyUI + ComfyUI-GGUF (PyTorch MPS) | 13,27 s/paso | 5,36 s | 11,88 GiB | Dequantización por capa a FP16 en runtime |
| stable-diffusion.cpp (sd-cli / sd-server, Metal 4) | 7,20 – 8,24 s/paso | 2,43 – 2,59 s | Cabe en 16 GB (`--offload-to-cpu`) | 1,8× más rápido en DiT y 2,1× en VAE |

No se han publicado resultados de benchmarks de calidad (FID, CLIP score, MMLU u otros) en la información disponible. Las cifras anteriores son medidas de latencia y memoria, no de calidad de generación.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el pipeline completo requiere aproximadamente 8,40 GiB (DiT) + 10,46 GiB (codificador) + 1,09 GiB (VAE), gestionados mediante `--offload-to-cpu` para encajar en 16 GB.
- GPU recomendadas: Apple Silicon con 16 GB de memoria unificada (verificado en Mac mini M6). No se documentan pruebas en GPU NVIDIA o AMD.
- Cabe en GPU de consumo: sí, en el escenario verificado de Apple Silicon de 16 GB; no hay datos para RTX 4090 u otras GPU discretas.
- Opciones de despliegue: `stable-diffusion.cpp` (`sd-cli` y `sd-server` con Metal y `--flash-attn on`), ComfyUI con ComfyUI-GGUF.
- Latencia y throughput: 7,20-8,24 s/paso en DiT y 2,43-2,59 s de decodificación VAE con `stable-diffusion.cpp`; 13,27 s/paso y 5,36 s con ComfyUI. Para 6 pasos, el tiempo total de generación ronda los 45-50 s en `stable-diffusion.cpp`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kenzan-MiniMax-H3-Image-20B-PinGrid-GGUF | 20.113.672.082 (DiT) + Qwen3-VL-32B L50 | no disponible | GGUF + safetensors | MiniMax-H3-Image Community License | Hugging Face (0 descargas) |
| Comfy-Org/MiniMax-H3-Image (modelo base) | 20.113.672.082 (DiT) | no disponible | no disponible en la información | MiniMax-H3-Image Community License | Hugging Face |
| MiniMaxAI/MiniMax-H3-Image (upstream) | no disponible | no disponible | no disponible | MiniMax-H3-Image Community License | Hugging Face |

No se dispone de información sobre otros modelos comparables de la misma categoría (difusión texto-a-imagen de ~20B) en la información proporcionada. No se han publicado datos de calidad que permitan comparar rendimiento frente a alternativas.

## Limitaciones y advertencias

- La cuantización extrema (Q2_K en MLP tempranos del DiT y del codificador) puede degradar la calidad de generación respecto al modelo en BF16; el autor no publica métricas de calidad comparativas.
- El recorte del codificador Qwen3-VL-32B a 50 capas puede reducir la fidelidad del condicionamiento de texto e imagen frente al modelo completo.
- El modelo está verificado únicamente en Apple Silicon de 16 GB con Metal; no hay validación en GPU NVIDIA, AMD ni en otros backends.
- El repositorio registra 0 descargas y 0 likes, y fue creado el 2026-11-16; se trata de una publicación muy reciente y sin validación comunitaria.
- La licencia MiniMax-H3-Image Community License Agreement no es una licencia de código abierto estándar; es necesario revisar sus términos antes de cualquier uso comercial.
- No se dispone de información sobre sesgos, idiomas soportados ni tasas de alucinación del modelo base.
- El rendimiento de 7,20-8,24 s/paso implica que una generación de 6 pasos tarda aproximadamente 45-50 s, lo que limita su uso en escenarios interactivos de baja latencia.
- El uso de `--offload-to-cpu` es obligatorio para encajar en 16 GB, lo que condiciona el rendimiento final.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kabcnd/Kenzan-MiniMax-H3-Image-20B-PinGrid-GGUF
- Modelo base en Comfy-Org: https://huggingface.co/Comfy-Org/MiniMax-H3-Image
- Modelo upstream MiniMaxAI: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- Prism ML (inspiración): https://huggingface.co/prism-ml
- Donaciones del autor: https://ko-fi.com/kabcpc
