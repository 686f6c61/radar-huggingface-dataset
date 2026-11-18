# martinkorelic/rudar-gliner2-sl-ner-conll

## Resumen

`rudar-gliner2-sl-ner-conll` es un modelo especializado en reconocimiento de entidades nombradas (NER) para esloveno, desarrollado por Martin Korelič dentro de la familia Rudar de modelos de extracción de información. Se trata de un ajuste fino del modelo base `martinkorelic/rudar-gliner2-sl-base`, que a su vez se construye sobre la arquitectura GLiNER2. El modelo etiqueta texto en las cinco clases CoNLL habituales en los corpus eslovenos: personas (PER), lugares (LOC), organizaciones (ORG), miscelánea (MISC) y adjetivos derivados de nombres propios de persona (DERIV-PER), una categoría morfológicamente relevante en esloveno.

Con 307 millones de parámetros y un repositorio de 1,2 GB, el modelo está pensado para tareas de etiquetado de entidades en producción, análisis de noticias, anotación de corpus y preprocesamiento para anonimización. Su rasgo más destacable es el rendimiento declarado en el benchmark SloBench de NER en esloveno, con un F1 de 98,15 sobre 81 documentos de test ocultos, aunque estos resultados no están verificados de forma independiente.

El modelo también declara competencia en croata y serbio, lo que lo hace útil en el ámbito lingüístico del serbocroata más allá del esloveno. La licencia Apache 2.0 facilita su uso comercial, y su integración con la librería `transformers` mediante `pipeline` con `trust_remote_code` simplifica el despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER2 (transformer encoder para NER zero-shot / open-label; detalles internos no disponibles) |
| Parametros totales | 307.098.645 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | esloveno (sl), croata (hr), serbio (sr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | token-classification |
| Modelo base | martinkorelic/rudar-gliner2-sl-base |
| Tamano del repositorio | 1,2 GB |
| Clases de entidad | PER, LOC, ORG, MISC, DERIV-PER |

## Arquitectura y entrenamiento

El modelo se basa en GLiNER2, una familia de arquitecturas orientadas a extracción de información de tipo open-label, donde el modelo recibe etiquetas de entidad como parte de la entrada y predice los spans correspondientes. El ajuste fino se ha realizado sobre `rudar-gliner2-sl-base`, que actúa como modelo base de la familia Rudar para extracción abierta de entidades, relaciones y registros estructurados. El resultado es un modelo especializado en las cinco clases CoNLL del esloveno, incluyendo la clase DERIV-PER para adjetivos derivados de nombres de persona.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card indica que el pipeline recomendado conserva el casing original del texto, divide textos largos en límites de frase y resuelve solapamientos de entidades; cargar los pesos directamente con `GLiNER2.from_pretrained` produce entrada en minúsculas y menor calidad. El modelo requiere código remoto (`modeling_rudar.py` y `pipeline_rudar.py`) alojado en el propio repositorio, y se ha probado con `gliner2 2.0.0`, `transformers 4.57` y `torch 2.3–2.14`.

## Capacidades

- Reconocimiento de entidades nombradas en esloveno con las clases PER, LOC, ORG, MISC y DERIV-PER.
- Detección de adjetivos derivados de nombres propios de persona (por ejemplo, *Prešernov*, *Kobilčine*), una categoría específica del esloveno.
- Procesamiento por lotes de múltiples textos y ejecución en GPU mediante `pipeline(..., device=0)`.
- Filtrado por clases mediante el argumento `labels` y ajuste del umbral de confianza mediante `threshold` (por defecto 0,65).
- Salida con offsets de caracteres (`start` / `end`) compatible con el pipeline de token-classification de `transformers`.
- Capacidad multilingüe limitada al ámbito serbocroata: esloveno, croata y serbio.
- No se declaran capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Análisis de noticias en esloveno: extracción automática de personas, organizaciones y lugares de artículos periodísticos para construir índices de entidades y grafos de conocimiento. El modelo maneja las cinco clases CoNLL de forma nativa y devuelve offsets de caracteres que facilitan el enlazado con el texto original.
- Anotación de corpus lingüísticos: preetiquetado de corpus eslovenos con las clases CoNLL, incluyendo DERIV-PER, para acelerar la anotación manual y reducir el esfuerzo de revisión humana.
- Preprocesamiento para anonimización: detección de nombres de persona y organizaciones antes de aplicar seudonimización o redacción en documentos que deben compartirse; el modelo PII de la misma familia cubre la redacción específica de datos personales.
- Búsqueda y recuperación de información: enriquecimiento de índices de búsqueda con entidades para permitir consultas filtradas por persona, lugar u organización en corpus eslovenos.
- Procesamiento de documentos administrativos y jurídicos: extracción de entidades en textos formales eslovenos para clasificación, resumen o cumplimiento normativo.
- Análisis de medios y monitorización de marca: seguimiento de menciones de organizaciones y personas en prensa eslovena, croata y serbia, con umbral de confianza ajustable para controlar falsos positivos.
- Enriquecimiento de bases de datos: extracción estructurada de entidades a partir de texto libre para poblar tablas de personas, lugares y organizaciones con offsets verificables.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente). El resultado principal corresponde al leaderboard de SloBench de NER en esloveno, sobre 81 documentos de test ocultos.

