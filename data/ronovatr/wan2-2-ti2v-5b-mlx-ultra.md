# ronovatr/Wan2.2-TI2V-5B-MLX-Ultra

## Resumen

Wan2.2-TI2V-5B-MLX-Ultra es una conversión cuantizada en precisión mixta del modelo de generación de vídeo Wan-AI/Wan2.2-TI2V-5B, publicada por el usuario ronovatr. No se trata de un modelo entrenado desde cero, sino de un conjunto de checkpoints optimizados para Apple Silicon mediante el framework MLX, con el objetivo de hacer viable la generación de vídeo texto-a-vídeo e imagen-a-vídeo en Macs de memoria unificada limitada (16-32 GB). El modelo base Wan2.2-TI2V-5B es un DiT (Diffusion Transformer) de 5B parámetros para generación de vídeo, acompañado del codificador de texto UMT5-XXL y un VAE.

La aportación principal del repositorio es la cuantización mixta por capas (per-layer `layer_bits`) con suavizado AWQ, Clip-GPTQ y una corrección EC-Ridge validada, aplicada tanto al DiT como al codificador T5. El resultado son varios "sabores" (q4-ultra, q6-ultra, q8-ultra) que reducen el peso total del stack de ~19,90 GiB en bf16 a entre 7,73 y 11,40 GiB, manteniendo una fidelidad alta frente a bf16 (por ejemplo, 24,92 dB PSNR y 0,9369 SSIM para q6-ultra).

Es relevante ahora porque permite ejecutar generación de vídeo de 720p y 81 fotogramas en hardware de consumo de Apple (un Mac mini de 32 GB) sin swap, algo impensable con los pesos completos. Requiere, eso sí, un fork parcheado de `mlx-video`, ya que emplea metadatos de cuantización no soportados por la versión upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) para vídeo + codificador de texto UMT5-XXL + VAE |
| Parametros totales | 5B (modelo base Wan2.2-TI2V-5B); UMT5-XXL adicional como encoder |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (condicionado por prompt de texto; no se especifica ventana) |
| Tipos de cuantizacion | Mixta por capas (per-layer `layer_bits`), group_size=32, AWQ smoothing + Clip-GPTQ + EC-Ridge; tiers q4-ultra, q6-ultra, q8-ultra; T5 en q4ultra/q6ultra/q8max; VAE en fp32 |
| Idiomas soportados | no disponible (el encoder UMT5-XXL es multilingüe, pero no se detalla cobertura) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es un Diffusion Transformer para generación de vídeo que combina un DiT de 5B parámetros con el codificador de texto UMT5-XXL y un VAE para la decodificación de latentes a píxeles. Esta conversión no entrena el modelo: parte de los pesos de Wan-AI/Wan2.2-TI2V-5B y de google/umt5-xxl y los cuantiza con una estrategia de precisión mixta por capas, donde cada capa del DiT puede tener un número de bits distinto según su sensibilidad. Se aplica suavizado AWQ, Clip-GPTQ y una corrección EC-Ridge con validación (validation-gated) para minimizar el error frente a bf16.

La innovación técnica destacable es doble. Por un lado, la cuantización mixta guiada por benchmarks de paridad de forward-pass (rel_rms y NCC frente a bf16) y por error en CFG, que reduce el MSE frente a la cuantización RTN estándar entre un 29% y un 79,3% según el tier. Por otro, la inclusión de metadatos (`layer_bits` en `config.json` y `t5_quantization` en la cabecera de los safetensors del T5) que exigen un fork parcheado de `mlx-video`. También se corrige un bug de PRNG en el `generate.py` upstream que desplazaba el estado global del RNG de MLX según el número de capas cuantizadas, garantizando que todos los tiers parten del mismo tensor de ruido inicial.

## Capacidades

