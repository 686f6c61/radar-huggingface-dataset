# oemerfurkan/subway-surfers-rl

## Resumen

`oemerfurkan/subway-surfers-rl` es un agente de aprendizaje por refuerzo (RL) que juega al juego Subway Surfers en una ventana real de Chromium, sin usar ninguna API interna del juego. El entorno se controla mediante Playwright sobre el protocolo CDP (Chrome DevTools Protocol) y el estado del juego se lee directamente de los píxeles de la pantalla, de modo que la política observa exactamente lo mismo que vería una persona. El modelo está desarrollado por oemerfurkan y publicado bajo licencia MIT.

El agente utiliza el algoritmo PPO (Proximal Policy Optimization) con una política convolucional (NatureCNN) de aproximadamente 2,6 millones de parámetros, implementada con la librería Stable-Baselines3. El entrenamiento se realizó durante 1.000.652 pasos en cuatro entornos paralelos, cada uno con su propio perfil de Chromium, y alcanzó una supervivencia media de 16,2 segundos en los últimos 100 episodios de entrenamiento. El repositorio incluye los pesos entrenados, la configuración del entorno y el código de entrenamiento, todo ello reproducible desde el repositorio de GitHub asociado.

La relevancia de este modelo radica en que demuestra un enfoque de RL puro basado en visión por computadora sobre un juego comercial real, sin acceso a la lógica interna, lo que lo convierte en un caso de estudio interesante para aplicaciones de automatización de navegador y control de agentes en entornos visuales complejos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PPO con ActorCriticCnnPolicy (NatureCNN) |
| Parametros totales | 2,6 millones |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica, es un agente de RL) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen como checkpoint de Stable-Baselines3) |
| Idiomas soportados | no disponible (no aplica, es un agente de juego) |
| Licencia | MIT |
| Formato de pesos | Checkpoint de Stable-Baselines3 (archivo ZIP) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura PPO con una política ActorCriticCnnPolicy basada en NatureCNN, una red convolucional diseñada originalmente para jugar a Atari. La observación consiste en una captura de pantalla de 84x120 píxeles en RGB, con cuatro fotogramas apilados para proporcionar aproximadamente 0,6 segundos de historial de movimiento. El espacio de acciones es discreto con cinco acciones posibles: izquierda, derecha, salto, deslizamiento y no operar. Las pulsaciones de teclas se envían a través de CDP, lo que permite ejecutar varias instancias en paralelo sin necesidad de que la ventana tenga el foco del sistema operativo.

El entrenamiento se realizó con 1.000.652 pasos en cuatro entornos paralelos, cada uno con su propio perfil de Chromium. La configuración incluye un rollout de 384 pasos por entorno (1536 muestras por actualización), un tamaño de lote de 256, 10 épocas por actualización, una tasa de aprendizaje de 2e-4, un coeficiente de entropía de 0,01, gamma de 0,99 y lambda GAE de 0,95. El entrenamiento se ejecutó en dispositivo MPS (Apple silicon) con Stable-Baselines3 2.9.0. El autor señala que se usaron 10 épocas por actualización deliberadamente porque cada paso del entorno cuesta unos 170 ms de tiempo real, lo que convierte las muestras en el recurso más caro. Una tasa de aprendizaje de 3e-4 provocaba que `approx_kl` superara el `target_kl` y truncara las épocas, mientras que un coeficiente de entropía de 0,0 colapsaba la política.

La función de recompensa otorga +0,1 por paso vivo, con un incremento de 0,0001 por paso hasta un máximo de +0,2, y -10 en caso de choque. Además, se aplica una pequeña penalización por cambios de dirección repetidos en una ventana corta de tiempo, pero no por una inversión única, ya que penalizarla enseñaba al agente a no cambiar de carril en absoluto. La detección del final de la partida se realiza mediante coincidencia de plantillas sobre el fotograma completo, complementada con una comparación de movimiento entre fotogramas para distinguir pantallas animadas que no son juego (como la revelación de premios).

## Capacidades

- Juego autónomo de Subway Surfers en un navegador Chromium real, sin acceso a la API interna del juego.
- Percepción visual basada en píxeles: la política procesa capturas de pantalla de 84x120 RGB con cuatro fotogramas apilados.
- Control de acciones discretas: izquierda, derecha, salto, deslizamiento y no operar.
- Ejecución en paralelo de múltiples instancias gracias al envío de teclas por CDP, sin necesidad de foco de ventana.
- Supervivencia media de 16,2 segundos por partida en los últimos 100 episodios de entrenamiento, con un episodio máximo de 493 pasos (aproximadamente 80 segundos).
- Reproducibilidad: la configuración de entrenamiento se incluye en el repositorio, lo que permite replicar el experimento.
- No incluye capacidades de tool calling, razonamiento multilingüe ni generación de texto; es un agente especializado en una tarea de control visual.

## Casos de uso

