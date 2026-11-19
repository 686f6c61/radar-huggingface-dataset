# ramusgill/comfyui-colab-flash

## Resumen

`ramusgill/comfyui-colab-flash` no es un modelo de lenguaje en sentido estricto, sino un repositorio de artefactos de despliegue (archivos comprimidos de entorno, kernels CUDA precompilados, nodos personalizados, LoRAs y un cuaderno de Colab) diseñado para ejecutar dos modelos multimodales concretos, MiniMax-H3 Turbo (vídeo y audio) y Qwen-Image-Edit 2511 (edición de imagen), sobre GPUs de Google Colab con arquitectura Blackwell y CUDA 13.0. Lo publica el usuario `ramusgill` bajo licencia Apache 2.0 y acumula 57.871 descargas, aunque no registra ningún "like".

El problema que resuelve es de ingeniería de entorno más que de modelado: reducir el tiempo de arranque de ComfyUI, evitar la descarga redundante de dependencias CUDA y Torch, y acelerar la primera generación en frío mediante cachés de Triton precompiladas para `sm_120`, un índice SHA256 precalculado de 87 LoRAs y un disco rápido (`--fast-disk`). El repositorio ocupa 38,5 GB y su núcleo de entorno pesa 1,46 GiB frente a los 5,46 GiB del montaje convencional.

Es relevante ahora porque la inferencia multimodal de vídeo con audio en GPUs de consumo y en entornos efímeros como Colab exige recortar cada segundo de arranque y cada gigabyte de descarga; este paquete documenta reducciones medidas de hasta 10x en la primera generación en frío y de 3,55x en el arranque de ComfyUI con 84 nodos personalizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (contenedor de despliegue; los modelos subyacentes son MiniMax-H3 Turbo y Qwen-Image-Edit 2511) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 TensorCore con escala dinámica (`scale="recalculate"`), INT8, W4A8 (14 GB), BF16 en LoRAs |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (`qwen_2.5_vl_7b_fp8_scaled.safetensors`, `qwen_image_vae.safetensors`), LoRAs en BF16, archivos `.tar.zst`, wheels `.whl` |

## Arquitectura y entrenamiento

El repositorio no entrena modelos: empaqueta un entorno de ejecución para ComfyUI 0.39.0 sobre Python 3.13 y CUDA 13.0, con `--system-site-packages` para evitar duplicar `nvidia/*` y `torch`, `onnxruntime-gpu 1.31.1` compilado para CUDA 13 y parches de RoPE y de escala FP8 dinámica ya aplicados. Incluye 49 kernels Triton PTX/cubin precompilados para Blackwell (`sm_120`), lo que elimina la compilación en caliente durante el primer arranque.

Sobre los modelos que sirve, la información disponible solo indica que MiniMax-H3 Turbo genera vídeo y audio de forma conjunta (resoluciones de 640x640 en H.264, 56 y 124 fotogramas) y que Qwen-Image-Edit 2511 se emplea para edición de imagen, apoyándose en el codificador de texto `qwen_2.5_vl_7b_fp8_scaled` y en `qwen_image_vae`. No se detallan el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en ninguno de los dos modelos.

La innovación técnica destacable es la aceleración por destilación y LoRAs de pocos pasos: `minimax_h3_ref2v_turbo_4step_v0.1` (rango 21, BF16) y `minimax_h3_pdmd_2step_lora` (rango 38, BF16), que permiten generar vídeo con audio en 4 o 2 pasos, además de SageAttention 3 en FP4 para Blackwell y un despachador SDPA/INT8.

## Capacidades

- Generación de vídeo con audio sincronizado mediante MiniMax-H3 Turbo en 2 y 4 pasos.
- Edición de imágenes guiada por instrucciones con Qwen-Image-Edit 2511.
- Ejecución de flujos ComfyUI con 84 nodos personalizados curados y saneados.
- Carga de 87 LoRAs de estilo, personaje y turbo con índice SHA256 precalculado.
- Atención acelerada con SageAttention 3 (FP4) y SageAttention 2.2.0 con despacho INT8/SDPA.
- Inferencia en cuantización FP8, INT8 y W4A8 sobre GPUs Blackwell.
- Arranque remoto sin interfaz mediante `bootstrap_remote.py` y túneles QUIC de Cloudflare.
- No se documentan tool calling, function calling, razonamiento multi-paso ni capacidades multilingües propias.

## Casos de uso

- Prototipado de vídeo generativo en Colab: el cuaderno `MiniMax_H3_Turbo_Colab_Flash.ipynb` permite arrancar un flujo de vídeo con audio en 14,7 s de boot y 14,0 s de primera generación en frío sobre una RTX PRO 6000 Blackwell de 95 GiB, lo que hace viable iterar en sesiones efímeras.
- Edición de imagen por instrucciones en producción ligera: Qwen-Image-Edit 2511 con el VAE y el codificador Qwen 2.5 VL 7B en FP8 permite montar un servicio de retoque automatizado sobre ComfyUI sin gestionar manualmente dependencias CUDA.
- Investigación en destilación de modelos de difusión: los LoRAs turbo de 4 pasos y PDMD de 2 pasos sirven como referencia reproducible para comparar calidad frente a latencia en un mismo hardware.
- Benchmarking de kernels en Blackwell: los 49 kernels Triton precompilados y SageAttention 3 FP4 permiten medir el impacto de la atención cuantizada sin ruido de compilación JIT.
- Automatización headless de pipelines: `bootstrap_remote.py` habilita lanzar sesiones de Colab por CLI con túnel QUIC, útil para trabajos por lotes de generación de vídeo o edición de imágenes.
- Reproducibilidad de entornos: el índice SHA256 de LoRAs y el entorno empaquetado permiten reconstruir exactamente el mismo stack en distintas máquinas, algo crítico al compartir resultados de generación.
- Formación y demos: al reducir la descarga de 5,46 GiB a 1,46 GiB, el coste de arranque en talleres o demos con GPUs de Colab cae de forma notable.

