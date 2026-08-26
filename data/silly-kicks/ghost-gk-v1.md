# silly-kicks/ghost-gk-v1

## Resumen

Ghost-GK v1 es un modelo de estimación de densidad condicional desarrollado por el equipo de silly-kicks, una librería de análisis de fútbol de código abierto. Su función es predecir dónde se posicionaría un portero promedio de liga (el "portero fantasma") dado el estado actual del juego, a partir de datos de tracking. Resuelve un problema previo a las métricas tradicionales de porteros (xGOT, porcentaje de paradas, goles evitados), que solo miden lo que ocurre después del disparo: cuantifica la posición como elemento disuasorio antes de que se produzca el tiro.

El modelo implementa RFCDE (Random Forest Conditional Density Estimation) adaptado al posicionamiento de porteros, combinando asignaciones de hojas de un HistGradientBoostingRegressor con una estimación de densidad kernel 2D ponderada. En lugar de devolver un punto (x, y), genera una cuadrícula de probabilidad de 60×64 celdas (3.840 celdas a resolución de 0,5 m), lo que permite capturar distribuciones multimodales (por ejemplo, dividirse entre palo cercano y centro cuando el balón está en banda). Está disponible en dos variantes: `default` (~1,0 MB, submuestra de 36.000 frames) y `full` (~2,4 MB, corpus de 179 partidos), ambas distribuidas como artefactos de solo parámetros sin datos de entrenamiento por muestra.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RFCDE (Random Forest Conditional Density Estimation) sobre HistGradientBoostingRegressor con KDE 2D ponderado |
| Parametros totales | No disponible (artefacto de ~1,0 MB en variante `default` y ~2,4 MB en `full`; dos ensembles de 500 árboles con profundidad máxima 8) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | No aplica (no es un modelo de red neuronal con pesos cuantizables) |
| Idiomas soportados | No aplica (modelo numerico; metadatos en ingles) |
| Licencia | MIT |
| Formato de pesos | npz (arrays NumPy) + JSON (metadatos) + sidecar SHA-256; sin pickle |

## Arquitectura y entrenamiento

El modelo implementa RFCDE según Pospisil y Lee (2018), adaptado al posicionamiento de porteros. El flujo es el siguiente: primero se extraen 26 características por frame relativas a la portería (estado del balón, geometría defensiva, geometría ofensiva y contexto de juego). La fase (`phase`) se entrena numéricamente, no como categoría, para que el recorrido de árboles sin pickle coincida exactamente con sklearn. Un `HistGradientBoostingRegressor` de 500 árboles con profundidad máxima 8 se entrena sobre la coordenada x del portero; las asignaciones de hojas resultantes particionan el espacio de características. Los frames de entrenamiento que comparten asignación de hoja con el frame de consulta reciben mayor peso (enfoque de "NFL Ghosts" de Dutta et al., 2024). Sobre las posiciones (x, y) ponderadas de esos frames se aplica un KDE gaussiano 2D para producir la superficie de densidad. Este paso requiere las posiciones de entrenamiento por muestra, por lo que solo está disponible en un modelo ajustado localmente; el artefacto distribuido es solo de parámetros. Para el punto estimado servido (`ghost_gk_x/y`), un segundo `HistGradientBoostingRegressor` se entrena sobre la coordenada y, y la media potenciada de ambos ensembles se reconstruye sin pickle como `baseline + Σ_trees leaf_value`, sin usar sklearn en inferencia.

El entrenamiento se realizó con datos de tracking licenciados de tres proveedores: Sportec (DFL) para la Bundesliga con identificación nativa de porteros, SkillCorner para múltiples ligas con identificación derivada (ADR-007), y Gradient Sports para la FIFA World Cup 2022 como fuente de nivel propietario. La variante `full` se entrenó con 179 partidos (~1,04 millones de frames) combinando los tres proveedores; la variante `default` usa una submuestra de 36.000 frames. Los datos brutos de tracking no se redistribuyen; solo se distribuyen los pesos del modelo entrenado.

## Capacidades

- Estimación de densidad condicional 2D: genera una cuadrícula de probabilidad de 60×64 celdas (resolución 0,5 m) sobre la región relativa a la portería, no un punto único.
- Captura de posicionamiento multimodal: puede representar distribuciones con varios modos (por ejemplo, cerca del palo y central simultáneamente).
- Inferencia vectorizada: el recorrido de árboles usa operaciones NumPy, sin sklearn en tiempo de inferencia; el procesamiento por lotes de 1.000 frames se completa en menos de 1 segundo.
- Punto estimado servido: proporciona `ghost_gk_x/y` como la media potenciada exacta de dos ensembles de boosting, reconstruida sin pickle.
- Dos variantes de artefacto: `default` incluida en el paquete pip de silly-kicks y `full` descargable desde Hugging Face bajo demanda.
- Integración con métricas downstream: alimenta el GK Deterrent Value (GKDV), que compara la posición real del portero con la posición fantasma para cuantificar el efecto disuasorio.
- Sin dependencia de pickle: serialización en npz + JSON con verificación de integridad SHA-256, lo que facilita auditorías y despliegue seguro.

