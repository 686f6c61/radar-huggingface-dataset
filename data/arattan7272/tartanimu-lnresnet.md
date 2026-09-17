# arattan7272/tartanimu-lnresnet

## Resumen

TartanIMU ln-resnet es un modelo de odometría inercial (inertial odometry) publicado por el usuario arattan7272 (Avantika Rattan, Kaggle) como solución al reto TartanIMU de IROS 2026. Se trata de un único conjunto de pesos de 5,38 millones de parámetros que estima la velocidad media en el sistema de referencia del cuerpo (body-frame) para ventanas de 1,0 s a partir exclusivamente de IMU bruta de 6 ejes. Lo relevante es que un solo modelo unificado sirve para cuatro plataformas muy distintas —coche, cuadrúpedo (perro), dron y humano— sin etiqueta de plataforma en inferencia ni cabezas de enrutamiento.

La arquitectura no es un transformer de lenguaje: es una red residual de neuronas vectoriales con equivarianza SO(3) derivada de LN-ResNet, con convoluciones temporales compartidas en xyz, VN leaky ReLU, características basadas en el producto cruzado (corchete de Lie de so(3)), puertas escalares invariantes y pooling de atención invariante por ventana. Sobre esa columna vertebral se apila un LSTM bidireccional de 2 capas (256 ocultas) que modela la secuencia de ventanas. El modelo se distribuye con licencia Apache-2.0 y su card incluye métricas de la evaluación oficial, lo que lo hace directamente reproducible y comparable con el baseline de los organizadores (0,538).

Es relevante ahora porque demuestra que el sesgo inductivo geométrico (equivarianza a rotaciones) permite resolver odometría inercial multi-plataforma con un presupuesto de parámetros minúsculo y en un único modelo, algo que los enfoques genéricos suelen abordar con redes mucho mayores o con datos etiquetados por plataforma. El checkpoint es el EMA de un único entrenamiento en el paso 32.000, sin ensembling ni test-time augmentation.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red residual de neuronas vectoriales con equivarianza SO(3) derivada de LN-ResNet (convoluciones temporales compartidas en xyz, VN leaky ReLU, características de producto cruzado / corchete de Lie so(3), puertas escalares invariantes, pooling de atención invariante por ventana de 1 s) + 5 adaptadores de marco + LSTM bidireccional de 2 capas (256 ocultas) sobre la secuencia de ventanas |
| Parámetros totales | 5,38 M (5.38M) |
| Longitud de contexto | 64 ventanas consecutivas de 1,0 s, con 7 ventanas de contexto a cada lado (replicadas en los bordes y enmascaradas); cada trayectoria se procesa de forma independiente |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico; consume señales IMU de 6 ejes: `[ax, ay, az, gx, gy, gz]`) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`model.pt`) |

## Arquitectura y entrenamiento

La columna vertebral es una red residual de neuronas vectoriales con equivarianza SO(3) inspirada en LN-ResNet. Las convoluciones temporales tratan las componentes xyz de forma compartida, las no linealidades son VN leaky ReLU y se extraen características mediante productos cruzados (corchete de Lie de so(3)), lo que preserva la estructura geométrica de las rotaciones. La información se condensa con puertas escalares invariantes y un pooling de atención invariante por cada ventana de 1 s. Los componentes no equivariantes son cinco adaptadores de marco (mapas de salida 3x3 aprendidos y mezclados por pesos invariantes) y un LSTM bidireccional de 2 capas con 256 unidades ocultas que recorre la secuencia de ventanas leyendo las componentes xyz brutas de los tokens de ventana. El modelo incorpora además cabezas auxiliares (velocidad en el sistema del sensor, detector de stream de IMU en sistema mundial y clasificador de plataforma) que solo actúan como señal de entrenamiento y no intervienen ni en el enrutamiento ni en el posprocesado de las predicciones.

El entrenamiento usó únicamente los splits de train y val liberados por el reto, sin datos externos ni pesos preentrenados, durante 32.000 pasos con semilla 0 y EMA de 0,999. La aumentación es exclusivamente de coherencia física: reescalado rígido exacto en el tiempo de los vuelos de dron y amplitud de vibración aleatorizada, más ruido y sesgo de sensor. En inferencia solo se leen la matriz `imu` (N, 6) de cada `.npz` y el orden de ventanas del CSV; no se usan etiqueta de plataforma, pose, timestamps ni otros metadatos.

## Capacidades

