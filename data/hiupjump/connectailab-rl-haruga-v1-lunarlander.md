# hiupjump/connectailab-rl-haruga-v1-lunarlander

## Resumen

`connectailab-rl-haruga-v1-lunarlander` es un agente de aprendizaje por refuerzo profundo publicado en Hugging Face por el usuario `hiupjump`, desarrollado en el marco del programa CONNECT AI LAB × AI CITY BUILDERS. No es un modelo de lenguaje ni un modelo generativo: es una red neuronal de política (Q-network) entrenada con DQN (Deep Q-Network) para resolver el entorno `LunarLander-v3` de Gymnasium, en el que debe hacer aterrizar un módulo lunar en una plataforma aplicando cuatro acciones discretas (no hacer nada, motor izquierdo, motor principal, motor derecho).

La arquitectura es un perceptrón multicapa de tres capas (8 → 128 → 128 → 4, con activaciones ReLU), con un total de 18.180 parámetros. La entrada son las 8 variables de observación del entorno (posición x e y, velocidades, ángulo, velocidad angular y contacto de cada una de las dos patas) y la salida son los valores Q de las cuatro acciones. El autor declara una recompensa media de 258,2 en 10 episodios no vistos, por encima del umbral de 200 que el entorno considera resuelto.

Su relevancia es acotada y de carácter didáctico: se trata de un artefacto formativo de un curso de RL, publicado con el código de inferencia mínimo (descarga del `state_dict` con `hf_hub_download` y un `argmax` sobre la red), útil como ejemplo reproducible de DQN y como baseline de evaluación más que como componente de producción. La model card está redactada en coreano y no declara licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) con ReLU, usado como Q-network en DQN: entrada 8 → 128 → 128 → salida 4 |
| Parametros totales | 18.180 (8×128+128 = 1.152; 128×128+128 = 16.512; 128×4+4 = 516) |
| Parametros activos | no aplica (no es un modelo Mixture-of-Experts) |
| Longitud de contexto | no aplica (agente de RL; observación de 8 dimensiones por paso, sin memoria recurrente) |
| Tipos de cuantizacion | no documentados; el checkpoint se carga como `state_dict` de PyTorch en coma flotante de 32 bits |
| Idiomas soportados | no aplica (no procesa ni genera lenguaje natural) |
| Licencia | no disponible (no declarada en la model card ni en los metadatos del repositorio) |
| Formato de pesos | PyTorch (`model.pt`, `state_dict`); incluye vídeo `replay.mp4` |
| Entorno | Gymnasium `LunarLander-v3` |
| Espacio de acciones | Discreto, 4 acciones |
| Tamano del repositorio | 0,0 GB (según metadatos de Hugging Face) |

## Arquitectura y entrenamiento

El agente es una red puramente feedforward sin recurrencia ni mecanismos de atención: tres capas densas con activación ReLU entre ellas, que mapean el vector de estado de 8 dimensiones a los valores Q de las 4 acciones. El entrenamiento sigue el esquema canónico de DQN (Q-learning profundo con red objetivo y experiencia de replay), con los siguientes hiperparámetros declarados por el autor: 200.000 pasos totales, capas ocultas de 128 unidades, tasa de aprendizaje 0,0005, factor de descuento gamma 0,99, periodo de exploración 0,3, actualización de la red objetivo cada 500 pasos y tamaño de lote 128.

No se especifican en la información disponible la política de exploración concreta (epsilon-greedy u otra), el tamaño del buffer de replay, el número de semillas, la composición del dataset de episodios ni si se aplicaron técnicas adicionales como Double DQN, dueling heads o normalización de observaciones. Tampoco se documenta el proceso de evaluación más allá de la media sobre 10 episodios, y el resultado está marcado como no verificado (`verified: false`) en el model-index. No hay innovaciones técnicas destacables: el valor del artefacto es la trazabilidad de la configuración de entrenamiento, no la arquitectura.

## Capacidades

- Control discreto en `LunarLander-v3`: selecciona una de cuatro acciones (nada, motor izquierdo, motor principal, motor derecho) a partir de 8 observaciones numéricas.
- Inferencia determinista por `argmax` sobre los valores Q, sin muestreo estocástico.
- Ejecución en CPU: el modelo completo ocupa del orden de 73 KB en fp32, por lo que no requiere GPU.
- Integración directa con Gymnasium: el bucle de inferencia se escribe en pocas líneas con PyTorch.
- Evaluación declarada de generalización dentro del mismo entorno: media de 258,2 en 10 episodios no vistos.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, visión, audio, ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking ni de generación de texto de ningún tipo.

## Casos de uso

- Docencia y material didáctico de RL: el repositorio ofrece un DQN completo y mínimo (18.180 parámetros) con hiperparámetros explícitos, ideal para que un estudiante reproduzca el ciclo entrenamiento-evaluación sin infraestructura.
- Baseline de comparación de algoritmos: sirve como referencia fija de DQN en `LunarLander-v3` frente a PPO, A2C o SAC en experimentos de un mismo laboratorio, dado que la recompensa declarada (258,2) está por encima del umbral de resolución del entorno.
- Pruebas de integración de pipelines Gymnasium: útil para validar que un entorno de evaluación, un wrapper de observaciones o un servicio de inferencia funcionan de extremo a extremo con un modelo real y de peso despreciable.
- Benchmark de latencia y despliegue en el edge: con ~73 KB en fp32 y una sola pasada de tres matrices pequeñas, es un caso de prueba para medir sobrecarga de serialización, carga de pesos y latencia por paso en dispositivos de bajos recursos.
- Prototipado de control en simuladores 2D: el esquema estado numérico → acciones discretas es trasladable a otros dominios de control con espacio de acciones pequeño, previo reentrenamiento con la misma receta.
- Punto de partida para transferencia o destilación: al ser una red diminuta con `state_dict` estándar, puede inicializar experimentos de fine-tuning, imitación o comparación de inicializaciones en entornos de física 2D.
- Verificación de reproducibilidad: la configuración publicada permite auditar la varianza entre semillas y comprobar si la media de 258,2 se sostiene, algo relevante para quien quiera citar el resultado.