## Casos de uso

- Evaluación de porteros en análisis de rendimiento: un analista de un club puede comparar la posición real de su portero con la posición fantasma en cada frame para identificar desviaciones sistemáticas (por ejemplo, portero demasiado adelantado o pegado a la línea) y ajustar el entrenamiento posicional.
- Scouting de porteros: los ojeadores pueden usar el GKDV derivado de Ghost-GK para valorar a porteros de otras ligas sin depender solo de métricas post-disparo, cuantificando su posicionamiento preventivo.
- Análisis táctico de equipos rivales: un cuerpo técnico puede estudiar cómo se posiciona el portero rival ante diferentes estados de juego (balón en banda, presión alta, contraataque) y diseñar estrategias de tiro que exploten sus debilidades posicionales.
- Investigación académica en ciencia del deporte: investigadores pueden utilizar el modelo como referencia de "portero promedio de liga" para estudiar la evolución del posicionamiento de porteros a lo largo de temporadas o comparar ligas.
- Desarrollo de métricas avanzadas en librerías de análisis: integración en pipelines de silly-kicks o librerías similares para enriquecer modelos de valoración de acciones (VAEP, xT) con una componente posicional del portero.
- Generación de informes automáticos para medios y broadcasters: productores de contenido pueden generar visualizaciones de "dónde debería estar el portero" en repeticiones de goles, añadiendo contexto analítico a las retransmisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no reporta métricas tipo MMLU, HumanEval o GSM8K, al tratarse de un modelo de regresión tabular especializado. La model card indica que la inferencia por lotes de 1.000 frames se completa en menos de 1 segundo, pero no se proporcionan comparativas cuantitativas con otros modelos de posicionamiento de porteros.

## Requisitos de hardware

- El modelo es extremadamente ligero: la variante `default` ocupa ~1,0 MB y la `full` ~2,4 MB en disco.
- Inferencia en CPU sin GPU: el recorrido de árboles usa operaciones NumPy, por lo que cualquier CPU moderna es suficiente.
- Memoria RAM: menos de 100 MB para cargar los artefactos y ejecutar inferencia por lotes.
- No requiere GPU dedicada; puede ejecutarse en instancias cloud de bajo coste o en portátiles de analistas.
- Opciones de despliegue: integración directa en Python con la librería silly-kicks (pip install silly-kicks[ghost-gk]); no requiere servidores de inferencia especializados como vLLM u Ollama.
- Latencia: el procesamiento de 1.000 frames en menos de 1 segundo implica una latencia por frame inferior a 1 ms en hardware moderno.

## Comparativa con modelos similares

No disponible. No se han identificado modelos públicos comparables que realicen estimación de densidad condicional para posicionamiento de porteros en fútbol. Las métricas tradicionales (xGOT, goles evitados) no son modelos de posicionamiento, sino evaluaciones post-disparo. El enfoque de "ghosting" se inspira en el trabajo de Dutta et al. (2024) para la NFL, pero no existe un equivalente directo en el ecosistema de fútbol de código abierto.

## Limitaciones y advertencias

- El modelo predice la posición de un portero promedio de liga, no la posición óptima; no tiene en cuenta las características individuales del portero (estatura, envergadura, estilo de juego).
- La variante `default` se entrena con una submuestra de 36.000 frames, lo que puede limitar su representatividad frente a la variante `full` (179 partidos).
- La salida de densidad (`predict_density`) solo está disponible en un modelo ajustado localmente; el artefacto distribuido no incluye las posiciones de entrenamiento necesarias para el KDE.
- Los datos de entrenamiento provienen de ligas específicas (Bundesliga, múltiples ligas de SkillCorner, FIFA World Cup 2022); el modelo puede no generalizar bien a competiciones con estilos de juego muy diferentes.
- No se redistribuyen los datos brutos de tracking; solo los pesos del modelo, lo que limita la reproducibilidad completa del entrenamiento.
- El modelo no es un LLM ni un sistema de lenguaje; no procesa texto ni mantiene conversaciones.
- Aunque la licencia es MIT, los datos de entrenamiento subyacentes tienen licencias de terceros (Sportec, SkillCorner, Gradient Sports) que pueden imponer restricciones de uso comercial sobre los resultados derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/silly-kicks/ghost-gk-v1
- Organización silly-kicks en Hugging Face: https://huggingface.co/silly-kicks
- Repositorio GitHub: https://github.com/karsten-s-nielsen/silly-kicks
- Paquete en PyPI: https://pypi.org/project/silly-kicks/
- Página del paquete en Libraries.io: https://libraries.io/pypi/silly-kicks
- Referencia RFCDE (Pospisil y Lee 2018): arxiv:1804.05753
- Referencia NFL Ghosts (Dutta et al. 2024): arxiv:2406.17220
