# rasoultilburg/SocioCausaNet

## Resumen

SocioCausaNet es un modelo de extracción de relaciones causales desarrollado por Rasoul Norouzi (rasoultilburg) en el marco del proyecto JointLearning. Se trata de un fine-tuning de `google-bert/bert-base-uncased` que aborda de forma conjunta tres tareas de procesamiento de lenguaje natural: clasificación de causalidad a nivel de oración, extracción de spans de causa y efecto mediante etiquetado BIO, y extracción de relaciones tipadas entre los spans identificados. El modelo está diseñado para ser cargado con la librería transformers de Hugging Face, aunque requiere `trust_remote_code=True` por su implementación personalizada.

Con 112 millones de parámetros y un tamaño de repositorio de 0,4 GB, SocioCausaNet se posiciona como una herramienta ligera y especializada para el análisis causal de texto en inglés. Su relevancia actual radica en la creciente demanda de sistemas capaces de estructurar automáticamente la información causal contenida en dominios como la literatura científica, las noticias o los informes corporativos. El modelo integra la clasificación, la extracción de spans y la vinculación de relaciones en un único paso de inferencia, lo que reduce la complejidad de pipelines tradicionales que requieren componentes separados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (12 capas, 768 dimensiones ocultas, 12 cabezas de atención) |
| Parametros totales | 112.144.907 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de BERT base, típicamente 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | GPL-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SocioCausaNet se basa en la arquitectura transformer de BERT base, concretamente en la versión `uncased` (todo en minúsculas). Sobre esta base, el autor añade tres cabezas de salida que se entrenan de manera conjunta: una cabeza de clasificación binaria para detectar si una oración contiene una afirmación causal, una cabeza de etiquetado de secuencia (BIO) para identificar los spans de causa, efecto y causa-efecto combinado, y una cabeza de clasificación de relaciones que determina el tipo de vínculo entre los pares causa-efecto. El entrenamiento se realiza mediante fine-tuning multi-tarea sobre el modelo preentrenado, aunque no se han publicado detalles específicos sobre el conjunto de datos, el número de tokens de entrenamiento ni el uso de técnicas como RLHF o DPO. La implementación incluye lógica personalizada en el método `predict()`, que permite elegir entre modos de relación automáticos o basados exclusivamente en red neuronal, así como umbrales de confianza configurables.

## Capacidades

- Clasificación de causalidad a nivel de oración: determina si un texto contiene una relación causa-efecto explícita.
- Extracción de spans mediante etiquetado BIO: identifica los segmentos exactos correspondientes a causa, efecto y causa-efecto combinado.
- Extracción de relaciones tipadas: establece vínculos entre los spans identificados, con tipos como `Rel_CE` (relación causa-efecto).
- Modo de relación automático (`rel_mode='auto'`): aplica reglas heurísticas para casos simples y recurre a una red neuronal para casos complejos con múltiples causas y efectos.
- Modo de relación neuronal exclusivo (`rel_mode='neural_only'`): valida todas las combinaciones potenciales de causa-efecto mediante una red neuronal, más exhaustivo pero más lento.
- Control de umbral de confianza (`rel_threshold`): permite ajustar el equilibrio entre precisión y recall en la detección de relaciones.
- Criterios de decisión configurables (`cause_decision`): combina la clasificación global (`cls_only`), la presencia de spans (`span_only`) o ambos (`cls+span`) para decidir si una oración es causal.
- No incluye capacidades de generación de texto, tool calling, agentes, visión ni audio.

## Casos de uso

