# OpenMed/OpenMed-PII-Portuguese-FastClinical-Small-82M-v1-mlx

## Resumen

OpenMed-PII-Portuguese-FastClinical-Small-82M-v1-mlx es un modelo de clasificación de tokens (token classification) diseñado para detectar información personal identificable (PII) en notas clínicas en portugués. Lo desarrolla OpenMed, un proyecto centrado en IA sanitaria local-first, y esta variante concreta es un empaquetado en formato MLX para su ejecución en dispositivos Apple Silicon. El modelo resuelve el problema de la anonimización de historiales clínicos, un requisito legal y ético para compartir datos médicos con fines de investigación o secundarios, sin necesidad de enviar información sensible a la nube.

Con 82 millones de parámetros, se basa en la arquitectura RoBERTa (concretamente `RobertaForTokenClassification`). Su tamaño reducido lo hace adecuado para entornos con recursos limitados, como estaciones de trabajo locales o dispositivos periféricos. La relevancia actual radica en la creciente demanda de herramientas de de-identificación que cumplan normativas como la LGPD brasileña o la HIPAA estadounidense, y que puedan operar de forma privada y sin conexión. El modelo está disponible bajo licencia Apache-2.0, lo que facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (RobertaForTokenClassification) |
| Parametros totales | 82 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion declarada) |
| Idiomas soportados | Portugues (pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint base `OpenMed/OpenMed-PII-Portuguese-FastClinical-Small-82M-v1`, que a su vez se basa en la arquitectura RoBERTa. RoBERTa es un transformer encoder preentrenado con una estrategia de enmascaramiento robusta, optimizado para tareas de comprensión del lenguaje. En este caso, la cabeza de clasificación es de tipo token-level, lo que permite etiquetar cada token como parte de una entidad PII (por ejemplo, nombre, dirección, número de documento).

No se dispone de información detallada sobre el corpus de entrenamiento, el número de tokens procesados ni el proceso de ajuste (si se usó RLHF, DPO u otra técnica). El nombre "FastClinical" sugiere una optimización para inferencia rápida en entornos clínicos, pero no hay datos públicos que confirmen innovaciones técnicas específicas más allá del empaquetado MLX para Apple Silicon. El repositorio indica que el artefacto incluye `config.json`, `id2label.json` y pesos MLX, lo que facilita su carga con la librería OpenMed.

## Capacidades

- Detección de entidades PII en texto clínico en portugués: nombres de pacientes, direcciones, números de identificación, fechas, etc.
- Clasificación a nivel de token, con etiquetas predefinidas en `id2label.json`.
- Inferencia local en Apple Silicon mediante el backend MLX de OpenMed, sin necesidad de conexión a internet.
- Compatibilidad con el pipeline de token-classification de Hugging Face, lo que permite su uso con otras herramientas del ecosistema.
- Soporte de "smart merging" para agrupar tokens adyacentes en entidades completas (opción `use_smart_merging=True`).
- No incluye capacidades de generación de texto, tool calling, agentes ni razonamiento multi-paso; es un modelo puramente discriminativo para NER.

## Casos de uso

- Anonimización de historias clínicas para investigación: el modelo puede procesar notas clínicas en portugués y marcar automáticamente los campos PII, permitiendo compartir los datos con equipos de investigación sin violar la privacidad del paciente.
- Cumplimiento de la LGPD en Brasil: hospitales y clínicas pueden integrar el modelo en sus flujos de exportación de datos para garantizar que la información personal se elimine antes de cualquier transferencia a terceros.
- Preparación de conjuntos de datos para entrenamiento de modelos médicos: antes de usar datos clínicos reales para fine-tuning, se puede aplicar este modelo para limpiar los textos y eliminar identificadores.
- Auditoría de registros electrónicos de salud: el modelo puede ejecutarse de forma periódica sobre bases de datos clínicas para detectar fugas de PII en campos que deberían estar anonimizados.
- Despliegue en entornos con restricciones de red: al ser un modelo pequeño y ejecutable en local, es adecuado para hospitales que no permiten enviar datos a servicios en la nube.
- Aplicaciones móviles o de escritorio para profesionales sanitarios: gracias al formato MLX, puede integrarse en apps para macOS que procesen notas clínicas de forma offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de precisión, recall o F1 sobre conjuntos de prueba estándar como MMLU, HumanEval o GSM8K, ni métricas específicas de NER (p. ej., CoNLL). Tampoco se ofrecen comparativas con otros modelos de de-identificación.

## Requisitos de hardware

- Al ser un modelo de 82M parámetros, la inferencia es viable en CPU, aunque el empaquetado MLX está optimizado para Apple Silicon (M1, M2, M3 y superiores).
- VRAM estimada: no se especifica, pero un modelo de este tamaño en FP32 ocupa aproximadamente 330 MB; en FP16 o cuantizado, menos. Cabe en cualquier GPU consumer moderna (p. ej., RTX 3060 o superior) y en la memoria unificada de los Mac con Apple Silicon.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; en Apple Silicon, se recomienda usar el backend MLX.
- Opciones de despliegue: la librería OpenMed permite usar el modelo con backend MLX en Apple Silicon, o con backend PyTorch/Hugging Face en otros sistemas. También existe una variante ONNX para Android y WebAssembly (repo `-onnx-android`), lo que amplía las opciones de despliegue.
- Latencia y throughput: no se proporcionan datos medidos. Dado el tamaño, se espera una latencia de milisegundos por documento en hardware moderno, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (de-identificación de PII en portugués clínico) dentro de los datos proporcionados. No se puede establecer una comparativa fiable sin referencias adicionales.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para portugués; su uso en otros idiomas producirá resultados incorrectos.
- Al ser un modelo de NER, no genera texto y no puede razonar sobre el contexto más allá de la ventana de tokens; puede fallar en la detección de PII en formatos poco comunes o con errores tipográficos.
- No se han publicado métricas de rendimiento, por lo que no se puede garantizar su precisión en entornos clínicos reales. Se recomienda validar con un conjunto de datos propio antes de usarlo en producción.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantías; el usuario es responsable de verificar su idoneidad para cumplir normativas de protección de datos.
- El empaquetado MLX está pensado para Apple Silicon; en otros sistemas, se debe usar el checkpoint original en PyTorch, que puede requerir más recursos.
- No hay información sobre sesgos específicos, pero como todo modelo entrenado con datos clínicos, puede reflejar sesgos presentes en el corpus de entrenamiento (p. ej., sobrerrepresentación de ciertos grupos demográficos).

## Enlaces

- Repositorio HuggingFace del modelo MLX: https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-FastClinical-Small-82M-v1-mlx
- Checkpoint original (PyTorch): https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-FastClinical-Small-82M-v1
- Variante ONNX para Android/Web: https://huggingface.co/OpenMed/OpenMed-PII-Portuguese-FastClinical-Small-82M-v1-onnx-android
- Repositorio GitHub de OpenMed: https://github.com/maziyarpanahi/openmed
- Documentación del backend MLX: https://openmed.life/docs/mlx-backend/
- Documentación de OpenMedKit (Swift): https://openmed.life/docs/swift-openmedkit/
- Colección de modelos médicos MLX: https://huggingface.co/collections/OpenMed/medical-mlx-models
- Artículo de aichina.news sobre el modelo: https://aichina.news/blog/a-lightweight-portuguese-clinical-pii-tagger-that-runs-locally-on-c9d0co/
