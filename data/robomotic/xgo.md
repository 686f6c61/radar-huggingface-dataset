# robomotic/XGO

## Resumen

XGO es una colección de políticas de locomoción entrenadas con aprendizaje por refuerzo (PPO) para tres robots cuadrúpedos de Luwu Dynamics (陆吾智能, xgorobot.com): Mini2S, Mini2SW (variante con ruedas) y Lite3. No es un modelo de lenguaje ni una red de propósito general: cada carpeta del repositorio contiene una política de inferencia exportada a ONNX que mapea un vector de observación a un vector de acción de control articular, junto con el checkpoint PPO de RSL-RL que la generó. El repositorio lo publica el usuario robomotic bajo licencia Apache 2.0.

Las políticas se entrenaron en mjlab v1.2.0 (APIs de estilo Isaac Lab sobre MuJoCo Warp acelerado por GPU) con rsl-rl-lib 5.0.1 y el entorno de tareas luwu_mjlab, empleando una única GPU NVIDIA, 4096 entornos paralelos y 1500 iteraciones de PPO por política. Se distribuyen cinco tareas: marcha con seguimiento de velocidad en terreno plano para Mini2S, Mini2SW y Lite3, y recuperación de caídas o giro para Mini2S y Mini2SW.

Su interés práctico reside en que los pesos se exportan a ONNX con formato independiente del robot y del framework de despliegue, el repositorio incluye los hiperparámetros exactos de entorno y agente para reproducir cada entrenamiento, y cubre tanto robots con patas como la variante con ruedas. El propio autor advierte de que las políticas no se han validado en hardware real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política actor PPO (red neuronal de control) entrenada en RSL-RL y exportada a ONNX para inferencia (observación → acción) |
| Parámetros totales | no disponible (el autor no publica el recuento de parámetros de las políticas) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la entrada es un vector de observación definido por el gestor de observaciones de luwu_mjlab para cada tarea) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`policy.onnx`, solo inferencia) y checkpoint PyTorch de RSL-RL (`model_1499.pt`, pesos actor-crítico + estado del optimizador) |
| Robots soportados | Luwu Dynamics Mini2S, Mini2SW (con ruedas) y Lite3 |
| Tareas incluidas | Mini2S-Walk-Flat, Mini2S-Turn-Flat, Mini2SW-Walk-Flat, Mini2SW-Turn-Flat, Lite3-Walk-Flat |
| Iteraciones de entrenamiento | 1500 por política |
| Entornos paralelos | 4096 por política |
| Simulador | MuJoCo 3.6.0 / mujoco-warp 3.6.0 |
| Frameworks | mjlab v1.2.0, rsl-rl-lib 5.0.1, entorno luwu_mjlab |
| Tamaño del repositorio | 0.0 GB |
| Fecha de publicación | 15 de septiembre de 2026 |

## Arquitectura y entrenamiento

Cada política es un actor entrenado con PPO (Proximal Policy Optimization) mediante RSL-RL, la librería de referencia del grupo leggedrobotics de ETH Zúrich. El entrenamiento se ejecuta en mjlab, que reproduce las APIs de Isaac Lab sobre MuJoCo Warp con aceleración por GPU, y las tareas provienen de luwu_mjlab (`src/tasks/velocity/`), el entorno publicado por Luwu Dynamics. Todos los entrenamientos usaron una única GPU NVIDIA con 4096 entornos paralelos simulados de forma simultánea y 1500 iteraciones de PPO por política.

La innovación principal del repositorio es de empaquetado y reproducibilidad, no de arquitectura de red: junto a cada política se publica el checkpoint `model_1499.pt` (pesos actor-crítico más estado del optimizador, reanudable), los ficheros `params/env.yaml` y `params/agent.yaml` con los hiperparámetros exactos de entorno y agente, y la exportación `policy.onnx` de solo inferencia. Esa exportación es agnóstica al robot concreto y al framework de despliegue, de modo que el mismo artefacto puede cargarse con `onnxruntime` en cualquier plataforma capaz de ejecutar ONNX. El autor no documenta el uso de RLHF, DPO ni técnicas de decodificación especulativa, que no aplican a este tipo de modelo.

