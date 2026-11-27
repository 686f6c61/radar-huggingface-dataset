# gooner-dan/jav-act-classifier

## Resumen

`gooner-dan/jav-act-classifier` es un clasificador de imágenes para fotogramas individuales de vídeo, desarrollado por el usuario independiente gooner-dan y publicado en Hugging Face. No es un modelo de lenguaje ni un modelo generativo: es una cabeza de clasificación lineal sobre un backbone vision transformer congelado (DINOv3 ViT-L/16) afinado mediante LoRA. Su función concreta es etiquetar cada fotograma con una o varias de 14 clases que describen actos sexuales explícitos, más dos clases de control (`not_sex` y `other`).

El modelo resuelve un problema de clasificación multietiqueta en un dominio muy específico: el análisis automático de fotogramas de vídeo para adultos. Su relevancia es limitada y de nicho, orientada a pipelines de catalogación, indexación o filtrado de material audiovisual para adultos que el operador esté legalmente autorizado a procesar. No está pensado como clasificador general de moderación de contenido ni de seguridad.

Técnicamente, el repositorio no contiene el backbone: solo distribuye un checkpoint de 8,5 MB con los deltas LoRA (rango 16 sobre las capas Linear de los últimos 8 bloques), la cabeza lineal, la media y desviación típica de las características y la lista de clases. El backbone debe descargarse por separado desde `timm/vit_large_patch16_dinov3.lvd1689m` y queda sujeto a la licencia DINOv3 de Meta. El modelo tiene 0 descargas y 1 like en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-L/16 (DINOv3) con adaptadores LoRA y cabeza lineal de clasificación |
| Parametros totales | no disponible (el repo solo contiene un checkpoint de 8,5 MB con deltas LoRA y cabeza; el backbone se descarga aparte) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imagen, crop 224x384) |
| Tipos de cuantizacion | bfloat16 en entrenamiento; calibración FP8 opcional para activaciones (solo CUDA) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | dinov3-license (licencia DINOv3 de Meta); el campo `license` figura como `other` |
| Formato de pesos | `.pt` (PyTorch, `torch.load` con `weights_only=False`); incluye `frame_act_head.pt` y opcional `frame_act_head.fp8.pt` |

## Arquitectura y entrenamiento

El modelo parte del backbone DINOv3 ViT-L/16 (`vit_large_patch16_dinov3.lvd1689m`) de la librería `timm`, un vision transformer de parches 16x16 preentrenado con el método de autosupervisión DINOv3. Sobre ese backbone se aplica un ajuste fino con LoRA de rango 16 en todas las capas Linear de los últimos 8 bloques; los deltas se fusionan en el backbone mediante `W + scale * B @ A`. La cabeza es una capa lineal que opera sobre las características `[CLS, mean]`, estandarizadas con la media (`mu`) y desviación (`sd`) almacenadas en el checkpoint. El crop de entrada es de 224x384 píxeles y el dtype de entrenamiento es bfloat16.

El entrenamiento consistió en 8 épocas de ajuste fino LoRA más cabeza lineal, con etiquetas anotadas por el propio autor (un único anotador). La función de pérdida es entropía cruzada binaria (BCE) por clase, lo que convierte el problema en multietiqueta: cada una de las 14 salidas se puntúa de forma independiente con sigmoide y no suman 1. Se aplicó ponderación por clase positiva, por lo que las salidas no están calibradas como probabilidades. No se documenta el volumen del dataset, la composición de las fuentes de vídeo ni si hubo etapas adicionales de refinamiento.

## Capacidades

- Clasificación multietiqueta de fotogramas individuales de vídeo en 14 clases: `bj`, `cowgirl`, `doggy`, `fingering`, `handjob`, `missionary`, `not_sex`, `other`, `side`, `standing`, `titjob`, `cunnilingus`, `3p`, `footjob`.
- Puntuación independiente por clase con sigmoide (no softmax), lo que permite que un mismo fotograma active varias etiquetas simultáneamente (por ejemplo, una posición más `3p`).
- Extracción de características del backbone DINOv3 ViT-L/16, reutilizable para otras tareas de visión si se descongela o se reutiliza la cabeza.
- Calibración FP8 opcional de activaciones para inferencia en CUDA.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni procesamiento de audio o vídeo secuencial: trabaja fotograma a fotograma.

## Casos de uso

