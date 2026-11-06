# lucaskim72/connectailab-rl-lucasbrain-v1-link01-walk-ppo

## Resumen

`connectailab-rl-lucasbrain-v1-link01-walk-ppo` es una política de aprendizaje por refuerzo entrenada con PPO (Proximal Policy Optimization) mediante la librería Stable-Baselines3 para controlar la locomoción de un robot bípedo simulado denominado LINK-01. No es un modelo de lenguaje ni un transformer generativo: es un agente de control continuo que mapea observaciones de 51 dimensiones a acciones de 14 dimensiones correspondientes a las articulaciones del robot. Lo desarrolla Lucas Kim, en el marco del proyecto CONNECT AI LAB, y se distribuye como un artefacto de Stable-Baselines3 (ficheros `model.zip`, `vecnormalize.pkl` y `actor.json`).

El problema que resuelve es acotado y concreto: conseguir que el bípedo LINK-01 aprenda a caminar desde cero (sin demostraciones ni inicialización con políticas expertas) en el entorno `Link01Walk-v0`, construido sobre el simulador físico MuJoCo a través de `link01-gym`. El entrenamiento se realizó en 2.007.040 pasos, en 21,45 minutos, con 8 entornos en paralelo, lo que da una idea del reducido coste computacional del experimento.

Su relevancia actual es la de un ejemplo reproducible y didáctico de RL aplicado a robótica de locomoción, más que la de un componente listo para producción. Los resultados declarados son modestos en términos absolutos (0,1216 m/s de velocidad media, con comandos de 0,18 m/s), pero destacan por la ausencia de caídas (0,0 caídas por minuto) en las cinco pruebas de 20 segundos. Es un modelo de nicho, con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal fully-connected (política actor-crítico para PPO); actor con capas [64, 64] y crítico con capas [256, 256] |
| Parametros totales | no disponible (no se declara el recuento; por la arquitectura, del orden de decenas de miles) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; observación de 51 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; el artefacto es un `model.zip` de Stable-Baselines3) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (Stable-Baselines3), `vecnormalize.pkl` (estadísticas de normalización) y `actor.json` (exportación del actor) |

## Arquitectura y entrenamiento

La política sigue el esquema estándar actor-crítico de PPO implementado en Stable-Baselines3. El actor es un perceptrón multicapa con dos capas ocultas de 64 unidades que produce la media de una distribución gaussiana sobre las 14 acciones continuas (una por articulación); el crítico emplea dos capas de 256 unidades para estimar el valor del estado. El espacio de observación tiene 51 dimensiones y el de acción 14, con una postura base de ±0,18 rad. No hay atención, memoria recurrente ni componentes multimodales: es un controlador puramente reactivo (Markoviano) sobre el estado actual.

El entrenamiento se realizó con PPO sobre el entorno `Link01Walk-v0` de `link01-gym` (MuJoCo), con los siguientes hiperparámetros declarados: `lr` 0,0003, `clip_range` 0,2, `gamma` 0,99, `gae_lambda` 0,95, `entropy_coef` 0,0, 8 entornos paralelos y 2.007.040 pasos totales en 21,45 minutos. Se incluye un `vecnormalize.pkl`, lo que indica que las observaciones (y previsiblemente las recompensas) se normalizaron durante el entrenamiento; es imprescindible cargar ese fichero junto con el modelo para reproducir el comportamiento. No se documenta composición de dataset (no aplica: el dato procede de la simulación), ni uso de RLHF/DPO, ni innovaciones técnicas destacables más allá del propio pipeline de entrenamiento.

## Capacidades

- Control de locomoción bípeda: genera comandos articulares continuos (14 dimensiones) para que el robot LINK-01 avance en el simulador MuJoCo.
- Seguimiento de comandos de velocidad: entrenado y evaluado con comandos de 0,18 m/s; la velocidad media observada es de 0,1216 m/s.
- Estabilidad en pruebas cortas: 0,0 caídas por minuto en cinco episodios de 20 segundos.
- Aprendizaje desde cero: la política se entrenó sin demostraciones ni inicialización con expertos.
- Exportación del actor: el fichero `actor.json` permite inspeccionar o reimplementar la política fuera de Stable-Baselines3.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas, visión, audio ni capacidades multilingües.

## Casos de uso

