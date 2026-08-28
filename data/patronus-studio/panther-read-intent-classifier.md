# patronus-studio/panther-read-intent-classifier

## Resumen

Panther Read es un clasificador de intención multilingüe desarrollado por Patronus Studio (Patronus Protect) como parte de su stack de seguridad para agentes de IA. Basado en el modelo ModernBERT `jhu-clsp/mmBERT-small`, asigna a cada solicitud de entrada una de cinco categorías operativas: conversación benigna, petición de desarrollo de código, petición de análisis de datos, petición de oficina o petición de operación de herramientas. Su función principal es el enrutamiento de solicitudes en tiempo real, permitiendo que solo el tráfico que requiere análisis de seguridad profundo reciba ese tratamiento, mientras que la conversación ordinaria toma una vía rápida.

El modelo tiene 140,6 millones de parámetros y está entrenado sobre un conjunto de datos multilingüe propio (alemán e inglés) con aumentaciones de ofuscación modernas (homoglifos, base64, wrappers de etiquetas, etc.) y regularizaciones diseñadas para reducir sesgos de forma superficial. Se distribuye bajo licencia Apache 2.0 en formato safetensors y ONNX (FP16), con variantes cuantizadas adicionales en un repositorio separado. Su relevancia actual radica en la creciente necesidad de clasificar y enrutar las solicitudes que reciben los agentes de IA en producción, especialmente en entornos donde la seguridad y la gobernanza de acciones son críticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (mmBERT-small) con cabeza de clasificación de secuencia |
| Parametros totales | 140.643.461 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base mmBERT-small soporta 8192 tokens, pero no se especifica en la documentación del modelo) |
| Tipos de cuantizacion | FP32 (safetensors), FP16 (ONNX), int8 e int8_int4_embeddings (en repositorio edge) |
| Idiomas soportados | aleman (de), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

Panther Read emplea una arquitectura de transformer encoder bidireccional basada en ModernBERT (concretamente `mmBERT-small`), un modelo de la familia ModernBERT optimizado para eficiencia y latencia en tareas de clasificación. La cabeza de clasificación es una única capa lineal sobre la representación de la secuencia, que produce logits sobre cinco clases. No se trata de un modelo generativo, sino de un clasificador de secuencia puro, lo que lo hace adecuado para inferencia de baja latencia en pipelines de enrutamiento.

El entrenamiento se realizó sobre un dataset multilingüe propio de Patronus, construido a partir de fuentes reales limpiadas por jueces humanos (sin heurísticas de palabras clave) y ejemplos generados internamente, con eliminación de filas contaminadas. Para mejorar la robustez, se aplicaron aumentaciones que incluyen variantes Unicode, ataques de homoglifos, codificaciones (base64), wrappers de etiquetas (`User:`, `System:`), etiquetas HTML, comentarios de código, ruido de espaciado, leetspeak y ruido de mayúsculas, así como combinaciones de estas técnicas. La regularización incluyó wrappers de lenguaje natural alrededor de los payloads, muestras contrafactuales, corpus de palabras desencadenantes y deduplicación al 90% de similitud con guardia de fuga entre entrenamiento y validación/test. No se menciona el uso de RLHF o DPO; el proceso es de fine-tuning supervisado estándar.

## Capacidades

- Clasificación de intención en cinco clases mutuamente excluyentes: `benign_conv`, `code_development_request`, `data_analytics_request`, `office_request` y `tool_operation_request`.
- Enrutamiento de solicitudes en agentes de IA: determina qué capacidad o política debe aplicarse a cada petición entrante.
- Detección de intenciones operativas en texto multilingüe (alemán e inglés), incluyendo variantes ofuscadas (base64, homoglifos, wrappers, etc.).
- Soporte de inferencia ONNX (FP16) y versiones cuantizadas (int8, int8_int4_embeddings) para despliegue en entornos edge.
- Diseñado para integrarse en pipelines de seguridad de agentes (Patronus Protect), actuando como filtro previo a análisis de seguridad profundos.
- No es un modelo generativo: no produce texto, solo asigna etiquetas de intención con una puntuación de confianza.

## Casos de uso

