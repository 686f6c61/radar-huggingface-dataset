# OpenMed/OpenMed-PII-Italian-SuperMedical-Base-125M-v1-mlx

## Resumen

OpenMed-PII-Italian-SuperMedical-Base-125M-v1-mlx es un modelo de reconocimiento de entidades nombradas (NER) especializado en la detección de información personal identificable (PII) en textos clínicos en italiano. Desarrollado por OpenMed, se distribuye como un empaquetado en formato MLX para ejecución en Apple Silicon, aunque también puede utilizarse con el backend de Hugging Face/PyTorch en otros sistemas. El modelo se basa en una arquitectura RoBERTa de 125 millones de parámetros, fine-tuned para token classification sobre el checkpoint original OpenMed-PII-Italian-SuperMedical-Base-125M-v1.

Su relevancia radica en el enfoque local-first de OpenMed: permite la de-identificación de historias clínicas directamente en el dispositivo, sin enviar datos de pacientes a la nube, lo que facilita el cumplimiento de normativas como HIPAA y GDPR. El modelo forma parte de un ecosistema más amplio de más de 2.200 modelos médicos y soporta 21 lenguajes (según el repositorio de GitHub) o 33 lenguajes (según la web oficial). Este empaquetado MLX está pensado para integrarse fácilmente en aplicaciones Python y Swift en entornos Apple.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (RobertaForTokenClassification) |
| Parametros totales | 125M (indicado en el nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato MLX con pesos en safetensors o npz) |
| Idiomas soportados | Italiano (it) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (weights.safetensors y/o weights.npz), legacy-compatible |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura RoBERTa estándar adaptada para clasificación de tokens, lo que permite etiquetar cada token del texto de entrada como parte de una entidad PII o no. El checkpoint base es OpenMed-PII-Italian-SuperMedical-Base-125M-v1, que a su vez es un fine-tuning de un modelo SuperMedical de 125M. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO en la información disponible. La innovación principal de este repositorio no está en la arquitectura, sino en el empaquetado MLX, que optimiza la inferencia en Apple Silicon mediante el framework MLX, manteniendo compatibilidad con el ecosistema OpenMed.

## Capacidades

- Extracción de entidades PII en textos clínicos italianos: nombres, fechas, direcciones, números de identificación, etc.
- De-identificación de historias clínicas para cumplimiento de normativas de privacidad (HIPAA, GDPR).
- Integración con la API `extract_pii` de OpenMed, que incluye fusión inteligente de entidades (`use_smart_merging=True`).
- Ejecución local en Apple Silicon mediante MLX (Python y Swift), sin necesidad de conexión a internet.
- Compatibilidad con el backend de Hugging Face/PyTorch en otros sistemas operativos.
- Soporte para despliegue en dispositivos móviles reales (iPhone/iPad) a través de OpenMedKit.

## Casos de uso

- Anonimización de historias clínicas en hospitales italianos: el modelo procesa notas clínicas y elimina o enmascara datos personales antes de compartirlos con terceros o usarlos en investigación.
- Preparación de datasets clínicos para entrenamiento de modelos de IA: permite limpiar grandes volúmenes de texto médico eliminando PII, cumpliendo con requisitos legales.
- Cumplimiento de GDPR en aplicaciones de salud digital: integrado en apps móviles o web, el modelo garantiza que los datos de pacientes no salgan del dispositivo.
- Investigación biomédica colaborativa: facilita el intercambio de datos clínicos anonimizados entre instituciones italianas y europeas.
- Auditoría de privacidad en sistemas de información sanitaria: se puede utilizar para verificar que los registros clínicos no contengan PII no detectada.
- Desarrollo de asistentes clínicos locales: al ejecutarse en el dispositivo, permite construir herramientas de apoyo al diagnóstico que respeten la privacidad del paciente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K, ya que se trata de un modelo de NER especializado y no de un modelo de lenguaje general. Tampoco se han proporcionado comparativas con otros sistemas de de-identificación en italiano.

## Requisitos de hardware

- Apple Silicon Mac (M1, M2, M3 o posteriores) para ejecución MLX nativa.
- En sistemas sin Apple Silicon, se puede usar el backend de Hugging Face/PyTorch, que requiere una GPU con al menos 4 GB de VRAM para una inferencia cómoda (el modelo es de 125M, por lo que cabe en GPUs de gama media).
- Para dispositivos móviles, se requiere un iPhone o iPad físico (no simulador) con iOS 17 o superior para Swift MLX.
- Opciones de despliegue: OpenMed (Python), OpenMedKit (Swift), o directamente con la librería MLX de Apple.
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño, se espera una inferencia en milisegundos en hardware moderno.

## Comparativa con modelos similares

No se dispone de información comparativa específica en la documentación proporcionada. Sin embargo, se puede contextualizar con otros modelos de NER clínica como BioBERT o ClinicalBERT, aunque estos no están especializados en italiano ni en de-identificación. La ventaja de este modelo es su enfoque monolingüe italiano y su integración con el ecosistema OpenMed, que ofrece más de 2.200 modelos médicos. No se proporcionan datos cuantitativos para una comparación rigurosa.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para italiano; no es aplicable a otros idiomas sin reentrenamiento.
- Al ser un modelo de 125M, su capacidad de generalización puede ser limitada frente a modelos más grandes, especialmente en dominios clínicos muy especializados.
- No se han documentado sesgos específicos, pero como todo modelo de NER, puede presentar errores en la detección de entidades poco frecuentes o en textos con jerga muy técnica.
- Riesgo de alucinación: al ser un modelo de clasificación de tokens, no genera texto libre, por lo que el riesgo de alucinación es bajo, pero puede haber falsos positivos o negativos en la detección de PII.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda validar el rendimiento en el dominio clínico específico antes de su despliegue en producción.
- El repositorio MLX no incluye el tokenizador; depende del modelo base para ello, lo que puede requerir descargas adicionales.

## Enlaces

- Repositorio HuggingFace del modelo MLX: https://huggingface.co/OpenMed/OpenMed-PII-Italian-SuperMedical-Base-125M-v1-mlx
- Checkpoint base: https://huggingface.co/OpenMed/OpenMed-PII-Italian-SuperMedical-Base-125M-v1
- Repositorio GitHub de OpenMed: https://github.com/maziyarpanahi/openmed
- Documentación del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentación de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
- Web oficial de OpenMed: https://openmed.life/
