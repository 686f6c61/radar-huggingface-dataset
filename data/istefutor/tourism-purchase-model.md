# istefutor/tourism-purchase-model

## Resumen

El modelo `istefutor/tourism-purchase-model` es un pipeline de clasificación tabular publicado en HuggingFace por el usuario `istefutor`. Segun la model card, se trata de un clasificador basado en XGBoost, seleccionado mediante una busqueda en rejilla (grid search) con validacion cruzada estratificada de cinco particiones y F1 como metrica de seleccion. El objetivo del modelo es predecir la compra historica de paquetes turisticos de tipo general, es decir, un problema de propension de compra sobre variables tabulares.

No es un modelo de lenguaje ni una red neuronal profunda: es un artefacto de machine learning clasico serializado con `joblib` y etiquetado con la libreria `scikit-learn`. Por tanto, no dispone de ventana de contexto, no procesa texto libre ni imagenes, y no tiene parametros en el sentido habitual de los transformers. Su relevancia es acotada: se publica como ejemplo reproducible de pipeline tabular con metricas de test declaradas, pero con documentacion muy incompleta.

El repositorio tiene un tamano declarado de 0.0 GB, cero descargas y cero likes en el momento de la consulta, y se creo y actualizo el 19 de septiembre de 2026. La model card no especifica licencia, idiomas, composicion del dataset de entrenamiento, esquema de caracteristicas ni version de las dependencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de clasificacion basado en XGBoost (gradient boosting sobre arboles de decision) sobre datos tabulares |
| Parametros totales | no disponible (no se documenta el numero de arboles, profundidad ni numero de hojas) |
| Parametros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | no aplica (modelo tabular, no procesa secuencias de texto) |
| Tipos de cuantizacion | no aplica (no hay pesos en coma flotante de red neuronal; el artefacto se serializa con joblib) |
| Idiomas soportados | no disponible (no aplica a un clasificador tabular) |
| Licencia | no disponible (la model card no declara licencia) |
| Formato de pesos | joblib (serializacion de scikit-learn); tag de libreria: scikit-learn |
| Pipeline declarado | tabular-classification |
| Tamano del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-19 |
| Ultima actualizacion | 2026-09-19 |

## Arquitectura y entrenamiento

La model card describe un pipeline de clasificacion XGBoost seleccionado mediante busqueda en rejilla con validacion cruzada estratificada de cinco particiones, optimizando F1. El mejor F1 medio en validacion cruzada reportado es 0.68123, y las metricas finales sobre el conjunto de test son accuracy 0.8656, precision 0.6290, recall 0.7358, F1 0.6783 y ROC-AUC 0.8921. El target representa compras historicas de paquetes turisticos generales.

No se documenta ningun otro detalle del entrenamiento: se desconoce el numero de muestras, el numero y tipo de caracteristicas de entrada (numericas, categoricas, texto), el tratamiento de valores ausentes, el esquema de codificacion, la estrategia de balanceo de clases, la rejilla exacta de hiperparametros explorada, la semilla aleatoria, la version de XGBoost y scikit-learn, ni la particion train/validation/test utilizada. Tampoco se indica si hubo calibracion de probabilidades, seleccion de umbral de decision o analisis de importancia de variables. La unica innovacion tecnica mencionada es el propio proceso de seleccion por grid search, que es un procedimiento estandar y no una contribucion metodologica.

## Capacidades

- Clasificacion supervisada sobre datos tabulares: asigna una clase (compra / no compra) a partir de un vector de caracteristicas estructuradas.
- Estimacion de propension: el pipeline puede exponer una probabilidad o score continuo de compra, util para priorizacion de leads.
- Discriminacion razonable entre clases segun ROC-AUC declarado de 0.8921 sobre el conjunto de test.
- Capacidad de operar en CPU sin requisitos de acelerador, dado que se trata de arboles de decision serializados.
- Integracion directa en el ecosistema scikit-learn (`predict`, `predict_proba`, `Pipeline`), lo que facilita su uso dentro de flujos existentes en Python.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingues, de vision, de audio ni de generacion de texto.
- No dispone de modo de razonamiento explicito (thinking mode).
- Interpretabilidad parcial: al ser un modelo de arboles potenciados, admite tecnicas como importancia por ganancia, SHAP o permutacion, aunque el autor no publica ningun analisis de este tipo.

## Casos de uso

- Campanas de marketing turistico: puntuar una base de clientes historicos con el score del modelo para ordenar por probabilidad de compra y decidir a quien dirigir una promocion, explotando el ROC-AUC de 0.892 como capacidad de ranking.
- Priorizacion de leads en agencias de viajes: aplicar el clasificador a los registros de clientes potenciales para que el equipo comercial dedique esfuerzo a los segmentos con mayor propension declarada.
- Segmentacion previa a campanas de email: usar la salida binaria del modelo como filtro de audiencia, aceptando el compromiso observado entre precision (0.629) y recall (0.736) segun el coste relativo de cada tipo de error.
- Analisis de cohortes y estacionalidad: entrenar variantes del pipeline sobre subconjuntos temporales de datos historicos para comparar la propension de compra entre periodos, reutilizando el mismo flujo de scikit-learn.
- Prueba de concepto educativa: servir como ejemplo de pipeline tabular completo (preprocesado, busqueda de hiperparametros con validacion cruzada estratificada, evaluacion con multiples metricas) en cursos o talleres de machine learning aplicado.
- Baseline interno en proyectos de propension: emplearlo como referencia inicial contra la que comparar modelos mas complejos (redes neuronales tabulares, LightGBM o CatBoost) antes de invertir en infraestructura adicional.
- Integracion en un sistema de decision de precios o paquetes: combinar el score del modelo con reglas de negocio para decidir que paquete turistico ofrecer a cada cliente, dado que la inferencia es ligera y apta para ejecucion en linea en CPU.

