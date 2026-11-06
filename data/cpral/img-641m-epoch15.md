# cpral/IMG-641M-epoch15

## Resumen

IMG-641M-epoch15 es un modelo experimental de generación de imágenes texto-a-imagen desarrollado por el usuario cpral, entrenado desde cero sobre 8 GPUs de consumo (RTX 3090 Ti). Se trata de un Diffusion Transformer (DiT) de 641,1 millones de parámetros que emplea flow matching (rectified flow) como objetivo de entrenamiento, condicionado por un modelo de lenguaje pequeño congelado (SlayerLab/Slayer149) a través de un refinador entrenable de 35,7 millones de parámetros, y que decodifica mediante el decodificador congelado FLUX.2 small decoder. Genera imágenes de 256×256 píxeles.

El modelo es la tercera iteración de una saga de experimentos de entrenamiento desde cero (tras IMG-50M e IMG-253M) y representa un checkpoint intermedio de un mismo run de entrenamiento, con 15 épocas completas sobre 5,88 millones de imágenes (88,2 millones de muestras). Su relevancia radica en demostrar que es posible entrenar un DiT de escala media con técnicas de optimización distribuidas (MuLoCo, Muon) y regularización representacional (REPA/iREPA) en hardware de consumo, alcanzando métricas de calidad (FD-DINOv2 de 27,66) que superan a sus predecesores.

La arquitectura destaca por su forma ancha y poco profunda (6 bloques, anchura 2560), una elección deliberada para maximizar el throughput en el hardware disponible, alejándose de las proporciones típicas de los DiT publicados. El modelo está pensado como artefacto de investigación, no como producto listo para producción, y su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con flow matching (rectified flow), 6 bloques, anchura 2560, 20 cabezas (head dim 128), SwiGLU MLP (hidden 6912), self-attention con RoPE 2D y QK-norm, cross-attention a tokens de texto, acondicionamiento de timestep PixArt-style adaLN-single |
| Parametros totales | 641.104.896 (denoiser) + 35,7M (refiner entrenable); text encoder (148,9M) y decoder congelados |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 95 tokens de texto + BOS (vocabulario de 12.288 tokens) |
| Tipos de cuantizacion | No disponible (pesos en bfloat16; el repo no documenta cuantizaciones GGUF/INT8) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería diffusers, pipeline AuroraIMG2Pipeline, custom_code) |

## Arquitectura y entrenamiento

El denoiser es un DiT de 641,1M de parámetros con una forma inusualmente ancha y poco profunda: 6 bloques con anchura 2560 (ratio anchura/profundidad ≈ 427, frente a los 40–80 habituales en DiT publicados). Cada bloque combina self-attention con RoPE 2D y QK-norm, cross-attention hacia los tokens de texto y un MLP SwiGLU. El acondicionamiento temporal usa adaLN-single estilo PixArt. El modelo opera un token por píxel latente sobre una rejilla de 16×16, sin patchify. Esta forma se eligió por throughput en el hardware objetivo (una réplica por GPU con multiplicaciones de matrices grandes), aunque queda fuera del rango de los estudios publicados sobre formas de DiT.

El codificador de texto es SlayerLab/Slayer149 (148,9M, inglés, vocabulario de 12.288 tokens), congelado; su residual stream antes del último bloque (18 de 19 bloques) alimenta un refinador entrenable de 35,7M (proyección 768→1280, 2 bloques transformer bidireccionales con 20 cabezas query y 5 KV, RoPE 1D, SwiGLU 3456, RMSNorm y embedding nulo aprendido para CFG). El decodificador es el FLUX.2 small decoder, congelado, que trabaja sobre latentes de 128×16×16 (latentes FLUX.2 empaquetados 2×2 y normalizados con BatchNorm).

