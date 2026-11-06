# EIDORA/ResNet50_IN1k

## Resumen

ResNet50_IN1k es un paquete de extracción de características de imagen publicado por EIDORA dentro de su catálogo de modelos. No se trata de un modelo nuevo entrenado por EIDORA, sino de una conversión a ONNX del checkpoint ResNet-50 de TorchVision entrenado sobre ImageNet-1K (variante `IMAGENET1K_V2`). El modelo elimina la capa de clasificación final y expone el vector de características de 2048 dimensiones obtenido tras el *global average pooling*, normalizado en L2, para su uso como embedding de imagen comparable mediante similitud coseno.

La relevancia de este paquete es práctica: ofrece un baseline reproducible y ligero (repo de 0,1 GB) para tareas de similitud visual, agrupamiento de imágenes y comparación de embeddings frente a otras arquitecturas (AlexNet, VGG16, DINO o CLIP). Al estar empaquetado en ONNX con un contrato de preprocesado explícito en `config.yaml`, facilita la integración en el runtime de EIDORA Desktop con `CPUExecutionProvider`.

Conviene subrayar que la tarea original del checkpoint es clasificación supervisada en ImageNet-1K; el uso como extractor de embeddings es una adaptación posterior. La licencia de los pesos no queda establecida de forma explícita en la model card, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-50 (CNN residual) con global average pooling |
| Parametros totales | no disponible (arquitectura ResNet-50 estándar, ~25,6 M según la literatura, no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (se distribuye `model.onnx` en float32) |
| Idiomas soportados | no disponible (modelo de imagen, sin componente textual) |
| Licencia | `other` (identificador declarado); la model card indica que no se afirma una licencia específica para los pesos |
| Formato de pesos | ONNX (`model.onnx`), salida float32 `[batch, 2048]` |

## Arquitectura y entrenamiento

La arquitectura es una ResNet-50, red convolucional residual con conexiones de salto, descrita en el paper *Deep Residual Learning for Image Recognition* (He et al., CVPR 2016). El checkpoint de partida es el de TorchVision `resnet50-imagenet1k-v2` (fichero `resnet50-11ad3fa6.pth`), entrenado de forma supervisada para clasificación de imágenes sobre ImageNet-1K. EIDORA no ha reentrenado el modelo: realiza una conversión de los pesos originales y una adaptación de la salida.

La adaptación consiste en descartar la capa de clasificación y tomar el vector de 2048 dimensiones tras el *global average pooling*, aplicando normalización L2. El preprocesado es parte de la definición del embedding y está fijado en la configuración: conversión a RGB, redimensionado del lado corto a 232 píxeles, recorte central de 224×224 con interpolación bilineal, reescalado por 0,00392156862745098 y normalización por canal con media `[0.485, 0.456, 0.406]` y desviación `[0.229, 0.224, 0.225]`, tensor en formato NCHW y `float32`. No se documentan fases de RLHF, DPO ni ajuste adicional; el entrenamiento es puramente supervisado y de clasificación.

## Capacidades

- Extracción de embeddings de imagen de 2048 dimensiones, normalizados en L2 y comparables por similitud coseno.
- Exploración de similitud visual y construcción de agrupamientos (clustering) de imágenes.
- Baseline reproducible para comparar embeddings de CNN residuales frente a AlexNet, VGG16, DINO o CLIP.
- Procesamiento por lotes: la entrada admite forma `[batch, 3, 224, 224]`.
- Ejecución en CPU mediante `CPUExecutionProvider` de ONNX Runtime.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni modo de razonamiento (*thinking*); es un modelo exclusivamente de imagen.
- No incorpora visión generativa ni descripción de imágenes: solo produce vectores de características.

## Casos de uso

- Búsqueda visual por similitud: indexar un catálogo de imágenes con los embeddings de 2048 dimensiones y recuperar las más parecidas mediante similitud coseno, aprovechando que los vectores ya vienen normalizados en L2.
- Deduplicación de imágenes: detectar copias, recortes o variantes cercanas calculando la distancia coseno entre embeddings de un mismo lote.
- Agrupamiento no supervisado de colecciones: usar los vectores como entrada a algoritmos como k-means o DBSCAN para organizar archivos visuales por similitud.
- Baseline de investigación en visión: comparar el rendimiento de un CNN residual clásico frente a modelos auto-supervisados (DINO) o multimodales (CLIP) en una tarea de recuperación concreta.
- Clasificación por vecino más cercano: emplear los embeddings como características para un clasificador ligero (k-NN o regresión logística) sobre dominios específicos, sin reentrenar la red.
- Moderación o filtrado de contenido visual a pequeña escala: agrupar imágenes similares para revisión manual, siempre con validación humana dado el riesgo de falsos positivos.
- Preprocesado en pipelines de datos: generar características de imagen en CPU dentro de flujos ETL donde no hay GPU disponible, gracias al proveedor de ejecución declarado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión top-1/top-5 en ImageNet ni resultados de recuperación, y no se aportan cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al ejecutarse con `CPUExecutionProvider`, el paquete está pensado para inferencia en CPU. El tamaño del repo es de 0,1 GB.
- GPU recomendadas: no disponibles; el proveedor declarado es CPU, aunque ONNX Runtime podría usar otros proveedores si el entorno los habilita, algo que la model card no garantiza.
- Compatibilidad con GPU de consumo: no confirmada; no se documenta soporte CUDA.
- Opciones de despliegue: ONNX Runtime con `CPUExecutionProvider` dentro de EIDORA Desktop; el contrato de ejecución lo define `config.yaml`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Dimension del embedding | Entrenamiento | Formato | Licencia |
|---|---|---|---|---|---|
| ResNet50_IN1k (EIDORA) | ResNet-50 | 2048 | ImageNet-1K supervisado | ONNX | `other` (no explicitada para los pesos) |
| AlexNet | CNN | 4096 | ImageNet-1K supervisado | varios (PyTorch, ONNX) | según distribución upstream |
| VGG16 | CNN | 4096 | ImageNet-1K supervisado | varios | según distribución upstream |
| DINO | ViT auto-supervisado | variable según variante | Auto-supervisado | PyTorch | según variante |
| CLIP | Transformer multimodal | variable según variante | Contrastivo imagen-texto | PyTorch, ONNX | según variante |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparación se limita a características estructurales.

## Limitaciones y advertencias

- La tarea original es clasificación en ImageNet-1K, no interpretación histórica o cultural; el uso como extractor de embeddings es una adaptación.
- El significado fino y la identidad no pueden inferirse solo por proximidad de características; dos imágenes pueden ser cercanas en el espacio de embeddings sin compartir el mismo sujeto.
- El ajuste de redimensionado de EIDORA forma parte de la definición del embedding: cambiar el preprocesado altera los vectores y rompe la comparabilidad.
- La licencia de los pesos no está establecida: la model card indica que no se afirma un identificador de licencia para los pesos y que la ausencia de fichero `LICENSE` no debe interpretarse como permiso ni prohibición. Esto es un riesgo para uso comercial.
- La licencia del software TorchVision es BSD-3-Clause, pero no se extiende necesariamente a los pesos preentrenados.
- No se documentan sesgos específicos, pero al derivar de ImageNet-1K hereda los sesgos de dicho dataset (representación desigual de clases, contextos y demografía).
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos en tareas de similitud o deduplicación.
- Los resultados deben evaluarse contra los datos y preguntas de investigación previstos; no se ofrecen garantías de rendimiento en dominios distintos de ImageNet.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EIDORA/ResNet50_IN1k
- Paper original: https://arxiv.org/abs/1512.03385
- Documentación de ResNet-50 en TorchVision: https://docs.pytorch.org/vision/stable/models/generated/torchvision.models.resnet50.html
- Descarga del checkpoint original: https://download.pytorch.org/models/resnet50-11ad3fa6.pth
