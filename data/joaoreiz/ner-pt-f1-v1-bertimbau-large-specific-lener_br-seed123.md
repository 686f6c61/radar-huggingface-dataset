# JoaoReiz/ner-pt-f1-v1-bertimbau-large-specific-lener_br-seed123

## Resumen

El modelo `JoaoReiz/ner-pt-f1-v1-bertimbau-large-specific-lener_br-seed123` es un sistema de reconocimiento de entidades nombradas (NER) para portugués, desarrollado por JoaoReiz. Se trata de un fine-tuning del modelo BERTimbau large (`neuralmind/bert-large-portuguese-cased`) sobre el split `lener_br` del protocolo NEVE NER, con el modelo base congelado durante el entrenamiento. Este enfoque permite adaptar un modelo preentrenado robusto a la tarea específica de etiquetado de tokens, manteniendo los pesos del encoder intactos y entrenando únicamente la capa de clasificación.

El modelo resuelve el problema de extracción de entidades en textos en portugués, una tarea fundamental para el procesamiento de lenguaje natural en dominios como el legal, periodístico o empresarial. Su relevancia radica en que combina la potencia de BERTimbau large (333 millones de parámetros) con un entrenamiento específico para NER, ofreciendo una solución lista para usar en pipelines de token-classification. La arquitectura es un transformer encoder (BERT) con 24 capas, 1024 dimensiones ocultas y 16 cabezas de atención, aunque estos detalles no se especifican en la ficha del autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder) |
| Parametros totales | 333.360.141 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (típico de BERT: 512 tokens, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | pt (portugués) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `neuralmind/bert-large-portuguese-cased`, la variante large de BERTimbau, que fue preentrenada sobre el corpus BrWaC (Brazilian Web as Corpus) durante 1.000.000 de pasos con whole-word mask. El fine-tuning se realizó sobre el split `lener_br` del protocolo NEVE NER, con el modelo base congelado (frozen), es decir, solo se entrenaron las capas de clasificación superiores. Se utilizó la semilla 123 y la selección del mejor checkpoint se hizo según la métrica `validation_end_to_end_f1`. No se mencionan técnicas como RLHF o DPO; se trata de un entrenamiento supervisado estándar para clasificación de tokens.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en portugués, etiquetando tokens con categorías como personas, organizaciones, lugares, etc., según el esquema del dataset `lener_br`.
- Clasificación de tokens a nivel de secuencia, adecuada para pipelines de token-classification.
- No incluye generación de texto, tool calling, agentes, visión ni audio; es un modelo discriminativo exclusivo para NER.
- Multilingüismo limitado: solo portugués, probablemente con sesgo hacia el portugués brasileño por el corpus de entrenamiento.

## Casos de uso

- Extracción de entidades en documentos legales: el dataset `lener_br` está orientado a textos legales brasileños, por lo que el modelo puede identificar partes, organizaciones, jueces, fechas y otros elementos en sentencias o contratos.
- Procesamiento de noticias y artículos periodísticos: para extraer personas, lugares y organizaciones mencionadas, facilitando la indexación y búsqueda semántica.
- Análisis de redes sociales: detección de entidades en publicaciones de Twitter o Facebook para monitorización de marca o análisis de opinión.
- Enriquecimiento de bases de datos: alimentar sistemas CRM o ERP con entidades extraídas automáticamente de correos, chats o formularios.
- Preprocesamiento para sistemas de pregunta-respuesta o búsqueda: las entidades extraídas pueden usarse como filtros o metadatos en motores de búsqueda.
- Automatización de cumplimiento normativo: identificación de entidades en documentos para verificar requisitos legales o de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que la selección se basó en `validation_end_to_end_f1`, pero no se proporciona el valor numérico.

## Requisitos de hardware

- Estimación de VRAM: el modelo tiene 333 millones de parámetros; en FP32 ocupa aproximadamente 1,33 GB, en FP16 unos 0,67 GB. Para inferencia con activaciones, se recomienda al menos 4 GB de VRAM en GPU.
- GPUs recomendadas: cualquier GPU con 4 GB o más, como RTX 3050, RTX 3060, A10, etc. Para despliegue en producción, una T4 o A100 es suficiente.
- Compatible con CPU: puede ejecutarse en CPU con al menos 4 GB de RAM, aunque la latencia será mayor.
- Opciones de despliegue: al usar la librería `transformers`, se puede integrar con pipelines de Hugging Face, TGI (Text Generation Inference) para endpoints, o con frameworks como FastAPI para servicios REST. También es compatible con `endpoints_compatible` según los tags.
- Latencia y throughput: no disponibles, pero para un modelo de este tamaño se espera una inferencia de decenas de milisegundos en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| JoaoReiz/ner-pt-f1-v1-bertimbau-large-specific-lener_br-seed123 | 333M | no disponible | pt | no disponible | Fine-tuning específico para NER legal |
| JoaoReiz/ner-pt-f1-v1-bertimbau-base-specific-lener_br-seed123 | ~110M (estimado) | no disponible | pt | no disponible | Versión base del mismo autor |
| neuralmind/bert-large-portuguese-cased | 333M | 512 (típico) | pt | MIT (según GitHub) | Modelo base sin fine-tuning para NER |

No se dispone de comparativas con otros modelos NER como XLM-RoBERTa o mBERT, ni de métricas de rendimiento para una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia no disponible: esto puede impedir su uso en proyectos comerciales o de código cerrado, ya que no se conocen los términos de redistribución.
- Sesgo lingüístico: entrenado sobre BrWaC (corpus brasileño), puede tener un rendimiento inferior en portugués europeo o en variedades africanas.
- Contexto limitado: al ser BERT, la longitud máxima de entrada es típicamente 512 tokens, lo que limita el procesamiento de documentos largos.
- Riesgo de errores en entidades poco frecuentes o en dominios muy específicos fuera del corpus legal.
- No se proporcionan métricas de rendimiento ni validación externa, por lo que se recomienda evaluar el modelo en el propio dominio antes de producción.
- El autor no ofrece soporte ni documentación adicional más allá de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-bertimbau-large-specific-lener_br-seed123
- Versión base del mismo autor: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-bertimbau-base-specific-lener_br-seed123
- Modelo base BERTimbau large: https://huggingface.co/neuralmind/bert-large-portuguese-cased
- Repositorio GitHub de BERTimbau: https://github.com/neuralmind-ai/portuguese-bert
