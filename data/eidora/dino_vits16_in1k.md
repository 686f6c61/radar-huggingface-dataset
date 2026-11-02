# EIDORA/DINO_ViTS16_IN1k

## Resumen

DINO ViT-S/16 Image Medium es un paquete de inferencia publicado por EIDORA que adapta el checkpoint auto-supervisado `facebook/dino-vits16` de Meta AI para la extracción de embeddings de imagen dentro del ecosistema EIDORA. El modelo subyacente es un Vision Transformer de arquitectura "small" con parches de 16x16 (ViT-S/16), entrenado con el método DINO sobre ImageNet-1K sin utilizar las etiquetas de clase como supervisión. La contribución de EIDORA consiste en la conversión a ONNX, la normalización L2 de las representaciones y la definición de un contrato de preprocesado reproducible mediante `config.yaml` (schema v3).

El resultado es un extractor de características visuales que devuelve vectores float32 de 384 dimensiones, normalizados y comparables mediante similitud coseno. No es un modelo generativo ni un clasificador: su función es producir representaciones densas de imágenes para tareas de búsqueda visual, agrupamiento, deduplicación y análisis exploratorio de colecciones. Al estar empaquetado en ONNX Runtime con `CPUExecutionProvider` declarado, está pensado para ejecutarse en CPU sin dependencias de GPU, lo que simplifica su integración en pipelines de investigación y servicios ligeros.

