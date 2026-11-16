# fastforks/tapir

## Resumen

TAPIR (Tracking Any Point with per-frame Initialization and temporal Refinement) es un modelo de seguimiento de puntos arbitrarios en vídeo desarrollado originalmente por Google DeepMind (Doersch, Yang, Vecerik et al., 2023). El repositorio `fastforks/tapir` no contiene pesos propios: es una model card de integración que descarga los checkpoints oficiales de los autores y los verifica mediante SHA-256. El modelo resuelve el problema de rastrear cualquier punto `(t, x, y)` a lo largo de todos los fotogramas de un vídeo, devolviendo tanto la posición como la probabilidad de visibilidad en cada fotograma.

La arquitectura combina un codificador ResNet que procesa cada fotograma a 256 x 256 píxeles, un volumen de coste que estima la posición inicial, visibilidad e incertidumbre de la consulta, y cuatro refinamientos de estilo PIPs que corrigen la trayectoria completa de forma conjunta mediante correlaciones locales y un mezclador MLP con convoluciones depthwise sobre los fotogramas de cada track. Se distribuyen dos variantes: `tapir@1` (entrenada sobre secuencias sintéticas Kubric MOVi-E) y `bootstapir@1` (entrenada adicionalmente con autoentrenamiento BootsTAP sobre unos 15 millones de clips de vídeo real no etiquetados).

