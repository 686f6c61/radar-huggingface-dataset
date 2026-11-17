# nathanjrdev/leia-embeddings-pt

## Resumen

leia-embeddings-pt es un modelo de embeddings de frases obtenido por ajuste fino supervisado de sentence-transformers/paraphrase-multilingual-mpnet-base-v2, desarrollado por nathanjrdev. Su proposito es la busqueda semantica de libros en portugues a partir de peticiones de lectores en lenguaje natural, como "un romance corto sobre celos" o "libros de Clarice Lispector". Se integra en Leia, una bibliotecaria virtual con IA, y esta pensado como encoder de recuperacion densa dentro de un pipeline de busqueda sobre un catalogo de libros.

El modelo resuelve un problema concreto: los encoders multilingues genericos no alinean bien las descripciones de intencion lectora con los metadatos de catalogo (titulo, autor, sinopsis, categorias). El ajuste fino con pares sinteticos y pares de titulo y autor mejora de forma medible el Recall@5 y el nDCG@10 en busqueda puramente vectorial. Con 278.043.648 parametros, arquitectura XLM-RoBERTa y licencia Apache 2.0, es un modelo pequeno y desplegable en hardware modesto, pero su alcance esta deliberadamente acotado a un catalogo de 282 libros y al idioma portugues.

Es relevante ahora porque ejemplifica el patron de especializacion de encoders de recuperacion para dominios concretos con presupuesto minimo (GPU T4 en Kaggle, 1.873 pares sinteticos y 685 pares de catalogo), y porque documenta con honestidad sus limites: el autor advierte explicitamente de que el modelo no esta en produccion y de que los numeros publicados no cubren la busqueda hibrida completa del producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder XLM-RoBERTa (base), ajustado con SentenceTransformers |
| Parametros totales | 278.043.648 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base XLM-RoBERTa soporta hasta 512 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el repo no documenta variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | portugues (pt); el modelo base es multilingue, pero el ajuste fino se realizo solo con datos en portugues |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria sentence-transformers) |

## Arquitectura y entrenamiento

El modelo parte de paraphrase-multilingual-mpnet-base-v2, un encoder XLM-RoBERTa base entrenado con SentenceTransformers para similitud de frases multilingue. El ajuste fino utiliza la perdida MultipleNegativesRankingLoss con lotes que no contienen dos peticiones del mismo libro, 3 epocas, learning rate 2e-5, semilla 42 y dos GPU T4 en Kaggle. El objetivo es aprender un espacio de embeddings donde la consulta del lector quede cerca del libro correcto, sin depender de coincidencia lexica.

Los datos de entrenamiento combinan dos fuentes. Por un lado, 1.873 pares sinteticos generados por LLM (Gemini 3.5 Flash para unos 25 libros y DeepSeek V4.1 Flash para el resto) a partir de titulo, autor, categorias y sinopsis, con hasta 8 peticiones por libro y sin citar titulo, autor ni personajes. Por otro, 685 pares de titulo y autor generados del catalogo sin LLM: titulo exacto y sin acentos, nombre del autor y la plantilla "livros de <autor>". La division se hace por libro: aproximadamente el 20% (46 libros) queda fuera del entrenamiento como validacion, y los libros y autores de los casos manuales tampoco reciben pares de catalogo, de modo que esas evaluaciones miden generalizacion a libros y autores nuevos. El dataset es publico (leia-busca-livros-pt) y el codigo de evaluacion esta en `evals/embeddings/` del repositorio.

La innovacion tecnica destacable no es arquitectonica sino metodologica: el autor documenta que una primera ronda solo con pares sinteticos mejoro la intencion pero degradó titulo (Recall@5 0.778 a 0.611) y autor (0.929 a 0.286), porque las peticiones sinteticas nunca citan titulo ni autor. Anadir los pares de catalogo corrigio esa regresion sin perder la mejora en intencion.

## Capacidades

- Generacion de embeddings de frases y parrafos para similitud semantica y recuperacion densa (pipeline sentence-similarity).
- Busqueda semantica de libros a partir de peticiones de intencion en portugues ("un suspense corto para el fin de semana").
- Recuperacion por titulo exacto, titulo sin acentos y peticiones del tipo "libros de <autor>".
- Alineacion consulta-documento sobre metadatos de catalogo (titulo, autor, categorias, sinopsis).
- Codificacion normalizada de embeddings (normalize_embeddings=True) apta para similitud por coseno.
- Compatibilidad con text-embeddings-inference y endpoints compatibles, segun los tags del repositorio.
- No soporta generacion de texto, tool calling, agentes, vision, audio ni modo de razonamiento: es exclusivamente un encoder de recuperacion.
- Capacidad multilingue heredada del modelo base, pero no validada en otros idiomas distintos del portugues.

## Casos de uso

- Busqueda semantica en biblioteca digital o libreria online: el encoder transforma la consulta libre del lector en un vector y recupera los libros mas proximos por coseno sobre el catalogo indexado, sustituyendo o complementando la busqueda por palabras clave.
- Recomendacion por intencion lectora: peticiones del tipo "un romance corto sobre celos" se mapean a libros con sinopsis y categorias afines, util para modulos de descubrimiento en apps de lectura.
- Recuperacion por autor o titulo dentro de asistentes conversacionales: los pares de catalogo entrenados permiten responder a "libros de Clarice Lispector" o a titulos exactos y sin acentos sin depender de un indice lexico separado.
- Enriquecimiento de un pipeline RAG sobre fichas bibliograficas: usar el encoder para recuperar las fichas relevantes antes de que un LLM genere la respuesta, reduciendo alucinaciones sobre el catalogo.
- Filtrado y deduplicacion semantica de resenas o peticiones de usuarios: agrupar consultas equivalentes formuladas de forma distinta para analitica de demanda editorial.
- Prototipado rapido de motores de busqueda verticales en portugues: al ser un modelo de 278 M de parametros con licencia Apache 2.0, sirve como linea base reproducible antes de invertir en un encoder mayor.
- Evaluacion de calidad de catalogos: medir la separabilidad semantica entre fichas para detectar sinopsis pobres o categorias mal asignadas.

## Benchmarks y rendimiento

Resultados publicados por el autor en busqueda solo por vector (coseno) sobre el catalogo completo de 282 libros, sin busqueda textual ni reranker. "Antes" corresponde al modelo base.

| Conjunto | n | Recall@5 antes | Recall@5 despues | nDCG@10 antes | nDCG@10 despues |
|---|---|---|---|---|---|
| Libros nunca vistos en entrenamiento (peticiones sinteticas) | 368 | 0.758 | 0.965 | 0.691 | 0.920 |
| Casos manuales: intencion | 41 | 0.854 | 1.000 | 0.769 | 0.958 |
| Casos manuales: titulo | 18 | 0.778 | 0.889 | 0.697 | 0.825 |
| Casos manuales: autor | 14 | 0.929 | 1.000 | 0.720 | 0.915 |
| Casos manuales: general | 73 | 0.849 | 0.973 | 0.742 | 0.917 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MTEB) en la informacion disponible. El autor advierte de que no se midio la busqueda hibrida del producto, la varianza entre semillas (una ejecucion por configuracion), ni peticiones reales de lectores (las sinteticas son mas largas, mediana de 26 palabras).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en fp32 (278 M de parametros) y en torno a 0,6 GB en fp16; el repo ocupa 1,1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el propio autor entreno en 2x T4 de Kaggle, lo que da una idea del perfil de recursos.
- Cabe en GPU de consumo: si, en GTX 1650, RTX 3050, RTX 4060 y superiores; tambien en CPU para volumenes moderados.
- Opciones de despliegue: sentence-transformers (referencia), Text Embeddings Inference (TGI), endpoints compatibles indicados en los tags, y exportacion a ONNX si se necesita, aunque el repo no la documenta.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| nathanjrdev/leia-embeddings-pt | 278 M | no disponible | pt (base multilingue) | Apache 2.0 | Especializado en busqueda de libros en portugues; Recall@5 0.965 en el conjunto de validacion del autor |
| sentence-transformers/paraphrase-multilingual-mpnet-base-v2 | 278 M | no disponible | multilingue | Apache 2.0 | Modelo base; mismo tamano y licencia, sin especializacion de dominio |
| Otros encoders multilingues de recuperacion (p. ej. familia multilingual-e5) | no disponible | no disponible | multilingue | no disponible | No se dispone de resultados comparables en la informacion proporcionada |

La comparacion directa con alternativas de recuperacion solo es posible frente al modelo base, para el cual el autor publica las metricas "antes" de la tabla de benchmarks. No hay datos de terceros en la informacion disponible.

## Limitaciones y advertencias

- El autor indica explicitamente que el modelo no esta en produccion; los numeros publicados son de busqueda solo por vector y no del pipeline hibrido completo de Leia.
- Catalogo de evaluacion muy pequeno (282 libros), centrado en literatura lusofona y clasicos; no debe reutilizarse en otro acervo sin reevaluar.
- Conjuntos manuales de evaluacion minusculos (14 a 18 casos por tipo): un solo caso altera aproximadamente 0,06 de Recall@5, por lo que la incertidumbre de esas cifras es alta.
- Sesgo de origen: las peticiones de entrenamiento, parte de las sinopsis y los casos de evaluacion provienen de conocimiento de LLM, por lo que la mejora medida tiende a ser optimista.
- Distribucion irreal de consultas: las peticiones sinteticas son mas largas (mediana de 26 palabras) que las de lectores reales.
- Cobertura idiomatica limitada al portugues en el ajuste fino, pese a la base multilingue; el rendimiento en castellano u otros idiomas no esta medido.
- Riesgo de recuperacion incorrecta en consultas ambiguas o muy cortas, agravado por la ausencia de reranker en la evaluacion publicada.
- No se ha medido la varianza entre semillas; solo se verifico la reejecucion con la misma semilla.
- Licencia Apache 2.0 permite uso comercial, pero no exime de reevaluar el modelo en el catalogo propio ni de cumplir las condiciones del modelo base.
- Sin datos publicados sobre cuantizacion, contexto maximo efectivo ni latencia, lo que limita la planificacion de capacidad en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nathanjrdev/leia-embeddings-pt
- Dataset de entrenamiento: https://huggingface.co/datasets/nathanjrdev/leia-busca-livros-pt
- Repositorio del proyecto Leia: https://github.com/nathanjrdev/leia
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2
