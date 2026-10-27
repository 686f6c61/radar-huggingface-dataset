# NADANAYO/connectailab-rl-nadanayo-v1-lunarlander

## Resumen

connectailab-rl-nadanayo-v1-lunarlander es un agente de aprendizaje por refuerzo profundo publicado por el usuario NADANAYO en el marco del programa CONNECT AI LAB × AI CITY BUILDERS. No es un modelo de lenguaje: es una red neuronal fully-connected de tipo Deep Q-Network (DQN) entrenada para resolver el entorno Gymnasium LunarLander-v3, en el que un módulo de aterrizaje debe posarse sobre una plataforma actuando sobre cuatro propulsores discretos.

El modelo recibe un vector de observación de 8 valores (posición x e y, velocidad x e y, ángulo de inclinación, velocidad angular y contacto de cada una de las dos patas) y devuelve valores Q para 4 acciones (no hacer nada, propulsor izquierdo, propulsor central, propulsor derecho). La arquitectura declarada es 8 → 128 → 128 → 4 con activaciones ReLU, entrenada durante 200.000 pasos con un objetivo DQN clásico.

Su relevancia es fundamentalmente didáctica y de referencia: sirve como ejemplo reproducible y mínimo (el repositorio ocupa 0,0 GB) de un pipeline completo de RL con PyTorch y Gymnasium, y como baseline de juguete para comparar algoritmos. El autor declara una puntuación media de 215,6 en 10 episodios no vistos, por encima del umbral de 200 que el propio entorno considera "resuelto", pero ese resultado no está verificado de forma independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal fully-connected (MLP) como aproximador de función Q en un esquema DQN; capas 8 → 128 → 128 → 4 con activación ReLU |
| Parámetros totales | 18.180 (derivado de la arquitectura declarada: 1.152 + 16.512 + 516); no confirmado por el autor |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la entrada es un vector de observación fijo de 8 valores por paso |
| Tipos de cuantización | no disponible; el autor solo publica un checkpoint en precisión nativa de PyTorch |
| Idiomas soportados | no aplica (no procesa texto); no disponible |
| Licencia | no disponible (la model card no la especifica) |
| Formato de pesos | `model.pt` (state_dict de PyTorch serializado con `torch.save`), cargado con `load_state_dict` sobre una `nn.Sequential` definida manualmente |
| Entorno | Gymnasium LunarLander-v3, espacio de acciones discreto de 4 acciones |
| Hiperparámetros de entrenamiento | 200.000 pasos totales, 128 unidades ocultas, learning rate 0,0005, gamma 0,99, epsilon de exploración 0,3, actualización de red objetivo cada 500 pasos, batch de 128 |
| Framework | PyTorch |

## Arquitectura y entrenamiento

La arquitectura es un DQN canónico con aproximador MLP de dos capas ocultas de 128 neuronas cada una y salida de 4 valores Q, uno por acción discreta. No hay capas convolucionales ni recurrentes: el agente no procesa píxeles, sino el vector de estado de 8 dimensiones que expone LunarLander-v3. El checkpoint se distribuye como `state_dict` plano, de modo que el usuario debe reconstruir la topología exacta en código antes de cargarlo, tal como muestra el fragmento de la model card.

Los detalles de entrenamiento declarados son: 200.000 pasos de interacción con el entorno, learning rate de 0,0005, factor de descuento gamma de 0,99, una fase o tasa de exploración de 0,3, sincronización de la red objetivo cada 500 pasos y tamaño de batch de 128. El autor no documenta el tamaño del replay buffer, la política de decaimiento de epsilon, la función de pérdida concreta (Huber o MSE), el uso de Double DQN ni el número de semillas ejecutadas, por lo que la reproducibilidad exacta del resultado no está garantizada. Tampoco se especifica el número de tokens ni composición de dataset, al no tratarse de un modelo supervisado: los datos provienen de la simulación del propio entorno.

No se declaran innovaciones técnicas adicionales (sin decodificación especulativa, sin atención lineal, sin componentes SSM ni híbridos). Se trata, por tanto, de una implementación de referencia orientada a la formación, no de una contribución algorítmica.

