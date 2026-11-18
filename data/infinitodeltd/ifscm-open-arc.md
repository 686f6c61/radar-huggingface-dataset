# InfinitodeLTD/IFSCM-OPEN-ARC

## Resumen

IFSCM-OPEN-ARC es un clasificador tabular multiclase publicado por InfinitodeLTD dentro de su iniciativa OPEN-ARC (Project 15). No es un modelo de lenguaje ni una red neuronal: se trata de un `RandomForestClassifier` de scikit-learn serializado con joblib que predice la especie de una flor de Iris (setosa, versicolor o virginica) a partir de cuatro medidas en centimetros (longitud y anchura del sepal y del petalo). El artefacto ocupa esencialmente 0 GB y se distribuye como un unico fichero `iris_classifier.joblib`.

El modelo se entrena sobre el clasico dataset Iris (150 filas, 50 por especie) con un split 80/20 y `random_state=42`, usando 100 arboles. Su relevancia es exclusivamente educativa y de investigacion: sirve como ejemplo minimo de pipeline de clasificacion tabular con scikit-learn y como material de demostracion dentro del repositorio OPEN-ARC. No compite con modelos fundacionales ni con clasificadores tabulares de proposito general.

Conviene subrayar que el autor no declara licencia en Hugging Face, no especifica idiomas y no publica resultados de benchmarks independientes: las unicas metricas disponibles son las del cuaderno de entrenamiento sobre su propio split de test, que el propio autor advierte que no constituyen una evaluacion independiente del artefacto subido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RandomForestClassifier (scikit-learn), `n_estimators=100`, `random_state=42` |
| Parametros totales | no disponible (modelo basado en arboles; no aplica el concepto de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificacion tabular; entrada fija de 4 caracteristicas) |
| Tipos de cuantizacion | no disponible (no aplica; serializacion joblib) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible (el autor remite a los terminos de Project 15; no se ha declarado licencia en Hugging Face) |
| Formato de pesos | joblib (`iris_classifier.joblib`), scikit-learn 1.9.1 |

## Arquitectura y entrenamiento

La arquitectura es un bosque aleatorio de 100 arboles de decision (`RandomForestClassifier`) implementado en scikit-learn. El modelo se serializa con joblib y se carga mediante `joblib.load`. No hay capas neuronales, atencion, embeddings ni mecanismo de contexto: la entrada es un vector de cuatro caracteristicas numericas (`SepalLengthCm`, `SepalWidthCm`, `PetalLengthCm`, `PetalWidthCm`) y la salida es una etiqueta de especie.

El entrenamiento usa el dataset Iris Species de Kaggle (150 filas, 50 por clase), con eliminacion de filas con valores faltantes y exclusion de las columnas `Id` y `Species` del conjunto de caracteristicas. El split es 80/20 con `random_state=42`, lo que deja 120 filas de entrenamiento y 30 de test. No se documenta ningun proceso de ajuste de hiperparametros, validacion cruzada, RLHF, DPO ni tecnica de regularizacion adicional. El artefacto corresponde al commit `cc4760dbce70898cd05994f6398afb7b3d5f8a0d` del Project 15 del repositorio OPEN-ARC.

## Capacidades

- Clasificacion multiclase tabular en tres categorias (setosa, versicolor, virginica).
- Prediccion a partir de cuatro caracteristicas numericas continuas en centimetros.
- Integracion directa con pandas: acepta un `DataFrame` con las columnas en el orden esperado.
- Serializacion y carga via joblib, compatible con el ecosistema scikit-learn.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa lenguaje natural).
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Docencia de clasificacion tabular: el modelo sirve como ejemplo minimo y reproducible de un pipeline `train/test split` + `RandomForestClassifier` + serializacion joblib en cursos de machine learning.
- Prueba de integracion de Hugging Face Hub en pipelines de datos: permite validar el flujo `hf_hub_download` + `joblib.load` + `predict` con un artefacto pequeno y rapido de descargar.
- Demostracion de clasificacion de especies en aplicaciones botanicas educativas: dado un conjunto de medidas de sepal y petalo, devuelve la especie estimada, util en cuadernos de practicas.
- Benchmark interno de infraestructura de inferencia tabular: al ser un modelo trivial, sirve para medir latencia de carga y de prediccion en un entorno concreto sin que el modelo sea el cuello de botella.
- Test de compatibilidad de versiones de scikit-learn: el artefacto registra la version 1.9.1 y permite comprobar el comportamiento de carga entre versiones (el autor advierte que la carga entre versiones no esta soportada).
- Ejemplo de referencia en documentacion tecnica: util para ilustrar el formato de una model card, la estructura de un repositorio de Hugging Face o el uso de `config.json` como fichero de conteo de descargas.

