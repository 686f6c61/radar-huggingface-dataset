# hjko007/connectailab-rl-hjko007-v1-roadster-ppo

## Resumen

`connectailab-rl-hjko007-v1-roadster-ppo` es un agente de aprendizaje por refuerzo entrenado con Proximal Policy Optimization (PPO) para una tarea de control continuo muy concreta: aterrizar un vehículo tipo roadster que cae invertido, usando dos propulsores (empuje vertical y par de rotación) para girarlo y hacer que toque suelo con las ruedas. Lo publica el usuario `hjko007` en Hugging Face dentro del contexto del curso "AI CITY BUILDERS" y la iniciativa CONNECT AI LAB, según se desprende de la model card.

No es un modelo de lenguaje ni un transformer generativo: es una política neuronal (pesos PyTorch) que mapea un vector de estado de 7 dimensiones a una acción continua de 2 dimensiones. El entorno es un simulador propio, `로드스터_시뮬레이터.py` (clase `로드스터연속`, compatible con Gymnasium), y el entrenamiento se realizó con 1.000.000 de pasos, 8 entornos en paralelo, clip 0.2, gamma 0.99, GAE lambda 0.95 y learning rate 0.0003.

Su relevancia es fundamentalmente educativa y de reproducibilidad: sirve como referencia de un pipeline PPO completo para control continuo y como punto de comparación con otros agentes de la misma familia publicados por compañeros del curso (por ejemplo, la variante de `Martinyooo`). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere pesos muy pequeños o un repositorio aún sin subir artefactos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica neuronal para RL (actor-critic PPO); arquitectura interna de capas no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: vector de estado de 7 dimensiones) |
| Tipos de cuantizacion | no disponible (pesos PyTorch en coma flotante, sin variantes GGUF/ONNX documentadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`pytorch` como `library_name`); extension concreta del checkpoint no disponible |

## Arquitectura y entrenamiento

El agente se entrena con PPO sobre un entorno Gymnasium propio que simula un roadster invertido en caída. El espacio de observación es un vector de 7 componentes: posición `x` e `y`, velocidad `x` e `y`, inclinación representada como `sin` y `cos`, y velocidad angular. El espacio de acción es continuo y bidimensional: intensidad del propulsor inferior en `[0, 1]` y par de rotación en `[-1, 1]`. La política y la función de valor se implementan en PyTorch; la model card no detalla el número de capas, el tamaño de las capas ocultas ni si se comparte tronco entre actor y crítico.

Hiperparámetros de entrenamiento documentados: 1.000.000 de pasos totales, 8 entornos paralelos, `clip` 0.2, `gamma` 0.99, `gae_lambda` 0.95 y `lr` 0.0003. No se especifica el número de épocas por actualización, el tamaño de minibatch, el coeficiente de entropía ni el esquema de recompensas (más allá del objetivo implícito de aterrizar sobre las ruedas). Tampoco se documentan técnicas adicionales como normalización de observaciones, curriculum learning o reward shaping.

## Capacidades

- Control continuo de un vehículo en caída mediante dos actuadores (empuje y rotación).
- Aterrizaje orientado: la política aprende a girar el roadster invertido para que las ruedas toquen primero.
- Generalización a condiciones iniciales no vistas: la model card reporta una tasa de aterrizaje del 94% en 50 episodios nuevos.
- Integración con Gymnasium: el entorno `로드스터연속` sigue la interfaz estándar, lo que permite evaluar la política con bucles de rollout convencionales.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, visión, audio ni capacidades multilingües; es una política especializada de un único entorno.

## Casos de uso

- Docencia de RL: usar el agente como solución de referencia en un curso o taller de PPO para ilustrar el ciclo completo (entorno, rollout, ventaja GAE, recorte de política).
- Reproducción de experimentos: reentrenar con los hiperparámetros documentados (1M pasos, 8 entornos, clip 0.2) y comparar la curva de recompensa con la del checkpoint publicado.
- Evaluación comparativa entre alumnos: contrastar esta política con la de `Martinyooo/connectailab-rl-martinyooo-v1-roadster-ppo` sobre el mismo simulador para medir tasas de aterrizaje y estabilidad.
- Pruebas de robustez: someter la política a perturbaciones en las condiciones iniciales (posición, velocidad angular) y medir la degradación respecto al 94% reportado en episodios nuevos.
- Base para transferencia o fine-tuning: partir de estos pesos para una variante del entorno con más actuadores, viento o fricción variable, aprovechando que la política ya resuelve la maniobra básica de giro y aterrizaje.
- Validación de pipelines de simulación: usar el agente como "smoke test" del simulador `로드스터_시뮬레이터.py` para comprobar que la física, las observaciones y las recompensas se comportan de forma esperada.
- Demostraciones interactivas: integrar la política en una demo visual del simulador para mostrar control continuo en vivo en ferias o clases.