## Capacidades

- Control de política en LunarLander-v3: selecciona una de 4 acciones discretas a partir de 8 variables de estado continuas.
- Inferencia determinista por argmax sobre los valores Q, tal como se muestra en el ejemplo de uso de la model card.
- Ejecución en CPU: el tamaño del modelo permite inferencia sin GPU.
- Integración con Gymnasium: puede envolverse en un bucle estándar `env.step(action)` para evaluación o grabación de episodios.
- Serialización sencilla: al ser un `state_dict` de PyTorch, es exportable a TorchScript u ONNX con trabajo adicional del usuario (no se proporcionan artefactos exportados).
- No soporta tool calling ni function calling.
- No soporta agentes multi-step basados en lenguaje ni razonamiento simbólico.
- No tiene capacidades multilingües, de visión, audio ni modo "thinking".
- No incluye memoria de episodios anteriores: la política es Markoviana y depende solo del estado actual.

## Casos de uso

- Docencia de aprendizaje por refuerzo: el modelo sirve como ejemplo mínimo y autocontenido de un DQN funcional para explicar en clase la diferencia entre valores Q, política argmax y actualización de red objetivo, sin necesidad de infraestructura de GPU.
- Baseline de comparación de algoritmos: al tener hiperparámetros y puntuación declarados, puede usarse como referencia frente a PPO, A2C o SAC en el mismo entorno, siempre que se reentrene y evalúe bajo el mismo protocolo.
- Pruebas de integración de pipelines de RL: al ocupar 0,0 GB y cargarse con `torch.load`, es útil como smoke test en CI para verificar que un entorno Gymnasium, un wrapper o un sistema de logging funcionan antes de escalar a modelos mayores.
- Generación de vídeos de demostración: cargando el checkpoint y ejecutando episodios con renderizado se obtienen clips de aterrizaje para materiales divulgativos, como el `replay.mp4` incluido en el repositorio.
- Experimentos de evaluación de robustez: modificando las condiciones iniciales o añadiendo ruido al vector de estado puede medirse la degradación de la política, un ejercicio habitual en cursos de RL.
- Punto de partida para fine-tuning con otros algoritmos: el `state_dict` puede inicializar una red Q en variantes como Double DQN o Dueling DQN, comparando la curva de aprendizaje desde un punto no aleatorio.
- Prototipado de sistemas de control con acciones discretas: sirve como plantilla conceptual para tareas de control donde el estado es un vector numérico pequeño y las acciones son un conjunto finito, aunque la transferencia a dominios reales requeriría reentrenamiento completo.

## Benchmarks y rendimiento

Los únicos datos disponibles son los declarados por el autor en el `model-index` de la model card. No están verificados de forma independiente (`verified: false`).

| Tarea | Entorno | Métrica | Valor | Verificado |
|---|---|---|---|---|
| Aprendizaje por refuerzo | LunarLander-v3 | Recompensa media en 10 episodios no vistos (umbral de éxito: 200) | 215,6 | No |

No se han publicado en la información disponible resultados adicionales (curvas de aprendizaje, desviación típica entre semillas, comparación con baselines oficiales de Gymnasium ni evaluaciones con múltiples semillas). No se inventan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos en float32 (18.180 parámetros ≈ 73 kB); en la práctica, cualquier dispositivo sirve.
- GPU recomendadas: no se requiere GPU. Funciona en CPU sin penalización perceptible por paso de inferencia.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU moderna; también en Raspberry Pi y en CPU de un solo núcleo.
- Opciones de despliegue: PyTorch nativo (recomendado, es el único soportado oficialmente); exportación manual a TorchScript u ONNX si se necesita servir el modelo fuera de Python. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles como medición publicada. Por la topología (tres multiplicaciones matriciales de 8×128, 128×128 y 128×4), la latencia esperada por paso es del orden de microsegundos en CPU, pero el cuello de botella real en un bucle completo será el `step` del simulador de Box2D, no la red.
- Almacenamiento: el repositorio completo ocupa 0,0 GB según HuggingFace, es decir, pocos cientos de kilobytes.

