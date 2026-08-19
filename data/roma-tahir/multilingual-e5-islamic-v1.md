# roma-tahir/multilingual-e5-islamic-v1

## Resumen

`roma-tahir/multilingual-e5-islamic-v1` es un modelo de embeddings densos para similitud semántica y recuperación de pasajes, obtenido mediante fine-tuning del modelo base `intfloat/multilingual-e5-base` (desarrollado por Microsoft). El autor, `roma-tahir`, ha adaptado el modelo al dominio de textos islámicos, entrenándolo con un conjunto de datos de 801 pares de frases y pasajes, utilizando la función de pérdida `MultipleNegativesRankingLoss`. El objetivo es mejorar la capacidad de recuperar fragmentos relevantes del Corán, hadices y comentarios religiosos a partir de preguntas formuladas en varios idiomas.

El modelo se distribuye a través de la librería `sentence-transformers` y tiene 278 millones de parámetros, con una dimensión de embeddings de 768. Está pensado para tareas de búsqueda semántica, similitud de frases y extracción de características en un contexto multilingüe, con especial énfasis en contenido islámico. Aunque no se especifican los idiomas soportados, el modelo base `multilingual-e5-base` cubre más de 100 lenguas, por lo que se espera que este fine-tuning mantenga esa cobertura. La relevancia de este modelo radica en su especialización para un dominio concreto, lo que puede mejorar significativamente la precisión de los sistemas de recuperación de información en entornos religiosos y académicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (XLM-RoBERTa, basado en `intfloat/multilingual-e5-base`) |
| Parametros totales | 278.043.648 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base `multilingual-e5-base` soporta 512 tokens) |
| Tipos de cuantizacion | no disponible (repo solo con pesos en safetensors) |
| Idiomas soportados | no disponible (el modelo base cubre 100+ idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `multilingual-e5-base`, un transformer de tipo XLM-RoBERTa con 12 capas, 12 cabezas de atención y una dimensión de embedding de 768. El fine-tuning se realizó con la librería `sentence-transformers` sobre un conjunto de datos de 801 pares (pregunta-pasaje), empleando la pérdida `MultipleNegativesRankingLoss`, que optimiza la similitud coseno entre pares positivos frente a negativos dentro del batch. No se dispone de información sobre la composición exacta del dataset ni sobre si se aplicaron técnicas adicionales como hard negative mining o data augmentation. El entrenamiento se realizó con el framework `Trainer` de HuggingFace (según el tag `generated_from_trainer`).

El modelo base `multilingual-e5-base` fue entrenado mediante un pipeline en dos etapas: pre-entrenamiento contrastivo sobre mil millones de pares de texto multilingües y fine-tuning con datasets etiquetados. Esta arquitectura produce embeddings densos de alta calidad para tareas de recuperación y similitud, y el fine-tuning específico aquí presentado busca adaptar esas representaciones al dominio islámico, donde los pasajes suelen incluir citas en árabe, urdu, inglés y otras lenguas.

## Capacidades

- Generacion de embeddings densos de 768 dimensiones para frases y parrafos.
- Similitud semantica entre consultas y pasajes, optimizada para contenido islamico (Coran, hadices, tafsir).
- Recuperacion de informacion multilingue: soporta consultas en arabe, urdu, ingles y otras lenguas (heredado del modelo base).
- Extraccion de caracteristicas para tareas de clustering, clasificacion y deduplicacion de textos.
- Compatible con la API de `sentence-transformers` y con `text-embeddings-inference` para despliegue en produccion.
- No es un modelo generativo; no produce texto nuevo, solo representaciones vectoriales.

## Casos de uso

- Busqueda semantica en bibliotecas digitales islamicas: permite indexar colecciones de hadices, tafsir y jurisprudencia, y recuperar pasajes relevantes a partir de preguntas en lenguaje natural. Por ejemplo, un usuario puede preguntar "¿Qué dice el Islam sobre la usura?" y el modelo devolvera los versiculos y narraciones mas pertinentes.
- Sistemas de preguntas y respuestas religiosas: integrado en un pipeline de RAG (retrieval-augmented generation), el modelo puede seleccionar los fragmentos que un LLM generativo utilizara para responder consultas teologicas o juridicas.
- Clasificacion tematica de textos islamicos: los embeddings permiten agrupar documentos por temas (oracion, ayuno, caridad, etc.) sin necesidad de etiquetas manuales.
- Deduplicacion y curaduria de contenido: detectar pasajes duplicados o similares en grandes corpus de traducciones y comentarios.
- Recomendacion de lecturas: dado un versiculo o hadiz, encontrar otros pasajes relacionados en diferentes idiomas.
- Moderacion de contenido en foros y redes sociales: identificar mensajes que citan fuentes religiosas y emparejarlos con su referencia canonica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no presenta metricas de evaluacion como MMLU, HumanEval o similares, ya que no es un modelo de lenguaje generativo sino de embeddings. Para tareas de recuperacion, no se proporcionan valores de nDCG, Recall@k o MRR.

## Requisitos de hardware

- VRAM estimada para inferencia: con 278 millones de parametros, los pesos en fp32 ocupan aproximadamente 1,1 GB (coincide con el tamano del repo). En fp16 se reduce a ~556 MB, y en int8 a ~278 MB. La inferencia puede ejecutarse en CPU con memoria RAM suficiente (>= 4 GB recomendado).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp16 (p. ej., NVIDIA GTX 1050 Ti, RTX 2060). Para procesamiento por lotes, se recomienda una GPU con 8 GB o mas (RTX 3070, A100, etc.).
- Si cabe en consumer GPU: si, incluso en GPUs de gama baja si se usa cuantizacion o se procesa en lotes pequenos.
- Opciones de despliegue: `sentence-transformers` para prototipado, `text-embeddings-inference` (compatible segun los tags) para servidores de embeddings, `vLLM` (aunque no esta optimizado para embeddings, se puede usar con la API de `sentence-transformers`), `Ollama` (no soporta este tipo de modelo directamente, pero se puede integrar via API), `llama.cpp` (no aplicable, es para modelos generativos).
- Latencia y throughput: no se dispone de datos oficiales. En CPU, una consulta individual tarda del orden de 50-100 ms; en GPU, <10 ms por consulta. Para lotes de 100 frases, se puede lograr un throughput de 1000-2000 frases/segundo en una GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension embedding | Contexto | Dominio | Licencia |
|---|---|---|---|---|---|
| `roma-tahir/multilingual-e5-islamic-v1` | 278M | 768 | no disponible (base: 512) | Islamico | no disponible |
| `intfloat/multilingual-e5-base` | 278M | 768 | 512 | General multilingue | MIT (segun repo original) |
| `IslamQA/multilingual-e5-small-finetuned` | 118M | 384 | 512 | Islamico | no disponible |

El modelo de `roma-tahir` comparte arquitectura y tamano con el base `multilingual-e5-base`, pero esta especializado en contenido islamico. Frente a la version `small` de IslamQA, ofrece el doble de parametros y una dimension de embedding mayor, lo que puede traducirse en mejor capacidad de representacion, aunque con mayor coste computacional. No se dispone de comparaciones de rendimiento cuantitativo entre ellos.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado sobre un conjunto de datos muy pequeno (801 pares) y especifico, puede presentar sesgos hacia las fuentes y traducciones utilizadas en el entrenamiento. No se garantiza neutralidad teologica ni juridica.
- Riesgo de alucinacion: al ser un modelo de embeddings, no genera texto, por lo que no hay riesgo de alucinacion directa. Sin embargo, si se usa en un pipeline de generacion aumentada, los pasajes recuperados pueden ser irrelevantes o incompletos si la consulta esta fuera del dominio entrenado.
- Limitaciones de contexto: la longitud maxima de secuencia no se especifica en la ficha del modelo, pero el modelo base soporta 512 tokens. Consultas o pasajes mas largos deberan truncarse o dividirse.
- Restricciones de licencia: la licencia no esta disponible en la informacion publicada. Se recomienda contactar con el autor antes de usar el modelo en aplicaciones comerciales.
- Cobertura idiomatica: aunque el modelo base es multilingue, el fine-tuning se ha realizado con un dataset pequeno que probablemente no cubre todas las variantes dialectales o registros del arabe, urdu, etc. El rendimiento puede degradarse en idiomas poco representados.
- Produccion: el modelo no ha sido evaluado con benchmarks estandar, por lo que su comportamiento en entornos reales es incierto. Se recomienda validar con datos propios antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/roma-tahir/multilingual-e5-islamic-v1
- Modelo base `intfloat/multilingual-e5-base`: https://huggingface.co/intfloat/multilingual-e5-base
- Paper de Multilingual E5 Text Embeddings: https://arxiv.org/abs/2402.05672
- Modelo similar `IslamQA/multilingual-e5-small-finetuned`: https://huggingface.co/IslamQA/multilingual-e5-small-finetuned
