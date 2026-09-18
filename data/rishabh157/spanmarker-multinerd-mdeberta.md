# Rishabh157/spanmarker-multinerd-mdeberta

## Resumen

SpanMarker-mDeBERTa-v3-MultiNERD es un modelo de reconocimiento de entidades nombradas (NER) multilingüe desarrollado por Rishabh Kumar (usuario `Rishabh157` en HuggingFace) y publicado bajo licencia Apache 2.0. Se construye sobre el backbone `microsoft/mdeberta-v3-base` (277.555.216 parámetros totales) y se entrena con el framework SpanMarker, que reformula el NER como una tarea de puntuación de spans candidatos [inicio, fin] en lugar del etiquetado secuencial BIO token a token. El resultado es un modelo orientado a maximizar la precisión de fronteras de entidad, con un 87,31 % de precisión global y un 92,71 % de exactitud global en el conjunto de validación de MultiNERD.

El modelo cubre 10 idiomas (inglés, alemán, español, francés, italiano, neerlandés, polaco, portugués, ruso y chino) y 15 tipos de entidad fina (LOC, PER, ORG, ANIM, TIME, EVE, MYTH, VEHI, MEDIA, CEL, PLANT, DIS, INST, FOOD y BIO), lo que suma 31 clases de clasificación incluyendo las etiquetas y la clase `O`. La longitud máxima de secuencia es de 384 tokens y la longitud máxima de entidad de 24 palabras, valores elegidos por el autor para cubrir sin truncamiento la práctica totalidad de las frases del corpus MultiNERD.

Su relevancia actual es doble: por un lado, ofrece una alternativa multilingüe de granularidad fina frente a los taggers BIO clásicos, que suelen fragmentar entidades compuestas; por otro, lo hace con un modelo de tamaño medio (277 M de parámetros, 1,1 GB de pesos en safetensors) desplegable en hardware modesto. Como contrapartida, el modelo presenta un recall notablemente inferior a la precisión (63,24 % frente a 87,31 %) y no cuenta todavía con tracción ni validación externa en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder con attention disentangled (mDeBERTa-v3-base) y cabeza SpanMarker de puntuacion de spans candidatos |
| Parametros totales | 277.555.216 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 384 tokens (`model_max_length`); ventana de marcadores de 128 tokens y longitud maxima de entidad de 24 palabras |
| Tipos de cuantizacion | no disponible; el autor solo publica pesos safetensors sin versiones cuantizadas |
| Idiomas soportados | en, de, es, fr, it, nl, pl, pt, ru, zh (10 idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 1,1 GB) |
| Tarea (pipeline) | token-classification (reconocimiento de entidades nombradas) |
| Numero de tipos de entidad | 15 tipos finos (31 clases incluyendo etiquetas y `O`) |
| Modelo base | microsoft/mdeberta-v3-base |
| Libreria de inferencia | span-marker |
| Dataset de entrenamiento | Babelscape/multinerd (conjunto de validacion: 167.400 frases) |
| Descargas / likes en HuggingFace | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo combina dos piezas. La primera es `microsoft/mdeberta-v3-base`, un encoder transformer con mecanismo de attention disentangled que separa el contenido y la posicion relativa en el calculo de la attention, lo que en la practica mejora la modelizacion de dependencias sintacticas y de fronteras de frase. La segunda es el framework SpanMarker, basado en la formulacion de spans candidatos de PL-Marker: en lugar de asignar una etiqueta BIO a cada token, el modelo genera representaciones de marcadores (inicio y fin) y puntua directamente cada par [S_i, E_j] candidato. El autor indica que este diseño puntua los spans "dentro del mecanismo de attention disentangled de mDeBERTa", lo que reduce la fragmentacion de fronteras tipica de los taggers secuenciales y explica el perfil precision-alta / recall-bajo observado.

