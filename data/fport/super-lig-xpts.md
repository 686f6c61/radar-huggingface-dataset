# fport/super-lig-xpts

## Resumen

El modelo `fport/super-lig-xpts` es un modelo de regresión tabular basado en LightGBM desarrollado por el usuario fport. Su objetivo es predecir los puntos que un jugador de fútbol obtendrá en la próxima jornada de la TFF Fantasy Lig, el juego de fantasy football oficial de la Super Lig turca. El modelo se entrena sobre el dataset `fport/super-lig-fantasy`, que contiene estadísticas históricas de jugadores y partidos de la liga turca.

A diferencia de los modelos generativos de lenguaje, este es un modelo discriminativo clásico de machine learning: toma 62 características numéricas y categóricas (forma del jugador, posición, edad, local/visitante, forma del equipo y del rival, dificultad del calendario) y devuelve un valor continuo que representa los puntos esperados (xPts). La métrica principal no es el error absoluto, sino el coeficiente de correlación de Spearman semanal, porque en fantasy football lo importante no es acertar la puntuación exacta, sino ordenar correctamente a los jugadores para elegir al capitán.

El modelo es relevante porque aborda un problema concreto y acotado: la predicción de rendimiento fantasy en una liga específica, con un enfoque riguroso en la prevención de fugas de datos temporales. Su autor documenta explícitamente una fuga encontrada y corregida, lo que aporta transparencia sobre la metodología. Está diseñado para ser autosuficiente con el dataset publicado, de modo que cualquiera puede reproducir las predicciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LightGBM (gradient boosting sobre arboles de decision) |
| Parametros totales | no disponible (no es una red neuronal; el numero de arboles y hojas no se especifica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, no procesa secuencias) |
| Tipos de cuantizacion | no aplica (modelo tabular, no se cuantiza) |
| Idiomas soportados | no aplica (trabaja con datos numericos; la documentacion esta en turco) |
| Licencia | kaynak-sartlari (licencia personalizada, ver enlace) |
| Formato de pesos | archivo de modelo LightGBM (xpts_model.txt) |

## Arquitectura y entrenamiento

LightGBM es un framework de gradient boosting que construye arboles de decision de forma secuencial, minimizando una funcion de perdida (en este caso, regresion con error cuadratico medio). Utiliza histogramas para acelerar el entrenamiento y soporta caracteristicas categoricas de forma nativa. No se especifican los hiperparametros exactos (numero de arboles, profundidad, learning rate) ni el numero total de muestras de entrenamiento, aunque el conjunto de test tiene 20 433 filas.

El entrenamiento se realizo sobre el dataset `fport/super-lig-fantasy`, que contiene estadisticas de jugadores de la Super Lig turca. El autor aplico una division temporal (ultimo 20% como test) y tomo medidas estrictas contra la fuga de datos: todas las caracteristicas de forma se desplazaron con `shift(1)` para que cada fila solo vea informacion anterior al partido actual. Se excluyeron variables que no estarian disponibles en el momento de la alineacion fantasy (estadisticas del propio partido, alineacion inicial, formacion, entrenador).

Durante el desarrollo se detecto y corrigio una fuga de datos relacionada con el ordenamiento cronologico incorrecto de los registros (se usaba el nombre del dia en lugar de la fecha ISO). Tras la correccion, el rendimiento del modelo apenas cambio (Spearman 0.576 a 0.579), pero los baselines mejoraron notablemente, lo que indica que la ventaja real del modelo sobre los baselines es menor de lo que parecia inicialmente. Tambien se corrigio un error en el calculo de puntos por partido en la temporada.

No se menciona el uso de tecnicas como RLHF o DPO, que no aplican a este tipo de modelo.

## Capacidades

- Prediccion de puntos fantasy: genera un valor numerico (xPts) para cada jugador de la Super Lig turca en la proxima jornada.
- Ranking de jugadores: gracias a la metrica de Spearman, el modelo esta optimizado para ordenar correctamente a los jugadores por puntuacion esperada.
- Autosuficiencia: el modelo se alimenta exclusivamente de las columnas del dataset `fport/super-lig-fantasy`, sin necesidad de proveedores externos.
- Interpretabilidad limitada: al ser LightGBM, se puede extraer la importancia de caracteristicas, aunque la model card no la proporciona.
- No es generativo: no produce texto, no tiene tool calling, no soporta agentes ni razonamiento multi-paso.
- No es multilingue: trabaja con datos numericos y categoricos de una liga concreta; no procesa lenguaje natural.

## Casos de uso

