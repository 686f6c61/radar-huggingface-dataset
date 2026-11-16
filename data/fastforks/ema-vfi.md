# fastforks/ema-vfi

## Resumen

EMA-VFI es un modelo de interpolación de fotogramas de vídeo (video frame interpolation, VFI) presentado por Zhang et al. en CVPR 2023. Dado un par de fotogramas RGB consecutivos, genera el fotograma intermedio (o el correspondiente a un instante arbitrario `t` en [0, 1]) combinando atención inter-fotograma con un refinamiento posterior. El repositorio `fastforks/ema-vfi` es una model card de distribución: no aloja pesos, sino que documenta cómo el runtime [fastforks](https://github.com/kleinicke/fastforks) descarga los pesos originales de los autores, verifica su SHA-256 y los ejecuta en los backends `portable` y `kernels`.

La relevancia actual del modelo radica en su eficiencia: con un backbone híbrido CNN-Transformer, procesa un par de fotogramas 1080x1920 en 207 ms (backend `kernels`, fp16, RTX 5060 Ti) y 124 ms con TensorRT fp16, con un pico de memoria de 1,7 GiB en TensorRT. Existen cuatro variantes: `ema-vfi` y `ema-vfi-small` (entrenadas para el fotograma central) y `ema-vfi-t` y `ema-vfi-small-t` (entrenadas para cualquier instante en [0, 1]).

El modelo está pensado para pipelines de postproducción, conversión de tasa de fotogramas y generación de cámara lenta, no para generación de texto ni tareas lingüísticas. La licencia del código y de los pesos es Apache-2.0 según la model card, aunque esta advierte de que el paquete original de investigación contiene cadenas de licencia que deben revisarse antes de otros usos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida CNN + Transformer con atención inter-fotograma en dos etapas (ventanas a 1/16 y 1/32 de la imagen), cabezas de flujo óptico y máscara de fusión, y refinador U-Net |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: dos imágenes RGB; tamaño H x W >= 32, múltiplo de 32) |
| Tipos de cuantización | fp16 (probado); no se documentan otras precisiones |
| Idiomas soportados | no aplica (modelo de imagen/vídeo) |
| Licencia | Apache-2.0 (código y pesos según la model card; revisar cadenas de licencia del paquete original) |
| Formato de pesos | `.pkl` (checkpoints originales de los autores, no alojados en el repo) |
| Variantes | `ema-vfi`, `ema-vfi-small`, `ema-vfi-t`, `ema-vfi-small-t` |
| Backends | `portable`, `kernels` (kernels CUDA en huggingface.co/fastforks/kernels) |
| Salida | Fotograma RGB en [0, 1] en el instante `timestep` (0.5 por defecto; 0 = primero, 1 = segundo) |

## Arquitectura y entrenamiento

EMA-VFI emplea un backbone híbrido CNN-Transformer. En dos etapas de window attention (a 1/16 y 1/32 de la resolución de la imagen), cada fotograma atiende al otro, y el mapa de atención proporciona simultáneamente características de apariencia y de movimiento (los desplazamientos de píxel ponderados por atención). A continuación, dos cabezas estiman el flujo hacia cada fotograma y una máscara de fusión, y una U-Net refina la mezcla de ambos fotogramas deformados (warped). Las variantes sin sufijo `-t` están entrenadas para el fotograma central; las `-t` para un instante arbitrario en [0, 1].

Los datos de entrenamiento son Vimeo-90K: las variantes de tiempo fijo usan triplets (según `train.py` del repositorio original) y el paper indica septuplets para las variantes de tiempo arbitrario, aunque la model card señala que el conjunto de entrenamiento de las `_t` no se declara explícitamente. No se documentan fases de RLHF/DPO ni datos adicionales. La innovación técnica principal es el uso de la propia atención inter-fotograma como fuente de movimiento, lo que evita módulos de estimación de flujo separados y reduce el coste computacional frente a alternativas basadas en optical flow explícito.

## Capacidades

- Interpolación de fotogramas de vídeo a partir de dos imágenes RGB consecutivas.
- Interpolación en instante arbitrario `t` en [0, 1] con las variantes `-t` (cámara lenta no uniforme, retiming).
- Interpolación del fotograma central con las variantes no `-t` (duplicación de tasa de fotogramas 2x).
- Entrada de resolución arbitraria con H x W >= 32, con padding automático a múltiplo de 32.
- Ejecución en fp16 en los backends `portable` y `kernels`, con kernels CUDA optimizados.
- Compatibilidad con `torch.compile` y exportación a ONNX + TensorRT fp16.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades lingüísticas: es un modelo puramente visual.

