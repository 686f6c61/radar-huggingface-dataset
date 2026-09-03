# OpenMed/OpenMed-PII-Portuguese-LiteClinical-Small-66M-v1-mlx

## Resumen

OpenMed-PII-Portuguese-LiteClinical-Small-66M-v1-mlx es un modelo de clasificación de tokens (token classification) diseñado para detectar información personal identificable (PII) en textos clínicos en portugués. Desarrollado por OpenMed, forma parte de una plataforma de IA local-first para el sector sanitario que prioriza la privacidad y el procesamiento en el dispositivo. Este repositorio concreto contiene un empaquetado en formato MLX, optimizado para ejecutarse en Apple Silicon, del modelo base homónimo.

El modelo se basa en la arquitectura DistilBERT (DistilBertForTokenClassification) y cuenta con aproximadamente 66 millones de parámetros, lo que lo convierte en una solución muy ligera y adecuada para entornos con recursos limitados. Su propósito principal es la de-identificación de historiales clínicos, permitiendo a hospitales e investigadores compartir datos médicos sin exponer la identidad de los pacientes. La relevancia actual radica en la creciente necesidad de cumplir normativas de privacidad (como la LGPD en Brasil o el RGPD en Europa) y en la tendencia hacia soluciones de IA que no dependan de la nube.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBertForTokenClassification (BERT) |
| Parametros totales | 66 millones (aprox.) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugues (pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tambien posible npz en el paquete MLX) |

## Arquitectura y entrenamiento

El modelo es una variante de DistilBERT, una versión destilada de BERT que reduce el número de parámetros manteniendo un rendimiento competitivo. La capa de salida es una cabeza de clasificación de tokens (token classification) que asigna una etiqueta a cada token de entrada, permitiendo identificar entidades como nombres, números de identificación, direcciones o datos de contacto dentro de texto clínico.

No se han publicado detalles específicos sobre el proceso de entrenamiento, como el número de tokens utilizados, la composición del dataset o si se emplearon técnicas de ajuste fino adicionales (por ejemplo, RLHF o DPO). El repositorio indica que el modelo base es `OpenMed/OpenMed-PII-Portuguese-LiteClinical-Small-66M-v1`, y este artefacto MLX es una conversión para su uso con el backend MLX de OpenMed en Apple Silicon. La librería `openmed` proporciona una API de alto nivel (`extract_pii`) que simplifica la integración.

## Capacidades

- Detección de PII en texto clínico en portugués: identifica entidades como nombres, números de identificación, direcciones, teléfonos y otros datos personales.
- Clasificación de tokens a nivel de token, con soporte para fusión inteligente de entidades (`use_smart_merging=True`) para agrupar tokens contiguos en entidades completas.
- Ejecución local en Apple Silicon mediante el backend MLX de OpenMed, sin necesidad de conexión a la nube.
- Integración con la plataforma OpenMed, que ofrece más de 2.200 modelos médicos y soporte para 21 idiomas.
- Compatibilidad con el ecosistema Hugging Face: el modelo base puede usarse con PyTorch en otros sistemas, aunque este repositorio está optimizado para MLX.
- Posibilidad de uso en flujos de trabajo de anonimización y de-identificación de datos clínicos.

## Casos de uso

- De-identificación de historiales clínicos para investigación: hospitales y centros médicos pueden procesar registros de pacientes para eliminar PII antes de compartirlos con equipos de investigación, cumpliendo así con normativas de privacidad.
- Anonimización de datos para ensayos clínicos: al preparar conjuntos de datos para estudios farmacéuticos o académicos, el modelo puede eliminar automáticamente identificadores personales de notas clínicas.
- Cumplimiento normativo en sistemas de salud: integración en plataformas de gestión de historiales para garantizar que los datos compartidos con terceros (aseguradoras, auditores) estén libres de PII.
- Preparación de datos para entrenamiento de otros modelos: antes de usar texto clínico para entrenar modelos de NLP, se puede aplicar este detector para limpiar el corpus y evitar fugas de información personal.
- Herramientas de redacción automática en entornos clínicos: los profesionales pueden usar el modelo para enmascarar PII en notas antes de enviarlas a servicios externos de transcripción o análisis.
- Despliegue en dispositivos locales para clínicas pequeñas: gracias a su tamaño reducido y al soporte MLX, puede ejecutarse en Macs con Apple Silicon sin necesidad de infraestructura en la nube, lo que reduce costes y riesgos de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos de detección de PII. Se recomienda evaluar el modelo en un conjunto de validación propio antes de su uso en producción.

