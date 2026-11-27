# Illaitar/dbis-BSSTNet

## Resumen

dbis-BSSTNet es un modelo de restauración de vídeo centrado en la eliminación de desenfoque de movimiento (motion deblurring). Se trata de una reimplementación en PyTorch puro del método BSSTNet (Blur-aware Spatio-temporal Sparse Transformer for Video Deblurring, CVPR 2024), publicada por el usuario Illaitar dentro del proyecto "deblurring is solved?". El modelo no genera texto ni imágenes: es un modelo image-to-image que recibe una secuencia de fotogramas desenfocados y devuelve la misma secuencia restaurada.

El repositorio incluye dos variantes de pesos: dbis-BSSTNet, que reproduce exactamente las salidas del código y checkpoint originales de los autores, y dbisf-BSSTNet, una versión optimizada para velocidad y tamaño de archivo. El peso principal en safetensors ocupa 175 MB en float32, mientras que la variante rápida en formato wpack ocupa 42 MB. El repositorio completo suma 0,2 GB.

Su relevancia es acotada pero clara: ofrece una vía de uso del método BSSTNet sin depender del código original de los autores, con archivos verificables por sha256, y con una variante ligera que reduce el tiempo de inferencia de 30,58 s a 4,58 s por fotograma a 720p en una A100, a cambio de una pérdida máxima de 0,05 dB de PSNR. Es una pieza de infraestructura para pipelines de restauración de vídeo, no un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BSSTNet: transformer espaciotemporal disperso con conciencia de desenfoque (blur-aware), reimplementado en PyTorch puro |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; procesa clips de vídeo (fotogramas con forma [T, 3, H, W]) |
| Tipos de cuantización | no disponible; los pesos safetensors son float32, y existe un formato propio wpack para la variante rápida |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | mit-and-bsd-3-clause (hereda los términos del checkpoint original; ver LICENSE.md y licenses/) |
| Formato de pesos | safetensors (float32) y .wpk (formato wpack del repositorio, requiere zstandard) |

## Arquitectura y entrenamiento

BSSTNet es un transformer espaciotemporal disperso que incorpora información de desenfoque (blur-aware) para guiar la restauración de secuencias de vídeo. El modelo opera sobre clips de fotogramas y explota la correlación temporal entre ellos para recuperar detalle en regiones afectadas por desenfoque de movimiento. La implementación publicada es una traducción a PyTorch puro del código original de los autores, generada mediante `python -m dbis.convert` a partir del checkpoint GoPro de los autores.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset más allá de la referencia al conjunto GoPro, ni sobre el uso de RLHF, DPO u otras técnicas de alineación; estos datos no están incluidos en la información proporcionada. La innovación destacable del repositorio no está en el método en sí, sino en el empaquetado: pesos en safetensors verificables por sha256, una variante comprimida en formato wpack y un arnés de latencia reproducible recogido en DBIS.md.

## Capacidades

- Restauración de desenfoque de movimiento en vídeo: recibe una secuencia de fotogramas desenfocados y devuelve la secuencia restaurada.
- Procesamiento por clip o por fotograma individual: acepta tensores con forma [T, 3, H, W], [B, T, 3, H, W] o [3, H, W].
- Entrada desde carpeta de fotogramas (un clip) o desde un archivo de vídeo mediante la CLI `python -m dbis.run`.
- Carga programática con verificación de integridad: `dbis.load()` descarga el peso del repositorio en el primer uso y comprueba su sha256.
- Dos modos de compromiso calidad/velocidad: dbis-BSSTNet (fidelidad exacta al original) y dbisf-BSSTNet (rápido y ligero).
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües; es un modelo puramente image-to-image.

## Casos de uso

- Restauración de metraje de archivo: digitalización de vídeo antiguo o grabado con cámaras con movimiento rápido, aplicando el modelo clip a clip para recuperar nitidez antes del archivado o la difusión.
- Postproducción de vídeo de acción o deportes: secuencias grabadas con obturador lento o cámara en movimiento se procesan con dbisf-BSSTNet para obtener una versión utilizable en montaje sin recurrir al código original de los autores.
- Preprocesado para pipelines de visión por computador: la restauración previa mejora la entrada de sistemas de detección, seguimiento o reconocimiento que sufren con fotogramas desenfocados, especialmente en vídeo de vigilancia o drones.
- Vídeo capturado con dispositivos móviles: corrección de tomas domésticas con movimiento de mano antes de subirlas a plataformas, usando la variante rápida para mantener tiempos de proceso razonables.
- Investigación en restauración de vídeo: reproducción de los resultados del benchmark "deblurring is solved?" con pesos verificables por sha256, útil para comparaciones reproducibles frente a otros métodos.
- Integración en herramientas de edición: la API de Python (`net.restore(frames)`) permite incrustar la restauración como paso dentro de un pipeline de edición o de un servicio de procesado por lotes.
- Evaluación de compromiso calidad/latencia: la pareja de pesos permite medir en producción el coste real de cambiar 30,58 s por 4,58 s por fotograma a 720p con una pérdida acotada de 0,05 dB de PSNR.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son de PSNR sobre GoPro y de latencia por fotograma a 720p en una A100 con batch 1, medidos con el arnés de latencia del benchmark.

