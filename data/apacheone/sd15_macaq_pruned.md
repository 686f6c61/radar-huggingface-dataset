# ApacheOne/SD15_MACaQ_pruned

## Resumen

SD15_MACaQ_pruned es una versión cuantizada del modelo de difusión Stable Yogi SD 1.5 V9 LCM, una variante de Stable Diffusion 1.5 afinada con destilación LCM (Latent Consistency Model) para generación de imágenes en pocos pasos. El modelo lo publica el usuario ApacheOne en Hugging Face y aplica sobre el U-Net original la técnica de cuantización MACaQ (Mixed-precision Activation and Channel-wise Quantization), desarrollada por Huawei CSL, que combina pesos MXFP4 (W4A4) con escalas por canal y matrices de calibración en BF16.

El objetivo es reducir drásticamente el almacenamiento y la huella de memoria del U-Net sin alterar sus dimensiones de capa: se pasa de 1,719 GB en FP16 a 466,96 MB, un 72,8 % menos, manteniendo CLIP y VAE en FP16. El conjunto de pesos combinado ocupa 880,64 MB. Es relevante para despliegues en hardware con VRAM limitada o en entornos donde el ancho de banda de memoria es el cuello de botella, ya que permite ejecutar un pipeline text-to-image completo en espacios muy reducidos.

La model card documenta el proceso de calibración con tres recetas (`diverse_32p_128r`, `diverse_32p_256r` y `original_12p_128r`) y compara la fidelidad frente al modelo FP16 mediante SSIM sobre validación, además de pares de imágenes de comparación con semillas fijas. No se publican datos de arquitectura más allá de la herencia de SD 1.5, ni información sobre el dataset de entrenamiento original de Stable Yogi.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | U-Net de difusión latente (herencia de Stable Diffusion 1.5) con cuantización MACaQ; CLIP y VAE en FP16 |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; resolución de trabajo 512×512) |
| Tipos de cuantización | MXFP4 W4A4 en el U-Net (pesos empaquetados U8 con escalas U8 y matrices BF16); FP16 en CLIP y VAE |
| Idiomas soportados | no disponible |
| Licencia | stable-yogi-source-terms (licencia `other`, enlazada a Civitai) |
| Formato de pesos | safetensors (repo de 0,9 GB; inventario de tensores en `sd15_macaq_unet_layers.json`) |

## Arquitectura y entrenamiento

El modelo parte de Stable Yogi SD 1.5 V9 LCM, una variante de SD 1.5 destilada con LCM que permite generar imágenes en 4 pasos con CFG 1,2. Sobre ese checkpoint se aplica MACaQ, un esquema de cuantización mixta que mantiene las dimensiones originales de cada capa del U-Net pero almacena los pesos en MXFP4 (W4A4): cada tensor cuantizado incluye `W_packed` en U8, `W_scales` en U8, `pre_scale` en BF16 y una matriz `B_inv_T` en BF16 de 32×32, mientras que sesgos y normas se conservan en F16 o BF16. Las capas de normalización y `conv_norm_out` permanecen en F16.

La calibración se realizó con tres recetas y se evaluó mediante SSIM medio sobre validación. La receta seleccionada, `diverse_32p_128r`, obtiene 0,5196 de SSIM medio, frente a 0,5131 de `diverse_32p_256r` y 0,4619 de `original_12p_128r`. La model card indica que la ejecución de comparación en una GPU L4 usó redondeo FP4 con multiplicación de matrices en BF16. No se detalla el número de tokens, la composición del dataset de calibración ni si hubo etapas de RLHF o DPO, ya que el modelo es de generación de imágenes y no de lenguaje.

## Capacidades

- Generación de imágenes text-to-image a 512×512 píxeles.
- Generación en pocos pasos gracias a la destilación LCM: 4 pasos con CFG 1,2 según la configuración documentada.
- Cuantización W4A4 del U-Net con escalas por canal y matrices de calibración BF16.
- Conservación de las dimensiones originales de las capas del U-Net, lo que facilita la integración en pipelines compatibles con SD 1.5.
- CLIP y VAE en FP16 para preservar la calidad de codificación de texto y decodificación de latentes.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking, por tratarse de un modelo de difusión para imágenes.
- El soporte multilingüe del codificador de texto depende de CLIP, pero no se especifica en la model card.

## Casos de uso

