# Abiray/MiniMax-H3-Image-GGUF

## Resumen

MiniMax-H3-Image es un modelo de generación y edición de imágenes basado en un Diffusion Transformer (DiT) de un solo flujo, desarrollado por MiniMax. El repositorio aquí descrito, `Abiray/MiniMax-H3-Image-GGUF`, no contiene los pesos originales sino cuantizaciones GGUF del checkpoint BF16 podado estructuralmente distribuido por Comfy-Org, pensadas para su uso en ComfyUI mediante el nodo `ComfyUI-GGUF`. El modelo base está diseñado para generación texto-a-imagen y edición multi-referencia a resolución ultra alta (hasta 16 MP / 4096 × 4096) en tan solo 6 pasos de muestreo destilados.

La relevancia de esta versión GGUF radica en que reduce el peso del DiT desde el tamaño del repo original (53,1 GB) hasta ficheros de entre 6,88 GB (Q2_K) y 14,10 GB (Q5_K_M), permitiendo ejecutar el modelo en GPUs de consumo con 8-24 GB de VRAM. No obstante, requiere ficheros complementarios obligatorios: un VAE de imagen de 24 canales y el codificador de texto Qwen3-VL-32B (leyendo estados ocultos de la capa 50), además de un parche de carga específico para corregir incompatibilidades del loader GGUF de ComfyUI.

El modelo declara 20.113.670.232 parámetros en el checkpoint safetensors, aunque la model card del autor cita 33,1B parámetros para el modelo original completo; la diferencia probablemente se debe al podado estructural aplicado por Comfy-Org. La licencia es la MiniMax-H3-Image Community License Agreement, distinta de las licencias open source estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de un solo flujo, destilado con Piecewise Decoupled Diffusion (PDD) |
| Parametros totales | 20.113.670.232 (checkpoint safetensors); la model card cita 33,1B para el modelo original sin podar |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión, no de texto) |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_M (capas sensibles en FP32 sin cuantizar) |
| Idiomas soportados | en |
| Licencia | minimax-h3-image-community-license-agreement |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors BF16 |

## Arquitectura y entrenamiento

MiniMax-H3-Image es un Diffusion Transformer de un solo flujo con un patchificador de entrada de 24 canales (`video_patch_proj`), una cabeza de salida PDD de 6 pasos (`final_layer`) y una base de modulación AdaLN de bajo rango (`adaln_basis` / `adaln_t_table`). El proceso de muestreo está destilado en 6 pasos mediante Piecewise Decoupled Diffusion (PDD), lo que reduce drásticamente el coste de inferencia frente a modelos de difusión tradicionales de 20-50 pasos. El decodificador latente es un VAE de imagen de 24 canales con decoder ViT 2D, distinto de los VAE de 4 canales de SD/Flux y del VAE de vídeo de 16 canales de versiones anteriores de H3.

El repositorio GGUF se genera a partir del checkpoint maestro BF16 podado estructuralmente por Comfy-Org (`minimax_h3_image_pruned_bf16.safetensors`), no del modelo original completo. En las cuantizaciones se preservan en FP32 sin cuantizar las capas sensibles (patchificador de 24 canales, cabeza de salida PDD y base AdaLN) para eliminar ruido de cuantización y artefactos de rejilla. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación texto-a-imagen a resolución ultra alta, hasta 16 MP (4096 × 4096).
- Edición de imagen multi-referencia (image-to-image e image-editing) con hasta 16 referencias según la model card.
- Muestreo destilado en 6 pasos (PDD), lo que reduce la latencia de inferencia.
- Integración con ComfyUI mediante el nodo `UnetLoaderGGUF` de `ComfyUI-GGUF` (requiere parche adicional).
- Codificador de texto Qwen3-VL-32B, lo que aporta capacidad de comprensión multimodal de las instrucciones (texto e imagen) en el pipeline.
- Soporte de cuantizaciones GGUF de 2 a 5 bits con capas sensibles en FP32.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni audio.

## Casos de uso

- Generación de imágenes de alta resolución para previsualización de producto: el modelo permite generar a 4096 × 4096 en 6 pasos, lo que encaja en pipelines de renderizado por lotes en GPUs de 16-24 GB con la cuantización Q4_K_M o Q5_K_M.
- Edición multi-referencia en flujos de diseño gráfico: la capacidad de image-editing con múltiples referencias permite componer variaciones de un diseño manteniendo coherencia entre elementos, usando el VAE de 24 canales para preservar detalle.
- Prototipado rápido en ComfyUI: con la cuantización Q2_K (6,88 GB) el modelo cabe en portátiles con GPU de 8-10 GB, lo que permite iterar prompts y workflows en local sin infraestructura dedicada.
- Generación de assets para videojuegos o entornos 3D: la resolución de hasta 16 MP permite producir texturas y sprites de alta resolución que luego se reducen en el pipeline de assets.
- Automatización de contenido editorial: integrado en un pipeline de ComfyUI con cola de trabajos, el modelo puede generar ilustraciones para artículos a partir de descripciones textuales, usando el codificador Qwen3-VL-32B para interpretar instrucciones complejas.
- Investigación en cuantización de modelos de difusión: el repo sirve como caso de estudio de cómo preservar capas sensibles en FP32 (patchificador, cabeza PDD, AdaLN) para evitar artefactos de rejilla en cuantizaciones agresivas de 2-3 bits.
- Despliegue en entornos con VRAM limitada: la variante Q3_K_M (8,91 GB) permite ejecutar el DiT en GPUs de 12 GB junto con el VAE y el codificador de texto cuantizado, aunque el codificador Qwen3-VL-32B añade entre 14,2 y 18,8 GB adicionales según cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el DiT según cuantización (según la model card):
  - Q2_K (6,88 GB): 8-10 GB de VRAM.
  - Q3_K_M (8,91 GB): 12 GB de VRAM.
  - Q4_K_S (11,60 GB): 12-16 GB de VRAM.
  - Q4_K_M (11,60 GB): 16 GB de VRAM (recomendado como punto óptimo).
  - Q5_K_M (14,10 GB): 16-24 GB de VRAM.
