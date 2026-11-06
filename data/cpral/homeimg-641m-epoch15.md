# cpral/HomeIMG-641M-epoch15

## Resumen

HomeIMG-641M-epoch15 es un modelo experimental de generación de imágenes texto-a-imagen desarrollado por el usuario cpral, entrenado desde cero en hardware local (8 GPU RTX 3090 Ti de consumo). Se trata de un Diffusion Transformer (DiT) de 641,1 millones de parámetros que aplica flow matching (rectified flow) sobre latentes de 128×16×16, condicionado por un modelo de lenguaje pequeño congelado (SlayerLab/Slayer149) a través de un refinador entrenable de 35,7 millones de parámetros, y decodificado mediante el decoder congelado FLUX.2 small.

El modelo resuelve un problema de investigación concreto: demostrar que es posible entrenar un generador texto-a-imagen funcional a 256×256 píxeles exclusivamente con GPUs de consumo, sin recurrir a clústeres de A100/H100. Para ello emplea técnicas de entrenamiento distribuido de bajo coste (MuLoCo, una variante de DiLoCo con optimizador interno Muon) y variantes del optimizador Muon adaptadas a la arquitectura DiT (CMuon y Muon periódico por filas).

Es relevante ahora por su carácter abierto (licencia Apache 2.0), por documentar de forma transparente su pipeline de evaluación (FD-DINOv2 sobre 4.096 captions retenidas) y por formar parte de una saga de modelos de escala creciente (HomeIMG-50M, HomeIMG-253M, HomeIMG-641M) que sirve como referencia reproducible para investigadores interesados en entrenamiento de difusión a pequeña escala.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con flow matching; 6 bloques, anchura 2560, 20 cabezas (dim. de cabeza 128), MLP SwiGLU de tamaño oculto 6912, self-attention con RoPE 2D y QK-norm, cross-attention a tokens de texto, condicionamiento de timestep adaLN-single estilo PixArt |
| Parámetros totales | 641.104.896 (denoiser) + 35,7M (refinador entrenable) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 95 tokens de texto + BOS (entrada del codificador de texto) |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones GGUF/INT8/FP8) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería diffusers, pipeline `AuroraIMG2Pipeline` con `custom_code`) |

## Arquitectura y entrenamiento

El denoiser es un DiT de forma ancha y poco profunda: 6 bloques con anchura 2560 (relación anchura/profundidad ≈ 427, frente a los 40-80 típicos de DiTs publicados), una decisión explícita para maximizar throughput en el hardware objetivo mediante multiplicaciones matriciales grandes con un modelo por GPU. Cada bloque combina self-attention con RoPE 2D y QK-norm, cross-attention hacia los tokens de texto y un MLP SwiGLU. El condicionamiento temporal usa adaLN-single. No hay patchify: un token por píxel latente sobre una rejilla de 16×16. El codificador de texto (Slayer149, 148,9M, vocabulario de 12.288 tokens) está congelado y se toma el residual stream antes de su último bloque (18 de 19); un refinador entrenable de 35,7M (proyección 768→1280, 2 bloques transformer bidireccionales de anchura 1280 con 20 cabezas de query y 5 de KV, RoPE 1D, SwiGLU 3456, RMSNorm y embedding nulo aprendido para CFG) adapta esa representación. El decoder FLUX.2 small permanece congelado.

El entrenamiento usa rectified flow con `z_t = (1−t)·x + t·ε`, objetivo de velocidad `ε − x`, MSE y `t ~ logit-normal(0, 1)`, con un 10% de captions sustituidas por prompt nulo. Los datos son QLNI/FLUX-Reason-6M-flux2-latents: 5,88M imágenes, una caption aleatoria por imagen y paso, durante 15 épocas (88,2M muestras). El hardware fueron 8 RTX 3090 Ti locales (6 en PCIe 3.0 x4, 2 en x8) con autocast bf16 y `torch.compile`, rindiendo 50-100 TFLOPS por GPU según la fase (hasta ~70% del pico denso bf16) y unas dos jornadas de entrenamiento total. La distribución usa MuLoCo (DiLoCo con optimizador interno Muon): cada GPU entrena su réplica sobre su parte del batch y cada 64 pasos se promedian las 8 réplicas (lr externo 1.0, momentum 0). Muon se aplica a todas las matrices de pesos ocultas con dos variantes específicas de DiT: CMuon, que ortogonaliza por separado los bloques de matrices fusionadas (q/k/v, k/v de cross-attention, gate/up de SwiGLU), y Muon periódico por filas (Newton-Schulz cada 3 pasos, momentum normalizado por filas entre medias) en la primera fase.

