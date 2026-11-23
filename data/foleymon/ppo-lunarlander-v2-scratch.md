# foleymon/ppo-LunarLander-v2-scratch

## Resumen

`foleymon/ppo-LunarLander-v2-scratch` es un agente de aprendizaje por refuerzo entrenado con el algoritmo Proximal Policy Optimization (PPO) para resolver el entorno `LunarLander-v2` de Gymnasium. Lo desarrolla el usuario de Hugging Face `foleymon` como ejercicio del curso Deep Reinforcement Learning de Hugging Face (Unidad 8, Parte 1), con una implementación de PPO escrita desde cero en PyTorch siguiendo la referencia de CleanRL. No es un modelo de lenguaje ni un sistema generativo: es una política neuronal que mapea observaciones del entorno a acciones discretas de control del módulo de aterrizaje.

El interés del artefacto es fundamentalmente didáctico y reproducible: sirve como referencia de una implementación PPO limpia, de un solo fichero, aplicada a un problema de control continuo con recompensa densa y espacio de acciones discreto (cuatro acciones). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere que los pesos publicados ocupan muy poco espacio (una política MLP pequeña para observaciones de 8 dimensiones).

El rendimiento declarado por el autor es negativo: una recompensa media de -49.05 ± 19.82 en 10 episodios con política greedy. En `LunarLander-v2` se considera resuelto el entorno a partir de una recompensa media de 200 en 100 episodios consecutivos, por lo que este agente está muy lejos de ese umbral y no debe considerarse un agente competente para el entorno, sino un registro de un entrenamiento parcial o fallido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política y función de valor neuronales (MLP) entrenadas con PPO implementado desde cero en PyTorch, siguiendo el algoritmo de CleanRL |
| Parametros totales | no disponible (no se publica el recuento; por el tamaño del repo, del orden de decenas de miles) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entorno de RL con observaciones de 8 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (no se documentan pesos cuantizados; el repo es de 0.0 GB) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible en la información proporcionada (repo de 0.0 GB; presumiblemente `state_dict` de PyTorch, sin confirmar) |

## Arquitectura y entrenamiento

El agente emplea PPO, un algoritmo de gradiente de política con optimización de objetivo recortado (*clipped surrogate objective*), entrenado sobre el entorno `LunarLander-v2`. La implementación es propia, escrita en PyTorch y basada en la de CleanRL, tal y como indica la model card. No se detalla la topología exacta de las redes (número de capas, unidades ocultas, inicialización, coeficientes de entropía, factor de descuento ni tamaño de lote), por lo que esos hiperparámetros deben considerarse no disponibles.

El entrenamiento declarado es de 500.000 pasos de entorno, y la evaluación se realizó sobre 10 episodios con política greedy. No se menciona uso de RLHF, DPO ni técnicas de decodificación especulativa, que no aplican a este tipo de modelo. Tampoco se documenta composición de dataset, ya que la señal de entrenamiento proviene de las recompensas del simulador, no de un corpus.

## Capacidades

- Control de un módulo de aterrizaje en el entorno `LunarLander-v2` con espacio de acciones discreto (no hacer nada, encender motor principal, encender motor lateral izquierdo, encender motor lateral derecho).
- Política neuronal entrenada para mapear observaciones de 8 dimensiones (posición, velocidad, ángulo, velocidad angular, contacto con el suelo) a acciones.
- Evaluación con política greedy (sin muestreo estocástico) sobre 10 episodios.
- Reproducibilidad del pipeline de entrenamiento PPO desde cero en PyTorch, útil como referencia de implementación.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión, audio ni modo de razonamiento extendido. No es un modelo de lenguaje.

## Casos de uso

