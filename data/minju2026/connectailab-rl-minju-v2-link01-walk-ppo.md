# minju2026/connectailab-rl-minju-v2-link01-walk-ppo

## Resumen

`connectailab-rl-minju-v2-link01-walk-ppo` es un modelo de aprendizaje por refuerzo (RL) entrenado con PPO mediante la librería Stable-Baselines3 para controlar la locomoción bípeda del robot simulado LINK-01 v2 en el entorno `Link01Walk-v0`, construido sobre MuJoCo a través de `link01-gym`. No es un modelo de lenguaje: es una política de control que mapea observaciones de 51 dimensiones a acciones de 14 dimensiones correspondientes a las articulaciones del robot, con una postura base de ±0,18 rad. Lo desarrolla el usuario `minju2026` en el marco del programa CONNECT AI LAB (AI CITY BUILDERS, curso 7 de RL).

El interés del modelo es acotado pero claro: documenta un experimento de locomoción bípeda desde cero con PPO, sin fases previas de imitación ni currículo explícito, y publica métricas verificables del resultado. Los números declarados son modestos: 0,1 m recorridos por episodio de 20 s, una velocidad media de 0,005 m/s frente a una comandada de 0,18 m/s, y 0 caídas por minuto. Es decir, la política se mantiene en pie y avanza muy lentamente, sin alcanzar la consigna de velocidad.

La relevancia es, por tanto, la de un artefacto reproducible de investigación docente: pesos en formato `model.zip` de SB3, normalizador `vecnormalize.pkl` y una descripción de actor en `actor.json`, con hiperparámetros declarados (500 000 pasos, 29,5 minutos de entrenamiento, lr 3e-4, clip 0,2). No hay información sobre licencia, idiomas ni benchmarks comparativos con otras políticas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de RL (PPO) sobre red neuronal, entrenada con Stable-Baselines3; topología de capas no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); observación de 51 dimensiones por paso |
| Tipos de cuantización | no disponible (formato de pesos SB3, no cuantizable de forma estándar) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (Stable-Baselines3), `vecnormalize.pkl` (normalizador de observaciones), `actor.json` (descripción del actor) |

Otros datos técnicos declarados: espacio de acciones de 14 dimensiones (14 articulaciones), postura base ±0,18 rad, entorno `Link01Walk-v0` de `link01-gym` sobre MuJoCo, y comando de velocidad de prueba de 0,18 m/s.

## Arquitectura y entrenamiento

El modelo es una política PPO (Proximal Policy Optimization) implementada con Stable-Baselines3. La observación es un vector de 51 dimensiones y la acción un vector continuo de 14 dimensiones, una por articulación, con la postura por defecto acotada a ±0,18 rad. El entrenamiento se realizó desde cero (sin inicialización a partir de una política de imitación ni de un currículo declarado) durante 500 000 pasos, con un tiempo de cómputo declarado de 29,5 minutos, tasa de aprendizaje 3e-4 y coeficiente de recorte (`clip`) de 0,2. Se acompaña de un `vecnormalize.pkl`, lo que indica normalización de observaciones (y presumiblemente de recompensas) durante el entrenamiento, un detalle crítico para reproducir la inferencia.

No se especifican en la información disponible el tamaño de la red (número de capas y unidades), la función de recompensa, la composición del currículo, el número de entornos paralelos ni el hardware empleado. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.), lo cual es esperable en una política de control de este tipo. El resultado del entrenamiento es una política que evita caídas (0,0 caídas/minuto) pero avanza a una velocidad muy inferior a la comandada, lo que sugiere una convergencia parcial hacia el objetivo de velocidad.

## Capacidades

- Control de locomoción bípeda en simulación: genera comandos articulares continuos de 14 dimensiones para el robot LINK-01 v2 en el entorno `Link01Walk-v0`.
- Mantenimiento del equilibrio: la política declarada no registra caídas durante los episodios de evaluación (0,0 caídas/minuto).
- Desplazamiento hacia delante limitado: avanza 0,1 m por episodio de 20 s, con una velocidad media de 0,005 m/s.
- Integración con el ecosistema Stable-Baselines3: los pesos en `model.zip` pueden cargarse con `PPO.load()` y evaluarse con el normalizador asociado.
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de pensamiento; no es un modelo generativo de texto.
- No se declaran capacidades de generalización a otros entornos, comandos de velocidad distintos de 0,18 m/s ni transferencia sim-to-real.

## Casos de uso

