# OpenMed/OpenMed-PII-Spanish-BiomedELECTRA-Large-335M-v1-mlx

## Resumen

OpenMed-PII-Spanish-BiomedELECTRA-Large-335M-v1-mlx es un modelo de clasificación de tokens (NER) diseñado para la detección de información personal identificable (PII) en textos clínicos en español. Se trata de un ajuste fino (fine-tuning) del modelo BiomedELECTRA-Large, de 335 millones de parámetros, especializado en el dominio biomédico. El modelo identifica 54 tipos de entidades sensibles, como nombres, direcciones, números de seguridad social o números de historia clínica, lo que lo hace útil para tareas de anonimización y de-identificación de historiales médicos.

Este repositorio concreto contiene un empaquetado en formato MLX, optimizado para inferencia en dispositivos Apple Silicon (Macs con chip M1 o superior, iPhone y iPad). Lo desarrolla OpenMed, una iniciativa local-first que busca ejecutar modelos de IA clínica completamente en el dispositivo, sin enviar datos de pacientes a la nube. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

El modelo se integra con la librería `openmed` y con OpenMedKit para Swift, ofreciendo una API sencilla para extracción de PII con fusión inteligente de entidades. Su relevancia actual radica en la creciente necesidad de cumplir normativas como HIPAA y GDPR en el procesamiento de datos clínicos, especialmente en entornos donde la privacidad es crítica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (BertForTokenClassification) |
| Parametros totales | 335 millones |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | es (español) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, npz (MLX) |

## Arquitectura y entrenamiento

El modelo se basa en BiomedELECTRA-Large, un transformer encoder-only de la familia ELECTRA preentrenado con datos biomédicos. Sobre esta base se realizó un ajuste fino para la tarea de clasificación de tokens, con una cabeza de clasificación que asigna una de las 54 etiquetas de PII a cada token de entrada. No se dispone de información detallada sobre el conjunto de datos de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO. El empaquetado MLX conserva la arquitectura original y los pesos, permitiendo su ejecución eficiente en hardware Apple mediante el backend MLX de OpenMed.

## Capacidades

- Detección de 54 tipos de PII en español, incluyendo nombres, direcciones, números de identificación, números de seguridad social, números de historia clínica, fechas, teléfonos, correos electrónicos, etc.
- Clasificación a nivel de token con etiquetas BIO (begin, inside, outside) para entidades anidadas.
- Fusión inteligente de entidades (smart merging) para reconstruir entidades completas a partir de tokens fragmentados.
- Integración con la librería `openmed` en Python, con selección automática de backend (MLX en Apple Silicon, PyTorch en otros sistemas).
- Soporte para Swift mediante OpenMedKit, permitiendo ejecución en macOS, iPhone y iPad reales.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni generación de texto libre; es un modelo puramente discriminativo para NER.

## Casos de uso

- Anonimización de historiales clínicos en español: el modelo puede procesar notas médicas, informes de alta o recetas y reemplazar las entidades PII por marcadores genéricos, cumpliendo requisitos de HIPAA y GDPR.
- Preparación de datasets clínicos para investigación: antes de compartir datos con terceros, se aplica el modelo para eliminar información identificable, reduciendo el riesgo de re-identificación.
- Integración en sistemas de gestión de historiales clínicos electrónicos (HCE): se puede invocar como servicio local para enmascarar automáticamente los datos sensibles en el momento de la entrada o consulta.
- Procesamiento de informes médicos en dispositivos Apple: gracias al formato MLX, la inferencia se ejecuta en el propio iPhone o Mac, sin necesidad de conexión a internet, ideal para entornos con requisitos estrictos de privacidad.
- Auditoría de cumplimiento normativo: el modelo puede utilizarse para verificar que documentos clínicos no contengan PII no enmascarada antes de su publicación o transferencia.
- Desarrollo de pipelines de NLP clínico: como componente de preprocesamiento en sistemas de extracción de información médica, asegurando que los datos de entrada estén libres de identificadores personales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como F1, precisión o recall sobre conjuntos de datos estándar de NER en español ni comparaciones con otros modelos de de-identificación.

## Requisitos de hardware

- El tamaño del repositorio es de 1,3 GB, lo que corresponde aproximadamente al peso de los parámetros en precisión fp32 o fp16. No se especifica la VRAM necesaria para inferencia.
- Al estar empaquetado en MLX, se ejecuta de forma nativa en Apple Silicon (M1, M2, M3 y superiores). Se recomienda al menos 8 GB de memoria unificada para una inferencia fluida, aunque no es un requisito oficial.
- En sistemas sin Apple Silicon, OpenMed puede recurrir al backend de Hugging Face / PyTorch, lo que permite ejecutarlo en GPUs convencionales (NVIDIA, AMD) mediante transformers.
- Para despliegue en servidores, se puede utilizar vLLM, TGI o llama.cpp, aunque no hay documentación específica para este modelo.
- La latencia y el throughput no están documentados. Dado el tamaño de 335M, se espera una inferencia rápida en hardware moderno, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (NER de PII en español con base biomédica). No se puede realizar una comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para español; su uso en otros idiomas producirá resultados incorrectos.
- No se conocen los sesgos específicos del conjunto de datos de entrenamiento, pero al ser un modelo biomédico puede presentar sesgos relacionados con el dominio clínico (por ejemplo, variaciones dialectales o terminología regional).
- Al ser un modelo de NER, no genera texto y no es adecuado para tareas generativas. Su riesgo de alucinación se limita a errores de etiquetado, que pueden ocurrir en entidades poco frecuentes o con formatos atípicos.
- La longitud de contexto no está documentada; los modelos BERT típicamente soportan hasta 512 tokens, pero no se confirma para esta variante.
- Aunque la licencia Apache 2.0 permite uso comercial, se recomienda validar el rendimiento del modelo con datos propios antes de desplegarlo en producción, especialmente en entornos clínicos donde los errores pueden tener consecuencias graves.
- El repositorio MLX no incluye los archivos del tokenizador; OpenMed y OpenMedKit recurren al tokenizador del modelo base, lo que requiere acceso a Hugging Face en el momento de la carga si no se ha cacheado previamente.

## Enlaces

- Repositorio MLX en Hugging Face: https://huggingface.co/OpenMed/OpenMed-PII-Spanish-BiomedELECTRA-Large-335M-v1-mlx
- Modelo base (checkpoint original): https://huggingface.co/OpenMed/OpenMed-PII-Spanish-BiomedELECTRA-Large-335M-v1
- GitHub de OpenMed: https://github.com/maziyarpanahi/openmed
- Documentación del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentación de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
