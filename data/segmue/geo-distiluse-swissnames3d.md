# segmue/geo-distiluse-swissnames3d

## Resumen

geo-distiluse-swissnames3d es un sentence-transformer especializado en la resolucion de toponimos (toponym resolution) contra el gazetteer suizo swissNAMES3D. Lo publica el usuario segmue como artefacto de su tesis de master en la Universidad de Zurich (2026), titulada *Describing Places by Their Surroundings: Enriching Candidate Descriptions with Spatial Context for Toponym Resolution*. El modelo no genera texto: convierte menciones de lugares y descripciones de candidatos del gazetteer en vectores con los que se calcula similitud semantica y se elige el candidato correcto.

Se construye por fine-tuning de sentence-transformers/distiluse-base-multilingual-cased-v1, un encoder transformer multilingue de tipo DistilUSE con 134.734.080 parametros. El entrenamiento usa 8.255 pares texto-descripcion en aleman, extraidos de noticias suizas, con perdida contrastiva, learning rate 1e-5 y 2 epocas. Las descripciones de candidatos siguen el formato por defecto del Irchel Geoparser: nombre, clase, municipio, distrito y canton.

Su relevancia es acotada pero clara: es una pieza de infraestructura para pipelines de geoparsing en aleman sobre territorio suizo, pensada para integrarse en el Irchel Geoparser como `SentenceTransformerResolver`. Existe en tres variantes (config1 y config2 anaden contexto espacial a las descripciones de candidatos), lo que lo convierte en un banco de pruebas reproducible para investigacion en resolucion de toponimos. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no publica resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (DistilUSE multilingue derivado de DistilBERT); no se detalla la capa de pooling en la model card |
| Parametros totales | 134.734.080 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no especificada en la model card; el modelo base distiluse-base-multilingual-cased-v1 esta limitado a 128 tokens |
| Tipos de cuantizacion | no se distribuyen versiones cuantizadas; el repositorio solo contiene pesos safetensors en fp32 |
| Idiomas soportados | de (aleman); declarado explicitamente en la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato sentence-transformers) |
| Tarea | sentence-similarity |
| Dimensionalidad del embedding | no indicada en la model card; segun el modelo base, 512 dimensiones |
| Modelo base | sentence-transformers/distiluse-base-multilingual-cased-v1 |
| Tamano del repositorio | 0,5 GB |
| Gazetteer objetivo | swissNAMES3D (swisstopo) |
| Creado / actualizado | 2026-09-25 / 2026-09-25 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un encoder transformer multilingue de tipo DistilUSE, con 134,7 millones de parametros y salida de embedding denso. Sobre esa base, el autor aplica fine-tuning como sentence-transformer para una tarea de similitud: dada una mencion de lugar en un texto y un conjunto de descripciones candidatas del gazetteer, el modelo debe asignar mayor similitud coseno al candidato correcto. El pipeline declarado es `sentence-similarity`, y los tags incluyen `text-embeddings-inference` y `endpoints_compatible`, lo que indica compatibilidad con Text Embeddings Inference para servir el modelo por HTTP.

Los datos de entrenamiento son 8.255 pares texto-descripcion, con perdida contrastiva, learning rate 1e-5 y 2 epocas. El corpus de textos proviene de articulos de prensa suizos en aleman y las descripciones de candidatos siguen el formato por defecto del Irchel Geoparser: nombre, clase, municipio, distrito y canton. No se menciona en la informacion disponible el uso de RLHF, DPO ni ninguna otra etapa de alineacion, algo esperable en un modelo de embeddings. La innovacion tecnica del trabajo de tesis no esta en la arquitectura, sino en las variantes config1 y config2, que enriquecen las descripciones de candidatos con contexto espacial (el entorno del lugar) en lugar de usar solo los atributos administrativos por defecto. El codigo de entrenamiento y evaluacion esta publicado en el repositorio ma-experiments.

## Capacidades

