# duckyduck369/microduck-hd1910-walk-Yanke01

## Resumen

microduck-hd1910-walk-Yanke01 es una política de control locomotriz entrenada por refuerzo (reinforcement learning) para un robot cuadrúpedo de simulación denominado HD-1910 Microduck. El modelo no es un modelo de lenguaje ni un transformer generativo: es una política neuronal exportada en formato ONNX que, a partir de observaciones del estado del robot y de comandos de velocidad (vx, vy, yaw), produce las acciones de los servos para que el robot camine manteniendo la cabeza en la pose HOME. Lo desarrolla el usuario duckyduck369 y se distribuye bajo licencia Apache 2.0.

La relevancia del artefacto es acotada pero concreta: documenta de forma exhaustiva el entorno de entrenamiento (task `Mjlab-Velocity-Home2-Flat-MicroDuck-HD1910`), la planta física (hash `91ff02f648c95e7f`, masa 790,6 g, servos `hd1910_m6_2026-10-10.json`), las ganancias de los servos (Kp 5,0 / Kd 20,0 en entrenamiento, 125 Hz) y las condiciones de evaluación (familia `walk` eval v1.0, 256 robots, seed 0). Esto lo convierte en un ejemplo reproducible de pipeline de RL para robótica de patas pequeñas.

El repositorio es de tamaño 0,0 GB, con 0 descargas y 0 likes en el momento de la consulta, creado el 30 de octubre de 2026. No contiene un modelo fundacional ni capacidades lingüísticas; su interés es exclusivamente para robótica y simulación de locomoción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal para control continuo (reinforcement learning), exportada a ONNX; arquitectura interna no detallada en la información disponible |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de control robótico, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (librería `onnx`) |
| Tarea | reinforcement-learning |
| Planta / robot | HD-1910 Microduck, plant hash `91ff02f648c95e7f`, masa 790,6 g |
| Servos | `hd1910_m6_2026-10-10.json`, Kp 5,0 / Kd 20,0 en entrenamiento, 125 Hz |
| Alimentación | 6,8–7,4 V (sag 0,0–0,2 V/N·m, suelo 6,5 V), latencia 2–8 pasos de física |
| Pose HOME | `[0.0, -0.087, -0.428, -0.005, 0.453, 0.569, 0.349, 0.0, 0.0, 0.0, 0.087, 0.428, 0.005, -0.453]` |
| Comandos de control | Twist: vx m/s, vy m/s, yaw rad/s |
| Iteración de entrenamiento | 14.700 (353.016 env steps, desde `model_14700.pt`) |
| Dataset de evaluación | `walk eval v1.0`, simulación `microduck-sim`, 256 robots, seed 0 |

## Arquitectura y entrenamiento

La política se entrena con RL en el task `Mjlab-Velocity-Home2-Flat-MicroDuck-HD1910`, con seguimiento de velocidad lineal y angular relativa y una restricción explícita de mantener la cabeza en la pose HOME. El linaje documentado encadena varias iteraciones: `vt1_reltrack` it 14700 (seguimiento relativo de velocidad lineal y yaw, derivado de turn-in-place 0,1–1,0 rad/s) ← `vf1_full` it 14650 (HOME del robot, cabeza en HOME, yaw L1) ← `v48_fric03_dense` it 14400 (fricción de pie 0,3–1,2) ← `v20_ar015_trk3` it 14250 (stage 6) ← `r21` it 12995.

El entrenamiento usa un currículo de pesos de recompensa y de aleatorización. Los términos de recompensa incluyen `track_linear_velocity` (peso 3), `track_angular_velocity` (2), `upright` (2), `pose` (1), `air_time` (3), `head_pose_tracking` (2), `rel_yaw_tracking` (3), `rel_lin_tracking` (3), con penalizaciones como `lin_vel_error` (-4), `dof_pos_limits` (-1), `self_collisions` (-1), `foot_clearance` (-2), `hip_yaw_deviation` (-3) y `yaw_rate_error_l1` (-1,5). El currículo escala `action_rate_l2` de -0,1 a -1 entre las iteraciones 0 y 1500, `standing_envs` de 0,02 a 0,25 entre 0 y 2000, y `head_pose_bias` de 0 a 3 entre 0 y 1500, entre otros. La aleatorización cubre reset_base (pose y yaw), push_robot (velocidad ±0,3), foot_friction (0,3–1,2), encoder_bias (±0,015) y base_com (±0,025–0,03).

Una advertencia relevante del autor: el código del task cambió desde el entrenamiento, por lo que los pesos finales se replicaron desde el plan de currículo en lugar de re-ejecutar el entorno original. Además, el modelo se entrenó con Kp 5 / Kd 20 pero se ejecuta en el robot con Kp 5 / Kd 5 para reducir el jitter en posición de pie.

## Capacidades

- Locomoción cuadrúpeda controlada por comandos de twist (vx, vy, yaw rad/s) en terreno plano.
- Seguimiento de velocidad lineal relativa: alcanza aproximadamente 0,155 m/s cuando se comanda 0,2 m/s y 0,221 m/s cuando se comanda 0,3 m/s.
- Seguimiento de yaw en giros amplios: alcanza 0,914 rad/s cuando se comanda 1 rad/s; en cambio, los comandos pequeños (±0,3 rad/s) apenas se ejecutan (0,008 y -0,01), y el autor indica que por debajo de unos 0,4 rad/s el giro en el sitio apenas responde.
- Mantenimiento de la pose de cabeza en HOME durante la marcha, con término de recompensa dedicado (`head_pose_tracking`, `head_pose_bias`).
- Robustez a baja fricción del suelo (0 caídas en `walk_falls_low_friction`), a bajo suministro eléctrico (0 caídas en `walk_falls_low_supply`) y a empujones externos, tanto caminando como de pie (0 caídas en `push_walking_falls` y `push_standing_falls`).
- No incluye capacidad de levantarse tras una caída: el paro por caída está activado y la política no se recupera.
- No tiene tool calling, function calling, agentes, multilingüismo, visión, audio ni modo de razonamiento: no es un modelo generativo de lenguaje.