El entrenamiento se realiza sobre la totalidad del dataset MultiNERD, que abarca los 10 idiomas declarados y 15 tipos de entidad fina. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset por idioma, ni si se aplicaron fases de RLHF o DPO; dado que se trata de una tarea extractiva de etiquetado, estos procedimientos de alineacion no serian de aplicacion directa. Los hiperparametros declarados son: `model_max_length` de 384 tokens (elegido para cubrir el 100 % de las frases de los 10 idiomas sin truncamiento), `entity_max_length` de 24 palabras (cubre el 99,993 % de los spans de entidad) y `marker_max_length` de 128 tokens. El modelo se publica unicamente en formato safetensors, con un tamano de repositorio de 1,1 GB.

## Capacidades

- Reconocimiento de entidades nombradas multilingüe en 10 idiomas (en, de, es, fr, it, nl, pl, pt, ru, zh), incluyendo el chino, lo que implica gestion de texto sin segmentacion por espacios.
- Extraccion de 15 tipos de entidad fina: LOC, PER, ORG, ANIM, TIME, EVE, MYTH, VEHI, MEDIA, CEL, PLANT, DIS, INST, FOOD y BIO.
- Salida de spans con metadatos: el modelo devuelve el texto del span (`span`), la etiqueta (`label`), una puntuacion de confianza (`score`) y los indices de caracteres de inicio y fin (`char_start_index`, `char_end_index`), lo que facilita la integracion directa en pipelines de anotacion.
- Capacidad de detectar entidades de multiples palabras sin fragmentarlas, gracias a la formulacion de spans candidatos en lugar del etiquetado BIO token a token.
- Procesamiento de frases de hasta 384 tokens sin truncamiento en el corpus de referencia.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento: es un modelo puramente discriminativo de etiquetado de spans.
- No se documenta capacidad de generacion de texto: no es un modelo generativo y no debe usarse como tal.

## Casos de uso

- Construccion de grafos de conocimiento y bases de datos de entidades: extraer personas, organizaciones y localizaciones de articulos de noticias en varios idiomas para poblar un KG o un indice de entidades enlazables, aprovechando las clases PER, ORG y LOC.
- Anonimizacion y seudonimizacion de documentos multilingues: detectar menciones de PER, LOC y ORG para enmascararlas antes de compartir un corpus, como paso previo a un pipeline de cumplimiento normativo. Requiere revision humana por el recall del 63,24 %.
- Enriquecimiento de motores de busqueda y sistemas RAG: etiquetar documentos con entidades finas (MEDIA, EVE, TIME, CEL) para permitir filtrado estructurado y facetado de resultados en lugar de busqueda puramente vectorial.
- Monitorizacion de medios y analisis de marca: procesar flujos de noticias en 10 idiomas y agregar menciones de organizaciones, productos y eventos para informes de reputacion o de analisis competitivo.
- Analisis de catalogos editoriales y de entretenimiento: extraer entidades de tipo MEDIA (libros, peliculas, albumes) y PER para enriquecer fichas de catalogo a partir de resenas o articulos.
- Preprocesado para clasificacion de tickets y correos de atencion al cliente multilingüe: detectar organizaciones, localizaciones y periodos de tiempo (TIME) en el texto libre para enrutar automaticamente la incidencia al equipo correcto.
- Analisis de documentacion cientifica, tecnica y de patrimonio cultural: reconocer entidades de tipo PLANT, ANIM, CEL, MYTH y VEHI en textos especializados, con la advertencia de que el rendimiento en clases poco frecuentes es sensiblemente inferior.
- Extraccion de informacion en corpus historicos multilingues: identificar periodos historicos (TIME), eventos (EVE) y entidades mitologicas (MYTH) para construir indices tematicos, asumiendo un F1 del 70,52 % y 62,48 % en esas clases respectivamente.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre el conjunto de validacion oficial de MultiNERD (10 idiomas, 167.400 frases). Las metricas figuran como no verificadas (`verified: false`).

| Metrica | Valor |
|---|---|
| F1 global | 0,7335 (73,35 %) |
| Precision global | 0,8731 (87,31 %) |
| Recall global | 0,6324 (63,24 %) |
| Exactitud global | 0,9271 (92,71 %) |
| Perdida de validacion | 0,0089 |

