# ramusgill/comfyui-colab-flash

## Resumen

`ramusgill/comfyui-colab-flash` no es un modelo de lenguaje en sentido estricto, sino un repositorio de artefactos de despliegue precompilados para ejecutar ComfyUI con los modelos **MiniMax-H3 Turbo** (video+audio multimodal) y **Qwen-Image-Edit 2511** (edición de imagen) sobre GPUs Blackwell de Google Colab. El autor, `ramusgill`, empaqueta un entorno Python 3.13 con CUDA 13.0, kernels Triton precompilados para `sm_120`, 84 nodos personalizados saneados, 87 LoRAs con metadatos SHA256 precalculados y codificadores de texto/VAE listos para descarga. El repositorio ocupa 47,2 GB en total.

El problema que resuelve es el arranque lento y frágil de pipelines de difusión multimodal en entornos efímeros: la configuración heredada descarga 5,46 GiB de entorno más 587 MiB de nodos y tarda 52,3 s en arrancar ComfyUI con errores de importación; la versión optimizada reduce esto a 1,46 GiB + 62,7 MiB y 14,7 s sin errores. La primera generación en frío pasa de 140,9 s a 14,0 s gracias a `--fast-disk` y cachés persistentes.

Es relevante ahora porque demuestra una práctica de ingeniería de distribución (empaquetado reproducible de kernels CUDA 13 para Blackwell, indexado de LoRAs sin hashing en disco, túneles sin secretos vía Cloudflare) aplicable a cualquier despliegue de modelos generativos en infraestructura cloud efímera. No contiene pesos de un LLM propio ni publica benchmarks de calidad de modelo, solo métricas de rendimiento del runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (repositorio de artefactos de despliegue; los modelos subyacentes son MiniMax-H3 y Qwen-Image-Edit, arquitecturas no detalladas en la model card) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 (scale dinámico `recalculate`), INT8 (ComfyKitchen), W4A8 (~14 GB), FP4 (SageAttn3 Blackwell) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (`qwen_2.5_vl_7b_fp8_scaled.safetensors`, `qwen_image_vae.safetensors`); LoRAs en bf16; entornos empaquetados en `.tar.zst` |

## Arquitectura y entrenamiento

El repositorio no entrena modelos: distribuye un entorno de ejecución. Incluye `h3_env_py313_cu130_flash.tar.zst` (1,46 GiB) con Python 3.13 y ComfyUI 0.39.0 sobre CUDA 13.0, usando `--system-site-packages` para evitar duplicar `nvidia/*` y `torch`, con `onnxruntime-gpu 1.31.1` compilado para CUDA 13 y parches de atención FP8 TensorCore con `scale="recalculate"` y RoPE ya aplicados. Añade `triton_cache_cu130_blackwell.tar.zst` con 49 kernels PTX/cubin precompilados para `sm_120`, y dos wheels de atención: `sageattn3-1.0.0` (FP4 Blackwell) y `sageattention-2.2.0` (dispatcher SageAttn3 FP4 / ComfyKitchen INT8 / SDPA).

El resto del paquete son 84 nodos personalizados saneados (ReActor con descarga síncrona desactivada, nodos 3D/LLM problemáticos excluidos), un índice SHA256 `.metadata.json` de 87 LoRAs que evita 27 GB de hashing en el arranque de `comfyui-lora-manager`, y LoRAs Turbo de paso reducido: `minimax_h3_ref2v_turbo_4step_v0.1` (rank 21, bf16) y `minimax_h3_pdmd_2step_lora` (rank 38, bf16), más Qwen-Edit Lightning y LoRAs de personaje/estilo. Se incluye un notebook de Colab (`MiniMax_H3_Turbo_Colab_Flash.ipynb`) y un bootstrapper headless (`bootstrap_remote.py`) con túnel QUIC de Cloudflare y fallback a `trycloudflare.com`.

## Capacidades

- Inferencia multimodal de video y audio con MiniMax-H3 Turbo (generación de clips H.264 640x640 con audio sincronizado).
- Edición de imagen con Qwen-Image-Edit 2511, apoyada en el codificador de texto Qwen 2.5 VL 7B en FP8.
- Aceleración por LoRA de paso reducido: 4 pasos (rank 21) y 2 pasos (PDMD) para video+audio.
- Atención optimizada para Blackwell: SageAttention 3 en FP4, ComfyKitchen INT8 y fallback SDPA mediante dispatcher.
- Cacheo de kernels Triton para `sm_120` que elimina la compilación JIT en el primer arranque.
- Arranque headless automatizable vía `colab` CLI (`bootstrap_remote.py`).
- Túnel remoto sin secretos embebidos, con token leído desde Colab Secrets o variable de entorno.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo de texto.

## Casos de uso

- Prototipado rápido de video generativo con audio en Colab: el notebook arranca ComfyUI en 14,7 s y genera un clip cálido de 56 frames en 2,43-3,63 s, lo que permite iterar sobre prompts y LoRAs en sesiones de minutos.
- Edición de imagen por lotes con Qwen-Image-Edit: el VAE y el codificador de texto ya están espejados (9,19 GiB) y descargables por `aria2c` multi-conexión, útil para pipelines de retoque automatizado.
- Evaluación comparativa de LoRAs de destilación: el manifiesto de 87 LoRAs con SHA256 precalculado permite cambiar entre variantes Turbo sin penalización de arranque.
- Automatización de demos en CI: `bootstrap_remote.py` permite levantar un ComfyUI headless en una instancia Colab desde un job, con túnel Cloudflare para exponer la UI.
- Investigación en kernels CUDA 13 para Blackwell: los 49 cubins `sm_120` y los wheels de SageAttention sirven como base reproducible para medir atención FP4/INT8 frente a SDPA.
- Generación de assets de personaje con LoRAs de estilo: combinación de LoRA de personaje con LoRA Lightning/Turbo para reducir pasos manteniendo identidad.
- Benchmarking de throughput en GPUs consumer vs. profesionales: el repositorio documenta cifras en RTX PRO 6000 Blackwell 95 GiB, y el mismo entorno puede desplegarse en otras GPUs compatibles con CUDA 13.

