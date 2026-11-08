# bigeye35/connectailab-rl-healmu-v1-lunarlander

## Resumen

connectailab-rl-healmu-v1-lunarlander es un agente de aprendizaje por refuerzo profundo entrenado con DQN (Deep Q-Network) para resolver el entorno LunarLander-v3 de Gymnasium. Lo publica el usuario bigeye35 en Hugging Face como parte de una iniciativa educativa conjunta entre CONNECT AI LAB y AI CITY BUILDERS, en el marco de un curso de reinforcement learning. No es un modelo de lenguaje: es una política neuronal compacta que mapea un vector de estado de 8 dimensiones a 4 acciones discretas de control de un módulo de aterrizaje lunar simulado.

El modelo resuelve un problema clásico de control continuo discretizado: decidir cuándo encender los propulsores izquierdo, principal o derecho, o no hacer nada, para posar la nave suavemente sobre la plataforma. Su relevancia es fundamentalmente didáctica y de referencia: sirve como ejemplo mínimo, reproducible y ejecutable en CPU de un pipeline completo de DQN con red objetivo, memoria de repetición y política epsilon-greedy.

La red es un perceptrón multicapa de tres capas (8 → 128 → 128 → 4) con activaciones ReLU, entrenado durante 200.000 pasos con una tasa de aprendizaje de 0,0005, factor de descuento 0,99, epsilon inicial 0,3, actualización de la red objetivo cada 500 pasos y tamaño de lote 128. El autor declara una recompensa media de 258,2 en 10 episodios no vistos, por encima del umbral de 200 que Gymnasium considera resolución del entorno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) DQN: 8 → 128 → 128 → 4 con ReLU |
| Parametros totales | 18.564 (estimado a partir de las dimensiones de capa declaradas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de 8 valores de estado) |
| Tipos de cuantizacion | no disponible (pesos en FP32, `model.pt`) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `state_dict` en `model.pt` |
| Entorno | Gymnasium LunarLander-v3 |
| Espacio de observacion | 8 dimensiones (x, y, vx, vy, ángulo, velocidad angular, contacto pata izquierda, contacto pata derecha) |
| Espacio de acciones | 4 discretas (nada, motor izquierdo, motor principal, motor derecho) |
| Pasos de entrenamiento | 200.000 |
| Tasa de aprendizaje | 0,0005 |
| Gamma (descuento) | 0,99 |
| Epsilon inicial | 0,3 |
| Frecuencia de actualización de red objetivo | 500 pasos |
| Tamaño de lote | 128 |

## Arquitectura y entrenamiento

La política es un DQN clásico con una red Q implementada como `nn.Sequential` de tres capas lineales y dos activaciones ReLU intermedias. La entrada es el vector de observación de 8 componentes de LunarLander-v3 y la salida son los valores Q para las 4 acciones discretas; la acción se selecciona por `argmax`. El entrenamiento emplea una red objetivo actualizada cada 500 pasos, un búfer de repetición implícito en el algoritmo DQN estándar, una política de exploración epsilon-greedy con epsilon inicial de 0,3 y descuento de 0,99 sobre un horizonte de 200.000 pasos de interacción con el entorno.

No se documenta en la información disponible el tamaño del búfer de repetición, la tasa de decaimiento de epsilon, el optimizador empleado (habitualmente Adam o RMSprop en DQN canónico) ni la composición exacta de episodios de evaluación. Tampoco se especifica si se aplicó doble DQN, dueling DQN o prioritised replay; la descripción corresponde a un DQN vanilla. El tamaño del repositorio es de 0,0 GB, coherente con un checkpoint de menos de 100 KB.

## Capacidades

- Control de política discreta sobre LunarLander-v3: selecciona una de cuatro acciones de propulsión en cada paso.
- Generalización a episodios no vistos: el autor reporta 258,2 de recompensa media en 10 partidas nuevas.
- Inferencia en CPU: el modelo es lo bastante pequeño para ejecutarse sin GPU.
- Integración directa con Gymnasium mediante la carga de `state_dict` en PyTorch.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües, de visión, audio ni generación de texto.
- No implementa modo thinking ni cadena de pensamiento explícita.

## Casos de uso

