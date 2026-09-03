# OpenMed/OpenMed-PII-Portuguese-BigMed-Large-560M-v1-mlx

## Resumen

OpenMed-PII-Portuguese-BigMed-Large-560M-v1-mlx es un modelo de clasificacion de tokens (token classification) especializado en la deteccion de informacion personal identificable (PII) en texto clinico en portugues. Desarrollado por el equipo OpenMed, este artefacto es un empaquetado en formato MLX del checkpoint original OpenMed-PII-Portuguese-BigMed-Large-560M-v1, disenado para ejecutarse de forma eficiente en hardware Apple Silicon mediante el runtime OpenMed.

El modelo pertenece a la familia BERT, concretamente implementa la arquitectura XLMRobertaForTokenClassification, con 560 millones de parametros. Su proposito principal es la desidentificacion de historiales clinicos y documentos medicos, eliminando datos personales como nombres, direcciones, numeros de identificacion y otra informacion sensible protegida por normativas como HIPAA. La relevancia de este modelo radica en su enfoque local-first: permite procesar datos de pacientes sin que salgan del dispositivo, abordando las crecientes exigencias de privacidad en el sector sanitario.

Este repositorio concreto contiene los pesos en formato safetensors convertidos a MLX, lo que facilita su uso en Macs con chip Apple Silicon. El modelo base esta disponible en su repositorio original con soporte para PyTorch y Hugging Face, mientras que esta variante MLX se integra con la libreria openmed[mlx] para inferencia local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLMRobertaForTokenClassification (BERT) |
| Parametros totales | 560 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugues (pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX weights) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura XLM-RoBERTa, una variante de BERT disenada para soportar multiples idiomas mediante tokenizacion de subpalabras. En concreto, la cabeza de clasificacion es de tipo token classification, lo que permite etiquetar cada token individualmente como parte de una entidad PII o no. El checkpoint original fue ajustado (fine-tuning) a partir del modelo base OpenMed-PII-Portuguese-BigMed-Large-560M-v1, que a su vez deriva de la familia BGE-Large encoder.

Los datos de entrenamiento especificos no estan detallados en la informacion disponible, pero el modelo esta orientado a texto clinico en portugues, lo que sugiere un dataset de historiales medicos y documentos sanitarios anotados con entidades PII. No se menciona el uso de tecnicas como RLHF o DPO, ya que se trata de un modelo de clasificacion supervisada clasico, no de generacion de texto. La innovacion principal de este artefacto MLX es la conversion de los pesos a un formato optimizado para Apple Silicon, permitiendo inferencia eficiente en CPU/GPU unificada de los chips M-series.

## Capacidades

- Deteccion de entidades PII en texto clinico en portugues: nombres de pacientes, direcciones, numeros de telefono, fechas de nacimiento, numeros de identificacion y otros datos personales.
- Clasificacion token a token (sequence labeling), lo que permite identificar entidades a nivel de subpalabra con alta precision.
- Desidentificacion de documentos medicos: el modelo puede procesar historiales clinicos completos y marcar las entidades sensibles para su posterior anonimizacion.
- Integracion con el ecosistema OpenMed: compatible con la funcion extract_pii de la libreria openmed, que incluye smart merging para agrupar tokens en entidades completas.
- Ejecucion local en Apple Silicon mediante el backend MLX, sin necesidad de conexion a la nube.
- Soporte para despliegue en otros entornos mediante el checkpoint original en PyTorch/Hugging Face.
- Compatibilidad con OpenMedKit para desarrollo de aplicaciones Apple (Swift), aunque el soporte Swift para esta familia esta en fase de seguimiento.

## Casos de uso

