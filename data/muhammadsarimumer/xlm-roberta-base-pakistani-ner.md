# MuhammadSarimUmer/xlm-roberta-base-pakistani-ner

## Resumen

xlm-roberta-base-pakistani-ner es un modelo de reconocimiento de entidades nombradas (NER) desarrollado por MuhammadSarimUmer, consistente en un ajuste fino de FacebookAI/xlm-roberta-base sobre texto en ingles de origen pakistani: noticias, sentencias judiciales y articulos de Wikipedia. El modelo resuelve la tarea de token classification con etiquetado BIO sobre 20 tipos de entidad especificos del contexto pakistani, incluyendo categorias que los modelos NER genericos no cubren bien, como PROVINCE_REGION, COURT_LEGAL_BODY, LAW_ACT o POLITICAL_PARTY.

La arquitectura es la de XLM-RoBERTa base, un transformer encoder-only con 277.484.585 parametros, sin parametros activos condicionales. La longitud de contexto efectiva declarada en el entrenamiento es de 192 word pieces, muy por debajo del maximo teorico del modelo base (512 tokens). El repositorio ocupa 1,1 GB y los pesos se distribuyen en formato safetensors.

El modelo es relevante para quien necesite extraccion de entidades en dominios informativos y legales de Pakistan en ingles, un nicho escasamente cubierto por los NER multilingues genericos. Su principal advertencia es la calidad de las etiquetas: solo 186 de las 18.245 frases de entrenamiento estan verificadas por humanos, y el resto procede de etiquetado automatico con reglas, gazetteers y predicciones de spaCy. La licencia figura como "other", lo que obliga a revisar los terminos antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (XLM-RoBERTa base), token classification con etiquetado BIO |
| Parametros totales | 277.484.585 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 192 word pieces en entrenamiento; maximo del modelo base no especificado en la informacion disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | other (modelo base FacebookAI/xlm-roberta-base bajo licencia MIT) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de FacebookAI/xlm-roberta-base, un transformer encoder-only entrenado originalmente con objetivos enmascarados sobre corpus multilingues. Sobre esa base se anade una cabeza de clasificacion token a token con 20 tipos de entidad mas las etiquetas BIO correspondientes (B- y I- por tipo, mas O). El etiquetado es plano, sin entidades anidadas, y se aplica la regla de que el span mas largo con sentido prevalece. Solo el primer word piece de cada palabra lleva etiqueta; el resto de piezas y los spans enmascarados se ignoran en la funcion de perdida.

El entrenamiento consistio en 4 epocas con learning rate 3e-5, warmup del 10 por ciento y decaimiento lineal, batch size 16, weight decay 0.01, precision fp16, longitud maxima de 192 word pieces y semilla 42, sobre una NVIDIA Tesla T4 de 16 GB en Google Colab. Los datos finales suman 18.245 frases: 5.390 sinteticas generadas por plantillas con etiquetas exactas (telefonos, CNIC, importes, porcentajes, fechas y horas), 9.516 etiquetadas automaticamente y consideradas fiables, 2.974 etiquetadas automaticamente con spans inciertos enmascarados de la perdida, 186 verificadas por humanos y 179 etiquetadas por un asistente de IA sin verificacion humana. Las etiquetas automaticas provienen de un pipeline de reglas regex, gazetteers y predicciones borrador de spaCy, seguidas de correcciones basadas en reglas. El split entre entrenamiento y test se hizo a nivel de documento y se eliminaron frases casi duplicadas para evitar fuga de datos. Las frases verificadas por humanos se repitieron 3 veces y las etiquetadas por IA 2 veces, dado su bajo peso relativo.

## Capacidades

- Reconocimiento de entidades nombradas en texto en ingles con 20 tipos: PERSON, CITY, PROVINCE_REGION, COUNTRY, LANDMARK_FACILITY, GOVERNMENT_BODY, POLITICAL_PARTY, ORGANIZATION, EDUCATIONAL_INSTITUTION, COURT_LEGAL_BODY, LAW_ACT, EVENT, MEDIA_OUTLET, SPORTS_TEAM, DATE, TIME, MONEY, PERCENT, PHONE_NUMBER e ID_NUMBER.
- Etiquetado plano (sin entidades anidadas) con criterio de span mas largo con sentido.
- Normalizacion de titulos: Mr, Dr o Justice no forman parte de PERSON.
- Distincion entre entidades y menciones genericas: "High Court" se etiqueta como COURT_LEGAL_BODY, pero "the court" no se considera entidad.
- Deteccion de duraciones como DATE (por ejemplo, "two weeks").
- Extraccion de datos estructurados de contacto e identificacion (telefono y CNIC) solo validada sobre datos sinteticos.
- Integracion con el pipeline `token-classification` de HuggingFace Transformers usando `aggregation_strategy="first"`, que coincide con el esquema de entrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es un modelo discriminativo de clasificacion de tokens.
- Capacidad multilingue no validada: aunque el modelo base es multilingue, este ajuste fino se entreno y evaluo unicamente con texto en ingles.

