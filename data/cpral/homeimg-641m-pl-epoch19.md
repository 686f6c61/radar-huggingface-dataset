# cpral/HomeIMG-641M-PL-epoch19

## Resumen

HomeIMG-641M-PL-epoch19 es un generador de imágenes texto-a-imagen bilingüe (polaco e inglés) a resolución 256×256, entrenado desde cero por el desarrollador independiente cpral sobre ocho tarjetas gráficas domésticas. El modelo combina un denoiser DiT (diffusion transformer) de 641,1 millones de parámetros con un codificador de texto congelado, Poziomka-Baza, un modelo de lenguaje MoE de 4B parámetros también polaco-inglés, conectado mediante un refiner entrenable de 72,1 millones de parámetros. La relevancia del proyecto reside en su escala doméstica: demuestra que es posible entrenar un modelo de difusión funcional y bilingüe sin infraestructura industrial.

La arquitectura sigue el paradigma de flow matching rectificado (rectified flow) con un transformer de difusión como denoiser. El modelo parte de HomeIMG-641M-epoch15 (solo inglés) y añade cuatro épocas bilingües adicionales, sumando 19 épocas totales de entrenamiento. El resultado es un modelo que mantiene una calidad casi equivalente en polaco y en inglés, con una diferencia de FD-DINOv2 de solo 0,39 puntos entre ambos idiomas.

Se distribuye bajo licencia Apache 2.0 con pesos en safetensors y código personalizado para la librería diffusers (pipeline `AuroraIMG2Pipeline`). Está pensado para experimentación e investigación en generación de imágenes a baja resolución, no para producción comercial de alta fidelidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) con flow matching rectificado; denoiser de 6 bloques, anchura 2560, 20 cabezas (128), SwiGLU 6912, self-attention con RoPE 2D y QK-norm, cross-attention a texto (anchura 1280), adaLN-single estilo PixArt |
| Parametros totales | 641.104.896 (denoiser 641,1M + refiner 72,1M; el text encoder congelado no se cuenta en el checkpoint) |
| Parametros activos | No es MoE en el denoiser. El text encoder Poziomka-Baza es MoE con 8 de 32 expertos activos (~450M activos) |
| Longitud de contexto | Hasta 255 tokens de prompt |
| Tipos de cuantizacion | Pesos del denoiser en safetensors (bf16 presumiblemente); pesos de expertos del text encoder en int8 con escala por experto y columna, multiplicaciones en bf16. No se documentan otras cuantizaciones (GGUF, etc.) |
| Idiomas soportados | Polaco (pl) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería diffusers, custom_code) |

## Arquitectura y entrenamiento

El denoiser es un transformer de difusión de 641,1M parámetros con 6 bloques de anchura 2560 y 20 cabezas de atención de dimensión 128. Cada bloque integra self-attention con RoPE 2D y QK-norm, cross-attention hacia las características de texto (anchura 1280) y una MLP SwiGLU de dimensión 6912. La condición temporal se inyecta mediante adaLN-single al estilo PixArt. El modelo opera sobre un token por píxel de latente en una rejilla de 16×16, con latentes de 128×16×16 decodificados por el decodificador FLUX.2 small congelado.

El codificador de texto es Poziomka-Baza, un BailingMoeV2 congelado de 16 capas, anchura 2048 y 128 expertos, de los cuales 8 de 32 están activos por token (~450M parámetros activos; BLiMP 68,3% frente a 68,5% con 32 expertos). Sus pesos de experto se almacenan en int8 con escala por experto y columna, con multiplicaciones en bf16. Un refiner entrenable de 72,1M parámetros proyecta de 2048 a 1280 dimensiones mediante 4 bloques de transformer bidireccional (anchura 1280, 20 cabezas de query / 5 de key-value, RoPE 1D, SwiGLU 3456, RMSNorm) e incluye un prompt vacío aprendido para CFG.

