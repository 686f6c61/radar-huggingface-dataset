# DT4H/CardioBERTa.es_GP_translations_only

## Resumen

CardioBERTa.es_GP_translations_only es un codificador de terminología biomédica en español, especializado en normalización de conceptos clínicos y entity linking. Desarrollado por el proyecto DataTools4Heart (DT4H), se inicializa desde el modelo base CardioBERTa.es y se ajusta mediante tripletas supervisadas por CUIs (Concept Unique Identifiers de UMLS) con estrategia de abuelos (grandparents) y metric learning. El modelo resuelve el problema de mapear términos clínicos en español a conceptos UMLS normalizados, una tarea crítica en pipelines de procesamiento de lenguaje natural clínico y en la interoperabilidad de datos de salud.

Con 125,9 millones de parámetros y una arquitectura transformer basada en RoBERTa, este modelo está diseñado para generar embeddings de términos que permiten recuperar candidatos y vincular entidades en el dominio cardiológico. Su relevancia actual radica en que facilita la reutilización de datos clínicos multilingües en entornos federados, como los del proyecto DT4H, sin comprometer la privacidad de los pacientes. El contexto máximo de entrenamiento es de 25 tokens, lo que lo hace adecuado para términos y frases cortas, aunque el modelo base soporta secuencias más largas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa) con pooling CLS |
| Parametros totales | 125.978.112 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (entrenado con max_length 25; el backbone RoBERTa típicamente soporta 512) |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | Español (es) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la familia CardioBERTa, una suite de encoders monolingües desarrollada por CardioLM para el dominio de la cardiología. CardioBERTa.es, el backbone, fue preentrenado con Masked Language Modeling (MLM) sobre corpus biomédicos y cardiológicos en español. Sobre este backbone, el modelo aquí descrito se ajusta mediante un objetivo de Multi-Similarity Loss, utilizando tripletas de términos clínicos en español emparejadas por CUIs de UMLS. La estrategia "grandparents" enriquece las relaciones de sinonimia con relaciones ontológicas de nivel abuelo, generando 4.701.649 tripletas que cubren 476.968 CUIs y 530.009 términos únicos normalizados. El pooling se realiza sobre el token CLS y los embeddings se normalizan con norma L2. El entrenamiento se realizó durante una época con batch size 256, learning rate 2e-5 y una longitud máxima de 25 tokens.

La terminología de entrenamiento no se distribuye con el repositorio debido a restricciones de licencia de UMLS; solo se publican estadísticas agregadas.

## Capacidades

- Generación de embeddings de términos biomédicos en español, especialmente en cardiología y dominios clínicos relacionados.
- Normalización de conceptos clínicos: mapea términos libres a identificadores UMLS (CUIs) mediante similitud coseno.
- Entity linking: recuperación de candidatos de conceptos UMLS a partir de texto clínico.
- Búsqueda de similitud semántica entre términos y conceptos normalizados.
- Soporte para integración en pipelines de NLP clínico como módulo de representación de entidades.
- Compatible con la librería transformers y con text-embeddings-inference para despliegue en producción.
- Multilingüe limitado: solo español, aunque el backbone original cubre varios idiomas, este modelo está especializado únicamente en español.

## Casos de uso

