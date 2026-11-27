# Movens-0/metahuman_video_to_smplx_bvh_v1_5_fast

## Resumen

`metahuman_video_to_smplx_bvh_v1_5_fast` es un paquete de captura de movimiento (motion capture) publicado por Movens-0 en Hugging Face. No es un modelo de lenguaje ni una red neuronal única, sino un pipeline completo, empaquetado como archivo comprimido de 41 GB (72 GB descomprimido), que transforma vídeo de una persona o una imagen estática en parámetros SMPL-X y animación BVH con seguimiento de dedos. Está orientado a la reconstrucción de movimiento humano para avatares de tipo MetaHuman y a la producción de animación 3D.

Se trata de la versión rápida de la variante v1.5 dual BVH (publicada dos días antes, el 2026-11-25). Mantiene los mismos formatos de entrada y salida y la misma interfaz de línea de comandos, pero cambia la configuración por defecto para priorizar velocidad: el cuerpo se rastrea en fotogramas alternos (`--mode half_frames`) mientras las manos se procesan en todos los fotogramas, y la calibración de cámara usa 37 fotogramas muestreados uniformemente (`--camera-samples 37`). Según el autor, el pipeline completo pasa de una ratio de aproximadamente 1:21–1:40 a 1:5.9 en una RTX 5090 sobre 11 vídeos de prueba (109 s de vídeo procesados en 643 s).

Su relevancia es práctica: empaqueta modelos de estimación corporal y de manos (CHMR, SAM2, RTMW-X, WiLoR), aceleración con TensorRT FP16, procesos residentes reutilizables y parches de optimización en C++, de modo que un usuario con Linux, GPU NVIDIA y CUDA puede ejecutar un pipeline de captura de movimiento de extremo a extremo sin ensamblar las piezas por su cuenta. La ficha se basa exclusivamente en la model card y en el repositorio del proyecto; no hay información sobre arquitectura interna de los modelos componentes más allá de lo citado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline multi-modelo: estimación corporal (CHMR), segmentación y seguimiento (SAM2), pose de manos (RTMW-X, WiLoR), calibración de cámara y postproceso a SMPL-X/BVH; aceleración TensorRT FP16 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (procesamiento por vídeo, no modelo de lenguaje) |
| Tipos de cuantizacion | TensorRT FP16 para CHMR y SAM2; resto no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico; la interfaz y documentación están en chino) |
| Licencia | other (ver limitaciones) |
| Formato de pesos | paquete `.tar.zst` con modelos, entorno de ejecución, módulo de manos y caché de motores TensorRT; salidas en BVH, JSON y NPZ |
| Tamaño del repositorio | 43.9 GB (paquete comprimido de 41 GB; 72 GB descomprimido) |
| Entradas | vídeo MP4 o imagen estática |
| Salidas | `motion.bvh`, `motion_30fps.bvh`, `smplx.json`, `smplx.npz`, `report.json` |
| Plataforma requerida | Linux x86_64, GPU NVIDIA, CUDA compatible, GNU tar y zstd |
| Hardware probado | RTX 5090 (sm_120), driver 580.76.05, CUDA 13.0, Ubuntu 22.04 |

## Arquitectura y entrenamiento

El paquete no documenta el entrenamiento de los modelos que lo componen; la model card describe la orquestación y las optimizaciones, no los datasets ni el proceso de entrenamiento. El pipeline encadena varias etapas: estimación de pose corporal con CHMR, segmentación y seguimiento temporal con SAM2, detección y reconstrucción de manos con RTMW-X y WiLoR, calibración de cámara a partir de fotogramas muestreados, y postproceso que produce parámetros SMPL-X y exportación BVH. La variante "dual BVH" sugiere dos flujos de exportación BVH, aunque la documentación no lo detalla.

Las innovaciones técnicas documentadas son de ingeniería y rendimiento, no de arquitectura de red. Destacan: procesos residentes en segundo plano (worker corporal, servicios de manos y postproceso) que se reutilizan entre ejecuciones y se apagan tras 30 minutos de inactividad; una ruta rápida exacta en C++ para SAM2 con preprocesado SIMD, memoria paginada y solapamiento entre la codificación de memoria y la del siguiente fotograma; CUDA Graph para RTMW-X con salida idéntica bit a bit; y paralelización de la conversión de candidatos, la selección por fotograma y la escritura de registros. Los parches de código nativo están incluidos en `patches/` (por ejemplo, `SAM2.cpp.diff`). Las únicas variaciones numéricas respecto al original son el uso de TensorRT FP16 en CHMR y SAM2 y el traslado del solver de bloqueo de pies a CPU.

