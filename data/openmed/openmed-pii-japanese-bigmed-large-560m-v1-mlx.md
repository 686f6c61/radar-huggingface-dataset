# OpenMed/OpenMed-PII-Japanese-BigMed-Large-560M-v1-mlx

## Resumen

OpenMed-PII-Japanese-BigMed-Large-560M-v1-mlx es un modelo de clasificación de tokens (token classification) especializado en la detección de información personal identificable (PII) en textos clínicos en japonés. Desarrollado por OpenMed, forma parte de una familia de modelos de desidentificación de datos médicos diseñados para funcionar íntegramente en el dispositivo, sin enviar datos de pacientes a la nube. Este repositorio concreto contiene un empaquetado en formato MLX, optimizado para inferencia en Apple Silicon, del checkpoint original OpenMed/OpenMed-PII-Japanese-BigMed-Large-560M-v1.

El modelo se basa en la arquitectura XLM-RoBERTa (concretamente `XLMRobertaForTokenClassification`), con 560 millones de parámetros, y está afinado para identificar y clasificar entidades sensibles como nombres, direcciones, números de identificación, datos de contacto y otros tipos de PII en notas clínicas japonesas. Su relevancia actual radica en la creciente necesidad de cumplir normativas de privacidad (como HIPAA y leyes locales de protección de datos) en entornos sanitarios, permitiendo la desidentificación automática de historiales clínicos sin depender de servicios externos.

El repositorio MLX incluye los pesos en formato safetensors, el archivo de configuración, el mapeo de etiquetas (`id2label.json`) y los assets del tokenizador, todo listo para su uso con la librería OpenMed en Macs con chip Apple Silicon. La licencia Apache-2.0 permite uso comercial y modificación sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (XLMRobertaForTokenClassification) |
| Parametros totales | 560 millones |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible (típico de BERT: 512 tokens, no confirmado) |
| Tipos de cuantizacion | no disponible (formato MLX nativo, probablemente float16 o bfloat16) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura XLM-RoBERTa, un transformer encoder multilingüe preentrenado con masked language modeling sobre un corpus masivo en múltiples idiomas. La capa de salida es una cabeza de clasificación de tokens que asigna una etiqueta PII a cada token de la secuencia de entrada. El checkpoint base es `OpenMed/OpenMed-PII-Japanese-BigMed-Large-560M-v1`, que a su vez es una versión afinada de un modelo XLM-RoBERTa de 560M parámetros.

El entrenamiento de la familia OpenMed-PII se centra en la desidentificación de textos clínicos, con un conjunto de datos compuesto por notas médicas anotadas con 54 tipos de entidades sensibles (nombres, direcciones, fechas, números de teléfono, identificadores de paciente, etc.). No se han publicado detalles específicos sobre el volumen de datos de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que se trata de un modelo de clasificación supervisada clásica. La innovación principal reside en el empaquetado MLX, que permite ejecutar el modelo de forma eficiente en hardware Apple Silicon mediante la librería OpenMed, con soporte para fusión inteligente de entidades (`use_smart_merging=True`).

## Capacidades

- Detección de PII en texto clínico japonés: identifica y clasifica entidades como nombres de pacientes, médicos, direcciones, fechas, números de teléfono, identificadores médicos y otros datos sensibles.
- Clasificación de tokens a nivel de token: asigna una etiqueta a cada token, permitiendo extraer entidades con sus límites exactos.
- Fusión inteligente de entidades: la API de OpenMed permite combinar tokens adyacentes en entidades completas mediante `use_smart_merging=True`.
- Inferencia en Apple Silicon: gracias al empaquetado MLX, el modelo se ejecuta de forma nativa en Macs con chip M1/M2/M3/M4, sin necesidad de GPU externa.
- Compatibilidad con el ecosistema OpenMed: se integra con la librería Python `openmed[mlx]` y con OpenMedKit para Swift, aunque el soporte Swift para esta familia está en la matriz de compatibilidad actual.
- Multilingüe limitado: aunque el modelo está especializado en japonés, al basarse en XLM-RoBERTa conserva cierta capacidad de transferencia a otros idiomas, pero no es recomendable usarlo fuera del japonés.

## Casos de uso

