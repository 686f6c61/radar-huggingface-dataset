# inYourOwnBrowser/PULSE

## Resumen

PULSE es una red neuronal convolucional para superresolución de imagen única (SISR) diseñada con un enfoque de despliegue prioritario. Es un fork del modelo original de Phips y se presenta como el hermano pequeño y rápido de NERVE, con una arquitectura mucho más compacta que prioriza el tamaño reducido y la velocidad sobre la capacidad de restauración. Existen dos variantes: `pulse` (48 canales, 353.856 parámetros) y `pulse_fast` (32 canales, 162.192 parámetros), ambas disponibles en escalas 2x y 4x.

El modelo resuelve el problema del upscaling limpio y de bajo coste en entornos con recursos limitados: navegadores, CPU, GPUs de consumo y pipelines embebidos. Su diseño elimina operaciones problemáticas en tiempo de exportación (sin `Resize`, sin atención, sin normalización) y utiliza exclusivamente operadores estándar (`Conv`, `Add`, `ReLU`, `Pad`, `DepthToSpace`), lo que facilita su conversión a ONNX, TensorRT, NCNN y otros runtimes sin pasos frágiles de conversión.

La relevancia actual de PULSE reside en su licencia MIT tanto para código como para pesos, y en que todos los modelos publicados se entrenaron exclusivamente con imágenes CC0 o de dominio público. Está pensado para casos donde el modelo debe ser casi gratuito en términos de cómputo y donde la restauración pesada no es necesaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN convolucional (SISR), sin atención ni normalización |
| Parámetros totales | 353.856 (`pulse`) / 162.192 (`pulse_fast`) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantización | fp16 (ONNX `*_fp16.onnx`); no se detallan otras |
| Idiomas soportados | en (etiqueta de idioma del repo; el modelo procesa imágenes) |
| Licencia | MIT (código y pesos) |
| Formato de pesos | PyTorch `.safetensors` y ONNX dinámico |

## Arquitectura y entrenamiento

PULSE es una red convolucional pura para superresolución de imagen única. La escala se realiza mediante una base fija MKS2013 (sin parámetros aprendidos ni rama dinámica) combinada con PixelShuffle. El grafo exportado no contiene la operación `Resize`, lo que evita discrepancias de implementación de interpolación entre runtimes. La ausencia de atención y de normalización permite entrenamiento estable con bf16 AMP, reduce picos de memoria y simplifica el mantenimiento. El modelo exporta a ONNX dinámico, de modo que una sola exportación funciona a cualquier resolución de entrada.

El preentrenamiento utiliza únicamente la pérdida Charbonnier: no hay discriminador, ni pila perceptual, ni esquema GAN. El entrenamiento se realizó sobre un conjunto de 200k imágenes de fidelidad CC0/dominio público, con batch 8 y bf16 en una única RTX 3060. Las velocidades de entrenamiento reportadas son de ~29 it/s (`pulse` 4x), ~9,8 it/s (`pulse` 2x), ~36 it/s (`pulse_fast` 4x) y ~20 it/s (`pulse_fast` 2x). Los pesos publicados son EMA.

## Capacidades

- Superresolución de imagen 2x y 4x en variantes `pulse` y `pulse_fast`.
- Upscaling limpio de imágenes e ilustraciones (anime y stills) con degradación ligera.
- Limpieza ligera de imagen (light cleanup), no restauración ciega pesada.
- Exportación a ONNX dinámico para ONNX Runtime, TensorRT, NCNN y otros runtimes.
- Ejecución en navegador mediante ONNX Runtime Web/WASM/WebGPU (especialmente los modelos 2x).
- Integración en aplicaciones mediante un único archivo de arquitectura (`pulse_arch.py`) y un conjunto de operadores estándar.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).
- No incluye limpieza de artefactos de compresión JPEG/WebP/AVIF/H.265/GIF en el preentrenamiento publicado; para ello existe el finetune separado PULSE-Web.
- No incluye limpieza temporal de vídeo; es un modelo por fotograma.

## Casos de uso

- Upscaling en navegador o escritorio: los modelos 2x pueden ejecutarse con ONNX Runtime Web/WASM/WebGPU, y los 4x, aunque más pesados, siguen siendo pequeños; útil para ampliar imágenes localmente sin ida y vuelta al servidor.
- Visores de imágenes, galerías y pipelines de miniaturas: una pasada local rápida antes de mostrar la imagen, con coste mínimo de cómputo.
- Stills de anime e ilustración: upscaling limpio 2x/4x adecuado para imágenes con degradación ligera; para limpieza de compresión se requiere el finetune PULSE-Web.
- Preprocesado por lotes u offline: el modelo es lo bastante pequeño para compartir una GPU de consumo o ejecutarse en CPU.
- Embebido en aplicaciones: un solo archivo de arquitectura y un conjunto de operadores estándar, sin paso de fusión, lo que simplifica la integración y auditoría.
- Despliegue en edge o dispositivos con presupuesto de cómputo muy ajustado: 162K–354K parámetros encajan en presupuestos de WASM, GPUs pequeñas y fallbacks de CPU donde un transformer no cabría.
- Aceleración con TensorRT: el grafo de solo operadores estándar permite compilar un engine localmente; en RTX 3060, `pulse_fast` a 1080p pasa de 103,88 ms (eager) a 39,60 ms (TRT).

