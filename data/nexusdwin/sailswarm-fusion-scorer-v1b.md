# NexusDwin/sailswarm-fusion-scorer-v1b

## Resumen

El modelo SailSwarm fusion scorer v1b es un clasificador de gradient boosting de scikit-learn que fusiona lecturas de sensores de un vehículo de superficie no tripulado (USV) para estimar la probabilidad de que un sector de 15° contenga un obstáculo relevante para la navegación. Ha sido desarrollado por NexusDwin y se ejecuta en una Raspberry Pi 4 como parte del sistema de detección de obstáculos SailSwarm de la Universidad de Constanza, en el lago de Constanza. El modelo emplea tres entradas sensoriales: una cámara RGB con lente fisheye, una cámara térmica FLIR Lepton 3 y un radar de onda milimétrica TI AWR1843. Sustituyó al modelo v1a en septiembre de 2026, después de que una auditoría mostrara que las interacciones entre sensores mejoran la precisión en condiciones de baja luminosidad. Su relevancia se debe a que aporta una probabilidad calibrada por sector, apta para sistemas de navegación autónoma con recursos de hardware limitados.

En cuanto a la arquitectura, no se dispone de información pública sobre el número de parámetros; es un modelo de aprendizaje automático clásico, no un modelo de lenguaje. Las longitudes de contexto y los formatos de cuantización no aplican. Los pesos se distribuyen como bundles de joblib, con calibración isotónica ajustada out-of-fold.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gradient boosting (scikit-learn) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; modelo numérico de fusión de sensores) |
| Tipos de cuantización | no disponible (no aplica; formato joblib sin cuantización) |
| Idiomas soportados | no disponible (no aplica; modelo no textual) |
| Licencia | other |
| Formato de pesos | joblib (.joblib) |

## Arquitectura y entrenamiento

El modelo es un clasificador de gradient boosting entrenado con scikit-learn, que se carga mediante joblib. En la model card se indica que la versión exacta de scikit-learn es 1.9.0. No se detalla el número de árboles ni la función de pérdida, por lo que no hay más especificaciones técnicas disponibles. Los bundles contienen un calibrador isotónico ajustado out-of-fold, de modo que `predict_proba_calibrated` devuelve probabilidades calibradas. Las características se generan con `build_features.py` (esquema v4) y los objetivos proceden de frames auditados en el espacio de bearing.

El entrenamiento contempla tres modos de despliegue según los sensores disponibles en el box: `full` (segmentación primaria, 1.2 Hz), `tail` (solo radar e IMU, 3 Hz) y `typed` (añade cajas de YOLOv8n, 0.6 Hz en Raspberry Pi 4). La innovación principal es que los tres bundles se calibran out-of-fold, evitando el sobreajuste que presentaba la versión inicial, y que el modelo captura interacciones entre sensores, superando a la regla incumbente basada en `n_sensors/3` y al modelo v1a.

## Capacidades

- Detección de obstáculos por sectores de 15° en el espacio de bearing.
- Fusión de evidencias de cámara fisheye RGB, cámara térmica FLIR Lepton 3 y radar mmWave TI AWR1843.
- Emisión de probabilidades calibradas mediante `predict_proba_calibrated`.
- Tres modos de despliegue en función del hardware: `full`, `tail` y `typed`.
- Optimizado para ejecución en Raspberry Pi 4 con limitaciones de CPU.
- No soporta procesamiento de texto, generación de código ni tool calling; es un modelo numérico de fusión de sensores.

## Casos de uso

- Navegación autónoma de USV: el modelo se integra en el box de detección de obstáculos del vehículo; en cada sector de 15° se obtiene una probabilidad calibrada que el controlador de navegación usa para decidir maniobras de evasión. Es adecuado porque los tres modos permiten adaptar la latencia al consumo de CPU.
- Operaciones nocturnas o con baja visibilidad: al combinar termal y radar, mejora la detección de obstáculos en condiciones donde la cámara RGB no es fiable. Los resultados del holdout nocturno (AP 0.883) respaldan su uso en estas situaciones.
- Vigilancia marítima en infraestructuras ligeras: el modo `tail` (solo radar e IMU a 3 Hz) permite montar el detector en boyas o estaciones con Raspberry Pi 4, sin necesidad de imagen térmica ni cámara fisheye.
- Investigación en fusión multimodal: sirve como referencia para comparar algoritmos de fusión; los bundles con `full`, `tail` y `typed` permiten hacer ablaciones sobre qué sensores son necesarios.
- Entrenamiento de políticas de evitación: al producir probabilidades calibradas por sector, puede usarse como función de recompensa o señal de observación en sistemas de control y en simulación de trayectorias.
- Evaluación de nuevos sensores: el modelo puede adaptarse para medir el impacto de añadir detecciones de objetos (YOLOv8n) en el pipeline, como hace el modo `typed`.

