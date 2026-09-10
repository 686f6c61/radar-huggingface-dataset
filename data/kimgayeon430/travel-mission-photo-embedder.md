# kimgayeon430/travel-mission-photo-embedder

## Resumen

travel-mission-photo-embedder es un modelo de extracción de características de imagen publicado por el usuario kimgayeon430 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una exportación a ONNX con cuantización dinámica int8 del codificador de imagen de `openai/clip-vit-base-patch32` (CLIP ViT-B/32). Su función es producir embeddings de 512 dimensiones a partir de imágenes de 224 × 224 píxeles, pensados para calcular similitud coseno entre una imagen de referencia y una imagen tomada por el usuario.

El modelo nace de una necesidad concreta dentro de una aplicación de misiones de viaje: verificar en dos pasos que el usuario ha fotografiado el objetivo correcto de una misión. El clasificador de misiones basado en `apple/mobilevit-small` solo alcanzaba un ROC AUC de 0,60 al separar "misma categoría pero distinto objetivo"; el codificador de CLIP ViT-B/32 sube esa misma métrica a 0,76. El artefacto distribuido pesa aproximadamente 89 MB en formato int8, lo que lo hace apto para inferencia en dispositivo (on-device) y en CPU.

Es relevante para desarrolladores que necesiten un extractor de embeddings de imagen ligero, sin dependencia de GPU y con licencia MIT, especialmente en escenarios de verificación visual, búsqueda por similitud o agrupación de fotografías. Conviene subrayar que este repositorio contiene únicamente la torre de imagen, no la torre de texto de CLIP.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer ViT-B/32 (codificador de imagen de CLIP), exportado a ONNX |
| Parametros totales | ≈ 86 M en el codificador de imagen (heredado del modelo base CLIP ViT-B/32; no declarado en la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (codificador de imagen; entrada fija de 224 × 224 píxeles) |
| Tipos de cuantizacion | int8 dinámica (ONNX Runtime dynamic quantization); no se distribuyen otros formatos |
| Idiomas soportados | no disponible / no aplica (modelo solo de imagen, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (`photo_embedder_int8.onnx`, ≈ 89 MB) |

Especificaciones de entrada y salida declaradas por el autor:

| Elemento | Valor |
|---|---|
| Entrada | `pixel_values`, `float32`, `[batch, 3, 224, 224]` |
| Salida | `embedding`, `float32`, `[batch, 512]`, sin normalización L2 |
| Dimensión del embedding | 512 |
| Preprocesado | redimensionar lado corto a 224 → center-crop 224 → ×1/255 → (x − mean)/std |
| Media (RGB) | `[0.481, 0.458, 0.408]` |
| Desviación típica (RGB) | `[0.269, 0.261, 0.276]` |
| Canal | RGB conservado (sin inversión de canal) |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es el codificador de imagen de CLIP ViT-B/32: un transformer de visión con parches de 32 × 32, que proyecta la imagen a un vector de 512 dimensiones. El autor no realiza ningún entrenamiento nuevo ni ajuste fino: el proceso consiste en exportar el módulo `get_image_features` del modelo base `openai/clip-vit-base-patch32` a formato ONNX y aplicar una cuantización dinámica int8. La reproducibilidad está documentada mediante el script `export_clip_image_encoder.py --out photo_embedder.onnx --quantize`.

La decisión de usar CLIP en lugar de reutilizar las características del clasificador de misiones se justifica en la propia model card: al ajustar un `apple/mobilevit-small` como clasificador, sus features colapsan hacia la discriminación de clase y pierden capacidad para distinguir objetivos distintos dentro de una misma categoría (AUC 0,60). El autor no documenta la composición del dataset de entrenamiento de CLIP ni procesos de RLHF o DPO, ya que no interviene en el entrenamiento; esos datos corresponden al modelo base y no se detallan en la información disponible. La cuantización int8 apenas degrada la métrica (0,762 frente a 0,76 en precisión original).

## Capacidades

- Extracción de embeddings de imagen: genera vectores de 512 dimensiones a partir de imágenes preprocesadas a 224 × 224.
- Comparación por similitud coseno: permite medir el parecido entre una imagen de referencia y una imagen nueva, base de la verificación de misiones.
- Procesamiento por lotes: la entrada admite un eje de batch (`[batch, 3, 224, 224]`), lo que facilita el cálculo de embeddings en bloque.
- Inferencia en dispositivo: formato ONNX int8 de ≈ 89 MB, ejecutable sin GPU mediante ONNX Runtime.
- Funcionamiento offline: la app descarga `resolve/main/photo_embedder_int8.onnx` y lo cachea en `filesDir`, por lo que no requiere conexión tras la primera descarga.
- Capacidad de clasificación solo en combinación con otras piezas: al ser únicamente la torre de imagen, no realiza zero-shot texto-imagen por sí sola.
- Sin generación de texto, sin tool calling, sin soporte de agentes, sin capacidades multilingües ni de audio.

## Casos de uso

- Verificación de fotos en misiones turísticas: es el caso nativo del modelo. La aplicación compara el embedding de la foto del usuario con el de la imagen representativa de la misión mediante similitud coseno, y combina el resultado con un clasificador de categoría para decidir si el objetivo fotografiado es el correcto.
- Búsqueda visual por similitud: indexar un catálogo de fotografías con embeddings de 512 dimensiones y recuperar las visualmente más parecidas a una consulta, sin necesidad de metadatos ni etiquetas.
- Agrupación y deduplicación de fotografías: agrupar imágenes visualmente próximas (por ejemplo, fotos repetidas de un mismo lugar) aplicando clustering sobre los vectores generados.
- Recomendación de contenido visual: sugerir rutas, locales o experiencias a partir del parecido entre la foto que sube el usuario y el catálogo de imágenes de referencia.
- Control de calidad de aportaciones de usuarios: detectar envíos que no se corresponden con la misión (fotos fuera de contexto) antes de validarlos, reduciendo revisión manual.
- Filtrado por similitud con imágenes de referencia: descartar o marcar imágenes demasiado parecidas a un conjunto de referencia, útil en moderación de contenido.
- Etiquetado asistido en pipelines de datos: precalcular embeddings para alimentar modelos posteriores o búsquedas vectoriales en una base como FAISS o similar.
- Funcionamiento móvil sin conexión: al ser un ONNX int8 de bajo peso, permite toda la lógica de verificación en el propio dispositivo, evitando enviar fotos a un servidor.

## Benchmarks y rendimiento

El autor publica una única métrica interna de dominio: ROC AUC para la tarea de separar "misma categoría, distinto objetivo" (es decir, si el usuario ha fotografiado el objetivo correcto de la misión). No se han publicado resultados en benchmarks académicos estándar (MMLU, HumanEval, GSM8K, ImageNet u otros) en la información disponible.

| Codificador | AUC global | Restaurante | Experiencia | Tour | Compras |
|---|---|---|---|---|---|
| MobileViT pooled (clasificador de misiones) | 0,60 | 0,63 | 0,66 | 0,63 | 0,60 |
| CLIP ViT-B/32 (este modelo) | 0,76 | 0,92 | 0,88 | 0,81 | 0,70 |

El autor indica además que, tras la cuantización int8, el AUC global se mantiene en 0,762, prácticamente idéntico al del modelo sin cuantizar. La categoría con peor comportamiento es la de compras (shopping), con 0,70, mientras que restaurantes alcanza 0,92.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB; el modelo int8 ocupa ≈ 89 MB y la inferencia puede ejecutarse íntegramente en CPU.
- GPU recomendadas: no requiere GPU. Funciona en CPU, GPU integrada y aceleradores móviles. En servidor, cualquier GPU (A100, H100, RTX 4090, etc.) sirve, pero resulta sobredimensionada para esta tarea.
- GPU de consumo: cabe en cualquier GPU de consumo e incluso en dispositivos móviles, dado su tamaño reducido.
- Opciones de despliegue: ONNX Runtime (Python, C++, .NET), ONNX Runtime Mobile, y ejecución en el propio dispositivo Android/iOS. No aplican vLLM ni llama.cpp/GGUF, ya que no es un modelo generativo de lenguaje.
- Latencia y throughput: no disponible (la model card no publica cifras de latencia ni de imágenes por segundo).

## Comparativa con modelos similares

| Modelo | Tipo | Dimensión de embedding | Entrada | Licencia | Formato | Métrica interna (AUC) |
|---|---|---|---|---|---|---|
| travel-mission-photo-embedder | Codificador de imagen CLIP ViT-B/32, int8 | 512 | 224 × 224 | MIT | ONNX int8 | 0,76 (0,762 int8) |
| openai/clip-vit-base-patch32 | CLIP completo (imagen + texto) | 512 | 224 × 224 | MIT | safetensors / PyTorch | no aplica (es el modelo base) |
| apple/mobilevit-small (clasificador ajustado) | Clasificador de imagen | no disponible | no disponible | no disponible | no disponible | 0,60 |
| Otros extractores visuales (SigLIP, MobileCLIP, DINOv2) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con el propio modelo base `openai/clip-vit-base-patch32`: este repositorio ofrece únicamente la torre de imagen, cuantizada a int8, lo que reduce el tamaño del artefacto a cambio de perder la capacidad de procesar texto. No se dispone de datos comparativos publicados frente a otros extractores como SigLIP o MobileCLIP.

## Limitaciones y advertencias

- Solo torre de imagen: no incluye el codificador de texto de CLIP, por lo que no permite zero-shot texto-imagen ni búsqueda por prompt textual sin añadir por separado el modelo de texto.
- Embeddings sin normalizar: la salida `[batch, 512]` no está normalizada L2; es responsabilidad del consumidor normalizarla antes de calcular similitud coseno.
- Pérdida por cuantización: aunque documentada como mínima (0,762 frente a 0,76), existe una degradación de precisión asociada a la cuantización int8.
- Rendimiento desigual por categoría: la AUC cae a 0,70 en la categoría de compras, frente a 0,92 en restaurantes; el modelo no es homogéneamente fiable en todos los dominios.
- Sin ajuste fino de dominio: al ser una exportación del modelo base, no ha sido entrenado específicamente con datos de viajes, por lo que su comportamiento depende de la generalidad de CLIP.
- Sesgos heredados: CLIP es conocido por sesgos en la representación de personas y culturas; estos sesgos se trasladan al embedding extraído.
- Riesgo de falsos positivos y negativos: la decisión de verificación basada en similitud coseno puede fallar con imágenes ambiguas o muy distintas en encuadre e iluminación.
- Falta de validación externa: el repositorio registra 0 descargas y 0 "likes", por lo que no cuenta con validación por parte de la comunidad.
- Metadatos incompletos: no se declaran idiomas ni se detallan los datos de entrenamiento del modelo base en la información disponible.
- Licencia: MIT en este repositorio, lo que permite uso comercial; conviene verificar igualmente las condiciones del modelo base `openai/clip-vit-base-patch32` del que deriva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kimgayeon430/travel-mission-photo-embedder
- Modelo base: https://huggingface.co/openai/clip-vit-base-patch32
- Dataset asociado: https://huggingface.co/datasets/kimgayeon430/travel-mission-photos
- Descarga directa del peso int8: https://huggingface.co/kimgayeon430/travel-mission-photo-embedder/resolve/main/photo_embedder_int8.onnx
- Papers, blogs o demos adicionales: no disponible (la búsqueda web no devolvió resultados relevantes sobre este modelo)
