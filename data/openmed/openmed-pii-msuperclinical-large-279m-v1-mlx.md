# OpenMed/OpenMed-PII-mSuperClinical-Large-279M-v1-mlx

## Resumen

OpenMed-PII-mSuperClinical-Large-279M-v1-mlx es un empaquetado en formato MLX del modelo de detección de información personal identificable (PII) OpenMed/OpenMed-PII-mSuperClinical-Large-279M-v1, desarrollado por OpenMed para su ejecución en Apple Silicon. Se trata de un modelo de clasificación de tokens (token classification) basado en la arquitectura DeBERTa-v2, con 279 millones de parámetros, fine-tuneado para identificar y clasificar 54 tipos de información sensible en texto clínico, como nombres, direcciones, números de seguridad social (SSN) o números de historia clínica.

El modelo resuelve el problema de la de-identificación de datos clínicos en entornos locales, sin necesidad de enviar información de pacientes a la nube, lo que lo hace relevante para cumplir con normativas como HIPAA. Su empaquetado MLX permite una inferencia eficiente en Macs con chip Apple Silicon mediante la librería OpenMed, que selecciona automáticamente el runtime adecuado. Aunque el modelo está pensado para el ecosistema OpenMed, también puede usarse directamente con el backend de Hugging Face/PyTorch en otros sistemas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (DebertaV2ForTokenClassification) |
| Parametros totales | 279 millones |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el empaquetado MLX no especifica cuantizacion) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (weights.safetensors y/o weights.npz) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura DeBERTa-v2, una variante del transformer que utiliza atencion disentangled y un mecanismo de decodificacion mejorado. En concreto, se emplea la clase `DebertaV2ForTokenClassification`, que anade una cabeza de clasificacion por token sobre el encoder preentrenado. El checkpoint original fue fine-tuneado para la tarea de deteccion de PII en dominios clinicos, aunque no se han publicado detalles especificos sobre el dataset de entrenamiento, el numero de tokens procesados ni el uso de tecnicas como RLHF o DPO. El empaquetado MLX conserva la configuracion original y los pesos, pero no incluye los assets del tokenizador, que se resuelven por referencia al modelo base en `config.json`.

## Capacidades

- Deteccion y clasificacion de 54 tipos de informacion personal identificable (PII) en texto clinico, incluyendo nombres, direcciones, numeros de seguridad social, numeros de registro medico, fechas, telefonos, etc.
- Clasificacion a nivel de token (token classification), lo que permite identificar entidades con precision dentro de frases complejas.
- Integracion con la API `extract_pii` de OpenMed, que incluye un modo de fusion inteligente (`use_smart_merging=True`) para agrupar tokens en entidades completas.
- Soporte de inferencia en Apple Silicon mediante el backend MLX de OpenMed, con seleccion automatica del runtime.
- Compatibilidad con el backend de Hugging Face/PyTorch en sistemas sin Apple Silicon.
- Capacidad multilingue limitada: el modelo esta entrenado exclusivamente para ingles.

## Casos de uso

- De-identificacion de historias clinicas electronicas: el modelo puede procesar notas medicas y eliminar o enmascarar automaticamente los datos personales antes de su almacenamiento o comparticion, cumpliendo con requisitos de HIPAA.
- Anonimizacion de datasets para investigacion biomedica: permite preparar corpus clinicos para entrenamiento de modelos sin exponer informacion de pacientes, gracias a su clasificacion de 54 tipos de PII.
- Cumplimiento normativo en entornos locales: al ejecutarse en local (Apple Silicon), evita enviar datos sensibles a servicios en la nube, lo que es critico en hospitales y clinicas con politicas estrictas de privacidad.
- Procesamiento de notas clinicas en dispositivos Mac: integrable en flujos de trabajo de profesionales sanitarios que necesitan revisar o redactar documentacion clinica con proteccion de datos.
- Pipeline de NLP medica: puede combinarse con otros modelos de OpenMed (mas de 2.200 modelos medicos) para tareas como extraccion de entidades clinicas, normalizacion o analisis de sintomas, manteniendo la privacidad.
- Despliegue en entornos sin conexion: al ser un modelo de 279M y estar empaquetado en MLX, puede ejecutarse en Macs sin conexion a internet, ideal para clinicas rurales o unidades moviles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni metricas especificas de NER (como F1, precision o recall) para este modelo.

## Requisitos de hardware

- El modelo esta disenado para Apple Silicon (M1, M2, M3 y posteriores) con el backend MLX de OpenMed.
- Requiere la instalacion de `openmed[mlx]` para ejecucion en Python.
- No se especifica la VRAM minima, pero al tratarse de un modelo de 279M en MLX, se estima que puede ejecutarse en Macs con 8 GB de RAM unificada o superior (dato no confirmado por el autor).
- No hay soporte Swift MLX para esta familia de modelos (deberta-v2) en la version actual de OpenMedKit; se recomienda Python MLX o CoreML si se necesita integracion en apps de Apple.
- Para otros sistemas, se puede usar el backend de Hugging Face/PyTorch, aunque no se indican requisitos de GPU.
- Opciones de despliegue: OpenMed (Python), Hugging Face Transformers, y versiones ONNX para Android/Web (repositorio separado).

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar este modelo con alternativas de la misma categoria (deteccion de PII en texto clinico). El modelo base original (OpenMed-PII-mSuperClinical-Large-279M-v1) es el mismo checkpoint, y existen otras variantes de empaquetado (ONNX para Android/Web), pero no se conocen modelos comparables con datos publicos de rendimiento. Se recomienda consultar el ecosistema OpenMed para modelos alternativos de NER clinico.

## Limitaciones y advertencias

- El modelo solo soporta ingles; no es adecuado para textos en otros idiomas sin fine-tuning adicional.
- No se incluyen los assets del tokenizador en este repositorio MLX; se resuelven por referencia al modelo base, lo que puede requerir conexion a internet la primera vez o una descarga manual.
- El soporte Swift MLX no esta disponible para arquitecturas deberta-v2 en OpenMedKit, limitando su uso en aplicaciones nativas de Apple.
- Al ser un modelo de clasificacion de tokens, puede producir falsos positivos o negativos en la deteccion de PII, especialmente con formatos de datos poco comunes o errores ortograficos en las notas clinicas.
- No se han publicado evaluaciones de sesgos ni estudios de robustez en dominios clinicos especificos; se recomienda validar el modelo con datos propios antes de usarlo en produccion.
- La licencia Apache-2.0 permite uso comercial, pero el usuario es responsable de verificar el cumplimiento de normativas de privacidad (como HIPAA) en su jurisdiccion.

## Enlaces

- Repositorio HuggingFace del modelo MLX: https://huggingface.co/OpenMed/OpenMed-PII-mSuperClinical-Large-279M-v1-mlx
- Modelo base original: https://huggingface.co/OpenMed/OpenMed-PII-mSuperClinical-Large-279M-v1
- Version ONNX para Android/Web: https://huggingface.co/OpenMed/OpenMed-PII-mSuperClinical-Large-279M-v1-onnx-android
- Repositorio GitHub de OpenMed: https://github.com/maziyarpanahi/openmed
- Documentacion del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentacion de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
- Sitio web de OpenMed: https://openmed.life/