- Generación de vídeo texto-a-vídeo (T2V) a partir de prompts descriptivos.
- Generación de vídeo imagen-a-vídeo (TI2V), según el pipeline declarado (`image-to-video`).
- Resolución nativa de hasta 1280x704 y 81 fotogramas (720p/81f) en hardware Apple de 32 GB.
- Codificación de texto multilingüe potencial vía UMT5-XXL (cobertura concreta no detallada).
- Cuantización selectiva por capas con tiers ajustables de memoria (q4/q6/q8).
- Decodificación VAE con tiling agresivo para limitar el pico de memoria.
- No se documentan tool calling, function calling, agentes ni modo thinking (no aplica a un modelo de difusión de vídeo).

## Casos de uso

- Generación de vídeo en local en Macs de consumo: con q6-ultra + T5 q8max (10,74 GiB) se pueden renderizar clips de 720p/81f en un Mac mini de 32 GB sin swap, útil para creadores que quieren privacidad y coste cero por inferencia.
- Prototipado rápido de vídeo texto-a-vídeo: el tier q4-ultra (7,73 GiB totales) cabe en Macs de 16-24 GB y permite iterar sobre prompts y semillas antes de lanzar renders de mayor calidad.
- Animación de imágenes fijas (image-to-video): adecuado para convertir ilustraciones o fotografías en clips animados con control de prompt, gracias al pipeline TI2V del modelo base.
- Previsualización de storyboards y moodboards: generar clips cortos de 832x480x25f (usado en los benchmarks) para validar dirección de arte antes de producir con herramientas de mayor coste.
- Investigación en cuantización de modelos de difusión: los checkpoints y los datos de paridad (rel_rms, NCC, PSNR, SSIM) sirven como referencia reproducible para estudiar precisión mixta en DiT sobre MLX.
- Render por etapas en pipelines con memoria restringida: el flujo documentado de volcar latentes a `.npz` y decodificar en un segundo proceso permite encadenar generación y decodificación VAE sin superar el límite de Metal.
- Automatización de contenido audiovisual en macOS: integrable en scripts que invocan `mlx_video.models.wan_2.generate` para producir lotes de clips con semilla fija y parámetros controlados.

## Benchmarks y rendimiento

Los datos publicados comparan cada tier frente a bf16 con el mismo ruido inicial (832x480x25f, 40 pasos, semilla 42, 0 swapouts en un Mac mini de 32 GB).

| Modelo | Bench A rel_rms (t=500) | Bench A NCC | CFG rel_rms held-out | CFG NCC held-out | MSE CFG vs RTN stock |
|---|---:|---:|---:|---:|---:|
| q8-ultra | 2,14% | 0,9998 | 9,17% | 0,9957 | -29,0% |
| q6-ultra | 3,07% | 0,9995 | 10,30% | 0,9946 | -71,0% |
| q4-ultra | 8,97% | 0,9960 | 18,69% | 0,9801 | -79,3% |

| Comparativa T2V (vs bf16) | PSNR | SSIM | NCC | dRGB |
|---|---:|---:|---:|---|
| q6-ultra + q8max T5 | 24,92 dB (25,82 dB en f24) | 0,9369 | 0,9872 | (+0,23, +0,23, +0,01) |
| q8-ultra | 25,05 dB | 0,9353 | 0,9876 | no disponible |
| q4-ultra | 18,40 dB | 0,8121 | no disponible | no disponible |
| q4 RTN stock | 17,06 dB | 0,7163 | no disponible | no disponible |

Rendimiento medido en un Mac mini de 32 GB para 1280x704x81f: carga 5,7 s, codificación T5 8,1 s, denoise de 40 pasos 2029,4 s (~50,73 s/it) y decodificación VAE con tiling en proceso separado 712 s, con 0 swapouts. La codificación T5 es entre 4,5 y 5,9 veces más rápida que la referencia gracias a `padding=False` y a mantener las tablas `pos_embedding` (96 KiB) en bf16.

## Requisitos de hardware

