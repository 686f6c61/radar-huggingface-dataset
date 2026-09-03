# OpenMed/OpenMed-PII-Spanish-BiomedELECTRA-Base-110M-v1-mlx

## Resumen

OpenMed-PII-Spanish-BiomedELECTRA-Base-110M-v1-mlx es un modelo de clasificación de tokens (token classification) desarrollado por OpenMed, diseñado para detectar información personal identificable (PII) en texto clínico y biomédico en español. Se basa en el checkpoint BiomedELECTRA-Base de 110 millones de parámetros, fine-tuneado para identificar 54 tipos de entidades sensibles, como nombres de pacientes, números de seguridad social, direcciones, fechas y números de historia clínica. Su objetivo principal es facilitar la anonimización automática de historiales médicos y documentos clínicos.

Este repositorio concreto es un empaquetado en formato MLX (Apple Silicon) del modelo original, lo que permite su ejecución eficiente en hardware de Apple (Macs con chip M-series, iPhone y iPad) mediante las librerías OpenMed y OpenMedKit. La licencia Apache 2.0 permite uso comercial sin restricciones significativas. Su relevancia actual radica en la creciente necesidad de cumplir normativas de protección de datos (GDPR, LOPD) en el sector sanitario, donde la de-identificación de registros es un paso crítico para la investigación y el desarrollo de sistemas de IA clínica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (BertForTokenClassification) sobre BiomedELECTRA-Base |
| Parametros totales | 110 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (típico de BERT base: 512 tokens, no confirmado) |
| Tipos de cuantizacion | no disponible (formato MLX nativo, pesos en safetensors/npz) |
| Idiomas soportados | Español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (weights.safetensors y/o weights.npz), config.json, id2label.json |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ELECTRA-Base, una variante de BERT que utiliza un preentrenamiento con reemplazo de tokens (replaced token detection) en lugar de enmascaramiento. La capa de salida es una cabeza de clasificación de tokens (BertForTokenClassification) que asigna una etiqueta PII a cada token de entrada. El checkpoint base es BiomedELECTRA-Base, un modelo preentrenado específicamente con corpus biomédicos y clínicos en español, lo que le confiere un vocabulario y conocimiento especializado del dominio sanitario.

El fine-tuning se realizó para la tarea de detección de PII, con un conjunto de etiquetas que cubre 54 categorías de información sensible. No se han publicado detalles sobre el dataset de entrenamiento, el número de épocas o si se emplearon técnicas como data augmentation o post-procesado. El empaquetado MLX no modifica los pesos del modelo original, solo los convierte al formato optimizado para Apple Silicon, manteniendo la compatibilidad con la librería OpenMed.

## Capacidades

- Detección de PII a nivel de token en texto clínico español: identifica y clasifica entidades como nombres, apellidos, direcciones, números de identificación, fechas, números de teléfono, correos electrónicos, números de seguridad social, números de historia clínica, entre otros (54 categorías).
- Anonimización de documentos clínicos: permite marcar los spans de texto que contienen información sensible para su posterior enmascaramiento o eliminación.
- Integración con el ecosistema OpenMed: funciona con la API `extract_pii` de la librería Python `openmed`, que incluye opciones como `use_smart_merging` para fusionar tokens en entidades completas.
- Soporte multiplataforma: además del backend PyTorch/Hugging Face, el formato MLX permite ejecución nativa en Apple Silicon (macOS, iOS, iPadOS) mediante OpenMedKit en Swift.
- Compatibilidad con flujos de trabajo de investigación: al ser un modelo de clasificación de tokens, puede integrarse en pipelines de procesamiento de lenguaje natural para la limpieza de corpus clínicos antes de su uso en entrenamiento de otros modelos.
- Multilingüe limitado: entrenado exclusivamente para español, no soporta otros idiomas de forma nativa.

## Casos de uso