- Despliegue en GPUs de consumo con VRAM limitada: al reducir el U-Net a 466,96 MB, el pipeline completo (880,64 MB) puede residir en GPUs de gama baja o en entornos con memoria compartida, manteniendo CLIP y VAE en FP16.
- Generación rápida en producción: la configuración LCM de 4 pasos con CFG 1,2 reduce el coste computacional por imagen, adecuada para servicios de generación de miniaturas o borradores visuales.
- Prototipado de interfaces creativas: útil para herramientas de diseño que necesitan respuestas en tiempo real con presupuestos de memoria ajustados.
- Inferencia en el borde (edge) o en contenedores con límites estrictos de memoria: el tamaño combinado inferior a 1 GB facilita el empaquetado en imágenes de contenedor ligeras.
- Evaluación de técnicas de cuantización: sirve como referencia práctica para comparar MACaQ frente a otros esquemas (GPTQ, AWQ, bitsandbytes) en modelos de difusión.
- Investigación sobre fidelidad de cuantización: los pares de imágenes con semillas fijas y las puntuaciones SSIM permiten reproducir experimentos de degradación visual.
- Generación de imágenes condicionada por texto en entornos educativos o de demostración donde el hardware disponible es una GPU L4 o similar.

## Benchmarks y rendimiento

| Receta | SSIM medio de validación |
|---|---:|
| `diverse_32p_128r` | 0,5196 |
| `diverse_32p_256r` | 0,5131 |
| `original_12p_128r` | 0,4619 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, FID, CLIP score) en la información disponible. Los únicos datos cuantitativos son las puntuaciones SSIM de validación y las comparaciones visuales con semillas 7001-7006 y 8101-8104.

## Requisitos de hardware

- VRAM estimada para inferencia: el U-Net cuantizado ocupa 466,96 MB; el conjunto combinado con CLIP y VAE en FP16 es de 880,64 MB, por lo que se puede ejecutar en GPUs con 2-4 GB de VRAM efectiva, dependiendo del framework y de los buffers de activación.
- GPU recomendadas: la model card menciona una ejecución en NVIDIA L4; también es viable en RTX 4090, A100 y H100, aunque en estas el beneficio principal es el ahorro de memoria y ancho de banda, no la velocidad bruta.
- Cabe en GPUs de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4070 y superiores, así como en GPUs integradas con memoria unificada suficiente, siempre que el runtime soporte MXFP4.
- Opciones de despliegue: no se especifican en la model card; el soporte de MXFP4 W4A4 requiere runtimes compatibles con MACaQ (repositorio huawei-csl/MACaQ). Diffusers, ComfyUI o llama.cpp no se mencionan explícitamente.
- Latencia y throughput: no disponibles. La configuración LCM de 4 pasos sugiere una latencia baja, pero no se aportan medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SD15_MACaQ_pruned | no disponible | 512×512 | MXFP4 W4A4 en U-Net | stable-yogi-source-terms | Hugging Face (ApacheOne) |
| Stable Diffusion 1.5 (original) | ~860 M en U-Net | 512×512 | FP16 / FP32 | CreativeML OpenRAIL-M | Hugging Face, ampliamente disponible |
| Stable Diffusion 1.5 LCM | ~860 M en U-Net | 512×512 | FP16 | CreativeML OpenRAIL-M (según variante) | Hugging Face, Civitai |
| SD 1.5 cuantizado con bitsandbytes (INT8/FP4) | ~860 M en U-Net | 512×512 | INT8 / NF4 | según checkpoint base | Hugging Face, Diffusers |

No se dispone de datos de rendimiento comparativo (FID, CLIP score) entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La licencia `stable-yogi-source-terms` es una licencia `other` enlazada a Civitai; es imprescindible revisar sus términos antes de cualquier uso comercial, ya que puede imponer restricciones adicionales a las de CreativeML OpenRAIL-M.
- La cuantización MXFP4 W4A4 introduce degradación visual medible: el SSIM medio de validación es 0,5196, lo que indica diferencias apreciables respecto al FP16 en detalles finos, texturas y composiciones complejas.
- El modelo hereda los sesgos y limitaciones de Stable Diffusion 1.5 y de Stable Yogi SD 1.5 V9 LCM, incluyendo sesgos demográficos y culturales en la generación de personas y escenas.
- Riesgo de alucinación visual: puede generar elementos incoherentes, anatomías incorrectas o texto ilegible, especialmente en resoluciones distintas de 512×512.
- La resolución de trabajo documentada es 512×512; no se garantiza calidad fuera de ese rango.
- El soporte de MXFP4 depende de runtimes específicos; la falta de soporte en herramientas populares puede limitar su adopción en producción.
- No se especifican idiomas soportados ni el comportamiento del codificador CLIP en castellano; se recomienda validar prompts en el idioma objetivo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.
- No se documentan métricas de latencia ni throughput, lo que impide estimar costes operativos con precisión.

## Enlaces

- Hugging Face: https://huggingface.co/ApacheOne/SD15_MACaQ_pruned
- Modelo base en Civitai: https://civitai.com/models/166609?modelVersionId=1235013
- Repositorio MACaQ (Huawei CSL): https://github.com/huawei-csl/MACaQ
- Inventario de tensores del U-Net: `sd15_macaq_unet_layers.json` (en el repositorio)
- Puntuaciones de calibración: `calibration_sweep.json` (en el repositorio)
