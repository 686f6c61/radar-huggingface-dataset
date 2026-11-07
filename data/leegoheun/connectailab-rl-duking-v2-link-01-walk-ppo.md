# leegoheun/connectailab-rl-duking-v2-link-01-walk-ppo

## Resumen

`connectailab-rl-duking-v2-link-01-walk-ppo` es una política de control entrenada con aprendizaje por refuerzo (PPO) para que el robot bípedo LINK-01 aprenda a caminar desde cero. Lo desarrolla el investigador leegoheun en el marco del CONNECT AI LAB, dentro de una línea de trabajo sobre robots de patrulla autónoma que combina simulación física (MuJoCo, Isaac Sim) con gemelos digitales web basados en Three.js. No es un modelo de lenguaje: es un artefacto de RL pensado para ser exportado a ONNX e integrado en un bucle de control en tiempo real.

El modelo se entrena en el entorno `Link01Walk-v0` del paquete `link01-gym`, sobre MuJoCo, con observaciones de 51 dimensiones y acciones de 14 dimensiones correspondientes a las articulaciones del robot. La política parte de una postura base de ±0,18 rad y se evalúa con comandos de velocidad de 0,18 m/s durante cinco episodios de 20 segundos cada uno.

Su relevancia es acotada pero clara: sirve como referencia reproducible de un pipeline completo de locomoción con Stable-Baselines3 (entrenamiento, normalización de observaciones y exportación de la política), y como ejemplo didáctico dentro del curso de RL del laboratorio. El repositorio es de tamaño prácticamente nulo (0,0 GB), con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (PPO) sobre red neuronal; arquitectura exacta de la red no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (artefactos en formato nativo de Stable-Baselines3) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (Stable-Baselines3), `vecnormalize.pkl`, `actor.json` |

Especificaciones adicionales del entorno y del entrenamiento:

| Parametro | Valor |
|---|---|
| Entorno | `Link01Walk-v0` (link01-gym, MuJoCo) |
| Dimension de observacion | 51 |
| Dimension de accion | 14 articulaciones (postura base ±0,18 rad) |
| Algoritmo | PPO (Stable-Baselines3) |
| Pasos de entrenamiento | 3.000.000 |
| Tiempo de entrenamiento | 12,86 minutos |
| Hiperparametros | lr 0,0003; gamma 0,99; gae_lambda 0,95; clip 0,2; 16 entornos; n_steps 1024; batch_size 256 |
| Comando de evaluacion | 0,18 m/s, 5 episodios × 20 s |

## Arquitectura y entrenamiento

La política se entrena con PPO implementado en Stable-Baselines3 sobre el entorno `Link01Walk-v0`, que modela el robot bípedo LINK-01 en MuJoCo. El agente recibe observaciones de 51 dimensiones y emite 14 acciones articulares continuas, con una postura base de ±0,18 rad. El entrenamiento se ejecuta en paralelo con 16 entornos, `n_steps` de 1024 y `batch_size` de 256, con una tasa de aprendizaje de 0,0003, factor de descuento 0,99, `gae_lambda` 0,95 y `clip` 0,2, durante 3.000.000 de pasos en 12,86 minutos.

El repositorio incluye tres artefactos: `model.zip` con los pesos de la política, `vecnormalize.pkl` con las estadísticas de normalización de observaciones (imprescindible para reproducir la inferencia) y `actor.json`, presumiblemente una representación exportable de la red de actor para su uso fuera de Python. La model card menciona como objetivo de despliegue la exportación a ONNX para su integración en un gemelo digital web, aunque no se documenta en la información disponible que dicho ONNX esté incluido en el repositorio. No se detalla la topología exacta de las capas de la red ni la composición del dataset, ya que en RL el "dataset" es el propio simulador.

## Capacidades

- Locomoción bípeda: genera comandos articulares continuos para que LINK-01 avance en MuJoCo a una velocidad media de 0,2751 m/s.
- Estabilidad: registra 0,0 caídas por minuto en la evaluación declarada, lo que indica una marcha estable en el régimen de velocidad evaluado.
- Seguimiento de comandos de velocidad: evaluado con una consigna de 0,18 m/s, el agente supera ligeramente esa referencia (0,2751 m/s medidos).
- Control continuo multiarticular: salida de 14 dimensiones para las articulaciones del robot.
- Integración con Stable-Baselines3: compatible con el ecosistema SB3 para recarga, evaluación y reentrenamiento.
- Exportación de política: el archivo `actor.json` facilita extraer la red de actor para inferencia fuera de SB3.
- No soporta tool calling, agentes, razonamiento, visión, audio ni capacidades multilingües; no es un modelo generativo de lenguaje.

## Casos de uso

