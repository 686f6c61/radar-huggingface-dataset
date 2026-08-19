# hsilvosa/BETO-ATC-Hierarchical-Classifier

## Resumen

El modelo BETO-ATC-Hierarchical-Classifier es un clasificador de texto multietiqueta desarrollado por hsilvosa, basado en el modelo BETO (bert-base-spanish-wwm-cased) de la Universidad de Chile, fine-tuneado para la clasificación jerárquica de códigos ATC (Anatomical Therapeutic Chemical) de medicamentos. A partir de descripciones de fármacos, principios activos, formas farmacéuticas o fragmentos de prospectos en español, el modelo predice la taxonomía ATC completa de cinco niveles, una tarea esencial para la normalización de datos farmacéuticos en investigación y análisis sanitario.

El modelo se entrenó sobre el dataset oficial AEMPS CIMA Research Dataset (hsilvosa/aemps-cima) y se integró con metadatos de contratación pública del dataset hsilvosa/openplacsp. Con aproximadamente 110 millones de parámetros, hereda la arquitectura BERT-base y su ventana de contexto estándar, aunque el dato exacto no se especifica en la documentación disponible. Su licencia Apache-2.0 permite uso comercial y modificación, lo que lo hace atractivo para integraciones en entornos de producción farmacéutica.

La relevancia actual de este modelo radica en la creciente necesidad de estructurar información médica no normalizada en español, especialmente en el ámbito europeo donde el sistema ATC es el estándar para la clasificación de principios activos. Su enfoque jerárquico, en lugar de una clasificación plana, mejora la interpretabilidad y precisión en tareas donde las categorías tienen relaciones padre-hijo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base) con cabeza de clasificación multietiqueta |
| Parametros totales | 109.861.646 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, presumiblemente FP32) |
| Idiomas soportados | Español (es) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre BETO, la versión española de BERT entrenada con la técnica Whole Word Masking (WWM). BETO tiene la misma arquitectura que BERT-base: 12 capas de transformer, 768 dimensiones ocultas y 12 cabezas de atención. La cabeza de clasificación añade una capa lineal sobre la representación del token [CLS] para producir logits sobre el conjunto de códigos ATC, organizados de forma jerárquica en cinco niveles.

El fine-tuning se realizó sobre el dataset AEMPS CIMA, que contiene información estructurada de medicamentos autorizados en España, complementado con metadatos de contratación pública del dataset OpenPLACSP. No se han publicado detalles sobre el número de tokens de entrenamiento, la estrategia de muestreo ni si se aplicaron técnicas de regularización adicionales. La naturaleza jerárquica de la clasificación implica que el modelo aprende a predecir simultáneamente los cinco niveles del código ATC, aprovechando las dependencias entre niveles.

## Capacidades

- Clasificación de textos médicos en español en la taxonomía ATC de cinco niveles (grupo anatómico, subgrupo terapéutico, subgrupo farmacológico, subgrupo químico y sustancia química).
- Acepta como entrada descripciones de medicamentos, principios activos, formas farmacéuticas y fragmentos de prospectos.
- Salida multietiqueta: el modelo asigna probabilidades a cada nivel jerárquico, permitiendo extraer el código ATC completo.
- Soporte para inferencia con la librería transformers estándar de HuggingFace.
- Capacidad de procesamiento por lotes para grandes volúmenes de datos farmacéuticos.
- No es un modelo generativo; no produce texto, solo clasifica.

## Casos de uso

- Normalización de bases de datos farmacéuticas: el modelo puede asignar automáticamente códigos ATC a registros de medicamentos que carecen de esta información, facilitando la interoperabilidad entre sistemas sanitarios.
- Análisis de contratación pública de fármacos: integrado con datos de OpenPLACSP, permite categorizar licitaciones y contratos según el código ATC, útil para estudios de mercado y políticas de compra pública.
- Investigación farmacoepidemiológica: clasificar automáticamente grandes volúmenes de prescripciones o registros de dispensación para estudios de utilización de medicamentos.
- Enriquecimiento de prospectos y fichas técnicas: extraer el código ATC a partir de texto libre en prospectos, reduciendo la intervención manual.
- Detección de inconsistencias en bases de datos existentes: comparar códigos ATC asignados manualmente con las predicciones del modelo para identificar errores de codificación.
- Soporte a sistemas de farmacovigilancia: categorizar reportes de reacciones adversas según el medicamento implicado, agilizando el análisis de señales.

## Benchmarks y rendimiento

Según el model-index declarado por el autor en la model card, el modelo alcanza los siguientes resultados en el dataset AEMPS CIMA Research Dataset:

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| ATC Taxonomy Classification | AEMPS CIMA Research Dataset | Top-1 Accuracy | 0.948 |
| ATC Taxonomy Classification | AEMPS CIMA Research Dataset | Micro F1 | 0.942 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- El modelo tiene 109,8 millones de parámetros, lo que en FP32 ocupa aproximadamente 440 MB de memoria.
- Inferencia en CPU: viable para clasificación por lotes, con tiempos de inferencia de decenas de milisegundos por muestra (estimación razonable para un BERT-base).
- Inferencia en GPU: cabe en GPUs consumer con 4 GB de VRAM o más (por ejemplo, GTX 1660, RTX 2060, RTX 3060). Una RTX 4090 puede procesar lotes de cientos de muestras simultáneamente.
- Para despliegue en producción, se recomienda usar vLLM o TGI si se necesita alto throughput, aunque al ser un modelo de clasificación, también es viable con ONNX Runtime o TensorRT para optimización.
- Alternativa ligera: cuantización a int8 o FP16 para reducir el uso de memoria a ~220 MB, permitiendo ejecución en entornos con recursos limitados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para clasificación ATC en español dentro de los datos proporcionados. Como referencia arquitectónica, el modelo BETO original (dccuchile/bert-base-spanish-wwm-cased) es su base, pero no se han publicado comparativas de rendimiento entre ambos. Tampoco se conocen alternativas comerciales o académicas con las que contrastar en esta ficha.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para investigación médica y análisis de datos farmacéuticos; no debe utilizarse para prescripción clínica ni asesoramiento médico.
- Los resultados de benchmark provienen del autor y no han sido verificados de forma independiente.
- El entrenamiento se basa en datos de medicamentos autorizados en España, por lo que puede no generalizar bien a fármacos de otros países o a terminología médica no española.
- La longitud de contexto no está documentada; se asume el límite estándar de BERT (512 tokens), pero textos más largos podrían truncarse.
- No se han evaluado sesgos potenciales del modelo en poblaciones específicas, aunque al estar entrenado con datos oficiales es probable que refleje las limitaciones de las fuentes originales.
- La licencia Apache-2.0 permite uso comercial, pero el autor recomienda restringir su uso a fines de investigación y análisis, no a decisiones clínicas.
- No se proporcionan garantías sobre la precisión en casos extremos o fármacos muy recientes no presentes en los datos de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hsilvosa/BETO-ATC-Hierarchical-Classifier
- Repositorio de BETO (modelo base): https://github.com/dccuchile/beto
- Dataset AEMPS CIMA Research Dataset: https://huggingface.co/datasets/hsilvosa/aemps-cima
- Dataset OpenPLACSP: https://huggingface.co/datasets/hsilvosa/openplacsp
