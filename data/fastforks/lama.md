# fastforks/lama

## Resumen

LaMa (Large-Mask Inpainting) es un modelo de inpainting de imágenes presentado por Suvorov et al. en WACV 2022. Resuelve la reconstrucción de regiones ocluidas o eliminadas en una imagen manteniendo intacto el resto del contenido, incluso con máscaras de gran tamaño. Su innovación principal son las convoluciones rápidas de Fourier (FFC), que le otorgan un campo receptivo global desde el primer bloque, lo que le permite generalizar a resoluciones superiores a las de entrenamiento.

Este repositorio, `fastforks/lama`, no contiene pesos: es únicamente una model card que documenta la integración de los pesos originales de `big-lama` (51 M de parámetros, entrenado en Places365 a 256 x 256) dentro del runtime `fastforks`. La relevancia actual radica en que ofrece una implementación optimizada con backend portable y kernels CUDA propios, con métricas de latencia y memoria publicadas, y verificación de paridad numérica frente al código original.

El modelo se distribuye bajo licencia Apache-2.0 y está pensado para tareas de restauración de imagen (inpainting, eliminación de objetos, reconstrucción de zonas dañadas) en pipelines de image-to-image.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con convoluciones rápidas de Fourier (FFC): encoder de 3 convoluciones con stride, 18 bloques residuales FFC y decoder con convolución transpuesta |
| Parametros totales | 51 M (variante `big-lama`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen); entrada de cualquier H x W >= 16, con padding a múltiplo de 8; probado hasta 3000 x 4000 |
| Tipos de cuantizacion | fp16 (por defecto en GPU), fp32 (CPU y referencia); no se documentan cuantizaciones de menor precisión (int8, int4) |
| Idiomas soportados | no aplica (modelo de imagen, sin entrada de texto) |
| Licencia | Apache-2.0 (código y pesos de `big-lama`) |
| Formato de pesos | checkpoint `.ckpt` original del autor (no alojado en este repo); runtime `fastforks` |

## Arquitectura y entrenamiento

LaMa emplea una arquitectura puramente convolucional sin atención: un encoder de tres convoluciones con stride, seguido de 18 bloques residuales con convoluciones rápidas de Fourier (FFC). En cada bloque FFC, la rama local aplica convoluciones espaciales convencionales y la rama global convoluciona en el dominio de la frecuencia, lo que proporciona un campo receptivo de imagen completa ya desde el primer bloque. El decoder es una convolución transpuesta que reconstruye la imagen a la resolución de entrada. Esta combinación permite manejar máscaras grandes y resoluciones arbitrarias sin reentrenar.

El modelo `big-lama` se entrenó sobre Places365-Challenge (aproximadamente 4,5 M de imágenes de las 8 M disponibles, 365 categorías de escenas) con recortes de 256 x 256 y máscaras aleatorias anchas y de caja generadas por los autores. No se documenta en la información disponible el uso de RLHF, DPO ni ajuste por preferencias, algo esperable en un modelo de visión de 2022. La innovación técnica destacable es precisamente el uso de FFC para obtener un campo receptivo global con coste computacional lineal respecto al número de píxeles.

## Capacidades

- Inpainting de imágenes RGB: rellena la región indicada por una máscara (píxel distinto de cero = agujero) a partir del contexto circundante, manteniendo el resto de la imagen sin cambios.
- Generalización a resoluciones superiores a la de entrenamiento (256 x 256), con soporte para entradas de cualquier tamaño H x W >= 16 con padding a múltiplo de 8.
- Procesamiento por tiles solapados (`tile=`) para imágenes grandes, al estilo de ComfyUI.
- Ejecución en CPU (float32) y GPU (float16 por defecto) con backends `portable` y `kernels` (kernels CUDA propios `cudnn_hacc`).
- Salida en RGB float32 en el rango [0, 1] con factor de escala `model.scale`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo de imagen a imagen.
- No acepta prompts de texto; el relleno se deriva exclusivamente del contexto visual.

## Casos de uso

- Eliminación de objetos en fotografías: se pasa la imagen junto con una máscara que cubra el objeto a eliminar y el modelo reconstruye el fondo a partir de la escena circundante, aprovechando el campo receptivo global de las FFC para mantener coherencia en máscaras grandes.
- Restauración de fotografías antiguas o dañadas: se enmascaran arañazos, manchas o zonas deterioradas y el modelo rellena con texturas coherentes con el resto de la imagen; el soporte de tiles permite procesar escaneos de alta resolución.
- Limpieza de marcas de agua o logotipos en material propio: con una máscara ajustada a la marca, el modelo reconstruye la región subyacente; útil en pipelines de publicación de imágenes.
- Preprocesado en visión por computador: eliminar regiones ocluidas o no deseadas antes de pasos posteriores de detección o segmentación, manteniendo el resto de la imagen intacto.
- Edición de imágenes en flujos tipo ComfyUI: el soporte de `tile=` y la API `restoration.load` permiten integrarlo como nodo de inpainting en pipelines de generación y edición.
- Reconstrucción de zonas faltantes en imágenes satelitales o médicas (con las cautelas oportunas): el modelo rellena huecos a partir del contexto, aunque su entrenamiento en escenas de Places365 limita la fidelidad en dominios muy distintos.
- Procesamiento por lotes en servidor: con latencias de 21-26 ms por imagen de 512 x 512 en una RTX 5060 Ti y un pico de memoria de unos 219 MiB, es viable atender cargas moderadas en una sola GPU consumer.

