# fastforks/tapnext

## Resumen

TAPNext es un modelo de seguimiento de puntos arbitrarios en vídeo (*tracking any point*, TAP) desarrollado por Google DeepMind y publicado en 2025 (Zholus, Doersch, Yang, Koppula et al.). A diferencia de los enfoques clásicos de correlación de características, TAPNext formula el seguimiento como predicción del siguiente token: el modelo lee parches de 8x8 píxeles de fotogramas de 256x256 junto con un token por punto de consulta y predice, fotograma a fotograma, la posición del punto (clasificación en 512 bins con *soft-argmax* ventaneado) y su visibilidad.

La arquitectura es un TRecViT-B con 12 bloques; cada bloque combina una recurrencia lineal con compuertas sobre el eje temporal por token y una capa ViT sobre los tokens de un mismo fotograma. El modelo es estrictamente online: cada fotograma solo ve el pasado, lo que lo hace apto para inferencia en streaming sobre vídeo. Los pesos originales son de Google DeepMind y se distribuyen bajo licencia Apache-2.0.

El repositorio `fastforks/tapnext` no aloja pesos: es una model card de integración que documenta cómo el runtime *fastforks* descarga los checkpoints del autor, los verifica por SHA-256 y los ejecuta con dos backends (`portable` y `kernels`), además de publicar métricas de latencia, memoria y paridad numérica frente al código original. Es relevante para desarrolladores que necesitan integrar TAP en pipelines de vídeo con garantías de reproducibilidad y control de memoria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TRecViT-B (12 bloques; recurrencia lineal con compuertas sobre tiempo + capa ViT por fotograma) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana temporal online, sin límite declarado; entrenado con secuencias de hasta 1024 fotogramas en Kubric-1024) |
| Tipos de cuantización | fp16 (por defecto en GPU), fp32 (CPU y referencia); no se documentan cuantizaciones int8/int4 |
| Idiomas soportados | no aplica (modelo de visión/vídeo) |
| Licencia | Apache-2.0 (código y pesos) |
| Formato de pesos | `.npz` (`bootstapnext_ckpt.npz`) y `.pt` (`tapnextpp_ckpt.pt`); no se distribuyen safetensors ni GGUF |
| Entrada | vídeo (fotogramas en orden) + puntos de consulta `(t, x, y)`; H x W >= 32, múltiplo de 32 |
| Salidas | `tracks` (posición por fotograma) y `visibility` (probabilidad) |
| Backends | `portable`, `kernels` |
| Pipeline | keypoint-detection |

## Arquitectura y entrenamiento

TAPNext se construye sobre TRecViT-B: 12 bloques que alternan una recurrencia lineal con compuertas a lo largo del tiempo para cada token y una capa de atención tipo ViT sobre los tokens de un mismo fotograma. La entrada son parches de 8x8 de fotogramas de 256x256 más un token por punto de consulta. La predicción de posición se plantea como clasificación en 512 bins con *soft-argmax* ventaneado, y se emite además una probabilidad de visibilidad por fotograma. El diseño es causal en el tiempo (online), de modo que en cada paso solo se dispone del pasado.

El entrenamiento parte de secuencias sintéticas Kubric MOVi-F y se afina con autoentrenamiento BootsTAP sobre vídeos reales sin etiquetar (no publicados). La variante TAPNext++ se afina adicionalmente sobre PointOdyssey y Kubric-1024 (secuencias sintéticas de 1024 fotogramas). No se documentan en la información disponible detalles sobre volumen total de tokens, composición exacta del dataset ni uso de RLHF/DPO.

## Capacidades

- Seguimiento denso de puntos arbitrarios en vídeo (*tracking any point*) con consultas `(t, x, y)`.
- Predicción de visibilidad por punto y fotograma (probabilidad de oclusión).
- Inferencia estrictamente online: cada fotograma solo utiliza información pasada, apta para streaming.
- Resolución de entrada flexible: cualquier H x W >= 32, redondeado a múltiplo de 32 (probado hasta 3000x4000).
- Ejecución en CPU (fp32) y GPU (fp16) con paridad numérica verificada frente al código original (max |diff| <= 4.6e-05 en CPU fp32).
- Backend `kernels` con kernels optimizados publicados en `fastforks/kernels`.
- Compatibilidad con `torch.compile` (398 ms frente a 529 ms en portable para 480x854) y preparación de TensorRT fp16 (build diferido).
- Verificación de integridad de pesos mediante SHA-256.
- No soporta tool calling, agentes, texto, audio ni razonamiento multi-paso; es un modelo puramente visual.

