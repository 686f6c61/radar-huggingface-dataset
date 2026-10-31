# djnsfull/sentiment-news-1.0

## Resumen

Sentiment-news-1.0 es un modelo de clasificacion de texto especializado en analisis de sentimiento de noticias en idioma indonesio (bahasa Indonesia). Ha sido desarrollado por el usuario djnsfull y publicado en HuggingFace como un fine-tuning del modelo IndoBERT-Large-P2 de IndoBenchmark, un encoder tipo BERT entrenado especificamente para lenguas de Indonesia.

El modelo resuelve el problema de determinar automaticamente la polaridad sentimental (positiva, negativa o neutra, presumiblemente) de titulares y articulos de prensa en indonesio, una tarea relevante para monitorizacion de medios, analisis de opinion publica y sistemas de inteligencia competitiva en mercados de habla indonesia.

Su relevancia es principalmente de nicho: al basarse en IndoBERT-Large-P2, hereda un rendimiento solido en tareas de comprension del indonesio, y su tamano contenido (unos 335 millones de parametros, 1,3 GB en safetensors) lo hace desplegable en hardware modesto, incluido el runtime Text Embeddings Inference. Dado que la model card es minima, gran parte de los detalles de entrenamiento y evaluacion no estan disponibles publicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer) |
| Parametros totales | 335.144.963 |
| Parametros activos | no disponible (no es MoE; todos los parametros estan activos) |
| Longitud de contexto | no disponible (el modelo base IndoBERT-Large suele usar 512 tokens, pero no esta confirmado en la ficha) |
| Tipos de cuantizacion | no disponible (pesos en precision original, sin versiones cuantizadas publicadas) |
| Idiomas soportados | Indonesia (id) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de indobert/indobert-large-p2, un encoder transformer de arquitectura BERT-Large con aproximadamente 335 millones de parametros. IndoBERT-Large-P2 fue preentrenado por IndoBenchmark sobre corpus en indonesio e ingles, y este modelo adapta esa representacion a la tarea de clasificacion de sentimiento en noticias mediante una cabeza de clasificacion sobre el token [CLS], el esquema estandar en BERT.

Los detalles del proceso de entrenamiento no estan disponibles: no se ha publicado el dataset empleado (posiblemente un corpus de noticias en indonesio etiquetado por sentimiento), el numero de epocas, la tasa de aprendizaje, ni si se uso validacion cruzada. Tampoco consta el numero de clases exacto del clasificador, aunque por la etiqueta "sentiment-analysis" lo habitual es un esquema de 2 o 3 clases. No hay indicios de tecnicas avanzadas como RLHF o DPO, que no aplican a encoders de clasificacion.

## Capacidades

- Clasificacion de sentimiento de textos en indonesio, optimizada para contenido de noticias (titulares, resumenes, parrafos informativos).
- Clasificacion de noticias (news-classification), segun las etiquetas del repositorio.
- Integracion estandar con la libreria transformers de HuggingFace mediante el pipeline `text-classification`.
- Compatibilidad con Text Embeddings Inference (TEI) para despliegue eficiente.
- Compatibilidad con endpoints de inferencia de HuggingFace (endpoints_compatible).
- No soporta generacion de texto, razonamiento, codigo, vision ni tool calling: es un modelo encoder puramente discriminativo.
- Capacidades multilingues: limitadas al idioma para el que fue ajustado (indonesio); el modelo base tenia cierta exposicion al ingles, pero el rendimiento en otros idiomas no esta documentado.

## Casos de uso

