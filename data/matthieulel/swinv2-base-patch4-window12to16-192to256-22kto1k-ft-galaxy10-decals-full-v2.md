# matthieulel/swinv2-base-patch4-window12to16-192to256-22kto1k-ft-galaxy10-decals-full-v2

## Resumen

Swin Transformer V2 es una arquitectura de visión de tipo transformer jerárquico con atención por ventanas desplazadas, desarrollada originalmente por Microsoft Research. Este checkpoint concreto es un ajuste fino completo del modelo `microsoft/swinv2-base-patch4-window12to16-192to256-22kto1k-ft` para clasificación de morfología de galaxias sobre el conjunto Galaxy10 DECaLS, publicado por el usuario matthieulel como parte de una colección de 80 configuraciones (40 backbones preentrenados por dos regímenes de adaptación) del benchmark *Vision Foundation Models Benchmark*.

El modelo resuelve una tarea de clasificación de imágenes en 10 clases morfológicas galácticas, un problema clásico de astronomía observacional donde los catálogos manuales no escalan al volumen de datos de los sondeos modernos (DECaLS, LSST). El checkpoint tiene 86.904.066 parámetros y se distribuye en formato safetensors con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia actual es metodológica: forma parte de un estudio sistemático sobre cómo se comportan los modelos fundacionales de visión cuando se transfieren a datos astronómicos, comparando ajuste fino completo frente a otras estrategias de adaptación bajo un protocolo idéntico y reproducible. El autor reporta 84,84 % de accuracy y 84,71 % de F1 ponderado en el conjunto de test reservado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer V2 (transformer jerárquico con atención por ventanas desplazadas) |
| Parametros totales | 86.904.066 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada 256x256 px) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantización estándar de PyTorch pero no se documenta) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea | image-classification (10 clases de morfología galáctica) |
| Modelo base | microsoft/swinv2-base-patch4-window12to16-192to256-22kto1k-ft |
| Dataset de ajuste | matthieulel/galaxy10_decals (Galaxy10 DECaLS) |
| Resolución de entrada | 256x256 px (resize + center crop) |
| Tamaño del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura es Swin Transformer V2 en configuración *base*, con parches de 4x4 píxeles y ventanas de atención de 12 a 16 (variante de resolución progresiva 192→256 px). El backbone preentrenado procede de ImageNet-22k y fue ajustado posteriormente a ImageNet-1k por Microsoft antes de este ajuste fino. La cabeza de clasificación es una única capa lineal con diez salidas, una por clase morfológica.