- Enrutamiento de solicitudes en agentes de IA: el modelo clasifica cada petición entrante y la dirige al módulo correspondiente (generación de código, análisis de datos, ofimática, operación de herramientas) o a una vía de conversación benigna sin procesamiento adicional.
- Políticas de aprobación y gobernanza: las peticiones clasificadas como `tool_operation_request` pueden requerir aprobación humana o controles de seguridad adicionales antes de ejecutarse, mientras que las conversaciones benignas pasan directamente.
- Monitorización de seguridad en tiempo real: integrado en un proxy de agente, Panther Read puede detectar intentos de manipulación o peticiones maliciosas camufladas en conversación ordinaria, activando alertas o bloqueos.
- Filtrado previo a análisis de seguridad profundo: en un stack como Patronus Protect, el clasificador decide qué tráfico merece un análisis exhaustivo (por ejemplo, detección de prompt injection) y cuál puede tomar una vía rápida, reduciendo latencia y coste computacional.
- Clasificación de peticiones en asistentes empresariales: un asistente virtual multilingüe puede usar el modelo para enrutar automáticamente peticiones de redacción de correos, generación de informes o consultas de bases de datos al módulo adecuado.
- Auditoría y análisis de logs de agentes: las etiquetas de intención generadas por el modelo pueden almacenarse para auditoría posterior, permitiendo identificar patrones de uso o intentos de abuso en sistemas de agentes desplegados en producción.

## Benchmarks y rendimiento

El modelo se evaluó sobre un conjunto de test reservado (n = 1.880 muestras, etiqueta única). Los resultados publicados en la model card son:

| Metrica | Valor |
|---|---|
| Accuracy | 0.898 |
| F1 (macro) | 0.899 |
| Precision (macro) | 0.902 |
| Recall (macro) | 0.897 |

Desglose por clase (F1):

| Clase | F1 |
|---|---|
| code_development_request | 0.919 |
| tool_operation_request | 0.918 |
| data_analytics_request | 0.894 |
| benign_conv | 0.889 |
| office_request | 0.876 |

No se han publicado comparaciones con otros clasificadores de intención en la información disponible.

## Requisitos de hardware

- El modelo tiene 140,6 millones de parámetros. En FP32, los pesos ocupan aproximadamente 562 MB; en FP16 (ONNX), unos 281 MB; en int8, unos 140 MB.
- Inferencia en GPU consumer: cabe en una RTX 3060 (12 GB) o superior con margen amplio. También puede ejecutarse en GPU de 4-8 GB si se usa cuantización int8.
- Inferencia en CPU: viable con ONNX Runtime o llama.cpp (aunque el formato principal es safetensors/ONNX, no GGUF), con latencia esperada de decenas de milisegundos por muestra en hardware moderno.
- Opciones de despliegue: `transformers` (pipeline de clasificación de texto), `optimum.onnxruntime` (ORTModelForSequenceClassification), ONNX Runtime directo para producción de baja latencia.
- Throughput estimado: no disponible en la documentación, pero por el tamaño del modelo y su arquitectura encoder, se espera un alto rendimiento en batch (cientos de inferencias por segundo en una GPU moderna).

## Comparativa con modelos similares

No se dispone de información suficiente sobre modelos comparables de la misma categoría (clasificadores de intención para agentes de IA). La model card menciona a Lion Warden, otro clasificador de seguridad de Patronus con una cabeza de enrutamiento, pero no se publican sus especificaciones ni métricas en esta documentación. Tampoco se han encontrado benchmarks comparativos con otros clasificadores de intención multilingües (por ejemplo, modelos basados en BERT o DistilBERT fine-tuned). Por tanto, la comparativa directa no está disponible.

## Limitaciones y advertencias

- Una predicción positiva describe una propiedad aparente de la entrada, no prueba que una acción se haya ejecutado realmente.
- El modelo no rastrea el flujo de información a través de múltiples pasos de un agente; solo clasifica solicitudes individuales.
- Aunque el backbone es multilingüe, solo alemán e inglés han sido validados activamente; otros idiomas pueden producir resultados menos fiables.
- Existe riesgo de falsos positivos y falsos negativos. Para decisiones de alto impacto, se recomienda combinar el modelo con políticas deterministas y umbrales calibrados.
- El modelo no es generativo: no puede producir respuestas ni razonar; su única función es la clasificación de intención.
- No se han publicado detalles sobre sesgos específicos, pero el entrenamiento con aumentaciones de ofuscación y regularizaciones de contrafactuales sugiere un esfuerzo por reducir dependencias superficiales; aun así, la evaluación en otros dominios o idiomas no está garantizada.

## Enlaces

- Modelo principal en HuggingFace: https://huggingface.co/patronus-studio/panther-read-intent-classifier
- Repositorio edge (cuantizaciones): https://huggingface.co/patronus-studio/panther-read-intent-classifier-edge
- Blog de Patronus sobre el zoo de modelos de seguridad open source: https://patronus.studio/posts/our-ai-security-model-zoo-is-now-open-source
- Blog en aleman: https://patronus.studio/de/posts/our-ai-security-model-zoo-is-now-open-source
- Articulo en Medium: https://medium.com/@PatronusProtect/our-ai-security-model-zoo-is-now-open-source-41654d5d7dc6
- Cita sugerida (bibtex) disponible en la model card del repositorio.
