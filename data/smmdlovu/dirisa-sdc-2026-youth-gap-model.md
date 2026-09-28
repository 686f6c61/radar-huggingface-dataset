# smmdlovu/dirisa-sdc-2026-youth-gap-model

## Resumen

El repositorio smmdlovu/dirisa-sdc-2026-youth-gap-model contiene dos modelos estadisticos clasicos, no una red neuronal: un agrupamiento StandardScaler + KMeans con k=4 que segmenta municipios sudafricanos segun su perfil de registro juvenil, y una regresion Ridge que relaciona la tendencia de registro juvenil con el cambio en la participacion electoral global. Lo publica el usuario smmdlovu como entrega del equipo VUT para el DIRISA Student Datathon 2026, una competicion organizada por la Data Intensive Research Initiative of South Africa en torno al uso de datos abiertos de investigacion.

El problema que aborda es concreto: identificar que municipios concentran la brecha de registro de votantes jovenes de mayor tamano y crecimiento mas rapido, y estimar que relacion guarda la participacion juvenil con la participacion total. El primer objetivo se resuelve con clustering y el segundo con una regresion que el propio autor califica explicitamente como senal direccional debil, no como pronostico.

Es relevante ahora por su caracter de artefacto reproducible de ciencia de datos civica: los pesos estan serializados en joblib, la licencia es MIT y las configuraciones de caracteristicas y metricas acompanan al modelo. No es un modelo de lenguaje ni un transformer, por lo que no tiene parametros neuronales, ventana de contexto ni capacidades generativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos modelos scikit-learn independientes: (A) StandardScaler + KMeans (k=4); (B) regresion Ridge. No es una red neuronal ni un transformer |
| Parametros totales | no disponible (el numero de coeficientes de la Ridge depende de las caracteristicas listadas en turnout_model_config.json, no publicadas en la informacion disponible) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular; no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (los modelos lineales y KMeans en scikit-learn no se cuantizan en el sentido habitual de los LLM) |
| Idiomas soportados | no aplica (modelo tabular sobre datos de registro electoral; no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | joblib (serializacion nativa de scikit-learn); ficheros de configuracion JSON: cluster_model_config.json y turnout_model_config.json |
| Libreria | scikit-learn |
| Tamano del repositorio | 0,0 GB (artefactos de pocos megabytes) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 27 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo A es un pipeline no supervisado: estandarizacion de caracteristicas con StandardScaler y agrupamiento KMeans con cuatro clusters sobre perfiles municipales. El autor reporta un coeficiente de silueta de 0,371, un valor que indica una separacion de clusters moderada pero no nitida, coherente con datos socioeconomicos y electorales reales de alta varianza. La eleccion de k=4 no se justifica en la informacion disponible; tampoco se detalla el numero de municipios ni las variables de entrada, que se remiten a cluster_model_config.json.

El modelo B es una regresion Ridge (regresion lineal con regularizacion L2) que toma la tendencia de registro juvenil como predictora del cambio en la participacion electoral global. Se evalua con validacion cruzada leave-one-out (LOOCV), obteniendo un R2 de 0,027 y un error absoluto medio de 1,81 puntos porcentuales. Un R2 tan proximo a cero implica que el modelo explica en torno al 2,7 por ciento de la varianza del objetivo, es decir, apenas supera a un modelo nulo que prediga la media. El autor es explicito al respecto y pide leerlo como senal direccional debil. No se documenta busqueda de hiperparametros, seleccion de caracteristicas, validacion temporal ni tratamiento de autocorrelacion espacial.

No hay datos de entrenamiento en el sentido de corpus: se trabaja sobre conjuntos tabulares de datos abiertos sudafricanos de registro de votantes. No se menciona uso de RLHF, DPO ni tecnicas de aprendizaje profundo.

## Capacidades

- Agrupamiento de municipios en cuatro perfiles mediante KMeans sobre caracteristicas estandarizadas, con asignacion de cluster para nuevas observaciones.
- Identificacion del municipio o municipios con la brecha de registro juvenil mas amplia y de crecimiento mas rapido, segun el autor.
- Regresion Ridge para estimar el cambio en la participacion total a partir de la tendencia de registro juvenil, con salida cuantitativa en puntos porcentuales.
- Inferencia sobre datos tabulares; no genera texto ni mantiene conversaciones.
- No dispone de tool calling, function calling, soporte de agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingues, de vision, de audio ni de modo de razonamiento extendido.
- Reproducibilidad de metricas: el coeficiente de silueta (0,371) y las metricas LOOCV (R2 = 0,027; MAE = 1,81 pp) quedan documentados en la model card y en los ficheros de configuracion.

## Casos de uso

- Priorizacion de campanas de registro electoral: asignando cada municipio a uno de los cuatro clusters, una organizacion civica puede ordenar su esfuerzo de captacion por perfil municipal y concentrarse en el cluster con mayor brecha de registro juvenil.
- Analisis exploratorio para investigadores de ciencias politicas: el pipeline StandardScaler + KMeans sirve como punto de partida reproducible para estudiar tipologias municipales antes de aplicar metodos mas complejos.
- Segmentacion para informes de politica publica: los cuatro perfiles permiten agrupar municipios con caracteristicas similares y disenar intervenciones diferenciadas en lugar de politicas uniformes.
- Cuadros de mando para ONG y medios de datos: el modelo es lo bastante ligero para recalcularse por completo en cada actualizacion del conjunto de datos y alimentar visualizaciones interactivas.
- Docencia y material didactico: es un ejemplo compacto y completo de pipeline de scikit-learn con estandarizacion, clustering, regresion regularizada y validacion cruzada leave-one-out.
- Ingenieria de caracteristicas base: los clusters generados pueden exportarse como variables categoricas para alimentar modelos posteriores mas potentes, incluidos modelos de gradient boosting.
- Caso de estudio metodologico: el R2 de 0,027 es un ejemplo util para ilustrar en formacion la diferencia entre significacion direccional y capacidad predictiva real.
- Reproduccion de resultados de un datathon: cualquier equipo puede descargar el repositorio, ejecutar el pipeline y comparar sus propias metricas con las publicadas.

## Benchmarks y rendimiento

Los unicos resultados publicados son los del propio autor, recogidos en la model card:

| Modelo | Metrica | Valor |
|---|---|---|
| A (StandardScaler + KMeans, k=4) | Coeficiente de silueta | 0,371 |
| B (regresion Ridge) | R2 en validacion cruzada leave-one-out | 0,027 |
| B (regresion Ridge) | MAE en validacion cruzada leave-one-out | 1,81 puntos porcentuales |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K ni equivalentes) porque no aplican a un modelo tabular de esta naturaleza. No se dispone de comparaciones con otros equipos del datathon ni con lineas base publicadas.

