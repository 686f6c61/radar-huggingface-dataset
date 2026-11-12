# cpral/HomeIMG-1.2B-PL-EN-epoch47

## Resumen

HomeIMG-1.2B-PL-EN-epoch47 es un modelo de generación de imágenes texto-a-imagen desarrollado por el usuario independiente cpral, publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un diffusion transformer bilingüe (polaco e inglés) de aproximadamente 1.247 millones de parámetros que emplea flow matching (rectified flow) como objetivo de entrenamiento y codificación de posiciones RoPE en estilo RPE-2D. Es la continuación directa de HomeIMG-1.2B-PL-EN-epoch46, del que hereda los pesos EMA y al que añade una época adicional de entrenamiento a 384×384 píxeles.

El modelo resuelve la generación de imágenes cuadradas de resolución moderada (384–768 píxeles) a partir de prompts en polaco o inglés, con un pipeline propio denominado AuroraIMG2Pipeline integrado en diffusers. Su relevancia radica en ser un experimento abierto y reproducible sobre entrenamiento de difusión a pequeña escala con hardware de consumo (8× RTX 3090 Ti), con código de entrenamiento publicado y decisiones técnicas documentadas de forma inusualmente transparente.

Esta epoch47 es una **versión experimental de resultado mixto**, según reconoce el propio autor: mejora la composición a 384 píxeles respecto a epoch46, pero produce imágenes más suaves y con menos detalle, y a 256 píxeles es claramente inferior a su predecesor. El autor declara que no volverá a usar el conjunto sintético Z-Image en etapas posteriores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) con flow matching / rectified flow y posiciones RoPE en estilo RPE-2D |
| Parametros totales | 1.246.802.432 (~1,25 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo texto-a-imagen; sin ventana de contexto de texto definida) |
| Tipos de cuantizacion | Pesos en bf16; expertos del text encoder (Poziomka) en int8; no se documentan cuantizaciones GGUF/FP8 del denoiser |
| Idiomas soportados | Polaco (pl) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, librería diffusers, con `custom_pipeline` y `trust_remote_code` |
| Resolución de entrenamiento | 384×384 px (epoch47); admite resoluciones cuadradas múltiplo de 16, sensatas entre 384 y 768 |
| Pasos de inferencia recomendados | 50 pasos de Euler, CFG 3,0 |
| Tamaño del repositorio | 9,9 GB |

## Arquitectura y entrenamiento

El modelo es un diffusion transformer que opera sobre latentes codificados por el autoencoder `AutoencoderKLFlux2` (el codificador de FLUX.2). El objetivo de entrenamiento es rectified flow con la parametrización `z_t = (1−t)·x + t·ε`, predicción del objetivo `ε − x` y pérdida MSE, con `t` muestreado de una logit-normal(0, 1), sin desplazamiento de schedule y con un 10 % de prompts reemplazados por cadena vacía (classifier-free guidance implícito). Las posiciones se codifican con RoPE en estilo RPE-2D (arXiv:2503.18719): durante el entrenamiento se muestrean valores enteros aleatorios por eje (24 valores distintos en el rango 0–63) y en inferencia se distribuyen uniformemente sobre un campo de 64. Los micro-condicionamientos indican siempre "imagen completa a la resolución de salida".

El entrenamiento parte de los pesos EMA de HomeIMG-1.2B-PL-EN-epoch46 y añade una época completa a 384×384 píxeles, la primera realizada sobre imágenes reales en lugar de latentes precalculados. El conjunto de datos combina aproximadamente 11,75 millones de imágenes a partes iguales: LucasFang/FLUX-Reason-6M (JPEG originales de 1024 px reducidos en vuelo a 384 px con bicúbico antialias, con captions traducidos al polaco en el 50 % de los casos) y jasperai/monet `v1.2.0/synthetic/z-image` (miniaturas WEBP de 384 px con el caption VLM más corto, sin la fórmula "The image shows", también en polaco al 50 %). Los latentes se calculan en vuelo en cada tarjeta mediante el encoder de FLUX.2, sin almacenamiento en disco. El cómputo total fue de 5830 pasos × 2016 muestras. Se empleó el optimizador MuLoCo (7 réplicas promediadas cada 64 pasos) junto con Muon (CMuon, lr 3e-3, momentum en bf16) y AdamW para el resto de parámetros. El entrenamiento se ejecutó en 8× RTX 3090 Ti en bf16 (7 tarjetas entrenando, la octava calculando el proyecto Poziomka), a 120–129 imágenes/s durante aproximadamente 27 horas, con dos reanudaciones desde checkpoint.

