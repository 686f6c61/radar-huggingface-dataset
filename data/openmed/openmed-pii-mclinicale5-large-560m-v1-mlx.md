# OpenMed/OpenMed-PII-mClinicalE5-Large-560M-v1-mlx

## Resumen

OpenMed-PII-mClinicalE5-Large-560M-v1-mlx es un modelo de clasificación de tokens (token classification) especializado en la detección de información personal identificable (PII) y datos sanitarios protegidos (PHI) en texto clínico en inglés. Desarrollado por OpenMed, este checkpoint es un empaquetado en formato MLX del modelo base OpenMed/OpenMed-PII-mClinicalE5-Large-560M-v1, diseñado para ejecutarse de forma nativa en hardware Apple Silicon (macOS, iPhone y iPad) mediante la librería OpenMed o OpenMedKit.

El modelo pertenece a la familia XLM-RoBERTa (concretamente `XLMRobertaForTokenClassification`) y cuenta con aproximadamente 560 millones de parámetros. Su propósito principal es la de-identificación de historiales clínicos, identificando y clasificando hasta 54 tipos de entidades sensibles como nombres, direcciones, números de seguridad social, números de historia clínica, entre otros. Su relevancia actual radica en que permite procesar datos médicos de forma totalmente local, sin enviar información del paciente a la nube, lo que facilita el cumplimiento de normativas como HIPAA.

Este repositorio concreto contiene los pesos en formato MLX (`.safetensors` o `.npz`) y los ficheros de configuración necesarios para su uso con el backend MLX de OpenMed en Apple Silicon. No incluye el tokenizador, que se referencia desde el modelo base. La licencia es Apache-2.0, lo que permite uso comercial y modificación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (XLMRobertaForTokenClassification) |
| Parametros totales | 560M (segun nombre del modelo) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato MLX nativo, sin cuantizacion declarada) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (weights.safetensors y/o weights.npz) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura XLM-RoBERTa Large, un transformer encoder preentrenado multilingüe de la familia RoBERTa. En este caso, se ha realizado un fine-tuning específico para la tarea de token classification orientada a la detección de PII/PHI en dominios clínicos y biomédicos. La capa de salida clasifica cada token en una de las 54 categorías de entidades sensibles definidas por OpenMed.

No se dispone de información detallada sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) en la documentación proporcionada. El modelo original (no MLX) está disponible en Hugging Face como `OpenMed/OpenMed-PII-mClinicalE5-Large-560M-v1`, y este repositorio MLX es una conversión de pesos para inferencia en Apple Silicon. La librería OpenMed gestiona automáticamente la selección del backend (MLX en Apple Silicon, PyTorch/Hugging Face en otras plataformas).

## Capacidades

- Detección y clasificación de PII/PHI en texto clínico en inglés: identifica hasta 54 tipos de entidades (nombres, direcciones, números de seguridad social, números de historia clínica, fechas, etc.).
- Token classification: asigna una etiqueta a cada token del texto de entrada, permitiendo extraer entidades con sus posiciones exactas.
- Inferencia local en Apple Silicon mediante MLX, sin necesidad de conexión a internet ni envío de datos a servidores externos.
- Compatible con el ecosistema OpenMed: se integra con la API `extract_pii` de Python y con OpenMedKit para Swift (macOS, iPhone y iPad).
- Soporte de smart merging: la función `use_smart_merging=True` permite fusionar tokens adyacentes de la misma entidad para obtener resultados más coherentes.
- Disponible también en formato ONNX (repositorio hermano) para ejecución en CPU, navegador y Android, aunque este repo concreto es solo MLX.

## Casos de uso