## Benchmarks y rendimiento

Datos verificados por el autor sobre Colab G4 con RTX PRO 6000 Blackwell de 95 GiB y CUDA 13.0:

| Metrica | Configuracion legacy | Ultra-Flash | Mejora |
|---|---|---|---|
| Descarga de entorno y nodos | 5,46 GiB + 587 MiB | 1,46 GiB + 62,7 MiB | 4,0x menor |
| Arranque de ComfyUI (84 nodos) | 52,3 s (con errores de importación) | 14,7 s (0 errores) | 3,55x más rápido |
| Primera generación en frío (37,6 GiB a VRAM) | 140,9 s | 14,0 s | 10,0x más rápido |
| 56 fotogramas, vídeo+audio 640x640 H.264 | ~9,5 s | 3,63 s (4 pasos, rango 21) / 2,43 s (2 pasos PDMD) | Hasta 3,9x |
| 124 fotogramas, vídeo+audio 640x640 H.264 | ~24,0 s | 11,75 s (INT8) / 9,73 s (W4A8 14 GB) / 6,06 s (2 pasos) | Hasta 4,0x |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni métricas de vídeo como FVD) en la información disponible.

## Requisitos de hardware

- VRAM: el autor reporta una carga en frío de 37,6 GiB a VRAM para el flujo completo; la variante W4A8 se describe con 14 GB de pesos, lo que reduce el requisito pero no se detalla la VRAM total necesaria.
- GPU verificada: RTX PRO 6000 Blackwell de 95 GiB (Colab G4). Los kernels Triton están compilados para `sm_120`, por lo que el stack está orientado a Blackwell.
- GPUs consumer: no se confirma compatibilidad con RTX 4090 u otras arquitecturas distintas de Blackwell; los kernels precompilados para `sm_120` no aplicarían a Ada Lovelace (`sm_89`).
- Despliegue: ComfyUI 0.39.0 sobre Python 3.13 y CUDA 13.0, con `onnxruntime-gpu 1.31.1`; incluye notebook de Colab y `bootstrap_remote.py` para ejecución headless. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este stack de difusión.
- Latencia y throughput: 2,43 s por clip de 56 fotogramas en 2 pasos y 6,06 s por clip de 124 fotogramas en 2 pasos sobre la GPU verificada; el arranque en caliente de ComfyUI es de 14,7 s.

## Comparativa con modelos similares

| Aspecto | comfyui-colab-flash | Entorno ComfyUI estándar | Contenedores CUDA genéricos |
|---|---|---|---|
| Tipo | Paquete de despliegue con kernels y LoRAs | Instalación manual de ComfyUI | Imagen base CUDA |
| Tamano de descarga | 1,46 GiB + 62,7 MiB | 5,46 GiB + 587 MiB | Variable, sin nodos ni LoRAs |
| Arranque | 14,7 s con 84 nodos | 52,3 s con errores de importación | No disponible |
| Kernels precompilados | 49 kernels Triton `sm_120`, SageAttention 3 FP4 | Compilación JIT en el primer uso | No disponible |
| Modelos incluidos | MiniMax-H3 Turbo y Qwen-Image-Edit 2511 | No | No |
| Licencia | Apache 2.0 | Apache 2.0 (ComfyUI) | Variable |

No se dispone de datos para comparar con alternativas equivalentes de empaquetado específico para MiniMax-H3 o Qwen-Image-Edit.

## Limitaciones y advertencias

- No es un modelo entrenado: no debe evaluarse como LLM ni usarse para tareas de texto, razonamiento o código.
- Dependencia fuerte de hardware Blackwell (`sm_120`) y CUDA 13.0; en GPUs anteriores los kernels precompilados no son válidos y el rendimiento caerá o fallará.
- El requisito de VRAM reportado (37,6 GiB en frío) excluye GPUs de consumo con 24 GB o menos salvo que se use la variante W4A8, cuyo consumo total no se detalla.
- El repositorio no registra "likes" y el pipeline no está declarado en Hugging Face, lo que limita las señales de validación comunitaria.
- Riesgo de reproducibilidad: los artefactos dependen de versiones concretas (ComfyUI 0.39.0, Python 3.13, onnxruntime-gpu 1.31.1) y de un índice de LoRAs que puede quedar desincronizado si se modifican los archivos.
- La licencia Apache 2.0 cubre el empaquetado, pero no se especifica la licencia de los modelos subyacentes (MiniMax-H3 Turbo, Qwen-Image-Edit 2511) ni de los 87 LoRAs, por lo que el uso comercial requiere verificar cada componente por separado.
- El túnel por defecto es efímero (`trycloudflare.com`) si no se configura `CLOUDFLARE_TOKEN`; no es adecuado para servicios persistentes.
- No hay información sobre sesgos, alucinación o calidad de generación de los modelos servidos; estas evaluaciones deben hacerse sobre MiniMax-H3 y Qwen-Image-Edit directamente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ramusgill/comfyui-colab-flash
- Cuaderno de Colab incluido en el repo: `MiniMax_H3_Turbo_Colab_Flash.ipynb`
- Script de arranque remoto incluido en el repo: `bootstrap_remote.py`
- ComfyUI (proyecto base): https://github.com/comfyanonymous/ComfyUI
- SageAttention: https://github.com/thu-ml/SageAttention
- No se han encontrado en la información proporcionada enlaces a papers, blogs ni demos adicionales.
