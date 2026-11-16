# fastforks/convnext

## Resumen

ConvNeXt es una familia de redes neuronales convolucionales puras para clasificación de imágenes, publicada originalmente por Liu et al. en 2022 dentro de Meta AI (FAIR). El diseño moderniza la CNN clásica incorporando elementos propios de los transformers (convoluciones depthwise de 7x7, LayerNorm y bloques MLP), y se entrena sobre ImageNet-1k y ImageNet-22k. Esta ficha describe el paquete `fastforks/convnext`, que no aloja pesos propios: es una model card que referencia los checkpoints oficiales de `timm` y verifica su integridad mediante SHA-256.

El repositorio pertenece al proyecto fastforks, una librería de inferencia que expone modelos de clasificación con dos backends (`portable` y `kernels`) y salidas de tipo `logits`. La tarea soportada es `image-classification` sobre una única imagen RGB de entrada, con 12 variantes que cubren los tamaños tiny, small, base y large, tanto en resolución 224x224 como 384x384 y con pesos preentrenados en ImageNet-1k o ajustados desde ImageNet-22k.

Su relevancia actual es práctica: ofrece una vía estandarizada y verificable para desplegar clasificadores ConvNeXt en producción con licencia Apache-2.0 y uso comercial permitido, sin depender de la carga manual de checkpoints. No es un modelo generativo ni multimodal; es un backbone convolucional de clasificación cerrada sobre las 1.000 clases de ImageNet-1k.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN pura ConvNeXt (conv depthwise 7x7 + LayerNorm + MLP) |
| Parametros totales | no disponible (depende de la variante: tiny, small, base, large) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 224x224 o 384x384 píxeles) |
| Tipos de cuantizacion | no disponible (la model card cita pruebas en fp16) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache-2.0 (código y pesos; uso comercial permitido) |
| Formato de pesos | safetensors (alojados en repos de `timm`, no en este repo) |

## Arquitectura y entrenamiento

ConvNeXt sustituye el diseño de ResNet por un bloque compuesto de convolución depthwise de 7x7, normalización LayerNorm y un MLP con activación GELU, manteniendo una estructura puramente convolucional sin mecanismos de atención. El paquete fastforks expone 12 variantes: `convnext_tiny`, `convnext_small`, `convnext_base` y `convnext_large`, cada una en tres configuraciones de pesos (`fb_in1k`, `fb_in22k_ft_in1k` y `fb_in22k_ft_in1k_384`). Las variantes `_384` operan a resolución 384x384; el resto a 224x224, con redimensionado del lado corto (256 o 384 respectivamente) y recorte central.

Los datos de entrenamiento son ImageNet-22k (la release completa de ImageNet de otoño de 2011) para el preentrenamiento y ImageNet-1k (ILSVRC 2012) para el ajuste fino y la evaluación. La model card no detalla el número exacto de tokens ni de épocas, ni si hubo etapas de RLHF o DPO (no aplicables a un clasificador). La innovación técnica relevante del paquete es la verificación de integridad de pesos mediante SHA-256 y la disponibilidad de dos backends de ejecución: `portable` (referencia) y `kernels` (optimizado, con kernels publicados en `fastforks/kernels`).

## Capacidades

- Clasificación de imágenes en las 1.000 clases de ImageNet-1k, con salida de logits por clase.
- Inferencia sobre una única imagen RGB por llamada, con entrada fija de 224x224 o 384x384 según la variante.
- Dos backends de ejecución: `portable` (portabilidad máxima) y `kernels` (rendimiento optimizado).
- Verificación criptográfica de pesos (SHA-256) antes de la carga.
- Ejecución en CUDA con PyTorch y soporte de precisión fp16.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni procesamiento de audio o vídeo.
- No dispone de modo thinking ni de salidas estructuradas más allá de los logits de clasificación.

## Casos de uso

