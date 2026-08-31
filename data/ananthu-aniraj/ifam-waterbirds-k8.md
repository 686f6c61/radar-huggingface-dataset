# ananthu-aniraj/ifam-waterbirds-k8

## Resumen

IFAM (Iterative Focus and Attention Masking) es un framework de clasificación de imágenes basado en Vision Transformers (ViT) de dos etapas, presentado en el artículo "Two-stage Vision Transformers and Hard Masking offer Robust Object Representations" (ICPR 2026, presentación oral). El modelo aquí descrito es un checkpoint oficial entrenado sobre el dataset Waterbirds con 8 partes (K=8). Su objetivo principal es mejorar la robustez de las representaciones de objetos frente a correlaciones espurias y fondos fuera de distribución, un problema habitual en tareas de clasificación visual.

La arquitectura se compone de un selector (stage 1) que procesa la imagen completa para descubrir partes del objeto y regiones relevantes, y un predictor (stage 2) que restringe su campo receptivo a esas regiones mediante máscaras de atención binarias aprendidas. Esto evita que detalles irrelevantes del fondo influyan en la predicción. El modelo se basa en DINOv2 (según las etiquetas del repositorio) y cuenta con 173 millones de parámetros, lo que lo sitúa en un rango medio para ViT. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

La relevancia actual de este modelo radica en su enfoque explícito de enmascaramiento duro, que no solo mejora la precisión en entornos con correlaciones espurias, sino que también ofrece máscaras semánticas auditable, facilitando intervenciones en tiempo de prueba para aumentar la robustez. Es una propuesta interesante para investigadores y desarrolladores que trabajan en clasificación de imágenes en entornos no controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer de dos etapas (selector y predictor) basado en DINOv2 |
| Parametros totales | 173.189.381 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, PyTorch |

## Arquitectura y entrenamiento

El modelo IFAM sigue un enfoque de dos etapas. En la primera etapa, un selector procesa la imagen completa y genera máscaras de atención binarias que identifican las regiones relevantes para la tarea (partes del objeto). En la segunda etapa, un predictor recibe la imagen enmascarada según esas regiones, limitando su campo receptivo y evitando que el fondo influya en la clasificación. Esta arquitectura se implementa sobre DINOv2, un modelo de visión autocontrolado conocido por sus representaciones robustas.

El entrenamiento se realizó sobre el dataset Waterbirds, que contiene imágenes de aves con fondos variados y correlaciones espurias entre especie y fondo. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO (no aplicables a visión). El artículo asociado (arXiv:2506.08915) describe el método completo, pero la información disponible no incluye hiperparámetros específicos ni detalles del proceso de entrenamiento.

## Capacidades

- Clasificacion de imagenes: el modelo esta entrenado para clasificar aves en el dataset Waterbirds, pero el framework es generalizable a otras tareas de clasificacion de objetos.
- Robustez ante correlaciones espurias: gracias al enmascaramiento duro, el modelo ignora fondos irrelevantes, mejorando la precision en entornos fuera de distribucion.
- Interpretabilidad: las mascaras de atencion binarias generadas por el selector son explicitas y auditable, permitiendo inspeccionar que regiones de la imagen influyen en la prediccion.
- Intervenciones en tiempo de prueba: las mascaras semanticas permiten modificar manualmente las regiones consideradas, lo que puede aumentar la robustez en escenarios adversos.
- No soporta tool calling, agentes ni capacidades multimodales (solo vision).

## Casos de uso

