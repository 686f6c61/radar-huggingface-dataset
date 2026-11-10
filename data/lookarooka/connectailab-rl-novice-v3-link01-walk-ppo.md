# lookarooka/connectailab-rl-novice-v3-link01-walk-ppo

## Resumen

`connectailab-rl-novice-v3-link01-walk-ppo` es una política de control entrenada con aprendizaje por refuerzo (PPO) para el robot bípedo simulado LINK-01, un androide de 14 grados de libertad y 17 cm de altura modelado en MuJoCo. El modelo no es un LLM ni un modelo generativo de texto: es una red neuronal de política que recibe un vector de observación de 51 dimensiones y emite 14 acciones de control articular a 50 Hz, con el objetivo de que el robot camine de forma estable hacia delante. Lo desarrolla el autor `lookarooka` en el marco del curso de reinforcement learning de CONNECT AI LAB (proyecto AI CITY BUILDERS).

La relevancia de esta ficha es acotada y muy específica: se trata de un artefacto de investigación docente, no de un modelo de propósito general. Su interés técnico reside en la metodología documentada en la model card, que describe una progresión de tres versiones (v1, v2, v3) con técnicas de *reward shaping* biomecánico, DAgger con consistencia de fase y ajuste fino de PPO con `clip=0.08`. El resultado declarado es una velocidad media de 0,1988 m/s con cero caídas por minuto en episodios de 20 segundos.

El modelo se distribuye como un checkpoint de PyTorch (`model.pt`) junto con un normalizador de observaciones (`vecnormalize.pkl`) y una exportación del actor en JSON (`actor.json`) compatible con el playground web de LINK-01. No hay información sobre licencia, idiomas ni datos de entrenamiento más allá de lo que declara el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP feedforward (actor `51 -> 64 -> 64 -> 14`, activaciones Tanh-Tanh-Lineal) entrenado con PPO |
| Parámetros totales | no disponible (red pequeña; el conteo exacto no se declara) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 51 dimensiones por paso, control a 50 Hz |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en coma flotante; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (PyTorch), `vecnormalize.pkl` (normalizador de observaciones), `actor.json` (exportación del actor para el playground web) |

## Arquitectura y entrenamiento

La política es una MLP de tres capas (`51 -> 64 -> 64 -> 14`) con activaciones Tanh en las capas ocultas y salida lineal, entrenada con PPO sobre el entorno `Link01WalkGuided-v0` de la suite `link01-gym` en MuJoCo. El espacio de observación de 51 dimensiones combina la dirección de la gravedad en el marco del cuerpo (3), la velocidad angular (3), la desviación de los ángulos articulares respecto a la postura HOME (14), 0,05 veces las velocidades articulares (14), la acción previa (14) y el comando de velocidad (3). El espacio de acción es continuo, `Box(-1, 1, (14,))`, y se interpreta como un residuo angular de ±0,18 rad sobre la postura HOME. El bucle de control corre a 50 Hz con física a 500 Hz, es decir, diez subpasos de control PD por decisión de la política (`K_p=12`, `K_d=0.35`, par limitado a ±1,85 N·m).

El entrenamiento de la v3 parte de los pesos de la v2 y aplica tres técnicas: escalado biomecánico de articulaciones simétricas (tobillo ×1,05, rodilla ×0,95, roll de cadera ×1,06), DAgger con consistencia de fase sobre los 1000 pasos completos del episodio (con ratio de intervención del experto decreciente 1,0 → 0,65 → 0,35) y ajuste fino de PPO con `clip=0.08`, `lr=3e-5`, `gamma=0.99`, `gae_lambda=0.95`, 16 entornos y `n_steps=256`. El total acumulado declarado es de 786 432 pasos y 7,54 minutos de entrenamiento. La model card menciona además un *folding* de la capa de normalización de observaciones estimada con el algoritmo de Welford, aunque el texto disponible se corta en ese punto.