## Capacidades

- Generación de imágenes texto-a-imagen a resolución 256×256 píxeles.
- Condicionamiento por prompt en inglés con hasta 95 tokens.
- Clasificador libre de guía (CFG) mediante embedding nulo aprendido en el refinador.
- Muestreo con integrador Euler (la model card documenta 50 pasos y CFG 3.0 como configuración de referencia).
- Generación determinista por semilla (los ejemplos publicados usan seed 0).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modos de pensamiento.
- No dispone de capacidades de visión, audio ni vídeo.
- Multilingüismo limitado al inglés; el autor anuncia una futura versión bilingüe inglés-polaco.

## Casos de uso

- Investigación en entrenamiento de difusión a pequeña escala: el modelo sirve como referencia reproducible para estudiar el efecto de la forma del DiT, el optimizador Muon y el entrenamiento distribuido de bajo coste, ya que el autor publica checkpoints intermedios y métricas de validación.
- Prototipado rápido de pipelines texto-a-imagen: al ser un modelo de 641M con licencia Apache 2.0, permite montar demos locales de generación 256×256 sin dependencias de API externas ni costes por token.
- Generación de miniaturas y bocetos conceptuales: la resolución 256×256 y los 50 pasos de Euler son adecuados para thumbnails de baja resolución en flujos de diseño iterativo donde la latencia importa más que el detalle fino.
- Aumento de datos sintéticos para tareas de visión: se pueden generar imágenes condicionadas por caption en inglés para ampliar datasets de clasificación o detección a pequeña escala, con la cautela de que la calidad está limitada por la resolución y el tamaño del modelo.
- Educación y docencia: el repositorio documenta arquitectura, objetivo de entrenamiento, hardware y métricas con suficiente detalle para usarse como caso de estudio en cursos de modelos generativos.
- Benchmarking de técnicas de optimización: las variantes CMuon y Muon periódico por filas pueden evaluarse de forma aislada reentrenando el modelo con las recetas publicadas, dado que el autor describe hiperparámetros y hardware.
- Experimentación con decodificadores congelados: al usar el decoder FLUX.2 small, el modelo permite estudiar cómo un denoiser entrenado desde cero se adapta a un espacio latente preexistente.

## Benchmarks y rendimiento

El autor publica dos métricas propias, medidas con el mismo código y las mismas 4.096 captions retenidas. Los valores absolutos de FD-DINOv2 no son comparables con los de la literatura (distinto encoder, dataset y número de muestras).

FD-DINOv2 (menor es mejor; 50 pasos Euler, CFG 3.0, semillas fijas, encoder `vit_base_patch14_reg4_dinov2.lvd142m`):

| Modelo | Denoiser | Muestras de entrenamiento | FD-DINOv2 |
|---|---|---|---|
| IMG-50M (WSM) | 50,4M + 12,6M text encoder desde cero | 63,4M | 69,61 |
| IMG-253M (EMA) | 253M + Slayer149 | 29,4M | 37,64 |
| IMG-641M-epoch10.8 (EMA) | 641M + Slayer149 | 63,3M | 29,50 |
| IMG-641M-epoch15, pesos EMA | 641M + Slayer149 | 88,2M | 28,27 |
| IMG-641M-epoch15 (este repo, WSM) | 641M + Slayer149 | 88,2M | 27,66 |

MSE de velocidad en held-out (mismas 4.096 imágenes, primera caption, ruido y `t ~ logit-normal(0, 1)` fijos):

| Modelo | val/loss |
|---|---|
| AuroraIMG2-50M-Preview | 0,6929 |
| HomeIMG-50M (WSM) | 0,7044 |
| HomeIMG-641M-epoch15, pesos crudos en el último paso | 0,6329 |
| HomeIMG-641M-epoch15, EMA | 0,6304 |
| HomeIMG-641M-epoch15 (este repo, WSM) | 0,6297 |

