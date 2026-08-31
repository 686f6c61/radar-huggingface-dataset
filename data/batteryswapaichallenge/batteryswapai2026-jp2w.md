# batteryswapaichallenge/BatterySwapAI2026-JP2W

## Resumen

BatterySwapAI2026-JP2W es un modelo de supervivencia (survival analysis) diseñado para predecir la vida útil restante (Remaining Useful Life, RUL) de baterías en sensores IoT de monitorización de edificios, y para generar planes de trabajo de reemplazo optimizados. Fue desarrollado como candidato para el desafío BatterySwapAI 2026 organizado por NORA (Norwegian Artificial Intelligence Consortium) con datos de Soundsensing. El modelo combina un ensemble de gradient boosting multi-horizonte con un forecaster de curva de descarga basado en física, y un planificador que minimiza penalizaciones por reemplazo temprano o tardío junto con costes de rutas y horas extra.

A diferencia de los modelos de lenguaje, este es un sistema de ML clásico para series temporales y optimización combinatoria. Su relevancia radica en abordar un problema industrial real: decidir cuándo y en qué orden reemplazar baterías en una flota distribuida geográficamente, reduciendo costes operativos y tiempo de inactividad. El código se publica bajo licencia MIT, lo que permite su reutilización y adaptación. El repositorio contiene artefactos entrenados en formato joblib (scikit-learn) y un pipeline reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de HistGradientBoostingClassifier (scikit-learn) multi-horizonte + forecaster de curva de descarga basado en física (modelo poblacional dU/dt = r(U) con multiplicador por dispositivo) + blend en espacio logit |
| Parametros totales | no disponible (modelo clásico, no se reporta número de parámetros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (ventana temporal fija: datos hasta el tiempo de corte T) |
| Tipos de cuantizacion | no aplica (modelo en punto flotante estándar) |
| Idiomas soportados | no aplica (modelo numérico, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | joblib (artefactos: survival_model.joblib, physics_prior.joblib, meta.json) |

## Arquitectura y entrenamiento

El sistema se compone de tres módulos principales. Primero, un módulo de reproducción de etiquetas que agrega series horarias por dispositivo y día, replicando exactamente el criterio oficial de fin de vida (voltaje suavizado < 2.40 V; verificado en 461/461 dispositivos de entrenamiento). Segundo, dos modelos de RUL complementarios: (a) un ensemble de gradient boosting de supervivencia multi-horizonte que toma características por dispositivo en el tiempo de corte T (niveles y pendientes de voltaje suavizado, estadísticas de voltaje crudo, temperatura y estacionalidad, sensibilidad térmica, historial de edad y reemplazos) y produce P(EOL ≤ T + h) para una rejilla de horizontes; (b) un forecaster de curva de descarga basado en física que modela la compensación de temperatura y la tasa de descarga poblacional, generando una segunda CDF de supervivencia. Ambos se combinan en espacio logit con pesos calibrados mediante validación cruzada agrupada por edificio (6-fold). El tercer módulo es un planificador que calcula penalizaciones esperadas por reemplazo temprano/tardío y ejecuta una búsqueda local multi-start sobre asignaciones de días de intercambio, minimizando penalizaciones más costes exactos de rutas, horas extra y límites diarios/semanales.

El entrenamiento es determinista (semillas fijas, gradient boosting histograma de un solo hilo) y utiliza exclusivamente el dataset oficial del desafío, sin datos externos ni modelos preentrenados. El tiempo de entrenamiento es de aproximadamente 10 minutos en 16 núcleos. Se incluye un guard de soporte causal: si un dispositivo no reporta observaciones durante al menos 14 días, su CDF se pone a cero antes de replanificar, evitando extrapolar hacia dispositivos silenciosos.

## Capacidades

- Predicción de vida útil restante (RUL) con múltiples horizontes temporales, expresada como probabilidad de fallo acumulada.
- Manejo de series temporales de voltaje, temperatura y estacionalidad, con modelado explícito de la sensibilidad térmica de las baterías.
- Generación de planes de trabajo de reemplazo optimizados, considerando penalizaciones por reemplazo temprano o tardío, costes de desplazamiento, horas extra y límites de capacidad diaria y semanal.
- Soporte para restricciones operativas reales: ventanas de trabajo, viajes de retorno a base, visitas de emergencia y dispositivos con datos incompletos.
- Reproducción exacta del criterio oficial de fin de vida del desafío, lo que garantiza consistencia con la evaluación.
- Inferencia ligera y rápida, adecuada para ejecución en CPU sin GPU.

## Casos de uso

- Mantenimiento predictivo de flotas de sensores IoT: el modelo estima la probabilidad de que cada batería falle en los próximos días o semanas, permitiendo programar reemplazos antes de que ocurra una interrupción del servicio.
- Optimización de rutas de técnicos de campo: el planificador integra las predicciones de RUL con costes de desplazamiento y horas extra, generando rutas eficientes que minimizan el tiempo de inactividad total de la flota.
- Reducción de costes operativos en edificios comerciales: al evitar reemplazos prematuros y fallos inesperados, se reduce el número de visitas y el coste de mano de obra, como se demuestra en la validación cruzada (coste OOF de 1416 h/scenario frente a ~1800 h de un GBM simple).
- Planificación de reemplazos con restricciones de capacidad: el modelo respeta límites diarios y semanales de intervenciones, así como la disponibilidad de técnicos, lo que lo hace útil para empresas de servicios de monitorización.
- Gestión de flotas heterogéneas: el modelo maneja dispositivos con diferentes historiales de uso, temperaturas ambientales y patrones de descarga, adaptando las predicciones a cada caso.
- Simulación de escenarios "qué pasaría si": al ser un modelo entrenado con datos históricos, puede usarse para evaluar el impacto de diferentes políticas de mantenimiento (por ejemplo, reemplazo preventivo vs. correctivo) antes de implementarlas en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque no es un modelo de lenguaje. El rendimiento se evalúa mediante el coste del planificador en la validación cruzada del desafío:

| Métrica | Valor |
|---|---|
| Coste OOF del planificador (ensemble completo) | 1416 h/scenario |
| Coste OOF de un único GBM | ~1800 h/scenario |
| Coste OOF del oráculo (límite inferior teórico) | ~101 h/scenario |

Estos valores provienen de la validación cruzada agrupada por edificio (6-fold) sobre el split de entrenamiento, reportados en la model card. No se dispone de resultados en el split de test público.

## Requisitos de hardware

- Entrenamiento: CPU con al menos 16 núcleos, ~10 minutos de tiempo de cómputo. No requiere GPU.
- Inferencia: muy ligera, ejecutable en cualquier CPU moderna (incluso en un solo núcleo). El modelo es un conjunto de histogram gradient boosting y un forecaster físico, con artefactos de tamaño pequeño (joblib).
- Memoria RAM: no se especifica, pero por la naturaleza del modelo (scikit-learn) se estima inferior a 1 GB para cargar los artefactos.
- Despliegue: se puede integrar en pipelines Python con scikit-learn 1.7.2. No requiere frameworks especializados como vLLM u Ollama.
- Latencia: no se reporta, pero al ser un modelo tabular con pocas características, la inferencia por dispositivo es del orden de milisegundos.

## Comparativa con modelos similares

| Modelo | Enfoque | RUL | Planificador | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BatterySwapAI2026-JP2W (este) | Ensemble GBM + física + blend logit | Multi-horizonte probabilístico | Búsqueda local multi-start con costes exactos | MIT | HuggingFace |
| ZRPATeam/BatterySwapAI-2026 | LightGBM con calibración por tipo de edificio e intervalos de confianza al 90% | Punto estimado con intervalos | OR-Tools VRP para rutas | no especificada | GitHub |
| BatterySwapAI2026-Example (oficial) | Modelo de ejemplo del desafío | no disponible | no disponible | no disponible | HuggingFace |

La comparativa se basa en la información pública de los repositorios. El modelo de ZRPATeam utiliza LightGBM y OR-Tools, mientras que el presente modelo combina GBM con un componente físico y un planificador propio. No hay datos de rendimiento comparables publicados entre ambos.

## Limitaciones y advertencias

- Modelo específico de dominio: está entrenado exclusivamente para baterías de sensores IoT en edificios noruegos con las características del dataset de Soundsensing. No es generalizable a otros tipos de baterías o entornos sin reentrenamiento.
- Dependencia de la calidad de los datos: las predicciones asumen que las series temporales de voltaje y temperatura son fiables y continuas. El guard de soporte causal (14 días sin datos) mitiga parcialmente este riesgo, pero no elimina el impacto de datos corruptos o faltantes.
- Sesgo de calibración: el blend y las calibraciones se ajustaron con validación cruzada sobre el split de entrenamiento; en datos nuevos con distribuciones diferentes, el rendimiento puede degradarse.
- Sin capacidad de lenguaje: no procesa texto ni interacciones conversacionales; es un modelo puramente numérico.
- Coste del oráculo: el límite inferior teórico (101 h/scenario) indica que hay margen de mejora; el modelo actual está lejos de ese óptimo.
- Restricciones de licencia: aunque la licencia MIT permite uso comercial, el dataset original del desafío puede tener sus propios términos de uso que deben verificarse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/batteryswapaichallenge/BatterySwapAI2026-JP2W
- Organización del desafío en HuggingFace: https://huggingface.co/batteryswapaichallenge
- Página oficial del desafío (NORA): https://www.nora.ai/competitions/batteryswapai/batteryswapai2026.html
- FAQ del desafío: https://www.nora.ai/competitions/batteryswapai/batteryswapai-faq.html
- Repositorio de ZRPATeam (enfoque alternativo): https://github.com/ZRPATeam/BatterySwapAI-2026/
- Modelo de ejemplo oficial: https://huggingface.co/batteryswapaichallenge/BatterySwapAI2026-Example