- Monitorizacion de medios en Indonesia: procesar flujos de titulares de prensa en tiempo real para detectar el tono de la cobertura sobre empresas, marcas o temas politicos, aprovechando la especializacion del modelo en texto periodistico.
- Analisis de sentimiento financiero: alimentar sistemas de trading o alertas con el sentimiento agregado de noticias economicas en bahasa Indonesia, dado que los encoders BERT ofrecen inferencia rapida y de bajo coste por documento.
- Inteligencia competitiva: clasificar automaticamente grandes volumenes de articulos sobre competidores en el mercado indonesio y priorizar los de tono negativo para revision humana.
- Filtrado y priorizacion de contenidos: en agregadores de noticias, ordenar o etiquetar articulos por polaridad para personalizar feeds o detectar contenido sensacionalista.
- Investigacion en ciencias sociales: estudiar la evolucion del tono de la prensa indonesia en periodos concretos (elecciones, crisis) mediante procesamiento por lotes offline.
- Moderacion y analisis de opinion publica: complementar el analisis de comentarios o reacciones derivadas de noticias, aunque el modelo esta afinado sobre texto periodistico y su rendimiento en lenguaje coloquial de redes sociales no esta verificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud, F1 ni comparaciones con otros modelos de sentimiento en indonesio.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 1,4-1,5 GB en FP32 para los pesos (1,3 GB en safetensors), mas overhead de activaciones; con cuantizacion a INT8 se reduciria a aproximadamente 0,4 GB, aunque no hay versiones cuantizadas publicadas oficialmente.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente; por ejemplo, una RTX 3060, T4 o superior. No se requiere hardware de gama alta tipo A100/H100 para inferencia.
- Cabe comodamente en GPUs de consumo (RTX 3060/4060 o superiores) e incluso es ejecutable solo en CPU, dado el tamano moderado del modelo, aunque con mayor latencia.
- Opciones de despliegue: transformers (PyTorch) de HuggingFace, HuggingFace Inference Endpoints, Text Embeddings Inference (TEI, segun la etiqueta del repositorio), y soluciones genericas de serving de modelos encoder. La compatibilidad con llama.cpp u Ollama no esta documentada y no es habitual para modelos BERT.
- Latencia y throughput: no disponibles; como referencia, un BERT-Large en GPU de consumo suele procesar decenas a cientos de secuencias por segundo en batch, pero no hay cifras oficiales para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Idioma | Licencia | Contexto |
|---|---|---|---|---|---|
| djnsfull/sentiment-news-1.0 | 335 M | Sentimiento de noticias | Indonesia | Apache 2.0 | no disponible |
| indobenchmark/indobert-large-p2 (base) | ~335 M | Modelo base multi-tarea | Indonesia/ingles | MIT | 512 tokens (según documentación del modelo base) |
| indolem/indobert-base-uncased | ~124 M | Modelo base multi-tarea | Indonesia | MIT | 512 tokens (según documentación del modelo base) |
| nlptown/bert-base-multilingual-uncased-sentiment | ~168 M | Sentimiento (reviews) | Multilingue (incluye indonesia) | Apache 2.0 | 512 tokens |

Comparado con su modelo base, sentiment-news-1.0 aporta especializacion en sentimiento de noticias a cambio de perder la versatilidad multi-tarea. Frente a alternativas multilingues como la de nlptown, ofrece un enfoque especifico para indonesio y texto periodistico, presumiblemente con mejor rendimiento en ese dominio, aunque sin benchmarks publicados que lo confirmen. Cabe senalar que los valores de contexto de los modelos base se indican a titulo orientativo y no constan en la ficha del modelo analizado.

## Limitaciones y advertencias

- La model card es practicamente vacia: no documenta dataset de entrenamiento, clases de salida, metricas de evaluacion ni limitaciones conocidas, lo que exige validacion propia antes de uso en produccion.
- Riesgo de sesgo: al entrenarse sobre noticias, el modelo puede heredar sesgos editoriales, tematicos o de origen del corpus periodistico utilizado, cuya composicion se desconoce.
- Riesgo de alucinacion: no aplicable como tal (es un clasificador), pero puede producir etiquetas de sentimiento erroneas en textos ambiguos, ironicos o con negaciones complejas, algo tipico de los modelos BERT.
- Limitacion de idioma: disenado para indonesio; su comportamiento en otros idiomas o en codigo mixto (indonesio coloquial, jerga de redes sociales) no esta verificado.
- Longitud de contexto limitada (tipicamente 512 tokens en arquitecturas BERT): los articulos largos deben truncarse o dividirse, lo que puede afectar al resultado.
- Licencia Apache 2.0: permite uso comercial, modificacion y distribucion sin restricciones significativas mas alla de conservar el aviso de licencia.
- Popularidad muy baja (31 descargas y 1 like en el momento de la ficha), por lo que no cuenta con validacion comunitaria amplia ni con reportes de fallos de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/djnsfull/sentiment-news-1.0
- Modelo base (IndoBERT-Large-P2): https://huggingface.co/indobenchmark/indobert-large-p2
- No se han encontrado enlaces adicionales (paper, blog, repositorio de codigo o demo) en la informacion disponible.
