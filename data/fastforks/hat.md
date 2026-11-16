# fastforks/hat

## Resumen

HAT (Hybrid Attention Transformer) es un modelo de superresolución de imagen presentado en CVPR 2023 por Chen et al. Este repositorio, `fastforks/hat`, es únicamente una model card: no aloja pesos, sino que documenta cómo descargar los checkpoints originales de los autores y verificarlos mediante SHA-256. La implementación ejecutable vive en el repositorio `fastforks` y los kernels optimizados en `fastforks/kernels`.

La arquitectura combina grupos residuales de bloques de atención híbrida: atención por ventanas de 16x16 píxeles más una rama convolucional con atención de canal, y un bloque de atención cruzada con solapamiento por grupo. Se ofrecen tres variantes: `hat-s-x4` (modelo pequeño, 144 canales), `hat-x4` (modelo clásico x4 preentrenado en ImageNet y afinado en DF2K) y `real-hat-gan-x4` (modelo GAN x4 para degradaciones del mundo real, entrenado con degradaciones de Real-ESRGAN).

El modelo resuelve la restauración y el reescalado de imágenes RGB con factor x4, aceptando entradas de cualquier tamaño H x W mayor o igual a 32 (con padding a múltiplo de 32) y produciendo la imagen restaurada en [0, 1]. Su relevancia práctica reside en que el backend `kernels` acelera la inferencia entre 2,1x y 2,5x respecto al código original, con un pico de memoria notablemente menor, lo que lo hace viable en GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de atención híbrida (grupos residuales con atención por ventanas 16x16 + rama convolucional con atención de canal, y bloque de atención cruzada solapada por grupo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; entrada H x W >= 32, padding a múltiplo de 32) |
| Tipos de cuantizacion | fp16 y fp32 (según precisión del backend); no se documentan otras cuantizaciones |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | Apache-2.0 (código y pesos de las tres variantes; uso comercial permitido) |
| Formato de pesos | `.pth` (PyTorch); los pesos no se alojan en el repositorio, se descargan de los enlaces de los autores |

## Arquitectura y entrenamiento

HAT es un transformer para restauración de imagen que organiza la red en grupos residuales. Cada grupo contiene bloques de atención híbrida que combinan atención por ventanas de 16x16 píxeles con una rama convolucional que aplica atención de canal, más un bloque de atención cruzada con solapamiento que intercambia información entre ventanas vecinas. Esta combinación busca capturar tanto dependencias locales de alta frecuencia como contexto global de la imagen, algo crítico en superresolución.

El entrenamiento sigue dos fases: preentrenamiento en ImageNet-1k (ILSVRC 2012, clasificación) y afinado en DF2K, es decir, DIV2K (1000 imágenes 2K de NTIRE 2017) más Flickr2K (2650 imágenes 2K de Flickr, del dataset EDSR), con degradación bicúbica. La variante `real-hat-gan-x4` se entrena con degradaciones de Real-ESRGAN para escenarios del mundo real. La configuración corresponde a `train_HAT_SRx4_ImageNet_from_scratch.yml` y `train_HAT_SRx4_finetune_from_ImageNet_pretrain.yml`. No se documenta en la información disponible el uso de RLHF ni DPO (no aplica a este tipo de modelo).

## Capacidades

- Superresolución de imagen x4: restauración y reescalado de una imagen RGB de entrada a 4 veces su tamaño.
- Restauración de imágenes con degradaciones sintéticas (bicúbica) en las variantes `hat-s-x4` y `hat-x4`.
- Restauración de imágenes con degradaciones del mundo real en `real-hat-gan-x4` (ruido, compresión, desenfoque según el esquema de Real-ESRGAN).
- Procesamiento por mosaicos (`tile=`) para imágenes grandes, con solapamiento, al estilo de ComfyUI.
- Entrada de cualquier tamaño H x W mayor o igual a 32, con padding automático a múltiplo de 32.
- Salida RGB normalizada en [0, 1] con factor de escala `model.scale`.
- Backends `portable` y `kernels`; el segundo ofrece kernels optimizados con aceleración medida.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente image-to-image.