- Docencia de reinforcement learning: sirve como ejemplo mínimo y reproducible de un DQN funcional para explicar red Q, red objetivo, epsilon-greedy y bucle de entrenamiento en un curso introductorio.
- Verificación de pipelines de RL: al ser un checkpoint pequeño con recompensa declarada, permite comprobar que un entorno Gymnasium, la versión de PyTorch y el cargador de pesos funcionan correctamente antes de escalar a modelos mayores.
- Baseline en experimentos de LunarLander: se puede usar como referencia de rendimiento (258,2) frente a variantes como Double DQN, Dueling DQN o PPO en el mismo entorno.
- Demostraciones educativas en vídeo o talleres: el repositorio incluye `replay.mp4`, lo que facilita mostrar el comportamiento aprendido sin necesidad de reentrenar.
- Pruebas de integración en sistemas de simulación: se puede incrustar como controlador de un agente simulado en pipelines de evaluación de entornos de OpenAI Gym/Gymnasium.
- Comparación de algoritmos en trabajos académicos: al estar entrenado con hiperparámetros documentados, es un punto de partida controlado para estudiar sensibilidad a la tasa de aprendizaje, gamma o tamaño de lote.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor | Verificado |
|---|---|---|---|
| LunarLander-v3 | Recompensa media en 10 episodios no vistos (umbral de éxito: 200) | 258,2 | No |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB; el modelo cabe holgadamente en cualquier GPU y en CPU.
- GPU recomendadas: ninguna en particular; funciona en CPU, y también en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) sin aprovechar su capacidad.
- Cabe en cualquier GPU consumer y en sistemas embebidos con PyTorch.
- Opciones de despliegue: PyTorch nativo (carga de `state_dict`), exportación a TorchScript u ONNX si se necesita, integración directa con Gymnasium.
- Latencia y throughput: no disponibles; por el tamaño de la red (tres capas densas de 128 unidades) la inferencia por paso es del orden de microsegundos en CPU, aunque no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Parámetros | Recompensa declarada | Licencia |
|---|---|---|---|---|---|
| connectailab-rl-healmu-v1-lunarlander | LunarLander-v3 | DQN | ~18.564 | 258,2 (10 episodios) | no disponible |
| hiupjump/connectailab-rl-haruga-v1-lunarlander | LunarLander-v3 | no disponible | no disponible | no disponible | no disponible |
| Mike9/connectailab-rl-ai-oasis-v1-lunarlander | LunarLander-v3 | no disponible | no disponible | no disponible | no disponible |

Los dos modelos comparables pertenecen a la misma familia educativa CONNECT AI LAB y resuelven el mismo entorno, pero la información pública disponible no detalla su arquitectura, hiperparámetros ni métricas, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Ámbito muy restringido: solo resuelve LunarLander-v3; no es un modelo de propósito general ni un LLM.
- Sin licencia declarada: no se puede asumir uso comercial ni redistribución sin consultar al autor.
- Métrica no verificada: la recompensa de 258,2 procede de la model card del autor y está marcada como `verified: false`; no hay evaluación independiente.
- Sin información sobre semilla, número de ejecuciones ni desviación estándar: la reproducibilidad exacta del resultado no está garantizada.
- Sensible a la versión del entorno: cambios en la dinámica o recompensas de LunarLander-v3 pueden alterar el rendimiento.
- Sin documentación de sesgos ni de robustez frente a perturbaciones del estado.
- Repositorio de 0,0 GB y sin descargas ni likes en el momento de la consulta: proyecto reciente, sin comunidad ni mantenimiento conocido.
- No apto para producción en dominios reales de control: el entorno es una simulación simplificada y el agente no ha sido validado fuera de ella.

## Enlaces

- Hugging Face: https://huggingface.co/bigeye35/connectailab-rl-healmu-v1-lunarlander
- Repositorio CONNECT AI LAB: https://github.com/wonseokjung/connect-tycoon
- AI CITY BUILDERS (curso de RL): https://www.aicitybuilders.com/robot
- Modelo relacionado: https://huggingface.co/hiupjump/connectailab-rl-haruga-v1-lunarlander
- Modelo relacionado: https://huggingface.co/Mike9/connectailab-rl-ai-oasis-v1-lunarlander
