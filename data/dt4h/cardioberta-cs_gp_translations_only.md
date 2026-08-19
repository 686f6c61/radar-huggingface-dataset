# DT4H/CardioBERTa.cs_GP_translations_only

## Resumen

DT4H/CardioBERTa.cs_GP_translations_only es un codificador de terminologia biomedica en checo desarrollado por el proyecto europeo DataTools4Heart (DT4H) para la normalizacion de conceptos clinicos y el entity linking. El modelo se inicializa desde CardioBERTa.cs, un encoder RoBERTa adaptado al dominio de la cardiologia mediante continuacion del pretraining con masked language modeling sobre corpus biomedicos en checo, y se especializa mediante metric learning con pares de terminologia supervisados por CUI (Concept Unique Identifier) de UMLS.

La estrategia de entrenamiento "grandparents" enriquece los pares de sinonimos con relaciones ontologicas de nivel abuelo, generando 4.684.811 tripletas que cubren 476.969 CUIs y 526.489 terminos normalizados unicos. El modelo emplea Multi-Similarity Loss con pooling sobre el token CLS y una longitud maxima de 25 tokens por entrada. Con aproximadamente 126 millones de parametros, es un modelo compacto disenado para integrarse en pipelines de procesamiento de lenguaje natural clinico.

El modelo no esta destinado a la toma de decisiones clinicas directas, sino a tareas de recuperacion de candidatos, normalizacion de conceptos y entity linking en el dominio de la cardiologia. Forma parte de la familia CardioBERTa, que cubre siete idiomas europeos (checo, neerlandes, ingles, italiano, rumano, espanol y sueco), dentro del proyecto DT4H financiado por la Union Europea (Grant Agreement 101057849).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (encoder transformer denso) |
| Parametros totales | 125.975.808 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (entrenado con max_length 25) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Checo (cs) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa, un encoder transformer de tipo denso con aproximadamente 126 millones de parametros. Pertenece a la familia CardioBERTa del proyecto CardioLM, que adapta modelos de lenguaje al dominio de la cardiologia mediante continuacion del pretraining con masked language modeling sobre corpus biomedicos y relacionados con la cardiologia en cada idioma cubierto.

La especializacion se realiza mediante metric learning: el modelo se entrena con tripletas (anchor, positivo, negativo) construidas a partir de pares de terminologia supervisados por CUI de UMLS, enriquecidos con relaciones ontologicas de nivel "abuelo" (grandparents). El objetivo de entrenamiento es Multi-Similarity Loss con un margen de 0,2, pooling sobre el token CLS, una epoca, batch size de 256, learning rate de 2e-5 y longitud maxima de 25 tokens. La estrategia "translations_only" indica que las tripletas se construyen exclusivamente a partir de traducciones, sin incluir otras variantes terminologicas.

La terminologia de entrenamiento no se distribuye con el repositorio porque contiene recursos sujetos a las condiciones de licencia de UMLS; solo se publican estadisticas agregadas.

## Capacidades

- Generacion de embeddings de terminologia biomedica en checo para representacion vectorial de conceptos clinicos.
- Recuperacion de candidatos biomedicos (candidate retrieval) para tareas de entity linking.
- Normalizacion de conceptos clinicos mediante asignacion a CUIs de UMLS.
- Entity linking en el dominio de la cardiologia y la clinica.
- Integracion con pipelines de NLP clinico para estandarizacion de informes de cardiologia.
- Compatible con text-embeddings-inference y endpoints de HuggingFace.
- Soporte de metric learning con pooling CLS y embeddings normalizados L2.

## Casos de uso

- Estandarizacion de informes de cardiologia: el modelo puede normalizar terminos clinicos extraidos de informes en checo y asignarlos a conceptos UMLS, facilitando la interoperabilidad de datos sanitarios entre regiones europeas dentro de la plataforma DT4H.
- Entity linking en historiales clinicos electronicos: permite enlazar menciones de entidades clinicas en texto libre checo con conceptos estandarizados de UMLS, habilitando busquedas semanticas y analisis poblacionales.
- Recuperacion de informacion biomedica: al generar embeddings de terminos clinicos, el modelo puede alimentar sistemas de busqueda semantica sobre literatura cientifica o bases de datos de ensayos clinicos en checo.
- Curacion y expansion de ontologias: el modelo puede asistir en la identificacion de sinonimos y relaciones entre terminos clinicos checos, apoyando el mantenimiento de vocabularios estructurados.
- Preprocesamiento para pipelines de NLP clinico: como etapa de normalizacion previa a tareas de extraccion de informacion, clasificacion o analisis de cohortes en datos cardiologicos.
- Armonizacion de datos para investigacion traslacional: permite unificar terminologia clinica de multiples fuentes en checo para estudios multicentricos y analisis federados dentro del ecosistema DataTools4Heart.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 126 millones de parametros, el modelo requiere aproximadamente 500 MB en FP32, 250 MB en FP16 y unos 125 MB en INT8, por lo que cabe en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia (por ejemplo, NVIDIA GTX 1650, RTX 3060 o superiores).
- Despliegue en CPU: viable gracias al tamano compacto del modelo; la latencia por inferencia seria de decenas de milisegundos en CPU moderna.
- Opciones de despliegue: compatible con transformers, text-embeddings-inference, endpoints de HuggingFace y librerias de embeddings.
- Al ser un encoder de embedding, el throughput depende del tamano del lote y de la longitud de entrada (maxima de 25 tokens en entrenamiento).

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la informacion proporcionada. Como referencia cualitativa, el modelo compite en la categoria de encoders biomedicos compactos con alternativas como SapBERT o BioBERT, aunque estas no estan especializadas en checo ni en el dominio de la cardiologia. La ventaja diferencial de este modelo es su cobertura especifica del idioma checo y su entrenamiento orientado a entity linking con CUIs de UMLS, dentro de una suite multilingue que cubre siete idiomas europeos.

## Limitaciones y advertencias

- El modelo solo soporta el idioma checo; no es aplicable a otros idiomas sin adaptacion.
- No esta destinado a la toma de decisiones clinicas directas; es una herramienta de procesamiento de lenguaje natural.
- La terminologia de entrenamiento no se distribuye con el repositorio debido a restricciones de licencia de UMLS; solo se publican estadisticas agregadas.
- La licencia del modelo no esta especificada en la informacion disponible, lo que puede limitar su uso comercial sin aclaracion previa.
- La longitud maxima de entrada utilizada en entrenamiento es de 25 tokens, lo que puede limitar su eficacia con conceptos o frases largas.
- No se han publicado benchmarks de rendimiento, por lo que la calidad relativa frente a otros modelos no puede verificarse.
- Existe riesgo de asignacion incorrecta de conceptos si el termino de entrada no esta cubierto por la terminologia de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DT4H/CardioBERTa.cs_GP_translations_only
- Modelo base CardioBERTa.cs: https://huggingface.co/DT4H/CardioBERTa.cs
- Organizacion DT4H en HuggingFace: https://huggingface.co/DT4H/
- Repositorio GitHub del proyecto: https://github.com/DataTools4Heart/
- Sitio web del proyecto: https://www.datatools4heart.eu/