## Benchmarks y rendimiento

| Benchmark | Dataset / entorno | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Media de recompensa en 10 episodios no vistos (umbral de éxito: 200) | LunarLander-v3 | mean_reward | 258,2 | No (declarado por el autor, `verified: false`) |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni tiene sentido aplicarlos a un agente de RL sobre un único entorno. Tampoco se aportan desviaciones típicas, número de semillas ni intervalo de confianza del 258,2 declarado.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 MB. Los 18.180 parámetros en fp32 ocupan aproximadamente 72,7 KB, más el estado del optimizador solo si se reanuda el entrenamiento.
- GPU recomendadas: ninguna. El modelo está pensado para CPU; cualquier GPU (RTX 4090, A100, H100) ejecutaría la inferencia con sobrecarga de transferencia dominante respecto al cómputo.
- Cabe en cualquier GPU de consumo y en cualquier CPU moderna, así como en Raspberry Pi o entornos embebidos.
- Opciones de despliegue: PyTorch nativo con `hf_hub_download` + `torch.load` (procedimiento documentado por el autor); exportación a TorchScript u ONNX viable por la simplicidad del grafo, aunque no está documentada en el repositorio. vLLM, llama.cpp, Ollama y TGI no son aplicables: no es un modelo de lenguaje.
- Latencia y throughput: no disponibles como medición publicada. Por el tamaño del grafo (tres multiplicaciones matriz-vector de 8×128, 128×128 y 128×4), la latencia por paso es del orden de microsegundos en CPU, muy por debajo del coste de la simulación del entorno, que será el cuello de botella real.

## Comparativa con modelos similares

| Modelo | Entorno | Arquitectura | Parametros | Recompensa declarada | Licencia |
|---|---|---|---|---|---|
| `hiupjump/connectailab-rl-haruga-v1-lunarlander` | LunarLander-v3 | MLP 8-128-128-4, DQN | 18.180 | 258,2 (10 episodios, no verificado) | no disponible |
| `lucaskim72/connectailab-rl-lucas-v1-lunarlander` | LunarLander-v3 | no disponible | no disponible | no disponible | no disponible |
| `TUpreneur/connectailab-rl-tupreneur-v1-lunarlander` | LunarLander-v3 | no disponible | no disponible | no disponible | no disponible |
| `hiupjump/connectailab-rl-harugabrain-v1` | no disponible | no disponible | no disponible | no disponible | no disponible |

Los tres primeros comparten el mismo programa formativo (CONNECT AI LAB) y el mismo entorno, por lo que son los comparables naturales, pero la información recuperada no incluye sus especificaciones ni sus métricas. Frente a implementaciones de referencia de DQN para `LunarLander-v3` en librerías como Stable-Baselines3 no se dispone de resultados equiparables en la información proporcionada; la comparación honesta exigiría reejecutar todos los agentes con las mismas semillas y el mismo protocolo de evaluación.

## Limitaciones y advertencias

- Ámbito mínimo: el modelo solo resuelve `LunarLander-v3` con 8 entradas numéricas y 4 acciones; no es reutilizable tal cual fuera de ese entorno.
- Resultado no verificado: la recompensa de 258,2 procede del propio autor, sin semillas, desviación típica ni replicación independiente. En `LunarLander-v3` la varianza entre episodios es alta, de modo que la media de 10 partidas es un estimador frágil.
- Sin información de licencia: no se declara licencia en la model card ni en los metadatos, lo que impide asumir permiso de uso comercial o de redistribución. Antes de cualquier uso en producción hay que contactar con el autor.
- Sin datos de sesgo ni de robustez: no se ha evaluado el comportamiento ante perturbaciones de observación, cambios de semilla, modificaciones de la física del entorno o distribuciones de estado fuera de la de entrenamiento.
- Riesgo de sobreajuste a la configuración concreta: 200.000 pasos con una red de 18.180 parámetros es suficiente para resolver el entorno, pero no se documenta ninguna estrategia de regularización ni evaluación cruzada con múltiples semillas.
- Idiomas y multimodalidad: no aplica; cualquier expectativa de generación de texto, visión o diálogo queda fuera del alcance del artefacto.
- Caveat de producción: no hay versionado semántico, ni tests, ni métricas de latencia publicadas; tratarlo como demo reproducible, no como servicio con garantías.
- Metadatos incompletos: 0 descargas y 0 likes en el momento de la consulta, licencia e idiomas sin declarar y repositorio de 0,0 GB; conviene verificar la integridad de `model.pt` antes de cargarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hiupjump/connectailab-rl-haruga-v1-lunarlander
- Modelo hermano del mismo autor: https://huggingface.co/hiupjump/connectailab-rl-harugabrain-v1
- Modelo del mismo programa (lucaskim72): https://huggingface.co/lucaskim72/connectailab-rl-lucas-v1-lunarlander
- Modelo del mismo programa (TUpreneur): https://huggingface.co/TUpreneur/connectailab-rl-tupreneur-v1-lunarlander
- CONNECT AI LAB (repositorio del programa): https://github.com/wonseokjung/connect-tycoon
- AI CITY BUILDERS, curso de RL: https://www.aicitybuilders.com/robot
- Implementación de referencia de DQN para Lunar Lander (terceros, no vinculada al autor): https://github.com/KillMonga130/lunar-lander-ai
