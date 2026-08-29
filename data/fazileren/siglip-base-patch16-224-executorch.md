# FazilEren/siglip-base-patch16-224-executorch

## Resumen

Este repositorio contiene una conversión del modelo SigLIP base (patch16, resolución 224) al formato ExecuTorch, realizada por el usuario FazilEren. ExecuTorch es el runtime de inferencia de PyTorch diseñado para dispositivos con recursos limitados (móviles, embebidos, edge), lo que permite ejecutar modelos de visión-lenguaje en hardware de bajo consumo sin depender de un servidor.

El modelo original, desarrollado por Google, es un transformer de visión-lenguaje preentrenado con la función de pérdida sigmoide (Sigmoid Loss for Language Image Pre-Training) sobre el dataset WebLi. Su arquitectura base cuenta con aproximadamente 86 millones de parámetros y procesa imágenes a 224x224 píxeles. Esta conversión a ExecuTorch facilita su integración en aplicaciones móviles o de edge computing, manteniendo las capacidades de alineación imagen-texto del modelo original.

La relevancia de esta ficha radica en que los desarrolladores que buscan desplegar SigLIP en entornos embebidos necesitan conocer las características específicas de esta conversión, sus limitaciones y los requisitos de hardware para su ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de vision-lenguaje (SigLIP base, patch 16, resolución 224) |
| Parametros totales | Aproximadamente 86 millones (modelo base original) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (procesa imágenes de 224x224; sin contexto de texto explícito) |
| Tipos de cuantizacion | No disponible (formato ExecuTorch, posiblemente FP32 o cuantizado, no especificado) |
| Idiomas soportados | No disponibles (el modelo original es multilingüe, pero esta conversión no especifica) |
| Licencia | No disponible en el repositorio (el modelo original de Google usa Apache 2.0) |
| Formato de pesos | ExecuTorch (.pte) |

## Arquitectura y entrenamiento

El modelo original SigLIP base se basa en la arquitectura ViT (Vision Transformer) con un codificador de texto, preentrenado conjuntamente mediante la pérdida sigmoide en lugar de la softmax contrastiva tradicional. Esta innovación, presentada en el paper "Sigmoid Loss for Language Image Pre-Training" de Zhai et al., simplifica el entrenamiento y mejora la estabilidad numérica, permitiendo escalar a lotes más grandes sin necesidad de normalización global.

El preentrenamiento se realizó sobre el dataset WebLi, que contiene pares imagen-texto extraídos de la web. El modelo procesa imágenes a 224x224 píxeles y produce embeddings alineados entre imagen y texto. La conversión a ExecuTorch no modifica la arquitectura ni los pesos, sino que los serializa en un formato optimizado para inferencia en dispositivos edge, eliminando dependencias de Python y reduciendo la huella de memoria.

## Capacidades

- Alineación imagen-texto: genera embeddings comparables entre imágenes y descripciones textuales, útil para búsqueda multimodal y recuperación.
- Clasificación de imágenes zero-shot: puede clasificar imágenes sin entrenamiento específico, usando prompts textuales como "una foto de un gato".
- Recuperación de imágenes por texto: dado un texto, encuentra las imágenes más relevantes en un corpus.
- Recuperación de texto por imagen: dado una imagen, encuentra los textos descriptivos más cercanos.
- Extracción de características visuales: produce representaciones densas de imágenes para tareas downstream como detección o segmentación.
- Ejecución en dispositivos edge: gracias al formato ExecuTorch, puede ejecutarse en móviles, Raspberry Pi u otros dispositivos con recursos limitados.

## Casos de uso

- Búsqueda visual en aplicaciones móviles: integrar el modelo en una app de fotos para buscar imágenes por descripción textual, aprovechando la ejecución local sin conexión.
- Moderación de contenido en tiempo real: clasificar imágenes en categorías (violencia, desnudos, etc.) mediante prompts textuales, ejecutándose en el dispositivo para privacidad.
- Asistentes de accesibilidad: describir imágenes para personas con discapacidad visual, usando el modelo en un dispositivo portátil con cámara.
- Sistemas de recomendación visual: generar embeddings de productos y consultas de usuario para recomendar artículos similares en tiendas online.
- Análisis de documentos escaneados: extraer características de imágenes de documentos para clasificarlos o indexarlos automáticamente.
- Prototipado rápido de pipelines de visión: usar el modelo como extractor de características en un pipeline de RAG multimodal, ejecutándose en un servidor edge de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta conversión a ExecuTorch. El modelo original SigLIP base reporta resultados en tareas como ImageNet zero-shot y retrieval en Flickr30K y COCO, pero estos datos no están incluidos en el repositorio ni en los resultados de búsqueda. Se recomienda consultar el paper original para obtener métricas detalladas.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al ser un modelo de ~86M parámetros, la inferencia en FP32 requiere aproximadamente 350 MB de memoria, y en cuantización INT8 podría reducirse a ~90 MB.
- GPU recomendadas: no requiere GPU; está diseñado para CPU en dispositivos edge. En un PC, cualquier CPU moderna es suficiente.
- Compatibilidad con consumer GPU: no aplica, ya que ExecuTorch está orientado a CPU/edge, aunque podría ejecutarse en GPU si se convierte a otro formato.
- Opciones de despliegue: ExecuTorch runtime (C++), integrable en Android, iOS, Linux embebido. No compatible directamente con vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles. Dependerá del hardware objetivo; en un móvil moderno, la inferencia de una imagen podría tomar entre 50 y 200 ms, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FazilEren/siglip-base-patch16-224-executorch | ~86M | 224x224 | ExecuTorch | No disponible | HuggingFace |
| google/siglip-base-patch16-224 | ~86M | 224x224 | Safetensors | Apache 2.0 | HuggingFace |
| openai/clip-vit-base-patch32 | ~86M | 224x224 | Safetensors | MIT | HuggingFace |
| laion/CLIP-ViT-B-32-laion2B-s34B-b79K | ~86M | 224x224 | Safetensors | MIT | HuggingFace |

La principal diferencia de esta conversión frente a los modelos originales es el formato de pesos: ExecuTorch está optimizado para despliegue en edge, mientras que los safetensors requieren un runtime de Python o un framework de inferencia. El rendimiento en tareas de visión-lenguaje debería ser idéntico al modelo original, ya que los pesos no se modifican.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo original fue preentrenado en WebLi, que puede contener sesgos culturales y de género. Esta conversión hereda esos sesgos.
- Riesgo de alucinación: en tareas de generación de texto, SigLIP no genera texto libre, pero puede producir descripciones incorrectas si se usa con un decodificador externo.
- Limitaciones de contexto: la resolución fija de 224x224 limita la calidad en imágenes de alta resolución o con detalles finos.
- Restricciones de licencia: la licencia del repositorio no está especificada; aunque el modelo original es Apache 2.0, se debe verificar antes de uso comercial.
- Compatibilidad: el formato ExecuTorch requiere el runtime específico; no es directamente utilizable con bibliotecas estándar como transformers o timm.
- Mantenimiento: el repositorio no muestra actividad reciente (actualizado en agosto de 2026), por lo que puede no recibir actualizaciones o correcciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FazilEren/siglip-base-patch16-224-executorch
- Modelo original: https://huggingface.co/google/siglip-base-patch16-224
- Paper original (Sigmoid Loss for Language Image Pre-Training): no disponible en los resultados de búsqueda, pero se puede localizar en arxiv.org
- Documentación de ExecuTorch: https://pytorch.org/executorch (no verificado en la búsqueda)
