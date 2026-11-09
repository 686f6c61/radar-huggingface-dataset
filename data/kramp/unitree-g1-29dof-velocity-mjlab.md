# kramp/unitree-g1-29dof-velocity-mjlab

## Resumen

`kramp/unitree-g1-29dof-velocity-mjlab` es una política de control por refuerzo para el robot humanoide Unitree G1 de 29 grados de libertad, entrenada para la tarea `Unitree-G1-Flat` de seguimiento de velocidad. La desarrolla el usuario kramp sobre el stack `unitree_rl_mjlab`, que combina la API de Isaac Lab con el motor físico MuJoCo (a través de mjlab) para entrenamiento y despliegue sim-to-real. El resultado es un controlador de locomoción que recibe comandos de velocidad y devuelve consignas de posición articular a 50 Hz.

El modelo resuelve el problema clásico de locomoción bípeda: convertir observaciones propioceptivas (velocidad angular de la base, gravedad proyectada, comandos de velocidad, fase de marcha, posiciones y velocidades articulares relativas y última acción) en 29 acciones de posición articular. Se distribuye como un único grafo ONNX de pequeño tamaño con metadatos embebidos (nombres de articulaciones, ganancias PD, pose por defecto y layout de observaciones), lo que facilita su integración en el controlador C++ de Unitree.

Su relevancia es práctica: es un artefacto listo para despliegue en el G1 de 29 DOF, con licencia Apache 2.0, validado en sim2sim con MuJoCo a 0,5 m/s de comando constante durante 20 s (velocidad media alcanzada de 0,41 m/s). No es un modelo de lenguaje ni un modelo fundacional: es una política de control especializada, por lo que las secciones de esta ficha se adaptan a esa naturaleza.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal de control por refuerzo (PPO, RSL-RL) exportada a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 98 flotantes por paso |
| Tipos de cuantización | no disponible (exportación ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`exported/policy.onnx`) + YAML de configuración (`params/deploy.yaml`, `params/env.yaml`, `params/agent.yaml`) + `config.json` |

## Arquitectura y entrenamiento

La política se entrena con PPO mediante RSL-RL dentro de mjlab, un framework que adopta las abstracciones de Isaac Lab pero usa MuJoCo (y MuJoCo Warp) como backend físico. El entorno corresponde a la tarea `Unitree-G1-Flat` del proyecto `unitree_rl_mjlab`, orientada al seguimiento de comandos de velocidad en terreno plano. La red se exporta a ONNX y se ejecuta a 50 Hz; los metadatos del grafo ONNX incluyen los nombres de articulaciones, las ganancias PD, la pose por defecto y el layout exacto de observaciones, de modo que el controlador de despliegue puede reconstruir la semántica de entrada y salida sin configuración manual adicional.

El vector de observación tiene 98 flotantes en un orden fijo: `base_ang_vel` (3), `projected_gravity` (3), `velocity_commands` (3), `gait_phase` (2), `joint_pos_rel` (29), `joint_vel_rel` (29) y `last_action` (29). La salida son 29 acciones de posición articular, transformadas como `offset + scale * action` con `offset` y `scale` por articulación definidos en `params/deploy.yaml`. El repositorio incluye además los YAML completos del entorno y del agente PPO, lo que permite reproducir el entrenamiento.

## Capacidades

- Locomoción bípeda con seguimiento de comandos de velocidad (lineal y angular) en terreno plano.
- Control de 29 articulaciones del Unitree G1 con consignas de posición articular a 50 Hz.
- Uso de fase de marcha (`gait_phase`) como señal cíclica para coordinar el patrón de pisada.
- Integración con el controlador C++ de Unitree mediante `params/deploy.yaml` generado a partir de los metadatos ONNX.
- Validación sim2sim reproducible con el modelo MuJoCo oficial del G1 de 29 DOF (`g1/scene_29dof.xml`, paso físico de 2 ms).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es exclusivamente una política de control motor.

## Casos de uso

- Investigación en locomoción bípeda: sirve como política de referencia o línea base para comparar nuevos entrenamientos en mjlab sobre el G1 de 29 DOF, gracias a que el repositorio incluye los YAML completos de entorno y PPO.
- Despliegue sim-to-real en el Unitree G1: el flujo documentado (clonar `unitree_rl_mjlab`, descargar la política con `hf download`, añadir un estado con `policy_dir` en `config/config.yaml` y compilar `g1_ctrl`) permite llevarla al robot físico tras validarla en simulación.
- Validación de pipelines de despliegue: los metadatos ONNX y `deploy.yaml` permiten verificar que un controlador C++ reconstruye correctamente observaciones y ganancias PD antes de tocar hardware.
- Pruebas de robustez sim2sim: el script `scripts/sim2sim_hub.py` reproduce la semántica del controlador de despliegue en MuJoCo, útil para detectar discrepancias de observación o PD entre simulación y robot.
- Docencia y prototipado en robótica con refuerzo: al ser un artefacto pequeño con licencia Apache 2.0 y entrenamiento reproducible, encaja en cursos o talleres sobre PPO aplicado a humanoides.
- Integración en stacks de control propios: al ser un grafo ONNX autocontenido, puede ejecutarse desde runtimes ONNX en lugar del controlador oficial, siempre que se respete el layout de 98 entradas y la transformación de las 29 salidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; no aplican a este tipo de modelo. El único dato de rendimiento documentado es la comprobación sim2sim en MuJoCo:

| Prueba | Entorno | Comando | Duración | Resultado |
|---|---|---|---|---|
| Sim2sim MuJoCo | `unitree_mujoco` `g1/scene_29dof.xml`, paso físico 2 ms | 0,5 m/s avance constante | 20 s | Robot en pie toda la prueba; velocidad media de avance 0,41 m/s |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,0 GB y la política es un ONNX de tamaño reducido, por lo que la huella de memoria es mínima frente a modelos generativos.
- GPU recomendadas: no se especifican; al ser una política pequeña a 50 Hz, la inferencia puede ejecutarse en CPU o en GPU de gama baja. No hay datos publicados sobre latencia por hardware.
- ¿Cabe en GPU de consumo? Sí, con alta probabilidad, dado el tamaño del artefacto; no se documentan requisitos mínimos concretos.
- Opciones de despliegue: controlador C++ oficial de `unitree_rl_mjlab/deploy/robots/g1` (`g1_ctrl`), runtime ONNX genérico y simulación con `unitree_mujoco` mediante `scripts/sim2sim_hub.py`.
- Latencia y throughput: la política se ejecuta a 50 Hz (periodo de 20 ms); no se publican cifras de latencia por dispositivo.

## Comparativa con modelos similares

| Modelo | Robot / tarea | Framework | Formato | Licencia | Validación publicada |
|---|---|---|---|---|---|
| `kramp/unitree-g1-29dof-velocity-mjlab` | G1 29 DOF, seguimiento de velocidad | mjlab + RSL-RL (PPO) | ONNX + YAML | Apache 2.0 | Sim2sim MuJoCo, 20 s a 0,41 m/s medios |
| Políticas de `unitree_rl_mjlab` (upstream) | G1, Go2, A2, As2, R1, H1_2, H2 | mjlab + RSL-RL | no disponible en la información | no disponible | no disponible |
| Políticas de `unitree_rl_lab` (G1 29 DOF) | G1 29 DOF, velocidad y mimic | Isaac Lab | no disponible en la información | no disponible | no disponible |

No se dispone de datos de parámetros, contexto ni benchmarks comparables para el resto de políticas, por lo que la comparación se limita a framework, formato y licencia.

## Limitaciones y advertencias

- Es una política de control específica para el Unitree G1 de 29 DOF en terreno plano; no es transferible a otros robots ni a tareas distintas sin reentrenamiento.
- El único resultado publicado es un sim2sim de 20 s a 0,5 m/s de comando; no hay evidencia documentada de despliegue en el robot físico ni de robustez ante perturbaciones, terrenos irregulares o comandos laterales.
- La velocidad media alcanzada (0,41 m/s) queda por debajo del comando (0,5 m/s), lo que indica un error de seguimiento de aproximadamente el 18 % en esa prueba.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas por tratarse de un modelo de robótica sin componentes lingüísticos.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue en hardware real conlleva riesgos físicos: el autor recomienda probar primero en simulación con `unitree_mujoco`.
- El repositorio tiene un tamaño declarado de 0,0 GB y muy pocas descargas (23) y likes (0); no hay evidencia de adopción ni de mantenimiento continuado.
- Los parámetros totales de la red no se publican, lo que dificulta estimar con precisión requisitos de cómputo más allá de la frecuencia de ejecución de 50 Hz.

## Enlaces

- Hugging Face: https://huggingface.co/kramp/unitree-g1-29dof-velocity-mjlab
- Repositorio de entrenamiento y despliegue: https://github.com/unitreerobotics/unitree_rl_mjlab
- Framework mjlab: https://github.com/mujocolab/mjlab
- mjlab en PyPI: https://pypi.org/project/mjlab/
- Simulador Unitree MuJoCo: https://github.com/unitreerobotics/unitree_mujoco
- Documentación G1 en unitree_rl_mjlab (DeepWiki): https://deepwiki.com/unitreerobotics/unitree_rl_mjlab/7.2-g1
- Documentación G1 29-DOF en unitree_rl_lab (DeepWiki): https://deepwiki.com/unitreerobotics/unitree_rl_lab/6.3-g1-humanoid-(29-dof)
- Modelos oficiales del G1: https://github.com/unitreerobotics/unitree_model/tree/main/G1
