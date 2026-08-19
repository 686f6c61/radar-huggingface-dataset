# JoaoReiz/ner-pt-f1-v1-bertimbau-large-specific-paramopama-seed42

## Resumen

El modelo `JoaoReiz/ner-pt-f1-v1-bertimbau-large-specific-paramopama-seed42` es un sistema de reconocimiento de entidades nombradas (NER) para portugués, desarrollado por JoaoReiz mediante fine-tuning del modelo BERTimbau large (`neuralmind/bert-large-portuguese-cased`) sobre el split `paramopama` del protocolo NEVE NER. Este split se mantiene congelado durante el entrenamiento, lo que permite evaluar la capacidad de generalización del modelo en datos no vistos durante el ajuste.

Con 333 millones de parámetros, se trata de un modelo denso de tipo Transformer encoder, especializado exclusivamente en la tarea de token classification. Su relevancia radica en ofrecer una alternativa de alta precisión para extracción de entidades en textos portugueses, aprovechando las representaciones contextuales de BERTimbau, que fue pre-entrenado sobre el corpus BrWaC. El modelo está disponible en formato safetensors y es compatible con la librería transformers, aunque su licencia no está especificada en la ficha del repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-large (Transformer encoder, 24 capas, 1024 dimensiones ocultas, 16 cabezas de atención) |
| Parametros totales | 333.356.041 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (pesos en FP32, safetensors) |
| Idiomas soportados | Portugués (pt) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en BERT-large cased, una arquitectura Transformer encoder de 24 capas con 1024 dimensiones ocultas y 16 cabezas de atención, pre-entrenada sobre el corpus BrWaC (Brazilian Web as Corpus) durante 1.000.000 de pasos con whole-word masking. Sobre esta base, se realizó un fine-tuning para la tarea de token classification utilizando el protocolo NEVE NER, concretamente sobre el split `paramopama`, que se mantiene congelado (frozen) durante el entrenamiento. La selección del mejor checkpoint se realizó mediante la métrica `validation_end_to_end_f1` con una semilla fija de 42.

No se dispone de información detallada sobre el número de épocas, tasa de aprendizaje, tamaño de lote o técnicas de regularización empleadas. Tampoco se indica si se usaron métodos como RLHF o DPO; al tratarse de un modelo de clasificación de tokens, no aplican dichas técnicas.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en portugués: identifica y clasifica entidades como personas, organizaciones, lugares, fechas, etc., a nivel de token.
- Clasificación de tokens (token classification) mediante la librería transformers, con pipeline `token-classification`.
- Procesamiento de textos en portugués de Brasil (dado el corpus de pre-entrenamiento BrWaC).
- Compatible con la API de Hugging Face para inferencia en endpoints (tag `endpoints_compatible`).

No se han documentado capacidades adicionales como tool calling, generación de texto, razonamiento multi-paso o soporte multilingüe más allá del portugués.

## Casos de uso

