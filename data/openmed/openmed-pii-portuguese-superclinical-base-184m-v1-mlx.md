# OpenMed/OpenMed-PII-Portuguese-SuperClinical-Base-184M-v1-mlx

## Resumen

OpenMed-PII-Portuguese-SuperClinical-Base-184M-v1-mlx es un modelo de clasificación de tokens (token classification) especializado en la detección y de-identificación de información personal identificable (PII) y datos sanitarios protegidos (PHI) en texto clínico en portugués. Ha sido desarrollado por OpenMed, una iniciativa centrada en IA clínica local-first que ejecuta modelos 100% en el dispositivo, sin enviar datos de pacientes a la nube. Este repositorio concreto es un empaquetado en formato MLX del checkpoint original `OpenMed/OpenMed-PII-Portuguese-SuperClinical-Base-184M-v1`, pensado para su uso en Apple Silicon mediante el backend MLX de OpenMed.

El modelo se basa en la arquitectura DeBERTa-v2 (`DebertaV2ForTokenClassification`) y cuenta con 184 millones de parámetros. Su pipeline es `token-classification`, lo que significa que asigna etiquetas a cada token del texto para identificar entidades como nombres, fechas, números de seguridad social, etc. Está diseñado para integrarse en flujos de anonimización de historiales clínicos, cumpliendo requisitos de privacidad como HIPAA. La licencia es Apache-2.0, lo que permite uso comercial y modificación.

La relevancia de este modelo radica en su enfoque local-first: al ejecutarse en el dispositivo, minimiza el riesgo de fuga de datos sensibles. Además, al estar empaquetado para MLX, ofrece un rendimiento eficiente en Macs con chip Apple Silicon, y existe una variante ONNX para Android y WebAssembly. Es parte de un ecosistema más amplio de OpenMed que incluye más de 2.200 modelos médicos y soporte para 21 idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (`DebertaV2ForTokenClassification`) |
| Parametros totales | 184 millones (segun la nomenclatura del modelo) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, formato MLX) |
| Idiomas soportados | Portugues (pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura DeBERTa-v2, una variante de transformer que introduce mecanismos de atención disentangled y un decoder mejorado para tareas de comprensión del lenguaje. En concreto, se utiliza la cabecera `DebertaV2ForTokenClassification`, que añade una capa de clasificación sobre las representaciones de cada token para predecir etiquetas de entidades. El checkpoint base es `OpenMed/OpenMed-PII-Portuguese-SuperClinical-Base-184M-v1`, que a su vez es un fine-tune de un modelo preentrenado (según los tags de HuggingFace, `base_model:finetune:OpenMed/OpenMed-PII-Portuguese-SuperClinical-Base-184M-v1`). No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados ni las técnicas de ajuste (RLHF, DPO, etc.). El empaquetado MLX no modifica la arquitectura, solo convierte los pesos al formato optimizado para Apple Silicon.

## Capacidades

- Detección de PII/PHI en texto clínico en portugués: identifica entidades como nombres de pacientes, fechas de nacimiento, números de identificación, direcciones, etc.
- De-identificación de historiales clínicos: permite anonimizar documentos médicos antes de su uso en investigación o intercambio.
- Integración con la API `extract_pii` de OpenMed, que incluye fusión inteligente de entidades (`use_smart_merging=True`) para mejorar la coherencia de los resultados.
- Ejecución local en Apple Silicon mediante el backend MLX, sin necesidad de conexión a internet.
- Compatibilidad con el ecosistema OpenMed: puede usarse junto con otros modelos médicos de la colección.
- No es un modelo generativo: no genera texto, solo clasifica tokens. No soporta tool calling ni razonamiento multi-paso.

## Casos de uso

- Anonimización de historiales clínicos para investigación: hospitales y centros de investigación pueden procesar grandes volúmenes de notas clínicas en portugués, eliminando PII antes de compartir datos con terceros, cumpliendo normativas como la LGPD (Ley General de Protección de Datos de Brasil).
- Cumplimiento HIPAA en entornos sanitarios lusófonos: clínicas y aseguradoras pueden usar el modelo para verificar que los documentos no contengan PHI antes de su almacenamiento o transmisión.
- Preparación de datasets para entrenamiento de modelos médicos: al de-identificar corpus clínicos, se facilita la creación de conjuntos de datos abiertos sin comprometer la privacidad de los pacientes.
- Aplicaciones móviles de salud: gracias a la variante ONNX, el modelo puede integrarse en apps Android o WebAssembly para procesar texto clínico directamente en el dispositivo del usuario, sin enviar datos a servidores.
- Flujos de trabajo clínicos en Mac: profesionales que usan Macs con Apple Silicon pueden ejecutar el modelo localmente mediante Python MLX, integrándolo en herramientas de análisis de texto médico.
- Auditoría de privacidad: organizaciones pueden emplear el modelo para revisar automáticamente documentos clínicos y detectar posibles filtraciones de datos personales antes de su publicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este modelo en la información disponible. OpenMed afirma en su web que sus modelos logran "state of the art on 10 of 12 biomedical NER benchmarks", pero no se detallan cifras concretas para esta variante portuguesa. Se recomienda consultar el repositorio del modelo base o el paper asociado (arXiv:2508.01630) para posibles evaluaciones.

## Requisitos de hardware

- Al ser un modelo de 184M parámetros, es ligero y puede ejecutarse en CPU sin problemas, aunque el backend MLX está optimizado para Apple Silicon.
- VRAM estimada: no disponible oficialmente, pero con 184M parámetros en FP16 ocuparía aproximadamente 368 MB; en FP32 unos 736 MB. Cabe en cualquier GPU moderna, incluidas las integradas de Apple.
- GPU recomendadas: Apple Silicon (M1, M2, M3, etc.) para MLX; también compatible con GPUs NVIDIA mediante el backend PyTorch/HuggingFace.
- Opciones de despliegue: Python con `openmed[mlx]` en Apple Silicon; backend HuggingFace/PyTorch en otros sistemas; variante ONNX para Android y WebAssembly.
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño, la inferencia es rápida incluso en CPU.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas específicas de de-identificación en portugués. Existen otros modelos de NER clínico como BioBERT o ClinicalBERT, pero no se han encontrado datos comparativos directos. Se recomienda evaluar el modelo en el propio corpus de la organización.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para portugués; no debe usarse con otros idiomas sin reentrenamiento.
- Al ser un modelo de clasificación de tokens, puede presentar errores de etiquetado, especialmente en textos con jerga clínica poco común o formatos no estándar.
- No se dispone de información sobre sesgos específicos, pero como todo modelo de NLP, puede reflejar sesgos presentes en los datos de entrenamiento.
- La de-identificación automática no es infalible; se recomienda supervisión humana en contextos donde la privacidad sea crítica.
- La licencia Apache-2.0 permite uso comercial, pero el usuario es responsable de cumplir con las regulaciones locales de protección de datos.
- El soporte Swift (OpenMedKit) no está disponible para esta arquitectura DeBERTa-v2; solo Python MLX o CoreML mediante exportación manual.

## Enlaces

- Repositorio HuggingFace del modelo MLX: https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-SuperClinical-Base-184M-v1-mlx
- Checkpoint original: https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-SuperClinical-Base-184M-v1
- Variante ONNX para Android/Web: https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-SuperClinical-Base-184M-v1-onnx-android
- GitHub de OpenMed: https://github.com/maziyarpanahi/openmed
- Documentación del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentación de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
- Sitio web de OpenMed: https://openmed.life/
- Paper asociado (referenciado en el repo ONNX): arXiv:2508.01630
