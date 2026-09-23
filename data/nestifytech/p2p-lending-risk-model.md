# Nestifytech/p2p-lending-risk-model

## Resumen

Nestifytech/p2p-lending-risk-model es un clasificador binario de riesgo crediticio para préstamos entre particulares (P2P), publicado en HuggingFace por el usuario Nestifytech. No es un modelo de lenguaje ni una red neuronal: se trata de una regresión logística de scikit-learn, serializada en formato joblib, que estima la probabilidad de que un préstamo termine en impago ("Charged Off") frente a la alternativa de pago completo ("Fully Paid"). El modelo se entrenó sobre un subconjunto del conocido dataset de LendingClub.

El problema que aborda es la evaluación de solvencia en originación de préstamos: dada una solicitud descrita por cinco variables (importe del préstamo, ingresos anuales, ratio deuda-ingresos, tipo de interés y calificación de riesgo), el modelo devuelve una etiqueta binaria y una probabilidad. Su relevancia práctica es limitada pero concreta: sirve como línea base reproducible, como ejercicio docente y como punto de partida para pipelines de scoring más elaborados, no como motor de decisión en producción.

La ficha se ha elaborado exclusivamente con la información de la model card del autor y de los metadatos de HuggingFace. El repositorio declara 0 descargas y 0 "likes", no tiene licencia especificada ni pipeline declarado, y el tamaño reportado es de 0,0 GB, coherente con un artefacto de tamaño muy reducido. Varios parámetros habituales en fichas de modelos generativos (contexto, cuantización, idiomas) no son aplicables a un modelo tabular de este tipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica (scikit-learn) con `class_weight='balanced'`; modelo tabular, no neuronal |
| Parametros totales | no disponible (el numero de coeficientes depende de la codificacion de la variable categorica `grade`, no documentada) |
| Longitud de contexto | no aplica (modelo tabular de clasificacion; no procesa secuencias ni texto libre) |
| Tipos de cuantizacion | no disponible; no se aplican tecnicas de cuantizacion de pesos (no hay pesos neuronales) |
| Idiomas soportados | no aplica (las unicas entradas categoricas son etiquetas de calificacion, p. ej. "C") |
| Licencia | no disponible (la model card no especifica ninguna) |
| Formato de pesos | joblib (serializacion de objeto scikit-learn); no safetensors, no GGUF, no ONNX |
| Tarea | Clasificacion binaria (riesgo de impago) |
| Variable objetivo | `risk`: 0 = Fully Paid, 1 = Charged Off |
| Variables de entrada | `loan_amnt`, `annual_inc`, `dti`, `int_rate`, `grade` (5 variables) |
| Framework | scikit-learn (version no disponible) |
| Dataset de entrenamiento | Subconjunto de LendingClub, 5.349 registros con 5 variables |
| Tamano del conjunto de prueba | 1.070 filas |
| Tamano del repositorio | 0,0 GB (segun HuggingFace) |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion indicada | 2026-09-23 (posible incoherencia de metadatos) |

## Arquitectura y entrenamiento

La arquitectura es una regresion logistica, es decir, un modelo lineal generalizado que modela el logaritmo de la odds de impago como combinacion lineal de las variables de entrada y aplica una funcion sigmoide para obtener una probabilidad. El entrenamiento se realizo con el hiperparametro `class_weight='balanced'`, que reescala los pesos de las clases de forma inversamente proporcional a su frecuencia para compensar el desbalanceo inherente al problema (los impagos son la clase minoritaria). Se trata, por tanto, de un modelo de caja blanca con coeficientes interpretables, sin capas ocultas, sin atencion y sin mecanismo de decodificacion.

