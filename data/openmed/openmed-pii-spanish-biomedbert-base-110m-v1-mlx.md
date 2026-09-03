# OpenMed/OpenMed-PII-Spanish-BiomedBERT-Base-110M-v1-mlx

## Resumen

OpenMed-PII-Spanish-BiomedBERT-Base-110M-v1-mlx es un empaquetado en formato MLX del modelo homónimo de OpenMed, un encoder BERT biomédico en español de aproximadamente 110 millones de parámetros, fine-tuned para clasificación de tokens (token classification) orientada a la detección de información personal identificable (PII) en texto clínico. El modelo identifica y clasifica 54 tipos de datos sensibles, como nombres de pacientes, direcciones, números de seguridad social, números de historia clínica y fechas, con el objetivo de facilitar la de-identificación de registros médicos antes de su uso en investigación o intercambio.

La relevancia de este modelo radica en su aplicación directa al cumplimiento de normativas de privacidad (RGPD, HIPAA) en el sector sanitario hispanohablante, automatizando una tarea que tradicionalmente requería revisión manual. La versión MLX permite ejecutar la inferencia de forma local en dispositivos Apple Silicon (Mac, iPhone, iPad) mediante las librerías OpenMed (Python) y OpenMedKit (Swift), sin depender de servicios en la nube. El modelo base está disponible bajo licencia Apache 2.0, lo que facilita su integración en sistemas propietarios y de código abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (BertForTokenClassification) |
| Parametros totales | ~110 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (tipicamente 512 tokens en BERT, no confirmado) |
| Tipos de cuantizacion | no disponible (formato MLX nativo, sin cuantizacion especificada) |
| Idiomas soportados | Español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (weights.safetensors y/o weights.npz) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT (Bidirectional Encoder Representations from Transformers), concretamente en una variante biomédica preentrenada para español. La capa de salida es una cabeza de clasificación de tokens (token classification) que asigna una etiqueta PII a cada token de entrada. El checkpoint original (`OpenMed/OpenMed-PII-Spanish-BiomedBERT-Base-110M-v1`) fue fine-tuned para detectar 54 categorías de información sensible en texto clínico español, aunque no se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni el método de ajuste (si se empleó RLHF, DPO u otro enfoque). Toda esa información se considera no disponible.

La innovación principal de esta versión MLX es su empaquetado para Apple Silicon, que permite la inferencia local eficiente mediante el framework MLX. El repositorio incluye los pesos en formato MLX y los archivos de configuración (`config.json`, `id2label.json`), pero no incorpora el tokenizador, que se resuelve dinámicamente a partir de la referencia al modelo base en la configuración.

## Capacidades

- Detección de PII en texto clínico español: clasifica 54 tipos de entidades sensibles, incluyendo nombres, direcciones, números de seguridad social, números de historia clínica, fechas, teléfonos, correos electrónicos, etc.
- Token classification / named entity recognition (NER) especializado en el dominio médico.
- Integración con la API de OpenMed para extracción de entidades con fusión inteligente de tokens (`use_smart_merging=True`), que agrupa tokens contiguos en entidades completas.
- Compatibilidad con dos runtimes: MLX en Apple Silicon (Python y Swift) y fallback a Hugging Face / PyTorch en otros sistemas.
- Soporte para despliegue en dispositivos móviles Apple (iPhone/iPad) mediante OpenMedKit, siempre que se use el backend MLX (no el simulador de iOS).
- Funciona como componente de un pipeline de de-identificación, devolviendo etiquetas, texto de la entidad y nivel de confianza.

## Casos de uso