- Material didáctico para el curso Deep Reinforcement Learning de Hugging Face: sirve como ejemplo de implementación PPO desde cero y de publicación de un agente en el Hub con `model-index` declarado.
- Reproducción de experimentos de RL: permite repetir el entrenamiento de 500.000 pasos y comparar la curva de recompensa con la referencia de CleanRL.
- Punto de partida para depuración de PPO: al ser una implementación propia y con recompensa negativa, es útil para estudiar fallos típicos (ajuste de hiperparámetros, normalización de ventajas, coeficiente de entropía) y corregirlos.
- Benchmark interno de infraestructura de RL: sirve para medir throughput de pasos de entorno por segundo en un pipeline de entrenamiento propio antes de escalar a entornos más costosos.
- Docencia en cursos de aprendizaje por refuerzo: ejemplo de agente con rendimiento insuficiente para ilustrar la diferencia entre "entrenado" y "resuelto" en un entorno con umbral de recompensa conocido.
- Prueba de integración de agentes en el Hub: validación de la carga de un agente de RL desde Hugging Face y de la ejecución de episodios de evaluación con política greedy.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados):

| Metrica | Valor | Tarea | Dataset | Verificado |
|---|---|---|---|---|
| mean_reward | -49.05 ± 19.82 | reinforcement-learning | LunarLander-v2 | No |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, del orden de megabytes, dado que se trata de una política MLP pequeña para observaciones de 8 dimensiones (el repositorio ocupa 0.0 GB).
- GPU recomendadas: no es necesaria GPU para inferencia; cualquier CPU moderna ejecuta la política a velocidad muy superior a la requerida por el simulador. Para reentrenamiento, una GPU consumer (por ejemplo, RTX 3060 o superior) acelera los 500.000 pasos, aunque el entorno es ligero y también es viable en CPU.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: carga directa del `state_dict` en PyTorch con la red definida por el autor; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. El cuello de botella será el paso del simulador `LunarLander-v2`, no la inferencia de la red.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Recompensa media declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| foleymon/ppo-LunarLander-v2-scratch | PPO desde cero (PyTorch) | LunarLander-v2 | -49.05 ± 19.82 (10 episodios) | no disponible | Hugging Face Hub |
| cleanrl/ppo-LunarLander-v2 (referencia del curso) | PPO (CleanRL) | LunarLander-v2 | no disponible en la información proporcionada | no disponible | Repositorio CleanRL |
| Agentes PPO de referencia del curso Deep RL de Hugging Face | PPO | LunarLander-v2 | no disponible en la información proporcionada | no disponible | Hugging Face Hub |

No se dispone de datos de benchmarks comparables verificables en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Rendimiento insuficiente: la recompensa media de -49.05 ± 19.82 está muy por debajo del umbral de 200 que se considera resolución del entorno `LunarLander-v2`. El agente no es apto para uso práctico en el entorno.
- Evaluación limitada: solo 10 episodios con política greedy, sin intervalo de confianza robusto ni evaluación sobre múltiples semillas.
- Sin licencia declarada: no se especifican términos de uso comercial ni de redistribución; debe asumirse ausencia de permisos explícitos hasta que el autor los declare.
- Sin documentación de hiperparámetros ni de arquitectura de red: dificulta la reproducibilidad exacta y la auditoría del entrenamiento.
- Sin información sobre sesgos: al no ser un modelo de lenguaje ni entrenarse con datos humanos, no aplican sesgos sociales en el sentido habitual, pero tampoco se documenta el comportamiento en estados fuera de distribución del entorno.
- Riesgo de sobreajuste al entorno concreto: la política está entrenada únicamente para `LunarLander-v2` y no generaliza a otras variantes ni a otros problemas de control.
- Advertencia de producción: no debe desplegarse como componente de un sistema real de control; es un artefacto didáctico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/foleymon/ppo-LunarLander-v2-scratch
- Repositorio CleanRL (referencia del algoritmo): https://github.com/vwxyzjn/cleanrl
- Curso Deep Reinforcement Learning de Hugging Face (Unidad 8, Parte 1): https://huggingface.co/learn/deep-rl-course/unit8/introduction
- Entorno LunarLander-v2 (Gymnasium): https://gymnasium.farama.org/environments/box2d/lunar_lander/
- Paper de PPO (Schulman et al., 2017): https://arxiv.org/abs/1707.06347
