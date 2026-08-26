# iwillsolvehardestproblem/dreamerv3-atari100k-breakout

## Resumen

Este repositorio contiene el primer checkpoint público de un agente DreamerV3 entrenado en el entorno Breakout del benchmark Atari-100k. Ha sido desarrollado por el usuario iwillsolvehardestproblem como parte del proyecto dream-drift, un benchmark diseñado para medir la deriva de los rollouts (predicciones imaginadas) de los world models. El modelo se entrenó con el código oficial de DreamerV3 sin modificaciones, usando la configuración `atari100k` y la tarea `atari100k_breakout`, con un presupuesto de 110 000 pasos de entorno (aproximadamente 2 horas de juego real). El agente completo, que incluye el world model y la política, ocupa unos 2 GB y se distribuye bajo licencia MIT.

La relevancia de este checkpoint radica en que proporciona un punto de referencia público para investigar la calidad de las predicciones a largo plazo de los world models en entornos parcialmente observables. Además, incluye un registro de replay con las últimas 7000 transiciones del agente, lo que permite reproducir experimentos de deriva y comparar metodologías. El modelo se entrenó en una única GPU NVIDIA L4 durante aproximadamente 8,5 horas, lo que lo hace accesible para equipos con recursos moderados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World model (RSSM) + actor-critic (DreamerV3) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (agente de RL, no procesamiento de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de texto) |
| Licencia | MIT |
| Formato de pesos | `agent.pkl` (pickle), `breakout_dreamer_replay.npz` (NumPy) |

## Arquitectura y entrenamiento

DreamerV3 es un algoritmo de aprendizaje por refuerzo basado en world models. Aprende una representación latente compacta de las observaciones (imágenes de 64x64 píxeles) mediante un modelo de estado recurrente (RSSM) que predice representaciones futuras y recompensas dadas las acciones. La política actor-critic se entrena exclusivamente a partir de trayectorias imaginadas generadas por el world model, sin necesidad de interacción adicional con el entorno durante el entrenamiento de la política.

El entrenamiento se realizó con el código oficial de danijar/dreamerv3 sin modificar, usando la configuración `atari100k` (110 000 pasos de entorno, con action repeat de 4). Se empleó una única GPU NVIDIA L4 (instancia g6.xlarge) durante unas 8,5 horas, con la librería JAX en su versión 0.4.33 para CUDA 12. No se aplicaron técnicas de RLHF ni DPO; el aprendizaje es puramente por refuerzo con recompensas del entorno. El checkpoint incluye el agente completo (world model + política) y un registro de replay con las últimas 7000 transiciones, que puede usarse para evaluar la deriva de las predicciones.

## Capacidades

- Control de un agente en el entorno Atari Breakout mediante aprendizaje por refuerzo.
- Aprendizaje eficiente en muestras: con solo 110 000 pasos de entorno, el agente alcanza puntuaciones típicas de 0 a 6 en Breakout, consistentes con los resultados publicados de DreamerV3 a 100k.
- Generación de sueños (rollouts imaginados): el world model puede predecir hasta 50 pasos futuros en bucle abierto, con un error cuadrático medio (MSE) de 1,2e-3 en el primer paso y 1,7e-3 en el paso 50 (deriva de 5,3e-4) para estados dentro de la distribución de entrenamiento.
- Capacidad de planificación implícita: la política se entrena a partir de trayectorias imaginadas, lo que permite al agente anticipar consecuencias de sus acciones.
- No soporta tool calling, generación de texto, visión multimodal ni capacidades multilingües, al ser un agente de RL puro.

## Casos de uso

- Investigación en world models: este checkpoint sirve como referencia pública para estudiar la calidad de las representaciones latentes y la precisión de las predicciones a largo plazo en entornos visuales.
- Benchmark de deriva de rollouts: el proyecto dream-drift utiliza este modelo para medir cómo se degradan las predicciones del world model cuando se aleja de la distribución de entrenamiento, un problema crítico para la planificación basada en modelos.
- Evaluación de sample-efficiency: permite comparar el rendimiento de DreamerV3 con otros algoritmos de RL en el régimen de pocas muestras (Atari-100k), usando las puntuaciones de episodio como métrica.
- Estudio de fallos de generalización: el modelo muestra un modo de fallo denominado "confident healing" en estados generados por políticas expertas, donde las predicciones son 7 veces peores con una dispersión de muestras más estrecha. Esto es útil para investigar la robustez de los world models.
- Desarrollo de métodos de planificación: los investigadores pueden usar el world model preentrenado para probar nuevas estrategias de búsqueda de árboles o planificación basada en imaginación sin necesidad de reentrenar el modelo.
- Comparación de implementaciones: al ser el primer checkpoint público de DreamerV3 Atari, permite contrastar el rendimiento de la implementación original en JAX con otras versiones (por ejemplo, PyTorch) en el mismo entorno y presupuesto.

