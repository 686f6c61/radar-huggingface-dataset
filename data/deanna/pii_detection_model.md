# Deanna/pii_detection_model

## Resumen

pii_detection_model es un modelo de clasificación de tokens (token classification) obtenido mediante fine-tuning de google-bert/bert-base-cased, publicado por el usuario Deanna en Hugging Face. Su propósito es la detección de información personal identificable (PII) en texto, una tarea crítica para el cumplimiento normativo (RGPD, HIPAA, etc.) y para la anonimización de datos antes de su procesamiento o almacenamiento.

El modelo parte de la arquitectura BERT base (transformer encoder bidireccional) con 107.749.671 parámetros totales y una ventana de contexto heredada del modelo base (512 tokens, aunque este dato no se explicita en la model card). Se ha entrenado durante 15 épocas con un learning rate de 2e-05, batch size de 32 y el optimizador AdamW fused, alcanzando en el conjunto de evaluación una pérdida de 0,2174, precisión de 0,8154, recall de 0,8664, F1 de 0,8401 y accuracy de 0,9694.

La relevancia de este modelo radica en su especialización: frente a modelos generativos de propósito general, un BERT fine-tuneado para token classification ofrece inferencia rápida, bajo coste computacional y un rendimiento sólido en la identificación de entidades PII, lo que lo hace adecuado para pipelines de saneamiento de datos a gran escala. La licencia Apache 2.0 facilita su uso comercial, aunque la documentación disponible es mínima y el conjunto de datos de entrenamiento no se especifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, bidireccional) |
| Parametros totales | 107.749.671 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de bert-base-cased, típicamente 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; compatible con cuantización estándar de transformers) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de google-bert/bert-base-cased, un transformer encoder de 12 capas con atención bidireccional y 107,7 millones de parámetros, adaptado a la tarea de token classification mediante una cabeza de clasificación sobre las representaciones contextuales de cada token. La arquitectura es la estándar de BERT: embeddings de token, posición y segmento, seguidas de capas de self-attention multi-cabeza y feed-forward, con normalización y conexiones residuales.

El entrenamiento se realizó durante 15 épocas con un learning rate de 2e-05, batch size de 32 (tanto en entrenamiento como en evaluación), semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, y un scheduler lineal. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables a un modelo discriminativo de este tipo). La model card indica explícitamente que el dataset es desconocido ("on an unknown dataset") y que la descripción del modelo, usos previstos y datos de entrenamiento/evaluación requieren más información. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación de tokens para detección de PII: identifica entidades como nombres, direcciones, números de teléfono, correos electrónicos, números de identificación y otras categorías de información personal en texto.
- Etiquetado a nivel de token (BIO/BILOU u otro esquema, no especificado en la model card).
- Procesamiento de texto en lotes (batch size de evaluación de 32 durante el entrenamiento).
- Inferencia rápida y de bajo coste gracias a la arquitectura BERT base.
- Compatible con el pipeline de token-classification de transformers.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles (el modelo base es en inglés, pero no se documenta el alcance idiomático del fine-tuning).

## Casos de uso

- Saneamiento de datos previo a entrenamiento: el modelo puede ejecutarse sobre corpus de texto para etiquetar y eliminar o enmascarar entidades PII antes de usar esos datos en el entrenamiento de modelos generativos, reduciendo el riesgo de memorización de datos personales.
- Cumplimiento del RGPD en pipelines de datos: integrado como paso de token classification en un ETL, permite auditar y anonimizar registros de clientes, tickets de soporte o formularios antes de su almacenamiento o transferencia.
- Redacción automática de documentos: en flujos de publicación de documentos legales, médicos o financieros, el modelo detecta nombres, direcciones y números de identificación para sustituirlos por marcadores genéricos.
- Enmascaramiento en logs y telemetría: aplicado a logs de aplicaciones y trazas de errores, identifica correos, teléfonos y nombres de usuario embebidos en texto libre para evitar fugas en sistemas de observabilidad.
- Preprocesamiento para atención al cliente: antes de enviar conversaciones a un modelo generativo o a un sistema de análisis, el modelo etiqueta las entidades PII para que puedan redactarse, cumpliendo con políticas de privacidad en conversaciones multi-turno.
- Anonimización de datasets para investigación: en entornos académicos o sanitarios, permite generar versiones desidentificadas de corpus textuales manteniendo la estructura lingüística para análisis estadístico o entrenamiento de modelos.
- Moderación y auditoría de contenido: como componente de un sistema de revisión, detecta la presencia de datos personales en contenido generado por usuarios antes de su publicación.