## Casos de uso

- **Conversión de tasa de fotogramas (24 a 48/60 fps)**: usar `ema-vfi` o `ema-vfi-small` para generar el fotograma central entre cada par consecutivo. Con 84,5-207 ms por par en 1080x1920, un clip de 1 minuto a 24 fps requiere unos 1.440 pares, procesables en pocos minutos en una GPU consumer.
- **Cámara lenta y retiming no uniforme**: las variantes `-t` permiten generar fotogramas en cualquier instante de [0, 1], útil para rampas de velocidad y curvas de retiming en postproducción sin duplicar fotogramas.
- **Restauración de material de archivo con bajo fps**: interpolar fotogramas intermedios para suavizar secuencias antiguas grabadas a 12-15 fps antes de un reescalado o remasterización.
- **Generación de vídeo a partir de pares clave**: en pipelines de animación o difusión de vídeo, usar el modelo como interpolador entre fotogramas clave generados por otro modelo para aumentar la densidad temporal.
- **Previsualización en tiempo real de vídeo 4K**: con `ema-vfi-small` procesando 3000x4000 con 8,9 GiB de pico en fp16, es viable en GPUs de 16 GiB para previews de alta resolución; para 1080x1920 el pico baja a 1,6 GiB.
- **Integración en pipelines de edición con TensorRT**: exportar a ONNX + TensorRT fp16 reduce el tiempo por par a 43,7 ms (`ema-vfi-small`) y 124 ms (`ema-vfi`), adecuado para procesamiento por lotes en servidores con GPU.
- **Aumento de datos para entrenamiento de modelos de vídeo**: generar fotogramas intermedios sintéticos para aumentar la densidad temporal de datasets de entrenamiento.

## Benchmarks y rendimiento

Rendimiento medido en RTX 5060 Ti 16 GB (sm_120), fp16, interpolación sintética a 1080x1920:

| Modelo | Tiempo original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Pico memoria portable (MiB alloc/reserved) | Pico memoria kernels (MiB alloc/reserved) |
|---|---|---|---|---|---|---|
| `ema-vfi` | 296 | 234 | 207 | 1,4x | 2827 / 3204 | 3129 / 4152 |
| `ema-vfi-small` | 121 | 89,5 | 84,5 | 1,4x | 1614 / 1792 | 1660 / 2178 |
| `ema-vfi-small-t` | 114 | 89,4 | 84,5 | 1,3x | 1614 / 1792 | 1660 / 2178 |
| `ema-vfi-t` | 287 | 233 | 207 | 1,4x | 2827 / 3184 | 3129 / 4152 |

Rendimiento con `torch.compile` y TensorRT fp16 a 1080x1920:

| Modelo | Portable (ms) | Compile (ms) | TensorRT fp16 (ms) | Kernels (ms) | Pico TensorRT (MiB alloc/reserved) |
|---|---|---|---|---|---|
| `ema-vfi` | 234 | 165 | 124 | 207 | 1719 / 1786 |
| `ema-vfi-small` | 89,5 | 59,6 | 43,7 | 84,5 | 1018 / 1110 |
| `ema-vfi-small-t` | 89,4 | 59,8 | 43,4 | 84,5 | 1018 / 1110 |
| `ema-vfi-t` | 233 | 165 | 125 | 207 | 1719 / 1766 |

Tiempos de carga y primera llamada (1080x1920 salvo indicación):

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `ema-vfi` | 2,69 | 0,73 | 0,74 | 0,50 | 0,23 | 0,21 |
| `ema-vfi-small` | 0,36 | 0,27 | 0,58 | 0,18 | 0,09 | 0,09 |
| `ema-vfi-small-t` | 1,05 | 0,28 (480x854) | 0,56 (480x854) | 0,17 | 0,43 (480x854) | 0,35 (480x854) |
| `ema-vfi-t` | 2,77 | 0,90 (480x854) | 0,74 (480x854) | 0,49 | 0,68 (480x854) | 0,39 (480x854) |

