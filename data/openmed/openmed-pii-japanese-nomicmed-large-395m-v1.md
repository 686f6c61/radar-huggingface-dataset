# OpenMed/OpenMed-PII-Japanese-NomicMed-Large-395M-v1

## Resumen

OpenMed-PII-Japanese-NomicMed-Large-395M-v1 es un modelo de clasificación de tokens (token classification) desarrollado por OpenMed para la detección de información personal identificable (PII) y de salud protegida (PHI) en texto clínico en japonés. Se basa en el modelo `lightonai/modernbert-embed-large`, un transformer encoder de la familia ModernBERT, y ha sido ajustado específicamente para la tarea de reconocimiento de entidades nombradas (NER) aplicada a la desidentificación de datos sanitarios. Con aproximadamente 395 millones de parámetros, está diseñado para funcionar de forma local, sin necesidad de infraestructura en la nube, lo que lo hace relevante para entornos donde la privacidad del paciente es crítica.

El modelo se distribuye bajo licencia Apache-2.0 y está disponible en formato safetensors, con una variante ONNX adicional para despliegue en dispositivos móviles y web. Su pipeline principal es `token-classification`, y la model card indica que no se han publicado métricas de evaluación verificadas para japonés, por lo que se recomienda una evaluación exhaustiva antes de su uso en producción. Forma parte del ecosistema OpenMed, que incluye más de 2.000 modelos biomédicos y soporte para múltiples idiomas, con un enfoque en la inferencia 100% en el dispositivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (basado en ModernBERT embed large) |
| Parametros totales | 395.909.196 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (existe variante ONNX, posible cuantizacion no documentada) |
| Idiomas soportados | Japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (variante adicional) |

## Arquitectura y entrenamiento

El modelo se construye sobre `lightonai/modernbert-embed-large`, un transformer encoder de la familia ModernBERT, que emplea una arquitectura de atención estándar optimizada para eficiencia en tareas de representación de texto. No se dispone de información detallada sobre el proceso de entrenamiento específico de este checkpoint: no se documentan el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. Dado que se trata de un ajuste fino (fine-tuning) de un modelo base de embeddings, se asume que el entrenamiento se realizó sobre datos clínicos japoneses con anotaciones de PII/PHI, aunque no se especifica la fuente ni el volumen.

La innovación principal reside en su aplicación: un modelo compacto (395M) capaz de detectar entidades PII/PHI en japonés, con soporte para inferencia local en dispositivos con recursos limitados. El repositorio ONNX asociado indica que se ha optimizado para ejecución en Android, WebAssembly y WebGPU, lo que sugiere un diseño orientado a la privacidad por diseño, sin envío de datos a servidores externos.

## Capacidades

- Detección de entidades PII/PHI en texto clínico japonés mediante token classification (NER).
- Identificación de identificadores directos como nombres, direcciones de correo electrónico, números de teléfono y otros datos personales.
- Soporte para agregación de entidades con la estrategia `simple` en el pipeline de Transformers, que agrupa tokens contiguos en entidades completas.
- Preservación de offsets de caracteres para tareas de redacción o reemplazo de información sensible.
- Compatible con la librería Transformers de HuggingFace, lo que facilita su integración en pipelines existentes.
- Disponible en formato ONNX para despliegue en entornos sin Python (Android, navegadores web).

## Casos de uso

- Anonimización de historias clínicas electrónicas: el modelo puede procesar notas médicas en japonés y marcar automáticamente los segmentos que contienen PII/PHI, permitiendo su redacción antes de compartir datos para investigación o auditoría.
- Cumplimiento normativo de privacidad: integrado en sistemas de gestión de datos sanitarios, ayuda a identificar y eliminar información personal antes de la transferencia a terceros, reduciendo el riesgo de violaciones de datos.
- Preparación de conjuntos de datos para entrenamiento de modelos médicos: al desidentificar textos clínicos, facilita la creación de corpus anonimizados que pueden utilizarse para entrenar otros modelos sin comprometer la privacidad de los pacientes.
- Despliegue en dispositivos móviles para uso clínico: gracias a la variante ONNX, el modelo puede ejecutarse en smartphones o tablets, permitiendo a profesionales sanitarios verificar la presencia de PII en notas capturadas en el punto de atención sin conexión a internet.
- Filtrado de información en logs y registros de sistemas: puede aplicarse a archivos de registro generados por aplicaciones médicas para detectar y eliminar datos personales antes de su almacenamiento o análisis.
- Revisión de documentos clínicos exportados: antes de compartir informes o resúmenes de pacientes con fines educativos o de publicación, el modelo puede señalar automáticamente los campos que requieren revisión manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no existe un artefacto de evaluación verificado para japonés, por lo que no se reportan puntuaciones de precisión, recall o F1. Se recomienda evaluar el modelo en datos representativos del dominio objetivo antes de su implementación.

## Requisitos de hardware

- El modelo tiene 395M parámetros, lo que en precisión fp32 ocupa aproximadamente 1,6 GB (tamaño del repositorio). En fp16 ocuparía unos 800 MB, y en cuantización de 8 bits alrededor de 400 MB, aunque no se documentan oficialmente estas variantes.
- Puede ejecutarse en CPU sin problemas para inferencia por lotes pequeños, dado su tamaño moderado.
- Es compatible con GPUs de consumo como RTX 3060 o superiores, aunque no se requieren GPUs de gama alta.
- La variante ONNX está optimizada para dispositivos móviles (Android) y navegadores web (WebAssembly/WebGPU), lo que indica que puede funcionar en hardware muy limitado.
- Opciones de despliegue: librería Transformers de HuggingFace, ONNX Runtime, y potencialmente vLLM o TGI (aunque al ser un encoder, es más común usar pipelines de Transformers o servicios de inferencia especializados).
- No se dispone de datos de latencia o throughput específicos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El ecosistema OpenMed incluye otros modelos de detección de PII para distintos idiomas, pero no se detallan sus características ni rendimiento. Se sugiere consultar el repositorio de OpenMed para obtener una lista completa de alternativas.

## Limitaciones y advertencias

- La model card advierte que el modelo puede omitir identificadores o sobredimensionar la redacción de contexto clínicamente útil, lo que podría afectar a la calidad de los datos procesados.
- No constituye una garantía de anonimización, una determinación de cumplimiento normativo ni un dispositivo médico. Su uso en flujos de alta sensibilidad requiere defensa en profundidad y revisión humana.
- No se han publicado métricas de evaluación verificadas para japonés, por lo que el rendimiento real en datos clínicos reales es desconocido.
- El modelo está entrenado específicamente para japonés; su uso en otros idiomas no está soportado.
- La licencia Apache-2.0 permite uso comercial, pero se debe tener en cuenta que el modelo base (ModernBERT) también es de código abierto, por lo que no hay restricciones adicionales conocidas.
- No se recomienda incluir información real de pacientes en ejemplos públicos, logs o informes de incidencias, según las indicaciones de la model card.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/OpenMed/OpenMed-PII-Japanese-NomicMed-Large-395M-v1)
- [Variante ONNX para Android](https://huggingface.co/OpenMed/OpenMed-PII-Japanese-NomicMed-Large-395M-v1-onnx-android)
- [Repositorio GitHub de OpenMed](https://github.com/maziyarpanahi/openmed)
- [Sitio web de OpenMed](https://openmed.life/)
- [Documentación de idiomas soportados](https://github.com/maziyarpanahi/openmed/blob/master/docs/languages.md)
- [Paper relacionado (arXiv:2508.01630)](https://arxiv.org/abs/2508.01630)
