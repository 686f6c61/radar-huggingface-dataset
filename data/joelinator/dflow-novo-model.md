# joelinator/dflow-novo-model

## Resumen

DFlowNovo es un modelo para secuenciacion de novo de peptidos a partir de espectros de espectrometria de masas en tandem (MS/MS). Lo publica el usuario de Hugging Face joelinator bajo licencia Apache 2.0 y se distribuye acompanado de una aplicacion Gradio (archivo app.py) que permite cargar espectros y obtener secuencias de peptidos predichas. El modelo se presenta como un framework basado en Discrete Flow Matching (DFM), es decir, modelado generativo en tiempo continuo sobre secuencias de tokens discretos, en lugar de la generacion autorregresiva clasica.

Su principal valor diferencial declarado es el soporte nativo de modificaciones post-traduccionales (PTM) con nomenclatura UNIMOD, incluyendo oxidacion de metionina, carbamidometilacion de cisteina, deamidacion de asparagina y glutamina, fosforilacion de serina, treonina y tirosina, y modificaciones en el N-terminal (acetilacion, carbamilacion y perdida de amoniaco). Ademas incorpora una estrategia de decodificacion denominada Top-k Length Bayesian Beam Decoding, que explora dinamicamente longitudes candidatas ordenadas por verosimilitud posterior conjunta.

El modelo es relevante para el ambito de la proteomica de novo, donde no se dispone de una base de datos de referencia contra la que buscar los espectros (por ejemplo, proteinas de organismos no secuenciados, anticuerpos con hipervariabilidad o muestras con PTM no anotadas). Sin embargo, la informacion publicada es muy limitada: no se detallan parametros, arquitectura concreta, datos de entrenamiento ni resultados de benchmarks, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor indica modelado generativo con Discrete Flow Matching sobre secuencias de tokens discretos; no se especifica la columna vertebral ni el numero de capas) |
| Parametros totales | no disponible (tamano del repositorio: 0,5 GB) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la tarea es secuenciacion de peptidos sobre espectros MS/MS, no generacion de lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (no se detalla en la model card) |
| Tarea | secuenciacion de novo de peptidos con soporte de PTM |
| Formatos de entrada | Mascot Generic Format (.mgf), MGF comprimido (.mgz, .mgf.gz) |
| Formulario de entrada | espectros MS/MS |
| Formulario de salida | secuencias de peptidos con puntuaciones de confianza, masa del precursor, masa calculada del peptido, error de masa en ppm y exportacion a CSV/TSV |
| Decodificacion | Top-k Length Bayesian Beam Decoding (exploracion dinamica de longitudes candidatas) |
| Parametros de inferencia expuestos | numero de pasos de integracion, numero de longitudes candidatas, escala de guiado (guidance scale) |
| PTM soportadas | M(ox)/M[UNIMOD:35] (+15,9949 Da), C(cam)/C[UNIMOD:4] (+57,0215 Da), N(deam)/Q(deam)/[UNIMOD:7] (+0,9840 Da), S(ph)/T(ph)/Y(ph)/[UNIMOD:21] (+79,9663 Da), N-terminal acetilacion (+42,01)/[UNIMOD:1] (+42,0106 Da), N-terminal carbamilacion (+43,01)/[UNIMOD:5] (+43,0058 Da), N-terminal perdida de amoniaco (-17,03)/[UNIMOD:385] (-17,0265 Da) |
| Interfaz de despliegue incluida | aplicacion Gradio (sdk gradio 6.27.0, app_file app.py) |
| Fecha de creacion del repositorio | 2026-09-15 |
| Fecha de ultima actualizacion | 2026-09-15 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe el modelo como un framework de Discrete Flow Matching (DFM), una familia de modelos generativos que define un proceso de flujo en tiempo continuo sobre secuencias de tokens discretos. En lugar de generar tokens de forma autorregresiva, el modelo aprende una dinamica que transforma una distribucion simple en la distribucion de secuencias de peptidos, lo que en principio permite reconstrucciones mas coherentes y un control explicito del numero de pasos de integracion en inferencia. El autor no publica detalles sobre el numero de parametros, la profundidad de la red, el tipo de tokenizador (previsiblemente un vocabulario de residuos aminoacidicos y modificaciones) ni la funcion de perdida concreta empleada.

