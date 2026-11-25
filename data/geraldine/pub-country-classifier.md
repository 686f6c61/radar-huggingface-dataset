# Geraldine/pub-country-classifier

## Resumen

El modelo `pub-country-classifier` es un clasificador multi-etiqueta de texto desarrollado por Geraldine (usuario de Hugging Face) que detecta los países mencionados explícitamente en el título y, opcionalmente, el resumen de una publicación científica. Se apoya en `jhu-clsp/mmBERT-base`, un encoder multilingüe de estilo ModernBERT, al que se le añade una cabeza sigmoidea de 247 salidas correspondientes a los países de OpenAlex (códigos ISO 3166-1 alpha-2 más `XK` para Kosovo). Resuelve un problema concreto de las bases de datos bibliográficas: la falta de indexación geográfica fiable en los metadatos de las publicaciones.

El modelo es relevante ahora porque automatiza una tarea que hasta hace poco requería revisión manual o reglas heurísticas frágiles, y lo hace en cinco idiomas (inglés, francés, español, alemán y portugués) con un rendimiento declarado de F1 micro 0,960 sobre el conjunto de test. Su tamaño contenido (unos 308 millones de parámetros) y su licencia Apache 2.0 lo hacen desplegable en infraestructura modesta, lo que resulta atractivo para bibliotecas, repositorios institucionales y proyectos de ciencia abierta que necesitan enriquecer metadatos a escala.

