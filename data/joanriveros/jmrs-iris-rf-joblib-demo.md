# JoanRiveros/jmrs-iris-rf-joblib-demo

## Resumen

`JoanRiveros/jmrs-iris-rf-joblib-demo` es un modelo de clasificación supervisada tabular publicado en Hugging Face por el usuario JoanRiveros. No es un modelo de lenguaje: se trata de un clasificador Random Forest entrenado con el dataset Iris de `scikit-learn` y serializado con `joblib`. El repositorio tiene un peso reportado de 0.0 GB, cero descargas y cero likes, y su función declarada es servir como demostración mínima del flujo publicar-artefacto-consumir artefacto en el Hub.

El modelo recibe cuatro variables numéricas (longitud y anchura de sépalo y pétalo, en centímetros) y devuelve una de tres clases (`setosa`, `versicolor`, `virginica`). La única métrica declarada en la model card es un accuracy de 0.9667, sin especificar la partición de evaluación empleada. No se documentan hiperparámetros, número de árboles, profundidad máxima, semilla ni composición del conjunto de entrenamiento más allá del dataset Iris estándar (150 muestras, tres clases balanceadas de 50 instancias cada una).

Su relevancia es estrictamente didáctica y de infraestructura: sirve como artefacto de prueba para validar canalizaciones de descarga (`hf_hub_download`), deserialización (`joblib.load`) y exposición mediante una interfaz Gradio, no como componente de producción para datos del mundo real. La model card anuncia una Space asociada, `JoanRiveros/jmrs-iris-rf-gradio-space`, que actuaría como interfaz del clasificador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest (conjunto de árboles de decisión con agregación por voto mayoritario) |
| Parametros totales | no disponible (no se documenta número de árboles, profundidad ni número de nodos) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular; entrada de 4 características numéricas) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (no aplica: no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | `joblib` (serialización de objetos Python de `scikit-learn`) |
| Libreria declarada | scikit-learn |
| Tarea | Clasificación multiclase (3 clases) |
| Variables de entrada | sepal length (cm), sepal width (cm), petal length (cm), petal width (cm) |
| Clases de salida | setosa, versicolor, virginica |
| Dataset de entrenamiento | Iris de `scikit-learn` (150 muestras, 4 características, 3 clases) |
| Metrica declarada | Accuracy = 0.9667 |
| Tamano del repositorio | 0.0 GB (por debajo del umbral de redondeo del Hub) |
| Fecha de creacion | 2026-10-02 |

## Arquitectura y entrenamiento

La arquitectura es un `RandomForestClassifier` de `scikit-learn`, es decir, un ensemble de tipo bagging sobre árboles de decisión CART. Cada árbol se entrena sobre una muestra bootstrap del conjunto de entrenamiento y, en cada división de nodo, evalúa un subconjunto aleatorio de las características (habitualmente `sqrt(n_features)` en clasificación). La predicción final se obtiene por voto mayoritario de los árboles, y `predict_proba` devuelve la proporción de árboles que votan cada clase, lo que permite obtener una estimación de confianza. Con 4 características de entrada, cada división considera del orden de 2 variables candidatas.

El entrenamiento se realizó sobre el dataset Iris clásico (R. A. Fisher, 1936), compuesto por 150 muestras etiquetadas y balanceadas entre las tres especies, con una de las clases (versicolor y virginica) parcialmente solapada en el espacio de características. La model card no especifica el número de árboles, la función de impureza, la profundidad máxima, el criterio de parada, el uso de partición train/test o validación cruzada, ni la semilla aleatoria. Tampoco documenta preprocesado (escalado, imputación) ni búsqueda de hiperparámetros. No hay fases de ajuste por preferencias humanas tipo RLHF o DPO, propias de los modelos generativos, ni innovaciones de decodificación o atención, ya que no existe mecanismo de atención.

El artefacto se serializa con `joblib`, que en la práctica utiliza `pickle` como mecanismo subyacente optimizado para arrays de NumPy. Esto implica dos consecuencias técnicas relevantes: la deserialización requiere una versión de `scikit-learn` compatible con la usada en el entrenamiento (en caso contrario aparece un `InconsistentVersionWarning` y pueden variar las predicciones), y la carga de un fichero `joblib` de origen no confiable ejecuta código arbitrario durante el `unpickling`.

## Capacidades

- Clasificación supervisada multiclase sobre datos tabulares con exactamente cuatro características numéricas continuas.
- Estimación de probabilidad por clase mediante `predict_proba`, basada en la proporción de votos de los árboles.
- Inferencia sobre CPU, sin necesidad de GPU ni de aceleradores específicos.
- Determinismo de las predicciones una vez cargado el modelo (la aleatoriedad está fijada en el entrenamiento, no en la inferencia).
- Compatibilidad con `hf_hub_download` para la descarga versionada del artefacto desde el Hub.
- No soporta generación de texto, razonamiento simbólico, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa lenguaje natural).
- No tiene capacidades de visión, audio ni modo de razonamiento explícito.
- No acepta entradas variables: el vector de entrada debe tener 4 dimensiones y estar en las mismas unidades (centímetros) y escala que el dataset Iris.

