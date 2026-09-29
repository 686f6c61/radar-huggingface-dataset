# lwstrickland/arabidopsis-motifai-v1.0-xgbc

## Resumen

arabidopsis-motifai-v1.0-xgbc es un clasificador tabular basado en XGBoost (version 1.7.6) publicado por el usuario lwstrickland. No es un modelo de lenguaje: es el modelo subyacente del software MotifAI y su tarea es predecir la probabilidad de que un motivo de ADN detectado por la herramienta de escaneo FIMO en el genoma de la planta modelo *Arabidopsis thaliana* corresponda a un sitio de union real de un factor de transcripcion, segun los datos de DAP-seq disponibles.

El modelo se entreno en R sobre datos de DAP-seq de *A. thaliana* (O'Malley 2016) con 28 caracteristicas geneticas, epigeneticas y evolutivas, usando una funcion objetivo logistica binaria (`binary:logistic`) con 100 rondas de boosting. Se evaluo con AUPRC, F1 y Precision@K, aunque la model card no publica los valores numericos obtenidos.

Su relevancia es eminentemente practica: actua como filtro de falsos positivos en la anotacion de sitios de union a factores de transcripcion en plantas, un paso critico en pipelines de genomica regulatoria donde el escaneo de motivos por si solo genera una tasa elevada de candidatos espurios. Se distribuye con licencia MIT y en formato de pesos UBJ de XGBoost, pensado para ser cargado por un script auxiliar de R invocado desde la interfaz de linea de comandos `motifai`, no como servicio de inferencia general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Arboles de decision con boosting de gradiente (XGBoost 1.7.6); clasificador tabular, no neuronal |
| Parametros totales | no disponible (el modelo consta de 100 iteraciones de boosting sobre 28 caracteristicas de entrada; la model card no indica profundidad de arbol ni numero de hojas) |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica (clasificador tabular; recibe 28 caracteristicas por muestra, no secuencias de texto) |
| Tipos de cuantizacion | no aplica (modelo de arboles; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | UBJ (Universal Binary JSON de XGBoost; fichero `arabidopsis-motifai-v1.0-xgbc.ubj`) |
| Tarea | Clasificacion binaria: sitio de union a factor de transcripcion genuino frente a falso positivo |
| Numero de caracteristicas de entrada | 28 |
| Objetivo de entrenamiento | `binary:logistic`, `nrounds = 100`, `nthread = 10` |
| Organismo de entrenamiento | *Arabidopsis thaliana* (datos DAP-seq de O'Malley 2016) |
| Software asociado | MotifAI (`motifai`) |
| Tamano del repositorio | 0.0 GB (segun los metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion / ultima actualizacion | 2026-09-29 |

## Arquitectura y entrenamiento

El modelo es un conjunto de arboles de decision entrenados con boosting de gradiente mediante la implementacion XGBoost 1.7.6, invocada desde R con `xgb.train(objective = "binary:logistic", nrounds = 100, nthread = 10)`. La model card no especifica hiperparametros adicionales (profundidad maxima, tasa de aprendizaje, subsampling de filas o columnas, regularizacion L1/L2, semilla aleatoria) ni la particion de entrenamiento, validacion y test empleada, por lo que el ajuste fino del modelo no es auditable con la informacion disponible. Tampoco se documenta el numero exacto de sitios positivos y negativos ni el balance de clases del conjunto de entrenamiento.

Las 28 caracteristicas de entrada se agrupan en cuatro familias. Las metricas de FIMO aportan log-odds, valores *p* y valores *q* del escaneo de motivos. Los predictores evolutivos incluyen solapamiento con secuencias no codificantes conservadas (CNS) y puntuaciones PhyloP y PhastCons. Los predictores geneticos cubren solapamiento con elementos transponibles (TE), contenido de GC, distancia al gen mas cercano y posicion relativa al gen (promotor, intron, 3'-UTR, etcetera). Los predictores epigeneticos comprenden niveles de metilacion CG, CHG y CHH, presencia o ausencia de citosinas en esos contextos, senal de ChIP-seq para las modificaciones de histonas H3K4me1, H3K4me3, H3K27me3, H3K36me3 y H3K56ac, y solapamiento y senal de accesibilidad en regiones de cromatina accesible (ACR). No se documentan innovaciones tecnicas adicionales ni etapas de ajuste por preferencias humanas, algo que no aplica a este tipo de modelo.

## Capacidades

- Clasificacion binaria de motivos de union a factores de transcripcion, con salida de probabilidad calibrada por la funcion logistica.
- Filtrado de falsos positivos generados por el escaneo de motivos con FIMO sobre secuencias genomicas de *Arabidopsis thaliana*.
- Integracion de senales heterogeneas en una unica puntuacion: contexto de secuencia, conservacion evolutiva, metilacion del ADN, modificaciones de histonas y accesibilidad de cromatina.
- Carga y ejecucion desde R mediante `xgboost::xgb.load()` sobre el fichero UBJ.
- Invocacion indirecta a traves del ejecutable de linea de comandos `motifai`, que gestiona la carga del modelo y la prediccion sobre secuencias de entrada definidas por el usuario.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta razonamiento multi-paso, agentes ni generacion de texto.
- No tiene capacidades multilingues ni de vision o audio.
- No dispone de modo "thinking" ni de ninguna capacidad generativa.

## Casos de uso

- Filtrado de motivos en pipelines de regulacion transcripcional: tras ejecutar FIMO sobre regiones promotoras de interes, el modelo puntua cada hit y permite descartar candidatos con baja probabilidad de union real, reduciendo el volumen de resultados que pasa a validacion manual o experimental.
- Priorizacion de sitios para validacion con ChIP-seq o EMSA: dado que el modelo combina evidencia epigenetica y de conservacion, los sitios con probabilidad alta son candidatos razonables para disenos experimentales costosos.
- Anotacion de redes regulatorias gen a gen: los sitios filtrados pueden alimentar inferencias de reguladores upstream en estudios de expresion diferencial en *A. thaliana*.
- Analisis de regiones de cromatina accesible: como la entrada incluye senal de ACR y modificaciones de histonas, el modelo es adecuado para interpretar picos de ATAC-seq en terminos de probabilidad de union a factores de transcripcion.
- Estudio del impacto de la metilacion en la union de factores: al incorporar niveles CG, CHG y CHH, permite evaluar si un motivo candidato mantiene su probabilidad de union en contextos de metilacion alta o baja.
- Analisis de elementos transponibles: la caracteristica de solapamiento con TE permite cuantificar si motivos embebidos en transposones tienen menor probabilidad de ser sitios de union funcionales.
- Analisis de conservacion de sitios regulatorios entre accesiones o especies cercanas: las puntuaciones PhyloP y PhastCons y el solapamiento con CNS forman parte de la entrada, lo que permite explorar el efecto de la conservacion sobre la prediccion.
- Reproduccion y docencia en genomica de plantas: al ser un modelo pequeno con licencia MIT, es reutilizable en cursos o talleres practicos de analisis de motivos sin requisitos de hardware especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el modelo se evaluo mediante AUPRC, F1 y Precision@K, pero no proporciona los valores numericos, ni el conjunto de evaluacion, ni una comparacion con lineas base (por ejemplo, FIMO sin filtrado). En consecuencia, no es posible presentar una tabla de resultados sin inventar cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB. Se trata de un conjunto de 100 arboles de boosting sobre 28 caracteristicas, por lo que la inferencia se ejecuta en CPU y no requiere GPU. Esta estimacion se deriva de la naturaleza del modelo; la model card no publica requisitos de hardware.
- GPU recomendadas: no aplica. No se documenta soporte de aceleracion por GPU ni su necesidad.
- Compatibilidad con GPU de consumo: no aplica, al no requerir GPU.
- Memoria del sistema: no disponible con precision; por el tamano del repositorio (0.0 GB segun los metadatos) y la estructura del modelo, el consumo esperado es de pocos megabytes, aunque conviene verificar el tamano real del fichero UBJ.
- Opciones de despliegue: R con el paquete `xgboost` (carga mediante `xgboost::xgb.load()`), y el ejecutable de linea de comandos `motifai` del repositorio MotifAI. No se documentan integraciones con vLLM, llama.cpp, Ollama, TGI ni servidores de inferencia de modelos de lenguaje, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible. La model card no publica mediciones.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables, ni resultados frente a alternativas. Como referencia contextual no cuantificada, en el ambito de la prediccion de sitios de union a factores de transcripcion existen predictores basados en aprendizaje profundo entrenados sobre datos genomicos y epigenomicos, ademas del propio escaneo de motivos con FIMO sin filtrado posterior, que actua como linea base. No se dispone de datos de parametros, contexto ni rendimiento de esas alternativas en la informacion consultada, por lo que no se ofrece tabla comparativa.

## Limitaciones y advertencias

- Especificidad de organismo: el modelo se entreno exclusivamente con datos de DAP-seq de *Arabidopsis thaliana*. Su aplicacion a otras especies carece de validacion documentada.
- Cobertura limitada de factores de transcripcion: al depender de DAP-seq, solo puede modelar de forma fiable la clase de factores con datos experimentales disponibles en ese conjunto.
- Dependencia de caracteristicas externas: las 28 caracteristicas incluyen senales de metilacion, ChIP-seq de modificaciones de histonas, accesibilidad de cromatina y puntuaciones de conservacion. Si esas pistas no estan disponibles para la region de estudio, la prediccion no puede calcularse o pierde parte de su senal.
- Entrada restringida: el modelo presupone que los motivos han sido identificados previamente con FIMO. No procesa secuencias crudas ni realiza descubrimiento de motivos.
- Ausencia de metricas publicadas: no se ofrecen valores de AUPRC, F1 ni Precision@K, ni detalles del conjunto de evaluacion, lo que impide verificar el rendimiento real y compararlo con alternativas.
- Opacidad del entrenamiento: no se documentan hiperparametros completos, particion de datos, balance de clases ni semilla, lo que dificulta la reproducibilidad.
- Riesgo de falso positivo y falso negativo: como todo clasificador, puede aceptar sitios espurios con alta puntuacion y descartar sitios funcionales, especialmente en contextos epigeneticos atipicos.
- Version del genoma no especificada: la model card no indica la version de ensamblado ni la anotacion usada, lo que puede generar desalineacion de coordenadas y caracteristicas si el usuario trabaja con otra version.
- Licencia: MIT, permisiva y compatible con uso comercial, siempre que se conserve el aviso de copyright y la licencia.
- Estado del repositorio: 0 descargas, 0 likes y un tamano declarado de 0.0 GB en el momento de la consulta. Conviene verificar que el fichero UBJ esta efectivamente disponible antes de integrarlo en un pipeline.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lwstrickland/arabidopsis-motifai-v1.0-xgbc
- Software MotifAI (repositorio del autor): https://github.com/lwstrickland/Motif_AI
- O'Malley et al. 2016, datos de DAP-seq en *Arabidopsis thaliana*, citado en la model card: enlace no disponible
- Documentacion de FIMO (herramienta de escaneo de motivos citada): no disponible en la informacion proporcionada
- Documentacion de XGBoost 1.7.6: no disponible en la informacion proporcionada