## Casos de uso

- Simulación de locomoción de bajo coste: cargar la política ONNX en `microduck-sim` con la planta `91ff02f648c95e7f` para reproducir los escenarios de la familia `walk` eval v1.0 (256 robots, seed 0) y validar cambios de control antes de tocar hardware.
- Control en el robot físico HD-1910: usar `robotctl policy load walk duckyduck369/microduck-hd1910-walk-Yanke01` con Kp 5 / Kd 5 y pose HOME sin offsets para caminar con comandos de twist en tiempo real a 125 Hz.
- Pruebas de robustez a perturbaciones: emplear el modelo en bancos de pruebas con fricción variable (0,3–1,2), caídas de tensión hasta 6,5 V y empujones de ±0,3 m/s para verificar que no se producen caídas en condiciones nominales de evaluación.
- Base para fine-tuning de políticas de marcha: partir de esta política como inicialización en tareas derivadas (por ejemplo, giros en el sitio más precisos o seguimiento de vy), reutilizando el currículo y los términos de recompensa documentados.
- Docencia e investigación en RL para robótica: usar el repositorio como ejemplo completo de pipeline (task, planta, servos, currículo, aleatorización, evaluación) para enseñar entrenamiento de políticas de locomoción con restricciones de pose.
- Integración en pipelines de CI de robótica: ejecutar la evaluación `walk eval v1.0` de forma automatizada como test de regresión de control antes de desplegar nuevas políticas en el robot.
- Referencia de comparación entre iteraciones: usar las métricas declaradas (vx, yaw, caídas) para comparar esta política con otras de la familia `microduck-family-walk` y decidir qué checkpoint desplegar.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (familia `walk` eval v1.0, 256 robots, seed 0; métricas no verificadas, `verified: false`):

| Métrica | Valor |
|---|---|
| yaw_+0.3_achieved | 0,008 |
| yaw_-0.3_achieved | -0,01 |
| yaw_+1_achieved | 0,914 |
| vx_0.2_achieved | 0,155 |
| vx_0.3_achieved | 0,221 |
| walk_falls_low_friction | 0,0 |
| walk_falls_low_supply | 0,0 |
| push_walking_falls | 0,0 |
| push_standing_falls | 0,0 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una política de control exportada a ONNX y de tamaño de repositorio 0,0 GB, la huella de memoria es mínima en comparación con modelos generativos.
- GPU recomendadas: no disponibles en la información proporcionada; no se especifican requisitos de acelerador.
- Compatibilidad con GPU de consumo: no confirmada; el modelo está pensado para ejecutarse en el bucle de control del robot o en simulación, no para cargas de inferencia de gran escala.
- Opciones de despliegue: ONNX Runtime (formato de pesos ONNX); el autor documenta `robotctl policy load walk duckyduck369/microduck-hd1910-walk-Yanke01` para el robot y la simulación `microduck-sim` para replay. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: la planta declara latencia de 2–8 pasos de física y control a 125 Hz; no se publican cifras de throughput de la política.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-hd1910-walk-Yanke01 | Política RL ONNX para HD-1910 Microduck | No disponible | No aplica | vx 0,155/0,221 m/s; yaw 0,914 rad/s a 1 rad/s; 0 caídas en las cuatro pruebas | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| Otras políticas de la familia `microduck-family-walk` | Políticas RL para el mismo robot | No disponible | No aplica | No disponible en la información proporcionada | No disponible | Referenciadas por el tag de familia, sin datos concretos |
| Políticas de locomoción de cuadrúpedos tipo Unitree Go1/Go2 (p. ej. legged_gym, Isaac Lab) | Políticas RL para robots comerciales | No disponible | No aplica | No disponible | Varía (MIT, Apache 2.0, otras) | Repositorios públicos de investigación |

No hay datos suficientes en la información proporcionada para una comparación numérica con alternativas concretas; los modelos comparables se indican solo a nivel de categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser una política de control, los sesgos relevantes serían de comportamiento (por ejemplo, preferencia por ciertas velocidades o poses), no sesgos sociales.
- Riesgo de alucinación: no aplica; el modelo no genera texto.
- Limitaciones de contexto o idioma: no aplica; no hay capacidades lingüísticas ni ventana de contexto.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero conviene conservar los avisos de licencia y atribución.
- Advertencia del autor: el código del task cambió desde el entrenamiento y los pesos finales se replicaron desde el plan de currículo, no desde el entorno original; los resultados pueden no ser reproducibles de forma exacta con el código actual.
- Métricas no verificadas (`verified: false` en la model card); deben tratarse como declaraciones del autor.
- El modelo se entrenó con Kp 5 / Kd 20 pero se ejecuta con Kp 5 / Kd 5; usar las ganancias de entrenamiento en el robot puede producir más jitter.
- Giros en el sitio por debajo de unos 0,4 rad/s apenas responden (yaw comandado ±0,3 rad/s produce valores de 0,008 y -0,01).
- No se levanta tras una caída: el paro por caída está activado y la política no incluye recuperación.
- La pose HOME debe fijarse como default en tiempo de ejecución sin offsets; usar otra pose puede degradar el control.
- Sin datos de latencia o throughput de la política, la planificación de despliegue en tiempo real debe validarse empíricamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/duckyduck369/microduck-hd1910-walk-Yanke01
- Vídeo de replay: https://huggingface.co/duckyduck369/microduck-hd1910-walk-Yanke01/resolve/main/replay.mp4
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
