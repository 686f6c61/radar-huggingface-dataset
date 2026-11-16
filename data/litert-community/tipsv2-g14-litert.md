# litert-community/TIPSv2-G14-LiteRT

## Resumen
TIPSv2-G14-LiteRT es la conversión a formato LiteRT/TFLite del codificador de imágenes TIPSv2-g/14 desarrollado por Google. Se trata de un vision transformer de tipo ViT-g/14 que produce representaciones visuales densas: dos embeddings globales (uno entrenado con subtítulos web y otro con subtítulos sintéticos) y features espaciales por parche. El modelo original se publica bajo licencia Apache 2.0 y esta variante LiteRT la distribuye la comunidad litert-community para despliegue en dispositivos y entornos con runtime LiteRT.

La relevancia de esta ficha radica en que no se trata de un modelo generativo ni de un LLM, sino de un extractor de features visuales pensado para tareas de visión (zero-shot, retrieval, segmentación, clasificación con cabezas externas). La conversión incluye versiones FP32 y cuantizadas A16W8 (pesos INT8 simétricos por canal de salida, activaciones INT16 en las interfaces), además de variantes específicas para compilación en NPU Qualcomm. El tamaño del repositorio es de 13,7 GB y los ficheros TFLite individuales van desde aproximadamente 1,1 GB (A16W8) hasta 4,3 GB (FP32).

