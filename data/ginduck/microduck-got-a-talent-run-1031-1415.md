# GinDuck/microduck-got-a-talent-run-1031-1415

## Resumen

`microduck-got-a-talent-run-1031-1415` es una política de control robótico entrenada por el usuario GinDuck para el robot MicroDuck de Pollen Robotics, presentada como entrada a la competición "MicroDuck Got a Talent" alojada en Hugging Face Spaces. No es un modelo de lenguaje: es una red neuronal de refuerzo (reinforcement learning) exportada a ONNX que se ejecuta como política perpetua a 50 Hz sobre el robot, con una observación de 61 dimensiones y 14 acciones de salida. El repositorio ocupa 0,0 GB, lo que indica un artefacto de pesos muy pequeño, coherente con una política de control compacta.

El modelo resuelve una tarea concreta: mantener al MicroDuck de pie, permitirle sentarse y seguir comandos de cabeza (pitch de cuello, pitch, yaw y roll de cabeza en radianes). La demostración de talento que aparece en el vídeo de previsualización (tres patos bailando y haciendo una reverencia durante 20 segundos) no está codificada en la red: proviene de un fichero `timeline.json` que la Arena reproduce y que, según el autor, el software del robot no ejecuta. Es, por tanto, una política de locomoción/pose básica, no un comportamiento artístico autónomo.

