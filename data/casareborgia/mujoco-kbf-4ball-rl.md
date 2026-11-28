# casareborgia/mujoco-kbf-4ball-rl

## Resumen

`casareborgia/mujoco-kbf-4ball-rl` es un proyecto de investigación en aprendizaje por refuerzo aplicado al billar coreano de cuatro bolas (4구 당구, reglas KBF), desarrollado por el usuario independiente casareborgia. No es un modelo de lenguaje: es un artefacto de reinforcement learning que contiene políticas SAC entrenadas con Stable-Baselines3 sobre PyTorch, junto con redes de "mapa de puntuación" (score-map) y un planificador de búsqueda por simulación. El repositorio incluye tanto los pesos entrenados como el simulador y los resultados comparativos de tres estrategias de selección de tiro sobre un mismo conjunto de 811 partidas.

El problema que aborda es la selección de tiro en billar a tres bandas: dado un estado de mesa, decidir qué golpe ejecutar para maximizar la probabilidad de anotar. El autor compara tres aproximaciones bajo condiciones idénticas: una política SAC que emite un tiro directamente, una red que puntúa 1.256 tiros candidatos sin simulador, y una búsqueda por simulación que prueba unos 200 tiros por jugada. Los resultados publicados muestran que la búsqueda por simulación gana el 100% de las partidas, la red de mapa de puntuación ronda el 99,9-100% y la política SAC alcanza el 89-93% tras un millón de pasos de entrenamiento.

