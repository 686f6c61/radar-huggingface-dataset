# pardorale7/iris-rf-joblib-demo

## Resumen

Iris Random Forest Model es un artefacto de aprendizaje automático clásico publicado en Hugging Face por el usuario pardorale7. No se trata de un modelo de lenguaje ni de una red neuronal profunda: es un `RandomForestClassifier` de scikit-learn entrenado sobre el dataset Iris y serializado en formato `joblib` bajo el nombre `model.joblib`. El repositorio se etiqueta con `scikit-learn`, `joblib`, `iris`, `random-forest` y `classification`, y su tamaño declarado es de 0.0 GB.

El modelo resuelve un problema de clasificación supervisada trivial: predecir la especie de una flor de Iris (setosa, versicolor o virginica) a partir de cuatro medidas morfológicas (longitud y anchura del sépalo y del pétalo, en centímetros). La única métrica publicada por el autor es un accuracy de 0.9667. Todo apunta a un artefacto de demostración con fines didácticos o de prueba de flujo de publicación, no a un componente pensado para producción.

Su relevancia es, por tanto, instrumental: sirve como ejemplo mínimo de cómo publicar y consumir un modelo de scikit-learn desde el Hub mediante `hf_hub_download` + `joblib.load`, y como banco de pruebas para el Space de Gradio que el autor anuncia en la misma model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest (conjunto de árboles de decisión con bagging y selección aleatoria de variables, implementado en `sklearn.ensemble.RandomForestClassifier`) |
| Parametros totales | no disponible (la model card no documenta número de árboles, profundidad máxima ni número de nodos) |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no aplica (no hay pesos en coma flotante susceptibles de cuantización tipo GGUF/AWQ/GPTQ) |
| Idiomas soportados | no aplica (no procesa texto); las etiquetas de clase están en inglés: setosa, versicolor, virginica |
| Licencia | no disponible (la ficha del Hub no declara licencia) |
| Formato de pesos | `joblib` (fichero `model.joblib`); no se ofrecen safetensors, GGUF ni ONNX |
| Variables de entrada | 4 variables numéricas: sepal length (cm), sepal width (cm), petal length (cm), petal width (cm) |
| Clases de salida | 3 clases: setosa, versicolor, virginica |
| Métrica declarada | Accuracy: 0.9667 |
| Librería | scikit-learn (versión no especificada) |
| Tamaño del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación (según el Hub) | 2026-10-02 |

## Arquitectura y entrenamiento

La arquitectura es un bosque aleatorio: un conjunto de árboles de decisión entrenados sobre submuestras bootstrap del conjunto de datos, con selección aleatoria de un subconjunto de variables en cada división de nodo, y agregación de predicciones por voto mayoritario (y promedio de probabilidades en `predict_proba`). Es un modelo determinista en inferencia, entrenado por lotes y sin fases de ajuste fino, RLHF, DPO ni decodificación especulativa, conceptos que no aplican a este tipo de estimador.

Los datos de entrenamiento son el dataset Iris incluido en scikit-learn: 150 muestras, 4 variables numéricas continuas y 3 clases balanceadas (50 muestras por clase). La model card no especifica el número de árboles, el criterio de impureza, la profundidad máxima, la semilla aleatoria, ni si se aplicó partición train/test, validación cruzada o ajuste de hiperparámetros. Tampoco se documenta la versión exacta de scikit-learn empleada para el entrenamiento, dato relevante porque la compatibilidad de la serialización `joblib` entre versiones no está garantizada.

## Capacidades

- Clasificación supervisada multiclase (3 clases) a partir de 4 variables numéricas de entrada.
- Estimación de probabilidades por clase mediante `predict_proba`, además de la etiqueta dura.
- Inferencia determinista y reproducible en CPU, sin dependencia de GPU.
- Carga y ejecución directa en Python mediante `joblib.load` tras descargar el artefacto con `huggingface_hub`.
- No soporta generación de texto, razonamiento, código ni matemáticas simbólicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües, de visión, audio ni modo "thinking".

## Casos de uso

- Docencia y material de aula: sirve para ilustrar el ciclo completo de entrenamiento, serialización y publicación de un clasificador de scikit-learn en Hugging Face, con un coste computacional nulo para el alumnado.
- Plantilla de publicación de artefactos clásicos: el autor (o un tercero) puede clonar la estructura del repositorio (`model.joblib` + model card) como esqueleto para publicar otros modelos de scikit-learn en el Hub.
- Prueba de integración de descarga: validar en un pipeline de CI que `hf_hub_download` y `joblib.load` funcionan correctamente con repositorios pequeños y privados o públicos.
- Fixture en tests automatizados: usar el modelo como artefacto ligero y determinista en pruebas unitarias de servicios de inferencia, sin necesidad de descargar pesos grandes ni de disponer de GPU.
- Demo interactiva en Gradio: alimentar el Space `pardorale7/iris-rf-gradio-space` mencionado en la model card con cuatro sliders numéricos para mostrar en tiempo real la clase predicha y las probabilidades.
- Baseline de comparación didáctica: punto de partida frente a otros clasificadores (regresión logística, SVM, k-NN) en ejercicios comparativos sobre Iris dentro de un curso de introducción al machine learning.
- Ejemplo de API REST mínima: envolver el modelo en un endpoint tipo FastAPI que reciba las cuatro medidas y devuelva la especie, para demostrar el despliegue de modelos tabulares sin infraestructura de GPU.

