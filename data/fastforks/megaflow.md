# fastforks/megaflow

## Resumen

MegaFlow es un modelo de estimación de flujo óptico de gran desplazamiento en régimen zero-shot, presentado por Zhang, Wang, Pollefeys y Xu en ECCV 2026. El repositorio `fastforks/megaflow` no contiene pesos propios: es una model card de integración que describe cómo el paquete `fastforks` descarga los pesos originales de los autores (`Kristen-Z/MegaFlow`) y los verifica mediante SHA-256. El modelo resuelve el problema de calcular el movimiento por píxel entre dos fotogramas RGB consecutivos, devolviendo un campo de flujo denso de dos canales (dx, dy en píxeles).

La arquitectura combina un backbone de vídeo transformer basado en DINOv2 ViT-L/14 con 24 bloques de atención alterna frame/global (el agregador de VGGT), una cabeza DPT que fusiona cuatro de sus capas con una CNN ResNet34 para producir características de 128 canales, una correlación global con softmax para el flujo inicial y refinamiento iterativo estilo RAFT sobre correlaciones locales 9x9 de las características 1/4 de la CNN, con sobremuestreo convexo 4x.

Es relevante porque declara resultados state-of-the-art en zero-shot sobre Sintel, KITTI y Spring, y porque el ecosistema `fastforks` ofrece backends portables y con kernels CUDA propios que aceleran la inferencia hasta 2,2x respecto al código original, con paridad numérica verificada frente a la implementación de referencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de vídeo (DINOv2 ViT-L/14 + 24 bloques de atención alterna frame/global, agregador de VGGT) con cabeza DPT, ResNet34 y refinamiento RAFT |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de dos fotogramas; tamaño H x W >= 64, múltiplo de 8) |
| Tipos de cuantización | fp32 y fp16 (según los benchmarks publicados); no se documentan otras |
| Idiomas soportados | no disponible (tarea de visión, no lingüística) |
| Licencia | Apache-2.0 (código y pesos) |
| Formato de pesos | safetensors (`megaflow-flow.safetensors`) |

## Arquitectura y entrenamiento

El modelo procesa un par de imágenes RGB redimensionadas a anchura 952. Un ViT-L/14 inicializado desde DINOv2 actúa como extractor, seguido de 24 bloques que alternan atención por fotograma y atención global (el agregador de VGGT). Una cabeza DPT fusiona cuatro capas del transformer con una ResNet34 para obtener características de 128 canales. Sobre ellas se calcula una correlación global con softmax que produce el flujo inicial, y se refina con actualizaciones iterativas estilo RAFT sobre correlaciones locales 9x9 de las características a 1/4 de resolución de la CNN, con sobremuestreo convexo 4x.

El entrenamiento utiliza FlyingChairs, TartanAir, Freiburg SceneFlow (FlyingThings3D, Driving, Monkaa), MPI Sintel, KITTI stereo y flujo óptico 2012/2015, y el benchmark HCI HD1K, con una mezcla final de Sintel, KITTI 2015 y HD1K. No se documentan en la información disponible detalles sobre RLHF, DPO ni número total de tokens de entrenamiento.

La integración `fastforks` añade dos backends: `portable` (PyTorch) y `kernels` (kernels CUDA propios `fastbb`, `cudnn_hacc`, `raft_flow`), con verificación de paridad numérica frente al código original (CPU fp32: max |diff| <= 0.002; GPU fp16: mean |diff| <= 0.003, p99 <= 0.008).

## Capacidades

- Estimación de flujo óptico denso entre dos fotogramas RGB consecutivos, con salida de movimiento por píxel (dx, dy).
- Funcionamiento zero-shot sobre datasets no vistos (Sintel, KITTI, Spring según el paper).
- Manejo de desplazamientos grandes gracias al componente de correlación global.
- Entrada de tamaño variable: cualquier H x W >= 64, con padding a múltiplo de 8; probado hasta 1080x1920.
- Ejecución en fp32 y fp16.
- Dos backends de inferencia: `portable` y `kernels` (CUDA).
- No expone clipes multifotograma, seguimiento de puntos ni checkpoints chairs-things del proyecto original.
- No dispone de tool calling, capacidades de agente, multilingües ni de generación de texto.

## Casos de uso

- Estabilización de vídeo: el modelo calcula el flujo entre fotogramas consecutivos para estimar movimiento de cámara y aplicar compensación; su resolución de entrada flexible (hasta 1080x1920) permite trabajar a resolución nativa.
- Interpolación de fotogramas: el campo de flujo denso entre pares de fotogramas sirve para sintetizar fotogramas intermedios en pipelines de postproducción o generación de vídeo a alta tasa.
- Análisis de movimiento en conducción autónoma: sobre secuencias KITTI, el modelo ofrece flujo por píxel útil para odometría visual y detección de objetos en movimiento; su entrenamiento incluye KITTI 2015.
- Seguimiento y segmentación por movimiento: el flujo resultante alimenta etapas posteriores de agrupación de movimiento para separar objetos dinámicos del fondo en escenas complejas.
- Evaluación de modelos de vídeo generativo: el flujo de referencia permite medir consistencia temporal de vídeos sintéticos comparando el movimiento real frente al generado.
- Visión robótica y navegación: estimación de desplazamiento entre imágenes consecutivas para control reactivo o SLAM visual ligero, con despliegue en GPU de consumo gracias a los 3 GiB de pico en 1080x1920 con fp16.
- Procesado por lotes en investigación: integración vía `fastforks` con backend `kernels` para acelerar experimentos sobre benchmarks de flujo óptico (Sintel, KITTI, Spring).