## Benchmarks y rendimiento

En el holdout auditado v2 (8 clips, 2026-08-26 al atardecer):

| Modelo | AP | ECE | Person R@0.5 |
|---|---|---|---|
| fusion_scorer_live_v1b_oofcal | 0.869 | 0.108 | 0.887 |
| fusion_scorer_tail_radar_v1b | 0.811 | 0.165 | 1.00 |
| fusion_scorer_full_typed_v1b | 0.890 | 0.144 | no disponible |
| Incumbent (regla n_sensors/3) | 0.673 | 0.212 | no disponible |

En el holdout nocturno auditado:

| Modelo | AP |
|---|---|
| v1b (modo full) | 0.883 |
| Incumbent (regla n_sensors/3) | 0.731 |
| v1a (gated-mixture) | 0.639 |

Nota: la model card no especifica el modo exacto del v1b en el holdout nocturno, pero lo presenta como el nuevo modelo v1b.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo se ejecuta en CPU.
- GPU recomendadas: no aplica; no requiere GPU.
- Compatibilidad con hardware de consumo: sí, se ejecuta en Raspberry Pi 4 (ARM) a 1.2 Hz en el modo `full`, 3 Hz en `tail` y 0.6 Hz en `typed`.
- Opciones de despliegue: carga mediante joblib con scikit-learn 1.9.0; se incluyen scripts de despliegue (`deploy/shadow_mode.sh`) y el repositorio SailSwarm-ObstacleDetection.
- Latencia y throughput: los modos de despliegue definen la frecuencia de inferencia en la Raspberry Pi 4: `full` 1.2 Hz junto a la captura, `tail` 3 Hz y `typed` 0.6 Hz.

## Comparativa con modelos similares

| Modelo | Tipo | AP (night) | ECE | Licencia |
|---|---|---|---|---|
| SailSwarm fusion scorer v1b | Gradient boosting | 0.883 | 0.108 (dusk) | other |
| SailSwarm fusion scorer v1a | Gated mixture | 0.639 | no disponible | other |
| Incumbent (regla n_sensors/3) | Rule-based | 0.731 | 0.212 | no disponible |

Nota: El AP nocturno no es directamente comparable con el ECE, que procede del holdout v2 (dusk). La comparativa se hace con los valores disponibles.

## Limitaciones y advertencias

- Sin retorno de radar, el modelo limita la evidencia basada en cámara a una probabilidad mínima de aproximadamente 0.24; la política del USV debe tomar el máximo entre esta salida y el voto fusionado (`--evidence max`).
- En la ventana nocturna de las pruebas del 2026-09-08, los pesos marginales de cada sensor fueron de +0.04 o menos, lo que reduce la capacidad de discriminación.
- La calibración inicial era inestable: el calibrator ajustado en entrenamiento daba ECE 0.32 frente a 0.14 out-of-fold; por tanto, siempre hay que consumir `predict_proba_calibrated`.
- La licencia es "other", sin términos detallados; hay que revisarla antes de usar el modelo en producción o aplicaciones comerciales.
- El modelo está entrenado y validado para los sensores y el entorno del lago de Constanza; puede no generalizar a otros sensores, condiciones meteorológicas o geografías.
- El repositorio de HuggingFace muestra 0 descargas y un tamaño de 0.0 GB, por lo que es posible que los pesos no se hayan subido o que el repositorio esté incompleto; se recomienda verificar la disponibilidad de los archivos .joblib antes de intentar cargarlos.

## Enlaces

- HuggingFace: https://huggingface.co/NexusDwin/sailswarm-fusion-scorer-v1b
- No se han encontrado enlaces adicionales relevantes en la búsqueda web; los resultados obtenidos corresponden a portales de noticias y correo electrónico no relacionados.