- Desidentificacion de historiales clinicos en hospitales portugueses: el modelo puede procesar notas medicas y marcar automaticamente los datos personales antes de que los documentos se utilicen para investigacion o se compartan con terceros, cumpliendo con la normativa de proteccion de datos (LGPD en Brasil, RGPD en Portugal).
- Preparacion de datasets para investigacion medica: los equipos de investigacion pueden usar el modelo para anonimizar grandes volumenes de expedientes antes de publicarlos o compartirlos con colaboradores, reduciendo el riesgo de reidentificacion de pacientes.
- Cumplimiento normativo en clinicas privadas: las consultas y centros de salud pueden integrar el modelo en sus flujos de trabajo para garantizar que los documentos que salen de la organizacion no contengan informacion personal no autorizada.
- Procesamiento de datos en dispositivos moviles: gracias al formato MLX, el modelo puede ejecutarse en un iPhone o iPad, permitiendo a profesionales sanitarios desidentificar notas sobre la marcha sin enviar datos a servidores externos.
- Auditoria de seguridad en sistemas de salud: el modelo puede utilizarse como herramienta de verificacion para detectar fugas de PII en documentos internos, bases de datos o comunicaciones antes de que se produzca un incidente.
- Anonimizacion de textos para entrenamiento de otros modelos: los datos clinicos anonimizados con este modelo pueden servir como corpus de entrenamiento para otros sistemas de NLP medico, evitando problemas de privacidad en el desarrollo de nuevas herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas comparativas con otros modelos de deteccion de PII, ni metricas como precision, recall o F1 sobre datasets estandar. Se recomienda consultar el repositorio del checkpoint original para posibles actualizaciones.

## Requisitos de hardware

- El modelo esta optimizado para Apple Silicon (chips M1, M2, M3 y posteriores) mediante el backend MLX de OpenMed.
- VRAM estimada: al tratarse de un modelo de 560M de parametros en formato MLX, el uso de memoria en Macs con memoria unificada deberia ser inferior a 2 GB, aunque el dato exacto no esta disponible.
- GPU recomendadas: cualquier Mac con chip Apple Silicon y al menos 8 GB de memoria unificada deberia poder ejecutar el modelo sin problemas.
- No se recomienda su uso en GPUs NVIDIA o AMD mediante el formato MLX; para esos entornos existe el checkpoint original en PyTorch.
- Opciones de despliegue: libreria openmed[mlx] en Python, descarga directa del repositorio para uso offline, y OpenMedKit para aplicaciones Swift en Apple.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos de deteccion de PII en portugues. El ecosistema OpenMed incluye modelos similares para otros idiomas y tamanos, pero no se han publicado comparaciones directas. Alternativas generales de deteccion de PII como Presidio o modelos basados en spaCy podrian ser comparables, pero no hay datos de rendimiento disponibles para este modelo concreto.

## Limitaciones y advertencias

- El modelo esta entrenado especificamente para portugues; su rendimiento en otros idiomas no esta garantizado y probablemente sea deficiente.
- No se han publicado datos sobre sesgos o errores sistematicos. Como cualquier modelo de NLP, puede fallar en la deteccion de entidades poco frecuentes o en textos con ortografia no estandar.
- Riesgo de alucinacion: al ser un modelo de clasificacion y no de generacion, el riesgo de alucinacion es bajo, pero puede producir falsos positivos o negativos en la deteccion de PII.
- La longitud de contexto no esta documentada; los modelos basados en BERT suelen tener un limite de 512 tokens, lo que puede requerir dividir documentos largos en segmentos.
- La licencia Apache-2.0 permite uso comercial sin restricciones, pero el usuario es responsable de verificar que el uso cumple con la normativa de proteccion de datos aplicable.
- El formato MLX es exclusivo para Apple Silicon; en otros entornos debe usarse el checkpoint original en PyTorch.
- No se recomienda su uso como unica herramienta de desidentificacion en entornos clinicos sin supervision humana, dado el riesgo de errores en datos sensibles.

## Enlaces

- Repositorio MLX: https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-BigMed-Large-560M-v1-mlx
- Checkpoint original: https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-BigMed-Large-560M-v1
- Variante ONNX para Android/Web: https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-BigMed-Large-560M-v1-onnx-android
- Repositorio OpenMed en GitHub: https://github.com/maziyarpanahi/openmed
- Documentacion del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentacion de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
- Coleccion de modelos medicos MLX: https://huggingface.co/collections/OpenMed/medical-mlx-models
- Sitio web de OpenMed: https://openmed.life/
