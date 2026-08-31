# seongyeon1/ko-pii-ner-roberta-base

## Resumen

El modelo `seongyeon1/ko-pii-ner-roberta-base` es un sistema de reconocimiento de entidades nombradas (NER) especializado en la detección de información personal identificable (PII) en texto coreano. Desarrollado por seongyeon1, parte del modelo base `klue/roberta-base` (una variante de RoBERTa preentrenada específicamente para coreano) y se ajusta mediante fine-tuning sobre el dataset propio `seongyeon1/ko-pii-ner-100k`. El modelo aborda el problema de la de-identificación de datos personales, un requisito crítico para el cumplimiento de la Ley de Protección de Datos Personales de Corea del Sur.

Con 110 millones de parámetros, el modelo clasifica tokens en 20 tipos de entidades organizadas en tres niveles de sensibilidad (Tier 1: identificadores únicos como número de registro de residente o pasaporte; Tier 2: identificadores directos como nombre, teléfono o email; Tier 3: cuasi-identificadores y datos sensibles como fecha de nacimiento o afiliación). Su diseño incluye un manejo explícito de los límites entre entidades y partículas gramaticales coreanas (조사), un desafío particular del idioma. La relevancia actual radica en que ofrece una solución ligera y de código abierto para anonimizar texto coreano en producción, con métricas publicadas de forma honesta que distinguen entre datos sintéticos y reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (encoder-only transformer) |
| Parametros totales | 110.059.049 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 256 tokens (max_length de entrenamiento; base soporta 512) |
| Tipos de cuantizacion | no disponible (pesos en FP32/FP16, sin cuantizaciones publicadas) |
| Idiomas soportados | coreano (ko) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura RoBERTa, un transformer encoder-only con atención bidireccional, preentrenado originalmente por Meta AI y adaptado al coreano por el proyecto KLUE. La capa de clasificación es una cabeza lineal sobre los embeddings contextuales de cada token, con etiquetas BIO (41 clases en total: 20 tipos × etiquetas B/I/O). El fine-tuning se realizó sobre el dataset `seongyeon1/ko-pii-ner-100k`, que incluye 100.000 ejemplos de seis dominios (atención al cliente, correo interno, médico, financiero, quejas públicas y reclutamiento) y contiene tanto muestras sintéticas como reales (KDPII y ai4privacy localizado).

El entrenamiento utilizó focal loss (α=1.0, γ=2.0, con peso 0.1 para la etiqueta O) para mitigar el desequilibrio de clases, una sola época, batch size 32, learning rate 2e-5 con warmup de 500 pasos y longitud máxima de 256 tokens con padding dinámico. Se ejecutó en Apple Silicon MPS durante 47 minutos (28.5 muestras/segundo), alcanzando una pérdida final de 0.0562. Una innovación destacable es la inclusión deliberada de hard negatives (números de pedido, versiones de software, teléfonos de servicio) para evitar el colapso del modelo hacia "cualquier secuencia numérica es PII".

## Capacidades

- Detección de 20 tipos de entidades PII en coreano, incluyendo identificadores únicos (RRN, pasaporte, licencia de conducir), identificadores directos (nombre, teléfono, email, dirección, cuenta bancaria) y cuasi-identificadores (fecha de nacimiento, edad, afiliación, cargo).
- Manejo de límites de entidades con partículas coreanas (조사), gracias al etiquetado BIO con clases específicas.
- Clasificación de tokens con puntuación de confianza, utilizable mediante el pipeline `token-classification` de HuggingFace con `aggregation_strategy="simple"`.
- Función de enmascaramiento simple integrable: reemplaza cada entidad detectada por su etiqueta (ej. `[RRN]`).
- Robustez frente a números no-PII (hard negatives) en el dominio de entrenamiento.
- Soporte para inferencia en CPU y GPU gracias a su tamaño compacto (110M parámetros).

## Casos de uso

- Anonimización de registros de atención al cliente: el modelo puede procesar transcripciones de chats o llamadas para enmascarar nombres, números de teléfono y cuentas bancarias antes de almacenarlas o compartirlas con terceros, cumpliendo requisitos de protección de datos.
- Cumplimiento normativo en el sector financiero: detección de números de tarjeta, cuentas y registros de residente en formularios o documentos internos, permitiendo la redacción automática antes de auditorías o transferencias.
- Preparación de datasets para entrenamiento de LLMs: limpieza de corpus coreanos eliminando PII antes de su uso en fine-tuning, reduciendo riesgos de fuga de información en modelos generativos.
- Sanitización de historiales médicos: identificación de datos personales en notas clínicas (nombres, fechas de nacimiento, afiliaciones) para investigación secundaria o publicación de datos abiertos.
- Filtrado de información en sistemas de soporte: integración en pipelines de correo electrónico o ticketing para detectar y redactar automáticamente PII en mensajes entrantes antes de que lleguen a agentes humanos.
- Verificación de datos en procesos de contratación: extracción de identificadores de currículos o formularios de solicitud para separar datos personales de la evaluación de candidatos.
- Monitorización de fugas de datos en logs: escaneo de archivos de registro de aplicaciones para localizar direcciones IP, números de teléfono o emails que hayan sido registrados accidentalmente.

## Benchmarks y rendimiento

