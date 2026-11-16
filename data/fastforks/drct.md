# fastforks/drct

## Resumen

DRCT (Dense Residual Convolutional Transformer) es un modelo de superresolución de imagen presentado por Hsu et al. en CVPRW 2024. La implementación aquí descrita corresponde al repositorio `fastforks/drct`, un paquete de inferencia que no aloja pesos propios: descarga los checkpoints originales de los autores y los valida mediante SHA-256. El modelo resuelve la tarea de restauración de imagen, concretamente el reescalado x4 de imágenes RGB con degradación bicúbica, y está entrenado para maximizar PSNR.

La arquitectura combina grupos residuales densos de capas Swin Transformer con atención de ventana de 16 x 16 píxeles, desplazada en capas alternas, y conexiones densas que incrementan la entrada en 32 canales por capa. Existen dos variantes: `drct-x4` (6 grupos) y `drct-l-x4` (12 grupos). Ambas se entrenaron con preentrenamiento en ImageNet-1k y ajuste fino sobre DF2K (DIV2K + Flickr2K) con degradación bicúbica.

Su relevancia actual reside en que ofrece una alternativa de código abierto (MIT) a upscalers comerciales para pipelines de restauración de imagen, con backend optimizado (`kernels`) que acelera la inferencia hasta 10,5x respecto al código original y reduce el pico de memoria a la mitad, lo que permite ejecutarlo en GPUs de consumo como la RTX 5060 Ti de 16 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con grupos residuales densos de capas Swin Transformer (atención de ventana 16x16, desplazada cada dos capas, conexiones densas con crecimiento de 32 canales por capa) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; entrada H x W >= 32, múltiplo de 32; probado hasta 1024x1024) |
| Tipos de cuantizacion | fp16 (por defecto en GPU), fp32 (CPU); no se documentan otras cuantizaciones |
| Idiomas soportados | no aplica (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | MIT (código y pesos) |
| Formato de pesos | `.pth` (checkpoints PyTorch de los autores, descargados externamente y validados por SHA-256) |

## Arquitectura y entrenamiento

DRCT emplea una arquitectura de transformer para superresolución basada en grupos residuales densos. Cada grupo está compuesto por capas Swin Transformer con atención restringida a ventanas de 16 x 16 píxeles; la ventana se desplaza en capas alternas para permitir el intercambio de información entre ventanas adyacentes. Las conexiones densas hacen que la entrada de cada capa crezca 32 canales respecto a la anterior, lo que incrementa la capacidad de representación sin aumentar proporcionalmente la profundidad. La variante `drct-l-x4` duplica el número de grupos (12 frente a 6) respecto a `drct-x4`.

El entrenamiento se realizó en dos fases: preentrenamiento en ImageNet-1k (ILSVRC 2012, clasificación) y ajuste fino sobre DF2K, compuesto por DIV2K (1000 imágenes 2K de NTIRE 2017) y Flickr2K (2650 imágenes 2K de EDSR), con degradación bicúbica y optimización orientada a PSNR. La model card no especifica el número exacto de tokens de entrenamiento ni si se emplearon técnicas de RLHF o DPO (no aplicables a esta tarea). El paquete `fastforks` incluye dos backends: `portable` (PyTorch estándar) y `kernels` (kernels optimizados), con paridad numérica verificada frente al código original (diferencia máxima absoluta <= 2e-06 en CPU fp32; media <= 0,00071 y p99 <= 0 en GPU fp16).

## Capacidades

- Superresolución de imagen x4 con degradación bicúbica: entrada RGB de cualquier tamaño H x W >= 32 (padded a múltiplo de 32), salida RGB en [0, 1] a escala 4x.
- Restauración de imagen en general (etiqueta `image-restoration`), orientada a casos de upscaling con degradación conocida.
- Procesamiento por teselas (`tile=`) para imágenes grandes, con solapamiento, al estilo de ComfyUI.
- Ejecución en GPU (CUDA, fp16) y CPU (fp32).
- Backend `kernels` con aceleración de hasta 10,5x frente al código original y reducción del pico de memoria aproximadamente a la mitad.
- Compatibilidad con `torch.compile` (reducción adicional de latencia) y con TensorRT fp16 (build no incluido en los benchmarks por superar los 5 minutos).
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente image-to-image.

## Casos de uso

- Restauración de fotografías antiguas o de baja resolución: el modelo reescala x4 imágenes con degradación bicúbica, adecuado para digitalización de archivos fotográficos donde se conoce el proceso de degradación.
- Upscaling de material gráfico para impresión: permite generar versiones 4x de ilustraciones o assets con un pico de memoria de 2,5-2,7 GiB en 512x512, viable en estaciones de trabajo con GPU de consumo.
- Preprocesado en pipelines de visión por computador: aumentar la resolución de imágenes de entrada antes de tareas de detección o segmentación, aprovechando la paridad numérica con el código de referencia para reproducibilidad.
- Procesamiento por lotes en servidores con GPU modesta: el backend `kernels` reduce el tiempo de 512x512 a 718 ms (`drct-x4`) y 1399 ms (`drct-l-x4`) en una RTX 5060 Ti, lo que permite throughput razonable en hardware de gama media.
- Integración en flujos de edición tipo ComfyUI: el parámetro `tile=` replica el comportamiento de teselado de ComfyUI, facilitando su incorporación a grafos de restauración existentes.
- Investigación en superresolución: al ser MIT y validar los pesos por SHA-256 contra el repositorio original, sirve como baseline reproducible para comparar técnicas de restauración.
- Restauración de imágenes satelitales o médicas de gran tamaño: con soporte probado hasta 1024x1024 (10 GiB de pico asignado) y teselado para tamaños mayores.

## Benchmarks y rendimiento

Precisión en DIV2K validación (cada 2ª imagen, 50 imágenes), LR bicúbica x4 -> HR, PSNR / SSIM en canal Y:

| Variante | Dataset | portable | kernels |
|---|---|---|---|
| `drct-x4` | DIV2K val (50 imgs), bicubic x4 | 30,76 / 0,8388 | 30,76 / 0,8388 |
| `drct-l-x4` | DIV2K val (50 imgs), bicubic x4 | 31,00 / 0,8434 | 31,00 / 0,8434 |

Rendimiento y memoria en restauración sintética 512x512 (RTX 5060 Ti 16 GB, sm_120):

| Modelo | Tiempo original | portable | kernels | Aceleración kernels vs original | Pico memoria portable (MiB) | Pico memoria kernels (MiB) |
|---|---|---|---|---|---|---|
| `drct-l-x4` | 14651 ms | 1607 ms | 1399 ms | 10,5x | 2692 / 3110 | 2564 / 2850 |
| `drct-x4` | 7492 ms | 830 ms | 718 ms | 10,4x | 2626 / 3048 | 2498 / 2766 |

Arranque y primera llamada:

| Modelo | Carga original | Carga portable | Carga kernels | Primera llamada original | Primera llamada portable | Primera llamada kernels |
|---|---|---|---|---|---|---|
| `drct-l-x4` | 2,09 s | 0,79 s | 1,84 s | 15,38 s | 1,70 s | 1,45 s |
| `drct-x4` | 1,88 s | 0,39 s | 1,32 s | 8,66 s | 1,02 s | 0,77 s |

`torch.compile` y TensorRT (512x512):

| Modelo | portable | compile | TensorRT fp16 | kernels | Compilación (primera llamada en frío) |
|---|---|---|---|---|---|
| `drct-l-x4` | 1607 ms | 1210 ms | diferido (build > 5 min) | 1399 ms | 67,2 s |
| `drct-x4` | 830 ms | 618 ms | diferido (build > 5 min) | 718 ms | 40,5 s |

## Requisitos de hardware

- VRAM estimada: 512x512 requiere ~2,5-2,7 GiB de pico asignado (portable/kernels); 1024x1024 requiere ~10 GiB de pico asignado y 13,9 GiB reservados (medido en RTX 5060 Ti 16 GB, fp16).
- GPU recomendadas: RTX 5060 Ti 16 GB (hardware de referencia de los benchmarks); cualquier GPU CUDA con al menos 16 GB para 1024x1024 en fp16. Para 512x512 bastan GPUs de ~4-6 GiB.
- Cabe en GPU de consumo: sí, en RTX 5060 Ti 16 GB y en GPUs con 8-16 GiB para resoluciones medias; para 1024x1024 se recomienda 16 GiB.
- Opciones de despliegue: paquete `fastforks` (backends `portable` y `kernels`), PyTorch con `torch.compile`, TensorRT fp16 (build lento, > 5 min), ComfyUI (comportamiento de teselado replicado).
- Latencia y throughput: 512x512 en 718 ms (`drct-x4`, kernels) y 1399 ms (`drct-l-x4`, kernels); primera llamada tras carga en 0,77-1,45 s con kernels.
- CPU: soportado en fp32, con paridad numérica frente al original (max |diff| <= 2e-06).

## Comparativa con modelos similares

| Modelo | Tipo | Escala | PSNR DIV2K x4 (Y) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `drct-x4` | Swin Transformer denso | x4 | 30,76 | MIT | Pesos externos validados por SHA-256 |
| `drct-l-x4` | Swin Transformer denso (12 grupos) | x4 | 31,00 | MIT | Pesos externos validados por SHA-256 |
| Real-ESRGAN | GAN para degradaciones reales | x4 | No comparable (entrenado para degradaciones reales, no bicúbicas) | BSD-3-Clause (código) | Público |
| SwinIR | Swin Transformer clásico | x4 | No disponible en la información proporcionada | Apache 2.0 | Público |

La model card advierte explícitamente que Real-ESRGAN está entrenado para degradaciones del mundo real y no para bicúbicas, por lo que su PSNR no es comparable con los valores de DRCT. No se proporcionan datos de otros upscalers orientados a PSNR en la información disponible.

## Limitaciones y advertencias

- Modelo especializado en degradación bicúbica: no está diseñado para degradaciones reales (ruido, compresión JPEG, desenfoque), por lo que su rendimiento en imágenes del mundo real puede degradarse frente a upscalers tipo GAN.
- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni agentes; cualquier uso en esos contextos es inadecuado.
- Riesgo de artefactos en imágenes fuera de distribución: al entrenarse en DIV2K/Flickr2K, puede generar texturas sintéticas o halos en contenido muy distinto (texto fino, patrones repetitivos, imágenes médicas).
- Límite de resolución probado: 1024x1024 en fp16; para tamaños mayores debe usarse `tile=` con solapamiento, lo que puede introducir costuras si el solapamiento es insuficiente.
- Requiere descarga externa de pesos desde Google Drive: el repositorio no aloja los checkpoints, por lo que la disponibilidad depende de enlaces de terceros (validados por SHA-256).
- El paquete se marca como "Tier: experimental" en la model card, lo que desaconseja su uso en producción sin validación previa.
- La licencia MIT se aplica al código y a los pesos según la model card, pero esta indica que las cadenas del código original se registran "as they are" y deben revisarse antes de cualquier otro uso.
- No se documentan sesgos (no aplica en el sentido habitual), pero el dataset de entrenamiento (DIV2K/Flickr2K) tiene una distribución demográfica y de contenido sesgada hacia fotografía natural de alta calidad.

## Enlaces

- Hugging Face: https://huggingface.co/fastforks/drct
- Repositorio del paquete: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Código original de DRCT: https://github.com/ming053l/DRCT (commit `c0a8b51e6924`)
- Licencia del código original: https://github.com/ming053l/DRCT/blob/c0a8b51e69241cf7f8ae598053235ff498517935/LICENSE
- README del código original: https://github.com/ming053l/DRCT/blob/c0a8b51e69241cf7f8ae598053235ff498517935/README.md
- Model zoo de pesos originales: https://drive.google.com/drive/folders/1QJHdSfo-0eFNb96i8qzMJAPw31u9qZ7U
- Pesos `DRCT-L_X4.pth`: https://drive.usercontent.google.com/download?export=download&confirm=t&id=1bVxvA6QFbne2se0CQJ-jyHFy94UOi3h5
- Pesos `DRCT_X4.pth`: https://drive.usercontent.google.com/download?export=download&confirm=t&id=1jw2UWAersWZecPq-c_g5RM3mDOoc_cbd
- Benchmarks y protocolo: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- `card.toml` con hashes completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/restoration/models/drct/card.toml
