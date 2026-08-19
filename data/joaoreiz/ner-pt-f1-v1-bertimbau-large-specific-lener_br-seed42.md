# JoaoReiz/ner-pt-f1-v1-bertimbau-large-specific-lener_br-seed42

## Resumen

El modelo `JoaoReiz/ner-pt-f1-v1-bertimbau-large-specific-lener_br-seed42` es un sistema de reconocimiento de entidades nombradas (NER) para portugués, obtenido mediante fine-tuning del modelo BERTimbau large (`neuralmind/bert-large-portuguese-cased`) sobre el subconjunto `lener_br` del protocolo NEVE NER. El autor, JoaoReiz, ha congelado los pesos del modelo base y ha entrenado únicamente la capa de clasificación de tokens, con semilla fija 42 y selección de checkpoint basada en F1 end-to-end sobre el conjunto de validación.

El modelo resuelve la tarea de etiquetado de entidades en textos en portugués, un problema recurrente en procesamiento de lenguaje natural para aplicaciones jurídicas, biomédicas y de análisis de documentos en Brasil y Portugal. Su relevancia radica en que parte de BERTimbau, uno de los modelos BERT preentrenados en portugués más utilizados, y lo adapta específicamente al dominio de textos legales brasileños (lener_br). Con 333 millones de parámetros y un tamaño de repositorio de 1,3 GB, se trata de la variante large, que ofrece mayor capacidad de representación que su homóloga base a costa de un mayor coste computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (Transformer encoder, variante large, cased) |
| Parametros totales | 333.360.141 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (límite estándar de BERT) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugués (pt) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT large cased, un encoder Transformer de 24 capas con 16 cabezas de atención y una dimensión oculta de 1024. El modelo base, BERTimbau large, fue preentrenado por NeuralMind sobre el corpus BrWaC (Brazilian Web as Corpus), un corpus de texto web brasileño de aproximadamente 2,7 mil millones de tokens, durante 1.000.000 de pasos con enmascaramiento de palabra completa (whole-word mask). La variante cased conserva la distinción entre mayúsculas y minúsculas, lo que resulta útil para el reconocimiento de entidades propias.

El fine-tuning se realizó sobre el subconjunto `lener_br` del protocolo NEVE NER, un conjunto de datos de dominio legal brasileño. El modelo base se mantuvo congelado (frozen) y solo se entrenó la cabeza de clasificación de tokens. El entrenamiento utilizó semilla 42 y la selección del mejor checkpoint se hizo mediante la métrica F1 end-to-end sobre el conjunto de validación. No se dispone de información sobre el número de épocas, tasa de aprendizaje ni otros hiperparámetros del fine-tuning.

## Capacidades

- Reconocimiento de entidades nombradas en portugués, con etiquetado token a token (token-classification).
- Especialización en textos legales brasileños gracias al entrenamiento sobre `lener_br`.
- Distinción de mayúsculas y minúsculas (modelo cased), relevante para identificar nombres propios y siglas jurídicas.
- Inferencia sobre secuencias de hasta 512 tokens, con posibilidad de aplicar ventanas deslizantes para textos más largos.
- Compatible con el ecosistema Hugging Face Transformers y con `endpoints_compatible`, lo que permite su despliegue en infraestructuras de inferencia estándar.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales: es exclusivamente un modelo discriminativo de clasificación de tokens.

## Casos de uso

