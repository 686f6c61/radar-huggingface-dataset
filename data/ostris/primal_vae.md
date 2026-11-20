# ostris/primal_vae

## Resumen

Primal VAE es un autoencoder variacional (VAE) para difusión latente desarrollado por ostris (autor de ai-toolkit) que propone una alternativa ligera a los VAE de compresión profunda que usan los modelos de difusión modernos. En lugar de comprimir la imagen 8x con una red grande, Primal VAE solo comprime 2x o 4x con una red pequeña (~80M parámetros en las variantes 2x, ~122M en la 4x1) y deja que el DiT del modelo de difusión haga el patchify adicional hasta la forma latente que espera.

La innovación principal es que el latente se entrena para tener estadísticos de ruido gaussiano directamente en la función de pérdida, sin término KL, sin posterior y sin factores de escalado o desplazamiento. Esto permite sustituir el VAE original de Flux.1, Flux.2 o SDXL por este modelo sin arrastrar `scaling_factor` ni normalización batch-norm del latente: se codifica, se hace patchify y se difunde.

El modelo se publica bajo licencia Apache 2.0, con pesos en safetensors (repo de 1,5 GB) y código personalizado cargable vía `diffusers` con `trust_remote_code=True`. Está pensado para investigadores que quieran experimentar con VAEs más pequeños, entrenamientos más estables y latentes con distribución controlada, así como para integraciones en pipelines existentes de Flux y SDXL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conv U-Net simétrica de 4 niveles con downs/ups por `pixel_unshuffle`/`pixel_shuffle` + conv 3x3, bloques residuales con dilataciones cíclicas 1, 2, 4, normalización RMSNorm por canales |
| Parametros totales | ~80M (variantes 2x1 y 2x2), ~122M (variante 4x1) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | No disponible (los pesos se publican en safetensors; el uso documentado es bfloat16) |
| Idiomas soportados | No disponible (modelo de imagen, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`primal_vae_<variant>.safetensors`), cargable con `diffusers.AutoModel` |

## Arquitectura y entrenamiento

La red es una U-Net convolucional simétrica de cuatro niveles. La entrada pasa por un `pixel_unshuffle(compression)` que convierte RGB en 12 canales a 1/2 de resolución (modelos 2x) o 48 canales a 1/4 (modelo 4x1); todo el cómputo ocurre a resolución latente o inferior. Los bloques de down y up son `pixel_unshuffle`/`pixel_shuffle` seguidos de convolución 3x3, con bloques residuales de dilataciones 1, 2, 4. Las anchuras son 96/192/384/384 con profundidades 1/1/2/4 (2x) y 192/384/384/384 con profundidades 2/2/2/4 (4x1). La normalización es RMSNorm por canales en cada posición, sin estadísticos espaciales ni atención, de modo que el modelo es invariante al mosaico con solapamiento. El encoder termina en una convolución 3x3 plana a 1 o 2 canales: no hay posterior, ni KL, ni convoluciones de cuantización.

El entrenamiento sustituye el término KL habitual por dos pérdidas directas sobre la salida del encoder: una *moment loss* (`mean² + (std - 1)²`, peso 0,1) calculada por imagen y por canal, y una *Gaussian order-statistic loss* que ordena los valores del latente y los compara por MSE con los estadísticos de orden esperados de una normal estándar (aproximación de Blom). La 2x1 pasó sus primeros 53k pasos con la moment loss agrupada por batch y los últimos 9k por imagen; la 2x2 y la 4x1 la usaron por imagen durante todo el entrenamiento. No se documentan en la información disponible el número total de tokens de imagen, la composición del dataset ni si hubo etapas de RLHF o DPO (no aplicables a un VAE).

## Capacidades

- Codificación y decodificación de imágenes RGB en `[-1, 1]` con lados múltiplos de 16 (modelos 2x) o 32 (modelo 4x1).
- Producción de latentes aproximadamente `N(0, 1)` por imagen y por canal, sin `scaling_factor`, sin `shift_factor` y sin normalización batch-norm que arrastrar.
- `patchify` / `unpatchify` configurables con compresión total arbitraria (por ejemplo `compression=8`), implementados como `pixel_unshuffle` / `pixel_shuffle` por `compression / <model compression>`.
- Compatibilidad de forma latente con Flux.1 VAE (2x1: 16 canales a 8x con patch 4x4), Flux.2 VAE (2x2: 32 canales a 8x con patch 4x4) y SD 1.5 / SDXL VAE (4x1: 4 canales a 8x con patch 2x2).
- Carga de checkpoints de ai-toolkit mediante `weights_name="my_finetune.safetensors"`, con arquitectura inferida de las formas de los tensores.
- `enable_gradient_checkpointing()` para backpropagar a través de `decode` en pérdidas en espacio de píxel, con checkpointing en cada bloque residual de ambas U-Nets; la inferencia bajo `torch.no_grad()` no se ve afectada.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un componente de un pipeline de difusión, no un modelo de lenguaje.

## Casos de uso

