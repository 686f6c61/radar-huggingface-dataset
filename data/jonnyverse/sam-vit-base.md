# JONNYVERSE/sam-vit-base

## Resumen

El modelo `JONNYVERSE/sam-vit-base` es una conversión a formato ONNX del modelo original `facebook/sam-vit-base`, el Segment Anything Model (SAM) de Meta en su variante base (ViT-B). Esta conversión está diseñada específicamente para ser compatible con la librería Transformers.js, lo que permite ejecutar el modelo directamente en navegadores web o entornos Node.js sin necesidad de un backend de Python. El modelo resuelve el problema de la segmentación de objetos en imágenes mediante prompts interactivos, como puntos, cajas delimitadoras o máscaras parciales, generando máscaras de alta calidad con capacidad zero-shot. Su relevancia radica en que democratiza el acceso a la segmentación de imágenes en el ecosistema JavaScript, abriendo la puerta a aplicaciones web de edición, anotación y análisis visual sin infraestructura de servidor dedicada.

La arquitectura subyacente es la del SAM original: un encoder de imagen basado en Vision Transformer (ViT-B), un prompt encoder que procesa puntos y cajas, y un mask decoder transformer bidireccional que produce las máscaras finales. El repositorio ocupa 2,3 GB y contiene los pesos en formato ONNX, listos para ser cargados con `SamModel` y `AutoProcessor` de Transformers.js. Aunque el modelo base fue entrenado por Meta sobre el dataset SA-1B con 11 millones de imágenes y 1.100 millones de máscaras, esta conversión específica no añade información adicional sobre el entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-B) con encoder de imagen, prompt encoder y mask decoder (basado en SAM) |
| Parametros totales | no disponible (el modelo base ViT-B tiene aproximadamente 93,7 millones, pero no se especifica en la conversion) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, procesa imagenes) |
| Tipos de cuantizacion | no disponible (solo pesos ONNX, sin cuantizacion declarada) |
| Idiomas soportados | no aplica (procesamiento de imagenes, no texto) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (para Transformers.js) |

## Arquitectura y entrenamiento

El modelo es una conversión directa de `facebook/sam-vit-base` a pesos ONNX, realizada por el usuario JONNYVERSE. La arquitectura original de SAM se compone de tres módulos principales: un encoder de imagen basado en Vision Transformer (variante base, ViT-B) que extrae características de la imagen; un prompt encoder que codifica puntos, cajas o máscaras parciales proporcionadas por el usuario; y un mask decoder transformer bidireccional que combina las características de la imagen con los embeddings de los prompts para generar las máscaras de segmentación y sus scores de IoU. Esta conversión no modifica la arquitectura, solo adapta los pesos al formato ONNX para su uso en entornos JavaScript.

En cuanto al entrenamiento, el modelo base fue entrenado por Meta sobre el dataset SA-1B, que contiene 11 millones de imágenes y 1.100 millones de máscaras, con el objetivo de lograr segmentación zero-shot a partir de prompts arbitrarios. Sin embargo, la información proporcionada para esta conversión no incluye detalles adicionales sobre el proceso de entrenamiento, la composición del dataset ni técnicas como RLHF o DPO, ya que se trata de un modelo de visión y no de lenguaje. La conversión a ONNX se realizó mediante la herramienta Optimum de Hugging Face, según se menciona en la model card.

## Capacidades

- Segmentacion de objetos en imagenes a partir de prompts: puntos, cajas delimitadoras o mascaras parciales.
- Generacion de mascaras de alta calidad con scores de IoU asociados.
- Capacidad zero-shot: puede segmentar objetos no vistos durante el entrenamiento sin ajuste fino.
- Compatible con Transformers.js, lo que permite ejecucion en navegador (via WebGPU/WebGL) y en Node.js.
- Soporte para post-procesamiento de mascaras mediante `AutoProcessor.post_process_masks`.
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de texto.

## Casos de uso