## Benchmarks y rendimiento

Precisión sobre KITTI 2015 train (fotogramas _10 -> _11, EPE / Fl-all %):

| Variante | Original fp32 | Original fp16 | Portable | Kernels |
|---|---|---|---|---|
| `megaflow` | 1.714 / 6.68 | 1.727 / 6.75 | 1.715 / 6.69 | 1.714 / 6.69 |

Nota: el modelo fue entrenado con imágenes públicas de este dataset, por lo que no es un resultado zero-shot.

Velocidad y memoria (entrada 1080x1920, RTX 5060 Ti 16 GB):

| Métrica | Original | Portable | Kernels |
|---|---|---|---|
| Tiempo (ms) | 1588 | 1109 | 734 |
| Aceleración vs original | — | — | 2,2x |
| Aceleración vs portable | — | — | 1,5x |
| Memoria pico asignada (MiB) | 8230 | 3035 | 2866 |
| Memoria pico reservada (MiB) | 8786 | 3246 | 3066 |

Arranque y primera llamada:

| Métrica | Original | Portable | Kernels |
|---|---|---|---|
| Carga (s) | 9,56 | 1,96 (375x1242) | 7,10 (375x1242) |
| Primera llamada (s) | 6,77 | 0,76 (375x1242) | 0,67 (375x1242) |

No se publican en la información disponible resultados numéricos de Sintel ni Spring, solo la declaración cualitativa de resultados state-of-the-art zero-shot.

## Requisitos de hardware

- VRAM estimada: unos 3 GiB de pico asignado en 1080x1920 con fp16 (backend portable); unos 2,9 GiB con kernels. En el código original, unos 8,2 GiB.
- GPU recomendadas: NVIDIA con soporte CUDA; los benchmarks se realizaron en una RTX 5060 Ti 16 GB (sm_120). El backend `kernels` requiere un kernel precompilado para la arquitectura de la GPU, descargado desde `fastforks/kernels`; si no existe, lanza `BackendUnavailableError`.
- Cabe en GPU de consumo: sí, con 8 GB o más de VRAM en fp16 para resoluciones altas; resoluciones menores reducen el consumo.
- Opciones de despliegue: paquete `fastforks` (`pip install fastforks`) con modos `portable` y `kernels`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a esta tarea).
- Latencia y throughput: 734 ms por par a 1080x1920 con kernels en RTX 5060 Ti; 1109 ms con portable; 1588 ms con el código original.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MegaFlow (fastforks) | Flujo óptico zero-shot | no disponible | H x W >= 64, probado hasta 1080x1920 | EPE 1,714 / Fl-all 6,69 en KITTI 2015 (entrenado en él) | Apache-2.0 | HF (card) + pesos en Kristen-Z/MegaFlow |
| RAFT | Flujo óptico supervisado | no disponible | Resolución fija típica | no disponible en la información | BSD-3 (código original) | Repo oficial |
| FlowFormer | Flujo óptico transformer | no disponible | Resolución variable | no disponible en la información | no disponible | Repo oficial |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada; la comparativa se limita a categoría y licencia.

## Limitaciones y advertencias

- Solo procesa pares de fotogramas: no expone clipes multifotograma con atención temporal, seguimiento de puntos ni los checkpoints chairs-things del proyecto original.
- El repositorio `fastforks/megaflow` no aloja pesos; depende de la descarga desde `Kristen-Z/MegaFlow` y de la verificación SHA-256.
- El backend `kernels` requiere un kernel precompilado para la arquitectura de GPU concreta y un driver NVIDIA reciente; en caso contrario falla con `BackendUnavailableError`.
- La licencia Apache-2.0 permite uso comercial, pero la model card advierte que el paquete original es de uso de investigación y recomienda revisar las cadenas de licencia antes de otros usos.
- Riesgo de alucinación no aplica en el sentido lingüístico; en cambio, el flujo puede ser impreciso en oclusiones, superficies sin textura o movimientos fuera del rango de entrenamiento.
- Los resultados zero-shot declarados (Sintel, KITTI, Spring) no se acompañan de cifras numéricas en la información disponible.
- El resultado en KITTI 2015 no es zero-shot, ya que el modelo se entrenó con imágenes públicas de ese dataset.
- No se documentan sesgos demográficos ni limitaciones idiomáticas por tratarse de una tarea de visión.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/megaflow
- Pesos de los autores: https://huggingface.co/Kristen-Z/MegaFlow
- Código de integración fastforks: https://github.com/kleinicke/fastforks
- Kernels CUDA: https://huggingface.co/fastforks/kernels
- Código original (cvg/megaflow, commit 2328f8bb2690): https://github.com/cvg/megaflow
- Benchmarks y protocolo: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Paper: MegaFlow (Zhang, Wang, Pollefeys, Xu), ECCV 2026 (sin URL directa en la información disponible)
