# fastforks/swinir

## Resumen

SwinIR (fastforks) es un paquete de inferencia para el modelo SwinIR de restauración de imágenes, publicado por el usuario fastforks en Hugging Face. SwinIR, propuesto por Liang et al. en ICCVW 2021, aplica grupos residuales de capas Swin Transformer con atención de ventana de 8x8 (desplazada cada dos capas) entre un tallo convolucional y un módulo de upsampling. Resuelve tareas de superresolución y restauración de imagen: elimina ruido, artefactos de compresión y desenfoque, y amplía la resolución por factores x2 o x4.

El repositorio no aloja pesos: es únicamente una model card que describe cómo fastforks descarga los pesos originales de los autores desde GitHub Releases y los verifica mediante SHA-256. Ofrece cuatro variantes: dos modelos clásicos entrenados con degradación bicúbica sobre DF2K (`swinir-m-x2`, `swinir-m-x4`) y dos modelos "real-world" entrenados con degradaciones BSRGAN (`swinir-m-x4-real`, `swinir-l-x4-real`). La variante L emplea 9 grupos residuales y 240 canales frente a los 6 grupos y 180 canales de la M.

Su relevancia actual reside en la integración con el runtime fastforks, que incluye kernels CUDA propios y un backend portable, con mejoras de velocidad de hasta 6,1x frente al código original y reducciones notables de memoria pico. Es una opción práctica para pipelines de restauración de imagen en producción cuando se necesita una licencia permisiva (Apache-2.0) y control de integridad de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SwinIR: grupos residuales de Swin Transformer con atención de ventana 8x8 desplazada, tallo convolucional y upsampler |
| Parametros totales | no disponible (no se especifica el recuento exacto; variante L con 9 grupos y 240 canales, variante M con 6 grupos y 180 canales) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; entrada H x W >= 32, múltiplo de 32) |
| Tipos de cuantizacion | no disponible (inferencia en fp16 y fp32; no se documentan cuantizaciones int8/int4) |
| Idiomas soportados | no disponible (modelo de imagen, no lingüístico) |
| Licencia | Apache-2.0 (código y pesos) |
| Formato de pesos | `.pth` (PyTorch state dict, descargados desde GitHub Releases de los autores) |

## Arquitectura y entrenamiento

SwinIR combina un extractor de características convolucional superficial con una serie de grupos residuales compuestos por bloques Swin Transformer. Cada bloque aplica atención por ventanas locales de 8x8 y desplaza la partición de ventanas en capas alternas para permitir interacción entre ventanas vecinas, manteniendo un coste computacional lineal con la resolución. La salida pasa por un módulo de reconstrucción y upsampling que escala la imagen por el factor configurado (x2 o x4). La variante L incrementa la profundidad a 9 grupos residuales y el ancho a 240 canales; la M usa 6 grupos y 180 canales.

El entrenamiento de los modelos clásicos se realizó sobre imágenes de alta resolución de DF2K (DIV2K, 1000 imágenes 2K del desafío NTIRE 2017, más Flickr2K, 2650 imágenes 2K de Flickr procedentes de EDSR), con degradación bicúbica y optimización de PSNR. Los modelos "real-world" se entrenaron con degradaciones sintéticas de BSRGAN (desenfoque, ruido, compresión JPEG y downsampling variados) y un objetivo GAN, lo que mejora la percepción visual en imágenes reales degradadas. No se documentan detalles sobre RLHF/DPO (no aplica) ni sobre el número exacto de iteraciones o tokens de entrenamiento.

La innovación práctica del paquete fastforks es el backend `kernels`, con kernels CUDA optimizados que reducen el tiempo de inferencia hasta 6,1x frente a la implementación original y 2,1x frente al backend portable, además de recortar la memoria pico. También se documenta soporte para `torch.compile` y TensorRT fp16, con tiempos de preparación de 60-68 s (compile) y 102-193 s (ONNX + engine).

## Capacidades

- Superresolución de imagen x2 y x4 con dos modos: clásico (bicúbico, orientado a PSNR) y real-world (degradaciones BSRGAN, orientado a percepción).
- Restauración de imágenes degradadas: reducción de ruido, artefactos de compresión JPEG y desenfoque.
- Procesamiento de imágenes grandes mediante tiles solapados (`tile=`), similar a ComfyUI, para limitar el uso de memoria.
- Entrada RGB única; salida RGB en [0, 1] escalada por el factor del modelo.
- Backends `portable` (PyTorch) y `kernels` (CUDA optimizado), con verificación de integridad de pesos por SHA-256.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo de imagen puro.
- No dispone de modo thinking, visión de alto nivel ni audio.

## Casos de uso

- Restauración de fotografías antiguas o escaneadas: `swinir-m-x4-real` corrige ruido, desenfoque y artefactos de compresión de escaneos y amplía x4, adecuado por su entrenamiento con degradaciones realistas BSRGAN.
- Mejora de imágenes de baja resolución en catálogos de e-commerce: `swinir-m-x2` duplica la resolución de miniaturas o imágenes de producto con degradación bicúbica controlada, manteniendo fidelidad PSNR.
- Pipeline de upscaling por lotes en servidores con GPU consumer: el backend `kernels` procesa 512x512 en 553-1036 ms con 1,3-1,8 GiB de memoria pico, lo que permite lotes grandes en una RTX 5060 Ti de 16 GB.
- Restauración de fotogramas de vídeo de baja calidad: con `tile=` se pueden procesar fotogramas de alta resolución sin exceder la VRAM; el modelo x4 real mejora capturas de cámaras de vigilancia o móviles antiguos.
- Preprocesado para modelos de visión por computador: ampliar y limpiar imágenes antes de pasarlas a detectores o clasificadores, usando `swinir-m-x4` para preservar detalle en dominios con degradación bicúbica.
- Integración en aplicaciones de escritorio o móviles con backend portable: el backend `portable` en fp16 funciona en cualquier GPU con PyTorch, con tiempos de 739-2099 ms para 512x512, adecuado para herramientas de retoque fotográfico.
- Archivística y digitalización patrimonial: restaurar documentos y fotografías históricas con licencia Apache-2.0, sin restricciones de uso comercial, verificando los pesos por SHA-256 antes de procesar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (PSNR/SSIM) en la información disponible; la model card menciona una sección de accuracy sobre DIV2K pero el contenido está truncado. Se presentan a continuación los datos de rendimiento medidos en una RTX 5060 Ti 16 GB (sm_120) para entrada 512x512:

| Modelo | Tiempo original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Memoria pico kernels (MiB alloc/reserved) |
|---|---|---|---|---|---|
| `swinir-l-x4-real` | 3709 | 2099 | 1036 | 3,6x | 1806 / 1934 |
| `swinir-m-x2` | 3252 | 739 | 553 | 5,9x | 1353 / 1454 |
| `swinir-m-x4` | 3497 | 767 | 576 | 6,1x | 1354 / 1456 |
| `swinir-m-x4-real` | 2462 | 1242 | 584 | 4,2x | 1353 / 1814 |

Tamaños máximos probados (portable, fp16, RTX 5060 Ti 16 GB): `swinir-l-x4-real` 512x512 (4,0 GiB pico asignado, 5,8 reservado); `swinir-m-x2` y `swinir-m-x4` 1024x1024 (11,0 GiB pico asignado); `swinir-m-x4-real` 512x512 (3,1 GiB pico asignado).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SwinIR (fastforks) | no disponible (M: 6 grupos/180 canales; L: 9 grupos/240 canales) | H x W >= 32, múltiplo de 32; hasta 1024x1024 probado | Apache-2.0 | Hugging Face (card) + pesos en GitHub Releases | Backend kernels CUDA propio, verificación SHA-256 |
| Real-ESRGAN | no disponible | imagen arbitraria con tiles | BSD-3-Clause (código) / licencia de pesos no verificada | GitHub, pesos públicos | Orientado a percepción, muy extendido en upscaling real-world |
| ESRGAN | no disponible | imagen arbitraria | Apache-2.0 (código) | GitHub, pesos públicos | Base GAN para restauración; sin atención transformer |
| Swin2SR | no disponible | imagen arbitraria | Apache-2.0 | GitHub, Hugging Face | Evolución de SwinIR con Swin Transformer V2 |

No se dispone de datos comparativos de calidad (PSNR/SSIM) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos: depende de la descarga desde GitHub Releases de los autores y de la verificación SHA-256; si esos enlaces cambian o desaparecen, el paquete deja de ser funcional.
- La model card califica el paquete como "experimental" (tier: experimental); no se garantiza estabilidad de API ni de resultados en producción.
- Los modelos clásicos (`swinir-m-x2`, `swinir-m-x4`) asumen degradación bicúbica; aplicarlos a imágenes reales con ruido o compresión puede producir resultados pobres o artefactos.
- Los modelos real-world pueden generar detalles inventados (alucinación visual) al priorizar la percepción sobre la fidelidad PSNR; no son adecuados para aplicaciones forenses o médicas que requieran exactitud.
- No se documentan sesgos específicos ni limitaciones idiomáticas (no es un modelo lingüístico), pero los sesgos de los datasets de entrenamiento (DIV2K, Flickr2K) pueden afectar a la representación de ciertos contenidos.
- La licencia Apache-2.0 se aplica al código y a los pesos según la model card; no obstante, esta indica "research-use package" y recomienda revisar las cadenas de licencia originales antes de otros usos.
- El rendimiento medido corresponde a una RTX 5060 Ti 16 GB; en GPUs con menos VRAM puede ser necesario usar tiles o reducir la resolución de entrada.
- La información sobre calidad (PSNR/SSIM) está truncada en la model card; no se pueden verificar métricas de accuracy sin consultar la fuente original.

## Enlaces

- Hugging Face: https://huggingface.co/fastforks/swinir
- Repositorio fastforks: https://github.com/kleinicke/fastforks
- Kernels fastforks: https://huggingface.co/fastforks/kernels
- Código original SwinIR: https://github.com/JingyunLiang/SwinIR (commit `6545850fbf8d`)
- Pesos `swinir-l-x4-real`: https://github.com/JingyunLiang/SwinIR/releases/download/v0.0/003_realSR_BSRGAN_DFOWMFC_s64w8_SwinIR-L_x4_GAN.pth
- Pesos `swinir-m-x2`: https://github.com/JingyunLiang/SwinIR/releases/download/v0.0/001_classicalSR_DF2K_s64w8_SwinIR-M_x2.pth
- Pesos `swinir-m-x4`: https://github.com/JingyunLiang/SwinIR/releases/download/v0.0/001_classicalSR_DF2K_s64w8_SwinIR-M_x4.pth
- Pesos `swinir-m-x4-real`: https://github.com/JingyunLiang/SwinIR/releases/download/v0.0/003_realSR_BSRGAN_DFO_s64w8_SwinIR-M_x4_GAN.pth
- Benchmarks fastforks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Card TOML con hashes completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/restoration/models/swinir/card.toml
- Paper SwinIR (ICCVW 2021): no disponible en la información proporcionada