El entrenamiento usó el dataset QLNI/FLUX-Reason-6M-flux2-latents (5,88M imágenes, una caption aleatoria por imagen y paso), con objetivo rectified flow (`z_t = (1−t)·x + t·ε`, target `ε − x`, MSE, t ~ logit-normal(0,1)) y 10% de captions sustituidas por el prompt nulo. Se ejecutó sobre 8× RTX 3090 Ti en bf16 con `torch.compile`, durante aproximadamente dos días, alcanzando 50–100 TFLOPS por GPU según la fase. El optimizador fue MuLoCo (DiLoCo con Muon interno): cada GPU entrena su réplica y cada 64 pasos se promedian las 8 réplicas (lr externo 1.0, momentum 0). Se aplicaron variantes específicas de Muon para DiT (CMuon, que ortogonaliza por separado los bloques de matrices fusionadas q/k/v, cross-attention k/v y SwiGLU gate/up; y Muon periódico por filas con Newton–Schulz cada 3 pasos en los dos primeros tercios), con momentum 0.95 y weight decay 0.01, más AdamW para el resto de parámetros. Se incorporó REPA mediante iREPA: el estado oculto tras el bloque 2 se alinea con un proyector convolucional 3×3 con DINOv2-B/14 (registers) espacialmente normalizado.

## Capacidades

- Generación de imágenes texto-a-imagen a resolución 256×256 píxeles.
- Condicionamiento por prompts en inglés de hasta 95 tokens.
- Clasificador sin guía (CFG) configurable (los ejemplos usan CFG 3.0).
- Muestreo con integrador Euler (50 pasos en los ejemplos publicados).
- Control de reproducibilidad mediante semillas fijas.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión de entrada, audio ni otras modalidades.
- Multilingüismo limitado al inglés (el codificador de texto es monolingüe).

## Casos de uso

- Investigación en entrenamiento de DiT desde cero: el modelo sirve como referencia reproducible de un pipeline completo (flow matching, Muon, DiLoCo, REPA) ejecutado en GPUs de consumo, útil para estudiar la estabilidad y convergencia de estas técnicas.
- Generación de prototipos visuales de baja resolución: para maquetas rápidas de conceptos, storyboards o pruebas de concepto donde 256×256 es suficiente y se prioriza la velocidad de iteración sobre la calidad final.
- Aumentación de datos sintéticos: generar pares imagen-caption a 256×256 para preentrenar o aumentar datasets de visión por computador, aprovechando la licencia Apache 2.0.
- Estudio comparativo de arquitecturas DiT: su forma ancha y poco profunda permite analizar el efecto de la relación anchura/profundidad en la calidad de generación frente a DiT conven更cionales.
- Benchmarking de técnicas de optimización distribuida: útil para reproducir y comparar MuLoCo, CMuon y Muon periódico por filas en un entorno controlado con métricas publicadas (FD-DINOv2, velocity MSE).
- Evaluación de refiner sobre encoder congelado: permite estudiar cómo un refiner pequeño (35,7M) adapta las representaciones de un LM congelado para condicionamiento visual.
- Docencia y divulgación: ejemplo didáctico de un pipeline text-to-image completo con componentes congelados y entrenables claramente separados.

## Benchmarks y rendimiento

Los datos de evaluación publicados por el autor usan FD-DINOv2 (Fréchet distance sobre features CLS de DINOv2, menor es mejor) y velocity MSE en held-out. Las cifras absolutas no son comparables con las de otros papers (distinto encoder, dataset y número de muestras).

| Modelo | Denoiser | Muestras de entrenamiento | FD-DINOv2 |
|---|---|---|---|
| IMG-50M (WSM) | 50,4M + 12,6M text encoder desde cero | 63,4M | 69,61 |
| IMG-253M (EMA) | 253M + Slayer149 | 29,4M | 37,64 |
| IMG-641M-epoch10.8 (EMA) | 641M + Slayer149 | 63,3M | 29,50 |
| IMG-641M-epoch15, EMA | 641M + Slayer149 | 88,2M | 28,27 |
| IMG-641M-epoch15 (WSM, este repo) | 641M + Slayer149 | 88,2M | 27,66 |

| Modelo | val/loss (velocity MSE) |
|---|---|
| AuroraIMG2-50M-Preview | 0,6929 |
| IMG-50M (WSM) | 0,7044 |
| IMG-641M-epoch15, pesos raw en el último paso | 0,6329 |
| IMG-641M-epoch15, EMA | 0,6304 |
| IMG-641M-epoch15 (WSM, este repo) | 0,6297 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que el modelo no es un LLM.

## Requisitos de hardware

