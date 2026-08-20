# DanKau/gliner2-multi-v1-onnx

## Resumen

El modelo `DanKau/gliner2-multi-v1-onnx` es una exportación no oficial a formato ONNX del modelo `fastino/gliner2-multi-v1`, desarrollado por el usuario DanKau. Se trata de un modelo de reconocimiento de entidades nombradas (NER) y clasificación de texto con capacidad zero-shot, es decir, puede identificar entidades y clasificar textos sin necesidad de entrenamiento previo para dominios específicos, simplemente definiendo las etiquetas en el momento de la inferencia.

La principal ventaja de esta versión es que elimina la dependencia de PyTorch, ya que se ejecuta mediante ONNX Runtime, lo que facilita su despliegue en entornos ligeros, embebidos o con restricciones de dependencias. El repositorio ocupa 1,2 GB e incluye soporte para precisión FP32 y FP16, así como aceleración por GPU mediante CUDA. La licencia es Apache 2.0, heredada del modelo base.

Aunque se trata de una build experimental y la API puede cambiar, el modelo resulta relevante para desarrolladores que necesitan integrar capacidades de NER y clasificación zero-shot en aplicaciones de producción sin el overhead de un framework completo de deep learning.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER2 (arquitectura no especificada en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32, FP16 |
| Idiomas soportados | no disponible (el nombre "multi" sugiere multilingüe, pero no se confirma) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo ni sobre su proceso de entrenamiento. El modelo es una conversión directa de `fastino/gliner2-multi-v1` a formato ONNX, sin modificaciones en los pesos ni en el comportamiento. GLiNER2 es un modelo de NER zero-shot basado en transformers, pero no se especifican detalles como el número de capas, la dimensión de los embeddings o el dataset de entrenamiento en la documentación proporcionada.

La conversión se realizó mediante la herramienta de exportación incluida en el repositorio `gliner2-onnx`, que permite generar versiones FP32 y FP16. No se menciona el uso de técnicas como RLHF, DPO o decodificación especulativa.

## Capacidades

- Reconocimiento de entidades nombradas (NER) zero-shot: permite extraer entidades de un texto definiendo las etiquetas en tiempo de ejecución, sin necesidad de fine-tuning.
- Clasificación de texto: soporta clasificación single-label y multi-label, con umbral configurable para la activación de etiquetas.
- Ejecución sin PyTorch: utiliza ONNX Runtime, lo que reduce dependencias y facilita el despliegue en entornos con restricciones.
- Precisión FP32 y FP16: se puede elegir la precisión según los requisitos de memoria y rendimiento.
- Aceleración por GPU mediante CUDA: compatible con `CUDAExecutionProvider` de ONNX Runtime.
- No soporta exportación a JSON: según la documentación, esta funcionalidad no está implementada en la librería `gliner2-onnx`.

## Casos de uso

- Extracción de entidades en textos legales: el modelo puede identificar nombres de personas, organizaciones, fechas y lugares en contratos o sentencias, definiendo las etiquetas específicas del dominio sin necesidad de entrenar un modelo propio.
- Clasificación de tickets de soporte técnico: permite categorizar automáticamente las incidencias de los usuarios en etiquetas como "hardware", "software", "facturación", etc., mediante clasificación multi-label con umbral ajustable.
- Análisis de redes sociales: extracción de menciones de marcas, productos o personas en publicaciones de Twitter o Facebook, útil para monitorización de marca.
- Procesamiento de currículos (CV): identificación de habilidades, experiencia laboral y formación académica en currículos de candidatos, facilitando la preselección en procesos de RRHH.
- Clasificación de correos electrónicos: separación automática de correos en categorías como "urgente", "spam", "newsletter" o "tarea", mediante clasificación single-label.
- Extracción de entidades en artículos científicos: reconocimiento de nombres de autores, instituciones, organismos o compuestos químicos en publicaciones académicas, con etiquetas personalizadas según el campo de estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 1,2 GB, por lo que se necesita al menos ese espacio en disco para descargar el modelo.
- Memoria RAM: no se especifica, pero al ser un modelo ONNX, la memoria dependerá de la precisión elegida (FP32 o FP16) y de la longitud de los textos procesados.
- GPU: compatible con CUDA, pero no se indican requisitos mínimos de VRAM. Se recomienda probar con GPUs de gama media (p. ej., RTX 3060 o superior) para FP16.
- CPU: puede ejecutarse en CPU con ONNX Runtime, aunque el rendimiento será menor que con GPU.
- Opciones de despliegue: se puede integrar en aplicaciones Python mediante la librería `gliner2-onnx`, o en entornos Node.js mediante `@lmoe/gliner-onnx.js`. No se menciona compatibilidad con vLLM, Ollama o TGI.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos. Existen otros modelos GLiNER2 como `gliner2-large-v1` o `gliner2-base-v1`, pero no se proporcionan datos de rendimiento ni especificaciones detalladas en la documentación de este repositorio.

## Limitaciones y advertencias

- Es una build experimental y no oficial: la conversión a ONNX puede no estar optimizada y la API de la librería `gliner2-onnx` puede cambiar en futuras versiones.
- No soporta exportación a JSON: la funcionalidad de exportación de resultados en formato JSON no está implementada, lo que puede limitar su uso en pipelines que requieran ese formato.
- No se especifican sesgos conocidos ni riesgos de alucinación, pero al ser un modelo de NER, puede presentar errores en la identificación de entidades ambiguas o en dominios muy especializados.
- La licencia Apache 2.0 permite uso comercial, pero se debe respetar la atribución y las condiciones de la licencia del modelo base.
- No se garantiza el rendimiento en producción: al ser una conversión experimental, es recomendable validar el modelo en el caso de uso concreto antes de desplegarlo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/DanKau/gliner2-multi-v1-onnx)
- [Modelo base: fastino/gliner2-multi-v1](https://huggingface.co/fastino/gliner2-multi-v1)
- [Repositorio GLiNER2 original](https://github.com/fastino-ai/GLiNER2)
- [Repositorio gliner2-onnx](https://github.com/lmoe/gliner2-onnx)
- [Librería JavaScript/TypeScript](https://github.com/lmoe/gliner-onnx.js)