- Edicion de imagenes en aplicaciones web: el usuario hace clic en un objeto y el modelo genera la mascara para recortarlo, borrarlo o reemplazarlo, todo en el navegador sin enviar datos a un servidor.
- Anotacion asistida de datasets: herramientas de etiquetado que permiten al anotador hacer clic en los objetos de interes y obtener mascaras precisas, acelerando la creacion de datos de entrenamiento.
- Segmentacion en tiempo real para realidad aumentada: con la ejecucion en GPU via WebGPU, se puede segmentar objetos en video o camara en vivo para efectos visuales o filtros.
- Extraccion de siluetas para diseno grafico: designers pueden aislar productos o personas de una imagen para usarlos en composiciones, sin depender de herramientas de recorte manual.
- Preprocesamiento para modelos de inpainting o generacion: las mascaras generadas pueden alimentar modelos de relleno de imagenes (inpainting) o de edicion basada en regiones.
- Analisis de imagenes medicas en entornos clinicos ligeros: aunque requiere validacion, el modelo puede segmentar estructuras anatomicas en radiografias o ecografias en una interfaz web ligera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base SAM ha demostrado un rendimiento solido en tareas de segmentacion zero-shot, pero no se proporcionan metricas concretas (mIoU, Dice, etc.) para esta conversion especifica. Se recomienda consultar la documentacion del modelo original para obtener datos de evaluacion.

## Requisitos de hardware

- Tamano del repositorio: 2,3 GB, lo que implica que el modelo completo debe cargarse en memoria (RAM o VRAM). Para navegador, se recomienda al menos 4 GB de RAM disponible.
- Inferencia en CPU: posible con Transformers.js, pero la latencia sera alta (varios segundos por imagen) debido al encoder ViT-B.
- GPU recomendada: cualquier GPU compatible con WebGPU (por ejemplo, NVIDIA RTX serie 20 o superior, AMD RX 6000 o superior, o integradas modernas) para una ejecucion fluida en navegador.
- En Node.js, se puede usar ONNX Runtime con backend CUDA para acelerar en GPUs NVIDIA (A100, V100, RTX 4090, etc.).
- Opciones de despliegue: Transformers.js en navegador o Node.js, tambien compatible con ONNX Runtime Web y ONNX Runtime Node.
- No se especifican metricas de latencia o throughput en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| JONNYVERSE/sam-vit-base (ONNX) | no disponible (aprox. 93,7M) | no aplica | Apache 2.0 | ONNX | Hugging Face |
| facebook/sam-vit-base (original) | ~93,7M | no aplica | Apache 2.0 | PyTorch (safetensors) | Hugging Face |
| facebook/sam-vit-large | ~307M | no aplica | Apache 2.0 | PyTorch | Hugging Face |
| MobileSAM | ~9,7M | no aplica | Apache 2.0 | PyTorch / ONNX | Hugging Face |

La principal diferencia entre esta conversion y el modelo original es el formato: ONNX permite ejecucion en JavaScript, mientras que el original requiere Python. MobileSAM es una alternativa mas ligera (menos parametros) pero con menor precision. SAM ViT-Large ofrece mayor calidad a costa de mas recursos. No se dispone de comparativas de rendimiento en la informacion proporcionada.

## Limitaciones y advertencias

- No se han documentado sesgos especificos para esta conversion, pero el modelo base SAM puede tener sesgos en la segmentacion de ciertos tipos de objetos o escenas poco representados en SA-1B.
- Riesgo de alucinacion: no aplica directamente, pero el modelo puede generar mascaras incorrectas o incompletas en imagenes ambiguas o con oclusiones complejas.
- Limitaciones de contexto: es un modelo de vision puro, no procesa texto ni tiene memoria conversacional.
- La conversion a ONNX puede introducir ligeras diferencias numericas respecto al modelo original en PyTorch, aunque en la practica suelen ser despreciables.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base original para evitar conflictos.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido ampliamente validado por la comunidad; se recomienda probar en entornos controlados antes de usarlo en produccion.

## Enlaces

- Repositorio del modelo: https://huggingface.co/JONNYVERSE/sam-vit-base
- Modelo base original: https://huggingface.co/facebook/sam-vit-base
- Demo oficial de segmentacion en web: https://huggingface.co/spaces/Xenova/segment-anything-web
- Documentacion de Transformers.js: https://huggingface.co/docs/transformers.js
- Herramienta de conversion Optimum: https://huggingface.co/docs/optimum/index
