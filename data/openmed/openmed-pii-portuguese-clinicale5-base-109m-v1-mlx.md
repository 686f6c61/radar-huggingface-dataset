# OpenMed/OpenMed-PII-Portuguese-ClinicalE5-Base-109M-v1-mlx

## Resumen

OpenMed-PII-Portuguese-ClinicalE5-Base-109M-v1-mlx es un modelo de clasificación de tokens (token classification) basado en la arquitectura BERT, específicamente diseñado para la detección de información personal identificable (PII) en textos clínicos en portugués. Fue desarrollado por OpenMed como un empaquetado en formato MLX del checkpoint original `OpenMed/OpenMed-PII-Portuguese-ClinicalE5-Base-109M-v1`, optimizado para inferencia en Apple Silicon mediante la librería `openmed`. El modelo identifica 54 tipos de entidades sensibles, como nombres, direcciones, números de seguridad social, números de registro médico, entre otros.

Con 109 millones de parámetros, este encoder compacto está pensado para tareas de de-identificación de datos clínicos, un paso crítico para el cumplimiento de normativas como HIPAA y para permitir la investigación médica sin comprometer la privacidad de los pacientes. Su relevancia actual radica en la creciente necesidad de herramientas locales y privadas que procesen datos de salud sin depender de la nube, y en su soporte específico para el portugués, un idioma con escasez de modelos especializados en el ámbito clínico.

