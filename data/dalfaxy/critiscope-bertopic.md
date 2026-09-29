# Dalfaxy/critiscope-bertopic

## Resumen

CritiScope — BERTopic sobre críticas de Allociné no es un modelo de lenguaje generativo, sino un conjunto de artefactos de modelado de temas (topic modeling) publicado por el usuario Dalfaxy bajo el identificador `Dalfaxy/critiscope-bertopic`. El repositorio contiene un modelo BERTopic serializado en safetensors, las tablas de temas y de sentimiento asociadas, el corpus de críticas empleado y sus embeddings precalculados. Se trata, por tanto, de un artefacto de análisis de datos en francés, no de un modelo conversacional con pesos transformer entrenados desde cero.

El corpus de partida son 19112 críticas del split de entrenamiento del dataset `tblard/allocine`, tomadas como muestra aleatoria. Sobre ese texto se calcularon embeddings con `intfloat/multilingual-e5-large-instruct`, aplicando una instrucción orientada al género cinematográfico y al tema (documentada en el fichero `embedding.json`). El pipeline BERTopic resultante identifica 29 temas, con un 37 % de críticas clasificadas como outliers (fuera de clúster) antes de aplicar `reduce_outliers`. La relación entre tema y sentimiento se cuantifica con una V de Cramér de 0,51, y se identifican 5 temas significativamente más negativos y 16 más positivos.

Su relevancia es práctica: sirve como base reproducible para una aplicación de análisis de opinión sobre críticas de cine (la demo `CritiScope` alojada en HuggingFace Spaces) y como ejemplo de pipeline BERTopic con reasignación de outliers, etiquetado automático de temas y cruce tema × sentimiento. El repositorio tiene 0 descargas y 0 likes, un tamaño de 0,1 GB, y no declara licencia ni pipeline en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline BERTopic: embeddings transformer + reduccion dimensional + clustering + c-TF-IDF para descripcion de topicos |
| Parametros totales | No aplica al artefacto (no es un modelo generativo). El modelo de embeddings subyacente es `intfloat/multilingual-e5-large-instruct`; numero de parametros no disponible en la informacion proporcionada |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (limitada por el encoder de embeddings utilizado) |
| Tipos de cuantizacion | No aplica / no disponible |
| Idiomas soportados | Frances (fr) |
| Licencia | No disponible |
| Formato de pesos | safetensors (serializacion del modelo BERTopic) |
| Numero de temas | 29 |
| Tamano del corpus | 19112 criticas de `tblard/allocine` (split train, muestra aleatoria) |
| Modelo de embeddings | `intfloat/multilingual-e5-large-instruct` con instruccion especifica de genero/tema |
| Outliers antes de reasignacion | 37 % de las criticas |
| Asociacion tema x sentimiento | V de Cramer = 0,51 |
| Tamano del repositorio | 0,1 GB |
| Libreria | bertopic |

## Arquitectura y entrenamiento

El artefacto sigue la arquitectura estandar de BERTopic, que no entrena un transformer propio: parte de representaciones densas producidas por un encoder de frases (`intfloat/multilingual-e5-large-instruct`), las proyecta a un espacio de menor dimensionalidad, agrupa los documentos en clústeres y genera descripciones de tópico mediante c-TF-IDF, que pondera la importancia de cada término dentro de un clúster frente al resto. En este caso, los embeddings se calcularon aplicando una instrucción orientada al género cinematográfico y al tema, un detalle crítico porque el modelo e5-instruct espera prefijos de instrucción concretos y su omisión degrada la calidad del espacio vectorial.

Sobre los 19112 documentos se obtienen 29 temas. El 37 % de las críticas queda fuera de clúster en la primera pasada, un porcentaje elevado que el autor corrige con la estrategia `reduce_outliers` de BERTopic, que reasigna documentos atípicos al tópico más probable. Dos innovaciones prácticas destacan en el pipeline: por un lado, el cruce explícito entre tópico y sentimiento, cuantificado con la V de Cramér (0,51), que indica una asociación moderada entre ambos ejes y permite listar 5 temas significativamente más negativos y 16 más positivos; por otro, el etiquetado automático de los temas con el modelo `gemini-3.1-flash-lite`, cuyas etiquetas fueron validadas posteriormente mediante aprobación. No se especifican en la información disponible ni el número de tokens de entrenamiento (no hay entrenamiento supervisado en el sentido habitual), ni el uso de RLHF o DPO, que no aplican a este tipo de artefacto.

