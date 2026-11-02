# Phips/PULSE

## Resumen

PULSE es una red neuronal convolucional para superresolución de imagen única (SISR) desarrollada por el usuario Phips, publicada bajo licencia MIT. Se presenta como la variante "diminuta y rápida" de NERVE, su modelo hermano de mayor capacidad, y está diseñada con una filosofía centrada en el despliegue: pesos en `.safetensors` y ONNX dinámico, operaciones estándar y un grafo exportable sin sorpresas entre runtimes.

El modelo existe en dos variantes (`pulse` con 48 canales y 353.856 parámetros, y `pulse_fast` con 32 canales y 162.192 parámetros), cada una en escalas 2x y 4x. Su reducido tamaño lo hace apto para ejecución en navegador (ONNX Runtime Web/WASM/WebGPU), CPU y GPUs de consumo, así como para su integración en aplicaciones de escritorio y pipelines de preprocesamiento por lotes.

Es relevante porque ocupa un nicho concreto: la superresolución local de bajo coste con un modelo que cabe en presupuestos de memoria muy ajustados. No compite con modelos de restauración pesados en PSNR ni aborda restauración ciega de degradaciones complejas; su pretrain liberado está orientado a escalado limpio 2x/4x sobre imágenes sin artefactos de compresión severos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN convolucional para SISR, sin atención ni normalización, con base fija MKS2013 y PixelShuffle |
| Parámetros totales | 353.856 (`pulse`), 162.192 (`pulse_fast`) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de imagen) |
| Tipos de cuantización | FP16 (ONNX `*_fp16.onnx`); no se detallan otras en la información disponible |
| Idiomas soportados | No aplica (modelo de imagen); la model card declara `en` |
| Licencia | MIT (código y pesos) |
| Formato de pesos | `.safetensors` (PyTorch) y `.onnx` dinámico |

## Arquitectura y entrenamiento

PULSE es una red convolucional pura compuesta únicamente por operaciones estándar: `Conv`, `Add`, `ReLU`, `Pad` y `DepthToSpace`. El escalado se realiza mediante una base fija MKS2013 sin parámetros aprendidos más un PixelShuffle, lo que evita la operación `Resize` en el grafo exportado y garantiza comportamiento idéntico entre ONNX Runtime, TensorRT, NCNN y otros runtimes. La ausencia de atención y de capas de normalización simplifica el entrenamiento en bf16 AMP y reduce los picos de memoria. El ONNX exportado es dinámico, por lo que un único modelo sirve para cualquier resolución de entrada y salida.

El pretrain liberado se entrenó exclusivamente con imágenes CC0 y de dominio público, usando una pérdida Charbonnier sin discriminador, sin pila perceptual y sin esquema GAN. Según la model card, el entrenamiento completo cabe en una única RTX 3060 con batch 8 y bf16, a velocidades de aproximadamente 29 it/s (`pulse` 4x), 9,8 it/s (`pulse` 2x), 36 it/s (`pulse_fast` 4x) y 20 it/s (`pulse_fast` 2x). Las ramas perceptuales se describen como experimentales y no forman parte de esta release.

## Capacidades

- Superresolución de imagen única con factores de escala 2x y 4x.
- Escalado limpio de imágenes con degradación ligera; no es un modelo de restauración ciega general.
- Ejecución en navegador mediante ONNX Runtime Web (WASM/WebGPU), especialmente con los modelos 2x.
- Ejecución en CPU y en GPUs de consumo gracias a su reducido número de parámetros.
- Exportación a TensorRT y optimización con `onnxsim` sin pasos de fusión frágiles.
- Integración con Spandrel y chaiNNer según los tags del repositorio.
- No soporta tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No incluye limpieza de artefactos de compresión (JPEG/WebP/AVIF/H.265/GIF) en el pretrain liberado; requiere el finetune separado PULSE-Web.
- No soporta restauración temporal de vídeo; el procesamiento es por fotograma.

## Casos de uso

- Escalado en navegador: los modelos 2x pueden ejecutarse con ONNX Runtime Web/WASM/WebGPU para aumentar imágenes del lado del cliente sin round-trip al servidor, aprovechando el ONNX dinámico que acepta cualquier resolución.
- Visores de imágenes y galerías: una pasada local rápida antes de mostrar miniaturas o previsualizaciones, con latencia de milisegundos en GPU y viable en CPU para lotes pequeños.
- Pipelines de miniaturas: generación de versiones ampliadas de imágenes de catálogo o contenido editorial donde se requiere un escalado limpio y determinista sin coste de servidor dedicado.
- Stills de anime e ilustración: escalado 2x/4x de imágenes limpias; para contenido con artefactos de compresión sería necesario el finetune PULSE-Web.
- Preprocesamiento por lotes offline: al caber en una GPU de consumo o incluso en CPU, puede compartirse con otras tareas del mismo equipo sin reservar hardware dedicado.
- Integración embebida en aplicaciones de escritorio: un único archivo de arquitectura y un conjunto de operaciones estándar permiten portar el modelo a apps nativas con TensorRT u ONNX Runtime sin pasos de conversión adicionales.
- Aceleración en edge: despliegue en dispositivos con presupuesto de memoria muy ajustado donde un transformer de superresolución no cabría.

