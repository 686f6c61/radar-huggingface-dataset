# duckyduck369/microduck-hd1910-velstand-demo

## Resumen

`microduck-hd1910-velstand-demo` es una política de control motriz entrenada mediante aprendizaje por refuerzo para un robot cuadrúpedo de pequeñas dimensiones (790,6 g) equipado con servos HD1910. Lo publica el usuario `duckyduck369` dentro de la familia `microduck` y el *plant* (modelo físico del robot) identificado por el hash `54c147ebc5a06f45`. El modelo no es un modelo de lenguaje: es una política neuronal exportada a ONNX que recibe comandos de velocidad (avance, lateral y guiñada) y devuelve posiciones articulares objetivo a 50 Hz.

El propio autor lo etiqueta explícitamente como "TEST ENTRY for checking the ranking" y advierte que es el checkpoint 6000 de un *run* de la familia `velstand`, sin intención de uso en robots reales. Su interés es, por tanto, documental y de evaluación: sirve para validar el pipeline de ranking de la familia `microduck-eval-velstand-1.0` y para inspeccionar cómo se comporta un checkpoint intermedio de un entrenamiento con currículo de recompensas sobre un modelo físico concreto.

La relevancia práctica es limitada: no hay descargas ni validación externa, el repositorio pesa 0,0 GB (lo que sugiere que los pesos no están efectivamente alojados o son de tamaño despreciable) y la rama de código de entrenamiento (`hd1910-s2r`) no está publicada. Aun así, la model card es inusualmente detallada en cuanto a parámetros del *plant*, recompensas y currículo, lo que la convierte en una referencia útil para quien entrene políticas de locomoción en `mjlab`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal de control (reinforcement learning), exportada a ONNX; topología interna no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La política se entrena con la tarea `Mjlab-VelStand-Flat-MicroDuck-HD1910-S2R3`, en un entorno de simulación física plano (`Flat`) con el *plant* del microduck equipado con servos HD1910. El entrenamiento llega hasta la iteración 6000, equivalente a 144 048 pasos de entorno, partiendo de `model_6000.pt`. La línea de descendencia es `velstand_s2r3b` it 6000 ← `velstand_s2r3` (run 3) it 2000 ← `s2r3e` it 4500, lo que indica un refinamiento iterativo sobre políticas previas de la misma familia. El código de entrenamiento corresponde a la rama local `hd1910-s2r` en el commit `0dc0be9a5`, no publicada.

El diseño del entrenamiento combina un conjunto amplio de términos de recompensa con un currículo por etapas. Entre los términos destacan el seguimiento de velocidad lineal y angular (peso 2 cada uno), el mantenimiento de postura erguida (peso 2), el *air_time* (peso 3) y penalizaciones fuertes a la anchura de stance (-15), a la desviación de cadera en *yaw* y *roll* (-3 cada una) y a las colisiones internas (-1). El currículo modula a lo largo de las iteraciones el peso de `action_rate_l2` (de -0,1 a -1), la proporción de entornos en reposo (`standing_envs`, de 0,02 a 0,25), los rangos de aleatorización de la pose de cabeza y del centro de masas, y activa progresivamente términos como `recovery_success` (+10), `com_upward_velocity` (+2), `lin_vel_error` (-4), `yaw_rate_error` (-0,5), `foot_slip_l1` (-3) y `fallen_tax` (-0,5). La penalización por caída (`fall_penalty`) arranca en -250 y se anula al final del currículo, lo que permite que la política aprenda a levantarse por sí misma sin que la recompensa penalice el estar en el suelo.

El *plant* modela el robot con 790,6 g de masa total, servo `hd1910_m6_2026-10-10.json`, alimentación entre 5,6 y 6,8 V con caída de tensión de 0,1 a 0,5 V por N·m y suelo de 3,5 V, y latencia de 4 a 10 pasos de física. La posición HOME en el orden de articulaciones de la política es `[0.0, -0.0873, -0.4282, -0.0049, 0.453, 0.3491, 0.3491, 0.0, 0.0, 0.0, 0.0873, 0.4282, 0.0049, -0.453]` y las ganancias de servo son Kp 8,0 / Kd 20,0, escritas al inicio y ejecutadas a 50 Hz.

## Capacidades

- Locomoción cuadrúpeda dirigida por comandos de *twist*: velocidad lineal `vx` en m/s, velocidad lateral `vy` en m/s y velocidad de guiñada `yaw` en rad/s.
- Levantarse desde posición boca abajo (`getup_facedown`) y boca arriba (`getup_faceup`), con parada de caída desactivada (`fall stop OFF`) para que la política se reincorpore por sí misma.
- Seguimiento de velocidad lineal y angular con tolerancias evaluadas en el conjunto `velstand eval v1.0`.
- Control de postura de cabeza y cuerpo mediante términos de recompensa dedicados (`head_pose_tracking`, `body_pose_tracking`, `head_pose_bias`).
- Robustez ante fricción baja y ante caídas de tensión de alimentación, medidas por `walk_falls_low_friction` y `walk_falls_low_supply`.
- Recuperación tras empujones mientras camina (`push_walking_up_at_end`).
- No soporta *tool calling*, agentes, razonamiento multi-paso, multilingüismo ni modalidades de visión o audio: es una política de control, no un modelo generativo.

