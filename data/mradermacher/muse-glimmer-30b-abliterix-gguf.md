# mradermacher/Muse-Glimmer-30B-abliterix-GGUF

## Resumen

Muse-Glimmer-30B-abliterix-GGUF es una cuantizacion en formato GGUF del modelo Muse-Glimmer-30B-abliterix, publicada por el usuario mradermacher. El modelo original, alojado en el repositorio 0xA50C1A1/Muse-Glimmer-30B-abliterix, es una variante "abliterada" o "decensored" de un modelo base de aproximadamente 27.850 millones de parametros, orientada a eliminar los mecanismos de rechazo y moderacion del modelo original. La cuantizacion la realiza mradermacher de forma estatica, sin imatrix, y ofrece un abanico de precisiones que va desde Q2_K hasta Q8_0.

El interes practico de esta publicacion reside en que permite ejecutar un modelo de casi 28.000 millones de parametros en hardware de consumo mediante llama.cpp y derivados, algo inviable con los pesos en precision completa (el repositorio ocupa 197,5 GB). Las versiones Q4_K_M (17,0 GB) y Q4_K_S (16,2 GB) son las recomendadas por el autor para un equilibrio entre velocidad y calidad, mientras que Q8_0 (29,7 GB) se reserva para equipos con mas VRAM.

