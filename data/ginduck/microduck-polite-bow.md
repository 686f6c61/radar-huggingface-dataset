# GinDuck/microduck-polite-bow

## Resumen

`GinDuck/microduck-polite-bow` es una política de control (policy) entrenada para el robot cuadrúpedo Microduck de Pollen Robotics. No es un modelo de lenguaje: es una red neuronal exportada en formato ONNX que genera comandos motores para ejecutar una reverencia ("polite bow"): el robot se inclina desde una postura de dos patas, mantiene la inclinación medio segundo y vuelve a erguirse, entregando el control a la red de equilibrio oficial antes de que termine el ciclo.

El modelo se distribuye como un artefacto de comportamiento episódico (`kind:episodic`) que ocupa el slot `ground_pick` del software `robotctl`, sustituyendo temporalmente la política original de esa ranura. Está diseñado específicamente para el ciclo de 4,0 s del conjunto oficial, con entrega de control en la fase 0,7 (es decir, a los 2,8 s), de modo que la red de stand `alpha_stand.onnx` recibe un robot ya estabilizado.

Es relevante como ejemplo de política de movimiento expresivo entrenada con aprendizaje por refuerzo sobre un robot de bajo coste, y como muestra del ecosistema de políticas comunitarias que se acoplan a un stack de control existente. El autor es GinDuck, con apoyo de iMundo, y el modelo no es una política oficial de Pollen Robotics. El repositorio tiene un tamaño declarado de 0,0 GB, lo que sugiere un artefacto de pesos muy pequeño (red de política compacta), aunque el tamaño exacto no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de política neuronal para control motor, exportada en ONNX (arquitectura interna no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control episódica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (formato ONNX, sin variantes de cuantización publicadas) |
| Idiomas soportados | no aplica (no genera texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La política se entrenó con aprendizaje por refuerzo sobre la rama `expressive-motions` del repositorio `pollen-robotics/microduck_rl`, con una definición de movimiento `BOW_R2` que especifica componentes de pitch del tronco (0,18 rad), desplazamiento vertical `dz` (-0,006), pitch de cuello (-0,30 rad) y pitch de cabeza (0,40 rad), con ventanas temporales concretas (0,15 a 0,95 s de bajada, 0,95 a 1,45 s de mantenimiento, 1,45 a 2,35 s de subida) y `settle_from=0.62`. El checkpoint publicado es el 1750 de la ejecución `bow-2`, tras 3000 iteraciones con 4096 "ducks" (entornos paralelos de simulación).

La validación se hizo íntegramente en simulación con física aleatorizada: cada duck ejecuta la reverencia durante 2,8 s, se le entrega a `alpha_stand.onnx` y se observa hasta los 8 s. Sin empujones, 256 ducks, 0 caídas, inclinación máxima de 7,4° tras la entrega y deslizamiento de pata de hasta 1,7 mm (95 % de los ducks). Con empujones, 96 ducks, 2 caídas, inclinación máxima de 9,1° en los que se mantuvieron de pie y deslizamiento de pata de hasta 35,0 mm. La pose mantenida se midió frente al objetivo: tronco 10,3°/10,3°, cuello -17,2°/-14,8°, barbilla 22,9°/22,8°.

## Capacidades

- Ejecución de una reverencia episódica completa: bajada, mantenimiento de medio segundo y subida, con temporización fija alineada al ciclo de 4,0 s del stack oficial.
- Entrega controlada del control a la red de stand (`alpha_stand.onnx`) en la fase 0,7 del ciclo, dejando al robot estable antes de la transferencia.
- Integración con el sistema `robotctl` mediante carga en el slot `ground_pick` y activación con `robotctl robot do ground_pick`.
- Restauración de la política original del slot mediante `sudo robotctl policy reset ground_pick`.
- Funcionamiento exclusivo en modo de marcha (walking mode).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es una política de control motor.

## Casos de uso

- Demostraciones de robot social: usar la reverencia como gesto de cortesía al inicio o al cierre de una interacción con personas, aprovechando que el robot queda estable al entregar el control a la red de stand.
- Vídeos y material de marketing del Microduck: el movimiento tiene una coreografía definida y medible (bajada, pausa, subida) que facilita la grabación reproducible de tomas.
- Pruebas de integración del stack `robotctl`: sirve como política de ejemplo para validar la carga, activación y reset de slots `ground_pick` en pipelines de desarrollo.
- Investigación en aprendizaje por refuerzo para robótica de bajo coste: el movimiento `BOW_R2` y la configuración de entrenamiento documentada permiten reproducir el experimento y comparar variantes.
- Validación de transferencia sim-to-real: al estar probado solo en simulación, es un caso práctico para medir cuánto degrada el comportamiento al pasar al robot físico con física real.
- Educación y talleres: como ejemplo didáctico de cómo se define un movimiento compuesto (`Comp` de pitch, `dz`, `neck_pitch`, `head_pitch`) y se entrena una política que lo ejecute.
- Benchmark interno de estabilidad: comparar la tasa de caídas de esta política frente a la red de stand sola en pruebas con empujones.

## Benchmarks y rendimiento

Resultados de validación en simulación publicados en la model card:

| Condicion | Ducks | Caidas | Inclinacion maxima tras entrega | Deslizamiento de pata (95 % de ducks) |
|---|---|---|---|---|
| Sin empujones | 256 | 0 | 7,4° | 1,7 mm |
| Con empujones | 96 | 2 | 9,1° (ducks que se mantuvieron de pie) | 35,0 mm |

| Pose mantenida | Objetivo | Medido |
|---|---|---|
| Tronco | 10,3° | 10,3° |
| Cuello | -17,2° | -14,8° |
| Barbilla | 22,9° | 22,8° |

Las dos caídas con empujones ocurrieron 1,2 s y 2,4 s después de la entrega de control. El autor indica que la red de stand sola cayó una vez en 96 ducks en una prueba similar, por lo que la muestra es demasiado pequeña para separar estadísticamente ambas políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,0 GB, lo que sugiere un artefacto ONNX de tamaño reducido apto para ejecución en CPU.
- GPU recomendadas: no disponibles; al ser una política de control en ONNX, lo habitual es ejecutarla en la CPU del propio robot o en un equipo embebido.
- Compatibilidad con GPU de consumo: previsiblemente sí (RTX 4090 y similares no son necesarias), pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: el stack `robotctl` de Microduck, que carga la política en el slot `ground_pick`; el runtime ONNX concreto no está especificado en la información disponible.
- Latencia y throughput: no disponibles; la temporización relevante es la del ciclo de 4,0 s con entrega en fase 0,7, no una métrica de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GinDuck/microduck-polite-bow | Política de control ONNX (episódica) | no disponible | no aplica | Apache 2.0 | Hugging Face |
| pollen-robotics `alpha_stand.onnx` | Política de control ONNX (equilibrio) | no disponible | no aplica | no disponible en la información proporcionada | Stack oficial Microduck |
| Política original del slot `ground_pick` | Política de control ONNX | no disponible | no aplica | no disponible en la información proporcionada | Stack oficial Microduck |

No se dispone de datos de benchmarks ni de especificaciones de parámetros de las alternativas como para establecer una comparación cuantitativa; la comparación se limita al rol funcional dentro del stack de control.

## Limitaciones y advertencias

- Probado únicamente en simulación: no se ha ejecutado en un Microduck físico, según declara el propio autor.
- La temporización se leyó del código fuente de `pollen-robotics/microduck` en el commit `b2b0d21` (2026-10-30); otra versión del software del robot puede comportarse de forma distinta.
- Solo funciona en modo de marcha y ocupa el slot `ground_pick`, sustituyendo la política original hasta que se ejecute un reset.
- La muestra de pruebas con empujones (96 ducks, 2 caídas) es demasiado pequeña para separar su estabilidad de la red de stand sola.
- El deslizamiento de pata con empujones llega a 35,0 mm en el 95 % de los ducks, muy superior a los 1,7 mm sin empujones, lo que indica degradación del agarre bajo perturbaciones.
- La pose de cuello medida (-14,8°) no alcanza exactamente el objetivo (-17,2°), un error de seguimiento de aproximadamente 2,4°.
- Licencia Apache 2.0 para la red y el código de entrenamiento; el vídeo de previsualización usa el modelo 3D del Microduck bajo CC BY-NC-SA 4.0 y es una adaptación bajo la misma licencia, por lo que su uso comercial está restringido.
- No es una política oficial de Pollen Robotics; el soporte y la garantía de compatibilidad futura no están asegurados.
- Recomendación del autor: probar en el suelo, con espacio alrededor y con una mano cerca del robot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-polite-bow
- Repositorio del robot: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: https://github.com/pollen-robotics/microduck_rl
- Licencia CC BY-NC-SA 4.0 del modelo 3D: https://creativecommons.org/licenses/by-nc-sa/4.0/
- iMundo: https://imundo.ch
- Vídeo de previsualización: `media/preview.mp4` dentro del repositorio de Hugging Face
