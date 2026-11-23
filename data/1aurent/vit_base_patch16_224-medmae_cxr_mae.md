# 1aurent/vit_base_patch16_224.medmae_CXR_mae

## Resumen

`vit_base_patch16_224.medmae_CXR_mae` es un modelo de clasificación de imágenes basado en la arquitectura Vision Transformer (ViT-Base con parches de 16x16 píxeles y resolución de entrada de 224x224), publicado por el usuario 1aurent en Hugging Face. El nombre indica que se trata de un ViT-Base inicializado o preentrenado con el esquema MedMAE (Masked Autoencoder para imágenes médicas) sobre el dominio CXR (radiografías de tórax, *chest X-ray*) y posteriormente adaptado mediante el pipeline MAE.

El modelo se distribuye a través de la librería `timm` (PyTorch Image Models) y está pensado para tareas de clasificación de imágenes, presumiblemente en el ámbito de radiología torácica, aunque la model card publicada es extremadamente escasa y no detalla el dataset de fine-tuning, las clases de salida ni los resultados obtenidos. Con 85,8 millones de parámetros y un repositorio de solo 0,3 GB, es un modelo ligero y desplegable en hardware de consumo.

Su relevancia es limitada pero concreta: sirve como punto de partida o referencia para experimentos de *transfer learning* en imagen médica con ViT, y su licencia Apache 2.0 facilita su uso comercial e investigación sin restricciones adicionales. No obstante, la ausencia de documentación sobre datos de entrenamiento, métricas y clases de salida obliga a tratar el modelo con cautela en cualquier despliegue real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, patch 16, resolución 224x224) |
| Parametros totales | 85.798.656 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía timm/PyTorch) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer de tamaño Base: 12 capas de transformer, dimensión oculta de 768 y 12 cabezas de atención, con parches de 16x16 sobre imágenes de 224x224 píxeles (196 tokens por imagen más el token de clase). El nombre del checkpoint sugiere un preentrenamiento con MedMAE, una variante de Masked Autoencoder (MAE) adaptada a imágenes médicas, seguido de un ajuste fino supervisado para clasificación.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO (no aplicable en visión) ni innovaciones técnicas específicas más allá del esquema MAE. La model card no incluye detalles sobre el corpus CXR utilizado ni sobre el procedimiento de fine-tuning.

## Capacidades

- Clasificación de imágenes (pipeline `image-classification` en Hugging Face).
- Extracción de características visuales mediante el backbone ViT, reutilizable para otras tareas con `timm`.
- Compatible con el ecosistema `timm` (carga directa vía `timm.create_model`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- Sin capacidades multilingües ni de generación de texto.
- Sin modo *thinking*, visión general, audio ni otras capacidades especiales documentadas.

## Casos de uso

- Clasificación de radiografías de tórax: el modelo puede usarse como clasificador directo de imágenes CXR en tareas binarias o multiclase, siempre que se valide previamente el etiquetado de salida, no documentado en la model card.
- Extracción de embeddings para búsqueda por similitud: el backbone ViT permite generar representaciones de imágenes médicas para sistemas de recuperación o clustering.
- Transfer learning en imagen médica: punto de partida para fine-tuning en datasets propios de radiología, con la ventaja de partir de pesos preentrenados en dominio CXR.
- Prototipado rápido en investigación: su tamaño (85,8 M de parámetros) permite iterar en una sola GPU de consumo.
- Baseline en estudios comparativos: útil como referencia ViT-Base en experimentos de clasificación médica frente a otros backbones.
- Integración en pipelines de `timm`: despliegue en servicios de inferencia de imágenes con PyTorch/TorchScript u ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,35 GB de pesos, más activaciones; en la práctica cabe en cualquier GPU con 2 GB o más.
- VRAM estimada en FP16: en torno a 0,2 GB de pesos.
- GPU recomendadas: cualquier GPU moderna; RTX 3060/4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en GPU de consumo (RTX 20xx en adelante) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `timm` + PyTorch, exportación a ONNX, TorchScript; no se documenta soporte específico para vLLM, llama.cpp, Ollama ni TGI (no aplicables a visión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| vit_base_patch16_224.medmae_CXR_mae | 85,8 M | 224x224 px | Apache 2.0 | Hugging Face (timm) |
| vit_base_patch16_224 (ImageNet, timm) | ~86 M | 224x224 px | Apache 2.0 | Hugging Face (timm) |
| vit_base_patch16_224.mae | ~86 M | 224x224 px | Apache 2.0 | Hugging Face (timm) |
| Otros ViT-Base médicos | no disponible | no disponible | no disponible | no disponible |

La comparación se limita a la familia ViT-Base de `timm`, dado que no se dispone de datos de rendimiento específicos del modelo frente a alternativas médicas.

## Limitaciones y advertencias

- Model card prácticamente vacía: no se documentan clases de salida, dataset de fine-tuning ni métricas, lo que impide validar su comportamiento real.
- Riesgo elevado de alucinación o clasificación errónea en dominios distintos al de entrenamiento, al no conocerse la distribución de datos.
- Sesgos desconocidos: sin información sobre la composición demográfica o clínica del corpus CXR utilizado.
- No apto para uso clínico sin validación externa exhaustiva y sin supervisión médica.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentación traslada toda la responsabilidad de validación al usuario.
- Solo procesa imágenes; no admite texto, audio ni otras modalidades.
- Descargas muy bajas (41) y ausencia de *likes*, lo que sugiere escasa validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/1aurent/vit_base_patch16_224.medmae_CXR_mae
- Repositorio timm: https://github.com/huggingface/pytorch-image-models
- Paper MAE original: https://arxiv.org/abs/2111.06377
