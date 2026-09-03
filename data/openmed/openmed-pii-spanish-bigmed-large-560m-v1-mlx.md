# OpenMed/OpenMed-PII-Spanish-BigMed-Large-560M-v1-mlx

## Resumen

OpenMed-PII-Spanish-BigMed-Large-560M-v1-mlx es un empaquetado en formato MLX del modelo OpenMed-PII-Spanish-BigMed-Large-560M-v1, un transformer de tipo XLM-RoBERTa (XLMRobertaForTokenClassification) fine-tuneado para la detección de información personal identificable (PII) y de salud (PHI) en texto clínico en español. El modelo original fue desarrollado por el equipo de OpenMed y está alojado en la plataforma Modelers.cn, dentro del ecosistema Huawei/Ascend. Esta versión MLX está pensada para ejecutarse de forma local y eficiente en dispositivos Apple Silicon (Mac, iPhone y iPad) mediante la librería OpenMed.

El modelo resuelve el problema de la desidentificación de registros médicos: identifica y etiqueta tokens como nombres de pacientes, fechas, ubicaciones, números de identificación y otros datos sensibles, permitiendo anonimizar documentos clínicos sin enviar datos a la nube. Con 560 millones de parámetros, es un modelo relativamente grande para esta tarea, lo que le permite capturar la complejidad del lenguaje biomédico en español. Su relevancia actual radica en el cumplimiento normativo (HIPAA, RGPD) y en la creciente demanda de soluciones de IA local-first en el sector sanitario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (XLMRobertaForTokenClassification) |
| Parametros totales | 560 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo MLX no especifica cuantizacion) |
| Idiomas soportados | Español (es) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors y/o NPZ (formato MLX) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura XLM-RoBERTa, un encoder transformer multilingüe preentrenado, adaptado mediante fine-tuning para la tarea de token classification (NER) sobre PII en español. El checkpoint original (OpenMed-PII-Spanish-BigMed-Large-560M-v1) fue entrenado específicamente para etiquetar entidades como nombres, fechas, ubicaciones y números de identificación en documentos médicos y clínicos en español. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. La versión MLX es una conversión del checkpoint original al formato de pesos de MLX, manteniendo la misma arquitectura y pesos, pero optimizada para inferencia en Apple Silicon. El repo MLX no incluye los assets del tokenizer; OpenMed y OpenMedKit recurren al tokenizer del modelo fuente referenciado en config.json.

## Capacidades

- Detección de PII/PHI en texto clínico en español: identifica nombres de pacientes, fechas, ubicaciones, números de identificación, teléfonos y otros datos sensibles.
- Token classification (NER) a nivel de token, con etiquetas definidas en id2label.json.
- Desidentificación de registros médicos: permite anonimizar documentos clínicos para cumplir normativas como HIPAA o RGPD.
- Integración con la API de OpenMed mediante la función `extract_pii`, que incluye opciones de fusión inteligente de entidades (`use_smart_merging`).
- Ejecución 100% local en Apple Silicon (Mac, iPhone, iPad) sin conexión a la nube, garantizando que los datos del paciente no salen de la red.
- Soporte dual de runtime: Python (a través de `openmed[mlx]`) y Swift (a través de OpenMedKit).
- Compatibilidad con el ecosistema OpenMed, que incluye más de 2.200 modelos médicos y soporte para 21 idiomas.

## Casos de uso

- Desidentificación de historias clínicas electrónicas: el modelo puede procesar notas clínicas en español y eliminar o enmascarar automáticamente los datos personales antes de almacenarlas o compartirlas, reduciendo el riesgo de filtraciones y facilitando el cumplimiento de la HIPAA.
- Anonimización de datos para investigación clínica: los investigadores pueden utilizar el modelo para limpiar conjuntos de datos médicos antes de publicarlos o utilizarlos en estudios, garantizando que no se pueda identificar a los pacientes.
- Cumplimiento normativo en entornos sanitarios: hospitales y clínicas pueden integrar el modelo en sus pipelines de procesamiento de documentos para auditar y redactar automáticamente la información sensible en informes, derivaciones y resúmenes de alta.
- Integración en pipelines de NLP clínico: al ser un modelo de token classification, puede combinarse con otros componentes (extracción de entidades médicas, clasificación de documentos) para construir sistemas de análisis de texto clínico que operen de forma local y privada.
- Despliegue en dispositivos Apple para uso en consulta: gracias a la versión MLX y OpenMedKit, el modelo puede ejecutarse en un iPhone o iPad, permitiendo a los profesionales sanitarios desidentificar notas sobre la marcha sin depender de conectividad.
- Procesamiento por lotes de documentos legados: el modelo puede aplicarse a archivos históricos de registros médicos en español para prepararlos para su digitalización o migración a sistemas modernos, asegurando que los datos personales estén protegidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre métricas como precisión, recall o F1 en tareas de NER para PII en español, ni comparaciones con otros modelos de desidentificación.

## Requisitos de hardware

- Diseñado para Apple Silicon: requiere un Mac con chip M1, M2, M3 o M4, o un iPhone/iPad físico con chip Apple Silicon (los simuladores de iOS no son compatibles con Swift MLX).
- Tamaño del repositorio: 2,2 GB, lo que da una idea del espacio en disco necesario para los pesos del modelo.
- Memoria: al ser un modelo de 560M parámetros en formato MLX, se estima que puede ejecutarse en dispositivos con al menos 8 GB de RAM unificada, aunque no se han publicado requisitos oficiales de VRAM.
- Opciones de despliegue: Python con `openmed[mlx]`, Swift con OpenMedKit, o uso directo del directorio local del modelo con la API de OpenMed.
- No se dispone de datos sobre latencia o throughput en diferentes dispositivos.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos similares de desidentificación de PII en español. No se han encontrado datos sobre alternativas comparables en cuanto a tamaño, arquitectura o rendimiento.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para español y para el dominio médico/clínico; su rendimiento en otros idiomas o dominios puede ser deficiente.
- No se han publicado benchmarks ni evaluaciones independientes, por lo que se desconoce su precisión real en entornos de producción.
- El repositorio MLX no incluye el tokenizer; depende del modelo fuente, lo que puede complicar el despliegue en entornos sin acceso a Hugging Face.
- El repo puede estar marcado como privado en algunos entornos, requiriendo autenticación con `HF_TOKEN` para su descarga.
- Al ser un modelo de encoder (no generativo), no produce texto libre, pero puede presentar errores de etiquetado en entidades poco frecuentes o en textos con jerga muy especializada.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe verificar que el uso previsto cumple con las normativas de protección de datos sanitarios aplicables.
- No se han documentado sesgos específicos, pero al derivar de XLM-RoBERTa, puede heredar sesgos presentes en los datos de preentrenamiento.

## Enlaces

- Repositorio MLX en Hugging Face: https://huggingface.co/OpenMed/OpenMed-PII-Spanish-BigMed-Large-560M-v1-mlx
- Checkpoint original: https://huggingface.co/OpenMed/OpenMed-PII-Spanish-BigMed-Large-560M-v1
- Repositorio de OpenMed en GitHub: https://github.com/maziyarpanahi/openmed
- Documentación del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentación de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
- Ficha del modelo en AICHINA.news: https://aichina.news/models/OpenMed/OpenMed-PII-Spanish-BigMed-Large-560M-v1-mlx/