La relevancia es acotada pero clara para quien trabaja con robótica de bajo coste y simulación a realidad: sirve como ejemplo reproducible de un pipeline de entrenamiento con `mjlab` (entorno de RL sobre MuJoCo), 4096 entornos paralelos, 3000 iteraciones y exportación a ONNX con normalizador de observaciones integrado. El modelo solo se ha validado en simulación y nunca se ha ejecutado en un pato físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control robótico (reinforcement learning), exportada a ONNX; topología interna no disponible |
| Parametros totales | no disponible (repo de 0,0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; se distribuye como `policy.onnx` con normalizador de observaciones integrado |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible en los metadatos; el modelo 3D del MicroDuck usado en el vídeo es CC BY-NC-SA 4.0 de Pollen Robotics |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` conforme al esquema 2 del manifiesto de políticas microduck |

## Arquitectura y entrenamiento

La política se entrena con `mjlab-microduck` 0.1.0 (commit `1efd853be`), un entorno de aprendizaje por refuerzo construido sobre MuJoCo, usando el repositorio `pollen-robotics/microduck-challenges` (rama `main`, commit `dc73b9237`). La tarea se identifica como `Mjlab-GotATalent-MicroDuck`. El entrenamiento se lanzó el 2026-10-31T13:18:19Z con seed 1, 4096 entornos en paralelo, un máximo de 3000 iteraciones y registro en TensorBoard, con nombre de ejecución `run-1031-1415`; el checkpoint final es el 2750. El autor advierte que el entrenamiento no es bit-reproducible entre máquinas, por lo que repetir el comando con el mismo `uv.lock` y la misma seed produce una política comparable, no idéntica.

La política opera como controlador perpetuo a 50 Hz: recibe una observación de 61 dimensiones y emite 14 acciones. El normalizador de observaciones está embebido en `policy.onnx`, de modo que se le deben pasar observaciones en crudo. La semántica de las acciones es peculiar: el eje `vx` del twist funciona como bandera de sentarse (1 = sentado, 0 = de pie) y no produce marcha; los slots de cabeza corresponden a pitch de cuello, pitch de cabeza, yaw de cabeza y roll de cabeza, expresados en radianes respecto a la pose por defecto. No se documenta en la información disponible la topología de capas, el número de parámetros ni el algoritmo de RL empleado (PPO u otro).

## Capacidades

- Control de postura del MicroDuck: mantener la estación de pie y ejecutar la transición a sentado mediante la señal `vx`.
- Seguimiento de comandos de cabeza en cuatro grados de libertad (pitch de cuello, pitch, yaw y roll de cabeza) en radianes.
- Ejecución como política reactiva a 50 Hz con observación de 61 dimensiones y 14 acciones.
- Integración con el daemon del robot mediante `robotctl policy load <slot>` y reinicio con `robotctl policy reset <slot>`.
- Exportación ONNX autónoma con normalización de observaciones incluida, lo que simplifica el despliegue en el robot.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.
- No camina: el autor indica explícitamente que la política no implementa marcha.

## Casos de uso

- Investigación en RL para robótica de bajo coste: sirve como referencia reproducible de un pipeline completo (entorno `mjlab`, 4096 entornos, exportación ONNX) para estudiar cómo se comporta una política entrenada en simulación al transferirla a un robot pequeño.
- Pruebas de integración del daemon `robotctl`: permite validar el flujo de carga de políticas en slots, el reinicio de slots y la lectura del `manifest.json` conforme al esquema 2, sin necesidad de entrenar una política propia.
- Docencia en simulación a realidad: el modelo es útil para mostrar las diferencias entre el comportamiento observado en el vídeo (coreografiado por `timeline.json`) y el comportamiento real de la red (postura y cabeza), un caso claro de separación entre animación y política.
- Control de pose en demos de laboratorio: para demostraciones donde solo se necesita que el pato se siente, se levante y mueva la cabeza siguiendo comandos, la política cubre ese subconjunto sin cargar lógica adicional.
- Base para comparación de políticas: al ser un artefacto pequeño y con comando de reproducción documentado, sirve como línea base contra la que medir políticas propias en la misma tarea `Mjlab-GotATalent-MicroDuck`.
- Validación de exportación ONNX en robótica: el modelo ejemplifica cómo embeber el normalizador en el grafo ONNX para alimentar observaciones en crudo, patrón reutilizable en otros despliegues de políticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, tasas de éxito, error de seguimiento de comandos ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (0,0 GB) sugiere una política muy pequeña que probablemente se ejecuta en CPU, pero no se documenta.
- GPU recomendadas: no disponible. El entrenamiento se realizó con 4096 entornos paralelos, lo que implica una GPU de datacenter, pero no se especifica el modelo.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el robot MicroDuck mediante el daemon y `robotctl policy load <slot>`; el artefacto es ONNX, por lo que es desplegable con cualquier runtime ONNX Runtime, aunque no se documenta esta vía.
- Latencia y throughput: la política está diseñada para ejecutarse a 50 Hz (periodo de 20 ms); no se publican mediciones de latencia real ni de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GinDuck/microduck-got-a-talent-run-1031-1415 | Política RL robótica (ONNX) | no disponible | no aplica | solo simulación, sin métricas publicadas | no disponible | Hugging Face, 8 descargas |
| Otras entradas de MicroDuck Got a Talent | Políticas RL robótica | no disponible | no aplica | no disponible | variable | Hugging Face Spaces de la competición |
| Políticas de referencia de `microduck-challenges` | Políticas RL robótica | no disponible | no aplica | no disponible | según repositorio | GitHub de Pollen Robotics |

No se dispone de datos cuantitativos de modelos comparables en la información proporcionada; la comparación se limita a la categoría y al canal de distribución.

## Limitaciones y advertencias

- Solo se ha ejecutado en simulación; nunca en un pato físico. El propio autor lo declara como entrada de competición, no como truco terminado.
- El espectáculo del vídeo no lo genera la red: proviene de `timeline.json`, que la Arena reproduce y que, según el autor, el software del robot no ejecuta.
- La política no camina; el eje `vx` es una bandera de sentarse, por lo que cargarla en el slot `walk` haría que empujar el stick hacia delante significase "sentarse". El autor desaconseja ese uso y, si se prueba, indica hacerlo en el suelo y bajo responsabilidad del usuario.
- Riesgo de comportamiento no verificado fuera de simulación: no hay datos de robustez ante perturbaciones, terreno irregular o desgaste del hardware real.
- Licencia del modelo no disponible en los metadatos, lo que impide confirmar condiciones de uso comercial. El modelo 3D del MicroDuck mostrado en el vídeo es CC BY-NC-SA 4.0, con restricciones de uso no comercial.
- Idiomas no aplicables; el modelo no procesa lenguaje y no debe evaluarse con criterios de modelos generativos.
- No es una política oficial de Pollen Robotics.
- El entrenamiento no es bit-reproducible: los pesos no pueden regenerarse de forma idéntica en otra máquina.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-got-a-talent-run-1031-1415
- Arena de la competición: https://pollen-robotics-microduck-arena.hf.space/
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Licencia CC BY-NC-SA 4.0 (modelo 3D del MicroDuck en el vídeo): https://creativecommons.org/licenses/by-nc-sa/4.0/