- Análisis de documentos jurídicos: extracción de entidades como nombres de partes, tribunales, leyes y fechas en sentencias y contratos brasileños, facilitando la automatización de tareas de revisión legal.
- Indexación de jurisprudencia: etiquetado automático de decisiones judiciales para construir bases de datos consultables por entidad, mejorando la recuperación de información en portales jurídicos.
- Procesamiento de expedientes administrativos: identificación de personas, organizaciones y localizaciones en documentos gubernamentales para su clasificación y archivado.
- Enriquecimiento de datos para búsqueda semántica: anotación de entidades en corpus de texto en portugués para alimentar motores de búsqueda y sistemas de recomendación.
- Preparación de datos de entrenamiento: uso como etiquetador automático para generar datasets anotados que sirvan para entrenar modelos más ligeros o específicos.
- Sistemas de cumplimiento normativo: detección de entidades relevantes en contratos y políticas internas para verificar el cumplimiento de regulaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El nombre del repositorio indica que la selección del modelo se basó en la métrica F1 end-to-end sobre el conjunto de validación de `lener_br`, pero no se proporcionan los valores numéricos obtenidos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en precisión fp32 (tamaño de los pesos safetensors); con cuantización a fp16 o int8 podría reducirse a unos 650 MB y 350 MB respectivamente, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en fp32; tarjetas como NVIDIA T4, RTX 3060 o superiores son suficientes para inferencia en lotes pequeños.
- En CPU: viable para inferencia puntual con baja latencia aceptable, aunque el throughput será limitado.
- Opciones de despliegue: al ser un modelo de Transformers estándar, puede servirse con Hugging Face Inference Endpoints (el repositorio indica `endpoints_compatible`), así como con bibliotecas como PyTorch, ONNX Runtime o TensorRT si se exporta el modelo.
- Latencia estimada: para una secuencia de 512 tokens, la inferencia en GPU T4 debería completarse en decenas de milisegundos, aunque no se dispone de mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|---|
| JoaoReiz/ner-pt-f1-v1-bertimbau-large (este modelo) | BERT large cased | 333 M | 512 | no disponible | NER legal brasileño (lener_br) |
| JoaoReiz/ner-pt-f1-v1-bertimbau-base-specific-lener_br-seed42 | BERT base cased | 109 M | 512 | no disponible | NER legal brasileño (lener_br) |
| neuralmind/bert-large-portuguese-cased (base) | BERT large cased | 335 M | 512 | Creative Commons (modelo original) | Modelo generalista en portugués, sin fine-tuning |

La comparativa con el modelo base de la misma familia muestra que este fine-tuning añade la capacidad específica de NER legal sin modificar la arquitectura. La variante base del mismo autor ofrece una alternativa más ligera con menor coste de inferencia, aunque presumiblemente con menor precisión. No se dispone de información suficiente para comparar con otros modelos NER en portugués como XLM-RoBERTa o mBERT fine-tuned.

## Limitaciones y advertencias

- La licencia no está especificada en el repositorio, por lo que el uso comercial del modelo es legalmente incierto; se recomienda contactar con el autor antes de utilizarlo en producción.
- El modelo está entrenado exclusivamente sobre el dominio legal brasileño (`lener_br`), por lo que su rendimiento en otros dominios (médico, financiero, técnico) o en variantes de portugués europeo puede ser significativamente inferior.
- La longitud de contexto está limitada a 512 tokens, lo que obliga a segmentar documentos largos con ventanas deslizantes, con el consiguiente riesgo de perder entidades que crucen los límites de segmento.
- No se han publicado métricas de evaluación detalladas, lo que impide conocer su precisión real frente a alternativas.
- Al ser un modelo BERT discriminativo, no puede generar texto ni adaptarse a tareas generativas.
- El modelo fue congelado durante el fine-tuning, lo que significa que la capa de clasificación debe adaptarse a las representaciones del BERTimbau original; cualquier variación en el preprocesado (tokenización, mayúsculas) puede degradar el rendimiento.
- Riesgo de alucinación en el etiquetado: como todo modelo NER, puede etiquetar incorrectamente tokens ambiguos o fuera del vocabulario del dominio legal.

## Enlaces

- Repositorio del modelo: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-bertimbau-large-specific-lener_br-seed42
- Variante base del mismo autor: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-bertimbau-base-specific-lener_br-seed42
- Modelo base BERTimbau en Hugging Face: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Repositorio GitHub de BERTimbau: https://github.com/ClaudioSS01/portuguese-Bertimbau
- Documentación de BERTimbau en PORTULAN CLARIN: https://portulanclarin.net/repository/browse/bertimbau-portuguese-bert-large-language-model/901cc41ce93711ebbc0f02420a8701533d6c2809b7324b2386d5b397f168cf5a/
- README del proyecto BERTimbau en GitHub: https://github.com/lsg-academico/portuguese-bert_imbau/blob/master/README.md