- Normalización de diagnósticos y procedimientos en historias clínicas electrónicas: el modelo convierte términos libres en español a CUIs UMLS, facilitando la codificación estandarizada (p. ej., SNOMED-CT, ICD-10) en sistemas hospitalarios.
- Entity linking en publicaciones científicas cardiológicas: permite vincular menciones de enfermedades, fármacos o procedimientos en artículos a bases de datos ontológicas para construir grafos de conocimiento.
- Recuperación de información clínica: al generar embeddings de consultas y documentos, se pueden implementar sistemas de búsqueda semántica sobre repositorios de informes médicos.
- Enriquecimiento de datos federados: en el marco del proyecto DT4H, el modelo ayuda a armonizar vocabularios de diferentes hospitales sin transferir datos fuera de cada institución, gracias a su capacidad de representar términos de forma normalizada.
- Soporte a sistemas de decisión clínica (no directa): como componente de preprocesamiento para extraer entidades y normalizarlas antes de alimentar modelos de predicción o reglas clínicas.
- Anotación automática de corpus: el modelo puede asistir en la creación de datasets etiquetados con conceptos UMLS, reduciendo el esfuerzo manual de anotadores expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no reporta métricas como MMLU, HumanEval o GSM8K, dado que su naturaleza es de encoder para embeddings, no de generación. No hay datos comparativos con otros modelos de normalización de conceptos en español.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~126M parámetros, la inferencia en FP32 requiere aproximadamente 0,5 GB de VRAM (más overhead de activaciones). Con cuantización a 8 bits o 4 bits, se reduce a ~0,25 GB o menos.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Tarjetas consumer como GTX 1060, RTX 2060, RTX 3060 o superiores funcionan sin problemas. También puede ejecutarse en CPU con latencia aceptable para procesamiento por lotes.
- Compatibilidad con GPUs consumer: sí, cabe en cualquier GPU moderna de consumo.
- Opciones de despliegue: transformers (PyTorch), text-embeddings-inference (compatible con endpoints), y potencialmente ONNX o TensorRT para optimización. No se menciona soporte para llama.cpp o Ollama, dado que es un encoder, no un modelo generativo.
- Latencia y throughput estimados: no disponibles en la documentación. Para un modelo de este tamaño, la latencia típica por embedding en GPU es del orden de milisegundos (p. ej., <5 ms en RTX 3090), pero estos valores son estimaciones generales y no han sido publicados por el autor.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la documentación proporcionada. Existen otros modelos de entity linking biomédico como BioBERT o SapBERT, pero no se han publicado comparativas con este modelo. La falta de benchmarks y de datos de rendimiento impide establecer una comparación objetiva. Se recomienda evaluar el modelo en tareas específicas de normalización de conceptos en español antes de adoptarlo en producción.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado con terminología UMLS y corpus cardiológicos, puede presentar sesgos hacia el lenguaje clínico formal y no capturar variaciones coloquiales o dialectales del español.
- Riesgo de alucinación: al ser un encoder, no genera texto, por lo que no hay riesgo de alucinación en el sentido generativo. Sin embargo, los embeddings pueden producir falsos positivos en la recuperación de conceptos si los términos son muy similares semánticamente pero distintos en significado.
- Limitaciones de contexto: el entrenamiento se realizó con secuencias de hasta 25 tokens, lo que limita su uso a términos y frases cortas. Para textos largos, se requiere segmentación previa.
- Idioma: exclusivamente español; no soporta otros idiomas, aunque el backbone original sea multilingüe.
- Licencia: no disponible, lo que genera incertidumbre sobre restricciones de uso comercial. Se recomienda contactar con los autores para aclarar los términos.
- Terminología UMLS: la terminología de entrenamiento no se distribuye, pero el modelo puede producir embeddings que indirectamente reflejen información de UMLS; los usuarios deben verificar el cumplimiento de las licencias de UMLS en sus aplicaciones.
- Uso clínico: no está diseñado para decisiones clínicas directas; solo para tareas de procesamiento de lenguaje natural. No debe utilizarse como herramienta de diagnóstico o tratamiento.
- Datos de rendimiento: ausencia de benchmarks públicos, lo que dificulta evaluar su calidad frente a alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DT4H/CardioBERTa.es_GP_translations_only
- Modelo base CardioBERTa.es: https://huggingface.co/DT4H/CardioBERTa.es
- Organización DataTools4Heart en GitHub: https://github.com/DataTools4Heart/
- Proyecto DataTools4Heart (descripción general): https://www.escardio.org/news/press/press-releases/eu-project-combining-european-cardiology-data-in-different-formats-and-languages/
- Modelo NER cardiológico relacionado: https://huggingface.co/DT4H/cardio-ner-es-cardioberta-multilabel