## Benchmarks y rendimiento

La model card solo aporta una métrica: tasa de aterrizaje del 94% en 50 episodios con condiciones iniciales no vistas. No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) porque no aplican a este tipo de modelo.

| Metrica | Valor | Condiciones |
|---|---|---|
| Tasa de aterrizaje | 94% | 50 episodios nuevos, condiciones iniciales no vistas |
| Pasos de entrenamiento | 1.000.000 | 8 entornos paralelos |
| Recompensa media | no disponible | no disponible |
| Episodios hasta convergencia | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada: muy baja; al tratarse de una política pequeña para un vector de estado de 7 dimensiones, es probable que quepa en cualquier GPU consumer, aunque el tamaño exacto de los pesos no está disponible.
- GPU recomendadas: cualquier GPU con soporte CUDA (RTX 3060 o superior) es más que suficiente para inferencia; para reentrenar con 8 entornos paralelos, una RTX 4090 o una A100 aceleran el proceso, pero el cuello de botella probablemente sea la simulación en CPU.
- Cabe en GPU consumer: sí, con alta probabilidad, dado el reducido espacio de observación y acción.
- Opciones de despliegue: PyTorch nativo (carga del checkpoint y `policy.act(obs)`); no se documentan exportaciones a ONNX, TorchScript, GGUF ni integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. En la práctica, la latencia vendrá dominada por el paso del simulador, no por la inferencia de la política.

## Comparativa con modelos similares

| Modelo | Tarea | Algoritmo | Pasos | Entorno | Tasa de exito | Licencia |
|---|---|---|---|---|---|---|
| `hjko007/connectailab-rl-hjko007-v1-roadster-ppo` | Aterrizaje de roadster invertido | PPO | 1.000.000 | `로드스터연속` (Gymnasium) | 94% en 50 episodios nuevos | no disponible |
| `Martinyooo/connectailab-rl-martinyooo-v1-roadster-ppo` | Aterrizaje de roadster invertido | PPO | no disponible | no disponible | no disponible | no disponible |
| `Martinyooo/connectailab-rl-martinyooo-v1-lunarlander` | Aterrizaje tipo LunarLander | RL (algoritmo no especificado) | no disponible | LunarLander | no disponible | no disponible |

La comparación directa solo es posible con la variante de `Martinyooo` para el mismo entorno, pero su model card no publica hiperparámetros ni métricas de éxito, por lo que no se puede establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Especialización extrema: la política solo funciona en el entorno `로드스터연속` con la parametrización descrita; no es transferible a otros simuladores sin reentrenamiento.
- Licencia no disponible: no se puede asumir uso comercial; conviene contactar con el autor antes de cualquier despliegue fuera del ámbito educativo.
- Repositorio sin descargas ni likes y con tamaño de 0.0 GB: existe riesgo de que los pesos no estén efectivamente subidos o de que el artefacto esté incompleto.
- Métrica de éxito autodeclarada: el 94% en 50 episodios no va acompañado de intervalos de confianza, semillas ni protocolo de evaluación detallado.
- Sin documentación sobre el esquema de recompensas: dificulta la reproducción exacta y la depuración de comportamientos no deseados.
- Idiomas y sesgos: no aplica en el sentido habitual, pero el agente puede exhibir comportamientos frágiles ante condiciones iniciales fuera de la distribución de entrenamiento.
- Sin soporte de cuantización ni formatos alternativos: el despliegue queda ligado a PyTorch.
- Proyecto de curso: la madurez, el mantenimiento y la documentación son propios de un ejercicio académico, no de un artefacto de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hjko007/connectailab-rl-hjko007-v1-roadster-ppo
- Variante de otro autor para el mismo entorno: https://huggingface.co/Martinyooo/connectailab-rl-martinyooo-v1-roadster-ppo
- Busqueda de modelos de la familia CONNECT AI LAB: https://huggingface.co/models?search=connectailab
