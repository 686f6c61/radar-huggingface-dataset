# marin-community/atlantic-cc-fasttext

## Resumen

Atlantic-CC fastText es un clasificador binario basado en fastText que estima la probabilidad de que una pagina web extraida de Common Crawl contenga contenido util (`P(useful)`). Lo desarrolla la comunidad Marin y constituye la primera etapa de alta cobertura (high-recall) de la cascada de clasificadores que genero el corpus Atlantic-CC, un procesamiento de 17,1 billones de tokens sobre Common Crawl alojado por la propia organizacion Common Crawl. No es un modelo generativo: es una pieza de infraestructura de filtrado de datos para la construccion de corpus de preentrenamiento.

El modelo opera sobre texto principal extraido con resiliparse-rs y se aplica con un umbral muy bajo (P(useful) >= 0,0048 en float32), de modo que descarta solo las paginas claramente inutiles y delega la decision fina a una etapa posterior basada en transformer (atlantic-cc-pooled-transformer). En la ejecucion completa de la version 1.0, el 56,5 % de las paginas HTML superaron este primer filtro.

Su relevancia practica es doble: por un lado, documenta y hace reproducible el pipeline de curacion de un corpus a gran escala; por otro, al ser un fastText de 0,9 GB, permite filtrar millones de documentos por hora en CPU sin GPU, lo que lo convierte en una referencia util para equipos que construyen sus propios datasets web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | fastText (clasificador lineal con bolsa de n-gramas y embeddings de subpalabras) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (fastText no tiene ventana de contexto; procesa el texto normalizado como bolsa de n-gramas) |
| Tipos de cuantizacion | no disponible (formato binario nativo de fastText, `model.bin`) |
| Idiomas soportados | no disponible (no evaluado por idioma; el vocabulario cubre terminos vistos al menos 500 veces en el texto de entrenamiento de Common Crawl) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | binario de fastText (`model.bin`); tamano del repo 0,9 GB |

## Arquitectura y entrenamiento

Se trata de un clasificador fastText supervisado, la arquitectura clasica de bolsa de palabras con n-gramas de caracteres y subpalabras, entrenada para predecir dos etiquetas (`__label__useful` y su complementaria). El vocabulario incluido en `model.bin` contiene unicamente las palabras que aparecen al menos 500 veces en el texto de entrenamiento de Common Crawl, lo que reduce el tamano del modelo a costa de perder terminos raros.

El entrenamiento uso 5,6 millones de paginas procedentes de 640 ficheros WARC de Common Crawl, etiquetadas segun si un pipeline de extraccion basado en LLM conservo o descarto cada pagina. Es decir, el clasificador destila el criterio de utilidad de ese pipeline de extraccion, no un juicio humano independiente. La evaluacion se realizo sobre 6.477 paginas de 89 WARC reservados para test, con un mejor F1 de 0,8196; el punto de operacion real de la cascada usa un umbral mucho mas bajo que el optimo de F1 para maximizar la cobertura. El codigo publicado reproduce bit a bit la columna `fasttext_score` de los 83.262 documentos liberados, usando `fasttext-wheel` 0.9.2 sobre Linux x86_64.

## Capacidades

- Clasificacion binaria de texto web: devuelve `P(useful)`, la probabilidad de que una pagina merezca conservarse.
- Filtrado de alta cobertura dentro de una cascada de clasificadores, como primera etapa antes de un modelo neural.
- Inferencia en CPU a gran escala, adecuada para procesar volumenes masivos de HTML extraido.
- Contrato de entrada definido: texto principal de resiliparse-rs, normalizado con `re.sub(r"\s+", " ", texto).strip().lower()` y sin salto de linea final.
- Reproducibilidad numerica verificada frente a las puntuaciones almacenadas del corpus Atlantic-CC.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio: no es un modelo generativo.

## Casos de uso

- Construccion de corpus de preentrenamiento: se aplica el clasificador sobre el texto principal de cada pagina de Common Crawl y se descartan las que quedan por debajo de 0,0048, reduciendo el volumen antes de las etapas neuronales mas caras. Es exactamente el uso para el que fue entrenado.
- Filtrado previo en pipelines de datasets propios: cualquier equipo que rastree web puede usar este modelo como primera pasada barata en CPU para eliminar paginas de navegacion, listados y boilerplate antes de aplicar heuristicas o un LLM juez.
- Deduplicacion y curacion de crawls internos: al puntuar cada documento se puede priorizar el contenido con mayor `P(useful)` y revisar manualmente solo la cola de baja puntuacion, reduciendo el coste de anotacion.
- Investigacion sobre calidad de datos: sirve como linea base reproducible para comparar heuristicas de filtrado o para estudiar que fraccion de un crawl se considera util segun el criterio del pipeline de Marin.
- Reproduccion de experimentos: permite regenerar las puntuaciones del corpus Atlantic-CC y auditar los resultados publicados sin reentrenar nada.
- Ensenanza y formacion: ejemplo compacto de destilacion de un juez LLM a un clasificador lineal desplegable en produccion con requisitos minimos.
- Prefiltrado en sistemas de recuperacion o busqueda web: descartar paginas con puntuacion muy baja antes de indexar o de pasarlas a un ranker mas costoso.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| Mejor F1 | 0,8196 | 6.477 paginas de 89 WARC reservados |
| Umbral de operacion en la cascada | P(useful) >= 0,0048 (float32) | Ejecucion completa v1.0 |
| Tasa de aceptacion | 56,5 % de paginas HTML | Ejecucion completa v1.0 |
| Reproducibilidad | coincidencia bit a bit en 83.262 documentos | Corpus Atlantic-CC liberado |

No se han publicado resultados de benchmarks adicionales (por idioma, dominio o comparacion con otros filtros) en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo es un fastText de 0,9 GB y no requiere GPU; el cuello de botella es el ancho de banda de lectura y el preprocesado de texto.
- Memoria RAM: suficiente con unos pocos GB para cargar `model.bin` y procesar lotes de documentos; no se especifica un minimo oficial.
- GPU: no necesaria ni aprovechada por la libreria fastText estandar; no se recomienda ninguna GPU concreta.
- Despliegue: libreria `fasttext` (o `fasttext-wheel` 0.9.2 en Linux x86_64 para reproducibilidad exacta), cargando el binario desde Hugging Face con `hf_hub_download`.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y del tamano de los documentos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Atlantic-CC fastText | Clasificador fastText | no disponible (repo 0,9 GB) | no aplica | OpenMDW-1.1 | Primera etapa de la cascada Atlantic-CC; F1 0,8196 |
| Atlantic-CC pooled transformer | Transformer de clasificacion | no disponible | no disponible | no disponible | Segunda etapa de la misma cascada; mayor coste computacional |
| Filtros heuristicos tipo Gopher/RefinedWeb | Reglas y estadisticas | no aplica | no aplica | segun implementacion | No requieren entrenamiento, pero no capturan el criterio de un juez LLM |
| Clasificadores de calidad tipo FineWeb-Edu | Modelo neuronal de clasificacion | no disponible | no disponible | no disponible | Enfoque comparable (puntuar utilidad educativa), pero requiere GPU |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Hereda la nocion de "util" de un unico pipeline de extraccion basado en LLM; no se evaluo por idioma ni por dominio, por lo que el rendimiento fuera de la distribucion de Common Crawl puede degradarse.
- No es un filtro de toxicidad, seguridad, datos personales, valor educativo ni licencias: no debe usarse para esos fines.
- El vocabulario solo contiene palabras vistas al menos 500 veces en el texto de entrenamiento, lo que penaliza terminos poco frecuentes y dominios especializados.
- Uso incorrecto de la API: `model.predict()` anade un salto de linea (token de fin de frase) y desplaza las puntuaciones; hay que usar `model.f.predict` con el texto normalizado.
- El umbral 0,0048 esta calibrado para la cascada completa; usarlo aislado como filtro de calidad produce muchos falsos positivos por diseno.
- Riesgo de sesgo hacia el espanol de la web y hacia el tipo de contenido sobrerrepresentado en Common Crawl.
- La model card lo declara artefacto de investigacion sin pruebas de seguridad adecuadas; el uso en produccion es responsabilidad del integrador.
- Licencia OpenMDW-1.1: conviene revisar sus terminos y el fichero `THIRD_PARTY_NOTICES.md` antes de un uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/marin-community/atlantic-cc-fasttext
- Repositorio del proyecto Atlantic-CC: https://github.com/marin-community/atlantic-cc
- Documentacion de clasificadores: https://github.com/marin-community/atlantic-cc/blob/main/docs/classifiers.md
- Clasificador de segunda etapa: https://huggingface.co/marin-community/atlantic-cc-pooled-transformer
- fastText: https://fasttext.cc
- Common Crawl: https://commoncrawl.org
- Licencia OpenMDW-1.1: https://huggingface.co/marin-community/atlantic-cc-fasttext/blob/main/LICENSE
- Avisos de terceros: https://huggingface.co/marin-community/atlantic-cc-fasttext/blob/main/THIRD_PARTY_NOTICES.md
