# docuracy/symphonym-v8

## Resumen

Symphonym v8 es un modelo de extraccion de caracteristicas (feature-extraction) desarrollado por docuracy que proyecta toponimos (nombres de lugar) escritos en 36 sistemas de escritura distintos a un espacio unico de embeddings foneticos de 128 dimensiones. Su proposito es permitir la comparacion directa de similitud entre nombres de lugar escritos en alfabetos diferentes (por ejemplo "London", "Лондон", "伦敦" o "لندن") sin necesidad de convertir a IPA en tiempo de ejecucion ni de identificar previamente el idioma del texto de entrada.

El modelo se construye mediante destilacion de conocimiento profesor-alumno: un Teacher fonetico (PhoneticEncoder) que trabaja sobre transcripciones IPA y representaciones PanPhon192 entrena a un Student desplegable (UniversalEncoder) que consume directamente caracteres Unicode sin procesar. El resultado es un encoder de aproximadamente 8,3 millones de parametros (8.408.817 reales en safetensors) con un vocabulario de 114.845 caracteres, 37 identificadores de escritura y 2.438 codigos de idioma.

Es relevante en el ambito de la reconciliacion de datos geograficos y las humanidades digitales: la coincidencia de toponimos entre idiomas y escrituras es un problema clasico de los gazetteers y los enlazadores de entidades, y v8 mejora a su predecesor v7 en R@1 en 4,1 puntos sobre el benchmark historico hebreo-arabe MEHDIE. El modelo esta publicado bajo licencia CC-BY-4.0 y se distribuye en safetensors y ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Student (UniversalEncoder): embeddings de caracter, escritura, idioma y longitud + proyeccion de entrada, BiLSTM, self-attention con residual, attention pooling y proyeccion final a 128 dimensiones con normalizacion L2. Teacher (PhoneticEncoder, solo entrenamiento): entrada PanPhon192 (24 dimensiones de rasgos articulatorios, pooling posicional de 8 bins), BiLSTM, self-attention, attention pooling y proyeccion a 128 dimensiones |
| Parametros totales | 8.408.817 (aproximadamente 8,3 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de embeddings sobre secuencias de caracteres; la longitud se modela mediante 16 buckets de longitud, de 8 dimensiones cada uno, no mediante una ventana de contexto declarada) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones especificas; se distribuyen pesos safetensors y exportacion ONNX) |
| Idiomas soportados | 18 codigos declarados en la model card: multilingual, ar, zh, ru, ja, ko, he, fa, hi, el, ka, am, hy, ur, bn, ta, te, th. El vocabulario del Student incorpora 2.438 codigos de idioma y 37 identificadores de escritura (36 escrituras nombradas mas un comodin OTHER) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors y ONNX |
| Pipeline | feature-extraction |
| Vocabulario de caracteres | 114.845 caracteres Unicode |

## Arquitectura y entrenamiento

El modelo sigue un esquema de destilacion profesor-alumno. El Teacher (PhoneticEncoder) solo se usa durante el entrenamiento: recibe transcripciones IPA generadas con Epitran (mas 102 extensiones), Phonikud y CharsiuG2P, y las convierte en vectores PanPhon192 de 24 dimensiones de rasgos articulatorios con pooling posicional de 8 bins, que alimentan un BiLSTM con self-attention y attention pooling hasta una proyeccion de 128 dimensiones. El Student (UniversalEncoder), que es el modelo desplegado, evita por completo el paso por IPA: toma caracteres Unicode en crudo junto con el identificador de escritura, el identificador de idioma y un bucket de longitud, y aplica embeddings separados para cada una de esas senales antes de la pila BiLSTM + self-attention con residual + attention pooling + proyeccion a 128 dimensiones y normalizacion L2.

El entrenamiento se organiza en tres fases: una primera fase de 50 epocas con triplet margin loss sobre las caracteristicas PanPhon192 del Teacher (val_loss 0,0056); una segunda fase de 50 epocas de destilacion Student-Teacher con una combinacion alpha·MSE + (1-alpha)·cosine, alpha = 0,5, que alcanza una similitud coseno Student-Teacher de 0,942; y una tercera fase de 30 epocas de ajuste fino con negativos duros usando triplet loss con margen 0,3 (val_loss 0,02122). El embedding de bucket de longitud, con 16 buckets de 8 dimensiones, condiciona la representacion de cada caracter segun la longitud de la secuencia, lo que reduce los emparejamientos espurios entre toponimos cortos y cadenas compuestas largas.

Un detalle metodologico relevante que documenta el autor: no debe seleccionarse el checkpoint por perdida de entrenamiento. De los cuatro candidatos v8 entrenados, el que obtuvo mejor validation loss en las tres fases fue el peor de los cuatro en todas las medidas posteriores; los criterios de seleccion y las fichas de los cuatro candidatos estan en el archivo `models/PROVENANCE.md` del repositorio.

## Capacidades

- Generacion de embeddings foneticos de 128 dimensiones a partir de cadenas Unicode en crudo, sin conversion a IPA ni identificacion de idioma en tiempo de ejecucion.
- Calculo de similitud entre dos toponimos cualesquiera mediante el metodo `similarity(nombre_a, idioma_a, nombre_b, idioma_b)`.
- Embedding por lotes de pares (nombre, idioma) mediante `batch_embed`.
- Correspondencia cross-script entre 36 sistemas de escritura, incluyendo arabe, chino, cirilico, japones, coreano, hebreo, persa, hindi, griego, georgiano, amharico, armenio, urdu, bengali, tamil, telugu y tailandes, entre otros.
- Extraccion de caracteristicas para recuperacion de informacion (information retrieval) y enlazado de entidades nombradas en pipelines de PLN.
- Recuperacion de candidatos (candidate retrieval) dentro de un pipeline de reconciliacion geografica.
- No realiza generacion de texto: no es un modelo de lenguaje generativo.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No dispone de modo de razonamiento (thinking mode), vision ni audio.
- No se documentan capacidades de resumen, traduccion ni respuesta a preguntas.

## Casos de uso

- Reconciliacion de toponimos en gazetteers: dado un nombre de lugar escrito en cualquier escritura, el modelo recupera candidatos foneticamente proximos del catalogo, que despues se filtran por proximidad geografica u otras restricciones, reduciendo el coste de la comparacion exhaustiva de cadenas.
- Busqueda fonetica multilingue: un usuario que introduce un toponimo en su propia escritura obtiene resultados indexados bajo otras escrituras, porque el modelo coloca las variantes en el mismo espacio de 128 dimensiones sin necesitar transliteracion previa.
- Enlazado de registros historicos: emparejamiento de variantes ortograficas anteriores a la estandarizacion (por ejemplo, formas medievales frente a formas modernas) en corpus de archivo, un escenario en el que la similitud ortografica directa falla.
- Enlazado de entidades nombradas multilingue: componente de un pipeline de NEL que alinea menciones de lugares en documentos de idiomas distintos con una base de conocimiento comun.
- Humanidades digitales: reconciliacion de referencias a lugares dispersas en fuentes de archivo de distintas lenguas y epocas, generando un conjunto de candidatos para revision por parte del investigador.
- Deduplicacion en bases de datos geograficas: deteccion de entradas duplicadas de un mismo lugar registradas bajo escrituras diferentes, como paso previo a una fusion supervisada.
- Indexacion y recuperacion en sistemas de informacion geografica: generacion por lotes (`batch_embed`) de embeddings para poblar un indice vectorial de nombres de lugar y servir consultas por similitud.
- Preprocesamiento en pipelines de ciencia de datos geoespaciales: normalizacion de la componente de nombre antes de aplicar reglas de coincidencia por coordenadas.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el benchmark MEHDIE (hebreo-arabe historico, Sagi et al., 2025), con fuentes geograficas medievales no incluidas en los datos de entrenamiento. La media no ponderada corresponde a los cinco testsets (137 consultas); las lineas base de comparacion de cadenas se reejecutaron en la misma pasada y reproducen sus valores publicados con una desviacion de 0,1.

| Metodo | R@1 | R@5 | R@10 | MRR |
|---|---|---|---|---|
| PanPhon192 (ablacion) | 41,1 % | 48,2 % | 52,3 % | 45,0 % |
| Levenshtein + AnyAscii | 81,5 % | 97,6 % | 99,4 % | 88,5 % |
| Jaro-Winkler + AnyAscii | 78,5 % | 96,3 % | 97,8 % | 86,3 % |
| Symphonym v7 | 85,2 % | 97,0 % | 97,6 % | 90,8 % |
| Symphonym v8 | 89,3 % | 97,0 % | 98,2 % | 92,8 % |

La mejora de v8 sobre v7 es de +4,1 puntos en R@1 y +2,0 en MRR. La forma de la curva es relevante: R@5 no cambia y R@10 sube 0,6 puntos, mientras que R@1 y MRR suben de forma notable, lo que indica que v8 no encuentra respuestas que v7 no encontrase, sino que coloca la respuesta correcta en primera posicion con mas frecuencia. Levenshtein + AnyAscii sigue ganando en R@10 (99,4 % frente a 98,2 %), igual que ocurrda con v7.

Advertencias incluidas por el autor: el benchmark es pequeno (los +4,1 puntos en R@1 corresponden a aproximadamente cinco o seis consultas que cambian de posicion) y la comparacion es emparejada (las mismas consultas para ambos modelos), lo que la hace mas robusta que un muestreo independiente, pero no permite extraer mas conclusiones. La model card menciona tambien una validacion por pares cross-script con 11.723 pares y 179 combinaciones de escrituras, pero la informacion disponible se interrumpe antes de incluir sus resultados.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 8.408.817 parametros: aproximadamente 34 MB en fp32, 17 MB en fp16 y 8,4 MB en int8, sin contar el overhead del runtime (PyTorch u ONNX Runtime) ni el vocabulario de 114.845 caracteres. Son estimaciones derivadas del recuento de parametros, no cifras publicadas por el autor.
- GPU recomendadas: no disponible. Por tamano, el modelo no requiere GPU dedicada; cualquier GPU consumer moderna es sobradamente suficiente. No se publican recomendaciones de A100, H100 o RTX 4090.
- Inferencia en CPU: viable dado el tamano del modelo (8,3 M de parametros y una arquitectura BiLSTM con atencion), aunque el autor no publica cifras de latencia.
- Cabe en cualquier GPU consumer: si, con margen muy amplio; tambien cabe en memoria de sistemas embebidos de gama alta.
- Opciones de despliegue: pesos safetensors cargados con PyTorch y el modulo `inference.py` incluido en el repositorio (`SymphonymModel`), o exportacion ONNX mediante ONNX Runtime. El modelo se descarga con `huggingface_hub.snapshot_download("docuracy/symphonym-v8")`.
- vLLM, llama.cpp, Ollama y TGI no aplican: son servidores orientados a modelos generativos y este es un encoder de extraccion de caracteristicas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | R@1 (MEHDIE) | MRR (MEHDIE) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Symphonym v8 | 8,3 M (8.408.817) | no disponible | 89,3 % | 92,8 % | CC-BY-4.0 | HuggingFace (docuracy/symphonym-v8), safetensors y ONNX |
| Symphonym v7 | no disponible (no consta el recuento en la informacion disponible) | no disponible | 85,2 % | 90,8 % | no disponible | HuggingFace (docuracy/symphonym-v7), disponible sin cambios |
| Levenshtein + AnyAscii | no aplica (linea base de distancia de cadenas) | no aplica | 81,5 % | 88,5 % | no aplica | linea base reejecutada por el autor |
| Jaro-Winkler + AnyAscii | no aplica (linea base de distancia de cadenas) | no aplica | 78,5 % | 86,3 % | no aplica | linea base reejecutada por el autor |

No se dispone de otros modelos comparables de embeddings foneticos cross-script en la informacion proporcionada. La ablacion PanPhon192 (41,1 % R@1, 45,0 % MRR) corresponde al Teacher sin destilar y sirve como referencia interna del propio framework. Nota de compatibilidad: v8 es un reentrenamiento desde cero y no un fine-tune de v7; el vocabulario, la cobertura de escrituras y el linaje IPA difieren, por lo que los pesos de v8 y los vocabularios de v7 no son intercambiables.

## Limitaciones y advertencias

- La puntuacion de similitud mide unicamente el nombre y nada mas. No incorpora ningun termino geografico y no puede separar dos lugares que comparten nombre: Newcastle (Australia) puntua exactamente igual que Newcastle (Inglaterra).
- Cualquier sistema que acepte automaticamente una coincidencia basandose solo en esta puntuacion necesita una segunda senal no onomastica, como la proximidad geografica. El modelo esta disenado como componente de recuperacion de candidatos dentro de un pipeline mayor.
- El benchmark de evaluacion es pequeno (137 consultas) y la mejora frente a v7 equivale a cinco o seis consultas que cambian de ranking.
- Levenshtein + AnyAscii supera al modelo en R@10 (99,4 % frente a 98,2 %), un patron que ya se daba en v7.
- Riesgo de falsos positivos por similitud fonetica: nombres distintos pero foneticamente proximos pueden quedar cerca en el espacio de embeddings. No hay generacion de texto, por lo que no existe riesgo de alucinacion en el sentido habitual, pero si de coincidencias espurias.
- Los pesos de v8 y los vocabularios de v7 no son intercambiables; mezclarlos produce resultados invalidos.
- No debe seleccionarse un checkpoint por perdida de entrenamiento: el autor documenta que el candidato con mejor validation loss en las tres fases fue el peor de los cuatro en todas las medidas posteriores.
- Cobertura linguistica: 36 escrituras nombradas mas un comodin OTHER, con 2.438 codigos de idioma en el vocabulario. Los 18 idiomas declarados en la model card no agotan la cobertura real del vocabulario, pero tampoco se documenta el rendimiento por escritura.
- Licencia CC-BY-4.0: permite uso comercial con atribucion obligatoria. No se documentan restricciones adicionales.
- Estado de adopcion: el modelo registra 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad.
- No se documentan sesgos especificos, aunque la composicion del corpus de entrenamiento (GeoNames, Wikidata, Getty TGN) condiciona la cobertura hacia toponimos presentes en esas fuentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/docuracy/symphonym-v8
- Version anterior v7: https://huggingface.co/docuracy/symphonym-v7
- DOI en Zenodo: https://doi.org/10.5281/zenodo.22767194
- Referencia arXiv citada en las etiquetas del repositorio: arxiv:2601.06932
- Datasets utilizados: GeoNames, Wikidata, Getty TGN (Thesaurus of Geographic Names)
- Benchmark de evaluacion: MEHDIE (Sagi et al., 2025), hebreo-arabe historico
- Las busquedas web realizadas no han devuelto enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a contenidos sin relacion (prompts de jailbreak, verificacion de telefonos en ChatGPT, modelos de GitHub Copilot, GPT-SoVITS y directorios de chatbots en vietnamita).
