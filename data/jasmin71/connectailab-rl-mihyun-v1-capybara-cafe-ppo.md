# Jasmin71/connectailab-rl-mihyun-v1-capybara-cafe-ppo

## Resumen

`connectailab-rl-mihyun-v1-capybara-cafe-ppo` es un agente de aprendizaje por refuerzo (RL) entrenado con PPO mediante Stable-Baselines3 para resolver una tarea de navegación 3D multiobjetivo y servicio de mesas en un simulador propio. No es un modelo de lenguaje: es una política neuronal que controla un personaje (una capibara camarera) dentro de un entorno físico simulado en MuJoCo, con geometría modelada en Blender 5.2 mediante MCP. Lo desarrolla Jasmin71 en el marco de AI CITY BUILDERS y CONNECT AI LAB, como parte de un curso de RL.

El entorno, denominado `CapybaraWaiter-3D-Cafeteria-v3`, consiste en una cafetería de 3,5 m × 3,5 m con dos mesas-obstáculo centrales y cinco zonas de destino variables (noroeste, norte, noreste, este y sureste). El agente recibe un vector de estado de 12 números (posición relativa del objetivo, distancia, orientación codificada como coseno y seno, velocidad lineal, velocidad angular, coordenadas relativas de los dos obstáculos y fracción de tiempo restante) y emite dos acciones continuas: aceleración (`throttle ∈ [-1, 1]`) y giro (`steer ∈ [-1, 1]`).

Su relevancia es acotada pero ilustrativa: demuestra que un PPO estándar con 204.800 pasos de entrenamiento (unos 19,8 segundos en 8 entornos paralelos con `SubprocVecEnv`) puede aprender una política de navegación robusta a cambios de objetivo, con un 100 % de éxito en 50 episodios de evaluación y un tiempo medio de entrega de 1,29 segundos. Es un caso de estudio de simulación a medida, no un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal PPO (Stable-Baselines3); no se especifica la topología de capas en la información disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); estado de 12 dimensiones por paso |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (agente de control); la model card está redactada en coreano |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de 0,0 GB; librería `stable-baselines3`, probablemente `.zip` de SB3, sin confirmar) |

## Arquitectura y entrenamiento

El agente se entrena con PPO (Proximal Policy Optimization) implementado en Stable-Baselines3 sobre un entorno Gymnasium personalizado. El espacio de observación es un vector continuo de 12 dimensiones y el de acciones un vector continuo de 2 dimensiones, propio del control continuo. El entrenamiento se paraleliza con `SubprocVecEnv` sobre 8 instancias del simulador, acumulando 204.800 pasos en aproximadamente 19,8 segundos. El motor físico es MuJoCo y la geometría del entorno (cafetería pastel, mesas, capibara con 12.724 vértices) se modeló en Blender 5.2 a través de `blender-mcp`.

La función de recompensa combina cuatro términos: recompensa por acercamiento al objetivo (+25,0 × reducción de distancia), bonificación por entrega exitosa (+100,0), penalización por paso de tiempo (−0,03 por step, para evitar políticas de supervivencia pasiva) y penalización por colisión con mesas (−0,6). No se documenta uso de RLHF, DPO ni datos supervisados; es RL puro por interacción con el simulador. La innovación destacable es la variabilidad de objetivos entre episodios (cinco zonas), que fuerza a la política a generalizar la navegación en lugar de memorizar una ruta fija.

## Capacidades

- Control continuo de navegación 3D: propulsión y giro con dos acciones reales.
- Navegación multiobjetivo: generaliza a cinco zonas de destino distintas dentro del mismo recinto.
- Evasión de obstáculos: dos mesas centrales tratadas como obstáculos con coordenadas relativas en el estado.
- Servicio de mesas: alcanzar la mesa objetivo y completar la entrega con recompensa de éxito.
- Política de tiempo: el estado incluye la fracción de tiempo restante, lo que permite ajustar la agresividad del recorrido.
- No soporta tool calling, function calling, agentes multi-paso, ni capacidades multilingües o de visión: es un agente de control, no un modelo generativo.
- No dispone de modo de razonamiento explícito (thinking mode) ni de entrada multimodal.

## Casos de uso