## Requisitos de hardware

- Al ser un modelo de 66M parámetros, la VRAM necesaria para inferencia es reducida. En Apple Silicon, el backend MLX utiliza la memoria unificada del sistema; se estima que el modelo puede ejecutarse con menos de 1 GB de memoria, aunque no se ha especificado oficialmente.
- GPU recomendadas: cualquier Mac con chip Apple Silicon (M1, M2, M3 o superior) para el backend MLX. En otros sistemas, puede usarse con PyTorch en GPUs convencionales, aunque no se proporcionan requisitos mínimos.
- Es adecuado para hardware de consumo: cabe en Macs de gama de entrada y en GPUs con al menos 2 GB de VRAM si se usa PyTorch.
- Opciones de despliegue: mediante la librería `openmed[mlx]` en Apple Silicon, o con el backend estándar de Hugging Face / PyTorch en otros entornos. También es posible usar el repositorio MLX directamente con la API de OpenMed.
- No se dispone de datos de latencia o throughput. Dado el tamaño del modelo, se espera una inferencia rápida, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos en la documentación proporcionada. Existen otros modelos de detección de PII en el ecosistema Hugging Face, pero no se han encontrado datos suficientes para establecer una comparación rigurosa. Se recomienda consultar el catálogo de OpenMed para alternativas en otros idiomas o con diferentes tamaños.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para texto clínico en portugués; su rendimiento en otros dominios o idiomas puede ser deficiente.
- Al ser un modelo pequeño (66M), puede tener una precisión inferior a modelos más grandes en tareas complejas de NER, especialmente con entidades poco frecuentes o contextos ambiguos.
- No se han publicado detalles sobre sesgos o riesgos de alucinación. Como cualquier modelo de NLP, puede cometer errores de clasificación, por lo que se recomienda supervisión humana en aplicaciones críticas.
- La licencia Apache-2.0 permite uso comercial, pero es responsabilidad del usuario verificar el cumplimiento de las normativas de protección de datos aplicables (por ejemplo, LGPD en Brasil).
- El repositorio MLX está orientado a Apple Silicon; en otros sistemas, se debe usar el modelo base original con PyTorch, lo que puede requerir configuración adicional.
- No se garantiza la ausencia de PII residual tras la de-identificación; se recomienda una revisión manual en entornos de alto riesgo.

## Enlaces

- Repositorio HuggingFace del modelo MLX: [https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-LiteClinical-Small-66M-v1-mlx](https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-LiteClinical-Small-66M-v1-mlx)
- Modelo base: [https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-LiteClinical-Small-66M-v1](https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-LiteClinical-Small-66M-v1)
- Repositorio GitHub de OpenMed: [https://github.com/maziyarpanahi/openmed](https://github.com/maziyarpanahi/openmed)
- Documentación del backend MLX: [https://openmed.life/docs/mlx-backend/](https://openmed.life/docs/mlx-backend/)
- Documentación de OpenMedKit (Swift): [https://openmed.life/docs/swift-openmedkit/](https://openmed.life/docs/swift-openmedkit/)
- Colección de modelos médicos MLX de OpenMed: [https://huggingface.co/collections/OpenMed/medical-mlx-models](https://huggingface.co/collections/OpenMed/medical-mlx-models)
