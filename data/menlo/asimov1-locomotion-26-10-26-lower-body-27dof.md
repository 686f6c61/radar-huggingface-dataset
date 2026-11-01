# Menlo/asimov1-locomotion-26-10-26-lower-body-27dof

## Resumen

Asimov 1 locomotion policy es una política de control para locomoción bípeda del robot humanoide Asimov 1, desarrollada por Menlo. Se trata de un checkpoint de aprendizaje por refuerzo (PPO con *adversarial motion priors*) entrenado en Isaac Lab sobre el modelo de 27 grados de libertad del robot, y exportado a ONNX y TorchScript para su despliegue en tiempo real. No es un modelo de lenguaje: es una política neuronal que mapea observaciones propioceptivas a consignas de posición para las 12 articulaciones de las piernas.

La relevancia técnica del checkpoint radica en su receta de observación: la política controla únicamente la mitad inferior del cuerpo (12 articulaciones de pierna) sin observar las 15 articulaciones restantes (cintura, brazos, muñecas de 6 DOF y cuello de 2 DOF), que durante el entrenamiento siguen movimientos aleatorizados. Además, la IMU se lee en el torso (`waist_yaw_link`) en lugar de en la pelvis, lo que introduce un requisito de despliegue específico que debe respetarse para no degradar el rendimiento.

El modelo está pensado para integración en un runtime de Asimov 1 que gestione comandos de velocidad (`vx, vy, wz`), control independiente de la parte superior del cuerpo y una IMU montada en el torso. Se distribuye con licencia BSD-3-Clause y formato ONNX, lo que facilita su ejecución con ONNX Runtime a 50 Hz.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de política (actor-critic) entrenada con PPO y *adversarial motion priors* (AMP); exportada como grafo ONNX y TorchScript |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (exportación float32) |
| Idiomas soportados | no aplica |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (`policy.onnx`) y TorchScript (`policy.pt`) |
| Entrada | `obs` float32, forma `[1, 45]` |
| Salida | `actions` float32, forma `[1, 12]` |
| Frecuencia de control | 50 Hz (`sim.dt = 0.005`, `decimation = 4`) |
| Grados de libertad controlados | 12 (piernas) de 27 totales |
| Entorno de entrenamiento | Isaac Lab (PhysX), 4096 entornos en 4 GPUs |

## Arquitectura y entrenamiento

La política es una red neuronal que actúa como *actor* en un esquema actor-critic entrenado con PPO en Isaac Lab (PhysX), con 4096 entornos paralelos distribuidos en 4 GPUs y *adversarial motion priors* (AMP) para inducir estilos de marcha naturalistas a partir de datos de movimiento. El checkpoint exportado corresponde a `model_9999.pt` de la ejecución `2026-10-26_18-59-36_lower_body_27dof_4gpu_4096`. El *critic* dispone durante el entrenamiento de realimentación de las articulaciones de la parte superior del cuerpo, pero el *actor* exportado no la requiere.

La observación del actor tiene 45 valores: velocidad angular del torso (3), gravedad proyectada en el torso (3), comando de velocidad `vx, vy, wz` (3), posiciones de las 12 articulaciones de pierna (12), velocidades de esas mismas articulaciones (12) y las 12 acciones crudas previas de pierna sin relleno. La acción se convierte en consigna de posición mediante `default_joint_pos + action_scale * action`, con escala `0.25` para la mayoría de articulaciones de pierna y `0.08` para el *ankle roll*, cuyo objetivo se recorta a `[-0.09, 0.09]` radianes. Las ganancias PD son `224.42`/`10.201` para *ankle pitch* y `35.2`/`1.6` para *ankle roll*. Durante el entrenamiento, la parte superior del cuerpo sigue un muestreador de movimiento coordinado (movimientos independientes, espejados, poses predefinidas y neutras, con *waist yaw* en `[-0.5, 0.5]` rad) y las pinzas permanecen bloqueadas en su pose cero.

## Capacidades

- Locomoción bípeda comandada por velocidad: genera consignas de posición para las 12 articulaciones de pierna a partir de comandos `vx, vy, wz`.
- Control de marcha robusto a movimiento independiente de la parte superior del cuerpo, gracias a la aleatorización de las 15 articulaciones restantes durante el entrenamiento.
- Estabilidad basada en IMU de torso: usa velocidad angular y gravedad proyectada medidas en `waist_yaw_link`.
- Estilo de movimiento naturalista inducido por AMP.
- Exportación a ONNX y TorchScript para inferencia en runtime.
- No incluye capacidades de generación de texto, razonamiento, código, visión, audio, *tool calling* ni agentes; es exclusivamente una política de control motor.

