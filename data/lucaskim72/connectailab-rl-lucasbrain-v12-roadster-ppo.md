# lucaskim72/connectailab-rl-lucasbrain-v12-roadster-ppo

## Resumen

`connectailab-rl-lucasbrain-v12-roadster-ppo` es un agente de aprendizaje por refuerzo (RL) entrenado con PPO para una tarea de control continuo: aterrizar un "roadster invertido" en un simulador 2D tipo Gymnasium. No es un modelo de lenguaje ni un transformer generativo; es una política neuronal pequeña (MLP con dos capas ocultas de 64 unidades y activación Tanh) que mapea un vector de estado de 7 dimensiones a una acción continua de 2 dimensiones (empuje del propulsor inferior entre 0 y 1, y par de rotación entre -1 y 1). Lo publica Lucas Kim (AI Build Master) como parte de la serie de experimentos de RL del curso de CONNECT AI LAB × AI CITY BUILDERS.

El modelo resuelve un problema muy acotado: el control de aterrizaje de un vehículo con dinámica de cuerpo rígido en 2D. El estado incluye posición (x, y), velocidad (x, y), orientación codificada como seno y coseno del ángulo, y velocidad angular. La recompensa se basa en las condiciones de aterrizaje del simulador: estar dentro de la plataforma, con inclinación y velocidades vertical y horizontal dentro de umbrales. El autor reporta una tasa de aterrizaje del 100 % sobre 50 episodios de validación con semillas no vistas (9000–9049) y una puntuación media de 119,23.

Su relevancia es la de un artefacto didáctico reproducible: documenta de forma inusualmente detallada una ablación sistemática de hiperparámetros de PPO (clip, número de entornos, learning rate, total de pasos, bonus de entropía) sobre 12 versiones, con métricas de retención y correlaciones. No compite con modelos fundacionales; sirve como referencia para entender el efecto de cada hiperparámetro en una tarea de control continuo concreta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP (actor-crítico separado, 2 capas ocultas de 64 unidades, activación Tanh); política gaussiana con desviación típica aprendida |
| Parámetros totales | no disponible (estimable en el orden de ~10^4 a partir de las dimensiones 7→64→64→2 y 7→64→64→1) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de 7 dimensiones de estado) |
| Tipos de cuantización | no disponible (pesos en `model.pt` de PyTorch, sin versiones GGUF/ONNX publicadas) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (checkpoint PyTorch con `state_dict`) |

## Arquitectura y entrenamiento

La política es un perceptrón multicapa con dos torres independientes: una para el actor (salida de 2 dimensiones, media de una distribución Normal) y otra para el crítico (salida escalar de valor). Cada torre usa `Linear(7,64) → Tanh → Linear(64,64) → Tanh → Linear(64, salida)`. En la variante continua, la desviación típica se modela como un parámetro libre inicializado a -0,5 en escala logarítmica, expandido a la forma de la salida. El entrenamiento es PPO estándar con GAE (lambda 0,95, gamma 0,99), 10 épocas por actualización, minibatch de 256, clip de 0,2, learning rate 3e-4 y sin bonus de entropía en la versión final. Se usan 16 entornos paralelos con rollouts de 256 pasos y un total de 2.000.000 de pasos de entorno.

El autor documenta una ablación de 12 versiones sobre el mismo entorno joystick. Los hallazgos principales: reducir el número de entornos de 8 a 2 degrada la tasa de aterrizaje en 64 puntos; bajar el learning rate a 1e-4 la degrada en 58 puntos; aumentar el clip a 0,5 la degrada en 22 puntos; reducir el total de pasos a 500.000 la degrada en 22 puntos. Aumentar entornos a 16 o pasos a 2M no mejora respecto a la base de 1M, salvo la combinación final (16 entornos + 2M pasos) que alcanza el 100 %. El bonus de entropía de 0,01 degrada 4 puntos. No se reporta uso de RLHF ni DPO (no aplica), ni innovaciones como decodificación especulativa.

## Capacidades

- Control continuo de un vehículo 2D: produce empuje del propulsor inferior (0 a 1) y par de rotación (-1 a 1) a partir de 7 variables de estado.
- Aterrizaje autónomo en una plataforma bajo condiciones de inclinación y velocidad acotadas.
- Política determinista en evaluación (se usa la media de la distribución gaussiana, recortada a los límites de acción).
- Reproducibilidad: el checkpoint incluye el `state_dict` cargable con la clase `정책두뇌` documentada en la model card.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, visión, audio ni capacidades multilingües.
- No es un modelo de propósito general: su dominio de aplicación está limitado al simulador `로드스터_시뮬레이터.py` y a la variante "roadster continuo (joystick)".

## Casos de uso

