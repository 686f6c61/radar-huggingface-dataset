# QomSSLab/etghan_tagging_v2

## Resumen

Etghan Tagging v2 es un modelo de clasificación de tokens (token classification) especializado en la extracción de entidades nombradas de documentos judiciales en persa (farsi). Lo desarrolla QomSSLab y se distribuye a través de HuggingFace con la librería transformers. El modelo resuelve un problema muy concreto: convertir texto legal no estructurado (sentencias, demandas, resoluciones) en campos estructurados como nombres de demandante y demandado, cargos legales, fechas de sentencia, tribunal, juez y plazos de apelación.

Técnicamente, la model card indica que se trata de un cabezal de clasificación de tokens sobre XLM-RoBERTa, aunque los tags del repositorio apuntan a la arquitectura ModernBERT. Esta discrepancia entre la documentación del autor y los metadatos del repositorio es relevante y conviene verificarla antes de desplegarlo. El modelo tiene 307.550.234 parámetros y un tamaño de repositorio de 1,3 GB en formato safetensors.

Su relevancia actual radica en la digitalización de sistemas judiciales: la extracción automática de entidades en resoluciones persas permite automatizar la indexación, la búsqueda semántica y la generación de expedientes estructurados. Con un F1 global de 0,7598 en validación, es un modelo funcional pero con margen de mejora en etiquetas de baja frecuencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa según la model card; los tags del repositorio indican ModernBERT (discrepancia no resuelta) |
| Parámetros totales | 307.550.234 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | fa (persa) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card describe el modelo como un cabezal de clasificación de tokens sobre XLM-RoBERTa, un transformer encoder multilingüe. Sin embargo, los tags del repositorio incluyen `modernbert`, lo que sugiere que la base podría ser ModernBERT, una arquitectura encoder más reciente con atención optimizada y soporte de contextos más largos. Dado que la documentación del autor y los metadatos no coinciden, la arquitectura exacta debe confirmarse inspeccionando la configuración del modelo (`config.json`).

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de ajuste fino como RLHF o DPO. El modelo está entrenado para 26 etiquetas BIO relacionadas con el dominio judicial persa, entre ellas ABSENCE, APPEALABILITY, APPEAL_AUTHORITY, APPEAL_DEADLINE, COURT_NAME, DEFENDANT_NAME_NATURAL, JUDGE_NAME, JUDGMENT_DATE, LEGAL_CHARGE, PLAINTIFF_CLAIM y SUBJECT_OF_CLAIM, además de la etiqueta O para tokens fuera de entidad. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Extracción de entidades nombradas (NER) en textos judiciales en persa: nombres de demandante y demandado (personas físicas y jurídicas), apellidos del padre, direcciones.
- Identificación de metadatos procesales: nombre del tribunal, juez, cargo del juez, fecha de sentencia, firma del juez.
- Detección de elementos de la causa: cargo legal, objeto de la reclamación, reclamación del demandante, lugar y fecha del delito.
- Extracción de información sobre apelación: autoridad de apelación, plazo de apelación, apelabilidad y firmeza de la sentencia.
- Identificación de representación legal y presencia de las partes.
- Clasificación de tokens con estrategia de agregación simple mediante el pipeline `token-classification` de transformers.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio: es un modelo encoder de clasificación, no generativo.
- Capacidad monolingüe: únicamente persa (fa).

## Casos de uso

- Digitalización de archivos judiciales: el modelo procesa el texto OCR de sentencias y extrae automáticamente nombres de las partes, tribunal y fecha, alimentando un sistema de gestión documental estructurado. Es adecuado porque sus etiquetas cubren exactamente los campos que aparecen en una resolución judicial persa.
- Indexación y búsqueda semántica de jurisprudencia: al etiquetar entidades como LEGAL_CHARGE o SUBJECT_OF_CLAIM, se pueden construir índices que permitan buscar sentencias por tipo de delito o materia de la reclamación, en lugar de por texto libre.
- Automatización de plazos procesales: la extracción de APPEAL_DEADLINE y JUDGMENT_DATE permite calcular vencimientos de apelación y generar alertas en un sistema de gestión de casos.
- Anonimización de documentos: las etiquetas de nombres, direcciones y apellidos del padre permiten enmascarar datos personales antes de publicar resoluciones, cumpliendo requisitos de protección de datos.
- Análisis estadístico de actividad judicial: agregando entidades extraídas (jueces, tribunales, tipos de cargo) se pueden generar informes sobre carga de trabajo, distribución de casos y tiempos de resolución.
- Extracción de partes para sistemas de gestión de litigios: identificar demandante, demandado y representante legal de forma automática reduce la entrada manual de datos en bufetes y juzgados.
- Enriquecimiento de bases de datos legales: poblar tablas relacionales con campos estructurados a partir de corpus de sentencias en persa para su explotación analítica.

## Benchmarks y rendimiento

Métricas de validación publicadas en la model card:

| Métrica | Valor |
|---|---|
| Precision | 0,7837 |
| Recall | 0,7374 |
| F1 | 0,7598 |
| Accuracy | 0,9654 |

Desglose por etiqueta (selección de las más relevantes):

