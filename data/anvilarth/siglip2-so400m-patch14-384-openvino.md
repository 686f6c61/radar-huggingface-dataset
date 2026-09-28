# anvilarth/siglip2-so400m-patch14-384-openvino

## Resumen

Este repositorio contiene una exportación a OpenVINO IR del *vision tower* de `google/siglip2-so400m-patch14-384`, publicada por el usuario `anvilarth`. No es un modelo nuevo ni un ajuste fino: es una conversión de infraestructura que envuelve el `vision_model` de SigLIP 2 con búferes de normalización en `uint8`, de modo que la entrada del grafo es directamente una imagen RGB en NCHW `[N, 3, 384, 384]` y la salida es el `pooler_output` de 1152 dimensiones (embedding de imagen con *attention pooling*, sin normalización L2). La conversión se realizó con `openvino.convert_model` sobre OpenVINO 2026.4.0 y transformers 5.17.0, con `compress_to_fp16=False`, y se guardó junto a `model.json` (hashes) y `validation.npz` (sonda determinista y referencia en fp32).

Su relevancia es práctica: permite ejecutar el codificador visual de SigLIP 2 en hardware Intel (CPU con AVX-512 BF16, GPU Arc, NPU) sin depender de PyTorch, con una paridad medida frente a la referencia fp32 de coseno 1,00000 en f32 y de 0,99941 (mínimo) / 0,99980 (media) en bf16 sobre 16 fotogramas reales de vídeo 720p recortados a cuadrado central de 384 px. El repositorio ocupa 1,7 GB y se distribuye bajo licencia Apache 2.0.

El modelo base es la variante `so400m` de SigLIP 2, la familia de codificadores visión-lenguaje de Google que amplía el objetivo de preentrenamiento de SigLIP con *decoder loss* y predicción global-local y enmascarada. Conviene subrayar que esta exportación contiene únicamente la torre visual: no incluye el codificador de texto, por lo que no permite por sí sola clasificación zero-shot ni recuperación imagen-texto sin añadir la torre de texto original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer (ViT) de SigLIP 2, parche 14, resolución 384; exportado como grafo OpenVINO IR con normalización `(x/255 - 0.5) / 0.5` integrada |
| Parametros totales | no disponible en la model card; el modelo base corresponde a la variante so400m y fuentes de terceros citan aproximadamente 1.100 millones de parametros para el modelo completo |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de imagen fija de 384x384 píxeles |
| Tipos de cuantizacion | pesos almacenados en FP32; ejecución en BF16 mediante `INFERENCE_PRECISION_HINT: bf16` en CPUs con AVX-512 BF16. No se documentan INT8 ni INT4 |
| Idiomas soportados | no aplica al vision tower; depende del codificador de texto del modelo base (no disponible en la informacion proporcionada) |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (`model.xml` + `model.bin`), FP32; incluye `model.json` con hashes y `validation.npz` con sonda y referencia |
| Dimension de salida | 1152 (`pooler_output`, attention pooling, sin normalizacion L2) |
| Entrada | `uint8` RGB, NCHW, `[N, 3, 384, 384]` |
| Tamano del repositorio | 1,7 GB |
| Libreria | openvino |
| Pipeline declarado | image-feature-extraction |
| Revision del modelo base | `e8e487298228002f3d8a82e0cd5c8ea9c567f57f` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de visión de SigLIP 2 con parches de 14x14 píxeles a 384x384 de resolución. Según la información disponible, SigLIP 2 unifica el objetivo de preentrenamiento de SigLIP con técnicas desarrolladas previamente de forma independiente (decoder loss, predicción global-local y predicción enmascarada) en una única receta, con mejoras declaradas en comprensión semántica, localización y características densas. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO para esta variante concreta.

La innovación de esta publicación no está en el entrenamiento, sino en el empaquetado de inferencia. El grafo exportado incorpora los búferes de normalización en `uint8`, de modo que el llamante entrega píxeles crudos sin preprocesado aritmético. Dos detalles operativos son relevantes: el *resize* y el *crop* **no** forman parte del grafo (el procesador de imagen de referencia aplasta la imagen completa a 384x384), y la salida no está normalizada L2, por lo que si se necesita similitud coseno hay que normalizar explícitamente. La paridad medida frente a PyTorch fp32 es de coseno ≥ 0,99999 en f32 y de 0,99941 mínimo en bf16 sobre 16 fotogramas 720p con recorte cuadrado central.

