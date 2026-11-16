# fastforks/realesrgan

## Resumen

Real-ESRGAN es un modelo de superresolución y restauración de imágenes desarrollado originalmente por Xintao Wang y colaboradores (publicado en ICCVW 2021). A diferencia de los modelos de superresolución clásicos orientados a maximizar PSNR, Real-ESRGAN se entrena con una GAN sobre degradaciones sintéticas realistas (desenfoque, ruido, compresión JPEG y un proceso de degradación en dos etapas), lo que le permite restaurar imágenes del mundo real y no solo ampliarlas de forma limpia.

El repositorio `fastforks/realesrgan` no aloja pesos: es una model card de integración para la librería `fastforks`, que descarga los pesos oficiales de los autores y los verifica mediante SHA-256. Ofrece tres variantes: `realesrgan-x2plus` (escala x2), `realesrgan-x4plus` (escala x4 general) y `realesrgan-x4plus-anime-6b` (escala x4 optimizada para imágenes de anime, con 6 bloques en lugar de 23).

La arquitectura es una RRDBNet (23 bloques residuales-en-residuales densos de convoluciones 3x3, seguidas de dos muestreos ascendentes nearest x2 con convoluciones). Es relevante para desarrolladores porque proporciona una implementación portable y con kernels optimizados, con métricas de latencia y memoria medidas en hardware consumer (RTX 5060 Ti 16 GB), lo que facilita evaluar su despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RRDBNet (23 bloques residuales-en-residuales densos de convoluciones 3x3, dos upsamplings nearest x2); variante anime con 6 bloques |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, entrada H x W >= 32, múltiplo de 32) |
| Tipos de cuantizacion | fp16 y fp32 (según la model card); no se documentan otras cuantizaciones |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | BSD-3-Clause (código y pesos) |
| Formato de pesos | `.pth` (PyTorch); descarga desde enlaces de los autores con verificación SHA-256 |

## Arquitectura y entrenamiento

Real-ESRGAN emplea una red generadora RRDBNet compuesta por 23 bloques residuales-en-residuales densos (RDB) de convoluciones 3x3, seguidos de dos etapas de upsampling nearest x2 con convoluciones. La variante `realesrgan-x4plus-anime-6b` reduce el número de bloques a 6 para imágenes de anime. El modelo se entrena con una GAN sobre degradaciones sintéticas del mundo real: desenfoque, ruido, compresión JPEG y un proceso de degradación en dos etapas, lo que le permite generalizar a imágenes degradadas reales en lugar de solo a pares bicúbicos limpios.

Los datos de entrenamiento documentados son DIV2K (1000 imágenes 2K de NTIRE 2017), Flickr2K (2650 imágenes 2K de Flickr, de EDSR) y OutdoorSceneTraining (OST, de SFTGAN), combinados como DF2K + OST usando solo imágenes de alta resolución. Para el modelo de anime se usan imágenes de anime no especificadas en la documentación. La model card no detalla el número de tokens ni el proceso de RLHF/DPO (no aplica a un modelo de imagen). La innovación destacable es el esquema de degradación sintética realista de dos etapas que da nombre al modelo.

## Capacidades

- Superresolución de imágenes RGB con factores x2 y x4 según la variante.
- Restauración de imágenes degradadas del mundo real (desenfoque, ruido, artefactos JPEG).
- Procesamiento por tiles (`tile=`) para imágenes grandes, con solapamiento, al estilo de ComfyUI.
- Entrada de cualquier tamaño H x W >= 32, con padding a múltiplo de 32.
- Salida RGB en [0, 1] escalada por `model.scale` respecto a la entrada.
- Variante especializada para ilustración/anime (`realesrgan-x4plus-anime-6b`).
- Backends `portable` y `kernels` (kernels optimizados alojados en `fastforks/kernels`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no aplica).

## Casos de uso

- Restauración de fotografías antiguas o de baja calidad: el modelo revierte desenfoque, ruido y artefactos JPEG gracias a su entrenamiento sobre degradaciones sintéticas realistas, produciendo una versión x4 lista para archivo o impresión.
- Mejora de imágenes en pipelines de comercio electrónico: ampliar fotos de producto de baja resolución a x2 o x4 antes de publicarlas, usando `tile=` para imágenes grandes y manteniendo el uso de memoria controlado.
- Reescalado de ilustración y anime: la variante `realesrgan-x4plus-anime-6b` está optimizada para este dominio y es más rápida (132 ms en 512x512 con kernels frente a 403 ms de `x4plus`).
- Preprocesado para modelos de visión: aumentar la resolución de imágenes de entrada antes de pasarlas a detectores o clasificadores que se benefician de mayor detalle.
- Restauración de fotogramas en vídeo: con 80,2 ms por fotograma a 512x512 (`x2plus` con kernels) se puede procesar vídeo de forma casi interactiva en una GPU consumer.
- Integración en aplicaciones de escritorio o móviles con backend `portable`: la carga del modelo es de 0,10-0,25 s y la primera llamada de 0,11-0,62 s, adecuado para uso bajo demanda.
- Procesamiento por lotes en servidor con TensorRT fp16: `x2plus` alcanza 59,7 ms por imagen de 512x512, útil para pipelines de alto throughput.

## Benchmarks y rendimiento

Datos de latencia y memoria medidos en RTX 5060 Ti 16 GB (sm_120), imagen sintética de 512x512:

| Modelo | Tiempo original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Memoria pico portable (MiB alloc/reserved) |
|---|---|---|---|---|---|
| `realesrgan-x2plus` | 128 | 97,0 | 80,2 | 1,6x | 333 / 394 |
| `realesrgan-x4plus` | 631 | 471 | 403 | 1,6x | 1220 / 1454 |
| `realesrgan-x4plus-anime-6b` | 205 | 155 | 132 | 1,6x | 1197 / 1430 |

Rendimiento con torch.compile y TensorRT fp16 (512x512):

| Modelo | Portable (ms) | Compile (ms) | TensorRT fp16 (ms) | Kernels (ms) | Compilación en frío (s) | Build ONNX+engine (s) |
|---|---|---|---|---|---|---|
| `realesrgan-x2plus` | 97,0 | 85,2 | 59,7 | 80,2 | 33,2 | 40,3 |
| `realesrgan-x4plus` | 471 | 354 | 273 | 403 | 29,9 | 55,2 |
| `realesrgan-x4plus-anime-6b` | 155 | 114 | 83,1 | 132 | 10,0 | 36,7 |

Tamaños de entrada máximos probados (portable, fp16, RTX 5060 Ti 16 GB): `x2plus` hasta 1988x2880 (11,9 GiB pico asignado, 14,6 reservado); `x4plus` y `anime-6b` hasta 1024x2048 (12,7 GiB pico asignado, 14,9 reservado).

La model card indica que Real-ESRGAN se entrena para degradaciones reales y no para bicúbico, por lo que su PSNR en DIV2K es bajo y no es comparable con upscalers orientados a PSNR. No se incluyen en la información proporcionada los valores numéricos de PSNR/SSIM de DIV2K.

## Requisitos de hardware

- VRAM estimada: ~333 MiB pico para `x2plus` y ~1220 MiB para `x4plus`/`anime-6b` en 512x512 (portable, fp16); hasta ~14,9 GiB reservados para imágenes grandes (1024x2048 o 1988x2880).
- GPU recomendadas: RTX 5060 Ti 16 GB es la hardware de referencia medida; cualquier GPU con >= 8 GB debería manejar imágenes moderadas, y >= 16 GB para imágenes grandes sin tiles.
- Cabe en GPU consumer: sí, con 512x512 requiere ~1,2-1,3 GiB asignados; con imágenes grandes conviene usar `tile=`.
- Opciones de despliegue: librería `fastforks` con backends `portable` y `kernels`; también `torch.compile` y TensorRT fp16 (conversión ONNX + engine). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a modelos de imagen).
- Latencia: 80,2-403 ms por imagen 512x512 según variante y backend; 59,7-273 ms con TensorRT fp16. Throughput aproximado de 2,5-12,5 imágenes/s en 512x512.
- Tiempo de carga: 0,10-0,25 s (portable) y 1,26-2,43 s (kernels); primera llamada: 0,11-0,62 s.

## Comparativa con modelos similares

| Modelo | Arquitectura | Escala | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Real-ESRGAN (`fastforks`) | RRDBNet 23 bloques | x2 / x4 | BSD-3-Clause | Pesos en GitHub de los autores, verificación SHA-256 | Entrenado para degradaciones reales; variante anime |
| ESRGAN | RRDBNet | x4 | no disponible en la información | no disponible | Base arquitectónica de Real-ESRGAN; no se dispone de datos comparativos |
| Modelos orientados a PSNR (p. ej. EDSR) | no disponible | no disponible | no disponible | no disponible | La model card indica que la comparación por PSNR no es representativa para Real-ESRGAN |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Real-ESRGAN está entrenado para degradaciones reales, no para bicúbico; su PSNR en DIV2K es bajo y no debe evaluarse con métricas orientadas a PSNR.
- Riesgo de artefactos o alucinación de detalle en imágenes muy degradadas o fuera de la distribución de entrenamiento (la model card no cuantifica este riesgo).
- El modelo de anime se entrenó con imágenes de anime no especificadas; su comportamiento en otros dominios no está documentado.
- La entrada debe ser una imagen RGB con H x W >= 32 y múltiplo de 32 (con padding automático); imágenes grandes requieren `tile=` para no agotar la VRAM.
- Licencia BSD-3-Clause permite uso comercial, pero la model card advierte que el paquete original es de uso de investigación y recomienda revisar las licencias antes de cualquier otro uso.
- Este repositorio no contiene pesos: la disponibilidad depende de los enlaces de descarga de los autores y de la verificación SHA-256.
- No se documentan sesgos demográficos ni limitaciones idiomáticas (no aplica a un modelo de imagen).
- La información de benchmarks se limita a una GPU (RTX 5060 Ti 16 GB, sm_120); el rendimiento en otro hardware puede diferir.

## Enlaces

- Hugging Face: https://huggingface.co/fastforks/realesrgan
- Código de fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Código original de Real-ESRGAN: https://github.com/xinntao/Real-ESRGAN (commit `a4abfb2979a7`)
- Pesos `RealESRGAN_x2plus.pth`: https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.1/RealESRGAN_x2plus.pth
- Pesos `RealESRGAN_x4plus.pth`: https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth
- Pesos `RealESRGAN_x4plus_anime_6B.pth`: https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth
- `card.toml` con hashes completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/restoration/models/realesrgan/card.toml
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Licencia de Real-ESRGAN: https://github.com/xinntao/Real-ESRGAN/blob/a4abfb2979a7bbff3f69f58f58ae324608821e27/LICENSE
- Licencia de BasicSR: https://github.com/XPixelGroup/BasicSR/blob/8d56e3a045f9fb3e1d8872f92ee4a4f07f886b0a/LICENSE.txt
