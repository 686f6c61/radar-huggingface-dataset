# Harsha001/flux-3-image-klein-ROCmFPX

## Resumen

FLUX.3 Image Klein — ROCmFPX GGUF es una cuantización no oficial del modelo de difusión de texto a imagen `black-forest-labs/flux-3-image-klein`, publicada por el usuario Harsha001. El repositorio contiene los pesos del transformer de difusión convertidos a formatos ROCmFPX y ROCmFP4, diseñados para kernels rápidos en GPUs AMD mediante ROCm, y empaquetados en GGUF para su uso con una bifurcación específica de `stable-diffusion.cpp`. No se trata de un modelo nuevo, sino de una redistribución cuantizada del modelo base de Black Forest Labs.

El modelo base es un diffusion transformer de aproximadamente 5.550 millones de parámetros (11,1 GB en BF16), que genera imágenes de 1024×1024 a partir de prompts textuales. Esta versión ofrece seis archivos cuantizados que van desde 5,5 GB (8 bits) hasta 2,5 GB (3 bits), con métricas de calidad medidas frente a la salida BF16 de referencia (PSNR, SSIM y LPIPS). La relevancia actual reside en la posibilidad de ejecutar un modelo de generación de imágenes de esta escala en hardware AMD con requisitos de memoria reducidos, aunque con la contrapartida de depender de un fork no estándar de ggml.