## Benchmarks y rendimiento

La model card unicamente publica las metricas de test del propio pipeline. No se aportan comparaciones con otros modelos ni resultados en conjuntos de referencia publicos, por lo que no es posible contextualizar el rendimiento frente a alternativas.

| Metrica | Valor |
|---|---|
| Accuracy | 0.8656 |
| Precision | 0.6290 |
| Recall | 0.7358 |
| F1 | 0.6783 |
| ROC-AUC | 0.8921 |
| Mejor F1 en validacion cruzada | 0.6812 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. Se desconoce tambien el conjunto de datos exacto sobre el que se calcularon estas cifras, lo que impide reproducirlas.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica. El artefacto esta serializado con joblib y se ejecuta en CPU.
- GPU recomendadas: ninguna. XGBoost puede usar GPU durante el entrenamiento, pero la model card no indica que se haya empleado ni que sea necesario para la inferencia.
- Compatibilidad con GPU de consumo: no aplica; el modelo cabe en cualquier maquina con Python y memoria RAM suficiente para cargar el objeto joblib (el repositorio completo ocupa menos de 0.1 GB).
- Memoria RAM: no disponible con precision; dado el tamano del repositorio declarado (0.0 GB), el modelo es muy pequeno, pero el pico de memoria dependera del tamano del lote de inferencia y del numero de arboles, que no se documenta.
- Opciones de despliegue: `joblib.load` en Python, `scikit-learn` directamente, serializacion a ONNX si se valida la conversion, o exposicion mediante FastAPI, Flask, BentoML o similares. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles. Para un modelo de arboles de este tipo y tamano, la inferencia por lote suele ser del orden de microsegundos a milisegundos por fila en CPU, pero no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

No hay resultados comparativos publicados en la informacion disponible. La comparacion solo puede plantearse a nivel cualitativo frente a alternativas genericas de la misma categoria (clasificacion tabular binaria):

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| istefutor/tourism-purchase-model (XGBoost) | no disponible | no aplica | F1 0.678, ROC-AUC 0.892 (test propio) | no disponible | HuggingFace, 0 descargas |
| Regresion logistica con preprocesado | no aplica | no aplica | no disponible | depende de la implementacion | scikit-learn, disponible |
| Random Forest | no disponible | no aplica | no disponible | depende de la implementacion | scikit-learn, disponible |
| LightGBM / CatBoost | no disponible | no aplica | no disponible | MIT / Apache-2.0 tipicamente | repositorios oficiales, disponible |

La comparacion carece de base empirica porque el autor no publica ni el conjunto de datos ni ejecuciones de referencia sobre el mismo problema.

## Limitaciones y advertencias

- Ausencia total de licencia: la model card no declara ninguna, lo que impide determinar si el uso comercial esta permitido. En la practica, esto bloquea su adopcion en produccion sin contactar previamente con el autor.
- Documentacion insuficiente: no se especifican el esquema de caracteristicas, el orden de las columnas, los tipos esperados, el tratamiento de valores nulos ni las categorias codificadas. Sin esa informacion, el modelo dificilmente puede aplicarse a datos nuevos de forma correcta.
- Reproducibilidad no garantizada: se desconocen las versiones de XGBoost y scikit-learn, la semilla aleatoria, la particion de datos y la rejilla de hiperparametros. Las metricas declaradas no son verificables.
- Definicion ambigua del target: "compras historicas de paquetes turisticos generales" no concreta el horizonte temporal, el criterio de etiquetado ni si existe fuga de informacion entre caracteristicas y etiqueta.
- Desequilibrio de clases probable: la diferencia entre accuracy (0.866) y F1 (0.678), junto con una precision de 0.629, sugiere una clase positiva minoritaria y un numero relevante de falsos positivos.
- Alertas de sesgo: no hay ningun analisis de equidad por grupo demografico, geografia, canal de adquisicion o segmento de cliente. Un modelo de propension entrenado sobre datos historicos puede reproducir sesgos de seleccion presentes en campanas pasadas.
- Riesgo de deriva temporal: el comportamiento de compra en turismo es fuertemente estacional y sensible a shocks externos. Sin fecha de entrenamiento ni ventana de datos documentada, no es posible estimar la caducidad del modelo.
- Sin validacion externa: todas las metricas proceden de una unica particion de test elegida por el autor, sin validacion cruzada repetida ni conjunto de prueba independiente.
- Riesgo de alucinacion: no aplica en el sentido de un modelo generativo, pero si existe riesgo de predicciones mal calibradas presentadas como probabilidades fiables. No se documenta ningun proceso de calibracion.
- Adopcion nula: cero descargas y cero likes implican que el modelo no ha sido revisado por terceros; no hay evidencia de uso real ni de validacion de la comunidad.
- Limitacion de idioma y contexto: no aplica, ya que el modelo no procesa texto. Cualquier descripcion que sugiera capacidades linguisticas seria incorrecta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/istefutor/tourism-purchase-model

Nota: las busquedas web realizadas no devolvieron ningun resultado relevante sobre este modelo. Todos los resultados obtenidos correspondian a esquematicos de Minecraft con tematica religiosa (Planet Minecraft, abfielder.com, minecraft-schematics.com), sin ninguna relacion con el modelo, su arquitectura ni su problema objetivo. No se han encontrado paper, blog, repositorio de codigo ni demo asociados al modelo.