## Benchmarks y rendimiento

Validación sobre Urban100 con pesos EMA, PSNR/SSIM en canal Y con recorte de borde de 4 px, TopIQ/LPIPS en RGB, sin TTA:

| Modelo | PSNR | SSIM | TopIQ | LPIPS |
|---|---:|---:|---:|---:|
| 4x `pulse` | 25,6523 | 0,7717 | 0,5907 | 0,2452 |
| 2x `pulse` | 31,4423 | 0,9221 | 0,8614 | 0,0721 |
| 4x `pulse_fast` | 25,4239 | 0,7638 | 0,5748 | 0,2553 |
| 2x `pulse_fast` | 31,1371 | 0,9188 | 0,8551 | 0,0755 |

Velocidad de inferencia en RTX 3060, batch 1, fp16, motor TensorRT construido localmente (tiempos en milisegundos):

| Modelo | 256² eager | 720p eager | 1080p eager | 256² TRT | 720p TRT | 1080p TRT |
|---|---:|---:|---:|---:|---:|---:|
| `pulse_fast` | 3,65 | 47,00 | 103,88 | 1,43 | 17,52 | 39,60 |
| `pulse` | 6,71 | 90,20 | 199,28 | 2,82 | 35,35 | 79,65 |

## Requisitos de hardware

- VRAM estimada: muy baja; con 162K–354K parámetros, el modelo y sus activaciones caben holgadamente en cualquier GPU con unos pocos cientos de MB, e incluso en memoria compartida de CPU.
- GPU recomendadas: RTX 3060 es la referencia de las mediciones del autor; cualquier GPU moderna (RTX 4090, A100, H100) ejecutará el modelo con latencias inferiores a las reportadas, aunque el cuello de botella será el ancho de banda y el tamaño de la imagen más que el cómputo.
- GPU de consumo: sí, cabe en cualquier GPU de consumo actual e incluso en iGPU con ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (CPU, Web/WASM, WebGPU), TensorRT, PyTorch con `.safetensors`, y potencialmente NCNN según los runtimes mencionados en la model card.
- Latencia y throughput: en RTX 3060 con TensorRT, `pulse_fast` procesa 1080p en ~39,6 ms y `pulse` en ~79,65 ms; en 256², `pulse_fast` baja a ~1,43 ms. La variante eager en PyTorch es entre 2 y 3 veces más lenta.

## Comparativa con modelos similares

| Modelo | Parámetros | Escalas | Licencia | Enfoque | Disponibilidad |
|---|---:|---|---|---|---|
| PULSE (`pulse`) | 353.856 | 2x, 4x | MIT | CNN mínima, despliegue en edge/navegador | HuggingFace, ONNX incluido |
| PULSE (`pulse_fast`) | 162.192 | 2x, 4x | MIT | Máxima velocidad, mínimo cómputo | HuggingFace, ONNX incluido |
| NERVE | ~1,8M | No detallado | No disponible en la información | Restauración CNN más capaz, misma filosofía de despliegue | HuggingFace |
| HEART | No disponible | No disponible | No disponible | Máxima calidad para GPU de escritorio/servidor | HuggingFace |

La model card sitúa a PULSE como hermano pequeño de NERVE y por debajo de HEART en calidad. No se aportan cifras comparativas de PSNR entre estos modelos en la información disponible.

## Limitaciones y advertencias

- No es un modelo de restauración ciega: el pretrain liberado está pensado para escalado limpio y degradaciones ligeras, no para desenfoque o ruido intensos.
- No limpia artefactos de compresión (JPEG, WebP, AVIF, H.265, GIF); para ello se necesita el finetune separado PULSE-Web.
- No apto para escalado de texto, UI o capturas de pantalla; la model card recomienda un modelo de restauración text-aware para esos casos.
- Procesamiento por fotograma únicamente; no hay soporte temporal, por lo que un vídeo procesado con PULSE puede presentar parpadeo.
- Calidad inferior a NERVE y HEART; no compite en PSNR con modelos de restauración más grandes.
- Entrenado solo con imágenes CC0/dominio público, lo que puede limitar la diversidad de dominios visuales frente a modelos entrenados con datasets más amplios.
- Licencia MIT permisiva para uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios no representados en el entrenamiento.
- No se han publicado análisis de sesgos ni evaluaciones fuera de Urban100 en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Phips/PULSE
- Modelo hermano NERVE: https://huggingface.co/Phips/NERVE
- Modelo hermano HEART: https://huggingface.co/Phips/HEART
- Demo de PULSE: https://huggingface.co/spaces/Phips/PULSE-demo
- Conversor ONNX de PULSE: https://huggingface.co/spaces/Phips/PULSE-convert
