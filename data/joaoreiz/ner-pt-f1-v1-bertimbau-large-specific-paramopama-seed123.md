# JoaoReiz/ner-pt-f1-v1-bertimbau-large-specific-paramopama-seed123

## Resumen

El modelo `JoaoReiz/ner-pt-f1-v1-bertimbau-large-specific-paramopama-seed123` es un sistema de reconocimiento de entidades nombradas (NER) para portugués, desarrollado por JoaoReiz. Se trata de un fine-tuning del modelo BERTimbau large (`neuralmind/bert-large-portuguese-cased`) sobre el split `paramopama` del protocolo NEVE NER, un conjunto de datos diseñado para evaluar el rendimiento de modelos NER en portugués. El modelo está entrenado con una semilla fija (123) y seleccionado según la métrica `validation_end_to_end_f1`, lo que sugiere un enfoque de evaluación orientado a la precisión integral de la extracción de entidades.

La relevancia de este modelo radica en que ofrece una alternativa especializada para tareas de NER en portugués, un idioma con menos recursos que el inglés. Al estar basado en BERTimbau large, hereda la arquitectura transformer encoder de BERT con 24 capas y 335 millones de parámetros, con una longitud de contexto limitada a 512 tokens. Está diseñado para su uso con la librería Transformers de HuggingFace y su pipeline de token-classification, lo que facilita su integración en aplicaciones de procesamiento de lenguaje natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT large (transformer encoder, 24 capas, 16 cabezas de atencion) |
| Parametros totales | 333.356.041 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugues (pt) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en BERTimbau large, un transformer encoder de tipo BERT con 24 capas, 16 cabezas de atencion y una dimension oculta de 1024. El preentrenamiento original de BERTimbau se realizo sobre el corpus BrWaC (Brazilian Web as Corpus), con 1.000.000 de pasos y enmascaramiento de palabras completas (whole-word mask). El modelo base es la version cased, que distingue entre mayusculas y minusculas, relevante para tareas de NER donde la capitalizacion aporta informacion.

El fine-tuning se realizo sobre el split `paramopama` del protocolo NEVE NER, un conjunto de datos especifico para NER en portugues. La model card indica que el entrenamiento se hizo con el split congelado (`frozen`), lo que implica que no se utilizaron otros splits para el ajuste. Se empleo la semilla 123 y la seleccion del mejor checkpoint se hizo segun la metrica `validation_end_to_end_f1`, que mide el rendimiento global de la extraccion de entidades (no solo etiquetas individuales, sino la coherencia de las secuencias). No se especifican hiperparametros adicionales ni tecnicas de regularizacion.

## Capacidades

- Reconocimiento de entidades nombradas en portugues (personas, organizaciones, lugares, fechas, etc.) mediante clasificacion de tokens.
- Procesamiento de texto con distincion de mayusculas/minusculas, lo que mejora la deteccion de entidades en contextos donde la capitalizacion es significativa.
- Integracion nativa con el pipeline `token-classification` de HuggingFace Transformers, permitiendo extraer entidades directamente con la API estandar.
- Compatible con `endpoints_compatible`, lo que facilita su despliegue en servicios de inferencia gestionados.
- Soporte multilingue limitado al portugues, aunque el modelo base BERTimbau fue entrenado principalmente con portugues brasileño, por lo que su rendimiento puede variar con variantes del portugues europeo o africano.

## Casos de uso

