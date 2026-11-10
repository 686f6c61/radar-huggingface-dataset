# caueeb/titanic-survival-logistic-regression

## Resumen

`caueeb/titanic-survival-logistic-regression` es un pipeline de clasificación binaria sobre datos tabulares implementado con scikit-learn y serializado en formato joblib. Lo publica el usuario caueeb en Hugging Face como proyecto educativo y banco de pruebas para la competición Kaggle "Titanic - Machine Learning from Disaster". No es un modelo de lenguaje ni una red neuronal: es una regresión logística con preprocesado integrado que predice si un pasajero sobrevivió (`1`) o no (`0`) a partir de once características derivadas de los datos originales del pasajero.

El artefacto resuelve un problema muy acotado: demostrar un flujo completo de ingeniería de características, imputación, escalado, codificación one-hot y clasificación sobre un conjunto de solo 891 filas etiquetadas. Su relevancia es didáctica y de referencia para comparativas de competición, no de producción. El autor lo declara explícitamente fuera de alcance para decisiones reales de seguridad, viajes o seguros.

El repositorio tiene un tamaño de 0,0 GB (solo contiene el artefacto joblib y el código de inferencia), sin descargas registradas y con un único "like" en el momento de la consulta. La licencia y los idiomas no están declarados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica (scikit-learn) con pipeline de preprocesado: imputacion, escalado numerico, one-hot encoding y clasificador |
| Parametros totales | no disponible (modelo lineal; el numero de coeficientes depende de las 11 caracteristicas tras one-hot encoding) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular de 11 caracteristicas, no secuencial) |
| Tipos de cuantizacion | no disponible (artefacto joblib con float64 de scikit-learn; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto libre; solo campos categoricos del dataset Titanic) |
| Licencia | no disponible |
| Formato de pesos | joblib (`logistic_regression_titanic.joblib`) |

## Arquitectura y entrenamiento

La arquitectura es un `Pipeline` de scikit-learn que encadena cuatro etapas: imputación de valores ausentes, escalado de variables numéricas, codificación one-hot de variables categóricas y una regresión logística como clasificador final. La ingeniería de características deriva `FamilySize` (`SibSp + Parch + 1`), `IsAlone` (si `FamilySize` es 1), `HasCabin` (presencia de valor en cabina) y `Title` (título extraído del nombre y agrupado en categorías comunes). El conjunto de entrada final son 11 características del modelo.

El entrenamiento usa las 891 filas etiquetadas del split de entrenamiento de la competición Kaggle Titanic. El autor comparó regresión logística, Random Forest, Extra Trees y SVM mediante validación cruzada estratificada de 5 particiones sobre la partición de desarrollo, y seleccionó la regresión logística por su F1-score y rendimiento global. El pipeline final se reajustó sobre las 891 filas antes de generar predicciones para las 418 filas de test de la competición. No se documentan técnicas de aumento de datos, regularización específica, búsqueda de hiperparámetros ni calibración probabilística más allá de lo que implica el pipeline estándar.

## Capacidades

- Clasificación binaria tabular: predice supervivencia (`1`) o no supervivencia (`0`) a partir de atributos del pasajero.
- Salida probabilística: el script de inferencia imprime la clase predicha y la probabilidad estimada de supervivencia por pasajero.
- Ingeniería de características integrada: deriva `FamilySize`, `IsAlone`, `HasCabin` y `Title` a partir de columnas originales (`Pclass`, `Sex`, `Age`, `SibSp`, `Parch`, `Fare`, `Embarked`, `Name`, `Cabin`).
- Manejo de valores ausentes mediante imputación dentro del pipeline.
- Codificación one-hot de variables categóricas y escalado de numéricas.
- Inferencia por lotes vía CLI (`python inference.py --input sample_input.json --model ...`) o por API Python (`predict_passengers`).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.

## Casos de uso