Desglose por clase de entidad declarado por el autor:

| Clase | Descripcion | Precision | Recall | F1 | Soporte (spans) |
|---|---|---|---|---|---|
| LOC | Localizacion (ciudades, paises, geografia) | 93,53 % | 70,08 % | 80,12 % | 82.574 |
| PER | Persona (nombres, figuras publicas) | 91,35 % | 65,66 % | 76,40 % | 61.945 |
| ORG | Organizacion (empresas, instituciones) | 89,47 % | 66,54 % | 76,32 % | 15.560 |
| ANIM | Animal (fauna, especies) | 79,99 % | 63,62 % | 70,87 % | 15.995 |
| TIME | Tiempo / eras / periodos historicos | 80,43 % | 62,78 % | 70,52 % | 31.701 |
| EVE | Eventos (guerras, deportes, festivales) | 87,20 % | 58,70 % | 70,16 % | 5.767 |
| MYTH | Entidades mitologicas | 78,25 % | 52,01 % | 62,48 % | 1.819 |
| VEHI | Vehiculos (aeronaves, coches, barcos) | 77,56 % | 51,85 % | 62,15 % | 540 |
| MEDIA | Medios (libros, peliculas, albumes) | 85,72 % | 48,09 % | 61,61 % | 15.259 |
| CEL | Cuerpos celestes (planetas, estrellas) | 80,97 % | 49,70 % | 61,60 % | 2.012 |
| PLANT | Especies vegetales | 65,29 % | 50,50 % | 56,95 % | 7.539 |
| DIS | Enfermedades / condiciones medicas | 71,70 % | 39,65 % | 51,06 % | 6.934 |
| INST | Instrumentos / herramientas | 75,42 % | 37,27 % | 49,89 % | 609 |
| FOOD | Comida / bebidas | 63,71 % | 38,62 % | 48,09 % | 6.703 |
| BIO | Entidades biologicas | 60,94 % | 23,35 % | 33,77 % | 167 |

No se han proporcionado resultados comparativos con otros modelos en la informacion disponible, por lo que no es posible situar estas cifras frente a alternativas sin datos adicionales.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 1,1 GB en fp32 (coincide con el tamano del repositorio safetensors) y en torno a 0,55-0,6 GB en fp16/bf16.
- VRAM estimada en inferencia real: del orden de 2-4 GB considerando activaciones y batches moderados con secuencias de 384 tokens; el consumo crece de forma aproximadamente lineal con el tamano de batch y la longitud de secuencia.
- GPU recomendadas: para desarrollo y lotes pequenos, cualquier GPU consumer con 4 GB o mas (GTX 1650, RTX 3060, RTX 4060, RTX 4090); para servicio en produccion con alta concurrencia, T4, L4, A10G, A100 o H100, donde el cuello de botella suele ser el throughput de tokens y no la memoria.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas de VRAM, e incluso en CPU para volumenes bajos o procesamiento por lotes offline.
- Opciones de despliegue: la ruta soportada es `transformers` junto con la libreria `span-marker` (carga mediante `SpanMarkerModel.from_pretrained`); tambien es viable exportar a ONNX Runtime para reducir latencia en CPU. Los servidores de inferencia generica como vLLM o TGI no cubren de forma nativa la cabeza SpanMarker, por lo que requeririan implementacion propia.
- Latencia y throughput: no disponible; el autor no publica mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de benchmarks de modelos comparables, por lo que las columnas de rendimiento se dejan como no disponibles. La tabla recoge unicamente los rasgos estructurales conocidos.

