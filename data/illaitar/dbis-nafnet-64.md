# Illaitar/dbis-NAFNet-64

## Resumen

dbis-NAFNet-64 es una implementación en PyTorch puro de la arquitectura NAFNet (Simple Baselines for Image Restoration, ECCV 2022), publicada por el usuario Illaitar dentro del proyecto "deblurring is solved?" (dbis). El modelo resuelve el problema de la eliminación de desenfoque de movimiento (motion deblurring) en imágenes, vídeo y secuencias de fotogramas, y se distribuye como pesos convertidos a partir del checkpoint oficial de los autores entrenado sobre el conjunto de datos GoPro. Su relevancia actual radica en que ofrece los mismos resultados que el código de referencia de Megvii Research pero sin depender del framework original, lo que facilita su integración en pipelines de restauración de imagen basados en PyTorch.

El repositorio incluye dos variantes de pesos: `dbis-NAFNet-64` (safetensors en float32, 271 MB) y `dbisf-NAFNet-64` (formato wpack, 66 MB), esta última orientada a inferencia rápida y ligera. Ambas variantes mantienen una calidad prácticamente idéntica al checkpoint de los autores, con una PSNR media de 33,7103 dB en GoPro para la versión completa y 33,7041 dB para la versión rápida, y latencias de 33,5 ms y 26,6 ms por fotograma a 720p respectivamente sobre una A100 con batch 1.

Se trata de un modelo de imagen a imagen (image-to-image) de tamaño moderado, sin capacidades de lenguaje ni de texto, cuya licencia MIT facilita su uso tanto en investigación como en producción. No se han publicado datos sobre idiomas soportados porque no aplica: el modelo opera exclusivamente sobre tensores de imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NAFNet (Simple Baselines for Image Restoration, ECCV 2022) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | float32 en safetensors; formato wpack propio (66 MB) en la variante dbisf |
| Idiomas soportados | no aplica (modelo de restauracion de imagen) |
| Licencia | MIT |
| Formato de pesos | safetensors (float32) y .wpk (wpack, requiere zstandard) |

## Arquitectura y entrenamiento

NAFNet es una red neuronal convolucional para restauración de imagen que sustituye las funciones de activación no lineales convencionales por una activación lineal simple (Simple Gate) y simplifica los bloques de atención, reduciendo el coste computacional sin perder capacidad de representación. El modelo aquí publicado es una conversión directa del checkpoint oficial de los autores (Megvii Research) entrenado sobre el conjunto GoPro para motion deblurring, por lo que hereda exactamente el mismo proceso de entrenamiento y los mismos hiperparámetros que el trabajo original.

La conversión se realiza mediante `python -m dbis.convert` del repositorio `deblurring-is-solved`, que reimplementa la red en PyTorch puro y verifica que las salidas coinciden con las del código de referencia. No se dispone de información sobre el número exacto de tokens o imágenes de entrenamiento, la composición del dataset más allá de GoPro, ni sobre el uso de técnicas de refinamiento posteriores (RLHF, DPO u otras), ya que no aplican a este tipo de modelo y no se detallan en la model card.

## Capacidades

- Eliminación de desenfoque de movimiento (motion deblurring) en imágenes individuales.
- Restauración de secuencias de fotogramas y vídeo, procesando tensores con formas `[T, 3, H, W]`, `[B, T, 3, H, W]` o `[3, H, W]`.
- Procesamiento por lotes de carpetas de imágenes o vídeos completos mediante la CLI `python -m dbis.run`.
- Integración como módulo Python mediante `dbis.load()` y el método `net.restore(frames)`.
- Verificación de integridad de los pesos mediante comprobación de sha256 en la primera carga.
- No dispone de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Restauración de vídeo de vigilancia: el modelo puede procesar secuencias completas de fotogramas (`[T, 3, H, W]`) para recuperar detalle en grabaciones con movimiento de cámara o de sujetos, con una latencia de 26,6-33,5 ms por fotograma a 720p en A100.
- Postprocesado de vídeo de drones o cámaras de acción: la variante `dbisf` reduce el peso a 66 MB y el tiempo por fotograma, lo que permite integrarla en pipelines con restricciones de almacenamiento o de cómputo en el borde.
- Digitalización de fotografía analógica o documentos escaneados con desenfoque de movimiento: al ser un modelo image-to-image, se aplica directamente sobre la imagen capturada para recuperar nitidez antes de un OCR o de un archivado.
- Mejora de fotogramas en producción audiovisual: la CLI admite una imagen, una carpeta de fotogramas o un vídeo, lo que facilita su inclusión en scripts de renderizado o de control de calidad.
- Investigación en restauración de imagen: al ser una reimplementación en PyTorch puro con pesos verificados por sha256, sirve como base reproducible para comparar variantes de NAFNet o para experimentar con el formato wpack.
- Integración en aplicaciones de edición fotográfica: el método `restore` acepta tensores de imagen estándar, por lo que puede encapsularse en un servicio o en un plugin que reciba la imagen del usuario y devuelva la versión restaurada.
- Evaluación comparativa de modelos de deblurring: el proyecto dbis publica un benchmark con métricas PSNR y latencia, lo que permite usar este modelo como referencia frente a alternativas.

