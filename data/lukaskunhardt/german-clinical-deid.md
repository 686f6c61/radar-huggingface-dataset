# LukasKunhardt/german-clinical-deid

## Resumen

German Clinical De-identification es un modelo de clasificación de tokens (token classification) especializado en la detección y anonimización de información personal identificable (PII) y datos de salud protegidos (PHI) en textos clínicos en alemán. Lo desarrolla Lukas Kunhardt y se construye sobre el modelo base `deepset/gelectra-large`, un transformer de tipo ELECTRA con aproximadamente 335 millones de parámetros. Su propósito es permitir que investigadores y desarrolladores eliminen nombres, fechas, edades, direcciones, teléfonos, correos electrónicos e identificadores antes de compartir o procesar cartas médicas y notas clínicas.

El modelo resuelve un problema práctico y regulatorio: la desidentificación de documentación clínica en alemán, tarea para la que existen pocos recursos abiertos. Se entrenó exclusivamente con cartas médicas sintéticas, sin datos reales de pacientes, lo que reduce riesgos de privacidad en el propio proceso de entrenamiento. Etiqueta cada token con una de 19 clases (una clase `O` y 18 tipos de identificador) siguiendo el esquema del corpus GraSCCo.

Es relevante ahora porque combina un rendimiento medido alto en conjuntos de prueba abiertos (F1 por carácter de 0,960 en GraSCCo y 0,970 en el conjunto de desarrollo) con licencia MIT, pesos safetensors y ONNX, y utilidades de integración listas para usar (paquete Python, componente spaCy y reconocedor para Microsoft Presidio). La longitud de contexto efectiva no está documentada de forma explícita; el paquete procesa documentos largos en ventanas solapadas de 512 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ELECTRA (transformer encoder discriminativo) sobre `deepset/gelectra-large` |
| Parametros totales | 334.705.683 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; procesamiento por ventanas solapadas de 512 tokens en el paquete |
| Tipos de cuantizacion | ONNX fp16 (`onnx/model_fp16.onnx`, 670 MB); int8 con `reduce_range=True` (435 MB, no incluido en esta versión); safetensors fp32 |
| Idiomas soportados | alemán (`de`) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un clasificador de tokens construido sobre `deepset/gelectra-large`, un ELECTRA grande preentrenado en alemán. La cabeza de clasificación emite una etiqueta por token entre 19 clases: `O` (no personal) y 18 tipos de identificador agrupados en nombres (`NAME_PATIENT`, `NAME_DOCTOR`, `NAME_RELATIVE`, `NAME_EXT`, `NAME_TITLE`, `NAME_USERNAME`), fechas y edad (`DATE`, `AGE`), lugares (`LOCATION_STREET`, `LOCATION_ZIP`, `LOCATION_CITY`, `LOCATION_HOSPITAL`), contacto (`CONTACT_PHONE`, `CONTACT_FAX`, `CONTACT_EMAIL`, `CONTACT_URL`), identificadores (`ID`) y `PROFESSION`. Los nombres de etiqueta siguen el corpus GraSCCo.

El entrenamiento se realizó únicamente con cartas médicas sintéticas del dataset `LukasKunhardt/synthetic-german-clinical-letters`; no se usaron datos reales de pacientes. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO. La innovación destacable está en el postprocesado: el paquete oficial aplica un umbral bajo de 0,01 para la redacción por carácter (frente al umbral de 0,5 para la extracción de entidades), relee el texto casi todo en mayúsculas una segunda vez en minúsculas para recuperar nombres que se pierden en mayúsculas, y procesa documentos largos en ventanas solapadas de 512 tokens. El pipeline estándar de `transformers` con `aggregation_strategy="simple"` funciona, pero equivale a un umbral mucho más alto y pierde más información personal.

## Capacidades

- Detección y redacción de PII/PHI en textos clínicos alemanes: nombres de pacientes, médicos, familiares y otras personas, títulos, códigos de usuario.
- Detección de fechas y edades.
- Detección de direcciones (calle, código postal, ciudad) y nombres de hospitales.
- Detección de datos de contacto: teléfono, fax, correo electrónico y URL.
- Detección de identificadores: números de caso, números de historial, números de seguro, códigos de planta y habitación.
- Detección de profesiones.
- Redacción por carácter (`redact`) y extracción de entidades con tipo y puntuación (`entities`).
- Procesamiento de documentos largos mediante ventanas solapadas de 512 tokens.
- Integración con Microsoft Presidio (reconocedor incluido) y como componente de spaCy.
- Exportación ONNX para inferencia en CPU.
- No dispone de clases para organizaciones distintas de hospitales ni para países (GraSCCo sí las tiene).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido; es un modelo de clasificación de tokens, no generativo.

