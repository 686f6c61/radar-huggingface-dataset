# Illaitar/dbisf-DSTNetPlus-L

## Resumen

dbisf-DSTNetPlus-L es una reimplementación en PyTorch puro del modelo DSTNet+ L (Learning Efficient Deep Discriminative Spatial and Temporal Networks for Video Deblurring, publicado en TPAMI 2025), orientada a la restauración de vídeo con desenfoque de movimiento. Lo desarrolla el usuario Illaitar dentro del proyecto "deblurring is solved?", un banco de pruebas que reempaqueta checkpoints de investigación en formatos ligeros y ejecutables. El modelo resuelve la eliminación de desenfoque (deblurring) en secuencias de vídeo, tomando como entrada un clip de fotogramas borrosos y devolviendo los fotogramas restaurados.

La relevancia de esta variante radica en su eficiencia: frente al checkpoint original de los autores (56 MB, 3,01 s por fotograma a 720p), esta versión ocupa 16 MB y procesa cada fotograma en 584,9 ms, con una pérdida máxima de 0,05 dB de PSNR respecto a la salida de los autores en cada conjunto de test del benchmark. Se distribuye bajo licencia Apache 2.0, aunque el fichero conserva los términos del checkpoint original del que deriva.

No se dispone de información sobre arquitectura interna detallada, número de parámetros ni longitud de contexto en el sentido de modelos de lenguaje; se trata de una red de restauración de imagen (image-to-image) y no de un modelo generativo de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal profunda espacio-temporal para video deblurring (DSTNet+ L, TPAMI 2025); reimplementación en PyTorch puro |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de restauración de vídeo, procesa clips de fotogramas) |
| Tipos de cuantizacion | no disponible (pesos en formato propietario `.wpk`, 16 MB) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Apache 2.0 (el fichero conserva los términos del checkpoint original; ver `LICENSE.md` y `licenses/`) |
| Formato de pesos | `.wpk` (formato wpack del repositorio, requiere zstandard) |

## Arquitectura y entrenamiento

El modelo es una reimplementación en PyTorch puro de la red DSTNet+ L, presentada en el artículo "Learning Efficient Deep Discriminative Spatial and Temporal Networks for Video Deblurring" (TPAMI 2025). La arquitectura combina procesamiento espacial y temporal para explotar la información entre fotogramas consecutivos de un clip y restaurar secuencias con desenfoque de movimiento. No se detalla en la información disponible el número de capas, el mecanismo de atención ni la composición exacta del dataset de entrenamiento.

El checkpoint se genera a partir del checkpoint GoPro de los autores mediante `python -m dbis.convert` del repositorio "deblurring is solved?". No se documenta si hubo entrenamiento adicional, ajuste fino o destilación; la conversión produce una versión "rápida y ligera" con menor tiempo de ejecución y menor tamaño de fichero, manteniendo una diferencia máxima de 0,05 dB de PSNR medio respecto a las salidas de los autores en cada conjunto de test del benchmark. El fichero JSON asociado incluye el sha256 del fichero, el checkpoint de origen y su md5, y los argumentos de la red.

## Capacidades

- Restauración de vídeo con desenfoque de movimiento (video deblurring) a partir de un clip de fotogramas o de un fichero de vídeo.
- Restauración de imágenes individuales: acepta tensores de forma `[3, H, W]`, además de lotes `[B, T, 3, H, W]` y clips `[T, 3, H, W]`.
- Procesamiento por lotes de fotogramas (`[B, T, 3, H, W]`).
- Integración como pipeline `image-to-image` en el ecosistema de Hugging Face.
- Verificación de integridad del fichero de pesos mediante sha256 en la primera carga.
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso ni procesamiento de lenguaje natural; no es un modelo multimodal generativo.

## Casos de uso

- Restauración de metraje de vigilancia: el modelo puede procesar carpetas de fotogramas o vídeos completos para reducir el desenfoque de movimiento en grabaciones de cámaras de seguridad, donde el movimiento rápido de sujetos degrada la identificación visual.
- Postproducción de vídeo de acción o deportes: permite limpiar tomas con movimiento rápido de cámara antes de montaje, con un coste de 584,9 ms por fotograma a 720p en una A100, adecuado para flujos de trabajo no interactivos.
- Recuperación de grabaciones de drones: las secuencias aéreas sufren desenfoque por vibración y desplazamiento; el modelo explota la coherencia temporal entre fotogramas para estabilizar visualmente el contenido.
- Preprocesado para pipelines de visión por computador: restaurar fotogramas antes de tareas de detección, seguimiento o reconocimiento facial mejora la calidad de entrada de los modelos downstream en escenarios con movimiento.
- Digitalización y restauración de archivo audiovisual: aplicación sobre material histórico o doméstico con desenfoque de movimiento para mejorar la legibilidad visual antes de su conservación o reedición.
- Investigación en restauración de imagen: el repositorio "deblurring is solved?" y el formato `.wpk` facilitan la comparación reproducible de métodos de deblurring con un arnés de latencia y métricas PSNR estandarizadas sobre el benchmark GoPro.
- Prototipado en Python: la API `dbis.load(...)` y `net.restore(frames)` permite integrar la restauración en scripts de investigación sin dependencias de frameworks de inferencia complejos.