- De-identificación de historiales clínicos para investigación: el modelo puede procesar notas clínicas en español y enmascarar o eliminar automáticamente los campos PII antes de que los datos se utilicen en estudios retrospectivos o ensayos clínicos, reduciendo el riesgo de re-identificación de pacientes.
- Cumplimiento normativo en instituciones sanitarias: hospitales y clínicas pueden integrar el modelo en sus sistemas de gestión de expedientes para garantizar que los documentos compartidos con terceros (aseguradoras, organismos reguladores) cumplan con el RGPD y la LOPDGDD, detectando fugas de información personal.
- Anonimización de corpus clínicos para entrenamiento de modelos: los equipos de IA pueden usar el modelo para limpiar grandes volúmenes de texto clínico en español antes de utilizarlos como datos de entrenamiento, evitando que los modelos aprendan información personal identificable.
- Auditoría de seguridad de datos: el modelo puede ejecutarse de forma periódica sobre repositorios de documentos clínicos para verificar que no existan PII sin proteger, generando alertas cuando se detectan entidades sensibles.
- Preparación de datos para intercambio entre centros de investigación: cuando dos hospitales colaboran en un proyecto, el modelo permite anonimizar los conjuntos de datos compartidos de manera consistente, manteniendo la utilidad clínica del texto.
- Integración en pipelines de procesamiento de lenguaje natural clínico: los desarrolladores pueden combinar este modelo con otros componentes (extracción de entidades médicas, clasificación de documentos) para construir sistemas completos de análisis de historiales, donde la detección de PII actúa como paso previo obligatorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K, ni de evaluaciones específicas de NER (F1, precisión, recall) sobre corpus clínicos españoles de referencia.

## Requisitos de hardware

- Apple Silicon (M1, M2, M3 o superior) para ejecución MLX nativa; el modelo también funciona en CPU/GPU convencionales mediante el backend PyTorch de Hugging Face.
- Tamaño del repositorio: 0,4 GB, por lo que la VRAM o memoria RAM necesaria es modesta; un Mac con 8 GB de RAM unificada es suficiente para la inferencia.
- En dispositivos móviles, requiere iPhone o iPad físicos con chip Apple Silicon (el simulador de iOS no es compatible con MLX).
- Opciones de despliegue: librería `openmed[mlx]` en Python, OpenMedKit en Swift, o uso directo del modelo base con `transformers` si se descarga el checkpoint original.
- No se han publicado datos de latencia o throughput; al tratarse de un modelo BERT de 110M, la inferencia en Apple Silicon debería ser de decenas de milisegundos por documento, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de detección de PII en español. Existen alternativas genéricas de NER biomédico como BioBERT o ClinicalBERT, pero no se han encontrado datos públicos que permitan comparar rendimiento, contexto o licencias de forma fiable. Se recomienda evaluar el modelo en el corpus propio antes de decidir su adopción.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para texto clínico en español; su rendimiento en otros dominios (texto legal, financiero, administrativo) puede ser significativamente inferior.
- No se han publicado estudios de sesgos; como todo modelo BERT, puede presentar sesgos de género, edad o procedencia en la identificación de nombres y entidades.
- Riesgo de alucinación en la clasificación: puede etiquetar como PII tokens que no lo son, o fallar en la detección de entidades poco frecuentes o con formatos atípicos.
- El repositorio MLX no incluye el tokenizador; la inferencia depende de que OpenMed o OpenMedKit resuelvan correctamente la referencia al tokenizador del modelo base, lo que añade una dependencia externa.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero el usuario es responsable de verificar que el uso del modelo cumple con las normativas de protección de datos aplicables en su jurisdicción.
- No se garantiza la precisión en todos los dialectos del español; el modelo puede estar sesgado hacia variantes peninsulares o latinoamericanas según el corpus de entrenamiento, que no ha sido publicado.

## Enlaces

- Repositorio MLX en HuggingFace: https://huggingface.co/OpenMed/OpenMed-PII-Spanish-BiomedBERT-Base-110M-v1-mlx
- Checkpoint original (modelo base): https://huggingface.co/OpenMed/OpenMed-PII-Spanish-BiomedBERT-Base-110M-v1
- Repositorio GitHub de OpenMed: https://github.com/maziyarpanahi/openmed
- Documentación del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentación de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
