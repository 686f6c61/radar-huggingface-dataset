# CarlAlbertCode/BatterySwapAI2026-MnesisLab

## Resumen

BatterySwapAI 2026 — MnesisLab es un artefacto de planificación de intercambio de baterías desarrollado por CarlAlbertCode para la competición BatterySwapAI 2026 organizada por NORA. A diferencia de un modelo de lenguaje, se trata de un sistema de aprendizaje automático clásico serializado en formato joblib (0.2 GB) que combina un modelo de degradación de baterías con una política de planificación de rutas y capacidad. Su objetivo es predecir la vida útil restante (remaining useful life, RUL) de baterías reemplazables en sensores IoT de monitorización de condiciones en edificios comerciales noruegos, y generar un plan de trabajo eficiente que indique cuándo y en qué orden sustituir cada batería.

El sistema emplea un enfoque jerárquico de reranking basado en el primer tiempo de paso (first-passage time, FPT) de un proceso de Wiener sobre un modelo de degradación, con pesos ajustados para la capacidad y la planificación semanal. Está diseñado para ejecutarse en CPU, sin red, y cumple un contrato estricto de reconstrucción del fin de vida (EOL) según la definición del evaluador. Su relevancia radica en abordar un problema real de mantenimiento predictivo con restricciones operativas, ofreciendo una solución reproducible y de código abierto bajo licencia MIT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de degradación con reranking jerárquico de Wiener first-passage (FPT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de ML clásico, no procesa texto) |
| Tipos de cuantizacion | no disponible (artefacto joblib, sin cuantización declarada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | joblib (serialización de objetos Python) |

## Arquitectura y entrenamiento

La arquitectura combina un modelo de degradación de baterías con un mecanismo de reranking basado en el primer tiempo de paso de un proceso de Wiener. El sistema asigna un peso residual de 0.15 al ranking FPT, utiliza una ventana de retroceso de capacidad de 42 días y una escala operativa de emergencia de 0.5. El límite semanal de capacidad se fija en 0.99, lo que permite planificar intercambios sin exceder la capacidad operativa semanal.

El entrenamiento se realizó sobre datos de la competición BatterySwapAI 2026, que incluyen lecturas de voltaje de baterías en sensores IoT. El contrato del modelo especifica que solo se usan lecturas con `end_time <= scenario.start_time`, y el EOL se reconstruye según la definición del evaluador: estricto `10 < T < 30`, mediana diaria, días con menos de cinco lecturas enmascarados, mediana móvil de siete días calendario con `min_periods=3`, y primer voltaje suavizado `<= 2.40 V`. Este criterio coincide con los 82 dispositivos EOL observados en el conjunto de entrenamiento; los dispositivos censurados permanecen censurados. No se dispone de información sobre el número total de tokens, composición del dataset o técnicas de RLHF/DPO, al no ser un modelo de lenguaje.

## Capacidades

- Predicción de vida útil restante (RUL) de baterías mediante análisis de supervivencia basado en el primer tiempo de paso de un proceso de Wiener.
- Generación de planes de intercambio de baterías con fechas válidas y orden de ejecución, respetando límites de capacidad semanal.
- Manejo de datos censurados (baterías que no han llegado a EOL durante el periodo de observación).
- Reconstrucción del EOL según una definición estricta y reproducible, alineada con el evaluador de la competición.
- Ejecución en CPU sin necesidad de red, lo que facilita su despliegue en entornos aislados.
- Compatibilidad con el paquete `batteryswap_public==0.3.4` para la carga y evaluación de escenarios.

## Casos de uso

- Mantenimiento predictivo de flotas de sensores IoT: el modelo predice cuándo cada batería alcanzará su fin de vida, permitiendo programar sustituciones antes de que fallen, reduciendo el tiempo de inactividad de los sensores de monitorización de condiciones en edificios.
- Planificación de rutas de técnicos de campo: el plan generado indica el orden óptimo de sustitución de baterías en diferentes ubicaciones, minimizando desplazamientos y maximizando la eficiencia operativa semanal.
- Gestión de inventario de baterías de repuesto: al conocer la demanda futura de reemplazos, los equipos de mantenimiento pueden dimensionar el stock de baterías y evitar roturas de stock o excesos de inventario.
- Optimización de costes de mantenimiento: la política de capacidad y el límite semanal permiten distribuir las sustituciones a lo largo del tiempo, evitando picos de trabajo y costes asociados a emergencias.
- Análisis de supervivencia de baterías en entornos reales: el modelo puede aplicarse a datos históricos de voltaje para estimar curvas de supervivencia y comparar el rendimiento de diferentes lotes de baterías o condiciones ambientales.
- Integración en sistemas de gestión de edificios (BMS): el artefacto joblib puede incorporarse a pipelines de datos existentes para automatizar la generación de órdenes de trabajo basadas en predicciones de RUL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el sistema procesó 19,890 filas en el split de entrenamiento, pero no se proporcionan métricas de rendimiento como precisión, recall, MAE o comparativas con otros modelos.

## Requisitos de hardware

- Artefacto de 0.2 GB en formato joblib, diseñado para ejecución en CPU.
- No requiere GPU; el modelo se ejecuta en entornos sin aceleración hardware.
- Memoria RAM estimada: no disponible, pero al ser un artefacto de 0.2 GB, es razonable esperar que quepa en sistemas con 4 GB de RAM o menos.
- Compatible con entornos de contenedores o CI/CD sin acceso a red.
- Opciones de despliegue: carga directa con `joblib.load()` en Python; puede integrarse en servicios de inferencia como FastAPI o en pipelines de procesamiento por lotes.
- Latencia y throughput: no disponibles, pero al ser un modelo clásico de ML, se espera una inferencia rápida (del orden de milisegundos por escenario) en CPU moderna.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (planificación de intercambio de baterías con análisis de supervivencia). La competición BatterySwapAI 2026 cuenta con otros participantes, pero no se han publicado sus arquitecturas o resultados. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Modelo específico de dominio: está entrenado para baterías de sensores IoT en edificios comerciales noruegos; su generalización a otros tipos de baterías o entornos no está garantizada.
- Dependencia de la definición de EOL: el modelo asume la reconstrucción estricta del evaluador; cambios en los criterios de EOL invalidarían las predicciones.
- Sin soporte para datos fuera de la ventana temporal: solo utiliza lecturas con `end_time <= scenario.start_time`, por lo que no puede aprovechar información futura en escenarios de planificación.
- Riesgo de sobreajuste a los datos de entrenamiento: no se han publicado métricas de validación externa, por lo que el rendimiento en datos no vistos es incierto.
- Licencia MIT: permite uso comercial, pero el modelo se distribuye sin garantías; el autor no ofrece soporte técnico.
- No es un modelo de lenguaje: no puede procesar texto, generar código ni realizar tareas de NLP; su uso se limita a la planificación de baterías.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/CarlAlbertCode/BatterySwapAI2026-MnesisLab
- Modelo de ejemplo de la competición: https://huggingface.co/batteryswaichallenge/BatterySwapAI2026-Example
- FAQ de la competición BatterySwapAI 2026: https://www.nora.ai/competitions/batteryswapai/batteryswapai-faq.html