## Requisitos de hardware

- VRAM para inferencia: no aplica. Es un modelo de scikit-learn que se ejecuta en CPU; no requiere GPU.
- Memoria RAM estimada: los artefactos ocupan pocos megabytes (el repositorio figura con 0,0 GB redondeados). El consumo dominante proviene del conjunto de datos cargado para inferencia, no del modelo en si.
- GPU recomendadas: ninguna. No hay soporte CUDA ni ventaja alguna en usar aceleradores.
- Compatibilidad con hardware de consumo: total. Cualquier portatil actual, incluidos equipos sin GPU dedicada, puede ejecutar tanto el KMeans como la regresion Ridge.
- Opciones de despliegue: carga directa con joblib en Python, serializacion como artefacto de MLflow, conversion a ONNX mediante skl2onnx para servir en runtimes ligeros, o exposicion como endpoint HTTP con FastAPI, Flask o BentoML.
- Latencia y throughput: no disponible en la informacion proporcionada. Dado el tamano del modelo, la asignacion de cluster y la prediccion de la Ridge son operaciones de milisegundos en CPU para lotes de miles de municipios.
- Almacenamiento: los ficheros joblib y los dos JSON de configuracion caben holgadamente en cualquier repositorio Git convencional.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada otros modelos comparables, ni entregas de otros equipos del DIRISA Student Datathon 2026, ni pipelines publicados sobre la misma tarea de brecha de registro juvenil en Sudafrica. Como referencia interna de la propia model card, la unica linea base implicitamente disponible para el modelo B es un modelo nulo que prediga la media del cambio de participacion: con R2 = 0,027, la Ridge apenas mejora esa referencia.

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Modelo nulo (media del objetivo) para el cambio de participacion | no aplica | no aplica | R2 = 0 por definicion; superado por la Ridge con R2 = 0,027 | no aplica | trivial de implementar |
| Otros modelos del datathon | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelos de clustering alternativos (DBSCAN, GMM, jerarquico) | no aplica | no aplica | no comparados en la informacion disponible | no aplica | implementados en scikit-learn |

## Limitaciones y advertencias

- Poder predictivo muy bajo: el R2 de 0,027 en LOOCV indica que la regresion Ridge explica en torno al 2,7 por ciento de la varianza del cambio de participacion. No debe usarse para pronosticar resultados electorales; el propio autor lo describe como senal direccional debil.
- Clusters de calidad moderada: un coeficiente de silueta de 0,371 no garantiza una separacion inequivoca entre perfiles municipales. Distintas semillas o escalados pueden alterar la asignacion de municipios limitrofes entre clusters.
- Riesgo de sobreinterpretacion geografica: agrupar municipios heterogeneos en cuatro categorias puede ocultar dinamicas locales relevantes y reforzar estereotipos sobre territorios concretos.
- Ausencia de informacion sobre los datos: no se publican en la informacion disponible el numero de municipios, las variables de entrada, el periodo temporal cubierto ni el tratamiento de valores faltantes. La lista completa esta en cluster_model_config.json y turnout_model_config.json, que no se han podido inspeccionar.
- Riesgo de correlacion espuria: la relacion entre registro juvenil y participacion total puede estar confundida por variables socioeconomicas, demograficas o de movilidad no incluidas en el modelo.
- Sin validacion temporal explicita: la validacion leave-one-out sobre observaciones no equivale a una validacion fuera de muestra en el tiempo, de modo que el rendimiento en datos futuros no esta garantizado.
- Alcance geografico limitado: el modelo se ha construido con datos sudafricanos y no es trasladable sin reentrenamiento a otros paises ni a otros niveles administrativos.
- Sesgo de representacion: si los datos abiertos de registro electoral infrarrepresentan a determinados municipios rurales o informales, el clustering heredara ese sesgo.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificacion y redistribucion con atribucion y sin garantia. Conviene revisar, no obstante, las condiciones de las fuentes de datos originales utilizadas para el entrenamiento, que no se detallan en la informacion disponible.
- Madurez del artefacto: cero descargas y cero likes en el momento de redactar esta ficha, sin senales de validacion externa por parte de terceros.
- Idiomas: no es un modelo linguistico, por lo que no tiene capacidades multilingues ni puede procesar texto libre sin ingenieria previa de caracteristicas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/smmdlovu/dirisa-sdc-2026-youth-gap-model
- DIRISA Student Datathon: https://sdc.dirisa.ac.za/
- Data Intensive Research Initiative of South Africa (DIRISA): https://www.dirisa.ac.za/
