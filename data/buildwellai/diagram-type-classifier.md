# Buildwellai/diagram-type-classifier

## Resumen

BuildwellAI Diagram-Type Classifier es un clasificador de imágenes desarrollado por BuildwellAI para identificar el tipo de diagrama en figuras de regulaciones de construcción del Reino Unido. El modelo permite enrutar un flujo de trabajo de restyling en ComfyUI hacia el prompt y ControlNet específicos según la clase detectada.

El modelo utiliza un encoder DINOv3 ViT-L/16 con fine-tuning en los últimos bloques y una cabeza lineal. Se entrenó con etiquetas destiladas de un modelo profesor Qwen3.5-VL sobre 2315 recortes de diagramas. El repositorio tiene un tamaño de 1.2 GB y la licencia es Apache 2.0.

La motivación del desarrollo fue la limitación detectada en experimentos previos: el tamaño del encoder no era el cuello de botella, sino la escala de datos y el fine-tuning al dominio de dibujos lineales. El modelo está pensado para integrarse en pipelines de ComfyUI como nodo personalizado que mapea imagen a clase y confianza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv3 ViT-L/16 con fine-tuning en últimos bloques y cabeza lineal |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es modelo MoE) |
| Longitud de contexto | no disponible (clasificador de imágenes, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrada de imagen, sin dependencia de idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | .pt (state_dict de PyTorch) y .joblib (modelo scikit-learn) |

## Arquitectura y entrenamiento

El modelo se basa en un encoder DINOv3 ViT-L/16. Para el probe `class_probe.joblib`, las características del encoder se mantuvieron congeladas y se entrenó una regresión logística sobre ellas. Para el modelo `ft_model.pt`, se realizó fine-tuning de los últimos bloques del encoder junto con una cabeza lineal.

Las etiquetas de entrenamiento fueron destiladas de un profesor Qwen3.5-VL sobre 2315 recortes de diagramas extraídos de figuras de normativas de construcción del Reino Unido. El autor destaca que los experimentos comparando DINOv2-base y DINOv3-large con 234 muestras mostraron que el tamaño del encoder no era el factor determinante; la mejora del rendimiento vino de ampliar el conjunto de datos de 234 a 2315 muestras y de adaptar el modelo al dominio de dibujos lineales mediante fine-tuning.

El fichero `report.txt` contiene el informe de validación por clase. El modelo no emplea técnicas como RLHF, DPO o decodificación especulativa, ya que no es un modelo generativo de texto.

## Capacidades

- Clasificación de imágenes en seis clases de tipo de diagrama: `COMPOUND`, `CROSS_SECTION`, `ISOMETRIC_UPDATE`, `SCHEMATIC_FLOW`, `SITE_PLAN` y `TABLE_DATA`.
- Salida de clase y confianza asociada, permitiendo la toma de decisiones en pipelines automatizados.
- Integración con ComfyUI mediante un nodo personalizado que mapea `IMAGE -> (class, confidence)` y alimenta nodos Switch.
- Proporciona dos variantes de despliegue: un modelo fine-tuned en PyTorch (`.pt`) y un probe ligero basado en regresión logística (`.joblib`) para entornos con menos recursos.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso; se limita a clasificación de imágenes.
- No incluye capacidades multimodales más allá de la entrada visual; no procesa audio, vídeo ni lenguaje natural.

## Casos de uso

- Enrutamiento de flujos de restyling en ComfyUI: el modelo clasifica una figura de plano o normativa y decide qué prompt y ControlNet aplicar para el restyle, evitando configuraciones manuales y errores de encaje.
- Gestión documental en proyectos de construcción: clasifica automáticamente las figuras de un paquete de planos en tipos como sección transversal o plano de sitio, facilitando su organización y consulta.
- Preprocesado de datos para pipelines de IA documental: antes de aplicar OCR, extracción de tablas o análisis normativo, el modelo identifica si una figura es una tabla de datos o un esquema de flujo, permitiendo seleccionar el procesador adecuado.
- Auditoría de conformidad normativa: al revisar un documento de regulaciones del Reino Unido, el clasificador identifica los diagramas relevantes (por ejemplo, planos de sitio o secciones) para priorizar su revisión y comparación con los requisitos.
- Automatización de índices de figuras en memorias de proyecto: genera automáticamente etiquetas por tipo de diagrama en documentación técnica, reduciendo el trabajo manual de catalogación.
- Orquestación de nodos en ComfyUI: el modelo puede conectarse a nodos Switch que dirigen la salida hacia diferentes subgrafos de procesamiento, permitiendo flujos condicionales sin intervención humana.

## Benchmarks y rendimiento

El autor publicó los resultados de validación en un conjunto held-out de 343 muestras con validación cruzada de 5 pliegues. No se han publicado comparativas con otros modelos en la información disponible.

| Clase | Precision | Recall | F1-score | Soporte |
|---|---|---|---|---|
| COMPOUND | 0.727 | 0.762 | 0.744 | 84 |
| CROSS_SECTION | 0.855 | 0.707 | 0.774 | 133 |
| ISOMETRIC_UPDATE | 0.703 | 0.867 | 0.776 | 30 |
| SCHEMATIC_FLOW | 0.562 | 0.750 | 0.643 | 12 |
| SITE_PLAN | 0.667 | 0.870 | 0.755 | 23 |
| TABLE_DATA | 0.935 | 0.951 | 0.943 | 61 |
| Accuracy global | - | - | 0.790 | 343 |
| Macro avg | 0.742 | 0.818 | 0.772 | 343 |
| Weighted avg | 0.802 | 0.790 | 0.791 | 343 |

La métrica de precisión balanceada (`val_bal`) reportada es 0.818.

## Requisitos de hardware

No se han publicado requisitos de hardware específicos en la información disponible. A partir del tamaño del repositorio (1.2 GB) y del uso de un encoder DINOv3 ViT-L/16, se puede inferir que el modelo requiere una GPU para ejecutar el encoder, aunque no se dispone de cifras oficiales de VRAM, latencia o throughput.

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el modelo card indica integración con ComfyUI y el modelo `.joblib` puede ejecutarse con scikit-learn en CPU.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se han encontrado modelos comparables en la información proporcionada. No se dispone de datos para comparar parámetros, contexto, rendimiento o disponibilidad con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo solo clasifica en seis clases predefinidas de diagramas de construcción del Reino Unido; no es aplicable a otros dominios ni a tipos de diagrama diferentes.
- La clase `SCHEMATIC_FLOW` tiene un soporte muy bajo (12 muestras) y un F1 de 0.643, lo que indica una menor fiabilidad en esa categoría.
- Las etiquetas de entrenamiento fueron destiladas de un modelo de visión y lenguaje (Qwen3.5-VL), por lo que pueden contener errores heredados del profesor.
- El modelo no dispone de datos publicados sobre sesgos, robustez frente a condiciones de iluminación o deformaciones, ni sobre rendimiento en imágenes fuera de la distribución de entrenamiento.
- Al ser un clasificador discreto, el riesgo de alucinación no aplica, pero sí existe la posibilidad de errores de clasificación que afecten a decisiones posteriores en el pipeline.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el rendimiento final recae en el integrador, dado el tamaño limitado del conjunto de datos (2315 muestras).
- La información disponible no incluye instrucciones de uso para producción, ni requisitos de versión de ComfyUI o PyTorch.

## Enlaces

- HuggingFace: https://huggingface.co/Buildwellai/diagram-type-classifier
- Sitio web de BuildwellAI: https://www.buildwellai.com/
- Buildwell THREAD: https://thread.buildwellai.com/
- Centro de ayuda de BuildwellAI: https://help.buildwellai.com/