Es importante subrayar que el autor declara explícitamente que estos archivos no se han probado en hardware AMD todavía, que los kernels nativos del fork no se usaron para medir la calidad y que los formatos ROCmFPX obtienen peores métricas que los cuantizados estándar de ggml de tamaño similar. La licencia es la FLUX Kommunity License, de uso no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (modelo base FLUX.3 Image Klein) |
| Parametros totales | 5.548.681.984 (11,1 GB en BF16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de texto a imagen; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | Q8_0_ROCMFPX (8 bits), Q6_0_ROCMFPX (6 bits), Q4_0_ROCMFP4 (4 bits), Q4_0_ROCMFP4_FAST (4 bits), Q4_0_ROCMI4 (4 bits enteros con signo), Q3_0_ROCMFPX (3 bits, preview) |
| Idiomas soportados | no disponible (prompts en lenguaje natural; el codificador de texto es Qwen3-VL-4B-Instruct) |
| Licencia | FLUX Kommunity License (uso no comercial) |
| Formato de pesos | GGUF (variantes ROCmFPX/ROCmFP4/ROCmI4), más VAE en safetensors (`ae.safetensors`) |

## Arquitectura y entrenamiento

El modelo base es un diffusion transformer de FLUX.3 Image Klein, con 5.548.681.984 parámetros en el transformer de difusión (11,1 GB en BF16). El pipeline completo emplea un codificador de texto Qwen3-VL-4B-Instruct y un VAE separado (`ae.safetensors`). La generación se realiza con muestreo Euler, 16 pasos y `cfg-scale` 1.0 según el ejemplo de ejecución del autor. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni sobre si hubo RLHF, DPO u otras etapas de alineación; esos datos corresponden al modelo original de Black Forest Labs y no se detallan en esta ficha.

El proceso de cuantización sí está documentado: se construyó `stable-diffusion.cpp` (commit `b13a482`) sobre el fork ROCmFPX de ggml (commit `fb08d7c`) aplicando un parche de 29 líneas (`sdcpp-rocmfpx.patch`); se generó una importance matrix a partir del modelo BF16 usando 16 prompts de calibración distintos de los de prueba (1024², 16 pasos); y se convirtió con `sd-cli -M convert --type <tipo> --imat-in imatrix.dat`. Las capas que sd.cpp mantiene en precisión completa para FLUX (proyecciones de entrada/salida, time embedding, biases y normas) permanecen en BF16. La calidad se midió en GPU expandiendo cada peso cuantizado a F32 en tiempo de carga, de modo que las métricas reflejan los pesos almacenados y no los kernels nativos del fork.

## Capacidades

- Generación de imágenes a partir de prompts de texto (text-to-image) a resolución 1024×1024.
- Control fino del proceso de muestreo: pasos, método (Euler), escala CFG y semilla.
- Acepta un codificador de texto multimodal Qwen3-VL-4B-Instruct, lo que habilita prompts en lenguaje natural complejos.
- Cuantización con importance matrix para preservar la fidelidad respecto al modelo BF16.
- Ejecución en `stable-diffusion.cpp` con backend ROCm/Vulkan (requiere el fork ROCmFPX de ggml).
- No se documentan capacidades de edición de imagen, inpainting, outpainting, tool calling, agentes ni razonamiento multi-paso; no disponible.
- Capacidades multilingües: no disponibles como dato explícito; dependen del codificador de texto Qwen3-VL-4B-Instruct.

## Casos de uso

- Generación de ilustraciones y arte conceptual en local: el archivo Q4_0_ROCMFP4_FAST (2,9 GB) permite iterar rápidamente sobre prompts en equipos con VRAM limitada, manteniendo composición y prompt según las métricas LPIPS (~0,175).
- Pruebas de concepto en hardware AMD: el repositorio está orientado a GPUs AMD con ROCm, por lo que sirve para validar pipelines de difusión en ese ecosistema antes de invertir en el modelo BF16 completo.
- Prototipado de aplicaciones de texto a imagen: con `stable-diffusion.cpp` y el codificador Qwen3-VL-4B-Instruct, se puede integrar la generación en scripts de línea de comandos o servicios ligeros.
- Evaluación comparativa de formatos de cuantización: los seis archivos con métricas PSNR/SSIM/LPIPS documentadas permiten estudiar el compromiso calidad-tamaño en modelos de difusión.
- Generación de imágenes para documentación técnica o material divulgativo: el archivo Q8_0_ROCMFPX (5,5 GB, SSIM 0,969) ofrece la mayor fidelidad de la familia ROCmFPX para usos donde la calidad visual es prioritaria.
- Investigación sobre kernels ROCmFPX/ROCmFP4: el repositorio incluye el parche y las instrucciones de compilación, útil para desarrolladores que quieran experimentar con estos tipos de cuantización en ggml.
- Despliegue en entornos con memoria restringida: el archivo Q3_0_ROCMFPX (2,5 GB) permite ejecutar el modelo en configuraciones muy limitadas, asumiendo una pérdida de calidad visible (LPIPS 0,280).

## Benchmarks y rendimiento

Las métricas publicadas por el autor comparan cada cuantización con la imagen BF16 del mismo prompt y semilla (8 prompts, 1024×1024, 16 pasos, Euler). Como referencia de escala, los pesos BF16 ejecutados en matemática BF16 en lugar de F32 ya arrojan PSNR 42,3, SSIM 0,994 y LPIPS 0,004.

| Archivo | Tamano | PSNR | SSIM | LPIPS | Notas |
|---|---:|---:|---:|---:|---|
| `flux-3-image-klein-Q8_0_ROCMFPX.gguf` | 5,5 GB | 30,4 | 0,969 | 0,025 | ROCmFPX 8 bits (escalas de bloque UE4M3) |
| `flux-3-image-klein-Q6_K_ROCMFPX.gguf` | 4,4 GB | 26,2 | 0,922 | 0,070 | ROCmFPX 6 bits (tipo Q6_0_ROCMFPX, no Q6_K estándar) |
| `flux-3-image-klein-Q4_0_ROCMFP4.gguf` | 3,1 GB | 19,4 | 0,783 | 0,177 | ROCmFP4 4 bits |
| `flux-3-image-klein-Q4_0_ROCMFP4_FAST.gguf` | 2,9 GB | 20,2 | 0,794 | 0,175 | ROCmFP4 4 bits, una escala por bloque (layout rápido) |
| `flux-3-image-klein-Q4_0_ROCMI4.gguf` | 2,9 GB | 19,6 | 0,777 | 0,188 | Enteros de 4 bits con signo y escala UE4M3 |
| `flux-3-image-klein-Q3_0_ROCMFPX.gguf` | 2,5 GB | 17,6 | 0,693 | 0,280 | ROCmFP3 3 bits (formato preview), pérdida visible |
| Q8_0 (ggml estándar, solo referencia) | 5,6 GB | 34,6 | 0,984 | 0,011 | — |
| Q4_K (ggml estándar, solo referencia) | 3,1 GB | 20,7 | 0,816 | 0,154 | — |
| Q4_0 (ggml estándar, solo referencia) | 3,1 GB | 19,1 | 0,787 | 0,171 | — |

El autor reconoce que Q8_0_ROCMFPX rinde por debajo del Q8_0 estándar de tamaño similar, y que Q4_0_ROCMFP4 rinde por debajo del Q4_K estándar. No se publicaron métricas de velocidad (latencia o throughput) para estos formatos en GPUs AMD.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del archivo; el transformer ocupa entre 2,5 GB (Q3) y 5,5 GB (Q8). Hay que sumar el codificador de texto Qwen3-VL-4B-Instruct (cuantizado en Q8_0) y el VAE `ae.safetensors`.
- GPU recomendadas: el repositorio está orientado a GPUs AMD con ROCm; no se especifican modelos concretos. El autor indica que los archivos no se han probado en hardware AMD todavía.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño reducido de los archivos Q4 (2,9–3,1 GB) sugiere que podría caber en GPUs de consumo con suficiente VRAM, pero no hay validación publicada.
- Opciones de despliegue: `stable-diffusion.cpp` compilado contra el fork ROCmFPX de ggml con `sdcpp-rocmfpx.patch`. Stock sd.cpp, ComfyUI-GGUF y otros runners no reconocen estos tipos.
- Backends de compilación: `-DSD_USE_UPSTREAM_GGML=ON`, `-DSD_GGML_SOURCE_DIR=<ROCmFPX>/ggml`, `-DSD_ROCMFPX=ON`, `-DSD_VULKAN=ON`.
- Latencia y throughput: no disponibles; el autor señala que la velocidad de los formatos ROCmFPX para modelos de imagen en AMD no se ha medido.
- Codificador de texto requerido: `Qwen/Qwen3-VL-4B-Instruct-GGUF` (Q8_0 en el ejemplo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Calidad (referencia) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX.3 Image Klein ROCmFPX (este repo) | 5,55 B (transformer) | 1024×1024, 16 pasos | PSNR 30,4 / SSIM 0,969 (Q8 ROCmFPX) | FLUX Kommunity (no comercial) | GGUF en HF, requiere fork ROCmFPX |
| FLUX.3 Image Klein BF16 (original) | 5,55 B | 1024×1024 | Referencia (BF16 vs F32: PSNR 42,3, SSIM 0,994) | FLUX Kommunity | Pesos originales en HF |
| FLUX.3 Image Klein Q8_0 (ggml estándar) | 5,55 B | 1024×1024 | PSNR 34,6 / SSIM 0,984 | FLUX Kommunity | GGUF estándar, runners convencionales |
| FLUX.3 Image Klein Q4_K (ggml estándar) | 5,55 B | 1024×1024 | PSNR 20,7 / SSIM 0,816 | FLUX Kommunity | GGUF estándar, runners convencionales |

No se dispone de datos para comparar con otros modelos de difusión de la misma categoría (por ejemplo, variantes de Stable Diffusion) en esta información.

## Limitaciones y advertencias

- No es una versión oficial de Black Forest Labs; es una cuantización de terceros.
- Licencia FLUX Kommunity License: uso no comercial. Revisar `LICENSE.md` y `NOTICE.md` antes de cualquier despliegue.
- Los archivos requieren una bifurcación específica de ggml (ROCmFPX) y un parche de 29 líneas; no funcionan con sd.cpp estándar, ComfyUI-GGUF ni otros runners.
- El autor declara que los archivos no se han probado en hardware AMD, pese a estar orientados a ROCm.
- Los kernels nativos del fork no se usaron para medir la calidad (se expandieron los pesos a F32); en GPUs AMD el redondeo podría diferir.
- Calidad inferior a los cuantizados estándar de ggml de tamaño similar: Q8_0_ROCMFPX (PSNR 30,4) frente a Q8_0 estándar (34,6); Q4_0_ROCMFP4 (19,4) frente a Q4_K (20,7).
- El archivo Q3_0_ROCMFPX presenta pérdida de calidad visible (LPIPS 0,280) y el Q2_0 no se publicó por pérdida de fidelidad al prompt (LPIPS 0,72).
- El nombre `Q6_K_ROCMFPX` es engañoso: los pesos son del tipo Q6_0_ROCMFPX, no Q6_K de llama.cpp.
- La difusión amplifica pequeños cambios en los pesos a lo largo de los pasos: las imágenes cuantizadas conservan prompt y composición pero difieren en detalle.
- Riesgo de sesgos y alucinaciones visuales inherente al modelo base; no documentado en esta ficha.
- Idiomas soportados no especificados; dependen del codificador Qwen3-VL-4B-Instruct.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Harsha001/flux-3-image-klein-ROCmFPX
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Fork ROCmFPX de ggml: https://github.com/charlie12345/ROCmFPX
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- Codificador de texto Qwen3-VL-4B-Instruct GGUF: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct-GGUF
