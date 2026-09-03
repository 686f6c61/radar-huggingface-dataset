# OpenMed/OpenMed-PII-Portuguese-ClinicalBGE-Large-568M-v1-mlx

## Resumen

OpenMed-PII-Portuguese-ClinicalBGE-Large-568M-v1-mlx es un empaquetado en formato MLX del modelo original OpenMed-PII-Portuguese-ClinicalBGE-Large-568M-v1, desarrollado por OpenMed para la detección de información personal identificable (PII) en texto clínico y biomédico en portugués. Se basa en la arquitectura XLM-RoBERTa (familia BERT) con 568 millones de parámetros, fine-tuneado específicamente para clasificación de tokens (token classification) en el dominio médico. Su relevancia radica en que cubre un nicho con pocos modelos disponibles: la anonimización de historias clínicas en portugués, un requisito crítico para la investigación médica y el cumplimiento normativo de protección de datos. La versión MLX está optimizada para inferencia en Apple Silicon, permitiendo ejecución 100% local sin enviar datos sensibles a la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (BERT) para token classification |
| Parametros totales | 568 millones |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, formato MLX) |
| Idiomas soportados | Portugues (pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX weights) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura XLM-RoBERTa, un transformer encoder preentrenado multilingue, adaptado para la tarea de clasificación de tokens mediante una cabeza de clasificación sobre cada token. El checkpoint original (OpenMed-PII-Portuguese-ClinicalBGE-Large-568M-v1) fue fine-tuneado para detectar entidades PII en texto clínico portugués, aunque no se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. La versión MLX es una conversión de pesos al formato optimizado para Apple Silicon, sin cambios en la arquitectura ni en los pesos. No se dispone de información sobre innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Detección de entidades PII en texto clínico y biomédico en portugués, incluyendo nombres, fechas, números de identificación, direcciones y otros datos personales.
- Clasificación de tokens con etiquetas predefinidas (el repositorio incluye `id2label.json`).
- Ejecución local en Apple Silicon mediante el backend MLX de OpenMed, sin conexión a la nube.
- Compatibilidad con la función `extract_pii` de la librería OpenMed, que permite extraer entidades con confianza y fusión inteligente de tokens.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo puramente discriminativo para NER.
- No tiene capacidades de visión, audio ni generación de texto libre.

## Casos de uso

- Anonimización de historias clínicas en portugués: el modelo puede procesar notas clínicas y marcar automáticamente los identificadores personales antes de compartir los datos con investigadores o terceros, reduciendo el riesgo de reidentificación.
- Cumplimiento de la Ley General de Protección de Datos (LGPD) en Brasil: integración en pipelines de tratamiento de datos sanitarios para garantizar que la información personal se elimine o enmascare antes del almacenamiento o análisis.
- Preparación de datasets para investigación médica: limpieza de corpus clínicos portugueses para entrenar otros modelos sin exponer PII, usando la salida del modelo como paso previo a la publicación.
- Despliegue en entornos hospitalarios con requisitos de privacidad estrictos: al ejecutarse localmente en Apple Silicon, el modelo permite procesar datos en el propio dispositivo sin enviar información a servidores externos.
- Aplicaciones móviles de salud en portugués: la variante ONNX del modelo (disponible en el repositorio hermano) permite ejecutar la detección de PII en Android, facilitando la anonimización en el punto de atención.
- Auditoría de documentos clínicos: revisión de informes, altas y derivaciones para localizar posibles fugas de información personal antes de su uso en ensayos clínicos o publicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre precisión, recall o F1 en tareas de NER clínico portugués, ni comparaciones con otros modelos de PII.

## Requisitos de hardware

- Inferencia en Apple Silicon (M1, M2, M3 y superiores) mediante el backend MLX de OpenMed; se requiere instalar `openmed[mlx]`.
- El tamaño del repositorio es de 4.6 GB, por lo que se recomienda al menos 8 GB de RAM unificada en Mac para cargar los pesos en memoria.
- También puede ejecutarse en CPU Python (backend PyTorch) en sistemas sin Apple Silicon, aunque con menor rendimiento.
- Existe una variante ONNX para Android y navegador, lo que permite despliegue en dispositivos móviles con recursos limitados.
- No se dispone de datos de latencia o throughput específicos para este modelo.
- Opciones de despliegue: librería OpenMed (Python), OpenMedKit (Swift) para apps de Apple, y ONNX para entornos no Apple.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de detección de PII en portugués clínico. El nicho es reducido y no se han encontrado alternativas públicas con características equivalentes en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para portugués; no es aplicable a otros idiomas sin reentrenamiento.
- No se han publicado detalles sobre el dataset de entrenamiento, por lo que se desconocen posibles sesgos en tipos de entidades, variantes dialectales o dominios clínicos específicos.
- Al ser un modelo de clasificación de tokens, puede presentar errores de etiquetado (falsos positivos o negativos) en textos con formatos atípicos, jerga local o abreviaturas médicas poco frecuentes.
- La licencia Apache-2.0 permite uso comercial, pero el usuario es responsable de validar la precisión del modelo en su caso de uso concreto, especialmente en entornos sanitarios donde un error de anonimización podría tener consecuencias legales.
- No se garantiza la ausencia de alucinaciones en la asignación de etiquetas; se recomienda revisión humana en flujos de producción críticos.
- La versión MLX está pensada para Apple Silicon; en otros sistemas se debe usar el backend PyTorch, que puede requerir más recursos.

## Enlaces

- Repositorio HuggingFace del modelo MLX: https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-ClinicalBGE-Large-568M-v1-mlx
- Checkpoint original: https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-ClinicalBGE-Large-568M-v1
- Variante ONNX para Android: https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-ClinicalBGE-Large-568M-v1-onnx-android
- Repositorio GitHub de OpenMed: https://github.com/maziyarpanahi/openmed
- Documentación del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentación de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
- Colección de modelos médicos MLX: https://huggingface.co/collections/OpenMed/medical-mlx-models
