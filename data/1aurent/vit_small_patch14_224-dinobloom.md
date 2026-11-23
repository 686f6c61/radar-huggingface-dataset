# 1aurent/vit_small_patch14_224.dinobloom

## Resumen

DinoBloom es una familia de modelos de visión (ViT) especializados en la generación de embeddings de células para hematología, desarrollada por el grupo MarrLab (Valentin Koch, Sophia J. Wagner, Carsten Marr y colaboradores) y publicada en arXiv en abril de 2024. El modelo aquí descrito, `vit_small_patch14_224.dinobloom`, es la variante "small" del backbone ViT, con 21,6 millones de parámetros, entrada de 224x224 píxeles y parches de 14x14, distribuida en formato compatible con la librería `timm` de Hugging Face por el usuario `1aurent`.

El problema que resuelve es la falta de representaciones visuales generalizables para imágenes de frotis de sangre periférica y médula ósea: los modelos de visión genéricos (ImageNet) no capturan bien la morfología celular fina, y los modelos entrenados de forma supervisada en un único dataset no transfieren bien a otras tareas hematológicas. DinoBloom se entrena con auto-supervisión (DINOv2) sobre un corpus amplio de imágenes de células sanguíneas, de modo que los embeddings resultantes sirven como extractor de características congelado para clasificación, recuperación (retrieval) y segmentación de células.

Es relevante ahora porque los pipelines de análisis hematológico automatizado (recuento diferencial, detección de blastos, cribado de leucemia) necesitan backbones ligeros y con licencia permisiva que funcionen como extractor de características sin reentrenamiento costoso. Esta variante "small" es especialmente interesante para despliegue en entornos con recursos limitados. La model card indica que existe una versión más reciente del modelo en `MarrLab/DinoBloom`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con parches de 14x14, preentrenado con DINOv2 |
| Parámetros totales | 21.628.800 (~22 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224x224x3) |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización estándar de PyTorch, no documentada por el autor) |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con `timm`) |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer estándar de tipo "small" con parches de 14x14 y resolución de entrada 224x224, es decir, 256 tokens por imagen más el token de clase. Se preentrena con el paradigma auto-supervisado DINOv2, que combina destilación de conocimiento auto-supervisada con pérdidas de consistencia entre vistas aumentadas de la misma imagen, lo que produce representaciones densas y transferibles sin necesidad de etiquetas. El backbone está pensado como extractor de características: la salida es un vector de 384 dimensiones por imagen (dimensión típica de ViT-Small; el dato exacto de la dimensión de embedding no se detalla en la información disponible).

El entrenamiento se realizó sobre un corpus de imágenes de hematología (frotis de sangre periférica y médula ósea) recopilado por el equipo de MarrLab; la model card no detalla el número exacto de imágenes ni la composición del dataset, aunque remite al paper (arXiv:2404.05022) y a los pesos originales en Zenodo. No se documenta en la información disponible el uso de RLHF, DPO ni ajuste supervisado adicional; el modelo se distribuye como backbone de características, no como clasificador final. La innovación principal es el dominio de preentrenamiento (hematología) y la disponibilidad de una familia de tres tamaños (small, base, large) bajo licencia Apache 2.0.

## Capacidades

- Extracción de embeddings de imágenes de células y tejido hematológico (frotis de sangre periférica, médula ósea).
- Clasificación de imágenes mediante cabezas lineales o fine-tuning sobre los embeddings (la model card declara la tarea `image-classification` además de `feature-extraction`).
- Recuperación de imágenes por similitud (retrieval) en espacios de embeddings celulares.
- Segmentación y agrupamiento (clustering) de poblaciones celulares a partir de las representaciones.
- Transferencia a tareas hematológicas downstream con pocos datos etiquetados, gracias al preentrenamiento auto-supervisado.
- Integración nativa con `timm` (`timm.create_model("hf-hub:1aurent/vit_small_patch14_224.dinobloom")`), incluidas las transformaciones de normalización y redimensionado resueltas automáticamente.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje: es exclusivamente un modelo de visión.

## Casos de uso