La resolución nativa del encoder es 448×448, con una variante a 224×224 que reduce cómputo y memoria. No incluye el codificador de texto ni las cabezas de tarea, por lo que aplicaciones de texto-imagen zero-shot requieren emparejarlo con el text encoder correspondiente del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer (ViT-g/14), encoder de imágenes independiente |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, entrada fija 224×224 o 448×448) |
| Tipos de cuantizacion | FP32 y A16W8 (TorchAO PTQ estático, pesos INT8 simétricos por canal, activaciones INT16); variantes NPU Qualcomm con activaciones UINT16 |
| Idiomas soportados | no disponible (modelo de visión; no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (LiteRT) |

## Arquitectura y entrenamiento
El modelo es un vision transformer de escala g/14 (parches de 14×14) que actúa como codificador de imágenes autónomo. La salida incluye tres tensores: `cls_token` de forma `[1,1536]` (token global entrenado con subtítulos web), `secondary_cls_token` de forma `[1,1536]` (token global entrenado con subtítulos sintéticos) y `patch_features` con forma `[1,256,1536]` a resolución 224 o `[1,1024,1536]` a resolución 448. Las salidas son post-LayerNorm y no están normalizadas L2; la normalización específica de tarea debe aplicarse fuera del modelo.

El entrenamiento original corresponde a Google TIPSv2 (paper arXiv:2604.12012), con dos objetivos de representación global derivados de distintos tipos de subtítulos. La conversión LiteRT aplica cuantización post-entrenamiento estática con TorchAO sobre 500 imágenes de calibración por resolución. LayerScale se pliega en pesos y sesgos FP32 antes de la calibración; los pesos de las capas fully-connected son INT8 simétricos por canal de salida, con sesgos INT64 y rangos de activación ajustados para acumulación INT32. Los grafos omiten sumas redundantes de máscara de atención y transposiciones de valor específicas de Qualcomm.

Las variantes `model_qualcomm.tflite` son entradas dedicadas para compilación en NPU Qualcomm, con activaciones UINT16, sin contexto de vendor embebido y sin fallback a CPU. Sus salidas Softmax usan zero point 0 y escala 1/32768. La validación de runtime y las mediciones de rendimiento de estos grafos actualizados están pendientes según la model card; `validation.json` distingue comprobaciones estructurales de evidencia histórica de los ficheros fuente.

## Capacidades
- Extracción de features visuales globales: dos embeddings de 1536 dimensiones por imagen (`cls_token` y `secondary_cls_token`).
- Extracción de features espaciales por parche: 256 tokens (224×224) o 1024 tokens (448×448), cada uno de 1536 dimensiones.
- Base para clasificación, retrieval y otras tareas visuales mediante cabezas externas.
- Base para aplicaciones texto-imagen zero-shot si se empareja con el text encoder correspondiente del modelo original.
- Inferencia en CPU (FP32 y A16W8) y compilación en NPU Qualcomm mediante variantes dedicadas.
- No incluye generación de texto, tool calling, agentes, capacidades multilingües ni audio.
- No incluye cabezas de tarea ni text encoder en el paquete.

## Casos de uso
- Búsqueda visual y retrieval de imágenes: usar `cls_token` como embedding global para indexar un catálogo y recuperar imágenes similares mediante similitud coseno tras normalización L2 externa; adecuado por la dimensionalidad 1536 y la doble representación global.
- Deduplicación y clustering de imágenes: emplear `secondary_cls_token` o el promedio de ambos tokens para agrupar imágenes cercanas en pipelines de moderación o curación de datasets.
- Segmentación y detección con cabezas externas: usar `patch_features` como backbone congelado y entrenar una cabeza ligera de segmentación semántica o detección densa sobre los 1024 tokens a 448×448.
- Clasificación de imágenes en dispositivo: desplegar la variante A16W8 (aproximadamente 1,1 GB) en CPU o NPU Qualcomm para inferencia local en móviles, cámaras o dispositivos embebidos, reduciendo el peso frente a FP32.
- Anotación automática de datasets: generar embeddings por imagen para pre-etiquetar, filtrar outliers o construir índices de similitud en herramientas de anotación.
- Recuperación multimodal texto-imagen: combinar el encoder con el text encoder original de TIPSv2 para búsqueda zero-shot por descripción textual, usando el token global como representación de imagen.
- Análisis de imágenes satelitales o médicas: extraer parches espaciales a 448×448 para pipelines de detección de cambios o clasificación por regiones, con features densas por parche.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card indica que las mediciones de rendimiento de los grafos actualizados están pendientes y que `validation.json` distingue comprobaciones estructurales de evidencia histórica.

## Requisitos de hardware
- VRAM/RAM estimada: FP32 requiere aproximadamente 4,3 GB por fichero de pesos; A16W8 aproximadamente 1,1 GB por fichero. El consumo en ejecución depende del runtime LiteRT y del backend (CPU o NPU).
- GPU recomendadas: no se especifican en la información disponible; el paquete está orientado a LiteRT con ejecución CPU y NPU Qualcomm, no a GPUs de datacenter tipo A100/H100.
- GPU consumer: no se documenta soporte GPU para estos ficheros TFLite; la model card menciona CPU y NPU Qualcomm.
- Opciones de despliegue: LiteRT (`ai-edge-litert==2.3.0`), runtime Qualcomm compatible para las variantes `model_qualcomm.tflite`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card advierte que la ejecución A16W8 en CPU puede ser lenta.
- Nota de carga: los modelos deben cargarse por nombre de fichero para permitir buffers de pesos externos, especialmente con los ficheros FP32 grandes.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TIPSv2-G14-LiteRT (esta ficha) | ViT-g/14, encoder de imágenes, TFLite | no disponible | 224×224 o 448×448 fijas | Apache 2.0 | Hugging Face (litert-community) |
| google/tipsv2-g14 (modelo base) | ViT-g/14, encoder de imágenes | no disponible | 448 nativo (224 opcional) | Apache 2.0 | Hugging Face (google) |
| Otros encoders ViT de escala g | ViT-g | no disponible | variable | variable | no disponible |

No se dispone de datos de benchmarks ni de parámetros exactos para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias
- No es un modelo generativo ni un LLM: no produce texto, no soporta tool calling, agentes ni razonamiento multi-paso.
- No incluye text encoder ni cabezas de tarea; las aplicaciones texto-imagen zero-shot requieren el text encoder original emparejado.
- Las salidas son post-LayerNorm y no están normalizadas L2; hay que aplicar normalización específica de tarea fuera del modelo.
- Resolución de entrada fija (224 o 448); no admite entradas de tamaño arbitrario sin recompilación o adaptación.
- Preprocesado específico: convertir a RGB, redimensionar directamente al cuadrado con interpolación bilineal de PIL y dividir por 255; no recortar ni aplicar media/std de ImageNet.
- La cuantización A16W8 puede degradar la calidad de los embeddings frente a FP32; la model card no reporta métricas de degradación.
- La ejecución A16W8 en CPU puede ser lenta; las variantes Qualcomm no tienen fallback a CPU y requieren compilador/runtime de vendor compatible.
- Validación de runtime y rendimiento de los grafos actualizados pendientes según la model card.
- Sesgos y riesgo de alucinación: no aplicable en el sentido de generación de texto; los sesgos del encoder original no están documentados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar `LICENSE` y `NOTICE` del repositorio y las condiciones del modelo base original.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; madurez de la conversión no contrastada por la comunidad.

## Enlaces
- Hugging Face (esta conversión): https://huggingface.co/litert-community/TIPSv2-G14-LiteRT
- Modelo base: https://huggingface.co/google/tipsv2-g14
- Repositorio TIPS de Google DeepMind: https://github.com/google-deepmind/tips
- Paper TIPSv2: https://arxiv.org/abs/2604.12012
- Licencia: https://huggingface.co/litert-community/TIPSv2-G14-LiteRT/blob/main/LICENSE
- NOTICE: https://huggingface.co/litert-community/TIPSv2-G14-LiteRT/blob/main/NOTICE