La relevancia actual del artefacto es metodológica más que de producto: ofrece una comparación controlada entre policy learning puro, scoring supervisado y planning basado en modelo, con métricas de tasa de acierto por tiro, innings por partida y robustez frente a error de ejecución (ángulo ±0,2°, potencia ±5%). El repositorio pesa 0,1 GB y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política SAC (Soft Actor-Critic) sobre PyTorch; red de mapa de puntuación para 1.256 tiros candidatos; planificador de búsqueda por simulación sobre pooltool |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; el estado es la configuración de la mesa) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ko (coreano, según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | checkpoints de Stable-Baselines3 (`.pt` / PyTorch); se citan `scoremap_noise_1m_ft.pt` y `scoremap_spin_1.4m.pt` |
| Libreria | stable-baselines3 |
| Entorno de simulacion | MuJoCo y pooltool |
| Tamano del repositorio | 0,1 GB |
| Dominio | Billar coreano de 4 bolas (KBF), 5 puntos a 10 innings y variante 1:1 a 10 puntos |

## Arquitectura y entrenamiento

El proyecto contiene tres componentes diferenciados. El primero es una política SAC entrenada con Stable-Baselines3 sobre el simulador pooltool durante un millón de pasos (semillas 42 y 43), que emite un tiro de forma directa sin consultar el simulador en tiempo de inferencia. El segundo es una red de mapa de puntuación que evalúa 1.256 tiros candidatos y selecciona el centro del intervalo de mayor probabilidad de anotación; se entrenó con 400.000 tiros aleatorios más repetición de colocaciones vistas en partida hasta alcanzar 4 millones de muestras, en dos ejecuciones independientes. El tercero es un planificador de búsqueda por simulación sin aprendizaje, que prueba aproximadamente 200 tiros por jugada en el simulador y elige el mejor.

El entrenamiento se realizó sobre dos motores físicos: MuJoCo (versión inicial, más lenta, con solo decenas de miles de tiros) y pooltool (versión posterior, con un millón de pasos para SAC y hasta 4 millones de muestras para la red de mapa de puntuación). El autor documenta una corrección explícita de conclusiones: la versión del 16 de noviembre de 2026 afirmaba que SAC se estancaba por su estructura de salida única, pero tras entrenar sobre pooltool con un millón de pasos esa conclusión se rectificó, ya que SAC alcanza el 89-93% de victorias. Se añadieron además variantes con ajuste fino frente a error de ejecución (`scoremap_noise_1m_ft.pt`), cinco tipos de efecto (spin) y una inferencia en dos etapas Coarse→Fine (`scoremap_spin_1.4m.pt`), junto con un híbrido Top-8 que valida con el simulador solo los 8 mejores candidatos de la red.

## Capacidades

- Selección de tiro en billar coreano de 4 bolas bajo reglas KBF (partidas a 5 puntos con máximo 10 innings, y variante 1:1 a 10 puntos con bola trasera).
- Política SAC que emite un tiro directamente sin acceso al simulador en inferencia (apta para despliegue de baja latencia).
- Red de mapa de puntuación que clasifica 1.256 tiros candidatos y elige el de mayor probabilidad estimada de anotación.
- Planificación por búsqueda: evaluación de aproximadamente 200 tiros por jugada mediante simulación física en pooltool.
- Híbrido Top-8: la red propone candidatos y el simulador valida solo los 8 mejores, reduciendo el coste de simulación a una media de 1,1 simulaciones por tiro en el ejemplo publicado.
- Robustez frente a error de ejecución: variantes entrenadas con ruido de ángulo ±0,2° y potencia ±5%.
- Modelado de efecto (spin) con cinco tipos de punto de golpeo y estrategia de inferencia en dos etapas Coarse→Fine.
- No soporta tool calling, function calling, agentes de propósito general, visión, audio ni generación de texto: es un artefacto de RL específico de dominio.

## Casos de uso

- Evaluación comparativa de paradigmas de decisión: el repositorio sirve como banco de pruebas reproducible para contrastar policy learning (SAC), scoring supervisado (mapa de puntuación) y planning basado en modelo (búsqueda) bajo las mismas 811 partidas y semillas controladas.
- Entrenamiento de agentes de billar en simulación: la política SAC y el entorno pooltool permiten experimentar con curriculum, recompensas y aumentación de datos sin necesidad de una mesa física.
- Asistencia a jugadores mediante análisis de tiros: la red de mapa de puntuación puede integrarse en una herramienta que, dado un estado de mesa, devuelva los tiros con mayor probabilidad estimada de anotación y el intervalo de tolerancia.
- Investigación en robustez de políticas: las variantes con ruido de ejecución (`scoremap_noise_1m_ft.pt`) permiten estudiar cómo degrada el rendimiento un error de ángulo y potencia realista, útil para transferencia sim-a-real.
- Docencia en reinforcement learning: el proyecto ilustra de forma autocontenida el ciclo completo de entrenamiento SAC, evaluación con semillas fijas y comparación contra baselines no aprendidos.
- Prototipado de sistemas híbridos aprendizaje-búsqueda: el esquema Top-8 demuestra cómo reducir el coste computacional de un planificador (de 2.017 a 11 simulaciones en el ejemplo publicado) manteniendo la tasa de acierto.
- Análisis de planificación a largo plazo en deportes de turnos: las tablas de victoria por límite de innings (1, 2, 3, 5, 10) permiten estudiar cómo cambia la estrategia óptima según el horizonte disponible.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre pooltool, partidas a 5 puntos con máximo 10 innings, 811 posiciones iniciales aleatorias:

| Jugador | Tiros de entrenamiento | Tasa de acierto por tiro (nivel 0 / 1 / 2) | Victorias en 811 partidas | Acierto durante partida | Tiros por partida |
|---|---|---|---|---|---|
| SAC v4 (versión previa, MuJoCo) | decenas de miles | 32,5% / 15,5% / 9,5% | 9 | 13,3% | no disponible |
| SAC pooltool, semilla 42 | 1.000.000 | 97,0% / 75,0% / 63,0% | 722 (89,0%) | 55,8% | 9,96 |
| SAC pooltool, semilla 43 | 1.000.000 | 93,5% / 76,0% / 65,5% | 755 (93,1%) | 59,5% | 9,46 |
| Mapa de puntuación, 4M (ejecución 1) | 4.000.000 | 95,5% / 87,5% / 93,0% | 811 (100%) | 84,7% | 6,21 |
| Mapa de puntuación, 4M (ejecución 2) | 4.000.000 | 95,5% / 82,0% / 91,5% | 810 (99,9%) | 85,0% | 6,20 |
| Búsqueda por simulación | 0 (sin aprendizaje) | 100% (75 tiros por nivel) | 811 (100%) | 100% | 5,00 |

Victorias según el límite de innings (mismas 811 posiciones):

| Máximo de innings | Búsqueda | Mapa de puntuación (1 / 2) | SAC pooltool (42 / 43) |
|---|---|---|---|
| 1 | 100% | 45,0% / 43,5% | 7,9% / 9,6% |
| 2 | 100% | 75,6% / 77,2% | 18,6% / 22,7% |
| 3 | 100% | 90,9% / 91,5% | 31,7% / 40,2% |
| 5 | 100% | 98,5% / 98,9% | 58,0% / 65,1% |
| 10 | 100% | 100% / 99,9% | 89,0% / 93,1% |

Comparación con el mismo presupuesto de un millón de tiros:

| Jugador | Tiros | Victorias en 811 | Acierto durante partida |
|---|---|---|---|
| SAC pooltool (42 / 43) | 1.000.000 | 722 / 755 | 55,8% / 59,5% |
| Mapa de puntuación (40.000 aleatorios + 3 repeticiones) | 1.000.000 | 703 | 54,5% |
| Mapa de puntuación (solo tiros aleatorios, semillas 0 / 1) | 1.000.000 | 544 / 531 | 43,7% / 43,2% |
| Mapa de puntuación (1M aleatorios + 5 repeticiones, semillas 0 / 1) | 2.000.000 | 804 / 798 | 68,1% / 67,5% |
| Mapa de puntuación (+ 10 repeticiones de colocaciones en partida) | 4.000.000 | 811 / 810 | 84,7% / 85,0% |

En la variante de duelo 1:1 a 10 puntos con error de ejecución (ángulo ±0,2°, potencia ±5%), el autor reporta que el modelo final ganó 10:2 a la búsqueda por simulación en la semilla 80016, y que el híbrido Top-8 logró 10 anotaciones consecutivas con 11 simulaciones totales frente a 2.017 del planificador puro. Las tablas completas de 100 partidas y 30 partidas con error de ejecución quedan truncadas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio completo pesa 0,1 GB, por lo que los checkpoints de política y mapa de puntuación son ligeros y caben holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican en la documentación. Dado el tamaño del artefacto, una RTX 3060 o superior es suficiente para inferencia; el entrenamiento SAC a un millón de pasos se beneficia de GPU dedicada, pero el cuello de botella real es el simulador físico, no la red.
- Cabe en GPU consumer: sí, por el tamaño del repositorio y la naturaleza de las redes (políticas y scoring sobre estados de mesa, no modelos de lenguaje).
- Opciones de despliegue: Stable-Baselines3 con PyTorch para cargar los checkpoints; pooltool como motor físico para la búsqueda por simulación; MuJoCo para la variante original. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles de forma agregada. El autor indica que la búsqueda por simulación ejecuta unas 200 simulaciones por tiro y que el híbrido Top-8 reduce el coste a una media de 1,1 simulaciones por tiro en el ejemplo publicado, lo que da una idea del orden de magnitud de la ventaja del enfoque aprendido.

## Comparativa con modelos similares

No se han publicado comparaciones con otros proyectos de RL aplicados al billar en la información disponible. La comparación interna del propio repositorio entre sus tres enfoques (SAC, mapa de puntuación y búsqueda por simulación) se detalla en la sección de benchmarks.

| Enfoque | Aprendizaje | Simulador en inferencia | Victorias (811 partidas, 10 innings) | Licencia |
|---|---|---|---|---|
| SAC pooltool | 1M pasos | No | 89,0-93,1% | MIT |
| Mapa de puntuación | 4M muestras | No | 99,9-100% | MIT |
| Búsqueda por simulación | Ninguno | Sí (~200 tiros/jugada) | 100% | MIT |
| Híbrido Top-8 | Mapa de puntuación + validación | Sí (hasta 8 candidatos) | no disponible de forma agregada | MIT |

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo multimodal: no genera texto, no razona en lenguaje natural y no admite prompts. Cualquier uso fuera del dominio del billar coreano de 4 bolas requiere reentrenamiento.
- El resultado del 100% de la búsqueda por simulación está favorecido por las condiciones experimentales: el planificador simula con el mismo motor físico y el tiro elegido se ejecuta sin error. El propio autor lo señala explícitamente.
- La política SAC solo se entrenó hasta un millón de pasos; el autor no exploró regímenes mayores, por lo que la comparación con la red de mapa de puntuación a 4 millones de muestras no está igualada en presupuesto.
- El sesgo de selección de semillas y de posiciones iniciales no se documenta en detalle; los resultados provienen de un conjunto fijo de 811 posiciones aleatorias y semillas concretas (42, 43, 80000+), lo que limita la generalización estadística.
- El soporte de idioma declarado es únicamente coreano (ko); la documentación y los vídeos están en coreano, con un resumen en inglés.
- Riesgo de sobreajuste al simulador: el rendimiento en mesa física no está validado en la información disponible, y las variantes con ruido de ejecución solo modelan error de ángulo y potencia, no otras fuentes de incertidumbre (desgaste del paño, humedad, defectos de bola).
- La licencia MIT permite uso comercial, pero el artefacto depende de pooltool y MuJoCo; conviene verificar las licencias de esos motores físicos antes de un despliegue comercial.
- El repositorio incluye vídeos y resultados de benchmarks que el autor ha corregido entre versiones (16, 20 y 23 de noviembre de 2026); las conclusiones de la versión inicial sobre los límites de SAC ya no son válidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/casareborgia/mujoco-kbf-4ball-rl
- Space interactivo con partidas y benchmarks: https://huggingface.co/spaces/casareborgia/kbf-4ball-duel
- Versión previa de la model card (commit 6f183f4): https://huggingface.co/casareborgia/mujoco-kbf-4ball-rl/tree/6f183f4d47f2a742278e0011879b83befc3dfac5
- Vídeo primera entrada con pooltool: https://huggingface.co/casareborgia/mujoco-kbf-4ball-rl/resolve/main/media/first_inning_pooltool.mp4
- Vídeo de fallo de la red en primera entrada: https://huggingface.co/casareborgia/mujoco-kbf-4ball-rl/resolve/main/media/first_inning_pooltool_seed80004.mp4
- Vídeo duelo híbrido Top-8 contra búsqueda: https://huggingface.co/casareborgia/mujoco-kbf-4ball-rl/resolve/main/media/duel_hybrid8_vs_search.mp4
- Vídeo duelo con error de ejecución: https://huggingface.co/casareborgia/mujoco-kbf-4ball-rl/resolve/main/media/duel_noise_exp_win.mp4
- Vídeo duelo red sola a 10 puntos: https://huggingface.co/casareborgia/mujoco-kbf-4ball-rl/resolve/main/media/duel_1inning_10pt.mp4
