# Haifald/vit-eurosat-landcover

## Resumen

El modelo `Haifald/vit-eurosat-landcover` es un clasificador de imágenes de satélite basado en la arquitectura Vision Transformer (ViT), ajustado sobre el conjunto de datos EuroSAT. Este dataset, derivado de imágenes Sentinel-2, contiene 27.000 imágenes de 10 clases de cobertura terrestre (cultivos anuales, bosques, carreteras, ríos, zonas residenciales, etc.) y es un estándar de referencia en teledetección. El modelo está publicado en Hugging Face con la librería `transformers` y el tag `arxiv:1910.09700`, que corresponde al artículo original de ViT, lo que sugiere que se trata de un fine-tuning de un ViT preentrenado.

La relevancia de este modelo radica en su aplicación directa a la clasificación de usos del suelo a partir de imágenes satelitales, una tarea clave para agricultura, planificación urbana y monitorización ambiental. Sin embargo, la model card es extremadamente escasa: no se especifican el tamaño del modelo, los hiperparámetros de entrenamiento, la licencia ni los resultados de evaluación. Esto limita su uso en producción sin una validación adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT), basado en el paper de Dosovitskiy et al. (2020) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente safetensors, pero no confirmado) |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer (ViT), que divide la imagen en parches y los procesa mediante capas de atención multi-cabeza, tal como se describe en el artículo "An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale" (arXiv:1910.09700). El modelo ha sido fine-tuneado sobre el dataset EuroSAT RGB, que contiene 27.000 imágenes de 10 clases de cobertura terrestre. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset (aunque se sabe que es EuroSAT), ni sobre el uso de técnicas como RLHF o DPO, que no son habituales en modelos de visión. Tampoco se especifican hiperparámetros de entrenamiento (tasa de aprendizaje, épocas, tamaño de lote, etc.) ni el régimen de precisión (fp32, fp16, etc.).

## Capacidades

- Clasificación de imágenes de satélite en 10 clases de cobertura terrestre: cultivo anual, bosque, carretera, zona industrial, pastizal, río, mar, zona residencial, etc.
- Inferencia sobre imágenes RGB de entrada (el dataset EuroSAT original tiene 13 bandas espectrales, pero este modelo parece usar solo las 3 bandas RGB).
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente visual.
- No tiene capacidades multilingües ni de generación de texto.
- No se ha documentado ningún modo especial (thinking, vision, audio, etc.) más allá de la clasificación de imágenes.

## Casos de uso

- Monitorización agrícola: clasificar parcelas de cultivo anual frente a otros usos del suelo a partir de imágenes Sentinel-2, lo que permite estimar superficies sembradas y planificar campañas.
- Planificación urbana: identificar zonas residenciales, industriales y de infraestructuras (carreteras) para actualizar mapas de uso del suelo.
- Gestión forestal: distinguir bosques de pastizales y cultivos, útil para inventarios de cobertura vegetal y detección de deforestación.
- Análisis de recursos hídricos: clasificar ríos y masas de agua (mar) para monitorizar cambios en cauces y superficies acuáticas.
- Estudios de impacto ambiental: comparar clasificaciones de cobertura terrestre en diferentes fechas para evaluar cambios en el paisaje.
- Educación e investigación: servir como modelo de referencia para experimentos de teledetección y comparación con otras arquitecturas (CNNs, etc.) en el dataset EuroSAT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, recall, F1 ni comparaciones con otros modelos. El usuario deberá evaluar el modelo por sí mismo si desea conocer su rendimiento real.

## Requisitos de hardware

- Al ser un ViT, el requisito de VRAM depende del tamaño del modelo (base, large, etc.), pero este dato no está disponible. Un ViT-base (86M parámetros) requiere aproximadamente 1-2 GB de VRAM en fp32 para inferencia, y menos en cuantización.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060) sería suficiente para un ViT-base. Para un ViT-large, se necesitarían 8-12 GB.
- No se confirma si el modelo cabe en GPUs de consumo, pero es probable que sí si se trata de un ViT-base.
- Opciones de despliegue: al ser un modelo de `transformers`, se puede usar con la librería `transformers` de Hugging Face, así como con `vLLM` (aunque vLLM está más orientado a LLMs), `TGI` o `llama.cpp` (si se convierte a GGUF, aunque no es habitual para modelos de visión). La opción más directa es usar `transformers` con PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haifald/vit-eurosat-landcover | ViT | no disponible | no aplica | no disponible | Hugging Face |
| Rhodham96/EuroSatCNN | CNN | no disponible | no aplica | no disponible | Hugging Face |
| MallikarjunJadi/eurosat-land-cover-models | no especificado | no disponible | no aplica | no disponible | Hugging Face |

No se dispone de datos de rendimiento para comparar. El modelo de Haifald es un ViT, mientras que el de Rhodham96 es una CNN, pero sin métricas no se puede establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- La model card no proporciona información sobre sesgos, riesgos o limitaciones. Se desconoce si el modelo tiene sesgos geográficos (entrenado solo con imágenes de Europa) o de resolución espacial.
- Riesgo de alucinación: no aplica directamente, pero el modelo puede clasificar incorrectamente imágenes fuera de la distribución de EuroSAT (por ejemplo, imágenes de otras regiones o con diferentes condiciones atmosféricas).
- Limitaciones de contexto: al ser un modelo de visión, no procesa texto ni mantiene contexto conversacional.
- Restricciones de licencia: al no especificarse licencia, no se puede garantizar su uso comercial. Se recomienda contactar con el autor antes de utilizarlo en producción.
- La ausencia de benchmarks y de detalles de entrenamiento impide evaluar su fiabilidad. Cualquier uso en producción debe ir precedido de una validación exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haifald/vit-eurosat-landcover
- Repositorio de referencia (fine-tuning similar): https://github.com/aedriansagap/vit-eurosat
- Paper de ViT (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
- Dataset EuroSAT (referencia): https://github.com/phelber/EuroSAT (no confirmado en la búsqueda, pero es el dataset estándar)
