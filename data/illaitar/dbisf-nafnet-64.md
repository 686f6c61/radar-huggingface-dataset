# Illaitar/dbisf-NAFNet-64

## Resumen

dbisf-NAFNet-64 es un modelo de restauración de imagen especializado en eliminación de desenfoque de movimiento (motion deblurring), desarrollado por el usuario Illaitar. Se trata de una reimplementación en PyTorch puro de la arquitectura NAFNet (Simple Baselines for Image Restoration, ECCV 2022) del grupo Megvii Research, convertida a partir del checkpoint original entrenado sobre el conjunto de datos GoPro. La versión "f" (fast and light) reduce el tiempo de inferencia y el tamano del fichero manteniendo una calidad prácticamente idéntica al modelo original.

El modelo resuelve la tarea de image-to-image de recuperar una imagen nítida a partir de una imagen borrosa por movimiento. Su relevancia radica en que ofrece una implementación ligera (66 MB frente a los 272 MB del checkpoint original) con una pérdida de PSNR de solo 0,0062 dB en el conjunto de test GoPro, y un tiempo de inferencia de 26,6 ms por fotograma a 720p en una A100, frente a los 34,9 ms del original. Esto lo hace atractivo para pipelines de restauración de vídeo o fotografía en producción donde el rendimiento y el tamano del artefacto importan.