- Generacion de embeddings de frases y textos cortos para similitud semantica y recuperacion densa.
- Resolucion de toponimos: emparejar menciones de lugares en texto aleman con entradas del gazetteer swissNAMES3D.
- Desambiguacion de nombres de lugar ambiguos apoyandose en la descripcion administrativa del candidato (municipio, distrito, canton).
- Recuperacion semantica (retrieval) sobre catalogos de toponimos suizos.
- Uso como componente de un pipeline de geoparsing mediante `SentenceTransformerResolver` del Irchel Geoparser.
- Procesamiento de texto en aleman; el modelo base es multilingue, pero el fine-tuning se realizo solo con datos en aleman, por lo que el rendimiento fuera de ese idioma no esta documentado.
- Tool calling / function calling: no disponible; es un modelo de embeddings, no genera texto ni invoca herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Vision, audio, modo thinking: no disponibles.

## Casos de uso

- Geoparsing de archivos de prensa suiza: extraer menciones de lugares de articulos historicos en aleman y anclarlas a coordenadas de swissNAMES3D mediante el Irchel Geoparser; el modelo aporta el paso de desambiguacion entre candidatos con el mismo nombre.
- Monitorizacion de medios en tiempo real: clasificar y geolocalizar noticias de medios suizos en aleman para alimentar paneles de cobertura territorial por canton o distrito.
- Mapas de crisis y sucesos: agrupar noticias sobre incendios, inundaciones o accidentes por municipio, resolviendo menciones ambiguas como nombres de rios, montanas o localidades homonimas.
- Enriquecimiento de metadatos de archivos y bibliotecas digitales: asignar etiquetas geograficas normalizadas a documentos digitalizados, usando la similitud coseno entre el texto y las descripciones del gazetteer.
- Busqueda semantica de lugares: permitir consultas en lenguaje natural del tipo "pueblo junto al lago" o "municipio del Canton de Berna" traduciendolas a vectores y comparandolas con los embeddings de las entradas del gazetteer.
- Deduplicacion y normalizacion de toponimos: unificar variantes de escritura de un mismo lugar en bases de datos de clientes, direcciones o registros administrativos.
- Investigacion en resolucion de toponimos: las tres variantes publicadas (default, config1 y config2) permiten comparar experimentalmente el efecto del contexto espacial en la desambiguacion dentro de un mismo marco de evaluacion.
- Preprocesado para sistemas de recomendacion local o logistica: normalizar la ubicacion mencionada en reseñas o incidencias antes de asignarla a una zona de reparto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (ni exactitud de resolucion, ni top-1/top-3, ni resultados sobre conjuntos de test), y el repositorio registra 0 descargas y 0 likes, por lo que no hay evaluaciones externas citables. Cualquier cifra de rendimiento para este modelo deberia obtenerse ejecutando el codigo de evaluacion del repositorio ma-experiments.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,5-1 GB en fp32 para un lote pequeno, dado que el modelo tiene 134,7 millones de parametros (aproximadamente 540 MB de pesos en fp32 y 270 MB en fp16).
- GPU recomendadas: cualquier GPU moderna sirve; el modelo es sobredimensionado para tarjetas de gama alta. Una T4, L4 o A10 es suficiente para servir cargas altas, y una A100 o H100 solo tendria sentido en despliegues con lotes muy grandes o multiples modelos en el mismo servidor.
- Consumer GPU: si, cabe holgadamente en cualquier GPU de consumo con 4 GB o mas de VRAM (GTX 1650, RTX 3060, RTX 4090). Tambien es viable en CPU: es un encoder de 134,7 millones de parametros con 6 capas efetivas en el modelo base, por lo que la inferencia en CPU es practica para volumenes moderados.
- Opciones de despliegue: sentence-transformers (via `SentenceTransformerResolver` del Irchel Geoparser), transformers con codificacion manual, y Text Embeddings Inference (los tags del repositorio incluyen `text-embeddings-inference` y `endpoints_compatible`, lo que permite desplegarlo como endpoint de embeddings). No se distribuyen pesos en GGUF ni artefactos para llama.cpp u Ollama, y al ser un encoder no es un candidato natural para vLLM.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Como referencia cualitativa, un encoder de este tamano en GPU moderna procesa lotes de cientos de textos por segundo, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dim. embedding | Idioma de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| segmue/geo-distiluse-swissnames3d | 134.734.080 | no especificado (base: 128 tokens) | no indicado (base: 512) | de, noticias suizas | apache-2.0 | safetensors en HF |
| dguzh/geo-all-MiniLM-L6-v2 | no verificado en la informacion disponible (base all-MiniLM-L6-v2) | no disponible | no disponible | toponimia multilingue | no verificada en la informacion disponible | safetensors en HF |
| sentence-transformers/distiluse-base-multilingual-cased-v1 | 134,7 M (identico al modelo base) | 128 tokens | 512 | multilingue generico | apache-2.0 | safetensors en HF |