Tampoco se especifican los datos de entrenamiento: no hay informacion sobre el numero de espectros utilizados, la composicion del dataset, el origen de los ficheros MGF ni si se emplearon tecnicas de ajuste adicionales como RLHF o DPO (poco habituales en este dominio, donde lo comun es el entrenamiento supervisado sobre espectros anotados). La innovacion tecnica destacada por el autor es doble: por un lado, el modelado generativo con DFM sobre tokens discretos; por otro, la estrategia de decodificacion Top-k Length Bayesian Beam Decoding, que explora simultaneamente varias longitudes candidatas de peptido ordenadas por verosimilitud posterior conjunta en lugar de fijar una longitud a priori. El soporte de PTM con notacion UNIMOD se plantea como parte central del diseno, no como un post-procesado externo.

## Capacidades

- Prediccion de secuencias de peptidos a partir de espectros MS/MS en formato .mgf, .mgz o .mgf.gz.
- Modelado explicito de modificaciones post-traduacionales con notacion UNIMOD y notacion abreviada: oxidacion de metionina, carbamidometilacion de cisteina, deamidacion de asparagina y glutamina, fosforilacion de serina, treonina y tirosina, acetilacion N-terminal, carbamilacion N-terminal y perdida de amoniaco N-terminal.
- Estimacion de la longitud del peptido mediante exploracion de multiples candidatas ponderadas por verosimilitud posterior (Top-k Length Bayesian Beam Decoding).
- Calculo de la masa calculada del peptido, comparacion con la masa del precursor y reporte del error en ppm.
- Puntuaciones de confianza por prediccion, exportables para filtrado posterior.
- Exportacion de resultados en CSV y TSV para su integracion en pipelines externos.
- Ajuste de parametros de inferencia: pasos de integracion, numero de longitudes candidatas y escala de guiado.
- No se declaran capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto general, y no procede esperarlas en un modelo de esta categoria.

## Casos de uso

- Secuenciacion de novo en muestras sin base de datos de referencia: cuando los espectros provienen de organismos cuyo genoma no esta secuenciado o de proteinas ausentes en la base de datos de busqueda, el modelo genera la secuencia directamente desde el espectro, sin depender de un catalogo previo.
- Caracterizacion de anticuerpos monoclonales y biosimilares: las cadenas variables contienen regiones hipervariables dificiles de asignar por busqueda en base de datos, y el soporte de deamidacion de asparagina y oxidacion de metionina permite detectar variantes de degradacion relevantes para la estabilidad del producto.
- Fosfoproteomica y estudios de senalizacion celular: el soporte explicito de S(ph), T(ph) y Y(ph) con masa de +79,9663 Da permite localizar sitios de fosforilacion en peptidos cuyos espectros no encajan en una busqueda convencional.
- Verificacion de secuencia en bioprocesos y control de calidad biofarmaceutico: la salida incluye masa calculada, masa del precursor y error en ppm, lo que facilita comprobar que la secuencia predicha es coherente con la masa medida antes de liberar un lote o validar una proteina recombinante.
- Analisis de procesamiento N-terminal: las PTM de acetilacion (+42,0106 Da), carbamilacion (+43,0058 Da) y perdida de amoniaco (-17,0265 Da) permiten estudiar la integridad del extremo N-terminal de la proteina, un parametro critico en proteinas terapéuticas.
- Metaproteomica de comunidades microbianas: en muestras ambientales o clinicas con mezclas de organismos, la secuenciacion de novo aporta secuencias candidatas que despues pueden asignarse taxonomicamente por similitud.
- Integracion en pipelines bioinformaticos automatizados: la exportacion a CSV/TSV permite encadenar la prediccion con herramientas de validacion estadistica, filtrado por FDR o comparacion contra bases de datos, sin intervencion manual.
- Docencia y prototipado en espectrometria de masas: la aplicacion Gradio incluida en el repositorio permite cargar un fichero MGF de ejemplo, modificar los parametros de inferencia y observar el efecto de los pasos de integracion o del numero de longitudes candidatas en la prediccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de ningun tipo (ni cobertura de peptidos, ni precision de secuencia por residuo, ni comparacion contra otros secuenciadores de novo), y la busqueda web realizada no devolvio enlaces relevantes al modelo ni a una publicacion asociada.

| Benchmark | Resultado |
|---|---|
| Metricas de secuenciacion de novo (precision por residuo, cobertura, AUC) | no disponible |
| Comparativas con otros modelos del dominio | no disponible |
| Resultados en conjuntos de referencia tipo ProteomeTools o similares | no disponible |

