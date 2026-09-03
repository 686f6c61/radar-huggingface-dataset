# OpenMed/OpenMed-PII-Portuguese-BiomedELECTRA-Base-110M-v1-mlx

## Resumen

OpenMed-PII-Portuguese-BiomedELECTRA-Base-110M-v1-mlx es un empaquetado en formato MLX del modelo de clasificación de tokens OpenMed-PII-Portuguese-BiomedELECTRA-Base-110M-v1, desarrollado por OpenMed para la detección de información personal identificable (PII) en texto clínico y biomédico en portugués. El modelo base es un fine-tuning de BiomedELECTRA, un transformer basado en la arquitectura BERT, con 110 millones de parámetros, orientado a tareas de token classification como la identificación de nombres de pacientes, fechas, identificadores y datos de contacto para su posterior anonimización o redacción.

Este artefacto MLX está pensado para ejecutarse de forma local en Apple Silicon mediante la librería OpenMed, que ofrece un backend MLX optimizado para Macs. La relevancia de este modelo radica en su capacidad para realizar desidentificación de datos clínicos de forma 100% local, sin enviar información sensible a la nube, cumpliendo con requisitos de privacidad como HIPAA. El repositorio incluye los pesos en formato safetensors, el config.json, el id2label.json y los assets del tokenizador, listos para usar con la API de OpenMed.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (BertForTokenClassification) basado en BiomedELECTRA |
| Parametros totales | 110 millones (según nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugués (pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (y/o npz en el layout MLX) |

## Arquitectura y entrenamiento

El modelo base es un fine-tuning de BiomedELECTRA, un modelo de la familia BERT preentrenado en dominios biomédicos. La arquitectura es un transformer encoder con clasificación de tokens (BertForTokenClassification), que asigna una etiqueta a cada token de entrada para identificar entidades PII. El proceso de entrenamiento consistió en un ajuste fino del checkpoint de BiomedELECTRA sobre un dataset de texto clínico en portugués, aunque no se han publicado detalles específicos sobre el volumen de datos, la composición del dataset ni el uso de técnicas como RLHF o DPO. El empaquetado MLX no modifica la arquitectura, solo convierte los pesos al formato optimizado para Apple Silicon.

## Capacidades

- Detección de información personal identificable (PII) en texto clínico y biomédico en portugués, incluyendo nombres de pacientes, fechas, identificadores, direcciones y datos de contacto.
- Clasificación de tokens a nivel de entidad, con soporte para etiquetas personalizadas definidas en el archivo id2label.json.
- Integración con la API de OpenMed para extracción de PII, incluyendo la opción de "smart merging" para combinar entidades fragmentadas.
- Ejecución local en Apple Silicon mediante el backend MLX, sin necesidad de conexión a internet ni envío de datos a servidores externos.
- Compatibilidad con el ecosistema OpenMed, que incluye más de 2.200 modelos médicos y soporte para 21 idiomas (aunque este modelo específico está limitado al portugués).
- Posibilidad de uso en entornos Python y, según la documentación, en desarrollo Swift a través de OpenMedKit (aunque el soporte Swift está en evaluación).

## Casos de uso

- Desidentificación de historias clínicas electrónicas: el modelo puede procesar notas clínicas en portugués y marcar automáticamente los campos PII (nombre, fecha de nacimiento, número de historia, etc.) para su redacción antes de compartir los datos con terceros o para investigación.
- Cumplimiento normativo (LGPD, HIPAA): integrado en pipelines de datos sanitarios, permite anonimizar registros de pacientes de forma local, garantizando que la información sensible no salga de la infraestructura del hospital o centro de investigación.
- Preparación de datasets para entrenamiento de modelos médicos: antes de utilizar textos clínicos para fine-tuning, se puede aplicar este modelo para eliminar PII y evitar fugas de información personal en los conjuntos de entrenamiento.
- Auditoría de privacidad en documentos clínicos: el modelo puede escanear documentos existentes y reportar la presencia de PII, ayudando a las organizaciones a identificar riesgos de exposición de datos.
- Aplicaciones móviles de salud: gracias al formato MLX y al soporte de Apple Silicon, el modelo puede ejecutarse en dispositivos iPhone o Mac para procesar notas clínicas localmente, sin depender de servicios en la nube.
- Investigación biomédica colaborativa: al permitir la desidentificación local, facilita el intercambio de datos clínicos entre instituciones sin violar acuerdos de confidencialidad, ya que los datos se anonimizan antes de salir del entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser un modelo de 110 millones de parámetros, es ligero y puede ejecutarse en hardware modesto, aunque no se especifican requisitos exactos de VRAM.
- Diseñado para Apple Silicon: requiere un Mac con chip M1 o superior para aprovechar el backend MLX de OpenMed.
- En sistemas sin Apple Silicon, OpenMed puede recurrir al backend PyTorch/Hugging Face, lo que permite ejecutarlo en GPUs convencionales (por ejemplo, NVIDIA) o incluso en CPU, aunque con menor rendimiento.
- Opciones de despliegue: mediante la librería OpenMed con `pip install "openmed[mlx]"`, o descargando el repositorio y apuntando la API a la carpeta local.
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en portugués y en dominios biomédicos; su rendimiento en otros idiomas o dominios puede ser significativamente inferior.
- Al ser un modelo de clasificación de tokens, no genera texto, por lo que no presenta riesgo de alucinación generativa, pero puede cometer errores de etiquetado (falsos positivos o negativos) en la detección de PII.
- La longitud de contexto no está documentada; los modelos BERT suelen tener un límite de 512 tokens, pero no se confirma para este caso, lo que puede limitar el procesamiento de documentos largos.
- No se han publicado métricas de rendimiento ni estudios de sesgos; se recomienda validar el modelo en el corpus específico antes de usarlo en producción.
- Aunque la licencia es Apache-2.0, el uso en entornos sanitarios debe cumplir con las normativas locales de protección de datos (LGPD en Brasil, GDPR en Europa, HIPAA en EE. UU.), y la responsabilidad de la anonimización recae en el usuario.
- El soporte Swift/OpenMedKit está en fase de evaluación; para aplicaciones iOS se recomienda usar Python MLX o CoreML con una exportación propia.

## Enlaces

- Repositorio MLX en HuggingFace: https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-BiomedELECTRA-Base-110M-v1-mlx
- Modelo base: https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-BiomedELECTRA-Base-110M-v1
- GitHub de OpenMed: https://github.com/maziyarpanahi/openmed
- Documentación del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentación de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
- Web de OpenMed: https://openmed.life/
