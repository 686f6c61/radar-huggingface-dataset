# leegoheun/lconnectailab-rl-duking-v1-lunarlander-dqn

## Resumen

`connectailab-rl-duking-v1-lunarlander-dqn` es un agente de aprendizaje por refuerzo profundo (Deep Reinforcement Learning) publicado por el usuario `leegoheun` en Hugging Face, desarrollado en el contexto del programa educativo CONNECT AI LAB en colaboración con AI CITY BUILDERS. No es un modelo de lenguaje: es una política neuronal entrenada con DQN (Deep Q-Network) para resolver el entorno `LunarLander-v3` de Gymnasium, en el que un módulo lunar debe aterrizar de forma controlada entre dos banderas.

El agente recibe un vector de estado de 8 dimensiones (posición x e y, velocidades x e y, ángulo de inclinación, velocidad angular y contacto de cada una de las dos patas) y emite una de cuatro acciones discretas (no hacer nada, encender motor izquierdo, encender motor principal central o encender motor derecho). La red es un perceptrón multicapa (MLP) muy pequeño de 8 → 128 → 128 → 4 con activaciones ReLU, entrenado durante 200 000 pasos con un buffer de repetición, una red objetivo actualizada cada 500 pasos y una política épsilon-greedy con fase de exploración de 0,3.

Su relevancia es fundamentalmente didáctica y de referencia: sirve como ejemplo reproducible y mínimo de un pipeline DQN completo sobre un entorno clásico de control, y como punto de partida para quienes quieren entender la mecánica de un agente RL antes de escalar a entornos más complejos. El autor declara una recompensa media de 215,6 en 10 episodios no vistos (el umbral de éxito del entorno es 200), aunque ese resultado no está verificado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) con Q-learning profundo (DQN): 8 → 128 → 128 → 4, activación ReLU |
| Parametros totales | 18 692 (8×128 + 128 + 128×128 + 128 + 128×4 + 4) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada fija de 8 valores de estado; no es un modelo de secuencia) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en `model.pt` en precisión nativa de PyTorch) |
| Idiomas soportados | No disponible (no procesa lenguaje) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (`model.pt`, `state_dict` cargable con `torch.load`) |

## Arquitectura y entrenamiento

La arquitectura es un DQN clásico con red Q aproximada por un MLP de dos capas ocultas de 128 unidades cada una. El estado de entrada son 8 escalares normalizados por el propio entorno de Gymnasium y la salida son los 4 valores Q correspondientes a las acciones discretas del entorno `LunarLander-v3`. La selección de acción en inferencia es greedy pura (`argmax` sobre los Q-valores), sin exploración.

El entrenamiento se realizó durante 200 000 pasos de entorno con los siguientes hiperparámetros declarados por el autor: tasa de aprendizaje 0,0005, factor de descuento gamma 0,99, fase de exploración épsilon de 0,3, actualización de la red objetivo cada 500 pasos y tamaño de lote 128. No se especifica en la información disponible el tamaño del buffer de repetición, el decaimiento de épsilon, la técnica de estabilización empleada (por ejemplo, si se usó Double DQN o clipping de gradiente) ni la composición exacta del esquema de recompensas más allá de las del propio entorno. Tampoco se documenta si hubo ajuste fino posterior ni evaluación con múltiples semillas.

## Capacidades