El modelo se distribuye bajo licencia Apache-2.0, lo que permite uso comercial y modificación, y está disponible en Hugging Face con un tamaño de repositorio de 0,9 GB. Aunque su adopción es aún limitada (8 descargas), forma parte de una colección más amplia de modelos médicos de OpenMed orientados a la inferencia local en dispositivos Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (BertForTokenClassification) |
| Parametros totales | 109 millones |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (típico de BERT, 512 tokens, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugués (pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX weights) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT, un transformer encoder bidireccional, adaptado para la tarea de clasificación de tokens mediante una cabeza de clasificación por token (`BertForTokenClassification`). El checkpoint original fue fine-tuneado específicamente para la detección de PII en textos clínicos en portugués, aunque no se han publicado detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. La versión MLX es una conversión del checkpoint original al formato de pesos de MLX, manteniendo la misma arquitectura y pesos, pero optimizada para la ejecución en Apple Silicon mediante la librería `openmed`.

No se dispone de información sobre innovaciones técnicas adicionales más allá del fine-tuning estándar para token classification. El modelo está diseñado para funcionar con el backend MLX de OpenMed, que permite inferencia local sin conexión a la nube, y también puede ejecutarse en otros sistemas mediante el backend de Hugging Face / PyTorch.

## Capacidades

- Detección de información personal identificable (PII) en textos clínicos en portugués, con 54 tipos de entidades (nombres, direcciones, números de seguridad social, números de registro médico, etc.).
- Clasificación de tokens a nivel de token, con soporte para fusión inteligente de entidades (`use_smart_merging=True`) para agrupar tokens adyacentes en entidades completas.
- Integración con la librería `openmed` para extracción de PII mediante la función `extract_pii`, que devuelve etiquetas, textos y niveles de confianza.
- Ejecución 100% local en Apple Silicon mediante el backend MLX, sin necesidad de enviar datos a la nube.
- Compatibilidad con el ecosistema OpenMed, que incluye más de 2.200 modelos médicos y soporte para 21 idiomas.
- Posibilidad de uso en otros entornos (CPU/GPU) mediante el backend de Hugging Face / PyTorch, aunque el empaquetado MLX está optimizado para Apple.

## Casos de uso

- De-identificación de historias clínicas electrónicas: el modelo puede procesar notas clínicas en portugués y eliminar o enmascarar automáticamente los datos personales, facilitando el cumplimiento de normativas de privacidad como la LGPD (Ley General de Protección de Datos de Brasil) o HIPAA en entornos internacionales.
- Preparación de datasets para investigación médica: antes de compartir datos clínicos con investigadores externos, el modelo puede anonimizar los registros, reduciendo el riesgo de re-identificación de pacientes.
- Auditoría de cumplimiento normativo: integrado en pipelines de gestión de datos, el modelo puede escanear documentos clínicos y generar informes sobre la presencia de PII, ayudando a las organizaciones sanitarias a verificar el cumplimiento de políticas de privacidad.
- Sistemas de atención al paciente con privacidad local: en entornos hospitalarios donde no se permite el envío de datos a la nube, el modelo puede ejecutarse en dispositivos Apple Silicon (por ejemplo, Mac mini o MacBook) para procesar notas clínicas en tiempo real sin conexión externa.
- Anonimización de textos para entrenamiento de otros modelos: los datos clínicos anonimizados pueden utilizarse para fine-tuning de modelos de lenguaje médicos, garantizando que no se filtren datos personales en los conjuntos de entrenamiento.
- Soporte a la gestión de datos en portugués: dado que el modelo está especializado en portugués, es adecuado para instituciones sanitarias en Brasil, Portugal y otros países lusófonos que necesiten herramientas de de-identificación en su idioma nativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre métricas como precisión, recall o F1 en tareas de NER para PII en portugués, ni comparaciones con otros modelos.

## Requisitos de hardware

- Al ser un modelo de 109 millones de parámetros, su huella de memoria es reducida: en precisión fp32 ocuparía aproximadamente 436 MB, y en fp16 unos 218 MB, aunque estos valores son estimaciones basadas en el tamaño de parámetros y no están confirmados por el autor.
- Está optimizado para Apple Silicon mediante el backend MLX de OpenMed, por lo que puede ejecutarse en cualquier Mac con chip M1 o superior (incluyendo MacBook, Mac mini, Mac Studio) sin necesidad de GPU dedicada.
- En sistemas sin Apple Silicon, OpenMed puede utilizar el backend de Hugging Face / PyTorch, lo que permite ejecutarlo en CPU o GPU convencionales (por ejemplo, NVIDIA), aunque no se especifican requisitos mínimos.
- Para despliegue, se recomienda instalar `openmed[mlx]` en macOS y utilizar la API `extract_pii`. También es posible descargar el repositorio MLX y apuntar directamente a la carpeta local.
- No se dispone de datos sobre latencia o throughput, pero al ser un modelo pequeño, se espera un rendimiento en tiempo real en hardware Apple Silicon moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| OpenMed-PII-Portuguese-ClinicalE5-Base-109M-v1-mlx | 109M | no disponible | pt | Apache-2.0 | MLX (safetensors) |
| OpenMed-PII-Portuguese-ClinicalE5-Small-33M-v1-mlx | 33M | no disponible | pt | Apache-2.0 | MLX (safetensors) |

Ambos modelos pertenecen a la misma familia de OpenMed y están especializados en PII clínica en portugués. La versión Base (109M) ofrece mayor capacidad de representación que la versión Small (33M), lo que probablemente se traduzca en mejor precisión, aunque no hay benchmarks publicados que lo confirmen. No se dispone de información sobre otros modelos comparables en el ámbito de PII clínica en portugués.

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos potenciales del modelo, pero al estar entrenado específicamente para textos clínicos en portugués, puede presentar un rendimiento subóptimo en otros dominios o variantes del idioma (por ejemplo, portugués de Angola o Mozambique).
- El modelo es un encoder pequeño (109M) y puede tener dificultades con contextos muy largos o con estructuras sintácticas complejas, aunque no se especifica la longitud máxima de entrada.
- No hay información sobre la calidad de las predicciones en términos de precisión o recall; se recomienda validar el modelo en el propio corpus antes de usarlo en producción.
- La licencia Apache-2.0 permite uso comercial, pero no se ofrecen garantías sobre la exactitud de la de-identificación; el usuario es responsable de verificar que el modelo cumple con los requisitos legales de su jurisdicción.
- El empaquetado MLX está pensado para Apple Silicon; en otros sistemas, el rendimiento puede variar y no se garantiza la misma optimización.
- El modelo solo soporta portugués; no es adecuado para textos en otros idiomas sin un fine-tuning adicional.

## Enlaces

- Repositorio MLX en Hugging Face: https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-ClinicalE5-Base-109M-v1-mlx
- Checkpoint original: https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-ClinicalE5-Base-109M-v1
- Repositorio de OpenMed en GitHub: https://github.com/maziyarpanahi/openmed
- Documentación del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentación de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
- Colección de modelos médicos MLX: https://huggingface.co/collections/OpenMed/medical-mlx-models
- Modelo similar (versión Small): https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-ClinicalE5-Small-33M-v1-mlx
