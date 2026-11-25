# HannesVonEssen/microduck-running

## Resumen

microduck-running es una política de control (policy) entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo MicroDuck, una plataforma de hardware de pequeñas dimensiones con 14 servomotores Dynamixel XL330. La desarrolla HannesVonEssen y se publica bajo licencia Apache 2.0. No es un modelo de lenguaje: es un artefacto de robótica orientado a locomoción, concretamente a la marcha hacia delante (forward running) sobre terreno plano. El repositorio ocupa 0,1 GB e incluye pesos en ONNX y un checkpoint completo de PyTorch.

El modelo resuelve el problema de generar comandos de posición articular a 50 Hz para que el robot avance de forma robusta ante perturbaciones. La iteración por defecto es la 12.195, obtenida a partir de una política predecesora (iteración 11.748) que alcanzaba 1,687 m/s, sobre la que se aplicaron empujes de velocidad progresivos, variación del centro de masas y inclinación inicial para mejorar la robustez. El resultado mantiene 1,651 m/s de velocidad media en simulacion nominal y 1,612 m/s bajo una batería combinada de holgura mecánica y perturbaciones.

Su relevancia actual radica en que documenta de forma muy explícita el contrato de entrada/salida, la paridad checkpoint-ONNX y las condiciones de evaluación, lo que facilita la reproducibilidad. No obstante, el propio autor lo etiqueta como candidato de simulación, no validado en hardware real, con deriva de rumbo y lateral sustanciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | política de control entrenada con PPO (actor-critic); red neuronal cuyas capas no se detallan; exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (se distribuye ONNX float32 y checkpoint PyTorch) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`policy.onnx`) y checkpoint PyTorch (`checkpoint.pt`) |

Otros datos del contrato técnico:

| Parametro | Valor |
|---|---|
| Entrada | `obs`, float32 `[1, 61]` |
| Salida | `actions`, float32 `[1, 14]` |
| Frecuencia de control | 50 Hz |
| Escala de acción | 1.0, objetivos de posición articular alrededor de MicroDuck HOME |
| Normalizador de observación | integrado en `policy.onnx` |
| Recorte de salida | ninguno |
| Pose de entrada | de pie (standing) |
| Robot | MicroDuck hardware revision 1, 14 servos Dynamixel XL330 |
| Modificaciones de hardware | ninguna |
| Bloque de comando | 13-D: `[twist(3), head_pose(4), body_pose(6)]` |

## Arquitectura y entrenamiento

La política se entrena con PPO (Proximal Policy Optimization) en el simulador mjlab, con un estado completo de actor, crítico, optimizador, normalizadores de observación y contador de currículo guardado en `checkpoint.pt`. El entrenamiento parte de la iteración 11.748 (frontera de velocidad de 1,687 m/s) y continúa hasta la 12.195 aplicando un currículo de robustez: empujes planares de ±0,10 m/s cada 3-6 segundos, variación del centro de masas de ±10 mm en el tronco y ±6 mm en la cabeza, e inclinación inicial de ±2° en pitch y roll. La velocidad objetivo se fija en 2,2 m/s con un tope de 2,4 m/s y un intervalo de etapa de alta velocidad de 750 iteraciones.

Entre las innovaciones destacables está el uso de un objetivo de progreso hacia delante con peso 5,0 y una penalización de tasa de acción de -0,10, además de un 3% de entornos de entrenamiento con comando exactamente cero para enseñar la pose de reposo. Se entrenó con el modelo ordinario del robot y se evaluó sin cambios con un modelo de holgura mecánica (backlash); una continuación entrenada específicamente con backlash rindió peor y fue descartada. La robustificación cuesta aproximadamente un 2,1% de velocidad nominal respecto a la iteración 11.748. La paridad checkpoint-ONNX sobre observaciones cero y aleatorias deterministas tiene un error absoluto máximo de acción de 7,63e-6.

## Capacidades