## Benchmarks y rendimiento

La única métrica publicada por el autor es la siguiente:

| Benchmark | Métrica | Resultado | Notas |
|---|---|---|---|
| Dataset Iris (scikit-learn) | Accuracy | 0.9667 | Dato autorreportado en la model card; no se especifica partición train/test ni protocolo de evaluación |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, y en cualquier caso no serían aplicables a un modelo tabular de este tipo. Conviene señalar que un accuracy de 0.9667 sobre Iris equivale aproximadamente a 145 aciertos de 150 muestras, lo que sugiere una evaluación sobre el conjunto completo sin reserva de test; sin partición documentada, la cifra debe tomarse como indicativa y potencialmente optimista.

## Requisitos de hardware

- VRAM para inferencia: 0 GB; el modelo se ejecuta exclusivamente en CPU.
- GPU recomendadas: no aplica; no se requiere ni se aprovecha aceleración por GPU.
- Compatibilidad con GPU de consumo: no aplica (no hay versión GPU ni kernels específicos).
- Memoria RAM necesaria: no disponible con precisión; el repositorio declara 0.0 GB y un bosque aleatorio sobre 150 muestras con 4 variables ocupa del orden de kilobytes a pocos megabytes, muy por debajo de cualquier umbral problemático.
- Opciones de despliegue: Python con `scikit-learn` y `joblib`; también es posible servirlo mediante FastAPI, Flask o Gradio. No hay artefactos para vLLM, llama.cpp, Ollama, TGI ni ONNX, ya que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un bosque aleatorio de pequeño tamaño sobre 4 variables, la inferencia es de coste despreciable en cualquier CPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No existen modelos publicados comparables directamente (mismo artefacto, mismo autor, misma tarea) en la información disponible. A modo de referencia metodológica, se compara con las implementaciones equivalentes de scikit-learn que se usan habitualmente como alternativas sobre el dataset Iris:

| Alternativa (implementación scikit-learn) | Tipo de modelo | Entrada | Licencia de la librería | Notas |
|---|---|---|---|---|
| `RandomForestClassifier` (este modelo) | Conjunto de árboles con bagging | 4 variables numéricas | no declarada para este artefacto | No requiere escalado de variables; interpretabilidad parcial vía importancia de variables |
| `LogisticRegression` | Modelo lineal | 4 variables numéricas | BSD-3-Clause (scikit-learn) | Requiere escalado; coeficientes interpretables; rendimiento en Iris no disponible en esta ficha |
| `SVC` | Máquina de vectores soporte | 4 variables numéricas | BSD-3-Clause (scikit-learn) | Sensible al escalado y a la elección de kernel y C; rendimiento en Iris no disponible en esta ficha |
| `KNeighborsClassifier` | Método basado en instancias | 4 variables numéricas | BSD-3-Clause (scikit-learn) | Sensible al escalado y al valor de k; coste de inferencia crece con el número de muestras |

No se dispone de cifras de accuracy comparativas para estas alternativas dentro de la información proporcionada, por lo que no se incluyen valores numéricos.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia en la ficha del Hub, el uso comercial queda en una situación jurídica indeterminada; conviene contactar con el autor antes de integrarlo en cualquier producto.
- Modelo de demostración: el dataset Iris es diminuto (150 muestras), balanceado y de laboratorio; el modelo no es representativo de datos reales de campo ni generaliza fuera de ese dominio.
- Ausencia de protocolo de evaluación: no se documenta la partición train/test ni el método de cálculo del accuracy de 0.9667, por lo que la cifra no es verificable de forma independiente.
- Sobreajuste potencial: sin información sobre número de árboles, profundidad ni regularización, no puede descartarse un ajuste excesivo al conjunto completo.
- Compatibilidad de serialización: `joblib` no garantiza la carga correcta entre versiones mayores de scikit-learn; se desconoce la versión usada en el entrenamiento, lo que puede provocar avisos o fallos al cargar el artefacto.
- Riesgo de alucinación: no aplica en el sentido habitual (no genera texto), pero sí existe riesgo de predicciones erróneas o de confianza mal calibrada fuera de la distribución de Iris.
- Sesgos conocidos: no documentados. Al tratarse de un dataset de flores, no hay consideraciones de sesgo social o demográfico, pero tampoco hay análisis de equidad entre clases.
- Idiomas: las etiquetas están en inglés; no hay soporte multilingüe ni de entrada en lenguaje natural.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Contexto y secuencialidad: no mantiene estado ni contexto conversacional; cada predicción es independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pardorale7/iris-rf-joblib-demo
- Space de Gradio anunciado en la model card: https://huggingface.co/spaces/pardorale7/iris-rf-gradio-space
- Dataset Iris de scikit-learn: no disponible en la información proporcionada (el autor no incluye enlace directo; se referencia por el nombre del dataset incluido en la librería)
