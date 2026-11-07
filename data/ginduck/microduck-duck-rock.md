# GinDuck/microduck-duck-rock

## Resumen

duck-rock es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot bípedo Microduck, desarrollado por Pollen Robotics (la unidad de robótica de Hugging Face). El modelo no es un modelo de lenguaje: es un controlador que recibe una observación de 61 dimensiones y emite 14 acciones a 50 Hz, ejecutando una coreografía de baile (rock con headbanging y acrobacias de invitados) de forma perpetua hasta que se le indique lo contrario. Se publica como un fichero ONNX con el normalizador de observaciones integrado, listo para cargarse en una ranura de políticas del demonio `robotctl`.

El modelo se entrenó con el framework `mjlab` sobre el entorno `Mjlab-GotATalent-MicroDuck` del repositorio `microduck-challenges`, con 4096 entornos paralelos y 3000 iteraciones máximas, partiendo del checkpoint 2750 de la semilla 1. La relevancia actual radica en que forma parte del ecosistema emergente de Microduck, un robot bípedo de 25 cm y 15 motores que Hugging Face comercializa por 399-499 dólares y que se presentó en el GTC de NVIDIA en Berlín.

La información publicada es muy escasa: el repositorio ocupa 0,0 GB, no declara licencia ni idiomas, y no incluye benchmarks ni métricas de recompensa. Esta ficha refleja exclusivamente lo disponible en la model card y en las fuentes web consultadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL exportada a ONNX) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (se distribuye en ONNX) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |

## Arquitectura y entrenamiento

No se detalla la arquitectura de red de la política en la información disponible. Se sabe que es una política de aprendizaje por refuerzo entrenada con `mjlab` (versión base `mjlab-microduck 0.1.0 @ 1efd853be`) sobre el entorno `Mjlab-GotATalent-MicroDuck`, del repositorio `pollen-robotics/microduck-challenges` (rama `main`, commit `dc73b9237`). La interfaz es explícita: 61 dimensiones de observación como entrada, 14 acciones como salida, a una frecuencia de control de 50 Hz. El normalizador de observaciones está integrado en el propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo.

El entrenamiento se ejecutó con 4096 entornos paralelos, un máximo de 3000 iteraciones, semilla 1 y registro en TensorBoard (nombre de ejecución `run-1031-1415`), comenzando el 31 de octubre de 2026. El autor advierte que el proceso no es bit-reproducible entre máquinas: repetir el comando con el mismo `uv.lock` y la misma semilla produce una política comparable, no idéntica. No se especifican el algoritmo de RL, la función de recompensa ni el número total de pasos de entrenamiento.

## Capacidades

- Control motriz bípedo del Microduck: genera comandos de articulación a 50 Hz a partir de observaciones de 61 dimensiones.
- Ejecución de una coreografía de baile rock con headbanging del cantante y acrobacias (volteretas laterales, rollos hacia atrás y un giro de cabeza) sincronizadas con el ritmo.
- Comportamiento perpetuo: la política se ejecuta de forma continua hasta que se le indique lo contrario, sin condición de terminación propia.
- Integración con el demonio `robotctl` mediante ranuras de política (`policy load <slot>`).
- Normalización de observaciones integrada en el ONNX, lo que simplifica la integración en el robot.
- No dispone de tool calling, function calling, capacidades de agente, multilingüismo, visión, audio ni modo de razonamiento: es exclusivamente un controlador motor.

## Casos de uso

- Demostración de robótica de entretenimiento: cargar la política en una ranura del Microduck y reproducir el número de baile en ferias, aulas o vídeos de producto, aprovechando que la política es perpetua y no requiere supervisión.
- Prueba de integración del stack `robotctl`: usar `duck-rock` como política de referencia para validar el flujo `policy load`, el manifiesto de esquema 2 y la alimentación de observaciones en crudo con el normalizador integrado.
- Benchmark de robustez del hardware: someter al robot a una secuencia de movimientos dinámicos y repetitivos (headbanging, volteretas) para medir desgaste de servos, estabilidad y consumo.
- Base para fine-tuning o currículo de RL: partir de esta política como inicialización en el entorno `Mjlab-GotATalent-MicroDuck` para entrenar variantes de baile o transiciones, reutilizando el mismo pipeline de `microduck-challenges`.
- Docencia en aprendizaje por refuerzo: ilustrar un caso completo de entrenamiento con 4096 entornos paralelos, semilla fija y registro en TensorBoard, con comando de reproducción documentado.
- Investigación en control bípedo de bajo coste: estudiar el comportamiento de una política entrenada en simulación sobre un robot de 25 cm y 15 motores, comparando la transferencia sim-a-real con otras políticas del ecosistema Microduck.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye recompensa media, tasa de éxito, métricas de seguimiento de trayectoria ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB y el modelo se ejecuta como política ONNX en el propio robot o en un host conectado.
- GPU recomendadas: no disponibles para inferencia. Para reentrenar, el comando del autor usa 4096 entornos paralelos, lo que implica una GPU de datacenter; no se especifica el modelo concreto.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: `robotctl policy load <slot> GinDuck/microduck-duck-rock` sobre el demonio de Microduck; el artefacto es un `policy.onnx` con normalizador integrado y un `manifest.json` conforme al esquema 2.
- Latencia y throughput: la política opera a 50 Hz (periodo de 20 ms por paso de control); no se publican latencias medidas ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GinDuck/microduck-duck-rock | Política RL para Microduck (baile) | 61-D / 14 acciones | 50 Hz | no disponible | Hugging Face |
| Otras políticas del ecosistema microduck-challenges | Políticas RL para Microduck | no disponible | no disponible | no disponible | Repositorio `pollen-robotics/microduck-challenges` |
| Políticas de locomoción bípeda genéricas | Controladores RL | variable | variable | variable | no disponible |

No se dispone de datos de rendimiento de alternativas comparables en la información proporcionada; la comparación se limita a la naturaleza del artefacto y su canal de distribución.

## Limitaciones y advertencias

- Modelo card extremadamente escasa: sin licencia declarada, sin idiomas, sin arquitectura de red ni métricas de entrenamiento publicadas.
- Ausencia total de benchmarks: no hay evidencia publicada de robustez, tasa de caídas o calidad del baile más allá de la descripción cualitativa del autor.
- No reproducibilidad bit a bit: el propio autor advierte que reentrenar con la misma semilla produce pesos distintos; no debe tratarse como artefacto determinista.
- Especialización estrecha: la política está entrenada para una coreografía concreta y no se documenta su comportamiento ante perturbaciones, terrain variado u observaciones fuera de distribución.
- Dependencia del hardware Microduck: la interfaz de 61 observaciones y 14 acciones está acoplada a ese robot; no es reutilizable directamente en otras plataformas.
- Riesgo para producción: sin licencia explícita, el uso comercial queda en un limbo legal que conviene aclarar con el autor antes de integrarlo en productos.
- Sin información sobre sesgos, alucinación o seguridad física: al ser un controlador motor, el riesgo relevante es de daño mecánico o caída del robot, no de contenido generado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-duck-rock
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas (`docs/policy-manifest.md` en el repo del demonio): no disponible como URL directa en la información proporcionada
- Preorders y ficha del robot Microduck: https://microducks.org/
- Noticia sobre preorders del Microduck: https://aiweekly.co/alerts/hugging-face-opens-pre-orders-for-399-microduck-rl-biped