La propuesta encaja en el ecosistema de OpenAlex y en flujos de trabajo de biblioteconomía y ciencia de datos académicos. No obstante, conviene subrayar desde el principio que el modelo detecta menciones, no temáticas: una referencia de pasada a un país se predice igual que si fuera el área principal de estudio. Esa distinción es clave para interpretar correctamente sus salidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder multilingüe de estilo ModernBERT (`jhu-clsp/mmBERT-base`) con cabeza de clasificación multi-etiqueta sigmoidea de 247 salidas |
| Parametros totales | 307.720.183 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (longitud máxima de entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible (el repo publica safetensors en bf16; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en, fr, es, de, pt |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,3 GB) |

## Arquitectura y entrenamiento

El modelo parte de `jhu-clsp/mmBERT-base`, un encoder multilingüe de la familia ModernBERT que incorpora mejoras sobre BERT clásico como attention lineal en parte de las capas y mayor eficiencia en contextos largos. Sobre ese backbone se añade una cabeza de clasificación con activación sigmoidea para 247 etiquetas independientes, lo que permite predecir varias etiquetas simultáneas por documento (por ejemplo, `DE` y `AT` para un texto que menciona Alemania y Austria). La decisión final aplica un umbral uniforme de 0,5 a todas las etiquetas, según el fichero `thresholds.json` del repositorio.

El entrenamiento se realizó sobre el dataset `Geraldine/pub-country`, con 145.781 filas en el split de train, de las cuales el 24 % no contiene ningún país. Se entrenaron 2 épocas (unos 9.100 pasos) con batch efectivo de 32 (16 × 2 de acumulación de gradiente), learning rate 3e-5 con decaimiento lineal y warmup del 5 %, weight decay 0,01, gradient clipping 1,0, longitud máxima de 512 tokens, precisión bf16 y pérdida `BCEWithLogitsLoss`. El entrenamiento se ejecutó en una única NVIDIA A10G durante 1 hora y 24 minutos, con semilla 42. Las etiquetas de entrenamiento no son anotaciones humanas: provienen de reglas multilingües verificadas en dos pasos por un LLM, lo que constituye una supervisión débil y un caveat importante sobre la calidad del ground truth.

## Capacidades

- Clasificación multi-etiqueta de países mencionados explícitamente en texto científico, con cobertura de 247 países y territorios de OpenAlex.
- Detección de nombres de país, variantes ortográficas, gentilicios ("Kenyan", "brasileiro"), formas históricas y coloniales, y territorios dependientes.
- Procesamiento conjunto de título y resumen (concatenados con un salto de línea), con truncamiento a 512 tokens.
- Funcionamiento en cinco idiomas: inglés, francés, español, alemán y portugués.
- Discriminación de homónimos problemáticos en cierta medida: el modelo está entrenado para no predecir países en casos como *Anguilla anguilla*, Salvador de Bahía, New Jersey o Georgia (EE. UU.), aunque reconoce debilidades residuales en algunos de ellos.
- Salida de probabilidades por etiqueta, lo que permite ajustar el umbral según la aplicación (aunque el modelo se distribuye con umbral fijo de 0,5).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio: es un encoder de clasificación puro, no un modelo generativo.

## Casos de uso

- Indexación geográfica de bases de datos bibliográficas: el modelo puede procesar lotes de títulos y resúmenes de OpenAlex, Crossref o repositorios institucionales para rellenar el campo de país, que a menudo falta o es inconsistente en los metadatos originales. Su F1 micro de 0,960 sobre el test lo hace adecuado para enriquecimiento a gran escala con revisión humana posterior en los casos dudosos.
- Enriquecimiento de repositorios institucionales: universidades y bibliotecas pueden aplicar el modelo a sus registros para detectar publicaciones que mencionan países de interés (por ejemplo, para informes de cooperación internacional o análisis de producción científica por región).
- Análisis bibliométrico y estudios de ciencia global: investigadores que estudian la distribución geográfica de la producción científica pueden usar las predicciones como variable de análisis, teniendo en cuenta que miden menciones y no afiliaciones ni área de estudio.
- Filtrado y curación de colecciones: editoriales y agregadores pueden usar el clasificador para etiquetar automáticamente artículos por país mencionado y construir vistas temáticas o alertas geográficas.
- Preprocesamiento en pipelines de datos para LLM: el modelo puede actuar como etapa previa de etiquetado geográfico antes de alimentar un sistema RAG o un motor de búsqueda académica, aportando metadatos estructurados que el generador puede usar como filtro.
- Detección de sesgos geográficos en corpus: permite medir qué países aparecen en un conjunto de publicaciones y en qué proporción, útil para auditorías de representatividad en revistas o conferencias.
- Moderación y control de calidad de metadatos: puede señalar registros en los que la mención de país no coincide con la afiliación declarada, como paso de validación en flujos de ingestión.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test (7.954 obras), con umbral único de 0,5 y comparación contra las etiquetas finales del dataset (generadas por reglas y verificadas por LLM, no por anotadores humanos):

| Subconjunto | Precision | Recall | F1 micro | F1 macro | Precision del país top | Tasa de falsos positivos en filas sin país | n |
|---|---|---|---|---|---|---|---|
| all | 0,977 | 0,943 | 0,960 | 0,955 | 0,992 | 4,7 % | 7.954 |
| English | 0,985 | 0,960 | 0,973 | 0,965 | 0,996 | 4,2 % | 4.899 |
| French | 0,964 | 0,909 | 0,936 | 0,903 | 0,991 | 6,3 % | 1.070 |
| Spanish | 0,963 | 0,919 | 0,940 | 0,902 | 0,975 | 6,1 % | 933 |
| German | 0,965 | 0,913 | 0,938 | 0,887 | 0,988 | 3,2 % | 618 |
| Portuguese | 0,949 | 0,902 | 0,925 | 0,864 | 0,980 | 5,6 % | 434 |
| title only | 0,978 | 0,955 | 0,967 | 0,962 | 0,988 | 3,1 % | 534 |

El autor indica que 228 de los 246 países presentes en el test alcanzan F1 ≥ 0,9, y que los más débiles son territorios raros con entre 0 y 20 ejemplos de test (`MP`, `PM`, `JE`, `WF`, `MF`, `IO`, `KN`, `GE`), por lo que sus métricas no son fiables. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un encoder de 308 millones de parámetros, en bf16 requiere aproximadamente 0,6 GB de pesos; en fp32, unos 1,2 GB. Con overhead de activaciones y tokenizador, cabe holgadamente en 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una NVIDIA A10G, T4, L4 o RTX 3060 en adelante funcionan sin problema. Para lotes grandes, una A100 o H100 permiten mayor throughput, aunque no son necesarias.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 4 GB o más (RTX 3050, RTX 4060, etc.), e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con PyTorch (uso documentado en la model card), y por extensión `optimum`/ONNX Runtime, TorchServe o un endpoint de Hugging Face Inference. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI, que están orientadas a modelos generativos y no a encoders de clasificación.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El entrenamiento en una A10G durante 1 h 24 para 2 épocas sobre 145.781 filas sugiere un throughput de inferencia alto, pero no se publican cifras concretas.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con otros clasificadores de país en la información proporcionada. Como referencia estructural, se puede comparar con su modelo base y con alternativas genéricas de clasificación multilingüe:

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Geraldine/pub-country-classifier` | 307,7 M | 512 tokens | Clasificación multi-etiqueta de 247 países | Apache 2.0 | Hugging Face |
| `jhu-clsp/mmBERT-base` | no disponible | no disponible | Encoder multilingüe base (sin cabeza de clasificación) | no disponible | Hugging Face |
| Clasificadores NER geopolíticos genéricos | variable | variable | Extracción de entidades geográficas | variable | variable |

No se han identificado en la información disponible modelos directamente comparables en la tarea específica de detección de países mencionados en metadatos científicos con cobertura de 247 países y cinco idiomas.

## Limitaciones y advertencias

- Supervisión débil: las etiquetas de entrenamiento y test provienen de reglas verificadas por un LLM, sin anotación humana. El propio autor advierte que el test contiene un pequeño porcentaje de ruido y que algunas "errores" son predicciones correctas que la referencia no recoge.
- Solo menciones explícitas: un país referido únicamente mediante una ciudad o región no se detecta de forma fiable (por ejemplo, "Nairobi" puede predecir `KE` con 0,87, pero es una generalización fuera de la definición).
- Mención no equivale a temática: una referencia de pasada se predice igual que el área principal de estudio, lo que limita su uso para determinar el foco geográfico de un artículo.
- Puntos débiles conocidos: nombres de idiomas ("Romanian dialects" predice `RO` con 0,91) y algunos homónimos límite ("Bermuda grass").
- Idiomas: entrenado en cinco lenguas; otros idiomas pueden funcionar, pero sin garantías ni evaluación.
- Cobertura desigual: los territorios raros con pocos ejemplos de test tienen métricas no fiables, por lo que las predicciones sobre ellos deben tratarse con cautela.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene conservar el aviso de licencia y ser consciente de que el modelo se distribuye sin garantías.
- Umbral fijo de 0,5: no se han calibrado umbrales por país, lo que puede penalizar etiquetas poco frecuentes en aplicaciones con requisitos de precisión muy altos.
- Para producción, se recomienda validación humana en los casos de baja confianza y monitorización de la tasa de falsos positivos en los idiomas distintos del inglés, donde el recall baja hasta 0,902 en portugués.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Geraldine/pub-country-classifier
- Dataset de entrenamiento: https://huggingface.co/datasets/Geraldine/pub-country
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Código y metodología completa (en francés): https://github.com/gegedenice/country-classifier