## Benchmarks y rendimiento

Rendimiento de restauración sobre entrada sintética de 512 x 512 (RTX 5060 Ti 16 GB, sm_120):

| Modelo | Tiempo original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Aceleración kernels vs portable | Memoria pico portable (MiB, alloc/reserved) | Memoria pico kernels (MiB, alloc/reserved) |
|---|---|---|---|---|---|---|---|
| `big-lama` | 38,0 | 26,0 | 21,2 | 1,8x | 1,2x | 219 / 242 | 219 / 284 |

Arranque y primera llamada:

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `big-lama` | 0,52 | 0,31 | 0,65 | 0,33 | 0,27 | 0,12 |

`torch.compile` y TensorRT:

| Modelo | Entrada | Portable (ms) | Compile (ms) | Kernels (ms) | Preparación compile (s) | Memoria pico portable (MiB) | Memoria pico compile (MiB) | Memoria pico kernels (MiB) |
|---|---|---|---|---|---|---|---|---|
| `big-lama` | 512x512 | 26,0 | 23,4 | 21,2 | 25,9 | 219 / 242 | 312 / 342 | 219 / 284 |

Paridad numérica con el código original: en CPU float32, diferencia máxima absoluta <= 1e-05; en GPU float16 (portable y kernels), error medio absoluto <= 0,002 y p99 <= 0,01 sobre la salida `image`.

No se han publicado resultados de benchmarks de calidad (PSNR, SSIM, FID) en la información disponible.

## Requisitos de hardware

- VRAM estimada: unos 219 MiB de memoria asignada en pico para 512 x 512 en fp16 (242 MiB reservados en portable, 284 MiB en kernels). Para 3000 x 4000 en portable fp16 se midió un pico de 5,1 GiB asignados y 6,8 GiB reservados.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA reciente; las mediciones se hicieron en una RTX 5060 Ti 16 GB (sm_120). El backend `kernels` requiere un kernel precompilado para la arquitectura de la GPU, descargado de `fastforks/kernels` en el primer uso; si no existe, lanza `BackendUnavailableError` sin degradar silenciosamente.
- Cabe holgadamente en GPU consumer: con ~250 MiB para 512 x 512, cualquier GPU con 4 GB o más es suficiente; para imágenes muy grandes (3000 x 4000) conviene disponer de 8 GB o más, o usar `tile=`.
- Opciones de despliegue: runtime `fastforks` (backend `portable` o `kernels`), con soporte de `torch.compile`; TensorRT fp16 está planificado para la versión 0.2.1. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de imagen).
- Latencia y throughput: 21,2 ms por imagen de 512 x 512 con kernels y 26,0 ms con portable en la GPU de referencia; con `torch.compile`, 23,4 ms. El coste de compilación en frío es de 25,9 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LaMa (`big-lama`) | 51 M | cualquier H x W >= 16, probado hasta 3000 x 4000 | CNN con FFC, inpainting sin prompt | Apache-2.0 | pesos en `smartywu/big-lama`, runtime `fastforks` |
| Stable Diffusion Inpainting | no disponible en la información proporcionada | 512 x 512 (SD 1.5) | difusión, acepta prompt de texto | CreativeML OpenRAIL-M | disponible en Hugging Face |
| MAT (Mask-Aware Transformer) | no disponible en la información proporcionada | 512 x 512 | transformer con atención, inpainting | no disponible en la información proporcionada | disponible en repositorios de investigación |

No se dispone de datos de benchmarks comparativos de calidad en la información proporcionada; la comparación se limita a características arquitectónicas y de licencia.

## Limitaciones y advertencias

- El modelo rellena la región enmascarada a partir del contexto visual; no acepta prompts de texto, por lo que no se puede dirigir el contenido generado.
- No está implementado el paso de refinamiento de los autores (`refine=True`, optimización multi-escala iterativa), lo que puede reducir la calidad frente a la implementación de referencia en algunos casos.
- Cualquier píxel de máscara distinto de cero se trata como agujero (binarización `mask > 0`): las máscaras con antialiasing o procedentes de JPEG crecen y deben umbralizarse previamente.
- Entrenado en Places365 (escenas), por lo que su comportamiento en dominios muy distintos (imágenes médicas, satelitales, rostros de alta resolución) puede degradarse.
- Riesgo de artefactos o texturas poco plausibles en máscaras muy grandes o en regiones con estructura compleja.
- El repositorio no aloja pesos: la integridad depende de la descarga desde `smartywu/big-lama` y de la verificación SHA-256 documentada en `card.toml`.
- El backend `kernels` exige un kernel precompilado para la arquitectura de GPU y un driver NVIDIA reciente; en arquitecturas no cubiertas hay que usar el backend `portable`.
- La licencia Apache-2.0 permite uso comercial, pero la model card advierte que el paquete original es de uso de investigación y recomienda revisar las cadenas de licencia antes de cualquier otro uso.
- No se documentan sesgos específicos en la información disponible, aunque al entrenarse en Places365 puede heredar los sesgos de composición y geografía de ese dataset.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/lama
- Repositorio del runtime fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original de LaMa: https://github.com/advimman/lama (commit `786f5936b27f`)
- Pesos del autor (`big-lama`): https://huggingface.co/smartywu/big-lama
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Fichero `card.toml` con hashes completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/restoration/models/lama/card.toml
- Licencia del código original: https://github.com/advimman/lama/blob/786f5936b27fb3dacd2b1ad799e4de968ea697e7/LICENSE
