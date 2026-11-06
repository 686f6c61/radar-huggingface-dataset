# duckyduck369/microduck-hd1910-velstand-djbob

## Resumen
`microduck-hd1910-velstand-djbob` es una política de control entrenada por refuerzo (reinforcement learning) para el robot cuadrúpedo MicroDuck, concretamente para la variante de servos HD-1910. No es un modelo de lenguaje: es un controlador neuronal que produce comandos de articulación a 50 Hz para que el robot camine con velocidades lineales y angulares comandadas (vx, vy, yaw) y sea capaz de levantarse por sí mismo tras una caída, tanto boca abajo como boca arriba. Lo publica el usuario duckyduck369 bajo licencia Apache 2.0, empaquetado en formato ONNX.

El modelo pertenece a la familia `velstand` y se ha entrenado sobre la tarea `Mjlab-VelStand-Flat-MicroDuck-HD1910-S2R3-Neck`, con un plant físico concreto (hash `8cab365632f68d40`) que describe masas, rangos articulares, HOME, parámetros de servo y geometría de colisión. La novedad principal respecto a versiones anteriores es el ajuste del HOME del cuello (`neck_pitch` a 0.569 rad, frente a 0.349) y la incorporación de términos de recompensa específicos de seguimiento de la pose de la cabeza.

Es relevante porque demuestra un flujo completo de simulación-a-realidad (sim-to-real) para un robot de bajo coste: entrenamiento masivo en simulador (252.072 pasos de entorno), currículo de recompensas y evaluación estandarizada sobre 256 robots en simulación con condiciones adversas (baja fricción, caída de tensión de alimentación, empujones). Los resultados declarados muestran recuperación tras caída con éxito del 100 % y ausencia de caídas en escenarios de baja fricción y bajo suministro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control robótico (reinforcement learning), exportada a ONNX; arquitectura interna no detallada en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (librería declarada: onnx) |

## Arquitectura y entrenamiento
Se trata de una política neuronal entrenada mediante aprendizaje por refuerzo en el simulador, dentro de la tarea `Mjlab-VelStand-Flat-MicroDuck-HD1910-S2R3-Neck`. El entrenamiento alcanzó la iteración 10.500 (252.072 pasos de entorno, partiendo de `model_10500.pt`), con código de una rama local `hd1910-s2r` aún no publicada (commit `0dc0be9a5`). La política se ejecuta a 50 Hz con ganancias de servo Kp 8.0 / Kd 20.0 escritas al arranque, y recibe comandos de twist (vx m/s, vy m/s, yaw rad/s).

El linaje de entrenamiento parte de `velstand_neck neck_3k` (iteración 10.500, warm start con 2.500 iteraciones sobre el nuevo HOME del cuello), que a su vez deriva de `velstand_s2r3b` (it. 7999), `velstand_s2r3` run 3 (it. 2000) y `s2r3e` (it. 4500). El diseño de recompensas combina 33 términos con currículos progresivos: seguimiento de velocidad lineal y angular (peso 2), verticalidad (2), pose (1), air time (3), penalizaciones de colisión y deslizamiento, y términos de recuperación que arrancan en cero y crecen hasta valores altos (`recovery_success` de 0 a 10, `lin_vel_error` de 0 a -4, `yaw_rate_error` de 0 a -0.5). La penalización por caída se reduce de -250 a 0 conforme avanza el currículo, lo que permite que la política aprenda a levantarse en lugar de evitar la caída a toda costa. El plant simula un peso de 790,6 g, alimentación de 5,6-6,8 V con caída de tensión de 0,1-0,5 V/N·m y suelo a 3,5 V, y latencia de 4-10 pasos de física.

## Capacidades
- Locomoción cuadrúpeda comandada: seguimiento de velocidad lineal (vx, vy) y velocidad angular (yaw) en el plano.
- Recuperación autónoma tras caída: levantarse boca abajo y boca arriba sin intervención externa (el "fall stop" está desactivado en la configuración).
- Control de la pose de la cabeza: seguimiento de la orientación del cuello con el nuevo HOME a 0.569 rad de `neck_pitch`.
- Robustez ante condiciones adversas: mantiene la marcha con baja fricción y con caídas de tensión de alimentación dentro del rango entrenado (5,6-6,8 V).
- Resistencia a perturbaciones: recupera la marcha tras empujones (métrica `push_walking_up_at_end` de 0,988).
- Integración mediante CLI: carga con `robotctl policy load walk duckyduck369/microduck-hd1910-velstand-djbob`.
- Ejecución en tiempo real a 50 Hz sobre hardware de servo HD-1910.
- No soporta tool calling, agentes, multilingüismo ni generación de texto: es exclusivamente una política de control motor.