## Casos de uso

- Seguimiento de objetos en vídeo de vigilancia: dado un punto inicial sobre un vehículo o persona, TAPNext produce su trayectoria fotograma a fotograma con visibilidad, lo que permite detectar oclusiones y reapariciones en secuencias largas.
- Rotoscopia y postproducción: seguimiento de puntos de referencia sobre elementos de la escena para estabilización, tracking de cámara o composición, con resolución de entrada configurable hasta 3000x4000.
- Análisis deportivo: seguimiento de articulaciones o implementos (balón, raqueta) a partir de puntos anotados manualmente en el primer fotograma visible, extrayendo trayectorias y métricas de movimiento.
- Robótica y manipulación: seguimiento online de puntos de agarre o marcadores sobre objetos en flujo de cámara en vivo, aprovechando que el modelo es causal y no requiere el clip completo.
- Procesamiento de vídeo en tiempo real en GPUs de consumo: con 382 ms por clip sintético de 480x854 en backend `kernels` sobre una RTX 5060 Ti 16 GB y 1313 MiB de memoria pico, es viable en estaciones de trabajo con GPU de gama media.
- Investigación en visión por computador: banco de pruebas reproducible para comparar formulaciones TAP (clasificación por bins frente a regresión) con paridad numérica garantizada frente al código de referencia.
- Automatización de anotación de datasets: generar pseudo-etiquetas de trayectorias sobre vídeo no etiquetado para preentrenar o evaluar otros modelos de seguimiento.

## Benchmarks y rendimiento

Precisión en TAP-Vid DAVIS (protocolo TAP-Vid, fotogramas a 256x256, consulta en el primer punto visible; AJ / delta_avg / OA en %):

| Variante | Original fp32 | Original fp16 | Portable | Kernels |
|---|---|---|---|---|
| `tapnext` (cada 3er vídeo) | 71,01 / 82,01 / 95,18 | 71,02 / 82,02 / 95,19 | 71,02 / 82,02 / 95,19 | 71,02 / 82,03 / 95,23 |
| `tapnext` (todos los vídeos) | 66,55 / 79,48 / 92,16 | 66,55 / 79,49 / 92,17 | 66,55 / 79,49 / 92,17 | 66,56 / 79,50 / 92,18 |
| `tapnext-pp` (cada 3er vídeo) | 71,48 / 82,43 / 94,96 | 71,50 / 82,43 / 94,96 | 71,50 / 82,43 / 94,96 | 71,47 / 82,41 / 94,98 |

Latencia y memoria en seguimiento sintético 480x854 (RTX 5060 Ti 16 GB, sm_120):

| Modelo | Original | Portable | Kernels | Aceleración kernels vs original | Memoria pico portable (MiB alloc/reserved) |
|---|---|---|---|---|---|
| `tapnext` | 909 ms | 529 ms | 382 ms | 2,4x | 1220 / 1294 |
| `tapnext-pp` | 1493 ms | 529 ms | no disponible | no disponible | 1220 / 1294 |

Arranque y primera llamada:

| Modelo | Carga original | Carga portable | Carga kernels | Primera llamada original | Primera llamada portable | Primera llamada kernels |
|---|---|---|---|---|---|---|
| `tapnext` | 16,92 s | 2,72 s | 2,63 s | 2,17 s | 0,69 s | 0,56 s |
| `tapnext-pp` | 4,83 s | 1,34 s | no disponible | 1,80 s | 0,77 s | no disponible |

`torch.compile` sobre `tapnext` a 480x854: 398 ms (frente a 529 ms en portable), con 40,5 s de compilación en frío y 1164 / 1272 MiB de memoria pico. TensorRT fp16 queda diferido (build superior a 5 minutos).

## Requisitos de hardware

