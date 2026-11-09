# cpral/HomeIMG-1.2B-PL-EN-epoch46

## Resumen

HomeIMG-1.2B-PL-EN-epoch46 es un generador de imágenes texto-a-imagen bilingüe (polaco e inglés) desarrollado por el usuario independiente cpral. Se trata de un denoiser DiT (Diffusion Transformer) de 1.246.802.432 parámetros entrenado desde cero sobre 8 tarjetas RTX 3090 Ti domésticas, condicionado por un modelo de lenguaje MoE de 4B congelado (Poziomka-Baza) a través de un refiner entrenable de 72,1M de parámetros. El modelo está diseñado para generar imágenes en resoluciones bajas y medias (64 a 512 px) con un currículum de resolución progresivo.

La relevancia de este modelo radica en su enfoque técnico: emplea flow matching con rectified flow y posiciones RoPE aleatorias en estilo RPE-2D (Hou et al., 2025) desde la etapa de 128 px, lo que permite generar imágenes coherentes en resoluciones superiores a las de entrenamiento (384 y 512 px) sin un entrenamiento específico en esas resoluciones. El modelo alcanza un val/loss de 0,6067 en 256 px, el mejor resultado de la familia HomeIMG hasta la fecha.

El repositorio incluye el text encoder completo (Poziomka, 4,1 GB en bf16 con expertos en int8) y su tokenizer, por lo que es autocontenido. Está publicado bajo licencia Apache 2.0 y se integra con la librería diffusers mediante el pipeline personalizado `AuroraIMG2Pipeline`. El modelo se distribuye como un checkpoint de fine-tuning sobre `cpral/HomeIMG-1.2B-PL-EN-epoch43`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con flow matching / rectified flow, condicionado por text encoder MoE congelado y refiner entrenable |
| Parámetros totales | 1.246.802.432 (denoiser); refiner adicional de 72,1M; text encoder Poziomka de 4B congelado |
| Parámetros activos | No disponible (el denoiser no es MoE; el text encoder Poziomka es MoE de 4B pero está congelado) |
| Longitud de contexto | No disponible (modelo de imagen; no aplica ventana de contexto textual de forma directa) |
| Tipos de cuantización | bf16 (entrenamiento e inferencia); expertos del text encoder en int8; no se documentan otras cuantizaciones |
| Idiomas soportados | Polaco (pl), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (diffusers); repo de 9,9 GB |

## Arquitectura y entrenamiento

El modelo es un Diffusion Transformer (DiT) que actúa como denoiser dentro de un esquema de flow matching con rectified flow. El objetivo de entrenamiento es `z_t = (1−t)·x + t·ε` con target `ε − x`, MSE, `t ~ logit-normal(0, 1)`, sin desplazamiento de schedule, y un 10% de prompts sustituidos por vacío. El denoiser está condicionado por el modelo de lenguaje Poziomka-Baza (MoE polaco-inglés de 4B, congelado, expertos en int8) mediante un refiner entrenable de 72,1M de parámetros. No se emplea REPA.

El entrenamiento siguió un currículum de resolución progresivo: 12 épocas a 64 px, 6 a 96 px, 3 a 128 px y 3 a 256 px, cada etapa partiendo de los pesos EMA de la anterior. Desde la etapa de 128 px se usan posiciones RoPE aleatorias en estilo RPE-2D: para cada eje se muestrean 16 enteros distintos de 0 a 63, ordenados, y la rejilla es su producto cartesiano, de modo que el modelo aprende el orden de los tokens y no distancias fijas. Además se aplica micro-condicionamiento (tamaño original, recorte y resolución destino como 8 números en píxeles, codificados con sinusoides tipo SDXL y un MLP pequeño con salida inicializada a cero) sumado al embedding de tiempo; los recortes solo se usaron en la etapa de 128 px (ventanas de 128×128 px extraídas de latentes de 256 px). Los datos provienen de `QLNI/FLUX-Reason-6M-flux2-latents` (5,88 millones de imágenes a 256 px), con captions en un 50% en polaco. La etapa final supuso 3 épocas, 8750 pasos × 2016 = 17,6 millones de muestras, con optimizador MuLoCo (7 réplicas promediadas cada 64 pasos), Muon (CMuon, lr 3e-3, momentum en bf16, Newton-Schulz cada 3 pasos) y AdamW para el resto. El entrenamiento se realizó en 8× RTX 3090 Ti en bf16, con 7 tarjetas entrenando y una calculando Poziomka, a unas 260 imágenes/s y aproximadamente 18 horas.