- Regresión de velocidad: predice la velocidad media en el sistema del cuerpo para cada ventana de 1,0 s a partir de IMU bruta de 6 ejes.
- Odometría inercial unificada en cuatro dominios: coche, humano, cuadrúpedo (perro) y dron, con un único conjunto de pesos compartido.
- Modelado secuencial: procesa fragmentos de 64 ventanas consecutivas con 7 ventanas de contexto a cada lado, lo que le permite explotar dependencias temporales de hasta 64 s por bloque.
- Equivarianza a rotaciones: la arquitectura preserva SO(3) en la columna vertebral, lo que reduce la necesidad de aumentación de orientación.
- Multilingüe: no aplica (modelo no lingüístico, entrada exclusivamente numérica de sensores).
- Tool calling / function calling: no disponible; no es una capacidad contemplada para este modelo.
- Agentes y razonamiento multi-paso: no disponible; la tarea es regresión de estado, no razonamiento simbólico.
- Capacidades especiales: ninguna declarada más allá de la predicción de velocidad y las cabezas auxiliares de entrenamiento (velocidad en sistema del sensor, detector de stream mundial de IMU y clasificador de plataforma).
- Determinismo: TF32 desactivado; las salidas en GPU y CPU coinciden con una tolerancia de 1e-5.
- No requiere ensembling ni test-time augmentation para reproducir el resultado publicado.

## Casos de uso

- Odometría inercial para robótica móvil y AGV: el modelo estima la velocidad del cuerpo cada segundo a partir de la IMU de 6 ejes, lo que permite alimentar un filtro de fusión o un módulo de dead-reckoning cuando la odometría visual falla. Su ventana de 64 ventanas con contexto de 7 a cada lado le permite mantener coherencia temporal en tramos largos.
- Navegación de drones en entornos sin GNSS: aunque el rendimiento en dron es el peor de las cuatro plataformas (ATE20 de 3,06937 m), el modelo sigue aportando una estimación de velocidad útil como señal auxiliar en fusión con barómetro, magnetómetro o flujo óptico.
- Fusión sensorial en pipelines SLAM/VIO: al predecir velocidad body-frame directamente desde IMU, se puede integrar como factor inercial aprendido junto a factores visuales en un optimizador de grafos, reduciendo la deriva en tramos sin features.
- Análisis de marcha y seguimiento de actividad con wearables: el modelo funciona bien en humano (AVE 0,06269 m/s, ATE20 0,33543 m), por lo que puede estimar velocidad de desplazamiento en dispositivos de muñeca o tobillo sin depender de GPS.
- Localización de vehículos y telemetría de flota: con AVE de 0,09786 m/s en coche, es apto para estimar velocidad instantánea en segmentos sin cobertura GNSS (túneles, parkings, entornos urbanos densos).
- Control de robots cuadrúpedos: con AVE de 0,08093 m/s y ATE20 de 0,36782 m, puede proporcionar realimentación de velocidad al controlador de marcha sin necesidad de encoders en las patas.
- Reproducción y comparación de investigación: al publicarse el checkpoint, el script de inferencia y el MD5 exacto del CSV de envío, sirve como baseline reproducible para futuros trabajos de odometría inercial equivariante.
- Benchmarking en el reto TartanIMU (IROS 2026): el modelo está pensado para generar un `submission.csv` evaluable por el servicio de scoring oficial, con un resultado de 0,27267 en el TartanIMU Score.

## Benchmarks y rendimiento

Los resultados publicados en la model card provienen del servicio de scoring oficial sobre el split de test completo del reto TartanIMU. No se han publicado resultados de benchmarks de propósito general (MMLU, HumanEval, GSM8K) porque no es un modelo de lenguaje.

| Métrica | Valor |
|---|---|
| TartanIMU Score | 0,27267 |
| AVE | 0,22242 m/s |
| ATE20 | 1,07043 m |
| RTE@5s | 0,71091 m |
| Kaggle (leaderboard público) | 0,35010 |
| Baseline de los organizadores (test completo) | 0,538 |

Desglose por plataforma (AVE / ATE20):

| Plataforma | AVE (m/s) | ATE20 (m) |
|---|---|---|
| Coche (car) | 0,09786 | 0,50911 |
| Humano (human) | 0,06269 | 0,33543 |
| Cuadrúpedo (quadruped) | 0,08093 | 0,36782 |
| Dron (drone) | 0,64821 | 3,06937 |

## Requisitos de hardware

