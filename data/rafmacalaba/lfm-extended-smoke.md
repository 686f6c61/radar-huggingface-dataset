# rafmacalaba/lfm-extended-smoke

## Resumen

El modelo `rafmacalaba/lfm-extended-smoke` es un modelo de clasificación de tokens (token-classification) publicado en HuggingFace por el usuario `rafmacalaba`. Según las etiquetas asociadas, está orientado a tareas de reconocimiento de entidades nombradas (NER) en el ámbito biomédico, con etiquetas como `ner`, `bio` y `data-use`. El nombre sugiere que podría ser una extensión de un modelo base denominado "lfm" (posiblemente *Large Foundation Model*), aunque no se dispone de documentación oficial que lo confirme.

El modelo se publicó el 15 de agosto de 2026 y no registra descargas ni valoraciones en el momento de la consulta. La licencia indicada en las etiquetas es Apache 2.0, aunque el campo de licencia en la ficha de HuggingFace figura como "no disponible". No se proporcionan detalles sobre arquitectura, tamaño, contexto, idiomas soportados ni proceso de entrenamiento, lo que limita considerablemente cualquier evaluación técnica rigurosa.

Dada la ausencia de información pública, esta ficha se limita a reflejar los datos disponibles y señala explícitamente las carencias. Se recomienda contactar con el autor o consultar el repositorio asociado antes de considerar su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (formato de pesos declarado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (según etiqueta) / no disponible (según campo oficial) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo (transformer, MoE, SSM, etc.), el número de parámetros, la composición del dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. Las etiquetas `ner`, `bio` y `data-use` sugieren que el modelo está especializado en reconocimiento de entidades biomédicas, pero no hay datos que permitan confirmar el diseño técnico subyacente.

## Capacidades

- Clasificación de tokens para tareas de reconocimiento de entidades nombradas (NER), según el pipeline declarado (`token-classification`).
- Posible especialización en dominios biomédicos (etiquetas `bio` y `data-use`), aunque sin documentación que lo detalle.
- No se dispone de información sobre capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes o multilingüismo.

## Casos de uso

Dada la ausencia de documentación y de resultados, no es posible enumerar casos de uso concretos y verificables. En principio, un modelo de token-classification con etiquetas biomédicas podría emplearse en:

- Extracción de entidades en textos clínicos y literatura científica.
- Anotación automática de informes médicos para sistemas de información hospitalaria.
- Enriquecimiento de bases de datos de investigación con entidades biológicas.

Sin embargo, ninguna de estas aplicaciones puede recomendarse sin conocer el rendimiento real del modelo, sus datos de entrenamiento o sus limitaciones. Se desaconseja su uso en producción hasta que se publique información técnica suficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni ninguna otra métrica de evaluación.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware. Al desconocer el número de parámetros y la arquitectura, no es posible estimar VRAM necesaria, GPUs recomendadas, opciones de despliegue ni latencia. El formato de pesos safetensors es compatible con frameworks como Transformers, pero no se puede concretar nada más.

## Comparativa con modelos similares

No es posible establecer una comparativa rigurosa sin datos técnicos del modelo. Se desconoce su tamaño, arquitectura y rendimiento. Modelos NER biomédicos conocidos como BioBERT, PubMedBERT o SciSpacy podrían servir de referencia, pero no existe información que permita contrastar parámetros, contexto o resultados con `lfm-extended-smoke`.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: arquitectura, parámetros, datos de entrenamiento y evaluación no están disponibles.
- No hay resultados de benchmarks ni métricas de calidad, por lo que se desconoce su precisión, recall o F1 en tareas NER.
- Riesgo de sesgos y alucinaciones no evaluado al no existir estudios ni informes.
- La licencia es ambigua: la etiqueta indica Apache 2.0, pero el campo oficial dice "no disponible". Se recomienda verificar los términos de uso antes de cualquier aplicación comercial.
- El modelo no tiene descargas ni valoraciones, lo que sugiere una adopción nula y una validación comunitaria inexistente.
- No se especifican idiomas soportados ni dominio de aplicación confirmado.
- Cualquier uso en producción conlleva un riesgo elevado debido a la falta de información verificable.

## Enlaces

- [Página del modelo en HuggingFace](https://huggingface.co/rafmacalaba/lfm-extended-smoke)