- Investigación en aprendizaje por refuerzo visual: el modelo sirve como banco de pruebas para estudiar algoritmos de RL en entornos visuales reales sin acceso a la lógica interna, útil para comparar PPO con otros métodos como DQN o SAC.
- Automatización de navegador mediante visión: el enfoque de leer el estado del juego desde píxeles y enviar acciones por CDP puede extrapolarse a otras tareas de automatización web donde no hay API disponible.
- Evaluación de políticas de control en tiempo real: el agente opera a una frecuencia de control de aproximadamente 6 acciones por segundo, limitada por la latencia de captura de pantalla, lo que permite estudiar los límites de reacción en entornos dinámicos.
- Desarrollo de agentes de juego para pruebas de software: el modelo puede utilizarse para probar la jugabilidad de builds de Subway Surfers en el navegador, detectando cambios de interfaz o regresiones en el comportamiento del juego.
- Educación en RL: el repositorio incluye el entorno, el código de entrenamiento y los pesos, lo que lo convierte en un recurso didáctico para enseñar PPO, diseño de recompensas y entrenamiento con múltiples entornos paralelos.
- Benchmark de rendimiento de hardware: al ser un modelo ligero (2,6 millones de parámetros) que se ejecuta en CPU o GPU modesta, puede usarse para medir el rendimiento de inferencia en diferentes dispositivos, incluidos Apple Silicon.

## Benchmarks y rendimiento

El autor declara en el model-index el siguiente resultado oficial:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | subway-surfers-browser | Supervivencia media (segundos) | 16,2 |

Además, la model card proporciona datos adicionales del entrenamiento:

| Metrica | Valor |
|---|---|
| Supervivencia media a 39k pasos | 5,8 s |
| Supervivencia media en los últimos 100 episodios | 16,2 s |
| Episodio mas largo en el tramo final | 493 pasos (~80 s) |
| Episodios terminados por deteccion de game-over | 83% |
| Episodios truncados por parada del proceso padre | 17% |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- El entrenamiento se realizó en dispositivo MPS (Apple silicon), lo que indica que el modelo puede entrenarse en hardware de consumo.
- Para inferencia, se necesita un navegador Chromium instalado y Playwright configurado, ademas de una conexion CDP.
- El modelo tiene 2,6 millones de parametros, por lo que la inferencia es ligera y puede ejecutarse en CPU sin problemas; no se especifican requisitos de VRAM.
- No se proporcionan datos de latencia ni throughput, pero la frecuencia de control del agente es de aproximadamente 6 acciones por segundo, limitada por la latencia de captura de pantalla (unos 170 ms por paso de entorno).
- Opciones de despliegue: el codigo de inferencia se ejecuta con `python play.py --model ppo/subway_surfers_ppo_1M.zip --episodes 20`, que abre el juego, ejecuta una politica determinista y reporta el tiempo de supervivencia por episodio.
- No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de datos cuantitativos de otros modelos de RL para Subway Surfers en la informacion proporcionada. Sin embargo, la busqueda web revela proyectos comparables:

| Proyecto | Algoritmo | Enfoque | Resultados publicados |
|---|---|---|---|
| oemerfurkan/subway-surfers-rl (este modelo) | PPO (NatureCNN) | Vision por pixeles en Chromium real | Supervivencia media 16,2 s |
| raazi29/SubwayAI | Double-DQN | Vision por pixeles en emulador BlueStacks | No disponible |
| rameshwar89/Subway_Surfer_RL_Model | RL basado en vision | No especificado | No disponible |
| gyawaliaadim/Subway-Surfers-AI | CNN supervisada | Vision en tiempo real a 15-20 FPS | No disponible |

La comparacion directa no es posible por falta de metricas comunes. Este modelo destaca por usar un navegador real (no un emulador) y por publicar la configuracion completa de entrenamiento.

## Limitaciones y advertencias

- El agente esta entrenado exclusivamente en la build de Poki del juego con un viewport de 400x750. Cambios en la build, el layout o la resolucion alteran los pixeles a los que esta ajustado y degradan el rendimiento.
- La frecuencia de control es de aproximadamente 6 acciones por segundo, limitada por la latencia de captura de pantalla. Obstaculos que requieran reacciones mas rapidas no son aprendibles con esta configuracion.
- La deteccion del final de la partida se basa en plantillas. Un cambio en la interfaz del sitio rompe los limites de episodio hasta que se recorten las plantillas de nuevo; el repositorio incluye una herramienta para ello.
- La funcion de recompensa solo codifica la supervivencia. El agente no recoge monedas ni usa potenciadores, y nada en la recompensa le pide hacerlo.
- Los pesos solo pueden cargarse con el pipeline de observacion del repositorio de codigo; cargarlos fuera de ese contexto fallara por la forma de la observacion.
- No se han evaluado sesgos ni riesgos de alucinacion, ya que no es un modelo de lenguaje.
- La licencia MIT permite uso comercial, pero el modelo depende de la build de Poki del juego, que puede tener sus propias restricciones de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oemerfurkan/subway-surfers-rl
- Repositorio de codigo y entrenamiento: https://github.com/oemerfurkan/subway-surfers-rl
- Proyecto SubwayAI (Double-DQN en BlueStacks): https://github.com/raazi29/SubwayAI
- Proyecto Subway_Surfer_RL_Model: https://github.com/rameshwar89/Subway_Surfer_RL_Model
- Proyecto Subway-Surfers-AI (CNN supervisada): https://github.com/gyawaliaadim/Subway-Surfers-AI
- Proyecto subway-surfers-AI-main: https://github.com/m4n4n-j/subway-surfers-AI-main
- Proyecto SubwaySurfers-AI (RL): https://github.com/Chinedu-E/SubwaySurfers-AI
