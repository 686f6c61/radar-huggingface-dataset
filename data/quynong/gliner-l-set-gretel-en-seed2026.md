# quynong/gliner-l-set-gretel-en-seed2026

## Resumen

`quynong/gliner-l-set-gretel-en-seed2026` es un modelo de reconocimiento de entidades nombradas (NER) y detección de información personal identificable (PII) desarrollado por `quynong`. Se trata de un fine-tuning del modelo GLiNER-Large `urchade/gliner_large-v2` sobre el subconjunto en inglés del dataset `quynong/gretel-combined`, utilizando una función de pérdida de consistencia de conjuntos (*set-consistent loss*). El objetivo principal es identificar y extraer datos personales de textos en inglés de forma robusta y consistente.

El repositorio en Hugging Face tiene un tamaño de 1,8 GB y está marcado con las etiquetas `gliner`, `named-entity-recognition`, `pii`, `set-consistent`, `en`. Según la model card, la evaluación del *held-out test split* se realiza después de subir el artefacto, por lo que los resultados de rendimiento no están publicados en el momento de la consulta. La arquitectura base es la del modelo `urchade/gliner_large-v2`, que aporta la capacidad de extraer entidades definidas por prompts.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hereda la arquitectura de `urchade/gliner_large-v2` (GLiNER) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | no disponible |
| Libreria | gliner |
| Modelo base | urchade/gliner_large-v2 |
| Tamano del repositorio | 1.8 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del modelo base GLiNER-Large `urchade/gliner_large-v2`, por lo que hereda su arquitectura de extracción de entidades mediante prompts. La información proporcionada no detalla la estructura interna, el número de capas ni los parámetros totales del modelo final.

El entrenamiento se llevó a cabo sobre el subconjunto en inglés del dataset `quynong/gretel-combined`, un conjunto de datos orientado a la detección de PII. La innovación técnica destacada en la model card es el uso de *set-consistent loss*, una función de pérdida diseñada para mantener la consistencia de las predicciones cuando las entidades se consideran como conjuntos. No se mencionan fases de RLHF, DPO ni otras técnicas de alineación. La evaluación del *held-out test split* se realiza una vez subido el artefacto a Hugging Face, lo que indica que los resultados de validación aún no se han publicado en la documentación disponible.

## Capacidades

- Detección de información personal identificable (PII): el modelo está especializado en identificar entidades como nombres, direcciones, emails, números de teléfono, entre otros, en textos en inglés.
- Extracción de entidades personalizadas mediante prompts: al estar basado en GLiNER, es posible definir listas de tipos de entidades arbitrarias en tiempo de inferencia, sin necesidad de reentrenar.
- Predicción consistente de conjuntos de entidades: la pérdida *set-consistent* está orientada a mejorar la coherencia de las predicciones cuando hay múltiples entidades o solapamientos.
- Capacidades multilingües: no disponibles. El modelo está entrenado y documentado únicamente para el idioma inglés (`en`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión, audio o code generation: no disponibles.

## Casos de uso

- Anonimización de documentos para cumplimiento del RGPD: el modelo puede usarse para localizar todos los campos de PII en contratos, correos o formularios y reemplazarlos por marcadores anónimos. Su naturaleza GLiNER permite definir qué tipos de entidades deben detectarse sin depender de etiquetas fijas.
- Limpieza de datasets de entrenamiento: antes de entrenar otros modelos de lenguaje, se puede aplicar este modelo para eliminar o enmascarar datos personales de grandes volúmenes de texto en inglés, reduciendo riesgos de fuga de información.
- Monitorización de logs de aplicaciones: en sistemas de producción, los logs pueden contener emails, IPs o nombres de usuario. El modelo permite etiquetar estos campos automáticamente para alertar o filtrar antes de que lleguen a sistemas de análisis.
- Extracción de datos de clientes en atención al soporte: dado que soporta prompts, se pueden definir entidades como `customer_id`, `email`, `address` o `product_reference` y extraerlas de conversaciones para integrarlas en un CRM.
- Cumplimiento normativo en el sector salud: utilizado para identificar información de salud protegida (PHI) en documentos clínicos, historiales o notas médicas, ayudando a evitar sanciones por manejo incorrecto de datos sensibles.
- Investigación de fraudes: en textos como reclamaciones o correos internos, el modelo puede detectar identidades, números de cuenta y otros datos personales que sirvan como pistas en investigaciones forenses.
- Enriquecimiento de bases de conocimiento: mediante prompts específicos, se pueden extraer entidades de noticias o artículos en inglés y poblarlas en bases de datos estructuradas sin entrenamiento adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que el *held-out test split* se evalúa solo después de que el artefacto se suba a Hugging Face, por lo que no existen métricas verificables de precisión, recall ni F1 para este modelo en el momento de la consulta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible. El repositorio tiene un tamaño de 1,8 GB, pero no se especifica el tamaño de los pesos en memoria.
- Opciones de despliegue: no se han documentado. Al tratarse de un modelo basado en la librería `gliner` y PyTorch, puede ejecutarse en Python con la librería `gliner`, pero no se indican configuraciones para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de modelos comparables en la documentación revisada. Existe un modelo relacionado de la misma autoría, `quynong/gliner2-gretelpii-lora`, también orientado a PII, pero no se han publicado datos que permitan una comparación técnica rigurosa. El modelo base `urchade/gliner_large-v2` es la referencia original, pero representa una versión generalista sin el ajuste específico para PII ni la pérdida *set-consistent*.

## Limitaciones y advertencias

- Sesgos conocidos: no se han evaluado ni documentado sesgos para este modelo.
- Riesgo de alucinación: como todo modelo de NER, puede producir falsos positivos al etiquetar texto no relevante como PII, especialmente fuera de su dominio de entrenamiento.
- Limitaciones de idioma: el modelo solo soporta inglés, por lo que no puede utilizarse para textos en castellano u otros idiomas.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede garantizar el uso comercial o la redistribución sin consultar al autor.
- Ausencia de benchmarks: al no existir métricas publicadas, el rendimiento real del modelo no está validado de forma independiente.
- Evaluación pendiente: el *test split* se evalúa después de la publicación, lo que significa que los resultados documentados podrían cambiar o no reflejar el rendimiento final.
- Generalización limitada: el fine-tuning se realizó sobre el dataset `gretel-combined`, por lo que el modelo puede no ser efectivo en dominios con vocabulario o formatos de PII muy diferentes.

## Enlaces

- Página del modelo en Hugging Face: [https://huggingface.co/quynong/gliner-l-set-gretel-en-seed2026](https://huggingface.co/quynong/gliner-l-set-gretel-en-seed2026)
- Modelo base `urchade/gliner_large-v2`: [https://huggingface.co/urchade/gliner_large-v2](https://huggingface.co/urchade/gliner_large-v2)
- Modelo relacionado de la misma autoría: [https://huggingface.co/quynong/gliner2-gretelpii-lora](https://huggingface.co/quynong/gliner2-gretelpii-lora)
- La búsqueda web no ha aportado papers, blogs ni demos adicionales relevantes.