## Benchmarks y rendimiento

Métricas del runtime publicadas por el autor (Colab G4, RTX PRO 6000 Blackwell 95 GiB, CUDA 13.0):

| Métrica | Configuración heredada | Ultra-Flash | Mejora |
|---|---|---|---|
| Descarga entorno + nodos | 5,46 GiB + 587 MiB | 1,46 GiB + 62,7 MiB | 4,0x menor |
| Arranque ComfyUI (84 nodos) | 52,3 s (con errores de importación) | 14,7 s (0 errores) | 3,55x más rápido |
| Primera generación en frío (37,6 GiB a VRAM) | 140,9 s (`fast_disk=False`) | 14,0 s (`--fast-disk` + cachés) | 10,0x más rápido |
| 56 frames cálido (video+audio 640x640 H.264) | ~9,5 s | 3,63 s (4 pasos, rank 21) / 2,43 s (2 pasos PDMD) | hasta 3,9x |
| 124 frames cálido (video+audio 640x640 H.264) | ~24,0 s | 11,75 s (INT8) / 9,73 s (W4A8 14 GB) / 6,06 s (2 pasos) | hasta 4,0x |

No se han publicado resultados de benchmarks de calidad de modelo (MMLU, HumanEval, GSM8K, FID, CLIP score) en la información disponible.

## Requisitos de hardware

- VRAM: el autor reporta cargar 37,6 GiB de pesos en VRAM para la primera generación fría; la variante W4A8 ocupa ~14 GB, lo que la hace viable en GPUs de 16-24 GB.
- GPU objetivo principal: RTX PRO 6000 Blackwell de 95 GiB (Colab G4) con CUDA 13.0 y arquitectura `sm_120`.
- Los kernels Triton están compilados específicamente para `sm_120`; en GPUs anteriores (Ampere, Ada) habrá que recompilar o usar el fallback SDPA.
- Cabe en GPU consumer solo con cuantización agresiva (W4A8 ~14 GB o INT8), no con FP8/bf16 completos.
- Despliegue: ComfyUI 0.39.0 como runtime; notebook de Colab y `bootstrap_remote.py` para automatización; túnel Cloudflare QUIC para acceso remoto.
- Latencia documentada: 2,43 s (2 pasos) y 3,63 s (4 pasos) para 56 frames; 6,06-11,75 s para 124 frames según cuantización.
- Almacenamiento: 47,2 GB de repositorio más 9,19 GiB de codificador de texto y VAE; el notebook usa `/dev/shm` como RAM-disk y `--fast-disk`.

## Comparativa con modelos similares

| Repositorio | Contenido | Tamaño | Licencia | Enfoque |
|---|---|---|---|---|
| `ramusgill/comfyui-colab-flash` | Entorno ComfyUI + kernels CUDA 13 + LoRAs + notebook | 47,2 GB | Apache-2.0 | Despliegue optimizado en Colab Blackwell |
| Repositorios oficiales MiniMax-H3 | Pesos del modelo de video+audio | No disponible | No disponible | Modelo base |
| Repositorios oficiales Qwen-Image-Edit | Pesos de edición de imagen | No disponible | No disponible | Modelo base |
| Distribuciones ComfyUI estándar | Entorno sin kernels precompilados | ~5,46 GiB + 587 MiB | GPL-3.0 (ComfyUI) | Runtime genérico |

No se dispone de datos de benchmarks comparativos con otras distribuciones de ComfyUI en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado: no aporta pesos propios ni mejoras de calidad; solo acelera el arranque y la inferencia de modelos de terceros.
- Los kernels Triton están atados a `sm_120` (Blackwell) y CUDA 13.0; en otras arquitecturas el rendimiento puede degradarse o requerir recompilación.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.
- Las métricas de rendimiento las publica el propio autor; no hay verificación externa ni reproducibilidad documentada fuera de Colab G4.
- Los LoRAs son "personales y SOTA" según el autor; su procedencia, calidad y licencia individual no se detallan, lo que puede comprometer el uso comercial aunque el repositorio declare Apache-2.0.
- 47,2 GB de repositorio implican costes de almacenamiento y ancho de banda considerables; el notebook depende de descargas de 9,19 GiB adicionales.
- El túnel Cloudflare expone una UI de ComfyUI sin autenticación por defecto si se omite `CLOUDFLARE_TOKEN`; riesgo de acceso no autorizado.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas de los modelos subyacentes.
- La fecha de creación (2026-10-13) y actualización (2026-11-10) son posteriores a la fecha de esta ficha; verificar la vigencia de los artefactos antes de usarlos en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ramusgill/comfyui-colab-flash
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- SageAttention: https://github.com/thu-ml/SageAttention
- MiniMax: https://www.minimaxi.com/
- Qwen-Image-Edit: https://github.com/QwenLM/Qwen-Image
- Cloudflare Tunnel: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/
- Google Colab: https://colab.research.google.com/
