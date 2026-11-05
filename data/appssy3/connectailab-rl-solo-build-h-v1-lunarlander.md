# appssy3/connectailab-rl-solo-build-h-v1-lunarlander

## Resumen

`connectailab-rl-solo-build-h-v1-lunarlander` es un agente de aprendizaje por refuerzo profundo entrenado con DQN (Deep Q-Network) para resolver el entorno `LunarLander-v3` de Gymnasium, cuyo objetivo es hacer aterrizar una nave simulada sobre una plataforma. Lo desarrolla el autor `appssy3` en el marco de la colaboración entre CONNECT AI LAB y AI CITY BUILDERS, aparentemente como material didáctico del curso de refuerzo de AI CITY BUILDERS (sexta lección). No es un modelo de lenguaje: es una política neuronal de pequeña escala que mapea un vector de estado de 8 dimensiones a 4 acciones discretas.

La red es un perceptrón multicapa (MLP) con dos capas ocultas de 128 unidades y activación ReLU, entrenado con DQN clásico (probablemente con target network, dado el parámetro `목표주기`, "periodo objetivo", de 500 pasos). El entrenamiento se realizó durante 200 000 pasos con learning rate 0,0005, factor de descuento 0,99, epsilon de exploración inicial 0,3 y tamaño de lote 128. El autor declara una recompensa media de 233,6 en 10 episodios no vistos, por encima del umbral de 200 que LunarLander considera "resuelto".

Su relevancia es limitada fuera del contexto educativo: no es un modelo de lenguaje, no tiene capacidades generativas ni de tool calling, y su licencia no está declarada. Es útil como referencia didáctica de un DQN funcional y como ejemplo mínimo de despliegue de políticas RL en HuggingFace Hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) con DQN; entrada 8 → 128 → 128 → salida 4, activación ReLU |
| Parametros totales | no disponible (estimado a partir de la topología declarada: 8×128 + 128 + 128×128 + 128 + 128×4 + 4 ≈ 17 796, cálculo propio no confirmado por el autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; el estado es un vector de 8 números) |
| Tipos de cuantizacion | no disponible (solo se distribuye `model.pt` en PyTorch) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`model.pt`) |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal densa de tres capas lineales (8→128, 128→128, 128→4) con ReLU entre ellas, entrenada con DQN. El entorno LunarLander-v3 proporciona un estado continuo de 8 dimensiones (posición x/y, velocidad x/y, ángulo, velocidad angular, contacto con pata izquierda, contacto con pata derecha) y 4 acciones discretas (no hacer nada, motor izquierdo, motor principal, motor derecho). El agente aprende una función Q que estima el valor de cada acción dado el estado y actúa tomando el argmax.

Configuración de entrenamiento declarada por el autor: 200 000 pasos totales, 128 unidades ocultas, learning rate 0,0005, gamma 0,99, epsilon de exploración 0,3, periodo de actualización de la target network de 500 pasos y batch size 128. No se especifica si se usó replay buffer, double DQN, dueling DQN ni ningún otro refinamiento; tampoco se detalla la composición del dataset (en RL, la experiencia se genera online durante el entrenamiento). No hay innovaciones técnicas destacables: es un DQN estándar de juguete.

## Capacidades

- Control de política en el entorno LunarLander-v3: dado un estado de 8 números, devuelve la acción óptima según la Q-network.
- Inferencia puramente numérica: no procesa texto, imágenes ni audio.
- No soporta tool calling ni function calling.
- No soporta agentes multi-step más allá del bucle episódico del entorno.
- No tiene capacidades multilingües (no hay procesamiento de lenguaje).
- No tiene modo "thinking", vision, audio ni ninguna capacidad generativa.
- Requiere normalización o preprocesado del estado coherente con el entorno Gymnasium original.

## Casos de uso

- Material didáctico de RL: usar el agente como ejemplo funcional de DQN en un curso o taller, cargando `model.pt` y comparando la política aprendida con la de un agente aleatorio.
- Baseline de referencia en LunarLander-v3: servir como punto de partida para comparar variantes (Double DQN, PPO, A2C) en el mismo entorno con la métrica de recompensa media.
- Demostración de despliegue en HuggingFace Hub: ilustra el flujo completo de empaquetar pesos PyTorch y una model card con `model-index` para un agente RL.
- Evaluación de robustez de políticas: probar el agente en configuraciones ligeramente modificadas de LunarLander (viento, turbulencia) para estudiar su generalización, dado que solo se declara rendimiento en la configuración por defecto.
- Integración en pipelines de Gymnasium: envolver la política en un `gym.Wrapper` para ejecutarla junto con otros agentes en experimentos de aprendizaje por refuerzo multiagente o curriculum learning.
- Visualización de trayectorias: generar `replay.mp4` o grabaciones para analizar el comportamiento de aterrizaje (uso de motores, contacto con patas) con fines educativos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (`model-index`):