- De-identificación de historiales clínicos para investigación: el modelo puede procesar notas clínicas y eliminar o enmascarar automáticamente los identificadores personales antes de compartir los datos con equipos de investigación, cumpliendo requisitos de anonimización.
- Cumplimiento HIPAA en aplicaciones sanitarias: integrado en sistemas de gestión de historiales, permite detectar y redactar PHI en tiempo real antes de almacenar o transmitir datos, reduciendo el riesgo de violaciones de privacidad.
- Preparación de datasets para entrenamiento de modelos médicos: al limpiar grandes volúmenes de texto clínico, facilita la creación de corpus anonimizados para fine-tuning de otros modelos de IA sin exponer información del paciente.
- Auditoría de documentos clínicos: puede utilizarse para revisar automáticamente informes, altas y pruebas diagnósticas en busca de datos personales no intencionados antes de su publicación o intercambio.
- Aplicaciones móviles de salud: gracias a su empaquetado MLX y soporte Swift, puede ejecutarse en iPhone y iPad para procesar notas del paciente directamente en el dispositivo, sin conexión a la nube.
- Automatización de flujos de trabajo en entornos clínicos: integrado en pipelines de procesamiento de lenguaje natural, permite extraer entidades PII de forma estructurada para alimentar sistemas de gestión documental o de facturación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K, ya que se trata de un modelo de token classification especializado, no de un modelo generativo. Tampoco se han encontrado comparativas con otros modelos de NER clínico en la documentación proporcionada.

## Requisitos de hardware

- Apple Silicon (M1, M2, M3 o superior) para ejecución MLX nativa. El modelo está optimizado para macOS, iPhone y iPad reales (no simulador de iOS).
- En otras plataformas (Linux, Windows, GPU NVIDIA), se puede utilizar el modelo base en formato PyTorch/Hugging Face, pero este repositorio MLX no es compatible directamente.
- No se especifica la VRAM necesaria. Dado que el modelo tiene 560M parámetros, en MLX puede caber en la memoria unificada de cualquier Mac con Apple Silicon (8 GB o más), aunque no hay datos oficiales de consumo.
- Opciones de despliegue: librería `openmed[mlx]` en Python, OpenMedKit en Swift, o descarga directa del repositorio y uso con `OpenMedConfig(backend="mlx")`.
- No se proporcionan datos de latencia o throughput. Al ser un modelo de 560M en MLX, se espera un rendimiento en tiempo real en hardware Apple Silicon, pero sin cifras confirmadas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos alternativos de la misma categoría (detección de PII en texto clínico). El ecosistema OpenMed incluye otros modelos de NER biomédico, pero no se han encontrado datos comparativos de rendimiento, parámetros o licencias en la documentación proporcionada. Se recomienda consultar el catálogo de modelos de OpenMed para evaluar alternativas.

## Limitaciones y advertencias

- El modelo está entrenado únicamente para texto en inglés. No soporta otros idiomas, aunque OpenMed ofrece modelos separados para 33 idiomas con PII.
- No se han documentado sesgos específicos, pero al ser un modelo basado en XLM-RoBERTa, puede heredar sesgos del preentrenamiento original. Se recomienda validar en poblaciones diversas.
- Riesgo de alucinación: al ser un modelo de token classification, el riesgo de generar texto falso es bajo, pero puede haber errores de clasificación (falsos positivos o negativos) en entidades poco frecuentes o con formatos atípicos.
- La longitud de contexto no está documentada. XLM-RoBERTa Large tiene un límite de 512 tokens por defecto, pero no se confirma si se ha extendido en este fine-tuning.
- El repositorio MLX no incluye el tokenizador; depende de la referencia al modelo base en `config.json`. Si se usa fuera del ecosistema OpenMed, puede ser necesario descargar el tokenizador por separado.
- La licencia Apache-2.0 permite uso comercial, pero el modelo está pensado para entornos clínicos; es responsabilidad del usuario verificar que el uso cumple con las normativas locales de protección de datos (GDPR, HIPAA, etc.).
- El repositorio puede requerir autenticación con Hugging Face si es privado en el entorno de despliegue.

## Enlaces

- Repositorio MLX en Hugging Face: https://huggingface.co/OpenMed/OpenMed-PII-mClinicalE5-Large-560M-v1-mlx
- Modelo base (PyTorch): https://huggingface.co/OpenMed/OpenMed-PII-mClinicalE5-Large-560M-v1
- Versión ONNX para Android/navegador: https://huggingface.co/OpenMed/OpenMed-PII-mClinicalE5-Large-560M-v1-onnx-android
- GitHub de OpenMed: https://github.com/maziyarpanahi/openmed
- Documentación del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentación de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
- Sitio web de OpenMed: https://openmed.life/
