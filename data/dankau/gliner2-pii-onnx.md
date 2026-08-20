# DanKau/gliner2-pii-onnx

## Resumen

El modelo `DanKau/gliner2-pii-onnx` es una exportación no oficial a formato ONNX del modelo `fastino/gliner2-privacy-filter-PII-multi`, desarrollado por el usuario DanKau. Se trata de un modelo de reconocimiento de entidades nombradas (NER) zero-shot y clasificación de texto basado en GLiNER2, una arquitectura de transformer diseñada para identificar entidades sin necesidad de entrenamiento específico por dominio. Su propósito principal es la detección de información personal identificable (PII) en textos, como nombres, organizaciones o ubicaciones, mediante etiquetas definidas en tiempo de inferencia.

La relevancia de este modelo radica en que elimina la dependencia de PyTorch para su ejecución, ya que utiliza ONNX Runtime, lo que facilita su integración en entornos de producción ligeros, con soporte para aceleración por GPU mediante CUDA y precisión FP32/FP16. El repositorio tiene un tamaño de 1,2 GB y se distribuye bajo licencia Apache 2.0, heredada del modelo base. Al ser una versión experimental, su API puede cambiar entre versiones y no incluye todas las funcionalidades del GLiNER2 original, como la exportación a JSON.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER2 (transformer para NER zero-shot) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la librería soporta FP32 y FP16, pero no se confirma para este modelo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna, el número de parámetros o los datos de entrenamiento en la model card proporcionada. Se sabe que el modelo es una conversión a ONNX del original `fastino/gliner2-privacy-filter-PII-multi`, que a su vez se basa en GLiNER2, una arquitectura de transformer especializada en NER zero-shot. GLiNER2 utiliza embeddings de etiquetas y texto para identificar entidades sin necesidad de ajuste fino por dominio, pero los detalles específicos de capas, atención o proceso de entrenamiento no están documentados en esta ficha.

La conversión a ONNX se realizó sin modificar los pesos ni el comportamiento del modelo, según indica el autor. La librería `gliner2-onnx` permite ejecutar el modelo con ONNX Runtime, soportando precisión FP32 y FP16, y aceleración por CUDA. No se mencionan innovaciones técnicas adicionales más allá de la propia conversión de formato.

## Capacidades

- Reconocimiento de entidades nombradas (NER) zero-shot: permite extraer entidades como personas, organizaciones o ubicaciones definiendo las etiquetas en tiempo de ejecución.
- Clasificación de texto single-label: asigna una única categoría a un texto dado, devolviendo la etiqueta con mayor probabilidad.
- Clasificación de texto multi-label: permite asignar múltiples categorías a un mismo texto, con umbral de probabilidad configurable.
- Ejecución sin PyTorch: funciona únicamente con ONNX Runtime, lo que reduce dependencias y facilita el despliegue en entornos ligeros.
- Soporte de precisión FP16: reduce el uso de memoria y acelera la inferencia en GPUs compatibles.
- Aceleración por GPU mediante CUDA: se puede seleccionar el proveedor de ejecución CUDA para mejorar el rendimiento.

## Casos de uso

- Anonimización de datos personales en documentos: el modelo puede identificar nombres, direcciones u organizaciones en textos legales o médicos para su posterior redacción, cumpliendo normativas como el GDPR.
- Filtrado de información sensible en logs de aplicaciones: se puede integrar en pipelines de logging para detectar y enmascarar PII antes de almacenar o enviar los registros a servicios externos.
- Clasificación de tickets de soporte: mediante clasificación single-label o multi-label, se pueden categorizar automáticamente las solicitudes de atención al cliente por tema (facturación, incidencias, etc.).
- Moderación de contenido en foros o redes sociales: permite detectar y etiquetar mensajes que contengan datos personales, facilitando su revisión o eliminación.
- Extracción de entidades en motores de búsqueda: se puede usar para indexar documentos por entidades (personas, lugares, empresas) sin necesidad de entrenar un modelo específico.
- Preprocesamiento de datos para pipelines de NLP: al ser zero-shot, sirve como paso previo para enriquecer datasets con etiquetas de entidades antes de entrenar otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este modelo, ni comparaciones con alternativas similares.

## Requisitos de hardware

- Al ser un modelo ONNX, puede ejecutarse en CPU con ONNX Runtime, aunque el rendimiento dependerá del hardware.
- Para aceleración por GPU, se requiere una GPU compatible con CUDA y la instalación de `onnxruntime-gpu`.
- El tamaño del repositorio es de 1,2 GB, lo que sugiere que el modelo puede cargarse en memoria con al menos 2-4 GB de RAM, pero no se especifica la VRAM necesaria.
- No se dispone de datos sobre latencia o throughput estimados.
- Opciones de despliegue: se puede integrar en aplicaciones Python mediante la librería `gliner2-onnx`, o en entornos Node.js mediante `@lmoe/gliner-onnx.js`.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría. No se conocen modelos equivalentes en formato ONNX con capacidades de NER zero-shot y detección de PII en el momento de redactar esta ficha.

## Limitaciones y advertencias

- Es una versión experimental: la API puede cambiar entre versiones y no se garantiza estabilidad.
- No soporta exportación a JSON, a diferencia del GLiNER2 original.
- No se han documentado los idiomas soportados, por lo que su rendimiento en lenguas distintas al inglés no está confirmado.
- Al ser una conversión no oficial, no se garantiza que el comportamiento sea idéntico al modelo base en todos los casos.
- No se dispone de información sobre sesgos o riesgos de alucinación específicos, pero al ser un modelo de NER, puede fallar en la identificación de entidades poco comunes o en contextos ambiguos.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base para confirmar cualquier restricción adicional.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/DanKau/gliner2-pii-onnx)
- [Modelo base: fastino/gliner2-privacy-filter-PII-multi](https://huggingface.co/fastino/gliner2-privacy-filter-PII-multi)
- [Repositorio de GLiNER2 (fastino-ai)](https://github.com/fastino-ai/GLiNER2)
- [Librería gliner2-onnx (referencia en la model card)](https://github.com/lmoe/gliner2-onnx)
- [Librería JavaScript/TypeScript @lmoe/gliner-onnx.js](https://github.com/lmoe/gliner-onnx.js)