## Casos de uso

- Desidentificación previa a la publicación de datasets clínicos: se aplica `deid.redact(text)` sobre cartas médicas para sustituir cada identificador por `[PHI]` antes de liberar corpus con fines de investigación, aprovechando el umbral bajo de 0,01 que maximiza la cobertura de caracteres redactados.
- Cumplimiento normativo en pipelines de datos hospitalarios: se integra como paso de preprocesado para eliminar nombres, fechas e identificadores antes de que los documentos salgan del entorno controlado, con métricas de fuga medidas (4,9 % de documentos con al menos un identificador directo redactado a menos de la mitad en GraSCCo).
- Integración en Microsoft Presidio: el reconocedor incluido (`presidio_example.py`) permite incorporar la detección de PHI en alemán dentro de flujos de anonimización ya existentes que ya usan Presidio para otras lenguas o tipos de entidad.
- Anotación asistida de corpus clínicos: `deid.entities(text)` devuelve spans con tipo y puntuación (umbral 0,5), lo que sirve como preetiquetado para revisión humana en proyectos de anotación de PII en alemán.
- Preprocesado para pipelines NLP clínicos: como componente spaCy, se puede encadenar antes de tareas de extracción de información, resumen o clasificación para evitar que datos personales contaminen los modelos posteriores o los logs.
- Despliegue en CPU sin GPU: la variante ONNX fp16 (670 MB) permite ejecutar la desidentificación en servidores sin acelerador, con métricas equivalentes al modelo PyTorch en las 22 cartas de desarrollo de GraSCCo (F1 por carácter 0,970, precisión 0,950, 1 de 22 cartas con fuga).
- Seudonimización selectiva: al devolver entidades tipadas, permite reemplazar cada identificador por un seudónimo coherente por tipo (por ejemplo, mantener la misma etiqueta para un mismo paciente a lo largo de un documento) en lugar de una redacción genérica.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. Las métricas son micro-promediadas sobre el conjunto completo.

| Test set | Setting | Character F1 / P / R | Strict typed F1 [95 % CI] | Documents with a leak [95 % CI] |
|---|---|---|---|---|
| GraSCCo test (41 cartas) | umbral 0,01 (configuración publicada) | 0,960 / 0,934 / 0,987 | 0,913 [0,889; 0,936] | 4,9 % (2/41) [1,3; 16,1] |
| GraSCCo test (41 cartas) | sin la segunda lectura en minúsculas | 0,960 / 0,934 / 0,987 | 0,913 [0,889; 0,936] | 4,9 % (2/41) [1,3; 16,1] |
| GraSCCo test (41 cartas) | `onnx/model_fp16.onnx` (fichero publicado) | 0,960 / 0,934 (datos truncados en la información disponible) | no disponible | no disponible |
| GraSCCo dev (22 cartas) | `onnx/model_fp16.onnx` | 0,970 / 0,950 (recall no disponible) | no disponible | 1 de 22 cartas con fuga |
| GraSCCo dev (22 cartas) | int8 con `reduce_range=True` (435 MB) | 0,969 / 0,948 | no disponible | 1 de 22 cartas con fuga |
| GraSCCo dev (22 cartas) | fp32 (referencia) | 0,970 / 0,950 | no disponible | 1 de 22 cartas con fuga |
| GraSCCo dev (22 cartas) | int8 receta dinámica por defecto de onnxruntime | 0,111 (F1 por carácter) | no disponible | no disponible |

