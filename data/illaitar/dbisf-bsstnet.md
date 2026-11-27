# Illaitar/dbisf-BSSTNet

## Resumen

dbisf-BSSTNet es una implementación en PyTorch puro del modelo BSSTNet (Blur-aware Spatio-temporal Sparse Transformer for Video Deblurring, presentado en CVPR 2024), publicada por el usuario Illaitar dentro del proyecto "deblurring is solved?" (dbis). No es un modelo de lenguaje: es un modelo de restauración de imagen orientado a la eliminación de desenfoque de movimiento (motion deblurring) en vídeo, empaquetado como pipeline `image-to-image`. Resuelve el problema de recuperar secuencias nítidas a partir de fotogramas borrosos, una tarea clásica de restauración de vídeo.

La aportación de esta variante concreta (sufijo "f", de *fast*) es una reimplementación ligera y más rápida que el checkpoint original de los autores: reduce el tiempo de inferencia de 25,56 s a 4,58 s por fotograma a 720p en una A100 (batch 1) y el tamaño del fichero de 209 MB a 42 MB, a costa de una pérdida máxima de 0,05 dB de PSNR. Sobre el conjunto de test GoPro (1.111 fotogramas) obtiene 35,9425 dB frente a los 35,9662 dB del original.

Es relevante para desarrolladores e investigadores que necesitan integrar deblurring de vídeo en pipelines de producción con requisitos de latencia ajustados, ya que ofrece una alternativa práctica al código y checkpoint de referencia manteniendo la fidelidad numérica del método. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB (el peso se distribuye en un único fichero `.wpk` de 42 MB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BSSTNet: Blur-aware Spatio-temporal Sparse Transformer (transformer espaciotemporal con atención dispersa guiada por desenfoque) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; procesa clips de T fotogramas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT y BSD-3-Clause (hereda los términos del checkpoint original; ver `LICENSE.md` y `licenses/`) |
| Formato de pesos | `.wpk` (formato wpack del proyecto dbis, requiere zstandard); fichero de 42 MB |
| Tarea | image-to-image / video deblurring (restauración de imagen) |
| Entrada | fotogramas `[T, 3, H, W]`, `[B, T, 3, H, W]` o `[3, H, W]` |
| Librería | PyTorch |
| Repositorio | 0,0 GB, 0 descargas, 0 likes |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BSSTNet propuesta por los autores originales (Zhang et al., CVPR 2024): un transformer espaciotemporal que combina información de fotogramas vecinos dentro de un clip para estimar y eliminar el desenfoque de movimiento. La característica distintiva del método es el uso de atención dispersa (*sparse attention*) guiada por mapas de desenfoque (*blur-aware*), que permite seleccionar las regiones y fotogramas más informativos para la reconstrucción en lugar de atender densamente a todo el volumen espaciotemporal.

Esta variante concreta no se ha reentrenado: se ha generado a partir del checkpoint GoPro de los autores mediante `python -m dbis.convert` del proyecto [deblurring-is-solved](https://github.com/illaitar/deblurring-is-solved). Por tanto, los datos de entrenamiento son los del modelo original (no detallados en la información disponible). La optimización aplicada es de empaquetado e inferencia: reimplementación en PyTorch puro con un fichero de pesos más compacto (42 MB frente a 209 MB) y un tiempo de ejecución mucho menor (4,58 s frente a 25,56 s por fotograma 720p en A100, batch 1), con una degradación máxima de 0,05 dB de PSNR. No se dispone de información sobre el número de tokens, composición del dataset ni uso de RLHF/DPO (no aplicable a esta tarea).

## Capacidades

- Eliminación de desenfoque de movimiento en vídeo: restaura clips completos a partir de secuencias de fotogramas borrosos.
- Eliminación de desenfoque en imagen única: acepta entradas `[3, H, W]` y devuelve la imagen restaurada.
- Procesamiento por lotes: admite tensores `[B, T, 3, H, W]` para varios clips simultáneos.
- Integración como pipeline `image-to-image` en PyTorch.
- Interfaz CLI: `python -m dbis.run dbisf-BSSTNet blurry_frames/ sharp_frames/`, que acepta una carpeta de fotogramas (un clip) o un fichero de vídeo.
- Interfaz Python: `dbis.load("dbisf-BSSTNet")` descarga el fichero desde el repositorio en el primer uso y verifica su sha256; `net.restore(frames)` devuelve la salida restaurada.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Restauración de metraje de vigilancia: el modelo procesa clips de vídeo completos y aprovecha la información espaciotemporal de fotogramas vecinos para recuperar matrículas o rostros desenfocados por movimiento de cámara o de sujetos, con 4,58 s por fotograma 720p en A100.
- Postproducción de vídeo y cine: limpieza de tomas con desenfoque de movimiento antes del montaje final, usando la CLI sobre carpetas de fotogramas o ficheros de vídeo directamente.
- Restauración de grabaciones deportivas: corrección del desenfoque en secuencias de alta velocidad (deportes, drones, acción), donde el método blur-aware selecciona las regiones informativas de fotogramas adyacentes.
- Preprocesado para pipelines de visión por computador: mejora de la calidad de entrada para detección de objetos, seguimiento o reconocimiento facial en vídeo, reduciendo falsos negativos causados por el desenfoque.
- Restauración de archivos audiovisuales históricos: recuperación de grabaciones digitalizadas con desenfoque de movimiento, procesando clip a clip con la API de Python.
- Integración en herramientas de edición y apps móviles: el fichero de 42 MB y la reducción de latencia frente al original (5,6× más rápido en el harness de referencia) facilitan el despliegue en entornos con recursos limitados.
- Investigación en restauración de vídeo: punto de partida reproducible para comparar variantes de BSSTNet dentro del benchmark dbis, con verificación de integridad por sha256.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test GoPro (1.111 fotogramas, salida de 8 bits). Tiempo medido con el harness de latencia del benchmark, una A100, batch 1:

| Modelo | Tamano del fichero | PSNR GoPro (dB) | Tiempo por fotograma 720p |
|---|---:|---:|---:|
| dbisf-BSSTNet (esta variante) | 42 MB | 35,9425 | 4,58 s |
| BSSTNet original (código y checkpoint de los autores) | 209 MB | 35,9662 | 25,56 s |

No se han publicado en la información disponible resultados de otros benchmarks (SSIM, LPIPS, otros conjuntos de test) ni comparaciones con modelos distintos de BSSTNet.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El tamaño del fichero de pesos es de 42 MB, lo que sugiere un modelo compacto, pero no se especifica el consumo de memoria en ejecución.
- GPU de referencia del benchmark: NVIDIA A100 (tiempos de 4,58 s por fotograma 720p, batch 1).
- GPU recomendadas: A100 o superiores para producción a 720p; no se han publicado mediciones en otras GPU (H100, RTX 4090, etc.).
- ¿Cabe en GPU de consumo? No confirmado. Dado el tamaño del fichero (42 MB) es plausible, pero la memoria de activaciones para clips de vídeo a 720p no está documentada.
- Opciones de despliegue: paquete `deblurring-is-solved` (extra `[bsst]`) instalable vía pip desde GitHub; ejecución mediante `python -m dbis.run` (CLI) o `dbis.load` / `net.restore` (API Python). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: 4,58 s por fotograma 720p en A100, batch 1 (5,6× más rápido que el original, 25,56 s). No se dispone de throughput agregado para batch mayor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | PSNR GoPro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dbisf-BSSTNet | no disponible | clips de vídeo (T fotogramas) | 35,9425 dB | MIT y BSD-3-Clause | Hugging Face, 42 MB |
| BSSTNet original | no disponible | clips de vídeo (T fotogramas) | 35,9662 dB | según checkpoint de los autores | GitHub de los autores, 209 MB |
| dbis-BSSTNet (misma variante, salidas de los autores) | no disponible | clips de vídeo (T fotogramas) | no disponible | MIT y BSD-3-Clause | Hugging Face |
| Otros modelos de deblurring de vídeo | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible solo permite comparar con el checkpoint original de BSSTNet y con la variante hermana `Illaitar/dbis-BSSTNet`. No se han proporcionado datos de otros modelos de la categoría (por ejemplo, redes recurrentes o transformers de restauración de vídeo alternativos).

## Limitaciones y advertencias

- Pérdida de calidad respecto al original: hasta 0,05 dB menos de PSNR medio en cada conjunto de test del benchmark; en GoPro, 35,9425 dB frente a 35,9662 dB.
- Especialización: entrenado para desenfoque de movimiento en vídeo (checkpoint GoPro); su comportamiento en otros tipos de degradación (desenfoque gaussiano, ruido, compresión) no está documentado.
- Sesgos: no se han publicado análisis de sesgos; al ser un modelo de restauración, puede amplificar artefactos o alucinar texturas en regiones muy degradadas.
- Riesgo de artefactos: la reconstrucción de detalle fino (texto, rostros) en zonas con desenfoque severo puede generar estructuras plausibles pero incorrectas.
- Licencia: hereda los términos del checkpoint original (MIT y BSD-3-Clause según `LICENSE.md` y `licenses/`); es obligatorio citar el paper del método al usar sus pesos. Verificar los términos completos antes de uso comercial.
- Idiomas: no aplica; no es un modelo de lenguaje.
- Contexto: procesa clips de longitud T; no se especifica el límite máximo de fotogramas por clip ni el comportamiento en secuencias largas.
- Madurez: repositorio con 0 descargas y 0 likes; sin validación comunitaria independiente en el momento de la consulta.
- Formato propietario: los pesos usan el formato `.wpk` del proyecto dbis (requiere zstandard), no safetensors ni GGUF, lo que limita la interoperabilidad con otros frameworks.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Illaitar/dbisf-BSSTNet
- Variante con salidas de los autores: https://huggingface.co/Illaitar/dbis-BSSTNet
- Colección dbis: https://huggingface.co/collections/Illaitar/dbis-6b09930cbf629d8d89c027ba
- Repositorio del proyecto: https://github.com/illaitar/deblurring-is-solved
- Sitio del benchmark: https://illaitar.github.io/deblurring-is-solved/
- Documentación del benchmark (DBIS.md): https://github.com/illaitar/deblurring-is-solved/blob/main/DBIS.md
- Código original de BSSTNet: https://github.com/huicongzhang/BSSTNet
