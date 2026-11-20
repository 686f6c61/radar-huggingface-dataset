# cetiennec/asimov-pingpong-balance

## Resumen

Asimov 1: ping-pong ball balancing on a paddle es un checkpoint de aprendizaje por refuerzo (RL) que implementa una política de control para el robot humanoide Asimov 1 de Menlo Research (25 grados de libertad, sin pinza). El modelo resuelve una tarea concreta de manipulación dinámica: mantener una pelota de ping-pong en equilibrio sobre una pala de tenis de mesa sujeta en la muñeca derecha, percibida mediante la cámara de la cabeza del propio robot. Está entrenado con PPO en el simulador MuJoCo y desplegado en un robot real llamado "Albert", tanto con soporte de grúa como de pie.

La relevancia del trabajo radica en su enfoque de sim-to-real: el autor identifica los parámetros del brazo real (ganancias, amortiguamiento, fricción, retardo de 34 ms), modela el ruido de la cámara de Albert (jitter de 1,5 mm, hasta un 10 % de detecciones desviadas 1-3 cm, frames perdidos) y entrena con inclinaciones corporales realistas (7 grados con grúa, 12 grados de pie). El resultado es una política que logra 57 segundos de equilibrio en 60 segundos de prueba estando el robot de pie sin soporte, con una captura más larga de 46 segundos.