## Casos de uso

- Material didáctico de machine learning: el modelo sirve para ilustrar el ciclo completo de entrenamiento, serialización con `joblib` y publicación en el Hub, además de la diferencia entre un clasificador tabular y un modelo generativo.
- Prueba de humo de canalizaciones de despliegue: al pesar menos de un megabyte y no requerir GPU, permite validar en segundos que un pipeline de CI/CD descarga el artefacto, lo carga y ejecuta predicciones sin errores.
- Verificación de compatibilidad de versiones de `scikit-learn`: cargar el `.joblib` en distintas imágenes Docker con versiones fijadas de la librería permite detectar avisos de versión inconsistente y validar matrices de compatibilidad.
- Demo interactiva en Gradio: la Space anunciada puede exponer cuatro deslizadores (longitudes y anchuras) y devolver la clase predicha junto con la probabilidad, sin coste de cómputo apreciable.
- Baseline trivial para pruebas de latencia y throughput de un servidor de inferencia: al tener un coste de cómputo de microsegundos, aísla el sobrecoste introducido por la capa HTTP o de red del sistema de serving.
- Validación de repositorios de artefactos y permisos: sirve para comprobar que un flujo de trabajo de CI puede autenticarse, descargar un fichero concreto por nombre y cachearlo localmente mediante `hf_hub_download`.
- Ejercicio de auditoría de reproducibilidad: permite practicar la detección de metadatos ausentes (semilla, hiperparámetros, partición de evaluación) y la reconstrucción de un experimento a partir de una model card incompleta.
- Prueba de seguridad de deserialización: útil para demostrar en entornos controlados por qué no debe cargarse un `joblib` o `pickle` de origen no verificado.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| Accuracy | 0.9667 | no especificado en la model card |

No se han publicado resultados de benchmarks adicionales en la informacion disponible. En concreto, la model card no indica si el 0.9667 corresponde a un conjunto de test reservado, a validación cruzada o al propio conjunto de entrenamiento, ni el tamano de la particion empleada. Dado que el dataset Iris contiene 150 muestras en total, la precisión puntual tiene un intervalo de confianza amplio: con n=150 el error estándar de una proporción de 0.9667 sería aproximadamente 1,5 puntos porcentuales, y sería aún mayor si la evaluación se hiciera sobre una partición de test de 45 muestras (en torno a 5 puntos porcentuales). No se dispone de comparaciones con otros modelos en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB. El modelo se ejecuta íntegramente en CPU.
- GPU recomendadas: ninguna. Cualquier CPU x86-64 o ARM moderna es suficiente; una GPU no aporta ventaja apreciable para este tipo de modelo.
- Compatibilidad con GPU de consumo: no aplica; no se necesita ninguna RTX, A100 o H100.
- Memoria RAM: el proceso de Python con `scikit-learn`, `joblib` y `numpy` cargados ocupa típicamente entre 100 MB y 300 MB, dominado por las dependencias y no por el modelo, cuyo repositorio está por debajo de 0.1 GB.
- Almacenamiento: el artefacto `model.joblib` y sus dependencias ocupan menos de 1 MB, aunque el Hub redondea el tamaño del repositorio a 0.0 GB.
- Opciones de despliegue: carga directa con `joblib.load` en un script Python; servicio HTTP con FastAPI, Flask o BentoML; Space de Gradio; contenedor Docker con `scikit-learn` fijado a una versión concreta.
- Opciones de despliegue no aplicables: vLLM, llama.cpp, Ollama y TGI están orientados a modelos de lenguaje y no soportan artefactos de `scikit-learn` serializados con `joblib`.
- Latencia y throughput: no disponibles. La model card no publica mediciones. Por la naturaleza del modelo (evaluación de rutas de decisión sobre 4 características), se espera una latencia del orden de microsegundos a pocos milisegundos por predicción individual y una capacidad de procesamiento por lotes muy alta en CPU, pero se trata de una estimación cualitativa no verificada.