- Extraccion de entidades en documentos legales portugueses: el modelo puede identificar nombres de personas, empresas y lugares en contratos o sentencias, facilitando la automatizacion de procesos de revision documental.
- Analisis de noticias y articulos periodisticos: permite extraer organizaciones, personas y ubicaciones para generar metadatos estructurados en sistemas de recomendacion o archivo.
- Procesamiento de registros de salud en portugues: identificacion de nombres de pacientes, medicamentos y hospitales en historiales clinicos, con la salvedad de que el modelo no esta entrenado especificamente en dominios medicos.
- Gestion de atencion al cliente: extraccion de entidades en conversaciones de soporte para clasificar quejas o solicitudes segun producto, persona o ubicacion.
- Construccion de bases de conocimiento: el modelo puede alimentar pipelines de extraccion de informacion para poblar grafos de conocimiento con entidades extraidas de texto en portugues.
- Enriquecimiento de motores de busqueda: anotacion de documentos con entidades para mejorar la precision de busquedas semanticas en corpus en portugues.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de rendimiento (F1, precision, recall) sobre conjuntos de validacion o test. El modelo fue seleccionado por `validation_end_to_end_f1`, pero no se proporcionan los valores numericos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 333 millones de parametros. En FP32 (4 bytes por parametro) ocupa aproximadamente 1,33 GB, por lo que cabria en una GPU con 2 GB de VRAM. En FP16 (2 bytes) ocupa unos 670 MB, y en cuantizacion INT8 (1 byte) unos 335 MB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente para inferencia en FP32. Una RTX 3060, RTX 4060 o equivalente puede ejecutarlo sin problemas. Para entrenamiento o fine-tuning adicional se recomienda una GPU con 8 GB o mas.
- Compatible con GPUs consumer: si, es un modelo relativamente pequeno que cabe en la mayoria de tarjetas graficas modernas.
- Opciones de despliegue: al usar la libreria Transformers, puede desplegarse con herramientas como HuggingFace Inference Endpoints, vLLM (aunque vLLM esta orientado a modelos generativos, soporta encoders), o en un servidor Python con FastAPI. No es compatible con llama.cpp ni Ollama, ya que estos se centran en modelos de lenguaje generativos y no en encoders como BERT.
- Latencia y throughput: no se dispone de mediciones publicadas. En una GPU moderna, la inferencia sobre secuencias de hasta 512 tokens deberia completarse en decenas de milisegundos, pero depende del hardware y del lote.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa. Como referencia, el modelo base BERTimbau large tiene 335 millones de parametros y fue preentrenado en portugues. Existen otros modelos NER para portugues, como `PORTULAN/alberto` o `pysentimiento/bert-base-spanish-wwm-uncased` (para espanol, no portugues), pero no hay datos publicos de este modelo frente a ellos. La comparativa no esta disponible.

## Limitaciones y advertencias

- Sesgos conocidos: al estar preentrenado en BrWaC, un corpus web brasileño, el modelo puede reflejar sesgos presentes en ese contenido (sesgos de genero, raza o socioeconomicos). No se ha realizado una evaluacion de sesgos especifica para este fine-tuning.
- Riesgo de alucinacion: en tareas de NER, el riesgo de alucinacion se manifiesta como etiquetas incorrectas o entidades inventadas. No se dispone de datos sobre su tasa de error.
- Limitaciones de contexto: la longitud maxima de 512 tokens limita el procesamiento de documentos largos; para textos extensos es necesario dividirlos en fragmentos, lo que puede afectar a la coherencia de las entidades.
- Limitaciones de idioma: el modelo esta entrenado principalmente en portugues brasileño. El portugues europeo u otras variantes pueden presentar un rendimiento inferior.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede confirmar si permite uso comercial. Se recomienda contactar con el autor antes de utilizarlo en produccion.
- Caveat para produccion: el modelo fue fine-tuneado sobre un split especifico (`paramopama`) del protocolo NEVE, que puede no ser representativo de otros dominios o estilos de texto. Es recomendable validar su rendimiento en el corpus objetivo antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-bertimbau-large-specific-paramopama-seed123
- Modelo base BERTimbau large: https://huggingface.co/neuralmind/bert-large-portuguese-cased
- Repositorio de BERTimbau en GitHub (referencia): https://github.com/ClaudioSS01/portuguese-Bertimbau
- Repositorio alternativo de BERTimbau: https://github.com/marcosyonaware/portuguese-Bertimbau
- Ficha de BERTimbau en PORTULAN CLARIN: https://portulanclarin.net/repository/browse/bertimbau-portuguese-bert-large-language-model/901cc41ce93711ebbc0f02420a8701533d6c2809b7324b2386d5b397f168cf5a/