- Extracción de entidades en documentos legales portugueses: el modelo puede identificar nombres de personas, empresas, fechas y lugares en contratos o sentencias, facilitando la automatización de procesos de revisión documental.
- Análisis de noticias en portugués: permite extraer entidades de artículos periodísticos para construir bases de datos de eventos, personas y organizaciones relevantes.
- Procesamiento de registros médicos en portugués: identificación de medicamentos, enfermedades, dosis y datos de pacientes en historias clínicas, siempre que se disponga de un corpus etiquetado adecuado.
- Monitorización de redes sociales en portugués: detección de menciones a marcas, productos o personas en publicaciones de Twitter, Instagram o foros, para análisis de sentimiento o reputación.
- Construcción de grafos de conocimiento: extracción de entidades y relaciones a partir de textos técnicos o científicos en portugués para alimentar bases de conocimiento.
- Automatización de atención al cliente: clasificación de entidades en mensajes de soporte (nombres de productos, números de pedido, fechas) para enrutar consultas o extraer información estructurada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de F1, precisión o recall sobre conjuntos de prueba estándar como HAREM o MiniHAREM. Tampoco se aportan comparativas con otros modelos NER para portugués.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 333 millones de parámetros, lo que en FP32 ocupa aproximadamente 1,33 GB. Con una cuantización a 8 bits (si estuviera disponible) se reduciría a unos 0,33 GB. En FP32 cabe en GPUs con al menos 2 GB de VRAM, aunque se recomienda 4 GB para margen de cómputo.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 2060, RTX 3050) es suficiente para inferencia. Para entrenamiento o fine-tuning adicional, se recomienda una GPU con 8 GB o más (RTX 3070, RTX 4080, A100).
- Compatibilidad con hardware de consumo: sí, el modelo es ligero y puede ejecutarse en GPUs de gama media e incluso en CPU (con mayor latencia).
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con Hugging Face Inference Endpoints, TGI (Text Generation Inference), vLLM (aunque vLLM está orientado a generación, también soporta clasificación), o mediante la API de transformers en un servidor Python. También es posible exportar a ONNX para optimización.
- Latencia y throughput: no se dispone de datos concretos. En una GPU moderna (RTX 3090), la inferencia sobre un texto de 512 tokens debería completarse en menos de 100 ms, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No se dispone de información comparativa del autor. Sin embargo, se pueden mencionar alternativas conocidas para NER en portugués:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `JoaoReiz/ner-pt-f1-v1-bertimbau-large-specific-paramopama-seed42` | 333M | 512 | No disponible | Fine-tuning de BERTimbau large sobre NEVE NER |
| `JoaoReiz/ner-pt-f1-v1-bertimbau-base-specific-paramopama-seed42` | ~110M | 512 | No disponible | Versión base del mismo autor, misma metodología |
| `neuralmind/bert-large-portuguese-cased` | 335M | 512 | MIT (según repo original) | Modelo base pre-entrenado, sin fine-tuning para NER |
| `xlm-roberta-large` (multilingüe) | 560M | 512 | MIT | Puede adaptarse a NER en portugués, pero requiere fine-tuning propio |

La comparativa se basa en datos públicos de los repositorios. No se conocen métricas comparativas entre estos modelos en la tarea NER.

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no indica la licencia del modelo. Esto puede impedir su uso comercial sin autorización explícita del autor. Se recomienda contactar con JoaoReiz antes de utilizarlo en producción.
- Sesgos del corpus de pre-entrenamiento: BERTimbau fue entrenado sobre BrWaC, un corpus web brasileño, por lo que puede reflejar sesgos lingüísticos y culturales de Brasil, y su rendimiento puede degradarse en portugués europeo.
- Longitud de contexto limitada: el modelo solo acepta secuencias de hasta 512 tokens. Textos más largos deben truncarse o dividirse en fragmentos, lo que puede perder contexto y afectar a la precisión de las entidades.
- Especialización en NER: el modelo no es generativo ni soporta otras tareas. No puede utilizarse para responder preguntas, generar texto o realizar razonamiento.
- Riesgo de alucinación en entidades: aunque es un modelo discriminativo, puede clasificar incorrectamente tokens como entidades cuando el contexto es ambiguo. Se recomienda validar las salidas en dominios críticos.
- Sin datos de rendimiento publicados: al no existir benchmarks, no se puede garantizar su calidad frente a otros modelos NER para portugués.
- Descargas y uso limitados: el modelo tiene 0 descargas y 0 likes, lo que sugiere que no ha sido ampliamente evaluado por la comunidad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-bertimbau-large-specific-paramopama-seed42
- Versión base del mismo autor: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-bertimbau-base-specific-paramopama-seed42
- Modelo base BERTimbau large (neuralmind): https://huggingface.co/neuralmind/bert-large-portuguese-cased
- Documentación de BERTimbau (paper): https://www.scribd.com/document/838534726/bertimbau
- Repositorio GitHub de BERTimbau: https://github.com/ClaudioSS01/portuguese-Bertimbau
