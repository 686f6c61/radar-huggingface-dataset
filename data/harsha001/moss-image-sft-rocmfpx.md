# Harsha001/MOSS-Image-SFT-ROCmFPX

## Resumen

MOSS-Image-SFT-ROCmFPX es una cuantización en formato GGUF del transformer de difusión de OpenMOSS-Team/MOSS-Image-SFT, un modelo de generación de imágenes texto-a-imagen de aproximadamente 5.082 millones de parámetros (5B). La publica el usuario Harsha001 como derivado no oficial del modelo base, con licencia Apache-2.0, y su propósito es ejecutar el modelo en GPUs AMD mediante los kernels ROCmFPX integrados en una bifurcación de ggml y de stable-diffusion.cpp.

La relevancia de esta ficha es acotada: no se trata de un modelo nuevo ni de un ajuste fino, sino de un artefacto de cuantización de 8 bits (`Q8_0_ROCMFPX`, 5,56 GB) que requiere una compilación parcheada de stable-diffusion.cpp. El propio autor advierte que el archivo aún no se ha probado en hardware AMD y que, en sus mediciones, un `Q8_0` estándar de ggml queda más cerca del BF16 de referencia y ocupa solo 0,15 GB más.

Arquitectónicamente, el modelo base es un transformer de difusión de 5B que se acompaña de un codificador de texto Qwen3.5 9B en BF16 y del VAE de FLUX.2, ambos tomados del repositorio original. Esta ficha cubre exclusivamente el artefacto cuantizado y su proceso de ejecución; los detalles de entrenamiento del modelo base no se documentan en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (modelo base MOSS-Image-SFT); cuantizacion GGUF para stable-diffusion.cpp |
| Parametros totales | 5.082.308.624 (5B, dato de safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; el codificador de texto es Qwen3.5 9B) |
| Tipos de cuantizacion | `Q8_0_ROCMFPX` (8 bits, formato ROCmFPX); el autor menciona ademas `Q6_0_ROCMFPX`, `Q4_0_ROCMFP4`, `Q4_0_ROCMFP4_FAST` y `Q4_0_ROCMI4` como variantes no publicadas |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`MOSS-Image-SFT-Q8_0_ROCMFPX.gguf`, 5,56 GB); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer de difusión de 5B parámetros para generación de imágenes a partir de texto. En esta publicación solo se cuantiza el transformer de difusión: el codificador de texto (Qwen3.5 9B en BF16) y el VAE (FLUX.2) se cargan por separado desde el repositorio original de OpenMOSS. De las 252 proyecciones principales se cuantizan únicamente atención (q/k/v/o) y las capas `ffn_up_gate` y `ffn_down` de cada bloque; los embedders, las normalizaciones, la modulación, el condicionamiento temporal y la capa de salida permanecen en BF16, siguiendo el criterio de los GGUF de referencia de MOSS.

El proceso de cuantización parte de stable-diffusion.cpp en el commit `b13a482` compilado sobre la bifurcación ROCmFPX de ggml (`fb08d7c`) con el parche `sdcpp-rocmfpx.patch`. Se genera una importance matrix a partir del transformer BF16 sobre 16 prompts de calibración y se aplica una regla de tipos por tensor (`q8_0_rocmfpx`) con `sd-cli -M convert`. La calidad se midió en una GPU NVIDIA expandiendo cada peso del transformer a precisión completa y renderizando con sd.cpp, de modo que las métricas evalúan los pesos almacenados y no los kernels ROCmFPX, que según el autor son incorrectos en NVIDIA. No se documentan en la información disponible datos de entrenamiento, número de tokens, composición del dataset ni uso de RLHF/DPO del modelo base.

## Capacidades

