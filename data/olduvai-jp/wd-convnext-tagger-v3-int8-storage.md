# olduvai-jp/wd-convnext-tagger-v3-int8-storage

## Resumen

wd-convnext-tagger-v3-int8-storage es una conversión a ONNX con pesos almacenados en INT8 del modelo de etiquetado de imágenes anime WD ConvNeXt Tagger v3, desarrollado originalmente por SmilingWolf. La conversión la firma olduvai-jp y su propósito es empaquetar el tagger en un formato portable que funcione tanto en CPU como en WebGPU mediante ONNX Runtime, manteniendo los pesos comprimidos en INT8 y devolviéndolos a FP32 con nodos DequantizeLinear durante la inferencia. Las activaciones siguen en FP32 y no se ha realizado ningún ajuste fino ni calibración con imágenes adicionales.

El modelo resuelve la tarea de image tagging (clasificación multietiqueta) sobre ilustraciones de estilo anime: recibe una imagen RGB de 448×448 en formato NHWC y BGR y devuelve 10.861 puntuaciones correspondientes a un vocabulario de etiquetas de Danbooru, organizado en cuatro ratings, 8.106 etiquetas generales y 2.751 etiquetas de personaje. No es un modelo generativo ni un transformer de lenguaje: es una CNN ConvNeXt adaptada a clasificación multietiqueta, y por tanto no dispone de ventana de contexto textual ni de capacidades conversacionales.