El ajuste fino es completo: se actualizan todos los parámetros, no solo la cabeza. El protocolo es idéntico para los 40 backbones del benchmark: AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 5e-5, schedule lineal con 10 % de warm-up, batches de 32 imágenes con acumulación de gradiente en 8 pasos (batch efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. La aumentación se limita a random resized crop a la resolución de entrada y flip horizontal aleatorio. La evaluación aplica resize y center crop a 256x256 px con la normalización del procesador de imágenes del checkpoint.

Los datos son Galaxy10 DECaLS (17.736 imágenes en total). El split público de test (1.774 imágenes) se reserva como test held-out; el split público de train se divide de forma estratificada por clase en 14.188 imágenes de entrenamiento y 1.774 de validación. La validación se usa únicamente para seleccionar la época: se elige la de mínima pérdida de validación, que en la semilla 42 corresponde a la época 10 de 30. El autor reporta una comprobación de integridad: al recargar el modelo y ejecutarlo sobre las primeras 96 imágenes de test, las predicciones coinciden con los logits guardados en el 100 % de los casos, con una diferencia absoluta máxima de 6,68e-06.

## Capacidades

- Clasificación de imágenes en 10 clases de morfología galáctica sobre recortes de 256x256 px de Galaxy10 DECaLS.
- Extracción de características visuales de uso general gracias al backbone Swin V2 preentrenado en ImageNet-22k e ImageNet-1k.
- Ajuste fino adicional sobre dominios astronómicos u otros datasets de imagen con recetas estándar de transformers.
- Inferencia por lotes en GPU única; el tamaño reducido (0,3 GB) permite despliegues ligeros.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión-lenguaje: es un clasificador de imagen puro.
- No dispone de modo *thinking*, audio ni vídeo.

## Casos de uso

- Clasificación morfológica automatizada en pipelines de sondeos astronómicos: el modelo etiqueta recortes de galaxias en 10 clases con ~85 % de accuracy, lo que permite preclasificar grandes volúmenes de imágenes antes de la revisión humana y reducir el cuello de botella de los catálogos manuales.
- Etiquetado asistido para creación de catálogos: usar las predicciones como propuesta inicial en herramientas de anotación, con revisión humana de los casos de baja confianza, acelera la construcción de catálogos morfológicos a gran escala.
- Filtrado y selección de candidatos: aplicar el clasificador como primera etapa para separar clases de interés (por ejemplo, espirales frente a elípticas) antes de análisis morfológicos más costosos o de espectroscopía de seguimiento.
- Control de calidad de datos: detectar recortes anómalos, artefactos o imágenes mal etiquetadas comparando la predicción del modelo con la etiqueta del catálogo original.
- Benchmark y comparación de backbones: al formar parte de una colección de 80 configuraciones con protocolo idéntico, sirve como referencia reproducible para evaluar otras arquitecturas de visión en datos astronómicos.
- Prototipado rápido en investigación: con 0,3 GB de pesos y una receta de ajuste fino documentada, se puede reentrenar sobre un subconjunto propio en una GPU de consumo para validar hipótesis antes de escalar.
- Educación y divulgación: modelo ligero y de licencia permisiva para demostraciones de clasificación morfológica en cursos de astronomía computacional o talleres de *machine learning*.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test held-out de Galaxy10 DECaLS (1.774 imágenes). No verificados de forma independiente.

| Metrica | Valor |
|---|---|
| Accuracy (semilla 42, época 10) | 84,84 % |
| F1 ponderado (semilla 42, época 10) | 84,71 % |
| Accuracy media ± desv. típica (semillas 42, 1, 2) | 84,97 ± 0,23 % |
| F1 ponderado medio ± desv. típica (semillas 42, 1, 2) | 84,76 ± 0,20 % |

Evolución por épocas de la semilla 42 (selección por mínima pérdida de validación en época 10):

| Epoca | Perdida val. | Acc. val. (%) | Acc. test (%) | F1 test (%) |
|---|---|---|---|---|
| 1 | 0,9296 | 67,36 | 65,95 | 63,26 |
| 5 | 0,4818 | 84,22 | 84,44 | 84,24 |
| 10 (seleccionada) | 0,4286 | 86,08 | 84,84 | 84,71 |
| 20 | 0,5417 | 86,64 | 86,30 | 86,06 |
| 30 | 0,5964 | 87,26 | 86,02 | 85,83 |

No se han publicado en la información disponible resultados comparativos con otros backbones del mismo benchmark ni con modelos alternativos sobre Galaxy10 DECaLS.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,4-0,6 GB para el modelo y los tensores intermedios con batch pequeño; el repositorio ocupa 0,3 GB.
- VRAM estimada en fp16/bf16: aproximadamente 0,25-0,4 GB, con posible solapamiento de memoria por los tensores de activación.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Funciona en RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin problema; el modelo no aprovecha las GPU de gama alta por su tamaño reducido.
- Cabe holgadamente en GPU de consumo e incluso en CPU para inferencia por lotes pequeños (latencia mayor).
- Opciones de despliegue: transformers (PyTorch) es la vía documentada; también es compatible con TorchScript/ONNX si se exporta, y con endpoints de HuggingFace (tag `endpoints_compatible`). No se documenta soporte nativo de vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de resultados de otros backbones del mismo benchmark en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A nivel cualitativo:

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Swin V2 base, Galaxy10) | 86,9 M | 256x256 px | Clasificación de 10 clases galácticas | Apache 2.0 | HuggingFace |
| microsoft/swinv2-base-patch4-window12to16-192to256-22kto1k-ft | ~88 M (no confirmado) | 256x256 px | Clasificación ImageNet-1k (1000 clases) | Apache 2.0 | HuggingFace |
| ViT-B/16 (referencia genérica) | ~86 M | 224x224 px | Clasificación ImageNet-1k | Apache 2.0 | HuggingFace |
| ResNet-50 (referencia CNN) | ~25 M | 224x224 px | Clasificación ImageNet-1k | Apache 2.0 | HuggingFace |

Los datos de parametrización de los modelos alternativos no provienen de la información proporcionada y deben verificarse en sus respectivas model cards. No hay datos de rendimiento comparado sobre Galaxy10 DECaLS en la información disponible.

## Limitaciones y advertencias

- El modelo está especializado en morfología galáctica sobre recortes de Galaxy10 DECaLS; su rendimiento fuera de esa distribución (otros sondeos, otros instrumentos, otras resoluciones o profundidades) no está caracterizado.
- Las métricas son declaradas por el autor y no han sido verificadas de forma independiente (`verified: false` en el model-index).
- La selección de época se hace por mínima pérdida de validación (época 10), pero las métricas de test de épocas posteriores son superiores (hasta 86,58 % en la época 21); existe una discrepancia entre el criterio de selección y el óptimo de test que conviene tener en cuenta al reproducir.
- Riesgo de sesgo de clase y de dominio: Galaxy10 DECaLS tiene un desbalance de clases conocido y proviene de un único sondeo; las clases minoritarias pueden tener peor recall que la media reportada.
- Riesgo de alucinación en sentido amplio: el modelo siempre asigna una de las 10 clases, incluso ante imágenes fuera de distribución o artefactos; no hay mecanismo de abstención ni umbral de confianza incorporado.
- Sin capacidades lingüísticas, de razonamiento ni de agentes: no debe emplearse en tareas de texto, tool calling ni pipelines multimodales.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción ni sobre la idoneidad científica de las predicciones.
- El paper asociado está en revisión en *Astronomy and Computing* (versión revisada, 2026); la cita definitiva aún no está disponible.
- El repositorio tiene muy pocas descargas y ningún *like* en el momento de la consulta, lo que limita la evidencia de uso comunitario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/matthieulel/swinv2-base-patch4-window12to16-192to256-22kto1k-ft-galaxy10-decals-full-v2
- Modelo base: https://huggingface.co/microsoft/swinv2-base-patch4-window12to16-192to256-22kto1k-ft
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de métricas por época y splits: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Paper asociado: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada 2026 (cita pendiente de publicación; sin enlace disponible)