## Capacidades

- Generación de imágenes texto-a-imagen a resoluciones cuadradas de 384, 512 y 768 píxeles (múltiplos de 16), con 384 px como resolución nativa de entrenamiento.
- Comprensión de prompts en polaco e inglés, con captions de entrenamiento bilingües al 50 %.
- Generación de escenas simples con un objeto principal coherente y composición limpia a 384 px.
- Renderizado de texto corto en inglés dentro de la imagen (el autor reporta la palabra "OPEN" correctamente escrita en las pruebas a 384 px).
- Extrapolación razonable a 768 px (2× la resolución de entrenamiento) para objetos aislados como un zorro, fresas, una farola o un robot, aunque la ciudad y los textos se descomponen a esa escala.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo "thinking": es exclusivamente un generador de imágenes.
- No se documenta soporte de image-to-image, inpainting ni controlnet en la información disponible.

## Casos de uso

- **Prototipado rápido de ilustraciones cuadradas**: el modelo genera imágenes de 384×384 con 50 pasos de Euler y CFG 3,0, adecuadas para maquetas, wireframes o pruebas de concepto donde prima la velocidad sobre el detalle fino.
- **Generación de imágenes con prompts en polaco**: al estar entrenado con el 50 % de captions en polaco, permite escribir directamente en ese idioma sin traducción intermedia, algo poco habitual en modelos de difusión abiertos de este tamaño.
- **Pruebas de investigación sobre flow matching a pequeña escala**: con código de entrenamiento publicado y decisiones técnicas documentadas (RPE-2D, MuLoCo, Muon), sirve como banco de pruebas reproducible para estudiar dinámicas de entrenamiento de DiT en hardware de consumo.
- **Generación de fondos y texturas suaves**: dado que epoch47 produce imágenes más suaves y con menos detalle que su predecesor, encaja en usos donde esa estética blanda es deseable, como fondos para presentaciones o material de relleno.
- **Evaluación comparativa de checkpoints**: al existir epoch46 y epoch47 con los mismos 8 prompts, seed 0 y parámetros de muestreo, permite comparar directamente el efecto de una época adicional a 384 px sobre la calidad y la composición.
- **Generación de imágenes a 768 px para objetos aislados**: para prompts de un único sujeto (un zorro, frutas, una farola), la extrapolación a 768 px se mantiene sorprendentemente coherente según el autor, útil para iconos o ilustraciones simples de mayor tamaño.
- **Educación y divulgación**: el repositorio documenta curvas de validación, configuración de entrenamiento y limitaciones de forma explícita, lo que lo convierte en material didáctico para quienes aprenden a entrenar modelos de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, al no tratarse de un modelo de lenguaje. El autor reporta únicamente métricas de validación internas de la pérdida de flow matching (MSE de velocidad con ruido y `t` fijos), no comparables con las de ediciones anteriores a 256 px:

| Conjunto de validación (384 px) | Inicio del etapa (paso 16) | Fin (paso 5830) |
|---|---|---|
| FLUX-Reason, 4 shards reservados (4096 imágenes) | 0,597 | 0,582 |
| Z-Image, archivo `45-0/000005` reservado (4096 imágenes) | 0,681 | 0,564 |
| Total | 0,639 | 0,573 |

Desglose sobre shards reservados de FLUX-Reason: aesthetics-part01 0,633; aesthetics-part02 0,607; imaginative 0,626; text 0,462. La métrica FD-DINOv2 no fue medida. No se dispone de comparación numérica con epoch46 en estas mismas condiciones.

## Requisitos de hardware