## Casos de uso

- Despliegue de locomoción en el humanoide Asimov 1: el runtime construye la observación de 45 valores a 50 Hz, ejecuta `policy.onnx` con ONNX Runtime y aplica las acciones como consignas de posición con las escalas y recortes indicados en `env.yaml`.
- Investigación en aprendizaje por refuerzo para robótica: sirve como referencia reproducible de un *pipeline* PPO + AMP entrenado en Isaac Lab con 4096 entornos, incluyendo `agent.yaml`, `env.yaml` y `code_state.yaml` para replicar el entrenamiento.
- Control desacoplado de tren inferior y superior: útil en arquitecturas donde un controlador separado genera objetivos para cintura, brazos, muñecas y cuello mientras esta política se encarga solo de las piernas.
- Validación de robustez frente a perturbaciones de la parte superior: permite estudiar cómo responde la marcha cuando el torso se mueve dentro del rango de *waist yaw* de `[-0.5, 0.5]` rad visto en entrenamiento.
- Simulación y *sim-to-real*: el checkpoint puede ejecutarse en simulación con la misma receta de observación antes de trasladarlo al robot físico, verificando el frame de la IMU y el orden de articulaciones.
- Integración en *stacks* de robótica basados en ONNX: al ser un grafo ONNX con metadatos de despliegue (orden de articulaciones, escalas, offsets, recortes y ganancias PD), encaja en runtimes ligeros y en pipelines de verificación continua.
- Docencia y prototipado de políticas de locomoción: ejemplo compacto de política con observación parcial y control independiente de la parte superior para cursos de RL aplicado a robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB y la política es una red pequeña exportada en float32, por lo que la huella de memoria es mínima.
- GPU recomendadas: no se especifican; para inferencia en tiempo real a 50 Hz, cualquier GPU con soporte de ONNX Runtime es suficiente en principio, aunque no hay datos publicados de latencia.
- ¿Cabe en GPU de consumo? No hay datos publicados, pero por el tamaño del artefacto (0.0 GB) es altamente probable que sí; no confirmado por el autor.
- Opciones de despliegue: ONNX Runtime (`policy.onnx`) o PyTorch (`policy.pt`), dentro de un runtime de Asimov 1 que soporte 12 acciones de pierna, objetivos de posición independientes para la parte superior, IMU en frame de torso y la receta de observación de 45 valores.
- Latencia y throughput: no disponibles; la política debe ejecutarse a 50 Hz según la configuración de entrenamiento.

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables de locomoción para Asimov 1 ni de otros humanoides con la misma receta de observación y control parcial.

## Limitaciones y advertencias

- Requisito estricto de frame de IMU: la velocidad angular y la gravedad proyectada deben medirse en `waist_yaw_link` (torso) o transformarse desde la pelvis usando el ángulo de *waist yaw* medido; alimentar lecturas en frame de pelvis sin transformar produce un desajuste respecto al entrenamiento siempre que la cintura esté girada.
- Control limitado a las piernas: la política no genera objetivos para las 15 articulaciones de la parte superior del cuerpo; un controlador separado debe proporcionarlos.
- Sin observación de la parte superior: el actor no recibe posiciones ni velocidades de cintura, brazos, muñecas o cuello, solo la respuesta del torso vía IMU; cambios en la dinámica de la parte superior fuera de la distribución de entrenamiento pueden degradar la marcha.
- Rango de *waist yaw* de entrenamiento limitado a `[-0.5, 0.5]` rad; movimientos fuera de ese rango no están cubiertos.
- Pinzas bloqueadas en pose cero durante el entrenamiento; no se controlan.
- Riesgo de alucinación: no aplica (no es un modelo generativo de lenguaje).
- Sesgos: no disponibles; no se documentan sesgos de comportamiento más allá de las condiciones de entrenamiento.
- Licencia BSD-3-Clause: permite uso comercial con obligación de conservar el aviso de copyright y la cláusula de exención de responsabilidad; conviene revisar los términos completos antes de producción.
- Sin datos publicados de benchmarks, latencia ni rendimiento en hardware real; la validación *sim-to-real* queda a cargo del integrador.

## Enlaces

- HuggingFace: https://huggingface.co/Menlo/asimov1-locomotion-26-10-26-lower-body-27dof
- Código de entrenamiento y evaluación (Cyclotron): https://github.com/menloresearch/cyclotron
