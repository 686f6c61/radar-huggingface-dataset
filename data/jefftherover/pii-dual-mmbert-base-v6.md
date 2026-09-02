# jefftherover/pii-dual-mmbert-base-v6

## Resumen

pii-dual-mmbert-base-v6 es un modelo de clasificacion de tokens (token classification) especializado en la deteccion de informacion personal identificable (PII, por sus siglas en ingles). Es un ajuste fino del modelo jhu-clsp/mmBERT-base, desarrollado por el autor jefftherover y publicado bajo licencia MIT con pesos en formato safetensors. El modelo se integra en el ecosistema Transformers de Hugging Face y es compatible con endpoints de inferencia.

El modelo base mmBERT es un encoder multilingue moderno desarrollado por JHU-CLSP, entrenado sobre 3 billones de tokens en 1833 idiomas mediante una tecnica novedosa de aprendizaje de idiomas con annealing en cascada (cascaded annealed language learning). La version base de mmBERT tiene 307 millones de parametros totales, de los cuales 110 millones corresponden a parametros no relacionados con embeddings, debido al amplio vocabulario multilingue. Esta arquitectura, basada en ModernBERT, supera a XLM-R en tareas multilingues y ofrece un rendimiento superior en velocidad.

La version v6 de este modelo de deteccion de PII alcanza metricas de evaluacion muy altas: precision de 0,9985, recall de 0,9991, F1 de 0,9988 y accuracy de 0,9997 sobre el conjunto de validacion. El modelo esta orientado a identificar y etiquetar entidades sensibles como nombres, direcciones, numeros de telefono o datos financieros en texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) via mmBERT-base |
| Parametros totales | 307.575.611 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base ModernBERT soporta hasta 8192 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base mmBERT soporta 1833 idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo pii-dual-mmbert-base-v6 es un ajuste fino del encoder multilingue mmBERT-base, desarrollado por el grupo JHU-CLSP de la Universidad Johns Hopkins. mmBERT se basa en la arquitectura ModernBERT, un transformer encoder optimizado para eficiencia y velocidad, con atencion global y local combinadas. La version base de mmBERT tiene 307 millones de parametros totales, de los cuales 110 millones son parametros no relacionados con embeddings, una proporcion inusual que se explica por el amplio vocabulario necesario para cubrir 1833 idiomas.

El entrenamiento del ajuste fino se realizo sobre un conjunto de datos no especificado (la model card indica "unknown dataset"). Los hiperparametros de entrenamiento incluyen una tasa de aprendizaje de 5e-05, batch de entrenamiento de 16 con acumulacion de gradientes de 2 pasos (batch efectivo de 32), optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler de tasa de aprendizaje coseno con reinicios, 200 pasos de warmup, 4 epocas y precision mixta nativa (Native AMP). El entrenamiento se realizo con Transformers 5.16.1 y PyTorch 2.13.0. La tarea especifica es token classification orientada a la deteccion de PII; el nombre "pii-dual" sugiere un enfoque de doble tarea o doble cabecera, aunque esta caracteristica no esta documentada.

## Capacidades

- Deteccion de informacion personal identificable (PII) mediante clasificacion de tokens, capaz de etiquetar entidades sensibles en texto.
- Clasificacion a nivel de sub-palabra, lo que permite identificar entidades en textos sin necesidad de segmentacion previa.
- Hereda las capacidades multilingues del modelo base mmBERT, entrenado en 1833 idiomas, aunque el ajuste fino especifico no documenta los idiomas cubiertos.
- Procesamiento de texto con contexto de hasta 8192 tokens (capacidad del modelo base ModernBERT).
- Inferencia eficiente gracias a la arquitectura ModernBERT, optimizada para velocidad en GPUs modernas.
- Compatible con el ecosistema Transformers de Hugging Face y con endpoints de inferencia (endpoints_compatible).
- Pesos en formato safetensors, seguros y eficientes para cargar en produccion.

## Casos de uso

- Cumplimiento normativo de proteccion de datos: el modelo puede integrarse en pipelines de procesamiento de documentos para identificar y enmascarar datos personales antes de su almacenamiento o transferencia, ayudando a cumplir con regulaciones como el RGPD. Su alta precision (F1 de 0,9988) reduce los falsos positivos que generarian friccion innecesaria.

- Anonimizacion de conjuntos de datos clinicos: en el ambito sanitario, el modelo puede procesar historiales clinicos y notas medicas para eliminar identificadores de pacientes, permitiendo compartir datos para investigacion sin comprometer la privacidad. La capacidad multilingue del modelo base resulta util en entornos sanitarios internacionales.

- Redaccion de logs y telemetria: los sistemas de registro de aplicaciones suelen capturar accidentalmente datos personales. El modelo puede actuar como filtro en tiempo real sobre logs para detectar y enmascarar PII antes de que se almacenen en sistemas de observabilidad.

- Preprocesamiento de datos para entrenamiento de LLMs: antes de entrenar o ajustar modelos de lenguaje, es necesario garantizar que los datos de entrenamiento no contengan informacion personal. El modelo puede ejecutarse como paso de limpieza en pipelines de preparacion de datos.

- Deteccion de fugas de datos en soporte al cliente: en sistemas de atencion al cliente, el modelo puede analizar conversaciones y tickets para detectar si los agentes han compartido informacion sensible, ayudando a prevenir fugas de datos.

