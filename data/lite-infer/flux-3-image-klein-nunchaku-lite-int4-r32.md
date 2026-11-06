# lite-infer/flux-3-image-klein-nunchaku-lite-int4-r32

## Resumen

FLUX.3 [klein] Nunchaku Lite INT4 r32 es una versión cuantizada del modelo de generación y edición de imágenes FLUX.3 [klein] de Black Forest Labs, publicada por el usuario lite-infer. El transformer de difusión se ha comprimido a INT4 (W4A4) mediante SVDQuant con rango 32 y GPTQ, mientras que el codificador de texto Qwen3-VL se ha serializado en NF4 de BitsAndBytes con cómputo en BF16. El VAE, el scheduler y los procesadores originales se conservan intactos. El resultado es un pipeline de image-to-image (y text-to-image) de aproximadamente 3.070 millones de parámetros que ocupa 7 GB en el repositorio.

La relevancia de esta ficha radica en que permite ejecutar un modelo de la familia FLUX.3 en GPUs de consumo con VRAM limitada, a costa de una pérdida medible de fidelidad respecto al BF16 original. El modelo es de tipo step-distilled: genera en 16 pasos sin classifier-free guidance, lo que reduce el coste computacional por imagen. Está pensado para flujos de edición de imagen y generación rápida, no para producción de máxima calidad.

La licencia es la flux-kommunity-license, que impone restricciones específicas al uso comercial y a la redistribución. El modelo se distribuye en formato safetensors para la librería diffusers y requiere kernels remotos (paquete `kernels`) para las operaciones INT4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (FLUX.3) con text encoder Qwen3-VL y VAE; cuantizacion SVDQuant INT4 W4A4 r32 + GPTQ en el transformer, NF4 en el text encoder |
| Parametros totales | 3.074.788.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 W4A4 (SVDQuant, rango 32, GPTQ) en transformer; NF4 BitsAndBytes con computo BF16 y sin doble cuantizacion en text encoder |
| Idiomas soportados | no disponible |
| Licencia | flux-kommunity-license |
| Formato de pesos | safetensors (diffusers) |

## Arquitectura y entrenamiento

El modelo base FLUX.3 [klein] es un transformer de difusión para generación y edición de imágenes que combina un text encoder Qwen3-VL con un VAE y un scheduler de difusión. Esta versión cuantizada no reentrena el modelo: aplica SVDQuant de rango 32 con GPTQ sobre el transformer para llevarlo a INT4 con activaciones también en 4 bits (W4A4), y serializa el text encoder en NF4 de BitsAndBytes manteniendo el cómputo en BF16. El VAE, el scheduler y los procesadores se conservan del modelo original.

El modelo es step-distilled: funciona con 16 pasos de inferencia y sin classifier-free guidance, lo que reduce el número de evaluaciones del transformer por imagen. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La innovación técnica destacable es la combinación de SVDQuant con GPTQ para INT4 y la serialización NF4 del text encoder, que permite ejecutar el pipeline en GPUs Turing o posteriores (Hopper no soportado; en Blackwell se recomienda la build NVFP4).

## Capacidades

- Generación de texto a imagen (text-to-image) a resoluciones como 1024×1024 y 832×1248.
- Edición de imagen (image-to-image) pasando una imagen de entrada al pipeline.
- Edición guiada por instrucciones en lenguaje natural, incluyendo modificación de texto sobre objetos (por ejemplo, pintar palabras en un cartel).
- Preservación de identidad de producto en edición (mantener forma, etiqueta y detalles de un objeto).
- Generación en 16 pasos sin classifier-free guidance gracias al step distillation.
- Soporte de prompt upsampler opcional (no incluido en el repo; requiere cargar `flux-3-image-klein-pup` aparte).
- No se documentan capacidades de tool calling, agentes, audio ni thinking mode.

## Casos de uso

