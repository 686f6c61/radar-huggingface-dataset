# hwihwalab/aloha-bimanual-toss-catch-model

## Resumen

Aloha-bimanual-toss-catch-model es un modelo de política de control robótico entrenado con aprendizaje por refuerzo (PPO) para una tarea de manipulación dinámica bimanual: lanzar y atrapar una pelota en vuelo balístico con un robot de doble brazo de 14 grados de libertad (configuración ALOHA). Lo desarrolla hwihwalab y se distribuye a través de Hugging Face con la librería LeRobot y licencia MIT. No es un modelo de lenguaje: es una política neuronal que mapea observaciones del entorno simulado (MuJoCo 3.x) a comandos de par articular, con control a 50 Hz.

El problema que aborda es la intercepción balística dinámica con amortiguación activa (active damping) y control compliant, un caso exigente porque requiere predicción de trayectoria, coordinación de dos brazos y suavidad en el par para evitar picos de jerk. El repositorio incluye además el entorno Gymnasium (`AlohaTossCatch-v0`), un cockpit de telemetría a 60 fps y un conjunto de datos de telemetría asociado.

Su relevancia es acotada pero concreta: sirve como benchmark reproducible de sim-to-real para manipulación dinámica bimanual, con domain randomization y una interfaz compatible con LeRobot. El tamaño del repositorio es de 0,1 GB y no se especifican el número de parámetros de la red ni la longitud de contexto (no aplica en el sentido de LLM).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal de control (reinforcement learning, PPO con Stable-Baselines3); no se detalla la topología de la red |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; observaciones por paso de simulación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ko (documentación y model card) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio LeRobot, 0,1 GB; no se detalla el formato de checkpoint) |

## Arquitectura y entrenamiento

La política se entrena mediante PPO (Proximal Policy Optimization) sobre Stable-Baselines3, en un entorno Gymnasium (`AlohaTossCatch-v0`) construido sobre MuJoCo 3.x. El robot es una configuración bimanual ALOHA de 14 grados de libertad, con control a 50 Hz. La tarea consiste en lanzar y atrapar proyectiles balísticos, con mecanismos de amortiguación activa y control compliant para suavizar el par articular. El entrenamiento emplea domain randomization orientada a sim-to-real.

La model card menciona explícitamente decodificación de intercepción balística, telemetría a 60 fps y un HUD de cuatro fases, pero no aporta datos sobre el número de tokens o pasos de entrenamiento, la composición del dataset de entrenamiento ni detalles de la topología de la red (capas, unidades, entradas/salidas exactas). No se indica si hubo fases de RLHF o DPO, lo cual es esperable al no tratarse de un modelo generativo de lenguaje.

## Capacidades

- Control bimanual de 14 grados de libertad en simulación MuJoCo 3.x.
- Intercepción balística dinámica: lanzamiento y captura de proyectiles en vuelo.
- Control compliant con amortiguación activa para reducir picos de par (métrica de jerk reportada).
- Coordinación de dos brazos para tareas de manipulación dinámica.
- Compatibilidad con LeRobot y Gymnasium (`AlohaTossCatch-v0`).
- Domain randomization para transferencia sim-to-real.
- Telemetría en tiempo real a 60 fps con HUD de cuatro fases, radar de intercepción y cámaras PiP de muñeca.
- Modos de operación en el cockpit: manual, automático y "chaos rush" con trayectorias aleatorias en 3D.
- No soporta tool calling, function calling, agentes multi-paso ni capacidades de lenguaje, visión general o audio; es una política de control específica de tarea.

## Casos de uso

