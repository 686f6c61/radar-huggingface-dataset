# Boustie/AdrienB

## Resumen

AdrienB es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) mediante la librería Stable-Baselines3 para resolver el entorno LunarLander-v3 de Gymnasium. No se trata de un modelo de lenguaje ni de un transformer generativo, sino de una política neuronal compacta que mapea observaciones continuas del entorno (posición, velocidad, ángulo, contacto con el suelo) a acciones discretas de control de un módulo de aterrizaje lunar simulado. El autor lo publica en Hugging Face bajo el identificador Boustie/AdrienB con el objetivo de servir como artefacto reproducible de un experimento de RL.

El modelo declara una recompensa media de 261,30 +/- 17,81 en LunarLander-v3, métrica que se sitúa por encima del umbral habitual de 200 considerado como resolución del entorno. Es relevante únicamente en el contexto de demostraciones, docencia o comparación de algoritmos de RL; no tiene aplicación como modelo de propósito general ni capacidades de generación de texto, código o visión.

La ficha se limita a lo que el autor ha publicado: la model card está incompleta (el bloque de uso contiene un TODO sin código funcional), no se especifican hiperparámetros, arquitectura de la red ni semilla de entrenamiento, y el repositorio ocupa 0,0 GB, lo que sugiere pesos muy pequeños o un empaquetado mínimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal de aprendizaje por refuerzo (PPO) sobre Stable-Baselines3; topología de capas no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; observaciones del entorno LunarLander-v3) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | pesos de Stable-Baselines3 (`.zip`), según la librería declarada; no confirmado en el repo |
| Entorno de entrenamiento | LunarLander-v3 (Gymnasium) |
| Algoritmo | PPO |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

El agente se entrena con PPO, un algoritmo de gradiente de política con recorte de la ratio de probabilidad (*clipped surrogate objective*) que estabiliza las actualizaciones mediante una región de confianza aproximada. En Stable-Baselines3, PPO se implementa con una red de política y una red de valor separadas (o compartidas, según configuración), típicamente perceptrones multicapa con activación tanh. La model card no detalla el número de capas, unidades por capa, tasa de aprendizaje, tamaño de lote, número de pasos de entorno, coeficiente de entropía ni factor de descuento, por lo que estos hiperparámetros deben considerarse no disponibles.

LunarLander-v3 es un entorno de control continuo con acciones discretas (cuatro comandos: no hacer nada, encender motor principal, encender motor lateral izquierdo, encender motor lateral derecho) y un espacio de observación de ocho dimensiones. La recompensa combina proximidad al punto de aterrizaje, velocidad, ángulo, consumo de combustible y contacto de las patas con el suelo. No hay información sobre el número total de pasos de entrenamiento, la composición de episodios, el uso de recompensas conformadas ni técnicas adicionales como *reward normalization* o *frame stacking*. Tampoco se documenta ninguna innovación técnica más allá del uso estándar de PPO.

## Capacidades

- Control de política en el entorno LunarLander-v3: produce acciones discretas a partir de observaciones continuas de ocho dimensiones.
- Aprendizaje por refuerzo profundo: política entrenada con PPO, reproducible mediante Stable-Baselines3.
- Evaluación cuantitativa declarada: recompensa media de 261,30 +/- 17,81 en el entorno de referencia.
- No soporta generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No soporta *tool calling* ni *function calling*.
- No soporta agentes multi-paso fuera del bucle de interacción propio del entorno de RL.
- No tiene capacidades multilingües.
- No dispone de modo *thinking*, visión ni audio.

## Casos de uso

- Docencia de aprendizaje por refuerzo: servir como ejemplo funcional de un agente PPO entrenado en LunarLander-v3 para ilustrar el ciclo observación-acción-recompensa en un curso introductorio.
- Reproducción de experimentos: cargar los pesos con `huggingface_sb3` y `stable_baselines3` para verificar la recompensa declarada y comparar contra una política entrenada desde cero.
- Comparación de algoritmos: usar el agente como línea base PPO frente a otros algoritmos (A2C, DQN, SAC) en el mismo entorno, siempre que se documenten las condiciones de evaluación.
- Pruebas de infraestructura de RL: validar pipelines de entrenamiento, evaluación y registro de métricas en entornos simulados de bajo coste computacional.
- Demostraciones interactivas: integrar el agente en un visualizador de Gymnasium para mostrar el aterrizaje en tiempo real en charlas o tutoriales.
- Investigación sobre estabilidad de PPO: analizar la varianza de la recompensa (desviación de 17,81) como indicador de la robustez de la política ante distintas semillas de evaluación.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Algoritmo | Entorno | Métrica | Valor |
|---|---|---|---|
| PPO | LunarLander-v3 | mean_reward | 261,30 +/- 17,81 |

No se han publicado resultados de benchmarks adicionales en la información disponible. No hay comparación con otros agentes ni desglose por episodios, semillas o número de evaluaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; una política MLP para un espacio de observación de 8 dimensiones y 4 acciones ocupa del orden de kilobytes a unos pocos megabytes, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU; cualquier CPU moderna es suficiente para inferencia en tiempo real del entorno LunarLander-v3.
- Cabe en GPU consumer: sí, en cualquier modelo (GTX 1050, RTX 3060, RTX 4090, etc.), aunque no es necesario.
- Opciones de despliegue: `stable_baselines3` con `huggingface_sb3` para carga desde el Hub; no aplica vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles; dependen principalmente del paso del entorno y del renderizado, no de la red.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Métrica declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Boustie/AdrienB (PPO) | Agente RL (Stable-Baselines3) | LunarLander-v3 | 261,30 +/- 17,81 | no disponible | Hugging Face |
| Agente PPO de referencia SB3 | Agente RL (Stable-Baselines3) | LunarLander-v3 | no disponible en esta ficha | MIT (código SB3) | Documentación de SB3 |
| Agente DQN de referencia SB3 | Agente RL (Stable-Baselines3) | LunarLander-v3 | no disponible en esta ficha | MIT (código SB3) | Documentación de SB3 |

No se dispone de datos verificados de otros agentes comparables en la información proporcionada; las filas de referencia de SB3 se incluyen solo como categoría y no como comparación numérica.

## Limitaciones y advertencias

- Model card incompleta: el bloque de uso contiene un TODO y no incluye código funcional de carga ni de evaluación.
- Sin licencia declarada: no se puede asumir permiso para uso comercial ni redistribución; es necesario contactar con el autor.
- Métrica no verificada: el campo `verified` del model-index es `false`, por lo que la recompensa de 261,30 +/- 17,81 no ha sido validada de forma independiente.
- Sin hiperparámetros ni detalles de entrenamiento: imposible reproducir el resultado a partir de la información publicada.
- Especialización extrema: solo opera en LunarLander-v3; no generaliza a otros entornos ni tareas.
- Riesgo de sobreajuste al entorno: la política puede explotar particularidades del simulador y no transferir a dinámicas físicas reales.
- Sin información sobre sesgos: al no tratar datos humanos ni lenguaje, no aplican sesgos sociales típicos, pero tampoco hay auditoría alguna.
- Sin soporte ni mantenimiento documentado: repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validación por la comunidad.
- No apto para producción como servicio de inferencia general: su ámbito es la simulación y la experimentación en RL.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Boustie/AdrienB
- Librería Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- Utilidad huggingface_sb3: https://github.com/huggingface/huggingface_sb3
- Entorno LunarLander-v3 (Gymnasium): https://gymnasium.farama.org/environments/box2d/lunar_lander/
