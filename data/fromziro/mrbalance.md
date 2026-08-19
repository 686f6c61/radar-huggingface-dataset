# fromziro/MrBalance

## Resumen

MrBalance es un agente de aprendizaje por refuerzo (RL) desarrollado por Paul Courneya bajo la organización FromZero, diseñado para equilibrar objetos sobre una placa en un entorno de simulación física MuJoCo. El modelo, bautizado como "Mr. Balance", recibe una observación de 64 dimensiones que describe el estado del objeto (posición, velocidad, orientación) y el estado de la placa, y produce dos acciones de control continuo (roll y pitch) para mantener el objeto estable. Su objetivo es maximizar la supervivencia del objeto sobre la placa, evitando que se caiga.

A diferencia de los modelos de lenguaje, MrBalance es una política neuronal compacta de 33.285 parámetros con arquitectura MLP compartida actor-crítico, entrenada con PPO. Su relevancia radica en demostrar que una red extremadamente pequeña puede aprender comportamientos de control robustos y generalizar a objetos nunca vistos durante el entrenamiento, un resultado interesante para la comunidad de robótica y RL. El modelo se distribuye bajo licencia Apache 2.0 con pesos en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MrBalanceMLPForRL (MLP compartido actor-crítico, 4 capas: 3×128 + 1×64) |
| Parametros totales | 33.285 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control continuo, no procesa texto) |
| Tipos de cuantizacion | no disponible (no se publican cuantizaciones; el modelo es nativamente fp32) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MrBalance utiliza una arquitectura MLP compartida actor-crítico diseñada para control continuo. La observación de 64 dimensiones se procesa a través de cuatro capas: las tres primeras con 128 neuronas y la última con 64, empleando activaciones SiLU entre capas. La representación resultante de 64 dimensiones se comparte entre el actor y el crítico. El actor produce dos salidas de control correspondientes a los ejes de roll y pitch de la placa, usando una política gaussiana con desviaciones estándar aprendidas y squashing Tanh para acotar las acciones al rango [-1, 1]. El crítico estima el valor escalar del estado V(s) a partir de la misma representación.

El entrenamiento se realizó con PPO (Proximal Policy Optimization) en 8 entornos paralelos con 512 pasos de rollout por actualización, 6 épocas PPO, minibatch de 2048, gamma 0.99, GAE lambda 0.95, coeficiente de clip 0.20, coeficiente de valor 0.50, coeficiente de entropía 0.005, gradiente máximo 0.50, learning rate 3e-4 con anneal, y Adam epsilon 1e-5. Se completaron 12.756 episodios con un máximo de 10.000 pasos por episodio. Los objetos de entrenamiento fueron esfera, huevo y bola pesada.

## Capacidades

- Control continuo de equilibrio en dos ejes (roll y pitch) sobre una placa en MuJoCo.
- Generalización a objetos no vistos durante el entrenamiento: disco, taza, moneda, palo, bloque, cono, cápsula, cuña, tetraedro, barra plana, cruz, forma L, bloque ancho, bloque descentrado, entre otros.
- Política gaussiana con acciones acotadas a [-1, 1] mediante Tanh squashing.
- Arquitectura compartida actor-crítico que combina información de posición, velocidad, orientación y propiedades del objeto en una representación de control unificada.
- Inferencia con renderizado visual opcional y selección de objeto mediante argumentos de línea de comandos.
- No tiene capacidades de lenguaje, visión ni tool calling; es exclusivamente un agente de control físico.

## Casos de uso

- Simulación robótica de equilibrio: el modelo puede integrarse en entornos de simulación MuJoCo para estudiar estrategias de balanceo de objetos con geometrías diversas, útil en investigación de manipulación robótica.
- Benchmark de generalización en RL: sirve como caso de estudio para evaluar cómo políticas pequeñas generalizan a distribuciones de objetos fuera del conjunto de entrenamiento, con métricas cuantitativas como tasa de supervivencia y error de seguimiento.
- Educación en aprendizaje por refuerzo: al ser un modelo de solo 33.285 parámetros, es ideal para demostrar conceptos de PPO, actor-crítico y control continuo en cursos de machine learning o robótica, ejecutable en CPU sin necesidad de GPU.
- Prototipado de controladores para plataformas estabilizadoras: la política podría adaptarse a hardware real de bajo coste (por ejemplo, una placa con servomotores) tras transferir el entorno simulado, aunque requeriría calibración adicional.
- Investigación en arquitecturas eficientes: el diseño compartido actor-crítico con bottleneck de 64 dimensiones puede servir de referencia para estudiar el equilibrio entre capacidad del modelo y rendimiento en tareas de control.
- Evaluación de robustez en RL: los resultados de generalización (supervivencia del 100% en 19 de 20 objetos no entrenados) proporcionan un conjunto de datos reproducible para comparar métodos de regularización o aumento de datos en RL.

## Benchmarks y rendimiento

El autor publica resultados de entrenamiento y generalización en el entorno MuJoCo. La tabla siguiente resume el rendimiento sobre los objetos de entrenamiento y sobre objetos no vistos (generalización). Las métricas son: reward medio por episodio, longitud media del episodio (pasos), porcentaje de supervivencia y error de seguimiento (desviación del objeto respecto al centro de la placa, en metros).

