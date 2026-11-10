# dragonaowu/MOSS-Image-SFT-ROCmFPX

## Resumen

MOSS-Image-SFT-ROCmFPX es una cuantización en formato GGUF del transformer de difusión de 5B parámetros de OpenMOSS-Team/MOSS-Image-SFT, publicada por el usuario dragonaowu. El modelo base es un text-to-image de la familia MOSS-Image desarrollado por el equipo OpenMOSS, y esta versión concreta aplica el formato propietario ROCmFPX (8 bits, Q8_0_ROCMFPX) diseñado específicamente para GPUs AMD con ROCm. No se trata de un modelo nuevo ni de un fine-tune, sino de una conversión de pesos orientada a ejecutar los kernels ROCmFPX en hardware AMD.

La relevancia de esta publicación es acotada: sirve como banco de pruebas para el formato ROCmFPX y su integración con stable-diffusion.cpp mediante un parche específico (sdcpp-rocmfpx.patch). El propio autor advierte que un Q8_0 estándar de ggml obtiene mejores métricas de fidelidad (PSNR 28,9 frente a 26,6) con solo 0,15 GB más de tamaño, por lo que esta variante no es la opción recomendada para producción general, sino un experimento para validar los kernels ROCmFPX en AMD.

El repositorio contiene únicamente el transformer de difusión (5,56 GB); el text encoder (Qwen3.5 9B), el VAE (FLUX.2) y el tokenizer deben obtenerse del repositorio original de MOSS. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) para text-to-image |
| Parametros totales | 5.082.308.624 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0_ROCMFPX (8 bits, formato ROCmFPX); el autor menciona variantes Q6_0_ROCMFPX, Q4_0_ROCMFP4, Q4_0_ROCMFP4_FAST y Q4_0_ROCMI4 no publicadas |
| Idiomas soportados | no disponible (el pipeline es text-to-image; el text encoder asociado es Qwen3.5 9B) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (5,56 GB, solo el transformer de difusión) |

## Arquitectura y entrenamiento

El modelo es un diffusion transformer (DiT) de 5B parámetros que genera imágenes a partir de texto. La cuantización publicada conserva en BF16 los embedders, las normas, la modulación, el time conditioning y la capa de salida, y cuantiza únicamente las 252 proyecciones principales (attention q/k/v/o y ffn_up_gate/ffn_down en cada bloque). Esta selectividad busca preservar la calidad en las partes más sensibles del modelo.

El proceso de cuantización se realizó con stable-diffusion.cpp (commit b13a482) compilado sobre el fork ROCmFPX de ggml (commit fb08d7c) con el parche sdcpp-rocmfpx.patch. Se generó una importance matrix a partir del transformer BF16 sobre 16 prompts de calibración distintos de los de test, y se aplicó la regla de conversión de tensores a q8_0_rocmfpx. La evaluación de calidad se hizo en una GPU NVIDIA expandiendo cada peso a precisión completa, de modo que las métricas miden los pesos almacenados y no los kernels ROCmFPX (que según el autor son incorrectos en NVIDIA). No se dispone de información sobre el entrenamiento original del modelo base.

## Capacidades

- Generación de imágenes text-to-image a partir de prompts en lenguaje natural, con resolución de hasta 1024×1024 (tamaños divisibles por 16).
- Generación de texto dentro de la imagen (el autor incluye dos prompts de test con texto escrito).
- Estilos variados: fotografías e ilustración, según los prompts de evaluación empleados.
- Control fino de generación mediante CFG scale, número de pasos, flow shift y sampler (Euler en los tests).
- Reproducibilidad con semilla fija (el autor usa una semilla fija por prompt en sus comparativas).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de difusión, no un LLM.
- Capacidades multilingües: no disponibles; dependen del text encoder Qwen3.5 9B externo.

## Casos de uso

- Evaluación de kernels ROCmFPX en GPUs AMD: el propósito declarado del repositorio es probar los kernels ROCmFPX de ggml en hardware AMD mediante stable-diffusion.cpp con el parche incluido. Adecuado para desarrolladores que trabajen en el fork ROCmFPX.
- Pruebas de cuantización de DiT de 5B: sirve como referencia para medir el impacto de la cuantización de 8 bits selectiva (solo proyecciones principales) frente a BF16 en un modelo de difusión pequeño.
- Generación de imágenes en entornos con restricciones de memoria: con 5,56 GB para el transformer, encaja en GPUs con 8-12 GB de VRAM junto con el text encoder y el VAE cuantizados, aunque el autor advierte que un Q8_0 estándar es preferible.
- Reproducción de experimentos de fidelidad visual: los datos de PSNR/SSIM/LPIPS permiten replicar la comparativa BF16 frente a cuantizado con prompts y semillas fijas.
- Prototipado de pipelines text-to-image con stable-diffusion.cpp: útil para validar la integración del modelo MOSS-Image en sd.cpp antes de pasar a pesos estándar.
- Docencia e investigación sobre cuantización de modelos generativos: el repositorio documenta el procedimiento completo (importance matrix, reglas de tensores, medición de métricas) de forma reproducible.

## Benchmarks y rendimiento