Los datos proceden de un subconjunto del dataset de LendingClub con 5.349 prestatarios y 5 variables por registro. El conjunto de prueba empleado en la evaluacion tiene 1.070 filas, lo que sugiere una particion del orden de 83/17 si el total fuese de 6.419 registros (dato no confirmado por el autor). La model card no documenta el numero de tokens (no aplica), la composicion detallada del dataset, el metodo de codificacion de la variable categorica `grade`, si se aplico escalado de variables, ni si el objeto joblib embebe un `Pipeline` de preprocesado o solo el estimador final. Tampoco se especifican los hiperparametros de regularizacion (tipo de penalizacion, constante `C`, solver, `max_iter`) ni la semilla aleatoria utilizada, lo que impide reproducir el entrenamiento de forma exacta. No se emplearon tecnicas de RLHF ni DPO, propias de modelos generativos y no aplicables a este caso.

## Capacidades

- Clasificacion binaria de riesgo de impago a partir de cinco variables de originacion del prestamo.
- Salida de probabilidad calibrada mediante `predict_proba`, ademas de la etiqueta discreta con umbral por defecto de 0,5.
- Ajuste del umbral de decision para priorizar recall sobre precision, tal y como sugiere el propio autor en la model card.
- Inferencia muy rapida en CPU, sin necesidad de acelerador hardware.
- Coeficientes inspeccionables, lo que permite analisis de sensibilidad y explicabilidad basica del signo y magnitud de cada variable.
- Integrable en scripts de Python y en servicios HTTP (por ejemplo, FastAPI o Flask) mediante carga directa del artefacto joblib.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: no procesa lenguaje natural.
- No dispone de modo "thinking", vision, audio ni generacion de texto de ningun tipo.

## Casos de uso

- Triaje inicial de solicitudes en una plataforma P2P: el modelo puede puntuar cada solicitud con las cinco variables disponibles en el formulario y ordenar la cola de revision manual, dejando las decisiones finales a un analista. Es adecuado por su coste computacional nulo, pero su precision del 0,32 obliga a tratarlo como filtro, no como veredicto.
- Linea base (baseline) en proyectos de riesgo crediticio: cualquier equipo que desarrolle un modelo de gradient boosting o una red neuronal sobre LendingClub puede usar esta regresion logistica como referencia minima contra la que medir la mejora, dado que las metricas de evaluacion estan publicadas.
- Material docente y de prototipado: por su tamano reducido y su dependencia exclusiva de scikit-learn, sirve para ilustrar en clase o en un notebook conceptos como desbalanceo de clases, `class_weight`, matriz de confusion, ajuste de umbral y compromiso entre precision y recall.
- Analisis de sensibilidad sobre el tipo de interes: al ser un modelo lineal, puede calcularse como varia la probabilidad estimada de impago ante cambios en `int_rate` manteniendo el resto de variables constante, util para explorar la relacion entre precio y riesgo (con la salvedad de endogeneidad senalada mas abajo).
- Microservicio de scoring de primera etapa en una arquitectura de datos: expuesto como endpoint HTTP, permite etiquetar lotes de solicitudes historicas para auditoria o backtesting de politicas de credito, con requisitos de infraestructura minimos.
- Backtesting de estrategias de inversion en carteras P2P: un inversor puede aplicar el modelo a prestamos historicos del mismo origen para comprobar si la probabilidad estimada habria separado carteras rentables de carteras con alta morosidad, siempre dentro del mismo dominio de datos.
- Filtro de descarte en pipelines de captacion: combinado con reglas de negocio, el modelo puede descartar automaticamente solicitudes con probabilidad muy alta de impago, reduciendo el volumen de expedientes que llegan a revision manual.
- Experimentacion educativa sobre interpretabilidad: la inspeccion de los coeficientes permite discutir que variables pesan mas y compararlo con el conocimiento de dominio del negocio crediticio.

## Benchmarks y rendimiento

El autor publica las siguientes metricas sobre un conjunto de prueba de 1.070 filas, con umbral por defecto de 0,5 y para la clase "Charged Off":

