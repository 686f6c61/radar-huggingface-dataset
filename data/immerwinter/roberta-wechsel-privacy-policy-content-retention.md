# Immerwinter/roberta-wechsel-privacy-policy-content-retention

## Resumen

El modelo `Immerwinter/roberta-wechsel-privacy-policy-content-retention` es un clasificador de texto monolingüe en alemán, desarrollado por el usuario Immerwinter como parte del pipeline DeepPrivacy, un sistema modular para el análisis automático de políticas de privacidad. Su función específica es identificar y clasificar oraciones relacionadas con la retención de datos (content retention) dentro de documentos legales, asignándolas a una de doce categorías como `StorageDuration`, `StatutoryRetention`, `CloudStorage` o `NotRetention`. Se trata de un fine-tuning del modelo `benjamin/roberta-base-wechsel-german`, que a su vez adapta la arquitectura RoBERTa al alemán mediante la técnica WECHSEL de sustitución de embeddings.

El modelo está entrenado sobre 4003 oraciones anotadas manualmente y reporta un F1 macro de 0.872 y un F1 micro de 0.894 en la tarea de clasificación. Con 124,6 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware modesto, lo que lo hace práctico para tareas de procesamiento de documentos legales en entornos con recursos limitados. Su licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas, aunque su ámbito está restringido al idioma alemán.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (RoBERTa) con embeddings WECHSEL para alemán |
| Parametros totales | 124.654.091 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (típico de RoBERTa base: 512 tokens, no confirmado) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Alemán (de) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `roberta-base-wechsel-german`, una variante de RoBERTa base adaptada al alemán mediante el método WECHSEL, que reemplaza los embeddings de subpalabras del modelo original por otros entrenados sobre un vocabulario alemán, manteniendo el resto de la arquitectura. RoBERTa es un transformer encoder-only con atención bidireccional, preentrenado con objetivos de enmascarado de tokens y predicción de siguiente oración (aunque RoBERTa elimina esta última). El fine-tuning se realizó sobre un conjunto de 4003 oraciones anotadas manualmente, extraídas de políticas de privacidad en alemán, con el objetivo de clasificar cada oración en una de doce categorías relacionadas con la retención de datos. No se menciona el uso de RLHF ni DPO; el entrenamiento es un ajuste supervisado estándar para clasificación de secuencias. El modelo se integra en un pipeline más amplio (DeepPrivacy) que descompone el análisis de políticas de privacidad en tareas de contexto, tema y contenido, siendo este módulo el encargado específicamente del aspecto de retención.

## Capacidades

- Clasificación de texto: asigna cada oración a una de las siguientes categorías: `ByThirdParty`, `CloudStorage`, `Country`, `CustomerAcquisition`, `DataType`, `LegalBasisDuration`, `LocalStorage`, `Necessity`, `NotRetention`, `StatutoryRetention`, `StorageDuration` y `Other`.
- Análisis de políticas de privacidad en alemán: identifica afirmaciones sobre periodos de retención, bases legales, almacenamiento en la nube, retención obligatoria por ley, y otros aspectos relacionados.
- Procesamiento de documentos legales: puede extraer información estructurada de textos no estructurados, útil para cumplimiento normativo (RGPD).
- Monolingüe alemán: no soporta otros idiomas.
- No generativo: es un modelo encoder, no genera texto libre, solo produce etiquetas de clasificación.
- Sin soporte de tool calling ni agentes: su uso se limita a inferencia de clasificación por lotes.

## Casos de uso

- Auditoría de cumplimiento RGPD: una empresa alemana puede analizar automáticamente sus políticas de privacidad para verificar si declaran correctamente los periodos de retención de datos personales, usando el modelo para extraer las oraciones relevantes y clasificarlas en categorías como `StatutoryRetention` o `StorageDuration`.
- Comparación de políticas de privacidad: un investigador puede procesar un corpus de políticas de privacidad de distintos sitios web alemanes para comparar cómo varían las prácticas de retención entre sectores, identificando patrones mediante la clasificación de oraciones.
- Extracción de información para bases de datos legales: un proveedor de servicios jurídicos puede convertir políticas de privacidad en texto plano en registros estructurados con campos como "periodo de retención", "base legal" o "almacenamiento en la nube", facilitando búsquedas y análisis posteriores.
- Monitorización de cambios en políticas de privacidad: una organización puede ejecutar el modelo sobre versiones anteriores y actuales de sus documentos para detectar modificaciones en las cláusulas de retención, generando alertas cuando cambia la categoría de una oración.
- Preparación de datos para modelos de lenguaje generativos: las etiquetas producidas por este clasificador pueden servir como anotaciones para entrenar o evaluar modelos más grandes que generen resúmenes o respuestas sobre políticas de privacidad en alemán.
- Soporte a equipos legales en la redacción de políticas: un abogado puede usar el modelo para revisar borradores de políticas de privacidad y verificar si todas las secciones de retención están presentes y correctamente formuladas, identificando oraciones que caen en categorías como `NotRetention` o `Necessity`.