| Tarea | Dataset | Métrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | LunarLander-v3 | mean_reward (media de 10 episodios no vistos; ≥200 = éxito) | 233,6 | No (`verified: false`) |

No se han publicado otros resultados de benchmarks en la información disponible. El autor no proporciona comparación con baselines (agente aleatorio, DQN de referencia de Stable-Baselines3, PPO, etc.), ni desviación típica, ni número de semillas.

## Requisitos de hardware

- VRAM estimada: prácticamente nula; el modelo tiene del orden de decenas de miles de parámetros (menos de 0,1 MB en float32), por lo que cabe en CPU.
- GPU recomendadas: innecesarias; cualquier CPU moderna basta. En GPU, cualquier tarjeta desde una GTX 1050 en adelante serviría, pero no aporta ventaja.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) y también en Raspberry Pi o entornos sin GPU.
- Opciones de despliegue: PyTorch nativo (`torch.load`), exportación a TorchScript o ONNX para inferencia en C++/JavaScript, o integración directa en un bucle Gymnasium. No aplica vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje).
- Latencia y throughput: no disponibles; por el tamaño del modelo, la inferencia por paso es del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Entorno | Rendimiento declarado | Licencia |
|---|---|---|---|---|---|
| connectailab-rl-solo-build-h-v1-lunarlander | DQN (MLP) | ~17,8k (estimado) | LunarLander-v3 | 233,6 (media de 10 episodios) | no disponible |
| DQN de referencia de Stable-Baselines3 | DQN (MLP) | no disponible | LunarLander-v3 | no disponible en esta ficha | MIT (SB3) |
| PPO de referencia de Stable-Baselines3 | PPO (MLP) | no disponible | LunarLander-v3 | no disponible en esta ficha | MIT (SB3) |
| Agente aleatorio | política aleatoria | 0 | LunarLander-v3 | no disponible en esta ficha | no aplica |

No se dispone de datos verificados de los modelos comparables en la información proporcionada; la comparación se limita a categoría y entorno. La licencia del modelo evaluado no está declarada, lo que impide confirmar su reutilización comercial.

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir uso comercial ni redistribución sin consultar al autor.
- Entrenamiento de un solo entorno y una sola configuración: el agente no generaliza a variantes de LunarLander (viento, turbulencia, gravedad modificada) ni a otros entornos.
- Resultado no verificad: la métrica de 233,6 figura con `verified: false` en el `model-index`; no hay semillas, desviación típica ni protocolo de evaluación detallado.
- Sin información sobre sesgos: al ser un agente RL sin datos textuales, no aplican sesgos sociales típicos de LLM, pero tampoco hay análisis de robustez.
- Riesgo de sobreajuste a la política de exploración: con epsilon 0,3 y 200 000 pasos, la política puede depender de la distribución de estados vista durante el entrenamiento.
- No es un modelo de lenguaje: no debe usarse para generación de texto, código, matemáticas ni tareas de NLP.
- Repositorio de 0,0 GB y sin descargas ni likes: madurez y mantenimiento inciertos.
- Idiomas no disponibles: no aplica, pero tampoco hay documentación en castellano ni en inglés más allá de la model card en coreano.
- La model card está redactada principalmente en coreano, lo que puede dificultar su uso a desarrolladores no familiarizados con el idioma.

## Enlaces

- HuggingFace: https://huggingface.co/appssy3/connectailab-rl-solo-build-h-v1-lunarlander
- CONNECT AI LAB (GitHub): https://github.com/wonseokjung/connect-tycoon
- AI CITY BUILDERS, curso de RL: https://www.aicitybuilders.com/robot
- Entorno LunarLander-v3 (Gymnasium): no disponible enlace directo en la información proporcionada
- Paper de DQN original (Mnih et al., 2015): no disponible enlace en la información proporcionada
- Reproducción (`replay.mp4`): incluida en el repositorio de HuggingFace (ruta relativa `replay.mp4`)
