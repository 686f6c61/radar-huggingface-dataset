# cpral/HomeIMG-1.2B-PL-epoch34

## Resumen

HomeIMG-1.2B-PL-epoch34 es un modelo de difusion texto-a-imagen de 1.235 millones de parámetros desarrollado por el usuario cpral, especializado en generación bilingüe polaco-inglés a resolución de 64×64 píxeles. Se trata de un checkpoint intermedio de un currículum de entrenamiento progresivo de resolución (64 → 96 → 128 → 256 px), en el que el autor prioriza el aprendizaje de composición y comprensión del prompt a baja resolución antes de escalar. El modelo parte de las pesos EMA de HomeIMG-1.2B-PL-epoch22 y se entrena durante 12 épocas adicionales exclusivamente a 64×64 px.

La arquitectura es un diffusion transformer con formulación de rectified flow (flow matching), apoyado en un text encoder propio denominado Poziomka (bf16 con expertos en int8) y un VAE derivado del decoder small de FLUX.2. Con solo 16 tokens de imagen por muestra a 64×64 px, el coste por paso es bajo y permite muchas pasadas sobre el dataset, lo que según el autor facilita el aprendizaje de la composición global y la fidelidad al prompt.

Su relevancia es acotada y experimental: no es un modelo para producción en resolución estándar, sino una pieza documentada de un proceso de entrenamiento reproducible (código público en GitHub) que ilustra cómo afecta la resolución al reparto de cómputo entre texto e imagen. A 256×256 px el modelo rinde claramente peor que su predecesor epoch22, por lo que el autor recomienda explícitamente no usarlo a esa resolución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer con rectified flow (flow matching); text encoder Poziomka con expertos en int8; VAE FLUX.2 small decoder |
| Parametros totales | 1.235.000.832 |
| Parametros activos | no disponible (no es un MoE declarado; el text encoder usa expertos en int8) |
| Longitud de contexto | no disponible (prompts de texto; sin ventana de contexto documentada) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; text encoder con expertos en int8) |
| Idiomas soportados | pl, en |
| Licencia | Apache-2.0 (denoiser, refiner y código); text_encoder bajo openmdw-1.1; vae Apache-2.0 (Black Forest Labs) |
| Formato de pesos | safetensors (librería diffusers, custom pipeline AuroraIMG2Pipeline) |

## Arquitectura y entrenamiento

El modelo es un diffusion transformer entrenado con objetivo de rectified flow: `z_t = (1−t)·x + t·ε`, objetivo `ε − x`, pérdida MSE y `t ~ logit-normal(0, 1)`, sin desplazamiento del schedule para baja resolución. El 10% de los prompts se sustituyen por prompt vacío. No emplea REPA. El pipeline incorpora un text encoder propio (Poziomka, en bf16 con expertos cuantizados a int8) con su tokenizer, un refiner y proyecciones K/V de texto en cross-attention, además del VAE basado en el decoder small de FLUX.2.

Los datos de entrenamiento son 5,88 millones de imágenes de QLNI/FLUX-Reason-6M-flux2-latents, reescaladas a 64×64 px: cada latente de 256 px se decodifica con el decoder completo de FLUX.2, se reduce con bicúbico con antialiasing y se recodifica con el encoder de FLUX.2 (latente 4×4×128). El 50% de los captions están en polaco (cpral/FLUX-Reason-6M-captions-pl, traducciones automáticas de un modelo de 2B). El entrenamiento comprende 12 épocas, 17.227 pasos × 4096 = 70,6 millones de muestras, sobre 8× RTX 3090 Ti en bf16, con un throughput de aproximadamente 900–1250 imágenes/s. El optimizador combina MuLoCo (8 réplicas promediadas cada 64 pasos), Muon (CMuon, lr 3e-3, momentum en bf16, Newton-Schulz cada 3 pasos) y AdamW para el resto. El autor señala que a 64 px cerca del 70% del cómputo corresponde al texto (Poziomka, refiner y proyecciones K/V), no a la imagen.

## Capacidades

- Generación de imágenes texto-a-imagen a 64×64 px, resolución de entrenamiento.
- Comprensión de prompts en polaco e inglés, con captions bilingües en el 50% del dataset.
- Composición global de escenas y adherencia al prompt, favorecidas por el entrenamiento prolongado a baja resolución.
- Aceptación del parámetro `resolution` para otros tamaños cuadrados múltiplos de 16, aunque con calidad degradada fuera de 64 px.
- Integración con diffusers mediante pipeline personalizado (`AuroraIMG2Pipeline`) y `trust_remote_code=True`.
- No se documenta soporte de tool calling, agentes, visión de entrada, audio ni modo de razonamiento.

## Casos de uso