- Análisis de literatura científica: extraer automáticamente las relaciones causales entre variables en artículos de investigación, facilitando la construcción de bases de conocimiento y revisiones sistemáticas. El modelo identifica los spans de causa y efecto y los vincula, lo que permite resumir hallazgos de múltiples publicaciones.
- Monitorización de noticias y redes sociales: detectar afirmaciones causales en titulares o publicaciones para rastrear cómo se difunden teorías, atribuciones de responsabilidad o explicaciones de eventos. Su capacidad de clasificación a nivel de oración permite filtrar contenido relevante de forma rápida.
- Análisis de informes corporativos y financieros: extraer relaciones causales en memorias anuales, comunicados de prensa o informes de sostenibilidad, por ejemplo, identificar qué factores contribuyen a cambios en los resultados financieros. El modo `rel_mode='auto'` agiliza el procesamiento de documentos extensos.
- Investigación en ciencias sociales: procesar encuestas abiertas, entrevistas o textos cualitativos para identificar patrones causales percibidos por los participantes. El parámetro `cause_decision='cls+span'` garantiza que solo se reporten oraciones con evidencia textual explícita.
- Sistemas de extracción de conocimiento para dominios específicos: integrar SocioCausaNet en pipelines de construcción de grafos de conocimiento donde las relaciones causales son un tipo de arista fundamental. Su salida estructurada en JSON facilita la alimentación directa de bases de datos gráficas.
- Verificación de hechos y análisis de argumentación: detectar afirmaciones causales en discursos políticos o debates para analizar la estructura argumentativa. El modelo puede señalar qué causas se atribuyen a qué efectos, ayudando a identificar falacias o sobre-simplificaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de Hugging Face no incluye métricas de evaluación como F1, precisión o recall sobre conjuntos de datos estándar (p. ej., SemEval, EventStoryLine). Tampoco se han encontrado comparaciones cuantitativas con otros modelos de extracción causal en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo BERT base con 112 millones de parámetros, en FP32 ocupa aproximadamente 450 MB. Con una cuantización a FP16 se reduce a unos 225 MB. La inferencia por lote puede requerir entre 2 y 4 GB de VRAM dependiendo del tamaño del batch y la longitud de las secuencias.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente, como NVIDIA GTX 1650, RTX 3060 o superiores. En entornos de producción, una T4 o V100 ofrece un buen equilibrio entre coste y rendimiento.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama media como RTX 3060 o RTX 4060. También puede ejecutarse en CPU, aunque con mayor latencia (típicamente 50-100 ms por oración en un procesador moderno).
- Opciones de despliegue: se puede servir mediante la librería transformers de Hugging Face, con `trust_remote_code=True`. También es posible exportar a ONNX para inferencia optimizada en CPU o GPU. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que estos están orientados a modelos generativos.
- Latencia y throughput estimados: en una GPU T4, la inferencia para una oración de hasta 128 tokens suele completarse en menos de 10 ms. En CPU (8 núcleos), la latencia puede rondar los 100-200 ms por oración.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicamente diseñados para extracción causal conjunta con las mismas características. Como referencia, se puede comparar con el propio BERT base fine-tuneado para tareas de clasificación de secuencias, pero no existe una alternativa directa en el ecosistema de Hugging Face con la misma combinación de tareas. Se recomienda consultar el repositorio GitHub del autor para posibles comparaciones con otros enfoques de extracción causal.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de BERT base uncased, el modelo hereda los sesgos presentes en los datos de preentrenamiento de BERT, que pueden incluir estereotipos de género, raza o contexto cultural.
- Riesgo de alucinación: aunque no es un modelo generativo, puede producir falsos positivos en la detección de relaciones causales, especialmente en oraciones con lenguaje ambiguo o metafórico. El umbral de confianza (`rel_threshold`) permite mitigar este riesgo, pero no eliminarlo.
- Limitaciones de contexto: la longitud máxima de secuencia está limitada por la arquitectura BERT (típicamente 512 tokens). Para textos más largos, es necesario segmentar previamente el contenido, lo que puede romper relaciones causales que cruzan fronteras de segmento.
- Limitaciones de idioma: el modelo solo está entrenado para inglés. No soporta otros idiomas, y su uso en textos multilingües o traducidos puede producir resultados incorrectos.
- Restricciones de licencia: la licencia GPL-2.0 es copyleft, lo que implica que cualquier obra derivada o distribución del modelo debe publicarse bajo la misma licencia. Esto puede ser incompatible con aplicaciones comerciales propietarias o con integraciones en sistemas cerrados.
- Dependencia de código personalizado: el modelo requiere `trust_remote_code=True` en Hugging Face, lo que implica ejecutar código arbitrario del autor. Es recomendable auditar el código antes de usarlo en entornos de producción.
- Documentación limitada: no se han publicado detalles sobre el conjunto de datos de entrenamiento, la metodología de evaluación ni los hiperparámetros utilizados, lo que dificulta la reproducibilidad y la evaluación de su rendimiento real.

## Enlaces

- Hugging Face: https://huggingface.co/rasoultilburg/SocioCausaNet
- Página del proyecto: https://rasoulnorouzi.github.io/projects/sociocausenet/
- Repositorio GitHub: https://github.com/rasoulnorouzi/JointLearning
- Perfil del autor: https://rasoulnorouzi.github.io/