Se trata de un modelo de tipo conversacional, etiquetado como "abliterated" y "uncensored", con licencia Apache 2.0. La informacion publicada no detalla la arquitectura interna, el contexto maximo ni los datos de entrenamiento del modelo base, por lo que muchos campos de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de tipo conversacional; detalles no publicados) |
| Parametros totales | 27.854.794.240 (aprox. 27,85 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; ademas mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | en (segun la model card; no se detallan mas idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura interna del modelo base Muse-Glimmer-30B-abliterix: no se especifica si emplea atencion completa, atencion lineal, mezcla de expertos ni el numero de capas o cabezas. El recuento real de parametros en safetensors es de 27.854.794.240, lo que situa al modelo en la franja de los 28B densos. La presencia de ficheros mmproj (suplemento multimodal) en el repositorio sugiere capacidades de vision, aunque la model card no lo confirma de forma explicita.

Respecto al entrenamiento, no se detallan el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. La unica informacion tecnica relevante es la naturaleza "abliterada" del modelo: la etiqueta abliterix indica que se han aplicado tecnicas de ablacion de direcciones de rechazo en el espacio de activaciones para reducir la tendencia del modelo a negarse a responder. Las cuantizaciones de este repositorio son estaticas (convert_type hf, sin imatrix); el autor remite a un repositorio separado con cuantizaciones ponderadas por imatrix (sufijo i1) para quienes busquen mayor calidad en tamanos pequenos.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta conversational del repositorio.
- Modo "uncensored" o "decensored": el modelo ha sido modificado para reducir rechazos y respuestas evasivas ante peticiones que el modelo original filtraria.
- Posible soporte multimodal (vision): el repositorio incluye ficheros mmproj-Q8_0 y mmproj-f16, que en llama.cpp se emplean para modelos con proyeccion de imagen; no obstante, la model card no documenta esta capacidad.
- Compatibilidad con endpoints (etiqueta endpoints_compatible), lo que facilita su despliegue mediante APIs compatibles.
- Capacidades de codigo, matematicas, razonamiento o tool calling: no documentadas en la informacion disponible.
- Capacidades multilingues: solo se declara ingles (en); el resto no esta disponible.

## Casos de uso

- Experimentacion con modelos sin moderacion: util para investigadores que estudian el comportamiento de modelos abliterados, comparando respuestas con y sin ablacion de rechazo sobre el mismo prompt.
- Despliegue local en estaciones de trabajo: la cuantizacion Q4_K_M (17,0 GB) permite ejecutar un modelo de 28B en una GPU de consumo con 24 GB de VRAM mediante llama.cpp u Ollama, sin depender de servicios en la nube.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que aborde temas sensibles donde los filtros de seguridad del modelo original interrumpirian la generacion.
- Procesamiento por lotes en servidores propios: con Q8_0 (29,7 GB) sobre GPUs de 40 GB o mas, se puede servir el modelo mediante llama.cpp server para tareas de generacion masiva con control total de los datos.
- Analisis de contenido sensible en entornos de investigacion: clasificacion o resumen de textos que incluyen lenguaje explicito, donde un modelo censurado se negaria a procesar la entrada.
- Prototipado de asistentes conversacionales: gracias a la etiqueta endpoints_compatible, puede integrarse en un backend compatible con la API de OpenAI para pruebas de producto antes de decidir el modelo final.
- Evaluacion de cuantizaciones: el repositorio ofrece once niveles de cuantizacion, lo que permite medir el impacto de la precision en la calidad de salida para un modelo de este tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (solo pesos, sin cache KV): Q2_K 10,8 GB; Q3_K_S 12,6 GB; Q3_K_M 13,8 GB; Q3_K_L 14,8 GB; IQ4_XS 15,4 GB; Q4_K_S 16,2 GB; Q4_K_M 17,0 GB; Q5_K_S 19,4 GB; Q5_K_M 19,9 GB; Q6_K 23,0 GB; Q8_0 29,7 GB. A esto hay que sumar la cache KV, cuyo tamano depende del contexto configurado (no disponible).
- Si se usa el suplemento multimodal, anadir 2,2 GB (mmproj-Q8_0) o 3,9 GB (mmproj-f16).
- GPU de consumo: las cuantizaciones Q4_K_S y Q4_K_M caben en GPUs de 24 GB (RTX 3090, RTX 4090). Q5 y Q6 requieren 24 GB con poco margen o GPUs de 32 GB. Q8_0 no cabe en consumer de 24 GB.
- GPU profesionales: A100 40 GB, A100 80 GB, H100 o L40S permiten Q8_0 con contexto amplio; para Q4_K_M bastan tarjetas de 24 GB.
- Despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; el autor remite a las guias de TheBloke para el uso de ficheros GGUF multiparte. Para el modelo base en precision completa se requiere transformers con safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-abliterix-GGUF (este) | 27,85B | no disponible | Apache 2.0 | GGUF (11 cuantizaciones) | Version abliterada; incluye mmproj multimodal |
| Muse-Glimmer-30B-abliterix (base) | 27,85B | no disponible | Apache 2.0 | safetensors (transformers) | Pesos originales sin cuantizar; repo de 197,5 GB |
| Muse-Glimmer-30B-abliterix-i1-GGUF | 27,85B | no disponible | Apache 2.0 | GGUF con imatrix | Mismo modelo con cuantizaciones ponderadas, mayor calidad en tamanos bajos |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterado: la eliminacion de direcciones de rechazo puede degradar la coherencia en tareas que requieren matices eticos y aumenta el riesgo de generar contenido danino, ilegal o sexualmente explicito. No es apto para aplicaciones orientadas al publico general sin filtros adicionales.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; como todo modelo generativo de este tamano, puede inventar hechos, citas o codigo incorrecto.
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Contexto: la longitud maxima no esta documentada, lo que impide planificar despliegues con ventanas largas sin pruebas previas.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado; conviene revisar las obligaciones de atribucion y las politicas de la plataforma de despliegue.
- Cuantizaciones bajas (Q2_K, Q3_K_S): el propio autor advierte de perdida de calidad; para produccion se recomienda Q4_K_M o superior, o bien las versiones imatrix del repositorio i1.
- Origen de los pesos: el modelo base lo publica un autor no verificado (0xA50C1A1) sin model card detallada; no hay garantias sobre la composicion del dataset de entrenamiento ni sobre la ausencia de datos con derechos.
- Sin benchmarks: no hay evidencia publicada de rendimiento que permita comparar con alternativas; cualquier decision de produccion deberia basarse en evaluaciones propias.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Muse-Glimmer-30B-abliterix-GGUF
- Modelo base: https://huggingface.co/0xA50C1A1/Muse-Glimmer-30B-abliterix
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Muse-Glimmer-30B-abliterix-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Muse-Glimmer-30B-abliterix-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
