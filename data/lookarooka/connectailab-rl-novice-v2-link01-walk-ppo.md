# lookarooka/connectailab-rl-novice-v2-link01-walk-ppo

## Resumen

`connectailab-rl-novice-v2-link01-walk-ppo` es una política de control entrenada con aprendizaje por refuerzo (PPO) para la locomoción bípeda del robot simulado LINK-01 en el entorno `Link01Walk-v0` (MuJoCo). Lo publica el usuario `lookarooka` en el marco del proyecto educativo CONNECT AI LAB (curso de RL, agente "novice"). No es un modelo de lenguaje: es un controlador neuronal que mapea 51 observaciones a 14 acciones articulares para que el robot camine hacia delante de forma estable.

La versión v2 parte de los pesos de v1 y aplica aprendizaje continuo (524.288 pasos acumulados) con dos innovaciones: una corrección DAgger con multiplicador de cadencia de zancada de 1,04x y un ajuste fino de PPO centrado en la banda de velocidad objetivo (0,18–0,20 m/s). El resultado declarado es una velocidad media de 0,1932 m/s y 3,863 m recorridos por episodio de 20 s, sin caídas.

Su relevancia es acotada pero clara: es un ejemplo reproducible y documentado de cómo pasar de una política de locomoción básica a una ajustada por currículo de velocidad, con artefactos exportables (actor en JSON con normalización plegada) listos para ejecutarse en el navegador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal fully-connected (MLP); actor 51→64→64→14 (Tanh, Tanh, Linear), crítico 51→256→256→1 |
| Parametros totales | no disponible (no se declara el recuento; por las dimensiones de capa, el actor ronda los 9.400 parámetros y el crítico los 79.600) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, sin ventana de contexto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (PyTorch), `vecnormalize.pkl`, `actor.json` |
| Entorno | `Link01Walk-v0` (link01-gym, MuJoCo) |
| Observaciones / acciones | 51 / 14 (14 articulaciones, postura base ±0,18 rad) |
| Algoritmo | PPO v2 (Continual + High-Cadence DAgger-PPO) |
| Pasos de entrenamiento | 524.288 acumulados |
| Hiperparámetros | lr 5e-05, gamma 0,99, gae_lambda 0,95, clip 0,1, 16 entornos, n_steps 256 |
| Tamaño del repo | 0,0 GB |

## Arquitectura y entrenamiento

La política es un perceptrón multicapa pequeño: el actor transforma las 51 observaciones en 14 acciones articulares mediante dos capas ocultas de 64 unidades con activación Tanh y una capa de salida lineal; el crítico usa dos capas de 256 unidades. La normalización de observaciones (media y desviación típica calculadas con el algoritmo de Welford) se pliega dentro de la primera capa del actor, de modo que el `actor.json` exportado es autocontenido y ejecutable directamente en el navegador.

El entrenamiento es aprendizaje continuo sobre el checkpoint de v1 (262.144 pasos previos), con 524.288 pasos acumulados. Sobre esa base se aplican dos fases: primero una corrección DAgger con mezcla de trayectoria experta y política actual (β = 0,75) y un multiplicador de cadencia de zancada de 1,04x para alinear el ciclo de marcha con la fricción del suelo; después un ajuste fino de PPO con currículo restringido a la banda de velocidad objetivo (vx entre 0,18 y 0,20 m/s), lr de 5e-05 y clip de 0,10, con 16 entornos en paralelo. La motivación declarada es corregir el sesgo de muestreo de v1 (vx entre 0,05 y 0,20, media 0,125 m/s), que penalizaba la recompensa de seguimiento a velocidades altas.

## Capacidades

- Locomoción bípeda hacia delante en el entorno simulado `Link01Walk-v0` con seguimiento de comandos de velocidad en el rango 0,18–0,20 m/s.
- Control de 14 articulaciones a partir de 51 observaciones, con postura base de ±0,18 rad.
- Estabilidad en episodios de 20 s sin caídas declaradas (0,0 caídas/min).
- Aprendizaje continuo: los pesos se heredan de v1 y admiten ajuste incremental.
- Exportación a JSON con normalización plegada para inferencia en navegador (compatible con el playground web del proyecto).
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo de visión, audio ni "thinking mode".

## Casos de uso