| Metrica | Valor |
|---|---|
| Accuracy | 0,7324 |
| Precision | 0,3223 |
| Recall | 0,6834 |
| F1 | 0,4380 |
| ROC-AUC | 0,7324 |
| Conjunto de evaluacion | 1.070 filas |
| Umbral | 0,5 |

Lectura tecnica de estos datos: con una precision de 0,3223, aproximadamente el 67,8 % de las alertas de impago emitidas por el modelo son falsos positivos, mientras que con un recall de 0,6834 se le escapa en torno al 31,7 % de los impagos reales. No se han publicado comparaciones con otros modelos, ni la linea base de la clase mayoritaria, ni una matriz de confusion completa.

Advertencia de rigor: los valores de accuracy y ROC-AUC coinciden exactamente (0,7324), algo estadisticamente improbable, lo que apunta a un posible error de reporte en la model card. Una estimacion derivada de las metricas publicadas (no reportada por el autor) situaria la tasa de impago del conjunto de prueba en torno al 15 % (aproximadamente 163 casos positivos), lo que implicaria que un clasificador trivial que predijese siempre "Fully Paid" alcanzaria una exactitud cercana a 0,85, superior a la del modelo evaluado. Esta derivacion depende de que las metricas sean correctas, por lo que debe tomarse con cautela y verificarse antes de usarla en cualquier decision.

No se han publicado resultados de benchmarks comparativos en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: no aplica; el modelo no utiliza GPU. El repositorio se declara con 0,0 GB de tamano, coherente con un artefacto de pocos kilobytes.
- GPU recomendadas: ninguna. Modelos como A100, H100 o RTX 4090 no aportan ninguna ventaja medible sobre una CPU convencional para una regresion logistica con cinco variables.
- Compatibilidad con GPU de consumo: no aplica. El modelo cabe y se ejecuta en cualquier maquina con Python y scikit-learn instalados, incluidos portatiles de gama baja y contenedores con recursos minimos.
- Memoria RAM: no publicada; cabe holgadamente en cualquier entorno con unos cientos de megabytes disponibles para el interprete de Python y las librerias.
- Opciones de despliegue: carga directa con `joblib.load()` en un script Python; exposicion como API con FastAPI, Flask o similares; ejecucion por lotes en un job de datos. No es compatible con vLLM, llama.cpp, Ollama, TGI, TensorRT-LLM ni servidores de inferencia orientados a modelos generativos.
- Latencia y throughput: no publicados. Cualitativamente, al tratarse de una combinacion lineal sobre cinco variables, el coste de calculo por muestra es despreciable frente a la sobrecarga de serializacion, red o acceso a datos, por lo que el cuello de botella en produccion seran las operaciones de E/S y no la inferencia.
- Dependencia critica: el artefacto joblib esta vinculado a la version de scikit-learn y a las versiones de las librerias usadas al serializarlo. Al no documentarse ninguna de ellas, conviene fijar el entorno y validar la carga antes de desplegar.

## Comparativa con modelos similares

No se han publicado comparaciones cuantitativas con modelos alternativos en la informacion disponible. La tabla siguiente recoge la comparacion cualitativa por criterios, senalando explicitamente los datos ausentes.

| Criterio | Este modelo | Alternativas de la misma categoria |
|---|---|---|
| Tipo de modelo | Regresion logistica con `class_weight='balanced'` | Gradient boosting (XGBoost, LightGBM) o regresion logistica sin balanceo entrenados sobre LendingClub; no se han publicado comparaciones directas |
| Numero de variables de entrada | 5 | no disponible |
| Parametros totales | no disponible | no disponible |
| Longitud de contexto | no aplica | no aplica (modelos tabulares) |
| Rendimiento publicado | Accuracy 0,7324; F1 0,4380; ROC-AUC 0,7324 | no disponible |
| Licencia | no disponible | no disponible |
| Disponibilidad | Artefacto joblib en HuggingFace; 0 descargas y 0 likes; sin pipeline declarado | no disponible |