## Casos de uso
- Locomoción autónoma de un cuadrúpedo de bajo coste: la política convierte comandos de twist en consignas articulares a 50 Hz, lo que permite teleoperar o navegar el MicroDuck con control de velocidad y giro sin desarrollar un controlador clásico.
- Recuperación tras caída en entornos no estructurados: con `getup_facedown_success` y `getup_faceup_success` al 100 % y 0,44 s de tiempo de levantada boca abajo, es adecuada para robots que operan solos y deben reanudar la marcha sin asistencia humana.
- Investigación en sim-to-real: sirve como referencia reproducible para validar pipelines de entrenamiento (Mjlab) y transferencia a hardware HD-1910, dado que el plant, el HOME y los parámetros de servo están documentados en `plant.json`.
- Robótica educativa y prototipado: al ser Apache 2.0 y ejecutarse vía ONNX, se puede desplegar en laboratorios y aulas para experimentar con políticas de RL en robots pequeños.
- Pruebas de robustez en banco: los escenarios de baja fricción, bajo suministro y empujones permiten usar el modelo como sujeto de test para validar firmware, baterías y servos antes de desplegar en campo.
- Vigilancia o inspección de interiores a baja velocidad: con vx comandado de 0,2 m/s (alcanzado 0,186) y giro en torno a ±0,3 rad/s, encaja en tareas de patrulla lenta en espacios cerrados.
- Demostraciones de recuperación autónoma: útil para vídeos y validaciones de producto donde se quiere mostrar que el robot se levanta solo tras una caída.

## Benchmarks y rendimiento
Resultados declarados por el autor en la model card (familia `velstand` eval v1.0, 256 robots, seed 0). No verificados de forma independiente (`verified: false`).

| Metrica | Valor |
|---|---|
| getup_facedown_success | 1.0 |
| getup_faceup_success | 1.0 |
| getup_facedown_time_s | 0.44 |
| yaw_+0.3_achieved | 0.258 |
| yaw_-0.3_achieved | -0.331 |
| vx_0.2_achieved | 0.186 |
| walk_falls_low_friction | 0.0 |
| walk_falls_low_supply | 0.0 |
| push_walking_up_at_end | 0.988 |

No se han publicado resultados comparativos con otras políticas en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB, lo que sugiere un modelo ONNX muy pequeño, pero no se especifica el número de parámetros.
- GPU recomendadas: no disponibles; al ser una política de control a 50 Hz, probablemente se ejecuta en CPU o en un acelerador embebido, pero no hay datos en la información proporcionada.
- ¿Cabe en GPU de consumo? No disponible; por el tamaño del repo es plausible, pero no confirmado.
- Opciones de despliegue: ONNX Runtime (formato declarado) y la CLI `robotctl` del ecosistema MicroDuck (`robotctl policy load walk ...`).
- Latencia y throughput: la política corre a 50 Hz; el plant simula latencia de 4-10 pasos de física. No se publican cifras de latencia de inferencia ni de throughput.

## Comparativa con modelos similares
No disponible. No se han encontrado en la información proporcionada políticas comparables de la misma familia o de otros cuadrúpedos con las que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias
- Los resultados de benchmarks son declarados por el autor y están marcados como no verificados; no hay validación independiente.
- La política está entrenada para un plant concreto (hash `8cab365632f68d40`, 790,6 g, servos `hd1910_m6_2026-10-10.json`); cambios de masa, geometría o servos pueden degradar el rendimiento.
- Rango de alimentación entrenado limitado a 5,6-6,8 V (pack 2S antiguo); fuera de ese rango el comportamiento no está garantizado.
- Los comandos deben limitarse al rango articular; el firmware realiza el clamp, pero la política no lo hace por sí misma.
- El "fall stop" está desactivado: el robot no se detiene al caer, lo que puede ser un riesgo en entornos con personas u obstáculos.
- El código de entrenamiento (rama `hd1910-s2r`, commit `0dc0be9a5`) no está publicado, lo que dificulta la reproducibilidad completa.
- No hay información sobre sesgos, alucinación ni capacidades lingüísticas porque no es un modelo de lenguaje.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan garantías ni soporte.
- No se especifican parámetros totales, cuantizaciones ni requisitos de hardware, lo que limita la planificación de despliegue.

## Enlaces
- Hugging Face: https://huggingface.co/duckyduck369/microduck-hd1910-velstand-djbob
- Vídeo de replay: https://huggingface.co/duckyduck369/microduck-hd1910-velstand-djbob/resolve/main/replay.mp4
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
