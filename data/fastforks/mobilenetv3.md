# fastforks/mobilenetv3

## Resumen

MobileNetV3 es una arquitectura de red neuronal convolucional para clasificación de imágenes publicada originalmente por Howard et al. en 2019 (Google AI). Este repositorio, `fastforks/mobilenetv3`, no contiene pesos propios: es una model card que documenta la integración del modelo en la librería `fastforks`, la cual descarga los pesos originales desde los enlaces del autor y verifica su integridad mediante SHA-256. La variante disponible es `mobilenet_v3_large.tv2_in1k`, entrenada sobre ImageNet-1k y publicada originalmente en `torchvision`.

El modelo resuelve clasificación de imágenes en 1.000 clases de ImageNet-1k a partir de una única imagen RGB de 224x224 píxeles. Su relevancia práctica radica en el rendimiento en inferencia: la integración `fastforks` reporta 0,63 ms por imagen con el backend de kernels CUDA propios sobre una RTX 5060 Ti, frente a 4,33 ms del código original en fp32, con un pico de memoria asignada de 78 MiB. Es, por tanto, un modelo orientado a throughput alto en pipelines de visión por computador.

La ficha se limita a lo documentado en la model card: no se dispone de información sobre número de parámetros, contexto (no aplica a un clasificador) ni resultados de precisión top-1/top-5 en ImageNet más allá de las comprobaciones de paridad numérica frente al código original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN MobileNetV3 (inverted residuals con squeeze-excite y hard-swish, según Howard et al. 2019) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imagen, entrada fija 224x224) |
| Tipos de cuantizacion | no disponible; precisión de ejecución documentada: fp32 (original) y fp16 (portable y kernels) |
| Idiomas soportados | no disponible (tarea de visión; etiquetas ImageNet-1k en inglés por convención del dataset) |
| Licencia | Código BSD-3-Clause; pesos sin licencia declarada por los autores (`bsd-3-clause-code-weights-unstated`) |
| Formato de pesos | `.pth` (PyTorch, descargado desde `download.pytorch.org`); no se alojan en el repo |
| Variante | `mobilenet_v3_large.tv2_in1k@1` |
| Tarea | Clasificación de imagen, salida `logits` sobre ImageNet-1k |
| Entrada | Imagen RGB, redimensionado lado corto 232 y center-crop a 224x224 |
| Backends | `portable` (PyTorch) y `kernels` (CUDA propio) |
| SHA-256 (prefijo) | `5c1a416349c4` |

## Arquitectura y entrenamiento

La arquitectura es MobileNetV3 (variante *large*), una CNN con bloques de residuales invertidos (*inverted residuals*) combinados con módulos de *squeeze-and-excite* y activación *hard-swish*, tal como se describe en el trabajo de Howard et al. de 2019. No es un transformer ni un modelo híbrido; es una red convolucional pura optimizada para eficiencia computacional en dispositivos con recursos limitados, aunque en esta integración se ejecuta en GPU.

Los pesos incluidos en la variante `mobilenet_v3_large.tv2_in1k` provienen de `torchvision` (commit `1f1a920d685d`), entrenados sobre ImageNet-1k (ILSVRC 2012). La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset más allá de ImageNet-1k, ni si hubo fases de ajuste fino adicionales. La innovación técnica destacable de esta integración no está en el modelo en sí, sino en el backend `kernels`: kernels CUDA propios (`cudnn_hacc`, `fvm_conv`, `fvm_extra`, `fvm_mb`, `fvm_r3`) que aceleran la inferencia y que se descargan desde `fastforks/kernels` según la arquitectura de GPU detectada. La paridad numérica con el código original se verifica contra salidas doradas: en CPU float32, diferencia máxima absoluta ≤ 0,002; en GPU float16, diferencia media ≤ 0,02 px y p99 ≤ 0,08 px.

## Capacidades

