# ESAUCS/EcoBECS-Word-Embeddings

## Resumen

EcoBECS Word Embeddings es una colección de 27 modelos de embeddings de palabras estáticos en castellano, entrenados y ajustados sobre corpus especializados de economía, banca y finanzas. El desarrollo corre a cargo de ESAUCS en el marco del proyecto EcoBECS (Economic and Banking Extended Corpus & Sources) en INFOTEC. No se trata de un modelo generativo: son representaciones vectoriales léxicas pensadas para tareas de procesamiento del lenguaje natural económico-financiero en español.

El paquete cubre tres familias de arquitectura (FastText, Word2Vec y GloVe) con objetivos de entrenamiento Skip-gram y CBOW, y ofrece variantes de ventana de contexto (5, 8 y 10), dimensionalidad (100, 200 y 300) y número de épocas (10, 15 y 20). Cada combinación se distribuye en dos regímenes: `base`, entrenado desde cero sobre los corpus del dominio, y `fined`, adaptado o ajustado sobre representaciones previas.

Su relevancia radica en la especialización: frente a embeddings genéricos, estos vectores se construyen sobre informes trimestrales del Banco de México, el catálogo de clasificación JEL y resúmenes de artículos y revistas de economía en español, lo que puede mejorar la similitud semántica de terminología técnica financiera. La licencia CC BY 4.0 facilita su uso comercial con atribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastText (Skip-gram y CBOW), Word2Vec (Skip-gram y CBOW) y GloVe; embeddings estáticos |
| Parámetros totales | no disponible (depende del vocabulario y la dimensionalidad de cada variante) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de entrenamiento configurable de 5, 8 o 10 tokens |
| Tipos de cuantizacion | no disponible; se distribuyen vectores en coma flotante en formato binario de FastText |
| Idiomas soportados | es (castellano) |
| Licencia | cc-by-4.0 |
| Formato de pesos | `.bin` (formato nativo de FastText, cargable con `load_facebook_vectors`); se mencionan también Word2Vec y GloVe en la colección |

## Arquitectura y entrenamiento

La colección agrupa modelos de embeddings estáticos, no transformers. Las familias incluidas son FastText con objetivos Skip-gram y CBOW, Word2Vec con Skip-gram y CBOW, y GloVe. La convención de nombres codifica hiperparámetros: `EcoBECS_<arquitectura>_ws<ventana>_dim<dimensiones>_ep<epocas>_2026_<variante>`, con ventanas de 5, 8 o 10, dimensiones de 100, 200 o 300 y 10, 15 o 20 épocas. La variante `base` corresponde a entrenamiento desde cero sobre los corpus del dominio, mientras que `fined` indica adaptación o ajuste fino sobre embeddings previos.

Los datos de entrenamiento proceden de la colección EcoBECS: informes trimestrales de inflación y política monetaria del Banco de México (DOI 10.57967/hf/11905), el catálogo del sistema de clasificación JEL en español e inglés (DOI 10.57967/hf/11904), resúmenes de artículos de investigación económica en español (`CB_abstracts_papers_ES`, DOI 10.57967/hf/11899) y resúmenes de revistas de economía en español (`CB_abstracts_journals_ES`, DOI 10.57967/hf/11900). No se especifica en la información disponible el número total de tokens, la composición exacta del vocabulario ni si se aplicaron técnicas de subword más allá de las propias de FastText. Tampoco se detalla el proceso de ajuste fino de las variantes `fined`.

## Capacidades

- Representación vectorial de palabras en español con especialización en terminología económica, financiera y bancaria.
- Similitud semántica y recuperación de vecinos léxicos mediante `most_similar`, útil para expansión de consultas y normalización terminológica.
- Manejo de palabras fuera de vocabulario en las variantes FastText gracias a la información de subword (n-gramas de caracteres).
- Cálculo de analogías léxicas y relaciones semánticas entre términos del dominio.
- Extracción de características para clasificación de textos, clustering y análisis de temas sobre documentos económicos.
- Soporte de múltiples configuraciones de dimensionalidad y ventana para ajustar el equilibrio entre precisión y coste computacional.
- No dispone de generación de texto, razonamiento, tool calling, capacidades de agente, visión ni audio: es un modelo puramente de representación léxica.

## Casos de uso