Su relevancia actual es práctica: el repositorio pesa aproximadamente 0,1 GB, el `model.onnx` ocupa 100.071.165 bytes y el paquete incluye checksums SHA-256, el CSV de etiquetas y un registro de conversión, lo que lo convierte en una opción útil para pipelines de curado de datasets, filtrado de contenido y etiquetado automático en entornos sin GPU dedicada o dentro del navegador. La licencia Apache-2.0 facilita su integración comercial, aunque hereda las limitaciones y sesgos del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt (CNN) para clasificación multietiqueta de imágenes, exportada a ONNX |
| Parametros totales | no disponible (el repo ocupa ~0,1 GB; el `model.onnx` pesa 100.071.165 bytes con pesos INT8) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | pesos INT8 con DequantizeLinear a FP32; activaciones FP32; sin calibración ni imágenes de ajuste |
| Idiomas soportados | no disponible (las etiquetas del CSV están en inglés, pero no es un modelo lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`), más `selected_tags.csv`, `conversion.json`, `SHA256SUMS`, `LICENSE` y `NOTICE` |

## Arquitectura y entrenamiento

La arquitectura subyacente es ConvNeXt, una red convolucional moderna con bloques residuales y normalización por capas, adaptada por SmilingWolf al etiquetado multietiqueta de ilustraciones anime sobre el vocabulario de Danbooru. La entrada es un tensor float32 de forma `[1, 448, 448, 3]` en orden NHWC y canal BGR con valores de 0 a 255; el preprocesado indicado consiste en componer las zonas transparentes sobre fondo blanco, añadir relleno blanco para cuadrar la imagen, redimensionar a 448×448 con bicubic compatible con Pillow y omitir la normalización a 0–1 y la resta de media. La salida son 10.861 puntuaciones en el orden de las filas del CSV, sin sigmoid adicional.

Esta variante concreta no ha sido reentrenada: es una conversión del checkpoint original fijado en la revisión `d39e46de298d27340111b64965e20b8185c407e6` de SmilingWolf/wd-convnext-tagger-v3. Los pesos se guardan en INT8 y se dequantizan a FP32 en tiempo de ejecución, de modo que el ahorro es de almacenamiento y no necesariamente de memoria en ejecución ni de cómputo entero. El SHA-256 del modelo convertido es `0d4cc9db44c61f47d9710f0d5eebffadee99379d7cdb7fa3701550b8bf6f6721`. No se dispone de datos sobre volumen de tokens, composición del dataset de entrenamiento original ni uso de RLHF, DPO u otras etapas de alineación, ya que no son aplicables a este tipo de modelo; esa información debe consultarse en la model card del modelo base.

## Capacidades

- Etiquetado multietiqueta de imágenes anime: devuelve 10.861 puntuaciones independientes, una por etiqueta del vocabulario Danbooru.
- Clasificación de rating: cuatro categorías de calificación devueltas siempre como candidatas.
- Etiquetado de personajes: 2.751 etiquetas de personaje con umbral de selección por defecto de `score > 0.85`.
- Etiquetado general: 8.106 etiquetas de contenido general con umbral de selección por defecto de `score > 0.35`.
- Inferencia en CPU y WebGPU mediante ONNX Runtime, con soporte de ejecución en navegador vía el runtime WASM de terceros (no incluido en el repo).
- Integración con la API `createTagger({ modelUrl, tagsUrl })` de la librería cliente, apuntando a las URLs de `model.onnx` y `selected_tags.csv`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión generalista, audio ni modo thinking: es un clasificador de imagen especializado.

## Casos de uso

- Curado y filtrado de datasets de anime: procesar lotes de imágenes y aplicar los umbrales por defecto (0,35 para general, 0,85 para personaje) para descartar muestras mal etiquetadas o de baja calidad antes de entrenar otros modelos.
- Etiquetado automático en herramientas de gestión de bibliotecas: indexar colecciones locales de ilustraciones con las 10.861 etiquetas para habilitar búsqueda por personaje, rating o atributos de contenido.
- Moderación y clasificación de contenido: usar las cuatro puntuaciones de rating para separar material sensible del resto en pipelines de publicación, con revisión humana en los casos límite.
- Preetiquetado para anotación humana: generar una propuesta inicial de etiquetas que el anotador corrige, reduciendo el coste de anotación manual en proyectos de visión.
- Despliegue en el navegador: servir `model.onnx` y `selected_tags.csv` y ejecutar la inferencia con WebGPU o WASM, útil para aplicaciones web de etiquetado sin backend GPU.
- Inferencia en CPU en entornos sin GPU: al estar exportado a ONNX con pesos INT8, encaja en servidores modestos o contenedores ligeros donde no hay acelerador disponible.
- Filtrado previo en pipelines de generación de imágenes: etiquetar las salidas de un modelo generativo para comprobar atributos, personajes o ratings antes de su distribución.

## Benchmarks y rendimiento

| Evaluacion | FP32 original | INT8 storage (esta variante) |
|---|---|---|
| Micro-F1 general (2.000 imágenes fijas, ONNX Runtime 1.23.0 CPU) | 0,620685 | 0,620437 |
| Micro-F1 personaje (2.000 imágenes fijas, ONNX Runtime 1.23.0 CPU) | 0,805088 | 0,794562 |

La evaluación se realizó sobre 2.000 imágenes fijas con ONNX Runtime 1.23.0 en CPU nativa, con etiquetas observadas sin corrección de alias, por lo que no constituye una tasa de acierto formal. La compatibilidad y calidad en CPU y GPU de navegador se verificaron por separado con 128 imágenes de ajuste. Según el autor, estos valores provienen de registros de evaluación locales y no se volvieron a medir durante el empaquetado de esta versión.

## Requisitos de hardware

- VRAM estimada: no disponible con cifras medidas; el paquete en disco ocupa unos 0,1 GB y el `model.onnx` 100 MB, pero al dequantizar a FP32 las activaciones y pesos en ejecución pueden requerir más memoria que el tamaño del fichero.
- GPU recomendadas: no disponible. El modelo está pensado para CPU y WebGPU, no para CUDA de forma específica.
- Compatibilidad con GPU de consumo: viable en principio en cualquier GPU integrada o dedicada que soporte WebGPU a través del navegador, aunque no se publican cifras de latencia ni de memoria.
- Opciones de despliegue: ONNX Runtime con `CPUExecutionProvider` en Python; runtime WASM/WebGPU en navegador mediante la librería cliente del tagger; no es compatible con `from_pretrained()` de Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| olduvai-jp/wd-convnext-tagger-v3-int8-storage | ConvNeXt ONNX, pesos INT8 | no disponible | no aplica | Apache-2.0 | ONNX | Derivado cuantizado del tagger v3; micro-F1 general 0,620437 y personaje 0,794562 |
| SmilingWolf/wd-convnext-tagger-v3 | ConvNeXt | no disponible | no aplica | Apache-2.0 | safetensors / ONNX | Modelo base original en FP32; micro-F1 general 0,620685 y personaje 0,805088 |
| SmilingWolf/wd-vit-tagger-v3 | ViT | no disponible | no aplica | Apache-2.0 | safetensors / ONNX | Tagger alternativo del mismo autor basado en Vision Transformer; datos de rendimiento no disponibles en esta ficha |
| SmilingWolf/wd-swinv2-tagger-v3 | SwinV2 | no disponible | no aplica | Apache-2.0 | safetensors / ONNX | Tagger alternativo del mismo autor basado en Swin Transformer; datos de rendimiento no disponibles en esta ficha |

## Limitaciones y advertencias

- Sesgos heredados del modelo base: el vocabulario de Danbooru y el dataset original pueden infrarrepresentar estilos, personajes o atributos poco frecuentes, y el modelo no garantiza precisión en imágenes generales ni en personajes desconocidos.
- Riesgo de alucinación de etiquetas: al ser multietiqueta con puntuaciones independientes, puede activar etiquetas plausibles pero incorrectas; los umbrales por defecto (0,35 y 0,85) deben ajustarse según el caso de uso.
- Contenido adulto: las etiquetas incluyen vocabulario explícito y las puntuaciones de rating pueden reflejar contenido sensible; es necesario filtrar la salida en aplicaciones dirigidas a público general.
- La evaluación publicada no es una tasa de acierto formal (etiquetas observadas sin corrección de alias) y no se remidió al empaquetar esta versión.
- El ahorro de INT8 es de almacenamiento: no se garantiza reducción de memoria en ejecución ni aceleración por aritmética entera, ya que la dequantización devuelve a FP32.
- El repositorio no incluye UI de navegador, JavaScript ni runtime WASM; hay que aportarlos externamente.
- El modelo y el `selected_tags.csv` deben usarse siempre juntos y en el orden de filas indicado; mezclar ficheros de otras versiones invalida las puntuaciones.
- Licencia Apache-2.0: permite uso comercial, pero exige conservar `LICENSE` y `NOTICE` con la atribución a SmilingWolf y la declaración de cambios de esta derivación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/olduvai-jp/wd-convnext-tagger-v3-int8-storage
- Modelo base: https://huggingface.co/SmilingWolf/wd-convnext-tagger-v3
- Revisión fijada del modelo base: `d39e46de298d27340111b64965e20b8185c407e6`
- Autor del modelo base (SmilingWolf): https://huggingface.co/SmilingWolf
- Repositorio del tagger en GitHub (SmilingWolf/wd-v1-4-moat-tagger-v2): https://github.com/SmilingWolf/wd-v1-4-moat-tagger-v2
- ONNX Runtime: https://onnxruntime.ai/
- Documentación de WebGPU: https://developer.mozilla.org/es/docs/Web/API/WebGPU_API
- Vocabulario de etiquetas de Danbooru: https://danbooru.donmai.us/wiki_pages/tag_groups