- Docencia de pipelines de scikit-learn: sirve como ejemplo completo y reproducible de imputación, escalado, one-hot encoding y clasificación en un único artefacto joblib, útil en cursos introductorios de machine learning.
- Banco de pruebas para comparativas de algoritmos: el autor ya comparó regresión logística, Random Forest, Extra Trees y SVM con validación cruzada de 5 particiones; el repositorio permite reproducir y ampliar esa comparativa.
- Referencia de competición Kaggle: con un score de 0,77033 en el leaderboard, sirve como línea base para participantes que quieran medir mejoras sobre un pipeline sencillo.
- Validación de flujos de inferencia por lotes: el script `inference.py` acepta JSON de entrada y devuelve predicciones y probabilidades, útil para probar integraciones de serving tabular con artefactos joblib.
- Demostración de ingeniería de características: el código muestra cómo derivar variables (`FamilySize`, `IsAlone`, `HasCabin`, `Title`) a partir de columnas crudas, patrón reutilizable en otros problemas tabulares.
- Ejercicio de análisis de sesgo histórico: el propio autor advierte que los patrones demográficos y socioeconómicos del dataset pueden afectar las predicciones, lo que lo convierte en un caso de estudio sobre sesgos en datos históricos.

## Benchmarks y rendimiento

| Evaluacion | Resultado |
|---|---:|
| Exactitud en holdout estratificado local (179 pasajeros) | 83,24 % |
| Exactitud media en validacion cruzada de 5 particiones (particion de desarrollo) | 82,59 % |
| F1-score medio en validacion cruzada de 5 particiones (particion de desarrollo) | 77,28 % |
| Score en el leaderboard de Kaggle | 0,77033 |

El autor advierte que el score de Kaggle corresponde al split de test oculto de la competición y no es directamente comparable con el holdout local. No se publican resultados de MMLU, HumanEval, GSM8K ni benchmarks de modelos de lenguaje, ya que no aplican a este artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo es una regresión logística sobre 11 características y se ejecuta en CPU sin GPU.
- GPU recomendadas: ninguna; no requiere aceleración por hardware.
- Cabe en cualquier equipo consumer: el artefacto joblib ocupa una fracción de megabyte y el repositorio completo 0,0 GB.
- Opciones de despliegue: ejecución directa con Python y scikit-learn (`pip install -r requirements.txt`), script CLI `inference.py` o llamada a `predict_passengers` desde código Python. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza del modelo (inferencia lineal sobre 11 características) se espera un coste despreciable por muestra, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Algoritmo | Filas de entrenamiento | Caracteristicas | Score reportado | Licencia |
|---|---|---:|---:|---|---|
| caueeb/titanic-survival-logistic-regression | Regresion logistica (scikit-learn) | 891 | 11 | 0,77033 (Kaggle) | no disponible |
| Alternativas del mismo autor (Random Forest, Extra Trees, SVM) | Ensemble / SVM | 891 | 11 | no disponible (descartadas por F1 inferior) | no disponible |
| Otros modelos publicos de la competicion Titanic | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con los algoritmos evaluados internamente por el autor (Random Forest, Extra Trees y SVM), de los que no se publican métricas individuales. No se dispone de datos de otros artefactos públicos comparables en la búsqueda realizada.

## Limitaciones y advertencias

- El dataset es muy pequeño (891 filas etiquetadas) y refleja una población y circunstancias históricas muy específicas del hundimiento del Titanic; la generalización fuera de ese contexto es nula.
- Las asociaciones aprendidas no deben interpretarse como relaciones causales, según advierte el propio autor.
- Los patrones demográficos y socioeconómicos históricos del dataset pueden introducir sesgos en las predicciones.
- El score de Kaggle (0,77033) es específico del split de test oculto de la competición y puede variar con otros datos.
- El artefacto joblib debe cargarse con versiones compatibles de scikit-learn; cargar ficheros joblib o pickle de fuentes no confiables es un riesgo de seguridad.
- Uso previsto exclusivamente educativo y de demostración; el autor prohíbe explícitamente su uso para decisiones reales sobre seguridad o resultados de personas.
- La licencia no está declarada, por lo que no se puede confirmar el régimen de uso comercial.
- No procesa texto libre ni secuencias; no es un modelo de lenguaje y no admite prompts ni contexto conversacional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/caueeb/titanic-survival-logistic-regression
- Repositorio GitHub del proyecto: https://github.com/caueeeb/kaggle-titanic
- Competición Kaggle Titanic: https://www.kaggle.com/competitions/titanic