- VRAM: holgadamente por debajo de 16 GB según el autor; con 5,38 M de parámetros, el modelo cabe en cualquier GPU con memoria moderada (estimación orientativa: decenas o pocos cientos de MB de pesos, aunque el valor exacto no está disponible).
- GPU recomendadas: cualquiera con soporte CUDA. El autor reporta unos 8 s para el conjunto de test completo en una RTX 5080. No se especifican otras GPU, pero por tamaño cabría en RTX 3060, RTX 4090, A100 o H100 sin problema.
- GPU consumer: sí, cabe en cualquier GPU consumer moderna; no se requiere VRAM de centro de datos.
- CPU: funciona con `--device cpu`, con un tiempo aproximado de 90 s para el conjunto de test completo.
- Opciones de despliegue: PyTorch mediante el `infer.py` incluido (`python infer.py --traj_dir <test dir> --windows <index/test_windows.csv> --checkpoint model.pt --out submission.csv`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no se publican cifras de latencia por ventana. Como referencia, el conjunto de test completo se procesa en unos 8 s en RTX 5080 y unos 90 s en CPU.
- Determinismo: TF32 desactivado; las salidas en GPU y CPU coinciden dentro de 1e-5.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directos en la documentación proporcionada (no hay referencias a otros checkpoints de odometría inercial equivariante ni a sus especificaciones). El único punto de comparación documentado es el baseline de los organizadores del reto TartanIMU.

| Modelo | Parámetros | Contexto | TartanIMU Score (test completo) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tartanimu-lnresnet (este modelo) | 5,38 M | 64 ventanas de 1 s + 7 de contexto por lado | 0,27267 | Apache-2.0 | HuggingFace |
| Baseline de los organizadores TartanIMU | no disponible | no disponible | 0,538 | no disponible | no disponible |
| Otras alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento muy desigual por plataforma: el dron presenta un AVE de 0,64821 m/s y un ATE20 de 3,06937 m, entre seis y diez veces peor que humano o cuadrúpedo. No es adecuado como fuente principal de odometría en UAV sin sensores adicionales.
- Entrenado exclusivamente con los splits train y val del reto, sin datos externos ni pesos preentrenados. La generalización a sensores, frecuencias de muestreo o dominios fuera del reto no está validada.
- La inferencia depende del orden de ventanas proporcionado por un CSV (`test_windows.csv`); no consume timestamps, pose ni etiquetas de plataforma, de modo que un índice mal formado degrada la predicción.
- El contexto está limitado a bloques de 64 ventanas de 1,0 s con 7 ventanas de contexto a cada lado y cada trayectoria se procesa de forma independiente: no hay memoria entre trayectorias ni contexto global ilimitado.
- La predicción es velocidad media por ventana, no pose ni trayectoria completa; el ATE20 y el RTE@5s se acumulan si se integra la velocidad en el tiempo, por lo que la deriva es inherente al uso en dead-reckoning.
- No se han publicado análisis de sesgo. Al no ser un modelo lingüístico no hay sesgos de lenguaje, pero sí puede heredar sesgos de las plataformas y condiciones de captura representadas en el dataset del reto.
- Riesgo de alucinación: no aplica en el sentido generativo; el riesgo equivalente es la predicción de velocidad plausible pero incorrecta en regímenes dinámicos no vistos.
- Licencia Apache-2.0: permite uso comercial con atribución y sin garantías; no impone restricciones de uso adicionales más allá de las habituales de la licencia.
- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, y un tamaño reportado de 0,0 GB: la validación por parte de la comunidad es aún nula.
- El checkpoint es el EMA de un único entrenamiento (paso 32.000, semilla 0); no hay ensembling ni test-time augmentation, por lo que la robustez depende de esa única ejecución.
- La fecha de creación del repositorio en los metadatos (2026-09-17) es posterior a la fecha de esta consulta; conviene verificarla antes de citarla.

## Enlaces

- HuggingFace: https://huggingface.co/arattan7272/tartanimu-lnresnet
- Reproducción del envío: `python infer.py --traj_dir tartan-imu-challenge-iros2026/test --windows tartan-imu-challenge-iros2026/index/test_windows.csv --checkpoint model.pt --out submission.csv` (MD5 esperado del CSV: `d9a536690be776429b0adb5acd001b8f`)
- Fichero de integridad: `SHA256SUMS` en el propio repositorio
- Reto TartanIMU, IROS 2026: mencionado en la model card, sin URL proporcionada (no disponible)
- Perfil de Kaggle del autor (Avantika Rattan): mencionado, sin URL proporcionada (no disponible)
- Paper o blog técnico: no disponible
- Demo: no disponible
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo (los resultados obtenidos corresponden a contenidos no relacionados).
