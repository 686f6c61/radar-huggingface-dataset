# ducvh5/wan21-a5b5x4c5-tf-fm-tm-ln2-u5-qt-fw-hd-item-empty

## Resumen

Este repositorio contiene un checkpoint experimental derivado de Wan2.1-T2V-1.3B, el modelo de generación de vídeo a partir de texto desarrollado por Alibaba Wan-AI. El autor, ducvh5, ha aplicado una modificación arquitectónica descrita como "recurrent-transformer" con una estructura de bloques A5 → B5×4 → C5, lo que resulta en 15 bloques únicos y 30 bloques ejecutados. Se trata, por tanto, de un fine-tuning con alteraciones estructurales sobre el modelo base, no de un modelo nuevo entrenado desde cero.

La model card es extremadamente escueta y críptica: emplea abundantes siglas sin desarrollar (TF, FM, TM, OV, QT, VB, FW-HD, LN2, U5) y no documenta ni la licencia, ni los idiomas, ni el número de parámetros, ni los resultados de evaluación. El campo más relevante es la nota "Archive: no checkpoint saved", que indica que el repositorio no contiene pesos utilizables en la fecha del snapshot (2026-11-02). El interés de esta ficha es, por tanto, principalmente documental: sirve para registrar la existencia de una variante experimental y para advertir a desarrolladores e investigadores de que no deben esperar un modelo desplegable.

El modelo base, Wan2.1-T2V-1.3B, sí es un sistema consolidado de difusión para text-to-video con 1.300 millones de parámetros, pensado para generar clips cortos a partir de descripciones textuales. Cualquier evaluación práctica de esta variante debería remitirse al comportamiento del modelo original, ya que la información publicada sobre el derivado no permite validar su rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Recurrent transformer sobre difusión (base: Wan2.1-T2V-1.3B-Diffusers); estructura A5 → B5×4 → C5, 15 bloques únicos / 30 ejecutados |
| Parámetros totales | no disponible (el modelo base Wan2.1-T2V-1.3B tiene 1.300 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible; la model card indica "no checkpoint saved" |

## Arquitectura y entrenamiento

La model card describe el modelo como un "recurrent-transformer" construido sobre Wan2.1-T2V-1.3B. La notación A5 → B5×4 → C5 sugiere una secuencia de bloques con repetición interna: cinco bloques de tipo A, seguidos de cuatro repeticiones de un bloque B (o cinco bloques B repetidos cuatro veces, la notación es ambigua) y cinco bloques de tipo C, totalizando 15 bloques únicos que se ejecutan 30 veces. Esta reutilización de bloques es coherente con esquemas de peso compartido o recursión en profundidad, habituales en propuestas para reducir parámetros manteniendo capacidad efectiva.

El entrenamiento combina tres objetivos denotados como TF, FM y TM, con una programación de ruido σ basada en una mezcla de distribución lognormal (q = 0,5 LN(0,1; s=2) + 0,5 U(s=5)) y ratios p_LN2/q para TF y FM, y p_U5/q para TM. Los datos se describen como "OV" con subtítulos "QT" en proporción 50/50 entre VB y completo, y una mezcla 50/50 entre OV y FW-HD por ítem, además de dropout de texto vacío. Ninguna de estas siglas se define en la documentación, por lo que no es posible determinar la composición real del dataset, el número de tokens o pasos de entrenamiento, ni si hubo RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de texto (pipeline text-to-video), heredada del modelo base Wan2.1-T2V-1.3B.
- Generación de clips cortos condicionados por prompts textuales, con la salvedad de que la variante incorpora dropout de texto vacío, lo que sugiere soporte para generación no condicionada.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre recursión en transformers de difusión: el modelo sirve como artefacto de estudio para analizar cómo la estructura A5 → B5×4 → C5 afecta a la calidad de generación frente al Wan2.1 original, siempre que se obtengan pesos utilizables.
- Reproducción de experimentos académicos: útil para grupos que investiguen esquemas de compartición de pesos en modelos de vídeo y quieran replicar la configuración descrita.
- Generación de vídeo promocional de baja resolución: si se recuperasen los pesos, podría emplearse para crear clips cortos de demostración a partir de descripciones textuales, aprovechando la base de 1.300 M de parámetros.
- Prototipado de pipelines text-to-video: integrable en flujos de experimentación con Diffusers, dado que el modelo base es compatible con esa librería.
- Docencia y formación: como ejemplo de model card incompleta y de buenas prácticas de documentación en modelos derivados.
- Auditoría de linaje de modelos: permite rastrear la genealogía de fine-tunings sobre Wan2.1 y estudiar patrones de publicación en HuggingFace.
- No se recomienda su uso en producción dada la ausencia de pesos y de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para esta variante; para el modelo base Wan2.1-T2V-1.3B se sitúa habitualmente en el rango de 8-16 GB en precisión reducida, aunque no se confirma en la documentación proporcionada.
- GPU recomendadas: no disponibles para la variante.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: Diffusers es la vía natural por el formato del modelo base; vLLM, llama.cpp, Ollama y TGI no aplican a modelos de difusión de vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ducvh5/wan21-a5b5x4c5-tf-fm-tm-ln2-u5-qt-fw-hd-item-empty | no disponible | no disponible | no disponible | no disponible | Sin checkpoint guardado |
| Wan-AI/Wan2.1-T2V-1.3B-Diffusers | 1.300 M | no disponible | no disponible en esta ficha | no disponible en esta ficha | Pesos publicados |
| Otros derivados de Wan2.1 | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio no contiene checkpoint: la model card indica explícitamente "no checkpoint saved", por lo que no es posible descargar ni ejecutar el modelo.
- La licencia no está declarada, lo que impide determinar si el uso comercial está permitido; además, la licencia del modelo base Wan2.1 condiciona cualquier uso derivado.
- La documentación emplea siglas sin definir (TF, FM, TM, OV, QT, VB, FW-HD, LN2, U5), lo que hace imposible reproducir el entrenamiento.
- No se especifican idiomas soportados, parámetros totales ni formato de pesos.
- Riesgo elevado de alucinación visual y artefactos en la generación de vídeo, inherente a los modelos de difusión de este tamaño, agravado por la falta de evaluación.
- No hay información sobre sesgos del dataset de entrenamiento.
- El modelo fue creado y actualizado el 2026-11-02, con cero descargas y cero likes, lo que sugiere ausencia de validación por parte de la comunidad.
- No debe emplearse en producción sin una evaluación independiente y sin aclaración de licencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ducvh5/wan21-a5b5x4c5-tf-fm-tm-ln2-u5-qt-fw-hd-item-empty
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