## Capacidades

- Conversión de vídeo a movimiento humano con reconstrucción de cuerpo, manos y dedos (30 articulaciones de mano y 21 de cuerpo en la comparación de precisión).
- Conversión de imagen única a SMPL-X/BVH, según el título del paquete ("视频 / 单图转 SMPL-X / BVH").
- Salida en formatos estándar de animación: BVH a la tasa original y a 30 fps, parámetros SMPL-X en JSON y NPZ, e informe de ejecución en JSON.
- Seguimiento temporal con SAM2 para mantener la coherencia entre fotogramas.
- Calibración de cámara configurable (número de fotogramas de muestreo).
- Procesamiento de vídeo con distintas resoluciones (desde 314×468 hasta 2568×1440) y tasas de fotogramas (29.97, 30, 42 y 60 fps).
- Modos de velocidad configurables: `half_frames` o `full_fps`, con o sin TensorRT, con o sin procesos residentes.
- No soporta tool calling, agentes ni razonamiento multimodal en el sentido de un LLM; es una herramienta de visión por computador y reconstrucción de movimiento.

## Casos de uso

- Producción de animación para avatares MetaHuman: el pipeline genera BVH directamente consumible en motores como Unreal Engine, con seguimiento de dedos incluido, lo que evita el rotoscoping manual de planos de referencia.
- Captura de movimiento de bajo coste sin traje: a partir de vídeo grabado con cámara convencional se obtiene SMPL-X, útil para estudios pequeños o creadores individuales que no disponen de un sistema óptico de captura.
- Previsualización rápida en preproducción: con una ratio de 1:5.9 en RTX 5090, un clip de 10 s se procesa en torno a un minuto, lo que permite iterar sobre la interpretación actoral antes del rodaje final.
- Generación de datasets de movimiento: la salida en NPZ/JSON facilita alimentar pipelines de entrenamiento de modelos de movimiento humano, como los descritos por el propio proyecto Movens.
- Reconstrucción de planos de archivo: la entrada admite resoluciones bajas (314×468) y tasas variables, lo que permite recuperar movimiento de material antiguo o de baja calidad para reanimación o doblaje digital.
- Integración en flujos de postproducción VFX: los BVH a 30 fps y a la tasa original permiten alinear la animación con el montaje y aplicar retargeting a esqueletos de personaje en DCC.
- Prototipado de controladores para robótica humanoide o simulación: el movimiento reconstruido en SMPL-X puede retargetearse a esqueletos de humanoides, en línea con el enfoque de modelos fundacionales de movimiento de Movens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (MPJPE, PA-MPJPE, etc.) en la información disponible. El autor sí publica métricas de velocidad y de reproducibilidad.

Velocidad en RTX 5090 con procesos residentes listos (11 vídeos, 109 s totales):

| Video | Resolucion y fps | Duracion | Tiempo | Ratio |
|---|---|---|---|---|
| cross_steps | 720×1280 · 30 | 9.6 s | 46.6 s | 1:4.8 |
| goodcase2 | 2568×1440 · 30 | 5.5 s | 36.4 s | 1:6.6 |
| hand10 | 2564×1440 · 30 | 6.6 s | 43.0 s | 1:6.5 |
| hand12 | 2564×1440 · 30 | 11.8 s | 78.7 s | 1:6.6 |
| badcase1 | 720×1600 · 30 | 8.8 s | 49.7 s | 1:5.7 |
| badcase3 | 314×468 · 30 | 4.2 s | 26.6 s | 1:6.4 |
| badcase6 | 720×1600 · 30 | 13.3 s | 74.6 s | 1:5.6 |
| demo | 1080×1920 · 29.97 | 14.0 s | 80.4 s | 1:5.7 |
| rec_60fps | 1440×2558 · 60 | 15.7 s | 104.2 s | 1:6.6 |
| formal0 | 1920×1080 · 30 | 19.5 s | 103.3 s | 1:5.3 |
| Total | | 109 s | 643 s | 1:5.9 |

Comparación de configuraciones en tres vídeos (cross_steps, hand12, formal0):

| Configuracion | Ratio |
|---|---|
| Rapida por defecto (half_frames + 37 muestras de camara) | 1:5.6 |
| half_frames + todas las muestras de camara | 1:6.1 |
| full_fps + todas las muestras de camara | 1:8.1 |
| v1.5 original | ~1:23 |

Precisión frente al original (6 vídeos reproducibles; diferencias de rotación en 21 articulaciones corporales y 30 de dedos, y posición de raíz):