El modelo forma parte del proyecto "deblurring is solved?" (dbis), un marco de evaluación comparativa de métodos de deblurring, y se distribuye bajo licencia MIT. No se especifican idiomas soportados porque la tarea es puramente visual, no lingüística.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NAFNet (Nonlinear Activation Free Network), transformer convolucional para restauración de imagen |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en formato propietario `.wpk`, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no aplica (modelo de visión, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | `.wpk` (formato wpack del proyecto dbis, requiere zstandard); incluye `.json` con sha256 y argumentos de red |

## Arquitectura y entrenamiento

NAFNet es una arquitectura de restauración de imagen que elimina las funciones de activación no lineales (ReLU, GELU, etc.) del bloque transformer, sustituyéndolas por operaciones de multiplicación simple y normalización, lo que reduce el coste computacional manteniendo la capacidad de modelado. El modelo combina capas convolucionales con bloques de atención simplificada y conexiones residuales, y está diseñado específicamente para tareas de image-to-image como deblurring, denoising y superresolución.

El checkpoint original fue entrenado por los autores de NAFNet sobre el dataset GoPro (imágenes borrosas por movimiento con sus correspondientes versiones nítidas). La versión dbisf-NAFNet-64 se obtiene mediante el comando `python -m dbis.convert` del repositorio deblurring-is-solved, que convierte el checkpoint original a un formato más ligero y rápido. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición del dataset más allá de GoPro, ni si se aplicaron técnicas de RLHF/DPO (no aplicables en este dominio). La innovación principal es la reducción de tamano y latencia sin degradación significativa de PSNR.

## Capacidades

- Restauración de imagen: elimina desenfoque de movimiento en imágenes individuales, carpetas de fotogramas o vídeos.
- Procesamiento por lotes: acepta tensores con formas `[T, 3, H, W]`, `[B, T, 3, H, W]` o `[3, H, W]`, lo que permite procesar secuencias de vídeo o lotes de imágenes.
- Inferencia rápida: 26,6 ms por fotograma a 720p en una A100 (batch 1), adecuado para pipelines en tiempo casi real.
- Verificación de integridad: el cargador `dbis.load` descarga el fichero desde el repositorio y comprueba su sha256 en el primer uso.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües, al ser un modelo puramente visual de image-to-image.
- No dispone de modo thinking, visión de alto nivel, audio ni otras capacidades especiales más allá del deblurring.

## Casos de uso

- Restauración de vídeo grabado con cámara en movimiento: el modelo procesa secuencias de fotogramas (`[T, 3, H, W]`) y corrige el desenfoque de movimiento fotograma a fotograma, con 26,6 ms por fotograma a 720p, lo que permite procesar vídeo a velocidades cercanas a tiempo real en una A100.
- Postprocesado fotográfico automatizado: integrado en un pipeline de edición, restaura fotos tomadas con velocidades de obturación lentas o con movimiento de sujeto, sustituyendo el trabajo manual de deblurring.
- Mejora de imágenes para vigilancia y videovigilancia: al reducir el desenfoque de movimiento en grabaciones de cámaras de seguridad, facilita tareas posteriores de reconocimiento o identificación.
- Preprocesado para pipelines de visión por computador: imágenes restauradas mejoran la precisión de detectores, segmentadores u OCR en escenarios con movimiento.
- Restauración de material de archivo o grabaciones deportivas: corrige el desenfoque en metraje con movimiento rápido de cámara o sujetos, donde el deblurring es crítico.
- Prototipado e investigación en restauración de imagen: al ser una implementación ligera y de código abierto (MIT) con benchmark reproducible, sirve como baseline para comparar nuevos métodos de deblurring dentro del marco dbis.
- Despliegue en entornos con recursos limitados: el fichero de 66 MB y la implementación en PyTorch puro facilitan su integración en contenedores o servicios sin dependencias pesadas.

## Benchmarks y rendimiento

| Metrica | dbisf-NAFNet-64 | Checkpoint original de los autores |
|---|---:|---:|
| PSNR en GoPro (1.111 fotogramas de test, 8 bits) | 33,7041 dB | 33,7103 dB |
| Tamano del fichero | 66 MB | 272 MB |
| Tiempo por fotograma a 720p (A100, batch 1) | 26,6 ms | 34,9 ms |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no son aplicables a un modelo de restauración de imagen.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamano del modelo (66 MB de pesos) y la arquitectura NAFNet, se estima un consumo moderado, aunque no se proporcionan cifras concretas.
- GPU recomendadas: A100 (usada en el benchmark de latencia del autor); previsiblemente compatible con GPUs consumer modernas (RTX 3090, RTX 4090) por el reducido tamano de pesos, aunque no se confirma en la información disponible.
- Cabe en GPU consumer: probablemente sí, dado el tamano de 66 MB, pero no se confirma oficialmente.
- Opciones de despliegue: PyTorch puro mediante el paquete `deblurring-is-solved` (instalación vía pip desde GitHub); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 26,6 ms por fotograma a 720p en una A100 con batch 1; no se proporcionan cifras de throughput para otros hardwares.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PSNR GoPro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dbisf-NAFNet-64 | no disponible | no aplica | 33,7041 dB | MIT | Hugging Face (Illaitar/dbisf-NAFNet-64) |
| NAFNet original (autores) | no disponible | no aplica | 33,7103 dB | ver LICENSE.md del repo original | GitHub megvii-research/NAFNet |
| dbis-NAFNet-64 | no disponible | no aplica | no disponible en la informacion | MIT | Hugging Face (Illaitar/dbis-NAFNet-64) |

No se dispone de datos de otros modelos comparables (por ejemplo, Restormer, MPRNet o HINet) en la información proporcionada, por lo que la comparativa se limita a las variantes del propio proyecto.

## Limitaciones y advertencias

- El modelo está especializado en desenfoque de movimiento (motion deblurring) entrenado sobre GoPro; su rendimiento en otros tipos de desenfoque (desenfoque de lente, desenfoque gaussiano, desenfoque por movimiento de objeto complejo) no está garantizado.
- Riesgo de artefactos o alucinación visual: como todo modelo de restauración, puede generar detalles inexistentes o distorsiones en regiones muy degradadas.
- No se especifican sesgos conocidos, pero al entrenarse sobre GoPro (dataset de escenas naturales), puede tener un rendimiento inferior en dominios muy distintos (imágenes médicas, satelitales, microscopía).
- Licencia MIT para el fichero, pero el autor indica que el fichero conserva los términos del checkpoint original; es necesario revisar `LICENSE.md` y `licenses/` del repositorio para uso comercial, y citar el paper del método (NAFNet, ECCV 2022) al usar los pesos.
- El formato de pesos `.wpk` requiere la librería zstandard y el paquete `deblurring-is-solved`; no hay conversión directa a formatos estándar como safetensors o GGUF publicada.
- No se proporcionan métricas de calidad perceptual (LPIPS, SSIM) ni evaluaciones subjetivas, solo PSNR.
- El modelo no procesa texto ni lenguaje, por lo que no aplican limitaciones de contexto o idioma, pero tampoco puede usarse para tareas de NLP.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Illaitar/dbisf-NAFNet-64
- Variante con salidas de los autores: https://huggingface.co/Illaitar/dbis-NAFNet-64
- Colección dbis: https://huggingface.co/collections/Illaitar/dbis-6b09930cbf629d8d89c027ba
- Repositorio del proyecto: https://github.com/illaitar/deblurring-is-solved
- Sitio del benchmark: https://illaitar.github.io/deblurring-is-solved/
- Documentación de números y opciones (DBIS.md): https://github.com/illaitar/deblurring-is-solved/blob/main/DBIS.md
- Código original de NAFNet: https://github.com/megvii-research/NAFNet
- Paper de NAFNet (ECCV 2022): no disponible enlace directo en la información proporcionada