- Investigacion en robustez de modelos de vision: el modelo sirve como punto de partida para estudiar el impacto de correlaciones espurias y metodos de enmascaramiento en clasificadores ViT. Los investigadores pueden cargar el checkpoint y evaluar su comportamiento en otros datasets con fondos variables.
- Clasificacion de especies en entornos naturales: aunque esta entrenado en Waterbirds, el framework puede adaptarse mediante fine-tuning a otros dominios biologicos (insectos, plantas) donde el fondo confunde al clasificador. Su capacidad de ignorar el fondo es especialmente util en fotografia de campo.
- Auditoria de modelos de clasificacion: las mascaras generadas permiten verificar si el modelo se basa en regiones correctas del objeto, util para validar sistemas de vision en aplicaciones criticas (diagnostico medico, inspeccion industrial).
- Desarrollo de sistemas de vision con intervencion humana: en escenarios donde un operador puede corregir las regiones de atencion, el modelo permite ajustar en tiempo de prueba las mascaras para mejorar la precision sin reentrenar.
- Fine-tuning para tareas especificas: dado su tamano moderado (173M parametros), puede ajustarse en GPUs consumer para tareas de clasificacion de objetos con fondos complejos, como deteccion de defectos en manufactura o clasificacion de vehiculos en imagenes de trafico.
- Comparacion de metodos de enmascaramiento: el checkpoint facilita la reproduccion de los experimentos del paper y la comparacion con otros enfoques de atencion o enmascaramiento en vision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El articulo arXiv (2506.08915) probablemente contiene metricas detalladas, pero no se incluyen en la model card ni en los resultados de busqueda proporcionados. Se recomienda consultar el paper para obtener datos de rendimiento comparativo.

## Requisitos de hardware

- VRAM estimada: con 173M de parametros, el modelo en FP32 ocupa aproximadamente 692 MB, y en FP16 unos 346 MB. Considerando la entrada de imagen (518x518) y las dos etapas, se estima que una GPU con al menos 4 GB de VRAM es suficiente para inferencia en lotes pequenos.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, como NVIDIA RTX 3060 (12 GB), RTX 4090, o GPUs de datacenter como A100. Para entrenamiento o fine-tuning, se recomienda al menos 8 GB de VRAM.
- Compatibilidad con consumer GPU: si, el modelo cabe en GPUs de gama media (6-8 GB) para inferencia, y en GPUs de gama alta (12-24 GB) para fine-tuning.
- Opciones de despliegue: el modelo se carga mediante la clase `FullTwoStageModelDoubleClassify` desde el repositorio `ifam`. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que es un modelo de vision y no de lenguaje. Se puede servir con PyTorch y Hugging Face Transformers (aunque requiere codigo personalizado del repo).
- Latencia y throughput: no disponible en la informacion proporcionada. Dependera del hardware y del tamano de lote.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de la misma categoria (clasificacion de imagenes robusta con enmascaramiento). El modelo se basa en DINOv2, pero no se proporcionan datos de rendimiento frente a alternativas como CLIP, ViT estandar o modelos con atencion especifica. Se recomienda consultar el paper para comparaciones detalladas.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente en el dataset Waterbirds, por lo que su generalizacion a otros dominios puede ser limitada sin fine-tuning.
- No se han documentado sesgos especificos, pero al ser un modelo de vision entrenado en un dataset concreto, puede heredar sesgos de ese dataset (por ejemplo, distribucion de especies o fondos).
- Riesgo de alucinacion: no aplica, ya que es un modelo discriminativo de clasificacion, no generativo.
- Limitaciones de contexto: al ser un modelo de vision, no maneja texto ni secuencias largas; su entrada es una imagen de tamano fijo (518x518 segun el ejemplo).
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se mantenga el aviso de copyright y se indiquen los cambios.
- Para produccion, se debe tener en cuenta que el modelo requiere el codigo del repositorio `ifam` para cargarse correctamente, lo que anade una dependencia externa.

## Enlaces

- HuggingFace: https://huggingface.co/ananthu-aniraj/ifam-waterbirds-k8
- Paper (arXiv): https://arxiv.org/abs/2506.08915
- Repositorio GitHub: https://github.com/ananthu-aniraj/ifam
- Pagina personal del autor: https://ananthu-aniraj.github.io/
