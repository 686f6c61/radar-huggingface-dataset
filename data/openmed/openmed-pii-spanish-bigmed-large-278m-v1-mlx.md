# OpenMed/OpenMed-PII-Spanish-BigMed-Large-278M-v1-mlx

## Resumen

OpenMed-PII-Spanish-BigMed-Large-278M-v1-mlx es un modelo de clasificación de tokens (token classification) especializado en la detección de información personal identificable (PII) en texto clínico en español. Desarrollado por el proyecto OpenMed, se basa en la arquitectura XLM-RoBERTa y ha sido ajustado específicamente para tareas de de-identificación de historiales médicos, cubriendo más de 55 tipos de PHI (Protected Health Information) según el proyecto. Este repositorio concreto contiene un empaquetado en formato MLX, optimizado para inferencia local en dispositivos Apple Silicon (Mac, iPhone, iPad) mediante las librerías OpenMed y OpenMedKit.

El modelo resuelve el problema de la privacidad de datos sanitarios: permite eliminar o enmascarar datos personales de documentos clínicos sin necesidad de enviar la información a servidores externos, cumpliendo así requisitos de normativas como HIPAA. Su relevancia actual radica en la tendencia hacia la IA local-first en el sector sanitario, donde la confidencialidad del paciente es crítica. Con 278 millones de parámetros (según su denominación), el modelo ofrece un equilibrio entre capacidad de detección y eficiencia para ejecutarse en hardware de consumo. La versión MLX aquí descrita no incluye el tokenizador en el repositorio, sino que referencia al modelo fuente para su carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (XLMRobertaForTokenClassification) |
| Parametros totales | 278M (segun denominacion del modelo) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos MLX en safetensors/npz, sin cuantizacion especificada) |
| Idiomas soportados | es (español) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (weights.safetensors y/o weights.npz) |

## Arquitectura y entrenamiento

El modelo se basa en XLM-RoBERTa, un transformer encoder multilingüe preentrenado, adaptado mediante fine-tuning para la tarea de token classification sobre texto clínico en español. La capa de salida es una cabeza de clasificación por token que asigna etiquetas de entidades PII (nombres, fechas, números de identificación, direcciones, etc.) a cada token del texto de entrada. El checkpoint fuente es `OpenMed/OpenMed-PII-Spanish-BigMed-Large-278M-v1`, del cual se ha realizado una conversión al formato MLX para su ejecución eficiente en Apple Silicon.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. La innovación principal de este repositorio no reside en la arquitectura, sino en el empaquetado MLX: permite ejecutar el modelo de forma nativa en hardware Apple mediante las librerías OpenMed (Python) y OpenMedKit (Swift), manteniendo compatibilidad con el backend PyTorch/Hugging Face en otros sistemas. El repositorio sigue un layout MLX legacy-compatible con `config.json`, `id2label.json` y archivos de pesos, sin incluir los assets del tokenizador, que se resuelven dinámicamente desde el modelo fuente.

## Capacidades

- Detección de PII en texto clínico en español: identifica entidades como nombres de pacientes, fechas de nacimiento, números de seguridad social, direcciones, teléfonos, etc.
- Clasificación por token: asigna una etiqueta a cada token del texto, permitiendo un etiquetado granular de las entidades.
- Integración con OpenMed: la función `extract_pii` permite obtener entidades con etiqueta, texto y nivel de confianza, con opción de "smart merging" para agrupar tokens en entidades completas.
- Ejecución local en Apple Silicon: soporte nativo MLX para Mac, iPhone y iPad (Swift MLX), sin necesidad de conexión a la nube.
- Compatibilidad multi-backend: en sistemas sin Apple Silicon, OpenMed recurre automáticamente al backend Hugging Face/PyTorch.
- Soporte para despliegue en dispositivos móviles: mediante OpenMedKit, el modelo puede ejecutarse en hardware físico iPhone/iPad (no en simulador iOS).

## Casos de uso