La model card reporta métricas detalladas, pero advierte explícitamente que el 53% del test (5.338 de 9.979 ejemplos) son datos sintéticos donde el modelo alcanza F1=1.0000, lo que infla las cifras globales. Los valores honestos corresponden a la evaluación sobre datos reales de KDPII.

| Evaluación | n | Precisión | Recall | F1 | F5 |
|---|---:|---:|---:|---:|---:|
| KDPII diálogo (real) | 450 | 0.8833 | 0.9191 | 0.9008 | 0.9176 |
| KDPII frase corta (real) | 1.511 | 0.9098 | 0.9336 | 0.9216 | 0.9327 |
| ai4privacy localizado (traducción) | 2.100 | 0.9946 | 0.9970 | 0.9958 | 0.9969 |
| Sintético (combinado + plantilla) | 5.338 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |
| Test completo | 9.979 | 0.9894 | 0.9933 | 0.9913 | 0.9931 |

F5 es una F-beta con peso 25 en recall, priorizando la no-omisión de PII. En 580 documentos sin PII no se registraron falsos positivos. Por entidad, los mejores resultados se dan en identificadores con formato rígido (RRN, tarjeta, vehículo, IP con F1≥0.997), mientras que los más débiles son `USER_ID` (F1=0.938) y `AFFILIATION` (F1=0.961), dependientes del contexto. No se han publicado comparaciones con otros modelos PII NER.

## Requisitos de hardware

- VRAM estimada: menos de 500 MB en FP32 para inferencia (110M parámetros ≈ 440 MB); con cuantización INT8 o FP16 se reduce a ~220 MB o menos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (ej. NVIDIA GTX 1650, RTX 3050) es suficiente; también funciona en CPU sin problemas.
- En consumer GPU: sí, cabe en cualquier GPU moderna, incluso en placas integradas con suficiente RAM.
- Opciones de despliegue: compatible con HuggingFace `transformers` (pipeline), `ONNX Runtime` para optimización en CPU, y `FastAPI` para servir como microservicio. No se indican configuraciones con vLLM u Ollama al ser un modelo de clasificación de tokens.
- Latencia: en CPU típica, procesamiento de 256 tokens en ~100-200 ms; en GPU (ej. T4) en ~10-20 ms por muestra. Throughput estimado de cientos de documentos por minuto en lote.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de NER PII coreanos en la información proporcionada. El autor menciona que no se realizaron comparaciones con reglas heurísticas ni con modelos multilingües. Como referencia estructural, se puede comparar con:

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| `seongyeon1/ko-pii-ner-roberta-base` | 110M | 256 (entrenamiento) | NER PII coreano, 20 tipos, 3 niveles | CC-BY-SA-4.0 |
| `klue/roberta-base` (base sin fine-tuning) | 110M | 512 | Modelo general coreano, sin NER específico | CC-BY-SA-4.0 |
| `MuhsinunC/pii-ner-roberta-base` | 110M | 512 | NER PII en inglés (no coreano) | no disponible |

La comparación con el base KLUE es trivial: el fine-tuning añade la capacidad de clasificar PII. No hay alternativas coreanas específicas documentadas en la información disponible.

## Limitaciones y advertencias

- Entrenamiento de una sola época sobre un modelo base (no large); no se han probado múltiples épocas ni arquitecturas mayores, por lo que el rendimiento podría mejorar.
- La evaluación sobre datos reales se limita a KDPII, y ese mismo dataset está incluido en el entrenamiento, lo que puede inflar las métricas. No hay una evaluación externa independiente con exclusión de test.
- El 53% del conjunto de test es sintético con F1=1.0000; las cifras globales no reflejan el rendimiento en datos reales. Se recomienda usar las métricas de KDPII como referencia.
- Dominios de entrenamiento restringidos a seis (atención al cliente, correo interno, médico, financiero, quejas públicas, reclutamiento). En dominios como textos legales, SNS o transcripciones de voz el rendimiento puede degradarse.
- Las etiquetas de Tier 3 (cuasi-identificadores) son inherentemente ambiguas y dependen del contexto; los límites entre entidades pueden ser difusos.
- Los hard negatives están en la misma distribución que el entrenamiento; la tasa de falsos positivos en textos reales fuera de ese dominio requiere validación adicional.
- La licencia CC-BY-SA-4.0 obliga a que cualquier obra derivada (incluido fine-tuning adicional) se distribuya bajo la misma licencia, lo que puede ser restrictivo para uso comercial propietario.
- No se han publicado cuantizaciones ni versiones optimizadas para despliegue en entornos de baja latencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/seongyeon1/ko-pii-ner-roberta-base
- Dataset de entrenamiento: https://huggingface.co/datasets/seongyeon1/ko-pii-ner-100k
- Modelo base KLUE: https://huggingface.co/klue/roberta-base
- Paper KLUE: https://arxiv.org/abs/2105.09680
- Repositorio KLUE: https://github.com/KLUE-benchmark/KLUE
- Dataset KDPII (IEEE Access, 2024): https://doi.org/10.5281/zenodo.10968609
- Dataset ai4privacy (pii-masking-openpii-1.5m): https://huggingface.co/datasets/ai4privacy/pii-masking-openpii-1.5m