El unico comparable directo citado por el propio autor es dguzh/geo-all-MiniLM-L6-v2, del que este modelo adopta el enfoque metodologico; no se han publicado en la informacion disponible comparaciones de rendimiento entre ambos. Frente al modelo base distiluse-base-multilingual-cased-v1, la diferencia es el fine-tuning sobre noticias suizas y descripciones de swissNAMES3D, que restringe su dominio a cambio de especializacion. Las dos variantes hermanas (swissnames3d-config1 y swissnames3d-config2) son alternativas dentro del mismo trabajo, con descripciones de candidatos enriquecidas con contexto espacial.

## Limitaciones y advertencias

- Ambito geografico restringido: el gazetteer swissNAMES3D cubre Suiza, por lo que el modelo no sirve para resolver toponimos de otros paises sin reentrenamiento.
- Idioma: la model card declara unicamente aleman. Aunque el modelo base es multilingue, no hay evidencia de que el fine-tuning conserve un rendimiento util en otras lenguas.
- Dominio de entrenamiento estrecho: 8.255 pares procedentes de prensa suiza en aleman. Es probable que el rendimiento caiga en registros muy distintos (texto juridico, redes sociales, transcripciones orales).
- Ausencia de evaluacion publicada: no hay benchmarks, curvas de aprendizaje ni analisis de errores en la informacion disponible. No deberia asumirse ninguna cifra de exactitud.
- Modelo de embeddings: no genera texto, por lo que no alucina en el sentido habitual, pero si puede producir similitudes erroneas que lleven a asignar coordenadas incorrectas, con el consiguiente riesgo de errores silenciosos en produccion si no se anade validacion.
- Longitud de contexto limitada por el modelo base (128 tokens), lo que restringe el uso de descripciones de candidato largas o de ventanas de texto amplias.
- Dependencia externa: el flujo de uso documentado requiere el Irchel Geoparser y datos de swissNAMES3D; no es un modelo autonomo.
- Licencia del modelo: apache-2.0, permite uso comercial y modificacion. Sin embargo, los datos del gazetteer swissNAMES3D son de swisstopo y tienen sus propias condiciones de uso (atribucion), que se aplican al producto derivado con independencia de la licencia del modelo.
- Madurez: artefacto de tesis con 0 descargas y 0 likes, sin mantenimiento demostrado ni issues publicos. Para produccion conviene fijar la revision del repositorio y prever sustitucion.
- Los resultados de busqueda web asociados a esta consulta no contienen informacion tecnica relevante sobre el modelo y no se han utilizado como fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/segmue/geo-distiluse-swissnames3d
- Variante con contexto espacial config1: https://huggingface.co/segmue/geo-distiluse-swissnames3d-config1
- Variante con contexto espacial config2: https://huggingface.co/segmue/geo-distiluse-swissnames3d-config2
- Modelo base: https://huggingface.co/sentence-transformers/distiluse-base-multilingual-cased-v1
- Modelo de referencia metodologica: https://huggingface.co/dguzh/geo-all-MiniLM-L6-v2
- Irchel Geoparser (repositorio): https://github.com/dguzh/geoparser
- Codigo de entrenamiento y evaluacion: https://github.com/segmue/ma-experiments
- Tesis de master, Universidad de Zurich, 2026: *Describing Places by Their Surroundings: Enriching Candidate Descriptions with Spatial Context for Toponym Resolution* (sin URL disponible en la informacion proporcionada)
- Gazetteer swissNAMES3D (swisstopo): no disponible enlace directo en la informacion proporcionada