- Clasificación de imágenes en 1.000 clases de ImageNet-1k, devolviendo logits y utilidades para obtener el top-k.
- Inferencia sobre una única imagen RGB de 224x224 con preprocesado fijo (resize a 232 en el lado corto y center-crop).
- Ejecución en GPU (CUDA) con fp16 por defecto, o en CPU si no hay GPU disponible.
- Backend `kernels` con aceleración CUDA específica por arquitectura de GPU, con selección automática mediante `mode="auto"`.
- Verificación de integridad de pesos mediante SHA-256 antes de la carga.
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general (detección, segmentación), audio ni modo *thinking*: es exclusivamente un clasificador de imagen.

## Casos de uso

- Moderación de contenido visual a gran escala: clasificación rápida de imágenes en pipelines de subida para etiquetar categorías ImageNet y filtrar contenido mediante capas posteriores; el coste de 0,6 ms por imagen con el backend `kernels` permite procesar miles de imágenes por segundo en una sola GPU.
- Etiquetado automático de catálogos de producto: asignación de etiquetas gruesas (animales, objetos, vehículos) a imágenes de inventario antes de un clasificador específico de dominio; la salida top-k permite revisión humana de los casos ambiguos.
- Pre-filtrado en sistemas de visión multi-etapa: uso del modelo como primera etapa barata que descarta o enruta imágenes hacia modelos más pesados, aprovechando su bajo pico de memoria (46-78 MiB asignados) para convivir con otros modelos en la misma GPU.
- Extracción de características y *embedding* base para búsqueda visual: aunque la model card no documenta explícitamente la extracción de features, la arquitectura permite usar las activaciones intermedias como representación compacta para indexación y recuperación por similitud.
- Monitorización de vídeo en tiempo real: clasificación por fotograma a 224x224 en flujos de cámara, con latencia sub-milisegundo por frame en el backend `kernels`, adecuada para alertas de presencia de clases concretas.
- *Benchmarking* y validación de infraestructura: modelo de referencia ligero para medir el rendimiento de nuevas GPUs o de drivers CUDA, dado que la model card publica tiempos comparativos entre backends y precisión fp16/fp32.
- Pruebas de regresión en CI/CD de pipelines de visión: comparación de salidas frente a las salidas doradas del código original (tolerancias documentadas) para detectar cambios no deseados en preprocesado o kernels.

## Benchmarks y rendimiento

Datos de velocidad y memoria publicados en la model card (RTX 5060 Ti 16 GB, sm_120, entrada sintética 224x224):

| Modelo | Tiempo original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | vs portable | Memoria pico original (MiB, asignada/reservada) | Portable | Kernels |
|---|---|---|---|---|---|---|---|---|---|
| `mobilenet_v3_large.tv2_in1k` | 4,33 | 6,2 | 3,8 | 0,63 | 6,9x | 6,0x | 65 / 80 | 46 / 76 | 78 / 116 |

Tiempos de carga y primera llamada:

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `mobilenet_v3_large.tv2_in1k` | 1,25 | 0,34 | 0,18 | 1,97 | 0,03 | 0,00 |

Velocidad y memoria a tamaño fijo:

| Modelo | Modo | 224x224 (ms / asignada / reservada MiB) |
|---|---|---|
| `mobilenet_v3_large.tv2_in1k` | portable | 3,6 / 46 / 66 |
| `mobilenet_v3_large.tv2_in1k` | kernels | 0,6 / 78 / 104 |

Paridad numérica: CPU float32, diferencia máxima absoluta ≤ 0,002 frente al código original; GPU float16 (portable y kernels), diferencia media ≤ 0,02 px y p99 ≤ 0,08 px. No se han publicado resultados de precisión top-1/top-5 en ImageNet en la información disponible.

## Requisitos de hardware