Datos de fidelidad frente a BF16 publicados por el autor (8 prompts, 1024×1024, Euler, 30 pasos, CFG 3.0, flow shift 5, semilla fija por prompt; PSNR y SSIM más alto es mejor, LPIPS más bajo es mejor):

| Pesos | Tamano | PSNR | SSIM | LPIPS |
|---|---:|---:|---:|---:|
| BF16 (referencia) | 10,2 GB | 33,4 | 0,974 | 0,022 |
| Q8_0_ROCMFPX (este repo) | 5,56 GB | 26,6 | 0,916 | 0,074 |
| Q8_0 estándar (ggml) | 5,71 GB | 28,9 | 0,949 | 0,043 |
| Q6_0_ROCMFPX | 4,52 GB | 22,1 | 0,850 | 0,126 |
| Q4_0_ROCMFP4 | 3,33 GB | 16,5 | 0,665 | 0,294 |
| Q4_0_ROCMFP4_FAST | 3,18 GB | 15,5 | 0,655 | 0,323 |
| Q4_0_ROCMI4 | 3,18 GB | 16,1 | 0,639 | 0,326 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo de difusión.

## Requisitos de hardware

- VRAM estimada: el transformer ocupa 5,56 GB en disco; en inferencia hay que sumar el text encoder (Qwen3.5 9B, disponible en GGUF Q8_0) y el VAE FLUX.2. Con quantizaciones de 8 bits del text encoder, el conjunto puede requerir del orden de 12-16 GB de VRAM, aunque no se han publicado cifras exactas de consumo en ejecución.
- GPU recomendadas: el formato está pensado para GPUs AMD con ROCm (el autor no especifica modelos concretos). Para la variante estándar Q8_0, cualquier GPU con suficiente VRAM.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas de 16 GB o más con el text encoder cuantizado; no confirmado por el autor.
- Opciones de despliegue: exclusivamente stable-diffusion.cpp compilado contra el fork ROCmFPX de ggml con el parche sdcpp-rocmfpx.patch. Stock sd.cpp, ComfyUI-GGUF y otros runners no reconocen el tipo de tensor.
- Latencia y throughput: no disponibles. El autor indica que el archivo no se ha probado todavía en hardware AMD.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tamano | Licencia | Notas |
|---|---|---:|---|---|---|
| MOSS-Image-SFT-ROCmFPX (este) | 5,08B | GGUF Q8_0_ROCMFPX | 5,56 GB | Apache-2.0 | Requiere fork ROCmFPX de sd.cpp; PSNR 26,6 |
| MOSS-Image-SFT Q8_0 estándar (leejet/MOSS-Image-SFT-GGUF) | 5,08B | GGUF Q8_0 | 5,71 GB | Apache-2.0 | Compatible con sd.cpp estándar; PSNR 28,9 |
| MOSS-Image-SFT BF16 (OpenMOSS-Team) | 5,08B | safetensors | 10,2 GB | Apache-2.0 | Referencia de calidad; PSNR 33,4 |
| Otras variantes ROCmFPX (Q6, Q4) | 5,08B | GGUF ROCmFPX/FP4 | 3,18-4,52 GB | Apache-2.0 | No publicadas; pérdida de calidad notable (PSNR 15,5-22,1) |

## Limitaciones y advertencias

- El archivo no ha sido probado en hardware AMD; todas las métricas se midieron en NVIDIA expandiendo los pesos a precisión completa, por lo que el rendimiento real de los kernels ROCmFPX en AMD está sin validar.
- Los kernels ROCmFPX del fork son incorrectos en NVIDIA según el autor; no deben usarse en esa plataforma.
- Solo funciona con stable-diffusion.cpp compilado contra el fork ROCmFPX de ggml y el parche incluido; no es compatible con stock sd.cpp, ComfyUI-GGUF ni otros runners.
- Fidelidad inferior al Q8_0 estándar (PSNR 26,6 frente a 28,9; LPIPS 0,074 frente a 0,043) con un tamaño ligeramente menor; el autor recomienda el Q8_0 estándar para uso general.
- La difusión amplifica pequeños cambios en los pesos: imágenes con el mismo prompt y semilla pueden diferir en composición o en el texto escrito sin que ello implique pérdida de calidad subjetiva.
- El repositorio contiene solo el transformer; requiere text encoder Qwen3.5 9B, VAE FLUX.2 y tokenizer externos, lo que añade complejidad de despliegue.
- No es una release oficial de OpenMOSS; el crédito del modelo corresponde al equipo OpenMOSS.
- Riesgo de sesgos y alucinaciones visuales inherente al modelo base; no documentado en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero la cadena de dependencias (text encoder Qwen3.5, VAE FLUX.2) puede tener licencias propias que deben verificarse por separado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dragonaowu/MOSS-Image-SFT-ROCmFPX
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- GGUF Q8_0 estándar alternativo: https://huggingface.co/leejet/MOSS-Image-SFT-GGUF
- Fork ROCmFPX de ggml: https://github.com/charlie12345/ROCmFPX
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- Guía MOSS-Image en sd.cpp: https://github.com/leejet/stable-diffusion.cpp/blob/master/docs/moss_image.md