| Configuracion | Cuerpo media / p95 | Dedos media / % fotogramas >10° | Raiz media |
|---|---|---|---|
| Original vs. si mismo | 0.02° / 0.06° | 0.01° / 0% | 5 mm |
| Solo mejoras de codigo | 0.09° / 0.23° | 0.31° / 4% | 5 mm |
| Codigo + cuerpo en medio fotograma | 0.72° / 2.4° | 2.6° / 26% | 10 mm |
| Rapida por defecto | 0.71° / 2.4° | 2.6° / 26% | 23 mm |

En vídeos difíciles (badcase2, badcase6) la diferencia corporal media sube a unos 2° y el 67% de fotogramas difiere más de 10° en dedos, pero el original también varía 1.07° (p95 5.9°) entre ejecuciones, por lo que no hay verdad de referencia para decidir qué versión es más precisa.

## Requisitos de hardware

- Sistema operativo: Linux x86_64; probado en Ubuntu 22.04.
- GPU: NVIDIA con CUDA compatible; único modelo probado, RTX 5090 (sm_120) con driver 580.76.05 y CUDA 13.0.
- VRAM: los procesos residentes consumen aproximadamente 25 GB en una GPU de 32 GB (3 instancias del servidor de manos); en 24 GB se usa 1 instancia. El número de instancias se puede forzar con `MHBT_HAND_SERVER_INSTANCES`.
- Almacenamiento: al menos 120 GB libres si el paquete comprimido y el directorio descomprimido están en el mismo disco (41 GB + 72 GB).
- Dependencias: GNU tar y zstd.
- Caché de TensorRT: se incluye para RTX 5090; en otra GPU la primera ejecución compila los motores durante varios minutos.
- Despliegue: ejecución mediante `setup.sh` y `run.sh`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de pipeline.
- Latencia y throughput: ratio de aproximadamente 1:5.9 en RTX 5090 (hasta 1:4.8 en clips cortos); los clips cortos tienen un coste fijo de una decena de segundos.

## Comparativa con modelos similares

No se dispone de información sobre alternativas comparables en la documentación proporcionada. Como referencia interna, la única comparación documentada es con la versión anterior del mismo paquete:

| Modelo | Enfoque | Ratio en RTX 5090 | Precision vs. original | Licencia |
|---|---|---|---|---|
| v1.5 fast (este) | half_frames + 37 muestras, TensorRT, residentes | 1:5.9 | 0.71° cuerpo / 2.6° dedos / 23 mm raiz | other |
| v1.5 dual BVH original | full_fps + todas las muestras | ~1:23 | referencia | other |
| Modo compatible del fast | full_fps + todas las muestras | ~1:8 | 0.09° cuerpo / 0.31° dedos / 5 mm raiz | other |

## Limitaciones y advertencias

- Licencia "other": no se detallan los términos; es imprescindible revisar las condiciones antes de cualquier uso comercial.
- Solo probado en RTX 5090 con una configuración concreta de driver, CUDA y sistema operativo; el rendimiento en otras GPU es desconocido.
- La reducción de precisión es medible: cuerpo 0.72° de media (p95 2.4°), dedos 2.6° de media con un 26% de fotogramas por encima de 10° de diferencia, y raíz 23 mm frente al original.
- En vídeos difíciles la discrepancia crece (unos 2° de media corporal y 67% de fotogramas con más de 10° en dedos) y el propio original muestra variabilidad entre ejecuciones, sin verdad de referencia disponible.
- Fallo conocido en la autocomprobación de interpolación de ángulos de Euler del BVH (umbral de 1°): puede abortar la exportación BVH con `BVH interpolation could not meet 1.0deg` aunque el SMPL-X se escriba igualmente; el original falla en demo y rec_60fps, y la versión rápida en badcase2 y de forma intermitente en rec_60fps.
- Fallo ocasional de convergencia en la corrección de muñeca con vídeos de baja resolución en modo full_fps.
- Los procesos residentes retienen VRAM entre ejecuciones; en GPU compartida hay que ajustar el tiempo de inactividad o usar `--no-resident`.
- No hay información publicada sobre sesgos, idiomas ni alucinación, al no ser un modelo generativo de texto; el riesgo principal es la calidad de la reconstrucción en oclusiones, planos difíciles o resoluciones bajas.
- El paquete es muy pesado (43.9 GB de repositorio) y requiere espacio en disco y un proceso de instalación no trivial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Movens-0/metahuman_video_to_smplx_bvh_v1_5_fast
- Proyecto Movens-Zero: https://movens-zero.github.io/
