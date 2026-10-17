# athrael-soju/ColUltraVBERT

## Resumen

ColUltraVBERT es un recuperador (retriever) de interacción tardía para documentos visuales, desarrollado por athrael-soju y publicado en Hugging Face. Se obtiene por ajuste fino (fine-tuning) del codificador UltraVBERT y sigue el paradigma ColBERT/ColPali: codifica cada token de la consulta y cada token de la página como un vector de 128 dimensiones, y puntúa una página frente a una consulta mediante MaxSim. No es un modelo generativo, sino un componente de recuperación diseñado para incrustarse en pipelines RAG sobre documentos con maquetación compleja.

El modelo tiene 254.187.392 parámetros (unos 254 M, aproximadamente 0,5 GB en bfloat16) y trabaja directamente sobre imágenes de página, sin necesidad de OCR ni de extracción de texto previa. El procesador redimensiona cada página a un borde mayor de 2.048 px y la divide en hasta 16 tiles de 512 px más una copia reducida de la página completa, de modo que cada página produce como máximo 1.088 vectores de token de imagen. Está entrenado sobre VDR Train 500k (499.704 pares consulta-página) con consultas en inglés (73%), español, alemán, francés, italiano y portugués, y se distribuye con licencia MIT.

Su relevancia actual está en el ámbito ViDoRe: con un tamaño muy contenido mejora de forma clara a ColModernVBERT en las tres versiones del benchmark (medias de 83,8 frente a 80,2 en ViDoRe V1, 50,1 frente a 38,2 en V2 y 43,1 frente a 26,1 en V3), lo que lo sitúa como una opción ligera para recuperación documental multimodal en seis idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Recuperador de interacción tardía multi-vector (estilo ColBERT/ColPali) sobre codificador vision-language; proyección lineal de 768 a 128 dimensiones por token |
| Parametros totales | 254.187.392 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | No es un modelo generativo. Limite de entrada de imagen: hasta 16 tiles de 512 px mas una copia reducida de la pagina completa, con un maximo de 1.088 vectores de token de imagen por pagina; longitud maxima de consulta de texto: no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors y usados en bfloat16; no se publican variantes GGUF ni cuantizaciones alternativas) |
| Idiomas soportados | en, es, de, fr, it, pt |
| Licencia | MIT (los componentes UltraBERT-150M y SigLIP2-B/16-512 son Apache-2.0, con texto en LICENSE-APACHE) |
| Formato de pesos | safetensors (libreria transformers) |
| Dimension del embedding por token | 128 (normalizado L2, tokens de padding puestos a cero) |
| Resolucion de entrada | borde mayor de 2.048 px, dividido en tiles de 512 px mas copia reducida de pagina completa |
| Funcion de puntuacion | MaxSim sobre los vectores por token |
| Modelo base | athrael-soju/UltraVBERT (relacion: finetune) |
| Dataset de entrenamiento | athrael-soju/vdr-train-500k (499.704 pares consulta-pagina) |
| Pipeline declarado | visual-document-retrieval |
| Descargas / likes en Hugging Face | 0 descargas, 1 like (a fecha de los datos proporcionados) |

## Arquitectura y entrenamiento

ColUltraVBERT es un recuperador multi-vector de interacción tardía. El codificador de UltraVBERT alimenta una proyección lineal que reduce de 768 a 128 dimensiones; cada vector de token resultante se normaliza L2 y los tokens de padding se ponen a cero. La puntuacion de una pagina frente a una consulta se calcula con MaxSim, el mecanismo clasico de ColBERT, que suma sobre cada token de consulta la similitud maxima contra los vectores de la pagina. El procesador de imagenes redimensiona la pagina a un borde mayor de 2.048 px y la divide en hasta 16 tiles de 512 px, anadiendo ademas una copia reducida de la pagina completa; el resultado es un maximo de 1.088 vectores de token de imagen por pagina. El modelo base UltraVBERT incluye un codificador de vision SigLIP2-B/16-512 y un codificador de texto UltraBERT-150M, ambos Apache-2.0.

El entrenamiento consiste en una sola epoca sobre VDR Train 500k (1.951 pasos con batch de 256) con una perdida contrastiva in-batch. Se aplican adaptadores LoRA de rango 32 y alpha 32 sobre las proyecciones de atencion y MLP del codificador de texto y sobre la proyeccion de salida, con una tasa de aprendizaje maxima de 2e-4, un 10% de warmup y decaimiento lineal; los adaptadores se fusionan en los pesos publicados. El codificador de vision y el conector permanecen congelados durante el ajuste. La configuracion completa esta en el archivo training_config.json del repositorio. La model card tambien anuncia una variante ColUltraVBERT-Extreme (recuperador de interaccion tardia fusionado), marcada como en preparacion.

## Capacidades

- Recuperacion de documentos visuales: puntua imagenes de pagina completa frente a consultas textuales sin necesidad de OCR ni de analisis de maquetacion previo.
- Representacion multi-vector por token: genera embeddings de 128 dimensiones por token de pagina (hasta 1.088 por pagina) y por token de consulta, lo que permite puntuacion MaxSim a nivel de token.
- Recuperacion multilingue: consultas en ingles, espanol, aleman, frances, italiano y portugues (el 73% de las consultas de entrenamiento son en ingles).
- Manejo de documentos densos y tabulares: cubre tareas con tablas (TabFQuAD, TAT-DQA) y documentos con graficos y maquetacion compleja (InfoVQA, DocVQA, SyntheticDocQA).
- Indexacion y busqueda eficiente: la estructura de vectores por token es compatible con indices de recuperacion multi-vector habituales en el ecosistema ColBERT.
- Integracion en pipelines RAG multimodales: devuelve una matriz de puntuaciones consulta-pagina que puede conectarse a un recuperador de segunda etapa o a un generador.
- Generacion de texto: no disponible (no es un modelo generativo).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Vision generativa, audio o modo "thinking": no disponible.

## Casos de uso

- Busqueda documental en repositorios corporativos de PDF escaneados: el modelo indexa paginas como imagenes y evita por completo la etapa de OCR, lo que reduce errores en documentos con sellos, firmas, columnas o tablas. Su rendimiento en DocVQA (56,5 nDCG@5) e InfoVQA (87,7) lo hace adecuado para este escenario.
- Extraccion y localizacion de tablas financieras: con 89,7 nDCG@5 en TabFQuAD, sirve como primera etapa de un pipeline que localiza la pagina exacta que contiene una tabla de margenes regionales o cuentas anuales antes de pasar el recorte a un modelo de extraccion estructurada.
- Atencion al cliente multilingue sobre documentacion: al soportar consultas en espanol, aleman, frances, italiano y portugues, permite un unico indice para bases de conocimiento en seis idiomas, con la consulta del usuario en su idioma y sin traduccion intermedia.
- Analisis de informes ESG y de sostenibilidad: los resultados en ViDoRe V2 (45,9 en ESG Reports y 55,2 en ESG Reports HL) lo hacen util para que equipos de cumplimiento localicen metricas concretas dentro de memorias anuales de cientos de paginas.
- Recuperacion sobre literatura biomedica y cientifica: con 50,0 nDCG@5 en BioMedical Lectures y 53,3 en Pharmaceuticals (ViDoRe V3), encaja en buscadores internos de documentacion clinica y farmaceutica donde el texto va acompanado de figuras y tablas.
- Componente de recuperacion en un RAG multimodal: sus embeddings multi-vector pueden alimentar un indice y devolver las paginas candidatas a un modelo generativo con vision, de modo que la generacion se apoye en la pagina original y no en una transcripcion.
- Indexacion de documentacion tecnica industrial: 31,6 nDCG@10 en la tarea Industrial de ViDoRe V3 permite construir buscadores de manuales de mantenimiento y planos anotados para tecnicos de campo.
- Auditoria y cumplimiento normativo: la busqueda sobre la imagen original, sin transformar el documento, facilita la trazabilidad necesaria para justificar por que se recupero una pagina concreta ante una auditoria.

## Benchmarks y rendimiento

Puntuaciones de ViDoRe con MTEB 2.26.3, en bfloat16 y atencion SDPA. Las tareas con varias divisiones por idioma reportan su media. Los resultados de ColModernVBERT son los publicados en MTEB.

ViDoRe V1 (nDCG@5):

| Tarea | ColModernVBERT | ColUltraVBERT |
|---|---:|---:|
| ArxivQA | 73,2 | 78,4 |
| DocVQA | 55,6 | 56,5 |
| InfoVQA | 86,4 | 87,7 |
| TabFQuAD | 74,8 | 89,7 |
| TAT-DQA | 73,1 | 66,7 |
| ShiftProject | 60,4 | 74,3 |
| SyntheticDocQA AI | 97,9 | 98,3 |
| SyntheticDocQA Energy | 93,3 | 95,0 |
| SyntheticDocQA Government Reports | 92,3 | 94,3 |
| SyntheticDocQA Healthcare Industry | 95,3 | 97,4 |
| Media | 80,2 | 83,8 |

ViDoRe V2 (nDCG@5):

| Tarea | ColModernVBERT | ColUltraVBERT |
|---|---:|---:|
| ESG Reports | 40,1 | 45,9 |
| Economics Reports | 29,2 | 49,5 |
| BioMedical Lectures | 31,1 | 50,0 |
| ESG Reports HL | 52,2 | 55,2 |
| Media | 38,2 | 50,1 |

ViDoRe V3 (nDCG@10):

| Tarea | ColModernVBERT | ColUltraVBERT |
|---|---:|---:|
| Computer Science | 37,6 | 61,6 |
| Energy | 32,5 | 47,5 |
| Finance EN | 28,8 | 45,0 |
| Finance FR | 19,8 | 27,5 |
| HR | 19,8 | 44,1 |
| Industrial | 15,7 | 31,6 |
| Pharmaceuticals | 32,2 | 53,3 |
| Physics | 22,6 | 34,3 |
| Media | 26,1 | 43,1 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo cual es coherente con que el modelo no sea generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 0,51 GB (254 M de parametros); en float32, unos 1,02 GB. A ello hay que sumar activaciones y el coste de los tiles de imagen. No hay cifras oficiales publicadas de VRAM, por lo que cualquier valor por encima del peso de los parametros es una estimacion.
- Coste de indexacion: cada pagina genera hasta 1.088 vectores de 128 dimensiones, es decir unos 544 KiB en float32 o unos 272 KiB en bfloat16 por pagina, calculado a partir de las dimensiones publicadas. Un millon de paginas requeriria del orden de 0,5 TB en float32 antes de compresion o cuantizacion del indice.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, el modelo es apto para GPU de consumo con al menos 4-8 GB de VRAM (por ejemplo RTX 3060, RTX 4060, RTX 3080, RTX 4090) y para GPU de datacenter (A100, H100) cuando se prioriza el throughput de indexacion masiva.
- Cabe en GPU de consumo: si, con los pesos en bfloat16 el modelo ocupa alrededor de medio giga (estimacion derivada del numero de parametros); la limitacion practica es la memoria del indice multi-vector, no el modelo.
- Opciones de despliegue: transformers con las clases ColUltraVBertForRetrieval y ColUltraVBertProcessor, que requieren una version de transformers que incluya la arquitectura (la model card indica que esta siendo integrada en el repositorio upstream). El uso de vLLM, TGI, llama.cpp u Ollama no esta documentado ni es aplicable de forma directa, dado que se trata de un codificador de recuperacion con una cabeza de proyeccion propia.
- Latencia y throughput: no disponible. Los unicos datos de rendimiento publicados son las puntuaciones ViDoRe con MTEB 2.26.3.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | ViDoRe V1 (media) | ViDoRe V2 (media) | ViDoRe V3 (media) | Licencia |
|---|---|---|---|---|---|---|
| ColUltraVBERT | 254 M | Interaccion tardia multi-vector, imagen de pagina | 83,8 | 50,1 | 43,1 | MIT |
| ColModernVBERT | no disponible | Interaccion tardia multi-vector, imagen de pagina | 80,2 | 38,2 | 26,1 | no disponible |
| ColPali / ColQwen y otras variantes | no disponible | Interaccion tardia multi-vector | no disponible | no disponible | no disponible | no disponible |

Solo se dispone de comparacion directa con ColModernVBERT, incluida en la propia model card. No hay datos en la informacion proporcionada sobre parametros, contexto o licencia de ColModernVBERT, ni resultados de otras alternativas de la misma categoria.

## Limitaciones y advertencias

- Reduccion de resolucion: las paginas se reducen para encajar en 16 tiles, lo que puede emborronar la letra pequena. La propia model card senala esta limitacion de forma explicita.
- Riesgo de recuperacion erronea: como todo recuperador, puede devolver paginas con alta similitud lexica o visual pero no relevantes; su uso en produccion deberia acompanarse de umbrales de puntuacion o de un reranker de segunda etapa.
- TAT-DQA es el unico conjunto de ViDoRe V1 donde empeora respecto a ColModernVBERT (66,7 frente a 73,1), lo que sugiere menor robustez en ese tipo concreto de preguntas sobre tablas.
- Cobertura de idiomas desigual: el 73% de las consultas de entrenamiento son en ingles, de modo que el rendimiento en espanol, aleman, frances, italiano y portugues puede ser inferior aunque esten declarados como soportados. En ViDoRe V3, Finance FR obtiene 27,5 frente a 45,0 en Finance EN.
- No es un modelo generativo: no produce respuestas, resumenes ni codigo, y no soporta tool calling ni razonamiento multi-paso. Cualquier pipeline que necesite texto generado debe anadir un modelo aparte.
- Dependencia de version de transformers: el codigo de ejemplo requiere una version que incluya ColUltraVBERT, que segun la model card todavia se estaba integrando en el repositorio upstream en el momento de la publicacion. Esto complica el despliegue inmediato en entornos con versiones fijadas.
- Adopcion muy baja: 0 descargas y 1 like en el momento de los datos, sin ecosistema de terceros, cuantizaciones comunitarias ni integraciones verificadas.
- Licencia: el modelo se distribuye bajo MIT, lo que permite uso comercial; los componentes base UltraBERT-150M y SigLIP2-B/16-512 son Apache-2.0 y su texto de licencia se incluye en LICENSE-APACHE. Conviene revisar ambos textos antes de un despliegue comercial.
- Fechas de publicacion y actualizacion inusuales en los metadatos (15 y 17 de octubre de 2026) y ausencia de resultados de benchmarks independientes fuera de los reportados por el propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/athrael-soju/ColUltraVBERT
- Modelo base UltraVBERT: https://huggingface.co/athrael-soju/UltraVBERT
- Variante anunciada ColUltraVBERT-Extreme: https://huggingface.co/athrael-soju/ColUltraVBERT-Extreme
- Dataset de entrenamiento VDR Train 500k: https://huggingface.co/datasets/athrael-soju/vdr-train-500k
- Configuracion de entrenamiento: archivo training_config.json dentro del repositorio del modelo
- Los resultados de la busqueda web no contienen enlaces relevantes al modelo (el contenido devuelto no guarda relacion con el ambito de la ficha), por lo que no se incluyen.
