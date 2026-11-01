# abir71/maternal-fetal-risk-models

## Resumen

`abir71/maternal-fetal-risk-models` es un conjunto de dos clasificadores tabulares de scikit-learn (un random forest y un arbol de decision) desarrollados por Abir Tanzim y colaboradores de la Universidad de Ciencia y Tecnologia de Noakhali (Bangladesh). El modelo asigna un registro clinico de embarazo a una de tres categorias de riesgo (bajo, medio, alto) a partir de 19 mediciones clinicas, como presion arterial, glucosa en ayunas, HbA1c, TSH, frecuencia cardiaca fetal o indice de liquido amniotico. Acompana al articulo publicado en *Cloud Computing and Data Science* 7(2) en 2026.

No es un modelo de lenguaje ni una red neuronal profunda: es un pipeline clasico de aprendizaje supervisado (imputacion por mediana mas random forest o arbol de decision) empaquetado en formato `joblib`. Su relevancia es metodologica mas que de rendimiento: el autor documenta de forma explicita un problema de fuga de datos en el conjunto original (930 filas pero solo 100 pacientes unicos, lo que explica el 100 % de exactitud reportado por otros trabajos) y reentrena sobre los 100 registros unicos con validacion cruzada repetida.

El resultado es un modelo de investigacion honesto pero de alcance muy limitado: exactitud del 75,6 % en el random forest y del 63,0 % en el arbol de decision, con una advertencia clara de que no es un dispositivo medico y no debe usarse para diagnostico ni decisiones clinicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: imputacion por mediana + RandomForestClassifier (100 arboles, minimo 3 registros por hoja) / DecisionTreeClassifier (profundidad 3, minimo 3 registros por hoja) |
| Parametros totales | no disponible (no aplica; modelo basado en arboles, no en pesos neuronales) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificacion tabular con 19 caracteristicas de entrada) |
| Tipos de cuantizacion | no disponible (no aplica; artefactos `joblib` de scikit-learn) |
| Idiomas soportados | en (etiquetas y documentacion en ingles) |
| Licencia | MIT |
| Formato de pesos | `joblib` (scikit-learn Pipeline serializado) + `metadata.json` |
| Version de scikit-learn requerida | 1.9.1 |
| Entradas | 19 caracteristicas clinicas (edad, presion sistolica/diastolica, fiebre, temperatura, frecuencia cardiaca materna, movimientos fetales en 2 h, obesidad, IMC, glucosa aleatoria y en ayunas, HbA1c, HBsAg, TSH, ALT, acido urico, frecuencia cardiaca fetal, indice de liquido amniotico) |
| Salidas | 3 clases: 0 = riesgo bajo, 1 = riesgo medio, 2 = riesgo alto |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

El modelo no emplea aprendizaje profundo. Cada archivo es un `Pipeline` de scikit-learn que primero rellena valores ausentes con la mediana del conjunto de entrenamiento y despues aplica el clasificador. Se publican dos variantes: un random forest de 100 arboles con al menos 3 registros por hoja (el modelo principal) y un arbol de decision de profundidad 3 con la misma restriccion de hoja (pensado para interpretabilidad y explicacion). La restriccion de minimo 3 registros por hoja busca limitar la influencia de cualquier paciente individual sobre el modelo.

El entrenamiento se realizo sobre 100 registros unicos de pacientes (37 de riesgo bajo, 30 de riesgo medio, 33 de riesgo alto) recogidos en cinco hospitales del distrito de Noakhali (Bangladesh) entre enero y marzo de 2024. El autor documenta que el fichero de datos original del estudio contenia 930 filas pero solo 100 pacientes unicos (86 registros repetidos 10 veces, 7 repetidos 9 veces y 7 sin repeticion); un split aleatorio 67/33 hacia que 305 de las 307 filas de test tuvieran copia identica en entrenamiento, lo que explica el 100 % de exactitud reportado en el articulo. Por ello, el reentrenamiento se hizo solo con los 100 registros unicos y validacion cruzada estratificada de 5 pliegues repetida 20 veces, con la imputacion ajustada dentro de cada pliegue de entrenamiento. Las etiquetas no son resultados reales de embarazo, sino asignaciones por reglas de umbral clinico con revision de profesionales.

## Capacidades

- Clasificacion tabular multiclase (3 niveles de riesgo) a partir de 19 variables clinicas numericas y binarias.
- Salida de probabilidades por clase mediante `predict_proba`, util para umbrales personalizados.
- Imputacion integrada de valores ausentes mediante mediana del entrenamiento.
- Modelo interpretable alternativo (arbol de profundidad 3) para explicar las decisiones.
- No soporta tool calling, function calling ni uso como agente.
- No tiene capacidad de generacion de texto, codigo, matematicas ni vision.
- No es multilingue: solo etiquetas y documentacion en ingles.
- No dispone de modo de razonamiento (thinking mode), audio ni multimodalidad.

## Casos de uso