- VRAM estimada para inferencia: el denoiser tiene 641M parámetros; en bf16 son ~1,3 GB, más el text encoder congelado (148,9M, ~0,3 GB), el refiner (35,7M, ~0,07 GB) y el decoder FLUX.2 small (tamaño no especificado en la información). El repo ocupa 3,5 GB. La VRAM total realista para inferencia completa no está documentada.
- GPU recomendadas: el entrenamiento se realizó en 8× RTX 3090 Ti; para inferencia es previsible que quepa en GPUs de consumo con suficiente VRAM, aunque no se publican cifras oficiales.
- Cabe en GPU de consumo: sí, según el hardware de entrenamiento (RTX 3090 Ti, 24 GB), aunque la VRAM exacta de inferencia no está documentada.
- Opciones de despliegue: diffusers con el pipeline `AuroraIMG2Pipeline` (custom_code). No se documentan integraciones con vLLM, llama.cpp ni Ollama (no aplicables a un modelo de difusión).
- Latencia y throughput: no disponibles. Los ejemplos usan 50 pasos Euler con CFG 3.0 y decoder en bfloat16, pero no se publican tiempos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de texto | Resolución | Licencia | FD-DINOv2 (mismo protocolo) |
|---|---|---|---|---|---|
| IMG-641M-epoch15 | 641M (+35,7M refiner) | 95 tokens + BOS | 256×256 | Apache 2.0 | 27,66 |
| IMG-641M-epoch10.8 | 641M (+35,7M refiner) | 95 tokens + BOS | 256×256 | Apache 2.0 | 29,50 |
| IMG-253M | 253M (+refiner) | 95 tokens + BOS | 256×256 | Apache 2.0 | 37,64 |
| IMG-50M | 50,4M + 12,6M text encoder | no disponible | 256×256 | Apache 2.0 | 69,61 |

No se dispone de comparación con modelos de difusión de terceros bajo el mismo protocolo de evaluación; los valores de FD-DINOv2 del autor no son comparables con los de papers externos.

## Limitaciones y advertencias

- Modelo explícitamente experimental, no un producto listo para producción.
- Resolución limitada a 256×256 píxeles.
- Solo admite prompts en inglés; el codificador de texto es monolingüe.
- Ventana de texto corta (95 tokens + BOS), lo que limita prompts complejos o descripciones largas.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir imágenes incoherentes o no fieles al prompt, especialmente con composiciones complejas o texto en la imagen.
- Sesgos conocidos: no documentados por el autor; el dataset de entrenamiento (FLUX-Reason-6M-flux2-latents) puede introducir sesgos de representación no evaluados.
- La forma ancha y poco profunda del DiT queda fuera del rango de los estudios publicados, por lo que su comportamiento en dominios distintos al de entrenamiento no está caracterizado.
- Sin datos publicados sobre robustez, seguridad o filtrado de contenido.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantías.
- El decodificador FLUX.2 small es un componente de terceros congelado; su licencia y condiciones deben verificarse por separado.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria ni informes de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/cpral/IMG-641M-epoch15
- Modelo predecesor IMG-50M: https://huggingface.co/cpral/IMG-50M
- Modelo predecesor IMG-253M: https://huggingface.co/cpral/IMG-253M
- Checkpoint intermedio IMG-641M-epoch10.8: https://huggingface.co/cpral/IMG-641M-epoch10.8
- Text encoder SlayerLab/Slayer149: https://huggingface.co/SlayerLab/Slayer149
- Decodificador FLUX.2 small: https://huggingface.co/black-forest-labs/FLUX.2-small-decoder
- Dataset QLNI/FLUX-Reason-6M-flux2-latents: https://huggingface.co/datasets/QLNI/FLUX-Reason-6M-flux2-latents
- Paper FD-DINOv2 (Stein et al. 2023): https://arxiv.org/abs/2306.04675
- Paper MuLoCo / DiLoCo con Muon: https://arxiv.org/abs/2505.23725
- Paper CMuon: https://arxiv.org/abs/2608.02502
- Paper Muon periódico por filas: https://arxiv.org/abs/2608.20818
- Paper iREPA: https://arxiv.org/abs/2512.10794
- Paper REPA: https://arxiv.org/abs/2410.06940
- Paper adicional citado (arXiv:2505.16792): https://arxiv.org/abs/2505.16792
- Paper adicional citado (arXiv:2507.17634): https://arxiv.org/abs/2507.17634
