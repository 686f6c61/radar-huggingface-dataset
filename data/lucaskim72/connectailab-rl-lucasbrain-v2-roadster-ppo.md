# lucaskim72/connectailab-rl-lucasbrain-v2-roadster-ppo

## Resumen
`connectailab-rl-lucasbrain-v2-roadster-ppo` es un agente de aprendizaje por refuerzo (RL) entrenado con PPO para una tarea de control continuo concreta: aterrizar un "roadster invertido" en un simulador 2D tipo Gymnasium. No es un modelo de lenguaje: es una política neuronal pequeña (dos MLP con 64 unidades ocultas) que mapea un vector de estado de 7 dimensiones (posición x/y, velocidad x/y, seno y coseno de la inclinación y velocidad angular) a dos acciones continuas (empuje del propulsor inferior en [0,1] y par de rotación en [-1,1]). Lo publica Lucas Kim, autor independiente vinculado al curso de RL de CONNECT AI LAB × AI CITY BUILDERS, y forma parte de una serie de 12 experimentos (v1–v12) documentados en la model card.

Su relevancia es fundamentalmente pedagógica y reproducible: la model card incluye un diseño experimental casi de laboratorio, con ablaciones de hiperparámetros (clip, learning rate, número de entornos, total de pasos, bonus de entropía) evaluadas sobre un conjunto de 50 semillas de retención (9000–9049) no usadas en entrenamiento. El resultado declarado es un 98,0 % de tasa de aterrizaje y una puntuación media de 110,15 en esa retención, con una variante posterior (v12) que alcanza el 100 %.

El repositorio es minúsculo (0,0 GB según HuggingFace), con 0 descargas y 0 likes en el momento de la consulta, y sin licencia declarada. Es, por tanto, un artefacto de experimentación más que un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal fully-connected (MLP) con dos cabezas separadas (política y valor); activación Tanh; capas Linear(7→64) → Tanh → Linear(64→64) → Tanh → Linear(64→salida) |
| Parametros totales | No disponible (estimación aproximada: ~9,5k por cabeza, ~19k en total, a partir de las dimensiones declaradas; no confirmado por el autor) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no aplica: el estado es un vector de 7 dimensiones por paso, sin ventana temporal explícita) |
| Tipos de cuantizacion | No disponible (pesos en `model.pt` de PyTorch; no se documentan cuantizaciones) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | No disponible (no declarada en HuggingFace ni en la model card) |
| Formato de pesos | `model.pt` (checkpoint PyTorch con clave `state_dict`) |

## Arquitectura y entrenamiento
La política es una red de dos cabezas que comparten estructura pero no pesos: `정책` (política) produce la media de una distribución Normal diagonal sobre las dos acciones, y `가치` (valor) produce el valor de estado escalar. La desviación típica se parametriza como un parámetro libre `흔들림` inicializado a -0,5 y aplicado con `exp()`, lo que da una sigma inicial de aproximadamente 0,607. Las acciones se recortan al rango físico del entorno con `np.clip(media, [0,-1], [1,1])` en inferencia determinista.

El entrenamiento es PPO estándar con las siguientes constantes declaradas: `total_steps` 1.000.000, `n_envs` 8, `rollout` 256, `clip` 0,2, `lr` 0,0003, `entropy` 0,0, `hidden` 64, `gamma` 0,99, `gae_lambda` 0,95, `epochs` 10 y `minibatch` 256. El entorno es la variante "joystick" (`로드스터연속 (조이스틱)`), con recompensa basada en la sentencia de aterrizaje del simulador: dentro de la plataforma, inclinación admisible y velocidades vertical y horizontal dentro de umbrales. No se documenta uso de RLHF, DPO ni datos supervisados; es RL puro sobre recompensa de simulador. La innovación técnica destacable no está en la arquitectura sino en la metodología: ablaciones de un solo factor con conjunto de retención fijo y análisis de correlación entre hiperparámetro y tasa de aterrizaje.

## Capacidades
- Control continuo de dos dimensiones (empuje y par) en un simulador físico 2D con observaciones de 7 dimensiones.
- Aterrizaje en plataforma con criterios de posición, inclinación y velocidades vertical y horizontal.
- Inferencia determinista mediante la media de la distribución gaussiana, reproducible a partir del `state_dict`.
- Reproducción de episodios por semilla: la model card reporta 50 semillas de retención (9000–9049) con resultado agregado del 98,0 %.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas, visión, audio ni capacidades multilingües: es una política de control, no un modelo generativo.
- No dispone de "thinking mode" ni de mecanismos de cadena de pensamiento.

## Casos de uso
- Docencia de PPO y diseño experimental: el repositorio sirve como caso de estudio de ablaciones de un solo factor (clip, learning rate, n_envs, total_steps, entropía) con una métrica clara de éxito, útil en un curso o taller de RL.
- Reproducción de resultados: cargando `model.pt` y el simulador `로드스터_시뮬레이터.py` se puede reejecutar la evaluación sobre las 50 semillas de retención y verificar el 98,0 % declarado, lo que permite auditar la metodología del autor.
- Baseline para comparación de algoritmos: al ser un entorno pequeño y rápido de entrenar (1M de pasos, 8 entornos en paralelo), sirve como referencia para comparar PPO con SAC, TD3 o A2C en la misma tarea.
- Estudio de sensibilidad a hiperparámetros: los datos de la model card (por ejemplo, caída al 34 % con `n_envs`=2 o al 40 % con `lr`=0,0001) son un ejemplo concreto de la varianza que introducen estos parámetros en RL, reutilizable en material formativo.
- Integración en un pipeline de evaluación de entornos Gymnasium: el agente puede actuar como "política de referencia" en tests de regresión del simulador, detectando cambios en la dinámica o en la función de recompensa.
- Demostración de despliegue de políticas RL en HuggingFace Hub: el patrón `hf_hub_download` + `load_state_dict` + `eval()` es un ejemplo mínimo de distribución de checkpoints de RL, replicable para otros entornos.