- Control de política discreta en el entorno `LunarLander-v3`: selecciona una de cuatro acciones a partir de un vector de estado de 8 dimensiones.
- Inferencia determinista y de coste computacional despreciable: una pasada forward sobre una red de 18 692 parámetros.
- Carga directa como `state_dict` de PyTorch, lo que permite integrarlo en pipelines de evaluación propios.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni planificación simbólica más allá de la política implícita aprendida.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo de razonamiento explícito (thinking mode), visión ni audio.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el agente como ejemplo mínimo y reproducible de un DQN funcional para explicar en clase el bucle de entrenamiento, la red objetivo y la política épsilon-greedy, cargando el `state_dict` y evaluando episodios en vivo.
- Referencia base (baseline) en experimentos de RL: comparar variantes como Double DQN, Dueling DQN o Prioritized Experience Replay contra esta política para medir mejoras de recompensa media en `LunarLander-v3`.
- Pruebas de infraestructura de evaluación: al tener un coste de inferencia mínimo, sirve para validar pipelines de `gymnasium` + `torch` en CI antes de escalar a entornos más pesados.
- Demostraciones interactivas: integrar la política en un cuaderno o demo web que renderice el aterrizaje y explique al usuario qué acción toma el agente en cada paso.
- Estudio de robustez y sensibilidad: evaluar cómo varía la recompensa media con perturbaciones en el vector de estado o con distintas semillas para ilustrar la varianza de un agente DQN entrenado con una sola semilla.
- Punto de partida para transferencia a otros entornos de control continuo-discreto: reutilizar la estructura MLP y el esquema de entrenamiento como plantilla para `CartPole`, `Acrobot` o `MountainCar`.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados de forma independiente):

| Metrica | Entorno | Valor | Nota |
|---|---|---|---|
| Recompensa media (mean_reward) | LunarLander-v3 | 215,6 | Media de 10 episodios no vistos; umbral de éxito del entorno = 200 |

No se han publicado en la información disponible resultados comparativos con otros agentes, número de semillas, desviación típica de la recompensa ni curvas de aprendizaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB; la red completa ocupa aproximadamente 75 KB en `float32` (18 692 parámetros × 4 bytes).
- GPU recomendadas: cualquiera, incluida una GPU integrada; el modelo es viable en CPU sin penalización práctica.
- Cabe en cualquier GPU de consumo, desde GTX 1050 hasta RTX 4090, y también en Raspberry Pi y entornos sin GPU.
- Opciones de despliegue: PyTorch nativo (`torch.load` + forward), exportación a TorchScript u ONNX para servir la política en producción, o integración directa en un bucle de `gymnasium`.
- Latencia y throughput estimados: del orden de microsegundos por paso en CPU; el cuello de botella real será el renderizado del entorno, no la red.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entorno | Recompensa declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| connectailab-rl-duking-v1-lunarlander-dqn (este) | DQN (MLP) | 18 692 | LunarLander-v3 | 215,6 (10 episodios) | No disponible | Hugging Face |
| connectailab-rl-duking-v2-link01 | RL con PEFT (según metadatos de HF) | No disponible | No disponible | No disponible | No disponible | Hugging Face |
| Políticas DQN de referencia de la literatura (p. ej. las del paper original de DQN, 2015) | DQN | No disponible en esta ficha | Atari y control clásico | No disponible en esta ficha | No disponible | Repositorios académicos |

No se dispone de datos verificables de otros agentes equivalentes sobre `LunarLander-v3` en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- El resultado de 215,6 no está verificado de forma independiente (`verified: false` en el `model-index`); se desconoce la desviación típica y el número de semillas empleadas.
- La licencia no está declarada, lo que impide asumir permisos de uso comercial o de redistribución; conviene contactar con el autor antes de cualquier uso en producción.
- El agente está entrenado exclusivamente para `LunarLander-v3`; no generaliza a otros entornos ni a variaciones del espacio de estados o de acciones.
- La política es determinista en inferencia y puede quedar atrapada en trayectorias subóptimas en estados poco representados durante el entrenamiento.
- No se documenta el tamaño del buffer de repetición, el decaimiento de épsilon ni técnicas de estabilización, lo que dificulta la reproducibilidad exacta del entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB, lo que sugiere que los pesos podrían no estar efectivamente subidos o que el artefacto es mínimo; conviene verificar la presencia de `model.pt` antes de integrarlo.
- No apto para tareas de lenguaje, visión, razonamiento general ni agentes conversacionales; su ámbito es estrictamente el control de un entorno simulado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leegoheun/lconnectailab-rl-duking-v1-lunarlander-dqn
- Modelo relacionado (v2): https://huggingface.co/leegoheun/connectailab-rl-duking-v2-link01
- Repositorio del programa CONNECT AI LAB: https://github.com/wonseokjung/connect-tycoon
- Curso de refuerzo de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Entorno Gymnasium LunarLander: https://gymnasium.farama.org/environments/box2d/lunar_lander/
