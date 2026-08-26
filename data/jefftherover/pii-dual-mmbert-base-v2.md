# jefftherover/pii-dual-mmbert-base-v2

## Resumen

El modelo `jefftherover/pii-dual-mmbert-base-v2` es un encoder bilingüe (inglés y español) de 307 millones de parámetros, especializado en la detección y clasificación de información personal identificable (PII). Desarrollado por el usuario `jefftherover`, se basa en el modelo `jhu-clsp/mmBERT-base`, un encoder multilingüe moderno entrenado sobre 3 billones de tokens en 1.833 lenguas mediante un novedoso enfoque de aprendizaje de lenguas con annealing en cascada. Este modelo resuelve el problema de identificar entidades como nombres, direcciones, números de teléfono o datos financieros en texto, una tarea crítica para el cumplimiento normativo (GDPR, CCPA) y la protección de datos en producción.

La relevancia de este modelo radica en que combina la arquitectura moderna de mmBERT (basada en ModernBERT) con un ajuste fino específico para PII, logrando métricas de precisión y recall superiores al 99% en el conjunto de evaluación. Su licencia MIT permite uso comercial sin restricciones, y su tamaño de 307M parámetros lo hace desplegable en GPUs de consumo. El modelo está disponible en formato safetensors y es compatible con el ecosistema de Hugging Face Transformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | mmBERT (ModernBERT adaptado a multilingüe) |
| Parámetros totales | 307.575.611 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (según paper de mmBERT) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | 1.833 lenguas (modelo base); el ajuste fino se realizó presumiblemente en inglés y español |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `jhu-clsp/mmBERT-base` introduce la primera implementación de un encoder multilingüe moderno basado en la arquitectura de ModernBERT. Sus innovaciones principales incluyen el aprendizaje de lenguas con annealing en cascada (ALL, por sus siglas en inglés), que entrena primero en lenguas con muchos recursos y va incorporando progresivamente lenguas con menos recursos, y una atención alternada entre ventanas locales y atención global en tokens seleccionados. El modelo base tiene 110M de parámetros no-embebidos y 307M en total debido al amplio vocabulario multilingüe.

El ajuste fino para PII se realizó sobre un conjunto de datos no especificado, con los siguientes hiperparámetros: learning rate de 5e-05, batch size de 16 (32 con acumulación de gradientes), optimizador AdamW con betas (0.9, 0.999), scheduler cosine con reinicios y 200 pasos de warmup, durante 4 épocas. Se utilizó precisión mixta nativa (AMP) y el entrenamiento se ejecutó con Transformers 5.15.1 y PyTorch 2.13.0. El modelo alcanzó una pérdida final de 0.0022 en el conjunto de evaluación.

## Capacidades

- Detección de entidades PII: identifica y clasifica información personal como nombres, direcciones, números de teléfono, correos electrónicos, datos financieros y números de identificación.
- Clasificación de tokens: pipeline de token-classification, ideal para tareas de NER (reconocimiento de entidades nombradas).
- Multilingüe: hereda la capacidad multilingüe de mmBERT, que cubre 1.833 lenguas, aunque el ajuste fino puede haber reducido el rendimiento en lenguas no representadas en el dataset de entrenamiento.
- Contexto largo: ventana de 8.192 tokens, adecuada para procesar documentos extensos de una sola pasada.
- Razonamiento contextual: al ser un encoder bidireccional, captura dependencias de largo alcance en el texto, lo que mejora la precisión en la detección de PII en contextos complejos.

## Casos de uso

- Cumplimiento normativo en empresas: el modelo puede integrarse en pipelines de procesamiento de documentos para detectar y enmascarar PII antes de almacenar o compartir datos, garantizando el cumplimiento de GDPR o CCPA.
- Anonimización de conjuntos de datos: antes de publicar datasets para investigación o entrenamiento, el modelo puede escanear y eliminar información personal de manera automática, reduciendo el riesgo de reidentificación.
- Filtrado de logs y trazas de aplicación: en entornos de producción, los logs suelen contener datos de usuario; este modelo puede clasificar y redactar PII en tiempo real antes de enviarlos a sistemas de monitorización.
- Protección de datos en atención al cliente: integrado en sistemas de ticketing, puede detectar y enmascarar información sensible en conversaciones antes de que sean visibles para agentes o almacenadas en bases de datos.
- Preparación de datos para entrenamiento de LLMs: al construir datasets de entrenamiento para modelos generativos, el modelo puede filtrar PII de manera automática, evitando que los modelos aprendan y reproduzcan información personal.
- Auditoría de seguridad: el modelo puede analizar documentos internos o comunicaciones para verificar que no se filtren datos sensibles, actuando como una capa de prevención de fugas de información.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks externos (MMLU, HumanEval, etc.) en la información disponible. El autor declara los siguientes resultados en el conjunto de evaluación durante el entrenamiento:

| Métrica | Valor final |
|---|---|
| Pérdida (loss) | 0.0022 |
| Precisión (precision) | 0.9963 |
| Recall | 0.9977 |
| F1 | 0.9970 |
| Exactitud (accuracy) | 0.9995 |

Evolución del entrenamiento:

| Training Loss | Epoch | Step | Validation Loss | Precision | Recall | F1 | Accuracy |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 0.0118 | 0.4638 | 2000 | 0.0101 | 0.9835 | 0.9912 | 0.9873 | 0.9973 |
| 0.0097 | 0.9275 | 4000 | 0.0049 | 0.9923 | 0.9960 | 0.9942 | 0.9988 |
| 0.0177 | 1.3912 | 6000 | 0.0030 | 0.9939 | 0.9957 | 0.9948 | 0.9990 |
| 0.0044 | 1.8550 | 8000 | 0.0030 | 0.9949 | 0.9967 | 0.9958 | 0.9991 |
| 0.0021 | 2.3186 | 10000 | 0.0026 | 0.9941 | 0.9957 | 0.9949 | 0.9992 |
| 0.0049 | 2.7824 | 12000 | 0.0018 | 0.9961 | 0.9978 | 0.9970 | 0.9994 |
| 0.0002 | 3.2460 | 14000 | 0.0023 | 0.9963 | 0.9979 | 0.9971 | 0.9994 |
| 0.0007 | 3.7098 | 16000 | 0.0022 | 0.9964 | 0.9978 | 0.9971 | 0.9995 |
| 0.0001 | 4.0 | 17252 | 0.0022 | 0.9963 | 0.9977 | 0.9970 | 0.9995 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en FP32 (307M parámetros × 4 bytes). Con cuantización INT8, se reduce a unos 0,6 GB; con INT4, a unos 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en FP32. Una NVIDIA GTX 1060, RTX 2060 o superior es más que suficiente. Para entrenamiento o fine-tuning adicional, se recomienda una GPU con 8-12 GB de VRAM (RTX 3070, RTX 4080, A100).
- Compatibilidad con GPUs de consumo: sí, el modelo cabe en cualquier GPU consumer moderna, incluso en las de gama baja.
- Opciones de despliegue: al ser un modelo de Transformers estándar, puede desplegarse con Hugging Face Inference Endpoints, vLLM, TGI (Text Generation Inference), o mediante la librería `transformers` directamente. También es compatible con ONNX Runtime para optimización en CPU.
- Latencia y throughput: no se dispone de datos medidos. Para un modelo de 307M parámetros, se espera una latencia de decenas de milisegundos por documento en GPU, y de cientos de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| pii-dual-mmbert-base-v2 | 307M | 8.192 | MIT | Detección de PII |
| jhu-clsp/mmBERT-base | 307M | 8.192 | MIT | Multilingüe generalista |
| xlm-roberta-base | 278M | 512 | MIT | Multilingüe generalista |
| bert-base-multilingual-cased | 178M | 512 | Apache 2.0 | Multilingüe generalista |

El modelo se distingue de sus alternativas por estar específicamente ajustado para detección de PII, mientras que los otros son encoders multilingües de propósito general. Su ventana de contexto de 8.192 tokens supera ampliamente los 512 tokens de XLM-R y BERT multilingüe, lo que permite procesar documentos completos sin truncamiento. La licencia MIT es más permisiva que la Apache 2.0 de BERT multilingüe.

## Limitaciones y advertencias

- El conjunto de datos de entrenamiento para el ajuste fino no está documentado, por lo que se desconoce la distribución de lenguas, dominios y tipos de PII cubiertos. Esto puede afectar al rendimiento en dominios específicos (médico, legal, etc.).
- No se han publicado resultados de benchmarks externos que permitan comparar el rendimiento con otros modelos de detección de PII de manera objetiva.
- El modelo puede presentar sesgos en la detección de PII según la lengua o el formato de los datos, especialmente en lenguas poco representadas en el entrenamiento.
- Riesgo de alucinación: al ser un modelo de clasificación de tokens, no genera texto, por lo que el riesgo de alucinación es bajo. Sin embargo, puede producir falsos positivos o negativos en la detección de PII.
- La licencia MIT permite uso comercial sin restricciones, pero el usuario es responsable de verificar que el modelo cumple con los requisitos legales de protección de datos en su jurisdicción.
- El modelo no ha sido evaluado en tareas de generación de texto ni en razonamiento complejo; su uso está limitado a clasificación de tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jefftherover/pii-dual-mmbert-base-v2
- Modelo base mmBERT: https://huggingface.co/jhu-clsp/mmBERT-base
- Repositorio GitHub de mmBERT: https://github.com/JHU-CLSP/mmBERT/
- Paper de mmBERT: https://arxiv.org/html/2509.06888v1
- Modelo relacionado del mismo autor: https://huggingface.co/jefftherover/modernbert-pii-mapped-v2