## Capacidades

- Generación de imágenes texto-a-imagen bilingüe polaco-inglés.
- Generación en resolución de entrenamiento de 256×256 px con calidad óptima.
- Generación en resoluciones superiores a la de entrenamiento (384 y 512 px) con imágenes coherentes y un objeto principal y un horizonte, gracias a las posiciones RoPE aleatorias RPE-2D.
- Generación en resolución inferior (128 px), aunque con calidad claramente inferior a 256 px.
- Condicionamiento mediante captions en polaco o inglés, con captions de entrenamiento en un 50% en polaco.
- Soporte de muestreo con 50 pasos de Euler y CFG 3,0 según la model card; pesos EMA disponibles.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking (es un modelo de generación de imágenes, no un LLM conversacional).

## Casos de uso

- Generación de ilustraciones y conceptos a 256 px para prototipado rápido: el modelo produce imágenes coherentes en su resolución de entrenamiento con 50 pasos de Euler y CFG 3,0, adecuado para iterar ideas en pipelines de diseño.
- Generación de imágenes en polaco: al estar entrenado con un 50% de captions en polaco y usar un text encoder polaco-inglés, permite escribir prompts directamente en polaco sin traducción previa, algo poco habitual en modelos texto-a-imagen.
- Pruebas de investigación sobre generalización de resolución: las posiciones RoPE aleatorias RPE-2D permiten estudiar cómo un modelo entrenado a 256 px generaliza a 384 y 512 px, útil para experimentos académicos sobre extrapolación de resolución en DiT.
- Generación de imágenes a 512 px para fondos y escenas simples: la model card reporta imágenes nítidas y coherentes con un objeto principal y un horizonte, adecuadas para escenas sencillas aunque con riesgo de duplicaciones.
- Fine-tuning sobre un dominio concreto: al ser un checkpoint Apache 2.0 con repo autocontenido (text encoder y tokenizer incluidos), sirve como base para ajustar un generador bilingüe a un estilo o dominio específico en hardware de consumo.
- Reproducción de experimentos de entrenamiento doméstico: el código de entrenamiento publicado (`train_pp.py`) y el currículum documentado permiten replicar el pipeline en GPUs de consumo (8× RTX 3090 Ti), útil para investigadores con presupuesto limitado.
- Generación de imágenes a 128 px para miniaturas o previews: aunque la calidad es inferior a 256 px, el modelo puede producir previews rápidas en resoluciones bajas dentro de un pipeline de generación por etapas.

## Benchmarks y rendimiento

La model card reporta val/loss (velocity MSE sobre 4096 imágenes reservadas a 256 px, captions en inglés, ruido y t fijos) comparado con versiones anteriores de la familia:

| Modelo | val/loss (256 px) |
|---|---|
| HomeIMG-641M-PL-EN-epoch19 | 0,6277 |
| HomeIMG-1.2B-PL-EN-epoch22 | 0,6170 |
| HomeIMG-1.2B-PL-EN-epoch46 (EMA, este repo) | 0,6067 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, FID, FD-DINOv2) en la información disponible. La model card indica explícitamente que FD-DINOv2 no fue medido.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 10 GB según la model card (repo de 9,9 GB, con text encoder Poziomka de 4,1 GB en bf16 y expertos en int8).
- GPU recomendadas: RTX 3090 Ti (usadas en entrenamiento), así como GPUs con al menos 10-12 GB de VRAM; A100 y H100 son compatibles pero sobredimensionadas para un modelo de 1,2B.
- Cabe en GPU de consumo: sí, en RTX 3090, 3090 Ti, 4080, 4090 y modelos con 12 GB o más de VRAM; en GPUs de 8 GB requeriría cuantización adicional no documentada.
- Opciones de despliegue: diffusers con `AutoencoderKLFlux2` y el pipeline personalizado `AuroraIMG2Pipeline` (custom_code); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión).
- Latencia y throughput: no disponible para inferencia; en entrenamiento se reportan unas 260 imágenes/s con 8× RTX 3090 Ti en bf16.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Idiomas | Licencia | Contexto / notas |
|---|---|---|---|---|---|
| HomeIMG-1.2B-PL-EN-epoch46 | 1,25B (denoiser) + 4B (text encoder congelado) | 64–512 px (entrenado a 256 px) | pl, en | Apache 2.0 | val/loss 0,6067 a 256 px; bilingüe polaco-inglés |
| HomeIMG-1.2B-PL-EN-epoch22 | 1,2B | 256 px | pl, en | Apache 2.0 | val/loss 0,6170 a 256 px; versión anterior de la misma familia |
| HomeIMG-641M-PL-EN-epoch19 | 641M | 256 px | pl, en | Apache 2.0 | val/loss 0,6277 a 256 px; versión más pequeña de la familia |
| Modelos texto-a-imagen de propósito general (p. ej. SDXL, FLUX) | No disponible en la información proporcionada | No disponible | Principalmente inglés | Varía | No se dispone de datos comparativos en la información proporcionada |

No se dispone de comparaciones con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Resolución de entrenamiento limitada a 256 px; a 128 px la calidad es claramente inferior y a 384-512 px aparecen duplicaciones de objetos (por ejemplo, dos astronautas a caballo a 384 px o cuatro niños en lugar de dos a 512 px).
- Riesgo de alucinación visual y de composiciones incoherentes en escenas complejas, especialmente fuera de la resolución de entrenamiento.
- Sesgos conocidos: no documentados en la información proporcionada; al entrenarse sobre FLUX-Reason-6M pueden heredarse sesgos del dataset original.
- Limitaciones de idioma: solo polaco e inglés; no se documenta soporte de otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Poziomka-Baza y los datasets de entrenamiento pueden tener sus propias condiciones que deben verificarse.
- Requiere diffusers con `AutoencoderKLFlux2` y código personalizado (`AuroraIMG2Pipeline`), lo que puede complicar el despliegue en entornos estándar.
- El modelo se distribuye como checkpoint de fine-tuning sobre epoch43; no se documenta una evaluación independiente de sesgos ni de seguridad.
- Sin métricas estándar de calidad de imagen (FID, FD-DINOv2) publicadas, lo que limita la comparación objetiva con otros generadores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cpral/HomeIMG-1.2B-PL-EN-epoch46
- Modelo base (epoch43): https://huggingface.co/cpral/HomeIMG-1.2B-PL-EN-epoch43
- Text encoder Poziomka-Baza: https://huggingface.co/cpral/Poziomka-Baza-2026-09-05
- Dataset de latentes: https://huggingface.co/datasets/QLNI/FLUX-Reason-6M-flux2-latents
- Dataset de captions en polaco: https://huggingface.co/datasets/cpral/FLUX-Reason-6M-captions-pl
- Paper RPE-2D: https://arxiv.org/abs/2503.18719
- Código de entrenamiento: https://github.com/adamo1139/trenowanie_generatora_obrazkow
- Versión anterior epoch22: https://huggingface.co/cpral/HomeIMG-1.2B-PL-EN-epoch22
- Versión anterior epoch19 (641M): https://huggingface.co/cpral/HomeIMG-641M-PL-EN-epoch19
- Versión anterior epoch34: https://huggingface.co/cpral/HomeIMG-1.2B-PL-EN-epoch34
- Versión anterior epoch40: https://huggingface.co/cpral/HomeIMG-1.2B-PL-EN-epoch40