| Modelo | Backbone | Parametros | Tipos de entidad | Contexto | Licencia | F1 en MultiNERD |
|---|---|---|---|---|---|---|
| Rishabh157/spanmarker-multinerd-mdeberta | mdeberta-v3-base | 277.555.216 | 15 (31 clases con etiquetas y `O`) | 384 tokens | apache-2.0 | 0,7335 (autor, no verificado) |
| Babelscape/wikineural-multilingual-ner | basado en XLM-R | no disponible | no disponible | no disponible | no disponible | no disponible |
| Davlan/bert-base-multilingual-cased-ner-hrl | mBERT | no disponible | no disponible | no disponible | no disponible | no disponible |
| microsoft/mdeberta-v3-base | mdeberta-v3-base | 276 M (declarado en la model card) | no aplica (modelo base sin cabeza NER) | no disponible | no disponible | no aplica |

Nota: la busqueda web realizada no devolvio resultados tecnicos relevantes sobre modelos de NER comparables (los resultados obtenidos correspondian a paginas corporativas de Microsoft sin relacion con el modelo), de modo que no se han podido completar las celdas con datos verificados.

## Limitaciones y advertencias

- Desequilibrio precision-recall muy marcado: 87,31 % de precision frente a 63,24 % de recall. El modelo tiende a omitir entidades presentes (falsos negativos) antes que a inventarlas, lo que lo hace poco adecuado para tareas de recuperacion exhaustiva sin revision humana.
- Rendimiento muy bajo en clases minoritarias: BIO (33,77 % F1), FOOD (48,09 %), INST (49,89 %) y DIS (51,06 %). Las entidades biologicas, alimentarias, de instrumentos y medicas no deberian usarse en produccion sin un ajuste adicional.
- Clases con soporte muy reducido en la evaluacion (BIO con 167 spans, INST con 609, VEHI con 540) implican que las metricas de esas categorias tienen alta varianza y baja significacion estadistica.
- Limitacion de contexto: 384 tokens por secuencia. Los documentos largos requieren fragmentacion (chunking), con el consiguiente riesgo de cortar entidades en las fronteras de los fragmentos y de perder menciones en passajes truncados.
- Limite de longitud de entidad de 24 palabras: las entidades mas largas no se representan correctamente.
- Dependencia del dominio: el entrenamiento se realiza sobre MultiNERD, un corpus derivado de Wikipedia; se desconoce su comportamiento en dominios como texto legal, clinico, conversacional o redes sociales.
- Riesgo de alucinacion en sentido estricto bajo (es un modelo extractivo, no genera texto), pero puede asignar etiquetas incorrectas o spans con limites erroneos con puntuaciones de confianza altas; conviene aplicar umbrales sobre el campo `score` y validacion posterior.
- Sesgos potenciales heredados de MultiNERD: cobertura desigual por idioma y por tipo de entidad, y sobrerrepresentacion de entidades occidentales y de actualidad enciclopedica. El autor no publica analisis de sesgo.
- Idiomas: aunque se declaran 10 idiomas, no se proporcionan metricas desglosadas por idioma, por lo que no es posible saber si el rendimiento es homogeneo entre ellos; el chino, sin segmentacion por espacios, es un caso especialmente sensible.
- Licencia Apache 2.0 permite uso comercial y modificacion con atribucion, pero se desconoce la licencia del corpus MultiNERD para determinados usos, por lo que conviene revisarla antes de un despliegue comercial.
- Traccion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de las metricas declaradas (`verified: false` en el model-index) y sin historial de uso en produccion.
- Dependencia de la libreria `span-marker`: el modelo no se carga con un pipeline estandar de `transformers` sin esa libreria, lo que anade una dependencia adicional al stack de despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rishabh157/spanmarker-multinerd-mdeberta
- Perfil del autor: https://huggingface.co/Rishabh157
- Modelo base: https://huggingface.co/microsoft/mdeberta-v3-base
- Framework SpanMarker (repositorio): https://github.com/tomaarsen/SpanMarkerNER
- Dataset MultiNERD: https://huggingface.co/datasets/Babelscape/multinerd

Nota: la busqueda web realizada no devolvio enlaces tecnicos relevantes sobre este modelo ni sobre el framework SpanMarker; los resultados obtenidos correspondian a paginas corporativas de Microsoft sin relacion con la ficha.