## Benchmarks y rendimiento

| Metrica | dbisf-DSTNetPlus-L | Codigo y checkpoint de los autores |
|---|---:|---:|
| Tamano del fichero | 16 MB | 56 MB |
| PSNR medio en GoPro (1.111 fotogramas de test, salidas 8 bits) | 35,6999 dB | 35,7078 dB |
| Tiempo por fotograma a 720p (A100, batch 1) | 584,9 ms | 3,01 s |

La diferencia de PSNR respecto a los autores es de 0,0079 dB en el conjunto GoPro, dentro del margen declarado de como máximo 0,05 dB por conjunto de test del benchmark. No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros), al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el fichero de pesos es de 16 MB, por lo que el consumo dominante será el de las activaciones intermedias al procesar clips de vídeo, que depende de la resolución y del número de fotogramas.
- GPU de referencia del benchmark: A100, batch 1, con 584,9 ms por fotograma a 720p.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; por el tamaño del modelo (16 MB) es probable que quepa en GPU consumer, pero no se aportan medidas de VRAM ni pruebas en RTX 4090 u otras.
- Opciones de despliegue: paquete Python `deblurring-is-solved` (instalable vía pip desde el repositorio de GitHub), con API `dbis.load` y `net.restore`; también se puede ejecutar como módulo `python -m dbis.run`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 584,9 ms por fotograma a 720p en A100 con batch 1; no se proporcionan cifras de throughput para otros lotes o resoluciones.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | PSNR GoPro (dB) | Tiempo por fotograma 720p (A100) | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| dbisf-DSTNetPlus-L | Reimplementación ligera de DSTNet+ L | 16 MB | 35,6999 | 584,9 ms | Apache 2.0 (términos del checkpoint original) | Hugging Face (Illaitar/dbisf-DSTNetPlus-L) |
| dbis-DSTNetPlus-L | Misma reimplementación con salidas de los autores | no disponible | no disponible | no disponible | no disponible | Hugging Face (Illaitar/dbis-DSTNetPlus-L) |
| DSTNet+ L (autores) | Implementación original | 56 MB | 35,7078 | 3,01 s | según el repositorio de los autores | GitHub (sunny2109/DSTNet-plus) |

No se dispone de datos de otros modelos de deblurring comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en deblurring de movimiento; no es un modelo de lenguaje ni multimodal generativo, por lo que no admite prompts, tool calling ni razonamiento.
- La licencia del repositorio es Apache 2.0, pero el fichero de pesos conserva los términos del checkpoint original del que deriva; es necesario revisar `LICENSE.md` y `licenses/` antes de un uso comercial.
- Se debe citar el artículo del método (DSTNet+, TPAMI 2025) al utilizar los pesos.
- La pérdida de calidad respecto a los autores es pequeña (0,0079 dB de PSNR en GoPro) pero no nula; en aplicaciones donde cada décima de dB sea crítica conviene evaluar el checkpoint original.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas por tratarse de una tarea de restauración de imagen; no obstante, no hay información sobre el rendimiento fuera del dominio GoPro (otros tipos de desenfoque, ruido, baja iluminación).
- El formato de pesos `.wpk` es propietario del repositorio y requiere la dependencia `zstandard`; no es directamente compatible con frameworks de inferencia estándar.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.
- No se dispone de información sobre el consumo de VRAM ni sobre el comportamiento con resoluciones distintas de 720p.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Illaitar/dbisf-DSTNetPlus-L
- Variante con salidas de los autores: https://huggingface.co/Illaitar/dbis-DSTNetPlus-L
- Colección dbis: https://huggingface.co/collections/Illaitar/dbis-6b09930cbf629d8d89c027ba
- Repositorio "deblurring is solved?": https://github.com/illaitar/deblurring-is-solved
- Sitio del benchmark: https://illaitar.github.io/deblurring-is-solved/
- Documentación del benchmark (DBIS.md): https://github.com/illaitar/deblurring-is-solved/blob/main/DBIS.md
- Código original de los autores: https://github.com/sunny2109/DSTNet-plus