- Reproducción de experimentos docentes de RL: el paquete `model.zip` + `vecnormalize.pkl` permite recargar la política con `PPO.load()` y reproducir las métricas declaradas en `Link01Walk-v0`, útil como material de referencia en cursos de aprendizaje por refuerzo.
- Línea base para comparativas de algoritmos: al ser un PPO desde cero con hiperparámetros explícitos (500 000 pasos, lr 3e-4, clip 0,2), sirve como punto de partida para medir mejoras con SAC, TD3 o PPO con recompensas moldeadas.
- Estudio de curvas de recompensa y estabilidad: la combinación de 0 caídas y velocidad muy baja es un caso interesante para analizar políticas que priorizan la estabilidad sobre el objetivo de velocidad, y para diseñar funciones de recompensa que corrijan ese sesgo.
- Validación de pipelines de normalización: el uso de `vecnormalize.pkl` lo convierte en un ejemplo práctico para depurar errores habituales al desplegar políticas SB3 con observaciones normalizadas.
- Prototipado de control de bajo nivel en simulación: permite probar integraciones con MuJoCo y `link01-gym` antes de invertir en políticas más costosas o en transferencia a hardware.
- Docencia sobre evaluación en RL: las métricas declaradas (distancia por episodio, velocidad media, caídas por minuto) son un ejemplo de protocolo de evaluación reproducible con 5 episodios de 20 s.
- No es adecuado para despliegue en robótica real, atención al cliente, generación de código ni ninguna tarea de procesamiento de lenguaje.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Tarea | Entorno | Métrica | Valor |
|---|---|---|---|
| Walking | Link01Walk-v0 | Distancia por episodio de 20 s (m) | 0,1 |
| Walking | Link01Walk-v0 | Velocidad media hacia delante (m/s) | 0,005 |
| Walking | Link01Walk-v0 | Caídas por minuto | 0,0 |

Protocolo declarado: comando de 0,18 m/s, 5 episodios de 20 s cada uno. No se han publicado en la información disponible resultados comparativos con otras políticas ni métricas adicionales (recompensa media, varianza entre episodios, error de seguimiento de velocidad).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del artefacto (repo de 0,0 GB) y la naturaleza de la política, es probable que quepa en cualquier GPU consumer, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible. Una política PPO de este tipo suele ejecutarse en CPU sin problema, pero no se documenta.
- Cabe en GPU consumer: no confirmado; el artefacto es de tamaño despreciable, por lo que la limitación real sería el simulador MuJoCo, no la red.
- Opciones de despliegue: carga mediante Stable-Baselines3 (`PPO.load("model.zip")`) junto con `VecNormalize.load("vecnormalize.pkl")`; requiere el entorno `Link01Walk-v0` de `link01-gym` y MuJoCo. No aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre políticas comparables en la documentación proporcionada. Como referencia categórica, cabría comparar con políticas PPO de locomoción en MuJoCo (por ejemplo, las publicadas en entornos estándar de Gym/MuJoCo), pero no se han facilitado datos de esos modelos, por lo que la comparación cuantitativa se marca como no disponible.

| Modelo | Parámetros | Contexto/observación | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-minju-v2-link01-walk-ppo | no disponible | 51 dims | 0,005 m/s; 0 caídas/min | no disponible | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento muy por debajo del objetivo: la velocidad media (0,005 m/s) es un 2,8 % de la comandada (0,18 m/s), y la distancia por episodio (0,1 m) es marginal; no debe presentarse como una política de locomoción funcional.
- Métricas no verificadas: los resultados de la model card están marcados como `verified: false`; no hay evaluación independiente.
- Sin información de licencia: no se puede confirmar el uso comercial ni la redistribución de los pesos; tratar como no apto para producción hasta aclararlo.
- Entorno específico: la política está acoplada a `Link01Walk-v0` y a la parametrización del robot LINK-01 v2; no hay evidencia de generalización a otras morfologías, comandos o condiciones.
- Dependencia del normalizador: cargar `model.zip` sin `vecnormalize.pkl` producirá comportamiento incorrecto; es un error frecuente y no se advierte explícitamente en la información disponible.
- Sin transferencia sim-to-real documentada: no hay datos sobre robustez ante ruido, latencia o dinámica real.
- Riesgo de sobreajuste al episodio de evaluación: solo se declaran 5 episodios de 20 s; la varianza no se reporta.
- No es un modelo de lenguaje: no debe evaluarse con MMLU, HumanEval, GSM8K ni métricas similares.
- Sesgos: no aplica en el sentido habitual; el sesgo relevante es el de la función de recompensa, que aparentemente prima la estabilidad sobre la velocidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/minju2026/connectailab-rl-minju-v2-link01-walk-ppo
- Stable-Baselines3 (librería de entrenamiento): https://github.com/DLR-RM/stable-baselines3
- MuJoCo (simulador): https://mujoco.org/
- PPO, paper original: https://arxiv.org/abs/1707.06347
- Repositorio `link01-gym` y material del curso CONNECT AI LAB: no disponible en la información proporcionada.
- Vídeo de replay (`replay.mp4`): referenciado en la model card, sin URL directa disponible.