- Anonimización de historiales clínicos electrónicos: el modelo puede procesar notas médicas, informes de alta y registros de pacientes para detectar y enmascarar datos personales antes de compartirlos con terceros o usarlos en investigación. Su naturaleza token-level permite una precisión alta en la identificación de entidades.
- Cumplimiento normativo en hospitales y clínicas: integrado en sistemas de gestión de datos sanitarios, ayuda a cumplir con el RGPD y la LOPD en España, reduciendo el riesgo de fugas de información personal en entornos de desarrollo o pruebas.
- Preparación de datasets para investigación médica: los investigadores pueden usar el modelo para limpiar corpus clínicos antes de entrenar modelos de lenguaje biomédicos, garantizando que no se incluyan datos identificables.
- Auditoría de documentos clínicos: permite revisar automáticamente documentos existentes para localizar posibles filtraciones de PII, por ejemplo en archivos compartidos internamente o en publicaciones científicas.
- Desarrollo de asistentes clínicos con privacidad: al integrar el modelo en un pipeline de pre-procesado, se pueden construir chatbots o sistemas de consulta que operen sobre datos anonimizados, protegiendo la identidad del paciente.
- Despliegue en dispositivos Apple para uso en campo: gracias al formato MLX, el modelo puede ejecutarse localmente en un iPhone o iPad, permitiendo a profesionales sanitarios anonimizar notas clínicas sobre la marcha sin conexión a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como F1, precisión o recall sobre conjuntos de validación estándar (p. ej., CoNLL, i2b2) para este modelo.

## Requisitos de hardware

- Al ser un modelo de 110 millones de parámetros, su huella de memoria es reducida: aproximadamente 440 MB en float32, o unos 220 MB en float16. En formato MLX, el peso del repositorio es de 0,4 GB.
- VRAM estimada para inferencia: menos de 1 GB en float16, por lo que cabe en cualquier GPU moderna, incluidas las integradas de Apple Silicon.
- GPU recomendadas: cualquier Mac con chip M1, M2, M3 o M4 (incluidos los modelos base con memoria unificada de 8 GB) puede ejecutar el modelo sin problemas. También funciona en iPhone y iPad con chip A14 o superior.
- Opciones de despliegue: mediante la librería Python `openmed[mlx]` en macOS, o con OpenMedKit en Swift para aplicaciones iOS/macOS. En sistemas sin Apple Silicon, se puede usar el backend PyTorch estándar de Hugging Face.
- Latencia y throughput: no se han publicado mediciones oficiales, pero dado el tamaño del modelo, la inferencia en CPU de Apple Silicon debería completarse en milisegundos por documento corto.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (detección de PII en español clínico con arquitectura BERT). No se puede establecer una comparativa fiable sin datos de benchmarks. Se recomienda evaluar el modelo frente a alternativas genéricas de NER en español (p. ej., modelos BERT multilingües fine-tuneados para NER) si se requiere una comparación.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado sobre un corpus biomédico específico, puede tener un rendimiento subóptimo en dominios no clínicos o con jerga general. No se han documentado sesgos demográficos específicos.
- Riesgo de alucinación: al ser un modelo de clasificación de tokens, no genera texto, por lo que el riesgo de alucinación es bajo. Sin embargo, puede cometer errores de clasificación (falsos positivos o negativos) en entidades poco frecuentes o con formatos atípicos.
- Limitaciones de contexto: al ser un modelo BERT base, la longitud máxima de entrada está limitada a 512 tokens (no confirmado en la documentación, pero es el estándar). Documentos clínicos largos deberán truncarse o dividirse en segmentos.
- Idioma: solo soporta español. No funcionará correctamente con textos en otros idiomas, incluso si contienen términos médicos en inglés o latín.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin obligación de compartir derivados, pero se debe mantener el aviso de copyright. No hay restricciones de uso en el sector sanitario, pero el usuario es responsable de validar la precisión del modelo en su caso de uso concreto.
- Caveat de producción: la detección de PII es una tarea de alto riesgo. Se recomienda una validación exhaustiva con datos reales antes de usar el modelo en entornos de producción, y considerar un umbral de confianza configurable para reducir falsos negativos.

## Enlaces

- Repositorio HuggingFace del modelo MLX: https://huggingface.co/OpenMed/OpenMed-PII-Spanish-BiomedELECTRA-Base-110M-v1-mlx
- Checkpoint fuente (modelo original): https://huggingface.co/OpenMed/OpenMed-PII-Spanish-BiomedELECTRA-Base-110M-v1
- Repositorio GitHub de OpenMed: https://github.com/maziyarpanahi/openmed
- Documentación del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentación de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