## Capacidades

- Locomoción cuadrúpeda con seguimiento de velocidad en terreno plano para los robots Mini2S, Mini2SW y Lite3 (tareas `*-Walk-Flat`).
- Recuperación tras caídas y maniobra de giro o volteo para Mini2S y Mini2SW (tareas `*-Turn-Flat`).
- Control específico de la variante con ruedas Mini2SW, con dos políticas diferenciadas (marcha y recuperación).
- Exportación de inferencia en ONNX con interfaz observación → acción, independiente del robot y del framework de despliegue.
- Reanudación o inspección del entrenamiento mediante el checkpoint de RSL-RL (`model_1499.pt`), que incluye pesos actor-crítico y estado del optimizador.
- Reproducción exacta de cada ejecución mediante los hiperparámetros publicados en `params/env.yaml` y `params/agent.yaml`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni procesamiento de lenguaje natural.

## Casos de uso

- Despliegue de marcha en robots Mini2S y Lite3: la política `mini2s_walk` o `lite3_walk` se carga como `policy.onnx` con `onnxruntime` en el ordenador de a bordo y genera acciones articulares a partir del vector de observación del robot, sin necesidad de ejecutar PyTorch en el vehículo.
- Recuperación autónoma tras caídas: las políticas `mini2s_turn` y `mini2sw_turn` (recompensa media final 112,9 y 97,6 respectivamente) están entrenadas específicamente para volteo y recuperación, lo que permite reintegrar el robot en la marcha tras una caída sin intervención manual.
- Robots con ruedas en interiores: la variante Mini2SW dispone de política de marcha propia (`mini2sw_walk`, recompensa media 89,4) para plataformas híbridas patas-ruedas que operan sobre superficies planas y requieren seguimiento preciso de velocidad.
- Investigación en aprendizaje por refuerzo: el repositorio sirve como referencia reproducible de un pipeline completo PPO + mjlab + luwu_mjlab, con los YAML de entorno y agente que permiten reanudar el entrenamiento desde `model_1499.pt` y comparar variantes de hiperparámetros.
- Validación de pipelines de simulación a despliegue: al ofrecer a la vez el checkpoint de entrenamiento y el artefacto ONNX, permite verificar que la política exportada reproduce el comportamiento observado en MuJoCo antes de trasladarla a un robot.
- Integración en un stack de control propio: cualquier framework de robótica capaz de consumir ONNX puede incrustar la política y encadenarla con un planificador de trayectorias que genere las consignas de velocidad que la política debe seguir.
- Docencia y prototipado con cuadrúpedos de bajo coste: las políticas cubren tres modelos comerciales de Luwu Dynamics, lo que facilita montar prácticas de control con RL sobre robots accesibles sin entrenar desde cero.
- Evaluación comparativa de entornos de simulación: los mismos cinco task IDs permiten contrastar resultados entre mjlab, Isaac Lab u otros entornos que implementen tareas equivalentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K y similares no aplican a este tipo de modelo). La model card sí incluye la recompensa media final de cada política tras 1500 iteraciones de PPO:

| Carpeta | Task ID | Robot | Comportamiento | Iteraciones | Recompensa media final |
|---|---|---|---|---|---|
| `mini2s_walk/` | Mini2S-Walk-Flat | Mini2S | Marcha con seguimiento de velocidad en llano | 1500 | 87,1 |
| `mini2s_turn/` | Mini2S-Turn-Flat | Mini2S | Recuperación de caída / volteo | 1500 | 112,9 |
| `mini2sw_walk/` | Mini2SW-Walk-Flat | Mini2SW (ruedas) | Marcha con seguimiento de velocidad en llano | 1500 | 89,4 |
| `mini2sw_turn/` | Mini2SW-Turn-Flat | Mini2SW (ruedas) | Recuperación de caída / volteo | 1500 | 97,6 |
| `lite3_walk/` | Lite3-Walk-Flat | Lite3 | Marcha con seguimiento de velocidad en llano | 1500 | 69,3 |