## Benchmarks y rendimiento

| Metrica | dbis-NAFNet-64 | dbisf-NAFNet-64 | Autores (referencia) |
|---|---:|---:|---:|
| PSNR en GoPro (dB) | 33,7103 | 33,7041 | 33,7103 |
| Tamano del archivo | 271 MB | 66 MB | no disponible |
| Tiempo por fotograma 720p (A100, batch 1) | 33,5 ms | 26,6 ms | 34,9 ms |

Los datos proceden del arnés de latencia del benchmark del proyecto, medidos sobre una A100 con batch 1. No se han publicado en la información disponible resultados de otros conjuntos de test del benchmark (más allá de la referencia a que `dbisf` queda como máximo 0,05 dB por debajo de la PSNR media de los autores en cada conjunto de test).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con pesos float32 de 271 MB, el consumo adicional depende de la resolución de entrada y del tamaño de lote.
- GPU recomendadas: A100 para las latencias publicadas (33,5 ms y 26,6 ms por fotograma a 720p); no se especifican otras GPU en la información disponible.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada; el tamaño reducido de los pesos sugiere que podría ejecutarse en GPU con suficiente VRAM para la resolución de trabajo, pero no hay datos de latencia publicados para RTX 4090 u otras.
- Opciones de despliegue: PyTorch puro mediante el paquete `deblurring-is-solved` (instalación con `pip install "deblurring-is-solved @ git+https://github.com/illaitar/deblurring-is-solved"`), CLI `python -m dbis.run` y API Python `dbis.load()`.
- Latencia y throughput: 33,5 ms por fotograma a 720p con `dbis-NAFNet-64` y 26,6 ms con `dbisf-NAFNet-64`, en A100 con batch 1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PSNR GoPro (dB) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| dbis-NAFNet-64 | no disponible | no aplica | 33,7103 | MIT | Hugging Face |
| dbisf-NAFNet-64 | no disponible | no aplica | 33,7041 | MIT | Hugging Face |
| NAFNet original (Megvii) | no disponible | no aplica | 33,7103 | ver LICENSE.md del repositorio original | GitHub |

No se dispone en la información proporcionada de datos sobre otros modelos comparables de deblurring (por ejemplo, Restormer, MPRNet o HINet) que permitan ampliar la comparativa con cifras verificadas.

## Limitaciones y advertencias

- El modelo está especializado en motion deblurring sobre el dominio de GoPro; su rendimiento fuera de ese tipo de desenfoque o de esa distribución de imágenes no está documentado.
- No se han publicado análisis de sesgos, pero al ser un modelo de restauración de imagen puede amplificar artefactos o introducir detalles no presentes en la escena original.
- Riesgo de alucinación de texturas o detalles: como todo modelo generativo de restauración, puede reconstruir información que no estaba en la imagen de entrada.
- No soporta texto, audio ni otros idiomas; cualquier uso fuera del procesamiento de imagen queda fuera de su alcance.
- La licencia del repositorio es MIT, pero los pesos conservan los términos del checkpoint original de los autores; es necesario revisar `LICENSE.md` y el directorio `licenses/` antes de un uso comercial.
- Se recomienda citar el paper del método (NAFNet, ECCV 2022) al utilizar los pesos.
- La variante `dbisf` requiere el paquete `zstandard` para leer el formato wpack.
- No hay datos publicados sobre latencia o consumo de VRAM en GPU de consumo, lo que limita la planificación de despliegues fuera de A100.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Illaitar/dbis-NAFNet-64
- Repositorio del proyecto: https://github.com/illaitar/deblurring-is-solved
- Sitio del benchmark: https://illaitar.github.io/deblurring-is-solved/
- Código original de los autores (NAFNet): https://github.com/megvii-research/NAFNet
- Paper del método: Simple Baselines for Image Restoration (ECCV 2022)