La relevancia actual radica en que ofrece seguimiento denso offline con precisión cercana al estado del arte en el protocolo TAP-Vid, licencia Apache-2.0 para pesos y código, y una implementación optimizada (`fastforks`) con backends portable y kernels CUDA, además de soporte para `torch.compile` y TensorRT que reduce la latencia hasta 13,2 ms por clip en la variante BootsTAPIR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet encoder + cost volume + 4 refinamientos PIPs (correlaciones locales + MLP mixer depthwise) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (vídeo completo; entrada H x W >= 32, múltiplo de 32) |
| Tipos de cuantizacion | fp32, fp16 (TensorRT fp16 soportado) |
| Idiomas soportados | no aplica (modelo de visión/vídeo, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 (código y pesos) |
| Formato de pesos | `.pt` (PyTorch checkpoints oficiales de DeepMind) |

## Arquitectura y entrenamiento

TAPIR es una red de seguimiento de puntos totalmente feed-forward. Un codificador ResNet procesa cada fotograma redimensionado a 256 x 256 y genera un mapa de características. Para cada punto de consulta `(t, x, y)` se construye un volumen de coste contra las características del fotograma, del que se derivan la posición inicial, la visibilidad y una estimación de incertidumbre. Posteriormente, cuatro iteraciones de refinamiento de estilo PIPs combinan correlaciones locales con un mezclador MLP que aplica convoluciones depthwise a lo largo del eje temporal de cada track, corrigiendo la trayectoria completa de una sola pasada en lugar de frame a frame.

En cuanto a los datos, `tapir@1` se entrena sobre secuencias sintéticas Kubric MOVi-E (variante "panning"). `bootstapir@1` parte de esa base y se entrena adicionalmente con el método de autoentrenamiento BootsTAP (Doersch et al., 2024) sobre aproximadamente 15 millones de clips de vídeo real no etiquetados, que no se han publicado. No se especifica en la información disponible el número total de tokens ni detalles de RLHF/DPO (no aplicables a este dominio). La innovación técnica principal es el refinamiento conjunto de toda la trayectoria en una sola pasada, junto con la verificación criptográfica de pesos y la paridad numérica con el código original (diferencia máxima <= 3,5e-05 en CPU fp32).

## Capacidades

- Seguimiento de puntos arbitrarios ("tracking any point") a lo largo de un vídeo completo, offline.
- Entrada: secuencia de fotogramas y puntos de consulta `(t, x, y)`.
- Salida: `tracks` (posición por fotograma) y `visibility` (probabilidad de visibilidad).
- Manejo de oclusiones mediante la cabeza de visibilidad e incertidumbre.
- Resolución de entrada flexible: cualquier H x W >= 32, con padding a múltiplo de 32; probado hasta 3000 x 4000.
- Backends `portable` y `kernels` (CUDA), con soporte de `torch.compile` y TensorRT fp16.
- No soporta tool calling, agentes, generación de texto ni capacidades multilingües (es un modelo puramente visual).

## Casos de uso

- **Postproducción y rotoscopia asistida**: seguir puntos de interés sobre un actor u objeto a lo largo de un plano para generar máscaras o trayectorias de estabilización; el modelo mantiene la identidad del punto durante oclusiones gracias a la cabeza de visibilidad.
- **Estabilización de vídeo y motion tracking**: usar los tracks como correspondencias para estimar movimiento de cámara o compensar vibraciones en clips de dron o cámara en mano.
- **Análisis deportivo**: rastrear articulaciones o el balón en secuencias de entrenamiento; la resolución de entrada flexible permite trabajar con metraje 4K reescalado.
- **Robótica y manipulación**: seguimiento offline de puntos de agarre o marcadores en vídeos de demostración para extraer trayectorias de imitación.
- **VFX y composición**: fijar elementos gráficos a superficies en movimiento a partir de tracks densos y su visibilidad por fotograma.
- **Análisis biomédico de vídeo**: seguimiento de puntos anatómicos en grabaciones de procedimientos o de comportamiento animal, donde la consistencia temporal es crítica.
- **Anotación automática de datasets**: preetiquetar tracks en vídeos para acelerar la revisión humana en pipelines de datos de visión.

## Benchmarks y rendimiento

Precisión en el protocolo TAP-Vid DAVIS (resolución 256 x 256, AJ / delta_avg / OA en %):

| Variante | Dataset | original fp32 | portable | kernels |
|---|---|---|---|---|
| `bootstapir` | TAP-Vid DAVIS (query first, cada 3er vídeo) | 65,49 / 76,75 / 92,56 | 65,56 / 76,78 / 92,44 | 65,51 / 76,72 / 92,51 |
| `bootstapir` | TAP-Vid DAVIS (query first, completo) | 62,27 / 74,62 / 89,67 | 62,29 / 74,61 / 89,66 | 62,27 / 74,61 / 89,64 |
| `tapir` | TAP-Vid DAVIS (query first, cada 3er vídeo) | 62,63 / 74,54 / 90,14 | 62,74 / 74,59 / 90,11 | 62,73 / 74,55 / 90,21 |

Latencia y memoria (vídeo sintético 480 x 854, RTX 5060 Ti 16 GB):

| Modelo | Tiempo original | Tiempo portable | Tiempo kernels | Memoria pico (MiB, alloc/reserved) |
|---|---|---|---|---|
| `bootstapir` | 243 ms | 234 ms | 192 ms | 508 / 628 |
| `tapir` | 187 ms | 182 ms | 141 ms | 463 / 548 |

Aceleración con TensorRT fp16 (480 x 854): `bootstapir` 13,2 ms y `tapir` 6,47 ms, con un coste de compilación en frío de 65,0 s y 55,2 s respectivamente.

## Requisitos de hardware

- VRAM estimada: unos 508 MiB asignados (628 MiB reservados) para `bootstapir` a 480 x 854 en fp16; hasta 5,6 GiB asignados (6,1 GiB reservados) a 3000 x 4000.
- GPU recomendadas: cualquier GPU CUDA con al menos 8 GB para resoluciones moderadas; RTX 5060 Ti 16 GB es la referencia medida. Para 4K se recomienda 12-16 GB.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB o superiores para resoluciones habituales; en RTX 4090/5090 para 4K.
- Opciones de despliegue: backend `portable` (PyTorch), backend `kernels` (CUDA), `torch.compile` y TensorRT fp16. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia: 141-192 ms por clip a 480 x 854 con kernels; 6,47-13,2 ms con TensorRT fp16. Carga del modelo: 0,19-0,32 s en portable, 1,13-1,14 s con kernels.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto temporal | Licencia | Disponibilidad |
|---|---|---|---|---|
| TAPIR / BootsTAPIR (este) | Seguimiento de puntos offline | Clip completo | Apache-2.0 | Pesos oficiales DeepMind + integración fastforks |
| AllTracker | Seguimiento de puntos | Clip completo | no disponible en la información | no disponible |
| LocoTrack | Seguimiento de puntos | Clip completo | no disponible en la información | no disponible |
| TAPNext | Seguimiento online | Online | no disponible en la información | no disponible |
| Track-On | Seguimiento online | Online | no disponible en la información | no disponible |

Los modelos anteriores se citan en la model card como referencias del protocolo TAP-Vid, pero no se proporcionan sus especificaciones ni resultados comparativos detallados en la información disponible.

## Limitaciones y advertencias

- Modelo puramente visual: no procesa texto, audio ni lenguaje; los campos de idiomas y contexto lingüístico no aplican.
- Seguimiento offline: requiere el vídeo completo (o una ventana) antes de producir la trayectoria; no está diseñado para streaming en tiempo real sin adaptación.
- Resolución interna fija de 256 x 256 por fotograma: detalles finos pueden perderse en objetos pequeños o texturas de alta frecuencia.
- Riesgo de deriva en secuencias largas con oclusiones prolongadas o cambios de apariencia severos, pese a la cabeza de visibilidad.
- Los datos de entrenamiento de BootsTAP (unos 15 millones de clips reales) no se han publicado, lo que limita la reproducibilidad y el análisis de sesgos.
- La model card advierte que el paquete original es de "research-use" y que deben revisarse las cadenas de licencia antes de cualquier otro uso, aunque los pesos figuran como Apache-2.0 y con uso comercial permitido.
- El repositorio no aloja pesos: depende de enlaces externos de Google Cloud Storage, con verificación SHA-256 obligatoria.
- No se han publicado análisis de sesgos demográficos ni de robustez ante dominios visuales distintos de los evaluados.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/tapir
- Repositorio de código fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Código original de DeepMind: https://github.com/google-deepmind/tapnet (commit `ceedd60bb9f6`)
- Pesos BootsTAPIR: https://storage.googleapis.com/dm-tapnet/bootstap/bootstapir_checkpoint_v2.pt
- Pesos TAPIR: https://storage.googleapis.com/dm-tapnet/tapir_checkpoint_panning.pt
- Benchmarks y protocolo: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Definición de variantes y hashes: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/tracking/models/tapir/card.toml
- Evidencia de licencia: https://github.com/google-deepmind/tapnet/blob/ceedd60bb9f6c9f7c74796e4445aff6c6ddf7c9b/README.md#license-and-disclaimer