## Benchmarks y rendimiento
Los únicos datos publicados son la tasa de aterrizaje y la puntuación media sobre el conjunto de retención de 50 semillas, más las ablaciones de hiperparámetros. No hay MMLU, HumanEval, GSM8K ni benchmarks de lenguaje, porque el modelo no es lingüístico.

| Version | Cambio respecto a la base | Retencion (50 semillas) | Diferencia |
|---|---|---|---|
| v1 | Base, botones (4 acciones) | 94,0 % | — |
| v2 | Joystick + bonus de exploración 0,01→0 | 98,0 % | +4,0 |
| v3 | Clip 0,20→0,05 | 96,0 % | -2,0 |
| v4 | Clip 0,20→0,50 | 76,0 % | -22,0 |
| v5 | n_envs 8→2 | 34,0 % | -64,0 |
| v6 | n_envs 8→16 | 98,0 % | 0,0 |
| v7 | lr 0,0003→0,001 | 94,0 % | -4,0 |
| v8 | lr 0,0003→0,0001 | 40,0 % | -58,0 |
| v9 | total_steps 1M→500k | 76,0 % | -22,0 |
| v10 | total_steps 1M→2M | 98,0 % | 0,0 |
| v11 | Entropía 0→0,01 | 94,0 % | -4,0 |
| v12 | v6 con 2M de pasos | 100,0 % | +2,0 |

Puntuación media declarada para v2: 110,15494073300766 sobre las 50 semillas de retención. La model card también reporta correlaciones de Pearson entre hiperparámetro y tasa de aterrizaje (n=12): n_envs +0,57, total_steps +0,32, lr +0,30, entropía +0,22, clip -0,16. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: menos de 1 MB para los pesos (≈19k parámetros en float32), más el overhead del runtime de PyTorch; en la práctica, cualquier GPU con ≥1 GB es suficiente y la CPU es viable con latencias de milisegundos.
- GPU recomendadas: ninguna en particular; cualquier GPU consumer (GTX 1650, RTX 3050, RTX 4090) o incluso CPU sirve. Para entrenamiento desde cero, una GPU modesta acelera los 1M de pasos con 8 entornos, aunque el cuello de botella real es el simulador en Python.
- Cabe en cualquier GPU consumer y en sistemas embebidos, dado el tamaño reducido de la política.
- Opciones de despliegue: PyTorch nativo (recomendado, tal como muestra la model card), exportación a ONNX o TorchScript para inferencia sin dependencia de PyTorch, o integración directa en un bucle de Gymnasium. No aplican vLLM, llama.cpp, Ollama ni TGI, que son para modelos de lenguaje.
- Latencia y throughput: no disponibles de forma oficial; por el tamaño de la red, se espera un forward pass de microsegundos en GPU y de decenas de microsegundos en CPU, pero el autor no publica mediciones.

## Comparativa con modelos similares
No hay modelos comparables publicados en la información disponible. Se trata de una política RL específica de un entorno propietario del curso CONNECT AI LAB, sin equivalentes públicos identificables en HuggingFace con la misma tarea y métrica. Como referencia cualitativa de la categoría (políticas RL para control continuo en entornos Gymnasium), podrían citarse políticas PPO genéricas de Stable-Baselines3 o CleanRL, pero no se dispone de datos de rendimiento comparables en este entorno concreto.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-lucasbrain-v2-roadster-ppo | ≈19k (estimado) | No aplica | 98,0 % retención (50 semillas) | No disponible | HuggingFace, 0 descargas |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias
- Especialización extrema: la política solo funciona en el simulador `로드스터연속 (조이스틱)` con observaciones de 7 dimensiones y acciones de 2 dimensiones; no generaliza a otros entornos ni a variaciones de la dinámica.
- Sin licencia declarada: no se especifican términos de uso comercial, redistribución ni modificación; en ausencia de licencia, el uso comercial es jurídicamente incierto y conviene contactar con el autor.
- Riesgo de sobreajuste al conjunto de retención: las 50 semillas 9000–9049 se usan como métrica principal y también aparecen en la tabla de experimentos; no se documenta un conjunto de test independiente adicional.
- Varianza alta entre configuraciones: cambios aparentemente menores (n_envs 8→2, lr 0,0003→0,0001) hunden la tasa de aterrizaje al 34 % y al 40 %, lo que indica una política frágil y sensible a la semilla y a los hiperparámetros.
- Sin datos de sesgo, alucinación o comportamiento fuera de distribución más allá del entorno simulado; no aplican sesgos lingüísticos porque no hay lenguaje.
- Reproducibilidad dependiente del simulador: el script `로드스터_시뮬레이터.py` no está incluido en el repositorio de HuggingFace según la información disponible (el repo figura con 0,0 GB), por lo que la reproducibilidad completa requiere obtenerlo por otra vía.
- Documentación en coreano: la model card está redactada íntegramente en coreano, lo que puede dificultar la adopción por parte de equipos hispanohablantes sin traducción.
- Sin mantenimiento ni comunidad: 0 descargas y 0 likes en el momento de la consulta; no hay garantía de soporte, issues atendidos ni actualizaciones.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/lucaskim72/connectailab-rl-lucasbrain-v2-roadster-ppo
- CONNECT AI LAB (repositorio del curso): https://github.com/wonseokjung/connect-tycoon
- Contacto del autor: lucaskim72@gmail.com
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
