# JanSchachtschabel/m2v-gte-256-edu-v2

## Resumen

m2v-gte-256-edu-v2 es un modelo de embeddings estaticos (static embeddings) desarrollado por JanSchachtschabel, derivado mediante destilacion del modelo transformer multilingue Alibaba-NLP/gte-multilingual-base. Esta especializado en contenido educativo en aleman y su proposito es la busqueda de recursos de aprendizaje mediante palabras clave y consultas cortas, asi como la similitud semantica y clasificacion de textos del dominio educativo. Es la segunda version (v2) de m2v-gte-256-edu, con una mejora sustancial en calidad de recuperacion respecto a su predecesor.

La caracteristica principal de la familia Model2Vec es que no requiere GPU ni ejecutar un transformer en inferencia: cada texto se vectoriza mediante la busqueda y promediado de vectores de tokens, lo que reduce el coste computacional a una operacion de lookup sobre una tabla. El modelo produce embeddings de 256 dimensiones con un vocabulario de aproximadamente 424.000 tokens y pesos en float16 de unos 224 MB, lo que lo hace desplegable en entornos muy limitados.

La relevancia actual reside en su eficiencia: ofrece recuperacion semantica de baja latencia en CPU para un dominio concreto (educacion en aleman), superando en las tareas evaluadas a un transformer multilingue como paraphrase-multilingual-MiniLM-L12-v2 y a una linea base TF-IDF. Su licencia Apache 2.0 facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Model2Vec (embeddings estaticos; lookup y promedio de vectores de tokens) |
| Parametros totales | 108.533.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de embeddings estaticos sin ventana de atencion) |
| Tipos de cuantizacion | pesos en float16 (formato publicado); no se documentan otras cuantizaciones |
| Idiomas soportados | aleman (de); vocabulario derivado del profesor multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria model2vec) |
| Dimensiones del embedding | 256 |
| Vocabulario | ~424.000 tokens |
| Tamano del repo | 0,2 GB (~224 MB de pesos) |
| Modelo base (profesor) | Alibaba-NLP/gte-multilingual-base |

## Arquitectura y entrenamiento

El modelo es un Model2Vec, es decir, un modelo de embeddings estaticos que sustituye el encoder transformer por una tabla de vectores por token. En inferencia, un texto se representa promediando los vectores de sus tokens, sin atencion ni calculo de capas. El resultado es un vector de 256 dimensiones por texto. El vocabulario, de aproximadamente 424.000 tokens, parte del vocabulario del profesor y se amplia con terminos del dominio educativo aleman, sus formas base y variantes en minusculas.

El entrenamiento consta de tres fases segun la model card: (1) destilacion desde gte-multilingual-base con el vocabulario ampliado; (2) ajuste fino sobre textos educativos alemanes con Tokenlearn, donde el modelo estatico aprende a reproducir los embeddings del profesor para textos del dominio; y (3) ajuste fino por pares de tipo contrastivo con negativos in-batch, usando pares palabra clave -> recurso de aprendizaje y titulo -> descripcion. No se documenta el numero de tokens de entrenamiento ni el uso de RLHF o DPO.

## Capacidades

- Generacion de embeddings de frases y documentos de 256 dimensiones para similitud semantica.
- Recuperacion por palabras clave y consultas cortas en contenido educativo aleman.
- Busqueda titulo -> descripcion de recursos de aprendizaje.
- Clasificacion de textos mediante sondas sobre embeddings congelados (evaluada en clasificacion de asignaturas).
- Funcionamiento en CPU sin GPU ni transformer en inferencia, con latencia muy baja.
- Soporte de formas base, formas flexionadas y variantes en minusculas en el vocabulario.
- Compatible con la libreria model2vec (StaticModel) y con sentence-transformers (StaticEmbedding).
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio: es exclusivamente un modelo de embeddings.

## Casos de uso

- Buscador de recursos educativos: indexar el catalogo de materiales y recuperar recursos relevantes a partir de palabras clave introducidas por docentes o alumnos, aprovechando el ajuste especifico al dominio educativo aleman.
- Busqueda hibrida en portales educativos: combinar los embeddings con BM25 para compensar la menor precision de un modelo estatico en coincidencias exactas de terminos, como recomienda el autor.
- Recomendacion de materiales por similitud: calcular similitud coseno entre la descripcion de un recurso y el perfil o la consulta del usuario para sugerir contenidos relacionados.
- Clasificacion automatica de asignaturas: entrenar una regresion logistica sobre los embeddings congelados para etiquetar recursos por materia, con un coste de entrenamiento minimo.
- Deduplicacion y agrupacion de contenidos: detectar recursos duplicados o muy similares dentro de un repositorio educativo mediante umbrales de similitud.
- Despliegue en entornos sin GPU: servir busqueda semantica en servidores modestos o dispositivos de borde gracias a los ~224 MB de pesos y la inferencia por lookup.
- Normalizacion de consultas de busqueda: preprocesar consultas en minusculas y reducirlas a formas base de sustantivos para mejorar la recuperacion, segun la recomendacion del autor.

## Benchmarks y rendimiento

Evaluacion sobre un conjunto de test aleman de educacion no usado en entrenamiento (mayor es mejor):

| Modelo | Keyword nDCG@10 | Keyword Recall@10 | Minusculas nDCG@10 | Titulo->desc MRR@10 | Titulo->desc Recall@10 | Clasificacion macro-F1 |
|---|---|---|---|---|---|---|
| m2v-gte-256-edu-v2 (texto crudo) | 0,323 | 0,371 | 0,212 | 0,648 | 0,794 | 0,500 |
| m2v-gte-256-edu-v2 (formas base) | 0,297 | 0,352 | 0,291 | 0,618 | 0,768 | 0,462 |
| m2v-gte-256-edu (predecesor) | 0,084 | 0,103 | 0,059 | 0,344 | 0,467 | 0,372 |
| potion-multilingual-128M | 0,122 | 0,148 | 0,106 | 0,481 | 0,641 | 0,393 |
| paraphrase-multilingual-MiniLM-L12-v2 | 0,076 | 0,096 | 0,060 | 0,460 | 0,620 | 0,419 |
| TF-IDF (referencia) | 0,220 | 0,235 | 0,220 | 0,577 | 0,685 | 0,435 |

Los modelos comparados usan texto crudo como entrada. En busqueda por palabras clave, la consulta es la palabra clave y se consideran relevantes los recursos etiquetados con ella (los recursos se vectorizan sin sus palabras clave). La clasificacion de asignaturas se evalua con una regresion logistica sobre embeddings congelados.

## Requisitos de hardware

- VRAM: no requiere GPU; los pesos en float16 ocupan aproximadamente 224 MB y pueden residir en RAM.
- GPU recomendadas: no necesarias. Funciona en CPU; cualquier GPU con al menos ~1 GB de memoria libre puede alojarlo, aunque no aporta ventaja significativa.
- GPU de consumo: cabe en cualquier tarjeta consumer e incluso en entornos sin GPU dedicada.
- Opciones de despliegue: libreria model2vec (StaticModel) y sentence-transformers (StaticEmbedding); no aplica vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos.
- Latencia y throughput: no se publican cifras concretas; la model card indica que la inferencia es muy rapida en CPU por basarse en lookup y promedio de vectores.

## Comparativa con modelos similares

| Modelo | Tipo | Dimensiones | Contexto | Licencia | Rendimiento (keyword nDCG@10) |
|---|---|---|---|---|---|
| m2v-gte-256-edu-v2 | Estatico (Model2Vec) | 256 | no aplica | Apache 2.0 | 0,323 |
| m2v-gte-256-edu | Estatico (Model2Vec) | no disponible | no aplica | no disponible | 0,084 |
| potion-multilingual-128M | Estatico (Model2Vec) | no disponible | no aplica | no disponible | 0,122 |
| paraphrase-multilingual-MiniLM-L12-v2 | Transformer | 384 | no disponible | no disponible | 0,076 |

La comparativa se limita a los modelos incluidos en la evaluacion del autor. m2v-gte-256-edu-v2 supera a todos ellos en las tres tareas evaluadas, aunque parte de la ventaja procede de su adaptacion al dominio educativo aleman, que los modelos comparados no han visto en entrenamiento.

## Limitaciones y advertencias

- Disenado exclusivamente para contenido educativo en aleman; la calidad en otros dominios o idiomas no esta medida.
- Parte de la ventaja frente a los modelos comparados se debe a la adaptacion al dominio, no solo a la arquitectura.
- Un modelo estatico no iguala la precision de BM25 en coincidencias exactas de terminos; se recomienda busqueda hibrida.
- No es un modelo generativo: no produce texto, no soporta razonamiento, tool calling ni agentes.
- No se documentan sesgos especificos; al derivar de un profesor multilingue y entrenarse con datos educativos, puede heredar sesgos de esas fuentes.
- Riesgo de alucinacion no aplica en el sentido generativo, pero la similitud semantica puede producir recuperaciones irrelevantes en consultas ambiguas.
- Licencia Apache 2.0: permite uso comercial con atribucion y manteniendo el aviso de licencia.
- El rendimiento en minusculas mejora con preprocesado (reduccion a formas base de sustantivos); sin el, la calidad en consultas en minusculas desciende (nDCG@10 de 0,212 frente a 0,291).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JanSchachtschabel/m2v-gte-256-edu-v2
- Predecesor: https://huggingface.co/JanSchachtschabel/m2v-gte-256-edu
- Modelo profesor: https://huggingface.co/Alibaba-NLP/gte-multilingual-base
- Repositorio Model2Vec: https://github.com/MinishLab/model2vec
- Tokenlearn: https://github.com/MinishLab/tokenlearn
- potion-multilingual-128M: https://huggingface.co/minishlab/potion-multilingual-128M
- paraphrase-multilingual-MiniLM-L12-v2: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