- Generación de imágenes texto-a-imagen a 1024×1024 con el pipeline de difusión (Euler, 30 pasos, CFG 3.0, flow shift 5 en los ejemplos del autor).
- Renderizado de texto dentro de la imagen: dos de los ocho prompts de la prueba de calidad incluyen texto escrito.
- Estilos diversos: el conjunto de evaluación cubre fotografía e ilustración.
- Integración con stable-diffusion.cpp mediante `sd-cli` y los ficheros auxiliares (codificador Qwen3.5 9B, VAE FLUX.2, `tokenizer.json` externo obligatorio).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, audio ni visión de entrada.
- Capacidades multilingües: no disponibles en la información proporcionada (dependen del codificador de texto Qwen3.5 9B, no documentado aquí).

## Casos de uso

- Evaluación de kernels ROCmFPX en AMD: el artefacto sirve para probar los kernels de cuantización de 8 bits de la bifurcación ROCmFPX en GPUs AMD dentro de stable-diffusion.cpp, comparando la salida con el BF16 de referencia.
- Generación de imágenes en estaciones de trabajo AMD: con una compilación parcheada de sd.cpp, el modelo permite generar imágenes de 1024×1024 en local sin depender de GPUs NVIDIA, aunque el autor no ha validado el archivo en hardware AMD.
- Prototipado de pipelines texto-a-imagen con stable-diffusion.cpp: al ser un GGUF de 5,56 GB, encaja en flujos de trabajo basados en `sd-cli` con ficheros auxiliares separados (text encoder, VAE, tokenizer).
- Experimentación con cuantización de transformers de difusión: el repositorio incluye la tabla comparativa de PSNR/SSIM/LPIPS entre BF16, `Q8_0`, `Q6_0` y variantes `Q4_0`, útil para estudiar la degradación por cuantización en modelos pequeños de difusión.
- Reproducción de resultados: el prompt de ejemplo (`a lovely cat holding a sign that says 'ROCmFPX'`) y los parámetros fijos (semilla, 30 pasos, CFG 3.0) permiten reproducir la comparación BF16 frente a cuantizado.
- Uso educativo sobre formatos GGUF personalizados: el parche `sdcpp-rocmfpx.patch` y la regla de tipos por tensor sirven como referencia para crear y ejecutar tipos de cuantización no estándar en ggml.

## Benchmarks y rendimiento

Calidad medida por el autor sobre 8 prompts, 1024×1024, Euler, 30 pasos, CFG 3.0, flow shift 5, una semilla fija por prompt, comparando cada imagen con la BF16 de la misma semilla. PSNR y SSIM: más alto es mejor; LPIPS: más bajo es mejor.

| Pesos | Tamano | PSNR | SSIM | LPIPS |
|---|---:|---:|---:|---:|
| BF16 cargado directamente (referencia) | 10,2 GB | 33,4 | 0,974 | 0,022 |
| **`Q8_0_ROCMFPX` (este repo)** | 5,56 GB | 26,6 | 0,916 | 0,074 |
| `Q8_0` estándar (mismos tensores) | 5,71 GB | 28,9 | 0,949 | 0,043 |
| `Q6_0_ROCMFPX` (no publicado) | 4,52 GB | 22,1 | 0,850 | 0,126 |
| `Q4_0_ROCMFP4` (no publicado) | 3,33 GB | 16,5 | 0,665 | 0,294 |
| `Q4_0_ROCMFP4_FAST` (no publicado) | 3,18 GB | 15,5 | 0,655 | 0,323 |
| `Q4_0_ROCMI4` (no publicado) | 3,18 GB | 16,1 | 0,639 | 0,326 |

El autor concluye que las variantes de 6 y 4 bits alteran demasiado las imágenes (sobre todo composición y texto) para publicarlas en un modelo de este tamaño. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo texto-a-imagen.

## Requisitos de hardware