## Capacidades

- Locomoción bípeda hacia delante en simulación MuJoCo: mantiene la marcha durante episodios de 20 segundos (1000 pasos de política) sin caídas según la métrica declarada.
- Seguimiento de comando de velocidad: la observación incluye un comando de 3 dimensiones; el modelo alcanza 0,1988 m/s frente a un comando de 0,18 m/s y un límite físico del entorno de 0,20 m/s.
- Control articular continuo de 14 servos con salida acotada a ±0,18 rad respecto a la postura HOME.
- Exportación a formato JSON (`actor.json`, Schema 1) para su ejecución en el playground web de LINK-01.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingües, de visión o de audio: es una política de control motor, no un modelo de lenguaje.
- No se documentan capacidades de generalización a otros entornos, terrenos, comandos laterales o tareas distintas de la marcha frontal.

## Casos de uso

- Docencia de reinforcement learning: el repositorio sirve como referencia completa de un pipeline PPO con reward shaping, DAgger y ajuste fino, útil para cursos que quieran mostrar la progresión v1 → v2 → v3 con métricas comparables.
- Investigación en locomoción bípeda simulada: la política puede usarse como línea base para estudiar técnicas de *shaping* biomecánico (escalado de tobillo, rodilla y cadera) en robots de pocos grados de libertad.
- Reproducción de experimentos: al incluir `model.pt` y `vecnormalize.pkl`, permite reproducir la evaluación declarada (5 episodios × 20 s, comando 0,18 m/s) sobre `Link01Walk-v0`.
- Demostración interactiva en navegador: la exportación `actor.json` está pensada para cargarse en el playground web de LINK-01, lo que facilita mostrar el resultado del entrenamiento sin infraestructura de GPU.
- Comparación de algoritmos PPO: la model card documenta cuatro variantes (vanilla, alta entropía, guiado por CPG e híbrido con currículo) cuyos resultados sirven para ilustrar el problema del mínimo local de "quedarse de pie" en tareas de locomoción.
- Punto de partida para *fine-tuning*: los pesos de la v3 pueden servir como inicialización para experimentos posteriores de currículo, cambios de recompensa o transferencia a otras morfologías de 14 DoF.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente; el campo `verified` es `false` en el model-index). Evaluación sobre `Link01Walk-v0`, comando 0,18 m/s, 5 episodios de 20 segundos.

| Métrica | Valor |
|---|---|
| Distancia por episodio de 20 s | 3,976 m |
| Velocidad media de avance | 0,1988 m/s |
| Caídas por minuto | 0,0 |

Comparativa de versiones declarada por el autor:

| Versión | Pasos acumulados | Recompensa máxima de episodio | Distancia (20 s) | Velocidad media | Caídas/min |
|---|---|---|---|---|---|
| v1 | 262 144 | 3468,9 | 3,591 m | 0,1795 m/s | 0,00 |
| v2 | 524 288 | 4136,9 | 3,863 m | 0,1932 m/s | 0,00 |
| v3 | 786 432 | 4660,0 | 3,976 m | 0,1988 m/s | 0,00 |

Comparativa de estrategias PPO en la fase v1:

| Variante | Entorno | LR / Clip / Ent | Distancia (20 s) | Velocidad media | Caídas/min |
|---|---|---|---|---|---|
| PPO-Vanilla (scratch) | `Link01Walk-v0` | 3e-4 / 0,20 / 0,0 | 0,013 m | 0,0006 m/s | 0,00 |
| PPO-HighEntropy | `Link01Walk-v0` | 5e-4 / 0,25 / 0,01 | 0,016 m | 0,0008 m/s | 0,00 |
| PPO-Guided (CPG) | `Link01WalkGuided-v0` | 3e-4 / 0,20 / 0,002 | 0,013 m | 0,0006 m/s | 0,00 |
| PPO-Hybrid-Curriculum (v1) | `Link01WalkGuided-v0` | 1e-4 / 0,12 / 0,0 | 3,591 m | 0,1795 m/s | 0,00 |

