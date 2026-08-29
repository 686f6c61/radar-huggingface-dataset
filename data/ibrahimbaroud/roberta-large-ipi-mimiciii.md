# Ibrahimbaroud/roberta-large-ipi-mimiciii

## Resumen

El modelo `Ibrahimbaroud/roberta-large-ipi-mimiciii` es un fine-tuning de `FacebookAI/roberta-large` orientado a la detección de Identificadores Personales Indirectos (IPI, por sus siglas en inglés) en notas clínicas. Desarrollado por Ibrahimbaroud, este modelo aborda un problema crítico en el ámbito sanitario: la identificación automática de información que, sin ser un dato directo como nombre o DNI, puede permitir reidentificar a un paciente (por ejemplo, fechas de nacimiento, códigos postales, ocupaciones poco comunes). La relevancia actual radica en el cumplimiento de normativas de privacidad como HIPAA y en la necesidad de anonimizar grandes volúmenes de historiales clínicos para investigación.

El modelo se basa en la arquitectura transformer encoder de RoBERTa-large, con 354 millones de parámetros y una ventana de contexto de 512 tokens. Está entrenado sobre anotaciones IPI del dataset MIMIC-III, siguiendo el esquema de etiquetado BILOU para agregar predicciones a nivel de token en spans continuos. Se publica bajo licencia Apache 2.0 y está disponible en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-large) |
| Parametros totales | 354.329.619 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens (heredada de RoBERTa-large) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/roberta-large`, un transformer encoder preentrenado con enmascaramiento de tokens y entrenamiento robusto sobre un corpus extenso en inglés. El fine-tuning se realiza sobre el dataset MIMIC-III con anotaciones de IPI, donde cada token se clasifica como no-IPI o como uno de los tipos de IPI definidos en el esquema de Baroud et al. (2025). Las predicciones a nivel de token se agregan en spans mediante etiquetado BILOU (Begin, Inside, Last, Outside, Unit), lo que permite extraer entidades continuas de longitud variable.

No se han publicado detalles sobre el número de épocas, el tamaño exacto del subconjunto de entrenamiento ni el uso de técnicas como RLHF o DPO. El entrenamiento se limita a la tarea de clasificación de tokens, sin incorporar mecanismos adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Detección de Identificadores Personales Indirectos (IPI) en texto clínico en inglés.
- Clasificación de tokens en categorías de IPI (según el esquema de Baroud et al., 2025).
- Agregación de predicciones a nivel de token en spans mediante etiquetado BILOU.
- Procesamiento de notas médicas con contexto de hasta 512 tokens.
- Salida de etiquetas de clasificación de tokens, adecuada para pipelines de anonimización.
- No soporta tool calling, generación de texto libre ni capacidades multimodales.

## Casos de uso

- Anonimización de historiales clínicos para investigación: el modelo identifica IPIs en notas médicas, permitiendo eliminar o enmascarar automáticamente información que podría reidentificar a pacientes, facilitando el uso secundario de datos en estudios académicos.
- Cumplimiento normativo en entornos sanitarios: integrado en sistemas de gestión de registros médicos, ayuda a detectar IPIs antes de compartir datos con terceros, reduciendo el riesgo de violaciones de HIPAA.
- Preparación de datasets para entrenamiento de modelos de NLP clínico: al filtrar IPIs, se pueden construir corpus anonimizados para entrenar otros modelos sin comprometer la privacidad de los pacientes.
- Auditoría de documentos clínicos: el modelo puede revisar automáticamente notas generadas por profesionales para verificar que no contengan IPIs no intencionados antes de su publicación o intercambio.
- Soporte a sistemas de desidentificación en plataformas de salud digital: se puede desplegar como servicio de clasificación de tokens en APIs, integrándose en flujos de procesamiento de texto clínico.
- Investigación en privacidad diferencial: los spans detectados sirven como entrada para algoritmos de redacción selectiva, permitiendo evaluar el impacto de la eliminación de IPIs en la utilidad de los datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como F1, precisión o recall sobre conjuntos de prueba estándar para este modelo específico.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,4 GB en FP32 y 0,7 GB en FP16 (basado en el tamaño de parámetros).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1050 Ti, RTX 2060, o superiores. También puede ejecutarse en CPU con memoria RAM suficiente (alrededor de 2-3 GB).
- Compatible con GPUs de consumo: sí, cabe en tarjetas como RTX 3060, RTX 4060, etc.
- Opciones de despliegue: se puede usar con la librería `transformers` de Hugging Face, `ONNX Runtime`, o `TensorFlow Serving`. No se menciona soporte específico para vLLM, llama.cpp u Ollama, dado que es un modelo encoder de clasificación de tokens.
- Latencia y throughput: no se han publicado datos concretos; en una GPU moderna, la inferencia sobre un texto de 512 tokens debería completarse en decenas de milisegundos.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos fine-tuned específicamente para detección de IPIs en MIMIC-III con la misma arquitectura. Como referencia, se puede comparar con el modelo base `FacebookAI/roberta-large` (sin fine-tuning), que no está especializado en esta tarea y no produce etiquetas de IPI. Tampoco se han encontrado modelos alternativos en la búsqueda web que permitan una comparación directa.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés y sobre notas médicas de MIMIC-III, por lo que su rendimiento puede degradarse en otros dominios o idiomas.
- La ventana de contexto de 512 tokens limita el procesamiento de documentos largos; para notas extensas se requiere segmentación previa.
- No se han publicado evaluaciones de sesgos; el modelo puede reflejar sesgos presentes en los datos de entrenamiento, como desequilibrios demográficos en MIMIC-III.
- Riesgo de alucinación en la clasificación: aunque es una tarea de etiquetado, puede haber errores en la identificación de IPIs, especialmente en casos ambiguos o con formatos poco comunes.
- El dataset MIMIC-III tiene restricciones de acceso y uso (requiere aprobación de PhysioNet); aunque el modelo se distribuye con licencia Apache 2.0, los datos subyacentes no son de libre uso.
- No se proporcionan métricas de rendimiento, por lo que se recomienda validar el modelo en el propio corpus antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ibrahimbaroud/roberta-large-ipi-mimiciii
- Paper de referencia (Baroud et al., 2025): https://aclanthology.org/2025.privatenlp-main.7/
- Dataset de anotaciones IPI en Zenodo: https://zenodo.org/records/15372705
- Modelo base RoBERTa-large: https://huggingface.co/FacebookAI/roberta-large
- Paper original de RoBERTa: https://arxiv.org/pdf/1907.11692
