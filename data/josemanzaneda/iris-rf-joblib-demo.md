# JoseManzaneda/iris-rf-joblib-demo

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un artefacto de aprendizaje automático clásico: un clasificador Random Forest entrenado con el dataset Iris de scikit-learn y serializado con joblib. Lo publica el usuario JoseManzaneda en HuggingFace como demostración reproducible de cómo distribuir modelos tabulares de scikit-learn a través del Hub. El problema que resuelve es la clasificación de flores de Iris en tres especies (setosa, versicolor y virginica) a partir de cuatro medidas morfológicas en centímetros.

El interés del artefacto es fundamentalmente didáctico y operativo: sirve como plantilla mínima para empaquetar un modelo de scikit-learn, cargarlo con `hf_hub_download` y desplegarlo en una interfaz Gradio alojada en un Space. Su autor reporta una accuracy de 0,9667 sobre el dataset Iris, una cifra coherente con lo esperable en este conjunto de datos, que es pequeño, balanceado y de dificultad baja.

No hay información pública sobre hiperparámetros, número de árboles, estrategia de partición de datos ni licencia. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y un tamaño declarado de 0,0 GB (por debajo del umbral de redondeo de HuggingFace), lo que confirma que se trata de un artefacto de pocos kilobytes. No debe confundirse con un modelo generativo ni usarse como tal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Random Forest (ensemble de árboles de decisión CART) de scikit-learn, serializado con joblib |
| Parámetros totales | no disponible (el autor no indica número de árboles, profundidad máxima ni número de nodos) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la entrada es un vector fijo de 4 variables numéricas) |
| Tipos de cuantización | no aplica (scikit-learn no emplea cuantización de pesos; el artefacto se distribuye como `model.joblib`) |
| Idiomas soportados | no aplica (clasificador tabular; no procesa texto) |
| Licencia | no disponible (no consta ni en los metadatos de HuggingFace ni en la model card) |
| Formato de pesos | joblib (`model.joblib`), serialización basada en pickle de scikit-learn |
| Variables de entrada | sepal length (cm), sepal width (cm), petal length (cm), petal width (cm) |
| Clases de salida | setosa, versicolor, virginica |
| Métrica reportada | accuracy = 0,9667 |
| Librería | scikit-learn |
| Tamaño del repositorio | 0,0 GB (redondeado por HuggingFace; consistente con un artefacto de pocos KB) |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creación y última actualización | 2026-10-02 (misma marca temporal en ambas) |

## Arquitectura y entrenamiento

Un Random Forest es un método de ensemble por bagging: se entrenan múltiples árboles de decisión sobre submuestras bootstrap del conjunto de entrenamiento y, en cada división de nodo, se considera un subconjunto aleatorio de las variables predictoras. La predicción final se obtiene por voto mayoritario entre los árboles. Es un modelo no paramétrico, determinista en inferencia y con coste de entrenamiento e inferencia muy inferior al de cualquier red neuronal. La model card no especifica el número de estimadores, el criterio de división, la profundidad máxima ni el uso de `random_state`, por lo que la reproducibilidad exacta del ajuste no puede garantizarse a partir de la información publicada.

El entrenamiento se realizó sobre el dataset Iris de scikit-learn: 150 muestras, 4 variables continuas y 3 clases perfectamente balanceadas (50 muestras por clase). No se detalla la partición entre entrenamiento, validación y test, ni si la accuracy reportada corresponde a test, a validación cruzada o al conjunto completo. Tampoco hay indicios de ajuste fino posterior, RLHF, DPO ni ninguna técnica de alineación, que no aplican a este tipo de modelo. La innovación técnica es nula por diseño: el valor del repositorio reside en ser un ejemplo mínimo y funcional de publicación de un modelo scikit-learn en HuggingFace, no en aportar una arquitectura novedosa.

## Capacidades

- Clasificación multiclase supervisada en tres categorías de la especie Iris (setosa, versicolor, virginica) a partir de cuatro medidas numéricas en centímetros.
- Inferencia sobre datos tabulares con valores continuos; no requiere tokenización, embeddings ni preprocesado textual.
- Si el artefacto es un `RandomForestClassifier` estándar, expone `predict` y `predict_proba`, de modo que puede devolver probabilidades por clase además de la etiqueta ganadora.
- Carga directa desde el Hub mediante `huggingface_hub.hf_hub_download` combinado con `joblib.load`, tal y como documenta la propia model card.
- Serialización autocontenida: el pipeline de inferencia no requiere descendir de un repositorio Git ni de un servicio externo, solo del fichero `model.joblib` y una versión compatible de scikit-learn.
- No soporta tool calling, function calling, razonamiento multi-step, agentes ni modo de pensamiento.
- No tiene capacidades multilingües: no procesa lenguaje natural.
- No tiene capacidades de visión, audio, código ni matemáticas simbólicas.

## Casos de uso

- Docencia de machine learning: ilustrar en clase el ciclo completo de entrenamiento, serialización con joblib y publicación en el Hub, usando un dataset que cabe en memoria y se entrena en milisegundos.
- Plantilla de empaquetado de modelos tabulares: servir de esqueleto para publicar clasificadores de producción (riesgo de crédito, scoring, segmentación) adaptando el pipeline de carga con `hf_hub_download`.
- Pruebas de integración de infraestructura: validar que un runner de CI/CD puede descargar artefactos desde el Hub, instalar `scikit-learn` y `joblib`, y ejecutar una inferencia de humo en menos de un segundo.
- Prototipo de API de clasificación: el Space Gradio asociado (`JoseManzaneda/iris-rf-gradio-space`) demuestra cómo envolver un modelo joblib en una interfaz web para validación manual por parte de stakeholders.
- Test de regresión de versiones: comprobar la compatibilidad de un `model.joblib` concreto frente a distintas versiones de scikit-learn, un problema real y frecuente en el despliegue de modelos serializados con pickle.
- Ejemplo reproducible de evaluación: usar la accuracy reportada como referencia mínima en comparaciones didácticas con regresión logística, SVM o KNN sobre el mismo dataset.
- Verificación de flujos de descarga y caché: probar la política de caché local de `huggingface_hub` en entornos sin conectividad intermitente, dado el tamaño reducido del artefacto.

