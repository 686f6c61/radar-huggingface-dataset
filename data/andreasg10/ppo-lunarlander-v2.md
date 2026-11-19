# AndreasG10/ppo-LunarLander-v2

## Resumen

`AndreasG10/ppo-LunarLander-v2` es un agente de aprendizaje por refuerzo profundo entrenado con el algoritmo PPO (Proximal Policy Optimization) para resolver el entorno `LunarLander-v2` de Gymnasium. Lo desarrolla el usuario AndreasG10 como parte del curso de Deep RL de Hugging Face (Unidad 8), siguiendo una implementación de estilo CleanRL con un actor-critic entrenado desde cero en PyTorch. No es un modelo de lenguaje: es un checkpoint de política (policy) específico para una tarea de control continuo en un entorno simulado de aterrizaje lunar.

El modelo resuelve un problema acotado: aprender una política que controle un módulo de aterrizaje en 2D maximizando la recompensa acumulada. El espacio de observación es de 8 dimensiones (posición, velocidad, ángulo, velocidad angular, contacto con el suelo y estado de las patas) y el espacio de acción es discreto con 4 acciones (no hacer nada, encender motor principal, encender motor izquierdo, encender motor derecho). El checkpoint se distribuye como `model.pt` (pesos PyTorch) y ocupa 0.0 GB en el repositorio, lo que indica un modelo de muy pequeño tamaño.

Su relevancia es formativa y de referencia: sirve como ejemplo reproducible de un pipeline de RL con PPO sobre un entorno clásico de Gymnasium, útil para quienes estudian implementaciones de actor-critic, para comparar hiperparámetros y para reproducir el flujo de evaluación del curso. No está pensado para despliegue en producción ni para tareas generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor-critic con redes neuronales (PPO), implementación estilo CleanRL en PyTorch |
| Parametros totales | no disponible (checkpoint `model.pt` de tamaño despreciable, repo de 0.0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL con observación de 8 dimensiones; no hay contexto textual) |
| Tipos de cuantizacion | no disponible (pesos PyTorch en `model.pt`; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`model.pt`) |
| Entorno | LunarLander-v2 (Gymnasium) |
| Espacio de observación | 8 dimensiones (continuo) |
| Espacio de acción | 4 acciones discretas |
| Algoritmo | PPO (Proximal Policy Optimization) |
| Biblioteca | PyTorch |

## Arquitectura y entrenamiento

El agente sigue el esquema actor-critic de PPO: una red de política (actor) que produce una distribución sobre las 4 acciones discretas y una red de valor (crítico) que estima el retorno esperado del estado. La implementación está adaptada de la Unidad 8 del curso de Deep RL de Hugging Face, con un estilo CleanRL, es decir, un único fichero de entrenamiento con hiperparámetros explícitos y sin abstracciones de frameworks de RL de alto nivel. El entrenamiento se realiza desde cero con PyTorch y Gymnasium sobre el entorno `LunarLander-v2`.

No se documentan en la información disponible el número de tokens (no aplica), la composición del dataset (el agente aprende por interacción con el simulador, no de un corpus), ni si hubo RLHF o DPO (no aplica a RL clásico). Tampoco se detallan hiperparámetros como la tasa de aprendizaje, el número de pasos de entorno, el tamaño de las redes ocultas ni el coeficiente de entropía. La evaluación reportada se realizó sobre 10 episodios deterministas, con un resultado de recompensa media de -28.14 con desviación estándar de 64.96.

## Capacidades

- Control de política en el entorno `LunarLander-v2`: selecciona entre 4 acciones discretas a partir de observaciones de 8 dimensiones.
- Aprendizaje por refuerzo con PPO: implementación actor-critic reproducible, útil como referencia didáctica.
- Evaluación determinista: el checkpoint permite ejecutar episodios con política determinista para medir recompensa media.
- Reproducibilidad: incluye `model.pt`, `results.json` y, si está presente, `replay.mp4` para inspección visual.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes multi-step en el sentido de LLM; su "razonamiento" se limita a la política de control del entorno.
- No tiene capacidades multilingües, de visión, audio ni modo de pensamiento (thinking mode).
- No es un modelo generativo de texto.

## Casos de uso

