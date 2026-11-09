# lanshi/prenatal-case-dora

## Resumen

`lanshi/prenatal-case-dora` es un clasificador binario de texto especializado en literatura de genetica prenatal. Su tarea concreta es distinguir articulos que son *case report* o *case series* del resto de disenos de estudio (cohorte, cribado/validacion, revision, metodologia, registro). Lo desarrolla el usuario `lanshi` como artefacto de investigacion, no como herramienta de decision clinica.

Tecnicamente es un fine-tuning con DoRA (Weight-Decomposed Low-Rank Adaptation, variante de LoRA implementada en PEFT) sobre el encoder `NeuML/pubmedbert-base-embeddings`, un BERT de dominio biomedico con 110.093.570 parametros totales. Solo se entrenan 611.330 parametros (0,56 % del total): el adaptador DoRA con rango 16 y alfa 32 sobre las proyecciones `query` y `value`, mas una cabeza lineal de 1536 a 2 dimensiones. El modelo base es un encoder, no un generador: no produce texto, emite una puntuacion de probabilidad.

El interes practico esta en el pipeline de encoding de documentos largos (chunks de 480 tokens, hasta 12 chunks, pooling concatenado de medias) y en los umbrales de decision calibrados (0,3962 optimo para F1 y 0,3502 para precision >= 0,90), que permiten ajustar el comportamiento del clasificador segun el coste relativo de falsos positivos y falsos negativos. El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y se publico el 9 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT) con adaptador DoRA y cabeza lineal de clasificacion |
| Parametros totales | 110.093.570 |
| Parametros activos | no disponible (no es MoE); parametros entrenables: 611.330 (0,56 %) |
| Longitud de contexto | 480 tokens por chunk, hasta 12 chunks por documento (ventana efectiva muestreada, no contigua) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser un encoder de 110 M, la cuantizacion es viable pero no esta documentada) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (estado completo: encoder + adaptador DoRA + clasificador) |

## Arquitectura y entrenamiento

El modelo parte de `NeuML/pubmedbert-base-embeddings`, un BERT base entrenado sobre literatura PubMed, y le aplica un adaptador DoRA de PEFT con rango 16, alfa 32 y modulos objetivo `query` y `value`. DoRA descompone la actualizacion de pesos en magnitud y direccion, lo que suele mejorar la estabilidad del fine-tuning respecto a LoRA clasico con el mismo presupuesto de parametros. Sobre la representacion del encoder se anade una cabeza lineal de 1536 a 2 clases.

El encoding de documentos es la parte no estandar. Cada articulo se trocea en fragmentos de 480 tokens, con un maximo de 12 fragmentos: se conservan los 2 primeros y el resto se muestrea de forma uniforme a lo largo del documento. Cada fragmento se pasa por el encoder y se obtiene un vector de 768 dimensiones; luego se calcula la media de todos los chunks y la media de los dos primeros, se normalizan ambos con L2 y se concatenan, dando un vector de 1536 dimensiones que alimenta la cabeza. El entrenamiento usa 864 articulos con anotacion de diseno de estudio (376 de case report/case series y 488 del resto; 110 con etiqueta ausente u "other" se excluyeron). Las etiquetas provienen de un pipeline de anotacion con LLM mas revision, y el autor reconoce ruido: series retrospectivas grandes ocasionalmente etiquetadas como cohorte. El checkpoint final se entreno sobre las 864 filas durante 2 epocas, que es la mediana de la mejor epoca en validacion cruzada.

## Capacidades

- Clasificacion binaria de diseno de estudio en literatura de genetica prenatal: `case` frente a `non-case`.
- Puntuacion de probabilidad calibrada con dos umbrales operativos (0,3962 para F1 optimo y 0,3502 para precision >= 0,90).
- Procesamiento de articulos largos mediante muestreo de chunks (primeros 2 mas fragmentos equiespaciados), lo que permite puntuar texto completo aunque exceda la ventana del encoder.
- Funciona con titulo solo o con titulo mas cuerpo del articulo; el autor indica que metodos y resultados aportan senal util.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un encoder de clasificacion, no un modelo generativo.
- No tiene capacidades multilingues: solo ingles.
- No tiene modo thinking, vision ni audio.

## Casos de uso

- Triaje de corpus para revisiones sistematicas: dado un volcado de PubMed sobre genetica prenatal, el modelo puntua cada articulo y permite separar candidatos de case report/case series antes de la lectura manual, reduciendo el volumen de cribado con un umbral de precision ajustable.
- Construccion de conjuntos de datos etiquetados por diseno de estudio: el clasificador puede preetiquetar articulos y dejar solo la revision humana de los casos cercanos al umbral, lo que acelera la creacion de corpus anotados para otros modelos.
- Filtrado previo en pipelines de extraccion de variantes: si el objetivo es recolectar variantes descritas en casos clinicos, el modelo descarta cohortes y revisiones antes de aplicar NER o extraccion estructurada, ahorrando computo en las etapas caras.
- Enrutado dentro de un pipeline documental: el autor mantiene una regla que retiene titulos con "case report", "case series" o "report of N<100 cases"; el modelo se usa como segunda senal para articulos que no cumplen la regla, combinando ambos criterios.
- Monitorizacion de literatura nueva: ejecutado periodicamente sobre las novedades de PubMed, permite marcar articulos que probablemente sean reportes de caso y priorizar su lectura por parte del equipo clinico o de investigacion.
- Analisis bibliometrico de disenos de estudio: agregando las puntuaciones sobre un corpus historico se pueden estimar proporciones de disenos de estudio por revista, ano o tematica, siempre con revision experta de los resultados.
- Seleccion de candidatos para metaanalisis de casos: cuando un metaanalisis requiere solo series de casos, el modelo filtra el corpus inicial y el investigador revisa unicamente los positivos y los casos limite.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, obtenidos con validacion cruzada estratificada de 5 folds, cada uno con split interno de validacion para early stopping y seleccion de umbral:

| Metrica | Resultado |
|---|---|
| Test average precision (AP) | 0,987 ± 0,009 |
| Test F1 | 0,938 ± 0,021 |
| Test precision (media) | 0,926 |
| Test recall (media) | 0,952 |
| Out-of-fold AUC | 0,970 |
| Out-of-fold AP | 0,965 |
| OOF con umbral 0,3962 | P 0,942 / R 0,947 / F1 0,944 |
| OOF con umbral 0,3502 | P 0,900 / R 0,960 |

Matriz por fold (umbral seleccionado en validacion interna y aplicado al fold reservado):

| Fold | Umbral | TP | FP | FN | TN | Precision | Recall | F1 | AP | AUC |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 0 | 0,6465 | 69 | 3 | 6 | 95 | 0,958 | 0,920 | 0,939 | 0,990 | 0,992 |
| 1 | 0,4327 | 70 | 1 | 5 | 97 | 0,986 | 0,933 | 0,959 | 0,993 | 0,994 |
| 2 | 0,4080 | 74 | 5 | 1 | 93 | 0,937 | 0,987 | 0,961 | 0,996 | 0,997 |
| 3 | 0,2112 | 72 | 11 | 4 | 86 | 0,868 | 0,947 | 0,906 | 0,972 | 0,972 |
| 4 | 0,2449 | 73 | 10 | 2 | 87 | 0,880 | 0,973 | 0,924 | 0,984 | 0,984 |
| Media | — | — | — | — | — | 0,926 | 0,952 | 0,938 | 0,987 | 0,988 |

Matriz de confusion out-of-fold en los umbrales desplegados:

| Umbral | TP | FP | FN | TN | Precision | Recall | F1 |
|---|---:|---:|---:|---:|---:|---:|---:|
| 0,3962 (F1 optimo) | 356 | 22 | 20 | 466 | 0,942 | 0,947 | 0,944 |
| 0,3502 (P >= 0,90 en validacion) | 361 | 40 | 15 | 448 | 0,900 | 0,960 | 0,929 |

No se han publicado comparaciones con otros clasificadores en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB de pesos (110 M parametros), mas activaciones; en la practica cabe en cualquier GPU con 2 GB o mas. En fp16 los pesos ocupan unos 0,22 GB.
- GPU recomendadas: cualquier GPU moderna es suficiente; una T4, L4, RTX 3060 o superior cubre el caso con holgura. Para lotes grandes en CPU tambien es viable por el tamano reducido del modelo.
- Cabe en GPU de consumo: si, en practicamente todas las disponibles desde 2018, e incluso en CPU para volumenes moderados.
- Opciones de despliegue: el repositorio incluye `modeling_case_dora.py`, un modulo autocontenido de inferencia que implementa el chunking, el encoder con DoRA y el pooling. Requiere `torch`, `transformers`, `peft`, `safetensors`, `huggingface_hub` y `numpy`. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama; al no ser un modelo generativo, los servidores de inferencia LLM no son el vehiculo natural.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia estructural, un encoder BERT base procesa del orden de cientos de documentos por segundo en una GPU moderna con lotes adecuados, pero el chunking a 12 fragmentos multiplica el coste por documento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `lanshi/prenatal-case-dora` | 110 M (611 K entrenables) | 480 tokens por chunk, hasta 12 chunks | Clasificacion binaria de diseno de estudio en genetica prenatal | Apache-2.0 | Hugging Face, 0 descargas |
| `NeuML/pubmedbert-base-embeddings` (modelo base) | 110 M | 512 tokens | Embeddings de literatura biomedica | no disponible en la informacion proporcionada | Hugging Face |
| BioBERT / PubMedBERT genericos | ~110 M | 512 tokens | Embeddings y tareas biomedicas generales | habitualmente Apache-2.0 o MIT | Hugging Face |

No se dispone de datos de rendimiento de las alternativas sobre esta misma tarea, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- Artefacto de investigacion: el autor indica explicitamente que no es una herramienta de decision clinica y que no debe usarse para diagnostico ni tratamiento.
- Ambito restringido a literatura de genetica prenatal en ingles; el rendimiento fuera de ese dominio es desconocido.
- Ruido en etiquetas: los disenos de estudio se anotaron con un pipeline de LLM mas revision, y series de casos retrospectivas grandes pueden aparecer etiquetadas como cohorte, lo que introduce errores sistematicos en la clase negativa.
- Truncacion agresiva: los articulos largos se muestrean a 12 chunks (los 2 primeros mas fragmentos equiespaciados), de modo que la evidencia en secciones no muestreadas no se ve y puede perderse informacion decisiva.
- Umbrales calibrados sobre un corpus concreto de 864 articulos; su transferencia a otras distribuciones (otras revistas, otras especialidades, otros anos) no esta validada.
- Solo ingles: articulos en otros idiomas no estan soportados.
- Licencia Apache-2.0, que permite uso comercial, pero los datos de entrenamiento (PDFs de PubMed) no se redistribuyen y las condiciones de uso de esas fuentes deben respetarse por separado.
- Modelo sin traccion: 0 descargas y 0 likes, sin evidencia de uso independiente ni validacion externa.
- No es un modelo generativo: no admite instrucciones en lenguaje natural ni produce justificaciones; solo devuelve una puntuacion y una decision.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lanshi/prenatal-case-dora
- Modelo base: https://huggingface.co/NeuML/pubmedbert-base-embeddings
- Repositorio PEFT (DoRA): https://github.com/huggingface/peft
- Paper de DoRA: https://arxiv.org/abs/2402.09353