- Búsqueda semántica en documentación financiera: indexar informes del Banco de México y resúmenes de artículos, y usar los vectores para recuperar documentos afines a una consulta sobre inflación, política monetaria o riesgo bancario.
- Clasificación temática de literatura económica: emplear los embeddings como características de entrada en clasificadores que asignen códigos JEL a resúmenes de artículos, aprovechando el corpus JEL del proyecto.
- Expansión de consultas en motores de búsqueda internos: generar sinónimos y términos relacionados del dominio (por ejemplo, variantes de "inflación" o "liquidez") para mejorar el recall en bases documentales especializadas.
- Normalización y enriquecimiento de vocabularios controlados: agrupar términos financieros equivalentes o cercanos y construir tesauros específicos para banca central y economía.
- Análisis exploratorio de corpus: clustering de términos y análisis de proximidad semántica para descubrir temas emergentes en series de informes trimestrales.
- Sistemas de recomendación de publicaciones: calcular similitud entre resúmenes de artículos y perfiles de interés de investigadores o analistas.
- Preprocesamiento para modelos mayores: usar los vectores como capa de inicialización o características auxiliares en pipelines de NLP económico en español donde un transformer grande resulte costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: los modelos de embeddings estáticos son ligeros y pueden ejecutarse en CPU sin GPU; el coste depende del tamaño del vocabulario y de la dimensionalidad (100, 200 o 300).
- VRAM estimada: no disponible; para las variantes de 300 dimensiones el uso de memoria es moderado y suele caber en GPU de gama consumer, aunque no se proporcionan cifras exactas.
- GPU recomendadas: no se especifican; para cargas de producción a gran escala se puede usar cualquier GPU moderna, pero no hay datos publicados de throughput ni latencia.
- Despliegue: carga mediante `gensim` con `load_facebook_vectors` para FastText y las APIs correspondientes de `gensim` para Word2Vec y GloVe; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a embeddings estáticos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Dimensionalidad | Contexto | Licencia | Especialización |
|---|---|---|---|---|---|---|
| EcoBECS Word Embeddings | FastText, Word2Vec, GloVe estáticos | es | 100, 200, 300 | ventana 5-10 | CC BY 4.0 | Economía, banca y finanzas |
| FastText preentrenado en español (variantes públicas) | FastText estático | es | variable | ventana configurable | según distribución | General |
| Word2Vec/GloVe en español de uso común | Estáticos | es | 100-300 | ventana configurable | según distribución | General |
| BETO / RoBERTa en español | Transformer contextual | es | 768 | 512 tokens | según modelo | General |

La comparativa con modelos genéricos es cualitativa: los embeddings contextuales tipo BETO ofrecen representaciones dependientes del contexto y mayor rendimiento en tareas complejas, mientras que EcoBECS prioriza especialización léxica y bajo coste computacional. No se dispone de métricas comparativas publicadas.

## Limitaciones y advertencias

- Al ser embeddings estáticos, cada palabra tiene un único vector independientemente del contexto; no capturan polisemia ni matices sintácticos.
- El vocabulario y los sesgos reflejan los corpus de origen (informes del Banco de México, catálogo JEL y resúmenes académicos), por lo que pueden estar infrarepresentados registros coloquiales u otros dominios.
- Cobertura limitada al castellano; no se declaran otros idiomas.
- Riesgo de similitudes engañosas en términos poco frecuentes del dominio, especialmente en variantes con ventanas pequeñas.
- No se documentan evaluaciones de sesgo, robustez ni métricas intrínsecas o extrínsecas en la información disponible.
- La licencia CC BY 4.0 permite uso comercial con atribución; es necesario citar la autoría y respetar los términos de los corpus de origen.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia pública de validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ESAUCS/EcoBECS-Word-Embeddings
- Dataset: https://huggingface.co/datasets/ESAUCS/Banxico_Quarterly_Reports_ES (DOI: 10.57967/hf/11905)
- Dataset: https://huggingface.co/datasets/ESAUCS/JEL_Classification_Catalog (DOI: 10.57967/hf/11904)
- Dataset: https://huggingface.co/datasets/ESAUCS/CB_abstracts_papers_ES (DOI: 10.57967/hf/11899)
- Dataset: https://huggingface.co/datasets/ESAUCS/CB_abstracts_journals_ES (DOI: 10.57967/hf/11900)
