# duckyduck369/microduck-hd1910-walk-djbob

## Resumen

microduck-hd1910-walk-djbob es una política de control entrenada mediante aprendizaje por refuerzo para que un robot cuadrúpedo de la familia Microduck (plataforma HD-1910) camine siguiendo comandos de velocidad. Lo desarrolla el usuario duckyduck369 y se publica en HuggingFace como un modelo ONNX listo para ejecutarse en el firmware `robotctl`. No es un modelo de lenguaje: es una política de locomoción que mapea un comando de twist (vx, vy, yaw) y el estado de las articulaciones a posiciones objetivo de las 14 articulaciones del robot.

El modelo se entrenó en simulación con la tarea `Mjlab-Velocity-Flat-MicroDuck-HD1910-S2R3`, sobre una planta física concreta (hash `54c147ebc5a06f45`) que define masas, rangos articulares, HOME, parámetros de servo y geometría de colisión. La política está pensada para un robot de 790,6 g con servos hd1910 y alimentación de 5,6 a 6,8 V (pack 2S antiguo), con un límite de par y caída de tensión modelados.

Su relevancia es la de un artefacto reproducible de robótica: incluye la planta, la configuración de evaluación (256 robots, semilla 0) y los pesos finales de recompensa y currículos de entrenamiento, lo que permite replicar el entorno y auditar el comportamiento. El repositorio ocupa 0,0 GB y no tiene descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | política de control por aprendizaje por refuerzo (red neuronal exportada a ONNX); arquitectura interna no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX |
| Frecuencia de control | 50 Hz |
| Servos | hd1910, Kp 8.0 / Kd 20.0 al inicio |
| Articulaciones | 14 (HOME en orden de política: `[0.0, -0.0873, -0.4282, -0.0049, 0.453, 0.3491, 0.3491, 0.0, 0.0, 0.0, 0.0873, 0.4282, 0.0049, -0.453]`) |
| Comando de entrada | twist (vx m/s, vy m/s, yaw rad/s) |
| Masa de la planta | 790,6 g |
| Alimentación | 5,6-6,8 V (sag 0,1-0,5 V/N·m, suelo 3,5 V) |
| Latencia de planta | 4-10 pasos de física |
| Parada por caída | activada (la política no se levanta) |

## Arquitectura y entrenamiento

La política se entrenó con la tarea `Mjlab-Velocity-Flat-MicroDuck-HD1910-S2R3` hasta la iteración 4500 (108.048 pasos de entorno), partiendo de `model_4500.pt`. La rama de código local `hd1910-s2r` (commit `0dc0be9a5`) no está publicada todavía. La línea de descendencia es `s2r3e_6k` iteración 4500, continuada en una GPU alquilada a partir de la iteración 2000 de la ejecución local.

El entrenamiento usa recompensas con currículo. Los pesos finales incluyen `track_linear_velocity` (2), `track_angular_velocity` (2), `upright` (2), `pose` (1), `air_time` (3), `rel_lin_tracking` (3), `rel_yaw_tracking` (3) y penalizaciones como `fall_penalty` (-250), `stance_width` (-15), `hip_yaw_deviation` (-3) y `hip_roll_deviation` (-3). Varios términos arrancan a cero y se activan por currículo: `lin_vel_error` llega a -4 en la iteración 500, `yaw_rate_error` a -0,5 en la 500, `foot_slip_l1` a -3 en la 500 y `head_pose_bias` a 10 en la 1500. `action_rate_l2` escala de -0,1 a -1 entre las iteraciones 0 y 1500.

La aleatorización de dominio incluye `reset_base` con pose y yaw aleatorios (x e y en [-0,5, 0,5], z en [0,12, 0,13], yaw en [-3,14, 3,14]), `push_robot` con velocidades en [-0,3, 0,3] en x e y, y currículos de fricción de pies, centro de masas (hasta 0,015), centro de masas de la cabeza (hasta 0,01) y rangos de pose de cabeza (hasta [-1,1, 0,55] en los ejes de pitch/roll/yaw y [-0,31, 0,31] en el cuarto componente). No se documentan innovaciones como decodificación especulativa ni atención lineal, por tratarse de una política de control.

## Capacidades

- Locomoción cuadrúpeda siguiendo comandos de velocidad lineal (vx, vy) y velocidad angular (yaw) en rad/s.
- Seguimiento de pose de cabeza y cuerpo mediante términos de recompensa dedicados (`head_pose_tracking`, `head_pose_bias`, `body_pose_tracking`).
- Control a 50 Hz con ganancias Kp/Kd fijas escritas al inicio de la ejecución.
- Robustez a fricción baja de los pies: 0 caídas registradas en `walk_falls_low_friction`.
- Robustez a alimentación baja: 0 caídas registradas en `walk_falls_low_supply`.
- Resistencia a empujes mientras camina: 0,035 de caídas en `push_walking_falls`.
- Resistencia a empujes estando de pie: 0 caídas en `push_standing_falls`.
- Parada automática al detectar caída; la política no incorpora maniobra de levantarse.
- No dispone de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, por no ser un modelo de lenguaje.