## Benchmarks y rendimiento

La model card proporciona mediciones de deriva de rollouts, no puntuaciones de episodio detalladas. Se reportan los siguientes datos:

| Metrica | Valor |
|---|---|
| MSE en paso 1 (in-distribution) | 1,2e-3 |
| MSE en paso 50 (in-distribution) | 1,7e-3 |
| Deriva (k50 - k1) | 5,3e-4 |
| MSE en estados de política experta | 7 veces peor que in-distribution |
| Puntuaciones de episodio finales | 0 a 6 (típico para DreamerV3 Breakout a 100k) |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. Las puntuaciones de episodio son bajas, pero esperables para el régimen de 100k pasos; por ejemplo, la implementación PyTorch de DreamerV3 reporta 396 puntos en Breakout, pero con un presupuesto mayor (400k pasos de entorno) y no es directamente comparable con este checkpoint.

## Requisitos de hardware

- Entrenamiento: se realizó en una única GPU NVIDIA L4 (instancia g6.xlarge) durante ~8,5 horas. No se especifican requisitos mínimos para reproducir el entrenamiento.
- Inferencia: el agente completo ocupa ~2 GB en disco (archivo `agent.pkl`). Para ejecutar el agente en un entorno Atari, se necesita una GPU con al menos 4 GB de VRAM para cargar el modelo y procesar observaciones de 64x64 píxeles. Una GPU como la NVIDIA T4, RTX 3060 o superior sería suficiente.
- Opciones de despliegue: el modelo se carga mediante el código oficial de DreamerV3 (JAX). No se proporcionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependen del hardware y de la implementación de JAX.

## Comparativa con modelos similares

No se dispone de otros checkpoints públicos de DreamerV3 Atari-100k para comparar directamente. La implementación PyTorch de burchim/DreamerV3-PyTorch reporta 396 puntos en Breakout, pero con un presupuesto de 400k pasos de entorno (4 veces mayor) y no publica checkpoints. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El agente alcanza puntuaciones muy bajas (0-6) en Breakout, lo que refleja la dificultad del régimen de 100k pasos. No es un agente competitivo para jugar al nivel humano.
- El world model presenta una deriva significativa en estados fuera de la distribución de entrenamiento (7 veces peor en estados de política experta), lo que limita su uso para planificación a largo plazo en escenarios no vistos.
- No se han documentado sesgos específicos, pero al ser un agente de RL, su comportamiento depende de la recompensa del entorno y puede no generalizar a variaciones del juego.
- El archivo `agent.pkl` es un objeto pickle de Python, lo que implica riesgos de seguridad si se carga desde fuentes no confiables. Se recomienda cargarlo solo en entornos aislados.
- La licencia MIT permite uso comercial, pero el modelo se distribuye sin garantías y no se proporciona soporte técnico.
- No hay información sobre la reproducibilidad exacta del entrenamiento (semillas, variabilidad entre ejecuciones) más allá de los datos de la model card.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/iwillsolvehardestproblem/dreamerv3-atari100k-breakout
- Código oficial de DreamerV3: https://github.com/danijar/dreamerv3
- Repositorio dream-drift: https://github.com/iwillsolvehardestproblem/dream-drift
- Issue sobre Atari100k Pong en DreamerV3: https://github.com/danijar/dreamerv3/issues/175
- Documentación de DreamerV3-PyTorch (Atari environments): https://deepwiki.com/burchim/DreamerV3-PyTorch/5.3-atari-environments
- Resultados Atari 100k de DreamerV3-PyTorch: https://deepwiki.com/burchim/DreamerV3-PyTorch/8.2-atari-100k-results