- Analisis de documentos legales: en despachos de abogados y departamentos legales, el modelo puede procesar contratos y documentos para identificar clausulas que contengan datos personales, facilitando la revision de cumplimiento y la redaccion de documentos anonimizados.

- Filtrado de PII en datos de redes sociales: el modelo puede procesar publicaciones y mensajes para detectar informacion personal compartida publicamente, permitiendo a plataformas ofrecer alertas de privacidad a sus usuarios.

## Benchmarks y rendimiento

El model-index de la model card no incluye resultados de benchmarks externos. El autor declara los siguientes resultados de evaluacion sobre el conjunto de validacion durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Loss | 0,0013 |
| Precision | 0,9985 |
| Recall | 0,9991 |
| F1 | 0,9988 |
| Accuracy | 0,9997 |

Evolucion de las metricas durante el entrenamiento (4 epocas, 9340 pasos):

| Epoch | Step | Validation Loss | Precision | Recall | F1 | Accuracy |
|:-----:|:----:|:---------------:|:---------:|:------:|:------:|:--------:|
| 0,86 | 2000 | 0,0030 | 0,9943 | 0,9967 | 0,9955 | 0,9991 |
| 1,71 | 4000 | 0,0020 | 0,9970 | 0,9981 | 0,9976 | 0,9995 |
| 2,57 | 6000 | 0,0014 | 0,9976 | 0,9985 | 0,9981 | 0,9995 |
| 3,43 | 8000 | 0,0013 | 0,9984 | 0,9991 | 0,9987 | 0,9997 |
| 4,0 | 9340 | 0,0013 | 0,9985 | 0,9991 | 0,9988 | 0,9997 |

No se han publicado resultados de benchmarks comparativos con otros modelos de deteccion de PII en la informacion disponible.

## Requisitos de hardware

- Con 307 millones de parametros, el modelo requiere aproximadamente 1,2 GB de VRAM en precision fp32 y unos 0,6 GB en fp16, por lo que cabe en cualquier GPU de consumo moderna con 4 GB o mas de VRAM.
- GPUs recomendadas: NVIDIA RTX 3060 (12 GB) o superior para inferencia comoda; NVIDIA A100 o H100 para despliegues de alta concurrencia en produccion.
- El modelo es compatible con el ecosistema Transformers de Hugging Face y puede desplegarse con vLLM, TGI (Text Generation Inference) o directamente con la API de Transformers.
- Al ser un modelo de clasificacion de tokens, la latencia por documento es baja; un batch de 32 documentos con contexto de 512 tokens se procesa en milisegundos en una GPU moderna.
- Para despliegues en CPU, el modelo tambien es viable gracias a su tamano moderado, aunque con latencias mayores.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Idiomas | Licencia | Contexto |
|---|---|---|---|---|---|
| pii-dual-mmbert-base-v6 | 307M | ModernBERT (mmBERT-base) | no disponible | MIT | no disponible |
| jhu-clsp/mmBERT-base | 307M | ModernBERT | 1833 | no disponible | no disponible |
| XLM-RoBERTa-base | 278M | Transformer encoder | 100 | MIT | 512 tokens |

No se dispone de datos comparativos de rendimiento especificos para tareas de deteccion de PII entre estos modelos. El modelo base mmBERT supera a XLM-R en tareas multilingues generales segun el paper de mmBERT, pero no hay benchmarks publicados para la tarea especifica de este ajuste fino.

## Limitaciones y advertencias

- El conjunto de datos de entrenamiento no esta documentado ("unknown dataset"), lo que dificulta evaluar la generalizacion del modelo a dominios o idiomas no representados en el entrenamiento.
- Los resultados de evaluacion (precision, recall, F1) provienen del conjunto de validacion utilizado durante el entrenamiento y podrian no reflejar el rendimiento en datos reales de produccion.
- El modelo no documenta los idiomas soportados en el ajuste fino, aunque el modelo base mmBERT es multilingue. Es posible que el ajuste fino se haya realizado sobre un subconjunto de idiomas.
- La longitud de contexto no esta confirmada para este ajuste fino especifico; aunque el modelo base ModernBERT soporta 8192 tokens, el ajuste fino podria haber modificado este parametro.
- No se han publicado resultados de benchmarks externos independientes que validen las metricas declaradas.
- El modelo esta disenado exclusivamente para clasificacion de tokens (deteccion de PII); no es un modelo generativo y no puede utilizarse para generar texto.
- La licencia MIT permite uso comercial, pero el autor no proporciona garantias sobre la calidad o idoneidad del modelo para casos de uso especificos.
- El nombre "pii-dual" sugiere una arquitectura de doble tarea o doble cabecera, pero esta caracteristica no esta documentada en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jefftherover/pii-dual-mmbert-base-v6
- Version v3 del mismo autor: https://huggingface.co/jefftherover/pii-dual-mmbert-base-v3
- Repositorio de mmBERT (JHU-CLSP): https://github.com/JHU-CLSP/mmBERT
- Paper de mmBERT: https://arxiv.org/html/2509.06888v1
- Modelo base mmBERT en Hugging Face: https://huggingface.co/jhu-clsp/mmBERT-base