- Docencia de aprendizaje por refuerzo: sirve como referencia reproducible de un pipeline PPO completo (entorno MuJoCo, entrenamiento paralelo, evaluación con semilla fija) para cursos de RL.
- Comparación de técnicas de corrección: el par v1/v2 permite estudiar el efecto de DAgger y del currículo de velocidad sobre la recompensa de seguimiento en un caso controlado.
- Investigación en locomoción bípeda simulada: base para experimentar con variaciones de cadencia de zancada, fricción del suelo o rangos de comando sin partir de cero.
- Demostración interactiva en navegador: el `actor.json` con normalización plegada permite ejecutar la política en un playground web sin backend Python.
- Ajuste fino con aprendizaje continuo: punto de partida para transferir la política a variantes del entorno o a nuevas bandas de velocidad.
- Evaluación de estabilidad: útil como política de referencia con cero caídas para medir la degradación de controladores alternativos en las mismas condiciones de prueba.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados), prueba de 5 episodios × 20 s con comando de 0,18 m/s:

| Metrica | v2 (este modelo) | v1 (referencia) |
|---|---|---|
| Distancia por episodio de 20 s (m) | 3,863 | 3,591 |
| Velocidad media de avance (m/s) | 0,1932 | 0,1795 |
| Caídas por minuto | 0,0 | 0,0 |
| Pasos acumulados de entrenamiento | 524.288 | 262.144 |

## Requisitos de hardware

- VRAM estimada para inferencia: mínima (el actor tiene del orden de 9.400 parámetros); cualquier GPU consumer sirve.
- GPU recomendadas: no se requiere GPU dedicada; una RTX 4090 o una A100 son innecesarias para inferencia, aunque aceleran el reentrenamiento con MuJoCo y 16 entornos paralelos.
- Cabe en cualquier GPU consumer (GTX 1050 o superior) e incluso en CPU para inferencia de un solo agente.
- Despliegue: PyTorch (`model.pt` + `vecnormalize.pkl`), o el `actor.json` en el playground web del proyecto; no hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas de RL).
- Latencia y throughput: no disponibles; el entrenamiento declarado consumió 6,49 minutos para 524.288 pasos.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parámetros | Rendimiento declarado | Licencia |
|---|---|---|---|---|---|
| connectailab-rl-novice-v2-link01-walk-ppo | PPO, MLP 51→64→64→14 | Link01Walk-v0 (MuJoCo) | no disponible | 3,863 m / 20 s, 0,1932 m/s, 0 caídas/min | no disponible |
| connectailab-rl-novice-v1-link01-walk-ppo | PPO, MLP | Link01Walk-v0 (MuJoCo) | no disponible | 3,591 m / 20 s, 0,1795 m/s, 0 caídas/min | no disponible |
| Políticas de referencia de MuJoCo (p. ej. Ant, HalfCheetah) | PPO/SAC | entornos MuJoCo estándar | no disponible | no comparable directamente (entornos distintos) | según repositorio |

No se dispone de comparaciones con otras políticas de locomoción bípeda de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Específico del simulador: la política está entrenada para `Link01Walk-v0` (MuJoCo) y no hay evidencia de transferencia a hardware real (sim-to-real no documentado).
- Rango de velocidad estrecho: el ajuste se centró en 0,18–0,20 m/s; el comportamiento fuera de esa banda no está evaluado.
- Resultados no verificados: las métricas del model-index figuran con `verified: false` y proceden de una única prueba de 5 episodios.
- Sin licencia declarada: no se puede asumir uso comercial; conviene contactar con el autor antes de cualquier despliegue.
- Sin datos de sesgos ni de robustez frente a perturbaciones (empujones, terreno irregular, cambios de fricción).
- Documentación mayoritariamente en coreano; la model card mezcla coreano e inglés.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- No es un modelo de lenguaje: no admite prompts de texto, tool calling ni generación de código.

## Enlaces

- Hugging Face: https://huggingface.co/lookarooka/connectailab-rl-novice-v2-link01-walk-ppo
- Modelo v1 (referencia): https://huggingface.co/lookarooka/connectailab-rl-novice-v1-link01-walk-ppo
- MuJoCo: https://mujoco.org
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios del entorno `link01-gym` ni demos adicionales.
