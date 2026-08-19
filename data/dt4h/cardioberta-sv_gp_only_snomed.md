# DT4H/CardioBERTa.sv_GP_only_snomed

## Resumen

CardioBERTa.sv_GP_only_snomed es un encoder de terminología biomédica en sueco, especializado en normalización de conceptos clínicos y entity linking, desarrollado por el consorcio DataTools4Heart (DT4H) dentro del proyecto europeo CardioLM. Se inicializa desde el modelo base DT4H/CardioBERTa.sv, un BERT adaptado al dominio cardiológico mediante preentrenamiento continuado con masked language modeling sobre corpus biomédicos y cardiológicos monolingües en sueco. El modelo se afina con tripletas CUI-supervisadas extraídas de SNOMED CT, enriqueciendo las relaciones de sinonimia con relaciones ontológicas de nivel "grandparent" (abuelo) para mejorar la agrupación semántica de términos clínicos.

Con 124,7 millones de parámetros y una arquitectura transformer encoder, este modelo genera embeddings de frases o términos clínicos que pueden utilizarse para recuperación de candidatos, normalización de conceptos y vinculación con ontologías UMLS. Su relevancia radica en que aborda la falta de recursos de procesamiento de lenguaje clínico para el sueco, un idioma con poca representación en el ámbito de la IA biomédica, y lo hace con un enfoque de metric learning que no requiere etiquetas manuales para cada término. El modelo está pensado para integrarse en pipelines de NLP clínico, especialmente en cardiología, y es compatible con herramientas de inferencia de embeddings como text-embeddings-inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer) |
| Parametros totales | 124.690.944 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado con max_length 25, el modelo base CardioBERTa.sv soporta 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | sueco (sv) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT estándar, con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, lo que da un total de 124 millones de parámetros. Se inicializa desde CardioBERTa.sv, que fue preentrenado con MLM sobre corpus biomédicos y cardiológicos en sueco. Posteriormente, se realiza un ajuste fino con tripletas de términos clínicos supervisadas por conceptos UMLS (CUIs), empleando una estrategia de minería de tripletas denominada "grandparents", que añade relaciones ontológicas de nivel abuelo a las relaciones de sinonimia y parentesco directo. El objetivo de entrenamiento es Multi-Similarity Loss, con pooling sobre el token CLS y una longitud máxima de 25 tokens por entrada. Se usaron 3.227.930 tripletas que cubren 398.450 CUIs y 389.241 términos normalizados únicos, con un batch size de 256 y una tasa de aprendizaje de 2e-5 durante una época.

La terminología de entrenamiento no se distribuye con el repositorio por restricciones de licencia de UMLS, pero se publican estadísticas agregadas. El modelo no emplea técnicas como decodificación especulativa ni atención lineal, ya que es un encoder puro para embeddings, no un generador.

## Capacidades

- Generacion de embeddings de terminos y frases clinicas en sueco, normalizados a vectores de 768 dimensiones.
- Recuperacion de candidatos para entity linking: dado un termino clinico, produce un embedding que puede compararse por similitud coseno con embeddings de conceptos UMLS precomputados.
- Normalizacion de conceptos: mapea variantes terminologicas (sinonimos, formas abreviadas, errores ortograficos) a un CUI comun.
- Soporte para metric learning: entrenado con Multi-Similarity Loss, optimizado para separar conceptos distintos y agrupar sinonimos.
- Integracion con pipelines de NLP clinico: compatible con la libreria transformers y con text-embeddings-inference para despliegue como servicio de embeddings.
- Capacidades multilingues: no, esta limitado al sueco, aunque el backbone CardioBERTa tiene versiones para otros idiomas europeos.

## Casos de uso