## Benchmarks y rendimiento

La model card declara resultados en el conjunto de evaluación, pero el model-index oficial no contiene entradas de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Los únicos datos disponibles son las métricas de validación del entrenamiento:

| Metrica | Valor |
|---|---|
| Loss | 0,2174 |
| Precision | 0,8154 |
| Recall | 0,8664 |
| F1 | 0,8401 |
| Accuracy | 0,9694 |

No se han publicado resultados de benchmarks estándar en la información disponible. Las métricas anteriores corresponden al conjunto de evaluación del propio autor y no son directamente comparables con otros modelos sin conocer el dataset y el esquema de etiquetado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,5 GB en fp32 (107,7 M de parámetros × 4 bytes), alrededor de 0,2 GB en fp16 y menos de 0,15 GB en cuantización int8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas como NVIDIA T4, RTX 3060, RTX 4090, A100 o H100 pueden ejecutar el modelo sin problemas, aunque para este tamaño las GPU de gama media son más que suficientes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1060 6 GB, RTX 2060, RTX 3060, RTX 4060, etc.) e incluso en CPU para lotes pequeños.
- Opciones de despliegue: transformers (pipeline de token-classification), vLLM (soporte limitado para token classification), TGI (si se configura como task de token classification), ONNX Runtime, y exportación a GGUF para llama.cpp en caso de querer inferencia en CPU.
- Latencia y throughput estimados: no disponibles en la información proporcionada; para un BERT base en una GPU moderna se espera un throughput de cientos a miles de secuencias por segundo con batch size moderado, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Deanna/pii_detection_model | 107,7 M | no disponible (heredado de BERT base) | Token classification (PII) | Apache 2.0 | Hugging Face |
| google-bert/bert-base-cased | 108 M | 512 tokens | Modelo base (MLM) | Apache 2.0 | Hugging Face |
| dslim/bert-base-NER | 108 M | 512 tokens | Token classification (NER) | MIT | Hugging Face |
| bigcode/starpii | no disponible | no disponible | Detección de PII en código | no disponible | Hugging Face |

La comparación con dslim/bert-base-NER es la más directa por arquitectura y tamaño, aunque este último se orienta a entidades nombradas genéricas (personas, organizaciones, localizaciones) y no específicamente a PII. bigcode/starpii aborda la detección de PII en código fuente, un dominio distinto. No se dispone de métricas comparables entre estos modelos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- La model card está generada automáticamente y contiene secciones sin completar ("More information needed"); no se documenta el dataset de entrenamiento, el esquema de etiquetado ni los idiomas cubiertos.
- El modelo se entrenó sobre un dataset desconocido, por lo que se desconoce su cobertura de categorías PII y su comportamiento en dominios no representados.
- Riesgo de alucinación y falsos positivos/negativos: con una precisión de 0,8154 y un recall de 0,8664, aproximadamente un 18 % de las entidades detectadas pueden ser falsos positivos y un 13 % de las PII reales pueden no detectarse; en producción esto implica revisión humana o umbrales ajustados.
- Sesgos potenciales derivados del corpus de entrenamiento no documentado; el modelo base es en inglés, por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- Limitación de contexto: al heredar BERT base, la ventana máxima es de 512 tokens; textos más largos requieren segmentación, lo que puede fragmentar entidades y degradar la detección en los límites.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la ausencia de documentación sobre el dataset puede plantear problemas de trazabilidad en auditorías de cumplimiento.
- No es un modelo generativo: no puede explicar sus decisiones ni generar texto enmascarado por sí mismo; debe combinarse con lógica externa para la sustitución o redacción de entidades.
- Para producción en entornos regulados, se recomienda validar el modelo con un conjunto de evaluación propio y representativo del dominio objetivo antes de confiar en sus métricas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Deanna/pii_detection_model
- Modelo base: https://huggingface.co/google-bert/bert-base-cased
- Documentación de token classification en transformers: https://huggingface.co/docs/transformers/tasks/token_classification
- Referencia de BERT (paper original): https://arxiv.org/abs/1810.04805
