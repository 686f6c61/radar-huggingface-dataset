# Jasmin71/connectailab-rl-mihyun-v1-lunarlander

## Resumen

connectailab-rl-mihyun-v1-lunarlander es un agente de aprendizaje por refuerzo entrenado con Deep Q-Network (DQN) para resolver el entorno LunarLander-v3 de Gymnasium, en el que un módulo debe aterrizar de forma controlada sobre una plataforma aplicando empuje con dos motores laterales y uno central. Lo desarrolla Jasmin71 en el marco del programa educativo CONNECT AI LAB, en colaboración con AI CITY BUILDERS, como artefacto didáctico de un curso de introducción al RL: el propio autor lo describe como "el cerebro" entrenado durante la quinta lección.

No es un modelo de lenguaje ni un transformer: es una red neuronal densa muy pequeña (perceptrón multicapa) que aproxima la función Q. La entrada es un vector de 8 números reales (posición x e y, velocidad x e y, ángulo, velocidad angular y dos indicadores booleanos de contacto de cada pierna) y la salida son 4 valores Q, uno por acción discreta (no hacer nada, motor izquierdo, motor central, motor derecho). Con 18.180 parámetros, su interes no esta en el rendimiento bruto sino en ser un ejemplo reproducible y ligero de un pipeline completo de RL.

Su relevancia actual es la de un caso de referencia: sirve para comparar curvas de aprendizaje e hiperparámetros de DQN, para ilustrar el flujo de publicación de políticas en el Hub de HuggingFace y para demostrar que un agente funcional en LunarLander cabe en unos pocos kilobytes y se ejecuta en CPU. El autor declara una puntuación media de 215,6 en 10 partidas no vistas (el umbral de éxito del entorno es 200), un dato no verificado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) totalmente conectado: 8 → 128 → 128 → 4, activación ReLU entre capas; aproximador de función Q para DQN |
| Parametros totales | 18.180 (calculado a partir de la arquitectura declarada: 1.152 + 16.512 + 516, sesgos incluidos) |
| Parametros activos | No aplica: no es un modelo MoE (mezcla de expertos) |
| Longitud de contexto | No aplica: el agente no procesa secuencias; recibe un vector de estado de 8 dimensiones en cada paso |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en precisión nativa de PyTorch. No se documentan versiones GGUF, int8 ni int4 |
| Idiomas soportados | No aplica: no procesa lenguaje natural |
| Licencia | No disponible (la model card no declara licencia) |
| Formato de pesos | `model.pt` (state_dict de PyTorch, cargable con `torch.load` y `load_state_dict`) |

## Arquitectura y entrenamiento

La política es una red puramente feed-forward sin recurrencia ni memoria: tres capas densas (8→128, 128→128, 128→4) con ReLU en las dos capas ocultas y salida lineal de 4 valores Q. La acción se selecciona por `argmax` sobre esas 4 salidas, es decir, de forma determinista y greedy en inferencia. El entrenamiento es DQN estándar sobre el espacio de acciones discreto de LunarLander-v3; la model card detalla los hiperparámetros: 200.000 pasos totales de entorno, 128 unidades ocultas, tasa de aprendizaje 0,0005, factor de descuento gamma 0,99, fracción de exploración 0,3, actualización de la red objetivo cada 500 pasos y tamaño de lote 128.

No se especifica en la información disponible la composición del buffer de repetición, el tamaño del epsilon inicial y final, el optimizador, ni si se emplearon variantes como Double DQN, Dueling DQN o Prioritized Experience Replay. Tampoco se documenta el presupuesto de cómputo (hardware, tiempo de entrenamiento) ni el número de semillas ejecutadas. La única innovación técnica reseñable es la red objetivo con actualización periódica (cada 500 pasos), implícita en la configuración descrita; no se mencionan técnicas de decodificación especulativa, atención lineal ni mecanismos equivalentes, que no aplican a este tipo de modelo.

## Capacidades

- Control de políticas en entornos con espacio de acciones discreto: selecciona una de 4 acciones a partir de un estado de 8 variables.
- Aprendizaje por refuerzo off-policy mediante DQN con red objetivo y actualización por lotes.
- Resolución del entorno LunarLander-v3 con una puntuación declarada por encima del umbral de éxito (215,6 frente a 200).
- Inferencia determinista (argmax), reproducible y sin muestreo estocástico, adecuada para demostraciones y evaluación controlada.
- Ejecución en CPU con dependencias mínimas (PyTorch); no requiere GPU ni tokenizadores.
- Serialización compacta: el state_dict completo ocupa aproximadamente 73 KB en fp32, lo que permite distribuirlo junto a un cuaderno o un vídeo de demostración.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas, código, visión, audio ni capacidades multilingües; es un agente específico de una única tarea de control.

## Casos de uso

- Docencia de aprendizaje por refuerzo: el modelo sirve como política ya entrenada para que el alumnado inspeccione el comportamiento de un DQN, compare la selección greedy con una política aleatoria y visualice el efecto de los hiperparámetros en el aterrizaje.
- Línea base (baseline) en experimentos de comparación de algoritmos: al tener 18.180 parámetros y una puntuación declarada de 215,6, se puede usar como referencia fija frente a PPO, A2C o SAC en LunarLander-v3, controlando así el coste de reentrenar una política de referencia en cada prueba.
- Demostración embebida en material didáctico o web: los 73 KB de pesos permiten cargar el agente en el navegador (por ejemplo, con ONNX Runtime Web o TensorFlow.js tras exportar) o en una aplicación de escritorio y renderizar el aterrizaje sin infraestructura de servidor.
- Prueba de integración de un pipeline de publicación de modelos: el repositorio ilustra el flujo completo de subida a HuggingFace Hub, descarga con `hf_hub_download`, carga de `state_dict` y declaración de métricas mediante `model-index`, útil para validar herramientas internas de MLOps.
- Punto de partida para ajuste fino y extensiones: al ser una red pequeña y entrenada en 200.000 pasos, es viable reentrenarla desde cero en minutos en CPU o GPU para experimentar con reward shaping, currículos o variantes del entorno (por ejemplo, LunarLander continuo).
- Destilación o imitación de políticas: las 4 salidas Q pueden emplearse como etiquetas para entrenar una política estudiante o para generar datos de comportamiento en experimentos de imitation learning y offline RL.
- Validación de infraestructura de evaluación de agentes: sirve para comprobar que un banco de pruebas (número de episodios, semillas, cálculo de recompensa media) reproduce de forma aproximada el valor declarado antes de lanzar experimentos más costosos.

