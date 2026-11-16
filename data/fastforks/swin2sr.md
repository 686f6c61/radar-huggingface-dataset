# fastforks/swin2sr

## Resumen

Swin2SR es un modelo de restauración y superresolución de imágenes presentado por Conde et al. en ECCVW 2022. Combina la arquitectura SwinIR con capas de Swin Transformer V2 (atención coseno escalada, sesgo de posición continuo con espaciado logarítmico y post-normalización residual) organizadas en grupos residuales entre un extractor convolucional inicial y un módulo de upsampling. El repositorio `fastforks/swin2sr` no aloja pesos: es una model card que documenta el empaquetado del modelo dentro del framework fastforks, que descarga los pesos originales de los autores y los verifica mediante SHA-256.

El modelo resuelve dos tareas diferenciadas: superresolución clásica (x2 y x4) sobre imágenes degradadas con submuestreo bicúbico, y superresolución en condiciones reales (x4) entrenada con degradaciones BSRGAN. Está pensado para pipelines de restauración de imagen, no para generación de texto ni tareas multimodales, y su salida es una imagen RGB en el rango [0, 1] con un factor de escala fijo según la variante.

La relevancia de este repositorio radica en el empaquetado de rendimiento: fastforks ofrece backends `portable` y `kernels` que aceleran la inferencia entre 3,4x y 3,9x respecto al código original, con soporte para `torch.compile` y TensorRT. El modelo es experimental según la propia card y está liberado bajo Apache-2.0, incluyendo los pesos de las tres variantes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Swin Transformer V2 en grupos residuales (Swin2SR, basada en SwinIR) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantización | fp16 (soporte principal); fp32 en el código original; sin cuantizaciones de pesos documentadas |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | Apache-2.0 (código y pesos de las tres variantes) |
| Formato de pesos | `.pth` (PyTorch), descargados desde los releases del repositorio original |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de Swin2SR: un extractor convolucional inicial que proyecta la imagen de entrada a un espacio de características, seguido de varios grupos residuales compuestos por bloques Swin Transformer V2. Estos bloques incorporan atención coseno escalada, sesgo de posición continuo con espaciado logarítmico y post-normalización residual, mejoras introducidas en Swin V2 respecto a Swin V1. La salida pasa por un módulo de upsampling que aplica el factor de escala correspondiente (x2 o x4). La entrada puede ser cualquier imagen de al menos 32x32 píxeles, con padding interno a múltiplos de 32.

El entrenamiento se realizó sobre DIV2K (1000 imágenes 2K del desafío NTIRE 2017) y Flickr2K (2650 imágenes 2K de Flickr, del dataset EDSR), con el protocolo de SwinIR para superresolución clásica: las imágenes de alta resolución se submuestrean bicúbicamente para generar los pares LR-HR. La variante `swin2sr-x4-real` se entrena con degradaciones BSRGAN para aproximarse a condiciones reales. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de restauración de imagen.

## Capacidades

- Superresolución de imagen x2 con la variante `swin2sr-x2` (entrenada con submuestreo bicúbico).
- Superresolución de imagen x4 con la variante `swin2sr-x4` (entrenada con submuestreo bicúbico).
- Superresolución x4 en condiciones reales con `swin2sr-x4-real`, entrenada con degradaciones BSRGAN.
- Procesamiento por teselas (`tile=`) para imágenes grandes, con solapamiento entre teselas al estilo de ComfyUI.
- Entrada RGB única; salida RGB en [0, 1] escalada por `model.scale`.
- Soporte de dos backends: `portable` (PyTorch) y `kernels` (kernels optimizados publicados en `fastforks/kernels`).
- Compatibilidad con `torch.compile` y exportación a ONNX con motor TensorRT fp16.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente image-to-image.

## Casos de uso

