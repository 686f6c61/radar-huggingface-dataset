# OpenMed/OpenMed-PII-Spanish-BiomedBERTFull-Base-110M-v1-mlx

## Resumen

OpenMed-PII-Spanish-BiomedBERTFull-Base-110M-v1-mlx es un modelo de clasificación de tokens (NER) especializado en la detección de información personal identificable (PII) en texto clínico en español. Desarrollado por la organización OpenMed, se basa en el checkpoint BiomedBERTFull-Base-110M-v1, un encoder BERT de 110 millones de parámetros, y se distribuye empaquetado en formato MLX para permitir inferencia eficiente en dispositivos Apple Silicon. El modelo resuelve el problema de la de-identificación de historias clínicas, un requisito crítico para compartir datos médicos cumpliendo normativas como HIPAA o el RGPD.

Su relevancia actual radica en que permite ejecutar la detección de PII completamente en local, sin enviar datos de pacientes a la nube, lo que lo hace adecuado para entornos sanitarios con estrictos requisitos de privacidad. El empaquetado MLX facilita su uso tanto desde Python (a través de la librería OpenMed) como desde Swift (con OpenMedKit), cubriendo macOS, iPhone y iPad. Al tratarse de un modelo de 110M, es ligero y puede ejecutarse en hardware de consumo, aunque la información disponible no especifica la longitud de contexto ni detalles del entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (BertForTokenClassification) |
| Parametros totales | 110 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Español (es) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (weights.safetensors y/o weights.npz) |

## Arquitectura y entrenamiento

El modelo es un encoder BERT base de 110 millones de parámetros, fine-tuneado para la tarea de token classification sobre PII en texto clínico español. Se parte del checkpoint BiomedBERTFull-Base-110M-v1, que a su vez es una variante de BERT adaptada al dominio biomédico. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni si se emplearon técnicas como RLHF o DPO. La innovación principal de este repositorio no está en la arquitectura, sino en el empaquetado en formato MLX, que permite una inferencia optimizada en Apple Silicon mediante la librería OpenMed, con soporte tanto para Python como para Swift (OpenMedKit). El repositorio no incluye el tokenizer, sino que referencia el del modelo base en el archivo config.json.

## Capacidades

- Detección de entidades PII en texto clínico en español: nombres de pacientes, direcciones, fechas, números de identificación, etc.
- Clasificación de tokens a nivel de etiqueta (token classification / NER).
- Integración con la API `extract_pii` de OpenMed, que permite extraer entidades con confianza y opción de "smart merging" para agrupar tokens relacionados.
- Ejecución en local en Apple Silicon mediante MLX, sin necesidad de conexión a la nube.
- Soporte multiplataforma: Python (con backend MLX o PyTorch/Hugging Face en otros sistemas) y Swift (OpenMedKit para macOS, iPhone y iPad físicos).
- Compatibilidad con el ecosistema OpenMed, que incluye más de 2.200 modelos médicos y 21 idiomas, aunque este modelo concreto está limitado al español.

## Casos de uso

- De-identificación de historias clínicas para investigación: el modelo puede procesar notas clínicas en español y eliminar o enmascarar automáticamente los campos PII antes de compartir los datos con equipos de investigación o terceros, cumpliendo así con los requisitos de anonimización.
- Cumplimiento normativo en aplicaciones de salud: integrado en un pipeline de procesamiento de lenguaje natural, permite auditar documentos clínicos y detectar fugas de información personal antes de su publicación o transmisión, reduciendo el riesgo de sanciones por incumplimiento de HIPAA o RGPD.
- Anonimización de corpus para entrenar otros modelos: los desarrolladores pueden usar este modelo para limpiar grandes volúmenes de texto clínico en español, generando datasets anonimizados que luego sirven para entrenar modelos de lenguaje médicos sin exponer datos sensibles.
- Aplicaciones móviles de salud con procesamiento local: gracias al empaquetado MLX y al soporte de OpenMedKit, el modelo puede ejecutarse directamente en un iPhone o iPad, permitiendo que una app de gestión de pacientes detecte y oculte PII sin enviar datos a servidores externos.
- Herramientas de redacción asistida para profesionales médicos: un editor de notas clínicas puede usar el modelo para resaltar automáticamente cualquier información personal que el médico haya incluido por error, facilitando la corrección antes de guardar el documento.
- Auditoría de documentos clínicos en hospitales: el modelo puede integrarse en sistemas de gestión documental para revisar de forma periódica archivos históricos y localizar PII no anonimizada, ayudando a los departamentos de cumplimiento a mantener los estándares de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser un modelo de 110M de parámetros, es muy ligero y cabe en cualquier Mac con Apple Silicon (M1, M2, M3 o superior) con memoria unificada de 8 GB o más.
- Para la inferencia en Apple Silicon se recomienda usar el backend MLX de OpenMed, que aprovecha la GPU y la memoria unificada del chip.
- En otros sistemas (Linux, Windows, Mac Intel) se puede usar el backend PyTorch/Hugging Face, aunque no se especifican requisitos de VRAM; dado el tamaño, una GPU con 4 GB de VRAM sería suficiente.
- Opciones de despliegue: librería OpenMed en Python (`pip install "openmed[mlx]"`), OpenMedKit en Swift para macOS y dispositivos iOS/iPadOS físicos, o directamente con Hugging Face Transformers si se usa el checkpoint base.
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo pertenece a la familia de modelos NER biomédicos en español, pero no se han publicado comparativas con alternativas como otros BERT fine-tuneados para PII o modelos multilingües de de-identificación.

## Limitaciones y advertencias

- El modelo está entrenado únicamente para español; no debe usarse con texto en otros idiomas sin reentrenamiento.
- No se han publicado detalles sobre el dataset de entrenamiento, por lo que se desconocen posibles sesgos demográficos o geográficos en la detección de PII.
- Al ser un modelo de NER, puede producir falsos positivos (marcar texto no sensible como PII) o falsos negativos (no detectar PII real), por lo que se recomienda una revisión humana en entornos clínicos críticos.
- El repositorio MLX no incluye el tokenizer; depende del modelo base, lo que puede causar problemas si el checkpoint original no está disponible o cambia.
- La licencia Apache-2.0 permite uso comercial, pero es necesario verificar también la licencia del modelo base (BiomedBERTFull) y de cualquier dato utilizado en el fine-tuning.
- El modelo está diseñado para ejecutarse en local; aunque esto es una ventaja de privacidad, implica que el rendimiento depende del hardware del dispositivo.

## Enlaces

- Repositorio HuggingFace del modelo MLX: https://huggingface.co/OpenMed/OpenMed-PII-Spanish-BiomedBERTFull-Base-110M-v1-mlx
- Checkpoint base: https://huggingface.co/OpenMed/OpenMed-PII-Spanish-BiomedBERTFull-Base-110M-v1
- Repositorio GitHub de OpenMed: https://github.com/maziyarpanahi/openmed
- Documentación del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentación de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
- Artículo sobre el modelo: https://aichina.news/blog/spotting-sensitive-data-in-spanish-healthcare-the-new-openmed-pii-6sjofe/