- VRAM estimada: muy baja; el pico asignado por el asignador de PyTorch es de 46 MiB (portable) y 78 MiB (kernels) para una imagen de 224x224, con reserva de 66-116 MiB.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA reciente; los benchmarks se tomaron en una RTX 5060 Ti 16 GB (sm_120). Para el backend `kernels` se requiere un kernel precompilado para la arquitectura concreta de la GPU, descargado de `fastforks/kernels` en el primer uso.
- Cabe holgadamente en GPU de consumo: cualquier tarjeta con al menos ~1 GB de VRAM libre es suficiente; también funciona en CPU con el backend `portable`.
- Opciones de despliegue: librería `fastforks` (`pip install fastforks`) con `classification.load(...)`; backends `portable` (PyTorch) y `kernels` (CUDA propio). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de imagen).
- Latencia y throughput: 3,6 ms/imagen en portable y 0,6 ms/imagen en kernels sobre RTX 5060 Ti; primera llamada prácticamente inmediata en portable (0,03 s) y kernels (0,00 s); carga del modelo en 0,18-1,25 s según backend.
- Requisito de driver: el backend `kernels` exige un driver NVIDIA reciente; si no hay kernel para la GPU, lanza `BackendUnavailableError` sin *fallback* silencioso.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de otros clasificadores comparables (por ejemplo, otras variantes de MobileNetV3, EfficientNet o ResNet) más allá del propio código original de `torchvision`, que se usa como referencia de paridad. La comparativa disponible es interna, entre backends del mismo modelo:

| Alternativa | Parámetros | Entrada | Tiempo (ms) | Memoria pico asignada (MiB) | Licencia |
|---|---|---|---|---|---|
| `mobilenet_v3_large.tv2_in1k` (original fp32) | no disponible | 224x224 | 4,33 | 65 | BSD-3-Clause (código) |
| `mobilenet_v3_large.tv2_in1k` (portable fp16) | no disponible | 224x224 | 3,8 | 46 | BSD-3-Clause (código) |
| `mobilenet_v3_large.tv2_in1k` (kernels fp16) | no disponible | 224x224 | 0,63 | 78 | BSD-3-Clause (código) |

Comparativa con otros modelos de la misma categoría: no disponible.

## Limitaciones y advertencias

- El repositorio no aloja pesos: es solo una model card. La disponibilidad del modelo depende de que los enlaces del autor (`download.pytorch.org`) sigan activos y de que el SHA-256 coincida.
- Licencia ambigua: el código es BSD-3-Clause, pero los autores no declaran una licencia separada para los pesos. La model card indica uso comercial "yes" asumiendo BSD-3-Clause a partir del código, pero esa asunción no está confirmada por los autores originales; conviene verificarla antes de uso comercial.
- Es un clasificador cerrado de 1.000 clases ImageNet-1k: no generaliza a categorías fuera de ese vocabulario ni ofrece detección, segmentación o descripción en lenguaje natural.
- Entrada fija de 224x224 con preprocesado concreto (resize a 232 y center-crop): desviarse de ese pipeline degrada la paridad con las salidas de referencia.
- Sesgos del dataset ImageNet-1k: el modelo hereda los sesgos de clase, geográficos y demográficos del dataset original, no documentados en esta model card.
- Riesgo de alucinación de clase: ante imágenes fuera de distribución o ambiguas, el clasificador siempre devuelve una de las 1.000 clases con logits, sin mecanismo de abstención.
- El backend `kernels` no tiene *fallback* silencioso: si no existe kernel precompilado para la GPU o el driver es antiguo, falla con `BackendUnavailableError`; en producción conviene usar `mode="auto"` o gestionar la excepción.
- Precisión fp16 por defecto en GPU: puede introducir diferencias numéricas (documentadas como media ≤ 0,02 px y p99 ≤ 0,08 px) frente a fp32.
- Sin datos publicados de precisión top-1/top-5 en esta ficha: no se puede evaluar la calidad del modelo a partir de la información disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte comunitario mínimos.

## Enlaces

- Hugging Face: https://huggingface.co/fastforks/mobilenetv3
- Repositorio de código `fastforks`: https://github.com/kleinicke/fastforks
- Kernels CUDA: https://huggingface.co/fastforks/kernels
- Definición de la variante (`card.toml`): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/classification/models/mobilenetv3/card.toml
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Pesos originales: https://download.pytorch.org/models/mobilenet_v3_large-5c1a4163.pth
- Código original (`torchvision`, commit `1f1a920d685d`): https://github.com/pytorch/vision
- Licencia del código original: https://github.com/pytorch/vision/blob/1f1a920d685d46dfbe187934b785b7ecb7a182f2/LICENSE
