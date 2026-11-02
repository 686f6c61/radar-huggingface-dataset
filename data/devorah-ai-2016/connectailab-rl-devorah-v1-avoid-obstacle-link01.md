# devorah-ai-2016/connectailab-rl-devorah-v1-avoid-obstacle-link01

## Resumen

LINK-01 es una política de decisión entrenada con PPO para una tarea concreta de navegación robótica: evitar obstáculos en un simulador MuJoCo ejecutado en el navegador (mujoco-wasm 3.16.0). No es un modelo de lenguaje: es una red neuronal pequeña (perceptrón de 21 entradas, dos capas ocultas de 64 unidades y 5 salidas) que cada 0,5 segundos elige entre cinco acciones discretas de alto nivel (avanzar, girar a la izquierda, girar a la derecha, rotar en el sitio a izquierda o derecha). La locomoción propiamente dicha la resuelve una red separada preentrenada (CPG más imitación, fija, no entrenada con PPO).

El modelo lo publica el desarrollador independiente Devorah (NEXA Physical AI) en el marco del proyecto CONNECT AI LAB / AI CITY BUILDERS, con fines educativos y de investigación en simulación. Su interés es acotado pero claro: demuestra un ciclo completo de entrenamiento por refuerzo en el navegador (entorno, recompensas, PPO con Stable-Baselines3 y exportación de la política a un `brain.json` de NumPy) en 78 segundos y 20.480 decisiones, alcanzando un 85 % de éxito en la prueba oficial de 20 episodios sobre cursos aleatorios.