- Anonimización de historiales clínicos en hospitales: el modelo puede procesar notas médicas en español y enmascarar o eliminar datos personales antes de su uso en investigación o intercambio entre instituciones, garantizando el cumplimiento de HIPAA.
- Preparación de datasets para investigación médica: investigadores pueden desidentificar grandes volúmenes de texto clínico de forma local, sin enviar datos sensibles a servicios externos, lo que facilita la creación de corpus anonimizados para entrenar otros modelos.
- Aplicaciones móviles de salud: desarrolladores de apps de seguimiento de pacientes pueden integrar OpenMedKit para detectar y ocultar PII en notas introducidas por el usuario, protegiendo la privacidad en el propio dispositivo.
- Integración en pipelines de NLP clínico: el modelo puede insertarse como etapa de preprocesamiento en sistemas de extracción de información médica, asegurando que los datos personales se eliminen antes de análisis posteriores.
- Cumplimiento normativo en clínicas privadas: consultas y centros médicos pueden desplegar el modelo en servidores locales (on-premise) para auditar y limpiar documentos clínicos, evitando fugas de datos en entornos no controlados.
- Desarrollo de chatbots sanitarios con privacidad: al ejecutarse localmente, el modelo permite que asistentes virtuales médicos procesen conversaciones en español sin transmitir información del paciente a la nube, reduciendo el riesgo de brechas de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este modelo en la informacion disponible. El proyecto OpenMed afirma en su sitio web ser "estado del arte en 10 de 12 benchmarks NER biomédicos", pero no se proporcionan datos desglosados para esta variante concreta de 278M. Tampoco se incluyen comparativas con otros modelos de detección de PII en español en la model card.

## Requisitos de hardware

- Apple Silicon Mac (M1, M2, M3 o posteriores) con memoria unificada de al menos 8 GB para ejecutar el modelo en MLX; al ser un modelo de 278M, el uso de VRAM es moderado y cabe en la memoria unificada de cualquier Mac actual.
- iPhone o iPad físico con chip Apple Silicon (A14 Bionic o superior) para ejecución Swift MLX; el simulador iOS no es compatible.
- Para sistemas sin Apple Silicon, se requiere una GPU compatible con PyTorch (CUDA) o CPU, con al menos 4-6 GB de VRAM para una inferencia fluida.
- Opciones de despliegue: OpenMed (Python) con backend MLX o Hugging Face, OpenMedKit (Swift) para aplicaciones nativas Apple, y versiones ONNX disponibles en repositorios hermanos para Android y WebAssembly/WebGPU.
- Latencia y throughput: no se han publicado datos específicos; al tratarse de un modelo de 278M, se espera una inferencia en el orden de decenas de milisegundos por documento en hardware Apple Silicon, aunque no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| OpenMed-PII-Spanish-BigMed-Large-278M-v1-mlx (este) | 278M | no disponible | es | Apache-2.0 | MLX |
| OpenMed-PII-Spanish-BigMed-Large-560M-v1-mlx | 560M | no disponible | es | Apache-2.0 | MLX |
| OpenMed-PII-Spanish-BigMed-Large-278M-v1 (fuente) | 278M | no disponible | es | Apache-2.0 | PyTorch/HF |

No se dispone de información sobre otros modelos competidores de detección de PII en español con los que comparar directamente. La versión de 560M del mismo proyecto ofrece mayor capacidad a costa de un mayor consumo de recursos, pero no se han publicado métricas comparativas entre ambas.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para texto clínico en español; su rendimiento en otros dominios (legales, financieros, etc.) puede ser significativamente inferior.
- El repositorio MLX no incluye el tokenizador; es necesario que OpenMed o OpenMedKit accedan al modelo fuente para cargarlo, lo que añade una dependencia externa.
- No se han documentado sesgos específicos, pero al ser un modelo basado en XLM-RoBERTa, puede heredar sesgos de los datos de preentrenamiento, especialmente en variantes dialectales del español.
- Riesgo de falsos positivos y negativos en la detección de PII: en entornos clínicos, un error de omisión puede tener graves consecuencias legales; se recomienda validación humana en flujos críticos.
- La licencia Apache-2.0 permite uso comercial, pero el proyecto OpenMed recomienda verificar el cumplimiento de normativas locales de protección de datos (RGPD, HIPAA) en cada despliegue.
- No se han publicado resultados de benchmarks para este modelo concreto, por lo que su rendimiento real frente a alternativas no está verificado de forma independiente.

## Enlaces

- Repositorio HuggingFace del modelo MLX: https://huggingface.co/OpenMed/OpenMed-PII-Spanish-BigMed-Large-278M-v1-mlx
- Checkpoint fuente (PyTorch/HF): https://huggingface.co/OpenMed/OpenMed-PII-Spanish-BigMed-Large-278M-v1
- Repositorio GitHub de OpenMed: https://github.com/maziyarpanahi/openmed
- Documentación del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentación de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
- Sitio web de OpenMed: https://openmed.life/
- Versión ONNX para Android/Web: https://huggingface.co/OpenMed/OpenMed-PII-Spanish-BigMed-Large-278M-v1-onnx-android