## Comparativa con modelos similares

No se dispone de métricas publicadas de los proyectos comunitarios comparables, por lo que la comparación cuantitativa de rendimiento figura como "no disponible".

| Modelo | Tipo | Parámetros | Entorno | Resultado declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| connectailab-rl-nadanayo-v1-lunarlander | DQN con MLP 8→128→128→4 | 18.180 (derivado) | LunarLander-v3 | 215,6 de recompensa media (no verificado) | no disponible | HuggingFace, `model.pt` |
| khushdeepAnand/Lunar-Lander-Ai | RL profundo sobre Lunar Lander | no disponible | Lunar Lander | no disponible | no disponible | GitHub, con logs y checkpoints |
| gokulan006/Lunar-Lander-RL-Model | DQN y otras técnicas de RL profundo | no disponible | Lunar Lander (OpenAI Gym) | no disponible | no disponible | GitHub |
| NADANAYO/connectailab-rl-nadanayo-v1 | LLM Qwen3.5 + LoRA con GRPO para decisión | no disponible | Tarea de decisión con opciones textuales | no disponible | apache-2.0 | HuggingFace |

Como referencia contextual, el propio entorno LunarLander-v3 define en 200 la recompensa media a partir de la cual se considera resuelto, de modo que el valor declarado de 215,6 se sitúa ligeramente por encima de ese umbral. No se dispone de comparaciones con PPO, A2C o SAC bajo un protocolo común en la información proporcionada.

## Limitaciones y advertencias

- El resultado de 215,6 está marcado como no verificado y se calcula sobre solo 10 episodios, una muestra muy pequeña sin desviación típica ni intervalos de confianza; la varianza de LunarLander-v3 es alta y el valor puede no ser representativo.
- La licencia no está especificada, lo que impide asumir permiso para uso comercial o redistribución; es necesario contactar con el autor antes de integrarlo en un producto.
- No se documentan semillas, tamaño de replay buffer, política de decaimiento de epsilon ni función de pérdida, por lo que la reproducibilidad del resultado no está garantizada.
- La política está especializada en la dinámica exacta de LunarLander-v3; no transfiere a otros entornos ni a control real sin reentrenamiento.
- El espacio de acciones es discreto y de cardinalidad 4; no soporta acciones continuas.
- El agente no procesa observaciones visuales ni texto, por lo que no puede emplearse en tareas de NLP, visión o agentes conversacionales.
- Riesgo de sobreajuste a la distribución de estados visitada durante el entrenamiento; con 200.000 pasos y una exploración declarada de 0,3, la cobertura del espacio de estados puede ser limitada en configuraciones iniciales poco frecuentes.
- No hay tarjeta de modelo con sesgos, evaluación de robustez ni análisis de fallos; el `replay.mp4` es la única evidencia cualitativa del comportamiento.
- Al ser un modelo de refuerzo, no existe riesgo de alucinación en sentido lingüístico, pero sí de sobrerrepresentación del valor Q en estados poco visitados, con la consiguiente selección de acciones subóptimas.
- El código de carga exige reconstruir manualmente la arquitectura; una discrepancia en la topología provocará un error de `load_state_dict`, y no se publica script de entrenamiento ni de evaluación en el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NADANAYO/connectailab-rl-nadanayo-v1-lunarlander
- Modelo hermano (LLM con GRPO): https://huggingface.co/NADANAYO/connectailab-rl-nadanayo-v1
- Perfil del autor: https://huggingface.co/NADANAYO/models
- Repositorio CONNECT AI LAB: https://github.com/wonseokjung/connect-tycoon
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Página del modelo en FriendliAI: https://friendli.ai/models/NADANAYO/connectailab-rl-nadanayo-v1
- Proyecto comunitario comparable (Lunar-Lander-Ai): https://github.com/khushdeepAnand/Lunar-Lander-Ai
- Proyecto comunitario comparable (Lunar-Lander-RL-Model): https://github.com/gokulan006/Lunar-Lander-RL-Model