Es relevante como referencia reproducible de RL aplicado a robótica simulada y como ejemplo de formato de intercambio de políticas ligeras, no como componente de producción. Los pesos se distribuyen como JSON numérico, no como safetensors ni GGUF, y la licencia Apache 2.0 permite reutilización y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) con activación tanh; política de decisión sobre acciones discretas |
| Parametros totales | 21→64→64→5 (aprox. 5.893 parámetros, calculado a partir de las dimensiones publicadas; el autor no lo indica) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; la observación es un vector de 21 valores por paso) |
| Tipos de cuantizacion | no disponible (pesos en JSON de precisión nativa; no se publican variantes cuantizadas) |
| Idiomas soportados | ko (coreano, según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | JSON (`brain.json`), consumido con NumPy mediante la librería `connect-tycoon` |

## Arquitectura y entrenamiento

La política es una MLP de tres capas (21 entradas, 64 y 64 ocultas, 5 salidas) con activación tanh. La observación de 21 dimensiones combina la distancia al objetivo, el seno y coseno de la dirección al objetivo, once lecturas de sensores de distancia entre -100° y +100°, velocidad frontal, velocidad de giro y las cinco últimas acciones seleccionadas (historial de decisión). El espacio de acciones es discreto de tamaño 5.

El entrenamiento usa PPO con la configuración de Stable-Baselines3: 10 actualizaciones, 20.480 decisiones, learning rate 0,0003, γ 0,97, GAE λ 0,95, coeficiente de entropía 0,01, clip 0,2, 8 entornos en paralelo, semilla 575 y 78 segundos de cómputo. La función de recompensa pondera progreso (+4,5), alcance del objetivo (+10,5), colisión (-2), penalización temporal (-0,05), caída (-5) y salida del área (-3,5). La curva de validación muestra un salto brusco: 0 % de éxito hasta las 8.192 decisiones, 75 % en 10.240, 88 % en 12.288 y 100 % en validación desde 16.384, mientras que la prueba oficial sobre cursos aleatorios se queda en 85 %. No se documenta ningún uso de RLHF, DPO ni datos supervisados para esta política.

## Capacidades

- Selección de acción discreta de alto nivel (avanzar, izquierda, derecha, rotar izquierda, rotar derecha) cada 0,5 segundos a partir de un vector de observación de 21 valores.
- Navegación reactiva con evitación de obstáculos en cursos 2D simulados en MuJoCo (mujoco-wasm 3.16.0).
- Uso de memoria corta de decisión: las cinco acciones previas forman parte de la observación, lo que permite evitar oscilaciones.
- Integración con el pipeline `connect-tycoon` (`WorldBrain.from_file(...)` y `brain.act(obs)`), cargable en el entorno web de CONNECT AI WORLD.
- Reejecución de la prueba oficial subiendo el `brain.json` al entrenador web.
- No soporta tool calling, function calling, agentes multi-paso, generación de texto, código, matemáticas, visión ni audio.

## Casos de uso

- Docencia de refuerzo profundo: reproducir el ciclo completo (diseño de recompensa, PPO, evaluación con semillas fijas) en una sesión de menos de dos minutos, útil para cursos introductorios de RL.
- Laboratorio de robótica simulada: usar la política como baseline de navegación reactiva en MuJoCo antes de probar controladores más complejos.
- Investigación en diseño de recompensas: modificar los pesos (progreso, colisión, tiempo, caída) y comparar curvas de aprendizaje con la publicada.
- Evaluación de robustez ante aleatorización de entornos: la brecha entre el 100 % en validación y el 85 % en cursos aleatorios (semillas 91001–91020) sirve como caso de estudio de sobreajuste al curso de entrenamiento.
- Prototipado de interfaces de decisión de alto nivel: separar la política de decisión de la política de locomoción (CPG más MLP de imitación) es un patrón reutilizable en robots con patas simulados como el SO-101.
- Material de demostración en el navegador: integrar el `brain.json` en el entrenador web de CONNECT AI WORLD para visualizar decisiones en tiempo real sin infraestructura de GPU.
- Pruebas de formato de intercambio de políticas ligeras: el JSON numérico es un ejemplo de serialización portable para políticas de pocos miles de parámetros.

## Benchmarks y rendimiento

| Prueba | Métrica | Valor | Semillas | Huella | Motor |
|---|---|---|---|---|---|
| Prueba oficial (20 episodios, cursos aleatorios) | Tasa de éxito | 85 % | 91001–91020 | `07d367ea` | mujoco-wasm 3.16.0 |
| Prueba oficial (20 episodios, cursos aleatorios) | Recompensa media | 18,45 | 91001–91020 | `07d367ea` | mujoco-wasm 3.16.0 |

Curva de validación publicada (tasa de éxito por número de decisiones): 0 % en 0, 2.048, 4.096, 6.144 y 8.192; 75 % en 10.240; 88 % en 12.288 y 14.336; 100 % en 16.384, 18.432 y 20.480. No se han publicado comparaciones con MMLU, HumanEval, GSM8K ni otros benchmarks estándar, que no aplican a este tipo de modelo.

## Requisitos de hardware

- Inferencia en CPU: la política tiene del orden de 5.900 parámetros y se evalúa con NumPy; no requiere GPU.
- VRAM estimada: despreciable (menos de 1 MB para los pesos en JSON; el coste real lo impone el simulador MuJoCo).
- GPU recomendadas: ninguna para la política; para el entrenamiento completo (78 segundos, 8 entornos en paralelo) basta una CPU moderna o cualquier GPU consumer.
- Cabe en cualquier GPU consumer y en entornos sin GPU, incluido el navegador mediante mujoco-wasm.
- Opciones de despliegue: librería `connect-tycoon` (`pip install "connect-tycoon @ git+https://github.com/wonseokjung/connect-tycoon"`), carga directa de `brain.json` con NumPy y el entrenador web de CONNECT AI WORLD.
- Latencia y throughput: no disponibles de forma explícita; la cadencia de decisión es de una acción cada 0,5 segundos por diseño.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LINK-01 avoid_obstacles (este modelo) | MLP PPO, acciones discretas | ~5.900 | no aplica (obs. de 21 valores) | 85 % de éxito en 20 episodios aleatorios | Apache 2.0 | Hugging Face, `brain.json` |
| Políticas PPO de Stable-Baselines3 (referencia genérica) | MLP PPO | configurable | no aplica | depende del entorno | MIT | pip, GitHub |
| Políticas de MuJoCo Gymnasium (p. ej., Ant, HalfCheetah con PPO/SAC) | MLP PPO/SAC, acciones continuas | variable | no aplica | depende del entorno y presupuesto de entrenamiento | MIT / BSD | pip, GitHub |

No se dispone de comparaciones publicadas con otros modelos de la misma tarea de evitación de obstáculos en este simulador; los datos de las alternativas genéricas no son directamente equiparables.

## Limitaciones y advertencias

- Modelo educativo de simulación: el propio autor advierte de que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- Sobreajuste al curso de entrenamiento: entrenado en un único curso (`ded0f037`, "mi curso 2"), con 100 % en validación pero 85 % en cursos aleatorios.
- Espacio de acciones muy restringido (cinco acciones discretas) y observación de 21 valores; no generaliza a otros dominios ni a control continuo.
- No es un modelo de lenguaje: no genera texto, no razona simbólicamente y no soporta tool calling ni agentes.
- Dependencia de la política de locomoción externa (CPG más MLP de imitación, fija); el rendimiento conjunto depende de esa red no incluida en este repositorio.
- Riesgo de fallo silencioso: no se documentan métricas de calibración ni detección de estados fuera de distribución.
- Idiomas: la documentación está en coreano; no hay versión en castellano ni en inglés.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y aviso de cambios; no se especifican restricciones adicionales.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/devorah-ai-2016/connectailab-rl-devorah-v1-avoid-obstacle-link01
- Repositorio GitHub CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entrenador web CONNECT AI WORLD: https://www.ezerai.xyz/robot-lab/world/
- YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
