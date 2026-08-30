# SionJang/lunarlander-v3-double-dqn

## Resumen

El modelo `SionJang/lunarlander-v3-double-dqn` es un agente de aprendizaje por refuerzo (RL) entrenado con el algoritmo Double DQN para resolver el entorno `LunarLander-v3` de Gymnasium. El autor, SionJang, implementa desde cero en PyTorch una red Q con doble red (red de comportamiento y red objetivo), buffer de experiencia y actualización suave de la red objetivo, sin depender de frameworks RL como stable-baselines3. El agente se entrenó durante 1000 episodios en CPU (Intel i7-11800H) en aproximadamente 28 minutos, alcanzando una recompensa media de 223.14 ± 84.58 sobre 100 episodios de evaluación.

La relevancia de este modelo radica en que constituye un ejemplo didáctico y reproducible de una implementación de Double DQN, con un repositorio que incluye scripts de entrenamiento, evaluación, grabación de GIF y un panel web en tiempo real. Aunque el entorno es específico (control de un módulo lunar), el código sirve como base para experimentar con variantes de DQN, comparar estrategias de exploración o modificar la arquitectura de la red. El modelo se distribuye bajo licencia MIT, lo que facilita su uso académico y de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feedforward 8 → 128 → 128 → 4 (ReLU) |
| Parametros totales | No disponible (arquitectura pequeña, ~18K parámetros estimados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (observación continua de 8 dimensiones, sin tokens) |
| Tipos de cuantizacion | No disponible (pesos en punto flotante, formato .pth) |
| Idiomas soportados | No aplica (agente RL, no modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

El agente utiliza una red Q de tres capas totalmente conectadas con activación ReLU: entrada de 8 valores (posición, velocidad, ángulo, velocidad angular y contacto con las piernas), dos capas ocultas de 128 neuronas y salida de 4 acciones discretas (no hacer nada, empujar con el motor izquierdo, motor principal o motor derecho). Se aplica el algoritmo Double DQN: la red de comportamiento selecciona la acción y la red objetivo evalúa su valor, reduciendo la sobreestimación típica del DQN estándar.

El entrenamiento se realizó durante 1000 episodios (máximo 1000 pasos por episodio) con las siguientes configuraciones: optimizador Adam con tasa de aprendizaje 5e-4, función de pérdida Huber (smooth L1) con recorte de gradiente a 10, buffer de experiencia de 100.000 transiciones y lotes de 64 muestras, aprendiendo cada 4 pasos. La red objetivo se actualiza con un factor suave τ = 0.001 y el factor de descuento γ = 0.99. La exploración ε decae de 1.0 a 0.05 multiplicando por 0.995 cada episodio. El autor destaca que la implementación parte de un tutorial de DQN de estilo Udacity, con correcciones de imports, conversión a Double DQN, aumento del tamaño de capa oculta de 64 a 128 y adición de métricas de calidad de aterrizaje.

## Capacidades

- Control de un módulo lunar en el entorno `LunarLander-v3` de Gymnasium, con observaciones continuas (posición, velocidad, ángulo) y acciones discretas.
- Política determinista tras el entrenamiento (ε=0) capaz de aterrizar con una tasa de éxito del 74% en el checkpoint principal y del 84% en el checkpoint de aterrizaje suave.
- Incluye un sistema de puntuación de "calidad de aterrizaje" (0-100) que evalúa centralidad, suavidad de contacto, horizontalidad y consumo de combustible, algo no presente en la recompensa del entorno.
- Proporciona scripts de evaluación, visualización web en tiempo real y grabación de GIF, lo que facilita la inspección del comportamiento del agente.
- No es un modelo de lenguaje ni multimodal: sus capacidades se limitan exclusivamente a la toma de decisiones secuenciales en el entorno simulado.

## Casos de uso

- Enseñanza de aprendizaje por refuerzo: el modelo y su código sirven como ejemplo práctico de implementación de Double DQN, con todos los componentes (buffer, redes, ε-greedy) visibles y modificables. Un estudiante puede ejecutar `train.py` para reproducir el entrenamiento y `evaluate.py` para medir el rendimiento.
- Comparación de variantes de DQN: al ser una implementación limpia, se puede modificar para probar Dueling DQN, Priorized Experience Replay o cambios de hiperparámetros, y comparar las métricas (recompensa media, tasa de éxito, calidad de aterrizaje) con los resultados publicados.
- Investigación de estrategias de exploración: el decaimiento de ε y la política determinista final se pueden analizar para estudiar el equilibrio entre exploración y explotación en problemas de control continuo.
- Prototipado de paneles de monitorización: el dashboard web incluido demuestra cómo visualizar en tiempo real el progreso de entrenamiento, curvas de recompensa y métricas auxiliares, útil para proyectos de RL aplicados.
- Benchmark educativo de entornos Gymnasium: el modelo puede usarse como referencia en tutoriales o ejercicios para verificar que una implementación propia de DQN alcanza resultados comparables en `LunarLander-v3`.
- Base para transferencia a entornos similares: aunque el modelo está fijado al entorno, la arquitectura de red y el bucle de entrenamiento pueden adaptarse a otros problemas de control con observaciones de baja dimensión y acciones discretas, como `CartPole` o `MountainCar`.

## Benchmarks y rendimiento

El autor declara en la model card los siguientes resultados de evaluación sobre 100 episodios del agente entrenado (ε=0, semilla fija):

| Checkpoint | Recompensa media | Tasa de éxito | Calidad de aterrizaje (0-100) |
|---|---|---|---|
| `lunarlander_dqn.pth` (principal) | 223.14 ± 84.58 | 74% | 61.3 |
| `lunarlander_dqn_softlanding.pth` | 203.30 ± 62.41 | 84% | 64.5 |

Además, durante el entrenamiento (1000 episodios) se superó el umbral de 200 puntos de recompensa media en el episodio 498, y el mejor promedio móvil de 100 episodios fue de 260.5 puntos con una tasa de éxito del 97-98% (en la fase de entrenamiento con ε=0.05). No se han publicado resultados en otros benchmarks estándar (MMLU, HumanEval, GSM8K) porque el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- Inferencia: requiere recursos mínimos; la red tiene solo unas 18.000 parámetros, por lo que puede ejecutarse en cualquier CPU moderna sin necesidad de GPU. El entorno `LunarLander-v3` renderizado en modo humano necesita una ventana gráfica, pero la inferencia en sí es trivial.
- Entrenamiento: el autor usó una CPU Intel i7-11800H (sin CUDA) y tardó unos 28 minutos en completar 1000 episodios. Con GPU se aceleraría considerablemente, aunque no es necesario.
- Memoria: el buffer de experiencia de 100.000 transiciones con 8 entradas y 4 acciones ocupa unos pocos MB en RAM; el modelo completo cabe en menos de 1 MB.
- Despliegue: al ser un script de PyTorch, se puede integrar en entornos de simulación Gymnasium. No se proporcionan versiones en GGUF u otros formatos, ni soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo generativo de texto.
- Latencia: cada paso de decisión (forward pass de la red) es del orden de microsegundos o milisegundos en CPU, muy inferior al tiempo de simulación del entorno.

## Comparativa con modelos similares

En Hugging Face existen otros modelos para `LunarLander-v3` basados en variantes de DQN, aunque no se dispone de métricas oficiales comparables más allá de las declaradas por cada autor.

| Modelo | Algoritmo | Recompensa media declarada | Tasa de éxito | Licencia |
|---|---|---|---|---|
| `SionJang/lunarlander-v3-double-dqn` (este) | Double DQN | 223.14 ± 84.58 | 74% | MIT |
| `hwihwalab/lunarlander-v3-d3qn` | Dueling Double DQN (D3QN) | No disponible | No disponible | MIT |
| `allen73/lunarlander-v3-dqn-physical-ai` | Double Dueling DQN | No disponible | No disponible | MIT |

No se dispone de datos de rendimiento de los modelos alternativos en el momento de redactar esta ficha, por lo que no es posible establecer una comparación cuantitativa. El modelo de SionJang destaca por su transparencia en la documentación y por incluir métricas adicionales de calidad de aterrizaje.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para el entorno `LunarLander-v3`; no generaliza a otros entornos ni tareas de control, y carece de cualquier capacidad de lenguaje o razonamiento simbólico.
- La recompensa media presenta una alta variabilidad (±84.58), lo que indica sensibilidad a la semilla aleatoria; los resultados pueden diferir en ejecuciones independientes.
- El principal modo de fallo es el agotamiento del tiempo (1000 pasos) sobrevolando la zona de aterrizaje sin completar el descenso, especialmente en el checkpoint principal. El checkpoint de aterrizaje suave reduce esta tendencia pero sacrifica recompensa media.
- La política determinista (ε=0) puede no ser robusta ante perturbaciones en el entorno o condiciones iniciales diferentes a las usadas en la evaluación.
- El código se basa en un tutorial de DQN (estilo Udacity) y ha sido modificado con ayuda de Claude Code; aunque el autor lo documenta, no es una implementación desde cero y puede contener errores no detectados.
- No se proporcionan pesos en formatos alternativos (ONNX, TorchScript, GGUF), lo que limita su integración en pipelines que requieran otros formatos.
- La licencia MIT permite uso comercial, pero el modelo no tiene valor productivo directo más allá de su utilidad educativa y de investigación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SionJang/lunarlander-v3-double-dqn
- Modelo alternativo (D3QN): https://huggingface.co/hwihwalab/lunarlander-v3-d3qn
- Modelo alternativo (Double Dueling DQN): https://huggingface.co/allen73/lunarlander-v3-dqn-physical-ai
- Repositorio GitHub con implementación D3QN similar: https://github.com/PavDrg/D3QN_Lunar_lander
- Repositorio GitHub con DQN para LunarLander: https://github.com/wtcherr/lunar-lander-dqn
- Notebook Colab de DQN para Lunar Lander: https://colab.research.google.com/github/kuds/rl-lunar-lander/blob/main/%5BLunar%20Lander%5D%20Deep%20Q-Network%20(DQN).ipynb