## Capacidades

- Extracción de características de imagen: produce un embedding global de 1152 dimensiones por imagen a partir de entradas `uint8` RGB de 384x384.
- Procesamiento por lotes: la dimensión de lote es dinámica (`N`), lo que permite inferencia batched de imágenes o fotogramas.
- Preprocesado integrado: normalización `(x/255 - 0.5) / 0.5` incluida en el grafo, con entrada `uint8` sin conversión previa a coma flotante.
- Ejecución acelerada en hardware Intel: soporte de BF16 en CPUs con AVX-512 BF16 y despliegue vía OpenVINO Runtime (CPU, GPU, NPU).
- Base para clasificación zero-shot y recuperación imagen-texto: únicamente si se combina con el codificador de texto del modelo base `google/siglip2-so400m-patch14-384`, que no se incluye en este repositorio.
- Base para modelos visión-lenguaje: utilizable como *vision backbone* de arquitecturas VLM de mayor tamaño, según la descripción del modelo original.
- No soporta: generación de texto, tool calling, function calling, razonamiento multi-paso, agentes, audio ni texto (la torre de texto no está incluida).
- Capacidades multilingües: no aplica a esta exportación; el comportamiento lingüístico reside en la torre de texto ausente.

## Casos de uso

- Búsqueda semántica de imágenes: indexar un catálogo calculando embeddings de 1152 dimensiones con esta exportación y recuperar por similitud coseno (normalizando la salida previamente) contra embeddings de texto generados por la torre de texto del modelo base.
- Deduplicación y curación de datasets visuales: detectar imágenes casi idénticas o duplicados por recorte comparando embeddings normalizados, con la ventaja de ejecutar todo el pipeline en CPU Intel sin GPU dedicada.
- Etiquetado y clasificación con cabezas ligeras: entrenar un clasificador lineal o kNN sobre los embeddings congelados para tareas concretas (tipo de producto, presencia de objetos, control de calidad industrial), evitando el coste de ajustar el *backbone*.
- Moderación de contenido visual: alimentar un clasificador auxiliar sobre el embedding congelado para filtrar imágenes no deseadas en plataformas de contenido generado por usuarios, aprovechando el throughput de OpenVINO en CPU.
- Procesamiento de vídeo por fotogramas: la tabla de paridad se midió sobre 16 fotogramas reales de 720p, lo que valida el uso en pipelines de muestreo de fotogramas para clustering, resumen o búsqueda dentro de vídeo.
- Backbone de un sistema VLM: usar el embedding visual como entrada de un modelo de lenguaje en un pipeline multimodal propio, sustituyendo la torre visual de PyTorch por esta versión OpenVINO para reducir dependencias.
- Recomendación visual en comercio electrónico: calcular embeddings de imágenes de producto y usarlos en un sistema de "productos similares" con índice vectorial, ejecutando la extracción en servidores sin GPU.
- Organización automática de bibliotecas fotográficas: agrupar imágenes por similitud visual (clustering sobre embeddings) en aplicaciones de escritorio con CPU Intel, incluidas las que incorporan NPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni métricas de clasificación zero-shot para esta exportación ni para el modelo base en los datos proporcionados).

Sí se documenta una tabla de paridad frente a la referencia PyTorch fp32, medida sobre 16 fotogramas reales de 720p recortados a cuadrado central de 384 px:

| Precisión OpenVINO | Coseno mínimo | Coseno medio |
|---|---|---|
| f32 | 1,00000 | 1,00000 |
| bf16 | 0,99941 | 0,99980 |

