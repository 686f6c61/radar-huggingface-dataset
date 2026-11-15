# Noor-Khan/pokemon-legendary-prediction

## Resumen

`pokemon-legendary-prediction` es un clasificador binario basado en Random Forest desarrollado por Noorullah Zamindar (usuario Noor-Khan en Hugging Face) que predice si un Pokémon es legendario o no a partir de sus estadísticas base, generación, tipo, color, tamaño, tasa de captura y otras propiedades. Se trata de un proyecto de aprendizaje y portfolio, no de un modelo de lenguaje ni de una red neuronal profunda: es un pipeline de scikit-learn con 36 características de entrada.

El modelo resuelve una tarea de clasificación tabular muy acotada sobre el conjunto de datos "Pokemon Data.csv" de Kaggle (721 Pokémon de las generaciones 1 a 6, de los cuales solo 46 son legendarios). Su relevancia es, por tanto, limitada al ámbito educativo y de demostración: ilustra un flujo completo de ingeniería de características, entrenamiento con Random Forest y despliegue mediante una aplicación Flask.

No dispone de arquitectura transformer, ni parámetros en el sentido habitual de los modelos generativos, ni ventana de contexto. La ficha se adapta a la naturaleza real del artefacto (clasificador tabular) manteniendo la estructura solicitada y marcando como "no disponible" todo aquello que no aplica o no se ha publicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Random Forest (scikit-learn `RandomForestClassifier`) |
| Parámetros totales | no disponible (500 estimadores de árboles de decisión; no se reporta el número de nodos ni parámetros) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación tabular; entrada de una fila con 36 características) |
| Tipos de cuantización | no aplica (modelo tabular serializado en pickle) |
| Idiomas soportados | no disponible (no procesa texto; las etiquetas de salida son Legendary / Not Legendary) |
| Licencia | MIT |
| Formato de pesos | pickle (`.pkl` / `.pickle`), entrenado con scikit-learn 1.6.1 |

## Arquitectura y entrenamiento

El modelo es un `RandomForestClassifier(n_estimators=500, random_state=42)` de scikit-learn ajustado sobre 36 características tabulares. Las características incluyen las seis estadísticas base (`HP`, `Attack`, `Defense`, `Sp_Atk`, `Sp_Def`, `Speed`) y su suma (`Total`), la generación, indicadores de género y megaevolución, altura, peso, tasa de captura, codificación de frecuencia del estilo corporal (`Body_Style_new`), y codificaciones one-hot de tipo (11 grupos tras fusionar tipos) y color (10 columnas). Las variables `Type_2` y `Egg_Group_2` se descartan por exceso de valores nulos; `Pr_Male` se imputa con 0.5.

Los datos de entrenamiento proceden del conjunto "Pokemon Data.csv" de Kaggle (alopez247/pokemon): 721 Pokémon de las generaciones 1 a 6 con 23 columnas, de los cuales 46 son legendarios. La partición train/test es 80/20 (576/145) con `random_state=42` y sin estratificar. No hay RLHF, DPO ni ajuste fino generativo: es un ajuste supervisado clásico. El autor verificó que el pipeline reproduce exactamente las predicciones del `pokemon_model.pickle` original sobre las 145 filas de test (concordancia 1.0000).

## Capacidades

- Clasificación binaria tabular: devuelve la etiqueta Legendary / Not Legendary y la probabilidad de ser legendario vía `predict_proba(X)[:, 1]`.
- Ingeniería de características documentada y reproducible mediante `train.py`.
- Interpretabilidad mediante importancias de características (las principales: `Total` 0.251, `Catch_Rate` 0.230, `hasGender` 0.098, `Sp_Atk` 0.058, `Weight_kg` 0.053, `Height_m` 0.050).
- Integración con una aplicación web Flask (formulario de entrada y panel de importancias) en el repositorio de código fuente.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.

## Casos de uso

- Demostración educativa de un pipeline de machine learning tabular: sirve para ilustrar de extremo a extremo la limpieza de datos, la codificación de variables categóricas, el ajuste de un Random Forest y la evaluación con validación cruzada en un curso o tutorial.
- Portfolio de ciencia de datos: el modelo y su aplicación Flask asociada permiten mostrar a un reclutador un flujo completo desde el CSV hasta una interfaz web de predicción.
- Clasificación rápida de Pokémon de las generaciones 1 a 6 en herramientas fan o wikis: dado un conjunto de atributos, devuelve la probabilidad de ser legendario, útil para etiquetado asistido dentro de ese rango de generaciones.
- Análisis de importancia de características en el diseño de videojuegos: el panel de importancias muestra qué atributos (total de estadísticas y tasa de captura) discriminan mejor entre legendarios y no legendarios, útil como ejercicio de análisis exploratorio.
- Prueba de integración de modelos scikit-learn en servicios web: el ejemplo Flask sirve como plantilla mínima para desplegar un clasificador tabular serializado en pickle detrás de un formulario HTML.
- Verificación de reproducibilidad de experimentos: el script `train.py` y las métricas en `metrics.json` permiten comprobar que un pipeline de scikit-learn reproduce resultados con una semilla fija, como caso de estudio de buenas prácticas de reproducibilidad.
- Docencia sobre limitaciones de métricas: con solo 8 legendarios en el test, el caso ilustra por qué una accuracy del 100 % en una única partición debe contrastarse con validación cruzada (media 0.9903, F1 de la clase legendaria 0.9292).