## Casos de uso

- **Validación del pipeline de ranking de la familia `velstand`**: el modelo está etiquetado como entrada de prueba para comprobar el ranking; se usaría como caso de control en la evaluación `microduck-eval-velstand-1.0` con 256 robots y semilla 0 para verificar que las métricas se calculan y ordenan correctamente.
- **Reproducción de la evaluación de referencia**: con `eval.json` y `plant.json` del repositorio se puede reconstruir el entorno de simulación y comparar los resultados declarados (por ejemplo, `getup_facedown_success` = 1,0 y `walk_falls_low_supply` = 0,0) frente a ejecuciones propias.
- **Inspección de políticas intermedias de un currículo**: al ser el checkpoint 6000 de un *run* con currículo de 33 términos de recompensa, sirve para estudiar cómo evoluciona el comportamiento (por ejemplo, el paso de `fall_penalty` -250 a 0) en políticas parcialmente entrenadas.
- **Depuración de integración ONNX en `mjlab`**: al estar exportado a ONNX y ejecutarse a 50 Hz con ganancias Kp/Kd fijas, permite probar el *runtime* de inferencia y el bucle de control antes de desplegar políticas definitivas.
- **Calibración del modelo de servo HD1910**: los parámetros de alimentación (5,6-6,8 V), caída de tensión y latencia (4-10 pasos) del *plant* se pueden contrastar con medidas reales para ajustar el simulador.
- **Generación de material de demostración**: el repositorio incluye un vídeo `replay.mp4` con los escenarios de la familia en cámara fija y tiempo real, útil para documentar el comportamiento esperado de la familia `velstand`.
- **Pruebas de robustez ante condiciones adversas**: las métricas de fricción baja, suministro bajo y empujón final permiten usar la política como referencia para comparar variantes más robustas de la misma familia.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto `velstand eval v1.0`, 256 robots, semilla 0). Ninguno está verificado (`verified: false`).

| Métrica | Valor |
|---|---|
| getup_facedown_success | 1,0 |
| getup_faceup_success | 1,0 |
| getup_facedown_time_s | 0,4 |
| yaw_+0.3_achieved | 0,142 |
| yaw_-0.3_achieved | -0,121 |
| vx_0.2_achieved | 0,173 |
| walk_falls_low_friction | 0,004 |
| walk_falls_low_supply | 0,0 |
| push_walking_up_at_end | 0,992 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni son aplicables a este tipo de modelo.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible; el repositorio ocupa 0,0 GB y no se especifica el tamaño de los pesos ONNX. Al tratarse de una política de control de un robot de 790,6 g con 14 articulaciones, la red es presumiblemente de tamaño reducido, pero no hay dato confirmado.
- **GPU recomendadas**: no disponible. Por la naturaleza del modelo (inferencia a 50 Hz en un bucle de control), una GPU de gama media o incluso CPU debería bastar, pero no se ha publicado ninguna recomendación.
- **Compatibilidad con GPU de consumo**: no confirmada; no hay información sobre requisitos mínimos.
- **Opciones de despliegue**: ONNX Runtime es el *runtime* natural dado el formato de pesos; el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no aplican a este tipo de modelo.
- **Latencia y throughput**: el bucle de control se ejecuta a 50 Hz (20 ms por ciclo), con latencia de servo modelada de 4 a 10 pasos de física. No se publican cifras de latencia de inferencia de la red.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de la familia `microduck` ni políticas comparables de otros autores con especificaciones publicadas que permitan una comparación rigurosa de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- **No apto para robots reales**: el propio autor indica en la model card "not for robots"; es una entrada de prueba para el ranking, no una política validada en hardware.
- **Resultados no verificados**: todas las métricas de la model card tienen `verified: false`; no han pasado por un proceso de validación independiente.
- **Código de entrenamiento no publicado**: la rama `hd1910-s2r` (commit `0dc0be9a5`) no está disponible, lo que impide reproducir el entrenamiento a partir del repositorio.
- **Repositorio vacío o casi vacío**: 0,0 GB de tamaño y 0 descargas; no se puede confirmar que los pesos ONNX estén efectivamente alojados.
- **Sin datos de sesgo ni alucinación**: al no ser un modelo lingüístico, no aplican sesgos de lenguaje, pero tampoco hay análisis de sesgo de simulación (por ejemplo, sobreajuste al *plant* `54c147ebc5a06f45`).
- **Dependencia estricta del *plant***: la política está entrenada para un modelo físico concreto (790,6 g, servos HD1910, alimentación 5,6-6,8 V); cambios en masas, geometría o servo invalidan los resultados.
- **Licencia Apache 2.0**: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías ni soporte.
- **Sin idiomas soportados**: la ausencia de datos de idioma es esperable y no debe interpretarse como una carencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/duckyduck369/microduck-hd1910-velstand-demo
- Vídeo de replay: https://huggingface.co/duckyduck369/microduck-hd1910-velstand-demo/resolve/main/replay.mp4
- No se han encontrado en la información disponible enlaces a papers, blogs, repositorios de código o demos adicionales.