Adicionalmente, la model card advierte de una discrepancia de preprocesado: el procesador de imagen de referencia aplasta la imagen completa a 384x384, mientras que un recorte cuadrado central sobre fotogramas 16:9 produce embeddings distintos, con un coseno medio de 0,92. No se publican cifras de latencia ni de throughput.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 1,7 GB con pesos en FP32. Ejecutando con `INFERENCE_PRECISION_HINT: bf16` la huella de pesos se reduce aproximadamente a la mitad (estimación derivada del tamaño del repositorio, no confirmada por el autor).
- Cabe en CPU sin GPU: es el escenario principal de la exportación; se recomienda una CPU con AVX-512 BF16 para activar la ruta rápida.
- Aceleradores Intel: OpenVINO permite compilar el grafo para GPU (Intel Arc integrada o dedicada) y NPU, según el dispositivo disponible en el equipo.
- GPUs NVIDIA (A100, H100, RTX 4090) y AMD: no son el objetivo de esta exportación; no hay datos de despliegue en esos backends.
- Opciones de despliegue: OpenVINO Runtime (compilación directa del `.xml`), OpenVINO Model Server y cualquier *runtime* compatible con IR. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (son *runtimes* de modelos generativos y este es un codificador visual).
- Latencia y throughput: no disponibles; la model card no publica mediciones de tiempo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `anvilarth/siglip2-so400m-patch14-384-openvino` | no disponible (variante so400m) | imagen fija 384x384 | OpenVINO IR fp32 | Apache 2.0 | Exportación comunitaria de la torre visual; paridad coseno 1,00000 en f32 |
| `google/siglip2-so400m-patch14-384` | ~1.100 millones citados por fuentes de terceros para el modelo completo | imagen y texto; resolución 384 | safetensors (PyTorch/transformers) | Apache 2.0 | Modelo completo con torre de texto; habilita clasificación zero-shot y recuperación imagen-texto |
| `google/siglip-so400m-patch14-384` | no disponible | imagen y texto; resolución 384 | safetensors (PyTorch/transformers) | Apache 2.0 | Generación anterior (SigLIP 1), sin las innovaciones de SigLIP 2 |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Solo contiene la torre visual: sin el codificador de texto del modelo base no es posible hacer clasificación zero-shot ni recuperación imagen-texto.
- La salida `pooler_output` no está normalizada L2; hay que normalizarla para usar similitud coseno de forma correcta.
- El grafo no incluye *resize* ni *crop*: el llamante debe replicar exactamente el preprocesado del procesador de referencia (aplastado a 384x384). Usar recorte cuadrado central sobre imágenes no cuadradas degrada la similitud (coseno medio 0,92 en 16:9).
- BF16 introduce una degradación pequeña pero medible (coseno mínimo 0,99941) frente a FP32; en aplicaciones sensibles a la precisión conviene ejecutar en f32.
- Entrada fija a 384x384 píxeles: no se documenta soporte de resolución nativa flexible en esta exportación, a pesar de que SigLIP 2 admite resolución variable en su formulación original.
- Exportación de terceros: no está publicada por Google ni validada por el equipo del modelo base. La model card no incluye datos de entrenamiento, sesgos ni evaluación de subgrupos.
- Sin benchmarks publicados: no hay evidencia en la información disponible sobre el rendimiento aguas abajo (clasificación, recuperación) de esta conversión concreta.
- Sin datos de uso ni adopción: el repositorio registra 0 descargas y 0 *likes*, por lo que no existe validación por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene verificar las condiciones del modelo base `google/siglip2-so400m-patch14-384`, que también se distribuye bajo Apache 2.0.
- Riesgo de alucinación: no aplica directamente (no genera texto), pero cualquier cabecera o sistema aguas abajo que consuma estos embeddings hereda los sesgos del preentrenamiento visual del modelo base, no evaluados aquí.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anvilarth/siglip2-so400m-patch14-384-openvino
- Modelo base en HuggingFace: https://huggingface.co/google/siglip2-so400m-patch14-384
- Generación anterior (SigLIP 1): https://huggingface.co/google/siglip-so400m-patch14-384
- Ficha y casos de uso en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/siglip2-so400m-patch14-384-google
- Detalles del modelo en The Applied: https://theapplied.co/models/google-siglip2-so400m-patch14-384
- Ficha en MLForge: https://mlforge.in/models/google/siglip2-so400m-patch14-384/