- Sustitución directa del VAE de Flux.1 en un `FluxPipeline`: se carga la variante `2x1`, se codifica la imagen, se hace `patchify(compression=8)` y se pasan los tokens a `_pack_latents`; el pipeline deja de necesitar `scaling_factor` y `shift_factor`.
- Sustitución del VAE de Flux.2 en pipelines existentes: la variante `2x2` produce 32 canales a 8x, encajando antes del patchify 2x2 propio de Flux.2 a 128 canales, y permite omitir la normalización batch-norm del latente.
- Sustitución del VAE de SD 1.5 / SDXL: la variante `4x1` genera 4 canales a 8x con patch 2x2, eliminando los factores 0,18215 y 0,13025 del pipeline.
- Entrenamiento de modelos de difusión con VAEs pequeños: al tener ~80M parámetros y no requerir KL ni factores post-hoc, reduce el coste de memoria y simplifica el pipeline de entrenamiento.
- Fine-tuning de VAEs con ai-toolkit: el código de carga infiere la arquitectura de las formas de los tensores, por lo que un checkpoint fine-tuneado se carga sin tocar el código.
- Procesamiento por mosaicos (tiling): al usar solo RMSNorm por canales y no atención ni estadísticos espaciales, codificar y decodificar mosaicos con solapamiento produce resultados equivalentes a la imagen completa, útil para imágenes de alta resolución en GPUs modestas.
- Backprop a través del decoder para pérdidas en espacio de píxel: `enable_gradient_checkpointing()` permite entrenar un DiT con pérdida de reconstrucción sin agotar la memoria.
- Investigación sobre distribución latente: la combinación de moment loss y order-statistic loss permite estudiar cómo afecta la forma exacta de la distribución latente al entrenamiento de modelos de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye ejemplos visuales cualitativos (fila de entrada, reconstrucción, latente y error absoluto ×4, comparados con los VAE de referencia Flux.1 con el mismo layout latente), pero no cifras de PSNR, LPIPS, FID ni métricas de reconstrucción cuantificadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con ~80M parámetros (2x) en bfloat16, los pesos ocupan del orden de 160 MB; con ~122M (4x1), del orden de 245 MB. El consumo real depende de la resolución de la imagen y del tamaño de los mosaicos.
- GPU recomendadas: no especificadas en la información disponible. El uso documentado es `.to("cuda")` con `torch_dtype=torch.bfloat16`, lo que requiere GPU con soporte bfloat16 (Ampere o posterior: A100, H100, RTX 30xx/40xx).
- Cabe en GPU de consumo: sí, por el tamaño reducido de los pesos; el factor limitante es la resolución de imagen procesada simultáneamente, no el modelo.
- Opciones de despliegue: `diffusers` con `AutoModel.from_pretrained(..., trust_remote_code=True)`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un VAE de imagen).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Compresión | Canales latentes | Forma latente a 8x | Licencia |
|---|---|---|---|---|---|
| Primal VAE 2x1 | ~80M | 2x | 1 | 16 ch (patch 4x4) | Apache 2.0 |
| Primal VAE 2x2 | ~80M | 2x | 2 | 32 ch (patch 4x4) | Apache 2.0 |
| Primal VAE 4x1 | ~122M | 4x | 1 | 4 ch (patch 2x2) | Apache 2.0 |
| Flux.1 VAE | No disponible | 8x | 16 | 16 ch | No disponible en la información |
| Flux.2 VAE | No disponible | 8x | 32 | 32 ch | No disponible en la información |
| SD 1.5 / SDXL VAE | No disponible | 8x | 4 | 4 ch | No disponible en la información |

La comparativa se limita al layout latente, que es el dato documentado en la model card. No se dispone de parámetros, licencias ni métricas de reconstrucción de los VAE de referencia en la información proporcionada.

## Limitaciones y advertencias

- Requiere `trust_remote_code=True`: el modelo usa código personalizado que se ejecuta en el entorno del usuario; conviene auditar el código antes de desplegarlo en producción.
- Restricción de resolución: los lados de la imagen deben ser múltiplos de 16 (variantes 2x) o 32 (variante 4x1); no se documenta comportamiento con otras resoluciones.
- El modelo no incluye atención ni estadísticos espaciales; la equivalencia entre mosaicos y imagen completa se afirma "dado cierto solapamiento", pero no se cuantifica el solapamiento mínimo necesario.
- No hay término KL ni posterior: el latente es determinista en la práctica, lo que limita su uso como VAE generativo en sentido estricto (no se documenta muestreo del posterior).
- No se documentan sesgos de datos de entrenamiento, composición del dataset ni evaluación de sesgos demográficos o culturales en las reconstrucciones.
- Riesgo de artefactos de reconstrucción en imágenes fuera de la distribución de entrenamiento: no se han publicado métricas de fidelidad (PSNR, LPIPS) que permitan acotarlo.
- No se documentan limitaciones idiomáticas ni de contexto porque el modelo no procesa texto.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se debe conservar el aviso de licencia y el aviso de cambios; no se documentan restricciones adicionales del autor.
- Al sustituir el VAE de un pipeline de difusión, es necesario eliminar los factores de escalado y normalización originales; mantenerlos produciría latentes fuera de la distribución esperada por el DiT.

## Enlaces

- Hugging Face: https://huggingface.co/ostris/primal_vae
- ai-toolkit (mencionado en la model card como origen de checkpoints compatibles): no disponible en la información proporcionada
- Paper, blog o repositorio adicionales: no disponibles en la información proporcionada