## Requisitos de hardware

- VRAM estimada: no disponible. El unico dato objetivo es el tamano del repositorio (0,5 GB), que sugiere pesos del orden de cientos de megabytes y, por tanto, un consumo de memoria modesto en comparacion con modelos de lenguaje de gran escala. Esta estimacion es una inferencia a partir del tamano del repositorio, no un dato publicado.
- GPU recomendadas: no disponible. No se especifican requisitos minimos ni recomendados.
- Compatibilidad con GPU de consumo: no disponible. Dado el tamano aparente de los pesos, es plausible que quepa en GPU de consumo, pero no hay confirmacion por parte del autor y no debe asumirse.
- Opciones de despliegue: la model card solo documenta la aplicacion Gradio incluida (app.py, sdk gradio 6.27.0) y su ejecucion como Space. No se mencionan vLLM, llama.cpp, Ollama, TGI ni ningun otro servidor de inferencia, y estas herramientas no son aplicables directamente a un modelo de secuenciacion de peptidos.
- Latencia y throughput: no disponible. Los parametros de inferencia expuestos (pasos de integracion, longitudes candidatas, escala de guiado) afectan previsiblemente al coste computacional, pero no se publican mediciones.
- CPU: no disponible si se puede ejecutar solo en CPU.

## Comparativa con modelos similares

No se han proporcionado modelos comparables en la informacion disponible. La model card de DFlowNovo no cita alternativas, no incluye tabla comparativa y la busqueda web realizada no devolvio referencias al modelo ni a otros secuenciadores de novo de peptidos. Por tanto, no es posible establecer una comparacion verificada de parametros, contexto, rendimiento, licencia y disponibilidad con alternativas de la misma categoria.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos comparativos |
|---|---|---|---|---|---|
| DFlowNovo (joelinator) | no disponible | no disponible | apache-2.0 | repositorio en Hugging Face, 0 descargas, 0 likes | no disponible |
| Alternativas del dominio | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de datos tecnicos: no se publican parametros, arquitectura detallada, datos de entrenamiento ni hiperparametros, lo que impide reproducir el modelo o auditar su comportamiento.
- Ausencia de benchmarks: sin metricas no es posible estimar la fiabilidad de las secuencias predichas ni compararlas con las de otras herramientas del dominio.
- Riesgo de predicciones incorrectas: en secuenciacion de novo, errores en un unico residuo o en la localizacion de una PTM pueden alterar por completo la interpretacion biologica. La model card no documenta tasas de error ni umbrales de confianza recomendados.
- Localizacion de PTM no garantizada: aunque el modelo acepta modificaciones con masa definida, no se especifica si resuelve la posicion exacta del sitio modificado ni con que fiabilidad.
- Cobertura de PTM limitada a la lista declarada: cualquier modificacion fuera del conjunto enumerado (oxidacion, carbamidometilacion, deamidacion, fosforilacion y las tres variantes N-terminales) no esta contemplada explicitamente.
- Idiomas y dominio: el modelo no es un modelo de lenguaje general; no debe esperarse soporte multilingue, generacion de texto, codigo, matematicas ni capacidades de agente.
- Adopcion nula y mantenimiento incierto: el repositorio registra 0 descargas y 0 likes, y la unica actualizacion registrada es del mismo dia de su creacion, lo que sugiere un proyecto sin validacion externa ni comunidad activa.
- Fechas anomalas: las marcas de tiempo de creacion y actualizacion (2026-09-15) son posteriores a la fecha habitual de consulta y no coinciden con ningun anuncio o publicacion verificable, lo que conviene tener en cuenta al evaluar la trazabilidad del artefacto.
- Licencia permisiva: Apache 2.0 permite uso comercial y modificacion, pero al no existir informacion sobre el origen de los datos de entrenamiento no puede confirmarse que la licencia cubra todas las obligaciones derivadas de dichos datos.
- Sin garantias de produccion: no hay informacion sobre estabilidad, latencia, gestion de errores de entrada o limites de tamano de fichero MGF.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joelinator/dflow-novo-model
- La busqueda web realizada no devolvio ningun enlace relevante al modelo (paper, blog, repositorio de codigo o demo publica): los resultados obtenidos correspondian a paginas corporativas de Microsoft sin relacion con DFlowNovo.
- Repositorio de codigo adicional: no disponible.
- Publicacion academica asociada: no disponible.
- Demo publica del Space: no disponible.