El entrenamiento parte del denoiser de HomeIMG-641M-epoch15 (pesos EMA, 15 épocas en inglés con Slayer149) y un codificador de texto nuevo. Los datos son QLNI/FLUX-Reason-6M-flux2-latents (5,88 millones de imágenes), con un caption aleatorio por imagen y un 50% de los casos en polaco (cpral/FLUX-Reason-6M-captions-pl, traducido con Index-Translate-2B; ~0,3% de traducciones defectuosas sustituidas por el original inglés). El etapa 1 congela el denoiser y entrena solo el refiner (1 época, 5.743 pasos × 1024, ~650 imágenes/s, ~2,5 h). El etapa 2 entrena el modelo completo (4 épocas, 22.972 pasos × 1024 = 23,5 millones de muestras, ~11,8 millones de prompts polacos, ~385 imágenes/s, ~17 h). El objetivo es rectified flow con `z_t = (1−t)·x + t·ε`, objetivo `ε − x`, MSE, t ~ logit-normal(0, 1), con un 10% de prompts sustituidos por el vacío. El optimizador es MuLoCo (DiLoCo con Muon, 8 réplicas).

## Capacidades

- Generación de imágenes texto-a-imagen a resolución 256×256 con 50 pasos de Euler y CFG 3,0.
- Comprensión de prompts en polaco e inglés con calidad casi paritaria (FD-DINOv2 29,29 en polaco frente a 28,90 en inglés).
- Generación de escenas fotorrealistas, ilustraciones, acuarelas, arte digital y composiciones con texto en la imagen (por ejemplo, letreros de neón).
- Condicionamiento de texto mediante un codificador MoE congelado de 4B parámetros y un refiner entrenable de 72,1M.
- Soporte de prompts de hasta 255 tokens.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking; es exclusivamente texto-a-imagen.

## Casos de uso

- Prototipado rápido de conceptos visuales: el modelo genera imágenes de 256×256 en pocos segundos con 50 pasos de Euler, adecuado para iterar sobre ideas de diseño antes de pasar a modelos de mayor resolución.
- Investigación en flow matching y difusión: su arquitectura DiT con rectified flow y su receta de entrenamiento documentada (MuLoCo, refiner, text encoder MoE congelado) lo convierten en una base reproducible para estudiar el efecto del condicionamiento textual multilingüe.
- Generación bilingüe polaco-inglés: útil para aplicaciones que necesitan prompts en polaco sin degradación apreciable de calidad, como herramientas de creación de contenido para el mercado polaco.
- Educación y divulgación: sirve para demostrar que un modelo de difusión funcional puede entrenarse en hardware doméstico (8 GPU) con un presupuesto de ~20 horas por etapa.
- Generación de miniaturas y avatares de baja resolución: la salida de 256×256 es suficiente para iconos, avatares o miniaturas que luego se reescalan o se usan como referencia.
- Experimentación con decodificadores FLUX.2: al usar el decodificador small de FLUX.2 con latentes de 128×16×16, permite estudiar la interacción entre denoiser propio y decodificador ajeno.
- Base para fine-tuning posterior: al estar bajo Apache 2.0 y en formato diffusers, puede servir como punto de partida para ajustes en dominios específicos con datasets pequeños.

## Benchmarks y rendimiento

| Modelo | Text encoder | val/loss | FD-DINOv2 (EN) | FD-DINOv2 (PL) |
|---|---|---|---|---|
| HomeIMG-641M-epoch15 (WSM) | Slayer149 + refiner 35,7M | 0,6297 | 27,66 | no disponible |
| HomeIMG-641M-PL-stage1 (EMA) | Poziomka + refiner 72,1M | 0,6316 | no disponible | no disponible |
| HomeIMG-641M-PL-epoch19, pesos EMA | Poziomka + refiner 72,1M | 0,6284 | 29,25 | 29,82 |
| HomeIMG-641M-PL-epoch19 (WSM, este repo) | Poziomka + refiner 72,1M | 0,6277 | 28,90 | 29,29 |