- Benchmark de manipulación dinámica bimanual: usar el entorno `AlohaTossCatch-v0` y la política PPO como línea base reproducible para comparar nuevos algoritmos de RL en tareas de lanzamiento y captura.
- Investigación en sim-to-real: entrenar o ajustar políticas con domain randomization y evaluar la transferencia a un robot físico de doble brazo tipo ALOHA.
- Estudio de control compliant: analizar el efecto de la amortiguación activa sobre el jerk del par articular (métrica reportada de 0,946) en tareas de contacto dinámico.
- Docencia y demostraciones: el cockpit interactivo a 60 fps permite visualizar fases de vuelo, delta de ápice e intercepción en tiempo real sin instalación, útil en cursos de robótica y aprendizaje por refuerzo.
- Generación de datos de telemetría: el dataset asociado a 60 fps puede emplearse para entrenar modelos de predicción de trayectoria o de imitación.
- Pruebas de robustez: el modo "chaos rush" con trayectorias aleatorias en pitch y yaw sirve para evaluar la generalización de políticas ante perturbaciones.
- Integración en pipelines LeRobot: reutilizar el checkpoint y el entorno dentro del ecosistema LeRobot para experimentos de política robótica estandarizados.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados, `verified: false`):

| Metrica | Valor |
|---|---|
| Catch Intercept Rate (success_rate) | 100 |
| Time to Intercept (time_to_success) | 0,59 s |
| Control Frequency (frequency) | 50 Hz |
| Headless Throughput (Colab) (throughput_fps) | 12.500 fps |
| Torque Smoothness (Jerk) (jerk_metric) | 0,946 |

No se han publicado en la información disponible resultados comparativos con otros modelos en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), que además no aplican a este tipo de política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB y la política es ligera, pero no se detalla el tamaño de la red.
- GPU recomendadas: no disponible. El autor reporta un throughput headless de 12.500 fps en Google Colab, lo que sugiere que la inferencia es viable en hardware modesto.
- Cabe en GPU consumer: probablemente sí, dado el tamaño del repositorio y el throughput reportado en Colab, aunque no se confirma en la información disponible.
- Opciones de despliegue: LeRobot, entorno Gymnasium con MuJoCo 3.x, PyTorch 2.0+, Stable-Baselines3; cockpit interactivo vía `run_live_cockpit.py` o Hugging Face Spaces.
- Latencia y throughput: control a 50 Hz en simulación; 12.500 fps en modo headless (Colab, dato del autor).

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. Como referencia cualitativa, este modelo se sitúa en la categoría de políticas de RL para manipulación bimanual dinámica (familia ALOHA/ACT/LeRobot), pero no se aportan parámetros, contexto ni rendimiento de alternativas, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Todos los resultados de benchmarks están marcados como no verificados (`verified: false`) y proceden de simulación; no hay evidencia de transferencia real a hardware físico.
- El modelo está especializado en una única tarea (lanzamiento y captura balística bimanual); no generaliza a otras tareas de manipulación sin reentrenamiento.
- No es un modelo de lenguaje ni multimodal: no soporta texto, visión general, audio ni tool calling.
- Riesgo de sobreajuste al simulador MuJoCo 3.x y a la configuración concreta del robot; la brecha sim-to-real no está cuantificada.
- La documentación está en inglés y coreano; no hay versión en castellano.
- Licencia MIT: permite uso comercial, pero conviene revisar las dependencias (MuJoCo, Stable-Baselines3, LeRobot) por sus propias licencias.
- No se detallan sesgos, composición del dataset de entrenamiento ni protocolo de evaluación, lo que limita la reproducibilidad rigurosa.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un proyecto reciente y sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hwihwalab/aloha-bimanual-toss-catch-model
- Demo interactiva en Hugging Face Spaces: https://huggingface.co/spaces/hwihwalab/aloha-bimanual-toss-catch
- Dataset de telemetría: https://huggingface.co/datasets/hwihwalab/aloha-bimanual-toss-catch-telemetry
- Repositorio GitHub: https://github.com/Hwihwa-Lab/aloha-bimanual-toss-catch
- MuJoCo: https://mujoco.org
- Gymnasium: https://gymnasium.farama.org
- Stable-Baselines3: https://stable-baselines3.readthedocs.io
- LeRobot: https://github.com/huggingface/lerobot
- PyTorch: https://pytorch.org