- VRAM estimada: 1220 MiB asignados (1294 MiB reservados) para 480x854 en fp16; 4,3 GiB asignados (4,5 GiB reservados) para entradas de 3000x4000 con `tapnext` y `tapnext-pp`.
- GPU recomendadas: RTX 5060 Ti 16 GB (hardware de referencia de los benchmarks); cualquier GPU con al menos 6-8 GB de VRAM para resoluciones medias y 16 GB para resoluciones muy altas.
- Cabe en GPU de consumo: sí, con holgura en tarjetas de 8 GB o más para resoluciones habituales (480p-1080p).
- Despliegue: runtime `fastforks` con backends `portable` y `kernels`; soporte de `torch.compile` y preparación de TensorRT fp16 (build diferido). No se documenta integración con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión).
- Latencia: 382 ms por clip sintético de 480x854 en `kernels`; 529 ms en `portable`; 398 ms con `torch.compile`. Throughput no publicado en fotogramas por segundo.

## Comparativa con modelos similares

| Modelo | Formulación | Contexto temporal | AJ en TAP-Vid DAVIS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TAPNext (`tapnext`) | Clasificación por bins + soft-argmax, online | Causal (solo pasado) | 66,55 (todos) / 71,01 (subconjunto) | Apache-2.0 | Pesos en Google Cloud, runtime fastforks |
| TAPNext++ (`tapnext-pp`) | Igual, afinado en PointOdyssey y Kubric-1024 | Causal | 71,48 (subconjunto) | Apache-2.0 | Pesos en Google Cloud, runtime fastforks |
| TAPIR | Correlación + refinamiento, offline | Clip completo | no disponible en esta información | no disponible | Código en DeepMind tapnet |
| LocoTrack | Correlación local, offline | Clip completo | no disponible en esta información | no disponible | no disponible |
| AllTracker | Correlación, offline | Clip completo | no disponible en esta información | no disponible | no disponible |

Los valores de AJ de TAPIR, LocoTrack y AllTracker no se incluyen en la información proporcionada; la model card solo indica que se evalúan sobre el clip completo, a diferencia del modo online de TAPNext.

## Limitaciones y advertencias

- Los pesos no se alojan en Hugging Face: se descargan de `storage.googleapis.com` y se verifican por SHA-256; la disponibilidad depende de esos enlaces externos.
- El repositorio es solo una model card sin pesos ni código de inferencia propio; requiere el runtime `fastforks` (repositorio GitHub de terceros).
- Modelo puramente visual: no procesa texto, audio ni instrucciones; no soporta tool calling ni agentes.
- Evaluación limitada a TAP-Vid DAVIS en la información disponible; no se reportan resultados en otros conjuntos (Kinetics, RGB-Stacking, PointOdyssey) ni comparativas numéricas con TAPIR, LocoTrack o AllTracker.
- El modo online implica que no puede revisar fotogramas futuros; en oclusiones prolongadas o movimientos rápidos fuera de la ventana causal la precisión puede degradarse (no cuantificado en la información disponible).
- Los datos de entrenamiento reales (BootsTAP) no se publican, lo que limita la auditoría de sesgos y de dominio de aplicación.
- La model card advierte que las cadenas de licencia del código original se registran tal cual y deben revisarse antes de cualquier uso distinto de la investigación; los pesos figuran como Apache-2.0 con uso comercial permitido.
- No se documentan cuantizaciones de baja precisión (int8/int4) ni despliegue en CPU con backend `kernels`.
- TensorRT fp16 no está validado (build superior a 5 minutos); `torch.compile` para `tapnext-pp` está planificado para 0.2.1.
- Riesgo de alucinación no aplica en el sentido textual, pero sí de trayectorias espurias en puntos ocluidos o fuera de plano; conviene umbralizar la salida de visibilidad.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/tapnext
- Repositorio del runtime fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Código original de DeepMind (commit `ceedd60bb9f6`): https://github.com/google-deepmind/tapnet
- Pesos `tapnext`: https://storage.googleapis.com/dm-tapnet/tapnext/bootstapnext_ckpt.npz
- Pesos `tapnext-pp`: https://storage.googleapis.com/dm-tapnet/tapnextpp/tapnextpp_ckpt.pt
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Fichero de definición de variantes y hashes: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/tracking/models/tapnext/card.toml
- Evidencia de licencia del código original: https://github.com/google-deepmind/tapnet/blob/ceedd60bb9f6c9f7c74796e4445aff6c6ddf7c9b/README.md#license-and-disclaimer
