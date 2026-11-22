# aminCHZ/cardio-risk-models

## Resumen

`aminCHZ/cardio-risk-models` es un repositorio de modelos de clasificación binaria orientados a la predicción de riesgo cardiovascular, publicado por el usuario aminCHZ en Hugging Face. No se trata de un modelo de lenguaje ni de una red neuronal profunda: el repositorio contiene un único artefacto, `models.joblib`, que empaqueta cuatro clasificadores clásicos de scikit-learn (k-NN, SVM con kernel RBF, árbol de decisión y bosque aleatorio) entrenados sobre el *Cardiovascular Disease dataset* de Kaggle, con 70 000 pacientes.

El paquete incluye además la lista de variables (`features`) empleadas en el entrenamiento, de modo que el consumidor puede reproducir el preprocesado esperado por los estimadores. La versión de scikit-learn utilizada durante el entrenamiento es la 1.6.1, dato relevante porque `joblib` puede fallar al deserializar estimadores entrenados con versiones distintas de la librería.

El proyecto se declara explícitamente como pedagógico y el propio autor advierte de que no constituye una herramienta de diagnóstico médico. Su interés práctico es limitado: sirve como ejemplo reproducible de comparación de clasificadores clásicos sobre un conjunto de datos tabular sanitario, no como componente listo para producción clínica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cuatro clasificadores scikit-learn: k-NN, SVM con kernel RBF, arbol de decision y bosque aleatorio |
| Parametros totales | No disponible (no aplica; modelos no neuronales) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (datos tabulares, no secuencias de texto) |
| Tipos de cuantizacion | No disponible (no aplica) |
| Idiomas soportados | No disponible (no procesa lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | `models.joblib` (serializacion joblib de scikit-learn 1.6.1) |

## Arquitectura y entrenamiento

El repositorio no contiene una arquitectura única sino un *bundle* con cuatro estimadores independientes de scikit-learn: k-NN, SVM con kernel RBF, árbol de decisión y bosque aleatorio. Todos ellos operan sobre variables tabulares del *Cardiovascular Disease dataset* de Kaggle (70 000 pacientes), un conjunto con variables como edad, presión arterial, colesterol, hábitos y antropometría. No se especifica en la model card el número de árboles del bosque, la profundidad máxima, el valor de `k` en k-NN, los hiperparámetros de la SVM ni el esquema de validación cruzada empleado.

Tampoco se documentan el preprocesado aplicado (escalado, codificación de categóricas, tratamiento de valores atípicos), la métrica objetivo ni el umbral de decisión. La única información técnica reproducible es la versión de scikit-learn (1.6.1) y la estructura del diccionario serializado, con las claves `models` y `features`. No hay indicios de entrenamiento con descenso de gradiente, ajuste fino, RLHF ni técnicas de regularización más allá de las propias de cada estimador.

## Capacidades

- Clasificación binaria tabular de riesgo cardiovascular a partir de variables clínicas y de estilo de vida del dataset de Kaggle.
- Comparación interna de cuatro familias de clasificadores clásicos sobre el mismo conjunto de características, útil para experimentación docente.
- Exposición de la lista de `features` esperadas, lo que permite alinear el preprocesado del lado del consumidor.
- Serialización portable mediante `joblib`, cargable con `huggingface_hub.hf_hub_download`.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües, de visión, audio ni generación de texto.
- No dispone de modo *thinking* ni de decodificación especulativa.

## Casos de uso

- Docencia de aprendizaje automático clásico: el bundle permite comparar en una sola sesión el comportamiento de k-NN, SVM, árbol y bosque sobre el mismo conjunto tabular, sin necesidad de reentrenar.
- Reproducción de experimentos: al incluir la lista de `features` y fijar la versión de scikit-learn (1.6.1), un investigador puede replicar el pipeline de inferencia y verificar resultados frente a los suyos.
- Prototipado de pipelines de datos sanitarios: sirve como *smoke test* para validar que un ETL produce las columnas esperadas antes de conectar un modelo propio.
- Comparación de líneas base en trabajos académicos: los cuatro clasificadores actúan como referencia mínima frente a la que medir modelos más complejos (gradient boosting, redes tabulares).
- Evaluación de robustez ante desbalanceo: el dataset de enfermedad cardiovascular está desbalanceado, por lo que el bundle es útil para estudiar cómo se comporta cada familia de clasificadores en esa situación.
- Demostración de despliegue con Hugging Face Hub: el patrón `hf_hub_download` + `joblib.load` sirve como ejemplo mínimo de distribución de artefactos scikit-learn en un repositorio de modelos.
- Integración en cuadernos de análisis exploratorio: cargar los modelos y consultar `bundle["features"]` para inspeccionar qué variables espera cada estimador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye matrices de confusión, exactitud, AUC-ROC, sensibilidad, especificidad ni comparación numérica entre los cuatro clasificadores.

## Requisitos de hardware

- Inferencia en CPU: los cuatro estimadores (k-NN, SVM RBF, árbol y bosque) se ejecutan en CPU sin GPU; el coste dominante es la búsqueda de vecinos en k-NN y la evaluación de vectores soporte en la SVM.
- VRAM: no requiere GPU; 0 GB de VRAM dedicada.
- RAM estimada: el repositorio ocupa 0.0 GB según Hugging Face, aunque el tamaño real de `models.joblib` no se detalla; para 70 000 muestras de entrenamiento y cuatro modelos, un entorno con 2-4 GB de RAM es suficiente en la mayoría de configuraciones.
- GPU recomendadas: no aplica; cualquier GPU es irrelevante para estos estimadores.
- Cabe en cualquier GPU de consumo y en entornos sin GPU (portátiles, contenedores ligeros, Raspberry Pi con limitaciones de memoria).
- Opciones de despliegue: script Python con `joblib` y scikit-learn 1.6.1; también es posible servirlo con FastAPI o Flask envolviendo la llamada a `predict`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del tamaño del conjunto de test y del clasificador consultado.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otros repositorios de Hugging Face directamente comparables (mismo dataset, mismas familias de clasificadores y mismo formato de empaquetado). La búsqueda web devuelve un artículo sobre modelos de predicción de rotura cardíaca tras infarto de miocardio, que aborda un problema clínico distinto y no es equiparable en arquitectura ni en datos.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `aminCHZ/cardio-risk-models` | No disponible (4 clasificadores clásicos) | No aplica | No disponible | No disponible | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El autor declara explícitamente que es un proyecto pedagógico y que no constituye una herramienta de diagnóstico médico; no debe usarse para decisiones clínicas.
- Licencia no especificada: la ausencia de licencia impide asumir permisos de uso comercial, modificación o redistribución.
- No se documentan sesgos del dataset ni del modelo; el *Cardiovascular Disease dataset* de Kaggle tiene composición demográfica concreta y los sesgos de esa muestra se trasladan a los clasificadores.
- No se reportan métricas de rendimiento, calibración ni umbrales de decisión, por lo que no es posible evaluar el riesgo de falsos positivos y falsos negativos.
- Dependencia estricta de scikit-learn 1.6.1: cargar `models.joblib` con otra versión puede producir errores de deserialización o cambios silenciosos en el comportamiento.
- No se especifica el preprocesado (escalado, codificación de categóricas), de modo que el consumidor debe inferirlo a partir de `features` y del dataset original, con riesgo de desalineación.
- El repositorio tiene 0 descargas y 0 *likes*, sin historial de uso que permita validar su calidad.
- No procesa texto ni imágenes: cualquier caso de uso que requiera lenguaje natural, visión o razonamiento multi-paso queda fuera de su alcance.
- No hay información sobre el esquema de validación ni sobre posible fuga de datos entre entrenamiento y prueba.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/aminCHZ/cardio-risk-models
- Dataset de referencia citado en la model card: Cardiovascular Disease dataset (Kaggle), sin URL directa en la información proporcionada.
- Artículo relacionado encontrado en la búsqueda web (contexto clínico distinto, no es el modelo): https://www.frontiersin.org/journals/cardiovascular-medicine/articles/10.3389/fcvm.2026.1721103/full
