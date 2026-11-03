# duckyduck369/microduck-hd1910-roulade-Yanke01

## Resumen
microduck-hd1910-roulade-Yanke01 es una política de control entrenada por refuerzo para un robot cuadrúpedo de tipo Microduck equipado con servos HD-1910. La desarrolla el usuario duckyduck369 y se publica en HuggingFace bajo licencia Apache 2.0 en formato ONNX. No es un modelo de lenguaje: es una política de locomoción que ejecuta una voltereta hacia delante (forward roll) partiendo de la posición de pie, pasando por encima de la cabeza y volviendo a quedar sobre los pies, manteniendo la cabeza cerca de la pose HOME durante el movimiento.

El interés técnico está en que la tarea requiere control dinámico de contacto, gestión de límites articulares y robustez frente a perturbaciones físicas (baja tensión de alimentación, baja fricción, variaciones de centro de masa). La política se entrena en simulación con el task `Mjlab-Roulade-Real-Flat-MicroDuck-HD1910` y se evalúa sobre el modelo de planta real del robot, con hash `a009ad0d53d0d3de`, que incluye geometría de tronco v3 con soporte de batería y colisión de muslo.

La relevancia es acotada pero clara: demuestra un pipeline completo de entrenamiento RL, currículo de recompensas, aleatorización de dominio y exportación ONNX para un robot de bajo coste con servos comerciales, con métricas de éxito declaradas por el autor y verificadas solo en simulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control por refuerzo (reinforcement learning) exportada a ONNX; no es un transformer ni un modelo generativo |
| Parametros totales | no disponible (el repositorio ocupa 0.0 GB y no se detalla el número de parámetros de la red) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; el artefacto publicado es ONNX |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento
La política se entrena con refuerzo en el task `Mjlab-Roulade-Real-Flat-MicroDuck-HD1910`, hasta la iteración 6800 (163.392 pasos de entorno, a partir de `model_6800.pt`). La línea de entrenamiento parte de `r26_prog12` (iteración 6800, con `roulade_progress` 12) y encadena versiones previas: `r25_damp03` (iteración 6600, arrival damping -0.3), `r24` (límite de cabeza 45 grados, reducido a 10 grados en posición erguida), `r21-r23` (Kp 6 / Kd 5, HOME del robot, límites en runtime) y `r10_calm1` (iteración 4747, Kp 5 / Kd 20 con HOME upstream).

El entrenamiento usa un currículo de recompensas con pesos iniciales y finales documentados. Destacan `roulade_progress` (peso 12), `roulade_landing_composite` (4), `roulade_stand_tax` (5), `roulade_landing_sharp` (2), `roulade_upright_after_roll` (1.5) y penalizaciones como `head_over_limit` (-10) y `head_over_limit_upright` (-10). El currículo ajusta `action_rate_l2` de -0.1 a -0.4, `arrival_damping` de 0 a -0.3, `joint_torque_rate_l2` de 0 a -0.001 y `gentle_landing` de 0.002 a 0.005. También se aplica aleatorización de dominio: posición y orientación inicial, fricción de pies entre 0.5 y 1.5, bias de encoder de ±0.015, centro de masa con rangos que crecen hasta ±0.015 y mezcla de estados de spawn (de 50/50 standing/midroll a 80/20).

La planta simulada reproduce el robot real: 790,6 g, modelo de servo `hd1910_m6_2026-10-10.json`, alimentación entre 6,8 y 7,4 V con caída de 0,0 a 0,2 V por N·m y suelo de 6,5 V, y latencia de 3 a 6 pasos de física. La política se ejecuta a 50 Hz con Kp 6.0 / Kd 5.0.

