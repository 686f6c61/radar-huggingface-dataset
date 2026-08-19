# JoaoReiz/ner-pt-f1-v1-bertimbau-large-specific-paramopama-seed3407

## Resumen

El modelo `JoaoReiz/ner-pt-f1-v1-bertimbau-large-specific-paramopama-seed3407` es un sistema de reconocimiento de entidades nombradas (NER) para portugués, desarrollado por JoaoReiz mediante fine-tuning del modelo BERTimbau large (`neuralmind/bert-large-portuguese-cased`) sobre el split `paramopama` del protocolo NEVE. Se trata de un modelo de clasificación de tokens (token classification) que asigna etiquetas de entidades a cada token de un texto, permitiendo extraer nombres de personas, organizaciones, lugares y otras categorías definidas en el protocolo NEVE.

El modelo se ha entrenado congelando el backbone de BERTimbau (estrategia "frozen") y seleccionando el mejor checkpoint según la métrica `validation_end_to_end_f1`. Con 333 millones de parámetros, es una variante grande que ofrece mayor capacidad de representación que su versión base, manteniendo la arquitectura transformer encoder clásica de BERT. Su relevancia actual radica en la escasez de modelos NER específicos y publicados para portugués, especialmente aquellos con documentación abierta y pesos disponibles en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT large (Transformer encoder, 24 capas, 1024 dimensiones ocultas, 16 cabezas de atencion) |
| Parametros totales | 333.356.041 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (limite de BERT) |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors, sin versiones cuantizadas) |
| Idiomas soportados | Portugues (pt), principalmente variedad brasileña |
| Licencia | no disponible |
| Formato de pesos | safetensors (tambien compatible con Transformers) |

## Arquitectura y entrenamiento

El modelo se basa en BERTimbau large, una variante de BERT pre-entrenada sobre el corpus BrWaC (Brazilian Web as Corpus) con 1.000.000 de pasos y enmascaramiento de palabras completas (whole-word mask). La arquitectura es un transformer encoder estándar con 24 capas, 1024 dimensiones ocultas y 16 cabezas de atención, lo que le otorga una capacidad de representación considerable para tareas de comprensión del lenguaje.

El fine-tuning se realizó sobre el split `paramopama` del protocolo NEVE NER, congelando los pesos del modelo base (estrategia "frozen") y entrenando únicamente la cabeza de clasificación de tokens. El proceso utilizó la semilla 3407 y seleccionó el mejor modelo según la métrica `validation_end_to_end_f1`. No se dispone de información sobre el número de épocas, la tasa de aprendizaje ni el tamaño del dataset de entrenamiento, ya que no se incluyen en la model card ni en la documentación disponible.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en textos en portugués, mediante clasificación de tokens con etiquetas del protocolo NEVE (personas, organizaciones, lugares, fechas, etc.).
- Procesamiento de secuencias de hasta 512 tokens, adecuado para párrafos y documentos de extensión moderada.
- Inferencia directa con la librería Transformers de HuggingFace, usando el pipeline `token-classification`.
- Soporte para despliegue en entornos compatibles con Transformers (CPU, GPU, ONNX, etc.).
- No se documentan capacidades adicionales como generación de texto, tool calling, agentes o multimodalidad, ya que es un modelo exclusivamente discriminativo para NER.

## Casos de uso

