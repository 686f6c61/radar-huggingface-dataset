# LEAP-LAB-KUS/leap-kt-attentiveqmatrixlearning-2023-04

## Resumen

LEAP-LAB-KUS/leap-kt-attentiveqmatrixlearning-2023-04 es un modelo de knowledge tracing (seguimiento del conocimiento) desarrollado por el LEAP Lab de la Universidad Tsinghua, dentro del ecosistema leap-kt-toolkit. A diferencia de los modelos generativos de lenguaje, este modelo predice la probabilidad de que un estudiante responda correctamente a una pregunta en funcion de su historial previo de interacciones educativas, una tarea central en el ambito de la mineria de datos educativos y los sistemas de aprendizaje adaptativo.

El modelo implementa la arquitectura AttentiveQMatrixLearning, una variante de los modelos de factorizacion de matrices con mecanismos de atencion aplicados al dominio educativo. Se distribuye con el protocolo experimental completo del proyecto leap-kt: division de usuarios 80/20, validacion cruzada de 5 pliegues, logs de entrenamiento por epoca y los checkpoints exactos de cada pliegue, lo que garantiza reproducibilidad total.

La relevancia de este modelo reside en su rigor metodologico: el proyecto leap-kt reimplementa de forma sistematica modelos publicados de knowledge tracing bajo un unico protocolo, evitando fugas de datos comunes en otras reproducciones (como la expansion de preguntas multi-concepto en multiples filas). Los resultados publicados en ASSIST2009 alcanzan un AUC de 0,6867 ± 0,0017, con una auditoria de fugas que verifica la disjuncion de usuarios entre entrenamiento y prueba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AttentiveQMatrixLearning (knowledge tracing) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de knowledge tracing, no generativo) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (los datos de ASSIST2009 son en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (config.json + pesos por pliegue) |
| Dataset de entrenamiento | ASSIST2009 |
| Protocolo de evaluacion | 80/20 split por usuario, 5-fold CV, early stopping paciencia 10, max 200 epocas |
| Libreria | leap-kt |

## Arquitectura y entrenamiento

AttentiveQMatrixLearning combina la factorizacion de matrices clasica del knowledge tracing con mecanismos de atencion para modelar la relacion entre las interacciones previas del estudiante y la pregunta actual. No se trata de un transformer generativo ni de un modelo de lenguaje: opera sobre secuencias de interacciones estudiante-pregunta-respuesta y produce una prediccion de probabilidad de acierto.

El entrenamiento se realizo sobre el dataset ASSIST2009, uno de los conjuntos de referencia en knowledge tracing, con un protocolo estandarizado: division a nivel de usuario (80% entrenamiento, 20% prueba), validacion cruzada de 5 pliegues sobre la porcion de entrenamiento, y early stopping con paciencia de 10 epocas sobre el AUC de validacion, con un maximo de 200 epocas. Una decision metodologica clave es que las preguntas multi-concepto no se expanden en multiples filas, evitando la fuga de datos que infla artificialmente los resultados en otras implementaciones (en ASSIST2009, alrededor del 37% de las posiciones se verian afectadas por esta fuga).

## Capacidades

- Prediccion de la probabilidad de respuesta correcta de un estudiante ante una pregunta concreta, basandose en su historial de interacciones previas.
- Modelado de la relacion entre conceptos y preguntas mediante factorizacion de matrices con atencion.
- Evaluacion rigurosa con auditoria de fugas: verificacion de disjuncion de usuarios entre entrenamiento y prueba, ausencia de ventanas que crucen el limite del split, puntuacion exactamente una vez por interaccion y control de etiquetas aleatorizadas que debe colapsar el AUC al nivel de azar.
- Reproducibilidad completa: cada pliegue incluye los logs de entrenamiento por epoca, la configuracion exacta y la particion de usuarios con checksum.

## Casos de uso

- Sistemas de tutorizacion inteligente: el modelo puede integrarse en plataformas educativas para predecir en tiempo real si un estudiante dominara un concepto, permitiendo adaptar la dificultad de los ejercicios de forma dinamica.
- Deteccion temprana de estudiantes en riesgo: al monitorizar la probabilidad de acierto a lo largo de la secuencia de interacciones, el modelo puede identificar patrones de bajo rendimiento antes de que se acumulen suspensos.
- Recomendacion de ejercicios personalizados: la prediccion del modelo puede alimentar un motor de recomendacion que seleccione la siguiente pregunta optima para cada estudiante, maximizando el aprendizaje esperado.
- Evaluacion de curriculos educativos: analizando las predicciones agregadas del modelo sobre distintos conjuntos de preguntas, los disenadores de curriculos pueden identificar que conceptos resultan mas dificiles de adquirir para la poblacion estudiantil.
- Investigacion en mineria de datos educativos: como implementacion de referencia dentro de leap-kt-toolkit, sirve para comparar de forma justa nuevas arquitecturas de knowledge tracing contra un protocolo estandarizado y auditado.
- Analisis de diagnostico de conocimiento: el modelo puede generar perfiles de dominio conceptual por estudiante, util para informes pedagogicos detallados o para la agrupacion de estudiantes con necesidades similares.

## Benchmarks y rendimiento

Resultados publicados en el dataset ASSIST2009:

| Dataset | AUC | ACC | F1 | Referencia publicada | Delta |
|---|---|---|---|---|---|
| assist2009 | 0,6867 ± 0,0017 | 0,6565 | 0,7926 | — | — |

No se han publicado resultados en otros datasets dentro de la informacion disponible. Los valores por pliegue se encuentran en el archivo `summary.json` de cada dataset. El proyecto documenta explicitamente que la media nunca se reporta sin su dispersion, y que estos numeros pueden diferir de otras reproducciones debido a la politica de no expandir preguntas multi-concepto, que evita una fuga de datos comun.

## Requisitos de hardware

- No se especifican requisitos de hardware en la informacion disponible.
- Al tratarse de un modelo de knowledge tracing (no generativo), el tamano de los pesos es tipicamente reducido en comparacion con modelos de lenguaje, por lo que es razonable esperar que la inferencia pueda ejecutarse en CPU sin GPU dedicada, aunque este dato no esta confirmado por el autor.
- El repositorio incluye checkpoints por pliegue en formato safetensors, compatibles con el framework leap-kt.
- No se documentan opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje y no aplican esos motores de inferencia.

## Comparativa con modelos similares

El proyecto leap-kt-toolkit incluye otras implementaciones de knowledge tracing bajo el mismo protocolo, lo que permite comparaciones justas. De los resultados de busqueda se identifican:

| Modelo | Dataset | AUC | Notas |
|---|---|---|---|
| AttentiveQMatrixLearning (este modelo) | ASSIST2009 | 0,6867 ± 0,0017 | Sin referencia publicada comparable |
| AttentiveSimpleRecurrent (leap-kt-2023-11) | no disponible | no disponible | Misma familia de modelos del toolkit |
| AKT (leap-kt-2020-07) | no disponible | no disponible | Basado en arxiv:2007.12324 |

No se dispone de los resultados de AUC de los modelos comparables en la informacion recopilada. La comparativa directa entre modelos del toolkit requiere consultar los repositorios individuales de cada implementacion.

## Limitaciones y advertencias

- El modelo se evalua unicamente sobre ASSIST2009; su rendimiento en otros datasets educativos no esta documentado y podria variar significativamente.
- No se trata de un modelo generativo de lenguaje: no puede generar texto, responder preguntas abiertas ni mantener conversaciones. Su unica salida es una probabilidad de acierto.
- No se documentan sesgos especificos, pero al entrenarse con datos de ASSIST2009, un dataset historico de plataformas de tutorizacion en ingles, los resultados pueden no generalizar a otras poblaciones, idiomas o sistemas educativos.
- El proyecto advierte que los numeros pueden diferir de otras reproducciones publicadas debido a la politica de no expandir preguntas multi-concepto; al comparar con otros articulos, hay que verificar que se use la misma metodologia.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo se distribuye sin garantias y sin soporte oficial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una adopcion limitada fuera del ambito academico del proyecto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LEAP-LAB-KUS/leap-kt-attentiveqmatrixlearning-2023-04
- leap-kt-toolkit (GitHub): https://github.com/LEAP-LAB-KUS/leap-kt-toolkit
- LEAP Lab, Universidad Tsinghua: https://www.leaplab.ai/
- Modelo relacionado AttentiveSimpleRecurrent: https://huggingface.co/LEAP-LAB-KUS/leap-kt-attentivesimplerecurrent-2023-11
- Modelo relacionado AKT: https://huggingface.co/LEAP-LAB-KUS/leap-kt-akt-2020-07
