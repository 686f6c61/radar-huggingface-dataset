# fastforks/rife

## Resumen

RIFE (Real-Time Intermediate Flow Estimation) es un modelo de interpolación de fotogramas de vídeo desarrollado por Huang et al. y publicado en ECCV 2022. Esta ficha corresponde al paquete `fastforks/rife`, que no aloja pesos propios sino que distribuye y verifica los checkpoints oficiales de Practical-RIFE (versiones 4.25, 4.25-lite y 4.26) bajo una interfaz unificada. El modelo genera el fotograma intermedio entre dos imágenes RGB consecutivas en cualquier instante de tiempo dentro del intervalo [0, 1], lo que permite aumentar la tasa de fotogramas de un vídeo, generar cámara lenta o reparar secuencias con caídas de frames.

La arquitectura es una red convolucional pura (sin transformer ni mecanismos de atención) que estima flujos ópticos intermedios de forma gruesa a fina mediante bloques IFBlock. El modelo es muy ligero en comparación con los modelos generativos actuales: procesa 1080x1920 en torno a 21-25 ms en una GPU consumer, con un pico de memoria cercano a 750-850 MiB. Esto lo sitúa como una opción práctica para pipelines de vídeo en tiempo real o cuasi real tiempo.

Es relevante ahora porque el ecosistema `fastforks` añade backends optimizados (`portable` y `kernels`), verificación de integridad por SHA-256 y compatibilidad con `torch.compile` y TensorRT, lo que reduce la fricción de desplegar RIFE en producción frente a depender del repositorio de investigación original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN convolucional con estimación de flujo intermedio (IFBlock, grueso a fino) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | fp16 y fp32 (según backends documentados); no se documentan otras |
| Idiomas soportados | no disponible (modelo sin entrada de texto) |
| Licencia | MIT (código y pesos) |
| Formato de pesos | `.pkl` (checkpoints PyTorch); exportable a ONNX y TensorRT según benchmarks |

## Arquitectura y entrenamiento

RIFE emplea un encoder convolucional pequeño que extrae características de 4 canales de ambos fotogramas de entrada. A partir de ahí, cinco bloques IFBlock (cada uno con dos convoluciones stride-2, ocho convoluciones residuales y una convolución transpuesta) estiman de forma iterativa el flujo desde el fotograma intermedio hacia ambas entradas y una máscara de fusión. El proceso va de 1/16 de la resolución hasta el tamaño completo. El fotograma final se obtiene warpeando ambas entradas al instante `timestep` y mezclándolas con la máscara. La variante `rife-4.25-lite` reduce el ancho del último bloque para abaratar el coste computacional.

El paper original (arXiv:2011.06294) entrena sobre Vimeo-90K (septuplets y triplets para interpolación de fotogramas). La model card indica que las versiones 4.x añaden datos no especificados (escenas de anime según la nota de la release 4.25). No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de visión puramente supervisado.

## Capacidades

- Interpolación de fotogramas de vídeo en cualquier instante de tiempo dentro de [0, 1] (por defecto 0.5).
- Entrada de dos imágenes RGB consecutivas; salida de un fotograma RGB en [0, 1].
- Soporte de resoluciones arbitrarias H x W >= 128, con padding a múltiplo de 128.
- Procesamiento probado hasta 3000x4000 en fp16 con 5.5 GiB de memoria pico asignada.
- Backends `portable` (PyTorch) y `kernels` (kernels optimizados publicados en `fastforks/kernels`).
- Compatibilidad con `torch.compile` y exportación a ONNX/TensorRT (según benchmarks publicados).
- Verificación de integridad de pesos mediante SHA-256.
- No soporta tool calling, agentes, texto ni multimodalidad de lenguaje; es exclusivamente visión.

## Casos de uso

- Aumento de tasa de fotogramas en postproducción: interpolar entre fotogramas consecutivos para pasar de 24 a 60 fps o superior, usando `timestep` para generar varios intermedios por par.
- Cámara lenta de alta calidad: generar fotogramas intermedios en secuencias grabadas a alta velocidad para reproducir a velocidades muy reducidas sin artefactos de duplicación.
- Reparación de vídeo con frames perdidos: reconstruir fotogramas caídos en una secuencia usando los fotogramas anterior y posterior como entradas.
- Pipelines de vídeo en tiempo real: con 21-25 ms por par a 1080x1920 en una RTX 5060 Ti, es viable procesar flujos en vivo con margen para otras etapas del pipeline.
- Generación de contenido para animación: la release 4.25 incorpora escenas de anime en entrenamiento, lo que la hace adecuada para interpolación de animación 2D.
- Preprocesado para modelos de vídeo generativo: densificar secuencias de entrada antes de pasarlas a modelos de difusión de vídeo que requieren mayor tasa de fotogramas.
- Despliegue en GPUs consumer: con un pico de ~750-850 MiB en 1080x1920, cabe en GPUs de gama media junto con otros procesos.

## Benchmarks y rendimiento

Interpolación sintética a 1080x1920 (RTX 5060 Ti 16 GB, sm_120):

| Modelo | Tiempo original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Memoria pico portable (MiB, asignada/reservada) |
|---|---|---|---|---|---|
| `rife-4.25` | 24.5 | 25.0 | 21.4 | 1.1x | 755 / 894 |
| `rife-4.25-lite` | 21.3 | 21.1 | 18.3 | 1.2x | 754 / 854 |
| `rife-4.26` | 24.2 | 25.1 | 21.4 | 1.1x | 755 / 894 |