## Casos de uso

- Extraccion de entidades en noticias pakistanies en ingles: el modelo identifica personas, partidos politicos, medios, provincias y organismos publicos en titulares y cuerpos de noticia de Dawn o Express Tribune, los dominios mayoritarios del corpus de entrenamiento (58 por ciento del texto real).
- Procesamiento de sentencias y documentacion judicial: con tipos como COURT_LEGAL_BODY y LAW_ACT, permite indexar resoluciones del Tribunal Supremo y enlazar citas legales con entidades, aunque el rendimiento en LAW_ACT es bajo (F1 de 0.48 en la muestra aleatoria y 0.42 en la muestra enriquecida).
- Enriquecimiento de articulos de Wikipedia y Wikinews: el 18 por ciento del texto real proviene de fuentes abiertamente licenciadas, por lo que el modelo es adecuado para poblar grafos de conocimiento con entidades geopoliticas y organizativas de Pakistan.
- Construccion de pipelines de monitoreo de medios: clasificacion y agregacion de menciones a partidos, organismos y medios para cuadros de mando editoriales, aprovechando el F1 de 0.91 en MEDIA_OUTLET y 0.88 en POLITICAL_PARTY.
- Prototipado rapido de sistemas de extraccion de informacion: al ser un modelo de 277 millones de parametros y 1,1 GB, se puede desplegar en una sola GPU consumer para validar un producto antes de invertir en anotacion humana o en un modelo mayor.
- Punto de partida para ajuste fino adicional: el autor lo presenta explicitamente como base para seguir entrenando; un equipo con datos anotados de un dominio concreto (por ejemplo, economia o deportes) puede corregir los tipos debiles como ORGANIZATION (F1 de 0.45) o LANDMARK_FACILITY (F1 de 0.36).
- Extraccion de importes y porcentajes en textos financieros: MONEY alcanza F1 de 0.94 en la muestra aleatoria, lo que lo hace util para tabulaciones de presupuestos o ayudas publicas citadas en prensa.
- Deteccion de telefonos y CNIC en documentos sinteticos o formularios controlados: con F1 de 0.990 y 0.918 respectivamente en test sintetico, sirve para validar plantillas, aunque el autor advierte que no esta validado para redaccion de datos personales en produccion.

## Benchmarks y rendimiento

Evaluacion a nivel de entidad con coincidencia exacta de inicio, fin y tipo (micro F1):

| Conjunto de test | Frases | Entidades | Micro F1 |
|---|---|---|---|
| Verificado por humanos, muestra aleatoria | 200 | 426 | 0.816 |
| Verificado por humanos, enriquecido en tipos debiles | 100 | 338 | 0.812 |
| Ambos conjuntos verificados agrupados | 300 | 764 | 0.814 (precision 0.806, recall 0.822) |
| Benchmark oculto de los organizadores | 820 | no disponible | 0.938 |

Resultados por tipo en la muestra aleatoria (F1), con la cifra de la muestra enriquecida cuando se dispone de ella:

| Tipo de entidad | F1 (muestra aleatoria) | F1 (muestra de tipos debiles) |
|---|---|---|
| MONEY | 0.94 | no disponible |
| PERSON | 0.92 | no disponible |
| MEDIA_OUTLET | 0.91 | no disponible |
| POLITICAL_PARTY | 0.88 | no disponible |
| PROVINCE_REGION | 0.87 | no disponible |
| COUNTRY | 0.86 | no disponible |
| COURT_LEGAL_BODY | 0.86 | no disponible |
| GOVERNMENT_BODY | 0.71 | 0.84 |
| LAW_ACT | 0.48 | 0.42 |
| ORGANIZATION | 0.45 | 0.30 |
| LANDMARK_FACILITY | 0.36 | 0.64 |