## Benchmarks y rendimiento

El único dato de rendimiento publicado en la información disponible es la accuracy indicada por el autor en la model card. No se especifica el protocolo de evaluación, la partición de datos ni el intervalo de confianza, por lo que la cifra debe interpretarse con cautela.

| Benchmark | Resultado | Notas |
|---|---|---|
| Accuracy (dataset Iris) | 0,9667 | Reportado por el autor; partición y metodología no especificadas |
| MMLU, HumanEval, GSM8K y similares | no aplica | El modelo no es un modelo de lenguaje y no puede evaluarse con estos benchmarks |

Como referencia aritmética, sobre las 150 muestras del dataset Iris una accuracy de 0,9667 correspondería a 145 aciertos y 5 errores, aunque no puede confirmarse que la métrica se haya calculado sobre el conjunto completo.

## Requisitos de hardware

- VRAM para inferencia: 0 GB. El modelo se ejecuta íntegramente en CPU.
- GPU recomendadas: ninguna. No se requiere aceleración por hardware.
- Ejecución en hardware de consumo: sí, en cualquier equipo, incluidos Raspberry Pi y contenedores con 128 MB de RAM.
- Memoria RAM: no disponible como cifra exacta; el repositorio se declara como 0,0 GB y un Random Forest sobre Iris ocupa típicamente del orden de kilobytes.
- Opciones de despliegue: script de Python con `scikit-learn` y `joblib`, API REST con FastAPI o Flask, HuggingFace Spaces con Gradio, o ejecución dentro de un contenedor Docker. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no publicados. En la práctica, para un conjunto de este tamaño la inferencia por muestra se sitúa en el rango de microsegundos a pocos milisegundos en CPU, pero se trata de una estimación general y no de una medición realizada sobre este artefacto.

## Comparativa con modelos similares

No se han publicado datos de rendimiento de los modelos alternativos en la información disponible, por lo que la comparación se limita a características estructurales. Todos los artefactos de esta categoría comparten el mismo dataset de evaluación y un tamaño de unos pocos kilobytes.

| Modelo alternativo | Librería | Tipo | Accuracy en Iris | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (iris-rf-joblib-demo) | scikit-learn | Random Forest (bagging) | 0,9667 (reportada por el autor) | no disponible | HuggingFace Hub |
| LogisticRegression de scikit-learn | scikit-learn | Modelo lineal | no disponible | depende del proyecto; no aplica al artefacto | requiere entrenamiento propio |
| SVC de scikit-learn | scikit-learn | SVM con kernel | no disponible | depende del proyecto; no aplica al artefacto | requiere entrenamiento propio |
| KNeighborsClassifier de scikit-learn | scikit-learn | Basado en instancias | no disponible | depende del proyecto; no aplica al artefacto | requiere entrenamiento propio |
| DecisionTreeClassifier de scikit-learn | scikit-learn | Árbol único | no disponible | depende del proyecto; no aplica al artefacto | requiere entrenamiento propio |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts y no debe presentarse como tal en ningún contexto.
- Dominio cerrado: solo clasifica las tres especies del dataset Iris a partir de cuatro medidas morfológicas concretas. Cualquier otra entrada queda fuera de su ámbito de validez.
- Riesgo de alucinación: no aplica, ya que el modelo no genera contenido abierto. Sí existe el riesgo de extrapolación silenciosa si se le alimentan valores fuera del rango del dataset de entrenamiento, devolviendo una clase con aparente seguridad.
- Sesgos conocidos: el dataset Iris está perfectamente balanceado (50 muestras por clase) y es de origen histórico; el modelo no ha sido auditado frente a subgrupos, valores atípicos ni distribuciones desplazadas.
- Sin información sobre hiperparámetros: al no declararse número de árboles ni profundidad, no puede evaluarse el riesgo de sobreajuste ni reproducirse el ajuste exacto.
- Metodología de evaluación opaca: se desconoce si la accuracy de 0,9667 procede de un conjunto de test independiente, de validación cruzada o del conjunto completo de 150 muestras. En el último caso la cifra estaría optimista.
- Licencia no disponible: sin una licencia explícita, no hay autorización clara para uso comercial ni para redistribución. Cualquier uso en producción debería aclararse previamente con el autor.
- Compatibilidad de versiones: al ser una serialización pickle de scikit-learn, cargarlo con una versión distinta a la usada en el entrenamiento puede producir errores o avisos de incompatibilidad. La versión empleada no se especifica.
- Madurez: 0 descargas y 0 likes, sin mantenimiento documentado ni tests publicados. No es un artefacto apto para producción sin revisión propia.
- Idiomas, contexto y cuantización no aplican, pero se listan en la tabla de especificaciones para evitar ambigüedad respecto a modelos generativos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoseManzaneda/iris-rf-joblib-demo
- Space relacionado (referenciado en la model card): https://huggingface.co/spaces/JoseManzaneda/iris-rf-gradio-space
- Documentación de scikit-learn sobre Random Forest: no disponible en la información proporcionada
- Paper, blog o repositorio adicional del autor: no disponible en la información proporcionada
