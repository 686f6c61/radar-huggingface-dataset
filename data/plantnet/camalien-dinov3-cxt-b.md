# PlantNet/Camalien-DINOv3-CXT-B

## Resumen

Camalien-DINOv3-CXT-B es un modelo de visión por computador desarrollado por PlantNet, la organización detrás de la plataforma de identificación de plantas Pl@ntNet. El modelo está diseñado específicamente para la identificación de especies vegetales en imágenes de carretera (roadside imagery) y para la detección de especies invasoras, tareas que se formulan como clasificación multilabel. Se construye sobre la arquitectura DINOv3, el modelo de representación visual auto-supervisado de Meta, y se distribuye con la licencia DINOv3 de Meta.

El modelo resulta relevante para investigadores y desarrolladores que trabajan en biodiversidad, monitorización medioambiental e infraestructura viaria, ya que aborda un caso de uso concreto (vegetación en márgenes de carretera) que los clasificadores genéricos de plantas no cubren bien. El repositorio ocupa 2,7 GB, lo que sugiere pesos en precisión alta derivados de un backbone DINOv3 de tamaño base.

La información pública disponible es limitada: la model card no incluye especificaciones detalladas de arquitectura, datos de entrenamiento, benchmarks ni idiomas. Esta ficha refleja únicamente lo que puede verificarse a partir del repositorio y de la documentación de Pl@ntNet, e indica explícitamente "no disponible" donde no hay datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv3 (backbone transformer de visión) con cabeza de clasificación multilabel; variante "B" (base) según nomenclatura del ID |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen; etiquetas de especies presumiblemente en latín/nombres científicos) |
| Licencia | dinov3-license (Meta); ver enlace en la model card |
| Formato de pesos | no disponible (repo de 2,7 GB; presumiblemente safetensors o bin, sin confirmar) |

## Arquitectura y entrenamiento

El modelo se basa en DINOv3, la tercera generación de los modelos DINO de Meta, que emplean aprendizaje auto-supervisado para producir representaciones visuales densas y transferibles. Sobre ese backbone, PlantNet añade una cabeza de clasificación multilabel orientada a identificar especies vegetales en imágenes de carretera y a señalar especies invasoras. La nomenclatura "CXT-B" sugiere una variante base con contexto extendido, aunque la model card no detalla la configuración exacta de capas, dimensión oculta ni resolución de entrada.

No se dispone de información pública sobre el volumen de datos de entrenamiento, la composición del dataset, el uso de RLHF/DPO (no aplicable en un modelo de visión) ni innovaciones técnicas específicas más allá del propio preentrenamiento DINOv3. La model card únicamente declara los tags de la tarea y la licencia, sin sección de detalles técnicos.

## Capacidades

- Clasificación multilabel de especies vegetales en imágenes, permitiendo que una misma imagen contenga varias especies etiquetadas simultáneamente.
- Identificación especializada en imágenes de carretera (roadside imagery), un dominio visual distinto al de fotografías de herbario o de jardín.
- Detección de especies invasoras como etiqueta específica dentro del esquema multilabel.
- Extracción de representaciones visuales mediante el backbone DINOv3, reutilizable para tareas de retrieval o clasificación con fine-tuning.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, generación de texto, audio ni modo "thinking": es un modelo puramente visual.
- Capacidades multilingües: no disponibles (las etiquetas de salida son identificadores de especie, no texto libre).

## Casos de uso

- Monitorización de márgenes de carretera: procesar lotes de imágenes capturadas por vehículos de inspección para inventariar la vegetación presente y priorizar el desbroce o la revisión manual.
- Detección temprana de especies invasoras: aplicar el modelo a imágenes de infraestructura viaria para localizar focos de especies exóticas invasoras y activar protocolos de contención.
- Inventario de biodiversidad en corredores viarios: generar series temporales de presencia de especies a partir de campañas periódicas de fotografía y analizar cambios en la composición florística.
- Apoyo a sistemas de gestión de activos verdes: integrar las predicciones en plataformas GIS para enriquecer mapas de vegetación con etiquetas de especie y nivel de confianza.
- Validación y curación de datasets: usar el modelo como preetiquetador para acelerar el etiquetado humano de nuevas imágenes de carretera antes de reentrenar.
- Investigación en ecología del paisaje: extraer embeddings DINOv3 del backbone para estudios de similitud entre comunidades vegetales o para clustering de hábitats.
- Filtrado previo en pipelines de ciencia ciudadana: descartar o clasificar automáticamente imágenes no deseadas antes de enviarlas a revisión experta en plataformas tipo Pl@ntNet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio de 2,7 GB sugiere pesos en fp32 o fp16 de un backbone base, por lo que una GPU con 8-16 GB de VRAM debería ser suficiente para inferencia en fp16, pero es una estimación, no un dato del autor.
- GPU recomendadas: no disponibles; por tamaño, una RTX 3090/4090 o una A10/A100 serían adecuadas para lotes grandes, sin confirmación del autor.
- Cabe en GPU de consumo: probablemente sí en tarjetas con 8 GB o más en fp16, aunque no está verificado.
- Opciones de despliegue: no documentadas; al ser un modelo de visión basado en DINOv3, podría servirse con PyTorch/TorchScript o con frameworks de inferencia visual, pero el autor no indica ninguna.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Camalien-DINOv3-CXT-B | Clasificación multilabel de flora en carretera | no disponible | no aplica | dinov3-license | Hugging Face (0 descargas) |
| Pl@ntNet API (servicio) | Identificación de plantas | no disponible | no aplica | servicio propietario | API comercial |
| DINOv3 (Meta) | Representación visual general | no disponible | no aplica | dinov3-license | Pesos públicos de Meta |
| CLIP / SigLIP | Visión-lenguaje zero-shot | no disponible | no aplica | varía | Hugging Face |

La comparación cuantitativa no es posible: no hay benchmarks publicados para Camalien-DINOv3-CXT-B ni datos de parámetros. Frente a la API de Pl@ntNet, este modelo es un artefacto local y especializado en un dominio concreto; frente a DINOv3 base, añade una cabeza de clasificación específica de flora viaria.

## Limitaciones y advertencias

- Sesgos de dominio: entrenado para imágenes de carretera, por lo que su rendimiento en fotografías de jardín, herbario o macro probablemente sea inferior; no hay datos que lo cuantifiquen.
- Riesgo de alucinación conceptual: al ser multilabel, puede asignar especies plausibles pero incorrectas en imágenes con oclusión, baja resolución o vegetación seca; no se documentan umbrales de confianza recomendados.
- Idiomas: no aplica a texto, pero las etiquetas de especie no están descritas en la model card; se desconoce si usan nomenclatura científica, nombres comunes o códigos internos.
- Licencia: dinov3-license de Meta, que impone condiciones específicas (incluida cláusula de uso aceptable y posible restricción comercial); debe revisarse antes de cualquier despliegue en producción.
- Madurez: 0 descargas y 1 like en el momento de la consulta, sin pipeline declarado ni documentación de evaluación; no es un modelo listo para producción sin validación propia.
- Falta de información: sin detalles de dataset, métricas, resolución de entrada ni formato de pesos, lo que dificulta la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/PlantNet/Camalien-DINOv3-CXT-B
- Licencia DINOv3: https://ai.meta.com/resources/models-and-libraries/dinov3-license/
- Pl@ntNet: https://plantnet.org/
- Pl@ntNet identify: https://identify.plantnet.org/fr
- Documentación Pl@ntNet: https://docs.plantnet.org/fr/get-started/