- Locomoción hacia delante sobre terreno plano a velocidades de hasta 2,20 m/s comandadas, con 1,651 m/s medios observados en simulación nominal.
- Seguimiento de comando de velocidad forward (`twist[0]`) entrenado y evaluado hasta 2,20 m/s; el objetivo de velocidad puede superar el comando, por lo que no actúa como limitador duro.
- Comando de reposo (`twist = [0, 0, 0]`) para mantener la pose de pie, gracias al 3% de entornos con comando cero.
- Robustez ante perturbaciones: empujes planares, variación del centro de masas e inclinación inicial, con supervivencia del 98,83% en la batería de estrés ordinaria.
- Tolerancia a holgura mecánica (backlash) evaluada de forma cruzada sin reentrenamiento, con 98,44% de supervivencia bajo estrés.
- No dispone de percepción de obstáculos, visión, audio ni capacidades lingüísticas.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- Los comandos lateral (`twist[1]`) y de guiñada (`twist[2]`) solo vieron ±0,02 m/s y ±0,05 rad/s en entrenamiento, por lo que deben usarse a cero.
- Los bloques `head_pose` y `body_pose` no se utilizan y deben enviarse a ceros.

## Casos de uso

- Investigación en locomoción sim-to-real: servir como punto de partida para validar en hardware MicroDuck revision 1, comparando la velocidad observada en simulación (1,651 m/s) con la real y midiendo la brecha de transferencia.
- Entrenamiento por refuerzo continuado: el checkpoint incluye actor, crítico, optimizador y normalizadores, lo que permite reanudar el currículo de robustez con los hiperparámetros documentados y explorar nuevas etapas de velocidad.
- Evaluación de robustez de controladores: las baterías de estrés con empujes de ±0,10 m/s, variación de CoM e inclinación inicial sirven como banco de pruebas reproducible para comparar políticas candidatas.
- Estudio de holgura mecánica en robots de bajo coste: la evaluación cruzada con el modelo de backlash (1,612 m/s bajo estrés) permite analizar cuánto degrada la holgura real el rendimiento de una política entrenada sin ella.
- Docencia y divulgación en robótica: el contrato claro (61 observaciones, 14 acciones, 50 Hz) y los scripts de inferencia del playground facilitan reproducir la demo en simulación con `uv run scripts/infer_policy.py`.
- Integración en pipelines de simulación a gran escala: al ser ONNX float32 con normalizador integrado, puede desplegarse en motores de inferencia ligeros y ejecutar 512 entornos en paralelo para barridos de parámetros.
- Referencia de ingeniería para exportación ONNX: la paridad checkpoint-ONNX con error máximo de 7,63e-6 sirve como ejemplo de verificación de exportación en proyectos de RL para robótica.

## Benchmarks y rendimiento

Evaluación en simulación con comando de 2,20 m/s, 1 segundo de calentamiento y horizonte de medición de 10 segundos:

| Evaluación | Entornos | Velocidad body-forward | Supervivencia |
|---|---:|---:|---:|
| Modelo ordinario, nominal | 512 | 1,651 m/s | 99,22% |
| Modelo ordinario, estrés push/CoM/tilt | 512 | 1,635 m/s | 98,83% |
| Modelo con backlash, nominal | 256 | 1,636 m/s | 98,83% |
| Modelo con backlash, estrés push/CoM/tilt | 256 | 1,612 m/s | 98,44% |
| Alta fricción más estrés completo | 512 | 1,642 m/s | 96,68% |

El estrés comprende empujes planares de ±0,10 m/s cada 3-6 segundos, ±10 mm de CoM en tronco, ±6 mm de CoM en cabeza y ±2° de pitch/roll iniciales. El caso de alta fricción amplía el coeficiente de fricción del pie de 0,7-1,3 a 0,7-1,8. Los resultados brutos están en el directorio `eval/` del repositorio. No se han publicado resultados de benchmarks estándar de modelos de lenguaje (MMLU, HumanEval, GSM8K) porque no aplican a este artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB y el modelo es una política de control de pequeñas dimensiones, por lo que la huella de memoria es muy reducida en comparación con modelos de lenguaje.
- GPU recomendadas: no disponible en la información proporcionada; al ser un modelo ONNX de robótica, la inferencia puede ejecutarse en CPU o en GPU de gama baja, aunque no se documentan requisitos concretos.
- ¿Cabe en GPU de consumo? No se especifica, pero por el tamaño del repositorio (0,1 GB) es razonable esperar que sí; el autor no publica cifras de VRAM.
- Opciones de despliegue: ONNX Runtime para `policy.onnx`; PyTorch para `checkpoint.pt`; el playground oficial usa `uv` y `scripts/infer_policy.py` con el flag `--new-cmd-obs`.
- Latencia y throughput: no disponibles; solo se conoce la frecuencia de control de 50 Hz, que fija el presupuesto temporal de 20 ms por paso de control.
- Entorno de simulación: mjlab, con el repositorio `Vottivott/microduck-playground` en el commit `828d950`.