## Capacidades
- Ejecución de una voltereta hacia delante completa desde posición de pie, con retorno a la posición erguida.
- Mantenimiento de la cabeza y el pitch del cuello dentro de 45 grados respecto a HOME durante el roll, y 10 grados una vez levantado.
- Control de 14 articulaciones en el orden de política documentado, con HOME `[0.0, -0.087, -0.428, -0.005, 0.453, 0.569, 0.349, 0.0, 0.0, 0.0, 0.087, 0.428, 0.005, -0.453]`.
- Robustez frente a baja tensión de alimentación (éxito 0.695) y baja fricción (éxito 0.762).
- Inicio autónomo del roll al ejecutarse, sin necesidad de comando de twist (se mantiene a 0).
- Clamp de objetivos a los límites articulares de runtime.
- No soporta tool calling, agentes, multilingüismo ni generación de texto: es una política motora.

## Casos de uso
- Demostración de acrobacia robótica en cuadrúpedos de bajo coste: la política ejecuta el roll de forma autónoma al arrancar, lo que permite validar en un robot real la cadena sim-to-real con servos HD-1910.
- Investigación en aprendizaje por refuerzo: sirve como referencia reproducible de currículo de recompensas, aleatorización de dominio y evaluación con 256 robots y semilla 0.
- Pruebas de robustez de controladores: las métricas `success_low_supply` y `success_low_friction` permiten evaluar el comportamiento bajo condiciones adversas de alimentación y suelo.
- Integración en pipelines de robótica con ONNX Runtime: al publicarse en ONNX, puede desplegarse en el robot o en un simulador compatible sin dependencias de framework de entrenamiento.
- Benchmark de planta y servo: el `plant.json` con masas, rangos articulares, HOME, parámetros de servo y geometría de colisión sirve para comparar controladores sobre la misma planta.
- Transición entre políticas: el modelo está pensado para devolver el control a la política de caminar tras `duration_s`, lo que encaja en arquitecturas de habilidades encadenadas.

## Benchmarks y rendimiento
Datos declarados por el autor en el model-index y en la model card (no verificados, marcados como `verified: false`). Evaluación de la familia `roulade` v1.0, 256 robots, semilla 0.

| Métrica | Valor |
|---|---|
| success | 1.0 |
| success_low_supply | 0.695 |
| success_low_friction | 0.762 |
| up_time_s_median | 1.18 |
| after_trunk_rate_deg_s | 1.5 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB y la política ONNX es de tamaño reducido, pero no se detalla el número de parámetros ni el peso exacto del fichero.
- GPU recomendadas: no disponible; al ser una política de control a 50 Hz, no requiere aceleración GPU para inferencia en tiempo real.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del repositorio, aunque no se confirma en la información disponible.
- Opciones de despliegue: ONNX Runtime (formato publicado); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: la planta simulada introduce una latencia de 3 a 6 pasos de física; la política se ejecuta a 50 Hz. No se publican cifras de throughput.

## Comparativa con modelos similares
No disponible. No se han encontrado en la información proporcionada políticas comparables de la misma familia `roulade` ni modelos de referencia con los que contrastar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados (`verified: false`); solo se han medido en simulación.
- La política se entrenó sobre el tronco antiguo sin colisión de muslo, mientras que la evaluación y la planta usan la geometría v3 con soporte de batería y colisión de muslo; esta discrepancia puede afectar a la transferencia real.
- El roll se inicia automáticamente al ejecutar la política; no hay comando de activación, lo que limita su uso en secuencias que requieran control explícito del momento de inicio.
- Requiere condiciones de ejecución concretas: Kp 6 / Kd 5, 50 Hz, HOME sin offsets, parada por caída desactivada durante la ejecución y clamp a límites de runtime.
- El éxito cae al 69,5 % con baja alimentación y al 76,2 % con baja fricción, lo que indica sensibilidad a condiciones físicas adversas.
- No procesa lenguaje ni tiene capacidades generativas; no aplican sesgos lingüísticos, alucinación o limitaciones de contexto.
- Licencia Apache 2.0: permite uso comercial, pero no se documentan garantías ni soporte del autor.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/duckyduck369/microduck-hd1910-roulade-Yanke01
- Vídeo de replay: https://huggingface.co/duckyduck369/microduck-hd1910-roulade-Yanke01/resolve/main/replay.mp4
