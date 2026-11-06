# duckyduck369/microduck-hd1910-velstand-Yanke01

## Resumen

microduck-hd1910-velstand-Yanke01 es una política de control locomotriz entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo Microduck en su configuración HD-1910 (trunk v3 con soporte de batería). Lo desarrolla el usuario duckyduck369 y se publica bajo licencia Apache 2.0 en formato ONNX. No es un modelo de lenguaje: es un controlador de bajo nivel que traduce comandos de velocidad (avance, desplazamiento lateral y guiñada) en consignas articulares para los servos hd1910, además de ejecutar maniobras de levantarse tras una caída.

El modelo resuelve el problema clásico de locomoción en robótica: convertir una orden de twist (vx, vy, yaw) en una política estable a 50 Hz que mantenga la cabeza en la pose HOME y tolere perturbaciones como baja fricción, caídas del suministro eléctrico o empujones. La política se ejecuta con ganancias Kp 6.0 / Kd 5.0 y está pensada para desplegarse en el robot real, no solo en simulación.

Su relevancia radica en que documenta de forma inusualmente detallada el proceso de entrenamiento (currículo, pesos de recompensa, linaje de iteraciones) y publica métricas de evaluación sobre 256 robots en simulación, lo que facilita la reproducibilidad y la comparación con otras políticas de la familia velstand. El repositorio no contiene pesos de gran tamaño (0.0 GB declarados) y no dispone de descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (red neuronal de control) exportada a ONNX; arquitectura interna no detallada |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (control reactivo a 50 Hz) |
| Tipos de cuantización | no disponible (formato ONNX) |
| Idiomas soportados | no aplica (modelo de robótica) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La política se entrenó con la tarea `Mjlab-VelStand-Real-Flat-MicroDuck-HD1910`, en un entorno de simulación física (Mjlab) con el modelo de planta identificado por el hash `c2362b5ef29d28fc`. La planta simula un robot de 790.6 g con servos `hd1910_m6_2026-10-10.json`, alimentación entre 6.8 y 7.4 V con caída de tensión de 0.0 a 0.2 V por N·m y suelo de 6.5 V, y latencia de 2 a 8 pasos de física. El entrenamiento llegó a la iteración 17100 (410.688 pasos de entorno), partiendo del checkpoint `model_17100.pt`.

El linaje documentado es `vs_v3thigh_lr5e5` (it 17100, trunk v3 con colisión de muslo) ← `vs_neck_lr5e5_w20` (it 16450, límite de cuello 10/−20 grados) ← `vs_djft_gt` (it 16000, djbob v4 con Kp 6 / Kd 5 ← seguimiento condicionado a postura erguida). El entrenamiento emplea un currículo explícito: el peso de `action_rate_l2` pasa de −0.1 a −1 entre las iteraciones 0 y 1500, la proporción de entornos en pie sube de 0.02 a 0.25 entre las iteraciones 0 y 2000, y se introducen progresivamente `head_pose_bias`, `com_upward_velocity`, `fallen_tax` y `recovery_success`. Los pesos finales de recompensa incluyen `track_linear_velocity` (3), `track_angular_velocity` (2), `upright` (2), `air_time` (3), `height_progress` (30), `recovery_success` (10) y penalizaciones como `head_over_limit` (−20) y `lin_vel_error` (−4). El autor advierte de que el código de la tarea cambió tras el entrenamiento y que los pesos finales se replicaron desde el plan del currículo, no desde el `env.yaml` original.

## Capacidades

- Locomoción omnidireccional: sigue comandos de twist con velocidad lineal en x e y (m/s) y velocidad angular de guiñada (rad/s).
- Levantarse tras una caída: éxito del 100 % boca abajo y del 99.6 % boca arriba, con un tiempo de 0.48 s en el caso boca abajo.
- Recuperación autónoma: la política se levanta por sí sola (sin parada de caída activada), rodando primero sobre el vientre cuando está boca arriba.
- Estabilización de la cabeza: mantiene la pose HOME con seguimiento explícito de la postura de la cabeza (`head_pose_tracking` con peso 2).
- Robustez a perturbaciones: tasas de caída de 0.004 con baja fricción y 0.008 con bajo suministro eléctrico.
- Resistencia a empujones: `push_walking_up_at_end` = 1.0, es decir, termina de pie tras el empujón en todos los casos evaluados.
- Control a 50 Hz con ganancias fijas Kp 6.0 / Kd 5.0 escritas al arrancar.
- No soporta tool calling, agentes, multilingüismo ni modalidades de texto, visión o audio.

## Casos de uso