- Normalizacion de conceptos en informes de cardiologia: el modelo puede convertir terminos clinicos suecos extraidos de informes medicos (p. ej., "hjartinfarkt", "akut koronart syndrom") en embeddings que se comparan contra una base de conceptos SNOMED CT para asignar el CUI correcto, facilitando la estructuracion de historiales clinicos.
- Entity linking en textos cientificos suecos: en articulos o ensayos clinicos, permite vincular menciones de enfermedades, farmacos o procedimientos a ontologias UMLS, habilitando busquedas semanticas y analisis agregado de literatura.
- Recuperacion de informacion clinica: al indexar documentos hospitalarios con embeddings generados por el modelo, se pueden realizar busquedas por similitud semantica para encontrar casos similares, por ejemplo, pacientes con sintomas de insuficiencia cardiaca.
- Soporte a codificacion medica automatica: el modelo puede asistir a codificadores asignando codigos SNOMED CT a partir de texto libre sueco, reduciendo el tiempo de revision manual en sistemas de facturacion o registros de salud.
- Construccion de grafos de conocimiento clinico: al normalizar entidades extraidas de multiples fuentes suecas, se pueden enlazar conceptos y construir grafos que relacionen sintomas, diagnosticos y tratamientos para investigacion epidemiologica.
- Evaluacion de calidad de datos clinicos: detecta inconsistencias en terminologia usada en registros electronicos de salud, agrupando variantes de un mismo concepto y facilitando la limpieza de datos antes de analisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como precision en entity linking, recall o comparaciones con otros modelos. Solo se proporcionan estadisticas de entrenamiento (tripletas, CUIs, terminos) y la configuracion del entrenamiento.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 124M de parametros, con pesos en FP32 ocupa aproximadamente 0,5 GB. En FP16, unos 0,25 GB. Cabe en cualquier GPU moderna con al menos 2 GB de VRAM.
- GPU recomendadas: NVIDIA T4, RTX 2080, RTX 3060 o superiores. Tambien puede ejecutarse en CPU con razonable latencia para inferencia por lotes.
- Compatibilidad con consumer GPU: si, cualquier GPU de consumo con 4 GB o mas puede ejecutarlo sin problemas.
- Opciones de despliegue: transformers (pipeline de feature-extraction), text-embeddings-inference (TEI) para servir endpoints de embeddings, o mediante ONNX para optimizacion en CPU.
- Latencia y throughput: no hay datos publicados, pero al ser un modelo pequeno, se espera una latencia inferior a 10 ms por secuencia en GPU moderna y decenas de ms en CPU.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos de embeddings clinicos en sueco. Alternativas genericas como BioBERT o PubMedBERT estan entrenadas en ingles y no cubren sueco. El modelo base CardioBERTa.sv es el unico comparable en idioma y dominio, pero no tiene la especializacion en normalizacion de conceptos. Por tanto, no se puede establecer una comparativa cuantitativa fiable.

| Modelo | Idioma | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|---|
| CardioBERTa.sv_GP_only_snomed (este) | sueco | 124M | no disponible | Normalizacion de conceptos SNOMED | no disponible |
| CardioBERTa.sv (base) | sueco | 124M | no disponible | Preentrenamiento cardiológico general | no disponible |
| BioBERT (ingles) | ingles | 110M | 512 | Biologia y clinica general | MIT |

## Limitaciones y advertencias

- Entrenado exclusivamente con terminologia sueca, por lo que no es util para otros idiomas sin adaptacion.
- La longitud maxima de entrada durante el entrenamiento fue de 25 tokens, por lo que puede degradarse con frases largas o contextos extensos.
- La terminologia de entrenamiento no se distribuye por restricciones de UMLS, lo que limita la reproducibilidad completa del ajuste.
- No es un modelo generativo: no produce texto, solo embeddings. No debe usarse para generar respuestas clinicas.
- No esta destinado a la toma de decisiones clinicas directas; es una herramienta de soporte para pipelines de NLP.
- La licencia del modelo no esta especificada, lo que puede generar incertidumbre para uso comercial. Se recomienda contactar con DT4H para aclarar los terminos.
- Riesgo de sesgos: el preentrenamiento se hizo sobre corpus biomedicos que pueden reflejar sesgos de la literatura cientifica (p. ej., sobrerrepresentacion de ciertas poblaciones).
- No se han publicado evaluaciones de rendimiento en tareas reales de entity linking, por lo que su eficacia en produccion debe validarse con datos propios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DT4H/CardioBERTa.sv_GP_only_snomed
- Modelo base CardioBERTa.sv: https://huggingface.co/DT4H/CardioBERTa.sv
- Organizacion DT4H en HuggingFace: https://huggingface.co/DT4H/
- Proyecto DataTools4Heart: https://www.datatools4heart.eu/
- Repositorio GitHub de DT4H: https://github.com/DataTools4Heart/
- Referencia del paper: Danu et al., "CardioLM - a multilingual suite of small language models for the cardiology domain" (no se ha encontrado el enlace directo).