- Docencia y reproduccion de metodologia: sirve como ejemplo practico de deteccion de fuga de datos y de validacion cruzada correcta en conjuntos tabulares pequenos con registros duplicados.
- Prototipado de triaje no clinico en entornos de investigacion: permite explorar como se comportaria un clasificador de riesgo gestacional antes de invertir en un estudio prospectivo con datos reales.
- Analisis de sensibilidad de variables: el arbol de profundidad 3 permite inspeccionar que caracteristicas (presion, glucosa, TSH) dominan la asignacion de riesgo en este conjunto.
- Benchmark interno de pipelines tabulares: util como linea base de scikit-learn contra la que comparar modelos mas complejos (gradient boosting, redes tabulares) sobre los mismos 19 atributos.
- Demostracion interactiva en el Space asociado: el autor publica un Space de Hugging Face para probar predicciones con registros de ejemplo, adecuado para talleres y presentaciones.
- Pruebas de integracion de extremo a extremo en MLOps: al ser un `joblib` con version fijada de scikit-learn, sirve para validar pipelines de empaquetado, versionado y serving de modelos tabulares.
- Investigacion sobre calibracion y clases desbalanceadas: la clase de riesgo medio (recall ~60 %) es un caso de estudio util para tecnicas de reequilibrado.

## Benchmarks y rendimiento

Resultados publicados en la model card, con validacion cruzada estratificada de 5 pliegues repetida 20 veces sobre los 100 registros unicos:

| Modelo | Exactitud | F1 macro | Recall bajo | Recall medio | Recall alto |
|---|---|---|---|---|---|
| Random forest | 75,6 % ± 8,2 | 74,3 % | 94 % | 60 % | 69 % |
| Arbol de decision (profundidad 3) | 63,0 % ± 10,2 | 61,1 % | 76 % | 51 % | 60 % |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: los dos modelos son arboles de pequeno tamano (100 arboles y profundidad 3) y se ejecutan en cualquier CPU moderna en milisegundos por prediccion.
- VRAM: no requiere GPU; 0 GB de VRAM.
- GPU recomendadas: no aplica; no se necesita A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: irrelevante, ya que el modelo no usa aceleracion por GPU.
- Despliegue: cualquier entorno con Python y scikit-learn 1.9.1 (servicio REST con FastAPI o Flask, batch con pandas, integracion en notebooks). No es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles de forma oficial; por la naturaleza del modelo (arboles pequenos) se espera latencia de orden de milisegundos y throughput de miles de predicciones por segundo en CPU, aunque no se aportan cifras medidas.
- Almacenamiento: repositorio de 0,0 GB; los artefactos `joblib` ocupan muy poco espacio.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| abir71/maternal-fetal-risk-models (random forest) | Clasificador tabular scikit-learn | no aplica | no aplica | 75,6 % exactitud, F1 macro 74,3 % | MIT | Hugging Face |
| abir71/maternal-fetal-risk-models (arbol de decision) | Clasificador tabular scikit-learn | no aplica | no aplica | 63,0 % exactitud, F1 macro 61,1 % | MIT | Hugging Face |
| Modelos de riesgo gestacional basados en gradient boosting (XGBoost/LightGBM) | Clasificador tabular | no aplica | no aplica | no disponible en la informacion proporcionada | variable | no disponible |
| Modelos clinicos de riesgo materno publicados en la literatura | variable | no disponible | no disponible | no disponible | variable | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada; la comparativa se limita a la categoria y al tipo de artefacto.

## Limitaciones y advertencias

- Modelo de investigacion, no dispositivo medico: el autor prohibe explicitamente su uso para diagnostico, tratamiento o cualquier decision clinica.
- Muestra muy pequena y local: solo 100 registros de cinco hospitales de un distrito de Bangladesh, recogidos en tres meses (enero-marzo de 2024); la transferencia a otras poblaciones u hospitales no esta garantizada.
- Etiquetas imitadas, no resultados reales: el modelo aprende a reproducir reglas de umbral clinico con revision profesional, no a predecir desenlaces reales del embarazo.
- La clase de riesgo medio es la mas dificil, con un recall de aproximadamente el 60 %.
- Unidades mixtas en los registros de origen para algunos valores de laboratorio (HbA1c, acido urico), lo que puede degradar la calidad de las entradas.
- Incertidumbre amplia: la exactitud varia unos ±8-10 puntos porcentuales entre pliegues.
- Dependencia estricta de scikit-learn 1.9.1 para cargar los artefactos `joblib`; versiones distintas pueden romper la deserializacion.
- Los datos de pacientes no se publican; solo estan disponibles bajo peticion razonable al autor de correspondencia.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta agentes ni tool calling, y no debe evaluarse con los criterios habituales de un LLM.
- Licencia MIT permite uso comercial del codigo y los artefactos, pero las advertencias eticas y la ausencia de validacion clinica desaconsejan cualquier uso en produccion sanitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abir71/maternal-fetal-risk-models
- Demo interactiva (Space): https://huggingface.co/spaces/abir71/maternal-fetal-risk-demo
- Articulo asociado: https://doi.org/10.37256/ccds.7220269481
- Contacto del autor de correspondencia: ashik@nstu.edu.bd