- Moderación de contenido visual: clasificar imágenes subidas por usuarios contra las clases de ImageNet para filtrar categorías sensibles antes de su publicación, usando la variante `convnext_base.fb_in22k_ft_in1k` por su equilibrio entre precisión y coste.
- Etiquetado automático de catálogos de producto: preclasificar fotografías de inventario en categorías genéricas y derivar después a un clasificador específico; la variante `_384` mejora la discriminación en imágenes con objetos pequeños.
- Preprocesado en pipelines de visión: usar ConvNeXt como extractor de características congelado para tareas posteriores (detección, segmentación, búsqueda por similitud), aprovechando su naturaleza de backbone convolucional.
- Control de calidad en líneas de fabricación: clasificación de defectos visuales en imágenes de inspección, desplegando la variante `convnext_tiny.fb_in1k` en GPUs de consumo por su bajo coste computacional.
- Filtrado y curación de datasets: clasificar automáticamente grandes lotes de imágenes para descartar las que no pertenecen a las clases de interés antes del entrenamiento de otros modelos.
- Investigación en visión por computador: reproducir resultados de ConvNeXt con pesos verificados por SHA-256, garantizando que los experimentos parten de checkpoints íntegros y no corruptos.
- Despliegue en entornos con requisitos de trazabilidad: la verificación de hashes permite auditar la cadena de suministro de los pesos en entornos regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente indica que la variante `convnext_base.fb_in1k` a 224x224 fue probada en backend `portable` con fp16 sobre una RTX 5060 Ti de 16 GB, sin aportar métricas de precisión ni de latencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; la model card cita pruebas con `convnext_base.fb_in1k` a 224x224 en fp16 sobre una RTX 5060 Ti de 16 GB.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; la model card solo documenta la RTX 5060 Ti 16 GB.
- Cabe en GPU de consumo: sí, al menos la variante base en fp16 según la prueba documentada; las variantes tiny y small son previsiblemente más ligeras, aunque no se aportan cifras.
- Opciones de despliegue: librería `fastforks` con backends `portable` y `kernels`; pesos compatibles con `timm` y PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ConvNeXt (fastforks) | CNN pura | no disponible por variante | 224x224 o 384x384 | Apache-2.0 | Pesos en repos `timm`, card en fastforks |
| ResNet-50 (referencia clásica) | CNN con skip connections | ~25 M | 224x224 | BSD-3 / Apache-2.0 según versión | Amplia, en `timm` y torchvision |
| ViT-B/16 | Transformer de visión | ~86 M | 224x224 | Apache-2.0 | Amplia, en `timm` y HF |
| EfficientNet-B0 | CNN con compound scaling | ~5,3 M | 224x224 | Apache-2.0 | Amplia, en `timm` y torchvision |

La comparación de rendimiento frente a estas alternativas no está disponible en la información proporcionada; los datos de parámetros de los modelos comparables son valores de referencia de la literatura y no provienen de la model card.

## Limitaciones y advertencias

- El repositorio no aloja pesos: es solo una model card; la disponibilidad depende de los repos de `timm` enlazados.
- El modelo clasifica exclusivamente en las 1.000 clases de ImageNet-1k; no generaliza a categorías fuera de ese vocabulario sin reentrenamiento.
- No procesa texto, audio ni vídeo; cualquier caso de uso fuera de clasificación de imagen única requiere otro modelo.
- Riesgo de sesgo heredado de ImageNet: desequilibrios demográficos y geográficos en el dataset pueden reflejarse en las predicciones.
- Riesgo de alucinación en el sentido de falsos positivos: el modelo siempre asigna una de las 1.000 clases, incluso ante imágenes fuera de distribución.
- La model card advierte de que el paquete es de uso en investigación y recomienda revisar las cadenas de licencia antes de cualquier otro uso, pese a que los pesos figuran como Apache-2.0 con uso comercial permitido.
- No se documentan métricas de precisión, latencia ni throughput, lo que dificulta la planificación de capacidad en producción.
- La información sobre cuantización es inexistente más allá de la mención a fp16.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/convnext
- Repositorio de código fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original (pytorch-image-models, commit `0df212b369a5`): https://github.com/huggingface/pytorch-image-models
- Fichero `card.toml` con hashes completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/classification/models/convnext/card.toml
- Evidencia de licencia: https://huggingface.co/timm/convnext_base.fb_in22k_ft_in1k/blob/67758fcbcf9f007ec7630bf8636b74a8f24e52a0/README.md
- Pesos `convnext_base.fb_in1k`: https://huggingface.co/timm/convnext_base.fb_in1k
- Pesos `convnext_base.fb_in22k_ft_in1k`: https://huggingface.co/timm/convnext_base.fb_in22k_ft_in1k
- Pesos `convnext_base.fb_in22k_ft_in1k_384`: https://huggingface.co/timm/convnext_base.fb_in22k_ft_in1k_384
- Pesos `convnext_large.fb_in1k`: https://huggingface.co/timm/convnext_large.fb_in1k
- Pesos `convnext_large.fb_in22k_ft_in1k`: https://huggingface.co/timm/convnext_large.fb_in22k_ft_in1k
- Pesos `convnext_large.fb_in22k_ft_in1k_384`: https://huggingface.co/timm/convnext_large.fb_in22k_ft_in1k_384
- Pesos `convnext_small.fb_in1k`: https://huggingface.co/timm/convnext_small.fb_in1k
- Pesos `convnext_small.fb_in22k_ft_in1k`: https://huggingface.co/timm/convnext_small.fb_in22k_ft_in1k
- Pesos `convnext_small.fb_in22k_ft_in1k_384`: https://huggingface.co/timm/convnext_small.fb_in22k_ft_in1k_384
- Pesos `convnext_tiny.fb_in1k`: https://huggingface.co/timm/convnext_tiny.fb_in1k
- Pesos `convnext_tiny.fb_in22k_ft_in1k`: https://huggingface.co/timm/convnext_tiny.fb_in22k_ft_in1k
- Pesos `convnext_tiny.fb_in22k_ft_in1k_384`: https://huggingface.co/timm/convnext_tiny.fb_in22k_ft_in1k_384