- Docencia y reproducción de RL: sirve como ejemplo completo y reproducible de un pipeline PPO con SB3 para locomoción, con hiperparámetros y entorno documentados, adecuado para cursos como el de RL del CONNECT AI LAB.
- Punto de partida para fine-tuning de marcha: el `model.zip` y el `vecnormalize.pkl` permiten continuar el entrenamiento con nuevos comandos de velocidad o terrenos modificados en `Link01Walk-v0`.
- Integración en gemelo digital web: el `actor.json` está pensado para exportarse a ONNX y conectarse a una visualización Three.js, de modo que el robot simulado pueda controlarse desde el navegador.
- Validación de entornos de simulación: útil para comprobar que una instalación de `link01-gym` y MuJoCo funciona correctamente, comparando la métrica de distancia por episodio con el valor de referencia de 5,502 m.
- Base para sistemas de patrulla simulada: encaja en el objetivo declarado del autor de robots de vigilancia interior que se mueven de forma autónoma por un plano 3D, aunque esta política solo cubre la marcha, no la navegación ni la percepción.
- Benchmark interno de algoritmos: al ser una política PPO pequeña y rápida de entrenar (12,86 minutos), sirve como línea base para comparar PPO frente a SAC, TD3 u otros algoritmos en el mismo entorno.
- Pruebas de robustez: permite evaluar la degradación de la marcha ante perturbaciones o cambios de comando dentro del simulador antes de transferir a hardware.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados, `verified: false`), sobre `Link01Walk-v0`, comando de 0,18 m/s, 5 episodios de 20 s:

| Metrica | Valor |
|---|---|
| Distancia por episodio de 20 s | 5,502 m |
| Velocidad media de avance | 0,2751 m/s |
| Caidas por minuto | 0,0 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 0,0 GB y la red es una política de RL de pequeñas dimensiones, por lo que la inferencia cabe holgadamente en cualquier GPU consumer, aunque no se publica el número de parámetros.
- GPU recomendadas: no se especifican; para inferencia basta una GPU modesta o incluso CPU. Para reentrenamiento, una GPU consumer reciente acelera los 16 entornos paralelos de MuJoCo.
- GPU consumer: sí, cualquier GPU con soporte CUDA o incluso CPU para inferencia puntual.
- Opciones de despliegue: Stable-Baselines3 (carga directa de `model.zip` con `vecnormalize.pkl`), exportación a ONNX a partir de `actor.json` para inferencia en navegador o en runtime C++/JS.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada. Como referencias del mismo autor y misma línea de trabajo:

| Modelo | Entorno | Algoritmo | Metricas publicadas | Licencia |
|---|---|---|---|---|
| connectailab-rl-duking-v2-link-01-walk-ppo (este) | Link01Walk-v0 | PPO | 5,502 m/episodio; 0,2751 m/s; 0 caidas/min | no disponible |
| connectailab-rl-duking-v2-link01 | no disponible | no disponible | no disponible | no disponible |
| connectailab-rl-duking-v3-link01 | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un artefacto de RL específico para un robot y un entorno concretos (`Link01Walk-v0`, LINK-01); no es reutilizable como modelo de propósito general.
- Los resultados de los benchmarks están marcados como no verificados por el propio autor y proceden de un único régimen de velocidad (0,18 m/s); no se documenta comportamiento a otras velocidades, pendientes o terrenos irregulares.
- No se especifica la licencia, por lo que el uso comercial queda en un limbo legal hasta que el autor la declare.
- El repositorio no incluye un ONNX listo para producción; la exportación se describe como parte del flujo de trabajo previsto, no como un artefacto entregado.
- La inferencia requiere cargar también `vecnormalize.pkl`; omitirlo produce observaciones mal normalizadas y un comportamiento errático.
- No hay evidencia de transferencia sim-to-real ni de robustez ante perturbaciones externas; la evaluación se limita al simulador.
- El modelo no procesa lenguaje, no tiene capacidades de razonamiento ni de percepción; cualquier sistema de patrulla completo necesitaría módulos adicionales de navegación, SLAM y detección.
- Con 0 descargas y 0 likes, no existe validación externa de la comunidad sobre su funcionamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leegoheun/connectailab-rl-duking-v2-link-01-walk-ppo
- Repositorio relacionado (v2): https://huggingface.co/leegoheun/connectailab-rl-duking-v2-link01/tree/main
- Repositorio relacionado (v3): https://huggingface.co/leegoheun/connectailab-rl-duking-v3-link01
- Stable-Baselines3 (documentación): https://stable-baselines3.readthedocs.io/
- MuJoCo (documentación): https://mujoco.readthedocs.io/
- Paper de PPO: https://arxiv.org/abs/1707.06347