| Etiqueta | Precision | Recall | F1 | Support |
|---|---|---|---|---|
| ABSENCE | 1,0000 | 0,7377 | 0,8491 | 61 |
| APPEALABILITY | 0,9873 | 0,9957 | 0,9915 | 468 |
| APPEAL_AUTHORITY | 1,0000 | 0,9883 | 0,9941 | 600 |
| APPEAL_DEADLINE | 0,9132 | 0,9927 | 0,9513 | 551 |
| COURT_NAME | 0,7538 | 0,8750 | 0,8099 | 56 |
| DEFENDANT_NAME_NATURAL | 0,9736 | 0,9300 | 0,9513 | 714 |
| JUDGE_NAME | 0,9712 | 0,9870 | 0,9790 | 307 |
| JUDGMENT_DATE | 0,9625 | 0,9872 | 0,9747 | 312 |
| LEGAL_CHARGE | 0,9902 | 0,9408 | 0,9649 | 861 |
| LEGAL_REPRESENTATIVE | 0,9674 | 0,7992 | 0,8753 | 483 |
| PLACE_OF_OFFENSE | 0,6667 | 0,2500 | 0,3636 | 8 |
| PLAINTIFF_CLAIM | 0,8273 | 0,7246 | 0,7726 | 3286 |
| SUBJECT_OF_CLAIM | 0,7500 | 0,6450 | 0,6935 | 1721 |
| TIME_OF_OFFENSE | 0,8246 | 0,7460 | 0,7833 | 63 |

No se han publicado comparaciones con otros modelos en la información disponible. La etiqueta JUDGE_SIGNATURE aparece con soporte 0, por lo que sus métricas de 1,0000 no son representativas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,23 GB solo para pesos (307,5 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, entre 2 y 4 GB según el tamaño de lote y la longitud de secuencia.
- En fp16/bf16: aproximadamente 0,62 GB para pesos; cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU moderna es suficiente. Para producción con alto throughput, una T4, L4 o A10G; para desarrollo, una RTX 3060, RTX 4060 o superior. No requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM, incluidas GTX 1650, RTX 3050 y superiores.
- Opciones de despliegue: transformers con pipeline `token-classification`, vLLM (soporte de modelos encoder limitado), TGI, ONNX Runtime, o exportación a llama.cpp no aplica (no es un modelo generativo). Para CPU, el modelo es viable con ONNX o con PyTorch en fp32.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un encoder de ~300 M de parámetros, se espera latencia de decenas de milisegundos por documento corto en GPU y de cientos de milisegundos en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QomSSLab/etghan_tagging_v2 | 307,5 M | no disponible | NER judicial en persa | no disponible | HuggingFace |
| XLM-RoBERTa base (FacebookAI) | 278 M | 512 tokens | NER multilingüe genérico | MIT | HuggingFace |
| ParsBERT (HooshvareLab) | ~162 M | 512 tokens | NLU en persa | Apache 2.0 | HuggingFace |
| ModernBERT base | ~149 M | 8.192 tokens | Encoder multilingüe | Apache 2.0 | HuggingFace |

La comparación con XLM-RoBERTa base y ParsBERT es relevante porque son las alternativas naturales para NER en persa: XLM-RoBERTa base ofrece cobertura multilingüe y licencia permisiva, mientras que ParsBERT está especializado en persa pero no en dominio judicial. Etghan Tagging v2 aporta un conjunto de etiquetas específico del dominio legal que ninguno de los anteriores proporciona de serie, a cambio de una licencia no declarada y una documentación limitada. No se dispone de benchmarks comparativos directos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es imprescindible contactar con el autor antes de desplegarlo en producción.
- Discrepancia de arquitectura: la model card menciona XLM-RoBERTa pero los tags indican ModernBERT; hay que verificar `config.json` para confirmar la base real y sus requisitos de inferencia.
- Rendimiento desigual por etiqueta: etiquetas con F1 bajo como PLACE_OF_OFFENSE (0,3636, con solo 8 ejemplos de soporte), SUBJECT_OF_CLAIM (0,6935) y TIME_OF_OFFENSE (0,7833) no son fiables para extracción automática sin revisión humana.
- Etiquetas con soporte cero o muy bajo: JUDGE_SIGNATURE tiene soporte 0, por lo que su métrica perfecta no es válida; ABSENCE tiene recall de 0,7377 con 61 ejemplos, lo que indica posible infrarrepresentación.
- Monolingüe: solo persa. No funcionará con textos en árabe, urdu ni otros idiomas, aunque compartan script.
- Riesgo de alucinación de entidades: como todo modelo NER, puede etiquetar tokens incorrectamente en textos con formato atípico u OCR ruidoso, generando campos estructurados falsos.
- Sesgos de dominio: entrenado presumiblemente con documentos de un sistema judicial concreto; puede no generalizar a otros países, formatos o épocas.
- Sin información sobre el dataset de entrenamiento: no se puede evaluar la representatividad, el equilibrio de clases ni posibles sesgos en nombres, regiones o tipos de caso.
- Documentación mínima: sin detalles de contexto máximo, tokenizador, ni instrucciones de despliegue más allá del ejemplo básico.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad; conviene evaluar con datos propios antes de confiar en él.

## Enlaces

- HuggingFace: https://huggingface.co/QomSSLab/etghan_tagging_v2
- Perfil del autor: https://huggingface.co/QomSSLab
- Documentación de transformers para token classification: https://huggingface.co/docs/transformers/tasks/token_classification
- Documentación de XLM-RoBERTa: https://huggingface.co/docs/transformers/model_doc/xlm-roberta
- Documentación de ModernBERT: https://huggingface.co/docs/transformers/model_doc/modernbert
