# lookarooka/connectailab-rl-novice-v2-lunarlander

## Resumen

`connectailab-rl-novice-v2-lunarlander` es un agente de aprendizaje por refuerzo profundo entrenado para resolver el entorno `LunarLander-v3` de Gymnasium. Lo publica el usuario `lookarooka` en Hugging Face como parte del curso de RL de CONNECT AI LAB × AI CITY BUILDERS. No es un modelo de lenguaje: es una política neuronal (Q-network) que mapea el estado de 8 dimensiones del módulo de aterrizaje a una de 4 acciones discretas (no hacer nada, encender motor lateral izquierdo, motor principal o motor lateral derecho).

El modelo implementa la combinación **Dueling Double DQN con multi-step learning**, una evolución sobre el DQN vainilla que corrige la sobreestimación de valores Q, estabiliza el entrenamiento mediante actualizaciones suaves del target y mejora la propagación de recompensa a través de retornos de 3 pasos. Según la model card, esta variante (v2/v3) alcanza una puntuación media de **282,4 puntos en 10 episodios de evaluación**, frente a los ~205 puntos del DQN básico, superando ampliamente el umbral de 200 que se considera resolución del entorno.

Es relevante como ejemplo didáctico reproducible de cómo técnicas estándar de mejora en RL (Double DQN, Dueling, soft updates, multi-step returns, reward shaping y cosine annealing del learning rate) se combinan para pasar de un agente que apenas aprueba a uno con comportamiento de aterrizaje eficiente en combustible. El identificador del repositorio indica `v2`, aunque la model card describe el `v3` como versión final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dueling Double DQN con multi-step returns (MLP de 2 capas, 128-128) |
| Parametros totales | No disponible (MLP pequeño, del orden de decenas de miles) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entorno de RL, estado de 8 dimensiones) |
| Tipos de cuantizacion | No disponible (pesos en `model.pt` de PyTorch) |
| Idiomas soportados | No aplica (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (`model.pt`, `state_dict`) |

## Arquitectura y entrenamiento

La red es un MLP de dos capas ocultas de 128 neuronas con activación ReLU, dividido en dos cabezas según el esquema Dueling: una cabeza de valor de estado `V(s)` y una cabeza de ventaja `A(s,a)`, combinadas como `Q(s,a) = V(s) + (A(s,a) - mean(A(s,·)))`. El estado de entrada tiene 8 dimensiones (posición, velocidad, ángulo, velocidad angular y contacto de las patas) y la salida son 4 valores Q correspondientes a las acciones discretas del entorno.

El entrenamiento parte de un DQN vainilla y aplica sucesivamente: **Double DQN** (selección de acción con la red online, evaluación con la red target) para eliminar el sesgo de sobreestimación; **soft target update** con `tau = 0.005` en lugar de hard update cada 500 pasos; **multi-step return de n=3** para acelerar la propagación de recompensa; **reward shaping** específico del dominio (penalización de ángulo y velocidad angular, penalización fuerte de velocidad vertical excesiva por debajo de y < 0.3, bonus de +8.0 por contacto simultáneo de ambas patas); y **Cosine Annealing** del learning rate de 3e-4 a 1e-5. No se documenta el número total de pasos de entrenamiento ni el tamaño del replay buffer.

## Capacidades

- Control de política discreta en `LunarLander-v3`: selecciona una de 4 acciones por paso a partir del estado de 8 dimensiones.
- Aterrizaje preciso y eficiente en combustible: la model card describe un comportamiento de encendido intermitente del motor principal solo cerca del suelo.
- Estabilización de actitud: mantiene el ángulo y la velocidad angular bajo control durante el descenso.
- No soporta tool calling, agentes, multi-step reasoning en lenguaje natural, visión, audio ni capacidades multilingües, al no ser un modelo de lenguaje.
- No soporta `thinking mode` ni generación de texto.

## Casos de uso

- **Docencia de RL profundo**: usar el checkpoint como referencia de "estado del arte" en un curso para comparar visualmente el comportamiento de un DQN vainilla frente a un Dueling Double DQN multi-step en el mismo entorno.
- **Reproducción de experimentos**: servir de baseline reproducible para estudiar el efecto aislado de cada técnica (Double, Dueling, multi-step, soft update, reward shaping) sobre la puntuación media.
- **Evaluación de entornos Gymnasium**: integrar el agente en un script de evaluación que ejecute `LunarLander-v3` con semillas fijas y mida la recompensa media, útil para validar instalaciones o wrappers del entorno.
- **Pruebas de infraestructura de RL**: cargar el `model.pt` en pipelines de CI para comprobar que las dependencias (PyTorch, Gymnasium, Box2D) funcionan antes de lanzar entrenamientos largos.
- **Generación de datos de demostración**: usar la política entrenada como política experta para generar trayectorias de aterrizaje que alimenten técnicas de imitation learning o de offline RL.
- **Investigación en reward shaping**: tomar la configuración de recompensas descrita (penalización de velocidad vertical, bonus de doble contacto) como punto de partida para estudiar su efecto en otros entornos de control continuo-discreto.
- **Demostraciones interactivas**: renderizar el agente en `LunarLander-v3` con `render_mode="human"` para visualizar la política en charlas o material divulgativo.

## Benchmarks y rendimiento

| Modelo / versión | Algoritmo | Puntuación media (10 episodios) |
|---|---|---|
| v1 (DQN básico) | Vanilla DQN | ~205,3 |
| v2 (alto rendimiento) | Dueling Double DQN | ~258,7 |
| v3 (versión final) | Dueling Double DQN + multi-step (n=3) | 282,4 |

Umbral de resolución del entorno: 200 puntos. No se han publicado resultados adicionales (por ejemplo, desviación típica, número de semillas o curvas de aprendizaje) en la información disponible.

## Requisitos de hardware

- **VRAM**: prácticamente despreciable; el modelo es un MLP de dos capas de 128 neuronas y cabe en CPU sin problema.
- **GPU recomendadas**: no requiere GPU. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es más que suficiente; también funciona en CPU.
- **Consumer GPU**: sí, cabe en cualquier GPU consumer e incluso en entornos sin GPU.
- **Opciones de despliegue**: PyTorch nativo (`torch.load` + `state_dict`), integración directa con Gymnasium; no aplican vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- **Latencia y throughput**: no disponibles en la información proporcionada; por el tamaño de la red, la inferencia por paso es del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Puntuación media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-novice-v2-lunarlander | LunarLander-v3 | Dueling Double DQN + multi-step | 282,4 | No disponible | Hugging Face (`lookarooka`) |
| connectailab-rl-novice-v1 (referencia en la model card) | LunarLander-v3 | Vanilla DQN | ~205,3 | No disponible | No se indica repositorio separado |
| connectailab-rl-novice-v3 (referencia en la model card) | LunarLander-v3 | Dueling Double DQN + multi-step | 282,4 | No disponible | Hugging Face (`lookarooka`) |

No se dispone de comparación con implementaciones de referencia externas (por ejemplo, Stable-Baselines3) en la información proporcionada.

## Limitaciones y advertencias

- **Específico del entorno**: la política solo es válida para `LunarLander-v3` con la misma parametrización de recompensas; no generaliza a otros entornos ni a variantes del juego.
- **Sesgo de dominio**: el reward shaping descrito (bonus de doble contacto, penalización de velocidad vertical) puede inducir comportamientos que no son óptimos bajo otras funciones de recompensa.
- **Riesgo de sobreajuste a la semilla**: la puntuación de 282,4 corresponde a 10 episodios de evaluación; no se documenta la varianza ni el número de semillas, por lo que la robustez estadística es desconocida.
- **Licencia no disponible**: no se indica licencia, lo que impide confirmar si el uso comercial está permitido; conviene contactar con el autor antes de usarlo en producción.
- **Sin soporte de lenguaje**: no debe emplearse como modelo generativo, chatbot ni para tareas de NLP.
- **Documentación escasa**: la model card está en coreano y no detalla hiperparámetros completos (tamaño de buffer, número de pasos, semillas), lo que dificulta la reproducción exacta.
- **Identificador inconsistente**: el repositorio se llama `v2` pero la model card describe el `v3` como versión final; verificar qué checkpoint contiene realmente el `model.pt` antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/lookarooka/connectailab-rl-novice-v2-lunarlander
- Repositorio v3 citado en la model card: https://huggingface.co/lookarooka/connectailab-rl-novice-v3-lunarlander
- Entorno Gymnasium LunarLander: https://gymnasium.farama.org/environments/box2d/lunar_lander/
- Curso CONNECT AI LAB × AI CITY BUILDERS: no disponible enlace directo en la información proporcionada.