## Comparativa con modelos similares

No se dispone de información sobre políticas comparables de otros autores para el mismo robot MicroDuck ni de métricas homogéneas frente a otras políticas de locomoción. Dentro del propio repositorio, la comparación relevante es entre versiones:

| Versión | Iteración | Velocidad nominal | Nota |
|---|---:|---:|---|
| Política de velocidad (padre) | 11.748 | 1,687 m/s | Frontera de velocidad usada para iniciar la robustificación |
| Candidato robusto por defecto | 12.195 | 1,651 m/s | Recomendado; robustificación con coste del 2,1% de velocidad |
| Política legacy del vídeo de la alfombra | 8.749 | no disponible | Controlador exacto usado en la edición del vídeo run-into-mat |

## Limitaciones y advertencias

- Estado de simulación únicamente: el autor indica explícitamente que es un candidato de hardware no validado en hardware real; no debe asumirse transferencia directa.
- Deriva de rumbo y lateral sustanciales: la política mantiene la velocidad forward pero no corrige bien la orientación ni el desplazamiento lateral.
- Comandos laterales y de guiñada prácticamente no entrenados (±0,02 m/s y ±0,05 rad/s), por lo que usarlos fuera de cero produce comportamiento no fiable.
- Sin percepción de obstáculos: el vídeo run-into-mat usa la iteración 8.749 y elementos guionizados (obstáculo, colisión, corte de motor, chispas); la política no aprendió a reaccionar ante una alfombra.
- El comando de velocidad no es un limitador duro: el objetivo de progreso puede hacer que el robot supere el valor comandado.
- Riesgo de sobreajuste al modelo de simulación: se entrenó con el modelo ordinario y se evaluó con backlash sin reentrenar; una continuación específica para backlash fue peor.
- Los checkpoints PyTorch usan pickle internamente; deben cargarse solo desde repositorios y revisiones de confianza.
- Licencia Apache 2.0 permite uso comercial, pero la falta de validación en hardware y las limitaciones de robustez hacen desaconsejable su despliegue en producción sin evaluación propia.
- Sin información sobre sesgos (no aplica en el sentido de modelos de lenguaje), pero sí sobre fragilidad ante condiciones no vistas en entrenamiento (alta fricción reduce la supervivencia al 96,68%).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HannesVonEssen/microduck-running
- Pesos ONNX: https://huggingface.co/HannesVonEssen/microduck-running/blob/main/policy.onnx
- Checkpoint PyTorch: https://huggingface.co/HannesVonEssen/microduck-running/blob/main/checkpoint.pt
- Vídeo de rollout nominal: https://huggingface.co/HannesVonEssen/microduck-running/blob/main/media/preview.mp4
- Vídeo run-into-mat (iteración legacy 8.749): https://huggingface.co/HannesVonEssen/microduck-running/blob/main/media/run-into-mat.mp4
- Paridad checkpoint-ONNX: https://huggingface.co/HannesVonEssen/microduck-running/blob/main/eval/checkpoint-onnx-parity.json
- Directorio de evaluación: https://huggingface.co/HannesVonEssen/microduck-running/tree/main/eval
- Repositorio playground: https://github.com/Vottivott/microduck-playground
- Commit del playground usado: https://github.com/Vottivott/microduck-playground/commit/828d950134e29a8d04cbb51720a22c8729047fb7