- **VRAM estimada**: aproximadamente 10 GB según el autor, incluyendo el text encoder Poziomka en bf16 con expertos en int8 y el autoencoder `AutoencoderKLFlux2`.
- **GPU recomendadas**: cualquier GPU con 10 GB o más de VRAM; el propio autor entrenó en RTX 3090 Ti. Para inferencia son válidas RTX 3090, RTX 4090, A100, H100 y similares.
- **¿Cabe en GPU de consumo?**: sí, en tarjetas con al menos 10 GB (RTX 3080 12 GB, RTX 3090, RTX 4070 Ti Super, RTX 4080, RTX 4090). No se documenta su funcionamiento en GPUs de 8 GB sin cuantización adicional.
- **Opciones de despliegue**: el uso oficial es mediante `diffusers` con `DiffusionPipeline.from_pretrained(..., custom_pipeline=REPO, trust_remote_code=True)`, requiriendo una versión de diffusers que incluya `AutoencoderKLFlux2`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión de este tipo.
- **Latencia y throughput**: no se publican cifras de latencia de inferencia. En entrenamiento se alcanzaron 120–129 imágenes/s en 8× RTX 3090 Ti con bf16, dato no trasladable a inferencia con 50 pasos de Euler.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables con otros modelos de difusión en la información proporcionada, por lo que la comparación se limita a parámetros y contexto técnico conocido:

| Modelo | Parámetros | Resolución nativa | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HomeIMG-1.2B-PL-EN-epoch47 | ~1,25 B | 384×384 px | pl, en | Apache 2.0 | Hugging Face (diffusers, custom pipeline) |
| HomeIMG-1.2B-PL-EN-epoch46 | ~1,25 B (misma base) | 256×256 px | pl, en | Apache 2.0 | Hugging Face |
| Modelos de difusión abiertos de gran escala (p. ej. familia SD/FLUX) | No disponible en esta ficha | No disponible | Principalmente inglés | Variables | Hugging Face |

No se han publicado comparaciones cuantitativas (FID, CLIP score, FD-DINOv2) entre este modelo y alternativas en la información disponible.

## Limitaciones y advertencias

- **Calidad inferior a epoch46 a 256 px**: el propio autor indica que para 256 píxeles es mejor usar epoch46; epoch47 presenta desenfoque y peor adherencia al prompt en esa resolución.
- **Imágenes más suaves y menos detalladas**: a 384 px la composición es más limpia que en epoch46, pero las texturas son más blandas y hay menos nitidez y detalle, con una estética típica de las imágenes sintéticas Z-Image.
- **Texto en imágenes**: fuera de palabras cortas en inglés, el texto renderizado es habitualmente ilegible; los letreros en polaco no funcionan.
- **Artefactos en rostros y objetos**: las caras y las figuras pequeñas suelen deformarse, y pueden aparecer objetos fusionados o duplicados (el autor cita un zorro mezclado con un segundo zorro).
- **Descomposición a 768 px**: aunque algunos objetos aislados se mantienen coherentes, las escenas urbanas y los textos se rompen a esa resolución.
- **Riesgo de alucinación visual**: como todo modelo generativo, puede producir contenido plausible pero incorrecto respecto al prompt; no se documentan sesgos específicos, pero al entrenarse con FLUX-Reason-6M y MONET hereda los sesgos de esos conjuntos.
- **Licencia Apache 2.0**: permite uso comercial, pero el modelo se distribuye con `trust_remote_code=True` y pipeline personalizado, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de usarlo en producción.
- **Estado experimental**: es una versión intermedia (epoch47) de una serie en desarrollo, sin métricas de calidad estándar publicadas, por lo que no se recomienda como base de producción sin evaluación propia.
- **Idiomas limitados**: solo polaco e inglés; no se documenta soporte de castellano ni de otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cpral/HomeIMG-1.2B-PL-EN-epoch47
- Modelo predecesor (epoch46): https://huggingface.co/cpral/HomeIMG-1.2B-PL-EN-epoch46
- Modelo base de partida: https://huggingface.co/cpral/Poziomka-Baza-2026-09-05
- Código de entrenamiento: https://github.com/adamo1139/trenowanie_generatora_obrazkow
- Paper RPE-2D: https://arxiv.org/abs/2503.18719
- Dataset FLUX-Reason-6M: https://huggingface.co/datasets/LucasFang/FLUX-Reason-6M
- Dataset de captions en polaco de FLUX-Reason: https://huggingface.co/datasets/cpral/FLUX-Reason-6M-captions-pl
- Dataset MONET: https://huggingface.co/datasets/jasperai/monet
- Dataset de captions en polaco de MONET Z-Image: https://huggingface.co/datasets/cpral/MONET-z-image-captions-pl