- A esta VRAM hay que sumar la del codificador de texto Qwen3-VL-32B (Q4_K_M ~18,8 GB o Q3_K_M ~14,2 GB en GGUF; también disponible en NVFP4/AWQ/INT8 en safetensors) y la del VAE de imagen de 24 canales en FP16.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; por los requisitos de VRAM, encajan GPUs de consumo de 16-24 GB (por ejemplo, RTX 4090 o RTX 4080) para Q4_K_M/Q5_K_M, y GPUs de 8-12 GB para Q2_K/Q3_K_M.
- Cabe en GPU de consumo: sí, con las cuantizaciones bajas (Q2_K en 8-10 GB, Q3_K_M en 12 GB), aunque el codificador de texto de 32B puede dominar el consumo total de VRAM.
- Opciones de despliegue: ComfyUI v0.45.0+ con `ComfyUI-GGUF` (`UnetLoaderGGUF`) y el parche `minimax_h3_image_gguf_fix.py`; no se documentan opciones para vLLM, llama.cpp u Ollama (el modelo es de difusión, no de texto).
- Latencia y throughput: no disponible; la model card destaca 6 pasos de muestreo destilados, pero no aporta cifras de tiempo por imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniMax-H3-Image (este repo, GGUF) | 20,1B (checkpoint podado); 33,1B citado para el original | hasta 16 MP / 4096 × 4096, 6 pasos PDD | minimax-h3-image-community-license-agreement | GGUF (Q2_K a Q5_K_M) | Requiere VAE 24 canales y Qwen3-VL-32B |
| MiniMax-H3-Image (original, MiniMaxAI) | 33,1B | hasta 16 MP / 4096 × 4096, 6 pasos PDD | minimax-h3-image-community-license-agreement | safetensors BF16 | Modelo base sin podar |
| MiniMax-H3-Image (Comfy-Org pruned BF16) | no disponible | hasta 16 MP / 4096 × 4096 | no disponible | safetensors BF16 | Checkpoint podado del que se derivan estos GGUF |
| Otras alternativas de difusión texto-a-imagen | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks ni de comparativas publicadas en la información proporcionada |

## Limitaciones y advertencias

- Licencia restrictiva: la MiniMax-H3-Image Community License Agreement no es una licencia open source estándar; es necesario revisar sus términos antes de cualquier uso comercial.
- El repositorio contiene solo cuantizaciones GGUF del checkpoint podado; no es un modelo autónomo y requiere VAE de 24 canales y codificador Qwen3-VL-32B para funcionar.
- Sin el parche `minimax_h3_image_gguf_fix.py`, el loader falla con errores de argumento `pdd_sigmas` o de canales `24 vs 144`; el parche debe colocarse en `ComfyUI/custom_nodes/`.
- No usar VAE de 4 canales (SD/Flux) ni el VAE de vídeo de 16 canales de versiones anteriores de H3; el modelo espera un VAE de imagen de 24 canales con decoder ViT 2D.
- Las cuantizaciones de 2 y 3 bits pueden introducir degradación visual; la model card recomienda Q4_K_M como punto óptimo y Q5_K_M como máxima fidelidad.
- El modelo base está entrenado y etiquetado solo para inglés (`en`); no se documenta soporte multilingüe.
- Riesgo de sesgos y alucinaciones visuales inherente a los modelos de difusión: no se documentan evaluaciones de sesgo ni de fidelidad semántica.
- El checkpoint está podado estructuralmente respecto al original de 33,1B; no se detalla qué componentes se han eliminado ni su impacto en calidad.
- Repositorio con 0 descargas y 7 likes en el momento de la consulta: ecosistema de usuarios muy reducido, lo que implica menor validación comunitaria.
- No se documentan requisitos de VRAM conjuntos (DiT + VAE + codificador de texto), por lo que el consumo total puede superar ampliamente las cifras indicadas para el DiT.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Abiray/MiniMax-H3-Image-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Checkpoint podado BF16 (Comfy-Org): https://huggingface.co/Comfy-Org/MiniMax-H3-Image
- VAE de imagen 24 canales: https://huggingface.co/Comfy-Org/MiniMax-H3-Image/tree/main/vae
- Codificadores de texto oficiales (NVFP4/AWQ/INT8/BF16): https://huggingface.co/Comfy-Org/MiniMax-H3-Image/tree/main/text_encoders
- Codificador de texto GGUF Q4_K_M (Abiray): https://huggingface.co/Abiray/MiniMax-H3-GGUF/blob/main/text_encoders/qwen3vl_32b_minimax_h3-Q4_K_M.gguf
- Codificador de texto GGUF Q3_K_M (Abiray): https://huggingface.co/Abiray/Qwen3-VL-32B-Instruct-GGUF/blob/main/Qwen3vl_32b_h3-Q3_K_M.gguf
- Workflow de ejemplo ComfyUI: https://huggingface.co/Abiray/MiniMax-H3-Image-GGUF/blob/main/image_minimax_h3_image_t2i_gguf.json
- Parche de carga GGUF: https://huggingface.co/Abiray/MiniMax-H3-Image-GGUF/blob/main/minimax_h3_image_gguf_fix.py
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