- Memoria unificada estimada por tier (DiT + T5): q4-ultra 7,73 GiB; q6-ultra con T5 light 10,14 GiB; q6-ultra recomendado 10,74 GiB; q8-ultra 11,40 GiB. El VAE fp32 añade 2,6 GiB.
- Hardware objetivo: Apple Silicon (Macs con memoria unificada de 16-32 GB). En un Mac mini de 32 GB el render 720p/81f con tiling agresivo usa ~18,4 GiB frente al límite de 26,8 GB de Metal.
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por estos checkpoints, que dependen de MLX y de un fork parcheado de `mlx-video`.
- Cabe en GPUs de consumo Apple de 16-24 GB en el tier q4-ultra; el tier q6-ultra recomendado requiere 24 GB o más para trabajar con holgura.
- Despliegue: `mlx-video` parcheado (`pip install git+https://github.com/ronovatr/mlx-video-ultra.git`), invocando `mlx_video.models.wan_2.generate` y un script `vae_decode.py` separado. No compatible con vLLM, llama.cpp, Ollama ni TGI (son para LLM, no para este pipeline de difusión).
- Throughput: el denoise es limitado por cómputo (~50-53 s/it en un Mac mini base, independientemente del tier). La cuantización ahorra RAM, no tiempo de pared a 720p.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/resolución | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Wan2.2-TI2V-5B-MLX-Ultra (este) | 5B DiT + UMT5-XXL | hasta 1280x704x81f | apache-2.0 | Hugging Face (MLX, fork parcheado) | Cuantización mixta para Apple Silicon; 7,73-11,40 GiB |
| Wan-AI/Wan2.2-TI2V-5B (base) | 5B DiT + UMT5-XXL | hasta 1280x704x81f | apache-2.0 | Hugging Face | Pesos bf16 (~19,90 GiB); referencia de calidad |
| google/umt5-xxl (encoder) | no disponible | no disponible | no disponible | Hugging Face | Solo codificador de texto, no genera vídeo |
| Otros modelos de vídeo open source | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Requiere un fork parcheado de `mlx-video`; cargar los checkpoints en la versión upstream falla por los metadatos `layer_bits` y `t5_quantization`.
- Solo funciona en Apple Silicon con MLX; no hay soporte para CUDA ni para GPUs NVIDIA.
- El denoise a 720p está limitado por cómputo (~50-53 s/it en un Mac mini base); la cuantización no acelera el render, solo reduce el uso de memoria.
- En Macs de 32 GB, la decodificación VAE con tiling agresivo roza el límite de Metal (~18,4 GiB de 26,8 GB); hay que dejar que el proceso de muestreo termine antes de lanzar `vae_decode.py` y evitar otros modelos pesados en paralelo.
- El tier q4-ultra presenta mayor deriva frente a bf16 (18,69% rel_rms en CFG held-out, 18,40 dB PSNR); usar q6-ultra o q8-ultra cuando la fidelidad sea crítica.
- Riesgo de alucinación visual y artefactos propios de modelos de difusión de vídeo; no se documentan sesgos específicos.
- Cobertura de idiomas del encoder no detallada; la calidad con prompts en castellano no está validada en la información disponible.
- Licencia Apache-2.0 heredada del modelo base, que permite uso comercial; conviene revisar los términos del fork MIT de `mlx-video` y de UMT5-XXL por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; es una conversión de un tercero, no oficial de Wan-AI.

## Enlaces

- Hugging Face: https://huggingface.co/ronovatr/Wan2.2-TI2V-5B-MLX-Ultra
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Encoder de texto: https://huggingface.co/google/umt5-xxl
- Fork parcheado de mlx-video: https://github.com/ronovatr/mlx-video-ultra
- Repositorio del proyecto (parche y assets): https://github.com/ronovatr/wan22-ti2v-5b-mlx-ultra
- mlx-video upstream: https://github.com/Blaizzy/mlx-video