- Recuento diferencial automatizado de leucocitos: los embeddings del modelo se usan como entrada a un clasificador ligero (regresión logística o MLP) que distingue neutrófilos, linfocitos, monocitos, eosinófilos y basófilos en frotis de sangre perpétua; el backbone congelado evita reentrenar un ViT desde cero con pocos datos.
- Cribado de leucemia y detección de blastos: el modelo actúa como extractor de características para un clasificador binario o multiclase que marca muestras sospechosas, aprovechando que el preentrenamiento en dominio hematológico captura morfología nuclear y citoplasmática.
- Búsqueda de casos similares en archivos históricos (retrieval): indexar los embeddings de un archivo de imágenes de médula ósea y recuperar las muestras visualmente más parecidas a una consulta para apoyo diagnóstico o docencia.
- Control de calidad y agrupamiento no supervisado: agrupar imágenes por similitud para detectar lotes mal teñidos, artefactos de extensión o poblaciones celulares raras sin etiquetas.
- Preentrenamiento para tareas downstream con datos escasos: congelar el backbone y entrenar solo una cabeza en datasets pequeños de citología, reduciendo el riesgo de sobreajuste frente a un ViT preentrenado en ImageNet.
- Despliegue en entornos con recursos limitados: al ser la variante "small" (22 M de parámetros, repo de 0,1 GB), cabe en GPUs de consumo e incluso en CPU para inferencia por lotes, lo que facilita su integración en laboratorios sin infraestructura dedicada.
- Investigación en representaciones celulares: servir de baseline reproducible (licencia Apache 2.0, pesos en safetensors, integración `timm`) para comparar estrategias de preentrenamiento en hematología.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al paper (arXiv:2404.05022) para las evaluaciones, pero no incluye tablas de resultados en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 22 M de parámetros en fp32 los pesos ocupan ~86 MB, y en fp16 ~43 MB. La activación depende del tamaño de lote, pero para lotes pequeños cabe holgadamente en 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna sirve; para producción por lotes se recomiendan A100, H100 o L4/A10 por throughput, aunque no son necesarias.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos ~2 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, etc.), e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `timm` (vía `timm.create_model` con `hf-hub:`), PyTorch nativo, exportación a ONNX/TorchScript para servir con ONNX Runtime o Triton; no se documenta soporte específico en vLLM, llama.cpp u Ollama (son herramientas orientadas a modelos de lenguaje).
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `1aurent/vit_small_patch14_224.dinobloom` | 21,6 M | Imagen 224x224 | Hematología (DINOv2) | Apache 2.0 | Hugging Face (`timm`) |
| `MarrLab/DinoBloom` (versión nueva) | no disponible (familia small/base/large) | Imagen 224x224 | Hematología (DINOv2) | Apache 2.0 | Hugging Face |
| ViT-Small preentrenado en ImageNet (p. ej. `vit_small_patch14_224`) | ~22 M | Imagen 224x224 | Visión general | según checkpoint (habitualmente Apache 2.0 o MIT) | Hugging Face / `timm` |

La comparación cuantitativa de rendimiento entre estos modelos no está disponible en la información proporcionada; la diferencia principal es el dominio de preentrenamiento (hematología frente a visión general) y el tamaño de la familia (la versión `MarrLab/DinoBloom` incluye variantes base y large).

## Limitaciones y advertencias

- Modelo de dominio específico: entrenado en imágenes hematológicas; su rendimiento fuera de ese dominio (fotografía natural, radiología, etc.) no está documentado y probablemente sea inferior a backbones de propósito general.
- No es un clasificador listo para usar: la model card lo presenta como backbone de características; requiere una cabeza o fine-tuning para tareas concretas.
- Riesgo de sesgo por dataset: si el corpus de preentrenamiento sobrerrepresenta ciertos tipos de tinción, escáneres o poblaciones, los embeddings pueden no generalizar a otras condiciones de adquisición; la composición del dataset no se detalla en la información disponible.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero un clasificador construido sobre estos embeddings puede producir falsos positivos/negativos con consecuencias clínicas; no debe usarse como dispositivo médico sin validación regulatoria.
- Limitaciones de idioma: no aplica (modelo de imagen); no procesa texto.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución; aun así, el uso clínico real exige validación independiente y cumplimiento normativo (MDR/CE, FDA) que la licencia no cubre.
- La model card indica una versión más reciente (`MarrLab/DinoBloom`); para nuevos proyectos conviene evaluar esa versión antes de fijar esta.
- El repo es pequeño (0,1 GB) y tiene pocas descargas (1034) y un solo "like" en el momento de la consulta: menor comunidad y soporte que backbones mainstream.

## Enlaces

- Hugging Face: https://huggingface.co/1aurent/vit_small_patch14_224.dinobloom
- Repositorio GitHub: https://github.com/marrlab/DinoBloom
- Paper (arXiv): https://arxiv.org/abs/2404.05022
- Pesos originales (Zenodo): https://zenodo.org/records/10908163
- Versión nueva del modelo: https://huggingface.co/MarrLab/DinoBloom
- Licencia: https://github.com/marrlab/DinoBloom/blob/main/LICENSE
