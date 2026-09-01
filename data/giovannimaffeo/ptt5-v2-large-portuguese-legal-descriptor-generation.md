# giovannimaffeo/ptt5-v2-large-portuguese-legal-descriptor-generation

## Resumen

El modelo `giovannimaffeo/ptt5-v2-large-portuguese-legal-descriptor-generation` es un ajuste fino (fine-tuning) del modelo ptt5-v2-large, una variante de T5 preentrenada específicamente para el portugués, desarrollada por el grupo unicamp-dl. Este modelo concreto se ha especializado en la generación de descriptores legales a partir de documentos judiciales en portugués, como parte del trabajo académico "Automatic Legal Descriptor Generation for Portuguese Legal Documents". Su relevancia radica en automatizar una tarea tediosa y propensa a errores en el ámbito jurídico, permitiendo a profesionales del derecho y sistemas de gestión documental extraer resúmenes descriptivos de sentencias, autos y otros textos procesales.

Con 836 millones de parámetros, se sitúa en la gama "large" de la familia T5, con una arquitectura encoder-decoder que facilita tareas de transformación de texto. El modelo está disponible en formato safetensors y su repositorio ocupa 3,3 GB, lo que sugiere pesos en precisión FP32. Aunque no se especifica la licencia, el modelo base ptt5-v2-large se distribuye bajo la licencia de T5 (Apache 2.0), por lo que es probable que este ajuste herede condiciones similares, aunque no se puede confirmar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (encoder-decoder transformer) basado en ptt5-v2-large |
| Parametros totales | 836.365.312 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugués (pt) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura T5, un transformer encoder-decoder originalmente propuesto por Google. ptt5-v2-large, el checkpoint de partida, fue obtenido mediante un proceso de continuación de preentrenamiento sobre el T5-large original, utilizando corpus en portugués. Este preentrenamiento adicional permite adaptar las representaciones lingüísticas al portugués, mejorando el rendimiento en tareas downstream. El ajuste fino se realizó sobre el dataset `giovannimaffeo/portuguese-legal-descriptor-generation`, que contiene pares de documentos judiciales y sus descriptores legales asociados. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. La tarea se plantea como generación de texto a texto (text2text), donde la entrada es un documento judicial y la salida es un descriptor legal.

## Capacidades

- Generación de descriptores legales a partir de documentos judiciales en portugués, como sentencias, autos, acuerdos y otros textos procesales.
- Transformación de texto a texto (text2text), lo que permite adaptar la entrada y salida según el formato requerido.
- Comprensión del lenguaje jurídico portugués, gracias al preentrenamiento en corpus generales y al ajuste en dominios específicos.
- No se han documentado capacidades adicionales como tool calling, agentes, razonamiento multi-paso, visión o audio. El modelo está orientado exclusivamente a la tarea de generación de descriptores.

## Casos de uso

- Automatización de resúmenes de sentencias: el modelo puede recibir una sentencia judicial completa y generar un descriptor conciso que resuma los puntos clave, facilitando la indexación y búsqueda en bases de datos jurídicas.
- Asistencia a secretarios judiciales: integrado en un sistema de gestión de expedientes, puede generar automáticamente descriptores para cada nuevo documento, reduciendo la carga administrativa.
- Clasificación y organización de jurisprudencia: al generar descriptores consistentes, permite agrupar documentos por temas, tipos de delito o materia, mejorando la recuperación de información.
- Generación de metadatos para portales de transparencia: los descriptores generados pueden servir como metadatos en portales públicos de acceso a información judicial, facilitando la navegación a ciudadanos y profesionales.
- Preprocesamiento para análisis legal: los descriptores generados pueden utilizarse como entrada para otros sistemas de análisis, como clasificadores de sentencias o motores de búsqueda semántica.
- Entrenamiento de modelos más grandes: el modelo puede emplearse para generar datos sintéticos de descriptores, ampliando conjuntos de entrenamiento para otros sistemas de NLP jurídico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper de ptt5-v2 (arXiv:2406.10806) reporta resultados en tareas como assin2 STS, assin2 RTE y TweetSentBR para el modelo base, pero no hay métricas específicas para este ajuste fino en la tarea de generación de descriptores legales.

## Requisitos de hardware

- VRAM estimada para inferencia: con 836M parámetros, en FP32 se requieren aproximadamente 3,3 GB de memoria, en FP16 unos 1,7 GB y en int8 unos 0,8 GB. Para una inferencia cómoda con un batch pequeño, se recomienda al menos 4 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como una NVIDIA GTX 1650, RTX 3050 o superior. Para procesamiento por lotes o despliegue en producción, se recomienda una RTX 3090 o A100.
- Es posible ejecutar el modelo en GPUs de consumo (consumer) como la RTX 3060, RTX 4070, etc., siempre que se utilice una cuantización adecuada (por ejemplo, FP16 o int8).
- Opciones de despliegue: al ser un modelo T5, puede servirse con frameworks como Hugging Face Transformers, vLLM (si se convierte a un formato compatible), TGI (Text Generation Inference) o llama.cpp (aunque T5 no es el modelo típico para llama.cpp, se puede usar con ciertas adaptaciones). También es posible usar la API de Hugging Face Inference Endpoints.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, la generación de un descriptor de 50-100 tokens debería completarse en menos de un segundo, pero depende del hardware y la optimización.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos específicamente entrenados para generación de descriptores legales en portugués. Como referencia, se puede comparar con el modelo base ptt5-v2-large, que no está especializado en la tarea, y con otros T5 ajustados para dominios legales en otros idiomas (por ejemplo, Legal-T5 en inglés), pero no hay datos públicos de rendimiento comparativo. La siguiente tabla resume las diferencias principales con el modelo base:

| Modelo | Parámetros | Contexto | Especialización | Licencia |
|---|---|---|---|---|
| ptt5-v2-large (base) | ~836M | no disponible | Preentrenamiento general en portugués | Apache 2.0 (probable) |
| Este modelo (fine-tune) | 836M | no disponible | Descriptores legales en portugués | no disponible |
| T5-large original | 770M | 512 | Inglés general | Apache 2.0 |

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la generación de descriptores legales en portugués; su uso fuera de este dominio o idioma producirá resultados poco fiables.
- No se ha evaluado su comportamiento en documentos con formatos muy heterogéneos, jerga regional o casos extremos, por lo que puede generar descriptores incompletos o erróneos.
- Como todo modelo de lenguaje, existe riesgo de alucinación: puede generar descriptores que no se corresponden con el contenido real del documento.
- La licencia no está especificada en la ficha de HuggingFace, lo que genera incertidumbre sobre su uso comercial. Se recomienda contactar con el autor antes de utilizarlo en producción.
- El modelo no ha sido probado en tareas de razonamiento complejo, tool calling o interacción con agentes; su arquitectura T5 está pensada para transformación de texto, no para diálogo.
- No se han publicado análisis de sesgos, por lo que podría reflejar sesgos presentes en los documentos judiciales utilizados para el entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/giovannimaffeo/ptt5-v2-large-portuguese-legal-descriptor-generation
- Dataset de entrenamiento: https://huggingface.co/datasets/giovannimaffeo/portuguese-legal-descriptor-generation
- Paper de ptt5-v2: https://arxiv.org/abs/2406.10806
- Modelo base ptt5-v2-large: https://huggingface.co/unicamp-dl/ptt5-v2-large
