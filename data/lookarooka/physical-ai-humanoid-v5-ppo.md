# lookarooka/Physical-ai-humanoid-v5-ppo

## Resumen

El modelo `lookarooka/Physical-ai-humanoid-v5-ppo` es un checkpoint de red neuronal de control para el entorno MuJoCo Humanoid-v5, un robot humanoide 3D simulado dentro del ecosistema Gymnasium. Ha sido desarrollado por el autor lookarooka (AN IL) como parte de un estudio de "Physical AI" y entrenado con el algoritmo PPO (Proximal Policy Optimization) en su variante actor-crítico continua. El modelo resuelve el problema de control de un robot bípedo con 17 articulaciones continuas, generando acciones de actuación a partir de un espacio de observación de 348 dimensiones.

La relevancia de este modelo reside en su carácter demostrativo: es un ejemplo de aplicación de aprendizaje por refuerzo a la robótica física simulada, con una licencia MIT que permite su reutilización libre. El entrenamiento es extremadamente corto (183 episodios y 3460 pasos de tiempo), lo que lo sitúa como un artefacto educativo o de prototipado más que como una política lista para producción. Los pesos se almacenan en un único archivo JSON (`model_weights.json`) que contiene los parámetros de las redes actor y crítico, y se carga a través del dashboard web Physical AI Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Continuous Actor-Critic (PPO) |
| Parametros totales | no disponible (pesos en JSON, sin conteo publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ko (solo metadatos; no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | JSON (`model_weights.json`) |

## Arquitectura y entrenamiento

El modelo implementa una arquitectura actor-crítico continua entrenada con PPO, un algoritmo de gradiente de política que equilibra la exploración y la estabilidad mediante recortes de la razón de probabilidad. La red actor genera acciones continuas para los 17 actuadores del humanoide, mientras que la red crítico estima la función de valor para guiar la actualización de la política. El espacio de observación es de 348 dimensiones, de las cuales 45 corresponden al estado central del robot (posiciones, velocidades y contactos) y el resto a información adicional del entorno.

El entrenamiento se realizó en el entorno MuJoCo Humanoid-v5 de Gymnasium, un simulador de física 3D que modela un robot bípedo con torso, cabeza y extremidades articuladas. Se ejecutaron 183 episodios con un total de 3460 pasos de tiempo, una cantidad muy reducida para los estándares de RL en control robótico (los entrenamientos típicos requieren millones de pasos). No se dispone de información sobre el dataset de recompensas, la configuración de hiperparámetros del PPO (tasa de aprendizaje, factor de descuento, tamaño de lote) ni sobre el uso de técnicas adicionales como normalización de observaciones o clipping de recompensas.

## Capacidades

- Control de un robot humanoide 3D en el simulador MuJoCo Humanoid-v5, generando acciones continuas para 17 articulaciones.
- Política de caminata y equilibrio básico aprendida mediante refuerzo, aunque con un entrenamiento muy limitado en duración.
- Integración con el ecosistema Gymnasium, lo que permite evaluar la política en el entorno estándar de la comunidad.
- Carga y ejecución a través del dashboard Physical AI Studio, que facilita la inspección y reutilización de los pesos.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, ni razonamiento simbólico, ni capacidades multimodales.

## Casos de uso

- Investigación educativa en aprendizaje por refuerzo: el modelo sirve como ejemplo de referencia para estudiantes que quieran entender cómo se estructura una política PPO actor-crítico para control continuo, ya que los pesos son inspeccionables en formato JSON.
- Prototipado de controladores para robots humanoides simulados: permite probar rápidamente la integración de una política RL en un pipeline de simulación MuJoCo antes de escalar a entrenamientos más largos.
- Comparación de algoritmos de RL: al ser un checkpoint PPO estándar, puede usarse como línea base para comparar con políticas entrenadas con SAC, TD3 o DDPG en el mismo entorno.
- Desarrollo de curriculum de aprendizaje: el modelo puede servir como punto de partida para fine-tuning con recompensas modificadas o entornos con perturbaciones, dado su bajo coste de entrenamiento.
- Validación de infraestructura de simulación: útil para verificar que un entorno MuJoCo Humanoid-v5 está correctamente configurado, ya que cargar la política y observar su comportamiento confirma que el simulador funciona.
- Demostración de transferencia de pesos entre plataformas: el formato JSON permite estudiar cómo se pueden exportar e importar pesos de redes neuronales entre diferentes frameworks de RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de recompensa media, éxito en tareas de locomoción, ni comparaciones con otras políticas para Humanoid-v5 en la model card o en los resultados de búsqueda.

## Requisitos de hardware

- El modelo es extremadamente ligero: los pesos se almacenan en un archivo JSON de red neuronal pequeña, por lo que la inferencia puede ejecutarse en CPU sin necesidad de GPU.
- VRAM estimada: no aplica; la carga en memoria es del orden de kilobytes o pocos megabytes.
- GPU recomendadas: ninguna; cualquier hardware con Python y Gymnasium instalado es suficiente.
- Compatible con equipos de consumo: sí, incluyendo portátiles sin tarjeta gráfica dedicada.
- Opciones de despliegue: el modelo se carga exclusivamente a través del dashboard Physical AI Studio, aunque los pesos JSON podrían importarse manualmente en cualquier framework que soporte redes feedforward (PyTorch, TensorFlow, JAX) con un adaptador.
- Latencia y throughput: no disponibles; al ser una política de control en simulación, la latencia depende del coste de MuJoCo, no del modelo en sí.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Episodios | Pasos | Formato | Licencia |
|---|---|---|---|---|---|---|
| lookarooka/Physical-ai-humanoid-v5-ppo | MuJoCo Humanoid-v5 | PPO | 183 | 3460 | JSON | MIT |
| ProfessorNova/PPO-Humanoid | MuJoCo Humanoid-v5 | PPO | no disponible | no disponible | PyTorch (.pt) | no disponible |
| Políticas estándar de RLlib/Stable-Baselines3 para Humanoid-v5 | MuJoCo Humanoid-v5 | PPO/SAC | miles | millones | zip/pth | MIT/Apache-2.0 |

La comparativa muestra que este modelo se distingue por su entrenamiento extremadamente corto y su formato de pesos en JSON, frente a las implementaciones de referencia que suelen entrenarse durante millones de pasos y almacenarse en formatos binarios nativos de frameworks. No se dispone de datos de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Entrenamiento insuficiente: con solo 183 episodios y 3460 pasos de tiempo, la política probablemente no ha convergido y puede mostrar comportamientos erráticos o caídas frecuentes del humanoide.
- Alcance limitado: la política está entrenada exclusivamente para el entorno MuJoCo Humanoid-v5; no es transferible directamente a otros robots o simuladores sin reentrenamiento.
- Sin documentación de hiperparámetros: no se publican la tasa de aprendizaje, el factor de descuento, el tamaño de lote ni la función de recompensa, lo que dificulta la reproducibilidad.
- Formato propietario de carga: la carga oficial requiere el dashboard Physical AI Studio, lo que limita la portabilidad a otros entornos de desarrollo.
- No es un modelo de lenguaje: a pesar de los metadatos de idioma (en, ko), no genera texto ni tiene capacidades lingüísticas; esos campos son informativos del autor.
- Sin benchmarks publicados: no hay evidencia cuantitativa del rendimiento de la política en tareas de locomoción.
- Riesgo de sobreajuste al entorno específico: al ser un checkpoint de un solo entrenamiento, puede estar adaptado a las condiciones iniciales particulares de la semilla utilizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lookarooka/Physical-ai-humanoid-v5-ppo
- Perfil del autor: https://huggingface.co/lookarooka
- Repositorio de referencia PPO-Humanoid (GitHub): https://github.com/ProfessorNova/PPO-Humanoid
- Documentación de MuJoCo Humanoid-v5 en Gymnasium: no disponible en los resultados de búsqueda
- Sitio de Physical AI Studio: no disponible en los resultados de búsqueda
