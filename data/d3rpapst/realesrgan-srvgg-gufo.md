# D3rPapst/realesrgan-srvgg-gufo

## Resumen

Real-ESRGAN compact (SRVGGNetCompact) x4 es un paquete de tres modelos de superresolución de imagen y vídeo convertidos a safetensors FP32 para su uso con la herramienta gufo-studio-windows. Los pesos originales proceden de los checkpoints `realesr-animevideov3.pth`, `realesr-general-x4v3.pth` y `realesr-general-wdn-x4v3.pth` publicados por Xintao Wang et al. en la release v0.2.5.0 del repositorio Real-ESRGAN (ICCVW 2021), y esta conversión la firma el usuario D3rPapst.

El problema que resuelve es el escalado de imágenes y vídeos completos hasta un tamano de entrega (por ejemplo, 1920x1080) ejecutando la red de forma nativa sobre HIP en GPUs AMD Strix Halo bajo Windows, sin depender de PyTorch en tiempo de inferencia. Los tres modelos comparten la arquitectura compacta SRVGGNetCompact con factor de escala x4 y se diferencian en el número de convoluciones del cuerpo y en su especialización: escenas generales, escenas generales con denoising reforzado y anime o vídeo dibujado.

Es relevante porque ofrece una vía de despliegue ligera (pesos de 2,5 a 4,9 MB) para pipelines de upscaling en hardware AMD de escritorio, con API HTTP (`/v1/images/upscale`, `/v1/videos/upscale`) y CLI (`gufo video-upscale`), y porque la conversión documenta metadatos de arquitectura que permiten reconstruir la red sin cargar el pickle de PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SRVGGNetCompact (Real-ESRGAN compact) |
| Parametros totales | no disponible (pesos de 4,9 MB y 2,5 MB en FP32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | FP32 safetensors (unico formato publicado) |
| Idiomas soportados | no aplica (modelo de imagen/video) |
| Licencia | BSD 3-Clause |
| Formato de pesos | safetensors (FP32) |

Detalle de los ficheros incluidos:

| Fichero | Tamano | Convoluciones del cuerpo | Uso previsto |
|---|---:|---:|---|
| `realesr-general-x4v3.safetensors` | 4,9 MB | 32 | escenas generales |
| `realesr-general-wdn-x4v3.safetensors` | 4,9 MB | 32 | escenas generales con denoising mas fuerte |
| `realesr-animevideov3.safetensors` | 2,5 MB | 16 | anime y video dibujado |

Metadatos grabados en los safetensors: `format=realesrgan-srvgg`, `num_conv` (16 o 32), `num_feat=64`, `upscale=4`, `source=<nombre del .pth>`.

## Arquitectura y entrenamiento

La red es SRVGGNetCompact, una variante compacta de superresolución basada en una pila de convoluciones 3x3 con 64 canales de característica (`num_feat=64`) y un cuerpo de 16 o 32 convoluciones según la variante, seguida de una cabeza de upscaling con factor x4. No es un transformer ni un modelo generativo con atención: es una CNN de restauración que aprende un mapeo directo de baja a alta resolución. Los tres checkpoints originales fueron entrenados por Xintao Wang et al. para el trabajo Real-ESRGAN (ICCVW 2021), que introduce una degradación sintética de alta orden para hacer frente a datos reales; la variante `wdn` incorpora un componente de denoising más agresivo y la variante `animevideov3` está especializada en contenido dibujado y vídeo de animación.

Esta publicación no entrena ni ajusta los pesos: solo los convierte. El script `tools/convert_realesrgan_pth.py` (presente en upscale-gufo-extension y en gufo-studio-windows) lee el pickle de PyTorch con un unpickler restringido, de modo que no se ejecuta código del checkpoint y no se necesita torch, extrae el state dict `params_ema` o `params` y escribe safetensors FP32. La verificación reportada por el autor indica que la salida x2/x4 es bit a bit idéntica entre el módulo de extensión y la ruta integrada en Strix Halo (release 0.1.0 de la extensión). No se documentan en la información disponible el número de tokens, la composición del dataset ni si hubo RLHF o DPO, ya que no aplican a este tipo de modelo.

## Capacidades

- Superresolución de imagen con factor x2 y x4 mediante `POST /v1/images/upscale` con el parámetro `scale` y la variante `general`, `wdn` o `anime`.
- Superresolución de vídeo completo mediante `POST /v1/videos/upscale` y la CLI `gufo video-upscale`, con opción de fijar el tamano de entrega (por ejemplo, `--size 1920x1080`).
- Tres variantes especializadas: escenas generales, escenas generales con denoising reforzado y anime o vídeo dibujado.
- Ejecución nativa sobre HIP en GPUs AMD Strix Halo bajo Windows, sin dependencia de PyTorch en inferencia.
- Integración con gufo-studio-windows y con la extensión upscale-gufo-extension.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de visión.

## Casos de uso

- Restauración de fotografía y material de archivo: la variante `general` escala imágenes de baja resolución a x4 conservando detalle; útil para digitalizar fondos fotográficos y preparar material para impresión o web.
- Limpieza de vídeo con ruido o compresión agresiva: la variante `wdn` añade un denoising más fuerte, adecuada para metraje grabado con sensores pequeños o codificado a bitrates bajos antes de reescalar a 1080p.
- Reescalado de anime y animación: la variante `animevideov3`, con solo 16 convoluciones, está pensada para líneas limpias y colores planos, y es la más rápida de las tres al tener la mitad de cuerpo convolucional.
- Entrega de vídeo a tamano de emisión: `gufo video-upscale --model <fichero> --input in.mp4 --output out.mp4 --size 1920x1080` permite llevar clips completos a resolución de entrega en un solo paso.
- Pipeline de preprocesado para otros modelos: usar el upscaler como etapa previa para alimentar detectores, segmentadores u otros modelos de visión que rinden mejor con más resolución efectiva.
- Integración como servicio HTTP en una aplicación de escritorio o servidor local: el bloque `[external/gufo-upscale]` de la model card muestra cómo declarar el servidor con `serve upscale --device gpu`, con límites de VRAM (`router-gpu-gb = 1`) y de RAM de host (`router-host-gb = 1`), lo que permite exponer el upscaling a otras herramientas vía API compatible con el router de gufo.
- Procesado por lotes en hardware AMD: al correr sobre HIP en Strix Halo, encaja en estaciones de trabajo Windows con GPU integrada AMD donde no hay CUDA disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; la configuración de ejemplo de la model card reserva `router-gpu-gb = 1` (1 GB de GPU) y `router-host-gb = 1` (1 GB de RAM de host), lo que sugiere un consumo muy contenido.
- GPU recomendadas: AMD Strix Halo (validado por el autor, ejecución nativa sobre HIP en Windows). Para otras GPU no se documenta soporte en la información disponible.
- Cabe en GPU de consumo: los pesos son de 2,5 a 4,9 MB en FP32, por lo que el cuello de botella es la resolución del fotograma, no el tamano del modelo. No se detallan modelos concretos de GPU de consumo compatibles.
- Opciones de despliegue: gufo-studio-windows (`gufo serve upscale`, `gufo video-upscale`), upscale-gufo-extension, y exposición vía API HTTP con `POST /v1/images/upscale` y `POST /v1/videos/upscale`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Factor de escala | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Real-ESRGAN compact SRVGGNetCompact x4 (esta ficha) | no disponible (pesos de 2,5-4,9 MB) | x2 / x4 | no aplica | BSD 3-Clause | safetensors FP32 | Hugging Face, via gufo |
| Real-ESRGAN original (xinntao/Real-ESRGAN) | no disponible | x2 / x4 | no aplica | BSD 3-Clause | `.pth` (PyTorch) | GitHub release v0.2.5.0 |
| Real-ESRGAN x4plus (RRDB, no compacto) | no disponible | x4 | no aplica | BSD 3-Clause | `.pth` (PyTorch) | GitHub release |
| Modelos de superresolución de la familia SwinIR / HAT | no disponible | variable | no aplica | variable | `.pth` (PyTorch) | Repositorios propios |

La comparación se limita a lo que consta en la información proporcionada: los tres checkpoints de esta ficha son los mismos pesos que los `.pth` originales, solo que convertidos a safetensors y con metadatos de arquitectura. No se dispone de datos de rendimiento comparativo (PSNR, SSIM, LPIPS) en la información disponible.

## Limitaciones y advertencias

- Modelo de visión: no procesa texto ni mantiene conversaciones; cualquier expectativa de razonamiento, código o tool calling es inaplicable.
- Riesgo de artefactos: como toda red de superresolución entrenada con degradaciones sintéticas, puede inventar texturas en caras, texto pequeño y patrones finos, especialmente con factores x4 sobre entradas muy degradadas.
- La variante `animevideov3` está especializada en contenido dibujado; usarla sobre fotografía real puede producir resultados pobres.
- No se documentan sesgos demográficos ni de contenido, pero al ser un modelo de restauración puede amplificar sesgos presentes en los datos de entrenamiento originales de Real-ESRGAN.
- Licencia BSD 3-Clause: permite uso comercial, pero obliga a conservar el aviso de copyright ("Copyright (c) 2021, Xintao Wang"), las condiciones y el descargo de responsabilidad, y prohíbe usar los nombres de los autores para respaldar el producto derivado. El texto completo se incluye como `LICENSE` en el repositorio.
- Los checkpoints originales se publicaron en el repositorio de Real-ESRGAN sin una licencia de modelo separada; la model card asume la licencia BSD 3-Clause del repositorio. Conviene revisar este punto antes de un despliegue comercial.
- Validación limitada a Strix Halo con Windows y ROCm/HIP; no se documenta comportamiento en otras plataformas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, y pesos de 0,0 GB reportados por Hugging Face: verificar la integridad de los ficheros antes de usarlos en producción.
- La conversión y la documentación se realizaron con asistencia de IA (Claude Code), según declara el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/D3rPapst/realesrgan-srvgg-gufo
- gufo-studio-windows: https://github.com/D3rPapst/gufo-studio-windows
- upscale-gufo-extension: https://github.com/D3rPapst/upscale-gufo-extension
- Release original de Real-ESRGAN v0.2.5.0: https://github.com/xinntao/Real-ESRGAN/releases/tag/v0.2.5.0
- Repositorio Real-ESRGAN: https://github.com/xinntao/Real-ESRGAN
- Paper Real-ESRGAN (Wang et al., ICCVW 2021): no disponible como enlace en la informacion proporcionada.