- Docencia y divulgación de RL: sirve como ejemplo completo y reproducible de un pipeline PPO en Stable-Baselines3, con hiperparámetros, tiempos de entrenamiento y métricas de evaluación declarados; útil para cursos de aprendizaje por refuerzo.
- Prototipado de controladores de locomoción: punto de partida para experimentar con recompensas, comandos de velocidad y curricula antes de escalar a políticas mayores.
- Validación de entornos `link01-gym`: permite comprobar que el simulador `Link01Walk-v0` funciona correctamente y que las observaciones y acciones tienen las dimensiones esperadas (51 y 14).
- Benchmark interno de referencia: al tener métricas declaradas (2,432 m por episodio de 20 s, 0,1216 m/s, 0 caídas/min), puede usarse como línea base para comparar nuevas políticas sobre el mismo entorno.
- Simulación de gemelo digital: integrar el actor exportado (`actor.json`) en un bucle de simulación propio para estudiar el comportamiento articular del bípedo sin depender de Stable-Baselines3.
- Demostración de bajo coste computacional: ilustra que un entrenamiento de locomoción básica puede completarse en unos 21 minutos con 8 entornos paralelos, útil para justificar asignación de recursos en proyectos pequeños.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`), sobre el entorno `Link01Walk-v0` con comandos de 0,18 m/s, 5 episodios de 20 segundos:

| Metrica | Valor |
|---|---|
| Distancia por episodio de 20 s | 2,432 m |
| Velocidad media de avance | 0,1216 m/s |
| Caidas por minuto | 0,0 |

No se han publicado otros resultados de benchmarks en la información disponible, ni comparaciones con políticas de referencia sobre el mismo entorno.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; la red es un MLP de decenas de miles de parámetros (capas 64/64 y 256/256), por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requieren; cualquier GPU con soporte CUDA acelera la simulación MuJoCo, pero la inferencia de la política es trivial en CPU.
- Cabe en GPU consumer: sí, en cualquier modelo (GTX 1060 en adelante, RTX 3060, RTX 4090, etc.), aunque no es necesario.
- Opciones de despliegue: Stable-Baselines3 (`PPO.load` junto con `VecNormalize.load`), exportación del actor vía `actor.json` a NumPy u ONNX si se reimplementa, y el simulador `link01-gym` sobre MuJoCo para ejecutar el bucle completo.
- Latencia y throughput: no disponibles. El coste dominante no es la red neuronal sino el paso de simulación física en MuJoCo.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada políticas comparables entrenadas sobre el mismo entorno `Link01Walk-v0`, ni se dispone de datos de otros agentes de locomoción bípeda con los que contrastar parámetros, contexto o rendimiento de forma rigurosa.

## Limitaciones y advertencias

- Resultados no verificados: las tres métricas del `model-index` están marcadas como `verified: false`; proceden del propio autor y no de una evaluación independiente.
- Rendimiento modesto: la velocidad media (0,1216 m/s) queda por debajo del comando de 0,18 m/s, lo que indica un seguimiento imperfecto de la consigna.
- Evaluación muy limitada: cinco episodios de 20 segundos no permiten extrapolar robustez a episodios largos, terrenos variables o perturbaciones externas.
- Sin validación en hardware real: todo el entrenamiento y la evaluación son en simulación MuJoCo; no hay evidencia de transferencia sim-to-real al robot físico LINK-01.
- Dependencia del `vecnormalize.pkl`: cargar el modelo sin las estadísticas de normalización producirá comportamientos incorrectos.
- Licencia no disponible: no se declara licencia, por lo que el uso comercial queda en un limbo legal y requiere contactar con el autor.
- Ámbito muy restringido: no es un modelo de lenguaje, no procesa texto, no soporta tool calling ni agentes multi-paso; no debe evaluarse con los criterios habituales de un LLM.
- Sesgos y alucinación: no aplican en el sentido habitual de un modelo generativo, pero sí existe riesgo de sobreajuste al entorno y a la distribución de comandos de entrenamiento.
- Idiomas: no aplica; no hay soporte lingüístico de ningún tipo.
- Madurez: 0 descargas y 0 likes, repositorio de 0,0 GB y creado en noviembre de 2026; es un artefacto experimental sin adopción comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lucaskim72/connectailab-rl-lucasbrain-v1-link01-walk-ppo
- Stable-Baselines3 (librería de entrenamiento): https://github.com/DLR-RM/stable-baselines3
- MuJoCo (simulador físico): https://mujoco.org/
- Contacto del autor: lucaskim72@gmail.com