Un evaluador que necesite una comparacion real deberia reentrenar alternativas sobre el mismo subconjunto de datos y con la misma particion, algo que la model card no permite reproducir con exactitud al no documentar hiperparametros ni preprocesado.

## Limitaciones y advertencias

- Licencia no especificada: al no indicarse ninguna licencia en el repositorio, el uso comercial queda en una situacion juridica indeterminada. Es imprescindible contactar con el autor antes de cualquier explotacion.
- Especificidad del dataset: el modelo se entreno exclusivamente con datos de LendingClub. Su comportamiento en otras plataformas, en otras geografias o en periodos economicos distintos (por ejemplo, ciclos recesivos) no esta validado y puede degradarse de forma notable.
- Conjunto de variables muy reducido: se omiten factores con poder predictivo acreditado en riesgo crediticio, como el historial de pago, la puntuacion FICO, la antiguedad crediticia, la ratio de utilizacion del credito o la verificacion de ingresos.
- Riesgo de circularidad y fuga de informacion: `int_rate` y `grade` son variables asignadas por la plataforma en funcion del riesgo percibido del solicitante. Usarlas como predictoras de un desenlace que depende de esa misma evaluacion introduce endogeneidad y puede inflar artificialmente la aparente capacidad predictiva.
- Desbalanceo de clases y precision baja: con una precision de 0,3223 y un recall de 0,6834 al umbral 0,5, el modelo genera una proporcion elevada de falsos positivos y todavia omite cerca de un tercio de los impagos. El propio autor reconoce que la prediccion perfecta de los casos "Charged Off" es limitada.
- Sin validacion fuera de muestra publicada: solo se reportan metricas sobre un unico conjunto de prueba; no hay validacion cruzada, validacion temporal ni analisis de deriva (drift), imprescindibles en riesgo de credito.
- Inconsistencia en las metricas reportadas: la coincidencia exacta entre accuracy (0,7324) y ROC-AUC (0,7324) sugiere un error de transcripcion. Ademas, la estimacion derivada de la tasa de impagos implicaria una exactitud inferior a la de un clasificador trivial constante, lo que refuerza la necesidad de reproducir la evaluacion antes de sacar conclusiones.
- Reproductibilidad limitada: no se documentan versiones de librerias, semilla, hiperparametros, tratamiento de la variable `grade` ni si existe un `Pipeline` embebido en el joblib. Esto afecta tanto a la reproduccion como a la compatibilidad al cargar el fichero.
- Ausencia de validacion por la comunidad: 0 descargas, 0 likes, ningun pipeline declarado y ningun enlace a paper, repositorio o demo. No hay evidencia externa de que el modelo haya sido auditado o probado por terceros.
- Riesgo de alucinacion: no aplica en el sentido generativo (el modelo no produce texto libre), pero si existe el riesgo analogo de prediccion confiada y erronea cuando la entrada cae fuera del dominio de entrenamiento, sin que el modelo senale incertidumbre mas alla de la probabilidad estimada.
- Limitaciones de idioma: no aplica. Cualquier entrada debe respetar el esquema exacto de columnas y tipos del ejemplo de la model card; un desajuste en el orden, el nombre o el tipo de las variables producira resultados invalidos o errores en tiempo de ejecucion.
- Marco regulatorio: la evaluacion de solvencia de personas fisicas esta clasificada como sistema de alto riesgo en el Anexo III del Reglamento Europeo de Inteligencia Artificial, por lo que su uso real exigiria gestion de riesgos, supervision humana, documentacion tecnica y trazabilidad que este modelo no proporciona.
- No es asesoramiento financiero: la propia model card lo declara como material ilustrativo y educativo, y prohibe explicitamente usarlo como base unica para decisiones financieras.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nestifytech/p2p-lending-risk-model
- No se han encontrado otros enlaces (paper, blog, repositorio de codigo o demo) en la informacion disponible.
