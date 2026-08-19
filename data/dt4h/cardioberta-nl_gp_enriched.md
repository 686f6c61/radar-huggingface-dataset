# DT4H/CardioBERTa.nl_GP_enriched

## Resumen

CardioBERTa.nl_GP_enriched es un encoder de terminología biomédica en neerlandés desarrollado por el proyecto DataTools4Heart (DT4H) para normalización de conceptos clínicos y entity linking. Se inicializa desde el modelo UMCU/CardioBERTa.nl, un encoder de la familia CardioBERTa adaptado al dominio de la cardiología mediante entrenamiento continuado con masked language modeling sobre corpus biomédicos y cardiológicos en neerlandés. El modelo se especializa mediante aprendizaje métrico supervisado por conceptos UMLS (CUI), usando tripletas enriquecidas con relaciones ontológicas de nivel "abuelo" (grandparents) para mejorar la representación semántica de términos clínicos.

Con 125,98 millones de parámetros, el modelo está diseñado para generar embeddings normalizados de términos clínicos, lo que permite recuperar candidatos y mapear entidades a conceptos UMLS en pipelines de NLP clínico. Su relevancia actual radica en la necesidad de estandarizar la información de informes cardiológicos en entornos sanitarios europeos, donde la interoperabilidad semántica es crítica para la reutilización de datos de salud. El modelo se distribuye en formato safetensors y es compatible con la librería transformers y Text Embeddings Inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (encoder transformer) |
| Parametros totales | 125.978.112 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (se recomienda max_length 25 para entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | neerlandes (nl) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa, un encoder transformer bidireccional. El backbone CardioBERTa.nl fue adaptado al dominio cardiológico mediante entrenamiento continuado con MLM sobre corpus monolingües biomédicos y de cardiología en neerlandés. Sobre esta base, el modelo se especializó para normalización de conceptos clínicos usando tripletas CUI-supervisadas: pares de términos que comparten el mismo concepto UMLS (sinónimos), enriquecidos con relaciones ontológicas de nivel "padre" y "abuelo" (grandparents) para ampliar la cobertura semántica.

El entrenamiento utilizó Multi-Similarity Loss con minería de todas las tripletas (margin 0.2), pooling CLS, una época, batch size 256, learning rate 2e-5 y longitud máxima de 25 tokens. Se generaron 4.898.584 tripletas que cubren 476.972 CUIs y 543.296 términos normalizados únicos. La terminología de entrenamiento no se distribuye por restricciones de licencia de UMLS, solo se publican estadísticas agregadas.

## Capacidades

- Generacion de embeddings de terminologia clinica: produce representaciones vectoriales normalizadas (L2) de terminos y conceptos medicos en neerlandes.
- Normalizacion de conceptos y entity linking: mapea menciones textuales a conceptos UMLS (CUI) mediante recuperacion de candidatos por similitud coseno.
- Recuperacion de candidatos biomedicos: dado un termino de entrada, puede recuperar terminos relacionados de una base de conocimiento terminologica.
- Soporte para pipelines de NLP clinico: integrable como componente de embedding en sistemas de extraccion de informacion, codificacion automatica y estandarizacion de informes.
- Capacidad multilingue limitada: entrenado exclusivamente en neerlandes, aunque el backbone proviene de una familia multilingue (CardioBERTa cubre 7 idiomas).
- No es generativo: no genera texto libre, solo produce embeddings para tareas de recuperacion y clasificacion.

## Casos de uso

- Normalizacion de entidades en informes de cardiologia: el modelo puede convertir menciones como "acuut coronair syndroom" en el CUI UMLS correspondiente, facilitando la estandarizacion de historiales clinicos neerlandeses para su reutilizacion en investigacion.
- Codificacion automatica de diagnosticos y procedimientos: integrado en un pipeline de NLP, permite mapear terminologia clinica libre a codigos estandar (p. ej. SNOMED CT, ICD) mediante la recuperacion de conceptos UMLS.
- Enriquecimiento de ontologias y terminologias: puede sugerir sinonimos y relaciones jerarquicas adicionales para ampliar vocabularios controlados en neerlandes, usando la similitud de embeddings entre terminos.
- Busqueda semantica en registros medicos electronicos: permite consultar pacientes o documentos por concepto (p. ej. "hartfalen") en lugar de por palabras exactas, mejorando la precision de busquedas en corpus clinicos.
- Soporte a sistemas de alerta y monitorizacion: en entornos de investigacion, puede normalizar eventos adversos o hallazgos de imagen para alimentar sistemas de vigilancia epidemiologica.
- Preparacion de datos para modelos generativos: los embeddings generados pueden usarse como caracteristicas de entrada en modelos de clasificacion o para deduplicar conceptos en bases de datos clinicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (p. ej. accuracy en entity linking, recall@k) ni comparaciones con otros modelos de normalizacion de conceptos.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de ~126M parametros, la inferencia en FP32 requiere aproximadamente 0.5 GB de VRAM, y en FP16 alrededor de 0.25 GB. Cabe en cualquier GPU consumer moderna (p. ej. NVIDIA GTX 1060 6GB o superior).
- GPUs recomendadas: no se requieren GPUs de datacenter; cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia por lotes pequenos.
- Opciones de despliegue: compatible con transformers (Python), Text Embeddings Inference (TEI), y puede exportarse a ONNX o TensorRT para entornos de produccion.
- Latencia y throughput: no hay datos oficiales. Para un modelo de este tamano, la latencia tipica en CPU es de unos pocos milisegundos por secuencia corta (25 tokens); en GPU, throughput del orden de miles de secuencias por segundo en batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Uso principal |
|---|---|---|---|---|---|
| DT4H/CardioBERTa.nl_GP_enriched | 126M | no disponible | nl | no disponible | Normalizacion de conceptos clinicos (cardiologia) |
| SapBERT (base) | 110M | 512 | en | MIT | Entity linking biomedico (ingles) |
| BioBERT (base) | 110M | 512 | en | MIT | NLP biomedico general (ingles) |
| MedRoBERTa.nl | ~110M | 512 | nl | no disponible | NLP clinico neerlandes (no entity linking especifico) |

No se dispone de resultados comparativos publicados entre estos modelos. La principal diferencia de CardioBERTa.nl_GP_enriched es su especializacion en terminologia neerlandesa de cardiologia y su entrenamiento con tripletas enriquecidas por ontologia, mientras que SapBERT y BioBERT estan orientados a ingles y no cubren especificamente el dominio cardiaco.

## Limitaciones y advertencias

- Entrenado exclusivamente en neerlandes: no soporta otros idiomas, a pesar de que la familia CardioBERTa incluye variantes para otros 6 idiomas.
- No apto para decision clinica directa: la model card indica explicitamente que no debe usarse para toma de decisiones medicas; solo para tareas de NLP.
- Terminologia de entrenamiento no distribuida: los datos de tripletas contienen recursos sujetos a licencia UMLS, por lo que no se pueden reproducir ni inspeccionar los datos de entrenamiento.
- Licencia del modelo no especificada: no se indica la licencia en la model card, lo que genera incertidumbre sobre restricciones de uso comercial o modificacion.
- Longitud de contexto limitada: el entrenamiento uso max_length 25, por lo que el modelo no esta optimizado para secuencias largas; se recomienda truncar o segmentar textos.
- Riesgo de alucinacion en entity linking: aunque no genera texto, puede producir embeddings que mapeen a conceptos incorrectos si el termino de entrada es ambiguo o esta fuera del dominio.
- Sesgos potenciales: al entrenarse sobre corpus clinicos, puede reflejar sesgos presentes en los datos originales (p. ej. sobre-representacion de ciertas poblaciones o patologias).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DT4H/CardioBERTa.nl_GP_enriched
- Organizacion DT4H en Hugging Face: https://huggingface.co/datasets/DT4H/
- Proyecto DataTools4Heart: https://www.datatools4heart.eu/
- Repositorio GitHub de DT4H: https://github.com/DataTools4Heart/
- Coleccion CardioNER (familia CardioBERTa): https://huggingface.co/collections/DT4H/cardioner
- Referencia del paper (Danu et al., CardioLM): no disponible como URL directa; mencionado en la model card.
