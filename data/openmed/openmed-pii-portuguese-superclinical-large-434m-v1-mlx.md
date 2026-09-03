# OpenMed/OpenMed-PII-Portuguese-SuperClinical-Large-434M-v1-mlx

## Resumen

OpenMed-PII-Portuguese-SuperClinical-Large-434M-v1-mlx es un modelo de clasificación de tokens (token classification) especializado en la detección de información personal identificable (PII) en texto clínico en portugués. Desarrollado por OpenMed, forma parte de un ecosistema de modelos médicos locales que priorizan la privacidad y el procesamiento en el dispositivo. Este artefacto concreto es un empaquetado en formato MLX del checkpoint original `OpenMed/OpenMed-PII-Portuguese-SuperClinical-Large-434M-v1`, diseñado para ejecutarse de forma eficiente en hardware Apple Silicon.

El modelo se basa en la arquitectura DeBERTa-v2 (concretamente `DebertaV2ForTokenClassification`) y cuenta con 434 millones de parámetros. Su propósito principal es identificar entidades como nombres, direcciones, números de identificación, fechas y otros datos sensibles dentro de notas clínicas, facilitando tareas de anonimización y cumplimiento normativo (por ejemplo, HIPAA). La relevancia actual radica en la creciente necesidad de procesar datos médicos sin que salgan del entorno controlado, y este modelo ofrece una solución local, con licencia Apache-2.0 y soporte para el idioma portugués.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (DebertaV2ForTokenClassification) |
| Parametros totales | 434 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (típico de DeBERTa-v2: 512, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugués (pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura DeBERTa-v2, un transformer basado en atención con decodificación mejorada mediante máscaras desenredadas (disentangled attention). En esta variante, se utiliza la cabeza de clasificación de tokens (`DebertaV2ForTokenClassification`) para asignar etiquetas a cada token de entrada, lo que permite identificar entidades PII a nivel de subpalabra.

El checkpoint original fue fine-tuneado a partir de un modelo base (también llamado `OpenMed-PII-Portuguese-SuperClinical-Large-434M-v1`) para la tarea específica de detección de PII en texto clínico portugués. No se dispone de información pública sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. El empaquetado MLX no modifica los pesos, solo los convierte al formato optimizado para Apple Silicon.

## Capacidades

- Detección de entidades PII en texto clínico en portugués: nombres, direcciones, números de teléfono, fechas, identificadores médicos, etc.
- Clasificación de tokens a nivel de subpalabra, lo que permite identificar entidades compuestas o con variaciones morfológicas.
- Integración con el ecosistema OpenMed para extracción de PII mediante la función `extract_pii`, que incluye fusión inteligente de entidades (`use_smart_merging`).
- Ejecución local en Apple Silicon mediante el backend MLX, sin necesidad de conexión a la nube.
- Compatibilidad con el pipeline de token-classification de Hugging Face, lo que facilita su uso en entornos Python estándar.
- Soporte para inferencia en CPU (a través del backend PyTorch) en sistemas no Apple, aunque el artefacto MLX está optimizado para Apple Silicon.

## Casos de uso

- Anonimización de historias clínicas en portugués: el modelo identifica y marca todas las entidades PII en documentos médicos, permitiendo su posterior enmascaramiento o eliminación antes de compartir los datos con terceros.
- Cumplimiento normativo en investigación clínica: al procesar datos de pacientes para estudios, el modelo ayuda a garantizar que la información personal se elimine antes de su uso en análisis agregados.
- Preparación de conjuntos de datos para entrenamiento de modelos médicos: se puede utilizar para limpiar corpus clínicos, eliminando PII antes de usarlos como datos de entrenamiento.
- Auditoría de registros electrónicos de salud: el modelo puede escanear bases de datos de historias clínicas para detectar posibles fugas de información personal no intencionadas.
- Integración en aplicaciones móviles de salud: gracias al formato MLX, el modelo puede ejecutarse en iPhone o iPad (a través de OpenMedKit) para anonimizar notas clínicas directamente en el dispositivo del paciente.
- Procesamiento de textos legales o administrativos en portugués: aunque está orientado a texto clínico, puede adaptarse a otros dominios con datos personales, como contratos o formularios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K, ya que se trata de un modelo de clasificación de tokens y no de generación de texto. Tampoco se han reportado comparativas con otros modelos de detección de PII en portugués.

## Requisitos de hardware

- El modelo tiene 434 millones de parámetros, lo que en precisión FP16 ocupa aproximadamente 870 MB de memoria. Con overhead de inferencia, se estima que requiere entre 1 y 2 GB de memoria unificada.
- Está optimizado para Apple Silicon (M1, M2, M3 y posteriores) mediante el backend MLX. Se recomienda un Mac con al menos 8 GB de RAM unificada para una ejecución fluida.
- En sistemas sin Apple Silicon, se puede ejecutar mediante el backend PyTorch de Hugging Face, aunque no se aprovechan las optimizaciones MLX.
- Opciones de despliegue: Python con `openmed[mlx]`, o mediante la API de Hugging Face Transformers. También es posible su uso en Swift a través de OpenMedKit, aunque el soporte actual para DeBERTa-v2 en Swift está limitado (solo se soportan BERT, DistilBERT, RoBERTa, XLM-RoBERTa y ELECTRA).
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (detección de PII en portugués clínico) dentro de los datos proporcionados. No se puede realizar una comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para texto clínico en portugués; su rendimiento en otros idiomas o dominios puede ser significativamente inferior.
- Al ser un modelo de clasificación de tokens, puede presentar errores de etiquetado, especialmente con entidades poco frecuentes o con variaciones ortográficas.
- No se han publicado evaluaciones de sesgos, por lo que no se puede garantizar un comportamiento equitativo en todos los grupos demográficos.
- La longitud de contexto no está confirmada; si sigue el estándar de DeBERTa-v2, sería de 512 tokens, lo que limita el procesamiento de documentos largos en una sola pasada.
- Aunque la licencia Apache-2.0 permite uso comercial, es responsabilidad del usuario verificar que el uso cumple con las normativas locales de protección de datos (por ejemplo, RGPD en Europa).
- El empaquetado MLX está pensado para Apple Silicon; en otros sistemas se requiere el backend PyTorch, que puede tener un rendimiento inferior.
- El soporte Swift (OpenMedKit) para esta arquitectura aún no está disponible, lo que limita su integración en aplicaciones iOS nativas.

## Enlaces

- Repositorio HuggingFace del modelo MLX: https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-SuperClinical-Large-434M-v1-mlx
- Checkpoint original (PyTorch): https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-SuperClinical-Large-434M-v1
- Repositorio GitHub de OpenMed: https://github.com/maziyarpanahi/openmed
- Documentación del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentación de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
- Colección de modelos médicos MLX: https://huggingface.co/collections/OpenMed/medical-mlx-models