## Requisitos de hardware

- VRAM estimada para inferencia: mínima. La red tiene tres capas densas de 51→64→64→14, del orden de miles de parámetros; el checkpoint cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU dedicada. Cualquier GPU con soporte CUDA (por ejemplo, GTX 1060 o superior) o incluso ejecución en CPU es suficiente para inferencia a 50 Hz.
- Cabe en GPU consumer: sí, en cualquier modelo actual; el cuello de botella real es el simulador MuJoCo, no la política.
- Opciones de despliegue: PyTorch nativo cargando `model.pt` y `vecnormalize.pkl`; ejecución del actor exportado en `actor.json` en el playground web de LINK-01. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma explícita. El diseño impone una decisión de política cada 20 ms (50 Hz) con diez subpasos de física de 2 ms; el entrenamiento declarado de 786 432 pasos se completó en 7,54 minutos con 16 entornos paralelos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Las alternativas naturales serían otras políticas de locomoción bípeda en MuJoCo (por ejemplo, políticas PPO para entornos tipo `Humanoid` o `Walker2d` de Gymnasium), pero no se aportan datos de rendimiento de esas alternativas en la información disponible, por lo que no es posible establecer una comparación cuantitativa rigurosa.

| Modelo | Parámetros | Contexto / observación | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-novice-v3-link01-walk-ppo | no disponible | 51 dimensiones, control a 50 Hz | 0,1988 m/s, 0 caídas/min (declarado) | no disponible | Hugging Face |
| Alternativas de locomoción bípeda | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ámbito muy restringido: la política está entrenada exclusivamente para marcha frontal en `Link01Walk-v0`/`Link01WalkGuided-v0`; no hay evidencia de generalización a otros terrenos, perturbaciones, comandos laterales o cambios de morfología.
- Métricas no verificadas: los resultados del model-index tienen `verified: false` y proceden únicamente del autor; no se han replicado de forma independiente.
- Licencia no disponible: no se declara licencia, lo que impide determinar si el uso comercial está permitido. Conviene contactar con el autor antes de cualquier uso en producción.
- Artefacto docente: forma parte de un curso (CONNECT AI LAB, AI CITY BUILDERS) y no está pensado como componente de un sistema robótico real; la transferencia sim-to-real no se ha documentado.
- Dependencia del entorno: requiere `link01-gym` y MuJoCo con la morfología exacta del LINK-01 (14 DoF, 17 cm); el modelo no funcionará con otra configuración de robot sin reentrenamiento.
- Normalización acoplada: `vecnormalize.pkl` forma parte del artefacto; usar `model.pt` sin el normalizador correspondiente produciría observaciones mal escaladas y un comportamiento incorrecto.
- Sin información sobre sesgos, alucinación o comportamiento en dominios fuera de distribución: no aplica el marco habitual de modelos de lenguaje, pero tampoco se documentan análisis de robustez ante ruido en sensores o latencias variables.
- Documentación parcial: la model card está mayoritariamente en coreano y el texto disponible se interrumpe en la sección de *folding* de la capa de normalización, por lo que parte del detalle técnico no es accesible.

## Enlaces

- Hugging Face: https://huggingface.co/lookarooka/connectailab-rl-novice-v3-link01-walk-ppo
- Versión anterior v2: https://huggingface.co/lookarooka/connectailab-rl-novice-v2-link01-walk-ppo
- Versión anterior v1: https://huggingface.co/lookarooka/connectailab-rl-novice-v1-link01-walk-ppo
- Repositorio del entorno `link01-gym`: no disponible en la información proporcionada
- Paper o blog técnico asociado: no disponible en la información proporcionada
- Demo interactiva (playground web de LINK-01): no disponible como URL en la información proporcionada; la model card menciona compatibilidad con `actor.json` (Schema 1)