| Peso | Tamaño | PSNR GoPro (dB) | Tiempo por fotograma 720p (A100, batch 1) |
|---|---:|---:|---:|
| dbis-BSSTNet.safetensors | 175 MB | 35,9662 (autores: 35,9662) | 30,58 s (autores: 25,56 s) |
| dbisf-BSSTNet.wpk | 42 MB | 35,9425 | 4,58 s |

No se han publicado en la información disponible resultados de otros benchmarks (por ejemplo, sobre otros conjuntos de test del benchmark más allá de la referencia a que dbisf queda como máximo 0,05 dB por debajo de la PSNR media de los autores en cada conjunto).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el peso principal en float32 ocupa 175 MB, por lo que el modelo cabe holgadamente en cualquier GPU con unos pocos GB de VRAM, y el consumo vendrá dominado por las activaciones del clip de vídeo procesado.
- GPU de referencia del benchmark: A100, con batch 1 y fotogramas a 720p.
- GPU recomendadas: A100 o H100 para procesado por lotes a resolución alta; en tarjetas consumer (RTX 4090 y similares) el modelo debería caber sin problema por tamaño de pesos, aunque no se han publicado cifras de latencia para ellas.
- Cabe en GPU consumer: sí, por tamaño de pesos; la latencia concreta en esas tarjetas no está disponible.
- Opciones de despliegue: el paquete `deblurring-is-solved[bsst]` instalable desde GitHub, con CLI (`python -m dbis.run`) y API de Python (`dbis.load`, `net.restore`). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 30,58 s por fotograma a 720p con dbis-BSSTNet y 4,58 s con dbisf-BSSTNet en una A100 con batch 1. El throughput agregado con lotes mayores no está disponible.

## Comparativa con modelos similares

| Modelo | Tipo | PSNR GoPro (dB) | Tiempo por fotograma 720p (A100) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| dbis-BSSTNet (este) | Reimplementación PyTorch de BSSTNet | 35,9662 | 30,58 s | mit-and-bsd-3-clause | Hugging Face, safetensors |
| dbisf-BSSTNet (este, variante rápida) | Reimplementación PyTorch de BSSTNet | 35,9425 | 4,58 s | mit-and-bsd-3-clause | Hugging Face, wpack |
| BSSTNet original (autores) | Código y checkpoint de referencia | 35,9662 | 25,56 s | no disponible en la información | GitHub de los autores |

No se dispone en la información proporcionada de datos de otros métodos de deblurring de vídeo (por ejemplo, variantes de transformer espaciotemporal o enfoques recurrentes) que permitan ampliar la comparativa con cifras verificables.

## Limitaciones y advertencias

- Especialización estrecha: solo realiza restauración de desenfoque de movimiento en vídeo; no sirve para generación, lenguaje, visión general ni otras tareas.
- Sesgos conocidos: no disponibles en la información proporcionada; al entrenarse sobre GoPro, el comportamiento fuera de la distribución de ese conjunto (otro tipo de desenfoque, ruido, compresión) no está caracterizado.
- Riesgo de artefactos: como todo modelo de restauración, puede introducir detalle inventado o inconsistencias temporales entre fotogramas; no se han publicado evaluaciones específicas de fidelidad perceptual.
- Licencia: los pesos heredan los términos del checkpoint original (mit-and-bsd-3-clause), con obligación de citar el paper del método al usar los pesos; conviene revisar LICENSE.md y el directorio licenses/ antes de un uso comercial.
- Coste computacional: 30,58 s por fotograma a 720p con el peso principal lo hace inviable para procesado en tiempo real; la variante rápida (4,58 s) sigue siendo un proceso por lotes, no en directo.
- Formato wpack: la variante rápida requiere zstandard y el formato propio del repositorio, lo que añade una dependencia específica frente al safetensors estándar.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, publicado en 2026; no hay evidencia de uso en producción ni de mantenimiento a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Illaitar/dbis-BSSTNet
- Repositorio del proyecto: https://github.com/illaitar/deblurring-is-solved
- Sitio del benchmark: https://illaitar.github.io/deblurring-is-solved/
- Código original de los autores (BSSTNet): https://github.com/huicongzhang/BSSTNet