- Despliegue en el robot Microduck HD-1910 real: la política se carga con `robotctl policy load walk duckyduck369/microduck-hd1910-velstand-Yanke01` y se ejecuta a 50 Hz con la pose HOME como referencia sin offsets, lo que permite poner el robot a caminar sin ajustes manuales.
- Recuperación autónoma en entornos no estructurados: con la parada por caída desactivada, el robot se levanta solo tras tropiezos, útil en inspección de interiores o patrullaje donde no hay operador presente.
- Navegación teleoperada: al aceptar vx, vy y yaw de forma independiente, se integra con joysticks o mandos remotos para desplazamientos laterales y giros suaves en espacios reducidos.
- Investigación en aprendizaje por refuerzo: el repositorio documenta currículo, pesos de recompensa y linaje de checkpoints, lo que sirve como referencia reproducible para estudiar el efecto de términos como `recovery_success`, `fallen_tax` o `head_pose_bias`.
- Evaluación comparativa de políticas velstand: las métricas sobre 256 robots con semilla 0 permiten contrastar variantes de la familia bajo las mismas condiciones de simulación.
- Validación de modelos de planta: al estar atada a un `plant.json` concreto (masas, rangos articulares, parámetros de servo, geometría de colisión), sirve para verificar que la identificación del robot real coincide con la simulación.
- Docencia en robótica cuadrúpeda: el desglose de recompensas y etapas del currículo facilita explicar cómo se moldea el comportamiento de levantarse y caminar de forma conjunta.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (familia `velstand` eval v1.0, 256 robots, semilla 0). Ninguno está verificado de forma independiente.

| Métrica | Valor |
|---|---|
| getup_facedown_success | 1.0 |
| getup_faceup_success | 0.996 |
| getup_facedown_time_s | 0.48 |
| yaw_+0.3_achieved | 0.01 |
| yaw_-0.3_achieved | −0.004 |
| vx_0.2_achieved | 0.189 |
| walk_falls_low_friction | 0.004 |
| walk_falls_low_supply | 0.008 |
| push_walking_up_at_end | 1.0 |

No se han publicado resultados de benchmarks estándar de NLP (MMLU, HumanEval, GSM8K) porque el modelo no es lingüístico. No hay comparación numérica con otras políticas en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio declara 0.0 GB y el modelo se distribuye en ONNX, por lo que la huella es mínima y cabe en CPU o en cualquier GPU moderna.
- GPU recomendadas: no se especifican; al ejecutarse a 50 Hz sobre un robot físico, la inferencia puede correr en la CPU del propio robot o en un equipo embebido.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU de consumo (RTX 3060 o superior) e incluso en CPU, aunque no hay datos publicados de latencia.
- Opciones de despliegue: ONNX Runtime como vía natural; el autor proporciona el comando `robotctl policy load walk ...` para el robot real. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; el bucle de control corre a 50 Hz con Kp 6.0 / Kd 5.0, pero no se publican tiempos de inferencia por paso.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de la familia velstand ni modelos comparables con parámetros, contexto o licencia que permitan una tabla rigurosa.

## Limitaciones y advertencias

- El giro en el sitio por debajo de aproximadamente 0.4 rad/s apenas produce rotación: `yaw_+0.3_achieved` es 0.01 y `yaw_-0.3_achieved` es −0.004, muy lejos del objetivo de 0.3 rad/s.
- El seguimiento de velocidad lineal es parcial: con consigna vx de 0.2 m/s se alcanzan 0.189 m/s, un 5.5 % por debajo.
- El autor advierte de que el código de la tarea cambió tras el entrenamiento (términos de recompensa distintos de los del `env.yaml` de la ejecución) y que los pesos finales se replicaron desde el plan del currículo; esto puede afectar a la reproducibilidad exacta.
- Las métricas están declaradas por el autor y marcadas como no verificadas; no hay validación independiente.
- El modelo está atado a una planta concreta (hash `c2362b5ef29d28fc`, trunk v3 con soporte de batería, colisión de muslo, servos hd1910): cambios de hardware o de masa invalidan las garantías.
- Requiere usar la pose HOME ajustada como predeterminada en tiempo de ejecución, sin offsets, y desactivar la parada por caída para aprovechar la recuperación autónoma.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas porque no es un modelo de lenguaje; esas categorías no aplican.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero no se documentan garantías ni soporte.
- El repositorio no registra descargas ni interacciones, por lo que no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/duckyduck369/microduck-hd1910-velstand-Yanke01
- Vídeo de replay: https://huggingface.co/duckyduck369/microduck-hd1910-velstand-Yanke01/resolve/main/replay.mp4
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
