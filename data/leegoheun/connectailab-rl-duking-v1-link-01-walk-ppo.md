# leegoheun/connectailab-rl-duking-v1-link-01-walk-ppo

## Resumen

`connectailab-rl-duking-v1-link-01-walk-ppo` es un controlador de locomoción bípeda entrenado con aprendizaje por refuerzo (PPO) para el robot simulado LINK-01, un bípedo de 14 grados de libertad modelado en MuJoCo dentro del entorno `Link01Walk-v0` (librería `link01-gym`). Lo publica el usuario `leegoheun` en el marco del proyecto CONNECT AI LAB (referenciado como "AI CITY BUILDERS 강화학습 AI 7강"). No es un modelo de lenguaje: es una política de control (actor-critic) empaquetada en formato Stable-Baselines3.

El modelo aprende a caminar desde cero mediante PPO, con una fase previa descrita por el autor como "1.04x CPG Guided DAgger + PPO Actor-Critic". El espacio de observación tiene 51 dimensiones y el de acción 14 (una por articulación, con postura base de ±0.18 rad). Se entrenó durante 2.000.000 de pasos en 11,73 minutos con 16 entornos paralelos.

Es relevante como ejemplo reproducible y ligero de entrenamiento de locomoción con herramientas estándar (Stable-Baselines3 + MuJoCo): el repositorio ocupa 0,0 GB y los artefactos son `model.zip`, `vecnormalize.pkl` y `actor.json`. Su rendimiento declarado es modesto (0,1952 m/s de velocidad media, 3,904 m por episodio de 20 s) pero sin caídas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor-critic (PPO) sobre observaciones de 51 dimensiones y acciones de 14 dimensiones; política neuronal no especificada en detalle |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (no aplica a políticas RL en formato SB3) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (Stable-Baselines3), `vecnormalize.pkl` (estadísticas de normalización), `actor.json` |

## Arquitectura y entrenamiento

La política es un agente PPO con arquitectura actor-critic entrenado con Stable-Baselines3 sobre el entorno `Link01Walk-v0` de MuJoCo. El autor menciona una inicialización guiada por CPG (generador de patrón central) combinada con DAgger antes del entrenamiento PPO puro, técnica habitual para estabilizar el arranque de políticas de locomoción. El espacio de observación es de 51 dimensiones y el de acción de 14, correspondientes a las 14 articulaciones del bípedo LINK-01, con postura base fijada en ±0,18 rad.

Hiperparámetros declarados: 2.000.000 de pasos de entrenamiento, 16 entornos en paralelo, `n_steps` 1024, `batch_size` 256, `learning_rate` 0,0003, `gamma` 0,99, `gae_lambda` 0,95 y `clip` 0,2. El entrenamiento completo se completó en 11,73 minutos según la model card. No se detalla la composición del dataset (es un entorno simulado, no un corpus) ni el número de tokens, al no tratarse de un modelo generativo.

## Capacidades

- Locomoción bípeda hacia delante en simulación MuJoCo: el agente genera comandos articulares para caminar a una velocidad objetivo de 0,18 m/s.
- Control de 14 articulaciones con postura base de ±0,18 rad.
- Estabilidad sin caídas: 0,0 caídas por minuto en las pruebas declaradas (5 episodios de 20 s).
- Integración con Stable-Baselines3: se carga con `PPO.load("model.zip")` junto con `vecnormalize.pkl`.
- Exportación parcial de la política a `actor.json`.
- No soporta tool calling, agentes multi-paso, visión, audio ni capacidades multilingües; es una política de control, no un modelo generativo.

## Casos de uso

- Simulación de locomoción en MuJoCo: cargar el agente en `Link01Walk-v0` para reproducir la marcha bípeda y validar el comportamiento del robot LINK-01 antes de transferir a hardware.
- Docencia y formación en RL: ejemplo completo y reproducible de un pipeline PPO con Stable-Baselines3, útil en cursos de refuerzo (el autor lo vincula a "AI CITY BUILDERS 강화학습 AI 7강").
- Punto de partida para fine-tuning: reutilizar `model.zip` y `vecnormalize.pkl` como inicialización para entrenar variantes de mayor velocidad o de marcha lateral.
- Evaluación comparativa de algoritmos: usar esta política como baseline PPO frente a SAC, TD3 u otros algoritmos en el mismo entorno.
- Investigación en inicialización CPG + DAgger: reproducir el esquema descrito para estudiar su efecto en la estabilidad del entrenamiento.
- Generación de datos de demostración: ejecutar el agente para producir trayectorias de referencia (rollouts) que alimenten aprendizaje por imitación o análisis de estabilidad.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados, `verified: false`) en el entorno `Link01Walk-v0`, comando 0,18 m/s, 5 episodios de 20 s:

| Metrica | Valor |
|---|---|
| Distancia por episodio de 20 s | 3,904 m |
| Velocidad media hacia delante | 0,1952 m/s |
| Caidas por minuto | 0,0 |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB y la política es una red neuronal pequeña, por lo que cabe en CPU.
- GPU recomendadas: no se especifican; el entrenamiento declarado (2.000.000 de pasos en 11,73 minutos con 16 entornos) sugiere que se ejecutó en hardware modesto, posiblemente CPU o una GPU de gama media.
- Cabe en cualquier GPU consumer y en CPU; no requiere aceleración dedicada para inferencia.
- Opciones de despliegue: Stable-Baselines3 (`PPO.load`), MuJoCo con `link01-gym` para el entorno; no aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoría (controladores PPO para el robot LINK-01) con parámetros, contexto o licencia verificables.

## Limitaciones y advertencias

- Resultados de benchmarks no verificados (`verified: false`); proceden únicamente de la model card del autor.
- Rendimiento limitado: 0,1952 m/s frente al comando de 0,18 m/s, con distancia de solo 3,904 m por episodio; no es un controlador de alta velocidad.
- Entrenado y evaluado exclusivamente en simulación MuJoCo (`Link01Walk-v0`); no hay evidencia de transferencia a hardware real (sim-to-real).
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución.
- Repositorio sin descargas ni likes en el momento de la consulta; ausencia de validación por la comunidad.
- La model card está redactada en coreano; parte de la documentación puede no estar disponible en otros idiomas.
- No aplica a tareas de generación de texto, código o visión; el uso indebido como modelo generativo no es posible.

## Enlaces

- Hugging Face: https://huggingface.co/leegoheun/connectailab-rl-duking-v1-link-01-walk-ppo
- Modelo relacionado v1: https://huggingface.co/leegoheun/connectailab-rl-duking-v1
- Modelo relacionado v2: https://huggingface.co/leegoheun/connectailab-rl-duking-v2-link01
- Stable-Baselines3: https://stable-baselines3.readthedocs.io/
- MuJoCo: https://mujoco.org/