El repositorio es pequeño (0,1 GB) y contiene únicamente pesos y artefactos de entrenamiento; no incluye el modelo MJCF ni las mallas de Menlo, ni las grabaciones crudas del robot. La política es una MLP de 2 capas de 256 unidades con inferencia en numpy a unos 7 microsegundos por llamada, lo que la hace extremadamente ligera para despliegue en el propio robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP de 2 capas de 256 unidades (política PPO) |
| Parametros totales | no disponible (pesos en `best.pt`/`last.pt`; arquitectura 2x256) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; observación de 40 floats por paso) |
| Tipos de cuantizacion | no disponible (inferencia en numpy, sin cuantización documentada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best.pt`, `last.pt`) con `args.json`, `log.csv`, `train.log` |

## Arquitectura y entrenamiento

La política es una red MLP de 2 capas de 256 unidades entrenada con PPO en MuJoCo. La observación tiene 40 dimensiones: posición y velocidad de la pelota sobre la pala (estimadas por un predictor de Kalman), gravedad en el marco de la pala, giroscopio, acelerómetro, ángulos y velocidades del brazo, reloj de marcha (ceros cuando está de pie) y las últimas 3 acciones. La acción son 5 incrementos de articulaciones del brazo derecho (escalados por 0,03 rad) a 50 Hz.

El entrenamiento incorpora un currículo, aleatorización de dominio y un modelo de cámara realista. La innovación principal es el ajuste del simulador al robot real: identificación del brazo con `tools/sysid_arm.py` (ganancias, amortiguamiento, fricción, retardo de 34 ms), ruido de cámara calibrado con datos de Albert y modelado de inclinaciones corporales entre 7 y 12 grados. El predictor de Kalman reproduce cada frame en su instante de captura (~105 ms de antigüedad), predice la posición actual de la pelota a partir de la inclinación de la pala, descarta outliers y aprende el error plano de la pala. Para el equilibrio de pie sin grúa, las piernas se mantienen rígidas en una postura centrada (cadera -0,50, rodilla 0,55, tobillo -0,21 rad) hallada en simulación libre.

## Capacidades

- Equilibrado dinámico de una pelota de ping-pong sobre una pala sujeta en la muñeca derecha, con percepción por cámara de cabeza.
- Control de brazo de 5 grados de libertad a 50 Hz mediante incrementos articulares.
- Predicción de estado de la pelota con filtro de Kalman a partir de detecciones visuales ruidosas y retardadas.
- Robustez ante perturbaciones: inclinaciones corporales de hasta 12 grados, retardo de brazo de 40-100 ms y ruido de cámara realista.
- Operación de pie sin soporte de grúa con postura centrada precalculada.
- No soporta tool calling, function calling, agentes multi-paso ni capacidades multilingües (no es un modelo de lenguaje).
- No soporta visión general, audio ni modo de razonamiento; la "visión" se limita a la detección de la pelota blanca sobre la pala roja.

## Casos de uso

- Investigación en sim-to-real para robótica humanoide: el checkpoint `albert_v2A` sirve como referencia de política que transfiere de MuJoCo a un robot real con 57 s de equilibrio de pie, útil para estudiar identificación de sistemas y calibración de sensores.
- Desarrollo de control dinámico de manipuladores: la política de 5 acciones a 50 Hz puede integrarse en pipelines de control de brazo para tareas de equilibrio y seguimiento de objetos, con inferencia en numpy de ~7 us por llamada.
- Validación de modelos de cámara y predictores de estado: el código de `asimov_pp/` incluye el modelo de cámara y el predictor de Kalman, reutilizables para evaluar robustez perceptiva en otros robots.
- Benchmark de políticas RL en humanoides: los checkpoints `cam_*`, `balance`, `perturb` y `move` permiten comparar etapas de entrenamiento (92-100 % en simulación) y estudiar el efecto de la aleatorización de dominio.
- Prototipado de seguridad en robots reales: el watchdog de inclinación cada 20 ms y la secuencia de recuperación (`stand()` -> `balance()`, nunca DAMP) son un ejemplo concreto para diseñar paradas seguras en producción.
- Docencia y reproducción de experimentos: el repositorio incluye `train_*.sh`, `args.json` y `log.csv` para reproducir el entrenamiento PPO y el currículo en MuJoCo.
- Evaluación con robot simulado: `tools/eval_albert` y el robot mock permiten ejecutar las rutas de código del robot real sin hardware, útil para CI de políticas de control.

## Benchmarks y rendimiento

| Escenario | Fecha | Configuración | Equilibrio en 60 s | Captura más larga |
|---|---|---|---|---|
| Albert con grúa, primera política Kalman | 2026-11-19 | `albert_perturb` (retardo de brazo en entrenamiento) | 11,5 s en 22 s | no disponible |
| Albert con grúa, `albert_perturb` | 2026-11-19 | retardo de brazo en entrenamiento | 37 s | 33 s |
| Albert con grúa, `albert_v2A` | 2026-11-20 | sim ajustada al robot | 43,5 s | 43 s (terminada por movimiento de grúa) |
| Albert de pie, cuerda floja, `albert_v2A` | 2026-11-20 | sim ajustada al robot | 57 s | 46 s |
| Simulación libre, `albert_v3_final` | no disponible | ajuste fino con inclinaciones | 70 % vs 65 % (v2A) | pelota a 2,1 vs 2,7 cm del centro |
| Simulación genérica Asimov 1 (`cam_*`, `balance`/`perturb`/`move`) | no disponible | etapas 1-3 | 92-100 % | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; la política es una MLP de 2x256 con inferencia en numpy (~7 us por llamada), por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU; cualquier CPU moderna o GPU integrada es suficiente. Para entrenamiento PPO en MuJoCo se recomienda una GPU con al menos 8 GB (RTX 3060 o superior), aunque no se documenta en la información disponible.
- Cabe en GPU consumer: sí, en cualquier modelo (RTX 4090, RTX 3060, etc.) e incluso en CPU.
- Opciones de despliegue: inferencia directa con `asimov_pp.ppo.load_policy` en numpy; en el robot real mediante `albert/run_policy.py` y menlo-sdk; simulación con MuJoCo y `albert.run_policy --sim`.
- Latencia y throughput: ~7 us por llamada de política; control a 50 Hz (20 ms por paso); watchdog de seguridad cada 20 ms; predictor de Kalman con latencia de frame de ~105 ms.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Asimov 1 ping-pong balance (este) | Política RL (MLP 2x256) | no disponible | no aplica (obs. 40) | 57 s de equilibrio de pie en robot real | MIT | Hugging Face |
| zecice/so101-pingpong-balance | Política RL para brazo SO-101 | no disponible | no aplica | no disponible en la información | no disponible | GitHub (inspiración declarada) |
| Políticas genéricas Asimov 1 (`cam_*`, `balance`) | Política RL (MLP) | no disponible | no aplica | 92-100 % en simulación | MIT | Incluidas en el mismo repo |
| Menlo Asimov 1 walking policy | Política RL de locomoción | no disponible | no aplica | no disponible | no disponible | menlo-sdk (no incluida) |

## Limitaciones y advertencias

- No hay marcha con la pala en el robot: el control articular de menlo-sdk desactiva la política de caminar de Menlo, por lo que el checkpoint `albert_move` es débil y solo funciona en simulación.
- La pose de la cámara, los offsets del brazo y el cero del cuello se desplazan cuando el robot cae; se requiere un marcador fiducial en la pala para recalibrar.
- El repositorio no incluye el MJCF ni las mallas de Asimov 1 de Menlo, ni la malla de la copa de muñeca, ni grabaciones crudas ni imágenes de cámara; la reproducibilidad completa depende de material externo.
- El rendimiento en el robot real está medido en sesiones concretas (2026-11-19 y 2026-11-20) y puede no generalizar a otras condiciones de iluminación, superficies o desgaste del hardware.
- La tarea es muy específica (pelota blanca sobre pala roja); el detector no está diseñado para objetos genéricos y la "visión" es limitada.
- No es un modelo de lenguaje: no tiene capacidades de texto, código, matemáticas ni multilingües; los sesgos y la alucinación no aplican en el sentido habitual, pero sí el riesgo de fallo perceptivo ante detecciones erróneas.
- Licencia MIT: permite uso comercial, pero el material de Menlo (MJCF, mallas, menlo-sdk) puede tener sus propias restricciones no cubiertas por esta licencia.
- El equilibrio de pie depende de una postura centrada hallada en simulación; la postura de pie nativa de Albert coloca el centro de masa en los dedos y vuelca.
- La recuperación ante errores requiere grúa con cuerda tensa y luego floja; no se documenta una recuperación autónoma tras caída.

## Enlaces

- Hugging Face: https://huggingface.co/cetiennec/asimov-pingpong-balance
- Repositorio de Asimov 1 (Menlo Research): https://github.com/menloresearch/asimov-1
- Inspiración SO-101 ping-pong balance: https://github.com/zecice/so101-pingpong-balance
- Vídeo de simulación: https://huggingface.co/cetiennec/asimov-pingpong-balance/resolve/main/videos/5_albert_freestand_sim.mp4
- Guía de operación con grúa: `albert/MORNING.md` (en el repositorio)
- Guía de ejecución en la Raspberry Pi de Albert: `albert/ONBOARD.md` (en el repositorio)