- Restauración de fotografías antiguas o de baja resolución: la variante `swin2sr-x4-real` está entrenada con degradaciones BSRGAN, lo que la hace adecuada para imágenes del mundo real con ruido, desenfoque y compresión, no solo para submuestreo bicúbico.
- Mejora de miniaturas y assets web: aplicar `swin2sr-x2` sobre imágenes de 512x512 permite obtener 1024x1024 en torno a 0,9 s en una RTX 5060 Ti 16 GB con el backend `portable`, lo que encaja en pipelines de generación de assets por lotes.
- Reescalado previo a impresión o visualización en pantallas de alta densidad: `swin2sr-x4` parte de una imagen LR y produce una HR con PSNR de 30,89 dB en la validación de DIV2K, útil cuando se necesita un factor 4 conservador y fiel al original.
- Preprocesado para pipelines de visión por computador: aumentar la resolución de imágenes de entrada antes de un detector o segmentador que rinda mejor con más píxeles, usando el modo `tile=` para imágenes grandes y evitando el OOM.
- Restauración dentro de flujos de ComfyUI: el modo de teselado replica el comportamiento de ComfyUI, lo que facilita integrar el modelo como nodo de upscaling en flujos de generación de imagen existentes.
- Despliegue con TensorRT en producción: la exportación a ONNX + motor TensorRT fp16 reduce el tiempo de 512x512 a unos 547-562 ms (frente a 909-958 ms en `portable`), con un coste de preparación de 112-128 s, adecuado para servicios con tráfico sostenido.
- Procesamiento por lotes en GPU de consumo: con 1,4-2,4 GiB de memoria pico asignada en 512x512, el modelo cabe en GPUs consumer de 8 GB o más, incluyendo el modo teselado para imágenes de hasta 1024x2048 (probado con 10,9-13,1 GiB pico asignados en una RTX 5060 Ti 16 GB).

## Benchmarks y rendimiento

Rendimiento de inferencia en 512x512 (RTX 5060 Ti 16 GB, sm_120), según la model card:

| Modelo | Tiempo original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Memoria pico portable (MiB, asignada/reservada) |
|---|---|---|---|---|---|
| `swin2sr-x2` | 2565 | 909 | 720 | 3,6x | 1459 / 1554 |
| `swin2sr-x4` | 2922 | 932 | 745 | 3,9x | 1463 / 2276 |
| `swin2sr-x4-real` | 2527 | 958 | 751 | 3,4x | 2354 / 2774 |

Precisión en DIV2K (validación, imágenes HR y LR bicúbicas oficiales, una pasada sin teselas, PSNR/SSIM en canal Y):

| Variante | Dataset | Original fp32 | Portable | Kernels |
|---|---|---|---|---|
| `swin2sr-x4` | DIV2K val (cada 2ª: 50 imágenes), bicubic x4 | 30,89 / 0,8420 | 30,89 / 0,8420 | 30,88 / 0,8420 |
| `swin2sr-x2` | DIV2K val (cada 4ª: 25 imágenes), bicubic x2 | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto |

La model card indica que la comparación con Real-ESRGAN no es significativa en PSNR porque este último está entrenado para degradaciones reales, no bicúbicas. No se publican resultados de benchmarks tipo MMLU, HumanEval o GSM8K por tratarse de un modelo de imagen.

## Requisitos de hardware

- VRAM estimada: 1,4-2,4 GiB de memoria pico asignada en 512x512 según variante; 10,9-13,1 GiB pico asignados en 1024x2048 con `portable` fp16.
- GPUs recomendadas: RTX 5060 Ti 16 GB es la referencia de las mediciones; cualquier GPU con al menos 8 GB permite 512x512, y 16 GB o más es recomendable para imágenes grandes sin teselado.
- Cabe en GPU consumer: sí, en 512x512 con 8 GB o más; en 1024x2048 conviene 16 GB o usar `tile=`.
- Opciones de despliegue: fastforks (`portable` y `kernels`), PyTorch nativo, `torch.compile`, exportación ONNX + TensorRT fp16. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de imagen).
- Latencia: 909-958 ms en 512x512 con `portable`; 482-508 ms con `torch.compile`; 547-562 ms con TensorRT fp16; 720-751 ms con `kernels`. La primera llamada tarda 0,84-1,23 s según backend. La preparación de TensorRT cuesta 112-128 s y la compilación en frío 41,7-45,8 s.
- Throughput: no disponible de forma explícita; se puede inferir de los tiempos por imagen anteriores.

