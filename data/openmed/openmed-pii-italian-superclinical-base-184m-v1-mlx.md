# OpenMed/OpenMed-PII-Italian-SuperClinical-Base-184M-v1-mlx

## Resumen

OpenMed-PII-Italian-SuperClinical-Base-184M-v1-mlx es un modelo de clasificación de tokens (token classification) diseñado para la detección y anonimización de información personal identificable (PII) en texto clínico en italiano. Desarrollado por el ecosistema OpenMed, este modelo es un empaquetado en formato MLX del checkpoint original OpenMed/OpenMed-PII-Italian-SuperClinical-Base-184M-v1, pensado para ejecutarse de forma eficiente en hardware Apple Silicon mediante la librería OpenMed.

El modelo pertenece a la familia DeBERTa-v2 (concretamente DebertaV2ForTokenClassification) y cuenta con 184 millones de parámetros. Su propósito principal es la de-identificación de historias clínicas y documentos médicos, eliminando o enmascarando entidades como nombres, direcciones, fechas, números de seguridad social y otros datos personales, en cumplimiento de normativas como HIPAA. La relevancia actual radica en su enfoque local-first: puede ejecutarse íntegramente en el dispositivo sin enviar datos de pacientes a la nube, una ventaja crítica en entornos sanitarios con requisitos estrictos de privacidad.

Este repositorio concreto contiene los pesos en formato MLX, lo que permite su uso con el backend MLX de OpenMed en Macs con Apple Silicon. El modelo base original está disponible en Hugging Face y también existen variantes para ONNX/Android, lo que amplía su despliegue a entornos móviles y web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (DebertaV2ForTokenClassification) |
| Parametros totales | 184 millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (formato MLX estándar) |
| Idiomas soportados | Italiano (it) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (weights.safetensors y/o weights.npz) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura DeBERTa-v2, un transformer encoder con mecanismos de atención desenredada (disentangled attention) que mejoran la representación contextual frente a modelos BERT clásicos. En concreto, se utiliza la variante DebertaV2ForTokenClassification, que añade una cabeza de clasificación por token sobre el encoder base. Esta arquitectura es especialmente adecuada para tareas de etiquetado secuencial como el reconocimiento de entidades nombradas (NER) y la detección de PII.

El checkpoint original, OpenMed-PII-Italian-SuperClinical-Base-184M-v1, es un fine-tuning del modelo base OpenMed/OpenMed-PII-Italian-SuperClinical-Base-184M-v1, especializado en texto clínico italiano. No se dispone de información detallada sobre el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. El empaquetado MLX de este repositorio no modifica los pesos originales, sino que los convierte al formato MLX para su ejecución eficiente en Apple Silicon.

## Capacidades

- Detección de PII en texto clínico italiano: identifica entidades como nombres de pacientes, médicos, direcciones, fechas de nacimiento, números de teléfono, códigos fiscales y otros datos personales.
- De-identificación de historias clínicas: permite enmascarar o eliminar las entidades detectadas para cumplir con normativas de privacidad (HIPAA, GDPR).
- Clasificación de tokens con etiquetas predefinidas: el modelo devuelve la etiqueta y el nivel de confianza para cada entidad detectada.
- Fusión inteligente de entidades (smart merging): OpenMed ofrece la opción `use_smart_merging=True` para combinar tokens adyacentes en entidades completas, mejorando la precisión en nombres compuestos o frases.
- Ejecución local en Apple Silicon: gracias al formato MLX, el modelo corre íntegramente en el dispositivo sin conexión a la nube.
- Compatibilidad con el ecosistema OpenMed: se integra con la API `extract_pii` de OpenMed, que gestiona automáticamente el backend (MLX o PyTorch/Hugging Face).

## Casos de uso