`torch.compile` y TensorRT a 1080x1920:

| Modelo | Portable (ms) | Compile (ms) | TensorRT fp16 (ms) | Kernels (ms) | Compilación en frío (s) | Construcción ONNX + engine (s) |
|---|---|---|---|---|---|---|
| `rife-4.25` | 25.0 | 44.9 | 17.6 | 21.4 | 36.1 | 56.3 |
| `rife-4.25-lite` | 21.1 | 42.3 | 14.1 | 18.3 | 34.9 | 49.5 |
| `rife-4.26` | 25.1 | 44.5 | 17.6 | 21.4 | 34.9 | 54.9 |

Precisión en DAVIS 2017 trainval 480p (180 triplets, PSNR / SSIM):

| Variante | Original fp32 | Original fp16 | Portable | Kernels |
|---|---|---|---|---|
| `rife-4.25` | 27.13 / 0.8082 | 27.03 / 0.8074 | 27... (dato truncado en la información disponible) | no disponible |

No se han publicado en la información disponible resultados completos de precisión para `rife-4.25-lite` ni `rife-4.26`, ni comparativas con otros modelos de interpolación.

## Requisitos de hardware

- VRAM estimada: ~750-850 MiB asignados en 1080x1920 en fp16; ~5.5 GiB asignados en 3000x4000 en fp16.
- GPU recomendadas: RTX 5060 Ti 16 GB (probada); cualquier GPU con soporte CUDA y al menos 2-3 GB libres para 1080p.
- Cabe en GPUs consumer de gama media y en muchas GPUs de portátil con 4 GB o más de VRAM para resoluciones 1080p.
- Opciones de despliegue: backends `portable` (PyTorch) y `kernels` del paquete `fastforks`; exportación a ONNX y TensorRT documentada; `torch.compile` soportado.
- Latencia: 21-25 ms por par a 1080x1920 en portable/kernels; 14-18 ms con TensorRT fp16; ~18-21 ms con kernels.
- Arranque: carga del modelo entre 0.15 y 1.5 s según variante y backend; primera llamada entre 0.05 y 0.5 s.
- Throughput estimado: en torno a 40-57 pares por segundo a 1080x1920 con kernels o TensorRT en la GPU probada (derivado de los tiempos publicados).

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RIFE 4.25 / 4.26 (este) | CNN de interpolación | no disponible | no aplica | 21-25 ms a 1080x1920 (RTX 5060 Ti) | MIT | Pesos oficiales vía fastforks |
| FILM | CNN de interpolación | no disponible | no aplica | no disponible en la información | Apache 2.0 (según conocimiento general; no verificado aquí) | no disponible en la información |
| IFRNet | CNN de interpolación | no disponible | no aplica | no disponible en la información | no disponible en la información | no disponible en la información |

No se dispone en la información proporcionada de comparativas directas con otros modelos de interpolación. La comparativa anterior es orientativa y los datos de los competidores no están verificados en esta fuente.

## Limitaciones y advertencias

- Modelo puramente visual: no procesa texto, no soporta tool calling ni razonamiento multi-paso.
- No hay información publicada sobre sesgos; al ser un modelo de interpolación, los sesgos se manifestarían como artefactos visuales (halos, ghosting) en oclusiones, movimientos rápidos o cambios de iluminación.
- Riesgo de artefactos en escenas con oclusiones severas, desenfoque de movimiento o texturas repetitivas; la interpolación es una estimación, no una reconstrucción real.
- El repositorio `fastforks/rife` no aloja pesos: depende de enlaces externos de Google Drive para descargarlos, lo que puede afectar a la reproducibilidad y a la disponibilidad a largo plazo.
- La model card advierte de que el paquete original es de uso de investigación; aunque la licencia es MIT, conviene revisar los ficheros de licencia antes de usos distintos.
- Los benchmarks se han ejecutado en una única GPU (RTX 5060 Ti 16 GB, sm_120); el rendimiento en otras arquitecturas puede variar.
- La información de precisión en DAVIS está truncada en la fuente; no se dispone de PSNR/SSIM completos para todas las variantes.
- No se documentan límites de resolución máximos más allá de los probados (3000x4000); resoluciones mayores pueden agotar memoria.

## Enlaces

- Hugging Face: https://huggingface.co/fastforks/rife
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Código del paquete fastforks: https://github.com/kleinicke/fastforks
- Benchmarks detallados: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Fichero de especificación de la tarjeta: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/interpolation/models/rife/card.toml
- Código original Practical-RIFE: https://github.com/hzwer/Practical-RIFE (commit `bbfd2ea90910`)
- Paper RIFE: https://arxiv.org/abs/2011.06294
- Pesos `rife-4.25`: https://drive.usercontent.google.com/download?id=1ZKjcbmt1hypiFprJPIKW0Tt0lr_2i7bg
- Pesos `rife-4.25-lite`: https://drive.usercontent.google.com/download?id=1zlKblGuKNatulJNFf5jdB-emp9AqGK05
- Pesos `rife-4.26`: https://drive.usercontent.google.com/download?id=1gViYvvQrtETBgU1w8axZSsr7YUuw31uy