## Comparativa con modelos similares

No se ha identificado en la informacion proporcionada ningún modelo comparable publicado en Hugging Face con métricas verificables. La comparación se plantea por tanto a nivel de familia de algoritmos para la misma tarea sobre el dataset Iris, sin datos de rendimiento de los alternativas.

| Alternativa | Tipo de modelo | Formato de serializacion | Licencia | Rendimiento publicado |
|---|---|---|---|---|
| Este modelo (`jmrs-iris-rf-joblib-demo`) | Random Forest | joblib | no disponible | Accuracy 0.9667 (particion no especificada) |
| Regresion logistica sobre Iris | Modelo lineal | joblib / pickle | no disponible | no disponible |
| k-NN (k=3..5) sobre Iris | Metodo basado en instancias | joblib / pickle | no disponible | no disponible |
| SVM con kernel RBF sobre Iris | Maquina de vectores soporte | joblib / pickle | no disponible | no disponible |

Las tres alternativas citadas son implementaciones habituales de `scikit-learn` para el mismo problema, pero no se dispone de repositorios equivalentes en Hugging Face ni de resultados comparables publicados en la informacion proporcionada, por lo que no se puede establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia no declarada: sin una licencia explícita, el uso comercial queda en una situación jurídica indeterminada. Debe solicitarse aclaración al autor antes de cualquier uso fuera de un contexto de prueba.
- Cero descargas y cero likes: el modelo no ha sido validado ni reproducido por terceros, por lo que no existe evidencia externa de su comportamiento.
- Metadatos incompletos: no hay información sobre número de árboles, profundidad, criterio de impureza, semilla, partición train/test ni preprocesado, lo que impide reproducir el entrenamiento.
- Accuracy sin contexto metodológico: no se especifica el conjunto de evaluación; si el 0.9667 se calculó sobre los mismos datos de entrenamiento, existe sobreajuste y el valor estaría inflado.
- Dominio extremadamente restringido: el modelo solo es válido para las cuatro medidas morfológicas de Iris en centímetros. Aplicado a otras especies, otras escalas (milímetros, pulgadas) u otras variables, las predicciones carecen de sentido.
- Sensibilidad a la escala de entrada: la ausencia de documentación sobre escalado implica que valores con unidades distintas pueden degradar las predicciones sin que el modelo emita ningún aviso.
- Sesgo del dataset de origen: Iris procede de una única región geográfica y de una muestra reducida; las fronteras entre versicolor y virginica son difusas y el modelo hereda esa ambigüedad.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de confianza mal calibrada: `predict_proba` devuelve votos de árboles, que no son probabilidades calibradas de forma nativa.
- Riesgo de seguridad en la carga: `joblib` se apoya en `pickle`; deserializar un fichero de origen no confiable permite ejecución de código arbitrario. Debe cargarse solo desde fuentes verificadas.
- Fragilidad frente a versiones: un cambio de versión de `scikit-learn` puede alterar las predicciones o provocar avisos de inconsistencia al cargar el artefacto.
- Sin garantías de mantenimiento: no hay información sobre soporte, actualizaciones ni resolución de incidencias por parte del autor.
- No apto para producción en dominios reales de clasificación botánica o agronómica, donde se requieren más variables, validación de campo y calibración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoanRiveros/jmrs-iris-rf-joblib-demo
- Space de Gradio mencionada en la model card: https://huggingface.co/spaces/JoanRiveros/jmrs-iris-rf-gradio-space
- No se han proporcionado papers, blogs, repositorios de código ni demos adicionales en la informacion disponible.