## Benchmarks y rendimiento

Resultados reportados por el cuaderno del Project 15 sobre su split de test de 30 filas (el autor indica explicitamente que no son una evaluacion independiente del artefacto subido):

| Metrica | Valor |
|---|---|
| Accuracy | 1.0000 |
| Precision ponderada | 1.0000 |
| Recall ponderado | 1.0000 |
| F1 ponderado | 1.0000 |

No se han publicado resultados de benchmarks independientes ni comparaciones con otros modelos en la informacion disponible. El 1.0000 debe interpretarse con cautela: el dataset Iris es pequeno, muy separable y el split de test es de solo 30 filas, por lo que la metrica no es representativa de rendimiento en poblaciones nuevas.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo se ejecuta en CPU y ocupa un espacio despreciable en disco (repositorio de 0.0 GB).
- GPU recomendadas: no aplica; no requiere GPU.
- Compatibilidad con GPU consumer: irrelevante, funciona en cualquier CPU.
- Opciones de despliegue: Python con scikit-learn 1.9.1 y joblib; descarga via `huggingface_hub`. No aplica vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles de forma oficial; por la naturaleza del modelo (100 arboles sobre 4 caracteristicas) la prediccion es del orden de microsegundos a milisegundos por muestra en CPU, pero no se ha publicado una medicion formal.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| IFSCM-OPEN-ARC | RandomForestClassifier (scikit-learn) | no aplica | no aplica | Accuracy 1.0000 en test propio (30 filas) | no disponible | Hugging Face |
| Clasificadores tabulares de referencia de scikit-learn (p. ej. `LogisticRegression`, `SVC`, `GradientBoostingClassifier`) | Algoritmos clasicos | no aplica | no aplica | Depende del dataset; en Iris suelen alcanzar valores cercanos a 1.0 | BSD-3-Clause (scikit-learn) | PyPI / scikit-learn |
| Modelos fundacionales tabulares (p. ej. TabPFN, XGBoost) | Red neuronal / gradient boosting | no disponible | no aplica | No comparable directamente sin evaluacion comun | Varía segun proyecto | Hugging Face / PyPI |

No se dispone de comparaciones publicadas entre este artefacto y alternativas concretas en la informacion proporcionada. La comparativa anterior es orientativa y se basa en el conocimiento general del ecosistema, no en datos del autor.

## Limitaciones y advertencias

- Dataset minimo y no representativo: 150 filas de tres especies de Iris no cubren la variabilidad real de poblaciones botanicas; el rendimiento en datos nuevos puede degradarse notablemente.
- Metricas no independientes: el 1.0000 procede del cuaderno de entrenamiento sobre su propio split de test de 30 filas, no de una evaluacion externa.
- Dependencia estricta del formato de entrada: las columnas deben respetar el mismo orden, nombres y unidades (centimetros) que en entrenamiento; cualquier desviacion invalida la prediccion.
- Compatibilidad de versiones: el artefacto registra scikit-learn 1.9.1; el autor advierte que la carga entre versiones no esta soportada.
- Licencia no declarada: no hay licencia en Hugging Face y el autor remite a los terminos del Project 15; el proyecto se describe como recurso de aprendizaje e investigacion, no para uso comercial. Es imprescindible revisar los terminos antes de cualquier uso en produccion.
- Riesgo de seguridad en la carga: joblib puede ejecutar codigo arbitrario al deserializar; solo debe cargarse desde fuentes de confianza.
- Sin soporte de texto, vision, audio ni tool calling: no es adecuado para tareas de lenguaje natural ni para agentes.
- Sin sesgos documentados ni evaluacion de equidad: no se ha realizado ningun analisis de sesgo sobre el artefacto.
- Sin garantias de mantenimiento: creado y actualizado el 2026-11-18, con 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/InfinitodeLTD/IFSCM-OPEN-ARC
- Repositorio OPEN-ARC: https://github.com/Infinitode/OPEN-ARC/
- Project 15: https://github.com/Infinitode/OPEN-ARC/tree/main/Project-15
- Dataset Iris Species (Kaggle): https://www.kaggle.com/datasets/uciml/iris
- Documentacion de conteo de descargas de Hugging Face: https://huggingface.co/docs/hub/models-download-stats
- Formulario de contacto del autor: https://infinitode.netlify.app/forms/contact