## Casos de uso

- Restauración de fotografías antiguas o de baja resolución: `real-hat-gan-x4` está entrenado con degradaciones realistas (ruido, compresión JPEG, desenfoque), por lo que es la variante adecuada para escanear y recuperar detalle en archivos fotográficos.
- Mejora de imágenes para impresión: `hat-x4` permite ampliar una imagen x4 manteniendo PSNR y SSIM altos sobre degradación bicúbica, útil para preparar material gráfico a mayor resolución antes de imprimir.
- Preprocesado en pipelines de visión por computador: ampliar recortes pequeños (por ejemplo, matrículas o caras) antes de pasarlos a un detector o clasificador, usando `tile=` para lotes de parches.
- Restauración de fotogramas de vídeo: al procesar 512x512 en 956 ms con el backend `kernels` en una RTX 5060 Ti, es viable restaurar secuencias cortas o keyframes en un flujo offline.
- Mejora de texturas en videojuegos y renders: el modelo pequeño `hat-s-x4` reduce el pico de memoria a 1856 MiB reservados en 512x512, lo que permite integrarlo en herramientas de autoría con presupuesto de VRAM ajustado.
- Superresolución en dispositivos de consumo: con 7,5 GiB de pico en 1024x1024 para `hat-s-x4` en fp16, cabe en GPUs de 16 GB como la RTX 5060 Ti, permitiendo despliegues locales sin infraestructura de datacenter.
- Restauración por lotes en servidor: el backend `portable` con `torch.compile` reduce el tiempo a 750 ms en 512x512 para `hat-s-x4`, útil para procesar colas de imágenes en producción.

## Benchmarks y rendimiento

Rendimiento de inferencia en restauración sintética 512x512 (RTX 5060 Ti 16 GB, sm_120), según la model card:

| Modelo | Tiempo original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Pico memoria portable (MiB alloc/reserved) | Pico memoria kernels (MiB alloc/reserved) |
|---|---|---|---|---|---|---|
| `hat-s-x4` | 2402 | 1072 | 956 | 2,5x | 1984 / 2148 | 1856 / 1888 |
| `hat-x4` | 3038 | 1596 | 1427 | 2,1x | 2426 / 2590 | 2298 / 2470 |
| `real-hat-gan-x4` | 3038 | 1597 | 1427 | 2,1x | 2426 / 2610 | 2298 / 2470 |

Arranque y primera llamada:

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `hat-s-x4` | 3,14 | 0,35 | 1,58 | 4,41 | 1,27 | 1,07 |
| `hat-x4` | 1,75 | 0,47 | 1,36 | 5,42 | 1,81 | 1,57 |
| `real-hat-gan-x4` | 1,96 | 1,24 | 1,49 | 5,41 | 1,77 | 1,56 |

`torch.compile` y TensorRT (512x512):

| Modelo | Portable (ms) | Compile (ms) | TensorRT fp16 | Kernels (ms) | Preparación compile (s) | Pico portable (MiB) | Pico compile (MiB) |
|---|---|---|---|---|---|---|---|
| `hat-s-x4` | 1072 | 750 | falla (build del engine) | 956 | 41,9 | 1984 / 2148 | 2352 / 3068 |
| `hat-x4` | 1596 | 1185 | diferido (>5 min) | 1427 | 53,4 | 2426 / 2590 | 1811 / 2750 |
| `real-hat-gan-x4` | 1597 | 1185 | diferido (>5 min) | 1427 | 54,3 | 2426 / 2610 | 1811 / 2750 |

Memoria máxima probada en 1024x1024 (portable, fp16): `hat-s-x4` 7,5 GiB asignados y 11,1 GiB reservados; `hat-x4` y `real-hat-gan-x4` 9,4 GiB asignados y 14,7 GiB reservados.