- Edición de producto para e-commerce: el modelo permite recolocar un producto (por ejemplo, un frasco de base de maquillaje) en una escena nueva manteniendo forma, bomba dorada y texto de la etiqueta, como demuestra el caso `product_1` de la model card.
- Generación de carteles y material gráfico: el caso `t2i_poster` muestra la creación de un póster minimalista con texto legible ("MIDNIGHT ECHOES"), útil para prototipos de diseño gráfico.
- Retrato fotorrealista para prototipado: el caso `t2i_portrait` genera retratos con textura de piel realista y luz natural, adecuado para maquetas de campañas.
- Edición de texto sobre imágenes: el caso `edit_sign` permite pintar palabras sobre un cartel de madera, útil para señalética y mockups.
- Escenas de viaje y arquitectura: el caso `t2i_street` genera calles mediterráneas con detalle en piedra, vegetación y sombras, útil para ilustración editorial.
- Despliegue en GPUs de consumo: al ocupar 7 GB y usar INT4, permite ejecutar un modelo FLUX.3 en estaciones de trabajo con GPUs Turing o Ada sin acceso a clústeres de datacenter.
- Prototipado rápido de pipelines de edición: la integración con diffusers y la API `Flux3DistilledAutoBlocks` facilita iterar sobre flujos de image-to-image en investigación.

## Benchmarks y rendimiento

La model card proporciona métricas de fidelidad frente a las salidas BF16 del modelo original, calculadas con LPIPS v0.1 (AlexNet) y PSNR RGB sobre 20 casos (10 text-to-image y 10 ediciones):

| Pipeline final | Casos | LPIPS ↓ | PSNR ↑ (dB) |
|---|---:|---:|---:|
| NVFP4 + NF4 | todos (20) | 0.1244 | 22.98 |
| NVFP4 + NF4 | text-to-image (10) | 0.1647 | 20.60 |
| NVFP4 + NF4 | edición (10) | 0.0842 | 25.36 |
| INT4 + NF4 | todos (20) | 0.1744 | 20.98 |
| INT4 + NF4 | text-to-image (10) | 0.2147 | 19.17 |
| INT4 + NF4 | edición (10) | 0.1342 | 22.79 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, al tratarse de un modelo de imagen.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 7 GB; la inferencia en INT4 + NF4 requiere cargar transformer, text encoder, VAE y scheduler, por lo que se estima un consumo en torno a 8-10 GB de VRAM (no confirmado en la información disponible).
- GPU recomendadas: NVIDIA Turing o posterior para INT4; Hopper no soportado; en Blackwell se recomienda la build NVFP4 para aprovechar los tensor cores FP4.
- Cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4070/4080 y RTX 4090, siempre que sean Turing o Ada.
- Opciones de despliegue: diffusers 0.42.1 con `Flux3DistilledAutoBlocks`, PyTorch 2.11.0 + CUDA 12.8, Transformers 5.19.0, BitsAndBytes 0.50.2 y el paquete `kernels` con `DIFFUSERS_TRUST_REMOTE_KERNELS=true`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| lite-infer/flux-3-image-klein-nunchaku-lite-int4-r32 | 3.074.788.096 | no disponible | INT4 W4A4 + NF4 | flux-kommunity-license | Hugging Face (lite-infer) |
| black-forest-labs/flux-3-image-klein (BF16) | no disponible | no disponible | BF16 | flux-kommunity-license | Hugging Face (BFL) |
| Build NVFP4 del mismo modelo | no disponible | no disponible | NVFP4 + NF4 | flux-kommunity-license | no disponible |

La comparativa se limita al modelo base y a la variante NVFP4 mencionada en la model card; no se dispone de datos de otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de fidelidad medible frente a BF16: LPIPS de 0.1744 y PSNR de 20.98 dB en el conjunto completo, con peor rendimiento en text-to-image (LPIPS 0.2147) que en edición (LPIPS 0.1342).
- Requiere GPU Turing o posterior; Hopper no está soportado y en Blackwell se recomienda NVFP4 en lugar de INT4.
- Dependencia de kernels remotos (`DIFFUSERS_TRUST_REMOTE_KERNELS=true`), lo que implica ejecutar código descargado en tiempo de ejecución.
- El prompt upsampler no está incluido; si se desea usar, hay que cargar `flux-3-image-klein-pup` por separado.
- Licencia flux-kommunity-license: restricciones específicas para uso comercial y redistribución; revisar LICENSE.md antes de producción.
- Riesgo de alucinación visual y de artefactos en texto renderizado, especialmente en la variante INT4.
- Idiomas soportados no documentados; el comportamiento multilingüe del text encoder Qwen3-VL no está verificado en esta build.
- Sin datos de sesgos conocidos ni de evaluación de seguridad en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/lite-infer/flux-3-image-klein-nunchaku-lite-int4-r32
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Prompt upsampler: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup
- Licencia: LICENSE.md en el repositorio del modelo
