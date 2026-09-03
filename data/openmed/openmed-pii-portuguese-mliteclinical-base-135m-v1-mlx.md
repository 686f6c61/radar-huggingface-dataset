# OpenMed/OpenMed-PII-Portuguese-mLiteClinical-Base-135M-v1-mlx

## Resumen

OpenMed-PII-Portuguese-mLiteClinical-Base-135M-v1-mlx es un modelo de clasificación de tokens (token classification) diseñado para detectar información personal identificable (PII) en notas clínicas en portugués. Está desarrollado por OpenMed, una iniciativa local-first para inteligencia artificial sanitaria que prioriza el procesamiento 100% en el dispositivo, sin enviar datos de pacientes a la nube. Este repositorio concreto es un empaquetado en formato MLX del checkpoint base OpenMed/OpenMed-PII-Portuguese-mLiteClinical-Base-135M-v1, pensado para ejecutarse de forma eficiente en hardware Apple Silicon.

El modelo se basa en la arquitectura DistilBERT (DistilBertForTokenClassification), una versión destilada de BERT, con aproximadamente 135 millones de parámetros según la nomenclatura del modelo base. Su relevancia actual radica en cubrir un nicho poco atendido: la detección de PII en textos clínicos en portugués, un idioma con escasez de modelos abiertos especializados. Al ser un modelo pequeño, resulta adecuado para despliegues en entornos con recursos limitados, como hospitales o dispositivos periféricos, y su licencia Apache-2.0 permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBertForTokenClassification (familia BERT) |
| Parametros totales | 135M (según nomenclatura del modelo base, no confirmado en la documentación) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (típico de DistilBERT: 512 tokens, no confirmado) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Portugués (pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura DistilBERT, una versión destilada de BERT que conserva la mayor parte de su capacidad con un 40% menos de parámetros. En este caso, se utiliza la variante de clasificación de tokens (DistilBertForTokenClassification), que asigna una etiqueta a cada token de entrada, permitiendo identificar entidades PII a nivel de token. El modelo base fue entrenado específicamente para la detección de PII en textos clínicos en portugués, aunque no se han publicado detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. El empaquetado MLX convierte los pesos a un formato optimizado para Apple Silicon, manteniendo la misma arquitectura y comportamiento que el checkpoint original.

## Capacidades

- Detección de entidades PII en notas clínicas en portugués: nombres, direcciones, fechas, números de identificación, teléfonos, etc.
- Clasificación de tokens a nivel de token (token-level classification), con etiquetas definidas en el archivo `id2label.json`.
- Integración con la librería OpenMed para extracción de PII con fusión inteligente de entidades (`use_smart_merging=True`).
- Ejecución local en Apple Silicon mediante el backend MLX, sin necesidad de conexión a internet.
- Compatibilidad con el ecosistema OpenMed, que incluye más de 2.200 modelos médicos en 21 idiomas.
- Soporte para despliegue en Python (con `openmed[mlx]`) y, potencialmente, en Swift mediante OpenMedKit (según la matriz de soporte).

## Casos de uso

- Anonimización de historias clínicas en portugués: el modelo identifica y marca automáticamente los campos PII en documentos clínicos, permitiendo su posterior enmascaramiento o eliminación antes de compartir los datos con terceros.
- Cumplimiento normativo (LGPD, HIPAA): integrado en pipelines de procesamiento de datos sanitarios, ayuda a garantizar que la información personal se elimine antes de su almacenamiento o transmisión, reduciendo el riesgo de sanciones.
- Investigación médica con datos desidentificados: los investigadores pueden procesar grandes volúmenes de notas clínicas en portugués sin exponer identidades de pacientes, facilitando estudios epidemiológicos o de minería de textos.
- Procesamiento local en hospitales: al ejecutarse 100% en el dispositivo, el modelo permite tratar datos sensibles sin enviarlos a servidores externos, cumpliendo con políticas de privacidad estrictas.
- Integración en pipelines de NLP clínico: puede combinarse con otros modelos de OpenMed para tareas como extracción de entidades clínicas, normalización de terminología o generación de resúmenes, todo en un entorno local.
- Despliegue en dispositivos Apple: gracias al formato MLX, el modelo puede ejecutarse en Macs con Apple Silicon, iPads o iPhones, habilitando aplicaciones de salud móviles que procesan datos en el propio dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Apple Silicon (M1, M2, M3 o superior) para ejecución con MLX.
- Memoria unificada: al ser un modelo de 135M, requiere aproximadamente 0,5-1 GB de memoria para inferencia en FP32, aunque no se especifican cifras exactas. Cabe en cualquier Mac con 8 GB o más de RAM unificada.
- No se requieren GPUs dedicadas; el backend MLX aprovecha la GPU integrada y la Neural Engine de Apple Silicon.
- Opciones de despliegue: Python con `openmed[mlx]`, o mediante la API de OpenMed que selecciona automáticamente el backend. También es posible usar el repositorio descargado directamente con `OpenMedConfig(backend="mlx")`.
- Para aplicaciones Swift, se recomienda consultar la matriz de soporte de OpenMedKit; actualmente el soporte Swift para esta familia está en desarrollo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| OpenMed-PII-Portuguese-mLiteClinical-Base-135M-v1-mlx | 135M | No disponible | Portugués | Apache-2.0 | MLX (safetensors) |
| OpenMed-PII-Portuguese-LiteClinical-Small-66M-v1-mlx | 66M | No disponible | Portugués | Apache-2.0 | MLX (safetensors) |

Ambos modelos pertenecen a la misma familia OpenMed y comparten arquitectura DistilBERT, diferenciándose en tamaño (135M vs 66M). El modelo Base ofrece mayor capacidad de representación, mientras que el Small es más ligero para entornos con recursos muy limitados. No se dispone de información sobre otros modelos comparables de detección de PII en portugués clínico en el ecosistema abierto.

## Limitaciones y advertencias

- El modelo está entrenado únicamente para portugués; no soporta otros idiomas.
- Al ser un modelo pequeño (135M), su precisión puede ser inferior a la de modelos más grandes, especialmente en textos clínicos con jerga especializada o formatos poco comunes.
- No se han publicado datos sobre sesgos específicos, pero como todo modelo de NLP, puede reflejar sesgos presentes en los datos de entrenamiento.
- Riesgo de alucinación o etiquetado incorrecto en entidades ambiguas; se recomienda validación humana en entornos clínicos críticos.
- La longitud de contexto no está confirmada; si sigue el estándar de DistilBERT, será de 512 tokens, lo que limita el procesamiento de documentos largos en una sola pasada.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo no ha sido certificado para uso clínico real; cualquier aplicación en producción debe someterse a validación regulatoria.

## Enlaces

- Repositorio HuggingFace del modelo MLX: https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-mLiteClinical-Base-135M-v1-mlx
- Checkpoint base (PyTorch): https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-mLiteClinical-Base-135M-v1
- GitHub de OpenMed: https://github.com/maziyarpanahi/openmed
- Documentación del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentación de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
- Colección de modelos médicos MLX: https://huggingface.co/collections/OpenMed/medical-mlx-models