Los resultados de precisión (PSNR/SSIM sobre DIV2K) aparecen truncados en la información disponible; no se reproducen cifras concretas para no inventar datos.

## Comparativa con modelos similares

| Modelo | Tipo | Escala | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `hat-x4` (este repo) | Transformer de atención híbrida | x4 | Apache-2.0 | Pesos en enlaces de los autores, verificación SHA-256 | Preentrenado ImageNet + afinado DF2K |
| `hat-s-x4` (este repo) | Transformer de atención híbrida (144 canales) | x4 | Apache-2.0 | Pesos en enlaces de los autores | Variante pequeña, menor memoria |
| `real-hat-gan-x4` (este repo) | Transformer de atención híbrida con GAN | x4 | Apache-2.0 | Pesos en enlaces de los autores | Degradaciones realistas (Real-ESRGAN) |
| Real-ESRGAN | GAN para restauración real | x4 (típico) | no disponible en la información | no disponible en la información | La model card lo menciona como referencia de degradaciones, no como comparativa de rendimiento |

No se dispone en la información proporcionada de datos comparativos de parámetros, contexto o precisión frente a otros modelos de superresolución.

## Limitaciones y advertencias

- El repositorio no contiene pesos: hay que descargarlos de los enlaces de Google Drive de los autores y verificar el SHA-256; si los enlaces caen, el modelo no es utilizable desde este repo.
- `real-hat-gan-x4` está entrenado para degradaciones reales, no bicúbicas; su PSNR sobre DIV2K bicúbico es bajo y no debe compararse con upscalers orientados a PSNR.
- Los benchmarks de velocidad se han medido únicamente en una RTX 5060 Ti 16 GB (sm_120); el rendimiento en otras GPUs puede diferir.
- TensorRT fp16 falla al construir el engine en `hat-s-x4` y se difiere más de 5 minutos en `hat-x4` y `real-hat-gan-x4`; no es una vía de despliegue práctica según los datos disponibles.
- El modelo trabaja exclusivamente con imágenes RGB; no procesa otros formatos ni modalidades.
- Entradas menores de 32 píxeles no están soportadas; las dimensiones se redondean a múltiplo de 32 mediante padding.
- La licencia del código original se registra tal cual en la model card ("research-use package"); aunque los pesos figuran como Apache-2.0 con uso comercial permitido, conviene revisar los términos antes de un despliegue comercial.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas por tratarse de un modelo de imagen; no aplica.
- El estado del proyecto es "experimental" según la propia model card.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/hat
- Repositorio de código fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original de HAT (XPixelGroup): https://github.com/XPixelGroup/HAT (commit `1638a9a82258`)
- Licencia del código original: https://github.com/XPixelGroup/HAT/blob/1638a9a822581657811867bf670717f8371fc3e5/LICENSE
- README original con enlaces a pesos preentrenados: https://github.com/XPixelGroup/HAT/blob/1638a9a822581657811867bf670717f8371fc3e5/README.md
- Carpeta de pesos preentrenados de los autores: https://drive.google.com/drive/folders/1HpmReFfoUqUbnAOQ7rvOeNU3uf_m69w0
- Documentación de benchmarks de fastforks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Hashes completos (card.toml): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/restoration/models/hat/card.toml
- Pesos `hat-s-x4`: https://drive.usercontent.google.com/download?export=download&confirm=t&id=1YvU9PF1XqlP8TVzH7P0bg-YlfP1TKDPC
- Pesos `hat-x4`: https://drive.usercontent.google.com/download?export=download&confirm=t&id=1cxls85ZE7kalhNy47eBJI_L_Lwf9hxRI
- Pesos `real-hat-gan-x4`: https://drive.usercontent.google.com/download?export=download&confirm=t&id=1Ma12vCWT27P9M99-s2RXnynKN-OQsBrv