- Anonimización de historias clínicas en hospitales italianos: el modelo procesa notas médicas y enmascara automáticamente los datos personales antes de que los documentos se utilicen para investigación o se compartan con terceros, garantizando el cumplimiento del RGPD.
- Preparación de datasets para investigación médica: los equipos de data science pueden usar el modelo para limpiar grandes volúmenes de texto clínico, eliminando PII antes de entrenar otros modelos o realizar análisis estadísticos.
- Cumplimiento normativo en ensayos clínicos: al generar informes de ensayos, el modelo asegura que los datos de los participantes estén anonimizados, reduciendo el riesgo de filtraciones.
- Aplicaciones de salud móvil (iOS): gracias al empaquetado MLX y al soporte de OpenMedKit, el modelo puede integrarse en apps de salud para iPhone que procesen notas del paciente localmente, sin enviar datos a servidores externos.
- Auditoría de documentos clínicos: las aseguradoras o entidades reguladoras pueden emplear el modelo para verificar que los documentos compartidos no contengan información personal no autorizada.
- Integración en pipelines de NLP clínico: el modelo puede combinarse con otros componentes de OpenMed (NER clínico, extracción de entidades médicas) para construir flujos completos de procesamiento de texto sanitario en italiano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este modelo en la informacion disponible. Aunque la web de OpenMed menciona que sus modelos logran "state of the art on 10 of 12 biomedical NER benchmarks", no se proporcionan cifras concretas para esta variante italiana de 184M. Se recomienda consultar el repositorio original del checkpoint base para futuras actualizaciones.

## Requisitos de hardware

- El modelo tiene 184 millones de parámetros, lo que lo sitúa en la categoría de modelos pequeños. En formato MLX, su huella de memoria es reducida.
- VRAM estimada: no disponible oficialmente, pero por tamaño se espera que quepa en menos de 1 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: cualquier Mac con chip M1, M2, M3 o M4 (Apple Silicon) puede ejecutarlo mediante el backend MLX de OpenMed. También funciona en CPU en sistemas sin GPU.
- No requiere GPU dedicada de servidor; es adecuado para entornos de escritorio y portátiles.
- Opciones de despliegue: Python con `openmed[mlx]` en Apple Silicon, o backend PyTorch/Hugging Face en otros sistemas. También existe una variante ONNX para Android y WebAssembly.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño del modelo, se espera una latencia de milisegundos por documento en hardware Apple Silicon moderno.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos alternativos de detección de PII en italiano. El ecosistema OpenMed ofrece otros tamaños (por ejemplo, OpenMed-PII-SuperClinical-Small-44M-v1-mlx), pero no hay datos públicos de rendimiento relativo entre ellos. Se recomienda evaluar este modelo frente a alternativas genéricas de NER como spaCy o modelos BERT multilingües, aunque no se dispone de benchmarks comparativos en la documentación actual.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para italiano clínico; su rendimiento en otros idiomas o dominios no clínicos puede ser deficiente.
- No se han documentado sesgos específicos, pero como todo modelo de NLP entrenado con datos clínicos, puede reflejar sesgos presentes en los datos de entrenamiento (por ejemplo, sobrerrepresentación de ciertas poblaciones).
- Riesgo de alucinación: aunque es un modelo de clasificación de tokens y no generativo, puede cometer errores de etiquetado, especialmente en entidades ambiguas o poco frecuentes.
- La longitud de contexto no está documentada; los modelos DeBERTa-v2 suelen tener un máximo de 512 tokens, lo que limita el procesamiento de documentos largos en una sola pasada.
- El repositorio MLX no incluye los archivos del tokenizador; OpenMed recurre al tokenizador del checkpoint original, lo que requiere acceso a Hugging Face en el momento de la inferencia si no se ha cacheado previamente.
- El soporte Swift (OpenMedKit) para arquitecturas DeBERTa-v2 aún no está disponible; los desarrolladores de apps iOS deben usar Python MLX o CoreML con una exportación propia.
- La licencia Apache-2.0 permite uso comercial, pero el usuario es responsable de verificar que el uso cumple con las normativas sanitarias locales (RGPD, HIPAA) en su jurisdicción.

## Enlaces

- Repositorio Hugging Face del modelo MLX: https://huggingface.co/OpenMed/OpenMed-PII-Italian-SuperClinical-Base-184M-v1-mlx
- Checkpoint original: https://huggingface.co/OpenMed/OpenMed-PII-Italian-SuperClinical-Base-184M-v1
- Variante ONNX/Android: https://huggingface.co/OpenMed/OpenMed-PII-Italian-SuperClinical-Base-184M-v1-onnx-android
- Repositorio GitHub de OpenMed: https://github.com/maziyarpanahi/openmed
- Web oficial de OpenMed: https://openmed.life/
- Documentación del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentación de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