- Docencia y estudio de PPO: usar el checkpoint y el código asociado como ejemplo reproducible de actor-critic en un entorno clásico de Gymnasium, comparando hiperparámetros y curvas de aprendizaje.
- Reproducción de resultados del curso de Deep RL: ejecutar la evaluación sobre 10 episodios deterministas y contrastar la recompensa media reportada (-28.14 +/- 64.96).
- Línea base para experimentos de RL: servir como referencia inicial antes de probar variantes (SAC, A2C, DQN) sobre `LunarLander-v2`.
- Análisis de estabilidad del entrenamiento: estudiar la alta varianza (desviación estándar de 64.96) como caso de política no convergida y diseñar mejoras (ajuste de entropía, clipping, normalización de recompensas).
- Generación de vídeos de replay: inspeccionar cualitativamente el comportamiento del agente mediante `replay.mp4` para detectar fallos de aterrizaje.
- Integración en pipelines de evaluación de RL: cargar `model.pt` en scripts de evaluación automatizados para comparar checkpoints entre unidades del curso.
- Prototipado de entornos Gymnasium: usar el agente como plantilla para adaptar el código a otros entornos de acción discreta con observaciones continuas.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Benchmark | Métrica | Valor | Verificado |
|---|---|---|---|
| LunarLander-v2 (10 episodios deterministas) | mean_reward | -28.14 +/- 64.96 | No |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima (el checkpoint `model.pt` es de tamaño despreciable; el repo ocupa 0.0 GB). Cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU; cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) puede ejecutar la inferencia sin problema, pero es sobredimensionada para esta tarea.
- Cabe en consumer GPU: sí, en todas; también en CPU y en entornos sin acelerador.
- Opciones de despliegue: PyTorch nativo (carga de `model.pt`), scripts de evaluación con Gymnasium; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un agente de RL).
- Latencia y throughput estimados: no disponibles en la información proporcionada; al tratarse de una red pequeña, la latencia por paso de entorno será del orden de microsegundos a milisegundos en CPU, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se puede indicar que existen otros agentes PPO para `LunarLander-v2` en el ecosistema de Hugging Face y CleanRL, pero no se aportan datos concretos de parámetros, contexto ni rendimiento para establecer una comparativa rigurosa.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AndreasG10/ppo-LunarLander-v2 | no disponible | no aplica | mean_reward -28.14 +/- 64.96 | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Política no convergida: la recompensa media de -28.14 con desviación estándar de 64.96 indica un rendimiento pobre y alta varianza; en `LunarLander-v2` se considera resuelto a partir de 200 de recompensa media, por lo que este agente está lejos de ese umbral.
- Sesgos: al entrenarse únicamente en el simulador `LunarLander-v2`, la política está sesgada hacia la dinámica exacta de ese entorno y no generaliza a otros entornos ni a condiciones físicas distintas.
- Riesgo de alucinación: no aplica en el sentido de LLM, pero sí existe riesgo de comportamientos erráticos fuera de la distribución de estados vista durante el entrenamiento.
- Limitaciones de contexto o idioma: no aplica; el modelo no procesa texto ni tiene ventana de contexto.
- Restricciones de licencia: licencia MIT, permite uso comercial y modificación con atribución; no obstante, el uso comercial de un agente con rendimiento negativo en su tarea no es recomendable.
- Caveats para producción: no es un modelo de propósito general; no debe desplegarse como componente de un sistema de producción sin un reentrenamiento y una evaluación exhaustiva. La verificación del benchmark es `false`, por lo que los resultados no están auditados de forma independiente.
- Tamaño del repo de 0.0 GB: indica que los pesos son muy pequeños; conviene verificar que `model.pt` se ha subido correctamente y no está vacío o corrupto.

## Enlaces

- Hugging Face: https://huggingface.co/AndreasG10/ppo-LunarLander-v2
- Curso de Deep RL de Hugging Face (Unidad 8, referencia del autor): no disponible en la información proporcionada
- CleanRL (implementación de referencia citada): no disponible en la información proporcionada
- Gymnasium / LunarLander-v2: no disponible en la información proporcionada
- Paper de PPO (Schulman et al.): no disponible en la información proporcionada
