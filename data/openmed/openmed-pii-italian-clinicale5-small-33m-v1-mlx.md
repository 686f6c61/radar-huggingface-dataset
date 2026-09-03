# OpenMed/OpenMed-PII-Italian-ClinicalE5-Small-33M-v1-mlx

## Resumen

OpenMed-PII-Italian-ClinicalE5-Small-33M-v1-mlx es un modelo de clasificación de tokens (token classification) especializado en la detección de información personal identificable (PII) en texto clínico en italiano. Desarrollado por la organización OpenMed, este modelo es un empaquetado en formato MLX del checkpoint original `OpenMed/OpenMed-PII-Italian-ClinicalE5-Small-33M-v1`, diseñado para ejecutarse de forma eficiente en hardware Apple Silicon (macOS, iPhone y iPad) mediante la librería OpenMed y OpenMedKit.

El modelo se basa en la arquitectura BERT (`BertForTokenClassification`) con 33 millones de parámetros, y está entrenado para identificar y clasificar 54 tipos de entidades sensibles, como nombres, direcciones, números de seguridad social, números de registro médico, entre otros. Su relevancia radica en permitir la de-identificación de datos clínicos de forma local, sin enviar información del paciente a la nube, cumpliendo así con requisitos de privacidad como HIPAA. La licencia Apache-2.0 facilita su uso comercial y su integración en pipelines de procesamiento de lenguaje natural en el ámbito sanitario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (BertForTokenClassification) |
| Parametros totales | 33 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato MLX, sin especificar cuantizaciones) |
| Idiomas soportados | Italiano (it) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (weights.safetensors y/o weights.npz) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura BERT, un transformer encoder bidireccional, adaptado para la tarea de clasificación de tokens. El checkpoint original fue fine-tuneado a partir de un modelo base (posiblemente un E5-Small, aunque no se detalla) para la detección de PII en dominios clínicos italianos. No se proporcionan datos específicos sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. La innovación principal de este repositorio es su empaquetado en formato MLX, que permite la inferencia nativa en Apple Silicon mediante la librería OpenMed, con soporte tanto en Python como en Swift (OpenMedKit). El tokenizer no se incluye en el repositorio MLX; se referencia al tokenizer del modelo base en `config.json` para mantener compatibilidad.

## Capacidades

- Detección y clasificación de 54 tipos de PII en texto clínico italiano, incluyendo nombres, direcciones, números de seguridad social, números de registro médico, fechas, etc.
- Token classification a nivel de token, con salida de etiquetas y confianza por entidad.
- Integración con la librería OpenMed, que ofrece una API unificada (`extract_pii`) con selección automática de backend (MLX en Apple Silicon, PyTorch en otros sistemas).
- Soporte para "smart merging" de entidades, que agrupa tokens adyacentes para formar entidades completas.
- Ejecución 100% local, sin necesidad de conexión a internet ni envío de datos a servidores externos.
- Compatibilidad con Swift MLX en dispositivos Apple (macOS, iPhone, iPad), permitiendo su uso en aplicaciones móviles de salud.

## Casos de uso

- Anonimización de historias clínicas electrónicas: el modelo puede procesar notas clínicas en italiano y eliminar o enmascarar automáticamente los datos personales antes de su uso en investigación o análisis secundario.
- Cumplimiento de normativas de privacidad (GDPR, HIPAA): integración en sistemas de gestión de datos sanitarios para garantizar que la información del paciente no se exponga en entornos no autorizados.
- Preparación de datasets para entrenamiento de modelos médicos: al de-identificar grandes volúmenes de texto clínico, se pueden crear conjuntos de datos anónimos para entrenar otros modelos sin comprometer la privacidad.
- Aplicaciones móviles de salud: gracias a su formato MLX y soporte Swift, puede ejecutarse en iPhone o iPad para procesar texto clínico directamente en el dispositivo, sin latencia de red.
- Auditoría de datos: revisión de documentos clínicos para verificar que no contengan información personal antes de su publicación o compartición.
- Integración en pipelines de NLP clínico: como componente de preprocesamiento en sistemas de extracción de información, resumen o análisis de sentimiento, donde la eliminación de PII es un paso previo obligatorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K, ya que el modelo está especializado en una tarea de NER y no en tareas generales de lenguaje. Tampoco se ofrecen comparativas con otros modelos de de-identificación en la documentación consultada.

## Requisitos de hardware

- Al ser un modelo de 33 millones de parámetros, es ligero y puede ejecutarse en dispositivos con recursos limitados.
- Diseñado específicamente para Apple Silicon: requiere un Mac con chip M1 o posterior, o un iPhone/iPad con chip A14 o posterior (para Swift MLX).
- No se especifican requisitos de VRAM, pero al ser un modelo pequeño, es probable que quepa en la memoria unificada de cualquier Mac con Apple Silicon (8 GB o más).
- Opciones de despliegue: mediante la librería OpenMed en Python (`pip install "openmed[mlx]"`) o mediante OpenMedKit en Swift. También se puede usar el backend PyTorch en sistemas sin Apple Silicon.
- No se proporcionan datos de latencia o throughput, pero al ser un modelo BERT pequeño, se espera una inferencia rápida en hardware Apple.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se han identificado alternativas específicas para la de-identificación de PII en italiano clínico con las que comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para texto clínico en italiano; su rendimiento en otros idiomas o dominios (legal, financiero, etc.) no está garantizado.
- No se incluye el tokenizer en el repositorio MLX; se depende del tokenizer del modelo base, lo que puede requerir descargar el checkpoint original si no se dispone de él.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado en un dominio concreto, puede presentar errores en entidades poco frecuentes o en variantes dialectales del italiano.
- Riesgo de alucinación en la clasificación: como todo modelo de NER, puede etiquetar incorrectamente tokens que no son PII o fallar en detectar algunas entidades, por lo que se recomienda supervisión humana en entornos críticos.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar el cumplimiento de las normativas locales de protección de datos al desplegar el modelo en producción.
- El repositorio MLX es un empaquetado para compatibilidad; para un uso avanzado (fine-tuning, etc.) se debe recurrir al modelo base en PyTorch.

## Enlaces

- Repositorio MLX en HuggingFace: [https://huggingface.co/OpenMed/OpenMed-PII-Italian-ClinicalE5-Small-33M-v1-mlx](https://huggingface.co/OpenMed/OpenMed-PII-Italian-ClinicalE5-Small-33M-v1-mlx)
- Checkpoint original: [https://huggingface.co/OpenMed/OpenMed-PII-Italian-ClinicalE5-Small-33M-v1](https://huggingface.co/OpenMed/OpenMed-PII-Italian-ClinicalE5-Small-33M-v1)
- Repositorio GitHub de OpenMed: [https://github.com/maziyarpanahi/openmed](https://github.com/maziyarpanahi/openmed)
- Documentación del backend MLX: [https://openmed.life/docs/mlx-backend/](https://openmed.life/docs/mlx-backend/)
- Documentación de OpenMedKit (Swift): [https://openmed.life/docs/swift-openmedkit/](https://openmed.life/docs/swift-openmedkit/)
