# joelmontavon/fhir4px-embeddings-onnx

## Resumen

El repositorio `joelmontavon/fhir4px-embeddings-onnx` contiene versiones preconvertidas a formato ONNX de modelos de embeddings utilizados por el proyecto fhir4px para la categorización automática de datos clínicos en el estándar FHIR (nivel Tier 3). El modelo principal es una adaptación de `NeuML/pubmedbert-base-embeddings`, que a su vez se basa en Microsoft PubMedBERT, fine-tuned para similitud de frases en pares título-resumen de artículos de PubMed. La conversión a ONNX permite ejecutar el modelo en entornos JavaScript (navegador o Node.js) mediante la librería `@huggingface/transformers`, sin necesidad de un backend Python.

Además de los pesos del modelo, el repositorio incluye centroides precomputados para tres tareas de clasificación específicas (categoría de observación, tipo de alergia y tipo de visita), lo que simplifica el despliegue en producción al evitar el cálculo de prototipos en tiempo de ejecución. Con un tamaño total de 0.6 GB, la versión cuantizada a int8 ocupa solo 105 MB, lo que lo hace adecuado para entornos con recursos limitados.

La relevancia de este modelo radica en su enfoque práctico: ofrece una solución lista para usar en aplicaciones de procesamiento de historias clínicas electrónicas, con una licencia permisiva (Apache 2.0 en el modelo base) y un formato optimizado para integración web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (PubMedBERT base) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (416 MB) e int8 dinámico (105 MB) |
| Idiomas soportados | no disponible (probablemente inglés biomédico) |
| Licencia | No especificada en el repo; modelo base bajo Apache 2.0 |
| Formato de pesos | ONNX (`.onnx`) |

## Arquitectura y entrenamiento

El modelo subyacente es PubMedBERT, una variante de BERT preentrenada específicamente sobre literatura biomédica. El repositorio `NeuML/pubmedbert-base-embeddings` fue fine-tuned para generar embeddings de frases mediante entrenamiento con pares título-resumen de PubMed, optimizando la similitud coseno. La conversión a ONNX no modifica la arquitectura original; simplemente exporta los pesos y la gráfica de cómputo al formato interoperable de ONNX, manteniendo la misma estructura de atención y capas.

No se proporcionan detalles sobre el número de tokens de entrenamiento, el dataset exacto ni el proceso de fine-tuning (si se usó RLHF, DPO, etc.). La información disponible se limita a la descripción de la conversión y a la generación de centroides, que se calculan con el modelo cuantizado int8, aplicando mean pooling con máscara de atención y normalización L2.

## Capacidades

- Generación de embeddings de frases de 768 dimensiones, normalizados L2, aptos para similitud semántica.
- Clasificación mediante centroides precomputados para tres tareas específicas: categoría de observación (lab/vital/other), tipo de alergia (medication/food/environmental/other) y tipo de visita (inpatient/outpatient/emergency/telehealth/procedure).
- Ejecución en navegador o Node.js gracias a la integración con `@huggingface/transformers` y el formato ONNX.
- Soporte de cuantización dinámica int8 para reducir el uso de memoria y acelerar la inferencia en CPU.
- Compatibilidad con el estándar ONNX, lo que permite su uso con múltiples runtimes (ONNX Runtime, WebAssembly, etc.).

## Casos de uso

- Categorización de observaciones clínicas: el modelo clasifica automáticamente registros de observación (p. ej., "Hemoglobin A1c", "Glucose") en categorías como lab, vital u other, facilitando la estructuración de datos FHIR.
- Clasificación de tipos de alergia: identifica si una alergia registrada es a medicamentos, alimentos, ambiental u otras, útil para alertas clínicas y gestión de pacientes.
- Tipificación de visitas médicas: distingue entre consulta ambulatoria, hospitalización, urgencia, telemedicina o procedimiento, lo que permite segmentar y analizar la actividad asistencial.
- Búsqueda semántica en historiales clínicos: los embeddings generados pueden indexarse y consultarse para encontrar registros similares, por ejemplo, para estudios retrospectivos.
- Integración en pipelines FHIR sin backend pesado: al ejecutarse en el navegador, permite procesar datos localmente en aplicaciones web de gestión sanitaria, reduciendo costes de infraestructura.
- Prototipado rápido de sistemas de clasificación: los centroides precomputados permiten implementar un clasificador funcional con pocas líneas de código, ideal para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el modelo ofrece "best accuracy on fhir4px categorization tasks" en comparación con alternativas, pero no se aportan cifras concretas. Tampoco se incluyen métricas como MMLU, HumanEval o similares, dado que el modelo está especializado en embeddings de dominio médico.

## Requisitos de hardware

- La versión fp32 ocupa 416 MB; la versión int8 cuantizada ocupa 105 MB, por lo que puede ejecutarse en CPU sin necesidad de GPU.
- Es adecuado para dispositivos con memoria limitada, como portátiles o incluso navegadores móviles (aunque el rendimiento dependerá del dispositivo).
- No se requiere una GPU específica; la inferencia puede realizarse con ONNX Runtime o a través de transformers.js en WebAssembly.
- Para despliegues en servidor, puede usarse ONNX Runtime con CPU; no hay datos de latencia o throughput en la documentación.
- Opciones de despliegue: `@huggingface/transformers` (JavaScript), ONNX Runtime (Python, C++, etc.), o cualquier runtime compatible con ONNX.

## Comparativa con modelos similares

La model card menciona una comparación con `gte-modernbert-base` (versión cuantizada q8), indicando que el modelo de este repositorio es más pequeño (105 MB frente a 143 MB) y ofrece mejor precisión en las tareas de fhir4px. Sin embargo, no se proporcionan datos numéricos de rendimiento.

| Modelo | Tamaño (int8) | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|
| `fhir4px-embeddings-onnx` (PubMedBERT) | 105 MB | no disponible | Apache 2.0 (base) | Embeddings médicos y clasificación FHIR |
| `gte-modernbert-base` | 143 MB | no disponible | no disponible | Embeddings generales |
| `NeuML/pubmedbert-base-embeddings` (original) | no disponible | no disponible | Apache 2.0 | Embeddings biomédicos |

No hay información adicional sobre otros modelos comparables en el mismo dominio.

## Limitaciones y advertencias

- El repositorio no declara una licencia explícita; aunque el modelo base es Apache 2.0, el usuario debe verificar los términos antes de uso comercial.
- Los centroides precomputados están diseñados únicamente para las tres tareas indicadas; no son generalizables a otras clasificaciones.
- El modelo está especializado en terminología médica en inglés; su rendimiento en otros idiomas o dominios no está garantizado.
- No se proporcionan datos sobre sesgos o alucinaciones; al ser un modelo de embeddings, no genera texto, por lo que el riesgo de alucinación es menor, pero la calidad de los embeddings puede verse afectada por el dominio de entrenamiento.
- La ausencia de benchmarks públicos dificulta la evaluación objetiva de su precisión en comparación con alternativas.
- El repositorio tiene muy pocas descargas (8) y no hay indicios de mantenimiento activo, lo que puede implicar falta de soporte.

## Enlaces

- Repositorio HuggingFace: [joelmontavon/fhir4px-embeddings-onnx](https://huggingface.co/joelmontavon/fhir4px-embeddings-onnx)
- Modelo base original: [NeuML/pubmedbert-base-embeddings](https://huggingface.co/NeuML/pubmedbert-base-embeddings)
- Documentación de ONNX: [https://github.com/onnx/onnx](https://github.com/onnx/onnx)