## Benchmarks y rendimiento

| Tarea | Conjunto de evaluacion | Metrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | LunarLander-v3 (Gymnasium) | mean_reward: puntuación media en 10 partidas no vistas (200 o más = éxito) | 215,6 | No (`verified: false`) |

No se han publicado otros resultados de benchmarks en la información disponible. No hay datos de desviación típica, número de semillas, intervalo de confianza ni comparación con políticas de referencia medidas por el autor. El valor de 215,6 procede de la model card y no ha sido reproducido de forma independiente.

## Requisitos de hardware

- VRAM para inferencia: inferior a 1 MB en fp32 (18.180 parámetros ≈ 73 KB de pesos); cualquier dispositivo con PyTorch instalado es suficiente.
- GPU recomendadas: ninguna en particular; el modelo se ejecuta en CPU sin penalización perceptible. Cualquier GPU consumer (GTX 1060, RTX 3050, RTX 4090) o acelerador integrado sirve, y el cuello de botella será el renderizado del entorno, no la red.
- Cabe en GPU consumer: sí, con un margen de órdenes de magnitud; también en Raspberry Pi y en entornos sin GPU.
- Opciones de despliegue: PyTorch nativo (`torch.load` + `load_state_dict`), exportación a TorchScript u ONNX para inferencia sin Python, y carga en aplicaciones web mediante ONNX Runtime Web. No aplican vLLM, TGI, llama.cpp ni Ollama, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles como medición publicada. Por el tamaño de la red (unas 36.000 operaciones MAC por paso) la latencia por decisión es del orden de microsegundos en CPU; el coste real de un episodio lo domina la física y el renderizado de LunarLander-v3.

## Comparativa con modelos similares

| Modelo | Algoritmo | Parametros | Espacio de acciones | Entorno | Licencia | Resultado declarado |
|---|---|---|---|---|---|---|
| connectailab-rl-mihyun-v1-lunarlander | DQN (off-policy, value-based) | 18.180 | Discreto (4) | LunarLander-v3 | No disponible | 215,6 de recompensa media en 10 episodios |
| DQN de referencia (Stable-Baselines3, `MlpPolicy`) | DQN | No disponible | Discreto | LunarLander-v3 | No disponible en esta información | No disponible |
| PPO de referencia (Stable-Baselines3, `MlpPolicy`) | PPO (on-policy, policy gradient) | No disponible | Discreto | LunarLander-v3 | No disponible en esta información | No disponible |
| A2C de referencia (Stable-Baselines3, `MlpPolicy`) | A2C (on-policy, actor-critic) | No disponible | Discreto | LunarLander-v3 | No disponible en esta información | No disponible |

No se dispone de resultados medidos de las alternativas en la información proporcionada, por lo que la comparación numérica queda abierta. A nivel cualitativo, DQN es off-policy y reutiliza transiciones pasadas, lo que suele ser más eficiente en muestras que PPO o A2C en LunarLander-v3, a costa de mayor sensibilidad a los hiperparámetros y de una estabilidad de entrenamiento más delicada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documenta ningún análisis de sesgo. Al ser un agente de control en un simulador físico, no hay sesgos lingüísticos ni sociales, pero sí puede heredar los del generador de terrenos y la dinámica de LunarLander-v3.
- Riesgo de alucinación: no aplica en el sentido habitual; el riesgo equivalente es la sobreestimación de valores Q fuera de la distribución de estados visitados, típica de DQN, que puede producir acciones erráticas ante perturbaciones no vistas.
- La métrica de 215,6 está marcada como `verified: false` y no se acompaña de desviación típica, número de semillas ni protocolo de evaluación, por lo que no debe tratarse como un resultado reproducible sin volver a evaluarla.
- Generalización muy limitada: la política está especializada en LunarLander-v3 con el vector de observación de 8 dimensiones; no funciona en variantes con observaciones continuas o aumentadas ni en otros entornos sin reentrenar.
- Licencia no declarada: no hay autorización explícita de uso comercial, redistribución ni obra derivada. Antes de integrarlo en un producto conviene contactar con el autor.
- Ausencia de documentación sobre el proceso de entrenamiento (semillas, buffer, epsilon, optimizador, hardware) e inexistencia de métricas de robustez, lo que dificulta la reproducibilidad.
- Artefacto de tamaño cero en el Hub (0.0 GB de repositorio) en el momento de la consulta: conviene verificar que `model.pt` y `replay.mp4` están realmente disponibles antes de depender de ellos.
- Sin soporte de texto, visión, audio ni tool calling; no debe evaluarse ni presentarse como un modelo de lenguaje.
- Política determinista en inferencia: útil para demostraciones, pero sin exploración, lo que puede hacer que se atasque en óptimos locales de comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jasmin71/connectailab-rl-mihyun-v1-lunarlander
- Repositorio CONNECT AI LAB (GitHub): https://github.com/wonseokjung/connect-tycoon
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Blog del autor: https://blog.naver.com/thot71
