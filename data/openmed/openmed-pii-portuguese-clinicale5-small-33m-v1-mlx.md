# OpenMed/OpenMed-PII-Portuguese-ClinicalE5-Small-33M-v1-mlx

## Resumen

OpenMed-PII-Portuguese-ClinicalE5-Small-33M-v1-mlx es un empaquetado en formato MLX del modelo homónimo de OpenMed, una organización centrada en IA clínica local-first. Se trata de un modelo de clasificación de tokens (token classification) basado en la arquitectura BERT, específicamente `BertForTokenClassification`, fine-tuneado para la detección de información personal identificable (PII) en texto clínico en portugués. Su propósito es etiquetar entidades como nombres de pacientes, fechas, ubicaciones, números de identificación y otros datos sensibles, permitiendo la desidentificación de registros médicos antes de su análisis o compartición.

El modelo tiene aproximadamente 33 millones de parámetros (según su denominación) y está diseñado para ejecutarse íntegramente en dispositivos Apple Silicon mediante el runtime MLX de OpenMed, sin necesidad de infraestructura en la nube. Esto lo hace relevante para entornos sanitarios donde la privacidad del paciente es crítica y los datos no deben salir de la red local. No es un chatbot ni un modelo generativo; es una herramienta especializada y ligera que se integra en pipelines de preprocesamiento de datos clínicos. La licencia Apache-2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (`BertForTokenClassification`) |
| Parametros totales | 33M (segun nombre del modelo, no confirmado oficialmente) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (tipicamente 512 tokens para BERT, no confirmado) |
| Tipos de cuantizacion | no disponible (formato MLX, sin detalle de cuantizacion) |
| Idiomas soportados | Portugues (pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT, un transformer encoder-only preentrenado, adaptado para la tarea de clasificación de tokens mediante una cabeza de clasificación por token (`BertForTokenClassification`). El checkpoint original fue fine-tuneado específicamente para la detección de PII en texto clínico en portugués, aunque no se han publicado detalles sobre el dataset de entrenamiento, el número de épocas o el proceso de ajuste (por ejemplo, si se usó alguna técnica de regularización o aumentación de datos). El empaquetado MLX convierte los pesos originales a un formato optimizado para Apple Silicon, manteniendo la misma arquitectura y comportamiento.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus ni si se aplicaron técnicas como RLHF o DPO, ya que se trata de un modelo discriminativo de clasificación, no generativo. La innovación principal no reside en la arquitectura, sino en su empaquetado para inferencia local eficiente en hardware Apple mediante el framework OpenMed, que permite ejecutar el modelo sin conexión y con privacidad total de los datos.

## Capacidades

- Deteccion y etiquetado de entidades PII en texto clinico en portugues: nombres de pacientes, fechas, ubicaciones, numeros de identificacion, telefonos, correos electronicos, etc.
- Clasificacion de tokens a nivel de token (token-level classification), con soporte para fusion inteligente de entidades (smart merging) para agrupar tokens contiguos en entidades completas.
- Inferencia local en Apple Silicon mediante el backend MLX de OpenMed, sin necesidad de conexion a internet ni envio de datos a servidores externos.
- Integracion sencilla en pipelines de preprocesamiento mediante la API `extract_pii` de OpenMed, que devuelve entidades con etiqueta, texto y nivel de confianza.
- Compatibilidad con el ecosistema OpenMed, que incluye mas de 2.200 modelos medicos y soporte para multiples idiomas (aunque este modelo concreto es solo portugues).
- No es un modelo generativo: no produce texto libre, no soporta tool calling, ni razonamiento multi-paso, ni capacidades de vision o audio.

## Casos de uso

- Desidentificacion de historias clinicas electronicas: el modelo puede procesar notas medicas en portugues y eliminar o enmascarar automaticamente los datos personales antes de que los registros se utilicen para investigacion, auditoria o formacion, cumpliendo con normativas de privacidad como la LGPD (Ley General de Proteccion de Datos de Brasil).
- Preparacion de datasets para investigacion biomedica: al integrarse en un pipeline de preprocesamiento, permite limpiar grandes volumenes de texto clinico de PII antes de entrenar otros modelos o realizar analisis estadistico, reduciendo el riesgo de reidentificacion de pacientes.
- Cumplimiento normativo en entornos hospitalarios: hospitales y clinicas en paises lusofonos pueden desplegar el modelo en servidores locales o en dispositivos Apple para garantizar que los datos de pacientes no salen de la infraestructura, facilitando la conformidad con HIPAA o equivalentes locales.
- Anonimizacion de datos para intercambio entre instituciones: cuando se comparten registros medicos entre hospitales o con terceros, el modelo puede anonimizar los documentos de forma automatica, evitando la exposicion accidental de informacion sensible.
- Auditoria de registros existentes: el modelo puede analizar bases de datos historicas de texto clinico para identificar y catalogar PII residual, ayudando a las organizaciones a evaluar su nivel de exposicion y a priorizar acciones de remediacion.
- Desarrollo de aplicaciones de salud en dispositivos Apple: gracias a su formato MLX, el modelo puede integrarse en aplicaciones iOS o macOS que procesen texto clinico localmente, por ejemplo, para asistir a profesionales sanitarios en la redaccion de notas o en la revision de historiales sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este modelo en la informacion disponible. La organizacion OpenMed afirma en su sitio web ser "estado del arte en 10 de 12 benchmarks de NER biomedico" a nivel general, pero no se proporcionan cifras concretas ni comparaciones con otros modelos de PII en portugues. Por tanto, no es posible presentar una tabla de rendimiento verificable.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 33 millones de parametros, su huella de memoria es reducida: en precision fp32 ocuparia unos 132 MB, y en fp16 unos 66 MB, aunque no se ha confirmado el formato exacto de los pesos MLX.
- VRAM estimada para inferencia: no disponible oficialmente, pero por el tamano del modelo se espera que quepa en cualquier Mac con Apple Silicon, incluso en modelos con memoria unificada de 8 GB.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3 o posteriores) con el backend MLX de OpenMed. No requiere GPU dedicada de NVIDIA.
- Opciones de despliegue: mediante la libreria `openmed[mlx]` en Python, o descargando el repositorio MLX directamente y usandolo con la API de OpenMed. Tambien se menciona compatibilidad futura con OpenMedKit para Swift en aplicaciones Apple.
- Latencia y throughput: no disponibles. Dado el tamano del modelo, se espera una latencia de milisegundos por documento en hardware Apple Silicon, pero no hay datos publicados.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de desidentificacion de PII en portugues. No se han encontrado alternativas equivalentes en la documentacion proporcionada. Se recomienda consultar el ecosistema OpenMed, que incluye multiples modelos de PII para otros idiomas, pero no hay datos publicos de rendimiento relativo.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para portugues; no funcionara correctamente con texto en otros idiomas.
- Al ser un modelo de clasificacion de tokens, no genera explicaciones ni texto; solo produce etiquetas y confianzas. No debe utilizarse como asistente conversacional.
- La longitud de contexto no esta confirmada, pero los modelos BERT tipicamente soportan hasta 512 tokens. Textos clinicos mas largos deberan segmentarse, lo que puede afectar a la coherencia de las entidades detectadas.
- Riesgo de errores de etiquetado: como cualquier modelo de NER, puede omitir entidades o etiquetar incorrectamente ciertos tokens, especialmente con variaciones dialectales del portugues o formatos de datos poco comunes. Se recomienda revision humana en aplicaciones criticas.
- No se han publicado datos sobre sesgos especificos, pero es probable que el modelo refleje sesgos presentes en los datos de entrenamiento clinico, que pueden no ser representativos de todas las poblaciones lusofonas.
- La licencia Apache-2.0 permite uso comercial y modificacion, pero el modelo se distribuye sin garantias; el usuario es responsable de validar su rendimiento en su caso de uso concreto.
- Para produccion, se recomienda evaluar el modelo con datos propios y considerar la posibilidad de false positives/negatives en la desidentificacion, ya que un fallo podria comprometer la privacidad de los pacientes.

## Enlaces

- Repositorio HuggingFace del modelo MLX: https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-ClinicalE5-Small-33M-v1-mlx
- Checkpoint original (PyTorch): https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-ClinicalE5-Small-33M-v1
- Repositorio GitHub de OpenMed: https://github.com/maziyarpanahi/openmed
- Documentacion del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentacion de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
- Sitio web de OpenMed: https://openmed.life/
- Articulo de presentacion del modelo: https://aichina.news/blog/meet-openmed-pii-portuguese-a-tiny-apache-2-0-model-for-de-fgmqx3/