## Comparativa con modelos similares

| Modelo | Tipo | Factor de escala | Licencia | Pesos incluidos en el repo | Entrenamiento para degradaciones reales |
|---|---|---|---|---|---|
| Swin2SR (fastforks) | Swin Transformer V2 | x2, x4 | Apache-2.0 | No (descarga externa verificada por SHA-256) | Sí, en la variante `x4-real` (BSRGAN) |
| Real-ESRGAN | GAN (RRDB) | x2, x4 | BSD-3-Clause (según versión) | Sí, en su repo | Sí, entrenado para degradaciones reales |
| SwinIR | Swin Transformer V1 | x2, x3, x4, x8 | Apache-2.0 | Sí, en su repo | Variantes específicas para real-world |
| BSRGAN | GAN | x4 | Apache-2.0 | Sí | Sí, con pipeline de degradaciones BSRGAN |

La model card advierte explícitamente que la comparación de PSNR con Real-ESRGAN no es justa, ya que este último prioriza degradaciones reales sobre fidelidad bicúbica. No se dispone de datos comparativos adicionales en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental según la propia model card; no se garantiza estabilidad de API ni de resultados en producción.
- El repositorio no aloja pesos: depende de la disponibilidad de los releases del repositorio original (`mv-lab/swin2sr`) y de la verificación SHA-256 en `card.toml`.
- Entrenado principalmente para submuestreo bicúbico (variantes `x2` y `x4`); el rendimiento en degradaciones reales depende de `x4-real`, que puede introducir artefactos propios de su pipeline BSRGAN.
- No apto para tareas de texto, razonamiento, código ni visión multimodal más allá de la restauración de imagen.
- Entrada mínima de 32x32 píxeles y padding obligatorio a múltiplos de 32; imágenes grandes requieren teselado para evitar OOM.
- La licencia Apache-2.0 permite uso comercial, pero la model card recomienda revisar las cadenas de licencia del código original antes de otros usos.
- Riesgo de alucinación visual: como todo modelo de superresolución, puede inventar detalles plausibles no presentes en la imagen original, especialmente en texturas finas y caras.
- No se documentan sesgos demográficos ni de contenido; al ser un modelo de restauración, los sesgos provienen del dataset DIV2K/Flickr2K y pueden afectar a la fidelidad en dominios poco representados.
- Las mediciones de rendimiento proceden de una única GPU (RTX 5060 Ti 16 GB, sm_120); el rendimiento en otras arquitecturas puede variar.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/swin2sr
- Repositorio de código fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original de Swin2SR: https://github.com/mv-lab/swin2sr (commit `6f25d7689813`)
- Pesos `swin2sr-x2`: https://github.com/mv-lab/swin2sr/releases/download/v0.0.1/Swin2SR_ClassicalSR_X2_64.pth
- Pesos `swin2sr-x4`: https://github.com/mv-lab/swin2sr/releases/download/v0.0.1/Swin2SR_ClassicalSR_X4_64.pth
- Pesos `swin2sr-x4-real`: https://github.com/mv-lab/swin2sr/releases/download/v0.0.1/Swin2SR_RealworldSR_X4_64_BSRGAN_PSNR.pth
- Release v0.0.1 del repositorio original: https://github.com/mv-lab/swin2sr/releases/tag/v0.0.1
- Licencia del código original: https://github.com/mv-lab/swin2sr/blob/6f25d7689813f7dd12c5a212b638066fa71bc9e6/LICENSE
- Documentación de benchmarks de fastforks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Fichero `card.toml` con hashes SHA-256 completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/restoration/models/swin2sr/card.toml