No se han publicado resultados de benchmarks de calidad (PSNR, SSIM, LPIPS) en la información disponible.

## Requisitos de hardware

- **VRAM estimada (inferencia, fp16)**: 1,6-2,8 GiB para 1080x1920 en `ema-vfi-small` y `ema-vfi` respectivamente (backend portable); 1,7 GiB con TensorRT fp16 en `ema-vfi`. Para 3000x4000, `ema-vfi-small` alcanza 8,9 GiB asignados (11,4 GiB reservados). Para 1988x2880, `ema-vfi` alcanza 7,4 GiB asignados (9,1 GiB reservados).
- **GPU recomendadas**: RTX 5060 Ti 16 GB es la GPU de referencia de los benchmarks. Cualquier GPU con >= 8 GiB permite 1080x1920 en fp16; >= 16 GiB permite resoluciones 4K con `ema-vfi-small`.
- **Cabe en GPU consumer**: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, RTX 5060 Ti 16 GB y similares, para resoluciones 1080p. Para 4K se recomienda >= 16 GiB.
- **Opciones de despliegue**: runtime `fastforks` (backends `portable` y `kernels`), `torch.compile`, exportación a ONNX + TensorRT fp16. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo visual de este tipo).
- **Latencia y throughput**: 84,5-207 ms por par a 1080x1920 según variante y backend; 43,4-125 ms con TensorRT fp16. La preparación de `torch.compile` tarda 77,9-90,6 s (primera llamada en frío) y la construcción de ONNX + engine TensorRT 67,6-91,5 s.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de calidad ni de especificaciones de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable con otros modelos de interpolación de fotogramas (por ejemplo, RIFE, FILM o IFRNet). Los datos de latencia y memoria de esta ficha corresponden exclusivamente a EMA-VFI en la RTX 5060 Ti y no son directamente comparables con mediciones de terceros en otro hardware.

| Criterio | EMA-VFI | Alternativas |
|---|---|---|
| Parámetros | no disponible | no disponible |
| Contexto / entrada | dos imágenes RGB, H x W >= 32 | no disponible |
| Licencia | Apache-2.0 | no disponible |
| Disponibilidad | pesos en Google Drive de los autores, runtime fastforks | no disponible |

## Limitaciones y advertencias

- El repositorio no aloja pesos: la descarga depende de enlaces de Google Drive de los autores, lo que puede fallar o cambiar; el runtime verifica SHA-256 pero la disponibilidad no está garantizada.
- La model card advierte de que el paquete original de investigación contiene cadenas de licencia que deben revisarse antes de cualquier uso distinto de la investigación, pese a que la licencia declarada sea Apache-2.0.
- No hay información sobre sesgos, pero al ser un modelo entrenado en Vimeo-90K puede degradarse en dominios visuales alejados de ese dataset (animación, imágenes médicas, visión nocturna).
- Riesgo de artefactos en oclusiones, movimientos rápidos o cambios de iluminación bruscos, propios de la interpolación basada en flujo y atención.
- Las variantes `-t` no declaran explícitamente su conjunto de entrenamiento en la model card, lo que dificulta evaluar su generalización.
- El modelo no procesa texto ni audio y no soporta tool calling ni agentes; no debe evaluarse con métricas lingüísticas.
- En producción, la primera llamada incluye compilación (hasta 90 s con `torch.compile` o TensorRT), lo que exige planificar el arranque en frío.
- El rendimiento medido corresponde a una única GPU (RTX 5060 Ti, sm_120); en otras arquitecturas los tiempos pueden variar.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/ema-vfi
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Repositorio del runtime fastforks: https://github.com/kleinicke/fastforks
- Benchmarks del runtime: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Fichero de definición de variantes: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/interpolation/models/ema_vfi/card.toml
- Código original de EMA-VFI: https://github.com/MCG-NJU/EMA-VFI (commit `75b6f6a889e6`)
- Licencia del código original: https://github.com/MCG-NJU/EMA-VFI/blob/75b6f6a889e695df875e103374040d47a4cfac7c/LICENSE
- README del código original: https://github.com/MCG-NJU/EMA-VFI/blob/75b6f6a889e695df875e103374040d47a4cfac7c/README.md
- Checkpoints de los autores (Google Drive): https://drive.google.com/drive/folders/16jUa3HkQ85Z5lb5gce1yoaWkP-rdCd0o
