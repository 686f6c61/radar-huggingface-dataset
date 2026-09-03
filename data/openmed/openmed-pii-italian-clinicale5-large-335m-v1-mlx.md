# OpenMed/OpenMed-PII-Italian-ClinicalE5-Large-335M-v1-mlx

## Resumen

OpenMed-PII-Italian-ClinicalE5-Large-335M-v1-mlx es un empaquetado en formato MLX del modelo de clasificación de tokens OpenMed-PII-Italian-ClinicalE5-Large-335M-v1, desarrollado por el proyecto OpenMed para la detección y anonimización de información personal identificable (PII) en texto clínico en italiano. El modelo base es un fine-tuning de un modelo de la familia E5-Large (arquitectura BERT) con 335 millones de parámetros, especializado en el reconocimiento de entidades nombradas de tipo PII dentro de historiales médicos y notas clínicas.

La relevancia de este modelo radica en su enfoque local-first: está diseñado para ejecutarse íntegramente en el dispositivo, sin enviar datos de pacientes a la nube, lo que resulta crítico en entornos sanitarios con requisitos de privacidad estrictos. La versión MLX permite su ejecución nativa en hardware Apple Silicon (Mac, iPhone y iPad) mediante la librería OpenMed, con soporte tanto en Python como en Swift.

El repositorio contiene los pesos en formato MLX (safetensors y/o npz), junto con los archivos de configuración y el mapeo de etiquetas. No incluye el tokenizador, que se resuelve por referencia al modelo fuente. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (BertForTokenClassification) |
| Parametros totales | 335M (segun nombre del modelo, no confirmado en documentacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos MLX en safetensors/npz, sin cuantizacion indicada) |
| Idiomas soportados | Italiano (it) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (weights.safetensors y/o weights.npz), config.json, id2label.json |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT, concretamente en la variante E5-Large, que emplea un transformer encoder con atención bidireccional. La capa de salida es una cabeza de clasificación de tokens (BertForTokenClassification) que asigna a cada token una etiqueta de entidad PII. El modelo original fue fine-tuneado para la detección de PII en texto clínico italiano, y esta versión MLX es una conversión de pesos para su ejecución eficiente en Apple Silicon.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados ni las técnicas de alineación (RLHF, DPO, etc.). El proyecto OpenMed, en su conjunto, declara cubrir 55+ tipos de PHI y 21 idiomas, pero estos datos no son específicos de este modelo concreto. La conversión a MLX no modifica la arquitectura ni los pesos, solo el formato de almacenamiento y el runtime de inferencia.

## Capacidades

- Detección de entidades PII en texto clínico italiano: nombres, fechas de nacimiento, direcciones, números de identificación, etc.
- Clasificación de tokens con etiquetas predefinidas (mapeo en id2label.json).
- Extracción de entidades con nivel de confianza asociado.
- Integración con la API de OpenMed para extracción de PII con fusión inteligente de entidades (smart merging).
- Ejecución 100% local en Apple Silicon (Mac, iPhone, iPad) sin conexión a la nube.
- Soporte de backend MLX en Python y Swift (OpenMedKit).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni generación de texto libre.

## Casos de uso

- Anonimización de historias clínicas en hospitales italianos: el modelo procesa notas clínicas y marca automáticamente los campos PII para su posterior enmascaramiento, cumpliendo normativas de privacidad como el RGPD.
- Preparación de datasets de investigación médica: antes de compartir datos clínicos con terceros, se aplica el modelo para eliminar identificadores personales y reducir el riesgo de reidentificación.
- Cumplimiento normativo en ensayos clínicos: los documentos de consentimiento y registros de pacientes se procesan localmente para garantizar que no se filtren datos sensibles.
- Aplicaciones móviles de salud: integración en apps iOS que gestionan notas del paciente, donde la de-identificación se realiza en el propio dispositivo del usuario.
- Sistemas de gestión de expedientes electrónicos: el modelo se integra en el backend hospitalario para limpiar automáticamente los campos de texto libre antes de su almacenamiento o exportación.
- Auditoría de seguridad de datos: revisión de logs y comunicaciones internas para detectar fugas accidentales de PII en texto clínico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este modelo en la información disponible. El proyecto OpenMed menciona en su web "state of the art on 10 of 12 biomedical NER benchmarks", pero no se detalla qué modelos concretos alcanzan esos resultados ni si este modelo en particular está incluido. No se dispone de métricas como F1, precisión o recall para la tarea de detección de PII en italiano.

## Requisitos de hardware

- Diseñado para Apple Silicon: requiere un Mac con chip M1 o superior, o un iPhone/iPad con chip A12 Bionic o posterior.
- Tamaño del repositorio: 1.3 GB, lo que da una estimación del espacio en disco necesario.
- Memoria: al ser un modelo de 335M parámetros en MLX, se estima que puede ejecutarse en dispositivos con al menos 4 GB de memoria unificada, aunque no se proporcionan cifras oficiales.
- Opciones de despliegue: librería OpenMed con backend MLX en Python (`pip install "openmed[mlx]"`), o OpenMedKit en Swift para macOS y dispositivos iOS reales (no simulador).
- No se documentan opciones de despliegue en GPU NVIDIA, CUDA o servidores tradicionales; el formato MLX está orientado exclusivamente a Apple Silicon.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de detección de PII en italiano. El proyecto OpenMed ofrece más de 2.200 modelos médicos en 21 idiomas, pero no se han encontrado datos comparativos de rendimiento, parámetros o contexto entre ellos. Se recomienda consultar el catálogo de OpenMed para evaluar alternativas según el idioma y el tipo de entidad.

## Limitaciones y advertencias

- Modelo especializado únicamente en italiano; no es adecuado para otros idiomas sin reentrenamiento.
- No se documentan sesgos específicos, pero al ser un modelo entrenado en dominios clínicos, puede presentar un rendimiento inferior en textos no médicos o con jerga coloquial.
- Riesgo de alucinación en la clasificación de tokens: aunque es un modelo discriminativo, puede etiquetar incorrectamente entidades en contextos ambiguos.
- La longitud de contexto no está especificada; los modelos BERT suelen limitarse a 512 tokens, lo que puede requerir segmentación de documentos largos.
- El tokenizador no está incluido en el repositorio MLX; se resuelve por referencia al modelo fuente, lo que requiere acceso a Hugging Face para descargarlo.
- El repositorio tiene muy pocas descargas (7) y no cuenta con valoraciones de la comunidad, por lo que su madurez en producción no está contrastada.
- Aunque la licencia Apache-2.0 permite uso comercial, la precisión del modelo en entornos clínicos reales debe validarse con datos propios antes de su despliegue.

## Enlaces

- Repositorio MLX en Hugging Face: https://huggingface.co/OpenMed/OpenMed-PII-Italian-ClinicalE5-Large-335M-v1-mlx
- Modelo base (checkpoint fuente): https://huggingface.co/OpenMed/OpenMed-PII-Italian-ClinicalE5-Large-335M-v1
- Repositorio GitHub de OpenMed: https://github.com/maziyarpanahi/openmed
- Documentación del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentación de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
- Sitio web de OpenMed: https://openmed.life/