FD-DINOv2 según Stein et al. 2023 (menor es mejor): distancia de Fréchet entre características CLS de DINOv2 de imágenes generadas y reales, sobre 4096 captions reservados, 50 pasos de Euler, CFG 3,0, semillas fijas, características `vit_base_patch14_reg4_dinov2.lvd142m`; la referencia son latentes reales reservados decodificados con el mismo decodificador FLUX.2. La columna PL usa las mismas imágenes y el mismo ruido con prompts traducidos al polaco. Los valores no son comparables con los FD-DINOv2 de publicaciones. val/loss es el MSE de velocidad sobre esos mismos 4096 imágenes con captions ingleses, ruido y t fijos.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 7,4 GB en el repositorio; el denoiser de 641M en bf16 requiere aproximadamente 1,3 GB, el refiner 72,1M unos 0,15 GB y el text encoder MoE de 4B con pesos int8 varios GB adicionales. En total, se estima un rango de 6-10 GB de VRAM en bf16/int8, aunque no se documenta una cifra oficial.
- GPU recomendadas: no se documentan requisitos oficiales. Por tamaño, cabe en GPU de consumo como RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090; también en A100 y H100 para mayor throughput.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 8-12 GB de VRAM, dado el tamaño del denoiser y el uso de int8 en el text encoder.
- Opciones de despliegue: diffusers con el pipeline personalizado `AuroraIMG2Pipeline` (custom_code). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión de este tipo.
- Latencia y throughput estimados: el autor reporta ~385 imágenes/s durante el entrenamiento del etapa 2 y ~650 imágenes/s en el etapa 1, sobre 8 GPU domésticas. No se documenta latencia de inferencia por imagen.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Contexto de prompt | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HomeIMG-641M-PL-epoch19 | 641,1M (denoiser) + 72,1M (refiner) | 256×256 | 255 tokens | pl, en | Apache 2.0 | HuggingFace (diffusers, custom_code) |
| HomeIMG-641M-epoch15 | 641,1M + 35,7M (refiner) | 256×256 | no disponible | en | Apache 2.0 (presumible) | HuggingFace |
| HomeIMG-641M-PL-stage1 | 641,1M + 72,1M (refiner) | 256×256 | no disponible | pl, en | Apache 2.0 (presumible) | HuggingFace |
| Stable Diffusion 1.5 | ~860M (UNet) + text encoder | 512×512 | 77 tokens | en (principalmente) | CreativeML OpenRAIL-M | Amplia disponibilidad |

La comparación con SD 1.5 es orientativa por escala de parámetros y resolución, no por resultados de benchmarks, que no son directamente comparables entre sí. No se dispone de datos de benchmarks de HomeIMG-641M-epoch15 ni de PL-stage1 en la información proporcionada más allá de val/loss y FD-DINOv2 parciales.

## Limitaciones y advertencias

- Resolución limitada a 256×256, insuficiente para muchos usos comerciales que requieren 512×512 o superior.
- Contexto de prompt limitado a 255 tokens, inferior a los 77 tokens de SD 1.5 en cuanto a tokens por prompt pero con mayor longitud total; aun así, insuficiente para descripciones muy largas.
- Solo soporta polaco e inglés; no se documenta rendimiento en otros idiomas.
- El modelo se entrenó con solo 19 épocas y sobre 5,88 millones de imágenes, un volumen muy inferior al de modelos de difusión comerciales, lo que probablemente se traduce en menor diversidad y fidelidad.
- Riesgo de alucinación visual y de artefactos en composiciones complejas, texto en imagen y detalles finos, dado el tamaño reducido del denoiser y la resolución.
- Sesgos potenciales heredados del dataset FLUX-Reason-6M y de las traducciones automáticas con Index-Translate-2B (~0,3% marcadas como defectuosas y sustituidas por el original inglés), lo que puede introducir sesgos lingüísticos y culturales.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de un decodificador FLUX.2 congelado cuyos términos de licencia no se detallan en la información proporcionada; conviene verificar la licencia del decodificador antes de un uso comercial.
- Requiere código personalizado (`AuroraIMG2Pipeline`) y la versión de diffusers compatible; no es un pipeline estándar.
- Sin métricas de benchmarks estándar (MMLU, HumanEval, GSM8K no aplican; FID, CLIP score no publicados), lo que dificulta la comparación objetiva con otros modelos.
- El autor indica que los valores de FD-DINOv2 no son comparables con los de publicaciones, por lo que las cifras deben interpretarse solo de forma relativa dentro de esta familia de modelos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cpral/HomeIMG-641M-PL-epoch19
- Modelo base (inglés): https://huggingface.co/cpral/HomeIMG-641M-epoch15
- Modelo base (text encoder): https://huggingface.co/cpral/Poziomka-Baza-2026-09-05
- Etapa previa bilingüe: https://huggingface.co/cpral/HomeIMG-641M-PL-stage1
- Dataset de latentes: https://huggingface.co/datasets/QLNI/FLUX-Reason-6M-flux2-latents
- Dataset de captions en polaco: https://huggingface.co/datasets/cpral/FLUX-Reason-6M-captions-pl
- Paper FD-DINOv2 (Stein et al. 2023): https://arxiv.org/abs/2306.04675
- Paper referenciado (arXiv 2507.17634): https://arxiv.org/abs/2507.17634
