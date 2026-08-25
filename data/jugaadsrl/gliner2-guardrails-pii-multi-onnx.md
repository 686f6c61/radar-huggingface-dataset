# jugaadsrl/GLiNER2-Guardrails-PII-Multi-onnx

## Resumen

GLiNER2-Guardrails-PII-Multi-onnx es una conversión a formato ONNX del modelo de extracción de entidades y moderación de contenido `fastino/GLiNER2-Guardrails-PII-Multi`, publicada por Jugaad s.r.l. para permitir su ejecución sin dependencias de Python en entornos de producción. El modelo combina dos capacidades en un único checkpoint: detección de información personal identificable (PII) para tareas de pseudonimización y redacción, y moderación de seguridad (guardrails) para filtrar prompts y respuestas de modelos de lenguaje, incluyendo detección de jailbreak y clasificación de toxicidad.

El modelo utiliza la arquitectura de extracción de spans de GLiNER2, que no puede exportarse como un único grafo ONNX, por lo que se distribuye como un pipeline de ocho fragmentos orquestados por el host. Está disponible en tres variantes de precisión (FP32, FP16 y FP16 con IOBinding) y soporta siete idiomas europeos. Jugaad lo utiliza en producción en sus herramientas Edito y Omissis para pseudonimización de documentos conforme al RGPD.