- Indexación y catalogación de bibliotecas de vídeo para adultos: el modelo etiqueta cada fotograma con las prácticas detectadas, permitiendo generar metadatos y facilitar búsquedas dentro de un catálogo que el operador esté legalmente autorizado a procesar.
- Segmentación temporal de escenas: aplicando el clasificador a fotogramas muestreados (por ejemplo, uno por segundo) se pueden agrupar tramos con la misma etiqueta dominante y construir capítulos o marcadores de escena.
- Filtrado previo en pipelines de curación de datasets: descartar o separar fotogramas `not_sex` y `other` antes de un etiquetado manual más costoso, reduciendo el volumen a revisar.
- Control de calidad de anotaciones existentes: comparar las etiquetas del modelo con las de un dataset propio para detectar discrepancias y priorizar la revisión humana.
- Generación de miniaturas o previews etiquetadas: seleccionar fotogramas representativos de cada práctica para portadas o vistas previas, usando la puntuación por clase como criterio de selección.
- Investigación sobre clasificación multietiqueta en dominios de nicho: el checkpoint sirve como ejemplo reproducible de ajuste LoRA sobre DINOv3 con cabeza lineal y métricas por clase, útil para estudiar el comportamiento de adaptadores de bajo rango en visión.
- Moderación interna de plataformas para adultos: como señal auxiliar (no como único filtro) para clasificar contenido subido por usuarios, siempre con revisión humana y umbrales ajustados por clase.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre un split de validación retenido, agrupado por vídeo:

| Metrica | Valor |
|---|---|
| mAP | 0,917 |
| Top-1 accuracy | 0,903 |

Precisión media (AP) por clase:

| Clase | AP |
|---|---|
| bj | 0,979 |
| cowgirl | 0,942 |
| doggy | 0,985 |
| fingering | 0,901 |
| handjob | 0,904 |
| missionary | 0,963 |
| not_sex | 0,838 |
| other | 0,820 |
| side | 0,964 |
| standing | 0,980 |
| titjob | 0,959 |
| cunnilingus | 0,941 |
| 3p | 0,951 |
| footjob | 0,709 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone ViT-L/16 en bfloat16 ocupa del orden de 1,2 GB de pesos (unos 300 M de parámetros); con activaciones y batch pequeño, la inferencia cabe holgadamente en GPUs de 8 GB o menos. El checkpoint adicional (8,5 MB) es despreciable.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090, A100, H100). Para FP8 se requiere CUDA y hardware compatible con esa precisión.
- Cabe en GPU de consumo: sí, en RTX 3060/4060/4070/4090 y similares; también podría ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`) y `timm` para el backbone; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de imagen). Se puede envolver en un servidor de inferencia propio (FastAPI, TorchServe) o en pipelines de visión con `timm`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia estructural, el propio backbone `timm/vit_large_patch16_dinov3.lvd1689m` es la alternativa base sin ajuste, pero no es un clasificador de estas 14 clases. Otros clasificadores NSFW genéricos no son directamente comparables porque abordan una tarea distinta (detección de contenido explícito frente a clasificación de prácticas concretas).

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gooner-dan/jav-act-classifier | no disponible (backbone ViT-L/16 + LoRA) | no aplica | Clasificación multietiqueta de 14 clases | dinov3-license | Hugging Face |
| timm/vit_large_patch16_dinov3.lvd1689m | no disponible | no aplica | Backbone de visión general | dinov3-license | Hugging Face / timm |
| Clasificadores NSFW genéricos | no disponible | no aplica | Detección de contenido explícito | variable | variable |

## Limitaciones y advertencias

- Contenido NSFW/18+: el modelo está diseñado para material para adultos y sus nombres de clase son explícitos; debe usarse solo con contenido que el operador esté legalmente autorizado a poseer y procesar.
- Etiquetas de un único anotador: la calidad y los sesgos del modelo reflejan el criterio de una sola persona; no hay validación interanotador.
- Validación sobre un único split: las métricas (mAP 0,917, top-1 0,903) proceden de una sola partición agrupada por vídeo y deben tomarse como indicativas, no como garantía de generalización.
- Clases débiles: `footjob` (AP 0,709), `other` (0,820) y `not_sex` (0,838) son las de peor rendimiento; los umbrales deben ajustarse por clase en datos propios.
- Salidas no calibradas: la ponderación por clase positiva en el entrenamiento hace que 0,5 sea un umbral de partida razonable pero no una probabilidad real; no aplicar softmax ni argmax si se necesitan múltiples etiquetas.
- `not_sex` y `other` son clases ordinarias, no "ninguna de las anteriores": un fotograma sin acto puede puntuar bajo en las 14 clases.
- No es un clasificador general de moderación ni de seguridad: no debe usarse como único filtro en producción.
- Licencia: el backbone y, por derivación, estos pesos quedan sujetos a la licencia DINOv3 de Meta; es necesario revisarla antes de cualquier reutilización o uso comercial.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y negativos en la clasificación, especialmente en clases poco representadas y en fotogramas con oclusiones o ángulos atípicos.
- Fecha de creación futura (2026-11-27) en los metadatos: conviene verificar la vigencia y el estado del repositorio antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gooner-dan/jav-act-classifier
- Backbone DINOv3 ViT-L/16 en timm: https://huggingface.co/timm/vit_large_patch16_dinov3.lvd1689m
- Licencia DINOv3: https://ai.meta.com/resources/models-and-libraries/dinov3-license/
- Repositorio `timm`: https://github.com/huggingface/pytorch-image-models
- Paper DINOv3: no disponible en la información proporcionada
