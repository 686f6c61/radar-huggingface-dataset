# fastforks/locotrack

## Resumen

LocoTrack es un modelo de seguimiento de puntos (point tracking) en vídeo desarrollado por el laboratorio KU-CVLAB y publicado en ECCV 2024 (Cho et al.). Resuelve la tarea de "tracking any point": dado un vídeo y una serie de puntos de consulta `(t, x, y)`, devuelve la posición de cada punto en todos los fotogramas y la probabilidad de que sea visible en cada uno. Se trata de un modelo offline, es decir, procesa el clip completo de una vez en lugar de operar en streaming fotograma a fotograma.

La arquitectura sigue el enfoque TAPIR con correlación 4D local: un backbone ResNet codifica cada fotograma de 256 x 256 a tres resoluciones, dos volúmenes de coste contra las características de la consulta producen la posición, visibilidad e incertidumbre iniciales, y cuatro etapas de refinamiento correlacionan el vecindario 7 x 7 de cada punto con el soporte 7 x 7 de su consulta mediante convoluciones pequeñas. Un transformer con atención ALiBi sobre los fotogramas de cada trayectoria corrige la trayectoria completa de una vez.

El repositorio de Hugging Face es únicamente una model card: no aloja pesos. La herramienta `fastforks` descarga los pesos originales de los autores y los verifica contra hashes SHA-256. Existen dos variantes, `locotrack-b` y `locotrack-s`, ambas con licencia Apache-2.0 y uso comercial permitido. El modelo está marcado como de nivel experimental dentro del ecosistema fastforks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TAPIR-like con ResNet multi-resolución, volúmenes de coste 4D y transformer con atención ALiBi |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (procesa el vídeo completo de forma offline; resolución de entrada arbitraria H x W >= 32, múltiplo de 32) |
| Tipos de cuantización | fp32 (CPU), fp16 (GPU, por defecto); soporte de TensorRT fp16 planificado para 0.2.1 |
| Idiomas soportados | no aplica (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 (código y pesos) |
| Formato de pesos | checkpoints `.ckpt` de PyTorch (no safetensors, no GGUF) |

## Arquitectura y entrenamiento

LocoTrack emplea un backbone ResNet que codifica cada fotograma de 256 x 256 a tres resoluciones distintas. Sobre esas representaciones se construyen dos volúmenes de coste contra las características de la consulta, que producen una estimación inicial de posición, visibilidad e incertidumbre para cada punto. A continuación, cuatro etapas de refinamiento correlacionan el vecindario 7 x 7 de cada punto de seguimiento con el soporte 7 x 7 de su consulta (una correlación 4D codificada por convoluciones pequeñas). Finalmente, un transformer con atención ALiBi sobre los fotogramas de cada trayectoria corrige la trayectoria completa de forma simultánea, lo que constituye la innovación principal frente a enfoques online.

El entrenamiento se realizó sobre las secuencias sintéticas de Kubric MOVi-E con paneo (panning), publicadas como `hamacojr/LocoTrack-panning-MOVi-E`. No se dispone de información sobre el número de tokens, composición detallada del dataset ni sobre si se aplicaron técnicas de RLHF o DPO (no aplicables en un modelo de visión). La paridad con el código original está verificada: en CPU y float32 la diferencia máxima absoluta es <= 2.3e-05; en GPU y float16 (configuración por defecto) el error medio absoluto es <= 0.0036 y el p99 <= 0.021 sobre la salida `tracks`.

## Capacidades

- Seguimiento de puntos arbitrarios en vídeo (tracking any point) de forma offline sobre el clip completo.
- Salida de posición por fotograma para cada punto de consulta, junto con probabilidad de visibilidad.
- Estimación de incertidumbre y oclusión por punto y fotograma.
- Procesamiento de resoluciones de entrada arbitrarias (H x W >= 32, ajustadas a múltiplo de 32); probado hasta 3000 x 4000.
- Backends `portable` (PyTorch) y `kernels` (kernels CUDA optimizados), con paridad numérica verificada frente al código original.
- Soporte de `torch.compile` (aceleración de 188 ms a 82.6 ms en `locotrack-b` a 480 x 854).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Seguimiento de objetos en postproducción de vídeo: dado un conjunto de puntos de consulta sobre un objeto, LocoTrack devuelve su trayectoria en todos los fotogramas, lo que permite aplicar máscaras, efectos o estabilización con corrección offline de la trayectoria completa.
- Análisis de movimiento en vídeo científico o deportivo: seguimiento de articulaciones o marcadores a lo largo de un clip para extraer trayectorias y estudiar cinemática, aprovechando la corrección global de la trayectoria mediante el transformer con ALiBi.
- Rotoscopia y segmentación asistida: los puntos rastreados y su visibilidad sirven como inicialización o validación para pipelines de segmentación de vídeo (por ejemplo, SAM 2), reduciendo la intervención manual.
- Estabilización y registro de vídeo: el seguimiento de puntos fijos permite estimar el movimiento de cámara fotograma a fotograma y compensarlo, adecuado por su procesamiento offline del clip completo.
- Monitorización y análisis de escenas con oclusiones: la salida de visibilidad probabilística permite descartar puntos ocluidos y mantener la coherencia de la trayectoria en escenas con solapamientos.
- Investigación en visión por computador: evaluación y desarrollo de métodos TAP (tracking any point) sobre TAP-Vid, usando las variantes `locotrack-b` y `locotrack-s` como referencia con paridad verificada frente al código original.
- Procesamiento de imágenes de alta resolución: con hasta 3000 x 4000 probados en una RTX 5060 Ti de 16 GB (5.5 GiB de pico en `locotrack-b`), es viable para seguimiento en vídeo de alta definición en hardware de consumo.

## Benchmarks y rendimiento

Precisión en TAP-Vid DAVIS (protocolo TAP-Vid, fotogramas redimensionados a 256 x 256, una consulta por trayectoria en su primer punto visible, seguimiento sobre el clip completo):

| Variante | Dataset | Original fp32 (AJ / delta_avg / OA %) | Original fp16 | Portable | Kernels |
|---|---|---|---|---|---|
| `locotrack-b` | TAP-Vid DAVIS (cada 3er vídeo) | 67.19 / 78.05 / 89.58 | 67.31 / 78.11 / 89.85 | 67.31 / 78.07 / 89.89 | 67.29 / 78.10 / 89.83 |

Velocidad y memoria en seguimiento sintético a 480 x 854 (RTX 5060 Ti 16 GB, sm_120):

| Modelo | Tiempo original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Memoria pico original (MiB, alloc/reserved) | Portable | Kernels |
|---|---|---|---|---|---|---|---|
| `locotrack-b` | 203 | 188 | 173 | 1.2x | 719 / 784 | 603 / 656 | 614 / 660 |
| `locotrack-s` | 193 | 180 | 151 | 1.3x | 706 / 812 | 759 / 842 | 596 / 642 |

Arranque y primera llamada:

| Modelo | Carga original (s) | Portable | Kernels | Primera llamada original (s) | Portable | Kernels |
|---|---|---|---|---|---|---|
| `locotrack-b` | 0.79 | 0.35 | 0.18 | 1.06 | 0.72 | 0.87 |
| `locotrack-s` | 0.29 | 0.06 | 1.13 | 0.23 | 0.65 | 0.66 |

`torch.compile` y TensorRT (480 x 854):

| Modelo | Portable (ms) | Compile (ms) | TensorRT fp16 | Kernels (ms) | Preparación compile (primera llamada en frío) |
|---|---|---|---|---|---|
| `locotrack-b` | 188 | 82.6 | planificado para 0.2.1 | 173 | 146 s |
| `locotrack-s` | 180 | 74.1 | planificado para 0.2.1 | 151 | 140 s |

## Requisitos de hardware

- VRAM estimada: `locotrack-b` y `locotrack-s` requieren aproximadamente 5.4-5.5 GiB de pico asignado para entradas de 3000 x 4000 en fp16 (backend portable, RTX 5060 Ti 16 GB).
- En seguimiento a 480 x 854, la memoria pico ronda 600-760 MiB asignados y 640-840 MiB reservados según backend y variante.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 8 GB de VRAM para resoluciones moderadas; 16 GB o más para entradas de alta resolución (3000 x 4000).
- Cabe en GPU de consumo: sí, probado en RTX 5060 Ti 16 GB (sm_120). Para resoluciones pequeñas es viable en GPUs de 8 GB.
- Opciones de despliegue: librería `fastforks` con backends `portable` (PyTorch) y `kernels` (kernels CUDA); soporte de `torch.compile`; TensorRT fp16 planificado para la versión 0.2.1. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión de este tipo).
- Latencia: 173-188 ms por clip sintético de 480 x 854 en `locotrack-b`; 151-180 ms en `locotrack-s`; con `torch.compile` baja a 82.6 ms y 74.1 ms respectivamente. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / entrada | Precisión TAP-Vid DAVIS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LocoTrack (`locotrack-b`) | TAPIR-like offline, correlación 4D local | Vídeo completo, H x W >= 32 | AJ 67.19-67.31 / delta_avg 78.05-78.11 / OA 89.58-89.85 | Apache-2.0 | Pesos vía enlaces de autores, verificación SHA-256 en fastforks |
| TAPIR | TAPIR offline | Vídeo completo | no disponible en la información proporcionada | no disponible | no disponible |
| AllTracker | TAPIR-like offline | Vídeo completo | no disponible en la información proporcionada | no disponible | no disponible |
| TAPNext | Online | Fotograma a fotograma | no disponible en la información proporcionada | no disponible | no disponible |
| Track-On | Online | Fotograma a fotograma | no disponible en la información proporcionada | no disponible | no disponible |