- Docencia de PPO en control continuo: el paquete incluye la política, los hiperparámetros exactos y una tabla de ablaciones, lo que permite reproducir el experimento y estudiar el efecto de cada hiperparámetro sin partir de cero.
- Referencia de línea base para tareas de aterrizaje 2D: sirve como punto de comparación al evaluar algoritmos alternativos (SAC, TD3, DDPG) sobre el mismo entorno Gymnasium.
- Estudio de sensibilidad a hiperparámetros: la tabla de 12 versiones permite analizar empíricamente cómo varía la tasa de éxito con el número de entornos, el learning rate o el clip de PPO.
- Integración en un pipeline de simulación a política: el checkpoint puede cargarse con `torch.load` y ejecutarse en CPU para generar trayectorias de evaluación o datos de imitación (behavior cloning) a partir de la política entrenada.
- Prototipo de control para vehículos con dinámica similar: la estructura estado→acción (posición, velocidad, orientación, velocidad angular → empuje y par) es trasladable, con reentrenamiento, a otros dominios de aterrizaje o acoplamiento en 2D.
- Demostración de despliegue mínimo: al ser una red de ~10^4 parámetros, cabe en cualquier CPU y no requiere GPU, lo que facilita su uso en entornos educativos o embebidos de bajo coste.

## Benchmarks y rendimiento

Los únicos datos publicados son la tasa de aterrizaje sobre 50 semillas de validación (9000–9049) y la puntuación media. No hay MMLU, HumanEval ni GSM8K (no aplica).

| Versión | Configuración destacada | Tasa de aterrizaje (50 episodios) | Diferencia vs. base |
|---|---|---|---|
| v1 | Botones, bonus entropía 0,01, 1M pasos | 94,0 % | — |
| v2 | Joystick, sin bonus, 1M pasos | 98,0 % | +4,0 |
| v3 | Clip 0,05 | 96,0 % | -2,0 |
| v4 | Clip 0,50 | 76,0 % | -22,0 |
| v5 | 2 entornos | 34,0 % | -64,0 |
| v6 | 16 entornos | 98,0 % | 0,0 |
| v7 | LR 1e-3 | 94,0 % | -4,0 |
| v8 | LR 1e-4 | 40,0 % | -58,0 |
| v9 | 500k pasos | 76,0 % | -22,0 |
| v10 | 2M pasos | 98,0 % | 0,0 |
| v11 | Bonus entropía 0,01 | 94,0 % | -4,0 |
| v12 (este) | 16 entornos + 2M pasos | 100,0 % | +2,0 |

Puntuación media de v12: 119,23206720713505 sobre las mismas 50 semillas. No se reportan métricas de retorno por episodio, varianza ni curvas de aprendizaje.

## Requisitos de hardware

- VRAM: no aplica; el modelo es una MLP de ~10^4 parámetros y se ejecuta en CPU sin problema.
- GPU recomendadas: ninguna necesaria. Cualquier GPU (incluso integrada) sirve; no se ha medido latencia en GPU.
- Cabe en cualquier GPU de consumo y en CPU de un solo núcleo; el cuello de botella es el simulador, no la red.
- Opciones de despliegue: PyTorch nativo (`torch.load` + `state_dict`), exportación manual a ONNX o TorchScript no documentada por el autor. No hay versiones para vLLM, llama.cpp, Ollama ni TGI (no aplica).
- Latencia y throughput: no disponibles. Por el tamaño de la red, la inferencia por paso es del orden de microsegundos en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se trata de un agente RL específico de un simulador propietario del curso CONNECT AI LAB, sin referencias a políticas alternativas sobre el mismo entorno. Los datos de comparación con SAC, TD3 o DDPG no están publicados.

| Modelo | Parámetros | Contexto | Tasa de aterrizaje | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-lucasbrain-v12-roadster-ppo | no disponible (~10^4) | no aplica | 100 % (50 semillas) | no disponible | HuggingFace |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos: la política está sobreajustada a la distribución de estados del simulador `로드스터_시뮬레이터.py`; no se ha evaluado fuera de él.
- Alucinación: no aplica como modelo generativo, pero la política puede producir acciones fuera de distribución ante estados no vistos durante el entrenamiento (el código de ejemplo recorta las acciones a los límites, lo que enmascara fallos).
- Contexto e idioma: no aplica; la entrada es un vector de 7 dimensiones y no procesa texto.
- Licencia: no disponible. No se puede asumir uso comercial sin consultar al autor; el repositorio no incluye archivo de licencia.
- Caveat de producción: el checkpoint se carga con `weights_only=False`, lo que implica ejecución de código arbitrario si el archivo no es de confianza; en producción conviene re-serializar con `weights_only=True` o exportar a un formato seguro.
- La evaluación se limita a 50 episodios con semillas fijas; no hay intervalos de confianza ni evaluación en entornos con perturbaciones.
- Dependencia de un simulador no publicado en el propio repositorio (se referencia `로드스터_시뮬레이터.py` "en la misma carpeta", pero el tamaño del repo es 0,0 GB y no se confirma su presencia).
- El repositorio tiene 0 descargas y 0 likes; no hay validación externa de los resultados.

## Enlaces

- HuggingFace: https://huggingface.co/lucaskim72/connectailab-rl-lucasbrain-v12-roadster-ppo
- CONNECT AI LAB (GitHub): https://github.com/wonseokjung/connect-tycoon
- AI CITY BUILDERS: no disponible (el enlace aparece truncado en la model card)
- Paper, blog o demo adicionales: no disponibles