Su relevancia actual radica en dos factores: por un lado, DINO sigue siendo una referencia consolidada en representaciones visuales auto-supervisadas, con propiedades emergentes documentadas en el paper original (ICCV 2021); por otro, el formato ONNX con esquema versionado y configuración explícita reduce la ambigüedad típica de los pipelines de preprocesado, un punto crítico cuando se comparan embeddings entre modelos distintos. El repositorio ocupa 0,1 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer Small con patch size 16 (ViT-S/16), auto-supervisado DINO |
| Parametros totales | no disponible (arquitectura ViT-S, del orden de 21-22 M, no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica: modelo de vision con entrada fija de 224x224 px) |
| Tipos de cuantizacion | no disponible (se distribuye un unico artefacto `model.onnx`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`) + `config.yaml` (schema v3) |

## Arquitectura y entrenamiento

El modelo subyacente es un Vision Transformer de tamano "small" que divide la imagen de entrada en parches de 16x16 pixeles y los procesa mediante bloques de auto-atencion. El entrenamiento es auto-supervisado con el metodo DINO (self-distillation with no labels), en el que una red estudiante aprende a igualar la distribucion de salida de una red profesora actualizada como media movil del estudiante. Este esquema prescinde por completo de las etiquetas de clase de ImageNet-1K, que se emplea unicamente como corpus de imagenes.

El checkpoint original procede de Meta AI y se distribuye a traves de Hugging Face en `facebook/dino-vits16`, con la revision fijada `abe3b354cb6a9b6f146096b14a4a9d7eecbcb4bd`. EIDORA no reentrena el modelo: realiza la conversion a ONNX y define el contrato de preprocesado. Ese contrato especifica conversion a RGB, redimensionado directo (stretch) a 224x224 con interpolacion bilineal, reescalado de intensidades por 0,00392156862745098 (equivalente a dividir por 255), normalizacion por canal con media `[0.485, 0.456, 0.406]` y desviacion estandar `[0.229, 0.224, 0.225]`, y disposicion del tensor en formato NCHW. La salida se normaliza L2 y se entrega como float32 con forma `[batch, 384]`. La normalizacion por canal forma parte del contrato del paquete y no debe aplicarse una segunda vez en la aplicacion llamante.

## Capacidades

- Extraccion de embeddings de imagen: genera representaciones densas de 384 dimensiones, L2-normalizadas, aptas para similitud coseno.
- Busqueda y recuperacion visual: permite ordenar o filtrar imagenes por parecido visual dentro de una coleccion.
- Agrupamiento y analisis exploratorio: los vectores sirven como entrada para clustering (k-means, HDBSCAN) y visualizacion (t-SNE, UMAP).
- Deteccion de duplicados y near-duplicates visuales: util para limpieza de datasets y control de calidad de colecciones.
- Comparacion entre familias de modelos: el paquete esta pensado explicitamente para contrastar embeddings DINO con los de CNN o CLIP.
- Ejecucion en CPU: el paquete declara `CPUExecutionProvider` y se apoya en ONNX Runtime, sin requisito de GPU.
- Procesamiento por lotes: la forma de salida `[batch, 384]` admite inferencia en lotes.
- No soporta texto: carece de torre de texto y de espacio compartido imagen-texto, por lo que no puede usarse para retrieval multimodal texto-a-imagen.
- No soporta tool calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de modo "thinking", vision generativa, audio ni ninguna capacidad generativa.

## Casos de uso

- Busqueda visual en archivos y colecciones digitales: indexar un fondo de imagenes con los embeddings de 384 dimensiones y resolver consultas por similitud coseno contra una imagen de referencia, sin depender de metadatos ni de etiquetas manuales.
- Deduplicacion de datasets de entrenamiento: calcular embeddings de todo el corpus y agrupar por umbral de similitud para detectar imagenes repetidas o casi identicas antes de entrenar otros modelos, reduciendo fuga de datos entre splits.
- Clustering exploratorio de colecciones historicas o culturales: proyectar los vectores y agrupar para descubrir patrones visuales recurrentes; la model card advierte que la similitud visual no equivale a similitud historica o cultural, por lo que el resultado debe interpretarse con criterio de dominio.
- Moderacion y triaje de contenido por similitud: comparar imagenes entrantes contra un conjunto de referencia de casos conocidos y derivar a revision humana las que superen un umbral, como primera etapa de un pipeline de moderacion.
- Seleccion de datos para anotacion activa: ordenar un corpus por diversidad visual a partir de los embeddings y anotar primero las imagenes mas representativas o mas atipicas, optimizando el esfuerzo de etiquetado.
- Benchmarking de representaciones visuales: usar el paquete como linea base auto-supervisada frente a embeddings CLIP o CNN en un dataset propio, aprovechando que el preprocesado esta fijado y versionado en `config.yaml`.
- Servicio ligero de embeddings en CPU: desplegar el `model.onnx` con ONNX Runtime en un contenedor sin GPU para un endpoint interno de vectorizacion de imagenes, con latencia predecible y sin gestion de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (ni lineales sobre ImageNet-1K, ni resultados de retrieval, ni comparaciones numericas con otros extractores), y el paper original de DINO reporta resultados del checkpoint de Meta AI, no de esta conversion ONNX concreta. No se dispone tampoco de datos de latencia o throughput medidos para el artefacto empaquetado.

## Requisitos de hardware

- VRAM: no aplica en el despliegue declarado; el paquete declara `CPUExecutionProvider` y esta disenado para ejecucion en CPU.
- Memoria RAM estimada: no disponible de forma oficial; el repositorio completo ocupa 0,1 GB, por lo que el peso en memoria del grafo ONNX y sus activaciones es reducido, pero no se publica una cifra concreta.
- GPU recomendadas: no disponibles; al ser un ViT-S con entrada 224x224, cualquier GPU consumer moderna podria ejecutarlo, pero la model card no documenta ni valida proveedores de ejecucion GPU.
- GPU consumer: no se documenta compatibilidad ni rendimiento en RTX 4090, RTX 3090 u otras; el proveedor declarado es CPU.
- Opciones de despliegue: ONNX Runtime (proveedor declarado: CPU). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de vision de este tipo.
- Latencia y throughput: no disponibles; no se publican mediciones.
- Preprocesado obligatorio: 224x224 px, RGB, interpolacion bilineal, tensor NCHW, normalizacion por canal segun el contrato del paquete.

## Comparativa con modelos similares

| Modelo | Arquitectura | Dimension del embedding | Entrada | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|---|
| EIDORA/DINO_ViTS16_IN1k | ViT-S/16, DINO auto-supervisado | 384 | 224x224 px | Imagen | Apache 2.0 | ONNX |
| facebook/dino-vits16 | ViT-S/16, DINO auto-supervisado | 384 | 224x224 px | Imagen | Apache 2.0 | PyTorch (safetensors/bin) |
| CLIP ViT-B/32 | ViT-B/32 + torre de texto | 512 | 224x224 px | Imagen y texto | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| CNN auto-supervisado (familia SimCLR/MoCo) | ResNet-50 | 2048 (tipico) | 224x224 px | Imagen | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |

La comparacion relevante es con el checkpoint original `facebook/dino-vits16`: misma arquitectura, mismas dimensiones de embedding y misma licencia, con la diferencia de que EIDORA entrega un artefacto ONNX con contrato de preprocesado versionado y salida L2-normalizada. Frente a CLIP, la diferencia estructural es la ausencia de torre de texto y de espacio compartido imagen-texto, lo que descarta el retrieval multimodal. No se dispone de datos numericos de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Sesgos de dominio: el modelo se preentreno en ImageNet-1K, no en colecciones historicas, culturales o de dominio especifico; su comportamiento en esos corpus puede degradarse.
- Similitud visual no equivale a similitud semantica, historica o cultural; la model card lo advierte de forma explicita y recomienda evaluar los resultados contra el dataset y la pregunta de investigacion concretos.
- Sin modalidad de texto: no acepta texto como segunda entrada ni produce embeddings de texto, por lo que no sirve para busqueda texto-a-imagen.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos en tareas de deduplicacion o moderacion basadas en umbrales de similitud coseno.
- Sensibilidad al preprocesado: otras configuraciones expuestas por EIDORA no garantizan preservar las mismas representaciones que los valores por defecto documentados; cambiar el metodo de redimensionado, la interpolacion o la normalizacion altera los vectores.
- Doble normalizacion: aplicar de nuevo la normalizacion por canal en la aplicacion llamante rompe el contrato del paquete y produce embeddings incorrectos.
- Licencia: Apache 2.0 permite uso comercial, pero exige conservar el aviso de licencia y la atribucion a Meta AI y a los autores del paper; EIDORA no reclama autoria del modelo original.
- Versionado: el paquete esta en version 0.1.0 y schema v3; conviene fijar la revision concreta en produccion, ya que una actualizacion del paquete podria cambiar el contrato de preprocesado o los artefactos.
- Adopcion limitada: 84 descargas y 0 likes en el momento de la consulta, sin senales de validacion comunitaria extensa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EIDORA/DINO_ViTS16_IN1k
- Checkpoint base: https://huggingface.co/facebook/dino-vits16
- Paper DINO (Caron et al., ICCV 2021): https://arxiv.org/abs/2104.14294