El conjunto de prueba MDeID German (402 notas, split oficial) se menciona como conjunto de evaluación, pero los resultados numéricos sobre él no aparecen completos en la información disponible. La variante int8 con la receta dinámica por defecto de onnxruntime degrada gravemente el rendimiento (F1 por carácter 0,111), por lo que el autor no la publica en esta versión.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,3-1,5 GB solo para pesos (335 M parámetros), más activaciones y overhead; en la práctica encaja en GPUs consumer de 4 GB o más.
- VRAM estimada en fp16: aproximadamente 0,7 GB para pesos; cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 4090, A100, H100) es suficiente, siendo las de gama alta sobredimensionadas para este modelo.
- Cabe en GPU consumer: sí, en todas las GPU consumer con 4 GB o más de VRAM.
- Opciones de despliegue: `transformers` pipeline, paquete `german-clinical-deid` (con ventanas solapadas de 512 tokens), ONNX Runtime en CPU (`onnx/model_fp16.onnx`), componente spaCy y reconocedor de Microsoft Presidio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LukasKunhardt/german-clinical-deid | 334.705.683 | ventanas de 512 tokens | alemán | desidentificación clínica (19 clases) | MIT | Hugging Face, ONNX, Presidio, spaCy |
| Modelos evaluados en GraSCCo / SPARCLING-DE | no disponible | no disponible | alemán | desidentificación clínica | no disponible | referenciados en la model card (Lehmann y Werthebach 2026) |
| Modelos evaluados en MDeID | no disponible | no disponible | multilingüe (incluye alemán) | desidentificación clínica (28 categorías) | no disponible | benchmark de Microsoft (CC BY-NC 4.0 para los datos) |

No se dispone en la información proporcionada de datos comparativos detallados (parámetros, contexto, resultados) de modelos alternativos concretos de la misma categoría. Los conjuntos GraSCCo y MDeID se citan como referencia de evaluación, pero no se listan modelos competidores con sus especificaciones.

## Limitaciones y advertencias

- Entrenado solo con cartas sintéticas: el rendimiento en textos clínicos reales de otros dominios (informes de urgencias, notas de enfermería, historiales psiquiátricos) no está medido.
- El conjunto de clases es más estrecho que GraSCCo: no hay clases para organizaciones no hospitalarias ni para países, por lo que estos identificadores no se detectan.
- Un único tipo `ID` no puede cubrir las 10 categorías de identificador de MDeID; en la métrica estricta tipada esos spans cuentan como fallidos.
- Los identificadores aleatorios de MDeID (cadenas mixtas como "PXYiE-AAxw") no se encontraron en cartas alemanas y no se evalúan como caso principal; el autor reporta la tasa de fuga también sin ellos.
- El modelo pierde más nombres escritos íntegramente en mayúsculas; el paquete mitiga esto con una segunda lectura en minúsculas, pero el pipeline estándar de `transformers` no aplica esa corrección.
- El pipeline estándar de `transformers` usa la clase más probable por token, equivalente a un umbral alto, y pierde más información personal que el paquete oficial con umbral 0,01.
- La cuantización int8 con la receta dinámica por defecto de onnxruntime degrada el rendimiento a F1 por carácter 0,111; solo la variante con `reduce_range=True` mantiene la calidad (0,969), y no se incluye en esta versión.
- Riesgo de fuga residual: 4,9 % de documentos (2 de 41) en GraSCCo test presentan al menos un identificador directo redactado a menos de la mitad; una sola fuga puede ser suficiente para reidentificar a un paciente, por lo que se recomienda revisión humana en producción.
- Riesgo de alucinación de entidades: no se documenta tasa de falsos positivos por tipo en la información disponible; el umbral bajo de 0,01 prioriza el recall sobre la precisión (0,934 en GraSCCo test).
- Licencia MIT: permite uso comercial, pero la responsabilidad sobre el cumplimiento normativo (por ejemplo, RGPD) recae en el integrador.
- Los datos de evaluación MDeID están bajo CC BY-NC 4.0 y se usaron solo para pruebas, no para entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LukasKunhardt/german-clinical-deid
- Repositorio GitHub del paquete y scripts de exportación: https://github.com/lukaskunhardt/german-clinical-deid
- Modelo base: https://huggingface.co/deepset/gelectra-large
- Dataset de entrenamiento: https://huggingface.co/datasets/LukasKunhardt/synthetic-german-clinical-letters
- Corpus GraSCCo (referencia de etiquetas y evaluación): no disponible en la información proporcionada
- Benchmark MDeID (Microsoft): no disponible en la información proporcionada
- Referencia SPARCLING-DE (Lehmann y Werthebach 2026): no disponible en la información proporcionada