Estas cifras corresponden a la recompensa de la función de tarea definida en `params/env.yaml` y no son comparables entre tareas distintas, ya que cada una usa su propia escala de recompensa. No se proporcionan métricas de sim-to-real, tasas de éxito en hardware ni medidas de consumo energético.

## Requisitos de hardware

- Entrenamiento: la model card indica una única GPU NVIDIA para entrenar cada política con 4096 entornos paralelos en MuJoCo Warp. No se especifica el modelo de GPU empleado.
- Inferencia: no se publica una estimación de VRAM. Al tratarse de un artefacto ONNX de solo inferencia sobre un vector de observación, lo habitual es que pueda ejecutarse en CPU con `onnxruntime` en el propio robot, pero el repositorio no aporta cifras de memoria ni de latencia.
- GPU recomendadas: no disponible (ni para entrenamiento ni para inferencia).
- Compatibilidad con GPU de consumo: no disponible como dato explícito; el entrenamiento con 4096 entornos paralelos acelerados por GPU y el tamaño total del repositorio (0,0 GB) sugieren requisitos modestos, pero el autor no lo confirma.
- Opciones de despliegue: `onnxruntime` para `policy.onnx`; script `scripts/play.py` de luwu_mjlab para evaluar checkpoints (`python scripts/play.py Mini2S-Walk-Flat --checkpoint-file /path/to/mini2s_walk/model_1499.pt`); carga directa en `rsl_rl` / `luwu_mjlab` para reanudar entrenamiento. Frameworks de servicio de modelos de lenguaje como vLLM, TGI, Ollama o llama.cpp no aplican.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. No se han incluido resultados de otras colecciones de políticas de locomoción (por ejemplo, las distribuidas junto a Isaac Lab, legged_gym o los repositorios de fabricantes de cuadrúpedos), por lo que no es posible establecer una comparación con cifras verificables.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| robomotic/XGO | no disponible | no aplica | Recompensa media final de 69,3 a 112,9 según tarea (simulación) | Apache 2.0 | ONNX + checkpoint RSL-RL en HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenamiento exclusivamente en simulación: el autor advierte de forma explícita que las políticas no se han validado en hardware real, por lo que debe añadirse medidas de seguridad antes de cualquier despliegue físico.
- Cobertura limitada a terreno plano: las cinco tareas se identifican como `Flat`; no hay políticas para escaleras, pendientes, terreno irregular ni superficies deformables.
- Ausencia de percepción: la política consume un vector de observación propiocepceptivo; no hay entrada de cámara, LiDAR ni mapa de elevación, de modo que no puede anticipar obstáculos.
- Una política por comportamiento y robot: no existe un modelo único que cubra marcha y recuperación a la vez, ni transferencia documentada entre Mini2S, Mini2SW y Lite3.
- Riesgo de caída inherente: los controladores de RL pueden fallar fuera de la distribución de estados vista en entrenamiento; no se publican tasas de éxito en simulación más allá de la recompensa media.
- Fechas y adopción: el repositorio registra 0 descargas y 0 «likes», y no se han publicado revisiones externas ni terceros que lo hayan reproducido, por lo que no existe validación de la comunidad.
- Idiomas y sesgos: no aplica análisis de sesgo lingüístico al no procesar texto, pero sí existe el riesgo habitual de sobreajuste al modelo dinámico simulado y a los parámetros concretos del robot.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de copyright, la licencia y se indiquen los cambios; no se ofrece garantía alguna.
- Reproducibilidad: los resultados dependen de versiones concretas (MuJoCo 3.6.0, mujoco-warp 3.6.0, mjlab 1.2.0, rsl-rl-lib 5.0.1); cambios de versión pueden alterar los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/robomotic/XGO
- Luwu Dynamics (fabricante de los robots, 陆吾智能): https://www.xgorobot.com/
- Repositorio RSL-RL: https://github.com/leggedrobotics/rsl_rl
- Repositorio mjlab: https://github.com/mujocolab/mjlab
- Entorno de entrenamiento luwu_mjlab: https://github.com/LuwuDynamics/luwu_mjlab