## Benchmarks y rendimiento

La model card reporta las siguientes métricas para la tarea de clasificación, sin comparación con otros modelos:

| Metrica | Valor |
|---|---|
| F1 macro (M-f1) | 0.872 |
| F1 micro (μ-f1) | 0.894 |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser un modelo de 124,6 millones de parámetros, requiere aproximadamente 500 MB de VRAM en precisión fp32 (4 bytes por parámetro), y menos de 200 MB en cuantización de 8 bits.
- Puede ejecutarse en GPUs de consumo como NVIDIA GTX 1060 (6 GB) o superiores, así como en CPUs modernas con suficiente RAM (alrededor de 1-2 GB).
- Es adecuado para despliegue en entornos sin GPU, dado su tamaño reducido.
- Para inferencia por lotes, se puede usar la librería `transformers` de Hugging Face, o herramientas como `ONNX Runtime` para optimización en CPU.
- No se dispone de datos de latencia o throughput específicos, pero al ser un modelo encoder de tamaño medio, la inferencia es rápida: típicamente decenas de milisegundos por oración en GPU y unos cientos en CPU.
- Opciones de despliegue: Hugging Face Inference Endpoints, contenedores Docker con FastAPI, o integración directa en pipelines de procesamiento de texto con `transformers`.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma tarea (clasificación de retención en políticas de privacidad alemanas). El propio pipeline DeepPrivacy incluye otros clasificadores para diferentes aspectos (contexto, tema, audiencia, contacto, etc.), pero no hay métricas comparativas publicadas entre ellos. En cuanto a arquitectura, el modelo base `roberta-base-wechsel-german` es comparable a otros modelos RoBERTa adaptados al alemán, como `bert-base-german-cased` o `gbert-base`, pero no se han encontrado evaluaciones cruzadas en esta tarea específica.

## Limitaciones y advertencias

- Sesgos del dominio: el modelo fue entrenado únicamente con 4003 oraciones anotadas, lo que puede limitar su generalización a variaciones lingüísticas o estilos de redacción no presentes en el conjunto de entrenamiento.
- Riesgo de sobreajuste: dado el tamaño reducido del dataset, es probable que el modelo tenga un rendimiento inferior en oraciones poco comunes o con vocabulario técnico muy específico.
- Alucinación: al ser un clasificador, no genera texto, por lo que el riesgo de alucinación es bajo; sin embargo, puede producir etiquetas incorrectas con alta confianza.
- Limitación de idioma: solo funciona en alemán; no es aplicable a otros idiomas sin reentrenamiento.
- Dependencia del modelo base: el rendimiento está condicionado por la calidad de `roberta-base-wechsel-german`, que a su vez tiene limitaciones propias del preentrenamiento.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, pero no incluye garantías ni responsabilidad del autor.
- Para uso en producción, se recomienda validar el modelo con un conjunto de pruebas propio y considerar un umbral de confianza para evitar clasificaciones erróneas en documentos legales sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Immerwinter/roberta-wechsel-privacy-policy-content-retention
- Modelo base: https://huggingface.co/benjamin/roberta-base-wechsel-german
- Pipeline DeepPrivacy - modelo de contexto: https://huggingface.co/Immerwinter/gbert-large-privacy-policy-context
- Pipeline DeepPrivacy - modelo de tema: https://huggingface.co/Immerwinter/gbert-large-privacy-policy-topic
- Versión en inglés del mismo módulo: https://huggingface.co/Wravn/roberta-privacy-policy-content-retention
- Documentación de RoBERTa en Hugging Face: https://huggingface.co/docs/transformers/model_doc/roberta