La relevancia de este modelo radica en que ofrece una solución ligera y de código abierto (licencia Apache 2.0) para dos problemas críticos en el despliegue de sistemas de IA: la protección de datos personales y la moderación de contenido, sin necesidad de recurrir a APIs propietarias ni a modelos de gran tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER2 span extraction (encoder transformer de 768 dimensiones, pipeline de 8 fragmentos ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32, FP16 (con y sin IOBinding) |
| Idiomas soportados | en, fr, es, de, it, pt, nl |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (8 fragmentos: encoder, token_gather, schema_gather, span_rep, count_lstm_fixed, count_pred_argmax, classifier, scorer) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de extracción de spans de GLiNER2, que procesa un texto y un conjunto variable de tareas de esquema (etiquetas de entidades o tareas de clasificación) para predecir entidades con sus límites de caracteres. El encoder produce representaciones de 768 dimensiones por token, y los módulos subsiguientes (span_rep, count_lstm_fixed, scorer) generan puntuaciones de entidad para spans de hasta 8 palabras y hasta 20 ocurrencias por tarea. La exportación ONNX divide el grafo en ocho fragmentos que se ejecutan de forma encadenada, manteniendo los tensores en memoria de dispositivo cuando se usa IOBinding.

El entrenamiento se realizó sobre datos sintéticos, combinando las capacidades de los modelos predecesores GLiGuard (moderación de seguridad) y GLiNER2-PII (detección de información personal). No se han publicado detalles sobre el número de tokens de entrenamiento ni sobre el uso de técnicas como RLHF o DPO. Los papers asociados (arXiv 2605.09973 y 2605.07982) documentan el diseño de las tareas de PII y moderación, así como los umbrales por tarea que el modelo espera.

## Capacidades

- Extracción de entidades nombradas (NER) sobre texto libre, con etiquetas personalizables definidas en tiempo de inferencia (zero-shot span extraction).
- Detección de información personal identificable (PII): personas, correos electrónicos, números de teléfono, ubicaciones, entre otros.
- Redacción y pseudonimización de documentos: el modelo devuelve los spans detectados con sus posiciones de caracteres, lo que permite sustituir o eliminar los datos sensibles.
- Moderación de contenido (guardrails): clasificación de prompts y respuestas según una política de seguridad extensa, similar a la de QwenGuard.
- Detección de intentos de jailbreak en entradas de usuario.
- Clasificación de toxicidad en texto.
- Soporte multilingüe para siete idiomas europeos (inglés, francés, español, alemán, italiano, portugués y neerlandés).
- Ejecución sin Python mediante el motor Rust `gliner2-rs`, con verificación de paridad frente a PyTorch.

## Casos de uso

- Pseudonimización de documentos conforme al RGPD: el modelo identifica y localiza PII en contratos, informes médicos o expedientes, permitiendo su sustitución automática antes de compartir o archivar documentos. Jugaad lo usa en producción en sus herramientas Edito y Omissis.
- Moderación de prompts en aplicaciones de chat: antes de enviar la entrada del usuario a un LLM, el modelo clasifica si el prompt contiene intentos de jailbreak, toxicidad o contenido prohibido, bloqueando la petición si supera los umbrales configurados.
- Filtrado de respuestas generadas por LLM: tras la generación, el modelo revisa la salida para detectar PII no deseada o contenido peligroso antes de mostrarla al usuario final.
- Redacción de logs y trazas de depuración: en entornos de desarrollo, el modelo puede procesar archivos de log para eliminar direcciones de correo, números de teléfono o nombres de personas antes de enviarlos a servicios externos de análisis.
- Anonimización de datasets para entrenamiento: al preparar corpus de texto que contengan datos personales, el modelo permite localizar y enmascarar las entidades sensibles de forma automática, reduciendo el riesgo de fuga de información.
- Guardrail en pipelines de agentes autónomos: cuando un agente de IA ejecuta múltiples pasos, el modelo puede interponerse en cada paso para verificar que las acciones propuestas no revelan información personal ni violan políticas de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta la paridad numérica entre los fragmentos ONNX y sus equivalentes en PyTorch, con tolerancias relativas que van desde 0 (exacto) hasta 5.5e-03 en el fragmento `scorer` en FP16. No hay datos de precisión en tareas estándar como MMLU, HumanEval o GSM8K, dado que el modelo no está diseñado para generación de texto sino para clasificación de spans.

## Requisitos de hardware

- Tamaño de pesos: aproximadamente 620 MB en FP16 y 1.2 GB en FP32 (conjunto completo de fragmentos).
- VRAM estimada para inferencia: entre 1 y 2 GB en FP16, dependiendo de la longitud del texto y del número de tareas de esquema. En FP32, entre 2 y 3 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente. También puede ejecutarse en CPU con OpenVINO o ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (CUDA, ROCm, CPU), CoreML (en macOS), QNN (en dispositivos Qualcomm), y el motor Rust `gliner2-rs` que orquesta los fragmentos.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño del encoder (768 dimensiones), se espera una latencia de decenas de milisegundos por documento corto en GPU moderna, pero estos valores dependen del hardware y de la configuración.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros modelos en la información proporcionada. El modelo comparte arquitectura con GLiNER2 base, pero está especializado en PII y moderación. Alternativas en el mismo espacio serían GLiGuard (predecesor directo), QwenGuard (para moderación) o modelos NER clásicos como spaCy, pero no se han publicado métricas comparativas en la documentación disponible.

## Limitaciones y advertencias

- El modelo fue entrenado con datos sintéticos, por lo que su rendimiento en textos reales con jerga específica o formatos inusuales puede degradarse.
- No se especifica la longitud máxima de contexto soportada; el encoder de 768 dimensiones sugiere un límite similar al de BERT-base (512 tokens), pero no está confirmado.
- La detección de PII puede fallar en casos de entidades ambiguas o en idiomas no cubiertos (solo siete idiomas europeos).
- El pipeline ONNX requiere un orquestador (el motor Rust o un script propio) para encadenar los ocho fragmentos; no es un modelo autocontenido de un solo grafo.
- La clasificación de toxicidad y jailbreak depende de los umbrales configurados; umbrales incorrectos pueden producir falsos positivos o negativos.
- La licencia Apache 2.0 permite uso comercial, pero el usuario es responsable de verificar el cumplimiento del RGPD al usar el modelo para pseudonimización.
- No se han publicado benchmarks independientes que validen su eficacia frente a alternativas comerciales o de código abierto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jugaadsrl/GLiNER2-Guardrails-PII-Multi-onnx
- Modelo base (PyTorch): https://huggingface.co/fastino/GLiNER2-Guardrails-PII-Multi
- Motor Rust y exportador: https://github.com/dariofinardi/gliner2-rs
- Paper GLiNER2-PII: https://arxiv.org/abs/2605.09973
- Paper GLiGuard: https://arxiv.org/abs/2605.07982
- Blog de Fastino sobre el modelo: https://fastino.ai/blog/gliner2-guardrails-pii-multi-safety-moderation-privacy-filtering-small-language-model
- Repositorio GitHub del checkpoint: https://github.com/dariofinardi/gliner2-guardrails-PII-Multi-onnx