## Casos de uso

- Control de locomoción en robot cuadrúpedo Microduck HD-1910: se carga con `robotctl policy load walk duckyduck369/microduck-hd1910-walk-djbob` y se le envían comandos de twist para desplazar el robot por superficies planas, aprovechando la política entrenada específicamente para esa planta.
- Navegación teleoperada: un operador envía vx, vy y yaw a 50 Hz para dirigir el robot en interiores, con parada automática por caída como red de seguridad.
- Validación de firmware y servos: al fijar Kp 8.0 / Kd 20.0 y requerir el clamp de objetivos al rango articular, sirve para probar la cadena de control de los servos hd1910 en banco.
- Pruebas de robustez energética: el modelo se entrenó con alimentación de 5,6 a 6,8 V y caída de tensión modelada, por lo que es adecuado para evaluar el comportamiento con packs 2S envejecidos o con sag acusado.
- Evaluación comparativa de políticas: la familia `walk` eval v1.0 con 256 robots y semilla 0 permite comparar esta política con otras variantes de la misma familia bajo condiciones idénticas.
- Investigación en aprendizaje por refuerzo sim-to-real: la planta (`plant.json`) y los currículos documentados permiten reproducir el entrenamiento y estudiar la transferencia de simulación a hardware real.
- Pruebas de resistencia a perturbaciones: los escenarios de empuje (`push_robot` con velocidades hasta 0,3 m/s) permiten validar la estabilidad frente a golpes laterales mientras camina o está de pie.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (familia `walk` eval v1.0, 256 robots, semilla 0). Ninguno está verificado (`verified: false`).

| Metrica | Valor |
|---|---|
| yaw_+0.3_achieved | 0,212 |
| yaw_-0.3_achieved | -0,27 |
| yaw_+1_achieved | 1,076 |
| vx_0.2_achieved | 0,184 |
| vx_0.3_achieved | 0,239 |
| walk_falls_low_friction | 0,0 |
| walk_falls_low_supply | 0,0 |
| push_walking_falls | 0,035 |
| push_standing_falls | 0,0 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,0 GB y los pesos son ONNX, por lo que la huella es mínima.
- GPU recomendadas: no disponible; al ser una política de control a 50 Hz, la inferencia puede ejecutarse en CPU o en el propio robot.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del repositorio, aunque no se documenta el número de parámetros ni el tiempo de inferencia.
- Opciones de despliegue: ONNX Runtime y el firmware `robotctl` (`robotctl policy load walk duckyduck369/microduck-hd1910-walk-djbob`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: control a 50 Hz (periodo de 20 ms); la latencia de la planta se modela en 4-10 pasos de física. No se publican cifras de throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma familia o categoría en los datos proporcionados. La model card referencia la familia `walk` y la línea `s2r3e_6k`, pero no incluye especificaciones de otros modelos. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Es una política de locomoción, no un modelo de lenguaje: no genera texto, no razona, no usa herramientas y no tiene capacidades multilingües.
- No incorpora maniobra de levantarse; tras una caída, la parada por caída queda activa y el robot permanece en el suelo.
- Entrenada para una planta concreta (hash `54c147ebc5a06f45`): cambios en masas, geometría, servos o alimentación fuera del rango 5,6-6,8 V pueden degradar el comportamiento.
- Los objetivos articulares deben recortarse al rango articular; el firmware lo hace, pero un control externo que no lo haga puede provocar comandos inválidos.
- Los resultados de evaluación están declarados por el autor y no están verificados (`verified: false`); no hay validación independiente.
- La rama de código de entrenamiento (`hd1910-s2r` @ `0dc0be9a5`) no está publicada, lo que limita la reproducibilidad completa del pipeline.
- Riesgo de sesgo y alucinación: no aplica en el sentido de un modelo generativo, pero sí existe riesgo de comportamiento fuera de distribución ante condiciones no cubiertas por la aleatorización (superficies irregulares, cargas externas, voltajes fuera de rango).
- Licencia apache-2.0: permite uso comercial y modificación con atribución y aviso de cambios; conviene revisar las condiciones de la planta y del firmware asociados.
- El modelo no tiene descargas ni likes en el momento de la consulta, por lo que no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/duckyduck369/microduck-hd1910-walk-djbob
- Vídeo de replay: https://huggingface.co/duckyduck369/microduck-hd1910-walk-djbob/resolve/main/replay.mp4
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la información disponible.