- Desidentificación de historiales clínicos en hospitales japoneses: el modelo puede procesar notas médicas completas y eliminar o enmascarar automáticamente los datos personales antes de compartir los registros con investigadores o terceros, cumpliendo con la normativa de protección de datos (APPI en Japón).
- Preparación de datasets para investigación médica: los equipos de investigación pueden usar el modelo para anonimizar grandes volúmenes de textos clínicos antes de publicarlos o utilizarlos en entrenamiento de modelos, reduciendo el riesgo de filtración de información sensible.
- Cumplimiento HIPAA en entornos con pacientes japoneses: aunque HIPAA es una normativa estadounidense, clínicas internacionales que atienden a pacientes japoneses pueden usar este modelo para desidentificar datos antes de transferirlos a sistemas en la nube.
- Auditoría de privacidad en aplicaciones de salud: los desarrolladores de apps de salud pueden integrar el modelo para escanear y detectar PII en contenido generado por usuarios, alertando sobre posibles fugas de datos.
- Procesamiento de documentos clínicos en dispositivos Apple: gracias al formato MLX, el modelo puede ejecutarse localmente en un Mac o iPhone (vía OpenMedKit) para desidentificar documentos sin conexión, ideal para entornos con requisitos estrictos de privacidad.
- Análisis de textos médicos en japonés para seguros y facturación: las aseguradoras pueden usar el modelo para extraer y enmascarar datos personales de reclamaciones médicas antes de procesarlas, garantizando la confidencialidad del asegurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de evaluación (F1, precisión, recall) ni comparaciones con otros modelos de detección de PII en japonés. Se recomienda consultar el modelo base original o la documentación de OpenMed para obtener datos de rendimiento si estuvieran disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión, pero un modelo de 560M parámetros en MLX con precisión float16 requiere aproximadamente 1,1 GB de memoria (560M × 2 bytes). Con overhead de activaciones y tokenizador, se estima un uso total de 2-3 GB.
- GPU recomendadas: cualquier Mac con chip Apple Silicon (M1 o superior) con al menos 8 GB de RAM unificada. El modelo está optimizado para la Neural Engine y GPU integrada de Apple.
- Compatibilidad con consumer GPU: sí, en Macs con Apple Silicon. No está diseñado para GPUs NVIDIA/AMD, aunque el checkpoint original (no MLX) puede ejecutarse en cualquier GPU con PyTorch.
- Opciones de despliegue: Python con `openmed[mlx]`, descarga directa del repositorio y uso con la API de OpenMed, o integración en apps Swift mediante OpenMedKit (soporte en la matriz actual).
- Latencia y throughput: no disponibles. Al ser un modelo BERT de 560M, la inferencia en Apple Silicon debería ser de decenas de milisegundos por documento corto, pero no hay datos publicados.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de detección de PII en japonés. El ecosistema OpenMed incluye modelos similares para otros idiomas (por ejemplo, árabe), pero no hay datos públicos de rendimiento relativo. Como referencia, el modelo base XLM-RoBERTa de 560M es comparable en tamaño a otros modelos multilingües como mBERT o XLM-R Large, pero la comparación específica en tareas de NER clínico en japonés no está documentada.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado principalmente con textos clínicos japoneses, puede presentar sesgos hacia vocabulario médico específico y estructuras de documentos de ese ámbito. Su rendimiento en textos no clínicos o en variantes dialectales del japonés puede degradarse.
- Riesgo de alucinación: como modelo de clasificación de tokens, no genera texto, por lo que el riesgo de alucinación es bajo. Sin embargo, puede producir falsos positivos (marcar como PII tokens que no lo son) o falsos negativos (omitir PII reales), especialmente con nombres poco comunes o formatos de datos atípicos.
- Limitaciones de contexto: la arquitectura BERT típicamente limita la longitud de entrada a 512 tokens. Documentos clínicos largos deberán dividirse en segmentos, lo que puede afectar a la coherencia de las entidades que cruzan los límites de segmento.
- Limitaciones de idioma: el modelo está especializado en japonés. Aunque XLM-RoBERTa es multilingüe, no se recomienda su uso en otros idiomas sin reentrenamiento o evaluación previa.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución, pero no incluye garantías. El usuario es responsable del cumplimiento normativo en el uso de datos de pacientes.
- Caveat para producción: el modelo no ha sido validado clínicamente. Antes de usarlo en entornos sanitarios reales, se requiere una evaluación exhaustiva con datos locales y un proceso de validación que cumpla con los requisitos regulatorios aplicables.

## Enlaces

- Repositorio MLX en HuggingFace: https://huggingface.co/OpenMed/OpenMed-PII-Japanese-BigMed-Large-560M-v1-mlx
- Checkpoint original (no MLX): https://huggingface.co/OpenMed/OpenMed-PII-Japanese-BigMed-Large-560M-v1
- Sitio web de OpenMed: https://openmed.life/
- Repositorio GitHub de OpenMed: https://github.com/maziyarpanahi/openmed
- Documentación del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentación de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