- Docencia de RL con PPO: el modelo sirve como referencia reproducible para enseñar el ciclo entrenamiento-evaluación en control continuo, con un tiempo de entrenamiento de menos de 20 segundos en hardware modesto.
- Prototipado de simuladores a medida: el pipeline Blender 5.2 MCP + MuJoCo es un ejemplo de cómo generar un entorno 3D propio y exportarlo a un motor físico para RL, reutilizable en otros dominios.
- Benchmark de robustez a cambios de objetivo: las cinco zonas permiten medir la generalización de políticas de navegación sin reentrenar, útil para comparar algoritmos (PPO frente a SAC o TD3).
- Navegación de robots de servicio en interiores: el diseño de estado (posición relativa, distancia, orientación, obstáculos) es trasladable a un robot móvil diferencial en un plano, aunque requeriría validación en hardware real.
- Evaluación de recompensas con penalización temporal: el término −0,03/step es un ejemplo concreto de cómo desincentivar políticas pasivas, aplicable al diseño de recompensas en tareas de entrega.
- Base para experimentos de currículo y domain randomization: al ser un entorno pequeño y rápido, permite iterar sobre variaciones de obstáculos y posiciones de destino para estudiar transferencia.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados de forma independiente):

| Métrica | Valor | Contexto |
|---|---|---|
| Tasa de éxito (50 episodios, 5 zonas) | 100 % (50/50) | Evaluación con objetivos en cinco zonas |
| Tiempo medio de entrega | 1,29 s | Por episodio exitoso |
| Pasos de entrenamiento | 204.800 | 8 entornos paralelos |
| Tiempo de entrenamiento | ~19,8 s | `SubprocVecEnv` con 8 instancias |
| Colisiones con mesas | 0 | Durante la evaluación de 50 episodios |

No se han publicado resultados comparativos con otros algoritmos (SAC, TD3, A2C) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (0,0 GB) y la naturaleza del modelo (política MLP pequeña), la inferencia cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; para el entrenamiento, cualquier GPU con soporte CUDA acelera SB3, aunque con 204.800 pasos el entrenamiento en CPU es viable.
- Cabe en GPU consumer: sí, con total seguridad, dado el tamaño reducido de la política; también en CPU.
- Opciones de despliegue: Stable-Baselines3 (`model.predict`), Gymnasium para el entorno, MuJoCo para la física. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma explícita; el tiempo medio de entrega de 1,29 s da una idea del horizonte temporal de la política, no de la latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `connectailab-rl-mihyun-v1-capybara-cafe-ppo` | PPO (SB3) | `CapybaraWaiter-3D-Cafeteria-v3` (MuJoCo + Blender) | 204.800 pasos, ~19,8 s | no disponible | Hugging Face |
| `Jasmin71/connectailab-rl-mihyun-v1-lunarlander` | RL (mismo autor) | LunarLander | no disponible | no disponible | Hugging Face |
| `Jasmin71/connectailab-rl-mihyun-v1-link01` | RL + PEFT/LoRA | Robótica / toma de decisiones | no disponible | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que la comparación se limita a tipo, entorno y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un agente de control en un simulador sintético, los sesgos relevantes serían los del diseño del entorno y de la función de recompensa.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de sobreajuste al simulador; el 100 % de éxito se ha medido en el mismo entorno de entrenamiento y con objetivos dentro de las cinco zonas definidas.
- Limitaciones de contexto o idioma: el estado está fijado a 12 dimensiones y el recinto a 3,5 m × 3,5 m; no hay evidencia de generalización a otros mapas, tamaños de cafetería u obstáculos distintos.
- Restricciones de licencia: la licencia no está disponible, lo que impide confirmar el uso comercial; debe consultarse con el autor antes de cualquier despliegue productivo.
- Caveats para producción: los resultados de benchmark están marcados como no verificados (`verified: false`); el repositorio tiene 0 descargas y 0 likes, sin validación externa; la model card está en coreano y los enlaces a vídeos y figuras pueden no ser accesibles de forma estable; no se documenta la topología de red ni el formato exacto de los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jasmin71/connectailab-rl-mihyun-v1-capybara-cafe-ppo
- Modelo comparable del mismo autor (LunarLander): https://huggingface.co/Jasmin71/connectailab-rl-mihyun-v1-lunarlander
- Modelo comparable del mismo autor (link01, Apache-2.0): https://huggingface.co/Jasmin71/connectailab-rl-mihyun-v1-link01