- Seleccion de alineacion fantasy: el modelo puede predecir los puntos esperados de cada jugador de tu plantilla para la proxima jornada, ayudando a decidir quien juega y quien se queda en el banquillo. Es adecuado porque ordena a los jugadores por rendimiento esperado, que es exactamente lo que necesita un mánager fantasy.
- Eleccion de capitan: en la TFF Fantasy Lig, el capitan duplica puntos. Usar el ranking del modelo permite elegir al jugador con mayor xPts, maximizando la probabilidad de acertar.
- Planificacion de transferencias: comparar los xPts de jugadores de diferentes equipos ayuda a decidir que fichajes hacer cada jornada, priorizando a aquellos con mejor proyeccion a corto plazo.
- Deteccion de gangas: jugadores con bajo precio pero alto xPts relativo pueden identificarse para optimizar el presupuesto del equipo fantasy.
- Analisis de calendario: el modelo incluye la dificultad del fixture, por lo que puede usarse para planificar alineaciones en jornadas con rivales faciles o dificiles.
- Integracion en herramientas de analisis fantasy: al ser un modelo ligero y reproducible, puede integrarse en scripts de Python o en aplicaciones web para generar informes automaticos de predicciones cada jornada.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados sobre el conjunto de test (division temporal, ultimo 20% de los datos, 20 433 filas, 62 caracteristicas):

| Modelo | MAE | RMSE | Spearman semanal |
|---|---|---|---|
| Baseline: media ultimos 5 partidos | 1.868 | 2.797 | 0.518 |
| Baseline: media de la temporada | 1.827 | 2.758 | 0.516 |
| LightGBM xPts | 1.709 | 2.598 | 0.579 |

La metrica principal es el Spearman semanal, que mide la correlacion de rangos entre las predicciones y los puntos reales. El modelo supera al mejor baseline en un 12% en esta metrica. Los valores de MAE y RMSE se proporcionan como referencia, pero el autor advierte que para decisiones fantasy es mas relevante el ranking que el error absoluto.

No se han publicado resultados en otros benchmarks externos (MMLU, HumanEval, etc.) porque no aplican a un modelo tabular de regresion.

## Requisitos de hardware

- Inferencia en CPU: LightGBM es extremadamente ligero en inferencia. Un solo modelo con 62 caracteristicas puede ejecutarse en cualquier CPU moderna sin problemas, con latencias del orden de microsegundos por prediccion.
- Memoria: el archivo del modelo (`xpts_model.txt`) tiene un tamano reducido (no especificado, pero tipicamente menos de 10 MB para un modelo de este tipo).
- GPU: no necesaria. El modelo no aprovecha aceleracion por GPU en inferencia.
- Despliegue: se puede usar directamente con la libreria LightGBM en Python, o exportar a formato ONNX para integrarlo en otros entornos. Tambien es posible servirlo como una funcion lambda o en un contenedor Docker.
- Entrenamiento: tampoco requiere GPU; el entrenamiento se puede realizar en CPU en cuestion de minutos u horas, dependiendo del volumen de datos.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos publicados especificamente para prediccion de puntos fantasy en la Super Lig turca. La comparacion mas relevante es contra los baselines internos del propio autor:

| Modelo | MAE | RMSE | Spearman semanal | Licencia |
|---|---|---|---|---|
| Media ultimos 5 partidos | 1.868 | 2.797 | 0.518 | - |
| Media de la temporada | 1.827 | 2.758 | 0.516 | - |
| LightGBM xPts | 1.709 | 2.598 | 0.579 | kaynak-sartlari |

En el ambito de modelos de prediccion fantasy para otras ligas (por ejemplo, la Premier League), existen modelos similares basados en LightGBM o XGBoost, pero no se han encontrado comparaciones publicas con este modelo concreto. No se dispone de datos adicionales para una comparativa externa.

## Limitaciones y advertencias

- Sin informacion de lesiones o sanciones: el modelo no sabe si un jugador esta disponible para el proximo partido; solo infiere su disponibilidad a partir de la forma pasada.
- Debil al inicio de temporada: las predicciones dependen de la forma historica, por lo que en las primeras jornadas (hasta la 8-10) el modelo no tiene suficiente informacion y su rendimiento es inferior.
- Etiqueta de entrenamiento no validada: los puntos fantasy se calcularon a partir de las reglas publicadas del juego, pero no se compararon con los puntos oficiales reales. Si hay errores en la codificacion de las reglas, el modelo los habra aprendido.
- Problemas con jugadores recien transferidos: un jugador que cambia de equipo no tiene historial de forma con su nuevo club, por lo que las predicciones para sus primeros partidos son poco fiables.
- Licencia personalizada: la licencia `kaynak-sartlari` no es una licencia estandar de codigo abierto; es necesario revisar el texto completo en el enlace proporcionado antes de usar el modelo en proyectos comerciales.
- No es consejo de apuestas: el autor advierte explicitamente que el modelo no debe utilizarse para tomar decisiones de apuestas deportivas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fport/super-lig-xpts
- Dataset utilizado: https://huggingface.co/datasets/fport/super-lig-fantasy
- Licencia del dataset: https://huggingface.co/datasets/fport/super-lig-fantasy/blob/main/LICENSE