## Capacidades

- Modelado de temas no supervisado sobre texto en francés: agrupa críticas de cine en 29 tópicos interpretables.
- Inferencia sobre documentos nuevos: permite predecir el tema de una crítica inédita mediante `transform([texto], embeddings=...)`, siempre que se use el mismo modelo de embeddings y el mismo prefijo de instrucción.
- Descripción interpretable de tópicos: cada clúster viene acompañado de términos ponderados por c-TF-IDF y de una etiqueta generada automáticamente.
- Análisis de sentimiento acoplado al tema: tabla que vincula cada tópico con la polaridad observada, con 5 temas significativamente negativos y 16 positivos.
- Reasignación de outliers: incorpora `reduce_outliers` para reducir el 37 % inicial de documentos sin clúster.
- Recuperación de embeddings precalculados: el repositorio incluye los vectores del corpus, lo que evita recalcularlos.
- Capacidades multilingües: limitadas, el artefacto está etiquetado únicamente como idioma francés.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (visión, audio, modo thinking): no disponible.

## Casos de uso

- Monitorización de opinión de estrenos: tras el lanzamiento de una película, se codifican las críticas nuevas con `intfloat/multilingual-e5-large-instruct` (mismo prefijo) y se llama a `transform`; los temas que concentren polaridad negativa señalan qué aspectos (guion, fotografía, interpretación) están generando rechazo.
- Análisis retrospectivo de un catálogo: agrupar las 19112 críticas de Allociné en 29 tópicos permite caracterizar qué conversaciones dominan la crítica francesa y cruzar cada tópico con su V de Cramér frente al sentimiento para priorizar áreas de estudio.
- Investigación académica en procesamiento de lenguaje natural en francés: sirve como línea base reproducible de BERTopic sobre un corpus real de reseñas, con hiperparámetros, embeddings y tabla de outliers documentados.
- Etiquetado temático de reseñas de usuario: el repositorio puede usarse como clasificador de tópicos para enrutar reseñas hacia los equipos correspondientes (por ejemplo, quejas sobre proyección o sobre sonido).
- Alerta temprana de polémicas: identificar automáticamente qué tópicos tienen una proporción anómala de sentimiento negativo antes de que el volumen de críticas crezca, explotando la asociación tema-sentimiento medida.
- Enriquecimiento de paneles de analítica editorial: añadir una columna de tema inferido a bases de datos de críticas para segmentar informes por género cinematográfico o por aspecto de la película.
- Sistema de recomendación de contenido editorial: usar la distribución temática de las críticas para sugerir retrospectivas o artículos de fondo ligados a los tópicos más positivos.
- Demo interactiva y material docente: el Space `CritiScope` ilustra un pipeline completo de topic modeling con reasignación de outliers y etiquetado automático, útil para formación interna en ciencia de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta métricas de calidad de clustering (por ejemplo, coherencia de tópicos o pureza), ni comparaciones cuantitativas con otras configuraciones de BERTopic o con modelos alternativos. Las únicas cifras publicadas son descriptivas del propio pipeline: 29 temas, 37 % de outliers antes de reasignación, V de Cramér de 0,51 entre tema y sentimiento, 5 temas significativamente negativos y 16 positivos.

## Requisitos de hardware