- Extracción de entidades en documentos legales: el modelo puede identificar nombres de partes, jueces, fechas y lugares en sentencias o contratos en portugués, facilitando la automatización de procesos judiciales o de cumplimiento normativo.
- Análisis de noticias y redes sociales: permite extraer menciones a personas, organizaciones y localizaciones en artículos periodísticos o publicaciones, útil para monitorización de medios y estudios de opinión.
- Atención al cliente automatizada: al integrarse en un pipeline de clasificación de tokens, puede extraer nombres de productos, ciudades o nombres de clientes en conversaciones de soporte, mejorando el enrutamiento de tickets.
- Procesamiento de historiales clínicos: identificación de entidades médicas (medicamentos, enfermedades, hospitales) en textos clínicos en portugués, siempre que las etiquetas del protocolo NEVE cubran estas categorías.
- Construcción de bases de conocimiento: extracción de entidades de corpus empresariales o académicos para poblar grafos de conocimiento o sistemas de búsqueda semántica.
- Enriquecimiento de datos para otros modelos: el modelo puede servir como componente de preprocesado para sistemas de pregunta-respuesta o resumen, anotando entidades que luego se usan como características adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de rendimiento (F1, precisión, recall) sobre conjuntos de evaluación externos como el test de NEVE o datasets públicos de NER en portugués. Tampoco se ofrecen comparaciones con otros modelos NER.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 333 millones de parámetros. En precisión FP32, el checkpoint ocupa aproximadamente 1,3 GB en memoria, por lo que se necesitan al menos 2 GB de VRAM para inferencia básica. En FP16, el uso de memoria baja a unos 670 MB, permitiendo ejecución en GPUs con 2-4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) puede ejecutar el modelo en FP16. Para lotes grandes o despliegue concurrente, se recomienda una GPU con 8 GB o más (RTX 3070, A10, etc.).
- Compatibilidad con hardware de consumo: sí, cabe en GPUs de consumo medio, siempre que se use FP16 o cuantización dinámica.
- Opciones de despliegue: se puede servir con la librería Transformers, HuggingFace Inference Endpoints, o exportar a ONNX para optimización con TensorRT u otros runtime. No se mencionan adaptaciones específicas para vLLM, llama.cpp u Ollama, ya que es un modelo encoder y no un LLM generativo.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna (RTX 3090), la inferencia sobre secuencias de 512 tokens debería completarse en decenas de milisegundos, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JoaoReiz/ner-pt-f1-v1-bertimbau-large-specific-paramopama-seed3407 | 333M | 512 | NER fine-tuned sobre BERTimbau large | no disponible | HuggingFace |
| JoaoReiz/ner-pt-f1-v1-bertimbau-base-specific-paramopama-seed3407 | 109M (estimado) | 512 | NER fine-tuned sobre BERTimbau base | no disponible | HuggingFace |
| JoaoReiz/ner-pt-f1-v1-qwen35-4b-specific-paramopama-seed3407 | 4B (estimado) | no disponible | NER fine-tuned sobre Qwen3.5-4b | no disponible | HuggingFace |

No se dispone de resultados comparativos de rendimiento entre estos modelos. La variante large ofrece mayor capacidad que la base, pero también mayor coste computacional. El modelo basado en Qwen3.5-4b, al ser un LLM generativo, podría tener ventajas en contextos largos, pero no se aportan datos objetivos.

## Limitaciones y advertencias

- Licencia no disponible: el modelo no especifica una licencia, lo que genera incertidumbre legal para su uso comercial o redistribución. Se recomienda contactar al autor antes de utilizarlo en producción.
- Sesgos potenciales: el modelo base BERTimbau se entrenó sobre BrWaC, un corpus web brasileño, por lo que puede reflejar sesgos socioculturales de ese dominio. No se ha realizado una evaluación de sesgos específica.
- Riesgo de alucinación: al ser un modelo discriminativo (no generativo), no produce texto nuevo, pero puede asignar etiquetas incorrectas a tokens ambiguos o fuera del dominio de entrenamiento.
- Limitaciones de contexto: la ventana de 512 tokens restringe su uso a fragmentos cortos; para documentos largos es necesario segmentar el texto previamente.
- Cobertura de entidades: el modelo se ajustó al protocolo NEVE, cuyas categorías pueden no cubrir todos los tipos de entidades necesarios para casos de uso específicos.
- Sin garantías de rendimiento: al no publicarse benchmarks, no es posible validar su calidad frente a alternativas. Se recomienda evaluar el modelo en el dominio objetivo antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-bertimbau-large-specific-paramopama-seed3407
- Modelo base (BERTimbau large): https://huggingface.co/neuralmind/bert-large-portuguese-cased
- Variante base del mismo autor: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-bertimbau-base-specific-paramopama-seed3407
- Variante con Qwen3.5-4b: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-4b-specific-paramopama-seed3407
- Repositorio de BERTimbau (GitHub): https://github.com/ClaudioSS01/portuguese-Bertimbau
- Publicación de BERTimbau (referencia): https://ontosight.ai/publication/ieee-intelligent-systems-9045ace8909cd7bb08c120deafad29db00a41f2604de21f605dc1fdd