- VRAM estimada: el transformer cuantizado ocupa 5,56 GB; hay que sumar el codificador de texto Qwen3.5 9B en BF16 y el VAE FLUX.2, por lo que el consumo total supera ampliamente los 5,56 GB (no se detalla una cifra total en la información disponible).
- GPU recomendadas: el formato está pensado para GPUs AMD con ROCm y los kernels ROCmFPX; el autor no indica modelos concretos.
- Compatibilidad con GPU de consumo: no disponible; no se especifican requisitos mínimos ni modelos de consumo validados.
- El archivo no se ha probado en hardware AMD según el propio autor; las mediciones de calidad se hicieron en una GPU NVIDIA expandiendo los pesos a precisión completa.
- Opciones de despliegue: exclusivamente stable-diffusion.cpp compilado contra la bifurcación ROCmFPX de ggml (`fb08d7c`) con el parche `sdcpp-rocmfpx.patch`. Stock sd.cpp, ComfyUI-GGUF y otros runners no reconocen este tipo. Para uso sin ROCmFPX, el autor recomienda un `Q8_0` estándar, por ejemplo desde `leejet/MOSS-Image-SFT-GGUF`.
- Latencia y throughput: no disponibles.
- Otros requisitos: el tokenizer externo (`tokenizer.json`) es obligatorio y los tamaños de imagen deben ser divisibles por 16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| MOSS-Image-SFT-ROCmFPX (este) | 5B | no disponible | GGUF `Q8_0_ROCMFPX` (5,56 GB) | Apache-2.0 | Requiere sd.cpp parcheado con ROCmFPX; no probado en AMD |
| OpenMOSS-Team/MOSS-Image-SFT (base) | 5B | no disponible | safetensors (BF16, 10,2 GB) | Apache-2.0 | Referencia de calidad; requiere el stack original |
| leejet/MOSS-Image-SFT-GGUF | 5B | no disponible | GGUF `Q8_0` estándar (5,71 GB) | Apache-2.0 | Compatible con stock sd.cpp; en las pruebas del autor queda más cerca del BF16 (PSNR 28,9 frente a 26,6) |

No se dispone de datos de benchmarks estándar ni de otras alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- No es una versión oficial de OpenMOSS; el crédito del modelo corresponde al equipo OpenMOSS.
- El archivo no se ha probado en hardware AMD; los kernels ROCmFPX de la bifurcación son incorrectos en NVIDIA según el autor, y los resultados en AMD pueden diferir ligeramente por el orden de las operaciones.
- Pérdida de calidad medible frente al BF16: PSNR 26,6 frente a 33,4, SSIM 0,916 frente a 0,974 y LPIPS 0,074 frente a 0,022; un `Q8_0` estándar obtiene mejores métricas (28,9 / 0,949 / 0,043) con solo 0,15 GB más.
- La difusión amplifica pequeños cambios de pesos: el modelo cuantizado puede producir composiciones distintas o cambiar el texto de un cartel sin pérdida aparente de calidad, lo que complica la reproducibilidad exacta.
- Dependencia de una compilación parcheada: stock sd.cpp, ComfyUI-GGUF y otros runners no reconocen el tipo `q8_0_rocmfpx`.
- Requiere ficheros auxiliares externos (Qwen3.5 9B, VAE FLUX.2, `tokenizer.json`), lo que aumenta la complejidad del despliegue.
- Sesgos, riesgo de alucinación visual y limitaciones idiomáticas: no documentados en la información disponible.
- Licencia Apache-2.0, que permite uso comercial; conviene verificar igualmente las licencias del codificador de texto y del VAE empleados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Harsha001/MOSS-Image-SFT-ROCmFPX
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- GGUF estándar alternativo: https://huggingface.co/leejet/MOSS-Image-SFT-GGUF
- ROCmFPX: https://github.com/charlie12345/ROCmFPX
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- Guía de MOSS-Image en sd.cpp: https://github.com/leejet/stable-diffusion.cpp/blob/master/docs/moss_image.md
- Modelo destacado del autor (DeepSeek-V4.1-Flash en Strix Halo): https://huggingface.co/Harsha001/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF
