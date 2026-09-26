# segmue/geo-distiluse-swissnames3d-config2

## Resumen

geo-distiluse-swissnames3d-config2 es un sentence-transformer especializado en resolucion de toponimos (toponym resolution) contra el gazetteer suizo swissNAMES3D. Lo desarrolla el usuario segmue en el marco de una tesis de master de la Universidad de Zurich (2026), titulada *Describing Places by Their Surroundings: Enriching Candidate Descriptions with Spatial Context for Toponym Resolution*. El modelo esta disenado para integrarse en el Irchel Geoparser, herramienta de geoparsing que identifica menciones de lugares en texto y las vincula a coordenadas o entidades geograficas concretas.

Tecnicamente se trata de un ajuste fino de distiluse-base-multilingual-cased-v1 (arquitectura DistilBERT, 134.734.080 parametros) sobre 8.255 pares texto-descripcion de articulos de prensa suizos en aleman. La innovacion del modelo es que las descripciones candidatas del gazetteer se enriquecen con contexto espacial derivado del resolver H3 (ma-geoparser-h3-resolver, configuracion de discretizacion config2: centro H3 con resolucion maxima 10). El resultado es un encoder que proyecta menciones textuales y descripciones geograficas en un espacio vectorial comun donde la similitud coseno permite desambiguar toponimos homonimos.

Es relevante porque aborda un problema clasico y mal resuelto del procesamiento de lenguaje natural geografico: un mismo nombre de lugar (por ejemplo, un municipio suizo) puede aparecer en multiples ubicaciones, y resolverlo exige combinar senales textuales y espaciales. El modelo es pequeno, ligero y desplegable en CPU, lo que lo hace apto para pipelines de geoparsing a escala sobre volumenes grandes de noticias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (sentence-transformer basado en distiluse-base-multilingual-cased-v1) |
| Parametros totales | 134.734.080 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, cuantizacion no documentada por el autor) |
| Idiomas soportados | aleman (de); el modelo base es multilingue |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | sentence-similarity |
| Dimension de embedding | no disponible |
| Tamano del repositorio | 0,5 GB |
| Modelo base | sentence-transformers/distiluse-base-multilingual-cased-v1 |

## Arquitectura y entrenamiento

El modelo es un sentence-transformer de tipo bi-encoder construido sobre DistilBERT, la variante destilada de BERT con 134,7 millones de parametros. Se inicializa desde distiluse-base-multilingual-cased-v1, un modelo de embeddings multilingue que comparte espacio vectorial entre idiomas, y se ajusta posteriormente para la tarea especifica de resolucion de toponimos. La tarea consiste en calcular similitud semantica entre la mencion de un lugar extraida de un texto y las descripciones candidatas de entidades del gazetteer swissNAMES3D.

El ajuste fino se realizo con 8.255 pares texto-descripcion, empleando perdida contrastiva, un learning rate de 1e-5 y 2 epocas. La innovacion principal respecto a aproximaciones previas (como dguzh/geo-all-MiniLM-L6-v2) es que las descripciones candidatas no son solo datos textuales del gazetteer: se enriquecen con contexto espacial generado mediante el resolver basado en indices H3 (ma-geoparser-h3-resolver), en su configuracion de discretizacion config2, que usa el centro de la celda H3 con resolucion maxima 10. Esta representacion espacial permite al modelo discriminar candidatos geograficamente cercanos o distinguir lugares con nombre identico pero ubicacion distinta. Los datos de entrenamiento provienen de articulos periodisticos suizos en aleman.

## Capacidades

- Generacion de embeddings de frases y textos para similitud semantica (pipeline sentence-similarity).
- Resolucion de toponimos: vinculacion de menciones de lugares en texto a entidades concretas del gazetteer swissNAMES3D.
- Desambiguacion de nombres de lugar homonimos mediante combinacion de senales textuales y contexto espacial.
- Geoparsing integrado en el Irchel Geoparser a traves de la clase SpatialSentenceResolver del paquete geoparser_h3_resolver.
- Procesamiento de texto en aleman (idioma declarado); el modelo base soporta capacidades multilingues no verificadas especificamente para esta tarea.
- Compatible con Text Embeddings Inference (tag text-embeddings-inference) y con endpoints (tag endpoints_compatible).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Geoparsing de noticias suizas: extraer menciones de lugares en articulos de prensa en aleman y vincularlas a coordenadas del gazetteer swissNAMES3D, aprovechando el contexto espacial para resolver ambiguedades entre municipios o localidades con nombres repetidos.
- Analisis de medios a escala: indexar grandes volumenes de articulos y generar mapas de cobertura geografica por tema o entidad, usando el modelo como componente de similitud dentro de un pipeline batch.
- Monitorizacion de eventos locales: detectar en que localidad concreta ocurre un suceso descrito en prensa cuando el toponimo citado es ambiguo a nivel nacional.
- Enriquecimiento de bases de datos periodisticas: asignar metadatos geograficos a textos historicos o archivos documentales escritos en aleman.
- Sistemas de busqueda geografica: implementar busqueda semantica donde la consulta sea una descripcion de lugar y los resultados sean entidades geograficas del gazetteer.
- Investigacion en geografia computacional: utilizar el modelo como baseline reproducible en experimentos de resolucion de toponimos, dado que se publica junto a un marco de tesis y codigo de experimentos.
- Integracion en sistemas de informacion territorial: resolver menciones de nombres de lugar procedentes de formularios o documentos administrativos contra el catalogo oficial swissNAMES3D.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU viable: con 134,7 millones de parametros, el modelo puede ejecutarse sin GPU para volumenes moderados de texto.
- VRAM estimada: aproximadamente 0,55 GB en FP32; aproximadamente 0,27 GB en FP16; aproximadamente 0,14 GB en INT8 (estimaciones derivadas del numero de parametros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100. Cabria en RTX 3060, RTX 4090, e incluso en GPUs de gama de entrada.
- Despliegue: puede servirse con sentence-transformers, Text Embeddings Inference (tag oficial) y cualquier runtime compatible con safetensors y sentence-transformers. No se documenta soporte GGUF ni Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| geo-distiluse-swissnames3d-config2 | 134,7 M | de (base multilingue) | Contexto espacial H3, config2 | apache-2.0 | HuggingFace |
| geo-distiluse-swissnames3d-config1 | no disponible | de (base multilingue) | Contexto espacial H3, config1 | apache-2.0 (no confirmado en la ficha) | HuggingFace |
| geo-distiluse-swissnames3d | no disponible | de (base multilingue) | Descripciones por defecto (sin contexto espacial) | apache-2.0 (no confirmado en la ficha) | HuggingFace |
| dguzh/geo-all-MiniLM-L6-v2 | no disponible | no disponible | Resolucion de toponimos con MiniLM | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada. Las variantes de la misma familia (config1, config2 y la version base) corresponden a distintas tesis del trabajo (M3, M4, M5), segun la tabla publicada por el autor.

## Limitaciones y advertencias

- El modelo esta entrenado especificamente para aleman y para el gazetteer suizo swissNAMES3D; su rendimiento fuera de ese dominio o idioma no esta documentado.
- Es un modelo de embeddings para similitud y resolucion de toponimos; no genera texto ni mantiene conversaciones. No debe usarse como LLM generativo.
- El sesgo geografico esta sesgado hacia Suiza y hacia el vocabulario de swissNAMES3D, por lo que puede fallar en lugares no presentes en ese gazetteer.
- Procede de articulos de prensa suizos en aleman, lo que puede introducir sesgos de estilo periodistico y de cobertura mediatica.
- No se han publicado benchmarks, por lo que no hay evidencia cuantificada de su rendimiento frente a alternativas.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de asignacion incorrecta de un toponimo (falso positivo de resolucion) cuando el contexto textual o espacial es insuficiente.
- Aunque la licencia es apache-2.0, el gazetteer swissNAMES3D pertenece a swisstopo y su uso puede estar sujeto a condiciones propias; conviene revisar los terminos de la fuente de datos antes de un despliegue comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.
- Los embeddings se almacenan en safetensors; no se documentan versiones cuantizadas ni soporte para runtimes de inferencia en CPU de bajo nivel como llama.cpp.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/segmue/geo-distiluse-swissnames3d-config2
- Modelo base: https://huggingface.co/sentence-transformers/distiluse-base-multilingual-cased-v1
- Variante sin contexto espacial: https://huggingface.co/segmue/geo-distiluse-swissnames3d
- Variante config1: https://huggingface.co/segmue/geo-distiluse-swissnames3d-config1
- Modelo de referencia del enfoque: https://huggingface.co/dguzh/geo-all-MiniLM-L6-v2
- Irchel Geoparser: https://github.com/dguzh/geoparser
- Resolver espacial H3: https://github.com/segmue/ma-geoparser-h3-resolver
- Codigo de experimentos de la tesis: https://github.com/segmue/ma-experiments
- Gazetteer swissNAMES3D (swisstopo): https://www.swisstopo.admin.ch/en/landscape-model-swissnames3d