| Objeto | Reward medio | Longitud media | Supervivencia | Error de seguimiento |
|---|---:|---:|---:|---:|
| sphere (entrenado) | 24.398,48 | 10.000,0 | 100% | 0,0205 m |
| egg (entrenado) | 23.240,42 | 10.000,0 | 100% | 0,0458 m |
| heavy_ball (entrenado) | 24.310,68 | 10.000,0 | 100% | 0,0401 m |
| disk | 21.191,56 | 10.000,0 | 100% | 0,1362 m |
| cup | 21.702,17 | 10.000,0 | 100% | 0,1242 m |
| coin | 20.973,76 | 10.000,0 | 100% | 0,1428 m |
| stick | 13.601,42 | 8.477,4 | 80% | 0,3399 m |
| tall | 22.265,77 | 10.000,0 | 100% | 0,1077 m |
| triangle | 18.794,99 | 10.000,0 | 100% | 0,2181 m |
| block | 21.489,38 | 10.000,0 | 100% | 0,1316 m |
| puck | 21.265,33 | 10.000,0 | 100% | 0,1361 m |
| cone | 18.327,38 | 10.000,0 | 100% | 0,2316 m |
| capsule | 22.302,92 | 10.000,0 | 100% | 0,1097 m |
| wedge | 18.921,33 | 10.000,0 | 100% | 0,2148 m |
| tetra | 18.838,96 | 10.000,0 | 100% | 0,2165 m |
| flat_bar | 20.550,93 | 10.000,0 | 100% | 0,1526 m |
| cross | 21.394,63 | 10.000,0 | 100% | 0,1435 m |
| L_shape | 21.221,41 | 10.000,0 | 100% | 0,1389 m |
| wide_block | 20.857,84 | 10.000,0 | 100% | 0,1611 m |
| offcenter_block | 21.408,22 | 10.000,0 | 100% | 0,1395 m |

No se han publicado comparaciones con otros modelos de RL en la información disponible.

## Requisitos de hardware

- VRAM estimada: prácticamente nula; el modelo tiene 33.285 parámetros, por lo que cabe en cualquier GPU o incluso en CPU sin necesidad de memoria dedicada.
- GPU recomendadas: ninguna en particular; cualquier CPU moderna es suficiente para la inferencia de la política. El cuello de botella es la simulación MuJoCo, no la red neuronal.
- Compatibilidad con GPU de consumo: sí, cualquier GPU consumer (RTX 2060 o superior) ejecuta la inferencia con un uso de VRAM inferior a 1 MB.
- Opciones de despliegue: scripts Python proporcionados (`inference.py` y `balance_plate_rl.py`) con dependencias `torch`, `transformers`, `safetensors`, `mujoco==3.10.0` y `numpy`. No es compatible con vLLM, Ollama ni TGI por ser un modelo RL de control, no un LLM.
- Latencia y throughput: no disponibles; la inferencia de la red es del orden de microsegundos, pero el paso de simulación de MuJoCo domina el tiempo de ejecución (típicamente 1-2 ms por paso en CPU).

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada (otros agentes RL de equilibrio de objetos con arquitectura MLP y entrenamiento PPO en MuJoCo). La categoría de control de equilibrio en RL es amplia, pero no se dispone de referencias concretas con las que comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en el entorno MuJoCo de equilibrio de placa; no es transferible directamente a otros entornos o tareas sin reentrenamiento.
- La generalización es buena para objetos de forma similar a los entrenados, pero falla parcialmente en objetos alargados como el palo (supervivencia del 80% y error de seguimiento de 0,34 m), lo que indica límites en la robustez ante geometrías extremas.
- No procesa lenguaje natural ni tiene capacidades multimodales; es un agente de control puro.
- La inferencia requiere el entorno MuJoCo y los scripts proporcionados; no se puede ejecutar como un modelo independiente sin el simulador.
- El modelo fue creado en 2026 y no se han publicado análisis de sesgos o riesgos de alucinación (conceptos no aplicables a un agente RL de control físico).
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en aplicaciones del mundo real; cualquier despliegue en hardware físico requeriría validación adicional.
- El repositorio de HuggingFace contiene 5,05 MB de archivos, incluyendo el vídeo de demostración y los scripts de inferencia, pero no se documentan los detalles del entorno de simulación (masas, fricciones, etc.) más allá de los objetos listados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fromziro/MrBalance
- Vídeo de demostración (en el repositorio del modelo): https://huggingface.co/fromziro/MrBalance/resolve/main/assets/video.mp4
- Repositorio de archivos: https://huggingface.co/fromziro/MrBalance/tree/main
- Script de inferencia y entorno (descargables desde el repositorio): `inference.py` y `balance_plate_rl.py`
- Nota: se encontró un repositorio GitHub titulado "MRBalance" (18370343199/MRBalance) que corresponde a un proyecto diferente (análisis causal con agentes LLM), no relacionado con este modelo.