## Benchmarks y rendimiento

Validación en Urban100 (pesos EMA, sin TTA; PSNR/SSIM en canal Y con recorte de borde de 4 px; TopIQ/LPIPS en RGB):

| Modelo | PSNR | SSIM | TopIQ | LPIPS |
|---|---:|---:|---:|---:|
| 4x `pulse` | 25,6523 | 0,7717 | 0,5907 | 0,2452 |
| 2x `pulse` | 31,4423 | 0,9221 | 0,8614 | 0,0721 |
| 4x `pulse_fast` | 25,4239 | 0,7638 | 0,5748 | 0,2553 |
| 2x `pulse_fast` | 31,1371 | 0,9188 | 0,8551 | 0,0755 |

Velocidad de inferencia (RTX 3060, batch 1, fp16, engine TensorRT construido localmente; tiempos en ms):

| Modelo | 256² eager | 720p eager | 1080p eager | 256² TRT | 720p TRT | 1080p TRT |
|---|---:|---:|---:|---:|---:|---:|
| `pulse_fast` | 3,65 | 47,00 | 103,88 | 1,43 | 17,52 | 39,60 |
| `pulse` | 6,71 | 90,20 | 199,28 | 2,82 | 35,35 | 79,65 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por el tamaño (162K–354K parámetros) el modelo es extremadamente ligero y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: RTX 3060 es la referencia de entrenamiento e inferencia reportada; cualquier GPU moderna sirve. Para TensorRT se construye un engine local.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual; también en CPU y en navegador (WASM/WebGPU) para las variantes 2x.
- Opciones de despliegue: ONNX Runtime (incluido Web/WASM/WebGPU), TensorRT, NCNN, PyTorch con `.safetensors` y `pulse_arch.py`; compatible con Spandrel y chaiNNer.
- Latencia y throughput: en RTX 3060, `pulse_fast` tarda 3,65 ms a 256² y 103,88 ms a 1080p en eager, y 1,43 ms / 39,60 ms con TensorRT; `pulse` tarda 6,71 ms / 199,28 ms en eager y 2,82 ms / 79,65 ms con TensorRT.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Licencia | Disponibilidad |
|---|---:|---|---|---|
| PULSE (`pulse`) | 353.856 | SISR tiny, despliegue primero | MIT | Hugging Face (safetensors + ONNX) |
| PULSE (`pulse_fast`) | 162.192 | SISR tiny, mínima computación | MIT | Hugging Face (safetensors + ONNX) |
| NERVE | ~1,8M (según model card) | Restauración/upscaling convolucional más capaz | no disponible en la información | Hugging Face (Phips/NERVE) |
| HEART | no disponible | Máxima calidad, presupuesto GPU de escritorio/servidor | no disponible en la información | Hugging Face (Phips/HEART) |

PULSE no compite con HEART en PSNR; es el hermano pequeño de NERVE, con muchas menos capacidades y un envelope operativo más ligero. No se dispone de cifras comparativas de PSNR entre PULSE, NERVE y HEART en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de restauración ciega general: está pensado para degradación ligera y upscaling limpio.
- El preentrenamiento publicado no se entrenó con artefactos de compresión JPEG/WebP/AVIF/H.265/GIF; para limpieza de compresión se necesita el finetune separado PULSE-Web.
- No realiza restauración temporal de vídeo; es un modelo por fotograma y el vídeo sin parpadeo requiere condicionamiento temporal.
- No es adecuado para upscaling de texto, UI o capturas de pantalla; para ello se recomienda un modelo de restauración con conocimiento de texto.
- Para restauración OTF ciega con desenfoque o ruido intensos se recomienda NERVE/HEART OTF o un modelo de restauración mayor.
- Menor capacidad que NERVE por diseño; el rendimiento en PSNR es inferior al de modelos más grandes.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no disponible en la información proporcionada (modelo de imagen, no generativo de texto).
- Licencia MIT permisiva para uso comercial, tanto en código como en pesos; los datos de entrenamiento son CC0/dominio público.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, y con tamaño de repo de 0,0 GB; conviene verificar la disponibilidad real de los artefactos antes de integrarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/inYourOwnBrowser/PULSE
- Modelo original (fork de): https://huggingface.co/Phips/PULSE
- HEART: https://huggingface.co/Phips/HEART
- NERVE: https://huggingface.co/Phips/NERVE
- Demo de PULSE: https://huggingface.co/spaces/Phips/PULSE-demo
- Conversor ONNX de PULSE: https://huggingface.co/spaces/Phips/PULSE-convert