| Metrica | Valor |
|---|---:|
| F1 | 98,15 |
| Precision | 97,95 |
| Recall | 98,35 |

| Clase | F1 |
|---|---:|
| PER | 99,54 |
| DERIV-PER | 98,97 |
| LOC | 99,05 |
| ORG | 97,07 |
| MISC | 83,48 |

Resultados en croata y serbio sobre los conjuntos de test de BENCHić (macro F1):

| Conjunto de test | F1 |
|---|---:|
| Serbio (SETimes.SR) | 92,2 |
| Croata (hr500k) | 88,0 |
| Serbio informal (ReLDI-NormTagNER-sr) | 76,5 |
| Croata informal (ReLDI-NormTagNER-hr) | 73,5 |

## Requisitos de hardware

- VRAM estimada para inferencia: con 307 millones de parámetros en FP16, aproximadamente 0,6 GB solo para los pesos; contando activaciones y overhead del pipeline, se estima un uso de 1,5–3 GB de VRAM en GPU, o ejecución en CPU para lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 pueden ejecutar el modelo sin problemas.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas, dado el reducido tamaño del modelo.
- Opciones de despliegue: `transformers` con `pipeline(..., trust_remote_code=True)` es la vía recomendada por el autor; requiere `gliner2==2.0.0`, `peft` y `transformers>=4.57,<5`. No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible. A continuación se comparan características estructurales con alternativas de la misma familia y categoría:

| Modelo | Parametros | Idiomas | Tarea | Licencia |
|---|---|---|---|---|
| rudar-gliner2-sl-ner-conll | 307 M | sl, hr, sr | NER CoNLL (5 clases) | Apache 2.0 |
| rudar-gliner2-sl-base | no disponible | sl, hr, sr | Extracción open-label (entidades, relaciones, registros) | no disponible |
| rudar-gliner2-sl-pii | no disponible | sl, hr, sr | Detección y redacción de datos personales (21 tipos) | no disponible |
| rudar-gliner2-sl-coref | no disponible | sl, hr, sr | Correferencia | no disponible |

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- La clase MISC presenta un F1 notablemente inferior (83,48) al resto de clases, lo que indica mayor dificultad para delimitar entidades de tipo miscelánea.
- El rendimiento cae de forma significativa en texto informal: F1 de 76,5 en serbio informal y 73,5 en croata informal, frente a 92,2 y 88,0 en texto estándar.
- El modelo está especializado en esloveno; el soporte de croata y serbio es secundario y con rendimiento inferior.
- Es necesario usar el pipeline con `trust_remote_code=True`; cargar los pesos con `GLiNER2.from_pretrained` directamente produce entrada en minúsculas y menor calidad. Conviene fijar una revisión concreta (`revision="<commit hash>"`) para evitar cambios en el código remoto.
- Riesgo de alucinación de entidades y de falsos positivos en texto ruidoso; el umbral `threshold` (por defecto 0,65) permite ajustar el compromiso entre precisión y recall.
- No se documentan sesgos específicos del modelo; al estar entrenado sobre corpus eslovenos, puede heredar los sesgos de dichas fuentes.
- La licencia Apache 2.0 permite uso comercial, pero no se detallan restricciones adicionales sobre los datos de entrenamiento.
- No se dispone de información sobre la longitud máxima de contexto soportada, lo que limita la planificación de despliegues con documentos muy largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/martinkorelic/rudar-gliner2-sl-ner-conll
- Modelo base: https://huggingface.co/martinkorelic/rudar-gliner2-sl-base
- Modelo PII de la familia: https://huggingface.co/martinkorelic/rudar-gliner2-sl-pii
- Demo (Space): https://huggingface.co/spaces/martinkorelic/rudar-gliner2-sl
- Leaderboard SloBench NER: https://slobench.cjvt.si/leaderboard/view/12
- BENCHić NER: https://github.com/clarinsi/benchich/tree/main/ner