## Benchmarks y rendimiento

Resultados medidos en la partición de test de 145 Pokémon (137 no legendarios, 8 legendarios):

| Métrica | Valor |
|---|---|
| Accuracy (test, `random_state=42`) | 1.0000 (145/145) |
| ROC-AUC (clase Legendary) | 1.0000 |
| Precisión (Legendary) | 1.0000 |
| Recall (Legendary) | 1.0000 |
| F1 (Legendary) | 1.0000 |
| Matriz de confusión (filas = real, columnas = predicho; orden Not Legendary, Legendary) | [[137, 0], [0, 8]] |
| Validación cruzada 5-fold, accuracy media | 0.9903 (folds 1.0000, 0.9861, 0.9861, 1.0000, 0.9792; std 0.0083) |
| Validación cruzada 5-fold, F1 medio (Legendary) | 0.9292 |

No se han publicado comparaciones con otros modelos en la información disponible. El autor advierte que la puntuación perfecta en una única partición debe leerse junto a los resultados de validación cruzada, dado el reducido número de legendarios en test.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo es un Random Forest serializado en pickle y se ejecuta en CPU.
- GPU recomendadas: no aplica; no requiere GPU.
- Cabe en cualquier equipo consumer: el repositorio ocupa 0.0 GB y el modelo se carga con `pickle.load` en memoria RAM convencional.
- Opciones de despliegue: Python con scikit-learn 1.6.1 (versión con la que se entrenó), aplicación Flask del repositorio de código fuente, o cualquier servicio que cargue el pickle y exponga `predict` / `predict_proba`.
- Latencia y throughput: no disponibles en la información proporcionada; para un Random Forest de 500 árboles sobre 36 características, la inferencia por fila es del orden de milisegundos en CPU, aunque no se ha publicado una medición concreta.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia cualitativa, alternativas de la misma categoría serían otros clasificadores tabulares de scikit-learn (regresión logística, gradient boosting, XGBoost) sobre el mismo conjunto de datos, pero no se han publicado resultados de dichos modelos en la información disponible para establecer una comparación numérica.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pokemon-legendary-prediction | no disponible (Random Forest, 500 árboles) | no aplica | accuracy test 1.0000; CV 0.9903 | MIT | Hugging Face y GitHub |
| Alternativas tabulares (p. ej. XGBoost, regresión logística) | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Conjunto de datos muy pequeño y casi separable: 721 Pokémon de las generaciones 1 a 6 y solo 46 legendarios; el modelo no conoce Pokémon de las generaciones 7 a 9, formas regionales ni mecánicas posteriores.
- `Total` (suma de estadísticas base) y `Catch_Rate` concentran la mayor parte de la importancia, de modo que el modelo aprende principalmente la regla de diseño del juego (legendarios con totales altos y tasas de captura bajas) más que patrones sutiles.
- La fusión de tipos pierde información: Ice, Ghost, Fairy y otros tipos se agrupan en categorías más amplias, lo que reduce la granularidad de la señal.
- Riesgo de sobreajuste aparente: la accuracy del 100 % en test se basa en solo 8 legendarios; la validación cruzada (0.9903 de accuracy media, 0.9292 de F1) es la referencia más fiable.
- No es una autoridad sobre datos de juego: es una demostración de portfolio y no debe usarse como fuente canónica de clasificación de Pokémon.
- Licencia MIT: permite uso comercial y modificación con atribución, pero el conjunto de datos de origen (Kaggle) puede tener sus propias condiciones que conviene revisar.
- No procesa texto ni imágenes; cualquier caso de uso que requiera entrada no tabular queda fuera de su alcance.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Noor-Khan/pokemon-legendary-prediction
- Código fuente y aplicación Flask: https://github.com/NoorullahZamindar-007/Pok-mon-Legendary-Prediction-Web-Application
- Conjunto de datos original en Kaggle: https://www.kaggle.com/datasets/alopez247/pokemon
- Mirror del conjunto de datos utilizado para la reproducción: `olferuk/MLSummerSchool/data/Pokemon/pokemon_full.csv`