No se han publicado resultados de benchmarks estándar (FID, CLIP score, MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 641,1M de parámetros en el denoiser más 148,9M del codificador congelado, 35,7M del refinador y el decoder FLUX.2 small, en bf16 el conjunto agregado ronda los 1,7-2 GB de pesos; el pico real depende del decoder y del tamaño del batch.
- GPU recomendadas: el autor entrenó en 8× RTX 3090 Ti (24 GB), lo que indica que la inferencia cabe holgadamente en GPUs de consumo.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 8 GB o más de VRAM; no se documenta el mínimo exacto.
- Opciones de despliegue: `diffusers` con el pipeline `AuroraIMG2Pipeline` y `custom_code` (requiere `trust_remote_code=True`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (son herramientas orientadas a LLM, no a difusión).
- Latencia y throughput: no disponibles. La model card solo indica que el entrenamiento usó 50-100 TFLOPS por GPU y unos dos días en total.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HomeIMG-641M-epoch15 | 641M (denoiser) + 35,7M (refinador) | 95 tokens de texto; 256×256 | FD-DINOv2 27,66; val/loss 0,6297 | Apache 2.0 | Hugging Face (diffusers) |
| HomeIMG-253M | 253M + Slayer149 | 95 tokens; 256×256 | FD-DINOv2 37,64 | No disponible en la información | Hugging Face |
| HomeIMG-50M | 50,4M + 12,6M text encoder desde cero | No disponible; 256×256 | FD-DINOv2 69,61 | No disponible en la información | Hugging Face |
| AuroraIMG2-50M-Preview | 50M | No disponible; 256×256 | val/loss 0,6929 | No disponible en la información | Hugging Face |

No se dispone de datos de benchmarks comparables con modelos de difusión de la literatura (p. ej. SDXL, FLUX.1) porque el autor advierte que sus valores de FD-DINOv2 no son comparables con los publicados.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo etiqueta como tal; no está pensado para producción sin validación adicional.
- Resolución limitada a 256×256, insuficiente para la mayoría de aplicaciones comerciales de imagen.
- Solo inglés: los prompts en otros idiomas, incluido el castellano, degradarán la calidad de forma no cuantificada.
- Ventana de texto corta (95 tokens + BOS), lo que limita prompts largos y descripciones detalladas.
- Riesgo de alucinación visual y de composición incorrecta en escenas complejas, habitual en modelos de esta escala.
- Sesgos de los datos de entrenamiento (QLNI/FLUX-Reason-6M-flux2-latents) no auditados en la información disponible.
- Requiere `trust_remote_code=True` por el `custom_code` del pipeline, lo que implica ejecutar código del autor.
- Dependencia de pesos congelados de terceros (Slayer149 y FLUX.2 small decoder) cuyas licencias deben verificarse por separado para uso comercial.
- Sin métricas estándar de la comunidad (FID, CLIP score) que permitan una comparación directa con otros generadores.
- El autor anuncia futuras versiones (bilingüe inglés-polaco, 512×512, optimización por preferencias), por lo que este checkpoint quedará obsoleto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cpral/HomeIMG-641M-epoch15
- Checkpoint intermedio: https://huggingface.co/cpral/HomeIMG-641M-epoch10.8
- Modelo predecesor: https://huggingface.co/cpral/HomeIMG-253M
- Modelo predecesor: https://huggingface.co/cpral/HomeIMG-50M
- Modelo predecesor: https://huggingface.co/cpral/IMG-50M
- Modelo predecesor: https://huggingface.co/cpral/IMG-253M
- Codificador de texto congelado: https://huggingface.co/SlayerLab/Slayer149
- Decoder congelado: https://huggingface.co/black-forest-labs/FLUX.2-small-decoder
- Dataset de entrenamiento: https://huggingface.co/datasets/QLNI/FLUX-Reason-6M-flux2-latents
- FD-DINOv2 (Stein et al. 2023): https://arxiv.org/abs/2306.04675
- MuLoCo (DiLoCo con Muon): https://arxiv.org/abs/2505.23725
- CMuon: https://arxiv.org/abs/2608.02502
- Muon periódico por filas: https://arxiv.org/abs/2608.20818
- Referencia adicional citada en los tags: https://arxiv.org/abs/2512.10794
- Referencia adicional citada en los tags: https://arxiv.org/abs/2410.06940
- Referencia adicional citada en los tags: https://arxiv.org/abs/2505.16792
- Referencia adicional citada en los tags: https://arxiv.org/abs/2507.17634