- VRAM para inferencia: no publicada por el autor. Como estimación orientativa (no confirmada en la información disponible), al depender de un encoder tipo `e5-large` en precisión fp16, la codificación de nuevos textos requiere del orden de 2 a 4 GB de VRAM.
- GPU recomendadas: no disponibles. Cualquier GPU con suficiente memoria para el encoder de embeddings resulta suficiente; no se requiere hardware de clase A100/H100 para el uso previsto.
- GPU de consumo: previsiblemente viable en tarjetas consumer con 6 GB o más de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090). El cálculo de embeddings también puede ejecutarse en CPU, a costa de mayor latencia.
- Opciones de despliegue: la librería `bertopic` es la vía natural (`BERTopic.load("bertopic").transform(...)`), junto con `sentence-transformers` para generar los embeddings. No se han documentado despliegues con vLLM, TGI, llama.cpp ni Ollama, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles. Escalarán linealmente con el número de documentos a codificar y dependerán del hardware; los embeddings del corpus ya vienen precalculados en el repositorio, de modo que el coste solo se paga al inferir sobre textos nuevos.

## Comparativa con modelos similares

| Artefacto | Tipo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Dalfaxy/critiscope-bertopic` | BERTopic sobre criticas Allocine | No aplica (usa `intfloat/multilingual-e5-large-instruct`) | No disponible | Frances | No disponible | HuggingFace (0 descargas, 0 likes) |
| LDA clasico (implementaciones tipo gensim/scikit-learn) | Modelo probabilistico de topicos | No aplica | No aplica | Depende del corpus | Variable (habitualmente permisiva) | Ampliamente disponible |
| Top2Vec | Embeddings + clustering + c-TF-IDF | No aplica | No aplica | Depende del encoder elegido | Permisiva en el proyecto original | GitHub / PyPI |
| NMF (factorizacion no negativa) | Topic modeling sobre bolsa de palabras | No aplica | No aplica | Depende del corpus | Variable | scikit-learn |

La comparacion cuantitativa de rendimiento entre estas alternativas no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: la ausencia de licencia impide asumir permisos de uso comercial. Es un riesgo legal relevante para cualquier integracion en produccion.
- Fuerte proporción de outliers: el 37 % de las críticas quedaba fuera de clúster antes de `reduce_outliers`; la reasignación mitiga el problema, pero puede introducir asignaciones forzadas en documentos que no pertenecen claramente a ningún tema.
- Dependencia estricta del prefijo de instrucción: si se codifica una crítica sin el mismo prefijo documentado en `embedding.json`, las predicciones de tema dejan de ser válidas. Es un error fácil de cometer al reutilizar el artefacto.
- Etiquetas de tema generadas por un modelo externo (`gemini-3.1-flash-lite`) y validadas por aprobación: la validación no equivale a una revisión humana sistemática, por lo que las etiquetas pueden inducir a error si se toman como descripciones canónicas de los tópicos.
- Sesgo de corpus: las críticas de Allociné provienen de un público y una línea editorial concretos. Los temas y la polaridad observados no son extrapolables a otras plataformas ni a otros países francófonos.
- Ámbito limitado a críticas de cine en francés: el repositorio está etiquetado únicamente con el idioma `fr`; no hay evidencia de funcionamiento en otros dominios ni idiomas.
- Interpretación de la asociación tema-sentimiento: la V de Cramér de 0,51 indica asociación, no causalidad, y las categorías "significativamente negativas o positivas" dependen del test estadístico empleado, no detallado en la información disponible.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe el riesgo equivalente de producir tópicos o etiquetas que parezcan plausibles sin corresponder a estructura real en los datos.
- Muestra aleatoria del split de entrenamiento: al no usarse el corpus completo ni un split de validación independiente, no hay garantía de generalización a críticas futuras.
- Repositorio sin tracción: 0 descargas y 0 likes, sin pipeline declarado, lo que dificulta contrastar su funcionamiento con experiencia de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dalfaxy/critiscope-bertopic
- Demo CritiScope (HuggingFace Spaces): https://huggingface.co/spaces/Dalfaxy/critiscope
- Dataset de origen: https://huggingface.co/datasets/tblard/allocine
- Modelo de embeddings: https://huggingface.co/intfloat/multilingual-e5-large-instruct
- BERTopic — sitio oficial: https://bertopic.org/
- BERTopic — documentación: https://maartengr.github.io/BERTopic/index.html
- BERTopic — documentación (Read the Docs): https://bertopic.readthedocs.io/en/latest/index.html
- BERTopic — repositorio en GitHub: https://github.com/MaartenGr/BERTopic
- BERTopic — sitio alternativo: https://bertopic.com/