- Investigación sobre currículums de resolución: el checkpoint permite estudiar cómo evoluciona la calidad al entrenar a 64 px antes de escalar, comparando con epoch22 y con las siguientes etapas del plan 64 → 96 → 128 → 256 px.
- Prototipado rápido de pipelines de difusión: al generar 64×64 px con 50 pasos y CFG 3,0, sirve para validar código de integración con diffusers y el pipeline AuroraIMG2Pipeline antes de pasar a modelos mayores.
- Generación de miniaturas y placeholders: útil para producir bocetos de composición de muy baja resolución en herramientas de maquetación o interfaces que luego se completan con otro modelo.
- Estudio de sesgos y calidad de captions traducidos: al usar traducciones automáticas al polaco de un modelo de 2B, permite analizar el impacto de la calidad de los captions en la fidelidad bilingüe.
- Reproducción de experimentos de entrenamiento: junto con el repositorio de código, sirve para replicar la configuración MuLoCo/Muon y medir el reparto de cómputo texto/imagen a baja resolución.
- Docencia y divulgación: ejemplo compacto (1,2B parámetros) para explicar rectified flow, flow matching y entrenamiento multi-GPU en hardware consumer (RTX 3090 Ti).

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| EMA val/loss a 64 px | 0,7568 | Velocity MSE sobre 4096 imágenes reservadas, a 64 px; 0,7573 en el paso 16.384 |
| EMA val/loss a 256 px (epoch22) | 0,6170 | No comparable con la métrica a 64 px: distinta escala de tarea |
| FD-DINOv2 | no medido | El autor indica que no se midió |
| Calidad a 256 px | degradada | El autor describe los resultados como "malos" y no aptos para uso |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo de generación de imágenes.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 9,8 GB y los pesos se distribuyen en bf16, por lo que la inferencia completa requiere previsiblemente más de 10 GB de VRAM, pero el dato no está confirmado.
- GPU de entrenamiento documentadas: 8× RTX 3090 Ti en bf16.
- GPU recomendadas para inferencia: no disponible; por tamaño (1,2B) es plausible en GPUs consumer de gama alta, pero el autor no lo especifica.
- Despliegue: diffusers con pipeline personalizado (`DiffusionPipeline.from_pretrained(..., custom_pipeline=REPO, trust_remote_code=True)`); requiere diffusers con `AutoencoderKLFlux2`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de este tipo).
- Latencia y throughput: no disponibles para inferencia; en entrenamiento se reportan 900–1250 imágenes/s en 8× RTX 3090 Ti.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| HomeIMG-1.2B-PL-epoch34 | 1.235M | 64×64 px (solo buena calidad) | pl, en | Apache-2.0 (text encoder openmdw-1.1) | Checkpoint intermedio de currículum |
| HomeIMG-1.2B-PL-epoch22 | 1.235M (12 bloques) | 256×256 px | pl, en | Apache-2.0 (text encoder openmdw-1.1) | Predecesor; recomendado por el autor para 256 px |
| Modelos texto-a-imagen de propósito general (p. ej. FLUX.2, Stable Diffusion) | no disponible en la información | resoluciones estándar (512 px o más) | multilingüe | variables | No se aportan datos comparativos en la información disponible |

No se dispone de comparativas cuantitativas (FD-DINOv2 u otras) con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo genera con calidad aceptable a 64×64 px; a 256×256 px el rendimiento es claramente inferior al de epoch22 y el autor lo desaconseja para uso real.
- A 64 px no hay espacio para detalles: caras, texto y objetos pequeños quedan solo esbozados.
- Es un checkpoint intermedio de currículum, no un modelo final para generación en resolución estándar.
- Los captions en polaco son traducciones automáticas de un modelo de 2B, con los sesgos y errores que ello implica.
- Riesgo de sesgos heredados del dataset FLUX-Reason-6M y de las traducciones; no se documentan evaluaciones de sesgo.
- Riesgo de alucinación visual y de baja fidelidad al prompt en escenas complejas, derivado de la baja resolución.
- Licencia: el denoiser, refiner y código son Apache-2.0, pero `text_encoder/` incluye pesos de Poziomka-Baza bajo openmdw-1.1 y `vae/` es de Black Forest Labs (Apache-2.0); los datos tienen sus propias condiciones. Verificar compatibilidad antes de uso comercial.
- Requiere `trust_remote_code=True` y un pipeline personalizado, lo que implica ejecutar código del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cpral/HomeIMG-1.2B-PL-epoch34
- Checkpoint previo (epoch22): https://huggingface.co/cpral/HomeIMG-1.2B-PL-epoch22
- Text encoder Poziomka-Baza: https://huggingface.co/cpral/Poziomka-Baza-2026-09-05
- Dataset de latentes: https://huggingface.co/datasets/QLNI/FLUX-Reason-6M-flux2-latents
- Dataset de captions en polaco: https://huggingface.co/datasets/cpral/FLUX-Reason-6M-captions-pl
- Código de entrenamiento: https://github.com/adamo1139/trenowanie_generatora_obrazkow