En tipos raros, las puntuaciones perfectas o casi perfectas de la muestra aleatoria se apoyan en 2 a 5 entidades y el propio autor recomienda ignorarlas. Para PHONE_NUMBER e ID_NUMBER no hay datos reales de test; en un test sintetico de 188 frases con plantillas nuevas, formatos de numero no vistos y numeros senuelo, el F1 fue de 0.990 y 0.918 respectivamente, cifras que el autor califica de optimistas por la cercania a las plantillas de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,6 GB para los pesos (277 millones de parametros) mas el overhead de activaciones y del runtime; en la practica, menos de 2 GB en la mayoria de configuraciones.
- VRAM estimada en fp32: aproximadamente 1,1 GB solo para pesos, mas overhead.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; el modelo se entreno en una NVIDIA Tesla T4 de 16 GB. Funciona tambien en A100, H100, L4, RTX 4090, RTX 3090 y RTX 3060.
- Cabe holgadamente en GPU consumer, incluidas GTX 1660, RTX 2060 y superiores.
- Despliegue: compatible con HuggingFace Transformers (`pipeline("token-classification")`), con Text Generation Inference no aplica por ser un modelo encoder-only, y con vLLM no esta documentado en la informacion disponible. La conversion a ONNX o a llama.cpp no se menciona en la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera un throughput alto en GPU modernas, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| xlm-roberta-base-pakistani-ner | 277 M | 192 word pieces (entrenamiento) | en | other | NER especifico de Pakistan, 20 tipos |
| FacebookAI/xlm-roberta-base | 278 M | 512 tokens | 100 idiomas | MIT | Modelo base sin cabeza NER |
| dslim/bert-base-NER | 108 M | 512 tokens | en | MIT | NER generico en ingles, 4 tipos (PER, LOC, ORG, MISC) |
| spaCy `en_core_web_trf` | no disponible | 512 tokens | en | MIT | NER generico en ingles, 18 tipos |

La comparacion con alternativas genericas es cualitativa: los modelos NER genericos cubren menos tipos y no distinguen categorias especificas de Pakistan como PROVINCE_REGION, COURT_LEGAL_BODY o LAW_ACT, pero cuentan con mas datos de anotacion humana y estan disponibles bajo licencias permisivas. No se han publicado comparaciones directas con estos modelos en la informacion disponible.

## Limitaciones y advertencias

- La mayoria de las etiquetas de entrenamiento son automaticas: solo 186 de las 18.245 frases estan verificadas por humanos, lo que introduce ruido sistematico en el aprendizaje.
- Un asistente de IA redacto las primeras correcciones de las frases verificadas y etiqueto las 179 frases adicionales de entrenamiento, que no fueron revisadas por humanos.
- Los conjuntos de test son pequenos: las puntuaciones de tipos raros se apoyan en 2 a 18 entidades y son ruidosas; diferencias inferiores a 0,02 de F1 estan dentro del margen de error.
- Los conjuntos de test no son completamente ciegos: se estudiaron categorias de error sobre ellos, aunque ningun texto de test se anadio al entrenamiento.
- PHONE_NUMBER e ID_NUMBER solo se entrenaron con ejemplos sinteticos y no se han comprobado sobre documentos reales; el autor excluye explicitamente el uso para redaccion de datos personales en produccion.
- No validado fuera de los dominios de noticias, justicia y Wikipedia, ni para identificar o perfilar individuos.
- El modelo solo se evaluo en ingles; el soporte multilingue del modelo base no se ha trasladado a este ajuste fino.
- El etiquetado es plano: no detecta entidades anidadas.
- La licencia figura como "other" y no se detallan sus terminos, por lo que el uso comercial requiere verificacion previa con el autor.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si de falsos positivos y negativos en la clasificacion, especialmente en ORGANIZATION, LAW_ACT y LANDMARK_FACILITY.
- Sesgos conocidos: no documentados en la model card; la composicion del corpus (prensa, justicia y Wikipedia pakistanies) puede sobrerrepresentar ciertas instituciones y actores publicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MuhammadSarimUmer/xlm-roberta-base-pakistani-ner
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Repositorio de codigo del proyecto: mencionado en la model card como "code repository", sin URL publica en la informacion disponible
- Paper o publicacion tecnica: no disponible
- Demo: no disponible