Los modelos comparables se citan en el protocolo de evaluación de la model card (TAPIR, AllTracker, TAPNext, Track-On), pero no se proporcionan sus resultados numéricos en la información disponible.

## Limitaciones y advertencias

- Modelo de visión sin capacidades de lenguaje, razonamiento, código ni tool calling; no debe evaluarse con benchmarks de texto.
- Nivel "experimental" declarado por el propio repositorio fastforks: la API y el soporte de backends pueden cambiar (TensorRT aún planificado para 0.2.1).
- Entrenado únicamente con secuencias sintéticas de Kubric MOVi-E con paneo; el rendimiento en vídeo real puede degradarse respecto a datos sintéticos (no se documentan métricas en datasets reales más allá de TAP-Vid DAVIS).
- Procesamiento offline: requiere el clip completo en memoria; no apto para streaming o tiempo real en vídeos largos de alta resolución.
- La resolución de entrada debe ser múltiplo de 32 y al menos 32 x 32; entradas fuera de rango no están soportadas.
- Riesgo de fallo en oclusiones prolongadas, cambios de apariencia drásticos o puntos que salen y vuelven a entrar en el encuadre; la visibilidad se modela probabilísticamente pero no se garantiza.
- Pesos no alojados en Hugging Face: la descarga depende de enlaces externos de los autores; fastforks verifica integridad mediante SHA-256, pero la disponibilidad futura de esos enlaces no está garantizada.
- Licencia Apache-2.0 permite uso comercial, pero la model card advierte que el paquete original es de uso investigador y recomienda revisar las cadenas de licencia antes de otros usos.
- No se documentan sesgos específicos ni evaluaciones de robustez más allá de la paridad numérica con el código original.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/locotrack
- Repositorio fastforks: https://github.com/kleinicke/fastforks
- Kernels para el backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original (KU-CVLAB/LocoTrack, commit `3385a233a270`): https://github.com/KU-CVLAB/LocoTrack
- Pesos `locotrack_base.ckpt`: https://huggingface.co/datasets/hamacojr/LocoTrack-pytorch-weights/resolve/a8754d0edfd9e53713dcb31ee21734aac8b727cf/locotrack_base.ckpt
- Pesos `locotrack_small.ckpt`: https://huggingface.co/datasets/hamacojr/LocoTrack-pytorch-weights/resolve/a8754d0edfd9e53713dcb31ee21734aac8b727cf/locotrack_small.ckpt
- Dataset de entrenamiento (LocoTrack-panning-MOVi-E): https://huggingface.co/datasets/hamacojr/LocoTrack-panning-MOVi-E
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- `card.toml` con hashes completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/tracking/models/locotrack/card.toml
- Paper (Cho et al., ECCV 2024): no disponible en la información proporcionada
